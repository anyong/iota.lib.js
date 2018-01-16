import { Transaction } from '../utils/types'

import add from './add'
import Converter from './Converter'
import Curl from './Curl'
import Kerl from './Kerl'

export default class Bundle {
    public bundle: Array<Partial<Transaction>>

    constructor() {
        this.bundle = []
    }

    public addEntry(signatureMessageLength: number, address: string, value: number, tag: string, timestamp: number) {
        for (let i = 0; i < signatureMessageLength; i++) {
            const transactionObject = {
                address,
                value: i === 0 ? value : 0,
                obsoleteTag: tag,
                tag,
                timestamp,
            }

            this.bundle[this.bundle.length] = transactionObject
        }
    }

    public addTrytes(signatureFragments: string[]) {
        let emptySignatureFragment = ''
        const emptyHash = '9'.repeat(81)
        const emptyTag = '9'.repeat(27)
        const emptyTimestamp = 0

        for (let j = 0; emptySignatureFragment.length < 2187; j++) {
            emptySignatureFragment += '9'
        }

        for (let i = 0; i < this.bundle.length; i++) {
            // Fill empty signatureMessageFragment
            this.bundle[i].signatureMessageFragment = signatureFragments[i]
                ? signatureFragments[i]
                : emptySignatureFragment

            // Fill empty trunkTransaction
            this.bundle[i].trunkTransaction = emptyHash

            // Fill empty branchTransaction
            this.bundle[i].branchTransaction = emptyHash

            this.bundle[i].attachmentTimestamp = emptyTimestamp
            this.bundle[i].attachmentTimestampLowerBound = emptyTimestamp
            this.bundle[i].attachmentTimestampUpperBound = emptyTimestamp
            // Fill empty nonce
            this.bundle[i].nonce = emptyTag
        }
    }

    public finalize() {
        let validBundle = false

        while (!validBundle) {
            const kerl = new Kerl()
            kerl.initialize()

            for (let i = 0; i < this.bundle.length; i++) {
                const valueTrits = Converter.trits(this.bundle[i].value!)
                while (valueTrits.length < 81) {
                    valueTrits[valueTrits.length] = 0
                }

                const timestampTrits = Converter.trits(this.bundle[i].timestamp!)
                while (timestampTrits.length < 27) {
                    timestampTrits[timestampTrits.length] = 0
                }

                const currentIndexTrits = Converter.trits((this.bundle[i].currentIndex = i))
                while (currentIndexTrits.length < 27) {
                    currentIndexTrits[currentIndexTrits.length] = 0
                }

                const lastIndexTrits = Converter.trits((this.bundle[i].lastIndex = this.bundle.length - 1))
                while (lastIndexTrits.length < 27) {
                    lastIndexTrits[lastIndexTrits.length] = 0
                }

                const bundleEssence = Converter.trits(
                    this.bundle[i].address +
                        Converter.trytes(valueTrits) +
                        this.bundle[i].obsoleteTag +
                        Converter.trytes(timestampTrits) +
                        Converter.trytes(currentIndexTrits) +
                        Converter.trytes(lastIndexTrits)
                )
                kerl.absorb(bundleEssence, 0, bundleEssence.length)
            }

            const trits: number[] = []
            kerl.squeeze(trits, 0, Curl.HASH_LENGTH)
            const hash = Converter.trytes(trits)

            for (const tx of this.bundle) {
                tx.bundle = hash
            }

            const normalizedHash = this.normalizedBundle(hash)

            if (normalizedHash.indexOf(13 /* = M */) !== -1) {
                // Insecure bundle. Increment Tag and recompute bundle hash.
                const increasedTag = add(Converter.trits(this.bundle[0].obsoleteTag!), [1])

                this.bundle[0].obsoleteTag = Converter.trytes(increasedTag)
            } else {
                validBundle = true
            }
        }
    }

    public normalizedBundle(bundleHash: string) {
        const normalizedBundle: number[] = []

        for (let i = 0; i < 3; i++) {
            let sum = 0
            for (let j = 0; j < 27; j++) {
                sum += normalizedBundle[i * 27 + j] = Converter.value(Converter.trits(bundleHash.charAt(i * 27 + j)))
            }

            if (sum >= 0) {
                while (sum-- > 0) {
                    for (let j = 0; j < 27; j++) {
                        if (normalizedBundle[i * 27 + j] > -13) {
                            normalizedBundle[i * 27 + j]--
                            break
                        }
                    }
                }
            } else {
                while (sum++ < 0) {
                    for (let j = 0; j < 27; j++) {
                        if (normalizedBundle[i * 27 + j] < 13) {
                            normalizedBundle[i * 27 + j]++
                            break
                        }
                    }
                }
            }
        }

        return normalizedBundle
    }
}

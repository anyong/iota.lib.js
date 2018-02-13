import errors from '../../errors'

import { generateAddress } from '../../crypto'
import { isTrytes } from '../../utils'

import { API, Callback, GetBalancesResponse, GetNewAddressOptions, Input } from '../types'

export interface GetInputsOptions {
    start?: number,
    end?: number
    threshold?: number,
    security?: number
}

export interface Inputs {
    inputs: Input[],
    totalBalance: number
}

/**
 *   Gets the inputs of a seed
 *
 *   @method getInputs
 *   @param {string} seed
 *   @param {object} options
 *   @param {int} [options.start=0] Starting key index
 *   @param {int} [options.end] Ending key index
 *   @param {int} [options.threshold] Min balance required
 *   @param {int} [options.security=2] secuirty level of private key / seed
 *   @param {function} callback
 **/
export default function getInputs(
    this: API,
    seed: string,
    {
      start = 0,
      end = null,
      threshold = null,
      security = 2
    }: GetInputsOptions = {},
    callback?: Callback<Inputs>
): Promise<Inputs> {

    const promise: Promise<Inputs> = new Promise((resolve, reject) => {
        if (!isTrytes(seed)) {
            return reject(errors.INVALID_SEED)
        }

        // If start value bigger than end, return error
        // or if difference between end and start is bigger than 500 key indexes
        if (end && (start > end! || end! > start + 500)) {
          return reject(errors.INVALID_INPUTS)
        }

        // 1. Generate addresses 
        ((start && end)
            // If `end` option was provided, generate addresses from `start` to `end` 
            ? Promise.resolve(
                Array(end - start)
                    .fill(null)
                    .map((a: string, i: number) => generateAddress(seed, start + i, security, false))
            )
            // If no `end` options, generate addresses `getNewAddress()` and `returnAll: true`
            : this.getNewAddress(seed, {
                index: start,
                security,
                returnAll: true,
                checksum: false
            })
        )

            // 2. Get balances of all addresses
            .then((addresses: string[] | string) => this.getBalances(addresses as string[], 100)

                // Parse balances to ints
                .then((balances: GetBalancesResponse) => (balances.balances as string[])
                    .map(balance => parseInt(balance, 10))
                )

                // 3. Calculate total balance and format inputs array
                .then(balances => {
                    const totalBalance = balances
                        .reduce((acc: number, balance: number) => acc + balance, 0) 

                    // If threshold was given, check if there is enough balance
                    if (threshold && totalBalance < threshold) {
                        return reject(errors.INSUFFICIENT_BALANCE)
                    }

                    resolve({
                        inputs: (addresses as string[])
                            .map((address: string, i: number) => ({
                                address,
                                keyIndex: start + i,
                                security,
                                balance: balances[i]
                            })),
                        totalBalance
                    })
                })
            )
    })
    
    if (typeof callback === 'function') {
        promise.then(callback.bind(null, null), callback)
    }

    return promise
}

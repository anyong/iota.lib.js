import { Input, Transaction, Transfer } from '../api/types'

export const isArray = Array.isArray // Deprecate

export const isValue = Number.isInteger // Deprecate

/**
 *   checks if input is correct address
 *
 *   @method isAddress
 *   @param {string} address
 *   @returns {boolean}
 **/
export const isAddress = (address: string): boolean => isHash(address) // Deprecate

/**
 *   checks if input is correct trytes consisting of A-Z9
 *   optionally validate length
 *
 *   @method isTrytes
 *   @param {string} trytes
 *   @param {integer} length optional
 *   @returns {boolean}
 **/
export const isTrytes = (trytes: string, length: number = 0): boolean =>
    typeof trytes === 'string' && new RegExp(`^[9A-Z]{${length}}$`).test(trytes)

/**
 *   checks if input is correct trytes consisting of A-Z9
 *   optionally validate length
 *
 *   @method isNinesTrytes
 *   @param {string} trytes
 *   @returns {boolean}
 **/
export const isNinesTrytes = (trytes: string): boolean => // Deprecate
    typeof trytes === 'string' && /^[9]+$/.test(trytes)

/**
 *   checks if input is correct hash (81 trytes)
 *
 *   @method isHash
 *   @param {string} hash
 *   @returns {boolean}
 **/
export const isHash = (hash: string): boolean => isTrytes(hash, 81)

/**
 *   checks if input is correct hash
 *
 *   @method isTransfersArray
 *   @param {array} hash
 *   @returns {boolean}
 **/
export const isTransfersArray = (transfers: Transfer[]): boolean =>
    Array.isArray(transfers) &&
    transfers.every(tx =>
        isAddress(tx.address) &&
        Number.isInteger(tx.value) &&
        isTrytes(tx.message, 0) &&
        isTrytes(tx.tag || tx.obsoleteTag, 27))

/**
 *   checks if input is list of correct trytes
 *
 *   @method isArrayOfHashes
 *   @param {list} hashesArray
 *   @returns {boolean}
 **/
export const isArrayOfHashes = (hashes: string[]): boolean =>
    Array.isArray(hashes) &&
    hashes.every(hash => isHash(hash))

/**
 *   checks if input is list of correct trytes
 *
 *   @method isArrayOfTrytes
 *   @param {list} trytesArray
 *   @returns {boolean}
 **/
export const isArrayOfTrytes = (trytesArray: string[]): boolean =>
    Array.isArray(trytesArray) && trytesArray.every(trytes => isTrytes(trytes, 2673))

/**
 *   checks if attached trytes if last 241 trytes are non-zero
 *
 *   @method isArrayOfAttachedTrytes
 *   @param {array} trytesArray
 *   @returns {boolean}
 **/
 export const isArrayOfAttachedTrytes = (trytesArray: string[]): boolean =>
    Array.isArray(trytesArray) &&
    trytesArray.length > 0 &&
    trytesArray.every(trytes => isTrytes(trytes, 2673) && /^[9]+$/.test(trytes.slice(2673 - 3 * 81)))

/**
 *   checks if correct bundle with transaction object
 *
 *   @method isArrayOfTxObjects
 *   @param {array} bundle
 *   @returns {boolean}
 **/
export const isArrayOfTxObjects = (bundle: Transaction[]): boolean =>
    isArray(bundle) &&
    bundle.length > 0 && 
    bundle.every(tx =>
        isHash(tx.hash) &&
        isTrytes(tx.signatureMessageFragment, 2187) &&
        isHash(tx.address) &&
        Number.isInteger(tx.value) &&
        isTrytes(tx.obsoleteTag, 27) &&
        Number.isInteger(tx.timestamp) &&
        Number.isInteger(tx.currentIndex) &&
        Number.isInteger(tx.lastIndex) &&
        isHash(tx.bundle) &&
        isHash(tx.trunkTransaction) &&
        isHash(tx.branchTransaction) &&
        isTrytes(tx.tag, 27) &&
        Number.isInteger(tx.attachmentTimestamp) &&
        Number.isInteger(tx.attachmentTimestampLowerBound) &&
        Number.isInteger(tx.attachmentTimestampUpperBound) &&
        isTrytes(tx.nonce, 27))

/**
 *   checks if correct inputs list
 *
 *   @method isInputs
 *   @param {array} inputs
 *   @returns {boolean}
 **/
export const isInputs = (inputs: Input[]): boolean =>
    Array.isArray(inputs) &&
    inputs.length > 0 &&
    inputs.every(input =>
        isAddress(input.address) &&
        Number.isInteger(input.security) && input.security > 0 &&
        Number.isInteger(input.keyIndex) && input.keyIndex > -1)

/**
 *   Checks that a given uri is valid
 *
 *   Valid Examples:
 *   udp://[2001:db8:a0b:12f0::1]:14265
 *   udp://[2001:db8:a0b:12f0::1]
 *   udp://8.8.8.8:14265
 *   udp://domain.com
 *   udp://domain2.com:14265
 *
 *   @method isUri
 *   @param {string} node
 *   @returns {bool} valid
 **/
export const isUri = (uri: string): boolean => {
    const getInside = /^(udp|tcp):\/\/([\[][^\]\.]*[\]]|[^\[\]:]*)[:]{0,1}([0-9]{1,}$|$)/i

    const stripBrackets = /[\[]{0,1}([^\[\]]*)[\]]{0,1}/

    const uriTest = /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))|(^\s*((?=.{1,255}$)(?=.*[A-Za-z].*)[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?(?:\.[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?)*)\s*$)/

    return getInside.test(uri) && uriTest.test(stripBrackets.exec(getInside.exec(uri)![1])![1])
}

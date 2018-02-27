import errors from '../errors'
import * as utils from '../utils'
import { Callback, FindTransactionsQuery, Inputs, Normalized, NormalizedInputs } from './types'

export const validate = <T, V = T | boolean | void>
    (f: (x: T) => V, e: string) => 
    (x: T): Promise<V> => Promise.resolve(f(x))
        .then((y: V) => y || Promise.reject(new Error(e))) 

export const removeChecksum = (addresses: string[]) =>
    addresses.map(address => utils.noChecksum(address))

export const toArray = (x: any): any[] => Array.isArray(x) ? x : [x] 

export const keys = (obj: {[key: string]: any} | string[]) => Array.isArray(obj) ? obj : Object.keys(obj)

export const normalize = <T, V = {[key: string]: T}>(
    ids: string[],
    lift: (id: string, b: T) => Normalized<V>
) =>
    (b: T[]): Normalized<V> => ids
        .reduce((acc, id, index) => ({
            ...acc,
            ...lift(id, b[index])
        }), {})

export const isObject = (obj: object): boolean => Object.prototype.toString.call(obj) === '[object Object]'

export const merge = (a: {[x: string]: any}) =>
  (b: {[x: string]: any}): {[x: string]: any} =>
        keys(b).reduce((acc: {[x: string]: any}, x: string): object => ({
            ...acc,
            ...( isObject(b[x]) ? merge(a[x])(b[x]) : b[x] )
        }), {})

export const invokeCallback = (callback?: Callback) =>
    (res: any) => callback
        ? res.then(callback.bind(null, null), callback)
        : res

export const isInteger = (err: string = errors.NOT_INT) => validate(Number.isInteger, err)

export const isSeed = validate(utils.isTrytes, errors.INVALID_SEED)

export const isIndex = isInteger(errors.INVALID_INDEX)

export const isSecurity = isInteger(errors.INVALID_SECURITY_LEVEL)

export const isStart = isInteger(errors.INVALID_START_OPTION)

export const isStartEnd = validate(utils.isValidStartEndOptions, errors.INVALID_START_END_OPTIONS)

export const isThreshold = isInteger(errors.INVALID_THRESHOLD)

export const isAddresses = validate(utils.isAddresses, errors.INVALID_ADDRESSES)

export const isAddress = validate(utils.isAddress, errors.INVALID_ADDRESS)

export const isSufficientBalance = (threshold: number) =>
    (inputs: NormalizedInputs) => validate<NormalizedInputs>(
        ({ totalBalance }) => totalBalance >= threshold && inputs,
        errors.INSUFFICIENT_BALANCE
    )

const validKeys = ['bundles', 'addresses', 'tags', 'approvees']

export const isValidQuery = (query: FindTransactionsQuery) => validate(
    () => keys(query).some(key => validKeys.indexOf(key) === -1 || !Array.isArray(query[key])),
    errors.INVALID_SEARCH_KEYS
)

export const isArrayOfTags = (query: FindTransactionsQuery) => validate<string[]>(
    () => query.tags && query.tags.some((tag: string) => !utils.isTrytes(tag, 27)),
    errors.INVALID_TAG
)

export const isArrayOfHashes = validate(utils.isArrayOfHashes, errors.INVALID_ARRAY_OF_HASHES)


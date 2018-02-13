import errors from '../../errors'
import { isBundle, isHash } from '../../utils'

import { API, Bundle, Callback, Transaction } from '../types' 

/**
 *   Gets and validates the bundle of a given the tail transaction.
 *
 *   @method getBundle
 *   @param {string} transaction Hash of a tail transaction
 *   @returns {list} bundle Transaction objects
 **/
export default function getBundle(
    this: API,
    tailTransaction: string,
    callback?: Callback<Bundle[]>
): Promise<Bundle> {

    const promise: Promise<Bundle> = new Promise((resolve, reject) => {
        if (!isHash(tailTransaction)) {
            return reject(errors.INVALID_INPUTS)
        }

        resolve(
            this.traverseBundle(tailTransaction, null, [])
                .then((bundle: Bundle) => {
                    if (!isBundle(bundle)) {
                        return reject(errors.INVALID_BUNDLE)
                    }
                    resolve(bundle)
                })
        )
    })
   
    if (typeof callback === 'function') {
        promise.then(callback.bind(null, null), callback)
    }

    return promise
}

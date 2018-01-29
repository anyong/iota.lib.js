import errors from '../../errors'
import { isArrayOfHashes } from '../../utils/inputValidator'

import { API, BaseCommand, Callback, IRICommand } from '../types'

export interface GetTrytesCommand extends BaseCommand {
    command: IRICommand.GET_TRYTES
    hashes: string[]
}

export interface GetTrytesResponse {
    trytes: string[]
}

/**
 *   @method getTrytes
 *   @param {array} hashes
 *   @returns {function} callback
 *   @returns {object} success
 **/
export default function getTrytes (this: API, hashes: string[], callback?: Callback<string[] | void>): Promise<string[] | void> {
    const promise: Promise<string[] | void> = new Promise((resolve, reject) => {
        if (!isArrayOfHashes(hashes)) {
            reject(new Error(errors.INVALID_TRYTES))
        }

        resolve(
            this.sendCommand<GetTrytesCommand, GetTrytesResponse>(
                {
                    command: IRICommand.GET_TRYTES,
                    hashes
                }
            )
              .then(res => res.trytes)
        )
    })

    if (typeof callback === 'function') {
        promise.then(callback.bind(null, null), callback)
    }

    return promise
}

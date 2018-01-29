import errors from '../../errors'
import { isArrayOfHashes } from '../../utils'

import { API, BaseCommand, Callback, IRICommand } from '../types'

export interface CheckConsistencyCommand extends BaseCommand {
    command: IRICommand.CHECK_CONSISTENCY
    tails: string[]
}

export interface CheckConsistencyResponse {
    state: boolean
}

export default function checkConsistency (this: API, transactions: string[], callback?: Callback<boolean | void>): Promise<boolean | void> {
    const promise: Promise<boolean | void> = new Promise((resolve, reject) => {
        if (!isArrayOfHashes(transactions)) {
            return reject(new Error(errors.INVALID_TRYTES))
        }
        resolve(
            this.sendCommand<CheckConsistencyCommand, CheckConsistencyResponse>(
                {
                    command: IRICommand.CHECK_CONSISTENCY,
                    transactions
                }  
            )
              .then(res => res.state)
        )
    })

    if (typeof callback === 'function') {
      promise.then(callback.bind(null, null), callback)
    }

    return promise
}


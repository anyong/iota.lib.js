import errors from '../../errors'
import { isAddress, noChecksum } from '../../utils'

import { API, BaseCommand, Callback, IRICommand } from '../types'

export interface WereAddressesSpentFromCommand extends BaseCommand {
    command: IRICommand.CHECK_CONSISTENCY
    tails: string[]
}

export interface WereAddressesSpentFromResponse {
    states: boolean[]
}

export default function wereAddressesSpentFrom (
    this: API,
    addresses: string[] | string,
    callback?: Callback<boolean[] | void>): Promise<boolean[] | void> {
        
    const promise: Promise<boolean[] | void> = new Promise((resolve, reject) => {
        if (!Array.isArray(addresses)) {
            addresses = [addresses]
        }
        
        if (addresses.some(address => !isAddress(address))) {
            return reject(new Error(errors.INVALID_TRYTES))
        }

        addresses = addresses.map(address => noChecksum(address))

        resolve(
            this.sendCommand<WereAddressesSpentFromCommand, WereAddressesSpentFromResponse>(
                {
                    command: IRICommand.WERE_ADDRESSES_SPENT_FROM,
                    addresses 
                }  
            )
              .then(res => res.states)
        )
    })

    if (typeof callback === 'function') {
        promise.then(callback.bind(null, null), callback)
    }

    return promise
}


import errors from '../../errors'
import { isArrayOfHashes, noChecksum } from '../../utils'

import { API, BaseCommand, Callback, IRICommand } from '../types'

import { GetInclusionStatesResponse } from './getInclusionStates'

export interface GetBalancesCommand extends BaseCommand {
    command: IRICommand.GET_BALANCES
    addresses: string[]
    threshold: number
}

export interface GetBalancesResponse {
    balances: string[] | number[]
    duration?: number
    milestone: string
    milestoneIndex: number
}

/**
 *   @method getBalances
 *   @param {array} addresses
 *   @param {int} threshold
 *   @returns {function} callback
 *   @returns {object} success
 **/
export default function getBalances(
    this: API,
    addresses: string[],
    threshold: number,
    callback?: Callback<GetBalancesResponse>): Promise<GetBalancesResponse> {

    const promise: Promise<GetBalancesResponse> = new Promise((resolve, reject) => {
        // Check if correct transaction hashes
        if (!isArrayOfHashes(addresses)) {
            reject(errors.INVALID_TRYTES)
        } else {
            resolve(
                this.sendCommand<GetBalancesCommand, GetBalancesResponse>(
                    {
                        command: IRICommand.GET_BALANCES,
                        addresses: addresses.map(address => noChecksum(address)),
                        threshold,
                    }
                )/*.then(
                    res => (
                        {
                            ...res,
                            balances: res.balances.map(balance => parseInt(balance, 10))
                        }
                    )
                )*/
            )
        }
    })

    if (typeof callback === 'function') {
        promise.then(callback.bind(null, null), err => callback(err))
    }
  
    return promise
}

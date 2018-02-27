import errors from '../../errors'

import {
    Address,
    Addresses,
    Balance,
    BaseCommand, 
    Callback,
    Normalized,
    Settings,
} from '../types'

import {
    invokeCallback,
    isAddresses, 
    isThreshold,
    keys,
    normalize, 
    removeChecksum
} from '../utils'

import { sendCommand } from './sendCommand'

export interface GetBalancesCommand extends BaseCommand {
    command: string 
    addresses: string[]
    threshold: number
}

export interface GetBalancesResponse {
    balances: string[]
    duration: number
    milestone: string
    milestoneIndex: number
}

export interface NormalizedGetBalancesResponse {
    balances: Normalized<Balance>
    duration: number
    milestone: string,
    milestoneIndex: number
}

export const makeGetBalancesCommand = (
    addresses: string[],
    threshold: number
): GetBalancesCommand => ({
    command: 'getBalances',
    addresses,
    threshold
}) 

export const normalizeBalances = (addresses: string[]) => 
    normalize<string, Balance>(addresses, (address, balance) => ({
        [address]: { balance }
    }))

export const formatGetBalancesResponse = (addresses: string[], normalizeOutput: boolean = true) =>
    (res: GetBalancesResponse): GetBalancesResponse | NormalizedGetBalancesResponse =>
        normalizeOutput
            ? { ...res, balances: normalizeBalances(addresses)(res.balances) }
            : res

export const getBalances = ({
    provider,
    normalizeOutput = true 
}: Settings = {}) => (
    addresses: Addresses | string[],
    threshold: number,
    callback?: Callback<GetBalancesResponse | NormalizedGetBalancesResponse>
): Promise<GetBalancesResponse | NormalizedGetBalancesResponse> =>
    Promise.resolve(
        isAddresses(addresses) &&
        isThreshold(threshold)
    )
        .then(() => keys(addresses))
        .then(removeChecksum)
        .then((addressesArray) =>
            Promise.resolve(makeGetBalancesCommand(addressesArray, threshold))
                .then(sendCommand<GetBalancesCommand, GetBalancesResponse>(provider))
                .then(formatGetBalancesResponse(addressesArray, normalizeOutput))
                .then(invokeCallback(callback)))


export const getBalancesCurried = (settings: Settings) => (threshold: number) =>
    (addresses: Addresses) => getBalances(settings)(addresses, threshold)

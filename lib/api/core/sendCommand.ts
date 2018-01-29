import { API, BaseCommand, BatchableCommand, batchableKeys, Callback, IRICommand } from '../types'

import { defaultSettings } from '../'
import { batchedSend, send } from '../../utils/request'

const BATCH_SIZE = 1000

/**
 *   General function that makes an HTTP request to the local node
 *
 *   @method sendCommand
 *   @param {object} command
 *   @param {function} callback
 *   @returns {object} success
 **/
export default function sendCommand<C extends BaseCommand, R = void>(
    this: API,
    command: C,
    callback?: Callback): Promise<R> {

    const promise: Promise<R> = new Promise((resolve, reject) => {
        const settings = this.getSettings()
        const provider = settings.provider || defaultSettings.provider
        const token = settings.token
        const keysToBatch: string[] = getKeysToBatch<C, keyof C[]>(command, BATCH_SIZE)

        if (keysToBatch.length) {
            return resolve(batchedSend(command, { provider, token }, keysToBatch, BATCH_SIZE))
        }

        resolve(send(command, { provider, token }))
    })

    if (typeof callback === 'function') {
        promise.then(callback.bind(null, null), callback)
    }

    return promise
}

export function getKeysToBatch<C extends BaseCommand, K = keyof C[]>(command: C, batchSize: number = BATCH_SIZE) {
    if (command.command === IRICommand.FIND_TRANSACTIONS ||
        command.command === IRICommand.GET_BALANCES ||
        // command.command === IRICommand.GET_INCLUSION_STATES ||
        command.command === IRICommand.GET_TRYTES
    ) {
      return Object.keys(command)
      .filter(key => batchableKeys[command.command].indexOf(key) > -1 && command[key].length > BATCH_SIZE)
    }
    return []
}



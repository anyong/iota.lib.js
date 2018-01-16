import * as async from 'async'
import { Bundle, Converter, HMAC, Signing } from '../crypto'
import errors from '../errors/inputErrors'
import inputValidator from '../utils/inputValidator'
import Request from '../utils/makeRequest'
import Utils from '../utils/utils'

import * as apiCommands from './apiCommands'
import { BaseCommand, BatchableCommand, Callback, FindTransactionsSearchValues, IRICommand } from './types'

/**
 *  Making API requests, including generalized wrapper functions
 **/
export default class BaseAPI {
    public sandbox: boolean
    protected provider: Request

    constructor(provider: Request, isSandbox: boolean) {
        this.provider = provider
        this.sandbox = isSandbox
    }

    /**
     *   General function that makes an HTTP request to the local node
     *
     *   @method sendCommand
     *   @param {object} command
     *   @param {function} callback
     *   @returns {object} success
     **/
    public sendCommand<T extends BaseCommand>(command: T, callback: Callback) {
        const commandsToBatch = ['findTransactions', 'getBalances', 'getInclusionStates', 'getTrytes']
        const commandKeys = ['addresses', 'bundles', 'hashes', 'tags', 'transactions', 'approvees']
        const batchSize = 1000

        if (commandsToBatch.indexOf(command.command) > -1) {
            const keysToBatch = keysOf(command).filter(key => {
                return commandKeys.indexOf(key) > -1 && command[key].length > batchSize
            })

            if (keysToBatch.length) {
                return this.provider.batchedSend(command, batchSize, callback)
            }
        }

        return this.provider.send(command, callback)
    }

    /**
     *   @method attachToTangle
     *   @param {string} trunkTransaction
     *   @param {string} branchTransaction
     *   @param {integer} minWeightMagnitude
     *   @param {array} trytes
     *   @returns {function} callback
     *   @returns {object} success
     **/
    public attachToTangle(
        trunkTransaction: string,
        branchTransaction: string,
        minWeightMagnitude: number,
        trytes: string[],
        callback: Callback<string[]>
    ) {
        // inputValidator: Check if correct hash
        if (!inputValidator.isHash(trunkTransaction)) {
            return callback(errors.invalidTrunkOrBranch(trunkTransaction))
        }

        // inputValidator: Check if correct hash
        if (!inputValidator.isHash(branchTransaction)) {
            return callback(errors.invalidTrunkOrBranch(branchTransaction))
        }

        // inputValidator: Check if int
        if (!inputValidator.isValue(minWeightMagnitude)) {
            return callback(errors.notInt())
        }

        // inputValidator: Check if array of trytes
        if (!inputValidator.isArrayOfTrytes(trytes)) {
            return callback(errors.invalidTrytes())
        }

        const command = apiCommands.attachToTangle(trunkTransaction, branchTransaction, minWeightMagnitude, trytes)

        return this.sendCommand(command, callback)
    }
    /**
     *   @method findTransactions
     *   @param {object} searchValues
     *   @returns {function} callback
     *   @returns {object} success
     **/
    public findTransactions(searchValues: FindTransactionsSearchValues, callback: Callback) {
        // If not an object, return error
        if (!inputValidator.isObject(searchValues)) {
            return callback(errors.invalidKey())
        }

        // Get search key from input object
        const searchKeys = keysOf(searchValues)
        const availableKeys = ['bundles', 'addresses', 'tags', 'approvees']

        let keyError: Error | null = null

        searchKeys.forEach(key => {
            if (availableKeys.indexOf(key) === -1) {
                keyError = errors.invalidKey()
                return
            }

            if (key === 'addresses') {
                searchValues.addresses = searchValues.addresses!.map(address => Utils.noChecksum(address))
            }

            const hashes = searchValues[key] as string[]

            // If tags, append to 27 trytes
            if (key === 'tags') {
                searchValues.tags = hashes.map(hash => {
                    // Simple padding to 27 trytes
                    while (hash.length < 27) {
                        hash += '9'
                    }

                    // validate hash
                    if (!inputValidator.isTrytes(hash, '27')) {
                        keyError = errors.invalidTrytes()
                        return ''
                    }

                    return hash
                })
            } else {
                // Check if correct array of hashes
                if (!inputValidator.isArrayOfHashes(hashes)) {
                    keyError = errors.invalidTrytes()
                    return
                }
            }
        })

        // If invalid key found, return
        if (keyError) {
            callback(keyError)
            return
        }

        const command = apiCommands.findTransactions(searchValues)

        return this.sendCommand(command, callback)
    }

    /**
     *   @method getBalances
     *   @param {array} addresses
     *   @param {int} threshold
     *   @returns {function} callback
     *   @returns {object} success
     **/
    public getBalances(addresses: string[], threshold: number, callback: Callback) {
        // Check if correct transaction hashes
        if (!inputValidator.isArrayOfHashes(addresses)) {
            return callback(errors.invalidTrytes())
        }

        const command = apiCommands.getBalances(addresses.map(address => Utils.noChecksum(address)), threshold)

        return this.sendCommand(command, callback)
    }

    /**
     *   @method getInclusionStates
     *   @param {array} transactions
     *   @param {array} tips
     *   @returns {function} callback
     *   @returns {object} success
     **/
    public getInclusionStates(transactions: string[], tips: string[], callback: Callback) {
        // Check if correct transaction hashes
        if (!inputValidator.isArrayOfHashes(transactions)) {
            return callback(errors.invalidTrytes())
        }

        // Check if correct tips
        if (!inputValidator.isArrayOfHashes(tips)) {
            return callback(errors.invalidTrytes())
        }

        const command = apiCommands.getInclusionStates(transactions, tips)

        return this.sendCommand(command, callback)
    }

    /**
     *   @method getNodeInfo
     *   @returns {function} callback
     *   @returns {object} success
     **/
    public getNodeInfo(callback: Callback) {
        const command = apiCommands.getNodeInfo()

        return this.sendCommand(command, callback)
    }

    /**
     *   @method getNeighbors
     *   @returns {function} callback
     *   @returns {object} success
     **/
    public getNeighbors(callback: Callback) {
        const command = apiCommands.getNeighbors()

        return this.sendCommand(command, callback)
    }

    /**
     *   @method addNeighbors
     *   @param {Array} uris List of URI's
     *   @returns {function} callback
     *   @returns {object} success
     **/
    public addNeighbors(uris: string[], callback: Callback) {
        // Validate URIs
        for (let i = 0; i < uris.length; i++) {
            if (!inputValidator.isUri(uris[i])) {
                return callback(errors.invalidUri(uris[i]))
            }
        }

        const command = apiCommands.addNeighbors(uris)

        return this.sendCommand(command, callback)
    }

    /**
     *   @method removeNeighbors
     *   @param {Array} uris List of URI's
     *   @returns {function} callback
     *   @returns {object} success
     **/
    public removeNeighbors(uris: string[], callback: Callback) {
        // Validate URIs
        for (let i = 0; i < uris.length; i++) {
            if (!inputValidator.isUri(uris[i])) {
                return callback(errors.invalidUri(uris[i]))
            }
        }

        const command = apiCommands.removeNeighbors(uris)

        return this.sendCommand(command, callback)
    }

    /**
     *   @method getTips
     *   @returns {function} callback
     *   @returns {object} success
     **/
    public getTips(callback: Callback) {
        const command = apiCommands.getTips()

        return this.sendCommand(command, callback)
    }

    /**
     *   @method getTransactionsToApprove
     *   @param {int} depth
     *   @param {string} reference
     *   @returns {function} callback
     *   @returns {object} success
     **/
    public getTransactionsToApprove(depth: number, reference: string, callback: Callback) {
        // Check if correct depth
        if (!inputValidator.isValue(depth)) {
            return callback(errors.invalidInputs())
        }

        const command = apiCommands.getTransactionsToApprove(depth, reference)

        return this.sendCommand(command, callback)
    }

    /**
     *   @method getTrytes
     *   @param {array} hashes
     *   @returns {function} callback
     *   @returns {object} success
     **/
    public getTrytes(hashes: string[], callback: Callback<string[]>) {
        if (!inputValidator.isArrayOfHashes(hashes)) {
            return callback(errors.invalidTrytes())
        }

        const command = apiCommands.getTrytes(hashes)

        return this.sendCommand(command, callback)
    }

    /**
     *   @method interruptAttachingToTangle
     *   @returns {function} callback
     *   @returns {object} success
     **/
    public interruptAttachingToTangle(callback: Callback) {
        const command = apiCommands.interruptAttachingToTangle()

        return this.sendCommand(command, callback)
    }

    /**
     *   @method broadcastTransactions
     *   @param {array} trytes
     *   @returns {function} callback
     *   @returns {object} success
     **/
    public broadcastTransactions(trytes: string[], callback: Callback) {
        if (!inputValidator.isArrayOfAttachedTrytes(trytes)) {
            return callback(errors.invalidAttachedTrytes())
        }

        const command = apiCommands.broadcastTransactions(trytes)

        return this.sendCommand(command, callback)
    }

    /**
     *   @method storeTransactions
     *   @param {array} trytes
     *   @returns {function} callback
     *   @returns {object} success
     **/
    public storeTransactions(trytes: string[], callback: Callback) {
        if (!inputValidator.isArrayOfAttachedTrytes(trytes)) {
            return callback(errors.invalidAttachedTrytes())
        }

        const command = apiCommands.storeTransactions(trytes)

        return this.sendCommand(command, callback)
    }
}

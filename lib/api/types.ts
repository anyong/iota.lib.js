import {
    FindTransactionsCommand, FindTransactionsQuery,
    GetBalancesCommand, GetBalancesResponse,
    GetInclusionStatesCommand,
    GetNeighborsResponse,
    GetNodeInfoResponse,
    GetTransactionsToApproveResponse,
    GetTrytesCommand,
} from './core'

/**
 * Export types of public API properties
 */
export {
    FindTransactionsCommand, FindTransactionsQuery,
    GetBalancesCommand, GetBalancesResponse,
    GetInclusionStatesCommand,
    GetNeighborsResponse,
    GetNodeInfoResponse,
    GetTransactionsToApproveResponse,
    GetTrytesCommand
} from './core'

/** 
 * Input type 
 */
export interface Input {
    balance?: number
    security: number
    keyIndex: number
    address: string
}

/** 
 * Transfer object 
 */
export interface Transfer {
    address: string
    value: number
    message: string
    tag: string
    obsoleteTag: string
}

/** 
 * Transaction object 
 */
export interface Transaction {
    hash: string
    signatureMessageFragment: string
    address: string
    value: number
    obsoleteTag: string
    timestamp: number
    currentIndex: number
    lastIndex: number
    bundle: string
    trunkTransaction: string
    branchTransaction: string
    tag: string
    attachmentTimestamp: number
    attachmentTimestampLowerBound: number
    attachmentTimestampUpperBound: number
    nonce: string
}

/**
 * Neighbor object 
 */
export interface Neighbor {
    address: string,
    numberOfAllTransactions: number,
    numberOfInvalidTransactions: number,
    numberOfNewTransactions: number
}

/**
 * List of Neighbors object, returned by `getNeighbors()`
 */
export type Neighbors = Neighbor[]

/**
 * List of IRI Commands
 */
export enum IRICommand {
    GET_NODE_INFO = 'getNodeInfo',
    GET_NEIGHBORS = 'getNeighbors',
    ADD_NEIGHBORS = 'addNeighbors',
    REMOVE_NEIGHBORS = 'removeNeighbors',
    GET_TIPS = 'getTips',
    FIND_TRANSACTIONS = 'findTransactions',
    GET_TRYTES = 'getTrytes',
    GET_INCLUSION_STATES = 'getInclusionStates',
    GET_BALANCES = 'getBalances',
    GET_TRANSACTIONS_TO_APPROVE = 'getTransactionsToApprove',
    ATTACH_TO_TANGLE = 'attachToTangle',
    INTERRUPT_ATTACHING_TO_TANGLE = 'interruptAttachingToTangle',
    BROADCAST_TRANSACTIONS = 'broadcastTransactions',
    STORE_TRANSACTIONS = 'storeTransactions',
    CHECK_CONSISTENCY = 'checkConsistency',
    WERE_ADDRESSES_SPENT_FROM = 'wereAddressesSpentFrom'
}

/**
 * Known batchable commands
 */
export type BatchableCommand =
    | FindTransactionsCommand
    | GetBalancesCommand
    | GetInclusionStatesCommand
    | GetTrytesCommand

/**
 * Batchable keys for each command
 */
export const batchableKeys = {
    [IRICommand.FIND_TRANSACTIONS]: ['addresses', 'approvees', 'bundles', 'tags'] as Array<keyof FindTransactionsCommand>,
    [IRICommand.GET_BALANCES]: ['addresses'] as Array<keyof GetBalancesCommand>,
    [IRICommand.GET_INCLUSION_STATES]: ['tips', 'transactions'] as Array<keyof GetInclusionStatesCommand>,
    [IRICommand.GET_TRYTES]: ['hashes'] as Array<keyof GetTrytesCommand>,
}

/**
 * IRI Command objects extend from this interface
 */
export interface BaseCommand {
    command: IRICommand,
    [key: string]: any
}

/**
 * Connection settings object
 */
export interface Settings {
    provider: string
    token?: string // -> sandboxToken
    host?: string // deprecate
    port?: number // deprecate
    sandbox?: boolean // deprecate
}

/**
 * Callback
 */
export type Callback<R = any> = (err: Error | null, res?: R) => void

/**
 * API, Core + Extended
 */
export interface API {
    /**
     * API util methods
     */
    getSettings: () => Settings
    
    setSettings: (settings: Settings) => API

    /**
     * Core API methods
     */
    sendCommand: <C extends BaseCommand, R = any>(
        this: API,
        command: BaseCommand,
        callback?: Callback<R>
    ) => Promise<R>
          
    attachToTangle: (
        this: API,
        trunkTransaction: string,
        branchTransaction: string,
        minWeightMagnitude: number,
        trytes: string[],
        callback?: Callback<string[] | void>
    ) => Promise<string[] | void>

    findTransactions: (
        this: API,
        query: FindTransactionsQuery,
        callback?: Callback<string[]>
    ) => Promise<string[]>
      
    getBalances: (
        this: API,
        addresses: string[],
        threshold: number,
        callback?: Callback<GetBalancesResponse>
    )  => Promise<GetBalancesResponse>
        
    getInclusionStates: (
        this: API,
        transactions: string[],
        tips: string[],
        callback?: Callback<string[]>
    ) => Promise<string[]>
        
    getNodeInfo: (
        this: API,
        callback?: Callback<GetNodeInfoResponse>
    ) => Promise<GetNodeInfoResponse>
        
    getNeighbors: (
        this: API,
        callback?: Callback<GetNeighborsResponse>
    ) => Promise<Neighbor[]>
        
    addNeighbors: (
        this: API,
        callback?: Callback<number>
    ) => Promise<number>
        
    removeNeighbors: (
        this: API,
        callback?: Callback<number>
    ) => Promise<number>
        
    getTips: (
        this: API,
        callback?: Callback<string[]>
    ) => Promise<string[]>
        
    getTransactionsToApprove: (
        this: API,
        depth: number,
        reference?: string,
        callback?: Callback<GetTransactionsToApproveResponse>
    ) => Promise<GetTransactionsToApproveResponse>
        
    getTrytes: (
        this: API,
        hashes: string[],
        callback?: Callback<string[]>
    ) => Promise<string[]>
        
    interruptAttachingToTangle: (
        this: API,
        callback?: Callback<void>
    ) => Promise<void> 
        
    checkConsistency: (
        this: API,
        transactions: string | string[],
        callback?: Callback<boolean>
    ) => Promise<boolean>
        
    broadcastTransactions: (
        this: API,
        trytes: string[],
        callback?: Callback<void>
    ) => Promise<void> 
        
    storeTransactions: (
        this: API,
        trytes: string[],
        callback?: Callback<void>
    ) => Promise<void>
        
    wereAddressesSpentFrom: (
        this: API,
        addresses: string[],
        callback?: Callback<boolean[] | void>
    ) => Promise<boolean[] | void>
      
    [key: string]: any
}

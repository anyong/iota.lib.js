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
}

export interface BaseCommand {
    command: IRICommand
}

export interface AttachToTangleCommand extends BaseCommand {
    command: IRICommand.ATTACH_TO_TANGLE
    trunkTransaction: string
    branchTransaction: string
    minWeightMagnitude: number
    trytes: string[]
}

export interface FindTransactionsSearchValues {
    bundles?: string[]
    addresses?: string[]
    tags?: string[]
    approvees?: string[]
}

export type FindTransactionsSearchKeys = Array<keyof FindTransactionsSearchValues>

export const findTxValidSearchKeys: FindTransactionsSearchKeys = ['bundles', 'addresses', 'tags', 'approvees']

export interface FindTransactionsCommand extends BaseCommand, FindTransactionsSearchValues {
    command: IRICommand.FIND_TRANSACTIONS
}

export function isFindTransactions(cmd: BaseCommand): cmd is FindTransactionsCommand {
    return cmd.command === IRICommand.FIND_TRANSACTIONS
}

export interface GetBalancesCommand extends BaseCommand {
    command: IRICommand.GET_BALANCES
    addresses: string[]
    threshold: number
}

export function isGetBalances(cmd: BaseCommand): cmd is GetBalancesCommand {
    return cmd.command === IRICommand.GET_BALANCES
}

export interface GetInclusionStatesCommand extends BaseCommand {
    command: IRICommand.GET_INCLUSION_STATES
    transactions: string[]
    tips: string[]
}

export function isGetInclusionStates(cmd: BaseCommand): cmd is GetInclusionStatesCommand {
    return cmd.command === IRICommand.GET_INCLUSION_STATES
}

export interface GetNodeInfoCommand extends BaseCommand {
    command: IRICommand.GET_NODE_INFO
}

export interface GetNeighborsCommand extends BaseCommand {
    command: IRICommand.GET_NEIGHBORS
}

export interface AddNeighborsCommand extends BaseCommand {
    command: IRICommand.ADD_NEIGHBORS
    uris: string[]
}

export interface RemoveNeighborsCommand extends BaseCommand {
    command: IRICommand.REMOVE_NEIGHBORS
    uris: string[]
}

export interface GetTipsCommand extends BaseCommand {
    command: IRICommand.GET_TIPS
}

export interface GetTransactionsToApproveCommand extends BaseCommand {
    command: IRICommand.GET_TRANSACTIONS_TO_APPROVE
    depth: number
    reference?: string
}

export interface GetTrytesCommand extends BaseCommand {
    command: IRICommand.GET_TRYTES
    hashes: string[]
}

export function isGetTrytes(cmd: BaseCommand): cmd is GetTrytesCommand {
    return cmd.command === IRICommand.GET_TRYTES
}

export interface InterruptAttachingToTangleCommand extends BaseCommand {
    command: IRICommand.INTERRUPT_ATTACHING_TO_TANGLE
}

export interface BroadcastTransactionsCommand extends BaseCommand {
    command: IRICommand.BROADCAST_TRANSACTIONS
    trytes: string[]
}

export interface StoreTransactionsCommand extends BaseCommand {
    command: IRICommand.STORE_TRANSACTIONS
    trytes: string[]
}

export interface CheckConsistencyCommand extends BaseCommand {
    command: IRICommand.CHECK_CONSISTENCY
    tails: string[]
}

export type BatchableCommand =
    | FindTransactionsCommand
    | GetBalancesCommand
    | GetInclusionStatesCommand
    | GetTrytesCommand

export function isBatchableCommand(cmd: BaseCommand): cmd is BatchableCommand {
    return (
        cmd.command === IRICommand.FIND_TRANSACTIONS ||
        cmd.command === IRICommand.GET_BALANCES ||
        cmd.command === IRICommand.GET_INCLUSION_STATES ||
        cmd.command === IRICommand.GET_TRYTES
    )
}

export type Callback<R = any> = (err: Error | null, res?: R) => void

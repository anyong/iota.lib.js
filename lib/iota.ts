import { composeApi } from './api'
import { API, Settings } from './api/types'
import errors from './errors/inputErrors'
import multisig from './multisig/multisig'
import { default as valid } from './utils/inputValidator'
import utils from './utils/utils'

//
//  * Depreactions are aimed for v1.0.0

interface IOTA extends API {
    api: object // deprecate api namespace
    utils: object // deprecate
    valid: object // deprecate
    multisig: object // deprecate & grab it with composition
    version: string // deprecate
    [key: string]: any
}

function IOTA (this: API, settings: Settings, ...extensions: object[]):IOTA {
    const api = composeApi.call(composeApi, settings, ...extensions)

    return {
        ...api,
        api, // deprecate
        utils, // deprecate
        valid, // deprecate
        multisig: multisig.bind(api), // deprecate
        version: '0.5.0', // deprecate
    }
}

export { IOTA as default, utils, valid, errors }


import axios from 'axios'
import { isWebLikeEnv } from './env'
import { taroAdapter, xhrAdapter } from './adapters'

axios.defaults.adapter = isWebLikeEnv ? xhrAdapter : taroAdapter

export * from 'axios'

export * from './helpers'

export { axios }

export default axios

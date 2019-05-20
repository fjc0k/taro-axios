import axios from 'axios'
import { isWebLikeEnv } from './env'
import { PostData } from './helpers'
import { taroAdapter, xhrAdapter } from './adapters'
// @ts-ignore
import utils from 'axios/lib/utils'
// @ts-ignore
import normalizeHeaderName from 'axios/lib/helpers/normalizeHeaderName'

function setContentTypeIfUnset(headers: any, value: any) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value
  }
}

/* istanbul ignore next: 仅让默认的 transformRequest 放行 PostData */
axios.defaults.transformRequest = [
  function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Content-Type')
    if (
      utils.isFormData(data)
        || utils.isArrayBuffer(data)
        || utils.isBuffer(data)
        || utils.isStream(data)
        || utils.isFile(data)
        || utils.isBlob(data)
        // 支持 PostData
        || data instanceof PostData
    ) {
      return data
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8')
      return data.toString()
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8')
      return JSON.stringify(data)
    }
    return data
  },
]

axios.defaults.adapter = isWebLikeEnv ? xhrAdapter : taroAdapter

export * from 'axios'

export * from './helpers'

export { axios }

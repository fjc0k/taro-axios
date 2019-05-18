import { AxiosAdapter } from 'axios'
import { forEach, merge, objectToQueryString } from '../utils'
import { PostData } from '../helpers'

const nativeXhrAdapter = require('axios/lib/adapters/xhr') as AxiosAdapter

export const xhrAdapter: AxiosAdapter = config => {
  // 适配 PostData
  if (config.data && config.data instanceof PostData) {
    const { normalData, fileData } = config.data.getParsedPostData()
    const hasFileData = Object.keys(fileData).length > 0
    if (hasFileData) {
      const formData = new FormData()
      forEach(
        merge(normalData, fileData),
        (value, key) => {
          formData.set(key as any, value)
        },
      )
      config.data = formData
    } else {
      config.data = objectToQueryString(normalData)
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    }
  }

  return nativeXhrAdapter(config)
}

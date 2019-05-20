import { AxiosAdapter } from 'axios'
import { forEach, isString, objectToQueryString } from '../utils'
import { PostData } from '../helpers'
// @ts-ignore
import nativeXhrAdapter from 'axios/lib/adapters/xhr'

export const xhrAdapter: AxiosAdapter = config => {
  return new Promise(resolve => {
    // 适配 PostData
    if (config.data && config.data instanceof PostData) {
      const { normalData, fileData } = config.data.getParsedPostData()
      const hasFileData = Object.keys(fileData).length > 0
      if (hasFileData) {
        const formData = new FormData()
        forEach(
          normalData,
          (value, key) => {
            formData.set(key as any, value)
          },
        )
        Promise.all(
          Object.keys(fileData).map(key => {
            return new Promise(resolve => {
              const fileContent = fileData[key]

              // 兼容 blob 地址
              if (isString(fileContent) && fileContent.indexOf('blob:') === 0) {
                const xhr = new XMLHttpRequest()
                xhr.open('GET', fileContent)
                xhr.responseType = 'blob'
                xhr.onload = () => {
                  resolve(xhr.response)
                }
                xhr.send()
              } else {
                resolve(fileContent)
              }
            }).then(fileContent => formData.set(key, fileContent as any))
          }),
        ).then(() => {
          config.data = formData
          resolve()
        })
      } else {
        config.data = objectToQueryString(normalData)
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        resolve()
      }
    } else {
      resolve()
    }
  }).then(() => nativeXhrAdapter(config))
}

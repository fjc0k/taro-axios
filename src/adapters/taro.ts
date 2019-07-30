import { AxiosAdapter, AxiosResponse } from 'axios'
import { getTaro, isObject, isString, merge } from '../utils'
import { PostData } from '../helpers'
// @ts-ignore
import createError from 'axios/lib/core/createError'
// @ts-ignore
import buildUrl from 'axios/lib/helpers/buildURL'
// @ts-ignore
import settle from 'axios/lib/core/settle'

const Taro = getTaro()

export const taroAdapter: AxiosAdapter = config => {
  return new Promise((resolve, reject) => {
    const requestMethod: string = (isString(config.method) ? config.method : 'GET').toUpperCase()
    const requestUrl: string = buildUrl(config.url, config.params, config.paramsSerializer)
    const requestHeaders: Record<string, string> = isObject(config.headers) ? config.headers : {}

    // 请求数据
    let requestData: any = config.data

    // 请求任务
    let requestTask: Promise<AxiosResponse> | null = null

    // 中断请求任务
    let abortRequestTask: (() => void) | null = null

    // 文件上传请求
    if (requestData && requestData instanceof PostData) {
      const { normalData, fileData } = requestData.getParsedPostData()
      const hasFileData = Object.keys(fileData).length > 0
      if (hasFileData) {
        const fileName = Object.keys(fileData)[0]
        const filePath = fileData[fileName]
        const request = Taro.uploadFile({
          url: requestUrl,
          header: requestHeaders,
          name: fileName,
          filePath: filePath,
          formData: normalData,
        })
        abortRequestTask = request.abort
        if (typeof config.onUploadProgress === 'function') {
          request.progress((e: any) => {
            config.onUploadProgress!(
              merge(
                e,
                // 兼容 XMLHttpRequest.onprogress 的数据结构
                {
                  total: e.totalBytesExpectedToSend,
                  loaded: e.totalBytesSent,
                } as any,
              ),
            )
          })
        }
        requestTask = (request as Promise<any>).then<AxiosResponse>(res => {
          let data = res.data
          if (config.responseType === 'json') {
            try {
              data = JSON.parse(data)
            } catch (e) {}
          }
          return {
            data: data,
            status: res.statusCode,
            statusText: '',
            headers: {},
            config: config,
            request: request,
          }
        })
      } else {
        requestData = normalData
        requestHeaders['Content-Type'] = 'application/x-www-form-urlencoded'
      }
    }

    // 普通请求
    if (!requestTask) {
      const request = Taro.request({
        method: requestMethod as any,
        url: requestUrl,
        header: requestHeaders,
        // 请求数据只在 POST, PUT, PATCH 时设置
        data: requestMethod === 'POST' || requestMethod === 'PUT' || requestMethod === 'PATCH' ? requestData : '',
        // 响应的内容只能是 arraybuffer 或 text
        responseType: config.responseType === 'arraybuffer' ? 'arraybuffer' : 'text',
        // 响应数据的类型只能是 json 或 其他
        dataType: config.responseType === 'json' ? 'json' : config.responseType,
      })
      abortRequestTask = (request as any).abort
      requestTask = (request as Promise<any>).then<AxiosResponse>(res => {
        return {
          data: res.data,
          status: res.statusCode,
          statusText: '',
          headers: res.header,
          config: config,
          request: request,
        }
      })
    }

    // 请求任务结果处理
    requestTask
      .then(response => {
        settle(resolve, reject, response)
      })
      .catch(response => {
        // 如果存在状态码，说明请求服务器成功，将结果转发给 axios 处理
        if (response && typeof response === 'object' && (response.status != null || response.statusCode != null)) {
          settle(resolve, reject, {
            data: response.data,
            status: response.status != null ? response.status : response.statusCode,
            statusText: '',
            headers: response.header || response.headers || {},
            config: config,
            request: requestTask,
          })
        } else {
          const error = createError('Network Error', config, undefined, requestTask)
          reject(error)
        }
      })

    // 支持取消请求任务
    if (config.cancelToken) {
      config.cancelToken.promise.then(cancel => {
        abortRequestTask && abortRequestTask()
        reject(cancel)
      })
    }
  })
}

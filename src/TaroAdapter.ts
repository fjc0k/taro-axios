import Taro from '@tarojs/taro'
import { AxiosAdapter, AxiosRequestConfig, AxiosResponse } from 'axios'

const createError = require('axios/lib/core/createError') as (message: string, config: AxiosRequestConfig, code?: string, request?: any, response?: any) => Error
const buildUrl = require('axios/lib/helpers/buildURL') as (url: AxiosRequestConfig['url'], params: AxiosRequestConfig['params'], paramsSerializer: AxiosRequestConfig['paramsSerializer']) => string
const settle = require('axios/lib/core/settle') as (resolve: Function, reject: Function, response: AxiosResponse) => void
const { isString, isObject } = require('axios/lib/utils') as {
  isString(value: any): value is string,
  isObject(value: any): value is Record<string, string>,
}

export const TaroAdapter: AxiosAdapter = config => {
  return new Promise((resolve, reject) => {
    const requestMethod: string = (isString(config.method) ? config.method : 'GET').toUpperCase()
    const requestUrl: string = buildUrl(config.url, config.params, config.paramsSerializer)
    const requestHeaders: Record<string, string> = isObject(config.headers) ? config.headers : {}
    const requestData: any = config.data

    const requestTask = Taro.request({
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

    // 支持 cancel
    if (config.cancelToken) {
      config.cancelToken.promise.then(cancel => {
        (requestTask as any).abort && (requestTask as any).abort()
        reject(cancel)
      })
    }

    requestTask
      .then(res => {
        const response: AxiosResponse = {
          data: res.data,
          status: res.statusCode,
          statusText: '',
          headers: res.header,
          config: config,
          request: requestTask,
        }
        settle(resolve, reject, response)
      })
      .catch(() => {
        const error = createError('Network Error', config, undefined, requestTask)
        reject(error)
      })
  })
}

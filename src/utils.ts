// @ts-ignore
import utils from 'axios/lib/utils'

const { isString, isObject, forEach, merge } = utils as {
  isString(value: any): value is string,
  isObject(value: any): value is Record<string, string>,
  forEach<T extends Record<string, any>>(obj: T, fn: (value: T[keyof T], key: keyof T, obj: T) => void): void,
  merge<T extends Record<string, any>>(...args: T[]): T,
}

function objectToQueryString(obj: Record<string, any>) {
  const result: string[] = []
  forEach(obj, (value, key) => {
    result.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
  })
  return result.join('&')
}

function getTaro(): any {
  let Taro: any

  /* istanbul ignore next */
  if (process.env.TARO_ENV === 'weapp') {
    Taro = require('@tarojs/taro-weapp')
  } else if (process.env.TARO_ENV === 'h5') {
    Taro = require('@tarojs/taro-h5')
  } else if (process.env.TARO_ENV === 'swan') {
    Taro = require('@tarojs/taro-swan')
  } else if (process.env.TARO_ENV === 'alipay') {
    Taro = require('@tarojs/taro-alipay')
  } else if (process.env.TARO_ENV === 'rn') {
    Taro = require('@tarojs/taro-rn')
  } else if (process.env.TARO_ENV === 'tt') {
    Taro = require('@tarojs/taro-tt')
  } else if (process.env.TARO_ENV === 'qq') {
    Taro = require('@tarojs/taro-qq')
  } else if (process.env.TARO_ENV === 'quickapp') {
    Taro = require('@tarojs/taro-quickapp')
  }

  return Taro
}

export { isString, isObject, forEach, merge, objectToQueryString, getTaro }

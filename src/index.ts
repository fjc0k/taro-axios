import axios from 'axios'
import Taro from '@tarojs/taro'
import { TaroAdapter } from './TaroAdapter'

// 获取当前平台
const platform: Taro.ENV_TYPE = Taro.getEnv()

// 使用 xhr 适配器的平台
const platformsUsingXhrAdapter: Array<Taro.ENV_TYPE> = [
  Taro.ENV_TYPE.WEB,
  Taro.ENV_TYPE.RN,
]

// 非使用 xhr 适配器的平台一律使用 Taro 适配器
if (platformsUsingXhrAdapter.indexOf(platform) === -1) {
  axios.defaults.adapter = TaroAdapter
}

export * from 'axios'

export { axios, TaroAdapter as AxiosTaroAdapter }

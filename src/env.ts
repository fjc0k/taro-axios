import { getTaro } from './utils'

const Taro = getTaro()

export const isWebLikeEnv = (
  [
    Taro.ENV_TYPE.WEB,
    Taro.ENV_TYPE.RN,
  ].indexOf(Taro.getEnv()) >= 0
)

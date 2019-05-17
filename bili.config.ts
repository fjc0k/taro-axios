import { Config } from 'bili'

const config: Config = {
  input: 'src/index.ts',
  output: {
    target: 'browser',
    format: ['cjs', 'cjs-min', 'esm'],
    dir: 'lib',
  },
  bundleNodeModules: true,
  externals: ['@tarojs/taro'],
}

export default config

import { Config } from 'bili'

const config: Config = {
  input: 'src/index.ts',
  output: {
    target: 'browser',
    format: ['esm'],
    dir: 'lib',
    fileName: '[name].js',
  },
  bundleNodeModules: true,
  externals: ['@tarojs/taro'],
}

export default config

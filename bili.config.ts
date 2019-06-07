import { Config } from 'bili'

const config: Config = {
  input: 'src/index.ts',
  output: {
    target: 'browser',
    format: ['cjs', 'es'],
    dir: 'lib',
  },
  bundleNodeModules: true,
  externals: [/@tarojs/],
}

export default config

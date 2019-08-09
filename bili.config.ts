import { Config } from 'bili'

const config: Config = {
  input: 'src/index.ts',
  output: {
    target: 'browser',
    format: ['cjs', 'cjs-min', 'es'],
    dir: 'lib',
    sourceMap: true,
  },
  bundleNodeModules: true,
  externals: [/@tarojs/],
}

export default config

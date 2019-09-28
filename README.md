# taro-axios <a href="https://www.npmjs.com/package/taro-axios"><img src="https://badge.fury.io/js/taro-axios.svg" alt="NPM Version"></a> <a href="https://travis-ci.org/fjc0k/taro-axios"><img src="https://travis-ci.org/fjc0k/taro-axios.svg?branch=master" alt="Build Status"></a> <a href="https://codecov.io/gh/fjc0k/taro-axios"><img src="https://codecov.io/gh/fjc0k/taro-axios/branch/master/graph/badge.svg" alt="Coverage Status"></a> <img src="https://badgen.net/github/license/fjc0k/taro-axios" alt="License">

在 [Taro](https://github.com/NervJS/taro) 中使用 [axios](https://github.com/axios/axios)。

## 源起

因为 `Taro` 不支持解析 `package.json` 里的 `browser` 属性，导致所有使用了该特性的包都可能无法在 `Taro` 里正常运行。不幸的是，`axios` 就是其中之一。

于是，`taro-axios` 预先解析了 `axios` 包中的 `browser` 属性并提供了 `Taro` 版的请求适配器后，将之打包出了一个 `Taro` 可用的版本。

也就是说，`taro-axios` 只是 `axios` 的 `Taro` 重制版，并非是为 `Taro` 仿写了一个 `axios`。`axios` 提供什么，`taro-axios` 也就提供什么。

## 特性

- 使用 TypeScript 编写，类型友好
- 基于 Taro 适配器，天然支持多端
- 支持 API 一致的多端上传文件

## 安装

```bash
# yarn
yarn add taro-axios

# 或, npm
npm i taro-axios --save
```

## 使用

使用方法同 [axios](https://github.com/axios/axios#axios)。

只不过你得这样引入 `axios`：

```ts
import { axios } from 'taro-axios'

axios
  .get('https://jsonplaceholder.typicode.com/todos/1')
  .then(res => {
    console.log(res.data)
  })
```

## 上传文件

为了支持多端上传文件，我们得引入 `PostData` 和 `FileData` 两个类，示例：

```ts
import { axios, PostData, FileData } from 'taro-axios'

function async uploadImage() {
  const { tempFilePaths } = await Taro.chooseImage({ count: 1 })
  Taro.showLoading({ title: '图片上传中...' })
  const res = await axios.post(
    'https://sm.ms/api/upload',
    new PostData({
      smfile: new FileData(tempFilePaths[0]),
      ssl: true,
      format: 'json',
    }),
  )
  Taro.hideLoading()
  Taro.showModal({
    title: '返回结果',
    content: JSON.stringify(res.data),
  })
}
```

## 许可

MIT © Jay Fong

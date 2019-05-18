import * as http from 'http'
import * as qs from 'qs'
import * as Taro from '@tarojs/taro-h5'
import { isFunction, isPlainObject, wait } from 'vtils'

const withAxiosList: Array<() => Promise<typeof import('../src')>> = [
  async function WebOrRN() {
    jest.resetModules()
    jest.mock(
      '@tarojs/taro',
      () => ({
        ...Taro,
        getEnv: () => Taro.ENV_TYPE.WEB,
      }),
    )
    return import('../src')
  },
  async function MiniProgram() {
    jest.resetModules()
    jest.mock(
      '@tarojs/taro',
      () => ({
        ...Taro,
        getEnv: () => Taro.ENV_TYPE.WEAPP,
      }),
    )
    return import('../src')
  },
]

let port = 4444

async function withServer({
  statusCode = 200,
  response,
}: {
  statusCode?: number,
  response: ((req: http.IncomingMessage) => any) | Record<string, any>,
}) {
  const server = http
    .createServer(async (req, res) => {
      res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      })
      response = isFunction(response) ? await (response as any)(req) : response
      res.end(isPlainObject(response) ? JSON.stringify(response) : response)
    })
    .listen(++port)

  return Promise.resolve({
    url: `http://localhost:${port}`,
    closeServer: () => server.close(),
  })
}

describe('多端适配', () => {
  [Taro.ENV_TYPE.WEB, Taro.ENV_TYPE.RN].forEach(envType => {
    test(`${envType} 环境下，使用 xhr 适配器`, async () => {
      jest.resetModules()
      jest.mock(
        '@tarojs/taro',
        () => ({
          ...Taro,
          getEnv: () => envType,
        }),
      )
      const { axios } = await import('../src')
      const { xhrAdapter } = await import('../src/adapters')
      expect(axios.defaults.adapter).toBe(xhrAdapter)
      jest.restoreAllMocks()
    })
  })

  test('小程序环境下，使用 taro 适配器', async () => {
    jest.resetModules()
    jest.mock(
      '@tarojs/taro',
      () => ({
        ...Taro,
        getEnv: () => Taro.ENV_TYPE.WEAPP,
      }),
    )
    const { axios } = await import('../src')
    const { taroAdapter } = await import('../src/adapters')
    expect(axios.defaults.adapter).toBe(taroAdapter)
    jest.restoreAllMocks()
  })
})

withAxiosList.forEach(withAxios => {
  describe(`${withAxios.name} - 特性支持`, () => {
    test('支持中断请求', async () => {
      const { axios } = await withAxios()
      const { url, closeServer } = await withServer({
        response: {
          success: true,
        },
      })
      try {
        await axios.get(url, {
          cancelToken: new axios.CancelToken(cancel => {
            wait(0).then(() => cancel())
          }),
        })
      } catch (err) {
        expect(axios.isCancel(err)).toBeTruthy()
      }
      closeServer()
    })

    test('异常抛出 - 服务端错误', async () => {
      const { axios } = await withAxios()
      const { url, closeServer } = await withServer({
        statusCode: 500,
        response: {
          success: true,
        },
      })
      try {
        await axios.get(url)
      } catch (err) {
        expect(err.message).toBe('Request failed with status code 500')
      }
      closeServer()
    })

    test('异常抛出 - 服务端错误', async () => {
      const { axios } = await withAxios()
      try {
        console.error = jest.fn()
        await axios.get('http://localh0st')
      } catch (err) {
        expect(err.message).toBe('Network Error')
      }
    })
  })

  describe(`${withAxios.name} - GET`, () => {
    test('GET 正常', async () => {
      const { axios } = await withAxios()
      const { url, closeServer } = await withServer({
        statusCode: 200,
        response: req => ({
          method: req.method,
          success: true,
        }),
      })
      const res = await axios.get(url)
      expect(res.data).toMatchObject({
        method: 'GET',
        success: true,
      })
      closeServer()
    })

    test('GET 发送请求串数据正常', async () => {
      const { axios } = await withAxios()
      const { url, closeServer } = await withServer({
        statusCode: 200,
        response: req => ({
          method: req.method,
          query: qs.parse(req.url!.split('?')[1]),
          success: true,
        }),
      })
      const res = await axios.get(url, {
        params: {
          ok: 'ok',
          age: 12,
        },
      })
      expect(res.data).toMatchObject({
        method: 'GET',
        query: {
          ok: 'ok',
          age: '12',
        },
        success: true,
      })
      closeServer()
    })
  })

  describe(`${withAxios.name} - POST`, () => {
    test('POST 正常', async () => {
      const { axios } = await withAxios()
      const { url, closeServer } = await withServer({
        statusCode: 200,
        response: req => ({
          method: req.method,
          success: true,
        }),
      })
      const res = await axios.post(url)
      expect(res.data).toMatchObject({
        method: 'POST',
        success: true,
      })
      closeServer()
    })

    test('POST 发送 JSON 数据正常', async () => {
      const { axios } = await withAxios()
      const { url, closeServer } = await withServer({
        statusCode: 200,
        response: req => new Promise(resolve => {
          let str = ''
          req.on('data', (chunk: Buffer) => {
            str += chunk.toString('utf8')
          })
          req.on('end', () => {
            resolve({
              method: req.method,
              success: true,
              ...JSON.parse(str),
            })
          })
        }),
      })
      const res = await axios.post(url, {
        name: 'Jay',
        age: 23,
      })
      expect(res.data).toMatchObject({
        method: 'POST',
        success: true,
        name: 'Jay',
        age: 23,
      })
      closeServer()
    })

    test('POST 发送表单数据正常', async () => {
      const { axios } = await withAxios()
      const { url, closeServer } = await withServer({
        statusCode: 200,
        response: req => new Promise(resolve => {
          let str = ''
          req.on('data', (chunk: Buffer) => {
            str += chunk.toString('utf8')
          })
          req.on('end', () => {
            resolve({
              method: req.method,
              success: true,
              ...qs.parse(str),
            })
          })
        }),
      })
      const res = await axios.post(
        url,
        qs.stringify({
          name: 'Jay',
          age: 23,
        }),
        {
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
        },
      )
      expect(res.data).toMatchObject({
        method: 'POST',
        success: true,
        name: 'Jay',
        age: '23',
      })
      closeServer()
    })

    test('POST 发送 PostData 表单数据正常', async () => {
      const { axios, PostData } = await withAxios()
      const { url, closeServer } = await withServer({
        statusCode: 200,
        response: req => new Promise(resolve => {
          let str = ''
          req.on('data', (chunk: Buffer) => {
            str += chunk.toString('utf8')
          })
          req.on('end', () => {
            resolve({
              method: req.method,
              success: true,
              ...qs.parse(str),
            })
          })
        }),
      })
      const res = await axios.post(
        url,
        new PostData({
          name: 'Jay',
          age: 23,
        }),
      )
      expect(res.data).toMatchObject({
        method: 'POST',
        success: true,
        name: 'Jay',
        age: '23',
      })
      closeServer()
    })
  })
})

describe('其他', () => {
  test('PostData 文件上传正常', async () => {
    const { axios, PostData, FileData } = await withAxiosList[0]()
    const { url, closeServer } = await withServer({
      statusCode: 200,
      response: req => new Promise(resolve => {
        let str = ''
        req.on('data', (chunk: Buffer) => {
          str += chunk.toString('utf8')
        })
        req.on('end', () => {
          resolve({
            method: req.method,
            success: str.includes('__x__') && str.includes('test.txt'),
          })
        })
      }),
    })
    const file = new File(Array.from('hello'), 'test.txt')
    // axios({
    //   method: ''
    // })
    const res = await axios.post(
      url,
      new PostData({
        x: '__x__',
        file: new FileData(file),
      }),
    )
    expect(res.data).toMatchObject({
      method: 'POST',
      success: true,
    })
    closeServer()
  })
})

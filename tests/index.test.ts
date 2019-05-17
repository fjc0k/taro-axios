import * as http from 'http'
import * as qs from 'qs'
import * as Taro from '@tarojs/taro-h5'
import { wait } from 'vtils'

jest.mock(
  '@tarojs/taro',
  () => ({
    ...Taro,
    getEnv: () => Taro.ENV_TYPE.WEAPP,
  }),
)

import { axios } from '../src'

let port = 4444

describe('多端适配', () => {
  [Taro.ENV_TYPE.WEB, Taro.ENV_TYPE.RN].forEach(envType => {
    test(`${envType} 环境下，使用 axios 默认的适配器`, async () => {
      jest.resetModules()
      jest.mock(
        '@tarojs/taro',
        () => ({
          ...Taro,
          getEnv: () => envType,
        }),
      )
      const { axios } = await import('../src')
      expect(axios.defaults.adapter!.name).toBe('xhrAdapter')
      jest.restoreAllMocks()
    })
  })

  test('小程序环境下，使用 Taro 适配器', async () => {
    jest.resetModules()
    jest.mock(
      '@tarojs/taro',
      () => ({
        ...Taro,
        getEnv: () => Taro.ENV_TYPE.WEAPP,
      }),
    )
    const { axios } = await import('../src')
    const { TaroAdapter } = await import('../src/TaroAdapter')
    expect(axios.defaults.adapter).toBe(TaroAdapter)
    jest.restoreAllMocks()
  })
})

describe('特性支持', () => {
  test('支持 cancel', async () => {
    const server = http
      .createServer((req, res) => {
        wait(2000).then(() => {
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          })
          res.end(JSON.stringify({
            success: true,
          }))
        })
      })
      .listen(++port)

    try {
      await axios.get(`http://localhost:${port}`, {
        cancelToken: new axios.CancelToken(cancel => {
          wait(100).then(() => cancel())
        }),
      })
    } catch (err) {
      expect(axios.isCancel(err)).toBeTruthy()
    }

    server.close()
  })

  test('异常抛出 - 服务端错误', async () => {
    const server = http
      .createServer((req, res) => {
        res.writeHead(500, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        })
        res.end(JSON.stringify({
          success: true,
        }))
      })
      .listen(++port)

    try {
      await axios.get(`http://localhost:${port}`)
    } catch (err) {
      expect(err.message).toBe('Request failed with status code 500')
    }

    server.close()
  })

  test('异常抛出 - 客户端错误', async () => {
    try {
      console.error = jest.fn()
      await axios.get('http://localh0st')
    } catch (err) {
      expect(err.message).toBe('Network Error')
    }
  })
})

describe('GET', () => {
  test('GET 正常', async () => {
    const server = http
      .createServer((req, res) => {
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        })
        res.end(JSON.stringify({
          method: req.method,
          success: true,
        }))
      })
      .listen(++port)

    const res = await axios.get(`http://localhost:${port}`)

    expect(res.data).toMatchObject({
      method: 'GET',
      success: true,
    })

    server.close()
  })

  test('GET 发送请求串数据正常', async () => {
    const server = http
      .createServer((req, res) => {
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        })
        res.end(JSON.stringify({
          method: req.method,
          success: true,
          query: qs.parse(req.url!.split('?')[1]),
        }))
      })
      .listen(++port)

    const res = await axios({
      url: `http://localhost:${port}`,
      params: {
        ok: 'ok',
        age: 12,
      },
    })

    expect(res.data).toMatchObject({
      method: 'GET',
      success: true,
      query: {
        ok: 'ok',
        age: '12',
      },
    })

    server.close()
  })
})

describe('POST', () => {
  test('POST 正常', async () => {
    const server = http
      .createServer((req, res) => {
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        })
        res.end(JSON.stringify({
          method: req.method,
          success: true,
        }))
      })
      .listen(++port)

    const res = await axios.post(`http://localhost:${port}`)

    expect(res.data).toMatchObject({
      method: 'POST',
      success: true,
    })

    server.close()
  })

  test('POST 发送 JSON 数据正常', async () => {
    const server = http
      .createServer((req, res) => {
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        })
        let str = ''
        req.on('data', (chunk: Buffer) => {
          str += chunk.toString('utf8')
        })
        req.on('end', () => {
          res.end(JSON.stringify({
            method: req.method,
            success: true,
            ...JSON.parse(str),
          }))
        })
      })
      .listen(++port)

    const res = await axios.post(`http://localhost:${port}`, { name: 'Jay', age: 23 })

    expect(res.data).toMatchObject({
      method: 'POST',
      success: true,
      name: 'Jay',
      age: 23,
    })

    server.close()
  })

  test('POST 发送表单数据正常', async () => {
    const server = http
      .createServer((req, res) => {
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        })
        let str = ''
        req.on('data', (chunk: Buffer) => {
          str += chunk.toString('utf8')
        })
        req.on('end', () => {
          res.end(JSON.stringify({
            method: req.method,
            success: true,
            ...qs.parse(str),
          }))
        })
      })
      .listen(++port)

    const res = await axios.post(
      `http://localhost:${port}`,
      qs.stringify({ name: 'Jay', age: 23 }),
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

    server.close()
  })
})

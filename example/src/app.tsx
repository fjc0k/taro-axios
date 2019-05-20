import './app.css'
import '@tarojs/async-await'
import Index from './pages/index'
import Taro, { Component, Config } from '@tarojs/taro'

class App extends Component {
  config: Config = {
    pages: [
      'pages/index/index',
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black',
    },
  }

  render() {
    return (
      <Index />
    )
  }
}

Taro.render(<App />, document.getElementById('app'))

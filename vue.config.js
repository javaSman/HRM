const path = require('path')
const CompressionPlugin = require('compression-webpack-plugin')
const proxyTarget = process.env.VUE_APP_PROXY_TARGET || 'http://192.168.0.13:8180'

function resolve(dir) {
  return path.join(__dirname, dir)
}

// vue.config.js
module.exports = {
  /*
    Vue-cli3:
    Crashed when using Webpack `import()` #2463
    https://github.com/vuejs/vue-cli/issues/2463
   */
  // 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建。
  productionSourceMap: false,
  // 打包app时放开该配置
  // publicPath:'./',

  // 多页面配置
  pages: {
    index: {
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: 'index.html',
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    },
    // 访客自助登记页面 - 独立入口，无需登录
    visitorRegister: {
      entry: 'src/visitorRegister.js',
      template: 'public/visitorRegister.html',
      filename: 'visitorRegister.html',
      chunks: ['chunk-vendors', 'chunk-common', 'visitorRegister']
    }
  },

  configureWebpack: config => {
    // 生产环境取消 console.log
    if (process.env.NODE_ENV === 'production') {
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
    }
  },
  chainWebpack: (config) => {
    config.resolve.alias
      .set('@$', resolve('src'))
      .set('@api', resolve('src/api'))
      .set('@assets', resolve('src/assets'))
      .set('@comp', resolve('src/components'))
      .set('@views', resolve('src/views'))

    // 生产环境，开启js\css压缩
    if (process.env.NODE_ENV === 'production') {
        config.plugin('compressionPlugin').use(new CompressionPlugin({
          test: /\.(js|css|less)$/, // 匹配文件名
          threshold: 10240, // 对超过10k的数据压缩
          deleteOriginalAssets: false // 不删除源文件
        }))
    }

    // 配置 webpack 识别 markdown 为普通的文件
    config.module
      .rule('markdown')
      .test(/\.md$/)
      .use()
      .loader('file-loader')
      .end()

    // 编译vxe-table包里的es6代码，解决IE11兼容问题
    config.module
      .rule('vxe')
      .test(/\.js$/)
      .include
        .add(resolve('node_modules/vxe-table'))
        .add(resolve('node_modules/vxe-table-plugin-antd'))
        .end()
      .use()
      .loader('babel-loader')
      .end()

    // 新增 mjs 处理规则
    config.module
      .rule('mjs')
      .test(/\.mjs$/)
      .include
      .add(/node_modules/)
      .end()
      .type('javascript/auto')
  },

  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          /* less 变量覆盖，用于自定义 ant design 主题 */
          'primary-color': '#1890FF',
          'link-color': '#1890FF',
          'border-radius-base': '4px'
        },
        javascriptEnabled: true
      }
    }
  },

  devServer: {
    port: 3000,
    // 允许 Natapp 等内网穿透工具从外部访问本机开发服务器
    host: '0.0.0.0',
    // Vue CLI 3 使用 webpack-dev-server 3，外网域名访问时关闭 Host 校验
    // 仅用于本地开发，不要带到生产环境
    disableHostCheck: true,
    proxy: {
     /* '/api': {
        target: 'https://mock.ihx.me/mock/5baf3052f7da7e07e04a5116/antd-pro', //mock API接口系统
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          '/jeecg-boot': ''  //默认所有请求都加了jeecg-boot前缀，需要去掉
        }
      }, */
      '/qr-hrm': {
        target: proxyTarget, // 后端服务地址，开发环境通过 VUE_APP_PROXY_TARGET 配置
        ws: false,
        changeOrigin: true,
        timeout: 30000,
        proxyTimeout: 30000
      }
    },
    watchOptions: {
      ignored: [
        /(^|[\\/])node_modules([\\/]|$)/,
        /(^|[\\/])System Volume Information([\\/]|$)/i,
        /(^|[\\/])\$Recycle\.Bin([\\/]|$)/i,
        /(^|[\\/])hiberfil\.sys$/i,
        /(^|[\\/])DumpStack\.log\.tmp$/i,
        /(^|[\\/])pagefile\.sys$/i,
        /(^|[\\/])swapfile\.sys$/i
      ]
    }
  },

  lintOnSave: undefined,
  outputDir: 'qr-hrmHome'
}

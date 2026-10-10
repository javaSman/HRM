/** init domain config */
import './config'

import Vue from 'vue'
import App from './App.vue'
import Storage from 'vue-ls'
import router from './router'
import store from './store/'
import { VueAxios } from "@/utils/request"
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import formDesigner from '@/components/formdesigner/components/index'
import '@/components/formdesigner/assets/iconfont/iconfont.js'

require('@jeecg/antd-online-mini')
require('@jeecg/antd-online-mini/dist/OnlineForm.css')

import Antd, { version } from 'ant-design-vue'
console.log('ant-design-vue version:', version)

import Viser from 'viser-vue'
import 'ant-design-vue/dist/antd.less';  // or 'ant-design-vue/dist/antd.less'

import '@/permission' // permission control
import '@/utils/filter' // base filter
import Print from 'vue-print-nb-jeecg'
import preview from 'vue-photo-preview'
import 'vue-photo-preview/dist/skin.css'
import './assets/css/style.css';
import './assets/css/ztStyle.css';
import SSO from '@/cas/sso.js'
import '@/utils/modalDrag.js' //dragDialog
import Vue2OrgTree from 'vue2-org-tree'
import uploader from 'vue-simple-uploader'
import {
  ACCESS_TOKEN,
  DEFAULT_COLOR,
  DEFAULT_THEME,
  DEFAULT_LAYOUT_MODE,
  DEFAULT_COLOR_WEAK,
  SIDEBAR_TYPE,
  DEFAULT_FIXED_HEADER,
  DEFAULT_FIXED_HEADER_HIDDEN,
  DEFAULT_FIXED_SIDEMENU,
  DEFAULT_CONTENT_WIDTH_TYPE,
  DEFAULT_MULTI_PAGE
} from "@/store/mutation-types"
import config from '@/defaultSettings'

import JDictSelectTag from './components/dict/index.js'
import hasPermission from '@/utils/hasPermission'
import debounce from '@/utils/debounce'
import vueBus from '@/utils/vueBus';
import JeecgComponents from '@/components/jeecg/index'
import '@/assets/less/JAreaLinkage.less'
import VueAreaLinkage from 'vue-area-linkage'
import '@/components/jeecg/JVxeTable/install'
import '@/components/JVxeCells/install'

import JSEncrypt from "jsencrypt";
Vue.prototype.$jsEncrypt = JSEncrypt;

// 全局日志组件
import ztDataLog from "@comp/common/log/ztDataLog";
//表单验证
import { rules } from '@/utils/rules'
Vue.prototype.rules = rules
Vue.config.productionTip = false
Vue.use(Storage, config.storageOptions)
Vue.use(ElementUI)
Vue.use(Antd)
Vue.use(formDesigner)
Vue.use(VueAxios, router)
Vue.use(Viser)
Vue.use(hasPermission)
Vue.use(debounce)
Vue.use(JDictSelectTag)
Vue.use(Print)
Vue.use(preview)
Vue.use(vueBus);
Vue.use(JeecgComponents);
Vue.use(VueAreaLinkage);
Vue.use(Vue2OrgTree);
Vue.use(ztDataLog);
Vue.use(uploader);

SSO.init(() => {
  // 首次从企微工作台打开时不要阻塞 Vue 挂载，否则授权接口异常会让
  // public/index.html 的加载球一直停留在页面上。只有 OAuth 回调带 code
  // 时，才需要在挂载前换取平台 Token。
  const hasOAuthCode = new URLSearchParams(window.location.search || '').has('code')
  if (!hasOAuthCode) {
    main()
    import('@/wechat/enterpriseLogin')
      .then(({ initEnterpriseWeChatLogin }) => initEnterpriseWeChatLogin())
      .catch(handleEnterpriseLoginError)
    return
  }

  import('@/wechat/enterpriseLogin')
    .then(({ initEnterpriseWeChatLogin }) => initEnterpriseWeChatLogin())
    .then(result => {
      if (!result || !result.redirected) {
        main()
      }
    })
    .catch(error => {
      handleEnterpriseLoginError(error)
      main()
    })
})

function handleEnterpriseLoginError(error) {
  // OAuth 失败时仍进入原账号密码登录页，同时保留错误便于排查配置。
  console.error('[企业微信登录] 初始化失败：', error)
  const responseData = error && error.response && error.response.data
  const message = responseData && (responseData.message || responseData.msg)
  sessionStorage.setItem('WECHAT_ENTERPRISE_LOGIN_ERROR', message || error.message || String(error))
}

function main() {
  new Vue({
    router,
    store,
    mounted () {
      store.commit('SET_SIDEBAR_TYPE', Vue.ls.get(SIDEBAR_TYPE, true))
      store.commit('TOGGLE_THEME', Vue.ls.get(DEFAULT_THEME, config.navTheme))
      store.commit('TOGGLE_LAYOUT_MODE', Vue.ls.get(DEFAULT_LAYOUT_MODE, config.layout))
      store.commit('TOGGLE_FIXED_HEADER', Vue.ls.get(DEFAULT_FIXED_HEADER, config.fixedHeader))
      store.commit('TOGGLE_FIXED_SIDERBAR', Vue.ls.get(DEFAULT_FIXED_SIDEMENU, config.fixSiderbar))
      store.commit('TOGGLE_CONTENT_WIDTH', Vue.ls.get(DEFAULT_CONTENT_WIDTH_TYPE, config.contentWidth))
      store.commit('TOGGLE_FIXED_HEADER_HIDDEN', Vue.ls.get(DEFAULT_FIXED_HEADER_HIDDEN, config.autoHideHeader))
      store.commit('TOGGLE_WEAK', Vue.ls.get(DEFAULT_COLOR_WEAK, config.colorWeak))
      store.commit('TOGGLE_COLOR', Vue.ls.get(DEFAULT_COLOR, config.primaryColor))
      store.commit('SET_TOKEN', Vue.ls.get(ACCESS_TOKEN))
      store.commit('SET_MULTI_PAGE',Vue.ls.get(DEFAULT_MULTI_PAGE,config.multipage))
    },
    render: h => h(App)
  }).$mount('#app')
}

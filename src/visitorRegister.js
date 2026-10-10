/** 访客自助登记页面入口 - 独立多页面应用，无需登录 */
import './config'

import Vue from 'vue'
import VisitorRegisterApp from './VisitorRegisterApp.vue'
import Storage from 'vue-ls'

import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.less'

import { VueAxios } from "@/utils/request"
import config from '@/defaultSettings'

// 导入全局组件
import JDictSelectTag from './components/dict/index.js'
import JeecgComponents from '@/components/jeecg/index'
import '@/components/jeecg/JVxeTable/install'
import '@/components/JVxeCells/install'
import vueBus from '@/utils/vueBus'

Vue.config.productionTip = false
Vue.use(Storage, config.storageOptions)
Vue.use(Antd)
Vue.use(VueAxios)
Vue.use(JDictSelectTag)
Vue.use(JeecgComponents)
Vue.use(vueBus)

// 不需要引入 router、store、permission 等登录相关模块
// 直接创建 Vue 实例
new Vue({
  render: h => h(VisitorRegisterApp)
}).$mount('#visitor-register-app')
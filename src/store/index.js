import Vue from 'vue'
import Vuex from 'vuex'

import app from './modules/app'
import user from './modules/user'
import permission from './modules/permission'
import enhance from './modules/enhance'
import online from './modules/online'
import getters from './getters'
import AllPreviewX from './modules/AllPreviewX'
import Export from './modules/Export'


Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    app,
    user,
    permission,
    AllPreviewX,
    Export,
    enhance,
    online
  },
  state: {

  },
  mutations: {

  },
  actions: {

  },
  getters
})

import Vue from 'vue'
import { login, logout, phoneLogin, thirdLogin } from "@/api/login"
import { ACCESS_TOKEN, USER_NAME, USER_INFO, USER_AUTH, SYS_BUTTON_AUTH, UI_CACHE_DB_DICT_DATA, TENANT_ID, CACHE_INCLUDED_ROUTES } from "@/store/mutation-types"
import { welcome } from "@/utils/util"
import { queryPermissionsByUser, queryZtPermissionsByUser } from '@/api/api'
import { getAction } from '@/api/manage'

const PER_INFO_EXPIRE = 7 * 24 * 60 * 60 * 1000

/**
 * 登录返回的员工信息先同步写入缓存，避免流程页在异步补全完成前拿不到工号。
 * 随后再用员工列表接口补充字典文本等完整字段。
 */
function cacheEmployeeInfo(result) {
  const employeeInformation = result && result.employeeInformation
  if (!employeeInformation) {
    Vue.ls.set('perInfo', {}, PER_INFO_EXPIRE)
    return
  }

  Vue.ls.set('perInfo', employeeInformation, PER_INFO_EXPIRE)
  if (!employeeInformation.no) return

  getAction('/hrm/hrEmployeeInformation/list', { no: employeeInformation.no }).then(response => {
    if (response.success && response.result && response.result.records && response.result.records.length > 0) {
      Vue.ls.set('perInfo', response.result.records[0], PER_INFO_EXPIRE)
    }
  }).catch(() => {
    // 已经缓存了登录返回的基础员工信息，补全失败时仍可正常计算申请时长。
  })
}

const user = {
  state: {
    token: '',
    username: '',
    realname: '',
    tenantid: '',
    welcome: '',
    avatar: '',
    permissionList: [],
    info: {},
    // 系统安全模式
    sysSafeMode: null,
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, { username, realname, welcome }) => {
      state.username = username
      state.realname = realname
      state.welcome = welcome
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_PERMISSIONLIST: (state, permissionList) => {
      state.permissionList = permissionList
    },
    SET_INFO: (state, info) => {
      state.info = info
    },
    SET_TENANT: (state, id) => {
      state.tenantid = id
    },
    SET_SYS_SAFE_MODE: (state, sysSafeMode) => {
      if (typeof sysSafeMode === 'boolean') {
        state.sysSafeMode = sysSafeMode
      } else {
        state.sysSafeMode = false
      }
    },
  },

  actions: {
    // CAS验证登录
    ValidateLogin({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        getAction("/sys/cas/client/validateLogin", userInfo).then(response => {
          console.log("----cas 登录--------", response);
          if (response.success) {
            const result = response.result
            const userInfo = result.userInfo
            Vue.ls.set(ACCESS_TOKEN, result.token, 7 * 24 * 60 * 60 * 1000)
            Vue.ls.set(USER_NAME, userInfo.username, 7 * 24 * 60 * 60 * 1000)
            Vue.ls.set(USER_INFO, userInfo, 7 * 24 * 60 * 60 * 1000)
            commit('SET_TOKEN', result.token)
            commit('SET_INFO', userInfo)
            commit('SET_NAME', { username: userInfo.username, realname: userInfo.realname, welcome: welcome() })
            commit('SET_AVATAR', userInfo.avatar)
            cacheEmployeeInfo(result)
            resolve(response)
          } else {
            resolve(response)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 登录
    Login({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        login(userInfo).then(response => {
          if (response.code == '200') {
            const result = response.result
            const userInfo = result.userInfo
            Vue.ls.set(ACCESS_TOKEN, result.token, 7 * 24 * 60 * 60 * 1000)
            Vue.ls.set(USER_NAME, userInfo.username, 7 * 24 * 60 * 60 * 1000)
            Vue.ls.set(USER_INFO, userInfo, 7 * 24 * 60 * 60 * 1000)



            Vue.ls.set(UI_CACHE_DB_DICT_DATA, result.sysAllDictItems, 7 * 24 * 60 * 60 * 1000)
            commit('SET_TOKEN', result.token)
            commit('SET_INFO', userInfo)
            commit('SET_NAME', { username: userInfo.username, realname: userInfo.realname, welcome: welcome() })
            commit('SET_AVATAR', userInfo.avatar)

            // 先缓存登录返回的员工信息，再静默补充完整字段，不阻塞登录。
            cacheEmployeeInfo(result)

            resolve(response)
          } else {
            reject(response)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },
    //手机号登录
    PhoneLogin({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        phoneLogin(userInfo).then(response => {
          if (response.code == '200') {
            const result = response.result
            const userInfo = result.userInfo
            Vue.ls.set(ACCESS_TOKEN, result.token, 7 * 24 * 60 * 60 * 1000)
            Vue.ls.set(USER_NAME, userInfo.username, 7 * 24 * 60 * 60 * 1000)
            Vue.ls.set(USER_INFO, userInfo, 7 * 24 * 60 * 60 * 1000)
            Vue.ls.set(UI_CACHE_DB_DICT_DATA, result.sysAllDictItems, 7 * 24 * 60 * 60 * 1000)
            commit('SET_TOKEN', result.token)
            commit('SET_INFO', userInfo)
            commit('SET_NAME', { username: userInfo.username, realname: userInfo.realname, welcome: welcome() })
            commit('SET_AVATAR', userInfo.avatar)
            cacheEmployeeInfo(result)
            resolve(response)
          } else {
            reject(response)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 获取用户信息
    GetPermissionList({ commit }) {
      return new Promise((resolve, reject) => {
        // queryPermissionsByUser().then(res=>{
        //   console.log("res",res)
        // })
        //TODO xue 获取自定义按钮权限
        queryZtPermissionsByUser().then(response => {
          const menuData = response.result.menu;
          const authData = response.result.auth;
          const allAuthData = response.result.allAuth;
          //Vue.ls.set(USER_AUTH,authData);
          sessionStorage.setItem(USER_AUTH, JSON.stringify(authData));
          sessionStorage.setItem(SYS_BUTTON_AUTH, JSON.stringify(allAuthData));
          if (menuData && menuData.length > 0) {
            //update--begin--autor:qinfeng-----date:20200109------for：JEECG-63 一级菜单的子菜单全部是隐藏路由，则一级菜单不显示------
            menuData.forEach((item, index) => {
              if (item["children"]) {
                let hasChildrenMenu = item["children"].filter((i) => {
                  return !i.hidden || i.hidden == false
                })
                if (hasChildrenMenu == null || hasChildrenMenu.length == 0) {
                  item["hidden"] = true
                }
              }
            })
            //console.log(" menu show json ", menuData)
            //update--end--autor:qinfeng-----date:20200109------for：JEECG-63 一级菜单的子菜单全部是隐藏路由，则一级菜单不显示------
            commit('SET_PERMISSIONLIST', menuData)
            // 设置系统安全模式
            commit('SET_SYS_SAFE_MODE', response.result.sysSafeMode)
          } else {
            reject('getPermissionList: permissions must be a non-null array !')
          }
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    Logout({ commit, state }) {
      return new Promise((resolve) => {
        let logoutToken = state.token;
        commit('SET_TOKEN', '')
        commit('SET_PERMISSIONLIST', [])
        Vue.ls.remove(ACCESS_TOKEN)
        Vue.ls.remove(USER_INFO)
        Vue.ls.remove(USER_NAME)
        Vue.ls.remove(UI_CACHE_DB_DICT_DATA)
        Vue.ls.remove(CACHE_INCLUDED_ROUTES)
        Vue.ls.remove(TENANT_ID)
        Vue.ls.remove('perInfo')
        //console.log('logoutToken: '+ logoutToken)
        logout(logoutToken).then(() => {
          if (process.env.VUE_APP_SSO == 'true') {
            let sevice = 'http://' + window.location.host + '/'
            let serviceUrl = encodeURIComponent(sevice)
            window.location.href = process.env.VUE_APP_CAS_BASE_URL + '/logout?service=' + serviceUrl
          }
          resolve()
        }).catch(() => {
          resolve()
        })
      })
    },
    // 第三方登录
    ThirdLogin({ commit }, param) {
      return new Promise((resolve, reject) => {
        thirdLogin(param.token, param.thirdType).then(response => {
          if (response.code == '200') {
            const result = response.result
            const userInfo = result.userInfo
            Vue.ls.set(ACCESS_TOKEN, result.token, 7 * 24 * 60 * 60 * 1000)
            Vue.ls.set(USER_NAME, userInfo.username, 7 * 24 * 60 * 60 * 1000)
            Vue.ls.set(USER_INFO, userInfo, 7 * 24 * 60 * 60 * 1000)
            commit('SET_TOKEN', result.token)
            commit('SET_INFO', userInfo)
            commit('SET_NAME', { username: userInfo.username, realname: userInfo.realname, welcome: welcome() })
            commit('SET_AVATAR', userInfo.avatar)
            cacheEmployeeInfo(result)
            resolve(response)
          } else {
            reject(response)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },
    saveTenant({ commit }, id) {
      Vue.ls.set(TENANT_ID, id, 7 * 24 * 60 * 60 * 1000)
      commit('SET_TENANT', id)
    }


  }
}

export default user

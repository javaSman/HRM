/*
 * @Author: 匹诺曹 1164698177@qq.com
 * @Date: 2025-11-20 14:15:09
 * @LastEditors: 匹诺曹 1164698177@qq.com
 * @LastEditTime: 2025-11-25 16:53:58
 * @FilePath: \ztsisnew\ant-design-vue-jeecg\src\permission.js
 * @Description:
 */
import Vue from 'vue'
import router from './router'
import store from './store'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import notification from 'ant-design-vue/es/notification'
import { ACCESS_TOKEN, INDEX_MAIN_PAGE_PATH } from '@/store/mutation-types'
import { generateIndexRouter } from '@/utils/util'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = [
  '/user/login',
  '/user/register',
  '/user/register-result',
  '/user/alteration',
  '/information',
  '/personnel/onboarding/supplement',
  '/personnel/onboarding/onboardingRegister',
] // no redirect whitelist

router.beforeEach((to, from, next) => {
  //update-begin---author:scott ---date:2022-10-13  for：[jeecg-boot/issues/4091]多级路由缓存问题 #4091-----------
  //解决三级菜单无法缓存问题
  //参考： https://blog.csdn.net/qq_37322135/article/details/126013301
  //参考： https://blog.csdn.net/cwin8951/article/details/106644118
  if (to.matched && to.matched.length > 5) {
    to.matched.splice(4, to.matched.length - 5)
  }
  //update-end---author:scott ---date::2022-10-13  for：[jeecg-boot/issues/4091]多级路由缓存问题 #4091--------------

  NProgress.start() // start progress bar

  if (Vue.ls.get(ACCESS_TOKEN)) {
    /* has token */
    if (to.path === '/user/login') {
      next({ path: INDEX_MAIN_PAGE_PATH })
      NProgress.done()
    } else {
      if (store.getters.permissionList.length === 0) {
        store
          .dispatch('GetPermissionList')
          .then((res) => {
            const menuData = res.result.menu
            //console.log(res.message)
            if (menuData === null || menuData === '' || menuData === undefined) {
              return
            }
            let constRoutes = []
            constRoutes = generateIndexRouter(menuData)
            // 添加主界面路由
            store.dispatch('UpdateAppRouter', { constRoutes }).then(() => {
              // 根据roles权限生成可访问的路由表
              // 动态添加可访问路由表
              router.addRoutes(store.getters.addRouters)
              const redirect = decodeURIComponent(from.query.redirect || to.path)
              if (to.path === redirect) {
                // hack方法 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
                next({ ...to, replace: true })
              } else {
                // 跳转到目的路由
                next({ path: redirect })
              }
            })
          })
          .catch(() => {
            /* notification.error({
              message: '系统提示',
              description: '请求用户信息失败，请重试！'
            })*/
            store.dispatch('Logout').then(() => {
              next({ path: '/user/login', query: { redirect: to.fullPath } })
            })
          })
      } else {
        next()
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      if (to.path == '/information') {
        document.title = '博罗阳光采购平台-供应商注册'
      }
      // 在免登录白名单，直接进入
      next()
    } else {
      next({ path: '/user/login', query: { redirect: to.fullPath } })
      NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
    }
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})

import Vue from 'vue'
import { getAction, postAction } from '@/api/manage'
import { ACCESS_TOKEN, TENANT_ID } from '@/store/mutation-types'

const OAUTH_STATE_KEY = 'WECHAT_ENTERPRISE_OAUTH_STATE'
const LOGIN_ERROR_KEY = 'WECHAT_ENTERPRISE_LOGIN_ERROR'
const OAUTH_REQUEST_TIMEOUT = 10000

/**
 * 企业微信工作台登录。
 *
 * 工作台只会打开应用主页，不会自动调用 OAuth；因此需要由前端：
 * 1. 没有 code 时跳转到企业微信 OAuth；
 * 2. 有 code 时调用后端换取 Jeecg 的 Access-Token。
 *
 * 普通浏览器默认不触发，避免影响账号密码登录。浏览器调试时可在地址后
 * 加 ?wecom=1，或设置 VUE_APP_WECHAT_ENTERPRISE_AUTO_LOGIN=true。
 */
export async function initEnterpriseWeChatLogin() {
  const query = getQueryParams()
  // OAuth 调试回调会把 code 放在 oauthCode 参数中，禁止企微浏览器自动发起登录。
  if (query.wecomDebug === '1') {
    return { handled: false, debug: true }
  }
  const code = query.code
  const state = query.state
  const wecomMode = isWeComBrowser() || query.wecom === '1'
    || process.env.VUE_APP_WECHAT_ENTERPRISE_AUTO_LOGIN === 'true'

  // 只有企微回调带 code，或者明确处于企微模式时才处理，普通浏览器继续走原登录页。
  if (!code && !wecomMode) {
    return { handled: false }
  }

  const tenantId = getTenantId()

  if (code) {
    validateState(state)
    const response = await withTimeout(postAction('/sys/wechat/enterprise/oauth2/login', null, {
      code,
      tenantId
    }), '企业微信登录接口请求超时')
    const result = response && response.result
    const token = result && result.token
    if (!token) {
      throw new Error((response && (response.message || response.msg)) || '企业微信登录未返回平台 Token')
    }

    // 复用平台现有认证链路；permission.js 会根据该 Token 加载菜单和权限。
    Vue.ls.set(ACCESS_TOKEN, token, 7 * 24 * 60 * 60 * 1000)
    Vue.ls.set(TENANT_ID, tenantId, 7 * 24 * 60 * 60 * 1000)
    sessionStorage.removeItem(OAUTH_STATE_KEY)
    sessionStorage.removeItem(LOGIN_ERROR_KEY)
    cleanOAuthParams()
    return { handled: true, loggedIn: true, result }
  }

  // 已经登录时不要重复跳转 OAuth。
  if (Vue.ls.get(ACCESS_TOKEN)) {
    return { handled: false, loggedIn: true }
  }

  const oauthState = createState()
  sessionStorage.setItem(OAUTH_STATE_KEY, oauthState)
  sessionStorage.removeItem(LOGIN_ERROR_KEY)

  // 回调落到当前页面，保留原始路径和 redirect 参数；后端只负责生成授权地址。
  const redirectUri = getRedirectUri()
  const response = await withTimeout(getAction('/sys/wechat/enterprise/oauth2/url', {
    redirectUri,
    state: oauthState,
    tenantId
  }), '企业微信授权地址接口请求超时')
  const authorizeUrl = response && response.result
  if (!authorizeUrl) {
    throw new Error((response && (response.message || response.msg)) || '企业微信授权地址为空')
  }

  window.location.replace(authorizeUrl)
  return { handled: true, redirected: true }
}

function isWeComBrowser() {
  const userAgent = (window.navigator && window.navigator.userAgent) || ''
  return /wxwork|wecom/i.test(userAgent)
}

function getQueryParams() {
  const searchParams = new URLSearchParams(window.location.search || '')
  const result = {}
  searchParams.forEach((value, key) => {
    result[key] = value
  })
  return result
}

function getTenantId() {
  return Vue.ls.get(TENANT_ID) || 0
}

function getRedirectUri() {
  const url = new URL(window.location.href)
  url.searchParams.delete('code')
  url.searchParams.delete('state')
  url.searchParams.delete('wecom')
  return url.toString()
}

function cleanOAuthParams() {
  const url = new URL(window.location.href)
  url.searchParams.delete('code')
  url.searchParams.delete('state')
  url.searchParams.delete('wecom')
  window.history.replaceState({}, document.title, url.toString())
}

function createState() {
  return 'qr-hrm-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10)
}

function validateState(state) {
  const expectedState = sessionStorage.getItem(OAUTH_STATE_KEY)
  if (expectedState && state !== expectedState) {
    throw new Error('企业微信 OAuth state 校验失败')
  }
}

function withTimeout(promise, message) {
  let timer
  const timeout = new Promise((resolve, reject) => {
    timer = setTimeout(() => reject(new Error(message)), OAUTH_REQUEST_TIMEOUT)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

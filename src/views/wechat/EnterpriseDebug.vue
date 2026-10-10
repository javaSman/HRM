<template>
  <div class="wechat-debug-page">
    <header class="page-header">
      <div>
        <div class="eyebrow">DEVELOPER TOOLKIT</div>
        <h1>企业微信接口调试</h1>
        <p>直接调用当前项目的企业微信后端接口，使用本页面登录态和租户信息。</p>
      </div>
      <div class="header-meta">
        <a-tag color="blue">后端 {{ apiBase || '同源默认地址' }}</a-tag>
        <a-tag color="purple">tenantId {{ tenantId }}</a-tag>
      </div>
    </header>

    <a-alert
      class="notice"
      type="warning"
      show-icon
      message="调试提醒"
      description="OAuth 回调会自动返回本调试台并预填 code；手动换 Token 只显示接口响应，不写入当前浏览器登录态。登录接口仍可能建立企微与平台用户绑定，发送消息会真实发送给企微成员。"
    />

    <div class="workspace">
      <section class="request-panel">
        <a-card :bordered="false" class="tool-card">
          <div slot="title" class="card-heading">
            <span>接口请求</span>
            <a-button size="small" icon="reload" @click="resetResponse">清空响应</a-button>
          </div>

          <a-form-model layout="vertical">
            <a-form-model-item label="租户 ID">
              <a-input v-model="tenantId" placeholder="默认租户为 0" />
              <div class="field-hint">默认从平台当前登录态读取，可临时修改用于验证其他租户配置。</div>
            </a-form-model-item>
          </a-form-model>

          <a-tabs default-active-key="oauth" size="small">
            <a-tab-pane key="oauth" tab="OAuth 登录">
              <div class="endpoint-label">GET /sys/wechat/enterprise/oauth2/url</div>
              <a-form-model layout="vertical">
                <a-form-model-item label="回调地址 redirectUri">
                  <a-input v-model="redirectUri" />
                  <div class="field-hint">默认使用本项目静态调试回调页；该域名仍需配置为企微应用的可信域名。</div>
                </a-form-model-item>
                <a-form-model-item label="state">
                  <a-input v-model="oauthState" />
                </a-form-model-item>
              </a-form-model>
              <a-button type="primary" :loading="loadingKey === 'oauthUrl'" @click="getOAuthUrl">
                获取授权地址
              </a-button>
              <a-button v-if="authorizeUrl" class="inline-action" @click="openAuthorizeUrl">
                在当前窗口打开企微授权
              </a-button>
              <a-divider />
              <div class="endpoint-label">POST /sys/wechat/enterprise/oauth2/login</div>
              <a-form-model layout="vertical">
                <a-form-model-item label="授权 code">
                  <a-input v-model="loginCode" placeholder="可从 OAuth 回调自动带入，也可手动粘贴" />
                </a-form-model-item>
              </a-form-model>
              <a-alert
                v-if="receivedOAuthState"
                class="tab-alert"
                type="info"
                show-icon
                :message="'OAuth 回调 state：' + receivedOAuthState"
              />
              <a-button type="primary" :loading="loadingKey === 'oauthLogin'" @click="exchangeLoginCode">
                code 换平台 Token
              </a-button>
              <div class="field-hint">此操作只显示接口返回，不会把返回的 Token 写入当前浏览器。</div>
            </a-tab-pane>

            <a-tab-pane key="jsapi" tab="JS-SDK">
              <div class="endpoint-label">GET /sys/wechat/enterprise/jsapi/config</div>
              <a-form-model layout="vertical">
                <a-form-model-item label="当前页面 URL（不含 # 后片段）">
                  <a-input v-model="jsApiUrl" />
                </a-form-model-item>
              </a-form-model>
              <a-button type="primary" :loading="loadingKey === 'jsapi'" @click="getJsApiConfig">
                获取 JS-SDK 签名配置
              </a-button>
            </a-tab-pane>

            <a-tab-pane key="contacts" tab="通讯录">
              <a-alert
                class="tab-alert"
                type="warning"
                show-icon
                message="同步会新增或更新本地部门、用户和企微绑定，不会删除本地数据。自动创建的平台用户不会自动分配角色，需管理员后续授权。"
              />
              <div class="endpoint-label">GET /sys/wechat/enterprise/contact/departments</div>
              <a-button type="primary" :loading="loadingKey === 'departments'" @click="getDepartments">
                查询部门列表
              </a-button>
              <a-popconfirm
                title="确认将当前租户企微通讯录同步到本地平台？"
                ok-text="开始同步"
                cancel-text="取消"
                @confirm="syncContacts"
              >
                <a-button class="inline-action" type="primary" ghost :loading="loadingKey === 'contactSync'">
                  同步通讯录到本地
                </a-button>
              </a-popconfirm>
              <div class="field-hint">同步依据企微部门 ID、成员 UserID 幂等更新；本地用户优先按手机号匹配，其次按企微 UserID 匹配。</div>
              <a-divider />
              <div class="endpoint-label">GET /sys/wechat/enterprise/contact/users</div>
              <a-form-model layout="vertical">
                <a-form-model-item label="部门 ID">
                  <a-input v-model="departmentId" />
                </a-form-model-item>
                <a-form-model-item label="递归查询子部门">
                  <a-switch v-model="fetchChild" />
                </a-form-model-item>
              </a-form-model>
              <a-button type="primary" :loading="loadingKey === 'users'" @click="getDepartmentUsers">
                查询部门成员
              </a-button>
            </a-tab-pane>

            <a-tab-pane key="message" tab="发送消息">
              <div class="endpoint-label">POST /sys/wechat/enterprise/message/send</div>
              <a-alert
                class="tab-alert"
                type="info"
                show-icon
                message="通知卡片使用企业微信 textcard 消息类型，可显示标题、摘要和跳转按钮。发送会真实触达企微成员。"
              />
              <a-form-model layout="vertical">
                <a-form-model-item label="消息模板">
                  <a-select v-model="messagePreset" @change="applyMessagePreset">
                    <a-select-option value="text">普通文本消息</a-select-option>
                    <a-select-option value="textcard">通知卡片（textcard）</a-select-option>
                  </a-select>
                  <div class="field-hint">收件人填写企微 UserID，多个成员用 | 分隔；AgentId 由后端从应用配置自动补充。</div>
                </a-form-model-item>
                <a-form-model-item label="请求 JSON">
                  <a-textarea v-model="messageBody" :rows="12" />
                </a-form-model-item>
              </a-form-model>
              <a-button type="primary" :loading="loadingKey === 'message'" @click="sendMessage">
                发送应用消息
              </a-button>
            </a-tab-pane>

            <a-tab-pane key="checkin" tab="打卡数据">
              <div class="endpoint-label">POST /sys/wechat/enterprise/checkin/data</div>
              <a-form-model layout="vertical">
                <a-form-model-item label="请求 JSON">
                  <a-textarea v-model="checkinBody" :rows="14" />
                </a-form-model-item>
              </a-form-model>
              <a-button type="primary" :loading="loadingKey === 'checkin'" @click="getCheckinData">
                查询打卡数据
              </a-button>
              <div class="field-hint">请求字段按企业微信打卡接口要求填写，例如时间范围、打卡类型及成员列表。</div>
            </a-tab-pane>

            <a-tab-pane key="callback" tab="回调验签">
              <div class="endpoint-label">GET /sys/wechat/enterprise/callback</div>
              <a-form-model layout="vertical">
                <a-form-model-item label="msg_signature"><a-input v-model="callback.signature" /></a-form-model-item>
                <a-form-model-item label="timestamp"><a-input v-model="callback.timestamp" /></a-form-model-item>
                <a-form-model-item label="nonce"><a-input v-model="callback.nonce" /></a-form-model-item>
                <a-form-model-item label="echostr"><a-input v-model="callback.echostr" /></a-form-model-item>
              </a-form-model>
              <a-button type="primary" :loading="loadingKey === 'callbackGet'" @click="verifyCallback">
                测试 GET 回调校验
              </a-button>
              <a-divider />
              <div class="endpoint-label">POST /sys/wechat/enterprise/callback/decrypt</div>
              <a-form-model layout="vertical">
                <a-form-model-item label="回调 XML 请求体">
                  <a-textarea v-model="callback.xml" :rows="9" placeholder="请输入包含 Encrypt 节点的 XML 密文请求体" />
                </a-form-model-item>
              </a-form-model>
              <a-button type="primary" :loading="loadingKey === 'callbackDecrypt'" @click="postCallbackDecrypt">
                验签并查看解密明文
              </a-button>
              <a-divider />
              <div class="endpoint-label">POST /sys/wechat/enterprise/callback</div>
              <a-button :loading="loadingKey === 'callbackPost'" @click="postCallback">
                测试正式回调入口（返回 success）
              </a-button>
              <div class="field-hint">需要使用真实签名和加密内容；随意填写的示例值会验签失败。解密调试接口会在响应区返回明文，不改变企微正式回调的 success 响应。</div>
            </a-tab-pane>
          </a-tabs>
        </a-card>
      </section>

      <aside class="response-panel">
        <a-card :bordered="false" class="tool-card response-card">
          <div slot="title" class="card-heading">
            <span>最近一次响应</span>
            <a-tag v-if="lastResult" :color="lastResult.error ? 'red' : 'green'">
              {{ lastResult.error ? '请求失败' : '已返回' }}
            </a-tag>
            <a-tag v-else color="default">等待请求</a-tag>
          </div>
          <div v-if="lastResult" class="response-summary">
            <div><span>接口</span><code>{{ lastResult.method }} {{ lastResult.path }}</code></div>
            <div><span>耗时</span><code>{{ lastResult.duration }} ms</code></div>
            <div><span>时间</span><code>{{ lastResult.time }}</code></div>
          </div>
          <a-alert
            v-if="lastResult && lastResult.error"
            class="request-error-alert"
            type="error"
            show-icon
            :message="lastResult.message"
          />
          <div v-if="lastResult && lastResult.request" class="payload-block">
            <div class="payload-title">请求参数</div>
            <pre>{{ pretty(lastResult.request) }}</pre>
          </div>
          <div v-if="lastResult" class="payload-block">
            <div class="payload-title">响应内容</div>
            <pre :class="{ 'error-output': lastResult.error }">{{ pretty(lastResult.data) }}</pre>
          </div>
          <a-empty v-else description="选择左侧接口并发起请求" />
        </a-card>
      </aside>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { getAction, postAction } from '@/api/manage'
import { axios } from '@/utils/request'
import { TENANT_ID } from '@/store/mutation-types'

const API_PREFIX = '/sys/wechat/enterprise'

export default {
  name: 'WeChatEnterpriseDebug',
  data () {
    const pageUrl = window.location.href.split('#')[0]
    return {
      apiBase: window._CONFIG && window._CONFIG.domianURL,
      tenantId: Vue.ls.get(TENANT_ID) || 0,
      redirectUri: window.location.origin + '/wechat-oauth-debug-callback.html',
      oauthState: 'debug-' + Date.now(),
      authorizeUrl: '',
      loginCode: new URLSearchParams(window.location.search || '').get('oauthCode') || '',
      receivedOAuthState: new URLSearchParams(window.location.search || '').get('oauthState') || '',
      jsApiUrl: pageUrl,
      departmentId: '1',
      fetchChild: false,
      messageBody: JSON.stringify({
        touser: '企微UserID',
        msgtype: 'text',
        text: { content: '企业微信接口调试消息' }
      }, null, 2),
      messagePreset: 'text',
      checkinBody: JSON.stringify({}, null, 2),
      callback: {
        signature: '',
        timestamp: '',
        nonce: '',
        echostr: '',
        xml: ''
      },
      loadingKey: '',
      lastResult: null
    }
  },
  methods: {
    requestPath () {
      const tenantId = this.tenantId === '' || this.tenantId === null ? 0 : this.tenantId
      return { tenantId }
    },
    async runRequest (key, method, path, request, requestFn) {
      const started = Date.now()
      this.loadingKey = key
      this.lastResult = null
      try {
        const data = await requestFn()
        if (data && data.success === false) {
          this.lastResult = {
            method,
            path,
            request,
            message: data.message || data.msg || '接口返回失败',
            data,
            duration: Date.now() - started,
            time: new Date().toLocaleString(),
            error: true
          }
          return
        }
        this.lastResult = {
          method,
          path,
          request,
          data,
          duration: Date.now() - started,
          time: new Date().toLocaleString(),
          error: false
        }
      } catch (error) {
        const response = error && error.response
        const responseBody = response && response.data
        const responseMessage = responseBody && (responseBody.message || responseBody.msg)
        this.lastResult = {
          method,
          path,
          request,
          message: responseMessage || (error && error.message) || '接口请求失败',
          data: response ? { httpStatus: response.status, body: responseBody } : { message: error.message || String(error) },
          duration: Date.now() - started,
          time: new Date().toLocaleString(),
          error: true
        }
      } finally {
        this.loadingKey = ''
      }
    },
    getOAuthUrl () {
      const path = API_PREFIX + '/oauth2/url'
      const params = Object.assign({
        redirectUri: this.redirectUri,
        state: this.oauthState
      }, this.requestPath())
      this.authorizeUrl = ''
      return this.runRequest('oauthUrl', 'GET', path, params, async () => {
        const response = await getAction(path, params)
        this.authorizeUrl = response && response.result ? response.result : ''
        return response
      })
    },
    openAuthorizeUrl () {
      if (this.authorizeUrl) window.location.assign(this.authorizeUrl)
    },
    exchangeLoginCode () {
      const path = API_PREFIX + '/oauth2/login'
      const params = Object.assign({ code: this.loginCode.trim() }, this.requestPath())
      return this.runRequest('oauthLogin', 'POST', path, params, () => postAction(path, null, params))
    },
    getJsApiConfig () {
      const path = API_PREFIX + '/jsapi/config'
      const params = Object.assign({ url: this.jsApiUrl.trim() }, this.requestPath())
      return this.runRequest('jsapi', 'GET', path, params, () => getAction(path, params))
    },
    getDepartments () {
      const path = API_PREFIX + '/contact/departments'
      const params = this.requestPath()
      return this.runRequest('departments', 'GET', path, params, () => getAction(path, params))
    },
    getDepartmentUsers () {
      const path = API_PREFIX + '/contact/users'
      const params = Object.assign({
        departmentId: this.departmentId,
        fetchChild: this.fetchChild
      }, this.requestPath())
      return this.runRequest('users', 'GET', path, params, () => getAction(path, params))
    },
    syncContacts () {
      const path = API_PREFIX + '/contact/sync'
      const params = this.requestPath()
      return this.runRequest('contactSync', 'POST', path, params, () => postAction(path, {}, params))
    },
    applyMessagePreset (preset) {
      let recipient = '企微UserID'
      try {
        const current = JSON.parse(this.messageBody)
        if (current && current.touser) recipient = current.touser
      } catch (error) {
        // 切换模板时用默认收件人覆盖无效 JSON，避免模板按钮无响应。
      }
      const body = preset === 'textcard'
        ? {
            touser: recipient,
            msgtype: 'textcard',
            textcard: {
              title: '平台通知',
              description: '<div class="normal">请在这里填写通知内容</div>',
              url: window.location.origin + '/dashboard/analysis',
              btntxt: '查看详情'
            }
          }
        : {
            touser: recipient,
            msgtype: 'text',
            text: { content: '企业微信接口调试消息' }
          }
      this.messageBody = JSON.stringify(body, null, 2)
    },
    parseJson (source, title) {
      try {
        return JSON.parse(source)
      } catch (error) {
        this.$message.error(title + '不是合法 JSON')
        return null
      }
    },
    sendMessage () {
      const body = this.parseJson(this.messageBody, '消息请求体')
      if (body === null) return
      const path = API_PREFIX + '/message/send'
      const params = this.requestPath()
      return this.runRequest('message', 'POST', path, { params, body }, () => postAction(path, body, params))
    },
    getCheckinData () {
      const body = this.parseJson(this.checkinBody, '打卡请求体')
      if (body === null) return
      const path = API_PREFIX + '/checkin/data'
      const params = this.requestPath()
      return this.runRequest('checkin', 'POST', path, { params, body }, () => postAction(path, body, params))
    },
    callbackParams () {
      return {
        msg_signature: this.callback.signature.trim(),
        timestamp: this.callback.timestamp.trim(),
        nonce: this.callback.nonce.trim()
      }
    },
    verifyCallback () {
      const path = API_PREFIX + '/callback'
      const params = Object.assign(this.callbackParams(), { echostr: this.callback.echostr.trim() })
      return this.runRequest('callbackGet', 'GET', path, params, () => getAction(path, params))
    },
    postCallback () {
      const path = API_PREFIX + '/callback'
      const params = this.callbackParams()
      return this.runRequest('callbackPost', 'POST', path, { params, xml: this.callback.xml }, () => axios.post(path, this.callback.xml, {
        params,
        headers: { 'Content-Type': 'application/xml' }
      }))
    },
    postCallbackDecrypt () {
      const path = API_PREFIX + '/callback/decrypt'
      const params = this.callbackParams()
      return this.runRequest('callbackDecrypt', 'POST', path, { params, xml: this.callback.xml }, () => axios.post(path, this.callback.xml, {
        params,
        headers: { 'Content-Type': 'application/xml' }
      }))
    },
    pretty (value) {
      if (typeof value === 'string') return value
      try {
        return JSON.stringify(value, null, 2)
      } catch (error) {
        return String(value)
      }
    },
    resetResponse () {
      this.lastResult = null
    }
  }
}
</script>

<style lang="less" scoped>
.wechat-debug-page {
  min-height: 100vh;
  padding: 28px;
  background: #f3f6fb;
  color: #1f2937;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  max-width: 1440px;
  margin: 0 auto 20px;

  h1 {
    margin: 3px 0 5px;
    color: #172b4d;
    font-size: 24px;
    font-weight: 650;
  }

  p { margin: 0; color: #728096; }
}

.eyebrow {
  color: #2563eb;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
}

.header-meta { display: flex; flex-wrap: wrap; justify-content: flex-end; }
.notice { max-width: 1440px; margin: 0 auto 16px; }

.workspace {
  display: grid;
  grid-template-columns: minmax(460px, 0.95fr) minmax(420px, 1.05fr);
  align-items: start;
  gap: 16px;
  max-width: 1440px;
  margin: 0 auto;
}

.tool-card { border-radius: 8px; box-shadow: 0 4px 18px rgba(25, 42, 70, 0.05); }
.response-card { position: sticky; top: 20px; }
.card-heading { display: flex; align-items: center; justify-content: space-between; }
.endpoint-label {
  margin-bottom: 14px;
  color: #365b9d;
  font-family: SFMono-Regular, Consolas, monospace;
  font-size: 12px;
}
.field-hint { margin-top: 4px; color: #8a96a8; font-size: 12px; line-height: 1.5; }
.inline-action { margin-left: 8px; }
.tab-alert { margin-bottom: 14px; }
.request-error-alert { margin-bottom: 16px; }
.response-summary { display: grid; gap: 8px; margin-bottom: 18px; }
.response-summary > div { display: flex; gap: 12px; align-items: baseline; }
.response-summary span { width: 42px; flex: 0 0 42px; color: #8995a7; font-size: 12px; }
.response-summary code { overflow-wrap: anywhere; color: #374151; }
.payload-block { margin-top: 16px; }
.payload-title { margin-bottom: 7px; color: #6b7789; font-size: 12px; font-weight: 600; }
.payload-block pre {
  max-height: 58vh;
  min-height: 96px;
  margin: 0;
  padding: 14px;
  overflow: auto;
  border: 1px solid #e6eaf0;
  border-radius: 6px;
  background: #111827;
  color: #d1e7ff;
  font-family: SFMono-Regular, Consolas, monospace;
  font-size: 12px;
  line-height: 1.65;
  white-space: pre-wrap;
  word-break: break-word;
}
.payload-block pre.error-output { color: #fecaca; }

@media (max-width: 960px) {
  .wechat-debug-page { padding: 16px; }
  .workspace { grid-template-columns: 1fr; }
  .response-card { position: static; }
}

@media (max-width: 580px) {
  .page-header { display: block; }
  .header-meta { justify-content: flex-start; margin-top: 10px; }
  .workspace { display: block; }
  .response-panel { margin-top: 14px; }
}
</style>

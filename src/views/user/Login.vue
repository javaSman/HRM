<template>
  <div class="mainbox">
    <a-alert v-if="wechatLoginError" class="wechat-login-error" type="error" show-icon :message="wechatLoginError" />

    <div class="brand">
      <!-- <div class="brand-logo">
          <img src="@/assets/qr_logo.png" alt="强瑞科技" />
        </div> -->
      <h1 class="brand-name">强瑞集团<br /><span class="brand-subtitle">欢迎登录</span></h1>
    </div>

    <a-form-model ref="form" :model="model" :rules="validatorRules" class="user-layout-login">
      <a-form-model-item required prop="username">
                  <div class="form-label">账号</div>
        <a-input v-model="model.username" size="large" placeholder="请输入帐户名 ">
          <a-icon slot="prefix" type="user" :style="{ color: 'rgba(0,0,0,.25)' }" />
        </a-input>
      </a-form-model-item>
      <a-form-model-item required prop="password">
                  <div class="form-label">密码</div>
        <a-input v-model="model.password" size="large" type="password" autocomplete="false" placeholder="请输入密码  ">
          <a-icon slot="prefix" type="lock" :style="{ color: 'rgba(0,0,0,.25)' }" />
        </a-input>
      </a-form-model-item>

      <!--    废弃     
        <a-tab-pane key="tab1" tab="账号登录">
          <div class="welcome-title">欢迎回来</div>
          <div class="welcome-subtitle">请输入您的账号信息以访问平台</div>

          <a-form-model-item required prop="username">
            <div class="input-label">用户名</div>
            <a-input v-model="model.username" size="large" placeholder="请输入您的账号">
            </a-input>
          </a-form-model-item>

          <a-form-model-item required prop="password">
            <div class="input-label">
              <span>登录密码</span>
              <router-link :to="{ name: 'alteration' }" class="forget-link">
                忘记密码?
              </router-link>
            </div>
            <a-input v-model="model.password" size="large" type="password" autocomplete="false" placeholder="请输入密码">
            </a-input>
          </a-form-model-item>

          <a-form-model-item class="remember-me-item">
            <a-checkbox @change="handleRememberMeChange" default-checked>记住登录状态</a-checkbox>
          </a-form-model-item>

          <a-form-item>
            <a-button size="large" type="primary" htmlType="submit" class="login-button" :loading="loginBtn"
              @click.stop.prevent="handleSubmit" :disabled="loginBtn">立即登录</a-button>
          </a-form-item>
        </a-tab-pane>

        <a-tab-pane key="tab2" tab="验证码登录" v-if="false">
          <div class="welcome-title">欢迎回来</div>
          <div class="welcome-subtitle">请输入您的账号信息以访问平台</div>

          <a-form-model-item required prop="mobile">
            <div class="input-label">手机号</div>
            <a-input v-model="model.mobile" size="large" placeholder="请输入手机号">
            </a-input>
          </a-form-model-item>

          <a-form-model-item required prop="captcha">
            <div class="input-label">验证码</div>
            <a-row :gutter="16">
              <a-col :span="16">
                <a-input v-model="model.captcha" size="large" placeholder="请输入验证码">
                </a-input>
              </a-col>
              <a-col :span="8">
                <a-button size="large" class="getCaptcha" :disabled="state.smsSendBtn" @click.stop.prevent="getCaptcha"
                  v-text="(!state.smsSendBtn && '获取验证码') || (state.time + ' s')"></a-button>
              </a-col>
            </a-row>
          </a-form-model-item>

          <a-form-model-item class="remember-me-item">
            <a-checkbox @change="handleRememberMeChange" default-checked>记住登录状态</a-checkbox>
          </a-form-model-item>

          <a-form-item>
            <a-button size="large" type="primary" htmlType="submit" class="login-button" :loading="loginBtn"
              @click.stop.prevent="handleSubmit" :disabled="loginBtn">立即登录</a-button>
          </a-form-item>
        </a-tab-pane>
         -->
      <!--<VerifySlider status="status" :success-fun="success"></VerifySlider>-->
      <a-form-model-item style="margin-bottom: 0">
          <div class="options-row">
            <label class="remember-me">
              <a-checkbox @change="handleRememberMeChange" default-checked>记住登录</a-checkbox>
            </label>
            <router-link :to="{ name: 'alteration' }" class="forgot-link"> 忘记密码？ </router-link>
          </div>
        </a-form-model-item>

      <a-form-item>
        <a-button
          size="large"
          type="primary"
          htmlType="submit"
          class="login-button"
          :loading="loginBtn"
          @click.stop.prevent="handleSubmit"
          :disabled="loginBtn"
          >登录</a-button
        >
      </a-form-item>
    </a-form-model>

    <two-step-captcha
      v-if="requiredTwoStepCaptcha"
      :visible="stepCaptchaVisible"
      @success="stepCaptchaSuccess"
      @cancel="stepCaptchaCancel"
    ></two-step-captcha>
    <login-select-tenant ref="loginSelect" @success="loginSelectOk"></login-select-tenant>
  </div>
</template>

<script>
import { postAction, getAction } from '@/api/manage'
import Vue from 'vue'
import { ACCESS_TOKEN, ENCRYPTED_STRING } from '@/store/mutation-types'
import { mapActions } from 'vuex'
import ThirdLogin from './third/ThirdLogin'
import LoginSelectTenant from './LoginSelectTenant'
import TwoStepCaptcha from '@/components/tools/TwoStepCaptcha'
import { encryption, getEncryptedString } from '@/utils/encryption/aesEncrypt'
import { getVariableList, timeFix } from '@/utils/util'

import VerifySlider from '@comp/common/VerifySlider'

export default {
  components: {
    LoginSelectTenant,
    TwoStepCaptcha,
    ThirdLogin,
    VerifySlider,
  },
  data() {
    return {
      model: {
        username: '',
        password: '',
        //   inputCode: ''
      },
      loginType: 0,
      validatorRules: {
        username: [{ required: true, message: '请输入用户名!' }, { validator: this.handleUsernameOrEmail }],
        password: [
          {
            required: true,
            message: '请输入密码!',
            validator: 'click',
          },
        ],

        mobile: [{ required: true, message: '请输入手机号码!' }, { validator: this.validateMobile }],
      },
      customActiveKey: 'tab1',
      requestCodeSuccess: false,
      //   randCodeImage: '',
      currdatetime: '',
      loginBtn: false,
      requiredTwoStepCaptcha: false,
      stepCaptchaVisible: false,
      //手机号登录用
      state: {
        time: 60,
        smsSendBtn: false,
      },
      encryptedString: {
        key: '',
        iv: '',
      },
      status: false,
      keyC: '',
      wechatLoginError: '',
    }
  },
  created() {
    this.currdatetime = new Date().getTime()
    this.model.rememberMe = true
    this.wechatLoginError = sessionStorage.getItem('WECHAT_ENTERPRISE_LOGIN_ERROR') || ''
    sessionStorage.removeItem('WECHAT_ENTERPRISE_LOGIN_ERROR')
    Vue.ls.remove(ACCESS_TOKEN)
    this.getRouterData()
    this.getPublicKey()
    //  this.handleChangeCheckCode();
  },
  methods: {
    success() {
      this.status = true
    },
    ...mapActions(['Login', 'Logout', 'PhoneLogin']),
    handleTabClick(key) {
      this.customActiveKey = key
    },
    handleUsernameOrEmail(rule, value, callback) {
      const regex = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/
      if (regex.test(value)) {
        this.loginType = 0
      } else {
        this.loginType = 1
      }
      callback()
    },
    /**刷新验证码*/
    /*     handleChangeCheckCode(){
        this.currdatetime = new Date().getTime();
        this.model.inputCode = ''
        getAction(`/sys/randomImage/${this.currdatetime}`).then(res=>{
          if(res.success){
       //     this.randCodeImage = res.result
            this.requestCodeSuccess=true
          }else{
            this.$message.error(res.message)
            this.requestCodeSuccess=false
          }
        }).catch(()=>{
          this.requestCodeSuccess=false
        })
      },
      */
    /**跳转到登录页面的参数-账号获取*/
    getRouterData() {
      this.$nextTick(() => {
        let temp = this.$route.params.username || this.$route.query.username || ''
        if (temp) {
          this.model['username'] = temp
        }
      })
    },
    handleRememberMeChange(e) {
      this.model.rememberMe = e.target.checked
    },
    //登录
    handleSubmit() {
      let that = this
      let loginParams = {}
      that.loginBtn = true
      // 使用账户密码登录
      if (that.customActiveKey === 'tab1') {
        this.loginByUsername()
      } else {
        this.loginByPhone()
      }
    },
    /**
     * 验证字段
     * @param arr
     * @param callback
     */
    validateFields(arr, callback) {
      let promiseArray = []
      for (let item of arr) {
        let p = new Promise((resolve, reject) => {
          this.$refs['form'].validateField(item, (err) => {
            if (!err) {
              resolve()
            } else {
              reject(err)
            }
          })
        })
        promiseArray.push(p)
      }
      Promise.all(promiseArray)
        .then(() => {
          callback()
        })
        .catch((err) => {
          callback(err)
        })
    },
    // 获取rsa公钥
    getPublicKey() {
      getAction(`/sys/login/getPublicKey`).then((res) => {
        if (res.success) {
          this.keyC = res.result
        }
      })
    },
    //账号密码登录
    loginByUsername() {
      this.validateFields(['username', 'password'], (err) => {
        if (!err) {
          // if(!this.status){
          // 	this.$message.error("请拖动滑块验证");
          // 	this.loginBtn = false;
          // 	return
          // }

          //rsa公钥加密
          const jsRsa = new this.$jsEncrypt()
          jsRsa.setPublicKey(this.keyC)
          // 后端要一起改
          // let username=encodeURIComponent(this.model.username) //转成格式 在加密
          //     username=jsRsa.encrypt(username)
          // let password=jsRsa.encrypt(this.model.password)
          // end------------

          let username = jsRsa.encrypt(this.model.username)
          username = encodeURIComponent(username)
          let password = jsRsa.encrypt(this.model.password)

          let loginParams = {
            username: username,
            password: password,
            // remember_me: this.model.rememberMe,
            // //     captcha: this.model.inputCode,
            // checkKey: this.currdatetime
          }

          console.log('登录参数', loginParams)
          this.Login(loginParams)
            .then((res) => {
              this.$refs.loginSelect.show(res.result)
            })
            .catch((err) => {
              this.requestFailed(err)
            })
        } else {
          this.loginBtn = false
        }
      })
    },
    //手机号码登录
    loginByPhone() {
      this.validateFields(['mobile', 'captcha'], (err) => {
        if (!err) {
          let loginParams = {
            mobile: this.model.mobile,
            captcha: this.model.captcha,
            remember_me: this.model.rememberMe,
          }
          console.log('登录参数', loginParams)
          this.PhoneLogin(loginParams)
            .then((res) => {
              console.log(res.result)
              this.$refs.loginSelect.show(res.result)
            })
            .catch((err) => {
              this.requestFailed(err)
            })
        } else {
          this.loginBtn = false
        }
      })
    },
    //登录后台失败
    requestFailed(err) {
      let description = ((err.response || {}).data || {}).message || err.message || '请求出现错误，请稍后再试'
      this.$notification['error']({
        message: '登录失败',
        description: description,
        duration: 4,
      })
      //密码错误后更新验证码
      // if(description.indexOf('密码错误')>0){
      //    this.handleChangeCheckCode();
      //  }
      this.loginBtn = false
    },
    loginSelectOk() {
      this.loginSuccess()
    },

    //登录成功
    async loginSuccess() {
      await getVariableList()
      this.$router.push({ path: '/dashboard/analysis' }).catch(() => {
        console.log('登录跳转首页出错,这个错误从哪里来的')
      })
      this.$notification.success({
        message: '欢迎',
        description: `${timeFix()}，欢迎回来`,
      })
      //  this.jump()
    },
    jump() {
      let data = JSON.parse(localStorage.getItem('pro__Access-Token'))
      let token = data.value
      console.log('!!!!!!!!!!!!!!!' + token)
      console.log('!!!!!!!!!!!!!!!' + window._CONFIG['blmap_base'] + token)
      // window.open(window._CONFIG['blmap_base']+token);
      // window.location.href=window._CONFIG['blmap_base']+token
      // window.location.href=window._CONFIG['blmap_base']+token;
      let dat11a = {
        Token: token,
        type: 'pc',
        'Tenant-Id': '',
        // 第三方信息
        tripartiteInfo: {
          Token: '',
          type: '',
          'Tenant-Id': '',
        },
      }
      let jsonStr = encodeURIComponent(JSON.stringify(dat11a))
      console.log('jsonStr', jsonStr)
      window.location.href = window._CONFIG['blmap_base'] + jsonStr
    },
    validateMobile(rule, value, callback) {
      if (!value || new RegExp(/^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/).test(value)) {
        callback()
      } else {
        callback('您的手机号码格式不正确!')
      }
    },
    //获取验证码
    getCaptcha(e) {
      e.preventDefault()
      let that = this
      that.validateFields(['mobile'], (err) => {
        if (!err) {
          that.state.smsSendBtn = true
          let interval = window.setInterval(() => {
            if (that.state.time-- <= 0) {
              that.state.time = 60
              that.state.smsSendBtn = false
              window.clearInterval(interval)
            }
          }, 1000)

          const hide = that.$message.loading('验证码发送中..', 0)
          let smsParams = {}
          smsParams.mobile = that.model.mobile
          smsParams.smsmode = '0'
          postAction('/sys/sms', smsParams)
            .then((res) => {
              if (!res.success) {
                setTimeout(hide, 0)
                that.cmsFailed(res.message)
              }
              console.log(res)
              setTimeout(hide, 500)
            })
            .catch((err) => {
              setTimeout(hide, 1)
              clearInterval(interval)
              that.state.time = 60
              that.state.smsSendBtn = false
              that.requestFailed(err)
            })
        }
      })
    },
    cmsFailed(err) {
      this.$notification['error']({
        message: '登录失败',
        description: err,
        duration: 4,
      })
    },
    stepCaptchaSuccess() {
      this.loginSuccess()
    },
    stepCaptchaCancel() {
      this.Logout().then(() => {
        this.loginBtn = false
        this.stepCaptchaVisible = false
      })
    },
    //获取密码加密规则
    getEncrypte() {
      var encryptedString = Vue.ls.get(ENCRYPTED_STRING)
      if (encryptedString == null) {
        getEncryptedString().then((data) => {
          this.encryptedString = data
        })
      } else {
        this.encryptedString = encryptedString
      }
    },
  },
}
</script>
<style lang="less" scoped>
/deep/.ant-tabs-ink-bar {
  display: none !important;
}
/deep/ .ant-tabs-nav .ant-tabs-tab {
  font-size: 18px;
  color: #000000;
}

.brand {
  text-align: center;
  margin-bottom: 36px;
}
.brand-name {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  margin-bottom: 8px;
  background: linear-gradient(180deg, #0482fb 0%, #026cfb 50%, #0354fb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: title-in 0.8s ease 0.4s both;
  line-height: 1.3;
}
.brand-subtitle {
  display: block;
  font-size: 1.05rem;
  font-weight: 700;
  white-space: nowrap;
  margin-top: 10px;
}

.form-label {
  display: block;
  font-size: 1rem;
  font-weight: 700;
  background: linear-gradient(180deg, #0482fb 0%, #026cfb 50%, #0354fb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: title-in 0.8s ease 0.4s both;
  margin-bottom: 8px;
  letter-spacing: 0.04em;
  line-height: 1;
}

/* ===== Options Row ===== */
.options-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 0.8rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(180deg, #0482fb 0%, #026cfb 50%, #0354fb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: title-in 0.8s ease 0.4s both;
  cursor: pointer;
}

.ant-form-item {
  /deep/ .ant-form-item-control {
    // line-height: normal;
  }
}

/* ===== Input (统一覆盖) ===== */

/deep/ .ant-input {
  color: #272727;
  font-size: 14px;
  height: 45px;
  border-radius: 12px !important;
  caret-color: #7a7a7a;

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-text-fill-color: #ffffff !important;
    -webkit-box-shadow: 0 0 0 1000px #355493 inset !important;
    transition: background-color 5000s ease-in-out 0s;
    border-color: #47629c !important;
  }

  &:hover {
    border-color: rgba(147, 197, 253, 0.35) !important;
  }

  &.ant-input-affix-wrapper-focused,
  &:focus-within {
    border-color: rgba(59, 130, 246, 0.55) !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12), 0 0 24px rgba(59, 130, 246, 0.08) !important;
  }
  &::placeholder {
    color: rgba(147, 197, 253, 0.8);
  }
}

/deep/ .ant-input-prefix {
  color: rgba(147, 197, 253, 0.8);
}

/deep/ .ant-input-affix-wrapper-focused .ant-input-prefix,
/deep/ .ant-input-affix-wrapper:focus-within .ant-input-prefix {
  color: rgba(147, 197, 253, 0.8);
}

/* ===== Ant Design Checkbox Override ===== */
/deep/ .ant-checkbox-wrapper {
  color: rgba(191, 219, 254, 0.65);
  font-size: 13px;
}

/deep/ .ant-checkbox-inner {
  background: rgba(255, 255, 255, 0.5);
  border-color: rgba(147, 197, 253, );
  border-radius: 4px;
}

/deep/ .ant-checkbox-checked .ant-checkbox-inner {
  background: #2563eb;
  border-color: #2563eb;
}


button.login-button {
  width: 100%;
  height: 50px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  background: linear-gradient(135deg, #1d4ed8, #3b82f6);
  border: none;
  color: #ffffff;
  cursor: pointer;
  letter-spacing: 0.06em;
  transition: all 0.3s ease;
  box-shadow: 0 4px 24px rgba(37, 99, 235, 0.4);
  animation: field-in 0.6s ease 0.9s both;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 32px rgba(37, 99, 235, 0.55);
    background: linear-gradient(135deg, #2563eb, #60a5fa);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 12px rgba(37, 99, 235, 0.35);
  }

  &:disabled {
    background: rgba(40, 61, 90, 0.4);
    box-shadow: none;
    cursor: not-allowed;
  }
}

.mainbox {
  /*background-image:url('../../assets/dengluk.png');*/
  width: 400px;
  height: auto;
  min-height: 375px;
  position: absolute;
  right: 12vw;
  top: 20vh;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  padding: 40px;
  box-shadow: 0 8px 40px rgba(151, 151, 151, 0.4), inset 0 1px 0 rgba(167, 167, 167, 0.04);
}

.wechat-login-error {
  margin: 8px 0 14px;
  color: #a8071a;
  text-align: left;
}


</style>
<style>
.valid-error .ant-select-selection__placeholder {
  color: #f5222d;
}
</style>

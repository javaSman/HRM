<template>
  <j-modal
    title="资料补充二维码"
    :width="440"
    :visible="visible"
    :footer="null"
    :bodyStyle="{ padding: '24px', textAlign: 'center' }"
    @cancel="close"
  >
    <div class="qr-title">新员工入职资料补充</div>
    <div class="qr-description">请使用手机扫码进入资料填写页面</div>
    <a-spin :spinning="loading">
      <div class="qr-code">
        <img v-if="qrDataUrl" :src="qrDataUrl" alt="新员工入职资料补充二维码" />
        <a-alert v-else-if="error" type="error" show-icon :message="error" />
      </div>
    </a-spin>
    <a-input v-if="qrUrl" :value="qrUrl" read-only class="qr-url" />
    <div class="qr-actions">
      <a-button v-if="error" type="primary" ghost icon="reload" @click="generate">重新生成</a-button>
      <a-button @click="close">关闭</a-button>
    </div>
  </j-modal>
</template>

<script>
import QRCode from 'qrcode'

export default {
  name: 'OnboardingQrModal',
  data() {
    return {
      visible: false,
      loading: false,
      qrDataUrl: '',
      qrUrl: '',
      error: ''
    }
  },
  methods: {
    open() {
      this.visible = true
      this.generate()
    },
    async generate() {
      this.loading = true
      this.error = ''
      this.qrDataUrl = ''
      try {
        const route = this.$router.resolve({ name: 'OnboardingSupplement' })
        this.qrUrl = new URL(route.href, window.location.origin).toString()
        this.qrDataUrl = await QRCode.toDataURL(this.qrUrl, {
          width: 360,
          margin: 2,
          errorCorrectionLevel: 'M'
        })
      } catch (error) {
        this.error = '二维码生成失败，请重试'
      } finally {
        this.loading = false
      }
    },
    close() {
      this.visible = false
    }
  }
}
</script>

<style scoped>
.qr-title { color: #333; font-size: 16px; font-weight: 600; }
.qr-description { margin: 6px 0 16px; color: #999; font-size: 12px; }
.qr-code { display: flex; width: 250px; height: 250px; margin: 0 auto 14px; align-items: center; justify-content: center; }
.qr-code img { display: block; width: 250px; height: 250px; }
.qr-url { margin-top: 4px; font-size: 12px; }
.qr-actions { display: flex; justify-content: center; gap: 8px; margin-top: 18px; }
</style>

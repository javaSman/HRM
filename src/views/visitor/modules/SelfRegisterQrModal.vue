<template>
  <j-modal
    :title="modalTitle"
    :width="440"
    :visible="visible"
    :footer="null"
    :bodyStyle="{ padding: '24px', textAlign: 'center' }"
    @cancel="close"
  >
    <div class="qr-title">{{ qrTitle }}</div>
    <div class="qr-description">请使用手机扫码进入自助登记页面</div>
    <a-spin :spinning="loading">
      <div class="qr-code">
        <img v-if="qrDataUrl" :src="qrDataUrl" :alt="qrTitle" />
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
  name: 'SelfRegisterQrModal',
  data() {
    return {
      visible: false,
      loading: false,
      qrDataUrl: '',
      qrUrl: '',
      error: '',
      type: 'visitor' // 默认为访客类型：visitor | temp
    }
  },
  computed: {
    modalTitle() {
      return this.type === 'temp' ? '劳动派遣二维码' : '自助登记二维码'
    },
    qrTitle() {
      return this.type === 'temp' ? '劳动派遣登记' : '访客自主登记'
    }
  },
  methods: {
    open(type = 'visitor') {
      this.type = type
      this.visible = true
      this.generate()
    },
    async generate() {
      this.loading = true
      this.error = ''
      this.qrDataUrl = ''
      try {
        // 根据类型生成不同的URL
        var baseUrl = new URL('/visitorRegister.html', window.location.origin)
        baseUrl.searchParams.set('type', this.type)
        this.qrUrl = baseUrl.toString()
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
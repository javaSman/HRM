<template>
  <a-modal
    title="办理退宿"
    :visible="visible"
    :width="640"
    :confirmLoading="confirmLoading"
    :maskClosable="false"
    :destroyOnClose="true"
    okText="确认退宿"
    cancelText="取消"
    centered
    :bodyStyle="{ maxHeight: '70vh', overflow: 'auto', padding: '20px 24px' }"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-spin :spinning="loading" tip="加载中...">
      <div class="sqgl-checkout-wrap">
        <!-- 退宿信息回显 -->
        <div class="sqgl-sec-title">退宿信息</div>
        <div class="sqgl-readonly-grid">
          <div class="row"><span class="k">姓名</span><span class="v">{{ form.empName || '—' }}</span></div>
          <div class="row"><span class="k">工号</span><span class="v">{{ form.empNo || '—' }}</span></div>
          <div class="row"><span class="k">宿舍号</span><span class="v">{{ dormText }}</span></div>
          <div class="row"><span class="k">退宿日期</span><span class="v">{{ form.checkoutDate }}</span></div>
        </div>

        <a-form-model ref="form" :model="form" :rules="rules" layout="vertical" style="margin-top: 16px">
          <a-form-model-item label="退宿原因" prop="reason">
            <a-textarea v-model.trim="form.reason" :rows="3" placeholder="请输入退宿原因（选填）" />
          </a-form-model-item>
          <a-form-model-item label="卫生照片">
            <a-upload
              listType="picture-card"
              accept="image/jpeg,image/png,image/gif,image/webp"
              :fileList="photoFileList"
              :action="uploadAction"
              :headers="headers"
              :data="{ biz: 'temp' }"
              :multiple="true"
              @change="handlePhotoChange"
              @preview="handlePhotoPreview"
            >
              <div v-if="photoFileList.length < 9">
                <a-icon type="camera" />
                <div class="sqgl-upload-tip">上传照片</div>
              </div>
            </a-upload>
            <div class="sqgl-hint">支持 JPG/PNG 等图片类型，可预览与删除</div>
          </a-form-model-item>
          <!-- <a-form-model-item label="备注">
            <a-textarea v-model.trim="form.checkoutRemark" :rows="2" placeholder="请输入备注（选填）" />
          </a-form-model-item> -->
        </a-form-model>
      </div>
    </a-spin>

  </a-modal>
</template>

<script>
import Vue from 'vue'
import moment from 'moment'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { putAction, getFileAccessHttpUrl } from '@/api/manage'

export default {
  name: 'DormResidentCheckoutModal',
  data() {
    return {
      visible: false,
      loading: false,
      confirmLoading: false,
      form: {
        id: '',
        empNo: '',
        empName: '',
        areaName: '',
        buildingName: '',
        roomName: '',
        checkoutDate: '',
        reason: '',
        checkoutRemark: '',
      },
      photoFileList: [],
      uploadAction: window._CONFIG['domianURL'] + '/sys/common/upload',
      headers: {},
    }
  },
  computed: {
    dormText() {
      const parts = [this.form.areaName, this.form.buildingName, this.form.roomName].filter(Boolean)
      return parts.length ? parts.join(' / ') : '—'
    },
    rules() {
      return {}
    },
  },
  created() {
    const token = Vue.ls.get(ACCESS_TOKEN)
    this.headers = { 'X-Access-Token': token }
  },
  methods: {
    open(record) {
      this.visible = true
      this.form = {
        id: record.id,
        empNo: record.empNo,
        empName: record.empName,
        areaName: record.areaName,
        buildingName: record.buildingName,
        roomName: record.roomName,
        checkoutDate: moment().format('YYYY-MM-DD HH:mm'),
        reason: '',
        checkoutRemark: record.remark || '',
      }
      this.photoFileList = []
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    },
    handlePhotoChange(info) {
      let fileList = [...info.fileList]
      if (info.file.status === 'done') {
        const resp = info.file.response || {}
        if (resp.success) {
          fileList = fileList.map((file) => {
            if (file.response && file.response.message) {
              file.url = getFileAccessHttpUrl(file.response.message)
            }
            return file
          })
        } else {
          this.$message.error(resp.message || '图片上传失败')
          fileList = fileList.filter((f) => f.uid !== info.file.uid)
        }
      } else if (info.file.status === 'error') {
        this.$message.error('图片上传失败，请稍后重试')
        fileList = fileList.filter((f) => f.uid !== info.file.uid)
      }
      this.photoFileList = fileList
    },
    handlePhotoPreview(file) {
      this.$store.dispatch('openPdf', file.url || '')
    },
    handleOk() {
      const photos = this.photoFileList
        .filter((f) => f.response && f.response.message)
        .map((f) => f.response.message)
      this.confirmLoading = true
      const params = {
        id: this.form.id,
        reason: this.form.reason,
        healthPhotos: JSON.stringify(photos),
        remark: this.form.checkoutRemark,
      }
      const query = 'id=' + encodeURIComponent(params.id) +
        '&reason=' + encodeURIComponent(params.reason || '') +
        '&healthPhotos=' + encodeURIComponent(params.healthPhotos) +
        '&remark=' + encodeURIComponent(params.remark || '')
      putAction('/sqgl/approval/resident/checkout?' + query)
        .then((res) => {
          if (res.success) {
            this.$message.success(res.message || '退宿成功！')
            this.$emit('ok')
            this.visible = false
          } else {
            this.$message.warning(res.message || '退宿失败')
          }
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>

<style lang="less" scoped>
@sqgl-primary: #2563eb;
@sqgl-primary-rgb: 37, 99, 235;
@sqgl-border: #e2e8f0;
@sqgl-muted-foreground: #64748b;
@sqgl-foreground: #1a2a3d;
@sqgl-gradient-blue: linear-gradient(135deg, #2d78ff 0%, #4a9eff 100%);

/deep/ .ant-form-item {
  margin-bottom: 12px;
}
.sqgl-sec-title {
  font-size: 12px;
  font-weight: 600;
  color: rgba(@sqgl-primary-rgb, 0.7);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 12px;
  &::before {
    content: '';
    width: 3px;
    height: 12px;
    background: @sqgl-gradient-blue;
    border-radius: 2px;
  }
}
.sqgl-readonly-grid {
  background: linear-gradient(135deg, rgba(@sqgl-primary-rgb, 0.04), rgba(@sqgl-primary-rgb, 0.012));
  border: 1px solid rgba(@sqgl-primary-rgb, 0.1);
  border-radius: 8px;
  padding: 8px 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 16px;
  .row {
    display: flex;
    gap: 8px;
    padding: 4px 0;
    font-size: 13px;
    .k {
      color: @sqgl-muted-foreground;
      flex-shrink: 0;
      font-weight: 500;
      width: 70px;
    }
    .v {
      color: @sqgl-foreground;
      font-weight: 500;
      word-break: break-all;
      flex: 1;
    }
  }
}
.sqgl-hint {
  margin-top: 6px;
  font-size: 12px;
  color: @sqgl-muted-foreground;
}
.sqgl-upload-tip {
  font-size: 12px;
  color: @sqgl-muted-foreground;
  margin-top: 4px;
}
</style>

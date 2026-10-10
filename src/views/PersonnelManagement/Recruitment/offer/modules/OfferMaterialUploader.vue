<template>
  <div class="offer-material-uploader">
    <div class="material-upload-header">
      <span><span class="required-mark">*</span>{{ label }}</span>
      <span class="material-upload-note">{{ note }}</span>
    </div>
    <a-upload
      name="file"
      type="drag"
      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
      :multiple="true"
      :action="uploadAction"
      :headers="headers"
      :data="uploadData"
      :fileList="fileList"
      :beforeUpload="beforeUpload"
      :openFileDialogOnClick="true"
      @change="handleUploadChange"
      @remove="handleRemove"
    >
      <div class="material-upload-placeholder">
        <a-icon :type="icon" class="material-upload-icon" />
        <div class="material-upload-text">{{ uploadText }}</div>
        <div class="material-upload-hint">支持 PDF / JPG / PNG 格式，文件大小不超过10MB</div>
      </div>
    </a-upload>
  </div>
</template>

<script>
import Vue from 'vue'
import { getFileAccessHttpUrl } from '@/api/manage'
import { ACCESS_TOKEN } from '@/store/mutation-types'

function getFileName(path) {
  const normalizedPath = String(path || '').replace(/\\/g, '/')
  return normalizedPath.substring(normalizedPath.lastIndexOf('/') + 1) || '附件材料'
}

export default {
  name: 'OfferMaterialUploader',
  props: {
    value: { type: Array, default: () => [] },
    label: { type: String, required: true },
    note: { type: String, default: '' },
    uploadText: { type: String, required: true },
    icon: { type: String, default: 'paper-clip' },
  },
  data() {
    return {
      uploadAction: window._CONFIG['domianURL'] + '/sys/common/upload',
      uploadData: { biz: 'temp' },
      headers: {},
      fileList: [],
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(value) {
        this.syncFileList(value)
      },
    },
  },
  created() {
    this.headers = { 'X-Access-Token': Vue.ls.get(ACCESS_TOKEN) }
  },
  methods: {
    syncFileList(value) {
      const item = Array.isArray(value) && value.length ? value[0] : null
      if (!item || !item.filePath) {
        this.fileList = []
        return
      }
      this.fileList = [
        {
          uid: '-1',
          name: item.fileName || getFileName(item.filePath),
          status: 'done',
          size: item.fileSize,
          url: getFileAccessHttpUrl(item.filePath),
          response: { success: true, message: item.filePath },
        },
      ]
    },
    beforeUpload(file) {
      const isSupported =
        ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type) || /\.(pdf|jpe?g|png)$/i.test(file.name)
      if (!isSupported) {
        this.$message.warning('仅支持 PDF、JPG、PNG 格式文件')
        return false
      }
      if (file.size / 1024 / 1024 > 10) {
        this.$message.warning('文件大小不能超过10MB')
        return false
      }
      return true
    },
    handleUploadChange(info) {
      if (!info.file.status) {
        this.syncFileList(this.value)
        return
      }
      let fileList = info.fileList.slice(-1)
      if (info.file.status === 'done') {
        const response = info.file.response || {}
        if (response.success) {
          const material = [{ fileName: info.file.name, filePath: response.message, fileSize: info.file.size }]
          fileList = fileList.map((file) => Object.assign(file, { url: getFileAccessHttpUrl(response.message) }))
          this.emitValue(material)
          this.$message.success(`${info.file.name} 上传成功`)
        } else {
          this.$message.error(response.message || `${this.label}上传失败`)
          this.syncFileList(this.value)
          return
        }
      } else if (info.file.status === 'error') {
        this.$message.error(`${this.label}上传失败，请稍后重试`)
        this.syncFileList(this.value)
        return
      } else if (info.file.status === 'removed') {
        fileList = []
        this.emitValue([])
      }
      this.fileList = fileList
    },
    handleRemove() {
      this.fileList = []
      this.emitValue([])
      return true
    },
    emitValue(value) {
      this.$emit('input', value)
      this.$emit('change', value)
    },
  },
}
</script>

<style scoped lang="less">
.material-upload-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #333;
  font-size: 13px;
}
.required-mark {
  margin-right: 4px;
  color: #f5222d;
}
.material-upload-note {
  color: #999;
  font-size: 12px;
}
.offer-material-uploader /deep/ .ant-upload.ant-upload-drag {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background: #fafbfc;
}
.offer-material-uploader /deep/ .ant-upload.ant-upload-drag:hover {
  border-color: #4a7bf7;
  background: #f0f6ff;
}
.material-upload-placeholder {
  padding: 26px 20px;
  text-align: center;
}
.material-upload-icon {
  margin-bottom: 12px;
  color: #666;
  font-size: 38px;
}
.material-upload-text {
  margin-bottom: 6px;
  color: #555;
  font-size: 14px;
}
.material-upload-hint {
  color: #999;
  font-size: 12px;
}
</style>


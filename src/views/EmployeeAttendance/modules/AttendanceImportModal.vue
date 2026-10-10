<template>
  <j-modal
    title="导入考勤数据"
    :width="620"
    :visible="visible"
    :confirmLoading="uploading"
    :maskClosable="false"
    wrapClassName="attendance-rule-modal"
    :bodyStyle="modalBodyStyle"
    okText="确定"
    cancelText="取消"
    @ok="handleImport"
    @cancel="handleClose"
  >
    <!-- 模板下载 -->
    <div class="import-form-item">
      <div class="import-form-label">模板下载</div>
      <a-button class="template-btn" :loading="templateLoading" @click="handleDownloadTemplate">
        <a-icon v-if="!templateLoading" type="download" />
        下载导入模板
      </a-button>
      <div class="import-form-tip">请先下载导入模板，按模板格式填写考勤数据</div>
    </div>

    <!-- 上传文件 -->
    <div class="import-form-item">
      <div class="import-form-label"><span class="required-star">*</span>上传文件</div>
      <a-upload-dragger
        name="file"
        :multiple="false"
        accept=".xls"
        :fileList="fileList"
        :beforeUpload="beforeUpload"
        :remove="handleRemove"
      >
        <div class="upload-drag-inner">
          <a-icon type="folder" theme="filled" class="upload-folder-icon" />
          <p class="upload-drag-text">点击上传文件</p>
          <p class="upload-drag-hint">支持 .xls 格式文件</p>
        </div>
      </a-upload-dragger>
    </div>
  </j-modal>
</template>

<script>
import { postAction, downFile } from '@/api/manage'

export default {
  name: 'AttendanceImportModal',
  props: {
    importUrl: {
      type: String,
      default: '/checkin_record/checkinRecord/importExcel',
    },
    templateUrl: {
      type: String,
      default: '/checkin_record/checkinRecord/exportTemplate',
    },
  },
  data() {
    return {
      visible: false,
      uploading: false,
      templateLoading: false,
      modalBodyStyle: {
        maxHeight: 'calc(100vh - 168px)',
        overflowY: 'auto',
        padding: '20px 24px',
      },
      fileList: [],
    }
  },
  methods: {
    show() {
      this.fileList = []
      this.uploading = false
      this.visible = true
    },
    handleClose() {
      this.visible = false
    },
    // 选择文件后暂存，不自动上传；只允许一个文件
    beforeUpload(file) {
      const isXls = /\.xls$/i.test(file.name)
      if (!isXls) {
        this.$message.error('仅支持 .xls 格式文件')
        return false
      }
      if (this.fileList.length >= 1) {
        this.$message.warning('只能上传一个文件，请先移除已选文件')
        return false
      }
      this.fileList = [file]
      return false
    },
    handleRemove() {
      this.fileList = []
    },
    // 下载导入模板
    handleDownloadTemplate() {
      // TODO 模板下载接口待提供
      if (!this.templateUrl) {
        this.$message.warning('模板下载接口暂未配置')
        return
      }
      this.templateLoading = true
      downFile(this.templateUrl, {}, 'get')
        .then((data) => {
          this.templateLoading = false
          if (!data) {
            this.$message.warning('文件下载失败')
            return
          }
          const fileName = '考勤导入模板.xls'
          if (typeof window.navigator.msSaveBlob !== 'undefined') {
            window.navigator.msSaveBlob(new Blob([data], { type: 'application/vnd.ms-excel' }), fileName)
          } else {
            const url = window.URL.createObjectURL(new Blob([data], { type: 'application/vnd.ms-excel' }))
            const link = document.createElement('a')
            link.style.display = 'none'
            link.href = url
            link.setAttribute('download', fileName)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
          }
        })
        .catch(() => {
          this.templateLoading = false
        })
    },
    // 确定上传
    handleImport() {
      if (this.fileList.length === 0) {
        this.$message.warning('请先上传文件')
        return
      }
      // TODO 导入接口待提供
      if (!this.importUrl) {
        this.$message.warning('导入接口暂未配置')
        return
      }
      const formData = new FormData()
      formData.append('file', this.fileList[0])

      this.uploading = true
      postAction(this.importUrl, formData)
        .then((res) => {
          this.uploading = false
          if (res.success) {
            if (res.code === 201) {
              this.errorTip(res.message, res.result)
            } else {
              this.$message.success(res.message || '文件上传成功')
            }
            this.visible = false
            this.$emit('ok')
          } else {
            this.$message.warning(res.message || '文件上传失败')
          }
        })
        .catch(() => {
          this.uploading = false
        })
    },
    // 导入成功但存在错误数据时提示下载错误明细
    errorTip(tipMessage, result) {
      const h = this.$createElement
      // 兼容两种返回：result 为文件地址字符串，或 { msg, fileUrl, fileName } 对象
      const msg = result && typeof result === 'object' ? result.msg : ''
      let href = result && typeof result === 'object' ? result.fileUrl : result
      if (href && href.indexOf('http') !== 0) {
        href = window._CONFIG['domianURL'] + href
      }
      this.$warning({
        title: tipMessage || '导入成功,但是有错误数据!',
        content: h('div', {}, [
          msg ? h('div', msg) : null,
          h('span', '具体详情请 '),
          h('a', { attrs: { href: href, target: '_blank' } }, '点击下载'),
        ]),
        onOk() {},
      })
    },
  },
}
</script>

<style scoped lang="less">
/* 统一的 Modal 头部 / 底部样式（参考 ScheduleImportModal） */
::v-deep .attendance-rule-modal .ant-modal-content {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(45, 120, 255, 0.12), 0 0 40px rgba(45, 120, 255, 0.04);
}

::v-deep .attendance-rule-modal .ant-modal-header {
  padding: 16px 24px;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  border-bottom: 0;
}

::v-deep .attendance-rule-modal .ant-modal-title,
::v-deep .attendance-rule-modal .j-modal-title-row .left {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

::v-deep .attendance-rule-modal .ant-modal-close {
  top: 10px;
  right: 14px;
  width: 32px;
  height: 32px;
  color: #fff;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

::v-deep .attendance-rule-modal .ant-modal-close:hover {
  background: rgba(255, 255, 255, 0.35);
}

::v-deep .attendance-rule-modal .ant-modal-close-x {
  width: 32px;
  height: 32px;
  line-height: 32px;
}

::v-deep .attendance-rule-modal .ant-modal-body {
  background: #f8fafc;
}

::v-deep .attendance-rule-modal .ant-modal-footer {
  padding: 14px 24px;
  border-top: 1px solid #e2e8f0;
  background: #fff;
}

::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn {
  height: 34px;
  padding: 0 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}

::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn-primary {
  border: 0;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2);
}

::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn-primary:hover,
::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn-primary:focus {
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  opacity: 0.92;
}

.import-form-item {
  margin-bottom: 24px;
}

.import-form-label {
  margin-bottom: 10px;
  color: rgba(0, 0, 0, 0.85);
  font-size: 14px;

  .required-star {
    margin-right: 4px;
    color: #f5222d;
  }
}

.import-form-tip {
  margin-top: 8px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
}

.template-btn {
  color: #2d78ff;
  border-color: #2d78ff;
  border-radius: 6px;

  &:hover,
  &:focus {
    color: #5a97ff;
    border-color: #5a97ff;
  }
}

.upload-drag-inner {
  padding: 28px 0;
}

.upload-folder-icon {
  font-size: 48px;
  color: #faad14;
}

.upload-drag-text {
  margin: 12px 0 4px;
  color: rgba(0, 0, 0, 0.75);
  font-size: 16px;
}

.upload-drag-hint {
  margin: 0;
  color: rgba(0, 0, 0, 0.45);
  font-size: 13px;
}
</style>


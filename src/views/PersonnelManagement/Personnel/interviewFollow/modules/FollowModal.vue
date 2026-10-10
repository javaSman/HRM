<template>
  <j-modal
    title="填写跟进记录"
    :width="600"
    :visible="visible"
    :confirmLoading="loading"
    @ok="handleSubmit"
    @cancel="close"
    :bodyStyle="{ padding: '24px' }"
    okText="确认提交"
  >
    <a-spin :spinning="loading">
      <a-form-model ref="form" :model="model" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 19 }">
        <!-- 跟进描述 -->
        <a-form-model-item label="跟进描述" prop="gjms">
          <a-textarea v-model="model.gjms" placeholder="请输入跟进描述..." :rows="5" :maxLength="500" />
        </a-form-model-item>

        <!-- 附件上传 -->
        <a-form-model-item label="附件上传">
          <a-upload
            name="file"
            :action="uploadUrl"
            :headers="headers"
            :fileList="fileList"
            :beforeUpload="beforeUpload"
            @change="handleUploadChange"
          >
            <div v-if="fileList.length < 1" class="upload-area">
              <a-icon type="paper-clip" style="font-size: 20px; color: #999" />
              <div class="upload-text">点击上传附件</div>
              <div class="upload-hint">支持常见格式，大小不超过10MB</div>
            </div>
          </a-upload>
        </a-form-model-item>
      </a-form-model>
    </a-spin>
  </j-modal>
</template>

<script>
import { httpAction } from '@/api/manage'
import Vue from 'vue'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import dayjs from 'dayjs'

export default {
  name: 'FollowModal',
  data() {
    return {
      visible: false,
      loading: false,
      record: '',
      model: {
        gjms: '',
      },
      fileList: [],
      uploadUrl: window._CONFIG['domianURL'] + '/sys/common/upload',
      rules: {
        gjms: [{ required: true, message: '请填写跟进描述', trigger: 'blur' }],
      },
      url: {
        follow: '/ryManage/hrmFtwtkj/edit',
      },
    }
  },
  computed: {
    headers() {
      return {
        'X-Access-Token': Vue.ls.get(ACCESS_TOKEN),
      }
    },
  },
  methods: {
    // 显示弹窗
    show(record) {
      this.record = record
      this.model = {
        gjms: '',
      }
      this.fileList = []
      this.visible = true
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
    },
    // 关闭弹窗
    close() {
      this.visible = false
      this.recordId = ''
      this.model = {
        gjms: '',
      }
      this.fileList = []
    },
    // 上传前校验
    beforeUpload(file) {
      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        this.$message.error('文件大小不能超过10MB!')
        return false
      }
      return true
    },
    // 上传变化
    handleUploadChange(info) {
      this.fileList = info.fileList
      if (info.file.status === 'done') {
        if (info.file.response.success) {
          this.$message.success('上传成功')
        } else {
          this.$message.error(info.file.response.message || '上传失败')
          this.fileList = []
        }
      } else if (info.file.status === 'error') {
        this.$message.error('上传失败')
        this.fileList = []
      }
    },
    // 提交
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.loading = true
          // 获取上传的附件路径
          let attachment = ''
          if (this.fileList.length > 0 && this.fileList[0].response) {
            attachment = this.fileList[0].response.message
          }
          // 获取当前时间，格式为年月日
          const gjsj = dayjs().format('YYYY-MM-DD')

          const params = {
            ...this.record,
            gjms: this.model.gjms,
            fj: attachment,
            gjsj: gjsj, // 跟进时间
            gjqk: '已完成',
          }
          debugger
          httpAction(this.url.follow, params, 'post')
            .then((res) => {
              if (res.success) {
                this.$message.success('跟进完成')
                this.$emit('ok')
                this.close()
              } else {
                this.$message.warning(res.message || '跟进失败')
              }
            })
            .catch((error) => {
              console.error('跟进失败:', error)
              this.$message.error('跟进失败，请稍后重试')
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    },
  },
}
</script>

<style scoped lang="less">
.upload-area {
  width: 100%;
  padding: 20px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  background: #fafafa;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s;

  &:hover {
    border-color: #1890ff;
  }

  .upload-text {
    margin-top: 8px;
    color: #666;
    font-size: 14px;
  }

  .upload-hint {
    margin-top: 4px;
    color: #999;
    font-size: 12px;
  }
}
</style>

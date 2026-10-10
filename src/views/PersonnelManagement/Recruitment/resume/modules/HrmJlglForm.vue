<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model
        slot="detail"
        ref="form"
        layout="vertical"
        :model="model"
        :rules="validatorRules"
        class="recruitment-modal-form jlgl-form"
      >
        <!-- 个人信息 -->
        <section class="form-section">
          <div class="section-head">
            <span class="section-name"><span class="title-bar"></span>个人信息</span>
          </div>

          <a-form-model-item label="简历标题" prop="jlbt">
            <a-input v-model.trim="model.jlbt" placeholder="请输入简历标题" />
          </a-form-model-item>

          <a-row :gutter="16">
            <a-col :xs="24" :sm="12" :md="6">
              <a-form-model-item label="姓名" prop="xm">
                <a-input v-model.trim="model.xm" placeholder="请输入姓名" />
              </a-form-model-item>
            </a-col>
            <a-col :xs="24" :sm="12" :md="6">
              <a-form-model-item label="性别" prop="xb">
                <a-select v-model="model.xb" allowClear placeholder="请选择性别">
                  <a-select-option value="男">男</a-select-option>
                  <a-select-option value="女">女</a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :xs="24" :sm="12" :md="6">
              <a-form-model-item label="年龄" prop="nl">
                <a-input-number v-model="model.nl" :min="0" :precision="0" placeholder="请输入年龄" style="width: 100%" />
              </a-form-model-item>
            </a-col>
            <a-col :xs="24" :sm="12" :md="6">
              <a-form-model-item label="学历" prop="xl">
                <j-dict-select-tag type="list" v-model="model.xl" dictCode="xl" placeholder="请选择学历" />
              </a-form-model-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :xs="24" :sm="12" :md="6">
              <a-form-model-item label="专业" prop="zy">
                <a-input v-model.trim="model.zy" placeholder="请输入专业" />
              </a-form-model-item>
            </a-col>
            <a-col :xs="24" :sm="12" :md="6">
              <a-form-model-item label="期望薪资(k)" prop="qwxz">
                <a-input-number v-model="model.qwxz" :min="0" :precision="0" placeholder="请输入期望薪资" style="width: 100%" />
              </a-form-model-item>
            </a-col>
            <a-col :xs="24" :sm="12" :md="6">
              <a-form-model-item label="手机号" prop="sjh">
                <a-input v-model.trim="model.sjh" placeholder="请输入手机号" />
              </a-form-model-item>
            </a-col>
            <a-col :xs="24" :sm="12" :md="6">
              <a-form-model-item label="邮箱" prop="yx">
                <a-input v-model.trim="model.yx" placeholder="请输入邮箱" />
              </a-form-model-item>
            </a-col>
          </a-row>
        </section>

        <!-- 简历附件（选填） -->
        <section class="form-section">
          <div class="section-head">
            <span class="section-name"><span class="title-bar"></span>简历附件</span>
          </div>
          <a-form-model-item prop="jlFujian">
            <div class="resume-upload-dragger">
              <a-upload
                name="file"
                type="drag"
                accept=".pdf,application/pdf"
                :multiple="false"
                :action="uploadAction"
                :headers="headers"
                :data="uploadData"
                :fileList="resumeFileList"
                :beforeUpload="beforeResumeUpload"
                :disabled="formDisabled"
                @change="handleResumeUploadChange"
                @remove="handleResumeRemove"
              >
                <div class="resume-upload-placeholder">
                  <a-icon type="paper-clip" class="resume-upload-icon" />
                  <div class="resume-upload-text">点击或拖拽上传简历PDF文件</div>
                  <div class="resume-upload-hint">支持 .pdf 格式，文件大小不超过 10MB</div>
                </div>
              </a-upload>
            </div>
          </a-form-model-item>
        </section>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>
import Vue from 'vue'
import { httpAction, getFileAccessHttpUrl } from '@/api/manage'
import { ACCESS_TOKEN } from '@/store/mutation-types'



function getFileName(path) {
  if (!path) {
    return ''
  }
  const normalizedPath = path.replace(/\\/g, '/')
  return normalizedPath.substring(normalizedPath.lastIndexOf('/') + 1) || '简历PDF'
}

export default {
  name: 'HrmJlglForm',
  props: {
    disabled: { type: Boolean, default: false },
    mainData: { type: Object, default: () => {} }
  },
  data() {
    return {
      uploadAction: window._CONFIG['domianURL'] + '/sys/common/upload',
      uploadData: { biz: 'temp' },
      headers: {},
      resumeFileList: [],
      model: {},
      confirmLoading: false,
      validatorRules: {
        jlbt: [{ required: true, message: '请输入简历标题', trigger: 'blur' }],
        xm: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        xb: [{ required: true, message: '请选择性别', trigger: 'change' }],
        nl: [{ required: true, message: '请输入年龄', trigger: 'change' }],
        xl: [{ required: true, message: '请选择学历', trigger: 'change' }],
        zy: [{ required: true, message: '请输入专业', trigger: 'blur' }],
        qwxz: [{ required: true, message: '请输入期望薪资', trigger: 'change' }],
        sjh: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
        ],
        // yx: [
        //   { required: true, message: '请输入邮箱', trigger: 'blur' },
        //   { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
        // ]
      },
      url: { add: '/zpManage/hrmMsgl/addInterview', edit: '/zpManage/hrmMsgl/edit' }
    }
  },
  created() {
    const token = Vue.ls.get(ACCESS_TOKEN)
    this.headers = { 'X-Access-Token': token }
  },
  computed: {
    formDisabled() {
      return this.disabled
    }
  },
  methods: {
    // context：新增时由表格带入岗位上下文（zpjhid 等）
    add() {
      this.model = {}
      this.resumeFileList = []
      this.clearValidate()
    },
    edit(record) {
      this.model = Object.assign({}, record )
      this.syncResumeFileList()
      this.clearValidate()
    },
    clearValidate() {
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
    },
    syncResumeFileList() {
      if (!this.model.jlFujian) {
        this.resumeFileList = []
        return
      }
      this.resumeFileList = [
        {
          uid: '-1',
          name: getFileName(this.model.jlFujian),
          status: 'done',
          url: getFileAccessHttpUrl(this.model.jlFujian),
          response: { success: true, message: this.model.jlFujian }
        }
      ]
    },
    beforeResumeUpload(file) {
      const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
      if (!isPdf) {
        this.$message.warning('仅支持 PDF 格式文件')
        return false
      }
      const isLt10M = file.size / 1024 / 1024 <= 10
      if (!isLt10M) {
        this.$message.warning('文件大小不能超过 10MB')
        return false
      }
      return true
    },
    handleResumeUploadChange(info) {
      let fileList = info.fileList.slice(-1)
      if (info.file.status === 'done') {
        const response = info.file.response || {}
        if (response.success) {
          this.model.jlFujian = response.message
          fileList = fileList.map((file) => {
            if (file.response && file.response.message) {
              file.url = getFileAccessHttpUrl(file.response.message)
            }
            return file
          })
          this.$message.success(`${info.file.name} 上传成功`)
        } else {
          this.$message.error(response.message || '简历文件上传失败')
          this.model.jlFujian = ''
          fileList = []
        }
      } else if (info.file.status === 'error') {
        this.$message.error('简历文件上传失败，请稍后重试')
        this.model.jlFujian = ''
        fileList = []
      } else if (info.file.status === 'removed') {
        this.model.jlFujian = ''
        fileList = []
      }
      this.resumeFileList = fileList
    },
    handleResumeRemove() {
      this.model.jlFujian = ''
      this.resumeFileList = []
      return true
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid) {
          this.$message.warning('请完善简历信息')
          return
        }
        this.confirmLoading = true
        const httpurl = this.model.id ? this.url.edit : this.url.add
        const method = this.model.id ? 'put' : 'post'

        this.model['dqzt'] = this.model.id ? this.model.dqzt : '待邀约' 
        this.model['zpjhid'] = this.mainData.zpjhid  
        this.model['gljlId'] = this.mainData.id  

        httpAction(httpurl, this.model, method)
          .then((res) => {
            if (res.success) {
              this.$message.success(res.message || '简历信息已保存')
              this.$emit('ok')
            } else {
              this.$message.warning(res.message || '简历信息保存失败')
            }
          })
          .catch(() => {
            this.$message.error('简历信息保存失败，请稍后重试')
          })
          .finally(() => {
            this.confirmLoading = false
          })
      })
    }
  }
}
</script>

<style scoped lang="less">
@import '../../common/recruitmentForm.less';

.jlgl-form {
  .section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .section-name {
    display: flex;
    align-items: center;
    font-size: 15px;
    font-weight: 700;
    color: #262626;
  }

  .title-bar {
    width: 4px;
    height: 15px;
    margin-right: 8px;
    border-radius: 2px;
    background: linear-gradient(180deg, #2d78ff 0%, #00b4d8 100%);
  }

  .state-tag {
    margin-right: 0;
  }
}

.resume-upload-dragger /deep/ .ant-upload.ant-upload-drag {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background: #fafbfc;
}

.resume-upload-dragger /deep/ .ant-upload.ant-upload-drag:hover {
  border-color: #2d78ff;
  background: #f0f6ff;
}

.resume-upload-placeholder {
  padding: 30px 20px;
  text-align: center;
}

.resume-upload-icon {
  margin-bottom: 12px;
  color: #2d78ff;
  font-size: 40px;
}

.resume-upload-text {
  margin-bottom: 6px;
  color: #555;
  font-size: 14px;
}

.resume-upload-hint {
  color: #999;
  font-size: 12px;
}
</style>

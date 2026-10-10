<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container>
      <a-form-model
        ref="form"
        slot="detail"
        layout="vertical"
        :model="model"
        :rules="validatorRules"
        class="recruitment-modal-form">
        <a-steps class="recruitment-form-steps" :current="currentStep">
          <a-step title="Offer信息" />
          <a-step title="审批设置" />
        </a-steps>

        <section v-show="currentStep === 0" class="form-section">
          <div class="form-section-title">
            <a-icon type="user" class="form-section-icon" />
            <span>候选人信息</span>
          </div>
          <a-row :gutter="16">
            <a-col :xs="24" :sm="8">
              <a-form-model-item label="状态" prop="zt">
                <a-input v-model.trim="model.zt"  />
              </a-form-model-item>
            </a-col>
             <a-col :xs="24" :sm="8">
              <a-form-model-item label="招聘计划ID" prop="zpjhid">
                <a-input v-model.trim="model.zpjhid" placeholder="请输入招聘计划ID" />
              </a-form-model-item>
            </a-col>
            <a-col :xs="24" :sm="8">
              <a-form-model-item label="关联简历" prop="gljl">
                <a-select
                  v-model="model.gljl"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  placeholder="请选择关联简历"
                  :loading="resumeLoading"
                  :disabled="resumeLoading"
                  :getPopupContainer="getPopupContainer"
                >
                  <a-select-option v-for="item in resumeOptions" :key="item.jlwjm" :value="item.jlwjm">
                    {{ item.jlbt }}
                  </a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :xs="24" :sm="8">
              <a-form-model-item label="姓名" prop="xm">
                <a-input v-model.trim="model.xm" placeholder="请输入姓名" />
              </a-form-model-item>
            </a-col>
            <a-col :xs="24" :sm="8">
              <a-form-model-item label="联系方式" prop="lxfs">
                <a-input v-model.trim="model.lxfs" placeholder="请输入联系方式" />
              </a-form-model-item>
            </a-col>
            <!-- <a-col :xs="24" :sm="8">
              <a-form-model-item label="公司名称" prop="gsmc">
                <a-input v-model.trim="model.gsmc" placeholder="请输入公司名称" />
              </a-form-model-item>
            </a-col> -->
          </a-row>
        </section>

        <section v-show="currentStep === 0" class="form-section">
          <div class="form-section-title">
            <a-icon type="profile" class="form-section-icon" />
            <span>岗位信息</span>
          </div>
          <a-row :gutter="16">
            <a-col :xs="24" :sm="8">
              <a-form-model-item label="所属部门" prop="dept">
                <j-select-hrm-dept
                  v-model="model.dept"
                  :fallback-label="deptFallbackLabel"
                  placeholder="请选择所属部门"
                  @change="handleDeptChange"
                  @loaded="handleDeptLoaded"
                  @allLabel="(value)=>{model.deptPath = value}"
                />
              </a-form-model-item>
            </a-col>
            <a-col :xs="24" :sm="8">
              <a-form-model-item label="岗位名称" prop="postId">
                <a-select
                  v-model="model.postId"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  :placeholder="postLoading || pendingPostId ? '岗位加载中...' : '请选择岗位名称'"
                  :disabled="postLoading || !!pendingPostId || !model.dept"
                  :loading="postLoading || !!pendingPostId"
                  :getPopupContainer="getPopupContainer"
                  @change="handlePostChange"
                >
                  <a-select-option v-for="item in postOptions" :key="item.value" :value="item.value">{{ item.label }}</a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :xs="24" :sm="8">
              <a-form-model-item label="职级名称" prop="levelId">
                <a-select
                  v-model="model.levelId"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  :placeholder="postLoading || pendingLevelId ? '职级加载中...' : '请选择职级名称'"
                  :disabled="postLoading || !!pendingLevelId || !model.postId"
                  :loading="postLoading || !!pendingLevelId"
                  :getPopupContainer="getPopupContainer"
                  @change="handlePostRankChange"
                >
                  <a-select-option v-for="item in postRankOptions" :key="item.value" :value="item.value">{{ item.label }}</a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :xs="24" :sm="8">
              <a-form-model-item label="薪资(K/月)" prop="xz">
                <a-input-number v-model="model.xz" :min="0" :precision="2" style="width: 100%" @change="handleSalaryChange" />
              </a-form-model-item>
            </a-col>
            <a-col :xs="24" :sm="8">
              <a-form-model-item label="最晚回复时间" prop="zwhfsj">
                <div v-if="model.zt === '待确认'" class="reply-time-control">
                  <a-input :value="model.zwhfsj" disabled placeholder="请选择最晚回复时间" />
                  <a-button type="primary" icon="calendar" @click="openReplyTimeModal">修改时间</a-button>
                </div>
                <a-date-picker
                  v-else
                  v-model="model.zwhfsj"
                  showTime
                  valueFormat="YYYY-MM-DD HH:mm:ss"
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder="请选择最晚回复时间"
                  style="width: 100%"
                  :getCalendarContainer="getPopupContainer"
                  @change="handleReplyTimeDirectChange"
                />
              </a-form-model-item>
            </a-col>
          </a-row>
        </section>

        <section v-show="currentStep === 0 && requiresSalaryMaterials" class="form-section">
          <div class="form-section-title">
            <a-icon type="paper-clip" class="form-section-icon" />
            <span>材料上传</span>
          </div>
          <div class="material-upload-description">月薪超过10K需上传以下材料，带 * 为必填项</div>
          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-model-item prop="lzzm">
                <offer-material-uploader
                  v-model="model.lzzm"
                  label="离职证明"
                  note="原单位开具的离职证明原件扫描件"
                  upload-text="点击或拖拽上传离职证明"
                  @change="handleMaterialChange('lzzm')"
                />
              </a-form-model-item>
            </a-col>
            <a-col :span="24">
              <a-form-model-item prop="lszm">
                <offer-material-uploader
                  v-model="model.lszm"
                  label="上家公司工资流水"
                  note="近3个月银行流水或薪资证明"
                  upload-text="点击或拖拽上传工资流水"
                  icon="money-collect"
                  @change="handleMaterialChange('lszm')"
                />
              </a-form-model-item>
            </a-col>
          </a-row>
        </section>

        <section v-show="currentStep === 1" class="form-section">
          <div class="form-section-title">
            <a-icon type="check-circle" class="form-section-icon" />
            <span>审批设置</span>
          </div>
          <div class="approver-section">
            <div class="approver-row">
              <label>审批人</label>
              <div class="approver-tags">
                <a-tag
                  v-for="item in sqrTags"
                  :key="item.value"
                  class="employee-tag-item"
                  closable
                  @close="handleEmployeeTagClose($event, 'sqr', item.value)"
                >
                  {{ item.text }}
                </a-tag>
              </div>
              <a-form-model-item class="approver-form-item" prop="sqr">
                <j-select-employee
                  v-model="model.sqr"
                  placeholder="请选择审批人"
                  value-field="name"
                  button-only
                  button-text="添加审批人"
                  button-icon="plus"
                  button-type="default"
                  @change="(value, rows) => handleSelectValue('sqr', value, rows)"
                />
              </a-form-model-item>
            </div>
            <div class="approver-row">
              <label>抄送人</label>
              <div class="approver-tags">
                <a-tag
                  v-for="item in csrTags"
                  :key="item.value"
                  class="employee-tag-item"
                  closable
                  @close="handleEmployeeTagClose($event, 'csr', item.value)"
                >
                  {{ item.text }}
                </a-tag>
              </div>
              <a-form-model-item class="approver-form-item">
                <j-select-employee
                  v-model="model.csr"
                  placeholder="请选择抄送人"
                  value-field="name"
                  button-only
                  button-text="添加抄送人"
                  button-icon="plus"
                  button-type="default"
                  @change="(value, rows) => handleSelectValue('csr', value, rows)"
                />
              </a-form-model-item>
            </div>
          </div>
        </section>
      </a-form-model>
    </j-form-container>
    <recruitment-offer-reply-time-modal ref="replyTimeModal" @ok="handleReplyTimeConfirm" />
  </a-spin>
</template>

<script>
import { getAction, httpAction } from '@/api/manage'
import OfferMaterialUploader from './OfferMaterialUploader.vue'
import RecruitmentOfferReplyTimeModal from './RecruitmentOfferReplyTimeModal.vue'
import { toMaterialFileList, toMaterialPathString } from './offerMaterialFile'

function getDateTimeText(value) {
  if (!value) {
    return ''
  }
  const text = String(value)
  return text.length === 10 ? text + ' 00:00:00' : text
}

function createDefaultModel() {
  return {
    id: '',
    xh: '',
    zt: '审批中',
    xm: '',
    lxfs: '',
    // gsmc: '',
    dept: '',
    postId: '',
    postName: '',
    levelId: '',
    levelName: '',
    zwhfsj: '',
    xz: undefined,
    zpjhid: '',
    gljl: '',
    sqr: '',
    csr: '',
    lzzm: [],
    lszm: []
  }
}

export default {
  name: 'RecruitmentOfferForm',
  components: {
    OfferMaterialUploader,
    RecruitmentOfferReplyTimeModal
  },
  data() {
    const validateMaterial = (label) => (rule, value, callback) => {
      const hasFile = Array.isArray(value) && value.some(item => item && item.filePath)
      if (Number(this.model.xz) > 10 && !hasFile) {
        callback(new Error(`请上传${label}`))
        return
      }
      callback()
    }
    return {
      currentStep: 0,
      confirmLoading: false,
      model: createDefaultModel(),
      postRows: [],
      postOptions: [],
      postRankOptions: [],
      postLoading: false,
      resumeOptions: [],
      resumeLoading: false,
      pendingPostId: '',
      pendingLevelId: '',
      pendingPostText: '',
      pendingLevelText: '',
      deptFallbackLabel: '',
      url: {
        add: '/zpManage/hrmOffergl/add',
        edit: '/zpManage/hrmOffergl/edit'
      },
      validatorRules: {
        xm: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        lxfs: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
        // gsmc: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
        dept: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
        postId: [{ required: true, message: '请选择岗位名称', trigger: 'change' }],
        // levelId: [{ required: true, message: '请选择职级名称', trigger: 'change' }],
        zwhfsj: [{ required: true, message: '请选择最晚回复时间', trigger: 'change' }],
        xz: [{ required: true, message: '请输入薪资', trigger: 'change' }],
        lzzm: [{ validator: validateMaterial('离职证明'), trigger: 'change' }],
        lszm: [{ validator: validateMaterial('上家公司工资流水'), trigger: 'change' }]
        // sqr: [{ required: true, message: '请选择审批人', trigger: 'change' }]
      }
    }
  },
  computed: {
    requiresSalaryMaterials() {
      return Number(this.model.xz) > 10
    },
    sqrTags() {
      return this.buildEmployeeTags(this.model.sqr)
    },
    csrTags() {
      return this.buildEmployeeTags(this.model.csr)
    }
  },
  methods: {
    getPopupContainer(node) {
      return node.parentNode
    },
    add() {
      this.currentStep = 0
      this.model = createDefaultModel()
      this.resetPostState()
      this.loadResumeOptions()
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
    },
    edit(record) {
      this.currentStep = 0
      const currentRecord = record || {}
      this.pendingPostId = currentRecord.postId || ''
      this.pendingLevelId = currentRecord.levelId || ''
      this.pendingPostText = currentRecord.postId_dictText || currentRecord.postName || ''
      this.pendingLevelText = currentRecord.levelId_dictText || currentRecord.levelName || ''
      this.deptFallbackLabel = currentRecord.dept_dictText || currentRecord.deptName || ''
      this.model = Object.assign(createDefaultModel(), currentRecord, {
        zt: currentRecord.zt || '审批中',
        postId: '',
        levelId: '',
        zwhfsj: getDateTimeText(currentRecord.zwhfsj),
        lzzm: toMaterialFileList(currentRecord.lzzm),
        lszm: toMaterialFileList(currentRecord.lszm)
      })
      this.postRows = []
      this.postOptions = []
      this.postRankOptions = []
      this.postLoading = false
      this.loadResumeOptions()
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
    },
    resetPostState() {
      this.postRows = []
      this.postOptions = []
      this.postRankOptions = []
      this.postLoading = false
      this.pendingPostId = ''
      this.pendingLevelId = ''
      this.pendingPostText = ''
      this.pendingLevelText = ''
      this.deptFallbackLabel = ''
    },
    loadResumeOptions() {
      this.resumeLoading = true
      this.resumeOptions = []
      getAction('/zpManage/hrmJlgl/list', {
        yyzt: '已邀约',
        column: 'createTime',
        order: 'desc',
        pageNo: 1,
        pageSize: 9999
      }).then(res => {
        if (!res || !res.success) {
          this.$message.warning((res && res.message) || '关联简历加载失败')
          return
        }
        const records = res.result && res.result.records
        if (!Array.isArray(records)) {
          this.$message.warning('关联简历数据格式异常')
          return
        }
        this.resumeOptions = records
        if (this.model.gljl && !this.resumeOptions.some(item => item.jlwjm === this.model.gljl)) {
          this.resumeOptions.unshift({ jlwjm: this.model.gljl })
        }
      }).catch(() => {
        this.$message.warning('关联简历加载失败')
      }).finally(() => {
        this.resumeLoading = false
      })
    },
    loadPostOptions(deptId) {
      const currentPostId = this.pendingPostId || this.model.postId
      const currentRankId = this.pendingLevelId || this.model.levelId
      this.postRows = []
      this.postOptions = []
      this.postRankOptions = []
      if (!deptId) {
        this.model.postId = ''
        this.model.postName = ''
        this.model.levelId = ''
        this.model.levelName = ''
        this.postLoading = false
        this.pendingPostId = ''
        this.pendingLevelId = ''
        this.pendingPostText = ''
        this.pendingLevelText = ''
        return Promise.resolve()
      }
      this.postLoading = true
      this.model.postId = ''
      this.model.levelId = ''
      return getAction('/hrJobSequence/hrJobSequence/getChildSequences', {
        deptId,
        column: 'createTime',
        order: 'desc',
        pageNo: 1,
        pageSize: 99999
      }).then(res => {
        const rows = Array.isArray(res) ? res : ((res && res.result) || [])
        this.postRows = rows
        const currentPost = rows.find(item => String(item.id) === String(currentPostId))
        this.postOptions = rows.map(item => ({
          label: item.postName,
          value: item.id
        }))
        if (currentPostId && !currentPost) {
          this.postOptions.unshift({ label: this.pendingPostText || currentPostId, value: currentPostId })
        }
        this.postRankOptions = ((currentPost && currentPost.hrJobLevels) || []).map(item => ({
          label: item.levelName,
          value: item.id
        }))
        const currentRank = this.postRankOptions.find(item => String(item.value) === String(currentRankId))
        if (currentRankId && !currentRank) {
          this.postRankOptions.unshift({ label: this.pendingLevelText || currentRankId, value: currentRankId })
        }
        this.model.postId = currentPostId || ''
        this.model.postName = currentPost ? (currentPost.postName || '') : (this.pendingPostText || this.model.postName || '')
        this.model.levelId = currentRankId || ''
        this.model.levelName = currentRank ? currentRank.label : (this.pendingLevelText || this.model.levelName || '')
        this.pendingPostId = ''
        this.pendingLevelId = ''
        this.pendingPostText = ''
        this.pendingLevelText = ''
      }).catch(() => {
        this.postRows = []
        this.postOptions = currentPostId ? [{ label: this.pendingPostText || currentPostId, value: currentPostId }] : []
        this.postRankOptions = currentRankId ? [{ label: this.pendingLevelText || currentRankId, value: currentRankId }] : []
        this.model.postId = currentPostId || ''
        this.model.postName = this.pendingPostText || this.model.postName || ''
        this.model.levelId = currentRankId || ''
        this.model.levelName = this.pendingLevelText || this.model.levelName || ''
        this.pendingPostId = ''
        this.pendingLevelId = ''
        this.pendingPostText = ''
        this.pendingLevelText = ''
      }).finally(() => {
        this.postLoading = false
      })
    },
    handleDeptChange(deptId, deptNode) {
      this.model.dept = deptId || ''
      this.deptFallbackLabel = deptNode ? deptNode.label : ''
      if (deptNode && deptNode.isFallback) {
        if (this.$refs.form) {
          this.$refs.form.clearValidate(['dept'])
        }
        return
      }
      this.model.postId = ''
      this.model.postName = ''
      this.model.levelId = ''
      this.model.levelName = ''
      this.pendingPostId = ''
      this.pendingLevelId = ''
      this.pendingPostText = ''
      this.pendingLevelText = ''
      if (this.$refs.form) {
        this.$refs.form.clearValidate(['dept'])
      }
      this.loadPostOptions(this.model.dept)
    },
    handleDeptLoaded(deptNode) {
      if (!this.model.dept || !deptNode || deptNode.isFallback) {
        return
      }
      this.deptFallbackLabel = deptNode.label
      this.loadPostOptions(this.model.dept)
    },
    handlePostChange(value) {
      const currentPost = this.postRows.find(item => String(item.id) === String(value || ''))
      this.model.postName = currentPost ? (currentPost.postName || '') : ''
      this.postRankOptions = ((currentPost && currentPost.hrJobLevels) || []).map(item => ({
        label: item.levelName,
        value: item.id
      }))
      this.model.levelId = ''
      this.model.levelName = ''
      if (this.$refs.form) {
        this.$refs.form.clearValidate(['postId'])
      }
    },
    handlePostRankChange(value) {
      const currentRank = this.postRankOptions.find(item => String(item.value) === String(value || ''))
      this.model.levelName = currentRank ? currentRank.label : ''
      if (this.$refs.form) {
        this.$refs.form.clearValidate(['levelId'])
      }
    },
    openReplyTimeModal() {
      this.$refs.replyTimeModal.open(this.model.zwhfsj)
    },
    handleReplyTimeConfirm(value) {
      this.model.zwhfsj = value || ''
      if (this.$refs.form) {
        this.$refs.form.clearValidate(['zwhfsj'])
      }
    },
    handleReplyTimeDirectChange() {
      if (this.$refs.form) {
        this.$refs.form.clearValidate(['zwhfsj'])
      }
    },
    handleSalaryChange() {
      if (!this.requiresSalaryMaterials && this.$refs.form) {
        this.$refs.form.clearValidate(['lzzm', 'lszm'])
      }
    },
    handleMaterialChange(field) {
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.validateField(field)
      })
    },
    hasMaterialFile(value) {
      return Array.isArray(value) && value.some(item => item && item.filePath)
    },
    handleSelectValue(field, value, rows) {
      this.model[field] = this.getEmployeeRowValues(rows, 'name') || value || ''
      if (this.$refs.form) {
        this.$refs.form.clearValidate([field])
      }
    },
    getEmployeeRowValues(rows, field) {
      return (rows || []).map(item => item[field]).filter(Boolean).join(',')
    },
    handleEmployeeTagClose(event, valueKey, tagValue) {
      if (event && event.preventDefault) {
        event.preventDefault()
      }
      this.removeEmployeeTag(valueKey, tagValue)
    },
    removeEmployeeTag(valueKey, tagValue) {
      const values = this.getEmployeeValueList(this.model[valueKey])
      const removeIndex = values.findIndex(item => String(item) === String(tagValue))
      if (removeIndex === -1) {
        return
      }
      values.splice(removeIndex, 1)
      this.model[valueKey] = values.join(',')
      if (this.$refs.form) {
        this.$refs.form.clearValidate([valueKey])
      }
    },
    buildEmployeeTags(value) {
      return this.getEmployeeValueList(value).map(item => ({
        value: item,
        text: item
      }))
    },
    getEmployeeValueList(value) {
      return String(value || '').split(',').map(item => item.trim()).filter(Boolean)
    },
    nextStep() {
      if (this.currentStep < 1) {
        const missingMaterial = this.requiresSalaryMaterials &&
          (!this.hasMaterialFile(this.model.lzzm) || !this.hasMaterialFile(this.model.lszm))
        if (missingMaterial) {
          this.$refs.form && this.$refs.form.validateField(['lzzm', 'lszm'])
          this.$message.warning('请上传必填材料')
          return
        }
        this.currentStep += 1
      }
    },
    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep -= 1
      }
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          this.$message.warning('请完善必填信息')
          return
        }
        this.confirmLoading = true
        const payload = Object.assign({}, this.model, {
          zt: this.model.zt || '审批中',
          zwhfsj: getDateTimeText(this.model.zwhfsj),
          lzzm: toMaterialPathString(this.model.lzzm),
          lszm: toMaterialPathString(this.model.lszm)
        })
        const httpurl = payload.id ? this.url.edit : this.url.add
        const method = payload.id ? 'put' : 'post'
        httpAction(httpurl, payload, method).then(res => {
          if (res.success) {
            this.$message.success(res.message || (payload.id ? 'Offer已更新' : 'Offer已提交'))
            this.$emit('ok')
          } else {
            this.$message.warning(res.message || 'Offer保存失败')
          }
        }).finally(() => {
          this.confirmLoading = false
        })
      })
    }
  }
}
</script>

<style scoped lang="less">
/deep/ .ant-form-item {
  margin-bottom: 8px;
}

.recruitment-form-steps {
  margin-bottom: 24px;
  padding: 8px 0 4px;
}

.form-section {
  margin-bottom: 24px;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}

.form-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
}

.form-section-icon {
  color: #4a7bf7;
  font-size: 16px;
}

.employee-tag-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-right: 0;
  margin-bottom: 0;
  padding: 0 10px;
  border: 0;
  border-radius: 14px;
  background: #e8f0fe;
  color: #4a7bf7;
  font-size: 12px;
  line-height: 24px;

  /deep/ .anticon-close {
    color: inherit;
  }
}

.approver-section {
  margin-top: 12px;
}

.approver-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 32px;
  margin-bottom: 10px;
}

.approver-row label {
  min-width: 80px;
  margin: 0;
  color: #555;
  font-size: 13px;
  font-weight: 400;
}

.approver-tags {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 24px;
}

.approver-form-item {
  margin-bottom: 0;

  /deep/ .ant-form-item-control {
    line-height: normal;
  }
}

.reply-time-control { display: flex; gap: 8px; }
.reply-time-control .ant-input { flex: 1; }
.material-upload-description { margin-bottom: 14px; color: #999; font-size: 12px; }
</style>

<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model
        ref="form"
        slot="detail"
        layout="vertical"
        :model="model"
        :rules="validatorRules"
        class="recruitment-modal-form"
      >
        <section class="form-section">
          <div class="form-section-title"><a-icon type="user" class="form-section-icon" /><span>候选人信息</span></div>
          <a-row :gutter="16">
            <a-col :xs="24" :sm="6"
              ><a-form-model-item label="姓名" prop="xm"
                ><a-input v-model.trim="model.xm" placeholder="请输入姓名" /></a-form-model-item
            ></a-col>
            <a-col :xs="24" :sm="6"
              ><a-form-model-item label="手机号" prop="sjh"
                ><a-input v-model.trim="model.sjh" placeholder="请输入手机号" /></a-form-model-item
            ></a-col>
            <a-col :xs="24" :sm="6"
              ><a-form-model-item label="性别" prop="xb"
                ><a-select v-model="model.xb" allowClear placeholder="请选择性别"
                  ><a-select-option value="男">男</a-select-option
                  ><a-select-option value="女">女</a-select-option></a-select
                ></a-form-model-item
              ></a-col
            >
            <a-col :xs="24" :sm="6"
              ><a-form-model-item label="学历" prop="xl"
                ><j-dict-select-tag
                  type="list"
                  v-model="model.xl"
                  dictCode="xl"
                  placeholder="请选择学历" /></a-form-model-item
            ></a-col>
            <a-col :xs="24" :sm="6">
              <a-form-model-item label="所属部门" prop="dept">
                <j-select-hrm-dept
                  v-model="model.dept"
                  :fallback-label="model.deptName"
                  placeholder="请选择所属部门"
                  @change="handleDeptChange"
                  @loaded="handleDeptLoaded"
                  @allLabel="(value)=>{model.deptPath = value}"
                />
              </a-form-model-item>
            </a-col>
            <a-col :xs="24" :sm="6"
              ><a-form-model-item label="岗位名称" prop="postId"
                ><a-input v-model.trim="model.postId" placeholder="请输入岗位名称" /></a-form-model-item
            ></a-col>
            <a-col :xs="24" :sm="6"
              ><a-form-model-item label="职级名称" prop="levelId"
                ><a-input v-model.trim="model.levelId" placeholder="请输入职级名称" /></a-form-model-item
            ></a-col>
            <a-col :xs="24" :sm="6"
              ><a-form-model-item label="招聘计划ID" prop="zpjhid"
                ><a-input v-model.trim="model.zpjhid" placeholder="请输入招聘计划ID" /></a-form-model-item
            ></a-col>
          </a-row>
        </section>

        <section class="form-section">
          <div class="form-section-title">
            <a-icon type="calendar" class="form-section-icon" /><span>面试安排</span>
          </div>
          <a-row :gutter="16">
            <a-col :xs="24" :sm="6"
              ><a-form-model-item label="面试状态" prop="mszt"
                ><j-dict-select-tag
                  type="list"
                  v-model="model.mszt"
                  dictCode="zpzt"
                  placeholder="请选择" /></a-form-model-item
            ></a-col>
            <a-col :xs="24" :sm="6"
              ><a-form-model-item label="面试轮次" prop="mslc"
                ><a-select v-model="model.mslc" allowClear placeholder="请选择面试轮次"
                  ><a-select-option value="初试">初试</a-select-option
                  ><a-select-option value="复试">复试</a-select-option
                  ><a-select-option value="终试">终试</a-select-option></a-select
                ></a-form-model-item
              ></a-col
            >
            <!-- <a-col :xs="24" :sm="6"
              >
              <a-form-model-item label="邀约人" prop="yyr"
                ><j-select-employee
                  v-model="model.yyr"
                  placeholder="请选择邀约人"
                  value-field="name"
                  button-text="添加"
                  button-icon="plus"
                  button-type="default"
                  valueField="name"
                  @change="(value, rows) => handleSelectValue('yyr', value, rows)" /></a-form-model-item
            ></a-col> -->
            <a-col :xs="24" :sm="6"
              ><a-form-model-item label="邀约时间" prop="yysj"
                ><j-date
                  v-model="model.yysj"
                  :show-time="true"
                  date-format="YYYY-MM-DD HH:mm:ss"
                  placeholder="请选择邀约时间"
                  style="width: 100%" /></a-form-model-item
            ></a-col>
            <a-col :xs="24" :sm="6"
              ><a-form-model-item label="预计面试时间" prop="yjmssj"
                ><j-date
                  v-model="model.yjmssj"
                  :show-time="true"
                  date-format="YYYY-MM-DD HH:mm:ss"
                  placeholder="请选择预计面试时间"
                  style="width: 100%" /></a-form-model-item
            ></a-col>
            <a-col :xs="24" :sm="12"
              ><a-form-model-item label="面试官" prop="msg"
                ><j-select-employee
                  v-model="model.msg"
                  placeholder="请选择面试官"
                  value-field="name"
                  button-text="添加"
                  button-icon="plus"
                  button-type="default"
                  valueField="name"
                  @change="(value, rows) => handleSelectValue('msg', value, rows)" /></a-form-model-item
            ></a-col>
            <a-col :xs="24" :sm="6"
              ><a-form-model-item label="面试形式" prop="msfs"
                ><j-dict-select-tag
                  type="list"
                  v-model="model.msfs"
                  dictCode="interview"
                  placeholder="请选择" /></a-form-model-item
            ></a-col>
            <a-col :xs="24" :sm="6"
              ><a-form-model-item label="面试地点" prop="msdd"
                ><a-input v-model.trim="model.msdd" placeholder="请输入面试地点" /></a-form-model-item
            ></a-col>
          </a-row>
        </section>

        <section class="form-section">
          <div class="form-section-title"><a-icon type="audit" class="form-section-icon" /><span>面试结果</span></div>
          <a-row :gutter="16">
            <a-col :xs="24" :sm="6"
              ><a-form-model-item label="实际面试时间" prop="sjmssj"
                ><j-date
                  v-model="model.sjmssj"
                  :show-time="true"
                  date-format="YYYY-MM-DD HH:mm:ss"
                  placeholder="请选择实际面试时间"
                  style="width: 100%" /></a-form-model-item
            ></a-col>
            <a-col :xs="24" :sm="6"
              ><a-form-model-item label="offer状态" prop="offerzt"
                ><a-input v-model.trim="model.offerzt" placeholder="请输入offer状态" /></a-form-model-item
            ></a-col>
            <a-col :xs="24" :sm="6"
              ><a-form-model-item label="入职状态" prop="rzzt"
                ><a-input v-model.trim="model.rzzt" placeholder="请输入入职状态" /></a-form-model-item
            ></a-col>
            <a-col :span="24"
              ><a-form-model-item label="面试备注" prop="msbz"
                ><a-textarea
                  v-model.trim="model.msbz"
                  :autoSize="{ minRows: 3, maxRows: 5 }"
                  placeholder="请输入面试备注" /></a-form-model-item
            ></a-col>
          </a-row>
        </section>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>
import { httpAction } from '@/api/manage'

function createDefaultModel() {
  return {
    mszt: '面试中',
    mslc: '初试',
    xm: '',
    yyr: '',
    yysj: '',
    yjmssj: '',
    sjmssj: '',
    msg: '',
    msfs: '',
    msdd: '',
    dept: '',
    deptName: '',
    companyId: '',
    deptPath: '',
    postId: '',
    levelId: '',
    sjh: '',
    xb: undefined,
    xl: '',
    offerzt: '',
    rzzt: '',
    zpjhid: '',
    msbz: '',
  }
}

export default {
  name: 'HrmMsglForm',
  props: {
    disabled: { type: Boolean, default: false, required: false },
  },
  data() {
    return {
      model: createDefaultModel(),
      confirmLoading: false,
      validatorRules: {
        dept: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
      },
      url: { add: '/zpManage/hrmMsgl/add', edit: '/zpManage/hrmMsgl/edit' },
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
    userInfo(){
      return this.$store.state.user.info
    },
  },
  methods: {
    add() {
      this.model = createDefaultModel()
      this.model.yyr = this.userInfo.realname
      this.clearValidate()
    },
    edit(record) {
      const currentRecord = record || {}
      this.model = Object.assign(createDefaultModel(), currentRecord, {
        deptName: currentRecord.deptName || currentRecord.dept_dictText || '',
      })
      this.model.yyr = this.userInfo.realname
      this.clearValidate()
    },
    clearValidate() {
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
    },
    handleSelectValue(field, value, rows) {
      this.model[field] =
        (rows || [])
          .map((item) => item.name)
          .filter(Boolean)
          .join(',') ||
        value ||
        ''
      this.$refs.form && this.$refs.form.clearValidate([field])
    },
    handleDeptChange(deptId, deptNode) {
      this.model.dept = deptId || ''
      this.model.deptName = deptNode ? deptNode.label : ''
      this.model.companyId = deptNode ? deptNode.companyId : ''
      this.$refs.form && this.$refs.form.clearValidate(['dept'])
    },
    handleDeptLoaded(deptNode) {
      if (!this.model.dept || !deptNode || deptNode.isFallback) {
        return
      }
      this.model.deptName = deptNode.label
      this.model.companyId = deptNode.companyId
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid) {
          this.$message.warning('请完善面试信息')
          return
        }
        this.confirmLoading = true
        const httpurl = this.model.id ? this.url.edit : this.url.add
        const method = this.model.id ? 'put' : 'post'
        httpAction(httpurl, this.model, method)
          .then((res) => {
            if (res.success) {
              this.$message.success(res.message || '面试信息已保存')
              this.$emit('ok')
            } else {
              this.$message.warning(res.message || '面试信息保存失败')
            }
          })
          .catch(() => {
            this.$message.error('面试信息保存失败，请稍后重试')
          })
          .finally(() => {
            this.confirmLoading = false
          })
      })
    },
  },
}
</script>

<style scoped lang="less">
@import '../../common/recruitmentForm.less';
</style>

<template>
  <a-spin :spinning="confirmLoading">
    <a-form-model ref="form" :model="model" :rules="validatorRules" class="school-modal-form">
      <section class="form-section">
        <div class="form-section-title">
          <a-icon type="team" class="form-section-icon" />
          <span>人员信息</span>
        </div>
        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-model-item label="姓名" prop="xm">
              <a-input v-model.trim="model.xm" allowClear placeholder="请输入姓名" />
            </a-form-model-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-model-item label="性别" prop="xb">
              <a-select v-model="model.xb" placeholder="请选择性别">
                <a-select-option value="男">男</a-select-option>
                <a-select-option value="女">女</a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-model-item label="职务" prop="zw">
              <a-input v-model.trim="model.zw" allowClear placeholder="请输入职务" />
            </a-form-model-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-model-item label="手机号" prop="sjh">
              <a-input v-model.trim="model.sjh" allowClear placeholder="请输入手机号" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="邮箱" prop="yx">
              <a-input v-model.trim="model.yx" allowClear placeholder="请输入邮箱" />
            </a-form-model-item>
          </a-col>
        </a-row>
      </section>
    </a-form-model>
  </a-spin>
</template>

<script>
import { httpAction } from '@/api/manage'

const createModel = hrmGxmdId => ({
  hrmGxmdId,
  xm: '',
  xb: '男',
  zw: '',
  sjh: '',
  yx: ''
})

export default {
  name: 'HrmGxmdXxryForm',
  props: {
    hrmGxmdId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      model: createModel(''),
      confirmLoading: false,
      validatorRules: {
        xm: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        sjh: [{ required: true, message: '请输入手机号', trigger: 'blur' }]
      },
      url: {
        add: '/zpManage/hrmGxmdXxry/add',
        edit: '/zpManage/hrmGxmdXxry/edit'
      }
    }
  },
  methods: {
    add() {
      this.model = createModel(this.hrmGxmdId)
      this.resetValidation()
    },
    edit(record) {
      this.model = Object.assign(createModel(this.hrmGxmdId), record, { hrmGxmdId: this.hrmGxmdId })
      this.resetValidation()
    },
    resetValidation() {
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    submitForm() {
      if (this.hrmGxmdId === '' || this.hrmGxmdId === null || this.hrmGxmdId === undefined) {
        this.$message.warning('未获取到高校 ID，无法保存学校人员')
        return
      }
      this.$refs.form.validate(valid => {
        if (!valid) return
        const payload = {
          hrmGxmdId: this.hrmGxmdId,
          xm: this.model.xm,
          xb: this.model.xb,
          zw: this.model.zw,
          sjh: this.model.sjh,
          yx: this.model.yx
        }
        if (this.model.id) payload.id = this.model.id
        this.confirmLoading = true
        httpAction(this.model.id ? this.url.edit : this.url.add, payload, this.model.id ? 'put' : 'post').then(res => {
          if (res.success) {
            this.$message.success(res.message || '保存成功')
            this.$emit('ok')
          } else {
            this.$message.warning(res.message || '学校人员保存失败')
          }
        }).catch(() => {
          this.$message.error('学校人员保存失败，请稍后重试')
        }).finally(() => {
          this.confirmLoading = false
        })
      })
    }
  }
}
</script>

<style scoped lang="less">
@import '../../modules/schoolForm.less';
</style>

<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item
              label="8:30 前入职：全天 / 半天"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              prop="entryBefore830"
            >
              <a-input v-model="model.entryBefore830" placeholder="请输入8:30 前入职：全天 / 半天"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item
              label="8:30-10:00 入职：全天 / 半天"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              prop="entry8301000"
            >
              <a-input v-model="model.entry8301000" placeholder="请输入8:30-10:00 入职：全天 / 半天"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item
              label="10:00 后入职：下午开始 / 不计"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              prop="entryAfter1000"
            >
              <a-input v-model="model.entryAfter1000" placeholder="请输入10:00 后入职：下午开始 / 不计"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item
              label="适用公司 ID（NULL 表示全集团适用）"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              prop="companyId"
            >
              <a-input v-model="model.companyId" placeholder="请输入适用公司 ID（NULL 表示全集团适用）"></a-input>
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>
import { httpAction, getAction } from '@/api/manage'
import { validateDuplicateValue } from '@/utils/util'

export default {
  name: 'HrNewEmployeeRuleForm',
  components: {},
  props: {
    //表单禁用
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  data() {
    return {
      model: {},
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      confirmLoading: false,
      validatorRules: {},
      url: {
        add: '/hr_new_employee_rule/hrNewEmployeeRule/add',
        edit: '/hr_new_employee_rule/hrNewEmployeeRule/edit',
        queryById: '/hr_new_employee_rule/hrNewEmployeeRule/queryById',
      },
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
  },
  created() {
    //备份model原始值
    this.modelDefault = JSON.parse(JSON.stringify(this.model))
  },
  methods: {
    add() {
      this.edit(this.modelDefault)
    },
    edit(record) {
      this.model = Object.assign({}, record)
      this.visible = true
    },
    submitForm() {
      const that = this
      // 触发表单验证
      this.$refs.form.validate((valid) => {
        if (valid) {
          that.confirmLoading = true
          let httpurl = ''
          let method = ''
          if (!this.model.id) {
            httpurl += this.url.add
            method = 'post'
          } else {
            httpurl += this.url.edit
            method = 'put'
          }
          httpAction(httpurl, this.model, method)
            .then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                that.$emit('ok')
              } else {
                that.$message.warning(res.message)
              }
            })
            .finally(() => {
              that.confirmLoading = false
            })
        }
      })
    },
  },
}
</script>

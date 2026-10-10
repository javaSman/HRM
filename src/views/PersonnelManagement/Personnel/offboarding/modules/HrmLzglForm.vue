<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="离职状态" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="zt">
              <a-input v-model="model.zt" placeholder="请输入离职状态"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="公司" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="companyId">
              <a-input v-model="model.companyId" placeholder="请输入公司"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="所属部门" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="dept">
              <a-input v-model="model.dept" placeholder="请输入所属部门"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="岗位名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="postId">
              <a-input v-model="model.postId" placeholder="请输入岗位名称"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="职级名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="postRank">
              <a-input v-model="model.postRank" placeholder="请输入职级名称"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="工号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="gh">
              <a-input v-model="model.gh" placeholder="请输入工号"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="姓名" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="xm">
              <a-input v-model="model.xm" placeholder="请输入姓名"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="离职原因" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="lzyy">
              <a-input v-model="model.lzyy" placeholder="请输入离职原因"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="预计离职日期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="yjlzrq">
              <a-input v-model="model.yjlzrq" placeholder="请输入预计离职日期"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="实际离职日期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="sjlzrq">
              <a-input v-model="model.sjlzrq" placeholder="请输入实际离职日期"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="申请时间" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="sqsj">
              <a-input v-model="model.sqsj" placeholder="请输入申请时间"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="审批人" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="spr">
              <a-input v-model="model.spr" placeholder="请输入审批人"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="抄送人" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="csr">
              <a-input v-model="model.csr" placeholder="请输入抄送人"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="社保账号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="sbzh">
              <a-input v-model="model.sbzh" placeholder="请输入社保账号"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="公积金账号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="gjjzh">
              <a-input v-model="model.gjjzh" placeholder="请输入公积金账号"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="入职时间" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="rzsj">
              <a-input v-model="model.rzsj" placeholder="请输入入职时间"></a-input>
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
  name: 'HrmLzglForm',
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
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      confirmLoading: false,
      validatorRules: {},
      url: {
        add: '/ryManage/hrmLzgl/add',
        edit: '/ryManage/hrmLzgl/edit',
        queryById: '/ryManage/hrmLzgl/queryById',
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

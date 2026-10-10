<template>
  <a-modal :title="title" :width="900" :visible="visible" :confirmLoading="confirmLoading" @ok="handleOk" @cancel="handleCancel" cancelText="关闭">
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item label="访客姓名" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input placeholder="请输入访客姓名" v-decorator="['visitorName', { rules: [{ required: true, message: '请输入访客姓名' }] }]" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="联系方式" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input placeholder="请输入联系方式" v-decorator="['phone', { rules: [{ required: true, pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }] }]" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="身份证号" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input placeholder="请输入身份证号" v-decorator="['idCard']" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="来访事由" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-textarea placeholder="请输入来访事由" v-decorator="['reason', { rules: [{ required: true, message: '请输入来访事由' }] }]" :rows="2" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="来访区域" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-select placeholder="请选择来访区域" v-decorator="['area', { rules: [{ required: true, message: '请选择来访区域' }] }]">
                <a-select-option value="A区">A区</a-select-option>
                <a-select-option value="B区">B区</a-select-option>
                <a-select-option value="C区">C区</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="来访时间" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-date v-decorator="['visitTime', { rules: [{ required: true, message: '请选择来访时间' }] }]" :showTime="true" dateFormat="YYYY-MM-DD HH:mm:ss" placeholder="请选择来访时间" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="被访人" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input placeholder="请输入被访人" v-decorator="['interviewee', { rules: [{ required: true, message: '请输入被访人' }] }]" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="被访部门" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-select placeholder="请选择被访部门" v-decorator="['intervieweeDept', { rules: [{ required: true, message: '请选择被访部门' }] }]">
                <a-select-option value="研发部">研发部</a-select-option>
                <a-select-option value="市场部">市场部</a-select-option>
                <a-select-option value="财务部">财务部</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="车牌号" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input placeholder="请输入车牌号" v-decorator="['carNo']" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="随行人数" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number :min="0" placeholder="请输入随行人数" v-decorator="['entourage', { initialValue: 0 }]" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
export default {
  name: 'SelfRegisterModal',
  data() {
    return {
      title: '',
      visible: false,
      confirmLoading: false,
      form: this.$form.createForm(this),
      labelCol: { xs: { span: 24 }, sm: { span: 6 } },
      wrapperCol: { xs: { span: 24 }, sm: { span: 18 } },
      model: {}
    }
  },
  methods: {
    add() {
      this.edit({})
    },
    edit(record) {
      this.model = Object.assign({}, record)
      this.visible = true
      this.$nextTick(() => {
        this.form.setFieldsValue(this.model)
      })
    },
    handleOk() {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.confirmLoading = true
          setTimeout(() => {
            this.confirmLoading = false
            this.visible = false
            this.$message.success('保存成功')
            this.$emit('ok')
          }, 1000)
        }
      })
    },
    handleCancel() {
      this.visible = false
    }
  }
}
</script>

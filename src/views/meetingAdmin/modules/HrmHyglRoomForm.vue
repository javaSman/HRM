<template>
  <a-spin :spinning="confirmLoading">
    <a-form-model ref="form" :model="model" :rules="validatorRules" layout="vertical">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-model-item label="会议室名称" prop="name">
            <a-input v-model="model.name" placeholder="请输入会议室名称" />
          </a-form-model-item>
        </a-col>
        <a-col :span="12">
          <a-form-model-item label="编号" prop="code">
            <a-input v-model="model.code" placeholder="例：HY-001" />
          </a-form-model-item>
        </a-col>
        <a-col :span="12">
          <a-form-model-item label="位置" prop="location">
            <a-input v-model="model.location" placeholder="例：A座 3层" />
          </a-form-model-item>
        </a-col>
        <a-col :span="12">
          <a-form-model-item label="最大容纳人数" prop="capacity">
            <a-input-number v-model="model.capacity" :min="1" placeholder="请输入最大容纳人数" style="width: 100%" />
          </a-form-model-item>
        </a-col>
        <a-col :span="24">
          <a-form-model-item label="备注说明" prop="description">
            <a-textarea v-model="model.description" :rows="3" placeholder="请输入会议室描述、设备配置等信息" />
          </a-form-model-item>
        </a-col>
      </a-row>
    </a-form-model>
  </a-spin>
</template>

<script>
import { httpAction } from '@/api/manage'

export default {
  name: 'HrmHyglRoomForm',
  props: {
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  data() {
    return {
      model: {},
      confirmLoading: false,
      validatorRules: {
        name: [{ required: true, message: '请输入会议室名称', trigger: 'blur' }],
        code: [{ required: true, message: '请输入编号', trigger: 'blur' }],
        location: [{ required: true, message: '请输入位置', trigger: 'blur' }],
        capacity: [{ required: true, message: '请输入最大容纳人数', trigger: 'change' }],
      },
      url: {
        add: '/hygl/hrmHyglRoom/add',
        edit: '/hygl/hrmHyglRoom/edit',
      },
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
  },
  created() {
    this.modelDefault = JSON.parse(JSON.stringify(this.model))
  },
  methods: {
    add() {
      this.edit(this.modelDefault)
    },
    edit(record) {
      this.model = Object.assign({}, record)
    },
    submitForm() {
      const that = this
      this.$refs.form.validate((valid) => {
        if (valid) {
          that.confirmLoading = true
          let httpurl = ''
          let method = ''
          if (!that.model.id) {
            httpurl = that.url.add
            method = 'post'
          } else {
            httpurl = that.url.edit
            method = 'put'
          }
          httpAction(httpurl, that.model, method)
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

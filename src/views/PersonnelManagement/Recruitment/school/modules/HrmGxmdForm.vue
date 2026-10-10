<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model
        ref="form"
        slot="detail"
        layout="vertical"
        :model="model"
        :rules="validatorRules"
        class="school-modal-form"
      >
        <section class="form-section">
          <div class="form-section-title">
            <a-icon type="bank" class="form-section-icon" />
            <span>高校信息</span>
          </div>
          <a-row :gutter="16">
            <a-col :xs="24" :sm="12">
              <a-form-model-item label="学校名称" prop="xxmc">
                <a-input v-model.trim="model.xxmc" placeholder="请输入学校名称" />
              </a-form-model-item>
            </a-col>
            <a-col :xs="24" :sm="12">
              <a-form-model-item label="联系人" prop="lxr">
                <a-input v-model.trim="model.lxr" placeholder="请输入联系人" />
              </a-form-model-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :xs="24" :sm="12">
              <a-form-model-item label="联系方式" prop="lxfs">
                <a-input v-model.trim="model.lxfs" placeholder="请输入手机号或座机号" />
              </a-form-model-item>
            </a-col>
            <a-col :xs="24" :sm="12">
              <a-form-model-item label="地址" prop="dz">
                <a-input v-model.trim="model.dz" placeholder="请输入地址" />
              </a-form-model-item>
            </a-col>
          </a-row>
          <a-form-model-item label="描述" prop="ms">
            <a-textarea
              v-model.trim="model.ms"
              :autoSize="{ minRows: 3, maxRows: 6 }"
              placeholder="请输入高校特色、合作情况等描述"
            />
          </a-form-model-item>
        </section>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>
import { httpAction } from '@/api/manage'

function createDefaultModel() {
  return {
    xxmc: '',
    lxr: '',
    lxfs: '',
    dz: '',
    ms: ''
  }
}

export default {
  name: 'HrmGxmdForm',
  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      model: createDefaultModel(),
      confirmLoading: false,
      validatorRules: {
        xxmc: [{ required: true, message: '请输入学校名称', trigger: 'blur' }],
        lxr: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
        lxfs: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
        dz: [{ required: true, message: '请输入地址', trigger: 'blur' }]
      },
      url: {
        add: '/zpManage/hrmGxmd/add',
        edit: '/zpManage/hrmGxmd/edit'
      }
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    }
  },
  methods: {
    add() {
      this.model = createDefaultModel()
      this.clearValidate()
    },
    edit(record) {
      this.model = Object.assign(createDefaultModel(), record || {})
      this.clearValidate()
    },
    clearValidate() {
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid) {
          this.$message.warning('请完善必填信息')
          return
        }
        const payload = Object.assign({}, this.model)
        const isEdit = Boolean(payload.id)
        this.confirmLoading = true
        httpAction(isEdit ? this.url.edit : this.url.add, payload, isEdit ? 'put' : 'post')
          .then((res) => {
            if (res.success) {
              this.$message.success(res.message || (isEdit ? '高校信息已更新' : '高校已新增'))
              this.$emit('ok', payload)
            } else {
              this.$message.warning(res.message || '高校信息保存失败')
            }
          })
          .catch(() => this.$message.error('高校信息保存失败，请稍后重试'))
          .finally(() => {
            this.confirmLoading = false
          })
      })
    }
  }
}
</script>

<style scoped lang="less">
@import './schoolForm.less';
</style>

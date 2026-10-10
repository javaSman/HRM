<template>
  <a-spin :spinning="confirmLoading">
    <a-form-model ref="form" :model="model" :rules="validatorRules" class="school-modal-form">
      <section class="form-section">
        <div class="form-section-title">
          <a-icon type="calendar" class="form-section-icon" />
          <span>活动信息</span>
        </div>
        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-model-item label="活动类型" prop="hdlx">
              <a-select v-model="model.hdlx" allowClear placeholder="请选择活动类型">
                <a-select-option value="宣讲会">宣讲会</a-select-option>
                <a-select-option value="招聘会">招聘会</a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-model-item label="活动时间" prop="hdsj">
              <j-date v-model="model.hdsj" dateFormat="YYYY-MM-DD" placeholder="请选择活动时间" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-model-item label="参与人数" prop="cyry">
              <a-input-number v-model="model.cyry" :min="0" :precision="0" placeholder="请输入参与人数" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-model-item label="负责人" prop="fzr">
              <a-input v-model.trim="model.fzr" allowClear placeholder="请输入负责人" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="活动照片" prop="hdzp">
              <j-image-upload v-model="model.hdzp" isMultiple />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="备注" prop="bz">
              <a-textarea v-model.trim="model.bz" :rows="4" :maxLength="500" placeholder="请输入备注" />
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
  hdlx: undefined,
  hdsj: '',
  cyry: undefined,
  fzr: '',
  hdzp: '',
  bz: ''
})

export default {
  name: 'HrmGxmdHdjlForm',
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
        hdlx: [{ required: true, message: '请选择活动类型', trigger: 'change' }],
        hdsj: [{ required: true, message: '请选择活动时间', trigger: 'change' }]
      },
      url: {
        add: '/zpManage/hrmGxmdHdjl/add',
        edit: '/zpManage/hrmGxmdHdjl/edit'
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
        this.$message.warning('未获取到高校 ID，无法保存活动记录')
        return
      }
      this.$refs.form.validate(valid => {
        if (!valid) return
        const payload = {
          hrmGxmdId: this.hrmGxmdId,
          hdlx: this.model.hdlx,
          hdsj: this.model.hdsj,
          cyry: this.model.cyry,
          fzr: this.model.fzr,
          hdzp: this.model.hdzp,
          bz: this.model.bz
        }
        if (this.model.id) payload.id = this.model.id
        this.confirmLoading = true
        httpAction(this.model.id ? this.url.edit : this.url.add, payload, this.model.id ? 'put' : 'post').then(res => {
          if (res.success) {
            this.$message.success(res.message || '保存成功')
            this.$emit('ok')
          } else {
            this.$message.warning(res.message || '活动记录保存失败')
          }
        }).catch(() => {
          this.$message.error('活动记录保存失败，请稍后重试')
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

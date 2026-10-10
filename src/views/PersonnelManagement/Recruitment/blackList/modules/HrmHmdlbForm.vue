<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model
        ref="form"
        slot="detail"
        layout="vertical"
        :model="model"
        :rules="validatorRules"
        class="blacklist-modal-form"
      >
        <section class="form-section">
          <div class="form-section-title">
            <a-icon type="user" class="form-section-icon" />
            <span>候选人信息</span>
          </div>
          <a-row :gutter="0">
            <a-row :gutter="16">
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="姓名" prop="xm">
                  <a-input v-model.trim="model.xm" placeholder="请输入姓名" />
                </a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="手机号" prop="sjh">
                  <a-input v-model.trim="model.sjh" :maxLength="11" placeholder="请输入手机号" />
                </a-form-model-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="身份证号" prop="sfzh">
                  <a-input v-model.trim="model.sfzh" :maxLength="18" placeholder="请输入身份证号" />
                </a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="黑名单等级" prop="hmddj">
                  <a-select v-model="model.hmddj" placeholder="请选择黑名单等级">
                    <a-select-option v-for="item in levelOptions" :key="item.value" :value="item.value">
                      {{ item.label }}
                    </a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="加入原因" prop="jryy">
                  <a-select v-model="model.jryy" placeholder="请选择加入原因">
                    <a-select-option v-for="item in joinReasonOptions" :key="item.value" :value="item.value">
                      {{ item.label }}
                    </a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="来源渠道" prop="lyqd">
                  <a-select v-model="model.lyqd" placeholder="请选择来源渠道">
                    <a-select-option v-for="item in sourceOptions" :key="item.value" :value="item.value">
                      {{ item.label }}
                    </a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
            </a-row>
          </a-row>
        </section>

        <section class="form-section">
          <a-form-model-item label="详细说明" prop="xxsm">
            <a-textarea
              v-model.trim="model.xxsm"
              :autoSize="{ minRows: 3, maxRows: 6 }"
              placeholder="请描述黑名单原因及经过，便于后续追溯"
            />
          </a-form-model-item>
          <div class="form-section-title">
            <a-icon type="paper-clip" class="form-section-icon" />
            <span>补充材料</span>
          </div>
          <a-form-model-item class="evidence-form-item">
            <offer-material-uploader
              v-model="model.zjfj"
              class="evidence-uploader"
              label="证据附件"
              note="支持上传相关证明材料"
              upload-text="点击或拖拽上传证据材料"
            />
          </a-form-model-item>
        </section>

        <a-alert type="warning" showIcon message="加入后该候选人无法再投递岗位；永久黑名单不可移出，请谨慎操作。" />
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>
import { httpAction } from '@/api/manage'
import OfferMaterialUploader from '../../offer/modules/OfferMaterialUploader.vue'
import { toMaterialFileList, toMaterialPathString } from '../../offer/modules/offerMaterialFile'
import {
  JOIN_REASON_OPTIONS,
  LEVEL_OPTIONS,
  SOURCE_OPTIONS,
  STATUS_ACTIVE,
  getCurrentOperator,
  getNowText,
} from '../blackListConfig'

function createDefaultModel() {
  return {
    xm: '',
    sjh: '',
    sfzh: '',
    hmddj: undefined,
    jryy: undefined,
    lyqd: undefined,
    zjfj: [],
    xxsm: '',
    jrsj: '',
    czr: '',
    ycsj: '',
    ycczr: '',
    ycyy: '',
    status: STATUS_ACTIVE,
  }
}

export default {
  name: 'HrmHmdlbForm',
  components: { OfferMaterialUploader },
  props: {
    disabled: { type: Boolean, default: false },
  },
  data() {
    return {
      model: createDefaultModel(),
      confirmLoading: false,
      levelOptions: LEVEL_OPTIONS,
      joinReasonOptions: JOIN_REASON_OPTIONS,
      sourceOptions: SOURCE_OPTIONS,
      url: {
        add: '/zpManage/hrmHmdlb/add',
        edit: '/zpManage/hrmHmdlb/edit',
      },
      validatorRules: {
        xm: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        sjh: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1\d{10}$/, message: '请输入11位手机号', trigger: 'blur' },
        ],
        sfzh: [
          { required: true, message: '请输入身份证号', trigger: 'blur' },
          { pattern: /^(\d{15}|\d{17}[\dXx])$/, message: '请输入15位或18位身份证号', trigger: 'blur' },
        ],
        hmddj: [{ required: true, message: '请选择黑名单等级', trigger: 'change' }],
        jryy: [{ required: true, message: '请选择加入原因', trigger: 'change' }],
        lyqd: [{ required: true, message: '请选择来源渠道', trigger: 'change' }],
      },
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
  },
  methods: {
    add() {
      this.model = Object.assign(createDefaultModel(), {
        jrsj: getNowText(),
        czr: getCurrentOperator(this),
      })
      this.clearValidate()
    },
    edit(record) {
      const currentRecord = record || {}
      this.model = Object.assign(createDefaultModel(), currentRecord, {
        zjfj: toMaterialFileList(currentRecord.zjfj),
        status: currentRecord.status || STATUS_ACTIVE,
      })
      this.clearValidate()
    },
    clearValidate() {
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
    },
    buildSubmitPayload() {
      return Object.assign({}, this.model, {
        zjfj: toMaterialPathString(this.model.zjfj),
        status: this.model.status || STATUS_ACTIVE,
        jrsj: this.model.jrsj || getNowText(),
        czr: this.model.czr || getCurrentOperator(this),
      })
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid) {
          this.$message.warning('请完善必填信息')
          return
        }
        const payload = this.buildSubmitPayload()
        const httpurl = payload.id ? this.url.edit : this.url.add
        const method = payload.id ? 'put' : 'post'
        this.confirmLoading = true
        httpAction(httpurl, payload, method)
          .then((res) => {
            if (res.success) {
              this.$message.success(res.message || (payload.id ? '黑名单信息已更新' : '已加入黑名单'))
              this.$emit('ok', payload)
            } else {
              this.$message.warning(res.message || '黑名单信息保存失败')
            }
          })
          .catch(() => this.$message.error('黑名单信息保存失败，请稍后重试'))
          .finally(() => {
            this.confirmLoading = false
          })
      })
    },
  },
}
</script>

<style scoped lang="less">
.blacklist-modal-form {
  min-height: 400px;
}
.blacklist-modal-form /deep/ .ant-form-item {
  margin-bottom: 8px;
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
.evidence-form-item /deep/ .ant-form-item-control {
  line-height: normal;
}
.evidence-uploader /deep/ .required-mark {
  display: none;
}
</style>


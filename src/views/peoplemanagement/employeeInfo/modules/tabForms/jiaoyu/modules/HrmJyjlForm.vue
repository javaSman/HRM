<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="dynamicValidatorRules" slot="detail" class="education-modal-form">
        <div class="education-modal-grid">
          <a-form-model-item v-if="!hasParentGhId" class="education-form-item" prop="ghId">
            <label class="education-form-label">关联员工工号</label>
            <a-input v-model="model.ghId" placeholder="请输入关联员工工号"></a-input>
          </a-form-model-item>
          <a-form-model-item class="education-form-item" prop="xlcc">
            <label class="education-form-label">学历层次</label>
            <a-select v-model="model.xlcc" placeholder="请选择学历层次">
              <a-select-option v-for="item in educationLevelOptions" :key="item" :value="item">{{
                item
              }}</a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item v-if="shouldShowDegree" class="education-form-item" prop="xw">
            <label class="education-form-label">学位</label>
            <a-select v-model="model.xw" placeholder="请选择学位">
              <a-select-option v-for="item in degreeOptions" :key="item" :value="item">{{ item }}</a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item v-if="shouldShowFullTime" class="education-form-item" prop="sfqrz">
            <label class="education-form-label">是否全日制</label>
            <a-select v-model="model.sfqrz" placeholder="请选择是否全日制">
              <a-select-option v-for="item in fullTimeOptions" :key="item" :value="item">{{ item }}</a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item class="education-form-item" prop="byyxjg">
            <label class="education-form-label">毕业院校/机构</label>
            <a-input v-model="model.byyxjg" placeholder="请输入毕业院校/机构"></a-input>
          </a-form-model-item>
          <a-form-model-item class="education-form-item" prop="zy">
            <label class="education-form-label">专业</label>
            <a-input v-model="model.zy" placeholder="请输入专业"></a-input>
          </a-form-model-item>
          <a-form-model-item class="education-form-item" prop="rxsj">
            <label class="education-form-label">入学时间</label>
            <j-date placeholder="请选择入学时间" v-model="model.rxsj" style="width: 100%" />
          </a-form-model-item>
          <a-form-model-item class="education-form-item" prop="bysj">
            <label class="education-form-label">毕业时间</label>
            <j-date placeholder="请选择毕业时间" v-model="model.bysj" style="width: 100%" />
          </a-form-model-item>
          <a-form-model-item class="education-form-item" prop="zsbh">
            <label class="education-form-label">证书编号</label>
            <a-input v-model="model.zsbh" placeholder="请输入证书编号"></a-input>
          </a-form-model-item>
          <a-form-model-item class="education-form-item education-form-item-span-2" prop="zypxnr">
            <label class="education-form-label">专业/培训内容</label>
            <a-input v-model="model.zypxnr" placeholder="请输入专业/培训内容"></a-input>
          </a-form-model-item>
          <a-form-model-item class="education-form-item education-form-item-span-2" prop="zsfj">
            <label class="education-form-label">证书附件</label>
            <!-- <a-input v-model="model.zsfj" placeholder="请输入证书编号" ></a-input> -->
            <!-- <j-upload v-model="model.zsfj"></j-upload> -->
            <JUploadList v-model="model.zsfj"></JUploadList>
          </a-form-model-item>
          <a-form-model-item
            v-if="shouldShowXueXinReport"
            class="education-form-item education-form-item-span-2"
            prop="xxwbg"
          >
            <label class="education-form-label">学信网报告</label>
            <JUploadList v-model="model.xxwbg"></JUploadList>
          </a-form-model-item>
        </div>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>
import { httpAction } from '@/api/manage'

import JUploadList from '@/components/jeecg/JUploadList.vue'
export default {
  name: 'HrmJyjlForm',
  components: {
    JUploadList,
  },
  props: {
    // 表单禁用
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
    ghId: {
      type: [String, Number],
      default: '',
    },
    localMode: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      model: {
        xw: '',
      },
      educationLevelOptions: ['小学', '初中', '高中', '中专', '大专', '本科', '硕士', '博士'],
      degreeOptions: ['学士学位', '硕士学位', '博士学位'],
      fullTimeOptions: ['是', '否'],
      confirmLoading: false,
      validatorRules: {},
      url: {
        add: '/yginfo/hrmJyjl/add',
        edit: '/yginfo/hrmJyjl/edit',
        queryById: '/yginfo/hrmJyjl/queryById',
      },
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
    normalizedGhId() {
      if (this.ghId === undefined || this.ghId === null) {
        return ''
      }
      return String(this.ghId).trim()
    },
    hasParentGhId() {
      return this.normalizedGhId !== ''
    },
    // 判断是否本科及以上学历
    isBachelorOrAbove() {
      return ['本科', '硕士', '博士'].includes(this.model.xlcc)
    },
    // 判断是否大专学历
    isCollege() {
      return this.model.xlcc === '大专'
    },
    // 判断是否需要大学层次字段（本科及以上或大专）
    needsUniversityFields() {
      return this.isBachelorOrAbove || this.isCollege
    },
    // 是否显示学位字段
    shouldShowDegree() {
      // 只有本科及以上才显示学位字段
      return this.isBachelorOrAbove
    },
    // 是否显示是否全日制字段
    shouldShowFullTime() {
      // 本科及以上或大专显示，学历层次为空时不显示
      return this.needsUniversityFields && this.model.xlcc
    },
    // 是否显示学信网报告字段
    shouldShowXueXinReport() {
      // 本科及以上或大专显示，学历层次为空时不显示
      return this.needsUniversityFields && this.model.xlcc
    },
    // 动态验证规则
    dynamicValidatorRules() {
      const rules = {}

      // 学历层次必填
      rules.xlcc = [{ required: true, message: '请选择学历层次', trigger: 'change' }]

      // 学位字段：本科及以上必填
      if (this.shouldShowDegree) {
        rules.xw = [{ required: true, message: '请选择学位', trigger: 'change' }]
      }

      // 是否全日制：本科及以上或大专必填
      if (this.shouldShowFullTime) {
        rules.sfqrz = [{ required: true, message: '请选择是否全日制', trigger: 'change' }]
      }

      // 学信网报告：本科及以上或大专必填
      if (this.shouldShowXueXinReport) {
        rules.xxwbg = [{ required: true, message: '请上传学信网报告', trigger: 'change' }]
      }

      return rules
    },
  },
  watch: {
    ghId: {
      immediate: true,
      handler() {
        this.applyParentGhId()
      },
    },
    'model.xlcc'() {
      // 当学历层次改变时，清空不再显示的字段
      if (!this.shouldShowDegree) {
        this.model.xw = ''
      }
      if (!this.shouldShowFullTime) {
        this.model.sfqrz = ''
      }
      if (!this.shouldShowXueXinReport) {
        this.model.xxwbg = ''
      }
      // 清除表单验证状态
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    },
  },
  created() {
    // 备份model原始值
    this.modelDefault = JSON.parse(JSON.stringify(this.model))
  },
  methods: {
    add(record) {
      const addRecord = Object.assign({}, this.modelDefault, record || {})
      this.edit(addRecord)
    },
    edit(record) {
      const nextModel = Object.assign({}, record)
      if (this.hasParentGhId) {
        nextModel.ghId = this.normalizedGhId
      }
      this.model = nextModel
      this.visible = true
    },
    applyParentGhId() {
      if (this.hasParentGhId) {
        this.$set(this.model, 'ghId', this.normalizedGhId)
      }
    },
    submitForm() {
      const that = this
      this.applyParentGhId()
      // 触发表单验证
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.localMode) {
            this.$emit('ok', Object.assign({}, this.model))
            return
          }
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

<style lang="less" scoped>
.education-modal-form {
  min-height: 294px;
  padding: 20px 20px 18px;

  /deep/ .j-form-container-disabled {
    cursor: default;
  }

  /deep/ .ant-form-item {
    margin-bottom: 0;
  }

  /deep/ .ant-form-item-control {
    line-height: 1;
  }

  /deep/ .ant-form-explain {
    min-height: 18px;
    padding-top: 3px;
    font-size: 11px;
    line-height: 15px;
  }

  /deep/ .ant-input,
  /deep/ .ant-calendar-picker-input {
    height: 36px;
    padding: 0 12px;
    border-color: #dbe5f2;
    border-radius: 8px;
    color: #1f2d3d;
    font-size: 13px;
    box-shadow: none;
    transition: all 0.2s ease;

    &:hover {
      border-color: rgba(37, 99, 235, 0.35);
    }

    &:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
    }
  }

  /deep/ .ant-calendar-picker {
    width: 100%;
  }
}

.education-modal-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px 16px;
}

.education-form-item {
  min-width: 0;
}
.education-form-item-span-2 {
  grid-column: span 2;
}
.education-form-label {
  display: block;
  margin-bottom: 8px;
  color: rgba(37, 99, 235, 0.62);
  font-size: 11px;
  font-weight: 700;
  line-height: 14px;
}

@media (max-width: 720px) {
  .education-modal-grid {
    grid-template-columns: 1fr;
  }
}
</style>


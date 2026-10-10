<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail" class="detail-subtab-modal-form">
        <div class="detail-subtab-modal-grid">
          <a-form-model-item v-if="!hasParentGhId" class="detail-subtab-form-item" prop="ghId">
            <label class="detail-subtab-form-label">关联员工工号</label>
            <a-input v-model="model.ghId" placeholder="请输入关联员工工号" />
          </a-form-model-item>
          <a-form-model-item class="detail-subtab-form-item" prop="ftr">
            <label class="detail-subtab-form-label">访谈人</label>
            <a-input v-model="model.ftr" placeholder="请输入访谈人" />
          </a-form-model-item>
          <a-form-model-item class="detail-subtab-form-item" prop="rtlx">
            <label class="detail-subtab-form-label">访谈类型</label>
            <a-input v-model="model.rtlx" placeholder="请输入访谈类型" />
          </a-form-model-item>
          <a-form-model-item class="detail-subtab-form-item" prop="ftsj">
            <label class="detail-subtab-form-label">访谈时间</label>
            <j-date placeholder="请选择访谈时间" v-model="model.ftsj" :show-time="true" date-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
          </a-form-model-item>
        </div>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>

  import { httpAction } from '@/api/manage'

  export default {
    name: 'HrmYgfljlForm',
    components: {
    },
    props: {
      // 表单禁用
      disabled: {
        type: Boolean,
        default: false,
        required: false
      },
      ghId: {
        type: [String, Number],
        default: ''
      }
    },
    data () {
      return {
        model: {
        },
        confirmLoading: false,
        validatorRules: {
        },
        url: {
          add: '/yginfo/hrmYgfljl/add',
          edit: '/yginfo/hrmYgfljl/edit',
          queryById: '/yginfo/hrmYgfljl/queryById'
        }
      }
    },
    computed: {
      formDisabled () {
        return this.disabled
      },
      normalizedGhId () {
        if (this.ghId === undefined || this.ghId === null) {
          return ''
        }
        return String(this.ghId).trim()
      },
      hasParentGhId () {
        return this.normalizedGhId !== ''
      }
    },
    watch: {
      ghId: {
        immediate: true,
        handler () {
          this.applyParentGhId()
        }
      }
    },
    created () {
      // 备份model原始值
      this.modelDefault = JSON.parse(JSON.stringify(this.model))
    },
    methods: {
      add (record) {
        const addRecord = Object.assign({}, this.modelDefault, record || {})
        this.edit(addRecord)
      },
      edit (record) {
        const nextModel = Object.assign({}, record)
        if (this.hasParentGhId) {
          nextModel.ghId = this.normalizedGhId
        }
        this.model = nextModel
        this.visible = true
      },
      applyParentGhId () {
        if (this.hasParentGhId) {
          this.$set(this.model, 'ghId', this.normalizedGhId)
        }
      },
      submitForm () {
        const that = this
        this.applyParentGhId()
        // 触发表单验证
        this.$refs.form.validate(valid => {
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
            httpAction(httpurl, this.model, method).then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                that.$emit('ok')
              } else {
                that.$message.warning(res.message)
              }
            }).finally(() => {
              that.confirmLoading = false
            })
          }
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .detail-subtab-modal-form {
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

    /deep/ .ant-select-selection--single {
      height: 36px;
      border-color: #dbe5f2;
      border-radius: 8px;
      box-shadow: none;
    }

    /deep/ .ant-select-selection__rendered {
      line-height: 34px;
    }
  }

  .detail-subtab-modal-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px 16px;
  }

  .detail-subtab-form-item {
    min-width: 0;
  }

  .detail-subtab-form-label {
    display: block;
    margin-bottom: 8px;
    color: rgba(37, 99, 235, 0.62);
    font-size: 11px;
    font-weight: 700;
    line-height: 14px;
  }

  @media (max-width: 720px) {
    .detail-subtab-modal-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

<template>
  <j-modal
    :title="title"
    :width="width"
    :visible="visible"
    centered
    wrapClassName="hrm-detail-subtab-modal"
    okText="保存"
    @ok="handleOk"
    :okButtonProps="{ class:{'jee-hidden': disableSubmit} }"
    @cancel="handleCancel"
    cancelText="取消">
    <hrm-yggxsb-form
      ref="realForm"
      :disabled="disableSubmit"
      :ghId="ghId"
      :localMode="localMode"
      @ok="submitCallback"
    ></hrm-yggxsb-form>
  </j-modal>
</template>

<script>

  import HrmYggxsbForm from './HrmYggxsbForm'
  export default {
    name: 'HrmYggxsbModal',
    components: {
      HrmYggxsbForm
    },
    props: {
      ghId: {
        type: [String, Number],
        default: ''
      },
      localMode: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        title: '',
        width: 880,
        visible: false,
        disableSubmit: false
      }
    },
    methods: {
      add (record) {
        this.visible = true
        this.$nextTick(() => {
          this.$refs.realForm.add(record)
        })
      },
      edit (record) {
        this.visible = true
        this.$nextTick(() => {
          this.$refs.realForm.edit(record)
        })
      },
      close () {
        this.$emit('close')
        this.visible = false
      },
      handleOk () {
        this.$refs.realForm.submitForm()
      },
      submitCallback (record) {
        this.$emit('ok', record)
        this.visible = false
      },
      handleCancel () {
        this.close()
      }
    }
  }
</script>

<style lang="less">
  .hrm-detail-subtab-modal {
    .ant-modal {
      max-width: calc(100vw - 32px);
    }

    .ant-modal-content {
      border-radius: 10px;
      box-shadow: 0 20px 60px rgba(15, 23, 42, 0.22);
      overflow: hidden;
    }

    .ant-modal-header {
      padding: 18px 20px;
      border-bottom: 1px solid #e2e8f0;
    }

    .ant-modal-title {
      color: #1f2d3d;
      font-size: 16px;
      font-weight: 700;
      line-height: 22px;
    }

    .j-modal-title-row {
      display: block;

      .left {
        width: auto;
      }
    }

    .ant-modal-close {
      color: #64748b;
    }

    .ant-modal-close-x {
      width: 54px;
      height: 58px;
      line-height: 58px;
      font-size: 16px;
    }

    .ant-modal-body {
      padding: 0;
    }

    .ant-modal-footer {
      padding: 12px 20px;
      border-top: 1px solid #e2e8f0;
    }

    .ant-modal-footer .ant-btn {
      min-width: 60px;
      height: 36px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
    }

    .ant-modal-footer .ant-btn-primary {
      border-color: #0ea5e9;
      background: #0ea5e9;
      box-shadow: 0 6px 14px rgba(14, 165, 233, 0.22);

      &:hover,
      &:focus {
        border-color: #0284c7;
        background: #0284c7;
      }
    }
  }
</style>

<template>
  <a-modal
    :visible="value"
    :title="title"
    :width="width"
    :maskClosable="maskClosable"
    :destroyOnClose="destroyOnClose"
    :wrapClassName="mergedWrapClassName"
    @cancel="handleCancel"
  >
    <slot />

    <template slot="footer">
      <slot name="footer">
        <div class="prototype-modal-footer" :class="{ single: !showOk || !showCancel }">
          <a-button v-if="showCancel" @click="handleCancel">{{ cancelText }}</a-button>
          <a-button
            v-if="showOk"
            :class="okButtonClass"
            :loading="loading"
            @click="handleConfirm"
          >
            {{ okText }}
          </a-button>
        </div>
      </slot>
    </template>
  </a-modal>
</template>

<script>
export default {
  name: 'PrototypeModal',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    width: {
      type: [Number, String],
      default: 520
    },
    loading: {
      type: Boolean,
      default: false
    },
    okText: {
      type: String,
      default: '确定'
    },
    cancelText: {
      type: String,
      default: '取消'
    },
    showOk: {
      type: Boolean,
      default: true
    },
    showCancel: {
      type: Boolean,
      default: true
    },
    maskClosable: {
      type: Boolean,
      default: false
    },
    destroyOnClose: {
      type: Boolean,
      default: true
    },
    wrapClassName: {
      type: String,
      default: ''
    },
    okButtonClass: {
      type: String,
      default: 'prototype-modal-primary'
    }
  },
  computed: {
    mergedWrapClassName() {
      return ['prototype-modal-shell', this.wrapClassName].filter(Boolean).join(' ')
    }
  },
  methods: {
    handleCancel() {
      this.$emit('input', false)
      this.$emit('cancel')
    },
    handleConfirm() {
      this.$emit('confirm')
    }
  }
}
</script>

<style lang="less">
.prototype-modal-shell {
  .ant-modal-content {
    border-radius: 22px;
    overflow: hidden;
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
  }

  .ant-modal-header {
    padding: 24px 24px 0;
    border-bottom: 0;
    background: #ffffff;
  }

  .ant-modal-title {
    font-size: 18px;
    font-weight: 700;
    color: #1f2937;
  }

  .ant-modal-close-x {
    width: 48px;
    height: 48px;
    line-height: 48px;
    color: #94a3b8;
  }

  .ant-modal-body {
    padding: 24px;
    background: #ffffff;
  }

  .ant-modal-footer {
    border-top: 0;
    padding: 0 24px 24px;
    background: #ffffff;
  }

  .ant-modal-footer .ant-btn {
    height: 38px;
    padding: 0 18px;
    border-radius: 10px;
    margin-left: 0;
  }

  .ant-form-item {
    margin-bottom: 18px;
  }

  .ant-form-item-label > label {
    color: #64748b;
    font-size: 13px;
    font-weight: 600;
  }

  .ant-input,
  .ant-calendar-picker-input,
  .ant-select-selection,
  .ant-input-number,
  .ant-input-number-input {
    border-radius: 10px;
    border-color: #dbe3ef;
    background: #f8fafc;
  }

  .ant-input,
  .ant-calendar-picker-input,
  .ant-select-selection--single {
    min-height: 40px;
  }

  .ant-select-selection__rendered {
    line-height: 38px;
  }
}

.prototype-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.prototype-modal-footer.single {
  justify-content: flex-end;
}

.prototype-modal-primary {
  color: #ffffff;
  background: #4f46e5;
  border-color: #4f46e5;
}

.prototype-modal-primary:hover,
.prototype-modal-primary:focus {
  color: #ffffff;
  background: #4338ca;
  border-color: #4338ca;
}
</style>

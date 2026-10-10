<!--
  @description 临时工入档删除确认模态框组件
  @date 2026-09-29
  @functionality 删除勾选的劳动派遣记录前二次确认，参考原型 delModal
-->
<template>
  <!-- 删除确认弹窗（参考原型 delModal，覆盖 a-modal 默认样式） -->
  <a-modal
    :visible="visible"
    :width="460"
    class="tw-del-modal"
    :maskClosable="true"
    @cancel="handleCancel"
  >
    <template slot="title">
      <a-icon type="warning" />删除确认
    </template>
    <div class="tw-del-warn">
      <a-icon type="exclamation-circle" class="del-warn-icon" />
      <div>
        确定要删除选中的 <b>{{ count }}</b> 条劳动派遣记录吗？<br />
        删除后不可恢复，请谨慎操作。
      </div>
    </div>
    <template slot="footer">
      <a-button @click="handleCancel">取消</a-button>
      <a-button type="primary" @click="handleConfirm"><a-icon type="delete" />确定删除</a-button>
    </template>
  </a-modal>
</template>

<script>
/**
 * 临时工入档删除确认模态框组件
 * 删除勾选的劳动派遣记录前二次确认
 */
export default {
  name: 'DeleteModal',
  props: {
    /** 模态框显示状态（支持 .sync） */
    visible: {
      type: Boolean,
      default: false
    },
    /** 勾选的记录条数 */
    count: {
      type: Number,
      default: 0
    }
  },
  methods: {
    /** 取消，关闭弹窗 */
    handleCancel() {
      this.$emit('update:visible', false)
    },
    /** 确认删除，由父组件执行删除逻辑 */
    handleConfirm() {
      this.$emit('ok')
    }
  }
}
</script>

<style lang="less" scoped>
@import '../../temporary-worker-theme.less';

/* 覆盖 a-modal 默认样式 */
.tw-del-modal {
  /deep/ .ant-modal-content {
    border-radius: 12px;
    overflow: hidden;
  }

  /* 渐变头部 + 底部青亮色分割线 */
  /deep/ .ant-modal-header {
    position: relative;
    padding: 15px 20px;
    background: linear-gradient(135deg, #2563eb, #4f7dff);
    border-bottom: none;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 2px;
      background: linear-gradient(90deg, #00b4d8, rgba(255, 255, 255, 0.4));
    }
  }

  /deep/ .ant-modal-title {
    color: #fff;
    font-size: 15px;
    font-weight: 600;

    .anticon {
      margin-right: 8px;
    }
  }

  /* 头部关闭按钮改为白色 */
  /deep/ .ant-modal-close-x {
    color: rgba(255, 255, 255, 0.85);

    &:hover {
      color: #fff;
    }
  }

  /deep/ .ant-modal-body {
    padding: 18px 22px;
  }

  /deep/ .ant-modal-footer {
    padding: 12px 20px;
    border-top: 1px solid #e2e8f0;
    background: rgba(37, 99, 235, 0.015);
  }
}

/* 红色警告框 */
.tw-del-warn {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.28);
  border-radius: 10px;
  padding: 16px 18px;

  .del-warn-icon {
    font-size: 22px;
    color: #dc2626;
    flex-shrink: 0;
    margin-top: 1px;
  }

  div {
    font-size: 13.5px;
    line-height: 1.7;
    color: #7f1d1d;
  }

  b {
    color: #b91c1c;
    font-weight: 700;
  }
}
</style>

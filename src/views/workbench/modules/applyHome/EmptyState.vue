<template>
  <div class="wb-empty-state">
    <div class="empty-icon">
      <a-icon :type="icon" />
    </div>
    <p>{{ text }}</p>
  </div>
</template>

<script>
export default {
  name: 'WbEmptyState',
  props: {
    // ant-design 图标名
    icon: {
      type: String,
      default: 'check-circle',
    },
    // 提示文字
    text: {
      type: String,
      default: '暂无数据',
    },
  },
}
</script>

<style lang="less" scoped>
.wb-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
}

.empty-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #f4f5fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #c0c7d0;
  margin-bottom: 16px;

  /deep/ .anticon {
    font-size: 32px;
  }
}

p {
  font-size: 14px;
  color: #888;
  margin: 0;
}
</style>

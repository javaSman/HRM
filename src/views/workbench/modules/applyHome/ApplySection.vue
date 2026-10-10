<template>
  <div class="wb-section-block">
    <div class="section-title">{{ title }}</div>
    <div class="section-grid">
      <slot>
        <ApplyCard
          v-for="item in items"
          :key="item.key"
          :icon="item.icon"
          :icon-class="item.iconClass"
          :label="item.label"
          :disabled="item.disabled"
          @click="handleCardClick(item)"
        />
      </slot>
    </div>
  </div>
</template>

<script>
import ApplyCard from './ApplyCard.vue'

export default {
  name: 'WbApplySection',
  components: { ApplyCard },
  props: {
    // 区块标题
    title: {
      type: String,
      default: '',
    },
    // 卡片列表数据（使用默认插槽时可不传）
    items: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    handleCardClick(item) {
      this.$emit('card-click', item)
    },
  },
}
</script>

<style lang="less" scoped>
.wb-section-block {
  margin-bottom: 28px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    width: 3px;
    height: 16px;
    border-radius: 2px;
    background: linear-gradient(135deg, #3b82f6, #22d3ee);
    display: inline-block;
  }
}

.section-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}
</style>

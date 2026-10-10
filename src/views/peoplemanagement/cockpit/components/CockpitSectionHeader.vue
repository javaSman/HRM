<template>
  <div class="section-header">
    <span class="section-dot" :style="dotStyle"></span>
    <span class="section-title">{{ title }}</span>
    <span v-if="subtitle" class="section-subtitle">{{ subtitle }}</span>
    <span v-if="tag" class="section-tag" :class="tagClass">{{ tag }}</span>
  </div>
</template>

<script>
export default {
  name: 'CockpitSectionHeader',
  props: {
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    tag: {
      type: String,
      default: ''
    },
    tagClass: {
      type: String,
      default: ''
    },
    dotStyle: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>

<style lang="less" scoped>
.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 4px 6px;
}

.section-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  background: var(--blue-primary);
  box-shadow: 0 0 10px rgba(37, 99, 235, 0.45);
  flex-shrink: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.3px;
}

.section-subtitle {
  margin-left: 2px;
  font-size: 11px;
  color: var(--text-muted);
}

.section-tag {
  margin-left: auto;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
}

.section-tag.risk {
  background: rgba(220, 38, 38, 0.08);
  color: var(--danger);
}

.section-tag.info {
  background: rgba(37, 99, 235, 0.06);
  color: var(--blue-primary);
}
</style>

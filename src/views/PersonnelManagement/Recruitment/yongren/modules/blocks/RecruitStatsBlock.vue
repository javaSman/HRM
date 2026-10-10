<template>
  <div class="recruit-stats-block">
    <div class="stats-grid">
      <div class="stats-item">
        <span class="stats-label">招聘情况</span>
        <!-- 招聘情况字段留白，待对接 -->
        <div class="stats-blank"></div>
      </div>
      <div class="stats-item"><span class="stats-label">招聘人数</span><span class="stats-value">{{ model.zprs != null ? model.zprs : 0 }}</span></div>
      <div class="stats-item"><span class="stats-label">剩余招聘人数</span><span class="stats-value">{{ model.syzprs != null ? model.syzprs : 0 }}</span></div>
      <div class="stats-item"><span class="stats-label">入职人数</span><span class="stats-value">{{ model.rzrs != null ? model.rzrs : 0 }}</span></div>
      <div class="stats-item"><span class="stats-label">简历数量</span><span class="stats-value">{{ model.jlsl != null ? model.jlsl : 0 }}</span></div>
      <div class="stats-item"><span class="stats-label">面试人数</span><span class="stats-value">{{ model.msrs != null ? model.msrs : 0 }}</span></div>
      <div class="stats-item"><span class="stats-label">offer人数</span><span class="stats-value">{{ model.offerrs != null ? model.offerrs : 0 }}</span></div>
      <div class="stats-item"><span class="stats-label">面试官</span><span class="stats-value">{{ model.msg || '-' }}</span></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RecruitStatsBlock',
  props: {
    model: { type: Object, required: true },
  },
}
</script>

<style scoped lang="less">
.recruit-stats-block {
  width: 100%;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.stats-item {
  position: relative;
  min-height: 50px;
  padding: 8px 10px 8px 13px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #edf0f5;
  border-radius: 8px;
  transition: all 0.2s ease;

  &::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 3px;
    content: '';
    background: linear-gradient(180deg, #5b8cff 0%, #4a7bf7 100%);
    opacity: 0.65;
    transition: opacity 0.2s ease;
  }

  &:hover {
    border-color: #c6d6ff;
    box-shadow: 0 3px 10px rgba(74, 123, 247, 0.12);
    transform: translateY(-1px);

    &::before {
      opacity: 1;
    }
  }
}

.stats-label {
  display: block;
  margin-bottom: 4px;
  color: #8c8c8c;
  font-size: 12px;
}

.stats-value {
  color: #262626;
  font-size: 13px;
  font-weight: 600;
  word-break: break-all;
}

.stats-blank {
  min-height: 18px;
}
</style>

<template>
  <div class="stat-panel">
    <div class="stat-cards">
      <div v-for="item in cards" :key="item.key" :class="['stat-card', item.className]">
        <div class="stat-icon">
          <a-icon v-if="item.icon" :type="item.icon" />
          <span v-else class="infinity-icon">∞</span>
        </div>
        <div class="stat-content">
          <div class="stat-num">{{ item.value }}</div>
          <div class="stat-label">{{ item.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BlacklistStatCards',
  props: {
    summary: {
      type: Object,
      required: true,
    },
  },
  computed: {
    cards() {
      return [
        {
          key: 'total',
          label: '黑名单总数',
          value: this.summary.total || 0,
          className: 'blue',
          icon: 'file-text',
        },
        {
          key: 'oneYear',
          label: '1年',
          value: this.summary.oneYear || 0,
          className: 'blue',
          icon: 'calendar',
        },
        {
          key: 'threeYear',
          label: '3年',
          value: this.summary.threeYear || 0,
          className: 'orange',
          icon: 'trophy',
        },
        {
          key: 'fiveYear',
          label: '5年',
          value: this.summary.fiveYear || 0,
          className: 'red',
          icon: 'safety-certificate',
        },
        {
          key: 'permanent',
          label: '永久',
          value: this.summary.permanent || 0,
          className: 'dark',
          icon: '',
        },
      ]
    },
  },
}
</script>

<style scoped lang="less">
.stat-panel {
  margin-bottom: 12px;
  padding: 16px;
  border-radius: 6px;
  background: #f2f7ff;
}
.stat-cards {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
}
.stat-card {
  display: flex;
  align-items: center;
  min-width: 0;
  min-height: 106px;
  padding: 16px;
  border: 1px solid #edf2f8;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 5px 14px rgba(58, 109, 174, 0.08);
}
.stat-icon {
  display: flex;
  flex: 0 0 60px;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  margin-right: 14px;
  border-radius: 50%;
  font-size: 27px;
}
.stat-content {
  min-width: 0;
}
.stat-num {
  font-size: 27px;
  font-weight: 700;
  line-height: 30px;
}
.stat-label {
  margin-top: 2px;
  color: #1f1f1f;
  font-size: 14px;
  font-weight: 500;
  line-height: 18px;
  white-space: nowrap;
}
.stat-description {
  margin-top: 5px;
  color: #8c8c8c;
  font-size: 12px;
  line-height: 16px;
  white-space: nowrap;
}
.blue .stat-icon {
  background: #eaf3ff;
  color: #2d78ff;
}
.blue .stat-num {
  color: #1677ff;
}
.orange .stat-icon {
  background: #fff3e6;
  color: #f59a23;
}
.orange .stat-num {
  color: #f08a00;
}
.red .stat-icon {
  background: #fff0f1;
  color: #ff5a64;
}
.red .stat-num {
  color: #ff4d56;
}
.dark .stat-icon {
  background: #f0f2f5;
  color: #7f8998;
}
.dark .stat-num {
  color: #242933;
}
.infinity-icon {
  margin-top: -3px;
  font-family: Arial, sans-serif;
  font-size: 38px;
  line-height: 1;
}

@media (max-width: 1400px) {
  .stat-cards {
    gap: 10px;
  }
  .stat-card {
    padding: 13px;
  }
  .stat-icon {
    flex-basis: 52px;
    width: 52px;
    height: 52px;
    margin-right: 10px;
    font-size: 23px;
  }
  .stat-num {
    font-size: 24px;
  }
}
@media (max-width: 1100px) {
  .stat-cards {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 700px) {
  .stat-panel {
    padding: 10px;
  }
  .stat-cards {
    grid-template-columns: 1fr;
  }
}
</style>


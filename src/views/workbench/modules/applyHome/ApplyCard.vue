<template>
  <div class="wb-apply-card" :class="{ disabled }" @click="handleClick">
    <div class="card-icon" :class="iconClass">
      <a-icon :type="icon" />
    </div>
    <div class="card-label">{{ label }}</div>
  </div>
</template>

<script>
export default {
  name: 'WbApplyCard',
  props: {
    // 卡片图标 (font-awesome class，如 'fa-solid fa-clock-rotate-left')
    icon: {
      type: String,
      default: '',
    },
    // 图标颜色主题类名 (如 'ic-kaoqin-1')
    iconClass: {
      type: String,
      default: '',
    },
    // 卡片名称
    label: {
      type: String,
      default: '',
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    handleClick() {
      if (this.disabled) return
      this.$emit('click')
    },
  },
}
</script>

<style lang="less" scoped>
.wb-apply-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 22px 10px 18px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #edf2ff;
  border: 1px solid #d6e2fb;
  box-shadow: none;

  &:hover {
    background: #dbe4fe;
    border-color: #a0bdf9;
    box-shadow: 0 2px 12px rgba(24, 100, 255, 0.08);
    transform: translateY(-2px);

    .card-label {
      color: #1890ff;
      font-weight: 600;
    }

    .card-icon {
      transform: scale(1.08);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }
  }

  &.disabled {
    background: #f8f9fb;
    border-color: #edeef2;
    cursor: not-allowed;
    opacity: 0.82;

    &:hover {
      background: #f4f5f8;
      border-color: #e4e5ea;
      box-shadow: none;
      transform: none;

      .card-icon {
        transform: none;
        box-shadow: none;
      }

      .card-label {
        color: #666;
        font-weight: 500;
      }
    }
  }
}

.card-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #fff;
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
}

.card-label {
  font-size: 13px;
  font-weight: 500;
  color: #666;
  text-align: center;
  white-space: nowrap;
  transition: color 0.25s ease;
}

/* ===== 图标颜色 - 蓝青柔和渐变色系 ===== */
.ic-kaoqin-1 { background: linear-gradient(135deg, #60a5fa, #3b82f6); }   /* 补卡 */
.ic-kaoqin-2 { background: linear-gradient(135deg, #38bdf8, #22d3ee); }   /* 加班 */
.ic-kaoqin-3 { background: linear-gradient(135deg, #818cf8, #60a5fa); }   /* 外出 */
.ic-kaoqin-4 { background: linear-gradient(135deg, #fbbf24, #f59e0b); }   /* 请假 */
.ic-kaoqin-5 { background: linear-gradient(135deg, #34d399, #10b981); }   /* 移动打卡 */
.ic-kaoqin-6 { background: linear-gradient(135deg, #67e8f9, #22d3ee); }   /* 工龄 */
.ic-kaoqin-7 { background: linear-gradient(135deg, #a78bfa, #818cf8); }   /* 外勤 */
.ic-kaoqin-8 { background: linear-gradient(135deg, #94a3b8, #64748b); }   /* 加班补卡 */
.ic-kaoqin-9 { background: linear-gradient(135deg, #f87171, #ef4444); }   /* 批量补卡 */
.ic-kaoqin-10 { background: linear-gradient(135deg, #a78bfa, #c084fc); }  /* 年假 */

.ic-sushe-1 { background: linear-gradient(135deg, #fdba74, #fb923c); }    /* 入住 */
.ic-sushe-2 { background: linear-gradient(135deg, #fcd34d, #fbbf24); }    /* 退宿 */
.ic-sushe-3 { background: linear-gradient(135deg, #fca5a5, #f87171); }    /* 调寝 */
.ic-sushe-4 { background: linear-gradient(135deg, #fde68a, #fcd34d); }    /* 宿管 */

.ic-renshi-1 { background: linear-gradient(135deg, #93c5fd, #60a5fa); }   /* 调岗 */
.ic-renshi-2 { background: linear-gradient(135deg, #38bdf8, #3b82f6); }   /* 用人 */
.ic-renshi-6 { background: linear-gradient(135deg, #6ee7b7, #34d399); }   /* 转正 */
.ic-renshi-7 { background: linear-gradient(135deg, #f0abfc, #e879f9); }   /* 调薪 */
.ic-renshi-4 { background: linear-gradient(135deg, #fcd34d, #f59e0b); }   /* 临时工 */
.ic-renshi-5 { background: linear-gradient(135deg, #fda4af, #f87171); }   /* 离职 */

.ic-gongtong-1 { background: linear-gradient(135deg, #5eead4, #2dd4bf); }  /* 访客接待 */
.ic-gongtong-2 { background: linear-gradient(135deg, #7dd3fc, #38bdf8); }  /* 访客申请 */
.ic-gongtong-3 { background: linear-gradient(135deg, #818cf8, #6366f1); }  /* 自助访客登记 */
.ic-gongtong-4 { background: linear-gradient(135deg, #67e8f9, #22d3ee); }  /* 放行条 */
.ic-gongtong-5 { background: linear-gradient(135deg, #c4b5fd, #a78bfa); }  /* 会议预约 */
.ic-gongtong-6 { background: linear-gradient(135deg, #f0abfc, #c084fc); }  /* 劳动派遣登记 */
</style>

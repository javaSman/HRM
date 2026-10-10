<template>
  <div class="page-container approval-entry-page">
    <div class="page-wrap">
      <div class="sidebar">
        <div class="sidebar-child-wrap">
          <div
            v-for="item in menuList"
            :key="item.key"
            :class="['sidebar-item', { active: activeMenu === item.key }]"
            @click="handleMenuChange(item.key)"
          >
            {{ item.label }}
          </div>
        </div>
      </div>

      <div class="main-content">
        <div class="page-header">
          <div class="header-left">
            <h2>{{ currentPage.title }}</h2>
            <p>{{ currentPage.desc }}</p>
          </div>
        </div>

        <div v-if="activeMenu === 'apply'" class="apply-view">
          <div v-for="section in sectionList" :key="section.key" class="section-block">
            <div class="section-title">{{ section.title }}</div>
            <div class="section-grid">
              <div
                v-for="card in section.cards"
                :key="card.key"
                :class="['icon-card', { disabled: card.disabled }]"
                @click="handleCardClick(card)"
              >
                <div :class="['card-icon', card.iconClass]">
                  <a-icon :type="card.icon" />
                </div>
                <div class="card-label">{{ card.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="audit-view">
          <div class="empty-state">
            <div class="empty-icon">
              <a-icon type="check-circle" theme="filled" />
            </div>
            <p>暂无待审批单据</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const pageMap = {
  apply: {
    title: '申请中心',
    desc: '快速办理各类考勤、宿舍、人事等业务申请'
  },
  audit: {
    title: '我的审批',
    desc: '处理待我审核的全部单据'
  }
}

const sectionList = [
  {
    key: 'attendance',
    title: '考勤',
    cards: [
      { key: 'repair-card', label: '补卡申请', icon: 'clock-circle', iconClass: 'ic-kaoqin-1', disabled: false, routerUrl:'/shiftManagement/cardReplacement' },
      { key: 'overtime', label: '加班申请', icon: 'hourglass', iconClass: 'ic-kaoqin-2', disabled: false },
      { key: 'outing', label: '外出申请', icon: 'environment', iconClass: 'ic-kaoqin-3', disabled: true },
      { key: 'leave', label: '请假申请', icon: 'calendar', iconClass: 'ic-kaoqin-4', disabled: true },
      { key: 'mobile-clock', label: '移动打卡申请', icon: 'mobile', iconClass: 'ic-kaoqin-5', disabled: true },
      { key: 'seniority', label: '工龄年限申请', icon: 'file-text', iconClass: 'ic-kaoqin-6', disabled: true },
      { key: 'field-work', label: '外勤申请', icon: 'team', iconClass: 'ic-kaoqin-7', disabled: true },
      { key: 'overtime-repair', label: '加班补卡申请', icon: 'schedule', iconClass: 'ic-kaoqin-8', disabled: true },
      { key: 'batch-repair', label: '批量补卡申请', icon: 'appstore', iconClass: 'ic-kaoqin-9', disabled: true }
    ]
  },
  {
    key: 'dormitory',
    title: '宿舍食堂',
    cards: [
      { key: 'check-in', label: '入住申请', icon: 'home', iconClass: 'ic-sushe-1', disabled: true },
      { key: 'check-out', label: '退宿申请', icon: 'logout', iconClass: 'ic-sushe-2', disabled: true },
      { key: 'move-room', label: '调寝申请', icon: 'swap', iconClass: 'ic-sushe-3', disabled: true },
      { key: 'dormitory-admin', label: '宿管管理', icon: 'bank', iconClass: 'ic-sushe-4', disabled: true }
    ]
  },
  {
    key: 'personnel',
    title: '人事管理',
    cards: [
      { key: 'transfer', label: '调岗申请', icon: 'retweet', iconClass: 'ic-renshi-1', disabled: true },
      { key: 'staffing', label: '用人申请', icon: 'team', iconClass: 'ic-renshi-2', disabled: true },
      { key: 'social-security', label: '社保调档申请', icon: 'idcard', iconClass: 'ic-renshi-3', disabled: true },
      { key: 'temporary-worker', label: '临时工需求', icon: 'solution', iconClass: 'ic-renshi-4', disabled: true },
      { key: 'resignation', label: '离职申请', icon: 'export', iconClass: 'ic-renshi-5', disabled: true },
      { key: 'layoff', label: '裁员核算', icon: 'calculator', iconClass: 'ic-renshi-6', disabled: true }
    ]
  },
  {
    key: 'office',
    title: '办公协同',
    cards: [
      { key: 'visitor-reception', label: '访客接待', icon: 'team', iconClass: 'ic-gongtong-1', disabled: true },
      { key: 'visitor-apply', label: '访客申请', icon: 'form', iconClass: 'ic-gongtong-2', disabled: true },
      { key: 'self-visitor', label: '自助访客登记', icon: 'profile', iconClass: 'ic-gongtong-3', disabled: true },
      { key: 'release-note', label: '放行条', icon: 'safety', iconClass: 'ic-gongtong-4', disabled: true },
      { key: 'meeting', label: '会议预约', icon: 'calendar', iconClass: 'ic-gongtong-5', disabled: true }
    ]
  },
  {
    key: 'vehicle',
    title: '用车管理',
    cards: [
      { key: 'parking-list', label: '停车位列表', icon: 'car', iconClass: 'ic-yongche-1', disabled: true },
      { key: 'parking-apply', label: '停车位申请', icon: 'check-circle', iconClass: 'ic-yongche-2', disabled: true },
      { key: 'parking-ticket', label: '停车票申请', icon: 'credit-card', iconClass: 'ic-yongche-3', disabled: true },
      { key: 'vehicle-status', label: '车辆状态', icon: 'warning', iconClass: 'ic-yongche-4', disabled: true },
      { key: 'official-car', label: '公车申请', icon: 'car', iconClass: 'ic-yongche-5', disabled: true },
      { key: 'freight-apply', label: '货运车辆申请', icon: 'shopping-cart', iconClass: 'ic-yongche-6', disabled: true },
      { key: 'my-freight', label: '我的货运申请单', icon: 'profile', iconClass: 'ic-yongche-7', disabled: true },
      { key: 'operation', label: '运营管理', icon: 'setting', iconClass: 'ic-yongche-8', disabled: true },
      { key: 'driver-order', label: '司机货运订单', icon: 'car', iconClass: 'ic-yongche-9', disabled: true }
    ]
  }
]

export default {
  name: 'ApprovalIndex',
  data() {
    return {
      activeMenu: 'apply',
      menuList: [
        { key: 'apply', label: '申请' },
        { key: 'audit', label: '我的审批' }
      ],
      sectionList
    }
  },
  computed: {
    currentPage() {
      return pageMap[this.activeMenu] || pageMap.apply
    }
  },
  methods: {
    handleMenuChange(key) {
      this.activeMenu = key
    },
    handleCardClick(card) {
      if (card.disabled) {
        this.$message.info(`${card.label}功能建设中`)
        return
      }
      console.log('routerUrl',card.routerUrl)
      this.$router.push({
        path:card.routerUrl
      })
      // this.$message.info(`${card.label}入口待接入`)
    }
  }
}
</script>

<style scoped lang="less">
.approval-entry-page {
  --primary: #1890ff;
  --primary-grad: linear-gradient(135deg, #3b82f6, #22d3ee);
  --primary-grad-h: linear-gradient(90deg, #2563eb, #38bdf8);
  --primary-light: #e6f4ff;
  --border: #e8ebf0;
  --text-title: #222222;
  --text-body: #333333;
  --text-secondary: #666666;
  --text-muted: #888888;
  --card-bg: #ffffff;
  --page-bg: #f5f7fa;
  height: calc(100vh - 120px - 24px);
  padding: 24px;
  background: var(--page-bg);
  overflow: auto;
  color: var(--text-title);
}

.page-wrap {
  display: flex;
  gap: 20px;
  min-height: 100%;
}

.sidebar,
.main-content {
  position: relative;
  overflow: hidden;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.sidebar::before,
.main-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--primary-grad-h);
}

.sidebar {
  width: 110px;
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 36px;
}

.sidebar-child-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.sidebar-item {
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-secondary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.sidebar-item:hover {
  color: var(--primary);
  background: var(--primary-light);
}

.sidebar-item.active {
  color: #ffffff;
  font-weight: 600;
  background: var(--primary-grad);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.25);
}

.main-content {
  flex: 1;
  padding: 28px 32px;
  overflow-y: auto;
}

.main-content::-webkit-scrollbar {
  width: 5px;
}

.main-content::-webkit-scrollbar-track {
  background: transparent;
}

.main-content::-webkit-scrollbar-thumb {
  background: #d0d5dd;
  border-radius: 3px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.header-left h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--text-title);
}

.header-left p {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--text-muted);
}

.section-block {
  margin-bottom: 28px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-body);
}

.section-title::before {
  content: '';
  width: 3px;
  height: 16px;
  border-radius: 2px;
  background: var(--primary-grad);
}

.section-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
}

.icon-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 22px 10px 18px;
  background: #edf2ff;
  border: 1px solid #d6e2fb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-card:hover {
  background: #dbe4fe;
  border-color: #a0bdf9;
  box-shadow: 0 2px 12px rgba(24, 100, 255, 0.08);
  transform: translateY(-2px);
}

.icon-card:hover .card-label {
  color: var(--primary);
  font-weight: 600;
}

.card-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #ffffff;
  font-size: 18px;
  border-radius: 12px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
}

.icon-card:hover .card-icon {
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.card-icon /deep/ .anticon {
  font-size: 18px;
}

.card-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  text-align: center;
  white-space: nowrap;
  transition: color 0.25s ease;
}

.icon-card.disabled {
  background: #f8f9fb;
  border-color: #edeef2;
  opacity: 0.82;
  cursor: not-allowed;
}

.icon-card.disabled:hover {
  background: #f4f5f8;
  border-color: #e4e5ea;
  box-shadow: none;
  transform: none;
}

.icon-card.disabled:hover .card-icon {
  transform: none;
  box-shadow: none;
}

.icon-card.disabled:hover .card-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 420px;
  padding: 80px 40px;
}

.empty-icon {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: #c0c7d0;
  background: #f4f5fa;
  border-radius: 50%;
}

.empty-icon /deep/ .anticon {
  font-size: 32px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  color: var(--text-muted);
}

.ic-kaoqin-1 { background: linear-gradient(135deg, #60a5fa, #3b82f6); }
.ic-kaoqin-2 { background: linear-gradient(135deg, #38bdf8, #22d3ee); }
.ic-kaoqin-3 { background: linear-gradient(135deg, #818cf8, #60a5fa); }
.ic-kaoqin-4 { background: linear-gradient(135deg, #fbbf24, #f59e0b); }
.ic-kaoqin-5 { background: linear-gradient(135deg, #34d399, #10b981); }
.ic-kaoqin-6 { background: linear-gradient(135deg, #67e8f9, #22d3ee); }
.ic-kaoqin-7 { background: linear-gradient(135deg, #a78bfa, #818cf8); }
.ic-kaoqin-8 { background: linear-gradient(135deg, #94a3b8, #64748b); }
.ic-kaoqin-9 { background: linear-gradient(135deg, #f87171, #ef4444); }
.ic-sushe-1 { background: linear-gradient(135deg, #fdba74, #fb923c); }
.ic-sushe-2 { background: linear-gradient(135deg, #fcd34d, #fbbf24); }
.ic-sushe-3 { background: linear-gradient(135deg, #fca5a5, #f87171); }
.ic-sushe-4 { background: linear-gradient(135deg, #fde68a, #fcd34d); }
.ic-renshi-1 { background: linear-gradient(135deg, #93c5fd, #60a5fa); }
.ic-renshi-2 { background: linear-gradient(135deg, #38bdf8, #3b82f6); }
.ic-renshi-3 { background: linear-gradient(135deg, #6ee7b7, #34d399); }
.ic-renshi-4 { background: linear-gradient(135deg, #fcd34d, #f59e0b); }
.ic-renshi-5 { background: linear-gradient(135deg, #fda4af, #f87171); }
.ic-renshi-6 { background: linear-gradient(135deg, #67e8f9, #38bdf8); }
.ic-gongtong-1 { background: linear-gradient(135deg, #5eead4, #2dd4bf); }
.ic-gongtong-2 { background: linear-gradient(135deg, #7dd3fc, #38bdf8); }
.ic-gongtong-3 { background: linear-gradient(135deg, #818cf8, #6366f1); }
.ic-gongtong-4 { background: linear-gradient(135deg, #67e8f9, #22d3ee); }
.ic-gongtong-5 { background: linear-gradient(135deg, #c4b5fd, #a78bfa); }
.ic-yongche-1 { background: linear-gradient(135deg, #fcd34d, #fbbf24); }
.ic-yongche-2 { background: linear-gradient(135deg, #fdba74, #fb923c); }
.ic-yongche-3 { background: linear-gradient(135deg, #fde68a, #fcd34d); }
.ic-yongche-4 { background: linear-gradient(135deg, #fca5a5, #ef4444); }
.ic-yongche-5 { background: linear-gradient(135deg, #7dd3fc, #3b82f6); }
.ic-yongche-6 { background: linear-gradient(135deg, #fdba74, #f97316); }
.ic-yongche-7 { background: linear-gradient(135deg, #93c5fd, #818cf8); }
.ic-yongche-8 { background: linear-gradient(135deg, #94a3b8, #64748b); }
.ic-yongche-9 { background: linear-gradient(135deg, #6ee7b7, #34d399); }

@media (max-width: 1200px) {
  .section-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 992px) {
  .section-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .approval-entry-page {
    padding: 16px;
  }

  .page-wrap {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    padding: 18px;
    justify-content: flex-start;
  }

  .sidebar-child-wrap {
    width: 100%;
    flex-direction: row;
    justify-content: flex-start;
    gap: 12px;
  }

  .main-content {
    padding: 20px;
  }

  .page-header {
    margin-bottom: 24px;
  }

  .header-left h2 {
    font-size: 20px;
  }

  .section-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .section-grid {
    grid-template-columns: 1fr;
  }

  .sidebar-item {
    padding: 8px 16px;
  }
}
</style>

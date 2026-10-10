<template>
  <a-drawer title="" placement="top" :closable="false" :visible="visible" :height="drawerHeight" @close="handleClose"
    destroyOnClose wrapClassName="today-attendance-drawer">
    <div class="kq-wrapper">
      <!-- 头部 -->
      <div class="kq-header">
        <span class="kq-title">今日考勤</span>
        <button class="kq-close" @click="handleClose">×</button>
      </div>

      <!-- 汇总条 -->
      <div class="kq-body">
        <a-spin :spinning="loading">

          <!-- 自定义滑动卡片式 Tabs -->
          <div v-if="!deptBelongKey" class="custom-tabs-container">
            <div class="custom-tabs-wrapper">
              <div 
                class="custom-tabs-slider" 
                :style="sliderStyle"
                ref="slider"
              ></div>
              <!-- <div 
                class="custom-tab-item"
                :class="{ 'active': TabsDeptBelongKey == 'all' }"
                ref="tab-all"
                @click="handleTabClick('all')"
              >
                <span class="tab-title">全部</span>
              </div> -->
              <div 
                v-for="item in companyList" 
                :key="item.id"
                class="custom-tab-item"
                :class="{ 'active': TabsDeptBelongKey === item.id }"
                :ref="`tab-${item.id}`"
                @click="handleTabClick(item.id)"
              >
                <span class="tab-title">{{ item.name }}</span>
              </div>
            </div>
          </div>

          <div class="today-summary-bar">
            <div class="today-summary-item">
              <a-icon type="team" class="today-summary-icon" />
              <span>总人数</span>
              <strong>{{ totalCount }}</strong>
            </div>
            <div class="today-summary-divider"></div>
            <div class="today-summary-item">
              <a-icon type="check-circle" class="today-summary-icon today-summary-icon--normal" />
              <span>正常率</span>
              <strong>{{ normalRate }}%</strong>
            </div>
            <div class="today-summary-divider"></div>
            <div class="today-summary-item">
              <a-icon type="exclamation-circle" class="today-summary-icon today-summary-icon--abnormal" />
              <span>异常率</span>
              <strong>{{ abnormalRate }}%</strong>
            </div>
            <div class="today-summary-divider"></div>

            <div class="today-summary-item">
              <span class="today-header-date">{{ currentDate }}</span>
              <a-tag color="blue" class="today-header-tag">实时数据</a-tag>
            </div>
          </div>

          <!-- 卡片网格 -->
          <div class="today-cards-grid">
            <div v-for="card in displayCards" :key="card.key" class="today-card" :class="'today-card--' + card.theme"
              @click="handleCardClick(card)">
              <!-- 顶部色条 -->
              <div class="today-card-bar" :class="'today-card-bar--' + card.theme"></div>

              <!-- 卡片主体 -->
              <div class="today-card-body">
                <div class="today-card-icon-wrap" :class="'today-card-icon-wrap--' + card.theme">
                  <a-icon :type="card.icon" class="today-card-icon" />
                </div>
                <div class="today-card-content">
                  <div class="today-card-value">
                    <span class="today-card-number">{{ card.value }}</span>
                    <span class="today-card-unit">人</span>
                  </div>
                  <div class="today-card-label">{{ card.label }}</div>
                  <div class="today-card-desc">{{ card.desc }}</div>
                </div>
                <div class="today-card-arrow">
                  <a-icon type="right" />
                </div>
              </div>

              <!-- 底部进度条 -->
              <div class="today-card-progress">
                <div class="today-card-progress-fill" :class="'today-card-progress-fill--' + card.theme"
                  :style="{ width: progressPercent(card) + '%' }"></div>
              </div>
            </div>
          </div>

        </a-spin>
      </div>
    </div>
  </a-drawer>
</template>

<script>
import { httpAction } from '@/api/manage'
import { formatDate } from '@/utils/util'


const CARD_THEME_MAP = {
  ALL: {
    theme: 'total',
    icon: 'team',
    label: '全部人员',
    desc: '当前部门在职总人数'
  },
  NORMAL: {
    theme: 'normal',
    icon: 'check-circle',
    label: '正常出勤',
    desc: '今日正常打卡人员'
  },
  BE_LATE: {
    theme: 'late',
    icon: 'clock-circle',
    label: '迟到人员',
    desc: '今日迟到打卡人员'
  },
  LEAVE_EARLY: {
    theme: 'early',
    icon: 'hourglass',
    label: '早退人员',
    desc: '今日提前离岗人员'
  },
  MISSING: {
    theme: 'lack',
    icon: 'exclamation-circle',
    label: '缺卡人员',
    desc: '今日未打卡人员'
  },
  ABSENT: {
    theme: 'absent',
    icon: 'user-delete',
    label: '旷工人员',
    desc: '今日缺勤旷工人员'
  },
  OTHER: {
    theme: 'other',
    icon: 'idcard',
    label: '其他状态',
    desc: '其他出勤状态人员'
  },
  SickLeave: {
    theme: 'sick-leave',
    icon: 'medicine-box',
    label: '病假',
    desc: '今日病假人员'
  },
  CasualLeave: {
    theme: 'casual-leave',
    icon: 'solution',
    label: '事假',
    desc: '今日事假人员'
  },
  Weekend: {
    theme: 'weekend',
    icon: 'calendar',
    label: '休息日',
    desc: '休息日出勤状态人员'
  },
  Holiday: {
    theme: 'holiday',
    icon: 'gift',
    label: '节假日',
    desc: '节假日出勤状态人员'
  },

  BK: {
    theme: 'BK',
    icon: 'gift',
    label: '补卡',
    desc: '补卡出勤状态人员'
  },
  WC: {
    theme: 'WC',
    icon: 'gift',
    label: '外出',
    desc: '外出出勤状态人员'
  },
  XJ: {
    theme: 'XJ',
    icon: 'gift',
    label: '休假',
    desc: '休假出勤状态人员'
  },
}

export default {
  name: 'TodayAttendanceDrawer',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    apiUrl: {
      type: String,
      default: '/hr_kq_yg/hrKqYg/getTotal'
    },
    tabsList: {
      type: Array,
      default: () => []
    },
    companyList: {
      type: Array,
      default: () => []
    },
    deptBelongKey: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      cardData: [],
      drawerHeight: 420,
      TabsDeptBelongKey: '',
      sliderStyle: {
        transform: 'translateX(0px)',
        width: '0px'
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.updateSliderPosition()
    })
  },
  computed: {
    currentDate() {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const weekDays = ['日', '一', '二', '三', '四', '五', '六']
      const weekDay = weekDays[now.getDay()]
      return `${year}年${month}月${day}日 星期${weekDay}`
    },
    displayCards() {
      let item ={}
      this.cardData.forEach(element => {
        if(element.deptBelong == this.TabsDeptBelongKey){
          item=element  
        }
      });
      if(!item.totalVoList){
        return []
      }
      // 排序：label 为"全部"的排在最前面
      const sortedList = [...item.totalVoList].sort((a, b) => {
        if (a.attendanceStatusText === '全部') return -1
        if (b.attendanceStatusText === '全部') return 1
        return 0
      })
      return sortedList.map(tab => {
        const config = CARD_THEME_MAP[tab.attendanceStatus] || CARD_THEME_MAP['OTHER']
        const key = tab.attendanceStatus || 'ALL'
        return {
          key,
          value: tab.attendanceTotal || 0,
          label: tab.attendanceStatusText,
          desc: config.desc,
          icon: config.icon,
          theme: config.theme,
          statusValue: tab.attendanceStatus
        }
      })
    },
    totalCount() {
      const allCard = this.displayCards.find(c => c.key === 'ALL')
      return allCard ? allCard.value : this.displayCards.reduce((sum, c) => sum + c.value, 0)
    },
    normalRate() {
      const normal = this.displayCards.find(c => c.key === 'NORMAL')
      if (!this.totalCount || !normal) return 0
      return Math.round((normal.value / this.totalCount) * 100)
    },
    abnormalRate() {
      if (!this.totalCount) return 0
      const normal = this.displayCards.find(c => c.key === 'NORMAL')
      const abnormalCount = normal ? this.totalCount - normal.value : 0
      return Math.round((abnormalCount / this.totalCount) * 100)
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.TabsDeptBelongKey = this.companyList[0].id
        this.fetchData()
        this.calcDrawerHeight()
        this.$nextTick(() => {
          this.updateSliderPosition()
        })
      }
    },
    TabsDeptBelongKey() {
      this.$nextTick(() => {
        this.updateSliderPosition()
      })
    }
  },
  methods: {
    handleTabClick(value) {
      this.TabsDeptBelongKey = value
    },
    updateSliderPosition() {
      try {
        const activeTab = this.$refs[`tab-${this.TabsDeptBelongKey}`]
        if(this.TabsDeptBelongKey=='all'){
          const tabElement = activeTab
          const sliderWidth = tabElement.offsetWidth
          const sliderLeft = tabElement.offsetLeft
          this.sliderStyle = {
            transform: `translateX(${sliderLeft}px)`,
            width: `${sliderWidth}px`
          }
        }

        if (activeTab && activeTab[0]) {
          const tabElement = activeTab[0]
          const sliderWidth = tabElement.offsetWidth
          const sliderLeft = tabElement.offsetLeft
          
          this.sliderStyle = {
            transform: `translateX(${sliderLeft}px)`,
            width: `${sliderWidth}px`
          }
        }
      } catch (error) {
      }
    },
    calcDrawerHeight() {
      this.drawerHeight = 360
    },
    progressPercent(card) {
      if (!this.totalCount || this.totalCount === 0) return 0
      return Math.round((card.value / this.totalCount) * 100)
    },
    fetchData() {
      this.loading = true

      let time = `&skrq_begin=${formatDate(new Date().getTime(), 'yyyy-MM-dd')}&skrq_end=${formatDate(new Date().getTime(), 'yyyy-MM-dd')}`

      httpAction(this.apiUrl + '?'+ time, '', 'get').then(res => {
        if (res.success) {
          this.cardData = res.result
        }
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    handleClose() {
      this.$emit('close')
    },
    handleCardClick(card) {
      // this.$emit('card-click', card)
    }
  }
}
</script>

<style lang="less" scoped>
// ---------- 外层容器 ----------
.kq-wrapper {
  display: flex;
  flex-direction: column;
}

// ---------- 头部 ----------
.kq-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  flex-shrink: 0;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
}

.kq-title {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
}

.kq-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  border: 0;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: center;
  font-size: 25px;
  color: #ffffff;
  transition: all 0.15s ease;
  line-height: 25px;

  &:hover {
    background: rgba(255, 255, 255, 0.35);
    color: #ffffff;
    border-color: transparent;
  }
}

// ---------- 内容区 ----------
.kq-body {
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8fafd 0%, #eef2f7 100%);
}

// ---------- 自定义滑动卡片式 Tabs ----------
.custom-tabs-container {
  margin-bottom: 16px;
}

.custom-tabs-wrapper {
  width: 100%;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(45, 120, 255, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.custom-tabs-slider {
  position: absolute;
  top: 6px;
  left: 0;
  height: calc(100% - 12px);
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(45, 120, 255, 0.25);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

.custom-tab-item {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  user-select: none;
  white-space: nowrap;

  .tab-title {
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
    transition: color 0.3s ease;
  }

  &:hover {
    .tab-title {
      color: #1a2a3d;
    }
  }

  &.active {
    .tab-title {
      color: #ffffff;
      font-weight: 700;
    }
  }
}

// ---------- 卡片网格 ----------
.today-cards-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
  padding: 0 4px;
}

.today-card {
  position: relative;
  background: #ffffff;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.04);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06);

    .today-card-arrow {
      opacity: 1;
      transform: translateX(0);
    }
  }

  &:active {
    transform: translateY(-1px);
  }
}

.today-card-bar {
  height: 4px;
  width: 100%;

  &--total {
    background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  }

  &--normal {
    background: linear-gradient(135deg, #36d985 0%, #10b981 100%);
  }

  &--late {
    background: linear-gradient(135deg, #ff814b 0%, #f59e0b 100%);
  }

  &--early {
    background: linear-gradient(135deg, #ffa200 0%, #fbbf24 100%);
  }

  &--lack {
    background: linear-gradient(135deg, #ff5900 0%, #ff7a33 100%);
  }

  &--absent {
    background: linear-gradient(135deg, #e93030 0%, #ef4444 100%);
  }

  &--other {
    background: linear-gradient(135deg, #0f7797 0%, #14b8a6 100%);
  }

  &--sick-leave {
    background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  }

  &--casual-leave {
    background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  }

  &--weekend {
    background: linear-gradient(135deg, #00cb9e 0%, #10b981 100%);
  }

  &--holiday {
    background: linear-gradient(135deg, #03cc00 0%, #10b981 100%);
  }

  &--BK {
    background: linear-gradient(135deg, #096dd9 0%, #0c59ac 100%);
  }
  &--WC {
    background: linear-gradient(135deg, #e7b625 0%, #97781b 100%);
  }
  &--XJ {
    background: linear-gradient(135deg, #00cce3 0%, #1f818b 100%);
  }
}

.today-card-body {
  display: flex;
  align-items: center;
  padding: 16px 18px 12px;
  gap: 14px;
}

.today-card-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.3s ease;

  .today-card:hover & {
    transform: scale(1.08);
  }

  &--total {
    background: rgba(45, 120, 255, 0.1);
    color: #2d78ff;
  }

  &--normal {
    background: rgba(54, 217, 133, 0.1);
    color: #36d985;
  }

  &--late {
    background: rgba(255, 129, 75, 0.1);
    color: #ff814b;
  }

  &--early {
    background: rgba(255, 162, 0, 0.1);
    color: #ffa200;
  }

  &--lack {
    background: rgba(255, 89, 0, 0.1);
    color: #ff5900;
  }

  &--absent {
    background: rgba(233, 48, 48, 0.1);
    color: #e93030;
  }

  &--other {
    background: rgba(15, 119, 151, 0.1);
    color: #0f7797;
  }

  &--sick-leave {
    background: rgba(139, 92, 246, 0.1);
    color: #8b5cf6;
  }

  &--casual-leave {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
  }

  &--weekend {
    background: rgba(0, 203, 158, 0.1);
    color: #00cb9e;
  }

  &--holiday {
    background: rgba(3, 204, 0, 0.1);
    color: #03cc00;
  }

  &--BK {
    background: rgba(9, 109, 217, 0.1);
    color: #096dd9;
  }

  &--WC {
    background: rgba(231, 182, 37, 0.1);
    color: #e7b625;
  }

  &--XJ {
    background: rgba(0, 204, 227, 0.1);
    color: #00cce3;
  }
}

.today-card-icon {
  font-size: 22px;
}

.today-card-content {
  flex: 1;
  min-width: 0;
}

.today-card-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.today-card-number {
  font-size: 28px;
  font-weight: 800;
  color: #1a2a3d;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.today-card-unit {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 500;
}

.today-card-label {
  margin-top: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.today-card-desc {
  margin-top: 2px;
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.today-card-arrow {
  opacity: 0;
  color: #cbd5e1;
  font-size: 14px;
  transform: translateX(-6px);
  transition: all 0.3s ease;
}

// ---------- 底部进度条 ----------
.today-card-progress {
  height: 3px;
  background: #f1f5f9;
  margin: 0 18px 16px;
  border-radius: 2px;
  overflow: hidden;
}

.today-card-progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);

  &--total {
    background: linear-gradient(90deg, #2d78ff, #00b4d8);
  }

  &--normal {
    background: linear-gradient(90deg, #36d985, #10b981);
  }

  &--late {
    background: linear-gradient(90deg, #ff814b, #f59e0b);
  }

  &--early {
    background: linear-gradient(90deg, #ffa200, #fbbf24);
  }

  &--lack {
    background: linear-gradient(90deg, #ff5900, #ff7a33);
  }

  &--absent {
    background: linear-gradient(90deg, #e93030, #ef4444);
  }

  &--other {
    background: linear-gradient(90deg, #0f7797, #14b8a6);
  }

  &--sick-leave {
    background: linear-gradient(90deg, #8b5cf6, #a78bfa);
  }

  &--casual-leave {
    background: linear-gradient(90deg, #f59e0b, #fbbf24);
  }

  &--weekend {
    background: linear-gradient(90deg, #00cb9e, #10b981);
  }

  &--holiday {
    background: linear-gradient(90deg, #03cc00, #10b981);
  }

  &--BK {
    background: linear-gradient(90deg, #096dd9, #0c59ac);
  }

  &--WC {
    background: linear-gradient(90deg, #e7b625, #97781b);
  }

  &--XJ {
    background: linear-gradient(90deg, #00cce3, #1f818b);
  }
}

// ---------- 汇总条 ----------
.today-summary-bar {
  margin-bottom: 20px;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.today-summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #64748b;

  strong {
    font-size: 18px;
    font-weight: 700;
    color: #1a2a3d;
    margin-left: 2px;
  }
}

.today-summary-icon {
  font-size: 16px;
  color: #2d78ff;

  &--normal {
    color: #10b981;
  }

  &--abnormal {
    color: #ef4444;
  }
}

.today-summary-divider {
  width: 1px;
  height: 24px;
  background: #e2e8f0;
}

.today-header-date {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.today-header-tag {
  font-size: 11px;
  border-radius: 4px;
}

// ---------- 响应式 ----------
@media (max-width: 1400px) {
  .custom-tabs-wrapper {
    width: 100%;
    overflow-x: auto;
  }

  .custom-tab-item {
    padding: 10px 16px;
  }

  .today-cards-grid {
    gap: 10px;
  }

  .today-card-body {
    padding: 12px 12px 10px;
    gap: 10px;
  }

  .today-card-icon-wrap {
    width: 38px;
    height: 38px;
    border-radius: 10px;
  }

  .today-card-icon {
    font-size: 18px;
  }

  .today-card-number {
    font-size: 24px;
  }

  .today-card-label {
    font-size: 12px;
  }

  .today-card-desc {
    font-size: 10px;
  }
}

@media (max-width: 1400px) {
  .today-cards-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (max-width: 1100px) {
  .today-cards-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 900px) {
  .today-cards-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 600px) {
  .today-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

<style lang="less">
.today-attendance-drawer {
  .ant-drawer-content-wrapper {
    height: auto !important;
    border-radius: 0 0 12px 12px;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
  }

  .ant-drawer-body {
    padding: 0;
    overflow: hidden;
  }
}
</style>

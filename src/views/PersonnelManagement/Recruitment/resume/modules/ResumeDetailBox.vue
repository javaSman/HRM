<template>
  <div class="detail-box">
    <!-- 顶部标题栏 -->
    <div class="detail-header">
      <div class="header-left">
        <span class="header-bar"></span>
        <span class="post-title">{{ record.postName || '-' }}</span>
        <a-tag :color="statusColor" class="status-tag">{{ statusText }}</a-tag>
      </div>
      <div class="header-right">
        <a-button class="header-btn-ghost" v-if="record.dqzt != '已完成'" icon="check-circle" @click="handleCollect">简历收集完毕</a-button>
        <a-button class="header-btn-solid" icon="rollback" @click="handleBack">返回列表</a-button>
      </div>
    </div>

    <!-- 简历数量统计 -->
    <div class="stat-row">
      <div
        v-for="item in statCards"
        :key="item.key"
        class="stat-card"
        :style="{ '--c': item.color, '--soft': item.soft, '--bg': item.bg }"
      >
        <div class="stat-icon"><a-icon :type="item.icon" /></div>
        <div class="stat-main">
          <div class="stat-num">{{ item.value }}</div>
          <div class="stat-label">{{ item.label }}</div>
        </div>
      </div>
    </div>

    <!-- 主体：左岗位信息 + 右简历列表 -->
    <div class="detail-body">
      <!-- 左：岗位信息 -->
      <div class="left-panel">
        <div class="panel-title"><span class="title-bar"></span>岗位信息</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">公司</span>
            <span class="info-value">{{ companyText }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">所属部门</span>
            <span class="info-value">{{ formatText(plan.deptPath) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">岗位名称</span>
            <span class="info-value">{{ formatText(plan.postId_dictText) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">职级名称</span>
            <span class="info-value">{{ formatText(plan.levelId_dictText) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">员工类型</span>
            <span class="info-value">{{ formatText(plan.employeeType) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">性别要求</span>
            <span class="info-value">{{ formatText(plan.xb) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">最低薪资</span>
            <span class="info-value">{{ formatText(plan.zdxz) }} K</span>
          </div>
          <div class="info-item">
            <span class="info-label">最高薪资</span>
            <span class="info-value">{{ formatText(plan.zgxz) }} K</span>
          </div>
          <div class="info-item">
            <span class="info-label">年龄下限</span>
            <span class="info-value">{{ formatText(plan.nlxx) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">年龄上限</span>
            <span class="info-value">{{ formatText(plan.nlsx) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">专业</span>
            <span class="info-value">{{ formatText(plan.zy) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">希望到岗日期</span>
            <span class="info-value">{{ formatText(plan.xwdgrq) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">最低学历</span>
            <span class="info-value">{{ formatText(plan.zdxl_dictText || plan.zdxl) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">经验要求</span>
            <span class="info-value">{{ formatText(plan.jyyq) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">申请原因</span>
            <span class="info-value">{{ formatText(plan.sqyy) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">面试官</span>
            <span class="info-value">{{ formatText(plan.msg) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">申请招聘人数</span>
            <span class="info-value">{{ formatText(plan.zprs) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">计划招聘人数</span>
            <span class="info-value">{{ formatText(plan.dzprs) }}</span>
          </div>
        </div>

        <!-- 任职要求 / 岗位职责 -->
        <div class="desc-row">
          <div class="desc-block">
            <div class="desc-title"><span class="title-bar"></span>任职要求</div>
            <div class="desc-text">{{ formatText(plan.rzyq) }}</div>
          </div>
          <div class="desc-block">
            <div class="desc-title"><span class="title-bar"></span>岗位职责</div>
            <div class="desc-text">{{ formatText(plan.gwzz) }}</div>
          </div>
        </div>
      </div>

      <!-- 右：简历列表 -->
      <div class="right-panel">
        <div class="panel-title"><span class="title-bar"></span>简历（共{{ record.jlsl || 0 }}份）</div>
        <resume-interview-table :mainData="record" @ok="ok" />
      </div>
    </div>
  </div>
</template>

<script>
import { getAction, postAction } from '@/api/manage'
import ResumeInterviewTable from './ResumeInterviewTable.vue'

export default {
  name: 'ResumeDetailBox',
  components: { ResumeInterviewTable },
  props: {
    record: { type: Object, required: true },
  },
  data() {
    return {
      plan: {},
      MainData: {},
    }
  },
  computed: {
    statusText() {
      return this.record.dqzt || '-'
    },
    statusColor() {
      return this.record.dqzt === '已完成' ? 'green' : 'blue'
    },
    companyText() {
      return String(this.plan.deptPath || '').split('/')[0] || '-'
    },
    statCards() {
      return [
        {
          key: 'jlsl',
          label: '简历数量',
          value: this.MainData.jlsl || 0,
          icon: 'file-text',
          color: '#2d78ff',
          soft: 'rgba(45,120,255,0.16)',
          bg: '#eef4ff',
        },
        {
          key: 'dyy',
          label: '待邀约数量',
          value: this.MainData.dyy || 0,
          icon: 'clock-circle',
          color: '#fa8c16',
          soft: 'rgba(250,140,22,0.16)',
          bg: '#fff7e6',
        },
        {
          key: 'yyy',
          label: '已邀约数量',
          value: this.MainData.yyy || 0,
          icon: 'notification',
          color: '#13c2c2',
          soft: 'rgba(19,194,194,0.16)',
          bg: '#e6fffb',
        },
        {
          key: 'yqrms',
          label: '已确认面试数量',
          value: this.MainData.yqrms || 0,
          icon: 'check-circle',
          color: '#52c41a',
          soft: 'rgba(82,196,26,0.16)',
          bg: '#f6ffed',
        },
        {
          key: 'fqms',
          label: '放弃面试数量',
          value: this.MainData.fqms || 0,
          icon: 'close-circle',
          color: '#f5222d',
          soft: 'rgba(245,34,45,0.16)',
          bg: '#fff1f0',
        },
        {
          key: 'ytt',
          label: '不通过数量',
          value: this.MainData.ytt || 0,
          icon: 'close-circle',
          color: '#f5222d',
          soft: 'rgba(245,34,45,0.16)',
          bg: '#fff1f0',
        },
        {
          key: 'ztyy',
          label: '暂停邀约数量',
          value: this.MainData.ztyy || 0,
          icon: 'pause-circle',
          color: '#8c8c8c',
          soft: 'rgba(140,140,140,0.16)',
          bg: '#fafafa',
        },
      ]
    },
  },
  created() {
    this.loadPlan()
    this.getMainData()
  },
  methods: {
    handleCollect() {
      let that = this

      this.$confirm({
        title: '提醒',
        content: `请确认简历是否收集完毕`,
        okText: '确认',
        cancelText: '取消',
        onOk() {
          postAction('/zpManage/hrmJlgl/complete', { ...that.record }).then((res) => {
            if (res.success) {
              that.$message.success(res.message || '操作成功')
              that.$emit('ok')
              that.handleBack()
            } else {
              that.$message.warning(res.message || '操作失败')
            }
          })
        },
        onCancel() {
          console.log('Cancel')
        },
      })
    },
    ok() {
      this.loadPlan()
      this.getMainData()
      this.$emit('ok')
    },
    getMainData() {
      if (!this.record.id) return
      getAction('/zpManage/hrmJlgl/list', { id: this.record.id }).then((res) => {
        if (res && res.success) {
          const records = res.result.records || res.result
          this.MainData = (Array.isArray(records) && records[0]) || {}
        }
      })
    },
    // 按招聘计划ID查计划数据，展示左侧岗位信息
    loadPlan() {
      if (!this.record.zpjhid) return
      getAction('/zpManage/hrmZpjh/list', { id: this.record.zpjhid }).then((res) => {
        if (res && res.success) {
          const records = res.result.records || res.result
          this.plan = (Array.isArray(records) && records[0]) || {}
        }
      })
    },
    formatText(value) {
      return value === undefined || value === null || (typeof value === 'string' && value.trim() === '') ? '-' : value
    },
    handleBack() {
      this.$emit('back')
    },
  },
}
</script>

<style scoped lang="less">
.detail-box {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

/* 顶部标题栏 */
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  margin: 0 -10px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
}

.header-left {
  display: flex;
  align-items: center;
}

.header-bar {
  width: 4px;
  height: 16px;
  margin-right: 10px;
  border-radius: 2px;
  background: #fff;
}

.post-title {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin-right: 12px;
}

.status-tag {
  margin-right: 0;
}

.header-btn-ghost {
  height: 32px;
  border-radius: 6px;
  color: #fff;
  border-color: rgba(255, 255, 255, 0.5);
  background: #16be49;

  &:hover,
  &:focus {
    color: #fff;
    border-color: #fff;
    background: rgb(31, 204, 123);
  }
}

.header-btn-solid {
  height: 32px;
  margin-left: 8px;
  border: 0;
  border-radius: 6px;
  color: #2d78ff;
  background: #fff;

  &:hover,
  &:focus {
    color: #2d78ff;
    background: #f0f6ff;
  }
}

/* 统计卡 */
.stat-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
  flex-shrink: 0;
  padding: 10px;
  border-bottom: 1px solid #e6f7ff;
  background: #e6efff;
  box-shadow: 1px 0 10px #ccc;
}

.stat-card {
  --c: #2d78ff;
  --soft: rgba(45, 120, 255, 0.16);
  --bg: #eef4ff;
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #edf0f5;
  border-radius: 8px;
  background: #fff;
  transition: all 0.22s ease;
  box-shadow: 0 0 10px #b8daff;

  &:hover {
    border-color: var(--c);
    background: var(--bg);
    transform: translateY(-2px);
    box-shadow: 0 4px 14px var(--soft);
  }
}

.stat-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  margin-right: 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--c);
  background: var(--soft);
}

.stat-main {
  min-width: 0;
}

.stat-num {
  font-size: 22px;
  font-weight: 700;
  color: #262626;
  line-height: 1.1;
}

.stat-label {
  margin-top: 2px;
  font-size: 12px;
  color: #8c8c8c;
  white-space: nowrap;
}

/* 主体 */
.detail-body {
  flex: 1;
  display: flex;
  gap: 12px;
  min-height: 0;
  padding: 10px;
  background: #f8feff;
}

.panel-title {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 700;
  color: #262626;
  padding-bottom: 10px;
}

/* 左面板 */
.left-panel {
  width: 450px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding-right: 12px;

  overflow-y: auto;
  box-shadow: 0 0 8px #b8daff;

  background: #fff;
  border-radius: 10px;
  padding: 10px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.info-item {
  padding: 8px 10px;
  border: 1px solid #edf0f5;
  border-radius: 6px;
  background: #fafbfd;
}

.info-label {
  display: block;
  margin-bottom: 3px;
  font-size: 12px;
  color: #8c8c8c;
}

.info-value {
  font-size: 13px;
  color: #262626;
  word-break: break-all;
}

.desc-row {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.desc-block {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.desc-title {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 6px;
}

.title-bar {
  width: 3px;
  height: 13px;
  margin-right: 6px;
  border-radius: 2px;
  background: #2d78ff;
}

.desc-text {
  flex: 1;
  padding: 10px;
  font-size: 13px;
  color: #595959;
  line-height: 1.6;
  border: 1px solid #edf0f5;
  border-radius: 6px;
  background: #fafbfd;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-y: auto;
  min-height: 120px;
}

/* 右面板 */
.right-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  box-shadow: 0 0 8px #b8daff;

  background: #fff;
  border-radius: 10px;
  padding: 10px;
}
</style>


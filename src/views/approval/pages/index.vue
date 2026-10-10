<template>
  <div class="approval-page">
    <div class="approval-shell">
      <div class="page-header">
        <div class="header-main">
          <div>
            <h1>我的审批</h1>
            <p>处理待我审核的全部单据</p>
          </div>
        </div>

        <div class="tabs">
          <div
            v-for="item in tabs"
            :key="item.key"
            :class="['tab-item', { active: activeTab === item.key }]"
            @click="handleTabChange(item.key)"
          >
            <span>{{ item.label }}</span>
            <span v-if="tabCounts[item.key]" class="tab-badge">{{ tabCounts[item.key] }}</span>
          </div>
        </div>
      </div>

      <div class="filter-bar">
        <div class="filter-row">
          <div class="filter-item">
            <label>申请类型</label>
            <a-select v-model="filterForm.type" allowClear placeholder="全部类型" style="width: 160px">
              <a-select-option v-for="item in typeOptions" :key="item" :value="item">
                {{ item }}
              </a-select-option>
            </a-select>
          </div>

          <div class="filter-item">
            <label>申请人</label>
            <a-input v-model="filterForm.applicant" allowClear placeholder="输入姓名搜索" style="width: 180px" />
          </div>

          <div class="filter-item filter-item-range">
            <label>日期范围</label>
            <a-range-picker v-model="filterForm.dateRange" format="YYYY-MM-DD" style="width: 260px" />
          </div>

          <div class="filter-actions">
            <a-button type="primary" class="gradient-btn" icon="search" @click="handleSearch">查询</a-button>
            <a-button icon="reload" @click="handleReset">重置</a-button>
          </div>
        </div>
      </div>

      <div class="content-body">
        <div class="list-panel">
          <a-button
            v-if="activeTab === 'pending'"
            class="batch-trigger"
            icon="check-circle"
            :disabled="!filteredRecords.length"
            @click="openBatchModal"
          >
            一键审批全部
          </a-button>

          <div v-if="filteredRecords.length" class="record-list">
            <div
              v-for="record in filteredRecords"
              :key="record.id"
              :class="['record-card', { active: selectedId === record.id }]"
              @click="handleSelectRecord(record)"
            >
              <span :class="['record-tag', record.t]">{{ record.type }}</span>
              <div class="record-title">{{ record.who }}提交的{{ record.type }}</div>
              <div class="record-meta">
                <span><a-icon type="bank" />{{ record.dept }}</span>
                <span><a-icon type="clock-circle" />{{ record.at }}</span>
              </div>
              <a-icon type="right" class="record-arrow" />
            </div>
          </div>

          <div v-else class="panel-empty">
            <a-empty description="暂无审批单据" />
          </div>
        </div>

        <div class="detail-panel">
          <template v-if="selectedRecord">
            <div class="detail-head">
              <h2>{{ getDetailTitle(selectedRecord) }}</h2>
              <span :class="['status-pill', getStatusMeta(selectedRecord.s).className]">
                <a-icon :type="getStatusMeta(selectedRecord.s).icon" />
                {{ getStatusMeta(selectedRecord.s).label }}
              </span>
            </div>

            <div class="detail-body">
              <div class="detail-main">
                <div class="section-card">
                  <div class="section-title">申请信息</div>
                  <div class="info-grid">
                    <div
                      v-for="item in getDetailFields(selectedRecord)"
                      :key="item.label"
                      :class="['info-item', { full: item.full }]"
                    >
                      <div class="info-label">{{ item.label }}</div>
                      <div class="info-value">{{ item.value }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="detail-side">
                <div class="section-card flow-card-wrap">
                  <div class="section-title">审批流程</div>
                  <div class="flow-list">
                    <div
                      v-for="(step, stepIndex) in selectedRecord.flow"
                      :key="selectedRecord.id + step.name + stepIndex"
                      class="flow-step"
                    >
                      <div class="flow-dot-col">
                        <div :class="['flow-dot', step.status]">
                          <a-icon :type="getFlowIcon(step.status)" />
                        </div>
                        <div v-if="stepIndex !== selectedRecord.flow.length - 1" class="flow-line"></div>
                      </div>

                      <div :class="['flow-step-card', step.status]">
                        <div class="flow-step-head">
                          <div class="flow-step-title">
                            <span>{{ step.name }}</span>
                            <span
                              v-if="step.tag"
                              :class="['flow-step-tag', step.tag === '会签' ? 'countersign' : 'or']"
                            >
                              {{ step.tag }}
                            </span>
                          </div>
                          <span :class="['flow-step-badge', getFlowBadgeClass(step.status)]">
                            {{ getFlowBadgeText(step.status) }}
                          </span>
                        </div>

                        <div class="flow-members">
                          <div v-for="(member, memberIndex) in step.members" :key="member.name + memberIndex" class="flow-member">
                            <span :class="['member-avatar', avatarThemes[memberIndex % avatarThemes.length]]">
                              {{ member.name.slice(0, 1) }}
                            </span>
                            <div class="member-info">
                              <div class="member-name">{{ member.name }}</div>
                              <div class="member-eid" v-if="member.eid">工号 {{ member.eid }}</div>
                              <div class="member-eid" v-else>抄送人</div>
                            </div>
                            <div class="member-result" v-if="getFlowResult(step) || member.time || step.time">
                              <span v-if="getFlowResult(step)" :class="['member-result-text', getFlowResultClass(step.status)]">
                                {{ getFlowResult(step) }}
                              </span>
                              <span v-if="member.time || (memberIndex === 0 && step.time)" class="member-time">
                                {{ member.time || step.time }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="selectedRecord.s === 'pending'" class="detail-actions">
                  <a-button type="primary" class="gradient-btn" icon="check" @click="handleApprove(selectedRecord)">
                    同意
                  </a-button>
                  <a-button icon="close" @click="openRejectModal(selectedRecord)">驳回</a-button>
                </div>
              </div>
            </div>
          </template>

          <div v-else class="detail-empty">
            <a-empty description="请从左侧选择一个审批单查看详情" />
          </div>
        </div>
      </div>
    </div>

    <a-modal
      title="一键审批"
      :visible="batchVisible"
      :getContainer="false"
      :destroyOnClose="true"
      wrapClassName="approval-batch-modal"
      @cancel="closeBatchModal"
    >
      <div v-if="batchGroups.length" class="batch-list">
        <div v-for="item in batchGroups" :key="item.type" class="batch-item" @click="toggleBatchType(item.type)">
          <a-checkbox
            :checked="batchSelectedTypes.indexOf(item.type) !== -1"
            @click.stop
            @change="handleBatchTypeChange(item.type, $event.target.checked)"
          />
          <div class="batch-item-body">
            <div class="batch-item-title">{{ item.type }}</div>
            <div class="batch-item-count">{{ item.count }} 条待审批</div>
          </div>
        </div>
      </div>
      <a-empty v-else description="当前筛选下没有可审批数据" />

      <template slot="footer">
        <a-button @click="closeBatchModal">取消</a-button>
        <a-button type="primary" class="gradient-btn" @click="submitBatchApprove">确认审批</a-button>
      </template>
    </a-modal>

    <a-modal
      title="驳回审批"
      :visible="rejectVisible"
      :getContainer="false"
      :destroyOnClose="true"
      wrapClassName="approval-reject-modal"
      @cancel="closeRejectModal"
    >
      <div class="reject-modal-body">
        <div class="reject-modal-label">驳回原因</div>
        <a-textarea v-model="rejectReason" :rows="4" placeholder="请输入驳回原因" />
      </div>

      <template slot="footer">
        <a-button @click="closeRejectModal">取消</a-button>
        <a-button type="primary" class="gradient-btn" @click="submitReject">确认驳回</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script>
import moment from 'moment'

const tabs = [
  { key: 'pending', label: '待审批' },
  { key: 'approved', label: '已审批' },
  { key: 'rejected', label: '已驳回' },
  { key: 'cc', label: '抄送我的' }
]

const typeOptions = ['加班申请', '补卡申请', '外出申请', '公车申请', '调岗申请', '请假申请']

const avatarThemes = ['theme-blue', 'theme-green', 'theme-orange', 'theme-purple', 'theme-pink']

const mockRecordSource = {
  pending: [
    {
      id: 'P01',
      who: '张伟',
      eid: 'EMP20220089',
      type: '加班申请',
      t: 't-overtime',
      why: '项目上线支持',
      from: '2026-06-17',
      to: '2026-06-17',
      d: 1,
      dept: '产品运营部',
      at: '2026-06-15 16:00',
      s: 'pending',
      note: '配合版本发布进行线上验证和监控。',
      startTime: '2026-06-17 18:00',
      endTime: '2026-06-17 22:00',
      hours: 4,
      flow: [
        {
          name: '部门经理',
          tag: '会签',
          status: 'done',
          result: '已同意',
          members: [{ name: '张永峰', eid: '4632' }, { name: '李明辉', eid: '5821' }],
          time: '2026-06-15 16:30'
        },
        {
          name: '部门总监',
          tag: '',
          status: 'done',
          result: '已同意',
          members: [{ name: '张三', eid: '9527' }],
          time: '2026-06-15 17:00'
        },
        {
          name: 'HR审批',
          tag: '',
          status: 'current',
          result: '',
          members: [{ name: '王丽', eid: '3412' }],
          time: ''
        },
        {
          name: '抄送',
          tag: '',
          status: 'pending',
          result: '',
          members: [{ name: '李芳', eid: '5518' }],
          time: ''
        }
      ]
    },
    {
      id: 'P02',
      who: '王芳',
      eid: 'EMP20210432',
      type: '补卡申请',
      t: 't-repair',
      why: '外勤忘打卡补录',
      from: '2026-06-12',
      to: '2026-06-12',
      d: 1,
      dept: '市场拓展部',
      at: '2026-06-15 09:15',
      s: 'pending',
      note: '当天外出拜访客户，忘记打卡，已提供客户拜访记录。',
      repairDate: '2026-06-12',
      exceptionType: '外勤漏打卡',
      repairTimes: '09:00、18:30',
      flow: [
        {
          name: '部门经理',
          tag: '',
          status: 'done',
          result: '已同意',
          members: [{ name: '孙丽', eid: '3829' }],
          time: '2026-06-15 10:00'
        },
        {
          name: '部门总监',
          tag: '',
          status: 'done',
          result: '已同意',
          members: [{ name: '黄鹏', eid: '7201' }],
          time: '2026-06-15 11:00'
        },
        {
          name: 'HR审批',
          tag: '',
          status: 'current',
          result: '',
          members: [{ name: '王丽', eid: '3412' }],
          time: ''
        },
        {
          name: '抄送',
          tag: '',
          status: 'pending',
          result: '',
          members: [{ name: '周明', eid: '6643' }],
          time: ''
        }
      ]
    }
  ],
  approved: [
    {
      id: 'A01',
      who: '赵大海',
      eid: 'EMP20200015',
      type: '外出申请',
      t: 't-out',
      why: '客户现场支撑',
      from: '2026-06-10',
      to: '2026-06-10',
      d: 1,
      dept: '技术支持部',
      at: '2026-06-08 10:20',
      s: 'approved',
      apt: '2026-06-08 15:30',
      note: '前往深圳客户现场进行系统升级部署。',
      flow: [
        {
          name: '部门经理',
          tag: '',
          status: 'done',
          result: '已同意',
          members: [{ name: '周鹏', eid: '5203' }],
          time: '2026-06-08 11:00'
        },
        {
          name: '部门总监',
          tag: '',
          status: 'done',
          result: '已同意',
          members: [{ name: '吴海', eid: '4098' }],
          time: '2026-06-08 14:30'
        },
        {
          name: 'HR审批',
          tag: '',
          status: 'done',
          result: '已备案',
          members: [{ name: '李芳', eid: '5518' }],
          time: '2026-06-08 15:30'
        }
      ]
    },
    {
      id: 'A03',
      who: '陈建军',
      eid: 'EMP20180056',
      type: '加班申请',
      t: 't-overtime',
      why: '季度报表赶制',
      from: '2026-06-08',
      to: '2026-06-08',
      d: 1,
      dept: '财务部',
      at: '2026-06-07 17:45',
      s: 'approved',
      apt: '2026-06-07 18:00',
      note: '季度财报数据汇总与核对。',
      startTime: '2026-06-08 09:00',
      endTime: '2026-06-08 18:00',
      hours: 8,
      flow: [
        {
          name: '部门经理',
          tag: '',
          status: 'done',
          result: '已同意',
          members: [{ name: '郑洁', eid: '1548' }],
          time: '2026-06-07 17:50'
        },
        {
          name: '部门总监',
          tag: '',
          status: 'done',
          result: '已同意',
          members: [{ name: '林涛', eid: '2309' }],
          time: '2026-06-07 18:00'
        }
      ]
    },
    {
      id: 'A04',
      who: '孙明辉',
      eid: 'EMP20220037',
      type: '补卡申请',
      t: 't-repair',
      why: '公司停电无法打卡',
      from: '2026-06-05',
      to: '2026-06-05',
      d: 1,
      dept: '行政部',
      at: '2026-06-05 10:30',
      s: 'approved',
      apt: '2026-06-05 11:00',
      note: '当天公司线路检修停电，无法正常打卡。',
      repairDate: '2026-06-05',
      exceptionType: '公司停电',
      repairTimes: '09:00、17:30',
      flow: [
        {
          name: '部门经理',
          tag: '',
          status: 'done',
          result: '已同意',
          members: [{ name: '高明', eid: '8734' }],
          time: '2026-06-05 10:45'
        },
        {
          name: 'HR审批',
          tag: '',
          status: 'done',
          result: '已备案',
          members: [{ name: '李芳', eid: '5518' }],
          time: '2026-06-05 11:00'
        }
      ]
    }
  ],
  rejected: [
    {
      id: 'R01',
      who: '吴志强',
      eid: 'EMP20190062',
      type: '补卡申请',
      t: 't-repair',
      why: '补录遗漏打卡',
      from: '2026-05-28',
      to: '2026-05-28',
      d: 1,
      dept: '销售部',
      at: '2026-06-10 16:20',
      s: 'rejected',
      rr: '超过补卡申请时限（7天内），不予补录。',
      rt: '2026-06-11 09:30',
      note: '上次出差后忘记及时申请补卡。',
      repairDate: '2026-05-28',
      exceptionType: '漏打卡',
      repairTimes: '09:00、18:00',
      flow: [
        {
          name: '部门经理',
          tag: '',
          status: 'done',
          result: '已同意',
          members: [{ name: '何强', eid: '7156' }],
          time: '2026-06-10 17:00'
        },
        {
          name: '部门总监',
          tag: '',
          status: 'done',
          result: '已同意',
          members: [{ name: '于飞', eid: '3902' }],
          time: '2026-06-11 09:00'
        },
        {
          name: 'HR审批',
          tag: '',
          status: 'rejected',
          result: '已驳回',
          comment: '超过补卡申请时限（7天内），不予补录。',
          members: [{ name: '李芳', eid: '5518' }],
          time: '2026-06-11 09:30'
        }
      ]
    }
  ],
  cc: [
    {
      id: 'C01',
      who: '马晓东',
      eid: 'EMP20170003',
      type: '公车申请',
      t: 't-other',
      why: '接待客户用车',
      from: '2026-06-20',
      to: '2026-06-20',
      d: 1,
      dept: '总经理办公室',
      at: '2026-06-15 11:00',
      s: 'cc',
      note: '接待重要客户，申请公司别克商务车一辆。',
      flow: [
        {
          name: '行政审批',
          tag: '',
          status: 'done',
          result: '已安排',
          members: [{ name: '高明', eid: '8734' }],
          time: '2026-06-15 14:00'
        },
        {
          name: '抄送',
          tag: '',
          status: 'cc',
          result: '已抄送',
          members: [{ name: '您', eid: '' }],
          time: '2026-06-15 14:00'
        }
      ]
    },
    {
      id: 'C02',
      who: '黄丽',
      eid: 'EMP20200519',
      type: '调岗申请',
      t: 't-other',
      why: '部门内部调岗',
      from: '2026-07-01',
      to: '2026-07-01',
      d: 1,
      dept: '人力资源部',
      at: '2026-06-13 14:30',
      s: 'cc',
      note: '由招聘组调至培训组，抄送上级领导知晓。',
      flow: [
        {
          name: 'HR经理',
          tag: '',
          status: 'done',
          result: '已同意',
          members: [{ name: '张敏', eid: '2817' }],
          time: '2026-06-13 16:00'
        },
        {
          name: '抄送',
          tag: '',
          status: 'cc',
          result: '已抄送',
          members: [{ name: '您', eid: '' }],
          time: '2026-06-13 16:00'
        }
      ]
    }
  ]
}

function createFilterForm() {
  return {
    type: undefined,
    applicant: '',
    dateRange: []
  }
}

function cloneMembers(members) {
  return members.map(member => ({ ...member }))
}

function cloneFlow(flow) {
  return flow.map(step => ({
    ...step,
    members: cloneMembers(step.members)
  }))
}

function cloneRecord(record) {
  return {
    ...record,
    flow: cloneFlow(record.flow)
  }
}

function createRecordMap() {
  return {
    pending: mockRecordSource.pending.map(cloneRecord),
    approved: mockRecordSource.approved.map(cloneRecord),
    rejected: mockRecordSource.rejected.map(cloneRecord),
    cc: mockRecordSource.cc.map(cloneRecord)
  }
}

export default {
  name: 'ApprovalPage',
  data() {
    return {
      tabs,
      typeOptions,
      avatarThemes,
      activeTab: 'pending',
      filterForm: createFilterForm(),
      appliedFilter: createFilterForm(),
      recordMap: createRecordMap(),
      selectedId: '',
      batchVisible: false,
      batchSelectedTypes: [],
      rejectVisible: false,
      rejectRecordId: '',
      rejectReason: ''
    }
  },
  computed: {
    tabCounts() {
      return {
        pending: this.recordMap.pending.length,
        approved: this.recordMap.approved.length,
        rejected: this.recordMap.rejected.length,
        cc: this.recordMap.cc.length
      }
    },
    currentRecords() {
      return this.recordMap[this.activeTab]
    },
    filteredRecords() {
      const filters = this.appliedFilter
      return this.currentRecords.filter(item => {
        if (filters.type && item.type !== filters.type) {
          return false
        }
        if (filters.applicant && item.who.indexOf(filters.applicant) === -1) {
          return false
        }
        if (filters.dateRange.length === 2) {
          const recordDate = moment(item.repairDate || item.from, 'YYYY-MM-DD')
          if (recordDate.isBefore(filters.dateRange[0], 'day') || recordDate.isAfter(filters.dateRange[1], 'day')) {
            return false
          }
        }
        return true
      })
    },
    selectedRecord() {
      return this.filteredRecords.find(item => item.id === this.selectedId) || null
    },
    batchGroups() {
      if (this.activeTab !== 'pending') {
        return []
      }

      const groupMap = {}
      this.filteredRecords.forEach(item => {
        if (!groupMap[item.type]) {
          groupMap[item.type] = {
            type: item.type,
            count: 0,
            ids: []
          }
        }
        groupMap[item.type].count += 1
        groupMap[item.type].ids.push(item.id)
      })

      return Object.keys(groupMap).map(key => groupMap[key])
    }
  },
  methods: {
    handleTabChange(tabKey) {
      if (this.activeTab === tabKey) {
        return
      }
      this.activeTab = tabKey
      this.selectedId = ''
    },
    handleSearch() {
      this.appliedFilter = {
        type: this.filterForm.type,
        applicant: this.filterForm.applicant.trim(),
        dateRange: this.filterForm.dateRange.slice()
      }
      this.selectedId = ''
    },
    handleReset() {
      this.filterForm = createFilterForm()
      this.appliedFilter = createFilterForm()
      this.selectedId = ''
    },
    handleSelectRecord(record) {
      this.selectedId = record.id
    },
    getStatusMeta(status) {
      return {
        pending: { label: '待审批', icon: 'clock-circle', className: 'is-pending' },
        approved: { label: '已通过', icon: 'check-circle', className: 'is-approved' },
        rejected: { label: '已驳回', icon: 'close-circle', className: 'is-rejected' },
        cc: { label: '抄送我的', icon: 'copy', className: 'is-cc' }
      }[status]
    },
    getDetailTitle(record) {
      const suffix = record.t === 't-repair' || record.t === 't-overtime' ? record.at : record.why
      return suffix ? `${record.who}的${record.type} - ${suffix}` : `${record.who}的${record.type}`
    },
    getDetailFields(record) {
      const fields = [
        { label: '申请人', value: record.who },
        { label: '员工工号', value: record.eid },
        { label: '所属部门', value: record.dept },
        { label: '提交时间', value: record.at }
      ]

      if (record.t === 't-overtime') {
        fields.push(
          { label: '加班日期', value: record.from },
          { label: '加班开始时间', value: record.startTime || '—' },
          { label: '加班结束时间', value: record.endTime || '—' },
          { label: '加班时长', value: `${record.hours} 小时` },
          { label: '加班原因', value: record.why }
        )
      } else if (record.t === 't-repair') {
        fields.push(
          { label: '补卡日期', value: record.repairDate || record.from },
          { label: '异常类型', value: record.exceptionType || '—' },
          { label: '补卡时间', value: record.repairTimes || '—' },
          { label: '补卡原因', value: record.why }
        )
      } else if (record.t === 't-leave') {
        fields.push(
          { label: '请假类型', value: record.why },
          { label: '开始日期', value: record.from },
          { label: '结束日期', value: record.to },
          { label: '天数', value: `${record.d} 天` }
        )
      } else {
        fields.push(
          { label: '申请事由', value: record.why },
          { label: '日期', value: record.from === record.to ? record.from : `${record.from} ~ ${record.to}` }
        )
        if (record.d) {
          fields.push({ label: '天数', value: `${record.d} 天` })
        }
      }

      if (record.s === 'approved') {
        fields.push({ label: '审批时间', value: record.apt })
      }
      if (record.s === 'rejected') {
        fields.push(
          { label: '驳回时间', value: record.rt },
          { label: '驳回原因', value: record.rr, full: true }
        )
      }

      fields.push({ label: '备注说明', value: record.note, full: true })
      return fields
    },
    getFlowIcon(status) {
      return {
        done: 'check',
        current: 'loading',
        pending: 'clock-circle',
        rejected: 'close',
        cc: 'copy'
      }[status]
    },
    getFlowBadgeText(status) {
      return {
        done: '已完成',
        current: '审批中',
        pending: '待审批',
        rejected: '已驳回',
        cc: '已抄送'
      }[status]
    },
    getFlowBadgeClass(status) {
      return {
        done: 'is-done',
        current: 'is-current',
        pending: 'is-pending',
        rejected: 'is-rejected',
        cc: 'is-cc'
      }[status]
    },
    getFlowResult(step) {
      return step.comment || step.result || (step.status === 'pending' ? '待处理' : '')
    },
    getFlowResultClass(status) {
      return {
        done: 'is-done',
        current: 'is-current',
        pending: 'is-pending',
        rejected: 'is-rejected',
        cc: 'is-cc'
      }[status]
    },
    openBatchModal() {
      this.batchSelectedTypes = this.batchGroups.length ? [this.batchGroups[0].type] : []
      this.batchVisible = true
    },
    closeBatchModal() {
      this.batchVisible = false
      this.batchSelectedTypes = []
    },
    handleBatchTypeChange(type, checked) {
      if (checked) {
        if (this.batchSelectedTypes.indexOf(type) === -1) {
          this.batchSelectedTypes = this.batchSelectedTypes.concat(type)
        }
        return
      }
      this.batchSelectedTypes = this.batchSelectedTypes.filter(item => item !== type)
    },
    toggleBatchType(type) {
      if (this.batchSelectedTypes.indexOf(type) === -1) {
        this.batchSelectedTypes = this.batchSelectedTypes.concat(type)
        return
      }
      this.batchSelectedTypes = this.batchSelectedTypes.filter(item => item !== type)
    },
    submitBatchApprove() {
      if (!this.batchSelectedTypes.length) {
        this.$message.warning('请选择要审批的申请类型')
        return
      }

      const approvedAt = moment().format('YYYY-MM-DD HH:mm')
      const targetIds = this.filteredRecords
        .filter(item => this.batchSelectedTypes.indexOf(item.type) !== -1)
        .map(item => item.id)
      const movedRecords = []

      this.recordMap.pending = this.recordMap.pending.filter(item => {
        if (targetIds.indexOf(item.id) !== -1) {
          movedRecords.push(item)
          return false
        }
        return true
      })

      this.recordMap.approved = movedRecords.map(item => this.buildApprovedRecord(item, approvedAt)).concat(this.recordMap.approved)
      this.closeBatchModal()
      this.selectedId = ''
      this.$message.success(`已通过 ${movedRecords.length} 条审批`)
    },
    handleApprove(record) {
      const sourceRecord = this.removePendingRecord(record.id)
      const approvedAt = moment().format('YYYY-MM-DD HH:mm')
      const approvedRecord = this.buildApprovedRecord(sourceRecord, approvedAt)

      this.recordMap.approved.unshift(approvedRecord)
      this.activeTab = 'approved'
      this.selectedId = approvedRecord.id
      this.$message.success('审批已通过')
    },
    openRejectModal(record) {
      this.rejectRecordId = record.id
      this.rejectReason = ''
      this.rejectVisible = true
    },
    closeRejectModal() {
      this.rejectVisible = false
      this.rejectRecordId = ''
      this.rejectReason = ''
    },
    submitReject() {
      const reason = this.rejectReason.trim()
      if (!reason) {
        this.$message.warning('请输入驳回原因')
        return
      }

      const sourceRecord = this.removePendingRecord(this.rejectRecordId)
      const rejectedAt = moment().format('YYYY-MM-DD HH:mm')
      const rejectedRecord = this.buildRejectedRecord(sourceRecord, reason, rejectedAt)

      this.recordMap.rejected.unshift(rejectedRecord)
      this.closeRejectModal()
      this.activeTab = 'rejected'
      this.selectedId = rejectedRecord.id
      this.$message.success('审批已驳回')
    },
    removePendingRecord(id) {
      const index = this.recordMap.pending.findIndex(item => item.id === id)
      const record = this.recordMap.pending[index]
      this.recordMap.pending.splice(index, 1)
      return record
    },
    buildApprovedRecord(record, approvedAt) {
      return {
        ...record,
        s: 'approved',
        apt: approvedAt,
        flow: record.flow.map(step => {
          if (step.status === 'done' || step.status === 'cc') {
            return step
          }

          const status = step.name === '抄送' ? 'cc' : 'done'
          const result = step.name === '抄送' ? '已抄送' : (step.name.indexOf('HR') !== -1 ? '已备案' : '已同意')

          return {
            ...step,
            status,
            result,
            time: approvedAt,
            members: step.members.map((member, index) => ({
              ...member,
              time: member.time || (index === 0 ? approvedAt : '')
            }))
          }
        })
      }
    },
    buildRejectedRecord(record, reason, rejectedAt) {
      const flow = []

      record.flow.forEach(step => {
        if (step.status === 'done') {
          flow.push(step)
          return
        }

        if (step.status === 'current') {
          flow.push({
            ...step,
            status: 'rejected',
            result: '已驳回',
            comment: reason,
            time: rejectedAt,
            members: step.members.map((member, index) => ({
              ...member,
              time: member.time || (index === 0 ? rejectedAt : '')
            }))
          })
        }
      })

      return {
        ...record,
        s: 'rejected',
        rr: reason,
        rt: rejectedAt,
        flow
      }
    }
  }
}
</script>

<style scoped lang="less">
.approval-page {
  --bg: #f0f3f8;
  --card: #ffffff;
  --fg: #1a2c3e;
  --fg2: #526174;
  --fg3: #8b9aaf;
  --primary: #4f6ef6;
  --primary-rgb: 79, 110, 246;
  --grad: linear-gradient(135deg, #4f6ef6 0%, #7c5cfc 50%, #38bdf8 100%);
  --border: #e2e8f0;

  height: calc(100vh - 120px - 24px);
  overflow: auto;
  padding: 20px;
  background: linear-gradient(180deg, #eef1f8 0%, #f0f3f8 40%, #f4f6fb 100%);
  color: var(--fg);
}

.approval-shell {
  height: 100%;
  display: flex;
  flex-direction: column;
  // overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(16, 24, 40, 0.08);
}

.page-header {
  padding: 26px 32px 0;
  background: linear-gradient(180deg, rgba(79, 110, 246, 0.03) 0%, transparent 100%);
}

.header-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.header-main h1 {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 700;
  background: var(--grad);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-main p {
  margin: 0;
  font-size: 12px;
  color: var(--fg3);
}

.tabs {
  display: flex;
  gap: 2px;
  border-bottom: 1px solid var(--border);
}

.tab-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 11px 24px;
  font-size: 13px;
  font-weight: 500;
  color: var(--fg2);
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-item:hover {
  color: var(--fg);
  background: rgba(var(--primary-rgb), 0.04);
}

.tab-item.active {
  color: var(--primary);
  font-weight: 600;
  background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.08) 0%, rgba(124, 92, 252, 0.06) 100%);
  box-shadow: 0 -1px 8px rgba(var(--primary-rgb), 0.08);
}

.tab-badge {
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 11px;
  line-height: 22px;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--primary);
  background: rgba(var(--primary-rgb), 0.12);
}

.tab-item.active .tab-badge {
  color: #ffffff;
  background: var(--primary);
}

.filter-bar {
  padding: 12px 32px;
  border-bottom: 1px solid var(--border);
  background: linear-gradient(180deg, rgba(79, 110, 246, 0.02) 0%, transparent 100%);
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px 16px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-item label {
  color: var(--fg3);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.filter-actions {
  display: flex;
  gap: 8px;
}

.gradient-btn {
  border: none;
  background: var(--grad);
  box-shadow: 0 4px 14px rgba(var(--primary-rgb), 0.25);
}

.gradient-btn:hover,
.gradient-btn:focus {
  border: none;
  background: var(--grad);
  box-shadow: 0 6px 22px rgba(var(--primary-rgb), 0.35);
}

.content-body {
  display: flex;
  flex: 1;
  min-height: 0;
}

.list-panel {
  width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 12px;
  border-right: 1px solid var(--border);
  background: rgba(248, 250, 255, 0.7);
}

.batch-trigger {
  height: 40px;
  border-radius: 12px;
  color: var(--primary);
  border: 1px dashed rgba(var(--primary-rgb), 0.25);
  background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.07) 0%, rgba(124, 92, 252, 0.04) 100%);
}

.batch-trigger:hover,
.batch-trigger:focus {
  color: var(--primary);
  border-color: rgba(var(--primary-rgb), 0.45);
  background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.1) 0%, rgba(124, 92, 252, 0.08) 100%);
}

.record-list,
.detail-panel,
.flow-list {
  min-height: 0;
  overflow: auto;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.record-card {
  position: relative;
  padding: 16px 18px;
  border: 1px solid rgba(var(--primary-rgb), 0.08);
  border-radius: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #fafbff 100%);
  cursor: pointer;
  transition: all 0.25s ease;
}

.record-card:hover {
  transform: translateY(-1px);
  border-color: rgba(var(--primary-rgb), 0.2);
  box-shadow: 0 4px 18px rgba(var(--primary-rgb), 0.08);
}

.record-card.active {
  border-color: rgba(var(--primary-rgb), 0.35);
  background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1), 0 8px 24px rgba(var(--primary-rgb), 0.12);
}

.record-tag {
  display: inline-block;
  margin-bottom: 10px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.t-leave {
  color: #dc2626;
  background: linear-gradient(135deg, #fee2e2, #fecaca);
}

.t-overtime {
  color: #d97706;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
}

.t-repair {
  color: #2563eb;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
}

.t-out {
  color: #059669;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
}

.t-other {
  color: #7c3aed;
  background: linear-gradient(135deg, #ede9fe, #ddd6fe);
}

.record-title {
  margin-bottom: 8px;
  padding-right: 20px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
}

.record-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  color: var(--fg3);
  font-size: 11px;
}

.record-meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.record-arrow {
  position: absolute;
  top: 50%;
  right: 14px;
  color: var(--fg3);
  transform: translateY(-50%);
}

.record-card.active .record-arrow {
  color: var(--primary);
}

.detail-panel {
  flex: 1;
  padding: 28px 36px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(248, 250, 255, 0.92) 100%);
}

.detail-head {
  margin-bottom: 24px;
  padding-bottom: 18px;
  border-bottom: 2px solid transparent;
  border-image: var(--grad) 1;
}

.detail-head h2 {
  margin: 0 0 12px;
  font-size: 19px;
  font-weight: 700;
  line-height: 1.5;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-pill.is-pending {
  color: #b45309;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
}

.status-pill.is-approved {
  color: #047857;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
}

.status-pill.is-rejected {
  color: #dc2626;
  background: linear-gradient(135deg, #fee2e2, #fecaca);
}

.status-pill.is-cc {
  color: #1d4ed8;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
}

.detail-body {
  display: flex;
  gap: 24px;
}

.detail-main {
  flex: 1;
  min-width: 0;
}

.detail-side {
  width: 400px;
  flex-shrink: 0;
}

.section-card {
  padding: 18px;
  border: 1px solid rgba(79, 110, 246, 0.08);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  font-size: 13px;
  font-weight: 600;
}

.section-title::before {
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: var(--grad);
  content: '';
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 28px;
}

.info-item.full {
  grid-column: 1 / -1;
}

.info-label {
  margin-bottom: 6px;
  color: var(--fg2);
  font-size: 12px;
  font-weight: 500;
}

.info-value {
  min-height: 40px;
  padding: 8px 12px;
  color: var(--fg);
  font-size: 13px;
  font-weight: 500;
  line-height: 1.6;
  white-space: pre-line;
  border: 1px solid #e8ecf2;
  border-radius: 8px;
  background: #f3f5f9;
}

.flow-card-wrap {
  background: #f8f9fc;
}

.flow-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.flow-step {
  display: flex;
  align-items: flex-start;
}

.flow-dot-col {
  position: relative;
  width: 24px;
  flex-shrink: 0;
}

.flow-dot {
  position: relative;
  z-index: 1;
  width: 18px;
  height: 18px;
  margin-top: 6px;
  border-radius: 50%;
  color: #ffffff;
  font-size: 10px;
  line-height: 18px;
  text-align: center;
}

.flow-dot.done {
  background: #10b981;
}

.flow-dot.current {
  background: var(--primary);
  box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.15);
}

.flow-dot.pending {
  background: #cbd5e1;
}

.flow-dot.rejected {
  background: #ef4444;
}

.flow-dot.cc {
  background: #8b5cf6;
}

.flow-line {
  position: absolute;
  top: 28px;
  bottom: -12px;
  left: 8px;
  width: 1px;
  background: #dce1ea;
}

.flow-step-card {
  flex: 1;
  margin-left: 8px;
  padding: 10px 12px;
  border: 1px solid #e8ecf2;
  border-radius: 10px;
  background: #ffffff;
}

.flow-step-card.current {
  border-color: rgba(var(--primary-rgb), 0.24);
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.08);
}

.flow-step-card.rejected {
  border-color: rgba(239, 68, 68, 0.2);
}

.flow-step-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.flow-step-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
}

.flow-step-tag {
  padding: 1px 6px;
  border-radius: 8px;
  font-size: 10px;
}

.flow-step-tag.countersign {
  color: var(--primary);
  background: rgba(var(--primary-rgb), 0.08);
}

.flow-step-tag.or {
  color: #d97706;
  background: rgba(245, 158, 11, 0.08);
}

.flow-step-badge {
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
}

.flow-step-badge.is-done {
  color: #059669;
  background: rgba(16, 185, 129, 0.1);
}

.flow-step-badge.is-current {
  color: var(--primary);
  background: rgba(var(--primary-rgb), 0.1);
}

.flow-step-badge.is-pending {
  color: #64748b;
  background: rgba(148, 163, 184, 0.1);
}

.flow-step-badge.is-rejected {
  color: #dc2626;
  background: rgba(239, 68, 68, 0.1);
}

.flow-step-badge.is-cc {
  color: #7c3aed;
  background: rgba(139, 92, 246, 0.1);
}

.flow-members {
  display: flex;
  flex-direction: column;
}

.flow-member {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
}

.flow-member + .flow-member {
  border-top: 1px solid #f0f2f6;
}

.member-avatar {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border-radius: 50%;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  line-height: 24px;
  text-align: center;
}

.member-avatar.theme-blue {
  background: linear-gradient(135deg, #4f6ef6, #7c5cfc);
}

.member-avatar.theme-green {
  background: linear-gradient(135deg, #10b981, #34d399);
}

.member-avatar.theme-orange {
  background: linear-gradient(135deg, #f59e0b, #f97316);
}

.member-avatar.theme-purple {
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
}

.member-avatar.theme-pink {
  background: linear-gradient(135deg, #ec4899, #f472b6);
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-size: 12px;
  font-weight: 600;
}

.member-eid,
.member-time {
  color: var(--fg3);
  font-size: 10px;
}

.member-result {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  white-space: nowrap;
}

.member-result-text {
  font-size: 10px;
  font-weight: 600;
}

.member-result-text.is-done {
  color: #059669;
}

.member-result-text.is-current,
.member-result-text.is-pending {
  color: #64748b;
}

.member-result-text.is-rejected {
  color: #dc2626;
}

.member-result-text.is-cc {
  color: #7c3aed;
}

.detail-actions {
  display: flex;
  gap: 12px;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
}

.panel-empty,
.detail-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
}

.batch-list {
  display: flex;
  flex-direction: column;
}

.batch-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  cursor: pointer;
}

.batch-item + .batch-item {
  border-top: 1px solid #f0f2f6;
}

.batch-item-body {
  flex: 1;
}

.batch-item-title {
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 600;
}

.batch-item-count {
  color: var(--fg3);
  font-size: 12px;
}

.reject-modal-body {
  padding-top: 4px;
}

.reject-modal-label {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
}

@media (max-width: 1280px) {
  .content-body {
    flex-direction: column;
  }

  .list-panel {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--border);
  }

  .record-list {
    max-height: 320px;
  }

  .detail-body {
    flex-direction: column;
  }

  .detail-side {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .approval-page {
    padding: 12px;
  }

  .page-header,
  .filter-bar,
  .detail-panel {
    padding-left: 16px;
    padding-right: 16px;
  }

  .tabs {
    overflow: auto;
  }

  .filter-item,
  .filter-actions {
    width: 100%;
  }

  .filter-item /deep/ .ant-select,
  .filter-item /deep/ .ant-calendar-picker,
  .filter-item /deep/ .ant-input {
    width: 100% !important;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<template>
  <div class="my-apply-wrap">
    <!-- 头部 -->
    <div class="ma-header">
      <div class="ma-tabs">
        <div v-for="tab in tabList" :key="tab.key" class="ma-tab" :class="{ active: activeTab === tab.key }"
          @click="switchTab(tab.key)">
          {{ tab.label }}
          <span class="ma-tab-badge">{{ getTabCount(tab.key) }}</span>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="ma-filter-bar">
      <div class="ma-filter-row">
        <div class="ma-filter-item">
          <label>申请类型</label>
          <select v-model="filterForm.type" class="ma-native-select">
            <option value="">全部类型</option>
            <option v-for="t in applyTypeList" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <div class="ma-filter-item">
          <label>申请人</label>
          <input v-model="filterForm.who" type="text" class="ma-native-input ma-input-text" placeholder="输入姓名搜索" />
        </div>
        <div class="ma-filter-item">
          <label>日期范围</label>
          <div class="ma-date-range">
            <input v-model="filterForm.dateFrom" type="date" class="ma-native-input" />
            <span>至</span>
            <input v-model="filterForm.dateTo" type="date" class="ma-native-input" />
          </div>
        </div>
        <div class="ma-filter-actions">
          <button class="ma-filter-btn ma-filter-btn-primary" @click="applyFilter">
            <a-icon type="search" /> 查询
          </button>
          <button class="ma-filter-btn ma-filter-btn-reset" @click="resetFilter">
            <a-icon type="reload" /> 重置
          </button>
        </div>
      </div>
    </div>

    <!-- 主内容 -->
    <div class="ma-main">
      <!-- 左侧列表 -->
      <div class="ma-left">
        <button v-if="activeTab === 'pending'" class="ma-batch-btn" @click="openBatchModal">
          <a-icon type="check-circle" theme="twoTone" /> 一键审批全部
        </button>
        <div class="ma-card-list">
          <template v-if="filteredList.length">
            <div v-for="(item, idx) in filteredList" :key="item.id" class="ma-card"
              :class="{ active: selectedId === item.id }" :style="{ animationDelay: idx * 0.04 + 's' }"
              @click="selectItem(item.id)">
              <div class="ma-card-tag" :class="item.t">{{ item.type }}</div>
              <div class="ma-card-name">{{ item.who }}提交的{{ item.type }}</div>
              <div class="ma-card-meta">
                <span><a-icon type="bank" />{{ item.dept }}</span>
                <span><a-icon type="clock-circle" />{{ item.at }}</span>
              </div>
              <div class="ma-card-arrow"><a-icon type="right" /></div>
            </div>
          </template>
          <div v-else class="ma-empty-list">
            <a-icon type="file-text" />
            <span>暂无审批单据</span>
          </div>
        </div>
      </div>

      <!-- 右侧详情 -->
      <div class="ma-right">
        <template v-if="selectedItem">
          <div class="ma-detail-head">
            <div class="ma-dh-title-row">
              <h2>{{ detailTitle }}</h2>
              <span class="ma-sp" :class="statusMap[selectedItem.s].cls">
                <a-icon :type="statusMap[selectedItem.s].icon" />
                {{ statusMap[selectedItem.s].text }}
              </span>
            </div>
          </div>

          <div class="ma-detail-body">
            <div class="ma-detail-left">
              <div class="ma-group">
                <div class="ma-g-title">申请信息</div>
                <div class="ma-info-grid">
                  <div v-for="(info, idx) in infoItems" :key="idx" class="ma-info-item" :class="{ full: info.full }">
                    <div class="ma-info-label">{{ info.label }}</div>
                    <div class="ma-info-value">{{ info.value }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="ma-detail-right">
              <div class="ma-flow-block">
                <div class="ma-g-title">审批流程</div>
                <div class="ma-flow-list">
                  <div v-for="(step, sIdx) in selectedItem.flow" :key="sIdx" class="ma-flow-step-row">
                    <div class="ma-flow-dot-col">
                      <div class="ma-flow-dot-icon" :class="step.status">
                        <a-icon :type="flowIconMap[step.status] || 'circle'" />
                      </div>
                    </div>
                    <div class="ma-flow-step-card" :class="step.status">
                      <div class="ma-flow-card-header">
                        <div class="ma-flow-card-title">
                          {{ step.name }}
                          <span v-if="step.tag" class="ma-flow-card-tag"
                            :class="step.tag === '会签' ? 'countersign' : 'or'">{{ step.tag }}</span>
                        </div>
                        <span class="ma-flow-card-badge" :class="flowBadgeMap[step.status].cls">
                          {{ flowBadgeMap[step.status].text }}
                        </span>
                      </div>
                      <div class="ma-flow-person-list">
                        <div v-for="(member, mIdx) in step.members" :key="mIdx" class="ma-flow-person">
                          <div class="ma-flow-tags">
                            <span class="ma-flow-tag ma-flow-tag-name">
                              {{ member.name }} · 工号 {{ member.eid }}
                            </span>
                          </div>
                          <div class="ma-flow-person-right">
                            <span v-if="getPersonResult(step)" class="ma-flow-person-result"
                              :class="getPersonResultCls(step)">{{ getPersonResult(step) }}</span>
                            <span v-if="member.time || step.time" class="ma-flow-person-time">
                              {{ member.time || step.time }}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div v-if="step.comment" class="ma-flow-comment">
                        <a-icon type="message" />
                        <span>{{ step.comment }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 待审批：审批操作区 -->
              <div v-if="selectedItem.s === 'pending'" class="ma-approval-action">
                <div class="ma-opinion-wrap">
                  <div class="ma-opinion-label">
                    审批意见<span class="ma-opt">选填</span>
                  </div>
                  <a-textarea v-model="opinion" class="ma-opinion-area" placeholder="可填写审批意见（选填），如补充说明、注意事项等"
                    :autosize="{ minRows: 3 }" />
                </div>
                <div class="ma-action-bar">
                  <a-button type="primary" class="ma-btn ma-btn-primary" @click="handleApprove">
                    <a-icon type="check" /> 同意
                  </a-button>
                  <a-button class="ma-btn ma-btn-outline" @click="handleReject">
                    <a-icon type="close" /> 驳回
                  </a-button>
                </div>
              </div>

              <!-- 非待审批：仅查看提示 -->
              <div v-else class="ma-action-bar">
                <div class="ma-readonly-tip">
                  <a-icon type="info-circle" />
                  仅查看，该单据已{{ statusMap[selectedItem.s].text }}
                </div>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="ma-detail-empty">
          <a-icon type="file-text" />
          <span>请从左侧选择一个审批单查看详情</span>
        </div>
      </div>
    </div>

    <!-- 一键审批弹窗 -->
    <a-modal v-model="batchVisible" :footer="null" :width="480" centered
      :closable="false" :body-style="{ padding: 0 }" class="ma-batch-modal"
      :title="null">
      <div class="ma-batch-modal-head">
        <button class="ma-batch-modal-back" @click="batchVisible = false">
          <a-icon type="left" />
        </button>
        <span class="ma-batch-modal-title">一键审批</span>
      </div>
      <div class="ma-batch-body">
        <div v-for="(t, idx) in batchTypes" :key="idx" class="ma-batch-type-item" @click="toggleBatchType(idx)">
          <div class="ma-batch-check" :class="{ checked: batchSelectedIdxs.includes(idx) }">
            <a-icon v-if="batchSelectedIdxs.includes(idx)" type="check" />
          </div>
          <div class="ma-batch-type-info">
            <span class="ma-batch-type-name">{{ t.name }}</span>
            <span class="ma-batch-type-count">({{ t.count }})</span>
          </div>
        </div>
      </div>
      <div class="ma-batch-foot">
        <button class="ma-batch-submit" @click="submitBatchApprove">
          <a-icon type="check-circle" /> 确认审批
        </button>
      </div>
    </a-modal>

    <!-- 驳回确认弹窗 -->
    <a-modal v-model="rejectVisible" title="驳回确认" ok-text="确认驳回" cancel-text="取消"
      :ok-button-props="{ props: { type: 'danger' } }" @ok="confirmReject">
      <div class="ma-reject-body">
        <p style="font-size: 13px; line-height: 1.6; margin-bottom: 10px;">
          确认驳回该审批单？<span style="font-weight: 600; color: #2563eb;">（{{ selectedId }}）</span>
        </p>
        <div class="ma-opinion-label" style="margin-bottom: 8px;">
          驳回原因<span class="ma-opt" style="color: #ef4444;">必填</span>
        </div>
        <a-textarea v-model="rejectReason" placeholder="请填写驳回原因" :autosize="{ minRows: 3 }" />
      </div>
    </a-modal>
  </div>
</template>

<script>
export default {
  name: 'WbApplyApproval',
  data() {
    return {
      activeTab: 'pending',
      selectedId: null,
      filterActive: false,
      opinion: '',
      rejectVisible: false,
      rejectReason: '',
      batchVisible: false,
      batchTypes: [],
      batchSelectedIdxs: [],
      filterForm: {
        type: '',
        who: '',
        dateFrom: '',
        dateTo: '',
      },
      tabList: [
        { key: 'pending', label: '待审批' },
        { key: 'approved', label: '已通过' },
        { key: 'rejected', label: '已驳回' },
        { key: 'cancelled', label: '已取消' },
        { key: 'cc', label: '抄送我的' },
      ],
      applyTypeList: [
        '加班申请', '补卡申请', '外出申请', '公车申请', '调岗申请', '请假申请',
      ],
      // 模拟数据 - 审批视角
      myData: {
        pending: [
          {
            id: 'P01', who: '张伟', eid: 'EMP20220089', type: '加班申请', t: 't-overtime',
            why: '项目上线支持', from: '2026-06-17', to: '2026-06-17', d: 1,
            dept: '产品运营部', at: '2026-06-15 16:00', s: 'pending',
            note: '配合版本发布进行线上验证和监控。',
            startTime: '2026-06-17 18:00', endTime: '2026-06-17 22:00', hours: 4,
            flow: [
              {
                name: '部门经理', tag: '会签', status: 'done', result: '已同意',
                members: [{ name: '张永峰', eid: '4632' }, { name: '李明辉', eid: '5821' }],
                time: '2026-06-15 16:30'
              },
              {
                name: '部门总监', tag: '', status: 'done', result: '已同意',
                members: [{ name: '张三', eid: '9527' }, { name: '赵磊', eid: '8401' }, { name: '陈伟', eid: '6315' }],
                time: '2026-06-15 17:00'
              },
              {
                name: 'HR审批', tag: '', status: 'current', result: '',
                members: [{ name: '王丽', eid: '3412' }], time: ''
              },
              {
                name: '抄送', tag: '', status: 'pending', result: '',
                members: [{ name: '李芳', eid: '5518' }], time: ''
              },
            ],
          },
          {
            id: 'P02', who: '王芳', eid: 'EMP20210432', type: '补卡申请', t: 't-repair',
            why: '外勤忘打卡补录', from: '2026-06-12', to: '2026-06-12', d: 1,
            dept: '市场拓展部', at: '2026-06-15 09:15', s: 'pending',
            note: '当天外出拜访客户，忘记打卡，已提供客户拜访记录。',
            repairDate: '2026-06-12', exceptionType: '外勤漏打卡', repairTimes: '09:00、18:30',
            flow: [
              {
                name: '部门经理', tag: '', status: 'done', result: '已同意',
                members: [{ name: '孙丽', eid: '3829' }], time: '2026-06-15 10:00'
              },
              {
                name: '部门总监', tag: '', status: 'done', result: '已同意',
                members: [{ name: '黄鹏', eid: '7201' }, { name: '刘洋', eid: '5532' }, { name: '徐强', eid: '7746' }],
                time: '2026-06-15 11:00'
              },
              {
                name: 'HR审批', tag: '', status: 'current', result: '',
                members: [{ name: '王丽', eid: '3412' }], time: ''
              },
              {
                name: '抄送', tag: '', status: 'pending', result: '',
                members: [{ name: '周明', eid: '6643' }], time: ''
              },
            ],
          },
        ],
        approved: [
          {
            id: 'A01', who: '赵大海', eid: 'EMP20200015', type: '外出申请', t: 't-out',
            why: '客户现场支撑', from: '2026-06-10', to: '2026-06-10', d: 1,
            dept: '技术支持部', at: '2026-06-08 10:20', s: 'approved', apt: '2026-06-08 15:30',
            note: '前往深圳客户现场进行系统升级部署。',
            flow: [
              {
                name: '部门经理', tag: '', status: 'done', result: '已同意',
                members: [{ name: '周鹏', eid: '5203' }], time: '2026-06-08 11:00'
              },
              {
                name: '部门总监', tag: '', status: 'done', result: '已同意',
                members: [{ name: '吴海', eid: '4098' }, { name: '孙浩', eid: '2287' }, { name: '马俊', eid: '9061' }],
                time: '2026-06-08 14:30'
              },
              {
                name: 'HR审批', tag: '', status: 'done', result: '已备案',
                members: [{ name: '李芳', eid: '5518' }], time: '2026-06-08 15:30'
              },
            ],
          },
          {
            id: 'A03', who: '陈建军', eid: 'EMP20180056', type: '加班申请', t: 't-overtime',
            why: '季度报表赶制', from: '2026-06-08', to: '2026-06-08', d: 1,
            dept: '财务部', at: '2026-06-07 17:45', s: 'approved', apt: '2026-06-07 18:00',
            note: '季度财报数据汇总与核对。',
            startTime: '2026-06-08 09:00', endTime: '2026-06-08 18:00', hours: 8,
            flow: [
              {
                name: '部门经理', tag: '', status: 'done', result: '已同意',
                members: [{ name: '郑洁', eid: '1548' }], time: '2026-06-07 17:50'
              },
              {
                name: '部门总监', tag: '', status: 'done', result: '已同意',
                members: [{ name: '林涛', eid: '2309' }, { name: '朱琳', eid: '4470' }, { name: '高远', eid: '8893' }],
                time: '2026-06-07 18:00'
              },
            ],
          },
          {
            id: 'A04', who: '孙明辉', eid: 'EMP20220037', type: '补卡申请', t: 't-repair',
            why: '公司停电无法打卡', from: '2026-06-05', to: '2026-06-05', d: 1,
            dept: '行政部', at: '2026-06-05 10:30', s: 'approved', apt: '2026-06-05 11:00',
            note: '当天公司线路检修停电，无法正常打卡。',
            repairDate: '2026-06-05', exceptionType: '公司停电', repairTimes: '09:00、17:30',
            flow: [
              {
                name: '部门经理', tag: '', status: 'done', result: '已同意',
                members: [{ name: '高明', eid: '8734' }], time: '2026-06-05 10:45'
              },
              {
                name: 'HR审批', tag: '', status: 'done', result: '已备案',
                members: [{ name: '李芳', eid: '5518' }], time: '2026-06-05 11:00'
              },
            ],
          },
        ],
        rejected: [
          {
            id: 'R01', who: '吴志强', eid: 'EMP20190062', type: '补卡申请', t: 't-repair',
            why: '补录遗漏打卡', from: '2026-05-28', to: '2026-05-28', d: 1,
            dept: '销售部', at: '2026-06-10 16:20', s: 'rejected',
            rr: '超过补卡申请时限（7天内），不予补录。', rt: '2026-06-11 09:30',
            note: '上次出差后忘记及时申请补卡。',
            repairDate: '2026-05-28', exceptionType: '漏打卡', repairTimes: '09:00、18:00',
            flow: [
              {
                name: '部门经理', tag: '', status: 'done', result: '已同意',
                members: [{ name: '何强', eid: '7156' }], time: '2026-06-10 17:00'
              },
              {
                name: '部门总监', tag: '', status: 'done', result: '已同意',
                members: [{ name: '于飞', eid: '3902' }, { name: '韩雪', eid: '3188' }, { name: '邓超', eid: '6624' }],
                time: '2026-06-11 09:00'
              },
              {
                name: 'HR审批', tag: '', status: 'rejected', result: '已驳回',
                members: [{ name: '李芳', eid: '5518' }], time: '2026-06-11 09:30',
                comment: '超过补卡申请时限（7天内），不予补录。'
              },
            ],
          },
        ],
        cancelled: [
          {
            id: 'X01', who: '刘强', eid: 'EMP20190321', type: '请假申请', t: 't-leave',
            why: '家中急事请假', from: '2026-06-09', to: '2026-06-10', d: 2,
            dept: '客户服务部', at: '2026-06-08 09:20', s: 'cancelled',
            ct: '2026-06-08 14:10', cr: '申请人主动撤销',
            note: '因突发情况需处理，申请撤回。',
            flow: [
              {
                name: '部门经理', tag: '', status: 'done', result: '已同意',
                members: [{ name: '陈刚', eid: '3356' }], time: '2026-06-08 10:00'
              },
              {
                name: 'HR审批', tag: '', status: 'cancelled', result: '已取消',
                members: [{ name: '李芳', eid: '5518' }], time: '2026-06-08 14:10'
              },
            ],
          },
          {
            id: 'X02', who: '周婷', eid: 'EMP20221108', type: '出差申请', t: 't-out',
            why: '临时出差取消', from: '2026-06-18', to: '2026-06-20', d: 3,
            dept: '市场拓展部', at: '2026-06-14 17:40', s: 'cancelled',
            ct: '2026-06-15 09:30', cr: '行程变更取消',
            note: '客户会议延期，出差计划取消。',
            flow: [
              {
                name: '部门经理', tag: '', status: 'done', result: '已同意',
                members: [{ name: '孙丽', eid: '3829' }], time: '2026-06-14 18:00'
              },
              {
                name: '部门总监', tag: '', status: 'cancelled', result: '已取消',
                members: [{ name: '黄鹏', eid: '7201' }, { name: '刘洋', eid: '5532' }, { name: '徐强', eid: '7746' }],
                time: '2026-06-15 09:30'
              },
            ],
          },
        ],
        cc: [
          {
            id: 'C01', who: '马晓东', eid: 'EMP20170003', type: '公车申请', t: 't-other',
            why: '接待客户用车', from: '2026-06-20', to: '2026-06-20', d: 1,
            dept: '总经理办公室', at: '2026-06-15 11:00', s: 'cc',
            note: '接待重要客户，申请公司别克商务车一辆。',
            flow: [
              {
                name: '行政审批', tag: '', status: 'done', result: '已安排',
                members: [{ name: '高明', eid: '8734' }], time: '2026-06-15 14:00'
              },
              {
                name: '抄送', tag: '', status: 'cc', result: '已抄送',
                members: [{ name: '您', eid: '' }], time: '2026-06-15 14:00'
              },
            ],
          },
          {
            id: 'C02', who: '黄丽', eid: 'EMP20200519', type: '调岗申请', t: 't-other',
            why: '部门内部调岗', from: '2026-07-01', to: '2026-07-01', d: 1,
            dept: '人力资源部', at: '2026-06-13 14:30', s: 'cc',
            note: '由招聘组调至培训组，抄送上级领导知晓。',
            flow: [
              {
                name: 'HR经理', tag: '', status: 'done', result: '已同意',
                members: [{ name: '张敏', eid: '2817' }], time: '2026-06-13 16:00'
              },
              {
                name: '抄送', tag: '', status: 'cc', result: '已抄送',
                members: [{ name: '您', eid: '' }], time: '2026-06-13 16:00'
              },
            ],
          },
        ],
      },
      // 状态映射
      statusMap: {
        pending: { text: '待审批', cls: 'sp-pending', icon: 'clock-circle' },
        approved: { text: '已通过', cls: 'sp-approved', icon: 'check-circle' },
        rejected: { text: '已驳回', cls: 'sp-rejected', icon: 'close-circle' },
        cancelled: { text: '已取消', cls: 'sp-cancelled', icon: 'stop' },
        cc: { text: '抄送', cls: 'sp-cc', icon: 'copy' },
      },
      // 流程节点图标映射
      flowIconMap: {
        done: 'check',
        current: 'ellipsis',
        pending: 'circle',
        rejected: 'close',
        cc: 'copy',
        cancelled: 'minus-circle',
      },
      // 流程节点徽章映射
      flowBadgeMap: {
        done: { text: '已完成', cls: 'ok' },
        current: { text: '审批中', cls: 'now' },
        pending: { text: '待审批', cls: 'wait' },
        rejected: { text: '已驳回', cls: 'fail' },
        cancelled: { text: '已取消', cls: 'cancel' },
        cc: { text: '已抄送', cls: 'ccd' },
      },
    }
  },
  computed: {
    filteredList() {
      const list = this.myData[this.activeTab] || []
      if (!this.filterActive) return list
      const { type, who, dateFrom, dateTo } = this.filterForm
      return list.filter(x => {
        if (type && x.type !== type) return false
        if (who && !x.who.includes(who.trim())) return false
        const dateField = x.repairDate || x.from
        if (dateFrom && dateField < dateFrom) return false
        if (dateTo && dateField > dateTo) return false
        return true
      })
    },
    selectedItem() {
      if (!this.selectedId) return null
      return this.filteredList.find(d => d.id === this.selectedId) || null
    },
    detailTitle() {
      if (!this.selectedItem) return ''
      const x = this.selectedItem
      const suffix = (x.t === 't-repair' || x.t === 't-overtime') ? x.at : x.why
      return `${x.who}的${x.type} — ${suffix}`
    },
    infoItems() {
      if (!this.selectedItem) return []
      const x = this.selectedItem
      const items = []
      items.push({ label: '申请人', value: x.who })
      items.push({ label: '员工工号', value: x.eid })
      items.push({ label: '所属部门', value: x.dept })
      items.push({ label: '提交时间', value: x.at })

      if (x.t === 't-overtime') {
        items.push({ label: '加班日期', value: x.from })
        items.push({ label: '加班开始时间', value: x.startTime || '—' })
        items.push({ label: '加班结束时间', value: x.endTime || '—' })
        items.push({ label: '加班时长', value: (x.hours || 0) + ' 小时' })
        items.push({ label: '加班原因', value: x.why })
      } else if (x.t === 't-repair') {
        items.push({ label: '补卡日期', value: x.repairDate || x.from })
        items.push({ label: '异常类型', value: x.exceptionType || '—' })
        items.push({ label: '补卡时间', value: x.repairTimes || '—' })
        items.push({ label: '补卡原因', value: x.why })
      } else if (x.t === 't-leave') {
        items.push({ label: '请假类型', value: x.why })
        items.push({ label: '开始日期', value: x.from })
        items.push({ label: '结束日期', value: x.to })
        items.push({ label: '天数', value: x.d + ' 天' })
      } else {
        items.push({ label: '申请事由', value: x.why })
        items.push({ label: '日期', value: x.from + (x.from !== x.to ? ' ~ ' + x.to : '') })
        if (x.d) items.push({ label: '天数', value: x.d + ' 天' })
      }

      if (x.s === 'approved') items.push({ label: '审批时间', value: x.apt })
      if (x.s === 'rejected') {
        items.push({ label: '驳回时间', value: x.rt })
        items.push({ label: '驳回原因', value: x.rr, full: true })
      }
      if (x.s === 'cancelled') {
        items.push({ label: '取消时间', value: x.ct })
        items.push({ label: '取消原因', value: x.cr, full: true })
      }
      items.push({ label: '备注说明', value: x.note, full: true })
      return items
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.selectFirst()
    })
  },
  methods: {
    getTabCount(key) {
      return (this.myData[key] || []).length
    },
    switchTab(key) {
      this.activeTab = key
      this.selectedId = null
      this.opinion = ''
      this.$nextTick(() => {
        this.selectFirst()
      })
    },
    selectItem(id) {
      this.selectedId = id
      this.opinion = ''
    },
    selectFirst() {
      if (this.filteredList.length) {
        this.selectedId = this.filteredList[0].id
      }
    },
    applyFilter() {
      this.filterActive = true
      this.selectedId = null
      this.$nextTick(() => {
        this.selectFirst()
      })
    },
    resetFilter() {
      this.filterForm.type = ''
      this.filterForm.who = ''
      this.filterForm.dateFrom = ''
      this.filterForm.dateTo = ''
      this.filterActive = false
      this.selectedId = null
      this.$nextTick(() => {
        this.selectFirst()
      })
    },
    getPersonResult(step) {
      if (step.result) return step.result
      if (step.status === 'pending') return '待处理'
      return ''
    },
    getPersonResultCls(step) {
      if (step.status === 'rejected') return 'rejected'
      if (step.status === 'cancelled') return 'cancelled'
      if (step.status === 'done') return 'done'
      if (step.status === 'cc') return 'cc'
      return 'pending'
    },
    // ===== 审批操作 =====
    handleApprove() {
      this.$confirm({
        title: '确认同意',
        content: `确认同意该审批单（${this.selectedId}）？${this.opinion ? '\n审批意见：' + this.opinion : ''}`,
        okText: '确认同意',
        cancelText: '取消',
        okType: 'primary',
        onOk: () => {
          this.doApprove(this.selectedId, this.opinion)
        },
      })
    },
    handleReject() {
      this.rejectReason = this.opinion
      this.rejectVisible = true
    },
    confirmReject() {
      const reason = this.rejectReason.trim()
      if (!reason) {
        this.$message.warning('请填写驳回原因')
        return Promise.reject()
      }
      this.doReject(this.selectedId, reason)
      this.rejectVisible = false
      this.rejectReason = ''
    },
    doApprove(id, opinion) {
      const arr = this.myData.pending
      const idx = arr.findIndex(x => x.id === id)
      if (idx > -1) {
        const item = arr.splice(idx, 1)[0]
        item.s = 'approved'
        item.apt = this.formatNow()
        // 更新当前节点状态
        const currentStep = (item.flow || []).find(s => s.status === 'current')
        if (currentStep) {
          currentStep.status = 'done'
          currentStep.result = '已同意'
          currentStep.time = item.apt
          if (opinion) currentStep.comment = opinion
          // 激活下一个节点
          const nextIdx = item.flow.indexOf(currentStep) + 1
          if (nextIdx < item.flow.length && item.flow[nextIdx].status === 'pending') {
            item.flow[nextIdx].status = 'current'
          }
        }
        this.myData.approved.unshift(item)
        this.selectedId = null
        this.opinion = ''
        this.$nextTick(() => {
          this.selectFirst()
        })
      }
      this.$message.success('审批已通过')
    },
    doReject(id, reason) {
      const arr = this.myData.pending
      const idx = arr.findIndex(x => x.id === id)
      if (idx > -1) {
        const item = arr.splice(idx, 1)[0]
        item.s = 'rejected'
        item.rt = this.formatNow()
        item.rr = reason
        // 更新当前节点状态
        const currentStep = (item.flow || []).find(s => s.status === 'current')
        if (currentStep) {
          currentStep.status = 'rejected'
          currentStep.result = '已驳回'
          currentStep.time = item.rt
          currentStep.comment = reason
        }
        this.myData.rejected.unshift(item)
        this.selectedId = null
        this.opinion = ''
        this.$nextTick(() => {
          this.selectFirst()
        })
      }
      this.$message.success('审批已驳回')
    },
    // ===== 一键审批 =====
    openBatchModal() {
      const list = this.filteredList
      if (!list.length) {
        this.$message.info('当前没有待审批的单据')
        return
      }
      // 按类型分组
      const typeMap = {}
      list.forEach(x => {
        if (!typeMap[x.type]) typeMap[x.type] = []
        typeMap[x.type].push(x)
      })
      this.batchTypes = Object.entries(typeMap).map(([name, items]) => ({
        name,
        count: items.length,
        ids: items.map(x => x.id),
      }))
      // 默认选中第一个
      this.batchSelectedIdxs = this.batchTypes.length ? [0] : []
      this.batchVisible = true
    },
    toggleBatchType(idx) {
      const pos = this.batchSelectedIdxs.indexOf(idx)
      if (pos === -1) {
        this.batchSelectedIdxs.push(idx)
      } else {
        this.batchSelectedIdxs.splice(pos, 1)
      }
    },
    submitBatchApprove() {
      if (!this.batchSelectedIdxs.length) {
        this.$message.warning('请至少选择一种申请类型')
        return
      }
      const selTypes = this.batchSelectedIdxs.map(i => this.batchTypes[i])
      const totalCount = selTypes.reduce((s, t) => s + t.count, 0)
      const typeNames = selTypes.map(t => t.name).join('、')
      this.$confirm({
        title: '确认一键审批',
        content: `确认一键审批以下类型？\n\n${typeNames}\n共 ${totalCount} 条单据`,
        okText: '确认审批',
        cancelText: '取消',
        okType: 'primary',
        onOk: () => {
          const allIds = selTypes.flatMap(t => t.ids)
          allIds.forEach(id => {
            this.doApprove(id, '')
          })
          this.batchVisible = false
          this.$message.success(`已批量审批通过 ${totalCount} 条单据！`)
        },
      })
    },
    formatNow() {
      const d = new Date()
      const pad = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    },
  },
}
</script>

<style lang="less" scoped>
@primary: #2563eb;
@primary-rgb: 37, 99, 235;
@foreground: #1a2a3d;
@muted-foreground: #64748b;
@border: #e2e8f0;
@muted: #f1f5f9;
@secondary: #eff3fb;
@green: #10b981;
@amber: #f59e0b;
@red: #ef4444;
@purple: #8b5cf6;

.my-apply-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: #fff;
}

/* ===== Header ===== */
.ma-header {
  padding: 26px 32px 0;
  flex-shrink: 0;
  background: linear-gradient(180deg, rgba(@primary-rgb, 0.04) 0%, transparent 100%);
}

/* ===== Tabs ===== */
.ma-tabs {
  display: flex;
  gap: 2px;
  border-bottom: 1px solid @border;
}

.ma-tab {
  padding: 11px 26px;
  font-size: 13px;
  font-weight: 500;
  color: @muted-foreground;
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  user-select: none;
  position: relative;

  &:hover {
    color: @foreground;
    background: rgba(@primary-rgb, 0.04);
  }

  &.active {
    color: @primary;
    border-bottom-color: @primary;
    background: rgba(@primary-rgb, 0.06);
    font-weight: 600;
  }
}

.ma-tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  border-radius: 11px;
  background: rgba(@primary-rgb, 0.12);
  color: @primary;
  font-size: 12px;
  font-weight: 700;
  padding: 0 6px;
  margin-left: 6px;
  line-height: 1;
}

.ma-tab.active .ma-tab-badge {
  background: @primary;
  color: #fff;
}

/* ===== Filter Bar ===== */
.ma-filter-bar {
  flex-shrink: 0;
  padding: 10px 32px;
  background: linear-gradient(180deg, rgba(@primary-rgb, 0.03) 0%, transparent 100%);
  border-bottom: 1px solid @border;
}

.ma-filter-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.ma-filter-item {
  display: flex;
  align-items: center;
  gap: 6px;

  label {
    font-size: 12px;
    color: @muted-foreground;
    font-weight: 500;
    letter-spacing: 0.2px;
    white-space: nowrap;
    flex-shrink: 0;
  }
}

.ma-native-select,
.ma-native-input {
  height: 30px;
  border-radius: 6px;
  border: 1px solid @border;
  font-size: 12px;
  color: @foreground;
  font-family: inherit;
  padding: 0 10px;
  outline: none;
  background: #fff;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.ma-native-select {
  width: 140px;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%2364748b'%3e%3cpath d='M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 14px;
  padding-right: 28px;
  cursor: pointer;
}

.ma-native-input {
  width: 130px;

  &[type="date"] {
    padding-right: 6px;
  }

  &.ma-input-text {
    width: 150px;
  }
}

.ma-native-select:focus,
.ma-native-input:focus {
  border-color: rgba(@primary-rgb, 0.5);
  box-shadow: 0 0 0 2px rgba(@primary-rgb, 0.1);
}

.ma-native-input::placeholder {
  color: #b0bec5;
  font-size: 11px;
}

.ma-date-range {
  display: flex;
  align-items: center;
  gap: 6px;

  span {
    font-size: 12px;
    color: @muted-foreground;
    white-space: nowrap;
  }
}

.ma-filter-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}

.ma-filter-btn {
  height: 30px;
  padding: 0 18px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  /deep/ .anticon {
    font-size: 12px;
  }
}

.ma-filter-btn-primary {
  background: linear-gradient(135deg, @primary, #4f7dff);
  background-size: 200% 200%;
  animation: gradientShift 6s ease infinite;
  color: #fff;
  box-shadow: 0 2px 8px rgba(@primary-rgb, 0.2);

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.95);
  }
}

.ma-filter-btn-reset {
  background: #fff;
  color: @muted-foreground;
  border: 1px solid @border;

  &:hover {
    border-color: rgba(@primary-rgb, 0.3);
    color: @primary;
  }
}

/* ===== Main Layout ===== */
.ma-main {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

/* ===== Left List ===== */
.ma-left {
  width: 348px;
  flex-shrink: 0;
  border-right: 1px solid @border;
  background: @secondary;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  min-height: 0;
}

/* 一键审批按钮 */
.ma-batch-btn {
  width: 100%;
  height: 40px;
  border-radius: 12px;
  background: rgba(@primary-rgb, 0.06);
  border: 1.5px dashed rgba(@primary-rgb, 0.3);
  color: @primary;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  flex-shrink: 0;
  letter-spacing: 0.3px;

  /deep/ .anticon {
    font-size: 14px;
  }

  &:hover {
    background: rgba(@primary-rgb, 0.1);
    border-color: rgba(@primary-rgb, 0.5);
    box-shadow: 0 2px 12px rgba(@primary-rgb, 0.12);
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.97);
  }
}

.ma-card-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(@primary-rgb, 0.15);
    border-radius: 99px;
  }
}

.ma-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid @border;
  padding: 15px 17px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(45, 120, 255, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03);
  animation: cardIn 0.35s ease-out both;
  flex-shrink: 0;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(135deg, @primary, #4f7dff);
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  &:hover::before {
    opacity: 1;
  }

  &:hover {
    border-color: rgba(@primary-rgb, 0.3);
    box-shadow: 0 4px 24px rgba(45, 120, 255, 0.15), 0 0 40px rgba(45, 120, 255, 0.04);
    transform: translateY(-2px);
  }

  &.active {
    border-color: rgba(@primary-rgb, 0.45);
    box-shadow: 0 0 0 3px rgba(@primary-rgb, 0.12), 0 6px 24px rgba(@primary-rgb, 0.12);
    background: linear-gradient(135deg, #f5f9ff 0%, #eef4ff 100%);
  }
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.ma-card-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 9px;
  position: relative;
  letter-spacing: 0.3px;

  &.t-leave {
    background: rgba(239, 68, 68, 0.12);
    color: #dc2626;
  }

  &.t-overtime {
    background: rgba(245, 158, 11, 0.15);
    color: #d97706;
  }

  &.t-repair {
    background: rgba(@primary-rgb, 0.12);
    color: @primary;
  }

  &.t-out {
    background: rgba(16, 185, 129, 0.14);
    color: #059669;
  }

  &.t-other {
    background: rgba(139, 92, 246, 0.13);
    color: #7c3aed;
  }
}

.ma-card-name {
  font-size: 14px;
  font-weight: 600;
  color: @foreground;
  margin-bottom: 7px;
  line-height: 1.4;
  padding-right: 22px;
  position: relative;
}

.ma-card-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 11px;
  color: @muted-foreground;
  flex-wrap: wrap;
  position: relative;

  span {
    display: flex;
    align-items: center;
    gap: 4px;

    /deep/ .anticon {
      font-size: 11px;
    }
  }
}

.ma-card-arrow {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: @muted-foreground;
  font-size: 12px;
  transition: all 0.2s;
}

.ma-card.active .ma-card-arrow {
  color: @primary;
}

.ma-empty-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 16px;
  color: @muted-foreground;

  /deep/ .anticon {
    font-size: 44px;
    margin-bottom: 10px;
    color: @primary;
    opacity: 0.3;
  }

  span {
    font-size: 13px;
  }
}

/* ===== Right Detail ===== */
.ma-right {
  flex: 1;
  overflow-y: auto;
  padding: 28px 36px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 255, 0.9) 100%);
  min-width: 0;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(@primary-rgb, 0.15);
    border-radius: 99px;
  }
}

.ma-detail-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: @muted-foreground;

  /deep/ .anticon {
    font-size: 60px;
    margin-bottom: 14px;
    color: @primary;
    opacity: 0.2;
  }

  span {
    font-size: 13px;
  }
}

.ma-detail-head {
  margin-bottom: 24px;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(@primary-rgb, 0.18);
}

.ma-dh-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  flex-wrap: wrap;

  h2 {
    flex: 1;
    min-width: 0;
    font-size: 19px;
    font-weight: 700;
    color: @foreground;
    margin: 0 0 12px;
    letter-spacing: -0.2px;
  }

  .ma-sp {
    flex-shrink: 0;
  }
}

.ma-sp {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.2px;

  &.sp-pending {
    background: rgba(245, 158, 11, 0.15);
    color: #b45309;
  }

  &.sp-approved {
    background: rgba(16, 185, 129, 0.14);
    color: #047857;
  }

  &.sp-rejected {
    background: rgba(239, 68, 68, 0.12);
    color: #dc2626;
  }

  &.sp-cancelled {
    background: rgba(100, 116, 139, 0.14);
    color: #64748b;
  }

  &.sp-cc {
    background: rgba(@primary-rgb, 0.12);
    color: @primary;
  }
}

.ma-detail-body {
  display: flex;
  gap: 22px;
}

.ma-detail-left {
  flex: 1;
  min-width: 0;
}

.ma-detail-right {
  width: 400px;
  flex-shrink: 0;
}

/* ===== Group / Title ===== */
.ma-group {
  margin-bottom: 26px;
}

.ma-g-title {
  font-size: 13px;
  font-weight: 600;
  color: @foreground;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    width: 4px;
    height: 16px;
    border-radius: 2px;
    background: linear-gradient(135deg, @primary, #4f7dff);
    display: inline-block;
  }
}

/* ===== Info Grid ===== */
.ma-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 28px;
}

.ma-info-item.full {
  grid-column: span 2;
}

.ma-info-label {
  font-size: 12px;
  color: @muted-foreground;
  margin-bottom: 6px;
  font-weight: 500;
  letter-spacing: 0.2px;
}

.ma-info-value {
  font-size: 13px;
  color: @foreground;
  font-weight: 500;
  line-height: 1.5;
  background: @muted;
  border-radius: 8px;
  padding: 8px 12px;
  border: 1px solid @border;
}

/* ===== Flow Block ===== */
.ma-flow-block {
  background: @secondary;
  border-radius: 12px;
  padding: 10px;
  border: 1px solid @border;

  .ma-g-title {
    margin-bottom: 10px;
  }
}

.ma-flow-list {
  position: relative;
}

.ma-flow-step-row {
  display: flex;
  align-items: flex-start;
  position: relative;

  &:last-child .ma-flow-step-card {
    margin-bottom: 0;
  }

  &:last-child .ma-flow-dot-col::after {
    display: none;
  }
}

.ma-flow-dot-col {
  width: 20px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 22px;
    left: 50%;
    transform: translateX(-50%);
    width: 1.5px;
    bottom: -6px;
    background: @border;
  }
}

.ma-flow-dot-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  z-index: 1;
  flex-shrink: 0;
  color: #fff;

  /deep/ .anticon {
    font-size: 9px;
  }

  &.done {
    background: @green;
  }

  &.current {
    background: @primary;
    box-shadow: 0 0 0 2px rgba(@primary-rgb, 0.15);
  }

  &.pending {
    background: #cbd5e1;
    color: #fff;
  }

  &.rejected {
    background: @red;
  }

  &.cc {
    background: @purple;
  }

  &.cancelled {
    background: #94a3b8;
  }
}

.ma-flow-step-card {
  flex: 1;
  min-width: 0;
  margin-left: 6px;
  margin-bottom: 6px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid @border;
  overflow: hidden;

  &.current {
    border-color: rgba(@primary-rgb, 0.25);
    box-shadow: 0 1px 4px rgba(@primary-rgb, 0.06);
  }

  &.rejected {
    border-color: rgba(239, 68, 68, 0.2);
  }

  &.cancelled {
    border-color: rgba(100, 116, 139, 0.25);
  }
}

.ma-flow-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px 0;
}

.ma-flow-card-title {
  font-size: 11px;
  font-weight: 600;
  color: @foreground;
  display: flex;
  align-items: center;
  gap: 4px;
}

.ma-flow-card-tag {
  font-size: 8px;
  padding: 1px 5px;
  border-radius: 6px;
  font-weight: 500;

  &.countersign {
    background: rgba(@primary-rgb, 0.1);
    color: @primary;
  }

  &.or {
    background: rgba(245, 158, 11, 0.12);
    color: #d97706;
  }
}

.ma-flow-card-badge {
  font-size: 9px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 8px;

  &.ok {
    background: rgba(16, 185, 129, 0.12);
    color: #059669;
  }

  &.now {
    background: rgba(@primary-rgb, 0.12);
    color: @primary;
  }

  &.wait {
    background: rgba(100, 116, 139, 0.12);
    color: @muted-foreground;
  }

  &.fail {
    background: rgba(239, 68, 68, 0.12);
    color: #dc2626;
  }

  &.ccd {
    background: rgba(139, 92, 246, 0.12);
    color: #7c3aed;
  }

  &.cancel {
    background: rgba(100, 116, 139, 0.12);
    color: #64748b;
  }
}

.ma-flow-person-list {
  padding: 4px 8px 6px;
}

.ma-flow-comment {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 4px 8px 8px;
  padding: 7px 10px;
  background: rgba(37, 99, 235, 0.05);
  border-left: 3px solid @primary;
  border-radius: 6px;
  font-size: 11px;
  color: @foreground;
  line-height: 1.5;

  /deep/ .anticon {
    color: @primary;
    font-size: 12px;
    margin-top: 1px;
    flex-shrink: 0;
  }

  span {
    word-break: break-all;
  }
}

.ma-flow-person {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 4px 0;

  &+.ma-flow-person {
    border-top: 1px solid @muted;
  }
}

.ma-flow-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.ma-flow-tag {
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  padding: 4px 9px;
  border-radius: 6px;
}

.ma-flow-tag-name {
  color: @primary;
  background: rgba(@primary-rgb, 0.1);
}

.ma-flow-person-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
  white-space: nowrap;
  flex-shrink: 0;
}

.ma-flow-person-result {
  font-size: 9px;
  font-weight: 600;

  &.done {
    color: #059669;
  }

  &.pending {
    color: @muted-foreground;
  }

  &.rejected {
    color: #dc2626;
  }

  &.cc {
    color: #7c3aed;
  }
}

.ma-flow-person-time {
  font-size: 9px;
  color: @muted-foreground;
}

/* ===== Approval Action ===== */
.ma-approval-action {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid @border;
}

.ma-opinion-wrap {
  margin-bottom: 16px;
}

.ma-opinion-label {
  font-size: 12px;
  font-weight: 600;
  color: @foreground;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: '';
    width: 4px;
    height: 14px;
    border-radius: 2px;
    background: linear-gradient(135deg, @primary, #4f7dff);
    display: inline-block;
  }

  .ma-opt {
    font-size: 11px;
    font-weight: 500;
    color: @muted-foreground;
    background: @muted;
    padding: 1px 8px;
    border-radius: 10px;
  }
}

.ma-opinion-area {
  /deep/ textarea {
    width: 100%;
    min-height: 72px;
    resize: vertical;
    border: 1px solid @border;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 13px;
    line-height: 1.5;
    font-family: inherit;
    color: @foreground;
    background: @muted;
    outline: none;
    transition: all 0.2s ease;

    &:focus {
      border-color: rgba(@primary-rgb, 0.5);
      box-shadow: 0 0 0 2px rgba(@primary-rgb, 0.1);
      background: #fff;
    }

    &::placeholder {
      color: #b0bec5;
      font-size: 12px;
    }
  }
}

/* ===== Action Bar ===== */
.ma-action-bar {
  display: flex;
  gap: 12px;
}

.ma-btn {
  height: 36px;
  padding: 0 24px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  /deep/ .anticon {
    font-size: 13px;
  }
}

.ma-btn-primary {
  color: #fff;
  background: linear-gradient(135deg, @primary, #4f7dff);
  background-size: 200% 200%;
  animation: gradientShift 6s ease infinite;
  box-shadow: 0 2px 8px rgba(@primary-rgb, 0.2);

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.96);
  }
}

.ma-btn-outline {
  color: @foreground;
  background: #fff;

  &:hover {
    border-color: rgba(@primary-rgb, 0.35);
    color: @primary;
    background: rgba(@primary-rgb, 0.05);
    box-shadow: 0 2px 12px rgba(@primary-rgb, 0.08);
  }

  &:active {
    transform: scale(0.97);
  }
}

.ma-readonly-tip {
  font-size: 12px;
  color: @muted-foreground;
  display: flex;
  align-items: center;
  gap: 6px;

  /deep/ .anticon {
    font-size: 12px;
  }
}

/* ===== Batch Modal ===== */
/deep/ .ma-batch-modal {
  .ant-modal-content {
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  }

  .ant-modal-body {
    padding: 0;
    max-height: 75vh;
    display: flex;
    flex-direction: column;
  }
}

.ma-batch-modal-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px 14px;
  border-bottom: 1px solid @border;
  flex-shrink: 0;
}

.ma-batch-modal-back {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: @muted;
  color: @muted-foreground;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;

  /deep/ .anticon {
    font-size: 13px;
  }

  &:hover {
    background: @secondary;
    color: @foreground;
  }
}

.ma-batch-modal-title {
  font-size: 17px;
  font-weight: 700;
  color: @foreground;
  letter-spacing: -0.2px;
}

.ma-batch-body {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.ma-batch-type-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 20px;
  border-bottom: 1px solid @muted;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba(@primary-rgb, 0.04);
  }

  &:last-child {
    border-bottom: none;
  }
}

.ma-batch-check {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid #d0d7e0;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  color: #fff;
  font-size: 11px;

  &.checked {
    border-color: @primary;
    background: @primary;
  }
}

.ma-batch-type-info {
  flex: 1;
}

.ma-batch-type-name {
  font-size: 14px;
  font-weight: 600;
  color: @foreground;
}

.ma-batch-type-count {
  font-size: 12px;
  color: @muted-foreground;
  margin-left: 4px;
}

.ma-batch-foot {
  padding: 14px 20px 22px;
  border-top: 1px solid @border;
  flex-shrink: 0;
}

.ma-batch-submit {
  width: 100%;
  height: 42px;
  border-radius: 10px;
  background: linear-gradient(135deg, @primary, #4f7dff);
  background-size: 200% 200%;
  animation: gradientShift 6s ease infinite;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  border: none;
  letter-spacing: 0.3px;
  transition: all 0.25s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  /deep/ .anticon {
    font-size: 14px;
  }

  &:hover {
    opacity: 0.9;
    box-shadow: 0 6px 20px rgba(@primary-rgb, 0.4);
  }

  &:active {
    transform: scale(0.98);
  }
}

/* ===== Reject Modal ===== */
.ma-reject-body {
  padding: 4px 0;
}

/* ===== 响应式 ===== */
@media (max-width: 1200px) {
  .ma-detail-body {
    flex-direction: column;
  }

  .ma-detail-right {
    width: 100%;
  }
}
</style>

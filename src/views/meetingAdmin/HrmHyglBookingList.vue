<template>
  <div class="hygl-module">
    <!-- 统计卡片 -->
    <div class="h-stat-bar">
      <div class="h-stat-card">
        <div class="h-stat-icon blue"><a-icon type="calendar" /></div>
        <div>
          <div class="h-stat-num">{{ stats.bookedCount }}</div>
          <div class="h-stat-label">已预约</div>
        </div>
      </div>
      <div class="h-stat-card">
        <div class="h-stat-icon green"><a-icon type="check-circle" /></div>
        <div>
          <div class="h-stat-num">{{ stats.doneCount }}</div>
          <div class="h-stat-label">已结束</div>
        </div>
      </div>
      <div class="h-stat-card">
        <div class="h-stat-icon amber"><a-icon type="close-circle" /></div>
        <div>
          <div class="h-stat-num">{{ stats.cancelledCount }}</div>
          <div class="h-stat-label">已取消</div>
        </div>
      </div>
      <div class="h-stat-card">
        <div class="h-stat-icon purple"><a-icon type="user" /></div>
        <div>
          <div class="h-stat-num">{{ stats.totalAttendees }}</div>
          <div class="h-stat-label">累计参会人次</div>
        </div>
      </div>
    </div>

    <!-- 筛选面板（卡片样式）-->
    <div class="h-filter-panel">
      <div class="h-filter-item">
        <span class="h-filter-label">会议主题/会议室 </span>
        <a-input
          v-model="queryParam.searchKeyword"
          allowClear
          placeholder="搜索会议主题/会议室"
          style="width: 180px"
          @pressEnter="searchQuery"
        >
        </a-input>
      </div>
      <!-- <div class="h-filter-item">
        <span class="h-filter-label">会议室</span>
        <j-input
          v-model="queryParam.roomName"
          allowClear
          placeholder="搜索会议室"
          style="width: 180px"
          @pressEnter="searchQuery"
        >
        </j-input>
      </div> -->
      <div class="h-filter-item">
        <span class="h-filter-label">申请人</span>
        <j-input
          v-model="queryParam.userName"
          allowClear
          placeholder="搜索申请人…"
          style="width: 150px"
          @pressEnter="searchQuery"
        >
        </j-input>
      </div>
      <div class="h-filter-item">
        <span class="h-filter-label">工号</span>
        <j-input
          v-model="queryParam.userCode"
          allowClear
          placeholder="搜索工号…"
          style="width: 150px"
          @pressEnter="searchQuery"
        >
        </j-input>
      </div>
      <div class="h-filter-item">
        <span class="h-filter-label">会议室日期</span>
        <a-date-picker
          v-model="meetingDate"
          allowClear
          format="YYYY-MM-DD"
          valueFormat="YYYY-MM-DD"
          style="width: 150px"
        />
      </div>
      <div class="h-filter-item h-time-select">
        <span class="h-filter-label">开始时间</span>
        <a-select v-model="startTimeFilter" placeholder="全部" allowClear style="width: 120px" :disabled="!meetingDate">
          <a-select-option v-for="t in timeOptions" :key="t" :value="t">{{ t }}</a-select-option>
        </a-select>
      </div>
      <div class="h-filter-item h-time-select">
        <span class="h-filter-label">结束时间</span>
        <a-select v-model="endTimeFilter" placeholder="全部" allowClear style="width: 120px" :disabled="!meetingDate">
          <a-select-option v-for="t in timeOptions" :key="t" :value="t">{{ t }}</a-select-option>
        </a-select>
      </div>
      <div class="h-filter-actions">
        <a-button class="h-btn h-btn-primary" @click="searchQuery"><a-icon type="search" />查询</a-button>
        <a-button class="h-btn h-btn-secondary" @click="searchReset"><a-icon type="undo" />重置</a-button>
        <a-button class="h-btn h-btn-primary" @click="handleAdd"><a-icon type="plus" />会议预约</a-button>
      </div>
    </div>

    <!-- 状态 Tab -->
    <div class="h-status-tabs">
      <span :class="['h-status-tab', activeStatus === 'booked' ? 'active' : '']" @click="switchTab('booked')">
        已预约 <span class="tab-count">{{ stats.bookedCount }}</span>
      </span>
      <span :class="['h-status-tab', activeStatus === 'cancelled' ? 'active' : '']" @click="switchTab('cancelled')">
        已取消 <span class="tab-count">{{ stats.cancelledCount }}</span>
      </span>
      <span :class="['h-status-tab', activeStatus === 'done' ? 'active' : '']" @click="switchTab('done')">
        已结束 <span class="tab-count">{{ stats.doneCount }}</span>
      </span>
    </div>

    <!-- 表格卡片 -->
    <div class="h-content">
      <div class="h-data-card">
        <div class="h-scroll-area">
          <a-table
            ref="table"
            size="middle"
            :bordered="false"
            rowKey="id"
            :columns="columns"
            :dataSource="dataSource"
            :pagination="false"
            :loading="loading"
            :scroll="{ x: 1360, y: 400 }"
          >
            <!-- 序号 -->
            <template slot="seq" slot-scope="text, record, index">
              <div class="h-seq-cell">{{ (ipagination.current - 1) * ipagination.pageSize + index + 1 }}</div>
            </template>
            <!-- 状态 -->
            <template slot="status" slot-scope="text">
              <span :class="['h-status-tag', text]"> <span class="dot"></span>{{ statusTextMap[text] || text }} </span>
            </template>
            <!-- 会议主题 -->
            <template slot="topic" slot-scope="text">
              <strong>{{ text }}</strong>
            </template>
            <!-- 工号 -->
            <template slot="userCode" slot-scope="text">
              <span class="h-code">{{ text }}</span>
            </template>
            <!-- 时间 -->
            <template slot="startTime" slot-scope="text">
              <div class="h-time-cell">{{ text }}</div>
            </template>
            <template slot="endTime" slot-scope="text">
              <div class="h-time-cell">{{ text }}</div>
            </template>
            <!-- 时长 -->
            <template slot="duration" slot-scope="text">
              <div class="h-time-cell">{{ formatDuration(text) }}</div>
            </template>
            <!-- 参会人数 -->
            <template slot="attendeeCount" slot-scope="text">
              <div class="h-capacity-cell"><a-icon type="team" />{{ text }} 人</div>
            </template>
            <!-- 操作 -->
            <template slot="action" slot-scope="text, record">
              <div class="h-action-cell" style="justify-content: center">
                <button class="h-btn-icon" @click="handleDetail(record)"><a-icon type="eye" />详情</button>
                <template v-if="record.status === 'booked'">
                  <button v-if="cancelLimit(record)" class="h-btn-icon danger" @click="handleCancel(record)">
                    <a-icon type="close" />取消
                  </button>
                  <button class="h-btn-icon primary" @click="handleRebook(record)">
                    <a-icon type="redo" />重新申请
                  </button>
                </template>
              </div>
            </template>
          </a-table>
        </div>
        <div class="h-pagination" v-if="ipagination.total > 0">
          <a-pagination
            size="small"
            :current="ipagination.current"
            :pageSize="ipagination.pageSize"
            :total="ipagination.total"
            showSizeChanger
            showQuickJumper
            :pageSizeOptions="['10', '20', '50']"
            @change="handlePageChange"
            @showSizeChange="handleSizeChange"
          />
        </div>
      </div>
    </div>

    <hrm-hygl-booking-modal ref="bookingModal" @ok="modalFormOk"></hrm-hygl-booking-modal>
    <hrm-hygl-booking-detail-modal ref="detailModal"></hrm-hygl-booking-detail-modal>
    <hrm-hygl-booking-cancel-modal ref="cancelModal" @ok="modalFormOk"></hrm-hygl-booking-cancel-modal>
  </div>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { mixinDevice } from '@/utils/mixin'
import { getAction } from '@/api/manage'
import moment from 'moment'
import HrmHyglBookingModal from './modules/HrmHyglBookingModal'
import HrmHyglBookingDetailModal from './modules/HrmHyglBookingDetailModal'
import HrmHyglBookingCancelModal from './modules/HrmHyglBookingCancelModal'

export default {
  name: 'HrmHyglBookingList',
  mixins: [JeecgListMixin, mixinDevice],
  components: { HrmHyglBookingModal, HrmHyglBookingDetailModal, HrmHyglBookingCancelModal },
  data() {
    return {
      description: '会议申请',
      activeStatus: 'booked',
      stats: { bookedCount: 0, doneCount: 0, cancelledCount: 0, totalAttendees: 0 },
      statusTextMap: { booked: '已预约', done: '已结束', cancelled: '已取消' },
      // 筛选 UI 字段（不直接发送给 API）
      meetingDate: undefined,
      startTimeFilter: undefined,
      endTimeFilter: undefined,
      timeOptions: this.buildTimeOptions(),
      columns: [
        { title: '序号', dataIndex: 'seq', width: 70, align: 'center', scopedSlots: { customRender: 'seq' } },
        { title: '状态', dataIndex: 'status', width: 100, align: 'center', scopedSlots: { customRender: 'status' } },
        {
          title: '会议主题',
          dataIndex: 'topic',
          width: 200,
          align: 'center',
          customRender: (t) => {
            return (
              <a-tooltip
                title={t}
                style="display: block;width: 183px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;"
              >
                {t}
              </a-tooltip>
            )
          },
        },
        {
          title: '会议室',
          dataIndex: 'roomName',
          align: 'center',
          width: 180,
          align: 'center',
          customRender: (t) => {
            return (
              <a-tooltip
                title={t}
                style="display: block;width: 163px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;"
              >
                {t}
              </a-tooltip>
            )
          },
        },
        { title: '申请人', dataIndex: 'userName', width: 100, align: 'center' },
        {
          title: '工号',
          dataIndex: 'userCode',
          width: 110,
          align: 'center',
          scopedSlots: { customRender: 'userCode' },
        },
        {
          title: '部门',
          dataIndex: 'dept',
          width: 200,
          align: 'center',
          customRender: (t) => {
            return (
              <a-tooltip
                title={t}
                style="display: block;width: 183px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;"
              >
                {t}
              </a-tooltip>
            )
          },
        },
        {
          title: '开始时间',
          dataIndex: 'startTime',
          width: 140,
          align: 'center',
          scopedSlots: { customRender: 'startTime' },
        },
        {
          title: '结束时间',
          dataIndex: 'endTime',
          width: 140,
          align: 'center',
          scopedSlots: { customRender: 'endTime' },
        },
        {
          title: '时长',
          dataIndex: 'duration',
          align: 'center',
          scopedSlots: { customRender: 'duration' },
        },
        {
          title: '参会人数',
          dataIndex: 'attendeeCount',
          align: 'center',
          width: 90,
          scopedSlots: { customRender: 'attendeeCount' },
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: 240,
          align: 'center',
          fixed: 'right',
          scopedSlots: { customRender: 'action' },
        },
      ],
      url: {
        list: '/hygl/hrmHyglBooking/list',
        statistics: '/hygl/hrmHyglBooking/statistics',
      },
      disableMixinCreated: true,
      useInfo: this.$store.state.user.info,
    }
  },

  created() {
    this.queryParam.status = this.activeStatus
    this.loadData()
    //初始化字典配置 在自己页面定义
    this.initDictConfig()
  },
  mounted() {
    this.loadStats()
  },
  methods: {
    cancelLimit(record) {
      return ['kfadmin', record.userCode].includes(this.useInfo.username)
    },
    buildTimeOptions() {
      const opts = []
      for (let t = 0; t < 24 * 60; t += 30) {
        const hh = String(Math.floor(t / 60)).padStart(2, '0')
        const mm = String(t % 60).padStart(2, '0')
        opts.push(hh + ':' + mm)
      }
      return opts
    },
    loadStats() {
      getAction(this.url.statistics).then((res) => {
        if (res.success && res.result) {
          this.stats = {
            bookedCount: res.result.bookedCount || 0,
            doneCount: res.result.doneCount || 0,
            cancelledCount: res.result.cancelledCount || 0,
            totalAttendees: res.result.totalAttendees || 0,
          }
        }
      })
    },
    switchTab(status) {
      if (this.activeStatus === status) return
      this.activeStatus = status
      this.queryParam.status = status
      this.loadData(1)
    },
    handleAdd() {
      this.$refs.bookingModal.add()
    },
    handleDetail(record) {
      this.$refs.detailModal.show(record)
    },
    handleRebook(record) {
      this.$refs.bookingModal.rebook(record)
    },
    handleCancel(record) {
      this.$refs.cancelModal.show(record)
    },
    modalFormOk() {
      this.loadData()
      this.loadStats()
    },
    searchQuery() {
      // 使用高级查询规则筛选时间范围
      this.$delete(this.queryParam, 'startTime')
      this.$delete(this.queryParam, 'endTime')
      this.$delete(this.queryParam, 'meetingDate')
      if (this.meetingDate) {
        const startDate = this.startTimeFilter
          ? this.meetingDate + ' ' + this.startTimeFilter + ':00'
          : this.meetingDate + ' 00:00:00'
        const endDate = this.endTimeFilter
          ? this.meetingDate + ' ' + this.endTimeFilter + ':00'
          : this.meetingDate + ' 23:59:59'
        const params = [
          { field: 'startTime', rule: 'ge', val: startDate },
          { field: 'endTime', rule: 'le', val: endDate },
        ]
        this.handleSuperQuery(params, 'and')
        return
      }
      // 无日期时清空高级查询
      this.handleSuperQuery(null)
    },
    searchReset() {
      this.meetingDate = undefined
      this.startTimeFilter = undefined
      this.endTimeFilter = undefined
      this.queryParam = { status: this.activeStatus }
      this.handleSuperQuery(null)
    },
    formatDuration(minutes) {
      if (!minutes && minutes !== 0) return '—'
      const h = Math.floor(minutes / 60)
      const m = minutes % 60
      if (h && m) return h + ' 小时 ' + m + ' 分钟'
      if (h) return h + ' 小时'
      return m + ' 分钟'
    },
    handlePageChange(page, pageSize) {
      this.ipagination.current = page
      this.ipagination.pageSize = pageSize
      this.loadData()
    },
    handleSizeChange(current, size) {
      this.ipagination.current = 1
      this.ipagination.pageSize = size
      this.loadData()
    },
  },
}
</script>

<style lang="less" scoped>
@import './hygl-theme.less';
</style>


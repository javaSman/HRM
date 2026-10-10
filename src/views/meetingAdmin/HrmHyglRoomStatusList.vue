<template>
  <div class="hygl-module">
    <!-- 页头 -->
    <div class="h-page-header">
      <h1 class="h-page-title">会议室情况</h1>
    </div>

    <!-- 主体卡片 -->
    <div class="h-content">
      <div class="h-data-card">
        <div class="h-room-status-body">
          <!-- 会议室标签页 -->
          <div class="h-room-tabs-bar" v-if="rooms.length">
            <span
              v-for="room in rooms"
              :key="room.id"
              :class="['h-room-tab', activeRoomId === room.id ? 'active' : '']"
              :title="room.name"
              @click="switchRoom(room.id)"
            >
              <a-icon type="door" />{{ room.name }}
            </span>
          </div>
          <div class="h-room-tabs-bar" v-else>
            <span class="h-room-empty-tip">暂无会议室</span>
          </div>

          <!-- 日期选择行 -->
          <div class="h-date-picker-row">
            <span class="h-date-lbl">选择日期：</span>
            <a-date-picker
              v-model="selectedDate"
              allowClear
              format="YYYY-MM-DD"
              valueFormat="YYYY-MM-DD"
              style="width: 160px"
              @change="onDateChange"
            />
            <div class="h-date-shortcut">
              <span
                :class="['ds', activeShortcut === 'today' ? 'active' : '']"
                @click="setDateShortcut('today')"
              >今天</span>
              <span
                :class="['ds', activeShortcut === 'tomorrow' ? 'active' : '']"
                @click="setDateShortcut('tomorrow')"
              >明天</span>
            </div>
          </div>

          <!-- 时段网格 -->
          <div class="h-time-grid-wrap">
            <a-spin :spinning="loading">
              <div v-if="activeRoomId && timeSlots.length" class="h-time-grid">
                <div
                  v-for="slot in timeSlots"
                  :key="slot.fromMinute"
                  :class="['h-time-slot', slot.status]"
                >
                  <div class="slot-time">{{ slot.timeLabel }}</div>
                  <div class="slot-status">{{ slotText(slot.status) }}</div>
                  <div
                    v-if="slot.status === 'busy' && (slot.userName || slot.userCode)"
                    class="slot-applicant"
                    :title="(slot.userName || '') + (slot.userCode ? ' · ' + slot.userCode : '')"
                  >
                    {{ slot.userName || '' }}{{ slot.userCode ? ' · ' + slot.userCode : '' }}
                  </div>
                </div>
              </div>
              <div v-else-if="!activeRoomId" class="h-empty-state">
                请选择上方会议室标签查看占用情况
              </div>
              <div v-else class="h-empty-state">暂无时段数据</div>
            </a-spin>
          </div>

          <!-- 图例与统计 -->
          <div class="h-room-status-legend">
            <span class="leg"><span class="leg-dot idle"></span>空闲</span>
            <span class="leg"><span class="leg-dot busy"></span>已预约</span>
            <span class="leg"><span class="leg-dot past"></span>已过期</span>
            <span class="stat">{{ legendStat }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAction } from '@/api/manage'
import moment from 'moment'

export default {
  name: 'HrmHyglRoomStatusList',
  data() {
    return {
      description: '会议室情况',
      loading: false,
      rooms: [],
      activeRoomId: undefined,
      selectedDate: moment().format('YYYY-MM-DD'),
      activeShortcut: 'today',
      timeSlots: [],
      idleCount: 0,
      busyCount: 0,
      pastCount: 0,
      statusTextMap: { idle: '空闲', busy: '已预约', past: '已过期' },
      url: {
        rooms: '/hygl/hrmHyglRoom/all',
        roomStatus: '/hygl/hrmHyglBooking/roomStatus',
      },
    }
  },
  computed: {
    legendStat() {
      if (!this.activeRoomId) return '未选择会议室'
      return `空闲 ${this.idleCount} 段 · 已预约 ${this.busyCount} 段 · 已过期 ${this.pastCount} 段 · 共 48 段`
    },
  },
  created() {
    this.loadRooms()
  },
  methods: {
    slotText(status) {
      return this.statusTextMap[status] || status
    },
    loadRooms() {
      getAction(this.url.rooms).then((res) => {
        if (res.success) {
          const list = res.result || []
          this.rooms = list
          if (list.length && !this.activeRoomId) {
            this.activeRoomId = list[0].id
            this.loadRoomStatus()
          }
        } else {
          this.$message.warning(res.message || '会议室加载失败')
        }
      })
    },
    switchRoom(roomId) {
      if (this.activeRoomId === roomId) return
      this.activeRoomId = roomId
      this.loadRoomStatus()
    },
    onDateChange() {
      // 同步快捷按钮高亮状态
      this.activeShortcut = this.matchShortcut(this.selectedDate)
      this.loadRoomStatus()
    },
    setDateShortcut(key) {
      let date
      if (key === 'today') {
        date = moment().format('YYYY-MM-DD')
      } else if (key === 'tomorrow') {
        date = moment().add(1, 'days').format('YYYY-MM-DD')
      }
      this.selectedDate = date
      this.activeShortcut = key
      this.loadRoomStatus()
    },
    matchShortcut(value) {
      if (!value) return ''
      const today = moment().format('YYYY-MM-DD')
      const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD')
      if (value === today) return 'today'
      if (value === tomorrow) return 'tomorrow'
      return ''
    },
    loadRoomStatus() {
      if (!this.activeRoomId || !this.selectedDate) {
        this.timeSlots = []
        return
      }
      const that = this
      that.loading = true
      getAction(that.url.roomStatus, {
        roomId: that.activeRoomId,
        date: that.selectedDate,
      }).then((res) => {
        if (res.success && res.result) {
          that.timeSlots = res.result.timeSlots || []
          that.idleCount = res.result.idleCount || 0
          that.busyCount = res.result.busyCount || 0
          that.pastCount = res.result.pastCount || 0
        } else {
          that.timeSlots = []
          that.idleCount = 0
          that.busyCount = 0
          that.pastCount = 0
          if (res.message) that.$message.warning(res.message)
        }
      }).finally(() => {
        that.loading = false
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import './hygl-theme.less';

.h-room-empty-tip {
  padding: 8px 18px;
  font-size: 13px;
  color: @h-muted-foreground;
}
.h-empty-state {
  text-align: center;
  padding: 60px 20px;
  color: @h-muted-foreground;
  font-size: 13px;
}
</style>

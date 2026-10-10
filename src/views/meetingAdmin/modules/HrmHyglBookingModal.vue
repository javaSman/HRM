<template>
  <a-modal
    :title="title"
    :width="680"
    :visible="visible"
    :confirmLoading="confirmLoading"
    :maskClosable="false"
    :destroyOnClose="true"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="取消"
    okText="提交"
    centered
  >
    <a-spin :spinning="roomLoading">
      <a-form-model ref="form" :model="model" :rules="validatorRules" layout="vertical">
        <a-form-model-item label="会议主题" prop="topic">
          <a-input v-model="model.topic" placeholder="请输入会议主题" :maxLength="100" />
        </a-form-model-item>

        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-model-item label="开始日期" prop="date">
              <a-date-picker
                v-model="model.date"
                :allowClear="false"
                format="YYYY-MM-DD"
                valueFormat="YYYY-MM-DD"
                style="width: 100%"
                :disabledDate="disabledDate"
                @change="onTimeChange"
              />
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="开始时间" prop="startTime">
              <a-select v-model="model.startTime" placeholder="请选择开始时间" @change="onTimeChange">
                <a-select-option v-for="t in startOptions" :key="t" :value="t">{{ t }}</a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
        </a-row>

        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-model-item label="时长" prop="duration">
              <a-select v-model="model.duration" placeholder="请选择时长" @change="onTimeChange">
                <a-select-option v-for="item in durationOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="预约部门" prop="dept">
              <a-tooltip
                :title="deptPathFull"
                placement="topLeft"
                :overlayStyle="{ maxWidth: '500px' }"
                trigger="hover"
              >
                <a-cascader
                  v-model="deptPath"
                  :options="deptOptions"
                  :show-search="{ filter: filterDeptOption }"
                  :placeholder="deptLoading ? '加载中...' : '请选择部门'"
                  expand-trigger="hover"
                  :change-on-select="true"
                  :allowClear="false"
                  @change="handleDeptChange"
                />
              </a-tooltip>
            </a-form-model-item>
          </a-col>
        </a-row>

        <a-form-model-item label="选择会议室" prop="roomId">
          <div class="room-pick-grid">
            <div
              v-for="room in rooms"
              :key="room.id"
              :class="['room-pick', model.roomId === room.id ? 'active' : '', isRoomDisabled(room) ? 'disabled' : '']"
              :title="getRoomTitle(room)"
              @click="pickRoom(room)"
            >
              <span class="rp-icon"><a-icon type="bank" /></span>
              <span class="rp-info">
                <span class="rp-head">
                  <span class="rp-name">{{ room.name }}</span>
                  <span :class="['rp-tag', isRoomDisabled(room) ? 'booked' : 'available']">
                    {{ isRoomDisabled(room) ? '已预约' : '可预约' }}
                  </span>
                </span>
                <span class="rp-meta"><a-icon type="team" />{{ room.capacity }} 人 · {{ room.location }}</span>
              </span>
            </div>
          </div>
        </a-form-model-item>

        <a-form-model-item label="参会人员" prop="attendees">
          <j-select-employee
            ref="selectEmployee"
            v-model="model.attendees"
            placeholder="请选择参会人员"
            value-field="no"
            value-type="array"
            :multiple="true"
            :buttonShow="false"
            @change="() => this.$refs.form && this.$refs.form.clearValidate(['attendees'])"
          />
        </a-form-model-item>

        <div class="summary-box" v-show="model.roomId">
          <div class="summary-title"><a-icon type="check-circle" theme="twoTone" twoToneColor="#2d78ff" />预约确认</div>
          <div class="summary-row">
            <span class="lbl">会议室</span><span class="val">{{ summaryRoom }}</span>
          </div>
          <div class="summary-row">
            <span class="lbl">开始时间</span><span class="val">{{ summaryStart || '—' }}</span>
          </div>
          <div class="summary-row">
            <span class="lbl">结束时间</span><span class="val">{{ summaryEnd || '—' }}</span>
          </div>
          <div class="summary-row">
            <span class="lbl">时长</span><span class="val">{{ durationLabel }}</span>
          </div>
          <div class="summary-row">
            <span class="lbl">参会人员</span><span class="val">{{ summaryAttendees }}</span>
          </div>
        </div>
      </a-form-model>
    </a-spin>
  </a-modal>
</template>

<script>
import { getAction, postAction } from '@/api/manage'
import moment from 'moment'

const DURATION_OPTIONS = [
  { value: 30, label: '30分钟' },
  { value: 60, label: '1小时' },
  { value: 90, label: '1.5小时' },
  { value: 120, label: '2小时' },
  { value: 150, label: '2.5小时' },
  { value: 180, label: '3小时' },
  { value: 240, label: '4小时' },
  { value: 1440, label: '1天' },
  { value: 2880, label: '2天' },
  { value: 4320, label: '3天' },
]

export default {
  name: 'HrmHyglBookingModal',
  data() {
    return {
      title: '会议预约',
      visible: false,
      confirmLoading: false,
      roomLoading: false,
      model: this.buildDefaultModel(),
      rooms: [],
      deptOptions: [],
      deptPath: [],
      deptLoading: false,
      availability: [],
      startOptions: [],
      durationOptions: DURATION_OPTIONS,
      oldBookingId: null,
      validatorRules: {
        topic: [{ required: true, message: '请输入会议主题', trigger: 'blur' }],
        date: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
        startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
        duration: [{ required: true, message: '请选择时长', trigger: 'change' }],
        dept: [{ required: true, message: '请选择预约部门', trigger: 'change' }],
        roomId: [{ required: true, message: '请选择会议室', trigger: 'change' }],
        attendees: [{ required: true, message: '请选择参会人员', trigger: 'change' }],
      },
      url: {
        add: '/hygl/hrmHyglBooking/add',
        rebook: '/hygl/hrmHyglBooking/rebook',
        roomAll: '/hygl/hrmHyglRoom/all',
        checkRoom: '/hygl/hrmHyglBooking/checkRoomAvailability',
        queryByNos: '/hrm/hrEmployeeInformation/queryByNos',
      },
    }
  },
  computed: {
    summaryRoom() {
      const r = this.rooms.find((x) => x.id === this.model.roomId)
      return r ? r.name : '—'
    },
    summaryStart() {
      if (!this.model.date || !this.model.startTime) return ''
      return this.model.date + ' ' + this.model.startTime
    },
    summaryEnd() {
      if (!this.model.date || !this.model.startTime || !this.model.duration) return ''
      const start = moment(this.model.date + ' ' + this.model.startTime, 'YYYY-MM-DD HH:mm')
      const end = moment(start).add(this.model.duration, 'minutes')
      return end.format('YYYY-MM-DD HH:mm')
    },
    durationLabel() {
      const item = this.durationOptions.find((x) => x.value === this.model.duration)
      return item ? item.label : '—'
    },
    summaryAttendees() {
      if (!this.model.attendees || this.model.attendees.length === 0) return '—'
      return this.model.attendees.length + ' 人'
    },
    deptPathFull() {
      if (!this.deptPath || this.deptPath.length === 0) return ''
      const labels = []
      let node = this.deptOptions
      for (const key of this.deptPath) {
        const item = node.find((x) => x.value === key)
        if (item) {
          labels.push(item.label)
          node = item.children || []
        }
      }
      return labels.join('/')
    },
  },
  methods: {
    disabledDate(current) {
      // current 是 moment 对象，代表面板上的每一个日期
      return current && current < moment().subtract(1, 'days')
    },
    buildDefaultModel() {
      return {
        topic: '',
        date: moment().format('YYYY-MM-DD'),
        startTime: '',
        duration: 60,
        dept: undefined,
        roomId: '',
        attendees: [],
      }
    },

    add() {
      this.title = '会议预约'
      this.oldBookingId = null
      this.model = this.buildDefaultModel()
      this.deptPath = []
      this.visible = true
      this.$nextTick(() => {
        this.fillStartOptions()
        this.loadRooms()
        this.loadDeptOptions()
        this.checkAvailability()
      })
    },
    rebook(record) {
      this.title = '重新申请'
      this.oldBookingId = record.id
      this.visible = true
      this.$nextTick(() => {
        this.fillStartOptions()
        this.loadRooms()
        this.loadDeptOptions(record.dept)
        // 等会议室和可用性加载完后，再设置选中
        const startMoment = moment(record.startTime, 'YYYY-MM-DD HH:mm')
        const today = moment().format('YYYY-MM-DD')
        const recordDate = startMoment.format('YYYY-MM-DD')
        const recordStartTime = startMoment.format('HH:mm')
        // 如果是今天且原开始时间已过去，使用当前可用最早时间
        let startTime = recordStartTime
        if (recordDate === today && this.startOptions.length > 0) {
          const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
          const recordMin = parseInt(recordStartTime.split(':')[0]) * 60 + parseInt(recordStartTime.split(':')[1])
          if (recordMin < nowMin) {
            startTime = this.startOptions[0]
          } else if (!this.startOptions.includes(recordStartTime)) {
            // 未来时间但不在选项中，插入
            this.startOptions.unshift(recordStartTime)
          }
        } else if (recordDate !== today) {
          // 非今天的日期，保持原时间（日期选择会重新触发时间选项填充）
        }
        const attendeeNos = record.attendees
          ? Array.isArray(record.attendees)
            ? record.attendees
            : record.attendees.split(',')
          : []
        const baseModel = {
          topic: record.topic,
          date: recordDate,
          startTime: startTime,
          duration: record.duration,
          dept: record.dept,
          roomId: '',
          attendees: attendeeNos,
        }
        this.model = baseModel
        // 调接口查询参会人员信息，注入组件缓存以正确回显
        this.resolveAttendeeCache(attendeeNos)
        this.checkAvailability(() => {
          this.model.roomId = record.roomId
        })
      })
    },
    resolveAttendeeCache(nos) {
      if (!nos || !nos.length) return
      getAction(this.url.queryByNos, { nos: nos.join(',') }).then((res) => {
        if (res.success) {
          const records = res.result.records || res.result || []
          const rows = records.map((e) => ({ id: String(e.id), name: e.name, no: e.no }))
          if (this.$refs.selectEmployee && rows.length) {
            this.$refs.selectEmployee.cacheRows(rows)
          }
        }
      })
    },
    fillStartOptions() {
      const today = moment().format('YYYY-MM-DD')
      const isToday = this.model.date === today
      let startMin = 0
      if (isToday) {
        const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
        startMin = Math.ceil(nowMin / 30) * 30
      }
      const opts = []
      for (let t = startMin; t <= 23 * 60 + 30; t += 30) {
        const hh = String(Math.floor(t / 60)).padStart(2, '0')
        const mm = String(t % 60).padStart(2, '0')
        opts.push(hh + ':' + mm)
      }
      this.startOptions = opts.length ? opts : []
      if (this.startOptions.length && !this.model.startTime) {
        this.model.startTime = this.startOptions[0]
      }
      // 当前选中时间不在新选项中时，重置为最早可用时间
      if (this.model.startTime && !this.startOptions.includes(this.model.startTime)) {
        this.model.startTime = this.startOptions[0] || ''
      }
    },
    loadRooms() {
      const that = this
      that.roomLoading = true
      getAction(that.url.roomAll)
        .then((res) => {
          if (res.success) {
            that.rooms = res.result || []
          }
        })
        .finally(() => {
          that.roomLoading = false
        })
    },
    loadDeptOptions(existingDept) {
      if (this.deptOptions.length) {
        if (existingDept) {
          this.deptPath = this.findDeptPathByLabel(this.deptOptions, existingDept)
        } else if (!this.model.dept) {
          this.setDefaultDept()
        }
        return
      }
      this.deptLoading = true
      getAction('/org/hrmOrg/loadTreeRoot', { pid: 0 })
        .then((res) => {
          const list = res && res.success && Array.isArray(res.result) && res.result.length ? res.result : []
          const source = list.length > 0 ? list[0].children || list : []
          this.deptOptions = this.normalizeDeptOptions(source)
          if (existingDept) {
            this.deptPath = this.findDeptPathByLabel(this.deptOptions, existingDept)
          } else if (!this.model.dept) {
            this.setDefaultDept()
          }
        })
        .catch(() => {
          this.deptOptions = []
          this.deptPath = []
        })
        .finally(() => {
          this.deptLoading = false
        })
    },
    normalizeDeptOptions(list) {
      return (list || [])
        .filter((item) => item && (item.id || item.key || item.value || item.name || item.title))
        .map((item) => {
          const label = item.name || item.title || ''
          const value = String(item.id || item.key || item.value || label)
          const children = this.normalizeDeptOptions(item.children || [])
          const info = { label, value, key: value, isLeaf: !children.length }
          if (children.length) info.children = children
          return info
        })
    },
    handleDeptChange(value, selectedOptions) {
      const path = Array.isArray(selectedOptions) ? selectedOptions.map((o) => o.label) : []
      this.model.dept = path.join('/')
    },
    filterDeptOption(inputValue, path) {
      const keyword = String(inputValue || '').toLowerCase()
      return (path || []).some(
        (option) =>
          String(option.label || '')
            .toLowerCase()
            .indexOf(keyword) > -1
      )
    },
    findDeptPathByLabel(list, targetLabel, parentPath) {
      const path = parentPath || []
      // dept 可能是 "事业一部/工程技术研究中心" 格式，需逐级匹配
      const parts = String(targetLabel || '').split('/')
      const result = []
      let current = list
      for (const part of parts) {
        const found = (current || []).find((item) => item.label === part)
        if (!found) break
        result.push(found.value)
        current = found.children || []
      }
      return result.length === parts.length ? result : []
    },
    findDeptPathByValue(list, targetValue, parentPath) {
      const path = parentPath || []
      for (let i = 0; i < (list || []).length; i++) {
        const item = list[i]
        const nextPath = path.concat(item.value)
        if (String(item.value) === String(targetValue)) return nextPath
        const found = this.findDeptPathByValue(item.children || [], targetValue, nextPath)
        if (found.length) return found
      }
      return []
    },
    findDeptLabelsByPath(path) {
      const labels = []
      let current = this.deptOptions
      for (const val of path) {
        const found = (current || []).find((item) => String(item.value) === String(val))
        if (!found) break
        labels.push(found.label)
        current = found.children || []
      }
      return labels
    },
    setDefaultDept() {
      const userInfo = this.$store.getters.userInfo
      const username = userInfo && userInfo.username
      if (!username) return
      getAction(this.url.queryByNos, { nos: username }).then((res) => {
        if (!res.success || !res.result) return
        const records = res.result.records || res.result || []
        if (records.length && records[0].dept) {
          const deptId = String(records[0].dept)
          const path = this.findDeptPathByValue(this.deptOptions, deptId)
          if (path.length) {
            this.deptPath = path
            const labels = this.findDeptLabelsByPath(path)
            this.model.dept = labels.join('/')
          }
        }
      })
    },
    onTimeChange() {
      this.model.roomId = ''
      this.fillStartOptions()
      this.checkAvailability()
    },
    checkAvailableStartTime() {
      if (!this.model.date || !this.model.startTime) return ''
      return this.model.date + ' ' + this.model.startTime
    },
    checkAvailability(callback) {
      const startTime = this.checkAvailableStartTime()
      if (!startTime || !this.model.duration) {
        this.availability = []
        if (typeof callback === 'function') callback()
        return
      }
      const that = this
      getAction(that.url.checkRoom, {
        startTime: startTime,
        duration: that.model.duration,
        excludeId: this.oldBookingId,
      })
        .then((res) => {
          if (res.success) {
            that.availability = res.result || []
          }
          if (typeof callback === 'function') callback()
        })
        .catch(() => {
          that.availability = []
          if (typeof callback === 'function') callback()
        })
    },
    isRoomDisabled(room) {
      if (!this.model.date || !this.model.startTime || !this.model.duration) return false
      const item = this.availability.find((x) => x.roomId === room.id)
      return item ? !item.available : false
    },
    getRoomTitle(room) {
      const item = this.availability.find((x) => x.roomId === room.id)
      if (item && !item.available && item.conflictTopic) {
        return '冲突会议：' + item.conflictTopic
      }
      return room.name
    },
    pickRoom(room) {
      if (this.isRoomDisabled(room)) return
      this.model.roomId = room.id
    },
    handleOk() {
      const that = this
      this.$refs.form.validate((valid) => {
        if (!valid) return
        that.confirmLoading = true
        const startTime = that.model.date + ' ' + that.model.startTime
        const bookingData = {
          topic: that.model.topic,
          roomId: that.model.roomId,
          startTime: startTime,
          duration: that.model.duration,
          dept: that.model.dept,
          attendees: that.model.attendees || [],
        }
        let httpurl = that.url.add
        let params = bookingData
        if (that.oldBookingId) {
          httpurl = that.url.rebook
          params = { oldBookingId: that.oldBookingId, bookingData: bookingData }
        }
        postAction(httpurl, params)
          .then((res) => {
            if (res.success) {
              that.$message.success(res.message || '预约成功')
              that.$emit('ok')
              that.visible = false
            } else {
              that.$message.warning(res.message || '预约失败')
              // 失败后刷新会议室可用性
              that.checkAvailability()
            }
          })
          .finally(() => {
            that.confirmLoading = false
          })
      })
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>

<style lang="less" scoped>
@import '../hygl-theme.less';
/deep/ .ant-modal-body {
  padding-top: 14px;
}
.summary-box {
  background: rgba(@h-primary-rgb, 0.04);
  border: 1px solid rgba(@h-primary-rgb, 0.12);
  border-radius: 8px;
  padding: 14px 16px;
  margin-top: 6px;
}
.summary-title {
  font-size: 13px;
  font-weight: 600;
  color: @h-foreground;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  .anticon {
    font-size: 14px;
  }
}
.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  font-size: 12.5px;
  .lbl {
    color: @h-muted-foreground;
    font-weight: 500;
  }
  .val {
    color: @h-foreground;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
}

/* 会议室平铺选择 */
.room-pick-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  max-height: 220px;
  overflow: auto;
  padding: 2px;
}
.room-pick {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px 8px 10px;
  border: 1px solid @h-border;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  &:hover {
    border-color: rgba(@h-primary-rgb, 0.3);
    box-shadow: 0 2px 8px rgba(45, 120, 255, 0.08);
  }
  &.active {
    border-color: @h-primary;
    background: rgba(@h-primary-rgb, 0.06);
    box-shadow: 0 0 0 1px @h-primary inset;
  }
  &.disabled {
    opacity: 0.55;
    cursor: not-allowed;
    background: #f8fafd;
    &:hover {
      box-shadow: none;
      border-color: @h-border;
    }
    .rp-name {
      color: @h-muted-foreground;
    }
  }
  .rp-icon {
    width: 16px;
    height: 16px;
    border-radius: 6px;
    background: rgba(@h-primary-rgb, 0.08);
    color: @h-primary;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    .anticon {
      font-size: 14px;
    }
  }
  .rp-info {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
    flex: 1;
  }
  .rp-head {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .rp-name {
    font-size: 13px;
    font-weight: 600;
    color: @h-foreground;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .rp-meta {
    font-size: 11px;
    color: @h-muted-foreground;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    gap: 4px;
    .anticon {
      font-size: 12px;
    }
  }
  .rp-tag {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 10.5px;
    font-weight: 600;
    padding: 1px 7px;
    border-radius: 999px;
    flex-shrink: 0;
    white-space: nowrap;
    &.available {
      color: @h-green;
      background: rgba(16, 185, 129, 0.1);
    }
    &.booked {
      color: #d97706;
      background: rgba(245, 158, 11, 0.12);
    }
  }
}
</style>


<template>
  <a-modal
    title="会议预约详情"
    :width="560"
    :visible="visible"
    :footer="null"
    :destroyOnClose="true"
    @cancel="handleCancel"
  >
    <a-spin :spinning="loading">
      <div class="detail-body">
        <div class="form-group">
          <label class="form-label">会议主题</label>
          <div class="h-detail-val">
            <div class="ellipsis-text" :title="record.topic">
              {{ record.topic || '—' }}
            </div>
          </div>
        </div>
        <a-row :gutter="12">
          <a-col :span="12">
            <div class="form-group">
              <label class="form-label">预约部门</label>
              <div class="h-detail-val">
                <div class="ellipsis-text" :title="record.dept">
                  {{ record.dept || '—' }}
                </div>
              </div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="form-group">
              <label class="form-label">选择会议室</label>
              <div class="h-detail-val">{{ record.roomName || '—' }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="form-group">
              <label class="form-label">开始时间</label>
              <div class="h-detail-val">{{ record.startTime || '—' }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="form-group">
              <label class="form-label">结束时间</label>
              <div class="h-detail-val">{{ record.endTime || '—' }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="form-group">
              <label class="form-label">时长</label>
              <div class="h-detail-val">{{ durationText }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="form-group">
              <label class="form-label">预约状态</label>
              <div class="h-detail-val">
                <span :class="['h-status-tag', record.status]"> <span class="dot"></span>{{ statusText }} </span>
              </div>
            </div>
          </a-col>
        </a-row>
        <a-row :gutter="12">
          <a-col :span="12">
            <div class="form-group">
              <label class="form-label">申请人</label>
              <div class="h-detail-val">{{ record.userName || '—' }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="form-group">
              <label class="form-label">工号</label>
              <div class="h-detail-val">{{ record.userCode || '—' }}</div>
            </div>
          </a-col>
        </a-row>
        <div class="form-group">
          <label class="form-label">参会人员</label>
          <div class="h-detail-val h-att-wrap">
            <template v-if="attendeeTags.length">
              <span class="h-att-tag" v-for="(tag, i) in attendeeTags" :key="i">{{ tag }}</span>
            </template>
            <span v-else style="color: #94a3b8">—</span>
          </div>
        </div>
      </div>
    </a-spin>
    <div class="detail-footer">
      <a-button class="h-btn h-btn-secondary" @click="handleCancel">关闭</a-button>
    </div>
  </a-modal>
</template>

<script>
import { getAction } from '@/api/manage'

export default {
  name: 'HrmHyglBookingDetailModal',
  data() {
    return {
      visible: false,
      loading: false,
      record: {},
      attendeeTags: [],
      url: {
        queryById: '/hygl/hrmHyglBooking/queryById',
        queryByNos: '/hrm/hrEmployeeInformation/queryByNos',
      },
    }
  },
  computed: {
    statusText() {
      const map = { booked: '已预约', done: '已结束', cancelled: '已取消' }
      return map[this.record.status] || this.record.status || '—'
    },
    durationText() {
      const d = this.record.duration
      if (!d) return '—'
      const h = Math.floor(d / 60)
      const m = d % 60
      return (h ? h + ' 小时 ' : '') + (m ? m + ' 分钟' : '') || '0 分钟'
    },
  },
  methods: {
    show(record) {
      this.visible = true
      this.record = Object.assign({}, record)
      this.attendeeTags = []
      // 如果有id，调详情接口获取完整数据
      if (this.record.id) {
        this.fetchDetail(this.record.id)
      } else {
        this.resolveAttendees(this.record.attendees)
      }
    },
    fetchDetail(id) {
      const that = this
      that.loading = true
      getAction(that.url.queryById, { id: id })
        .then((res) => {
          if (res.success && res.result) {
            that.record = res.result
            that.resolveAttendees(res.result.attendees)
          }
        })
        .finally(() => {
          that.loading = false
        })
    },
    resolveAttendees(attendees) {
      const nos = this.parseAttendeeNos(attendees)
      if (!nos.length) {
        this.attendeeTags = []
        return
      }
      // 通过工号查询人员信息，展示"名字（工号）"
      getAction(this.url.queryByNos, { nos: nos.join(',') })
        .then((res) => {
          if (res.success) {
            const records = res.result.records || res.result || []
            const map = {}
            records.forEach((e) => {
              map[e.no] = e.name || e.no
            })
            this.attendeeTags = nos.map((no) => {
              const name = map[no]
              return name ? name : no
              // return name ? name + '（' + no + '）' : no
            })
          } else {
            this.attendeeTags = nos
          }
        })
        .catch(() => {
          this.attendeeTags = nos
        })
    },
    parseAttendeeNos(attendees) {
      if (!attendees) return []
      if (Array.isArray(attendees)) return attendees.filter((x) => x)
      return String(attendees)
        .split(',')
        .filter((x) => x)
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
  padding-top: 10px;
}
.detail-body {
  padding: 8px 4px 4px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}
.form-label {
  font-size: 13px;
  font-weight: 600;
  color: @h-foreground;
}
.detail-footer {
  margin-top: 8px;
  text-align: right;
}
</style>


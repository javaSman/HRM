<template>
  <a-modal
    :title="title"
    :width="800"
    :visible="visible"
    :footer="null"
    centered
    :destroyOnClose="true"
    :bodyStyle="{ maxHeight: '80vh', overflow: 'auto', padding: '16px' }"
    @cancel="handleCancel"
  >
    <a-spin :spinning="loading" tip="加载中...">
      <div v-if="room" class="sqgl-room-detail">
        <!-- 房间标题行 -->
        <div class="sqgl-room-title-row">
          <div class="room-title-left">{{ fullRoomName }}</div>
          <div class="room-title-right">{{ room.roomType_dictText }} {{ room.gender ? `（${room.gender}）` : '' }}</div>
        </div>

        <div class="sqgl-room-stat-row">
          <div class="sqgl-room-stat">
            <div class="num blue">{{ room.beds }}</div>
            <div class="lbl">床位数</div>
          </div>
          <div class="sqgl-room-stat">
            <div class="num">{{ room.occupied }}</div>
            <div class="lbl">已入住</div>
          </div>
          <div class="sqgl-room-stat">
            <div class="num green">{{ room.remainingBeds }}</div>
            <div class="lbl">剩余床位</div>
          </div>
          <div class="sqgl-room-stat">
            <div class="num amber">{{ room.occupancyRate }}%</div>
            <div class="lbl">入住率</div>
          </div>
        </div>

        <!-- 基本信息 -->
        <div class="sqgl-sub-title">基本信息</div>
        <div class="sqgl-rm-info-grid">
          <div class="row">
            <span class="k">房间名称</span><span class="v">{{ room.name || '—' }}</span>
          </div>
          <div class="row">
            <span class="k">房间类型</span><span class="v">{{ room.roomType_dictText || '—' }}</span>
          </div>
          <div class="row">
            <span class="k">男/女房间</span><span class="v">{{ room.gender || '—' }}</span>
          </div>
          <div class="row">
            <span class="k">最多入住人数</span
            ><span class="v">{{ room.maxOccupancy != null ? room.maxOccupancy : '—' }}</span>
          </div>
          <div class="row">
            <span class="k">房间押金</span><span class="v">{{ room.deposit != null ? '¥ ' + room.deposit : '—' }}</span>
          </div>
          <div class="row">
            <span class="k">房间租金</span><span class="v">{{ room.rent != null ? '¥ ' + room.rent : '—' }}</span>
          </div>
          <div class="row full">
            <span class="k">入住公司</span><span class="v">{{ room.company || '—' }}</span>
          </div>
          <div class="row full">
            <span class="k">备注</span><span class="v">{{ room.remark || '—' }}</span>
          </div>
        </div>

        <!-- 入住人员 -->
        <div class="sqgl-sub-title" style="margin-top: 14px">
          入住人员<span class="sqgl-badge">{{ occupants.length }}</span>
        </div>
        <a-table
          v-if="occupants.length"
          size="small"
          :bordered="false"
          rowKey="empNo"
          :columns="columns"
          :dataSource="occupants"
          :pagination="false"
        />
        <div v-else class="sqgl-empty-hint">该房间暂无入住人员</div>
      </div>
      <div v-else class="sqgl-empty-hint">暂无房间数据</div>
    </a-spin>
  </a-modal>
</template>

<script>
import { getAction } from '@/api/manage'

export default {
  name: 'DormitoryRoomDetailModal',
  data() {
    return {
      title: '房间基本信息',
      visible: false,
      loading: false,
      room: null,
      bldName: '',
      roomName: '',
      occupantsList: [], // 入住人员列表
      columns: [
        { title: '工号', dataIndex: 'empNo', align: 'center' },
        { title: '姓名', dataIndex: 'empName', align: 'center' },
        { title: '性别', dataIndex: 'sex', align: 'center' },
        { title: '所属公司', dataIndex: 'company', align: 'center', ellipsis: true, width: 100 },
        { title: '所属部门', dataIndex: 'deptPath', align: 'center', ellipsis: true, width: 150 },
        { title: '人员类型', dataIndex: 'personType_dictText', align: 'center', width: 80 },
        { title: '手机号码', dataIndex: 'phone', align: 'center', width: 110 },
        { title: '入住日期', dataIndex: 'checkinDate', align: 'center', width: 100 },
      ],
    }
  },
  computed: {
    occupants() {
      return this.occupantsList || []
    },
    fullRoomName() {
      return this.roomName || (this.room ? this.room.name : '') || '—'
    },
  },
  methods: {
    open(roomId, bldName, roomName) {
      this.visible = true
      this.room = null
      this.occupantsList = []
      this.bldName = bldName || ''
      this.roomName = roomName || ''
      this.loadRoomDetail(roomId)
    },
    loadRoomDetail(roomId) {
      if (!roomId) return
      this.loading = true
      // 获取房间基本信息
      getAction('/sqgl/hrmSqglRoom/list', { id: roomId })
        .then((res) => {
          if (res.success) {
            this.room = res.result.records[0]
            this.room.remainingBeds = this.room.beds - this.room.occupied
            this.room.occupancyRate = this.room.beds ? ((this.room.occupied * 100) / this.room.beds).toFixed(1) : 0
            // 更新标题
            const displayName = this.fullRoomName
            this.title = '房间基本信息 · ' + displayName
            // 获取入住人员信息
            this.loadOccupants(roomId)
          } else {
            this.$message.warning(res.message)
            this.loading = false
          }
        })
        .catch(() => {
          this.loading = false
        })
    },
    // 根据房间ID获取入住人员信息
    loadOccupants(roomId) {
      getAction('/sqgl/hrmSqglPersonInfo/getYrzByRoomId', { roomId: roomId })
        .then((res) => {
          if (res.success) {
            this.occupantsList = res.result || []
            const cmps = new Set()
            res.result.forEach((item) => {
              cmps.add(item.company)
            })
            this.room.company = cmps.size ? [...cmps].join('，') : '—'
          } else {
            this.$message.warning(res.message || '获取入住人员信息失败')
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>

<style lang="less" scoped>
@sqgl-primary: #2563eb;
@sqgl-primary-rgb: 37, 99, 235;
@sqgl-border: #e2e8f0;
@sqgl-muted-foreground: #64748b;
@sqgl-foreground: #1a2a3d;
@sqgl-gradient-blue: linear-gradient(135deg, #2d78ff 0%, #4a9eff 100%);
@sqgl-shadow-card: 0 2px 12px rgba(45, 120, 255, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03);

.sqgl-room-detail {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sqgl-room-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: rgba(@sqgl-primary-rgb, 0.04);
  border: 1px solid rgba(@sqgl-primary-rgb, 0.1);
  border-radius: 8px;
  margin-bottom: 10px;
  .room-title-left {
    font-size: 15px;
    font-weight: 700;
    color: @sqgl-foreground;
  }
  .room-title-right {
    font-size: 12px;
    color: @sqgl-primary;
    background: rgba(@sqgl-primary-rgb, 0.1);
    padding: 3px 10px;
    border-radius: 5px;
    border: 1px solid rgba(@sqgl-primary-rgb, 0.2);
    font-weight: 600;
  }
}

.sqgl-room-stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin: 0 0 14px;
}
.sqgl-room-stat {
  background: #fff;
  border: 1px solid @sqgl-border;
  border-radius: 7px;
  padding: 10px 6px;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: @sqgl-shadow-card;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: @sqgl-gradient-blue;
    opacity: 0.85;
  }
  .num {
    font-size: 19px;
    font-weight: 700;
    color: @sqgl-foreground;
    line-height: 1.1;
    &.green {
      color: #10b981;
    }
    &.blue {
      color: @sqgl-primary;
    }
    &.amber {
      color: #f59e0b;
    }
  }
  .lbl {
    font-size: 10.5px;
    color: @sqgl-muted-foreground;
    margin-top: 5px;
  }
}

.sqgl-sub-title {
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(@sqgl-primary-rgb, 0.7);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 2px 0;
  &::before {
    content: '';
    width: 3px;
    height: 12px;
    background: @sqgl-gradient-blue;
    border-radius: 2px;
  }
}
.sqgl-badge {
  margin-left: 4px;
  font-size: 11px;
  background: rgba(@sqgl-primary-rgb, 0.1);
  color: @sqgl-primary;
  padding: 1px 7px;
  border-radius: 4px;
  font-weight: 600;
}

.sqgl-rm-info-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0 12px;
  .row {
    flex: 0 0 calc(50% - 6px);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    padding: 9px 11px;
    border-radius: 7px;
    margin-bottom: 7px;
    background: rgba(@sqgl-primary-rgb, 0.022);
    border: 1px solid rgba(@sqgl-primary-rgb, 0.06);
    min-height: 36px;
    &.full {
      flex: 0 0 100%;
    }
    .k {
      color: @sqgl-muted-foreground;
      font-size: 11.5px;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .v {
      color: @sqgl-foreground;
      font-weight: 500;
      text-align: right;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.sqgl-empty-hint {
  padding: 24px;
  text-align: center;
  color: #94a3b8;
  font-size: 12.5px;
}

@media (max-width: 520px) {
  .sqgl-room-stat-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .sqgl-rm-info-grid {
    grid-template-columns: 1fr;
  }
}
</style>

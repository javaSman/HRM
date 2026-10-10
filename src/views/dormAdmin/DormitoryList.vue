<template>
  <div class="sqgl-module">
    <!-- 统计栏 -->
    <div class="sqgl-stats-row">
      <div class="sqgl-stat-card">
        <div class="st-title">区域</div>
        <div class="st-num">
          <strong>{{ stats.areaCount }}</strong
          ><span>个</span>
        </div>
      </div>
      <div class="sqgl-stat-card">
        <div class="st-title">楼栋</div>
        <div class="st-num">
          <strong>{{ stats.buildingCount }}</strong
          ><span>栋</span>
        </div>
      </div>
      <div class="sqgl-stat-card">
        <div class="st-title">房间</div>
        <div class="st-num">
          <strong>{{ stats.roomCount }}</strong
          ><span>间</span>
        </div>
        <div class="st-sub">
          <span
            >使用率：<b>{{ (stats.roomUsageRate || 0).toFixed(2) }}%</b></span
          >
        </div>
      </div>
      <div class="sqgl-stat-card">
        <div class="st-title">总床位</div>
        <div class="st-num">
          <strong>{{ stats.totalBeds }}</strong
          ><span>床</span>
        </div>
        <div class="st-sub">
          <span
            >使用率：<b>{{ (stats.bedUsageRate || 0).toFixed(2) }}%</b></span
          >
        </div>
      </div>
      <div class="sqgl-stat-card">
        <div class="st-title">剩余床位</div>
        <div class="st-num">
          <strong>{{ stats.remainingBeds }}</strong
          ><span>床</span>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="sqgl-filter-bar">
      <div class="sqgl-filter-form"></div>
      <div class="sqgl-filter-actions">
        <a-button type="primary" @click="handleAdd"><a-icon type="plus" />新增</a-button>
      </div>
    </div>

    <!-- 三列布局 -->
    <div class="sqgl-tri-wrap">
      <a-spin :spinning="loading.page" tip="加载中...">
        <div class="sqgl-tri-grid">
          <!-- 区域信息 -->
          <div class="sqgl-col-panel">
            <div class="sqgl-col-header">
              <div class="sqgl-col-title">区域信息</div>
              <div class="sqgl-col-actions">
                <button class="sqgl-mini-btn" :disabled="!selArea" @click="handleEditArea">
                  <a-icon type="edit" />编辑
                </button>
                <button class="sqgl-mini-btn danger" :disabled="!selArea" @click="handleDeleteArea">
                  <a-icon type="delete" />删除区域
                </button>
              </div>
            </div>
            <div class="sqgl-area-info">
              <div class="sqgl-area-info-head">
                区域信息<span class="sqgl-badge">{{ areaList.length }}</span>
              </div>
              <div class="sqgl-area-chips">
                <div
                  v-for="area in areaList"
                  :key="area.id"
                  :class="['sqgl-a-chip', selArea === area.id ? 'active' : '']"
                  @click="onAreaChange(area.id)"
                >
                  {{ area.name }}
                </div>
                <div v-if="!areaList.length" class="sqgl-empty-hint">暂无区域数据</div>
              </div>
              <div class="sqgl-area-detail" v-if="currentArea">
                <div class="ad-head">
                  <div class="ad-name">{{ currentArea.name }}</div>
                  <div class="ad-badge">
                    <b>{{ currentArea.buildingCount }}栋</b>
                  </div>
                </div>
                <div class="ad-row">
                  <span class="k">区域编码</span
                  ><span class="v"
                    ><strong>{{ currentArea.code || '—' }}</strong></span
                  >
                </div>
                <div class="ad-row">
                  <span class="k">区域管理员</span><span class="v">{{ currentArea.admin || '—' }}</span>
                </div>
                <div class="ad-row">
                  <span class="k">楼栋数</span
                  ><span class="v"
                    ><strong>{{ currentArea.buildingCount }}</strong></span
                  >
                </div>
                <div class="ad-row">
                  <span class="k">房间数</span
                  ><span class="v"
                    ><strong>{{ currentArea.roomCount }}</strong></span
                  >
                </div>
                <div class="ad-row">
                  <span class="k">床位数</span
                  ><span class="v"
                    ><strong>{{ currentArea.bedCount }}</strong></span
                  >
                </div>
                <div class="ad-row">
                  <span class="k">剩余床位</span
                  ><span class="v"
                    ><strong style="color: #10b981">{{ currentArea.remainingBeds }}</strong></span
                  >
                </div>
                <div class="ad-row full">
                  <span class="k">备注</span><span class="v">{{ currentArea.remark || '—' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 楼栋 / 楼层信息 -->
          <div class="sqgl-col-panel">
            <div class="sqgl-col-header">
              <div class="sqgl-col-title">楼栋 / 楼层信息</div>
              <div class="sqgl-col-actions">
                <button class="sqgl-mini-btn" :disabled="!selBld" @click="handleEditBld">
                  <a-icon type="edit" />编辑
                </button>
                <button class="sqgl-mini-btn danger" :disabled="!selBld" @click="handleDeleteBld">
                  <a-icon type="delete" />删除楼栋
                </button>
                <button class="sqgl-mini-btn danger" :disabled="!selFloor" @click="handleDeleteFloor">
                  <a-icon type="delete" />删除楼层
                </button>
              </div>
            </div>
            <div class="sqgl-sub-title">
              楼栋信息<span class="sqgl-badge">{{ buildingList.length }}</span>
            </div>
            <div class="sqgl-chip-list">
              <div
                v-for="bld in buildingList"
                :key="bld.id"
                :class="['sqgl-chip', selBld === bld.id ? 'active' : '']"
                @click="onBldChange(bld.id)"
              >
                {{ bld.name }}
              </div>
              <div v-if="!buildingList.length" class="sqgl-empty-hint">暂无楼栋数据</div>
            </div>
            <div class="sqgl-detail-block" v-if="currentBld">
              <div class="sqgl-detail-card">
                <div class="sqgl-detail-title">
                  {{ currentBld.name }}<span class="sqgl-pill">{{ floorCN(currentBld.floorCount) }}</span>
                </div>
                <div class="sqgl-detail-grid">
                  <div class="row">
                    <span class="k">楼层数</span><span class="v">{{ floorCN(currentBld.floorCount) }}</span>
                  </div>
                  <div class="row">
                    <span class="k">楼栋管理员</span><span class="v">{{ currentBld.admin || '—' }}</span>
                  </div>
                  <div class="row">
                    <span class="k">房间数</span
                    ><span class="v"
                      ><strong>{{ currentBld.roomCount }}</strong></span
                    >
                  </div>
                  <div class="row">
                    <span class="k">床位数</span
                    ><span class="v"
                      ><strong>{{ currentBld.bedCount }}</strong></span
                    >
                  </div>
                  <div class="row">
                    <span class="k">剩余床位</span
                    ><span class="v"
                      ><strong style="color: #10b981">{{ currentBld.remainingBeds }}</strong></span
                    >
                  </div>
                  <div class="row full">
                    <span class="k">备注</span><span class="v">{{ currentBld.remark || '—' }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="sqgl-sub-title">
              楼层信息<span class="sqgl-badge">{{ floorList.length }}</span>
            </div>
            <div class="sqgl-chip-list">
              <div
                v-for="floor in floorList"
                :key="floor.id"
                :class="['sqgl-chip', selFloor === floor.id ? 'active' : '']"
                @click="onFloorChange(floor.id)"
              >
                {{ floor.name }}
              </div>
              <div v-if="!floorList.length" class="sqgl-empty-hint">暂无楼层数据</div>
            </div>
            <div class="sqgl-detail-block" v-if="currentFloor">
              <div class="sqgl-detail-card">
                <div class="sqgl-detail-title">
                  {{ currentFloor.name }}<span class="sqgl-pill">{{ currentFloor.roomCount }}间</span>
                </div>
                <div class="sqgl-detail-grid">
                  <div class="row">
                    <span class="k">楼层</span><span class="v">{{ currentFloor.name }}</span>
                  </div>
                  <div class="row">
                    <span class="k">房间数</span
                    ><span class="v"
                      ><strong>{{ currentFloor.roomCount }}</strong></span
                    >
                  </div>
                  <div class="row">
                    <span class="k">床位数</span
                    ><span class="v"
                      ><strong>{{ currentFloor.bedCount }}</strong></span
                    >
                  </div>
                  <div class="row">
                    <span class="k">剩余床位</span
                    ><span class="v"
                      ><strong style="color: #10b981">{{ currentFloor.remainingBeds }}</strong></span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 房间信息 -->
          <div class="sqgl-col-panel">
            <div class="sqgl-col-header">
              <div class="sqgl-col-title">房间信息</div>
              <div class="sqgl-col-actions">
                <button class="sqgl-mini-btn" :disabled="!selRoom" @click="handleEditRoom">
                  <a-icon type="edit" />编辑
                </button>
                <button class="sqgl-mini-btn danger" :disabled="!selRoom" @click="handleDeleteRoom">
                  <a-icon type="delete" />删除房间
                </button>
              </div>
            </div>
            <div class="sqgl-sub-title">
              房间信息<span class="sqgl-badge">{{ roomList.length }}</span>
            </div>
            <div class="sqgl-chip-list">
              <div
                v-for="room in roomList"
                :key="room.id"
                :class="['sqgl-chip sqgl-room-chip', selRoom === room.id ? 'active' : '']"
                @click="onRoomClick(room.id)"
              >
                <span>{{ room.name }}</span>
                <span :class="['sqgl-room-tag', roomTagClass(room)]">{{ roomTagText(room) }}</span>
              </div>
              <div v-if="!roomList.length" class="sqgl-empty-hint">暂无房间数据</div>
            </div>
          </div>
        </div>
      </a-spin>
    </div>

    <!-- 新增 / 编辑弹窗 -->
    <dormitory-form-modal ref="formModal" @ok="onFormSaved" />
    <!-- 房间详情弹窗 -->
    <dormitory-room-detail-modal ref="roomModal" />
    <!-- 删除确认弹窗 -->
    <a-modal
      :visible="confirmVisible"
      :width="340"
      :footer="null"
      centered
      :bodyStyle="{ padding: '24px 24px 20px', textAlign: 'center' }"
      wrapClassName="sqgl-confirm-modal"
      @cancel="onConfirmCancel"
    >
      <div
        style="
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 14px;
        "
      >
        <a-icon type="warning" style="font-size: 26px; color: #ef4444" />
      </div>
      <div style="font-size: 16px; font-weight: 700; color: #1a2a3d; margin-bottom: 8px">{{ confirmTitle }}</div>
      <div
        style="font-size: 13px; color: #64748b; line-height: 1.6; margin-bottom: 20px; word-break: break-all"
        v-html="confirmText"
      ></div>
      <div style="display: flex; gap: 10px; justify-content: center">
        <a-button @click="onConfirmCancel">取消</a-button>
        <a-button type="danger" @click="onConfirmOk">确认删除</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { getAction, deleteAction } from '@/api/manage'
import DormitoryFormModal from './modules/DormitoryFormModal'
import DormitoryRoomDetailModal from './modules/DormitoryRoomDetailModal'

export default {
  name: 'DormitoryList',
  components: { DormitoryFormModal, DormitoryRoomDetailModal },
  data() {
    return {
      loading: { page: false },
      stats: {
        areaCount: 0,
        buildingCount: 0,
        roomCount: 0,
        emptyRoomCount: 0,
        roomUsageRate: 0,
        totalBeds: 0,
        occupiedBeds: 0,
        remainingBeds: 0,
        bedUsageRate: 0,
      },
      areaList: [],
      buildingList: [],
      floorList: [],
      roomList: [],
      selArea: null,
      selBld: null,
      selFloor: null,
      selRoom: null,
      confirmVisible: false,
      confirmTitle: '',
      confirmText: '',
      confirmCallback: null,
    }
  },
  computed: {
    currentArea() {
      return this.areaList.find((a) => a.id === this.selArea) || null
    },
    currentBld() {
      return this.buildingList.find((b) => b.id === this.selBld) || null
    },
    currentFloor() {
      return this.floorList.find((f) => f.id === this.selFloor) || null
    },
    currentRoom() {
      return this.roomList.find((r) => r.id === this.selRoom) || null
    },
  },
  mounted() {
    this.initPage()
  },
  methods: {
    // ============ 初始化 ============
    initPage() {
      this.loadStats()
      this.loadAreas()
    },
    loadStats() {
      getAction('/sqgl/statistics').then((res) => {
        if (res.success && res.result) {
          this.stats = { ...this.stats, ...res.result }
        }
      })
    },
    loadAreas() {
      this.loading.page = true
      getAction('/sqgl/hrmSqglArea/listWithStats')
        .then((res) => {
          if (res.success) {
            this.areaList = res.result || []
            const inList = this.areaList.some((a) => a.id === this.selArea)
            if (!inList) {
              this.selArea = this.areaList.length ? this.areaList[0].id : null
            }
            this.loadBuildings(this.selArea)
          } else {
            this.$message.warning(res.message)
          }
        })
        .finally(() => {
          this.loading.page = false
        })
    },
    loadBuildings(areaId) {
      this.buildingList = []
      this.floorList = []
      this.roomList = []
      this.selBld = null
      this.selFloor = null
      this.selRoom = null
      if (!areaId) return
      return getAction('/sqgl/hrmSqglBuilding/listByArea', { areaId }).then((res) => {
        if (res.success) {
          this.buildingList = res.result || []
          if (this.buildingList.length) {
            this.selBld = this.buildingList[0].id
            this.loadFloors(this.selBld)
          }
        }
      })
    },
    loadFloors(buildingId) {
      this.floorList = []
      this.roomList = []
      this.selFloor = null
      this.selRoom = null
      if (!buildingId) return
      return getAction('/sqgl/hrmSqglFloor/listByBuilding', { buildingIds: buildingId }).then((res) => {
        if (res.success) {
          this.floorList = res.result || []
          if (this.floorList.length) {
            this.selFloor = this.floorList[0].id
            this.loadRooms(this.selFloor)
          }
        }
      })
    },
    loadRooms(floorId) {
      this.roomList = []
      this.selRoom = null
      if (!floorId) return
      return getAction('/sqgl/hrmSqglRoom/listByFloor', { floorIds: floorId }).then((res) => {
        if (res.success) {
          this.roomList = res.result || []
        }
      })
    },
    // ============ 刷新（保持当前选择） ============
    refreshFloors() {
      if (!this.selBld) return
      return getAction('/sqgl/hrmSqglFloor/listByBuilding', { buildingIds: this.selBld }).then((res) => {
        if (res.success) {
          this.floorList = res.result || []
          const exists = this.floorList.find((f) => f.id === this.selFloor)
          if (!exists) {
            this.selFloor = this.floorList.length ? this.floorList[0].id : null
            this.selRoom = null
            this.roomList = []
          }
          if (this.selFloor) this.loadRooms(this.selFloor)
        }
      })
    },
    refreshBuildings() {
      if (!this.selArea) return
      return getAction('/sqgl/hrmSqglBuilding/listByArea', { areaId: this.selArea }).then((res) => {
        if (res.success) {
          this.buildingList = res.result || []
          const exists = this.buildingList.find((b) => b.id === this.selBld)
          if (!exists) {
            this.selBld = this.buildingList.length ? this.buildingList[0].id : null
            this.selFloor = null
            this.selRoom = null
            this.floorList = []
            this.roomList = []
            if (this.selBld) this.loadFloors(this.selBld)
          } else {
            this.refreshFloors()
          }
        }
      })
    },
    // ============ 选择切换 ============
    onAreaChange(areaId) {
      this.selArea = areaId
      this.loadBuildings(areaId)
    },
    onBldChange(bldId) {
      this.selBld = bldId
      this.loadFloors(bldId)
    },
    onFloorChange(floorId) {
      this.selFloor = floorId
      this.loadRooms(floorId)
    },
    onRoomClick(roomId) {
      this.selRoom = roomId
      const bldName = this.currentBld ? this.currentBld.name : ''
      this.$refs.roomModal.open(roomId, bldName)
    },
    // ============ 楼层数中文格式 ============
    floorCN(n) {
      if (!n || n <= 0) return '0层'
      const m = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
      if (n >= 1 && n <= 9) return m[n] + '层'
      if (n === 10) return '十层'
      if (n < 20) return '十' + m[n - 10] + '层'
      if (n % 10 === 0) return m[Math.floor(n / 10)] + '十层'
      return m[Math.floor(n / 10)] + '十' + m[n % 10] + '层'
    },
    // ============ 房间状态标签 ============
    roomTagClass(room) {
      const occ = room.occupied || 0
      const beds = room.beds || 0
      if (occ === 0) return 'empty'
      if (occ >= beds) return 'full'
      return 'partial'
    },
    roomTagText(room) {
      const occ = room.occupied || 0
      const beds = room.beds || 0
      if (occ === 0) return '空房'
      if (occ >= beds) return '已满'
      return '部分入住'
    },
    // ============ 新增 / 编辑 ============
    handleAdd() {
      this.$refs.formModal.open('add')
    },
    handleEditArea() {
      if (!this.selArea) {
        this.$message.warning('请先选择区域')
        return
      }
      this.$refs.formModal.open('edit', { areaId: this.selArea })
    },
    handleEditBld() {
      if (!this.selBld) {
        this.$message.warning('请先选择楼栋')
        return
      }
      this.$refs.formModal.open('edit', { areaId: this.selArea, bldId: this.selBld })
    },
    handleEditRoom() {
      if (!this.selRoom) {
        this.$message.warning('请先选择房间')
        return
      }
      this.$refs.formModal.open('edit', { areaId: this.selArea, bldId: this.selBld, roomId: this.selRoom })
    },
    onFormSaved() {
      this.loadStats()
      this.loadAreas()
    },
    // ============ 删除 ============
    showConfirm(title, text, callback) {
      this.confirmTitle = title
      this.confirmText = text
      this.confirmCallback = callback
      this.confirmVisible = true
    },
    onConfirmOk() {
      this.confirmVisible = false
      const cb = this.confirmCallback
      this.confirmCallback = null
      if (cb) cb()
    },
    onConfirmCancel() {
      this.confirmVisible = false
      this.confirmCallback = null
    },
    handleDeleteArea() {
      if (!this.selArea) return
      const areaName = this.currentArea ? this.currentArea.name : ''
      this.showConfirm('删除区域', '确认删除区域 <b>' + areaName + '</b> 及其下所有楼栋与房间？', () => {
        deleteAction('/sqgl/hrmSqglArea/delete', { id: this.selArea }).then((res) => {
          if (res.success) {
            this.$message.success('已删除该区域')
            this.selArea = null
            this.loadAreas()
            this.loadStats()
          } else {
            this.$message.warning(res.message)
          }
        })
      })
    },
    handleDeleteBld() {
      if (!this.selBld) return
      const bldName = this.currentBld ? this.currentBld.name : ''
      this.showConfirm('删除楼栋', '确认删除楼栋 <b>' + bldName + '</b> 及其下所有房间？', () => {
        deleteAction('/sqgl/hrmSqglBuilding/delete', { id: this.selBld }).then((res) => {
          if (res.success) {
            this.$message.success('已删除该楼栋')
            this.selBld = null
            this.loadAreas()
            this.loadStats()
          } else {
            this.$message.warning(res.message)
          }
        })
      })
    },
    handleDeleteFloor() {
      if (!this.selFloor) return
      const bldName = this.currentBld ? this.currentBld.name : ''
      const floorName = this.currentFloor ? this.currentFloor.name : ''
      this.showConfirm(
        '删除楼层',
        '确认删除 <b>' + bldName + '</b> 的 <b>' + floorName + '</b> 及其下所有房间？',
        () => {
          deleteAction('/sqgl/hrmSqglFloor/delete', { id: this.selFloor }).then((res) => {
            if (res.success) {
              this.$message.success('已删除该楼层')
              this.selFloor = null
              this.refreshBuildings()
              this.loadStats()
            } else {
              this.$message.warning(res.message)
            }
          })
        }
      )
    },
    handleDeleteRoom() {
      if (!this.selRoom) return
      const bldName = this.currentBld ? this.currentBld.name : ''
      const roomName = this.currentRoom ? this.currentRoom.name : ''
      this.showConfirm('删除房间', '确认删除房间 <b>' + bldName + ' ' + roomName + '室</b>？', () => {
        deleteAction('/sqgl/hrmSqglRoom/delete', { id: this.selRoom }).then((res) => {
          if (res.success) {
            this.$message.success('已删除该房间')
            this.selRoom = null
            this.refreshFloors()
            this.loadStats()
          } else {
            this.$message.warning(res.message)
          }
        })
      })
    },
  },
}
</script>

<style lang="less">
.sqgl-confirm-modal b {
  color: #2563eb;
  font-weight: 600;
}
</style>

<style lang="less" scoped>
@sqgl-primary: #2563eb;
@sqgl-primary-rgb: 37, 99, 235;
@sqgl-border: #e2e8f0;
@sqgl-muted: #f1f5f9;
@sqgl-muted-foreground: #64748b;
@sqgl-foreground: #1a2a3d;
@sqgl-background: #f8fafd;
@sqgl-green: #10b981;
@sqgl-amber: #f59e0b;
@sqgl-red: #ef4444;
@sqgl-gradient-blue: linear-gradient(135deg, #2d78ff 0%, #4a9eff 100%);
@sqgl-shadow-card: 0 2px 12px rgba(45, 120, 255, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03);

.sqgl-module {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 14px 20px;
  gap: 10px;
  background: @sqgl-background;
  overflow: hidden;
}

/* ===== 统计栏 ===== */
.sqgl-stats-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  flex-shrink: 0;
}
.sqgl-stat-card {
  background: #fff;
  border: 1px solid @sqgl-border;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: @sqgl-shadow-card;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  min-height: 78px;
  transition: all 0.3s;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: @sqgl-gradient-blue;
    box-shadow: 0 0 8px rgba(45, 120, 255, 0.25);
  }
  &.active {
    background: @sqgl-gradient-blue;
    border-color: transparent;
    box-shadow: 0 6px 22px rgba(45, 120, 255, 0.35);
    &::before {
      display: none;
    }
    .st-title,
    .st-num strong,
    .st-num span,
    .st-sub,
    .st-sub b {
      color: #fff;
    }
  }
  .st-title {
    font-size: 12.5px;
    color: @sqgl-muted-foreground;
    font-weight: 500;
    margin-bottom: 2px;
  }
  .st-num {
    display: flex;
    align-items: baseline;
    gap: 4px;
    line-height: 1.2;
    strong {
      font-size: 22px;
      font-weight: 700;
      color: @sqgl-foreground;
    }
    span {
      font-size: 12px;
      color: @sqgl-muted-foreground;
    }
  }
  .st-sub {
    margin-top: 6px;
    font-size: 11px;
    color: @sqgl-muted-foreground;
    line-height: 1.55;
    b {
      color: @sqgl-foreground;
      font-weight: 600;
    }
  }
}

/* ===== 筛选栏 ===== */
.sqgl-filter-bar {
  background: #fff;
  border: 1px solid @sqgl-border;
  border-radius: 8px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: @sqgl-shadow-card;
  flex-shrink: 0;
  flex-wrap: nowrap;
  overflow-x: auto;
}
.sqgl-filter-form {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: nowrap;
  min-width: 0;
}
.sqgl-filter-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* ===== 三列布局 ===== */
.sqgl-tri-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  /deep/ .ant-spin-container {
    flex: 1;
    display: flex;
    min-height: 0;
  }
}
.sqgl-tri-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  flex: 1;
  min-height: 0;
  height: 100%;
}
.sqgl-col-panel {
  background: #fff;
  border: 1px solid @sqgl-border;
  border-radius: 8px;
  box-shadow: @sqgl-shadow-card;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 0;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: @sqgl-gradient-blue;
    box-shadow: 0 0 8px rgba(45, 120, 255, 0.25);
    z-index: 1;
  }
}
.sqgl-col-header {
  padding: 11px 16px;
  border-bottom: 1px solid @sqgl-border;
  font-size: 12.5px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  background: linear-gradient(180deg, rgba(@sqgl-primary-rgb, 0.018), transparent);
  .sqgl-col-title {
    font-size: 12.5px;
    font-weight: 600;
  }
  .sqgl-col-actions {
    display: flex;
    gap: 6px;
  }
}
.sqgl-mini-btn {
  height: 24px;
  padding: 0 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid @sqgl-border;
  background: #fff;
  color: @sqgl-muted-foreground;
  transition: all 0.2s;
  .anticon {
    font-size: 12px;
  }
  &:hover:not(:disabled) {
    border-color: rgba(@sqgl-primary-rgb, 0.3);
    color: @sqgl-primary;
    background: rgba(@sqgl-primary-rgb, 0.04);
  }
  &.danger:hover:not(:disabled) {
    border-color: rgba(239, 68, 68, 0.3);
    color: @sqgl-red;
    background: rgba(239, 68, 68, 0.06);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

/* ===== 区域信息列 ===== */
.sqgl-area-info {
  padding: 10px 16px 12px;
  background: linear-gradient(180deg, rgba(@sqgl-primary-rgb, 0.025), transparent);
  flex: 1;
  overflow: auto;
}
.sqgl-area-info-head {
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(@sqgl-primary-rgb, 0.7);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 0 6px;
  &::before {
    content: '';
    width: 3px;
    height: 12px;
    background: @sqgl-gradient-blue;
    border-radius: 2px;
  }
}
.sqgl-area-chips {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
}
.sqgl-a-chip {
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  background: #fff;
  border: 1px solid @sqgl-border;
  color: @sqgl-muted-foreground;
  white-space: normal;
  text-align: center;
  line-height: 1.45;
  transition: all 0.2s;
  &:hover {
    border-color: rgba(@sqgl-primary-rgb, 0.3);
    color: @sqgl-primary;
    background: rgba(@sqgl-primary-rgb, 0.04);
  }
  &.active {
    background: linear-gradient(135deg, #dbeafe, #e0e7ff);
    color: #1d4ed8;
    border-color: #93c5fd;
    font-weight: 600;
    box-shadow: 0 2px 6px rgba(45, 120, 255, 0.15);
  }
}
.sqgl-area-detail {
  background: linear-gradient(135deg, rgba(@sqgl-primary-rgb, 0.05), rgba(@sqgl-primary-rgb, 0.012));
  border: 1px solid rgba(@sqgl-primary-rgb, 0.1);
  border-radius: 6px;
  padding: 10px 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  font-size: 12px;
  .ad-head {
    flex: 0 0 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding-bottom: 8px;
    margin-bottom: 2px;
    border-bottom: 1px solid rgba(@sqgl-primary-rgb, 0.12);
  }
  .ad-name {
    font-size: 14px;
    font-weight: 700;
    color: @sqgl-foreground;
  }
  .ad-badge {
    font-size: 12px;
    color: @sqgl-muted-foreground;
    background: rgba(@sqgl-primary-rgb, 0.08);
    border: 1px solid rgba(@sqgl-primary-rgb, 0.15);
    padding: 3px 10px;
    border-radius: 6px;
    white-space: nowrap;
    b {
      color: @sqgl-primary;
      font-weight: 700;
      font-size: 13px;
    }
  }
  .ad-row {
    flex: 0 0 calc(50% - 7px);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
    border-bottom: 1px dashed rgba(226, 232, 240, 0.7);
    &:last-child {
      border-bottom: none;
    }
    &.full {
      flex: 0 0 100%;
    }
    .k {
      color: @sqgl-muted-foreground;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .v {
      color: @sqgl-foreground;
      font-weight: 500;
      text-align: right;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      strong {
        color: @sqgl-primary;
      }
    }
  }
}

/* ===== 楼栋/楼层/房间 chip ===== */
.sqgl-sub-title {
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(@sqgl-primary-rgb, 0.7);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px 0;
  flex-shrink: 0;
  &::before {
    content: '';
    width: 3px;
    height: 12px;
    background: @sqgl-gradient-blue;
    border-radius: 2px;
  }
}
.sqgl-chip-list {
  padding: 10px 16px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  flex-shrink: 0;
}
.sqgl-chip {
  padding: 6px 14px;
  border-radius: 4px;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  background: #fff;
  border: 1px solid @sqgl-border;
  color: @sqgl-foreground;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  text-align: center;
  &:hover {
    border-color: rgba(@sqgl-primary-rgb, 0.3);
    color: @sqgl-primary;
    background: rgba(@sqgl-primary-rgb, 0.04);
  }
  &.active {
    background: linear-gradient(135deg, #dbeafe, #e0e7ff);
    color: #1d4ed8;
    border-color: #93c5fd;
    font-weight: 600;
    box-shadow: 0 2px 6px rgba(45, 120, 255, 0.18);
  }
}
.sqgl-room-chip {
  flex-direction: column;
  gap: 3px;
  padding: 8px 6px;
}
.sqgl-room-tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
  &.empty {
    background: rgba(16, 185, 129, 0.12);
    color: @sqgl-green;
  }
  &.partial {
    background: rgba(245, 158, 11, 0.14);
    color: @sqgl-amber;
  }
  &.full {
    background: rgba(239, 68, 68, 0.12);
    color: @sqgl-red;
  }
}

/* ===== 详情卡片 ===== */
.sqgl-detail-block {
  padding: 6px 16px 10px;
  flex-shrink: 0;
}
.sqgl-detail-card {
  background: linear-gradient(135deg, rgba(@sqgl-primary-rgb, 0.045), rgba(@sqgl-primary-rgb, 0.012));
  border: 1px solid rgba(@sqgl-primary-rgb, 0.1);
  border-radius: 6px;
  padding: 12px 14px;
}
.sqgl-detail-title {
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(@sqgl-primary-rgb, 0.12);
  .sqgl-pill {
    margin-left: auto;
    font-size: 10.5px;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 600;
    background: rgba(@sqgl-primary-rgb, 0.1);
    color: @sqgl-primary;
  }
}
.sqgl-detail-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  font-size: 12.5px;
  .row {
    flex: 0 0 calc(50% - 7px);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    border-bottom: 1px dashed rgba(226, 232, 240, 0.7);
    gap: 8px;
    min-height: 28px;
    &:last-child {
      border-bottom: none;
    }
    &.full {
      flex: 0 0 100%;
    }
    .k {
      color: @sqgl-muted-foreground;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .v {
      color: @sqgl-foreground;
      font-weight: 500;
      text-align: right;
      flex: 1;
      min-width: 0;
      strong {
        color: @sqgl-primary;
      }
    }
  }
}

.sqgl-empty-hint {
  flex: 0 0 100%;
  padding: 20px 10px;
  text-align: center;
  color: #94a3b8;
  font-size: 12.5px;
}

@media (max-width: 1300px) {
  .sqgl-stats-row {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 1000px) {
  .sqgl-tri-grid {
    grid-template-columns: 1fr;
  }
  .sqgl-stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

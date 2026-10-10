<template>
  <div class="sqgl-board-app">
    <!-- 统计栏 -->
    <div class="sqgl-stat-bar">
      <div class="sqgl-stat-card">
        <div class="stat-icon"><a-icon type="bank" /></div>
        <div class="stat-label">总区域数</div>
        <div class="stat-value">{{ statistics.totalBuildings || 0 }}<span class="unit">个</span></div>
      </div>
      <div class="sqgl-stat-card">
        <div class="stat-icon green"><a-icon type="home" /></div>
        <div class="stat-label">总房间数</div>
        <div class="stat-value">{{ statistics.totalRooms || 0 }}<span class="unit">间</span></div>
      </div>
      <div class="sqgl-stat-card">
        <div class="stat-icon purple"><a-icon type="team" /></div>
        <div class="stat-label">总床位数</div>
        <div class="stat-value">{{ statistics.totalBeds || 0 }}<span class="unit">床</span></div>
      </div>
      <div class="sqgl-stat-card">
        <div class="stat-icon amber"><a-icon type="user" /></div>
        <div class="stat-label">已入住</div>
        <div class="stat-value">{{ statistics.occupiedBeds || 0 }}<span class="unit">人</span></div>
      </div>
      <div class="sqgl-stat-card">
        <div class="stat-icon red"><a-icon type="hdd" /></div>
        <div class="stat-label">空床位数</div>
        <div class="stat-value">{{ statistics.emptyBeds || 0 }}<span class="unit">床</span></div>
      </div>
    </div>

    <!-- 区域Tab切换 -->
    <div class="sqgl-tab-bar">
      <div
        v-for="area in areaList"
        :key="area.id"
        :class="['sqgl-tab', { active: currentAreaId === area.id }]"
        @click="switchArea(area)"
      >
        {{ area.name }}
      </div>
    </div>

    <!-- 楼栋概览视图 -->
    <div v-if="viewMode === 'overview'" class="sqgl-view-overview">
      <div class="sqgl-board-panel">
        <div class="board-header">
          <div class="board-title">
            <a-icon type="home" />
            <span>楼栋概览</span>
            <span class="area-tag">{{ currentAreaName }}</span>
          </div>
          <div class="room-filter">
            <!-- <a-icon type="search" /> -->
            <a-input v-model="buildingSearchKey" placeholder="搜索楼栋名称" style="width: 160px" allow-clear />
            <a-button type="link" size="small" @click="buildingSearchKey = ''"> <a-icon type="redo" />重置 </a-button>
          </div>
        </div>

        <a-spin :spinning="buildingLoading">
          <div class="sqgl-building-grid">
            <div
              v-for="(building, bi) in filteredBuildings"
              :key="building.buildingId"
              class="sqgl-building-card"
              :style="{ animationDelay: bi * 0.05 + 's' }"
            >
              <div class="building-head">
                <a-icon type="home" />
                <span class="building-name">{{ building.name }}</span>
              </div>
              <div class="building-meta">
                <span class="meta-item"
                  >总层数 <b>{{ building.totalFloors }}</b> 层</span
                >
                <span class="meta-item beds-left"
                  >剩余床位 <b>{{ building.emptyBeds }}</b></span
                >
              </div>
              <div class="building-tower">
                <div
                  v-for="floor in building.floors"
                  :key="floor.floorId"
                  :class="['floor-block', floor.status]"
                  @click="enterBuilding(building, floor.level)"
                >
                  <span class="floor-num">{{ floor.level }}F</span>
                </div>
              </div>
              <div class="building-hint">点击楼层查看房间</div>
            </div>
          </div>
        </a-spin>

        <div class="sqgl-legend">
          <div class="legend-item"><span class="legend-dot" style="background: #10b981"></span>该楼层有空房</div>
          <div class="legend-item"><span class="legend-dot" style="background: #ef4444"></span>该楼层已满</div>
          <div class="legend-item" style="margin-left: auto">
            <a-icon type="info-circle" style="font-size: 12px" />
            点击楼层色块进入该楼层房间分布
          </div>
        </div>
      </div>
    </div>

    <!-- 楼层房间分布视图 -->
    <div v-if="viewMode === 'rooms'" class="sqgl-view-grid">
      <div class="sqgl-rd-layout">
        <!-- 左侧楼层快速定位 -->
        <aside class="sqgl-rd-locator">
          <div class="rd-locator-title">楼层定位</div>
          <div class="rd-locator-list">
            <div
              v-for="floor in floorLocatorList"
              :key="floor.level"
              :class="['loc-item', { active: activeLocatorFloor === floor.level }]"
              @click="scrollToFloor(floor.level)"
            >
              {{ floor.level }}F
            </div>
          </div>
        </aside>

        <!-- 主内容区 -->
        <div class="sqgl-board-panel sqgl-rd-main">
          <div class="board-header">
            <div class="board-title">
              <a-button type="link" size="small" style="margin-right: 2px" @click="backToOverview">
                <a-icon type="arrow-left" style="font-size: 18px;"/>
              </a-button>
              <a-icon type="appstore" />
              <nav class="sqgl-breadcrumb">
                <span class="bc-item">宿舍房间分布</span>
                <a-icon type="right" class="bc-sep" />
                <span class="bc-item">{{ floorData.areaName }}</span>
                <a-icon type="right" class="bc-sep" />
                <span class="bc-item active">{{ floorData.buildingName }}</span>
              </nav>
            </div>
            <div class="room-filter">
              <!-- <a-icon type="search" /> -->
              <a-input v-model="roomSearchKey" placeholder="搜索房间号" style="width: 160px" allow-clear />
              <a-button type="link" size="small" @click="roomSearchKey = ''"> <a-icon type="redo" />重置 </a-button>
            </div>
          </div>

          <a-spin :spinning="floorLoading">
            <div class="sqgl-floor-sections" ref="floorSectionsRef">
              <section
                v-for="floor in floorData.floors"
                :key="floor.floorId"
                :id="'floor-sec-' + floor.level"
                class="sqgl-floor-section"
              >
                <div class="floor-section-head">
                  <span class="floor-section-title">{{ floor.level }}F</span>
                  <span class="floor-section-meta">
                    {{ floor.roomCount }} 间 · 入住 {{ floor.occupiedBeds }}/{{ floor.totalBeds }} · 空房
                    {{ floor.emptyRoomCount }}
                  </span>
                </div>
                <div class="sqgl-room-grid">
                  <a-tooltip v-for="(room, ri) in filterRooms(floor.rooms)" :key="room.roomId" placement="top">
                    <template slot="title">
                      <div class="sqgl-room-tip">
                        <div class="tip-row">
                          <span class="tip-label">房间</span>
                          <span class="tip-val">{{ room.roomName }}</span>
                        </div>
                        <div class="tip-row">
                          <span class="tip-label">床位</span>
                          <span class="tip-val">{{ room.beds }}</span>
                        </div>
                        <div class="tip-row">
                          <span class="tip-label">已入住</span>
                          <span class="tip-val">{{ room.occupied }}</span>
                        </div>
                      </div>
                    </template>
                    <div
                      :class="['room-card', room.status]"
                      :style="{ animationDelay: (ri % 10) * 0.04 + 's' }"
                      @click="openRoomDetail(room)"
                    >
                      <div class="room-no">{{ room.roomName }}</div>
                      <div class="room-dorm-type">{{ room.roomTypeLabel }}</div>
                      <div class="room-icon">
                        <div v-for="(bed, bi) in room.bedStatuses" :key="bi" :class="['bed', bed]"></div>
                      </div>
                      <div class="room-type">
                        {{ room.beds }}人间 ·
                        <template v-if="room.status === 'empty'">空房</template>
                        <template v-else-if="room.status === 'full'">已满</template>
                        <template v-else>{{ room.occupied }}/{{ room.beds }}</template>
                      </div>
                    </div>
                  </a-tooltip>
                </div>
              </section>
            </div>
          </a-spin>

          <div class="sqgl-legend">
            <div class="legend-item"><span class="legend-dot full"></span>已满</div>
            <div class="legend-item"><span class="legend-dot partial"></span>部分入住</div>
            <div class="legend-item"><span class="legend-dot empty"></span>空房</div>
            <div class="legend-item" style="margin-left: auto">
              <a-icon type="info-circle" style="font-size: 12px" />
              鼠标悬停查看房间详情
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 房间详情弹窗 -->
    <DormitoryRoomDetailModal ref="roomDetailModal" />
  </div>
</template>

<script>
import { getAction } from '@/api/manage'
import DormitoryRoomDetailModal from './modules/DormitoryRoomDetailModal.vue'

export default {
  name: 'DormBoardList',
  components: {
    DormitoryRoomDetailModal,
  },
  data() {
    return {
      // 统计数据
      statistics: {
        totalBuildings: 0,
        totalRooms: 0,
        totalBeds: 0,
        occupiedBeds: 0,
        emptyBeds: 0,
      },
      // 区域列表
      areaList: [],
      currentAreaId: '',
      currentAreaName: '',
      // 楼栋概览
      buildingList: [],
      buildingLoading: false,
      buildingSearchKey: '',
      // 视图模式
      viewMode: 'overview', // overview | rooms
      // 当前楼栋信息
      currentBuildingId: '',
      currentBuildingName: '',
      targetFloorLevel: null, // 目标楼层
      // 楼层房间数据
      floorData: {
        areaName: '',
        buildingName: '',
        buildingId: '',
        floors: [],
      },
      floorLoading: false,
      roomSearchKey: '',
      activeLocatorFloor: null,
    }
  },
  computed: {
    filteredBuildings() {
      if (!this.buildingSearchKey) return this.buildingList
      const key = this.buildingSearchKey.toLowerCase()
      return this.buildingList.filter((b) => b.name.toLowerCase().indexOf(key) > -1)
    },
    floorLocatorList() {
      if (!this.floorData.floors || !this.floorData.floors.length) return []
      // 高层在上，低层在下
      return this.floorData.floors.slice().sort((a, b) => b.level - a.level)
    },
  },
  mounted() {
    this.loadStatistics()
    this.loadAreaList()
  },
  methods: {
    // 加载统计数据
    loadStatistics() {
      getAction('/sqgl/dashboard/statistics').then((res) => {
        if (res.success && res.result) {
          this.statistics = {
            totalBuildings: res.result.totalAreas || 0, // 用区域数作为楼栋数展示，或后端补充字段
            totalRooms: res.result.totalRooms || 0,
            totalBeds: res.result.totalBeds || 0,
            occupiedBeds: res.result.occupiedBeds || 0,
            emptyBeds: res.result.emptyBeds || 0,
          }
        }
      })
    },
    // 加载区域列表
    loadAreaList() {
      getAction('/sqgl/dashboard/areas').then((res) => {
        if (res.success && res.result) {
          this.areaList = res.result
          if (this.areaList.length > 0) {
            const first = this.areaList[0]
            this.currentAreaId = first.id
            this.currentAreaName = first.name
            this.loadBuildingOverview(first.id)
          }
        }
      })
    },
    // 切换区域
    switchArea(area) {
      this.currentAreaId = area.id
      this.currentAreaName = area.name
      this.viewMode = 'overview'
      this.buildingSearchKey = ''
      this.loadBuildingOverview(area.id)
    },
    // 加载楼栋概览
    loadBuildingOverview(areaId) {
      this.buildingLoading = true
      getAction('/sqgl/dashboard/buildings', { areaId: areaId })
        .then((res) => {
          if (res.success && res.result) {
            this.buildingList = res.result.map((b) => {
              // 楼层从大到小排序（高层在上）
              const floors = (b.floors || []).slice().sort((a, x) => x.level - a.level)
              return {
                ...b,
                buildingId: b.id,
                floors: floors,
              }
            })
          }
        })
        .finally(() => {
          this.buildingLoading = false
        })
    },
    // 进入楼栋房间分布
    enterBuilding(building, targetLevel) {
      console.log(building, targetLevel)
      this.currentBuildingId = building.id
      this.currentBuildingName = building.name
      this.targetFloorLevel = targetLevel
      this.viewMode = 'rooms'
      this.roomSearchKey = ''
      this.loadBuildingFloors(building.id)
    },
    // 加载楼层房间分布
    loadBuildingFloors(buildingId) {
      this.floorLoading = true
      getAction('/sqgl/dashboard/buildingFloors', { buildingId })
        .then((res) => {
          if (res.success && res.result) {
            // 楼层从大到小排序
            const floors = (res.result.floors || []).slice().sort((a, b) => b.level - a.level)
            this.floorData = {
              areaName: res.result.areaName || '',
              buildingName: res.result.buildingName || '',
              buildingId: res.result.buildingId || '',
              floors: floors,
            }
            // 滚动到目标楼层
            if (this.targetFloorLevel) {
              this.$nextTick(() => {
                this.scrollToFloor(this.targetFloorLevel)
                this.targetFloorLevel = null
              })
            }
          }
        })
        .finally(() => {
          this.floorLoading = false
        })
    },
    // 返回楼栋概览
    backToOverview() {
      this.viewMode = 'overview'
      this.floorData = { areaName: '', buildingName: '', buildingId: '', floors: [] }
      this.roomSearchKey = ''
      this.activeLocatorFloor = null
    },
    // 滚动到指定楼层
    scrollToFloor(level) {
      this.activeLocatorFloor = level
      const sec = document.getElementById('floor-sec-' + level)
      if (sec) {
        sec.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    },
    // 过滤房间
    filterRooms(rooms) {
      if (!rooms) return []
      if (!this.roomSearchKey) return rooms
      const key = this.roomSearchKey.toLowerCase()
      return rooms.filter((r) => r.roomName.toLowerCase().indexOf(key) > -1)
    },
    // 打开房间详情
    openRoomDetail(room) {
      if (this.$refs.roomDetailModal) {
        const bldName = this.floorData.buildingName || ''
        this.$refs.roomDetailModal.open(room.roomId, bldName, room.roomName)
      }
    },
  },
}
</script>

<style lang="less" scoped>
@sqgl-primary: #2563eb;
@sqgl-primary-rgb: 37, 99, 235;
@sqgl-border: #e2e8f0;
@sqgl-muted: #f1f5f9;
@sqgl-muted-foreground: #64748b;
@sqgl-foreground: #1a2a3d;
@sqgl-green: #10b981;
@sqgl-amber: #f59e0b;
@sqgl-red: #ef4444;
@sqgl-purple: #8b5cf6;
@sqgl-gradient-blue: linear-gradient(135deg, #2d78ff 0%, #4a9eff 100%);
@sqgl-shadow-card: 0 2px 12px rgba(45, 120, 255, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03);

.sqgl-board-app {
  height: 100%;
  background: #f8fafd;
  padding: 20px;
  overflow-y: auto;
}

/* ===== 统计栏 ===== */
.sqgl-stat-bar {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}

.sqgl-stat-card {
  background: white;
  border: 1px solid @sqgl-border;
  border-radius: 10px;
  padding: 16px 18px;
  position: relative;
  overflow: hidden;
  transition: all 0.25s;
  animation: fade-in-up 0.5s ease backwards;
  &:nth-child(1) {
    animation-delay: 0.05s;
  }
  &:nth-child(2) {
    animation-delay: 0.1s;
  }
  &:nth-child(3) {
    animation-delay: 0.15s;
  }
  &:nth-child(4) {
    animation-delay: 0.2s;
  }
  &:nth-child(5) {
    animation-delay: 0.25s;
  }
  &:hover {
    border-color: @sqgl-primary;
    transform: translateY(-2px);
    box-shadow: 0 4px 24px rgba(45, 120, 255, 0.15);
  }
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: @sqgl-gradient-blue;
  }
  .stat-icon {
    width: 36px;
    height: 36px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
    background: rgba(45, 120, 255, 0.1);
    color: @sqgl-primary;
    font-size: 16px;
    &.green {
      background: rgba(16, 185, 129, 0.1);
      color: @sqgl-green;
    }
    &.amber {
      background: rgba(245, 158, 11, 0.1);
      color: @sqgl-amber;
    }
    &.purple {
      background: rgba(139, 92, 246, 0.1);
      color: @sqgl-purple;
    }
    &.red {
      background: rgba(239, 68, 68, 0.1);
      color: @sqgl-red;
    }
  }
  .stat-label {
    font-size: 12px;
    color: @sqgl-muted-foreground;
    margin-bottom: 4px;
  }
  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: @sqgl-foreground;
    line-height: 1.1;
    .unit {
      font-size: 12px;
      color: @sqgl-muted-foreground;
      font-weight: 500;
      margin-left: 4px;
    }
  }
}

/* ===== Tab切换 ===== */
.sqgl-tab-bar {
  background: white;
  border: 1px solid @sqgl-border;
  border-radius: 10px;
  padding: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  box-shadow: @sqgl-shadow-card;
  animation: fade-in-up 0.5s ease 0.3s backwards;
}

.sqgl-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 500;
  color: @sqgl-muted-foreground;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  &:hover {
    background: rgba(@sqgl-primary-rgb, 0.06);
    color: @sqgl-primary;
  }
  &.active {
    background: linear-gradient(135deg, @sqgl-primary, #4f7dff);
    color: white;
    box-shadow: 0 2px 8px rgba(45, 120, 255, 0.25);
  }
}

/* ===== 面板 ===== */
.sqgl-board-panel {
  background: white;
  border: 1px solid @sqgl-border;
  border-radius: 12px;
  padding: 20px;
  position: relative;
  box-shadow: @sqgl-shadow-card;
  animation: fade-in-up 0.5s ease;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #2d78ff, #00b4d8);
    border-radius: 12px 12px 0 0;
  }
}

.board-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px dashed @sqgl-border;
  flex-wrap: wrap;
  gap: 10px;
}

.board-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: @sqgl-foreground;
  flex-wrap: wrap;
  > .anticon {
    color: @sqgl-primary;
  }
}

.area-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  background: rgba(@sqgl-primary-rgb, 0.08);
  color: @sqgl-primary;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(@sqgl-primary-rgb, 0.2);
}

.room-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: @sqgl-muted-foreground;
  > .anticon {
    font-size: 14px;
  }
}

/* ===== 楼栋概览 ===== */
.sqgl-building-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 16px;
}

.sqgl-building-card {
  background: white;
  border: 1px solid @sqgl-border;
  border-radius: 12px;
  padding: 16px 14px 14px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.25s;
  animation: cardIn 0.4s ease backwards;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #2d78ff, #00b4d8);
    opacity: 0.85;
  }
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 18px rgba(45, 120, 255, 0.12);
    border-color: @sqgl-primary;
  }
  .building-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    > .anticon {
      color: @sqgl-primary;
    }
  }
  .building-name {
    font-size: 17px;
    font-weight: 700;
    color: @sqgl-foreground;
  }
  .building-meta {
    display: flex;
    gap: 16px;
    margin-bottom: 14px;
    font-size: 13px;
    color: @sqgl-muted-foreground;
    flex-wrap: wrap;
    justify-content: center;
    b {
      color: @sqgl-foreground;
      font-weight: 700;
    }
    .beds-left b {
      color: @sqgl-green;
    }
  }
}

.building-tower {
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: center;
  margin-bottom: 12px;
  padding: 11px 20px;
  border-radius: 10px;
  background: @sqgl-muted;
  min-width: 155px;
}

.floor-block {
  width: 135px;
  height: 25px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.25);
  &.has-empty {
    background: @sqgl-green;
  }
  &.full {
    background: @sqgl-red;
  }
  &:hover {
    transform: scale(1.08);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.18);
    border-color: @sqgl-primary;
  }
  .floor-num {
    line-height: 1;
  }
}

.building-hint {
  font-size: 11px;
  color: @sqgl-muted-foreground;
  margin-top: auto;
  padding-top: 10px;
}

/* ===== 图例 ===== */
.sqgl-legend {
  display: flex;
  gap: 16px;
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px dashed @sqgl-border;
  flex-wrap: wrap;
  font-size: 12px;
  color: @sqgl-muted-foreground;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 14px;
  height: 14px;
  border-radius: 0;
  &.full {
    background: @sqgl-red;
  }
  &.partial {
    background: @sqgl-amber;
  }
  &.empty {
    background: #2d78ff;
  }
}

/* ===== 房间分布布局 ===== */
.sqgl-rd-layout {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

/* 左侧楼层定位 */
.sqgl-rd-locator {
  width: 96px;
  flex-shrink: 0;
  background: #eff3fb;
  border: 1px solid @sqgl-border;
  border-radius: 12px;
  padding: 14px 10px;
  position: sticky;
  top: 16px;
  align-self: flex-start;
}

.rd-locator-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(@sqgl-primary-rgb, 0.55);
  text-align: center;
  margin-bottom: 10px;
}

.rd-locator-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.loc-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 9px 6px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: @sqgl-muted-foreground;
  background: white;
  border: 1px solid @sqgl-border;
  transition: all 0.2s;
  &:hover {
    color: @sqgl-primary;
    border-color: @sqgl-primary;
    background: rgba(@sqgl-primary-rgb, 0.06);
  }
  &.active {
    background: linear-gradient(135deg, @sqgl-primary, #4f7dff);
    color: #fff;
    border-color: transparent;
    box-shadow: 0 2px 8px rgba(45, 120, 255, 0.25);
  }
}

.sqgl-rd-main {
  flex: 1;
  min-width: 0;
}

/* 面包屑 */
.sqgl-breadcrumb {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  .bc-item {
    font-size: 13px;
    color: @sqgl-muted-foreground;
    font-weight: 500;
    &.active {
      color: @sqgl-primary;
      font-weight: 700;
    }
  }
  .bc-sep {
    font-size: 13px;
    opacity: 0.45;
    color: @sqgl-muted-foreground;
  }
}

/* 楼层分区 */
.sqgl-floor-sections {
  // 移除固定高度和滚动，使用页面级别滚动
}

.sqgl-floor-section {
  margin-bottom: 24px;
  scroll-margin-top: 16px;
  &:last-child {
    margin-bottom: 0;
  }
}

.floor-section-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px dashed @sqgl-border;
}

.floor-section-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
  color: @sqgl-foreground;
  &::before {
    content: '';
    width: 4px;
    height: 16px;
    border-radius: 2px;
    background: linear-gradient(180deg, @sqgl-primary, #4f7dff);
  }
}

.floor-section-meta {
  font-size: 12px;
  color: @sqgl-muted-foreground;
}

/* 房间网格 */
.sqgl-room-grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 14px;
}

.room-card {
  background: white;
  border: 1px solid @sqgl-border;
  border-radius: 8px;
  padding: 12px 10px 10px;
  position: relative;
  cursor: pointer;
  transition: all 0.25s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: cardIn 0.4s ease backwards;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 18px rgba(45, 120, 255, 0.12);
    border-color: @sqgl-primary;
  }
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    border-radius: 8px 8px 0 0;
    opacity: 0.6;
  }
  &.full::before {
    background: @sqgl-red;
  }
  &.partial::before {
    background: @sqgl-amber;
  }
  &.empty::before {
    background: #2d78ff;
  }

  .room-no {
    font-size: 13px;
    font-weight: 700;
    color: @sqgl-foreground;
    margin-bottom: 3px;
  }
  .room-dorm-type {
    font-size: 11px;
    color: @sqgl-primary;
    background: rgba(@sqgl-primary-rgb, 0.08);
    border: 1px solid rgba(@sqgl-primary-rgb, 0.18);
    border-radius: 6px;
    padding: 1px 6px;
    margin-bottom: 6px;
    line-height: 1.3;
    white-space: nowrap;
  }
  .room-icon {
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 2px;
    margin-bottom: 6px;
    height: 36px;
    padding: 0 1px;
  }
  .bed {
    flex: 1 1 0;
    min-width: 0;
    max-width: 16px;
    height: 100%;
    border-radius: 2px 2px 0 0;
    background: #2d78ff;
    transition: all 0.2s;
    &.empty {
      background: rgba(45, 120, 255, 0.15);
      border: 1px dashed rgba(45, 120, 255, 0.3);
    }
    &.occupied {
      background: @sqgl-red;
    }
  }
  &.partial .bed.occupied {
    background: @sqgl-amber;
  }
  .room-type {
    font-size: 12px;
    color: @sqgl-muted-foreground;
    margin-top: 2px;
    line-height: 1.2;
  }
}

/* 房间提示框 */
.sqgl-room-tip {
  min-width: 100px;
  .tip-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .tip-label {
      color: rgba(255, 255, 255, 0.75);
    }
    .tip-val {
      font-weight: 600;
      text-align: right;
    }
  }
}

/* 动画 */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 响应式 */
@media (max-width: 1200px) {
  .sqgl-room-grid {
    grid-template-columns: repeat(8, 1fr);
  }
}

@media (max-width: 1000px) {
  .sqgl-room-grid {
    grid-template-columns: repeat(6, 1fr);
  }
  .sqgl-stat-bar {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .sqgl-room-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  .sqgl-stat-bar {
    grid-template-columns: repeat(2, 1fr);
  }
  .sqgl-tab-bar {
    overflow-x: auto;
    flex-wrap: nowrap;
  }
  .sqgl-rd-layout {
    flex-direction: column;
  }
  .sqgl-rd-locator {
    width: 100%;
    position: static;
    height: auto;
    max-height: none;
  }
  .rd-locator-list {
    flex-direction: row;
    flex-wrap: wrap;
  }
  .loc-item {
    flex: 1;
    min-width: 48px;
  }
}
</style>


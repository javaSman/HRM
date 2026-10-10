<template>
  <a-modal
    :title="title"
    :width="1180"
    :visible="visible"
    :confirmLoading="confirmLoading"
    :maskClosable="false"
    :destroyOnClose="true"
    :bodyStyle="{ maxHeight: '72vh', overflow: 'auto', padding: '0' }"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="取消"
    okText="保存"
  >
    <a-spin :spinning="loading" tip="加载中...">
      <div class="sqgl-add-shell">
        <!-- 区域信息 -->
        <div class="sqgl-add-col">
          <div class="sqgl-add-col-body">
            <div class="sqgl-sec-title">区域信息</div>
            <a-row :gutter="12">
              <a-col :span="12">
                <div class="sqgl-field">
                  <label class="sqgl-lbl req">区域名称</label>
                  <div class="sqgl-ctl"><a-input v-model="form.area.name" placeholder="请输入区域名称" /></div>
                </div>
              </a-col>
              <a-col :span="12">
                <div class="sqgl-field">
                  <label class="sqgl-lbl req">区域编码</label>
                  <div class="sqgl-ctl"><a-input v-model="form.area.code" placeholder="请输入区域编码" /></div>
                </div>
              </a-col>
              <a-col :span="12">
                <div class="sqgl-field">
                  <label class="sqgl-lbl">区域管理员</label>
                  <div class="sqgl-ctl"><a-input v-model="form.area.admin" placeholder="请输入区域管理员" /></div>
                </div>
              </a-col>
              <a-col :span="12">
                <div class="sqgl-field">
                  <label class="sqgl-lbl">楼栋数</label>
                  <div class="sqgl-ctl">
                    <a-input-number
                      v-model="form.area.buildingCount"
                      :min="0"
                      :max="20"
                      style="width: 100%"
                      @change="onBuildingCountChange"
                    />
                  </div>
                </div>
              </a-col>
              <a-col :span="24">
                <div class="sqgl-field">
                  <label class="sqgl-lbl">备注</label>
                  <div class="sqgl-ctl"><a-input v-model="form.area.remark" placeholder="请输入备注" /></div>
                </div>
              </a-col>
            </a-row>
            <div class="sqgl-hint-box">
              <a-icon type="info-circle" />楼栋数将自动生成对应数量的楼栋选项，可逐栋填写楼栋基本信息。
            </div>
          </div>
        </div>

        <!-- 楼栋 + 楼层信息 -->
        <div class="sqgl-add-col">
          <div class="sqgl-add-col-body">
            <div class="sqgl-sec-title">楼栋信息</div>
            <div class="sqgl-chip-row grid5">
              <div
                v-for="(bld, idx) in form.buildings"
                :key="idx"
                :class="['sqgl-chip', selBldIdx === idx ? 'active' : '']"
                @click="selBldIdx = idx"
              >
                {{ bld.name || idx + 1 + '栋' }}
              </div>
            </div>
            <div class="sqgl-add-sep"></div>
            <template v-if="currentBld">
              <a-row :gutter="12">
                <a-col :span="12">
                  <div class="sqgl-field">
                    <label class="sqgl-lbl req">楼栋名称</label>
                    <div class="sqgl-ctl">
                      <a-input v-model="currentBld.name" :placeholder="selBldIdx + 1 + '栋'" />
                    </div>
                  </div>
                </a-col>
                <a-col :span="12">
                  <div class="sqgl-field">
                    <label class="sqgl-lbl req">楼层数</label>
                    <div class="sqgl-ctl">
                      <a-input-number
                        v-model="currentBld.floorCount"
                        :min="0"
                        :max="99"
                        style="width: 100%"
                        @change="onFloorCountChange"
                      />
                    </div>
                  </div>
                </a-col>
                <a-col :span="12">
                  <div class="sqgl-field">
                    <label class="sqgl-lbl">楼栋管理员</label>
                    <div class="sqgl-ctl"><a-input v-model="currentBld.admin" placeholder="请输入楼栋管理员" /></div>
                  </div>
                </a-col>
                <a-col :span="24">
                  <div class="sqgl-field">
                    <label class="sqgl-lbl">备注</label>
                    <div class="sqgl-ctl"><a-input v-model="currentBld.remark" placeholder="请输入备注" /></div>
                  </div>
                </a-col>
              </a-row>
            </template>

            <div class="sqgl-sec-title" style="margin-top: 14px">楼层信息</div>
            <div class="sqgl-chip-row grid5">
              <div
                v-for="(floor, idx) in currentBld ? currentBld.floors : []"
                :key="idx"
                :class="['sqgl-chip', selFloorIdx === idx ? 'active' : '']"
                @click="selFloorIdx = idx"
              >
                {{ floor.name || idx + 1 + '层' }}
              </div>
            </div>
            <div class="sqgl-add-sep"></div>
            <template v-if="currentFloor">
              <div class="sqgl-field-row">
                <div class="sqgl-field">
                  <label class="sqgl-lbl req">楼层名称</label>
                  <div class="sqgl-ctl">
                    <a-input v-model="currentFloor.name" :placeholder="selFloorIdx + 1 + '层'" />
                  </div>
                </div>
                <div class="sqgl-field">
                  <label class="sqgl-lbl req">房间数</label>
                  <div class="sqgl-ctl">
                    <a-input-number
                      v-model="currentFloor.roomCount"
                      :min="0"
                      :max="99"
                      style="width: 100%"
                      @change="onRoomCountChange"
                    />
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- 房间信息 -->
        <div class="sqgl-add-col">
          <div class="sqgl-add-col-body">
            <div class="sqgl-sec-title">房间信息</div>
            <div class="sqgl-chip-row grid5">
              <div
                v-for="(room, idx) in currentFloor ? currentFloor.rooms : []"
                :key="idx"
                :class="['sqgl-chip', selRoomIdx === idx ? 'active' : '']"
                @click="selRoomIdx = idx"
              >
                {{ room.name || defaultRoomName(idx) }}
              </div>
            </div>
            <div class="sqgl-add-sep"></div>
            <template v-if="currentRoom">
              <a-row :gutter="12">
                <a-col :span="12">
                  <div class="sqgl-field">
                    <div class="sqgl-lbl">房间名称</div>
                    <div class="sqgl-ctl">
                      <a-input v-model="currentRoom.name" :placeholder="defaultRoomName(selRoomIdx)" />
                    </div>
                  </div>
                </a-col>
                <a-col :span="12">
                  <div class="sqgl-field">
                    <div class="sqgl-lbl">房间类型</div>
                    <div class="sqgl-ctl">
                      <j-dict-select-tag
                        ref="roomTypeSelect"
                        type="list"
                        v-model="currentRoom.roomType"
                        dictCode="hrm_sqgl_room_type"
                        placeholder="请选择房间类型"
                        style="width: 100%"
                        @change="onRoomTypeChange"
                      />
                    </div>
                  </div>
                </a-col>
                <a-col :span="12">
                  <div class="sqgl-field">
                    <div class="sqgl-lbl">男/女房间</div>
                    <div class="sqgl-ctl">
                      <a-radio-group v-model="currentRoom.gender">
                        <a-radio value="男">男</a-radio>
                        <a-radio value="女">女</a-radio>
                      </a-radio-group>
                    </div>
                  </div>
                </a-col>
                <a-col :span="12">
                  <div class="sqgl-field">
                    <div class="sqgl-lbl">床位数</div>
                    <div class="sqgl-ctl">
                      <a-input-number v-model="currentRoom.beds" :min="0" :max="99" style="width: 100%" />
                    </div>
                  </div>
                </a-col>
                <a-col :span="12">
                  <div class="sqgl-field">
                    <div class="sqgl-lbl">最多入住</div>
                    <div class="sqgl-ctl">
                      <a-input-number v-model="currentRoom.maxOccupancy" :min="0" :max="99" style="width: 100%" />
                    </div>
                  </div>
                </a-col>
                <a-col :span="12">
                  <div class="sqgl-field">
                    <div class="sqgl-lbl">押金</div>
                    <div class="sqgl-ctl">
                      <a-input-number v-model="currentRoom.deposit" :min="0" style="width: 100%" />
                    </div>
                  </div>
                </a-col>
                <a-col :span="24">
                  <div class="sqgl-field">
                    <div class="sqgl-lbl">租金</div>
                    <div class="sqgl-ctl">
                      <a-input-number v-model="currentRoom.rent" :min="0" style="width: 100%" />
                    </div>
                  </div>
                </a-col>
                <!-- <a-col :span="12">
                  <div class="sqgl-field">
                    <div class="sqgl-lbl">入住公司</div>
                    <div class="sqgl-ctl"><a-input v-model="currentRoom.company" placeholder="请输入入住公司" /></div>
                  </div>
                </a-col> -->
                <a-col :span="24">
                  <div class="sqgl-field">
                    <div class="sqgl-lbl">备注</div>
                    <div class="sqgl-ctl"><a-input v-model="currentRoom.remark" placeholder="请输入备注" /></div>
                  </div>
                </a-col>
              </a-row>
            </template>
            <div v-else class="sqgl-empty-hint">请先选择楼层</div>
          </div>
        </div>
      </div>
    </a-spin>
  </a-modal>
</template>

<script>
import { getAction, postAction } from '@/api/manage'

function defaultRoom(floorNumber, roomIdx) {
  const base = floorNumber || 1
  return {
    id: null,
    name: String(base * 100 + (roomIdx || 0) + 1),
    roomType: '0',
    gender: '',
    beds: 6,
    maxOccupancy: 6,
    deposit: null,
    rent: null,
    company: '',
    remark: ''
  }
}
function defaultFloor(floorNumber) {
  return {
    id: null,
    name: floorNumber + '层',
    floorNumber: floorNumber,
    roomCount: 1,
    rooms: [defaultRoom(floorNumber, 0)]
  }
}
function defaultBuilding(idx) {
  return { id: null, name: idx + 1 + '栋', floorCount: 1, admin: '', remark: '', floors: [defaultFloor(1)] }
}

export default {
  name: 'DormitoryFormModal',
  data() {
    return {
      title: '新增区域 / 房间',
      visible: false,
      confirmLoading: false,
      loading: false,
      mode: 'add',
      editTarget: null,
      form: {
        area: { id: null, name: '', code: '', admin: '', buildingCount: 1, remark: '' },
        buildings: [defaultBuilding(0)]
      },
      selBldIdx: 0,
      selFloorIdx: 0,
      selRoomIdx: 0
    }
  },
  computed: {
    currentBld() {
      return this.form.buildings[this.selBldIdx] || null
    },
    currentFloor() {
      const bld = this.currentBld
      return bld ? bld.floors[this.selFloorIdx] : null
    },
    currentRoom() {
      const floor = this.currentFloor
      return floor ? floor.rooms[this.selRoomIdx] : null
    }
  },
  watch: {
    selBldIdx() {
      this.selFloorIdx = 0
      this.selRoomIdx = 0
    },
    selFloorIdx() {
      this.selRoomIdx = 0
    }
  },
  methods: {
    // ============ 打开 ============
    open(mode, editTarget) {
      this.mode = mode
      this.editTarget = editTarget || null
      this.title = mode === 'edit' ? '编辑区域 / 房间' : '新增区域 / 房间'
      this.visible = true
      this.selBldIdx = 0
      this.selFloorIdx = 0
      this.selRoomIdx = 0
      if (mode === 'edit' && editTarget) {
        this.loadEditData(editTarget)
      } else {
        this.initFreshForm()
      }
    },
    initFreshForm() {
      this.form = {
        area: { id: null, name: '', code: '', admin: '', buildingCount: 1, remark: '' },
        buildings: [defaultBuilding(0)]
      }
    },
    async loadEditData(target) {
      this.loading = true
      try {
        // 1. 获取区域信息
        const areaRes = await getAction('/sqgl/hrmSqglArea/queryById', { id: target.areaId })
        if (!areaRes.success) {
          this.$message.warning(areaRes.message)
          return
        }
        const area = areaRes.result
        // 2. 获取楼栋列表
        const bldRes = await getAction('/sqgl/hrmSqglBuilding/listByArea', { areaId: target.areaId })
        if (!bldRes.success) {
          this.$message.warning(bldRes.message)
          return
        }
        const buildings = bldRes.result || []
        // 3. 批量获取所有楼栋的楼层列表
        const bldIds = buildings.map((b) => b.id).filter(Boolean)
        const allFloors = bldIds.length
          ? (await getAction('/sqgl/hrmSqglFloor/listByBuilding', { buildingIds: bldIds.join(',') })).result || []
          : []
        // 4. 批量获取所有楼层的房间列表
        const floorIds = allFloors.map((f) => f.id).filter(Boolean)
        const allRooms = floorIds.length
          ? (await getAction('/sqgl/hrmSqglRoom/listByFloor', { floorIds: floorIds.join(',') })).result || []
          : []
        const buildingsWithFloors = buildings.map((bld) => {
          const floors = allFloors.filter((f) => f.buildingId === bld.id)
          const floorsWithRooms = floors.map((floor) => {
            const rooms = allRooms.filter((r) => r.floorId === floor.id)
            return {
              id: floor.id,
              name: floor.name,
              floorNumber: floor.floorNumber,
              roomCount: rooms.length || 1,
              rooms: rooms.length
                ? rooms.map((r) => ({
                    id: r.id,
                    name: r.name,
                    roomType: r.roomType || '普通宿舍',
                    gender: r.gender || '',
                    beds: r.beds,
                    maxOccupancy: r.maxOccupancy,
                    deposit: r.deposit,
                    rent: r.rent,
                    company: r.company || '',
                    remark: r.remark || ''
                  }))
                : [defaultRoom(floor.floorNumber, 0)]
            }
          })
          return {
            id: bld.id,
            name: bld.name,
            floorCount: bld.floorCount || floors.length || 1,
            admin: bld.admin || '',
            remark: bld.remark || '',
            floors: floorsWithRooms.length ? floorsWithRooms : [defaultFloor(1)]
          }
        })
        this.form = {
          area: {
            id: area.id,
            name: area.name || '',
            code: area.code || '',
            admin: area.admin || '',
            buildingCount: buildings.length,
            remark: area.remark || ''
          },
          buildings: buildingsWithFloors.length ? buildingsWithFloors : [defaultBuilding(0)]
        }
        // 定位到目标楼栋 / 房间
        if (target.bldId) {
          const bldIdx = this.form.buildings.findIndex((b) => b.id === target.bldId)
          if (bldIdx >= 0) this.selBldIdx = bldIdx
        }
        if (target.roomId && this.currentBld) {
          for (let fi = 0; fi < this.currentBld.floors.length; fi++) {
            const ri = this.currentBld.floors[fi].rooms.findIndex((r) => r.id === target.roomId)
            if (ri >= 0) {
              this.selFloorIdx = fi
              this.selRoomIdx = ri
              break
            }
          }
        }
      } finally {
        this.loading = false
      }
    },
    // ============ 三级联动 ============
    onBuildingCountChange(val) {
      const n = parseInt(val) || 1
      const cur = this.form.buildings.length
      if (n > cur) {
        for (let i = cur; i < n; i++) {
          this.form.buildings.push(defaultBuilding(i))
        }
      } else if (n < cur) {
        this.form.buildings.splice(n)
        if (this.selBldIdx >= n) this.selBldIdx = Math.max(0, n - 1)
      }
    },
    onFloorCountChange(val) {
      const bld = this.currentBld
      if (!bld) return
      const n = parseInt(val) || 1
      const cur = bld.floors.length
      if (n > cur) {
        for (let i = cur; i < n; i++) {
          bld.floors.push(defaultFloor(i + 1))
        }
      } else if (n < cur) {
        bld.floors.splice(n)
        if (this.selFloorIdx >= n) this.selFloorIdx = Math.max(0, n - 1)
      }
    },
    onRoomCountChange(val) {
      const floor = this.currentFloor
      if (!floor) return
      const n = parseInt(val) || 1
      const cur = floor.rooms.length
      if (n > cur) {
        for (let i = cur; i < n; i++) {
          floor.rooms.push(defaultRoom(floor.floorNumber, i))
        }
      } else if (n < cur) {
        floor.rooms.splice(n)
        if (this.selRoomIdx >= n) this.selRoomIdx = Math.max(0, n - 1)
      }
    },
    onRoomTypeChange(val) {
      const room = this.currentRoom
      if (!room) return
      if (val === '1') {
        room.beds = 2
        room.maxOccupancy = 2
      }
    },
    defaultRoomName(idx) {
      const floor = this.currentFloor
      const base = floor ? floor.floorNumber : 1
      return String(base * 100 + idx + 1)
    },
    // ============ 保存 ============
    handleOk() {
      const area = this.form.area
      if (!area.name || !area.name.trim()) {
        this.$message.warning('请填写区域名称')
        return
      }
      if (!area.code || !area.code.trim()) {
        this.$message.warning('请填写区域编码')
        return
      }
      const payload = this.buildPayload()
      this.confirmLoading = true
      postAction('/sqgl/hrmSqglArea/bulkSave', payload)
        .then((res) => {
          if (res.success) {
            this.$message.success(res.message || '保存成功')
            this.$emit('ok')
            this.visible = false
          } else {
            this.$message.warning(res.message)
          }
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
    buildPayload() {
      const area = this.form.area
      return {
        area: {
          id: area.id,
          name: area.name.trim(),
          code: area.code.trim(),
          admin: (area.admin || '').trim(),
          buildingCount: this.form.buildings.length,
          remark: (area.remark || '').trim()
        },
        buildings: this.form.buildings.map((bld, bi) => ({
          id: bld.id,
          name: (bld.name || '').trim() || bi + 1 + '栋',
          floorCount: bld.floors.length,
          admin: (bld.admin || '').trim(),
          remark: (bld.remark || '').trim(),
          floors: bld.floors.map((floor, fi) => ({
            id: floor.id,
            name: (floor.name || '').trim() || fi + 1 + '层',
            floorNumber: floor.floorNumber || fi + 1,
            roomCount: floor.rooms.length,
            rooms: floor.rooms.map((room, ri) => ({
              id: room.id,
              name: (room.name || '').trim() || this.defaultRoomName(ri),
              roomType: room.roomType || '普通宿舍',
              gender: room.gender || '',
              beds: room.beds || 0,
              maxOccupancy: room.maxOccupancy || room.beds || 0,
              deposit: room.deposit || 0,
              rent: room.rent || 0,
              company: (room.company || '').trim(),
              remark: (room.remark || '').trim()
            }))
          }))
        }))
      }
    },
    handleCancel() {
      this.visible = false
    }
  }
}
</script>

<style lang="less" scoped>
@sqgl-primary: #2563eb;
@sqgl-primary-rgb: 37, 99, 235;
@sqgl-border: #e2e8f0;
@sqgl-muted-foreground: #64748b;
@sqgl-foreground: #1a2a3d;
@sqgl-background: #f8fafd;
@sqgl-gradient-blue: linear-gradient(135deg, #2d78ff 0%, #4a9eff 100%);

.sqgl-add-shell {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0;
  min-height: 560px;
  background: @sqgl-background;
}
.sqgl-add-col {
  border-right: 1px solid @sqgl-border;
  display: flex;
  flex-direction: column;
  background: #fff;
  min-width: 0;
  &:last-child {
    border-right: none;
  }
}
.sqgl-add-col-body {
  padding: 14px 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: auto;
  min-height: 0;
}
.sqgl-sec-title {
  font-size: 12px;
  font-weight: 600;
  color: rgba(@sqgl-primary-rgb, 0.7);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 10px;
  &::before {
    content: '';
    width: 3px;
    height: 12px;
    background: @sqgl-gradient-blue;
    border-radius: 2px;
  }
}
.sqgl-hint-box {
  margin-top: 12px;
  padding: 10px 12px;
  background: rgba(@sqgl-primary-rgb, 0.04);
  border: 1px solid rgba(@sqgl-primary-rgb, 0.1);
  border-radius: 6px;
  font-size: 12px;
  color: @sqgl-muted-foreground;
  display: flex;
  align-items: center;
  gap: 8px;
  .anticon {
    color: @sqgl-primary;
  }
}
.sqgl-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
  min-width: 0;
}
.sqgl-lbl {
  font-size: 13px;
  color: @sqgl-foreground;
  font-weight: 600;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 3px;
  &.req::before {
    content: '*';
    color: #ef4444;
    font-weight: 700;
  }
}
.sqgl-ctl {
  min-width: 0;
}
.sqgl-field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 12px;
  align-items: start;
}
.sqgl-dorm-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 12px;
  align-items: start;
}
.sqgl-field.full,
.sqgl-dorm-grid .field.full {
  grid-column: 1 / -1;
}

.sqgl-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 2px 0;
}
.sqgl-chip {
  padding: 5px 8px;
  min-width: 56px;
  border-radius: 4px;
  font-size: 12px;
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
  }
}
.sqgl-add-sep {
  height: 2px;
  background: @sqgl-gradient-blue;
  margin: 10px 0;
}
.sqgl-empty-hint {
  padding: 30px;
  text-align: center;
  color: #94a3b8;
  font-size: 12.5px;
}

@media (max-width: 1000px) {
  .sqgl-add-shell {
    grid-template-columns: 1fr;
  }
}
</style>

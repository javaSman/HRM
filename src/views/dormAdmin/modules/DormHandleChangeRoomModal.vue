<template>
  <a-modal
    :title="title"
    :visible="visible"
    :width="550"
    :confirmLoading="confirmLoading"
    :maskClosable="false"
    :destroyOnClose="true"
    okText="确认"
    cancelText="取消"
    centered
    :bodyStyle="{ maxHeight: '70vh', overflow: 'auto', padding: '20px 24px' }"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-spin :spinning="loading" tip="加载中...">
      <div v-if="form.dormType_dictText" class="sqgl-sec-tips" style="color: red; line-height: 2">
        申请提示：该员工申请宿舍类型为 <b style="font-weight: bold">{{ form.dormType_dictText || '—' }}</b
        >!
      </div>
      <div class="tips" style="line-height: 2">
        当前房间：<b style="color: #2563eb">{{ oldDormText }}</b>
      </div>
      <a-form-model ref="form" :model="form" :rules="rules" layout="vertical">
        <div class="sqgl-sec-title">选择宿舍</div>
        <a-row :gutter="14">
          <a-col :span="12">
            <a-form-model-item label="区域" prop="areaId">
              <a-select v-model="form.areaId" placeholder="请选择" allowClear @change="onAreaChange">
                <a-select-option v-for="a in areaOptions" :key="a.id" :value="a.id">{{ a.name }}</a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="楼栋" prop="buildingId">
              <a-select
                v-model="form.buildingId"
                :disabled="!form.areaId"
                placeholder="请选择"
                allowClear
                @change="onBuildingChange"
              >
                <a-select-option v-for="b in buildingOptions" :key="b.id" :value="b.id">{{ b.name }}</a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="宿舍" prop="roomId">
              <a-select
                v-model="form.roomId"
                :disabled="!form.buildingId"
                placeholder="请选择"
                allowClear
                @change="onRoomChange"
              >
                <a-select-option v-for="r in availableRooms" :key="r.id" :value="r.id">
                  {{ r.name }}（剩 {{ r.beds - r.occupied }} 床）
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="调宿入住日期" prop="tsDate">
              <a-date-picker v-model="form.tsDate" valueFormat="YYYY-MM-DD" style="width: 100%" placeholder="请选择" />
            </a-form-model-item>
          </a-col>
        </a-row>
        <!-- 目标宿舍信息提示 -->
        <div class="room-info-hint" v-if="targetRoom" style="margin-bottom: 14px">
          目标宿舍 <b style="color: #2563eb">{{ form.buildingName }}{{ form.roomName }}</b>
          <span style="margin: 0 4px; color: #3785ff">｜</span> 剩余床位
          <b style="color: #10b981">{{ targetRoom.beds - targetRoom.occupied }}</b> 个
          <span style="margin: 0 4px; color: #3785ff">｜</span> 房间类型
          {{ targetRoom.roomType_dictText || targetRoom.roomType || '—' }}
          <template v-if="targetRoom.gender">
            <span style="margin: 0 4px; color: #2563eb">｜</span>
            <b style="color: #2563eb">{{ targetRoom.gender }}宿舍</b>
          </template>
        </div>
        <!-- <div class="room-info-hint error" v-else-if="form.buildingId && !form.roomId" style="margin-bottom: 14px">
          该楼栋无空床位，请选择其他楼栋
        </div> -->
      </a-form-model>
    </a-spin>
  </a-modal>
</template>

<script>
import moment from 'moment'
import { getAction, putAction } from '@/api/manage'

export default {
  name: 'DormHandleChangeRoomModal',
  data() {
    return {
      visible: false,
      loading: false,
      confirmLoading: false,
      mode: 'handleChangeRoom',
      form: this.defaultForm(),
      areaOptions: [],
      buildingOptions: [],
      roomOptions: [],
      targetRoom: null,
    }
  },
  computed: {
    title() {
      return `${this.mode === 'handleChangeRoom' ? '办理调宿' : '调宿'} · ${this.form.empName}`
    },
    oldDormText() {
      const f = this.form
      const parts = [f.oldAreaName, f.oldBuildingName, f.oldRoomName].filter(Boolean)
      return parts.length ? parts.join(' / ') : '—'
    },
    availableRooms() {
      return this.roomOptions.filter((r) => r.beds > r.occupied)
    },
    rules() {
      return {
        areaId: [{ required: true, message: '请选择区域', trigger: 'change' }],
        buildingId: [{ required: true, message: '请选择楼栋', trigger: 'change' }],
        roomId: [{ required: true, message: '请选择宿舍', trigger: 'change' }],
        tsDate: [{ required: true, message: '请选择调宿入住日期', trigger: 'change' }],
      }
    },
  },
  created() {
    this.loadAreas()
  },
  methods: {
    defaultForm() {
      return {
        id: '',
        empNo: '',
        empName: '',
        oldAreaName: '',
        oldBuildingName: '',
        oldRoomName: '',
        areaId: undefined,
        areaName: '',
        buildingId: undefined,
        buildingName: '',
        roomId: undefined,
        roomName: '',
        tsDate: moment().format('YYYY-MM-DD'),
      }
    },
    open(mode, record) {
      this.mode = mode
      this.visible = true
      this.form = this.defaultForm()
      this.buildingOptions = []
      this.roomOptions = []
      this.targetRoom = null

      if (record) {
        Object.assign(this.form, {
          ...record,
          oldAreaName: record.areaName,
          oldBuildingName: record.buildingName,
          oldRoomName: record.roomName,
          tsDate: record.tsDate || moment().format('YYYY-MM-DD'),
        })
        //  默认选中申请区域
        this.onAreaChange(this.form.areaId)
      }
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    },
    // ============ 宿舍级联 ============
    loadAreas() {
      getAction('/sqgl/hrmSqglArea/listWithStats').then((res) => {
        if (res.success) {
          this.areaOptions = res.result || []
        }
      })
    },
    onAreaChange(val) {
      this.form.areaId = val
      this.form.buildingId = undefined
      this.form.roomId = undefined
      this.form.areaName = this.optionName(this.areaOptions, val)
      this.form.buildingName = ''
      this.form.roomName = ''
      this.buildingOptions = []
      this.roomOptions = []
      this.targetRoom = null
      if (!val) return
      getAction('/sqgl/hrmSqglBuilding/listByArea', { areaId: val }).then((res) => {
        if (res.success) this.buildingOptions = res.result || []
      })
    },
    onBuildingChange(val) {
      this.form.buildingId = val
      this.form.roomId = undefined
      this.form.buildingName = this.optionName(this.buildingOptions, val)
      this.form.roomName = ''
      this.roomOptions = []
      this.targetRoom = null
      if (!val) return
      // 通过楼栋直接加载可用宿舍（无楼层）
      getAction('/sqgl/hrmSqglRoom/listAvailableByBuilding', { buildingId: val }).then((res) => {
        if (res.success) {
          this.roomOptions = (res.result || []).map((t) => ({
            ...t,
            buildingName: this.form.buildingName,
          }))
        }
      })
    },
    onRoomChange(val) {
      this.form.roomId = val
      this.form.roomName = this.optionName(this.roomOptions, val)
      this.targetRoom = this.roomOptions.find((r) => r.id === val) || null
    },
    optionName(list, id) {
      const o = list.find((i) => i.id === id)
      return o ? o.name : ''
    },
    // ============ 提交 ============
    handleOk() {
      this.$refs.form.validate((valid) => {
        if (!valid) return
        this.confirmLoading = true
        const payload = {
          ...this.form,
        }
        const url =
          this.mode === 'handleChangeRoom' ? '/sqgl/approval/handleChangeRoom' : '/sqgl/approval/resident/changeRoom'
        putAction(url, payload)
          .then((res) => {
            if (res.success) {
              this.$message.success(res.message || '办理成功！')
              this.$emit('ok')
              this.visible = false
            } else {
              this.$message.warning(res.message || '办理失败')
            }
          })
          .finally(() => {
            this.confirmLoading = false
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
@sqgl-primary: #2563eb;
@sqgl-primary-rgb: 37, 99, 235;
@sqgl-border: #e2e8f0;
@sqgl-muted-foreground: #64748b;
@sqgl-foreground: #1a2a3d;
@sqgl-gradient-blue: linear-gradient(135deg, #2d78ff 0%, #4a9eff 100%);
/deep/ .ant-modal-body {
  padding-top: 14px !important;
}
/deep/ .ant-form-item {
  margin-bottom: 12px;
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
  margin: 0 0 12px;
  &::before {
    content: '';
    width: 3px;
    height: 12px;
    background: @sqgl-gradient-blue;
    border-radius: 2px;
  }
}
.sqgl-readonly-grid {
  background: linear-gradient(135deg, rgba(@sqgl-primary-rgb, 0.04), rgba(@sqgl-primary-rgb, 0.012));
  border: 1px solid rgba(@sqgl-primary-rgb, 0.1);
  border-radius: 8px;
  padding: 8px 16px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 6px 16px;
  .row {
    display: flex;
    gap: 8px;
    padding: 4px 0;
    font-size: 13px;
    .k {
      color: @sqgl-muted-foreground;
      flex-shrink: 0;
      font-weight: 500;
    }
    .v {
      color: @sqgl-foreground;
      font-weight: 500;
      word-break: break-all;
    }
  }
}
.room-info-hint {
  padding: 8px 14px;
  background: rgba(@sqgl-primary-rgb, 0.04);
  border: 1px solid rgba(@sqgl-primary-rgb, 0.12);
  border-radius: 8px;
  font-size: 13px;
  color: @sqgl-foreground;
  line-height: 1.6;
  &.error {
    background: rgba(239, 68, 68, 0.04);
    border-color: rgba(239, 68, 68, 0.2);
    color: #dc2626;
  }
}
</style>


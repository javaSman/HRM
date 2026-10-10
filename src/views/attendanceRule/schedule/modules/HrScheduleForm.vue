<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container>
      <a-form-model ref="form" layout="inline" :model="model" :rules="validatorRules" slot="detail">
        <div class="schedule-form-layout">
          <!-- 左侧：基本信息 + 排班时段 -->
          <div class="schedule-left">
            <!-- 基本信息 -->
            <section class="schedule-section">
              <div class="schedule-section-title">基本信息</div>
              <div class="staff-summary flex flex-col">
                <div class="summary-row">
                  <div class="summary-item">
                    <span class="summary-label">姓名：</span>
                    <span class="summary-value">{{ model.name }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">公司：</span>
                    <span class="summary-value">{{ model.companyId_dictText }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">工号：</span>
                    <span class="summary-value">{{ model.no }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">部门：</span>
                    <span class="summary-value">{{ model.dept_dictText }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">岗位：</span>
                    <span class="summary-value">{{ model.postId_dictText }}</span>
                  </div>
                  <div class="summary-item" v-if="formDisabled">
                    <span class="summary-label">班次类型：</span>
                    <span class="summary-value">
                      <a-tag v-if="model.bc == '1'" color="blue">固定班次</a-tag>
                      <a-tag v-else-if="model.bc == '2'" color="green">轮换班次</a-tag>
                    </span>
                  </div>
                </div>
              </div>

              <a-row :gutter="16" v-if="!formDisabled">
                <a-col :span="24">
                  <a-form-model-item label="班次类型" prop="bc">
                    <j-dict-select-tag
                      style="width: 150px"
                      v-model="model.bc"
                      dictCode="bc"
                      placeholder="请选择班次类型"
                    />
                  </a-form-model-item>
                </a-col>
              </a-row>
            </section>

            <!-- 排班时段 -->
            <section class="schedule-section">
              <div class="schedule-section-header">
                <div class="schedule-section-title">排班时段</div>
                <div class="schedule-section-hint">支持多段配置，时间段不可重叠</div>
              </div>
              <div class="shift-area">
                <!-- 添加按钮 -->
                <div class="shift-buttons" v-if="!formDisabled">
                  <!-- 占位：有已添加时段时与右侧标签等高，保证按钮与时段列表水平对齐 -->
                  <div
                    v-if="model.hrEmpSchedules.length > 0"
                    class="shift-list-label shift-buttons-spacer"
                    aria-hidden="true"
                  >
                    &nbsp;
                  </div>
                  <a-button class="shift-add-btn morning" @click="addShift('白班')">+ 白班</a-button>
                  <a-button class="shift-add-btn noon" @click="addShift('中班')">+ 中班</a-button>
                  <a-button class="shift-add-btn night" @click="addShift('夜班')">+ 夜班</a-button>
                </div>
                <!-- 时段列表 -->
                <div class="shift-list">
                  <div v-if="model.hrEmpSchedules.length > 0" class="shift-list-label">已添加时段</div>
                  <div class="shift-list-content">
                    <div
                      v-for="(shift, index) in model.hrEmpSchedules"
                      :key="index"
                      class="shift-row"
                      :class="{ 'is-disabled': formDisabled }"
                    >
                      <a-tag :color="getShiftColor(shift.timeType)">{{ shift.timeType }}</a-tag>
                      <!-- 固定班次：月选择器 -->
                      <template v-if="model.bc === '1'">
                        <j-date
                          v-if="!formDisabled"
                          :disabled="formDisabled"
                          v-model="shift.month"
                          placeholder="选择月份"
                          antype="month"
                          dateFormat="YYYY-MM"
                          :getCalendarContainer="getCalendarContainer"
                          class="shift-month"
                          @change="(val) => onMonthChange(index, val)"
                        />
                        <div v-else class="shift-info-text">
                          <span class="shift-date-display">{{ shift.month || '-' }}</span>
                        </div>
                      </template>
                      <!-- 轮换班次：日期范围选择器 -->
                      <template v-else>
                        <template v-if="!formDisabled">
                          <j-date
                            :disabled="formDisabled"
                            v-model="shift.startDate"
                            placeholder="开始日期"
                            dateFormat="YYYY-MM-DD"
                            class="shift-date"
                            :getCalendarContainer="getCalendarContainer"
                            @change="onShiftChange"
                          />
                          <span class="shift-sep">至</span>
                          <j-date
                            :disabled="formDisabled"
                            v-model="shift.endDate"
                            placeholder="结束日期"
                            dateFormat="YYYY-MM-DD"
                            :getCalendarContainer="getCalendarContainer"
                            class="shift-date"
                            @change="onShiftChange"
                          />
                        </template>
                        <div v-else class="shift-info-text">
                          <span class="shift-date-display">{{ shift.startDate || '-' }}</span>
                          <span class="shift-sep">至</span>
                          <span class="shift-date-display">{{ shift.endDate || '-' }}</span>
                        </div>
                      </template>
                      <a-button
                        v-if="!formDisabled"
                        type="link"
                        size="small"
                        class="shift-remove"
                        @click="removeShift(shift, index)"
                      >
                        删除
                      </a-button>
                    </div>
                    <div v-if="model.hrEmpSchedules.length === 0" class="shift-empty">
                      暂无排班时段，请点击左侧按钮添加
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- 右侧：日历预览 -->
          <div class="schedule-right">
            <hr-schedule-calendar
              ref="calendar"
              :shifts="model.hrEmpSchedules"
              :empName="model.empName"
              :empNo="model.empNo"
              :scheduleMonth="scheduleMonth"
            />
          </div>
        </div>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>
import HrScheduleCalendar from './HrScheduleCalendar'
import { httpAction } from '@/api/manage'

export default {
  name: 'HrScheduleForm',
  components: {
    HrScheduleCalendar,
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    record: {
      type: Object,
      default: null,
    },
    // 年月（YYYY-MM），由列表页查询条件传入
    scheduleMonth: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      model: {
        id: undefined,
        empNo: '',
        empName: '',
        company: '',
        dept: '',
        position: '',
        bc: '1',
        hrEmpSchedules: [],
      },
      deleteBatch: [],
      modelBackup: null, // 用于取消时恢复
      confirmLoading: false,
      validatorRules: {
        empNo: [{ required: true, message: '请输入工号', trigger: 'blur' }],
        empName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        bc: [{ required: true, message: '请选择班次类型', trigger: 'change' }],
      },
      url: {
        saveOrUpdateBatch: '/hr_emp_schedule/hrEmpSchedule/saveOrUpdateBatch',
        deleteBatch: '/hr_emp_schedule/hrEmpSchedule/deleteBatch',
        queryById: '/hr_emp_schedule/hrEmpSchedule/queryById',
      },
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
  },
  methods: {
    getCalendarContainer(node) {
      console.log(node.parentNode)
      return node.parentNode.parentNode.parentNode.parentNode
    },
    // 获取班次颜色
    getShiftColor(type) {
      const colorMap = {
        白班: 'orange',
        中班: 'green',
        夜班: 'purple',
      }
      return colorMap[type] || 'default'
    },

    // 添加时段
    addShift(type) {
      const shift = {
        timeType: type,
        startDate: '',
        endDate: '',
      }
      // 固定班次时添加month字段
      if (this.model.bc == '1') {
        shift.month = ''
      }
      this.model.hrEmpSchedules.push(shift)
      this.onShiftChange()
    },

    // 删除时段
    removeShift(shift, index) {
      console.log(shift, index)
      if (shift.id) {
        this.deleteBatch.push(shift.id)
      }
      this.model.hrEmpSchedules.splice(index, 1)
      this.onShiftChange()
    },

    // 时段变化 - 实时联动日历
    onShiftChange() {
      this.$emit('shiftsChange', this.model.hrEmpSchedules)
      // 通知日历组件更新
      this.$nextTick(() => {
        if (this.$refs.calendar) {
          this.$refs.calendar.updateCalendar()
        }
      })
    },

    // 月份变化 - 固定班次时自动计算月初月末
    onMonthChange(index, val) {
      if (val) {
        // val格式为 'YYYY-MM'，计算月初和月末
        const [year, month] = val.split('-').map(Number)
        const startDate = val + '-01'
        // 计算月末：下个月第0天即为当月最后一天
        const lastDay = new Date(year, month, 0).getDate()
        const endDate = val + '-' + String(lastDay).padStart(2, '0')
        this.$set(this.model.hrEmpSchedules[index], 'startDate', startDate)
        this.$set(this.model.hrEmpSchedules[index], 'endDate', endDate)
      } else {
        this.$set(this.model.hrEmpSchedules[index], 'startDate', '')
        this.$set(this.model.hrEmpSchedules[index], 'endDate', '')
        this.$set(this.model.hrEmpSchedules[index], 'month', '')
      }
      this.onShiftChange()
    },

    // 新增
    add() {
      this.model = {
        id: undefined,
        empNo: '',
        empName: '',
        company: '',
        dept: '',
        position: '',
        bc: '1',
        hrEmpSchedules: [],
      }
      this.modelBackup = JSON.parse(JSON.stringify(this.model))
    },

    // 编辑
    edit(record) {
      // 深拷贝 record，避免表单内对 hrEmpSchedules 的增删改直接污染列表行数据
      // （否则取消后再打开，被删除的时段不会恢复）
      const recordCopy = JSON.parse(JSON.stringify(record))
      this.model = Object.assign({}, this.model, recordCopy)
      // 确保 shifts 是数组
      if (!this.model.hrEmpSchedules) {
        this.model.hrEmpSchedules = []
      }
      // 固定班次时，为每个时段添加month字段（如果不存在）
      if (this.model.bc == '1') {
        this.model.hrEmpSchedules.forEach((shift) => {
          if (!shift.month && shift.startDate) {
            // 从startDate中提取月份 'YYYY-MM-DD' -> 'YYYY-MM'
            shift['month'] = shift.startDate.substring(0, 7)
          }
        })
      }
      // 备份原始数据，用于取消时恢复
      this.modelBackup = JSON.parse(JSON.stringify(this.model))
      // 更新日历：同步为列表页传入的年月
      this.$nextTick(() => {
        if (this.$refs.calendar) {
          this.$refs.calendar.setMonth(this.scheduleMonth)
        }
      })
    },

    // 重置表单（取消时调用）
    resetForm() {
      if (this.modelBackup) {
        this.model = JSON.parse(JSON.stringify(this.modelBackup))
      }
      // 取消时一并放弃待删除的时段 id，避免下次保存时误删
      this.deleteBatch = []
      // 更新日历
      this.$nextTick(() => {
        if (this.$refs.calendar) {
          this.$refs.calendar.updateCalendar()
        }
      })
    },
    deleteForm() {
      let ids = this.deleteBatch.join(',')
      httpAction(`${this.url.deleteBatch}?ids=${ids}`, '', 'delete')
    },
    // 提交表单
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.confirmLoading = true
          const url = this.url.saveOrUpdateBatch
          const method = this.model.id ? 'post' : 'post'

          const hrEmpSchedules = this.model.hrEmpSchedules.map((item) => {
            let { timeType, startDate, endDate, id } = item
            return {
              id,
              timeType,
              startDate: startDate + ' 00:00:00',
              endDate: endDate + ' 23:59:59',
              no: this.model.no,
              bc: this.model.bc,
            }
          })
          if (this.deleteBatch.length > 0) {
            this.deleteForm()
          }
          httpAction(url, hrEmpSchedules, method)
            .then((res) => {
              if (res.success) {
                this.$message.success(res.message || '操作成功')
                this.$emit('ok')
              } else {
                this.$message.warning(res.message || '操作失败')
              }
            })
            .finally(() => {
              this.confirmLoading = false
            })
        }
      })
    },
  },
}
</script>

<style scoped lang="less">
::v-deep .ant-form-item {
  margin-bottom: 0px;
}

.schedule-form-layout {
  display: flex;
  gap: 16px;
  min-height: 400px;
}

.schedule-left {
  width: 50%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.schedule-right {
  width: 50%;
  flex-shrink: 0;
  border-left: 1px solid #d1d9e6;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
}

.schedule-section {
  border: 1px solid #d1d9e6;
  border-radius: 10px;
  padding: 16px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.schedule-section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a2a3d;
  margin-bottom: 12px;
  padding-left: 10px;
  border-left: 3px solid #2d78ff;
}

.schedule-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.schedule-section-hint {
  font-size: 12px;
  color: #94a3b8;
}

// 排班时段区域
.shift-area {
  display: flex;
  gap: 12px;
}

.shift-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 80px;
  flex-shrink: 0;
}

// 占位标签复用 shift-list-label 的字号行高，下边距由 flex gap 承担
// 双类选择器提高特异性，避免被后定义的 .shift-list-label margin-bottom 覆盖
.shift-list-label.shift-buttons-spacer {
  margin-bottom: 0;
}

.shift-add-btn {
  height: 32px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #d0d5dd;
  background: #fff;
  color: #333;

  &:hover {
    opacity: 0.9;
  }

  &.morning {
    border-color: #ffa940;
    color: #fa8c16;
    background: #fff7e6;
  }

  &.noon {
    border-color: #73d13d;
    color: #52c41a;
    background: #f6ffed;
  }

  &.night {
    border-color: #9254de;
    color: #722ed1;
    background: #f9f0ff;
  }
}

.shift-list {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.shift-list-label {
  font-size: 12px;
  color: #999;
  font-weight: 600;
  margin-bottom: 8px;
}

.shift-list-content {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #d1d9e6;
  border-radius: 6px;
  background: #f1f5f9;
  padding: 8px;
}

.shift-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: #fff;
  border-radius: 4px;
  margin-bottom: 6px;
  border: 1px solid #e2e8f0;

  &:last-child {
    margin-bottom: 0;
  }

  // 禁用状态下的样式优化
  &.is-disabled {
    background: #fafbfc;
    border-color: #f0f0f0;
    padding: 8px 12px;
  }
}

.shift-date {
  flex: 1;
  min-width: 100px;
}

.shift-month {
  flex: 1;
  min-width: 120px;
}

.shift-sep {
  color: #999;
  font-size: 12px;
}

// 禁用状态下的日期显示文本
.shift-info-text {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.shift-date-display {
  font-size: 13px;
  color: #334155;
  font-weight: 500;
  padding: 4px 12px;
  background: linear-gradient(135deg, #f0f5ff 0%, #f8faff 100%);
  border-radius: 4px;
  border: 1px solid #e0e7ff;
  min-width: 100px;
  text-align: center;
}

.shift-remove {
  color: #f53f3f;
  font-size: 12px;
  padding: 0 4px;
}

.shift-empty {
  text-align: center;
  color: #999;
  font-size: 12px;
  padding: 20px 0;
}

// 响应式
@media (max-width: 900px) {
  .schedule-form-layout {
    flex-direction: column;
  }

  .schedule-left,
  .schedule-right {
    width: 100%;
  }

  .schedule-right {
    border-left: none;
    border-top: 1px solid #d1d9e6;
    padding-left: 0;
    padding-top: 16px;
  }
}

.staff-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 20px;
  margin-bottom: 16px;
  padding: 14px 16px;
  background: rgba(37, 99, 235, 0.02);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.summary-label {
  color: #64748b;
  font-weight: 500;
}

.summary-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 20px;
}

.summary-value {
  color: #1a2a3d;
  font-weight: 600;
}
</style>

<template>
  <!--
    LeaveResumptionApplyForm.vue
    销假申请表单组件
    左右两栏布局：左栏=申请信息表单，右栏=审批流程
    模式：新增 / 编辑 / 审批 / 详情
  -->
  <a-spin :spinning="confirmLoading">
    <j-form-container>
      <a-form-model
        ref="form"
        slot="detail"
        layout="vertical"
        :model="model"
        :rules="validatorRules"
        class="leave-resumption-form"
      >
        <a-row :gutter="24" class="leave-form-row">
          <!-- ===== 左侧：申请信息 ===== -->
          <a-col :xs="24" :sm="12" class="form-col-left">
            <div class="form-section-title">
              <span>申请信息</span>
            </div>

            <a-row :gutter="16">
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="公司">
                  <a-input
                    :value="model.companyId_dictText || perInfo.companyId_dictText || ''"
                    disabled
                    placeholder="自动获取"
                  />
                </a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="所属部门">
                  <a-input
                    :value="model.dept_dictText || perInfo.dept_dictText || ''"
                    disabled
                    placeholder="自动获取"
                  />
                </a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="工号">
                  <a-input v-model="model.no" disabled placeholder="自动获取" />
                </a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="姓名">
                  <a-input v-model="model.name" disabled placeholder="自动获取" />
                </a-form-model-item>
              </a-col>
              <!-- 只读（详情/审批）：申请时间 -->
              <a-col v-if="formDisabled" :xs="24" :sm="12">
                <a-form-model-item label="申请时间">
                  <a-input :value="model.createTime || ''" disabled placeholder="-" />
                </a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="销假类型" prop="xjType" :required="true">
                  <a-select
                    v-model="model.xjType"
                    :disabled="formDisabled"
                    placeholder="请选择销假类型"
                    allowClear
                    show-search
                    option-filter-prop="children"
                    style="width: 100%"
                    @change="onXjTypeChange"
                  >
                    <a-select-option v-for="item in xjTypeDictOptions" :key="item.value" :value="item.value">
                      {{ item.text || item.label }}
                    </a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="24">
                <a-form-model-item label="假期列表" prop="hrXjsqId" :required="true">
                  <a-select
                    v-model="model.hrXjsqId"
                    :disabled="formDisabled"
                    placeholder="请选择请假单"
                    allowClear
                    style="width: 100%"
                    @change="onLeaveSelectChange"
                  >
                    <a-select-option v-for="item in leaveOrderList" :key="item.value" :value="item.value">
                      {{ item.label }}
                    </a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="到岗时间" prop="actualEndTime" :required="true">
                  <div class="time-picker-wrapper">
                    <j-date
                      placeholder="请选择到岗日期"
                      :disabled="formDisabled"
                      v-model="model.actualEndTime"
                      dateFormat="YYYY-MM-DD"
                    />
                    <!-- 到岗时段：直接取员工打卡规则的上班时间 sbdaate / 下班时间 xbdate，value 即打卡时间 HH:mm；
                         仅作前端选择辅助，提交时拼进 actualEndTime -->
                    <a-select
                      v-model="model.arrivalPart"
                      class="ampm-select"
                      :disabled="formDisabled"
                      placeholder="请选择"
                    >
                      <a-select-option v-for="item in arrivalPartOptions" :key="item.value" :value="item.value">
                        {{ item.label }}
                      </a-select-option>
                    </a-select>
                  </div>
                </a-form-model-item>
              </a-col>
              <!-- 只读（详情/审批）：时长信息 -->
              <template v-if="formDisabled">
                <a-col :xs="24" :sm="12">
                  <a-form-model-item label="原请假时长">
                    <a-input :value="originalHoursText" disabled placeholder="-" />
                  </a-form-model-item>
                </a-col>
                <a-col :xs="24" :sm="12">
                  <a-form-model-item label="原请假结束时间">
                    <a-input :value="model.originalEndTime || ''" disabled placeholder="-" />
                  </a-form-model-item>
                </a-col>
                <a-col :xs="24" :sm="12">
                  <a-form-model-item label="实际请假时长">
                    <a-input :value="actualHoursText" disabled style="color: #4a7bf7" placeholder="-" />
                  </a-form-model-item>
                </a-col>
                <a-col :xs="24" :sm="12">
                  <a-form-model-item label="额度调整">
                    <a-input :value="edtzText" disabled style="color: #52c41a" placeholder="-" />
                  </a-form-model-item>
                </a-col>
              </template>
              <a-col :xs="24" :sm="24">
                <a-form-model-item label="销假原因" prop="xjyy" :required="true">
                  <a-textarea
                    v-model="model.xjyy"
                    :disabled="formDisabled"
                    placeholder="请输入销假原因"
                    :autoSize="{ minRows: 3, maxRows: 5 }"
                  />
                </a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="24">
                <a-form-model-item label="附件">
                  <JUploadList v-model="model.attachmentUrls" :disabled="formDisabled" :buttonVisible="!formDisabled" />
                </a-form-model-item>
              </a-col>
            </a-row>
          </a-col>

          <!-- ===== 右侧：新增=审批流程，重新提交=上一轮时间轴+审批流程，详情=流程时间轴 ===== -->
          <a-col v-if="!OK_show" :xs="24" :sm="12" class="form-col-right">
            <div class="form-section-title">
              <span>审批流程</span>
            </div>

            <div class="approval-scroll">
            <!-- 重新提交：先展示上一轮审批流程时间轴（含退回原因），数据直接取当前轮次节点 customProcessSqdSpjdList -->
            <div v-if="isResubmit" class="resubmit-timeline">
              <approval-timeline
                :key="'resubmit-' + model.id + '-' + detailNonce"
                :applyId="model.id"
                :LCdata="model"
              />
            </div>

            <approval-process
              v-if="!formDisabled"
              ref="approvalProcess"
              sqmkCode="销假申请"
              :dept="model.dept || (perInfo && perInfo.dept) || ''"
              :no="perInfo.no || ''"
              :disabled="formDisabled"
            />
            <div v-else>
              <!-- 审批流程时间轴（详情模式）：直接传 model（节点内嵌套 customProcessSqdSpjdRecord 由时间轴兼容）；
                   key 带 nonce，保证同一单据重复打开详情时时间轴随 model 重建刷新 -->
              <approval-timeline :key="model.id + '-' + detailNonce" :applyId="model.id" :LCdata="model" />
            </div>
            </div>
          </a-col>

          <a-col v-if="OK_show" :xs="24" :sm="12" class="form-col-right">
            <div class="form-section-title">
              <span>审批意见</span>
            </div>

            <a-form-model-item label="审批意见">
              <a-textarea v-model="spdata.bz" placeholder="请输入审批意见" :autoSize="{ minRows: 3, maxRows: 5 }" />
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>
import Vue from 'vue'
// 新版时间轴：每条审批记录一张卡片，支持退回/撤回状态及节点内嵌套 customProcessSqdSpjdRecord
import ApprovalTimeline from '../../leave/modules/ApprovalTimeline'
import ApprovalProcess from './ApprovalProcess'
import { httpAction, getAction } from '@/api/manage'
import { ajaxGetDictItems, getDictItemsFromCache } from '@/api/api'

export default {
  name: 'LeaveResumptionApplyForm',
  components: {
    ApprovalTimeline,
    ApprovalProcess,
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
    OK_show: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  data() {
    return {
      confirmLoading: false,

      // 审批附加数据
      spdata: {
        bz: '',
        spr: '',
        spResult: 'approved',
      },
      perInfo: {},
      model: { hrXjsqId: null, arrivalPart: null, hrXjsq: null },

      // 当前所选请假单的开始/结束时间（提交校验：当前时间须早于结束时间；到岗时间须在请假时间范围内）
      selectedLeaveStartTime: '',
      selectedLeaveEndTime: '',

      // 详情/重新提交时间轴重建计数（每次 edit 递增，配合 timeline 的 key 使用）
      detailNonce: 0,

      // 请假单列表
      leaveOrderList: [],

      // 到岗时段下拉选项（取打卡规则的上班时间 sbdaate / 下班时间 xbdate）：[{ value: 'HH:mm', label: 'HH:mm' }]
      arrivalPartOptions: [],

      // 销假类型字典项（xj_type，与请假申请表取值口径一致：字典 value 即类型文本，如「年假」）
      xjTypeDictOptions: [],

      validatorRules: {
        xjType: [{ required: true, message: '请选择销假类型', trigger: 'change' }],
        hrXjsqId: [{ required: true, message: '请选择请假单', trigger: 'change' }],
        actualEndTime: [{ required: true, message: '请选择到岗时间', trigger: 'change' }],
        xjyy: [{ required: true, message: '请输入销假原因', trigger: ['blur', 'change'] }],
      },
      url: {
        add: '/hr_kq_xjgl/hrKqXjgl/add',
        edit: '/hr_kq_xjgl/hrKqXjgl/resubmit',
        queryById: '/hr_kq_xjgl/hrKqXjgl/queryById',
        // 查询可销假的请假单列表（后端按当前审批通过等条件过滤）
        leaveOrderList: '/hr_kq_xjgl/hrKqXjgl/queryCanCancelLeaveList',
        // 获取固定打卡时段（到岗时段下拉，取上班时间 sbdaate / 下班时间 xbdate）
        getHrKqRuleGddatedkByNo: '/hrm/hrKqRule/getHrKqRuleGddatedkByNo',
        // 系统变量-固定打卡规则（员工打卡规则时段缺失时，按规则名称兜底匹配）
        getHrKqRuleVariable: '/variableRescord/sysVariableRecord/getInfo/hr_kq_rule',
      },
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
    /**
     * 是否重新提交（修改重申）模式（已退回单据再次提交：可编辑 + 非审批 + 单据已存在 id）
     */
    isResubmit() {
      return !this.formDisabled && !this.OK_show && !!this.model.id
    },
    /**
     * 原请假时长（销假前快照）：originalHours 数值；年假单位天，其他假单位小时
     */
    originalHoursText() {
      const hours = this.model.originalHours
      if (hours === null || hours === undefined || hours === '') return ''
      const dw = this.model.xjType === '年假' ? '天' : '小时'
      return `${hours}${dw}`
    },
    /**
     * 实际请假时长：actualHours 数值 + actualHoursDw 单位（天、小时）
     */
    actualHoursText() {
      const hours = this.model.actualHours
      if (hours === null || hours === undefined || hours === '') return ''
      return this.model.actualHoursDw ? `${hours}${this.model.actualHoursDw}` : `${hours}`
    },
    /**
     * 额度调整：后端 edtz 为负数表示退回额度，展示为「退回 xx + 单位」；
     * 单位与实际请假时长 actualHoursDw 一致（天、小时）
     */
    edtzText() {
      const edtz = this.model.edtz
      if (edtz === null || edtz === undefined || edtz === '') return ''
      const dw = this.model.actualHoursDw || ''
      const num = Number(edtz)
      if (!isNaN(num) && num < 0) {
        return `退回 ${Math.abs(num)}${dw}`
      }
      return dw ? `${edtz}${dw}` : `${edtz}`
    },
  },
  created() {
    this.modelDefault = JSON.parse(JSON.stringify(this.model))
    this.loadXjTypeOptions()
  },
  methods: {
    /** 加载销假类型字典项（优先读字典缓存，与请假申请表 JDictSelectTag 逻辑一致） */
    loadXjTypeOptions() {
      const cached = getDictItemsFromCache('xj_type')
      if (cached) {
        this.xjTypeDictOptions = cached
        return
      }
      ajaxGetDictItems('xj_type', null).then((res) => {
        if (res.success) {
          this.xjTypeDictOptions = res.result || []
        }
      })
    },

    /**
     * 加载到岗时段下拉（固定打卡时段的 sbdaate/xbdate，逻辑同请假申请表）
     * @param {String} no - 员工工号（取销假单申请人工号）
     */
    loadArrivalPartOptions(no) {
      if (!no) {
        this.arrivalPartOptions = []
        return
      }
      getAction(this.url.getHrKqRuleGddatedkByNo, { no })
        .then((res) => {
          if (res.success && Array.isArray(res.result.hrKqRuleGddatedkList)) {
            const list = res.result.hrKqRuleGddatedkList
            const morning = list.find((item) => item.sjd === 'morning')
            const afternoon = list.find((item) => item.sjd === 'afternoon')
            // morning 的下班时间(xbdate) 与 afternoon 的上班时间(sbdaate) 同时为空：
            // 该员工打卡规则时段不完整，改从系统变量 hr_kq_rule 中按规则说明兜底匹配
            const needFallback =
              morning && this.isEmptyClockTime(morning.xbdate) && afternoon && this.isEmptyClockTime(afternoon.sbdaate)
            if (needFallback) {
              const ruleSm = res.result.hrKqRule.ruleSm
              this.loadFallbackGddatedk(ruleSm).then((fallbackList) => {
                // 匹配到兜底规则取其时段，未匹配则沿用原数据（不取兜底）
                this.applyArrivalPartOptions(fallbackList || list)
              })
            } else {
              this.applyArrivalPartOptions(list)
            }
          } else {
            this.arrivalPartOptions = []
          }
        })
        .catch(() => {
          this.arrivalPartOptions = []
        })
    },
    /** 判断打卡时间是否为空 */
    isEmptyClockTime(v) {
      return v === null || v === undefined || v === ''
    },
    /**
     * 从系统变量 hr_kq_rule 中按规则说明匹配固定打卡时段（兜底）
     * 规则列表只请求一次并缓存；匹配不到返回 null
     */
    loadFallbackGddatedk(ruleSm) {
      if (!ruleSm) {
        return Promise.resolve(null)
      }
      if (!this._fallbackRulePromise) {
        this._fallbackRulePromise = getAction(this.url.getHrKqRuleVariable)
          .then((res) => {
            return res.success && Array.isArray(res.result.hrKqRuleGddatedkList) ? res.result.hrKqRuleGddatedkList : []
          })
          .catch(() => [])
      }
      return this._fallbackRulePromise.then((rules) => {
        const matched = rules.find((item) => item.ruleSm === ruleSm)
        return matched && Array.isArray(matched.hrKqRuleGddatedk) ? matched.hrKqRuleGddatedk : null
      })
    },
    /**
     * 根据固定打卡时段生成到岗时段下拉：收集各时段的上班时间 sbdaate 和下班时间 xbdate，
     * value/label 均为打卡时间 HH:mm，过滤空值、按时间去重并按时间先后排序
     */
    applyArrivalPartOptions(list) {
      const source = Array.isArray(list) ? list : []
      const map = new Map()
      source.forEach((item) => {
        ;['sbdaate', 'xbdate'].forEach((key) => {
          const time = item[key]
          if (!this.isEmptyClockTime(time) && !map.has(time)) {
            map.set(time, { value: time, label: time })
          }
        })
      })
      this.arrivalPartOptions = Array.from(map.values()).sort((a, b) =>
        a.value < b.value ? -1 : a.value > b.value ? 1 : 0
      )
    },

    /**
     * 销假类型变更：清空已选请假单，按新类型重新拉取假期列表
     */
    onXjTypeChange(val) {
      this.model.hrXjsqId = ''
      this.selectedLeaveStartTime = ''
      this.selectedLeaveEndTime = ''
      this.leaveOrderList = []
      if (val) {
        this.loadLeaveOrderList()
      }
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate(['hrXjsqId'])
      })
    },

    /**
     * 请假单时长展示：年假按天（applyDays），其他类型按小时（applyHours），与请假列表口径一致
     */
    formatLeaveDuration(item) {
      if (this.model.xjType === '年假') {
        return item.applyDays !== null && item.applyDays !== undefined && item.applyDays !== ''
          ? `${item.applyDays}天`
          : ''
      }
      return item.applyHours !== null && item.applyHours !== undefined && item.applyHours !== ''
        ? `${item.applyHours}小时`
        : ''
    },

    /**
     * 加载可销假请假单列表
     * 走 queryCanCancelLeaveList 接口：当前登录工号 + 当前销假类型(xjType)，
     * 审批通过、未销假等过滤条件由后端处理
     */
    loadLeaveOrderList() {
      if (!this.model.xjType) {
        this.leaveOrderList = []
        return
      }
      const perInfo = Vue.ls.get('perInfo') || {}
      const params = {
        no: this.model.no || perInfo.no || '',
        xjType: this.model.xjType,
      }
      getAction(this.url.leaveOrderList, params).then((res) => {
        if (res.success) {
          const records = (res.result && res.result.records) || res.result || []
          this.leaveOrderList = records.map((item) => ({
            // 保留请假单原始字段，选中后用于取值及构造下拉文本
            ...item,
            value: item.id,
            label: `${item.startTime} ~ ${item.endTime}（${this.formatLeaveDuration(item)}）`,
          }))
          // 回显已有单据时，列表加载完成后同步已选请假单的开始/结束时间，供提交校验使用
          if (this.model.hrXjsqId) {
            const selected = this.leaveOrderList.find((item) => item.value === this.model.hrXjsqId)
            this.selectedLeaveStartTime = selected ? selected.startTime : ''
            this.selectedLeaveEndTime = selected ? selected.endTime : ''
          }
        }
      })
    },

    /**
     * 选择请假单变化
     * 记录所选请假单开始/结束时间（提交校验用）；实际请假时长/额度调整等由后端根据到岗时间计算返回
     */
    onLeaveSelectChange(val) {
      if (!val) {
        this.selectedLeaveStartTime = ''
        this.selectedLeaveEndTime = ''
        return
      }
      const order = this.leaveOrderList.find((item) => item.value === val)
      if (order) {
        this.selectedLeaveStartTime = order.startTime
        this.selectedLeaveEndTime = order.endTime
      }
    },
    /**
     * 详情/审批回显：用列表行返回的 hrXjsq（原请假单）构建假期下拉
     * 已销假/审批中的请假单不在 queryCanCancelLeaveList 可销假列表中，只能直接取行数据
     * @param {Object} hrXjsq - 列表行嵌套的原请假单（id/startTime/endTime/applyHours/applyDays 等）
     */
    applyLeaveOrderFromHrXjsq(hrXjsq) {
      if (!hrXjsq || !hrXjsq.id) {
        this.leaveOrderList = []
        return
      }
      this.leaveOrderList = [
        {
          // 保留请假单原始字段（与 loadLeaveOrderList 口径一致）
          ...hrXjsq,
          value: hrXjsq.id,
          label: `${hrXjsq.startTime} ~ ${hrXjsq.endTime}（${this.formatLeaveDuration(hrXjsq)}）`,
        },
      ]
      // 兜底：行数据缺失 hrXjsqId 时用原请假单 id 补选
      if (!this.model.hrXjsqId) {
        this.model.hrXjsqId = hrXjsq.id
      }
      // 回填请假开始/结束时间（提交校验用）
      this.selectedLeaveStartTime = hrXjsq.startTime || ''
      this.selectedLeaveEndTime = hrXjsq.endTime || ''
    },

    add() {
      this.edit(this.modelDefault)
    },
    edit(record) {
      this.model = Object.assign({}, record)
      this.selectedLeaveStartTime = ''
      this.selectedLeaveEndTime = ''
      // actualEndTime 为完整到岗时刻（YYYY-MM-DD HH:mm:ss），回显时拆成「日期 + 到岗时段」
      // 时段下拉 value 即打卡时间 HH:mm，直接截取时分
      //（可编辑模式待接口选项加载完成后选中展示；详情/审批直接以该值构造展示选项，不调接口）
      this.model.arrivalPart = ''
      if (this.model.actualEndTime) {
        const [datePart, timePart] = String(this.model.actualEndTime).split(' ')
        this.model.actualEndTime = datePart
        if (timePart) {
          this.model.arrivalPart = timePart.slice(0, 5)
        }
      }
      // 每次打开都递增，强制重建审批时间轴（同单据重复打开详情/修改重申也能刷新）
      this.detailNonce++

      // 回显已有单据时加载假期下拉：
      // 详情/审批模式直接用列表行返回的 hrXjsq（原请假单）构建——已销假/审批中的请假单
      // 不在 queryCanCancelLeaveList 可销假列表中，走接口会导致假期下拉回显空白；
      // 新增/修改重申仍需完整的可销假列表，走接口
      if (this.model.xjType) {
        if (this.formDisabled && this.model.hrXjsq) {
          this.applyLeaveOrderFromHrXjsq(this.model.hrXjsq)
        } else {
          this.loadLeaveOrderList()
        }
      } else {
        this.leaveOrderList = []
      }

      // 非审批模式重置审批数据
      if (!this.OK_show) {
        this.spdata = { bz: '', spr: '', spResult: 'approved' }
      }

      this.perInfo = Vue.ls.get('perInfo') || {}
      if (!this.model.id) {
        this.model['name'] = this.perInfo.name
        this.model['no'] = this.perInfo.no
        this.model['companyId'] = this.perInfo.companyId
        this.model['dept'] = this.perInfo.dept
        this.model['employeeId'] = this.perInfo.id
        this.model['positionName'] = this.perInfo.positionName || ''
      }

      // 到岗时段下拉：
      // 新增/修改重申——调打卡规则接口加载可选时段；
      // 详情/审批——下拉禁用仅展示 actualEndTime 拆出的时分，无需请求接口，用该值构造单个选项兜底展示
      if (this.formDisabled) {
        this.arrivalPartOptions = this.model.arrivalPart
          ? [{ value: this.model.arrivalPart, label: this.model.arrivalPart }]
          : []
      } else {
        this.loadArrivalPartOptions(this.model.no || this.perInfo.no || '')
      }

      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
        // 加载动态流程节点（由 ApprovalProcess 组件内部 watch dept 自动触发）
        if (!this.formDisabled && this.$refs.approvalProcess) {
          this.$refs.approvalProcess.reset()
          this.$nextTick(() => {
            this.$refs.approvalProcess.loadProcessNodes()
          })
        }
      })
    },
    submitForm() {
      const that = this
      this.$refs.form.validate((valid) => {
        if (valid) {
          // 到岗时段必选（下拉已合并到到岗时间表单项内，需手动校验），value 即打卡时间 HH:mm
          if (!this.model.arrivalPart) {
            this.$message.warning('请选择到岗时段！')
            return
          }
          // 销假时效校验（仅申请人提交：新增 / 修改重申）：当前时间须早于请假结束时间
          if (!this.OK_show && !this.formDisabled && this.selectedLeaveEndTime) {
            const leaveEndTime = new Date(String(this.selectedLeaveEndTime).replace(/-/g, '/')).getTime()
            if (!isNaN(leaveEndTime) && Date.now() >= leaveEndTime) {
              this.$message.warning('当前时间已超过请假结束时间，不能进行销假！')
              return
            }
          }
          // 到岗时间范围校验：到岗日期 + 到岗时段拼成完整时刻（yyyy-MM-dd HH:mm:ss），须在请假开始~结束时间范围内
          if (!this.OK_show && !this.formDisabled && (this.selectedLeaveStartTime || this.selectedLeaveEndTime)) {
            const parseTime = (v) => new Date(String(v).replace(/-/g, '/')).getTime()
            const arrivalDateTime = parseTime(
              `${String(this.model.actualEndTime).split(' ')[0]} ${this.model.arrivalPart}:00`
            )
            const leaveStartTime = parseTime(this.selectedLeaveStartTime)
            const leaveEndTime = parseTime(this.selectedLeaveEndTime)
            if (
              !isNaN(arrivalDateTime) &&
              ((!isNaN(leaveStartTime) && arrivalDateTime < leaveStartTime) ||
                (!isNaN(leaveEndTime) && arrivalDateTime > leaveEndTime))
            ) {
              this.$message.warning(
                `到岗时间必须在请假时间范围内（${this.selectedLeaveStartTime} ~ ${this.selectedLeaveEndTime}）！`
              )
              return
            }
          }
          // 校验审批节点（仅申请人可编辑模式：新增 / 修改重申）
          if (!this.OK_show && !this.formDisabled && this.$refs.approvalProcess) {
            if (!this.$refs.approvalProcess.validate()) {
              return
            }
          }

          this.$emit('submit', true)
          let httpurl = ''
          let method = ''
          if (!this.model.id) {
            httpurl += this.url.add
            method = 'post'
          } else {
            httpurl += this.url.edit
            method = 'post'
          }

          // 组装 customProcessConfigurationDTOList（仅申请人可编辑模式：新增 / 修改重申）
          if (!this.OK_show && !this.formDisabled && this.$refs.approvalProcess) {
            this.model['customProcessConfigurationDTOList'] = this.$refs.approvalProcess.getCustomProcessList()
          }

          // 提交数据：到岗日期 + 所选打卡时间（arrivalPart 即 sbdaate/xbdate 中的 HH:mm）
          // 拼成完整到岗时刻 actualEndTime；arrivalPart 仅为前端辅助字段、hrXjsq 为回显嵌套对象，均不入库，提交时剔除
          const submitModel = Object.assign({}, this.model)
          if (submitModel.actualEndTime) {
            const datePart = String(submitModel.actualEndTime).split(' ')[0]
            submitModel.actualEndTime = `${datePart} ${this.model.arrivalPart}:00`
          }
          delete submitModel.arrivalPart
          // hrXjsq 为列表行带入的原请假单嵌套对象，仅用于详情/审批回显，不入库
          delete submitModel.hrXjsq

          httpAction(httpurl, submitModel, method)
            .then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                that.$emit('ok')
              } else {
                that.$message.warning(res.message)
              }
            })
            .finally(() => {
              this.$emit('submit', false)
            })
        }
      })
    },
  },
}
</script>

<style scoped lang="less">
/* 表单根：j-form-container 的 fieldset 不是 flex 容器，以 height:100% 承接其
   确定高度，再由自身向下建立 flex 列 */
.leave-resumption-form {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* ===== 全局表单项紧致 ===== */
.leave-resumption-form /deep/ .ant-form-item {
  margin-bottom: 8px;
}

.leave-resumption-form /deep/ .ant-form-item-label {
  padding-bottom: 2px;
  line-height: 20px;
}

.leave-resumption-form /deep/ .ant-form-item-label > label {
  color: #555;
  font-size: 13px;
}

.leave-resumption-form /deep/ .ant-form-item-required::before {
  color: #ff4d4f;
  font-size: 14px;
  margin-right: 2px;
}

/* ===== 左右两栏布局 =====
   桌面端 nowrap：wrap 会使 flex 行给子列的拉伸高度变为“不确定”，
   右列滚动区无法收敛高度而按内容撑高、不能滚动；移动端在下面改回 wrap */
.leave-form-row {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-wrap: nowrap;
}

.form-col-left {
  border-right: 1px dashed #e6e8eb;
  padding-right: 24px;
  min-height: 0;
  overflow-y: auto;
}

.form-col-right {
  padding-left: 8px;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .leave-form-row {
    flex-wrap: wrap;
  }

  .form-col-left {
    border-right: 0;
    padding-right: 0;
    margin-bottom: 16px;
  }

  .form-col-right {
    padding-left: 0;
  }
}

/* ===== 区块标题 ===== */
.form-section-title {
  flex-shrink: 0;
  position: relative;
  margin: 0 0 12px;
  padding: 0 0 8px;
  border-bottom: 1px solid #e6e8eb;
  color: #1f2937;
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
}

/* ===== 审批流程内部滚动区（flex 填满右列剩余高度） ===== */
.approval-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.approval-scroll::-webkit-scrollbar {
  width: 6px;
}

.approval-scroll::-webkit-scrollbar-thumb {
  background: #c7d0e4;
  border-radius: 3px;
}

.approval-scroll::-webkit-scrollbar-track {
  background: transparent;
}

/* ===== 重新提交（修改重申）：上一轮审批记录时间轴 ===== */
.resubmit-timeline {
  margin-bottom: 16px;
}

/* ===== 到岗时间：日期 + 上下午选择布局（参考请假申请表） ===== */
.time-picker-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.time-picker-wrapper .ampm-select {
  flex: 0 0 90px;
  min-width: 90px;
}
</style>

<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container>
      <a-form-model
        ref="form"
        slot="detail"
        layout="vertical"
        :model="model"
        :rules="validatorRules"
        class="leave-apply-form"
      >
        <a-row :gutter="24" class="leave-form-row">
          <!-- ===== 左侧：申请信息 ===== -->
          <a-col :xs="24" :sm="12" class="form-col-left">
            <div class="form-section-title">
              <span>申请信息</span>
            </div>

            <!-- 使用 flex 布局：校验错误提示会让单项变高，float 布局下后续列会绕流错位 -->
            <a-row type="flex" :gutter="16">
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="姓名">
                  <a-input v-model="model.name" disabled placeholder="自动获取" />
                </a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="工号">
                  <a-input v-model="model.no" disabled placeholder="自动获取" />
                </a-form-model-item>
              </a-col>

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
                <a-form-model-item label="部门">
                  <a-input
                    :value="model.dept_dictText || perInfo.dept_dictText || ''"
                    disabled
                    placeholder="自动获取"
                  />
                </a-form-model-item>
              </a-col>

              <a-col :xs="24" :sm="12" v-if="isAnnualLeave && !formDisabled">
                <a-form-model-item label="剩余年假天数（天）">
                  <a-input :value="remainingAnnualLeave" disabled placeholder="自动获取" />
                </a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="12" v-if="isOtDeduct && !formDisabled">
                <a-form-model-item label="剩余加班调休天数（天）">
                  <a-input :value="remainingOtDays" disabled placeholder="自动获取" />
                </a-form-model-item>
              </a-col>

              <a-col :xs="24" :sm="12">
                <a-form-model-item label="请假类型" prop="xjType" :required="true">
                  <a-select
                    style="width: 100%"
                    :disabled="formDisabled"
                    v-model="model.xjType"
                    allowClear
                    show-search
                    option-filter-prop="children"
                    placeholder="请选择请假类型"
                    @change="handleXjTypeChange"
                  >
                    <a-select-option v-for="item in xjTypeOptions" :key="item.value" :value="item.value">{{
                      item.text || item.label
                    }}</a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
              <!-- 按天抵扣事假（年假/加班调休，isDeduct）时：右侧显示选择事假单 -->
              <a-col :xs="24" :sm="12" v-if="isDayBasedDeduct && isDeduct">
                <a-form-model-item label="选择事假单" prop="deductHrXjsqId" :required="true">
                  <!-- 只读模式（详情/审批）：不展示下拉框，用输入框回显拼接好的事假单信息 -->
                  <a-input
                    v-if="formDisabled"
                    :value="selectedLeaveOrderText"
                    :title="selectedLeaveOrderText"
                    disabled
                    placeholder="自动获取"
                  />
                  <a-select
                    v-else
                    v-model="model.deductHrXjsqId"
                    placeholder="请选择事假单"
                    allowClear
                    style="width: 100%"
                  >
                    <a-select-option
                      v-for="item in leaveOrderList"
                      :title="item.label"
                      :key="item.value"
                      :value="item.value"
                    >
                      {{ item.label }}
                    </a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
              <!-- 非按天抵扣时：右侧显示申请时长（小时） -->
              <a-col :xs="24" :sm="12" v-if="!isDayBasedDeduct">
                <a-form-model-item label="申请时长" :required="true">
                  <a-input
                    :value="
                      calculatedApplyHours === null || calculatedApplyHours === undefined || calculatedApplyHours === ''
                        ? ''
                        : calculatedApplyHours + ' 小时'
                    "
                    disabled
                    placeholder="自动计算"
                  />
                </a-form-model-item>
              </a-col>

              <!-- 按天抵扣（年假/加班调休）：申请时长单独占一行（左半边，与剩余天数提示配套） -->
              <a-col :xs="24" :sm="12" v-if="isDayBasedDeduct">
                <a-form-model-item label="申请时长" :required="true">
                  <div class="apply-days-row">
                    <a-input
                      :value="
                        model.applyDays === null || model.applyDays === undefined || model.applyDays === ''
                          ? ''
                          : model.applyDays + ' 天'
                      "
                      disabled
                      placeholder="自动计算"
                    />
                    <div v-if="showBalanceShortageTip" class="apply-hours-tip">{{ balanceShortageText }}</div>
                  </div>
                </a-form-model-item>
              </a-col>

              <!-- 婚假/育儿假/陪产假：需填写有效期起点日期（只选年月日，不含时分） -->
              <a-col :xs="24" :sm="12" v-if="showValidityStart">
                <a-form-model-item :label="`有效期起点日期（${validityStartHint}）`" prop="yxqqdDate" :required="true">
                  <j-date
                    :disabled="formDisabled"
                    v-model="model.yxqqdDate"
                    date-format="YYYY-MM-DD"
                    placeholder="请选择有效期起点日期"
                    style="width: 83%"
                  />
                </a-form-model-item>
              </a-col>

              <a-col :xs="24" :sm="12">
                <a-form-model-item label="开始时间" prop="startTime" :required="true">
                  <div class="time-picker-wrapper">
                    <!-- 只读按天抵扣模式：日期已包含在右侧完整时间输入框中，不再单独显示日期控件 -->
                    <j-date
                      v-if="!isDayBasedDeduct || !formDisabled"
                      :placeholder="isDayBasedDeduct ? '请选择开始日期' : '请选择开始时间'"
                      :disabled="formDisabled"
                      v-model="model.startTime"
                      :show-time="!isDayBasedDeduct ? { format: 'HH:mm' } : false"
                      :date-format="isDayBasedDeduct ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm'"
                      :disabled-date="disabledStartTime"
                      @change="handleStartTimeChange"
                    />
                    <!-- 编辑模式：下拉绑定时段类型 sjd（option 文案仍显示打卡时间） -->
                    <a-select
                      v-if="isDayBasedDeduct && !formDisabled"
                      v-model="model.startAmPm"
                      class="ampm-select"
                      placeholder="开始时间"
                      @change="handleStartAmPmChange"
                    >
                      <a-select-option v-for="item in startTimeOptions" :key="item.value" :value="item.value">
                        {{ item.label }}
                      </a-select-option>
                    </a-select>
                    <!-- 详情/审批模式不展示下拉，直接回显已保存的完整开始时间 -->
                    <a-input
                      v-else-if="isDayBasedDeduct"
                      :value="model.startTime"
                      disabled
                      class="ampm-readonly"
                      placeholder="开始时间"
                    />
                  </div>
                </a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="结束时间" prop="endTime" :required="true">
                  <div class="time-picker-wrapper">
                    <!-- 只读按天抵扣模式：日期已包含在右侧完整时间输入框中，不再单独显示日期控件 -->
                    <j-date
                      v-if="!isDayBasedDeduct || !formDisabled"
                      :placeholder="isDayBasedDeduct ? '请选择结束日期' : '请选择结束时间'"
                      :disabled="formDisabled"
                      v-model="model.endTime"
                      :show-time="!isDayBasedDeduct ? { format: 'HH:mm' } : false"
                      :date-format="isDayBasedDeduct ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm'"
                      :disabled-date="disabledEndTime"
                      @change="handleEndTimeChange"
                    />
                    <!-- 编辑模式：下拉绑定时段类型 sjd（option 文案仍显示打卡时间） -->
                    <a-select
                      v-if="isDayBasedDeduct && !formDisabled"
                      v-model="model.endAmPm"
                      class="ampm-select"
                      placeholder="结束时间"
                      @change="handleEndAmPmChange"
                    >
                      <a-select-option v-for="item in endTimeOptions" :key="item.value" :value="item.value">
                        {{ item.label }}
                      </a-select-option>
                    </a-select>
                    <!-- 详情/审批模式不展示下拉，直接回显已保存的完整结束时间 -->
                    <a-input
                      v-else-if="isDayBasedDeduct"
                      :value="model.endTime"
                      disabled
                      class="ampm-readonly"
                      placeholder="结束时间"
                    />
                  </div>
                </a-form-model-item>
              </a-col>

              <!-- 年假区间跨周六（工作日/休息日/调休上班，法定节假日除外）时提示：勾选后周六计入年假天数 -->
              <a-col :xs="24" :sm="12" v-if="crossSaturdayRest">
                <a-form-model-item label=" " :colon="false" class="cross-saturday-item">
                  <a-alert type="warning" class="cross-saturday-alert">
                    <template slot="message">
                      <a-checkbox
                        :checked="model.includeSaturday === 1"
                        :disabled="formDisabled"
                        @change="handleCrossSaturdayChange"
                      >
                        <span class="cross-saturday-hint">勾选后周六计入申请时长计算</span>
                      </a-checkbox>
                    </template>
                  </a-alert>
                </a-form-model-item>
              </a-col>

              <!-- 选择事假单后：显示源请假信息（参考原型 leaveCreate_sourceInfoBox） -->
              <a-col :span="24" v-if="isDayBasedDeduct && isDeduct && model.deductHrXjsqId && selectedLeaveOrder">
                <div class="source-info-box">
                  <div class="source-info-title">源请假信息</div>
                  <div class="source-info-grid">
                    <div>
                      <span class="source-info-label">源请假类型：</span>
                      <span class="source-info-value">{{ sourceLeaveTypeText }}</span>
                    </div>
                    <div>
                      <span class="source-info-label">源请假时长：</span>
                      <span class="source-info-value">{{ sourceLeaveDaysText }}</span>
                    </div>
                    <div>
                      <span class="source-info-label">时长类型：</span>
                      <span class="source-info-value">小时</span>
                    </div>
                  </div>
                </div>
              </a-col>

              <a-col :span="24">
                <a-form-model-item label="请假原因" prop="sqyy" :required="true">
                  <a-textarea
                    v-model="model.sqyy"
                    :disabled="formDisabled"
                    placeholder="请输入请假原因"
                    :auto-size="{ minRows: 3, maxRows: 5 }"
                  />
                </a-form-model-item>
              </a-col>
              <a-col :span="24">
                <a-form-model-item label="附件">
                  <JUploadList v-model="model.attachmentUrls" :disabled="formDisabled" :buttonVisible="!formDisabled" />
                </a-form-model-item>
              </a-col>
            </a-row>
          </a-col>

          <!-- ===== 右侧：审批流程 ===== -->
          <a-col v-if="!OK_show" :xs="24" :sm="12" class="form-col-right">
            <div class="form-section-title">
              <span>审批流程</span>
            </div>
            <div class="approval-scroll">
              <div v-if="model.customProcessSqdSpjdList && model.customProcessSqdSpjdList.length">
                <!-- 审批流程时间轴（详情模式） -->
                <approval-timeline :applyId="model.id" :LCdata="model" />
              </div>
              <div v-if="!isDetail">
                <!-- 动态审批节点（新增/编辑模式） -->
                <div v-for="(node, nIndex) in processNodeList" :key="node.id || nIndex" class="timeline-node">
                  <div class="timeline-dot"></div>
                  <div class="timeline-card">
                    <div class="timeline-card-title">
                      {{ node.nodeName }}
                      <a-tag
                        v-if="node.approvalRule === '1' || node.approvalRule === 1"
                        color="orange"
                        class="node-rule-tag"
                        >会签</a-tag
                      >
                      <a-tag
                        v-if="node.approvalRule === '2' || node.approvalRule === 2"
                        color="red"
                        class="node-rule-tag"
                        >或签</a-tag
                      >
                    </div>
                    <div class="approver-line">
                      <template v-if="nodeObjList[nIndex] && nodeObjList[nIndex].arr.length > 0">
                        <a-tag
                          v-for="item in nodeObjList[nIndex].arr"
                          :key="item.id"
                          class="approver-tag"
                          :closable="canEditApprovers(node)"
                          @close="handleEmployeeTagClose($event, nIndex, item.id)"
                        >
                          <span class="approver-avatar">{{ getAvatarText(item.name) }}</span>
                          <span class="approver-name">{{ item.name }}</span>
                        </a-tag>
                      </template>
                      <span v-else-if="isKjSprTypeNode(node) && !canEditApprovers(node)" class="kj-spr-type-text">
                        {{ node.chooseObjectsName }}
                      </span>
                      <j-select-approver
                        v-if="isLeaderNode(node)"
                        v-model="nodeObjList[nIndex].str"
                        :kj-spr-type="getNodeKjSprType(node)"
                        placeholder="请选择审批人"
                        value-field="name"
                        button-only
                        :button-text="'自选审批人'"
                        :button-icon="''"
                        :button-type="'default'"
                        :disabled="formDisabled"
                        @change="(value, rows) => handleSelectValue(nIndex, value, rows)"
                      />
                      <j-select-employee
                        v-else-if="hasSprScope(node)"
                        v-model="nodeObjList[nIndex].str"
                        :placeholder="isCcNode(node) ? '请选择抄送人' : '请选择审批人'"
                        value-field="name"
                        button-only
                        :button-text="isCcNode(node) ? '添加抄送人' : '添加审批人'"
                        :button-icon="''"
                        :button-type="'default'"
                        :disabled="formDisabled"
                        @change="(value, rows) => handleSelectValue(nIndex, value, rows)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a-col>

          <a-col v-if="OK_show" :xs="24" :sm="12" class="form-col-right">
            <div class="form-section-title">
              <span>审批意见</span>
            </div>

            <a-row :gutter="16">
              <a-col :span="24">
                <a-form-model-item label="审批意见" prop="sqyy" :required="true">
                  <a-textarea
                    v-model="spdata.bz"
                    placeholder="请输入审批意见"
                    :auto-size="{ minRows: 3, maxRows: 5 }"
                  />
                </a-form-model-item>
              </a-col>
            </a-row>
          </a-col>
        </a-row>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>
import Vue from 'vue'
import ApprovalTimeline from './ApprovalTimeline'
import { httpAction, getAction, postAction } from '@/api/manage'
import { ajaxGetDictItems, getDictItemsFromCache } from '@/api/api'
import { USER_INFO } from '@/store/mutation-types'
import moment from 'moment'

export default {
  name: 'HrXjsqApplyForm',
  components: {
    ApprovalTimeline,
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
    title: {
      type: String,
      default: '',
      required: false,
    },
    OK_show: {
      type: Boolean,
      default: false,
      required: false,
    },
    isDeduct: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      confirmLoading: false,

      // 审批附加数据
      spdata: {
        bz: '',
        spr: '',
      },
      perInfo: {},
      model: { includeSaturday: 0, applyHours: null, applyDays: null },
      // 独立的响应式显示值，避免流程页替换 model 对象后丢失新增字段的更新。
      calculatedApplyHours: null,
      // 请假类型字典项（xj_type）
      xjTypeDictOptions: [],
      // 剩余年假天数
      remainingAnnualLeave: 0,
      // 剩余加班调休实际可用天数（usableDays，按 0.5 天向下取整）
      remainingOtDays: 0,
      // 剩余加班调休接口完整返回（enough/usableDays/remainDays/months）
      otRemainInfo: {},
      // 事假单下拉选项（年假抵扣事假时使用）
      leaveOrderList: [],
      // 年假开始时间下拉选项（取打卡规则的 sbdaate）：[{ value: sjd 时段类型, label: 'HH:mm' }]
      startTimeOptions: [],
      // 年假结束时间下拉选项（取打卡规则的 xbdate）：[{ value: sjd 时段类型, label: 'HH:mm' }]
      endTimeOptions: [],
      // 禁止选择的日期（法定节假日，来源：hr_calendar_holiday 接口 isOffDay=2）
      disabledDateList: [],
      // 日历日期状态表（key: rq 日期，value: isOffDay 0-工作日 1-休息日 2-法定节假日 3-调休上班）
      // 用于年假判断区间内是否包含大小周休息日周六
      calendarOffDayMap: {},

      // 流程节点列表（后端返回）
      processNodeList: [],
      // 每个节点对应的审批人/抄送人数据（索引与 processNodeList 对应）
      nodeObjList: [],

      validatorRules: {
        companyId: [{ required: true, message: '请输入公司', trigger: 'blur' }],
        no: [{ required: true, message: '请输入工号', trigger: 'blur' }],
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
        endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
        // 婚假/育儿假/陪产假：有效期起点日期必选
        yxqqdDate: [{ required: true, message: '请选择有效期起点日期', trigger: 'change' }],
        sqyy: [{ required: true, message: '请输入请假原因', trigger: ['blur', 'change'] }],
        xjType: [{ required: true, message: '请选择请假类型', trigger: 'change' }],
        // 按天抵扣事假（年假/加班调休，isDeduct）时，事假单必选
        deductHrXjsqId: [
          {
            validator: (rule, value, callback) => {
              if (this.isDayBasedDeduct && this.isDeduct && !value) {
                callback(new Error('请选择事假单'))
              } else {
                callback()
              }
            },
            trigger: 'change',
          },
        ],
      },
      url: {
        annualLeaveApplication: '/hr_xjsq/hrXjsq/annualLeaveApplication',
        add: '/hr_xjsq/hrXjsq/add',
        edit: '/hr_xjsq/hrXjsq/edit',
        queryById: '/hr_xjsq/hrXjsq/queryById',
        // 流程节点配置接口
        getLcjdList: '/process/customProcessConfiguration/getLcjdList',
        // 获取个人事假单列表（年假抵扣事假）
        getPersonalLeaveByNo: '/hr_xjsq/hrXjsq/getPersonalLeaveByNo',
        // 年假天数计算接口
        calcAnnualLeaveDays: '/hr_xjsq/hrXjsq/calcAnnualLeaveDays',
        // 非年假申请时长（小时）计算接口
        getApplyHours: '/hr_xjsq/hrXjsq/getApplyHours',
        // 获取固定打卡时段（年假开始/结束时间下拉）
        getHrKqRuleGddatedkByNo: '/hrm/hrKqRule/getHrKqRuleGddatedkByNo',
        // 系统变量-固定打卡规则（员工打卡规则时段缺失时，按规则名称兜底匹配）
        getHrKqRuleVariable: '/variableRescord/sysVariableRecord/getInfo/hr_kq_rule',
        // 节假日日历（禁选法定节假日）
        calendarHolidayList: '/hr_calendar_holiday/hrCalendarHoliday/list',
        // 查询剩余加班调休天数（前三个月加班结余）
        queryOtRemainDays: '/hrHolidayDeduct/hrHolidayDeduct/queryOtRemainDays',
        // 加班调休抵扣天数试算（0.5 的整数倍）
        calcOtDeductDays: '/hrHolidayDeduct/hrHolidayDeduct/calcOtDeductDays',
      },
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
    // 是否为详情模式（表单只读且不是审批场景：父组件详情时 disabled=true、OK_show=false）
    isDetail() {
      return this.disabled && !this.OK_show
    },
    // 是否为年假
    isAnnualLeave() {
      return this.model.xjType === '年假'
    },
    // 是否为加班调休
    isOtDeduct() {
      return this.model.xjType === '加班调休'
    },
    // 是否按天抵扣（年假 / 加班调休：日期 + 上下午时段，抵扣天数 applyDays）
    isDayBasedDeduct() {
      return this.isAnnualLeave || this.isOtDeduct
    },
    // 是否显示有效期起点日期（婚假 / 育儿假 / 陪产假）
    showValidityStart() {
      return ['婚假', '育儿假', '陪产假'].indexOf(this.model.xjType) !== -1
    },
    // 有效期起点括号提示：婚假=结婚证登记日期；陪产假/育儿假=出生证明出生日期
    validityStartHint() {
      return this.model.xjType === '婚假' ? '结婚证登记日期' : '出生证明出生日期'
    },
    // 请假类型下拉选项：年假抵扣事假（isDeduct）时只显示白名单内的类型（后续新增类型在此追加）
    xjTypeOptions() {
      if (this.isDeduct) {
        const deductTypes = ['年假', '加班调休']
        return this.xjTypeDictOptions.filter((item) => deductTypes.indexOf(item.value) !== -1)
      }
      return this.xjTypeDictOptions
    },
    // 是否显示剩余年假不足提示
    showAnnualLeaveTip() {
      // 只读模式（详情/审批）不加载剩余年假天数，不做不足提示
      if (this.disabled) return false
      if (!this.isAnnualLeave) return false
      const applyDays = Number(this.model.applyDays) || 0
      const remaining = Number(this.remainingAnnualLeave) || 0
      // 申请天数 > 剩余年假天数
      return applyDays > remaining
    },
    // 是否显示剩余加班调休不足提示（连 0.5 天都没有，或申请天数超过可用天数）
    showOtDeductTip() {
      // 只读模式（详情/审批）不加载剩余加班调休，不做不足提示
      if (this.disabled) return false
      if (!this.isOtDeduct) return false
      const info = this.otRemainInfo || {}
      if (info.enough === false) return true
      const applyDays = Number(this.model.applyDays) || 0
      const usableDays = Number(info.usableDays) || 0
      return applyDays > usableDays
    },
    // 是否显示余额不足提示（年假 / 加班调休）
    showBalanceShortageTip() {
      return this.showAnnualLeaveTip || this.showOtDeductTip
    },
    // 余额不足提示文案
    balanceShortageText() {
      return this.isOtDeduct ? '剩余加班调休不足' : '剩余年假不足'
    },
    // 年假区间内是否包含工作日周六（大小周小周上班的周六、调休上班或休息日的周六，法定节假日除外）
    crossSaturdayRest() {
      if (!this.isAnnualLeave) return false
      const { startTime, endTime } = this.model
      if (!startTime || !endTime) return false
      const start = moment(startTime).startOf('day')
      const end = moment(endTime).startOf('day')
      if (end.diff(start, 'days') < 0) return false
      // 按天遍历起止区间（含首尾），任一周六为工作日（0）、休息日（1）或调休上班（3）即命中，法定节假日（2）不命中
      const cur = start.clone()
      while (cur.diff(end, 'days') <= 0) {
        if (
          cur.day() === 6 &&
          ['0', '1', '3'].indexOf(String(this.calendarOffDayMap[cur.format('YYYY-MM-DD')])) !== -1
        ) {
          return true
        }
        cur.add(1, 'day')
      }
      return false
    },
    // 当前选中的事假单（新增/编辑：从事假单下拉列表中查找；只读：后端返回嵌套对象 deductHrXjsq）
    selectedLeaveOrder() {
      // 只读模式（详情/审批）：优先使用后端返回的源事假单对象（下拉列表可能不含已抵扣的单据）
      if (this.formDisabled && this.model.deductHrXjsq) {
        return this.model.deductHrXjsq
      }
      if (!this.model.deductHrXjsqId) return null
      return this.leaveOrderList.find((item) => item.value == this.model.deductHrXjsqId) || null
    },
    // 只读模式下事假单输入框回显文本（与下拉选项 label 拼接规则保持一致）
    selectedLeaveOrderText() {
      const order = this.selectedLeaveOrder
      const days =
        order.applyHours === null || order.applyHours === undefined || order.applyHours === '' ? '' : order.applyHours
      return `${order.startTime || ''}~${order.endTime} ${days}小时`
    },
    // 源请假类型
    sourceLeaveTypeText() {
      const order = this.selectedLeaveOrder
      if (!order) return '-'
      return order.xjType_dictText || order.xjType || '事假'
    },
    // 源请假时长（小时）
    sourceLeaveDaysText() {
      const order = this.selectedLeaveOrder
      if (!order || order.applyHours === null || order.applyHours === undefined || order.applyHours === '') {
        return '-'
      }
      return `${order.applyHours} 小时`
    },
    // 开始时间禁选函数（日历渲染每个日期格都会调用，顺带按面板所在年份懒加载数据）
    disabledStartTime() {
      const list = this.disabledDateList
      return (current) => {
        if (!current) return false
        // 面板翻到哪一年就加载哪一年，有缓存不会重复请求
        this.loadDisabledDateList(current.year())
        // 禁用禁选列表中的法定节假日
        return list.indexOf(current.format('YYYY-MM-DD')) !== -1
      }
    },
    // 结束时间禁选函数
    disabledEndTime() {
      const list = this.disabledDateList
      const startTime = this.model.startTime
      return (current) => {
        if (!current) return false
        this.loadDisabledDateList(current.year())
        // 禁用禁选列表中的法定节假日
        if (list.indexOf(current.format('YYYY-MM-DD')) !== -1) {
          return true
        }
        if (!startTime) {
          return false
        }
        // 禁用早于开始时间的日期
        return current < moment(startTime).startOf('day')
      }
    },
  },
  watch: {
    'model.startTime': function () {
      this.calcApplyHours()
    },
    'model.endTime': function () {
      this.calcApplyHours()
    },
    'model.no': function () {
      this.calcApplyHours()
    },
  },
  created() {
    this.modelDefault = JSON.parse(JSON.stringify(this.model))
    // 已加载/加载中的年份缓存（非响应式：disabledDate 在日历渲染期间执行，
    // 同步修改响应式数据可能造成渲染期更新；面板刷新只依赖响应式的 disabledDateList）
    this._disabledDateLoaded = {}
    this._disabledDateLoading = {}
    // 加载请假类型字典（xj_type）
    this.loadXjTypeOptions()
  },
  methods: {
    /** 加载请假类型字典项（优先读字典缓存，与 JDictSelectTag 逻辑一致） */
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
    /** 请假类型变更 */
    handleXjTypeChange(val) {
      // 切换类型后有效期起点日期显隐变化，清空其值与必填校验残留
      this.$set(this.model, 'yxqqdDate', undefined)
      // 切换类型后事假单显隐条件变化，清除其必填校验残留
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate(['deductHrXjsqId', 'yxqqdDate'])
      })
      if ((val === '年假' || val === '加班调休') && this.model.no) {
        // 切换到按天抵扣：清空非按天抵扣的申请时长（小时），抵扣天数使用 applyDays
        this.setApplyHours(null)
        if (val === '年假') {
          // 清空另一类型余额，避免回显残留
          this.remainingOtDays = 0
          this.otRemainInfo = {}
          this.loadAnnualLeaveBalance(this.model.no)
        } else {
          this.remainingAnnualLeave = 0
          this.loadOtRemainBalance(this.model.no)
        }
        // 抵扣事假：加载可抵扣的事假单列表
        if (this.isDeduct) {
          this.loadLeaveOrderList(this.model.no)
        }
        this.loadGddatedkOptions(this.model.no)
      } else {
        // 切换到非按天抵扣：清空抵扣天数与各余额
        this.$set(this.model, 'applyDays', null)
        this.remainingAnnualLeave = 0
        this.remainingOtDays = 0
        this.otRemainInfo = {}
        this.leaveOrderList = []
        this.model.deductHrXjsqId = undefined
        this.startTimeOptions = []
        this.endTimeOptions = []
        this.model.includeSaturday = 0
      }
    },
    /** 开始时间变化 */
    handleStartTimeChange() {
      if (this.isDayBasedDeduct) {
        this.calcDayBasedTime()
      } else {
        this.calcApplyHours()
      }
    },
    /** 结束时间变化 */
    handleEndTimeChange() {
      if (this.isDayBasedDeduct) {
        this.calcDayBasedTime()
      } else {
        this.calcApplyHours()
      }
    },
    /** 开始上下午变化 */
    handleStartAmPmChange() {
      this.calcDayBasedTime()
    },
    /** 结束上下午变化 */
    handleEndAmPmChange() {
      this.calcDayBasedTime()
    },
    /** 按天抵扣：年假走跨周六日历逻辑，加班调休直接试算，均回填 applyDays */
    calcDayBasedTime() {
      // 只读模式（详情/审批）直接回显后端返回值，不重新计算
      if (this.disabled) return
      if (this.isAnnualLeave) {
        this.calcAnnualLeaveTime()
      } else if (this.isOtDeduct) {
        this.calcOtDeductTime()
      }
    },
    /**
     * 年假：根据日期 + 上下午计算 applyDays
     *
     */
    calcAnnualLeaveTime() {
      // 只读模式（详情/审批）直接回显后端返回值，不重新计算
      if (this.disabled) return
      const { startTime, endTime } = this.model
      if (!startTime || !endTime) {
        this.$set(this.model, 'applyDays', 0)
        return
      }

      // 先确保区间覆盖年份的日历数据已加载（用于判断区间是否跨周六）
      this.ensureCalendarRangeLoaded(startTime, endTime).then(() => {
        // 区间已不跨周六时，重置勾选状态，按不计入周六计算
        if (!this.crossSaturdayRest && this.model.includeSaturday === 1) {
          this.model.includeSaturday = 0
        }
        this.requestAnnualLeaveDays()
      })
    },
    /** 调用后端接口计算年假天数（checked：周六是否计入年假天数，0-否 1-是） */
    requestAnnualLeaveDays() {
      const { startTime, endTime, startAmPm, endAmPm } = this.model
      if (!startTime || !endTime || !startAmPm || !endAmPm) {
        this.$set(this.model, 'applyDays', 0)
        return
      }

      // startAmPm/endAmPm 即所选时间对应的时段类型 sjd（字典 timetype，如 morning/afternoon）
      // 拼接完整日期时间时，需按 sjd 反查下拉项中的打卡时间（sbdaate/xbdate）
      const startClock = this.getClockBySjd(this.startTimeOptions, startAmPm)
      const endClock = this.getClockBySjd(this.endTimeOptions, endAmPm)
      if (!startClock || !endClock) {
        this.$set(this.model, 'applyDays', 0)
        return
      }

      // 调用后端接口计算年假天数
      const params = {
        startTime: `${startTime} ${startClock}:00`,
        endTime: `${endTime} ${endClock}:00`,
        startAmPm,
        endAmPm,
        includeSaturday: this.model.includeSaturday === 1 ? 1 : 0,
      }

      postAction(this.url.calcAnnualLeaveDays, params)
        .then((res) => {
          if (res.success && res.result && res.result.applyDays !== null && res.result.applyDays !== undefined) {
            this.$set(this.model, 'applyDays', Number(res.result.applyDays) || 0)
          } else {
            this.$set(this.model, 'applyDays', 0)
            this.$message.warning(res.message)
          }
        })
        .catch(() => {
          this.$set(this.model, 'applyDays', 0)
        })
    },
    /**
     * 加班调休：根据日期 + 上下午试算抵扣天数 applyDays（0.5 的整数倍）
     * 与年假不同，无跨周六口径；后端直接返回天数 number
     */
    calcOtDeductTime() {
      const { startTime, endTime, startAmPm, endAmPm } = this.model
      if (!startTime || !endTime || !startAmPm || !endAmPm) {
        this.$set(this.model, 'applyDays', 0)
        return
      }

      // startAmPm/endAmPm 即所选时间对应的时段类型 sjd（字典 timetype）
      // 拼接完整日期时间时，需按 sjd 反查下拉项中的打卡时间（sbdaate/xbdate）
      const startClock = this.getClockBySjd(this.startTimeOptions, startAmPm)
      const endClock = this.getClockBySjd(this.endTimeOptions, endAmPm)
      if (!startClock || !endClock) {
        this.$set(this.model, 'applyDays', 0)
        return
      }

      const params = {
        startTime: `${startTime} ${startClock}:00`,
        endTime: `${endTime} ${endClock}:00`,
        startAmPm,
        endAmPm,
      }

      postAction(this.url.calcOtDeductDays, params)
        .then((res) => {
          if (res.success && res.result !== null && res.result !== undefined && res.result !== '') {
            this.$set(this.model, 'applyDays', Number(res.result) || 0)
          } else {
            this.$set(this.model, 'applyDays', 0)
            this.$message.warning(res.message)
          }
        })
        .catch(() => {
          this.$set(this.model, 'applyDays', 0)
        })
    },
    /** 勾选/取消「请假跨周六（大小周）」：更新 includeSaturday 并重新计算申请时长 */
    handleCrossSaturdayChange(e) {
      this.model.includeSaturday = e.target.checked ? 1 : 0
      this.calcAnnualLeaveTime()
    },
    /** 确保起止日期区间覆盖的各年份日历数据均已加载 */
    ensureCalendarRangeLoaded(start, end) {
      const low = Math.min(moment(start).year(), moment(end).year())
      const high = Math.max(moment(start).year(), moment(end).year())
      const tasks = []
      for (let year = low; year <= high; year++) {
        tasks.push(this.loadDisabledDateList(year))
      }
      return Promise.all(tasks)
    },
    /** 加载剩余年假天数 */
    loadAnnualLeaveBalance(no) {
      if (!no) return
      getAction('/hr_employee_jq_stat/annualLeave/queryAnnualLeaveByNo', { no })
        .then((res) => {
          if (res.success) {
            this.remainingAnnualLeave = res.result.remainLeave || 0
          } else {
            this.remainingAnnualLeave = 0
            this.$message.warning(res.message)
          }
        })
        .catch(() => {
          this.remainingAnnualLeave = 0
        })
    },
    /** 加载剩余加班调休天数（前三个月加班结余，展示实际可用 usableDays） */
    loadOtRemainBalance(no) {
      if (!no) return
      getAction(this.url.queryOtRemainDays, { no })
        .then((res) => {
          if (res.success && res.result && typeof res.result === 'object') {
            this.otRemainInfo = res.result
            this.remainingOtDays = Number(res.result.usableDays) || 0
          } else {
            this.otRemainInfo = {}
            this.remainingOtDays = 0
            this.$message.warning(res.message)
          }
        })
        .catch(() => {
          this.otRemainInfo = {}
          this.remainingOtDays = 0
        })
    },
    /** 加载事假单下拉列表（年假抵扣事假） */
    loadLeaveOrderList(no) {
      if (!no) {
        this.leaveOrderList = []
        return
      }
      getAction(this.url.getPersonalLeaveByNo, { no })
        .then((res) => {
          if (res.success && Array.isArray(res.result)) {
            this.leaveOrderList = res.result.map((item) => ({
              // 保留原始字段，用于选中后展示「源请假信息」
              ...item,
              value: item.id,
              label: `${item.startTime}~${item.endTime} ${item.applyHours}小时`,
            }))
          } else {
            this.leaveOrderList = []
            this.$message.warning(res.message)
          }
        })
        .catch(() => {
          this.leaveOrderList = []
        })
    },
    /** 加载年假开始/结束时间下拉（固定打卡时段），返回 Promise 供调用方在选项就绪后补算时长 */
    loadGddatedkOptions(no) {
      if (!no) {
        this.resetGddatedkOptions()
        return Promise.resolve()
      }
      return getAction(this.url.getHrKqRuleGddatedkByNo, { no })
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
              // 当前员工命中的规则说明
              const ruleSm = res.result.hrKqRule.ruleSm
              this.loadFallbackGddatedk(ruleSm).then((fallbackList) => {
                // 匹配到兜底规则取其时段，未匹配则沿用原数据（不取兜底）
                this.applyGddatedkOptions(fallbackList || list)
              })
            } else {
              this.applyGddatedkOptions(list)
            }
          } else {
            this.$message.warning(res.message)
            this.resetGddatedkOptions()
          }
        })
        .catch(() => {
          this.resetGddatedkOptions()
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
     * 根据固定打卡时段列表生成开始/结束时间下拉
     * 下拉 value 绑定时段类型 sjd（morning/afternoon...），label 为打卡时间：
     * 开始时间取 sbdaate，结束时间取 xbdate；过滤空值并按 sjd 去重
     */
    applyGddatedkOptions(list) {
      const source = Array.isArray(list) ? list : []
      const buildOptions = (timeKey) => {
        const map = new Map()
        source.forEach((item) => {
          const time = item[timeKey]
          if (item.sjd && !this.isEmptyClockTime(time) && !map.has(item.sjd)) {
            map.set(item.sjd, { value: item.sjd, label: time })
          }
        })
        return Array.from(map.values())
      }
      this.startTimeOptions = buildOptions('sbdaate')
      this.endTimeOptions = buildOptions('xbdate')
    },
    /** 按 sjd 反查下拉项中的打卡时间（HH:mm） */
    getClockBySjd(options, sjd) {
      const item = options.find((opt) => opt.value === sjd)
      return item ? item.label : ''
    },
    /** 清空固定打卡时段下拉 */
    resetGddatedkOptions() {
      this.startTimeOptions = []
      this.endTimeOptions = []
    },
    /**
     * 按年份加载法定节假日禁选日期（接口返回 isOffDay=2 的日期）
     * 同一年份只请求一次；日历面板渲染时 disabledDate 会按当前展示年份触发懒加载
     */
    loadDisabledDateList(year) {
      // 详情模式不需要禁选日期/跨周六判断，不请求节假日日历接口
      if (this.isDetail) {
        return Promise.resolve()
      }
      const nf = year || moment().year()
      if (this._disabledDateLoaded[nf]) {
        return Promise.resolve()
      }
      if (this._disabledDateLoading[nf]) {
        return this._disabledDateLoading[nf]
      }
      const promise = getAction(this.url.calendarHolidayList, { nf })
        .then((res) => {
          const dateList = []
          const offDayMap = {}
          if (res.success && res.result && typeof res.result === 'object') {
            // result 以 "YYYY-MM" 为 key，值为当月日期数组：[{ day: '01', isOffDay: '2' }]
            Object.keys(res.result).forEach((monthKey) => {
              const days = Array.isArray(res.result[monthKey]) ? res.result[monthKey] : []
              days.forEach((item) => {
                //isOffDay 获取某天的状态（0-工作日，1-休息日，2-法定节假日，3-调休上班）
                const isOffDay = String(item.isOffDay)
                offDayMap[item.rq] = isOffDay
                if (isOffDay === '2') {
                  dateList.push(item.rq)
                }
              })
            })
          }
          // 与已加载年份的数据合并去重（响应式赋值驱动日历重绘禁选状态）
          if (dateList.length > 0) {
            const merged = new Set(this.disabledDateList)
            dateList.forEach((d) => merged.add(d))
            this.disabledDateList = Array.from(merged)
          }
          // 合并日期状态表（驱动跨周六提示显隐）
          this.calendarOffDayMap = Object.assign({}, this.calendarOffDayMap, offDayMap)
          this._disabledDateLoaded[nf] = true
          delete this._disabledDateLoading[nf]
        })
        .catch(() => {
          // 加载失败不写缓存，下次渲染到该年份可重试
          delete this._disabledDateLoading[nf]
        })
      this._disabledDateLoading[nf] = promise
      return promise
    },
    /**
     * 非年假：调用后端接口计算申请时长（小时）
     * GET 参数：no 工号、startTime 开始时间、endTime 结束时间，取返回值 result
     */
    setApplyHours(value) {
      this.$set(this.model, 'applyHours', value)
      this.calculatedApplyHours = value
      // 申请表嵌套在流程动态组件中，完成接口回调后主动刷新一次显示。
      this.$nextTick(() => this.$forceUpdate())
    },
    calcApplyHours() {
      // 只读模式（详情/审批）直接用后端返回值，不重新计算
      if (this.disabled) return
      // 按天抵扣（年假/加班调休）由 calcDayBasedTime 负责计算
      if (this.isDayBasedDeduct) return
      const { no, startTime, endTime } = this.model
      if (!no || !startTime || !endTime) {
        this.setApplyHours(null)
        return
      }
      const requestKey = [no, startTime, endTime].join('|')
      getAction(this.url.getApplyHours, { no, startTime, endTime })
        .then((res) => {
          // 同一组时间可能因日期控件 change + watcher 触发多次请求；
          // 只丢弃已经不是当前表单参数的旧请求，不能按请求序号丢弃同值请求。
          const currentKey = [this.model.no, this.model.startTime, this.model.endTime].join('|')
          if (requestKey !== currentKey) return
          // result 为 0 属于正常情况（如申请时段不在工作时间内），不能用真值判断
          if (res.success && res.result !== null && res.result !== undefined && res.result !== '') {
            this.setApplyHours(Number(res.result) || 0)
          } else {
            this.setApplyHours(null)
            this.$message.warning(res.message)
          }
        })
        .catch(() => {
          const currentKey = [this.model.no, this.model.startTime, this.model.endTime].join('|')
          if (requestKey !== currentKey) return
          this.setApplyHours(null)
          this.$message.error('申请时长计算失败，请检查后端服务是否正常')
        })
    },
    add() {
      this.edit(this.modelDefault)
    },
    /**
     * 判断节点是否为抄送节点
     * nodeProperties: 1=审批, 2=抄送
     */
    isCcNode(node) {
      return node && Number(node.nodeProperties) === 2
    },
    /**
     * 判断节点是否为 kjSprType 类型节点（users 为 null 时展示 chooseObjectsName）
     */
    isKjSprTypeNode(node) {
      if (!node) return false
      return node.users === null && node.chooseObjectsName
    },
    /**
     * 判断节点是否显示添加审批人按钮
     * isselfSelect 值为 1 或 sprScope 值为 4 时显示添加按钮
     */
    hasSprScope(node) {
      if (!node) return false
      return Number(node.isselfSelect) === 1 || Number(node.sprScope) === 4
    },
    /**
     * 判断节点是否为空级审批节点（直属主管/直属经理/直属总监，依据 kjSprType 判断）
     */
    isLeaderNode(node) {
      if (!node) return false
      const kjSprType = this.getNodeKjSprType(node)
      return kjSprType !== null && kjSprType !== undefined && kjSprType !== ''
    },
    /**
     * 获取节点的空级审批类型 kjSprType（优先取外层，兼容内层 customProcessNodeConfiguration）
     */
    getNodeKjSprType(node) {
      if (!node) return ''
      if (node.kjSprType != null && node.kjSprType !== '') return node.kjSprType
      const inner = node.customProcessNodeConfiguration
      return inner && inner.kjSprType != null && inner.kjSprType !== '' ? inner.kjSprType : ''
    },
    /**
     * 判断节点的审批人是否可编辑（可删除接口返回人员、可自选添加）
     */
    canEditApprovers(node) {
      return this.hasSprScope(node) || this.isLeaderNode(node)
    },
    /**
     * 从节点配置中提取默认人员列表（users / roles / departments 都合并显示）
     * @param {Object} node 节点
     * @param {boolean} isEdit 是否修改重申：为 true 时自选节点外层 chooseObjects 是
     * 上次提交选中的人员（后端按 sqdId 回填），需一并读出回显；新增时不读取
     */
    extractDefaultPersons(node, isEdit) {
      const list = []
      const addItems = (arr, idKey, nameKey) => {
        if (!Array.isArray(arr)) return
        arr.forEach((item) => {
          const ids = (item[idKey] || '').toString().split(',').filter(Boolean)
          const names = (item[nameKey] || '').toString().split(',').filter(Boolean)
          ids.forEach((id, idx) => {
            list.push({
              id: id.trim(),
              name: (names[idx] || id).trim(),
            })
          })
        })
      }
      addItems(node.users, 'chooseObjects', 'chooseObjectsName')
      addItems(node.roles, 'chooseObjects', 'chooseObjectsName')
      addItems(node.departments, 'chooseObjects', 'chooseObjectsName')
      // 节点外层 chooseObjects/chooseObjectsName 可能是多人逗号分隔：
      // - 空级审批节点（直属主管/直属经理/直属总监）：users 等数组为 null，这里是后端解析出的默认人员
      // - 修改重申时的自选节点（isselfSelect=1 / sprScope=4）：上次提交选中的人员，
      //   后端按 sqdId 回填到外层；新增时不读取，保持为空由用户重新选择
      const readOuterObjects = this.isLeaderNode(node) || (!!isEdit && this.hasSprScope(node))
      if (list.length === 0 && readOuterObjects) {
        const ids = (node.chooseObjects || '')
          .toString()
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
        const names = (node.chooseObjectsName || '')
          .toString()
          .split(',')
          .map((s) => s.trim())
        ids.forEach((id, idx) => {
          list.push({ id, name: names[idx] || id })
        })
      }
      // 去重
      const map = new Map()
      list.forEach((item) => {
        if (!map.has(item.id)) map.set(item.id, item)
      })
      return Array.from(map.values())
    },
    /**
     * 获取流程节点列表（新增/编辑模式调用，详情模式不调用）
     * @param {boolean} isEdit 是否为修改重申（编辑已存在的申请单）：0-否，1-是
     * @param {string|number} sqdId 当前申请单ID（修改重申时传入，新增时为空）
     */
    loadProcessNodes(isEdit, sqdId) {
      if (this.isDetail) {
        this.processNodeList = []
        this.nodeObjList = []
        return
      }
      const dept = this.model.dept || (this.perInfo && this.perInfo.dept) || ''
      if (!dept) {
        this.processNodeList = []
        this.nodeObjList = []
        return
      }
      const reqParams = {
        sqmkCode: this.isDeduct ? '假期抵扣申请' : '请假申请',
        dept: dept,
        no: this.perInfo.no,
        isEdit: isEdit ? 1 : 0,
      }
      // sqdId 为当前申请单ID，仅修改重申时有值；新增时无 id，不传该参数
      if (sqdId) reqParams.sqdId = sqdId
      getAction(this.url.getLcjdList, reqParams)
        .then((res) => {
          if (res.success && Array.isArray(res.result)) {
            // 按 px 排序
            const list = res.result.slice().sort((a, b) => Number(a.px) - Number(b.px))
            this.processNodeList = list
            // 初始化每个节点的 obj
            this.nodeObjList = list.map((node) => {
              const defaultPersons = this.extractDefaultPersons(node, isEdit)
              return {
                arr: defaultPersons,
                str: defaultPersons.map((p) => p.name).join(','),
              }
            })
          } else {
            this.processNodeList = []
            this.nodeObjList = []
            this.$message.warning(res.message || '没有匹配到审批模板')
          }
        })
        .catch(() => {
          this.processNodeList = []
          this.nodeObjList = []
        })
    },
    /** 将当前登录人的人员信息写入新申请模型。 */
    applyCurrentEmployeeInfo() {
      if (this.model.id) return
      const info = this.perInfo || {}
      this.model.name = info.name || this.model.name || ''
      this.model.no = info.no || this.model.no || ''
      this.model.companyId = info.companyId || this.model.companyId || ''
      this.model.dept = info.dept || this.model.dept || ''
      this.model.employeeId = info.id || this.model.employeeId || ''
    },
    /**
     * 登录后人员信息是异步缓存的。流程发起页可能早于缓存完成而打开，
     * 此时按登录用户名再查一次，保证申请时长接口拿得到工号。
     */
    loadCurrentEmployeeInfo() {
      const cached = Vue.ls.get('perInfo')
      this.perInfo = cached && !Array.isArray(cached) ? cached : {}
      this.applyCurrentEmployeeInfo()
      if (this.model.id || this.perInfo.no) return Promise.resolve(this.perInfo)

      const userInfo = Vue.ls.get(USER_INFO) || {}
      const no = userInfo.username || ''
      if (!no) return Promise.resolve(this.perInfo)
      // 登录账号在系统中就是员工工号时，即使员工档案补查尚未返回，也先保证计算接口有工号。
      this.model.no = this.model.no || no

      return getAction('/hrm/hrEmployeeInformation/list', { no })
        .then((res) => {
          const records =
            res && res.success && res.result && Array.isArray(res.result.records) ? res.result.records : []
          if (records.length > 0) {
            this.perInfo = records[0]
            Vue.ls.set('perInfo', this.perInfo, 7 * 24 * 60 * 60 * 1000)
            this.applyCurrentEmployeeInfo()
          }
          return this.perInfo
        })
        .catch(() => this.perInfo)
    },
    /** 初始化或日期/员工信息变化后，统一触发对应的时长计算。 */
    recalculateDuration() {
      if (this.isDayBasedDeduct) {
        this.calcDayBasedTime()
      } else {
        this.calcApplyHours()
      }
    },
    edit(record) {
      this.model = Object.assign({ includeSaturday: 0, applyHours: null, applyDays: null }, record)
      this.calculatedApplyHours =
        this.model.applyHours === null || this.model.applyHours === undefined ? null : Number(this.model.applyHours)

      // 年假跨周六是否计入天数（0-否，1-是），默认 0；兼容后端返回字符串 "1"
      this.model.includeSaturday = Number(this.model.includeSaturday) === 1 ? 1 : 0

      // 非审批模式重置审批数据
      if (!this.OK_show) {
        this.spdata = { bz: '', spr: '' }
      }

      this.processNodeList = []
      this.nodeObjList = []

      this.perInfo = Vue.ls.get('perInfo') || {}
      this.applyCurrentEmployeeInfo()

      // 加载动态流程节点
      // 有 id 且非审批场景 = 修改重申（isEdit=1）；新增（modelDefault 无 id）、审批模式传 0
      // sqdId 取当前申请单 id（新增时无 id，不传该参数）
      const isEdit = !!this.model.id && !this.OK_show
      this.loadProcessNodes(isEdit, this.model.id)
      this.recalculateDuration()

      // 新流程首次打开时，perInfo 可能还没有被登录流程写入缓存。
      if (!this.model.id && !this.perInfo.no) {
        this.loadCurrentEmployeeInfo().then(() => {
          this.loadProcessNodes(false)
          this.recalculateDuration()
        })
      }

      // 加载法定节假日禁选日期（默认当前年；编辑回显时补加载已选日期所在年份）
      // 详情模式日期控件禁用，无需请求节假日日历接口
      if (!this.isDetail) {
        this.loadDisabledDateList()
        if (this.model.startTime) {
          this.loadDisabledDateList(moment(this.model.startTime).year())
        }
        // 年假回显时预加载起止区间覆盖年份的日历数据，用于跨周六提示（详情页不会打开日期面板）
        if (this.isAnnualLeave && this.model.startTime && this.model.endTime) {
          this.ensureCalendarRangeLoaded(this.model.startTime, this.model.endTime)
        }
      }

      // 编辑时，按天抵扣（年假/加班调休）且有工号，加载对应剩余天数
      if (this.isDayBasedDeduct && this.model.no) {
        // 只读模式（详情/审批）不展示剩余天数，无需请求余额/打卡时段接口
        if (!this.disabled) {
          if (this.isAnnualLeave) {
            this.loadAnnualLeaveBalance(this.model.no)
          } else {
            this.loadOtRemainBalance(this.model.no)
          }
          // 上下午下拉选项详情页直接回显已存值，无需请求打卡时段接口
          // 选项是异步加载的，加载完再试算一次，否则回显时 getClockBySjd 取不到打卡时间，applyDays 会被置 0
          this.loadGddatedkOptions(this.model.no).then(() => {
            this.calcDayBasedTime()
          })
        }
        // 抵扣事假：详情模式也需加载事假单列表，用于回显已选事假单及源请假信息
        if (this.isDeduct) {
          this.loadLeaveOrderList(this.model.no)
        }
      }

      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
    },
    submitForm() {
      const that = this
      this.$refs.form.validate((valid) => {
        if (valid) {
          // 按天抵扣：开始/结束上下午时段必选（未选时抵扣天数会被置 0，需先于天数校验）
          if (this.isDayBasedDeduct && !this.model.startAmPm) {
            this.$message.warning('请选择开始时间点！')
            return
          }
          if (this.isDayBasedDeduct && !this.model.endAmPm) {
            this.$message.warning('请选择结束时间点')
            return
          }
          const applyDuration = this.isDayBasedDeduct ? this.model.applyDays : this.model.applyHours
          if (this.isDayBasedDeduct && applyDuration < 0.5) {
            this.$message.warning('请假天数必须大于等于 0.5 天!')
            return
          }
          // 非按天抵扣：申请时长（小时）必须大于 0
          if (!this.isDayBasedDeduct && (!applyDuration || Number(applyDuration) <= 0)) {
            this.$message.warning('申请时长必须大于0！')
            return
          }
          // 年假：申请天数超过剩余年假天数时不允许提交
          if (this.isAnnualLeave && this.showAnnualLeaveTip) {
            this.$message.warning('剩余年假不足，不允许提交！')
            return
          }
          // 加班调休：不足 0.5 天或申请天数超过可用天数时不允许提交（后端提交时还会再次强校验）
          if (this.isOtDeduct) {
            const usableDays = Number(this.otRemainInfo.usableDays) || 0
            if (this.otRemainInfo.enough === false) {
              this.$message.warning('剩余加班调休不足，不允许提交！')
              return
            }
            if (Number(applyDuration) > usableDays) {
              this.$message.warning(`剩余加班调休不足，当前剩余${usableDays}天`)
              return
            }
          }
          // 审批节点为空时不允许提交（审批场景 OK_show 不校验流程节点）
          if (!this.OK_show && this.processNodeList.length === 0) {
            this.$message.warning('未匹配到审批流程节点，不允许提交！')
            return
          }
          // 校验每个需要选择审批人的节点是否选择了人员
          let allValid = true
          this.processNodeList.forEach((node, idx) => {
            if (this.canEditApprovers(node) && this.nodeObjList[idx] && this.nodeObjList[idx].arr.length === 0) {
              this.$message.warning(`请选择「${node.nodeName}」的${this.isCcNode(node) ? '抄送' : '审批'}人`)
              allValid = false
            }
          })
          if (!allValid) return

          this.$emit('submit', true)
          let httpurl = ''
          let method = ''
          if (this.isDeduct) {
            if (this.model.id) {
              httpurl = '/hrHolidayDeduct/hrHolidayDeduct/resubmit'
            } else {
              httpurl = '/hrHolidayDeduct/hrHolidayDeduct/add'
            }

            method = 'post'
          } else if (this.isAnnualLeave) {
            httpurl = this.url.annualLeaveApplication
            method = 'post'
          } else {
            if (!this.model.id) {
              httpurl += this.url.add
              method = 'post'
            } else {
              httpurl += this.url.edit
              method = 'put'
            }
          }

          // 组装 customProcessConfigurationDTOList：将接口返回的节点数据深拷贝后放入
          // 对于 isselfSelect===1 或 sprScope===4 的节点，将选中的审批人数据写到节点外层
          const customProcessConfigurationDTOList = this.processNodeList.map((node, idx) => {
            const nodeCopy = JSON.parse(JSON.stringify(node))
            if (this.canEditApprovers(node) && this.nodeObjList[idx]) {
              const selectedPersons = this.nodeObjList[idx].arr
              if (selectedPersons && selectedPersons.length > 0) {
                nodeCopy.chooseObjects = selectedPersons.map((p) => p.id).join(',')
                nodeCopy.chooseObjectsName = selectedPersons.map((p) => p.name).join(',')
                nodeCopy.sprScopeName = node.nodeName || ''
              }
            }
            return nodeCopy
          })
          this.model['customProcessConfigurationDTOList'] = customProcessConfigurationDTOList

          // 按天抵扣：startAmPm/endAmPm 存的是时段类型 sjd，提交时按 sjd 反查打卡时间拼接完整日期时间
          let submitStartTime = this.model.startTime
          let submitEndTime = this.model.endTime
          if (this.isDayBasedDeduct) {
            submitStartTime = `${this.model.startTime} ${this.getClockBySjd(
              this.startTimeOptions,
              this.model.startAmPm
            )}:00`
            submitEndTime = `${this.model.endTime} ${this.getClockBySjd(this.endTimeOptions, this.model.endAmPm)}:00`
          }

          // ===== 真实接口调用（接入时取消注释） =====
          httpAction(
            httpurl,
            Object.assign(this.model, {
              startTime: submitStartTime,
              endTime: submitEndTime,
            }),
            method
          )
            .then((res) => {
              if (res.success) {
                if (!that.model.id && res.result) {
                  that.model.id = res.result
                }
                that.$message.success(res.message)
                // 返回已保存的业务对象，流程发起页需要使用其中的 id 关联 Flowable 业务记录。
                that.$emit('ok', JSON.parse(JSON.stringify(that.model)))
              } else {
                that.$message.warning(res.message)
              }
            })
            .finally(() => {
              this.$emit('submit', false)
            })
          // ===== 真实接口结束 =====
        }
      })
    },
    handleSelectValue(index, value, rows) {
      if (this.nodeObjList[index]) {
        // 将新选择的人员追加到现有列表中，按 id 去重
        const existingArr = this.nodeObjList[index].arr || []
        const map = new Map()
        existingArr.forEach((item) => map.set(item.id, item))
        rows.forEach((item) => {
          if (!map.has(item.id)) {
            map.set(item.id, item)
          }
        })
        const mergedArr = Array.from(map.values())
        this.nodeObjList[index].arr = mergedArr
        this.nodeObjList[index].str = mergedArr.map((p) => p.name).join(',')
      }
    },
    handleEmployeeTagClose(event, index, id) {
      if (event && event.preventDefault) {
        event.preventDefault()
      }
      if (this.nodeObjList[index]) {
        this.nodeObjList[index].arr = this.nodeObjList[index].arr.filter((item) => item.id != id)
        this.nodeObjList[index].str = this.nodeObjList[index].arr.map((item) => item.name).join(',')
      }
    },

    /**
     * 获取头像文字（取最后一个汉字/字符）
     */
    getAvatarText(name) {
      if (!name) return '?'
      const trimmed = String(name).trim()
      return trimmed.charAt(trimmed.length - 1).toUpperCase()
    },
  },
}
</script>

<style scoped lang="less">
/* 表单根：j-form-container 的 fieldset 不是 flex 容器，故以 height:100%
   承接 fieldset 的确定高度，再由自身向下建立 flex 列 */
.leave-apply-form {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* ===== 全局表单项紧致 ===== */
.leave-apply-form /deep/ .ant-form-item {
  margin-bottom: 8px;
}

.leave-apply-form /deep/ .ant-form-item-label {
  padding-bottom: 2px;
  line-height: 20px;
}

.leave-apply-form /deep/ .ant-form-item-label > label {
  color: #555;
  font-size: 13px;
}

.leave-apply-form /deep/ .ant-form-item-required::before {
  color: #ff4d4f;
  font-size: 14px;
  margin-right: 2px;
}

/* ===== 左右两栏布局 =====
   桌面端必须 nowrap：wrap 会让 flex 行给子列的拉伸高度变为“不确定”，
   右列 flex:1 的滚动区将无法收敛高度、按内容撑高导致不能滚动；
   移动端(<768px)在下面媒体查询里改回 wrap，使两栏上下堆叠 */
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

.timeline-node {
  position: relative;
  padding-left: 22px;
  padding-bottom: 16px;
}

.timeline-node:last-child {
  padding-bottom: 0;
}

.timeline-node:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 12px;
  bottom: -4px;
  width: 2px;
  background: #e6e8eb;
  border-radius: 1px;
}

.timeline-dot {
  position: absolute;
  left: 0;
  top: 12px;
  width: 12px;
  height: 12px;
  border: 2px solid #4a7bf7;
  background: #fff;
  border-radius: 50%;
  z-index: 1;
}

.timeline-dot-light {
  border-color: #c7d0e4;
  background: #fff;
}

.timeline-card {
  background: #f0f4fb;
  border: 1px solid #e3e9f5;
  border-radius: 8px;
  padding: 12px 14px;
}

.timeline-card-title {
  margin-bottom: 10px;
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.timeline-card-title .node-rule-tag {
  margin: 0;
  font-size: 11px;
  line-height: 18px;
  height: 18px;
  padding: 0 6px;
}

.approver-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

/* 审批人 tag 样式 */
.approver-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 0 8px 0 4px;
  height: 28px;
  border: 1px solid #d6e0f5;
  border-radius: 14px;
  background: #fff;
  color: #1f2937;
  font-size: 13px;
  line-height: 26px;
}

.approver-tag /deep/ .anticon-close {
  color: #b3b8c2;
  margin-left: 0;
}

.approver-tag /deep/ .anticon-close:hover {
  color: #ff4d4f;
}

.approver-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #4a7bf7;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
}

.approver-name {
  color: #1f2937;
  font-size: 13px;
}

.kj-spr-type-text {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 14px;
  border: 1px solid #d6e0f5;
  border-radius: 14px;
  background: #fff;
  color: #1f2937;
  font-size: 13px;
  line-height: 26px;
}

/* 添加审批人按钮样式（覆盖 JSelectEmployee 默认） */
.approver-line /deep/ .j-select-employee-button-only,
.approver-line /deep/ .j-select-approver-button-only {
  display: inline-flex;
  width: auto;
  flex: none;
}

.approver-line /deep/ .j-select-employee-button-only .ant-btn,
.approver-line /deep/ .j-select-approver-button-only .ant-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 28px;
  padding: 0 12px;
  border: 1px dashed #4a7bf7;
  border-radius: 14px;
  background: #fff;
  color: #4a7bf7;
  font-size: 13px;
  font-weight: 400;
  line-height: 1;
  box-shadow: none;
}

.approver-line /deep/ .j-select-employee-button-only .ant-btn::before,
.approver-line /deep/ .j-select-approver-button-only .ant-btn::before {
  content: '+';
  display: inline-block;
  font-size: 14px;
  font-weight: 600;
  margin-right: 2px;
  line-height: 1;
  position: relative;
}

.approver-line /deep/ .j-select-employee-button-only .ant-btn:hover,
.approver-line /deep/ .j-select-employee-button-only .ant-btn:focus,
.approver-line /deep/ .j-select-approver-button-only .ant-btn:hover,
.approver-line /deep/ .j-select-approver-button-only .ant-btn:focus {
  border-color: #2d5fe0;
  color: #2d5fe0;
  background: #f5f8ff;
}

.multi-approval-line {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px dashed #e3e9f5;
}

.multi-approval-label {
  color: #6b7280;
  font-size: 13px;
  white-space: nowrap;
}

.multi-approval-line /deep/ .ant-radio-wrapper {
  font-size: 13px;
  color: #1f2937;
}

.multi-approval-line /deep/ .ant-radio-wrapper-checked .ant-radio-checked .ant-radio-inner {
  border-color: #4a7bf7;
  background: #4a7bf7;
}

.multi-approval-line /deep/ .ant-radio-inner::after {
  background: #fff;
}

.apply-days-row {
  display: flex;
  align-items: center;
}

.apply-days-row .ant-input {
  flex: 1;
}

.apply-hours-tip {
  flex-shrink: 0;
  margin-left: 8px;
  color: #ff4d4f;
  font-size: 12px;
  line-height: 1.5;
  white-space: nowrap;
}

/* ===== 年假跨周六（大小周）提示 ===== */
.cross-saturday-alert {
  margin-top: 8px;
  margin-bottom: 0;
  padding: 4px 12px;
}

.cross-saturday-alert /deep/ .ant-alert-message {
  line-height: 24px;
}

.cross-saturday-alert /deep/ .ant-checkbox-wrapper {
  color: #1f2937;
  font-size: 13px;
}

.cross-saturday-hint {
  margin-left: 8px;
  color: #8c6d1f;
  font-size: 12px;
}

/* ===== 源请假信息框（选择事假单后显示） ===== */
.source-info-box {
  margin-bottom: 8px;
  padding: 6px 10px;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.source-info-title {
  margin-bottom: 4px;
  color: #909399;
  font-size: 12px;
  font-weight: 500;
}

.source-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  font-size: 12px;
}

.source-info-label {
  color: #909399;
}

.source-info-value {
  color: #303133;
  font-weight: 500;
}

/* 日期 + 上下午选择布局 */
.time-picker-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.time-picker-wrapper .ampm-select {
  flex: 0 0 90px;
  min-width: 90px;
}

/* 只读年假模式：完整时间输入框占满整行（不再搭配日期控件） */
.time-picker-wrapper .ampm-readonly {
  flex: 1;
  min-width: 0;
}
</style>

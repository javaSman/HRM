<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model
        ref="form"
        slot="detail"
        layout="vertical"
        :model="model"
        :rules="validatorRules"
        class="attendance-rule-form"
      >
        <a-row type="flex" class="form-layout-row">
          <!-- 左侧：基础信息 + 规则绑定 -->
          <a-col flex="300px" class="form-left-col">
            <section class="rule-form-section">
              <div class="rule-form-section-title">基础信息</div>
              <a-row :gutter="16">
                <a-col :span="24">
                  <a-form-model-item label="规则名称" prop="ruleName">
                    <j-dict-select-tag
                      v-model="model.ruleName"
                      dictCode="rule_name"
                      allowClear
                      placeholder="请选择规则名称"
                    />
                  </a-form-model-item>
                </a-col>
                <!-- <a-col :span="24">
                  <a-form-model-item label="规则编码" prop="ruleCode">
                    <a-input v-model.trim="model.ruleCode" placeholder="请输入规则编码" />
                  </a-form-model-item>
                </a-col>
                <a-col :span="24">
                  <a-form-model-item label="规则状态" prop="status">
                    <j-dict-select-tag type="list" v-model="model.status" dictCode="hrm_status" placeholder="请选择规则状态" />
                  </a-form-model-item>
                </a-col> -->
                <a-col :span="24">
                  <a-form-model-item label="规则说明" prop="ruleSm">
                    <a-textarea
                      v-model.trim="model.ruleSm"
                      :autoSize="{ minRows: 3, maxRows: 6 }"
                      placeholder="请输入规则说明"
                    />
                  </a-form-model-item>
                </a-col>
              </a-row>
            </section>

            <section class="rule-form-section">
              <div class="rule-form-section-header">
                <div>
                  <div class="rule-form-section-title">规则绑定</div>
                  <div class="rule-form-hint">规则优先级：人员规则>岗位规则>组织规则；未命中时按默认规则执行</div>
                </div>
              </div>
              <a-row :gutter="16">
                <a-col :span="24">
                  <a-form-model-item>
                    <a-button
                      v-if="!formDisabled"
                      type="primary"
                      ghost
                      icon="plus"
                      @click="openScopeModal"
                      style="width: 100%"
                      >添加规则</a-button
                    >
                  </a-form-model-item>
                  <div class="scope-selection-summary">
                    <div class="scope-selection-row">
                      <span class="scope-selection-label">绑定组织</span>
                      <div class="selected-tag-wrap">
                        <a-tag
                          v-for="item in selectedOrgTags"
                          :key="item.value"
                          color="blue"
                          :closable="!formDisabled"
                          @close="removeOrgTag(item.value)"
                        >
                          {{ item.label }}
                        </a-tag>
                        <span v-if="!model.bdbm.length" class="empty-inline">暂未绑定组织</span>
                        <span v-else-if="!selectedOrgTags.length" class="empty-inline">
                          已绑定 {{ model.bdbm.length }} 个组织
                        </span>
                      </div>
                    </div>
                    <div class="scope-selection-row">
                      <span class="scope-selection-label">绑定岗位</span>
                      <div class="selected-tag-wrap">
                        <a-tag
                          v-for="item in selectedPositionTags"
                          :key="item.value"
                          color="cyan"
                          :closable="!formDisabled"
                          @close="removePositionTag(item.value)"
                        >
                          {{ item.label }}
                        </a-tag>
                        <span v-if="!model.bdgw.length" class="empty-inline">暂未绑定岗位</span>
                        <span v-else-if="!selectedPositionTags.length" class="empty-inline">
                          已绑定 {{ model.bdgw.length }} 个岗位
                        </span>
                      </div>
                    </div>
                    <div class="scope-selection-row">
                      <span class="scope-selection-label">绑定员工</span>
                      <div class="selected-tag-wrap">
                        <a-tag
                          v-for="item in selectedEmployeeTags"
                          :key="item.value"
                          color="purple"
                          :closable="!formDisabled"
                          @close="removeEmployeeTag(item.value)"
                        >
                          {{ item.label }}
                        </a-tag>
                        <span v-if="!model.bdry.length" class="empty-inline">暂未绑定员工</span>
                        <span v-else-if="!selectedEmployeeTags.length" class="empty-inline">
                          已绑定 {{ model.bdry.length }} 名员工
                        </span>
                      </div>
                    </div>
                  </div>
                </a-col>
              </a-row>
            </section>
          </a-col>

          <a-col flex="20px"> </a-col>

          <!-- 右侧：打卡方式 + 配置 -->
          <a-col flex="1" class="form-right-col">
            <section class="rule-form-section" style="display: flex; align-items: center; gap: 10px">
              <div class="rule-form-section-title">打卡方式</div>
              <a-form-model-item prop="dkfs">
                <a-radio-group v-model="model.dkfs" buttonStyle="solid" @change="handleCheckinTypeChange">
                  <a-radio-button v-for="item in checkinTypeOptions" :key="item.value" :value="item.value">
                    {{ item.label }}
                  </a-radio-button>
                </a-radio-group>
              </a-form-model-item>
            </section>

            <!-- 固定打卡 -->
            <section v-if="model.dkfs == '0' || model.dkfs == '3'" class="rule-form-section">
              <div class="rule-form-section-header">
                <div>
                  <div class="rule-form-section-title">上下班时间配置</div>
                  <div class="rule-form-hint">支持多段配置，时间段不可重叠</div>
                </div>
                <a-button v-if="model.dkfs != '3' && !formDisabled" type="link" icon="plus" @click="addTimePeriod"
                  >添加时间段</a-button
                >
              </div>

              <div class="time-period-header">
                <span class="time-period-label" style="color: #494949; width: 80px">跨夜时段</span>
                <div class="time-period-inputs">
                  <j-time v-model="model.kyksdate" dateFormat="HH:mm" style="width: 120px" />
                  <span class="time-period-separator">至次日</span>
                  <j-time v-model="model.kyjsdate" dateFormat="HH:mm" style="width: 120px" />
                </div>
                <span class="time-period-label" style="color: #494949">是否早退容差</span>
                <j-switch v-model="model.enableLeaveEarlyAdvance" :options="['Y', 'N']" />
                <template v-if="model.enableLeaveEarlyAdvance === 'Y'">
                  <span class="time-period-label" style="color: #494949">早退容差</span>
                  <div class="input-group">
                    <a-input-number v-model="model.leaveEarlyAdvance" :min="0" :precision="0" style="width: 80px" />
                    <span class="input-addon-text">分钟</span>
                  </div>
                </template>
              </div>

              <div class="time-period-header">
                <span class="time-period-label" style="color: #494949; width: 140px">是否26天10小时制人员</span>
                <a-radio-group v-model="model.is26dayFlag">
                  <a-radio value="1">是</a-radio>
                  <a-radio value="0">否</a-radio>
                </a-radio-group>
              </div>

              <div class="time-period-list">
                <div v-for="(period, index) in model.hrKqRuleGddatedk.sjd" :key="index" class="time-period-card">
                  <div class="time-period-header">
                    <span class="time-period-label">时间段 {{ index + 1 }}</span>

                    <j-dict-select-tag
                      v-model="period.sjd"
                      dictCode="timetype"
                      allowClear
                      style="width: 120px"
                      placeholder="请选择时段类型"
                    />
                    <div class="time-period-inputs">
                      <j-time v-model="period.sbdaate" dateFormat="HH:mm" style="width: 120px" />
                      <span class="time-period-separator">至</span>
                      <j-time v-model="period.xbdate" dateFormat="HH:mm" style="width: 120px" />
                    </div>
                    <a-button
                      style="color: red"
                      v-if="!formDisabled && model.hrKqRuleGddatedk.sjd.length > 1"
                      type="link"
                      size="small"
                      icon="delete"
                      @click="removeTimePeriod(index)"
                    >
                      删除
                    </a-button>
                  </div>
                  <a-row :gutter="16" class="time-period-config">
                    <a-col :xs="24" :sm="12" :md="6">
                      <a-form-model-item label="上班前有效时长">
                        <div class="input-group">
                          <a-input-number v-model="period.sbqyxsc" :min="0" :precision="0" style="width: 120px" />
                          <span class="input-addon-text">分钟</span>
                        </div>
                      </a-form-model-item>
                    </a-col>
                    <a-col :xs="24" :sm="12" :md="6">
                      <a-form-model-item label="下班后有效时长">
                        <div class="input-group">
                          <a-input-number v-model="period.xbhyxsc" :min="0" :precision="0" style="width: 120px" />
                          <span class="input-addon-text">分钟</span>
                        </div>
                      </a-form-model-item>
                    </a-col>
                    <a-col :xs="24" :sm="12" :md="6">
                      <a-form-model-item label="迟到判定宽限">
                        <div class="input-group">
                          <a-input-number v-model="period.cdpd" :min="0" :precision="0" style="width: 120px" />
                          <span class="input-addon-text">分钟后算迟到</span>
                        </div>
                      </a-form-model-item>
                    </a-col>
                    <a-col :xs="24" :sm="12" :md="6">
                      <a-form-model-item label="早退判定提前量">
                        <div class="input-group">
                          <a-input-number v-model="period.ztpd" :min="0" :precision="0" style="width: 120px" />
                          <span class="input-addon-text">分钟前算早退</span>
                        </div>
                      </a-form-model-item>
                    </a-col>
                  </a-row>
                </div>
              </div>
            </section>
            <section v-if="model.dkfs == '0' || model.dkfs == '3'" class="rule-form-section">
              <div class="rule-form-section-header">
                <div>
                  <div class="rule-form-section-title">旷工时间配置</div>
                </div>
              </div>
              <div class="time-period-header">
                <span class="time-period-label" style="color: #494949; width: 80px">旷工时长</span>
                <div class="input-group" style="width: 150px">
                  <a-input-number v-model="model.absenteeHour" :min="0" :step="1" style="flex: 1" />
                  <span class="input-addon-text">小时</span>
                </div>
              </div>
              <div>
                <a-alert message="当日缺勤时长超过该设定小时数,系统判定为旷工。" type="info" show-icon />
              </div>
            </section>
            <section v-if="model.dkfs == '0' || model.dkfs == '3'" class="rule-form-section sectionColor">
              <div class="rule-form-section-header">
                <div>
                  <div class="rule-form-section-title">加班时间配置</div>
                </div>
              </div>
              <a-row :gutter="16">
                <a-col :xs="24" :sm="6">
                  <a-form-model-item label="加班开始时间">
                    <div class="input-group">
                      <j-time v-model="model.startoutTime" dateFormat="HH:mm" style="flex: 1" />
                    </div>
                  </a-form-model-item>
                </a-col>
                <a-col :xs="24" :sm="6">
                  <a-form-model-item label="最小加班时长">
                    <div class="input-group">
                      <a-input-number v-model="model.minoutTime" :min="0" :step="1" style="flex: 1" />
                      <span class="input-addon-text">分钟</span>
                    </div>
                  </a-form-model-item>
                </a-col>
                <a-col :xs="24" :sm="6">
                  <a-form-model-item label="加班系数">
                    <j-dict-select-tag
                      v-model="model.multiple"
                      dictCode="overtime_multiple"
                      allowClear
                      placeholder="请选择加班系数"
                    />
                  </a-form-model-item>
                </a-col>
                <a-col :xs="24" :sm="6">
                  <a-form-model-item label="加班计算方式">
                    <j-dict-select-tag
                      v-model="model.checkType"
                      dictCode="overtime_check"
                      allowClear
                      placeholder="请选择加班核算方式"
                    />
                  </a-form-model-item>
                </a-col>
                <a-col :xs="24" :sm="6">
                  <a-form-model-item label="加班核算方式">
                    <j-dict-select-tag
                      v-model="model.otCalcMthd"
                      dictCode="hrm_ot_calc_mthd "
                      allowClear
                      placeholder="请选择加班核算方式"
                    />
                  </a-form-model-item>
                </a-col>
              </a-row>
              <div>
                <a-alert message="下班打卡时间超过加班开始时间后，超出部分按加班规则核算。" banner />
              </div>
            </section>

            <!-- 自由打卡 -->
            <section v-if="model.dkfs == '1'" class="rule-form-section">
              <div class="rule-form-section-title">自由打卡规则配置</div>
              <a-row :gutter="16">
                <a-col :xs="24" :sm="8">
                  <a-form-model-item label="最少打卡次数">
                    <div class="input-group">
                      <a-input-number v-model="model.hrKqRuleZydatedk.zsdkcs" :min="2" :precision="0" style="flex: 1" />
                      <span class="input-addon-text">次</span>
                    </div>
                  </a-form-model-item>
                </a-col>
                <a-col :xs="24" :sm="8">
                  <a-form-model-item label="打卡间隔要求">
                    <div class="input-group">
                      <a-input-number v-model="model.hrKqRuleZydatedk.dkjgyq" :min="0" :step="0.5" style="flex: 1" />
                      <span class="input-addon-text">小时</span>
                    </div>
                  </a-form-model-item>
                </a-col>
                <a-col :xs="24" :sm="8">
                  <a-form-model-item label="当日最低打卡时长">
                    <div class="input-group">
                      <a-input-number v-model="model.hrKqRuleZydatedk.drzddksc" :min="0" :step="0.5" style="flex: 1" />
                      <span class="input-addon-text">小时</span>
                    </div>
                  </a-form-model-item>
                </a-col>
              </a-row>
            </section>

            <!-- 总时长打卡 -->
            <section v-if="model.dkfs == '2'" class="rule-form-section">
              <div class="rule-form-section-title">总时长打卡规则配置</div>
              <a-row :gutter="16">
                <a-col :xs="24" :sm="12">
                  <a-form-model-item label="上班前有效时长">
                    <div class="input-group">
                      <a-input-number v-model="model.hrKqRuleZscdk.sbqyxsc" :min="0" :precision="0" style="flex: 1" />
                      <span class="input-addon-text">分钟</span>
                    </div>
                  </a-form-model-item>
                </a-col>
                <a-col :xs="24" :sm="12">
                  <a-form-model-item label="下班后有效时长">
                    <div class="input-group">
                      <a-input-number v-model="model.hrKqRuleZscdk.xbhyxsc" :min="0" :precision="0" style="flex: 1" />
                      <span class="input-addon-text">分钟</span>
                    </div>
                  </a-form-model-item>
                </a-col>
                <a-col :xs="24" :sm="12">
                  <a-form-model-item label="当日最低工作时长">
                    <div class="input-group">
                      <a-input-number v-model="model.hrKqRuleZscdk.drzdgzsc" :min="0" :step="0.5" style="flex: 1" />
                      <span class="input-addon-text">小时</span>
                    </div>
                  </a-form-model-item>
                </a-col>
              </a-row>
            </section>
          </a-col>
        </a-row>
      </a-form-model>
    </j-form-container>

    <!-- 人员范围选择弹窗：点击“人员范围-添加”打开，统一处理组织和岗位绑定。 -->
    <hr-kq-rule-scope-modal ref="scopeModal" @ok="handleScopeModalOk" />
  </a-spin>
</template>

<script>
import { httpAction } from '@/api/manage'
import HrKqRuleScopeModal from './HrKqRuleScopeModal.vue'
import JDictSelectTag from '../../../../components/dict/JDictSelectTag.vue'

const CHECKIN_TYPE_OPTIONS = [
  { label: '固定时间打卡', value: '0', ObjectKey: 'hrKqRuleGddatedk' },
  { label: '自由打卡', value: '1', ObjectKey: 'hrKqRuleZydatedk' },
  { label: '免打卡', value: '3', ObjectKey: 'hrKqRuleGddatedk' },
  { label: '总时长打卡', value: '2', ObjectKey: 'hrKqRuleZscdk' },
]

function cloneDeep(value) {
  return JSON.parse(JSON.stringify(value || {}))
}

function createDefaultModel() {
  return {
    startoutTime: '18:30',
    minoutTime: 30,
    multiple: '1',
    checkType: '1',
    otCalcMthd: '1',
    absenteeHour: 1,

    kyksdate: '08:00',
    kyjsdate: '12:00',

    enableLeaveEarlyAdvance: 'N',
    leaveEarlyAdvance: 0,

    is26dayFlag: '0',

    id: undefined,
    ruleName: '',
    ruleCode: '',
    ruleSm: '',
    isDefault: '0',
    status: '1',
    yxj: '1',
    dkfs: '0',
    bdbm: [],
    bdgw: [],
    bdry: [],
    hrKqRuleGddatedk: {
      sjd: [{ sbdaate: '08:00', xbdate: '12:00', sjd: 'morning' }],
      sbqyxsc: 60,
      xbhyxsc: 60,
      cdpd: 1,
      ztpd: 1,
    },
    hrKqRuleZydatedk: {
      zsdkcs: 2,
      dkjgyq: 4,
      drzddksc: 8,
    },
    hrKqRuleZscdk: {
      sbqyxsc: 60,
      xbhyxsc: 60,
      drzdgzsc: 8,
    },
  }
}

function normalizeRuleConfigModel(model) {
  const defaultModel = createDefaultModel()
  const fixedConfig = Object.assign(
    {},
    cloneDeep(defaultModel.hrKqRuleGddatedk),
    cloneDeep(model.hrKqRuleGddatedk || {})
  )
  if (!Array.isArray(fixedConfig.sjd) || !fixedConfig.sjd.length) {
    fixedConfig.sjd = cloneDeep(defaultModel.hrKqRuleGddatedk.sjd)
  }

  return Object.assign({}, model, {
    hrKqRuleGddatedk: fixedConfig,
    hrKqRuleZydatedk: Object.assign(
      {},
      cloneDeep(defaultModel.hrKqRuleZydatedk),
      cloneDeep(model.hrKqRuleZydatedk || {})
    ),
    hrKqRuleZscdk: Object.assign({}, cloneDeep(defaultModel.hrKqRuleZscdk), cloneDeep(model.hrKqRuleZscdk || {})),
  })
}

export default {
  name: 'HrKqRuleForm',
  components: {
    HrKqRuleScopeModal,
    JDictSelectTag,
  },
  props: {
    // 表单禁用
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
    normal: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  data() {
    return {
      model: createDefaultModel(),
      modelDefault: createDefaultModel(),
      scopeSelection: {
        orgs: [],
        positions: [],
        employees: [],
      },
      confirmLoading: false,
      validatorRules: {
        ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
        status: [{ required: true, message: '请选择规则状态', trigger: 'change' }],
        dkfs: [{ required: true, message: '请选择打卡方式', trigger: 'change' }],
      },
      url: {
        add: '/hrm/hrKqRule/saveMain',
        edit: '/hrm/hrKqRule/editMain',
      },
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
    checkinTypeOptions() {
      return CHECKIN_TYPE_OPTIONS
    },

    selectedOrgTags() {
      const selected = this.model.bdbm
      return this.scopeSelection.orgs.filter((item) => selected.indexOf(String(item.value)) > -1)
    },
    selectedPositionTags() {
      const selected = this.model.bdgw
      return this.scopeSelection.positions.filter((item) => selected.indexOf(String(item.value)) > -1)
    },
    selectedEmployeeTags() {
      const selected = this.model.bdry
      return this.scopeSelection.employees.filter((item) => selected.indexOf(String(item.value)) > -1)
    },
  },
  created() {
    this.modelDefault = createDefaultModel()
  },
  methods: {
    getCurrentCheckinType(value) {
      return CHECKIN_TYPE_OPTIONS.find((item) => String(item.value) === String(value))
    },
    // 初始化新增表单。
    add() {
      this.edit(this.modelDefault)
    },
    // 加载规则记录并清除表单校验状态。
    edit(record) {
      const model = Object.assign(createDefaultModel(), record)
      const currentType = this.getCurrentCheckinType(model.dkfs)
      const currentTypeObjectKey = currentType && currentType.ObjectKey
      if (record.id) {
        if (currentTypeObjectKey === 'hrKqRuleGddatedk') {
          let obj = {
            sjd: [],
          }
          let arr = record[currentTypeObjectKey] || []
          arr.forEach((item) => {
            obj.sjd.push(item)
          })
          if (arr.length <= 0) {
            model['startoutTime'] = '18:30'
            model['minoutTime'] = 30
            model['multiple'] = '1'
            model['checkType'] = '1'
            model['otCalcMthd'] = '1'
            model['absenteeHour'] = 1
          } else {
            model['startoutTime'] = arr[0].startoutTime
            model['minoutTime'] = arr[0].minoutTime
            model['multiple'] = arr[0].multiple
            model['checkType'] = arr[0].checkType
            model['otCalcMthd'] = arr[0].otCalcMthd
            model['absenteeHour'] = arr[0].absenteeHour
          }

          model[currentTypeObjectKey] = obj
        } else if (currentTypeObjectKey) {
          model[currentTypeObjectKey] = record[currentTypeObjectKey]
        }

        model.bdbm = []
        if (record.bdbm) {
          model.bdbm = record.bdbm.split(',')
        }

        model.bdgw = []
        if (record.bdgw) {
          model.bdgw = record.bdgw.split(',')
        }

        model.bdry = []
        if (record.bdry) {
          model.bdry = record.bdry.split(',')
        }
      }

      this.model = normalizeRuleConfigModel(model)
      this.scopeSelection = {
        orgs: this.model.bdbmJson ? JSON.parse(this.model.bdbmJson) : [],
        positions: this.model.bdgwJson ? JSON.parse(this.model.bdgwJson) : [],
        employees: this.model.bdryJson ? JSON.parse(this.model.bdryJson) : [],
      }
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    },
    // 切换打卡方式时初始化三个独立配置对象。
    handleCheckinTypeChange() {
      this.model['hrKqRuleGddatedk'] = {
        sjd: [{ sbdaate: '08:00', xbdate: '12:00', sjd: 'morning' }],
        sbqyxsc: 60,
        xbhyxsc: 60,
        cdpd: 1,
        ztpd: 1,
      }
      this.model['hrKqRuleZydatedk'] = {
        zsdkcs: 2,
        dkjgyq: 4,
        drzddksc: 8,
      }
      this.model['hrKqRuleZscdk'] = {
        sbqyxsc: 60,
        xbhyxsc: 60,
        drzdgzsc: 8,
      }
    },
    // 添加一个默认上下班时间段。
    addTimePeriod() {
      this.model.hrKqRuleGddatedk.sjd.push({ sbdaate: '08:00', xbdate: '12:00' })
    },
    // 删除指定时间段并确保至少保留一个时间段。
    removeTimePeriod(index) {
      this.model.hrKqRuleGddatedk.sjd.splice(index, 1)
      if (!this.model.hrKqRuleGddatedk.sjd.length) {
        this.model.hrKqRuleGddatedk.sjd.push({ sbdaate: '08:00', xbdate: '12:00' })
      }
    },
    // 打开人员范围弹窗时传入当前值，弹窗内部使用临时选择避免取消时污染表单。
    openScopeModal() {
      this.$refs.scopeModal.open({
        bindOrgIds: this.model.bdbm,
        bindPositionIds: this.model.bdgw,
        bindEmployeeIds: this.model.bdry,
        orgs: this.scopeSelection.orgs,
        positions: this.scopeSelection.positions,
        employees: this.scopeSelection.employees,
      })
    },
    // 将弹窗确认的组织和岗位范围写回表单。
    handleScopeModalOk(selection) {
      const result = selection
      this.$set(this.model, 'bdbm', result.bindOrgIds)
      this.$set(this.model, 'bdgw', result.bindPositionIds)
      this.$set(this.model, 'bdry', result.bindEmployeeIds)
      this.scopeSelection = {
        orgs: result.orgs,
        positions: result.positions,
        employees: result.employees,
      }
    },
    removeOrgTag(value) {
      this.$set(
        this.model,
        'bdbm',
        this.model.bdbm.filter((item) => item !== String(value))
      )
      this.scopeSelection.orgs = this.scopeSelection.orgs.filter((item) => String(item.value) !== String(value))
    },
    removePositionTag(value) {
      this.$set(
        this.model,
        'bdgw',
        this.model.bdgw.filter((item) => item !== String(value))
      )
      this.scopeSelection.positions = this.scopeSelection.positions.filter(
        (item) => String(item.value) !== String(value)
      )
    },
    removeEmployeeTag(value) {
      this.$set(
        this.model,
        'bdry',
        this.model.bdry.filter((item) => item !== String(value))
      )
      this.scopeSelection.employees = this.scopeSelection.employees.filter(
        (item) => String(item.value) !== String(value)
      )
    },
    // 获取版本操作类型的显示文本。
    getVersionTypeText(type) {
      const map = {
        create: '创建',
        update: '更新',
        rollback: '回滚',
      }
      return map[type] || '更新'
    },
    // 获取版本操作类型对应的标签颜色。
    getVersionTypeColor(type) {
      const map = {
        create: 'green',
        update: 'blue',
        rollback: 'orange',
      }
      return map[type] || 'blue'
    },
    // 校验表单并提交新增或编辑请求。
    submitForm() {
      const that = this
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (!this.validateRuleConfig()) {
            return
          }
          that.confirmLoading = true
          let httpurl = ''
          let method = ''
          if (!this.model.id) {
            httpurl += this.url.add
            method = 'post'
          } else {
            httpurl += this.url.edit
            method = 'post'
          }
          httpAction(httpurl, this.getSubmitPayload(), method)
            .then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                that.$emit('ok')
              } else {
                that.$message.warning(res.message)
              }
            })
            .finally(() => {
              that.confirmLoading = false
            })
        }
      })
    },
    // 组装后端接口需要的规则提交参数。
    getSubmitPayload() {
      const payload = cloneDeep(this.model)
      // 未开启早退容时，提交时清空容时值
      if (payload.enableLeaveEarlyAdvance !== 'Y') {
        payload.leaveEarlyAdvance = null
      }
      payload.bdbm = payload.bdbm.join(',')
      payload.bdgw = payload.bdgw.join(',')
      payload.bdry = payload.bdry.join(',')
      payload['bdbmJson'] = JSON.stringify(this.scopeSelection.orgs)
      payload['bdgwJson'] = JSON.stringify(this.scopeSelection.positions)
      payload['bdryJson'] = JSON.stringify(this.scopeSelection.employees)

      const currentType = this.getCurrentCheckinType(payload.dkfs)
      const currentTypeObjectKey = currentType && currentType.ObjectKey
      delete payload['hrKqRuleGddatedk']
      delete payload['hrKqRuleZydatedk']
      delete payload['hrKqRuleZscdk']
      if (currentTypeObjectKey) {
        let arr = []

        if (currentTypeObjectKey !== 'hrKqRuleGddatedk') {
          arr = this.model[currentTypeObjectKey]
        } else {
          this.model[currentTypeObjectKey].sjd.forEach((item) => {
            arr.push({
              cdpd: item.cdpd,
              ztpd: item.ztpd,
              sbqyxsc: item.sbqyxsc,
              xbhyxsc: item.xbhyxsc,

              sjd: item.sjd,
              sbdaate: item.sbdaate,
              xbdate: item.xbdate,

              absenteeHour: this.model.absenteeHour,
              startoutTime: this.model.startoutTime,
              minoutTime: this.model.minoutTime,
              multiple: this.model.multiple,
              checkType: this.model.checkType,
              otCalcMthd: this.model.otCalcMthd,
            })
          })
        }
        payload[currentTypeObjectKey] = arr
      }
      return payload
    },
    // 校验固定打卡的时间段配置。
    validateRuleConfig() {
      if (this.model.dkfs !== '0') {
        return true
      }
      const periods = this.model.hrKqRuleGddatedk.sjd || []
      if (!periods.length) {
        this.$message.warning('请至少配置一个上下班时间段')
        return false
      }
      for (let i = 0; i < periods.length; i++) {
        if (!periods[i].sjd) {
          this.$message.warning('请选择时间段 ' + (i + 1) + ' 的时段类型')
          return false
        }
        // if (!this.isValidTime(periods[i].sbdaate) || !this.isValidTime(periods[i].xbdate)) {
        //   this.$message.warning('请检查时间段 ' + (i + 1) + ' 的时间格式')
        //   return false
        // }
      }
      if (this.hasDuplicateTimePeriods(periods)) {
        this.$message.warning('存在重复的时间段类型')
        return false
      }
      // if (this.hasTimePeriodOverlap(periods)) {
      //   this.$message.warning('时间段不能重叠')
      //   return false
      // }
      return true
    },
    // 校验时间是否符合 HH:mm 格式。
    isValidTime(time) {
      return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time)
    },
    // 将 HH:mm 时间转换为当天分钟数。
    timeToMinutes(time) {
      const values = time.split(':').map(Number)
      return values[0] * 60 + values[1]
    },
    // 判断多个时间段类型是否存在重复。
    hasDuplicateTimePeriods(periods) {
      const seen = new Set()
      for (let i = 0; i < periods.length; i++) {
        const key = periods[i].sjd
        if (seen.has(key)) {
          return true
        }
        seen.add(key)
      }
      return false
    },
    // 判断多个时间段是否存在重叠。
    hasTimePeriodOverlap(periods) {
      const normalized = periods
        .map((item) => {
          const start = this.timeToMinutes(item.sbdaate)
          let end = this.timeToMinutes(item.xbdate)
          if (end <= start) {
            end += 24 * 60
          }
          return { start, end }
        })
        .sort((a, b) => a.start - b.start)

      for (let i = 1; i < normalized.length; i++) {
        if (normalized[i].start < normalized[i - 1].end) {
          return true
        }
      }
      return false
    },
  },
}
</script>

<style scoped lang="less">
.attendance-rule-form {
  color: #1f2937;
}

.rule-form-section {
  margin-bottom: 16px;
  padding: 16px 18px 4px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}

.sectionColor {
  border: 1px solid #f59e0b !important;
  background: #fffbeb !important;

  .rule-form-section-title {
    border-left: 3px solid #f59e0b !important;
    color: #d97706 !important;
  }
}

.rule-form-section-title {
  margin-bottom: 14px;
  padding-left: 10px;
  border-left: 3px solid #2d78ff;
  color: #1a2a3d;
  font-size: 15px;
  font-weight: 600;
  line-height: 18px;
}

.rule-form-section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.rule-form-section-header .rule-form-section-title {
  margin-bottom: 6px;
}

.rule-form-hint {
  color: #94a3b8;
  font-size: 12px;
  line-height: 18px;
}

.rule-config-row {
  margin-top: 12px;
}

.form-layout-row {
  margin: 0;
}

.form-left-col,
.form-right-col {
  .rule-form-section {
    margin-bottom: 16px;
  }
}

.time-period-list {
  margin-bottom: 12px;
  max-height: 360px;
  overflow-y: auto;
}

.time-period-card {
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafd;
}

.time-period-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.time-period-label {
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  line-height: 32px;
  flex-shrink: 0;
}

.time-period-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
  // flex: 1;
}

.time-period-separator {
  color: #94a3b8;
  line-height: 32px;
  text-align: center;
}

.time-period-action {
  line-height: 32px;
  text-align: right;
}

.time-period-config {
  padding-top: 12px;
  border-top: 1px dashed #edf2f7;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-addon-text {
  display: block;
  color: #94a3b8;
  font-size: 12px;
}

.scope-selection-summary {
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: rgba(37, 99, 235, 0.02);
  margin-bottom: 10px;
}

.scope-selection-row {
  display: flex;
  align-items: flex-start;
  min-height: 30px;
}

.scope-selection-row + .scope-selection-row {
  margin-top: 8px;
}

.scope-selection-label {
  width: 72px;
  color: #64748b;
  font-size: 13px;
  line-height: 22px;
  flex-shrink: 0;
}

.selected-tag-wrap {
  min-height: 28px;
  flex: 1;
}

.selected-tag-wrap .ant-tag {
  margin-bottom: 6px;
}

.empty-inline {
  color: #94a3b8;
  font-size: 12px;
}

.version-list {
  margin-bottom: 12px;
}

.version-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafd;
}

.version-item.active {
  border-color: rgba(37, 99, 235, 0.25);
  background: rgba(37, 99, 235, 0.04);
}

.version-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #2d78ff;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.version-info {
  min-width: 0;
  flex: 1;
}

.version-title {
  color: #1a2a3d;
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
}

.version-type-tag {
  margin-left: 8px;
}

.version-time {
  margin-top: 2px;
  color: #94a3b8;
  font-size: 12px;
}

@media (max-width: 768px) {
  .rule-form-section-header {
    display: block;
  }

  .time-period-action {
    text-align: left;
  }
}

::v-deep .ant-form-item {
  margin-bottom: 8px;
}
</style>

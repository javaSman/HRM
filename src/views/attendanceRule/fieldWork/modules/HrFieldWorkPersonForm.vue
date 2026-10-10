<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container>
      <a-form-model
        ref="form"
        slot="detail"
        layout="vertical"
        :model="model"
        :rules="validatorRules"
        class="fieldwork-person-form"
      >
        <a-row :gutter="24">
          <!-- ===== 表单区域 ===== -->
          <a-col :span="24">
            <a-row :gutter="16">
              <a-col :span="24">
                <a-form-model-item label="姓名" prop="name" :required="true">
                  <j-select-employee
                    v-model="model.name"
                    placeholder="请选择人员"
                    :multiple="false"
                    :disabled="formDisabled"
                    valueField="name"
                    buttonText="选择人员"
                    @change="handleEmployeeChange"
                  />
                </a-form-model-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :span="24">
                <a-form-model-item label="外勤点" prop="hrWqdId" :required="true">
                  <j-dict-select-tag
                    v-model="model.hrWqdId"
                    :disabled="formDisabled"
                    placeholder="请选择外勤点"
                    dictCode="hr_wqd,wqd,id"
                  />
                </a-form-model-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :span="24">
                <a-form-model-item label="考勤规则" prop="ruleId" :required="true">
                  <a-select
                    v-model="model.ruleId"
                    :disabled="formDisabled"
                    placeholder="请选择考勤规则"
                    :options="attendanceRuleOptions"
                    show-search
                    :filter-option="filterOption"
                    allowClear
                    @change="handleRuleChange"
                  />
                </a-form-model-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="开始时间" prop="startTime" :required="true">
                  <j-date
                    placeholder="请选择开始时间"
                    :disabled="formDisabled"
                    v-model="model.startTime"
                    :show-time="{ format: 'HH:mm' }"
                    date-format="YYYY-MM-DD HH:mm"
                    style="width: 100%"
                    :getCalendarContainer="getCalendarContainer"
                  />
                </a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="结束时间" prop="endTime" :required="true">
                  <j-date
                    placeholder="请选择结束时间"
                    :disabled="formDisabled"
                    v-model="model.endTime"
                    :show-time="{ format: 'HH:mm' }"
                    date-format="YYYY-MM-DD HH:mm"
                    style="width: 100%"
                    :getCalendarContainer="getCalendarContainer"
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
import { httpAction, getAction } from '@/api/manage'

export default {
  name: 'HrFieldWorkPersonForm',
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
  },
  data() {
    return {
      confirmLoading: false,
      model: {
        name: '',
        hrWqdId: '',
        ruleId: '',
        startTime: '',
        endTime: '',
        companyId: '',
        dept: '',
        no: '',
        ruleName: '',
      },
      attendanceRuleOptions: [], // 考勤规则选项列表
      validatorRules: {
        name: [{ required: true, message: '请选择人员', trigger: 'change' }],
        hrWqdId: [{ required: true, message: '请选择外勤点', trigger: 'change' }],
        ruleId: [{ required: true, message: '请选择考勤规则', trigger: 'change' }],
        startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
        endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
      },
      url: {
        add: '/hr_wqry/hrWqry/add',
        edit: '/hr_wqry/hrWqry/edit',
        queryById: '/hr_wqry/hrWqry/queryById',
      },
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
  },
  created() {
    this.modelDefault = JSON.parse(JSON.stringify(this.model))
    this.loadAttendanceRules() // 加载考勤规则列表
  },
  methods: {
    // 日期选择器挂载到 body，避免在滚动容器内定位错位
    getCalendarContainer() {
      return document.body
    },
    handleEmployeeChange(value, rows) {
      if (rows && rows.length > 0) {
        const employee = rows[0]
        this.model.companyId = employee.companyId || ''
        this.model.dept = employee.dept || ''
        this.model.no = employee.no || ''
      }
    },
    /**
     * 考勤规则选择变化处理
     */
    handleRuleChange(value) {
      if (value) {
        const selectedRule = this.attendanceRuleOptions.find((item) => item.value === value)
        if (selectedRule) {
          this.model.ruleName = selectedRule.name || ''
        }
      } else {
        this.model.ruleName = ''
      }
    },
    /**
     * 下拉框前端搜索过滤
     */
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
        (option.componentOptions.propsData &&
          option.componentOptions.propsData.title &&
          option.componentOptions.propsData.title.toLowerCase().indexOf(input.toLowerCase()) >= 0)
      )
    },
    /**
     * 加载考勤规则列表
     */
    loadAttendanceRules() {
      getAction('/hrm/hrKqRule/listByRuleId', { historyId: 0, pageNo: 1, pageSize: 999 }).then((res) => {
        if (res.success && res.result && res.result.records) {
          this.attendanceRuleOptions = res.result.records.map((item) => ({
            label: `${item.ruleName || item.rule_name}(${item.ruleSm})`,
            value: item.id,
            name: item.ruleName || item.rule_name,
          }))
        }
      })
    },
    add() {
      this.edit(this.modelDefault)
    },
    edit(record) {
      this.model = Object.assign({}, record)
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
    },
    submitForm() {
      const that = this
      this.$refs.form.validate((valid) => {
        if (valid) {
          that.$emit('submit', true)
          let httpurl = ''
          let method = ''
          if (!this.model.id) {
            httpurl += this.url.add
            method = 'post'
          } else {
            httpurl += this.url.edit
            method = 'put'
          }
          httpAction(httpurl, { ...this.model }, method)
            .then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                that.$emit('ok')
              } else {
                that.$message.warning(res.message)
              }
            })
            .finally(() => {
              that.$emit('submit', false)
            })
        }
      })
    },
  },
}
</script>

<style scoped lang="less">
.fieldwork-person-form {
  min-height: 400px;
}

/* ===== 全局表单项紧致 ===== */
.fieldwork-person-form /deep/ .ant-form-item {
  margin-bottom: 12px;
}

.fieldwork-person-form /deep/ .ant-form-item-label {
  padding-bottom: 4px;
  line-height: 20px;
}

.fieldwork-person-form /deep/ .ant-form-item-label > label {
  color: #555;
  font-size: 13px;
}

.fieldwork-person-form /deep/ .ant-form-item-required::before {
  color: #ff4d4f;
  font-size: 14px;
  margin-right: 2px;
}
</style>

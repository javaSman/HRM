<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
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
          </div>
        </div>
        <a-row>
          <!-- <a-col :span="24">
            <a-form-model-item label="姓名" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="name">
              <j-select-employee v-model="model.name" placeholder="请选择员工" button-text="选择" valueField="name"
                :multiple="false" @change="handleSelectValue" />
            </a-form-model-item>
          </a-col> -->
          <a-col :span="24">
            <a-col :span="8">
              <a-form-model-item label="大小周所属年月" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="ssny">
                <j-date style="width: 100%;" v-model="model.ssny" placeholder="请选择大小周所属年月" antype="month"
                  dateFormat="YYYYMM"></j-date>
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="本月累计大周次数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="monthBigCnt">
                <a-input-number v-model="model.monthBigCnt" :min="0" placeholder="请输入本月累计大周次数" style="width: 100%" />
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="本月累计小周次数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="monthSmallCnt">
                <a-input-number v-model="model.monthSmallCnt" :min="0" placeholder="请输入本月累计小周次数" style="width: 100%" />
              </a-form-model-item>
            </a-col>
          </a-col>

          <a-col :span="24">
            <a-col :span="8">
              <a-form-model-item label="当月补卡次数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="dybkcs">
                <a-input-number v-model="model.dybkcs" :min="0" placeholder="请输入当月补卡次数" style="width: 100%" />
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="当月补卡已用次数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="dybkyycs">
                <a-input-number v-model="model.dybkyycs" :min="0" placeholder="请输入当月补卡已用次数" style="width: 100%" />
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="当月补卡剩余次数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="dybksycs">
                <a-input-number v-model="model.dybksycs" :min="0" placeholder="请输入当月补卡剩余次数" style="width: 100%" />
              </a-form-model-item>
            </a-col>
          </a-col>

          <a-col :span="24">
            <a-col :span="8">
              <a-form-model-item label="薪资类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="xzlx">
                <j-dict-select-tag v-model="model.xzlx" dictCode="xzlx" placeholder="请选择薪资类型" />
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="出勤总天数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="cqzts">
                <a-input-number v-model="model.cqzts" placeholder="请输入出勤总天数" style="width: 100%" />
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="出勤总时长" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="cqzsc">
                <a-input-number v-model="model.cqzsc" placeholder="请输入出勤总时长" style="width: 100%" />
              </a-form-model-item>
            </a-col>
          </a-col>

          <a-col :span="24">
            <a-col :span="8">
              <a-form-model-item label="平时天数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="psts">
                <a-input-number v-model="model.psts" placeholder="请输入平时天数" style="width: 100%" />
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="周末天数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="zmts">
                <a-input-number v-model="model.zmts" placeholder="请输入周末天数" style="width: 100%" />
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="迟到/早退天数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="cdztts">
                <a-input-number v-model="model.cdztts" placeholder="请输入迟到/早退天数" style="width: 100%" />
              </a-form-model-item>
            </a-col>
          </a-col>

          <a-col :span="24">
            <a-col :span="8">
              <a-form-model-item label="当月是否全勤" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="dysfqq">
                <a-input v-model="model.dysfqq" placeholder="请输入当月是否全勤"></a-input>
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="年假总数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="njzs">
                <a-input-number v-model="model.njzs" placeholder="请输入年假总数" style="width: 100%" />
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="已休年假天数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="yxnjts">
                <a-input-number v-model="model.yxnjts" placeholder="请输入已休年假天数" style="width: 100%" />
              </a-form-model-item>
            </a-col>
          </a-col>

          <a-col :span="24">
            <a-col :span="8">
              <a-form-model-item label="剩余年假天数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="synjts">
                <a-input-number v-model="model.synjts" placeholder="请输入剩余年假天数" style="width: 100%" />
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="当月年假天数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="dynjts">
                <a-input-number v-model="model.dynjts" placeholder="请输入当月年假天数" style="width: 100%" />
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="当月加班调休天数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="dyjbtxts">
                <a-input-number v-model="model.dyjbtxts" placeholder="请输入当月加班调休天数" style="width: 100%" />
              </a-form-model-item>
            </a-col>
          </a-col>

          <a-col :span="24">
            <a-col :span="8">
              <a-form-model-item label="当月工伤天数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="dygsts">
                <a-input-number v-model="model.dygsts" placeholder="请输入当月工伤天数" style="width: 100%" />
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="当月病假天数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="dybjts">
                <a-input-number v-model="model.dybjts" placeholder="请输入当月病假天数" style="width: 100%" />
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="当月产检天数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="dycjiants">
                <a-input-number v-model="model.dycjiants" placeholder="请输入当月产检天数" style="width: 100%" />
              </a-form-model-item>
            </a-col>
          </a-col>

          <a-col :span="24">
            <a-col :span="8">
              <a-form-model-item label="当月产假天数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="dycjiats">
                <a-input-number v-model="model.dycjiats" placeholder="请输入当月产假天数" style="width: 100%" />
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="当月陪产假天数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="dypcjts">
                <a-input-number v-model="model.dypcjts" placeholder="请输入当月陪产假天数" style="width: 100%" />
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="当月婚假天数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="dyhjts">
                <a-input-number v-model="model.dyhjts" placeholder="请输入当月婚假天数" style="width: 100%" />
              </a-form-model-item>
            </a-col>
          </a-col>
        </a-row>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>

import { httpAction, getAction } from '@/api/manage'
import { validateDuplicateValue } from '@/utils/util'

export default {
  name: 'HrEmployeeAttendanceStatRecordForm',
  components: {
  },
  props: {
    //表单禁用
    disabled: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  data() {
    return {
      model: {
      },
      labelCol: {
        xs: { span: 24 },
        sm: { span: 9 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 },
      },
      confirmLoading: false,
      validatorRules: {
      },
      url: {
        add: "/hr_employee_attendance_stat_record/hrEmployeeAttendanceStatRecord/add",
        edit: "/hr_employee_attendance_stat_record/hrEmployeeAttendanceStatRecord/edit",
        queryById: "/hr_employee_attendance_stat_record/hrEmployeeAttendanceStatRecord/queryById"
      }
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
  },
  created() {
    //备份model原始值
    this.modelDefault = JSON.parse(JSON.stringify(this.model));
  },
  methods: {
    // handleSelectValue(val, row) {
    //   if (row.length > 0) {
    //     this.model['companyId'] = row[0].companyId
    //     this.model['dept'] = row[0].dept
    //     this.model['no'] = row[0].no

    //     this.model['companyId_dictText'] = row[0].companyId_dictText
    //     this.model['dept_dictText'] = row[0].dept_dictText
    //   } else {
    //     this.model['companyId'] = null
    //     this.model['dept'] = null
    //     this.model['no'] = null

    //     this.model['companyId_dictText'] = null
    //     this.model['dept_dictText'] = null
    //   }

    // },
    add() {
      this.edit(this.modelDefault);
    },
    edit(record) {
      this.model = Object.assign({}, record);
      this.visible = true;
    },
    submitForm() {
      const that = this;
      // 触发表单验证
      this.$refs.form.validate(valid => {
        if (valid) {
          that.confirmLoading = true;
          let httpurl = '';
          let method = '';
          if (!this.model.id) {
            httpurl += this.url.add;
            method = 'post';
          } else {
            httpurl += this.url.edit;
            method = 'put';
          }
          httpAction(httpurl, this.model, method).then((res) => {
            if (res.success) {
              that.$message.success(res.message);
              that.$emit('ok');
            } else {
              that.$message.warning(res.message);
            }
          }).finally(() => {
            that.confirmLoading = false;
          })
        }

      })
    },
  }
}
</script>

<style lang="less" scoped>
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
<template>
  <a-modal
    :visible="visible"
    :title="modalTitle"
    :width="520"
    :footer="null"
    :destroyOnClose="true"
    :bodyStyle="{ padding: 0 }"
    @cancel="handleCancel"
    class="leave-balance-modal"
    wrapClassName="attendance-rule-modal"

  >
    <div class="leave-balance-body">
      <!-- 年假汇总 -->
      <div class="leave-balance-section">
        <div class="section-title">年假汇总</div>
        <div class="balance-item">
          <span class="label">年假总数</span>
          <span class="value">{{ balanceData.bndkxnjts }}天</span>
        </div>
        <div class="balance-item">
          <span class="label">已休年假天数</span>
          <span class="value">{{ balanceData.bndyixnjts }}天</span>
        </div>
        <div class="balance-item">
          <span class="label">剩余年假天数</span>
          <span class="value">{{ balanceData.synjts }}天</span>
        </div>
        <div class="balance-item">
          <span class="label">年假剩余时间</span>
          <span class="value">{{ annualCountdown || 0 }}天</span>
        </div>
      </div>

      <!-- 当月请假天数 -->
      <div class="leave-balance-section">
        <div class="section-title">当月请假天数</div>
        <div class="balance-header">
          <span>假期类型</span>
          <span class="header-center">当月请假天数</span>
          <span class="header-right">剩余天数</span>
        </div>
       <!-- <div v-for="item in monthlyLeaves" :key="item.label" class="balance-item-three">
          <span class="label">{{ item.label }}</span>
          <span class="col-center">{{ item.value }}天</span>
          <span class="col-right">{{ item.unlimited ? '不限额' : item.remain + '天' }}</span>
        </div> -->
        <div class="balance-item-three">
          <span class="label">年假</span>
          <span class="col-center">{{ balanceData.dynjts }}天</span>
          <span class="col-right">{{ balanceData.synjts }}天</span>
        </div>
        <div class="balance-item-three">
          <span class="label">加班调休</span>
          <span class="col-center">{{ balanceData.dyjbtxts }}天</span>
          <span class="col-right">{{ balanceData.jbtxsysc }}天</span>
        </div>
        <div class="balance-item-three">
          <span class="label">事假</span>
          <span class="col-center">{{ balanceData.dyshijts }}天</span>
          <span class="col-right">不限额</span>
        </div>
        <div class="balance-item-three">
          <span class="label">病假</span>
          <span class="col-center">{{ balanceData.dybjts }}天</span>
          <span class="col-right">不限额</span>
        </div>
        <div class="balance-item-three">
          <span class="label">婚假</span>
          <span class="col-center">{{ balanceData.dyhjts }}天</span>
          <span class="col-right">不限额</span>
        </div>
        <div class="balance-item-three">
          <span class="label">产假</span>
          <span class="col-center">{{ balanceData.dycjiats }}天</span>
          <span class="col-right">不限额</span>
        </div>
        <div class="balance-item-three">
          <span class="label">护理假</span>
          <span class="col-center">{{ balanceData.dyhljts }}天</span>
          <span class="col-right">不限额</span>
        </div>
        <div class="balance-item-three">
          <span class="label">育儿假</span>
          <span class="col-center">{{ balanceData.dyyejts }}天</span>
          <span class="col-right">不限额</span>
        </div>
        <div class="balance-item-three">
          <span class="label">工伤假</span>
          <span class="col-center">{{ balanceData.dygsts }}天</span>
          <span class="col-right">不限额</span>
        </div>
        <div class="balance-item-three">
          <span class="label">丧假</span>
          <span class="col-center">{{ balanceData.dysangjts }}天</span>
          <span class="col-right">不限额</span>
        </div>
       
       
        <!-- <div class="balance-item-three">
          <span class="label">产检</span>
          <span class="col-center">{{ balanceData.dycjiants }}天</span>
          <span class="col-right">不限额</span>
        </div> -->
       
        <!-- <div class="balance-item-three">
          <span class="label">陪产假</span>
          <span class="col-center">{{ balanceData.dypcjts }}天</span>
          <span class="col-right">不限额</span>
        </div> -->
        
       
       
        
      </div>
    </div>
  </a-modal>
</template>

<script>
  import { getAction, httpAction } from '@/api/manage'
export default {
  name: 'HrLeaveBalanceModal',
  data() {
    return {
      visible: false,
      employeeId: '',
      employeeName: '',
      no:'',
      annualCountdown:this.getYearEndCountdown(),
      balanceData: {
        annualTotal: 0,
        annualUsed: 0,
        annualRemain: 0,
        annualCountdown: 0
      },
      monthlyLeaves: []
    }
  },
  computed: {
    modalTitle() {
      return this.employeeName ? `${this.employeeName}的假期余额` : '假期余额'
    }
  },
  methods: {
    show(record) {
      console.log("record",record)
      this.employeeId = record.id || ''
      this.employeeName = record.empName || ''
      this.no = record.no || ''
      
      // TODO: 调用后端接口获取假期余额数据
      this.loadBalanceData()
      // 单独获取年假剩余时间
      this.loadAnnualCountdown()
      
      // 假数据
      this.balanceData = {
        // annualTotal: 10,
        // annualUsed: 3,
        // annualRemain: 7,
        annualCountdown: this.getYearEndCountdown()
      }
      
      this.monthlyLeaves = [
        { label: '加班调休', value: 1, remain: 0, unlimited: false },
        { label: '病假', value: 0, remain: 0, unlimited: true },
        { label: '事假', value: 0, remain: 0, unlimited: true },
        { label: '年假', value: 0, remain: 7, unlimited: false },
        { label: '工伤', value: 0, remain: 0, unlimited: true },
        { label: '产检', value: 0, remain: 0, unlimited: true },
        { label: '产假', value: 0, remain: 0, unlimited: true },
        { label: '陪产假', value: 0, remain: 0, unlimited: true },
        { label: '婚假', value: 0, remain: 0, unlimited: true }
      ]
      
      this.visible = true
    },
    
    handleCancel() {
      this.visible = false
    },
    
    // 计算到年底的天数
    getYearEndCountdown() {
      console.log("进来")
      const today = new Date()
      const yearEnd = new Date(today.getFullYear(), 11, 31)
      return Math.ceil((yearEnd - today) / (1000 * 60 * 60 * 24))
    },
    
    // TODO: 加载假期余额数据
    loadBalanceData() {
      getAction('/hr_employee_jq_stat/hrEmployeeJqStat/queryByNo', { no: this.no }).then(res => {
        if (res.success) {
          console.log("res",res)
          this.balanceData = res.result
        }
      })
    },

    // 加载年假剩余时间
    loadAnnualCountdown() {
      getAction('/hr_employee_jq_stat/annualLeave/queryAnnualLeaveByNo', { no: this.no }).then(res => {
        if (res.success && res.result) {
          this.annualCountdown = res.result.daysToEnd
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>


.leave-balance-body {
  padding: 16px 20px;
  overflow: auto;
  max-height: 80vh;
}

.leave-balance-section {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #1677ff;
  padding: 8px 0 4px;
  border-bottom: 2px solid #1677ff;
  margin-bottom: 8px;
}

.balance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;

  &:last-child {
    border-bottom: none;
  }

  .label {
    color: #555;
    flex: 0 0 100px;
  }

  .value {
    color: #333;
    font-weight: 500;
    text-align: right;
    flex: 1;
  }
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 12px;
  color: #999;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 4px;

  span:first-child {
    flex: 0 0 100px;
  }

  .header-center {
    flex: 1;
    text-align: center;
  }

  .header-right {
    flex: 1;
    text-align: right;
  }
}

.balance-item-three {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;

  &:last-child {
    border-bottom: none;
  }

  .label {
    color: #555;
    flex: 0 0 100px;
  }

  .col-center {
    color: #333;
    font-weight: 500;
    text-align: center;
    flex: 1;
  }

  .col-right {
    color: #333;
    font-weight: 500;
    text-align: right;
    flex: 1;
  }
}




/* 统一的 Modal 样式 */
::v-deep .attendance-rule-modal .ant-modal-content {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(45, 120, 255, 0.12), 0 0 40px rgba(45, 120, 255, 0.04);
}

::v-deep .attendance-rule-modal .ant-modal-header {
  padding: 16px 24px;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  border-bottom: 0;
}

::v-deep .attendance-rule-modal .ant-modal-title,
::v-deep .attendance-rule-modal .j-modal-title-row .left {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

::v-deep .attendance-rule-modal .ant-modal-close {
  top: 10px;
  right: 14px;
  width: 32px;
  height: 32px;
  color: #fff;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

::v-deep .attendance-rule-modal .ant-modal-close:hover {
  background: rgba(255, 255, 255, 0.35);
}

::v-deep .attendance-rule-modal .ant-modal-close-x {
  width: 32px;
  height: 32px;
  line-height: 32px;
}

::v-deep .attendance-rule-modal .ant-modal-body {
  padding: 20px 24px;
  overflow-y: auto;
  background: #f8fafc;
}

::v-deep .attendance-rule-modal .ant-modal-footer {
  padding: 14px 24px;
  border-top: 1px solid #e2e8f0;
  background: #fff;
}

::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn {
  height: 34px;
  padding: 0 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}

::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn-danger{
  border: 0;
  color: #fff;
  background: linear-gradient(135deg, #fc211a 0%, #ff9362 100%) !important;
  box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2);
}
::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn-danger:hover,
::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn-danger:focus {
  color: #fff;
  background: linear-gradient(135deg, #fc211a 0%, #ff9362 100%)!important;
  opacity: 0.92;
}

::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn-primary {
  border: 0;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2);
}

::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn-primary:hover,
::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn-primary:focus {
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  opacity: 0.92;
}

/* 审批按钮样式 */
::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn-danger {
  border-radius: 8px;
  font-weight: 600;
}
</style>
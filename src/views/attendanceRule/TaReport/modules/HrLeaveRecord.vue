<template>
  <div class="leave-record">
    <a-table
      :columns="columns"
      :scroll="{ y: 400 }"
      :dataSource="dataSource"
      :pagination="false"
      :loading="loading"
      size="small"
      rowKey="id"
    >
    </a-table>
  </div>
</template>

<script>
import { getAction } from '@/api/manage'
import { mixinDevice } from '@/utils/mixin'
export default {
  name: 'HrLeaveRecord',
  mixins: [mixinDevice],

  props: {
    employeeNo: {
      type: String,
      default: '',
    },
    yearMonth: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      loading: false,

      columns: [
        {
          title: '请假类型',
          align: 'center',
          width: 100,
          dataIndex: 'xjType',
          customRender: (text) => {
            return <a-tag color="blue">{text}</a-tag>
          },
        },
        { title: '开始时间', dataIndex: 'startTime', width: 150, align: 'center' },
        { title: '结束时间', dataIndex: 'endTime', width: 150, align: 'center' },
        {
          title: '请假时长',
          dataIndex: 'applyHours',
          width: 100,
          align: 'center',
          customRender: (text, record) => {
            if (!record.applyHours && !record.applyDays) return '-'
            return record.xjType === '年假'
              ? `${record.applyHours || record.applyDays}天`
              : `${record.applyHours || record.applyDays}${record.applyDays ? '天' : '小时'}`
          },
        },
      ],
      dataSource: [],
    }
  },
  watch: {
    employeeNo() {
      this.loadData()
    },
    yearMonth() {
      this.loadData()
    },
  },
  created() {
    this.loadData()
  },
  methods: {
    loadData() {
      // 获取月头月尾
      let startDate, endDate
      if (this.yearMonth) {
        if (this.yearMonth.length === 10) {
          // 按天查询（员工考勤），开始结束均取刷卡日期
          startDate = endDate = this.yearMonth
        } else {
          const [year, month] = this.yearMonth.split('-')
          startDate = `${year}-${month}-01` // 月头

          // 获取月尾（下个月第一天减一天）
          const nextMonth = month === '12' ? 1 : parseInt(month) + 1
          const nextYear = month === '12' ? parseInt(year) + 1 : year
          const nextMonthFirstDay = new Date(nextYear, nextMonth - 1, 1)
          const monthEndDate = new Date(nextMonthFirstDay - 1) // 减去1毫秒得到上月最后一天
          endDate = `${monthEndDate.getFullYear()}-${String(monthEndDate.getMonth() + 1).padStart(2, '0')}-${String(
            monthEndDate.getDate()
          ).padStart(2, '0')}`
        }
      }
      const startTime = startDate ? `${startDate} 00:00:00` : undefined
      const endTime = endDate ? `${endDate} 23:59:59` : undefined

      this.loading = true
      getAction('/hr_xjsq/hrXjsq/listApprovedByNoAndTime', {
        startTime,
        endTime,
        no: this.employeeNo,
      })
        .then((res) => {
          if (res.success) {
            this.dataSource = res.result || []
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
  },
}
</script>

<style scoped lang="less">
.leave-record {
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  /deep/ .ant-spin-nested-loading,
  /deep/ .ant-spin-container {
    min-height: 100%;
  }

  /deep/ .ant-table {
    font-size: 13px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

    .ant-table-thead > tr > th {
      background: rgba(37, 99, 235, 0.03);
      color: #1a2a3d;
      font-weight: 600;
      font-size: 12px;
      padding: 14px 12px;
      text-align: center;
      border-bottom: 2px solid rgba(37, 99, 235, 0.08);
    }

    .ant-table-tbody > tr > td {
      padding: 12px;
      border-bottom: 1px solid #f0f0f0;
      color: #333;
      vertical-align: middle;
      transition: all 0.3s ease;
    }

    .ant-table-tbody > tr:hover > td {
      background: rgba(37, 99, 235, 0.02);
    }

    .ant-table-tbody > tr:last-child > td {
      border-bottom: none;
    }
  }

  // 空数据提示
  /deep/ .ant-table-placeholder {
    padding: 40px 16px;
    color: #999;
    font-size: 14px;

    .ant-empty-description {
      color: #999;
    }
  }
}
</style>


<template>
  <div class="out-record">
    <a-table :columns="columns" :scroll="{ y: 400 }" :dataSource="dataSource" :pagination="ipagination" :loading="loading"
      size="small" rowKey="id" @change="handleTableChange">

    </a-table>
  </div>
</template>

<script>
import { getAction } from '@/api/manage'

import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
export default {
  name: 'HrOutRecord',
  mixins: [JeecgListMixin, mixinDevice],

  props: {
    employeeNo: {
      type: String,
      default: ''
    },
    yearMonth: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      columns: [
        { title: '开始时间', dataIndex: 'startTime', width: 150, align: 'center' },
        { title: '结束时间', dataIndex: 'endTime', width: 150, align: 'center' },
        {
          title: '外出地点', dataIndex: 'wcdd', width: 200,
          align: 'center',
          ellipsis: true,
          customRender: (text) => {
            return <a-tooltip style='width: 180px;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block'>
              <template slot="title">{text}</template>
              <span>{text}</span>
            </a-tooltip>
          }
        },
        {
          title: '外出原因', dataIndex: 'sqyy', width: 200,
          align: 'center',
          ellipsis: true,
          customRender: (text) => {
            return <a-tooltip style='width: 180px;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block'>
              <template slot="title">{text}</template>
              <span>{text}</span>
            </a-tooltip>
          }
        }
      ],
      url: {
        list: '/hr_wc_application/hrWcApplication/list'
      },
      disableMixinCreated: true,

    }
  },
  watch: {
    employeeId() {
      this.searchReset()
    },
    yearMonth() {
      this.searchReset()
    }
  },
  created() {
    this.searchReset()
  },
  methods: {
    searchReset() {
      this.queryParam = {}

      // 获取月头月尾
      if (this.yearMonth) {
        let rangeStart, rangeEnd
        if (this.yearMonth.length === 10) {
          // 按天查询（员工考勤），开始结束均取刷卡日期
          rangeStart = rangeEnd = this.yearMonth
        } else {
          const [year, month] = this.yearMonth.split('-')
          rangeStart = `${year}-${month}-01` // 月头

          // 获取月尾（下个月第一天减一天）
          const nextMonth = month === '12' ? 1 : parseInt(month) + 1
          const nextYear = month === '12' ? parseInt(year) + 1 : year
          const nextMonthFirstDay = new Date(nextYear, nextMonth - 1, 1)
          const monthEndDate = new Date(nextMonthFirstDay - 1) // 减去1毫秒得到上月最后一天
          rangeEnd = `${monthEndDate.getFullYear()}-${String(monthEndDate.getMonth() + 1).padStart(2, '0')}-${String(monthEndDate.getDate()).padStart(2, '0')}`
        }

        this.queryParam['startTime_begin'] = rangeStart
        this.queryParam['endTime_end'] = rangeEnd
      }

      this.queryParam['no'] = this.employeeNo
      this.queryParam['spStatus'] = 2
      this.loadData(1)
    }
  }
}
</script>

<style scoped lang="less">
.out-record {
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

  /deep/ .ant-pagination {
    margin-top: 16px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    font-size: 13px;
    color: #666;
    padding-top: 12px;

    .ant-pagination-total-text {
      margin-right: 8px;
      font-weight: 500;
      color: #2563eb;
    }

    .ant-pagination-prev,
    .ant-pagination-next {
      min-width: auto;
      height: auto;
      line-height: normal;

      .ant-pagination-item-link {
        background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
        border: none;
        border-radius: 6px;
        padding: 6px 14px;
        font-size: 13px;
        color: #fff;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);

        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
        }
      }
    }

    .ant-pagination-disabled .ant-pagination-item-link {
      background: #f5f5f5;
      color: #ccc;
      cursor: not-allowed;
      box-shadow: none;
    }

    .ant-pagination-item {
      display: none;
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

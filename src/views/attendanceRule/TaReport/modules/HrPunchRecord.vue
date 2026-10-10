<template>
  <div class="punch-record">
    <a-table
      :columns="columns"
      :scroll="{ y: 400 }"
      :dataSource="dataSource"
      :pagination="ipagination"
      :loading="loading"
      size="small"
      rowKey="atttime"
      @change="handleTableChange"
    >
      <template slot="isMakeup" slot-scope="text, record">
        <a-tag v-if="record.verify == 3" color="blue">是</a-tag>
      </template>
    </a-table>
  </div>
</template>

<script>
import { getAction } from '@/api/manage'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'

export default {
  name: 'HrPunchRecord',
  mixins: [JeecgListMixin, mixinDevice],

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
      disableMixinCreated: true,
      queryParam: {},
      url: {
        list: '/hrm/hrmAttlog/list',
      },
      columns: [
        { title: '打卡时间', dataIndex: 'atttime', width: 180, align: 'center' },
        { title: '打卡方式', dataIndex: 'verify_dictText', width: 100, align: 'center' },
        {
          title: '是否补卡',
          dataIndex: 'isMakeup',
          width: 100,
          align: 'center',
          scopedSlots: { customRender: 'isMakeup' },
        },
        { title: '状态', dataIndex: 'status_dictText', width: 100, align: 'center' },
      ],
    }
  },
  watch: {
    employeeNo() {
      this.searchReset()
    },
    yearMonth() {
      this.searchReset()
    },
  },
  created() {
    this.searchReset()
  },
  methods: {
    // 重置
    searchReset() {
      this.queryParam = {}
      this.queryParam['queryTime'] = this.yearMonth
      this.queryParam['no'] = this.employeeNo
      this.queryParam['excludeLeave'] = 1
      this.queryParam['verify'] = '1,2'
      this.loadData(1)
    },
  },
}
</script>

<style scoped lang="less">
.punch-record {
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


<template>
  <a-card :bordered="false" class="event-report-page" style="padding: 0">
    <!-- 顶部统计卡 -->
    <div class="stat-row">
      <div
        v-for="item in statCards"
        :key="item.value"
        class="stat-card"
        :style="{ '--c': item.color, '--soft': item.soft, '--bg': item.bg }"
      >
        <div class="stat-icon"><a-icon :type="item.icon" /></div>
        <div class="stat-main">
          <div class="stat-num">{{ item.count }}</div>
          <div class="stat-label">{{ item.label }}</div>
        </div>
      </div>
    </div>

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <!-- <a-col :md="6" :sm="12">
            <a-form-item label="事件标题:">
              <j-input v-model="queryParam.eventTitle" placeholder="请输入事件标题" allowClear />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="事件地点:">
              <j-input v-model="queryParam.eventLocation" placeholder="请输入事件地点" allowClear />
            </a-form-item>
          </a-col> -->
          <a-col :md="5" :sm="12">
            <a-form-item label="事件类型:">
              <j-dict-select-tag v-model="queryParam.eventType" placeholder="请选择事件类型" dictCode="wbz_sjlx"/>
            </a-form-item>
          </a-col>
          <a-col :md="7" :sm="12">
            <span class="table-page-search-submitButtons">
              <a-button type="primary" class="pm-btn-primary" icon="search" @click="searchQuery">查询</a-button>
              <a-button class="pm-btn-reset" icon="reload" style="margin-left: 8px" @click="searchReset">重置</a-button>
              <!-- <a-button
                type="primary"
                class="pm-btn-primary"
                icon="download"
                style="margin-left: 8px"
                @click="handleExportXlsByColumns('事件上报列表')"
                >导出</a-button
              > -->
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!-- 表格 -->
    <a-table
      ref="table"
      size="middle"
      :scroll="{  y: 700 }"
      bordered
      rowKey="id"
      :columns="columns"
      :dataSource="dataSource"
      :pagination="ipagination"
      :loading="loading"
      :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      class="j-table-force-nowrap"
      @change="handleTableChange"
    >
      <span slot="eventContent" slot-scope="text" :title="text">{{ formatValue(text) }}</span>
      <span slot="action" slot-scope="text, record">
        <a @click="handleDetail(record)">详情</a>
      </span>
    </a-table>

    <event-report-modal ref="modalForm" />
  </a-card>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { getAction } from '@/api/manage'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import EventReportModal from './modules/EventReportModal.vue'

export default {
  name: 'HrmEventReportList',
  mixins: [JeecgListMixin, mixinDevice],
  components: { EventReportModal },
  data() {
    return {
      description: '事件上报列表',
      disableMixinCreated: true,
      currentEventType: 'all',
      queryParam: { eventTitle: '', eventLocation: '', eventType: '' },
      columns: [
        { title: '事件类型', dataIndex: 'eventType', align: 'center', width: 140, customRender: this.formatValue },
        // { title: '事件标题', dataIndex: 'eventTitle', align: 'center',
        //   ellipsis: true,
        //   width: 350,
        //   customRender: (text) => {
        //     return (
        //       <a-tooltip style="width: 330px;text-overflow:ellipsis;overflow:hidden;display: block">
        //         <template slot="title">{text}</template>
        //         <span style="color:#00557f">{text}</span>
        //       </a-tooltip>
        //     )
        //   },
        // },
        { title: '事件时间', dataIndex: 'eventTime', align: 'center', width: 160, customRender: this.formatValue },
        // { title: '事件地点', dataIndex: 'eventLocation', align: 'center',ellipsis: true,
        //   width: 350,
        //   customRender: (text) => {
        //     return (
        //       <a-tooltip style="width: 330px;text-overflow:ellipsis;overflow:hidden;display: block">
        //         <template slot="title">{text}</template>
        //         <span >{text}</span>
        //       </a-tooltip>
        //     )
        //   }, },
        {
          title: '事件内容',
          dataIndex: 'eventContent',
          align: 'center',
          customRender: (text) => {
            return (
              <a-tooltip style="text-overflow:ellipsis;overflow:hidden;display: block">
                <template slot="title">{text}</template>
                <span style="color:#00557f">{text}</span>
              </a-tooltip>
            )
          },
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          width: 100,
          scopedSlots: { customRender: 'action' },
        },
      ],
      statCards: [
        {
          label: '事件总数',
          value: 'all',
          count: 0,
          icon: 'file-text',
          color: '#1890ff',
          soft: 'rgba(24,144,255,0.16)',
          bg: '#e6f7ff',
        },
        {
          label: '垃圾未清理',
          value: '垃圾未清理',
          count: 0,
          icon: 'delete',
          color: '#fa541c',
          soft: 'rgba(250,84,28,0.16)',
          bg: '#fff2e8',
        },
        {
          label: '设备异常',
          value: '设备异常',
          count: 0,
          icon: 'warning',
          color: '#faad14',
          soft: 'rgba(250,173,20,0.16)',
          bg: '#fffbe6',
        },
        {
          label: '环境脏乱',
          value: '环境脏乱',
          count: 0,
          icon: 'environment',
          color: '#13c2c2',
          soft: 'rgba(19,194,194,0.16)',
          bg: '#e6fffb',
        },
        {
          label: '秩序问题',
          value: '秩序问题',
          count: 0,
          icon: 'alert',
          color: '#722ed1',
          soft: 'rgba(114,46,209,0.16)',
          bg: '#f9f0ff',
        },
        {
          label: '其他',
          value: '其他',
          count: 0,
          icon: 'appstore',
          color: '#8c8c8c',
          soft: 'rgba(140,140,140,0.16)',
          bg: '#fafafa',
        },
      ],
      url: {
        list: '/eventReport/hrmEventReport/list',
        getTotal: '/eventReport/hrmEventReport/getTotal',
        exportXlsUrl: '/eventReport/hrmEventReport/exportXls',
      },
    }
  },
  created() {
    this.ipagination.pageSize = 10
    this.ipagination.pageSizeOptions = ['10', '20', '50']
    this.loadData(1)
  },
  watch: {
    'ipagination.total'(val) {
      const allCard = this.statCards.find((item) => item.value === 'all')
      if (allCard) {
        allCard.count = val
      }
    },
    dataSource(val) {
      this.getTotal()
    },
  },
  methods: {
    // 获取事件统计
    getTotal() {
      getAction(this.url.getTotal).then((res) => {
        if (res.success) {
          let arr = res.result
          this.statCards.forEach((item) => {
            if(item.value === 'all'){
              item.count = this.ipagination.total
            }
            arr.forEach((it) => {
              if(it.statusText === item.value){
                item.count = it.statustotal
              }
            })
          })
        }
      })
    },
    handleDetail(record) {
      this.$refs.modalForm.detail(record)
    },
    formatValue(value) {
      return value === undefined || value === null || (typeof value === 'string' && value.trim() === '')
        ? '-'
        : value
    },
  },
}
</script>

<style scoped lang="less">
@import '~@assets/less/common.less';
/deep/ .ant-card-body {
  padding: 0;
  padding-left: 12px;
  padding-right: 12px;
}
.event-report-page {
  position: relative;
  height: calc(100vh - 120px - 24px);
  overflow: hidden;
  overflow-y: auto;
}

/* 顶部统计卡 */
.stat-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin: 12px 0;
}

.stat-card {
  --c: #1890ff;
  --soft: rgba(24, 144, 255, 0.16);
  --bg: #e6f7ff;
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border: 1px solid #edf0f5;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 0 10px rgba(184, 218, 255, 0.5);
  cursor: pointer;
  transition: all 0.22s ease;

  &:hover {
    border-color: var(--c);
    background: var(--bg);
    transform: translateY(-2px);
    box-shadow: 0 4px 14px var(--soft);
  }

  &.active {
    border-color: var(--c);
    background: var(--bg);
    box-shadow: 0 4px 14px var(--soft);

    .stat-num,
    .stat-icon {
      color: var(--c);
    }
  }
}

.stat-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  margin-right: 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--c);
  background: var(--soft);
}

.stat-main {
  min-width: 0;
}

.stat-num {
  font-size: 22px;
  font-weight: 700;
  color: #262626;
  line-height: 1.1;
}

.stat-label {
  margin-top: 2px;
  font-size: 12px;
  color: #8c8c8c;
  white-space: nowrap;
}

/* ==== 按钮 ==== */
.pm-btn-primary {
  height: 34px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2);

  &:hover,
  &:focus {
    background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
    opacity: 0.92;
  }
}

.pm-btn-reset {
  height: 34px;
  border-radius: 8px;
  color: #64748b;
  border-color: #e2e8f0;
  background: #ffffff;

  &:hover {
    color: #1a2a3d;
    border-color: rgba(37, 99, 235, 0.35);
  }
}
</style>

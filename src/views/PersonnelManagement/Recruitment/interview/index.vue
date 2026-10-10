<template>
  <div class="resumeBox">
    <!-- 详情盒子（主盒子隐藏，展示详情页盒子） -->
    <detail-box v-if="showDetail" :stageNum="stageNum" :record="detailRecord" @back="handleBack" @ok="modalFormOk" />

    <!-- 主盒子：统计卡 + 搜索栏 + 表格 -->
    <template v-else>
      <div class="status-card-group">
        <div class="status-card">
          <div class="status-card-header">
            <span class="header-bar"></span>
            <span class="header-title">数量统计</span>
          </div>
          <div class="status-card-body">
            <div
              v-for="item in statusCards"
              :key="item.value"
              class="mini-card"
              :class="{ active: currentStatus === item.value }"
              :style="{ '--c': item.color, '--soft': item.soft, '--bg': item.bg }"
              @click="handleCardStatusChange(item.value)"
            >
              <span class="mini-dot"></span>
              <span class="mini-label">{{ item.label }}</span>
              <span class="mini-count">{{ item.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 查询区域 -->
      <div class="table-page-search-wrapper">
        <a-form layout="inline" @keyup.enter.native="searchQuery">
          <a-row :gutter="24">
            <a-col :md="4" :sm="8">
              <a-form-item label="公司">
                <a-select
                  v-model="companyId"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  placeholder="请选择公司"
                  :loading="orgLoading"
                  @change="handleCompanyChange"
                >
                  <a-select-option v-for="item in companyList" :key="item.id" :value="item.id">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="4" :sm="8">
              <a-form-item label="部门">
                <a-cascader
                  v-model="deptArr"
                  :options="deptList"
                  :disabled="!companyId || orgLoading"
                  :fieldNames="{ label: 'name', value: 'id', children: 'children' }"
                  :show-search="{ filter: filterDeptOption }"
                  changeOnSelect
                  placeholder="请选择部门"
                  @change="handleQueryDeptChange"
                />
              </a-form-item>
            </a-col>
            <a-col :md="4" :sm="8">
              <a-form-item label="岗位名称">
                <a-input v-model.trim="queryParam.postName" placeholder="请输入岗位名称" />
              </a-form-item>
            </a-col>
            <a-col :md="10" :sm="10">
              <a-form-item>
                <a-button type="primary" class="pm-btn-primary" icon="search" @click="searchQuery">查询</a-button>
                <a-button class="pm-btn-reset" icon="reload" style="margin-left: 5px" @click="searchReset">重置</a-button>
                <a-button
                  type="primary"
                  class="pm-btn-primary"
                  style="margin-left: 5px"
                  icon="download"
                @click="onExport"

                  >导出</a-button
                >
                <!-- <a-upload
                  name="file"
                  :showUploadList="false"
                  :multiple="false"
                  :headers="tokenHeader"
                  :action="importExcelUrlNew"
                  @change="handleImportExcelNew"
                  ><a-button type="primary" class="pm-btn-primary" style="margin-left: 5px" icon="import">导入</a-button></a-upload
                > -->
                <!-- <a-dropdown style="margin-left: 5px" v-if="selectedRowKeys.length > 0">
                  <a-menu slot="overlay">
                    <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
                  </a-menu>
                  <a-button>批量操作 <a-icon type="down" /></a-button>
                </a-dropdown> -->
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <!-- 查询区域-END -->

      <!-- table区域 -->
      <a-table
        ref="table"
        size="middle"
        :scroll="tableScroll"
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
        <span slot="status" slot-scope="text">
          <a-tag :color="getStatusColor(text)" style="margin-right: 0">{{ getStatusText(text) }}</a-tag>
        </span>
        <span slot="resumeCount" slot-scope="text, record">
          <!-- @click="openResumeDrawer(record)" -->
          <a >{{ formatValue(text) }}</a>
        </span>
        <span slot="yesno" slot-scope="text">
          <span :class="formatYesNo(text) === '是' ? 'yes-no yes' : 'yes-no no'">{{ formatYesNo(text) }}</span>
        </span>
        <span slot="action" slot-scope="text, record">
          <a @click="openDetail(record)">详情</a>
        </span>
      </a-table>
    </template>
  </div>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { httpAction,getAction } from '@/api/manage'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { recruitmentOrgFilterMixin } from '../common/recruitmentOrgFilterMixin.js'
import DetailBox from './modules/DetailBox.vue'
// import ResumeListDrawer from './modules/ResumeListDrawer.vue'

// 状态（dqzt）取值及展示
const STATUS_MAP = {
  进行中: { text: '进行中', color: 'blue' },
  已完成: { text: '已完成', color: 'green' }
}

function isBlankValue(value) {
  return value === undefined || value === null || (typeof value === 'string' && value.trim() === '')
}

function formatValue(value) {
  return isBlankValue(value) ? '-' : value
}

function formatCompanyName(value) {
  return isBlankValue(value) ? '-' : String(value).split('/')[0]
}

// 简历数量后面的字段值都是“是否”
function formatYesNo(value) {
  if (isBlankValue(value) || value === '0' || String(value).toLowerCase() === 'false' || value === '否') {
    return '否'
  }
  return '是'
}

export default {
  name: 'HrmJlglList',
  orgTreeUrl: '/zpManage/hrmJlgl/loadTreeRoot',
  mixins: [JeecgListMixin, recruitmentOrgFilterMixin],
  components: { DetailBox },
  props: {
    // 阶段：1 初审 / 2 复审 / 3 终审
    stage: {
      type: [Number, String],
      default: 1,
    },
  },
  data() {
    return {
      disableMixinCreated: true,
      description: '简历管理列表',
      queryParam: this.getDefaultQueryParam(),
      currentStatus: 'all',
      statusCards: [
        { label: '全部', value: 'all', color: '#1890ff', soft: 'rgba(24,144,255,0.16)', bg: '#e6f7ff', count: 0 },
        { label: '进行中', value: '进行中', color: '#fa8c16', soft: 'rgba(250,140,22,0.16)', bg: '#fff7e6', count: 0 },
        { label: '已完成', value: '已完成', color: '#52c41a', soft: 'rgba(82,196,26,0.16)', bg: '#f6ffed', count: 0 }
      ],
      // 详情盒子切换
      showDetail: false,
      detailRecord: null,
      
      url: {
        list: '/zpManage/hrmJlgl/list',
        getTotal: '/zpManage/hrmJlgl/getTotal',
        delete: '/zpManage/hrmJlgl/delete',
        deleteBatch: '/zpManage/hrmJlgl/deleteBatch',
        exportXlsUrl: '/zpManage/hrmJlgl/exportXls',
        importExcelUrlNewName: 'HrmJlgl'
      }
    }
  },
  computed: {
    tableScroll() {
      const x = this.columns.reduce((sum, column) => sum + (Number(column.width) || 120), 60)
      return {  y: 600 }
    },
    stageNum() {
      return Number(this.stage) || 1
    },
    columns() {
      let arr=[
        {
          title: '公司',
          dataIndex: 'deptPath',
          align: 'center',
          width: 220,
          ellipsis: true,
          customRender: (text) => this.renderTooltip(formatCompanyName(text), 200)
        },
        {
          title: '所属部门',
          dataIndex: 'dept_dictText',
          align: 'center',
          width: 220,
          ellipsis: true,
          customRender: (text) => this.renderTooltip(text, 200)
        },
        { title: '岗位名称', dataIndex: 'postName', align: 'center', width: 180,customRender: (text) => this.renderTooltip(text, 160) },
        { title: '职级名称', dataIndex: 'levelName', align: 'center', width: 120, customRender: formatValue },
        { title: '员工类型', dataIndex: 'employeeType', align: 'center', width: 100, customRender: formatValue },
        { title: '申请招聘人数', dataIndex: 'sqzprs', align: 'center', width: 110, customRender: formatValue },
        { title: '计划招聘人数', dataIndex: 'jhzprs', align: 'center', width: 110, customRender: formatValue },
      ]
      let getNum = (num1,num2,num3) => {
        num1 = Number(num1) || 0
        num2 = Number(num2) || 0
        num3 = Number(num3) || 0
        let num =  num1 + num2 + num3 || 0
        return num
      }

      if(this.stage == 1) {
        arr.unshift({ title: '状态', dataIndex: 'csZt', align: 'center', width: 70, scopedSlots: { customRender: 'status' } })
        arr = [...arr,
        { title: '初试人数', dataIndex: 'csrs', align: 'center', width: 90, customRender: (text,record) => {
            return getNum(record.dcs,record.cstg,record.csntg)
          }  
        },
        { title: '待初试', dataIndex: 'dcs', align: 'center', width: 90,  },
        { title: '初试通过', dataIndex: 'cstg', align: 'center', width: 90,  },
        { title: '初试不通过', dataIndex: 'csntg', align: 'center', width: 90,  },
        { title: '操作', dataIndex: 'action', align: 'center', width: 80, scopedSlots: { customRender: 'action' } }
        ]
      }

      if(this.stage == 2) {
        arr.unshift({ title: '状态', dataIndex: 'fsZt', align: 'center', width: 70, scopedSlots: { customRender: 'status' } })
        arr = [...arr,
        { title: '复试人数', dataIndex: 'fsrs', align: 'center', width: 90,  customRender: (text,record) => {
            return getNum(record.dfs,record.fstg,record.fsntg)
          }  
        },
        { title: '待复试', dataIndex: 'dfs', align: 'center', width: 90,  },
        { title: '复试通过', dataIndex: 'fstg', align: 'center', width: 90,  },
        { title: '复试不通过', dataIndex: 'fsntg', align: 'center', width: 90,  },
        { title: '操作', dataIndex: 'action', align: 'center', width: 80, scopedSlots: { customRender: 'action' } }
        ]
      }

      if(this.stage == 3) {
        arr.unshift({ title: '状态', dataIndex: 'zsZt', align: 'center', width: 70, scopedSlots: { customRender: 'status' } })
        arr = [...arr,
        { title: '终审人数', dataIndex: 'zsrs', align: 'center', width: 90, customRender: (text,record) => {
            return getNum(record.dzs,record.zstg,record.zsntg)
          }  
        },
        { title: '待终审', dataIndex: 'dzs', align: 'center', width: 90,  },
        { title: '终审通过', dataIndex: 'zstg', align: 'center', width: 90,  },
        { title: '终审不通过', dataIndex: 'zsntg', align: 'center', width: 90,  },
        { title: '操作', dataIndex: 'action', align: 'center', width: 80, scopedSlots: { customRender: 'action' } }
        ]
      }
      return arr
    },
  },
  created() {
    this.ipagination.showTotal = (total, range) => range[0] + '-' + range[1] + ' 共' + total + '条'
    
    if (this.stageNum == 1) {
      this.url.list = '/zpManage/hrmJlgl/firstInterviewList'
    } else if (this.stageNum == 2) {
      this.url.list = '/zpManage/hrmJlgl/secondInterviewList'
    } else if (this.stageNum == 3) {
      this.url.list = '/zpManage/hrmJlgl/finalInterviewList'
    }
    this.loadData(1)
  },
  watch: {
    dataSource: {
      handler(newVal, oldVal) {
          this.getStatusTotal()
      },
      immediate: true,
    },
  },
  methods: {
    onExport() {
      let obj = {
        1: '初试',
        2: '复试',
        3: '终审'
      }
      this.handleExportXlsByColumns(`${obj[this.stageNum]}管理`)
    },
    getDefaultQueryParam() {
      return {
        deptId: '',
        deptPath: '',
        postId: '',
        postName: '',
        dqzt: ''
      }
    },
    // 顶部统计卡数量：按 label 匹配 /getTotal 返回
    getStatusTotal() {
      const typeMap = { 1: '初试', 2: '复试', 3: '终试' }
      const params = { type: typeMap[this.stageNum] || '' }
      getAction(this.url.getTotal, params).then((res) => {
        if (res && res.success && Array.isArray(res.result)) {
          const totalMap = {}
          res.result.forEach((item) => {
            totalMap[item.statusText] = Number(item.statustotal) || 0
          })
          this.statusCards.forEach((item) => {
            if (item.value == 'all') {
              item.count = totalMap['全部'] || 0
            } else {
              item.count = totalMap[item.value] || 0
            }
          })
        }
      })
    },
    handleCardStatusChange(value) {
      this.currentStatus = value
      this.queryParam.dqzt = value === 'all' ? '' : value
      this.loadData(1)
      this.onClearSelected()
    },
    searchReset() {
      this.queryParam = this.getDefaultQueryParam()
      this.companyId = ''
      this.deptArr = []
      this.currentStatus = 'all'
      this.loadData(1)
      this.onClearSelected()
    },
    openDetail(record) {
      this.detailRecord = record
      this.showDetail = true
    },
    handleBack() {
      this.showDetail = false
      this.detailRecord = null
    },
    openResumeDrawer(record) {
      this.$refs.resumeListDrawer.open(record)
    },
    getStatusText(status) {
      return STATUS_MAP[status] ? STATUS_MAP[status].text : formatValue(status)
    },
    getStatusColor(status) {
      return STATUS_MAP[status] ? STATUS_MAP[status].color : ''
    },
    formatValue,
    formatYesNo,
    renderTooltip(text, width) {
      const value = String(formatValue(text))
      return this.$createElement(
        'a-tooltip',
        {
          style: {
            width: width + 'px',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            display: 'block'
          },
          props: { title: value }
        },
        [this.$createElement('span', value)]
      )
    }
  }
}
</script>

<style scoped lang="less">
@import '~@assets/less/common.less';

.resumeBox {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 87vh;
  background: #fff;
  padding: 10px 10px;
}

/* ===== 顶部状态大卡片 ===== */
.status-card-group {
  display: flex;
  gap: 14px;
  margin-bottom: 10px;
}

.status-card {
  flex: 1;
  min-width: 0;
  border: 1px solid #eef0f3;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 10px rgba(31, 45, 61, 0.05);
  overflow: hidden;
}

.status-card-header {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 14px;
  border-bottom: 1px solid #f3f4f6;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);

  .header-bar {
    width: 4px;
    height: 14px;
    margin-right: 8px;
    border-radius: 2px;
    background: #fff;
  }
  .header-title {
    font-size: 14px;
    font-weight: 600;
    color: #fff;
  }
}

.status-card-body {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
  gap: 10px;
  padding: 12px 14px;
}

.mini-card {
  --c: #1890ff;
  --soft: rgba(24, 144, 255, 0.16);
  --bg: #e6f7ff;
  position: relative;
  display: flex;
  align-items: center;
  height: 52px;
  padding: 0 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fbfcfd;
  cursor: pointer;
  transition: all 0.22s ease;

  .mini-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    margin-right: 8px;
    border-radius: 50%;
    background: var(--c);
  }
  .mini-label {
    flex: 1;
    font-size: 13px;
    color: #595959;
    white-space: nowrap;
  }
  .mini-count {
    font-size: 18px;
    font-weight: 700;
    color: #262626;
    line-height: 1;
  }

  &:hover {
    border-color: var(--soft);
    background: var(--bg);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--soft);

    .mini-label {
      color: var(--c);
    }
    .mini-count {
      color: var(--c);
    }
  }
  &.active {
    border-color: var(--c);
    background: var(--bg);
    box-shadow: 0 4px 12px var(--soft);

    .mini-label {
      color: var(--c);
      font-weight: 600;
    }
    .mini-count {
      color: var(--c);
    }
  }
}

/* ===== 按钮 ===== */
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

/* 是否列 */
.yes-no {
  display: inline-block;
  min-width: 24px;
}
.yes-no.yes {
  color: #52c41a;
}
.yes-no.no {
  color: #bfbfbf;
}
</style>
<template>
  <div class="resume-interview-table">
    <!-- 状态 tabs（暂不过滤，仅切换高亮） -->
    <a-tabs v-model="activeTab" class="state-tabs" @change="handleTabChange">
      <a-tab-pane v-for="item in tabOptions" :key="item.value">
        <span slot="tab">{{ item.label }}</span>
      </a-tab-pane>
    </a-tabs>

    <!-- 搜索 + 新增/导入/导出 -->
    <div class="rit-toolbar">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-form-item label="姓名:">
          <a-input v-model.trim="queryParam.xm" placeholder="请输入姓名" allowClear />
        </a-form-item>
        <a-form-item label="学历:">
          <j-dict-select-tag style="width: 200px;" type="list" v-model="queryParam.xl" dictCode="xl" placeholder="请选择学历" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" class="pm-btn-primary" icon="search" @click="searchQuery">查询</a-button>
          <a-button class="pm-btn-reset" icon="reload" style="margin-left: 8px" @click="searchReset">重置</a-button>
        </a-form-item>
      </a-form>
      <div class="rit-toolbar-right">
        <a-button class="pm-btn-primary" type="primary" icon="plus" @click="handleAdd">新增简历</a-button>
        <!-- <a-button class="pm-btn-primary" type="primary" icon="import" style="margin-left: 8px">导入</a-button> -->
        <a-button class="pm-btn-primary" type="primary" icon="download" style="margin-left: 8px"  @click="handleExportXlsByColumns('简历信息')">导出</a-button>
      </div>
    </div>

    <!-- 批量操作栏 -->
    <div class="batch-bar">
      <span class="batch-selected">
        已选择 <b>{{ selectedRowKeys.length }}</b> 项
        <a v-if="selectedRowKeys.length" class="batch-clear" @click="onClearSelected">清空</a>
      </span>
      <div style="display: flex; align-items: center;gap: 8px;">
        <div class="batch-btns">
        <!-- <a-button class="pm-btn-primary"  :disabled="selectedRowKeys.length == 0" v-if="activeTab == '待邀约' || activeTab == '暂停邀约'"  type="primary" size="small" @click="handleBatchInvite">批量邀约</a-button>
        <a-button class="pm-btn-primary"  :disabled="selectedRowKeys.length == 0" v-if="activeTab == '已邀约'" @click="batchUp('ok')" type="primary" size="small">批量确认面试</a-button>
        <a-button class="pm-btn-primary"  :disabled="selectedRowKeys.length == 0" v-if="activeTab == '待邀约' || activeTab == '已邀约' || activeTab == '暂停邀约'" type="primary" size="small" @click="handleBatchEliminate">批量淘汰</a-button>
        <a-button class="pm-btn-primary"  :disabled="selectedRowKeys.length == 0" v-if="activeTab == '待邀约'" @click="batchUp('stop')" type="primary" size="small">批量暂停邀约</a-button> -->
        <a-button class="pm-btn-primary"  :disabled="selectedRowKeys.length == 0" v-if="activeTab == '不通过'" type="primary" size="small" @click="batchDel">批量删除</a-button>
      </div>
      <span class="batch-tip">不支持跨状态批量操作</span>
      </div>
    </div>

    <!-- 简历表格 -->
    <a-table
      ref="table"
      size="middle"
      :scroll="{ x: tableScrollX, y: tableScrollY }"
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
      <span slot="dqzt" slot-scope="text">
        <a-tag v-if="text" :color="dqztType(text)">{{ formatValue(text) }}</a-tag>
      </span>
      <span slot="jlfj" slot-scope="text">
        <a v-if="text" @click="lookPdf(text)">查看</a>
        <span v-else>-</span>
      </span>
      <span slot="action" slot-scope="text, record">
        <a v-if="record.dqzt === '待邀约'" @click="handleEdit(record)">编辑</a>
        <a-divider  v-if="record.dqzt === '待邀约'" type="vertical" />
        <a @click="handleDetail(record)">详情</a>
      </span>
    </a-table>

    <!-- 新增/编辑简历弹框 -->
    <hrm-jlgl-modal :mainData="mainData" ref="modalForm" @ok="modalFormOk" />

    <!-- 详情 / 批量邀约 / 批量淘汰 -->
    <resume-process-modal ref="processModal" @ok="handleProcessOk" />
  </div>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import HrmJlglModal from './HrmJlglModal.vue'
import ResumeProcessModal from './ResumeProcessModal.vue'

import { httpAction, getFileAccessHttpUrl } from '@/api/manage'


export default {
  name: 'ResumeInterviewTable',
  mixins: [JeecgListMixin],
  components: { HrmJlglModal, ResumeProcessModal },
  props: {
    // 招聘计划ID，按此过滤该岗位下的简历
    mainData: { type: Object, default: () => {} }
  },
  data() {
    return {
      disableMixinCreated: true,
      activeTab: 'all',
      tabOptions: [
        { label: '全部', value: 'all' },
        { label: '待邀约', value: '待邀约' },
        { label: '已邀约', value: '已邀约' },
        { label: '已确认面试', value: '已确认面试' },
        { label: '放弃面试', value: '放弃面试' },
        { label: '不通过', value: '不通过' },
        { label: '暂停邀约', value: '暂停邀约' }
      ],
      columns: [
        { title: '面试阶段', dataIndex: 'mslc', align: 'center', width: 90, customRender:(text)=>{
          let obj = {
            '':<a-tag color="blue">初试</a-tag>,
            '初试':<a-tag color="blue">{{text}}</a-tag>,
            '复试':<a-tag color="orange">{{text}}</a-tag>,
            '终审':<a-tag color="purple">{{text}}</a-tag>,
          }
          return obj[text] || <a-tag color="blue">初试</a-tag>
        }, },

        { title: '邀约状态', dataIndex: 'dqzt', align: 'center', width: 100, scopedSlots: { customRender: 'dqzt' } },

        { title: '姓名', dataIndex: 'xm', align: 'center', width: 160, customRender: this.formatValue },
        { title: '性别', dataIndex: 'xb', align: 'center', width: 100, customRender: this.formatValue },
        { title: '年龄', dataIndex: 'nl', align: 'center', width: 100, customRender: this.formatValue },
        { title: '学历', dataIndex: 'xl', align: 'center', width: 120, customRender: this.formatValue },
        { title: '专业', dataIndex: 'zy', align: 'center', width: 160, customRender: this.formatValue },
        { title: '期望薪资(k)', dataIndex: 'qwxz', align: 'center', width: 120, customRender: this.formatValue },
        { title: '简历附件', dataIndex: 'jlFujian', align: 'center', width: 100, scopedSlots: { customRender: 'jlfj' } },
        { title: '操作', dataIndex: 'action', align: 'center',   scopedSlots: { customRender: 'action' } }
      ],
      url: {
        list: '/zpManage/hrmMsgl/list',
        deleteBatch: '/zpManage/hrmMsgl/deleteBatch',
        ok: '/zpManage/hrmMsgl/confirmInterview',
        stop: '/zpManage/hrmMsgl/pauseInvite',
        exportXlsUrl: '/zpManage/hrmMsgl/exportXls',
        importExcelUrl: 'zpManage/hrmMsgl/importExcel',
        importExcelUrlNewName: 'HrmMsgl',
      },
      queryParam: {
        zpjhid: this.mainData.zpjhid,
        gljlId: this.mainData.id,
        xm: '',
        xl: ''
      }
    }
  },
  computed: {
    tableScrollX() {
      return this.columns.reduce((sum, column) => sum + (Number(column.width) || 120), 0)
    },
    // 固定纵向滚动区，避免行数多顶开详情盒布局
    tableScrollY() {
      return 300
    }
  },
  created() {
    this.ipagination.pageSize = 10
    this.ipagination.pageSizeOptions = ['10', '20', '50']
    this.loadData(1)
  },
  watch: {
    dataSource(newVal, oldVal) {
      setTimeout(() => {
        this.$emit('ok', newVal)
        
      }, 800);
    }
  },
  methods: {
    batchUp(type) {
      // 因为都是框架，直接传对象就能处理
      // 批量操作 ok==批量确认面试 stop==批量暂停邀约
      let that = this
      let state = '已确认面试'
      if (type == 'stop') {
        state = '暂停邀约'
      }
      let arr = JSON.parse(JSON.stringify(this.selectionRows))
      arr.forEach((item) => {
        item.dqzt = state
      })
      this.$confirm({
        title: '提醒',
        content: `当前选中数据，将进行批量${type == 'ok' ? '确认面试' : '暂停邀约'}操作，是否确认`,
        okText: '确认',
        cancelText: '取消',
        onOk() {
          httpAction(that.url[type], arr, 'post').then((res) => {
            if (res.success) {
              that.$message.success(res.message || '操作成功')
              that.loadData()
              that.onClearSelected();
            } else {
              that.$message.warning(res.message || '操作失败')
            }
          })
        },
        onCancel() {
          console.log('Cancel')
        },
      })
    },
    dqztType(text){
      switch (text) {
        case '待邀约':
          return 'blue'
        case '已邀约':
          return 'cyan'
        case '已确认面试':
          return 'green'
        case '不通过':
        case '放弃面试':
          return 'red'
        case '暂停邀约':
          return 'orange'
      }
    },
    formatValue(value) {
      return value === undefined || value === null || (typeof value === 'string' && value.trim() === '') ? '-' : value
    },
    handleTabChange() {
      // TODO: tabs 暂不过滤，后续接入按邀约状态过滤
      this.queryParam['dqzt'] = this.activeTab === 'all' ? '' : this.activeTab
      this.loadData(1)
      this.onClearSelected()
    },
    searchReset() {
      this.queryParam.xm = ''
      this.queryParam.xl = ''
      this.loadData(1)
      this.onClearSelected()
    },
    handleDetail(record) {
      this.$refs.processModal.detail(record)
    },
    handleBatchInvite() {
      if (!this.selectionRows.length) {
        this.$message.warning('请先勾选简历')
        return
      }
      this.$refs.processModal.batchInvite(this.selectionRows)
    },
    handleBatchEliminate() {
      if (!this.selectionRows.length) {
        this.$message.warning('请先勾选简历')
        return
      }
      this.$refs.processModal.batchEliminate(this.selectionRows)
    },
    handleProcessOk() {
      this.onClearSelected()
      this.loadData(this.ipagination.current)
    }
  }
}
</script>

<style scoped lang="less">
.resume-interview-table {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.state-tabs {
  flex-shrink: 0;
  margin-bottom: 4px;

  /deep/ .ant-tabs-bar {
    margin-bottom: 8px;
  }
}

.rit-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 6px 0;

  /deep/ .ant-form-item {
    margin-bottom: 4px;
    margin-right: 12px;
  }
}

.rit-toolbar-right {
  flex-shrink: 0;
}

.batch-bar {
  display: flex;
  align-items: center;
  margin: 6px 0;
  padding: 8px 12px;
  border: 1px solid #d6e8ff;
  border-radius: 6px;
  background: #f0f7ff;
  justify-content: space-between;
}

.batch-selected {
  color: #1890ff;
  font-size: 13px;

  b {
    margin: 0 2px;
  }
}

.batch-clear {
  margin-left: 12px;
}

.batch-btns {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 10px;

  >button {
    font-size: 12px;
  }
}

.batch-tip {
  color: #8c8c8c;
  font-size: 12px;
}

/deep/ .ant-table-body {
  overflow-y: auto !important;
}

.dqzt-empty {
  color: #bfbfbf;
}

.row-delete {
  color: #f5222d;
}

/* ===== 按钮 ===== */
.pm-btn-primary {
  height: 32px;
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

.pm-btn-primary[disabled] {
  background: linear-gradient(135deg, #e8e8e8 0%, #ccc 100%);
  color: #ffffff;
  box-shadow: none;

}

.pm-btn-reset {
  height: 32px;
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

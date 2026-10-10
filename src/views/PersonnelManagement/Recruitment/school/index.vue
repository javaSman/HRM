<template>
  <div class="school-page">
    <div class="school-page-header">
      <!-- <div class="school-page-title">高校名单</div> -->
      <div class="school-page-title"></div>
      <div class="table-operator school-operator">
        <a-button
          v-if="selectedRowKeys.length"
          type="primary"
          class="pm-btn-primary"
          icon="delete"
          @click="batchDel"
        >批量删除</a-button>
        <a-button type="primary" class="pm-btn-primary" icon="download" @click="handleExportXls('高校名单')">
          导出
        </a-button>
        <a-upload
          name="file"
          :showUploadList="false"
          :multiple="false"
          :headers="tokenHeader"
          :action="importExcelUrlNew"
          @change="handleImportExcelNew"
        >
          <a-button type="primary" class="pm-btn-primary" icon="import">导入</a-button>
        </a-upload>
        <j-super-query
          ref="superQueryModal"
          :fieldList="superFieldList"
          @handleSuperQuery="handleSuperQuery"
        ></j-super-query>
        <a-button type="primary" class="pm-btn-primary" icon="plus" @click="handleAdd">新增高校</a-button>
      </div>
    </div>

    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="5" :lg="6" :md="8" :sm="12" :xs="24">
            <a-form-item label="学校名称">
              <j-input v-model.trim="queryParam.xxmc" allowClear placeholder="请输入学校名称" />
            </a-form-item>
          </a-col>
          <a-col :xl="5" :lg="6" :md="8" :sm="12" :xs="24">
            <a-form-item label="联系人">
              <a-input v-model.trim="queryParam.lxr" allowClear placeholder="请输入联系人" />
            </a-form-item>
          </a-col>
          <a-col :xl="5" :lg="6" :md="8" :sm="12" :xs="24">
            <a-form-item label="联系方式">
              <a-input v-model.trim="queryParam.lxfs" allowClear placeholder="请输入联系方式" />
            </a-form-item>
          </a-col>
          <a-col :xl="5" :lg="6" :md="8" :sm="12" :xs="24">
            <span class="table-page-search-submitButtons">
              <a-button type="primary" class="pm-btn-primary" icon="search" @click="searchQuery">查询</a-button>
              <a-button class="pm-btn-reset" icon="reload" @click="searchReset">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!-- <a-alert type="info" showIcon class="selection-alert">
      <span slot="message">
        已选择 <a class="selected-count">{{ selectedRowKeys.length }}</a> 项
        <a class="clear-selection" @click="onClearSelected">清空</a>
      </span>
    </a-alert> -->

    <a-table
      ref="table"
      size="middle"
      :scroll="{ x: 1500 }"
      bordered
      rowKey="id"
      :columns="columns"
      :dataSource="dataSource"
      :pagination="ipagination"
      :loading="loading"
      :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      class="j-table-force-nowrap school-table"
      @change="handleTableChange"
    >
      <span slot="rowIndex" slot-scope="text, record, index">{{ getRowIndex(index) }}</span>
      <span slot="ellipsisText" slot-scope="text">
        <a-tooltip v-if="text" :title="text">
          <span class="description-text">{{ text }}</span>
        </a-tooltip>
        <span v-else>-</span>
      </span>
      <span slot="action" slot-scope="text, record">
        <a @click="handleDetail(record)">详情</a>
        <a-divider type="vertical" />
        <a @click="handleEdit(record)">编辑</a>
        <a-divider type="vertical" />
        <a-popconfirm title="确定删除该高校吗？" @confirm="() => handleDelete(record.id)">
          <a class="delete-action">删除</a>
        </a-popconfirm>
      </span>
    </a-table>

    <hrm-gxmd-modal ref="modalForm" @ok="modalFormOk" />
    <hrm-gxmd-detail-modal ref="detailModal" />
  </div>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { mixinDevice } from '@/utils/mixin'
import { createSchoolQuery, getSchoolColumns, getSchoolSuperFields } from './schoolConfig'
import HrmGxmdModal from './modules/HrmGxmdModal.vue'
import HrmGxmdDetailModal from './modules/HrmGxmdDetailModal.vue'

export default {
  name: 'HrmGxmdList',
  mixins: [JeecgListMixin, mixinDevice],
  components: { HrmGxmdModal, HrmGxmdDetailModal },
  data() {
    return {
      queryParam: createSchoolQuery(),
      columns: getSchoolColumns(),
      superFieldList: getSchoolSuperFields(),
      url: {
        list: '/zpManage/hrmGxmd/list',
        delete: '/zpManage/hrmGxmd/delete',
        deleteBatch: '/zpManage/hrmGxmd/deleteBatch',
        exportXlsUrl: '/zpManage/hrmGxmd/exportXls',
        importExcelUrl: '/zpManage/hrmGxmd/importExcel',
        importExcelUrlNewName: 'HrmGxmd'
      }
    }
  },
  created() {
    this.ipagination.pageSize = 10
    this.ipagination.pageSizeOptions = ['10', '20', '50']
  },
  methods: {
    initDictConfig() {},
    getRowIndex(index) {
      return (this.ipagination.current - 1) * this.ipagination.pageSize + index + 1
    },
    searchReset() {
      this.queryParam = createSchoolQuery()
      this.loadData(1)
      this.onClearSelected()
    },
    handleAdd() {
      this.$refs.modalForm.add()
    },
    handleEdit(record) {
      this.$refs.modalForm.edit(record)
    },
    handleDetail(record) {
      this.$refs.detailModal.open(record)
    }
  }
}
</script>

<style scoped lang="less">
@import '~@assets/less/common.less';
@import './school.less';
</style>

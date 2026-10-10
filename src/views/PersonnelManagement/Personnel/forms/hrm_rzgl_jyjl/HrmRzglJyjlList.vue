<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('入职管理_员工教育经历')">导出</a-button>
      <!-- 前端 代码生成位置 做个标记
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload>
      <a-button type="primary" icon="download" @click="handleExportXlsNew('HrmRzglJyjl','入职管理_员工教育经历')">导出</a-button>
      -->
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrlNew" @change="handleImportExcelNew">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload>
      <!-- 高级查询区域 -->
      <j-super-query :fieldList="superFieldList" ref="superQueryModal" @handleSuperQuery="handleSuperQuery"></j-super-query>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>
    </div>

    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table
        ref="table"
        size="middle"
        :scroll="{x:true}"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        class="j-table-force-nowrap"
        @change="handleTableChange">

        <template slot="htmlSlot" slot-scope="text">
          <div v-html="text"></div>
        </template>
        <template slot="imgSlot" slot-scope="text,record">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无图片</span>
          <img v-else :src="getImgView(text)" :preview="record.id" height="25px" alt="" style="max-width:80px;font-size: 12px;font-style: italic;"/>
        </template>
        <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
          <a-button
            v-else
            :ghost="true"
            type="primary"
            icon="download"
            size="small"
            @click="downloadFile(text)">
            下载
          </a-button>
        </template>

        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>

          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a @click="handleDetail(record)">详情</a>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>

    <hrm-rzgl-jyjl-modal ref="modalForm" @ok="modalFormOk"></hrm-rzgl-jyjl-modal>
  </a-card>
</template>

<script>

  import '@/assets/less/TableExpand.less'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import HrmRzglJyjlModal from './modules/HrmRzglJyjlModal'

  export default {
    name: 'HrmRzglJyjlList',
    mixins:[JeecgListMixin, mixinDevice],
    components: {
      HrmRzglJyjlModal
    },
    data () {
      return {
        description: '入职管理_员工教育经历管理页面',
        // 表头
        columns: [
          {
            title: '#',
            dataIndex: '',
            key:'rowIndex',
            width:60,
            align:"center",
            customRender:function (t,r,index) {
              return parseInt(index)+1;
            }
          },
          {
            title:'关联员工工号',
            align:"center",
            dataIndex: 'ghId'
          },
          {
            title:'学历层次',
            align:"center",
            dataIndex: 'xlcc'
          },
          {
            title:'毕业院校/机构',
            align:"center",
            dataIndex: 'byyxjg'
          },
          {
            title:'专业',
            align:"center",
            dataIndex: 'zy'
          },
          {
            title:'入学时间',
            align:"center",
            dataIndex: 'rxsj',
            customRender:function (text) {
              return !text?"":(text.length>10?text.substr(0,10):text)
            }
          },
          {
            title:'毕业时间',
            align:"center",
            dataIndex: 'bysj',
            customRender:function (text) {
              return !text?"":(text.length>10?text.substr(0,10):text)
            }
          },
          {
            title:'学位',
            align:"center",
            dataIndex: 'xw'
          },
          {
            title:'证书编号',
            align:"center",
            dataIndex: 'zsbh'
          },
          {
            title:'专业/培训内容',
            align:"center",
            dataIndex: 'zypxnr'
          },
          {
            title:'证书附件',
            align:"center",
            dataIndex: 'zsfj'
          },
          {
            title:'主表',
            align:"center",
            dataIndex: 'hrmRzglId'
          },
          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            fixed:"right",
            width:147,
            scopedSlots: { customRender: 'action' }
          }
        ],
        url: {
          list: "/ryManage/hrmRzglJyjl/list",
          delete: "/ryManage/hrmRzglJyjl/delete",
          deleteBatch: "/ryManage/hrmRzglJyjl/deleteBatch",
          exportXlsUrl: "/ryManage/hrmRzglJyjl/exportXls",
          importExcelUrl: "ryManage/hrmRzglJyjl/importExcel",
          importExcelUrlNewName: 'HrmRzglJyjl',
          
        },
        dictOptions:{},
        superFieldList:[],
      }
    },
    created() {
    this.getSuperFieldList();
    },
    computed: {
      importExcelUrl: function(){
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
      },
    },
    methods: {
      initDictConfig(){
      },
      getSuperFieldList(){
        let fieldList=[];
        fieldList.push({type:'string',value:'ghId',text:'关联员工工号',dictCode:''})
        fieldList.push({type:'string',value:'xlcc',text:'学历层次',dictCode:''})
        fieldList.push({type:'string',value:'byyxjg',text:'毕业院校/机构',dictCode:''})
        fieldList.push({type:'string',value:'zy',text:'专业',dictCode:''})
        fieldList.push({type:'date',value:'rxsj',text:'入学时间'})
        fieldList.push({type:'date',value:'bysj',text:'毕业时间'})
        fieldList.push({type:'string',value:'xw',text:'学位',dictCode:''})
        fieldList.push({type:'string',value:'zsbh',text:'证书编号',dictCode:''})
        fieldList.push({type:'string',value:'zypxnr',text:'专业/培训内容',dictCode:''})
        fieldList.push({type:'Text',value:'zsfj',text:'证书附件',dictCode:''})
        fieldList.push({type:'string',value:'hrmRzglId',text:'主表',dictCode:''})
        this.superFieldList = fieldList
      }
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>

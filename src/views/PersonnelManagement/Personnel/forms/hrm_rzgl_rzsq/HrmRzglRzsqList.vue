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
      <a-button type="primary" icon="download" @click="handleExportXls('入职管理_入住申请')">导出</a-button>
      <!-- 前端 代码生成位置 做个标记
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload>
      <a-button type="primary" icon="download" @click="handleExportXlsNew('HrmRzglRzsq','入职管理_入住申请')">导出</a-button>
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

    <hrm-rzgl-rzsq-modal ref="modalForm" @ok="modalFormOk"></hrm-rzgl-rzsq-modal>
  </a-card>
</template>

<script>

  import '@/assets/less/TableExpand.less'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import HrmRzglRzsqModal from './modules/HrmRzglRzsqModal'
  import {filterMultiDictText} from '@/components/dict/JDictSelectUtil'

  export default {
    name: 'HrmRzglRzsqList',
    mixins:[JeecgListMixin, mixinDevice],
    components: {
      HrmRzglRzsqModal
    },
    data () {
      return {
        description: '入职管理_入住申请管理页面',
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
            title:'主表',
            align:"center",
            dataIndex: 'hrmRzglId'
          },
          {
            title:'区域',
            align:"center",
            dataIndex: 'qy'
          },
          {
            title:'所属部门',
            align:"center",
            dataIndex: 'dept'
          },
          {
            title:'工号',
            align:"center",
            dataIndex: 'gh'
          },
          {
            title:'姓名',
            align:"center",
            dataIndex: 'xm'
          },
          {
            title:'身份证号',
            align:"center",
            dataIndex: 'sfzh'
          },
          {
            title:'手机号码',
            align:"center",
            dataIndex: 'sjhm'
          },
          {
            title:'入住日期',
            align:"center",
            dataIndex: 'rzrq'
          },
          {
            title:'宿舍类型',
            align:"center",
            dataIndex: 'sslx'
          },
          {
            title:'入住原因',
            align:"center",
            dataIndex: 'rzyy'
          },
          {
            title:'申请时间',
            align:"center",
            dataIndex: 'sqsj'
          },
          {
            title:'审批人',
            align:"center",
            dataIndex: 'spr'
          },
          {
            title:'抄送人',
            align:"center",
            dataIndex: 'csr'
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
          list: "/ryManage/hrmRzglRzsq/list",
          delete: "/ryManage/hrmRzglRzsq/delete",
          deleteBatch: "/ryManage/hrmRzglRzsq/deleteBatch",
          exportXlsUrl: "/ryManage/hrmRzglRzsq/exportXls",
          importExcelUrl: "ryManage/hrmRzglRzsq/importExcel",
          importExcelUrlNewName: 'HrmRzglRzsq',
          
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
        fieldList.push({type:'string',value:'hrmRzglId',text:'主表',dictCode:''})
        fieldList.push({type:'string',value:'qy',text:'区域',dictCode:''})
        fieldList.push({type:'string',value:'dept',text:'所属部门',dictCode:"sys_depart,depart_name,id"})
        fieldList.push({type:'string',value:'gh',text:'工号',dictCode:''})
        fieldList.push({type:'string',value:'xm',text:'姓名',dictCode:''})
        fieldList.push({type:'string',value:'sfzh',text:'身份证号',dictCode:''})
        fieldList.push({type:'string',value:'sjhm',text:'手机号码',dictCode:''})
        fieldList.push({type:'string',value:'rzrq',text:'入住日期',dictCode:''})
        fieldList.push({type:'string',value:'sslx',text:'宿舍类型',dictCode:''})
        fieldList.push({type:'string',value:'rzyy',text:'入住原因',dictCode:''})
        fieldList.push({type:'string',value:'sqsj',text:'申请时间',dictCode:''})
        fieldList.push({type:'string',value:'spr',text:'审批人',dictCode:''})
        fieldList.push({type:'string',value:'csr',text:'抄送人',dictCode:''})
        this.superFieldList = fieldList
      }
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>

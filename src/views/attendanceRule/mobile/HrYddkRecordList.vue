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
      <a-button type="primary" icon="download" @click="handleExportXls('移动打卡记录')">导出</a-button>
      <!-- 前端 代码生成位置 做个标记
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload>
      <a-button type="primary" icon="download" @click="handleExportXlsNew('HrYddkRecord','移动打卡记录')">导出</a-button>
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

    <!-- <hr-yddk-record-modal ref="modalForm" @ok="modalFormOk"></hr-yddk-record-modal> -->
  </a-card>
</template>

<script>

  import '@/assets/less/TableExpand.less'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  // import HrYddkRecordModal from './modules/HrYddkRecordModal'
  import {filterMultiDictText} from '@/components/dict/JDictSelectUtil'

  export default {
    name: 'HrYddkRecordList',
    mixins:[JeecgListMixin, mixinDevice],
    components: {
      // HrYddkRecordModal
    },
    data () {
      return {
        description: '移动打卡记录管理页面',
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
            title:'员工工号',
            align:"center",
            dataIndex: 'no'
          },
          {
            title:'员工ID',
            align:"center",
            dataIndex: 'employee'
          },
          {
            title:'班次',
            align:"center",
            dataIndex: 'shift'
          },
          {
            title:'打卡日期',
            align:"center",
            dataIndex: 'checkindate'
          },
          {
            title:'打卡时间',
            align:"center",
            dataIndex: 'checkintime'
          },
          {
            title:'状态',
            align:"center",
            dataIndex: 'status'
          },
          {
            title:'打卡方式',
            align:"center",
            dataIndex: 'checkinway'
          },
          {
            title:'打卡方式id',
            align:"center",
            dataIndex: 'checkinwayid'
          },
          {
            title:'是否补卡',
            align:"center",
            dataIndex: 'isreissuecard'
          },
          {
            title:'原打卡时间',
            align:"center",
            dataIndex: 'origcheckintime'
          },
          {
            title:'打卡类型',
            align:"center",
            dataIndex: 'type'
          },
          {
            title:'打卡日期时间',
            align:"center",
            dataIndex: 'checkindatetime'
          },
          {
            title:'班次时间段',
            align:"center",
            dataIndex: 'shifttime'
          },
          {
            title:'纬度',
            align:"center",
            dataIndex: 'latitude'
          },
          {
            title:'经度',
            align:"center",
            dataIndex: 'longitude'
          },
          {
            title:'打卡点',
            align:"center",
            dataIndex: 'location'
          },
          {
            title:'所属公司',
            align:"center",
            dataIndex: 'createbycompany'
          },
          {
            title:'关联移动打卡申请单id',
            align:"center",
            dataIndex: 'hrYddksqId'
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
          list: "/hr_yddk_record/hrYddkRecord/list",
          delete: "/hr_yddk_record/hrYddkRecord/delete",
          deleteBatch: "/hr_yddk_record/hrYddkRecord/deleteBatch",
          exportXlsUrl: "/hr_yddk_record/hrYddkRecord/exportXls",
          importExcelUrl: "hr_yddk_record/hrYddkRecord/importExcel",
          importExcelUrlNewName: 'HrYddkRecord',
          
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
        fieldList.push({type:'string',value:'no',text:'员工工号',dictCode:''})
        fieldList.push({type:'string',value:'employee',text:'员工ID',dictCode:''})
        fieldList.push({type:'string',value:'shift',text:'班次',dictCode:''})
        fieldList.push({type:'string',value:'checkindate',text:'打卡日期',dictCode:''})
        fieldList.push({type:'string',value:'checkintime',text:'打卡时间',dictCode:''})
        fieldList.push({type:'string',value:'status',text:'状态',dictCode:'dkstatus'})
        fieldList.push({type:'string',value:'checkinway',text:'打卡方式',dictCode:'checkinWay'})
        fieldList.push({type:'string',value:'checkinwayid',text:'打卡方式id',dictCode:''})
        fieldList.push({type:'string',value:'isreissuecard',text:'是否补卡',dictCode:'isReissueCard'})
        fieldList.push({type:'string',value:'origcheckintime',text:'原打卡时间',dictCode:''})
        fieldList.push({type:'string',value:'type',text:'打卡类型',dictCode:'checkInType'})
        fieldList.push({type:'string',value:'checkindatetime',text:'打卡日期时间',dictCode:''})
        fieldList.push({type:'string',value:'shifttime',text:'班次时间段',dictCode:''})
        fieldList.push({type:'string',value:'latitude',text:'纬度',dictCode:''})
        fieldList.push({type:'string',value:'longitude',text:'经度',dictCode:''})
        fieldList.push({type:'Text',value:'location',text:'打卡点',dictCode:''})
        fieldList.push({type:'string',value:'createbycompany',text:'所属公司',dictCode:''})
        fieldList.push({type:'string',value:'hrYddksqId',text:'关联移动打卡申请单id',dictCode:''})
        this.superFieldList = fieldList
      }
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>

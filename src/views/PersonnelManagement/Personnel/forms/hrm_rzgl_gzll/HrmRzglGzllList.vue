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
      <a-button type="primary" icon="download" @click="handleExportXls('入职管理_员工工作履历')">导出</a-button>
      <!-- 前端 代码生成位置 做个标记
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload>
      <a-button type="primary" icon="download" @click="handleExportXlsNew('HrmRzglGzll','入职管理_员工工作履历')">导出</a-button>
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

    <hrm-rzgl-gzll-modal ref="modalForm" @ok="modalFormOk"></hrm-rzgl-gzll-modal>
  </a-card>
</template>

<script>

  import '@/assets/less/TableExpand.less'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import HrmRzglGzllModal from './modules/HrmRzglGzllModal'

  export default {
    name: 'HrmRzglGzllList',
    mixins:[JeecgListMixin, mixinDevice],
    components: {
      HrmRzglGzllModal
    },
    data () {
      return {
        description: '入职管理_员工工作履历管理页面',
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
            title:'工作单位',
            align:"center",
            dataIndex: 'gzdw'
          },
          {
            title:'所属行业',
            align:"center",
            dataIndex: 'sshy'
          },
          {
            title:'任职岗位',
            align:"center",
            dataIndex: 'rzgw'
          },
          {
            title:'在职起始时间',
            align:"center",
            dataIndex: 'zzqssj',
            customRender:function (text) {
              return !text?"":(text.length>10?text.substr(0,10):text)
            }
          },
          {
            title:'在职结束时间',
            align:"center",
            dataIndex: 'zzjssj',
            customRender:function (text) {
              return !text?"":(text.length>10?text.substr(0,10):text)
            }
          },
          {
            title:'近半年平均工资(k)',
            align:"center",
            dataIndex: 'jbnpjgz'
          },
          {
            title:'离职原因',
            align:"center",
            dataIndex: 'lzyy'
          },
          {
            title:'证明人姓名',
            align:"center",
            dataIndex: 'zmrxm'
          },
          {
            title:'证明人联系电话',
            align:"center",
            dataIndex: 'zmrlxdh'
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
          list: "/ryManage/hrmRzglGzll/list",
          delete: "/ryManage/hrmRzglGzll/delete",
          deleteBatch: "/ryManage/hrmRzglGzll/deleteBatch",
          exportXlsUrl: "/ryManage/hrmRzglGzll/exportXls",
          importExcelUrl: "ryManage/hrmRzglGzll/importExcel",
          importExcelUrlNewName: 'HrmRzglGzll',
          
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
        fieldList.push({type:'string',value:'gzdw',text:'工作单位',dictCode:''})
        fieldList.push({type:'string',value:'sshy',text:'所属行业',dictCode:''})
        fieldList.push({type:'string',value:'rzgw',text:'任职岗位',dictCode:''})
        fieldList.push({type:'date',value:'zzqssj',text:'在职起始时间'})
        fieldList.push({type:'date',value:'zzjssj',text:'在职结束时间'})
        fieldList.push({type:'int',value:'jbnpjgz',text:'近半年平均工资(k)',dictCode:''})
        fieldList.push({type:'string',value:'lzyy',text:'离职原因',dictCode:''})
        fieldList.push({type:'string',value:'zmrxm',text:'证明人姓名',dictCode:''})
        fieldList.push({type:'string',value:'zmrlxdh',text:'证明人联系电话',dictCode:''})
        fieldList.push({type:'string',value:'hrmRzglId',text:'主表',dictCode:''})
        this.superFieldList = fieldList
      }
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>

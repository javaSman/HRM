<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="4" :lg="4" :md="4" :sm="24">
            <a-form-item label="短信厂商">
              <j-dict-select-tag placeholder="请选择短信厂商" v-model="queryParam.provider" dictCode="sms_provider"/>
            </a-form-item>
          </a-col>
          <a-col :xl="4" :lg="4" :md="4" :sm="24">
            <a-form-item label="发送状态">
              <j-dict-select-tag placeholder="请选择发送状态" v-model="queryParam.sendStatus" dictCode="sms_send_status"/>
            </a-form-item>
          </a-col>
          <a-col :xl="4" :lg="4" :md="4" :sm="24">
            <a-form-item label="业务类型">
              <j-dict-select-tag placeholder="请选择业务类型" v-model="queryParam.businessType" dictCode="business_type"/>
            </a-form-item>
          </a-col>
          <a-col :xl="4" :lg="4" :md="4" :sm="24">
            <a-form-item label="发送时间">
              <j-date :show-time="true" date-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择发送时间" v-model="queryParam.sendTime"></j-date>
            </a-form-item>
          </a-col>
          <a-col :xl="4" :lg="4" :md="4" :sm="24">
            <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
            <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('业务短信记录')">导出</a-button>
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
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
                <a-popconfirm title="确定重新发送吗?" @confirm="() => handleAgainSend(record.id)">
                  <a>重新发送</a>
                </a-popconfirm>
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

    <zt-sys-sms-modal ref="modalForm" @ok="modalFormOk"></zt-sys-sms-modal>
  </a-card>
</template>

<script>

  import '@/assets/less/TableExpand.less'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import ZtSysSmsModal from './modules/ZtSysSmsModal'
  import {filterMultiDictText} from '@/components/dict/JDictSelectUtil'
  import {postAction} from '@api/manage'

  export default {
    name: 'ZtSysSmsList',
    mixins:[JeecgListMixin, mixinDevice],
    components: {
      ZtSysSmsModal
    },
    data () {
      return {
        description: '业务短信记录管理页面',
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
            title:'业务类型',
            align:"center",
            dataIndex: 'businessType_dictText'
          },
          {
            title:'短信厂商',
            align:"center",
            dataIndex: 'provider_dictText'
          },
          {
            title:'手机号',
            align:"center",
            dataIndex: 'phone'
          },
          {
            title:'内容',
            align:"center",
            dataIndex: 'content',
            customRender: (text) => {
              return  <span class="col-sql" title= {text}>{text}</span>
            }
          },
          {
            title:'发送状态',
            align:"center",
            dataIndex: 'sendStatus_dictText'
          },

          {
            title:'发送时间',
            align:"center",
            dataIndex: 'sendTime'
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
          list: "/ztSystem/ztSysSms/list",
          againSend: "/ztSystem/ztSysSms/againSend",
          delete: "/ztSystem/ztSysSms/delete",
          deleteBatch: "/ztSystem/ztSysSms/deleteBatch",
          exportXlsUrl: "/ztSystem/ztSysSms/exportXls",
          importExcelUrl: "ztSystem/ztSysSms/importExcel",

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
        fieldList.push({type:'string',value:'phone',text:'手机号',dictCode:''})
        fieldList.push({type:'string',value:'content',text:'内容',dictCode:''})
        fieldList.push({type:'string',value:'provider',text:'短信厂商',dictCode:'sms_provider'})
        fieldList.push({type:'string',value:'sendStatus',text:'发送状态(待发送0，成功1，失败)',dictCode:'sms_send_status'})
        fieldList.push({type:'string',value:'businessType',text:'业务类型',dictCode:'business_type'})
        fieldList.push({type:'datetime',value:'sendTime',text:'发送时间'})
        this.superFieldList = fieldList
      },
      /**
       * {"tableName":"sys_tag","showName":"name","storageName":"id","where":"template_code='menu_sys_role'","placeholder":"选择分类菜单","type":"list"}
       * 重新发送
       * @param id
       */
      handleAgainSend(id){
        postAction(`${this.url.againSend}?id=${id}`).then(res=>{
          if (res.success){
            this.$message.success(res.message)
          }else {
            this.$message.error(res.message)
          }
        })
      }

    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
  .col-sql{

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
    width: 150px;
  }
</style>
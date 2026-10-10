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
      <a-row style='display: flex;padding-top: 10px;' >
        <a-col :xl='7' :lg='7' :md='8' :sm='24'>
          <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
          <!--      <a-button type="primary" icon="download" @click="handleExportXls('全局统计条件记录表')">导出</a-button>-->
          <!--      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">-->
          <!--        <a-button type="primary" icon="import">导入</a-button>-->
          <!--      </a-upload>-->
          <!-- 高级查询区域 -->
          <j-super-query :fieldList="superFieldList" ref="superQueryModal" @handleSuperQuery="handleSuperQuery"></j-super-query>
          <a-dropdown v-if="selectedRowKeys.length > 0">
            <a-menu slot="overlay">
              <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>删除</a-menu-item>
            </a-menu>
            <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
          </a-dropdown>
          <a-button v-if="selectedRowKeys.length > 0" @click="getData" type="primary" icon="fund">获取数据</a-button>

          <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
        </a-col>
        <a-col :xl='3' :lg='7' :md='8' :sm='24'>
          <div class='labelName'>
            内置变量 <br/>
            (涉及高级查询都适用):
          </div>
        </a-col>

        <a-col :xl='7' :lg='7' :md='8' :sm='24' >

          <span class='Tip'>#{sys_user_code}:</span>  当前登录用户登录账号
          <br />
          <span class='Tip'>#{sys_user_name}:</span>  当前登录用户真实名称
          <br />
          <span class='Tip'>#{sys_date}:</span>   当前系统日期(yyyy-MM-dd)
          <br />
          <span class='Tip'>#{sys_time}:</span>   当前系统时间(yyyy-MM-dd HH:mm:ss)
          <br />
          <span class='Tip'>#{sys_org_code}:</span>   当前登录用户部门编号
          <br />
        </a-col>
        <a-col :xl='7' :lg='7' :md='8' :sm='24'>
          <span class='Tip'>#{null}:</span>   代表null
          <br />
          <span class='Tip'>#{empty}:</span>  代表空串
          <br />
          <span class='Tip'>#{sys_multi_org_code}:</span>   当前登录用户拥有的所有机构编码，逗号分隔
          <br />
          <span class='Tip'>#{tenant_id}:</span>   当前登录用户租户ID
          <br />
        </a-col>

      </a-row>


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
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: myOnSelectChange}"
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

    <zt-tj-info-modal ref="modalForm" @ok="modalFormOk"></zt-tj-info-modal>

    <a-modal v-model="resultShow" @ok="handleOk" width="50%">
      <a-descriptions bordered title="请求示例" size="small" :column="{ xs: 1, sm: 1, md: 1}">
        <a-descriptions-item label="请求数据类型">
          {{ resultInfo['请求数据类型'] }}
        </a-descriptions-item>
        <a-descriptions-item label="请求方式">
          {{ resultInfo['请求方式'] }}
        </a-descriptions-item>
        <a-descriptions-item label="地址">
          {{ resultInfo['地址'] }}
        </a-descriptions-item>
        <a-descriptions-item label="请求参数">
          {{ resultInfo['请求参数'] }}
        </a-descriptions-item>
        <a-descriptions-item label="响应数据">
<!--          {{ resultInfo['响应数据'] }}-->
          <json-formatter  :value=" JSON.stringify(resultInfo['响应数据'])"></json-formatter>
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </a-card>
</template>

<script>

  import '@/assets/less/TableExpand.less'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import ZtTjInfoModal from './modules/ZtTjInfoModal'
  import jsonFormatter from "@comp/common/showComponent/JsonFormatter";
  import { getAction, postAction } from '@api/manage'

  export default {
    name: 'ZtTjInfoList',
    mixins:[JeecgListMixin, mixinDevice],
    components: {
      ZtTjInfoModal,
      jsonFormatter
    },
    watch:{
      // 深度监听 demo
      menuId:{
        handler(val) {
          this.queryParam.menuId = val;
          this.loadData(1);
        },
        immediate: true,
      }
    },

    props: {
      menuId: {
        type: String,
        required: true
      }
    },

    data () {
      return {
        description: '全局统计条件记录表管理页面',
        // 表头
        columns: [
          {
            title: '序号',
            dataIndex: '',
            key:'rowIndex',
            width:60,
            align:"center",
            customRender:function (t,r,index) {
              return parseInt(index)+1;
            }
          },
          {
            title:'编码',
            align:"center",
            dataIndex: 'code'
          },
          {
            title:'备注',
            align:"center",
            dataIndex: 'name'
          },
          // {
          //   title:'统计信息',
          //   align:"center",
          //   dataIndex: 'json'
          // },
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
          list: "/commonTj/ztTjInfo/list",
          delete: "/commonTj/ztTjInfo/delete",
          deleteBatch: "/commonTj/ztTjInfo/deleteBatch",
          exportXlsUrl: "/commonTj/ztTjInfo/exportXls",
          importExcelUrl: "commonTj/ztTjInfo/importExcel",

        },
        dictOptions:{},
        superFieldList:[],

        resultInfo:{},
        resultShow:false,
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

      myOnSelectChange(selectedRowKeys, selectionRows) {
        this.onSelectChange(selectedRowKeys, selectionRows)
        this.emitKey(selectedRowKeys, selectionRows)
      },



      // 返回选中的主键
      emitKey(selectedRowKeys,selectionRows){
        if (selectedRowKeys.length==1){
          let roleItem = selectionRows[0];
          this.$emit("getKey",roleItem);
        }else {
          this.$emit("getKey","");
        }
      },


      getSuperFieldList(){
        let fieldList=[];
        fieldList.push({type:'string',value:'code',text:'编码',dictCode:''})
        fieldList.push({type:'string',value:'name',text:'名称',dictCode:''})
        fieldList.push({type:'Text',value:'json',text:'统计信息',dictCode:''})
        this.superFieldList = fieldList
      },

      getData(){
        let codeArr = this.selectionRows.map(obj => obj.code);
        postAction("/commonTj/ztTjInfo/getReqExample",codeArr).then(res=>{
          console.log(res);
          if (!res.success){
            this.$message.error(res.message);
            return;
          }
          let result = res.result;
          postAction("/commonTj/ztTjInfo/getTjListByCodes", result['请求参数']).then(dataRes=>{
            result["响应数据"]=dataRes.result;
            //弹框显示
            // this.$confirm({
            //   title: '请求示例',
            //   content: JSON.stringify(result),
            //   okText: '关闭',
            // });
            this.resultInfo = result;
            this.resultShow = true;



          })
        })

      },
      handleOk(){
        this.resultShow=false;
      },
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
  .Tip {
    font-weight: bold;
  }
  .labelName {
    color: #1890FF;
    font-weight: bold;
    margin-top: 10px;
    /*margin: 10px 0px;*/
  }
</style>
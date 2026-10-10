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
        <a-col :xl='14' :lg='7' :md='8' :sm='24'>
          <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>

          <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
          <a-button type="primary" icon="download" @click="handleExportXls('系统变量记录表')">导出</a-button>
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
        </a-col>
        <a-col :xl='10' :lg='7' :md='8' :sm='24'>
          <div class='labelName'>
            根据code获取系统变量值
          </div>
          <span class="labelName"> 方式</span> GET <span class="labelName"> 请求的地址</span> /variableRescord/sysVariableRecord/getInfo/{code}
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
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: mySelectChange}"
        class="j-table-force-nowrap"
        @change="handleTableChange" :customRow="rowClick">

        <template slot="htmlSlot" slot-scope="text">
          <div v-html="text"></div>
        </template>
        <template slot="imgSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无图片</span>
          <img v-else :src="getImgView(text)" height="25px" alt="" style="max-width:80px;font-size: 12px;font-style: italic;"/>
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
<!--          <a @click.stop="handleEdit(record)">编辑</a>-->
<!--          <a-divider type="vertical" />-->

          <a @click.stop="handleDetail(record)">详情</a>
          <a-divider type="vertical" />

          <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a  @click="handleEdit(record)" >编辑</a>
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

    <sys-variable-record-modal ref="modalForm" @ok="modalFormOk" :menu-id="menuId"></sys-variable-record-modal>

    <div v-show="false">
      <comme-popup ref="commePopup"  v-model="model.json" :title="rowClickTitle" :componentName="model.component" :parameter="model.componentPara" @ok="handlerOk" ></comme-popup>
    </div>
  </a-card>
</template>

<script>

  import '@/assets/less/TableExpand.less'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import SysVariableRecordModal from './modules/SysVariableRecordModal'
  import {filterMultiDictText} from '@/components/dict/JDictSelectUtil'
  import CommePopup from '@comp/ChoiceSelector/commePopup'
  import { httpAction, putAction } from '@api/manage'


  export default {
    name: 'SysVariableRecordList',
    mixins:[JeecgListMixin, mixinDevice],
    components: {
      CommePopup,
      SysVariableRecordModal
    },
    watch:{
      // 深度监听 demo
      menuId:{
        handler(val) {
          this.queryParam.menuId = val;
          this.loadData(1);
        },
        immediate: true,
      },
    },
    props: {
      menuId: {
        type: String,
        required: true
      },
      keyId:{
        type: String,
        required: false
      }
    },

    data () {
      return {
        value:"1",
        description: '系统变量记录表管理页面',
        model:{},
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
            title:'模块',
            align:"center",
            dataIndex: 'model'
          },
          {
            title:'类型',
            align:"center",
            dataIndex: 'type_dictText'
          },
          {
            title:'编码',
            align:"center",
            dataIndex: 'code'
          },
          {
            title:'值(json格式)',
            align:"center",
            dataIndex: 'json',
            customRender: (text) => {
              return  <span class="col-sql"  title= {text}>{text}</span>
            }
          },
          {
            title:'描述',
            align:"center",
            dataIndex: 'remarks',
            customRender: (text) => {
              return  <span class="col-sql"  title= {text}>{text}</span>
            }
          },
          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            width:147,
            scopedSlots: { customRender: 'action' }
          }
        ],
        url: {
          list: "/variableRescord/sysVariableRecord/list",
          delete: "/variableRescord/sysVariableRecord/delete",
          deleteBatch: "/variableRescord/sysVariableRecord/deleteBatch",
          exportXlsUrl: "/variableRescord/sysVariableRecord/exportXls",
          importExcelUrl: "variableRescord/sysVariableRecord/importExcel",

        },
        dictOptions:{},
        superFieldList:[],

        rowClickTitle:"",
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
      initDictConfig(e){
        console.log("123",e)
      },
      mySelectChange(selectedRowKeys, selectionRows){
        this.onSelectChange(selectedRowKeys, selectionRows);
        if (selectedRowKeys.length==1){
          let variableItem = selectionRows[0];
          this.$emit("getKey",variableItem);
        }else {
          this.$emit("getKey","");
        }
      },

      /**
       * 点击表格行触发
       * @param {Object} record - 行数据
       * @param {Number} index - 索引值
       * @return Function
       */
      rowClick(record, index) {
        let that  = this;
        return {
          on: {
            click: () => {
              if (!record.component){
                return;
              }
              that.model = Object.assign({}, record);
              this.rowClickTitle=record.model;
              that.$refs.commePopup.show();
            },
          }
        }
      },
      handlerOk() {
        // console.log("hahahah",this.model);

        putAction("/variableRescord/sysVariableRecord/edit",this.model).then((res)=>{
          if(res.success){
            this.$message.success(res.message);
            this.loadData();
          }else{
            this.$message.warning(res.message);
          }
        })
      },



      getSuperFieldList(){
        let fieldList=[];
        fieldList.push({type:'string',value:'model',text:'模块',dictCode:''})
        fieldList.push({type:'string',value:'type',text:'类型',dictCode:'sys_type'})
        fieldList.push({type:'string',value:'code',text:'编码',dictCode:''})
        fieldList.push({type:'Text',value:'json',text:'值(json格式)',dictCode:''})
        fieldList.push({type:'string',value:'remarks',text:'描述',dictCode:''})
        this.superFieldList = fieldList
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
    width: 200px;
  }

  .labelName {
    color: #1890FF;
    font-weight: bold;
    margin-top: 10px;
    /*margin: 10px 0px;*/
  }
</style>
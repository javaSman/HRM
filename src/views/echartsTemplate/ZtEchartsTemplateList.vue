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
      <a-button type="primary" icon="download" @click="handleExportXls('echarts模板表')">导出</a-button>
      <!-- 前端 代码生成位置 做个标记
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload>
      <a-button type="primary" icon="download" @click="handleExportXlsNew('ZtEchartsTemplate','echarts模板表')">导出</a-button>
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
        @change="handleTableChange" :customRow="rowClick">

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
          <a @click.stop="handleEdit(record)">编辑</a>

          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a @click.stop="handleDetail(record)">详情</a>
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



    <zt-echarts-template-modal ref="modalForm" @ok="modalFormOk"  :menu-id='menuId'></zt-echarts-template-modal>

    <div v-show="false" >
       <comme-popup  ref="commePopup" @change="myChange" v-model="model.ggOptionValue"  popType="drawer" title="图标参数" :componentName="'ObjJsonEdit'" :parameter="model.ggComponentPara"  @ok="handlerEdit" @close="handleCancel" >

         <a-row>
           <a-col :span="14">
            <!--      图表       -->
             <echarts-options style="width: 700px" :OptionValue="model.ggOptionValue"></echarts-options>
           </a-col>
           <a-col :span="10">
             <a-button @click="optionValueShow=!optionValueShow"> {{ optionValueShow? '隐藏':'显示' }}配置 </a-button>
             <json-formatter v-if="optionValueShow" :json-str="model.ggOptionValue"></json-formatter>
           </a-col>
         </a-row>


       </comme-popup>
    </div>
<!--{{ ggOptionValue }}-->

  </a-card>
</template>

<script>

  import '@/assets/less/TableExpand.less'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import ZtEchartsTemplateModal from './modules/ZtEchartsTemplateModal'
  import CommePopup from '@comp/ChoiceSelector/commePopup'
  import jsonFormatter from "@comp/common/showComponent/JsonFormatter.vue";
  import EchartsOptions from "@comp/common/showComponent/EchartsOptions.vue";
  import {putAction} from '@/api/manage';

  export default {
    name: 'ZtEchartsTemplateList',
    mixins:[JeecgListMixin, mixinDevice],
    components: {
      ZtEchartsTemplateModal,
      CommePopup,
      jsonFormatter,
      EchartsOptions
    },
    watch: {
      // 深度监听 demo
      menuId: {
        handler(val) {
          this.queryParam.menuId = val
          this.queryParam.flag = this.flag
          this.loadData()
        },
        immediate: true
      },
      keyId: {
        handler(val) {
          if (val != null && val != '') {
            this.selectedRowKeys =val.split(',')
          }
          // this.loadData();
        },
        immediate: true
      }
    },
    props: {
      menuId: {
        type: String,
        required: true
      },
      keyId: {
        type: String,
        required: false
      },
      isRadio: {
        type: Boolean,
        default: false,
        required: false
      }
    },

    data () {
      return {
        description: 'echarts模板表管理页面',
        optionValueShow: false,
        ms:"",
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
            title:'菜单目录',
            align:"center",
            dataIndex: 'menuId_dictText'
          },
          {
            title:'模板名称',
            align:"center",
            dataIndex: 'name'
          },
          {
            title:'模板code',
            align:"center",
            dataIndex: 'code'
          },
          {
            title:'组件参数配置',
            align:"center",
            dataIndex: 'componentPara'
          },
          {
            title:'配置值',
            align:"center",
            dataIndex: 'optionValue'
          },
          {
            title:'备注',
            align:"center",
            dataIndex: 'bz'
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
          list: "/echarts/ztEchartsTemplate/list",
          delete: "/echarts/ztEchartsTemplate/delete",
          deleteBatch: "/echarts/ztEchartsTemplate/deleteBatch",
          exportXlsUrl: "/echarts/ztEchartsTemplate/exportXls",
          importExcelUrl: "echarts/ztEchartsTemplate/importExcel",
          importExcelUrlNewName: 'ZtEchartsTemplate',

        },
        dictOptions:{},
        superFieldList:[],


        echartsTitle:"", //图表标题
        echartsVisible:false,
        interval: null, //定时器



        model:{
          id:null,
          ggOptionValue:"",
          ggComponentPara:"",
        },


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
              if (!record.optionValue){
                return;
              }
              let option = record.optionValue;
              if (!option){
                that.$message.warning("没有配置optionValue");
              }
              that.model.ggComponentPara = record.componentPara;
              that.model.id = record.id;
              that.handelShow();
              that.model.ggOptionValue = option;

            },
          }
        }
      },
      handelShow(){
        this.echartsVisible = true;
        this.$refs.commePopup.show();
        this.clearTimer();
        this.interval = setInterval(()=>{
          // this.$message.warning('执行中')
          this.$refs.commePopup.myChange();
        },1000)

      },
      handleCancel(){
        this.echartsVisible = false;
        this.clearTimer();
      },
      // 封装清除定时器的通用方法
      clearTimer() {
        if (this.interval) {
          clearInterval(this.interval);
          // this.$message.warning('清除')
          this.interval = null;
        }
      },
      myChange(value){
        // 如果本来就相等 无需刷新图标
        if (value === this.model.ggOptionValue){
          return
        }
        this.model.ggOptionValue = value;
      },
      //
      handlerEdit(){
        let item = {};

        item.id = this.model.id;
        item.optionValue = this.model.ggOptionValue;
        putAction("/echarts/ztEchartsTemplate/edit",item).then((res)=>{
          if(res.success){
            this.$message.success(res.message);
            this.loadData();
            this.handleCancel();
          }else{
            this.$message.warning(res.message);
          }
        })
      },



      initDictConfig(){
      },
      getSuperFieldList(){
        let fieldList=[];
        fieldList.push({type:'string',value:'menuId',text:'菜单id',dictCode:''})
        fieldList.push({type:'string',value:'name',text:'模板名称',dictCode:''})
        fieldList.push({type:'string',value:'code',text:'模板code',dictCode:''})
        fieldList.push({type:'Text',value:'componentPara',text:'组件参数配置',dictCode:''})
        fieldList.push({type:'Text',value:'optionValue',text:'配置值',dictCode:''})
        fieldList.push({type:'string',value:'bz',text:'备注',dictCode:''})
        this.superFieldList = fieldList
      },

    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';

  /* 自定义左侧 Modal 样式 */
  .custom-left-modal {
    background: #0a3069;
  }

</style>

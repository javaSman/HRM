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

    <!-- table区域-begin -->
    <div>
      

      <a-table v-if= "tableVisible"
        ref="table"
        size="middle"
        bordered
        rowKey="id"
        class="j-table-force-nowrap"
        :scroll="{x:true}"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        @change="handleTableChange"
        >

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
          <a @click="SubmitApplication(record)">提交申请</a>
        </span>

      </a-table>
    </div>
  </a-card>
</template>

<script>

  import {getOnlineFormItem,getOnlineColumns,getOnlineData} from "@/api/form";
  //import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import '@/assets/less/TableExpand.less'
  import { filterObj } from '@/utils/util';
  import { deleteAction, getAction,downFile,getFileAccessHttpUrl } from '@/api/manage'
  import Vue from 'vue'
  import { ACCESS_TOKEN, TENANT_ID } from "@/store/mutation-types"
  import {definitionStartByOnlineDataId} from "@/views/flowable/api/definition"
  
  export default {
    name: "OnlineTableList",
    //mixins:[JeecgListMixin],
    components: {
    },
    props: {
    },
    data () {
      return {
        description: 'online表单数据查询页面',
        taskForm: {
          returnTaskShow: false, // 是否展示回退表单
          delegateTaskShow: false, // 是否展示委派表单
          defaultTaskShow: true, // 默认处理
          sendUserShow: false, // 审批用户
          multiple: false,
          comment: "", // 意见内容
          commentFileDto: { //意见里的附件
            type: '',
            fileurl: ''
          }, 
          procInsId: "", // 流程实例编号
          instanceId: "", // 流程实例编号
          deployId: "", // 流程定义编号
          taskId: "", // 流程任务编号
          procDefId: "", // 流程编号
          businessKey: "", //业务主键编号
          dataId: "",//业务主键编号
          nodeType: "", //当前节点类型 目前只针对多实例会签做处理
          vars: "",
          targetKey: "",
          category: "",//流程类别，目前主要区别online与自定义使用
          onlineId: "",//online表单Id
          onlineDataId: "",//online数据Id
        },
        /* 数据源 */
        dataSource:[],
        url: {
            list: "",
        },          
        /* 分页参数 */
        ipagination:{
          current: 1,
          pageSize: 10,
          pageSizeOptions: ['10', '20', '30'],
          showTotal: (total, range) => {
            return range[0] + "-" + range[1] + " 共" + total + "条"
          },
          showQuickJumper: true,
          showSizeChanger: true,
          total: 0
        },
        /* 排序参数 */
        isorter:{
          column: 'createTime',
          order: 'desc',
        },
        /* 筛选参数 */
        filters: {},
        /* table加载状态 */
        loading:false,
        /* table选中keys*/
        selectedRowKeys: [],
        /* table选中records*/
        selectionRows: [],
        /* 查询折叠 */
        toggleSearchStatus:false,
        // 表头
        columns: [],
        tableVisible: false,
        indexColumn: [{
          title: '#',
          dataIndex: '',
          key:'rowIndex',
          width:60,
          align:"center",
          customRender:function (t,r,index) {
            return parseInt(index)+1;
          }
        }],
        actionColumn: [{
            title: '操作',
            dataIndex: 'action',
            align:"center",
            fixed:"right",
            width:147,
            scopedSlots: { customRender: 'action' },
          }],
        dictOptions:{},
        superFieldList:[],
      }
    },
    created() {
      this.taskForm.deployId = this.$route.query && this.$route.query.deployId
      this.taskForm.procInsId = this.$route.query && this.$route.query.procInsId
      this.taskForm.category = this.$route.query && this.$route.query.category
      //节点类型
      this.taskForm.nodeType = this.$route.query && this.$route.query.nodeType
      //online表单id和数据id
      this.taskForm.onlineId = this.$route.query && this.$route.query.onlineId
      this.finished = this.$route.query && this.$route.query.finished
      console.log("this.taskForm=",this.taskForm)
      this.url.list = "/flowable/onlCgformHead/getData/" + this.taskForm.onlineId +"?column=id&order=desc&pageNo=1&pageSize=10&superQueryMatchType=and"
      getOnlineColumns(this.taskForm.onlineId).then(res => {//获取从表相关信息
        console.log("getOnlineColumns res=",res)
        if (res.success) {
          this.columns = res.result.columns
          console.log("getOnlineColumns columns=",this.columns)
          this.columns.forEach(function(item, index) {//删除不需要的列
            Object.keys(item).map(function (key) {
              null == item[key] && delete item[key]
            })  
          })
          this.columns = this.indexColumn.concat(this.columns)
          this.columns = this.columns.concat(this.actionColumn)
          console.log("this.columns=",this.columns)
          
          getOnlineData(this.taskForm.onlineId).then(datares => {
            if (datares.success) {
              console.log("getOnlineData datares=",datares)
              this.dataSource = datares.result.records
              this.ipagination.total = datares.result.total
              console.log("getOnlineData dataSource=",this.dataSource)
              this.tableVisible = true
            }
            else {
              this.$message.error(datares.message);
            }   
          })  
        }
        else {
          this.$message.error(res.message);
        }  
      })  
      this.getSuperFieldList();
    },
    computed: {
    },
    methods: {
      loadData(arg) {
        if(!this.url.list){
          this.$message.error("请设置url.list属性!")
          return
        }
        //加载数据 若传入参数1则加载第一页的内容
        if (arg === 1) {
          this.ipagination.current = 1;
        }
        var params = this.getQueryParams();//查询条件
        this.loading = true;
        getAction(this.url.list, params).then((res) => {
          if (res.success) {
            //update-begin---author:zhangyafei    Date:20201118  for：适配不分页的数据列表------------
            this.dataSource = res.result.records||res.result;
            if(res.result.total)
            {
              this.ipagination.total = res.result.total;
            }else{
              this.ipagination.total = 0;
            }
            //update-end---author:zhangyafei    Date:20201118  for：适配不分页的数据列表------------
          }else{
            this.$message.warning(res.message)
          }
        }).finally(() => {
          this.loading = false
        })
      },
      handleTableChange(pagination, filters, sorter) {
        //分页、排序、筛选变化时触发
        //TODO 筛选
        console.log(pagination)
        if (Object.keys(sorter).length > 0) {
          this.isorter.column = sorter.field;
          this.isorter.order = "ascend" == sorter.order ? "asc" : "desc"
        }
        this.ipagination = pagination;
        this.loadData();
      },
      onSelectChange(selectedRowKeys, selectionRows) {
        this.selectedRowKeys = selectedRowKeys;
        this.selectionRows = selectionRows;
      },
      getQueryParams() {
        //获取查询条件
        let sqp = {}
        if(this.superQueryParams){
          sqp['superQueryParams']=encodeURI(this.superQueryParams)
          sqp['superQueryMatchType'] = this.superQueryMatchType
        }
        var param = Object.assign(sqp, this.queryParam, this.isorter ,this.filters);
        param.field = this.getQueryField();
        param.pageNo = this.ipagination.current;
        param.pageSize = this.ipagination.pageSize;
        return filterObj(param);
      },
      getQueryField() {
        //TODO 字段权限控制
        var str = "id,";
        this.columns.forEach(function (value) {
          str += "," + value.dataIndex;
        });
        return str;
      },
      /* 图片预览 */
      getImgView(text){
        if(text && text.indexOf(",")>0){
          text = text.substring(0,text.indexOf(","))
        }
        return getFileAccessHttpUrl(text)
      },
      /* 文件下载 */
      // update--autor:lvdandan-----date:20200630------for：修改下载文件方法名uploadFile改为downloadFile------
      downloadFile(text){
        if(!text){
          this.$message.warning("未知的文件")
          return;
        }
        if(text.indexOf(",")>0){
          text = text.substring(0,text.indexOf(","))
        }
        let url = getFileAccessHttpUrl(text)
        window.open(url);
      },
      initDictConfig(){
      },
      /** 发起申请 */
      SubmitApplication(row) {
        
        var params = Object.assign({
            dataId: row.id
        }, row);
        //variables.variables = formData;
        //console.log("variables=", this.variables);
        // 启动流程并将表单数据加入流程变量
        console.log("SubmitApplication this.taskForm=",this.taskForm)
        console.log("SubmitApplication row=",row)
        definitionStartByOnlineDataId(row.id, this.taskForm.onlineId, this.taskForm.deployId, params).then(res => {
          console.log("definitionStartByOnlineDataId res=",res);
          this.$message.success(res.message);
        })
        /**  online表单业务流程申请 */
        /*this.$router.push({ path: '/flowable/task/record/index',
          query: {
            deployId: this.taskForm.deploymentId,
            procDefId:this.taskForm.procDefId,
            onlineId: this.taskForm.onlineId,
            category: this.taskForm.category,
            businessKey: row.id,
            finished: true
          }
        })*/
      },
      getSuperFieldList(){
        let fieldList=[];
    
        this.superFieldList = fieldList
      }
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>
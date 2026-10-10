<template>
  
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="handleQuery">
        <a-row :gutter="24">
          <a-col :md="6" :sm="8">
            <a-form-item label="流程名称">
              <a-input placeholder="请输入流程名称" v-model="queryParams.procDefName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="接收日期">
              <a-date-picker v-model="queryParams.createTime"  style="width: 100%" placeholder="请输入接收日期"/>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="8">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="handleQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
            </span>
          </a-col>
    
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->
  
    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button type="primary" icon="download" @click="handleExportXls('待办任务')">导出</a-button>
     
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
        rowKey="procInsId"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        class="j-table-force-nowrap"
        @change="handleTableChange">
        
        <template slot="procDefVersion" slot-scope="text, record, index">
            <el-tag size="medium" >V{{ record.procDefVersion }}</el-tag>
        </template>
        <template slot="startUserName" slot-scope="text, record, index">
           <label>{{record.startUserName}} <el-tag type="info" size="mini">{{record.startDeptName}}</el-tag></label>
        </template>
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
          <a @click="handleProcess(record)">处理</a>
          <a-divider type="vertical" />
          <a  @click="SelectUser(record,'1')">委派</a>
          <a-divider type="vertical" />
          <a  @click="SelectUser(record,'2')">转办</a>
        </span>
  
      </a-table>
      <!-- 委派 转办 选择人员 -->
      <a-modal
        title="选择委派或转办人员" width="900px" :maskClosable="false"
        :confirmLoading="confirmLoading"
        :visible="delegateassign"
        :footer="null"
        @cancel="closeNode"
      >   
        <a-form :form="selUserForm" v-if="delegateassign">
          <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol"  label="请选择委派或转办人员" v-show="true">
            <a-checkbox-group @change="spryType" v-model="spryTypes" >
                <!-- 1用户 5 部门负责人 4发起人的部门负责人-->
            
              <a-checkbox value="1"> 直接选择人员 </a-checkbox>
              <a-checkbox value="5"> 部门负责人 </a-checkbox>
              <a-checkbox value="4">
                发起人的部门负责人
                <a-tooltip placement="topLeft" title="自动获取发起人所在部门的负责人，即其上级领导。（如果其本身就是部门负责人，则指向发起人自己。）">
                  <a-icon type="exclamation-circle" />
                </a-tooltip>
              </a-checkbox>
        
            </a-checkbox-group>
          </a-form-item>
          <!--            1用户  4发起人的部门负责人-->
         
          <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="选择人员" v-if="spryTypes.indexOf('1')>-1" >
            <!--  通过部门选择用户控件 -->
            <j-select-user-by-dep v-model="spry.userIds" :multi="false"></j-select-user-by-dep>
          </a-form-item>
          
          <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="选择部门负责人" v-if="spryTypes.indexOf('5')>-1" >
            <j-select-depart v-model="spry.departmentManageIds" :multi="false"></j-select-depart>
          </a-form-item>
          <!--btn-->
          <a-form-item :wrapper-col="{ span: 12, offset: 5 }">
            <a-button @click="sprySubmit" type="primary" html-type="submit" :disabled="userNode.type==0||userNode.type==2||confirmLoading">
              提交
            </a-button>
        
            <a-button @click="closeNode" style="margin-left: 10px">
              关闭
            </a-button>
          </a-form-item>
        </a-form>
      </a-modal>  
    </div>
  </a-card>
  
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'  
import {
  todoList,
  todoListNew,
  complete,
  returnList,
  returnTask,
  rejectTask,
  getDeployment,
  delDeployment,
  exportDeployment,
  delegateTask,
  assignTask,
} from "@/views/flowable/api/todo";
import JSelectUserByDep from '@/components/jeecgbiz/JSelectUserByDep'
import moment from 'moment';

export default {
  name: "todoList",
  mixins:[JeecgListMixin, mixinDevice],
  components: {},
  data() {
    return {
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
          title:'任务编号',
          align:"center",
          dataIndex: 'procInsId',
        },
        {
          title:'流程名称',
          align:"center",
          dataIndex: 'procDefName',
        },
        {
          title:'任务节点',
          align:"center",
          dataIndex: 'taskName',
        },
        {
          title:'流程类别',
          align:"center",
          dataIndex: 'category'
        },
        {
          title:'流程版本',
          align:"center",
          dataIndex: 'procDefVersion',
          scopedSlots: { customRender: 'procDefVersion' }
        },
        {
          title:'业务主键',
          align:"center",
          dataIndex: 'businessKey'
        },
        {
          title:'流程发起人',
          align:"center",
          dataIndex: 'startUserName',
          scopedSlots: { customRender: 'startUserName' }
        },
        {
          title:'接收时间',
          align:"center",
          dataIndex: 'createTime'
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
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 流程待办任务表格数据
      todoList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: null,
        category: null,
        key: null,
        tenantId: null,
        deployTime: null,
        derivedFrom: null,
        derivedFromRoot: null,
        parentDeploymentId: null,
        engineVersion: null,
        procDefName: null,
        createTime: null
      },
      url: {
        list: "/flowable/task/todoListNew",
        deleteBatch: "/flowable/task/deleteBatch",
        exportXlsUrl: "/flowable/task/todoExportXls",
      },
      dataSource: [], //表格数据源
      /* 表格分页参数 */
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
      //委派与转办选择用户界面
      delegateassign: false,
      confirmLoading:false,
      current:0,
      selUserForm: this.$form.createForm(this),
      userNode:{},
      spryTypes:[],
      spry:{
        //选中的用户
        userIds:'',
        departmentManageIds:'',
        chooseSponsor:false,
        chooseDepHeader:false,
      },       
      //传入处理委派或转办参数
      assignee: '',
      taskId: '',
      dataId: '',
      type: '',
      category: '',
      // 表单参数
      form: {},
      // 表单校验
      rules: {}
    };
  },
  created() {
    this.getSuperFieldList();
    //this.getList();
  },
  methods: {
    /** 查询流程定义列表 */
    getList() {
      this.loading = true;
      console.log("this.queryParams=",this.queryParams);
      todoListNew(this.queryParams).then(response => {
        if(response.success) {
           this.dataSource = response.result.records;
           this.total = response.result.total;
           this.ipagination.total = response.result.total;   
           this.loading = false;
         }
        else {
           this.$message.error(response.message)
           this.loading = false;
        }
      });
    },
    // 跳转到处理页面
    handleProcess(row){
      this.$router.push({ path: '/flowable/mtask/record/index',
        query: {
          procInsId: row.procInsId,
          deployId: row.deployId,
          taskId: row.taskId,
          businessKey: row.businessKey,
          nodeType: row.nodeType,
          category: row.category,
          finished: true
        }})
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        name: null,
        category: null,
        key: null,
        tenantId: null,
        deployTime: null,
        derivedFrom: null,
        derivedFromRoot: null,
        parentDeploymentId: null,
        engineVersion: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1;
      if(this.queryParams.createTime != null) {
        this.queryParams.createTime = moment(this.queryParams.createTime).format('YYYY-MM-DD 00:00:00');
        console.log("createtime=",this.queryParams.createTime)
      }
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加流程定义";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getDeployment(id).then(response => {
        this.form = response.result;
        this.open = true;
        this.title = "修改流程定义";
      });
    },
    spryType(types){
      /*  1用户 4发起人的部门负责人 5部门负责人*/
      // this.spryTypes = types;
      if (this.spryTypes.indexOf('1')==-1) this.spry.userIds = '';
      if (this.spryTypes.indexOf('5')==-1) this.spry.departmentManageIds = '';
      //是否选中发起人的部门领导
      this.spry.chooseDepHeader = this.spryTypes.indexOf('4')>-1 ;
    
      console.log("this.spry",this.spry)
    },
    sprySubmit() {
      var that = this;
     if (this.spryTypes.length==0){
       that.$message.error("必须选择委托或转办人员！");
       return;
     }
     if (this.spry.userIds == ''){
       that.$message.error("必须选择委托或转办人员！");
       return;
     }
      this.delegateassign = false;      
      this.assignee = this.spry.userIds;
      console.log("this.assign=",this.assign);
      if(this.type == "1") { //委派
        that.handleDelegate();
      }
      else if(this.type == "2") { //转办
        that.handleAssign();
      }
      else {
        that.$message.error("不认识的类型，未知的错误！");
      }
    },
    
    closeNode() {
      this.delegateassign = false,
      this.current=0,
      this.spryTypes=[],
      this.spry={}
    },
    //弹出选择委派人员界面
    SelectUser(row,type){
      this.taskId = row.taskId;
      this.dataId = row.businessKey;
      this.type = type;
      this.category = row.category;
      this.delegateassign = true ;
    },
    //委派流程
    handleDelegate(){
      const params = {
        taskId: this.taskId,
        assignee: this.assignee,
        dataId: this.dataId,
        category: this.category,
      }
      delegateTask(params).then( res => {
        this.$message.success(res.message);
        this.getList();
      });
    }, 
    //转办流程
    handleAssign(){
      const params = {
        taskId: this.taskId,
        assignee: this.assignee,
        dataId: this.dataId,
        category: this.category,
      }
      assignTask(params).then( res => {
        this.$message.success(res.message);
        this.getList();
      });
    },  
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      const dataid = row.businessKey; 
      this.$confirm('是否确认删除流程定义编号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delDeployment(ids,dataid);
      }).then(() => {
        this.getList();
        this.$message.success("删除成功");
      })
    },
    initDictConfig(){
    },
    getSuperFieldList(){
      let fieldList=[];
      fieldList.push({type:'string',value:'procInsId',text:'任务编号'})
      fieldList.push({type:'string',value:'procDefName',text:'流程名称'})
      fieldList.push({type:'string',value:'taskName',text:'任务节点'})
      fieldList.push({type:'string',value:'category',text:'流程类别'})
      fieldList.push({type:'string',value: 'procDefVersion',text:'流程版本'})
      fieldList.push({type:'string',value: 'businessKey',text:'业务主键'})
      fieldList.push({type:'string',value:'startUserName',text:'流程发起人'})
      fieldList.push({type:'datetime',value:'createTime',text:'接收时间'})
      this.superFieldList = fieldList
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有流程定义数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportDeployment(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    }
  }
};
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>


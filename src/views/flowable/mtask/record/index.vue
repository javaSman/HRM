<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="el-icon-document">基础信息</span>
        <el-button style="float: right;" type="primary" @click="goBack">返回</el-button>
      </div>

      <!--初始化流程加载自定义表单信息-->
      <el-col :span="24" :offset="2" v-if="customForm.visible">
        <div>
            <component ref="refCustomForm" :disabled="customForm.disabled" v-bind:is="customForm.formComponent" :model="customForm.model"
                        :customFormData="customForm.customFormData" :isNew = "customForm.isNew"></component> 
        </div>
        <div style="margin-left:10%;margin-bottom: 20px;font-size: 14px;" v-if="finished === 'true'">
          <el-button icon="el-icon-edit-outline" type="success" size="mini" @click="handleComplete">审批</el-button>
          <!--                <el-button  icon="el-icon-edit-outline" type="primary" size="mini" @click="handleDelegate">委派</el-button>-->
          <!--                <el-button  icon="el-icon-edit-outline" type="primary" size="mini" @click="handleAssign">转办</el-button>-->
          <!--                <el-button  icon="el-icon-edit-outline" type="primary" size="mini" @click="handleDelegate">签收</el-button>-->
          <el-button icon="el-icon-refresh-left" type="warning" size="mini" @click="handleAddSign">加签</el-button>
          <el-button icon="el-icon-refresh-left" type="warning" size="mini" @click="handleJump">跳转</el-button>
          <el-button icon="el-icon-refresh-left" type="warning" size="mini" @click="handleReturn">退回</el-button>
          <el-button icon="el-icon-circle-close" type="danger" size="mini" @click="handleReject">驳回</el-button>
        </div>
      </el-col>
      
      <!--初始化流程加载online提交表单信息 目前先不用这个了-->
      <el-col :span="24" :offset="2" v-if="onlineForm.visible">
            <a-form ref="refOnlForm" >
                <a-row v-for="(itemCommon, indexInner) in onlineForm.onlineFormData" :key="indexInner"  :label="itemCommon.onlTitleName" :model="itemCommon.cgformHeadId" >
                  <a-col :span="parseInt(itemField.fieldDataTopInfo)" v-for="(itemField, index2) in itemCommon.fieldAll" :key="index2">
                      <a-form-item :label="itemField.dbFieldTxt"  :model="itemField" :key="index2">
                        <component :is="itemField.tableTypeCode" :model="itemField" :key="index2" :fcz="itemField" @commonComponent ="commonComponent" >
                        </component>
                      </a-form-item>
                  </a-col>
                </a-row>
                <a-alert v-if="onlineForm.submitError" type="error" show-icon :message="onlineForm.submitError" style="margin-bottom: 16px" />
                <a-form-item style="text-align: center;" v-if="onlineForm.isNew != false">
                  <a-button type="primary" :loading="onlineForm.submitting" @click="submitOnlForm">提交</a-button>
                  <a-button style="margin-left:30px;" @click="resetOnlForm">重置</a-button>
                </a-form-item>
            </a-form>   
      </el-col>
      
      <!--流程加载online显示表单信息-->
      <el-col :span="24" :offset="2" v-if="onlineViewForm.visible">
            <a-form ref="refViewOnlForm">
                <a-row v-for="(itemCommon, indexInner) in onlineViewForm.onlineFormData" v-if="indexInner==0" :key="indexInner"  :label="itemCommon.onlTitleName" :model="itemCommon.cgformHeadId" >
                  <a-col :span="parseInt(itemField.fieldDataTopInfo)" v-for="(itemField, index2) in itemCommon.fieldAll" :key="index2">
                      <a-form-item :label="itemField.dbFieldTxt"  :model="itemField" :key="index2">
                        <component :disabled="onlineViewForm.disabled" :is="itemField.tableTypeCode" :value="onlineViewForm.model[itemField.dbFieldName]" :key="index2" :fcz="itemField" @commonComponent ="commonComponent" >
                        </component>
                      </a-form-item>
                  </a-col>
                </a-row>
                <!-- 子表单区域 -->
                <a-tabs >
                    <a-tab-pane v-for="(itemCommon, indexInner) in onlineViewForm.onlineFormData" :key="indexInner" v-if = "indexInner>0 && itemCommon.tableName === onlineFormItem.tableForm.tableName[indexInner-1] && onlineFormItem.tableForm.columns[indexInner-1] != undefined" 
                      :tab="itemCommon.tableTxt"  :forceRender="true" >
                      <j-editable-table  
                          :model="itemCommon.cgformHeadId"
                          :columns="onlineFormItem.tableForm.columns[indexInner-1]"
                          :dataSource="onlineFormItem.dataSource[indexInner-1]"
                          :maxHeight="300" 
                          :rowNumber="true"
                          />
                    </a-tab-pane>
                    <a-tab-pane v-else-if = "indexInner>0 && itemCommon.tableName === onlineFormItem.tableForm.tableName[indexInner-1] && onlineFormItem.tableForm.columns[indexInner-1] == undefined" 
                      :tab="itemCommon.tableTxt" :model="itemCommon.cgformHeadId" :forceRender="true" >
                      <a-row>
                       <a-col :span="parseInt(itemField.fieldDataTopInfo)" v-for="(itemField, index2) in itemCommon.fieldAll" :key="index2">
                           <a-form-item :label="itemField.dbFieldTxt"  :model="itemField" :key="index2" v-if="onlineFormItem.dataSource[indexInner-1][0] != undefined"> 
                             <component :is="itemField.tableTypeCode" :disabled="true" :value="onlineFormItem.dataSource[indexInner-1][0][itemField.dbFieldName]" :key="index2" :fcz="itemField" @commonComponent ="commonComponent" >
                             </component>
                           </a-form-item>
                           <a-form-item :label="itemField.dbFieldTxt"  :model="itemField" :key="index2" v-else>
                             <component :is="itemField.tableTypeCode" :disabled="true"  :key="index2" :fcz="itemField" @commonComponent ="commonComponent" >
                             </component>
                           </a-form-item>
                       </a-col>
                      </a-row>
                    </a-tab-pane>
                </a-tabs>
            </a-form>   
            <!--<div style="margin-left:10%;margin-bottom: 20px;font-size: 14px;" v-if="finished === 'true'">
              <el-button icon="el-icon-edit-outline" type="success" size="mini" @click="handleComplete">审批</el-button>
              <el-button  icon="el-icon-edit-outline" type="primary" size="mini" @click="handleDelegate">委派</el-button>
              <el-button  icon="el-icon-edit-outline" type="primary" size="mini" @click="handleAssign">转办</el-button>
              <el-button  icon="el-icon-edit-outline" type="primary" size="mini" @click="handleDelegate">签收</el-button>
              <el-button icon="el-icon-refresh-left" type="warning" size="mini" @click="handleAddSign">加签</el-button>
              <el-button icon="el-icon-refresh-left" type="warning" size="mini" @click="handleJump">跳转</el-button>
              <el-button icon="el-icon-refresh-left" type="warning" size="mini" @click="handleReturn">退回</el-button>
              <el-button icon="el-icon-circle-close" type="danger" size="mini" @click="handleReject">驳回</el-button>
            </div>-->
      </el-col>

      <!--流程处理表单设计器模块,从flowable表里获取表单数据-->
      <el-col :span="24" :offset="2" v-if="variableOpen">
        <!--<div > <!--处理流程过程中显示formgenerator表单信息
          <parser :key="new Date().getTime()" :form-conf="variablesData" />
        </div>-->
          <div > <!--处理流程过程中显示formdesigner表单信息-->
            <form-builder v-if = "this.startUserForm.isStartUserNode && this.startUserForm.editFormType === 'oa' && finished === 'true'" ref="refStartBuilder" v-model="formVal" :buildData="formViewData" />
            <form-viewer v-else ref="formViewer" v-model="formVal" :buildData="formViewData" />
		      </div>
        <div style="margin-left:10%;margin-bottom: 30px">
           <!--对上传文件进行显示处理，临时方案 add by nbacheng 2022-07-27 -->
           <el-upload action="#" :on-preview="handleFilePreview" :file-list="fileList" v-if="fileDisplay" />
        </div>  
        <!--流程各个节点表单加载显示formdesigner表单-->
        <div class="test-form" v-for="(taskform,index) in taskFormList" v-if="taskFormViewOpen && taskFormVal[index] != '{}'">
          <form-viewer ref="taskFormView" v-model="taskFormVal[index]" :buildData="taskform" />
        </div>   
        <div class="test-form" v-if="taskFormOpen && finished === 'true'">
          <form-builder ref="taskFormBuilder" v-model="taskFormVal" :buildData="taskFormData" />
        </div>
        <div style="margin-left:10%;margin-bottom: 20px;font-size: 14px;" v-if="finished === 'true'">
          <el-button icon="el-icon-edit-outline" type="success" size="mini" @click="handleComplete">审批</el-button>
          <!--                <el-button  icon="el-icon-edit-outline" type="primary" size="mini" @click="handleDelegate">委派</el-button>-->
          <!--                <el-button  icon="el-icon-edit-outline" type="primary" size="mini" @click="handleAssign">转办</el-button>-->
          <!--                <el-button  icon="el-icon-edit-outline" type="primary" size="mini" @click="handleDelegate">签收</el-button>-->
          <el-button icon="el-icon-refresh-left" type="warning" size="mini" @click="handleReturn">退回</el-button>
          <el-button icon="el-icon-circle-close" type="danger" size="mini" @click="handleReject">驳回</el-button>
        </div>
      </el-col>


      <!--初始化流程加载默认formgenerator表单信息-->
      <!-- <el-col :span="16" :offset="4" v-if="formConfOpen">
        <div class="test-form">
          <parser :key="new Date().getTime()" :form-conf="formConf" @submit="submitForm" ref="parser"
            @getData="getData" />
        </div>
      </el-col> -->
      <!--初始化流程加载默认formdesigner表单信息-->
      <el-col :span="16" :offset="4" v-if="formConfOpen">
        <div class="test-form">
          <form-builder ref="formBuilder" v-model="formVal" :buildData="formCode" />
          <div style="margin-bottom:15px;text-align:center">
              <el-button type="primary" class="button" @click="submitForm">提交</el-button>
          </div>
        </div>
      </el-col>
      <!--初始化流程加载显示formdesigner表单-->
      <el-col :span="16" :offset="4" v-if="formViewOpen">
        <div class="test-form">
          <form-viewer ref="formView" v-model="formVal" :buildData="formCode" />
        </div>
      </el-col>
      
    </el-card>

    <!--流程流转记录-->
    <el-card class="box-card" v-if="flowRecordList">
      <div slot="header" class="clearfix">
        <span class="el-icon-notebook-1">审批记录</span>
      </div>
      <el-col :span="24" :offset="0">
        <div class="block">
          <el-timeline>
            <el-timeline-item v-for="(item,index ) in flowRecordList" :key="index" :icon="setIcon(item.finishTime)"
              :color="setColor(item.finishTime)">
              <p style="font-weight: 700">{{item.taskName}}</p>
              <el-card v-if="item.activityType === 'startEvent'" class="box-card" shadow="hover">
                {{ item.assigneeName }} 在 {{ item.createTime }} 发起流程
              </el-card>
              <el-card v-if="item.activityType === 'userTask'" :body-style="{ padding: '10px' }">
                <label v-if="item.assigneeName" style="font-weight: normal;margin-right: 30px;">实际办理：
                  {{item.assigneeName}}
                  <el-tag type="info" size="mini">{{item.deptName}}</el-tag>
                </label>
                <label v-if="item.candidate" style="font-weight: normal;margin-right: 30px;">候选办理：
                  {{item.candidate}}</label>
                <label style="font-weight: normal">接收时间： </label><label
                  style="color:#8a909c;font-weight: normal">{{item.createTime}}</label>
                <label v-if="item.finishTime" style="margin-left: 30px;font-weight: normal">办结时间： </label><label
                  style="color:#8a909c;font-weight: normal">{{item.finishTime}}</label>
                <label v-if="item.duration" style="margin-left: 30px;font-weight: normal">耗时： </label><label
                  style="color:#8a909c;font-weight: normal">{{item.duration}}</label>
                <p v-if="item.listFlowCommentDto" v-for="(commentitem,index ) in item.listFlowCommentDto" :key="index">
                   <el-tag type="success" v-if="commentitem.type === '1'"> {{commentitem.comment}}</el-tag>
                   <el-form  v-if= "commentitem.type === '1' && fileitem.type === '1'  && item.listcommentFileDto.length>0" v-for="(fileitem,fileindex ) in item.listcommentFileDto" :key="fileindex">
                     <el-form-item label="附件"  prop="listcommentFileDto">
                          <j-upload  v-if="fileitem.type === '1'" v-model="fileitem.fileurl" :disabled = "true"  text="上传的文件" ></j-upload>                 
                     </el-form-item>
                   </el-form>  
                   <el-tag type="warning" v-if="commentitem.type === '2'"> {{commentitem.comment}}</el-tag>
                   <el-form v-if= "commentitem.type === '2' && fileitem.type === '2'  && item.listcommentFileDto.length>0" v-for="(fileitem,fileindex ) in item.listcommentFileDto" :key="fileindex">
                     <el-form-item label="附件"  prop="listcommentFileDto">
                          <j-upload v-if="fileitem.type === '2'" v-model="fileitem.fileurl" :disabled = "true"  text="退回上传的文件" ></j-upload> 
                     </el-form-item>
                   </el-form>  
                   <el-tag type="danger" v-if="commentitem.type === '3'">  {{commentitem.comment}}</el-tag>
                   <el-form v-if= "commentitem.type === '3' && fileitem.type === '3'  && item.listcommentFileDto.length>0" v-for="(fileitem,fileindex ) in item.listcommentFileDto" :key="fileindex">
                     <el-form-item label="附件"  prop="listcommentFileDto">
                        <j-upload v-if="fileitem.type === '3'"  v-model="fileitem.fileurl" :disabled = "true"  text="驳回上传的文件" ></j-upload>
                     </el-form-item>
                   </el-form>  
                   <el-tag type="success" v-if="commentitem.type === '4'">  {{commentitem.comment}}</el-tag>
                   <el-form  v-if= "commentitem.type === '4' && fileitem.type === '4'  && item.listcommentFileDto.length>0" v-for="(fileitem,fileindex ) in item.listcommentFileDto" :key="fileindex">
                     <el-form-item label="附件"  prop="listcommentFileDto">
                          <j-upload  v-if="fileitem.type === '4'" v-model="fileitem.fileurl" :disabled = "true"  text="委派上传的文件" ></j-upload>                 
                     </el-form-item>
                   </el-form>  
                   <el-tag type="success" v-if="commentitem.type === '5'">  {{commentitem.comment}}</el-tag>  
                    <el-form v-if= "commentitem.type === '5' && fileitem.type === '5' && item.listcommentFileDto.length>0" v-for="(fileitem,fileindex ) in item.listcommentFileDto" :key="fileindex">
                      <el-form-item label="附件"  prop="listcommentFileDto" >
                         <j-upload v-model="fileitem.fileurl" :disabled = "true"  text="转办上传的文件" ></j-upload>
                      </el-form-item>
                    </el-form>  
                    <el-tag type="warning" v-if="commentitem.type === '7'"> {{commentitem.comment}}</el-tag>  <!--撤回信息-->
                    <el-tag type="warning" v-if="commentitem.type === '6'"> {{commentitem.comment}}</el-tag>  <!--终止信息-->
                    <el-tag type="warning" v-if="commentitem.type === '8'"> {{commentitem.comment}}</el-tag>  <!--跳过信息-->
                    <el-tag type="success" v-if="commentitem.type === '9'"> {{commentitem.comment}}</el-tag>  <!--前加签-->
                    <el-tag type="success" v-if="commentitem.type === '10'"> {{commentitem.comment}}</el-tag>  <!--后加签-->
                    <el-tag type="success" v-if="commentitem.type === '11'"> {{commentitem.comment}}</el-tag>  <!--多实例加签-->
                    <el-tag type="success" v-if="commentitem.type === '12'"> {{commentitem.comment}}</el-tag>  <!--跳转信息-->
                 </p>
              </el-card>
              <el-card v-if="item.activityType === 'endEvent'" class="box-card" shadow="hover">
                {{ item.createTime }} 流程结束
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-col>
    </el-card>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="el-icon-picture-outline">流程图</span>
      </div>
      <!--<flow :xmlData="xmlData" :taskData="taskList"></flow>-->
      <!-- 流程图 -->
      <bpmn-modeler v-if="xmlShow" ref="refNode" :xml="xmlData" :taskData="taskList" :users="users" :groups="groups"
      :categorys="categorys" :is-view="xmlView" />
      
    </el-card>

    <!--审批正常流程-->
    <a-modal :z-index="100" :title="completeTitle" @cancel="completeOpen = false" :visible.sync="completeOpen" :width="checkSendUser? '95%':'95%'" append-to-body>
      <el-form ref="taskForm" :model="taskForm">
        <el-form-item v-if="checkSendUser" prop="targetKey">
          <el-row :gutter="20">
            <el-col :span="12" :xs="24">
              <h6>待选人员</h6>
              <el-table ref="singleTable" :data="userDataList" border style="width: 100%"
                @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="50" align="center"  />
                <el-table-column label="用户名" align="center" prop="realname" />
                <el-table-column label="部门" align="center" prop="orgCodeTxt" />
              </el-table>
            </el-col>
            <el-col :span="8" :xs="24">
              <h6>已选人员</h6>
              <el-tag v-for="tag in userData" :key="tag" closable @close="handleClose(tag)">
                {{tag.realname}} {{tag.orgCodeTxt}}
              </el-tag>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="处理意见" prop="comment" :rules="[{ required: true, message: '请输入处理意见', trigger: 'blur' }]">
          <el-input type="textarea" v-model="taskForm.comment" placeholder="请输入处理意见" />
        </el-form-item>
        <el-form-item label="附件"  prop="commentFileDto.fileurl">
          <j-upload v-model="taskForm.commentFileDto.fileurl"   ></j-upload>
        </el-form-item>
        <el-form-item label="选择抄送人" prop="ccUsers">
          <j-select-user-by-dep v-model="taskForm.ccUsers" />
        </el-form-item>
        <el-form-item label="选择下一审批人" prop="nextUsers">
          <j-select-user-by-dep v-model="taskForm.nextUsers" />
          <el-tag type="danger">注意: 多实例目前仅支持选择下一个审批人数要与原先设置的人数一致</el-tag>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="completeOpen = false">取 消</el-button>
        <el-button type="primary" @click="taskComplete(true)">同 意</el-button>
        <el-button type="primary" :disabled="!bapproved" @click="taskComplete(false)">拒 绝</el-button>
      </span>
    </a-modal>

    <!--退回流程-->
    <el-dialog :z-index="100" :title="returnTitle" :visible.sync="returnOpen" width="95%" append-to-body>
      <el-form ref="taskForm" :model="taskForm" label-width="80px">
        <el-form-item label="退回节点" prop="targetKey">
          <el-radio-group v-model="taskForm.targetKey">
            <el-radio-button v-for="item in returnTaskList" :key="item.id" :label="item.id">{{item.name}}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="退回意见" prop="comment" :rules="[{ required: true, message: '请输入意见', trigger: 'blur' }]">
          <el-input style="width: 85%" type="textarea" v-model="taskForm.comment" placeholder="请输入意见" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="returnOpen = false">取 消</el-button>
        <el-button type="primary" @click="taskReturn">确 定</el-button>
      </span>
    </el-dialog>

    <!--驳回流程-->
    <el-dialog :z-index="100" :title="rejectTitle" :visible.sync="rejectOpen" width="95%" append-to-body>
      <el-form ref="taskForm" :model="taskForm" label-width="80px">
        <el-form-item label="驳回意见" prop="comment" :rules="[{ required: true, message: '请输入意见', trigger: 'blur' }]">
          <el-input style="width: 85%" type="textarea" v-model="taskForm.comment" placeholder="请输入意见" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rejectOpen = false">取 消</el-button>
        <el-button type="primary" @click="taskReject">确 定</el-button>
      </span>
    </el-dialog>
    
    <!--加签流程-->
    <a-modal :z-index="100" :title="addSignTitle" @cancel="addSignOpen = false" :visible.sync="addSignOpen" :width="'40%'" append-to-body>
      <el-form ref="addSignForm" :model="addSignForm" label-width="160px">
        <el-form-item label="加签类型" prop="addSignType" :rules="[{ required: true, message: '请选择加签类型', trigger: 'blur' }]">
          <el-radio-group v-model="addSignForm.addSignType" @change="changeAddSignType">
              <el-radio :label="0">前加签</el-radio>
              <el-radio :label="1">后加签</el-radio>
              <el-radio :label="2">多实例加签</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item label="用户选择" prop="addSignUsers" :rules="[{ required: true, message: '请选择用户', trigger: 'blur' }]">
          <j-select-user-by-dep v-model="addSignForm.addSignUsers" />
        </el-form-item>
        <el-form-item label="处理意见" prop="comment" :rules="[{ required: true, message: '请输入处理意见', trigger: 'blur' }]">
          <el-input type="textarea" v-model="addSignForm.comment" placeholder="请输入处理意见" />
        </el-form-item>
        <el-form-item label="附件"  prop="commentFileDto.fileurl">
          <j-upload v-model="addSignForm.commentFileDto.fileurl"   ></j-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addSignOpen = false">取 消</el-button>
        <el-button type="primary" @click="addSignComplete(true)">确 定</el-button>
      </span>
    </a-modal>
    
    <!--跳转流程-->
    <a-modal :z-index="100" :title="jumpTitle" @cancel="jumpOpen = false" :visible.sync="jumpOpen" :width="'40%'" append-to-body>
      <el-form ref="jumpForm" :model="jumpForm" label-width="160px">
        <el-form-item label="跳转节点" prop="jumpType" :rules="[{ required: true, message: '请选择跳转节点', trigger: 'blur' }]">
          <a-table
            size="middle"
            :columns="jumpNodeColumns"
            :loading="jumpNodeLoading"
            :pagination="false"
            :dataSource="jumpNodeData"
            :rowKey="(record) => record.id"
            :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange ,type:'radio' }"
          />
        </el-form-item>
        
        <el-form-item label="处理意见" prop="comment" :rules="[{ required: true, message: '请输入处理意见', trigger: 'blur' }]">
          <el-input type="textarea" v-model="jumpForm.comment" placeholder="请输入处理意见" />
        </el-form-item>
        <el-form-item label="附件"  prop="commentFileDto.fileurl">
          <j-upload v-model="jumpForm.commentFileDto.fileurl"   ></j-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="jumpOpen = false">取 消</el-button>
        <el-button type="primary" @click="jumpComplete(true)">确 定</el-button>
      </span>
    </a-modal>
  </div>
</template>

<script>
  import {
    flowRecord
  } from "@/views/flowable/api/finished";
  import Parser from '@/components/parser/Parser'
  import {
    definitionStartByDefId,
    definitionStartByOnlineDataId,
    getProcessVariables,
    readXml,
    getFlowViewer
  } from "@/views/flowable/api/definition";
  import {
    complete,
    rejectTask,
    returnList,
    returnTask,
    getNextFlowNode,
    delegateTask,
    assignTask,
    nextApprovedEG,
    addSignTask,
    multiInstanceAddSignTask,
    userTaskList,
    jumpTask,
  } from "@/views/flowable/api/todo";
  import {
    queryMyDepartTreeList
  } from "@/api/api";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";
  import {
    getUserList
  } from "@/api/api"
  import bpmnModeler from "workflow-bpmn-modeler-jeecgboot";
  import DeptUserInfo from '@/views/system/modules/DeptUserInfo'
  import {
    flowableMixin
  } from '@/views/flowable/mixins/flowableMixin'

  import {mLoginName} from "@/api/login";
  import { getCustomForm, getOnlineForm, saveOnlineFormData, getOnlineFormData, getOnlineFormItem  } from "@/api/form";
  import Vue from 'vue'
  import { ACCESS_TOKEN, USER_NAME, USER_INFO } from "@/store/mutation-types"
  //for formdesigner
  import formBuilder from '@/components/formdesigner/components/formBuilder'
  import formViewer from '@/components/formdesigner/components/formViewer'
  //online表单显示组件
  import { handongRule } from '@comp/formdesigner/hanDongYuZhou/handongCommon'
  import hanDongInput from "@comp/formdesigner/hanDongYuZhou/hanDongInput";
  import hanDongPassword from "@comp/formdesigner/hanDongYuZhou/hanDongPassword";
  import hanDongSwitch from "@comp/formdesigner/hanDongYuZhou/hanDongSwitch";
  import hanDongList from "@comp/formdesigner/hanDongYuZhou/hanDongList";
  import hanDongRadio from "@comp/formdesigner/hanDongYuZhou/hanDongRadio";
  import hanDongCheckbox from "@comp/formdesigner/hanDongYuZhou/hanDongCheckbox";
  import hanDongListMulti from "@comp/formdesigner/hanDongYuZhou/hanDongListMulti";
  import hanDongSelSearch from "@comp/formdesigner/hanDongYuZhou/hanDongSelSearch";
  import hanDongTextArea from "@comp/formdesigner/hanDongYuZhou/hanDongTextArea";
  import hanDongDate from "@comp/formdesigner/hanDongYuZhou/hanDongDate";
  import hanDongDateTime from "@comp/formdesigner/hanDongYuZhou/hanDongDateTime";
  import hanDongTime from "@comp/formdesigner/hanDongYuZhou/hanDongTime";
  import hanDongImage from "@comp/formdesigner/hanDongYuZhou/hanDongImage";
  import hanDongFile from "@comp/formdesigner/hanDongYuZhou/hanDongFile";
  import hanDongUmeditor from "@comp/formdesigner/hanDongYuZhou/hanDongUmeditor";
  import hanDongSelUser from "@comp/formdesigner/hanDongYuZhou/hanDongSelUser";
  import hanDongSelDepart from "@comp/formdesigner/hanDongYuZhou/hanDongSelDepart";
  import hanDongMarkDown from "@comp/formdesigner/hanDongYuZhou/hanDongMarkDown";
  import hanDongPca from "@comp/formdesigner/hanDongYuZhou/hanDongPca";
  import hanDongPopup from "@comp/formdesigner/hanDongYuZhou/hanDongPopup";
  import hanDongSelTree from "@comp/formdesigner/hanDongYuZhou/hanDongSelTree";
  import hanDongCatTree from "@comp/formdesigner/hanDongYuZhou/hanDongCatTree";
  import hanDongLinkDown from "@comp/formdesigner/hanDongYuZhou/hanDongLinkDown";
  //add by nbacheng 2023-02-23 微信与uni插件
  import wx from 'weixin-js-sdk'
  import * as uni  from "@dcloudio/uni-webview-js"
  
  export default {
    name: "Record",
    mixins: [flowableMixin],
    components: {
      Parser,
      bpmnModeler,
      DeptUserInfo,
      formBuilder,
      formViewer,
      //online
      hanDongInput,
      hanDongPassword,
      hanDongSwitch,
      hanDongList,
      hanDongRadio,
      hanDongCheckbox,
      hanDongListMulti,
      hanDongSelSearch,
      hanDongTextArea,
      hanDongDate,
      hanDongDateTime,
      hanDongTime,
      hanDongImage,
      hanDongFile,
      hanDongUmeditor,
      hanDongSelUser,
      hanDongSelDepart,
      hanDongMarkDown,
      hanDongPca,
      hanDongPopup,
      hanDongSelTree,
      hanDongCatTree,
      hanDongLinkDown,
    },
    props: {},
    data() {
      return {
        // 模型xml数据
        xmlData: "",
        xmlShow: true,
        xmlView: true,
        users: [],
        groups: [],
        categorys: [],
        taskList: [],
        iExpandedKeys: [],
        checkedKeys: [],
        selectedKeys: [],
        departTree: [],
        treeData: [],
        userIdentity: "",
        autoExpandParent: true,
        // 部门名称
        deptName: undefined,
        // 部门树选项
        deptOptions: undefined,
        // 用户表格数据
        userList: null,
        defaultProps: {
          children: "children",
          label: "label"
        },
        // 查询参数
        queryParams: {
          deptId: undefined
        },
        // 遮罩层
        loading: true,
        flowRecordList: [], // 流程流转数据
        formConfCopy: {},
        src: null,
        rules: {}, // 表单校验
        variablesForm: {}, // 流程变量数据
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
          username: "",
          types: 0,      //业务类型
          platform: "",  //移动端平台
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
        userDataList: [], // 流程候选人
        assignee: null,
        formConf: {}, // 默认表单数据
        formConfOpen: false, // 是否加载默认表单数据
        customForm: { //自定义表单
          formId: '',
          title: '',
          disabled: false,
          visible: false,
          formComponent: null,
          model: {},
          /*流程数据*/
          customFormData: {},
          isNew: false,
          disableSubmit: true
        },
        onlineForm: { //online提交表单
          formId: '',
          title: '',
          disabled: false,
          visible: false,
          formComponent: null,
          model: {},
          /*流程数据*/
          onlineFormData: {},
          isNew: false,
          disableSubmit: true,
          submitting: false,
          submitError: ''
        },
        onlineFormItem: {// online FormItem数据,作为主从表生成来源
          formData: [],
          subTable: [],
          tableForm: {
            tableName: [],
            columns: [],
          },
          dataSource:[],
        }, 
        saveOnlineFormData: { //提交online表单数据
          dataList: {},
        }, 
        onlineViewForm: { //online显示表单
          formId: '',
          title: '',
          disabled: false,
          visible: false,
          formComponent: null,
          model: {},
          /*流程数据*/
          onlineFormData: {},
          isNew: false,
          disableSubmit: true
        },       
        formCode:'',
        formVal:'',
        formViewOpen: false,  //是否显示formdesigner的输入后提交的表单
        formViewData: '',    //显示formdesigner的输入后提交的表单数据
        variables: [], // 流程变量数据
        variablesData: {}, // 流程变量数据
        variableOpen: false, // 是否加载流程变量数据
        fileDisplay: false, // 是否显示上传的文件控件
        fileList: [], //表单设计器上传的文件列表
        returnTaskList: [], // 回退列表数据
        finished: 'false',
        completeTitle: null,
        completeOpen: false,
        returnTitle: null,
        returnOpen: false,
        rejectOpen: false,
        rejectTitle: null,
        userData: [],     //选中用户
        checkSendUser: false ,// 是否展示选择人员模块,
        taskFormOpen: false, //任务表单
        taskFormData: '',//流程任务录入表单
        taskFormVal: [], //流程任务显示表单数据填充值
        taskFormList: [], // 流程任务变量数据列表
        taskFormViewOpen: false, //任务表单
        startUserForm : {  
          isStartUserNode: false, //第一个用户任务发起节点
          editFormType: '', //第一发起人节点编辑的表单类型
        },
        bapproved: false,  //获取下个节点是否通用同意拒绝网关，以便显示拒绝按钮
        addSignOpen: false, //前加签
        addSignTitle: null,  //加签标题
        addSignForm: {
          multiple: true,
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
          addSignUsers: "", //委托加签人员
          addSignType: 0, //加签类型
        },
        
        jumpOpen: false, //跳转
        jumpTitle: null,  //跳转标题
        jumpForm: {
          multiple: true,
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
          jumpNode: "", //跳转节点
        },
        jumpNodeLoading: false,
        jumpNodeData: [],
        jumpNodeColumns: [
          {
            title: '节点名称',
            dataIndex: 'name'
          }
        ],
        selectedRowKeys: [],
        selectedRows: [],
      };
    }, 
    created() {
      this.$message.config({top: `200px`,});
      this.types = this.$route.query && this.$route.query.types;
      this.platform = this.$route.query && this.$route.query.platform;
      this.username = this.$route.query && this.$route.query.username;
      console.log("created username",this.username)
      mLoginName({
      				username: this.username
      			}).then((res) => {
      				console.log(res.result, 2323);
      				Vue.ls.set(ACCESS_TOKEN, res.result.token, 7 * 24 * 60 * 60 * 1000);
      				Vue.ls.set(
      					USER_NAME,
      					res.result.userInfo.username,
      					7 * 24 * 60 * 60 * 1000
      				);
      				Vue.ls.set(USER_INFO, res.result.userInfo, 7 * 24 * 60 * 60 * 1000);
            
      this.taskForm.deployId = this.$route.query && this.$route.query.deployId;
      this.taskForm.taskId = this.$route.query && this.$route.query.taskId;
      this.taskForm.procInsId = this.$route.query && this.$route.query.procInsId;
      this.taskForm.instanceId = this.$route.query && this.$route.query.procInsId;
      // 初始化表单
      this.taskForm.procDefId = this.$route.query && this.$route.query.procDefId;
      this.taskForm.businessKey = this.$route.query && this.$route.query.businessKey;
      this.taskForm.category = this.$route.query && this.$route.query.category;
      this.taskForm.dataId = this.$route.query && this.$route.query.businessKey;
      //节点类型
      this.taskForm.nodeType = this.$route.query && this.$route.query.nodeType;
      //online表单id和数据id
      this.taskForm.onlineId = this.$route.query && this.$route.query.onlineId;
      if (this.taskForm.category === 'online') {
        this.taskForm.onlineDataId = this.$route.query && this.$route.query.businessKey;
      }

      // 回显流程记录
      //
      console.log("created this.taskForm.taskId=",this.taskForm.taskId);
      console.log("created this.taskForm.deployId=",this.taskForm.deployId);
      this.getModelDetail(this.taskForm.deployId);
      // 流程任务重获取变量表单
      if (this.taskForm.taskId) {
        this.processVariables(this.taskForm.taskId)
        this.getNextApprovedEG(this.taskForm.taskId)
        this.getNextFlowNode(this.taskForm.taskId)
        console.log("userDataList=", this.userDataList)
      }
      this.getFlowRecordList(this.taskForm.procInsId, this.taskForm.deployId, this.taskForm.businessKey, this.taskForm.taskId, this.taskForm.category);
      this.finished = this.$route.query && this.$route.query.finished
      console.log("this.finished",this.finished)
      });
    },
    mounted() {
      //表单数据回填，模拟异步请求场景
      setTimeout(() => {
        // 回填数据,这里主要是处理文件列表显示,临时解决，以后应该在form设计器完成
        if (this.variablesData.hasOwnProperty('list')) {
          this.fillFormData(this.variablesData.list, this.variablesData)
          // 更新表单
          this.key = +new Date().getTime()
        }
      }, 1000)
    },
    methods: {
      /** 查询部门下拉树结构 */
      getTreeselect() {
        var that = this
        that.treeData = []
        that.departTree = []
        queryMyDepartTreeList().then((res) => {
          if (res.success && res.result) {
            for (let i = 0; i < res.result.length; i++) {
              let temp = res.result[i]
              that.treeData.push(temp)
              that.departTree.push(temp)
              that.setThisExpandedKeys(temp)
              // console.log(temp.id)
            }
            this.loading = false
          }
          that.userIdentity = res.message
        });
      },
      clearSelectedDepartKeys() {
        this.checkedKeys = [];
        this.selectedKeys = [];
        this.currentDeptId = '';
        this.$refs.DeptUserInfo.currentDeptId = '';
      },
      setThisExpandedKeys(node) {
        //只展开一级目录
        if (node.children && node.children.length > 0) {
          this.iExpandedKeys.push(node.key)
          //下方代码放开注释则默认展开所有节点
          /**
          for (let a = 0; a < node.children.length; a++) {
            this.setThisExpandedKeys(node.children[a])
          }
          */
        }
      },
      /** 查询用户列表 */
      getList() {
        getUserList(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.userList = response.rows;
          this.total = response.total;
        });
      },
      // 筛选节点
      filterNode(value, data) {
        if (!value) return true;
        return data.label.indexOf(value) !== -1;
      },
      // 节点单击事件
      handleNodeClick(data) {
        this.queryParams.deptId = data.id;
        this.getList();
      },
      /** xml 文件 */
      getModelDetail(deployId) {
        // 发送请求，获取xml
        readXml(deployId).then(res => {
          this.xmlData = res.result
          this.getFlowViewer(this.taskForm.procInsId);
        })
      },
      getFlowViewer(procInsId) {
        getFlowViewer(procInsId).then(res => {
          this.taskList = res.result || [];
          console.log("taskList=", this.taskList);
          this.fillColor();
        })
      },
      setIcon(val) {
        if (val) {
          return "el-icon-check";
        } else {
          return "el-icon-time";
        }
      },
      setColor(val) {
        if (val) {
          return "#2bc418";
        } else {
          return "#b3bdbb";
        }
      },
      fillColor() {
        const modeler = this.$refs.refNode.modeler;
        const canvas = modeler.get('canvas')
        console.log("fillColor modeler=",modeler)
        modeler._definitions.rootElements[0].flowElements.forEach(n => {
          const completeTask = this.taskList.filter(m => m.key === n.id)
          const todoTask = this.taskList.find(m => !m.completed)
          const endTask = this.taskList[this.taskList.length - 1]
          if (n.$type === 'bpmn:UserTask') {
            if (completeTask) {
              if(completeTask.length >0) {
                canvas.addMarker(n.id, completeTask[completeTask.length-1].completed ? 'highlight' : 'highlight-todo')
              }
              else {
                canvas.addMarker(n.id, completeTask.completed ? 'highlight' : 'highlight-todo')
              }
              
              n.outgoing.forEach(nn => {
                const targetTask = this.taskList.find(m => m.key === nn.targetRef.id)
                if (targetTask) {
                  if (todoTask && completeTask.key === todoTask.key && !todoTask.completed) {
                    canvas.addMarker(nn.id, todoTask.completed ? 'highlight' : 'highlight-todo')
                    canvas.addMarker(nn.targetRef.id, todoTask.completed ? 'highlight' : 'highlight-todo')
                  } else {
                    canvas.addMarker(nn.id, targetTask.completed ? 'highlight' : 'highlight-todo')
                    canvas.addMarker(nn.targetRef.id, targetTask.completed ? 'highlight' : 'highlight-todo')
                  }
                }
              })
            }
          }
          // 排他网关
          else if (n.$type === 'bpmn:ExclusiveGateway') {
            if (completeTask) {
              if(completeTask.length >0) {
                canvas.addMarker(n.id, completeTask[completeTask.length-1].completed ? 'highlight' : 'highlight-todo')
              }
              else {
                canvas.addMarker(n.id, completeTask.completed ? 'highlight' : 'highlight-todo')
              }
              n.outgoing.forEach(nn => {
                const targetTask = this.taskList.find(m => m.key === nn.targetRef.id)
                if (targetTask) {

                  canvas.addMarker(nn.id, targetTask.completed ? 'highlight' : 'highlight-todo')
                  canvas.addMarker(nn.targetRef.id, targetTask.completed ? 'highlight' : 'highlight-todo')
                }

              })
            }

          }
          // 并行网关
          else if (n.$type === 'bpmn:ParallelGateway') {
            if (completeTask) {
              if(completeTask.length >0) {
                canvas.addMarker(n.id, completeTask[completeTask.length-1].completed ? 'highlight' : 'highlight-todo')
              }
              else {
                canvas.addMarker(n.id, completeTask.completed ? 'highlight' : 'highlight-todo')
              }
              n.outgoing.forEach(nn => {
                debugger
                const targetTask = this.taskList.find(m => m.key === nn.targetRef.id)
                if (targetTask) {
                  canvas.addMarker(nn.id, targetTask.completed ? 'highlight' : 'highlight-todo')
                  canvas.addMarker(nn.targetRef.id, targetTask.completed ? 'highlight' : 'highlight-todo')
                }
              })
            }
          } else if (n.$type === 'bpmn:StartEvent') {
            console.log("n.outgoing=",n.outgoing)
            n.outgoing.forEach(nn => {
              const completeTask = this.taskList.find(m => m.key === nn.targetRef.id)
              if (completeTask) {
                canvas.addMarker(nn.id, 'highlight')
                canvas.addMarker(n.id, 'highlight')
                return
              }
            })
          } else if (n.$type === 'bpmn:EndEvent') {
            //console.log("endTask=",endTask)
            if (endTask.key === n.id && endTask.completed) {
              canvas.addMarker(n.id, 'highlight')
              return
            }
          }
        })
      },
      // 单选框选中下一个流程人员
      handleSelectionChange(selection) {
        this.userData = selection
        const val = selection.map(item => item.username);
        console.log("val=", val);
        if (val instanceof Array) {
          this.taskForm.values = {
            "approval": val.join(',')
          }
        } else {
          this.taskForm.values = {
            "approval": val,
          }
        }
        console.log("this.taskForm.values=", this.taskForm.values);
      },
      clearSelectedDepartKeys() {
        this.checkedKeys = [];
        this.selectedKeys = [];
        this.currentDeptId = '';
        this.$refs.DeptUserInfo.currentDeptId = '';
      },
      onExpand(expandedKeys) {
        this.iExpandedKeys = expandedKeys
        this.autoExpandParent = false
      },
      onSelect(selectedKeys, e) {
        if (this.selectedKeys[0] !== selectedKeys[0]) {
          this.selectedKeys = [selectedKeys[0]];
        }
        let record = e.node.dataRef;
        this.checkedKeys.push(record.id);
        this.$refs.DeptUserInfo.onClearSelected();
        this.$refs.DeptUserInfo.open(record);
      },
      // 关闭标签
      handleClose(tag) {
        this.userData.splice(this.userData.indexOf(tag), 1);
        this.$refs.singleTable.toggleRowSelection(tag, false)
      },
      /** 流程变量赋值 */
      handleCheckChange(selection) {
       const val = selection.map(item => item.username);
       this.taskForm.values = {approval:val};
       console.log("this.taskForm.values=",this.taskForm.values);
      },
      /** 流程流转记录 */
      getFlowRecordList(procInsId, deployId, businessKey, taskId, category) {
        console.log("procInsId=, deployId=, businessKey=, taskId=， category=", procInsId, deployId, businessKey, taskId, category);
        const params = {
          procInsId: procInsId,
          deployId: deployId,
          businessKey: businessKey,
          taskId: taskId,
          category: category
        }
        console.log("this.taskForm.onlineId=",this.taskForm.onlineId);
        console.log("this.taskForm.category=",this.taskForm.category);
        console.log("this.taskForm.onlineDataId=",this.taskForm.onlineDataId);
        if (this.taskForm.category === 'online' && this.taskForm.onlineDataId === undefined) {//online申请提交
           this.onlineForm.formId = this.$route.query && this.$route.query.onlineId;
            getOnlineForm(this.onlineForm.formId).then(res => {
            console.log("getOnlineForm res=",res);
            this.onlineForm.onlineFormData = res.result.formData;
            this.onlineForm.disabled = false;
            this.onlineForm.isNew = true;
            this.onlineForm.visible = true;
            console.log("onlineForm.onlineFormData=",this.onlineForm.onlineFormData);
            getOnlineFormItem(this.onlineForm.formId).then(itemres => {//获取从表相关信息
              if (itemres.success) {
                console.log("getOnlineFormItem itemres=",itemres)
                this.onlineFormItem.formData = itemres.result
                var subTable = itemres.result.head.subTableStr
                this.onlineFormItem.subTable = subTable.split(",")
                console.log("this.onlineFormItem.subTable=",this.onlineFormItem.subTable)
                for (var i=0;i<this.onlineFormItem.subTable.length;i++) {
                  var tablename = this.onlineFormItem.subTable[i]
                  if(this.onlineFormItem.formData.schema.properties.hasOwnProperty(tablename)) {
                    this.onlineFormItem.tableForm.tableName[i] = tablename
                    this.onlineFormItem.tableForm.columns[i] = this.onlineFormItem.formData.schema.properties[tablename].columns
                  }
                }
                console.log("this.onlineFormItem.tableForm=",this.onlineFormItem.tableForm)
                this.onlineForm.visible  = true;
              }
              else {
                this.$message.error(itemres.message);
              }  
            })
          })    
        }
        else if (businessKey == 'newkey') {
           this.customForm.formId = this.$route.query && this.$route.query.formId;
            getCustomForm(this.customForm.formId).then(res => {
            console.log("newkey res=",res);
            this.customForm.disabled = false;
            this.customForm.isNew = true;
            this.customForm.visible = true;
            this.customForm.disableSubmit = false;
            this.customForm.formComponent = this.getFormComponent(res.result.routeName).component;
            this.formConfOpen = true;
          })  
         
           
        } else {
          flowRecord(params).then(res => {
            console.log("res", res);
            if (res.success) {
              this.flowRecordList = res.result.flowList;
              console.log("this.flowRecordList", this.flowRecordList);
              if (res.result.hasOwnProperty('flowList')) {
                this.flowRecordList.forEach((item, index) => {
                  if (item.activityType === 'startEvent' || item.activityType === 'endEvent' ){
                    return;
                  }
                  this.taskFormList[index] = JSON.stringify(item.taskFormValues);
                  //对下个节点是会签同时可以选择用户的做特殊处理taskformvalues
                  if(item.taskFormValues.formValue.hasOwnProperty('taskformvalues')) {
                    this.taskFormVal[index] = JSON.stringify(item.taskFormValues.formValue.taskformvalues);
                  }
                  else {
                    this.taskFormVal[index] = JSON.stringify(item.taskFormValues.formValue);
                  }
                  //console.log("index,",index);
                  //console.log("item=",item);
                });
                //倒序显示,跟流程记录刚好相反
                this.taskFormList.reverse();
                this.taskFormVal.reverse();
                this.taskFormViewOpen = true;
                console.log("this.taskFormList=",this.taskFormList);
                console.log("this.taskFormVal=",this.taskFormVal);
              } 
              //判断是否是开始后的第一个用户任务节点，是就放开表单编辑功能 
              if (res.result.hasOwnProperty('isStartUserNode') && res.result.isStartUserNode) {
                if(this.taskForm.category === 'online') {
                  this.startUserForm.editFormType = 'online';
                }
                else if (this.taskForm.category === 'zdyyw') {
                  this.startUserForm.editFormType = 'zdyyw';
                }
                else {
                  this.startUserForm.editFormType = 'oa';
                }
                this.startUserForm.isStartUserNode = true;
              }
              //流程过程中有online表单数据，获取online表单配置与数据
              if (res.result.hasOwnProperty('onlineConfig')) {
                this.onlineViewForm.onlineFormData = res.result.onlineConfig;
                console.log("onlineViewForm.onlineFormData=",this.onlineViewForm.onlineFormData);
                console.log("this.taskForm=",this.taskForm)
                var sonlineId = res.result.onlineId
                getOnlineFormData(sonlineId,this.taskForm.onlineDataId).then(res => {
                  console.log("getOnlineFormData res=",res);
                  if (res.success) {
                    this.onlineViewForm.model = res.result;
                    console.log("onlineViewForm.model=",this.onlineViewForm.model);
                    getOnlineFormItem(sonlineId).then(itemres => {//获取从表相关信息
                      if (itemres.success) {
                        console.log("getOnlineFormItem itemres=",itemres)
                        this.onlineFormItem.formData = itemres.result
                        if(itemres.result.head.subTableStr != null) {
                          var subTable = itemres.result.head.subTableStr
                          this.onlineFormItem.subTable = subTable.split(",")
                          console.log("this.onlineFormItem.subTable=",this.onlineFormItem.subTable)
                          for (var i=0;i<this.onlineFormItem.subTable.length;i++) {
                            var tablename = this.onlineFormItem.subTable[i]
                            if(this.onlineFormItem.formData.schema.properties.hasOwnProperty(tablename)) {
                              this.onlineFormItem.tableForm.tableName[i] = tablename
                              this.onlineFormItem.tableForm.columns[i] = this.onlineFormItem.formData.schema.properties[tablename].columns
                              this.onlineFormItem.dataSource[i] = this.onlineViewForm.model[tablename]
                            }
                          }
                          console.log("this.onlineFormItem.tableForm=",this.onlineFormItem.tableForm)
                          console.log("this.onlineFormItem.dataSource=",this.onlineFormItem.dataSource)
                        }
                        if(this.startUserForm.isStartUserNode) {
                          this.onlineViewForm.disabled = false;
                        }
                        else {
                          this.onlineViewForm.disabled = true;
                        }  
                        this.onlineViewForm.isNew = false;
                        this.onlineViewForm.visible = true;
                      }
                      else {
                        this.$message.error(itemres.message);
                      }  
                    })
                  }
                  
                })    
              }  
              // 流程过程中不存在初始化表单 直接读取的流程变量中存储的表单值
              else if (res.result.hasOwnProperty('formData')) {
                //console.log("flowRecord res.result.formData", res.result.formData);
                this.formConf = res.result.formData;
                //console.log("flowRecord this.formConf", this.formConf);
                this.formCode = JSON.stringify(res.result.formData);
                //console.log("flowRecord this.formCode", this.formCode); 
                if(res.result.hasOwnProperty('routeName')) {
                  if(this.startUserForm.isStartUserNode) {
                    this.customForm.disabled = false;
                  }
                  else {
                    this.customForm.disabled = true;
                  }
                  this.customForm.visible = true;
                  this.customForm.formComponent = this.getFormComponent(res.result.routeName).component;
                  this.customForm.model = res.result.formData;
                  this.customForm.customFormData = res.result.formData;
                }
                console.log("this.customForm=", this.customForm);
                console.log("model=", this.customForm.model);
                if(res.result.formData.hasOwnProperty('config')) {
                  this.formConfOpen = true;
                }
                else {
                  this.formConfOpen = false;
                }
              }
              else if (res.result.hasOwnProperty('taskFormData')) {
                //console.log("flowRecord res.result.taskFormData", res.result.taskFormData);
                this.taskFormData = JSON.stringify(res.result.taskFormData);
                //console.log("flowRecord this.taskFormData", this.taskFormData);
                this.taskFormOpen = true;
              }  
            
            } else {
              this.$message.error(res.message);
              return;
            }

          }).catch(res => {
            this.$message.error("出现异常");
            //考虑到手机端
            setTimeout(() => {
              this.goBack();
            },1000);
          })
        } 

      },
      gettest() {
        console.log("get test model=", this.customForm.model);
      },
      /** 获取流程变量内容 */
      processVariables(taskId) {
        if (taskId) {
          // 提交流程申请时填写的表单存入了流程变量中后续任务处理时需要展示
          getProcessVariables(taskId).then(res => {
            console.log("getProcessVariables res=",res);
             this.variables = res.result.variables;
            if(res.success) {
              if(res.result.hasOwnProperty('variables')) {
                this.variablesData = res.result.variables;
                console.log("this.variablesData=",this.variablesData)
                this.variableOpen = true;
                this.formViewData = JSON.stringify(this.variablesData);
                this.formVal = JSON.stringify(this.variablesData.formValue);
                this.taskForm.values = JSON.parse(this.formVal);
                console.log("this.taskForm.values=",this.taskForm.values);
              }
            }
            else {
              this.$message.error(res.message);
            }
           
          });
        }
      },
      //点击文件列表中已上传文件进行下载
      handleFilePreview(file) {
        var a = document.createElement('a');
        var event = new MouseEvent('click');
        a.download = file.name;
        a.href = file.url;
        a.dispatchEvent(event);
        console.log(file)
      },
      fillFormData(list, formConf) { // for formdesigner 
        console.log("fillFormData list=",list);
        console.log("fillFormData formConf=",formConf);
        list.forEach((item, i) => {
          // 特殊处理el-upload，包括 回显图片
          if(formConf.formValue[item.id] != '') {
            const val = formConf.formValue[item.id];
            if (item.ele === 'el-upload') {
              console.log('fillFormData val=',val)
              if(item['list-type'] != 'text') {//图片
                this.fileList = []    //隐藏加的el-upload文件列表
                //item['file-list'] = JSON.parse(val)
                if(val != '') {
                  item['file-list'] = JSON.parse(val)
                }
              }
              else {  //列表
                console.log("列表fillFormData val",val)
                this.fileList = JSON.parse(val)
                item['file-list'] = [] //隐藏加的表单设计器的文件列表
              }
              // 回显图片
              this.fileDisplay = true
            }
          }
          
          if (Array.isArray(item.columns)) {
            this.fillFormData(item.columns, formConf)
          }
        })
      },
      /** 根据当前任务或者流程设计配置的下一步节点 */
      getNextFlowNode(taskId) {
        // 根据当前任务或者流程设计配置的下一步节点 todo 暂时未涉及到考虑网关、表达式和多节点情况
        const params = {
          taskId: taskId
        }
        getNextFlowNode(params).then(res => {
          const data = res.result;
          if (data) {
            this.checkSendUser = true
            console.log("getNextFlowNode data=",data)
            if (data.type === 'assignee') { // 指定人员
              this.userDataList = res.result.userList;
              this.checkSendUser = false;
            } else if (data.type === 'candidateUsers') { // 指定人员(多个)
              this.userDataList = res.result.userList;
              //console.log("candidateUsers nodeType,bmutiInstanceFinish=",this.taskForm.nodeType,this.taskForm.bmutiInstanceFinish) 
              if(this.userDataList.length===1) {
                this.checkSendUser = true;
              }
              else if(this.userDataList.length>1) {
                 console.log("candidateUsers nodeType=",this.taskForm.nodeType) 
                 if(this.taskForm.nodeType === 'multiInstance') {
                
                   console.log("candidateUsers res.result.bmutiInstanceFinish=",res.result.bmutiInstanceFinish) 
                     if(res.result.bmutiInstanceFinish) {//根据会签条件，最后一个审批才弹出多用户选择
                       this.checkSendUser = true;
                     }
                     else {
                       this.checkSendUser = false;
                     }
                 }
              }  
              
              this.taskForm.multiple = true;
              //console.log("res.result.userList=",res.result.userList);
              //console.log("userDataList=",this.userDataList)
            } else if (data.type === 'candidateGroups') { // 指定组(所属角色接收任务)
              res.result.roleList.forEach(role => {
                role.userId = role.roleId;
                role.realName = role.roleName;
              })
              this.userDataList = res.result.roleList;
              this.taskForm.multiple = false;
            } else if (data.type === 'multiInstance') { // 会签，不让用户选择，固定流程设置的人员
              this.userDataList = res.result.userList;
              this.userData = this.userDataList;
              this.taskForm.multiple = true;
              this.checkSendUser = false;
            } else if (data.type === 'fixed') { // 已经固定人员接收下一任务
              this.checkSendUser = false;
            }
            //console.log("checkSendUser,userDataList=",this.checkSendUser,this.userDataList)
          }
        })
      },
      //获取下一个通用拒绝同意排它网关
      getNextApprovedEG(taskId) {
        nextApprovedEG({taskId: taskId}).then(res => {
          if(res.success) {
            const data = res.result;
            console.log("getNextApprovedEG",data)
            this.bapproved = data;
          }
         
          
        });  
      },      
      /** 审批任务选择 */
      handleComplete() {
        const taskFormRef = this.$refs.taskFormBuilder;
        console.log("taskFormRef=",taskFormRef);
        const isExistTaskForm = taskFormRef !== undefined;
        
        // 若无任务表单，则 taskFormPromise 为 true，即不需要校验
        const taskFormPromise = !isExistTaskForm ? true : new Promise((resolve, reject) => {
          taskFormRef.$refs[taskFormRef.formConf.formModel].validate(valid => {
            valid ? resolve() : reject()
          })
        });
        Promise.all([taskFormPromise]).then(() => {//校验通过
          this.completeOpen = true;
          this.completeTitle = "审批流程";
          this.getTreeselect();
        })  
      },
      /** 审批任务 */
      taskComplete(approved) {
        if (!this.taskForm.values && this.checkSendUser) {
            this.$message.error("请选择流程接收人员");
            return;
        }
        else if( this.checkSendUser && (this.taskForm.values.approval.split(",").length>1)) {
            this.$message.error("目前流程只能选择一个接收人员");
            return;
        }

        if (!this.taskForm.comment) {
          this.$message.error("请输入审批意见");
          return;
        }
        const taskFormRef = this.$refs.taskFormBuilder;
        const isExistTaskForm = taskFormRef !== undefined;
        if (isExistTaskForm) {//流程里的设置表单
          this.taskForm.values.taskformvalues = taskFormRef.form;
        }
        if (this.startUserForm.isStartUserNode && this.startUserForm.editFormType === 'oa' ) {
          this.$refs.refStartBuilder.validate();
          const approval = this.taskForm.values.approval;
          const variables=JSON.parse(this.formVal);
          const formData = JSON.parse(this.formViewData);
          formData.formValue = JSON.parse(this.formVal);
          variables.variables = formData;
          console.log("variables=", variables);
          this.taskForm.variables = variables;
          this.taskForm.values = variables;
          if(approval) {
            this.taskForm.values.approval = approval;
          }
        }
        if (this.startUserForm.isStartUserNode && this.startUserForm.editFormType === 'zdyyw' ) {
          this.$message.error("目前还不支持自定义表单的编辑修改功能！！！");
          //this.$refs.refCustomForm.submitForm();
        }  
        if (this.startUserForm.isStartUserNode && this.startUserForm.editFormType === 'online' ) {
          this.$message.error("目前还不支持online表单的编辑修改功能！！！");
          //this.$refs.refViewOnlForm.submitForm();
        }  
        this.taskForm.approved = approved; //对特殊通用同意拒绝排它网关的处理
        console.log("this.taskForm=",this.taskForm);        
        complete(this.taskForm).then(response => {
          this.$message.success(response.message);
          //考虑到手机端
          setTimeout(() => {
            this.goBack();
          },500);
        });
      },
      /** 委派任务 */
      handleDelegate() {
        this.taskForm.delegateTaskShow = true;
        this.taskForm.defaultTaskShow = false;
      },
      handleAssign() {

      },
      /** 返回页面 */
      goBack() {
        // 关闭当前标签页并返回上个页面
        //this.$store.dispatch("tagsView/delView", this.$route);
        	// 关闭当前标签页并返回上个页面
          console.log("goBack types=",this.types);
          console.log("goBack platform=",this.platform);
            if(this.platform === "weixin") {
              setTimeout(() => {
        					if (this.types == 999) {
        						console.log(23232);
        						/*wx.miniProgram.navigateTo({
        							url: "/pages/toDoProcess/toDoProcess"
        						});*/
                    wx.miniProgram.navigateBack();
        					} else if (this.types == 888) {
        						/*wx.miniProgram.navigateTo({ 
        							url: "/pages/toDoProcess/newProcess"
        						});*/
                    wx.miniProgram.navigateBack();
        					} else {
        						wx.miniProgram.navigateBack();
                    //window.close();
        					}
        				}, 500);
            }
            else if (this.platform === "app") {
              setTimeout(() => {
              		if (this.types == 999) {
              			console.log(23232);
                  //  uni.redirectTo({  
              		//		url: "/pages/toDoProcess/toDoProcess"
              		//	});
                    uni.navigateBack({
                                      delta: 1
                                    });
              		} else if (this.types == 888) {
                    //uni.redirectTo({  
              			//	url: "/pages/toDoProcess/newProcess"
              			//});
                    uni.navigateBack({
                                      delta: 1
                                    });
              		} else {
                    uni.navigateBack({
                                      delta: 1
                                    });
              			//window.close();
              		}
              	}, 500);
            }
            else if (this.platform === "h5") {
              this.$router.go(-1);
            }
            else {
              this.$router.go(-1);
            }
            //this.$router.go(-1)
      },
      /** 接收子组件传的值 */
      getData(data) {
        if (data) {
          console.log("enter getData data=",data)
          const variables = [];
          data.fields.forEach(item => {
            let variableData = {};
            variableData.label = item.__config__.label
            // 表单值为多个选项时
            if (item.__config__.defaultValue instanceof Array) {
              const array = [];
              item.__config__.defaultValue.forEach(val => {
                array.push(val)
              })
              variableData.val = array;
            } else {
              variableData.val = item.__config__.defaultValue
            }
            variables.push(variableData)
          })
          this.variables = variables;
          console.log("this.variables=",variables)
        }
      },
      /** 申请流程表单formdesigner数据提交 nbacheng2022-09-05 */
      submitForm() {
        this.$refs.formBuilder.validate();
        if(this.formVal !='') {
          //console.log("submitForm formVal",this.formVal);
          //console.log("submitForm formCode",this.formCode);
          this.formViewOpen = true;
          this.formConfOpen = false;
          const variables=JSON.parse(this.formVal);
          const formData = JSON.parse(this.formCode);
          formData.formValue = JSON.parse(this.formVal);

          if (this.taskForm.procDefId) {
            variables.variables = formData;
            console.log("variables=", variables);
            // 启动流程并将表单数据加入流程变量
            definitionStartByDefId(this.taskForm.procDefId, variables).then(res => {
              this.$message.success(res.message);
              //考虑到手机端
              setTimeout(() => {
                this.goBack();
              },1000);
            })
          }
        }
      },
      //online表单提交数据信息
      async submitOnlForm(){
        if (this.onlineForm.submitting) return;
        this.onlineForm.submitting = true;
        this.onlineForm.submitError = '';
        const showError = message => {
          this.onlineForm.submitError = message;
          this.$message.error(message);
        };
        try {
          const formData = this.onlineForm.onlineFormData;
          if (!Array.isArray(formData) || formData.length === 0) {
            showError('在线表单尚未加载完成');
            return;
          }
          this.saveOnlineFormData.formId = formData[0].id;
          this.saveOnlineFormData.fieldList = formData[0].fieldAll;
          const code = this.saveOnlineFormData.formId + '?tabletype=1';
          this.variables = JSON.parse(JSON.stringify(this.saveOnlineFormData.dataList));
          this.variables.variables = JSON.parse(JSON.stringify(this.saveOnlineFormData.dataList));
          const saveRes = await saveOnlineFormData(this.saveOnlineFormData.dataList, code);
          if (!saveRes || !saveRes.success) {
            showError((saveRes && saveRes.message) || '在线表单保存失败');
            return;
          }
          if (!saveRes.result) {
            showError('在线表单已保存，但接口未返回数据ID，流程未发起');
            return;
          }
          const params = Object.assign({ dataId: saveRes.result }, this.variables);
          const startRes = await definitionStartByOnlineDataId(saveRes.result, this.saveOnlineFormData.formId, this.taskForm.deployId, params);
          if (!startRes || !startRes.success) {
            showError((startRes && startRes.message) || '流程发起失败');
            return;
          }
          this.$message.success(startRes.message || '流程发起成功');
          this.onlineForm.isNew = false;
          //考虑到手机端
          setTimeout(() => {
            this.goBack();
          },1000);
        } catch (error) {
          const responseData = error && error.response && error.response.data;
          showError((responseData && responseData.message) || (error && error.message) || '提交失败，请稍后重试');
        } finally {
          this.onlineForm.submitting = false;
        }
      },
      commonComponent(zcf){
       console.log("commonComponent zcf=",zcf);
       console.log("this.saveOnlineFormData.dataList=",this.saveOnlineFormData.dataList)
        for(var i = 0;i<this.onlineForm.onlineFormData.length;i++){
          if(this.onlineForm.onlineFormData[i].id == zcf.cgformHeadId){
            var flagInfo =0;
            let fieldname = zcf.dbFieldName
            this.saveOnlineFormData.dataList[fieldname] = zcf.commonDataInfo
            console.log("this.saveOnlineFormData.dataList[fieldname]",this.saveOnlineFormData.dataList[fieldname])
            for(var k = 0;k<this.saveOnlineFormData.dataList[fieldname].length;k++){
              if(this.saveOnlineFormData.dataList[fieldname][k].id == zcf.id){
                this.saveOnlineFormData.dataList[fieldname][k] = zcf
                flagInfo = 1;
              }
              if(this.saveOnlineFormData.dataList[fieldname][k].tableTypeCode =='hanDongLinkDown' || this.saveOnlineFormData.dataList[fieldname][k].linkDowmIz =='1'){
                //判断当前组件类型是否是linkDown相关组件
                nextLinkDown(this.saveOnlineFormData.dataList[fieldname][k].linkDowmFieldNext,this.saveOnlineFormData.dataList[fieldname][k].commonLinkDownCodeChild)
              }
            }
            if(flagInfo == 0){
              //this.saveOnlineFormData.dataList[fieldname].push(zcf);
              this.saveOnlineFormData.dataList[fieldname] = zcf.commonDataInfo
            }
            console.log("this.saveOnlineFormData.dataList2=",this.saveOnlineFormData.dataList)
          }
        }
      },
      //设置下一级的linkDown 下拉框的值
      nextLinkDown(fieldName,childrenLinkDown){
        console.log("nextLinkDown fieldName=",fieldName)
        for(var i = 0;i<this.onlineForm.onlineFormData.length;i++){
          console.log(this.onlineForm.onlineFormData[i])
          console.log(this.onlineForm.onlineFormData[i].id)
          console.log(zcf.cgformHeadId)
          if(this.onlineForm.onlineFormData[i].id == zcf.cgformHeadId){
            var flagInfo =0;
            for(var k = 0;k<this.saveOnlineFormData.dataList[this.onlineForm.onlineFormData[i].id].length;k++){
              if(this.saveOnlineFormData.dataList[this.onlineForm.onlineFormData[i].id][k].dbFieldName == fieldName){
                this.saveOnlineFormData.dataList[this.onlineForm.onlineFormData[i].id][k].commonDictCode = childrenLinkDown
              }
            }
          }
        }
      },
      /** 加签 */
      handleAddSign() {
        this.addSignOpen = true;
        this.addSignTitle = "前加签流程";
      },
      changeAddSignType(val) {
        this.addSignForm.addSignType = val;
        if(this.addSignForm.addSignType === 0) {
          this.addSignTitle = "前加签流程";
        }
        if(this.addSignForm.addSignType === 1) {
          this.addSignTitle = "后加签流程";
        }
        if(this.addSignForm.addSignType === 2) {
          this.addSignTitle = "多实例加签流程";
        }
        console.log("changeAddSignType =",val);
        console.log("this.addSignTitle =",this.addSignTitle);
      },
      /** 加签任务 */
      addSignComplete() {
        if (!this.addSignForm.addSignUsers ) {
            this.$message.error("请选择用户");
            return;
        }
        // 流程信息
        this.addSignForm.deployId = this.$route.query && this.$route.query.deployId;
        this.addSignForm.taskId = this.$route.query && this.$route.query.taskId;
        this.addSignForm.procInsId = this.$route.query && this.$route.query.procInsId;
        this.addSignForm.instanceId = this.$route.query && this.$route.query.procInsId;
        // 初始化表单
        this.addSignForm.procDefId = this.$route.query && this.$route.query.procDefId;
        this.addSignForm.businessKey = this.$route.query && this.$route.query.businessKey;
        this.addSignForm.category = this.$route.query && this.$route.query.category;
        this.addSignForm.dataId = this.$route.query && this.$route.query.businessKey;
        //节点类型
        this.addSignForm.nodeType = this.$route.query && this.$route.query.nodeType;
        //online表单id和数据id
        this.addSignForm.onlineId = this.$route.query && this.$route.query.onlineId;
        if (this.addSignForm.category === 'online') {
          this.addSignForm.onlineDataId = this.$route.query && this.$route.query.businessKey;
        }  
        //对formdesigner后续加签审批的时候需要用到
        this.addSignForm.values = this.taskForm.values;
        console.log("this.addSignForm=",this.addSignForm);
        
        if(this.addSignForm.addSignType === 2) {
          multiInstanceAddSignTask(this.addSignForm).then(response => {
          this.$message.success(response.message);
          this.addSignOpen = false;
          this.goBack();
          });
        }
        else {
          addSignTask(this.addSignForm).then(response => {
          this.$message.success(response.message);
          this.addSignOpen = false;
          this.goBack();
          });
        }
      },
      
      /** 跳转 */
      handleJump() {
        this.jumpOpen = true;
        this.jumpTitle = "跳转流程";
        this.jumpNodeLoading = true
        userTaskList({ taskId: this.taskForm.taskId }).then((res) => {
          this.jumpNodeLoading = false
          this.jumpNodeData = res.result
        })
      },
      jumpComplete() {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择跳转节点')
          return
        }
        // 流程信息
        this.jumpForm.deployId = this.$route.query && this.$route.query.deployId;
        this.jumpForm.taskId = this.$route.query && this.$route.query.taskId;
        this.jumpForm.procInsId = this.$route.query && this.$route.query.procInsId;
        this.jumpForm.instanceId = this.$route.query && this.$route.query.procInsId;
        // 初始化表单
        this.jumpForm.procDefId = this.$route.query && this.$route.query.procDefId;
        this.jumpForm.businessKey = this.$route.query && this.$route.query.businessKey;
        this.jumpForm.category = this.$route.query && this.$route.query.category;
        this.jumpForm.dataId = this.$route.query && this.$route.query.businessKey;
        //节点类型
        this.jumpForm.nodeType = this.$route.query && this.$route.query.nodeType;
        //online表单id和数据id
        this.jumpForm.onlineId = this.$route.query && this.$route.query.onlineId;
        if (this.jumpForm.category === 'online') {
          this.jumpForm.onlineDataId = this.$route.query && this.$route.query.businessKey;
        }  
        //对formdesigner后续加签审批的时候需要用到
        this.jumpForm.values = this.taskForm.values;
        //目标选择的节点信息
        this.jumpForm.targetActId = this.selectedRows[0].id;
        this.jumpForm.targetActName = this.selectedRows[0].name;
        console.log("this.jumpForm=",this.jumpForm);
        jumpTask(this.jumpForm).then(res => {
          if (res.success) {
            this.$message.success('跳转成功')
            this.jumpOpen = false;
            this.goBack();
          } else {
            this.$message.error('跳转失败：' + res.message)
          }
        });
      },
      
      /**
       * 跳转节点列表选择
       */
      onSelectChange (selectedRowKeys, selectedRows) {
        this.selectedRowKeys = selectedRowKeys
        this.selectedRows = selectedRows
      },
      
      /** 驳回任务 */
      handleReject() {
        this.rejectOpen = true;
        this.rejectTitle = "驳回流程";
      },
      /** 驳回任务 */
      taskReject() {
        this.$refs["taskForm"].validate(valid => {
          if (valid) {
            rejectTask(this.taskForm).then(res => {
              this.$message.success(res.message);
              //考虑到手机端
              setTimeout(() => {
                this.goBack();
              },500);
            });
          }
        });
      },
      /** 可退回任务列表 */
      handleReturn() {
        this.returnOpen = true;
        this.returnTitle = "退回流程";
        returnList(this.taskForm).then(res => {
          this.returnTaskList = res.result;
          if(this.taskForm.hasOwnProperty("values")) {
            this.taskForm.values = null;
          }
        })
      },
      /** 提交退回任务 */
      taskReturn() {
        this.$refs["taskForm"].validate(valid => {
          if (valid) {
            if(this.taskForm.targetKey != '') {
              returnTask(this.taskForm).then(res => {
              this.$message.success(res.message);
              //考虑到手机端
              setTimeout(() => {
                this.goBack();
              },500);
              });
            }
            else {
              this.$message.error("请选择退回目标节点！");
            }
          }
        });
      },
      /** 取消回退任务按钮 */
      cancelTask() {
        this.taskForm.returnTaskShow = false;
        this.taskForm.defaultTaskShow = true;
        this.taskForm.sendUserShow = true;
        this.returnTaskList = [];
      },
      /** 委派任务 */
      submitDeleteTask() {
        this.$refs["taskForm"].validate(valid => {
          if (valid) {
            delegate(this.taskForm).then(response => {
              this.$message.success(response.message);
              //考虑到手机端
              setTimeout(() => {
                this.goBack();
              },500);
            });
          }
        });
      },
      /** 取消回退任务按钮 */
      cancelDelegateTask() {
        this.taskForm.delegateTaskShow = false;
        this.taskForm.defaultTaskShow = true;
        this.taskForm.sendUserShow = true;
        this.returnTaskList = [];
      },
    }
  };
</script>

<!-- <style lang="scss" scoped> -->
<style lang="less">
  .ant-input[disabled] {
  	color: black !important;
  }
  
  .input-table .tbody .td input:disabled {
  	color: black !important;
  }
  
  .test-form {
    margin: 15px auto;
    width: 100%;
    padding: 15px;
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }

  .clearfix:after {
    clear: both
  }
  
  .el-input-number--medium {
  		width: 100% !important;
  		line-height: 34px;
  	}
  
  .box-card {
  	width: 100% !important;
  	margin-bottom: 20px;
    margin-left: 2px;
  	overflow-y: hidden !important;
    overflow-x:auto;
  }

  .el-tag+.el-tag {
    margin-left: 10px;
  }

  .highlight.djs-shape .djs-visual> :nth-child(1) {
    fill: green !important;
    stroke: green !important;
    fill-opacity: 0.2 !important;
  }

  .highlight.djs-shape .djs-visual> :nth-child(2) {
    fill: green !important;
  }

  .highlight.djs-shape .djs-visual>path {
    fill: green !important;
    fill-opacity: 0.2 !important;
    stroke: green !important;
  }

  .highlight.djs-connection>.djs-visual>path {
    stroke: green !important;
  }

  .highlight-todo.djs-connection>.djs-visual>path {
    stroke: orange !important;
    stroke-dasharray: 4px !important;
    fill-opacity: 0.2 !important;
  }

  .highlight-todo.djs-shape .djs-visual> :nth-child(1) {
    fill: orange !important;
    stroke: orange !important;
    stroke-dasharray: 4px !important;
    fill-opacity: 0.2 !important;
  }

  .overlays-div {
    font-size: 10px;
    color: red;
    width: 100px;
    top: -20px !important;
  }
  
  .el-form-item {
      margin-bottom: 20px;
  }
  
  .el-dialog__body{//设置el-dialog高度信息
          height: auto;
          overflow: hidden;
          overflow-y: auto;
  }
  
  .el-loading-mask {//设置流程图上面的一层屏蔽层，否则影响其它窗口操作
    background-color: initial;
    z-index: 200;
    position:relative;  //支持相对
    overflow:auto;   //支持滚动
  }
  
  .bpmn-modeler {
      ::v-deep {
        .el-aside,.djs-palette{
          display: none;
        }
        .el-header{
          // border-bottom: none !important;
          padding: 0;
          &>div{
            justify-content: right !important;
            &>div:first-child{
              &>.el-button:nth-child(2),&>.el-button:nth-child(6),&>.el-button:nth-child(7){
                display: none;
              }
              &>div{
                display: none !important;
              }
            }
            &>div:last-child{
              display: none;
            }
          }
        }
        .djs-group * {
          pointer-events: none;
          user-select: none;
          -webkit-user-drag: none;
          -khtml-user-drag: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-drag: none;
        }
        .djs-group *:not(input[type="text"]) {
          pointer-events: none;
        }
        .highlight.djs-shape .djs-visual > :nth-child(1) {
          fill: green !important;
          stroke: green !important;
          fill-opacity: 0.2 !important;
        }
  
        .highlight.djs-shape .djs-visual > :nth-child(2) {
          fill: green !important;
        }
  
        .highlight.djs-shape .djs-visual > path {
          fill: green !important;
          fill-opacity: 0.2 !important;
          stroke: green !important;
        }
  
        .highlight.djs-connection > .djs-visual > path {
          stroke: green !important;
        }
  
        .highlight-todo.djs-connection > .djs-visual > path {
          stroke: orange !important;
          stroke-dasharray: 4px !important;
          fill-opacity: 0.2 !important;
        }
  
        .highlight-todo.djs-shape .djs-visual > :nth-child(1) {
          fill: orange !important;
          stroke: orange !important;
          stroke-dasharray: 4px !important;
          fill-opacity: 0.2 !important;
        }
  
        .overlays-div {
          font-size: 10px;
          color: red;
          width: 100px;
          top: -20px !important;
        }
      }
    }
</style>

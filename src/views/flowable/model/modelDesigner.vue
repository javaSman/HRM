<template>
  <div>
    <!--  ==================流程定义列表===============  -->
    <el-card v-if="!xmlFrame.open||xmlView">
      <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
        <el-form-item label="流程名称" prop="name">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入名称,可模糊查询"
            clearable
            size="small"
            @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="流程分类" prop="category">
          <el-select
            @change="handleQuery"
            v-model="queryParams.category"
            placeholder="请选择流程分类"
            clearable
            prop="category">
            <el-option label="请选择" value="" />
            <el-option v-for="category in categorys" :key="category.id" :label="category.name" :value="category.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="激活" prop="active">
          <el-switch v-model="queryParams.active" active-color="#13ce66" inactive-color="#ff4949" @change="handleQuery">
          </el-switch>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
        <el-form-item style="float:right">
          <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleLoadXml">新增流程定义</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="flowLoading" :data="definitionList" :empty-text="loadInfo" border>
        <el-table-column label="流程定义id" align="center" prop="id" />
        <el-table-column label="流程标识Key" align="center" prop="key" />
        <el-table-column label="流程分类" align="center">
          <template slot-scope="scope">
            <span>{{ getCategoryName(scope.row.category) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="流程名称" align="center" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <el-button type="text" @click="handleProcessView(scope.row.deploymentId)">
              <span>{{ scope.row.name }}</span>
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="表单名称" align="center" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <el-button v-if="(scope.row.formId) && (scope.row.category == 'zdyyw')" type="text" @click="handleCustomForm(scope.row.formId)">
              <span>{{ scope.row.formName }}</span>
            </el-button>
            <el-button v-else-if="(scope.row.formId) && (scope.row.category == 'online')" type="text" @click="handleOnlineForm(scope.row.formId,scope.row.formName)">
              <span>{{ scope.row.formName }}</span>
            </el-button>
            <el-button v-else-if="scope.row.formId" type="text" @click="handleForm(scope.row.formId)">
              <span>{{ scope.row.formName }}</span>
            </el-button>
            <label v-else>暂无表单</label>
          </template>
        </el-table-column>
        <el-table-column label="流程版本" align="center">
          <template slot-scope="scope">
            <el-tag size="medium">v{{ scope.row.version }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.suspensionState === 1">激活</el-tag>
            <el-tag type="warning" v-if="scope.row.suspensionState === 2">挂起</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="部署时间" sortable align="center" prop="deploymentTime" width="180" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-dropdown>
              <span class="el-dropdown-link">
                更多操作<i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item icon="el-icon-edit-outline" @click.native="handleLoadXml(scope.row)">
                  编辑
                </el-dropdown-item>
                <el-dropdown-item icon="el-icon-document-copy" @click.native="handleCopy(scope.row)">
                  复制
                </el-dropdown-item>
                <el-dropdown-item icon="el-icon-price-tag" @click.native="handlePublish(scope.row)">
                  版本管理
                </el-dropdown-item>
                <el-dropdown-item
                  icon="el-icon-connection"
                  @click.native="handleAddForm(scope.row)"
                  v-if="scope.row.formId == null && (scope.row.category == 'oa' || scope.row.category == 'cw')">
                  配置表单
                </el-dropdown-item>
                <!--<el-dropdown-item icon="el-icon-connection" @click.native="handleAddCustomForm(scope.row)"
                 v-if="scope.row.formId == null && (scope.row.category == 'zdyyw')">
                配置自定义业务表单
               </el-dropdown-item> -->
                <el-dropdown-item
                  icon="el-icon-connection"
                  @click.native="handleAddOnlineForm(scope.row)"
                  v-if="scope.row.formId == null && (scope.row.category == 'online')">
                  配置online表单
                </el-dropdown-item>
                <el-dropdown-item
                  icon="el-icon-connection"
                  @click.native="SubmitApplication(scope.row)"
                  v-if="(scope.row.formId != null && (scope.row.category == 'oa' || scope.row.category == 'cw' ))
                    || (scope.row.formId != null && (scope.row.category == 'online'))">
                  发起申请
                </el-dropdown-item>
                <el-dropdown-item
                  icon="el-icon-video-pause"
                  @click.native="handleUpdateSuspensionState(scope.row)"
                  v-if="scope.row.suspensionState === 1">
                  挂起
                </el-dropdown-item>
                <el-dropdown-item
                  icon="el-icon-video-play"
                  @click.native="handleUpdateSuspensionState(scope.row)"
                  v-if="scope.row.suspensionState === 2">
                  激活
                </el-dropdown-item>
                <el-dropdown-item icon="el-icon-delete" @click.native="handleDelete(scope.row)">
                  删除
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>
    <!--用workflow-bpmn-modeler 流程图 -->
    <!-- <a-card v-if="xmlFrame.open&&!xmlView" :title="xmlFrame.title">
      <a slot="extra" href="#" @click="()=>{xmlFrame.open=false}">返回</a>
      <bpmn-modeler v-if="xmlShow" ref="refNode" :xml="xmlData" :users="users" :groups="groups" :categorys="categorys"
        :is-view="xmlView" @save="save" />
    </a-card> -->
    <!--用bpmn-process-designer 流程图 -->
    <el-dialog :z-index="800" :title="designerData.title" :visible.sync="designerOpen" append-to-body fullscreen>
      <process-designer
        :key="designerOpen"
        style="border:1px solid rgba(0, 0, 0, 0.1);"
        ref="modelDesigner"
        v-loading="designerData.loading"
        :bpmnXml="designerData.bpmnXml"
        :designerForm="designerData.form"
        @save="save"
      />
    </el-dialog>
    <!-- bpmn-process-designer流程图 查看 -->
    <el-dialog :z-index="2000" :title="processView.title" :visible.sync="processView.open" width="80%" append-to-body>
      <process-viewer :key="`designer-${processView.index}`" :xml="processView.xmlData" :style="{height: '500px'}" />
    </el-dialog>
    <!--  弹窗预览  -->
    <a-modal
      :title="xmlFrame.title"
      :visible.sync="xmlView&&xmlFrame.open"
      :width="xmlFrame.width"
      :footer="null"
      closable
      @cancel="()=>{xmlView=false,xmlFrame.open=false}">
      <bpmn-modeler
        v-if="xmlShow"
        ref="refNode"
        :xml="xmlData"
        :users="users"
        :groups="groups"
        :categorys="categorys"
        :is-view="xmlView"
        @save="save" />
    </a-modal>
    <!--自定义表单弹窗预览-->
    <a-modal
      :title="customForm.title"
      :visible.sync="customForm.visible"
      :footer="null"
      :maskClosable="false"
      closable
      @cancel="()=>{customForm.visible=false}"
      width="80%">
      <component
        :disabled="customForm.disabled"
        :is="customForm.formComponent"
        :model="customForm.model"
        :customFormData="customForm.customFormData"></component>
    </a-modal>
    <!--online表单弹窗预览-->
    <a-modal
      :title="onlineForm.title"
      :visible.sync="onlineForm.visible"
      :footer="null"
      :maskClosable="false"
      closable
      @cancel="()=>{onlineForm.visible=false}"
      width="896px">
      <a-form ref="previewOnlForm">
        <!-- 主表单区域 -->
        <a-row v-for="(itemCommon, indexInner) in onlineForm.onlineFormData" v-if="indexInner==0" :key="indexInner" :label="itemCommon.onlTitleName" :model="itemCommon.cgformHeadId" >
          <a-col :span="parseInt(itemField.fieldDataTopInfo)" v-for="(itemField, index2) in itemCommon.fieldAll" :key="index2">
            <a-form-item :label="itemField.dbFieldTxt" :model="itemField" :key="index2">
              <component :is="itemField.tableTypeCode" :model="itemField" :key="index2" :fcz="itemField" @commonComponent="commonComponent" >
              </component>
            </a-form-item>
          </a-col>
        </a-row>
        <!-- 子表单区域 -->
        <a-tabs >
          <a-tab-pane
            v-for="(itemCommon, indexInner) in onlineForm.onlineFormData"
            :key="indexInner"
            v-if="indexInner>0 && itemCommon.tableName === onlineFormItem.tableForm.tableName[indexInner-1] && onlineFormItem.tableForm.columns[indexInner-1] != undefined"
            :tab="itemCommon.tableTxt"
            :forceRender="true" >
            <j-editable-table
              :model="itemCommon.cgformHeadId"
              :columns="onlineFormItem.tableForm.columns[indexInner-1]"
              :maxHeight="300"
              :rowNumber="true"
              :rowSelection="true"
              :actionButton="true"/>
          </a-tab-pane>
          <a-tab-pane
            v-else-if="indexInner>0 && itemCommon.tableName === onlineFormItem.tableForm.tableName[indexInner-1]"
            :tab="itemCommon.tableTxt"
            :model="itemCommon.cgformHeadId"
            :forceRender="true" >
            <a-row>
              <a-col :span="parseInt(itemField.fieldDataTopInfo)" v-for="(itemField, index2) in itemCommon.fieldAll" :key="index2">
                <a-form-item :label="itemField.dbFieldTxt" :model="itemField" :key="index2">
                  <component :is="itemField.tableTypeCode" :model="itemField" :key="index2" :fcz="itemField" @commonComponent="commonComponent" >
                  </component>
                </a-form-item>
              </a-col>
            </a-row>
          </a-tab-pane>
        </a-tabs>

        <a-form-item style="text-align: center;">
          <a-button type="primary" @click="submitOnlForm">提交</a-button>
          <a-button style="margin-left:30px;" @click="resetOnlForm">重置</a-button>
        </a-form-item>
      </a-form>

    </a-modal>
    <!--表单配置详情formgenerator-->
    <!--  <el-dialog :title="formTitle" :visible.sync="formConfOpen" width="60%" append-to-body>
          <div class="test-form">
            <parser :key="new Date().getTime()"  :form-conf="formConf" />
          </div>
        </el-dialog>-->
    <!--表单配置详情formdesigner-->
    <el-dialog :title="formTitle" :visible.sync="formConfOpen" width="60%" append-to-body>
      <div class="test-form">
        <preview :itemList="itemList" :formConf="formConf" v-if="formConfOpen"/>
      </div>
    </el-dialog>

    <!--挂载表单-->
    <a-modal :title="formDeployTitle" @cancel="formDeployOpen = false" :visible.sync="formDeployOpen" width="70%" append-to-body >
      <el-row :gutter="64">
        <el-form :model="formQueryParams" ref="queryDeployForm" :inline="true" label-width="100px">
          <el-form-item label="表单名称" prop="formName">
            <el-input
              v-model="formQueryParams.formName"
              placeholder="请输入*名称*,支持模糊查询"
              size="small"
              class="el-input-whole"
              @keyup.enter.native="handleFormQuery" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleFormQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetFormQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </el-row>
      <el-row :gutter="64">
        <el-col :span="20" :xs="64">
          <el-table
            ref="singleTable"
            :data="formList"
            border
            highlight-current-row
            @current-change="handleCurrentChange"
            style="width: 100%">
            <el-table-column label="表单编号" align="center" prop="id" />
            <el-table-column label="表单名称" align="center" prop="formName" />
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
              <template slot-scope="scope">
                <el-button size="mini" type="text" @click="submitFormDeploy(scope.row)">确定</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-show="formTotal>0"
            :total="formTotal"
            :current-page.sync="formQueryParams.pageNo"
            :page-size.sync="formQueryParams.pageSize"
            @size-change="ListFormDeploy"
            @current-change="ListFormDeploy" />
        </el-col>
        <el-col :span="14" :xs="24">
          <div v-if="currentRow">
            <parser :key="new Date().getTime()" :form-conf="currentRow" />
          </div>
        </el-col>
      </el-row>
    </a-modal>

    <!--挂载自定义表单-->
    <a-modal :title="formCustomTitle" @cancel="formCustomOpen = false" :visible.sync="formCustomOpen" width="60%" append-to-body>
      <el-row :gutter="64">
        <el-form :model="formQueryParams" ref="queryCustomForm" :inline="true" label-width="100px">
          <el-form-item label="表单名称" prop="businessName">
            <el-input
              v-model="formQueryParams.businessName"
              placeholder="请输入名称"
              clearable
              size="small"
              @keyup.enter.native="handleCustomFormQuery" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleCustomFormQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetCustomFormQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </el-row>
      <el-row :gutter="64">
        <el-col :span="20" :xs="64">
          <el-table
            ref="singleTable"
            :data="formList"
            border
            highlight-current-row
            @current-change="handleCurrentChange"
            style="width: 100%">
            <el-table-column label="自定义表单编号" align="center" prop="id" />
            <el-table-column label="自定义表单名称" align="center" prop="businessName" />
            <el-table-column label="自定义服务名" align="center" prop="businessService" />
            <el-table-column label="自定义表单路由地址" align="center" prop="routeName" />
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
              <template slot-scope="scope">
                <el-button size="mini" type="text" @click="submitCustomForm(scope.row)">确定</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            small
            layout="prev, pager, next"
            v-show="formTotal>0"
            :total="formTotal"
            :page.sync="formQueryParams.pageNo"
            :limit.sync="formQueryParams.pageSize"
            @pagination="ListCustomForm" />
        </el-col>
        <el-col :span="14" :xs="24">
          <div v-if="currentRow">
            <parser :key="new Date().getTime()" :form-conf="currentRow" />
          </div>
        </el-col>
      </el-row>
    </a-modal>

    <!-- 版本管理 -->
    <a-modal
      :zIndex="1000"
      @cancel="publishDialog.visible = false"
      :footer="null"
      :title="publishDialog.title"
      v-model:open="publishDialog.visible"
      width="70%"
      append-to-body>
      <el-row :gutter="64" style="margin-left: -24px;margin-right: -24px;">
        <el-col :span="20" :xs="64" style="width: 100%">
          <el-table
            ref="publishRef"
            :data="publishList"
            border
            highlight-current-row
            style="width: 100%">
            <el-table-column label="流程标识Key" align="center" prop="key" :show-overflow-tooltip="true" />
            <el-table-column label="流程名称" align="center" :show-overflow-tooltip="true">
              <template #default="scope">
                <el-button type="primary" @click="handleProcessView(scope.row.deploymentId)">
                  <span>{{ scope.row.name }}</span>
                </el-button>
              </template>
            </el-table-column>
            <el-table-column label="流程版本" align="center">
              <template #default="scope">
                <el-tag size="large" >v{{ scope.row.version }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" align="center">
              <template #default="scope">
                <el-tag type="success" v-if="scope.row.suspensionState === 1">激活</el-tag>
                <el-tag type="warning" v-if="scope.row.suspensionState === 2">挂起</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
              <template #default="scope">
                <el-button size="small" type="primary" v-if="scope.row.suspensionState === 1" @click="submitChangeState(scope.row)">挂起</el-button>
                <el-button size="small" type="primary" v-if="scope.row.suspensionState === 2" @click="submitChangeState(scope.row)">激活</el-button>
                <el-button size="small" type="primary" @click="submitDelete(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <pagination
            v-show="publishTotal>0"
            :total="publishTotal"
            :page.sync="queryPublishParams.pageNum"
            :limit.sync="queryPublishParams.pageSize"
            @pagination="getPublishList"
          />

        </el-col>
      </el-row>
    </a-modal>

    <!--  输入新建流程模型的输入对话框  -->
    <el-dialog :z-index="1000" :title="modelDialog.title" :visible.sync="modelDialog.visible" width="500px" append-to-body>
      <el-form ref="modelFormRef" :model="modelForm" :rules="modelRules" label-width="100">
        <el-form-item label="流程名称" prop="modelName">
          <el-input v-model="modelForm.modelName" type="primary" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="流程分类" prop="processCategory">
          <el-select v-model="modelForm.processCategory" placeholder="请选择" clearable style="width:100%">
            <el-option v-for="item in categorys" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitModelForm">确 定</el-button>
          <el-button @click="cancelModel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!--挂载online表单-->
    <div class="eldialog">
      <a-modal :z-index="1000" :title="formOnlineTitle" @cancel="formOnlineOpen = false" :visible.sync="formOnlineOpen" width="70%">
        <el-form :model="formQueryParams" ref="queryOnlineForm" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="表名称" prop="tableName">
            <el-input
              v-model="formQueryParams.tableName"
              placeholder="请输入*名称*,支持模糊查询"
              clearable
              class="el-input-whole"
              size="small"
              @keyup.enter.native="handleOnlineQuery"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleOnlineQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetOnlineQuery">重置</el-button>
          </el-form-item>
        </el-form>
        <el-row :gutter="64">
          <el-col :span="20" :xs="64">
            <el-table
              ref="singleTable"
              :data="formList"
              border
              highlight-current-row
              @current-change="handleCurrentChange"
              style="width: 100%">
              <el-table-column label="表编号" align="center" prop="id" />
              <el-table-column label="表名称" align="center" prop="tableName" />
              <el-table-column label="表说明" align="center" prop="tableTxt" />
              <el-table-column label="表类型" align="center" prop="tableType" />
              <el-table-column label="是否树" align="center" prop="isTree" />
              <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template slot-scope="scope">
                  <el-button size="mini" type="text" @click="submitOnlineForm(scope.row)">确定</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>

        </el-row>
        <el-pagination
          v-show="formTotal>0"
          :total="formTotal"
          :current-page.sync="formQueryParams.pageNo"
          :page-size.sync="formQueryParams.pageSize"
          @size-change="ListOnlineForm"
          @current-change="ListOnlineForm" />
      </a-modal>
    </div>
  </div>
</template>

<script>
  // import bpmnModeler from "workflow-bpmn-modeler-jeecgboot";
  import {
    categoryList,
    delDeployment,
    listDefinition,
    readXml,
    roleList,
    saveXml,
    updateState,
    userList,
    copyProcess,
    listPublish,
    changeState
  } from '@views/flowable/api/definition'
  import { getForm, addDeployForm, listForm, listOnlineForm, addOnlineForm,
           getOnlineForm, addDeployOnline, listCustomForm, addCustomForm,
           getCustomForm, addCustomDeployForm, saveOnlineFormData, getOnlineFormItem } from '@/api/form'
  import Parser from '@/components/parser/Parser'
  // import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import { flowableMixin } from '@/views/flowable/mixins/flowableMixin'
  import preview from '@/components/formdesigner/components/preview'
  import ProcessDesigner from '@/components/ProcessDesigner'
  import ProcessViewer from '@/components/ProcessViewer'

  // online表单显示组件
  import { handongRule } from '@comp/formdesigner/hanDongYuZhou/handongCommon'
  import hanDongInput from '@comp/formdesigner/hanDongYuZhou/hanDongInput'
  import hanDongPassword from '@comp/formdesigner/hanDongYuZhou/hanDongPassword'
  import hanDongSwitch from '@comp/formdesigner/hanDongYuZhou/hanDongSwitch'
  import hanDongList from '@comp/formdesigner/hanDongYuZhou/hanDongList'
  import hanDongRadio from '@comp/formdesigner/hanDongYuZhou/hanDongRadio'
  import hanDongCheckbox from '@comp/formdesigner/hanDongYuZhou/hanDongCheckbox'
  import hanDongListMulti from '@comp/formdesigner/hanDongYuZhou/hanDongListMulti'
  import hanDongSelSearch from '@comp/formdesigner/hanDongYuZhou/hanDongSelSearch'
  import hanDongTextArea from '@comp/formdesigner/hanDongYuZhou/hanDongTextArea'
  import hanDongDate from '@comp/formdesigner/hanDongYuZhou/hanDongDate'
  import hanDongDateTime from '@comp/formdesigner/hanDongYuZhou/hanDongDateTime'
  import hanDongTime from '@comp/formdesigner/hanDongYuZhou/hanDongTime'
  import hanDongImage from '@comp/formdesigner/hanDongYuZhou/hanDongImage'
  import hanDongFile from '@comp/formdesigner/hanDongYuZhou/hanDongFile'
  import hanDongUmeditor from '@comp/formdesigner/hanDongYuZhou/hanDongUmeditor'
  import hanDongSelUser from '@comp/formdesigner/hanDongYuZhou/hanDongSelUser'
  import hanDongSelDepart from '@comp/formdesigner/hanDongYuZhou/hanDongSelDepart'
  import hanDongMarkDown from '@comp/formdesigner/hanDongYuZhou/hanDongMarkDown'
  import hanDongPca from '@comp/formdesigner/hanDongYuZhou/hanDongPca'
  import hanDongPopup from '@comp/formdesigner/hanDongYuZhou/hanDongPopup'
  import hanDongSelTree from '@comp/formdesigner/hanDongYuZhou/hanDongSelTree'
  import hanDongCatTree from '@comp/formdesigner/hanDongYuZhou/hanDongCatTree'
  import hanDongLinkDown from '@comp/formdesigner/hanDongYuZhou/hanDongLinkDown'

  export default {
    // mixins: [flowableMixin, JeecgListMixin],
    mixins: [flowableMixin],
    handongRule: [handongRule],
    components: {
      ProcessDesigner,
      ProcessViewer,
     // bpmnModeler,
      Parser,
      preview,
      // online
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
      hanDongLinkDown
    },
    data() {
      return {
        /* ===================设计器属性====================== */
        users: [],
        groups: [],
        categorys: [],
        /* =================页面属性=================== */
        loading: true,
        // 总条数
        total: 0,
        flowLoading: false,
        loadInfo: '',
        // 流程定义表格数据
        definitionList: [],
        // 弹出层标题
        title: '',
        // 是否显示弹出层
        open: false,
        formConfOpen: false,
        itemList: [], // formdesigner预览显示数据
        formTitle: '',
        formDeployOpen: false,
        formCustomOpen: false,
        formDeployTitle: '',
        formCustomTitle: '',
        customForm: { // 自定义表单
           title: '',
           disabled: false,
           visible: false,
           formComponent: null,
           model: {},
           /* 流程数据 */
           customFormData: {},
           isNew: false
        },
        formOnlineOpen: false,
        formDeployTitle: '',
        formOnlineTitle: '',
        onlineForm: { // online表单
           title: '',
           disabled: false,
           visible: false,
           formComponent: null,
           /* online表单数据 */
           onlineFormData: [],
           isNew: false
        },
        onlineFormItem: {// online FormItem数据,作为主从表生成来源
          formData: [],
          subTable: [],
          tableForm: {
            tableName: [],
            columns: []
          }
        },
        saveOnlineFormData: { // 提交online表单数据
          dataList: {}
        },
        formList: [],
        formTotal: 0,
        formConf: {}, // 默认表单数据
        readImage: {
          open: false,
          src: ''
        },
        // 显示搜索条件
        showSearch: true,
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
          engineVersion: null
        },
        xmlFrame: {
          width: '70%',
          title: '流程图',
          open: false,
          src: ''
        },
        formQueryParams: {
          pageNo: 1,
          pageSize: 10,
          tableName: '',
          tableTxt: ''
        },
        // 挂载表单到流程实例
        formDeployParam: {
          formId: null,
          deployId: null
        },
        currentRow: null,
        // 表单参数
        form: {},
        // 表单校验
        rules: {},
        // xml
        xmlData: '',
        xmlShow: true,
        xmlView: false,
        designerOpen: false, // bpmn-process-designer使用
        designerData: {
          loading: false,
          bpmnXml: '',
          deploymentId: null,
          form: {
            users: [],
            groups: [],
            categorys: [],
            processName: null,
            processKey: null
          }
        },
        processView: {
          title: '',
          open: false,
          index: undefined,
          xmlData: ''
        }, // bpmn-process-designer使用
        // 版本相关
        // 流程定义表格数据
        publishList: [],
        publishTotal: 0,
        publishDialog: {
          visible: false,
          title: ''
        },
        // 查询参数
        queryPublishParams: {
          pageNum: 1,
          pageSize: 10,
          key: '',
          name: ''
        },
        // 新建流程模型的输入框
        modelDialog: {
          visible: false,
          title: ''
        },
        modelForm: {
          modelName: '',
          processCategory: ''
        },
        modelRules: {
          modelName: [{ required: true, message: '模型名称不能为空', trigger: 'blur' }],
          processCategory: [{ required: true, message: '模型类型不能为空', trigger: 'blur' }]
        }
      }
    },
    created() {
      this.initUserAndRole()
      this.getList()
    },
    methods: {
      /* ===============设计器=============== */
      initUserAndRole() {
        userList({}).then(res => {
          this.users = res.result || []
          this.users.map(o => {
            o.id = o.username
            o.name = o.realname
          })
        })
        roleList({}).then(res => {
          this.groups = res.result || []
          this.groups.map(o => {
            o.name = o.roleName
          })
        })
        categoryList({}).then(res => {
          this.categorys = res.result || []
        })
      },
      getModelDetail(deployId) {
        // 发送请求，获取xml
        readXml(deployId).then(res => {
          this.xmlData = res.result
        })
      },
      getCategoryName(category) {
        let find = this.categorys.find(o => o.id == category)
        if (find) {
          return find.name
        }
        return ''
      },
      /* 保存流程定义 */
      save(data) {
        console.log(data) // { process: {...}, xml: '...', svg: '...' }
        const params = {
          name: data.process.name,
          category: data.process.category,
          xml: data.xml
        }
        console.log(params)
        if (data.process.category == null) {
          this.$message.success('请选择流程分类')
          return ''
        }
        saveXml(params).then(res => {
          console.log(res)
          if (res.success) {
            this.$message.success(res.message)
            // 关闭当前标签页并返回上个页面
            this.getList()
            this.designerOpen = false
          } else {
            this.$message.error(res.message)
          }
        })
      },
      /* ================页面=============== */
      handleQuery() {
        this.queryParams.pageNum = 1
        this.queryParams.suspensionState = this.queryParams.active ? 1 : 0
        this.getList()
      },
      /** 查询流程定义列表 */
      getList() {
        this.flowLoading = true
        this.loadInfo = '数据加载中...'
        listDefinition(this.queryParams).then(response => {
          console.log('getList response=', response)
          if (response.code == 200) {
            this.loadInfo = ''
            this.definitionList = response.result.records
            this.total = response.result.total
          }
          this.flowLoading = false
        })
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.resetForm('queryForm')
        this.handleQuery()
      },
      resetForm(formName) {
        this.$refs[formName].resetFields()
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.resetForm('queryForm')
        this.handleQuery()
      },
      resetForm(formName) {
        this.$refs[formName].resetFields()
      },
      /** 表单查询里查询按钮操作 */
      handleFormQuery() {
        this.formQueryParams.pageNo = 1
        this.ListFormDeploy()
      },
      /** 表单查询里重置按钮操作 */
      resetFormQuery() {
        this.resetForm('queryDeployForm')
        this.handleFormQuery()
      },
      /** 自定义表单查询里查询按钮操作 */
      handleCustomFormQuery() {
        this.formQueryParams.pageNo = 1
        this.ListCustomForm()
      },
      /** 自定义表单查询里重置按钮操作 */
      resetCustomFormQuery() {
        this.resetForm('queryCustomForm')
        this.handleCustomFormQuery()
      },
      resetForm(formName) {
        this.$refs[formName].resetFields()
      },

      /** 打开流程设计弹窗页面 */
      handleLoadXml(row) {
        console.log('handleLoadXml row', row)
        this.designerData.title = '流程设计 - ' + row.name
        this.designerData.deploymentId = row.deploymentId
        this.designerData.form = {
          users: this.users,
          groups: this.groups,
          categorys: this.categorys,
          processName: row.name,
          processKey: row.key,
          processCategory: row.category
        }
        if (row && row.deploymentId) {
          this.designerData.loading = true
          this.handleReadImage(row.deploymentId)
          this.designerData.title = '编辑流程图'
        } else {
          // 新增
          /* this.designerData.bpmnXml = ''
          this.designerOpen = true;
          this.designerData.title = '新增流程图' */
          this.modelDialog.visible = true
          if (this.$refs.modelFormRef != undefined) {
            this.$refs.modelFormRef.resetFields()
          }
          this.modelDialog.title = '输入新建流程模型的名称与类型'
        }
        this.xmlFrame.width = '90%'
      },
      submitModelForm() {
        if (this.modelForm.modelName === '' || this.modelForm.processCategory === '') {
          return
        }
        // 新增
        this.modelDialog.visible = false
        this.designerData.bpmnXml = ''
        this.designerOpen = true
        this.designerData.title = this.modelForm.modelName
        this.designerData.form.processName = this.modelForm.modelName
        this.designerData.form.processCategory = this.modelForm.processCategory
      },
      cancelModel() {
        this.modelDialog.visible = false
        this.$refs.modelFormRef.resetFields()
      },
      handleCopy(row) {
        copyProcess(row).then(res => {
          this.$message.success(res.message)
          this.getList()
        })
      },
      /** 流程图查看 */
      handleReadImage(deploymentId) {
        // this.designerData.title = "流程图";
        this.designerData.open = true
        this.xmlFrame.width = '70%'
        // this.xmlFrame.src = process.env.VUE_APP_BASE_API + "/flowable/definition/xmlFrame/" + deploymentId;
        // 发送请求，获取xml
        // this.xmlView = true
        readXml(deploymentId).then(res => {
          if (res.success) {
            this.designerData.bpmnXml = res.result
            this.designerData.loading = false
            this.designerOpen = true
          } else {
            this.$message.error('获取流程图失败！')
          }
        })
      },
      /** 查看流程图 */
      handleProcessView(deploymentId) {
        this.processView.title = '流程图'
        this.processView.index = deploymentId
        // 发送请求，获取xml
        readXml(deploymentId).then(res => {
          if (res.success) {
            this.processView.xmlData = res.result
          } else {
            this.$message.error('获取流程图失败！')
          }
        })
        this.processView.open = true
      },
      // 打开业务表单
      handleForm(formId) {
        getForm(formId).then(res => {
          this.formTitle = '表单详情'
          this.formConfOpen = true
          this.formConf = JSON.parse(res.result.formContent)
          this.itemList = this.formConf.list
        })
      },
       // 打开自定义业务表单
      handleCustomForm(formId) {
        getCustomForm(formId).then(res => {
          console.log('res=', res)
          this.customForm.title = '自定义表单详情'
          this.customForm.visible = true
          this.customForm.formComponent = this.getFormComponent(res.result.routeName).component
           console.log('this.customForm.formComponent=', this.customForm.formComponent)
        })
      },
      // 打开Online表单
      handleOnlineForm(formId, formName) {
        getOnlineForm(formId).then(res => {
          console.log('res=', res)
          if (res.success) {
            this.onlineForm.title = 'online表单' + formName + '详情'
            this.onlineForm.onlineFormData = res.result.formData
            console.log('onlineForm.onlineFormData=', this.onlineForm.onlineFormData)
            if (this.onlineForm.onlineFormData.length > 1) {
              getOnlineFormItem(formId).then(itemres => { // 获取从表相关信息
                if (itemres.success) {
                  console.log('getOnlineFormItem itemres=', itemres)
                  this.onlineFormItem.formData = itemres.result
                  var subTable = itemres.result.head.subTableStr
                  this.onlineFormItem.subTable = subTable.split(',')
                  console.log('this.onlineFormItem.subTable=', this.onlineFormItem.subTable)
                  for (var i = 0; i < this.onlineFormItem.subTable.length; i++) {
                    var tablename = this.onlineFormItem.subTable[i]
                    if (this.onlineFormItem.formData.schema.properties.hasOwnProperty(tablename)) {
                      this.onlineFormItem.tableForm.tableName[i] = tablename
                      this.onlineFormItem.tableForm.columns[i] = this.onlineFormItem.formData.schema.properties[tablename].columns
                    }
                  }
                  console.log('this.onlineFormItem.tableForm=', this.onlineFormItem.tableForm)
                  this.onlineForm.visible = true
                } else {
                  this.$message.error(itemres.message)
                }
              })
            } else {
              this.onlineForm.visible = true
            }
          } else {
            this.$message.error(res.message)
          }
        })
      },
      /** 启动流程 */
      handleDefinitionStart(row) {
        definitionStart(row.id).then(res => {
          this.$message.success(res.message)
        })
      },
      /** 配置表单弹框 */
      handleAddForm(row) {
        this.formDeployParam.deployId = row.deploymentId
        this.ListFormDeploy()
      },
      /** 配置自定义表单弹框 */
      handleAddCustomForm(row) {
        this.formDeployParam.deployId = row.deploymentId
        this.ListCustomForm()
      },
      /** 配置online表单弹框 */
      handleAddOnlineForm(row) {
        this.formDeployParam.deployId = row.deploymentId
        this.ListOnlineForm()
      },
      /** 发起申请 */
      SubmitApplication(row) {
        if (row.category == 'oa') {
           /**  发起oa流程申请 */
           this.$router.push({ path: '/flowable/task/record/index',
             query: {
               deployId: row.deploymentId,
               procDefId: row.id,
               category: row.category,
               finished: true
               }
           })
        }
        if (row.category == 'cw') {
           /**  发起cw流程申请 */
           this.$router.push({ path: '/flowable/task/record/index',
             query: {
               deployId: row.deploymentId,
               procDefId: row.id,
               category: row.category,
               finished: true
               }
           })
        } else if (row.category == 'zdyyw') {
          /**  发起自定义业务流程申请 */

        } else if (row.category == 'online') {
          /**  online表单业务流程申请 */
         this.$router.push({ path: '/flowable/task/record/index',
           query: {
             deployId: row.deploymentId,
             procDefId: row.id,
             onlineId: row.formId,
             category: row.category,
             finished: true
             }
         })
         // 查询对于online表单数据进行选择流程提交申请
         /* this.$router.push({ path: '/flowable/model/onlinetablelist',
           query: {
             deployId: row.deploymentId,
             procDefId:row.id,
             onlineId: row.formId,
             category: row.category,
             finished: true
             }
         }) */
        } else {

        }
      },
      /** 挂载表单列表 */
      ListFormDeploy() {
        listForm(this.formQueryParams).then(res => {
          this.formList = res.result.records
          this.formTotal = res.result.total
          this.formDeployOpen = true
          this.formDeployTitle = '挂载表单'
        })
      },

      /** 挂载自定义业务表单列表 */
      ListCustomForm() {
        listCustomForm(this.formQueryParams).then(res => {
          this.formList = res.result.records
          this.formTotal = res.result.total
          this.formCustomOpen = true
          this.formCustomTitle = '挂载自定义表单'
        })
      },

      /** 挂载Online表单列表 */
      ListOnlineForm() {
        listOnlineForm(this.formQueryParams).then(res => {
          console.log('this.formQueryParams=', this.formQueryParams)
          console.log('listOnlineForm res=', res)
          this.formList = res.result.records
          this.formTotal = res.result.total
          this.formOnlineOpen = true
          this.formOnlineTitle = '挂载Online表单'
        })
      },

      /** 搜索按钮操作 */
      handleOnlineQuery() {
        this.formQueryParams.pageNo = 1
        this.ListOnlineForm()
      },
      /** 重置按钮操作 */
      resetOnlineQuery() {
        this.resetForm('queryOnlineForm')
        this.handleOnlineQuery()
      },

      // },
      /** 挂载表单 */
      submitFormDeploy(row) {
        this.formDeployParam.formId = row.id
        this.formDeployParam.formFlag = '1'// 人工设置表单都给予开始表单标志
        addDeployForm(this.formDeployParam).then(res => {
          this.$message.success(res.message)
          this.formDeployOpen = false
          this.getList()
        })
      },

      // },
      /** 挂载自定义表单 */
      submitCustomForm(row) {
        this.formDeployParam.formId = row.id
        addDeployForm(this.formDeployParam).then(res => {
          this.$message.success(res.message)
          this.formCustomOpen = false
          this.getList()
        })
      },
      /** 挂载配置Online表单 */
      submitOnlineForm(row) {
        // if(row.tableType == '1' ) {
          this.formDeployParam.onlineId = row.id
          this.formDeployParam.tableName = row.tableName
          this.formDeployParam.formFlag = '1'// 人工设置表单都给予开始表单标志
          addDeployOnline(this.formDeployParam).then(res => {
            this.$message.success(res.message)
            this.formOnlineOpen = false
            this.getList()
          })
        // }
        // else {
        //   this.$message.warn("目前仅支持单表!");
        // }
      },
      // online表单提交数据信息
      submitOnlForm() {
        console.log('submitOnlForm this.onlineForm.onlineFormData', this.onlineForm.onlineFormData)
        this.saveOnlineFormData.formId = this.onlineForm.onlineFormData[0].id
        this.saveOnlineFormData.fieldList = this.onlineForm.onlineFormData[0].fieldAll
        let code = this.saveOnlineFormData.formId + '?' + 'tabletype=1'
        console.log('submitOnlForm this.saveOnlineFormData', this.saveOnlineFormData)
        /* saveOnlineFormData(this.saveOnlineFormData.dataList,code).then(res => {
          console.log("saveOnlineFormData res=",res);
          if(res.sucess) {
            this.$message.success(res.message);
          }
        }) */
      },
      resetOnlForm() {
        this.resetForm('previewOnlForm')
      },
      submitTestForm() {
        console.log('submitTestForm testForm.testmodel=', this.testmodel)
      },
      resetTestForm() {
        this.resetForm('testForm')
      },
      commonComponent(zcf) {
       console.log('commonComponent zcf=', zcf)
       console.log('this.saveOnlineFormData.dataList1=', this.saveOnlineFormData.dataList)
        for (var i = 0; i < this.onlineForm.onlineFormData.length; i++) {
          if (this.onlineForm.onlineFormData[i].id == zcf.cgformHeadId) {
            var flagInfo = 0
            let fieldname = zcf.dbFieldName
            this.saveOnlineFormData.dataList[fieldname] = zcf.commonDataInfo
            console.log('this.saveOnlineFormData.dataList[fieldname]', this.saveOnlineFormData.dataList[fieldname])
            for (var k = 0; k < this.saveOnlineFormData.dataList[fieldname].length; k++) {
              if (this.saveOnlineFormData.dataList[fieldname][k].id == zcf.id) {
                this.saveOnlineFormData.dataList[fieldname][k] = zcf
                flagInfo = 1
              }
              if (this.saveOnlineFormData.dataList[fieldname][k].tableTypeCode == 'hanDongLinkDown' || this.saveOnlineFormData.dataList[fieldname][k].linkDowmIz == '1') {
                // 判断当前组件类型是否是linkDown相关组件
                nextLinkDown(this.saveOnlineFormData.dataList[fieldname][k].linkDowmFieldNext, this.saveOnlineFormData.dataList[fieldname][k].commonLinkDownCodeChild)
              }
            }
            if (flagInfo == 0) {
              // this.saveOnlineFormData.dataList[fieldname].push(zcf);
              this.saveOnlineFormData.dataList[fieldname] = zcf.commonDataInfo
            }
            console.log('this.saveOnlineFormData.dataList3=', this.saveOnlineFormData.dataList)
          }
        }
      },
      // 设置下一级的linkDown 下拉框的值
      nextLinkDown(fieldName, childrenLinkDown) {
        console.log('nextLinkDown fieldName=', fieldName)
        for (var i = 0; i < this.onlineForm.onlineFormData.length; i++) {
          console.log(this.onlineForm.onlineFormData[i])
          console.log(this.onlineForm.onlineFormData[i].id)
          console.log(zcf.cgformHeadId)
          if (this.onlineForm.onlineFormData[i].id == zcf.cgformHeadId) {
            var flagInfo = 0
            for (var k = 0; k < this.saveOnlineFormData.dataList[this.onlineForm.onlineFormData[i].id].length; k++) {
              if (this.saveOnlineFormData.dataList[this.onlineForm.onlineFormData[i].id][k].dbFieldName == fieldName) {
                this.saveOnlineFormData.dataList[this.onlineForm.onlineFormData[i].id][k].commonDictCode = childrenLinkDown
              }
            }
          }
        }
      },

      handleCurrentChange(data) {
        if (data) {
          this.currentRow = JSON.parse(data.formContent)
        }
      },
      /** 挂起/激活流程 */
      handleUpdateSuspensionState(row) {
        let state = 1
        if (row.suspensionState === 1) {
          state = 2
        }
        const params = {
          deployId: row.deploymentId,
          state: state
        }
        updateState(params).then(res => {
          this.$message.success(res.message)
          this.getList()
        })
      },
      /** 删除按钮操作 */
      handleDelete(row) {
        // const ids = row.deploymentId || this.ids;
        const params = {
          deployId: row.deploymentId
        }
        this.$confirm({
          title: '警告',
          content: '是否确认删除流程定义编号为"' + params.deployId + '"的数据项?',
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          onOk: () => {
            delDeployment(params).then(res => {
              this.getList()
              if (res.success) {
                this.$message.success('删除成功')
              } else {
                this.$message.success('删除失败')
              }
            })
          }
        })
      },
      /** 导出按钮操作 */
      handleExport() {
        const queryParams = this.queryParams
        this.$confirm('是否确认导出所有流程定义数据项?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(function() {
          return exportDeployment(queryParams)
        }).then(response => {
          this.download(response.message)
        })
      },
      /** 导入bpmn.xml文件 */
      handleImport() {
        this.upload.title = 'bpmn20.xml文件导入'
        this.upload.open = true
      },
      // 文件上传中处理
      handleFileUploadProgress(event, file, fileList) {
        this.upload.isUploading = true
      },
      // 文件上传成功处理
      handleFileSuccess(response, file, fileList) {
        this.upload.open = false
        this.upload.isUploading = false
        this.$refs.upload.clearFiles()
        this.$message(response.message)
        this.getList()
      },
      // 提交上传文件
      submitFileForm() {
        this.$refs.upload.submit()
      },
      /** 查询流程发布列表 */
      handlePublish(row) {
        console.log('handlePublish row', row)
        this.queryPublishParams.key = row.key
        this.publishDialog.visible = true
        this.publishDialog.title = '版本管理'
        this.getPublishList()
      },
      /** 查询流程发布列表 */
      getPublishList() {
        listPublish(this.queryPublishParams).then(res => {
          console.log('getPublishList res', res)
          this.publishList = res.result.records
          this.publishTotal = res.result.total
        })
      },
      // 版本管理里的激活或挂起
      submitChangeState(row) {
        let state = 1
        if (row.suspensionState === 1) {
          state = 2
        }
        const params = {
          definitionId: row.id,
          state: state
        }
        changeState(params).then(res => {
          this.getPublishList()
          this.getList()
        })
      },
      // 版本管理里的删除
      submitDelete(row) {
        const params = {
          deployId: row.deploymentId,
          flowKey: row.key,
          version: row.version
        }
        this.$confirm({
          title: '警告',
          content: '是否确认删除流程定义编号为"' + params.deployId + '"的数据项?',
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
            onOk: () => {
            delDeployment(params).then(res => {
              this.getPublishList()
              this.getList()
            })
          }
        })
      }
    },
    computed: {
      getContainer() {
        return document.querySelector('#app')
      }
    }
  }
</script>
<style lang="less" scope>
    .el-dialog__body{
            height: auto;
            overflow: hidden;
            overflow-y: auto;
    }
    .el-input-whole {
      width: 360px;
    }
</style>

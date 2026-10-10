<!--
  @description 临时工档案录入/编辑模态框组件
  @date 2026-08-19
  @functionality 提供临时工档案的录入和编辑功能，包含基本信息、入职信息、入住申请等表单，支持自动生成工号、部门岗位联动、入住申请集成
-->
<template>
  <!-- 录入/编辑模态框 -->
  <a-modal
    :title="modalTitle"
    :visible="visible"
    :width="1080"
    :confirmLoading="confirmLoading"
    :bodyStyle="{ padding: '16px 24px', height: '80vh', overflowY: 'auto' }"
    :dialogStyle="{ top: '5vh' }"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="confirmLoading">
      <a-form-model ref="archiveForm" :model="formData" :rules="rules" layout="vertical" class="compact-form">
        <!-- 基本信息区域：姓名、工号、性别、民族、身份证号等 -->
        <div class="section-title">基本信息</div>
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-model-item label="姓名" prop="name">
              <a-input v-model="formData.name" placeholder="请输入" @input="syncRoomAuto" />
            </a-form-model-item>
          </a-col>
          <a-col :span="6">
            <a-form-model-item label="工号">
              <a-input v-model="formData.workerCode" placeholder="自动生成" disabled />
            </a-form-model-item>
          </a-col>
          <a-col :span="6">
            <a-form-model-item label="性别" prop="gender">
              <a-select v-model="formData.gender" placeholder="请选择">
                <a-select-option value="男">男</a-select-option>
                <a-select-option value="女">女</a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="6">
            <a-form-model-item label="民族" prop="nation">
              <a-input v-model="formData.nation" placeholder="如：汉族" />
            </a-form-model-item>
          </a-col>
          <a-col :span="6">
            <a-form-model-item label="身份证号" prop="idCard">
              <a-input v-model="formData.idCard" placeholder="18位身份证号" :maxLength="18" @input="syncRoomAuto" />
            </a-form-model-item>
          </a-col>
          <a-col :span="6">
            <a-form-model-item label="是否内宿" prop="isInRoom">
              <a-select v-model="formData.isInRoom" placeholder="请选择" @change="handleInroomChange">
                <a-select-option value="是">是</a-select-option>
                <a-select-option value="否">否</a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="家庭住址" prop="address">
              <a-input v-model="formData.address" placeholder="请输入详细家庭住址" />
            </a-form-model-item>
          </a-col>
          <a-col :span="6">
            <a-form-model-item label="入职日期" prop="entryDate">
              <j-date v-model="formData.entryDate" placeholder="请选择日期" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="6">
            <a-form-model-item label="联系方式" prop="phone">
              <a-input v-model="formData.phone" placeholder="11位手机号" :maxLength="11" @input="syncRoomAuto" />
            </a-form-model-item>
          </a-col>
          <a-col :span="6">
            <a-form-model-item label="入职公司" prop="company">
              <a-select
                v-model="formData.company"
                showSearch
                optionFilterProp="children"
                placeholder="请选择"
                @change="handleCompanyChange"
              >
                <a-select-option v-for="item in companyList" :key="item.id" :value="item.name">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="6">
            <a-form-model-item label="入职部门" prop="deptId">
              <a-cascader
                v-model="deptPath"
                :options="deptOptions"
                :fieldNames="{ label: 'name', value: 'id', children: 'children' }"
                changeOnSelect
                :show-search="{ filter: filterDeptOption }"
                placeholder="请选择"
                @change="handleDeptChange"
              />
            </a-form-model-item>
          </a-col>
          <a-col :span="6">
            <a-form-model-item label="入职职位" prop="position">
              <a-select
                v-model="formData.position"
                showSearch
                optionFilterProp="children"
                :disabled="!formData.deptId"
                :loading="postLoading"
                placeholder="请选择"
                @change="handlePositionChange"
              >
                <a-select-option v-for="item in postOptions" :key="item.value" :value="item.label">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="6">
            <a-form-model-item label="派遣公司" prop="dispatchCompany">
              <j-dict-select-tag
                type="list"
                v-model="formData.dispatchCompany"
                dictCode="hrm_fkzx_sq_pqgs"
                placeholder="请选择派遣公司"
              />
            </a-form-model-item>
          </a-col>
          <a-col :span="6">
            <a-form-model-item label="薪资类型" prop="salaryType">
              <j-dict-select-tag
                type="list"
                v-model="formData.salaryType"
                dictCode="xzlx"
                placeholder="请选择薪资类型"
              />
            </a-form-model-item>
          </a-col>
          <a-col :span="6">
            <a-form-model-item label="工价" prop="price">
              <a-input-number
                v-model="formData.price"
                :min="0"
                :precision="2"
                :step="0.01"
                placeholder="请输入工价"
                style="width: 100%"
              />
            </a-form-model-item>
          </a-col>
          <a-col :span="6">
            <a-form-model-item label="银行卡号">
              <a-input v-model="formData.bankCard" placeholder="请输入" />
            </a-form-model-item>
          </a-col>
          <a-col :span="6">
            <a-form-model-item label="开户行">
              <a-input v-model="formData.bankName" placeholder="如：工商银行" />
            </a-form-model-item>
          </a-col>
          <a-col :span="6">
            <a-form-model-item label="卡号">
              <a-input v-model="formData.cardNo" placeholder="请输入" />
            </a-form-model-item>
          </a-col>
          <a-col :span="6">
            <a-form-model-item label="合同开始日期" prop="contractStartDate">
              <j-date v-model="formData.contractStartDate" placeholder="请选择日期" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="6">
            <a-form-model-item label="合同到期日期" prop="contractEndDate">
              <j-date v-model="formData.contractEndDate" placeholder="请选择日期" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="照片">
              <j-image-upload v-model="formData.photo" text="上传照片" accept="image/*" :isMultiple="false" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="备注">
              <a-textarea v-model="formData.remark" placeholder="请输入" :autoSize="{ minRows: 2 }" />
            </a-form-model-item>
          </a-col>
        </a-row>

        <!-- 入住申请区域（仅当是否内宿=是时显示） -->
        <div v-if="showRoomBox" class="room-apply-card">
          <div class="room-card-title">入住申请（是否内宿=是）</div>
          <a-row :gutter="16">
            <a-col :span="6">
              <a-form-model-item label="入住区域" prop="roomAreaId" :required="showRoomBox && !hasRoomApply">
                <a-input v-if="hasRoomApply" v-model="formData.roomArea" disabled />
                <a-select v-else v-model="formData.roomAreaId" placeholder="请选择宿舍区域" @change="handleAreaChange">
                  <a-select-option v-for="item in areaOptions" :key="item.id" :value="item.id">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :span="6">
              <a-form-model-item label="宿舍类型" prop="roomTypeId" :required="showRoomBox && !hasRoomApply">
                <a-input v-if="hasRoomApply" v-model="formData.roomType" disabled />
                <a-select v-else v-model="formData.roomTypeId" placeholder="请选择宿舍类型" @change="handleTypeChange">
                  <a-select-option v-for="item in typeOptions" :key="item.value" :value="item.value">
                    {{ item.text }}
                  </a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :span="6">
              <a-form-model-item label="入住日期" prop="roomDate" :required="showRoomBox && !hasRoomApply">
                <j-date
                  v-model="formData.roomDate"
                  placeholder="默认当前日期"
                  :disabled="hasRoomApply"
                  style="width: 100%"
                />
              </a-form-model-item>
            </a-col>
            <a-col :span="6">
              <a-form-model-item label="申请时间">
                <a-input v-model="formData.roomApplyTime" disabled />
              </a-form-model-item>
            </a-col>
            <a-col :span="6">
              <a-form-model-item label="申请人">
                <a-input v-model="formData.roomApplicant" disabled />
              </a-form-model-item>
            </a-col>
            <a-col :span="6">
              <a-form-model-item label="工号">
                <a-input v-model="formData.roomCode" disabled />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="所属部门">
                <a-input v-model="formData.roomDept" disabled />
              </a-form-model-item>
            </a-col>
            <a-col :span="6">
              <a-form-model-item label="身份证号">
                <a-input v-model="formData.roomIdcard" disabled />
              </a-form-model-item>
            </a-col>
            <a-col :span="6">
              <a-form-model-item label="手机号码">
                <a-input v-model="formData.roomPhone" disabled />
              </a-form-model-item>
            </a-col>
            <a-col :span="24">
              <a-form-model-item label="入住原因" prop="roomReason" :required="showRoomBox && !hasRoomApply">
                <a-textarea
                  v-model="formData.roomReason"
                  placeholder="请输入入住原因"
                  :disabled="hasRoomApply"
                  :autoSize="{ minRows: 2 }"
                />
              </a-form-model-item>
            </a-col>
            <a-col :span="24">
              <!-- 审批流程时间轴 - 动态节点 -->
              <div class="approval-timeline" v-if="showRoomBox && !hasRoomApply">
                <a-spin v-if="processNodesLoading" class="approval-spin" />
                <template v-else>
                  <div v-for="(node, nIndex) in processNodeList" :key="node.id || nIndex" class="timeline-node">
                    <div class="timeline-dot"></div>
                    <div class="timeline-card">
                      <div class="timeline-card-title">
                        {{ node.nodeName }}
                        <a-tag
                          v-if="node.approvalRule === '1' || node.approvalRule === 1"
                          color="orange"
                          class="node-rule-tag"
                          >会签</a-tag
                        >
                        <a-tag
                          v-if="node.approvalRule === '2' || node.approvalRule === 2"
                          color="red"
                          class="node-rule-tag"
                          >或签</a-tag
                        >
                      </div>
                      <div class="approver-line">
                        <!-- 已选人员 tag 列表 -->
                        <template v-if="nodeObjList[nIndex] && nodeObjList[nIndex].arr.length > 0">
                          <a-tag
                            v-for="item in nodeObjList[nIndex].arr"
                            :key="item.id"
                            class="approver-tag"
                            :closable="canEditApprovers(node)"
                            @close="handleEmployeeTagClose($event, nIndex, item.id)"
                          >
                            <span class="approver-avatar">{{ getAvatarText(item.name) }}</span>
                            <span class="approver-name">{{ item.name }}</span>
                          </a-tag>
                        </template>
                        <!-- 空级审批类型（如"直属经理"） -->
                        <span v-else-if="isKjSprTypeNode(node) && !canEditApprovers(node)" class="kj-spr-type-text">
                          {{ node.kjSprType_dictText }}
                        </span>
                        <!-- 空级审批节点（直属主管/经理/总监）：独立的自选审批人组件 -->
                        <j-select-approver
                          v-if="isLeaderNode(node)"
                          v-model="nodeObjList[nIndex].str"
                          :kj-spr-type="getNodeKjSprType(node)"
                          placeholder="请选择审批人"
                          value-field="name"
                          button-only
                          button-text="自选审批人"
                          :button-icon="''"
                          :button-type="'default'"
                          @change="(value, rows) => handleSelectValue(nIndex, value, rows)"
                        />
                        <!-- 添加审批人/抄送人按钮 -->
                        <j-select-employee
                          v-else-if="hasSprScope(node)"
                          v-model="nodeObjList[nIndex].str"
                          :placeholder="isCcNode(node) ? '请选择抄送人' : '请选择审批人'"
                          value-field="name"
                          button-only
                          :button-text="isCcNode(node) ? '添加抄送人' : '添加审批人'"
                          :button-icon="''"
                          :button-type="'default'"
                          @change="(value, rows) => handleSelectValue(nIndex, value, rows)"
                        />
                      </div>
                    </div>
                  </div>
                  <div v-if="!processNodeList.length" class="sqgl-empty-hint">暂无审批流程配置</div>
                </template>
              </div>
              <!-- 有入住申请记录时，展示原有的审批人/抄送人（只读） -->
              <div class="approval-timeline" v-else-if="showRoomBox && hasRoomApply">
                <div class="timeline-node">
                  <div class="timeline-dot"></div>
                  <div class="timeline-card">
                    <div class="timeline-card-title">审批人</div>
                    <div class="approver-line">
                      <a-tag v-for="item in approverTags" :key="item.value" class="approver-tag">
                        <span class="approver-avatar">{{ getAvatarText(item.name) }}</span>
                        <span class="approver-name">{{ item.name }}</span>
                      </a-tag>
                    </div>
                  </div>
                </div>
                <div class="timeline-node">
                  <div class="timeline-dot"></div>
                  <div class="timeline-card">
                    <div class="timeline-card-title">抄送人</div>
                    <div class="approver-line">
                      <a-tag v-for="item in ccTags" :key="item.value" class="approver-tag">
                        <span class="approver-avatar">{{ getAvatarText(item.name) }}</span>
                        <span class="approver-name">{{ item.name }}</span>
                      </a-tag>
                    </div>
                  </div>
                </div>
              </div>
            </a-col>
          </a-row>
        </div>
      </a-form-model>
    </a-spin>
  </a-modal>
</template>

<script>
import Vue from 'vue'
import JDate from '@/components/jeecg/JDate'
import JSelectEmployee from '@/components/jeecg/JSelectEmployee'
import JImageUpload from '@/components/jeecg/JImageUpload'
import { getAction, postAction } from '@/api/manage'
import { ajaxGetDictItems, getDictItemsFromCache } from '@/api/api'

/**
 * 递归清洗树形数据，确保每个节点的 children 都是数组
 * @param {Array} nodes - 节点数组
 * @returns {Array} 清洗后的节点数组
 */
function cleanTreeData(nodes) {
  if (!Array.isArray(nodes)) return []
  return nodes.map((node) => {
    const cleaned = { ...node }
    if (!Array.isArray(cleaned.children)) {
      cleaned.children = []
    } else {
      cleaned.children = cleanTreeData(cleaned.children)
    }
    return cleaned
  })
}

/**
 * 根据ID在树中查找路径
 * @param {Array} list - 树形列表
 * @param {string} id - 目标ID
 * @param {Array} parentPath - 父路径
 * @returns {Object|null} 查找结果，包含path和item
 */
function findPathById(list, id, parentPath) {
  const path = parentPath || []
  for (let i = 0; i < (list || []).length; i++) {
    const item = list[i]
    const nextPath = path.concat(String(item.id))
    if (String(item.id) === String(id)) return { path: nextPath, item }
    const child = findPathById(item.children || [], id, nextPath)
    if (child) return child
  }
  return null
}

/**
 * 临时工档案录入/编辑模态框组件
 * 提供临时工档案的录入和编辑功能
 * 包含基本信息、入职信息、入住申请等表单
 * 支持自动生成工号、部门岗位联动、入住申请集成
 */
export default {
  name: 'ArchiveModal',
  components: { JDate, JSelectEmployee, JImageUpload },
  props: {
    /** 模态框显示状态 */
    visible: {
      type: Boolean,
      default: false,
    },
    /** 模态框标题 */
    title: {
      type: String,
      default: '录入临时工',
    },
    /** 模式：add-新增，edit-编辑 */
    mode: {
      type: String,
      default: 'add',
    },
    /** 编辑记录 */
    record: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      /** 确认按钮加载状态 */
      confirmLoading: false,
      /** 是否显示入住申请区域 */
      showRoomBox: false,
      /** 是否有入住申请记录 */
      hasRoomApply: false,
      /** 表单数据 */
      formData: this.getEmptyFormData(),
      /** 组织架构加载状态 */
      orgLoading: false,
      /** 岗位加载状态 */
      postLoading: false,
      /** 公司列表 */
      companyList: [],
      /** 部门选项 */
      deptOptions: [],
      /** 部门路径 */
      deptPath: [],
      /** 岗位行数据 */
      postRows: [],
      /** 岗位选项 */
      postOptions: [],
      /** 宿舍区域选项 */
      areaOptions: [],
      /** 宿舍类型选项 */
      typeOptions: [],
      /** 流程节点列表（后端返回） */
      processNodeList: [],
      /** 每个节点对应的审批人/抄送人数据（索引与 processNodeList 对应） */
      nodeObjList: [],
      /** 流程节点加载状态 */
      processNodesLoading: false,
      /** 接口地址 */
      url: {
        getLcjdList: '/process/customProcessConfiguration/getLcjdList',
      },
      /** 申请模块编码（入住申请） */
      sqmkCode: '入住申请',
      /** 表单验证规则 */
      rules: {
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
        nation: [{ required: true, message: '请输入民族', trigger: 'blur' }],
        idCard: [
          { required: true, message: '请输入身份证号', trigger: 'blur' },
          {
            pattern: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/,
            message: '请输入正确的18位身份证号',
            trigger: 'blur',
          },
        ],
        address: [{ required: true, message: '请输入家庭住址', trigger: 'blur' }],
        isInRoom: [{ required: true, message: '请选择是否内宿', trigger: 'change' }],
        entryDate: [{ required: true, message: '请选择入职日期', trigger: 'change' }],
        phone: [
          { required: true, message: '请输入联系方式', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号', trigger: 'blur' },
        ],
        company: [{ required: true, message: '请选择入职公司', trigger: 'change' }],
        deptId: [{ required: true, message: '请选择入职部门', trigger: 'change' }],
        position: [{ required: true, message: '请选择入职职位', trigger: 'change' }],
        salaryType: [{ required: true, message: '请选择薪资类型', trigger: 'change' }],
        price: [{ required: true, message: '请输入工价', trigger: 'blur' }],
        contractStartDate: [{ required: true, message: '请选择合同开始日期', trigger: 'change' }],
        contractEndDate: [{ required: true, message: '请选择合同到期日期', trigger: 'change' }],
        // 入住申请必填项（仅在是否内宿=是 且 无申请记录时校验）
        roomAreaId: [
          {
            validator: (rule, value, callback) => {
              if (this.showRoomBox && !this.hasRoomApply && !value) {
                callback(new Error('请选择入住区域'))
              } else {
                callback()
              }
            },
            trigger: 'change',
          },
        ],
        roomTypeId: [
          {
            validator: (rule, value, callback) => {
              if (this.showRoomBox && !this.hasRoomApply && !value) {
                callback(new Error('请选择宿舍类型'))
              } else {
                callback()
              }
            },
            trigger: 'change',
          },
        ],
        roomDate: [
          {
            validator: (rule, value, callback) => {
              if (this.showRoomBox && !this.hasRoomApply && !value) {
                callback(new Error('请选择入住日期'))
              } else {
                callback()
              }
            },
            trigger: 'change',
          },
        ],
        roomReason: [
          {
            validator: (rule, value, callback) => {
              if (this.showRoomBox && !this.hasRoomApply && !value) {
                callback(new Error('请输入入住原因'))
              } else {
                callback()
              }
            },
            trigger: ['blur', 'change'],
          },
        ],
      },
    }
  },
  computed: {
    /**
     * 模态框标题
     * @returns {string} 标题文本
     */
    modalTitle() {
      return this.mode === 'edit' ? '编辑临时工' : '录入临时工'
    },
    /**
     * 审批人标签列表
     * @returns {Array} 标签数组
     */
    approverTags() {
      return this.buildTags(this.formData.roomApproveCode, this.formData.roomApproveName)
    },
    /**
     * 抄送人标签列表
     * @returns {Array} 标签数组
     */
    ccTags() {
      return this.buildTags(this.formData.roomCcCode, this.formData.roomCcName)
    },
  },
  watch: {
    visible(val) {
      if (val) {
        this.loadOrgTree().then(() => {
          this.initForm()
        })
      }
    },
  },
  methods: {
    /**
     * 加载组织架构树（公司与部门）
     * @returns {Promise} 加载Promise
     */
    loadOrgTree() {
      if (this.companyList.length) return Promise.resolve(this.companyList)
      this.orgLoading = true
      return getAction('/org/hrmOrg/loadTreeRoot', { pid: 0 })
        .then((res) => {
          const roots = res && res.success && Array.isArray(res.result) ? res.result : []
          this.companyList = roots.length && Array.isArray(roots[0].children) ? roots[0].children : []
          this.deptOptions = cleanTreeData(this.companyList)
          return this.companyList
        })
        .catch(() => {
          this.companyList = []
          this.deptOptions = []
          this.$message.error('组织架构加载失败，请稍后重试')
          return []
        })
        .finally(() => {
          this.orgLoading = false
        })
    },
    /**
     * 加载宿舍区域数据
     * @returns {Promise} 加载Promise
     */
    loadAreaData() {
      if (this.areaOptions.length) return Promise.resolve(this.areaOptions)
      return getAction('/sqgl/hrmSqglArea/listWithStats', null)
        .then((res) => {
          if (res.success) {
            this.areaOptions = res.result || []
          }
          return this.areaOptions
        })
        .catch(() => {
          this.areaOptions = []
          return []
        })
    },
    /**
     * 加载宿舍类型字典数据
     * @returns {Promise} 加载Promise
     */
    loadTypeData() {
      if (this.typeOptions.length) return Promise.resolve(this.typeOptions)
      const dictCode = 'hrm_sqgl_apply_dorm_type'
      // 优先从缓存中读取
      if (getDictItemsFromCache(dictCode)) {
        this.typeOptions = getDictItemsFromCache(dictCode)
        // 设置默认值：临时工宿舍
        this.setDefaultDormType()
        return Promise.resolve(this.typeOptions)
      }
      return ajaxGetDictItems(dictCode, null)
        .then((res) => {
          if (res.success) {
            this.typeOptions = res.result || []
            // 设置默认值：临时工宿舍
            this.setDefaultDormType()
          }
          return this.typeOptions
        })
        .catch(() => {
          this.typeOptions = []
          return []
        })
    },
    /**
     * 设置默认宿舍类型（临时工宿舍）
     * @returns {void}
     */
    setDefaultDormType() {
      if (this.typeOptions.length && !this.formData.roomTypeId) {
        const defaultType = this.typeOptions.find((item) => item.text === '临时工宿舍')
        if (defaultType) {
          this.formData.roomTypeId = defaultType.value
          this.formData.roomType = defaultType.text
        }
      }
    },
    /**
     * 宿舍区域选择变更处理
     * @param {string} value - 区域ID
     * @returns {void}
     */
    handleAreaChange(value) {
      const area = this.areaOptions.find((item) => item.id === value)
      this.formData.roomArea = area ? area.name : ''
    },
    /**
     * 宿舍类型选择变更处理
     * @param {string} value - 类型值
     * @returns {void}
     */
    handleTypeChange(value) {
      const type = this.typeOptions.find((item) => item.value === value)
      this.formData.roomType = type ? type.text : ''
    },
    /**
     * 加载岗位选项
     * @param {string} deptId - 部门ID
     * @returns {Promise} 加载Promise
     */
    loadPostOptions(deptId) {
      this.postRows = []
      this.postOptions = []
      if (!deptId) {
        this.formData.position = ''
        this.formData.postId = ''
        return Promise.resolve()
      }
      this.postLoading = true
      return getAction('/hrJobSequence/hrJobSequence/getSequencesByDept', {
        deptId,
        column: 'createTime',
        order: 'desc',
        pageNo: 1,
        pageSize: 99999,
      })
        .then((res) => {
          const rows = Array.isArray(res) ? res : (res && res.result) || []
          this.postRows = rows
          this.postOptions = rows.map((item) => ({ label: item.postName, value: item.id }))
        })
        .catch(() => {
          this.formData.position = ''
          this.$message.error('岗位加载失败，请稍后重试')
        })
        .finally(() => {
          this.postLoading = false
        })
    },
    /**
     * 职位选择变更处理
     * @param {string} postName - 职位名称
     * @returns {void}
     */
    handlePositionChange(postName) {
      const post = this.postOptions.find((item) => item.label === postName)
      // 记录职位ID
      this.formData.postId = post ? post.value : ''
      this.syncRoomAuto()
    },
    /**
     * 筛选部门选项
     * @param {string} inputValue - 输入值
     * @param {Array} path - 选项路径
     * @returns {boolean} 是否匹配
     */
    filterDeptOption(inputValue, path) {
      const keyword = String(inputValue || '').toLowerCase()
      return (path || []).some(
        (option) =>
          String(option.name || '')
            .toLowerCase()
            .indexOf(keyword) > -1
      )
    },
    /**
     * 公司选择变更处理
     * @param {string} companyName - 公司名称
     * @returns {void}
     */
    handleCompanyChange(companyName) {
      const company = this.companyList.find((item) => item.name === companyName)
      // 记录公司ID
      this.formData.companyId = company ? company.id : ''
      // 更新部门选项为该公司下的部门树
      this.deptOptions = company ? cleanTreeData([company]) : this.companyList
      // 清空已选择的部门、职位
      this.deptPath = []
      this.formData.deptId = ''
      this.formData.deptName = ''
      this.formData.position = ''
      this.formData.postId = ''
      this.postOptions = []
    },
    /**
     * 部门选择变更处理
     * @param {Array} value - 选择路径
     * @param {Array} selectedOptions - 选中的选项列表
     * @returns {void}
     */
    handleDeptChange(value, selectedOptions) {
      const path = Array.isArray(value) ? value.map((item) => String(item)) : []
      const options = Array.isArray(selectedOptions) ? selectedOptions : []
      const company = options[0]
      const hasSelectedDept = path.length && company
      this.deptPath = hasSelectedDept ? path : []
      this.formData.deptId = hasSelectedDept ? path[path.length - 1] : ''
      this.formData.deptName = hasSelectedDept ? (options[options.length - 1] || {}).name || '' : ''
      this.formData.position = ''
      this.formData.postId = ''
      if (hasSelectedDept) {
        this.loadPostOptions(this.formData.deptId)
        this.syncRoomAuto()
      }
    },
    /**
     * 获取空表单数据
     * @returns {Object} 空表单对象
     */
    getEmptyFormData() {
      return {
        // 基本信息
        workerCode: '',
        name: '',
        gender: '',
        nation: '',
        idCard: '',
        address: '',
        isInRoom: '否',
        entryDate: '',
        phone: '',
        // 公司/部门/岗位
        company: '',
        companyId: '',
        deptId: '',
        deptName: '',
        position: '',
        postId: '',
        dispatchCompany: '',
        salaryType: '时薪',
        price: null,
        bankCard: '',
        bankName: '',
        cardNo: '',
        photo: '',
        contractStartDate: '',
        contractEndDate: '',
        remark: '',
        // 入住申请
        roomAreaId: '',
        roomArea: '',
        roomTypeId: '',
        roomType: '',
        roomDate: '',
        roomApplyTime: '',
        roomApplicant: '',
        roomCode: '',
        roomDept: '',
        roomIdcard: '',
        roomPhone: '',
        roomReason: '',
        // 审批人/抄送人（逗号分隔的工号/姓名）
        roomApproveCode: '',
        roomApproveName: '',
        roomCcCode: '',
        roomCcName: '',
      }
    },
    /**
     * 初始化表单
     * @returns {void}
     */
    initForm() {
      if (this.mode === 'edit' && this.record) {
        this.formData = {
          ...this.getEmptyFormData(),
          ...this.record,
        }
        // 兼容后端字段：companyId_dictText/postId_dictText 转为表单内部字段
        if (!this.formData.company && this.formData.companyId_dictText) {
          this.formData.company = this.formData.companyId_dictText
        }
        if (!this.formData.position && this.formData.postId_dictText) {
          this.formData.position = this.formData.postId_dictText
        }
        // 编辑模式：如果是否内宿为空，默认为"否"
        if (!this.formData.isInRoom) {
          this.formData.isInRoom = '否'
        }
        // 编辑模式：如果薪资类型为空，默认为"时薪"
        if (!this.formData.salaryType) {
          this.formData.salaryType = '时薪'
        }
        this.showRoomBox = this.record.isInRoom === '是'
        // 恢复部门路径和岗位选项
        this.restoreLinkedOptions()
        // 公司为空时，默认选择"强瑞技术"
        this.applyDefaultCompany()
      } else {
        this.formData = this.getEmptyFormData()
        this.showRoomBox = false
        this.hasRoomApply = false
        this.resetLinkedOptions()
        // 默认选择"强瑞技术"公司
        this.applyDefaultCompany()
        // 新增模式：自动生成工号
        this.generateWorkerCode()
      }
    },
    /**
     * 公司为空时，默认选择"强瑞技术"
     * @returns {void}
     */
    applyDefaultCompany() {
      if (this.formData.company) {
        return
      }
      const defaultCompany = this.companyList.find((item) => item.name === '强瑞技术')
      if (defaultCompany) {
        this.formData.company = defaultCompany.name
        this.formData.companyId = defaultCompany.id
        this.deptOptions = cleanTreeData([defaultCompany])
      }
    },
    /**
     * 自动生成工号
     * @returns {void}
     */
    generateWorkerCode() {
      getAction('/lsggl/tempWorkerArchive/generateWorkerCode')
        .then((res) => {
          if (res.success && res.result) {
            this.formData.workerCode = res.result
          } else {
            this.$message.warning('工号生成失败，请稍后重试')
          }
        })
        .catch(() => {
          this.$message.error('工号生成失败，请稍后重试')
        })
    },
    /**
     * 重置关联选项
     * @returns {void}
     */
    resetLinkedOptions() {
      this.deptOptions = this.companyList
      this.deptPath = []
      this.postRows = []
      this.postOptions = []
    },
    /**
     * 恢复关联选项（编辑模式）
     * @returns {void}
     */
    restoreLinkedOptions() {
      this.resetLinkedOptions()
      // 恢复公司选择（优先根据 companyId 匹配，其次根据名称匹配）
      if (this.formData.company || this.formData.companyId) {
        const company = this.companyList.find(
          (item) =>
            (this.formData.companyId && String(item.id) === String(this.formData.companyId)) ||
            item.name === this.formData.company
        )
        // 记录公司ID
        this.formData.companyId = company ? company.id : this.formData.companyId || ''
        // 设置部门选项为该公司下的部门树
        this.deptOptions = company ? cleanTreeData([company]) : this.companyList
      }
      // 恢复部门选择
      if (this.formData.deptId) {
        const matchedDept = findPathById(this.deptOptions, this.formData.deptId)
        if (matchedDept) {
          this.deptPath = matchedDept.path
          this.formData.deptName = matchedDept.item ? matchedDept.item.name : ''
        }
        // 加载岗位选项，并恢复职位ID/名称
        this.loadPostOptions(this.formData.deptId).then(() => {
          if (this.formData.postId) {
            // 优先根据 postId 匹配，同步职位名称
            const post = this.postOptions.find((item) => String(item.value) === String(this.formData.postId))
            if (post && !this.formData.position) {
              this.formData.position = post.label
            }
          } else if (this.formData.position) {
            // 根据职位名称匹配岗位选项，恢复职位ID
            const post = this.postOptions.find((item) => item.label === this.formData.position)
            this.formData.postId = post ? post.value : ''
          }
        })
      }
      if (this.showRoomBox) {
        // 编辑模式下如果内宿，加载宿舍区域和类型数据
        Promise.all([this.loadAreaData(), this.loadTypeData()]).then(() => {
          this.syncRoomAuto()
          // 加载完数据后再查询入住申请数据
          if (this.mode === 'edit' && this.formData.workerCode) {
            this.loadRoomApplyData(this.formData.workerCode).then(() => {
              // 如果没有已有申请记录，加载动态流程节点
              if (!this.hasRoomApply) {
                this.loadProcessNodes()
              }
            })
          } else {
            // 没有工号时，直接加载动态流程节点
            this.loadProcessNodes()
          }
        })
      } else {
        this.hasRoomApply = false
      }
    },
    /**
     * 判断节点是否为抄送节点（nodeProperties: 1=审批, 2=抄送）
     * @param {Object} node - 节点对象
     * @returns {boolean}
     */
    isCcNode(node) {
      return node && Number(node.nodeProperties) === 2
    },
    /**
     * 判断节点是否为 kjSprType 类型节点（users 为 null 时展示 kjSprType_dictText）
     * @param {Object} node - 节点对象
     * @returns {boolean}
     */
    isKjSprTypeNode(node) {
      if (!node) return false
      return node.users === null && node.kjSprType_dictText
    },
    /**
     * 判断节点是否显示添加审批人按钮（isselfSelect===1 或 sprScope===4）
     * @param {Object} node - 节点对象
     * @returns {boolean}
     */
    hasSprScope(node) {
      if (!node) return false
      return Number(node.isselfSelect) === 1 || Number(node.sprScope) === 4
    },
    /**
     * 判断节点是否为空级审批节点（直属主管/直属经理/直属总监，依据 kjSprType 判断）
     */
    isLeaderNode(node) {
      if (!node) return false
      const kjSprType = this.getNodeKjSprType(node)
      return kjSprType !== null && kjSprType !== undefined && kjSprType !== ''
    },
    /**
     * 获取节点的空级审批类型 kjSprType（优先取外层，兼容内层 customProcessNodeConfiguration）
     */
    getNodeKjSprType(node) {
      if (!node) return ''
      if (node.kjSprType != null && node.kjSprType !== '') return node.kjSprType
      const inner = node.customProcessNodeConfiguration
      return inner && inner.kjSprType != null && inner.kjSprType !== '' ? inner.kjSprType : ''
    },
    /**
     * 判断节点的审批人是否可编辑（可删除接口返回人员、可自选添加）
     */
    canEditApprovers(node) {
      return this.hasSprScope(node) || this.isLeaderNode(node)
    },
    /**
     * 从节点配置中提取默认人员（users/roles/departments 合并去重）
     * @param {Object} node - 节点对象
     * @returns {Array} 默认人员列表
     */
    extractDefaultPersons(node) {
      const list = []
      const addItems = (arr, idKey, nameKey) => {
        if (!Array.isArray(arr)) return
        arr.forEach((item) => {
          const ids = (item[idKey] || '').toString().split(',').filter(Boolean)
          const names = (item[nameKey] || '').toString().split(',').filter(Boolean)
          ids.forEach((id, idx) => {
            list.push({ id: id.trim(), name: (names[idx] || id).trim() })
          })
        })
      }
      addItems(node.users, 'chooseObjects', 'chooseObjectsName')
      addItems(node.roles, 'chooseObjects', 'chooseObjectsName')
      addItems(node.departments, 'chooseObjects', 'chooseObjectsName')
      // 空级审批节点（直属主管/直属经理/直属总监）：后端解析出的人员在节点外层 chooseObjects/chooseObjectsName，可能多人逗号分隔
      if (list.length === 0 && this.isLeaderNode(node)) {
        const ids = (node.chooseObjects || '')
          .toString()
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
        const names = (node.chooseObjectsName || '')
          .toString()
          .split(',')
          .map((s) => s.trim())
        ids.forEach((id, idx) => {
          list.push({ id, name: names[idx] || id })
        })
      }
      // 去重
      const map = new Map()
      list.forEach((item) => {
        if (!map.has(item.id)) map.set(item.id, item)
      })
      return Array.from(map.values())
    },
    /**
     * 加载流程节点列表
     * @returns {void}
     */
    loadProcessNodes() {
      const perInfo = Vue.ls.get('perInfo') || {}
      const dept = this.formData.deptId || perInfo.dept || ''
      const no = perInfo.no || ''
      if (!dept) {
        this.processNodeList = []
        this.nodeObjList = []
        return
      }
      this.processNodesLoading = true
      getAction(this.url.getLcjdList, {
        sqmkCode: this.sqmkCode,
        dept: dept,
        no: no,
      })
        .then((res) => {
          if (res.success && Array.isArray(res.result)) {
            // 按 px 升序排列
            const list = res.result.slice().sort((a, b) => Number(a.px) - Number(b.px))
            this.processNodeList = list
            // 初始化每个节点的已选人员（提取默认人员）
            this.nodeObjList = list.map((node) => {
              const defaultPersons = this.extractDefaultPersons(node)
              return {
                arr: defaultPersons,
                str: defaultPersons.map((p) => p.name).join(','),
              }
            })
          } else {
            this.processNodeList = []
            this.nodeObjList = []
            this.$message.warning(res.message || '没有匹配到审批模板')
          }
        })
        .catch(() => {
          this.processNodeList = []
          this.nodeObjList = []
        })
        .finally(() => {
          this.processNodesLoading = false
        })
    },
    /**
     * 选择审批人/抄送人（追加合并，不覆盖默认人员）
     * @param {number} index - 节点索引
     * @param {string} value - 选择值
     * @param {Array} rows - 选择的人员列表
     * @returns {void}
     */
    handleSelectValue(index, value, rows) {
      if (this.nodeObjList[index]) {
        const existingArr = this.nodeObjList[index].arr || []
        const map = new Map()
        existingArr.forEach((item) => map.set(item.id, item))
        rows.forEach((item) => {
          if (!map.has(item.id)) {
            map.set(item.id, item)
          }
        })
        const mergedArr = Array.from(map.values())
        this.nodeObjList[index].arr = mergedArr
        this.nodeObjList[index].str = mergedArr.map((p) => p.name).join(',')
      }
    },
    /**
     * 移除审批人/抄送人 tag
     * @param {Event} event - 事件对象
     * @param {number} index - 节点索引
     * @param {string} id - 人员ID
     * @returns {void}
     */
    handleEmployeeTagClose(event, index, id) {
      if (event && event.preventDefault) {
        event.preventDefault()
      }
      if (this.nodeObjList[index]) {
        this.nodeObjList[index].arr = this.nodeObjList[index].arr.filter((item) => item.id != id)
        this.nodeObjList[index].str = this.nodeObjList[index].arr.map((item) => item.name).join(',')
      }
    },
    /**
     * 组装流程节点数据，用于提交
     * @returns {Array|null} 流程节点DTO列表
     */
    buildProcessDTOList() {
      if (!this.processNodeList || !this.processNodeList.length) return null
      return this.processNodeList.map((node, idx) => {
        const nodeCopy = JSON.parse(JSON.stringify(node))
        // 对于需要自选的节点，将选中的审批人写到节点外层
        if (this.canEditApprovers(node) && this.nodeObjList[idx]) {
          const selectedPersons = this.nodeObjList[idx].arr
          if (selectedPersons && selectedPersons.length > 0) {
            nodeCopy.chooseObjects = selectedPersons.map((p) => p.id).join(',')
            nodeCopy.chooseObjectsName = selectedPersons.map((p) => p.name).join(',')
            nodeCopy.sprScopeName = node.nodeName || ''
          }
        }
        return nodeCopy
      })
    },
    /**
     * 是否内宿选择变更处理
     * @param {string} value - 选择值
     * @returns {void}
     */
    handleInroomChange(value) {
      this.showRoomBox = value === '是'
      this.hasRoomApply = false // 用户修改时重置禁用状态
      if (this.showRoomBox) {
        // 选择内宿时才加载宿舍区域和类型数据
        Promise.all([this.loadAreaData(), this.loadTypeData()]).then(() => {
          this.syncRoomAuto()
          // 编辑模式下切换到内宿，查询是否有申请记录
          if (this.mode === 'edit' && this.formData.workerCode) {
            this.loadRoomApplyData(this.formData.workerCode).then(() => {
              // 加载完申请数据后，如果没有已有申请记录，加载动态流程节点
              if (!this.hasRoomApply) {
                this.loadProcessNodes()
              }
            })
          } else {
            // 新增模式，直接加载动态流程节点
            this.loadProcessNodes()
          }
        })
      } else {
        // 关闭内宿时清空流程节点
        this.processNodeList = []
        this.nodeObjList = []
      }
    },
    /**
     * 同步入住申请信息
     * @returns {void}
     */
    syncRoomAuto() {
      if (!this.showRoomBox) return
      const now = new Date()
      const pad = (n) => String(n).padStart(2, '0')
      const currentTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
        now.getHours()
      )}:${pad(now.getMinutes())}`
      this.formData.roomApplicant = this.formData.name || ''
      this.formData.roomCode = this.formData.workerCode || ''
      this.formData.roomDept = this.buildDeptPathString() // 部门路径：公司/部门1/部门2
      this.formData.roomIdcard = this.formData.idCard || ''
      this.formData.roomPhone = this.formData.phone || ''
      this.formData.roomApplyTime = currentTime
      if (!this.formData.roomDate) {
        this.formData.roomDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
      }
    },
    /**
     * 编辑模式下查询入住申请数据
     * @param {string} empNo - 员工工号
     * @returns {Promise} 加载Promise
     */
    async loadRoomApplyData(empNo) {
      try {
        const res = await getAction('/sqgl/hrmSqglApply/queryByEmpNo', { empNo })
        if (res.success && res.result) {
          // 有申请记录，设置禁用标记并填充数据
          this.hasRoomApply = true
          const data = res.result

          // 填充入住信息
          if (data.areaName) {
            this.formData.roomArea = data.areaName
          }

          if (data.dormType_dictText) {
            this.formData.roomType = data.dormType_dictText
          }

          if (data.reason) {
            this.formData.roomReason = data.reason
          }

          if (data.checkinDate) {
            this.formData.roomDate = data.checkinDate
          }

          // 填充审批人
          if (data.approveCode) {
            this.formData.roomApproveCode = data.approveCode
          }
          if (data.approveName) {
            this.formData.roomApproveName = data.approveName
          }

          // 填充抄送人
          if (data.ccCode) {
            this.formData.roomCcCode = data.ccCode
          }
          if (data.ccName) {
            this.formData.roomCcName = data.ccName
          }
        } else {
          // 无申请记录
          this.hasRoomApply = false
        }
      } catch (error) {
        console.error('查询入住申请数据失败:', error)
        this.hasRoomApply = false
      }
    },
    /**
     * 根据ID查找节点
     * @param {Array} nodes - 节点数组
     * @param {string} id - 节点ID
     * @returns {Object|null} 找到的节点
     */
    findNodeById(nodes, id) {
      for (const node of nodes || []) {
        if (String(node.id) === String(id)) return node
        const found = this.findNodeById(node.children || [], id)
        if (found) return found
      }
      return null
    },
    /**
     * 构建完整的部门路径字符串（公司/部门1/部门2...）
     * @returns {string} 部门路径
     */
    buildDeptPathString() {
      const parts = []
      if (this.formData.company) {
        parts.push(this.formData.company)
      }
      // deptPath 第一个是公司ID，后面是部门层级ID
      for (let i = 1; i < this.deptPath.length; i++) {
        const found = this.findNodeById(this.deptOptions, this.deptPath[i])
        if (found && found.name) {
          parts.push(found.name)
        }
      }
      return parts.join('/') || ''
    },
    /**
     * 构建标签数组
     * @param {string} codeStr - 工号字符串（逗号分隔）
     * @param {string} nameStr - 姓名字符串（逗号分隔）
     * @returns {Array} 标签数组
     */
    buildTags(codeStr, nameStr) {
      const codes = this.splitList(codeStr)
      const names = this.splitList(nameStr)
      return codes.map((code, i) => {
        const name = names[i] || ''
        const text = name ? `${name}（${code}）` : code
        return { value: code, text, name: name || code }
      })
    },
    /**
     * 获取头像文字（取最后一个汉字/字符）
     * @param {string} name - 姓名
     * @returns {string} 头像文字
     */
    getAvatarText(name) {
      if (!name) return '?'
      const trimmed = String(name).trim()
      return trimmed.charAt(trimmed.length - 1).toUpperCase()
    },
    /**
     * 分割逗号分隔的字符串
     * @param {string} val - 字符串值
     * @returns {Array} 分割后的数组
     */
    splitList(val) {
      if (val === undefined || val === null || val === '') return []
      return String(val)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    },
    /**
     * 提交表单
     * @returns {void}
     */
    handleSubmit() {
      this.$refs.archiveForm.validate(async (valid) => {
        if (valid) {
          // 内宿且无已有申请记录时，校验动态流程节点
          if (this.showRoomBox && !this.hasRoomApply) {
            let allValid = true
            this.processNodeList.forEach((node, idx) => {
              if (this.canEditApprovers(node) && this.nodeObjList[idx] && this.nodeObjList[idx].arr.length === 0) {
                this.$message.warning(`请选择「${node.nodeName}」的${this.isCcNode(node) ? '抄送' : '审批'}人`)
                allValid = false
              }
            })
            if (!allValid) return
          }

          this.confirmLoading = true
          try {
            // 新增模式下，提交前检查工号是否可用
            if (this.mode === 'add') {
              const checkedCode = await this.checkWorkerCodeAvailable(this.formData.workerCode)
              // 更新工号（可能是原工号或新的可用工号）
              this.formData.workerCode = checkedCode
            }

            // 组装提交数据
            const submitData = { ...this.formData, hasRoomApply: this.hasRoomApply }
            // 内宿且无已有申请记录时，加入动态流程节点数据
            if (this.showRoomBox && !this.hasRoomApply) {
              const processDTOList = this.buildProcessDTOList()
              if (processDTOList && processDTOList.length > 0) {
                submitData.customProcessConfigurationDTOList = processDTOList
              }
            }

            // 提交表单（父组件处理成功后会关闭弹窗）
            this.$emit(
              'ok',
              submitData,
              this.mode,
              () => {
                // 成功回调：关闭弹窗
                this.confirmLoading = false
                this.handleCancel()
              },
              () => {
                // 失败回调：停止加载状态
                this.confirmLoading = false
              }
            )
          } catch (error) {
            this.confirmLoading = false
            this.$message.error('提交失败，请稍后重试')
          }
        }
      })
    },
    /**
     * 检查工号是否可用
     * @param {string} workerCode - 工号
     * @returns {Promise<string>} 可用的工号
     */
    async checkWorkerCodeAvailable(workerCode) {
      try {
        const res = await getAction('/lsggl/tempWorkerArchive/checkWorkerCode', { workerCode })
        if (res.success && res.result) {
          return res.result // 返回可用的工号（原工号或新工号）
        }
        return workerCode // 接口异常时返回原工号
      } catch (error) {
        console.error('检查工号失败:', error)
        return workerCode // 异常时返回原工号
      }
    },
    /**
     * 取消操作
     * @returns {void}
     */
    handleCancel() {
      this.$refs.archiveForm && this.$refs.archiveForm.resetFields()
      this.$emit('update:visible', false)
      this.$emit('cancel')
    },
  },
}
</script>

<style lang="less" scoped>
/* 紧凑表单样式 - 匹配原型 */
.compact-form {
  /deep/ .ant-form-item {
    margin-bottom: 10px;
    position: relative;
  }
  /deep/ .ant-form-item-label {
    padding-bottom: 3px;
    line-height: 18px;
  }
  /deep/ .ant-form-item-label label {
    font-size: 12px;
    font-weight: 600;
    color: #1a2a3d;
  }
  /deep/ .ant-form-item-control {
    min-height: 36px;
  }
  /deep/ .ant-form-item-children {
    min-height: 36px;
  }
  /* 错误提示固定位置，不影响布局 */
  /deep/ .ant-form-explain {
    position: absolute;
    bottom: -18px;
    left: 0;
    font-size: 11px;
    line-height: 12px;
    margin-top: 0;
    white-space: nowrap;
  }
  /deep/ .ant-input,
  /deep/ .ant-select-selection,
  /deep/ .ant-cascader-picker {
    font-size: 13px;
    height: 36px;
    border-radius: 6px;
  }
  /deep/ .ant-select {
    width: 100%;
  }
  /deep/ .ant-input-affix-wrapper {
    height: 36px;
    border-radius: 6px;
  }
  /* 聚焦样式 */
  /deep/ .ant-input:focus,
  /deep/ .ant-select-focused .ant-select-selection,
  /deep/ .ant-cascader-focused .ant-cascader-picker {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
  }
}

/* 标题样式 - 匹配原型 section-title */
.section-title {
  font-size: 12px;
  font-weight: 600;
  color: rgba(37, 99, 235, 0.7);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  &::before {
    content: '';
    width: 3px;
    height: 12px;
    background: #2d78ff;
    border-radius: 2px;
  }
}

/* 行间距 */
/deep/ .ant-row {
  row-gap: 0;
}

/* 禁用输入框样式 */
/deep/ .ant-input-disabled,
/deep/ .ant-select-disabled .ant-select-selection {
  background: rgba(45, 120, 255, 0.04);
  color: #64748b;
  cursor: not-allowed;
}

/* 必填标记 */
/deep/ .ant-form-item-required::before {
  color: #ef4444;
  font-size: 12px;
}

/* 审批流程时间轴 - 参考 HrOvertimeApplyForm */
.approval-timeline {
  position: relative;
  padding-left: 0;
}

.timeline-node {
  position: relative;
  padding-left: 22px;
  padding-bottom: 16px;
}

.timeline-node:last-child {
  padding-bottom: 0;
}

.timeline-node:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 12px;
  bottom: -4px;
  width: 2px;
  background: #e6e8eb;
  border-radius: 1px;
}

.timeline-dot {
  position: absolute;
  left: 0;
  top: 12px;
  width: 12px;
  height: 12px;
  border: 2px solid #4a7bf7;
  background: #fff;
  border-radius: 50%;
  z-index: 1;
}

.timeline-card {
  background: #f0f4fb;
  border: 1px solid #e3e9f5;
  border-radius: 8px;
  padding: 12px 14px;
}

.timeline-card-title {
  margin-bottom: 10px;
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.timeline-card-title .node-rule-tag {
  margin: 0;
  font-size: 11px;
  line-height: 18px;
  height: 18px;
  padding: 0 6px;
  font-weight: 500;
}

.approver-line {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
}

/* 审批人/抄送人 tag 样式 */
.approver-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 0 8px 0 4px;
  height: 28px;
  border: 1px solid #d6e0f5;
  border-radius: 14px;
  background: #fff;
  color: #1f2937;
  font-size: 13px;
  line-height: 26px;
}

.approver-tag /deep/ .anticon-close {
  color: #b3b8c2;
  margin-left: 0;
}

.approver-tag /deep/ .anticon-close:hover {
  color: #ff4d4f;
}

/* 头像圆圈 */
.approver-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #4a7bf7;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
}

.approver-name {
  color: #1f2937;
  font-size: 13px;
}

.kj-spr-type-text {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 14px;
  border: 1px solid #d6e0f5;
  border-radius: 14px;
  background: #fff;
  color: #1f2937;
  font-size: 13px;
  line-height: 26px;
}

/* 添加按钮样式 */
.approver-line /deep/ .j-select-employee-button-only,
.approver-line /deep/ .j-select-approver-button-only {
  display: inline-flex;
  width: auto;
  flex: none;
}

.approver-line /deep/ .j-select-employee-button-only .ant-btn,
.approver-line /deep/ .j-select-approver-button-only .ant-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 28px;
  padding: 0 12px;
  border: 1px dashed #4a7bf7;
  border-radius: 14px;
  background: #fff;
  color: #4a7bf7;
  font-size: 13px;
  font-weight: 400;
  line-height: 1;
  box-shadow: none;
}

.approver-line /deep/ .j-select-employee-button-only .ant-btn::before,
.approver-line /deep/ .j-select-approver-button-only .ant-btn::before {
  content: '+';
  display: inline-block;
  font-size: 14px;
  font-weight: 600;
  margin-right: 2px;
  line-height: 1;
  position: relative;
}

.approver-line /deep/ .j-select-employee-button-only .ant-btn:hover,
.approver-line /deep/ .j-select-employee-button-only .ant-btn:focus,
.approver-line /deep/ .j-select-approver-button-only .ant-btn:hover,
.approver-line /deep/ .j-select-approver-button-only .ant-btn:focus {
  border-color: #2d5fe0;
  color: #2d5fe0;
  background: #f5f8ff;
}

.sqgl-empty-hint {
  text-align: center;
  color: #94a3b8;
  font-size: 12.5px;
  padding: 20px 0;
  background: #f8fafc;
  border: 1px dashed #e2e8f0;
  border-radius: 8px;
}

.approval-spin {
  display: block;
  text-align: center;
  padding: 20px 0;
}

/* 入住申请卡片 - 匹配原型 demand-card */
.room-apply-card {
  margin-top: 6px;
  padding: 14px 16px;
  border: 1px dashed rgba(45, 120, 255, 0.3);
  border-radius: 10px;
  background: rgba(37, 99, 235, 0.02);
  box-shadow: none;
}

.room-card-title {
  font-size: 13px;
  font-weight: 600;
  color: #1a2a3d;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 -16px 14px;
  padding: 0 16px 10px;
  border-bottom: 1px dashed rgba(45, 120, 255, 0.18);
  &::before {
    content: '';
    width: 3px;
    height: 14px;
    background: #2d78ff;
    border-radius: 2px;
  }
}
</style>

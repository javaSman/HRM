<template>
  <div class="org-structure-tree">
    <div class="org-tree-header">
      <h3>组织架构</h3>
    </div>

    <div class="org-search">
      <a-input
        v-model.trim="keyword"
        allowClear
        placeholder="搜索组织..."
        @change="handleSearchChange"
        @pressEnter="handleSearchChange"
      >
        <a-icon slot="prefix" type="search" />
      </a-input>
    </div>

    <div class="org-tree-body">
      <a-spin :spinning="loading">
        <a-empty v-if="!visibleTreeData.length && !loading" description="暂无组织数据" />
        <a-tree
          v-else
          class="org-tree-control"
          :show-line="false"
          :treeData="visibleTreeData"
          :selectedKeys="selectedKeys"
          :expandedKeys="expandedKeys"
          :autoExpandParent="false"
          @expand="handleExpand"
          @select="handleSelect"
        >
          <a-icon slot="switcherIcon" type="down" />
          <template slot="orgTitle" slot-scope="node">
            <a-dropdown v-if="enableOrgManage" :trigger="['contextmenu']">
              <span
                class="org-node-title"
                :class="{ 'org-node-title-selected': selectedKeys[0] === node.key }"
                :title="node.title"
                @contextmenu.prevent="handleNodeContext(node)"
              >
                <a-icon class="org-node-icon" :type="getNodeIcon(node)" />
                <span class="org-node-name">{{ node.title }}</span>
                <span v-if="node.children && node.children.length" class="org-node-type">
                  {{ node.children.length }}
                </span>
              </span>
              <a-menu slot="overlay" @click="({ key }) => handleContextMenuClick(key, node)">
                <a-menu-item key="add">
                  <a-icon type="plus" />
                  新增组织
                </a-menu-item>
                <a-menu-item key="edit">
                  <a-icon type="edit" />
                  编辑组织
                </a-menu-item>
                <a-menu-item v-if="!isRootGroupNode(node)" key="addRole" >
                  <a-icon type="menu-unfold" />
                  新增角色
                </a-menu-item>
                <a-menu-item key="setManager" v-if="!isRootGroupNode(node)">
                  <a-icon type="user" />
                  设置负责人
                </a-menu-item>
                <a-menu-item key="permission">
                  <a-icon type="safety-certificate" />
                  权限配置
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="delete">
                  <a-icon type="delete" />
                  删除
                </a-menu-item>
              </a-menu>
            </a-dropdown>
            <span
              v-else
              class="org-node-title"
              :class="{ 'org-node-title-selected': selectedKeys[0] === node.key }"
              :title="node.title"
            >
              <a-icon class="org-node-icon" :type="getNodeIcon(node)" />
              <span class="org-node-name">{{ node.title }}</span>
              <span v-if="node.children && node.children.length" class="org-node-type">
                {{ node.children.length }}
              </span>
            </span>
          </template>
        </a-tree>
      </a-spin>
    </div>

    <a-modal
      :title="formTitle"
      :visible="formVisible"
      :confirmLoading="saving"
      :width="1180"
      :bodyStyle="{ maxHeight: '76vh', overflowY: 'auto' }"
      okText="保存"
      cancelText="取消"
      wrapClassName="org-form-modal-wrap"
      @ok="handleFormOk"
      @cancel="closeForm"
    >
      <a-form-model
        ref="orgForm"
        :model="orgForm"
        :rules="orgRules"
        class="org-form-panel"
      >
        <section class="org-basic-section">
          <!-- <div class="org-basic-section-title">{{ formTitle }}</div> -->
          <a-row :gutter="16" class="org-basic-grid">
            <a-col :span="24" style="margin-bottom: 5px;">
              <div class="org-basic-field org-basic-field-full">
                <label class="org-basic-label">{{ formMode === 'add' ? '上级组织' : '当前组织' }}</label>
                <div class="org-basic-readonly">{{ contextNode ? contextNode.title : '根节点' }}</div>
              </div>
            </a-col>
            <a-col :xs="24" :md="8" >
              <a-form-model-item prop="type" class="org-basic-item">
                <label class="org-basic-label"><span class="org-required">*</span>类型</label>
                <j-dict-select-tag
                  type="list"
                  v-model="orgForm.type"
                  dictCode="hrm_org_code"
                  placeholder="请选择"
                />
              </a-form-model-item>
            </a-col>
            <a-col :xs="24" :md="8">
              <a-form-model-item prop="name" class="org-basic-item">
                <label class="org-basic-label"><span class="org-required">*</span>名称</label>
                <a-input v-model.trim="orgForm.name" placeholder="请输入名称" />
              </a-form-model-item>
            </a-col>
            <a-col :xs="24" :md="8">
              <a-form-model-item class="org-basic-item">
                <label class="org-basic-label">排序</label>
                <a-input v-model="orgForm.sort" />
              </a-form-model-item>
            </a-col>
          </a-row>
        </section>

        <section class="org-position-section">
          <div class="org-position-section-title flex items-center justify-center">
            <div>
              <span>岗位配置</span>
              <small>点击岗位卡片箭头展开/收起该岗位的任职要求和职级配置</small>
            </div>
            <a-button class="org-position-add" block @click="addPosition">
              <a-icon type="plus" />
              添加新岗位
            </a-button>
          </div>

          <a-spin :spinning="positionLoading">
            <div v-if="orgPositions.length" class="org-position-list">
              <article
                v-for="(position, positionIndex) in orgPositions"
                :key="position._rowKey"
                class="org-position-card"
                :class="{ active: isPositionExpanded(position) }"
              >
                <div class="org-position-card-header">
                  <button class="org-position-summary" type="button" @click="togglePosition(position)">
                    <span class="org-position-index">{{ positionIndex + 1 }}</span>
                    <span class="org-position-name">{{ position.postName || '岗位名称（点击右侧箭头展开详情）' }}</span>
                  </button>
                  <div class="org-position-card-actions">
                    <a-button
                      type="link"
                      :title="isPositionExpanded(position) ? '收起岗位' : '展开岗位'"
                      :icon="isPositionExpanded(position) ? 'up' : 'down'"
                      @click="togglePosition(position)"
                    />
                    <a-button
                      type="link"
                      icon="delete"
                      title="删除岗位"
                      class="org-position-delete"
                      @click="removePosition(positionIndex)"
                    />
                  </div>
                </div>

                <div v-show="isPositionExpanded(position)" class="org-position-card-body">
                  <section class="org-position-column">
                    <div class="org-position-column-title">岗位基本信息</div>
                    <a-row :gutter="14">
                      <a-col :xs="24" :sm="12">
                        <label class="org-position-field-label"><span class="org-required">*</span>岗位名称</label>
                        <a-input v-model.trim="position.postName" placeholder="请输入岗位名称" />
                      </a-col>
                      <a-col :xs="24" :sm="12">
                        <label class="org-position-field-label">所属部门</label>
                        <a-input :value="getPositionDeptText(position)" disabled placeholder="所属部门" />
                      </a-col>
                      <a-col :xs="24" :sm="12">
                        <label class="org-position-field-label"><span class="org-required" v-if="false">*</span>所属序列</label>
                        <a-select v-model="position.gwsl" allowClear placeholder="请选择">
                          <a-select-option v-for="item in sequenceOptions" :key="item" :value="item">
                            {{ item }}
                          </a-select-option>
                        </a-select>
                      </a-col>
                      <a-col :xs="24" :sm="12">
                        <label class="org-position-field-label"><span class="org-required" v-if="false">*</span>薪资类型</label>
                        <a-select v-model="position.salaryType" allowClear placeholder="请选择">
                          <a-select-option v-for="item in salaryTypeOptions" :key="item.value" :value="item.value">
                            {{ item.label }}
                          </a-select-option>
                        </a-select>
                      </a-col>
                      <a-col :span="24">
                        <label class="org-position-field-label"><span class="org-required" v-if="false">*</span>岗位参考薪资标准 (k)</label>
                        <div class="org-position-range">
                          <a-input-number
                            :value="getRangePart(position.postSalaryStandard, 0)"
                            :min="0"
                            :precision="0"
                            placeholder="最低"
                            @change="setRangePart(position, 'postSalaryStandard', 0, $event)"
                          />
                          <span>-</span>
                          <a-input-number
                            :value="getRangePart(position.postSalaryStandard, 1)"
                            :min="0"
                            :precision="0"
                            placeholder="最高"
                            @change="setRangePart(position, 'postSalaryStandard', 1, $event)"
                          />
                        </div>
                      </a-col>
                      <a-col :span="12">
                        <label class="org-position-field-label">岗位编制</label>
                        <a-input-number
                          v-model="position.staffingQuota"
                          :min="0"
                          :precision="0"
                          placeholder="请输入"
                          class="position-number"
                        />
                      </a-col>
                      <a-col :span="12">
                        <label class="org-position-field-label">是否重点职业健康监测对象</label>
                        <a-select v-model="position.isKeyOhMonitoring" placeholder="请选择">
                          <a-select-option value="0">否</a-select-option>
                          <a-select-option value="1">是</a-select-option>
                        </a-select>
                      </a-col>
                    </a-row>
                  </section>

                  <section class="org-position-column">
                    <div class="org-position-column-title">任职要求</div>
                    <a-row :gutter="14">
                      <a-col :xs="24" :sm="12">
                        <label class="org-position-field-label">起始年龄</label>
                        <a-input-number v-model="position.qsnl" :min="0" :precision="0" placeholder="请输入" />
                      </a-col>
                      <a-col :xs="24" :sm="12">
                        <label class="org-position-field-label">截止年龄</label>
                        <a-input-number v-model="position.jznl" :min="0" :precision="0" placeholder="请输入" />
                      </a-col>
                      <a-col :xs="24" :sm="12">
                        <label class="org-position-field-label">性别</label>
                        <a-select v-model="position.sex" allowClear placeholder="不限">
                          <a-select-option v-for="item in genderOptions" :key="item.value" :value="item.value">
                            {{ item.label }}
                          </a-select-option>
                        </a-select>
                      </a-col>
                      <a-col :xs="24" :sm="12">
                        <label class="org-position-field-label">学历要求</label>
                        <a-select v-model="position.educationRequirement" allowClear placeholder="请选择">
                          <a-select-option v-for="item in educationOptions" :key="item" :value="item">
                            {{ item }}
                          </a-select-option>
                        </a-select>
                      </a-col>
                      <a-col :xs="24" :sm="12">
                        <label class="org-position-field-label">专业</label>
                        <a-input v-model.trim="position.zy" placeholder="请输入专业" />
                      </a-col>
                      <a-col :xs="24" :sm="12">
                        <label class="org-position-field-label">工作经验</label>
                        <a-select v-model="position.gzjy" allowClear placeholder="经验不限">
                          <a-select-option v-for="item in experienceOptions" :key="item" :value="item">
                            {{ item }}
                          </a-select-option>
                        </a-select>
                      </a-col>
                      <a-col :span="24">
                        <label class="org-position-field-label">任职要求</label>
                        <textarea
                          v-model.trim="position.rzyq"
                          class="org-position-textarea"
                          rows="2"
                          placeholder="请输入任职要求"
                        ></textarea>
                      </a-col>
                      <a-col :span="24">
                        <label class="org-position-field-label">岗位职责</label>
                        <textarea
                          v-model.trim="position.fwzz"
                          class="org-position-textarea"
                          rows="2"
                          placeholder="请输入岗位职责"
                        ></textarea>
                      </a-col>
                    </a-row>
                  </section>

                  <section class="org-position-column">
                    <div class="org-position-column-title">职级基本信息</div>
                    <div v-if="position.hrJobLevels && position.hrJobLevels.length" class="org-level-list">
                      <div
                        v-for="(level, levelIndex) in position.hrJobLevels"
                        :key="level.id || level._rowKey || levelIndex"
                        class="org-level-item"
                      >
                        <div class="org-level-main" @click="openLevelEditor(positionIndex, level, levelIndex)">
                          <div class="org-level-name">{{ level.levelName || '未命名职级' }}</div>
                          <div class="org-level-meta">薪资：{{ level.levelSalaryRange || '-' }}</div>
                        </div>
                        <a class="org-level-delete" @click.stop="removeLevel(positionIndex, levelIndex)">删除</a>
                      </div>
                    </div>
                    <a-empty v-else description="暂无职级，点击下方新增" />
                    <a-button class="org-level-add" block @click="openLevelEditor(positionIndex)">
                      <a-icon type="plus" />
                      新增职级
                    </a-button>
                  </section>
                </div>
              </article>
            </div>
            <a-empty v-else description="暂无岗位，点击下方添加" />
          </a-spin>

        </section>
      </a-form-model>
    </a-modal>

    <a-modal
      :visible="levelEditorVisible"
      :title="levelEditorMode === 'edit' ? '编辑职级' : '新增职级'"
      :width="760"
      okText="确定"
      cancelText="取消"
      @ok="handleLevelEditorOk"
      @cancel="closeLevelEditor"
    >
      <a-row :gutter="16" class="org-level-editor">
        <a-col :xs="24" :md="12">
          <a-row :gutter="12">
            <a-col :span="24">
              <label class="org-position-field-label"><span class="org-required">*</span>职级名称</label>
              <a-input v-model.trim="levelForm.levelName" placeholder="请输入职级名称" />
            </a-col>
            <a-col :span="24">
              <label class="org-position-field-label"><span class="org-required">*</span>职级薪资范围 (k)</label>
              <div class="org-position-range">
                <a-input-number v-model="levelSalaryRangeMin" :min="0" :precision="0" placeholder="最低" />
                <span>-</span>
                <a-input-number v-model="levelSalaryRangeMax" :min="0" :precision="0" placeholder="最高" />
              </div>
            </a-col>
            <a-col :span="24">
              <label class="org-position-field-label">职级在职人数</label>
              <a-input-number v-model="levelForm.employeeCount" :min="0" :precision="0" placeholder="请输入" />
            </a-col>
          </a-row>
        </a-col>

        <a-col :xs="24" :md="12">
          <a-row :gutter="12">
            <a-col :xs="24" :sm="12">
              <label class="org-position-field-label">学历</label>
              <a-select v-model="levelForm.xl" allowClear placeholder="不限">
                <a-select-option v-for="item in educationOptions" :key="item" :value="item">
                  {{ item }}
                </a-select-option>
              </a-select>
            </a-col>
            <a-col :xs="24" :sm="12">
              <label class="org-position-field-label">工作经验</label>
              <a-select v-model="levelForm.gzjy" allowClear placeholder="经验不限">
                <a-select-option v-for="item in experienceOptions" :key="item" :value="item">
                  {{ item }}
                </a-select-option>
              </a-select>
            </a-col>
            <a-col :span="24">
              <label class="org-position-field-label">知识传递与积累</label>
              <textarea v-model.trim="levelForm.zscdyjl" class="org-position-textarea" rows="2"></textarea>
            </a-col>
            <a-col :span="24">
              <label class="org-position-field-label">任职要求（问题解决和工作成果）</label>
              <textarea v-model.trim="levelForm.rzyq" class="org-position-textarea" rows="2"></textarea>
            </a-col>
            <a-col :span="24">
              <label class="org-position-field-label">岗位职责</label>
              <textarea v-model.trim="levelForm.gwzz" class="org-position-textarea" rows="2"></textarea>
            </a-col>
          </a-row>
        </a-col>
      </a-row>
    </a-modal>
    <set-manager-modal ref="setManagerModal" @edit="handleManagerEdit" />
    <depart-auth-modal ref="departAuth" />
    <role-add-modal ref="roleAddModal" @ok="handleOk" :tree-data="treeData" />
  </div>
</template>

<script>
import { deleteAction, getAction, httpAction } from '@/api/manage'
import { initDictOptions } from '@/components/dict/JDictSelectUtil'
import { findTreePath } from '@/utils/util'
import DepartAuthModal from './DepartAuthModal.vue'
import RoleAddModal from './RoleAddModal.vue'
import SetManagerModal from './SetManagerModal.vue'

const TYPE_ORDER = ['集团', '公司', '部门', '组别']
const DEFAULT_SEQUENCE_OPTIONS = []
const DEFAULT_EDUCATION_OPTIONS = []
const DEFAULT_SALARY_TYPE_OPTIONS = []
const DEFAULT_EXPERIENCE_OPTIONS = []
const GENDER_OPTIONS = [
  { label: '不限', value: '' },
  { label: '男', value: '男' },
  { label: '女', value: '女' }
]

// 用 JSON 方式深拷贝表单数据，避免直接改到接口原对象。
function cloneDeep(value) {
  if (value === undefined || value === null) {
    return value
  }
  return JSON.parse(JSON.stringify(value))
}

// 组织下岗位表单的默认结构。
function createEmptyPositionForm() {
  return {
    id: null,
    companyId: '',
    dept: '',
    deptId: '',
    postName: '',
    gwsl: '',
    staffingQuota: null,
    employeeCount: 0,
    isKeyOhMonitoring: '0',
    salaryType: '',
    postSalaryStandard: '',
    educationRequirement: '',
    reqEdu: '',
    qsnl: null,
    jznl: null,
    sex: '',
    zy: '',
    gzjy: '',
    rzyq: '',
    fwzz: '',
    hrJobLevels: []
  }
}

// 岗位职级表单的默认结构。
function createEmptyLevelForm() {
  return {
    sysOrgCode: '',
    postId: '',
    levelName: '',
    levelSalaryRange: '',
    employeeCount: 0,
    xl: '',
    gzjy: '',
    zscdyjl: '',
    rzyq: '',
    gwzz: ''
  }
}

export default {
  name: 'OrgStructureTree',
  components: {
    DepartAuthModal,
    RoleAddModal,
    SetManagerModal
  },
  props: {
    value: {
      type: [String, Number],
      default: ''
    },
    enableOrgManage: {
      type: Boolean,
      default: true
    }
  },
  // 维护组织树、组织表单和岗位配置编辑态。
  data() {
    return {
      keyword: '',
      searchTimer: null,
      loading: false,
      saving: false,
      positionLoading: false,
      treeData: [],
      selectedKeys: [],
      expandedKeys: [],
      contextNode: null,
      formVisible: false,
      formMode: 'add',
      orgForm: {
        type: '部门',
        name: '',
        sort: 0
      },
      orgPositions: [],
      positionExpandedKeys: [],
      positionKeySeed: 0,
      levelEditorVisible: false,
      levelEditorMode: 'create',
      levelEditPositionIndex: -1,
      levelEditIndex: -1,
      levelForm: createEmptyLevelForm(),
      dictOptions: {
        gwxl: [],
        xlyq: [],
        xzlx: [],
        gzjy: []
      },
      orgRules: {
        type: [{ required: true, message: '请选择类型' }],
        name: [{ required: true, message: '请输入名称' }]
      },
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      url: {
        tree: '/org/hrmOrg/loadTreeRoot',
        add: '/org/hrmOrg/add',
        edit: '/org/hrmOrg/edit',
        delete: '/org/hrmOrg/delete'
      },
      positionUrl: {
        list: '/hrJobSequence/hrJobSequence/list',
        saveOrUpdateMain: '/hrJobSequence/hrJobSequence/saveOrUpdateMain',
        delete: '/hrJobSequence/hrJobSequence/delete'
      }
    }
  },
  computed: {
    // 组织弹窗标题随新增/编辑态切换。
    formTitle() {
      return this.formMode === 'edit' ? '编辑组织' : '新增组织'
    },
    // 搜索时返回过滤后的树，否则返回完整树。
    visibleTreeData() {
      if (!this.keyword) {
        return this.treeData
      }
      return this.filterTree(this.treeData, this.keyword)
    },
    // 岗位序列选项。
    sequenceOptions() {
      return this.getDictValueList(this.dictOptions.gwxl, DEFAULT_SEQUENCE_OPTIONS)
    },
    // 学历选项。
    educationOptions() {
      return this.getDictValueList(this.dictOptions.xlyq, DEFAULT_EDUCATION_OPTIONS)
    },
    // 薪资类型选项。
    salaryTypeOptions() {
      return this.getDictSelectList(this.dictOptions.xzlx, DEFAULT_SALARY_TYPE_OPTIONS)
    },
    // 工作经验选项。
    experienceOptions() {
      return this.getDictValueList(this.dictOptions.gzjy, DEFAULT_EXPERIENCE_OPTIONS)
    },
    // 性别选项。
    genderOptions() {
      return GENDER_OPTIONS
    },
    levelSalaryRangeMin: {
      // 读取职级薪资范围的最小值。
      get() {
        return this.getRangePart(this.levelForm.levelSalaryRange, 0)
      },
      // 回写职级薪资范围的最小值。
      set(value) {
        this.setRangePart(this.levelForm, 'levelSalaryRange', 0, value)
      }
    },
    levelSalaryRangeMax: {
      // 读取职级薪资范围的最大值。
      get() {
        return this.getRangePart(this.levelForm.levelSalaryRange, 1)
      },
      // 回写职级薪资范围的最大值。
      set(value) {
        this.setRangePart(this.levelForm, 'levelSalaryRange', 1, value)
      }
    }
  },
  watch: {
    // 外部选中值变化时，同步树上的选中节点。
    value(val) {
      this.syncSelectedByValue(val)
    }
  },
  // 进入页面后立即拉取组织树和岗位字典。
  created() {
    this.loadTree(true)
    this.initPositionDictConfig()
  },
  // 组件销毁前清理搜索防抖定时器。
  beforeDestroy() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer)
    }
  },
  methods: {
    handleOk() {
      this.$emit('ok')
    },
    isRootGroupNode(node) {
      const title = String((node && (node.title || node.name)) || '').trim()
      return title === '强瑞集团'
    },
    setEditFormFromNode(node) {
      const targetNode = node || {}
      const dataRef = targetNode.dataRef || {}
      this.formMode = 'edit'
      this.orgForm = {
        type: targetNode.type || '部门',
        name: targetNode.name || targetNode.title || '',
        code: dataRef.code || '',
        sort: targetNode.sort || 0
      }
    },
    openManagerModal(node) {
      const targetNode = node || this.contextNode
      if (!targetNode) {
        return
      }
      this.contextNode = targetNode
      this.selectNode(targetNode)
      this.setEditFormFromNode(targetNode)
      this.resetPositionConfig()
      this.$refs.setManagerModal.open(targetNode)
    },
    // 设置负责人复用组织编辑接口，但不带入岗位编辑缓存。
    handleManagerEdit(departPrincipal) {
      if (this.saving) {
        return
      }
      if (departPrincipal === undefined || departPrincipal === null || departPrincipal === '') {
        this.$message.warning('请选择负责人')
        return
      }
      this.setEditFormFromNode(this.contextNode)
      this.resetPositionConfig()
      this.submitEdit(departPrincipal)
    },
    // 初始化岗位相关字典。
    initPositionDictConfig() {
      this.loadDictOptions('gwxl', 'gwxl')
      this.loadDictOptions('xzlx', 'xzlx')
      this.loadDictOptions('xlyq', 'xlyq')
      this.loadDictOptions('gzjy', 'gzjy')
    },
    // 加载单个字典，失败时回退到默认选项。
    loadDictOptions(dictCode, optionKey, fallbackOptions) {
      initDictOptions(dictCode).then(res => {
        const options = res && res.success && Array.isArray(res.result) && res.result.length ? res.result : (fallbackOptions || [])
        this.$set(this.dictOptions, optionKey, options)
      }).catch(() => {
        this.$set(this.dictOptions, optionKey, fallbackOptions || [])
      })
    },
    // 抽取字典项里的文本值，给普通下拉框使用。
    getDictValueList(dictOptions, fallbackOptions) {
      const source = dictOptions && dictOptions.length ? dictOptions : fallbackOptions
      return (source || []).map(item => {
        if (typeof item === 'string') {
          return item
        }
        return item.value || item.text || item.label || item.title
      }).filter(item => item !== undefined && item !== null && item !== '')
    },
    // 转成 a-select 需要的 value/label 结构。
    getDictSelectList(dictOptions, fallbackOptions) {
      const source = dictOptions && dictOptions.length ? dictOptions : fallbackOptions
      return (source || []).map(item => {
        if (typeof item === 'string') {
          return { value: item, label: item }
        }
        return {
          value: item.value || item.text || item.label || item.title,
          label: item.text || item.label || item.title || item.value
        }
      }).filter(item => item.value !== undefined && item.value !== null && item.value !== '')
    },
    // 读取区间字符串里的指定端点。
    getRangePart(value, index) {
      const part = String(value || '').replace(/[kK]/g, '').split('-')[index]
      if (part === undefined || part === null || part.trim() === '') {
        return undefined
      }
      const numberValue = Number(part.trim())
      return Number.isNaN(numberValue) ? undefined : numberValue
    },
    // 回写区间字符串里的指定端点。
    setRangePart(target, field, index, value) {
      const parts = String(target[field] || '').replace(/[kK]/g, '').split('-')
      const nextValue = value === undefined || value === null || value === '' ? '' : String(value)
      const min = index === 0 ? nextValue : (parts[0] || '').trim()
      const max = index === 1 ? nextValue : (parts[1] || '').trim()
      target[field] = min || max ? min + '-' + max : ''
    },
    // 生成岗位或职级在前端渲染使用的临时 key。
    createRowKey(prefix) {
      this.positionKeySeed += 1
      return prefix + '-' + Date.now() + '-' + this.positionKeySeed
    },
    // 统一整理岗位数据，补齐默认字段和职级 key。
    createPositionItem(record) {
      const item = Object.assign(createEmptyPositionForm(), cloneDeep(record || {}))
      item._rowKey = item.id || item._rowKey || this.createRowKey('position')
      if (!Array.isArray(item.hrJobLevels)) {
        item.hrJobLevels = []
      }
      item.hrJobLevels = item.hrJobLevels.map(level => Object.assign(createEmptyLevelForm(), cloneDeep(level || {}), {
        _rowKey: (level && (level.id || level._rowKey)) || this.createRowKey('level')
      }))
      return item
    },
    // 清空当前组织下的岗位编辑态。
    resetPositionConfig() {
      this.orgPositions = []
      this.positionExpandedKeys = []
      this.positionLoading = false
      this.closeLevelEditor()
    },
    // 读取组织节点的部门 ID 或组织编码。
    getNodeDeptId(node) {
      const target = node || {}
      if (target.id ) {
        return String(target.id )
      }
      // if (target.sysOrgCode || target.orgCode || target.code) {
      //   return String(target.sysOrgCode || target.orgCode || target.code)
      // }
      // if (target.id || target.key || target.value) {
      //   return String(target.id || target.key || target.value)
      // }
      return ''
    },
    // 获取组织节点从根到当前的路径。
    getNodePath(node) {
      if (node && node.path && node.path.length) {
        return node.path.slice()
      }
      if (node && node.title) {
        return [node.title]
      }
      return []
    },
    // 参考岗位管理页的 findTreePath 逻辑，回填岗位所属公司 ID。
    getPositionCompanyId(node) {
      const target = node || this.contextNode || {}
      const targetId = target.id !== undefined && target.id !== null && target.id !== '' ? target.id : (target.key || target.value)
      if (targetId === undefined || targetId === null || targetId === '') {
        return ''
      }
      const path = findTreePath(this.treeData, targetId)
      if (!path.length) {
        return ''
      }
      return path.length > 1 ? path[1].id : path[0].id
    },
    // 计算岗位提交时使用的部门路径。
    getPositionDeptPath(node, name) {
      const path = this.getNodePath(node)
      if (name) {
        if (this.formMode === 'add') {
          return path.concat(name)
        }
        if (path.length) {
          return path.slice(0, path.length - 1).concat(name)
        }
      }
      return path
    },
    // 计算岗位表单里的所属部门展示文本。
    getPositionDeptText(position) {
      if (position && position.deptId_dictText) {
        return position.deptId_dictText
      }
      const deptPath = this.getPositionDeptPath(this.contextNode, this.orgForm.name)
      return deptPath.length ? deptPath[deptPath.length - 1] : ''
    },
    // 新增组织后，按名称回查当前层级里刚创建的节点。
    findCreatedNode(parent, name) {
      const targetName = String(name || '').trim()
      if (!targetName) {
        return null
      }
      const parentNode = parent ? this.findNodeByKey(this.treeData, parent.id || parent.key) : null
      const children = parentNode ? (parentNode.children || []) : this.treeData
      for (let i = 0; i < children.length; i++) {
        const item = children[i]
        const itemName = String(item.name || item.title || '').trim()
        if (itemName === targetName) {
          return item
        }
      }
      return null
    },
    // 编辑组织时，按组织 ID 拉取岗位配置做回显。
    loadOrgPositions(deptId) {
      this.positionLoading = true
      this.orgPositions = []
      this.positionExpandedKeys = []
      if (!deptId) {
        this.positionLoading = false
        return Promise.resolve()
      }
      return getAction(this.positionUrl.list, {
        deptId,
        pageNo: 1,
        column: 'createTime',
        order: 'desc',
        pageSize: 9999
      }).then(res => {
        if (res.success) {
          const result = res.result
          const records = Array.isArray(result) ? result : ((result && result.records) || [])
          // const companyId = this.getPositionCompanyId(this.contextNode)
          this.orgPositions = records.map(item => {
            const position = this.createPositionItem(item)
            // if (!position.companyId) {
            //   position.companyId = companyId
            // }
            return position
          })
          if (this.orgPositions.length) {
            this.positionExpandedKeys = [this.orgPositions[0]._rowKey]
          }
        } else {
          this.$message.warning(res.message || '岗位配置加载失败')
        }
      }).finally(() => {
        this.positionLoading = false
      })
    },
    // 判断岗位卡片是否处于展开态。
    isPositionExpanded(position) {
      return this.positionExpandedKeys.indexOf(position._rowKey) > -1
    },
    // 切换岗位卡片展开态。
    togglePosition(position) {
      const index = this.positionExpandedKeys.indexOf(position._rowKey)
      if (index > -1) {
        this.positionExpandedKeys.splice(index, 1)
      } else {
        this.positionExpandedKeys.push(position._rowKey)
      }
    },
    // 为当前组织追加一条新的岗位草稿。
    addPosition() {
      // 新增岗位时先放一条空白记录，真正保存时再统一补组织ID和组织路径。
      const position = this.createPositionItem()
      position.dept = this.getPositionDeptPath(this.contextNode, this.orgForm.name).join(' / ')
      position.deptId = this.formMode === 'edit' ? this.getNodeDeptId(this.contextNode) : ''
      position.companyId = this.getPositionCompanyId(this.contextNode)
      this.orgPositions.push(position)
      this.positionExpandedKeys = [position._rowKey]
    },
    // 仅在前端列表里移除岗位，并维护展开状态。
    removePositionLocal(index, position) {
      this.orgPositions.splice(index, 1)
      this.positionExpandedKeys = this.positionExpandedKeys.filter(key => key !== position._rowKey)
      if (this.orgPositions.length && !this.positionExpandedKeys.length) {
        const fallbackIndex = Math.max(0, index - 1)
        this.positionExpandedKeys = [this.orgPositions[fallbackIndex]._rowKey]
      }
    },
    // 删除岗位；未保存记录直接本地移除，已保存记录走接口。
    removePosition(index) {
      const position = this.orgPositions[index]
      this.$confirm({
        title: '确认删除',
        content: '确定删除当前岗位及其职级配置吗？',
        okType: 'danger',
        onOk: () => {
          if (!position.id) {
            this.removePositionLocal(index, position)
            return Promise.resolve()
          }
          this.positionLoading = true
          return deleteAction(this.positionUrl.delete, { id: position.id }).then(res => {
            if (res.success) {
              this.removePositionLocal(index, position)
              this.$message.success(res.message || '岗位删除成功')
            } else {
              this.$message.warning(res.message || '岗位删除失败')
            }
          }).finally(() => {
            this.positionLoading = false
          })
        }
      })
    },
    // 打开岗位下某个职级的编辑器。
    openLevelEditor(positionIndex, level, levelIndex) {
      const position = this.orgPositions[positionIndex]
      this.levelEditorMode = level ? 'edit' : 'create'
      this.levelEditPositionIndex = positionIndex
      this.levelEditIndex = typeof levelIndex === 'number' ? levelIndex : -1
      this.levelForm = Object.assign(createEmptyLevelForm(), cloneDeep(level || {}), {
        postId: position.id || (level && level.postId) || '',
        _rowKey: (level && (level.id || level._rowKey)) || this.createRowKey('level')
      })
      this.levelEditorVisible = true
    },
    // 关闭职级编辑器并恢复默认表单。
    closeLevelEditor() {
      this.levelEditorVisible = false
      this.levelEditorMode = 'create'
      this.levelEditPositionIndex = -1
      this.levelEditIndex = -1
      this.levelForm = createEmptyLevelForm()
    },
    // 把当前职级编辑结果写回岗位列表。
    handleLevelEditorOk() {
      if (!this.levelForm.levelName) {
        this.$message.warning('请输入职级名称')
        return
      }
      // if (this.getRangePart(this.levelForm.levelSalaryRange, 0) === undefined || this.getRangePart(this.levelForm.levelSalaryRange, 1) === undefined) {
      //   this.$message.warning('请输入完整职级薪资范围')
      //   return
      // }
      const position = this.orgPositions[this.levelEditPositionIndex]
      if (!position) {
        this.closeLevelEditor()
        return
      }
      const levels = cloneDeep(position.hrJobLevels)
      const nextLevel = Object.assign(createEmptyLevelForm(), cloneDeep(this.levelForm))
      if (position.id) {
        nextLevel.postId = position.id
      }
      if (this.levelEditorMode === 'edit' && this.levelEditIndex > -1) {
        levels.splice(this.levelEditIndex, 1, nextLevel)
      } else {
        levels.push(nextLevel)
      }
      this.$set(position, 'hrJobLevels', levels)
      this.closeLevelEditor()
    },
    // 删除岗位下的职级配置。
    removeLevel(positionIndex, levelIndex) {
      const position = this.orgPositions[positionIndex]
      this.$confirm({
        title: '确认删除',
        content: '确定删除当前职级吗？',
        okType: 'danger',
        onOk: () => {
          const levels = cloneDeep(position.hrJobLevels)
          levels.splice(levelIndex, 1)
          this.$set(position, 'hrJobLevels', levels)
        }
      })
    },
    // 校验岗位和职级必填项，返回首个错误提示。
    validatePositionConfig() {
      for (let i = 0; i < this.orgPositions.length; i++) {
        const position = this.orgPositions[i]
        const prefix = '第' + (i + 1) + '个岗位：'
        if (!position.postName) {
          return prefix + '请输入岗位名称'
        }
        // if (!position.gwsl) {
        //   return prefix + '请选择岗位序列'
        // }
        // if (!position.salaryType) {
        //   return prefix + '请选择薪资类型'
        // }
        // if (!position.educationRequirement) {
        //   return prefix + '请选择学历要求'
        // }
        // if (this.getRangePart(position.postSalaryStandard, 0) === undefined || this.getRangePart(position.postSalaryStandard, 1) === undefined) {
        //   return prefix + '请输入完整岗位参考薪资标准'
        // }
        // const levels = position.hrJobLevels
        // for (let j = 0; j < levels.length; j++) {
        //   const level = levels[j]
        //   const levelPrefix = prefix + '第' + (j + 1) + '个职级：'
        //   if (!level.levelName) {
        //     return levelPrefix + '请输入职级名称'
        //   }
        //   if (this.getRangePart(level.levelSalaryRange, 0) === undefined || this.getRangePart(level.levelSalaryRange, 1) === undefined) {
        //     return levelPrefix + '请输入完整职级薪资范围'
        //   }
        // }
      }
      return ''
    },
    // 组装岗位提交 payload，并剔除前端临时字段。
    preparePositionPayload(position, deptId, deptPath) {
      const payload = cloneDeep(position)
      delete payload._rowKey
      payload.deptId = deptId || payload.deptId || ''
      payload.companyId = payload.companyId || this.getPositionCompanyId(this.contextNode)
      payload.dept = deptPath && deptPath.length ? deptPath.join(' / ') : payload.dept
      payload.employeeCount = payload.employeeCount || payload.headcount || 0
      payload.headcount = payload.employeeCount
      if (!Array.isArray(payload.hrJobLevels)) {
        payload.hrJobLevels = []
      }
      payload.hrJobLevels = payload.hrJobLevels.map(level => {
        const item = cloneDeep(level)
        delete item._rowKey
        if (payload.id) {
          item.postId = payload.id
        }
        return item
      })
      return payload
    },
    // 岗位依赖组织ID，所以组织保存成功后，再统一把岗位数组提交给岗位接口。
    syncOrgPositions(deptId, deptPath) {
      if (!this.orgPositions.length) {
        return Promise.resolve()
      }
      if (!deptId) {
        return Promise.reject(new Error('未获取到组织ID，请先保存组织后再配置岗位'))
      }
      const payloadList = this.orgPositions.map(position => this.preparePositionPayload(position, deptId, deptPath))
      return httpAction(this.positionUrl.saveOrUpdateMain, payloadList, 'post').then(res => {
        if (!res.success) {
          throw new Error(res.message || '岗位配置保存失败')
        }
        return res
      })
    },
    // 拉取组织树，并在首次进入时补齐默认展开和选中态。
    loadTree(defaultExpand) {
      this.loading = true
      return getAction(this.url.tree, { pid: 0 }).then(res => {
        if (res.success) {
          this.treeData = this.normalizeTreeData(res.result || [])
          this.$emit('treeData', this.treeData)
          if (defaultExpand) {
            this.expandedKeys = this.collectInitialExpandedKeys(this.treeData)
          }
          this.ensureSelection()
        } else {
          this.treeData = []
          this.$message.warning(res.message || '组织架构加载失败')
        }
        return res
      }).finally(() => {
        this.loading = false
      })
    },
    // 规范化接口树节点，补齐 ant tree 所需字段。
    normalizeTreeData(list, parentPath) {
      const path = parentPath || []
      return (list || [])
        .filter(item => item && (item.id || item.name))
        .map(item => {
          const title = item.name || item.title || ''
          const key = String(item.id)
          const children = this.normalizeTreeData(item.children || [], path.concat(title))
          return Object.assign({}, item, {
            title,
            key,
            value: key,
            path: path.concat(title),
            children,
            scopedSlots: { title: 'orgTitle' }
          })
        })
    },
    // 按关键字过滤树节点，同时保留命中节点的父链。
    filterTree(list, keyword) {
      const lowerKeyword = String(keyword).toLowerCase()
      return (list || []).reduce((result, item) => {
        const children = this.filterTree(item.children || [], keyword)
        const matched = String(item.name || item.title || '').toLowerCase().indexOf(lowerKeyword) > -1
        if (matched || children.length) {
          result.push(Object.assign({}, item, { children }))
        }
        return result
      }, [])
    },
    // 处理搜索输入，并在短暂防抖后展开命中的节点。
    handleSearchChange() {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }
      this.searchTimer = setTimeout(() => {
        if (this.keyword) {
          this.expandedKeys = this.collectAllKeys(this.visibleTreeData)
        }
      }, 180)
    },
    // 同步树组件的展开态。
    handleExpand(expandedKeys) {
      this.expandedKeys = expandedKeys
    },
    // 处理树节点选中，并向外同步当前节点。
    handleSelect(selectedKeys, event) {
      const node = selectedKeys.length && event.node ? event.node.dataRef : null
      if (node) {
        this.selectNode(node)
      }
    },
    // 记录当前右键操作的节点。
    handleNodeContext(node) {
      this.contextNode = node
      this.selectedKeys = [node.key]
      this.emitNode(node)
    },
    // 分发右键菜单动作。
    handleContextMenuClick(key, node) {
      if (key === 'add') {
        this.openAddForm(node)
      } else if (key === 'edit') {
        this.openEditForm(node)
      } else if (key === 'permission') {
        this.openPermissionDrawer(node)
      } else if (key === 'addRole') {
        console.log('node-----------', node)
        const { dataRef } = node
        this.$refs.roleAddModal.open(node, {}, dataRef.code)
      } else if (key === 'setManager') {
        this.openManagerModal(node)
      } else if (key === 'delete') {
        this.deleteNode(node)
      }
    },
    // 打开新增组织弹窗，并清空岗位配置区。
    openPermissionDrawer(node) {
      const targetNode = node || this.contextNode
      const departId = this.getNodeDeptId(targetNode)
      if (!departId) {
        this.$message.warning('未获取到组织标识，无法配置权限')
        return
      }
      this.contextNode = targetNode
      this.selectNode(targetNode)
      this.$refs.departAuth.show(departId, {
        title: targetNode.title || targetNode.name || '',
        // isAllTree:bossId === departId,
        pid: targetNode.pid,
        type: 'depart' //
      })
    },
    openAddForm(node) {
      this.contextNode = node
      const { dataRef } = node || {}
      this.formMode = 'add'
      this.orgForm = {
        type: this.getDefaultChildType(node),
        code: dataRef.code || '',
        name: '',
        sort: 0
      }
      this.resetPositionConfig()
      this.formVisible = true
      this.$nextTick(() => {
        this.$refs.orgForm.clearValidate()
      })
    },
    // 打开编辑组织弹窗，并加载当前组织岗位配置。
    openEditForm(node) {
      this.contextNode = node
      this.setEditFormFromNode(node)
      this.resetPositionConfig()
      this.formVisible = true
      console.log('node-------------',node)
      this.loadOrgPositions(this.getNodeDeptId(node))
      this.$nextTick(() => {
        this.$refs.orgForm.clearValidate()
      })
    },
    // 校验组织与岗位表单后，分发新增或编辑流程。
    handleFormOk() {
      if (this.saving) {
        return
      }
      this.$refs.orgForm.validate(valid => {
        if (!valid) {
          return
        }
        const positionMessage = this.validatePositionConfig()
        if (positionMessage) {
          this.$message.warning(positionMessage)
          return
        }
        if (this.formMode === 'edit') {
          this.submitEdit()
        } else {
          this.submitAdd()
        }
      })
    },
    // 提交新增组织，并在成功后补提岗位配置。
    submitAdd() {
      const parent = this.contextNode || {}
      const params = {
        type: this.orgForm.type,
        name: this.orgForm.name,
        code: this.orgForm.code,
        pid: parent.id || '0',
        sort: this.orgForm.sort
      }
      const deptPath = this.getPositionDeptPath(parent, params.name)
      this.saving = true
      httpAction(this.url.add, params, 'post').then(res => {
        if (!res.success) {
          this.$message.warning(res.message || '新增失败')
          return null
        }

        const saveSuccess = deptId => {
          return this.syncOrgPositions(deptId, deptPath).then(() => {
            this.$message.success(res.message || '新增成功')
            this.formVisible = false
            return this.loadTree()
          })
        }

        const result = res.result
        const deptId = typeof result === 'string' || typeof result === 'number' ? String(result) : this.getNodeDeptId(result)
        if (deptId || !this.orgPositions.length) {
          return saveSuccess(deptId)
        }

        // 新增组织后如果接口没回组织ID，就刷新一次树再反查，避免岗位批量新增丢失。
        return this.loadTree().then(() => {
          const savedNode = this.findCreatedNode(parent, params.name)
          const savedDeptId = this.getNodeDeptId(savedNode)
          return saveSuccess(savedDeptId)
        })
      }).catch(error => {
        this.$message.warning(error.message || '岗位配置保存失败')
      }).finally(() => {
        this.saving = false
      })
    },
    // 提交编辑组织，并在成功后同步岗位配置。
    submitEdit(departPrincipal) {
      const node = this.contextNode || {}
      const params = Object.assign({}, node, {
        name: this.orgForm.name,
        type: this.orgForm.type,
        code: this.orgForm.code,
        sort: this.orgForm.sort
      })
      if (departPrincipal !== undefined && departPrincipal !== null && departPrincipal !== '') {
        params.departPrincipal = departPrincipal
      }
      this.saving = true
      httpAction(this.url.edit, params, 'put').then(res => {
        if (res.success) {
          const nextNode = res.result && typeof res.result === 'object' && !Array.isArray(res.result) ? res.result : node
          const deptId = this.getNodeDeptId(nextNode)
          return this.syncOrgPositions(deptId, this.getPositionDeptPath(nextNode, params.name)).then(() => {
            this.$message.success(res.message || '保存成功')
            this.formVisible = false
            return this.loadTree()
          })
        }
        this.$message.warning(res.message || '保存失败')
        return null
      }).catch(error => {
        this.$message.warning(error.message || '岗位配置保存失败')
      }).finally(() => {
        this.saving = false
      })
    },
    // 删除组织节点并刷新树。
    deleteNode(node) {
      this.$confirm({
        title: '确认删除',
        content: `确定删除“${node.title}”及其子节点吗？`,
        okType: 'danger',
        onOk: () => {
          return deleteAction(this.url.delete, { id: node.id }).then(res => {
            if (res.success) {
              this.$message.success(res.message || '删除成功')
              if (this.selectedKeys[0] === node.key) {
                this.selectedKeys = []
                this.$emit('input', '')
                this.$emit('change', null)
              }
              return this.loadTree()
            }
            this.$message.warning(res.message || '删除失败')
            return null
          })
        }
      })
    },
    // 关闭组织弹窗并清理岗位编辑态。
    closeForm() {
      this.formVisible = false
      this.resetPositionConfig()
    },
    // 选中节点并同步到外部。
    selectNode(node) {
      this.selectedKeys = [node.key]
      this.emitNode(node)
    },
    // 向父组件抛出当前选中的组织节点。
    emitNode(node) {
      this.$emit('input', node.id || node.key)
      this.$emit('change', node)
    },
    // 树加载完成后补齐默认选中项。
    ensureSelection() {
      if (this.value && this.syncSelectedByValue(this.value)) {
        const node = this.findNodeByKey(this.treeData, this.value)
        node && this.emitNode(node)
        return
      }
      const selectedNode = this.findNodeByKey(this.treeData, this.selectedKeys[0])
      if (selectedNode) {
        this.emitNode(selectedNode)
        return
      }
      if (this.treeData.length) {
        this.selectNode(this.treeData[0])
      }
    },
    // 根据外部 value 同步当前选中节点。
    syncSelectedByValue(value) {
      if (!value || !this.treeData.length) {
        return false
      }
      const node = this.findNodeByKey(this.treeData, value)
      if (node) {
        this.selectedKeys = [node.key]
        return true
      }
      return false
    },
    // 按 key 或 id 查找树节点。
    findNodeByKey(list, key) {
      return this.findNode(list, item => String(item.key) === String(key) || String(item.id) === String(key))
    },
    // 递归查找首个满足条件的树节点。
    findNode(list, matcher) {
      for (let i = 0; i < (list || []).length; i++) {
        const item = list[i]
        if (matcher(item)) {
          return item
        }
        const child = this.findNode(item.children || [], matcher)
        if (child) {
          return child
        }
      }
      return null
    },
    // 收集默认需要展开的父节点 key。
    collectInitialExpandedKeys(list) {
      return (list || [])
        .filter(item => item.children && item.children.length)
        .map(item => item.key)
    },
    // 收集整棵树的全部 key，供搜索展开使用。
    collectAllKeys(list) {
      const result = []
      ;(list || []).forEach(item => {
        result.push(item.key)
        if (item.children && item.children.length) {
          result.push(...this.collectAllKeys(item.children))
        }
      })
      return result
    },
    // 根据当前节点类型推导新增子组织的默认类型。
    getDefaultChildType(node) {
      if (!node || !node.type) {
        return '集团'
      }
      const index = TYPE_ORDER.indexOf(node.type)
      if (index < 0 || index >= TYPE_ORDER.length - 1) {
        return '组别'
      }
      return TYPE_ORDER[index + 1]
    },
    // 根据组织类型返回树节点图标。
    getNodeIcon(node) {
      if (node.type === '集团') {
        return 'cluster'
      }
      if (node.type === '公司') {
        return 'bank'
      }
      if (node.type === '组别') {
        return 'team'
      }
      return 'apartment'
    }
  }
}
</script>

<style scoped lang="less">
.org-structure-tree {
  width: 280px;
  min-width: 280px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--employee-card, #ffffff);
  border-right: 1px solid rgba(var(--employee-primary-rgb, 37, 99, 235), 0.08);
  overflow: hidden;
  animation: employee-slide-in-left 0.3s ease-out both;
}

.org-tree-header {
  padding: 20px 20px 4px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  h3 {
    margin: 0;
    font-size: 18px;
    margin-bottom: 3px;
    line-height: 18px;
    font-weight: 600;
    color: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.6);
    text-transform: uppercase;
    letter-spacing: 2px;
  }
}

.org-search {
  padding: 0 16px 12px;
  flex-shrink: 0;

  /deep/ .ant-input {
    height: 32px;
    border: 0;
    border-radius: 8px;
    background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.03);
    color: var(--employee-foreground, #1a2a3d);
    box-shadow: none;
    font-size: 13px;
    transition: all 0.3s ease;
  }

  /deep/ .ant-input:focus {
    background: #ffffff;
    box-shadow: 0 0 0 2px rgba(var(--employee-primary-rgb, 37, 99, 235), 0.15), 0 0 0 4px rgba(var(--employee-primary-rgb, 37, 99, 235), 0.08);
  }

  /deep/ .ant-input-prefix {
    color: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.3);
  }
}

.org-tree-body {
  flex: 1;
  min-height: 0;
  padding: 0 8px 16px;
  overflow: auto;
  background-image: radial-gradient(circle, rgba(var(--employee-primary-rgb, 37, 99, 235), 0.04) 1px, transparent 1px);
  background-size: 20px 20px;

  /deep/ .ant-spin-nested-loading,
  /deep/ .ant-spin-container {
    min-height: 100%;
  }
}

.org-tree-control {
  color: var(--employee-foreground, #1a2a3d);

  /deep/ li {
    padding: 2px 0;
  }

  /deep/ .ant-tree-switcher {
    width: 18px;
    height: 34px;
    line-height: 34px;
    color: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.5);
    transition: all 0.2s ease;
  }

  /deep/ .ant-tree-node-content-wrapper {
    width: calc(100% - 24px);
    height: auto;
    min-height: 34px;
    line-height: 1.2;
    padding: 0;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.2s ease;
  }

  /deep/ .ant-tree-node-content-wrapper:hover {
    background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.04);
  }

  /deep/ .ant-tree-node-content-wrapper.ant-tree-node-selected {
    background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.08);
    box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.2);
  }

  /deep/ li span.ant-tree-switcher.ant-tree-switcher-noop {
    width: 6px;
    height: 6px;
    margin-top: 14px;
    margin-right: 12px;
    border-radius: 50%;
    background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.2);
  }
}

.org-node-title {
  width: 100%;
  min-height: 34px;
  padding: 6px 8px;
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--employee-foreground, #1a2a3d);
  font-size: 13px;
  transition: color 0.2s ease;
}

.org-node-title-selected {
  color: var(--employee-primary, #2563eb);
  font-weight: 500;

  .org-node-icon {
    color: #ffffff;
    border-color: var(--employee-primary, #2563eb);
    background: linear-gradient(135deg, var(--employee-primary, #2563eb), rgba(var(--employee-primary-rgb, 37, 99, 235), 0.75));
    box-shadow: 0 0 8px rgba(var(--employee-primary-rgb, 37, 99, 235), 0.15);
  }
}

.org-node-icon {
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(var(--employee-primary-rgb, 37, 99, 235), 0.12);
  border-radius: 4px;
  background: linear-gradient(135deg, rgba(var(--employee-primary-rgb, 37, 99, 235), 0.08), rgba(var(--employee-primary-rgb, 37, 99, 235), 0.04));
  color: var(--employee-primary, #2563eb);
  font-size: 10px;
  transition: all 0.25s ease;
}

.org-node-title:hover .org-node-icon {
  transform: scale(1.08);
  border-color: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.22);
}

.org-node-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.org-node-type {
  flex: 0 0 auto;
  padding: 1px 6px;
  border-radius: 999px;
  background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.06);
  color: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.5);
  font-size: 11px;
  line-height: 16px;
  font-variant-numeric: tabular-nums;
}

.org-node-title-selected .org-node-type {
  background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.12);
  color: var(--employee-primary, #2563eb);
}

.parent-name {
  color: var(--employee-foreground, #1a2a3d);
}

.org-form-panel {
  min-width: 0;
}

.org-basic-section {
  margin-bottom: 18px;
  padding: 0 0 4px;
}

.org-basic-section-title {
  margin-bottom: 16px;
  // color: #2563eb;
  font-size: 24px;
  // font-weight: 700;
  line-height: 1.2;
}

.org-basic-grid {
  margin-bottom: -12px;

}

.org-basic-field,
.org-basic-item {
  min-width: 0;
}

.org-basic-item /deep/ .ant-form-item {
  margin-bottom: 0;
}

.org-basic-item /deep/ .ant-form-item-control {
  line-height: 1;
}

.org-basic-item /deep/ .ant-form-explain {
  margin-top: 4px;
  font-size: 12px;
}

.org-basic-label {
  display: block;
  margin: 0 0 8px;
  // color: rgba(37, 99, 235, 0.72);
  font-size: 13px;
  // font-weight: 600;
  line-height: 20px;
}

.org-basic-readonly,
.org-basic-item /deep/ .ant-input,
.org-basic-item /deep/ .ant-select-selection,
.org-basic-item /deep/ .ant-input-number {
  min-height: 40px;
  border: 1px solid #d6e4ff;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: none;
}

.org-basic-readonly {
  padding: 9px 12px;
  color: #5b6b84;
  line-height: 20px;
}

.org-basic-item /deep/ .ant-input-number {
  width: 100%;
}

.org-basic-item /deep/ .ant-input,
.org-basic-item /deep/ .ant-input-number-input {
  height: 38px;
  line-height: 38px;
}

.org-basic-item /deep/ .ant-select-selection--single {
  height: 40px;
}

.org-basic-item /deep/ .ant-select-selection__rendered {
  line-height: 38px;
}

.org-position-section {
  margin-top: 18px;
  padding-top: 12px;
  border-top: 1px solid rgba(37, 99, 235, 0.14);
}

.org-position-section-title {
  margin-bottom: 14px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  // color: #2563eb;
  font-size: 14px;
  // font-weight: 700;

  small {
    display: inline-block;
    margin-left: 10px;
    // color: rgba(37, 99, 235, 0.42);
    font-size: 12px;
    font-weight: 500;
  }
}

.org-position-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.org-position-card {
  overflow: hidden;
  border: 1px solid #dbe7ff;
  border-radius: 8px;
  background: #ffffff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.org-position-card.active {
  border-color: #2563eb;
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.08);
}

.org-position-card-header {
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 14px;
  background: #fbfdff;
}

.org-position-summary {
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 0;
  background: transparent;
  color: #1a2a3d;
  text-align: left;
  cursor: pointer;
}

.org-position-index {
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #2563eb;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
}

.org-position-name {
  min-width: 0;
  overflow: hidden;
  // color: #a9c4ff;
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.org-position-card.active .org-position-name {
  color: #2563eb;
}

.org-position-card-actions {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 6px;
}

.org-position-card-actions /deep/ .ant-btn {
  width: 28px;
  height: 28px;
  padding: 0;
}

.org-position-delete {
  color: #8bb4ff;
}

.org-position-delete:hover {
  color: #ef4444;
}

.org-position-card-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr) minmax(0, 1fr);
  gap: 18px;
  padding: 14px 16px 16px;
  border-top: 1px solid #eef3ff;
}

.org-position-column {
  min-width: 0;
}

.org-position-column + .org-position-column {
  padding-left: 16px;
  border-left: 1px solid #edf2ff;
}

.org-position-column-title {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e8f0ff;
  // color: #2563eb;
  font-size: 13px;
  // font-weight: 700;
}

.org-position-field-label {
  display: block;
  margin: 0 0 6px;
  // color: rgba(37, 99, 235, 0.58);
  font-size: 12px;
  // font-weight: 600;
  line-height: 18px;
}

.org-position-card-body /deep/ .ant-row > .ant-col,
.org-level-editor /deep/ .ant-row > .ant-col {
  margin-bottom: 12px;
}

.org-position-card-body /deep/ .ant-select,
.org-position-card-body /deep/ .ant-input-number,
.org-level-editor /deep/ .ant-select,
.org-level-editor /deep/ .ant-input-number {
  width: 100%;
}

.org-position-card-body /deep/ .ant-input,
.org-position-card-body /deep/ .ant-select-selection,
.org-position-card-body /deep/ .ant-input-number,
.org-level-editor /deep/ .ant-input,
.org-level-editor /deep/ .ant-select-selection,
.org-level-editor /deep/ .ant-input-number {
  height: 38px;
  border-color: #dbe7ff;
  border-radius: 6px;
  box-shadow: none;
}

.org-position-card-body /deep/ .ant-input-number-input,
.org-level-editor /deep/ .ant-input-number-input {
  height: 36px;
}

.org-position-card-body /deep/ .ant-select-selection__rendered,
.org-level-editor /deep/ .ant-select-selection__rendered {
  line-height: 36px;
}

.org-position-range {
  display: flex;
  align-items: center;
  gap: 10px;

  span {
    color: #6b7280;
  }
}

.org-position-textarea {
  width: 100%;
  min-height: 64px;
  padding: 8px 10px;
  border: 1px solid #dbe7ff;
  border-radius: 6px;
  color: #1a2a3d;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
  outline: none;
}

.org-position-textarea:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.org-level-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.org-level-item {
  min-height: 48px;
  padding: 9px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border: 1px solid #dbe7ff;
  border-radius: 6px;
  background: #fbfdff;
}

.org-level-main {
  min-width: 0;
  flex: 1;
  cursor: pointer;
}

.org-level-name {
  overflow: hidden;
  color: #1a2a3d;
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.org-level-meta {
  margin-top: 4px;
  overflow: hidden;
  color: #7a8aa0;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.org-level-delete {
  flex: 0 0 auto;
  color: #ef4444;
  font-size: 12px;
}

.org-level-add {
  margin-top: 12px;
}

.org-position-add {
  width: 140px;
  margin-top: 16px;
  border-style: dashed;
  border-color: #a9c4ff;
  color: #2563eb;
}

.org-required {
  margin-right: 2px;
  color: #ff4d4f;
}

@media (max-width: 960px) {
  .org-position-card-body {
    grid-template-columns: 1fr;
  }

  .org-position-column + .org-position-column {
    padding-left: 0;
    padding-top: 12px;
    border-top: 1px solid #edf2ff;
    border-left: none;
  }
}

@keyframes employee-slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-12px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>

<style lang="less">
.org-form-modal-wrap {
  .ant-modal {
    max-width: 96vw;
  }

  .ant-modal-content {
    overflow: hidden;
    border-radius: 14px;
    box-shadow: 0 18px 50px rgba(30, 64, 175, 0.16);
  }

  .ant-modal-header {
    padding: 18px 24px 0;
    border-bottom: none;
  }

  .ant-modal-title {
    // color: #2563eb;
    font-size: 18px;
    // font-weight: 700;
  }

  .ant-modal-body {
    padding: 18px 24px 22px;
  }

  .ant-modal-footer {
    margin: 0 24px;
    padding: 16px 0 20px;
  }
}
</style>

<template>
  <div class="job-position-panel">
    <!-- 顶部标题、面包屑和主要操作 -->
    <section class="position-header">
      <div class="position-header-top">
        <div class="position-header-main">
          <!-- <h2 class="position-title">{{ pageTitle }}</h2> -->
          <div class="position-breadcrumb">
            <span v-for="(item, index) in breadcrumbItems" :key="item + index" class="breadcrumb-item">
              <span v-if="index" class="breadcrumb-separator">/</span>
              <span>{{ item }}</span>
            </span>
          </div>
        </div>
        <div class="position-actions">
          <a-button class="custom-btn add-btn" type="primary" icon="plus" @click="openCreateModal">新增岗位</a-button>
          <!-- <a-button class="custom-btn" icon="download" @click="handleExportXls('岗位列表')">导出</a-button> -->
        </div>
      </div>

      <!-- 岗位序列快捷筛选 -->
      <div class="sequence-tabs">
        <button
          v-for="item in sequenceTabs"
          :key="item.key"
          type="button"
          class="sequence-tab"
          :class="{ active: activeSequence === item.key }"
          @click="handleSequenceChange(item.key)"
        >
          <span>{{ item.label }}</span>
        </button>
      </div>

      <!-- 列表查询条件 -->
      <div class="position-filters">
        <div class="filter-item">
          <label class="filter-label">学历</label>
          <a-select
            v-model="queryParam.educationRequirement"
            allowClear
            placeholder="全部学历"
            style="width: 120px"
            @change="searchQuery"
          >
            <a-select-option v-for="item in educationOptions" :key="item" :value="item">
              {{ item }}
            </a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <label class="filter-label">薪资类型</label>
          <a-select
            v-model="queryParam.salaryType"
            allowClear
            placeholder="全部类型"
            style="width: 120px"
            @change="searchQuery"
          >
            <a-select-option v-for="item in salaryTypeOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </div>
        <div class="filter-item filter-item-grow">
          <label class="filter-label">岗位名称</label>
          <j-input
            v-model.trim="queryParam.postName"
            allowClear
            class="filter-input"
            placeholder="搜索岗位名称..."
            @pressEnter="searchQuery"
            @change="searchQuery"
          >
            <a-icon slot="prefix" type="search" />
          </j-input>
        </div>
        <div class="filter-item filter-item-reset">
          <label class="filter-label">&nbsp;</label>
          <a-button icon="reload" @click="handleFilterReset">重置</a-button>
        </div>
      </div>
    </section>

    <!-- 岗位列表表格 -->
    <section class="table-panel">
      <div class="table-panel-body">
        <a-table
          :columns="columns"
          :dataSource="positions"
          :pagination="ipagination"
          :loading="loading"
          rowKey="id"
          size="middle"
          class="position-table"
          @change="handleTableChange"
        >
          <template slot="name" slot-scope="text, record">
            <span class="position-name">{{ record.postName || '-' }}</span>
          </template>

          <template slot="processIdentity" slot-scope="text, record">
            <span :class="['process-identity-tag', getProcessIdentityClass(record)]">{{ text || record.processIdentity_dictText || record.processIdentity || '-' }}</span>
          </template>

          <template slot="sequence" slot-scope="text, record">
            <span class="sequence-tag">{{ text || record.gwsl || '-' }}</span>
          </template>

          <template slot="education" slot-scope="text, record">
            <span class="education-text">{{ text || record.educationRequirement || '-' }}</span>
          </template>

          <template slot="type" slot-scope="text, record">
            <span class="salary-type-tag" :class="getSalaryTypeClass(record)">
              {{ getSalaryTypeText(record) }}
            </span>
          </template>

          <template slot="salary" slot-scope="text, record">
            <span class="salary-range">{{ formatSalaryRange(record) }}</span>
          </template>

          <template slot="staffing" slot-scope="text, record">
            <span class="staffing-num">{{ getPositionStaffing(record) }}</span>
          </template>

          <template slot="headcount" slot-scope="text, record">
            <span class="headcount-num">{{ getHeadcount(record) }}</span>
          </template>

          <template slot="action" slot-scope="text, record">
            <a @click="openEditModal(record)">编辑</a>
            <a class="action-link" @click="openDetail(record)">详情</a>
            <a class="staff-action-link" @click="openStaffDrawer(record)">人员</a>
            <a class="action-danger" @click="handleDelete(record)">删除</a>
          </template>
        </a-table>
      </div>
    </section>

    <!-- 新增/编辑/详情岗位表单 -->
    <position-form-modal
      :visible="formVisible"
      :mode="formMode"
      :value="positionForm"
      :confirm-loading="formSubmitting"
      :delete-url="url.delete"
      :sequence-options="sequenceOptions"
      :education-options="educationOptions"
      :salary-type-options="salaryTypeOptions"
      :experience-options="experienceOptions"
      :gender-options="genderOptions"
      :process-identity-options="processIdentityOptions"
      @ok="handleFormOk"
      @cancel="closeFormModal"
    />
    <position-staff-drawer
      :visible="staffDrawerVisible"
      :position="staffDrawerRecord"
      @close="closeStaffDrawer"
    />
  </div>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { deleteAction, httpAction } from '@/api/manage'
import PositionFormModal from './PositionFormModal.vue'
import PositionStaffDrawer from './PositionStaffDrawer.vue'
import { initDictOptions } from '@/components/dict/JDictSelectUtil'

const DEFAULT_SEQUENCE_OPTIONS = []
const DEFAULT_EDUCATION_OPTIONS = []
const DEFAULT_SALARY_TYPE_OPTIONS = []
const DEFAULT_EXPERIENCE_OPTIONS = []
const GENDER_OPTIONS = [
  { label: '不限', value: '' },
  { label: '男', value: '男' },
  { label: '女', value: '女' },
]

// 深拷贝表单数据，避免编辑时直接修改列表行对象。
function cloneDeep(value) {
  return JSON.parse(JSON.stringify(value))
}

// 创建岗位表单默认值，新增和关闭弹窗时复用。
function createEmptyPositionForm() {
  return {
    id: null,
    companyId: '',
    dept: '',
    deptId: '',
    postName: '',
    gwsl: '',
    staffingQuota: null,
    isKeyOhMonitoring: '',
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
    processIdentity: '',
    hrJobLevels: [],
  }
}

export default {
  name: 'JobPositionPanel',
  mixins: [JeecgListMixin],
  components: {
    PositionFormModal,
    PositionStaffDrawer
  },
  props: {
    orgId: {
      type: [String, Number],
      default: '',
    },
    department: {
      type: Object,
      default: null,
    },
  },
  // 初始化列表、详情弹窗和表单弹窗状态。
  data() {
    return {
      disableMixinCreated: true,
      positions: [],
      activeSequence: 'all',
      url: {
        // list: '/hrJobSequence/hrJobSequence/list',
        list: '/hrJobSequence/hrJobSequence/childrenList',
        saveOrUpdateMain: '/hrJobSequence/hrJobSequence/saveOrUpdateMain',
        delete: '/hrJobSequence/hrJobSequence/delete',
        exportXlsUrl: '/hrJobSequence/hrJobSequence/exportXls',
      },
      isorter:{
        column: '',
        order: '',
      },
      ipagination: {
        current: 1,
        pageSize: 10,
        pageSizeOptions: ['10', '20', '50'],
        showTotal: (total, range) => {
          // 展示分页总数文案。
          return range[0] + '-' + range[1] + ' 共' + total + '条'
        },
        showQuickJumper: true,
        showSizeChanger: true,
        total: 0,
      },
      columns: [
        {
          title: '#',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: (text, record, index) => {
            // 根据当前页码计算列表序号。
            return (this.ipagination.current - 1) * this.ipagination.pageSize + index + 1
          },
        },
        {
          title: '岗位名称',
          dataIndex: 'postName',
          key: 'name',
          width: 220,
          scopedSlots: { customRender: 'name' },
        },
        {
          title: '用于流程身份',
          dataIndex: 'processIdentity_dictText',
          key: 'processIdentity',
          width: 120,
          align: 'center',
          scopedSlots: { customRender: 'processIdentity' },
        },
        {
          title: '岗位序列',
          dataIndex: 'gwsl_dictText',
          key: 'sequence',
          width: 140,
          align: 'center',
          scopedSlots: { customRender: 'sequence' },
        },
        {
          title: '学历要求',
          dataIndex: 'educationRequirement_dictText',
          key: 'education',
          width: 120,
          align: 'center',
          scopedSlots: { customRender: 'education' },
        },
        {
          title: '薪资类型',
          dataIndex: 'salaryType',
          key: 'type',
          width: 110,
          align: 'center',
          scopedSlots: { customRender: 'type' },
        },
        {
          title: '岗位参考薪资标准(K)',
          key: 'salary',
          width: 170,
          align: 'center',
          scopedSlots: { customRender: 'salary' },
        },
        {
          title: '岗位编制',
          dataIndex: 'staffingQuota',
          key: 'staffing',
          width: 110,
          align: 'center',
          scopedSlots: { customRender: 'staffing' }
        },
        {
          title: '在职人数',
          key: 'headcount',
          width: 110,
          align: 'center',
          scopedSlots: { customRender: 'headcount' },
        },
        {
          title: '操作',
          key: 'action',
          width: 180,
          align: 'center',
          scopedSlots: { customRender: 'action' },
        },
      ],
      formVisible: false,
      formSubmitting: false,
      formMode: 'create',
      positionForm: createEmptyPositionForm(),
      staffDrawerVisible: false,
      staffDrawerRecord: null,
      dictOptions: {
        gwxl: [],
        xlyq: [],
        xzlx: [],
        gzjy: [],
        process_identity: [],
      },
    }
  },
  created() {
    this.initDictConfig()
  },
  computed: {
    // 岗位序列下拉和页签选项。
    sequenceOptions() {
      return this.getDictValueList(this.dictOptions.gwxl, DEFAULT_SEQUENCE_OPTIONS)
    },
    // 学历筛选和表单选项。
    educationOptions() {
      return this.getDictValueList(this.dictOptions.xlyq, DEFAULT_EDUCATION_OPTIONS)
    },
    // 薪资类型筛选和表单选项。
    salaryTypeOptions() {
      return this.getDictSelectList(this.dictOptions.xzlx, DEFAULT_SALARY_TYPE_OPTIONS)
    },
    // 工作经验表单选项。
    experienceOptions() {
      return this.getDictValueList(this.dictOptions.gzjy, DEFAULT_EXPERIENCE_OPTIONS)
    },
    // 性别表单选项。
    genderOptions() {
      return GENDER_OPTIONS
    },
    // 流程身份表单选项。
    processIdentityOptions() {
      return this.getDictSelectList(this.dictOptions.process_identity, [])
    },
    // 当前组织面包屑路径。
    currentDepartmentPath() {
      if (this.department && this.department.path && this.department.path.length) {
        return this.department.path.slice()
      }
      if (this.department && this.department.title) {
        return [this.department.title]
      }
      return []
    },
    // 当前组织标题。
    departmentTitle() {
      if (this.currentDepartmentPath.length) {
        return this.currentDepartmentPath[this.currentDepartmentPath.length - 1]
      }
      return '全部组织'
    },
    // 顶部面包屑展示项。
    breadcrumbItems() {
      return this.currentDepartmentPath.length ? this.currentDepartmentPath : ['全部组织']
    },
    // 页面标题。
    pageTitle() {
      return this.departmentTitle === '全部组织' ? '岗位列表' : this.departmentTitle + ' - 岗位列表'
    },
    // 岗位序列页签数据。
    sequenceTabs() {
      return [{ key: 'all', label: '全部' }].concat(this.sequenceOptions.map((item) => ({ key: item, label: item })))
    },
  },
  watch: {
    dataSource: {
      immediate: true,
      // 接口数据变化后同步到当前表格展示数据。
      handler(list) {
        this.positions = list || []
        this.ensureSequenceActive()
      },
    },
    orgId(val) {
      if (val === undefined || val === null || val === '') {
        this.$delete(this.queryParam, 'deptId')
      } else {
        this.$set(this.queryParam, 'deptId', String(val))
      }
      this.searchQuery()
    },
  },
  methods: {
    // 初始化岗位相关字典。
    initDictConfig() {
      this.loadDictOptions('gwxl', 'gwxl')
      this.loadDictOptions('xzlx', 'xzlx')
      this.loadDictOptions('xlyq', 'xlyq')
      this.loadDictOptions('gzjy', 'gzjy', DEFAULT_EXPERIENCE_OPTIONS)
      this.loadDictOptions('process_identity', 'process_identity')
    },
    // 加载单个字典，失败时使用兜底选项。
    loadDictOptions(dictCode, optionKey, fallbackOptions) {
      initDictOptions(dictCode)
        .then((res) => {
          const options =
            res && res.success && Array.isArray(res.result) && res.result.length ? res.result : fallbackOptions || []
          console.log('options', options)
          this.$set(this.dictOptions, optionKey, options)
        })
        .catch(() => {
          this.$set(this.dictOptions, optionKey, fallbackOptions || [])
        })
    },
    // 将字典项转换为 value 数组，适配现有 select 和页签。
    getDictValueList(dictOptions, fallbackOptions) {
      const source = dictOptions && dictOptions.length ? dictOptions : fallbackOptions
      return (source || [])
        .map((item) => {
          if (typeof item === 'string') {
            return item
          }
          return item.value || item.text || item.label || item.title
        })
        .filter((item) => item !== undefined && item !== null && item !== '')
    },
    // 将字典项转换为 a-select 的 value/label 数组。
    getDictSelectList(dictOptions, fallbackOptions) {
      const source = dictOptions && dictOptions.length ? dictOptions : fallbackOptions
      return (source || [])
        .map((item) => {
          if (typeof item === 'string') {
            return { value: item, label: item }
          }
          return {
            value: item.value || item.text || item.label || item.title,
            label: item.text || item.label || item.title || item.value,
          }
        })
        .filter((item) => item.value !== undefined && item.value !== null && item.value !== '')
    },
    // 切换岗位序列页签并刷新列表。
    handleSequenceChange(sequence) {
      this.activeSequence = sequence
      if (sequence === 'all') {
        this.$delete(this.queryParam, 'gwsl')
      } else {
        this.$set(this.queryParam, 'gwsl', sequence)
      }
      this.searchQuery()
    },
    // 重置筛选条件。
    handleFilterReset() {
      this.queryParam.educationRequirement = undefined
      this.queryParam.salaryType = undefined
      this.queryParam.postName = ''
      this.searchQuery()
    },
    // 查询字段交给后端默认返回，避免手动拼接字段遗漏。
    getQueryField() {
      return ''
    },
    // 确保当前岗位序列页签仍在可选范围内。
    ensureSequenceActive() {
      const keys = this.sequenceTabs.map((item) => item.key)
      if (keys.indexOf(this.activeSequence) === -1) {
        this.activeSequence = 'all'
      }
    },
    // 格式化岗位薪资范围展示。
    formatSalaryRange(record) {
      if (record.postSalaryStandard) {
        return record.postSalaryStandard
      }
      if (record.salaryMin !== undefined || record.salaryMax !== undefined) {
        return (record.salaryMin || 0) + '-' + (record.salaryMax || 0)
      }
      return '-'
    },
    // 根据流程身份返回标签样式类名。
    getProcessIdentityClass(record) {
      const text = String((record && record.processIdentity_dictText) || '')
      const value = String((record && record.processIdentity) || '').toLowerCase()
      if (text.indexOf('职员') > -1 || value.indexOf('staff') > -1 || value.indexOf('employee') > -1) {
        return 'staff'
      }
      if (text.indexOf('主管') > -1 || value.indexOf('supervisor') > -1 || value.indexOf('lead') > -1) {
        return 'supervisor'
      }
      if (text.indexOf('经理') > -1 || value.indexOf('manager') > -1) {
        return 'manager'
      }
      return ''
    },
    // 获取岗位编制。
    getPositionStaffing(record) {
      const value = record && record.staffingQuota
      if (value !== undefined && value !== null && value !== '') {
        return value
      }
      return '-'
    },
    // 根据薪资类型返回表格标签样式类名。
    getSalaryTypeClass(record) {
      const text = String((record && record.salaryType_dictText) || '')
      const value = String((record && record.salaryType) || '').toLowerCase()
      return value === 'timely' || value === 'hourly' || text.indexOf('时') > -1 ? 'timely' : 'monthly'
    },
    // 获取薪资类型展示文本。
    getSalaryTypeText(record) {
      if (record && record.salaryType_dictText) {
        return record.salaryType_dictText
      }
      if (record && record.salaryType) {
        return this.getSalaryTypeClass(record) === 'timely' ? '时薪' : '月薪'
      }
      return record === 'timely' ? '时薪' : '月薪'
    },
    // 获取岗位在职人数。
    getHeadcount(record) {
      return record.employeeCount || 0
      // return record.hrJobLevels.reduce((all,item)=>{
      //   return all += item.employeeCount
      // },0)
    },
    // 获取组织节点路径，用于新增岗位时回填所属部门。
    getDepartmentPathByNode(node) {
      if (node && node.path && node.path.length) {
        return node.path.slice()
      }
      if (node && node.title) {
        return [node.title]
      }
      return this.currentDepartmentPath.slice()
    },
    // 获取组织节点 id，用于新增岗位表单回填。
    getDepartmentIdByNode(node) {
      const target = node || this.department || {}
      if (target.id || target.key || target.value) {
        return String(target.id || target.key || target.value)
      }
      return ''
    },
    // 打开新增岗位弹窗，并带入当前组织和序列。
    openCreateModal(node, companyId) {
      const targetNode = node && node.target ? null : node
      const departmentPath = [this.getDepartmentPathByNode(targetNode).at(-1)]
      console.log('targetNode', targetNode)
      console.log('departmentPath', departmentPath)
      this.formMode = 'create'
      this.positionForm = createEmptyPositionForm()
      this.positionForm.dept = departmentPath.join(' / ')
      this.positionForm.deptId = this.getDepartmentIdByNode(targetNode)
      this.positionForm.companyId = companyId
      if (this.activeSequence !== 'all') {
        this.positionForm.gwsl = this.activeSequence
      }
      this.formVisible = true
    },
    // 打开编辑岗位弹窗，使用当前行数据初始化表单。
    openEditModal(record) {
      this.formMode = 'edit'
      this.positionForm = Object.assign(createEmptyPositionForm(), cloneDeep(record))
      if (!Array.isArray(this.positionForm.hrJobLevels)) {
        this.positionForm.hrJobLevels = []
      }
      this.formVisible = true
    },
    // 关闭新增/编辑/详情岗位弹窗并重置表单。
    closeFormModal() {
      this.formVisible = false
      this.formMode = 'create'
      this.positionForm = createEmptyPositionForm()
    },
    // 子组件现在统一返回岗位数组，这里直接按数组提交给后端。
    handleFormOk(formData) {
      if (this.formMode === 'detail') {
        this.closeFormModal()
        return
      }
      const formDataList = Array.isArray(formData) ? formData : formData ? [formData] : []
      if (!formDataList.length) {
        this.formVisible = false
        this.positionForm = createEmptyPositionForm()
        this.loadData()
        return
      }
      this.formSubmitting = true
      const payloadList = formDataList.map((item) => {
        const payload = Object.assign(createEmptyPositionForm(), cloneDeep(item || {}))
        // delete payload.employeeCount
        payload.updatedAt = payload.updatedAt || new Date().toISOString().slice(0, 10)
        if (!payload.dept && this.currentDepartmentPath.length) {
          payload.dept = this.currentDepartmentPath.join(' / ')
        }
        if (
          !payload.deptId &&
          this.department &&
          (this.department.id || this.department.key || this.department.value)
        ) {
          payload.deptId = String(this.department.id || this.department.key || this.department.value)
        }
        if (!Array.isArray(payload.hrJobLevels)) {
          payload.hrJobLevels = []
        }
        payload.hrJobLevels = payload.hrJobLevels.map((level) => {
          const levelItem = cloneDeep(level || {})
          // delete levelItem.employeeCount
          return levelItem
        })
        return payload
      })
      httpAction(this.url.saveOrUpdateMain, payloadList, 'post')
        .then((res) => {
          // 保存成功后关闭弹窗并重新拉取列表。
          if (res.success) {
            this.$message.success(res.message || (this.formMode === 'edit' ? '岗位更新成功' : '岗位新增成功'))
            this.formVisible = false
            this.positionForm = createEmptyPositionForm()
            this.loadData()
          } else {
            this.$message.warning(res.message || '保存失败')
          }
        })
        .finally(() => {
          // 保存请求结束后恢复按钮状态。
          this.formSubmitting = false
        })
    },
    // 打开岗位详情，复用岗位表单弹窗的只读态。
    openDetail(record) {
      this.formMode = 'detail'
      this.positionForm = Object.assign(createEmptyPositionForm(), cloneDeep(record))
      if (!Array.isArray(this.positionForm.hrJobLevels)) {
        this.positionForm.hrJobLevels = []
      }
      this.formVisible = true
    },
    // 打开在职人员抽屉，当前先交给抽屉组件使用 mock 数据展示。
    openStaffDrawer(record) {
      this.staffDrawerRecord = record || null
      this.staffDrawerVisible = true
    },
    // 关闭在职人员抽屉并清空当前岗位。
    closeStaffDrawer() {
      this.staffDrawerVisible = false
      this.staffDrawerRecord = null
    },
    // 删除岗位，接口成功后重新计算分页并刷新列表。
    handleDelete(record) {
      if (!this.url.delete) {
        this.$message.error('请设置url.delete属性!')
        return
      }
      const id = record && record.id
      if (id === undefined || id === null || id === '') {
        this.$message.warning('未找到岗位ID')
        return
      }
      this.$confirm({
        title: '确认删除',
        content: '确定删除岗位“' + (record.postName || record.name || '') + '”吗？',
        okType: 'danger',
        onOk: () => {
          // 用户确认后调用删除接口。
          this.loading = true
          return deleteAction(this.url.delete, { id })
            .then((res) => {
              // 删除成功后刷新列表。
              if (res.success) {
                this.reCalculatePage(1)
                this.$message.success(res.message || '岗位删除成功')
                this.loadData()
              } else {
                this.$message.warning(res.message || '删除失败')
              }
            })
            .finally(() => {
              // 删除请求结束后恢复表格 loading。
              this.loading = false
            })
        },
      })
    },
  },
}
</script>

<style scoped lang="less">
.job-position-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--job-background, #f8fafd);
  color: var(--job-foreground, #1a2a3d);
  --primary-rgb: 37, 99, 235;
  --gradient-blue: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  @keyframes gradient-shift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  .add-btn {
    color: #fff;
    background: var(--gradient-blue);
    animation: gradient-shift 6s ease infinite;
    box-shadow: 0 2px 8px rgba(var(--primary-rgb), 0.2);
  }
  .custom-btn {
    height: 36px;
    border-radius: 8px;
  }
}

.position-header {
  flex-shrink: 0;
  padding: 8px 28px 14px;
  background: #fff;
}

.position-header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.position-header-main {
  min-width: 0;
  flex: 1;
}

.position-breadcrumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  margin-top: 14px;
  color: var(--job-primary, #2563eb);
  font-size: 13px;
  font-weight: 500;
}

.breadcrumb-separator {
  margin-right: 4px;
  color: rgba(var(--job-primary-rgb, 37, 99, 235), 0.4);
}

.position-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--job-foreground, #1a2a3d);
  letter-spacing: 0;
}

.position-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sequence-tabs {
  margin-top: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
}

.sequence-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 0 10px;
  border: none;
  border-bottom: 2px solid transparent;
  border-radius: 0;
  background: transparent;
  // color: var(--job-muted-foreground, #64748b);
  font-size: 14px;
  // font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sequence-tab:hover,
.sequence-tab.active {
  color: var(--job-primary, #2563eb);
  border-bottom-color: var(--job-primary, #2563eb);
}

.position-filters {
  margin-top: 18px;
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  padding: 14px 20px;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(45, 120, 255, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03);
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.filter-item-grow {
  flex: 1;
  min-width: 200px;
}

.filter-item-reset {
  flex-shrink: 0;
}

.filter-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: rgba(var(--job-primary-rgb, 37, 99, 235), 0.5);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.table-panel {
  flex: 1;
  min-height: 0;
  // padding: 16px 28px 18px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.table-panel-body {
  flex: 0 0 auto;
  background: #fff;
  border: 1px solid rgba(var(--job-primary-rgb, 37, 99, 235), 0.1);
  // border-radius: 12px;
  // overflow: hidden;
}

.job-position-panel /deep/ .position-table {
  width: 100%;
}

.job-position-panel /deep/ .position-table .ant-table-thead > tr > th {
  background: #fff;
  font-size: 13px;
  // color: var(--job-foreground, #1a2a3d);
  // font-weight: 700;
  border-bottom: 1px solid rgba(var(--job-primary-rgb, 37, 99, 235), 0.08);
}

.job-position-panel /deep/ .position-table .ant-table-tbody > tr > td {
  border-bottom-color: rgba(var(--job-primary-rgb, 37, 99, 235), 0.06);
  vertical-align: middle;
}

.job-position-panel /deep/ .position-table .ant-table-tbody > tr:hover > td {
  background: rgba(var(--job-primary-rgb, 37, 99, 235), 0.03);
}

.position-name {
  color: var(--job-foreground, #1a2a3d);
  font-size: 14px;
  // font-weight: 700;
}

.education-text,
.sequence-tag,
.salary-type-tag,
.staffing-num,
.headcount-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  // font-weight: 600;
}

.education-text {
  color: var(--job-foreground, #1a2a3d);
}

.sequence-tag {
  padding: 4px 10px;
  border-radius: 6px;
  color: #1890ff;
  background: rgba(37, 99, 235, 0.08);
}

.process-identity-tag {
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 12px;
  color: #722ed1;
  background: rgba(114, 46, 209, 0.1);
}

.process-identity-tag.staff {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.process-identity-tag.supervisor {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.1);
}

.process-identity-tag.manager {
  color: #fa8c16;
  background: rgba(250, 140, 22, 0.1);
}

.salary-type-tag.monthly {
  padding: 3px 9px;
  border-radius: 6px;
  color: #fa8c16;
  background: rgba(250, 173, 20, 0.12);
}

.salary-type-tag.timely {
  padding: 3px 9px;
  border-radius: 6px;
  color: #ff4d4f;
  background: rgba(255, 77, 79, 0.1);
}

.salary-range {
  color: #1677ff;
  // font-weight: 700;
}

.headcount-num {
  color: var(--job-foreground, #1a2a3d);
}

.action-danger {
  color: #ef4444;
}

.action-link {
  margin-left: 18px;
  margin-right: 18px;
}

.staff-action-link {
  margin-right: 18px;
}

@media (max-width: 980px) {
  .position-header-top {
    flex-direction: column;
  }

  .position-actions {
    width: 100%;
  }

  .position-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-item-grow {
    min-width: 0;
  }
}
</style>
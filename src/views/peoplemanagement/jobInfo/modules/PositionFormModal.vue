<template>
  <div class="position-form-modal" :class="{ 'is-detail-mode': mode === 'detail' }">
    <a-modal
      :dialogStyle="{
        top:'15px'
      }"
      :visible="visible"
      :title="modalTitle"
      :confirmLoading="confirmLoading"
      :width="1240"
      :bodyStyle="{ maxHeight: '78vh', overflowY: 'auto' }"
      okText="确定"
      cancelText="取消"
      destroyOnClose
      wrapClassName="job-form-modal-wrap"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <section class="position-config-section" :class="{ 'is-detail-mode': mode === 'detail' }">
        <div class="position-config-title flex items-center justify-between">
          <div>
            <span>岗位配置</span>
            <small>{{ configTip }}</small>
          </div>
          <a-button v-if="mode === 'create'" class="org-position-add" block @click="addPosition">
            <a-icon type="plus" />
            添加新岗位
          </a-button>
        </div>

        <a-spin :spinning="positionLoading">
          <div v-if="modelList.length" class="org-position-list">
            <article
              v-for="(position, positionIndex) in modelList"
              :key="position._rowKey"
              class="org-position-card"
              :class="{ active: isPositionExpanded(position) }"
            >
              <div class="org-position-card-header">
                <button class="org-position-summary" type="button" @click="togglePosition(position)">
                  <span class="org-position-index">{{ positionIndex + 1 }}</span>
                  <span class="org-position-name">{{ position.postName || '岗位名称（点击右侧箭头展开详情）' }}</span>
                  <span class="">{{  removeLastSlash(position.mainDeptPath) }}</span>
                </button>
                <div class="org-position-card-actions">
                  <a-button
                    type="link"
                    :title="isPositionExpanded(position) ? '收起岗位' : '展开岗位'"
                    :icon="isPositionExpanded(position) ? 'up' : 'down'"
                    @click="togglePosition(position)"
                  />
                  <a-button
                    v-if="mode === 'create'"
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
                      <label class="org-position-field-label"><span class="required">*</span>岗位名称</label>
                      <a-input v-model.trim="position.postName" :disabled="mode === 'detail'" placeholder="请输入岗位名称" />
                    </a-col>
                    <a-col :xs="24" :sm="12" v-if="mode === 'edit' || mode === 'detail'">
                      <label class="org-position-field-label">所属部门</label>
                      <a-input 
                      :value="getLastLevel(position.mainDeptPath)"
                       disabled placeholder="所属部门" />
                    </a-col>
                    <a-col :xs="24" :sm="12" v-else>
                      <label class="org-position-field-label">所属部门</label>
                      <a-input v-model.trim="position.dept" disabled placeholder="所属部门" />
                    </a-col>
                    <a-col :xs="24" :sm="12">
                      <label class="org-position-field-label"><span class="required" v-if="false">*</span>所属序列</label>
                      <a-select v-model="position.gwsl" :disabled="mode === 'detail'" allowClear placeholder="请选择">
                        <a-select-option v-for="item in sequenceOptions" :key="item" :value="item">
                          {{ item }}
                        </a-select-option>
                      </a-select>
                    </a-col>
                    <a-col :xs="24" :sm="12">
                      <label class="org-position-field-label"><span class="required" v-if="false">*</span>薪资类型</label>
                      <a-select v-model="position.salaryType" :disabled="mode === 'detail'" allowClear placeholder="请选择">
                        <a-select-option v-for="item in salaryTypeOptions" :key="item.value" :value="item.value">
                          {{ item.label }}
                        </a-select-option>
                      </a-select>
                    </a-col>

                    <a-col :span="24">
                      <label class="org-position-field-label"><span class="required" v-if="false">*</span>岗位参考薪资标准 (k)</label>
                      <div class="org-position-range">
                        <a-input-number
                          :value="getRangePart(position.postSalaryStandard, 0)"
                          :disabled="mode === 'detail'"
                          :min="0"
                          :precision="0"
                          placeholder="最低"
                          @change="setRangePart(position, 'postSalaryStandard', 0, $event)"
                        />
                        <span>-</span>
                        <a-input-number
                          :value="getRangePart(position.postSalaryStandard, 1)"
                          :disabled="mode === 'detail'"
                          :min="0"
                          :precision="0"
                          placeholder="最高"
                          @change="setRangePart(position, 'postSalaryStandard', 1, $event)"
                        />
                      </div>
                    </a-col>
                    <a-col :xs="24" :sm="12">
                      <label class="org-position-field-label">用于流程身份</label>
                      <a-select v-model="position.processIdentity" :disabled="mode === 'detail'" allowClear placeholder="请选择">
                        <a-select-option v-for="item in processIdentityOptions" :key="item.value" :value="item.value">
                          {{ item.label }}
                        </a-select-option>
                      </a-select>
                    </a-col>
                    <a-col :xs="24" :sm="12">
                      <label class="org-position-field-label">岗位编制</label>
                      <a-input-number
                        v-model="position.staffingQuota"
                        :disabled="mode === 'detail'"
                        :min="0"
                        :precision="0"
                        placeholder="请输入"
                        class="position-number"
                      />
                    </a-col>

                    <a-col :xs="24" :sm="12">
                      <label class="org-position-field-label">是否重点职业健康监测对象</label>
                      <a-select v-model="position.isKeyOhMonitoring" :disabled="mode === 'detail'" placeholder="请选择">
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
                      <a-input-number v-model="position.qsnl" :disabled="mode === 'detail'" :min="0" :precision="0" placeholder="请输入" />
                    </a-col>
                    <a-col :xs="24" :sm="12">
                      <label class="org-position-field-label">截止年龄</label>
                      <a-input-number v-model="position.jznl" :disabled="mode === 'detail'" :min="0" :precision="0" placeholder="请输入" />
                    </a-col>
                    <a-col :xs="24" :sm="12">
                      <label class="org-position-field-label">性别</label>
                      <a-select v-model="position.sex" :disabled="mode === 'detail'" allowClear placeholder="不限">
                        <a-select-option v-for="item in genderOptions" :key="item.value" :value="item.value">
                          {{ item.label }}
                        </a-select-option>
                      </a-select>
                    </a-col>
                    <a-col :xs="24" :sm="12">
                      <label class="org-position-field-label">学历</label>
                      <a-select v-model="position.educationRequirement" :disabled="mode === 'detail'" allowClear placeholder="不限">
                        <a-select-option v-for="item in educationOptions" :key="item" :value="item">
                          {{ item }}
                        </a-select-option>
                      </a-select>
                    </a-col>
                    <a-col :xs="24" :sm="12">
                      <label class="org-position-field-label">专业</label>
                      <a-input v-model.trim="position.zy" :disabled="mode === 'detail'" placeholder="请输入专业" />
                    </a-col>
                    <a-col :xs="24" :sm="12">
                      <label class="org-position-field-label">工作经验</label>
                      <a-select v-model="position.gzjy" :disabled="mode === 'detail'" allowClear placeholder="经验不限">
                        <a-select-option v-for="item in experienceOptions" :key="item" :value="item">
                          {{ item }}
                        </a-select-option>
                      </a-select>
                    </a-col>
                    <a-col :span="24">
                      <label class="org-position-field-label">任职要求</label>
                      <textarea
                        v-model.trim="position.rzyq"
                        :disabled="mode === 'detail'"
                        class="org-position-textarea"
                        rows="3"
                        placeholder="请输入任职要求"
                      ></textarea>
                    </a-col>
                    <a-col :span="24">
                      <label class="org-position-field-label">岗位职责</label>
                      <textarea
                        v-model.trim="position.fwzz"
                        :disabled="mode === 'detail'"
                        class="org-position-textarea"
                        rows="3"
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
                      <div
                        class="org-level-main"
                        :class="{ 'is-readonly': mode === 'detail' }"
                        @click="openLevelEditor(positionIndex, level, levelIndex)"
                      >
                        <div class="org-level-name">{{ level.levelName || '未命名职级' }}</div>
                        <div class="org-level-meta">
                          薪资：{{ level.levelSalaryRange || '-' }} | 在职：{{ level.employeeCount || 0 }}人
                        </div>
                      </div>
                      <a
                        v-if="mode !== 'detail'"
                        class="org-level-delete"
                        @click.stop="removeLevel(positionIndex, levelIndex)"
                      >删除</a>
                    </div>
                  </div>
                  <a-empty v-else :description="mode === 'detail' ? '暂无职级配置' : '暂无职级，点击下方新增'" />
                  <a-button v-if="mode !== 'detail'" class="org-level-add" block @click="openLevelEditor(positionIndex)">
                    <a-icon type="plus" />
                    新增职级
                  </a-button>
                </section>
              </div>
            </article>
          </div>
          <a-empty v-else :description="mode === 'detail' ? '暂无岗位信息' : '暂无岗位，点击下方添加'" />
        </a-spin>

      </section>
    </a-modal>
    <!-- 职级弹窗 -->
    <a-modal
      :visible="levelEditorVisible"
      :title="levelEditorTitle"
      :width="780"
      :okText="mode === 'detail' ? '关闭' : '确定'"
      cancelText="取消"
      destroyOnClose
      :wrapClassName="levelEditorWrapClassName"
      @ok="handleLevelEditorOk"
      @cancel="closeLevelEditor"
    >
      <a-row :gutter="18" class="inline-level-layout" :class="{ 'is-detail-mode': mode === 'detail' }">
        <a-col :xs="24" :md="12" class="position-form-col-wrap">
          <section class="position-form-col">
            <div class="position-form-col-title">基本信息</div>
            <a-row :gutter="12" class="position-form-grid">
              <a-col :span="24">
                <div class="position-form-item">
                  <label class="position-form-label"><span class="required">*</span>职级名称</label>
                  <a-input v-model.trim="levelForm.levelName" :disabled="mode === 'detail'" placeholder="请输入职级名称" />
                </div>
              </a-col>

              <a-col :span="24">
                <div class="position-form-item">
                  <label class="position-form-label"><span class="required" v-if="false">*</span>职级薪资范围 (k)</label>
                  <div class="salary-range-input">
                    <a-input-number
                      v-model="levelSalaryRangeMin"
                      :disabled="mode === 'detail'"
                      :min="0"
                      :precision="0"
                      placeholder="最低"
                    />
                    <span class="salary-range-separator">-</span>
                    <a-input-number
                      v-model="levelSalaryRangeMax"
                      :disabled="mode === 'detail'"
                      :min="0"
                      :precision="0"
                      placeholder="最高"
                    />
                  </div>
                </div>
              </a-col>

              <!-- <a-col :span="24">
                <div class="position-form-item">
                  <label class="position-form-label">职级在职人数</label>
                  <a-input-number
                    v-model="levelForm.employeeCount"
                    :min="0"
                    :precision="0"
                    placeholder="请输入职级在职人数"
                    class="position-number"
                  />
                </div>
              </a-col> -->
            </a-row>
          </section>
        </a-col>

        <a-col :xs="24" :md="12" class="position-form-col-wrap">
          <section class="position-form-col">
            <div class="position-form-col-title">职位晋升标准</div>
            <a-row :gutter="12" class="position-form-grid">
              <a-col :xs="24" :sm="12">
                <div class="position-form-item">
                  <label class="position-form-label">学历</label>
                  <a-select v-model="levelForm.xl" :disabled="mode === 'detail'" allowClear placeholder="不限">
                    <a-select-option v-for="item in educationOptions" :key="item" :value="item">
                      {{ item }}
                    </a-select-option>
                  </a-select>
                </div>
              </a-col>

              <a-col :xs="24" :sm="12">
                <div class="position-form-item">
                  <label class="position-form-label">工作经验</label>
                  <a-select v-model="levelForm.gzjy" :disabled="mode === 'detail'" allowClear placeholder="经验不限">
                    <a-select-option v-for="item in experienceOptions" :key="item" :value="item">
                      {{ item }}
                    </a-select-option>
                  </a-select>
                </div>
              </a-col>

              <a-col :span="24">
                <div class="position-form-item">
                  <label class="position-form-label">知识传递与积累</label>
                  <textarea
                    v-model.trim="levelForm.zscdyjl"
                    :disabled="mode === 'detail'"
                    class="position-textarea"
                    rows="2"
                  ></textarea>
                </div>
              </a-col>

              <a-col :span="24">
                <div class="position-form-item">
                  <label class="position-form-label">任职要求（问题解决和工作成果）</label>
                  <textarea
                    v-model.trim="levelForm.rzyq"
                    :disabled="mode === 'detail'"
                    class="position-textarea"
                    rows="2"
                  ></textarea>
                </div>
              </a-col>

              <a-col :span="24">
                <div class="position-form-item">
                  <label class="position-form-label">岗位职责</label>
                  <textarea
                    v-model.trim="levelForm.gwzz"
                    :disabled="mode === 'detail'"
                    class="position-textarea"
                    rows="2"
                  ></textarea>
                </div>
              </a-col>
            </a-row>
          </section>
        </a-col>
      </a-row>
    </a-modal>
  </div>
</template>

<script>
import { deleteAction } from '@/api/manage'

function cloneDeep(value) {
  if (value === undefined || value === null) {
    return value
  }
  return JSON.parse(JSON.stringify(value))
}

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
    salaryType: '月薪',
    postSalaryStandard: '',
    educationRequirement: '',
    qsnl: null,
    jznl: null,
    sex: '',
    zy: '',
    gzjy: '',
    rzyq: '',
    fwzz: '',
    processIdentity: '',
    hrJobLevels: []
  }
}

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
  name: 'PositionFormModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'create'
    },
    value: {
      type: [Object, Array],
      default: null
    },
    confirmLoading: {
      type: Boolean,
      default: false
    },
    deleteUrl: {
      type: String,
      default: '/hrJobSequence/hrJobSequence/delete'
    },
    sequenceOptions: {
      type: Array,
      default: () => []
    },
    educationOptions: {
      type: Array,
      default: () => []
    },
    salaryTypeOptions: {
      type: Array,
      default: () => []
    },
    experienceOptions: {
      type: Array,
      default: () => []
    },
    genderOptions: {
      type: Array,
      default: () => []
    },
    processIdentityOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      modelList: [],
      positionLoading: false,
      positionExpandedKeys: [],
      rowKeySeed: 0,
      levelEditorVisible: false,
      levelEditorMode: 'create',
      levelEditPositionIndex: -1,
      levelEditIndex: -1,
      levelForm: createEmptyLevelForm()
    }
  },
  computed: {
    modalTitle() {
      if (this.mode === 'detail') {
        return '详情'
      }
      return this.mode === 'edit' ? '编辑岗位' : '新增岗位'
    },
    levelEditorTitle() {
      if (this.mode === 'detail') {
        return '职级详情'
      }
      return this.levelEditorMode === 'edit' ? '编辑职级' : '新增职级'
    },
    levelEditorWrapClassName() {
      return this.mode === 'detail' ? 'job-level-modal-wrap job-level-detail-modal-wrap' : 'job-level-modal-wrap'
    },
    configTip() {
      if (this.mode === 'detail') {
        return '岗位详情 只允许查看当前岗位信息，不提供编辑入口'
      }
      return this.mode === 'edit'
        ? '编辑时只允许修改当前岗位，不提供新增和删除入口'
        : '新增时支持一次维护多个岗位，已保存岗位也可直接删除'
    },
    levelSalaryRangeMin: {
      get() {
        return this.getRangePart(this.levelForm.levelSalaryRange, 0)
      },
      set(value) {
        this.setRangePart(this.levelForm, 'levelSalaryRange', 0, value)
      }
    },
    levelSalaryRangeMax: {
      get() {
        return this.getRangePart(this.levelForm.levelSalaryRange, 1)
      },
      set(value) {
        this.setRangePart(this.levelForm, 'levelSalaryRange', 1, value)
      }
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.syncModel()
      }
    },
    value() {
      if (this.visible) {
        this.syncModel()
      }
    }
  },
  methods: {
    removeLastSlash(str = '') {
      return str.replace(/\/$/, '')
    },
    // 2. 取最后一级：总经办
    getLastLevel(str = '') {
      return this.removeLastSlash(str).split('/').pop() || ''
    },
    formatDeptPath(path) {
    return path ? path.replace(/\/+$/, '') : ''
    },
    createRowKey(prefix) {
      this.rowKeySeed += 1
      return prefix + '-' + Date.now() + '-' + this.rowKeySeed
    },
    getRangePart(value, index) {
      const part = String(value || '').replace(/[kK]/g, '').split('-')[index]
      if (part === undefined || part === null || part.trim() === '') {
        return undefined
      }
      const numberValue = Number(part.trim())
      return Number.isNaN(numberValue) ? undefined : numberValue
    },
    setRangePart(target, field, index, value) {
      const parts = String(target[field] || '').replace(/[kK]/g, '').split('-')
      const nextValue = value === undefined || value === null || value === '' ? '' : String(value)
      const min = index === 0 ? nextValue : (parts[0] || '').trim()
      const max = index === 1 ? nextValue : (parts[1] || '').trim()
      target[field] = min || max ? min + '-' + max : ''
    },
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
    syncModel() {
      // 编辑和详情态只保留当前这条岗位；新增态才允许一次维护多条。
      const sourceList = Array.isArray(this.value) ? this.value : (this.value ? [this.value] : [])
      const editableList = this.mode === 'create' ? sourceList : sourceList.slice(0, 1)
      const nextList = editableList.length ? editableList : [createEmptyPositionForm()]
      this.modelList = nextList.map(item => this.createPositionItem(item))
      this.positionExpandedKeys = this.modelList.length ? [this.modelList[0]._rowKey] : []
      this.positionLoading = false
      this.closeLevelEditor()
    },
    isPositionExpanded(position) {
      return position && this.positionExpandedKeys.indexOf(position._rowKey) > -1
    },
    togglePosition(position) {
      if (!position) {
        return
      }
      const index = this.positionExpandedKeys.indexOf(position._rowKey)
      if (index > -1) {
        this.positionExpandedKeys.splice(index, 1)
      } else {
        this.positionExpandedKeys.push(position._rowKey)
      }
    },
    addPosition() {
      if (this.mode !== 'create') {
        return
      }
      // 新增时沿用第一条岗位的部门和序列，避免重复选择。
      const base = this.modelList[0] || {}
      const position = this.createPositionItem({
        companyId: base.companyId || '',
        dept: base.dept || '',
        deptId: base.deptId || '',
        gwsl: base.gwsl || ''
      })
      this.modelList.push(position)
      this.positionExpandedKeys = [position._rowKey]
    },
    removePositionLocal(positionIndex) {
      const position = this.modelList[positionIndex]
      if (!position) {
        return
      }
      this.modelList.splice(positionIndex, 1)
      this.positionExpandedKeys = this.positionExpandedKeys.filter(key => key !== position._rowKey)
      if (this.modelList.length && !this.positionExpandedKeys.length) {
        const fallbackIndex = Math.max(0, positionIndex - 1)
        this.positionExpandedKeys = [this.modelList[fallbackIndex]._rowKey]
      }
    },
    removePosition(positionIndex) {
      if (this.mode !== 'create') {
        return
      }
      const position = this.modelList[positionIndex]
      if (!position) {
        return
      }
      this.$confirm({
        title: '确认删除',
        content: '确定删除当前岗位及其职级配置吗？',
        okType: 'danger',
        onOk: () => {
          if (!position.id || !this.deleteUrl) {
            this.removePositionLocal(positionIndex)
            return Promise.resolve()
          }
          this.positionLoading = true
          return deleteAction(this.deleteUrl, { id: position.id }).then(res => {
            if (res.success) {
              this.removePositionLocal(positionIndex)
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
    openLevelEditor(positionIndex, level, levelIndex) {
      if (this.mode === 'detail' && !level) {
        return
      }
      const position = this.modelList[positionIndex]
      if (!position) {
        return
      }
      this.levelEditorMode = this.mode === 'detail' ? 'detail' : (level ? 'edit' : 'create')
      this.levelEditPositionIndex = positionIndex
      this.levelEditIndex = typeof levelIndex === 'number' ? levelIndex : -1
      this.levelForm = Object.assign(createEmptyLevelForm(), cloneDeep(level || {}), {
        postId: position.id || (level && level.postId) || '',
        _rowKey: (level && (level.id || level._rowKey)) || this.createRowKey('level')
      })
      this.levelEditorVisible = true
    },
    closeLevelEditor() {
      this.levelEditorVisible = false
      this.levelEditorMode = 'create'
      this.levelEditPositionIndex = -1
      this.levelEditIndex = -1
      this.levelForm = createEmptyLevelForm()
    },
    handleLevelEditorOk() {
      if (this.mode === 'detail') {
        this.closeLevelEditor()
        return
      }
      if (!this.levelForm.levelName) {
        this.$message.warning('请输入职级名称')
        return
      }
      // if (this.getRangePart(this.levelForm.levelSalaryRange, 0) === undefined || this.getRangePart(this.levelForm.levelSalaryRange, 1) === undefined) {
      //   this.$message.warning('请输入完整职级薪资范围')
      //   return
      // }

      const position = this.modelList[this.levelEditPositionIndex]
      if (!position) {
        this.closeLevelEditor()
        return
      }

      const levels = cloneDeep(position.hrJobLevels || [])
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
    removeLevel(positionIndex, levelIndex) {
      if (this.mode === 'detail') {
        return
      }
      const position = this.modelList[positionIndex]
      if (!position) {
        return
      }
      this.$confirm({
        title: '确认删除',
        content: '确定删除当前职级吗？',
        okType: 'danger',
        onOk: () => {
          const levels = cloneDeep(position.hrJobLevels || [])
          levels.splice(levelIndex, 1)
          this.$set(position, 'hrJobLevels', levels)
          this.$message.success('职级删除成功')
        }
      })
    },
    validatePositionList() {
      for (let i = 0; i < this.modelList.length; i++) {
        const position = this.modelList[i]
        const prefix = '第' + (i + 1) + '个岗位：'
        if (!position.postName) {
          return prefix + '请输入岗位名称'
        }
        // if (!position.gwsl) {
        //   return prefix + '请选择所属序列'
        // }
        // if (!position.salaryType) {
        //   return prefix + '请选择薪资类型'
        // }
        // if (this.getRangePart(position.postSalaryStandard, 0) === undefined || this.getRangePart(position.postSalaryStandard, 1) === undefined) {
        //   return prefix + '请输入完整岗位参考薪资标准'
        // }

        // const levels = position.hrJobLevels || []
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
    buildSubmitList() {
      // 提交前把页面上临时用的 _rowKey 清掉，只保留接口需要的字段。
      return this.modelList.map(position => {
        const payload = cloneDeep(position)
        delete payload._rowKey
        if (!Array.isArray(payload.hrJobLevels)) {
          payload.hrJobLevels = []
        }
        payload.hrJobLevels = payload.hrJobLevels.map(level => {
          const item = cloneDeep(level)
          delete item._rowKey
          // delete item.employeeCount
          if (payload.id) {
            item.postId = payload.id
          }
          return item
        })
        // delete payload.employeeCount
        delete payload.levels
        return payload
      })
    },
    handleOk() {
      if (this.mode === 'detail') {
        this.handleCancel()
        return
      }
      const message = this.validatePositionList()
      if (message) {
        this.$message.warning(message)
        return
      }
      this.$emit('ok', this.buildSubmitList())
    },
    handleCancel() {
      this.closeLevelEditor()
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped lang="less">
.position-form-modal {
  min-width: 0;
  color: var(--job-foreground, #1a2a3d);
  font-family: var(--job-font, 'Noto Sans SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif);
}

.position-config-section {
  min-width: 0;
}

.position-config-title {
  margin-bottom: 14px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  // color: #2563eb;
  font-size: 14px;
  font-weight: 700;
}

.position-config-title small {
  display: inline-block;
  margin-left: 10px;
  // color: rgba(37, 99, 235, 0.42);
  font-size: 13px;
  // font-weight: 500;
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
  // font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.org-position-card.active .org-position-name {
  // color: #2563eb;
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
  // font-size: 12px;
  // font-weight: 600;
  line-height: 18px;
}

.org-position-card-body /deep/ .ant-row > .ant-col,
.inline-level-layout /deep/ .ant-row > .ant-col {
  margin-bottom: 12px;
}

.org-position-card-body /deep/ .ant-select,
.org-position-card-body /deep/ .ant-input-number,
.position-form-item /deep/ .ant-select,
.position-form-item /deep/ .ant-input-number {
  width: 100% !important;
  min-width: 0;
}

.org-position-card-body /deep/ .ant-input,
.org-position-card-body /deep/ .ant-select-selection,
.org-position-card-body /deep/ .ant-input-number,
.position-form-item /deep/ .ant-input,
.position-form-item /deep/ .ant-select-selection,
.position-form-item /deep/ .ant-input-number {
  width: 100%;
  border-color: #dbe7ff;
  border-radius: 6px;
  background: #fff;
  color: var(--job-foreground, #1a2a3d);
  box-shadow: none;
  transition: all 0.2s ease;
  height: 38px;
}

.org-position-card-body /deep/ .ant-input-number-input,
.position-form-item /deep/ .ant-input-number-input {
  height: 36px;
  line-height: 36px;
}

.org-position-card-body /deep/ .ant-select-selection--single,
.position-form-item /deep/ .ant-select-selection--single {
  height: 38px;
}

.org-position-card-body /deep/ .ant-select-selection__rendered,
.position-form-item /deep/ .ant-select-selection__rendered {
  margin-right: 32px;
  margin-left: 12px;
  line-height: 36px;
}

.org-position-range,
.salary-range-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.org-position-range span,
.salary-range-separator {
  color: #6b7280;
  font-size: 16px;
}

.org-position-range /deep/ .ant-input-number,
.salary-range-input /deep/ .ant-input-number {
  flex: 1;
  width: 100% !important;
  min-width: 0;
}

.org-position-textarea,
.position-textarea {
  width: 100%;
  min-height: 64px;
  padding: 8px 10px;
  border: 1px solid #dbe7ff;
  border-radius: 6px;
  background: #fff;
  color: #1a2a3d;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  transition: all 0.2s ease;
}

.org-position-textarea:focus,
.position-textarea:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.position-config-section.is-detail-mode /deep/ .ant-input[disabled],
.position-config-section.is-detail-mode /deep/ .ant-select-disabled .ant-select-selection,
.position-config-section.is-detail-mode /deep/ .ant-input-number-disabled,
.position-config-section.is-detail-mode /deep/ .ant-input-number-disabled .ant-input-number-input,
.position-config-section.is-detail-mode .org-position-textarea:disabled,
.position-config-section.is-detail-mode .position-textarea:disabled {
  background: #f8fafd;
  color: #1a2a3d;
  cursor: default;
}

.position-config-section.is-detail-mode .org-position-textarea:disabled,
.position-config-section.is-detail-mode .position-textarea:disabled {
  opacity: 1;
  resize: none;
}

.inline-level-layout.is-detail-mode /deep/ .ant-input[disabled],
.inline-level-layout.is-detail-mode /deep/ .ant-select-disabled .ant-select-selection,
.inline-level-layout.is-detail-mode /deep/ .ant-input-number-disabled,
.inline-level-layout.is-detail-mode /deep/ .ant-input-number-disabled .ant-input-number-input,
.inline-level-layout.is-detail-mode .position-textarea:disabled {
  background: #f8fafd;
  color: #1a2a3d;
  cursor: default;
}

.inline-level-layout.is-detail-mode .position-textarea:disabled {
  opacity: 1;
  resize: none;
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

.org-level-main.is-readonly {
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

.inline-level-layout {
  min-height: 320px;
}

.position-form-col-wrap {
  min-width: 0;
}

.position-form-col {
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.position-form-col-wrap + .position-form-col-wrap .position-form-col {
  padding-left: 16px;
  border-left: 1px solid var(--job-border, #e8e8e8);
}

.position-form-col-title {
  margin-bottom: 2px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--job-primary-light, #e6f7ff);
  // color: var(--job-primary, #1890ff);
  font-size: 14px;
  font-weight: 600;
}

.position-form-grid {
  align-content: start;
  margin-bottom: -12px;
}

.position-form-grid > .ant-col {
  margin-bottom: 12px;
}

.position-form-item {
  min-width: 0;
  margin-bottom: 0;
  overflow: hidden;
}

.position-form-label {
  display: block;
  margin-bottom: 4px;
  // color: var(--job-foreground, #1a2a3d);
  font-size: 13px;
  // font-weight: 500;
  line-height: 1.5;
}

.required {
  margin-right: 2px;
  color: #ff4d4f;
}

.position-number {
  width: 100%;
}

@media (max-width: 1199px) {
  .position-form-col-wrap + .position-form-col-wrap .position-form-col {
    padding-left: 0;
    border-left: none;
  }
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

@media (max-width: 980px) {
  .inline-level-layout {
    min-height: 0;
  }

  .position-form-col-wrap + .position-form-col-wrap .position-form-col {
    padding-top: 16px;
    padding-left: 0;
    border-top: 1px solid var(--job-border, #e8e8e8);
    border-left: none;
  }
}
</style>

<style lang="less">
.job-form-modal-wrap,
.job-level-modal-wrap {
  --job-primary: #1890ff;
  --job-primary-rgb: 24, 144, 255;
  // --job-primary-light: #e6f7ff;
  --job-foreground: #1a2a3d;
  --job-muted: #f1f5f9;
  --job-muted-foreground: #8c8c8c;
  // --job-border: #e8e8e8;

  .ant-modal {
    max-width: 97vw;
  }

  .ant-modal-content {
    overflow: hidden;
    border-radius: 10px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
  }

  .ant-modal-header {
    padding: 22px 28px 0;
    border-bottom: none;
    border-radius: 10px 10px 0 0;
  }

  .ant-modal-title {
    color: var(--job-foreground);
    font-size: 16px;
    font-weight: 600;
    line-height: 1.5;
  }

  .ant-modal-close-x {
    width: 48px;
    height: 48px;
    line-height: 48px;
  }

  .ant-modal-body {
    padding: 16px 28px 20px;
  }

  .ant-modal-footer {
    margin: 0 28px;
    padding: 16px 0 20px;
    border-top: 1px solid var(--job-border);
  }

  .ant-modal-footer .ant-btn {
    height: 34px;
    padding: 0 16px;
    border-radius: 6px;
    font-size: 13px;
  }

  .ant-modal-footer .ant-btn-primary {
    border-color: var(--job-primary);
    background: var(--job-primary);
    box-shadow: 0 2px 6px rgba(var(--job-primary-rgb), 0.25);
  }
}
</style>
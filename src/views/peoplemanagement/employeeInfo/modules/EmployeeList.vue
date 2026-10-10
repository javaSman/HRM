<template>
  <div class="employee-list-panel">
    <!-- <div class="employee-context-header">
      <div class="employee-context-badge">
        <a-icon type="environment" />
        <span class="ctx-level" :class="'l' + orgContext.level">{{ orgContext.levelText }}</span>
        <span class="ctx-name">{{ orgContext.name }}</span>
        <span class="ctx-desc">{{ orgContext.desc }}</span>
      </div>
    </div> -->

    <div class="employee-stat-bar">
      <div v-for="item in statCards" :key="item.key" class="employee-stat-card">
        <div class="stat-icon" :class="item.theme">
          <a-icon :type="item.icon" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-label">{{ item.label }}</div>
          <!-- <div v-if="item.sub" class="stat-sub">{{ item.sub }}</div> -->
        </div>
      </div>
    </div>

    <nav class="employee-toolbar">
      <div class="employee-filter-group employee-tab-switch">
        <button
          v-for="item in employeeStatusTabs"
          :key="item.value"
          type="button"
          class="employee-filter-btn"
          :class="{ active: employeeStatus === item.value }"
          @click="setEmployeeStatus(item.value)"
        >
          <a-icon :type="item.icon" />
          {{ item.label }}
        </button>
      </div>

      <a-button v-if="orgContext.level > 1" type="primary" icon="plus" class="employee-add-btn" @click="handleAddEmployee">新增员工</a-button>

      <!-- <a-button icon="hdd" class="employee-recycle-btn" @click="openRecycleBin">回收站</a-button> -->

      <div class="employee-view-toggle items-center">
        <!-- <div style="margin-left: 4px">是否显示领导</div>
        <j-switch v-model="queryParam.sfjld" :options="['是', '否']" @change="searchQuery" /> -->
        <button
          type="button"
          class="employee-view-btn"
          :class="{ active: viewMode === 'grid' }"
          @click="setViewMode('grid')"
        >
          <a-icon type="appstore" />
        </button>
        <button
          type="button"
          class="employee-view-btn"
          :class="{ active: viewMode === 'list' }"
          @click="setViewMode('list')"
        >
          <a-icon type="bars" />
        </button>
      </div>
    </nav>

    <div class="employee-filter-bar">
      <div class="employee-search-wrap">
        <a-input
          v-model.trim="queryParam.queryFileds"
          class="employee-search"
          allowClear
          placeholder="搜索员工姓名、工号..."
          @pressEnter="searchQuery"
          @change="handleKeywordChange"
        >
          <a-icon slot="prefix" type="search" />
        </a-input>
      </div>
      <!-- <hrm-super-query :fieldList="superFieldList" ref="superQueryModal" @handleSuperQuery="handleSuperQuery"></hrm-super-query> -->
      <!--
      <JDictSelectTagMultiple
        selectWidth="180"
        class="employee-filter-select"
        type="list"
        :options="constractBelongOptions"
        v-model="queryParam.constractBelong"
        placeholder="合同归属"
      /> -->

      <div class="employee-date-filter employee-contract-filter">
        <span class="employee-date-filter-label">合同归属</span>
        <a-select
          v-model="queryParam.constractBelong"
          class="employee-contract-select"
          mode="multiple"
          placeholder="请选择"
          :default-value="[]"
          style="width: 200px"
          :maxTagTextLength="17"
          :maxTagCount="1"
          @change="handleFilterChange('constractBelong', $event)"
        >
          <a-select-option v-for="i in constractBelongOptions" :key="i.value" :value="i.value">
            {{ i.label }}
          </a-select-option>
        </a-select>
      </div>
      <div class="employee-date-filter employee-contract-filter">
        <span class="employee-date-filter-label">合同类型</span>
        <a-select
          v-model="queryParam.constractType"
          class="employee-contract-select"
          mode="multiple"
          placeholder="请选择"
          :default-value="[]"
          style="width: 200px"
          :maxTagTextLength="17"
          :maxTagCount="1"
          @change="handleFilterChange('constractType', $event)"
        >
          <a-select-option v-for="i in constractTypeOptions" :key="i.value" :value="i.value">
            {{ i.text || i.label || i.title || i.value }}
          </a-select-option>
        </a-select>
      </div>

      <div v-if="employeeStatus === '已入职'" class="employee-date-filter">
        <span class="employee-date-filter-label">入职日期</span>
        <a-range-picker
          v-model="entryDateRange"
          class="employee-date-range-picker"
          format="YYYY-MM-DD"
          valueFormat="YYYY-MM-DD"
          :placeholder="['开始日期', '结束日期']"
          @change="handleEntryDateRangeChange"
        />
        <button
          v-if="hasSearchCondition"
          type="button"
          class="employee-date-clear"
          title="重置筛选"
          @click="searchReset"
        >
          重置
        </button>
      </div>

      <div v-if="employeeStatus === '已离职'" class="employee-date-filter">
        <span class="employee-date-filter-label">离职日期</span>
        <a-range-picker
          v-model="formalResignDateRange"
          class="employee-date-range-picker"
          format="YYYY-MM-DD"
          valueFormat="YYYY-MM-DD"
          :placeholder="['开始日期', '结束日期']"
          @change="handleFormalResignDateRangeChange"
        />
        <button
          v-if="hasSearchCondition"
          type="button"
          class="employee-date-clear"
          title="重置筛选"
          @click="searchReset"
        >
          重置
        </button>
      </div>
    </div>

    <div class="employee-grid-wrap">
      <a-spin :spinning="loading">
        <a-empty v-if="!dataSource.length" class="employee-empty" :description="emptyDescription" />
        <div v-else>
          <div v-for="(item, index) in dataSource" :key="item + index">
            <div class="flex gap-10 items-center em-tag-box">
              <span class="tag">{{ item.label }}</span>
              <span class="num">{{ item.children && item.children.length }}人</span>
              <div class="line"></div>
            </div>
            <div class="employee-card-grid" :class="{ 'list-view': viewMode === 'list' }">
              <div
                v-for="(subItem, i) in item.children"
                :key="subItem.id || subItem.userId || subItem.username || i"
                class="employee-card-dropdown"
              >
                <a-dropdown :trigger="['contextmenu']">
                  <article
                    class="employee-card"
                    :class="getEmployeeCardClass(subItem)"
                    :style="{ animationDelay: i * 60 + 'ms' }"
                    tabindex="0"
                    @click="openDetail(subItem)"
                    @keyup.enter="openDetail(subItem)"
                    @contextmenu.prevent
                  >
                    <div class="employee-online-badge" :class="getOnlineClass(subItem)">
                      <span class="online-dot"></span>
                      {{ getOnlineText(subItem) }}
                    </div>

                    <div class="card-top">
                      <img
                        v-if="getAvatarUrl(subItem)"
                        class="card-avatar"
                        :src="getAvatarUrl(subItem)"
                        :alt="getEmployeeName(subItem)"
                      />
                      <span v-else class="card-avatar-fallback">{{ getAvatarText(subItem) }}</span>
                      <div class="card-info">
                        <div class="card-name">
                          <span class="card-name-text">{{ getEmployeeName(subItem) }}</span>
                          <span
                            v-if="subItem.isDeptMain && subItem.isDeptMain === 1"
                            class="card-contract-type tag-leader"
                          >
                            部门负责人
                          </span>
                          <!-- <span v-if="getContractType(subItem)" class="card-contract-type">
                            {{ getContractType(subItem) }}
                          </span> -->
                          <span v-if="getEmployeeRank(subItem) !== '-'" class="card-rank">{{
                            getEmployeeRank(subItem)
                          }}</span>
                        </div>
                        <div class="card-position">
                          <span class="card-position-text">{{ getEmployeePosition(subItem) }}</span>
                          <span v-if="getPostRemark(subItem)" class="card-post-remark">{{
                            getPostRemark(subItem)
                          }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="card-details">
                      <div class="card-detail">
                        <a-icon type="bank" />
                        <span class="card-detail-text">{{ formatEmpty(subItem.dept_dictText) }}</span>
                      </div>
                      <div class="card-detail">
                        <a-icon type="mail" />
                        <span>{{ formatEmpty(subItem.email) }}</span>
                      </div>
                      <div class="card-detail">
                        <a-icon type="phone" />
                        <span>{{ formatEmpty(subItem.phoneNumber) }}</span>
                      </div>
                    </div>

                    <div class="list-meta">
                      <span class="list-meta-item">
                        <a-icon type="bank" />
                        {{ formatEmpty(subItem.dept_dictText) }}
                      </span>
                      <span class="list-meta-item">
                        <a-icon type="mail" />
                        {{ formatEmpty(subItem.email) }}
                      </span>
                      <span class="list-meta-item">
                        <a-icon type="phone" />
                        {{ formatEmpty(subItem.phoneNumber) }}
                      </span>
                    </div>

                    <div class="card-bottom">
                      <div class="card-bottom-meta flex-1 justify-between">
                        <span class="card-id">{{ getEmployeeNo(subItem) }}</span>
                        <span v-if="isOnJob(subItem)" class="card-type" :class="getTypeClass(getEmployeeType(subItem))">
                          {{ getEmployeeType(subItem) }}
                        </span>
                        <span v-else class="card-resign-date">{{ getResignDateText(subItem) }}</span>
                      </div>
                      <!-- <div class="card-actions">
                <span class="card-action-link" @click.stop="handleEdit(subItem)">编辑</span>
                <a-popconfirm title="确认删除该员工吗？" @confirm="() => handleDelete(subItem)">
                  <span class="card-action-link danger" @click.stop>删除</span>
                </a-popconfirm>
              </div> -->
                    </div>
                  </article>
                  <a-menu slot="overlay" @click="({ key, domEvent }) => handleCardMenuClick(key, subItem, domEvent)">
                    <!-- <a-menu-item key="edit" v-if="employeeStatus !== '已离职'"> -->
                    <a-menu-item key="edit">
                      <a-icon type="edit" />
                      编辑
                    </a-menu-item>
                    <!-- <a-menu-item key="resign"> -->
                    <a-menu-item v-if="employeeStatus !== '已离职'" key="resign">
                      <a-icon type="user-delete" />
                      离职
                    </a-menu-item>
                    <!-- <a-menu-divider v-if="employeeStatus !== '已离职'" /> -->
                    <!-- <a-menu-item key="delete">
                      <a-icon type="delete" />
                      删除
                    </a-menu-item> -->
                  </a-menu>
                </a-dropdown>
              </div>
            </div>
          </div>
        </div>
      </a-spin>

      <div v-if="ipagination.total > 0" class="employee-pagination">
        <a-pagination
          size="small"
          :current="ipagination.current"
          :pageSize="ipagination.pageSize"
          :pageSizeOptions="ipagination.pageSizeOptions"
          :total="ipagination.total"
          :showTotal="showTotal"
          showSizeChanger
          @change="handlePageChange"
          @showSizeChange="handlePageChange"
        />
      </div>
    </div>

    <employee-detail
      :visible="detailVisible"
      :employee="selectedEmployee"
      :department="department"
      :constractBelongOptions="constractBelongOptions"
      @close="closeDetail"
    />

    <employee-form-modal ref="employeeFormModal" :constractBelongOptions="constractBelongOptions" @ok="modalFormOk" />
    <employee-resign-modal ref="employeeResignModal" @ok="handleResignOk" />
    <employee-recycle-bin-modal ref="recycleBinModal" :restore-handler="handleRestBack" @ok="handleRecycleBinOk" />
  </div>
</template>

<script>
import { deleteAction, getAction, getFileAccessHttpUrl } from '@/api/manage'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import EmployeeDetail from './EmployeeDetail.vue'
import EmployeeFormModal from './EmployeeFormModal.vue'
import EmployeeRecycleBinModal from './EmployeeRecycleBinModal.vue'
import EmployeeResignModal from './EmployeeResignModal.vue'
import { initDictOptions } from '@/components/dict/JDictSelectUtil'
import { getDictItemsFromCache } from '@/api/api'

function getDefaultQueryParam() {
  return {
    deleteFlag: '\u5426',
  }
}

export default {
  name: 'EmployeeList',
  mixins: [JeecgListMixin],
  components: {
    EmployeeDetail,
    EmployeeFormModal,
    EmployeeRecycleBinModal,
    EmployeeResignModal,
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
    treeData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      // superFieldList:[],
      disableMixinCreated: true,
      currentOrgId: '',
      queryParam: getDefaultQueryParam(),
      isorter: {
        column: 'px',
        order: 'asc',
      },
      employeeStatus: '已入职',
      typeFilter: 'all',
      sortMode: 'px',
      viewMode: 'grid',
      detailVisible: false,
      selectedEmployee: null,
      entryDateRange: [],
      formalResignDateRange: [],
      constractTypeOptions: [],
      searchTimer: null,
      ipagination: {
        current: 1,
        pageSize: 12,
        pageSizeOptions: ['12', '24', '48'],
        total: 0,
      },
      employeeStatusTabs: [
        { label: '正式员工', value: '已入职', icon: 'team' },
        { label: '离职员工', value: '已离职', icon: 'user-delete' },
      ],
      typeFilters: [
        { label: '全部', value: 'all', queryValue: '' },
        { label: '正式', value: 'regular', queryValue: '正式' },
        { label: '试用期', value: 'probation', queryValue: '试用期' },
        { label: '实习', value: 'intern', queryValue: '实习' },
        { label: '外包', value: 'outsource', queryValue: '外包' },
      ],
      url: {
        // list: '/hrm/hrEmployeeInformation/list'
        list: '/hrm/hrEmployeeInformation/childrenList',
        delete: '/hrm/hrEmployeeInformation/deleteBatch',
        returnBack: '/hrm/hrEmployeeInformation/rturnBackSys',
        // /hrm/hrEmployeeInformation/delete
      },
    }
  },
  computed: {
    constractBelongOptions() {
      if (this.treeData && this.treeData.length) {
        const list = this.treeData[0].children.map((item) => ({ label: item.name, value: item.name }))
        list.unshift({ label: '请选择', value: '' })
        return list
      } else {
        return []
      }
    },
    emptyDescription() {
      if (!this.currentOrgId) {
        return '请先选择左侧组织'
      }
      if (this.employeeStatus === '已离职') {
        return '当前组织暂无离职员工'
      }
      if (
        this.queryParam.name ||
        this.queryParam.queryFileds ||
        this.queryParam.constractBelong ||
        this.queryParam.constractType ||
        this.queryParam.entryDateBegin ||
        this.queryParam.entryDateEnd ||
        this.queryParam.formalResignDateBegin ||
        this.queryParam.formalResignDateEnd ||
        this.typeFilter !== 'all'
      ) {
        return '未找到匹配的员工'
      }
      return '当前组织暂无员工'
    },
    hasSearchCondition() {
      return Boolean(
        this.queryParam.name ||
          this.queryParam.queryFileds ||
          this.queryParam.constractBelong ||
          this.queryParam.constractType ||
          this.queryParam.entryDateBegin ||
          this.queryParam.entryDateEnd ||
          this.queryParam.formalResignDateBegin ||
          this.queryParam.formalResignDateEnd ||
          this.typeFilter !== 'all' ||
          this.employeeStatus !== '已入职'
      )
    },
    orgContext() {
      const node = this.findTreeNodeById(this.treeData, this.currentOrgId) || this.department || {}
      const level = this.getOrgLevel(node)
      const levelTextMap = {
        1: '一级·集团',
        2: '二级·公司',
        3: '三级·部门',
        4: '四级·子部门',
      }
      return {
        level,
        levelText: levelTextMap[level] || levelTextMap[4],
        name: node.title || node.name || this.departmentTitle,
        desc: this.getOrgDesc(node),
      }
    },
    statCards() {
      const deptList = this.dataSource
        .map((item) => item.children)
        .flat()
        .map((item) => item.dept)
      const list = [...new Set(deptList)].length
      console.log('deptList', deptList)
      console.log('list', list)
      return [
        { key: 'total', label: '员工总数', value: this.ipagination.total, icon: 'team', theme: 'blue' },
        // { key: 'online', label: '在职/在线', value: online, icon: 'check-circle', theme: 'green' },
        // { key: 'regular', label: '正式员工', value: regular, icon: 'idcard', theme: 'cyan' },
        // { key: 'dept', label: '涉及部门', value: list, icon: 'bank', theme: 'orange' },
      ]
    },
    departmentTitle() {
      if (this.department && this.department.title) {
        return this.department.title
      }
      return '当前组织'
    },
  },
  watch: {
    orgId: {
      immediate: true,
      handler(val) {
        this.currentOrgId = val === undefined || val === null ? '' : val
        this.closeDetail(true)
      },
    },
  },
  created() {
    this.initDictConfig()
  },
  beforeDestroy() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer)
    }
  },
  methods: {
    loadData(arg) {
      if (this.currentOrgId === '' || this.currentOrgId === null || this.currentOrgId === undefined) {
        this.dataSource = []
        this.ipagination.total = 0
        return
      }
      this.loadData2(arg)
    },
    loadData2(arg) {
      if (!this.url.list) {
        this.$message.error('请设置url.list属性!')
        return
      }
      //加载数据 若传入参数1则加载第一页的内容
      if (arg === 1) {
        this.ipagination.current = 1
      }
      var params = this.getQueryParams() //查询条件
      this.loading = true
      getAction(this.url.list, params).then((res) => {
        if (res.success) {
          console.log('res.success', res.success)
          console.log('res', res)
          //update-begin---author:zhangyafei    Date:20201118  for：适配不分页的数据列表------------
          // this.dataSource = res.result || {};
          const resultObj = res.result.data || {}
          let list = []
          if (Object.keys(resultObj).length) {
            Object.keys(resultObj).forEach((item) => {
              console.log('item', item)
              const data = {
                label: item,
                children: resultObj[item],
              }
              console.log('data', data)
              list.push(data)
            })
          }
          this.dataSource = list
          console.log('dataSource', this.dataSource)
          console.log('dataSource', JSON.stringify(this.dataSource))
          if (res.result.total) {
            this.ipagination.total = res.result.total
          } else {
            this.ipagination.total = 0
          }
          //update-end---author:zhangyafei    Date:20201118  for：适配不分页的数据列表------------
        }
        if (res.code === 510) {
          this.$message.warning(res.message)
        }
        this.loading = false
      })
    },
    getQueryParams() {
      const params = JeecgListMixin.methods.getQueryParams.call(this)
      if (Array.isArray(params.constractBelong)) {
        params.constractBelong = params.constractBelong.join(',')
      }
      if (Array.isArray(params.constractType)) {
        params.constractType = params.constractType.join(',')
      }
      params.dept = this.currentOrgId
      params.type = 'personnel'
      params.status = this.employeeStatus
      // 默认查询全部员工类型（字典yglx，过滤掉临时工），用户已选具体类型时不覆盖
      if (!params.employeeType) {
        const dictItems = getDictItemsFromCache('yglx') || []
        params.employeeType = dictItems
          .filter((item) => item && item.value !== '临时工')
          .map((item) => item.value)
          .join(',')
      }
      return params
    },
    getQueryField() {
      return ''
    },
    searchQuery() {
      JeecgListMixin.methods.searchQuery.call(this)
    },
    searchReset() {
      this.queryParam = getDefaultQueryParam()
      this.entryDateRange = []
      this.formalResignDateRange = []
      this.employeeStatus = '已入职'
      this.typeFilter = 'all'
      this.sortMode = 'px'
      this.isorter.column = 'px'
      this.isorter.order = 'asc'
      this.searchQuery()
    },
    handleKeywordChange() {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }
      this.searchTimer = setTimeout(() => {
        this.searchQuery()
      }, 300)
    },
    handleFilterChange(field, value) {
      if (Array.isArray(value) && value.length) {
        this.$set(this.queryParam, field, value)
      } else if (!Array.isArray(value) && value) {
        this.$set(this.queryParam, field, value)
      } else {
        this.$delete(this.queryParam, field)
      }
      this.searchQuery()
    },
    initDictConfig() {
      initDictOptions('htlx')
        .then((res) => {
          const options = res && res.success && Array.isArray(res.result) ? res.result : []
          this.constractTypeOptions = options
        })
        .catch(() => {
          this.constractTypeOptions = []
        })
    },
    setEmployeeStatus(value) {
      if (this.employeeStatus === value) {
        return
      }
      this.employeeStatus = value
      this.entryDateRange = []
      this.formalResignDateRange = []
      this.$delete(this.queryParam, 'entryDateBegin')
      this.$delete(this.queryParam, 'entryDateEnd')
      this.$delete(this.queryParam, 'formalResignDateBegin')
      this.$delete(this.queryParam, 'formalResignDateEnd')
      this.searchQuery()
    },
    // 时间范围
    handleEntryDateRangeChange(value, dateStrings) {
      const range = dateStrings && dateStrings.length ? dateStrings : value || []
      if (range[0]) {
        this.$set(this.queryParam, 'entryDateBegin', range[0])
      } else {
        this.$delete(this.queryParam, 'entryDateBegin')
      }
      if (range[1]) {
        this.$set(this.queryParam, 'entryDateEnd', range[1])
      } else {
        this.$delete(this.queryParam, 'entryDateEnd')
      }
      this.searchQuery()
    },
    handleFormalResignDateRangeChange(value, dateStrings) {
      const range = dateStrings && dateStrings.length ? dateStrings : value || []
      if (range[0]) {
        this.$set(this.queryParam, 'formalResignDateBegin', range[0])
      } else {
        this.$delete(this.queryParam, 'formalResignDateBegin')
      }
      if (range[1]) {
        this.$set(this.queryParam, 'formalResignDateEnd', range[1])
      } else {
        this.$delete(this.queryParam, 'formalResignDateEnd')
      }
      this.searchQuery()
    },
    setTypeFilter(value) {
      this.typeFilter = value
      const current = this.typeFilters.find((item) => item.value === value)
      if (current && current.queryValue) {
        this.$set(this.queryParam, 'employeeType', current.queryValue)
      } else {
        this.$delete(this.queryParam, 'employeeType')
      }
      this.searchQuery()
    },
    applySort(value) {
      const sortMap = {
        px: { column: 'px', order: 'asc' },
        entryDate: { column: 'entryDate', order: 'desc' },
        name: { column: 'name', order: 'asc' },
      }
      const sorter = sortMap[value || this.sortMode] || sortMap.px
      this.isorter.column = sorter.column
      this.isorter.order = sorter.order
      this.loadData(1)
    },
    setViewMode(mode) {
      this.viewMode = mode
    },
    handlePageChange(page, pageSize) {
      const pagination = Object.assign({}, this.ipagination, {
        current: page,
        pageSize: pageSize,
      })
      this.handleTableChange(pagination, this.filters, {})
    },
    showTotal(total) {
      return '共 ' + total + ' 条'
    },
    openDetail(record) {
      this.selectedEmployee = record
      this.detailVisible = true
    },
    handleCardMenuClick(key, record, domEvent) {
      if (domEvent) {
        domEvent.stopPropagation()
      }
      if (key === 'edit') {
        this.handleEdit(record)
        return
      }
      if (key === 'resign') {
        //离职
        this.openResignModal(record)
        return
      }
      if (key === 'delete') {
        this.confirmDelete(record)
      }
    },
    handleAddEmployee() {
      if (!this.currentOrgId) {
        this.$message.warning('请先选择左侧组织')
        return
      }
      let isShow = false
      console.log('this.treeData', this.treeData)
      if (this.treeData && this.treeData.length) {
        isShow = this.treeData[0].id === this.currentOrgId
      }
      const companyId = this.findCompanyIdForCurrentOrg()
      console.log('isShow', isShow)
      console.log('isShow', {
        dept: isShow ? '' : this.currentOrgId,
        companyId,
      })
      this.$refs.employeeFormModal.add({
        dept: isShow ? '' : this.currentOrgId,
        companyId,
      })
    },
    openRecycleBin() {
      if (!this.currentOrgId) {
        this.$message.warning('请先选择左侧组织')
        return
      }
      this.$refs.recycleBinModal.show(this.currentOrgId)
    },
    handleRecycleBinOk() {
      this.loadData()
    },
    handleRestBack(ids) {
      return getAction(this.url.returnBack, {
        ids,
      })
    },
    handleEdit(record) {
      const formData = Object.assign({}, record)
      if (!formData.dept && this.currentOrgId) {
        formData.dept = this.currentOrgId
      }
      this.$refs.employeeFormModal.edit(formData)
    },
    openResignModal(record) {
      if (!record) {
        return
      }
      this.$refs.employeeResignModal.show(record)
    },
    handleResignOk() {
      this.loadData(1)
    },
    confirmDelete(record) {
      this.$confirm({
        title: '确认删除该员工吗？',
        content: '请谨慎操作。',
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => this.handleDelete(record),
      })
    },
    handleDelete(record) {
      if (!this.url.delete) {
        this.$message.error('请设置 url.delete 属性')
        return
      }
      const id = record && record.id
      if (id === undefined || id === null || id === '') {
        this.$message.warning('未找到员工ID')
        return
      }
      this.loading = true
      deleteAction(this.url.delete, {
        ids: id,
        type: 'personnel',
        deleteFlag: '否',
      })
        .then((res) => {
          if (res.success) {
            this.reCalculatePage(1)
            if (String((this.selectedEmployee && this.selectedEmployee.id) || '') === String(id)) {
              this.closeDetail()
            }
            this.$message.success(res.message || '删除成功')
            this.loadData()
          } else {
            this.$message.warning(res.message || '删除失败')
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    modalFormOk() {
      this.loadData(1)
    },
    closeDetail(isOne = false) {
      this.detailVisible = false
      this.selectedEmployee = null
      isOne ? this.loadData(1) : this.loadData()
    },
    readValue(record, keys, fallback) {
      const source = record || {}
      for (let i = 0; i < keys.length; i++) {
        const value = source[keys[i]]
        if (value !== undefined && value !== null && value !== '') {
          return String(value)
        }
      }
      return fallback === undefined ? '-' : fallback
    },
    getEmployeeName(record) {
      return this.readValue(record, ['name'])
    },
    getEmployeeNo(record) {
      return this.readValue(record, ['no', 'card'])
    },
    getEmployeePosition(record) {
      return this.readValue(record, ['postId_dictText'], '')
    },
    getPostRemark(record) {
      return this.readValue(record, ['gwbz'], '')
    },
    getEmployeeRank(record) {
      return this.readValue(record, ['postRank_dictText', 'postRank', '岗位职级'])
    },
    getContractType(record) {
      return this.readValue(record, ['constractType_dictText', 'constractType', '合同类型'], '')
    },
    getEmployeeType(record) {
      return this.readValue(record, ['employeeType'], '正式')
    },
    getEmployeeCardClass(record) {
      return this.isOnJob(record) ? 'is-employed' : 'is-resigned'
    },
    isOnJob(record) {
      const status = record && record.status
      if (status) {
        return status === '已入职'
      }
      return this.employeeStatus === '已入职'
    },
    getResignDateText(record) {
      const date = this.readValue(record, ['formalResignDate', '正式离职日期'], '')
      return date ? `${date} 离职` : '已离职'
    },
    getDepartmentName(record) {
      if (record && (record.mainDept || record.dept)) {
        return record.mainDept || record.dept
      }
      if (this.department && this.department.title) {
        return this.department.title
      }
      return '-'
    },
    getAvatarUrl(record) {
      const avatar = this.readValue(record, ['photo'], '')
      if (!avatar) {
        return ''
      }
      if (/^(https?:)?\/\//.test(avatar) || avatar.indexOf('data:image') === 0) {
        return avatar
      }
      return getFileAccessHttpUrl(avatar)
    },
    getAvatarText(record) {
      const name = this.getEmployeeName(record)
      return name && name !== '-' ? name.slice(-2) : '-'
    },
    getTypeClass(type) {
      const value = String(type || '').toLowerCase()
      if (value.indexOf('试用') > -1 || value.indexOf('probation') > -1) {
        return 'type-probation'
      }
      if (value.indexOf('实习') > -1 || value.indexOf('intern') > -1) {
        return 'type-intern'
      }
      if (value.indexOf('外包') > -1 || value.indexOf('outsource') > -1) {
        return 'type-outsource'
      }
      if (value.indexOf('正式') > -1 || value.indexOf('regular') > -1) {
        return 'type-regular'
      }
      return 'type-default'
    },
    getOnlineClass(record) {
      return record.status === '已离职' ? 'offline' : 'online'
    },
    getOnlineText(record) {
      if (record.status) {
        return record.status.includes('入职') ? '在职' : record.status
      } else {
        return '在职'
      }
    },
    formatEmpty(value) {
      if (value === undefined || value === null || value === '') {
        return '-'
      }
      return value
    },
    findTreeNodeById(list, id) {
      if (id === undefined || id === null || id === '') {
        return null
      }
      for (let i = 0; i < (list || []).length; i++) {
        const item = list[i]
        if (String(item.id || item.key) === String(id)) {
          return item
        }
        const child = this.findTreeNodeById(item.children || [], id)
        if (child) {
          return child
        }
      }
      return null
    },
    findCompanyIdForCurrentOrg() {
      if (!this.currentOrgId || !this.treeData || !this.treeData.length) {
        return ''
      }
      const findCompany = (nodes, parentCompanyId) => {
        for (const node of nodes) {
          if (String(node.id || node.key) === String(this.currentOrgId)) {
            const level = this.getOrgLevel(node)
            if (level === 2) {
              return node.id
            }
            return parentCompanyId || ''
          }
          if (node.children && node.children.length) {
            const currentLevel = this.getOrgLevel(node)
            const companyIdForThisBranch = currentLevel === 2 ? node.id : parentCompanyId
            const found = findCompany(node.children, companyIdForThisBranch)
            if (found) {
              return found
            }
          }
        }
        return null
      }
      return findCompany(this.treeData, '') || ''
    },
    getOrgLevel(node) {
      const level = Number(node && node.level)
      if (level) {
        return Math.min(Math.max(level, 1), 4)
      }
      const path = node && node.path
      if (path && path.length) {
        return Math.min(Math.max(path.length, 1), 4)
      }
      return 1
    },
    getOrgDesc(node) {
      const depth = this.calcMaxDepth(node)
      if (depth === 2) {
        return '领导及以下所有员工'
      }
      if (depth <= 2) {
        return '领导及下属员工'
      }
      return '领导及下一级组织'
    },
    calcMaxDepth(node) {
      if (!node || !node.children || !node.children.length) {
        return 1
      }
      let maxChildDepth = 0
      node.children.forEach((child) => {
        maxChildDepth = Math.max(maxChildDepth, this.calcMaxDepth(child))
      })
      return maxChildDepth + 1
    },
  },
}
</script>

<style scoped lang="less">
.employee-list-panel {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--employee-background, #f8fafd);
  overflow: hidden;
  animation: employee-slide-in-right 0.3s ease-out both;
}

.employee-context-header {
  padding: 18px 24px 0;
  flex-shrink: 0;
}

.employee-context-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 1px solid var(--employee-border, #e2e8f0);
  border-radius: 10px;
  background: var(--employee-card, #ffffff);
  box-shadow: var(--employee-shadow-card, 0 2px 12px rgba(45, 120, 255, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03));

  .anticon {
    color: var(--employee-primary, #2563eb);
    font-size: 16px;
  }

  .ctx-level {
    padding: 2px 8px;
    border-radius: 5px;
    font-size: 11px;
    font-weight: 600;

    &.l1 {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
    }

    &.l2 {
      color: #f59e0b;
      background: rgba(245, 158, 11, 0.12);
    }

    &.l3 {
      color: var(--employee-primary, #2563eb);
      background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.1);
    }

    &.l4 {
      color: #10b981;
      background: rgba(16, 185, 129, 0.1);
    }
  }

  .ctx-name {
    color: var(--employee-foreground, #1a2a3d);
    font-size: 13px;
    font-weight: 600;
  }

  .ctx-desc {
    margin-left: 4px;
    color: var(--employee-muted-foreground, #64748b);
    font-size: 12px;
  }
}

.employee-stat-bar {
  padding: 12px 24px 0;
  display: flex;
  align-items: stretch;
  gap: 12px;
  flex-shrink: 0;
}

.employee-stat-card {
  flex: 1;
  min-width: 0;
  padding: 12px 14px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--employee-border, #e2e8f0);
  border-radius: 10px;
  background: var(--employee-card, #ffffff);
  box-shadow: var(--employee-shadow-card, 0 2px 12px rgba(45, 120, 255, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03));
  transition: all 0.4s ease;
  animation: employee-border-breathe 4s ease-in-out infinite;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--employee-gradient-blue, linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%));
  }

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(45, 120, 255, 0.35);
    box-shadow: var(--employee-shadow-glow, 0 4px 24px rgba(45, 120, 255, 0.15), 0 0 40px rgba(45, 120, 255, 0.04));
  }
}

.stat-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 17px;

  &.blue {
    color: #2d78ff;
    background: rgba(45, 120, 255, 0.1);
  }

  &.green {
    color: #10b981;
    background: rgba(16, 185, 129, 0.1);
  }

  &.cyan {
    color: #00a0d4;
    background: rgba(0, 160, 212, 0.1);
  }

  &.orange {
    color: #f59e0b;
    background: rgba(245, 158, 11, 0.1);
  }
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  color: var(--employee-foreground, #1a2a3d);
  font-size: 20px;
  font-weight: 900;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.stat-label {
  margin-top: 1px;
  color: var(--employee-muted-foreground, #64748b);
  font-size: 11px;
}

.stat-sub {
  margin-top: 1px;
  overflow: hidden;
  color: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.4);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.employee-toolbar {
  padding: 14px 24px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.employee-search-wrap {
  flex: 1;
  max-width: 320px;
}

.employee-search {
  width: 100%;

  /deep/ .ant-input {
    height: 36px;
    padding-left: 36px;
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
    box-shadow: 0 0 0 2px rgba(var(--employee-primary-rgb, 37, 99, 235), 0.15);
  }

  /deep/ .ant-input-prefix {
    color: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.3);
  }
}

.employee-filter-group,
.employee-view-toggle {
  display: flex;
  gap: 2px;
  padding: 3px;
  border: 1px solid var(--employee-border, #e2e8f0);
  border-radius: 8px;
  background: var(--employee-card, #ffffff);
}

.employee-filter-btn {
  height: 30px;
  padding: 0 14px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--employee-muted-foreground, #64748b);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.2s ease;

  .anticon {
    font-size: 14px;
  }

  &:hover {
    color: var(--employee-foreground, #1a2a3d);
    background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.04);
  }

  &.active {
    color: #ffffff;
    background: var(--employee-gradient-blue, linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%));
    box-shadow: 0 2px 10px rgba(45, 120, 255, 0.25);
  }
}

.employee-sort {
  width: 116px;

  /deep/ .ant-select-selection {
    height: 34px;
    border: 0;
    border-radius: 8px;
    background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.03);
    box-shadow: none;
    font-size: 12px;
    font-weight: 600;
  }

  /deep/ .ant-select-selection__rendered {
    line-height: 34px;
  }
}

.employee-add-btn {
  height: 34px;
  border: 0;
  border-radius: 8px;
  background: var(--employee-gradient-blue, linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%));
  box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2);

  &:hover,
  &:focus {
    background: var(--employee-gradient-blue, linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%));
    opacity: 0.92;
  }
}

.employee-recycle-btn {
  height: 34px;
  border-radius: 8px;
  color: var(--employee-muted-foreground, #64748b);
  border-color: var(--employee-border, #e2e8f0);
  background: var(--employee-card, #ffffff);
  font-size: 12px;
  font-weight: 600;
}

.employee-view-toggle {
  margin-left: auto;
}

.employee-view-btn {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--employee-muted-foreground, #64748b);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: var(--employee-foreground, #1a2a3d);
  }

  &.active {
    color: #ffffff;
    background: var(--employee-gradient-blue, linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%));
    box-shadow: 0 2px 8px rgba(45, 120, 255, 0.2);
  }
}

.employee-filter-bar {
  padding: 10px 24px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.employee-filter-select {
  width: 132px;
  flex-shrink: 0;

  /deep/ .ant-select-selection {
    height: 32px;
    border-color: var(--employee-border, #e2e8f0);
    border-radius: 6px;
    background: var(--employee-card, #ffffff);
    box-shadow: none;
    font-size: 12px;
  }

  /deep/ .ant-select-selection__rendered {
    line-height: 30px;
  }

  /deep/ .ant-select-selection:hover,
  /deep/ .ant-select-focused .ant-select-selection {
    border-color: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.35);
  }
}

.employee-date-filter {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.employee-date-filter-label {
  color: var(--employee-muted-foreground, #64748b);
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.employee-date-range-picker {
  width: 250px;

  /deep/ .ant-calendar-picker {
    width: 100%;
  }

  /deep/ .ant-calendar-picker-input,
  /deep/ .ant-input {
    height: 32px;
    border-color: var(--employee-border, #e2e8f0);
    border-radius: 6px;
    background: var(--employee-card, #ffffff);
    box-shadow: none;
    font-size: 12px;
  }

  /deep/ .ant-calendar-picker-input:focus,
  /deep/ .ant-input:focus {
    border-color: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.4);
    box-shadow: 0 0 0 3px rgba(var(--employee-primary-rgb, 37, 99, 235), 0.08);
  }
}

.employee-contract-select {
  width: 200px;

  /deep/ .ant-select-selection {
    min-height: 32px;
    border-color: var(--employee-border, #e2e8f0);
    border-radius: 6px;
    background: var(--employee-card, #ffffff);
    box-shadow: none;
    font-size: 12px;
  }

  /deep/ .ant-select-selection--multiple {
    padding-bottom: 0;
  }

  /deep/ .ant-select-selection__rendered {
    min-height: 30px;
    line-height: 30px;
  }

  /deep/ .ant-select-selection__choice {
    height: 22px;
    line-height: 20px;
    margin-top: 4px;
  }

  &.ant-select-focused /deep/ .ant-select-selection,
  /deep/ .ant-select-selection:hover,
  /deep/ .ant-select-focused .ant-select-selection {
    border-color: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.4);
    box-shadow: 0 0 0 3px rgba(var(--employee-primary-rgb, 37, 99, 235), 0.08);
  }
}

.employee-date-clear {
  min-width: 72px;
  height: 34px;
  padding: 0 16px;
  border: 0;
  border-radius: 8px;
  background: var(--employee-gradient-blue, linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%));
  box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2);
  color: #ffffff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  transition: all 0.15s ease;

  &:hover,
  &:focus {
    background: var(--employee-gradient-blue, linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%));
    color: #ffffff;
    opacity: 0.92;
  }
}

.employee-grid-wrap {
  flex: 1;
  min-height: 0;
  padding: 3px 24px 18px;
  overflow-y: auto;
}

.employee-grid-wrap /deep/ .ant-spin-nested-loading,
.employee-grid-wrap /deep/ .ant-spin-container {
  min-height: 100%;
}

.employee-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
  // transition: all 0.4s ease;

  &.list-view {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}

.employee-card-dropdown {
  min-width: 0;

  /deep/ .ant-dropdown-trigger {
    display: block;
  }
}
.em-tag-box {
  padding: 10px 0 4px;
  margin-top: 4px;
  .tag {
    font-size: 12px;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    white-space: nowrap;
    padding: 4px 10px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    box-shadow: 0 2px 12px rgba(45, 120, 255, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03);
  }
  .num {
    font-size: 11px;
    font-weight: 600;
    color: rgba(37, 99, 235, 0.5);
    background: rgba(37, 99, 235, 0.05);
    padding: 2px 8px;
    border-radius: 999px;
  }
  .line {
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, rgba(37, 99, 235, 0.12), transparent);
  }
}
.employee-card {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--employee-border, #e2e8f0);
  border-radius: var(--employee-radius, 8px);
  background: var(--employee-card, #ffffff);
  box-shadow: var(--employee-shadow-card, 0 2px 12px rgba(45, 120, 255, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03));
  cursor: pointer;
  // opacity: 0;
  // transform: translateY(16px);
  // transition: all 0.4s ease;
  // animation: employee-card-in 0.5s ease forwards;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--employee-gradient-blue, linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%));
    opacity: 0.5;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(45, 120, 255, 0.35);
    box-shadow: var(--employee-shadow-glow, 0 4px 24px rgba(45, 120, 255, 0.15), 0 0 40px rgba(45, 120, 255, 0.04));
  }

  &.is-resigned {
    &::before {
      background: linear-gradient(135deg, #94a3b8 0%, #5e5e5e 100%);
      opacity: 0.55;
    }

    .card-name-text {
      color: #64748b;
    }
  }
}

.employee-online-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;

  &.online {
    color: #10b981;
    background: rgba(16, 185, 129, 0.08);

    .online-dot {
      background: #10b981;
      box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);
      animation: employee-blink-dot 2s ease-in-out infinite;
    }
  }

  &.offline {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.06);

    .online-dot {
      background: #ef4444;
    }
  }
}

.online-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.card-top {
  padding: 16px 16px 0;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.card-avatar,
.card-avatar-fallback {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  flex-shrink: 0;
}

.card-avatar {
  object-fit: cover;
  background: var(--employee-background, #f8fafd);
}

.card-avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    rgba(var(--employee-primary-rgb, 37, 99, 235), 0.08),
    rgba(var(--employee-primary-rgb, 37, 99, 235), 0.04)
  );
  color: var(--employee-primary, #2563eb);
  font-size: 15px;
  font-weight: 700;
}

.card-info {
  flex: 1;
  min-width: 0;
  // padding-right: 58px;
}

.card-name {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  color: var(--employee-foreground, #1a2a3d);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.3;
}

.card-name-text {
  color: inherit;
}

.card-status-tag,
.card-contract-type,
.card-rank {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  line-height: 18px;
  vertical-align: middle;
}

.tag-leader {
  color: #f59e0b !important;
  background: rgba(245, 158, 11, 0.12) !important;
}

.card-rank {
  background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.08);
  color: var(--employee-primary, #2563eb);
}

.card-status-tag {
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
}

.card-contract-type {
  background: rgba(16, 185, 129, 0.08);
  color: #10b981;
}

.card-position {
  margin-top: 1px;
  padding: 2px 0;
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
  color: var(--employee-muted-foreground, #64748b);
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
}

.card-position-text {
  flex: 0 0 auto;
  white-space: nowrap;
}

.card-details {
  padding: 8px 16px 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.card-detail {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--employee-muted-foreground, #64748b);
  font-size: 12px;

  .anticon {
    color: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.3);
    flex-shrink: 0;
    font-size: 12px;
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-detail-text {
    min-width: 0;
  }
}

.card-post-remark {
  flex: 0 1 auto;
  min-width: 0;
  max-width: none;
  padding: 0 4px;
  overflow: hidden;
  border: 1px solid rgba(var(--employee-primary-rgb, 37, 99, 235), 0.5);
  border-radius: 3px;
  background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.06);
  color: var(--employee-primary, #2563eb);
  line-height: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.list-meta {
  display: none;
}

.card-bottom {
  padding: 8px 16px;
  border-top: 1px solid var(--employee-border, #e2e8f0);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.02);
}

.card-bottom-meta {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.card-id {
  color: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.35);
  font-size: 11px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.card-actions {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.card-action-link {
  color: var(--employee-primary, #2563eb);
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #1d4ed8;
  }

  &.danger {
    color: #ef4444;
  }

  &.danger:hover {
    color: #dc2626;
  }
}
.card-type {
  padding: 2px 8px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 600;
}

.card-resign-date {
  color: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.35);
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

.type-regular {
  color: #10b981;
  background: rgba(16, 185, 129, 0.08);
}

.type-probation {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.08);
}

.type-intern {
  color: var(--employee-primary, #2563eb);
  background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.08);
}

.type-outsource {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.08);
}

.type-default {
  color: var(--employee-muted-foreground, #64748b);
  background: rgba(0, 0, 0, 0.04);
}

.employee-card-grid.list-view {
  .employee-card {
    border-radius: 8px;
  }

  .card-top {
    padding: 10px 16px;
    align-items: center;
  }

  .card-avatar,
  .card-avatar-fallback {
    width: 32px;
    height: 32px;
    border-radius: 8px;
  }

  .card-avatar-fallback {
    font-size: 12px;
  }

  .card-info {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-right: 0;
  }

  .card-position {
    margin-top: 0;
  }

  .card-details {
    display: none;
  }

  .list-meta {
    // margin-left: 58px;
    margin-top: -14px;
    margin-left: 39px;
    padding: 0 16px 4px;
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--employee-muted-foreground, #64748b);
    font-size: 12px;
  }

  .list-meta-item {
    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: 4px;

    .anticon {
      color: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.3);
    }
  }

  .card-bottom {
    padding: 0 16px 8px;
    border-top: 0;
    background: transparent;
  }
}

.employee-empty {
  padding: 80px 24px;
}

.employee-pagination {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
}

@keyframes employee-card-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes employee-slide-in-right {
  from {
    opacity: 0;
    transform: translateX(12px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes employee-blink-dot {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

@keyframes employee-border-breathe {
  0%,
  100% {
    border-color: rgba(45, 120, 255, 0.1);
    box-shadow: var(--employee-shadow-card, 0 2px 12px rgba(45, 120, 255, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03));
  }
  50% {
    border-color: rgba(45, 120, 255, 0.25);
    box-shadow: 0 2px 12px rgba(45, 120, 255, 0.1);
  }
}

@media (max-width: 900px) {
  .employee-stat-bar {
    flex-wrap: wrap;
  }

  .employee-stat-card {
    min-width: 140px;
  }

  .employee-toolbar {
    align-items: stretch;
  }

  .employee-search-wrap {
    max-width: 100%;
    flex-basis: 100%;
  }

  .employee-filter-bar {
    align-items: stretch;
  }

  .employee-filter-select,
  .employee-date-filter {
    width: 100%;
  }

  .employee-date-range-picker,
  .employee-contract-select {
    flex: 1;
    width: auto;
  }

  .employee-view-toggle {
    margin-left: 0;
  }

  .employee-card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
<template>
  <div class="new-ro-personnel-list">
    <div class="flex flex-col role-list-column" :style="autoWidth">
      <!-- 部门名称 -->
      <!-- <div class="person-title-block">
        <a-tooltip placement="topLeft">
          <template slot="title">
            <span>{{ departmentText }}</span>
          </template>
          <div class="person-breadcrumb">
            <template v-for="(item, index) in breadcrumb">
              <span :key="item + index" class="breadcrumb-item" :class="{ active: index === breadcrumb.length - 1 }">
                {{ item }}
              </span>
              <span v-if="index < breadcrumb.length - 1" :key="item + index + 'sep'" class="breadcrumb-sep">›</span>
            </template>
          </div>
        </a-tooltip>
      </div> -->
      <div class="flex flex-1 role-list-panels">
        <aside class="role-group-panel">
          <div class="role-group-header">
            <h3>岗位角色</h3>
            <span>{{ roleGroupPersonCount }}</span>
          </div>

          <div class="role-list-search">
            <a-input
              v-model="roleGroupSearchText"
              allowClear
              size="small"
              placeholder="搜索岗位角色"
            >
              <a-icon slot="prefix" type="search" />
            </a-input>
          </div>
          <div class="role-group-scroll">
            <button
              v-if="currentOrgId"
              type="button"
              class="role-group-item"
              :class="{ selected: !selectedGroupId }"
              @click="handleClickAllRoleGroup"
            >
              <span class="role-group-info">
                <span class="role-group-name">全部</span>
              </span>
            </button>
            <draggable
              v-model="sortableRoleGroupList"
              class="role-sortable-list"
              ghost-class="role-sort-ghost"
              drag-class="role-sort-dragging"
              :animation="200"
              :disabled="!roleGroupSortEnabled || !!roleGroupSearchText.trim()"
            >
              <a-dropdown
                v-for="group in sortableRoleGroupList"
                :key="group.id"
                class="role-group-dropdown"
                :trigger="['contextmenu']"
              >
                <button
                  type="button"
                  class="role-group-item"
                  :class="{ selected: selectedGroupId === group.id, 'sort-enabled': roleGroupSortEnabled && !roleGroupSearchText.trim() }"
                  @click="handleClickRole(group)"
                >
                  <!-- <span class="role-level-badge">{{ group.level }}</span> -->
                  <span class="role-group-info">
                    <span class="role-group-name" :title="group.roleName">{{ group.roleName }}</span>
                  </span>
                  <!-- <span class="role-group-count">{{ group.count }}人</span> -->
                </button>
                <a-menu slot="overlay" @click="({ key }) => handleRoleGroupContextAction(key, group)">
                  <a-menu-item key="add">
                    <a-icon type="plus" />
                    新增角色
                  </a-menu-item>
                  <a-menu-item key="edit">
                    <a-icon type="edit" />
                    编辑角色
                  </a-menu-item>
                  <a-menu-item key="permission">
                    <a-icon type="safety-certificate" />
                    权限配置
                  </a-menu-item>
                  <a-menu-item v-if="!roleGroupSortEnabled" key="enableSort">
                    <a-icon type="ordered-list" />
                    启用排序
                  </a-menu-item>
                  <a-menu-item v-else key="updateSort">
                    <a-icon type="save" />
                    更新排序
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="delete">
                    <a-icon type="delete" />
                    删除角色
                  </a-menu-item>
                </a-menu>
              </a-dropdown>
            </draggable>
            <div class="empty-tips" v-if="!currentOrgId && !roleGroupList.length">
              <div class="tips_icon"><a-icon type="arrow-left" :style="{ fontSize: '30px' , color: '#cbe1fb' }" /></div>
              <div class="tips_1">请从组织架构中选择部门</div>
              <div class="tips_2">点击部门即可查看该部门下的所有岗位角色</div>
            </div>
            <div class="empty-tips" v-if="roleGroupList.length && !filteredRoleGroupList.length">
              <div class="tips_1">暂无匹配岗位角色</div>
            </div>
            <!-- <a-empty
          v-if="!roleGroupList.length"
          class="role-filter-empty"
          description="暂无角色数据"
        /> -->
          </div>
        </aside>

        <aside v-if="roleFilterList.length" class="role-filter-panel">
          <div class="role-filter-header">
            <h3>权限组</h3>
            <span>{{ roleFilterPersonCount }}人</span>
          </div>
          <div class="role-list-search">
            <a-input
              v-model="roleFilterSearchText"
              allowClear
              size="small"
              placeholder="搜索权限组"
            >
              <a-icon slot="prefix" type="search" />
            </a-input>
          </div>
          <div class="role-filter-scroll">
            <a-spin :spinning="roleLoading">
              <button
                v-if="roleFilterList.length"
                type="button"
                class="role-filter-item"
                :class="{ selected: !selectedRoleId }"
                @click="handleClickRoleUser(null)"
              >
                <span class="role-filter-dot" :class="{ 'role-filter-dot-all': selectedRoleId === '' }"></span>
                <span class="role-filter-info">
                  <span class="role-filter-name">全部权限组</span>
                  <span class="role-filter-meta">{{ }}</span>
                </span>
                <span class="role-filter-count">{{ roleFilterPersonCount }}人</span>
              </button>

              <draggable
                v-model="sortableRoleFilterList"
                class="role-sortable-list"
                ghost-class="role-sort-ghost"
                drag-class="role-sort-dragging"
                :animation="200"
                :disabled="!roleFilterSortEnabled || !!roleFilterSearchText.trim()"
              >
                <a-dropdown
                  v-for="role in sortableRoleFilterList"
                  :key="role.id"
                  class="role-filter-dropdown"
                  :trigger="['contextmenu']"
                >
                  <button
                    type="button"
                    class="role-filter-item"
                    :class="{ selected: selectedRoleId === role.id, 'sort-enabled': roleFilterSortEnabled && !roleFilterSearchText.trim() }"
                    @click="handleClickRoleUser(role)"
                  >
                    <span class="role-filter-dot" :class="{ 'role-filter-dot-all': selectedRoleId === role.id }" :style="{ background: role.color }"></span>
                    <span class="role-filter-info">
                      <span class="role-filter-name" :title="role.roleName">{{ role.roleName || '-' }}</span>
                      <!-- <span class="role-filter-meta">
                    <span class="role-level-text" :class="'level-l' + (role.level || '')">L{{ role.level || '-' }}</span>
                  </span> -->
                    </span>
                    <span class="role-filter-count">{{ role.count }}人</span>
                    <!-- <a-icon class="role-filter-more" type="more" /> -->
                  </button>
                  <a-menu slot="overlay" @click="({ key }) => handleRoleContextAction(key, role)">
                    <a-menu-item key="edit">
                      <a-icon type="edit" />
                      编辑角色
                    </a-menu-item>
                    <a-menu-item key="permission">
                      <a-icon type="safety-certificate" />
                      权限配置
                    </a-menu-item>
                    <a-menu-item v-if="!roleFilterSortEnabled" key="enableSort">
                      <a-icon type="ordered-list" />
                      启用排序
                    </a-menu-item>
                    <a-menu-item v-else key="updateSort">
                      <a-icon type="save" />
                      更新排序
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="delete">
                      <a-icon type="delete" />
                      删除角色
                    </a-menu-item>
                  </a-menu>
                </a-dropdown>
              </draggable>

              <!-- <a-empty
            v-if="roleFilterList.length === 0 && !roleLoading"
            class="role-filter-empty"
            description="该角色暂无人员"
          /> -->
              <div class="empty-tips" v-if="roleFilterList.length === 0 && !roleLoading">
                <div class="tips_icon"><a-icon type="arrow-left" :style="{ fontSize: '30px' , color: '#cbe1fb' }" /></div>
                <div class="tips_1">请从岗位角色中选择角色</div>
                <div class="tips_2">点击岗位角色即可查看该角色下的所有权限组</div>
              </div>
              <div class="empty-tips" v-if="roleFilterList.length > 0 && !filteredRoleFilterList.length && !roleLoading">
                <div class="tips_1">暂无匹配权限组</div>
              </div>
            </a-spin>
          </div>
        </aside>
      </div>
    </div>

    <section class="personnel-content">
      <div class="person-toolbar flex justify-between">
        <div class="flex gap-10">
          <a-input
            v-model="queryParam.queryFileds"
            allowClear
            class="person-search"
            placeholder="搜索用户名称..."
            @pressEnter="searchQuery"
          >
            <a-icon slot="prefix" type="search" />
          </a-input>
          <a-button type="primary" icon="search" @click="searchQuery">查询</a-button>
          <a-button icon="reload" @click="searchReset">重置</a-button>
          <a-dropdown v-if="selectedRowKeys.length > 0">
            <a-menu slot="overlay">
              <a-menu-item key="1" @click="batchDel2">
                <a-icon type="delete" />
                批量移出
              </a-menu-item>
              <a-menu-item key="2" @click="openBatchRoleModal">
                <a-icon type="swap" />
                批量更换绑定
              </a-menu-item>
              <a-menu-item key="3" @click="handleBatchResetPassword">
                <a-icon type="reload" />
                批量重置密码
              </a-menu-item>
            </a-menu>
            <a-button>
              批量操作
              <a-icon type="down" />
            </a-button>
          </a-dropdown>
        </div>
        <div class="person-header-actions">
          <span class="person-total">共 <strong>{{ ipagination.total }}</strong> 人</span>
          <a-button
            type="primary"
            icon="plus"
            class="person-add-user-button"
            :disabled="selectedTreeKeys.length < 2"
            @click="handleAddUserRole"
          >已有用户</a-button>
        </div>
      </div>

      <div class="people-table-shell">
        <!-- <div v-show="selectedRowKeys.length > 0" class="ant-alert ant-alert-info selected-alert">
          <i class="anticon anticon-info-circle ant-alert-icon"></i>
          已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a> 项
          <a style="margin-left: 24px" @click="onClearSelected">清空</a>
        </div> -->
        <a-table
          ref="table"
          class="person-ant-table"
          size="middle"
          rowKey="id"
          :columns="columns"
          :dataSource="dataSource"
          :pagination="ipagination"
          :loading="loading"
          :scroll="{ x: 1080 }"
          :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
          :customRow="customRow"
          @change="handleTableChange"
        >
          <span slot="action" slot-scope="text, record">
            <span class="person-row-actions" @click.stop>
              <button class="person-action-link primary" type="button" @click="openDetail(record)">详情</button>
              <button class="person-action-link" type="button" @click="openRowRoleModal(record)">更换绑定</button>
              <a-popconfirm title="确定将该人员密码重置为 Aa123456@ 吗？" @confirm="() => handleResetPassword(record)">
                <button class="person-action-link" type="button">重置密码</button>
              </a-popconfirm>
              <a-popconfirm title="确定移出吗?" @confirm="() => handleDelete2(record)">
                <button class="person-action-link danger" type="button">移出</button>
              </a-popconfirm>
            </span>
          </span>
        </a-table>
      </div>
    </section>
    <role-add-modal
      ref="roleAddModal"
      :tree-data="roleTreeData"
      @ok="handleRoleModalOk"
    ></role-add-modal>
    <role-auth-modal ref="roleAuth" />
    <a-modal
      :title="bindingTargetRecord ? '更换绑定' : '批量更换绑定'"
      :visible="batchRoleModalVisible"
      :width="920"
      :bodyStyle="{ maxHeight: '80vh', overflowY: 'auto' }"
      :confirmLoading="roleBindingSubmitting"
      @ok="confirmBatchRoleChange"
      @cancel="closeBatchRoleModal"
    >
      <position-role-picker
        :tree-data="treeData"
        :visible="batchRoleModalVisible"
        :active-dept-id="currentOrgId"
        :value="batchRoleId"
        @input="batchRoleId = $event"
        @change="handleBatchRoleChange"
      />
    </a-modal>
    <personnel-user-select-modal
      ref="selectUserModal"
      :tree-data="treeData"
      @selectFinished="selectOK"
      @recycleOk="handleRecycleBinOk"
    ></personnel-user-select-modal>

    <div v-if="detailVisible" class="person-detail-overlay" @click="closeDetail">
      <div class="person-detail-content" @click.stop>
        <div class="person-detail-banner">
          <div class="person-detail-banner-inner">
            <img
              v-if="selectedPerson && (selectedPerson.photo || selectedPerson.avatar)"
              class="person-detail-avatar person-detail-avatar-image"
              :src="getPersonAvatarUrl(selectedPerson)"
              :alt="getDisplayName(selectedPerson)"
            />
            <span v-else class="person-detail-avatar person-detail-avatar-fallback">{{ getAvatarText(selectedPerson) }}</span>
            <div class="person-detail-title">
              <div class="person-detail-name">{{ formatEmpty(selectedPerson && selectedPerson.no) }}</div>
              <div class="person-detail-position">{{ getPersonSubTitle(selectedPerson) }}</div>
            </div>
            <button class="person-detail-close" type="button" @click="closeDetail">
              <a-icon type="close" />
            </button>
          </div>
        </div>
        <div class="person-detail-body">
          <div class="person-detail-grid">
            <div class="person-detail-field">
              <div class="person-detail-label">账号</div>
              <div class="person-detail-value">{{ formatEmpty(selectedPerson && selectedPerson.name) }}</div>
            </div>
            <div class="person-detail-field">
              <div class="person-detail-label">工号</div>
              <div class="person-detail-value">{{ formatEmpty(selectedPerson && selectedPerson.no) }}</div>
            </div>
            <div class="person-detail-field">
              <div class="person-detail-label">创建时间</div>
              <div class="person-detail-value">{{ formatDate(selectedPerson && selectedPerson.createTime) }}</div>
            </div>
            <div class="person-detail-field person-detail-field-wide">
              <div class="person-detail-label">所属组织</div>
              <div class="person-detail-value">{{ departmentText }}</div>
            </div>
          </div>
          <div class="person-detail-section">
            <div class="person-detail-section-title">联系方式</div>
            <div class="person-detail-contacts">
              <span>
                <a-icon type="phone" />
                {{ formatEmpty(selectedPerson && selectedPerson.phoneNumber) }}
              </span>
              <span>
                <a-icon type="mail" />
                {{ formatEmpty(selectedPerson && selectedPerson.email) }}
              </span>
            </div>
          </div>
          <div class="person-detail-footer">
            <button class="detail-btn-outline" type="button" @click="closeDetail">关闭</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { deleteAction, getAction, postAction, getFileAccessHttpUrl } from '@/api/manage'
import { filterObj } from '@/utils/util'
import draggable from 'vuedraggable'

import PersonnelUserSelectModal from './PersonnelUserSelectModal.vue'
import RoleAddModal from './RoleAddModal.vue'
import RoleAuthModal from './RoleAuthModal.vue'
import PositionRolePicker from './PositionRolePicker.vue'

function getDefaultQueryParam() {
  return {
    ops: '是',
    deleteFlag: '\u5426'
  }
}

export default {
  name: 'PersonnelList',
  mixins: [JeecgListMixin],
  components: {
    PersonnelUserSelectModal,
    RoleAddModal,
    RoleAuthModal,
    PositionRolePicker,
    draggable
  },
  props: {
    orgId: {
      type: [String, Number],
      default: ''
    },
    department: {
      type: Object,
      default: null
    },
    treeData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      disableMixinCreated: true,
      currentOrgId: '',
      detailVisible: false,
      selectedPerson: null,
      batchRoleModalVisible: false,
      batchRoleId: '',
      batchSelectedRole: null,
      bindingTargetRecord: null,
      roleBindingSubmitting: false,
      roleLoading: false,
      roleGroupList: [],
      roleGroupSearchText: '',
      roleGroupSortEnabled: false,
      selectedGroupId: '',
      roleFilterList: [],
      roleFilterSearchText: '',
      roleFilterSortEnabled: false,
      selectedRoleId: '',
      queryParam: {
        ops: '是',
        deleteFlag: '否'
      },
      columns: [
        {
          title: '工牌号',
          align: 'center',
          dataIndex: 'no',
          align: 'center',
          width: 120,
          ellipsis: true,
          customRender: (text) => {
              return <a-tooltip style='width: 110px;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block'>
                <template slot="title">{text}</template>
                <span >{text}</span>
              </a-tooltip>
          }
        },
        {
          title: '姓名',
          align: 'left',
          dataIndex: 'name',
          width: 140,
          align: 'center',
          ellipsis: true,
          customRender: (text) => {
              return <a-tooltip style='width: 130px;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block'>
                <template slot="title">{text}</template>
                <span >{text}</span>
              </a-tooltip>
          }
        },
        {
          title: '部门',
          align: 'center',
          dataIndex: 'dept_dictText',
          width: 180,
          ellipsis: true,
          customRender: (text) => {
              return <a-tooltip style='width: 170px;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block'>
                <template slot="title">{text}</template>
                <span >{text}</span>
              </a-tooltip>
          }
        },
        {
          title: '岗位',
          align: 'center',
          dataIndex: 'postId_dictText',
          width: 160,
          ellipsis: true,
          customRender: (text) => {
              return <a-tooltip style='width: 150px;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block'>
                <template slot="title">{text}</template>
                <span >{text}</span>
              </a-tooltip>
          }
        },
        {
          title: '联系电话',
          align: 'center',
          width: 150,
          dataIndex: 'phoneNumber',
          ellipsis: true,
          customRender: (text) => {
              return <a-tooltip style='width: 140px;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block'>
                <template slot="title">{text}</template>
                <span >{text}</span>
              </a-tooltip>
          }
        },
        {
          title: '操作',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' },
          align: 'center',
          width: 250,
          fixed: 'right'
        }
      ],
      url: {
        // list: '/org/hrmUserOrg/listOfUser',
        list: '/hrm/hrEmployeeInformation/list',
        list2: '/hrJobSequence/hrJobSequence/SysRoleList',
        // roleDelete: '/sys/role/delete',
        roleDelete: '/hrJobSequence/hrJobSequence/removeSysRole',
        // list: '/hrm/hrEmployeeInformation/childrenList',
        addSysUser: '/hrm/hrEmployeeInformation/addSysUser',
        changePassword: '/hrm/hrEmployeeInformation/changePassword',
        batchChangePassword: '/hrm/hrEmployeeInformation/batchChangePassword',
        delete: '/hrm/hrEmployeeInformation/deleteBatch',
        // delete: '/org/hrmUserOrg/deleteBatchRelation',
        deleteBatch: '/hrm/hrEmployeeInformation/deleteBatch'
      }
    }
  },
  computed: {
    autoWidth() {
      return {
        width: !this.sortableRoleFilterList.length ? '260px' : '520px'
      }
    },
    roleGroupPersonCount() {
      return this.sortableRoleGroupList.length
      // return this.roleGroupList.reduce((total, item) => total + item.count, 0)
    },
    roleFilterPersonCount() {
      return this.roleFilterList.reduce((total, item) => total + item.count, 0)
    },
    // 按 roleName 模糊过滤角色列表，搜索为空时保留原数组引用。
    filteredRoleGroupList() {
      return this.filterRoleListByName(this.roleGroupList, this.roleGroupSearchText)
    },
    // 按 roleName 模糊过滤人员列表角色，搜索为空时保留原数组引用。
    filteredRoleFilterList() {
      return this.filterRoleListByName(this.roleFilterList, this.roleFilterSearchText)
    },
    // 为角色列表拖拽排序提供 get/set 桥接，搜索中不回写原数组。
    sortableRoleGroupList: {
      get() {
        return this.filteredRoleGroupList
      },
      set(list) {
        if (!this.roleGroupSearchText.trim()) {
          this.roleGroupList = list
        }
      }
    },
    // 为人员列表拖拽排序提供 get/set 桥接，搜索中不回写原数组。
    sortableRoleFilterList: {
      get() {
        return this.filteredRoleFilterList
      },
      set(list) {
        if (!this.roleFilterSearchText.trim()) {
          this.roleFilterList = list
        }
      }
    },
    // 三级选中的id load函数使用
    selectedTreeKeys() {
      return [this.orgId, this.selectedGroupId, this.selectedRoleId].filter(Boolean)
    },
    roleTreeData() {
      return this.department ? [this.department] : []
    },
    breadcrumb() {
      if (this.department && this.department.path && this.department.path.length) {
        return this.department.path
      }
      return ['请选择组织']
    },
    departmentText() {
      return this.breadcrumb.join(' / ')
    }
  },
  watch: {
    orgId: {
      immediate: true,
      handler(val) {
        this.currentOrgId = val || ''
        this.resetRolePanelFilterState()
        this.selectedGroupId = ''
        this.selectedRoleId = ''
        this.roleGroupList = []
        this.roleFilterList = []
        this.onClearSelected()
        this.closeDetail()
        this.loadData(1)
        this.getRoleList()
      }
    }
  },
  methods: {
    // 切换部门时重置岗位角色和权限组的搜索、排序状态。
    resetRolePanelFilterState() {
      this.roleGroupSearchText = ''
      this.roleFilterSearchText = ''
      this.roleGroupSortEnabled = false
      this.roleFilterSortEnabled = false
    },
    // 根据 roleName 模糊过滤列表，空关键字直接返回原列表用于拖拽排序。
    filterRoleListByName(list, keyword) {
      const searchText = (keyword || '').trim().toLowerCase()
      if (!searchText) {
        return list
      }
      return list.filter(item => String((item && item.roleName) || '').toLowerCase().includes(searchText))
    },
    // 启用角色列表拖拽排序。
    enableRoleGroupSort() {
      if (this.roleGroupSearchText.trim()) {
        this.$message.warning('请先清空岗位角色搜索条件再排序')
        return
      }
      this.roleGroupSortEnabled = true
    },
    // 启用人员列表拖拽排序。
    enableRoleFilterSort() {
      if (this.roleFilterSearchText.trim()) {
        this.$message.warning('请先清空权限组搜索条件再排序')
        return
      }
      this.roleFilterSortEnabled = true
    },
    // 获取并打印角色列表最新排序数组。
    updateRoleGroupSort() {
      const sortList = this.buildRoleSortList(this.roleGroupList)
      console.log('角色列表最新排序数组', sortList)
      this.batchEditSort(sortList)
      this.roleGroupSortEnabled = false
    },
    // 获取并打印人员列表最新排序数组。
    updateRoleFilterSort() {
      const sortList = this.buildRoleSortList(this.roleFilterList)
      console.log('人员列表最新排序数组', sortList)
      this.batchEditSort(sortList)
      this.roleFilterSortEnabled = false
    },
    batchEditSort(list) {
      return postAction('/hrJobSequence/hrJobSequence/batchEditSort', list).then(res => {
        if (res && res.success) {
          this.$message.success('排序更新成功')
          return this.refresh()
        } else {
          if (res && res.message) this.$message.warning(res.message)
        }
      })
    },
    // 组装最新排序数组，保留后续对接保存接口需要的关键字段。
    buildRoleSortList(list) {
      return list.map((item, index) => ({
        id: item.id,
        roleName: item.roleName,
        sequenceId: item.sequenceId,
        sort: index + 1
      }))
    },
    // 刷新人员数据和角色列表。
    refresh() {
      this.currentOrgId = this.orgId || ''
      this.onClearSelected()
      this.closeDetail()

      if (!this.currentOrgId) {
        this.selectedGroupId = ''
        this.selectedRoleId = ''
        this.roleGroupList = []
        this.roleFilterList = []
        return this.loadData(1)
      }

      return this.getRoleList().then(() => {
        const selectedGroup = this.roleGroupList.find(item => item.id === this.selectedGroupId)
        if (!selectedGroup) {
          this.selectedGroupId = ''
          this.selectedRoleId = ''
          this.roleFilterList = []
          return null
        }

        return this.getUserList(selectedGroup.sequenceId).then(() => {
          const selectedRoleExists = this.roleFilterList.some(item => item.id === this.selectedRoleId)
          if (!selectedRoleExists) {
            this.selectedRoleId = ''
          }
        })
      }).finally(() => this.loadData(1))
    },
    // 分发上层角色右键菜单操作。
    handleRoleGroupContextAction(key, group) {
      if (key === 'add') {
        this.openRoleAdd(group)
      } else if (key === 'edit') {
        this.openRoleEdit(group, '0')
      } else if (key === 'permission') {
        this.openRolePermission(group)
      } else if (key === 'enableSort') {
        this.enableRoleGroupSort()
      } else if (key === 'updateSort') {
        this.updateRoleGroupSort()
      } else if (key === 'delete') {
        this.confirmDeleteRole(group, true)
      }
    },
    // 分发下层角色右键菜单操作。
    handleRoleContextAction(key, role) {
      if (key === 'edit') {
        this.openRoleEdit(role, '1')
      } else if (key === 'permission') {
        const parentRoleId = this.selectedTreeKeys[1]
        if (!parentRoleId) {
          this.$message.warning('请先选择上层角色')
          return
        }
        this.openRolePermission(role, parentRoleId)
      } else if (key === 'enableSort') {
        this.enableRoleFilterSort()
      } else if (key === 'updateSort') {
        this.updateRoleFilterSort()
      } else if (key === 'delete') {
        this.confirmDeleteRole(role, false)
      }
    },
    // 打开角色权限配置抽屉。
    openRolePermission(role, parentRoleId = '') {
      if (!role || !role.id) {
        this.$message.warning('缺少角色ID，无法配置权限')
        return
      }
      this.$refs.roleAuth.show(role.id, {
        title: role.roleName || role.name || '',
        departId: this.orgId,
        parentRoleId
      })
    },
    // 使用当前岗位序列打开新增角色弹窗。
    openRoleAdd(group) {
      if (!this.department || !this.currentOrgId) {
        this.$message.warning('请选择所属组织')
        return
      }
      this.$refs.roleAddModal.open(this.department, {
        deptId: this.currentOrgId,
        pid: '1',
        sequenceId: group.sequenceId
      },
      group.roleCode
    )
    },
    // 使用指定角色数据打开编辑弹窗。
    openRoleEdit(role, pid) {
      if (!this.department || !role) {
        return
      }
      this.$refs.roleAddModal.edit(role, this.department, { pid })
    },
    // 校验角色信息并弹出删除确认框。
    confirmDeleteRole(role, isGroup) {
      if (!role || !role.id) {
        this.$message.warning('缺少角色ID，无法删除')
        return
      }
      this.$confirm({
        title: '确认删除',
        content: `是否删除角色“${role.roleName || '-'}”？`,
        onOk: () => this.deleteRole(role, isGroup)
      })
    },
    // 删除角色并清理对应的选中状态。
    deleteRole(role, isGroup) {
      return postAction(this.url.roleDelete, role).then(res => {
        if (!res.success) {
          this.$message.warning(res.message || '角色删除失败')
          return
        }
        if (isGroup && this.selectedGroupId === role.id) {
          this.selectedGroupId = ''
          this.selectedRoleId = ''
          this.roleFilterList = []
        } else if (!isGroup && this.selectedRoleId === role.id) {
          this.selectedRoleId = ''
        }
        this.$message.success(res.message || '角色删除成功')
        return this.handleRoleModalOk()
      })
    },
    // 角色操作成功后刷新角色层级和人员数据。
    handleRoleModalOk() {
      return this.refresh()
    },
    // 切换下层角色筛选并重新加载人员。
    handleClickRoleUser(role) {
      if (!role) {
        this.selectedRoleId = ''
      } else {
        this.selectedRoleId = role.id === this.selectedRoleId ? '' : role.id
      }
      this.loadData(1)
    },
    // 切回岗位角色全部状态，按当前部门维度重新加载人员列表。
    handleClickAllRoleGroup() {
      this.selectedGroupId = ''
      this.selectedRoleId = ''
      this.roleFilterList = []
      this.roleFilterSearchText = ''
      this.roleFilterSortEnabled = false
      this.loadData(1)
    },
    // 切换上层角色并加载其下属角色。
    handleClickRole(group) {
      this.selectedGroupId = this.selectedGroupId === group.id ? '' : group.id
      this.selectedRoleId = ''
      this.loadData(1)
      this.roleFilterList = []
      this.selectedGroupId && this.getUserList(group.sequenceId) // 查询子项
    },
    // 根据当前组织、角色层级和查询条件加载人员列表。
    loadData(arg) {
      if (!this.currentOrgId) {
        this.dataSource = []
        this.ipagination.total = 0
        this.onClearSelected()
        return Promise.resolve()
      }
      if (arg === 1) {
        this.ipagination.current = 1
      }
      const params = this.getQueryParams()
      const fieldMap = {
        '1': 'dept',
        '2': 'postId',
        '3': 'managerId'
      }

      params[fieldMap[this.selectedTreeKeys.length]] = this.selectedTreeKeys[this.selectedTreeKeys.length - 1] || ''

      this.loading = true
      return getAction(this.url.list, params)
        .then((res) => {
          if (res.success) {
            const result = res.result || {}
            this.dataSource = result.records || []
            this.ipagination.total = result.total || 0
            this.ipagination.current = result.current || this.ipagination.current
            this.ipagination.pageSize = result.size || this.ipagination.pageSize
          } else {
            this.dataSource = []
            this.ipagination.total = 0
            this.$message.warning(res.message || '人员列表加载失败')
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 加载当前组织下的上层角色列表。
    getRoleList() {
      if (!this.currentOrgId) {
        return Promise.resolve()
      }
      return getAction(this.url.list2, { deptId: this.currentOrgId, pid: '0' }) // 角色不分页
          .then((res) => {
            if (res.success) {
              const result = res.result || {}
              const list = result.records || []
              console.log('角色列表---------------------------', res.result)
              this.roleGroupList = list || []
              if (this.roleGroupList.length > 0) {
                // this.handleClickRole(this.roleGroupList[0]) // 默认选中第一个角色组
              }
            } else {
              this.roleGroupList = []
              this.$message.warning(res.message || '角色列表加载失败')
            }
          })
          .finally(() => {
            this.loading = false
          })
    },
    // 根据岗位序列加载下层角色列表。
    getUserList(sequenceId) {
        return getAction(this.url.list2, { sequenceId: sequenceId, pid: '1' }) // 人员列表不分页
          .then((res) => {
            if (res.success) {
              const result = res.result || {}
              const list = result.records || []
              console.log('人员列表---------------------------', res.result)
              this.roleFilterList = list || []
            } else {
              this.roleFilterList = []
              this.$message.warning(res.message || '角色列表加载失败')
            }
          })
          .finally(() => {
            this.loading = false
          })
    },
    // 配置表格行点击事件，排除操作按钮和复选框区域。
    customRow(record) {
      return {
        on: {
          click: event => {
            const target = event && event.target
            if (
              target &&
              target.closest &&
              (target.closest('.person-row-actions') ||
                target.closest('.ant-checkbox-wrapper') ||
                target.closest('.ant-table-selection-column'))
            ) {
              return
            }
            this.openDetail(record)
          }
        }
      }
    },
    // 打开人员详情面板。
    handleResetPassword(record) {
      if (!record || !record.no) {
        this.$message.warning('缺少人员工牌号，无法重置密码')
        return Promise.resolve()
      }
      return getAction(this.url.changePassword, {
        username: record.no,
        password: 'Aa123456@'
      }).then((res) => {
        if (res.success) {
          this.$message.success(res.message || '重置密码成功')
          this.onClearSelected()
        } else {
          this.$message.warning(res.message || '重置密码失败')
        }
      }).catch(() => {
        this.$message.error('重置密码失败，请稍后重试')
      })
    },
    handleBatchResetPassword() {
      const records = (this.selectionRows || []).slice()
      if (!records.length) {
        this.$message.warning('请先选择需要重置密码的人员')
        return
      }
      const usernames = records.map(item => item && item.no ? String(item.no).trim() : '')
      if (usernames.some(username => !username) || records.length !== this.selectedRowKeys.length) {
        this.$message.warning('勾选数据不完整，请重新选择后重试')
        return
      }
      this.$confirm({
        title: '确认重置密码',
        content: `确定将选中的 ${records.length} 名人员密码重置为 Aa123456@ 吗？`,
        onOk: () => postAction(this.url.batchChangePassword, {
          usernames: usernames.join(',')
        }).then((res) => {
          if (res.success) {
            this.$message.success(res.message || '批量重置密码成功')
            this.onClearSelected()
          } else {
            this.$message.warning(res.message || '批量重置密码失败')
          }
        }).catch(() => {
          this.$message.error('批量重置密码失败，请稍后重试')
        })
      })
    },
    openDetail(record) {
      if (!record) {
        return
      }
      this.selectedPerson = record
      this.detailVisible = true
    },
    // 关闭人员详情面板并清空当前人员。
    closeDetail() {
      this.detailVisible = false
      this.selectedPerson = null
    },
    // 将头像路径转换为可访问地址。
    getAvatarView: function (avatar) {
      return getFileAccessHttpUrl(avatar)
    },
    getPersonAvatarUrl(record) {
      const avatar = record && (record.photo || record.avatar)
      if (!avatar) {
        return ''
      }
      if (/^(https?:)?\/\//.test(avatar) || avatar.indexOf('data:image') === 0) {
        return avatar
      }
      return this.getAvatarView(avatar)
    },
    // 组装人员列表分页、排序和筛选参数。
    getQueryParams() {
      const param = Object.assign({}, this.queryParam, this.isorter, this.filters)
      param.field = this.getQueryField()
      param.pageNo = this.ipagination.current
      param.pageSize = this.ipagination.pageSize
      return filterObj(param)
    },

    // 重置查询条件并刷新人员和角色数据。
    searchReset() {
      this.queryParam = getDefaultQueryParam()
      this.loadData(1)
      this.getRoleList() // 查询角色列表
      this.onClearSelected()
    },

    // 返回人员列表接口需要查询的字段。
    getQueryField() {
      return 'id,userId,orgId,username,realname,email,workNo,phone,status,status_dictText,createTime,updateTime'
    },

    // 校验是否已选择组织。
    hasSelectOrg() {
      if (!this.currentOrgId) {
        this.$message.error('请选择一个组织')
        return false
      }
      return true
    },

    // 打开已有用户选择弹窗并传入当前层级。
    handleAddUserRole() {
      if (!this.hasSelectOrg()) {
        return
      }
      this.$refs.selectUserModal.open(this.currentOrgId, this.selectedTreeKeys)
    },

    // 回收站操作成功后刷新人员列表。
    handleRecycleBinOk() {
      return this.refresh()
    },

    // 将选中的已有用户关联到当前组织和角色层级。
    selectOK(data) {
      const payload = this.buildAddSysUserPayload(data)

        payload.map(item => {
          // item.managerId = this.selectedTreeKeys[2]
          item.managerId = this.selectedTreeKeys.length === 3 ? this.selectedTreeKeys[2] : this.selectedTreeKeys[1]
          return item
        })
        // payload.managerId = this.selectedTreeKeys[2]
      if (!payload.length) {
        this.$message.warning('请选择需要关联的用户')
        return
      }
      return postAction(this.url.addSysUser, payload).then((res) => {
        if (res.success) {
          this.$message.success(res.message)
          return this.refresh()
        } else {
          this.$message.warning(res.message)
        }
      })
    },

    // 将单个人员移入回收站。
    handleDelete2(record) {
      if (!record || !record.id) {
        this.$message.warning('缺少用户ID，无法移出')
        return
      }
      return deleteAction(this.url.delete, {
        ids: record.id,
        type: 'maintain',
        deleteFlag: '是'
      }).then((res) => {
        if (res.success) {
          this.$message.success('移出成功')
          return this.refresh()
        } else {
          this.$message.warning(res.message)
        }
      })
    },
    // 批量将选中的人员移入回收站。
    batchDel2() {
      if (this.selectedRowKeys.length <= 0) {
        this.$message.warning('请选择一条记录！')
        return
      }
      const id = (this.selectionRows || [])
        .map((item) => item.id)
        .filter(Boolean)
        .join(',')
      if (!id) {
        this.$message.warning('缺少用户ID，无法删除')
        return
      }
      this.$confirm({
        title: '确认删除',
        content: '是否删除选中数据?',
        onOk: () => {
          return deleteAction(this.url.delete, {
            ids: this.selectedRowKeys.join(','),
            type: 'maintain',
            deleteFlag: '是'
          }).then((res) => {
            if (res.success) {
              this.$message.success(res.message)
              return this.refresh()
            } else {
              this.$message.warning(res.message)
            }
          })
        }
      })
    },

    // 打开批量更换绑定弹窗。
    openBatchRoleModal() {
      if (!this.selectedRowKeys.length) {
        this.$message.warning('请先选择需要换绑的人员')
        return
      }
      this.openRoleBindingModal()
    },
    openRowRoleModal(record) {
      if (!record) {
        return
      }
      this.openRoleBindingModal(record)
    },
    openRoleBindingModal(record = null) {
      this.batchRoleId = ''
      this.batchSelectedRole = null
      this.bindingTargetRecord = record
      this.batchRoleModalVisible = true
    },
    handleBatchRoleChange(role) {
      this.batchSelectedRole = role
      console.log('换绑选中的岗位角色', role)
    },
    confirmBatchRoleChange() {
      if (!this.batchSelectedRole || !this.batchSelectedRole.id) {
        this.$message.warning('请选择岗位角色')
        return
      }
      const rows = this.bindingTargetRecord ? [this.bindingTargetRecord] : (this.selectionRows || [])
      if (!rows.length || (!this.bindingTargetRecord && rows.length !== this.selectedRowKeys.length)) {
        this.$message.warning('换绑人员数据不完整，请重新选择后重试')
        return
      }
      const list = rows.map(item => ({ ...item,
         managerId: this.batchSelectedRole.id,
         beforeRoleId:item.managerId,
         endRoleId:this.batchSelectedRole.id,
        }))
      this.roleBindingSubmitting = true
      http://192.168.0.79:8180/qr-hrm/hrm/hrEmployeeInformation/changePostRole
      // return postAction('/hrm/hrEmployeeInformation/okEdit', list).then(res => {
      return postAction('/hrm/hrEmployeeInformation/changePostRole', list).then(res => {
        if (res.success) {
          this.$message.success(res.message || (this.bindingTargetRecord ? '换绑成功' : '批量更换绑定成功'))
          this.closeBatchRoleModal()
          return this.refresh().catch(() => {
            this.$message.warning('换绑成功，但列表刷新失败，请手动刷新')
          })
        } else {
          this.$message.warning(res.message || '换绑失败')
        }
      }).catch(() => {
        this.$message.error('换绑失败，请稍后重试')
      }).finally(() => {
        this.roleBindingSubmitting = false
      })
    },
    closeBatchRoleModal() {
      this.batchRoleModalVisible = false
    },
    // 根据人员姓名或账号生成头像文字。
    getAvatarText(record) {
      const text = String((record && (record.name || record.realname || record.username || record.userId)) || '')
      return text ? text.slice(-2) : '-'
    },

    // 将用户选择结果转换为新增系统用户接口参数。
    buildAddSysUserPayload(list) {
      // const selectedPostId = this.selectedTreeKeys[1]
      return (list || []).map(item => ({
        id: item.id,
        workNo: this.readAddSysUserValue(item, ['no']),
        username: this.readAddSysUserValue(item, ['no']),
        realname: this.readAddSysUserValue(item, ['name']),
        orgCode: this.readAddSysUserValue(item, ['dept']),
        mark: 'inside',
        // post: selectedPostId || this.readAddSysUserValue(item, ['postId']),
        post: this.readAddSysUserValue(item, ['postId']),
        phone: this.readAddSysUserValue(item, ['phoneNumber']),
        password: 'Aa123456@'
      })).filter(item => {
        return item.workNo || item.username || item.orgCode || item.post || item.telephone || item.id
      })
    },

    // 按候选字段顺序读取用户数据。
    readAddSysUserValue(record, keys, fallback) {
      const source = record || {}
      for (let i = 0; i < keys.length; i++) {
        const value = source[keys[i]]
        if (value !== undefined && value !== null && value !== '') {
          return value
        }
      }
      return fallback || ''
    },

    // 获取人员详情中的显示名称。
    getDisplayName(record) {
      return this.formatEmpty(record && (record.name || record.realname || record.username))
    },

    // 获取人员详情中的工号或组织副标题。
    getPersonSubTitle(record) {
      if (!record) {
        return '-'
      }
      return record.workNo || record.username || this.departmentText || '-'
    },

    // 将空值统一格式化为占位符。
    formatEmpty(value) {
      if (value === undefined || value === null || value === '') {
        return '-'
      }
      return value
    },

    // 将日期值格式化为秒级时间文本。
    formatDate(value) {
      if (!value) {
        return '-'
      }
      return String(value).replace('T', ' ').slice(0, 19)
    }
    }
}
</script>

<style scoped lang="less">
@keyframes new-ro-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes new-ro-fade-in-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes new-ro-scale-in {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.new-ro-personnel-list {
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  overflow: hidden;
  background: var(--new-ro-background, #f8fafd);
  animation: new-ro-slide-in-right 0.3s ease-out both;
}

.role-list-column {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
}

.role-list-panels {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
}

.role-group-panel {
  flex: 1;
  // width: 260px;
  // min-width: 240px;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.08);
  background: var(--new-ro-card, #ffffff);
  flex-shrink: 0;
  animation: new-ro-slide-in-left 0.3s ease-out both;
}
.role-filter-panel{
  flex: 1;
}

.role-group-header {
  // min-height: 62px;
  // padding: 12px 20px 10px;
  padding: 20px 20px 4px;
  display: flex;
  // align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-shrink: 0;

  h3 {
    margin: 0;
    color: rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.6);
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 2px;
  }

  span {
    min-width: 24px;
    height: 20px;
    padding: 0 7px;
    border-radius: 999px;
    background: rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.06);
    color: rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.55);
    font-size: 11px;
    line-height: 20px;
    text-align: center;
  }
}

.role-group-scroll {
  flex: 1;
  min-height: 0;
  padding: 4px 8px 16px;
  overflow-y: auto;
}

.role-list-search {
  padding: 0 16px 12px;
  flex-shrink: 0;

  /deep/ .ant-input {
    height: 32px;
    border: 0;
    border-radius: 8px;
    background: rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.03);
    color: var(--new-ro-foreground, #1a2a3d);
    box-shadow: none;
    font-size: 13px;
    transition: all 0.3s ease;
  }

  /deep/ .ant-input:focus {
    background: #ffffff;
    box-shadow: 0 0 0 2px rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.15), 0 0 0 4px rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.08);
  }

  /deep/ .ant-input-prefix {
    color: rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.3);
  }
}

.role-sortable-list {
  min-height: 1px;
}

.role-sort-ghost {
  opacity: 0.45;
}

.role-sort-dragging {
  opacity: 0.85;
}

.role-group-dropdown {
  display: block;
}

.role-group-item {
  width: 100%;
  min-height: 40px;
  margin: 0 0 3px;
  padding: 8px 12px;
  border: 0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  color: var(--new-ro-foreground, #1a2a3d);
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    background: rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.04);
  }

  &:active {
    transform: scale(0.99);
  }

  &.sort-enabled {
    cursor: move;
  }

  &.selected {
    background: rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.07);
    box-shadow: inset 0 0 0 1px rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.16);

    .role-group-name {
      color: var(--new-ro-primary, #2563eb);
      font-weight: 600;
    }
  }
}

.role-level-badge {
  min-width: 32px;
  height: 20px;
  padding: 0 7px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.06);
  color: var(--new-ro-primary, #2563eb);
  font-size: 11px;
  line-height: 20px;
  font-weight: 500;
  flex-shrink: 0;
}

.role-group-info {
  min-width: 0;
  flex: 1;
}

.role-group-name {
  display: block;
  overflow: hidden;
  color: var(--new-ro-foreground, #1a2a3d);
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.role-group-count {
  color: rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.42);
  font-size: 11px;
  line-height: 18px;
  white-space: nowrap;
  flex-shrink: 0;
}

.role-filter-panel {
  width: 240px;
  min-width: 220px;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.08);
  background: var(--new-ro-card, #ffffff);
  flex-shrink: 0;
  animation: new-ro-slide-in-left 0.3s ease-out both;
}

.role-filter-header {
  // min-height: 62px;
  // padding: 12px 18px 10px;
  padding: 20px 20px 4px;
  display: flex;
  // align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-shrink: 0;

  h3 {
    margin: 0;
    color: rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.6);
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 2px;
  }

  span {
    min-width: 24px;
    height: 20px;
    padding: 0 7px;
    border-radius: 999px;
    background: rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.06);
    color: rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.55);
    font-size: 11px;
    line-height: 20px;
    text-align: center;
  }
}

.role-filter-scroll {
  flex: 1;
  min-height: 0;
  padding: 4px 8px 16px;
  overflow-y: auto;

  /deep/ .ant-spin-nested-loading,
  /deep/ .ant-spin-container {
    height: 100%;
    min-height: 0;
  }
}

.role-filter-dropdown {
  display: block;
}

.role-filter-item {
  width: 100%;
  min-height: 58px;
  margin: 0 0 3px;
  padding: 10px 10px 10px 12px;
  border: 0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  color: var(--new-ro-foreground, #1a2a3d);
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    background: rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.04);

    .role-filter-more {
      opacity: 1;
    }
  }

  &:active {
    transform: scale(0.99);
  }

  &.sort-enabled {
    cursor: move;
  }

  &.selected {
    background: rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.07);
    box-shadow: inset 0 0 0 1px rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.16);

    .role-filter-name {
      color: var(--new-ro-primary, #2563eb);
      font-weight: 600;
    }
  }
}

.role-filter-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow: 0 0 0 2px #ffffff, 0 0 0 3px rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.15);
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.role-filter-dot-all {
  background: var(--new-ro-primary, #2563eb);
}

.role-filter-item:hover .role-filter-dot,
.role-filter-item.selected .role-filter-dot {
  transform: scale(1.25);
}

.role-filter-info {
  min-width: 0;
  display: flex;
  flex: 1;
  flex-direction: column;
}

.role-filter-name,
.role-filter-meta {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.role-filter-name {
  color: var(--new-ro-foreground, #1a2a3d);
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
}

.role-filter-meta {
  margin-top: 2px;
  color: rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.38);
  font-size: 11px;
  line-height: 16px;
}

.role-level-text {
  font-size: 10px;
  font-weight: 700;
}

.level-l1 {
  color: #dc2626;
}

.level-l2 {
  color: #ea580c;
}

.level-l3 {
  color: #2563eb;
}

.level-l4 {
  color: #16a34a;
}

.level-l5 {
  color: #9333ea;
}

.role-filter-count {
  color: rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.42);
  font-size: 11px;
  line-height: 18px;
  white-space: nowrap;
  flex-shrink: 0;
}

.role-filter-more {
  opacity: 0;
  color: rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.35);
  font-size: 16px;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
}

.role-filter-empty {
  padding-top: 60px;
}

.personnel-content {
  min-width: 0;
  height: 100%;
  display: flex;
  flex: 1;
  flex-direction: column;
  background: var(--new-ro-background, #f8fafd);
  animation: new-ro-slide-in-right 0.3s ease-out both;
}

.person-tabs {
  height: 53px;
  padding: 12px 24px 0;
  display: flex;
  align-items: flex-end;
  gap: 2px;
  border-bottom: 1px solid rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.08);
  background: var(--new-ro-card, #ffffff);
  flex-shrink: 0;
}

.person-tab {
  min-width: 120px;
  height: 40px;
  padding: 10px 20px;
  border: 0;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--new-ro-muted-foreground, #64748b);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}

.person-tab::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--new-ro-primary, #2563eb);
  border-radius: 999px;
  transform: translateX(-50%);
  transition: width 0.3s ease;
}

.person-tab-active {
  color: var(--new-ro-primary, #2563eb);

  &::after {
    width: 60%;
  }

  .anticon {
    transform: scale(1.15);
  }
}

.person-header {
  padding: 24px 24px 18px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 20px;
  background: var(--new-ro-card, #ffffff);
  flex-shrink: 0;
  animation: new-ro-fade-in 0.3s ease-out both;
}

.person-title-block {
  width: 100%;
  min-width: 0;
  padding: 18px 20px 0;
  flex-shrink: 0;
  background: #fff;

  h2 {
    margin: 0;
    font-size: 20px;
    line-height: 28px;
    font-weight: 600;
    letter-spacing: 0;
    color: var(--new-ro-primary, #2563eb);
    background: linear-gradient(135deg, var(--new-ro-primary, #2563eb), #4f7dff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.person-breadcrumb {
  width: 460px;
  max-width: 100%;
  min-width: 0;
  margin-top: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--new-ro-muted-foreground, #64748b);
  font-size: 13px;
}

.breadcrumb-item {
  // max-width: 72px;
  min-width: 0;
  display: block;
  flex: 0 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.breadcrumb-item.active {
  max-width: 120px;
  flex: 1 1 auto;
  color: var(--new-ro-primary, #2563eb);
  font-weight: 500;
}

.breadcrumb-sep {
  flex-shrink: 0;
  color: rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.3);
}

.person-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.person-total {
  color: var(--new-ro-muted-foreground, #64748b);
  font-size: 14px;
  font-variant-numeric: tabular-nums;

  strong {
    color: var(--new-ro-primary, #2563eb);
    font-weight: 600;
  }
}

.person-toolbar /deep/ .ant-btn-primary {
  height: 32px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--new-ro-primary, #2563eb), #4f7dff);
  box-shadow: 0 1px 4px rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.15);
  transition: all 0.2s ease;
}

.person-toolbar /deep/ .ant-btn-primary:hover,
.person-toolbar /deep/ .ant-btn-primary:focus {
  opacity: 0.9;
  background: linear-gradient(135deg, var(--new-ro-primary, #2563eb), #4f7dff);
}

.person-toolbar /deep/ .person-add-user-button.ant-btn-primary[disabled],
.person-toolbar /deep/ .person-add-user-button.ant-btn-primary[disabled]:hover,
.person-toolbar /deep/ .person-add-user-button.ant-btn-primary[disabled]:focus,
.person-toolbar /deep/ .person-add-user-button.ant-btn-primary[disabled]:active {
  color: rgba(0, 0, 0, 0.25);
  background: #f5f5f5;
  border-color: #d9d9d9;
  box-shadow: none;
  opacity: 1;
  cursor: not-allowed;
}

.person-toolbar {
  padding: 35px 24px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.08);
  background: var(--new-ro-card, #ffffff);
  flex-shrink: 0;
  animation: new-ro-fade-in-up 0.35s ease-out both;
}

.person-toolbar /deep/ .ant-btn {
  height: 32px;
  border-radius: 8px;
  font-size: 13px;
}

.person-search {
  width: 320px;
  max-width: 100%;

  /deep/ .ant-input {
    height: 36px;
    border: 0;
    border-radius: 8px;
    background: rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.03);
    color: var(--new-ro-foreground, #1a2a3d);
    box-shadow: none;
    font-size: 13px;
    transition: all 0.3s ease;
  }

  /deep/ .ant-input:focus {
    background: #ffffff;
    box-shadow: 0 0 0 2px rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.15), 0 0 0 4px rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.08);
  }

  /deep/ .ant-input-prefix {
    color: rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.3);
    transition: all 0.3s ease;
  }
}

.people-table-shell {
  flex: 1;
  min-height: 0;
  padding: 0;
  overflow: auto;
  background: var(--new-ro-background, #f8fafd);
  background: #fff;
}

.selected-alert {
  margin: 12px 24px 0;
  border: 1px solid rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.08);
  border-radius: 8px;
  background: rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.04);
}

.person-ant-table {
  animation: new-ro-fade-in 0.3s ease-out both;

  /deep/ .ant-table {
    color: var(--new-ro-foreground, #1a2a3d);
    background: transparent;
  }

  /deep/ .ant-table-content {
    background: var(--new-ro-card, #ffffff);
  }

  /deep/ .ant-table-thead > tr > th {
    height: 42px;
    padding: 10px 16px;
    background: #ffffff;
    // color: rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.5);
    font-size: 13px;
    // font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 1px solid rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.08);
  }

  /deep/ .ant-table-tbody > tr {
    cursor: pointer;
    transition: all 0.2s ease;
  }

  /deep/ .ant-table-tbody > tr > td {
    padding: 12px 16px;
    border-bottom: 1px solid rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.04);
    font-size: 14px;
  }

  /deep/ .ant-table-tbody > tr:hover > td {
    background: rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.03);
  }

  /deep/ .ant-table-placeholder {
    min-height: 180px;
    border-bottom: 1px solid rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.04);
  }

  /deep/ .ant-table-pagination.ant-pagination {
    margin: 16px 24px;
  }
}

.person-row-actions {
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  white-space: nowrap;
}

.person-action-link {
  padding: 4px 2px;
  border: 0;
  border-radius: 2px;
  background: transparent;
  color: #595959;
  font-family: inherit;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.2s ease;
}

.person-action-link:hover {
  color: var(--new-ro-primary, #2563eb);
}

.person-action-link:focus {
  outline: 2px solid rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.18);
  outline-offset: 1px;
}

.person-action-link:active {
  opacity: 0.72;
}

.person-action-link.primary {
  color: var(--new-ro-primary, #2563eb);
}

.person-action-link.primary:hover {
  color: #4096ff;
}

.person-action-link.danger,
.person-action-link.danger:focus {
  color: var(--new-ro-danger, #ef4444);
}

.person-action-link.danger:hover {
  color: #ff7875;
}

.person-table-cell {
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.person-detail-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  animation: new-ro-fade-in 0.2s ease-out both;
}

.person-detail-content {
  width: 90%;
  max-width: 460px;
  overflow: hidden;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  animation: new-ro-scale-in 0.25s ease-out both;
}

.person-detail-banner {
  padding: 24px 24px 16px;
  background: linear-gradient(135deg, var(--new-ro-primary, #2563eb), #4f7dff);
  background-size: 200% 200%;
  position: relative;
  overflow: hidden;
}

.person-detail-banner::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 25%, rgba(255, 255, 255, 0.08) 50%, transparent 75%);
  background-size: 200% 100%;
}

.person-detail-banner-inner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.person-detail-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.person-detail-avatar-image {
  display: block;
  object-fit: cover;
  background: #ffffff;
}

.person-detail-avatar-fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  background: linear-gradient(135deg, #2dd4bf, #2563eb);
}

.person-detail-title {
  min-width: 0;
  flex: 1;
}

.person-detail-name {
  color: #ffffff;
  font-size: 16px;
  line-height: 22px;
  font-weight: 600;
}

.person-detail-position {
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 14px;
}

.person-detail-close {
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.person-detail-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.person-detail-body {
  padding: 24px;
}

.person-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.person-detail-field {
  min-width: 0;
}

.person-detail-field-wide {
  grid-column: span 2;
}

.person-detail-label,
.person-detail-section-title {
  margin-bottom: 4px;
  color: rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.4);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.person-detail-value {
  color: var(--new-ro-foreground, #1a2a3d);
  font-size: 14px;
  word-break: break-all;
}

.person-detail-section {
  margin-bottom: 20px;
}

.person-detail-contacts {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  color: rgba(26, 42, 61, 0.72);
  font-size: 14px;
}

.person-detail-contacts span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.person-detail-contacts .anticon {
  color: rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.4);
}

.person-detail-footer {
  display: flex;
  gap: 8px;
  padding-top: 8px;
}

.detail-btn-outline {
  flex: 1;
  height: 32px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.detail-btn-outline {
  border: 1px solid rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.15);
  background: #ffffff;
  color: var(--new-ro-foreground, #1a2a3d);
}

.detail-btn-outline:hover {
  border-color: rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.25);
  background: rgba(var(--new-ro-primary-rgb, 37, 99, 235), 0.05);
}
.empty-tips {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  color: #cbe1fb;
  font-size: 16px;
  font-weight: bold;
  margin-top: 50px;
  padding: 0 10px;
  .tips_icon {
    margin-bottom: 20px;
    }
  .tips_1 {
    font-weight: bold;
    font-size: 13px;
  }
  .tips_2 {
    font-weight: normal;
    font-size: 13px;
  }
}
@media (max-width: 520px) {
  .new-ro-personnel-list {
    min-height: 620px;
  }

  .role-group-panel {
    width: 220px;
    min-width: 220px;
  }

  .role-filter-panel {
    width: 210px;
    min-width: 210px;
  }

  .person-header,
  .person-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .person-header-actions {
    flex-wrap: wrap;
  }

  .person-search {
    width: 100%;
  }
}
</style>

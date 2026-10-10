<template>
  <a-modal
    :title="modalTitle"
    :visible="visible"
    :width="920"
    :confirmLoading="submitting"
    :dialogStyle="{
      top:'15px'
    }"
    :bodyStyle="{ maxHeight: '80vh', overflowY: 'auto' }"
    okText="保存"
    cancelText="取消"
    @ok="handleOk"
    @cancel="close"
  >
    <a-form-model ref="roleForm" :model="model" :rules="rules" layout="vertical">
      <a-row :gutter="24">
        <a-col :span="24">
            <a-col :span="24">
          <a-form-model-item label="角色名称" prop="roleName">
            <a-input v-model.trim="model.roleName" placeholder="请输入角色名称"  @input="autoSearch" />
          </a-form-model-item>
        </a-col>
        <!-- <a-col :span="12">
          <a-form-model-item label="角色编码" prop="roleCode">
            <a-input v-model.trim="model.roleCode" :disabled="false" placeholder="请输入角色编码" />
          </a-form-model-item>
        </a-col> -->
        </a-col>
      <a-col :span="24">
        <a-col :span="24">
          <a-form-model-item label="所属组织" prop="deptId">
            <a-input :value="deptName" disabled />
          </a-form-model-item>
        </a-col>
        <!-- <a-col :span="12">
          <a-form-model-item label="状态">
            <a-radio-group v-model="model.status" buttonStyle="solid">
              <a-radio-button :value="1">启用</a-radio-button>
              <a-radio-button :value="0">停用</a-radio-button>
            </a-radio-group>
          </a-form-model-item>
        </a-col> -->
      </a-col>
       <a-col :span="24">
        <a-col :span="24">
          <a-form-model-item label="角色描述" prop="description">
            <a-textarea v-model.trim="model.description" :rows="2" placeholder="请输入角色描述" />
          </a-form-model-item>
        </a-col>
        </a-col>
      </a-row>

      <template v-if="pid === '0'">
      <a-form-model-item label="绑定岗位" prop="sequenceId" class="position-form-item" v-if="positionShow">
        <div class="position-picker">
          <section class="position-picker-pane dept-pane">
            <header class="position-picker-header">
              <span><a-icon type="bank" /> 选择部门</span>
            </header>
            <div class="position-picker-search">
              <a-input v-model.trim="deptKeyword" allowClear placeholder="搜索部门...">
                <a-icon slot="prefix" type="search" />
              </a-input>
            </div>
            <div class="position-picker-body dept-tree-body">
              <a-tree
                v-if="visibleTreeData.length"
                :defaultExpandedKeys="selectedDeptKeys"
                :treeData="visibleTreeData"
                :defaultSelectedKeys="selectedDeptKeys"
                :selectedKeys="selectedDeptKeys"
                @select="handleDeptSelect"
              >
                <template slot="orgTitle" slot-scope="node">
                  <span class="dept-tree-title">
                    <a-icon type="folder-open" />
                    <span>{{ node.title }}</span>
                    <small v-if="node.children && node.children.length">{{ node.children.length }}</small>
                  </span>
                </template>
              </a-tree>
              <a-empty v-else description="暂无组织" />
            </div>
          </section>

          <section class="position-picker-pane position-pane">
            <header class="position-picker-header">
              <span><a-icon type="user" /> {{ positionDeptName || '请选择部门' }}</span>
              <!-- <small v-if="model.sequenceId">已选 {{ model.sequenceId }} 个</small> -->
            </header>
            <div class="position-picker-search flex items-center gap-10">
              <j-input
                v-model.trim="positionKeyword"
                allowClear
                placeholder="搜索岗位..."
                @pressEnter="searchPositions"
              />
              <a-button type="primary" @click="searchPositions">搜索</a-button>
            </div>
            <div class="position-picker-body position-list-body">
              <a-spin :spinning="positionLoading">
                <div v-if="positions.length" class="position-list">
                  <button
                    v-for="position in positions"
                    :key="position.id"
                    type="button"
                    class="position-item"
                    :class="{ active: isPositionSelected(position.id) }"
                    @click="togglePosition(position)"
                  >
                    <span class="position-item-main">
                     <div class="flex gap-10 items-end">
                      <strong>{{ position.postName || '-' }}</strong>
                      <small>{{ position.gwsl_dictText || position.gwsl || '未设置岗位序列' }}</small>
                     </div>
                      <small style="font-size: 11px;">{{ position.mainDeptPath.endsWith('/') ? position.mainDeptPath.slice(0, -1) : position.mainDeptPath || '' }}</small>
                    </span>
                    <a-icon :type="isPositionSelected(position.id) ? 'check-circle' : 'plus-circle'" />
                  </button>
                </div>
                <a-empty v-else :description="selectedDeptKeys.length ? '暂无岗位' : '请选择部门'" />
              </a-spin>
            </div>
            <footer class="position-pagination">
              <a-pagination
                size="small"
                showSizeChanger
                :current="positionPagination.current"
                :pageSize="positionPagination.pageSize"
                :pageSizeOptions="positionPagination.pageSizeOptions"
                :total="positionPagination.total"
                :showTotal="total => '共 ' + total + ' 条'"
                @change="handlePositionPageChange"
                @showSizeChange="handlePositionPageSizeChange"
              />
            </footer>
          </section>
        </div>
      </a-form-model-item>
      </template>
    </a-form-model>
  </a-modal>
</template>

<script>
import { getAction } from '@/api/manage'
import { addRole, editRole } from '@/api/api'
import debounce from 'lodash/debounce';

export default {
  name: 'RoleAddModal',
  props: {
    treeData: {
      type: Array,
      default: () => []
    },
    positionShow: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      visible: false,
      submitting: false,
      pid: '0',
      positionLoading: false,
      deptName: '',
      positionDeptName: '',
      deptKeyword: '',
      positionKeyword: '',
      selectedDeptKeys: [],
      positions: [],
      positionPagination: {
        current: 1,
        pageSize: 10,
        pageSizeOptions: ['10', '20', '50'],
        total: 0
      },
      model: {
        roleName: '',
        roleCode: '',
        deptId: '',
        status: 1,
        description: '',
        sequenceId: ''
      },
      upperDictCode:'',
      rules: {
        roleName: [
          { required: true, message: '请输入角色名称' },
          { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
        ],
        roleCode: [
          { required: true, message: '请输入角色编码' },
          { max: 64, message: '长度不超过 64 个字符', trigger: 'blur' },
          { pattern: /^[^\u4e00-\u9fa5]+$/, message: '角色编码不可输入汉字', trigger: 'blur' }
        ],
        deptId: [{ required: true, message: '请选择所属组织' }],
        description: [{ max: 126, message: '长度不超过 126 个字符', trigger: 'blur' }]
      },
      url: {
        positionList: '/hrJobSequence/hrJobSequence/childrenList'
      }
    }
  },
  computed: {
    modalTitle() {
      return this.model.id ? '编辑角色' : '新增角色'
    },
    visibleTreeData() {
      return this.deptKeyword ? this.filterTreeData(this.treeData, this.deptKeyword) : this.treeData
    }
  },
  created() {
    this.autoSearch = debounce(this.searchRoleCode, 500)
  },
  methods: {
    autoSearch() {
      if (!this.model.roleName) {
        this.searchPositions()
      }
    },
    searchRoleCode(){
      console.log('roleName',this.model.roleName)
      console.log('upperDictCode',this.upperDictCode)
      // if(this.model.roleCode || !this.model.roleName){
      //   return
      // }
      if( !this.model.roleName){
        return
      }
      const params = {
        name: this.model.roleName,
        code: this.upperDictCode
      }
      getAction('/hrCode/getCode',params).then(res => {
        if (res.success) {
          const code = res.message || '';
          this.model.roleCode = code
        } else {
          this.$message.warning(res.message || '角色编码获取失败')
        }
      }).catch(() => {
        this.$message.warning('角色编码获取失败')
      })
      console.log('roleCode',this.model.roleCode)
    },
    // 打开新增角色弹窗，并根据当前组织初始化表单数据。
    open(node, options = {}, upperDictCode= '') {
      const deptId = String(options.deptId || node.id || node.key)
      this.pid = String(options.pid === undefined ? '0' : options.pid)
      this.model = {
        roleName: '',
        roleCode: '',
        deptId,
        status: 1,
        description: '',
        sequenceId: options.sequenceId ? String(options.sequenceId) : ''
      }
      this.upperDictCode = upperDictCode
      this.show(node, deptId)
    },
    // 打开编辑角色弹窗，并回填已有角色信息。
    edit(record, node, options = {}) {
      const deptId = String(record.deptId || node.id || node.key)
      const pid = options.pid === undefined ? record.pid : options.pid
      this.pid = String(pid === undefined ? '0' : pid)
      this.model = Object.assign({}, record, {
        deptId,
        sequenceId: record.sequenceId ? String(record.sequenceId) : ''
      })
      this.show(node, deptId)
    },
    // 统一初始化弹窗状态，并加载当前部门下的岗位列表。
    show(node, deptId) {
      this.deptName = node.path && node.path.length ? node.path.join(' / ') : node.title
      this.positionDeptName = node.title
      this.deptKeyword = ''
      this.positionKeyword = ''
      this.selectedDeptKeys = [deptId]
      this.positions = []
      this.positionPagination.current = 1
      this.positionPagination.total = 0
      this.visible = true
      this.$nextTick(() => this.$refs.roleForm.clearValidate())
      this.loadPositions(deptId)
    },
    // 关闭弹窗并清空当前岗位列表。
    close() {
      this.visible = false
      this.positions = []
    },
    // 按关键字过滤组织树，同时保留命中节点的父级链路。
    filterTreeData(list, keyword) {
      const text = keyword.toLowerCase()
      return (list || []).reduce((result, item) => {
        const children = this.filterTreeData(item.children || [], keyword)
        if (String(item.title || '').toLowerCase().indexOf(text) > -1 || children.length) {
          result.push(Object.assign({}, item, { children }))
        }
        return result
      }, [])
    },
    // 切换所属部门后同步表单字段，并重新加载对应岗位。
    handleDeptSelect(selectedKeys, event) {
      if (!selectedKeys.length) {
        return
      }
      const node = event.node.dataRef
      const deptId = String(node.id || node.key)
      this.selectedDeptKeys = [deptId]
      this.model.deptId = deptId
      this.positionDeptName = node.title
      this.positionKeyword = ''
      this.positionPagination.current = 1
      this.loadPositions(deptId)
    },
    // 按当前关键字重新查询岗位列表，并重置到第一页。
    searchPositions() {
      this.positionPagination.current = 1
      this.loadPositions(this.selectedDeptKeys[0])
    },
    // 切换岗位分页页码时，按最新分页参数重新加载列表。
    handlePositionPageChange(page, pageSize) {
      this.positionPagination.current = page
      this.positionPagination.pageSize = pageSize
      this.loadPositions(this.selectedDeptKeys[0])
    },
    // 切换岗位分页条数时，回到第一页并刷新岗位列表。
    handlePositionPageSizeChange(current, pageSize) {
      this.positionPagination.current = 1
      this.positionPagination.pageSize = pageSize
      this.loadPositions(this.selectedDeptKeys[0])
    },
    // 加载当前部门下的岗位数据，并同步分页总数和加载态。
    loadPositions(deptId) {
      this.positionLoading = true
      this.positions = []
      getAction(this.url.positionList, {
        deptId,
        postName: this.positionKeyword,
        pageNo: this.positionPagination.current,
        pageSize: this.positionPagination.pageSize,
        // column: 'createTime',
        // order: 'desc'
      }).then(res => {
        if (res.success) {
          const result = res.result || {}
          this.positions = Array.isArray(result) ? result : (result.records || [])
          this.positionPagination.total = Array.isArray(result) ? result.length : Number(result.total || 0)
        } else {
          this.positionPagination.total = 0
          this.$message.warning(res.message || '岗位加载失败')
        }
      }).finally(() => {
        this.positionLoading = false
      })
    },
    // 判断某个岗位是否为当前角色已绑定的岗位。
    isPositionSelected(positionId) {
      return this.model.sequenceId === String(positionId)
    },
    // 选中岗位后回填岗位序列，并清除对应校验提示。
    togglePosition(position) {
      const id = String(position.id)
      this.model.sequenceId = id
      this.$refs.roleForm && this.$refs.roleForm.clearValidate(['sequenceId'])
    },
    // 校验表单后提交新增或编辑请求，并在成功后通知父组件刷新。
    handleOk() {
      this.$refs.roleForm.validate(valid => {
        if (!valid) {
          return
        }
        this.submitting = true
        const payload = {
          ...this.model,
          pid: this.pid
        }
        const request = this.model.id ? editRole(payload) : addRole(payload)
        request.then(res => {
          if (res.success) {
            this.$message.success(res.message || (this.model.id ? '角色编辑成功' : '角色新增成功'))
            this.$emit('ok', res.result)
            this.close()
          } else {
            this.$message.warning(res.message || (this.model.id ? '角色编辑失败' : '角色新增失败'))
          }
        }).finally(() => {
          this.submitting = false
        })
      })
    }
  }
}
</script>

<style scoped lang="less">
.position-form-item {
  margin-bottom: 0;
}

.position-picker {
  height: 350px;
  display: grid;
  grid-template-columns: 42% 58%;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #ffffff;
}

.position-picker-pane {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.position-pane {
  border-left: 1px solid #e2e8f0;
}

.position-picker-header {
  flex: 0 0 50px;
  height: 50px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
  color: #1f2937;
  font-weight: 600;
  line-height: 1;
}

.position-picker-header .anticon {
  margin-right: 6px;
  color: #1677ff;
}

.position-picker-header small {
  color: #1677ff;
  font-size: 12px;
  font-weight: 400;
}

.position-picker-search {
  flex: 0 0 auto;
  padding: 12px;
  border-bottom: 1px solid #edf2f7;
}

.position-picker-body {
  flex: 1;
  min-height: 0;
  height: 0;
  overflow-y: auto;
  scrollbar-gutter: stable;
}
/deep/ .ant-form-item {
  margin-bottom: 15px;
}
.dept-tree-body {
  padding: 8px 10px 14px;
}

.dept-tree-body /deep/ .ant-tree-node-content-wrapper {
  width: calc(100% - 24px);
}

.dept-tree-title {
  width: 100%;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.dept-tree-title .anticon {
  color: #52c41a;
}

.dept-tree-title span {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dept-tree-title small {
  color: #94a3b8;
  font-size: 11px;
}

.position-list-body {
  padding: 12px;
}

.position-list-body /deep/ .ant-spin-nested-loading,
.position-list-body /deep/ .ant-spin-container {
  height: 100%;
  min-height: 100%;
}

.position-pagination {
  flex: 0 0 auto;
  padding: 10px 12px;
  border-top: 1px solid #edf2f7;
  text-align: right;
}

.position-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.position-item {
  width: 100%;
  min-height: 54px;
  padding: 9px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #ffffff;
  color: #64748b;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.position-item:hover,
.position-item.active {
  border-color: #1677ff;
  background: #eaf3ff;
  color: #1677ff;
}

.position-item-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.position-item-main strong,
.position-item-main small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.position-item-main strong {
  color: #1f2937;
  font-size: 13px;
}

.position-item-main small {
  margin-top: 3px;
  color: #94a3b8;
  font-size: 12px;
}

.position-item.active .position-item-main strong {
  color: #1677ff;
}

@media (max-width: 760px) {
  .position-picker {
    height: 560px;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }

  .position-picker-pane {
    min-height: 0;
  }

  .position-pane {
    border-top: 1px solid #e2e8f0;
    border-left: none;
  }
}
</style>

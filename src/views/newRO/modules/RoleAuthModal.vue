<template>
  <a-drawer
    :title="title"
    placement="right"
    :closable="true"
    :visible="visible"
    :width="drawerWidth"
    @close="handleCancel"
  >
    <template v-if="roleId">
      <a-spin :spinning="loading">
        <a-form>
          <a-form-item label="所拥有的权限">
            <a-tree
              checkable
              class="role-auth-tree"
              :checkedKeys="checkedKeys"
              :treeData="treeData"
              :selectedKeys="selectedKeys"
              :expandedKeys="expandedKeys"
              :checkStrictly="checkStrictly"
              @check="onCheck"
              @expand="onExpand"
              @select="onTreeNodeSelect"
            >
              <span slot="hasDatarule" slot-scope="{ slotTitle, ruleFlag }">
                {{ slotTitle }}
                <a-icon v-if="ruleFlag" type="align-left" style="margin-left: 5px; color: red;" />
              </span>
            </a-tree>
          </a-form-item>
        </a-form>
      </a-spin>
      <div class="drawer-bottom-button">
        <a-dropdown :trigger="['click']" placement="topCenter">
          <a-menu slot="overlay">
            <a-menu-item key="3" @click="checkALL">全部勾选</a-menu-item>
            <a-menu-item key="4" @click="cancelCheckALL">取消全选</a-menu-item>
            <a-menu-item key="5" @click="expandAll">展开所有</a-menu-item>
            <a-menu-item key="6" @click="closeAll">合并所有</a-menu-item>
          </a-menu>
          <a-button>
            树操作
            <a-icon type="up" />
          </a-button>
        </a-dropdown>
        <a-button type="primary" htmlType="button" icon="form" @click="handleSubmit">保存</a-button>
      </div>
    </template>
    <div v-else class="role-auth-empty">
      <a-empty>
        <span slot="description">请先选择一个角色</span>
      </a-empty>
    </div>
  </a-drawer>
</template>

<script>
import { queryRolePermission, queryDepartPermission, queryTreeListForRole, saveRolePermission } from '@/api/api'

export default {
  name: 'RoleAuthModal',
  data() {
    return {
      roleId: '',
      treeData: [],
      defaultCheckedKeys: [],
      checkedKeys: [],
      expandedKeys: [],
      allTreeKeys: [],
      checkStrictly: true,
      title: '角色权限配置',
      visible: false,
      loading: false,
      departId: '',
      parentRoleId: '',
      selectedKeys: [],
      drawerWidth: 720
    }
  },
  created() {
    this.resetScreenSize()
  },
  methods: {
    // 打开角色权限抽屉并初始化当前角色及权限范围参数。
    show(roleId, options = {}) {
      this.roleId = roleId || ''
      this.title = this.getDrawerTitle(options)
      this.departId = options.departId || ''
      this.parentRoleId = options.parentRoleId || ''
      this.visible = true
      this.resetScreenSize()
      if (!this.roleId) {
        this.reset()
        return
      }
      this.loadData()
    },
    // 关闭抽屉并清空本次权限配置状态。
    close() {
      this.visible = false
      this.roleId = ''
      this.departId = ''
      this.parentRoleId = ''
      this.title = '角色权限配置'
      this.reset()
      this.$emit('close')
    },
    // 重置权限树、勾选项和加载状态。
    reset() {
      this.treeData = []
      this.expandedKeys = []
      this.checkedKeys = []
      this.defaultCheckedKeys = []
      this.allTreeKeys = []
      this.selectedKeys = []
      this.loading = false
    },
    // 记录当前选中的权限树节点。
    onTreeNodeSelect(selectedKeys) {
      this.selectedKeys = selectedKeys || []
    },
    // 更新权限树的勾选结果。
    onCheck(checkedKeys) {
      this.checkedKeys = this.checkStrictly ? checkedKeys.checked : checkedKeys
    },
    // 更新权限树的展开节点。
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys
    },
    // 展开权限树全部节点。
    expandAll() {
      this.expandedKeys = this.allTreeKeys
    },
    // 收起权限树全部节点。
    closeAll() {
      this.expandedKeys = []
    },
    // 勾选权限树全部节点。
    checkALL() {
      this.checkedKeys = this.allTreeKeys
    },
    // 取消权限树全部勾选。
    cancelCheckALL() {
      this.checkedKeys = []
    },
    // 处理抽屉取消操作。
    handleCancel() {
      this.close()
    },
    // 保存当前角色的权限配置。
    handleSubmit() {
      if (!this.roleId) {
        this.$message.warning('请点击选择一个角色!')
        return
      }
      const params = {
        roleId: this.roleId,
        permissionIds: this.checkedKeys.join(','),
        lastpermissionIds: this.defaultCheckedKeys.join(',')
      }
      this.loading = true
      saveRolePermission(params).then(res => {
        if (res.success) {
          this.$message.success(res.message || '权限保存成功')
          return this.loadData()
        }
        this.$message.error(res.message || '权限保存失败')
        return null
      }).finally(() => {
        this.loading = false
      })
    },
    // 根据角色名称生成抽屉标题。
    getDrawerTitle(options) {
      const name = options.title || options.name || ''
      return name ? `${name} 权限配置` : '角色权限配置'
    },
    // 加载权限树，并按上层角色权限或部门权限筛选可配置范围。
    loadData() {
      this.loading = true
      return queryTreeListForRole().then(res => { // 所有树形权限数据
        if (!res.success) {
          this.$message.error(res.message || '权限列表加载失败')
          return null
        }
        const result = res.result || {}
        const treeData = result.treeList || []
        this.allTreeKeys = result.ids || []
        // this.treeData = treeData
        if (this.parentRoleId) {
          return queryRolePermission({ roleId: this.parentRoleId }).then(result => {
            if (!result.success) {
              this.$message.error(result.message || '上层角色权限加载失败')
              return null
            }
            const permissionKeys = Array.isArray(result.result) ? result.result : []
            this.treeData = this.filterTreeByPermission(treeData, permissionKeys)
            return this.loadData2()
          })
        }
        return queryDepartPermission({ departId: this.departId }).then(result => {
          const permissionKeys = Array.isArray(result.result) ? result.result : []
          this.treeData = this.filterTreeByPermission(treeData, permissionKeys)
          return this.loadData2()
        })
      }).finally(() => {
        this.loading = false
      })
    },
    // 加载当前角色已拥有的权限并更新勾选状态。
    loadData2() {
      return queryRolePermission({ roleId: this.roleId }).then(res => {
        if (!res) {
          return
        }
        if (!res.success) {
          this.$message.error(res.message || '角色权限加载失败')
          return
        }
        const permissionKeys = Array.isArray(res.result) ? res.result : []
        this.checkedKeys = [...permissionKeys]
        this.defaultCheckedKeys = [...permissionKeys]
        this.expandedKeys = [...this.allTreeKeys]
      })
    },
    // 保留权限范围内的节点及其必要父级节点。
     filterTreeByPermission(tree, permissionKeys) {
          const keySet = new Set(permissionKeys);
          function loop(list) {
            return list
              .map(item => {
                const children = Array.isArray(item.children)
                  ? loop(item.children)
                  : [];

                const isMatched = keySet.has(item.key);

                if (isMatched || children.length > 0) {
                  return {
                    ...item,
                    children
                  };
                }

                return null;
              })
              .filter(Boolean);
          }
          return loop(tree || []);
    },

    // 根据当前屏幕宽度调整抽屉宽度。
    resetScreenSize() {
      const screenWidth = document.body.clientWidth
      this.drawerWidth = screenWidth < 900 ? screenWidth : 720
    }
  }
}
</script>

<style scoped lang="less">
.role-auth-tree {
  height: calc(100vh - 200px);
  min-height: 420px;
  overflow: auto;
}

.drawer-bottom-button {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.role-auth-empty {
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

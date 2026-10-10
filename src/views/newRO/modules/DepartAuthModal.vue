<template>
  <a-drawer
    :title="title"
    placement="right"
    :closable="true"
    :visible="visible"
    :width="drawerWidth"
    @close="handleCancel"
  >
    <template v-if="departId">
      <a-spin :spinning="loading">
        <a-form>
          <a-form-item label="所拥有的权限">
            <a-tree
              checkable
              class="depart-auth-tree"
              :checkedKeys="checkedKeys"
              :treeData="treeData"
              :selectedKeys="selectedKeys"
              :expandedKeys="expandedKeysss"
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
        <a-button @click="handleSubmit" type="primary" htmlType="button" icon="form">保存</a-button>
      </div>
    </template>
    <div v-else class="depart-auth-empty">
      <a-empty>
        <span slot="description">请先选择一个部门</span>
      </a-empty>
    </div>
  </a-drawer>
</template>

<script>
import { queryTreeListForRole, queryDepartPermission, saveDepartPermission } from '@/api/api'
export default {
  name: 'DepartAuthModal',
  components: {  },
  data() {
    return {
      departId: '',
      treeData: [],
      defaultCheckedKeys: [],
      checkedKeys: [],
      halfCheckedKeys: [],
      expandedKeysss: [],
      allTreeKeys: [],
      autoExpandParent: true,
      checkStrictly: false,
      title: '部门权限配置',
      visible: false,
      loading: false,
      selectedKeys: [],
      drawerWidth: 720
    }
  },
  created() {
    this.resetScreenSize()
  },
  methods: {
    onTreeNodeSelect(id) {
      if (id && id.length > 0) {
        this.selectedKeys = id
      }
      if (!this.selectedKeys.length) {
        return
      }
      this.$refs.datarule.show(this.selectedKeys[0], this.departId)
    },
    onCheck (checkedKeys, { halfCheckedKeys }) {
        // 保存选中的和半选中的，后面保存的时候合并提交
        this.checkedKeys = checkedKeys
        this.halfCheckedKeys = halfCheckedKeys
      },
    show(departId, options = {}) {
      this.departId = departId || ''
      this.title = this.getDrawerTitle(options)
      this.pid = options.pid || '' // 集团id
      this.visible = true
      this.resetScreenSize()
      if (!this.departId) {
        this.reset()
        return
      }

      // this.loadData()
      this.loadBossData()
    },
    close() {
      this.visible = false
      this.departId = ''
      this.title = '部门权限配置'
      this.reset()
      this.$emit('close')
    },
    onExpand(expandedKeys) {
      this.expandedKeysss = expandedKeys
      this.autoExpandParent = false
    },
    reset() {
      this.expandedKeysss = []
      this.checkedKeys = []
      this.defaultCheckedKeys = []
      this.halfCheckedKeys = []
      this.selectedKeys = []
      this.loading = false
    },
    expandAll() {
      this.expandedKeysss = this.allTreeKeys
    },
    closeAll() {
      this.expandedKeysss = []
    },
    checkALL() {
      this.checkedKeys = this.allTreeKeys
      this.halfCheckedKeys = []
    },
    cancelCheckALL() {
      this.checkedKeys = []
      this.halfCheckedKeys = []
    },
    handleCancel() {
      this.close()
    },
    handleSubmit() {
      let that = this;
        if(!that.departId){
          this.$message.warning('请点击选择一个部门!')
        }
        let checkedKeys = [...that.checkedKeys, ...that.halfCheckedKeys]
        const permissionIds = checkedKeys.join(",")
        let params =  {
          departId:that.departId,
          permissionIds,
          lastpermissionIds:that.defaultCheckedKeys.join(","),
        };
        that.loading = true;
        saveDepartPermission(params).then((res)=>{
          if(res.success){
            that.$message.success(res.message);
            that.loading = false;
            that.loadBossData();
          }else {
            that.$message.error(res.message);
            that.loading = false;
          }
        })
    },
    convertTreeListToKeyLeafPairs(treeList, keyLeafPair = []) {
      for (const { key, isLeaf, children } of treeList) {
        keyLeafPair.push({ key, isLeaf })
        if (children && children.length > 0) {
          this.convertTreeListToKeyLeafPairs(children, keyLeafPair)
        }
      }
      return keyLeafPair
    },
    getDrawerTitle(options) {
      const name = options.title || options.name || ''
      return name ? `${name} 权限配置` : '部门权限配置'
    },
    loadBossData(){
      // 查询上级部门选中的权限
      queryDepartPermission({ departId: this.pid }).then((result) => {
        // boss选中的权限id
        console.log('result',result)
          const permissionKeys = Array.isArray(result.result) ? result.result : []
          console.log('permissionKeys', permissionKeys)
         this.loadData(permissionKeys)
        })
    },
    loadData(MainIds) {
      this.loading = true
      queryTreeListForRole().then((res) => {
        // isAllTree
        // this.treeData = res.result.treeList
        // this.allTreeKeys = res.result.ids
        const treeData = res.result.treeList
        const allTreeKeys = res.result.ids
        this.allTreeKeys = allTreeKeys
       console.log('treeData',treeData)
       console.log('MainIds',MainIds)
       if(this.pid === '0'){ // 集团 直接展示全部树
          this.treeData = treeData
       }else{
        this.treeData = this.filterTreeByPermission(treeData, MainIds)
       }
        const keyLeafPairs = this.convertTreeListToKeyLeafPairs(this.treeData)
        queryDepartPermission({ departId: this.departId }).then((result) => {
          const permissionKeys = Array.isArray(result.result) ? result.result : []
           // 过滤出 leaf node 即可，即选中的
            // Tree组件中checkStrictly默认为false的时候，选中子节点，父节点会自动设置选中或半选中
            // 保存 checkedKeys 以及 halfCheckedKeys 以便于未做任何操作时提交表单数据
          const checkedKeys = permissionKeys.filter(key => {
            const keyLeafPair = keyLeafPairs.filter(item => item.key === key)[0]
            return keyLeafPair && keyLeafPair.isLeaf
          })
          const halfCheckedKeys = permissionKeys.filter(key => {
            const keyLeafPair = keyLeafPairs.filter(item => item.key === key)[0]
            return keyLeafPair && !keyLeafPair.isLeaf
          })
          this.checkedKeys = [...checkedKeys]
          this.halfCheckedKeys = [...halfCheckedKeys]
          this.defaultCheckedKeys = [...halfCheckedKeys, ...checkedKeys]
          this.expandedKeysss = this.allTreeKeys
          this.loading = false
        })
      })
    },
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
    resetScreenSize() {
      const screenWidth = document.body.clientWidth
      if (screenWidth < 900) {
        this.drawerWidth = screenWidth
      } else {
        this.drawerWidth = 720
      }
    }
  }
}
</script>

<style scoped lang="less">
.depart-auth-tree {
  // height: calc(100vh - 270px);
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

.depart-auth-empty {
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

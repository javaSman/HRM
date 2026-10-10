<template>
  <div class="employee-info-page">
    <div class="employee-info-layout">
      <org-structure-tree
        ref="orgTree"
        v-model="selectedOrgId"
        :extra-context-menu-items="extraContextMenuItems"
        :extra-context-menu-append-default="true"
        @change="handleOrgChange"
        @treeData="getTreeData"
        @custom-context-menu-click="handleTreeContextMenuClick"
      />
      <employee-list ref="employeeListRef" :org-id="selectedOrgId" :department="selectedOrgNode" :treeData="treeData" />
    </div>
    <set-manager-modal ref="setManagerModal" @edit="handleManagerEdit" />
  </div>
</template>

<script>
import OrgStructureTree from '@/components/tree/OrgStructureTree.vue'
import EmployeeList from './modules/EmployeeList.vue'
import SetManagerModal from '@/views/newRO/modules/SetManagerModal.vue'

export default {
  name: 'EmployeeInfo',
  components: {
    OrgStructureTree,
    EmployeeList,
    SetManagerModal
  },
  data() {
    return {
      selectedOrgId: '',
      selectedOrgNode: null,
      treeData: [],
      extraContextMenuItems: [
        {
          key: 'setManager',
          title: '设置负责人',
          icon: 'user'
        }
      ]
    }
  },
  methods: {
    getTreeData(treeData) {
      this.treeData = treeData
      if (this.$refs.employeeListRef && this.$refs.employeeListRef.loadData) {
        this.$refs.employeeListRef.loadData()
      }
    },
    handleOrgChange(node) {
      this.selectedOrgNode = node || null
    },
    handleTreeContextMenuClick(payload) {
      if (!payload || payload.key !== 'setManager') {
        return
      }
      const node = payload.node
      if (!node) {
        return
      }
      this.selectedOrgNode = node
      this.selectedOrgId = node.id 
      this.$refs.setManagerModal.open(node,node.departPrincipal) // 拿到负责人id 回显
    },
    handleManagerEdit(departPrincipal) {
      if (departPrincipal === undefined || departPrincipal === null || departPrincipal === '') {
        this.$message.warning('请选择负责人')
        return
      }
      if (!this.$refs.orgTree) {
        this.$message.warning('未获取到组织标识，无法设置负责人')
        return
      }
      this.$refs.orgTree.submitEdit({
        departPrincipal
      })
    },
  }
}
</script>

<style scoped lang="less">
.employee-info-page {
  --employee-radius: 8px;
  --employee-background: #f8fafd;
  --employee-foreground: #1a2a3d;
  --employee-card: #ffffff;
  --employee-primary: #2563eb;
  --employee-primary-rgb: 37, 99, 235;
  --employee-muted: #f1f5f9;
  --employee-muted-foreground: #64748b;
  --employee-border: #e2e8f0;
  --employee-gradient-blue: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  --employee-shadow-card: 0 2px 12px rgba(45, 120, 255, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03);
  --employee-shadow-glow: 0 4px 24px rgba(45, 120, 255, 0.15), 0 0 40px rgba(45, 120, 255, 0.04);
  --employee-font: "Noto Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", ui-sans-serif, system-ui, sans-serif;

  height: calc(100vh - 144px);
  min-height: 620px;
  overflow: hidden;
  background: var(--employee-background);
  color: var(--employee-foreground);
  font-family: var(--employee-font);
}

.employee-info-layout {
  height: 100%;
  display: flex;
  overflow: hidden;
  background: var(--employee-background);
}

.employee-info-page /deep/ ::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

.employee-info-page /deep/ ::-webkit-scrollbar-track {
  background: transparent;
}

.employee-info-page /deep/ ::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(var(--employee-primary-rgb), 0.15);
}

.employee-info-page /deep/ ::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--employee-primary-rgb), 0.3);
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

@media (max-width: 900px) {
  .employee-info-page {
    min-width: 720px;
  }
}
</style>

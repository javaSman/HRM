<template>
  <div class="job-info-page">
    <div class="job-info-layout">
      <org-structure-tree
        v-model="selectedOrgId"
        :extra-context-menu-items="orgContextMenuItems"
        @treeData="treeData"
        @change="handleOrgChange"
        @custom-context-menu-click="handleTreeCustomMenuClick"
      />
      <job-position-panel ref="positionPanel" :org-id="selectedOrgId" :department="selectedOrgNode" />
    </div>
  </div>
</template>

<script>
import OrgStructureTree from '@/components/tree/OrgStructureTree.vue'
import JobPositionPanel from './modules/JobPositionPanel.vue'
import { findTreePath } from '../../../utils/util.js';
export default {
  name: 'JobInfo',
  components: {
    OrgStructureTree,
    JobPositionPanel
  },
  data() {
    return {
      selectedOrgId: '',
      selectedOrgNode: null,
      treeList:[],
      orgContextMenuItems: [
        {
          key: 'add-position',
          title: '新增岗位',
          icon: 'plus'
        }
      ]
    }
  },
  methods: {
    treeData(data){
      console.log('treeData---------------------------',data)
      this.treeList = data
    },
    handleOrgChange(node) {
      this.selectedOrgNode = node || null
    },
    handleTreeCustomMenuClick(payload) {
      if (!payload || payload.key !== 'add-position') {
        return
      }
      const node = payload.node || null
      this.selectedOrgNode = node
      this.selectedOrgId = node ? String(node.id || node.key || node.value || '') : ''
      this.$nextTick(() => {
        if (this.$refs.positionPanel) {
          let companyId = ''
          const treeList = findTreePath(this.treeList,this.selectedOrgId)
          if(treeList && treeList.length){
            companyId = treeList.length > 1
            ? treeList.map(item => item.id)[1]
            : treeList.map(item => item.id)[0]
          }
          console.log('companyId',companyId)
          this.$refs.positionPanel.openCreateModal(node,companyId)
        }
      })
    }
  }
}
</script>

<style scoped lang="less">
.job-info-page {
  --job-radius: 8px;
  --job-background: #f8fafd;
  --job-foreground: #1a2a3d;
  --job-card: #ffffff;
  --job-primary: #2563eb;
  --job-primary-rgb: 37, 99, 235;
  --job-muted: #f1f5f9;
  --job-muted-foreground: #64748b;
  --job-border: #e2e8f0;
  --job-gradient-blue: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  --job-shadow-card: 0 2px 12px rgba(45, 120, 255, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03);
  --job-shadow-glow: 0 4px 24px rgba(45, 120, 255, 0.15), 0 0 40px rgba(45, 120, 255, 0.04);
  --job-font: 'Noto Sans SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', ui-sans-serif, system-ui, sans-serif;

  height: calc(100vh - 144px);
  min-height: 620px;
  overflow: hidden;
  background: var(--job-background);
  color: var(--job-foreground);
  font-family: var(--job-font);
}

.job-info-layout {
  height: 100%;
  display: flex;
  overflow: hidden;
  background: var(--job-background);
}

.job-info-page /deep/ ::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

.job-info-page /deep/ ::-webkit-scrollbar-track {
  background: transparent;
}

.job-info-page /deep/ ::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(var(--job-primary-rgb), 0.15);
}

.job-info-page /deep/ ::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--job-primary-rgb), 0.3);
}

@media (max-width: 900px) {
  .job-info-page {
    min-width: 760px;
  }
}
</style>

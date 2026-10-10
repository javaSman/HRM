<template>
  <div class="new-ro-page">
    <div class="new-ro-layout">
      <org-structure-tree v-model="selectedOrgId" :enable-org-manage="true" @change="handleOrgChange" @ok="refreshPersonnelList" @treeData="getTreeData" />
      <personnel-list ref="personnelList" :org-id="selectedOrgId" :department="selectedOrgNode" :treeData="treeData" />
    </div>
  </div>
</template>

<script>
import OrgStructureTree from './modules/OrgStructureTree.vue'
import PersonnelList from './modules/PersonnelList.vue'

export default {
  name: 'NewRO',
  components: {
    OrgStructureTree,
    PersonnelList
  },
  data() {
    return {
      selectedOrgId: '',
      treeData:[],
      selectedOrgNode: null
    }
  },
  methods: {
    getTreeData(treeData){
      this.treeData = treeData
    },
    handleOrgChange(node) {
      this.selectedOrgNode = node || null
    },
    refreshPersonnelList(){
      this.$refs.personnelList.refresh()
    }
  }
}
</script>

<style scoped lang="less">
.new-ro-page {
  --new-ro-radius: 8px;
  --new-ro-background: #f8fafd;
  --new-ro-foreground: #1a2a3d;
  --new-ro-card: #ffffff;
  --new-ro-primary: #2563eb;
  --new-ro-primary-rgb: 37, 99, 235;
  --new-ro-muted: #f1f5f9;
  --new-ro-muted-foreground: #64748b;
  --new-ro-border: #e2e8f0;
  --new-ro-danger: #ef4444;
  --new-ro-font: "Noto Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", ui-sans-serif, system-ui, sans-serif;

  height: calc(100vh - 144px);
  min-height: 620px;
  background: var(--new-ro-background);
  color: var(--new-ro-foreground);
  font-family: var(--new-ro-font);
  overflow: hidden;
}

.new-ro-layout {
  height: 100%;
  display: flex;
  background: var(--new-ro-background);
  overflow: hidden;
}

.new-ro-page /deep/ ::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

.new-ro-page /deep/ ::-webkit-scrollbar-track {
  background: transparent;
}

.new-ro-page /deep/ ::-webkit-scrollbar-thumb {
  background: rgba(var(--new-ro-primary-rgb), 0.15);
  border-radius: 999px;
}

.new-ro-page /deep/ ::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--new-ro-primary-rgb), 0.3);
}

@keyframes new-ro-slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-12px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes new-ro-slide-in-right {
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
  .new-ro-page {
    min-width: 720px;
  }
}
</style>

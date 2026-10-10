<template>
  <j-modal
    title="选择人员/部门"
    :width="1200"
    :visible="visible"
    :bodyStyle="bodyStyle"
    :maskClosable="false"
    :confirmLoading="false"
    wrapClassName="hr-kq-rule-scope-modal"
    cancelText="取消"
    @ok="handleOk"
    @cancel="close"
  >
    <a-spin :spinning="false">
      <div class="scope-selector-layout">
        <div class="scope-selector-main">
          <a-tabs :activeKey="activeTab" :animated="false" @change="handleTabChange">
            <a-tab-pane key="org" tab="组织架构">
              <hr-kq-rule-scope-org-tab
                v-model="scopeSelection.orgs"
                :visible="visible"
                @loading-change="handleOrgLoadingChange"
              />
            </a-tab-pane>

            <a-tab-pane key="position" tab="岗位">
              <hr-kq-rule-scope-position-tab
                v-model="scopeSelection.positions"
                :visible="visible"
              />
            </a-tab-pane>

            <a-tab-pane key="employee" tab="员工">
              <hr-kq-rule-scope-employee-tab
                v-model="scopeSelection.employees"
                :visible="visible"
              />
            </a-tab-pane>
          </a-tabs>
        </div>

        <aside class="scope-selected-panel">
          <div class="scope-selected-title">已选择的部门、岗位、员工</div>
          <div class="scope-selected-count">共 {{ selectedCount }} 项</div>
          <div class="scope-selected-list">
            <div v-for="item in selectedItems" :key="item.type + '-' + item.value" class="scope-selected-item">
              <a-icon :type="getSelectedItemIcon(item.type)" class="scope-selected-icon" />
              <div class="scope-selected-info">
                <div class="scope-selected-name">{{ item.label }}</div>
                <div v-if="item.description" class="scope-selected-description">{{ item.description }}</div>
              </div>
              <a-icon type="close-circle" class="scope-selected-remove" @click="removeSelectedItem(item)" />
            </div>
            <a-empty v-if="!selectedItems.length" description="暂未选择" />
          </div>
        </aside>
      </div>
    </a-spin>
  </j-modal>
</template>

<script>
  import HrKqRuleScopeEmployeeTab from './HrKqRuleScopeEmployeeTab.vue'
  import HrKqRuleScopeOrgTab from './HrKqRuleScopeOrgTab.vue'
  import HrKqRuleScopePositionTab from './HrKqRuleScopePositionTab.vue'
  import { normalizeSelectionItems } from './HrKqRuleScopeUtils'

  export default {
    name: 'HrKqRuleScopeModal',
    components: {
      HrKqRuleScopeEmployeeTab,
      HrKqRuleScopeOrgTab,
      HrKqRuleScopePositionTab
    },
    data() {
      return {
        visible: false,
        activeTab: 'org',
        orgLoading: false,
        scopeSelection: {
          orgs: [],
          positions: [],
          employees: []
        },
        bodyStyle: {
          padding: '0 24px 16px',
          overflow: 'hidden'
        }
      }
    },
    computed: {
      selectedItems() {
        const orgs = this.scopeSelection.orgs.map(item => Object.assign({ type: 'org' }, item))
        const positions = this.scopeSelection.positions.map(item => Object.assign({ type: 'position' }, item))
        const employees = this.scopeSelection.employees.map(item => Object.assign({ type: 'employee' }, item))
        return orgs.concat(positions, employees)
      },
      selectedCount() {
        return this.selectedItems.length
      }
    },
    methods: {
      open(selection) {
        const source = selection || {}
        this.activeTab = 'org'
        this.orgLoading = false
        this.scopeSelection = {
          orgs: normalizeSelectionItems(source.bindOrgIds, source.orgs, '组织', '组织'),
          positions: normalizeSelectionItems(source.bindPositionIds, source.positions, '岗位', '岗位'),
          employees: normalizeSelectionItems(source.bindEmployeeIds, source.employees, '员工', '员工')
        }
        this.visible = true
      },
      close() {
        this.visible = false
      },
      handleOk() {
        if (this.orgLoading) {
          return
        }
        this.$emit('ok', {
          bindOrgIds: this.scopeSelection.orgs.map(item => String(item.value)),
          bindPositionIds: this.scopeSelection.positions.map(item => String(item.value)),
          bindEmployeeIds: this.scopeSelection.employees.map(item => String(item.value)),
          orgs: this.scopeSelection.orgs.slice(),
          positions: this.scopeSelection.positions.slice(),
          employees: this.scopeSelection.employees.slice()
        })
        this.close()
      },
      handleTabChange(tabKey) {
        this.activeTab = tabKey
      },
      handleOrgLoadingChange(loading) {
        this.orgLoading = loading
      },
      removeSelectedItem(item) {
        const fieldMap = {
          org: 'orgs',
          position: 'positions',
          employee: 'employees'
        }
        const field = fieldMap[item.type]
        this.scopeSelection[field] = this.scopeSelection[field]
          .filter(selected => String(selected.value) !== String(item.value))
      },
      getSelectedItemIcon(type) {
        const iconMap = {
          org: 'folder',
          position: 'idcard',
          employee: 'user'
        }
        return iconMap[type] || 'user'
      }
    }
  }
</script>

<style scoped lang="less">
  .scope-selector-layout {
    display: flex;
    height: 560px;
  }

  .scope-selector-main {
    min-width: 0;
    padding-top: 16px;
    padding-right: 16px;
    border-right: 1px solid #e2e8f0;
    flex: 1;
  }

  .scope-selector-main /deep/ .ant-tabs-bar {
    margin: 0 0 12px;
  }

  .scope-selector-main /deep/ .ant-tabs-nav .ant-tabs-tab {
    padding: 10px 16px;
  }

  .scope-selected-panel {
    display: flex;
    width: 320px;
    padding: 16px 0 0 16px;
    flex-shrink: 0;
    flex-direction: column;
  }

  .scope-selected-title {
    color: #1a2a3d;
    font-size: 14px;
    font-weight: 600;
    line-height: 22px;
  }

  .scope-selected-count {
    margin: 8px 0 12px;
    color: #64748b;
    font-size: 12px;
  }

  .scope-selected-list {
    min-height: 0;
    padding: 0 12px;
    overflow-y: auto;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    flex: 1;
  }

  .scope-selected-item {
    display: flex;
    align-items: center;
    min-height: 44px;
    padding: 8px 0;
    border-bottom: 1px solid #f1f5f9;
  }

  .scope-selected-item:last-child {
    border-bottom: 0;
  }

  .scope-selected-icon {
    margin-right: 10px;
    color: #2d78ff;
    font-size: 15px;
  }

  .scope-selected-info {
    min-width: 0;
    flex: 1;
  }

  .scope-selected-name,
  .scope-selected-description {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .scope-selected-name {
    color: #1a2a3d;
    font-size: 13px;
    line-height: 20px;
  }

  .scope-selected-description {
    color: #94a3b8;
    font-size: 11px;
    line-height: 16px;
  }

  .scope-selected-remove {
    margin-left: 8px;
    color: #94a3b8;
    cursor: pointer;
  }

  .scope-selected-remove:hover {
    color: #ef4444;
  }

  .scope-selected-list /deep/ .ant-empty {
    margin-top: 150px;
  }

  @media (max-width: 768px) {
    .scope-selector-layout {
      height: auto;
      flex-direction: column;
    }

    .scope-selector-main {
      padding-right: 0;
      border-right: 0;
    }

    .scope-selected-panel {
      width: 100%;
      height: 260px;
      padding-left: 0;
    }
  }
</style>

<style>
  .hr-kq-rule-scope-modal .ant-modal-content {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 24px rgba(45, 120, 255, 0.12), 0 0 40px rgba(45, 120, 255, 0.04);
  }

  .hr-kq-rule-scope-modal .ant-modal-header {
    padding: 16px 24px;
    background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
    border-bottom: 0;
  }

  .hr-kq-rule-scope-modal .ant-modal-title {
    color: #fff;
    font-size: 18px;
    font-weight: 600;
  }

  .hr-kq-rule-scope-modal .ant-modal-close {
    top: 10px;
    right: 14px;
    width: 32px;
    height: 32px;
    color: #fff;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
  }

  .hr-kq-rule-scope-modal .ant-modal-close:hover {
    background: rgba(255, 255, 255, 0.35);
  }

  .hr-kq-rule-scope-modal .ant-modal-close-x {
    width: 32px;
    height: 32px;
    line-height: 32px;
  }

  .hr-kq-rule-scope-modal .ant-modal-body {
    padding: 20px 24px;
  }

  .hr-kq-rule-scope-modal .ant-modal-footer {
    padding: 14px 24px;
    border-top: 1px solid #e2e8f0;
  }

  .hr-kq-rule-scope-modal .ant-modal-footer .ant-btn:not(.ant-btn-primary) {
    height: 34px;
    padding: 0 20px;
    color: #64748b;
    background: #ffffff;
    border-color: #e2e8f0;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
  }

  .hr-kq-rule-scope-modal .ant-modal-footer .ant-btn:not(.ant-btn-primary):hover {
    color: #1a2a3d;
    border-color: rgba(45, 120, 255, 0.35);
  }

  .hr-kq-rule-scope-modal .ant-modal-footer .ant-btn-primary {
    height: 34px;
    border: 0;
    border-radius: 8px;
    background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
    box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2);
    font-size: 12px;
    font-weight: 600;
  }

  .hr-kq-rule-scope-modal .ant-modal-footer .ant-btn-primary:hover,
  .hr-kq-rule-scope-modal .ant-modal-footer .ant-btn-primary:focus {
    background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
    opacity: 0.92;
  }
</style>

<template>
  <div v-if="visible && detailEmployee" class="employee-detail-panel">
    <div class="detail-panel-top-bar">
      <button type="button" class="detail-back-btn" @click="handleClose">
        <a-icon type="arrow-left" />
        返回列表
      </button>
      <!-- <div class="detail-panel-quick-nav">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          :class="{ 'detail-panel-current': activeTab === tab.key }"
          @click="handleTabChange(tab.key)"
        >
          {{ tab.title }}
        </button>
      </div> -->
    </div>

    <div ref="detailBody" class="detail-panel-body">
      <employee-detail-profile
        :employee="detailEmployee"
        v-model="profileAvatarValue"
        :editing="basicInfoEditing"
        @close="handleClose"
      />

      <div class="detail-content-wrapper">
        <main class="detail-main-content">
          <nav class="tab-nav">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              type="button"
              :class="{ active: activeTab === tab.key }"
              @click="handleTabChange(tab.key)"
            >
              <a-icon :type="tab.icon" />
              <span>{{ tab.title }}</span>
            </button>
          </nav>

          <div class="tab-content-shell">
            <employee-basic-info-tab
              v-if="activeTab === 'basic'"
              ref="basicInfoTab"
              :employee="detailEmployee"
              :department="department"
              :saving="savingBasic"
              @save="handleBasicSave"
              @editing-change="handleBasicEditingChange"
              @cancel-edit="handleBasicCancelEdit"
            />
            <employee-education-tab :ghId="detailEmployee.no" v-else-if="activeTab === 'edu'" />
            <employee-work-history-tab :ghId="detailEmployee.no" v-else-if="activeTab === 'work'" />
            <employee-family-tab :ghId="detailEmployee.no" v-else-if="activeTab === 'family'" />
            <employee-archive-tab :ghId="detailEmployee.no" v-else-if="activeTab === 'cert'" @update:archive="handleArchiveUpdate" />
            <employee-relation-tab :ghId="detailEmployee.no" v-else-if="activeTab === 'relation'" />
            <employee-interview-tab :ghId="detailEmployee.no" v-else />
          </div>
        </main>

        <aside class="detail-sidebar">
          <employee-archive-sidebar ref="archiveSidebar" :employeeId="detailEmployee.no"/>
          <employee-leave-sidebar :detailEmployee="detailEmployee" />
        </aside>
      </div>
    </div>
  </div>
</template>

<script>
import { getAction, httpAction } from '@/api/manage'
import EmployeeDetailProfile from './detail/EmployeeDetailProfile.vue'
import EmployeeBasicInfoTab from './detail/EmployeeBasicInfoTab.vue'
import EmployeeEducationTab from './detail/EmployeeEducationTab.vue'
import EmployeeWorkHistoryTab from './detail/EmployeeWorkHistoryTab.vue'
import EmployeeFamilyTab from './detail/EmployeeFamilyTab.vue'
import EmployeeArchiveTab from './detail/EmployeeArchiveTab.vue'
import EmployeeRelationTab from './detail/EmployeeRelationTab.vue'
import EmployeeInterviewTab from './detail/EmployeeInterviewTab.vue'
import EmployeeArchiveSidebar from './detail/EmployeeArchiveSidebar.vue'
import EmployeeLeaveSidebar from './detail/EmployeeLeaveSidebar.vue'

const DETAIL_TABS = [
  { key: 'basic', title: '基本信息', icon: 'user' },
  { key: 'edu', title: '教育经历', icon: 'read' },
  { key: 'work', title: '工作履历', icon: 'solution' },
  { key: 'family', title: '家庭成员', icon: 'team' },
  { key: 'cert', title: '个人附件', icon: 'profile' },
  { key: 'relation', title: '关系申报', icon: 'cluster' },
  { key: 'interview', title: '访谈经历', icon: 'message' }
]

export default {
  name: 'EmployeeDetail',
  components: {
    EmployeeDetailProfile,
    EmployeeBasicInfoTab,
    EmployeeEducationTab,
    EmployeeWorkHistoryTab,
    EmployeeFamilyTab,
    EmployeeArchiveTab,
    EmployeeRelationTab,
    EmployeeInterviewTab,
    EmployeeArchiveSidebar,
    EmployeeLeaveSidebar
  },
  provide(){
    return {
      constractBelongOptions: this.injectedConstractBelongOptions
    }
  },
  props: {
    constractBelongOptions:{
      type:Array,
      default:()=>[]
    },
    visible: {
      type: Boolean,
      default: false
    },
    employee: {
      type: Object,
      default: null
    },
    department: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      activeTab: 'basic',
      tabs: DETAIL_TABS,
      detailEmployee: null,
      savingBasic: false,
      profileAvatarValue: '',
      injectedConstractBelongOptions: [],
      basicInfoEditing: false
    }
  },
  watch: {
    constractBelongOptions: {
      immediate: true,
      handler(options) {
        const list = Array.isArray(options) ? options : []
        this.injectedConstractBelongOptions.splice(0, this.injectedConstractBelongOptions.length, ...list)
      }
    },
    employee: {
      immediate: true,
      deep: true,
      handler(record) {
        this.detailEmployee = this.cloneRecord(record)
        this.basicInfoEditing = false
        this.syncProfileAvatarValue()
      }
    },
    visible(value) {
      if (value) {
        this.activeTab = 'basic'
        this.scrollToTop()
      } else {
        this.basicInfoEditing = false
        this.syncProfileAvatarValue()
      }
    }
  },
  methods: {
    // 个人附件更新后刷新个人附件
    handleArchiveUpdate() {
      this.$refs.archiveSidebar.loadEmployeeArchive(this.detailEmployee.no)
    },
    // 关闭详情页并交还给列表页。
    handleClose() {
      this.$emit('close')
    },
    // 切换详情下方的业务页签。
    handleTabChange(key) {
      this.activeTab = key
      this.scrollToTop()
    },
    handleBasicEditingChange(value) {
      this.basicInfoEditing = value
    },
    handleBasicCancelEdit() {
      this.basicInfoEditing = false
      this.syncProfileAvatarValue()
    },
    // 保存基本信息后重新拉取当前员工详情。
    handleBasicSave(payload, resolve, reject) {
      const savePayload = Object.assign({}, payload || {}, {
        photo: this.profileAvatarValue || ''
      })
      if (!savePayload || !savePayload.id) {
        this.$message.warning('缺少员工ID，无法保存')
        if (reject) {
          reject()
        }
        return
      }
      this.savingBasic = true
      httpAction('/hrm/hrEmployeeInformation/edit', savePayload, 'put')
        .then(res => {
          if (!res || !res.success) {
            this.$message.warning((res && res.message) || '保存失败')
            if (reject) {
              reject(res)
            }
            return
          }
          this.$message.success(res.message || '保存成功')
          return this.refreshEmployee(savePayload.id, savePayload, resolve)
        })
        .catch(error => {
          this.$message.error('保存失败，请稍后重试')
          if (reject) {
            reject(error)
          }
        })
        .finally(() => {
          this.savingBasic = false
        })
    },
    // 通过详情接口刷新当前员工数据并回显 records[0]。
    refreshEmployee(id, fallback, resolve) {
      return getAction('/hrm/hrEmployeeInformation/list', { id })
        .then(res => {
          const records = res && res.result && Array.isArray(res.result.records) ? res.result.records : []
          const record = records[0] || fallback
          this.detailEmployee = this.cloneRecord(record)
          this.syncProfileAvatarValue()
          if (resolve) {
            resolve(this.detailEmployee)
          }
        })
        .catch(() => {
          this.detailEmployee = this.cloneRecord(fallback)
          this.syncProfileAvatarValue()
          this.$message.warning('保存成功，重新获取详情失败，已使用本次保存数据回显')
          if (resolve) {
            resolve(this.detailEmployee)
          }
        })
    },
    // 滚动到详情内容顶部，避免切换页签时停留在旧位置。
    scrollToTop() {
      this.$nextTick(() => {
        const body = this.$refs.detailBody
        if (body) {
          body.scrollTop = 0
        }
      })
    },
    syncProfileAvatarValue() {
      this.profileAvatarValue = this.readRawValue(['photo', '员工照片'], '') || ''
    },
    // 按字段优先级读取原始值。
    readRawValue(keys, fallback) {
      const source = this.detailEmployee || {}
      for (let i = 0; i < keys.length; i++) {
        const value = source[keys[i]]
        if (value !== undefined && value !== null && value !== '') {
          return value
        }
      }
      return fallback
    },
    // 深拷贝员工对象，避免编辑状态污染父级数据。
    cloneRecord(record) {
      if (!record) {
        return null
      }
      return JSON.parse(JSON.stringify(record))
    }
  }
}
</script>

<style lang="less">
.employee-detail-panel {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  background: var(--employee-background, #f8fafd);
  overflow: hidden;
  animation: fade-slide 0.3s ease-out both;
}

.detail-panel-top-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  border-bottom: 1px solid var(--employee-border, #e2e8f0);
  background: var(--employee-card, #ffffff);
  flex-shrink: 0;
}

.detail-back-btn,
.detail-panel-close,
.detail-panel-quick-nav button,
.tab-nav button {
  border: 1px solid var(--employee-border, #e2e8f0);
  background: var(--employee-card, #ffffff);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  &:hover {
    color: var(--employee-primary, #2563eb);
    border-color: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.3);
    background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.04);
  }
}
.tab-nav span {
  font-size: 14px;
}

.detail-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px 6px 10px;
  border-radius: 8px;
  color: var(--employee-muted-foreground, #64748b);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.detail-panel-quick-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;

  button {
    padding: 4px 10px;
    border-radius: 5px;
    color: var(--employee-muted-foreground, #64748b);
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
  }
}

.detail-panel-current {
  color: var(--employee-primary, #2563eb) !important;
  font-weight: 700 !important;
  border-color: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.3) !important;
  background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.06) !important;
}

.detail-panel-body {
  flex: 1;
  min-height: 0;
  padding: 20px 24px 40px;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.detail-profile {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 18px;
  padding: 20px 24px;
  border: 1px solid var(--employee-border, #e2e8f0);
  border-radius: 12px;
  background: var(--employee-card, #ffffff);
  box-shadow: var(--employee-shadow-card, 0 2px 12px rgba(45, 120, 255, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03));
}

.detail-panel-avatar,
.detail-panel-avatar-fallback {
  width: 64px;
  height: 64px;
  border-radius: 14px;
  flex-shrink: 0;
}

.detail-panel-avatar {
  object-fit: cover;
  background: var(--employee-background, #f8fafd);
}

.detail-panel-avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(var(--employee-primary-rgb, 37, 99, 235), 0.12), rgba(var(--employee-primary-rgb, 37, 99, 235), 0.06));
  color: var(--employee-primary, #2563eb);
  font-size: 24px;
  font-weight: 700;
}

.detail-panel-info {
  min-width: 0;
  flex: 1;
}

.detail-panel-name {
  color: var(--employee-foreground, #1a2a3d);
  font-size: 22px;
  font-weight: 700;
}

.detail-panel-sub {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.detail-panel-position {
  color: var(--employee-muted-foreground, #64748b);
  font-size: 14px;
  font-weight: 500;
}

.detail-panel-rank {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 5px;
  color: var(--employee-primary, #2563eb);
  background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.08);
  font-size: 12px;
  font-weight: 600;
}

.detail-panel-close {
  width: 32px;
  height: 32px;
  margin-left: auto;
  border-radius: 8px;
  color: var(--employee-muted-foreground, #64748b);
}

.detail-content-wrapper {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 18px;
  align-items: start;
}

.detail-main-content {
  min-width: 0;
}

.tab-nav {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 14px;

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 38px;
    padding: 7px 8px;
    border-radius: 8px;
    color: var(--employee-muted-foreground, #64748b);
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
  }

  button.active {
    color: var(--employee-primary, #2563eb);
    border-color: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.36);
    background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.08);
  }
}

.tab-content-shell {
  min-width: 0;
}

.detail-section {
  margin-bottom: 16px;
  padding: 18px;
  border: 1px solid var(--employee-border, #e2e8f0);
  border-radius: 10px;
  background: var(--employee-card, #ffffff);
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.03);
}

.detail-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.section-title-text,
.section-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--employee-foreground, #1a2a3d);
  font-size: 14px;
  font-weight: 700;

  .anticon {
    color: var(--employee-primary, #2563eb);
  }
}

.detail-edit-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.btn-edit-basic,
.btn-save-basic,
.btn-cancel-basic {
  height: 28px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
}

.field-grid {
  display: grid;
  // grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px 14px;
}

.field-item {
  min-width: 0;
}

.field-item.wide {
  grid-column: span 2;
}
.field-item.wide-3 {
  grid-column: span 3;
}

.field-item.wide3,
.field-item.full {
  grid-column: ~'1 / -1';
}

.field-label {
  display: block;
  margin-bottom: 5px;
  color: #475569;
  font-size: 12px!important;
  font-weight: 700;
}

.required {
  margin-right: 2px;
  color: #ef4444;
}

.field-display {
  min-height: 34px;
  padding: 7px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  background: #f8fafc;
  color: #1f2937;
  font-size: 13px;
  line-height: 18px;
  word-break: break-all;
}

.field-display.empty {
  color: #94a3b8;
  font-style: italic;
}

.field-photo-display {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 64px;
}

.field-photo-display img {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  object-fit: cover;
}

.field-photo-empty {
  color: #94a3b8;
  font-size: 13px;
}

.detail-edit-form {
  /deep/ .ant-form-item {
    margin-bottom: 0;
  }

  /deep/ .ant-input,
  /deep/ .ant-select-selection,
  /deep/ .ant-cascader-input,
  /deep/ .ant-input-number {
    border-radius: 7px;
  }
}

.sub-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 18px 0 14px;
  color: var(--employee-primary, #2563eb);
  font-size: 13px;
  font-weight: 700;
}

.sub-divider .line {
  height: 1px;
  flex: 1;
  background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.16);
}

.detail-placeholder {
  min-height: 280px;
  display: flex;
  flex-direction: column;
}

.detail-placeholder-body {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  margin-top: 14px;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  background: #f8fafc;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
}

.detail-sidebar {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.sidebar-card {
  border: 1px solid var(--employee-border, #e2e8f0);
  border-radius: 10px;
  background: var(--employee-card, #ffffff);
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.03);
  overflow: hidden;
}

.sidebar-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  border-bottom: 1px solid #edf2f7;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  color: var(--employee-primary, #2563eb);
  background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.08);
  font-size: 16px;
}

.header-title {
  color: #1f2937;
  font-size: 14px;
  font-weight: 700;
}

.header-subtitle {
  margin-top: 2px;
  color: #94a3b8;
  font-size: 12px;
}

.sidebar-card-body {
  padding: 14px;
}

.archive-list + .archive-list {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #e2e8f0;
}

.archive-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.archive-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  color: #2563eb;
  background: #eff6ff;
}

.archive-item-title {
  color: #334155;
  font-size: 13px;
  font-weight: 700;
}

.archive-item-meta {
  margin-top: 2px;
  color: #94a3b8;
  font-size: 12px;
}

.archive-section-label {
  margin-bottom: 8px;
  color: #475569;
  font-size: 13px;
  font-weight: 700;
}

.archive-section-label:not(:first-child) {
  margin-top: 16px;
}

.leave-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.leave-stat {
  padding: 10px 8px;
  border-radius: 9px;
  background: #f8fafc;
  text-align: center;
}

.leave-stat-value {
  font-size: 20px;
  line-height: 24px;
  font-weight: 800;
}

.leave-stat-unit {
  margin-top: 2px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.leave-stat-label {
  margin-top: 6px;
  color: #94a3b8;
  font-size: 11px;
  line-height: 15px;
}

.leave-stat.blue .leave-stat-value {
  color: #2563eb;
}

.leave-stat.green .leave-stat-value {
  color: #10b981;
}

.leave-stat.amber .leave-stat-value {
  color: #f59e0b;
}

@keyframes fade-slide {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1280px) {
  .detail-content-wrapper {
    grid-template-columns: minmax(0, 1fr) 280px;
  }

  .tab-nav {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 1024px) {
  .detail-content-wrapper {
    grid-template-columns: 1fr;
  }

  .detail-sidebar {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .detail-panel-top-bar,
  .detail-panel-body {
    padding-left: 16px;
    padding-right: 16px;
  }

  .detail-profile {
    flex-wrap: wrap;
    gap: 12px;
    padding: 16px;
  }

  .detail-panel-quick-nav {
    width: 100%;
  }

  .tab-nav,
  .field-grid,
  .detail-sidebar {
    grid-template-columns: 1fr;
  }

  .field-item.wide,
  .field-item.wide3,
  .field-item.full {
    grid-column: auto;
  }
}
</style>

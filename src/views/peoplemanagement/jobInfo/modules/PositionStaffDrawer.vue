<template>
  <a-drawer
    placement="right"
    :closable="false"
    :visible="visible"
    :width="drawerWidth"
    :bodyStyle="drawerBodyStyle"
    wrapClassName="position-staff-drawer-wrap"
    destroyOnClose
    @close="handleClose"
  >
    <div class="position-staff-drawer">
      <div class="drawer-header">
        <div class="drawer-header-top">
          <h2 class="drawer-title">在职人员</h2>
          <button class="drawer-close" type="button" @click="handleClose">
            <a-icon type="close" />
          </button>
        </div>
        <div class="drawer-subtitle">{{ positionName }}</div>
        <div class="drawer-subtitle drawer-count">当前岗位总人数：{{ headcount }}</div>
      </div>

      <div class="drawer-body">
        <div class="drawer-section-title">人员列表</div>
        <a-spin :spinning="loading">
          <div v-if="staffList.length" class="staff-list">
            <div v-for="item in staffList" :key="item.id || item.no || item.name" class="staff-item">
              <div class="staff-item-header">
                <img
                  v-if="getAvatarUrl(item)"
                  class="staff-avatar staff-avatar-image"
                  :src="getAvatarUrl(item)"
                  :alt="getStaffName(item)"
                />
                <div v-else class="staff-avatar staff-avatar-fallback">{{ getAvatarText(item) }}</div>
                <span class="staff-name">{{ getStaffName(item) }}</span>
                <span class="staff-empno">{{ getStaffNo(item) }}</span>
              </div>
              <div class="staff-dept">{{ getStaffMainDeptPath(item) }}</div>
            </div>
          </div>
          <div v-else class="staff-empty">
            <a-icon type="team" />
            <p>暂无在职人员数据</p>
          </div>
        </a-spin>
      </div>

      <div class="drawer-footer">
        <a-button class="drawer-collapse" block @click="handleClose">收起</a-button>
      </div>
    </div>
  </a-drawer>
</template>

<script>
import { getAction, getFileAccessHttpUrl } from '@/api/manage'

export default {
  name: 'PositionStaffDrawer',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    position: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      drawerWidth: 520,
      drawerBodyStyle: {
        padding: 0,
        height: '100%',
        overflow: 'hidden'
      },
      loading: false,
      staffList: [],
      url: {
        list: '/hrm/hrEmployeeInformation/list'
      }
    }
  },
  computed: {
    positionId() {
      const record = this.position || {}
      return record.id === undefined || record.id === null ? '' : String(record.id)
    },
    positionName() {
      const record = this.position || {}
      return record.postName || record.name || '-'
    },
    headcount() {
      return this.getPositionHeadcount() || this.staffList.length
    }
  },
  watch: {
    // visible(val) {
    //   console.log('visible')
    //   if (val) {
    //   console.log('positionId')
    //     this.loadStaffList()
    //   }
    // },
    positionId(val, oldVal) {
      console.log('positionId')
      if (this.visible && val !== oldVal) {
        this.loadStaffList()
      }
    }
  },
  created() {
    this.resetScreenSize()
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    resetScreenSize() {
      const screenWidth = document.body.clientWidth
      this.drawerWidth = screenWidth < 560 ? screenWidth : 520
    },
    getPositionHeadcount() {
      const record = this.position || {}
      if (record.employeeCount !== undefined && record.employeeCount !== null && record.employeeCount !== '') {
        return Number(record.employeeCount) || 0
      }
      if (record.headcount !== undefined && record.headcount !== null && record.headcount !== '') {
        return Number(record.headcount) || 0
      }
      if (Array.isArray(record.hrJobLevels) && record.hrJobLevels.length) {
        return record.hrJobLevels.reduce((sum, item) => sum + (Number(item.employeeCount) || 0), 0)
      }
      return 0
    },
    loadStaffList() {
      if (!this.positionId) {
        this.staffList = []
        return Promise.resolve()
      }
      this.loading = true
      this.staffList = []
      return getAction(this.url.list, {
        postId: this.positionId,
        deleteFlag: '否',
        status: "已入职",
        pageSize: 999999
      }).then(res => {
        if (res && res.success) {
          const result = res.result || {}
          this.staffList = Array.isArray(result) ? result : (result.records || [])
        } else {
          this.staffList = []
          this.$message.warning((res && res.message) || '人员列表加载失败')
        }
      }).catch(() => {
        this.staffList = []
        this.$message.warning('人员列表加载失败')
      }).finally(() => {
        this.loading = false
      })
    },
    getStaffName(item) {
      return item && item.name ? String(item.name) : '-'
    },
    getStaffNo(item) {
      return item && item.no ? String(item.no) : '-'
    },
    getStaffMainDeptPath(item) {
      const path = item && item.mainDeptPath ? String(item.mainDeptPath) : '-'
      return path.endsWith('/') ? path.slice(0, -1) : path
    },
    getAvatarUrl(item) {
      const avatar = item && item.photo ? String(item.photo) : ''
      if (!avatar) {
        return ''
      }
      if (/^(https?:)?\/\//.test(avatar) || avatar.indexOf('data:image') === 0) {
        return avatar
      }
      return getFileAccessHttpUrl(avatar)
    },
    getAvatarText(item) {
      const name = this.getStaffName(item)
      return name && name !== '-' ? name.slice(-2) : '-'
    }
  }
}
</script>

<style scoped lang="less">
.position-staff-drawer {
  --staff-primary: #2563eb;
  --staff-primary-rgb: 37, 99, 235;
  --staff-card: #ffffff;
  --staff-foreground: #1a2a3d;
  --staff-muted-foreground: #64748b;
  --staff-border: #e2e8f0;
  --staff-shadow-card: 0 2px 12px rgba(45, 120, 255, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03);
  --staff-shadow-glow: 0 4px 24px rgba(45, 120, 255, 0.15), 0 0 40px rgba(45, 120, 255, 0.04);

  height: 100%;
  display: flex;
  flex-direction: column;
  color: var(--staff-foreground);
  background: var(--staff-card);
}

.drawer-header {
  flex-shrink: 0;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--staff-border);
}

.drawer-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.drawer-title {
  margin: 0;
  color: var(--staff-foreground);
  font-size: 17px;
  font-weight: 700;
}

.drawer-close {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 8px;
  background: none;
  color: var(--staff-muted-foreground);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    color: var(--staff-primary);
    background: rgba(var(--staff-primary-rgb), 0.06);
  }
}

.drawer-subtitle {
  color: var(--staff-muted-foreground);
  font-size: 15px;
  line-height: 1.6;
}

.drawer-count {
  margin-top: 4px;
}

.drawer-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 24px;
}

.drawer-section-title {
  margin-bottom: 12px;
  color: var(--staff-muted-foreground);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
}

.staff-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.staff-item {
  padding: 12px 14px;
  border: 1px solid var(--staff-border);
  border-radius: 8px;
  background: var(--staff-card);
  box-shadow: var(--staff-shadow-card);
  cursor: default;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(var(--staff-primary-rgb), 0.25);
    box-shadow: var(--staff-shadow-glow);
  }
}

.staff-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.staff-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  flex-shrink: 0;
}

.staff-avatar-image {
  object-fit: cover;
  background: #f8fafd;
}

.staff-avatar-fallback {
  border: 1px solid rgba(var(--staff-primary-rgb), 0.15);
  background: linear-gradient(135deg, rgba(var(--staff-primary-rgb), 0.12), rgba(var(--staff-primary-rgb), 0.06));
  color: var(--staff-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
}

.staff-name {
  color: var(--staff-foreground);
  font-size: 14px;
  font-weight: 600;
}

.staff-empno {
  margin-left: 4px;
  padding: 1px 8px;
  border-radius: 999px;
  background: rgba(var(--staff-primary-rgb), 0.06);
  color: rgba(var(--staff-primary-rgb), 0.45);
  font-size: 11px;
  font-weight: 500;
}

.staff-dept {
  margin-top: 2px;
  padding-left: 44px;
  color: var(--staff-muted-foreground);
  font-size: 12px;
  line-height: 1.5;
  word-break: break-all;
}

.staff-empty {
  padding: 60px 24px;
  color: var(--staff-muted-foreground);
  text-align: center;

  .anticon {
    margin-bottom: 10px;
    color: rgba(var(--staff-primary-rgb), 0.2);
    font-size: 40px;
  }

  p {
    margin-top: 4px;
    color: rgba(var(--staff-primary-rgb), 0.35);
    font-size: 13px;
  }
}

.drawer-footer {
  flex-shrink: 0;
  padding: 16px 24px;
  border-top: 1px solid var(--staff-border);
}

.drawer-collapse {
  height: 34px;
  border-radius: 6px;
}
</style>

<style lang="less">
.position-staff-drawer-wrap {
  .ant-drawer-mask {
    background: rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(4px);
  }

  .ant-drawer-content-wrapper {
    box-shadow: -8px 0 30px rgba(0, 0, 0, 0.15);
  }

  .ant-drawer-content,
  .ant-drawer-wrapper-body,
  .ant-drawer-body {
    height: 100%;
    overflow: hidden;
  }
}
</style>

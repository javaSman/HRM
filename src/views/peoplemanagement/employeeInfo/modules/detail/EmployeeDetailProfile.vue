<template>
  <div class="detail-profile">
    <div class="detail-panel-avatar-wrap">
      <j-image-upload
        v-if="editing"
        v-model="avatarValue"
        class="detail-panel-avatar-upload"
        text="上传头像"
        accept=".png,.jpg,.jpeg"
      ></j-image-upload>
      <img v-else-if="avatarUrl" class="detail-panel-avatar" :src="avatarUrl" :alt="employeeName" />
      <span v-else class="detail-panel-avatar detail-panel-avatar-fallback">{{ avatarText }}</span>
    </div>
    <div class="detail-panel-info">
      <div class="detail-panel-name">{{ employeeName }}</div>
      <div class="detail-panel-sub detail-profile-meta">
        <span
          v-for="item in profileMetaItems"
          :key="item.key"
          class="detail-profile-meta-item"
        >
          {{ item.label }}
        </span>
      </div>
      <div class="detail-profile-tags">
        <span
          v-for="tag in profileTags"
          :key="tag.key"
          class="detail-profile-tag"
          :class="tag.type"
        >
          <span class="detail-profile-tag-dot"></span>
          <span class="detail-profile-tag-label">{{ tag.label }}</span>
        </span>
      </div>
    </div>
    <button class="detail-panel-close" type="button" @click="$emit('close')">
      <a-icon type="close" />
    </button>
  </div>
</template>

<script>
import { getFileAccessHttpUrl } from '@/api/manage'
import { calculateEmployeeWorkYears } from './employeeWorkYears'

export default {
  name: 'EmployeeDetailProfile',
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    employee: {
      type: Object,
      default: null
    },
    editing: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    employeeRecord() {
      return this.employee || {}
    },
    avatarValue: {
      get() {
        return this.value || ''
      },
      set(value) {
        this.$emit('input', value || '')
      }
    },
    avatarUrl() {
      const avatar = this.value || ''
      if (!avatar) {
        return ''
      }
      if (/^(https?:)?\/\//.test(avatar) || avatar.indexOf('data:image') === 0) {
        return avatar
      }
      return getFileAccessHttpUrl(avatar)
    },
    employeeName() {
      return this.formatValue(this.readEmployeeValue(['name', '员工姓名']), '-')
    },
    avatarText() {
      const name = this.employeeName
      return name && name !== '-' ? name.slice(-2) : '-'
    },
    profileMetaItems() {
      const position = this.formatValue(this.readEmployeeValue(['postId_dictText', 'postName', '岗位名称']), '员工')
      const rank = this.formatValue(this.readEmployeeValue(['postRank_dictText', 'postRank', '岗位职级']))
      const employeeNo = this.formatValue(this.readEmployeeValue(['no']))
      const entryDate = this.formatDateValue(this.readEmployeeValue(['entryDate']))
      const workYears = calculateEmployeeWorkYears(this.employeeRecord)
      const formalResignDate = this.formatDateValue(this.readEmployeeValue(['formalResignDate']))

      const items = []
      if (position !== '-') {
        items.push({ key: 'position', label: position })
      }
      if (rank !== '-') {
        items.push({ key: 'rank', label: rank })
      }
      if (employeeNo !== '-') {
        items.push({ key: 'no', label: employeeNo })
      }
      if (this.isResigned) { // 判断是不是已离职
        formalResignDate !== '-' && items.push({ key: 'formalResignDate', label: `离职 ${formalResignDate}` })
        workYears !== '' && items.push({ key: 'workYears', label: `${workYears}年` })
      } else {
        if (entryDate !== '-') {
          items.push({ key: 'entryDate', label: `入职 ${entryDate}` })
        }
        if (workYears !== '') {
          items.push({ key: 'workYears', label: `${workYears}年` })
        }
      }

      return items
    },
    profileTags() {
      const employeeType = this.formatValue(this.readEmployeeValue(['employeeType_dictText', 'employeeType']), '正式')
      const zjlb = this.readEmployeeValue(['zjlb_dictText', 'zjlb']) || ''
      const mainDeptPath = this.normalizeDepartmentPath(this.readEmployeeValue(['mainDeptPath'], ''))
      // const isDeptMain = this.formatValue(this.employeeRecord.isDeptMain || '', 0)
      // console.log('isDeptMain',isDeptMain)
      const tags = []
      if (employeeType !== '-') {
        tags.push(this.createTag('employeeType', employeeType, this.getEmployeeTypeClass(employeeType)))
      }
      tags.push(this.createTag('status', this.isResigned ? '已离职' : '已入职', this.isResigned ? 'tag-status-resigned' : 'tag-status-employed'))
      if (Object.keys(this.employeeRecord).length && this.employeeRecord.isDeptMain === 1) {
        tags.push(this.createTag('deptLeader', '部门负责人', 'tag-leader'))
      }
      if (mainDeptPath) {
        // replace 去掉公司名字
        tags.push(this.createTag('mainDeptPath', mainDeptPath.replace(/^[^/]+\//, ''), 'tag-dept'))
      }
      if (zjlb) {
        tags.push(this.createTag('zjlb', zjlb, this.getZjlbClass(zjlb)))
      }
      return tags
    },
    isResigned() {
      return this.readEmployeeValue(['status'], '') === '已离职'
    }
  },
  methods: {
    readEmployeeValue(keys, fallback) {
      const list = Array.isArray(keys) ? keys : [keys]
      for (let i = 0; i < list.length; i++) {
        const value = this.employeeRecord[list[i]]
        if (value !== undefined && value !== null && value !== '') {
          return value
        }
      }
      return fallback
    },
    formatValue(value, fallback) {
      if (value === undefined || value === null || value === '') {
        return fallback === undefined ? '-' : fallback
      }
      const text = String(value)
      if (text.indexOf('T') > -1) {
        return text.replace('T', ' ').slice(0, 19)
      }
      return text
    },
    formatDateValue(value) {
      const text = this.formatValue(value)
      if (text === '-') {
        return '-'
      }
      return text.replace('T', ' ').split(' ')[0]
    },
    normalizeDepartmentPath(value) {
      return String(value || '')
        .split('/')
        .map(item => item.trim())
        .filter(item => item)
        .join('/')
    },
    createTag(key, label, type) {
      return { key, label, type }
    },
    getEmployeeTypeClass(value) {
      const text = String(value || '').toLowerCase()
      if (text.indexOf('实习') > -1 || text.indexOf('intern') > -1) {
        return 'tag-type-intern'
      }
      if (text.indexOf('试用') > -1 || text.indexOf('probation') > -1) {
        return 'tag-type-probation'
      }
      if (text.indexOf('正式') > -1 || text.indexOf('regular') > -1) {
        return 'tag-type-regular'
      }
      return 'tag-type-default'
    },
    getZjlbClass(value) {
      const text = String(value || '')
      if (text.indexOf('职员') > -1) {
        return 'tag-zjlb-staff'
      }
      if (text.indexOf('主管') > -1) {
        return 'tag-zjlb-supervisor'
      }
      if (text.indexOf('经理') > -1) {
        return 'tag-zjlb-manager'
      }
      return 'tag-zjlb-default'
    },
    hasDeptLeader() {
      return this.isTruthy(this.readEmployeeValue([
        'isDeptLeader',
        'deptLeader',
        'departmentHead',
        'isDepartmentHead',
        'isLeader',
        'isLeadership',
        '是否领导',
        '部门负责人'
      ], false))
    },
    isTruthy(value) {
      return value === true || value === 1 || value === '1' || value === 'true' || value === '是'
    }
  }
}
</script>

<style scoped lang="less">
.detail-panel-avatar-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}

.detail-panel-avatar-upload {
  width: 64px;
  height: 64px;
  flex-shrink: 0;

  /deep/ .ant-upload.ant-upload-select-picture-card,
  /deep/ .ant-upload-list-picture-card-container,
  /deep/ .ant-upload-list-picture-card .ant-upload-list-item {
    width: 64px;
    height: 64px;
    margin: 0;
    border-radius: 14px;
  }

  /deep/ .ant-upload.ant-upload-select-picture-card {
    border-color: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.22);
    background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.04);
  }

  /deep/ .iconp {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 0;
  }

  /deep/ .ant-upload-text {
    margin-top: 2px;
    font-size: 11px;
    line-height: 14px;
  }

  /deep/ .ant-upload-list-item-info > span,
  /deep/ .ant-upload-list-item-thumbnail {
    display: block;
    width: 100%;
    height: 100%;
  }

  /deep/ .ant-upload-list-item-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
  }
}

.detail-profile-meta {
  gap: 0;
  margin-top: 7px;
}

.detail-profile-meta-item {
  color: var(--employee-muted-foreground, #64748b);
  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
  white-space: nowrap;
}

.detail-profile-meta-item + .detail-profile-meta-item::before {
  content: '•';
  margin: 0 10px;
  color: #cbd5e1;
  font-weight: 800;
}

.detail-profile-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
  min-width: 0;
}

.detail-profile-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  min-height: 24px;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  line-height: 18px;
}

.detail-profile-tag-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

.detail-profile-tag-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-type-regular,
.tag-status-employed {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.tag-type-intern {
  color: #2d8cf0;
  background: rgba(45, 140, 240, 0.1);
}

.tag-type-probation,
.tag-type-default {
  color: #7c3aed;
  background: rgba(124, 58, 237, 0.1);
}

.tag-status-resigned {
  color: #64748b;
  background: rgba(100, 116, 139, 0.1);
}

.tag-leader {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
}

.tag-dept {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.tag-zjlb-staff {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.tag-zjlb-supervisor {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.1);
}

.tag-zjlb-manager {
  color: #fa8c16;
  background: rgba(250, 140, 22, 0.1);
}

.tag-zjlb-default {
  color: #722ed1;
  background: rgba(114, 46, 209, 0.1);
}
</style>
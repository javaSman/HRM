<template>
  <div class="deploy-form-wrapper">
    <!-- 主表单区域 -->
    <div class="modal-body">
      <div class="form-row">
        <label class="label">
          绑定申请模块
          <span class="req">*</span>
          <span class="hint">选择需要关联的流程申请</span>
        </label>
        <j-dict-select-tag
          v-model="model.sqmkCode"
          placeholder="请选择申请模块"
          dictCode="sqmk_code"
          class="select-custom" />
      </div>

      <div class="form-row">
        <label class="label">适用部门</label>
        <div class="pill-group">
          <div
            class="pill"
            :class="{ active: model.syDeptType === '1' }"
            @click="handleDepartmentTypeChange('1')">
            全部部门
          </div>
          <div
            class="pill"
            :class="{ active: model.syDeptType === '2' }"
            @click="handleDepartmentTypeChange('2')">
            指定部门
          </div>
        </div>

        <!-- 指定部门 - 子区块 -->
        <div class="spec-panel" :class="{ active: model.syDeptType === '2' }">
          <div class="input-col" style="justify-content: flex-end;">
            <button class="btn-add-circle" @click="openSub">
              <span class="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </span>
              <span>选择部门</span>
            </button>
          </div>

          <div class="tag-col">
            <span
              v-for="deptId in selectedDepartments"
              :key="deptId"
              class="tag">
              {{ selectedDeptMap[deptId] || deptId }}
              <span class="x" @click="removeDept(deptId)">×</span>
            </span>
            <div v-if="selectedDepartments.length === 0" class="empty-text">（尚未添加部门）</div>
          </div>

          <div class="spec-foot">
            <span class="ok">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              <span>已选 {{ selectedDepartments.length }} 个部门</span>
            </span>
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px;vertical-align:-1px;margin-right:3px">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4l3 2"/>
              </svg>
              支持多选
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 部门选择器（隐藏输入框，通过外部按钮触发弹窗） -->
    <j-select-depart
      ref="departmentSelector"
      v-model="deptValue"
      :multi="true"
      :backDepart="true"
      style="display: none;"
      @back="handleDepartmentBack" />
  </div>
</template>

<script>
import JSelectDepart from '@/components/jeecgbiz/JSelectDepart.vue'

export default {
  name: 'DeployForm',
  components: {
    JSelectDepart
  },
  data() {
    return {
      model: this.createDefaultModel(),
      deptValue: '', // j-select-depart 绑定值（逗号分隔的部门ID）
      selectedDepartments: [], // 存储选中的部门ID数组
      selectedDeptMap: {} // 存储部门ID到部门名称的映射
    }
  },
  methods: {
    createDefaultModel() {
      return {
        id: '',
        customProcessId: '',
        sqmkCode: undefined,
        syDeptType: '1' // 1：全部，2：指定
      }
    },
    add(defaults = {}) {
      this.model = Object.assign(this.createDefaultModel(), defaults)
      this.selectedDepartments = []
      this.selectedDeptMap = {}
      this.deptValue = ''
    },
    edit(record) {
      // 直接使用后端返回的 syDeptType 字段，没有值时再根据 zdDept 兜底推断
      let syDeptType = record.syDeptType
      if (!syDeptType) {
        syDeptType = record.zdDept && record.zdDept.length > 0 ? '2' : '1'
      }
      const deptIds = record.zdDept ? record.zdDept.split(',').filter(id => id) : []

      this.model = Object.assign(this.createDefaultModel(), {
        id: record.id,
        customProcessId: record.customProcessId,
        sqmkCode: record.sqmkCode,
        syDeptType: syDeptType
      })

      // 设置选中的部门ID和映射
      this.selectedDepartments = deptIds
      this.selectedDeptMap = {}

      // 兼容后端字段 zdDeptNmae（拼写）和 zdDeptName
      const zdDeptNameVal = record.zdDeptName || record.zdDeptNmae
      if (zdDeptNameVal) {
        const names = String(zdDeptNameVal).split(',')
        deptIds.forEach((deptId, index) => {
          this.$set(this.selectedDeptMap, deptId, names[index] || deptId)
        })
      } else {
        deptIds.forEach(deptId => {
          this.$set(this.selectedDeptMap, deptId, deptId)
        })
      }

      this.deptValue = deptIds.join(',')
    },
    handleDepartmentTypeChange(type) {
      this.model.syDeptType = type
      if (type === '1') { // 全部部门
        this.selectedDepartments = []
        this.selectedDeptMap = {}
        this.deptValue = ''
      }
    },
    removeDept(deptId) {
      const index = this.selectedDepartments.indexOf(deptId)
      if (index > -1) {
        this.selectedDepartments.splice(index, 1)
        this.$delete(this.selectedDeptMap, deptId)
      }
      // 同步更新 deptValue，保持 j-select-depart 同步
      this.deptValue = this.selectedDepartments.join(',')
    },
    openSub() {
      // 打开 j-select-depart 的弹窗
      if (this.$refs.departmentSelector) {
        this.$refs.departmentSelector.openModal()
      }
    },
    // j-select-depart 返回选中的部门信息
    handleDepartmentBack(rows) {
      if (!rows || !rows.length) {
        this.selectedDepartments = []
        this.selectedDeptMap = {}
        return
      }
      this.selectedDepartments = rows.map(item => item.value)
      this.selectedDeptMap = {}
      rows.forEach(item => {
        this.$set(this.selectedDeptMap, item.value, item.text)
      })
    },
    validateAndBuild(done) {
      if (!this.model.sqmkCode) {
        this.$message.warning('请选择申请模块')
        done(false)
        return
      }
      // 如果选择了指定部门但没有选择任何部门
      if (this.model.syDeptType === '2' && this.selectedDepartments.length === 0) {
        this.$message.warning('请至少选择一个部门')
        done(false)
        return
      }
      done(true, this.buildPayload())
    },
    buildPayload() {
      return {
        id: this.model.id,
        customProcessId: this.model.customProcessId,
        sqmkCode: this.model.sqmkCode,
        syDeptType: this.model.syDeptType,
        zdDept: this.model.syDeptType === '2' ? this.selectedDepartments.join(',') : ''
      }
    }
  }
}
</script>

<style lang="less" scoped>
.deploy-form-wrapper {
  /* CSS 变量 */
  --primary: #409eff;
  --primary-rgb: 64, 158, 255;
  --primary-dark: #3370ff;
  --primary-light: #66b1ff;
  --success: #67c23a;
  --danger: #f56c6c;
  --text: #303133;
  --text-2: #606266;
  --text-3: #909399;
  --text-4: #c0c4cc;
  --border: #dcdfe6;
  --border-light: #ebeef5;
  --bg: #ffffff;
  --bg-2: #f5f7fa;
  --pill-bg: #ecf5ff;
  --shadow-modal: 0 1px 4px rgba(0, 0, 0, 0.08), 0 0 8px rgba(0, 0, 0, 0.04);
  --shadow-strong: 0 8px 24px rgba(0, 0, 0, 0.18);

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* 主表单区域 */
  .modal-body {
    padding: 20px 30px 8px;
    background: #fff;
  }

  .form-row {
    margin-bottom: 18px;
  }

  .form-row .label {
    display: block;
    font-size: 14px;
    color: var(--text);
    margin-bottom: 8px;
  }

  .form-row .label .req {
    color: var(--danger);
    font-size: 14px;
    line-height: 1;
    margin: 0 2px 0 4px;
    vertical-align: middle;
  }

  .form-row .label .hint {
    color: var(--text-3);
    font-size: 13px;
    font-weight: 400;
    margin-left: 6px;
  }

  /* Select 自定义样式 */
  .select-custom {
    width: 100%;
  }

  /deep/ .select-custom .ant-select-selector {
    height: 38px !important;
    padding: 0 36px 0 14px !important;
    border: 1px solid var(--border) !important;
    border-radius: 6px !important;
    font-size: 14px !important;
    transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
  }

  /deep/ .select-custom .ant-select-selection__rendered {
    line-height: 36px !important;
  }

  /deep/ .select-custom:hover .ant-select-selector {
    border-color: #c0c4cc !important;
  }

  /deep/ .select-custom.ant-select-focused .ant-select-selector {
    border-color: var(--primary) !important;
    box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.18) !important;
  }

  /* 单选 pill */
  .pill-group {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 30px;
    padding: 0 16px;
    border-radius: 999px;
    background: #fff;
    border: 1px solid var(--border);
    font-size: 13px;
    color: var(--text-2);
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
  }

  .pill:hover {
    border-color: var(--primary);
    color: var(--primary-dark);
  }

  .pill.active {
    background: var(--primary);
    color: #fff;
    border-color: var(--primary);
    box-shadow: 0 2px 8px rgba(var(--primary-rgb), 0.35);
    font-weight: 600;
  }

  .pill.active:hover {
    background: var(--primary-dark);
    color: #fff;
  }

  /* 指定部门 - 嵌入式子区块 */
  .spec-panel {
    margin-top: 14px;
    background: rgba(64, 158, 255, 0.04);
    border: 1px solid #d9ecff;
    border-left: 3px solid var(--primary);
    border-radius: 8px;
    padding: 16px 18px 14px;
    display: none;
    animation: panelIn 0.25s ease;
  }

  .spec-panel.active {
    display: block;
  }

  @keyframes panelIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* 输入框 + 添加按钮 */
  .input-col {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    background: #fff;
    border: 1px solid var(--border-light);
    border-radius: 6px;
  }

  .input-col input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 13px;
    color: var(--text);
    font-family: inherit;
  }

  .input-col input::placeholder {
    color: var(--text-3);
  }

  .btn-add-circle {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 0;
    color: var(--primary);
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
  }

  .btn-add-circle:hover {
    color: var(--primary-dark);
  }

  .btn-add-circle .ic {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--primary);
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(var(--primary-rgb), 0.3);
  }

  .btn-add-circle .ic svg {
    width: 11px;
    height: 11px;
  }

  .btn-add-circle:hover .ic {
    background: var(--primary-dark);
  }

  /* 已选部门标签墙 */
  .tag-col {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-content: flex-start;
    margin-top: 12px;
    min-height: 48px;
    background: #fff;
    border: 1px solid var(--border-light);
    border-radius: 6px;
    padding: 10px 12px;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.03);
  }

  .empty-text {
    color: var(--text-4);
    font-size: 12px;
  }

  .tag {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 26px;
    padding: 0 5px 0 10px;
    background: var(--pill-bg);
    color: var(--primary);
    border: 1px solid #b3d8ff;
    border-radius: 6px;
    font-size: 12.5px;
    user-select: none;
    transition: all 0.2s ease;
  }

  .tag:hover {
    border-color: var(--primary);
  }

  .tag .x {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--primary);
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .tag .x:hover {
    background: var(--primary);
    color: #fff;
  }

  /* 底部提示 */
  .spec-foot {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-top: 10px;
    font-size: 12px;
    color: var(--text-3);
  }

  .spec-foot .ok {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--success);
  }

  .spec-foot .ok svg {
    width: 12px;
    height: 12px;
  }

  /* 响应式 */
  @media (max-width: 600px) {
    .modal-body {
      padding-left: 18px;
      padding-right: 18px;
    }
  }
}
</style>

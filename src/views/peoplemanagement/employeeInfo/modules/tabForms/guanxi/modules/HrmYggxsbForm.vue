<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail" class="detail-subtab-modal-form">
        <div class="detail-subtab-modal-grid">
          <a-form-model-item v-if="!hasParentGhId" class="detail-subtab-form-item" prop="ghId">
            <label class="detail-subtab-form-label">关联员工工号</label>
            <a-input v-model="model.ghId" placeholder="请输入关联员工工号" />
          </a-form-model-item>
          <a-form-model-item class="detail-subtab-form-item" prop="xm">
            <label class="detail-subtab-form-label">姓名</label>
            <a-input v-model="model.xm" placeholder="请输入姓名" />
          </a-form-model-item>
          <a-form-model-item class="detail-subtab-form-item" prop="gx">
            <label class="detail-subtab-form-label">关系</label>
            <a-input v-model="model.gx" placeholder="请输入关系" />
          </a-form-model-item>
          <!-- {{ deptOptions }} -->
          <a-form-model-item class="detail-subtab-form-item" prop="bm">
            <label class="detail-subtab-form-label">部门</label>
            <a-cascader
              v-model="deptPath"
              :options="deptOptions"
              :disabled="formDisabled || mainDeptLoading"
              :show-search="{ filter: filterDeptOption }"
              :getPopupContainer="getPopupContainer"
              :placeholder="mainDeptLoading ? '加载中...' : '请选择部门'"
              expand-trigger="hover"
              :change-on-select="true"
              @change="handleDeptChange"
            />
          </a-form-model-item>
          <a-form-model-item class="detail-subtab-form-item" prop="gw">
            <label class="detail-subtab-form-label">岗位</label>
            <a-select v-model="model.gw" allowClear showSearch optionFilterProp="children" placeholder="请选择岗位">
              <a-select-option v-for="item in postOptions" :key="item.value" :value="item.label">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item class="detail-subtab-form-item" prop="lxdh">
            <label class="detail-subtab-form-label">联系电话</label>
            <a-input v-model="model.lxdh" placeholder="请输入联系电话" />
          </a-form-model-item>
        </div>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>
import { getAction, httpAction } from '@/api/manage'

export default {
  name: 'HrmYggxsbForm',
  components: {},
  props: {
    // 表单禁用
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
    ghId: {
      type: [String, Number],
      default: '',
    },
    localMode: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      model: {
        bm: '',
        gw: '',
      },
      confirmLoading: false,
      // 部门级联树选项。
      deptOptions: [],
      // Cascader 使用路径数组；model.bm 只保存部门名称用于列表显示。
      deptPath: [],
      mainDeptLoading: false,
      postOptions: [],
      validatorRules: {},
      url: {
        add: '/yginfo/hrmYggxsb/add',
        edit: '/yginfo/hrmYggxsb/edit',
        queryById: '/yginfo/hrmYggxsb/queryById',
      },
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
    normalizedGhId() {
      if (this.ghId === undefined || this.ghId === null) {
        return ''
      }
      return String(this.ghId).trim()
    },
    hasParentGhId() {
      return this.normalizedGhId !== ''
    },
  },
  watch: {
    ghId: {
      immediate: true,
      handler() {
        this.applyParentGhId()
      },
    },
  },
  created() {
    // 备份model原始值
    this.modelDefault = JSON.parse(JSON.stringify(this.model))
    this.loadMainDeptOptions()
  },
  methods: {
    getPopupContainer(node) {
      return node.parentNode
    },
    add(record) {
      const addRecord = Object.assign({}, this.modelDefault, record || {})
      this.edit(addRecord)
    },
    edit(record) {
      const nextModel = Object.assign({}, this.modelDefault, record)
      if (this.hasParentGhId) {
        nextModel.ghId = this.normalizedGhId
      }
      this.model = nextModel
      this.visible = true
      this.syncDeptPath()
      this.loadPostOptions()
    },
    applyParentGhId() {
      if (this.hasParentGhId) {
        this.$set(this.model, 'ghId', this.normalizedGhId)
      }
    },
    // 加载部门树，完成编辑时的部门回显。
    loadMainDeptOptions() {
      this.mainDeptLoading = true
      return getAction('/org/hrmOrg/loadTreeRoot', { pid: 0 })
        .then((res) => {
          const list = res && res.success && Array.isArray(res.result) && res.result.length ? res.result : []
          const source = list.length > 0 ? list[0].children || list : []
          this.deptOptions = this.normalizeDeptOptions(source)
          this.syncDeptPath()
          this.loadPostOptions()
        })
        .catch(() => {
          this.deptOptions = []
          this.deptPath = []
          this.postOptions = []
        })
        .finally(() => {
          this.mainDeptLoading = false
        })
    },
    // 按当前部门加载岗位，下拉值保存岗位名称。
    loadPostOptions() {
      const currentDept = this.getCurrentDept()
      this.postOptions = []
      if (!currentDept) {
        return Promise.resolve()
      }
      this.model.bm = currentDept.label
      return getAction('/hrJobSequence/hrJobSequence/getChildSequences', {
        deptId: currentDept.id,
        column: 'createTime',
        order: 'desc',
        pageNo: 1,
        pageSize: 99999,
      })
        .then((res) => {
          const rows = Array.isArray(res) ? res : (res && res.result) || []
          const seen = new Set()
          this.postOptions = rows
            .map((item) => ({
              label: item.postName,
              value: item.id,
            }))
            .filter((item) => {
              if (!item.label || !item.value) return false
              if (seen.has(item.label)) return false
              seen.add(item.label)
              return true
            })
          const currentPost = rows.find(
            (item) => item.postName === this.model.gw || String(item.id) === String(this.model.gw || '')
          )
          if (currentPost) {
            this.model.gw = currentPost.postName
          }
        })
        .catch(() => {
          this.postOptions = []
        })
    },
    // 将后端部门树整理为 cascader 节点，同时保留完整路径名称。
    normalizeDeptOptions(list = [], parentPath) {
      const path = parentPath || []
      return (list || [])
        .filter((item) => item && (item.id || item.key || item.value || item.name || item.title))
        .map((item) => {
          const label = item.name || item.title || ''
          const value = String(item.id || item.key || item.value || label)
          const pathLabel = path.concat(label).filter(Boolean).join(' / ')
          const children = this.normalizeDeptOptions(item.children || null, path.concat(label))
          const info = {
            id: value,
            label,
            title: label,
            value,
            key: value,
            pathLabel,
            isLeaf: !children.length,
            children,
          }
          if (!children.length) {
            delete info.children
          }
          return info
        })
    },
    // 编辑回显时，用部门名称或路径名称反查 cascader 路径。
    syncDeptPath() {
      this.deptPath = this.model.bm ? this.findDeptPath(this.deptOptions, this.model.bm) : []
    },
    // 取当前 cascader 路径最后一级对应的部门节点。
    getCurrentDept() {
      if (!this.deptPath.length) {
        this.syncDeptPath()
      }
      return this.findDeptByValue(this.deptOptions, this.deptPath[this.deptPath.length - 1])
    },
    // 在部门树里查找部门名称、路径名称或 ID 对应的路径数组。
    findDeptPath(list, targetValue, parentPath) {
      const path = parentPath || []
      const normalizedTarget = String(targetValue || '')
      for (let i = 0; i < (list || []).length; i++) {
        const item = list[i]
        const nextPath = path.concat(String(item.value))
        if (
          String(item.value) === normalizedTarget ||
          item.label === normalizedTarget ||
          item.pathLabel === normalizedTarget
        ) {
          return nextPath
        }
        const matchedPath = this.findDeptPath(item.children || [], normalizedTarget, nextPath)
        if (matchedPath.length) {
          return matchedPath
        }
      }
      return []
    },
    // 根据部门 ID 查找部门节点。
    findDeptByValue(list, targetValue) {
      const normalizedTarget = String(targetValue || '')
      for (let i = 0; i < (list || []).length; i++) {
        const item = list[i]
        if (String(item.value) === normalizedTarget) {
          return item
        }
        const matchedDept = this.findDeptByValue(item.children || [], normalizedTarget)
        if (matchedDept) {
          return matchedDept
        }
      }
      return null
    },
    // 部门切换后保存部门名称，并刷新岗位选项。
    handleDeptChange(value, selectedOptions) {
      const path = Array.isArray(value) ? value.map((item) => String(item)) : []
      const currentDept =
        Array.isArray(selectedOptions) && selectedOptions.length
          ? selectedOptions[selectedOptions.length - 1]
          : this.findDeptByValue(this.deptOptions, path[path.length - 1])
      this.deptPath = path
      this.model.bm = currentDept ? currentDept.label : ''
      this.model.gw = ''
      this.loadPostOptions()
      if (this.$refs.form) {
        this.$refs.form.clearValidate(['bm'])
      }
    },
    // 支持 cascader 按路径节点名称搜索。
    filterDeptOption(inputValue, path) {
      const keyword = String(inputValue || '').toLowerCase()
      return (path || []).some(
        (option) =>
          String(option.label || option.title || '')
            .toLowerCase()
            .indexOf(keyword) > -1
      )
    },
    submitForm() {
      const that = this
      this.applyParentGhId()
      // 触发表单验证
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.localMode) {
            this.$emit('ok', Object.assign({}, this.model))
            return
          }
          that.confirmLoading = true
          let httpurl = ''
          let method = ''
          if (!this.model.id) {
            httpurl += this.url.add
            method = 'post'
          } else {
            httpurl += this.url.edit
            method = 'put'
          }
          httpAction(httpurl, this.model, method)
            .then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                that.$emit('ok')
              } else {
                that.$message.warning(res.message)
              }
            })
            .finally(() => {
              that.confirmLoading = false
            })
        }
      })
    },
  },
}
</script>

<style lang="less" scoped>
.detail-subtab-modal-form {
  min-height: 294px;
  padding: 20px 20px 18px;

  /deep/ .j-form-container-disabled {
    cursor: default;
  }

  /deep/ .ant-form-item {
    margin-bottom: 0;
  }

  /deep/ .ant-form-item-control {
    line-height: 1;
  }

  /deep/ .ant-form-explain {
    min-height: 18px;
    padding-top: 3px;
    font-size: 11px;
    line-height: 15px;
  }

  /deep/ .ant-input,
  /deep/ .ant-calendar-picker-input {
    height: 36px;
    padding: 0 12px;
    border-color: #dbe5f2;
    border-radius: 8px;
    color: #1f2d3d;
    font-size: 13px;
    box-shadow: none;
    transition: all 0.2s ease;

    &:hover {
      border-color: rgba(37, 99, 235, 0.35);
    }

    &:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
    }
  }

  /deep/ .ant-calendar-picker {
    width: 100%;
  }

  /deep/ .ant-select,
  /deep/ .ant-cascader-picker {
    width: 100%;
  }

  /deep/ .ant-select-selection--single {
    height: 36px;
    border-color: #dbe5f2;
    border-radius: 8px;
    box-shadow: none;
  }

  /deep/ .ant-select-selection__rendered {
    line-height: 34px;
  }
}

.detail-subtab-modal-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px 16px;
}

.detail-subtab-form-item {
  min-width: 0;
}

.detail-subtab-form-label {
  display: block;
  margin-bottom: 8px;
  color: rgba(37, 99, 235, 0.62);
  font-size: 11px;
  font-weight: 700;
  line-height: 14px;
}

@media (max-width: 720px) {
  .detail-subtab-modal-grid {
    grid-template-columns: 1fr;
  }
}
</style>

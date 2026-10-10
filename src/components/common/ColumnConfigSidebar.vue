<template>
  <a-drawer :visible="visible" :width="380" placement="right" title="" :closable="false" @close="$emit('close')">
    <div class="wrapper">
      <!-- 头部 -->
      <div class="ccs-header">
        <span class="ccs-title">字段配置</span>
        <a-icon class="ccs-close" type="close" @click="$emit('close')" />
      </div>

      <!-- 提示信息 -->
      <div class="ccs-tip">
        <a-icon type="info-circle" style="font-size: 16px;" />
        <span>可拖拽调整字段显示顺序，取消勾选将隐藏该列</span>
      </div>

      <!-- 搜索框 -->
      <div class="ccs-search">
        <a-input v-model="searchText" placeholder="搜索字段..." allow-clear size="small" />
      </div>

      <!-- 字段列表（vuedraggable 拖拽排序） -->
      <div class="ccs-body">
        <draggable
          v-model="configurableList"
          ghost-class="drag-ghost"
          drag-class="dragging"
          animation="200"
          :disabled="!!searchText"
        >
          <div
            v-for="col in filteredColumns"
            :key="col.fieldName"
            class="ccs-item"
          >
            <!-- 拖拽手柄 -->
            <span class="ccs-drag-handle" title="拖拽排序">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="6" r="1.5" />
                <circle cx="15" cy="6" r="1.5" />
                <circle cx="9" cy="12" r="1.5" />
                <circle cx="15" cy="12" r="1.5" />
                <circle cx="9" cy="18" r="1.5" />
                <circle cx="15" cy="18" r="1.5" />
              </svg>
            </span>
            <!-- 复选框 -->
            <a-checkbox
              :checked="col.fieldVisible"
              @change="(e) => toggleCheck(col.fieldName, e.target.checked)"
            >
              {{ getColTitle(col) }}
            </a-checkbox>
          </div>
        </draggable>

        <!-- 空状态 -->
        <a-empty v-if="filteredColumns.length === 0 && configurableList.length > 0" description="未找到匹配的字段" />
        <a-empty v-if="configurableList.length === 0" description="暂无可配置字段" />
      </div>

      <!-- 底部按钮 -->
      <div class="ccs-footer">
        <a-button size="small" @click="selectAll">全选</a-button>
        <a-button size="small" @click="deselectAll">全不选</a-button>
        <a-button class="modal-primary-btn" size="small" @click="handleConfirm">完成</a-button>
      </div>
    </div>
  </a-drawer>
</template>

<script>
import draggable from 'vuedraggable'

export default {
  name: 'ColumnConfigSidebar',
  components: { draggable },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    /** 列配置数组: [{ fieldName, fieldVisible, fieldSort, checkboxShow }] */
    allColumns: {
      type: Array,
      default: () => [],
    },
    /** fieldName → 显示标题 的映射 */
    fieldTitleMap: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      searchText: '',
      localColumns: [],
    }
  },

  computed: {
    /** 可拖拽的可配置列表（get/set 桥接 localColumns 和 draggable） */
    configurableList: {
      get() {
        return this.localColumns.filter((col) => col.checkboxShow)
      },
      set(newList) {
        // draggable 重新排序后的列表，同步回 localColumns
        const nonConfigurable = this.localColumns.filter((col) => !col.checkboxShow)
        this.localColumns = [...newList, ...nonConfigurable]
      },
    },

    /** 搜索过滤后的列（无搜索时返回原引用，保证 draggable 排序联动） */
    filteredColumns() {
      if (!this.searchText) {
        return this.configurableList
      }
      const keyword = this.searchText.toLowerCase()
      return this.configurableList.filter(
        (col) =>
          (col.fieldName && col.fieldName.toLowerCase().includes(keyword)) ||
          (this.getColTitle(col) && this.getColTitle(col).toLowerCase().includes(keyword))
      )
    },
  },

  watch: {
    visible(val) {
      if (val) {
        // 深拷贝，按 fieldSort 排序，避免直接修改父组件数据
        this.localColumns = this.allColumns.map((col) => ({ ...col, fieldSort: col.fieldSort || '' }))
          .sort((a, b) => {
            const sa = a.fieldSort === '' || a.fieldSort == null ? Infinity : Number(a.fieldSort)
            const sb = b.fieldSort === '' || b.fieldSort == null ? Infinity : Number(b.fieldSort)
            return sa - sb
          })
        this.searchText = ''
      }
    },
  },

  methods: {
    getColTitle(col) {
      return this.fieldTitleMap[col.fieldName] || col.fieldName
    },

    toggleCheck(fieldName, checked) {
      const col = this.localColumns.find((c) => c.fieldName === fieldName)
      if (col) {
        col.fieldVisible = checked
      }
    },

    selectAll() {
      this.configurableList.forEach((col) => {
        col.fieldVisible = true
      })
    },

    deselectAll() {
      this.configurableList.forEach((col) => {
        col.fieldVisible = false
      })
    },

    handleConfirm() {
      // fieldSort 按当前 index 下标赋值（从1开始），每次确认都覆盖更新
      this.configurableList.forEach((col, index) => {
        col.fieldSort = index + 1
      })
      this.$emit('confirm', this.localColumns.map((col) => ({ ...col })))
    },
  },
}
</script>

<style lang="less" scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  margin: -24px;
  height: 100vh;
}
/* ===== 头部 ===== */
.ccs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 0;
  flex-shrink: 0;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
}

.ccs-title {
  font-size: 16px;
  color: #ffffff;
}

.ccs-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  border: 0;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size:16px;
  color: #ffffff;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.35);
    color: #ffffff;
    border-color: transparent;
  }
}

/* ===== 提示信息 ===== */
.ccs-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 22px;
  font-size: 13px;
  color: #94a3b8;
  background: #fafbfc;
  border-bottom: 1px solid #e2e8f0;

  .anticon {
    color: #2d78ff;
  }
}

/* ===== 搜索框 ===== */
.ccs-search {
  padding: 14px 22px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

/deep/ .ccs-search .ant-input {
  height: 32px;
  border-color: #e2e8f0;
  border-radius: 6px;
  background: #ffffff;
  font-size: 12px;

  &:focus {
    border-color: rgba(45, 120, 255, 0.4);
    box-shadow: 0 0 0 3px rgba(45, 120, 255, 0.08);
  }
}

/* ===== 字段列表 ===== */
.ccs-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(45, 120, 255, 0.08);
    border-radius: 2px;
  }
}

/* ===== 单个字段项 ===== */
.ccs-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  transition: all 0.2s ease;
  user-select: none;
  border-bottom: 1px solid transparent;

  &:hover {
    background: rgba(45, 120, 255, 0.03);

    .ccs-drag-handle {
      opacity: 1;
      color: #2d78ff;
    }
  }

  /* vuedraggable 拖拽中样式 */
  &.dragging {
    opacity: 0.8;
    background: rgba(45, 120, 255, 0.08);
  }

  /* vuedraggable 占位符样式 */
  &.drag-ghost {
    opacity: 0.4;
    background: rgba(45, 120, 255, 0.06);
    border-top: 2px solid #2d78ff;
  }
}

/* ===== 拖拽手柄 ===== */
.ccs-drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: #cbd5e1;
  cursor: grab;
  opacity: 0.5;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    opacity: 1;
    color: #2d78ff;
  }

  &:active {
    cursor: grabbing;
  }

  svg {
    pointer-events: none;
  }
}

/* ===== 复选框样式覆盖 ===== */
/deep/ .ant-checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 12px;
  color: #1a2a3d;
  margin-right: 0;
  flex: 1;
}

/deep/ .ant-checkbox-checked .ant-checkbox-inner {
  background-color: #2d78ff;
  border-color: #2d78ff;
}

/* ===== 底部按钮 ===== */
.ccs-footer {
  padding: 14px 22px;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
  display: flex;
  gap: 8px;

  .ant-btn {
    flex: 1;
    text-align: center;
  }

  .modal-primary-btn {
    color: #fff !important;
    background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%) !important;
    box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2) !important;
    border: none !important;

    &:hover {
      background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%) !important;
      opacity: 0.92;
      box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2) !important;
    }
  }
}
</style>

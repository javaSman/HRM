<template>
  <div class="role-card-list">
    <div
      v-for="row in visibleRows"
      :key="row.key"
      class="role-card-row"
      :class="{ 'is-child': row.depth > 0 }"
      :style="{ marginLeft: row.indent }"
    >
      <button
        type="button"
        class="role-card"
        :class="{ selected: selectedKeys.indexOf(row.key) > -1 }"
        :title="row.node.title"
        :aria-expanded="row.hasChildren ? String(row.expanded) : null"
        @click="$emit('select', row.node)"
      >
        <a-icon
          v-if="isSelected(row)"
          class="role-card-selected-icon"
          type="check-circle"
        />
        <a-icon
          v-if="row.depth === 0 && row.hasChildren"
          class="role-card-action"
          :type="getActionIcon(row)"
          @click.stop="handleActionClick(row)"
        />
        <span class="role-card-content">
          <span class="role-card-main">
            <strong class="role-card-name">{{ row.node.title }}</strong>
          </span>
        </span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PositionRoleCardTree',
  props: {
    treeData: { type: Array, default: () => [] },
    expandedKeys: { type: Array, default: () => [] },
    selectedKeys: { type: Array, default: () => [] },
    forceExpand: { type: Boolean, default: false }
  },
  computed: {
    visibleRows() {
      return this.flattenRows(this.treeData, 0)
    }
  },
  methods: {
    flattenRows(list, depth) {
      return (list || []).reduce((rows, item) => {
        const key = String(item.key || item.id)
        const children = item.children || []
        const expanded = this.forceExpand || this.expandedKeys.indexOf(key) > -1
        rows.push({
          key,
          node: item,
          depth,
          indent: depth ? `${depth * 26}px` : '0',
          hasChildren: children.length > 0,
          expanded
        })
        if (children.length && expanded) {
          rows.push(...this.flattenRows(children, depth + 1))
        }
        return rows
      }, [])
    },
    isSelected(row) {
      return this.selectedKeys.indexOf(row.key) > -1
    },
    getActionIcon(row) {
      if (row.hasChildren && row.expanded) return 'up'
      return 'down'
    },
    getSequenceText(node) {
      return node.gwsl_dictText || node.gwsl || node.sequenceName_dictText || node.sequenceName || '未设置岗位序列'
    },
    getDeptText(node) {
      const text = node.mainDeptPath || node.dept || node.dept_dictText || node.deptId_dictText || ''
      return String(text).endsWith('/') ? String(text).slice(0, -1) : text
    },
    handleToggle(row) {
      if (!row.hasChildren) return
      const index = this.expandedKeys.indexOf(row.key)
      const nextKeys = index > -1
        ? this.expandedKeys.filter(key => key !== row.key)
        : this.expandedKeys.concat(row.key)
      this.$emit('expand', nextKeys)
    },
    handleActionClick(row) {
      if (row.hasChildren) {
        this.handleToggle(row)
        return
      }
      this.$emit('select', row.node)
    }
  }
}
</script>

<style scoped lang="less">
.role-card-list {
  padding: 2px 2px 8px;
}

.role-card-row {
  margin-bottom: 8px;
}

.role-card-row.is-child {
  padding-top: 2px;
}

.role-card {
  width: 100%;
  min-height: 60px;
  padding: 9px 12px;
  border: 1px solid #d9e7f7;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  color: #111827;
  text-align: left;
  cursor: pointer;
  box-shadow: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.role-card:hover,
.role-card.selected {
  border-color: #91caff;
  background: #f8fbff;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.14);
}

.role-card.selected {
  color: #1677ff;
}

.role-card.selected .role-card-selected-icon {
  color: #1677ff;
}

.role-card-selected-icon {
  color: #1677ff;
  font-size: 15px;
  flex-shrink: 0;
}

.role-card-content {
  min-width: 0;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  order: 1;
}

.role-card-action {
  color: #5b79a2;
  font-size: 13px;
  flex-shrink: 0;
  order: 2;
}

.role-card-main,
.role-card-name {
  min-width: 0;
}

.role-card-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.role-card-name,
.role-card-sequence,
.role-card-dept {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.role-card-name {
  color: #1f2937;
  font-size: 13px;
  line-height: 18px;
  font-weight: 600;
}

.role-card-sequence {
  color: #8294ac;
  font-size: 12px;
  line-height: 18px;
  font-weight: 500;
}

.role-card-dept {
  min-width: 0;
  color: #6f8bad;
  font-size: 12px;
  line-height: 16px;
}
</style>

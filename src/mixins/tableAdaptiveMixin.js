/**
 * 表格列宽自适应 Mixin
 * 功能：当没有横向滚动条时，自动让最后一个非固定列填充剩余空间
 *
 * 使用方法：
 * 1. 在组件中引入：import { tableAdaptiveMixin } from '@/mixins/tableAdaptiveMixin'
 * 2. 在 mixins 数组中添加：mixins: [JeecgListMixin, tableAdaptiveMixin]
 *    注意：tableAdaptiveMixin 必须放在最后，这样 tableScroll 才能覆盖 JeecgListMixin 的
 * 3. 在 columns 计算属性中调用：const processedColumns = this.adaptiveColumnsWidth(dataColumns, fixedColumns)
 */
export const tableAdaptiveMixin = {
  data() {
    return {
      // 表格容器宽度
      tableContainerWidth: 0,
      // ResizeObserver 实例
      resizeObserver: null,
      // 自适应处理是否就绪（容器宽度已正确获取）
      tableAdaptiveReady: false,
    }
  },

  computed: {
    /**
     * 表格滚动配置
     * 覆盖 JeecgListMixin 的 tableScroll，移除多余的初始值 60
     */
    tableScroll() {
      const x = this.columns.reduce((sum, column) => {
        return sum + (Number(column.width) || 120)
      }, 0)
      return { x }
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.initTableContainerWidth()
    })
  },

  beforeDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
  },

  methods: {
    /**
     * 初始化表格容器宽度监听
     */
    initTableContainerWidth() {
      const table = this.$refs.table
      if (!table || !table.$el) {
        // 如果表格还没渲染，延迟重试
        setTimeout(() => {
          this.initTableContainerWidth()
        }, 100)
        return
      }

      // 优先查找实际的滚动容器
      // 1. .ant-table-body - 表格主体（有滚动条的容器）
      // 2. .ant-table-content - 表格内容区
      // 3. .ant-table-wrapper - 外层包装器（fallback）
      let container =
        table.$el.querySelector('.ant-table-body') ||
        table.$el.querySelector('.ant-table-content') ||
        table.$el.closest('.ant-table-wrapper') ||
        table.$el.parentElement

      if (!container) {
        setTimeout(() => {
          this.initTableContainerWidth()
        }, 100)
        return
      }

      // 设置初始宽度
      this.tableContainerWidth = container.offsetWidth

      // 标记就绪状态
      if (this.tableContainerWidth > 0) {
        this.tableAdaptiveReady = true
      }

      // 使用 ResizeObserver 监听容器宽度变化
      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver((entries) => {
          for (let entry of entries) {
            const newWidth = entry.contentRect.width
            if (newWidth > 0) {
              this.tableContainerWidth = newWidth
              this.tableAdaptiveReady = true
            }
          }
        })
        this.resizeObserver.observe(container)
      }
    },

    /**
     * 智能处理列宽度
     * 当所有列都有固定width且列宽总和≤容器宽度时，移除最后一个非固定列的width
     * @param {Array} columns - 数据列配置数组（不包含固定列）
     * @param {Array} fixedColumns - 固定列配置数组（如操作列），可选
     * @returns {Array} 处理后的列配置
     */
    adaptiveColumnsWidth(columns, fixedColumns = []) {
      // 如果容器宽度还未正确获取，直接返回原列配置
      if (!this.tableAdaptiveReady || this.tableContainerWidth <= 0) {
        return columns
      }

      // 1. 计算数据列宽总和
      const dataColumnsWidth = columns.reduce((sum, col) => {
        return sum + (Number(col.width) || 120)
      }, 0)

      // 2. 计算固定列宽总和（如操作列）
      const fixedColumnsWidth = fixedColumns.reduce((sum, col) => {
        return sum + (Number(col.width) || 120)
      }, 0)

      // 3. 总宽度 = 数据列 + 固定列
      const totalWidth = dataColumnsWidth + fixedColumnsWidth

      // 4. 使用容器宽度
      const containerWidth = this.tableContainerWidth

      // 5. 判断是否会出现横向滚动条
      if (totalWidth > containerWidth) {
        // 会出现横向滚动条 → 保持所有列的固定宽度
        return columns
      }

      // 6. 不会出现横向滚动条，检查是否所有数据列都有 width 属性
      const allColumnsHaveWidth = columns.every((col) => col.width !== undefined)

      // 7. 如果已经有列没有 width，说明已有列可以自动扩展
      if (!allColumnsHaveWidth) {
        return columns
      }

      // 8. 所有列都有固定 width，且不会出现滚动条，移除最后一个非固定列的 width
      if (columns.length > 0) {
        // 从后往前找到第一个没有 fixed 属性的列
        let lastNonFixedIndex = -1
        for (let i = columns.length - 1; i >= 0; i--) {
          if (!columns[i].fixed) {
            lastNonFixedIndex = i
            break
          }
        }

        // 如果找到了非固定列，移除其 width
        if (lastNonFixedIndex !== -1) {
          return columns.map((col, index) => {
            if (index === lastNonFixedIndex) {
              const newCol = { ...col }
              delete newCol.width
              return newCol
            }
            return col
          })
        }
      }

      return columns
    },
  },
}

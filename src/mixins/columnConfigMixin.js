/**
 * 字段配置 Mixin
 * 用于表格列的个性化配置（显示/隐藏、排序）
 *
 * 使用方法：
 * 1. 在组件中引入：import { columnConfigMixin } from '@/mixins/columnConfigMixin'
 * 2. 在 mixins 数组中添加：mixins: [columnConfigMixin]
 * 3. 在 data 中设置 columnCode：columnCode: 'YourComponentCode'
 * 4. 在 computed 中定义 fieldTitleMap（字段标题映射）
 * 5. 在 columns 计算属性中调用 applyColumnConfig() 方法
 */

import { httpAction } from '@/api/manage'
import { USER_INFO } from '@/store/mutation-types'
import Vue from 'vue'

export const columnConfigMixin = {
  data() {
    return {
      // 字段配置侧边栏显示状态
      columnConfigVisible: false,
      // 字段配置是否生效
      columnTakeEffect: false,
      // 字段配置数据
      columnConfig: [],
      // 组件标识（需要在组件中指定）
      columnCode: '',
      columnConfigReady: false,
    }
  },

  methods: {
    /**
     * 打开字段配置侧边栏
     */
    toggleColumnConfig() {
      this.columnConfigVisible = true
    },

    /**
     * 获取字段配置
     * 从后端接口获取当前用户的字段配置
     * @returns {Promise} 返回 Promise，可在调用处链式处理
     */
    async getColumnConfig() {
      if (!this.columnCode) {
        console.warn('columnCode 未设置，无法获取字段配置')
        return
      }

      const userInfo = Vue.ls.get(USER_INFO)
      const userId = userInfo && userInfo.id
      if (!userId) {
        console.warn('无法获取用户ID')
        return
      }

      try {
        const res = await httpAction(
          `/hr_field_config/hrFieldConfig/queryBySysUserId?sysUserId=${userId}&fieldCompent=${this.columnCode}`,
          '',
          'get'
        )
        if (res.success) {
          this.columnConfig = res.result || []
          this.columnTakeEffect = true
          this.columnConfigReady = true
        }
      } catch (err) {
        console.error('获取字段配置失败:', err)
      }
    },

    /**
     * 保存字段配置
     * @param {Array} updatedColumns - 更新后的列配置
     */
    handleColumnConfigConfirm(updatedColumns) {
      httpAction(`/hr_field_config/hrFieldConfig/editBatch`, updatedColumns, 'POST')
        .then((res) => {
          if (res.success) {
            this.$message.success('保存成功')
            this.columnConfigVisible = false
            this.getColumnConfig()
          } else {
            this.$message.error(res.message || '保存失败')
          }
        })
        .catch((err) => {
          console.error('保存字段配置失败:', err)
          this.$message.error('保存失败')
        })
    },

    /**
     * 应用字段配置到列定义
     * 根据配置过滤和排序列
     *
     * @param {Array} originalColumns - 原始列定义数组
     * @param {Object} options - 配置选项
     * @param {Array} options.fixedColumns - 固定列（不参与配置，如操作列）
     * @param {Array} options.excludedFields - 排除字段（不参与配置）
     * @returns {Array} 处理后的列数组
     */
    applyColumnConfig(originalColumns, options = {}) {
      const { fixedColumns = [], excludedFields = [] } = options

      // 如果配置未生效，返回原始列
      if (!this.columnTakeEffect || !this.columnConfig.length) {
        return [...originalColumns, ...fixedColumns]
      }

      const result = []

      // 遍历配置，匹配原始列
      this.columnConfig.forEach((config) => {
        const matched = originalColumns.find((col) => col.dataIndex === config.fieldName)

        // 跳过排除字段
        if (excludedFields.includes(config.fieldName)) {
          return
        }

        if (matched) {
          // 标记为可配置
          config.checkboxShow = true

          // 如果字段可见，添加到结果
          if (config.fieldVisible) {
            result.push({
              ...matched,
              fieldSort: config.fieldSort || '',
            })
          }
        }
      })

      console.log('result', result)

      // 按排序值排序
      result.sort((a, b) => {
        const sortA = a.fieldSort === '' || a.fieldSort == null ? Infinity : Number(a.fieldSort)
        const sortB = b.fieldSort === '' || b.fieldSort == null ? Infinity : Number(b.fieldSort)
        return sortA - sortB
      })

      // 添加固定列
      return [...result, ...fixedColumns]
    },

    /**
     * 获取字段配置数据（供侧边栏使用）
     * @returns {Array} 字段配置数组
     */
    getColumnConfigData() {
      return this.columnConfig.map((item) => ({ ...item }))
    },
  },

  // 注意：mixin 不再自动调用 getColumnConfig
  // 需要在组件中手动调用 getColumnConfig() 并处理后续逻辑
  // 示例：
  // created() {
  //   this.getColumnConfig().then(() => {
  //     this.loadData(1)
  //   })
  // }
}

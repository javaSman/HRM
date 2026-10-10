<!--
  @description 导出打卡记录模态框组件
  @date 2026-08-19
  @functionality 提供临时工打卡记录的导出功能，支持按年月筛选导出
-->
<template>
  <!-- 导出打卡记录模态框 -->
  <a-modal
    title="导出打卡记录"
    :visible="visible"
    :width="440"
    :confirmLoading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <p style="margin-bottom: 14px; color: #64748b; font-size: 12.5px">选择年月，导出对应月份的临时工打卡记录。</p>
    <a-form-model ref="form" :model="formData" :labelCol="{ span: 6 }" :wrapperCol="{ span: 16 }">
      <a-form-model-item label="选择年月" prop="month">
        <a-month-picker v-model="formData.month" placeholder="请选择年月" style="width: 100%" />
      </a-form-model-item>
    </a-form-model>
  </a-modal>
</template>

<script>
import { downFile } from '@/api/manage'
import moment from 'moment'

/**
 * 导出打卡记录模态框组件
 * 提供临时工打卡记录的导出功能
 * 支持按年月筛选导出
 */
export default {
  name: 'ClockExportModal',
  props: {
    /** 模态框显示状态 */
    visible: {
      type: Boolean,
      default: false,
    },
    /** 需要导出的数据源 */
    dataSource: {
      type: Array,
      default: () => [],
    },
    /** 列表查询参数，导出时一并传入 */
    queryParam: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      /** 确认按钮加载状态 */
      confirmLoading: false,
      /** 表单数据 */
      formData: {
        month: null, // 选择的年月
      },
      /** 导出接口地址 */
      exportXlsUrl: '/hr_kq_yg/hrKqYg/exportXls',
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.initForm()
      }
    },
  },
  methods: {
    /**
     * 初始化表单
     * @returns {void}
     */
    initForm() {
      this.formData.month = moment()
    },
    /**
     * 确认提交
     * @returns {void}
     */
    handleSubmit() {
      if (!this.formData.month) {
        this.$message.warning('请选择年月')
        return
      }
      this.confirmLoading = true
      this.doExport()
        .then(() => {
          this.handleCancel()
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
    /**
     * 执行导出操作
     * @returns {Promise}
     */
    doExport() {
      const ym = this.formData.month.format('YYYY-MM')
      const fileName = `临时工打卡记录_${ym}`

      // 构建导出参数：年月 + 员工类型 + 列表查询参数
      const params = { dateTime: ym, employeeType: '临时工' }
      // 合并列表查询参数，过滤掉空值
      if (this.queryParam) {
        Object.keys(this.queryParam).forEach((key) => {
          const val = this.queryParam[key]
          if (val !== '' && val !== null && val !== undefined) {
            params[key] = val
          }
        })
      }

      return downFile(this.exportXlsUrl, params, 'get').then((data) => {
        if (!data) {
          this.$message.warning('文件下载失败')
          return
        }
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
          window.navigator.msSaveBlob(new Blob([data], { type: 'application/vnd.ms-excel' }), fileName + '.xls')
        } else {
          const url = window.URL.createObjectURL(new Blob([data], { type: 'application/vnd.ms-excel' }))
          const link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.setAttribute('download', fileName + '.xls')
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
        }
        this.$message.success(`已导出 ${ym} 打卡记录`)
      })
    },
    /**
     * 取消操作
     * @returns {void}
     */
    handleCancel() {
      this.$emit('update:visible', false)
      this.$emit('cancel')
    },
  },
}
</script>


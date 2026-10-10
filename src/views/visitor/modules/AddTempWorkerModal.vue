<template>
  <a-modal
    class="zt-modal add-temp-worker-modal"
    title="添加进入临时工"
    :width="440"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="取消"
  >
    <a-form :form="form">
      <a-form-item label="工种">
        <a-select
          v-decorator="['workTypeName', { rules: [{ required: true, message: '请选择工种' }] }]"
          showSearch
          allowClear
          optionFilterProp="children"
          placeholder="请选择工种"
          :loading="gzLoading"
          @change="handleWorkTypeChange"
        >
          <a-select-option v-for="name in gzOptions" :key="name" :value="name">
            {{ name }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-alert type="warning" v-if="alertTip">
        <template slot="message">
          <div>{{ alertTip }}</div>
        </template>
      </a-alert>
    </a-form>
  </a-modal>
</template>

<script>
import { getAction, postAction } from '@/api/manage'

export default {
  name: 'AddTempWorkerModal',
  computed: {
    // 提示语根据工种剩余名额情况显示
    alertTip() {
      const checkedCount = this.ids.length
      const check = this.workTypeCheck
      if (check) {
        const name = this.selectedWorkTypeName
        // 剩余需求人数为 0，该工种提单人数已满
        if (check.full || check.remaining === 0) {
          return `注意该【${name}】的所有的提单人数已满！超出人员将暂不分配岗位！`
        }
        // 勾选人数超出剩余需求人数
        if (check.exceedCount > 0) {
          return `该【${name}】剩余名额为 ${check.remaining} 人，本次勾选 ${checkedCount} 人，其中 ${check.exceedCount} 人将超出需求名额，超出人员将暂不分配岗位！`
        }
        return `该【${name}】剩余 ${check.remaining} 人，确定将选中的 ${checkedCount} 条劳动派遣记录添加进入临时工？`
      }
      return null
    },
  },
  data() {
    return {
      visible: false,
      confirmLoading: false,
      gzLoading: false,
      form: this.$form.createForm(this),
      // 待添加的劳动派遣记录 id 集合
      ids: [],
      // 工种选项（取接口 result 数组中每项的 name）
      gzOptions: [],
      // 当前选中的工种名称
      selectedWorkTypeName: '',
      // 当前工种剩余名额校验结果 { remaining, exceedCount, full }
      workTypeCheck: null,
    }
  },
  methods: {
    show(ids) {
      this.ids = Array.isArray(ids) ? ids.slice() : []
      this.selectedWorkTypeName = ''
      this.workTypeCheck = null
      this.visible = true
      this.$nextTick(() => {
        this.form.resetFields()
      })
      this.loadWorkTypes()
    },
    // 加载工种选项
    loadWorkTypes() {
      this.gzLoading = true
      getAction('/lsggl/tempWorkerApply/listWorkTypes')
        .then((res) => {
          var rows = (res && res.result) || []
          this.gzOptions = rows
        })
        .catch(() => {
          this.gzOptions = []
        })
        .finally(() => {
          this.gzLoading = false
        })
    },
    // 切换工种：查询该工种剩余名额，提示语根据名额情况显示
    handleWorkTypeChange(workTypeName) {
      this.selectedWorkTypeName = workTypeName || ''
      this.workTypeCheck = null
      if (!workTypeName) return
      getAction('/lsggl/tempWorkerApply/checkWorkTypeFull', { workTypeName, selectedCount: this.ids.length })
        .then((res) => {
          if (res && res.success && res.result) {
            // {
            //   "remaining": 9, 剩余名额
            //   "exceedCount": 0, 超出人数
            //   "full": false 	是否已满员
            // }
            this.workTypeCheck = res.result
          }
        })
        .catch(() => {})
    },
    handleOk() {
      this.form.validateFields((errors, values) => {
        if (!errors) {
          this.confirmLoading = true
          postAction('/lsggl/tempWorkerArchive/addByLdpq', {
            ldpqIds: this.ids,
            workTypeName: values.workTypeName,
          })
            .then((res) => {
              if (res.success) {
                this.$message.success('添加进入临时工成功')
                this.visible = false
                this.$emit('ok')
              } else {
                this.$message.warning(res.message || '添加进入临时工失败')
              }
            })
            .catch(() => {
              this.$message.error('添加进入临时工失败')
            })
            .finally(() => {
              this.confirmLoading = false
            })
        }
      })
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>
<style lang="less">
@import '~@assets/less/common.less';
</style>


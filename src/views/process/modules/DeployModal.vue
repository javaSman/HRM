<template>
  <j-modal
    title="部署"
    :width="560"
    :visible="visible"
    :confirmLoading="confirmLoading"
    switchFullscreen
    :dialogStyle="{ top: '100px' }"
    wrapClassName="deploy-modal"
    @ok="handleOk"
    @cancel="handleCancel">
    <deploy-form ref="deployForm" />
  </j-modal>
</template>

<script>
import { httpAction, getAction } from '@/api/manage'
import DeployForm from './DeployForm.vue'

export default {
  name: 'DeployModal',
  components: {
    DeployForm
  },
  data() {
    return {
      visible: false,
      confirmLoading: false,
      loading: false,
      url: {
        add: '/custom_process_bs/customProcessBs/add',
        edit: '/custom_process_bs/customProcessBs/edit',
        queryByProcessId: '/custom_process_bs/customProcessBs/queryBycustomProcessId'
      }
    }
  },
  methods: {
    /**
     * 打开部署弹窗
     * 先查询该流程的部署记录：
     *   - 多条 syDeptType=2（指定部门）的记录，合并去重后回显
     *   - 没有指定部门的，取第一条记录
     *   - 完全没有数据则走新增模式
     * @param {Object} defaults - 默认参数（含 customProcessId）
     */
    async add(defaults = {}) {
      this.visible = true
      this.loading = true
      const customProcessId = defaults.customProcessId

      try {
        if (customProcessId) {
          const res = await getAction(this.url.queryByProcessId, { customProcessId })
          if (res.success && res.result && Array.isArray(res.result) && res.result.length > 0) {
            // 筛选出所有指定部门的记录
            const deptRecords = res.result.filter(item => item.syDeptType === '2')
            let targetRecord

            if (deptRecords.length > 0) {
              // 合并所有指定部门记录的 zdDept（ID）和 zdDeptNmae/zdDeptName（名称）
              const idSet = new Set()
              const nameList = []
              // 以第一条记录为基础
              const baseRecord = { ...deptRecords[0] }

              deptRecords.forEach(item => {
                const ids = (item.zdDept || '').split(',').filter(id => id)
                const names = (item.zdDeptName || item.zdDeptNmae || '').split(',').filter(n => n)
                ids.forEach((id, idx) => {
                  if (!idSet.has(id)) {
                    idSet.add(id)
                    nameList.push(names[idx] || id)
                  }
                })
              })

              baseRecord.zdDept = Array.from(idSet).join(',')
              baseRecord.zdDeptName = nameList.join(',')
              targetRecord = baseRecord
            } else {
              // 没有指定部门的，就取第一条记录
              targetRecord = res.result[0]
            }

            this.$nextTick(() => {
              this.$refs.deployForm.edit(targetRecord)
            })
            return
          }
        }
        // 无部署记录 → 新增模式
        this.$nextTick(() => {
          this.$refs.deployForm.add(defaults)
        })
      } catch (e) {
        // 查询失败时降级为新增模式
        this.$nextTick(() => {
          this.$refs.deployForm.add(defaults)
        })
      } finally {
        this.loading = false
      }
    },
    edit(record) {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.deployForm.edit(record)
      })
    },
    handleCancel() {
      this.visible = false
    },
    handleOk() {
      this.$refs.deployForm.validateAndBuild((valid, payload) => {
        if (!valid) {
          return
        }
        const isEdit = !!payload.id
        const requestUrl = isEdit ? this.url.edit : this.url.add
        const requestMethod = isEdit ? 'put' : 'post'

        this.confirmLoading = true
        httpAction(requestUrl, payload, requestMethod)
          .then((res) => {
            if (!res.success) {
              this.$message.warning(res.message)
              return
            }
            this.$message.success(res.message || (isEdit ? '编辑成功' : '新增成功'))
            this.visible = false
            this.$emit('ok')
          })
          .catch(() => {
            this.$message.error('部署保存失败，请稍后重试')
          })
          .finally(() => {
            this.confirmLoading = false
          })
      })
    }
  }
}
</script>

<style lang="less" scoped>
// 可以添加特定的弹窗样式
</style>

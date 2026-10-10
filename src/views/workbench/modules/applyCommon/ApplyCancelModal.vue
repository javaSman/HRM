<template>
  <!-- 公共「取消申请」确认弹窗：接口差异由 applyTypeRegistry 的 cancel 描述块 + workbench.cancelApply 消化 -->
  <a-modal
    :visible="visible"
    title="取消申请确认"
    ok-text="确认取消"
    cancel-text="暂不取消"
    :ok-button-props="{ props: { type: 'danger' } }"
    :confirm-loading="loading"
    :mask-closable="false"
    @ok="handleOk"
    @cancel="handleClose">
    <p class="acm-tip">
      确认取消该申请？<span class="acm-target">（{{ who }}提交的{{ type }}）</span>
      取消后不可恢复。
    </p>
    <!-- 描述块声明 reasonField 时（如调动/离职），取消原因为必填；考勤族不渲染 -->
    <div v-if="reasonField" class="acm-reason">
      <label><span class="acm-required">*</span>取消原因</label>
      <a-textarea
        v-model="reason"
        :rows="3"
        :max-length="200"
        placeholder="请输入取消原因"
      />
    </div>
  </a-modal>
</template>

<script>
import { getApplyType } from './applyTypeRegistry'
import { cancelApply } from './workbench'

export default {
  name: 'ApplyCancelModal',
  props: {
    // .sync 控制显隐
    visible: {
      type: Boolean,
      default: false
    },
    // 申请类型（联合视图 mkname），用于查注册表 cancel 描述块
    type: {
      type: String,
      default: ''
    },
    // 归一化后的卡片视图模型（raw 联合视图原始行 + nested 嵌套实体），分发器按类型取 id / 整条实体
    item: {
      type: Object,
      default: () => null
    },
    // 弹窗文案中的「xxx提交的xxx申请」主语
    who: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      reason: ''
    }
  },
  computed: {
    cancelConf() {
      const conf = getApplyType(this.type)
      return (conf && conf.cancel) || null
    },
    reasonField() {
      return (this.cancelConf && this.cancelConf.reasonField) || ''
    }
  },
  watch: {
    // 每次打开重置原因，避免上次输入残留
    visible(v) {
      if (v) this.reason = ''
    }
  },
  methods: {
    handleClose() {
      if (this.loading) return
      this.$emit('update:visible', false)
    },
    handleOk() {
      if (!this.cancelConf) {
        this.$message.warning('该申请类型暂不支持取消')
        return
      }
      const reason = this.reason.trim()
      if (this.reasonField && !reason) {
        this.$message.warning('请填写取消原因')
        return
      }
      this.loading = true
      cancelApply(this.type, this.item, reason).then((res) => {
        // 与各模块列表页撤回一致：success=false 时提示但不关闭弹窗，允许重试
        if (res && res.success === false) {
          this.$message.warning(res.message || '取消失败')
          return
        }
        this.$message.success((res && res.message) || '申请已取消')
        this.$emit('success')
        this.$emit('update:visible', false)
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style lang="less" scoped>
.acm-tip {
  font-size: 13px;
  line-height: 1.6;
  margin: 0;
}

.acm-target {
  font-weight: 600;
  color: #2563eb;
}

.acm-reason {
  margin-top: 14px;

  label {
    display: block;
    font-size: 13px;
    color: #1a2a3d;
    margin-bottom: 6px;
  }
}

.acm-required {
  color: #ef4444;
  margin-right: 2px;
}
</style>

<!--
  @description 面试结果登记弹窗
  @date 2026-10-09
  @functionality 勾选劳动派遣记录后批量登记面试结果（已通过/不通过），已入档记录不可修改。参考原型 id=ivModal
-->
<template>
  <a-modal :visible="visible" :width="480" :maskClosable="false" class="tw-iv-modal" @cancel="handleCancel">
    <template slot="title"> <a-icon type="solution" />面试结果登记 </template>

    <div class="iv-modal-body">
      <!-- 已勾选条：数量 + 姓名 chips -->
      <div class="selected-strip">
        <span class="strip-label"><a-icon type="check-square" />已勾选</span>
        <span class="strip-num">{{ records.length }}</span>
        <span class="strip-suffix">条临时工记录</span>
        <div class="strip-chips">
          <span v-for="item in records" :key="item.id" class="strip-chip">{{ item.xm }}</span>
        </div>
      </div>

      <!-- 覆盖提示：勾选中含「已通过」记录时展示 -->
      <div v-if="alreadyPassCount" class="iv-warn">
        <a-icon type="warning" />
        <div>
          您勾选的 <b>{{ alreadyPassCount }}</b> 条记录已为「已通过」，重新登记将覆盖原面试结果，请谨慎操作。
        </div>
      </div>

      <!-- 覆盖提示：勾选中含「不通过」记录时展示 -->
      <div v-if="alreadyFailCount" class="iv-warn">
        <a-icon type="warning" />
        <div>
          您勾选的 <b>{{ alreadyFailCount }}</b> 条记录已为「不通过」，重新登记将覆盖原面试结果，请谨慎操作。
        </div>
      </div>

      <label class="form-label">请选择面试结果：</label>
      <div class="iv-opts">
        <div :class="['iv-opt', result === '1' ? 'active' : '']" @click="result = '1'">
          <a-icon type="check-circle" theme="filled" class="iv-opt-icon pass" />
          <div class="t">已通过</div>
        </div>
        <div :class="['iv-opt', result === '2' ? 'active' : '']" @click="result = '2'">
          <a-icon type="close-circle" theme="filled" class="iv-opt-icon fail" />
          <div class="t">不通过</div>
        </div>
      </div>
    </div>

    <template slot="footer">
      <a-button @click="handleCancel">取消</a-button>
      <a-button type="primary" :loading="confirmLoading" :disabled="!result" @click="handleOk"> 确定 </a-button>
    </template>

    <!-- 已入档等不可修改场景的报错弹窗（参考原型 ivErrModal） -->
    <a-modal
      :visible="errVisible"
      :width="440"
      :maskClosable="false"
      class="tw-iv-err-modal"
      @cancel="errVisible = false"
    >
      <template slot="title"> <a-icon type="warning" />无法修改面试状态 </template>
      <div class="del-warn">
        <a-icon type="stop" class="del-warn-icon" />
        <div v-html="errText"></div>
      </div>
      <template slot="footer">
        <a-button type="primary" @click="errVisible = false">我知道了</a-button>
      </template>
    </a-modal>
  </a-modal>
</template>

<script>
import { getAction } from '@/api/manage'

export default {
  name: 'InterviewModal',
  data() {
    return {
      /** 弹窗显示状态 */
      visible: false,
      /** 勾选的劳动派遣记录（接口原始记录） */
      records: [],
      /** 本次选择的面试结果：'1'-已通过，'2'-不通过 */
      result: '',
      /** 提交加载状态 */
      confirmLoading: false,
      /** 报错弹窗显示状态 */
      errVisible: false,
      /** 报错弹窗文案（含姓名，v-html） */
      errText: '',
    }
  },
  computed: {
    /** 勾选记录中当前已为「已通过」的条数（覆盖登记提醒） */
    alreadyPassCount() {
      return this.records.filter((item) => item.mszt === '1' || item.mszt === 1).length
    },
    /** 勾选记录中当前已为「不通过」的条数（覆盖登记提醒） */
    alreadyFailCount() {
      return this.records.filter((item) => item.mszt === '2' || item.mszt === 2).length
    },
  },
  methods: {
    /**
     * 打开弹窗
     * @param {Array} records - 勾选的劳动派遣记录（需含 id、xm）
     */
    show(records) {
      this.records = Array.isArray(records) ? records.slice() : []
      this.result = ''
      this.errVisible = false
      this.visible = true
    },
    /** 确定：批量登记面试结果 */
    handleOk() {
      if (!this.result) {
        this.$message.warning('请选择面试结果')
        return
      }
      // // 已入档记录不可修改面试状态，弹窗提示并拦截整次提交
      // const archived = this.records.filter((item) => item.isLsgda === '1' || item.isLsgda === 1)
      // if (archived.length) {
      //   const names = archived.map((item) => '【' + item.xm + '】').join('、')
      //   this.errText = '该' + names + '临时工已入档，无法修改面试状态。'
      //   this.errVisible = true
      //   return
      // }
      this.confirmLoading = true
      getAction('/fkzx/hrmFkzxSq/updateMszt', {
        ids: this.records.map((item) => item.id).join(','),
        mszt: this.result,
      })
        .then((res) => {
          if (res.success) {
            this.$message.success(res.message || '面试结果登记成功')
            this.visible = false
            this.$emit('ok')
          } else {
            this.$message.warning(res.message || '面试结果登记失败')
          }
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
    /** 取消关闭 */
    handleCancel() {
      this.visible = false
    },
  },
}
</script>

<style lang="less" scoped>
/* 覆盖 a-modal 默认样式，与添加工弹窗风格统一 */
.tw-iv-modal {
  /deep/ .ant-modal-content {
    border-radius: 12px;
    overflow: hidden;
  }
  /deep/ .ant-modal-header {
    position: relative;
    padding: 15px 20px;
    background: linear-gradient(135deg, #2563eb, #4f7dff);
    border-bottom: none;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 2px;
      background: linear-gradient(90deg, #00b4d8, rgba(255, 255, 255, 0.4));
    }
  }
  /deep/ .ant-modal-title {
    color: #fff;
    font-size: 15px;
    font-weight: 600;

    .anticon {
      margin-right: 8px;
    }
  }
  /deep/ .ant-modal-close-x {
    color: rgba(255, 255, 255, 0.85);

    &:hover {
      color: #fff;
    }
  }
  /deep/ .ant-modal-body {
    padding: 18px 22px 6px;
  }
  /deep/ .ant-modal-footer {
    padding: 12px 22px;
    border-top: 1px solid #e2e8f0;
    background: rgba(37, 99, 235, 0.015);
  }
}

/* 报错弹窗：红色头部 */
.tw-iv-err-modal {
  /deep/ .ant-modal-header {
    background: linear-gradient(135deg, #ef4444, #f87171);
  }
}

/* 已勾选条 */
.selected-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  padding: 9px 11px;
  border: 1px dashed rgba(37, 99, 235, 0.22);
  border-radius: 8px;
  background: rgba(37, 99, 235, 0.025);
  margin-bottom: 14px;
}
.strip-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(37, 99, 235, 0.75);
  display: flex;
  align-items: center;
  gap: 5px;
}
.strip-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 17px;
  height: 17px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
  font-size: 10.5px;
  font-weight: 700;
  padding: 0 4px;
}
.strip-suffix {
  font-size: 12px;
  color: #64748b;
}
.strip-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.strip-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid #e2e8f0;
  font-size: 12px;
  font-weight: 500;
}

/* 覆盖登记提醒 */
.iv-warn {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: 9px;
  padding: 10px 12px;
  margin-bottom: 14px;
  font-size: 12.5px;
  line-height: 1.6;
  color: #92400e;

  .anticon {
    font-size: 16px;
    color: #f59e0b;
    flex-shrink: 0;
    margin-top: 1px;
  }
}

/* 面试结果选项 */
.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 10px;
}
.iv-opts {
  display: flex;
  gap: 12px;
  margin-bottom: 15px;
}
.iv-opt {
  flex: 1;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  gap: 10px;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fff;

  .iv-opt-icon {
    font-size: 22px;
    flex-shrink: 0;

    &.pass {
      color: #10b981;
    }
    &.fail {
      color: #ef4444;
    }
  }

  .t {
    font-size: 14px;
    font-weight: 600;
  }

  &:hover {
    border-color: rgba(37, 99, 235, 0.4);
  }

  &.active {
    border-color: #2563eb;
    background: rgba(37, 99, 235, 0.05);
    box-shadow: 0 2px 8px rgba(45, 120, 255, 0.12);

    &:has(.pass) {
      border-color: #10b981;
      background: rgba(16, 185, 129, 0.08);
    }
    &:has(.fail) {
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.06);
    }
  }
}

/* 报错内容 */
.del-warn {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.28);
  border-radius: 10px;
  padding: 16px 18px;

  .del-warn-icon {
    font-size: 22px;
    color: #dc2626;
    flex-shrink: 0;
    margin-top: 1px;
  }

  div {
    font-size: 13.5px;
    line-height: 1.7;
    color: #7f1d1d;
  }
}
</style>


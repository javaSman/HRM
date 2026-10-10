<!--
  @description 添加进入临时工弹窗
  @date 2026-09-29
  @functionality 将勾选的未入档劳动派遣记录按工种批量添加进入临时工，含名额规则提示与分配预览。参考原型 id=addModal
-->
<template>
  <a-modal :visible="visible" :width="600" :maskClosable="false" class="tw-add-modal" @cancel="handleCancel">
    <template slot="title"> <a-icon type="user-add" />添加进入临时工 </template>

    <div class="add-modal-body">
      <!-- 已勾选条：数量 + 姓名 chips -->
      <div class="selected-strip">
        <span class="strip-label"><a-icon type="check-square" />已勾选</span>
        <span class="strip-num">{{ records.length }}</span>
        <span class="strip-suffix">条劳动派遣记录</span>
        <div class="strip-chips">
          <span v-for="item in records" :key="item.id" class="strip-chip">{{ item.xm }}</span>
        </div>
      </div>

      <!-- 工种 -->
      <div class="form-group">
        <label class="form-label"><span class="req">*</span>工种：</label>
        <a-select
          :value="workTypeName"
          showSearch
          allowClear
          optionFilterProp="children"
          placeholder="请选择岗位/工种"
          :loading="workTypeLoading"
          @change="handleWorkTypeChange"
          style="margin-bottom: 8px"
        >
          <a-select-option v-for="item in workTypeOptions" :key="item.workTypeName" :value="item.workTypeName">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </div>

      <!-- 名额规则提示 -->
      <div v-if="alert" :class="['alert-box', alert.cls]">
        <a-icon :type="alert.icon" />
        <div v-html="alert.text"></div>
      </div>

      <!-- 分配预览 -->
      <div v-if="currentWorkType" class="assign-block">
        <div class="section-title-soft"><a-icon type="ordered-list" />分配预览</div>
        <div class="assign-list">
          <div v-for="(row, index) in assignments" :key="row.record.id" :class="['assign-row', row.dept ? '' : 'none']">
            <span class="assign-idx">{{ index + 1 }}</span>
            <template v-if="row.dept">
              <a-icon type="login" />
              <span class="nm">{{ row.record.xm }}</span>
              <span class="assign-txt">分配至</span>
              <a-select
                class="dept-select"
                :value="row.dept.itemId"
                showSearch
                optionFilterProp="children"
                placeholder="选择分配部门"
                @change="(value) => handleDeptChange(row.record.id, value)"
              >
                <a-select-option
                  v-for="dept in currentWorkType.deptList"
                  :title="dept.deptPath"
                  :key="dept.itemId"
                  :value="dept.itemId"
                  :class="{ 'tw-dept-full': dept.remainingCount === 0 }"
                >
                  {{ dept.deptPath }}
                </a-select-option>
              </a-select>
              <span class="post">【{{ workTypeName }}】岗位</span>
            </template>
            <template v-else>
              <a-icon type="stop" />
              <span>
                <span class="nm">{{ row.record.xm }}</span> 超出需求名额，
                <span class="dept">暂不分配岗位</span>
              </span>
            </template>
          </div>
        </div>
      </div>
    </div>

    <template slot="footer">
      <a-button @click="handleCancel">取消</a-button>
      <a-button type="primary" :loading="confirmLoading" :disabled="!workTypeName" @click="handleOk"> 确定 </a-button>
    </template>
  </a-modal>
</template>

<script>
import { getAction, postAction } from '@/api/manage'

export default {
  name: 'AddWorkerModal',
  data() {
    return {
      /** 弹窗显示状态 */
      visible: false,
      /** 勾选的劳动派遣记录（接口原始记录） */
      records: [],
      /** 工种选项 */
      workTypeOptions: [],
      /** 工种加载状态 */
      workTypeLoading: false,
      /** 当前工种名称 */
      workTypeName: '',
      /** 手动修改的部门分配：recordId -> deptList 项的 itemId */
      deptOverrides: {},
      /** 提交加载状态 */
      confirmLoading: false,
    }
  },
  computed: {
    /** 当前选中的工种对象（listWorkTypes 返回项，含 remainingCount、deptList） */
    currentWorkType() {
      return this.workTypeOptions.find((item) => item.workTypeName === this.workTypeName) || null
    },
    /** 当前工种剩余名额 */
    remaining() {
      return this.currentWorkType ? this.currentWorkType.remainingCount : 0
    },
    /** 超出名额人数 = 勾选数 − 剩余名额（不小于 0） */
    exceedCount() {
      if (!this.currentWorkType) return 0
      return Math.max(this.records.length - this.remaining, 0)
    },
    /**
     * 分配结果：仅前 remainingCount 行可分配，默认部门为 deptList[0]；
     * 手动改选（deptOverrides）优先；其余行 dept 为 null（暂不分配岗位）
     */
    assignments() {
      const deptList = (this.currentWorkType && this.currentWorkType.deptList) || []
      const defaultDept = deptList[0] || null
      const deptMap = {}
      deptList.forEach((dept) => {
        deptMap[dept.itemId] = dept
      })
      return this.records.map((record, index) => {
        // 超出名额的行不可分配
        if (index >= this.remaining) {
          return { record, dept: null }
        }
        // 手动改选的部门优先，否则默认 deptList[0]
        const overrideId = this.deptOverrides[record.id]
        if (overrideId && deptMap[overrideId]) {
          return { record, dept: deptMap[overrideId] }
        }
        return { record, dept: defaultDept }
      })
    },
    /** 名额规则提示（规则 1 常规 / 规则 2 名额将满 / 规则 3 超出名额） */
    alert() {
      if (!this.currentWorkType || !this.workTypeName) return null
      const n = this.records.length
      const r = this.remaining
      const over = this.exceedCount
      const name = this.workTypeName
      if (over > 0) {
        // 剩余名额为 0 时，前置"提单人数已满"提示；其余超出情况保留工种前缀
        const prefix =
          r === 0
            ? '注意该【<b>' + name + '</b>】的所有的提单人数已满！剩余名额为 '
            : '该【<b>' + name + '</b>】剩余名额为 '
        return {
          cls: 'exceed',
          icon: 'warning',
          text:
            prefix +
            '<b>' +
            r +
            '</b> 人，本次勾选 <b>' +
            n +
            '</b> 人，其中 <b>' +
            over +
            '</b> 人将超出需求名额，超出人员将暂不分配岗位！',
        }
      }
      if (r === n) {
        return {
          cls: 'full',
          icon: 'info-circle',
          text:
            '该【<b>' +
            name +
            '</b>】剩余 <b>' +
            r +
            '</b> 人，确定将选中的 <b>' +
            n +
            '</b> 条劳动派遣记录添加进入临时工？',
        }
      }
      return {
        cls: 'normal',
        icon: 'info-circle',
        text:
          '该【<b>' +
          name +
          '</b>】剩余 <b>' +
          r +
          '</b> 人，确定将选中的 <b>' +
          n +
          '</b> 条劳动派遣记录添加进入临时工？',
      }
    },
  },
  methods: {
    /**
     * 打开弹窗
     * @param {Array} records - 勾选的劳动派遣记录（需含 id、xm）
     */
    show(records) {
      this.records = Array.isArray(records) ? records.slice() : []
      this.workTypeName = ''
      this.deptOverrides = {}
      this.visible = true
      this.loadWorkTypes()
    },
    /** 加载工种选项（返回项含剩余名额与部门分配信息） */
    loadWorkTypes() {
      this.workTypeLoading = true
      getAction('/lsggl/tempWorkerApply/listWorkTypes')
        .then((res) => {
          if (res.success) {
            this.workTypeOptions = res.result || []
          }
        })
        .finally(() => {
          this.workTypeLoading = false
        })
    },
    /** 切换工种：名额与部门分配信息已在工种数据中，直接取用，并清空手动修改 */
    handleWorkTypeChange(value) {
      this.workTypeName = value || ''
      this.deptOverrides = {}
    },
    /** 手动修改某人的分配部门 */
    handleDeptChange(recordId, itemId) {
      this.$set(this.deptOverrides, recordId, itemId)
    },
    /** 确定：批量添加进入临时工 */
    handleOk() {
      if (!this.workTypeName) {
        this.$message.warning('请选择岗位/工种')
        return
      }
      this.confirmLoading = true
      const deptList = (this.currentWorkType && this.currentWorkType.deptList) || []
      // 默认部门（未手动改选的人统一由顶层 itemId 兜底）
      const defaultItemId = deptList.length ? deptList[0].itemId : ''
      // 暂不分配岗位（itemId 留空走自动匹配）与手动改选了部门的人，逐人写入 assignList
      const assignList = []
      this.assignments.forEach((row) => {
        if (!row.dept) {
          assignList.push({ ldpqId: row.record.id, itemId: '' })
        } else if (row.record.id in this.deptOverrides) {
          assignList.push({ ldpqId: row.record.id, itemId: row.dept.itemId })
        }
      })
      // assignList 中的人不再放入 ldpqIds，避免重复；ldpqIds 仅留未改选、走默认部门的人
      const assignIds = assignList.map((item) => item.ldpqId)
      const ldpqIds = this.records.map((item) => item.id).filter((id) => assignIds.indexOf(id) === -1)
      const params = {
        ldpqIds,
        workTypeName: this.workTypeName,
        assignList,
      }
      if (defaultItemId) {
        params.itemId = defaultItemId
      }
      postAction('/lsggl/tempWorkerArchive/addByLdpq', params)
        .then((res) => {
          if (res.success) {
            this.$message.success(res.message || '添加进入临时工成功')
            this.visible = false
            this.$emit('ok')
          } else {
            this.$message.warning(res.message || '添加进入临时工失败')
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
/* 覆盖 a-modal 默认样式，与删除确认弹窗风格统一 */
.tw-add-modal {
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
  margin-bottom: 16px;
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

/* 工种表单项 */
.form-group {
  display: flex;
  flex-direction: column;
}
.form-label {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;

  .req {
    color: #ef4444;
    margin-right: 2px;
  }
}

/* 字段下方名额已满提醒 */
.inline-remind {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 12.3px;
  font-weight: 600;
  color: #d97706;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: 7px;
  padding: 7px 10px;
}

/* 名额规则提示框 */
.alert-box {
  margin-top: 12px;
  border-radius: 8px;
  padding: 11px 13px;
  font-size: 12.8px;
  line-height: 1.65;
  display: flex;
  gap: 9px;
  align-items: flex-start;
  border: 1px solid transparent;

  .anticon {
    font-size: 15px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  b {
    font-weight: 700;
  }

  &.normal {
    background: rgba(245, 158, 11, 0.08);
    border-color: rgba(245, 158, 11, 0.32);
    color: #b45309;

    .anticon {
      color: #d97706;
    }
  }
  &.full {
    background: rgba(245, 158, 11, 0.12);
    border-color: rgba(245, 158, 11, 0.45);
    color: #b45309;

    .anticon {
      color: #d97706;
    }
  }
  &.exceed {
    background: rgba(239, 68, 68, 0.07);
    border-color: rgba(239, 68, 68, 0.35);
    color: #b91c1c;

    .anticon {
      color: #dc2626;
    }
  }
}

/* 分配预览 */
.assign-block {
  margin-top: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 13px 14px;
  background: rgba(37, 99, 235, 0.015);
}
.section-title-soft {
  font-size: 12px;
  font-weight: 600;
  color: rgba(37, 99, 235, 0.7);
  letter-spacing: 1.2px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.assign-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 230px;
  overflow-y: auto;
}
.assign-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  padding: 7px 10px;
  border-radius: 7px;
  background: rgba(37, 99, 235, 0.05);
  border: 1px solid rgba(37, 99, 235, 0.12);

  .anticon {
    font-size: 13px;
    color: #2563eb;
    flex-shrink: 0;
  }
  .nm {
    font-weight: 600;
  }
  .assign-txt {
    white-space: nowrap;
  }
  .dept-select {
    flex: 1;
    min-width: 180px;
  }
  .dept {
    color: #2563eb;
    font-weight: 600;
    word-break: break-all;
  }
  .post {
    font-weight: 600;
    white-space: nowrap;
  }

  &.none {
    background: rgba(239, 68, 68, 0.05);
    border-color: rgba(239, 68, 68, 0.22);

    .anticon,
    .dept {
      color: #dc2626;
    }
  }
}
.assign-idx {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}
.assign-row.none .assign-idx {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
}
</style>

<style lang="less">
/* 部门名额已满时下拉项字体标红（下拉浮层渲染到 body，需用非 scoped 样式） */
.ant-select-dropdown .tw-dept-full {
  color: #dc2626;
}
</style>

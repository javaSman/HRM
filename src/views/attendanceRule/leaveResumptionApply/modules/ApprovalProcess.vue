<template>
  <!--
    ApprovalProcess.vue
    审批流程组件（动态节点列表）
    负责：加载流程节点 + 渲染节点列表 + 管理各节点选中的审批人
    暴露：validate() / getCustomProcessList() / loadProcessNodes() / reset()
  -->
  <div class="approval-process">
    <div v-if="loading" class="process-loading">
      <a-spin size="small" />
      <span class="loading-text">加载审批流程...</span>
    </div>

    <div v-else-if="processNodeList.length === 0" class="process-empty">
      <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" description="暂无审批节点" />
    </div>

    <div v-else class="approval-timeline">
      <div v-for="(node, nIndex) in processNodeList" :key="node.id || nIndex" class="timeline-node">
        <div class="timeline-dot"></div>
        <div class="timeline-card">
          <div class="timeline-card-title">
            {{ node.nodeName }}
            <a-tag v-if="node.approvalRule === '1' || node.approvalRule === 1" color="orange" class="node-rule-tag">会签</a-tag>
            <a-tag v-if="node.approvalRule === '2' || node.approvalRule === 2" color="red" class="node-rule-tag">或签</a-tag>
          </div>
          <div class="approver-line">
            <template v-if="nodeObjList[nIndex] && nodeObjList[nIndex].arr.length > 0">
              <a-tag v-for="item in nodeObjList[nIndex].arr" :key="item.id" class="approver-tag"
                :closable="canEditApprovers(node)"
                @close="handleEmployeeTagClose($event, nIndex, item.id)">
                <span class="approver-avatar">{{ getAvatarText(item.name) }}</span>
                <span class="approver-name">{{ item.name }}</span>
              </a-tag>
            </template>
            <span v-else-if="isKjSprTypeNode(node) && !canEditApprovers(node)" class="kj-spr-type-text">
              {{ node.chooseObjectsName }}
            </span>
            <!-- 空级审批节点（直属主管/直属经理/直属总监）：自选审批人 -->
            <j-select-approver v-if="isLeaderNode(node)" v-model="nodeObjList[nIndex].str"
              :kj-spr-type="getNodeKjSprType(node)" placeholder="请选择审批人" value-field="name" button-only
              :button-text="'自选审批人'" :button-icon="''" :button-type="'default'" :disabled="disabled"
              @change="(value, rows) => handleSelectValue(nIndex, value, rows)" />
            <j-select-employee v-else-if="hasSprScope(node)" v-model="nodeObjList[nIndex].str"
              :placeholder="isCcNode(node) ? '请选择抄送人' : '请选择审批人'" value-field="name" button-only
              :button-text="isCcNode(node) ? '添加抄送人' : '添加审批人'" :button-icon="''" :button-type="'default'"
              :disabled="disabled" @change="(value, rows) => handleSelectValue(nIndex, value, rows)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { getAction } from '@/api/manage'
import { Empty } from 'ant-design-vue'

export default {
  name: 'ApprovalProcess',
  props: {
    /** 申请模块编码（如：销假申请） */
    sqmkCode: {
      type: String,
      required: true
    },
    /** 部门 */
    dept: {
      type: String,
      default: ''
    },
    /** 工号 */
    no: {
      type: String,
      default: ''
    },
    /** 是否禁用 */
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    realDept() {
      return this.dept || (this.perInfo && this.perInfo.dept) || ''
    },
    realNo() {
      return this.no || (this.perInfo && this.perInfo.no) || ''
    }
  },
  data() {
    return {
      // 模板中 a-empty 的 :image 需要通过实例访问 Empty
      Empty,
      perInfo: Vue.ls.get('perInfo') || {},
      loading: false,
      /** 流程节点列表（后端返回） */
      processNodeList: [],
      /** 每个节点对应的审批人/抄送人数据（索引与 processNodeList 对应） */
      nodeObjList: []
    }
  },
  watch: {
    realDept: {
      immediate: false,
      handler() {
        this.loadProcessNodes()
      }
    }
  },
  methods: {
    /**
     * 判断节点是否为抄送节点
     * nodeProperties: 1=审批, 2=抄送
     */
    isCcNode(node) {
      return node && Number(node.nodeProperties) === 2
    },
    /**
     * 判断节点是否为 kjSprType 类型节点（users 为 null 时展示 chooseObjectsName）
     */
    isKjSprTypeNode(node) {
      if (!node) return false
      return node.users === null && node.chooseObjectsName
    },
    /**
     * 判断节点是否显示添加审批人按钮
     * isselfSelect 值为 1 或 sprScope 值为 4 时显示添加按钮
     */
    hasSprScope(node) {
      if (!node) return false
      return Number(node.isselfSelect) === 1 || Number(node.sprScope) === 4
    },
    /**
     * 判断节点是否为空级审批节点（直属主管/直属经理/直属总监，依据 kjSprType 判断）
     */
    isLeaderNode(node) {
      if (!node) return false
      const kjSprType = this.getNodeKjSprType(node)
      return kjSprType !== null && kjSprType !== undefined && kjSprType !== ''
    },
    /**
     * 获取节点的空级审批类型 kjSprType（优先取外层，兼容内层 customProcessNodeConfiguration）
     */
    getNodeKjSprType(node) {
      if (!node) return ''
      if (node.kjSprType != null && node.kjSprType !== '') return node.kjSprType
      const inner = node.customProcessNodeConfiguration
      return inner && inner.kjSprType != null && inner.kjSprType !== '' ? inner.kjSprType : ''
    },
    /**
     * 判断节点的审批人是否可编辑（可删除接口返回人员、可自选添加）
     */
    canEditApprovers(node) {
      return this.hasSprScope(node) || this.isLeaderNode(node)
    },
    /**
     * 从节点配置中提取默认人员列表（users / roles / departments 都合并显示）
     */
    extractDefaultPersons(node) {
      const list = []
      const addItems = (arr, idKey, nameKey) => {
        if (!Array.isArray(arr)) return
        arr.forEach(item => {
          const ids = (item[idKey] || '').toString().split(',').filter(Boolean)
          const names = (item[nameKey] || '').toString().split(',').filter(Boolean)
          ids.forEach((id, idx) => {
            list.push({
              id: id.trim(),
              name: (names[idx] || id).trim()
            })
          })
        })
      }
      addItems(node.users, 'chooseObjects', 'chooseObjectsName')
      addItems(node.roles, 'chooseObjects', 'chooseObjectsName')
      addItems(node.departments, 'chooseObjects', 'chooseObjectsName')
      // 空级审批节点（直属主管/直属经理/直属总监）：users 等数组为 null，
      // 后端解析出的人员在节点外层 chooseObjects/chooseObjectsName，可能是多人逗号分隔
      if (list.length === 0 && this.isLeaderNode(node)) {
        const ids = (node.chooseObjects || '')
          .toString()
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
        const names = (node.chooseObjectsName || '')
          .toString()
          .split(',')
          .map(s => s.trim())
        ids.forEach((id, idx) => {
          list.push({ id, name: names[idx] || id })
        })
      }
      // 去重
      const map = new Map()
      list.forEach(item => {
        if (!map.has(item.id)) map.set(item.id, item)
      })
      return Array.from(map.values())
    },
    /**
     * 获取头像文字（取最后一个汉字/字符）
     */
    getAvatarText(name) {
      if (!name) return '?'
      const trimmed = String(name).trim()
      return trimmed.charAt(trimmed.length - 1).toUpperCase()
    },
    /**
     * 加载流程节点列表
     */
    loadProcessNodes() {
      if (!this.realDept) {
        this.processNodeList = []
        this.nodeObjList = []
        return
      }
      this.loading = true
      getAction('/process/customProcessConfiguration/getLcjdList', {
        sqmkCode: this.sqmkCode,
        dept: this.realDept,
        no: this.realNo
      }).then(res => {
        if (res.success && Array.isArray(res.result)) {
          // 按 px 排序
          const list = res.result.slice().sort((a, b) => Number(a.px) - Number(b.px))
          this.processNodeList = list
          // 初始化每个节点的 obj
          this.nodeObjList = list.map(node => {
            const defaultPersons = this.extractDefaultPersons(node)
            return {
              arr: defaultPersons,
              str: defaultPersons.map(p => p.name).join(',')
            }
          })
        } else {
          this.processNodeList = []
          this.nodeObjList = []
          this.$message.warning(res.message || '没有匹配到审批模板')
        }
      }).catch(() => {
        this.processNodeList = []
        this.nodeObjList = []
      }).finally(() => {
        this.loading = false
      })
    },
    /**
     * 选择人员变化
     */
    handleSelectValue(index, value, rows) {
      if (this.nodeObjList[index]) {
        // 将新选择的人员追加到现有列表中，按 id 去重
        const existingArr = this.nodeObjList[index].arr || []
        const map = new Map()
        existingArr.forEach(item => map.set(item.id, item))
        rows.forEach(item => {
          if (!map.has(item.id)) {
            map.set(item.id, item)
          }
        })
        const mergedArr = Array.from(map.values())
        this.nodeObjList[index].arr = mergedArr
        this.nodeObjList[index].str = mergedArr.map(p => p.name).join(',')
      }
    },
    /**
     * 关闭审批人标签
     */
    handleEmployeeTagClose(event, index, id) {
      if (event && event.preventDefault) {
        event.preventDefault()
      }
      if (this.nodeObjList[index]) {
        this.nodeObjList[index].arr = this.nodeObjList[index].arr.filter(item => item.id != id)
        this.nodeObjList[index].str = this.nodeObjList[index].arr.map(item => item.name).join(',')
      }
    },
    /**
     * 校验所有需要选择审批人的节点是否都已选择
     * @returns {boolean} 是否全部通过校验
     */
    validate() {
      let allValid = true
      this.processNodeList.forEach((node, idx) => {
        if (this.canEditApprovers(node) && this.nodeObjList[idx] && this.nodeObjList[idx].arr.length === 0) {
          this.$message.warning(`请选择「${node.nodeName}」的${this.isCcNode(node) ? '抄送' : '审批'}人`)
          allValid = false
        }
      })
      return allValid
    },
    /**
     * 获取组装好的 customProcessConfigurationDTOList
     * 用于父组件提交时直接放入 model
     * @returns {Array} 处理后的节点数据列表
     */
    getCustomProcessList() {
      return this.processNodeList.map((node, idx) => {
        const nodeCopy = JSON.parse(JSON.stringify(node))
        // isselfSelect===1 / sprScope===4 / 空级审批节点：把选中的审批人写到节点外层
        if (this.canEditApprovers(node) && this.nodeObjList[idx]) {
          const selectedPersons = this.nodeObjList[idx].arr
          if (selectedPersons && selectedPersons.length > 0) {
            nodeCopy.chooseObjects = selectedPersons.map(p => p.id).join(',')
            nodeCopy.chooseObjectsName = selectedPersons.map(p => p.name).join(',')
            nodeCopy.sprScopeName = node.nodeName || ''
          }
        }
        return nodeCopy
      })
    },
    /**
     * 重置（清空节点列表）
     */
    reset() {
      this.processNodeList = []
      this.nodeObjList = []
    }
  }
}
</script>

<style scoped lang="less">
.approval-process {
  position: relative;
}

.process-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  gap: 8px;
}

.loading-text {
  color: #8c8c8c;
  font-size: 13px;
}

.process-empty {
  padding: 20px 0;
}

/* ===== 审批流程时间轴容器（滚动交由外层 .approval-scroll 统一处理） ===== */
.approval-timeline {
  position: relative;
  padding-left: 0;
  padding-right: 4px;
}

/* ===== 时间轴节点 ===== */
.timeline-node {
  position: relative;
  padding-left: 22px;
  padding-bottom: 16px;
}

.timeline-node:last-child {
  padding-bottom: 0;
}

.timeline-node:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 12px;
  bottom: -4px;
  width: 2px;
  background: #e6e8eb;
  border-radius: 1px;
}

.timeline-dot {
  position: absolute;
  left: 0;
  top: 12px;
  width: 12px;
  height: 12px;
  border: 2px solid #4a7bf7;
  background: #fff;
  border-radius: 50%;
  z-index: 1;
}

.timeline-card {
  background: #f0f4fb;
  border: 1px solid #e3e9f5;
  border-radius: 8px;
  padding: 12px 14px;
}

.timeline-card-title {
  margin-bottom: 10px;
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.timeline-card-title .node-rule-tag {
  margin: 0;
  font-size: 11px;
  line-height: 18px;
  height: 18px;
  padding: 0 6px;
}

.approver-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

/* 审批人 tag 样式 */
.approver-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 0 8px 0 4px;
  height: 28px;
  border: 1px solid #d6e0f5;
  border-radius: 14px;
  background: #fff;
  color: #1f2937;
  font-size: 13px;
  line-height: 26px;
}

.approver-tag /deep/ .anticon-close {
  color: #b3b8c2;
  margin-left: 0;
}

.approver-tag /deep/ .anticon-close:hover {
  color: #ff4d4f;
}

.approver-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #4a7bf7;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
}

.approver-name {
  color: #1f2937;
  font-size: 13px;
}

.kj-spr-type-text {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 14px;
  border: 1px solid #d6e0f5;
  border-radius: 14px;
  background: #fff;
  color: #1f2937;
  font-size: 13px;
  line-height: 26px;
}

/* 添加审批人按钮样式（覆盖 JSelectEmployee / JSelectApprover 默认） */
.approver-line /deep/ .j-select-employee-button-only,
.approver-line /deep/ .j-select-approver-button-only {
  display: inline-flex;
  width: auto;
  flex: none;
}

.approver-line /deep/ .j-select-employee-button-only .ant-btn,
.approver-line /deep/ .j-select-approver-button-only .ant-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 28px;
  padding: 0 12px;
  border: 1px dashed #4a7bf7;
  border-radius: 14px;
  background: #fff;
  color: #4a7bf7;
  font-size: 13px;
  font-weight: 400;
  line-height: 1;
  box-shadow: none;
}

.approver-line /deep/ .j-select-employee-button-only .ant-btn::before,
.approver-line /deep/ .j-select-approver-button-only .ant-btn::before {
  content: '+';
  display: inline-block;
  font-size: 14px;
  font-weight: 600;
  margin-right: 2px;
  line-height: 1;
  position: relative;
}

.approver-line /deep/ .j-select-employee-button-only .ant-btn:hover,
.approver-line /deep/ .j-select-employee-button-only .ant-btn:focus,
.approver-line /deep/ .j-select-approver-button-only .ant-btn:hover,
.approver-line /deep/ .j-select-approver-button-only .ant-btn:focus {
  border-color: #2d5fe0;
  color: #2d5fe0;
  background: #f5f8ff;
}
</style>

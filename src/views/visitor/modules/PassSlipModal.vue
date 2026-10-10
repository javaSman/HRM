<template>
  <a-modal
    :title="title"
    :width="880"
    :visible="visible"
    :confirmLoading="confirmLoading"
    centered
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="取消"
    okText="确认"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <!-- 基本信息 - 每行三个 -->
        <div class="section-title">放行信息</div>
        <a-row :gutter="14" type>
          <a-col :span="8">
            <a-form-item label="放行人" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input
                placeholder="请输入放行人"
                v-decorator="['fxr', { rules: [{ required: true, message: '请输入放行人' }] }]"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="所属公司" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input
                placeholder="请输入所属公司"
                v-decorator="['ssgs', { rules: [{ required: true, message: '请输入所属公司' }] }]"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="车牌号" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input placeholder="请输入车牌号" v-decorator="['cph']" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="手机号码" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input
                placeholder="请输入手机号码"
                v-decorator="[
                  'sjhf',
                  {
                    rules: [
                      { required: true, message: '请输入手机号码' },
                      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' },
                    ],
                  },
                ]"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="放行日期" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-date
                v-decorator="['fxrq', { rules: [{ required: true, message: '请选择放行日期' }] }]"
                dateFormat="YYYY-MM-DD"
                placeholder="请选择"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="放行区域" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-dict-select-tag
                type="list"
                v-decorator="['fxqr', { rules: [{ required: true, message: '请选择放行区域' }] }]"
                dictCode="hrm_fkzx_sq_lfqy"
                placeholder="请选择放行区域"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item
              label="备注说明"
              style="display: flex"
              :labelCol="{ style: { flex: '0 0 calc((100% - 28px) / 9)' } }"
              :wrapperCol="{ style: { flex: '1 1 auto' } }"
            >
              <a-textarea placeholder="请输入备注说明" v-decorator="['bzsm']" :autoSize="{ minRows: 3 }" />
            </a-form-item>
          </a-col>
        </a-row>

        <!-- 物品表格 - 完整一行 -->
        <div class="section-title">物品信息</div>
        <div class="goods-block">
          <a-button class="goods-add-btn" @click="addGoodsRow"> <a-icon type="plus" />添加数据 </a-button>
          <div class="goods-table-wrap">
            <table class="goods-table">
              <thead>
                <tr>
                  <th style="width: 80px; text-align: center">序号</th>
                  <th>物品名称</th>
                  <th style="width: 250px">数量</th>
                  <th style="width: 80px; text-align: center">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="goodsRows.length === 0" class="empty-row">
                  <td colspan="4">暂无数据</td>
                </tr>
                <tr v-for="(row, idx) in goodsRows" :key="idx">
                  <td style="text-align: center">{{ idx + 1 }}</td>
                  <td><a-input v-model="row.name" placeholder="请输入物品名称" /></td>
                  <td><a-input v-model="row.qty" type="number" placeholder="数量" /></td>
                  <td style="text-align: center">
                    <a-button type="link" class="goods-row-del" @click="removeGoodsRow(idx)">删除</a-button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 物品图片上传 -->
        <div class="section-title">物品图片</div>
        <div class="upload-block">
          <j-upload v-model="model.wptp" text="选择图片" :returnUrl="true" fileType="image" />
          <div class="upload-tip">支持上传多张图片</div>
        </div>

        <!-- 审批流程 -->
        <div class="section-title">审批流程</div>
        <div class="approval-timeline">
          <div v-for="(node, nIndex) in processNodeList" :key="node.id || nIndex" class="timeline-node">
            <div class="timeline-dot"></div>
            <div class="timeline-card">
              <div class="timeline-card-title">
                {{ node.nodeName }}
                <a-tag v-if="node.approvalRule === '1' || node.approvalRule === 1" color="orange" class="node-rule-tag">会签</a-tag>
                <a-tag v-if="node.approvalRule === '2' || node.approvalRule === 2" color="red" class="node-rule-tag">或签</a-tag>
              </div>
              <div class="approver-line">
                <!-- 已选人员 tag 列表 -->
                <template v-if="nodeObjList[nIndex] && nodeObjList[nIndex].arr.length > 0">
                  <a-tag
                    v-for="item in nodeObjList[nIndex].arr"
                    :key="item.id"
                    class="approver-tag"
                    :closable="canEditApprovers(node)"
                    @close="handleEmployeeTagClose($event, nIndex, item.id)">
                    <span class="approver-avatar">{{ getAvatarText(item.name) }}</span>
                    <span class="approver-name">{{ item.name }}</span>
                  </a-tag>
                </template>
                <!-- 空级审批类型（如"直属经理"） -->
                <span v-else-if="isKjSprTypeNode(node) && !canEditApprovers(node)" class="kj-spr-type-text">
                  {{ node.chooseObjectsName }}
                </span>
                <!-- 空级审批节点（直属主管/经理/总监）：独立的自选审批人组件 -->
                <j-select-approver
                  v-if="isLeaderNode(node)"
                  v-model="nodeObjList[nIndex].str"
                  :kj-spr-type="getNodeKjSprType(node)"
                  placeholder="请选择审批人"
                  value-field="name"
                  button-only
                  button-text="自选审批人"
                  :button-icon="''"
                  :button-type="'default'"
                  @change="(value, rows) => handleSelectValue(nIndex, value, rows)" />
                <!-- 添加审批人/抄送人按钮 -->
                <j-select-employee
                  v-else-if="hasSprScope(node)"
                  v-model="nodeObjList[nIndex].str"
                  :placeholder="isCcNode(node) ? '请选择抄送人' : '请选择审批人'"
                  value-field="name"
                  button-only
                  :button-text="isCcNode(node) ? '添加抄送人' : '添加审批人'"
                  :button-icon="''"
                  :button-type="'default'"
                  @change="(value, rows) => handleSelectValue(nIndex, value, rows)" />
              </div>
            </div>
          </div>
          <div v-if="!processNodeList.length && !processNodesLoading" class="sqgl-empty-hint">
            暂无审批流程配置
          </div>
        </div>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import { getAction, postAction } from '@/api/manage'
import Vue from 'vue'

export default {
  name: 'PassSlipModal',
  data() {
    return {
      title: '',
      visible: false,
      confirmLoading: false,
      form: this.$form.createForm(this),
      labelCol: { xs: { span: 24 }, sm: { span: 8 } },
      wrapperCol: { xs: { span: 24 }, sm: { span: 16 } },
      model: {
        wptp: '',
        zt: 0,
        dept: '',
        empNo: '',
      },
      modelDefault: {},
      goodsRows: [],
      // 流程节点列表（后端返回）
      processNodeList: [],
      // 每个节点对应的审批人/抄送人数据
      nodeObjList: [],
      processNodesLoading: false,
      // 申请模块编码
      sqmkCode: '放行条申请',
      // 接口地址
      url: {
        getLcjdList: '/process/customProcessConfiguration/getLcjdList',
      },
    }
  },
  computed: {},
  created() {
    this.modelDefault = JSON.parse(JSON.stringify(this.model))
  },
  methods: {
    add() {
      this.edit({})
      // 从本地缓存获取 perInfo，初始化部门和工号（用于加载流程节点）
      const perInfo = Vue.ls.get('perInfo') || {}
      this.model.dept = perInfo.dept || ''
      this.model.empNo = perInfo.no || ''
      // 重置流程节点
      this.processNodeList = []
      this.nodeObjList = []
      // 如果已有部门信息，先加载一次流程节点
      if (this.model.dept) {
        this.loadProcessNodes()
      }
    },
    edit(record) {
      this.model = Object.assign({}, this.modelDefault, record)
      this.visible = true
      this.goodsRows = []
      // 重置流程节点
      this.processNodeList = []
      this.nodeObjList = []
      this.$nextTick(() => {
        this.form.setFieldsValue(this.model)
      })
    },
    addGoodsRow() {
      this.goodsRows.push({ name: '', qty: '' })
    },
    removeGoodsRow(idx) {
      this.goodsRows.splice(idx, 1)
    },
    /** 判断节点是否为抄送节点（nodeProperties: 1=审批, 2=抄送） */
    isCcNode(node) {
      return node && Number(node.nodeProperties) === 2
    },
    /** 判断节点是否为 kjSprType 类型节点（users 为 null 时展示 chooseObjectsName） */
    isKjSprTypeNode(node) {
      if (!node) return false
      return node.users === null && node.chooseObjectsName
    },
    /** 判断节点是否显示添加审批人按钮（isselfSelect===1 或 sprScope===4） */
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
    /** 从节点配置中提取默认人员（users/roles/departments 合并去重） */
    extractDefaultPersons(node) {
      const list = []
      const addItems = (arr, idKey, nameKey) => {
        if (!Array.isArray(arr)) return
        arr.forEach(item => {
          const ids = (item[idKey] || '').toString().split(',').filter(Boolean)
          const names = (item[nameKey] || '').toString().split(',').filter(Boolean)
          ids.forEach((id, idx) => {
            list.push({ id: id.trim(), name: (names[idx] || id).trim() })
          })
        })
      }
      addItems(node.users, 'chooseObjects', 'chooseObjectsName')
      addItems(node.roles, 'chooseObjects', 'chooseObjectsName')
      addItems(node.departments, 'chooseObjects', 'chooseObjectsName')
      // 空级审批节点（直属主管/直属经理/直属总监）：后端解析出的人员在节点外层 chooseObjects/chooseObjectsName，可能多人逗号分隔
      if (list.length === 0 && this.isLeaderNode(node)) {
        const ids = (node.chooseObjects || '').toString().split(',').map(s => s.trim()).filter(Boolean)
        const names = (node.chooseObjectsName || '').toString().split(',').map(s => s.trim())
        ids.forEach((id, idx) => {
          list.push({ id, name: names[idx] || id })
        })
      }
      // 去重
      const map = new Map()
      list.forEach(item => { if (!map.has(item.id)) map.set(item.id, item) })
      return Array.from(map.values())
    },
    /** 加载流程节点列表 */
    loadProcessNodes() {
      const dept = this.model.dept || ''
      if (!dept) {
        this.processNodeList = []
        this.nodeObjList = []
        return
      }
      this.processNodesLoading = true
      getAction(this.url.getLcjdList, {
        sqmkCode: this.sqmkCode,
        dept: dept,
        no: this.model.empNo || ''
      }).then(res => {
        if (res.success && Array.isArray(res.result)) {
          // 按 px 升序排列
          const list = res.result.slice().sort((a, b) => Number(a.px) - Number(b.px))
          this.processNodeList = list
          // 初始化每个节点的已选人员（提取默认人员）
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
        this.processNodesLoading = false
      })
    },
    /** 选择审批人/抄送人（追加合并，不覆盖默认人员） */
    handleSelectValue(index, value, rows) {
      if (this.nodeObjList[index]) {
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
    /** 移除审批人/抄送人 tag */
    handleEmployeeTagClose(event, index, id) {
      if (event && event.preventDefault) {
        event.preventDefault()
      }
      if (this.nodeObjList[index]) {
        this.nodeObjList[index].arr = this.nodeObjList[index].arr.filter(item => item.id != id)
        this.nodeObjList[index].str = this.nodeObjList[index].arr.map(item => item.name).join(',')
      }
    },
    /** 头像文字（取最后一个字） */
    getAvatarText(name) {
      if (!name) return '?'
      const trimmed = String(name).trim()
      return trimmed.charAt(trimmed.length - 1).toUpperCase()
    },
    /** 组装流程节点数据，用于提交 */
    buildProcessDTOList() {
      if (!this.processNodeList || !this.processNodeList.length) return null
      return this.processNodeList.map((node, idx) => {
        const nodeCopy = JSON.parse(JSON.stringify(node))
        // 对于需要自选的节点，将选中的审批人写到节点外层
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
    handleOk() {
      var that = this
      this.form.validateFields((err, values) => {
        if (err) return
        // 校验物品至少一行
        if (that.goodsRows.length === 0) {
          that.$message.warning('请至少添加一条物品数据')
          return
        }
        // var hasEmpty = that.goodsRows.some(function (r) {
        //   return !r.name || !r.qty
        // })
        // if (hasEmpty) {
        //   that.$message.warning('请填写完整的物品名称和数量')
        //   return
        // }
        // 校验每个需要选择审批人的节点是否选择了人员
        let allValid = true
        that.processNodeList.forEach((node, idx) => {
          if (that.canEditApprovers(node) && that.nodeObjList[idx] && that.nodeObjList[idx].arr.length === 0) {
            that.$message.warning(`请选择「${node.nodeName}」的${that.isCcNode(node) ? '抄送' : '审批'}人`)
            allValid = false
          }
        })
        if (!allValid) return

        that.confirmLoading = true
        var formData = Object.assign({}, values)
        // 状态（model.zt未通过v-decorator注册到表单，需手动带入）
        formData.zt = that.model.zt
        // 物品信息子表
        formData.wpxxList = that.goodsRows.map(function (r) {
          return { wpmc: r.name, wpsl: r.qty }
        })
        // 图片（j-upload-list 绑定 model.wptp）
        formData.wptp = that.model.wptp || ''
        // 动态流程节点数据
        var customProcessConfigurationDTOList = that.buildProcessDTOList()
        if (customProcessConfigurationDTOList && customProcessConfigurationDTOList.length > 0) {
          formData.customProcessConfigurationDTOList = customProcessConfigurationDTOList
        }
        const info = this.$store.state.user.info || {}
        postAction('/fkzx/hrmFxtsqxx/add', {
          ...formData,
          fxrq: formData.fxrq + ' 00:00:00',
          jsr: info.realname || '',
          no: that.model.empNo || info.workNo || '',
        })
          .then(function (res) {
            if (res.success) {
              that.$message.success('申请已提交')
              that.visible = false
              that.$emit('ok')
            } else {
              that.$message.warning(res.message || '提交失败')
            }
          })
          .catch(function () {
            that.$message.error('提交失败')
          })
          .finally(function () {
            that.confirmLoading = false
          })
      })
    },
    handleCancel() {
      this.visible = false
      this.goodsRows = []
      this.processNodeList = []
      this.nodeObjList = []
    },
  },
}
</script>

<style lang="less" scoped>
@import '../visitor-theme.less';
/deep/ .ant-modal-body {
  max-height: 700px;
  overflow-y: auto;
}
.section-title {
  font-size: 12px;
  font-weight: 600;
  color: rgba(@v-primary-rgb, 0.7);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: '';
    width: 3px;
    height: 12px;
    background: @v-gradient-blue;
    border-radius: 2px;
  }
}

// 物品区块
.goods-block {
  border: 1px dashed @v-border;
  border-radius: 10px;
  padding: 14px 16px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.goods-table-wrap {
  border: 1px solid @v-border;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.goods-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  thead th {
    background: #f1f5f9;
    color: @v-muted-foreground;
    font-weight: 600;
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid @v-border;
    font-size: 12.5px;
    white-space: nowrap;
  }

  tbody td {
    padding: 8px 12px;
    color: @v-foreground;
    border-top: 1px solid @v-border;
    vertical-align: middle;
  }

  tbody tr.empty-row td {
    color: @v-muted-foreground;
    text-align: center;
    padding: 34px 12px;
    font-size: 13px;
  }
}

.goods-row-del {
  color: @v-destructive;
  &:hover {
    color: darken(@v-destructive, 10%);
  }
}

.goods-add-btn {
  width: 120px;
}

// 上传区块
.upload-block {
  position: relative;
  border: 1px dashed @v-border;
  border-radius: 10px;
  background: #fafbfd;
  padding: 14px 16px;
  margin-bottom: 10px;

  .upload-tip {
    font-size: 12px;
    color: @v-muted-foreground;
    margin-top: 8px;
  }
}

/* ===== 审批流程时间轴 ===== */
.approval-timeline {
  position: relative;
  padding-left: 0;
  max-height: 360px;
  overflow-y: auto;
  padding-right: 4px;
  margin-bottom: 16px;
}
.approval-timeline::-webkit-scrollbar {
  width: 6px;
}
.approval-timeline::-webkit-scrollbar-thumb {
  background: #c7d0e4;
  border-radius: 3px;
}
.approval-timeline::-webkit-scrollbar-track {
  background: transparent;
}
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
  font-weight: 500;
}
.approver-line {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
}
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
.sqgl-empty-hint {
  text-align: center;
  color: #94a3b8;
  font-size: 12.5px;
  padding: 20px 0;
  background: #f8fafc;
  border: 1px dashed #e2e8f0;
  border-radius: 8px;
}
</style>


<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail" layout="vertical">
        <!-- 基本信息区域（灰色背景，只读） -->
        <div class="transfer-info-header">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">工号：</span>
              <span class="info-value">{{ model.gh || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">姓名：</span>
              <span class="info-value">{{ model.xm || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">原公司：</span>
              <span class="info-value">{{ model.ygs || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">原所属部门：</span>
              <span class="info-value">{{ model.yssbm || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">原岗位名称：</span>
              <span class="info-value">{{ model.ygwmc || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">原职级名称：</span>
              <span class="info-value">{{ model.yzjmc || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="transfer-form-content">
          <!-- 调动人员选择 + 调动类型（合并到同一行） -->
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-model-item label="调动人员" prop="ddry">
                <j-select-employee
                  v-model="model.ddry"
                  placeholder="请选择调动人员"
                  :multiple="false"
                  valueField="id"
                  buttonText="选择人员"
                  @change="handleEmployeeChange"
                />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="调动类型" prop="ddlx">
                <a-radio-group v-model="model.ddlx" @change="handleTransferTypeChange">
                  <a-radio value="调岗">调岗</a-radio>
                  <a-radio value="晋升">晋升</a-radio>
                  <a-radio value="降职">降职</a-radio>
                </a-radio-group>
              </a-form-model-item>
            </a-col>
          </a-row>

          <!-- 调岗专属字段（两列布局） -->
          <div v-show="model.ddlx === '调岗'">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-model-item label="调动后公司" prop="hcompanyId">
                  <a-select
                    v-model="model.hcompanyId"
                    placeholder="请选择公司"
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    @change="handleCompanyChange"
                  >
                    <a-select-option v-for="item in companyList" :key="item.id" :value="item.id">
                      {{ item.name }}
                    </a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
              <a-col :span="12">
                <a-form-model-item label="调动后部门" prop="hdept">
                  <a-cascader
                    v-model="ddhbmPath"
                    :options="deptOptions"
                    :fieldNames="{ label: 'name', value: 'id', children: 'children' }"
                    :disabled="!model.hcompanyId"
                    changeOnSelect
                    :show-search="{ filter: filterDeptOption }"
                    placeholder="请选择部门"
                    @change="handleDeptChange"
                  />
                </a-form-model-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-model-item label="调动后岗位" prop="hpostId">
                  <a-select
                    v-model="model.hpostId"
                    placeholder="请选择岗位"
                    allowClear
                    :disabled="!model.hdept"
                    :loading="postLoading"
                    @change="handlePostChange"
                  >
                    <a-select-option v-for="item in postOptions" :key="item.value" :value="item.value">
                      {{ item.label }}
                    </a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
              <a-col :span="12">
                <a-form-model-item label="调动生效时间" prop="ddsxsj">
                  <a-date-picker
                    v-model="model.ddsxsj"
                    placeholder="请选择日期"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                  />
                </a-form-model-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-model-item label="调动后职级" prop="hpostRank">
                  <a-select v-model="model.hpostRank" placeholder="请选择职级" allowClear>
                    <a-select-option v-for="item in levelOptions" :key="item.value" :value="item.value">
                      {{ item.label }}
                    </a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
              <a-col :span="12">
                <a-form-model-item label="调动原因" prop="ddyy">
                  <a-textarea v-model="model.ddyy" placeholder="请输入调动原因" :rows="2" />
                </a-form-model-item>
              </a-col>
            </a-row>
          </div>

          <!-- 晋升/降职专属字段 -->
          <div v-show="model.ddlx === '晋升' || model.ddlx === '降职'">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-model-item label="调动后职级" prop="hpostRank">
                  <a-select v-model="model.hpostRank" placeholder="请选择职级" allowClear>
                    <a-select-option v-for="item in levelOptions" :key="item.value" :value="item.value">
                      {{ item.label }}
                    </a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
              <a-col :span="12">
                <a-form-model-item label="调动生效时间" prop="ddsxsj">
                  <a-date-picker
                    v-model="model.ddsxsj"
                    placeholder="请选择日期"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                  />
                </a-form-model-item>
              </a-col>
            </a-row>
            <a-form-model-item label="调动原因">
              <a-textarea v-model="model.ddyy" placeholder="请输入调动原因" :rows="2" />
            </a-form-model-item>
          </div>

          <!-- 审批流程 -->
          <div class="sqgl-sec-title" style="margin-top: 18px">审批流程</div>
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
                    {{ node.kjSprType_dictText }}
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
        </div>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>
import { httpAction, getAction } from '@/api/manage'
import { validateDuplicateValue } from '@/utils/util'
import Vue from 'vue'

function findPathById(list, id, parentPath, parentNamePath) {
  const path = parentPath || []
  const namePath = parentNamePath || []
  for (let i = 0; i < (list || []).length; i++) {
    const item = list[i]
    const nextPath = path.concat(String(item.id))
    const nextNamePath = namePath.concat(item.name || '')
    if (String(item.id) === String(id)) return { path: nextPath, namePath: nextNamePath, item }
    const child = findPathById(item.children || [], id, nextPath, nextNamePath)
    if (child) return child
  }
  return null
}

export default {
  name: 'HrmTdglForm',
  props: {
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  data() {
    return {
      model: {
        gh: '',
        xm: '',
        ygs: '',
        yssbm: '',
        ygwmc: '',
        yzjmc: '',
        ddlx: '调岗',
        hcompanyId: '',
        hdept: '',
        hpostId: '',
        hpostRank: '',
        ddyy: '',
        ddsxsj: null,
        ddry: '',
        zt: '审批中',
      },
      // 流程节点相关
      processNodeList: [],
      nodeObjList: [],
      processNodesLoading: false,
      sqmkCode: '调动申请',
      currentUserDept: '',
      currentUserNo: '',
      ddhbmPath: [], // 部门级联路径（用于 a-cascader）
      confirmLoading: false,
      validatorRules: {
        ddry: [{ required: true, message: '请选择调动人员', trigger: 'change' }],
        ddlx: [{ required: true, message: '请选择调动类型', trigger: 'change' }],
        ddsxsj: [{ required: true, message: '请选择调动生效时间', trigger: 'change' }],
        hcompanyId: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (this.model.ddlx === '调岗' && !value) {
                callback(new Error('请选择调动后公司'))
              } else {
                callback()
              }
            },
            trigger: 'change',
          },
        ],
        hdept: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (this.model.ddlx === '调岗' && !value) {
                callback(new Error('请选择调动后部门'))
              } else {
                callback()
              }
            },
            trigger: 'change',
          },
        ],
        hpostId: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (this.model.ddlx === '调岗' && !value) {
                callback(new Error('请选择调动后岗位'))
              } else {
                callback()
              }
            },
            trigger: 'change',
          },
        ],
        // hpostRank: [
        //   {
        //     required: true,
        //     validator: (rule, value, callback) => {
        //       if (this.model.ddlx === '调岗' && !value) {
        //         callback(new Error('请选择调动后职级'))
        //       } else if ((this.model.ddlx === '晋升' || this.model.ddlx === '降职') && !value) {
        //         callback(new Error('请选择调动后职级'))
        //       } else {
        //         callback()
        //       }
        //     },
        //     trigger: 'change',
        //   },
        // ],
        ddyy: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error('请输入调动原因'))
              } else {
                callback()
              }
            },
            trigger: 'blur',
          },
        ],
      },
      deptOptions: [],
      postOptions: [],
      levelOptions: [],
      postRows: [], // 存储岗位完整数据（包含 hrJobLevels）
      companyList: [],
      deptLoading: false,
      postLoading: false,
      url: {
        add: '/ryManage/hrmTdgl/add',
        edit: '/ryManage/hrmTdgl/edit',
        queryById: '/ryManage/hrmTdgl/queryById',
        employeeInfo: '/hrEmployee/hrEmployee/queryById',
        orgTree: '/org/hrmOrg/loadTreeRoot',
        postByDept: '/hrJobSequence/hrJobSequence/getChildSequences',
        getLcjdList: '/process/customProcessConfiguration/getLcjdList',
      },
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
  },
  created() {
    this.modelDefault = JSON.parse(JSON.stringify(this.model))
    this.loadOptions()
  },
  methods: {
    add() {
      this.edit(this.modelDefault)
    },
    edit(record) {
      this.model = Object.assign({}, record)
      this.visible = true
      // 重置流程节点
      this.processNodeList = []
      this.nodeObjList = []

      // 加载组织架构后恢复级联选择器状态
      if (this.companyList.length === 0) {
        this.loadOrgTree().then(() => {
          if (this.model.hcompanyId || this.model.hdept) {
            this.restoreLinkedOptions()
          }
        })
      } else {
        if (this.model.hcompanyId || this.model.hdept) {
          this.restoreLinkedOptions()
        }
      }
      // 加载流程节点
      // - 编辑模式：用记录里的原部门和工号
      // - 新建模式：用当前登录用户的部门和工号
      const dept = this.model.ydept || ''
      const no = this.model.gh || ''
      if (dept && no) {
        this.$nextTick(() => {
          this.loadProcessNodes()
        })
      } else {
        const perInfo = Vue.ls.get('perInfo') || {}
        if (perInfo.dept || perInfo.no) {
          // 缓存当前用户的部门和工号用于匹配流程（不写回 model，避免和调动人员混淆）
          this.currentUserDept = perInfo.dept || ''
          this.currentUserNo = perInfo.no || ''
          this.$nextTick(() => {
            this.loadProcessNodes(true)
          })
        }
      }
    },
    submitForm() {
      const that = this
      // 调试：打印提交前的 model 数据
      console.log('提交前 model 数据:', JSON.parse(JSON.stringify(this.model)))
      console.log('ycompanyId:', this.model.ycompanyId, 'ydept:', this.model.ydept)
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (!that.model.gh) {
            that.$message.warning('请选择调动人员')
            return
          }
          // 验证审批流程节点
          let allValid = true
          this.processNodeList.forEach((node, idx) => {
            if (this.canEditApprovers(node) && this.nodeObjList[idx] && this.nodeObjList[idx].arr.length === 0) {
              this.$message.warning(`请选择「${node.nodeName}」的${this.isCcNode(node) ? '抄送' : '审批'}人`)
              allValid = false
            }
          })
          if (!allValid) return

          // 根据调动类型验证必填字段
          if (that.model.ddlx === '调岗') {
            if (!that.model.hdept) {
              that.$message.warning('请选择调动后部门')
              return
            }
            // if (!that.model.hpostRank) {
            //   that.$message.warning('请选择调动后职级')
            //   return
            // }
          }
          // if ((that.model.ddlx === '晋升' || that.model.ddlx === '降职') && !that.model.hpostRank) {
          //   that.$message.warning('请选择调动后职级')
          //   return
          // }
          // 所有调动类型都必填调动原因
          if (!that.model.ddyy) {
            that.$message.warning('请输入调动原因')
            return
          }

          that.confirmLoading = true
          let httpurl = ''
          let method = ''
          if (!this.model.id) {
            httpurl += this.url.add
            method = 'post'
          } else {
            httpurl += this.url.edit
            method = 'put'
          }
          // 如果是晋升或降职，自动将调动后的公司、部门、岗位设置为原值
          if (this.model.ddlx === '晋升' || this.model.ddlx === '降职') {
            this.model.hcompanyId = this.model.ycompanyId
            this.model.hdept = this.model.ydept
            this.model.hpostId = this.model.ypostId
          }
          // 组装动态流程节点数据
           const perInfo = Vue.ls.get('perInfo') || {}
          const submitData = Object.assign({}, this.model, {
            fqr: this.$store.state.user.info.username,
            createByNo: perInfo.no
          })
          const processDTOList = this.buildProcessDTOList()
          if (processDTOList && processDTOList.length > 0) {
            submitData.customProcessConfigurationDTOList = processDTOList
          }
          httpAction(
            httpurl,
            submitData,
            method
          )
            .then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                that.$emit('ok')
              } else {
                that.$message.warning(res.message)
              }
            })
            .finally(() => {
              that.confirmLoading = false
            })
        }
      })
    },
    // 调动人员变化
    handleEmployeeChange(value, rows) {
      if (rows && rows.length > 0) {
        const employee = rows[0]
        console.log('选择人员 - employee对象:', employee)
        console.log('选择人员 - companyId:', employee.companyId, 'dept:', employee.dept)
        this.model.gh = employee.no || ''
        this.model.xm = employee.name || ''
        this.model.ddry = employee.name
        this.model.ygs = employee.companyId_dictText
        this.model.yssbm = employee.dept_dictText
        this.model.ygwmc = employee.postId_dictText
        this.model.ycompanyId = employee.companyId
        this.model.ydept = employee.dept
        console.log('设置后 model.ycompanyId:', this.model.ycompanyId, 'model.ydept:', this.model.ydept)
        this.model.ypostId = employee.postId
        this.model.ypostRank = employee.postRank
        this.model.yzjmc = employee.postRank_dictText
        // this.loadEmployeeInfo(employee.id)
      } else {
        this.model.gh = ''
        this.model.xm = ''
        this.model.ygs = ''
        this.model.yssbm = ''
        this.model.ygwmc = ''
        this.model.yzjmc = ''
      }
    },
    /** 判断节点是否为抄送节点（nodeProperties: 1=审批, 2=抄送） */
    isCcNode(node) {
      return node && Number(node.nodeProperties) === 2
    },
    /** 判断节点是否为 kjSprType 类型节点（users 为 null 时展示 kjSprType_dictText） */
    isKjSprTypeNode(node) {
      if (!node) return false
      return node.users === null && node.kjSprType_dictText
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
    /**
     * 加载流程节点列表
     * @param {Boolean} useCurrentUser - 是否使用当前登录用户信息（新建模式，未选调动人员时）
     */
    loadProcessNodes(useCurrentUser = false) {
      let dept, no
      if (useCurrentUser) {
        dept = this.currentUserDept
        no = this.currentUserNo
      } else {
        dept = this.model.ydept || this.model.dept || ''
        no = this.model.gh || ''
      }
      if (!dept) {
        this.processNodeList = []
        this.nodeObjList = []
        return
      }
      this.processNodesLoading = true
      getAction(this.url.getLcjdList, {
        sqmkCode: this.sqmkCode,
        dept: dept,
        no: no || ''
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
    // 加载员工基本信息
    loadEmployeeInfo(employeeId) {
      getAction(this.url.employeeInfo, { id: employeeId })
        .then((res) => {
          if (res.success && res.result) {
            const data = res.result
            this.model.ygs = data.gs || data.orgCode_dictText || ''
            this.model.yssbm = data.ssbm || data.departName || ''
            this.model.ygwmc = data.gwmc || data.postName || ''
            this.model.yzjmc = data.zjmc || ''
          }
        })
        .catch((err) => {
          console.error('加载员工信息失败:', err)
        })
    },
    // 调动类型变化
    handleTransferTypeChange(e) {
      const transferType = e.target ? e.target.value : e

      // 清空相关字段
      this.model.hcompanyId = ''
      this.model.hdept = ''
      this.model.hpostId = ''
      this.model.hpostRank = ''
      this.ddhbmPath = []
      this.deptOptions = []
      this.postOptions = []
      this.levelOptions = []

      // 如果是晋升或降职，且有原岗位ID，则加载原岗位的职级选项
      if ((transferType === '晋升' || transferType === '降职') && this.model.ypostId) {
        this.loadLevelOptionsByPost(this.model.ydept, this.model.ypostId)
      }
    },
    // 公司变化（联动部门）
    handleCompanyChange(companyId) {
      const company = this.companyList.find((item) => String(item.id) === String(companyId))
      this.deptOptions = company ? [company] : []
      this.ddhbmPath = []
      this.model.hdept = ''
      this.model.hpostId = ''
      this.model.hpostRank = ''
      this.postOptions = []
      this.levelOptions = []
    },
    // 部门变化（级联）
    handleDeptChange(value) {
      const path = Array.isArray(value) ? value.map((item) => String(item)) : []
      this.ddhbmPath = path
      this.model.hdept = path[path.length - 1] || ''

      // 清空下级选项
      this.model.hpostId = ''
      this.model.hpostRank = ''
      this.postOptions = []
      this.levelOptions = []

      // 加载岗位选项
      if (this.model.hdept) {
        this.loadPostOptions(this.model.hdept)
      }
    },
    // 部门搜索过滤
    filterDeptOption(inputValue, path) {
      const keyword = String(inputValue || '').toLowerCase()
      return (path || []).some(
        (option) =>
          String(option.name || '')
            .toLowerCase()
            .indexOf(keyword) > -1
      )
    },
    // 加载选项
    loadOptions() {
      this.loadOrgTree()
    },
    // 加载组织架构树
    loadOrgTree() {
      return getAction(this.url.orgTree, { pid: 0 })
        .then((res) => {
          if (res.success && res.result && res.result.length > 0) {
            const root = res.result[0]
            this.companyList = root.children || []
          }
        })
        .catch((err) => {
          console.error('加载组织架构失败:', err)
        })
    },
    // 恢复联动选项（编辑时使用）
    restoreLinkedOptions() {
      this.deptOptions = []
      this.postOptions = []
      this.levelOptions = []
      this.ddhbmPath = []

      // 如果有公司ID，设置部门选项
      if (this.model.hcompanyId) {
        const company = this.companyList.find((item) => String(item.id) === String(this.model.hcompanyId))
        this.deptOptions = company ? [company] : []
      }

      // 如果有部门ID，查找路径
      if (this.model.hdept && this.deptOptions.length > 0) {
        const matchedDept = findPathById(this.deptOptions, this.model.hdept)
        if (matchedDept && matchedDept.path.length) {
          this.ddhbmPath = matchedDept.path
        }
      }

      // 加载岗位选项
      if (this.model.hdept) {
        return this.loadPostOptions(this.model.hdept, true)
      }

      return Promise.resolve()
    },
    // 加载岗位选项（根据部门）
    loadPostOptions(deptId, restoring = false) {
      if (!deptId) {
        this.postOptions = []
        this.postRows = []
        this.levelOptions = []
        return Promise.resolve()
      }

      this.postLoading = true
      const currentPostId = this.model.hpostId

      return getAction(this.url.postByDept, {
        deptId,
        column: 'createTime',
        order: 'desc',
        pageNo: 1,
        pageSize: 99999,
      })
        .then((res) => {
          const rows = Array.isArray(res) ? res : (res && res.result) || []
          console.log('岗位接口返回数据:', rows) // 调试：查看接口返回的完整数据
          this.postRows = rows // 保存完整数据供职级联动
          this.postOptions = rows.map((item) => ({
            label: item.postName,
            value: item.id,
          }))

          // 如果是编辑恢复，加载当前岗位的职级选项
          if (restoring && currentPostId) {
            const post = rows.find((item) => String(item.id) === String(currentPostId))
            this.levelOptions = ((post && post.hrJobLevels) || []).map((item) => ({
              label: item.levelName,
              value: item.id,
            }))
          }
        })
        .catch((err) => {
          console.error('加载岗位选项失败:', err)
          this.postOptions = []
          this.postRows = []
        })
        .finally(() => {
          this.postLoading = false
        })
    },
    // 岗位变化（级联职级）
    handlePostChange(postId) {
      const post = this.postRows.find((item) => String(item.id) === String(postId))
      console.log('岗位数据:', post) // 调试：查看岗位数据结构
      console.log('职级数据:', post && post.hrJobLevels) // 调试：查看职级数据
      this.levelOptions = ((post && post.hrJobLevels) || []).map((item) => ({
        label: item.levelName,
        value: item.id,
      }))
      console.log('职级选项:', this.levelOptions) // 调试：查看转换后的选项
      this.model.hpostRank = '' // 清空已选职级
    },
    // 根据部门ID和岗位ID加载职级选项（用于晋升/降职场景）
    loadLevelOptionsByPost(deptId, postId) {
      if (!deptId || !postId) {
        this.levelOptions = []
        return Promise.resolve()
      }

      this.postLoading = true
      return getAction(this.url.postByDept, {
        deptId,
        column: 'createTime',
        order: 'desc',
        pageNo: 1,
        pageSize: 99999,
      })
        .then((res) => {
          const rows = Array.isArray(res) ? res : (res && res.result) || []
          console.log('加载原岗位职级 - 原部门:', deptId, '原岗位:', postId)
          console.log('岗位列表数据:', rows)

          // 找到当前岗位
          const post = rows.find((item) => String(item.id) === String(postId))
          console.log('匹配到的岗位:', post)

          if (post && post.hrJobLevels) {
            this.levelOptions = post.hrJobLevels.map((item) => ({
              label: item.levelName,
              value: item.id,
            }))
            console.log('原岗位职级选项:', this.levelOptions)
          } else {
            this.levelOptions = []
            console.warn('未找到原岗位的职级信息')
          }
        })
        .catch((err) => {
          console.error('加载原岗位职级失败:', err)
          this.levelOptions = []
        })
        .finally(() => {
          this.postLoading = false
        })
    },
  },
}
</script>

<style scoped lang="less">
.transfer-info-header {
  background: #f5f7fa;
  padding: 12px 20px;
  margin-bottom: 12px;
  border-radius: 4px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px 40px;
  font-size: 13px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-label {
  color: #666;
  min-width: 90px;
  flex-shrink: 0;
}

.info-value {
  color: #333;
}

.transfer-form-content {
  padding: 0;
}

.sqgl-sec-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid #4a7bf7;
  line-height: 1;
}

/* ===== 审批流程时间轴 ===== */
.approval-timeline {
  position: relative;
  padding-left: 0;
  max-height: 360px;
  overflow-y: auto;
  padding-right: 4px;
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
  align-items: center;
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

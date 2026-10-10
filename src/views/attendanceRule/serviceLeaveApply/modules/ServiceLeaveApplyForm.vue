<template>
  <!--
    ServiceLeaveApplyForm.vue
    工龄年假申请（社会年限认定）表单组件
    左右两栏布局：左栏=申请信息+认定信息+附件+备注，右栏=审批流程/审批意见/流程时间轴
    模式：新增申请 / 重新提交 / 审批 / 详情
  -->
  <a-spin :spinning="confirmLoading">
    <j-form-container>
      <a-form-model
        ref="form"
        slot="detail"
        layout="vertical"
        :model="model"
        :rules="validatorRules"
        class="service-leave-form"
      >
        <a-row :gutter="24" class="leave-form-row">
          <!-- ===== 左侧：申请信息 ===== -->
          <a-col :xs="24" :sm="12" class="form-col-left">
            <!-- 状态行（详情/审批只读模式显示，颜色以原型 node-tag 为准） -->
            <div class="form-section-title">
              <span>申请信息</span>
            </div>

            <a-row :gutter="16">
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="公司">
                  <a-input
                    :value="model.companyId_dictText || perInfo.companyId_dictText || ''"
                    disabled
                    placeholder="自动获取"
                  />
                </a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="所属部门">
                  <a-input
                    :value="model.dept_dictText || perInfo.dept_dictText || ''"
                    disabled
                    placeholder="自动获取"
                  />
                </a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="工号">
                  <a-input v-model="model.no" disabled placeholder="自动获取" />
                </a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="姓名">
                  <a-input v-model="model.name" disabled placeholder="自动获取" />
                </a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="入职日期">
                  <a-input :value="model.entryDate || perInfo.entryDate || ''" disabled placeholder="自动获取" />
                </a-form-model-item>
              </a-col>
              <!-- 新增/重新提交：社会年限由申请人填报；工作年限暂不展示 -->
              <a-col v-if="!formDisabled" :xs="24" :sm="12">
                <a-form-model-item label="社会年限" prop="shnx" :required="true">
                  <j-dict-select-tag
                    v-model="model.shnx"
                    dictCode="shnx"
                    :disabled="formDisabled"
                    placeholder="请选择"
                    style="width: 100%"
                  />
                </a-form-model-item>
                <!-- 工作年限暂不展示，后续需要时取消注释
                <a-col :xs="24" :sm="12">
                  <a-form-model-item label="工作年限">
                    <a-input :value="workYearsText" disabled placeholder="自动获取" />
                  </a-form-model-item>
                </a-col>
                -->
              </a-col>
              <!-- 只读（详情/审批）：申请时间（跨两列） -->
              <a-col v-if="formDisabled" :xs="24" :sm="12">
                <a-form-model-item label="申请时间">
                  <a-input :value="model.createTime || ''" disabled placeholder="-" />
                </a-form-model-item>
              </a-col>
            </a-row>

            <!-- 只读（详情/审批）：认定信息 -->
            <template v-if="formDisabled">
              <div class="form-section-title form-section-title-sub">
                <span>认定信息</span>
              </div>
              <a-row :gutter="16">
                <a-col :xs="24" :sm="12">
                  <a-form-model-item label="社会年限">
                    <a-input :value="shnxText" disabled style="color: #4a7bf7; font-weight: 500" placeholder="-" />
                  </a-form-model-item>
                </a-col>
                <!-- 工作年限暂不展示，后续需要时取消注释（恢复后三项各占 8 栅格）
                <a-col :xs="24" :sm="8">
                  <a-form-model-item label="工作年限">
                    <a-input :value="workYearsText" disabled placeholder="-" />
                  </a-form-model-item>
                </a-col>
                -->
                <!-- <a-col :xs="24" :sm="12">
                  <a-form-model-item label="累计年限">
                    <a-input :value="ljnxText" disabled placeholder="-" />
                  </a-form-model-item>
                </a-col> -->
              </a-row>
            </template>

            <!-- 附件材料（社保缴纳证明） -->
            <a-row :gutter="16">
              <a-col :xs="24" :sm="24">
                <a-form-model-item label="附件材料（社保缴纳证明）" prop="attachmentUrls" :required="!formDisabled">
                  <JUploadList v-model="model.attachmentUrls" :disabled="formDisabled" :buttonVisible="!formDisabled" />
                </a-form-model-item>
              </a-col>
            </a-row>

            <!-- 备注说明 -->
            <a-row :gutter="16">
              <a-col :xs="24" :sm="24">
                <a-form-model-item label="备注说明">
                  <a-textarea
                    v-model="model.remark"
                    :disabled="formDisabled"
                    placeholder="请输入备注说明（选填）"
                    :autoSize="{ minRows: 3, maxRows: 5 }"
                  />
                </a-form-model-item>
              </a-col>
            </a-row>
          </a-col>

          <!-- ===== 右侧：新增=审批流程，重新提交=上一轮时间轴+审批流程，详情=流程时间轴 ===== -->
          <a-col v-if="!OK_show" :xs="24" :sm="12" class="form-col-right">
            <div class="form-section-title">
              <span>审批流程</span>
            </div>

            <div class="approval-scroll">
            <!-- 重新提交：先展示上一轮审批流程时间轴（含退回原因），数据直接取当前轮次节点 customProcessSqdSpjdList -->
            <div v-if="isResubmit" class="resubmit-timeline">
              <!-- <div class="resubmit-timeline-title">上一轮审批记录</div> -->
              <approval-timeline
                :key="'resubmit-' + model.id + '-' + detailNonce"
                :applyId="model.id"
                :LCdata="model"
              />
              <!-- <div class="resubmit-process-title">本轮审批流程</div> -->
            </div>

            <approval-process
              v-if="!formDisabled"
              ref="approvalProcess"
              sqmkCode="工龄年假申请"
              :dept="model.dept || (perInfo && perInfo.dept) || ''"
              :no="perInfo.no || ''"
              :disabled="formDisabled"
            />
            <div v-else>
              <!-- 审批流程时间轴（详情模式）：直接传 model（customProcessSqdSpjdList 节点内嵌套 customProcessSqdSpjdRecord 由时间轴组件兼容）；
                   key 带 nonce，保证同一单据重复打开详情时时间轴随 model 重建刷新 -->
              <approval-timeline :key="model.id + '-' + detailNonce" :applyId="model.id" :LCdata="model" />
            </div>
            </div>
          </a-col>

          <!-- ===== 右侧：审批模式=审批意见 ===== -->
          <a-col v-if="OK_show" :xs="24" :sm="12" class="form-col-right">
            <div class="form-section-title">
              <span>审批意见</span>
            </div>

            <a-row :gutter="16">
              <a-col :span="24">
                <a-form-model-item label="审批意见" prop="bz">
                  <a-textarea
                    v-model="spdata.bz"
                    placeholder="请输入审批意见（选填）"
                    :autoSize="{ minRows: 3, maxRows: 5 }"
                  />
                </a-form-model-item>
              </a-col>
            </a-row>
          </a-col>
        </a-row>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>
import Vue from 'vue'
// 新版时间轴：每条审批记录一张卡片，支持退回/撤回状态及节点内嵌套 customProcessSqdSpjdRecord
import ApprovalTimeline from '../../leave/modules/ApprovalTimeline'
import ApprovalProcess from '../../leaveResumptionApply/modules/ApprovalProcess'
import { httpAction } from '@/api/manage'
import { ajaxGetDictItems, getDictItemsFromCache } from '@/api/api'

export default {
  name: 'ServiceLeaveApplyForm',
  components: {
    ApprovalTimeline,
    ApprovalProcess,
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
    title: {
      type: String,
      default: '',
      required: false,
    },
    OK_show: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  data() {
    return {
      confirmLoading: false,

      // 审批附加数据
      spdata: {
        bz: '',
        spr: '',
        spResult: 'approved',
      },
      perInfo: {},
      model: {},
      // 社会年限字典项（字典编码 shnx，只读详情回显用）
      shnxDictOptions: [],
      // 详情时间轴重建计数（每次 edit 递增，配合 timeline 的 key 使用）
      detailNonce: 0,

      validatorRules: {
        shnx: [{ required: true, message: '请选择社会年限', trigger: 'change' }],
        attachmentUrls: [
          {
            validator: (rule, value, callback) => {
              // 只读模式（详情/审批）不校验
              if (this.formDisabled) {
                callback()
                return
              }
              const hasFile = Array.isArray(value) ? value.length > 0 : !!(value && String(value).trim())
              if (hasFile) {
                callback()
              } else {
                callback(new Error('请上传社保缴纳证明附件'))
              }
            },
            trigger: 'change',
          },
        ],
      },
      url: {
        // 提交申请（4.1）
        add: '/hr_kq_glnjsq/hrKqGlnjsq/add',
        // 重新提交（4.7，仅 spStatus=4 已退回单据，POST）
        resubmit: '/hr_kq_glnjsq/hrKqGlnjsq/resubmit',
      },
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
    /**
     * 是否重新提交模式（已退回单据再次提交：可编辑 + 非审批 + 单据已存在 id）
     */
    isResubmit() {
      return !this.formDisabled && !this.OK_show && !!this.model.id
    },
    /**
     * 社会年限展示文案（实体字段 shnx，取字典 shnx 文本；字典未命中时按“N年”兜底）
     */
    shnxText() {
      const shnx = this.model.shnx
      if (shnx === null || shnx === undefined || shnx === '') {
        return '-'
      }
      const dictItem = this.shnxDictOptions.find((item) => String(item.value) === String(shnx))
      return dictItem ? dictItem.text || dictItem.label : `${shnx}年`
    },
    /**
     * 工作年限展示文案（公司内工龄 workYears，自动带出，提交时带给后端算 ljnx）
     */
    workYearsText() {
      if (this.model.workYears !== null && this.model.workYears !== undefined && this.model.workYears !== '') {
        return `${this.model.workYears}年`
      }
      return this.perInfo.workYears !== null && this.perInfo.workYears !== undefined && this.perInfo.workYears !== ''
        ? `${this.perInfo.workYears}年`
        : '-'
    },
    /**
     * 累计年限文案（ljnx 后端自动计算 = workYears + shnx，前端只读展示）
     */
    ljnxText() {
      return this.model.ljnx !== null && this.model.ljnx !== undefined && this.model.ljnx !== ''
        ? `${this.model.ljnx}年`
        : '-'
    },
    /**
     * 状态标签文案
     * spStatus: 1=审批中 2=已通过 3=已撤回 4=已退回
     */
    statusText() {
      const map = {
        1: '审批中',
        2: '已通过',
        3: '已撤回',
        4: '已退回',
      }
      return map[this.model.spStatus] || '-'
    },
    /**
     * 状态标签颜色（与列表页 node-tag 保持一致）
     */
    statusColor() {
      const map = {
        1: '#fa8c16',
        2: '#55c42a',
        3: '#0082fc',
        4: '#f5222d',
      }
      return map[this.model.spStatus] || '#fa8c16'
    },
  },
  created() {
    this.modelDefault = JSON.parse(JSON.stringify(this.model))
    // 加载社会年限字典（shnx），只读详情回显字典文本
    this.loadShnxDictOptions()
  },
  methods: {
    /** 加载社会年限字典项（优先读字典缓存，与 JDictSelectTag 逻辑一致） */
    loadShnxDictOptions() {
      const cached = getDictItemsFromCache('shnx')
      if (cached) {
        this.shnxDictOptions = cached
        return
      }
      ajaxGetDictItems('shnx', null).then((res) => {
        if (res.success) {
          this.shnxDictOptions = res.result || []
        }
      })
    },
    add() {
      this.edit(this.modelDefault)
    },
    edit(record) {
      this.model = Object.assign({}, record)
      // 每次打开详情都递增，强制重建审批时间轴（同单据重复打开也能刷新）
      this.detailNonce++

      // 非审批模式重置审批数据
      if (!this.OK_show) {
        this.spdata = { bz: '', spr: '', spResult: 'approved' }
      }

      this.perInfo = Vue.ls.get('perInfo') || {}
      if (!this.model.id) {
        // 新增：自动带出当前登录人员信息（员工基础信息表 hrEmployeeInformation）
        this.model['name'] = this.perInfo.name
        this.model['no'] = this.perInfo.no
        this.model['companyId'] = this.perInfo.companyId
        this.model['dept'] = this.perInfo.dept
        this.model['employeeId'] = this.perInfo.id
        this.model['entryDate'] = this.perInfo.entryDate || ''
        // 工作年限（公司内工龄）自动带出，后端据此 + shnx 计算 ljnx
        this.model['workYears'] = this.perInfo.workYears !== undefined ? this.perInfo.workYears : ''
      }

      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
        // 加载动态流程节点（由 ApprovalProcess 组件内部 watch dept 自动触发）
        if (!this.formDisabled && this.$refs.approvalProcess) {
          this.$refs.approvalProcess.reset()
          this.$nextTick(() => {
            this.$refs.approvalProcess.loadProcessNodes()
          })
        }
      })
    },
    /**
     * 入职年限校验：需入职满1年后才可申请（如25年2月5号入职，26年2月5号起可申请）
     * 入职日期取 model.entryDate（新增时由 perInfo 自动带出），格式 yyyy-MM-dd
     * @returns {boolean} true=可申请 false=未满1年
     */
    checkEntryDateEligible() {
      const entryDate = this.model.entryDate || (this.perInfo && this.perInfo.entryDate) || ''
      if (!entryDate) {
        // 入职日期缺失时不在前端拦截，交由后端校验
        return true
      }
      // 兼容 yyyy-MM-dd / yyyy-MM-dd HH:mm:ss
      const parts = String(entryDate).trim().split(/[-/]/)
      if (parts.length < 3) return true
      const entryYear = parseInt(parts[0], 10)
      const entryMonth = parseInt(parts[1], 10)
      const entryDay = parseInt(parts[2], 10)
      if (!entryYear || !entryMonth || !entryDay) return true

      // 满1年的可申请日期（入职日期的次年同月同日）
      const eligibleDate = new Date(entryYear + 1, entryMonth - 1, entryDay)
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      if (today.getTime() < eligibleDate.getTime()) {
        this.$message.warning('未到申请时间')
        return false
      }
      return true
    },
    submitForm() {
      const that = this
      this.$refs.form.validate((valid) => {
        if (valid) {
          // 申请人提交（新增/重新提交）：需入职满1年后才可申请（如25年2月5号入职，26年2月5号起可申请）
          // 申请人提交（新增/重新提交，审批模式 OK_show、只读模式 formDisabled 均不校验）
          if (!this.OK_show && !this.formDisabled && !this.checkEntryDateEligible()) {
            return
          }
          // 校验审批节点
          if (!this.OK_show && !this.formDisabled && this.$refs.approvalProcess) {
            if (!this.$refs.approvalProcess.validate()) {
              return
            }
          }

          this.$emit('submit', true)
          let httpurl = ''
          let method = ''
          if (!this.model.id) {
            // 4.1 提交申请
            httpurl = this.url.add
            method = 'post'
          } else {
            // 4.7 重新提交（仅 spStatus=4 已退回单据；body 为含 id 和最新节点配置的完整单据）
            httpurl = this.url.resubmit
            method = 'post'
          }

          // 组装 customProcessConfigurationDTOList
          if (!this.OK_show && !this.formDisabled && this.$refs.approvalProcess) {
            this.model['customProcessConfigurationDTOList'] = this.$refs.approvalProcess.getCustomProcessList()
          }

          httpAction(httpurl, this.model, method)
            .then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                that.$emit('ok')
              } else {
                that.$message.warning(res.message)
              }
            })
            .finally(() => {
              this.$emit('submit', false)
            })
        }
      })
    },
  },
}
</script>

<style scoped lang="less">
/* 表单根：j-form-container 的 fieldset 不是 flex 容器，以 height:100% 承接其
   确定高度，再由自身向下建立 flex 列 */
.service-leave-form {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* ===== 全局表单项紧致 ===== */
.service-leave-form /deep/ .ant-form-item {
  margin-bottom: 12px;
}

.service-leave-form /deep/ .ant-form-item-label {
  padding-bottom: 4px;
  line-height: 20px;
}

.service-leave-form /deep/ .ant-form-item-label > label {
  color: #555;
  font-size: 13px;
}

.service-leave-form /deep/ .ant-form-item-required::before {
  color: #ff4d4f;
  font-size: 14px;
  margin-right: 2px;
}

/* ===== 状态行（详情/审批） ===== */
.status-line {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 14px;
  background: #f8f9fb;
  border-radius: 8px;
}

.status-label {
  color: #555;
  font-size: 13px;
}

/* ===== 当前节点/状态标签（原型 node-tag 实心圆角样式） ===== */
.seniority-node-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  color: #ffffff;
  white-space: nowrap;
}

/* ===== 左右两栏布局 =====
   桌面端 nowrap：wrap 会使 flex 行给子列的拉伸高度变为“不确定”，
   右列滚动区无法收敛高度而按内容撑高、不能滚动；移动端在下面改回 wrap */
.leave-form-row {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-wrap: nowrap;
}

.form-col-left {
  border-right: 1px dashed #e6e8eb;
  padding-right: 24px;
  min-height: 0;
  overflow-y: auto;
}

.form-col-right {
  padding-left: 8px;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .leave-form-row {
    flex-wrap: wrap;
  }

  .form-col-left {
    border-right: 0;
    padding-right: 0;
    margin-bottom: 16px;
  }

  .form-col-right {
    padding-left: 0;
  }
}

/* ===== 区块标题 ===== */
.form-section-title {
  flex-shrink: 0;
  position: relative;
  margin: 0 0 16px;
  padding: 0 0 10px;
  border-bottom: 1px solid #e6e8eb;
  color: #1f2937;
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
}

.form-section-title-sub {
  margin-top: 4px;
  font-size: 14px;
}

/* ===== 审批流程内部滚动区（flex 填满右列剩余高度） ===== */
.approval-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.approval-scroll::-webkit-scrollbar {
  width: 6px;
}

.approval-scroll::-webkit-scrollbar-thumb {
  background: #c7d0e4;
  border-radius: 3px;
}

.approval-scroll::-webkit-scrollbar-track {
  background: transparent;
}

/* ===== 重新提交：上一轮审批记录时间轴 ===== */
.resubmit-timeline {
  margin-bottom: 16px;
}

.resubmit-timeline-title {
  position: relative;
  margin: 0 0 10px;
  padding-left: 8px;
  color: #f5222d;
  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
}

.resubmit-timeline-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 2px;
  width: 3px;
  height: 14px;
  border-radius: 2px;
  background: #f5222d;
}

.resubmit-process-title {
  margin: 14px 0 10px;
  padding-top: 12px;
  border-top: 1px dashed #e6e8eb;
  color: #555;
  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
}
</style>

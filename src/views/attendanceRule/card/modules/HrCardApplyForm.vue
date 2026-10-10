<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container>
      <a-form-model ref="form" slot="detail" layout="vertical" :model="model" :rules="validatorRules"
        class="overtime-apply-form">
        <a-row :gutter="24" class="overtime-form-row">
          <!-- ===== 左侧：申请信息 ===== -->
          <a-col :xs="24" :sm="12" class="form-col-left">
            <div class="form-section-title">
              <span>申请信息</span>
            </div>

            <a-row :gutter="16">
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="姓名">
                  <a-input v-model="model.name" disabled placeholder="自动获取" />
                </a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="工号">
                  <a-input v-model="model.no" disabled placeholder="自动获取" />
                </a-form-model-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="公司">
                  <a-input :value="model.companyId_dictText || perInfo.companyId_dictText || ''" disabled placeholder="自动获取" />
                </a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="部门">
                  <a-input :value="model.dept_dictText || perInfo.dept_dictText || ''" disabled placeholder="自动获取" />
                </a-form-model-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="异常类型" prop="ycType">
                  <j-dict-select-tag v-model="model.ycType" :disabled="formDisabled" dictCode="ycDkstatus" allowClear
                    placeholder="请选择规则名称" class="rule-filter-select" @change="handleYcTypeChange" />
                </a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="异常时间段" prop="hrYckqYgId">
                  <a-select v-model="model.hrYckqYgId" :disabled="formDisabled" style="width: 100%"
                    placeholder="请选择异常时间段" show-search :filter-option="filterOption" @change="handleDbkTimeChange">
                    <a-select-option v-for="item in dbkTimeOptions" :key="item.id">
                      {{ item.label }}
                    </a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="补卡时间" prop="bkTime">
                  <j-date placeholder="请选择补卡时间" :disabled="formDisabled" v-model="model.bkTime"
                    :show-time="!isAbsentSelected"
                    :date-format="isAbsentSelected ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'" />
                </a-form-model-item>
              </a-col>
            </a-row>

            <!-- <a-row :gutter="16">
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="申请日期" prop="applyDate" :required="true">
                  <j-date placeholder="请选择申请日期" :disabled="formDisabled" v-model="model.applyDate" style="width: 100%"
                    dateFormat="YYYY-MM-DD" />
                </a-form-model-item>
              </a-col>
            </a-row> -->

            <a-row :gutter="16">
              <a-col :span="24">
                <a-form-model-item label="补卡原因" prop="reason">
                  <a-textarea v-model="model.reason" :disabled="formDisabled" placeholder="请输入补卡原因"
                    :auto-size="{ minRows: 3, maxRows: 5 }" />
                </a-form-model-item>
              </a-col>
              <a-col :span="24">
                <a-form-model-item label="附件">
                  <JUploadList v-model="model.attachmentUrls" :disabled="formDisabled" :buttonVisible="!formDisabled" />
                </a-form-model-item>
              </a-col>
            </a-row>
          </a-col>

          <!-- ===== 右侧：审批流程 ===== -->
          <a-col v-if="!OK_show" :xs="24" :sm="12" class="form-col-right">
            <div class="form-section-title">
              <span>审批流程</span>
            </div>

            <div class="approval-timeline" v-if="title != '详情'">
              <!-- 动态审批节点（新增/编辑模式） -->
              <div v-for="(node, nIndex) in processNodeList" :key="node.id || nIndex" class="timeline-node">
                <div class="timeline-dot"></div>
                <div class="timeline-card">
                  <div class="timeline-card-title">
                    {{ node.nodeName }}
                    <a-tag v-if="node.approvalRule === '1' || node.approvalRule === 1" color="orange"
                      class="node-rule-tag">会签</a-tag>
                    <a-tag v-if="node.approvalRule === '2' || node.approvalRule === 2" color="red"
                      class="node-rule-tag">或签</a-tag>
                  </div>
                  <div class="approver-line">
                    <template v-if="nodeObjList[nIndex] && nodeObjList[nIndex].arr.length > 0">
                      <a-tag v-for="item in nodeObjList[nIndex].arr" :key="item.id" class="approver-tag" :closable="canEditApprovers(node)"
                        @close="handleEmployeeTagClose($event, nIndex, item.id)">
                        <span class="approver-avatar">{{ getAvatarText(item.name) }}</span>
                        <span class="approver-name">{{ item.name }}</span>
                      </a-tag>
                    </template>
                    <span v-else-if="isKjSprTypeNode(node) && !canEditApprovers(node)" class="kj-spr-type-text">
                      {{ node.chooseObjectsName }}
                    </span>
                    <j-select-approver v-if="isLeaderNode(node)" v-model="nodeObjList[nIndex].str"
                      :kj-spr-type="getNodeKjSprType(node)" placeholder="请选择审批人" value-field="name" button-only
                      :button-text="'自选审批人'" :button-icon="''" :button-type="'default'"
                      :disabled="formDisabled" @change="(value, rows) => handleSelectValue(nIndex, value, rows)" />
                    <j-select-employee v-else-if="hasSprScope(node)" v-model="nodeObjList[nIndex].str"
                      :placeholder="isCcNode(node) ? '请选择抄送人' : '请选择审批人'" value-field="name" button-only
                      :button-text="isCcNode(node) ? '添加抄送人' : '添加审批人'" :button-icon="''" :button-type="'default'"
                      :disabled="formDisabled" @change="(value, rows) => handleSelectValue(nIndex, value, rows)" />
                  </div>
                </div>
              </div>
            </div>
            <div v-else>
              <!-- 审批流程时间轴（详情模式） -->
              <approval-timeline :applyId="model.id" :LCdata="model" />
            </div>
          </a-col>

          <a-col v-if="OK_show" :xs="24" :sm="12" class="form-col-right">

            <div class="form-section-title">
              <span>审批意见</span>
            </div>

            <a-row :gutter="16">
              <a-col :span="24">
                <a-form-model-item label="审批意见" prop="reason" :required="true">
                  <a-textarea v-model="spdata.bz" placeholder="请输入审批意见" :auto-size="{ minRows: 3, maxRows: 5 }" />
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
import ApprovalTimeline from './ApprovalTimeline'
import { httpAction, getAction } from '@/api/manage'

import moment from 'moment'

export default {
  name: 'HrCardApplyForm',
  components: {
    ApprovalTimeline
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
      required: false
    },
    title: {
      type: String,
      default: '',
      required: false
    },
    OK_show: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  data() {
    return {
      confirmLoading: false,

      // 审批附加数据
      spdata: {
        bz: '',
        spr: ''
      },
      perInfo: {},
      model: {},

      // 流程节点列表（后端返回）
      processNodeList: [],
      // 每个节点对应的审批人/抄送人数据（索引与 processNodeList 对应）
      nodeObjList: [],
      dbkTimeOptions: [],

      validatorRules: {
        companyId: [{ required: true, message: '请输入公司', trigger: 'blur' }],
        no: [{ required: true, message: '请输入工号', trigger: 'blur' }],
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        ycType: [{ required: true, message: '请选择异常类型', trigger: 'change' }],
        hrYckqYgId: [{ required: true, message: '请选择异常时间段', trigger: 'change' }],
        bkTime: [{ required: true, message: '请选择补卡时间', trigger: 'change' }],
        applyDate: [{ required: true, message: '请选择申请日期', trigger: 'change' }],
        reason: [{ required: true, message: '请输入补卡原因', trigger: 'blur' }],
      },
      url: {
        add: '/hr_bksq/hrBksq/add',
        edit: '/hr_bksq/hrBksq/edit',
        queryById: '/hr_bksq/hrBksq/queryById',
        // 流程节点配置接口
        getLcjdList: '/process/customProcessConfiguration/getLcjdList'
      }
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
    // 当前是否旷工（ABSENT）：旷工补卡时间只到日期。
    // 新增时按所选异常时间段判断；编辑/详情回显时下拉值是复合 id 匹配不上选项，按异常类型判断
    isAbsentSelected() {
      if (String(this.model.ycType) === 'ABSENT') return true
      const selected = this.dbkTimeOptions.find(item => item.id === this.model.hrYckqYgId)
      return !!(selected && selected.attendanceStatus === 'ABSENT')
    },
  },
  created() {
    this.modelDefault = JSON.parse(JSON.stringify(this.model))
  },
  methods: {
    /**
     * 下拉筛选
     */
    filterOption(input, option) {
      return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
    },
    handleYcTypeChange() {
      // 切换异常类型后清空已选异常时间段/补卡时间，按新类型重新拉取异常记录
      this.model.hrYckqYgId = ''
      this.model.bkTime = ''
      const queryNo = this.model.id ? this.model.no : (this.perInfo && this.perInfo.no) || ''
      this.getYClist(queryNo, this.model.ycType || '')
    },
    handleDbkTimeChange(id) {
      let item = this.dbkTimeOptions.filter(item => item.id == id)
      const selected = item[0]
      // this.model['bkTime']=item[0].value
      this.model['hrYckqYgId'] = id
      if (selected && selected.attendanceStatus === 'ABSENT' && selected.skrq) {
        // 旷工（ABSENT）：当天无打卡记录，补卡时间只取异常日期(skrq)
        this.model['bkTime'] = selected.skrq
      } else if (selected && String(selected.clockValue).indexOf('缺') !== -1 && selected.skrq && selected.qkTime) {
        // 缺卡（MISSING）：补卡时间回显为 刷卡日期(skrq) + 缺卡时间(qkTime)
        this.model['bkTime'] = `${selected.skrq} ${this.normalizeQkTime(selected.qkTime)}`
      } else {
        // 改为迟到/早退等其他异常时，清除自动带出的补卡时间，重新手选
        this.model['bkTime'] = ''
      }
      console.log(this.model)
      this.$forceUpdate()
    },
    /**
     * 将缺卡时间补全为 HH:mm:ss（接口返回的 qkTime 可能只有 HH:mm，如 17:50 -> 17:50:00）
     */
    normalizeQkTime(time) {
      const parts = String(time).split(':')
      while (parts.length < 3) {
        parts.push('00')
      }
      return parts.slice(0, 3).map(part => part.padStart(2, '0')).join(':')
    },
    getYClist(no, attendanceStatus) {
      const begin = moment().startOf('month').format('YYYY-MM-DD')
      const end = moment().endOf('month').format('YYYY-MM-DD')
      const queryNo = no || (this.perInfo && this.perInfo.no) || ''
      // 新增刚进入时异常类型未选，attendanceStatus 传空字符串（不带筛选）；选择异常类型后传 ycType
      const queryUrl = `/hr_bksq/hrBksq/myYckqList?pageSize=60&no=${queryNo}&attendanceStatus=${attendanceStatus || ''}`
      httpAction(queryUrl, {}, 'get').then(res => {
        if (res.success) {
          // result 直接是数组；兼容分页对象 { records: [] } 的形式
          const result = res.result
          const records = Array.isArray(result) ? result : (result && result.records) || []
          // this.dbkTimeOptions = res.result.records || []
          const options = []
          // 后端关联查询可能返回重复的考勤记录，同一 record+时段 会生成相同的选项 id，
          // 按 id 去重，避免下拉出现重复选项及 Duplicate keys 警告
          const existingIds = new Set()
          const addOption = (opt) => {
            if (existingIds.has(opt.id)) return
            existingIds.add(opt.id)
            options.push(opt)
          }

          // 打卡字段映射
          const clockFields = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
          const clockLabels = ['打卡1', '打卡2', '打卡3', '打卡4', '打卡5', '打卡6', '打卡7', '打卡8', '打卡9', '打卡10']

          // 异常关键字
          const abnormalKeywords = ['迟', '早', '缺', '旷']

          // 后端对缺卡记录按「缺卡时段」拆成多行返回：同一 record.id 会出现多条，
          // 每行的 qkTime 只对应一个缺卡时段，而 bz 中仍列出当天全部异常时段。
          // 先按 record.id 分组，逐行匹配时段，避免把第一行的 qkTime 错配到其他时段
          const recordGroups = new Map()
          records.forEach(record => {
            if (!recordGroups.has(record.id)) recordGroups.set(record.id, [])
            recordGroups.get(record.id).push(record)
          })
          // 打卡字段对应的排班时段名（前四个标准时段）
          const slotNames = ['上午上班', '上午下班', '下午上班', '下午下班']
          const toMinutes = (time) => {
            const parts = String(time).split(':')
            return Number(parts[0]) * 60 + Number(parts[1] || 0)
          }

          recordGroups.forEach(group => {
            const record = group[0]
            const skrq = record.skrq // 刷卡日期
            // one~ten 存的是纯打卡时间（缺卡时段为 null），异常说明在 bz/statusRemark 中按「;」分隔
            const bzText = String(record.statusRemark || record.bz || '')
            const bzSegs = bzText.split(/[;；]/)

            // 1）旷工（整天无打卡记录）：按整天异常生成一个选项
            if (record.attendanceStatus === 'ABSENT' || bzText.includes('当日无打卡记录')) {
              addOption({
                label: `${skrq} 旷工`,
                value: "day:'旷工'",
                id: `${record.id}-day:'旷工'`,
                skrq,
                qkTime: null,
                clockIndex: null,
                clockField: 'day',
                clockValue: '旷工',
                recordId: record.id,
                attendanceStatus: record.attendanceStatus
              })
              return
            }

            // 2）缺卡（MISSING）：后端每个缺卡时段一条记录，该行 qkTime 即该时段的缺卡时间
            const missingRows = group.filter(row => row.qkTime != null && row.qkTime !== '')
            if (record.attendanceStatus === 'MISSING' && missingRows.length > 0) {
              // 解析 bz 中各时段的排班阈值（如「下午上班：排班阈值13:31」），用于把 qkTime 对应到具体打卡时段
              const slotThresholds = bzSegs.map(seg => {
                const slotIndex = slotNames.findIndex(name => seg.includes(name))
                if (slotIndex === -1) return null
                const matched = seg.match(/(\d{1,2}):(\d{2})/)
                if (!matched) return null
                return { slotIndex, minutes: Number(matched[1]) * 60 + Number(matched[2]) }
              }).filter(Boolean)

              const usedSlots = new Set()
              missingRows.forEach(row => {
                const qkMinutes = toMinutes(row.qkTime)
                // 优先就近匹配 bz 中的排班阈值（观测 qkTime 与阈值相差 1 分钟，容差 5 分钟）
                let slotIndex = -1
                let bestDiff = Infinity
                slotThresholds.forEach(item => {
                  if (usedSlots.has(item.slotIndex)) return
                  const diff = Math.abs(item.minutes - qkMinutes)
                  if (diff <= 5 && diff < bestDiff) {
                    bestDiff = diff
                    slotIndex = item.slotIndex
                  }
                })
                // bz 未列出的缺卡时段（后端拆出的行数多于 bz 段落，如当天最后一段缺卡）：
                // 优先分配给 bz 未覆盖的空打卡位，再退而取任意剩余空打卡位
                if (slotIndex === -1) {
                  slotIndex = clockFields.findIndex((field, idx) =>
                    !usedSlots.has(idx) && record[field] == null &&
                    !slotThresholds.some(item => item.slotIndex === idx))
                }
                if (slotIndex === -1) {
                  slotIndex = clockFields.findIndex((field, idx) =>
                    !usedSlots.has(idx) && record[field] == null)
                }
                if (slotIndex === -1) return

                usedSlots.add(slotIndex)
                const field = clockFields[slotIndex]
                const value = `${field}:'缺'`
                addOption({
                  label: `${skrq} ${clockLabels[slotIndex]} 缺卡`,
                  value,
                  id: `${record.id}-${value}`,
                  skrq,
                  qkTime: row.qkTime,
                  clockIndex: slotIndex + 1,
                  clockField: field,
                  clockValue: '缺',
                  recordId: record.id,
                  attendanceStatus: record.attendanceStatus
                })
              })
              return
            }

            // 3）迟到/早退等其他异常：结合 bz 中该时段的说明逐打卡字段判断
            clockFields.forEach((field, index) => {
              let clockValue = record[field]

              // 纯打卡时间不含异常关键字，需结合 bz 中该时段的说明判断异常类型
              const slotSeg = slotNames[index] ? bzSegs.find(seg => seg.includes(slotNames[index])) : ''
              if (slotSeg) {
                if (slotSeg.includes('无打卡记录') || slotSeg.includes('缺卡')) clockValue = '缺'
                else if (slotSeg.includes('旷工')) clockValue = '旷'
                else if (slotSeg.includes('早退')) clockValue = '早'
                else if (slotSeg.includes('打卡延迟') || slotSeg.includes('迟到')) clockValue = '迟'
              }

              // 检查是否有异常（包含关键字）
              if (clockValue && abnormalKeywords.some(keyword => clockValue.includes(keyword))) {
                // 将异常关键字转换为完整说明
                let displayText = clockValue
                  .replace(/缺/g, '缺卡')
                  .replace(/旷/g, '旷工')
                  .replace(/迟/g, '迟到')
                  .replace(/早/g, '早退')

                // 生成 label: "刷卡日期 打卡X 异常说明"
                const label = `${skrq} ${clockLabels[index]} ${displayText}`

                // 生成 value: "one:'缺'" 或 "one:'迟30分钟'"
                const value = `${field}:'${clockValue}'`

                addOption({
                  label,
                  value,
                  id: `${record.id}-${value}`,
                  // 额外信息，方便后续使用
                  skrq,
                  qkTime: record.qkTime,
                  clockIndex: index + 1,
                  clockField: field,
                  clockValue,
                  recordId: record.id,
                  attendanceStatus: record.attendanceStatus
                })
              }
            })

            // 4）兜底：bz 中没有具体排班时段（如「当日无打卡记录（旷工）」），按整天异常生成一个选项
            if (!options.some(item => item.recordId === record.id)) {
              const hit = abnormalKeywords.find(keyword => bzText.includes(keyword))
              if (hit) {
                const displayText = hit.replace(/缺/g, '缺卡').replace(/旷/g, '旷工').replace(/迟/g, '迟到').replace(/早/g, '早退')
                const value = `day:'${displayText}'`
                addOption({
                  label: `${skrq} ${displayText}`,
                  value,
                  id: `${record.id}-${value}`,
                  skrq,
                  qkTime: record.qkTime,
                  clockIndex: null,
                  clockField: 'day',
                  clockValue: displayText,
                  recordId: record.id,
                  attendanceStatus: record.attendanceStatus
                })
              }
            }
          })

          this.dbkTimeOptions = options
          // 选项加载完成后回显已保存的异常时间段（编辑/详情/审批）
          this.applySelectedOption(options)
        }
      })
    },
    /**
     * 编辑/详情回显：库存 hrYckqYgId 是纯异常考勤记录 id，
     * 从下拉选项中匹配出对应选项（id 格式为 记录id-时段描述），
     * 一条记录拆出多个缺卡时段时，按补卡时间/异常类型细分
     */
    applySelectedOption(options) {
      if (!this.model.id || !this.model.hrYckqYgId) return
      const rawId = String(this.model.hrYckqYgId)
      const candidates = options.filter(item => String(item.recordId) === rawId)
      if (candidates.length === 0) {
        // 历史单据的考勤记录可能已被考勤重算删除/换 id，选项里匹配不到：
        // 用申请单自身数据（补卡时间 + 异常类型）兜底拼一个只读选项，避免直接显示裸 id
        this.applyFallbackOption(options, rawId)
        return
      }
      if (candidates.length === 1) {
        this.$set(this.model, 'hrYckqYgId', candidates[0].id)
        return
      }

      // 同一记录存在多个时段选项（如多段缺卡）：先按补卡时间细分
      const bkTime = String(this.model.bkTime || '')
      const bkDate = bkTime.slice(0, 10)
      const bkClock = bkTime.length >= 19 ? bkTime.slice(11, 19) : ''
      let hit = candidates.find(item =>
        item.skrq === bkDate && item.qkTime && this.normalizeQkTime(item.qkTime) === bkClock)

      // 再按异常类型关键字细分（旷工/缺卡/迟到/早退）
      if (!hit) {
        const typeKeyMap = { ABSENT: '旷', MISSING: '缺', BE_LATE: '迟', LEAVE_EARLY: '早' }
        const key = typeKeyMap[String(this.model.ycType)]
        const sameDate = candidates.filter(item => item.skrq === bkDate)
        const pool = sameDate.length ? sameDate : candidates
        if (key) {
          hit = pool.find(item => String(item.clockValue || '').includes(key))
        }
        if (!hit) hit = pool[0]
      }
      this.$set(this.model, 'hrYckqYgId', hit.id)
    },
    /**
     * 详情/审批回显兜底：库存 id 在最新异常考勤记录中已不存在（历史数据被考勤重算换 id）时，
     * 用申请单自身的补卡时间 + 异常类型拼一个只读选项，展示「日期 时分 异常类型」而不是裸 id
     */
    applyFallbackOption(options, rawId) {
      if (options.some(item => String(item.id) === rawId)) return
      const typeTextMap = {
        NORMAL: '正常',
        MISSING: '缺卡',
        ABSENT: '旷工',
        BE_LATE: '迟到',
        LEAVE_EARLY: '早退',
        OTHER: '其他'
      }
      // 组合状态（如 MISSING+BE_LATE）逐个翻译后用 / 连接
      const ycType = String(this.model.ycType || '')
      const typeText = ycType.split('+')
        .map(code => typeTextMap[code] || code)
        .filter(Boolean)
        .join('/') || this.model.ycType_dictText || ''
      const bkTime = String(this.model.bkTime || '')
      const bkDate = bkTime.slice(0, 10)
      const bkClock = bkTime.length >= 19 ? bkTime.slice(11, 19) : ''
      // 旷工补卡时间只到日期（00:00:00），缺卡/迟到/早退带上具体时分
      const showClock = typeText !== '旷工' && bkClock && bkClock !== '00:00:00'
      const label = [bkDate, showClock ? bkClock.slice(0, 5) : '', typeText]
        .filter(Boolean).join(' ') || rawId
      options.push({
        label,
        value: `fallback:'${typeText || rawId}'`,
        id: rawId,
        skrq: bkDate,
        qkTime: showClock ? bkClock : null,
        clockIndex: null,
        clockField: 'day',
        clockValue: typeText || rawId,
        recordId: rawId,
        attendanceStatus: ycType,
        fallback: true
      })
      this.$set(this.model, 'hrYckqYgId', rawId)
    },
    add() {
      this.edit(this.modelDefault)
    },
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
        const ids = (node.chooseObjects || '').toString().split(',').map(s => s.trim()).filter(Boolean)
        const names = (node.chooseObjectsName || '').toString().split(',').map(s => s.trim())
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
     * 获取流程节点列表（新增/编辑模式调用，详情模式不调用）
     */
    loadProcessNodes() {
      if (this.title === '详情') {
        this.processNodeList = []
        this.nodeObjList = []
        return
      }
      const dept = this.model.dept || (this.perInfo && this.perInfo.dept) || ''
      if (!dept) {
        this.processNodeList = []
        this.nodeObjList = []
        return
      }
      getAction(this.url.getLcjdList, {
        sqmkCode: '补卡申请',
        dept: dept,
        no: this.perInfo.no
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
      })
    },
    edit(record) {
      this.model = Object.assign({}, record)

      // 非审批模式重置审批数据
      if (!this.OK_show) {
        this.spdata = { bz: '', spr: '' }
      }

      this.processNodeList = []
      this.nodeObjList = []

      this.perInfo = Vue.ls.get('perInfo')

      if (!this.model.id) {
        this.model['name'] = this.perInfo.name
        this.model['no'] = this.perInfo.no
        this.model['companyId'] = this.perInfo.companyId
        this.model['dept'] = this.perInfo.dept
        this.model['employeeId'] = this.perInfo.id
      }
      // 编辑/详情/审批回显：库存 hrYckqYgId 是纯异常考勤记录 id，不能直接拼 bkTime，
      // 待异常时间段下拉加载完成后再匹配对应选项（见 applySelectedOption）。
      // 审批人查看时需按申请人的工号查询，否则拉不到申请人的异常考勤记录
      // 新增时异常类型未选，attendanceStatus 传空字符串；编辑/详情回显时按已保存的异常类型过滤
      this.getYClist(this.model.id ? this.model.no : this.perInfo.no, this.model.ycType || '')

      // 加载动态流程节点
      this.loadProcessNodes()

      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
    },
    submitForm() {
      const that = this
      this.$refs.form.validate(valid => {
        if (valid) {
          // 校验每个需要选择审批人的节点是否选择了人员
          let allValid = true
          this.processNodeList.forEach((node, idx) => {
            if (this.canEditApprovers(node) && this.nodeObjList[idx] && this.nodeObjList[idx].arr.length === 0) {
              this.$message.warning(`请选择「${node.nodeName}」的${this.isCcNode(node) ? '抄送' : '审批'}人`)
              allValid = false
            }
          })
          if (!allValid) return

          this.$emit('submit', true)
          let httpurl = ''
          let method = ''
          if (!this.model.id) {
            httpurl += this.url.add
            method = 'post'
          } else {
            httpurl += this.url.edit
            method = 'put'
          }

          // 组装 customProcessConfigurationDTOList：将接口返回的节点数据深拷贝后放入
          // 对于 isselfSelect===1 或 sprScope===4 的节点，将选中的审批人数据写到节点外层
          const customProcessConfigurationDTOList = this.processNodeList.map((node, idx) => {
            const nodeCopy = JSON.parse(JSON.stringify(node))
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
          this.model['customProcessConfigurationDTOList'] = customProcessConfigurationDTOList

          let param = Object.assign({}, this.model)
          param['hrYckqYgId'] = this.model.hrYckqYgId.split('-')[0]
          // 旷工补卡时间界面只填日期，提交时补全时分秒，适配后端 datetime
          if (this.isAbsentSelected && param.bkTime && String(param.bkTime).length === 10) {
            param['bkTime'] = `${param.bkTime} 00:00:00`
          }

          // ===== 真实接口调用（接入时取消注释） =====
          httpAction(httpurl, param, method).then((res) => {
            if (res.success) {
              that.$message.success(res.message)
              that.$emit('ok')
            } else {
              that.$message.warning(res.message)
            }
          }).finally(() => {
            this.$emit('submit', false)

          })
          // ===== 真实接口结束 =====
        }
      })
    },
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
     * 获取头像文字（取最后一个汉字/字符）
     */
    getAvatarText(name) {
      if (!name) return '?'
      const trimmed = String(name).trim()
      return trimmed.charAt(trimmed.length - 1).toUpperCase()
    }
  }
}
</script>

<style scoped lang="less">
.overtime-apply-form {
  min-height: 400px;
}

/* ===== 全局表单项紧致 ===== */
.overtime-apply-form /deep/ .ant-form-item {
  margin-bottom: 12px;
}

.overtime-apply-form /deep/ .ant-form-item-label {
  padding-bottom: 4px;
  line-height: 20px;
}

.overtime-apply-form /deep/ .ant-form-item-label>label {
  color: #555;
  font-size: 13px;
}

.overtime-apply-form /deep/ .ant-form-item-required::before {
  color: #ff4d4f;
  font-size: 14px;
  margin-right: 2px;
}

/* ===== 左右两栏布局 ===== */
.overtime-form-row {
  display: flex;
  flex-wrap: wrap;
}

.form-col-left {
  border-right: 1px dashed #e6e8eb;
  padding-right: 24px;
}

.form-col-right {
  padding-left: 8px;
}

@media (max-width: 768px) {
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
  position: relative;
  margin: 0 0 16px;
  padding: 0 0 10px;
  border-bottom: 1px solid #e6e8eb;
  color: #1f2937;
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
}

/* ===== 审批流程时间轴 ===== */
.approval-timeline {
  position: relative;
  padding-left: 0;
  max-height: calc(100vh - 280px);
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

.timeline-dot-light {
  border-color: #c7d0e4;
  background: #fff;
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

/* 添加审批人按钮样式（覆盖 JSelectEmployee 默认） */
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

.multi-approval-line {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px dashed #e3e9f5;
}

.multi-approval-label {
  color: #6b7280;
  font-size: 13px;
  white-space: nowrap;
}

.multi-approval-line /deep/ .ant-radio-wrapper {
  font-size: 13px;
  color: #1f2937;
}

.multi-approval-line /deep/ .ant-radio-wrapper-checked .ant-radio-checked .ant-radio-inner {
  border-color: #4a7bf7;
  background: #4a7bf7;
}

.multi-approval-line /deep/ .ant-radio-inner::after {
  background: #fff;
}
</style>

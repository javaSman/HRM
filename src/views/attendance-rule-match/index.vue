<template>
  <a-card :bordered="false" class="attendance-rule-match-page">
    <div class="page-header">
      <div>
        <h2>考勤规则匹配验证</h2>
        <div class="subtitle">沿着“打卡事件 → 适用规则 → 最终插槽”查看一条打卡的完整去向</div>
      </div>
      <a-tag color="blue">只读诊断，不写入考勤数据</a-tag>
    </div>

    <a-form-model layout="inline" class="inspect-form" @submit.native.prevent="inspect">
      <a-form-model-item label="工号">
        <a-input v-model="form.employeeNo" allowClear placeholder="请输入工号" style="width: 180px" />
      </a-form-model-item>
      <a-form-model-item label="打卡时间">
        <a-date-picker
          v-model="form.punchTime"
          showTime
          valueFormat="YYYY-MM-DD HH:mm:ss"
          format="YYYY-MM-DD HH:mm:ss"
          placeholder="请选择打卡时间"
          style="width: 220px" />
      </a-form-model-item>
      <a-form-model-item class="form-actions">
        <a-button type="primary" icon="search" :loading="loading" @click="inspect">开始验证</a-button>
        <a-button icon="reload" style="margin-left: 8px" @click="reset">重置</a-button>
      </a-form-model-item>
    </a-form-model>

    <a-empty v-if="!result" description="请输入工号和打卡时间开始验证" />

    <template v-else>
      <div class="verdict-bar" :class="verdictClass">
        <div class="verdict-icon">{{ verdictClass === 'success' ? '✓' : verdictClass === 'warning' ? '!' : '×' }}</div>
        <div class="verdict-copy">
          <div class="verdict-title">{{ verdictLabel }}</div>
          <div class="verdict-description">{{ verdictDescription }}</div>
        </div>
        <div class="verdict-summary">
          <span>适用规则 <strong>{{ applicableRuleCount }}</strong></span>
          <span>命中插槽 <strong>{{ selectedSlotCount }}</strong></span>
          <span>冲突 <strong>{{ conflictCount }}</strong></span>
        </div>
      </div>

      <a-alert v-if="result.unmatchedReason" type="warning" showIcon class="result-alert">
        <template slot="message">未形成有效插槽结果</template>
        <template slot="description">{{ result.unmatchedReason }}</template>
      </a-alert>

      <a-alert v-if="conflictCount" type="error" showIcon class="conflict-alert">
        <template slot="message">发现 {{ conflictCount }} 项规则/插槽冲突</template>
        <template slot="description">
          <div v-for="conflict in result.conflicts" :key="`${conflict.type}-${conflict.ruleIds.join(',')}`" class="conflict-line">
            <strong>{{ conflict.message }}</strong>
            <span>规则：{{ conflict.ruleIds.join('、') || '-' }}</span>
            <span>插槽：{{ conflict.slotLabels.join('、') || '-' }}</span>
          </div>
        </template>
      </a-alert>

      <div class="inspection-layout">
        <section class="inspection-panel person-panel">
          <div class="panel-heading">
            <div><h3>打卡事件</h3><span>流程起点</span></div>
            <a-tag color="blue">INPUT</a-tag>
          </div>
          <div class="person-event-card">
            <span class="node-kicker">EMPLOYEE / PUNCH</span>
            <strong>{{ result.employeeName || '未知员工' }}</strong>
            <code>{{ result.employeeNo || '-' }}</code>
            <div class="person-punch-time">{{ result.punchTime || '-' }}</div>
            <div class="person-facts">
              <span>{{ result.employeeFound ? `部门：${result.employeeDept || '-'}` : '员工不存在' }}</span>
              <span>{{ result.employeeFound ? `岗位：${result.employeePostId || '-'}` : '无法进行员工绑定判断' }}</span>
            </div>
          </div>
          <div class="panel-source"><b>数据来源</b><span>hr_employee_information（按工号读取员工部门、岗位）</span></div>
          <div class="person-result" :class="verdictClass">
            <span>最终结果</span>
            <strong>{{ verdictLabel }}</strong>
            <small>{{ result.selectedRuleName ? `规则：${result.selectedRuleName}` : (result.unmatchedReason || '未形成最终插槽') }}</small>
          </div>
        </section>

        <section class="inspection-panel rules-panel">
          <div class="panel-heading">
            <div><h3>考勤规则</h3><span>匹配规则优先展示；未匹配规则可展开查看</span></div>
            <div class="rule-heading-actions"><a-button size="small" type="primary" ghost icon="share-alt" @click="flowModalVisible = true">查看匹配流程</a-button><a-tag color="purple">{{ matchedRules.length }} / {{ (result.rules || []).length }} 匹配</a-tag></div>
          </div>
          <div v-if="matchedRules.length" class="matched-rule-list">
            <div v-for="rule in matchedRules" :key="`matched-rule-${rule.ruleId}`" class="inspect-rule-card matched">
              <div class="inspect-rule-heading">
                <span class="rule-status-dot"></span><strong>{{ rule.ruleName || '未命名规则' }}</strong>
                <a-tag v-if="rule.selected" color="green">最终规则</a-tag><a-tag v-else color="orange">候选规则</a-tag>
              </div>
              <div class="inspect-rule-code">{{ rule.ruleCode || rule.ruleId }} · {{ rule.applicabilityReason }}</div>
              <div class="inspect-rule-times">
                <div v-for="segment in (rule.segments || [])" :key="`matched-segment-${rule.ruleId}-${segment.segmentId}`" class="inspect-time-row">
                  <b>{{ segment.segmentName || '时段' }}</b><span>上班 {{ segment.onDutyTime || '-' }}</span><span>下班 {{ segment.offDutyTime || '-' }}</span><span v-if="segment.overtimeStartTime">加班 {{ segment.overtimeStartTime }}</span>
                </div>
                <div v-if="!rule.segments || !rule.segments.length" class="inspect-time-empty">未读取到时段配置</div>
              </div>
              <div v-if="rule.slots && rule.slots.length" class="rule-slot-definitions"><span v-for="slot in rule.slots" :key="`matched-slot-${rule.ruleId}-${slot.sequence}`"><b>{{ slot.sequence }}</b> {{ slot.label || '插槽' }}：{{ slot.pointTime || '-' }}（{{ slot.lowerBound || '-' }} ～ {{ slot.upperBound || '-' }}）</span></div>
              <div class="inspect-rule-source"><b>来源</b> hr_kq_rule + hr_kq_rule_gddatedk · {{ rule.calculationPath || 'AttendanceRuleCompiler → AttendanceDayCalculator' }}</div>
            </div>
          </div>
          <a-empty v-else description="没有匹配到适用规则" class="column-empty" />
          <div v-if="codeRules.length" class="code-rule-section">
            <div class="code-rule-heading"><div><strong>代码内置规则</strong><span>不来自规则表，由实时计算代码独立执行</span></div><a-tag color="blue">{{ codeRules.length }} 条</a-tag></div>
            <div class="code-rule-grid">
              <div v-for="codeRule in codeRules" :key="`code-rule-${codeRule.ruleId}`" class="code-rule-card" :class="{ applied: codeRule.applied }">
                <div class="code-rule-title"><span class="code-rule-dot"></span><strong>{{ codeRule.ruleName }}</strong><a-tag :color="codeRule.applied ? 'green' : 'default'">{{ codeRule.result }}</a-tag></div>
                <div class="code-rule-description">{{ codeRule.description }}</div>
                <div class="code-rule-detail"><b>触发</b>{{ codeRule.triggerCondition }}</div>
                <div class="code-rule-detail"><b>作用</b>{{ codeRule.effect }}</div>
                <div class="code-rule-source"><b>来源</b> {{ codeRule.source }}</div>
              </div>
            </div>
          </div>
          <button class="collapse-toggle" type="button" @click="showUnmatchedRules = !showUnmatchedRules">
            <span>{{ showUnmatchedRules ? '收起' : '展开' }}未匹配规则（{{ unmatchedRules.length }}）</span><a-icon :type="showUnmatchedRules ? 'up' : 'down'" />
          </button>
          <div v-if="showUnmatchedRules" class="unmatched-rule-list">
            <div v-for="rule in unmatchedRules" :key="`unmatched-rule-${rule.ruleId}`" class="inspect-rule-card unmatched">
              <div class="inspect-rule-heading"><span class="rule-status-dot"></span><strong>{{ rule.ruleName || '未命名规则' }}</strong><a-tag>未匹配</a-tag></div>
              <div class="inspect-rule-code">{{ rule.ruleCode || rule.ruleId }} · {{ rule.applicabilityReason || rule.result || '本次未命中' }}</div>
              <div class="inspect-rule-times">
                <div v-for="segment in (rule.segments || [])" :key="`unmatched-segment-${rule.ruleId}-${segment.segmentId}`" class="inspect-time-row"><b>{{ segment.segmentName || '时段' }}</b><span>上班 {{ segment.onDutyTime || '-' }}</span><span>下班 {{ segment.offDutyTime || '-' }}</span><span v-if="segment.overtimeStartTime">加班 {{ segment.overtimeStartTime }}</span></div>
                <div v-if="!rule.segments || !rule.segments.length" class="inspect-time-empty">未读取到时段配置</div>
              </div>
              <div v-if="rule.slots && rule.slots.length" class="rule-slot-definitions"><span v-for="slot in rule.slots" :key="`unmatched-slot-${rule.ruleId}-${slot.sequence}`"><b>{{ slot.sequence }}</b> {{ slot.label || '插槽' }}：{{ slot.pointTime || '-' }}（{{ slot.lowerBound || '-' }} ～ {{ slot.upperBound || '-' }}）</span></div>
              <div class="inspect-rule-source"><b>来源</b> hr_kq_rule + hr_kq_rule_gddatedk</div>
            </div>
          </div>
        </section>

        <section class="inspection-panel slots-panel">
          <div class="panel-heading">
            <div><h3>插槽判断</h3><span>按插槽顺序继续判断，命中后停止</span></div>
            <a-tag color="green">{{ candidateSlots.length }} 个候选</a-tag>
          </div>
          <div v-if="candidateSlots.length" class="candidate-slot-list">
            <div v-for="slot in candidateSlots" :key="`candidate-slot-${slot.sequence}`" class="inspect-slot-card" :class="{ selected: slot.selected }">
              <div class="inspect-slot-heading"><span class="slot-number">{{ slot.sequence }}</span><div><strong>{{ slot.label || '未命名插槽' }}</strong><small>{{ slot.type || '插槽判断' }}</small></div><a-tag :color="slot.selected ? 'green' : 'orange'">{{ slot.selected ? '最终命中' : '候选命中' }}</a-tag></div>
              <div class="inspect-slot-time"><span>标准 <b>{{ slot.pointTime || '-' }}</b></span><span>阈值 <b>{{ slot.thresholdTime || '-' }}</b></span><span>窗口 <b>{{ slot.lowerBound || '-' }} ～ {{ slot.upperBound || '-' }}</b></span></div>
              <div class="inspect-slot-rules"><b>已配置规则</b><span v-for="name in slot.configuredRules" :key="`slot-configured-${slot.sequence}-${name}`">{{ name }}</span></div>
              <div class="inspect-slot-rules"><b>匹配规则</b><span v-for="name in slot.candidateRules" :key="`slot-rule-${slot.sequence}-${name}`">{{ name }}</span></div>
              <div class="inspect-slot-source"><b>来源</b> AttendanceRuleCompiler → AttendanceDayCalculator</div>
            </div>
          </div>
          <a-empty v-else description="没有候选插槽" class="column-empty" />
          <button class="collapse-toggle" type="button" @click="showUnmatchedSlots = !showUnmatchedSlots">
            <span>{{ showUnmatchedSlots ? '收起' : '展开' }}未命中插槽（{{ unmatchedSlots.length }}）</span><a-icon :type="showUnmatchedSlots ? 'up' : 'down'" />
          </button>
          <div v-if="showUnmatchedSlots" class="unmatched-slot-list">
            <div v-for="slot in unmatchedSlots" :key="`unmatched-slot-${slot.sequence}`" class="inspect-slot-card unmatched">
              <div class="inspect-slot-heading"><span class="slot-number">{{ slot.sequence }}</span><div><strong>{{ slot.label || '未命名插槽' }}</strong><small>{{ slot.type || '插槽判断' }}</small></div><a-tag>未命中</a-tag></div>
              <div class="inspect-slot-time"><span>标准 <b>{{ slot.pointTime || '-' }}</b></span><span>阈值 <b>{{ slot.thresholdTime || '-' }}</b></span><span>窗口 <b>{{ slot.lowerBound || '-' }} ～ {{ slot.upperBound || '-' }}</b></span></div>
              <div class="inspect-slot-rules"><b>已配置规则</b><span v-for="name in slot.configuredRules" :key="`unmatched-slot-configured-${slot.sequence}-${name}`">{{ name }}</span></div>
              <div class="inspect-slot-source"><b>来源</b> AttendanceRuleCompiler → AttendanceDayCalculator</div>
            </div>
          </div>
        </section>
      </div>

      <a-modal
        title="员工打卡规则匹配流程"
        :visible="flowModalVisible"
        width="960px"
        :footer="null"
        destroyOnClose
        @cancel="flowModalVisible = false">
        <div class="flowchart-intro">
          <span>按实际执行顺序展示：打卡事件 → 员工绑定 → 规则/时间窗口判断 → 插槽命中。</span>
          <span class="flowchart-legend"><i class="flow-dot yes"></i>通过/命中 <i class="flow-dot no"></i>未通过 <i class="flow-dot final"></i>最终落槽</span>
        </div>
        <div class="flowchart-canvas">
          <template v-for="(node, index) in flowDiagramSteps">
            <div v-if="index > 0" :key="`flow-connector-${node.order}`" class="flowchart-connector">
              <span v-if="node.edgeLabel" :class="node.edgeResult === 'yes' ? 'edge-yes' : 'edge-no'">{{ node.edgeLabel }}</span>
            </div>
            <div :key="`flow-node-${node.order}`" class="flowchart-node-row">
              <div v-if="node.kind === 'decision'" class="flowchart-diamond" :class="node.resultClass">
                <div class="flowchart-diamond-content">
                  <span class="flowchart-node-type">{{ node.phase }}</span>
                  <strong>{{ node.title }}</strong>
                  <small>{{ node.detail }}</small>
                  <span v-if="node.config" class="flowchart-config">{{ node.config }}</span>
                  <a-tag :color="node.resultClass === 'yes' ? 'green' : node.resultClass === 'no' ? 'default' : 'orange'">{{ node.result }}</a-tag>
                </div>
              </div>
              <div v-else class="flowchart-rect" :class="node.resultClass">
                <span class="flowchart-node-type">{{ node.phase }}</span>
                <strong>{{ node.title }}</strong>
                <small>{{ node.detail }}</small>
                <span v-if="node.config" class="flowchart-config">{{ node.config }}</span>
                <a-tag v-if="node.result" :color="node.resultClass === 'final' ? 'green' : node.resultClass === 'yes' ? 'green' : node.resultClass === 'no' ? 'default' : 'blue'">{{ node.result }}</a-tag>
              </div>
            </div>
          </template>
        </div>
      </a-modal>

      <div class="details-toggle">
        <a-button type="link" @click="showAllRules = !showAllRules">
          {{ showAllRules ? '收起员工相关规则明细' : `查看员工相关规则明细（${relevantRules.length} 条，已过滤未绑定规则）` }}
          <a-icon :type="showAllRules ? 'up' : 'down'" />
        </a-button>
      </div>

      <div v-if="showAllRules" class="all-rules-panel">
        <a-table
          class="rule-table"
          rowKey="ruleId"
          bordered
          size="middle"
          :columns="columns"
          :dataSource="relevantRules"
          :pagination="false"
          :expandedRowKeys="expandedRowKeys"
          @expand="onExpand">
          <template slot="rule" slot-scope="text, record">
            <div class="rule-name">{{ record.ruleName || '未命名规则' }}</div>
            <div class="rule-id">{{ record.ruleCode || record.ruleId }}</div>
          </template>
          <template slot="applicable" slot-scope="text, record">
            <a-tag :color="record.applicable ? 'green' : 'default'">{{ record.applicable ? '适用' : '不适用' }}</a-tag>
            <div class="cell-desc">{{ record.applicabilityReason }}</div>
          </template>
          <template slot="candidate" slot-scope="text, record">
            <a-tag v-if="record.candidateSummary && record.candidateSummary !== '未命中'" color="orange">{{ record.candidateSummary }}</a-tag>
            <span v-else class="muted">未命中</span>
          </template>
          <template slot="selected" slot-scope="text, record">
            <a-tag v-if="record.selectedSlotSummary && record.selectedSlotSummary !== '未插入'" color="green">{{ record.selectedSlotSummary }}</a-tag>
            <span v-else class="muted">未插入</span>
          </template>
          <template slot="result" slot-scope="text, record">
            <a-tag :color="resultColor(record)">{{ record.result }}</a-tag>
            <div v-if="record.error" class="error-text">{{ record.error }}</div>
          </template>
          <template slot="expandedRowRender" slot-scope="record">
            <div class="slot-panel">
              <div class="rule-provenance">
                <div><strong>规则来源：</strong>{{ record.source || 'hr_kq_rule + hr_kq_rule_gddatedk' }}</div>
                <div><strong>执行链路：</strong>{{ record.calculationPath || 'AttendanceRuleCompiler → AttendanceDayCalculator' }}</div>
                <div v-if="record.compatibilityApplied && record.compatibilityApplied.length"><strong>已执行兼容逻辑：</strong>{{ record.compatibilityApplied.join('；') }}</div>
              </div>
              <div v-if="record.segments && record.segments.length" class="segment-summary">
                <div class="slot-panel-title">规则时段明细（来自 hr_kq_rule_gddatedk）</div>
                <div v-for="segment in record.segments" :key="segment.segmentId" class="segment-line">
                  <strong>{{ segment.segmentName || '未命名时段' }}</strong>
                  <span>上班 {{ segment.onDutyTime || '-' }}</span>
                  <span>下班 {{ segment.offDutyTime || '-' }}</span>
                  <span v-if="segment.overtimeStartTime">加班 {{ segment.overtimeStartTime }}</span>
                  <span>迟到宽限 {{ segment.lateGraceMinutes == null ? '-' : `${segment.lateGraceMinutes} 分钟` }}</span>
                  <span>早退提前 {{ segment.earlyLeaveMinutes == null ? '-' : `${segment.earlyLeaveMinutes} 分钟` }}</span>
                </div>
              </div>
              <div class="slot-panel-title">{{ record.ruleName || record.ruleId }} 的插槽窗口（考勤日 {{ record.attendanceDate || '-' }}）</div>
              <a-table rowKey="sequence" size="small" :columns="slotColumns" :dataSource="record.slots || []" :pagination="false">
                <template slot="slot" slot-scope="text, slot">
                  <strong>{{ slot.sequence }} {{ slot.label }}</strong>
                  <span class="cell-desc">{{ slot.type }}</span>
                </template>
                <template slot="match" slot-scope="text, slot">
                  <a-tag v-if="slot.selected" color="green">最终插入</a-tag>
                  <a-tag v-else-if="slot.candidate" color="orange">候选命中</a-tag>
                  <span v-else class="muted">未命中</span>
                  <div class="cell-desc">{{ slot.reason }}</div>
                </template>
              </a-table>
            </div>
          </template>
        </a-table>
      </div>
    </template>
  </a-card>
</template>

<script>
import moment from 'moment'
import { postAction } from '@/api/manage'

export default {
  name: 'AttendanceRuleMatchInspector',
  data() {
    return {
      loading: false,
      showAllRules: false,
      showUnmatchedRules: false,
      showUnmatchedSlots: false,
      flowModalVisible: false,
      form: {
        employeeNo: '',
        punchTime: moment().format('YYYY-MM-DD HH:mm:ss')
      },
      result: null,
      expandedRowKeys: [],
      columns: [
        { title: '规则', key: 'rule', width: 220, scopedSlots: { customRender: 'rule' } },
        { title: '员工绑定', key: 'applicable', width: 190, scopedSlots: { customRender: 'applicable' } },
        { title: '规则状态', dataIndex: 'status', width: 90 },
        { title: '打卡方式', dataIndex: 'attendanceType', width: 90 },
        { title: '优先级', dataIndex: 'priority', width: 80 },
        { title: '候选插槽', key: 'candidate', width: 220, scopedSlots: { customRender: 'candidate' } },
        { title: '最终插槽', key: 'selected', width: 180, scopedSlots: { customRender: 'selected' } },
        { title: '结论', key: 'result', width: 180, scopedSlots: { customRender: 'result' } }
      ],
      slotColumns: [
        { title: '插槽', key: 'slot', width: 180, scopedSlots: { customRender: 'slot' } },
        { title: '班次时间', dataIndex: 'pointTime', width: 110 },
        { title: '判定阈值', dataIndex: 'thresholdTime', width: 110 },
        { title: '有效窗口', key: 'window', width: 220, customRender: (text, record) => `${record.lowerBound} ~ ${record.upperBound}` },
        { title: '匹配结果', key: 'match', scopedSlots: { customRender: 'match' } }
      ]
    }
  },
  computed: {
    conflictCount() {
      return this.result && this.result.conflicts ? this.result.conflicts.length : 0
    },
    applicableRuleCount() {
      return this.result && this.result.rules ? this.result.rules.filter(item => item.applicable).length : 0
    },
    relevantRules() {
      if (!this.result || !this.result.rules) return []
      return this.result.rules.filter(rule => rule.applicable || rule.selected)
    },
    matchedRules() {
      if (!this.result || !this.result.rules) return []
      return this.result.rules.filter(rule => rule.applicable && (rule.selected || (rule.slots || []).some(slot => slot.candidate || slot.selected)))
    },
    unmatchedRules() {
      if (!this.result || !this.result.rules) return []
      const matchedIds = new Set(this.matchedRules.map(rule => rule.ruleId))
      return this.result.rules.filter(rule => !matchedIds.has(rule.ruleId))
    },
    codeRules() {
      return this.result && this.result.codeRules ? this.result.codeRules : []
    },
    flowDiagramSteps() {
      if (!this.result) return []
      const steps = []
      let order = 1
      steps.push({
        order: order++,
        kind: 'rect',
        phase: 'START',
        title: '打卡事件',
        detail: `${this.result.employeeNo || '-'} · ${this.result.punchTime || '-'}`,
        config: this.result.employeeName || '未知员工',
        resultClass: 'start'
      })
      steps.push({
        order: order++,
        kind: 'decision',
        phase: '规则绑定',
        title: '员工是否绑定规则？',
        detail: this.result.selectedRuleReason || '未找到员工绑定规则',
        result: this.result.selectedRuleId ? '是' : '否',
        resultClass: this.result.selectedRuleId ? 'yes' : 'no',
        edgeLabel: '开始判断',
        edgeResult: this.result.selectedRuleId ? 'yes' : 'no'
      })
      steps.push({
        order: order++,
        kind: 'decision',
        phase: '规则筛选',
        title: '按绑定权重和优先级筛选',
        detail: `适用 ${this.matchedRules.length} 条，未匹配 ${this.unmatchedRules.length} 条`,
        result: this.matchedRules.length ? '完成' : '无适用规则',
        resultClass: this.matchedRules.length ? 'yes' : 'no',
        edgeLabel: this.result.selectedRuleId ? '是' : '否',
        edgeResult: this.result.selectedRuleId ? 'yes' : 'no'
      })
      if (this.codeRules.length) {
        const appliedCodeRules = this.codeRules.filter(rule => rule.applied)
        steps.push({
          order: order++,
          kind: 'rect',
          phase: '代码兼容',
          title: '执行代码内置规则与后处理',
          detail: `已执行 ${appliedCodeRules.length} / ${this.codeRules.length} 条`,
          config: appliedCodeRules.map(rule => rule.ruleName).join('、') || '本次未触发代码分支',
          result: appliedCodeRules.length ? '已参与计算' : '未触发',
          resultClass: appliedCodeRules.length ? 'yes' : 'no',
          edgeLabel: '继续判断',
          edgeResult: appliedCodeRules.length ? 'yes' : 'no'
        })
      }
      this.matchedRules.forEach(rule => {
        const segments = (rule.segments || []).map(segment => `${segment.segmentName || '时段'} ${segment.onDutyTime || '-'}～${segment.offDutyTime || '-'}`).join('；')
        steps.push({
          order: order++,
          kind: 'rect',
          phase: rule.selected ? '最终规则' : '候选规则',
          title: rule.ruleName || rule.ruleId || '未命名规则',
          detail: rule.applicabilityReason || '员工绑定范围命中',
          config: segments || '未读取到时段配置',
          result: rule.selected ? '优先选中' : '参与判断',
          resultClass: rule.selected ? 'yes' : 'candidate',
          edgeLabel: '进入规则',
          edgeResult: rule.selected ? 'yes' : 'candidate'
        })
        const ruleSlots = (rule.slots || [])
          .filter(slot => slot.candidate || slot.selected)
          .sort((a, b) => a.sequence - b.sequence)
        ruleSlots.forEach(slot => {
          steps.push({
            order: order++,
            kind: 'decision',
            phase: '插槽窗口',
            title: `插槽 ${slot.sequence} ${slot.label || ''}`,
            detail: slot.reason || '比较打卡时间与插槽窗口',
            config: `标准 ${slot.pointTime || '-'} · 阈值 ${slot.thresholdTime || '-'} · 窗口 ${slot.lowerBound || '-'} ～ ${slot.upperBound || '-'}`,
            result: slot.selected ? '最终命中' : '候选命中',
            resultClass: slot.selected ? 'final' : 'candidate',
            edgeLabel: slot.selected ? '命中' : '继续判断',
            edgeResult: slot.selected ? 'yes' : 'candidate'
          })
        })
      })
      const selectedSlots = this.candidateSlots.filter(slot => slot.selected).map(slot => `${slot.sequence} ${slot.label || ''}`).join('、')
      steps.push({
        order: order++,
        kind: 'rect',
        phase: 'END',
        title: selectedSlots ? `插入插槽 ${selectedSlots}` : '未落入插槽',
        detail: selectedSlots ? '考勤结果写入最终插槽' : (this.result.unmatchedReason || '所有候选窗口均未命中'),
        result: selectedSlots ? '完成' : '结束',
        resultClass: selectedSlots ? 'final' : 'no',
        edgeLabel: selectedSlots ? '是' : '否',
        edgeResult: selectedSlots ? 'yes' : 'no'
      })
      return steps
    },
    slotCards() {
      if (!this.result || !this.result.rules) return []
      const cards = {}
      this.result.rules.forEach(rule => {
        if (!rule.applicable && !rule.selected) return
        const slots = rule.slots || []
        slots.forEach(slot => {
          const key = String(slot.sequence)
          if (!cards[key]) {
            cards[key] = {
              sequence: slot.sequence,
              label: slot.label,
              type: slot.type,
              pointTime: slot.pointTime,
              thresholdTime: slot.thresholdTime,
              lowerBound: slot.lowerBound,
              upperBound: slot.upperBound,
              candidate: false,
              selected: false,
              candidateRules: [],
              configuredRules: []
            }
          }
          const card = cards[key]
          if (!card.label && slot.label) card.label = slot.label
          if (!card.pointTime && slot.pointTime) card.pointTime = slot.pointTime
          if (!card.thresholdTime && slot.thresholdTime) card.thresholdTime = slot.thresholdTime
          if (!card.lowerBound && slot.lowerBound) card.lowerBound = slot.lowerBound
          if (!card.upperBound && slot.upperBound) card.upperBound = slot.upperBound
          const ruleName = rule.ruleName || rule.ruleCode || rule.ruleId
          if (ruleName && !card.configuredRules.includes(ruleName)) card.configuredRules.push(ruleName)
          if (slot.candidate || slot.selected) {
            card.candidate = true
            if (slot.selected) card.selected = true
            if (ruleName && !card.candidateRules.includes(ruleName)) card.candidateRules.push(ruleName)
          }
        })
      })
      return Object.keys(cards).map(key => cards[key]).sort((a, b) => a.sequence - b.sequence)
    },
    candidateSlots() {
      return this.slotCards.filter(slot => slot.candidate)
    },
    unmatchedSlots() {
      return this.slotCards.filter(slot => !slot.candidate)
    },
    selectedSlotCount() {
      if (!this.result || !this.result.rules) return 0
      return this.result.rules.reduce((total, rule) => total + (rule.slots || []).filter(slot => slot.selected).length, 0)
    },
    verdictClass() {
      if (this.conflictCount || (this.result && this.result.unmatchedReason)) return 'warning'
      if (this.selectedSlotCount) return 'success'
      return 'error'
    },
    verdictLabel() {
      if (this.conflictCount) return '存在规则交叉，需要确认优先级'
      if (this.selectedSlotCount) return '已匹配并落入插槽'
      if (this.result && this.result.unmatchedReason) return '未落入有效插槽'
      return '未匹配到规则'
    },
    verdictDescription() {
      if (this.conflictCount) return '这条打卡同时进入了多个规则或插槽窗口，系统会按绑定权重和优先级选取结果。'
      if (this.selectedSlotCount) return `最终适用规则为“${this.result.selectedRuleName || '-'}”，已写入 ${this.selectedSlotCount} 个插槽。`
      return (this.result && (this.result.unmatchedReason || '没有找到可以接收这条打卡的插槽窗口。')) || ''
    }
  },
  methods: {
    inspect() {
      if (!this.form.employeeNo || !this.form.employeeNo.trim()) {
        this.$message.warning('请输入工号')
        return
      }
      if (!this.form.punchTime) {
        this.$message.warning('请选择打卡时间')
        return
      }
      this.loading = true
      postAction('/attendance/realtime/rule-match/inspect', {
        employeeNo: this.form.employeeNo.trim(),
        punchTime: this.form.punchTime
      }).then(res => {
        if (res.success) {
          this.result = res.result || null
          this.expandedRowKeys = []
          this.showAllRules = false
          this.showUnmatchedRules = false
          this.showUnmatchedSlots = false
          this.flowModalVisible = false
        } else {
          this.$message.warning(res.message || '规则匹配验证失败')
        }
      }).finally(() => { this.loading = false })
    },
    reset() {
      this.form.employeeNo = ''
      this.form.punchTime = moment().format('YYYY-MM-DD HH:mm:ss')
      this.result = null
      this.expandedRowKeys = []
      this.showAllRules = false
      this.showUnmatchedRules = false
      this.showUnmatchedSlots = false
      this.flowModalVisible = false
    },
    onExpand(expanded, record) {
      this.expandedRowKeys = expanded ? [record.ruleId] : []
    },
    resultColor(record) {
      if (record.selected) return 'green'
      if (record.result && (record.result.indexOf('冲突') >= 0 || record.result.indexOf('失败') >= 0)) return 'red'
      if (record.result && record.result.indexOf('命中') >= 0) return 'orange'
      return 'default'
    }
  }
}
</script>

<style lang="less" scoped>
.attendance-rule-match-page {
  min-height: calc(100vh - 120px);
  overflow: auto;
  color: #1f2937;
}
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
h2 { margin: 0 0 5px; color: #111827; font-size: 22px; }
h3 { margin: 0 0 4px; color: #111827; font-size: 17px; }
.subtitle, .section-heading span, .event-summary-meta, .node-eyebrow, .rule-node-code, .rule-node-meta, .slot-node-time, .slot-node-reason, .slot-node small, .cell-desc, .rule-id, .muted { color: #526173; font-size: 13px; }
.inspect-form { display: flex; align-items: flex-end; flex-wrap: wrap; gap: 4px 12px; padding: 15px 16px 5px; margin-bottom: 18px; background: #f7f9fc; border: 1px solid #e8edf3; border-radius: 4px; }
.inspect-form /deep/ .ant-form-item { margin-bottom: 10px; }
.form-actions { margin-left: auto; }
.result-alert, .conflict-alert { margin-bottom: 14px; }
.conflict-line { display: flex; flex-wrap: wrap; gap: 4px 14px; line-height: 1.8; }
.verdict-bar { display: flex; align-items: center; gap: 14px; padding: 16px 18px; margin-bottom: 12px; border: 1px solid; border-radius: 5px; }
.verdict-bar.success { color: #237804; background: #f6ffed; border-color: #b7eb8f; }
.verdict-bar.warning { color: #ad6800; background: #fffbe6; border-color: #ffe58f; }
.verdict-bar.error { color: #a8071a; background: #fff1f0; border-color: #ffa39e; }
.verdict-icon { display: flex; align-items: center; justify-content: center; width: 27px; height: 27px; border: 2px solid currentColor; border-radius: 50%; font-size: 18px; font-weight: 700; }
.verdict-copy { flex: 1; min-width: 0; }
.verdict-title { margin-bottom: 3px; font-size: 16px; font-weight: 700; }
.verdict-description { font-size: 13px; line-height: 1.6; }
.verdict-summary { display: flex; gap: 18px; color: #687386; font-size: 12px; white-space: nowrap; }
.verdict-summary strong { margin-left: 3px; color: #111827; font-size: 16px; }
.event-summary { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 13px 16px; margin-bottom: 22px; background: #fff; border: 1px solid #e8edf3; border-radius: 4px; }
.event-summary-main, .event-summary-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 9px; }
.event-kicker { color: #7a8699; font-size: 12px; }
.event-summary-main strong { color: #111827; font-size: 15px; }
.event-no, .event-time { color: #334155; font-family: SFMono-Regular, Consolas, monospace; font-size: 13px; }
.event-divider { color: #c4cbd5; }
.event-summary-meta { justify-content: flex-end; }
.trace-strip { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; padding: 7px 10px; margin: -6px 0 10px; background: #fbfcfe; border: 1px solid #edf1f5; border-radius: 4px; }
.trace-title { color: #526173; font-size: 12px; font-weight: 700; }
.trace-step { display: flex; align-items: center; flex-wrap: wrap; gap: 5px; padding: 4px 8px; background: #fff; border: 1px solid #e3e9f0; border-radius: 3px; line-height: 1.5; }
.trace-step-name { color: #334155; font-size: 12px; font-weight: 600; }
.trace-step-source { color: #3578b8; font-family: SFMono-Regular, Consolas, monospace; font-size: 11px; }
.trace-step-description { color: #8a94a6; font-size: 11px; }
.section-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.flow-heading { margin: 4px 0 14px; }
.flow-board { display: grid; grid-template-columns: minmax(220px, .8fr) 42px minmax(300px, 1fr) 52px minmax(330px, 1.15fr); gap: 0; padding: 0 4px 6px; overflow-x: auto; }
.flow-event-column, .flow-rule-column, .flow-slot-column, .event-branch, .slot-branch { display: flex; flex-direction: column; min-width: 0; }
.flow-column-label { min-height: 26px; padding: 0 4px 8px; color: #64748b; font-size: 12px; font-weight: 600; letter-spacing: .04em; }
.event-node { align-self: center; width: 245px; max-width: 100%; padding: 18px 17px; margin: auto 0; background: #f8fbff; border: 1px solid #a9d5ff; border-radius: 6px; box-shadow: 0 5px 14px rgba(31, 96, 153, .08); }
.node-eyebrow { color: #4386bd; font-size: 10px; font-weight: 700; letter-spacing: .12em; }
.event-node-name { margin-top: 11px; color: #0f2942; font-size: 17px; font-weight: 700; }
.event-node-no { margin-top: 3px; color: #456177; font-family: SFMono-Regular, Consolas, monospace; font-size: 12px; }
.event-node-time { padding: 11px 0 8px; margin-top: 12px; border-top: 1px solid #d9ebfb; color: #0f2942; font-family: SFMono-Regular, Consolas, monospace; font-size: 15px; font-weight: 600; }
.event-node-date { color: #7890a5; font-size: 11px; line-height: 1.5; }
.event-branch { justify-content: center; padding-top: 26px; }
.branch-line { position: relative; display: block; width: 100%; height: 2px; background: #cbd5e1; }
.branch-arrow { position: absolute; right: -1px; top: 50%; transform: translateY(-55%); color: #94a3b8; font-size: 22px; line-height: 1; }
.flow-lane { display: flex; align-items: center; min-height: 126px; padding: 7px 4px; }
.rule-node { width: 100%; min-height: 105px; padding: 13px 14px; background: #fff; border: 1px solid #dbe3ec; border-radius: 5px; transition: border-color .2s, box-shadow .2s, transform .2s; }
.rule-node.selected { border-color: #95de64; background: #f6ffed; box-shadow: 0 4px 12px rgba(82, 196, 26, .12); }
.rule-node.candidate:not(.selected) { border-color: #ffd591; background: #fffaf0; }
.rule-node.muted { background: #fafafa; opacity: .72; }
.node-topline, .slot-node-topline { display: flex; align-items: center; gap: 7px; min-width: 0; }
.rule-match-dot { flex: 0 0 auto; width: 8px; height: 8px; border-radius: 50%; background: #b6c2d1; }
.rule-node.selected .rule-match-dot { background: #52c41a; }
.rule-node.candidate:not(.selected) .rule-match-dot { background: #fa8c16; }
.rule-node-name { overflow: hidden; color: #1f2937; font-size: 14px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.node-topline .ant-tag { margin-left: auto; }
.rule-node-code { margin: 6px 0 9px 15px; font-family: SFMono-Regular, Consolas, monospace; }
.rule-node-description { display: -webkit-box; overflow: hidden; margin: -2px 0 7px 15px; color: #687386; font-size: 11px; line-height: 1.5; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.rule-node-meta { display: flex; flex-wrap: wrap; gap: 4px 10px; padding-top: 8px; border-top: 1px solid #edf1f5; line-height: 1.5; }
.rule-node-segments { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; margin-top: 7px; color: #687386; font-size: 11px; line-height: 1.5; }
.segment-chip { padding: 2px 5px; background: #f5f7fa; border-radius: 2px; color: #526173; font-family: SFMono-Regular, Consolas, monospace; }
.rule-node-compatibility { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; color: #68809a; font-size: 11px; line-height: 1.5; }
.rule-node-compatibility span { padding: 2px 5px; background: #f5f8fb; border-radius: 2px; }
.rule-node-result { margin-top: 8px; font-size: 12px; font-weight: 600; }
.result-success { color: #389e0d; }
.result-warning { color: #d46b08; }
.result-error { color: #cf1322; }
.slot-branch { padding-top: 26px; }
.branch-lane { position: relative; min-height: 126px; padding: 7px 0; }
.branch-lane .branch-line { width: calc(100% - 3px); }
.branch-lane .branch-arrow { right: -2px; }
.slot-group { display: flex; flex-direction: column; justify-content: center; gap: 7px; width: 100%; }
.slot-node { padding: 12px 13px; background: #fff; border: 1px solid #dbe3ec; border-left: 3px solid #faad14; border-radius: 5px; }
.slot-node.selected { background: #f6ffed; border-color: #b7eb8f; border-left-color: #52c41a; }
.slot-node.empty-slot { display: flex; flex-direction: column; gap: 4px; min-height: 72px; justify-content: center; border-left-color: #bfc7d2; color: #7b8797; }
.slot-sequence { color: #526173; font-size: 12px; font-weight: 700; }
.slot-node-topline strong { overflow: hidden; color: #1f2937; text-overflow: ellipsis; white-space: nowrap; }
.slot-node-topline .ant-tag { margin-left: auto; }
.slot-node-time { margin-top: 8px; color: #526173; font-family: SFMono-Regular, Consolas, monospace; }
.slot-node-reason { margin-top: 4px; line-height: 1.5; }
.slot-competition { padding-top: 8px; margin-top: 8px; border-top: 1px dashed #e4eaf1; color: #687386; font-size: 11px; line-height: 1.6; }
.competition-line { display: flex; flex-wrap: wrap; align-items: baseline; gap: 3px 5px; }
.competition-label { flex: 0 0 auto; color: #7a8699; }
.rule-ref-tag { display: inline-block; padding: 1px 5px; background: #f5f7fa; border-radius: 2px; color: #526173; }
.candidate-ref { background: #fff1db; color: #ad6800; }
.candidate-ref em { font-style: normal; color: #389e0d; }
.flow-empty { padding: 20px 0; }
.flow-legend { display: flex; flex-wrap: wrap; gap: 16px; padding: 10px 4px 4px; color: #738095; font-size: 12px; }
.legend-dot { display: inline-block; width: 8px; height: 8px; margin-right: 5px; border-radius: 50%; }
.legend-dot.green { background: #52c41a; }
.legend-dot.orange { background: #fa8c16; }
.legend-dot.gray { background: #b6c2d1; }
.decision-trace { padding: 10px 0 2px; margin-top: 6px; border-top: 1px solid #eef1f5; }
.decision-flow { position: relative; overflow-x: auto; padding: 12px 8px 6px; background: linear-gradient(180deg, #fbfdff 0%, #fff 100%); border: 1px solid #e5ebf2; border-radius: 6px; }
.decision-flow-start { display: flex; justify-content: center; }
.decision-flow-event-node { position: relative; display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 250px; padding: 12px 18px; background: #f0f8ff; border: 1px solid #91caff; border-radius: 8px; box-shadow: 0 4px 12px rgba(24, 144, 255, .10); text-align: center; }
.decision-flow-event-node::after { content: ''; position: absolute; left: 50%; bottom: -19px; width: 2px; height: 19px; background: #91caff; }
.decision-node-kicker { color: #3578b8; font-size: 10px; font-weight: 700; letter-spacing: .08em; }
.decision-flow-event-node strong { color: #0f2942; font-family: SFMono-Regular, Consolas, monospace; font-size: 13px; }
.decision-flow-event-node > span:last-child { color: #64748b; font-size: 11px; }
.decision-flow-start-line { width: 2px; height: 19px; margin: 0 auto; background: #91caff; }
.decision-flow-groups { display: flex; flex-direction: column; gap: 9px; }
.decision-flow-group { position: relative; display: flex; align-items: center; min-width: max-content; padding: 6px 0; animation: decision-flow-in .3s ease both; }
.decision-group-branch { position: relative; flex: 0 0 28px; height: 2px; background: #b7cde1; }
.decision-group-branch::before { content: ''; position: absolute; left: 0; top: -15px; width: 2px; height: 30px; background: #b7cde1; }
.decision-group-branch span { position: absolute; right: -1px; top: 50%; width: 7px; height: 7px; transform: translateY(-50%) rotate(45deg); border-top: 2px solid #7b9bb9; border-right: 2px solid #7b9bb9; }
.decision-flow-rule-node { position: relative; display: flex; flex-direction: column; gap: 3px; flex: 0 0 205px; min-height: 82px; padding: 10px 12px; background: #fff; border: 1px solid #dbe3ec; border-left: 3px solid #91caff; border-radius: 6px; box-shadow: 0 2px 8px rgba(31, 41, 55, .04); }
.decision-flow-rule-node.selected { background: #f6ffed; border-color: #b7eb8f; border-left-color: #52c41a; }
.decision-flow-rule-node strong { max-width: 180px; overflow: hidden; color: #1f2937; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.decision-flow-rule-node > span:not(.decision-node-kicker) { max-width: 180px; overflow: hidden; color: #7a8699; font-size: 11px; line-height: 1.4; text-overflow: ellipsis; white-space: nowrap; }
.decision-flow-rule-node .ant-tag { align-self: flex-start; margin: 2px 0 0; }
.decision-slot-chain { display: flex; align-items: center; min-height: 112px; margin-left: 10px; }
.decision-slot-arrow { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 0 0 72px; gap: 3px; color: #8a94a6; font-size: 10px; }
.decision-slot-arrow b { color: #7b9bb9; font-size: 20px; font-weight: 400; line-height: 1; }
.decision-flow-slot-node { position: relative; display: flex; flex-direction: column; flex: 0 0 238px; min-height: 96px; padding: 10px 11px; background: #fff; border: 1px solid #dbe3ec; border-top: 3px solid #bfc7d2; border-radius: 6px; box-shadow: 0 2px 8px rgba(31, 41, 55, .04); }
.decision-flow-slot-node::after { content: ''; position: absolute; right: -11px; top: 50%; width: 10px; height: 2px; background: #b7cde1; }
.decision-flow-slot-node:last-child::after { display: none; }
.decision-flow-slot-node.candidate { border-color: #ffd591; border-top-color: #fa8c16; background: #fffaf0; }
.decision-flow-slot-node.hit { border-color: #b7eb8f; border-top-color: #52c41a; background: #f6ffed; box-shadow: 0 4px 14px rgba(82, 196, 26, .14); }
.decision-flow-slot-node.miss { border-top-color: #bfc7d2; }
.decision-flow-slot-node.empty { justify-content: center; color: #8a94a6; font-size: 11px; }
.decision-slot-topline { display: flex; align-items: center; gap: 7px; min-width: 0; }
.decision-slot-number { display: inline-flex; align-items: center; justify-content: center; flex: 0 0 auto; width: 25px; height: 25px; border-radius: 50%; background: #eef2f6; color: #526173; font-size: 12px; font-weight: 700; }
.candidate .decision-slot-number { background: #fff1db; color: #ad6800; }
.hit .decision-slot-number { background: #d9f7be; color: #237804; }
.decision-slot-title { display: flex; flex-direction: column; min-width: 0; }
.decision-slot-title strong { overflow: hidden; color: #1f2937; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.decision-slot-title small { color: #8a94a6; font-size: 10px; }
.decision-slot-topline .ant-tag { margin-left: auto; margin-right: 0; }
.decision-slot-config { display: flex; flex-wrap: wrap; gap: 4px 8px; padding: 7px 0 5px; margin-top: 8px; border-top: 1px dashed #edf1f5; color: #7a8699; font-size: 10px; line-height: 1.4; }
.decision-slot-config b { color: #3578b8; font-family: SFMono-Regular, Consolas, monospace; font-weight: 500; }
.candidate .decision-slot-config b { color: #ad6800; }
.hit .decision-slot-config b { color: #389e0d; }
.decision-slot-condition { overflow: hidden; margin-top: auto; padding-top: 5px; color: #526173; font-size: 10px; line-height: 1.4; text-overflow: ellipsis; white-space: nowrap; }
.decision-hit-note { padding-top: 4px; color: #389e0d; font-size: 10px; font-weight: 600; }
.decision-slot-source { overflow: hidden; margin-top: 3px; color: #a0a8b5; font-family: SFMono-Regular, Consolas, monospace; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
@keyframes decision-flow-in { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
.inspection-layout { display: grid; grid-template-columns: 230px minmax(390px, 1.1fr) minmax(390px, 1.1fr); gap: 12px; align-items: start; margin-top: 10px; }
.inspection-panel { min-width: 0; padding: 12px; background: #fff; border: 1px solid #e5ebf2; border-radius: 6px; box-shadow: 0 2px 8px rgba(31, 41, 55, .035); }
.rules-panel, .slots-panel { position: relative; }
.rules-panel::before, .slots-panel::before { content: '→'; position: absolute; left: -18px; top: 50%; color: #91a9c0; font-size: 20px; line-height: 1; }
.panel-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; padding-bottom: 10px; margin-bottom: 10px; border-bottom: 1px solid #eef1f5; }
.panel-heading h3 { margin: 0 0 3px; font-size: 15px; }
.panel-heading span { color: #526173; font-size: 12px; }
.panel-heading .ant-tag { margin-right: 0; }
.person-event-card { display: flex; flex-direction: column; gap: 5px; padding: 15px 12px; background: #f4faff; border: 1px solid #b7dfff; border-radius: 6px; }
.node-kicker { color: #3578b8; font-size: 10px; font-weight: 700; letter-spacing: .08em; }
.person-event-card strong { color: #0f2942; font-size: 16px; }
.person-event-card code { padding: 0; background: transparent; color: #526173; font-family: SFMono-Regular, Consolas, monospace; font-size: 12px; }
.person-punch-time { padding: 8px 0 6px; margin-top: 5px; border-top: 1px solid #d9ebfb; color: #0f2942; font-family: SFMono-Regular, Consolas, monospace; font-size: 13px; font-weight: 600; }
.person-facts { display: flex; flex-direction: column; gap: 3px; color: #334155; font-size: 12px; line-height: 1.5; }
.panel-source { display: flex; flex-direction: column; gap: 3px; padding: 8px 9px; margin-top: 9px; background: #fafcff; border: 1px dashed #b9c9d8; border-radius: 4px; color: #526173; font-size: 11px; line-height: 1.5; }
.panel-source b, .inspect-rule-source b, .inspect-slot-source b { color: #64748b; font-weight: 600; }
.person-result { display: flex; flex-direction: column; gap: 3px; padding: 9px 10px; margin-top: 9px; border: 1px solid; border-radius: 4px; }
.person-result.success { color: #237804; background: #f6ffed; border-color: #b7eb8f; }
.person-result.warning { color: #ad6800; background: #fffbe6; border-color: #ffe58f; }
.person-result.error { color: #a8071a; background: #fff1f0; border-color: #ffa39e; }
.person-result > span { font-size: 10px; }
.person-result strong { font-size: 13px; }
.person-result small { color: #334155; font-size: 11px; line-height: 1.5; }
.matched-rule-list, .unmatched-rule-list, .candidate-slot-list, .unmatched-slot-list { display: flex; flex-direction: column; gap: 8px; }
.inspect-rule-card { padding: 10px; border: 1px solid #dbe3ec; border-left: 3px solid #bfc7d2; border-radius: 5px; background: #fbfcfe; }
.inspect-rule-card.matched { border-color: #b7eb8f; border-left-color: #52c41a; background: #fafff5; }
.inspect-rule-card.unmatched { opacity: .82; }
.inspect-rule-heading { display: flex; align-items: center; gap: 6px; min-width: 0; }
.inspect-rule-heading strong { overflow: hidden; flex: 1; color: #1f2937; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.rule-status-dot { flex: 0 0 auto; width: 7px; height: 7px; border-radius: 50%; background: #bfc7d2; }
.matched .rule-status-dot { background: #52c41a; }
.inspect-rule-heading .ant-tag { margin: 0; }
.inspect-rule-code { overflow: hidden; margin: 4px 0 7px 13px; color: #526173; font-family: SFMono-Regular, Consolas, monospace; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.inspect-rule-times { display: flex; flex-direction: column; gap: 4px; padding-top: 7px; border-top: 1px dashed #e7edf3; }
.inspect-time-row { display: flex; flex-wrap: wrap; gap: 3px 8px; color: #334155; font-size: 12px; line-height: 1.5; }
.inspect-time-row b { color: #334155; font-weight: 600; }
.inspect-time-empty { color: #a0a8b5; font-size: 10px; }
.rule-slot-definitions { display: flex; flex-wrap: wrap; gap: 4px; padding-top: 6px; margin-top: 6px; border-top: 1px dotted #edf1f5; }
.rule-slot-definitions span { padding: 2px 4px; background: #f4f7fa; border-radius: 2px; color: #687386; font-family: SFMono-Regular, Consolas, monospace; font-size: 9px; line-height: 1.4; }
.rule-slot-definitions b { color: #3578b8; font-weight: 600; }
.inspect-rule-source, .inspect-slot-source { overflow: hidden; margin-top: 7px; color: #526173; font-family: SFMono-Regular, Consolas, monospace; font-size: 10px; line-height: 1.5; text-overflow: ellipsis; white-space: nowrap; }
.collapse-toggle { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 7px 2px 2px; margin-top: 9px; border: 0; border-top: 1px solid #eef1f5; background: transparent; color: #3578b8; cursor: pointer; font-size: 11px; text-align: left; }
.collapse-toggle:focus { outline: none; }
.unmatched-rule-list, .unmatched-slot-list { padding-top: 8px; }
.inspect-slot-card { position: relative; padding: 10px; border: 1px solid #ffd591; border-left: 3px solid #fa8c16; border-radius: 5px; background: #fffaf0; }
.inspect-slot-card.selected { border-color: #b7eb8f; border-left-color: #52c41a; background: #f6ffed; box-shadow: 0 3px 10px rgba(82, 196, 26, .10); }
.inspect-slot-card.unmatched { border-color: #dbe3ec; border-left-color: #bfc7d2; background: #fbfcfe; opacity: .78; }
.inspect-slot-heading { display: flex; align-items: center; gap: 7px; }
.slot-number { display: inline-flex; align-items: center; justify-content: center; flex: 0 0 auto; width: 27px; height: 27px; border-radius: 50%; background: #fff1db; color: #ad6800; font-size: 13px; font-weight: 700; }
.inspect-slot-card.selected .slot-number { background: #d9f7be; color: #237804; }
.inspect-slot-card.unmatched .slot-number { background: #eef2f6; color: #687386; }
.inspect-slot-heading > div { display: flex; flex: 1; flex-direction: column; min-width: 0; }
.inspect-slot-heading strong { overflow: hidden; color: #1f2937; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.inspect-slot-heading small { color: #8a94a6; font-size: 10px; }
.inspect-slot-heading .ant-tag { margin: 0; }
.inspect-slot-time { display: flex; flex-wrap: wrap; gap: 4px 9px; padding: 7px 0 5px; margin-top: 7px; border-top: 1px dashed #eadfcf; color: #334155; font-size: 12px; line-height: 1.5; }
.inspect-slot-time b { color: #ad6800; font-family: SFMono-Regular, Consolas, monospace; font-weight: 500; }
.selected .inspect-slot-time b { color: #389e0d; }
.inspect-slot-rules { display: flex; flex-wrap: wrap; align-items: baseline; gap: 3px 5px; color: #334155; font-size: 11px; line-height: 1.6; }
.inspect-slot-rules b { color: #64748b; font-weight: 600; }
.inspect-slot-rules span { padding: 1px 5px; background: rgba(255, 255, 255, .7); border-radius: 2px; color: #526173; }
.column-empty { padding: 12px 0; }
.code-rule-section { padding-top: 11px; margin-top: 11px; border-top: 1px solid #dfe7ef; }
.code-rule-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
.code-rule-heading > div { display: flex; flex-direction: column; gap: 3px; }
.code-rule-heading strong { color: #1f2937; font-size: 14px; }
.code-rule-heading span { color: #526173; font-size: 11px; }
.code-rule-heading .ant-tag { margin: 0; }
.code-rule-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; }
.code-rule-card { padding: 8px 9px; border: 1px solid #d8e0e8; border-left: 3px solid #aab7c4; border-radius: 4px; background: #f8fafc; }
.code-rule-card.applied { border-color: #b7eb8f; border-left-color: #52c41a; background: #fafff5; }
.code-rule-title { display: flex; align-items: center; gap: 5px; min-width: 0; }
.code-rule-title strong { overflow: hidden; flex: 1; color: #1f2937; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.code-rule-title .ant-tag { margin: 0; font-size: 11px; }
.code-rule-dot { flex: 0 0 auto; width: 7px; height: 7px; border-radius: 50%; background: #aab7c4; }
.applied .code-rule-dot { background: #52c41a; }
.code-rule-description, .code-rule-detail, .code-rule-source { color: #334155; font-size: 11px; line-height: 1.5; }
.code-rule-description { margin-top: 4px; }
.code-rule-detail { margin-top: 2px; }
.code-rule-detail b, .code-rule-source b { display: inline-block; min-width: 32px; color: #526173; font-weight: 600; }
.code-rule-source { margin-top: 4px; color: #526173; font-family: SFMono-Regular, Consolas, monospace; }
.rule-heading-actions { display: flex; align-items: center; gap: 7px; }
.rule-heading-actions .ant-tag { margin: 0; }
.flowchart-intro { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 9px 12px; margin-bottom: 10px; background: #f7f9fc; border: 1px solid #e6ebf1; border-radius: 4px; color: #334155; font-size: 12px; line-height: 1.5; }
.flowchart-legend { display: flex; align-items: center; gap: 5px; white-space: nowrap; }
.flow-dot { display: inline-block; width: 8px; height: 8px; margin-left: 6px; border-radius: 50%; }
.flow-dot:first-child { margin-left: 0; }
.flow-dot.yes { background: #52c41a; }
.flow-dot.no { background: #bfc7d2; }
.flow-dot.final { background: #1890ff; }
.flowchart-canvas { display: flex; flex-direction: column; align-items: center; max-height: calc(100vh - 310px); padding: 17px 12px 24px; overflow: auto; background: #fffaf4; border: 1px solid #f0e5d7; border-radius: 5px; }
.flowchart-node-row { display: flex; justify-content: center; width: 100%; min-width: 620px; }
.flowchart-rect { display: flex; flex-direction: column; align-items: center; gap: 4px; width: 410px; padding: 13px 22px; background: #fff; border: 1px solid #d9a27f; border-radius: 2px; color: #334155; text-align: center; }
.flowchart-rect.start { background: #f8fbff; border-color: #7ab9e8; }
.flowchart-rect.final { background: #f6ffed; border-color: #7acb48; box-shadow: 0 3px 9px rgba(82, 196, 26, .12); }
.flowchart-rect.no { background: #f7f8fa; border-color: #bfc7d2; }
.flowchart-rect strong { color: #1f2937; font-size: 15px; }
.flowchart-rect small { color: #334155; font-size: 12px; line-height: 1.5; }
.flowchart-node-type { color: #8b5e45; font-size: 10px; font-weight: 700; letter-spacing: .08em; }
.flowchart-config { max-width: 100%; padding: 3px 7px; background: #fff7e6; border-radius: 2px; color: #ad6800; font-family: SFMono-Regular, Consolas, monospace; font-size: 11px; line-height: 1.4; overflow-wrap: anywhere; }
.flowchart-connector { position: relative; width: 2px; height: 35px; background: #d99a72; }
.flowchart-connector::after { content: ''; position: absolute; bottom: -1px; left: 50%; width: 8px; height: 8px; transform: translateX(-50%) rotate(45deg); border-right: 2px solid #c77c55; border-bottom: 2px solid #c77c55; background: #fffaf4; }
.flowchart-connector > span { position: absolute; z-index: 1; top: 9px; left: 10px; padding: 1px 5px; background: #fffaf4; color: #a85d35; font-size: 11px; white-space: nowrap; }
.flowchart-connector .edge-no { color: #7a8699; }
.flowchart-diamond { display: flex; align-items: center; justify-content: center; width: 470px; min-height: 150px; padding: 2px; background: #d99a72; clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%); }
.flowchart-diamond-content { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; width: 100%; min-height: 146px; padding: 23px 75px; background: #fffdf9; clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%); text-align: center; }
.flowchart-diamond.yes { background: #7acb48; }
.flowchart-diamond.no { background: #bfc7d2; }
.flowchart-diamond.final { background: #52c41a; }
.flowchart-diamond strong { max-width: 285px; overflow: hidden; color: #1f2937; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.flowchart-diamond small { max-width: 300px; overflow: hidden; color: #334155; font-size: 11px; line-height: 1.4; text-overflow: ellipsis; white-space: nowrap; }
.flowchart-diamond .ant-tag { margin: 1px 0 0; }
.details-toggle { display: flex; justify-content: center; margin-top: 12px; border-top: 1px solid #eef1f5; }
.details-toggle .ant-btn { color: #3578b8; }
.all-rules-panel { padding-top: 4px; overflow-x: auto; }
.rule-table { min-width: 1200px; margin-top: 8px; }
.slot-panel { padding: 4px 12px 12px; background: #fafafa; }
.rule-provenance { display: flex; flex-direction: column; gap: 5px; padding: 10px 12px; margin-bottom: 12px; background: #f4f8fc; border: 1px solid #dbe9f6; border-radius: 3px; color: #526173; font-size: 12px; line-height: 1.6; }
.rule-provenance strong { color: #334155; }
.segment-summary { padding: 10px 12px; margin-bottom: 12px; background: #fff; border: 1px solid #e8edf3; border-radius: 3px; }
.segment-line { display: flex; flex-wrap: wrap; gap: 4px 14px; padding: 6px 0; border-top: 1px solid #f0f2f5; color: #687386; font-size: 12px; line-height: 1.6; }
.segment-line:first-of-type { border-top: 0; }
.segment-line strong { color: #334155; }
.slot-panel-title { margin-bottom: 10px; color: #595959; font-weight: 600; }
.rule-name { font-weight: 600; }
.cell-desc { margin-top: 3px; }
.error-text { margin-top: 3px; color: #f5222d; font-size: 12px; }
@media (max-width: 1100px) {
  .verdict-bar, .event-summary { align-items: flex-start; flex-direction: column; }
  .verdict-summary, .event-summary-meta { justify-content: flex-start; }
  .flow-board { grid-template-columns: 220px 36px 300px 42px 320px; }
  .decision-flow { padding-right: 6px; padding-left: 6px; }
  .decision-flow-rule-node { flex-basis: 180px; }
  .decision-flow-slot-node { flex-basis: 220px; }
  .decision-slot-arrow { flex-basis: 54px; }
  .inspection-layout { grid-template-columns: 200px minmax(330px, 1fr) minmax(330px, 1fr); }
}
@media (max-width: 800px) {
  .inspection-layout { grid-template-columns: 1fr; }
  .person-event-card { max-width: none; }
  .rules-panel::before, .slots-panel::before { display: none; }
  .flowchart-intro { align-items: flex-start; flex-direction: column; }
  .flowchart-node-row { min-width: 0; }
  .flowchart-rect { width: 410px; max-width: 100%; }
  .flowchart-diamond { width: 470px; max-width: 100%; }
  .flowchart-diamond-content { padding-right: 50px; padding-left: 50px; }
}
</style>

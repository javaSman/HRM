<template>
  <j-modal
    class="recruitment-flow-modal"
    :title="title"
    :width="1100"
    :visible="visible"
    switchFullscreen
    :bodyStyle="bodyStyle"
    @cancel="close"
  >
    <template v-if="actionType === 'detail'">
      <a-tabs :activeKey="activeTab" :animated="false" @change="activeTab = $event">
        <a-tab-pane key="overview" tab="面试概览">
          <a-row :gutter="12" class="status-overview">
            <a-col :xs="24" :sm="8">
              <div class="info-item status-card">
                <span class="info-label">面试状态</span>
                <span class="info-value"><a-tag :color="getStatusColor(record.mszt)">{{ getStatusText(record.mszt) }}</a-tag></span>
              </div>
            </a-col>
            <a-col :xs="24" :sm="8">
              <div class="info-item status-card"><span class="info-label">Offer 状态</span><span class="info-value">{{ formatValue(record.offerzt) }}</span></div>
            </a-col>
            <a-col :xs="24" :sm="8">
              <div class="info-item status-card"><span class="info-label">入职状态</span><span class="info-value">{{ formatValue(record.rzzt) }}</span></div>
            </a-col>
          </a-row>
          <a-row :gutter="20">
            <a-col :xs="24" :md="12">
              <section class="overview-section">
                <div class="detail-section-title">候选人信息</div>
                <div class="info-grid two-column-grid">
                  <div class="info-item"><span class="info-label">姓名</span><span class="info-value">{{ formatValue(record.xm) }}</span></div>
                  <div class="info-item"><span class="info-label">性别</span><span class="info-value">{{ formatValue(record.xb) }}</span></div>
                  <div class="info-item"><span class="info-label">学历</span><span class="info-value">{{ formatValue(record.xl) }}</span></div>
                  <div class="info-item"><span class="info-label">手机号</span><span class="info-value">{{ formatValue(record.sjh) }}</span></div>
                  <div class="info-item"><span class="info-label">所属部门</span><span class="info-value">{{ formatValue(record.dept_dictText || record.deptPath) }}</span></div>
                  <div class="info-item"><span class="info-label">岗位名称</span><span class="info-value">{{ formatValue(record.postId_dictText || record.postId) }}</span></div>
                  <div class="info-item"><span class="info-label">职级名称</span><span class="info-value">{{ formatValue(record.levelId_dictText || record.levelId) }}</span></div>
                <div class="info-item full-width-item flex justify-center flex-col gap-10">
                  <div class="flex justify-center">关联简历：{{ record.xm }}-{{record.postId_dictText}}简历</div>
                  <div class="flex justify-center">
                    <a-button type="primary" size="small" icon="eye" @click="lookPdf(record.gljl)">查看简历</a-button>
                  </div>
                </div>
                </div>
              </section>
            </a-col>
            <a-col :xs="24" :md="12">
              <section class="overview-section">
                <div class="detail-section-title">面试安排</div>
                <div class="info-grid two-column-grid">
                  <div class="info-item"><span class="info-label">邀约人</span><span class="info-value">{{ formatValue(record.yyr) }}</span></div>
                  <div class="info-item"><span class="info-label">邀约时间</span><span class="info-value">{{ formatValue(record.yysj) }}</span></div>
                  <div class="info-item"><span class="info-label">预计面试时间</span><span class="info-value">{{ formatValue(record.yjmssj) }}</span></div>
                  <div class="info-item"><span class="info-label">实际面试时间</span><span class="info-value">{{ formatValue(record.sjmssj) }}</span></div>
                  <div class="info-item"><span class="info-label">面试官</span><span class="info-value">{{ formatValue(record.msg) }}</span></div>
                  <div class="info-item"><span class="info-label">面试形式</span><span class="info-value">{{ formatValue(record.msfs) }}</span></div>
                  <div class="info-item"><span class="info-label">面试地点</span><span class="info-value">{{ formatValue(record.msdd) }}</span></div>
                  <div class="info-item"><span class="info-label">面试轮次</span><span class="info-value">{{ formatValue(record.mslc) }}</span></div>
                  <div class="info-item"><span class="info-label">拒绝原因</span><span class="info-value">{{ formatValue(record.ttyy) }}</span></div>
                </div>
              </section>
            </a-col>
            <a-col :xs="24" :md="24">
              <section class="overview-section">
                <div class="detail-section-title">面试备注</div>
                <div class="info-grid">
                  <div class="info-item full-width-item">
                    <span class="info-label">初试备注</span>
                    <span class="info-value remark-value">{{ formatValue(record.remark) }}</span>
                  </div>
                </div>
              </section>
            </a-col>
          </a-row>
        </a-tab-pane>
        <a-tab-pane key="record" tab="面试记录">
          <a-table
            size="small"
            rowKey="id"
            :columns="interviewRecordColumns"
            :dataSource="interviewRecordList"
            :pagination="false"
            :scroll="{ x: 830 }"
            :locale="{ emptyText: '暂无面试记录' }"
          >
            <span slot="recordValue" slot-scope="text">
              {{ formatValue(text) }}
            </span>
            <span slot="recordValue2" slot-scope="text,item" class="flex flex-col">
           <div>面试官评语：{{ formatValue(text) }}</div>
             <div v-if="item.sftg === '不通过'">
              人事评语：{{record.ttyy}}
             </div>
            </span>
            <span slot="recordStatus" slot-scope="text"><a-tag :color="getStatusColor(text)">{{ getStatusText(text) }}</a-tag></span>
            <span slot="recordResult" slot-scope="text"><a-tag :color="getResultColor(text)">{{ formatValue(text) }}</a-tag></span>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </template>
    <template v-else>
      <a-alert class="candidate-summary" type="info" showIcon :message="summaryText" />
      <a-form-model layout="vertical" :model="form">
        <a-row :gutter="16" v-if="actionType === 'start'">
          <a-col :xs="24" :sm="12"
            ><a-form-model-item label="实际面试时间"
              ><j-date
                v-model="form.sjmssj"
                :show-time="true"
                date-format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择实际面试时间"
                style="width: 100%" /></a-form-model-item
          ></a-col>
          <a-col :xs="24" :sm="12"
            ><a-form-model-item label="面试官"
              ><j-select-employee
                v-model="form.msg"
                placeholder="请选择面试官"
                value-field="name"
                button-text="添加"
                button-icon="plus"
                button-type="default"
                valueField="name"
                @change="(value, rows) => handleSelectValue('msg', value, rows)" /></a-form-model-item
          ></a-col>
          <a-col :xs="24" :sm="12"
            ><a-form-model-item label="面试形式"
              ><j-dict-select-tag
                type="list"
                v-model="form.msfs"
                dictCode="interview"
                placeholder="请选择" /></a-form-model-item
          ></a-col>
          <a-col :xs="24" :sm="12"
            ><a-form-model-item label="面试地点"
              ><a-input v-model.trim="form.msdd" placeholder="请输入面试地点" /></a-form-model-item
          ></a-col>
        </a-row>
        <a-row :gutter="16" v-else-if="actionType === 'deptRetest'">
          <a-col :xs="24" :sm="6"
            ><a-form-model-item label="复试时间"
              ><j-date
                v-model="form.yjmssj"
                :show-time="true"
                date-format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择复试时间"
                style="width: 100%" /></a-form-model-item
          ></a-col>
          <a-col :xs="24" :sm="6"
            ><a-form-model-item label="面试官"
              ><j-select-employee
                v-model="form.msg"
                placeholder="请选择面试官"
                value-field="name"
                button-text="添加"
                button-icon="plus"
                button-type="default"
                valueField="name"
                @change="(value, rows) => handleSelectValue('msg', value, rows)" /></a-form-model-item
          ></a-col>
          <a-col :xs="24" :sm="6"
            ><a-form-model-item label="面试形式"
              ><j-dict-select-tag
                type="list"
                v-model="form.msfs"
                dictCode="interview"
                placeholder="请选择" /></a-form-model-item
          ></a-col>
          <a-col :xs="24" :sm="6"
            ><a-form-model-item label="面试地点"
              ><a-input v-model.trim="form.msdd" placeholder="请输入面试地点" /></a-form-model-item
          ></a-col>
          <a-col :span="24"
            ><a-form-model-item label="安排说明"
              ><a-textarea
                v-model.trim="form.remark"
                :autoSize="{ minRows: 3, maxRows: 5 }"
                placeholder="请输入安排说明" /></a-form-model-item
          ></a-col>
        </a-row>
        <a-row :gutter="16" v-else-if="actionType === 'reschedule'">
          <a-col :xs="24" :sm="6"
            ><a-form-model-item label="原面试时间"
              ><a-input :value="formatValue(record.yjmssj)" disabled /></a-form-model-item
          ></a-col>
          <a-col :xs="24" :sm="6"
            ><a-form-model-item label="改期后时间"
              ><j-date
                v-model="form.yjmssj"
                :show-time="true"
                date-format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择改期后时间"
                style="width: 100%" /></a-form-model-item
          ></a-col>
          <!-- <a-col :span="24"
            ><a-form-model-item label="改期原因"
              ><a-textarea
                v-model.trim="form.remark"
                :autoSize="{ minRows: 3, maxRows: 5 }"
                placeholder="请输入改期原因" /></a-form-model-item
          ></a-col> -->
        </a-row>
        <a-row :gutter="16" v-else-if="actionType === 'offer'">
          <a-col :xs="24" :sm="6"
            ><a-form-model-item label="招聘计划ID"
              ><a-input v-model.trim="form.zpjhid" placeholder="请输入招聘计划ID" /></a-form-model-item
          ></a-col>
          <a-col :xs="24" :sm="6"
            ><a-form-model-item label="岗位名称"
              ><a-input v-model.trim="form.postId" placeholder="请输入岗位名称" /></a-form-model-item
          ></a-col>
          <a-col :xs="24" :sm="6"
            ><a-form-model-item label="Offer状态"
              ><a-input v-model.trim="form.offerzt" placeholder="请输入Offer状态" /></a-form-model-item
          ></a-col>
          <a-col :span="24"
            ><a-form-model-item label="Offer说明"
              ><a-textarea
                v-model.trim="form.remark"
                :autoSize="{ minRows: 3, maxRows: 5 }"
                placeholder="请输入Offer说明" /></a-form-model-item
          ></a-col>
        </a-row>
      </a-form-model>
    </template>
    <template slot="footer">
      <a-button v-if="actionType !== 'detail'" type="primary" @click="handleOk">确定</a-button>
      <a-button @click="close">{{ actionType === 'detail' ? '关闭' : '取消' }}</a-button>
    </template>
  </j-modal>
</template>

<script>
const TITLE_MAP = {
  detail: '面试详情',
  start: '开始初试',
  deptRetest: '安排部门复试',
  reschedule: '改期',
  offer: '发起Offer',
}
const INTERVIEW_STATUS_MAP = {
  待开始: { text: '待开始', color: 'orange' },
  进行中: { text: '进行中', color: 'blue' },
  待评审: { text: '待评审', color: 'orange' },
  已完成: { text: '已完成', color: 'green' },
  待面试: { text: '待面试', color: 'orange' },
  面试中: { text: '面试中', color: 'blue' },
  面试通过: { text: '面试通过', color: 'green' },
  已淘汰: { text: '已淘汰', color: 'red' },
  已发offer: { text: '已发offer', color: 'cyan' }
}
const INTERVIEW_RECORD_COLUMNS = [
  { align:'center', title: '面试轮次', dataIndex: 'mslc', width: 100, scopedSlots: { customRender: 'recordValue' } },
  { align:'center', title: '时间', dataIndex: 'updateTime', width: 160, scopedSlots: { customRender: 'recordValue' } },
  { align:'center', title: '面试官', dataIndex: 'msg', width: 120, scopedSlots: { customRender: 'recordValue' } },
  { align:'center', title: '面试状态', dataIndex: 'mszt', width: 110, scopedSlots: { customRender: 'recordStatus' } },
  { align:'center', title: '通过/不通过', dataIndex: 'sftg', width: 120, scopedSlots: { customRender: 'recordResult' } },
  { align:'center', title: '评语', dataIndex: 'py', width: 220, scopedSlots: { customRender: 'recordValue2' } }
]

export default {
  name: 'InterviewActionModal',
  data() {
    return {
      visible: false,
      actionType: 'detail',
      activeTab: 'overview',
      record: {},
      form: {},
      interviewRecordColumns: INTERVIEW_RECORD_COLUMNS,
      bodyStyle: { maxHeight: 'calc(100vh - 168px)', overflowY: 'auto', padding: '16px 24px 12px' },
    }
  },
  computed: {
    title() {
      return TITLE_MAP[this.actionType] || '面试操作'
    },
    summaryText() {
      return (
        [this.record.xm, this.record.sjh, this.record.postId, this.record.mszt].filter(Boolean).join(' / ') || '面试信息'
      )
    },
    interviewRecordList() {
      return [this.record.msjlFirst, this.record.msjlSecond, this.record.msjlEnd].filter(Boolean)
    }
  },
  methods: {
     lookPdf(text) {
      console.log(text)
      this.$store.dispatch('openPdf', text)
    },
    open(type, record) {
      this.actionType = type || 'detail'
      this.record = Object.assign({}, record || {})
      this.form = Object.assign({}, this.record)
      this.activeTab = 'overview'
      this.visible = true
    },
    close() {
      this.visible = false
    },
    handleSelectValue(field, value, rows) {
      this.form[field] =
        (rows || [])
          .map((item) => item.name)
          .filter(Boolean)
          .join(',') ||
        value ||
        ''
    },
    handleOk() {
      this.$emit('ok', { type: this.actionType, record: this.record, form: this.form })
      this.close()
    },
    formatValue(value) {
      return value === undefined || value === null || value === '' ? '-' : value
    },
    getStatusText(status) {
      return INTERVIEW_STATUS_MAP[status] ? INTERVIEW_STATUS_MAP[status].text : this.formatValue(status)
    },
    getStatusColor(status) {
      return INTERVIEW_STATUS_MAP[status] ? INTERVIEW_STATUS_MAP[status].color : ''
    },
    getResultColor(result) {
      if (result === '通过') return 'green'
      if (result === '不通过') return 'red'
      return ''
    }
  }
}
</script>

<style scoped lang="less">
// .recruitment-flow-modal{
//   z-index: 1!important;
// }
.detail-section-title {
  margin-bottom: 12px;
  padding-left: 10px;
  border-left: 3px solid #1890ff;
  color: #1a5fb4;
  font-size: 14px;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.info-item {
  min-height: 48px;
  padding: 9px 12px;
  border-radius: 4px;
  background: #f7f8fa;
}

.info-label {
  display: block;
  margin-bottom: 4px;
  color: #8c8c8c;
  font-size: 12px;
}

.info-value {
  color: #262626;
  font-size: 13px;
}

.candidate-summary {
  margin-bottom: 16px;
}

.status-overview {
  margin-bottom: 8px;
}

.status-card {
  margin-bottom: 12px;
  background: #f5f8ff;
}

.overview-section {
  margin-bottom: 18px;
}

.two-column-grid {
  // grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.full-width-item {
  grid-column: ~'1 / -1';
}

.remark-value {
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 767px) {
  .two-column-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<style lang="less">
@import '../../common/recruitmentModal.less';
</style>

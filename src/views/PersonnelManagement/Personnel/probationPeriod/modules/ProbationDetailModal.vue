<template>
  <div>
    <j-modal
      :title="modalTitle"
      :width="1180"
      :visible="visible"
      switchFullscreen
      :bodyStyle="{ padding: '14px 24px 12px', maxHeight: 'calc(100vh - 190px)', overflow: 'hidden' }"
      :dialogStyle="{ top: '15px' }"
      @cancel="close"
    >
      <a-spin :spinning="loading">
        <div class="probation-detail-shell">
          <div class="probation-employee-summary">
            <div class="probation-employee-main">
              <a-avatar v-if="employeeInitial" :size="60">{{ employeeInitial }}</a-avatar>
              <a-avatar v-else :size="60" icon="user" />
            </div>
            <div class="probation-employee-summary-grid">
              <div
                v-for="item in topSummaryItems"
                :key="item.key"
                class="probation-employee-summary-item"
              >
                <div class="probation-employee-summary-label">{{ item.label }}</div>
                <div
                  class="probation-employee-summary-value"
                  :title="formatValue(item.value)"
                >
                  <a-tag v-if="item.key === 'status'" color="blue" class="probation-status-tag">
                    {{ formatValue(item.value) }}
                  </a-tag>
                  <template v-else>{{ formatValue(item.value) }}</template>
                </div>
              </div>
            </div>
          </div>

          <a-tabs
            :activeKey="activeTab"
            :animated="false"
            class="probation-detail-tabs"
            @change="activeTab = $event"
          >
            <a-tab-pane key="basic" tab="基本信息">
              <div class="probation-detail-scroll">
                <section class="probation-detail-section">
                  <div class="probation-detail-section-header">
                    <div class="probation-detail-section-title">
                      <a-icon type="user" />
                      <span>个人及工作信息</span>
                    </div>
                  </div>
                  <div class="probation-detail-info-grid">
                    <div
                      v-for="item in basicItems"
                      :key="item.label"
                      class="probation-detail-info-item"
                    >
                      <div class="probation-detail-info-label">{{ item.label }}</div>
                      <div class="probation-detail-info-value" :title="formatValue(item.value)">
                        {{ formatValue(item.value) }}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </a-tab-pane>

            <a-tab-pane key="education" tab="教育经历">
              <div class="probation-detail-scroll">
                <section class="probation-detail-section">
                  <div class="probation-detail-section-header">
                    <div class="probation-detail-section-title">
                      <a-icon type="read" />
                      <span>教育经历</span>
                    </div>
                  </div>
                  <div class="probation-detail-table-wrap">
                    <a-table
                      size="middle"
                      rowKey="id"
                      :columns="educationColumns"
                      :dataSource="educationList"
                      :pagination="false"
                      :locale="tableLocale"
                      :scroll="{ x: 1100 }"
                      class="probation-detail-table"
                    >
                      <template slot="file" slot-scope="text">
                        <a-button
                          v-if="text"
                          ghost
                          type="primary"
                          size="small"
                          class="probation-file-button"
                          @click="previewFiles(text)"
                        >
                          查看
                        </a-button>
                        <span v-else class="probation-empty-value">无文件</span>
                      </template>
                    </a-table>
                  </div>
                </section>
              </div>
            </a-tab-pane>

            <a-tab-pane key="work" tab="工作履历">
              <div class="probation-detail-scroll">
                <section class="probation-detail-section">
                  <div class="probation-detail-section-header">
                    <div class="probation-detail-section-title">
                      <a-icon type="solution" />
                      <span>工作履历</span>
                    </div>
                  </div>
                  <div class="probation-detail-table-wrap">
                    <a-table
                      size="middle"
                      rowKey="id"
                      :columns="workColumns"
                      :dataSource="workList"
                      :pagination="false"
                      :locale="tableLocale"
                      :scroll="{ x: 1050 }"
                      class="probation-detail-table"
                    />
                  </div>
                </section>
              </div>
            </a-tab-pane>

            <a-tab-pane key="family" tab="家庭成员">
              <div class="probation-detail-scroll">
                <section class="probation-detail-section">
                  <div class="probation-detail-section-header">
                    <div class="probation-detail-section-title">
                      <a-icon type="team" />
                      <span>家庭成员</span>
                    </div>
                  </div>
                  <div class="probation-detail-table-wrap">
                    <a-table
                      size="middle"
                      rowKey="id"
                      :columns="familyColumns"
                      :dataSource="familyList"
                      :pagination="false"
                      :locale="tableLocale"
                      class="probation-detail-table"
                    />
                  </div>
                </section>
              </div>
            </a-tab-pane>

            <a-tab-pane key="files" tab="个人附件">
              <div class="probation-detail-scroll">
                <section class="probation-detail-section">
                  <div class="probation-detail-section-header">
                    <div class="probation-detail-section-title">
                      <a-icon type="profile" />
                      <span>个人附件</span>
                    </div>
                  </div>
                  <div class="probation-detail-table-wrap">
                    <a-table
                      size="middle"
                      rowKey="id"
                      :columns="fileColumns"
                      :dataSource="fileList"
                      :pagination="false"
                      :locale="tableLocale"
                      :scroll="{ x: 800 }"
                      class="probation-detail-table"
                    >
                      <template slot="file" slot-scope="text">
                        <a-button
                          v-if="text"
                          ghost
                          type="primary"
                          size="small"
                          class="probation-file-button"
                          @click="previewFiles(text)"
                        >
                          查看
                        </a-button>
                        <span v-else class="probation-empty-value">无文件</span>
                      </template>
                    </a-table>
                  </div>
                </section>
              </div>
            </a-tab-pane>

            <a-tab-pane key="relation" tab="关系申报">
              <div class="probation-detail-scroll">
                <section class="probation-detail-section">
                  <div class="probation-detail-section-header">
                    <div class="probation-detail-section-title">
                      <a-icon type="cluster" />
                      <span>关系申报</span>
                    </div>
                  </div>
                  <div class="probation-detail-table-wrap">
                    <a-table
                      size="middle"
                      rowKey="id"
                      :columns="relationColumns"
                      :dataSource="relationList"
                      :pagination="false"
                      :locale="tableLocale"
                      class="probation-detail-table"
                    />
                  </div>
                </section>
              </div>
            </a-tab-pane>

            <a-tab-pane key="interview" tab="访谈经历">
              <div class="probation-detail-scroll">
                <section class="probation-detail-section">
                  <div class="probation-detail-section-header">
                    <div class="probation-detail-section-title">
                      <a-icon type="message" />
                      <span>访谈经历</span>
                    </div>
                  </div>
                  <div class="probation-detail-table-wrap">
                    <a-table
                      size="middle"
                      :rowKey="interviewRowKey"
                      :columns="interviewColumns"
                      :dataSource="interviewList"
                      :pagination="false"
                      :locale="tableLocale"
                      class="probation-detail-table"
                    >
                      <template slot="action" slot-scope="text, record">
                        <a-button type="link" size="small" @click="openInterviewDetail(record)">详情</a-button>
                      </template>
                    </a-table>
                  </div>
                </section>
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>
      </a-spin>

      <template slot="footer">
        <a-button @click="close">关闭</a-button>
      </template>
    </j-modal>

    <j-modal
      title="访谈详情"
      :width="1000"
      :visible="interviewVisible"
      :bodyStyle="{ padding: '14px 24px 12px' }"
      @cancel="closeInterviewDetail"
    >
      <div class="probation-interview-detail">
        <section class="probation-detail-section">
          <div class="probation-detail-section-header">
            <div class="probation-detail-section-title">
              <a-icon type="message" />
              <span>访谈信息</span>
            </div>
          </div>
          <div class="probation-detail-info-grid probation-interview-info-grid">
            <div class="probation-detail-info-item">
              <div class="probation-detail-info-label">访谈日期</div>
              <div class="probation-detail-info-value">{{ formatValue(currentInterview.ftrq) }}</div>
            </div>
            <div class="probation-detail-info-item">
              <div class="probation-detail-info-label">访谈类型</div>
              <div class="probation-detail-info-value">{{ formatValue(currentInterview.ftlx) }}</div>
            </div>
            <div class="probation-detail-info-item">
              <div class="probation-detail-info-label">创建人</div>
              <div class="probation-detail-info-value">{{ formatValue(currentInterview.createBy) }}</div>
            </div>
          </div>
        </section>

        <section class="probation-detail-section">
          <div class="probation-detail-section-header">
            <div class="probation-detail-section-title">
              <a-icon type="profile" />
              <span>问题回答</span>
            </div>
          </div>
          <div class="probation-detail-table-wrap">
            <a-table
              size="middle"
              rowKey="id"
              :columns="interviewDetailColumns"
              :dataSource="currentInterviewQuestions"
              :pagination="false"
              :locale="tableLocale"
              :scroll="{ x: 900 }"
              class="probation-detail-table"
            />
          </div>
        </section>
      </div>
      <template slot="footer">
        <a-button @click="closeInterviewDetail">关闭</a-button>
      </template>
    </j-modal>
  </div>
</template>

<script>
import { postAction, getFileAccessHttpUrl } from '@/api/manage'

function formatValue(value) {
  return value === undefined || value === null || value === '' ? '-' : value
}

function tableColumn(title, dataIndex, width) {
  return {
    title,
    dataIndex,
    width,
    align: 'center',
    customRender: formatValue
  }
}

export default {
  name: 'ProbationDetailModal',
  data() {
    return {
      visible: false,
      loading: false,
      activeTab: 'basic',
      detail: {},
      interviewVisible: false,
      currentInterview: {},
      tableLocale: { emptyText: '暂无数据' },
      educationColumns: [
        tableColumn('学历层次', 'xlcc', 120),
        tableColumn('毕业院校/机构', 'byyxjg', 180),
        tableColumn('专业', 'zy', 140),
        tableColumn('入学时间', 'rxsj', 120),
        tableColumn('毕业时间', 'bysj', 120),
        tableColumn('学位', 'xw', 100),
        tableColumn('证书编号', 'zsbh', 160),
        { title: '证书附件', dataIndex: 'zsfj', width: 110, align: 'center', scopedSlots: { customRender: 'file' } }
      ],
      workColumns: [
        tableColumn('工作单位', 'gzdw', 180),
        tableColumn('所属行业', 'sshy', 130),
        tableColumn('任职岗位', 'rzgw', 140),
        tableColumn('在职开始时间', 'zzqssj', 130),
        tableColumn('在职结束时间', 'zzjssj', 130),
        tableColumn('离职原因', 'lzyy', 200),
        tableColumn('证明人', 'zmrxm', 100),
        tableColumn('联系电话', 'zmrlxdh', 140)
      ],
      familyColumns: [
        tableColumn('姓名', 'xm', 130),
        tableColumn('关系', 'gx', 120),
        tableColumn('职务', 'zw', 150),
        tableColumn('工作单位', 'gzdw', 220),
        tableColumn('联系电话', 'lxdh', 160)
      ],
      fileColumns: [
        tableColumn('证件类型', 'fjlx', 140),
        tableColumn('取得日期', 'qdrq', 130),
        tableColumn('有效期截止日', 'yxqjzr', 140),
        tableColumn('证书编号', 'zsbm', 180),
        { title: '证书附件', dataIndex: 'zsfj', width: 120, align: 'center', scopedSlots: { customRender: 'file' } }
      ],
      relationColumns: [
        tableColumn('姓名', 'xm', 140),
        tableColumn('关系', 'gx', 120),
        tableColumn('部门', 'bm', 180),
        tableColumn('岗位', 'gw', 180),
        tableColumn('联系电话', 'lxdh', 160)
      ],
      interviewColumns: [
        tableColumn('访谈日期', 'ftrq', 150),
        tableColumn('访谈类型', 'ftlx', 240),
        tableColumn('创建人', 'createBy', 150),
        { title: '操作', dataIndex: 'action', width: 100, align: 'center', scopedSlots: { customRender: 'action' } }
      ],
      interviewDetailColumns: [
        { title: '序号', width: 70, align: 'center', customRender: (text, record, index) => index + 1 },
        tableColumn('问题内容', 'wtnr', 260),
        tableColumn('访谈情况', 'ftqk', 280),
        tableColumn('是否有问题', 'sfywt', 120),
        tableColumn('跟进人', 'gjr', 170)
      ],
      url: {
        detail: '/ryManage/hrmSyqgz/queryByNo'
      }
    }
  },
  computed: {
    modalTitle() {
      return `试用期员工详情 - ${formatValue(this.detail.xm)}`
    },
    basicInfo() {
      return this.detail.jbxx || {}
    },
    employeeInitial() {
      const name = String(this.detail.xm || '').trim()
      return name ? name.charAt(0) : ''
    },
    topSummaryItems() {
      return [
        { key: 'employeeNo', label: '工号', value: this.detail.gh },
        { key: 'company', label: '公司', value: this.detail.companyId_dictText || this.detail.companyId },
        { key: 'department', label: '所属部门', value: this.detail.dept_dictText || this.detail.dept },
        { key: 'position', label: '岗位名称', value: this.detail.postId_dictText || this.detail.postId },
        { key: 'rank', label: '职级名称', value: this.detail.postRank_dictText || this.detail.postRank },
        { key: 'name', label: '姓名', value: this.detail.xm },
        { key: 'probationStart', label: '试用期开始', value: this.detail.syqkssj },
        { key: 'probationEnd', label: '试用期结束', value: this.detail.syqjssj },
        { key: 'regularDate', label: '计划转正日期', value: this.basicInfo.sjzzrq },
        { key: 'status', label: '状态', value: this.detail.zt }
      ]
    },
    basicItems() {
      const info = this.basicInfo
      return [
        { label: '姓名', value: info.name },
        { label: '性别', value: info.gender },
        { label: '出生日期', value: info.birthDate },
        { label: '身份证号', value: info.idCard },
        { label: '手机号', value: info.phoneNumber },
        { label: '邮箱', value: info.email },
        { label: '民族', value: info.mz },
        { label: '籍贯', value: info.jg },
        { label: '居住地', value: info.jzd },
        { label: '健康状况', value: info.jkzk },
        { label: '政治面貌', value: info.zzmm },
        { label: '婚姻状况', value: info.hyzk },
        { label: '户籍性质', value: info.hjxz },
        { label: '户籍地址', value: info.hjdz },
        { label: '入职日期', value: info.entryDate },
        { label: '员工类型', value: info.employeeType },
        { label: '合同类型', value: info.constractType },
        { label: '工作地点', value: info.workLocation }
      ]
    },
    educationList() {
      return Array.isArray(this.detail.jyjl) ? this.detail.jyjl : []
    },
    workList() {
      return Array.isArray(this.detail.gzll) ? this.detail.gzll : []
    },
    familyList() {
      return Array.isArray(this.detail.jtcy) ? this.detail.jtcy : []
    },
    fileList() {
      return Array.isArray(this.detail.grfj) ? this.detail.grfj : []
    },
    relationList() {
      return Array.isArray(this.detail.gxsb) ? this.detail.gxsb : []
    },
    interviewList() {
      return Array.isArray(this.detail.ftjl) ? this.detail.ftjl : []
    },
    currentInterviewQuestions() {
      return Array.isArray(this.currentInterview.ftList) ? this.currentInterview.ftList : []
    }
  },
  methods: {
    open(record) {
      const employeeNo = record && String(record.gh || '').trim()
      if (!employeeNo) {
        this.$message.warning('当前试用期记录缺少工号，无法加载员工详情')
        return
      }
      this.detail = {}
      this.activeTab = 'basic'
      this.visible = true
      this.loading = true
      postAction(this.url.detail + `?no=${employeeNo}`).then(res => {
        if (!res || !res.success || !res.result || typeof res.result !== 'object' || Array.isArray(res.result)) {
          throw new Error((res && res.message) || '员工详情加载失败')
        }
        if (!res.result.jbxx || typeof res.result.jbxx !== 'object' || Array.isArray(res.result.jbxx)) {
          throw new Error('员工详情数据不完整，缺少基本信息')
        }
        this.detail = res.result
      }).catch(error => {
        this.visible = false
        this.$message.error(error.message || '员工详情加载失败，请稍后重试')
      }).finally(() => {
        this.loading = false
      })
    },
    close() {
      this.visible = false
      this.closeInterviewDetail()
    },
    openInterviewDetail(record) {
      this.currentInterview = record || {}
      this.interviewVisible = true
    },
    closeInterviewDetail() {
      this.interviewVisible = false
      this.currentInterview = {}
    },
    previewFiles(fileText) {
      const list = String(fileText)
        .split(',')
        .map(path => path.trim())
        .filter(Boolean)
        .map(path => getFileAccessHttpUrl(path))
      if (list.length === 0) {
        this.$message.warning('当前记录没有可预览的附件')
        return
      }
      this.$store.commit('pdfIsOn', { show: true, list })
    },
    interviewRowKey(record, index) {
      return record.id || `${record.ftrq || 'date'}-${record.ftlx || 'type'}-${index}`
    },
    formatValue
  }
}
</script>

<style scoped lang="less">
@import './probation-dialogs.less';
@import './probation-detail.less';
</style>

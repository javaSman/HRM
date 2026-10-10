<template>
  <div class="my-apply-wrap">
    <!-- 头部 -->
    <div class="ma-header">
      <div class="ma-tabs">
        <div
          v-for="tab in tabList"
          :key="tab.key"
          class="ma-tab"
          :class="{ active: activeTab === tab.key }"
          @click="switchTab(tab.key)">
          {{ tab.label }}
          <span class="ma-tab-badge">{{ counts[tab.key] || 0 }}</span>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="ma-filter-bar">
      <div class="ma-filter-row">
        <div class="ma-filter-item">
          <label>申请类型</label>
          <select v-model="filterForm.type" class="ma-native-select">
            <option value="">全部类型</option>
            <option v-for="t in applyTypeList" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <div class="ma-filter-item">
          <label>日期范围（提交时间）</label>
          <div class="ma-date-range">
            <input v-model="filterForm.dateFrom" type="date" class="ma-native-input" />
            <span>至</span>
            <input v-model="filterForm.dateTo" type="date" class="ma-native-input" />
          </div>
        </div>
        <div class="ma-filter-actions">
          <button class="ma-filter-btn ma-filter-btn-primary" @click="applyFilter">
            <a-icon type="search" /> 查询
          </button>
          <button class="ma-filter-btn ma-filter-btn-reset" @click="resetFilter">
            <a-icon type="reload" /> 重置
          </button>
        </div>
      </div>
    </div>

    <!-- 主内容 -->
    <div class="ma-main">
      <!-- 左侧列表 -->
      <div class="ma-left">
        <a-spin :spinning="loading">
          <div class="ma-card-list" @scroll="handleListScroll">
            <template v-if="list.length">
              <div
                v-for="(item, idx) in list"
                :key="item.id"
                class="ma-card"
                :class="{ active: selectedId === item.id }"
                :style="{ animationDelay: Math.min(idx, 8) * 0.04 + 's' }"
                @click="selectItem(item.id)">
                <div class="ma-card-tag" :class="item.t">{{ item.type }}</div>
                <div class="ma-card-name">{{ item.who }}提交的{{ item.type }}</div>
                <div class="ma-card-meta">
                  <span v-if="deptText(item)"><a-icon type="bank" />{{ deptText(item) }}</span>
                  <span><a-icon type="clock-circle" />{{ item.at || '—' }}</span>
                </div>
                <div class="ma-card-arrow"><a-icon type="right" /></div>
              </div>

              <!-- 滚动分页状态 -->
              <div class="ma-list-footer">
                <template v-if="loadingMore">
                  <a-icon type="loading" /> 加载中...
                </template>
                <template v-else-if="!hasMore">
                  — 没有更多了 —
                </template>
              </div>
            </template>
            <div v-else-if="!loading" class="ma-empty-list">
              <a-icon type="file-text" />
              <span>暂无申请单据</span>
            </div>
          </div>
        </a-spin>
      </div>

      <!-- 右侧详情 -->
      <div class="ma-right">
        <template v-if="selectedItem">
          <template v-if="selectedItem.supported">
            <div class="ma-detail-head">
              <div class="ma-dh-title-row">
                <h2>{{ detailTitle }}</h2>
                <span class="ma-sp" :class="statusMap[selectedItem.s].cls">
                  <a-icon :type="statusMap[selectedItem.s].icon" />
                  {{ statusMap[selectedItem.s].text }}
                </span>
              </div>
            </div>

            <div class="ma-detail-body">
              <div class="ma-detail-left">
                <div class="ma-group">
                  <div class="ma-g-title">申请信息</div>
                  <div class="ma-info-grid">
                    <div
                      v-for="(info, idx) in infoItems"
                      :key="idx"
                      class="ma-info-item"
                      :class="{ full: info.full }">
                      <div class="ma-info-label">{{ info.label }}</div>
                      <div class="ma-info-value">
                        <!-- 附件行：逗号分隔路径，渲染文件名链接，点击走全局 PDF/文件预览（与各模块列表 lookPdf 一致） -->
                        <template v-if="info.type === 'files'">
                          <template v-if="resolveFiles(info.value).length">
                            <a
                              v-for="(f, fIdx) in resolveFiles(info.value)"
                              :key="fIdx"
                              class="ma-info-file"
                              @click="viewFiles(info.value)">
                              <a-icon type="paper-clip" />{{ f.name }}
                            </a>
                          </template>
                        </template>
                        <template v-else>{{ info.value }}</template>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="ma-detail-right">
                <div class="ma-flow-block">
                  <div class="ma-g-title">审批流程</div>
                  <div class="ma-flow-list">
                    <div v-for="(step, sIdx) in selectedItem.flow" :key="sIdx" class="ma-flow-step-row">
                      <div class="ma-flow-dot-col">
                        <div class="ma-flow-dot-icon" :class="step.status">
                          <a-icon :type="flowIconMap[step.status] || 'circle'" />
                        </div>
                      </div>
                      <div class="ma-flow-step-card" :class="step.status">
                        <div class="ma-flow-card-header">
                          <div class="ma-flow-card-title">
                            {{ step.name }}
                            <span
                              v-if="step.tag"
                              class="ma-flow-card-tag"
                              :class="step.tag === '会签' ? 'countersign' : 'or'">{{ step.tag }}</span>
                          </div>
                          <span class="ma-flow-card-badge" :class="flowBadgeMap[step.status].cls">
                            {{ flowBadgeMap[step.status].text }}
                          </span>
                        </div>
                        <div class="ma-flow-person-list">
                          <div v-for="(member, mIdx) in step.members" :key="mIdx" class="ma-flow-person">
                            <div class="ma-flow-tags">
                              <span class="ma-flow-tag ma-flow-tag-name">
                                {{ member.name }}
                              </span>
                            </div>
                            <div class="ma-flow-person-right">
                              <span
                                v-if="member.resultText"
                                class="ma-flow-person-result"
                                :class="member.resultCls">{{ member.resultText }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div v-if="!selectedItem.flow.length" class="ma-flow-empty">暂无审批流程数据</div>
                  </div>
                </div>

                <!-- 操作区 -->
                <div v-if="selectedItem.s === 'pending'" class="ma-action-bar">
                  <div class="ma-readonly-tip">
                    <a-icon type="info-circle" />
                    {{ cancelable(selectedItem) ? '该申请待审批中，可取消' : '该申请待审批中，暂不支持线上取消' }}
                  </div>
                  <div v-if="cancelable(selectedItem)" class="ma-actions">
                    <a-button class="ma-btn-cancel" @click="handleCancel">
                      <a-icon type="stop" /> 取消申请
                    </a-button>
                  </div>
                </div>
                <div v-else class="ma-action-bar">
                  <div class="ma-readonly-tip">
                    <a-icon type="info-circle" />
                    仅查看，不可审批（本单据{{ statusMap[selectedItem.s].text }}）
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- 未注册 / 嵌套对象未就绪 / 详情未做好的申请类型：详情区只显示占位，不放任何操作入口 -->
          <div v-else class="ma-detail-empty">
            <a-icon type="file-exclamation" />
            <span>「{{ selectedItem.type }}」详情暂未接入，敬请期待</span>
          </div>
        </template>
        <div v-else class="ma-detail-empty">
          <a-icon type="file-text" />
          <span>请从左侧选择一条申请查看详情</span>
        </div>
      </div>
    </div>

    <!-- 取消确认弹窗（公共组件，接口差异走 applyTypeRegistry.cancel 描述块） -->
    <apply-cancel-modal
      :visible.sync="cancelVisible"
      :type="selectedItem ? selectedItem.type : ''"
      :item="selectedItem"
      :who="selectedItem ? selectedItem.who : ''"
      @success="onCancelSuccess" />
  </div>
</template>

<script>
import { getUnionList, getUnionSpStatusCount, getHrmOrgTree } from './workbench'
import { getApplyType, DEFAULT_TAG_CLASS, dash, datePart } from './applyTypeRegistry'
import { getFileAccessHttpUrl } from '@/api/manage'
import ApplyCancelModal from './ApplyCancelModal.vue'

// Tab key -> 单据 spStatus（1审批中 2已通过 3已撤回 4已退回）
const TAB_SP_STATUS = { pending: 1, approved: 2, rejected: 4, cancelled: 3 }

// 申请类型下拉选项（值即联合视图 mkname，未注册详情的类型照常可筛选/展示卡片）
const APPLY_TYPE_OPTIONS = ['加班申请', '补卡申请', '外出申请', '请假申请', '移动打卡申请']

export default {
  name: 'WbMyApply',
  components: { ApplyCancelModal },
  data() {
    return {
      activeTab: 'pending',
      selectedId: null,
      cancelVisible: false,
      filterForm: {
        type: '',
        dateFrom: '',
        dateTo: ''
      },
      tabList: [
        { key: 'pending', label: '待审批' },
        { key: 'approved', label: '已通过' },
        { key: 'rejected', label: '已驳回' },
        { key: 'cancelled', label: '已取消' }
      ],
      applyTypeList: APPLY_TYPE_OPTIONS,
      // 列表数据（归一化后的视图模型）
      list: [],
      loading: false,
      loadingMore: false,
      pageNo: 1,
      pageSize: 10,
      total: 0,
      // 各 Tab 角标数量
      counts: { pending: 0, approved: 0, rejected: 0, cancelled: 0 },
      // 部门 ID -> 名称映射（组织树兜底翻译 dept，后端返回 dept_dictText 时优先用后端值）
      deptMap: {},
      // 状态映射
      statusMap: {
        pending: { text: '待审批', cls: 'sp-pending', icon: 'clock-circle' },
        approved: { text: '已通过', cls: 'sp-approved', icon: 'check-circle' },
        rejected: { text: '已驳回', cls: 'sp-rejected', icon: 'close-circle' },
        cancelled: { text: '已取消', cls: 'sp-cancelled', icon: 'stop' }
      },
      // 流程节点图标映射
      flowIconMap: {
        done: 'check',
        current: 'ellipsis',
        pending: 'circle',
        rejected: 'close',
        cc: 'copy',
        cancelled: 'minus-circle'
      },
      // 流程节点徽章映射
      flowBadgeMap: {
        done: { text: '已完成', cls: 'ok' },
        current: { text: '审批中', cls: 'now' },
        pending: { text: '待审批', cls: 'wait' },
        rejected: { text: '已驳回', cls: 'fail' },
        cancelled: { text: '已取消', cls: 'cancel' },
        cc: { text: '已抄送', cls: 'ccd' }
      }
    }
  },
  computed: {
    hasMore() {
      return this.list.length < this.total
    },
    selectedItem() {
      if (!this.selectedId) return null
      return this.list.find(d => d.id === this.selectedId) || null
    },
    detailTitle() {
      if (!this.selectedItem) return ''
      const item = this.selectedItem
      return item.at ? `${item.who}的${item.type} — ${item.at}` : `${item.who}的${item.type}`
    },
    infoItems() {
      const item = this.selectedItem
      if (!item || !item.supported) return []
      return this.buildInfoItems(item)
    }
  },
  created() {
    this.loadCounts()
    this.loadDeptMap()
    this.reload()
  },
  methods: {
    // ==================== 数据加载 ====================

    /** 重置分页并加载第一页 */
    reload() {
      this.pageNo = 1
      this.loadData(true)
    },

    /**
     * 加载列表
     * @param {Boolean} reset true=首页替换，false=滚动追加
     */
    loadData(reset) {
      if (reset) {
        this.loading = true
      } else {
        if (this.loadingMore || !this.hasMore) return
        this.loadingMore = true
      }
      const params = {
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        spstatus: TAB_SP_STATUS[this.activeTab]
      }
      if (this.filterForm.type) params.mkname = this.filterForm.type
      if (this.filterForm.dateFrom) params.createtime_begin = this.filterForm.dateFrom + ' 00:00:00'
      if (this.filterForm.dateTo) params.createtime_end = this.filterForm.dateTo + ' 23:59:59'

      getUnionList(params).then((res) => {
        if (res && res.success && res.result) {
          const records = res.result.records || []
          const normalized = records.map(r => this.normalizeCard(r, this.activeTab))
          this.list = reset ? normalized : this.list.concat(normalized)
          this.total = res.result.total || 0
          if (reset) {
            this.selectedId = null
            this.$nextTick(() => this.selectFirst())
          }
        } else {
          if (reset) this.list = []
          this.$message.warning((res && res.message) || '查询失败')
        }
      }).catch(() => {
        if (reset) this.list = []
      }).finally(() => {
        this.loading = false
        this.loadingMore = false
      })
    },

    /** 加载各状态角标数量 */
    loadCounts() {
      getUnionSpStatusCount().then((res) => {
        const result = (res && res.success && res.result) || []
        const counts = { pending: 0, approved: 0, rejected: 0, cancelled: 0 }
        if (Array.isArray(result)) {
          result.forEach((row) => {
            const tab = this.findTabKeyBySpStatus(row.spStatus)
            if (tab) counts[tab] = row.total
          })
        }
        this.counts = counts
      }).catch(() => {
        // 角标失败不阻塞页面
      })
    },

    findTabKeyBySpStatus(spStatus) {
      return Object.keys(TAB_SP_STATUS).find(k => TAB_SP_STATUS[k] === Number(spStatus))
    },

    /** 加载组织架构树并扁平化为 部门ID -> 名称 映射，仅用于 dept 字段兜底翻译 */
    loadDeptMap() {
      getHrmOrgTree('0').then((res) => {
        if (!res || !res.success || !Array.isArray(res.result)) return
        const map = {}
        const walk = (nodes) => {
          nodes.forEach((n) => {
            if (n && n.id) map[n.id] = n.name
            if (n && Array.isArray(n.children) && n.children.length) walk(n.children)
          })
        }
        walk(res.result)
        this.deptMap = map
      }).catch(() => {
        // 组织树加载失败时部门段隐藏，不影响主流程
      })
    },

    /** 部门名称：优先后端字典翻译 dept_dictText，其次组织树映射 */
    resolveDept(nested) {
      if (!nested) return ''
      return nested.dept_dictText || nested.deptDictText || this.deptMap[nested.dept] || ''
    },

    /** 卡片部门展示 */
    deptText(item) {
      return this.resolveDept(item.nested)
    },

    /**
     * 附件字段（逗号分隔的相对路径，JUploadList 存储格式）-> 文件名列表
     * @returns {Array<{url:String, name:String}>}
     */
    resolveFiles(v) {
      if (!v) return []
      return String(v).split(',').map(s => s.trim()).filter(Boolean).map((url) => {
        let name = url
        try {
          // 取最后一段路径并去掉 query，再做一次 decode（中文文件名通常被编码）
          name = decodeURIComponent(url.split('?')[0].split('/').pop())
        } catch (e) {
          name = url.split('?')[0].split('/').pop()
        }
        return { url, name }
      })
    },

    /** 点击附件：转可访问 URL 后交给全局文件/PDF 预览器（与 JeecgListMixin.lookPdf 同一套机制） */
    viewFiles(raw) {
      const list = this.resolveFiles(raw).map(f => getFileAccessHttpUrl(f.url))
      if (!list.length) {
        this.$message.warning('未知的文件')
        return
      }
      this.$store.commit('pdfIsOn', { show: true, list })
    },

    // ==================== 归一化 ====================

    /**
     * 联合视图记录 -> 卡片/详情视图模型
     * 类型差异（嵌套 key、标签色、时间兜底字段）全部走 applyTypeRegistry，
     * 未注册或后端尚未返回嵌套对象的类型 supported=false，详情显示「暂未接入」
     */
    normalizeCard(record, fallbackStatus) {
      const type = record.mkname || '未知类型'
      const conf = getApplyType(type)
      const nested = conf ? record[conf.nestedKey] || null : null
      // detailReady === false：取消接口已接但详情字段未做好，详情区只走占位（占位区不提供取消入口）
      const supported = !!(conf && nested && conf.detailReady !== false)
      // 仅详情就绪时信任嵌套对象的 spStatus；其余类型（含 detailReady:false）状态以所在 Tab 为准，
      // 避免人事/访客模块的 zt 中文状态被误判成 pending
      const spStatus = supported ? Number(nested.spStatus) : TAB_SP_STATUS[fallbackStatus]
      // 姓名优先取嵌套对象，其次联合视图顶层 name，最后降级为「工号xxx」
      const who = (nested && nested.name) || record.name || (record.no ? '工号' + record.no : '')
      const item = {
        id: record.id,
        raw: record,
        type,
        t: conf ? conf.tagClass : DEFAULT_TAG_CLASS,
        who,
        at: record.createtime || '',
        s: this.statusKeyBySpStatus(spStatus),
        supported,
        nested,
        flow: []
      }
      if (supported) {
        // 审批流程仅取节点列表 customProcessSqdSpjdList（节点自带 spStatus/sprName/approvalRule）
        item.flow = this.buildFlow(nested)
      }
      return item
    },

    statusKeyBySpStatus(spStatus) {
      const map = { 1: 'pending', 2: 'approved', 3: 'cancelled', 4: 'rejected' }
      return map[spStatus] || 'pending'
    },

    /** 申请信息：公共头 + 类型私有行（注册表）+ 公共尾 */
    buildInfoItems(item) {
      const d = item.nested || {}
      const r = item.raw || {}
      const conf = getApplyType(item.type)
      // 提供给各类型 buildInfo 的工具上下文
      const ctx = {
        raw: r,
        dash,
        datePart,
        // 字典码翻译：优先后端挂的 xxx_dictText，没有则返回空串（值框高度由 min-height 兜底）
        dictText: field => d[field + '_dictText'] || d[field + 'DictText'] || '',
        // 组织树兜底翻译（公司/部门 id -> 名称）
        orgName: id => this.deptMap[id] || ''
      }
      return [
        ...this.buildBaseInfo(item),
        ...conf.buildInfo(d, ctx),
        ...this.buildTailInfo(item, conf)
      ]
    },

    /** 公共头：固定行 + 注册表 headRows 声明的类型私有行（插在工号与部门之间） */
    buildBaseInfo(item) {
      const d = item.nested || {} || item.dept
      const r = item.raw || {}
      const conf = getApplyType(item.type)
      const ctx = {
        raw: r,
        dash,
        datePart,
        dictText: field => d[field + '_dictText'] || d[field + 'DictText'] || '',
        // 组织树兜底翻译（公司/部门 id -> 名称）；联合视图未挂 xxx_dictText 时使用
        orgName: id => this.deptMap[id] || ''
      }
      const rows = [
        { label: '申请人', value: d.name || '' || d.xm },
        { label: '员工工号', value: d.no || r.no || '' }
      ]
      if (conf && typeof conf.headRows === 'function') rows.push(...conf.headRows(d, ctx))
      rows.push(
        { label: '所属部门', value: this.resolveDept(d) || '' },
        // 提交时间只认真实提交时间，不用业务开始时间兜底
        { label: '提交时间', value: r.createtime || d.createTime || '' }
      )
      return rows
    },

    /** 公共尾：备注说明（字段名按类型在注册表 getRemark 中声明） */
    buildTailInfo(item, conf) {
      const d = item.nested || {}
      const remark = conf.getRemark ? conf.getRemark(d) : ''
      return [
        // 与原型保持一致保留备注行；实体暂无对应字段时为空，full:true 占整行（高度由 min-height 保持）
        { label: '备注说明', value: remark || '', full: true }
      ]
    },

    /**
     * 审批流程：仅依据 customProcessSqdSpjdList 节点构建
     * （节点自带 spStatus/sprName/approvalRule，不依赖每人实际审批记录）
     */
    buildFlow(nested) {
      const nodes = Array.isArray(nested.customProcessSqdSpjdList) ? nested.customProcessSqdSpjdList.slice() : []
      nodes.sort((a, b) => (Number(a.px) || 0) - (Number(b.px) || 0))
      const appStatus = Number(nested.spStatus)

      return nodes.map((node) => {
        const isCc = Number(node.nodeProperties) === 2
        const names = String(node.sprName || '').split(',').map(s => s.trim()).filter(Boolean)
        const members = names.map(name => ({
          name,
          resultText: this.memberResultText(node, isCc, names.length),
          resultCls: this.memberResultCls(node, isCc)
        }))

        return {
          name: node.nodeName || '审批节点',
          tag: Number(node.approvalRule) === 1 ? '会签' : (Number(node.approvalRule) === 2 ? '或签' : ''),
          status: this.nodeStatus(node, nested, appStatus, isCc),
          members
        }
      })
    },

    /** 节点状态：done/current/pending/rejected/cc/cancelled */
    nodeStatus(node, nested, appStatus, isCc) {
      const nodeStatus = String(node.spStatus)
      if (isCc) return nodeStatus === '2' ? 'cc' : 'pending'
      if (appStatus === 4 && node.nodeName === nested.spFlow) return 'rejected'
      if (nodeStatus === '3') return 'cancelled'
      if (nodeStatus === '2') return 'done'
      if (appStatus === 1 && node.nodeName === nested.spFlow) return 'current'
      return 'pending'
    },

    /** 单个审批人的结果文案（按节点 spStatus 降级展示） */
    memberResultText(node, isCc, memberCount) {
      if (isCc) return String(node.spStatus) === '2' ? '已抄送' : '待处理'
      if (String(node.spStatus) === '2') {
        // 或签节点只有一人实际审批，未操作者不展示结果
        return Number(node.approvalRule) === 2 && memberCount > 1 ? '' : '已同意'
      }
      if (String(node.spStatus) === '1') return '待处理'
      return ''
    },

    memberResultCls(node, isCc) {
      if (isCc) return String(node.spStatus) === '2' ? 'cc' : 'pending'
      const st = Number(node.spStatus)
      if (st === 2) return 'done'
      if (st === 3) return 'cancelled'
      if (st === 4) return 'rejected'
      return 'pending'
    },

    // ==================== 交互 ====================

    switchTab(key) {
      if (this.activeTab === key) return
      this.activeTab = key
      this.reload()
      this.loadCounts()
    },

    selectFirst() {
      if (this.list.length) {
        this.selectItem(this.list[0].id)
      }
    },

    selectItem(id) {
      // 所有展示数据已在列表响应中（含审批节点 customProcessSqdSpjdList），点选仅切换选中态，不再发请求
      this.selectedId = id
    },

    applyFilter() {
      this.reload()
    },

    resetFilter() {
      this.filterForm.type = ''
      this.filterForm.dateFrom = ''
      this.filterForm.dateTo = ''
      this.reload()
    },

    /** 左侧列表滚动到底部自动加载下一页 */
    handleListScroll(e) {
      const el = e.target
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
        if (this.hasMore && !this.loadingMore && !this.loading) {
          this.pageNo += 1
          this.loadData(false)
        }
      }
    },

    handleCancel() {
      this.cancelVisible = true
    },

    /** 该类型在注册表中配置了 cancel 描述块才允许线上取消（转正/调薪等未接入类型隐藏按钮） */
    cancelable(item) {
      if (!item) return false
      const conf = getApplyType(item.type)
      return !!(conf && conf.cancel)
    },

    /** 取消成功：单据从「待审批」移走，刷新列表与各 Tab 角标 */
    onCancelSuccess() {
      this.reload()
      this.loadCounts()
    }
  }
}
</script>

<style lang="less" scoped>
@primary: #2563eb;
@primary-rgb: 37, 99, 235;
@foreground: #1a2a3d;
@muted-foreground: #64748b;
@border: #e2e8f0;
@muted: #f1f5f9;
@secondary: #eff3fb;
@green: #10b981;
@amber: #f59e0b;
@red: #ef4444;
@purple: #8b5cf6;

.my-apply-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: #fff;
}

/* ===== Header ===== */
.ma-header {
  padding: 26px 32px 0;
  flex-shrink: 0;
  background: linear-gradient(180deg, rgba(@primary-rgb, 0.04) 0%, transparent 100%);
}

/* ===== Tabs ===== */
.ma-tabs {
  display: flex;
  gap: 2px;
  border-bottom: 1px solid @border;
}

.ma-tab {
  padding: 11px 26px;
  font-size: 13px;
  font-weight: 500;
  color: @muted-foreground;
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  user-select: none;
  position: relative;

  &:hover {
    color: @foreground;
    background: rgba(@primary-rgb, 0.04);
  }

  &.active {
    color: @primary;
    border-bottom-color: @primary;
    background: rgba(@primary-rgb, 0.06);
    font-weight: 600;
  }
}

.ma-tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  border-radius: 11px;
  background: rgba(@primary-rgb, 0.12);
  color: @primary;
  font-size: 12px;
  font-weight: 700;
  padding: 0 6px;
  margin-left: 6px;
  line-height: 1;
}

.ma-tab.active .ma-tab-badge {
  background: @primary;
  color: #fff;
}

/* ===== Filter Bar ===== */
.ma-filter-bar {
  flex-shrink: 0;
  padding: 10px 32px;
  background: linear-gradient(180deg, rgba(@primary-rgb, 0.03) 0%, transparent 100%);
  border-bottom: 1px solid @border;
}

.ma-filter-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.ma-filter-item {
  display: flex;
  align-items: center;
  gap: 6px;

  label {
    font-size: 12px;
    color: @muted-foreground;
    font-weight: 500;
    letter-spacing: 0.2px;
    white-space: nowrap;
    flex-shrink: 0;
  }
}

.ma-native-select,
.ma-native-input {
  height: 30px;
  border-radius: 6px;
  border: 1px solid @border;
  font-size: 12px;
  color: @foreground;
  font-family: inherit;
  padding: 0 10px;
  outline: none;
  background: #fff;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.ma-native-select {
  width: 140px;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%2364748b'%3e%3cpath d='M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 14px;
  padding-right: 28px;
  cursor: pointer;
}

.ma-native-input {
  width: 130px;

  &[type="date"] {
    padding-right: 6px;
  }
}

.ma-native-select:focus,
.ma-native-input:focus {
  border-color: rgba(@primary-rgb, 0.5);
  box-shadow: 0 0 0 2px rgba(@primary-rgb, 0.1);
}

.ma-native-input::placeholder {
  color: #b0bec5;
  font-size: 11px;
}

.ma-date-range {
  display: flex;
  align-items: center;
  gap: 6px;

  span {
    font-size: 12px;
    color: @muted-foreground;
    white-space: nowrap;
  }
}

.ma-filter-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}

.ma-filter-btn {
  height: 30px;
  padding: 0 18px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  /deep/ .anticon {
    font-size: 12px;
  }
}

.ma-filter-btn-primary {
  background: linear-gradient(135deg, @primary, #4f7dff);
  background-size: 200% 200%;
  animation: gradientShift 6s ease infinite;
  color: #fff;
  box-shadow: 0 2px 8px rgba(@primary-rgb, 0.2);

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.95);
  }
}

.ma-filter-btn-reset {
  background: #fff;
  color: @muted-foreground;
  border: 1px solid @border;

  &:hover {
    border-color: rgba(@primary-rgb, 0.3);
    color: @primary;
  }
}

/* ===== Main Layout ===== */
.ma-main {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

/* ===== Left List ===== */
.ma-left {
  width: 348px;
  flex-shrink: 0;
  border-right: 1px solid @border;
  background: @secondary;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  min-height: 0;

  /deep/ .ant-spin-nested-loading,
  /deep/ .ant-spin-container {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
}

.ma-card-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(@primary-rgb, 0.15);
    border-radius: 99px;
  }
}

.ma-list-footer {
  flex-shrink: 0;
  text-align: center;
  font-size: 11px;
  color: @muted-foreground;
  padding: 8px 0 4px;

  /deep/ .anticon {
    margin-right: 4px;
  }
}

.ma-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid @border;
  padding: 15px 17px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(45, 120, 255, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03);
  animation: cardIn 0.35s ease-out both;
  flex-shrink: 0;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(135deg, @primary, #4f7dff);
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  &:hover::before {
    opacity: 1;
  }

  &:hover {
    border-color: rgba(@primary-rgb, 0.3);
    box-shadow: 0 4px 24px rgba(45, 120, 255, 0.15), 0 0 40px rgba(45, 120, 255, 0.04);
    transform: translateY(-2px);
  }

  &.active {
    border-color: rgba(@primary-rgb, 0.45);
    box-shadow: 0 0 0 3px rgba(@primary-rgb, 0.12), 0 6px 24px rgba(@primary-rgb, 0.12);
    background: linear-gradient(135deg, #f5f9ff 0%, #eef4ff 100%);
  }
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.ma-card-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 9px;
  position: relative;
  letter-spacing: 0.3px;

  &.t-leave {
    background: rgba(239, 68, 68, 0.12);
    color: #dc2626;
  }

  &.t-overtime {
    background: rgba(245, 158, 11, 0.15);
    color: #d97706;
  }

  &.t-repair {
    background: rgba(@primary-rgb, 0.12);
    color: @primary;
  }

  &.t-out {
    background: rgba(16, 185, 129, 0.14);
    color: #059669;
  }

  &.t-other {
    background: rgba(139, 92, 246, 0.13);
    color: #7c3aed;
  }
}

.ma-card-name {
  font-size: 14px;
  font-weight: 600;
  color: @foreground;
  margin-bottom: 7px;
  line-height: 1.4;
  padding-right: 22px;
  position: relative;
}

.ma-card-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 11px;
  color: @muted-foreground;
  flex-wrap: wrap;
  position: relative;

  span {
    display: flex;
    align-items: center;
    gap: 4px;

    /deep/ .anticon {
      font-size: 11px;
    }
  }
}

.ma-card-arrow {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: @muted-foreground;
  font-size: 12px;
  transition: all 0.2s;
}

.ma-card.active .ma-card-arrow {
  color: @primary;
}

.ma-empty-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 16px;
  color: @muted-foreground;

  /deep/ .anticon {
    font-size: 44px;
    margin-bottom: 10px;
    color: @primary;
    opacity: 0.3;
  }

  span {
    font-size: 13px;
  }
}

/* ===== Right Detail ===== */
.ma-right {
  flex: 1;
  overflow-y: auto;
  padding: 28px 36px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 255, 0.9) 100%);
  min-width: 0;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(@primary-rgb, 0.15);
    border-radius: 99px;
  }
}

.ma-detail-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: @muted-foreground;

  /deep/ .anticon {
    font-size: 60px;
    margin-bottom: 14px;
    color: @primary;
    opacity: 0.2;
  }

  span {
    font-size: 13px;
  }
}

.ma-detail-head {
  margin-bottom: 24px;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(@primary-rgb, 0.18);
}

.ma-dh-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  flex-wrap: wrap;

  h2 {
    flex: 1;
    min-width: 0;
    font-size: 19px;
    font-weight: 700;
    color: @foreground;
    margin: 0 0 12px;
    letter-spacing: -0.2px;
  }

  .ma-sp {
    flex-shrink: 0;
  }
}

.ma-sp {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.2px;

  &.sp-pending {
    background: rgba(245, 158, 11, 0.15);
    color: #b45309;
  }

  &.sp-approved {
    background: rgba(16, 185, 129, 0.14);
    color: #047857;
  }

  &.sp-rejected {
    background: rgba(239, 68, 68, 0.12);
    color: #dc2626;
  }

  &.sp-cancelled {
    background: rgba(100, 116, 139, 0.14);
    color: #64748b;
  }
}

.ma-detail-body {
  display: flex;
  gap: 22px;
}

.ma-detail-left {
  flex: 1;
  min-width: 0;
}

.ma-detail-right {
  width: 400px;
  flex-shrink: 0;
}

/* ===== Group / Title ===== */
.ma-group {
  margin-bottom: 26px;
}

.ma-g-title {
  font-size: 13px;
  font-weight: 600;
  color: @foreground;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    width: 4px;
    height: 16px;
    border-radius: 2px;
    background: linear-gradient(135deg, @primary, #4f7dff);
    display: inline-block;
  }
}

/* ===== Info Grid ===== */
.ma-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 28px;
}

.ma-info-item.full {
  grid-column: span 2;
}

.ma-info-label {
  font-size: 12px;
  color: @muted-foreground;
  margin-bottom: 6px;
  font-weight: 500;
  letter-spacing: 0.2px;
}

.ma-info-value {
  font-size: 13px;
  color: @foreground;
  font-weight: 500;
  line-height: 1.5;
  background: @muted;
  border-radius: 8px;
  padding: 8px 12px;
  border: 1px solid @border;
  // 内容为空字符串时保持单行高度（20px 行高 + 上下 padding 8*2 + 边框 2），防止盒子塌陷
  min-height: 38px;
  box-sizing: border-box;
}

/* 附件链接行 */
.ma-info-file {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: @primary;
  font-weight: 500;
  margin-right: 14px;

  &:last-child {
    margin-right: 0;
  }

  /deep/ .anticon {
    font-size: 13px;
    color: @primary;
  }
}

/* ===== Flow Block ===== */
.ma-flow-block {
  background: @secondary;
  border-radius: 12px;
  padding: 10px;
  border: 1px solid @border;

  .ma-g-title {
    margin-bottom: 10px;
  }
}

.ma-flow-list {
  position: relative;
}

.ma-flow-empty {
  text-align: center;
  font-size: 12px;
  color: @muted-foreground;
  padding: 20px 0;
}

.ma-flow-step-row {
  display: flex;
  align-items: flex-start;
  position: relative;

  &:last-child .ma-flow-step-card {
    margin-bottom: 0;
  }

  &:last-child .ma-flow-dot-col::after {
    display: none;
  }
}

.ma-flow-dot-col {
  width: 20px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 22px;
    left: 50%;
    transform: translateX(-50%);
    width: 1.5px;
    bottom: -6px;
    background: @border;
  }
}

.ma-flow-dot-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  z-index: 1;
  flex-shrink: 0;
  color: #fff;

  /deep/ .anticon {
    font-size: 9px;
  }

  &.done {
    background: @green;
  }

  &.current {
    background: @primary;
    box-shadow: 0 0 0 2px rgba(@primary-rgb, 0.15);
  }

  &.pending {
    background: #cbd5e1;
    color: #fff;
  }

  &.rejected {
    background: @red;
  }

  &.cc {
    background: @purple;
  }

  &.cancelled {
    background: #94a3b8;
  }
}

.ma-flow-step-card {
  flex: 1;
  min-width: 0;
  margin-left: 6px;
  margin-bottom: 6px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid @border;
  overflow: hidden;

  &.current {
    border-color: rgba(@primary-rgb, 0.25);
    box-shadow: 0 1px 4px rgba(@primary-rgb, 0.06);
  }

  &.rejected {
    border-color: rgba(239, 68, 68, 0.2);
  }

  &.cancelled {
    border-color: rgba(100, 116, 139, 0.25);
  }
}

.ma-flow-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px 0;
}

.ma-flow-card-title {
  font-size: 11px;
  font-weight: 600;
  color: @foreground;
  display: flex;
  align-items: center;
  gap: 4px;
}

.ma-flow-card-tag {
  font-size: 8px;
  padding: 1px 5px;
  border-radius: 6px;
  font-weight: 500;

  &.countersign {
    background: rgba(@primary-rgb, 0.1);
    color: @primary;
  }

  &.or {
    background: rgba(245, 158, 11, 0.12);
    color: #d97706;
  }
}

.ma-flow-card-badge {
  font-size: 9px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 8px;

  &.ok {
    background: rgba(16, 185, 129, 0.12);
    color: #059669;
  }

  &.now {
    background: rgba(@primary-rgb, 0.12);
    color: @primary;
  }

  &.wait {
    background: rgba(100, 116, 139, 0.12);
    color: @muted-foreground;
  }

  &.fail {
    background: rgba(239, 68, 68, 0.12);
    color: #dc2626;
  }

  &.ccd {
    background: rgba(139, 92, 246, 0.12);
    color: #7c3aed;
  }

  &.cancel {
    background: rgba(100, 116, 139, 0.12);
    color: #64748b;
  }
}

.ma-flow-person-list {
  padding: 4px 8px 6px;
}

.ma-flow-person {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 4px 0;

  &+.ma-flow-person {
    border-top: 1px solid @muted;
  }
}

.ma-flow-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.ma-flow-tag {
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  padding: 4px 9px;
  border-radius: 6px;
}

.ma-flow-tag-name {
  color: @primary;
  background: rgba(@primary-rgb, 0.1);
}

.ma-flow-person-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
  white-space: nowrap;
  flex-shrink: 0;
}

.ma-flow-person-result {
  font-size: 9px;
  font-weight: 600;

  &.done {
    color: #059669;
  }

  &.pending {
    color: @muted-foreground;
  }

  &.rejected {
    color: #dc2626;
  }

  &.cc {
    color: #7c3aed;
  }

  &.cancelled {
    color: #64748b;
  }
}

/* ===== Action Bar ===== */
.ma-action-bar {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid @border;
}

.ma-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.ma-btn-cancel {
  color: @red;
  border-color: @red;
  background: #fff;

  &:hover {
    background: @red;
    color: #fff;
    border-color: @red;
  }
}

.ma-readonly-tip {
  font-size: 12px;
  color: @muted-foreground;
  display: flex;
  align-items: center;
  gap: 6px;

  /deep/ .anticon {
    font-size: 12px;
  }
}

/* ===== 响应式 ===== */
@media (max-width: 1200px) {
  .ma-detail-body {
    flex-direction: column;
  }

  .ma-detail-right {
    width: 100%;
  }
}
</style>

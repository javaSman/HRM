<!--
  离职详情模态框组件

  功能说明：
  - 展示离职申请的详细信息
  - 包含基本信息、审批流程、访谈记录、离职结算子事务
  - 支持查看访谈详情

  组件属性：
  - visible: 控制模态框显示/隐藏
  - record: 当前离职记录数据

  子组件：
  - offboardingInterviewModal: 访谈详情弹窗

  
-->
<template>
  <j-modal
    :title="'离职详情 - ' + (record.xm || '')"
    :width="900"
    :visible="visible"
    switchFullscreen
    :bodyStyle="{ padding: '0' }"
    :footer="null"
    @cancel="close"
    :dialogStyle="{ top: '60px' }"
  >
    <a-spin :spinning="loading">
      <!-- 基本信息区域 -->
      <div style="padding: 16px 24px; border-bottom: 1px solid #eee">
        <div
          style="
            font-size: 14px;
            font-weight: 600;
            color: #333;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
          "
        >
          <span style="width: 3px; height: 14px; background: #4a7bf7; border-radius: 2px"></span>基本信息
        </div>
        <a-row :gutter="[16, 8]" style="font-size: 13px" type="flex" align="top">
          <!-- 离职状态 -->
          <a-col :span="6">
            <span style="color: #999">状态：</span>
            <a-tag :color="getStatusColor(record.zt)">{{ record.zt || '-' }}</a-tag>
          </a-col>
          <!-- 公司 -->
          <a-col :span="6">
            <span style="color: #999">公司：</span>
            <span style="color: #333">{{ record.companyId_dictText || '-' }}</span>
          </a-col>
          <!-- 所属部门 -->
          <a-col :span="6">
            <span style="color: #999">所属部门：</span>
            <span style="color: #333">{{ record.dept_dictText || '-' }}</span>
          </a-col>
          <!-- 岗位名称 -->
          <a-col :span="6">
            <span style="color: #999">岗位名称：</span>
            <span style="color: #333">{{ record.postId_dictText || '-' }}</span>
          </a-col>
          <!-- 职级名称 -->
          <a-col :span="6">
            <span style="color: #999">职级名称：</span>
            <span style="color: #333">{{ record.postRank_dictText || '-' }}</span>
          </a-col>
          <!-- 工号 -->
          <a-col :span="6">
            <span style="color: #999">工号：</span>
            <span style="color: #333">{{ record.gh || '-' }}</span>
          </a-col>
          <!-- 姓名 -->
          <a-col :span="6">
            <span style="color: #999">姓名：</span>
            <span style="color: #333">{{ record.xm || '-' }}</span>
          </a-col>
          <!-- 离职原因 -->
          <a-col :span="6">
            <span style="color: #999">离职原因：</span>
            <span style="color: #333">{{ record.lzyy || '-' }}</span>
          </a-col>
          <!-- 取消原因（仅已取消状态显示） -->
          <a-col :span="6" v-if="record.zt === '已取消'">
            <span style="color: #999">取消原因：</span>
            <span style="color: #333">{{ record.qxyy || '-' }}</span>
          </a-col>
          <!-- 入职时间 -->
          <a-col :span="6">
            <span style="color: #999">入职日期：</span>
            <span style="color: #333">{{ record.rzsj || '-' }}</span>
          </a-col>
          <!-- 预计离职日期 -->
          <a-col :span="6">
            <span style="color: #999">预计离职日期：</span>
            <span style="color: #333">{{ record.yjlzrq || '-' }}</span>
          </a-col>
          <!-- 实际离职日期 -->
          <a-col :span="6">
            <span style="color: #999">实际离职日期：</span>
            <span style="color: #333">{{ record.sjlzrq || '-' }}</span>
          </a-col>
          <!-- 申请时间 -->
          <a-col :span="6">
            <span style="color: #999">申请时间：</span>
            <span style="color: #333">{{ record.sqsj || '-' }}</span>
          </a-col>
          <!-- 社保账号 -->
          <a-col :span="6">
            <span style="color: #999">社保账号：</span>
            <span style="color: #333">{{ record.sbzh || '-' }}</span>
          </a-col>
          <!-- 公积金账号 -->
          <a-col :span="6">
            <span style="color: #999">公积金账号：</span>
            <span style="color: #333">{{ record.gjjzh || '-' }}</span>
          </a-col>
          <!-- 具体说明 -->
          <a-col :span="12">
            <span style="color: #999">具体说明：</span>
            <span style="color: #333">{{ record.jtsm || '-' }}</span>
          </a-col>
        </a-row>
      </div>

      <!-- 审批流程区域 -->
      <div style="padding: 16px 24px; border-bottom: 1px solid #eee">
        <div
          style="
            font-size: 14px;
            font-weight: 600;
            color: #333;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
          "
        >
          <span style="width: 3px; height: 14px; background: #4a7bf7; border-radius: 2px"></span>审批流程
        </div>
        <!-- 动态审批流程时间轴 -->
        <approval-timeline :apply-id="record.id" :l-cdata="record" />
      </div>

      <!-- 访谈记录区域 -->
      <div style="padding: 16px 24px; border-bottom: 1px solid #eee">
        <div
          style="
            font-size: 14px;
            font-weight: 600;
            color: #333;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
          "
        >
          <span style="width: 3px; height: 14px; background: #4a7bf7; border-radius: 2px"></span>访谈记录
        </div>
        <!-- 访谈记录表格 -->
        <a-table
          v-if="interviewList && interviewList.length > 0"
          size="small"
          bordered
          :columns="interviewColumns"
          :dataSource="interviewList"
          :pagination="false"
          rowKey="id"
        >
          <template slot="action" slot-scope="text, record">
            <a @click="viewInterviewDetail(record)">详情</a>
          </template>
        </a-table>
        <div v-else style="color: #999; text-align: center; padding: 12px">暂无访谈记录</div>
      </div>

      <!-- 离职结算子事务区域（仅结算中/已离职时显示） -->
      <div v-if="showSettlement" style="padding: 16px 24px">
        <div
          style="
            font-size: 14px;
            font-weight: 600;
            color: #333;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
          "
        >
          <span style="width: 3px; height: 14px; background: #4a7bf7; border-radius: 2px"></span>离职结算子事务
        </div>
        <!-- 结算子事务表格 -->
        <a-table
          v-if="settlementList && settlementList.length > 0"
          size="small"
          bordered
          :columns="settlementColumns"
          :dataSource="settlementList"
          :pagination="false"
          rowKey="id"
        >
          <template slot="swzt" slot-scope="text">
            <a-tag :color="text === '已完成' ? 'green' : 'orange'">
              {{ text === '已完成' ? '已完成' : '处理中' }}
            </a-tag>
          </template>
        </a-table>
        <div v-else style="color: #999; text-align: center; padding: 12px">暂无结算子事务</div>
      </div>
    </a-spin>

    <!-- 访谈详情弹窗 -->
    <offboarding-interview-modal ref="offboardingInterviewModal" @ok="handleInterviewOk" />
  </j-modal>
</template>

<script>
import { getAction } from '@/api/manage'
import offboardingInterviewModal from './offboardingInterviewModal.vue'
import ApprovalTimeline from './ApprovalTimeline.vue'

// 离职状态对应的颜色映射
const STATUS_COLORS = { 审批中: '#0082fc', 待离职: '#e6a23c', 结算中: '#13c2c2', 已离职: '#67c23a', 已取消: '#909399' }

export default {
  name: 'offboardingDetailModal',
  components: {
    offboardingInterviewModal,
    ApprovalTimeline,
  },
  data() {
    return {
      visible: false, // 模态框显示状态
      loading: false, // 加载状态
      record: {}, // 当前离职记录数据
      interviewList: [], // 访谈记录列表
      settlementList: [], // 结算子事务列表

      // 访谈记录表格列配置
      interviewColumns: [
        { title: '访谈时间', dataIndex: 'ftrq', width: 180 },
        { title: '访谈类型', dataIndex: 'ftlx', width: 150 },
        { title: '适用职级', dataIndex: 'syzj', width: 150 },
        { title: '创建人', dataIndex: 'createBy', width: 120 },
        { title: '操作', dataIndex: 'action', width: 100, scopedSlots: { customRender: 'action' } },
      ],

      // 结算子事务表格列配置
      settlementColumns: [
        { title: '事项名称', dataIndex: 'sxmc', width: 200 },
        { title: '处理人', dataIndex: 'clr', width: 120 },
        { title: '抄送人', dataIndex: 'csr', width: 120 },
        { title: '事务状态', dataIndex: 'swzt', width: 100, scopedSlots: { customRender: 'swzt' } },
      ],

      url: {
        detail: '/ryManage/hrmLzgl/queryDetlById', // 离职详情接口
      },
    }
  },
  computed: {
    /**
     * 计算属性：是否显示结算子事务
     * 仅在结算中或已离职状态下显示
     * @returns {boolean} 是否显示
     */
    showSettlement() {
      return this.record.zt === '结算中' || this.record.zt === '已离职'
    },
  },
  methods: {
    /**
     * 打开模态框
     * @param {Object} record - 离职记录数据
     */
    open(record) {
      if (!record || !record.id) {
        this.$message.warning('当前离职记录缺少主键，无法查看详情')
        return
      }
      // 重置数据
      this.record = {}
      this.interviewList = []
      this.settlementList = []
      this.visible = true
      // 加载详情数据
      this.loadDetail(record.id)
    },

    /**
     * 关闭模态框
     * 重置所有状态
     */
    close() {
      this.visible = false
      this.loading = false
      this.record = {}
      this.interviewList = []
      this.settlementList = []
    },

    /**
     * 加载离职详情数据
     * @param {String} id - 离职记录ID
     */
    loadDetail(id) {
      this.loading = true
      getAction(this.url.detail, { id })
        .then((res) => {
          if (!res || !res.success || !res.result) {
            throw new Error(res.message || '离职详情加载失败')
          }
          this.record = res.result
          // 从record中直接获取访谈记录列表
          this.interviewList = Array.isArray(res.result.lzftList) ? res.result.lzftList : []
          // 从record中直接获取离职结算子事务列表
          this.settlementList = Array.isArray(res.result.lzjsList) ? res.result.lzjsList : []
        })
        .catch((error) => {
          this.$message.error(error.message || '离职详情加载失败，请稍后重试')
        })
        .finally(() => {
          this.loading = false
        })
    },

    /**
     * 获取状态对应的颜色
     * @param {String} status - 离职状态
     * @returns {String} 颜色值
     */
    getStatusColor(status) {
      return STATUS_COLORS[status] || ''
    },

    /**
     * 查看访谈详情
     * @param {Object} interviewRecord - 访谈记录数据
     */
    viewInterviewDetail(interviewRecord) {
      // if (!interviewRecord || !interviewRecord.id) {
      //   this.$message.warning('当前访谈记录缺少主键，无法查看详情')
      //   return
      // }
      this.$refs.offboardingInterviewModal.edit(interviewRecord)
    },

    /**
     * 访谈保存成功回调
     * 重新加载访谈列表
     */
    handleInterviewOk() {
      if (this.record && this.record.id) {
        this.loadInterviewList(this.record.id)
      }
    },
  },
}
</script>

<style scoped lang="less">
/* 表格表头样式 - 添加浅灰色背景 */
::v-deep .ant-table-thead > tr > th {
  background: #fafafa !important;
}
</style>

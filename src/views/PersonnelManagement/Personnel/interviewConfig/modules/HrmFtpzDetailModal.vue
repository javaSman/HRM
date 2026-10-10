<template>
  <j-modal
    :title="title"
    :width="900"
    :visible="visible"
    :confirmLoading="confirmLoading"
    switchFullscreen
    @cancel="handleCancel"
    :footer="null">

    <!-- 基本信息 -->
    <a-descriptions :column="3" bordered size="small" style="margin-bottom: 16px">
      <a-descriptions-item label="访谈类型">{{ model.ftlx || '-' }}</a-descriptions-item>
      <a-descriptions-item label="所属种类">{{ model.sszl || '-' }}</a-descriptions-item>
      <a-descriptions-item label="适用职级">{{ model.syjb || '-' }}</a-descriptions-item>
      <a-descriptions-item label="状态">
        {{ model.zt || '-' }}
        <!-- <a-tag :color="model.zt === '启用' ? 'green' : 'default'">{{ model.zt || '-' }}</a-tag> -->
      </a-descriptions-item>
      <a-descriptions-item label="创建人">{{ model.cjr || '-' }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ model.createTime || '-' }}</a-descriptions-item>
      <a-descriptions-item label="更新时间" :span="3">{{ model.updateTime || '-' }}</a-descriptions-item>
    </a-descriptions>

    <!-- Tab 切换 -->
    <a-tabs default-active-key="questions">
      <a-tab-pane key="questions" tab="问题列表">
        <a-table
          :columns="questionColumns"
          :data-source="wtlbList"
          :pagination="false"
          size="small"
          row-key="id">
          <template slot="index" slot-scope="text, record, index">
            {{ index + 1 }}
          </template>
        </a-table>
      </a-tab-pane>

      <a-tab-pane key="events" tab="事件记录">
        <a-table
          :columns="eventColumns"
          :data-source="sjjlList"
          :pagination="false"
          size="small"
          row-key="id">
        </a-table>
      </a-tab-pane>
    </a-tabs>

    <!-- 底部按钮 -->
    <div style="text-align: right; margin-top: 16px">
      <a-button @click="handleCancel">关闭</a-button>
    </div>
  </j-modal>
</template>

<script>
import { getAction } from '@/api/manage'

export default {
  name: 'HrmFtpzDetailModal',
  data() {
    return {
      title: '访谈配置详情',
      visible: false,
      confirmLoading: false,
      model: {},
      wtlbList: [],
      sjjlList: [],
      questionColumns: [
        { title: '序号', dataIndex: 'index', key: 'index', width: 60, scopedSlots: { customRender: 'index' } },
        { title: '问题内容', dataIndex: 'wtnr', key: 'wtnr' },
        { title: '跟进人', dataIndex: 'gjr', key: 'gjr', width: 180 }
      ],
      eventColumns: [
        { title: '修改人', dataIndex: 'xgr', key: 'xgr', width: 120 },
        { title: '修改内容', dataIndex: 'xgnr', key: 'xgnr' },
        { title: '修改时间', dataIndex: 'createTime', key: 'createTime', width: 180 }
      ],
      url: {
        queryDetlById: '/ryManage/hrmFtpz/queryDetlById'
      }
    }
  },
  methods: {
    detail(record) {
      this.visible = true
      this.confirmLoading = true

      getAction(this.url.queryDetlById, { id: record.id })
        .then(res => {
          if (res.success && res.result) {
            this.model = res.result
            this.wtlbList = res.result.wtlbList || []
            this.sjjlList = res.result.sjjlList || []
            this.title = `访谈配置详情 - ${res.result.ftlx || '未知'}`
          } else {
            this.$message.warning(res.message || '加载失败')
          }
        })
        .catch(err => {
          this.$message.error('加载详情失败：' + (err.message || '网络错误'))
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
    handleCancel() {
      this.visible = false
      this.model = {}
      this.wtlbList = []
      this.sjjlList = []
    }
  }
}
</script>

<style scoped>
</style>

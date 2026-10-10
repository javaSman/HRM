<template>
  <j-modal title="调动详情" :width="680" :visible="visible" :footer="null" :bodyStyle="{ padding: 0 }" @cancel="close">
    <a-spin :spinning="loading">
      <!-- 顶部信息区（原型行4189-4195） -->
      <div style="padding: 16px 24px; border-bottom: 1px solid #eee">
        <div style="display: flex; align-items: center; gap: 24px; font-size: 13px">
          <span
            >调动类型：<strong style="color: #333">{{ record.ddlx || '-' }}</strong></span
          >
          <span>
            状态：
            <strong :style="{ color: statusColor }">{{ record.zt || '-' }}</strong>
          </span>
          <span
            >生效时间：<span style="color: #555">{{ record.ddsxsj || '-' }}</span></span
          >
        </div>
      </div>

      <!-- Tab切换（原型行4197-4200） -->
      <div class="detail-tabs" style="padding: 0 24px; margin: 0">
        <div :class="['detail-tab', { active: activeTab === 'info' }]" @click="activeTab = 'info'">基本信息</div>
        <div :class="['detail-tab', { active: activeTab === 'flow' }]" @click="activeTab = 'flow'">审批流程</div>
      </div>

      <div style="padding: 20px 24px">
        <!-- 基本信息 Tab（原型行4203-4236） -->
        <div v-show="activeTab === 'info'" class="detail-content show">
          <div class="form-section-title" style="margin-top: 0"><span class="icon">📋</span> 调动前后信息对比</div>
          <div style="font-size: 13px; color: #666; margin-bottom: 10px">
            姓名：<strong style="color: #333">{{ record.xm || '-' }}</strong> &nbsp; 工号：<span style="color: #555">{{
              record.gh || '-'
            }}</span>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px">
            <tbody>
              <tr>
                <td style="padding: 10px 14px; border: 1px solid #eee; color: #666; width: 18%; background: #fafbfc">
                  原公司
                </td>
                <td style="padding: 10px 14px; border: 1px solid #eee; color: #333; width: 28%">
                  {{ record.ycompanyId_dictText || '-' }}
                </td>
                <td
                  style="
                    padding: 10px 8px;
                    border: 1px solid #eee;
                    color: #c0c4cc;
                    width: 8%;
                    text-align: center;
                    background: #fafbfc;
                  "
                >
                  →
                </td>
                <td style="padding: 10px 14px; border: 1px solid #eee; color: #666; width: 20%; background: #fafbfc">
                  调动后公司
                </td>
                <td style="padding: 10px 14px; border: 1px solid #eee; color: #333; font-weight: 500; width: 26%">
                  {{ record.hcompanyId_dictText || '-' }}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; border: 1px solid #eee; color: #666; background: #fafbfc">原所属部门</td>
                <td style="padding: 10px 14px; border: 1px solid #eee; color: #333">
                  {{ record.ydept_dictText || '-' }}
                </td>
                <td
                  style="
                    padding: 10px 8px;
                    border: 1px solid #eee;
                    color: #c0c4cc;
                    text-align: center;
                    background: #fafbfc;
                  "
                >
                  →
                </td>
                <td style="padding: 10px 14px; border: 1px solid #eee; color: #666; background: #fafbfc">
                  调动后所属部门
                </td>
                <td style="padding: 10px 14px; border: 1px solid #eee; color: #333; font-weight: 500">
                  {{ record.hdept_dictText || '-' }}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; border: 1px solid #eee; color: #666; background: #fafbfc">原岗位名称</td>
                <td style="padding: 10px 14px; border: 1px solid #eee; color: #333">
                  {{ record.ypostId_dictText || '-' }}
                </td>
                <td
                  style="
                    padding: 10px 8px;
                    border: 1px solid #eee;
                    color: #c0c4cc;
                    text-align: center;
                    background: #fafbfc;
                  "
                >
                  →
                </td>
                <td style="padding: 10px 14px; border: 1px solid #eee; color: #666; background: #fafbfc">
                  调动后岗位名称
                </td>
                <td style="padding: 10px 14px; border: 1px solid #eee; color: #333; font-weight: 500">
                  {{ record.hpostId_dictText || '-' }}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; border: 1px solid #eee; color: #666; background: #fafbfc">原职级名称</td>
                <td style="padding: 10px 14px; border: 1px solid #eee; color: #333">
                  {{ record.ypostRank_dictText || '-' }}
                </td>
                <td
                  style="
                    padding: 10px 8px;
                    border: 1px solid #eee;
                    color: #c0c4cc;
                    text-align: center;
                    background: #fafbfc;
                  "
                >
                  →
                </td>
                <td style="padding: 10px 14px; border: 1px solid #eee; color: #666; background: #fafbfc">
                  调动后职级名称
                </td>
                <td style="padding: 10px 14px; border: 1px solid #eee; color: #333; font-weight: 500">
                  {{ record.hpostRank_dictText || '-' }}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 其他信息 -->
          <div style="margin-top: 20px">
            <div class="form-section-title"><span class="icon">📝</span> 其他信息</div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; font-size: 13px">
              <div>
                <span style="color: #666">发起人：</span>
                <span style="color: #333">{{ record.fqr || '-' }}</span>
              </div>
              <div>
                <span style="color: #666">发起时间：</span>
                <span style="color: #555">{{ record.createTime || '-' }}</span>
              </div>
              <div style="grid-column: span 2; display: flex">
                <span style="color: #666; flex-shrink: 0">调动原因：</span>
                <span style="color: #333; flex: 1; word-break: break-all">{{ record.ddyy || '-' }}</span>
              </div>
              <!-- <div>
                <span style="color: #666">审批人：</span>
                <span style="color: #333">{{ record.spr || '-' }}</span>
              </div>
              <div>
                <span style="color: #666">抄送人：</span>
                <span style="color: #333">{{ record.csr || '-' }}</span>
              </div> -->
            </div>
          </div>
        </div>

        <!-- 审批流程 Tab（原型行4248-4251） -->
        <div v-show="activeTab === 'flow'" class="detail-content show">
          <div class="form-section-title" style="margin-top: 0"><span class="icon">🔄</span> 审批流程</div>
          <approval-timeline :apply-id="record.id" :l-cdata="record" />
        </div>
      </div>
    </a-spin>

    <!-- 底部按钮 -->
    <template slot="footer">
      <div style="text-align: right; padding: 12px 24px; border-top: 1px solid #eee">
        <a-button @click="close">关闭</a-button>
      </div>
    </template>
  </j-modal>
</template>

<script>
import { getAction } from '@/api/manage'
import ApprovalTimeline from './ApprovalTimeline'

export default {
  name: 'HrmTdglDetailModal',
  components: { ApprovalTimeline },
  data() {
    return {
      visible: false,
      loading: false,
      activeTab: 'info',
      record: {},
    }
  },
  computed: {
    // 状态颜色映射（与原型保持一致）
    statusColor() {
      const colors = {
        审批中: '#e6a23c',
        已通过: '#55c42a',
        已拒绝: '#f56c6c',
        已取消: '#909399',
        调动完成: '#67c23a',
      }
      return colors[this.record.zt] || '#909399'
    },
  },
  methods: {
    // 显示弹窗
    async show(record) {
      this.record = {}
      this.activeTab = 'info' // 重置为基本信息Tab
      this.visible = true

      // 调用接口获取详细数据
      if (record && record.id) {
        this.loading = true
        try {
          const res = await getAction('/ryManage/hrmTdgl/queryById', { id: record.id })
          if (res.success) {
            this.record = res.result || {}
          } else {
            this.$message.warning(res.message || '获取详情失败')
          }
        } catch (error) {
          console.error('获取调动详情失败:', error)
          this.$message.error('获取详情失败，请稍后重试')
        } finally {
          this.loading = false
        }
      }
    },
    // 关闭弹窗
    close() {
      this.visible = false
      this.record = {}
    },
  },
}
</script>

<style scoped lang="less">
@import './HrmTdglDetailModal.less';
</style>


<template>
  <div class="page-container device-page">
    <div class="page-header">
      <div class="page-breadcrumb">
        <span>首页</span>
        <a-icon type="right" class="breadcrumb-icon" />
        <span class="current">设备管理</span>
      </div>
      <a-button class="primary-action-btn" icon="plus" @click="openDeviceModal()">新增考勤设备</a-button>
    </div>

    <a-tabs :activeKey="activeTab" @change="activeTab = $event">
      <a-tab-pane key="devices" tab="考勤设备管理">
        <div class="stats-grid device-stats-grid">
          <div v-for="item in deviceStats" :key="item.key" class="stats-card">
            <div class="stats-label">{{ item.label }}</div>
            <div :class="['stats-value', item.theme]">{{ item.value }}</div>
          </div>
        </div>

        <div class="panel-card">
          <a-table rowKey="id" :columns="deviceColumns" :dataSource="devices" :pagination="false">
            <template slot="status" slot-scope="text, record">
              <a-tag :color="record.status === '在线' ? 'green' : 'red'">{{ record.status }}</a-tag>
            </template>
            <template slot="action" slot-scope="text, record">
              <a @click="openDeviceModal(record)">配置</a>
              <a-divider type="vertical" />
              <a @click="handleDeviceAction(record, 'restart')">重启</a>
              <a-divider type="vertical" />
              <a @click="handleDeviceAction(record, 'diagnose')">诊断</a>
            </template>
          </a-table>
        </div>
      </a-tab-pane>

      <a-tab-pane key="sync" tab="同步参数">
        <div class="panel-card">
          <div v-for="item in syncSettings" :key="item.key" class="setting-row">
            <div>
              <div class="setting-name">{{ item.name }}</div>
              <div class="setting-desc">{{ item.desc }}</div>
            </div>
            <div class="setting-action">
              <span class="setting-value">{{ item.value }}</span>
              <a @click="openParamModal(item)">编辑</a>
            </div>
          </div>
        </div>
      </a-tab-pane>

      <a-tab-pane key="roles" tab="角色权限">
        <div class="panel-header">
          <div>
            <div class="panel-title">角色权限管理</div>
            <div class="panel-subtitle">支持按菜单功能和数据范围划分访问权限。</div>
          </div>
          <a-button class="primary-action-btn" icon="plus" @click="openRoleModal()">新建角色</a-button>
        </div>

        <div class="panel-card">
          <a-table rowKey="id" :columns="roleColumns" :dataSource="roles" :pagination="false">
            <template slot="status" slot-scope="text, record">
              <a-tag :color="record.enabled ? 'green' : 'default'">{{ record.enabled ? '启用' : '停用' }}</a-tag>
            </template>
            <template slot="action" slot-scope="text, record">
              <a @click="openRoleModal(record)">编辑</a>
              <a-divider type="vertical" />
              <a-popconfirm title="确认删除该角色吗？" @confirm="removeRole(record)">
                <a class="danger-link">删除</a>
              </a-popconfirm>
            </template>
          </a-table>
        </div>
      </a-tab-pane>

      <a-tab-pane key="errors" tab="异常容错日志">
        <div class="panel-header">
          <div>
            <div class="panel-title">异常容错日志</div>
            <div class="panel-subtitle">记录断网、同步失败和代打卡风险等异常事件。</div>
          </div>
          <a-button class="secondary-action-btn" icon="setting" @click="openErrorRuleModal">异常规则配置</a-button>
        </div>

        <div class="stats-grid">
          <div v-for="item in errorStats" :key="item.key" class="stats-card">
            <div class="stats-label">{{ item.label }}</div>
            <div :class="['stats-value', item.theme]">{{ item.value }}</div>
          </div>
        </div>

        <div class="panel-card">
          <a-table rowKey="id" :columns="errorColumns" :dataSource="errorLogs" :pagination="false">
            <template slot="type" slot-scope="text, record">
              <a-tag :color="getErrorTypeColor(record.type)">{{ record.type }}</a-tag>
            </template>
            <template slot="alertStatus" slot-scope="text, record">
              <span :class="['plain-status', record.alertStatus === '已告警' ? 'success' : 'muted']">{{ record.alertStatus }}</span>
            </template>
            <template slot="processStatus" slot-scope="text, record">
              <a-tag :color="getProcessStatusColor(record.processStatus)">{{ record.processStatus }}</a-tag>
            </template>
            <template slot="action" slot-scope="text, record">
              <a @click="handleErrorAction(record)">{{ record.processStatus === '待处理' ? '处理' : '查看' }}</a>
            </template>
          </a-table>
        </div>
      </a-tab-pane>
    </a-tabs>

    <prototype-modal
      v-model="modal.visible"
      :title="modalTitle"
      :loading="modal.confirmLoading"
      :width="modal.type === 'device' ? 760 : modal.type === 'role' ? 640 : 520"
      wrapClassName="device-modal"
      @confirm="handleModalOk"
      @cancel="closeModal"
    >
      <a-form-model v-if="modal.type === 'device'" :model="deviceForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-model-item label="设备名称">
              <a-input v-model="deviceForm.name" />
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="所属组织">
              <a-select v-model="deviceForm.org">
                <a-select-option value="总公司 / 技术部">总公司 / 技术部</a-select-option>
                <a-select-option value="总公司 / 生产部">总公司 / 生产部</a-select-option>
                <a-select-option value="总公司 / 人事部">总公司 / 人事部</a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="所属厂区">
              <a-select v-model="deviceForm.site">
                <a-select-option value="1号厂区">1号厂区</a-select-option>
                <a-select-option value="2号厂区">2号厂区</a-select-option>
                <a-select-option value="研发楼A座">研发楼A座</a-select-option>
                <a-select-option value="研发楼B座">研发楼B座</a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="IP地址">
              <a-input v-model="deviceForm.ip" />
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="品牌型号">
              <a-select v-model="deviceForm.brand">
                <a-select-option value="中控">中控</a-select-option>
                <a-select-option value="海康">海康</a-select-option>
                <a-select-option value="其他">其他</a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="在线状态">
              <a-select v-model="deviceForm.status">
                <a-select-option value="在线">在线</a-select-option>
                <a-select-option value="离线">离线</a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>

      <a-form-model v-else-if="modal.type === 'param'" :model="paramForm" layout="vertical">
        <a-form-model-item label="参数名称">
          <a-input v-model="paramForm.name" disabled />
        </a-form-model-item>
        <a-form-model-item label="参数说明">
          <a-input v-model="paramForm.desc" disabled />
        </a-form-model-item>
        <a-form-model-item label="参数值">
          <a-input v-model="paramForm.value" />
        </a-form-model-item>
      </a-form-model>

      <a-form-model v-else-if="modal.type === 'role'" :model="roleForm" layout="vertical">
        <a-form-model-item label="角色名称">
          <a-input v-model="roleForm.name" />
        </a-form-model-item>
        <a-form-model-item label="功能权限">
          <a-checkbox-group v-model="roleForm.permissions">
            <a-row>
              <a-col v-for="item in permissionOptions" :key="item" :span="12" class="permission-item">
                <a-checkbox :value="item">{{ item }}</a-checkbox>
              </a-col>
            </a-row>
          </a-checkbox-group>
        </a-form-model-item>
        <a-form-model-item label="数据权限">
          <a-select v-model="roleForm.scope">
            <a-select-option value="全公司">全公司</a-select-option>
            <a-select-option value="本部门及下级">本部门及下级</a-select-option>
            <a-select-option value="仅本人">仅本人</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="状态">
          <a-switch v-model="roleForm.enabled" />
        </a-form-model-item>
      </a-form-model>

      <a-form-model v-else-if="modal.type === 'errorRule'" :model="errorRuleForm" layout="vertical">
        <a-form-model-item label="自动重试次数">
          <a-input-number v-model="errorRuleForm.retryTimes" :min="1" style="width: 100%" />
        </a-form-model-item>
        <a-form-model-item label="断网缓存时长（分钟）">
          <a-input-number v-model="errorRuleForm.cacheMinutes" :min="1" style="width: 100%" />
        </a-form-model-item>
        <a-form-model-item label="告警阈值配置">
          <a-input-number v-model="errorRuleForm.alertThreshold" :min="1" style="width: 100%" />
        </a-form-model-item>
        <a-form-model-item label="代打卡风险检测">
          <a-switch v-model="errorRuleForm.riskDetect" />
        </a-form-model-item>
      </a-form-model>

      <template slot="footer">
        <div class="modal-footer-actions">
          <a-button @click="closeModal">取消</a-button>
          <a-button class="primary-action-btn" :loading="modal.confirmLoading" @click="handleModalOk">保存</a-button>
        </div>
      </template>
    </prototype-modal>
  </div>
</template>

<script>
import PrototypeModal from '@/components/prototype/PrototypeModal.vue'

const permissionOptions = ['驾驶舱', '打卡管理', '考勤审批', '排班管理', '报表中心', '规则配置', '加班调休', '设备管理']

export default {
  name: 'AttendanceDevice',
  components: {
    PrototypeModal
  },
  data() {
    return {
      activeTab: 'devices',
      permissionOptions,
      modal: {
        visible: false,
        type: 'device',
        confirmLoading: false,
        editingId: null
      },
      deviceForm: {
        name: '',
        org: '总公司 / 技术部',
        site: '1号厂区',
        ip: '',
        brand: '中控',
        status: '在线'
      },
      paramForm: {
        key: '',
        name: '',
        desc: '',
        value: ''
      },
      roleForm: {
        name: '',
        permissions: permissionOptions.slice(0, 4),
        scope: '全公司',
        enabled: true
      },
      errorRuleForm: {
        retryTimes: 3,
        cacheMinutes: 60,
        alertThreshold: 5,
        riskDetect: true
      },
      deviceStats: [
        { key: 'total', label: '设备总数', value: '12 台', theme: 'slate' },
        { key: 'online', label: '在线设备', value: '10 台', theme: 'green' },
        { key: 'offline', label: '离线 / 异常', value: '2 台', theme: 'red' }
      ],
      devices: [
        { id: 1, name: '1号厂区主门禁', org: '总公司 / 生产部', ip: '192.168.1.101', brand: '海康 DS-K1T', status: '在线', syncTime: '2026-05-19 09:30', site: '1号厂区' },
        { id: 2, name: '研发楼A座考勤机', org: '总公司 / 技术部', ip: '192.168.1.105', brand: '中控 iClock S5', status: '离线', syncTime: '2026-05-18 18:00', site: '研发楼A座' }
      ],
      syncSettings: [
        { key: 'sync', name: '打卡数据同步频率', value: '2 分钟', desc: '考勤机数据自动抓取的间隔时间' },
        { key: 'notice', name: '企微异常推送时间', value: '09:30', desc: '每日迟到/旷工名单推送到主管企业微信的时间' }
      ],
      roles: [
        { id: 1, name: '系统管理员', permissionsText: '全部模块权限', scope: '全公司', memberCount: '3人', enabled: true },
        { id: 2, name: 'HR专员', permissionsText: '考勤管理 / 报表 / 审批', scope: '全公司', memberCount: '8人', enabled: true },
        { id: 3, name: '部门主管', permissionsText: '本部门考勤 / 审批 / 排班', scope: '本部门及下级', memberCount: '25人', enabled: true },
        { id: 4, name: '普通员工', permissionsText: '个人打卡 / 申请 / 查询', scope: '仅本人', memberCount: '1250人', enabled: true }
      ],
      errorStats: [
        { key: 'today', label: '今日异常', value: '12 次', theme: 'red' },
        { key: 'pending', label: '待处理', value: '5 条', theme: 'gold' },
        { key: 'resolved', label: '已解决', value: '86 条', theme: 'green' },
        { key: 'month', label: '本月累计', value: '103 条', theme: 'slate' }
      ],
      errorLogs: [
        { id: 1, code: '#ERR-001', deviceName: '研发楼A座考勤机', type: '断网', time: '2026-05-19 08:15', retryTimes: '3次', alertStatus: '已告警', processStatus: '待处理' },
        { id: 2, code: '#ERR-002', deviceName: '1号厂区主门禁', type: '同步失败', time: '2026-05-19 09:30', retryTimes: '5次', alertStatus: '已告警', processStatus: '处理中' },
        { id: 3, code: '#ERR-003', deviceName: '2号车间侧门', type: '时间校准', time: '2026-05-19 06:00', retryTimes: '1次', alertStatus: '已告警', processStatus: '已解决' },
        { id: 4, code: '#ERR-004', deviceName: '研发楼B座考勤机', type: '代打卡风险', time: '2026-05-18 18:05', retryTimes: '—', alertStatus: '已告警', processStatus: '已解决' },
        { id: 5, code: '#ERR-005', deviceName: '食堂侧门考勤机', type: '同步失败', time: '2026-05-18 22:30', retryTimes: '2次', alertStatus: '未告警', processStatus: '待处理' }
      ],
      deviceColumns: [
        { title: '设备名称', dataIndex: 'name', key: 'name' },
        { title: '所属组织', dataIndex: 'org', key: 'org' },
        { title: 'IP地址', dataIndex: 'ip', key: 'ip' },
        { title: '品牌型号', dataIndex: 'brand', key: 'brand' },
        { title: '在线状态', dataIndex: 'status', key: 'status', scopedSlots: { customRender: 'status' } },
        { title: '最后同步时间', dataIndex: 'syncTime', key: 'syncTime' },
        { title: '操作', key: 'action', scopedSlots: { customRender: 'action' } }
      ],
      roleColumns: [
        { title: '角色名称', dataIndex: 'name', key: 'name' },
        { title: '功能权限', dataIndex: 'permissionsText', key: 'permissionsText' },
        { title: '数据权限', dataIndex: 'scope', key: 'scope' },
        { title: '人员数量', dataIndex: 'memberCount', key: 'memberCount' },
        { title: '状态', dataIndex: 'enabled', key: 'enabled', scopedSlots: { customRender: 'status' } },
        { title: '操作', key: 'action', scopedSlots: { customRender: 'action' } }
      ],
      errorColumns: [
        { title: '日志ID', dataIndex: 'code', key: 'code' },
        { title: '设备名称', dataIndex: 'deviceName', key: 'deviceName' },
        { title: '异常类型', dataIndex: 'type', key: 'type', scopedSlots: { customRender: 'type' } },
        { title: '发生时间', dataIndex: 'time', key: 'time' },
        { title: '重试次数', dataIndex: 'retryTimes', key: 'retryTimes' },
        { title: '告警状态', dataIndex: 'alertStatus', key: 'alertStatus', scopedSlots: { customRender: 'alertStatus' } },
        { title: '处理状态', dataIndex: 'processStatus', key: 'processStatus', scopedSlots: { customRender: 'processStatus' } },
        { title: '操作', key: 'action', scopedSlots: { customRender: 'action' } }
      ]
    }
  },
  computed: {
    modalTitle() {
      return {
        device: this.modal.editingId ? '编辑考勤设备' : '添加考勤设备',
        param: '编辑参数',
        role: this.modal.editingId ? '编辑角色' : '新建角色',
        errorRule: '异常规则配置'
      }[this.modal.type]
    }
  },
  methods: {
    openDeviceModal(record) {
      this.modal.visible = true
      this.modal.type = 'device'
      this.modal.editingId = record ? record.id : null
      this.deviceForm = record ? {
        name: record.name,
        org: record.org,
        site: record.site,
        ip: record.ip,
        brand: record.brand.indexOf('海康') > -1 ? '海康' : '中控',
        status: record.status
      } : {
        name: '',
        org: '总公司 / 技术部',
        site: '1号厂区',
        ip: '',
        brand: '中控',
        status: '在线'
      }
    },
    openParamModal(record) {
      this.modal.visible = true
      this.modal.type = 'param'
      this.modal.editingId = record.key
      this.paramForm = {
        key: record.key,
        name: record.name,
        desc: record.desc,
        value: record.value
      }
    },
    openRoleModal(record) {
      this.modal.visible = true
      this.modal.type = 'role'
      this.modal.editingId = record ? record.id : null
      this.roleForm = record ? {
        name: record.name,
        permissions: permissionOptions.slice(0, 4),
        scope: record.scope,
        enabled: record.enabled
      } : {
        name: '',
        permissions: permissionOptions.slice(0, 4),
        scope: '全公司',
        enabled: true
      }
    },
    openErrorRuleModal() {
      this.modal.visible = true
      this.modal.type = 'errorRule'
      this.modal.editingId = null
    },
    closeModal() {
      this.modal.visible = false
      this.modal.confirmLoading = false
    },
    handleModalOk() {
      this.modal.confirmLoading = true
      setTimeout(() => {
        if (this.modal.type === 'device') {
          if (this.modal.editingId) {
            const target = this.devices.find(item => item.id === this.modal.editingId)
            if (target) {
              target.name = this.deviceForm.name
              target.org = this.deviceForm.org
              target.ip = this.deviceForm.ip
              target.status = this.deviceForm.status
              target.site = this.deviceForm.site
            }
          } else {
            this.devices.unshift({
              id: Date.now(),
              name: this.deviceForm.name || '新设备',
              org: this.deviceForm.org,
              ip: this.deviceForm.ip || '192.168.1.200',
              brand: this.deviceForm.brand,
              status: this.deviceForm.status,
              syncTime: '2026-05-19 10:00',
              site: this.deviceForm.site
            })
          }
          this.$message.success('设备信息保存成功')
        } else if (this.modal.type === 'param') {
          const target = this.syncSettings.find(item => item.key === this.paramForm.key)
          if (target) {
            target.value = this.paramForm.value
          }
          this.$message.success('参数已更新')
        } else if (this.modal.type === 'role') {
          if (this.modal.editingId) {
            const target = this.roles.find(item => item.id === this.modal.editingId)
            if (target) {
              target.name = this.roleForm.name
              target.scope = this.roleForm.scope
              target.enabled = this.roleForm.enabled
              target.permissionsText = this.roleForm.permissions.join(' / ')
            }
          } else {
            this.roles.unshift({
              id: Date.now(),
              name: this.roleForm.name || '新角色',
              permissionsText: this.roleForm.permissions.join(' / '),
              scope: this.roleForm.scope,
              memberCount: '0人',
              enabled: this.roleForm.enabled
            })
          }
          this.$message.success('角色保存成功')
        } else if (this.modal.type === 'errorRule') {
          this.$message.success('异常规则配置已保存')
        }
        this.modal.confirmLoading = false
        this.modal.visible = false
      }, 300)
    },
    handleDeviceAction(record, action) {
      this.$message.success(action === 'restart' ? `已发送 ${record.name} 重启指令` : `${record.name} 诊断任务已启动`)
    },
    handleErrorAction(record) {
      if (record.processStatus === '待处理') {
        record.processStatus = '处理中'
        this.$message.success(`${record.code} 已转入处理中`)
      } else {
        this.$message.info(`${record.code} 当前状态：${record.processStatus}`)
      }
    },
    removeRole(record) {
      this.roles = this.roles.filter(item => item.id !== record.id)
      this.$message.success('角色已删除')
    },
    getErrorTypeColor(type) {
      return {
        断网: 'red',
        同步失败: 'orange',
        时间校准: 'gold',
        代打卡风险: 'red'
      }[type] || 'default'
    },
    getProcessStatusColor(status) {
      return {
        待处理: 'orange',
        处理中: 'blue',
        已解决: 'green'
      }[status] || 'default'
    }
  }
}
</script>

<style scoped lang="less">
.device-page {
  height: calc(100vh - 120px - 24px);
  padding: 24px;
  background: #f3f7fc;
  overflow: auto;
  color: #1f2937;
}

.page-header,
.page-breadcrumb,
.panel-header,
.setting-row,
.setting-action {
  display: flex;
  align-items: center;
}

.page-header,
.panel-header,
.setting-row,
.setting-action {
  justify-content: space-between;
}

.page-header {
  height: 64px;
  margin-bottom: 24px;
  margin: -24px -24px 24px;
  padding: 0 32px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
}

.page-breadcrumb {
  gap: 8px;
  font-size: 14px;
  color: #64748b;
}

.panel-subtitle,
.setting-desc {
  color: #64748b;
  font-size: 13px;
}

.page-breadcrumb .current {
  color: #0f172a;
  font-weight: 500;
}

.breadcrumb-icon {
  font-size: 12px;
}

.primary-action-btn {
  color: #ffffff;
  background: #4f46e5;
  border-color: #4f46e5;
}

.primary-action-btn:hover,
.primary-action-btn:focus {
  color: #ffffff;
  background: #4338ca;
  border-color: #4338ca;
}

.secondary-action-btn {
  border-color: #d6deea;
  color: #475569;
  background: #ffffff;
}

.stats-grid {
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
}

.device-stats-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.stats-card,
.panel-card {
  background: #ffffff;
  border: 1px solid #dbe6f3;
  border-radius: 20px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.stats-card {
  padding: 22px 24px;
}

.stats-label {
  font-size: 13px;
  color: #94a3b8;
}

.stats-value {
  margin-top: 10px;
  font-size: 30px;
  font-weight: 700;
}

.stats-value.slate { color: #111827; }
.stats-value.green { color: #16a34a; }
.stats-value.red { color: #dc2626; }
.stats-value.gold { color: #d97706; }

.panel-card {
  padding: 24px;
  margin-bottom: 24px;
}

.panel-header {
  margin-bottom: 16px;
}

.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.setting-row + .setting-row {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.setting-name {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.setting-action {
  gap: 16px;
}

.setting-value {
  padding: 4px 10px;
  border-radius: 999px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 12px;
  font-weight: 600;
}

.plain-status.success {
  color: #16a34a;
}

.plain-status.muted {
  color: #94a3b8;
}

.danger-link {
  color: #ef4444;
}

.modal-footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.permission-item {
  margin-bottom: 10px;
}

.device-page /deep/ .ant-btn-primary,
.device-modal /deep/ .ant-btn-primary {
  background: #4f46e5;
  border-color: #4f46e5;
}

.device-page /deep/ .ant-btn-primary:hover,
.device-page /deep/ .ant-btn-primary:focus,
.device-modal /deep/ .ant-btn-primary:hover,
.device-modal /deep/ .ant-btn-primary:focus {
  background: #4338ca;
  border-color: #4338ca;
}

.device-modal /deep/ .ant-modal-content {
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
}

.device-modal /deep/ .ant-modal-header {
  padding: 24px 24px 0;
  border-bottom: 0;
}

.device-modal /deep/ .ant-modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.device-modal /deep/ .ant-modal-close-x {
  width: 48px;
  height: 48px;
  line-height: 48px;
  color: #94a3b8;
}

.device-modal /deep/ .ant-modal-body {
  padding: 24px;
}

.device-modal /deep/ .ant-modal-footer {
  border-top: 0;
  padding: 0 24px 24px;
}

.device-modal /deep/ .ant-modal-footer .ant-btn {
  height: 38px;
  padding: 0 18px;
  border-radius: 10px;
  margin-left: 0;
}

@media (max-width: 1100px) {
  .device-stats-grid,
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .page-header,
  .panel-header,
  .setting-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    height: auto;
    padding: 16px 24px;
  }

  .device-stats-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .setting-action {
    width: 100%;
    justify-content: space-between;
  }
}
</style>

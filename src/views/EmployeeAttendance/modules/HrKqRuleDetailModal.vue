<template>
  <a-drawer :visible="visible" :width="500" placement="left" title="" :maskClosable="false" :mask="false"
    :closable="false" @close="handleCancel">
    <div class="wrapper">
      <!-- 头部 -->
      <div class="ccs-header">
        <span class="ccs-title">考勤规则</span>
        <button class="ccs-close" @click="handleCancel">&times;</button>
      </div>
      <div v-if="ruleData" class="rule-detail-body">
        <!-- 上半部分：基本信息 -->
        <section class="rule-detail-section">
          <div class="rule-detail-section-title">基本信息</div>
          <a-descriptions :column="1" size="small" bordered>
            <a-descriptions-item>
              <div style="flex: 1;text-align: center;" slot="label">考勤组</div>
              <template v-if="ruleData.bdbm || ruleData.bdgw || ruleData.bdry">
                <a-tag v-for="(item, index) in getTags(ruleData)" :key="index" :color="item.color">
                  {{ item.label }}
                </a-tag>
              </template>
              <span v-else class="text-muted">-</span>
            </a-descriptions-item>
            <a-descriptions-item>
              <div style="flex: 1;text-align: center;" slot="label">规则说明</div>
              {{ ruleData.ruleSm || '-' }}
            </a-descriptions-item>
            <a-descriptions-item>
              <div style="flex: 1;text-align: center;" slot="label">打卡方式</div>
              <a-tag color="blue">{{ ruleData.dkfs_dictText || '-' }}</a-tag>
            </a-descriptions-item>

          </a-descriptions>
        </section>

        <!-- 下半部分：时段配置表格 -->
        <section class="rule-detail-section">
          <div class="rule-detail-section-title">时段配置</div>

          <a-table v-if="timePeriodData.length" :columns="timeColumns" :dataSource="timePeriodData" :pagination="false"
            size="small" rowKey="key" bordered>
            <template slot="periodLabel" slot-scope="text">
              <span class="period-label-text">{{ text }}</span>
            </template>
          </a-table>
          <a-empty v-else description="暂无时段配置数据" />

        </section>
      </div>
      <a-empty v-else-if="!loading" description="未找到考勤规则数据" />
    </div>
  </a-drawer>
</template>

<script>
import { getAction } from '@/api/manage'



export default {
  name: 'HrKqRuleDetailModal',
  data() {
    return {
      visible: false,
      loading: false,
      ruleData: null,
      timeColumns: [
        {
          title: '上午时段',
          children: [
            {
              title: '开始',
              align: "center",
              dataIndex: 'morning.sbdaate',
              customRender: function (t, r, index) {
                return t || '-'
              }
            },
            {
              title: '结束',
              align: "center",
              dataIndex: 'morning.xbdate',
              customRender: function (t, r, index) {
                return t || '-'
              }
            },
          ]
        },
        {
          title: '下午时段',
          children: [
            {
              title: '开始',
              align: "center",

              dataIndex: 'afternoon.sbdaate',
              customRender: function (t, r, index) {
                return t || '-'
              }
            },
            {
              title: '结束',
              align: "center",

              dataIndex: 'afternoon.xbdate',
              customRender: function (t, r, index) {
                return t || '-'
              }
            },
          ]
        },
        {
          title: '上半夜班',
          children: [
            {
              title: '开始',
              align: "center",

              dataIndex: 'nightTop.sbdaate',
              customRender: function (t, r, index) {
                return t || '-'
              }
            },
            {
              title: '结束',
              align: "center",

              dataIndex: 'nightTop.xbdate',
              customRender: function (t, r, index) {
                return t || '-'
              }
            },
          ]
        },
        {
          title: '下半夜班',
          children: [
            {
              title: '开始',
              align: "center",

              dataIndex: 'nightBottom.sbdaate',
              customRender: function (t, r, index) {
                return t || '-'
              }
            },
            {
              title: '结束',
              align: "center",

              dataIndex: 'nightBottom.xbdate',
              customRender: function (t, r, index) {
                return t || '-'
              }
            },
          ]
        },
        {
          title: '加班时段',
          align: "center",

          children: [
            {
              title: '开始时间',
              align: "center",
              dataIndex: 'startoutTime',
              customRender: function (t, r, index) {
                return t || '-'
              }
            },
          ]
        },
      ]
    }
  },
  computed: {
    timePeriodData() {
      if (!this.ruleData) return []
      const list = []

      // 固定打卡 / 免打卡：从 hrKqRuleGddatedk 取时段
      if (this.ruleData.dkfs == 0 || this.ruleData.dkfs == 3) {
        this.ruleData.hrKqRuleGddatedk.forEach((item, index) => {
          this.ruleData[item.sjd || 'morning'] = {
            sbdaate: item.sbdaate,
            xbdate: item.xbdate
          }
        })
        this.ruleData['startoutTime'] = this.ruleData.hrKqRuleGddatedk[0].startoutTime

        list.push(this.ruleData)
      }

      return list
    }
  },
  methods: {
    getTags(record) {
      let bdbm, bdgw, bdry = ''
      let arr = []
      if (record.bdbm) {
        bdbm = JSON.parse(record.bdbmJson)
        bdbm.forEach(item => {
          arr.push({
            label: item.label,
            color: "blue"
          })
        })
      }
      if (record.bdgw) {
        bdgw = JSON.parse(record.bdgwJson)
        bdgw.forEach(item => {
          arr.push({
            label: item.label,
            color: "cyan"
          })
        })
      }
      if (record.bdry) {
        bdry = JSON.parse(record.bdryJson)
        bdry.forEach(item => {
          arr.push({
            label: item.label,
            color: "purple"
          })
        })
      }
      if (arr.length > 3) {
        arr = arr.slice(0, 3)
      }

      return arr
    },
    show(ruleId) {
      this.ruleData = null
      this.visible = true
      this.loading = true

      getAction('/hrm/hrKqRule/listByRuleId', {
        historyId: 0,
        id: ruleId
      }).then((res) => {
        if (res.success) {
          const result = res.result
          if (result && result.records && result.records.length > 0) {
            const item = result.records[0]
            // 处理时段数据（参照 HrKqRuleList 的逻辑）
            if (item.dkfs == 0 || item.dkfs == 3) {
              const gddatedk = item.hrKqRuleGddatedk || []
              // 已经是数组格式，直接使用
              item._gddatedk = gddatedk
            }
            this.ruleData = item
          } else if (result && result.length > 0) {
            const item = result[0]
            if (item.dkfs == 0 || item.dkfs == 3) {
              const gddatedk = item.hrKqRuleGddatedk || []
              item._gddatedk = gddatedk
            }
            this.ruleData = item
          }
        } else {
          this.$message.warning(res.message || '考勤规则数据加载失败')
        }
      }).catch(() => {
        this.$message.error('考勤规则数据加载失败')
      }).finally(() => {
        this.loading = false
      })
    },
    handleCancel() {
      this.visible = false
      this.ruleData = null
    }
  }
}
</script>

<style lang="less" scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  margin: -24px;
  height: 100vh;
}

/* ===== 头部 ===== */
.ccs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 22px;
  border-bottom: 0;
  flex-shrink: 0;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
}

.ccs-title {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
}

.ccs-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  border: 0;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #ffffff;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.35);
    color: #ffffff;
    border-color: transparent;
  }
}

/* ===== 提示信息 ===== */
.ccs-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 22px;
  font-size: 11px;
  color: #94a3b8;
  background: #fafbfc;
  border-bottom: 1px solid #e2e8f0;

  .anticon {
    color: #2d78ff;
  }
}

/* ===== 搜索框 ===== */
.ccs-search {
  padding: 14px 22px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

/deep/ .ccs-search .ant-input {
  height: 32px;
  border-color: #e2e8f0;
  border-radius: 6px;
  background: #ffffff;
  font-size: 12px;

  &:focus {
    border-color: rgba(45, 120, 255, 0.4);
    box-shadow: 0 0 0 3px rgba(45, 120, 255, 0.08);
  }
}

/* ===== 字段列表 ===== */
.ccs-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(45, 120, 255, 0.08);
    border-radius: 2px;
  }
}

/* ===== 单个字段项 ===== */
.ccs-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  transition: all 0.2s ease;
  user-select: none;
  border-bottom: 1px solid transparent;

  &:hover {
    background: rgba(45, 120, 255, 0.03);

    .ccs-drag-handle {
      opacity: 1;
      color: #2d78ff;
    }
  }

  /* vuedraggable 拖拽中样式 */
  &.dragging {
    opacity: 0.8;
    background: rgba(45, 120, 255, 0.08);
  }

  /* vuedraggable 占位符样式 */
  &.drag-ghost {
    opacity: 0.4;
    background: rgba(45, 120, 255, 0.06);
    border-top: 2px solid #2d78ff;
  }
}

/* ===== 拖拽手柄 ===== */
.ccs-drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: #cbd5e1;
  cursor: grab;
  opacity: 0.5;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    opacity: 1;
    color: #2d78ff;
  }

  &:active {
    cursor: grabbing;
  }

  svg {
    pointer-events: none;
  }
}

/* ===== 复选框样式覆盖 ===== */
/deep/ .ant-checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 12px;
  color: #1a2a3d;
  margin-right: 0;
  flex: 1;
}

/deep/ .ant-checkbox-checked .ant-checkbox-inner {
  background-color: #2d78ff;
  border-color: #2d78ff;
}

/* ===== 底部按钮 ===== */
.ccs-footer {
  padding: 14px 22px;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
  display: flex;
  gap: 8px;

  .ant-btn {
    flex: 1;
    text-align: center;
  }

  .modal-primary-btn {
    color: #fff !important;
    background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%) !important;
    box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2) !important;
    border: none !important;
    font-weight: 600;

    &:hover {
      background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%) !important;
      opacity: 0.92;
      box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2) !important;
    }
  }
}

.rule-detail-section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a2a3d;
  margin-bottom: 12px;
  padding-left: 10px;
  border-left: 3px solid #2d78ff;
  line-height: 18px;
}
.rule-detail-section {
  margin-bottom: 20px;
}
.rule-detail-body {
  padding: 10px ;
}
</style>

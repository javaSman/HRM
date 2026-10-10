<template>
  <!--
    LeaveResumptionApplyLog.vue
    销假审批日志时间轴抽屉组件
  -->
  <a-drawer
    title="审批流程"
    placement="right"
    :closable="false"
    :visible="LCshow"
    width="480"
    :bodyStyle="drawerBodyStyle"
    wrapClassName="attendance-rule-drawer"
    @close="out"
  >
    <div v-if="flowList.length > 0" class="timeline-wrap">
      <div
        v-for="(item, index) in flowList"
        :key="index"
        class="timeline-item"
        :class="{
          active: item.status === 'active',
          done: item.status === 'done',
          rejected: item.status === 'rejected',
          returned: item.status === 'returned',
          cancel: item.status === 'cancel',
        }"
      >
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div class="timeline-title">
            <span>{{ item.nodeName || item.name }}</span>
            <span class="timeline-time">{{ item.createTime || item.time || '' }}</span>
          </div>
          <div class="timeline-user">
            <template v-if="item.sprName || item.user">{{ item.sprName || item.user }}</template>
            <template v-else>-</template>
          </div>
          <div v-if="item.spOpinion || item.opinion" class="timeline-opinion">
            {{ item.spOpinion || item.opinion }}
          </div>
        </div>
      </div>
    </div>
    <a-empty v-else description="暂无审批记录" />

    <div class="drawer-footer">
      <a-button @click="out" style="margin-bottom: 0">关闭</a-button>
    </div>
  </a-drawer>
</template>

<script>
import { getAction } from '@/api/manage'

export default {
  name: 'LeaveResumptionApplyLog',
  props: {
    LCshow: { type: Boolean, default: false },
    LCid: { type: String, default: null },
    LCdata: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      flowList: [],
      drawerBodyStyle: {
        paddingBottom: '68px',
        overflowY: 'auto',
      },
      url: {
        flowList: '/hr_kq_xjgl/hrKqXjgl/getFlowList',
      },
    }
  },
  watch: {
    LCshow(val) {
      if (val && this.LCid) {
        this.loadFlowList()
      }
    },
  },
  methods: {
    loadFlowList() {
      this.flowList = []
      getAction(this.url.flowList, { id: this.LCid }).then((res) => {
        if (res.success) {
          this.flowList = res.result || []
        }
      })
    },
    out() {
      this.$emit('out', false)
    },
  },
}
</script>

<style scoped lang="less">
.drawer-footer {
  position: absolute;
  bottom: -8px;
  width: 100%;
  border-top: 1px solid #e8e8e8;
  padding: 10px 16px;
  text-align: right;
  left: 0;
  background: #fff;
  border-radius: 0 0 2px 2px;
}

.timeline-wrap {
  position: relative;
  padding-left: 20px;

  &::before {
    content: '';
    position: absolute;
    left: 7px;
    top: 8px;
    bottom: 8px;
    width: 2px;
    background: #e8e8e8;
  }
}

.timeline-item {
  position: relative;
  padding-bottom: 24px;

  &:last-child {
    padding-bottom: 0;
  }

  &.done .timeline-dot {
    background: #52c41a;
    border-color: #52c41a;
  }

  &.active .timeline-dot {
    background: #1890ff;
    border-color: #1890ff;
    box-shadow: 0 0 0 4px rgba(24, 144, 255, 0.2);
  }

  &.rejected .timeline-dot {
    background: #ff4d4f;
    border-color: #ff4d4f;
  }

  &.returned .timeline-dot {
    background: #fa8c16;
    border-color: #fa8c16;
  }

  &.cancel .timeline-dot {
    background: #bfbfbf;
    border-color: #bfbfbf;
  }
}

.timeline-dot {
  position: absolute;
  left: -16px;
  top: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #d9d9d9;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px #d9d9d9;
  z-index: 1;
}

.timeline-content {
  padding-left: 8px;
}

.timeline-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.timeline-time {
  font-size: 12px;
  color: #999;
  font-weight: normal;
}

.timeline-user {
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}

.timeline-opinion {
  font-size: 13px;
  color: #888;
  background: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  line-height: 1.6;
  border: 1px solid #e8e8e8;
}
</style>

<style>
.attendance-rule-drawer .ant-drawer-header {
  padding: 16px 24px;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  border-bottom: 0;
}

.attendance-rule-drawer .ant-drawer-title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.attendance-rule-drawer .ant-drawer-close {
  color: #fff;
}

.attendance-rule-drawer .ant-drawer-body {
  padding: 20px 24px;
  background: #f8fafc;
}

.attendance-rule-drawer .ant-drawer-footer {
  border-top: 1px solid #e2e8f0;
  background: #fff;
}
</style>

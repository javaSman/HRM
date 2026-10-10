<template>
  <j-modal
    class="recruitment-view-modal"
    :title="title"
    :width="mode === 'sp' ? 1800 : 1500"
    :visible="visible"
    switchFullscreen
    :dialog-style="{ top: '40px' }"
    :bodyStyle="bodyStyle"
    @cancel="close"
  >
    <div class="view-layout">
      <!-- 左栏：岗位 / 申请信息 -->
      <div class="panel-card view-left">
        <div class="panel-title">
          <span class="panel-title-bar"></span>
          <span class="panel-title-text">{{ mode === 'sp' ? '申请信息' : '岗位信息' }}</span>
        </div>
        <div class="panel-body">
          <apply-info-block :model="record" readonly />
        </div>
      </div>

      <div class="panel-card view-right">
        <div class="panel-title">
          <span class="panel-title-bar"></span>
          <span class="panel-title-text">岗位说明</span>
        </div>
        <div class="panel-body">
          <job-desc-block class="view-desc" :model="record" readonly />
        </div>
      </div>



      <!-- 中栏：招聘信息(xq) / 审批信息(sp) -->
      <div v-if="mode === 'sp'" class="panel-card view-middle">
        <div class="panel-title">
          <span class="panel-title-bar"></span>
          <span class="panel-title-text">{{ mode === 'sp' ? '审批信息' : '招聘信息' }}</span>
        </div>
        <div class="panel-body">
          <approve-info-block ref="approveBlock" :mindata="record" />
        </div>
      </div>

      <!-- 右栏：审批流程留白 -->
      <div class="panel-card view-right">
        <div class="panel-title">
          <span class="panel-title-bar"></span>
          <span class="panel-title-text">审批流程</span>
        </div>
        <div class="panel-body">
          <log-flow v-if="record.id" :applyId="record.id" :LCdata="record" />
        </div>
      </div>
    </div>

    <template slot="footer">
      <template v-if="mode === 'sp'">
        <a-button @click="close">取消</a-button>
        <a-button type="primary" @click="handleApproveSubmit">提交</a-button>
      </template>
      <a-button v-else @click="close">关闭</a-button>
    </template>
  </j-modal>
</template>

<script>
import Vue from 'vue'

import ApplyInfoBlock from './blocks/ApplyInfoBlock'
import JobDescBlock from './blocks/JobDescBlock'
import RecruitStatsBlock from './blocks/RecruitStatsBlock'
import ApproveInfoBlock from './blocks/ApproveInfoBlock'
import logFlow from '@comp/common/process/lookIndex'
import { httpAction } from '@/api/manage'

export default {
  name: 'RecruitmentApplyDetailModal',
  components: {
    ApplyInfoBlock,
    JobDescBlock,
    RecruitStatsBlock,
    ApproveInfoBlock,
    logFlow,
  },
  data() {
    return {
      visible: false,
      mode: 'xq',
      record: {},
      bodyStyle: {
        maxHeight: 'calc(100vh - 168px)',
        overflowY: 'auto',
        padding: '20px 24px 16px',
        background: '#f0f3f8',
      },
      url: {
        updateSpStatus: '/zpManage/hrmYrsq/updateSpStatus',
      },
    }
  },
  computed: {
    title() {
      return this.mode === 'sp' ? '审批' : '详情'
    },
  },
  methods: {
    open(record, mode) {
      this.record = Object.assign({}, record, {
        name: record.fqr,
      })
      this.mode = mode === 'sp' ? 'sp' : 'xq'
      this.visible = true
    },
    close() {
      this.visible = false
    },
    sharedSubmit(record,value){
      let userInfo = Vue.ls.get('perInfo')
      console.log('审批提交：', value, userInfo, record)
       // 审批提交留白，待对接接口
      httpAction(
        this.url.updateSpStatus,
        {
          id: record.id,
          currentSpId: userInfo.id,
          spStatus: value.result,
          spOpinion: value.comment,
        },
        'post'
      ).then((res) => {
        if (res.success) {
          this.$message.success(res.message)
          this.$emit('ok')
          this.close()
        }else{
          this.$message.warning(res.message)
        }
      })
    },
    handleApproveSubmit() {
      const value = this.$refs.approveBlock ? this.$refs.approveBlock.getValue() : {}
      this.sharedSubmit(this.record,value)
    },
  },
}
</script>

<style scoped lang="less">
::v-deep .anticon {
  color: #fff;
}

.view-layout {
  display: flex;
  gap: 18px;
  align-items: stretch;
}

.panel-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #eef1f6;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(31, 56, 110, 0.06);
}

.panel-title {
  display: flex;
  align-items: center;
  padding: 14px 16px 10px;

  .panel-title-bar {
    display: inline-block;
    width: 4px;
    height: 16px;
    margin-right: 9px;
    border-radius: 3px;
    background: linear-gradient(180deg, #5b8cff 0%, #4a7bf7 100%);
  }

  .panel-title-text {
    color: #1f2d3d;
    font-size: 15px;
    font-weight: 600;
  }
}

.panel-body {
  flex: 1;
  padding: 4px 16px 16px;
}

.view-left {
  flex: 1;
  min-width: 0;
}

.view-middle,
.view-right {
  width: 400px;
  flex-shrink: 0;
}
</style>

<style lang="less">
.recruitment-view-modal {
  .ant-modal-content {
    overflow: hidden;
    border-radius: 10px;
  }

  .ant-modal-header {
    padding: 0 24px;
    border-bottom: 0;
    background: #4a7bf7;
  }

  .j-modal-title-row {
    min-height: 52px;
    align-items: center;

    .left {
      color: #fff;
      font-size: 16px;
      font-weight: 600;
    }

    .right .ant-modal-close,
    .ant-modal-close {
      color: rgba(255, 255, 255, 0.78);
    }

    .right .ant-modal-close:hover,
    .ant-modal-close:hover {
      color: #fff;
    }
  }

  .ant-modal-body {
    border-bottom: 1px solid #eef1f6;
  }

  .ant-modal-footer {
    padding: 14px 20px;
    border-top: 1px solid #eef1f6;
  }
}
</style>

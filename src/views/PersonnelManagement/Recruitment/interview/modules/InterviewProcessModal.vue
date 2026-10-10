<template>
  <j-modal
    class="recruitment-view-modal"
    :title="title"
    :width="readonly ? 1600 : 1050"
    :visible="visible"
    switchFullscreen
    :dialog-style="{ top: '40px' }"
    :bodyStyle="bodyStyle"
    @cancel="close"
  >
    <div class="ipm-body">
      <!-- 左一：岗位信息（仅详情） -->
      <div v-if="readonly" class="ipm-col ipm-post">
        <div class="col-title">岗位信息</div>
        <div class="info-grid">
          <div class="field">
            <span class="field-label">公司</span>
            <div class="field-value">{{ companyText }}</div>
          </div>
          <div class="field">
            <span class="field-label">所属部门</span>
            <div class="field-value">{{ formatValue(plan.dept_dictText) }}</div>
          </div>
          <div class="field">
            <span class="field-label">岗位名称</span>
            <div class="field-value">{{ formatValue(plan.postId_dictText) }}</div>
          </div>
          <div class="field">
            <span class="field-label">职级名称</span>
            <div class="field-value">{{ formatValue(plan.levelId_dictText) }}</div>
          </div>
          <div class="field">
            <span class="field-label">员工类型</span>
            <div class="field-value">{{ formatValue(plan.employeeType) }}</div>
          </div>
          <div class="field">
            <span class="field-label">性别要求</span>
            <div class="field-value">{{ formatValue(plan.xb) }}</div>
          </div>
          <div class="field">
            <span class="field-label">最低薪资</span>
            <div class="field-value">{{ formatValue(plan.zdxz) }}</div>
          </div>
          <div class="field">
            <span class="field-label">最高薪资</span>
            <div class="field-value">{{ formatValue(plan.zgxz) }}</div>
          </div>
          <div class="field">
            <span class="field-label">专业</span>
            <div class="field-value">{{ formatValue(plan.zy) }}</div>
          </div>
          <div class="field">
            <span class="field-label">年龄下限</span>
            <div class="field-value">{{ formatValue(plan.nlxx) }}</div>
          </div>
          <div class="field">
            <span class="field-label">年龄上限</span>
            <div class="field-value">{{ formatValue(plan.nlsx) }}</div>
          </div>
          <div class="field">
            <span class="field-label">希望到岗日期</span>
            <div class="field-value">{{ formatValue(plan.xwdgrq) }}</div>
          </div>
          <div class="field">
            <span class="field-label">最低学历</span>
            <div class="field-value">{{ formatValue(plan.zdxl_dictText || plan.zdxl) }}</div>
          </div>
          <div class="field">
            <span class="field-label">经验要求</span>
            <div class="field-value">{{ formatValue(plan.jyyq) }}</div>
          </div>
          <div class="field">
            <span class="field-label">申请原因</span>
            <div class="field-value">{{ formatValue(plan.sqyy) }}</div>
          </div>
          <div class="field field-full">
            <span class="field-label">面试官</span>
            <div class="field-value">{{ formatValue(plan.msg) }}</div>
          </div>
          <div class="field field-full">
            <span class="field-label">任职要求</span>
            <div class="field-value area-value">{{ formatValue(plan.rzyq) }}</div>
          </div>
          <div class="field field-full">
            <span class="field-label">岗位职责</span>
            <div class="field-value area-value">{{ formatValue(plan.gwzz) }}</div>
          </div>
        </div>
      </div>

      <!-- 左：批量人员列表（仅批量评审） -->
      <div v-if="!readonly" class="ipm-col ipm-people">
        <div class="col-title">人员列表</div>
        <div class="people-scroll">
          <div
            v-for="item in people"
            :key="item.id"
            :class="['person-card', activeId === item.id ? 'active' : '']"
            @click="selectPerson(item)"
          >
            <div :class="['avatar', item.xb === '女' ? 'female' : 'male']">
              {{ (item.xm || '?').charAt(0) }}
            </div>
            <span class="p-name">{{ formatValue(item.xm) }}</span>
            <span class="p-meta">{{ item.nl ? item.nl + '岁' : '-' }}</span>
            <a-icon class="p-sex" :type="item.xb === '女' ? 'woman' : 'man'" />
          </div>
        </div>
      </div>

      <!-- 中：个人信息（只读） -->
      <div class="ipm-col ipm-personal">
        <div class="col-title">
          个人信息
          <a-tag class="state-tag" :color="ztColor(reviewForm.zt)">{{ formatValue(reviewForm.zt) }}</a-tag>
        </div>
        <div class="personal-box">
          <div class="field field-full">
            <span class="field-label">简历标题</span>
            <div class="field-value">{{ formatValue(activeRecord.jlbt) }}</div>
          </div>
          <div class="field">
            <span class="field-label">姓名</span>
            <div class="field-value">{{ formatValue(activeRecord.xm) }}</div>
          </div>
          <div class="field">
            <span class="field-label">性别</span>
            <div class="field-value">{{ formatValue(activeRecord.xb) }}</div>
          </div>
          <div class="field">
            <span class="field-label">年龄</span>
            <div class="field-value">
              {{activeRecord.nl === undefined || activeRecord.nl === null || activeRecord.nl === ''? '-': activeRecord.nl}}
            </div>
          </div>
          <div class="field">
            <span class="field-label">学历</span>
            <div class="field-value">{{ formatValue(activeRecord.xl) }}</div>
          </div>
          <div class="field">
            <span class="field-label">专业</span>
            <div class="field-value">{{ formatValue(activeRecord.zy) }}</div>
          </div>
          <div class="field">
            <span class="field-label">期望薪资(k)</span>
            <div class="field-value">
              {{
                activeRecord.qwxz === undefined || activeRecord.qwxz === null || activeRecord.qwxz === ''
                  ? '-'
                  : activeRecord.qwxz
              }}
            </div>
          </div>
          <div class="field">
            <span class="field-label">手机号</span>
            <div class="field-value">{{ formatValue(activeRecord.sjh) }}</div>
          </div>
          <div class="field">
            <span class="field-label">邮箱</span>
            <div class="field-value">{{ formatValue(activeRecord.yx) }}</div>
          </div>
          <div class="field field-full">
            <span class="field-label">简历附件</span>
            <div class="field-value">
              <j-upload v-if="activeRecord.jlFujian" v-model="activeRecord.jlFujian" disabled />
              <span v-else>-</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右二：面试信息（仅详情） -->
      <div v-if="readonly" class="ipm-col ipm-interview">
        <div class="col-title">{{ stageText }}信息</div>
        <div class="info-grid">
          <div class="field">
            <span class="field-label">面试人</span>
            <div class="field-value">{{ formatValue(interviewInfo.msr) }}</div>
          </div>
          <div class="field">
            <span class="field-label">面试形式</span>
            <div class="field-value">{{ formatValue(interviewInfo.msxs) }}</div>
          </div>
          <div class="field">
            <span class="field-label">面试时间</span>
            <div class="field-value">{{ formatValue(interviewInfo.mssj) }}</div>
          </div>
          <div class="field">
            <span class="field-label">最晚确认时间</span>
            <div class="field-value">{{ formatValue(interviewInfo.zwmssj) }}</div>
          </div>
          <div class="field">
            <span class="field-label">需要携带材料</span>
            <div class="field-value">{{ formatValue(materialText(interviewInfo.xyxdcl)) }}</div>
          </div>
          <div class="field">
            <span class="field-label">面试地点</span>
            <div class="field-value">{{ formatValue(interviewInfo.msdd) }}</div>
          </div>
          <div class="field">
            <span class="field-label">邀约人</span>
            <div class="field-value">{{ formatValue(interviewInfo.yyr) }}</div>
          </div>
          <div class="field">
            <span class="field-label">邀约时间</span>
            <div class="field-value">{{ formatValue(interviewInfo.yysj) }}</div>
          </div>
          <div class="field field-full">
            <span class="field-label">备注</span>
            <div class="field-value area-value">{{ formatValue(interviewInfo.remark) }}</div>
          </div>
        </div>
      </div>

      <!-- 右一：评审（详情只读 / 批量可编辑） -->
      <div class="ipm-col ipm-review">
        <div class="col-title">
          {{ stageText }}评审
          <span v-if="!readonly" class="unify-tip">以下信息将统一应用于全部候选人</span>
        </div>
        <!-- 详情：只读 -->
        <div v-if="readonly" class="info-grid">
          <div class="field field-full">
            <span class="field-label">评审时间</span>
            <div class="field-value">{{ formatValue(reviewForm.pssj) }}</div>
          </div>
          <div class="field field-full">
            <span class="field-label">评审人</span>
            <div class="field-value">{{ formatValue(reviewForm.psr) }}</div>
          </div>
          <div class="field field-full">
            <span class="field-label">{{ stageText }}结论</span>
            <div class="field-value">{{ formatValue(reviewForm.jl) }}</div>
          </div>
          <div class="field field-full">
            <span class="field-label">{{ stageText }}评审意见</span>
            <div class="field-value area-value">{{ formatValue(reviewForm.psyj) }}</div>
          </div>
        </div>
        <!-- 批量：可编辑 -->
        <a-form-model v-else layout="vertical" class="ipm-form">
          <a-form-model-item :label="stageText + '结论'" required>
            <a-radio-group v-model="form.jl">
              <a-radio value="通过">通过</a-radio>
              <a-radio value="不通过" style="margin-left: 120px">不通过</a-radio>
            </a-radio-group>
          </a-form-model-item>
          <a-form-model-item :label="stageText + '评审意见'">
            <a-textarea
              v-model.trim="form.psyj"
              :autoSize="{ minRows: 10, maxRows: 14 }"
              placeholder="请输入评审意见"
            />
          </a-form-model-item>
        </a-form-model>
      </div>
    </div>

    <template slot="footer">
      <a-button @click="close">{{ readonly ? '关闭' : '取消' }}</a-button>
      <a-button v-if="!readonly" type="primary" class="ipm-submit" @click="handleSubmit">提交</a-button>
    </template>
  </j-modal>
</template>

<script>
import { httpAction, getAction,getFileAccessHttpUrl } from '@/api/manage'
import { formatDate } from '@/utils/util'

import Vue from 'vue'

const STAGE_TEXT_MAP = { 1: '初试', 2: '复试', 3: '终审' }

function getFileName(path) {
  if (!path) return ''
  const normalizedPath = String(path).replace(/\\/g, '/')
  return normalizedPath.substring(normalizedPath.lastIndexOf('/') + 1) || '简历附件'
}

function createEmptyForm() {
  return { jl: '通过', psyj: '' }
}

export default {

  name: 'InterviewProcessModal',
  data() {
    return {
      visible: false,
      // detail / batchReview
      mode: 'detail',
      stage: 1,
      people: [],
      activeId: '',
      record: {},
      reviewForm: {},
      form: createEmptyForm(),
      bodyStyle: { maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', padding: '16px 20px' },
      confirmLoading: false,
      // TODO: 后端批量评审接口确认后替换
      plan: {},
      url: {
        Plan: '/zpManage/hrmZpjh/list',
        reviewBatch: '/zpManage/hrmMsgl/reviewBatch'
       }
    }
  },
  computed: {
    companyText() {
      return String(this.plan.deptPath || '').split('/')[0] || '-'
    },
    title() {
      return this.readonly ? '详情' : '批量评审'
    },
    readonly() {
      return this.mode === 'detail'
    },
    stageText() {
      return STAGE_TEXT_MAP[this.stage] || '初试'
    },
    activeRecord() {
      if (this.mode === 'detail') {
        return this.record
      }
      return this.people.find((item) => item.id === this.activeId) || this.people[0] || {}
    },
    stageFields() {
      const map = {
        1: { r: 'msr', xs: 'msxs', sj: 'mssj', zwSj: 'zwmssj', cl: 'xyxdcl', dd: 'msdd', yr: 'yyr', ysj: 'yysj', bz: 'remark' },
        2: { r: 'fsmsr', xs: 'fsmsxs', sj: 'fsmsSj', zwSj: 'fszwmssj', cl: 'fsxyxdcl', dd: 'fsmsdd', yr: 'fsyyr', ysj: 'fsyysj', bz: 'fsremark' },
        3: { r: 'zsmsr', xs: 'zsmsxs', sj: 'zsmsSj', zwSj: 'zszwmssj', cl: 'zsxyxdcl', dd: 'zsmsdd', yr: 'zsyyr', ysj: 'zsyysj', bz: 'zsremark' },
      }
      return map[this.stage] || map[1]
    },
    interviewInfo() {
      const r = this.record
      const f = this.stageFields
      return {
        msr: r[f.r],
        msxs: r[f.xs],
        mssj: r[f.sj],
        zwmssj: r[f.zwSj],
        xyxdcl: r[f.cl],
        msdd: r[f.dd],
        yyr: r[f.yr],
        yysj: r[f.ysj],
        remark: r[f.bz],
      }
    }
  },
  methods: {
    // 单条详情（只读）
    detail(record, stage) {
      this.mode = 'detail'
      this.stage = stage || 1
      this.people = []
      this.activeId = ''

      let OBJ = {
        1:{
          zt:record.csmsZt,
            pssj:record.csmsPssj,
            psr:record.csmsPsr,
            jl:record.csmsJl,
            psyj:record.csmsPsyj,
        },
        2:{
          zt:record.fsmsZt,
            pssj:record.fsmsPssj,
            psr:record.fsmsPsr,
            jl:record.fsmsJl,
            psyj:record.fsmsPsyj,
        },
        3:{
          zt:record.zsmsZt,
            pssj:record.zsmsPssj,
            psr:record.zsmsPsr,
            jl:record.zsmsJl,
            psyj:record.zsmsPsyj,
        }
      }

      this.reviewForm  = Object.assign({}, OBJ[stage])
      this.record = Object.assign({}, record)

      this.loadPlan()
      this.visible = true
    },
    // 批量评审
    batchReview(rows, stage) {
      const list = Array.isArray(rows) ? rows : []
      if (!list.length) {
        this.$message.warning('请先勾选候选人')
        return
      }
      this.mode = 'batchReview'
      this.stage = stage || 1
      this.people = list.slice()
      // 默认读取第一条；批量内容为固定对象，仅初始化一次
      this.activeId = list[0].id
      this.record = {}
      this.form = createEmptyForm()
      this.visible = true
    },
    // 按招聘计划ID查计划数据，展示左侧岗位信息
    loadPlan() {
      if (!this.record.zpjhid) return
      getAction(this.url.Plan, { id: this.record.zpjhid }).then((res) => {
        if (res && res.success) {
          const records = res.result.records || res.result
          this.plan = (Array.isArray(records) && records[0]) || {}
        }
      })
    },


    selectPerson(item) {
      // 仅切换中间个人信息，不重置右侧批量内容
      this.activeId = item.id
    },

    // 将固定批量内容覆盖到每一条勾选数据
    buildPayload() {
      let userInfo = Vue.ls.get('perInfo')
      let stageform = {
        1:{
          csmsPssj: formatDate(new Date().getTime(),'yyyy-MM-dd hh:mm:ss'),
            csmsPsr: userInfo.name,
            csmsJl: this.form.jl,
            csmsPsyj: this.form.psyj,
        },
        2:{
          fsmsPssj: formatDate(new Date().getTime(),'yyyy-MM-dd hh:mm:ss'),
            fsmsPsr: userInfo.name,
            fsmsJl: this.form.jl,
            fsmsPsyj: this.form.psyj,
        },
        3:{
          zsmsPssj: formatDate(new Date().getTime(),'yyyy-MM-dd hh:mm:ss'),
            zsmsPsr: userInfo.name,
            zsmsJl: this.form.jl,
            zsmsPsyj: this.form.psyj,
        }
      }
        return this.people.map((item) => Object.assign({ id: item.id }, stageform[this.stage]))
    },

    handleSubmit() {
      if (!this.form.jl) {
        this.$message.warning('请选择评审结论')
        return
      }
      let stageurl = {
        1:'/zpManage/hrmMsgl/reviewFirst',
        2:'/zpManage/hrmMsgl/reviewSecond',
        3:'/zpManage/hrmMsgl/reviewFinal'
      }
      let url =stageurl[this.stage]
      const payload = this.buildPayload()

      this.confirmLoading = true
      httpAction(url, payload, 'post')
        .then((res) => {
          if (res.success) {
            this.$message.success(res.message || '批量评审成功')
            this.$emit('ok')
            this.close()
          } else {
            this.$message.warning(res.message || '批量评审失败')
          }
        })
        .catch(() => {
          this.$message.error('批量评审失败，请稍后重试')
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
    ztColor(text) {
      switch (text) {
        case '待初试':
        case '待复试':
        case '待终试':
          return 'orange'
        case '初试通过':
        case '复试通过':
        case '终试通过':
          return 'green'
        case '初试不通过':
        case '复试不通过':
        case '终试不通过':
          return 'red'
      default:
        return ''
      }
    },
    formatValue(value) {
      return value === undefined || value === null || (typeof value === 'string' && value.trim() === '') ? '-' : value
    },
    materialText(value) {
      const map = { id: '身份证', resume_copy: '简历复印件', both: '身份证 + 简历复印件' }
      return map[value]
    },
    close() {
      this.visible = false
    }
  }
}
</script>

<style scoped lang="less">
::v-deep .ant-modal-close-x .anticon {
  color: #fff;
}
.ipm-body {
  display: flex;
  gap: 14px;
  min-height: 420px;
}

.ipm-col {
  min-width: 0;
  border: 1px solid #eef1f6;
  border-radius: 10px;
  background: #fff;
}

.col-title {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid #f0f2f5;
  color: #262626;
  font-size: 15px;
  font-weight: 700;

  .state-tag {
    margin-right: 0;
  }
}

/* 岗位 / 面试 / 评审 只读列 */
.ipm-post,
.ipm-interview,
.ipm-review {
  flex: 1 1 0;
}

/* 左侧人员列表 */
.ipm-people {
  flex: 0 0 240px;
}

.people-scroll {
  max-height: calc(100vh - 240px);
  padding: 10px;
  overflow-y: auto;
}

.person-card {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 10px;
  border: 1px solid #eef0f4;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #9cc0ff;
    background: #f5f9ff;
  }

  &.active {
    border-color: #2d78ff;
    background: #eef4ff;
    box-shadow: 0 0 0 1px #2d78ff inset;
  }

  .avatar {
    flex: 0 0 36px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    color: #fff;
    font-size: 15px;
    line-height: 36px;
    text-align: center;
  }

  .avatar.male {
    background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  }

  .avatar.female {
    background: linear-gradient(135deg, #ff7eb3 0%, #ff5c8a 100%);
  }

  .p-name {
    color: #262626;
    font-size: 13px;
    font-weight: 600;
  }

  .p-meta {
    color: #8c8c8c;
    font-size: 12px;
  }

  .p-sex {
    margin-left: auto;
    color: #b8c0cc;
  }
}

/* 中间个人信息列 */
.ipm-personal {
  flex: 1 1 0;
}

.info-grid,
.personal-box {
  display: flex;
  flex-wrap: wrap;
  gap: 0 12px;
  padding: 14px;
  max-height: 600px;
  overflow: auto;

  .field {
    flex: 1 1 calc(50% - 12px);
    margin-bottom: 12px;
  }

  .field-full {
    flex: 1 1 100%;
  }
}
.field-full {
  .field-value {
    width: 340px;
  }
}

.field-label {
  display: block;
  margin-bottom: 6px;
  color: #5a6472;
  font-size: 13px;
}

.field-value {
  min-height: 36px;
  padding: 7px 11px;
  border: 1px solid #e5e9f0;
  border-radius: 6px;
  background: #fafbfc;
  color: #262626;
  font-size: 13px;
  line-height: 20px;
  word-break: break-all;
}

.area-value {
  min-height: 80px;
  white-space: pre-wrap;
}

.file-link {
  color: #2d78ff;
}

/* 右侧批量评审表单 */
.ipm-form {
  padding: 14px 14px 0;

  /deep/ .ant-form-item {
    margin-bottom: 12px;
  }
}

.unify-tip {
  margin-left: auto;
  padding: 3px 10px;
  border: 1px solid #9fd0e6;
  border-radius: 4px;
  background: #e3f4fb;
  color: #2b7a96;
  font-size: 12px;
  font-weight: 400;
}

.ipm-submit {
  border: 0;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2);
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
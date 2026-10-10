<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container>
      <a-form-model
        ref="form"
        slot="detail"
        layout="vertical"
        :model="model"
        :rules="validatorRules"
        class="recruitment-modal-form"
      >
        <div class="form-dual-layout">
          <div class="panel-card form-left">
            <div class="panel-title">
              <span class="panel-title-bar"></span>
              <span class="panel-title-text">岗位信息</span>
            </div>
            <div class="panel-body">
              <apply-info-block ref="infoBlock" :model="model" />
            </div>
          </div>
          <div class="panel-card form-right">
            <div class="panel-title">
              <span class="panel-title-bar"></span>
              <span class="panel-title-text">岗位说明</span>
            </div>
            <div class="panel-body">
              <job-desc-block :model="model" />
            </div>
          </div>
           <div class="panel-card form-right">
            <div class="panel-title">
              <span class="panel-title-bar"></span>
              <span class="panel-title-text">审批流程</span>
            </div>
            <div class="panel-body">
              <log-flow :key="model.id || model.sourceApplyId || 'new'" ref="approvalProcess" sqmkCode="用人申请"  :dept="model.dept" :no="model.fqrgh" :saved-nodes="model.customProcessConfigurationDTOList" />
            </div>
          </div>
        </div>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>
import { httpAction } from '@/api/manage'
import ApplyInfoBlock from './blocks/ApplyInfoBlock'
import JobDescBlock from './blocks/JobDescBlock'

import logFlow from '@comp/common/process/setIndex'


function getNowText() {
  const date = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return (
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    ' ' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes()) +
    ':' +
    pad(date.getSeconds())
  )
}

function getDateText(value) {
  return value ? String(value).slice(0, 10) : ''
}

function getDateTimeText(value) {
  if (!value) {
    return ''
  }
  const text = String(value)
  return text.length === 10 ? text + ' 00:00:00' : text
}

function createDefaultModel() {
  return {
    id: '',
    sourceApplyId: '',
    dept: '',
    deptName: '',
    deptPath: '',
    companyId: '',
    postId: '',
    levelId: '',
    employeeType: undefined,
    zprs: undefined,
    zdxz: undefined,
    zgxz: undefined,
    nlxx: undefined,
    nlsx: undefined,
    xb: undefined,
    zy: '',
    zdxl: undefined,
    jyyq: '',
    rzyq: '',
    gwzz: '',
    sqyy: undefined,
    msg: '',
    xwdgrq: '',
    syzprs: undefined,
    rzrs: undefined,
    jlsl: undefined,
    msrs: undefined,
    offerrs: undefined,
    fqr: '',
    fqrgh: '',
    zt: '审批中',
    fqsj: '',
    xh: '',
  }
}

export default {
  name: 'RecruitmentApplyForm',
  components: { ApplyInfoBlock, JobDescBlock, logFlow },
  data() {
    return {
      confirmLoading: false,
      model: createDefaultModel(),
      url: {
        add: '/zpManage/hrmYrsq/add',
        edit: '/zpManage/hrmYrsq/edit',
      },
      validatorRules: {
        dept: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
        postId: [{ required: true, message: '请选择岗位名称', trigger: 'change' }],
        levelId: [{ required: true, message: '请选择职级名称', trigger: 'change' }],
        employeeType: [{ required: true, message: '请选择员工类型', trigger: 'change' }],
        zprs: [{ required: true, message: '请输入招聘人数', trigger: 'change' }],
        zdxz: [{ required: true, message: '请输入最低薪资', trigger: 'change' }],
        zgxz: [{ required: true, message: '请输入最高薪资', trigger: 'change' }],
        nlxx: [{ required: true, message: '请输入年龄下限', trigger: 'change' }],
        nlsx: [{ required: true, message: '请输入年龄上限', trigger: 'change' }],
        xb: [{ required: true, message: '请选择性别', trigger: 'change' }],
        zdxl: [{ required: true, message: '请选择最低学历', trigger: 'change' }],
        jyyq: [{ required: true, message: '请输入经验要求', trigger: 'blur' }],
        rzyq: [{ required: true, message: '请输入任职要求', trigger: 'blur' }],
        gwzz: [{ required: true, message: '请输入岗位职责', trigger: 'blur' }],
        sqyy: [{ required: true, message: '请选择申请原因', trigger: 'change' }],
        msg: [{ required: true, message: '请选择面试官', trigger: 'change' }],
        xwdgrq: [{ required: true, message: '请选择希望到岗日期', trigger: 'change' }],
      },
    }
  },
  methods: {
    add() {
      this.model = createDefaultModel()
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
        this.$refs.infoBlock && this.$refs.infoBlock.reset()
      })
    },
    edit(record) {
      this.setModelFromRecord(record, false)
    },
    reapply(record) {
      this.setModelFromRecord(record, true)
    },
    setModelFromRecord(record, asReapply) {
      const currentRecord = record || {}
      this.model = Object.assign(createDefaultModel(), {
        ...currentRecord,
        sourceApplyId: asReapply ? currentRecord.id || '' : currentRecord.sourceApplyId || '',
        xwdgrq: getDateText(currentRecord.xwdgrq),
        zt: asReapply ? '审批中' : currentRecord.zt || '审批中',
        fqsj: asReapply ? '' : currentRecord.fqsj || '',
        xh: asReapply ? '' : currentRecord.xh || '',
      })
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
        this.$refs.infoBlock && this.$refs.infoBlock.loadFromModel()
      })
    },
    buildSubmitPayload() {
      const userInfo = (this.$store && this.$store.getters && this.$store.getters.userInfo) || {}
      const payload = Object.assign({}, this.model, {
        xwdgrq: getDateText(this.model.xwdgrq),
        fqr: this.model.fqr || userInfo.realname || userInfo.username || '',
        fqrgh: this.model.fqrgh || userInfo.username || '',
        fqsj: getDateTimeText(this.model.fqsj) || getNowText(),
        zt: this.model.zt || '审批中',
        customProcessConfigurationDTOList: this.$refs.approvalProcess.getCustomProcessList(),
      })
      if (this.model.id) {
        payload.id = this.model.id
      }
      return payload
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid) {
          this.$message.warning('请完善必填信息')
          return
        }
        if (Number(this.model.zgxz) < Number(this.model.zdxz)) {
          this.$message.warning('最高薪资不能低于最低薪资')
          return
        }
        if (Number(this.model.nlsx) < Number(this.model.nlxx)) {
          this.$message.warning('年龄上限不能低于年龄下限')
          return
        }
        this.confirmLoading = true
        const payload = this.buildSubmitPayload()



        const httpurl = payload.id ? this.url.edit : this.url.add
        const method = payload.id ? 'put' : 'post'



        httpAction(httpurl, payload, method)
          .then((res) => {
            if (res.success) {
              this.$message.success(res.message || (payload.id ? '用人申请已更新' : '用人申请已提交'))
              this.$emit('ok')
            } else {
              this.$message.warning(res.message || '用人申请提交失败')
            }
          })
          .finally(() => {
            this.confirmLoading = false
          })
      })
    },
  },
}
</script>

<style scoped lang="less">
.recruitment-modal-form {
  min-height: 400px;
}
/deep/ .ant-form-item {
  margin-bottom: 8px;
}

.form-dual-layout {
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
  padding: 14px 16px 6px;

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
  padding: 8px 16px 12px;
}

.form-left {
  flex: 1;
  min-width: 0;
}

.form-right {
  width: 360px;
  flex-shrink: 0;
}

</style>

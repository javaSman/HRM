<template>
  <j-modal
    :title="modalTitle"
    :width="1200"
    :visible="visible"
    :okClose="false"
    switchFullscreen
    :fullscreen.sync="isFullscreen"
    :maskClosable="!operationBusy"
    :keyboard="!operationBusy"
    :bodyStyle="bodyStyle"
    :dialogStyle="dialogStyle"
    @cancel="close"
  >
    <div v-if="loading" class="arrival-modal-loading"><a-spin tip="正在加载入职详情..." /></div>
    <div v-else-if="loadError" class="arrival-modal-error">
      <a-alert type="error" show-icon :message="loadError" />
      <a-button type="primary" icon="reload" @click="queryDetail">重新加载</a-button>
    </div>
    <onboarding-arrival-content
      v-else-if="detail"
      ref="content"
      :detail="detail"
      :form-model="formModel"
      :field-options="fieldOptions"
    />

    <template slot="footer">
      <a-button :loading="drafting" :disabled="!canDraft" @click="handleDraft">暂存资料</a-button>
      <a-button :disabled="operationBusy" @click="close">取消</a-button>
      <a-button type="primary" :loading="submitting" :disabled="!canSubmit" @click="handleOk">确认到岗</a-button>
    </template>
  </j-modal>
</template>

<script>
import { postAction } from '@/api/manage'
import OnboardingArrivalContent from './OnboardingArrivalContent.vue'
import Vue from 'vue'
import {
  buildConfirmOnboardingPayload,
  buildDraftOnboardingPayload,
  createArrivalModel,
  createEditableArrivalDetail,
  isConfirmDetail,
} from './onboardingArrivalModel'
import {
  fetchConstractBelongOptions,
  includeCurrentConstractBelong,
} from '../../onboardingSupplement/contractBelongOptions'

const QUERY_URL = '/ryManage/hrmRzgl/queryDetl'
const DRAFT_URL = '/ryManage/hrmRzgl/editOnboarding'
const CONFIRM_URL = '/ryManage/hrmRzgl/confirmOnboarding'

export default {
  name: 'OnboardingArrivalModal',
  components: { OnboardingArrivalContent },
  data() {
    return {
      visible: false,
      loading: false,
      drafting: false,
      submitting: false,
      record: {},
      detail: null,
      formModel: null,
      loadError: '',
      queryVersion: 0,
      isFullscreen: false,
      constractBelongOptions: [],
      contractOptionsLoading: false,
      contractOptionsLoaded: false,
    }
  },
  computed: {
    modalTitle() {
      const name = this.detail && this.detail.xm ? this.detail.xm : this.record.xm
      return `确定到岗${name ? ` - ${name}` : ''}`
    },
    operationBusy() {
      return this.drafting || this.submitting
    },
    canSubmit() {
      return Boolean(this.detail && this.formModel && !this.loading && !this.loadError && !this.operationBusy)
    },
    canDraft() {
      return Boolean(this.detail && this.formModel && !this.loading && !this.loadError && !this.operationBusy)
    },
    fieldOptions() {
      const currentValue = this.detail && this.detail.jbxx && this.detail.jbxx.constractBelong
      return { constractBelong: includeCurrentConstractBelong(this.constractBelongOptions, currentValue) }
    },
    // 固定 body 高度（而非 maxHeight），内部滚动区才能通过 flex 精确填满剩余空间，避免内容被 overflow:hidden 裁切
    bodyStyle() {
      return {
        padding: '14px 24px 12px',
        height: this.isFullscreen ? 'calc(100vh - 110px)' : 'calc(100vh - 190px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }
    },
    dialogStyle() {
      return { top: this.isFullscreen ? '0' : '15px' }
    },
  },
  methods: {
    open(record) {
      this.record = record || {}
      this.detail = null
      this.formModel = null
      this.loadError = ''
      this.drafting = false
      this.submitting = false
      this.isFullscreen = false
      this.visible = true
      this.queryDetail()
    },
    async queryDetail() {
      const phone = String(this.record.sjh || '').trim()
      const version = ++this.queryVersion
      this.detail = null
      this.formModel = null
      this.loadError = ''
      if (!phone) {
        this.loadError = '当前入职记录缺少手机号，无法查询完整资料'
        return
      }
      this.loading = true
      try {
        const res = await postAction(`${QUERY_URL}?phone=${encodeURIComponent(phone)}`)
        if (version !== this.queryVersion) return
        if (!res || !res.success || !isConfirmDetail(res.result)) {
          this.loadError = (res && res.message) || '入职详情数据不完整，请确认基本信息已补充'
          return
        }
        this.detail = createEditableArrivalDetail(res.result)
        this.formModel = createArrivalModel(this.detail)
        this.loadConstractBelongOptions()
      } catch (error) {
        if (version === this.queryVersion) this.loadError = '入职详情加载失败，请稍后重试'
      } finally {
        if (version === this.queryVersion) this.loading = false
      }
    },
    loadConstractBelongOptions() {
      if (this.contractOptionsLoaded || this.contractOptionsLoading) return Promise.resolve()
      this.contractOptionsLoading = true
      return fetchConstractBelongOptions()
        .then((options) => {
          this.constractBelongOptions = options
          this.contractOptionsLoaded = true
        })
        .catch(() => {
          this.constractBelongOptions = []
          this.$message.warning('合同归属选项加载失败，已保留当前值')
        })
        .finally(() => {
          this.contractOptionsLoading = false
        })
    },
    async handleDraft() {
      if (!this.canDraft) return
      this.drafting = true
      try {
        if (this.detail.jbxx) {
          //修改的是子表的信息。要同步更新主表和其他字段
          const { jbxx, rzsq } = this.detail
          const { no, employeeType, idCard, phoneNumber } = jbxx

          Object.assign(this.detail, {
            gh: no,
            yglx: employeeType,
            sfzh: idCard,
            sjh: phoneNumber,
          })

          if (rzsq) {
            rzsq.sfzh = idCard
            rzsq.sjhm = phoneNumber
          }
        }
        const payload = buildDraftOnboardingPayload(this.detail, this.formModel)
        const res = await postAction(DRAFT_URL, payload)
        if (!res || !res.success) {
          this.$message.warning((res && res.message) || '资料暂存失败')
          return
        }
        this.$message.success(res.message || '资料暂存成功')
      } catch (error) {
        this.$message.error(error.message || '资料暂存失败，请稍后重试')
      } finally {
        this.drafting = false
      }
    },
    handleOk() {
      if (!this.canSubmit) return
      this.$refs.content.validate((error) => {
        if (!error) this.submit()
      })
    },
    async submit() {
      if (this.operationBusy) return
      this.submitting = true
      try {
        if (this.detail.jbxx) {
          const { jbxx, rzsq } = this.detail
          const { no, employeeType, idCard, phoneNumber } = jbxx
          Object.assign(this.detail, {
            gh: no,
            yglx: employeeType,
            sfzh: idCard,
            sjh: phoneNumber,
          })

          if (rzsq) {
            rzsq.sfzh = idCard
            rzsq.sjhm = phoneNumber
          }
        }
        const payload = buildConfirmOnboardingPayload(this.detail, this.formModel)
        const res = await postAction(CONFIRM_URL, payload)
        if (!res || !res.success) {
          this.$message.warning((res && res.message) || '确认到岗失败')
          return
        }
        // 添加入住申请（仅内宿）
        if (this.detail.jbxx && this.detail.jbxx.zsfs === '内宿' && res.result) {
          const perInfo = Vue.ls.get('perInfo')
          const applyPayload = {
            applyType: '0',
            empNo: res.result,
            empName: payload.xm,
            idCard: payload.sfzh,
            phone: payload.sjh,
            company: payload.companyId_dictText,
            dept: payload.dept,
            deptPath: payload.deptPath || payload.jbxx.mainDeptPath || payload.dept_dictText,
            approveName: payload.spr,
            approveCode: '',
            ccName: payload.csr,
            ccCode: '',
            remark: '',
            areaId: payload.rzsq.qyId,
            areaName: payload.rzsq.qy,
            buildingName: '',
            roomName: '',
            dormType: payload.rzsq.sslxId,
            checkinDate: payload.rzsq.rzrq,
            reason: payload.rzsq.rzyy,
            spouseName: '',
            spousePhone: '',
            spouseIdcard: '',
            spouseNo: '',
            internalEmployee: '1',
            gridInfo: '0',
            personType: '0',
            sex: payload.jbxx.gender,
            createByNo: perInfo.no
          }
          // 动态流程节点数据
          if (payload.rzsq && payload.rzsq.customProcessConfigurationDTOList && payload.rzsq.customProcessConfigurationDTOList.length > 0) {
            applyPayload.customProcessConfigurationDTOList = payload.rzsq.customProcessConfigurationDTOList
          }
          postAction('/sqgl/hrmSqglApply/add', applyPayload)
        }
        this.$message.success(res.message || '已确认到岗')
        this.visible = false
        this.$emit('ok')
      } catch (error) {
        this.$message.error(error.message || '确认到岗失败，请稍后重试')
      } finally {
        this.submitting = false
      }
    },
    close() {
      if (this.operationBusy) return
      this.queryVersion += 1
      this.loading = false
      this.visible = false
    },
  },
}
</script>

<style lang="less">
@import './onboardingArrival.less';
</style>

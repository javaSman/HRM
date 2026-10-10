<template>
  <a-modal
    title="审核"
    :width="500"
    :visible="visible"
    :confirmLoading="confirmLoading"
    :footer="null"
    :bodyStyle="{ padding: '0px 24px 14px' }"
    @cancel="handleCancel"
    cancelText="取消"
    centered
  >
    <a-form :form="form" style="padding-bottom: 24px">
      <a-form-item label="访客姓名">
        <div class="v-display-field">{{ record.xm || '—' }}</div>
      </a-form-item>
      <a-form-item label="来访原因" v-if="!isTemp">
        <div class="v-display-field">{{ record.lfsy_dictText || '—' }}</div>
      </a-form-item>
      <a-form-item label="审核意见">
        <a-textarea placeholder="请输入审核意见" v-decorator="['spyj']" :auto-size="{ minRows: 3 }" />
      </a-form-item>
    </a-form>
    <div class="v-review-footer">
      <a-button @click="handleCancel">取消</a-button>
      <a-button type="danger" icon="close-circle" @click="handleSubmit('2')" :loading="confirmLoading">不同意</a-button>
      <a-button type="primary" icon="check" @click="handleSubmit('1')" :loading="confirmLoading">同意</a-button>
    </div>
  </a-modal>
</template>

<script>
import { getAction, postAction } from '@/api/manage'
import Vue from 'vue'
export default {
  name: 'VisitorApproval',
  props: {
    // 审批业务类型：0-员工访客 1-访客自主登记 2-邀约访客 4-劳动派遣登记
    // 由父组件根据当前 tab 类型传入；单条审批时会以 record.lflx 为准
    busType: {
      type: String,
      default: '0',
    },
  },
  data() {
    return {
      visible: false,
      confirmLoading: false,
      form: this.$form.createForm(this),
      labelCol: { xs: { span: 24 }, sm: { span: 5 } },
      wrapperCol: { xs: { span: 24 }, sm: { span: 19 } },
      record: {},
      currentBusType: this.busType, // 内部使用的当前业务类型，初始值来自 prop
      isTemp: false, //是否是劳动派遣登记
      // 来访类型 -> 审批业务类型映射
      // 枚举：YG(0员工访客) FK(1访客自主登记) YY(2邀约访客) FXT(3放行条) LDPQ(4劳动派遣登记)
      lflxToBusTypeMap: {
        '0': '0',  // 员工访客 -> YG
        '1': '1',  // 访客自主登记 -> FK
        '2': '2',  // 邀约访客 -> YY
        '3': '2',  // 邀约访客(子类型) -> YY
        '4': '4',  // 劳动派遣登记 -> LDPQ
      },
    }
  },
  computed: {
    lfqyText() {
      return this.record.lfqy_dictText || this.record.lfqy || '—'
    },
  },
  methods: {
    show(record) {
      this.record = record
      this.visible = true
      this.form.resetFields()
      this.isTemp = record.lflx === '4'
      // 根据记录的来访类型动态设置审批业务类型（优先级高于 prop）
      this.currentBusType = this.lflxToBusTypeMap[record.lflx] || this.busType
    },
    handleSubmit(spjg) {
      const perInfo = Vue.ls.get('perInfo')
      this.form.validateFields((err, values) => {
        if (!err) {
          this.confirmLoading = true
          const params = {
            busType: this.currentBusType,
            spjg: spjg,
            busId: this.record.id,
            spyj: values.spyj,
            spr: perInfo.id
          }
          this.$http
            .post('/fkzx/hrmFkzxSplc/audit', params)
            .then((res) => {
              if (res.success) {
                // 劳动派遣登记审批通过 自动同步临时工档案（暂时停用，改由接待页“生成临时工档案”批量接口处理）
                // if (this.isTemp && spjg === '1') {
                //   this.generateWorkerCode()
                // }
                this.$message.success(spjg === '1' ? '审核通过' : '已不同意')
                this.visible = false
                this.$emit('ok')
              } else {
                this.$message.warning(res.message || '审核失败')
              }
            })
            .catch(() => {
              this.$message.error('审核失败')
            })
            .finally(() => {
              this.confirmLoading = false
            })
        }
      })
    },
    /**
     * 自动生成工号
     * @returns {void}
     */
    generateWorkerCode() {
      getAction('/lsggl/tempWorkerArchive/generateWorkerCode').then((res) => {
        if (res.success && res.result) {
          this.tempWorkerArchiveAdd(res.result)
        }
      })
    },
    //生成临时工档案 ----ArchiveModal
    tempWorkerArchiveAdd(workerCode) {
      // 根据身份证号识别性别
      const gender = this.getGenderFromIdCard(this.record.sfzh)
      let params = {
        workerCode, //工号
        name: this.record.xm, //姓名
        gender: gender, //性别
        nation: '', //民族
        idCard: this.record.sfzh, //身份证
        address: '', //家庭住址
        isInRoom: '', //是否内宿
        entryDate: '', //入职日期
        phone: this.record.lxfs, //手机号
        company: '强瑞技术', //公司
        deptId: '', //入职部门
        deptName: '', //入职部门
        position: '', //入职职位
        dispatchCompany: this.record.pqgs, //派遣公司
        price: '', //单价
        bankCard: '', //银行卡号
        bankName: '', //开户行
        cardNo: '', //卡号
        photo: '', //照片
        contractStartDate: '', //合同开始日期
        contractEndDate: '', //合同到期日期
        remark: '', //备注
      }
      postAction('/lsggl/tempWorkerArchive/add', params)
    },
    /**
     * 根据身份证号获取性别
     * @param {string} idCard 身份证号
     * @returns {string} 性别: '男' 或 '女'
     */
    getGenderFromIdCard(idCard) {
      if (!idCard || idCard.length < 17) {
        return ''
      }
      // 第17位（倒数第2位）为性别标识
      const genderDigit = parseInt(idCard.substring(16, 17))
      // 奇数为男，偶数为女
      return genderDigit % 2 === 1 ? '男' : '女'
    },
    batchReject(ids) {
      this.record = { ids }
      this.visible = true
      this.form.resetFields()
      // 批量驳回时使用 prop 传入的业务类型
      this.currentBusType = this.busType
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>

<style lang="less" scoped>
.ant-form-item {
  margin-bottom: 0;
}
.v-display-field {
  border: 1px solid #e2e8f0;
  background: #fbfcff;
  border-radius: 6px;
  padding: 5px 12px;
  min-height: 32px;
  font-size: 13px;
  color: #1e293b;
  word-break: break-all;
  line-height: 22px;
}
.v-review-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #e8e8e8;
}
</style>

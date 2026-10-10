<!--
 * @Author: 匹诺曹 1164698177@qq.com
 * @Date: 2025-11-20 19:15:44
 * @LastEditors: 匹诺曹 1164698177@qq.com
 * @LastEditTime: 2025-11-27 15:11:03
 * @FilePath: \ztsisnew\ant-design-vue-jeecg\src\views\contentManagement\auditCenter\pendingReview\modules\AuditModal.vue
 * @Description: 审核用户注册申请 - 弹框
-->
<template>
  <j-modal :title="title" :width="600" :visible="visible" switchFullscreen @cancel="handleCancel" cancelText="关闭">
    <div class="auditContent">
      <j-form-container>
        <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
          <a-row>
            <a-col :span="12">
              <a-form-model-item label="审批项">
                <a-radio-group name="radioGroup" v-model="radioGroup" @change="handleRadioChange">
                  <a-radio :value="1">
                    通过
                  </a-radio>
                  <a-radio :value="2">
                    不通过
                  </a-radio>
                </a-radio-group>
              </a-form-model-item>
            </a-col>
            <a-col :span="12" v-if="radioGroup == 1">
              <a-form-model-item label="账号名称" prop="account">
                <a-input v-model="model.account" placeholder="请输入账号名称" style="width: 200px" />
              </a-form-model-item>
            </a-col>
            <a-col :span="12" v-if="radioGroup == 1">
              <a-form-model-item label="开始时间" prop="startTime">
                <j-date v-model="model.startTime" showTime dateFormat="YYYY-MM-DD HH:mm:ss" placeholder="请选择" />
              </a-form-model-item>
            </a-col>
            <a-col :span="12" v-if="radioGroup == 1">
              <a-form-model-item label="结束时间" prop="sxTime">
                <j-date v-model="model.sxTime" showTime dateFormat="YYYY-MM-DD HH:mm:ss" placeholder="请选择" />
              </a-form-model-item>
            </a-col>
            <a-col :span="12" v-if="radioGroup == 1">
              <a-form-model-item label="应用数" prop="appNum">
                <a-input-number v-model="model.appNum" :min="1" placeholder="请输入应用数" style="width: 200px" />
              </a-form-model-item>
            </a-col>
            <a-col :span="12" v-if="radioGroup == 1">
              <a-form-model-item label="发布数" prop="appFbNum">
                <a-input-number v-model="model.appFbNum" :min="1" placeholder="请输入发布数" style="width: 200px" />
              </a-form-model-item>
            </a-col>
            <a-col :span="24" v-if="radioGroup == 2">
              <a-form-model-item label="审核意见" prop="shyj" v-if="radioGroup == 2">
                <a-textarea :rows="5" v-model="model.shyj" placeholder="请输入审核意见" id="shyj" />
              </a-form-model-item>
            </a-col>
          </a-row>
        </a-form-model>
      </j-form-container>
    </div>
    <template slot="footer">
      <div class="actionPanel">
        <a-button @click="handleCancel">取消</a-button>
        <!-- <a-button type="danger" v-if="showAuditRefuse" @click="handleAuditRefuse">审核拒绝</a-button> -->
        <!-- <a-button type="primary" v-if="showAuditRefuse" @click="handleAuditPass">审核通过</a-button> -->
        <a-button type="primary" @click="handleSubmitOpinion">提交</a-button>
      </div>
    </template>
  </j-modal>
</template>
<script>
import { httpAction } from '@/api/manage'

export default {
  name: 'AuditModal',
  props: {
    formId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      title: '审核',
      width: 800,
      visible: true,
      auditStatus: true,  // true: 审核通过, false: 审核拒绝
      auditContent: '',
      model: {
        id: '',
        account: '',
        shyj: '您的申请已被拒绝，请留意后续通知!',
        state: '1',
        appNum: 100,
        appFbNum: 100,
      },
      radioGroup: 1,
      confirmLoading: false,
      validatorRules: {
        appFbNum: [
          { required: true, message: '请输入发布数!' },
        ],
        appNum: [
          { required: true, message: '请输入应用数!' },
        ],
        startTime: [
          { required: true, message: '请选择开始时间!' },
        ],
        sxTime: [
          { required: true, message: '请选择结束时间!' },
        ],
        account: [
          { required: true, message: '请输入账号名称!' },
        ],
        shyj: [
          { required: true, message: '请输入审核意见!' },
        ]
      },
    }
  },
  methods: {
    handleCancel() {
      this.$emit('fromAuditModalFun', false)
    },
    showModal() {
      this.visible = true
    },
    /**
     * 处理单选框变化
     */
    handleRadioChange() {
      this.model.account = ''
      this.model.shyj = ''

      if (this.radioGroup == 1) {
        this.model.state = '1'
      } else {
        this.model.state = '2'
        this.model.shyj = '您的申请已被拒绝，请留意后续通知!'
      }
    },
    /**
     * 提交审核意见
     */
    handleSubmitOpinion() {
      this.submitForm()
    },


    submitForm() {
      this.model.id = this.formId

      this.$refs.form.validate(valid => {
        if (valid) {
          this.sendFormData()
        }
      })
    },
    sendFormData() {
      httpAction('/marketModule/ztUserRegistration/review', this.model, 'post').then((res) => {
        const { code, message } = res
        if (code === 200) {
          this.$emit('fromAuditModalFun', true)
        } else {
          this.$message.warning(message)
        }
      })
    }
  },
}
</script>
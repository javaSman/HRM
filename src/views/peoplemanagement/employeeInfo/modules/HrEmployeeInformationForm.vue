<template>
  <a-spin :spinning="confirmLoading">
    <div>
      <div class="employee-form">
        <div class="employee-form-shell">
          <a-tabs :activeKey="activeTab" :animated="false" class="employee-form-tabs" @change="handleTabChange">
            <a-tab-pane key="basic" tab="基本身份信息">
              <fieldset :disabled="formDisabled" class="employee-form-fieldset">
                <div class="employee-form-container">
                  <hr-employee-basic-information-form
                    ref="basicForm"
                    :model="model"
                    :disabled="formDisabled"
                    :constract-belong-options="constractBelongOptions"
                  />
                </div>
              </fieldset>
            </a-tab-pane>
            <a-tab-pane key="1" tab="教育经历">
              <div class="employee-form-container">
                <HrmJyjlList :ghId="model.no" :disabled="formDisabled" />
              </div>
            </a-tab-pane>
            <a-tab-pane key="2" tab="工作履历">
              <div class="employee-form-container">
                <HrmGzllList :ghId="model.no" :disabled="formDisabled" />
              </div>
            </a-tab-pane>
            <a-tab-pane key="3" tab="家庭成员">
              <div class="employee-form-container">
                <HrmYgjtcyList :ghId="model.no" :disabled="formDisabled" />
              </div>
            </a-tab-pane>
            <a-tab-pane key="4" tab="个人附件">
              <div class="employee-form-container">
                <HrmYgzzzsList :ghId="model.no" :disabled="formDisabled" />
              </div>
            </a-tab-pane>
            <a-tab-pane key="5" tab="关系申报">
              <div class="employee-form-container">
                <HrmYggxsbList :ghId="model.no" :disabled="formDisabled" />
              </div>
            </a-tab-pane>
            <a-tab-pane key="6" tab="访谈经历">
              <div class="employee-form-container">
                <HrmYgfljlList :ghId="model.no" :disabled="formDisabled" />
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>
    </div>
  </a-spin>
</template>

<script>
import { httpAction } from '@/api/manage'
import HrEmployeeBasicInformationForm from './HrEmployeeBasicInformationForm.vue'
import HrmJyjlList from '@views/peoplemanagement/employeeInfo/modules/tabForms/jiaoyu/HrmJyjlList.vue'
import HrmGzllList from '@views/peoplemanagement/employeeInfo/modules/tabForms/work/HrmGzllList.vue'
import HrmYgjtcyList from '@views/peoplemanagement/employeeInfo/modules/tabForms/jiating/HrmYgjtcyList.vue'
import HrmYgzzzsList from '@views/peoplemanagement/employeeInfo/modules/tabForms/userFile/HrmYgzzzsList.vue'
import HrmYggxsbList from '@views/peoplemanagement/employeeInfo/modules/tabForms/guanxi/HrmYggxsbList.vue'
import HrmYgfljlList from '@views/peoplemanagement/employeeInfo/modules/tabForms/fangtan/HrmYgfljlList.vue'

function createDefaultModel() {
  return {
    dept: '',
    mainDept: '',
    companyId: '',
    no: '',
    name: '',
    phoneNumber: '',
    email: '',
    idCard: '',
    gender: '',
    address: '',
    photo: '',
    salary: undefined,
    postId: '',
    zjlb: '',
    gwbz: '',
    postRank: '',
    employeeType: '',
    px: 0,
    entryDate: '',
    actualDate: '',
    workYears: '',
    constractBelong: '',
    constractType: '',
    socialSecurityStatus: '',
    accumulationFundStatus: '',
    stopSocialSecurityStatus: '',
    stopAccumulationFundStatus: '',
    status: '',
    mz: '',
    jg: '',
    birthDate: '',
    hyzk: '',
    zzmm: '',
    xqah: '',
    zsfs: '',
    hjxz: '',
    hjdz: '',
    jzd: '',
    jkzk: '',
    ywbs: '',
    zzdz: '',
    card: '',
    sfczjyxzxy: '',
    sourceTag: '',
    contractStartDate: '',
    contractExpDate: '',
    syq: 6,
    bdrq: '',
    salaryType: '',
    gzkyh: '',
    gzkyhkh: '',
    gzkkhh: '',
    sbqk: '',
    sbdnh: '',
    gjjqk: '',
    gjjdhh: '',
    gjjyh: '',
    gjjkhyh: '',
    gjjyhkh: '',
  }
}

export default {
  name: 'HrEmployeeInformationForm',
  components: {
    HrEmployeeBasicInformationForm,
    HrmJyjlList,
    HrmGzllList,
    HrmYgjtcyList,
    HrmYgzzzsList,
    HrmYggxsbList,
    HrmYgfljlList,
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    constractBelongOptions: {
      type: Array,
      default: () => [],
    },
    type: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      activeTab: 'basic',
      model: createDefaultModel(),
      confirmLoading: false,
      url: {
        add: '/hrm/hrEmployeeInformation/add',
        edit: '/hrm/hrEmployeeInformation/edit',
      },
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
  },
  methods: {
    handleTabChange(key) {
      this.activeTab = key
    },
    add(record) {
      this.edit(Object.assign({}, record, { mainDept: '' }))
    },
    edit(record) {
      this.activeTab = 'basic'
      this.model = Object.assign(createDefaultModel(), record || {})
    },
    submitForm() {
      const basicForm = this.$refs.basicForm
      if (!basicForm) return
      basicForm.validate((valid) => {
        if (!valid) return
        if (!this.model.dept) {
          this.$message.warning('请选择所属部门')
          return
        }

        basicForm.prepareModel()
        let httpurl = this.model.id ? this.url.edit : this.url.add
        const method = this.model.id ? 'put' : 'post'
        this.confirmLoading = true
        if (this.type) {
          httpurl = httpurl + '?type=' + this.type
        }
        httpAction(httpurl, this.model, method)
          .then((res) => {
            if (res.success) {
              this.$message.success(res.message)
              this.$emit('ok')
            } else {
              this.$message.warning(res.message)
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
.employee-form {
  padding: 0;

  .employee-form-shell {
    width: 100%;
    margin: 0 auto;
    padding: 0 4px 8px;
    background: #ffffff;
  }

  .employee-form-container {
    height: 75vh;
    overflow: auto;
  }

  .employee-form-tabs {
    /deep/ .ant-tabs-bar {
      margin: 0 0 20px;
      border-bottom: 1px solid #e2e8f0;
    }

    /deep/ .ant-tabs-nav .ant-tabs-tab {
      margin-right: 0;
      padding: 10px 16px;
      color: #64748b;
      font-size: 12px;
      font-weight: 600;
    }

    /deep/ .ant-tabs-nav .ant-tabs-tab-active {
      color: #2563eb;
    }

    /deep/ .ant-tabs-ink-bar {
      height: 3px;
      background: #2563eb;
    }
  }
  .employee-form-fieldset {
    border: 0;
    margin: 0;
    padding: 0;
  }
}
</style>
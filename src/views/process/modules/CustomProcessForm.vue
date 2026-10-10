<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="流程名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="lcmc">
              <a-input v-model="model.lcmc" placeholder="请输入流程名称"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="fzlc">
              <a-radio-group v-model="model.fzlc">
                <a-radio value="业务">业务</a-radio>
                <a-radio value="审批流程">审批流程</a-radio>
              </a-radio-group>
            </a-form-model-item>
          </a-col>
          <!-- 是否分支 isfz：0-否，1-是；流转条件 lztj -->
          <template v-if="model.fzlc === '审批流程'">
            <a-col :span="24">
              <a-form-model-item label="是否分支" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="isfz">
                <a-radio-group v-model="model.isfz">
                  <a-radio :value="0">否</a-radio>
                  <a-radio :value="1">是</a-radio>
                </a-radio-group>
              </a-form-model-item>
            </a-col>
            <a-col :span="24" v-if="isBranchProcess">
              <a-form-model-item label="流转条件" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="lztj">
                <a-input v-model="model.lztj" placeholder="请输入流转条件，例如：${days<5 and type!='halfDay'}"></a-input>
              </a-form-model-item>
            </a-col>
          </template>
          <a-col :span="24" v-if="model.fzlc === '审批流程'">
            <a-form-model-item label="所属业务" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="pid"
              :rules="businessRules">
              <a-select v-model="model.pid" show-search allow-clear placeholder="请选择所属业务"
                :filter-option="filterBusinessOption">
                <a-select-option v-for="item in businessOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>
import { getAction, httpAction } from '@/api/manage'

const BUSINESS_TYPE = '业务'
const APPROVAL_TYPE = '审批流程'

export default {
  name: 'CustomProcessForm',
  props: {
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
    treeData: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      businessType: BUSINESS_TYPE,
      approvalType: APPROVAL_TYPE,
      model: {
        fzlc: BUSINESS_TYPE,
        pid: '',
        // 是否分支：0-否，1-是
        isfz: 0,
        // 流转条件
        lztj: '',
      },
      initialPid: '',
      businessOptions: [],
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      confirmLoading: false,
      validatorRules: {
        lcmc: [{ required: true, message: '请输入流程名称', trigger: 'change' }],
      },
      url: {
        add: '/process/customProcess/add',
        edit: '/process/customProcess/edit',
        queryById: '/process/customProcess/queryById',
        list: '/process/customProcess/list',
      },
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
    isApprovalProcess() {
      return this.model.fzlc === APPROVAL_TYPE
    },
    // 是否分支 isfz：1-是
    isBranchProcess() {
      return this.isApprovalProcess && Number(this.model.isfz) === 1
    },
    businessRules() {
      if (!this.isApprovalProcess) {
        return []
      }
      return [{ required: true, message: '请选择所属业务', trigger: 'change' }]
    },
  },
  watch: {
    'model.fzlc'() {
      this.syncProcessTypeState()
    },
    // isfz 选“否(0)”时隐藏并清空流转条件
    'model.isfz'(val) {
      if (Number(val) !== 1) {
        this.model.lztj = ''
      }
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate(['lztj'])
        }
      })
    },
    treeData: {
      handler() {
        if (this.isApprovalProcess) {
          this.loadBusinessOptions()
        }
      },
      deep: true,
    },
  },
  created() {
    this.modelDefault = JSON.parse(JSON.stringify(this.model))
  },
  methods: {
    add(pid) {
      this.initialPid = pid || ''
      const record = Object.assign({}, this.modelDefault)
      if (this.initialPid) {
        record.fzlc = APPROVAL_TYPE
        record.pid = this.initialPid
      }
      this.edit(record)
    },
    edit(record) {
      this.model = Object.assign({}, this.modelDefault, record)
      this.initialPid = this.model.pid || ''
      this.syncProcessTypeState()
    },
    syncProcessTypeState() {
      if (this.isApprovalProcess) {
        if (this.initialPid && !this.model.pid) {
          this.model.pid = this.initialPid
        }
        this.loadBusinessOptions()
      } else {
        this.model.pid = ''
        // 切换为业务类型时重置是否分支相关字段
        this.model.isfz = 0
        this.model.lztj = ''
      }
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate(['pid'])
        }
      })
    },
    loadBusinessOptions() {
      const treeOptions = this.buildBusinessOptions(this.treeData)
      if (treeOptions.length) {
        this.businessOptions = treeOptions
        return
      }
      getAction(this.url.list, { pageSize: 9999 }).then((res) => {
        if (!res.success) {
          this.$message.warning(res.message)
          return
        }
        const result = res.result || {}
        const records = Array.isArray(result) ? result : result.records || []
        this.businessOptions = records
          .filter((item) => item && (!item.fzlc || item.fzlc === BUSINESS_TYPE) && item.id && item.lcmc)
          .map((item) => ({
            value: item.id,
            label: item.lcmc,
          }))
      })
    },
    buildBusinessOptions(list = [], result = []) {
      list.forEach((item) => {
        if (!item) {
          return
        }
        const value = item.id || item.key
        const label = item.title || item.lcmc || item.name
        if (item.fzlc === BUSINESS_TYPE && value && label) {
          result.push({
            value,
            label,
          })
        }
        const children = Array.isArray(item.children) ? item.children : []
        if (children.length) {
          this.buildBusinessOptions(children, result)
        }
      })
      return result
    },
    filterBusinessOption(input, option) {
      const children = (option.componentOptions && option.componentOptions.children) || []
      const text = children[0] && children[0].text ? children[0].text : ''
      return text.toLowerCase().indexOf(String(input || '').toLowerCase()) >= 0
    },
    submitForm() {
      const that = this
      this.$refs.form.validate((valid) => {
        if (!valid) {
          return
        }
        that.confirmLoading = true
        const formData = Object.assign({}, this.model)
        if (!this.isApprovalProcess) {
          delete formData.pid
          delete formData.isfz
          delete formData.lztj
        } else if (Number(formData.isfz) !== 1) {
          // 非是否分支不传流转条件
          delete formData.lztj
        }
        let httpurl = ''
        let method = ''
        if (!formData.id) {
          httpurl += this.url.add
          method = 'post'
        } else {
          httpurl += this.url.edit
          method = 'put'
        }
        httpAction(httpurl, formData, method)
          .then((res) => {
            if (res.success) {
              that.$message.success(res.message)
              that.$emit('ok')
            } else {
              that.$message.warning(res.message)
            }
          })
          .finally(() => {
            that.confirmLoading = false
          })
      })
    },
  },
}
</script>

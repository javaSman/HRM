<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :xs="24" :sm="12">
            <a-form-model-item label="假勤类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="jqType">
              <j-dict-select-tag v-model="model.jqType" dictCode="xj_type" placeholder="请选择假勤类型" />
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-model-item label="请假基准时长" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="jzsc">
              <a-input-number v-model="model.jzsc" :min="0" :step="0.5" style="width: 100%" placeholder="请输入请假基准时长" />
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-model-item label="时长单位" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="scdw">
              <a-select v-model="model.scdw" placeholder="请选择时长单位">
                <a-select-option v-for="item in durationUnitOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-model-item label="假期额度" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="jqedts">
              <a-input-number v-model="model.jqedts" :min="0" :step="1" style="width: 100%" placeholder="请输入假期额度" />
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-model-item label="是否允许分次请假" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="isyxfcqj">
              <a-radio-group v-model="model.isyxfcqj" :options="yesNoOptions" />
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-model-item label="计入天数的日期类型（多选）" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="jrtsrqType">
              <a-select v-model="model.jrtsrqType" mode="multiple" placeholder="请选择计入天数的日期类型">
                <a-select-option v-for="item in countDateTypesOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-model-item label="有效期起点" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="yxqqd">
              <a-select v-model="model.yxqqd" placeholder="请选择有效期起点">
                <a-select-option v-for="item in validityStartTypeOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-model-item label="有效期时长" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="yxqsc">
              <a-input-number v-model="model.yxqsc" :min="0" style="width: 100%" placeholder="请输入有效期时长" />
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-model-item label="有效期时长单位" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="yxqscdw">
              <a-select v-model="model.yxqscdw" placeholder="请选择有效期时长单位">
                <a-select-option v-for="item in validityUnitOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-model-item label="时长计算是否关联考勤规则" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="isGlkqgzjs">
              <a-radio-group v-model="model.isGlkqgzjs" :options="yesNoOptions" />
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-model-item label="请假节点是否依据考勤规则" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="isQjjdyjkqgz">
              <a-radio-group v-model="model.isQjjdyjkqgz" :options="yesNoOptions" />
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-model-item label="底薪时间是否计算" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="isDxsjjs">
              <a-radio-group v-model="model.isDxsjjs" :options="yesNoOptions" />
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-model-item label="考勤汇总时长计算" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="isKqhzscjs">
              <a-radio-group v-model="model.isKqhzscjs" :options="yesNoOptions" />
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-model-item label="附件提交要求" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="fjtjyq">
              <a-select v-model="model.fjtjyq" placeholder="请选择附件提交要求">
                <a-select-option v-for="item in attachmentRequireOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-model-item label="附件补充期限/天" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="fjbcqx">
              <a-input-number v-model="model.fjbcqx" :min="0" style="width: 100%" placeholder="请输入附件补充期限" />
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-model-item label="后补期限起算节点" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="hbqxqsjd">
              <a-select v-model="model.hbqxqsjd" placeholder="请选择后补期限起算节点">
                <a-select-option v-for="item in supplementStartNodeOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-model-item label="附件要求提示" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="fjyqts">
              <a-textarea v-model="model.fjyqts" :rows="2" placeholder="请输入附件要求提示" />
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>
import { httpAction } from '@/api/manage'

export default {
  name: 'LeavePolicyconfiGurationRuleForm',
  components: {},
  props: {
    //表单禁用
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  data() {
    return {
      model: {},
      labelCol: {
        xs: { span: 24 },
        sm: { span: 10 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
      },
      confirmLoading: false,
      // 是/否通用选项（value 直接用中文）
      yesNoOptions: [
        { value: '是', label: '是' },
        { value: '否', label: '否' },
      ],
      // 时长单位
      durationUnitOptions: [
        { value: '天', label: '天' },
        { value: '小时', label: '小时' },
      ],
      // 计入天数的日期类型
      countDateTypesOptions: [
        { value: '工作日', label: '工作日' },
        { value: '休息日', label: '休息日' },
        { value: '法定节假日', label: '法定节假日' },
      ],
      // 有效期起点
      validityStartTypeOptions: [
        { value: '结婚证登记日期', label: '结婚证登记日期' },
        { value: '出生证明出生日期', label: '出生证明出生日期' },
      ],
      // 有效期时长单位
      validityUnitOptions: [
        { value: '天', label: '天' },
        { value: '月', label: '月' },
        { value: '年', label: '年' },
      ],
      // 附件提交要求
      attachmentRequireOptions: [
        { value: '是', label: '是' },
        { value: '否', label: '否' },
        { value: '后补', label: '后补' },
      ],
      // 后补期限起算节点
      supplementStartNodeOptions: [
        { value: '请假开始时间', label: '请假开始时间' },
        { value: '请假结束时间', label: '请假结束时间' },
        { value: '审批通过时间', label: '审批通过时间' },
      ],
      validatorRules: {
        jqType: [{ required: true, message: '请选择假勤类型', trigger: 'change' }],
        jzsc: [{ required: true, message: '请输入请假基准时长', trigger: 'change' }],
        scdw: [{ required: true, message: '请选择时长单位', trigger: 'change' }],
        jqedts: [{ required: true, message: '请输入假期额度', trigger: 'change' }],
        isyxfcqj: [{ required: true, message: '请选择是否允许分次请假', trigger: 'change' }],
        jrtsrqType: [
          { required: true, type: 'array', message: '请选择计入天数的日期类型', trigger: 'change' },
        ],
        yxqqd: [{ required: true, message: '请选择有效期起点', trigger: 'change' }],
        yxqsc: [{ required: true, message: '请输入有效期时长', trigger: 'change' }],
        yxqscdw: [{ required: true, message: '请选择有效期时长单位', trigger: 'change' }],
        isGlkqgzjs: [
          { required: true, message: '请选择时长计算是否关联考勤规则', trigger: 'change' },
        ],
        isQjjdyjkqgz: [
          { required: true, message: '请选择请假节点是否依据考勤规则', trigger: 'change' },
        ],
        isDxsjjs: [{ required: true, message: '请选择底薪时间是否计算', trigger: 'change' }],
        isKqhzscjs: [{ required: true, message: '请选择考勤汇总时长计算', trigger: 'change' }],
        fjtjyq: [{ required: true, message: '请选择附件提交要求', trigger: 'change' }],
        fjbcqx: [{ required: true, message: '请输入附件补充期限', trigger: 'change' }],
        hbqxqsjd: [{ required: true, message: '请选择后补期限起算节点', trigger: 'change' }],
        fjyqts: [{ required: true, message: '请输入附件要求提示', trigger: 'blur' }],
      },
      url: {
        add: "/hr_jqgl_gzpz/hrJqglGzpz/add",
        edit: "/hr_jqgl_gzpz/hrJqglGzpz/edit",
        queryById: "/hr_jqgl_gzpz/hrJqglGzpz/queryById"
      }
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
  },
  created() {
    //备份model原始值
    this.modelDefault = JSON.parse(JSON.stringify(this.model))
  },
  methods: {
    add() {
      this.edit(this.modelDefault)
    },
    edit(record) {
      this.model = Object.assign({}, record)
      // 计入天数的日期类型：后端逗号字符串 → 多选数组
      this.$set(
        this.model,
        'jrtsrqType',
        record.jrtsrqType ? String(record.jrtsrqType).split(',') : []
      )
    },
    submitForm() {
      const that = this
      // 触发表单验证
      this.$refs.form.validate((valid) => {
        if (valid) {
          that.confirmLoading = true
          let httpurl = ''
          let method = ''
          if (!this.model.id) {
            httpurl += this.url.add
            method = 'post'
          } else {
            httpurl += this.url.edit
            method = 'put'
          }
          // 多选数组 → 逗号字符串提交
          const formData = Object.assign({}, this.model, {
            jrtsrqType: (this.model.jrtsrqType || []).join(','),
          })
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
        }
      })
    },
  },
}
</script>
<style scoped></style>

<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row :gutter="24">
          <a-col :span="24">
            <div class="form-section-title">基础人事 & 日期信息</div>
          </a-col>
          <a-col :xs="24" :xl="8" :lg="12" :md="12" :sm="24">
            <a-form-model-item label="工号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="no">
              <a-input v-model="model.no" placeholder="请输入工号"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :xl="8" :lg="12" :md="12" :sm="24">
            <a-form-model-item label="姓名" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="name">
              <a-input v-model="model.name" placeholder="请输入姓名"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :xl="8" :lg="12" :md="12" :sm="24">
            <a-form-model-item label="所属事业部" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="dept">
              <a-input v-model="model.dept" placeholder="请输入所属事业部"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :xl="8" :lg="12" :md="12" :sm="24">
            <a-form-model-item label="所属部门" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="postId">
              <a-input v-model="model.postId" placeholder="请输入所属部门"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :xl="8" :lg="12" :md="12" :sm="24">
            <a-form-model-item label="考勤卡号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="kh">
              <a-input v-model="model.kh" placeholder="请输入考勤卡号"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :xl="8" :lg="12" :md="12" :sm="24">
            <a-form-model-item label="日期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="skrq">
              <j-date placeholder="请选择日期" v-model="model.skrq" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :xl="8" :lg="12" :md="12" :sm="24">
            <a-form-model-item label="星期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="weekday">
              <a-input v-model="model.weekday" placeholder="请输入星期"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :xl="8" :lg="12" :md="12" :sm="24">
            <a-form-model-item label="ID" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="ids">
              <a-input v-model="model.ids" placeholder="请输入ID"></a-input>
            </a-form-model-item>
          </a-col>

          <a-col :span="24">
            <div class="form-section-title">分段打卡记录</div>
          </a-col>
          <a-col :xs="24" :xl="8" :lg="12" :md="12" :sm="24">
            <a-form-model-item label="打卡时间1" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="one">
              <j-time placeholder="请选择打卡时间1" v-model="model.one" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :xl="8" :lg="12" :md="12" :sm="24">
            <a-form-model-item label="打卡时间2" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="two">
              <j-time placeholder="请选择打卡时间2" v-model="model.two" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :xl="8" :lg="12" :md="12" :sm="24">
            <a-form-model-item label="打卡时间3" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="three">
              <j-time placeholder="请选择打卡时间3" v-model="model.three" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :xl="8" :lg="12" :md="12" :sm="24">
            <a-form-model-item label="打卡时间4" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="four">
              <j-time placeholder="请选择打卡时间4" v-model="model.four" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :xl="8" :lg="12" :md="12" :sm="24">
            <a-form-model-item label="打卡时间5" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="five">
              <j-time placeholder="请选择打卡时间5" v-model="model.five" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :xl="8" :lg="12" :md="12" :sm="24">
            <a-form-model-item label="打卡时间6" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="six">
              <j-time placeholder="请选择打卡时间6" v-model="model.six" style="width: 100%" />
            </a-form-model-item>
          </a-col>

          <a-col :span="24">
            <div class="form-section-title">工时 & 异常统计</div>
          </a-col>
          <a-col :xs="24" :xl="8" :lg="12" :md="12" :sm="24">
            <a-form-model-item label="底薪时间" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="dxsj">
              <a-input-number v-model="model.dxsj" placeholder="请输入底薪时间" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :xl="8" :lg="12" :md="12" :sm="24">
            <a-form-model-item label="1.5倍加班" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="bs15">
              <a-input-number v-model="model.bs15" placeholder="请输入1.5倍加班" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :xl="8" :lg="12" :md="12" :sm="24">
            <a-form-model-item label="2倍加班" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="bs2">
              <a-input v-model="model.bs2" placeholder="请输入2倍加班"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :xl="8" :lg="12" :md="12" :sm="24">
            <a-form-model-item label="3倍加班" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="bs3">
              <a-input-number v-model="model.bs3" placeholder="请输入3倍加班" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :xl="8" :lg="12" :md="12" :sm="24">
            <a-form-model-item label="当日总工时" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="zsj">
              <a-input-number v-model="model.zsj" placeholder="请输入当日总工时" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :xl="8" :lg="12" :md="12" :sm="24">
            <a-form-model-item label="迟到时间" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="cdsj">
              <a-input-number v-model="model.cdsj" placeholder="请输入迟到时间" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :xl="8" :lg="12" :md="12" :sm="24">
            <a-form-model-item label="当日请假" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="drqj">
              <a-input-number v-model="model.drqj" placeholder="请输入当日请假" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="bz">
            <!-- <a-form-model-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="bz"> -->
              <a-input v-model="model.bz" placeholder="请输入备注"></a-input>
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
    name: 'HrKqYgForm',
    components: {
    },
    props: {
      // 表单禁用
      disabled: {
        type: Boolean,
        default: false,
        required: false
      }
    },
    data () {
      return {
        model: {
         },
        labelCol: {
          xs: { span: 24 },
          sm: { span: 8 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 }
        },
        confirmLoading: false,
        validatorRules: {
        },
        url: {
          add: '/hr_kq_yg/hrKqYg/add',
          edit: '/hr_kq_yg/hrKqYg/edit',
          queryById: '/hr_kq_yg/hrKqYg/queryById'
        }
      }
    },
    computed: {
      formDisabled() {
        return this.disabled
      }
    },
    created () {
      // 备份model原始值
      this.modelDefault = JSON.parse(JSON.stringify(this.model))
    },
    methods: {
      add () {
        this.edit(this.modelDefault)
      },
      edit (record) {
        this.model = Object.assign({}, record)
        this.visible = true
      },
      submitForm () {
        const that = this
        // 触发表单验证
        this.$refs.form.validate(valid => {
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
            httpAction(httpurl, this.model, method).then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                that.$emit('ok')
              } else {
                that.$message.warning(res.message)
              }
            }).finally(() => {
              that.confirmLoading = false
            })
          }
        })
      }
    }
  }
</script>

<style scoped>
  .form-section-title {
    margin: 6px 0 12px;
    padding-left: 8px;
    color: #1a2a3d;
    font-weight: 600;
    line-height: 22px;
    border-left: 3px solid #2d78ff;
  }
</style>

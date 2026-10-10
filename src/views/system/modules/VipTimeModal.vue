<template>
  <j-modal :title="title" :width="600" :visible="visible" switchFullscreen @cancel="handleCancel" cancelText="关闭">
    <div class="auditContent">
      <j-form-container>
        <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
          <a-row>
            <a-col :span="12" >
              <a-form-model-item label="开始时间" prop="startTime">
                <j-date v-model="model.startTime" showTime dateFormat="YYYY-MM-DD HH:mm:ss" placeholder="请选择" />
              </a-form-model-item>
            </a-col>
            <a-col :span="12" >
              <a-form-model-item label="结束时间" prop="sxTime">
                <j-date v-model="model.sxTime" showTime dateFormat="YYYY-MM-DD HH:mm:ss" placeholder="请选择" />
              </a-form-model-item>
            </a-col>
            <a-col :span="12" >
              <a-form-model-item label="应用数" prop="appNum">
                <a-input-number v-model="model.appNum" :min="1" placeholder="请输入应用数" style="width: 200px" />
              </a-form-model-item>
            </a-col>
            <a-col :span="12" >
              <a-form-model-item label="发布数" prop="appFbNum">
                <a-input-number v-model="model.appFbNum" :min="1" placeholder="请输入发布数" style="width: 200px" />
              </a-form-model-item>
            </a-col>
          </a-row>
        </a-form-model>
      </j-form-container>
    </div>
    <template slot="footer">
      <div class="actionPanel">
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" @click="handleOk">提交</a-button>
      </div>
    </template>
  </j-modal>
</template>

<script>
  import pick from 'lodash.pick'
  import { httpAction } from '@/api/manage'
  import { duplicateCheck } from '@/api/api'
  import JDictSelectTag from '@/components/dict/JDictSelectTag'

  let validatorCodeTimer = null

  export default {
    name: 'VipTimeModal',
    components: { JDictSelectTag },
    data() {
      return {
        title: '操作',
        visible: false,
        model: {},
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
          code: [
              { required: true, message: '请输入职务编码' },
              {
                validator: (rule, value, callback) => {
                  // 函数消抖的简单实现，防止一段时间内发送多次请求
                  if (validatorCodeTimer) {
                    // 停止上次开启的定时器
                    clearTimeout(validatorCodeTimer)
                  }
                  validatorCodeTimer = setTimeout(() => {
                    duplicateCheck({
                      tableName: 'sys_position',
                      fieldName: 'code',
                      fieldVal: value,
                      dataId: this.model.id
                    }).then((res) => {
                      if (res.success) {
                        callback()
                      } else {
                        callback(res.message)
                      }
                    }).catch(console.error)
                  }, 300)
                }
              }
            ],
          name: [{ required: true, message: '请输入职务名称' }] ,
          postRank:  [{ required: true, message: '请选择职级' }] ,
        },
        url: {
          add: '/market/userAppConfig/add',
          edit: '/market/userAppConfig/edit',
        },
        readOnly:false
      }
    },
    created() {
    },
    methods: {
      add() {
        this.edit({})
      },
      edit(record) {
        this.model = Object.assign({}, record)
        this.visible = true
      },
      close() {
        this.$emit('close')
        this.visible = false
        this.$refs.form.resetFields();
      },
      handleOk() {
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
              that.close()
            })
          }else{
            return false;
          }
        })
      },
      handleCancel() {
        this.close()
      },


    }
  }
</script>

<style lang="less" scoped>

</style>

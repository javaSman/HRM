<template>
  <a-modal
    :title="title"
    :width="666"
    :visible="visible"
    :confirmLoading="confirmLoading"
    :maskClosable="false"
    :destroyOnClose="true"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="取消"
    okText="确认"
  >
    <a-spin :spinning="confirmLoading">
      <a-form-model ref="form" :model="model" :rules="validatorRules" layout="vertical">
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-model-item label="工号" prop="gh">
              <a-input v-model="model.gh" placeholder="请输入工号" />
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="卡号" prop="kh">
              <a-input v-model="model.kh" placeholder="请输入卡号" />
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="姓名" prop="xm">
              <a-input v-model="model.xm" placeholder="请输入姓名" />
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="人员类型" prop="rylx">
              <j-dict-select-tag
                v-model="model.rylx"
                placeholder="请选择人员类型"
                dictCode="hrm_sqgl_apply_person_type"
                style="width: 100%"
              />
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="手机号码" prop="sjhm">
              <a-input v-model="model.sjhm" placeholder="请输入手机号码" />
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="照片" prop="zp">
              <j-upload v-model="model.zp" text="选择图片" :returnUrl="true" fileType="image" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="门禁地点" prop="mjdd">
              <div class="location-checkbox-wrap">
                <div class="location-checkbox-header">
                  <a-checkbox :checked="selectAll" @change="handleSelectAll">全选</a-checkbox>
                </div>
                <div class="location-checkbox-list">
                  <a-checkbox
                    v-for="loc in locationOptions"
                    :key="loc.value"
                    :checked="selectedLocations.includes(loc.value)"
                    @change="(e) => handleLocationChange(e, loc.value)"
                  >
                    {{ loc.label }}
                  </a-checkbox>
                </div>
              </div>
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </a-spin>
  </a-modal>
</template>

<script>
import { httpAction, getAction } from '@/api/manage'
import { ajaxGetDictItems } from '@/api/api'

export default {
  name: 'DormGuardModal',
  data() {
    return {
      title: '',
      visible: false,
      confirmLoading: false,
      model: {
        id: null,
        gh: '',
        kh: '',
        xm: '',
        rylx: undefined,
        sjhm: '',
        zp: '',
        mjdd: '',
      },
      validatorRules: {
        gh: [{ required: true, message: '请输入工号', trigger: 'blur' }],
        kh: [{ required: true, message: '请输入卡号', trigger: 'blur' }],
        xm: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        rylx: [{ required: true, message: '请选择人员类型', trigger: 'change' }],
        sjhm: [
          {
            validator: (rule, value, callback) => {
              if (!value || value.trim() === '') {
                // 未填写，不校验
                callback()
              } else {
                // 已填写，校验格式
                const phoneRegex = /^1[3-9]\d{9}$/
                if (!phoneRegex.test(value.trim())) {
                  callback(new Error('请输入正确的手机号码'))
                } else {
                  callback()
                }
              }
            },
            trigger: 'blur',
          },
        ],
      },
      url: {
        add: '/sqgl/hrmSsglSsmjgl/add',
        edit: '/sqgl/hrmSsglSsmjgl/edit',
        queryById: '/sqgl/hrmSsglSsmjgl/queryById',
      },
      locationOptions: [],
      selectedLocations: [],
      selectAll: false,
    }
  },
  created() {
    this.loadLocationOptions()
  },
  methods: {
    loadLocationOptions() {
      // 从字典加载门禁地点选项
      ajaxGetDictItems('hrm_ssgl_ssmjgl_mjdd', null).then((res) => {
        if (res.success) {
          this.locationOptions = res.result.map((item) => ({
            label: item.text || item.label,
            value: item.value,
          }))
        }
      })
    },
    add() {
      this.title = '添加门禁权限'
      this.model = {
        id: null,
        gh: '',
        kh: '',
        xm: '',
        rylx: undefined,
        sjhm: '',
        zp: '',
        mjdd: '',
      }
      this.selectedLocations = []
      this.selectAll = false
      this.visible = true
    },
    edit(record) {
      this.title = '编辑门禁权限'
      this.model = Object.assign({}, record)
      // 解析门禁地点
      if (record.mjdd) {
        this.selectedLocations = record.mjdd
          .split(/[、,]/)
          .map((s) => s.trim())
          .filter(Boolean)
        this.selectAll = this.selectedLocations.length === this.locationOptions.length
      } else {
        this.selectedLocations = []
        this.selectAll = false
      }
      this.visible = true
    },
    handleOk() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.selectedLocations.length === 0) {
            this.$message.warning('请选择门禁地点')
            return
          }
          this.confirmLoading = true
          const formData = Object.assign({}, this.model)
          formData.mjdd = this.selectedLocations.join(',')

          let url = ''
          let method = ''
          if (!formData.id) {
            url = this.url.add
            method = 'post'
          } else {
            url = this.url.edit
            method = 'put'
          }

          httpAction(url, formData, method)
            .then((res) => {
              if (res.success) {
                this.$message.success(res.message)
                this.$emit('ok')
                this.visible = false
              } else {
                this.$message.warning(res.message)
              }
            })
            .finally(() => {
              this.confirmLoading = false
            })
        }
      })
    },
    handleCancel() {
      this.visible = false
    },
    handleSelectAll(e) {
      this.selectAll = e.target.checked
      if (this.selectAll) {
        this.selectedLocations = this.locationOptions.map((loc) => loc.value)
      } else {
        this.selectedLocations = []
      }
    },
    handleLocationChange(e, value) {
      if (e.target.checked) {
        if (!this.selectedLocations.includes(value)) {
          this.selectedLocations.push(value)
        }
      } else {
        const index = this.selectedLocations.indexOf(value)
        if (index > -1) {
          this.selectedLocations.splice(index, 1)
        }
      }
      this.selectAll = this.selectedLocations.length === this.locationOptions.length
    },
  },
}
</script>

<style scoped>
.location-checkbox-wrap {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 10px 12px;
  background: rgba(37, 99, 235, 0.02);
}

.location-checkbox-header {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: #2563eb;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
  width: 100%;
}

.location-checkbox-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px 10px;
}

.location-checkbox-list .ant-checkbox-wrapper {
  font-size: 12.5px;
  color: #1a2a3d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 0;
}

@media (max-width: 800px) {
  .location-checkbox-list {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>


<template>
  <div class="basic-info-form">
    <a-form-model ref="form" :model="formData">
      <!-- 第1组：个人基本信息 -->
      <div class="info-card">
        <div class="card-header">
          <span class="header-line"></span>
          <span class="header-title">个人基本信息</span>
        </div>
        <div class="card-desc">请填写您的基本身份信息</div>

        <!-- 员工照片 -->
        <div class="photo-upload">
          <j-image-upload v-model="formData.photo" biz-path="hrmRzglSupplement" text="点击上传员工照片" />
          <div class="photo-tip">* 请上传近期免冠证件照</div>
        </div>

        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-model-item label="员工姓名" prop="name" :rules="[{ required: true, message: '请输入真实姓名' }]">
              <a-input v-model="formData.name" placeholder="请输入真实姓名" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="性别" prop="gender" :rules="[{ required: true, message: '请选择性别' }]">
              <a-select v-model="formData.gender" placeholder="请选择性别">
                <a-select-option value="男">男</a-select-option>
                <a-select-option value="女">女</a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item
              label="出生日期"
              prop="birthDate"
              :rules="[{ required: true, message: '请选择出生日期' }]"
            >
              <a-date-picker v-model="formData.birthDate" style="width: 100%" placeholder="请选择出生日期" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item
              label="身份证号码"
              prop="idCard"
              :rules="[
                { required: true, message: '请输入身份证号' },
                {
                  pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
                  message: '请输入正确的18位身份证号',
                },
              ]"
            >
              <a-input
                v-model="formData.idCard"
                placeholder="请输入18位身份证号"
                maxlength="18"
                @blur="handleIdCardBlur"
              />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item
              label="手机号"
              prop="phoneNumber"
              :rules="[
                { required: true, message: '请输入手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号' },
              ]"
            >
              <a-input
                v-model="formData.phoneNumber"
                placeholder="请输入手机号"
                maxlength="11"
                @blur="handlePhoneBlur"
              />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="邮箱">
              <a-input v-model="formData.email" placeholder="常用邮箱" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="民族" prop="mz" :rules="[{ required: true, message: '请输入民族' }]">
              <a-input v-model="formData.mz" placeholder="如：汉族" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="籍贯" prop="jg" :rules="[{ required: true, message: '请输入籍贯' }]">
              <a-input v-model="formData.jg" placeholder="如：广东深圳" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="户籍性质" prop="hjxz" :rules="[{ required: true, message: '请选择户籍性质' }]">
              <j-dict-select-tag v-model="formData.hjxz" placeholder="请选择户籍性质" dictCode="hjxz" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="户籍地址" prop="hjdz" :rules="[{ required: true, message: '请输入户籍地址' }]">
              <a-input v-model="formData.hjdz" placeholder="请输入详细户籍地址" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="政治面貌" prop="zzmm" :rules="[{ required: true, message: '请选择政治面貌' }]">
              <a-select v-model="formData.zzmm" placeholder="请选择政治面貌">
                <a-select-option v-for="item in politicalStatusOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="婚姻状况" prop="hyzk" :rules="[{ required: true, message: '请选择婚姻状况' }]">
              <j-dict-select-tag v-model="formData.hyzk" placeholder="请选择婚姻状况" dictCode="hyzt" />
            </a-form-model-item>
          </a-col>
        </a-row>
      </div>

      <!-- 第2组：健康与生活信息 -->
      <div class="info-card">
        <div class="card-header">
          <span class="header-line"></span>
          <span class="header-title">健康与生活信息</span>
        </div>
        <div class="card-desc">填写健康状况及居住信息</div>

        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-model-item label="健康状况" prop="jkzk" :rules="[{ required: true, message: '请选择健康状况' }]">
              <j-dict-select-tag v-model="formData.jkzk" placeholder="请选择健康状况" dictCode="jkzk" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="以往病史">
              <a-input v-model="formData.ywbs" placeholder="如有请填写，无则不填" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="居住地">
              <a-input v-model="formData.jzd" placeholder="请输入现居住地址" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="暂住地址">
              <a-input v-model="formData.zzdz" placeholder="如与居住地一致可不填" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="住宿方式" prop="zsfs" :rules="[{ required: true, message: '请选择住宿方式' }]">
              <j-dict-select-tag v-model="formData.zsfs" placeholder="请选择住宿方式" dictCode="zsfs" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="兴趣爱好">
              <a-input v-model="formData.xqah" placeholder="如：阅读、运动" />
            </a-form-model-item>
          </a-col>
        </a-row>
      </div>

      <!-- 第3组：公司与岗位信息 -->
      <div class="info-card">
        <div class="card-header">
          <span class="header-line"></span>
          <span class="header-title">公司与岗位信息</span>
        </div>
        <div class="card-desc">请确认您的入职公司与岗位</div>

        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-model-item label="入职公司" prop="companyId" :rules="[{ required: true, message: '请选择公司' }]">
              <a-select
                v-model="formData.companyId"
                placeholder="请选择公司"
                optionFilterProp="children"
                @change="handleCompanyChange"
              >
                <a-select-option v-for="item in companyList" :key="item.id" :value="item.id">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item
              label="所属部门"
              prop="dept"
              :rules="[{ required: true, message: '请选择部门', trigger: 'change' }]"
            >
              <a-cascader
                v-model="deptPath"
                :options="deptOptions"
                :fieldNames="{ label: 'name', value: 'id', children: 'children' }"
                :disabled="!formData.companyId"
                changeOnSelect
                :show-search="{ filter: filterDeptOption }"
                placeholder="请选择部门"
                @change="handleDeptChange"
              />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item
              label="岗位名称"
              prop="postId"
              :required="true"
              :rules="[{ required: true, message: '请选择岗位', trigger: 'change' }]"
            >
              <a-select
                v-model="formData.postId"
                placeholder="请选择岗位"
                :disabled="!formData.dept"
                :loading="postLoading"
                @change="handlePostChange"
              >
                <a-select-option v-for="item in postOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="岗位职级">
              <a-select v-model="formData.postRank" placeholder="请选择职级" :disabled="!formData.postId">
                <a-select-option v-for="item in levelOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
        </a-row>
      </div>

      <!-- 第4组：入职与合同信息 -->
      <div class="info-card">
        <div class="card-header">
          <span class="header-line"></span>
          <span class="header-title">入职与合同信息</span>
        </div>
        <div class="card-desc">入职时间及劳动合同相关</div>

        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-model-item
              label="入职日期"
              prop="entryDate"
              :rules="[{ required: true, message: '请选择入职日期' }]"
            >
              <a-date-picker v-model="formData.entryDate" style="width: 100%" placeholder="请选择入职日期" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="试用期（月）" prop="syq" :rules="[{ required: true, message: '请输入试用期' }]">
              <a-input-number v-model="formData.syq" :min="0" :precision="0" placeholder="如：3" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item
              label="合同类型"
              prop="constractType"
              :required="true"
              :rules="[{ required: true, message: '请选择合同类型' }]"
            >
              <j-dict-select-tag v-model="formData.constractType" placeholder="请选择合同类型" dictCode="htlx" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="合同归属">
              <a-input v-model="formData.constractBelong" disabled placeholder="选择公司后自动匹配" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="合同开始日期">
              <a-date-picker
                v-model="formData.contractStartDate"
                style="width: 100%"
                placeholder="请选择合同开始日期"
              />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="合同到期日期">
              <a-date-picker v-model="formData.contractExpDate" style="width: 100%" placeholder="请选择合同到期日期" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item
              label="是否存在竞业限制协议"
              prop="sfczjyxzxy"
              :rules="[{ required: true, message: '请选择' }]"
            >
              <a-select v-model="formData.sfczjyxzxy" placeholder="请选择">
                <a-select-option value="是">是</a-select-option>
                <a-select-option value="否">否</a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <!-- <a-col :span="24">
            <a-form-model-item label="维护人" prop="whr" :rules="[{ required: true, message: '请输入维护人工号' }]">
              <a-input v-model="formData.whr" placeholder="请输入维护人工号" />
            </a-form-model-item>
          </a-col> -->
        </a-row>
      </div>

      <!-- 第5组：薪资与银行卡 -->
      <div class="info-card">
        <div class="card-header">
          <span class="header-line"></span>
          <span class="header-title">薪资与银行卡</span>
        </div>
        <div class="card-desc">工资发放相关信息</div>

        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-model-item label="薪资（K）">
              <a-input-number
                v-model="formData.salary"
                :min="0"
                :precision="1"
                placeholder="月薪金额"
                style="width: 100%"
              />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="薪资类型">
              <j-dict-select-tag v-model="formData.salaryType" placeholder="请选择薪资类型" dictCode="xzlx" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="工资卡银行">
              <j-dict-select-tag v-model="formData.gzkyh" placeholder="请选择银行" dictCode="yhlx" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="工资卡银行卡号">
              <a-input v-model="formData.gzkyhkh" placeholder="银行卡号" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="工资卡开户行">
              <a-input v-model="formData.gzkkhh" placeholder="开户支行" />
            </a-form-model-item>
          </a-col>
        </a-row>
      </div>

      <!-- 第6组：社保与公积金 -->
      <div class="info-card">
        <div class="card-header">
          <span class="header-line"></span>
          <span class="header-title">社保与公积金</span>
        </div>
        <div class="card-desc">社保公积金缴纳信息</div>

        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-model-item label="社保情况" prop="sbqk" :rules="[{ required: true, message: '请选择社保情况' }]">
              <j-dict-select-tag v-model="formData.sbqk" placeholder="请选择社保情况" dictCode="sbqk" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="社保电脑号">
              <a-input v-model="formData.sbdnh" placeholder="社保电脑号" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item
              label="公积金情况"
              prop="gjjqk"
              :rules="[{ required: true, message: '请选择公积金情况' }]"
            >
              <j-dict-select-tag v-model="formData.gjjqk" placeholder="请选择公积金情况" dictCode="gjjqk" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="公积金电脑号">
              <a-input v-model="formData.gjjdhh" placeholder="公积金电脑号" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="公积金银行">
              <j-dict-select-tag v-model="formData.gjjyh" placeholder="请选择银行" dictCode="yhlx" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="公积金银行卡号">
              <a-input v-model="formData.gjjyhkh" placeholder="公积金银行卡号" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="公积金开户银行">
              <a-input v-model="formData.gjjkhyh" placeholder="公积金开户支行" />
            </a-form-model-item>
          </a-col>
        </a-row>
      </div>
    </a-form-model>
  </div>
</template>

<script>
import { getAction } from '@/api/manage'
import { POLITICAL_STATUS_OPTIONS } from '../../onboardingSupplement/supplementFields'

export default {
  name: 'BasicInfoForm',
  props: {
    value: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      formData: this.value || {},
      // 政治面貌选项
      politicalStatusOptions: POLITICAL_STATUS_OPTIONS,
      // 公司、部门、岗位、职级相关
      companyList: [],
      deptOptions: [],
      deptPath: [],
      postOptions: [],
      postRows: [],
      levelOptions: [],
      postLoading: false,
      // 接口地址
      url: {
        orgTree: '/org/hrmOrg/loadTreeRoot',
        postByDept: '/hrJobSequence/hrJobSequence/getChildSequences',
      },
    }
  },
  watch: {
    value: {
      handler(val) {
        this.formData = val || {}
      },
      deep: true,
    },
    formData: {
      handler(val) {
        this.$emit('input', val)
      },
      deep: true,
    },
  },
  created() {
    this.loadOrgTree()
  },
  methods: {
    // 加载组织架构树
    loadOrgTree() {
      return getAction(this.url.orgTree, { pid: 0 })
        .then((res) => {
          if (res.success && res.result && res.result.length > 0) {
            const root = res.result[0]
            this.companyList = root.children || []
          }
        })
        .catch((err) => {
          console.error('加载组织架构失败:', err)
        })
    },
    // 公司变化（联动部门）
    handleCompanyChange(companyId) {
      const company = this.companyList.find((item) => String(item.id) === String(companyId))
      this.deptOptions = company ? [company] : []
      this.deptPath = []
      this.formData.dept = ''
      this.formData.postId = ''
      this.formData.postRank = ''
      this.postOptions = []
      this.levelOptions = []

      // 自动设置合同归属
      if (company) {
        this.formData.constractBelong = company.name
      }

      // 清除公司字段的验证错误
      this.clearValidate(['companyId'])
    },
    // 部门变化（级联）
    handleDeptChange(value) {
      const path = Array.isArray(value) ? value.map((item) => String(item)) : []
      this.deptPath = path
      this.formData.dept = path[path.length - 1] || ''

      // 清空下级选项
      this.formData.postId = ''
      this.formData.postRank = ''
      this.postOptions = []
      this.levelOptions = []

      // 加载岗位选项
      if (this.formData.dept) {
        this.loadPostOptions(this.formData.dept)
      }

      // 手动清除部门、岗位、职级字段的验证错误
      this.clearValidate(['dept', 'postId', 'postRank'])
    },
    // 部门搜索过滤
    filterDeptOption(inputValue, path) {
      const keyword = String(inputValue || '').toLowerCase()
      return (path || []).some(
        (option) =>
          String(option.name || '')
            .toLowerCase()
            .indexOf(keyword) > -1
      )
    },
    // 加载岗位选项（根据部门）
    loadPostOptions(deptId) {
      if (!deptId) {
        this.postOptions = []
        this.postRows = []
        this.levelOptions = []
        return Promise.resolve()
      }

      this.postLoading = true

      return getAction(this.url.postByDept, {
        deptId,
        column: 'createTime',
        order: 'desc',
        pageNo: 1,
        pageSize: 99999,
      })
        .then((res) => {
          const rows = Array.isArray(res) ? res : (res && res.result) || []
          this.postRows = rows
          this.postOptions = rows.map((item) => ({
            label: item.postName,
            value: item.id,
          }))
        })
        .catch((err) => {
          console.error('加载岗位选项失败:', err)
          this.postOptions = []
          this.postRows = []
        })
        .finally(() => {
          this.postLoading = false
        })
    },
    // 岗位变化（级联职级）
    handlePostChange(postId) {
      const post = this.postRows.find((item) => String(item.id) === String(postId))
      this.levelOptions = ((post && post.hrJobLevels) || []).map((item) => ({
        label: item.levelName,
        value: item.id,
      }))
      this.formData.postRank = '' // 清空已选职级
      // 清除岗位字段的验证错误（用 $nextTick 确保在 watcher 触发的重渲染之后执行）
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate(['postId'])
        }
      })
    },
    // 手机号失去焦点时检查唯一性
    handlePhoneBlur() {
      const phoneNumber = this.formData.phoneNumber
      if (!phoneNumber || phoneNumber.length !== 11) return

      getAction('/unique/common/checkUniqueMsg', {
        tableName: 'hr_employee_information',
        columnName: 'phone_number',
        value: phoneNumber,
      })
        .then((res) => {
          this.$nextTick(() => {
            if (!this.$refs.form) return
            const field = this.$refs.form.fields.find((f) => f.prop === 'phoneNumber')
            if (!field) return
            if (res.success && res.result) {
              if (res.result.includes('重复')) {
                this.formData.phoneNumber = ''
                field.validateState = 'error'
                field.validateMessage = res.message
              }
            } else {
              field.validateState = 'success'
              field.validateMessage = ''
            }
          })
        })
        .catch((err) => {
          console.error('手机号唯一性校验失败:', err)
        })
    },
    // 身份证号失去焦点时检查唯一性
    handleIdCardBlur() {
      const idCard = this.formData.idCard
      if (!idCard || idCard.length !== 18) return

      getAction('/unique/common/checkUniqueMsg', {
        tableName: 'hr_employee_information',
        columnName: 'id_card',
        value: idCard,
      })
        .then((res) => {
          this.$nextTick(() => {
            if (!this.$refs.form) return
            const field = this.$refs.form.fields.find((f) => f.prop === 'idCard')
            if (!field) return
            if (res.success && res.result) {
              if (res.result.includes('重复')) {
                this.formData.idCard = ''
                field.validateState = 'error'
                field.validateMessage = res.message
              }
            } else {
              // 唯一性校验通过，清除错误状态
              field.validateState = 'success'
              field.validateMessage = ''
            }
          })
        })
        .catch((err) => {
          console.error('身份证号唯一性校验失败:', err)
        })
    },
    // 清除表单验证状态
    clearValidate(fields) {
      this.$nextTick(() => {
        if (!this.$refs.form) return
        if (fields) {
          this.$refs.form.clearValidate(fields)
        } else {
          this.$refs.form.clearValidate()
        }
      })
    },
    validate() {
      return this.$refs.form.validate()
    },
  },
}
</script>

<style lang="less" scoped>
.basic-info-form {
  .info-card {
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;

      .header-line {
        width: 3px;
        height: 14px;
        background: #4a7bf7;
        border-radius: 2px;
        display: inline-block;
      }

      .header-title {
        font-size: 14px;
        font-weight: 600;
        color: #333;
      }
    }

    .card-desc {
      font-size: 12px;
      color: #999;
      margin-bottom: 16px;
    }
  }

  .photo-upload {
    text-align: center;
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .photo-tip {
      font-size: 10px;
      color: #ff6b6b;
      margin-top: 4px;
    }

    /deep/ .j-image-upload {
      .upload-box {
        width: 72px !important;
        height: 72px !important;
        border-radius: 50% !important;
        overflow: hidden !important;
        margin: 0 auto !important;

        img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 50% !important;
        }
      }
    }
  }

  /deep/ .ant-form-item {
    margin-bottom: 16px;

    .ant-form-item-label {
      label {
        font-size: 12px;
        color: #666;
      }
    }

    .ant-input,
    .ant-select,
    .ant-date-picker {
      font-size: 13px;
    }
  }
}
</style>

<template>
  <main class="onboarding-supplement-page">
    <header class="supplement-nav-bar">新员工入职</header>

    <a-result v-if="completed" class="supplement-card supplement-result-card" status="success" title="资料提交成功">
      <template #subTitle>您的资料已保存，请勿重复提交。</template>
    </a-result>

    <div v-else class="supplement-profile">
      <section class="supplement-welcome-card">
        <h1>欢迎加入强瑞技术</h1>
        <p>请完善以下入职资料，我们将据此为您办理入职手续。</p>
      </section>
    </div>

    <template v-if="!completed">
      <a-form-model ref="supplementForm" :model="detail" class="supplement-form-shell">
        <a-tabs :active-key="activeTab" :animated="false" class="supplement-tabs" @change="handleTabChange">
          <a-tab-pane v-for="group in groups" :key="group.key" :tab="group.title">
            <!-- 基本信息 tab 使用新组件 -->
            <basic-info-form v-if="group.key === 'jbxx'" v-model="detail.jbxx" ref="basicInfoForm" />

            <!-- 其他 tab 保持原有逻辑 -->
            <section v-else class="supplement-form-card">
              <h2 class="supplement-section-title">{{ group.title }}</h2>
              <supplement-group
                :title="group.title"
                :fields="group.fields"
                :field-options="fieldOptions"
                :field-rules="fieldRules"
                :field-path="group.key"
                :records="detail[group.key]"
                :repeatable="group.repeatable !== false"
                @add="addRecord(group.key)"
                @remove="removeRecord(group.key, $event)"
              />
            </section>
          </a-tab-pane>
        </a-tabs>
      </a-form-model>

      <div class="supplement-submit-bar">
        <a-button v-if="!isFirstTab" size="large" :disabled="querying" @click="prevStep"> 上一步 </a-button>
        <a-button v-if="!isLastTab" type="primary" size="large" :disabled="querying" @click="nextStep">
          下一步
        </a-button>
        <a-button
          v-if="isLastTab"
          type="primary"
          size="large"
          :loading="submitting"
          :disabled="querying"
          @click="submit"
        >
          提交资料
        </a-button>
      </div>
    </template>
  </main>
</template>

<script>
import dayjs from 'dayjs'
import { postAction } from '@/api/manage'
import SupplementGroup from '../onboardingSupplement/components/SupplementGroup.vue'
import BasicInfoForm from './components/BasicInfoForm.vue'
import {
  SUPPLEMENT_GROUPS,
  buildSupplementPayload,
  createSupplementRecord,
} from '../onboardingSupplement/supplementFields'
import { isFieldVisible, isFieldRequired } from '../onboardingSupplement/fieldUtils'

const SAVE_URL = '/ryManage/hrmRzgl/empAdd'

export default {
  name: 'OnboardingRegister',
  components: { SupplementGroup, BasicInfoForm },
  data() {
    return {
      groups: SUPPLEMENT_GROUPS, // 表单分组配置（基本信息、教育经历、家庭成员等）
      detail: this.initDetail(), // 表单数据对象，包含所有分组的字段值
      activeTab: 'jbxx', // 当前激活的tab页，默认为基本信息(jbxx)
      querying: false, // 查询中状态标识
      submitting: false, // 提交中状态标识
      completed: false, // 提交完成状态标识
    }
  },
  computed: {
    // 字段选项配置（下拉框、字典等选项数据）
    fieldOptions() {
      return {}
    },
    // 字段校验规则（根据字段配置动态生成必填规则）
    fieldRules() {
      const rules = {}
      this.groups.forEach((group) => {
        group.fields.forEach((f) => {
          if (f.required) {
            const trigger = ['select', 'dict', 'date', 'datetime'].includes(f.type) ? 'change' : 'blur'
            rules[f.key] = [
              {
                required: true,
                message: `请${f.type === 'upload' ? '上传' : ['select', 'dict'].includes(f.type) ? '选择' : '输入'}${
                  f.label
                }`,
                trigger,
              },
            ]
          }
        })
      })
      return rules
    },
    // 当前tab索引（用于判断上一步/下一步按钮显示）
    currentTabIndex() {
      return this.groups.findIndex((g) => g.key === this.activeTab)
    },
    // 是否是第一个tab（第一个tab不显示"上一步"按钮）
    isFirstTab() {
      return this.currentTabIndex === 0
    },
    // 是否是最后一个tab（最后一个tab显示"提交资料"按钮）
    isLastTab() {
      return this.currentTabIndex === this.groups.length - 1
    },
  },
  methods: {
    // 导入的工具函数（用于判断字段可见性和必填性）
    isFieldVisible,
    isFieldRequired,
    // 初始化表单数据对象（为每个分组创建初始记录）
    initDetail() {
      const detail = {}
      SUPPLEMENT_GROUPS.forEach((group) => {
        detail[group.key] = group.repeatable === false ? createSupplementRecord({}) : []
      })
      return detail
    },
    // 添加一条可重复记录（如教育经历、家庭成员）
    addRecord(key) {
      this.detail[key].push(createSupplementRecord(this.detail))
    },
    // 删除指定索引的可重复记录
    removeRecord(key, index) {
      this.detail[key].splice(index, 1)
    },
    // 切换tab页
    handleTabChange(key) {
      this.activeTab = key
    },
    // 校验指定group的数据完整性（考虑动态字段可见性和必填性）
    validateGroup(groupKey) {
      const group = this.groups.find((g) => g.key === groupKey)
      if (!group) return { valid: true }

      // 基本信息使用 BasicInfoForm 组件的校验方法
      if (groupKey === 'jbxx') {
        return new Promise((resolve) => {
          const basicInfoForm = this.$refs.basicInfoForm
          if (basicInfoForm && basicInfoForm[0]) {
            basicInfoForm[0].$refs.form.validate((valid) => {
              if (valid) {
                resolve({ valid: true })
              } else {
                resolve({ valid: false, message: '请完善基本信息必填项' })
              }
            })
          } else {
            resolve({ valid: true })
          }
        })
      }

      // 其他单条记录分组（如紧急联系人等）
      if (group.repeatable === false) {
        const missing = []
        group.fields.forEach((f) => {
          // 检查字段是否可见
          if (!this.isFieldVisible(f, this.detail[groupKey])) return

          // 检查是否必填
          const required = this.isFieldRequired(f, this.detail[groupKey])
          if (required) {
            const value = this.detail[groupKey] && this.detail[groupKey][f.key]
            if (value === undefined || value === null || value === '') {
              missing.push(f.label)
            }
          }
        })
        if (missing.length > 0) {
          return { valid: false, message: `请完善必填项：${missing.join('、')}` }
        }
        return { valid: true }
      }

      // 可重复记录分组（教育经历、家庭成员等）
      const records = this.detail[groupKey]

      // 特殊校验：教育经历至少1条，家庭成员至少2条
      if (groupKey === 'jyjl' && (!Array.isArray(records) || records.length === 0)) {
        return { valid: false, message: '请添加教育经历信息' }
      }
      if (groupKey === 'jtcy' && (!Array.isArray(records) || records.length < 2)) {
        return { valid: false, message: '请至少添加2条家庭成员信息' }
      }

      // 校验每条记录的必填字段（考虑动态条件）
      if (Array.isArray(records) && records.length > 0) {
        const missingFields = []
        records.forEach((record, index) => {
          group.fields.forEach((f) => {
            // 检查字段是否可见（基于当前记录）
            if (!this.isFieldVisible(f, record)) return

            // 检查是否必填
            const required = this.isFieldRequired(f, record)
            if (required) {
              const value = record && record[f.key]
              if (value === undefined || value === null || value === '') {
                missingFields.push(`${group.title}${records.length > 1 ? index + 1 : ''}-${f.label}`)
              }
            }
          })
        })
        if (missingFields.length > 0) {
          return { valid: false, message: `请完善必填项：${missingFields.join('、')}` }
        }
      }

      return { valid: true }
    },
    // 上一步（切换到前一个tab）
    prevStep() {
      if (this.isFirstTab) return
      const prevIndex = this.currentTabIndex - 1
      this.activeTab = this.groups[prevIndex].key
      window.scrollTo(0, 0)
    },
    // 下一步（校验当前tab后切换到下一个tab）
    async nextStep() {
      if (this.isLastTab) return

      // 校验当前tab
      const validation = await this.validateGroup(this.activeTab)
      if (!validation.valid) {
        this.$message.warning(validation.message)
        return
      }

      const nextIndex = this.currentTabIndex + 1
      this.activeTab = this.groups[nextIndex].key
      window.scrollTo(0, 0)
    },
    // 提交表单数据（校验所有必填项后提交到后端）
    async submit() {
      if (this.submitting || !this.detail) return

      // 1. 校验基本信息（jbxx）
      const basicInfoForm = this.$refs.basicInfoForm
      if (basicInfoForm && basicInfoForm[0]) {
        const valid = await new Promise((resolve) => {
          basicInfoForm[0].$refs.form.validate((valid) => {
            resolve(valid)
          })
        })
        if (!valid) {
          this.$message.warning('请完善基本信息必填项')
          return
        }
      }

      // 2. 校验教育经历至少有1条记录
      const jyjlRecords = this.detail.jyjl
      if (!Array.isArray(jyjlRecords) || jyjlRecords.length === 0) {
        this.$message.warning('请添加教育经历信息')
        return
      }

      // 3. 校验家庭成员至少有2条记录
      const jtcyRecords = this.detail.jtcy
      if (!Array.isArray(jtcyRecords) || jtcyRecords.length < 2) {
        this.$message.warning('请至少添加2条家庭成员信息')
        return
      }

      // 4. 校验教育经历、家庭成员的必填字段（考虑动态条件）
      const missingFields = []
      this.groups.forEach((group) => {
        if (group.key === 'jbxx') return // 已校验
        const records = group.repeatable === false ? [this.detail[group.key]] : this.detail[group.key]
        if (!records || !records.length) return
        records.forEach((record, index) => {
          group.fields.forEach((f) => {
            // 检查字段是否可见
            if (!this.isFieldVisible(f, record)) return

            // 检查是否必填
            const required = this.isFieldRequired(f, record)
            if (required) {
              const value = record && record[f.key]
              if (value === undefined || value === null || value === '') {
                missingFields.push(`${group.title}${records.length > 1 ? index + 1 : ''}-${f.label}`)
              }
            }
          })
        })
      })

      if (missingFields.length > 0) {
        this.$message.warning(`请完善必填项：${missingFields.join('、')}`)
        return
      }

      this.submitting = true

      try {
        const payload = buildSupplementPayload(this.detail)
        let jbxx = payload.jbxx // 基本信息
        const res = await postAction(SAVE_URL, {
          ...payload,
          xm: jbxx.name, // 姓名
          //gh: jbxx.gh, // 工号（暂不提交）
          sjh: jbxx.phoneNumber, // 手机号
          sfzh: jbxx.idCard, // 身份证号
          yx: jbxx.email, // 邮箱
          xz: jbxx.salary, // 薪资
          xzlx: jbxx.salaryType, // 薪资类型
          yglx: jbxx.yglx, // 员工类型
          htgs: jbxx.constractBelong, // 合同归属公司
          htlx: jbxx.constractType, // 合同类型
          companyId: jbxx.companyId, // 公司ID
          gs: jbxx.constractBelong, // 归属公司
          dept: jbxx.dept, // 部门
          postId: jbxx.postId, // 岗位ID
          postRank: jbxx.postRank, // 岗位职级
          rzzt: '待入职', // 入职状态（固定为"待入职"）
          sjrzsj: dayjs(jbxx.entryDate).format('YYYY-MM-DD'),
          whr: jbxx.whr, // 维护人
        })
        if (!res || !res.success) {
          this.$message.warning((res && res.message) || '资料提交失败')
          return
        }
        this.completed = true
        window.scrollTo(0, 0)
      } catch (error) {
        this.$message.error('资料提交失败，请稍后重试')
      } finally {
        this.submitting = false
      }
    },
    // 重新填写（重置所有状态）
    restart() {
      this.detail = this.initDetail()
      this.completed = false
      this.activeTab = 'jbxx'
      window.scrollTo(0, 0)
    },
  },
}
</script>

<style lang="less">
@import '~@/assets/less/onboardingSupplement.less';
</style>


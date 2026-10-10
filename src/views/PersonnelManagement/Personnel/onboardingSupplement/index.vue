<template>
  <main class="onboarding-supplement-page">
    <header class="supplement-nav-bar">入职资料补充</header>

    <section v-if="!detail && !completed" class="supplement-card supplement-search-card">
      <h1>查询入职信息</h1>
      <p>请输入预留手机号，查询并完善您的入职资料。</p>
      <a-form-model ref="searchForm" :model="searchForm" :rules="searchRules" @keyup.enter.native="queryDetail">
        <a-form-model-item label="手机号" prop="phone">
          <div class="supplement-search-row">
            <a-input v-model.trim="searchForm.phone" maxlength="11" placeholder="请输入预留手机号" />
            <a-button type="primary" :loading="querying" :disabled="submitting" @click="queryDetail">查询</a-button>
          </div>
        </a-form-model-item>
      </a-form-model>
      <a-alert v-if="queryError" type="warning" show-icon :message="queryError" />
    </section>

    <a-result v-if="completed" class="supplement-card supplement-result-card" status="success" title="资料提交成功">
      <template #subTitle>您的资料已保存，请勿重复提交。</template>
      <!-- <template #extra><a-button type="primary" @click="restart">重新查询</a-button></template> -->
    </a-result>

    <template v-else-if="detail">
      <supplement-employee-card :detail="detail" @restart="restart" />

      <a-form-model ref="supplementForm" :model="detail" class="supplement-form-shell">
        <a-tabs :active-key="activeTab" :animated="false" class="supplement-tabs" @change="handleTabChange">
          <a-tab-pane v-for="group in groups" :key="group.key" :tab="group.title">
            <div v-if="group.key === 'jbxx'" class="jbxx-categories-wrapper">
              <!-- <section class="supplement-card supplement-main-info">
                <h2 class="supplement-section-title">入职信息</h2>
                <div class="supplement-basic-grid">
                  <div v-for="item in basicFields" :key="item.key" class="supplement-basic-item">
                    <span>{{ item.label }}</span>
                    <strong>{{ displayValue(detail[item.key]) }}</strong>
                  </div>
                </div>
              </section> -->

              <!-- 分类展示个人信息 -->
              <jbxx-category-section
                v-for="category in jbxxCategories"
                :key="category.key"
                :title="category.title"
                :description="category.description"
                :fields="category.fields"
                :field-options="fieldOptions"
                :field-rules="fieldRules"
                :record="detail.jbxx"
              />
            </div>
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
import { postAction } from '@/api/manage'
import { rules } from '@/utils/rules'
import SupplementEmployeeCard from './components/SupplementEmployeeCard.vue'
import SupplementGroup from './components/SupplementGroup.vue'
import JbxxCategorySection from './components/JbxxCategorySection.vue'
import { fetchConstractBelongOptions, includeCurrentConstractBelong } from './contractBelongOptions'
import {
  BASIC_FIELDS,
  SUPPLEMENT_GROUPS,
  JBXX_CATEGORIES,
  buildSupplementPayload,
  createSupplementRecord,
  normalizeSupplementDetail,
} from './supplementFields'
import { isFieldVisible, isFieldRequired } from './fieldUtils'

const VERIFY_URL = '/ryManage/hrmRzgl/isConfirEwm'
const QUERY_URL = '/ryManage/hrmRzgl/queryDetl'
const SAVE_URL = '/ryManage/hrmRzgl/addZb'

export default {
  name: 'OnboardingSupplement',
  components: { SupplementEmployeeCard, SupplementGroup, JbxxCategorySection },
  data() {
    return {
      searchForm: { phone: '' },
      searchRules: { phone: rules.mobile },
      basicFields: BASIC_FIELDS,
      groups: SUPPLEMENT_GROUPS,
      // 深拷贝分类配置，避免影响导入的常量
      jbxxCategories: JSON.parse(JSON.stringify(JBXX_CATEGORIES)),
      constractBelongOptions: [],
      contractOptionsLoading: false,
      contractOptionsLoaded: false,
      detail: null,
      activeTab: 'jbxx',
      querying: false,
      submitting: false,
      completed: false,
      queryError: '',
    }
  },
  computed: {
    fieldOptions() {
      const currentValue = this.detail && this.detail.jbxx && this.detail.jbxx.constractBelong
      return { constractBelong: includeCurrentConstractBelong(this.constractBelongOptions, currentValue) }
    },
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
    // 当前tab索引
    currentTabIndex() {
      return this.groups.findIndex((g) => g.key === this.activeTab)
    },
    // 是否是第一个tab
    isFirstTab() {
      return this.currentTabIndex === 0
    },
    // 是否是最后一个tab
    isLastTab() {
      return this.currentTabIndex === this.groups.length - 1
    },
  },
  methods: {
    // 导入的工具函数
    isFieldVisible,
    isFieldRequired,
    queryDetail() {
      this.$refs.searchForm.validate((valid) => {
        if (valid) this.fetchDetail()
      })
    },
    async fetchDetail() {
      this.querying = true
      this.queryError = ''
      this.detail = null
      try {
        // 1. 先调用验证接口
        const verifyRes = await postAction(VERIFY_URL + `?phone=${this.searchForm.phone}`)
        if (!verifyRes || !verifyRes.success) {
          this.queryError = (verifyRes && verifyRes.message) || '验证失败，请稍后重试'
          return
        }

        // 2. 验证成功后，再查询详情
        const res = await postAction(QUERY_URL + `?phone=${this.searchForm.phone}`)
        if (!res || !res.success || !res.result) {
          this.queryError = (res && res.message) || '未查询到对应的入职信息'
          return
        }
        this.detail = normalizeSupplementDetail(res.result)

        // 根据员工类型设置试用期字段的禁用状态
        const isLaborWorker = this.detail.jbxx && this.detail.jbxx.employeeType === '劳务工'
        this.jbxxCategories.forEach((category) => {
          category.fields.forEach((field) => {
            if (field.key === 'syq') {
              this.$set(field, 'disabled', isLaborWorker)
            }
          })
        })
        // 如果是劳务工，清空试用期字段值
        if (isLaborWorker) {
          this.detail.jbxx.syq = '-'
        }

        this.activeTab = 'jbxx'
        // this.loadConstractBelongOptions()
      } catch (error) {
        this.queryError = '查询失败，请稍后重试'
      } finally {
        this.querying = false
      }
    },
    displayValue(value) {
      return value === undefined || value === null || value === '' ? '-' : value
    },
    loadConstractBelongOptions() {
      // 暂时先去掉
      if (this.contractOptionsLoaded || this.contractOptionsLoading) return Promise.resolve()
      this.contractOptionsLoading = true
      return fetchConstractBelongOptions()
        .then((options) => {
          this.constractBelongOptions = options
          this.contractOptionsLoaded = true
        })
        .catch(() => {
          this.constractBelongOptions = []
          this.$message.warning('合同归属选项加载失败，已保留当前值')
        })
        .finally(() => {
          this.contractOptionsLoading = false
        })
    },
    addRecord(key) {
      this.detail[key].push(createSupplementRecord(this.detail))
    },
    removeRecord(key, index) {
      this.detail[key].splice(index, 1)
    },
    handleTabChange(key) {
      this.activeTab = key
    },
    // 校验指定group的数据完整性
    validateGroup(groupKey) {
      const group = this.groups.find((g) => g.key === groupKey)
      if (!group) return { valid: true }

      // 基本信息（单条记录）
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

      // 可重复记录（教育经历、家庭成员等）
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
    // 上一步
    prevStep() {
      if (this.isFirstTab) return
      const prevIndex = this.currentTabIndex - 1
      this.activeTab = this.groups[prevIndex].key
      window.scrollTo(0, 0)
    },
    // 下一步
    nextStep() {
      if (this.isLastTab) return

      // 校验当前tab
      const validation = this.validateGroup(this.activeTab)
      if (!validation.valid) {
        this.$message.warning(validation.message)
        return
      }

      const nextIndex = this.currentTabIndex + 1
      this.activeTab = this.groups[nextIndex].key
      window.scrollTo(0, 0)
    },
    async submit() {
      if (this.submitting || !this.detail) return

      // 1. 校验个人信息（jbxx）必填字段
      const jbxxMissing = []
      this.groups.forEach((group) => {
        if (group.key !== 'jbxx') return
        group.fields.forEach((f) => {
          // 检查字段是否可见
          if (!this.isFieldVisible(f, this.detail.jbxx)) return

          // 检查是否必填
          const required = this.isFieldRequired(f, this.detail.jbxx)
          if (required) {
            const value = this.detail.jbxx && this.detail.jbxx[f.key]
            if (value === undefined || value === null || value === '') {
              jbxxMissing.push(f.label)
            }
          }
        })
      })

      if (jbxxMissing.length > 0) {
        this.$message.warning(`请完善必填项：${jbxxMissing.join('、')}`)
        return
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
        const res = await postAction(SAVE_URL, payload)
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
    restart() {
      this.detail = null
      this.completed = false
      this.queryError = ''
      this.searchForm.phone = ''
      this.activeTab = 'jbxx'
      this.$nextTick(() => this.$refs.searchForm && this.$refs.searchForm.clearValidate())
      window.scrollTo(0, 0)
    },
  },
}
</script>

<style lang="less">
@import '~@/assets/less/onboardingSupplement.less';
</style>

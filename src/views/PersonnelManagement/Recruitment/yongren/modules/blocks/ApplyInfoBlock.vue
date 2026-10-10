<template>
  <div class="apply-info-block">
    <!-- 只读态：详情 / 审批 -->
    <div v-if="readonly" class="ro-grid">
      <div class="ro-item"><span class="ro-label">公司</span><span class="ro-value">{{ companyText }}</span></div>
      <div class="ro-item"><span class="ro-label">所属部门</span><span class="ro-value">{{ model.deptPath || '-' }}</span></div>
      <div class="ro-item"><span class="ro-label">岗位名称</span><span class="ro-value">{{ model.postId_dictText || '-' }}</span></div>
      <div class="ro-item"><span class="ro-label">职级名称</span><span class="ro-value">{{ model.levelId_dictText || '-' }}</span></div>
      <div class="ro-item"><span class="ro-label">员工类型</span><span class="ro-value">{{ model.employeeType || '-' }}</span></div>
      <div class="ro-item"><span class="ro-label">招聘人数</span><span class="ro-value">{{ model.zprs || 0 }}</span></div>
      <div class="ro-item"><span class="ro-label">最低薪资(K)</span><span class="ro-value">{{ model.zdxz != null ? model.zdxz : '-' }}</span></div>
      <div class="ro-item"><span class="ro-label">最高薪资(K)</span><span class="ro-value">{{ model.zgxz != null ? model.zgxz : '-' }}</span></div>
      <div class="ro-item"><span class="ro-label">性别要求</span><span class="ro-value">{{ model.xb || '-' }}</span></div>
      <div class="ro-item"><span class="ro-label">年龄下限</span><span class="ro-value">{{ model.nlxx != null ? model.nlxx : '-' }}</span></div>
      <div class="ro-item"><span class="ro-label">年龄上限</span><span class="ro-value">{{ model.nlsx != null ? model.nlsx : '-' }}</span></div>
      <div class="ro-item"><span class="ro-label">专业</span><span class="ro-value">{{ model.zy || '-' }}</span></div>
      <div class="ro-item"><span class="ro-label">最低学历</span><span class="ro-value">{{ model.zdxl_dictText || model.zdxl || '-' }}</span></div>
      <div class="ro-item"><span class="ro-label">经验要求</span><span class="ro-value">{{ model.jyyq || '-' }}</span></div>
      <div class="ro-item"><span class="ro-label">希望到岗日期</span><span class="ro-value">{{ model.xwdgrq || '-' }}</span></div>
      <div class="ro-item"><span class="ro-label">申请原因</span><span class="ro-value">{{ model.sqyy || '-' }}</span></div>
      <div class="ro-item"><span class="ro-label">面试官</span><span class="ro-value">{{ model.msg || '-' }}</span></div>

    </div>

    <!-- 编辑态：新增 / 编辑 / 再次申请 -->
    <template v-else>
      <a-row :gutter="16">
        <a-col :xs="24" :sm="8">
          <a-form-model-item label="公司">
            <a-input :value="companyText" disabled placeholder="选择部门后自动带出" />
          </a-form-model-item>
        </a-col>
        <a-col :xs="24" :sm="8">
          <a-form-model-item label="所属部门" prop="dept">
            <j-select-hrm-dept
              v-model="model.dept"
              :fallback-label="model.deptName"
              placeholder="请选择所属部门"
              @change="handleDeptChange"
              @loaded="handleDeptLoaded"
              @allLabel="(value) => { model.deptPath = value }"
            />
          </a-form-model-item>
        </a-col>
        <a-col :xs="24" :sm="8">
          <a-form-model-item label="岗位名称" prop="postId">
            <a-select
              v-model="model.postId"
              allowClear
              showSearch
              optionFilterProp="children"
              :placeholder="postLoading || pendingPostId ? '岗位加载中...' : '请选择岗位名称'"
              :disabled="postLoading || !!pendingPostId || !model.dept"
              :loading="postLoading || !!pendingPostId"
              :getPopupContainer="getPopupContainer"
              @change="handlePostChange"
            >
              <a-select-option v-for="item in postOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :xs="24" :sm="8">
          <a-form-model-item label="职级名称">
            <a-select
              v-model="model.levelId"
              allowClear
              showSearch
              optionFilterProp="children"
              :placeholder="postLoading || pendingLevelId ? '职级加载中...' : '请选择职级名称'"
              :disabled="postLoading || !!pendingLevelId || !model.postId"
              :loading="postLoading || !!pendingLevelId"
              :getPopupContainer="getPopupContainer"
            >
              <a-select-option v-for="item in postRankOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
        <a-col :xs="24" :sm="8">
          <a-form-model-item label="员工类型" prop="employeeType">
            <a-select v-model="model.employeeType" placeholder="请选择员工类型">
              <a-select-option value="正式">正式</a-select-option>
              <a-select-option value="实习">实习</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
        <a-col :xs="24" :sm="8">
          <a-form-model-item label="招聘人数" prop="zprs">
            <a-input-number v-model="model.zprs" :min="1" :precision="0" style="width: 100%" />
          </a-form-model-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :xs="24" :sm="8">
          <a-form-model-item label="最低薪资(K)" prop="zdxz">
            <a-input-number v-model="model.zdxz" :min="0" :precision="0" style="width: 100%" />
          </a-form-model-item>
        </a-col>
        <a-col :xs="24" :sm="8">
          <a-form-model-item label="最高薪资(K)" prop="zgxz">
            <a-input-number v-model="model.zgxz" :min="0" :precision="0" style="width: 100%" />
          </a-form-model-item>
        </a-col>
        <a-col :xs="24" :sm="8">
          <a-form-model-item label="性别要求" prop="xb">
            <a-select v-model="model.xb" placeholder="请选择性别">
              <a-select-option value="男">男</a-select-option>
              <a-select-option value="女">女</a-select-option>
              <a-select-option value="不限">不限</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :xs="24" :sm="8">
          <a-form-model-item label="年龄下限（需大于16）" prop="nlxx">
            <a-input-number v-model="model.nlxx" :min="16" :precision="0" style="width: 100%" />
          </a-form-model-item>
        </a-col>
        <a-col :xs="24" :sm="8">
          <a-form-model-item label="年龄上限" prop="nlsx">
            <a-input-number v-model="model.nlsx" :min="18" :max="65" :precision="0" style="width: 100%" />
          </a-form-model-item>
        </a-col>
        <a-col :xs="24" :sm="8">
          <a-form-model-item label="专业" prop="zy">
            <a-input v-model.trim="model.zy" placeholder="请输入专业" />
          </a-form-model-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :xs="24" :sm="8">
          <a-form-model-item label="最低学历" prop="zdxl">
            <j-dict-select-tag type="list" v-model="model.zdxl" dictCode="xl" placeholder="请选择学历" />
          </a-form-model-item>
        </a-col>
        <a-col :xs="24" :sm="8">
          <a-form-model-item label="经验要求" prop="jyyq">
            <a-input v-model.trim="model.jyyq" placeholder="如：3年以上" />
          </a-form-model-item>
        </a-col>
        <a-col :xs="24" :sm="8">
          <a-form-model-item label="希望到岗日期" prop="xwdgrq">
            <a-date-picker
              :value="xwdgrqValue"
              format="YYYY-MM-DD"
              placeholder="请选择希望到岗日期"
              style="width: 100%"
              :getCalendarContainer="getPopupContainer"
              @change="handleOnboardDateChange"
            />
          </a-form-model-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-model-item label="申请原因" prop="sqyy">

            <a-select v-model="model.sqyy" placeholder="请选择申请原因">
              <a-select-option value="扩大编制">扩大编制</a-select-option>
              <a-select-option value="辞职补充">辞职补充</a-select-option>
              <a-select-option value="异动补充">异动补充</a-select-option>
              <a-select-option value="其他">其他</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
        <a-col :span="16">
          <a-form-model-item label="面试官" prop="msg">
            <j-select-employee
              class="msg-selector"
              v-model="model.msg"
              placeholder="请选择面试官"
              value-field="name"
              button-text="添加"
              button-icon="plus"
              button-type="default"
              @change="(value, rows) => handleSelectValue('msg', value, rows)"
            />
            <div v-if="msgTags.length" class="employee-tag-list">
              <a-tag
                v-for="item in msgTags"
                :key="item.value"
                :class="['employee-tag-item', { 'employee-tag-primary': item.primary }]"
                closable
                @close="handleEmployeeTagClose($event, 'msg', item.value)"
              >
                <span v-if="item.prefix" class="employee-tag-prefix">{{ item.prefix }}</span>{{ item.text }}
              </a-tag>
            </div>
          </a-form-model-item>
        </a-col>
      </a-row>

      
    </template>
  </div>
</template>

<script>
import { getAction } from '@/api/manage'
import moment from 'moment'

export default {
  name: 'ApplyInfoBlock',
  props: {
    model: { type: Object, required: true },
    readonly: { type: Boolean, default: false },
  },
  data() {
    return {
      postRows: [],
      postOptions: [],
      postRankOptions: [],
      postLoading: false,
      pendingPostId: '',
      pendingLevelId: '',
      pendingPostText: '',
      pendingLevelText: '',
    }
  },
  computed: {
    companyText() {
      return String(this.model.deptPath || '').split('/')[0] || ''
    },
    xwdgrqValue() {
      if (!this.model.xwdgrq) {
        return null
      }
      const pickerValue = moment(this.model.xwdgrq, 'YYYY-MM-DD', true)
      return pickerValue.isValid() ? pickerValue : null
    },
    msgTags() {
      const values = this.getEmployeeValueList(this.model.msg)
      return values.map((item, index) => ({
        value: item,
        text: item,
        primary: index === 0,
        prefix: index === 0 ? '首选' : '次选',
      }))
    },
  },
  methods: {
    // 供父组件在新增时调用：清空联动状态
    reset() {
      this.postRows = []
      this.postOptions = []
      this.postRankOptions = []
      this.postLoading = false
      this.pendingPostId = ''
      this.pendingLevelId = ''
      this.pendingPostText = ''
      this.pendingLevelText = ''
    },
    // 供父组件在编辑/再次申请时调用：按现有 model 回填并加载岗位
    loadFromModel() {
      this.reset()
      this.pendingPostId = this.model.postId || ''
      this.pendingLevelId = this.model.levelId || ''
      this.pendingPostText = this.model.postId_dictText || ''
      this.pendingLevelText = this.model.levelId_dictText || ''
      if (this.model.dept) {
        this.loadPostOptions(this.model.dept)
      }
    },
    getPopupContainer(node) {
      return node.parentNode
    },
    loadPostOptions(deptId) {
      const currentPostId = this.pendingPostId || this.model.postId
      const currentRankId = this.pendingLevelId || this.model.levelId
      this.postRows = []
      this.postOptions = []
      this.postRankOptions = []
      if (!deptId) {
        this.model.postId = ''
        this.model.levelId = ''
        this.postLoading = false
        this.pendingPostId = ''
        this.pendingLevelId = ''
        this.pendingPostText = ''
        this.pendingLevelText = ''
        return Promise.resolve()
      }
      this.postLoading = true
      this.model.postId = ''
      this.model.levelId = ''
      return getAction('/hrJobSequence/hrJobSequence/getChildSequences', {
        deptId,
        column: 'createTime',
        order: 'desc',
        pageNo: 1,
        pageSize: 99999,
      })
        .then((res) => {
          const rows = Array.isArray(res) ? res : (res && res.result) || []
          this.postRows = rows
          const currentPost = rows.find((item) => String(item.id) === String(currentPostId))
          this.postOptions = rows.map((item) => ({
            label: item.postName,
            value: item.id,
          }))
          if (currentPostId && !currentPost) {
            this.postOptions.unshift({ label: this.pendingPostText || currentPostId, value: currentPostId })
          }
          this.postRankOptions = ((currentPost && currentPost.hrJobLevels) || []).map((item) => ({
            label: item.levelName,
            value: item.id,
          }))
          const currentRank = this.postRankOptions.find((item) => String(item.value) === String(currentRankId))
          if (currentRankId && !currentRank) {
            this.postRankOptions.unshift({ label: this.pendingLevelText || currentRankId, value: currentRankId })
          }
          this.model.postId = currentPostId || ''
          this.model.levelId = currentRankId || ''
          this.pendingPostId = ''
          this.pendingLevelId = ''
          this.pendingPostText = ''
          this.pendingLevelText = ''
        })
        .catch(() => {
          this.postRows = []
          this.postOptions = currentPostId
            ? [{ label: this.pendingPostText || currentPostId, value: currentPostId }]
            : []
          this.postRankOptions = currentRankId
            ? [{ label: this.pendingLevelText || currentRankId, value: currentRankId }]
            : []
          this.model.postId = currentPostId || ''
          this.model.levelId = currentRankId || ''
          this.pendingPostId = ''
          this.pendingLevelId = ''
          this.pendingPostText = ''
          this.pendingLevelText = ''
        })
        .finally(() => {
          this.postLoading = false
        })
    },
    handleDeptChange(deptId, deptNode) {
      this.model.dept = deptId || ''
      this.model.deptName = deptNode ? deptNode.label : ''
      this.model.companyId = deptNode ? deptNode.companyId : ''
      if (deptNode && deptNode.isFallback) {
        if (this.$refs.form) {
          this.$refs.form.clearValidate(['dept'])
        }
        return
      }
      this.model.postId = ''
      this.model.levelId = ''
      this.reset()
      this.loadPostOptions(this.model.dept)
    },
    handleDeptLoaded(deptNode) {
      if (!this.model.dept || !deptNode || deptNode.isFallback) {
        return
      }
      this.model.deptName = deptNode.label
      this.model.companyId = deptNode.companyId
      this.loadPostOptions(this.model.dept)
    },
    handlePostChange(value) {
      const currentPost = this.postRows.find((item) => String(item.id) === String(value || ''))
      this.postRankOptions = ((currentPost && currentPost.hrJobLevels) || []).map((item) => ({
        label: item.levelName,
        value: item.id,
      }))
      this.model.levelId = ''
    },
    handleOnboardDateChange(value, dateString) {
      this.model.xwdgrq = dateString || ''
    },
    handleSelectValue(field, value, rows) {
      const names = (rows || [])
        .map((item) => item.name)
        .filter(Boolean)
        .join(',')
      this.model[field] = names || value || ''
    },
    handleEmployeeTagClose(event, valueKey, tagValue) {
      if (event && event.preventDefault) {
        event.preventDefault()
      }
      const values = this.getEmployeeValueList(this.model[valueKey])
      const removeIndex = values.findIndex((item) => String(item) === String(tagValue))
      if (removeIndex !== -1) {
        values.splice(removeIndex, 1)
        this.model[valueKey] = values.join(',')
      }
    },
    getEmployeeValueList(value) {
      return String(value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    },
  },
}
</script>

<style scoped lang="less">
.apply-info-block {
  width: 100%;
}

.ro-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.ro-item {
  position: relative;
  min-height: 50px;
  padding: 9px 12px 9px 15px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #edf0f5;
  border-radius: 8px;
  transition: all 0.2s ease;

  &::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 3px;
    content: '';
    background: linear-gradient(180deg, #5b8cff 0%, #4a7bf7 100%);
    opacity: 0.65;
    transition: opacity 0.2s ease;
  }

  &:hover {
    border-color: #c6d6ff;
    box-shadow: 0 3px 10px rgba(74, 123, 247, 0.12);
    transform: translateY(-1px);

    &::before {
      opacity: 1;
    }
  }
}

.ro-item-full {
  grid-column: span 3;
}

.ro-label {
  display: block;
  margin-bottom: 4px;
  color: #8c8c8c;
  font-size: 12px;
}

.ro-value {
  color: #262626;
  font-size: 13px;
   max-height: 40px;
  overflow: auto;
      display: inline-block;
}

.msg-selector {
  max-width: 360px;
}

.employee-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.employee-tag-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-right: 0;
  margin-bottom: 0;
  padding: 0 10px;
  border: 0;
  border-radius: 14px;
  background: #e8f0fe;
  color: #4a7bf7;
  font-size: 12px;
  line-height: 24px;

  /deep/ .anticon-close {
    color: inherit;
  }
}

.employee-tag-primary {
  background: #4a7bf7;
  color: #fff;
}

.employee-tag-prefix {
  font-weight: 500;
}
</style>

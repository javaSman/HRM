<!--
  离职访谈模态框组件

  功能说明：
  - 用于创建和查看离职访谈记录
  - 支持选择访谈类型（配置化）
  - 自动加载对应访谈类型的问题列表
  - 支持填写访谈情况和是否有问题
  - 支持查看已有访谈记录（只读模式）

  组件属性：
  - visible: 控制模态框显示/隐藏
  - record: 当前离职记录数据

  事件：
  - ok: 保存成功后触发，通知父组件刷新列表

  
-->
<template>
  <j-modal
    title="离职访谈"
    :width="1100"
    :visible="visible"
    switchFullscreen
    :bodyStyle="{ padding: '20px 24px' }"
    @cancel="close"
  >
    <a-spin :spinning="loading">
      <a-form-model ref="form" :model="form" :rules="rules" layout="vertical">
        <a-row :gutter="16">
          <!-- 访谈时间 -->
          <a-col :xs="24" :sm="8">
            <a-form-model-item label="访谈时间" prop="ftsj">
              <j-date
                v-if="!disableSubmit"
                v-model="form.ftsj"
                date-format="YYYY-MM-DD"
                placeholder="请选择访谈时间"
                style="width: 100%"
              />
              <span v-else class="form-text">{{ form.ftsj || '-' }}</span>
            </a-form-model-item>
          </a-col>
          <!-- 适用职级 -->
          <a-col :xs="24" :sm="8">
            <a-form-model-item label="适用职级" prop="syjb">
              <a-select
                v-if="!disableSubmit"
                v-model="form.syjb"
                allowClear
                showSearch
                optionFilterProp="children"
                placeholder="请选择适用职级"
                @change="handleLevelChange"
              >
                <a-select-option value="管理">管理</a-select-option>
                <a-select-option value="其他">其他</a-select-option>
              </a-select>
              <span v-else class="form-text">{{ form.syzj || '-' }}</span>
            </a-form-model-item>
          </a-col>
          <!-- 访谈类型 -->
          <a-col :xs="24" :sm="8">
            <a-form-model-item label="访谈类型" prop="configId">
              <a-select
                v-if="!disableSubmit"
                v-model="form.configId"
                :disabled="!form.syjb || !!form.configId"
                allowClear
                showSearch
                optionFilterProp="children"
                :loading="configLoading"
                placeholder="请选择访谈类型"
                @change="handleConfigChange"
              >
                <a-select-option v-for="item in configOptions" :key="item.id" :value="item.id">
                  {{ item.ftlx }}
                </a-select-option>
              </a-select>
              <span v-else class="form-text">{{ selectedConfig.ftlx || '-' }}</span>
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>

      <!-- 问题列表区域 -->
      <div class="probation-section-title">问题列表</div>
      <a-table
        size="middle"
        bordered
        rowKey="rowKey"
        :columns="columns"
        :dataSource="questions"
        :pagination="false"
        :loading="questionLoading"
        :scroll="{ x: 1050 }"
      >
        <!-- 访谈情况输入框 -->
        <template slot="ftqk" slot-scope="text, question">
          <a-textarea
            v-if="!disableSubmit"
            v-model.trim="question.ftqk"
            :autoSize="{ minRows: 2, maxRows: 4 }"
            placeholder="请输入访谈情况"
          />
          <span v-else class="form-text">{{ question.ftqk || '-' }}</span>
        </template>
        <!-- 是否有问题选择 -->
        <template slot="sfywt" slot-scope="text, question">
          <a-radio-group v-if="!disableSubmit" v-model="question.sfywt">
            <a-radio value="无">无</a-radio>
            <a-radio value="有">有</a-radio>
          </a-radio-group>
          <span v-else class="form-text">{{ question.sfywt || '-' }}</span>
        </template>
        <!-- 跟进人显示 -->
        <template slot="gjr" slot-scope="text">
          {{ formatValue(text) }}
        </template>
      </a-table>
    </a-spin>

    <!-- 底部操作按钮 -->
    <template slot="footer">
      <a-button @click="close">取消</a-button>
      <!-- 仅在可编辑模式下显示保存按钮 -->
      <a-button
        v-if="!disableSubmit"
        type="primary"
        :loading="submitting"
        :disabled="loading || submitting"
        @click="handleSubmit"
      >
        保存
      </a-button>
    </template>
  </j-modal>
</template>

<script>
import { getAction, httpAction } from '@/api/manage'

export default {
  name: 'offboardingInterviewModal',
  data() {
    return {
      visible: false, // 模态框显示状态
      loading: false, // 加载状态
      configLoading: false, // 访谈类型加载状态
      configRequestId: 0, // 请求ID，用于防止异步请求竞态
      questionLoading: false, // 问题列表加载状态
      submitting: false, // 提交状态
      disableSubmit: false, // 是否禁用提交（只读模式）
      record: {}, // 当前离职记录数据
      interviewId: null, // 编辑时保存访谈记录ID

      form: {
        ftsj: '', // 访谈日期
        syjb: '', // 适用级别
        configId: '', // 访谈配置ID
      },

      configOptions: [], // 访谈类型选项列表
      selectedConfig: {}, // 选中的访谈配置
      questions: [], // 问题列表

      rules: {
        ftsj: [{ required: true, message: '请选择访谈时间', trigger: 'change' }],
        syjb: [{ required: true, message: '请选择适用职级', trigger: 'change' }],
        configId: [{ required: true, message: '请选择访谈类型', trigger: 'change' }],
      },

      // 问题列表表格列配置
      columns: [
        { title: '序号', width: 70, align: 'center', customRender: (text, record, index) => index + 1 },
        { title: '问题内容', dataIndex: 'wtnr' },
        { title: '访谈情况', dataIndex: 'ftqk', scopedSlots: { customRender: 'ftqk' } },
        { title: '是否有问题', dataIndex: 'sfywt', width: 140, scopedSlots: { customRender: 'sfywt' } },
        { title: '跟进人', dataIndex: 'gjr', width: 120, scopedSlots: { customRender: 'gjr' } },
      ],
    }
  },
  computed: {
    /**
     * 计算属性：接口地址
     * @returns {Object} 接口地址配置
     */
    url() {
      return {
        configList: '/ryManage/hrmFtpz/list', // 访谈配置列表
        configDetail: '/ryManage/hrmFtpz/queryDetlById', // 访谈配置详情
        addInterviewBatch: '/ryManage/hrmLzglLzft/addBatch', // 批量添加访谈记录
        interviewDetail: '/ryManage/hrmLzglLzft/queryById', // 访谈详情
      }
    },
  },
  methods: {
    /**
     * 打开模态框（新建模式）
     * @param {Object} record - 离职记录数据
     */
    open(record) {
      if (!record || !record.id) {
        this.$message.warning('当前离职记录缺少主键，无法添加访谈')
        return
      }
      this.record = record
      this.interviewId = null // 重置访谈ID
      this.disableSubmit = false // 可编辑模式
      this.configRequestId += 1
      this.configLoading = false
      this.form = { ftsj: '', syjb: '', configId: '' }
      this.configOptions = []
      this.selectedConfig = {}
      this.questions = []
      this.visible = true
      // 不再自动加载访谈类型选项，等选择适用职级后再加载
      // 清除表单验证状态
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    },

    /**
     * 打开模态框（编辑/查看模式）
     * @param {Object} interviewRecord - 访谈记录数据
     */
    edit(interviewRecord) {
      // 查看访谈记录（只读模式）
      // if (!interviewRecord || !interviewRecord.id) {
      //   this.$message.warning('当前访谈记录缺少主键，无法查看详情')
      //   return
      // }

      // 设置为不可编辑模式（仅查看）
      this.disableSubmit = true
      this.record = { ...interviewRecord }
      this.visible = true
      // 直接从interviewRecord中取值，不调用接口
      this.form = {
        ftsj: interviewRecord.ftrq || '',
        syjb: interviewRecord.syzj || '',
        configId: interviewRecord.configId || '',
        ftlx: interviewRecord.ftlx || '',
        syzj: interviewRecord.syzj || '',
      }

      // 填充问题列表
      if (Array.isArray(interviewRecord.ftList)) {
        this.questions = interviewRecord.ftList.map((item, index) => ({
          rowKey: item.id || `${interviewRecord.id}-${index}`,
          wtnr: item.wtnr,
          ftqk: item.ftqk || '',
          sfywt: item.sfywt || '无',
          gjr: item.gjr,
        }))
      } else {
        this.questions = []
      }

      // 保存选中的配置信息
      this.selectedConfig = {
        id: interviewRecord.configId,
        ftlx: interviewRecord.ftlx,
      }

      // 保存原始访谈记录ID
      this.interviewId = interviewRecord.id

      // 加载访谈类型选项（查看模式下用于显示）
      // this.loadConfigOptions()

      // 清除表单验证状态
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    },

    /**
     * 关闭模态框
     */
    close() {
      if (this.submitting) {
        return
      }
      this.visible = false
      this.interviewId = null // 重置访谈ID
    },

    /**
     * 适用职级变化事件
     * 重新加载对应的访谈类型选项
     * @param {String} syjb - 适用职级
     */
    handleLevelChange(syjb) {
      // 清空已选的访谈类型和问题列表
      this.form.configId = ''
      this.selectedConfig = {}
      this.questions = []
      this.configOptions = []

      if (!syjb) {
        return
      }

      // 加载对应职级的访谈类型选项
      this.loadConfigOptions()
    },

    /**
     * 加载访谈类型选项列表
     */
    loadConfigOptions() {
      this.configLoading = true
      const requestId = ++this.configRequestId
      getAction(this.url.configList, {
        syjb: this.form.syjb, // 使用当前选择的适用职级
        zt: '启用',
        pageNo: 1,
        pageSize: 9999,
        sszl: '离职',
      })
        .then((res) => {
          // 防止异步请求竞态
          if (requestId !== this.configRequestId) {
            return
          }
          if (!res || !res.success || !res.result || !Array.isArray(res.result.records)) {
            throw new Error((res && res.message) || '访谈类型加载失败')
          }
          this.configOptions = res.result.records
        })
        .catch((error) => {
          if (requestId !== this.configRequestId) {
            return
          }
          this.configOptions = []
          this.$message.error(error.message || '访谈类型加载失败，请稍后重试')
        })
        .finally(() => {
          if (requestId === this.configRequestId) {
            this.configLoading = false
          }
        })
    },

    /**
     * 访谈类型变化事件
     * 加载对应的问题列表
     * @param {String} configId - 访谈配置ID
     */
    handleConfigChange(configId) {
      this.selectedConfig = {}
      this.questions = []
      if (!configId) {
        return
      }
      this.loadConfigDetail(configId)
    },

    /**
     * 加载访谈配置详情（问题列表）
     * @param {String} configId - 访谈配置ID
     * @returns {Promise} 加载Promise
     */
    loadConfigDetail(configId) {
      this.questionLoading = true
      return getAction(this.url.configDetail, { id: configId })
        .then((res) => {
          if (!res || !res.success || !res.result || !Array.isArray(res.result.wtlbList)) {
            throw new Error((res && res.message) || '访谈问题加载失败')
          }
          this.selectedConfig = res.result
          // 将问题列表转换为表格数据格式
          this.questions = res.result.wtlbList.map((item, index) => ({
            rowKey: item.id || `${configId}-${index}`,
            wtnr: item.wtnr,
            ftqk: '',
            sfywt: '无',
            gjr: item.gjr,
          }))
          if (this.questions.length === 0) {
            this.$message.warning('当前访谈类型未配置问题')
          }
        })
        .catch((error) => {
          this.selectedConfig = {}
          this.questions = []
          this.$message.error(error.message || '访谈问题加载失败，请稍后重试')
        })
        .finally(() => {
          this.questionLoading = false
        })
    },

    /**
     * 提交保存
     * 验证表单并调用保存接口
     */
    handleSubmit() {
      if (this.submitting) {
        return
      }
      this.$refs.form.validate((valid) => {
        if (!valid) {
          return
        }
        if (this.questions.length === 0) {
          this.$message.warning('当前没有可保存的访谈问题')
          return
        }
        this.saveQuestions()
      })
    },

    /**
     * 保存访谈问题和答案
     */
    saveQuestions() {
      const isEdit = !!this.interviewId
      // 构建请求数据
      const payload = {
        id: this.interviewId || undefined, // 编辑时传入ID
        syzj: this.form.syjb, // 适用职级
        lzftList: this.questions.map((item) => ({
          ftsj: this.form.ftsj,
          ftlx: this.selectedConfig.ftlx,
          wtnr: item.wtnr,
          ftqk: item.ftqk,
          sfywt: item.sfywt,
          gjr: item.gjr,
          sszl: '离职',
          hrmLzglId: this.record.id,
        })),
      }
      this.submitting = true
      // 根据是否编辑选择不同的请求方法
      const method = isEdit ? 'put' : 'post'
      httpAction(this.url.addInterviewBatch, payload, method)
        .then((res) => {
          if (!res || !res.success) {
            throw new Error((res && res.message) || '访谈记录保存失败')
          }
          this.$message.success(res.message || '访谈记录保存成功')
          this.visible = false
          this.$emit('ok') // 通知父组件刷新列表
        })
        .catch((error) => {
          this.$message.error(error.message || '访谈记录保存失败，请稍后重试')
        })
        .finally(() => {
          this.submitting = false
        })
    },

    /**
     * 格式化显示值
     * 空值显示为 '-'
     * @param {Any} value - 待格式化的值
     * @returns {String} 格式化后的值
     */
    formatValue(value) {
      return value === undefined || value === null || value === '' ? '-' : value
    },
  },
}
</script>

<style scoped lang="less">
/* 区域标题样式 */
.probation-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 16px 0 12px;
  padding-left: 12px;
  border-left: 3px solid #4a7bf7;
}

/* 表单文本样式（禁用模式下显示纯文本） */
.form-text {
  color: #333;
  line-height: 1.5;
}
</style>

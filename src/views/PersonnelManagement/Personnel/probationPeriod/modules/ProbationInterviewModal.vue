<template>
  <j-modal
    title="添加访谈记录"
    :width="1100"
    :visible="visible"
    switchFullscreen
    :bodyStyle="{ padding: '20px 24px' }"
    @cancel="close"
  >
    <a-spin :spinning="loading">
      <a-form-model ref="form" :model="form" :rules="rules" layout="vertical">
        <a-row :gutter="16">
          <a-col :xs="24" :sm="8">
            <a-form-model-item label="访谈日期" prop="ftrq">
              <j-date
                v-model="form.ftrq"
                :disabled="disableSubmit"
                date-format="YYYY-MM-DD"
                placeholder="请选择访谈日期"
                style="width: 100%"
              />
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :sm="8">
            <a-form-model-item label="适用职级" prop="syjb">
              <a-select
                v-model="form.syjb"
                :disabled="disableSubmit"
                allowClear
                placeholder="请选择适用职级"
                @change="handleSyjbChange"
              >
                <a-select-option value="管理">管理</a-select-option>
                <a-select-option value="其他">其他</a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :xs="24" :sm="8">
            <a-form-model-item label="访谈类型" prop="configId">
              <a-select
                v-model="form.configId"
                :disabled="disableSubmit || !form.syjb || !!form.configId"
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
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>

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
        <template slot="ftqk" slot-scope="text, question">
          <a-textarea
            v-model.trim="question.ftqk"
            :disabled="disableSubmit"
            :autoSize="{ minRows: 2, maxRows: 4 }"
            placeholder="请输入访谈情况"
          />
        </template>
        <template slot="sfywt" slot-scope="text, question">
          <a-radio-group v-model="question.sfywt" :disabled="disableSubmit">
            <a-radio value="无">无</a-radio>
            <a-radio value="有">有</a-radio>
          </a-radio-group>
        </template>
        <template slot="gjr" slot-scope="text">
          {{ formatValue(text) }}
        </template>
      </a-table>
    </a-spin>

    <template slot="footer">
      <a-button @click="close">取消</a-button>
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
  name: 'ProbationInterviewModal',
  props: {
    // 模式：'probation'（试用期）或 'daily'（日常）
    mode: {
      type: String,
      default: 'probation',
      validator: (v) => ['probation', 'daily'].includes(v),
    },
  },
  data() {
    return {
      visible: false,
      loading: false,
      configLoading: false,
      configRequestId: 0,
      questionLoading: false,
      submitting: false,
      disableSubmit: false,
      record: {},
      form: {
        ftrq: '',
        syjb: '',
        configId: '',
      },
      configOptions: [],
      selectedConfig: {},
      questions: [],
      rules: {
        ftrq: [{ required: true, message: '请选择访谈日期', trigger: 'change' }],
        syjb: [{ required: true, message: '请选择适用职级', trigger: 'change' }],
        configId: [{ required: true, message: '请选择访谈类型', trigger: 'change' }],
      },
      columns: [
        { title: '序号', width: 70, align: 'center', customRender: (text, record, index) => index + 1 },
        { title: '问题内容', dataIndex: 'wtnr', width: 300 },
        { title: '访谈情况', dataIndex: 'ftqk', width: 360, scopedSlots: { customRender: 'ftqk' } },
        { title: '是否有问题', dataIndex: 'sfywt', width: 180, scopedSlots: { customRender: 'sfywt' } },
        { title: '跟进人', dataIndex: 'gjr', width: 160, scopedSlots: { customRender: 'gjr' } },
      ],
    }
  },
  computed: {
    url() {
      return {
        configList: '/ryManage/hrmFtpz/list',
        configDetail: '/ryManage/hrmFtpz/queryDetlById',
        addInterviewBatch: this.mode === 'daily' ? '/yginfo/hrmYgfljl/addBatch' : '/ryManage/hrmSyqgzRzft/addBatch',
      }
    },
  },
  methods: {
    open(record) {
      // 日常模式需要 ghId，试用期模式需要 id
      const hasRequiredId = this.mode === 'daily' ? record && record.ghId : record && record.id
      if (!hasRequiredId) {
        const msg = this.mode === 'daily' ? '缺少员工工号，无法添加访谈' : '当前试用期记录缺少主键，无法添加访谈'
        this.$message.warning(msg)
        return
      }
      this.record = record
      this.disableSubmit = false
      this.configRequestId += 1
      this.configLoading = false
      this.form = { ftrq: '', syjb: '', configId: '' }
      this.configOptions = []
      this.selectedConfig = {}
      this.questions = []
      this.visible = true
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    },
    edit(record) {
      console.log(record)
      // 日常模式需要 ghId，试用期模式需要 id
      const hasRequiredId = this.mode === 'daily' ? record && record.ghId : record && record.id
      if (!hasRequiredId) {
        const msg = this.mode === 'daily' ? '缺少员工工号，无法编辑访谈' : '当前试用期记录缺少主键，无法编辑访谈'
        this.$message.warning(msg)
        return
      }

      // 保存原始记录
      this.record = record
      this.disableSubmit = record.disableSubmit || false

      // 填充表单数据
      this.form = {
        ftrq: record.ftrq || record.ftsj || '',
        syjb: record.syjb || '',
        configId: record.configId || '',
      }
      this.questions = record.ftList || []

      // 重置状态
      this.configRequestId += 1
      this.configOptions = []
      this.selectedConfig = {}
      this.visible = true

      // 如果有适用职级，加载访谈类型选项
      if (this.form.syjb) {
        this.loadConfigOptions(this.form.syjb, this.configRequestId)
      }

      // // 如果有访谈类型ID，加载问题列表并填充答案
      // if (this.form.configId && Array.isArray(record.ftList) && record.ftList.length > 0) {
      //   this.loadConfigDetail(this.form.configId).then(() => {
      //     // 加载完问题模板后，填充已有答案
      //     this.fillQuestionAnswers(record.ftList)
      //   })
      // } else if (this.form.configId) {
      //   // 如果没有答案数据，只加载问题模板
      //   this.loadConfigDetail(this.form.configId)
      // }

      // this.$nextTick(() => {
      //   if (this.$refs.form) {
      //     this.$refs.form.clearValidate()
      //   }
      // })
    },
    close() {
      if (this.submitting) {
        return
      }
      this.visible = false
    },
    handleSyjbChange(syjb) {
      const requestId = ++this.configRequestId
      this.configLoading = false
      this.form.configId = ''
      this.configOptions = []
      this.selectedConfig = {}
      this.questions = []
      if (!syjb) {
        return
      }
      this.loadConfigOptions(syjb, requestId)
    },
    loadConfigOptions(syjb, requestId) {
      this.configLoading = true
      getAction(this.url.configList, {
        syjb,
        zt: '启用',
        pageNo: 1,
        pageSize: 9999,
        sszl: this.mode === 'daily' ? '日常' : '入职',
      })
        .then((res) => {
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
    handleConfigChange(configId) {
      this.selectedConfig = {}
      this.questions = []
      if (!configId) {
        return
      }
      this.loadConfigDetail(configId)
    },
    loadConfigDetail(configId) {
      this.questionLoading = true
      return getAction(this.url.configDetail, { id: configId })
        .then((res) => {
          if (!res || !res.success || !res.result || !Array.isArray(res.result.wtlbList)) {
            throw new Error((res && res.message) || '访谈问题加载失败')
          }
          this.selectedConfig = res.result
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
     * 填充问题答案
     * @param {Array} answerList - 已有的问题答案列表
     */
    fillQuestionAnswers(answerList) {
      if (!Array.isArray(answerList) || answerList.length === 0) {
        return
      }

      // 创建答案映射（以问题内容或ID为键）
      const answerMap = new Map()
      answerList.forEach((item) => {
        const key = item.id || item.wtnr
        if (key) {
          answerMap.set(key, item)
        }
      })

      // 匹配并填充答案
      this.questions = this.questions.map((question) => {
        const answer = answerMap.get(question.rowKey) || answerMap.get(question.wtnr)
        if (answer) {
          return {
            ...question,
            ftqk: answer.ftqk || '',
            sfywt: answer.sfywt || '无',
            gjr: answer.gjr || question.gjr,
          }
        }
        return question
      })
    },
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
    saveQuestions() {
      const payload =
        this.mode === 'daily'
          ? {
              syzj: this.form.syjb,
              id: this.record.id || undefined,
              ftList: this.questions.map((item) => ({
                ...item,
                ghId: this.record.ghId,
                ftsj: this.form.ftrq,
                rtlx: this.selectedConfig.ftlx,
                wtnr: item.wtnr,
                ftqk: item.ftqk,
                sfywt: item.sfywt,
                gjr: item.gjr,
                sszl: '日常',
                ftr: this.$store.state.user.info.username,
                syzj: this.form.syjb,
              })),
            }
          : {
              syzj: this.form.syjb,
              id: this.record.id || undefined,
              rzftList: this.questions.map((item) => ({
                hrmSyqgzId: this.record.id,
                ftrq: this.form.ftrq,
                ftlx: this.selectedConfig.ftlx,
                wtnr: item.wtnr,
                ftqk: item.ftqk,
                sfywt: item.sfywt,
                gjr: item.gjr,
                sszl: '入职',
              })),
            }
      this.submitting = true
      httpAction(this.url.addInterviewBatch, payload, 'post')
        .then((res) => {
          if (!res || !res.success) {
            throw new Error((res && res.message) || '访谈记录保存失败')
          }
          this.$message.success(res.message || '访谈记录保存成功')
          this.visible = false
          this.$emit('ok')
        })
        .catch((error) => {
          this.$message.error(error.message || '访谈记录保存失败，请稍后重试')
        })
        .finally(() => {
          this.submitting = false
        })
    },
    formatValue(value) {
      return value === undefined || value === null || value === '' ? '-' : value
    },
  },
}
</script>

<style scoped lang="less">
@import './probation-dialogs.less';
</style>

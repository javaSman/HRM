<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="状态" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="zt">
              <a-select v-model="model.zt" allowClear placeholder="请选择状态">
                <a-select-option value="启用">启用</a-select-option>
                <a-select-option value="禁用">禁用</a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="访谈类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="ftlx">
              <a-input v-model="model.ftlx" placeholder="请输入访谈类型"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="所属种类" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="sszl">
              <a-select v-model="model.sszl" allowClear placeholder="请选择所属种类">
                <a-select-option value="入职">入职</a-select-option>
                <a-select-option value="离职">离职</a-select-option>
                <a-select-option value="日常">日常</a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="适用职级" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="syjb">
              <a-select v-model="model.syjb" allowClear placeholder="请选择适用职级">
                <a-select-option value="管理">管理</a-select-option>
                <a-select-option value="其他">其他</a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <!-- <a-col :span="24">
            <a-form-model-item label="创建人" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="cjr">
              <a-input v-model="model.cjr" placeholder="请输入创建人"  ></a-input>
            </a-form-model-item>
          </a-col> -->
        </a-row>

        <!-- 问题列表（仅编辑模式显示） -->
        <div v-if="model.id" style="margin-top: 20px">
          <a-divider>问题列表</a-divider>
          <div style="margin-bottom: 12px">
            <a-button type="dashed" icon="plus" @click="handleAddQuestion">添加问题</a-button>
          </div>
          <a-table
            :columns="questionColumns"
            :data-source="model.wtlbList"
            :pagination="false"
            size="small"
            row-key="id"
          >
            <template slot="index" slot-scope="text, record, index">
              {{ index + 1 }}
            </template>
            <template slot="wtnr" slot-scope="text, record">
              <a-input v-model="record.wtnr" placeholder="请输入问题内容" />
            </template>
            <template slot="gjr" slot-scope="text, record">
              <j-select-employee
                v-model="record.gjr"
                placeholder="请选择跟进人"
                :multiple="false"
                value-field="name"
                :disabled="formDisabled"
                :buttonShow="false"
              />
            </template>
            <template slot="action" slot-scope="text, record, index">
              <a-popconfirm title="确定删除吗?" @confirm="handleDeleteQuestion(index)">
                <a style="color: #f56c6c">删除</a>
              </a-popconfirm>
            </template>
          </a-table>
        </div>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>
import { httpAction, getAction, deleteAction } from '@/api/manage'
import { validateDuplicateValue } from '@/utils/util'

export default {
  name: 'HrmFtpzForm',
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
      originalWtlbList: [], // 保存原始问题列表，用于变更对比
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      confirmLoading: false,
      validatorRules: {},
      questionColumns: [
        { title: '序号', dataIndex: 'index', width: 60, scopedSlots: { customRender: 'index' } },
        { title: '问题内容', dataIndex: 'wtnr', scopedSlots: { customRender: 'wtnr' } },
        { title: '跟进人', dataIndex: 'gjr', width: 220, scopedSlots: { customRender: 'gjr' } },
        { title: '操作', dataIndex: 'action', width: 80, scopedSlots: { customRender: 'action' } },
      ],
      url: {
        add: '/ryManage/hrmFtpz/add',
        edit: '/ryManage/hrmFtpz/edit',
        editAll: '/ryManage/hrmFtpz/editAll',
        deleteWtlb: '/ryManage/hrmFtpzWtlb/delete',
        addSjjl: '/ryManage/hrmFtpzSjjl/add',
        queryById: '/ryManage/hrmFtpz/queryById',
        queryDetlById: '/ryManage/hrmFtpz/queryDetlById',
      },
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
    username() {
      return this.$store.state.user.info.username
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
      // 新增模式
      if (!record || !record.id) {
        this.model = Object.assign({}, record || this.modelDefault)
        this.$set(this.model, 'wtlbList', [])
        this.originalWtlbList = [] // 重置原始数据
        return
      }

      // 编辑模式：调用详情接口获取完整数据
      this.confirmLoading = true
      getAction(this.url.queryDetlById, { id: record.id })
        .then((res) => {
          if (res.success && res.result) {
            this.model = res.result
            this.$set(this.model, 'wtlbList', res.result.wtlbList || [])
            // 深拷贝保存原始数据，用于后续变更对比
            this.originalWtlbList = JSON.parse(JSON.stringify(res.result.wtlbList || []))
          } else {
            this.$message.warning(res.message || '加载失败')
          }
        })
        .catch(() => {
          this.$message.error('加载数据失败')
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
    handleAddQuestion() {
      if (!this.model.wtlbList) {
        this.$set(this.model, 'wtlbList', [])
      }
      // 新增问题时，id 为空字符串
      this.model.wtlbList.push({
        id: undefined,
        wtnr: '',
        gjr: '',
      })
    },
    handleDeleteQuestion(index) {
      const question = this.model.wtlbList[index]

      // 如果是新增项（id 为空），直接从数组移除
      if (!question.id || question.id === '') {
        this.model.wtlbList.splice(index, 1)
        return
      }

      // 如果是已保存项，调用删除接口
      this.confirmLoading = true
      deleteAction(this.url.deleteWtlb, { id: question.id })
        .then((res) => {
          if (res.success) {
            httpAction(
              this.url.addSjjl,
              {
                hrmFtpzId: this.model.id,
                xgr: this.username,
                xgnr: '更新问题列表',
              },
              'post'
            )
            this.$message.success('删除成功')
            // 从数组中移除
            this.model.wtlbList.splice(index, 1)
            // 同步更新原始数据
            this.originalWtlbList = this.originalWtlbList.filter((item) => item.id !== question.id)
          } else {
            this.$message.warning(res.message || '删除失败')
          }
        })
        .catch(() => {
          this.$message.error('删除失败')
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
    hasWtlbListChanged() {
      // 检查是否有新增项（id 为空）
      const hasNewItems = this.model.wtlbList.some((item) => !item.id || item.id === '')

      // 检查数量是否变化
      if (this.model.wtlbList.length !== this.originalWtlbList.length) {
        return true
      }

      // 检查内容是否修改
      for (let i = 0; i < this.model.wtlbList.length; i++) {
        const current = this.model.wtlbList[i]
        const original = this.originalWtlbList.find((item) => item.id === current.id)

        if (!original) {
          // 找不到原始数据，说明是新增或ID被修改
          return true
        }

        // 对比内容是否变化
        if (current.wtnr !== original.wtnr || current.gjr !== original.gjr) {
          return true
        }
      }

      return hasNewItems
    },
    submitForm() {
      const that = this
      // 触发表单验证
      this.$refs.form.validate((valid) => {
        if (valid) {
          that.confirmLoading = true

          // 判断是新增还是编辑
          if (that.model.id) {
            // 编辑模式：直接使用 editAll 接口提交整个 model
            httpAction(
              that.url.editAll,
              {
                ...that.model,
                wtlbList: that.model.wtlbList.map((item) => {
                  return {
                    ...item,
                    hrmFtpzId: that.model.id,
                  }
                }),
              },
              'put'
            )
              .then((res) => {
                if (res.success) {
                  // 仅在问题列表有变更时添加事件记录
                  if (that.hasWtlbListChanged()) {
                    return httpAction(
                      that.url.addSjjl,
                      {
                        hrmFtpzId: that.model.id,
                        xgr: that.username,
                        xgnr: '更新问题列表',
                      },
                      'post'
                    )
                  }
                  return Promise.resolve({ success: true })
                } else {
                  that.$message.warning(res.message || '保存失败')
                  throw new Error(res.message)
                }
              })
              .then(() => {
                that.$message.success('保存成功')
                that.$emit('ok')
              })
              .catch(() => {
                that.$message.error('保存失败')
              })
              .finally(() => {
                that.confirmLoading = false
              })
          } else {
            // 新增模式：使用 add 接口
            httpAction(
              that.url.add,
              Object.assign(that.model, {
                cjr: that.username,
              }),
              'post'
            )
              .then((res) => {
                if (res.success) {
                  that.$message.success('保存成功')
                  that.$emit('ok')
                } else {
                  that.$message.warning(res.message || '保存失败')
                }
              })
              .catch(() => {
                that.$message.error('保存失败')
              })
              .finally(() => {
                that.confirmLoading = false
              })
          }
        }
      })
    },
  },
}
</script>

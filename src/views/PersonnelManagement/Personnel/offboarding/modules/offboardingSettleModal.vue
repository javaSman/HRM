<!--
  离职结算模态框组件

  功能说明：
  - 用于发起离职结算和处理离职结算
  - 支持添加多个结算子事务
  - 发起结算：从「待离职」变更为「结算中」
  - 处理结算：可更新子事务状态，全部完成后变更为「已离职」

  组件属性：
  - visible: 控制模态框显示/隐藏
  - record: 当前离职记录数据

  事件：
  - ok: 操作成功后触发，通知父组件刷新列表

  
-->
<template>
  <a-modal
    :title="modalTitle"
    :width="850"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @cancel="handleCancel"
    :maskClosable="false"
  >
    <!-- 基本信息展示区域 -->
    <div
      style="
        background: #f0f7ff;
        border-radius: 8px;
        padding: 14px 16px;
        margin-bottom: 16px;
        font-size: 13px;
        line-height: 2;
      "
    >
      <a-row :gutter="20">
        <!-- 姓名 -->
        <a-col :span="12">
          <span style="color: #666">姓名：</span>
          <span style="color: #333; font-weight: 500">{{ record.xm || '-' }}</span>
        </a-col>
        <!-- 工号 -->
        <a-col :span="12">
          <span style="color: #666">工号：</span>
          <span style="color: #333">{{ record.gh || '-' }}</span>
        </a-col>
        <!-- 离职原因 -->
        <a-col :span="12">
          <span style="color: #666">离职原因：</span>
          <span style="color: #333">{{ record.lzyy || '-' }}</span>
        </a-col>
        <!-- 预计离职日期 -->
        <a-col :span="12">
          <span style="color: #666">预计离职日期：</span>
          <span style="color: #333">{{ record.yjlzrq || '-' }}</span>
        </a-col>
      </a-row>
    </div>

    <!-- 子事务区域 -->
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px">
        <div style="font-size: 14px; font-weight: 600; color: #333">子事务</div>
        <a-button type="primary" size="small" icon="plus" @click="addSettleItem">添加子事务</a-button>
      </div>

      <!-- 空状态提示 -->
      <div v-if="settleItems.length === 0" style="border: 1px solid #e8e9ed; border-radius: 6px; padding: 12px">
        <div style="color: #999; text-align: center; padding: 10px; font-size: 13px">暂无子事务，点击上方按钮添加</div>
      </div>

      <!-- 子事务表格 -->
      <a-table
        v-else
        size="small"
        bordered
        :columns="columns"
        :dataSource="settleItems"
        :pagination="false"
        rowKey="key"
      >
        <!-- 事项名称输入框 -->
        <template slot="sxmc" slot-scope="text, record">
          <a-input v-model="record.sxmc" placeholder="请输入事项名称" />
        </template>
        <!-- 处理人输入框 -->
        <template slot="clr" slot-scope="text, record">
          <!-- <a-input v-model="record.clr" placeholder="请输入" /> -->
          <j-select-employee
            v-model="record.clr"
            placeholder="请选择处理人"
            :multiple="false"
            valueField="name"
            buttonText="选择"
            :buttonShow="false"
          />
        </template>
        <!-- 抄送人输入框 -->
        <template slot="csr" slot-scope="text, record">
          <!-- <a-input v-model="record.csr" placeholder="请输入" /> -->
          <j-select-employee
            v-model="record.csr"
            placeholder="请选择抄送人"
            :multiple="false"
            valueField="name"
            buttonText="选择"
            :buttonShow="false"
          />
        </template>
        <!-- 事务状态 -->
        <template slot="swzt" slot-scope="text, record">
          <!-- 发起模式：固定显示处理中 -->
          <div v-if="mode === 'init'">处理中</div>
          <!-- 处理模式：可选择状态 -->
          <a-select v-else v-model="record.swzt" style="width: 100%">
            <a-select-option value="处理中">处理中</a-select-option>
            <a-select-option value="已完成">已完成</a-select-option>
          </a-select>
        </template>
        <!-- 操作按钮 -->
        <template slot="action" slot-scope="text, record, index">
          <a-popconfirm
            title="确定要删除该子事务吗?"
            ok-text="确定"
            cancel-text="取消"
            @confirm="removeSettleItem(index)"
          >
            <a style="color: #ff4d4f; cursor: pointer">删除</a>
          </a-popconfirm>
        </template>
      </a-table>
    </div>

    <!-- 底部操作按钮 -->
    <template slot="footer">
      <a-button @click="handleCancel">取消</a-button>
      <a-button type="primary" :loading="confirmLoading" @click="handleSubmit">
        {{ submitButtonText }}
      </a-button>
    </template>
  </a-modal>
</template>

<script>
import { httpAction, getAction } from '@/api/manage'
import moment from 'moment'

export default {
  name: 'offboardingSettleModal',
  data() {
    return {
      visible: false, // 模态框显示状态
      confirmLoading: false, // 提交按钮加载状态
      record: {}, // 当前离职记录数据
      mode: 'init', // 模式：'init'=发起结算, 'process'=处理结算
      settleItems: [], // 结算子事务列表

      // 子事务表格列配置
      columns: [
        {
          title: '事项名称',
          dataIndex: 'sxmc',
          width: 200,
          scopedSlots: { customRender: 'sxmc' },
        },
        {
          title: '处理人',
          dataIndex: 'clr',
          width: 140,
          scopedSlots: { customRender: 'clr' },
        },
        {
          title: '抄送人',
          dataIndex: 'csr',
          width: 140,
          scopedSlots: { customRender: 'csr' },
        },
        {
          title: '事务状态',
          dataIndex: 'swzt',
          width: 100,
          scopedSlots: { customRender: 'swzt' },
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: 60,
          scopedSlots: { customRender: 'action' },
        },
      ],

      url: {
        settle: '/ryManage/hrmLzgl/lzjsEditAll', // 离职结算接口
        getSettlement: '/ryManage/hrmLzgl/queryDetlById', // 获取结算数据接口
      },
    }
  },
  computed: {
    /**
     * 计算属性：模态框标题
     * @returns {String} 标题文本
     */
    modalTitle() {
      return this.mode === 'process' ? '离职结算处理' : '离职结算'
    },

    /**
     * 计算属性：提交按钮文本
     * @returns {String} 按钮文本
     */
    submitButtonText() {
      return this.mode === 'process' ? '保存' : '发起结算'
    },
  },
  methods: {
    /**
     * 打开模态框
     * 根据离职状态判断是发起结算还是处理结算
     * @param {Object} record - 离职记录数据
     */
    open(record) {
      if (!record || !record.id) {
        this.$message.warning('当前离职记录缺少主键，无法进行结算')
        return
      }
      this.record = record
      this.settleItems = []

      // 根据状态判断模式
      if (record.zt === '结算中') {
        // 结算中状态：处理结算模式
        this.mode = 'process'
        this.loadSettlement(record.id)
      } else if (record.zt === '待离职') {
        // 待离职状态：发起结算模式
        this.mode = 'init'
        this.loadSettlement(record.id)
      } else {
        // 其他状态不允许操作
        this.$message.warning('当前状态不允许进行结算操作')
        return
      }

      this.visible = true
    },

    /**
     * 加载已有结算数据
     * @param {String} id - 离职记录ID
     */
    loadSettlement(id) {
      this.confirmLoading = true
      getAction(this.url.getSettlement, { id })
        .then((res) => {
          if (!res || !res.success) {
            throw new Error(res.message || '结算数据加载失败')
          }
          // 更新表单数据（基本信息）
          if (res.result) {
            this.record = {
              ...this.record,
              ...res.result,
            }
          }
          // 从result中获取离职结算子事务列表
          const lzjsList = Array.isArray(res.result.lzjsList) ? res.result.lzjsList : []
          // 为每个子事务添加key属性用于表格渲染
          this.settleItems = lzjsList.map((item, index) => ({
            ...item,
            key: item.id || `${Date.now()}_${index}`,
          }))
        })
        .catch((error) => {
          this.$message.error(error.message || '结算数据加载失败，请稍后重试')
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },

    /**
     * 关闭模态框
     * 重置所有状态
     */
    close() {
      this.visible = false
      this.confirmLoading = false
      this.record = {}
      this.settleItems = []
    },

    /**
     * 取消按钮点击事件
     */
    handleCancel() {
      this.close()
    },

    /**
     * 添加结算子事务
     */
    addSettleItem() {
      this.settleItems.push({
        key: Date.now() + Math.random(), // 唯一标识
        sxmc: '', // 事项名称
        clr: '', // 处理人
        csr: '', // 抄送人
        swzt: '处理中', // 事务状态：默认处理中
      })
    },

    /**
     * 删除结算子事务
     * @param {Number} index - 子事务索引
     */
    removeSettleItem(index) {
      const item = this.settleItems[index]

      // 如果是临时新增的项目(没有ID),直接删除
      if (!item.id) {
        this.settleItems.splice(index, 1)
        return
      }

      // 如果是已保存的项目,需要调用删除接口
      httpAction(`/ryManage/hrmLzglLzjs/delete?id=${item.id}`, null, 'delete')
        .then((res) => {
          if (res.success) {
            this.$message.success('删除成功')
            this.settleItems.splice(index, 1)
          } else {
            this.$message.error(res.message || '删除失败')
          }
        })
        .catch((error) => {
          this.$message.error(error.message || '删除失败,请稍后重试')
        })
    },

    /**
     * 提交结算
     * 验证并保存结算子事务
     */
    handleSubmit() {
      if (this.confirmLoading) {
        return
      }

      // 验证至少有一个有效的子事务
      const validItems = this.settleItems.filter((item) => item.sxmc && item.clr)
      if (validItems.length === 0) {
        this.$message.warning('请至少添加一个有效的子事务')
        return
      }

      this.confirmLoading = true

      // 构建请求数据
      const payload = {
        //id: this.record.id,
        ...this.record,
        lzjsList: validItems.map((item) => ({
          ...item,
          hrmLzglId: this.record.id, // 关联离职记录ID
          xm: this.record.xm, // 姓名
          gh: this.record.gh, // 工号
          lzyy: this.record.lzyy, // 离职原因
          yjlzrq: this.record.yjlzrq, // 预计离职日期
          key: undefined, // 删除key属性，避免后端报错
        })),
      }

      // 根据模式设置不同的状态
      if (this.mode === 'init') {
        // 发起结算：状态变更为结算中
        payload.zt = '结算中'
      } else {
        // 处理模式：检查是否全部完成
        const allDone = validItems.every((item) => item.swzt === '已完成')
        if (allDone) {
          // 全部完成：状态变更为已离职，设置实际离职日期
          payload.zt = '已离职'
          payload.sjlzrq = moment().format('YYYY-MM-DD')
        }
      }

      httpAction(this.url.settle, payload, 'put')
        .then((res) => {
          if (!res || !res.success) {
            throw new Error(res.message || '操作失败')
          }

          // 根据模式显示不同的成功提示
          if (this.mode === 'init') {
            this.$message.success('已发起离职结算，进入结算中状态')
          } else {
            const allDone = validItems.every((item) => item.swzt === '已完成')
            if (allDone) {
              this.$message.success('所有子事务已完成，已转为已离职')
            } else {
              this.$message.success('结算子事务已更新')
            }
          }

          this.$emit('ok') // 通知父组件刷新列表
          this.close()
        })
        .catch((error) => {
          this.$message.error(error.message || '操作失败，请稍后重试')
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
  },
}
</script>

<style scoped></style>

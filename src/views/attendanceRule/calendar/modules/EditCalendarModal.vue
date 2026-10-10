<template>
  <a-modal
    v-model="visible"
    width="1000px"
    :confirmLoading="confirmLoading"
    :closable="false"
    :maskClosable="false"
  >
    <div class="modal-custom-header">
      <span class="modal-custom-title">{{ title }}</span>
      <button class="modal-custom-close" @click="handleCancel">&times;</button>
    </div>
    
    <div class="edit-grid">
      <div 
        v-for="item in modelArr" 
        :key="item.day"
        class="edit-item"
      >
        <span class="e-date">{{ item.yf }}/{{ item.day }}</span>
        <span class="e-week">{{ item.week }}</span>
        <span :class="['type-tag', 'e-tag', getTypeTagClass(item.isOffDay)]">
          {{ getStateText(item.isOffDay) }}
        </span>
        <span class="e-select">
          <j-dict-select-tag style="width: 100%;" v-model="item.isOffDay" dictCode="day_type"  allowClear placeholder="请选择日期类型" />
        </span>
      </div>
    </div>
    
    <div class="modal-custom-footer" slot="footer">
      <a-button @click="handleCancel">取消</a-button>
      <a-button type="primary" :loading="confirmLoading" @click="handleSave">保存</a-button>
    </div>
  </a-modal>
</template>

<script>
import { httpAction } from '@/api/manage'

export default {
  name: 'EditCalendarModal',
  props: {
    // 是否显示
    value: {
      type: Boolean,
      default: false
    },
    // 标题
    title: {
      type: String,
      default: ''
    },
    // 编辑数据
    editDays: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      confirmLoading: false,
      modelArr:[],
      url: {
        edit: '/hr_calendar_holiday/hrCalendarHoliday/editBatch'
      }
    }
  },
  created(){
    this.modelArr = this.editDays.map(item => ({...item}))
  },
  computed: {
    visible: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    }
  },
  watch: {
    editDays(val) {
      this.modelArr = val.map(item => ({...item}))
    }
  },
  methods: {
    // 格式化日期显示
    formatDay(day) {
      return `${String(this.currentEditMonth).padStart(2, '0')}/${String(day).padStart(2, '0')}`
    },
    
    // 获取状态文本
    getStateText(state) {
      const stateMap = {
        0: '工作日',
        1: '休息日',
        2: '法定节假日',
        3: '调休上班'
      }
      return stateMap[state] || '工作日'
    },
    
    // 获取类型标签样式类
    getTypeTagClass(state) {
      const classMap = {
        0: 'type-tag--normal',
        1: 'type-tag--weekend',
        2: 'type-tag--holiday',
        3: 'type-tag--workday'
      }
      return classMap[state] || 'type-tag--normal'
    },
    
    // 取消
    handleCancel() {
      this.$emit('cancel')
      this.visible = false
    },
    
    // 保存
    handleSave() {
      const that = this
        this.confirmLoading=true
        httpAction(this.url.edit, this.modelArr, 'post').then((res) => {
            if (res.success) {
              that.$message.success(res.message)
              that.$emit('ok')
            } else {
              that.$message.warning(res.message)
            }
          }).finally(() => {
            that.confirmLoading = false
          })
    }
      
  }
}
</script>

<style lang="less" scoped>
/* 自定义头部 */
.modal-custom-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 22px;
  margin: -24px -24px 10px -24px;
  border-radius: 4px 4px 0 0;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
}

.modal-custom-title {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
}

.modal-custom-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  border: 0;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #ffffff;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.35);
    color: #ffffff;
    border-color: transparent;
  }
}

/* 自定义底部 */
.modal-custom-footer {
  

  .ant-btn {
    flex: 1;
    text-align: center;
  }

  .ant-btn-primary {
    color: #fff !important;
    background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%) !important;
    box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2) !important;
    border: none !important;
    font-weight: 600;

    &:hover {
      background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%) !important;
      opacity: 0.92;
      box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2) !important;
    }
  }
}

/* 编辑网格 */
.edit-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px 16px;
  max-height: 600px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(45, 120, 255, 0.08);
    border-radius: 2px;
  }
}

.edit-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  background: #fafafa;
  
  &:hover {
    background: #f0f5ff;
  }
}

.e-date {
  font-weight: 600;
  color: #1f2937;
  font-size: 13px;
  min-width: 42px;
  flex-shrink: 0;
}

.e-week {
  font-size: 11px;
  color: #9ca3af;
  min-width: 32px;
  flex-shrink: 0;
}

.e-tag {
  flex-shrink: 0;
}

.e-select {
  margin-left: auto;
  flex-shrink: 0;
  min-width: 120px;
}

.type-tag {
  display: inline-block;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 3px;
  font-weight: 500;
  white-space: nowrap;
  
  &--normal {
    background: #f3f4f6;
    color: #6b7280;
  }
  
  &--weekend {
    background: #e8f3ff;
    color: #1677ff;
  }
  
  &--holiday {
    background: #fff1f3;
    color: #f53f3f;
  }
  
  &--workday {
    background: repeating-linear-gradient(45deg, #fff7e6, #fff7e6 2px, #ffe7ba 2px, #ffe7ba 4px);
    color: #d46b08;
    border: 1px solid #ffa940;
  }
}
</style>

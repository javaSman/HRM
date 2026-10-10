<template>
  <j-modal title="黑名单详情" :width="900" :visible="visible" switchFullscreen :bodyStyle="bodyStyle" @cancel="close">
    <div class="info-grid">
      <div v-for="item in infoItems" :key="item.key" class="info-item">
        <span class="info-label">{{ item.label }}</span>
        <span v-if="item.type === 'status'" class="info-value">
          <a-tag :color="record.status === '已移出' ? 'green' : 'blue'">{{ item.value }}</a-tag>
        </span>
        <span v-else-if="item.type === 'level'" :class="['black-level-tag', getLevelClass(record.hmddj)]">
          <span class="dot"></span>{{ item.value }}
        </span>
        <span v-else class="info-value">{{ item.value }}</span>
      </div>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">详细说明</div>
      <div class="detail-copy">{{ formatValue(record.xxsm) }}</div>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">证据附件</div>
      <div v-if="evidenceFiles.length" class="evidence-list">
        <a-button v-for="file in evidenceFiles" :key="file.filePath" icon="paper-clip" @click="previewFile(file)">
          {{ file.fileName }}
        </a-button>
      </div>
      <a-empty v-else description="暂无证据附件" />
    </div>

    <template slot="footer">
      <a-button v-if="isActive" @click="emitAction('edit')">编辑</a-button>
      <a-button v-if="isActive && !isPermanentLevel(record.hmddj)" type="primary" @click="emitAction('remove')">
        移出黑名单
      </a-button>
      <a-button v-if="!isActive" type="primary" @click="emitAction('rejoin')">重新加入</a-button>
      <a-button @click="close">关闭</a-button>
    </template>
  </j-modal>
</template>

<script>
import { toMaterialFileList } from '../../offer/modules/offerMaterialFile'
import { getLevelClass, getLevelText, getSourceText, isPermanentLevel } from '../blackListConfig'

export default {
  name: 'HrmHmdlbDetailModal',
  data() {
    return {
      visible: false,
      record: {},
      bodyStyle: { maxHeight: 'calc(100vh - 168px)', overflowY: 'auto', padding: '16px 24px 12px' },
    }
  },
  computed: {
    isActive() {
      return this.record.status !== '已移出'
    },
    evidenceFiles() {
      return toMaterialFileList(this.record.zjfj)
    },
    infoItems() {
      const items = [
        { key: 'status', label: '状态', value: this.formatValue(this.record.status), type: 'status' },
        { key: 'xm', label: '姓名', value: this.formatValue(this.record.xm) },
        { key: 'sjh', label: '手机号', value: this.formatValue(this.record.sjh) },
        { key: 'sfzh', label: '身份证号', value: this.formatValue(this.record.sfzh) },
        { key: 'hmddj', label: '黑名单等级', value: getLevelText(this.record.hmddj), type: 'level' },
        { key: 'jrsj', label: '加入时间', value: this.formatValue(this.record.jrsj) },
        { key: 'jryy', label: '加入原因', value: this.formatValue(this.record.jryy) },
        { key: 'lyqd', label: '来源渠道', value: getSourceText(this.record.lyqd) },
        { key: 'czr', label: '操作人', value: this.formatValue(this.record.czr) },
      ]
      if (!this.isActive) {
        items.push(
          { key: 'ycsj', label: '移出时间', value: this.formatValue(this.record.ycsj) },
          { key: 'ycyy', label: '移出原因', value: this.formatValue(this.record.ycyy) },
          { key: 'ycczr', label: '移出操作人', value: this.formatValue(this.record.ycczr) }
        )
      }
      return items
    },
  },
  methods: {
    open(record) {
      this.record = Object.assign({}, record || {})
      this.visible = true
    },
    close() {
      this.visible = false
    },
    formatValue(value) {
      return value === undefined || value === null || value === '' ? '-' : value
    },
    getLevelClass,
    isPermanentLevel,
    previewFile(file) {
      this.$store.dispatch('openPdf', file.filePath)
    },
    emitAction(action) {
      this.$emit(action, this.record)
    },
  },
}
</script>

<style scoped lang="less">
.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.info-item {
  min-height: 56px;
  padding: 9px 12px;
  border-radius: 4px;
  background: #f7f8fa;
}
.info-label {
  display: block;
  margin-bottom: 5px;
  color: #8c8c8c;
  font-size: 12px;
}
.info-value {
  color: #262626;
  font-size: 13px;
  word-break: break-all;
}
.detail-section {
  margin-top: 20px;
}
.detail-section-title {
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
  font-weight: 600;
}
.detail-copy {
  min-height: 54px;
  padding: 12px;
  border-radius: 4px;
  background: #f7f8fa;
  color: #595959;
  line-height: 1.7;
  white-space: pre-wrap;
}
.evidence-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.black-level-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px 3px 8px;
  border-radius: 12px;
  font-size: 12px;
}
.black-level-tag .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.level-1year {
  background: #e6f7ff;
  color: #1890ff;
}
.level-1year .dot {
  background: #1890ff;
}
.level-3year {
  background: #fff7e6;
  color: #fa8c16;
}
.level-3year .dot {
  background: #fa8c16;
}
.level-5year {
  background: #fff1f0;
  color: #ff4d4f;
}
.level-5year .dot {
  background: #ff4d4f;
}
.level-permanent {
  background: #2c2c2c;
  color: #fff;
}
.level-permanent .dot {
  background: #fff;
}
.level-unknown {
  background: #f5f5f5;
  color: #666;
}
.level-unknown .dot {
  background: #999;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>


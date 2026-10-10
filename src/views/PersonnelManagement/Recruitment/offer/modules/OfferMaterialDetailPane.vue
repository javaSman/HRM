<template>
  <div class="offer-material-detail-pane">
    <div v-if="hasMaterial" class="material-group-list">
      <section v-if="lzzmList.length" class="material-group">
        <div class="material-group-title">离职证明</div>
        <div v-for="item in lzzmList" :key="item.filePath" class="material-file-row">
          <a-icon type="paper-clip" class="material-file-icon" />
          <span class="material-file-name">{{ getFileName(item) }}</span>
          <a-button type="primary" size="small" icon="eye" @click="$emit('preview', item.filePath)">预览</a-button>
        </div>
      </section>
      <section v-if="lszmList.length" class="material-group">
        <div class="material-group-title">上家公司工资流水</div>
        <div v-for="item in lszmList" :key="item.filePath" class="material-file-row">
          <a-icon type="money-collect" class="material-file-icon" />
          <span class="material-file-name">{{ getFileName(item) }}</span>
          <a-button type="primary" size="small" icon="eye" @click="$emit('preview', item.filePath)">预览</a-button>
        </div>
      </section>
    </div>
    <div v-else class="material-empty">
      <a-icon type="paper-clip" />
      <span>暂无附件材料</span>
    </div>
  </div>
</template>

<script>
import { toMaterialFileList } from './offerMaterialFile'

export default {
  name: 'OfferMaterialDetailPane',
  props: {
    lzzm: { type: [String, Array], default: '' },
    lszm: { type: [String, Array], default: '' }
  },
  computed: {
    lzzmList() {
      return toMaterialFileList(this.lzzm)
    },
    lszmList() {
      return toMaterialFileList(this.lszm)
    },
    hasMaterial() {
      return this.lzzmList.length > 0 || this.lszmList.length > 0
    }
  },
  methods: {
    getFileName(item) {
      return item.fileName || '附件材料'
    }
  }
}
</script>

<style scoped lang="less">
.material-group + .material-group { margin-top: 18px; }
.material-group-title { margin-bottom: 8px; color: #262626; font-weight: 600; }
.material-file-row { display: flex; align-items: center; padding: 12px 14px; border: 1px solid #f0f0f0; border-radius: 4px; background: #fafafa; }
.material-file-icon { margin-right: 10px; color: #4a7bf7; font-size: 18px; }
.material-file-name { flex: 1; overflow: hidden; margin-right: 12px; color: #595959; text-overflow: ellipsis; white-space: nowrap; }
.material-empty { min-height: 160px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #999; }
.material-empty .anticon { margin-bottom: 10px; font-size: 30px; }
</style>

<template>
  <a-modal
    title="门禁权限详情"
    :width="640"
    :visible="visible"
    :footer="null"
    :maskClosable="true"
    :destroyOnClose="true"
    @cancel="handleCancel"
  >
    <a-spin :spinning="loading">
      <div class="detail-content">
        <a-descriptions :column="2" bordered size="small">
          <a-descriptions-item label="工号">
            {{ detail.gh || '—' }}
          </a-descriptions-item>
          <a-descriptions-item label="卡号">
            {{ detail.kh || '—' }}
          </a-descriptions-item>
          <a-descriptions-item label="姓名">
            {{ detail.xm || '—' }}
          </a-descriptions-item>
          <a-descriptions-item label="人员类型">
            {{ getRylxText(detail.rylx) }}
          </a-descriptions-item>
          <a-descriptions-item label="手机号码">
            {{ detail.sjhm || '—' }}
          </a-descriptions-item>
          <a-descriptions-item label="照片">
            <j-image-upload v-model="detail.zp" :disabled="true" text="查看"></j-image-upload>
          </a-descriptions-item>
          <a-descriptions-item label="门禁地点" :span="2">
            <div class="location-tags">
              <a-tag v-for="(loc, index) in locationList" :key="index" color="blue">
                {{ loc }}
              </a-tag>
            </div>
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-spin>
  </a-modal>
</template>

<script>
import { getAction } from '@/api/manage'

export default {
  name: 'DormGuardDetailModal',
  data() {
    return {
      visible: false,
      loading: false,
      detail: {
        id: null,
        gh: '',
        kh: '',
        xm: '',
        rylx: '',
        sjhm: '',
        zp: '',
        mjdd: ''
      },
      url: {
        queryById: '/sqgl/hrmSsglSsmjgl/queryById'
      }
    }
  },
  computed: {
    locationList() {
      if (!this.detail.mjdd) return []
      return this.detail.mjdd.split(/[、,]/).map(s => s.trim()).filter(Boolean)
    }
  },
  methods: {
    show(record) {
      this.visible = true
      this.loading = true
      getAction(this.url.queryById, { id: record.id })
        .then(res => {
          if (res.success) {
            this.detail = res.result
          } else {
            this.$message.warning(res.message)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleCancel() {
      this.visible = false
    },
    getRylxText(value) {
      const typeMap = {
        '0': '内部员工',
        '1': '临时工',
        '2': '外部员工'
      }
      return typeMap[value] || value || '—'
    }
  }
}
</script>

<style scoped>
.detail-content {
  padding: 10px 0;
}

.location-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.location-tags .ant-tag {
  margin: 0;
}

/deep/ .ant-descriptions-item-label {
  font-weight: 600;
  color: #64748b;
}

/deep/ .ant-descriptions-item-content {
  color: #1a2a3d;
}
</style>

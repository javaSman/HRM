<template>
  <a-drawer
    :visible="visible"
    placement="right"
    :width="680"
    :closable="false"
    title=""
    :bodyStyle="{ padding: 0 }"
    @close="handleClose"
  >
    <div class="wrapper">
      <!-- 自定义渐变头部 -->
      <div class="drawer-header">
        <span class="header-title">详情</span>
        <a-icon class="header-close" type="close" @click="handleClose" />
      </div>

      <!-- 中间内容（滚动） -->
      <div class="drawer-body">
        <!-- 上报人信息 -->
        <div class="info-section">
          <div class="section-header">
            <span class="header-bar"></span>
            <span class="section-title">上报人信息</span>
          </div>
          <div class="section-content">
            <a-row :gutter="16">
              <a-col :span="12">
                <div class="field-label">上报人姓名</div>
                <a-input :value="form.reporterName" disabled />
              </a-col>
              <a-col :span="12">
                <div class="field-label">上报人部门</div>
                <a-input :value="form.reporterDept" disabled />
              </a-col>
              <a-col :span="12">
                <div class="field-label">上报人电话</div>
                <a-input :value="form.reporterPhone" disabled />
              </a-col>
            </a-row>
          </div>
        </div>

        <!-- 事件信息 -->
        <div class="info-section">
          <div class="section-header">
            <span class="header-bar"></span>
            <span class="section-title">事件信息</span>
          </div>
          <div class="section-content">
            <a-row :gutter="16">
              <!-- <a-col :span="12">
                <div class="field-label">事件标题</div>
                <a-input :value="form.eventTitle" disabled />
              </a-col> -->
              <a-col :span="12">
                <div class="field-label">事件类型</div>
                <a-input :value="form.eventType" disabled />
              </a-col>
              <a-col :span="12">
                <div class="field-label">事件时间</div>
                <a-input :value="form.eventTime" disabled />
              </a-col>
              <!-- <a-col :span="12">
                <div class="field-label">事件地点</div>
                <a-input :value="form.eventLocation" disabled />
              </a-col> -->
              <a-col :span="24">
                <div class="field-label">事件内容</div>
                <a-textarea :value="form.eventContent" :rows="5" disabled class="content-textarea" />
              </a-col>
            </a-row>
          </div>
        </div>

        <!-- 事件图片 -->
        <div class="info-section">
          <div class="section-header">
            <span class="header-bar"></span>
            <span class="section-title">事件图片</span>
          </div>
          <div class="section-content">
            <JUpload v-if="imageList.length" v-model="form.eventImages" disabled fileType="image" />
            <div v-else class="empty-text">暂无图片</div>
          </div>
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<script>
import { getFileAccessHttpUrl } from '@/api/manage'

export default {
  name: 'EventReportModal',
  data() {
    return {
      visible: false,
      form: {},
    }
  },
  computed: {
    imageList() {
      if (!this.form.eventImages) return []
      return String(this.form.eventImages)
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item)
        .map((item) => getFileAccessHttpUrl(item))
    },
  },
  methods: {
    detail(record) {
      this.form = JSON.parse(JSON.stringify(record || {}))
      this.visible = true
    },
    handleClose() {
      this.visible = false
    },
  },
}
</script>

<style scoped lang="less">
.wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* ===== 自定义渐变头部 ===== */
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 16px 20px;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
}

.header-title {
  font-size: 16px;
  color: #ffffff;
}

.header-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.35);
    color: #ffffff;
  }
}

/* ===== 中间内容（滚动） ===== */
.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  background: #f0f2f5;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(45, 120, 255, 0.12);
    border-radius: 2px;
  }
}

.info-section {
  margin-bottom: 16px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(90deg, #f7faff 0%, #ffffff 100%);
}

.header-bar {
  width: 4px;
  height: 16px;
  margin-right: 8px;
  border-radius: 2px;
  background: linear-gradient(180deg, #2d78ff 0%, #00b4d8 100%);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #262626;
}

.section-content {
  padding: 16px;
}

.field-label {
  margin-bottom: 6px;
  font-size: 13px;
  color: #595959;
}

/deep/ .ant-input[disabled],
/deep/ .ant-input-disabled,
/deep/ .content-textarea.ant-input[disabled] {
  color: #262626;
  background-color: #f7f8fa;
  border-color: #eef0f3;
  border-radius: 8px;
  cursor: default;
}

.empty-text {
  padding: 12px 0;
  color: #8c8c8c;
  font-size: 13px;
}

/* 图片横排滚动区域 */
.image-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 6px;

  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background: #c9d2de;

    &:hover {
      background: #a9b6c7;
    }
  }
  &::-webkit-scrollbar-track {
    border-radius: 4px;
    background: #f0f2f5;
  }
}

.image-item {
  flex: 0 0 auto;
  margin-right: 8px;
  border-radius: 8px;
  overflow: hidden;
}

/* 预览组外层撑成单行，避免缩略图换行 */
/deep/ .image-scroll > div {
  display: flex;
  flex-wrap: nowrap;
  width: max-content;
}

/deep/ .image-item .thumb {
  display: block;
  object-fit: cover;
  border-radius: 8px;
}
</style>

<template>
  <!--
    HrPunchRecordDetailModal.vue
    打卡记录详情弹窗
    功能：展示打卡记录详细信息 + 照片预览
  -->
  <j-modal
    title="打卡记录详情"
    :width="720"
    :visible="visible"
    switchFullscreen
    wrapClassName="attendance-rule-modal"
    :bodyStyle="modalBodyStyle"
    :dialogStyle="{ top: '16px' }"
    @cancel="handleCancel"
    :footer="null"
  >
    <a-spin :spinning="confirmLoading">
      <div class="detail-container">
        <!-- 基础信息 -->
        <div class="detail-section">
          <div class="section-title">基础信息</div>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">姓名</span>
              <span class="detail-value">{{ detailData.name || '--' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">工号</span>
              <span class="detail-value">{{ detailData.no || '--' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">公司</span>
              <span class="detail-value">{{ detailData.companyId_dictText || '--' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">部门</span>
              <span class="detail-value">{{ detailData.dept_dictText || '--' }}</span>
            </div>
          </div>
        </div>

        <!-- 打卡信息 -->
        <div class="detail-section">
          <div class="section-title">打卡信息</div>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">打卡时间</span>
              <span class="detail-value">{{ detailData.checkindatetime || '--' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">打卡照片</span>
              <span class="detail-value">
                <JUploadList v-model="detailData.attachmentUrls" :disabled="true"
                                        :buttonVisible="true" />
              </span>
            </div>
            <div class="detail-item full-width" >
              <span class="detail-label">打卡地址</span>
              <span class="detail-value">{{ detailData.location || '--' }}</span>
            </div>
            <div class="detail-item full-width">
              <span class="detail-label">备注</span>
              <span class="detail-value">{{ detailData.remark || '--' }}</span>
            </div>
          </div>
        </div>
      </div>
    </a-spin>

    <!-- 照片预览弹窗 -->
    <a-modal
      title="打卡照片"
      :visible="photoVisible"
      :footer="null"
      @cancel="photoVisible = false"
      :width="520"
      :zIndex="1001"
      wrapClassName="attendance-rule-modal"
    >
      <div class="photo-preview-container">
        <img
          v-if="detailData.photo"
          :src="detailData.photo"
          class="photo-preview-img"
          alt="打卡照片"
        />
        <div v-else class="no-photo-placeholder">
          <a-icon type="camera" class="no-photo-icon" />
          <span>暂无照片</span>
        </div>
      </div>
    </a-modal>
  </j-modal>
</template>

<script>
/**
 * 打卡记录详情弹窗
 * 功能：展示打卡记录详细信息 + 照片预览
 */
export default {
  name: 'HrPunchRecordDetailModal',
  data() {
    return {
      visible: false,
      confirmLoading: false,
      photoVisible: false,
      detailData: {},
      // Modal 内容样式
      modalBodyStyle: {
        maxHeight: 'calc(100vh - 168px)',
        overflowY: 'auto',
        padding: '20px 24px 12px'
      }
    }
  },
  methods: {
    /**
     * 显示详情弹窗
     * @param {Object} record - 当前数据行
     */
    show(record) {
      this.visible = true
      this.detailData = { ...record }
    },

    /**
     * 关闭弹窗
     */
    handleCancel() {
      this.visible = false
      this.detailData = {}
    },

    /**
     * 查看照片
     */
    handleViewPhoto() {
      this.photoVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
/* ==== 详情容器 ==== */
.detail-container {
  padding: 0;
}

/* ==== 分区样式 ==== */
.detail-section {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a2a3d;
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 3px solid #2d78ff;
}

/* ==== 网格布局 ==== */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &.full-width {
    grid-column: ~"1 / -1";
  }
}

.detail-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.detail-value {
  font-size: 13px;
  color: #1a2a3d;
  padding: 10px 14px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  word-break: break-all;
  min-height: 38px;
  display: flex;
  align-items: center;
}

/* ==== 照片按钮 ==== */
.photo-view-btn {
  height: 32px;
  padding: 0 18px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #2d78ff, #00b4d8);
  box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 14px rgba(45, 120, 255, 0.35);
    transform: translateY(-1px);
  }
}

.no-photo {
  color: #94a3b8;
  font-size: 12px;
  font-style: italic;
}

/* ==== 照片预览 ==== */
.photo-preview-container {
  text-align: center;
  padding: 20px;
}

.photo-preview-img {
  max-width: 100%;
  max-height: 60vh;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.no-photo-placeholder {
  padding: 60px 20px;
  color: #94a3b8;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.no-photo-icon {
  font-size: 56px;
  color: #cbd5e1;
}

/* ==== 统一的 Modal 样式 ==== */
::v-deep .attendance-rule-modal .ant-modal-content {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(45, 120, 255, 0.12), 0 0 40px rgba(45, 120, 255, 0.04);
}

::v-deep .attendance-rule-modal .ant-modal-header {
  padding: 16px 24px;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  border-bottom: 0;
}

::v-deep .attendance-rule-modal .ant-modal-title,
::v-deep .attendance-rule-modal .j-modal-title-row .left {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

::v-deep .attendance-rule-modal .ant-modal-close {
  top: 10px;
  right: 14px;
  width: 32px;
  height: 32px;
  color: #fff;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

::v-deep .attendance-rule-modal .ant-modal-close:hover {
  background: rgba(255, 255, 255, 0.35);
}

::v-deep .attendance-rule-modal .ant-modal-close-x {
  width: 32px;
  height: 32px;
  line-height: 32px;
}

::v-deep .attendance-rule-modal .ant-modal-body {
  padding: 20px 24px;
  max-height: calc(85vh - 116px);
  overflow-y: auto;
  background: #f8fafc;
}

::v-deep .attendance-rule-modal .ant-modal-footer {
  padding: 14px 24px;
  border-top: 1px solid #e2e8f0;
  background: #fff;
}

::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn {
  height: 34px;
  padding: 0 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}

::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn-primary {
  border: 0;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2);
}

::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn-primary:hover,
::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn-primary:focus {
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  opacity: 0.92;
}

/* ==== 响应式 ==== */
@media (max-width: 600px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>

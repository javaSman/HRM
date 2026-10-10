<template>
  <div class="sidebar-card">
    <div class="sidebar-card-header">
      <div class="header-icon">
        <a-icon type="file-text" />
      </div>
      <div class="header-text">
        <div class="header-title">个人附件</div>
        <div class="header-subtitle">证件与合同附件</div>
      </div>
    </div>
    <div class="sidebar-card-body">
      <div class="archive-list">
        <div v-for="(item, index) in archiveGroups" :key="index" class="archive-item">
          <div class="archive-item-icon">
            <a-icon theme="twoTone" :two-tone-color="getFileIconCor(item.zsfj)" :type="getFileIconType(item.zsfj)" />
          </div>
          <div class="archive-item-content">
            <div class="archive-item-title">{{ item.fjlx }}</div>
            <div class="archive-item-meta">{{ item.sufffix }}</div>
          </div>
          <div class="archive-item-tools" v-if="item.zsfj">
            <a-icon type="eye" title="预览" @click="previewFile(item.zsfj)" />
            <a-icon type="download" title="下载" @click="downloadFile(item.zsfj)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAction, downloadFile } from '@/api/manage'
export default {
  name: 'EmployeeArchiveSidebar',
  props: {
    employeeId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      archiveGroups: [],
    }
  },
  methods: {
    previewFile(url) {
      this.$store.dispatch('openPdf', url)
    },
    downloadFile(url) {
      const fileName = url.split('/').pop()
      downloadFile(url, fileName)
    },
    loadEmployeeArchive(employeeId) {
      if (!employeeId) {
        return
      }
      getAction('/yginfo/hrmYgzzzs/list', {
        ghId: employeeId,
      }).then((res) => {
        if (res.code === 200) {
          this.archiveGroups = res.result.records.map((t) => {
            return {
              ...t,
              type: this.getFileCategory(t.zsfj),
              sufffix: t.zsfj ? t.zsfj.split('.').pop().toUpperCase() : '',
            }
          })
          .filter(item=>item.zsfj)
        }
      })
    },
    /**
     * 根据文件名或 URL 判断文件类型
     * @param {string} fileNameOrUrl
     * @returns {'image' | 'pdf' | 'doc' | 'other'}
     */
    getFileCategory(fileNameOrUrl) {
      if (!fileNameOrUrl) {
        return ''
      }
      const name = fileNameOrUrl.toLowerCase()

      // 图片
      const imageExts = new Set(['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.tiff'])

      // Word 文档
      const docExts = new Set(['.doc', '.docx', '.dot', '.dotx', '.rtf', '.wps'])

      // 取后缀名
      const ext = name.substring(name.lastIndexOf('.'))

      if (imageExts.has(ext)) return 'img'
      if (ext === '.pdf') return 'pdf'
      if (docExts.has(ext)) return 'doc'

      return 'other'
    },
    getFileIconType(fileName) {
      if (!fileName) return 'file'
      const ext = fileName.split('.').pop().toLowerCase()
      const iconMap = {
        pdf: 'file-pdf',
        doc: 'file-word',
        docx: 'file-word',
        xls: 'file-excel',
        xlsx: 'file-excel',
        ppt: 'file-ppt',
        pptx: 'file-ppt',
        jpg: 'file-image',
        jpeg: 'file-image',
        png: 'file-image',
        gif: 'file-image',
        zip: 'file-zip',
        rar: 'file-zip',
        txt: 'file-text',
      }
      return iconMap[ext] || 'file'
    },
    getFileIconCor(fileName) {
      if (!fileName) return '#999'
      const ext = fileName.split('.').pop().toLowerCase()
      const colorMap = {
        pdf: '#ff4d4f',
        doc: '#007bff',
        docx: '#007bff',
        xls: '#52c41a',
        xlsx: '#52c41a',
        ppt: '#faad14',
        pptx: '#faad14',
        jpg: '#007bff',
        jpeg: '#007bff',
        png: '#007bff',
        gif: '#007bff',
        zip: '#5200d1',
        rar: '#5200d1',
        txt: '#999',
      }
      return colorMap[ext] || '#999'
    },
  },
  watch: {
    employeeId: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.loadEmployeeArchive(newVal)
        }
      },
      immediate: true,
    },
  },
}
</script>
<style lang="less" scoped>
.archive-item {
  .archive-item-content {
    flex: 1;
  }
  .archive-item-tools {
    display: flex;
    gap: 10px;
    justify-content: flex-end;

    .anticon {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      color: #758397;
      border-radius: 6px;
      border: 1px solid #e5eaf1;
      transition: all 0.3s ease-in-out;
      &:hover {
        color: #363c45;
        border-color: #c3c8cc;
      }
    }
  }
}
</style>

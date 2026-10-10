<template>
  <div>
    <a-drawer
      title="文件预览"
      placement="left"
      width="50%"
      :zIndex="99999"
      :closable="false"
      :visible="visible"
      @close="handleCancel"
    >
      <div>
        <div class="tools">
          <!-- <a-button @click="prePage"> 上一页</a-button>
          <span class="page">{{ pageNum }}/{{ pageTotalNum }} </span>
          <a-button @click="nextPage"> 下一页</a-button> -->

          <a-button @click="preFile">上一个文件</a-button>
          <span class="page">{{ pdfNum }}/{{ pdfTotalNum }} </span>
          <a-button @click="nextFile">下一个文件</a-button>

          <a-button @click="handleCancel"> 取消</a-button>
          <a-button @click="downPDF"> 下载</a-button>
        </div>
        <!-- <a-spin :spinning="previewLoading"> -->
        <iframe
          v-if="fileUrl"
          :key="iframeKey"
          :src="fileUrl"
          frameborder="0"
          width="100%"
          :height="previewHeight"
          scrolling="auto"
          style="background-color: #fff"
          @load="handlePreviewLoaded"
        >
        </iframe>
        <div v-else class="preview-placeholder" :style="{ height: previewHeight + 'px' }"></div>
        <!-- </a-spin> -->
      </div>
    </a-drawer>
  </div>
</template>

<script>
// import pdf from 'vue-pdf';
import { Base64 } from 'js-base64'

export default {
  name: 'PdfPreview',
  watch: {
    urlArr: {
      immediate: true,
      handler(val) {
        console.log(val)
        this.urls = val || []
        this.pageNum = 1
        this.pdfNum = 1
        this.pdfTotalNum = this.urls.length
        if (this.urls.length > 0) {
          this.showPdfByNum(0)
        } else {
          this.url = ''
          this.fileUrl = ''
          this.previewLoading = false
          this.iframeKey += 1
        }
      },
    },
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    urlArr: {
      type: Array,
      default() {
        return []
      },
      required: true,
    },
  },
  data() {
    return {
      urls: [],
      url: '', // pdf地址 就是后端返回的真正需要预览的pdf地址
      src: '', // 预览地址
      pageNum: 1, // 当前页码
      pageTotalNum: 1, // 总页数
      pdfNum: 1, // 第几个pdf文件
      pdfTotalNum: 1, // 总共有几个pdf文件
      fileUrl: '',
      previewLoading: false,
      iframeKey: 0,
      clientHeight: '',
    }
  },
  computed: {
    previewHeight() {
      let height = Number(this.clientHeight) - 110 - 40
      return height > 0 ? height : 400
    },
  },
  mounted() {
    // 有时PDF文件地址会出现跨域的情况,这里最好处理一下
    // 获取浏览器可视区域高度
    this.clientHeight = `${document.documentElement.clientHeight}` // document.body.clientWidth;
    // console.log(self.clientHeight);
    window.onresize = function temp() {
      this.clientHeight = `${document.documentElement.clientHeight}`
    }
  },
  methods: {
    handlePreviewLoaded() {
      this.previewLoading = false
    },
    //显示那一张
    showPdfByNum(index) {
      if (index >= 0 && index < this.urls.length) {
        this.url = this.urls[index]
        let url = this.url
        let fileUrl = `${window._CONFIG['fileViewUrl']}onlinePreview?url=` + encodeURIComponent(Base64.encode(url))
        // this.src = pdf.createLoadingTask(url);
        this.previewLoading = true
        this.fileUrl = ''
        this.iframeKey += 1
        this.$nextTick(() => {
          this.fileUrl = fileUrl
          this.iframeKey += 1
        })
        // window.console.log( this.fileUrl,'试试看')
      }
    },
    // 上一页函数，
    prePage() {
      let page = this.pageNum
      page = page > 1 ? page - 1 : this.pageTotalNum
      this.pageNum = page
    },
    // 上一个文件
    preFile() {
      let num = this.pdfNum
      num = num > 1 ? num - 1 : this.pdfTotalNum
      this.pdfNum = num
      this.showPdfByNum(num - 1)
    },
    // 下一页函数
    nextPage() {
      let page = this.pageNum
      page = page < this.pageTotalNum ? page + 1 : 1
      this.pageNum = page
    },
    //下一页文件
    nextFile() {
      let num = this.pdfNum
      num = num < this.pdfTotalNum ? num + 1 : 1
      this.pdfNum = num
      this.showPdfByNum(num - 1)
    },
    // 页面加载回调函数，其中e为当前页数
    pageLoaded(e) {
      this.curPageNum = e
    },
    // 抛出错误的回调函数。
    pdfError(error) {
      console.error(error)
    },
    downPDF() {
      window.open(this.url)
    },
    handleCancel() {
      this.$emit('close')
    },
  },
}
</script>

<style scoped>
/* /deep/ .ant-drawer{
  z-index: 9999999999;
} */
.preview-placeholder {
  background-color: #fff;
}
.tools {
  display: flex;
  gap: 10px;
  align-items: center;
  line-height: 40px;
}
</style>

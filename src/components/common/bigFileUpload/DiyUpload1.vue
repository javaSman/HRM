<template>
  <div class="container">
<!--    <div class="logo"><img src="@/assets/logo.png" /></div>-->
    <uploader
      ref="uploader"
      :options="options"
      :autoStart="false"
      :file-status-text="fileStatusText"
      @file-added="onFileAdded"
      @file-success="onFileSuccess"
      @file-error="onFileError"
      @file-progress="onFileProgress"
      @file-retry="onFileRetry"
      class="uploader-example">

      <uploader-unsupport></uploader-unsupport>
      <uploader-btn>选择文件</uploader-btn>
<!--      <uploader-drop>-->
<!--        <p>拖动文件到这里上传</p>-->
<!--        <uploader-btn>选择文件</uploader-btn>-->
<!--        &lt;!&ndash; <uploader-btn :directory="true">选择文件夹</uploader-btn> &ndash;&gt;-->
<!--      </uploader-drop>-->
      <!-- uploader-list可自定义样式 -->
      <!-- <uploader-list></uploader-list> -->
      <uploader-list v-show="uploadFileList.length>0">
        <div class="file-panel" :class="{ collapse: collapse }">
          <div class="file-title">
            <p class="file-list-title">文件列表</p>
            <div class="operate">
              <a-button type="link"  @click="operate" :title="collapse ? '折叠' : '展开'"  >
                <a-icon :type="collapse ? 'caret-down' : 'caret-up'" />
              </a-button>
              <a-button type="link" @click="close" title="关闭">
                <a-icon type="close" />
              </a-button>
            </div>
          </div>

          <ul class="file-list" :class=" collapse ? 'uploader-list-ul-show' : 'uploader-list-ul-hidden' " >
            <li v-for="file in uploadFileList" :key="file.id">
              <!-- <uploader-file
                :class="'file_' + file.id"
                ref="files"
                :file="file"
                :list="true"
              ></uploader-file> -->

              <uploader-file :file="file" :list="true" ref="uploaderFile">
                <template slot-scope="props">
                  <div class="filebox">
                    <p class="fileNameBox">
                      <span class="fileIcon"></span>
                      {{ file.name }}
                    </p>
                    <p class="fileProgressBox">
                      <!-- 进度条-->
                      <a-progress v-if="!error.show" class="progressLength" size="small" :percent="getPercent(props)" ></a-progress>
                      <a-progress v-else class="progressLength" size="small" :percent="error.percent" ></a-progress>
                      <!-- 暂停与继续-->
                      <span class="statusBtn progressBtn" v-if="!file.completed" @click="pause(file)" >
                        <a-icon style="font-size: 18px;" type="pause-circle" v-if="!file.paused" title="暂停" />
                        <a-icon style="font-size: 18px;" title="继续" v-else type="play-circle" />
                      </span>
                      <!-- 下载-->
                      <span v-else class="downloadBtn progressBtn" @click="download(file)" >
                        <a-icon style="font-size: 18px" type="download"  title="下载"/>
                      </span>
                      <!--删除图标-->
                      <span class="cancelBtn progressBtn" @click="remove(file)" >
                        <a-icon style="font-size: 18px" type="delete" />
                      </span>
                    </p>

                    <p class="fileInfoBox" v-if="!file.completed">
                      <span class="fileInfoItem" >速度：{{ props.formatedAverageSpeed }}</span>
                      <span class="fileInfoItem" >
                        已上传：{{ ( parseFloat(props.formatedSize) * error.percent ).toFixed(1)}}/{{ props.formatedSize }}
                      </span>
                      <span class="fileInfoItem" >剩余时间：{{ props.formatedTimeRemaining }}</span >
                    </p>

<!--                    <p class="fileInfoBoxSuccess" v-else>上传成功</p>-->
                  </div>
                </template>
              </uploader-file>
            </li>
            <div class="no-file" v-if="!uploadFileList.length">
              <i class="icon icon-empty-file"></i> 暂无待上传文件
            </div>
          </ul>
        </div>
      </uploader-list>
    </uploader>
  </div>
</template>

<script>
import uploader from 'vue-simple-uploader'
import SparkMD5 from "spark-md5";
import Vue from "vue";
import {ACCESS_TOKEN} from "@/store/mutation-types";
const FILE_UPLOAD_ID_KEY = "file_upload_id";
import { postAction } from '@/api/manage'
// 分片大小，20MB
const CHUNK_SIZE = 20 * 1024 * 1024;
export default {
  data() {
    return {
      mergeChunkUrl:"/chunk/uploadMergeChunk",
      uploaderPanelShow:false,

      error:{
        percent:0,
        show:false,
      },
      options: {
        // 上传地址
        target: `${window._CONFIG['domianURL']}/chunk/upload`,
        // 是否开启服务器分片校验。默认为 true
        testChunks: true,
        // 真正上传的时候使用的 HTTP 方法,默认 POST
        uploadMethod: "post",
        // 分片大小
        chunkSize: CHUNK_SIZE,
        // 并发上传数，默认为 3
        simultaneousUploads: 6,
        // 认为是出错的响应码
        permanentErrors: [404, 415, 500, 501],
        // 最大自动失败重试上传次数，值可以是任意正整数，如果是 undefined 则代表无限次
        maxChunkRetries: 1,
        // 重试间隔，值可以是任意正整数，如果是 null 则代表立即重试
        chunkRetryInterval: 2,

        headers: {
          'X-Access-Token': Vue.ls.get(ACCESS_TOKEN)
        },
        /**
         * 判断分片是否上传，秒传和断点续传基于此方法
         * 这里根据实际业务来 用来判断哪些片已经上传过了 不用再重复上传了 [这里可以用来写断点续传！！！]
         */
        checkChunkUploadedByResponse: (chunk, message) => {
          // message是后台返回
          let messageObj = JSON.parse(message);
          console.log(messageObj)
          let dataObj = messageObj.result;
          // 如果是true 服务器上传过此文件直接返回上传成功
          if (dataObj.uploaded==true) {
            return true;
          }
          // 判断文件或分片是否已上传，已上传返回 true
          // 这里的 uploadedChunks 是后台返回]
          return (dataObj.uploadedChunks || []).indexOf(chunk.offset + 1) >= 0;
        },
        parseTimeRemaining: function (timeRemaining, parsedTimeRemaining) {
          //格式化时间
          return parsedTimeRemaining
            .replace(/\syears?/, "年")
            .replace(/\days?/, "天")
            .replace(/\shours?/, "小时")
            .replace(/\sminutes?/, "分钟")
            .replace(/\sseconds?/, "秒");
        },
      },
      // 修改上传状态
      fileStatusTextObj: {
        success: "上传成功",
        error: "上传错误",
        uploading: "正在上传",
        paused: "停止上传",
        waiting: "等待中",
      },
      uploadIdInfo: null,
      // 文件列表可以通过这个回显数据库路径 uploadFileList ->item.filePath
      uploadFileList: [],
      fileChunkList: [],
      collapse: true,
    };
  },
  created() {

  },
  methods: {
    onFileAdded(file, event) {
      this.uploadFileList.push(file);
      console.log("file :>> ", file);
      // 有时 fileType为空，需截取字符
      console.log("文件类型：" + file.fileType);
      // 文件大小
      console.log("文件大小：" + file.size + "B");
      // 1. todo 判断文件类型是否允许上传
      // 2. 计算文件 MD5 并请求后台判断是否已上传，是则取消上传
      console.log("校验MD5");
      this.getFileMD5(file, (md5) => {
        if (md5 != "") {
          // 修改文件唯一标识
          file.uniqueIdentifier = md5;
          // 请求后台判断是否上传
          // 恢复上传
          file.resume();
        }
      });
    },
    onFileSuccess(rootFile, file, response, chunk) {
      let data = JSON.parse(response);
      if (data.result){
        console.log(data.result)
        // 合并文件
        postAction(this.mergeChunkUrl,data.result).then((res)=>{
          // 只有当文件合并完成后 才可以显示进度条100%，分块上传完毕显示99%
          console.log(res.result.filePath);//当前文件上传完毕后的路劲
          console.log("上传成功");
          file["filePath"]=res.result.filePath;
          console.log(file);
          console.log(this.uploadFileList);
        })
      }
    },
    onFileError(rootFile, file, message, chunk) {
      console.log("上传出错：" + message);
      this.error.show=true;
      file.pause();
    },
    onFileProgress(rootFile, file, chunk) {
      console.log(`当前进度：${Math.ceil(file._prevProgress * 100)}%`);
    },
    onFileRetry(rootFile, file, chunk){
      console.log(`文件: ${file.name} 重试上传`);
    },

    // 计算文件的MD5值
    getFileMD5(file, callback) {
      let spark = new SparkMD5.ArrayBuffer();
      let fileReader = new FileReader();
      //获取文件分片对象（注意它的兼容性，在不同浏览器的写法不同）
      let blobSlice =
        File.prototype.slice ||
        File.prototype.mozSlice ||
        File.prototype.webkitSlice;
      // 当前分片下标
      let currentChunk = 0;
      // 分片总数(向下取整)
      let chunks = Math.ceil(file.size / CHUNK_SIZE);
      // MD5加密开始时间
      let startTime = new Date().getTime();
      // 暂停上传
      file.pause();
      loadNext();
      // fileReader.readAsArrayBuffer操作会触发onload事件
      fileReader.onload = function (e) {
        // console.log("currentChunk :>> ", currentChunk);
        spark.append(e.target.result);
        if (currentChunk < chunks) {
          currentChunk++;
          loadNext();
        } else {
          // 该文件的md5值
          let md5 = spark.end();
          console.log(
            `MD5计算完毕：${md5}，耗时：${new Date().getTime() - startTime} ms.`
          );
          // 回调传值md5
          callback(md5);
        }
      };
      fileReader.onerror = function () {
        this.$message.error("文件读取错误");
        file.cancel();
      };
      // 加载下一个分片
      function loadNext() {
        const start = currentChunk * CHUNK_SIZE;
        const end =
          start + CHUNK_SIZE >= file.size ? file.size : start + CHUNK_SIZE;
        // 文件分片操作，读取下一分片(fileReader.readAsArrayBuffer操作会触发onload事件)
        fileReader.readAsArrayBuffer(blobSlice.call(file.file, start, end));
      }
    },
    fileStatusText(status, response) {
      if (status === "md5") {
        return "校验MD5";
      } else {
        return this.fileStatusTextObj[status];
      }
    },
    /**
     * 折叠、展开面板动态切换
     */
    operate() {
      if (this.collapse === false) {
        this.collapse = true;
      } else {
        this.collapse = false;
      }
    },

    /**
     * 关闭折叠面板
     */
    close() {
      this.uploaderPanelShow = false;
    },

    // 点击暂停
    pause(file, id) {
      console.log("file :>> ", file);
      if (file.paused) {
        file.resume();
      } else {
        file.pause();
      }
    },
    // 点击删除

    remove(file) {
      this.uploadFileList.findIndex((item, index) => {
        if (item.id === file.id) {
          this.$nextTick(() => {
            this.uploadFileList.splice(index, 1);
          });
          return;
        }
      });
    },

    // 点击下载
    download(file, id) {
      console.log("file:>> ", file);
      console.log("下载文件");
      window.location.href = `${window._CONFIG['staticDomainURL']}/${file.filePath}`;
    },
    getPercent(props){
      if (props && props.progress){
        let percent = parseInt( props.progress.toFixed(2) * 100 - 1 < 0 ? 0 : props.progress.toFixed(2) * 100 )
        this.error.percent = percent;
        return percent;
      }
      return this.error.percent;
    }

  },
};
</script>

<style lang="less" scoped>
.uploader-example {
  width: 800px;
  padding: 15px;
  font-size: 12px;
}
.uploader-example .uploader-btn {
  margin-right: 4px;
}
.uploader-example .uploader-list {
  max-height: 440px;
  overflow: auto;
  overflow-x: hidden;
  overflow-y: auto;
}

#global-uploader {
  position: fixed;
  z-index: 20;
  right: 15px;
  bottom: 15px;
  width: 550px;
}

.file-panel {
  background-color: #fff;
  border: 1px solid #e2e2e2;
  border-radius: 7px 7px 0 0;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.file-title {
  display: flex;
  padding: 0 15px;
  border-bottom: 1px solid #ddd;
}

.file-title {
  background-color: #e7ecf2;
}
.uploader-file {
  height: 90px;
}

.uploader-file-meta {
  display: none !important;
}

.operate {
  flex: 1;
  text-align: right;
}

.file-list {
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: #fff;
  padding: 0px;
  margin: 0 auto;
  transition: all 0.5s;
}

.uploader-file-size {
  width: 15% !important;
}

.uploader-file-status {
  width: 32.5% !important;
  text-align: center !important;
}

li {
  background-color: #fff;
  list-style-type: none;
}

.no-file {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 16px;
}

.file-list-title {
  /*line-height: 10px;*/
  font-size: 16px;
}

.uploader-file-name {
  width: 36% !important;
}

.uploader-file-actions {
  float: right !important;
}

.uploader-list-ul-hidden {
  height: 0px;
}

.filebox {
  width: 100%;
  height: 60px;
}
.fileNameBox {
  width: 85%;
  margin: 0;
  padding: 0;
  font-size: 12px;
  margin-top: 5px;
  height: 30px;
  line-height: 30px;
  text-align: center;
}
.fileProgressBox {
  margin: 0;
  padding: 0;
  height: 20px;
  line-height: 20px;
  margin-top: 5px;
  margin-left: 10px;
  width: 100%;
}

.progressLength {
  display: inline-block;
  line-height: 20px;
  width: 80%;
}
.progressBtn {
  margin-top: -5px;
  position: absolute;
  display: inline-block;
  font-size: 36px;
  margin-left: 10px;
  cursor: pointer;
}
.statusBtn {
  right: 90px;
  color: #ffba00;
}
.statusBtn:hover {
  color: #ffc833;
}
.cancelBtn {
  right: 30px;
  color: #ff4949;
}
.cancelBtn {
  margin-left: 10px;
}
.cancelBtn:hover {
  color: #ff6d6d;
}
.downloadBtn {
  right: 90px;
  color: #67c23a;
}
.downloadBtn:hover {
  color: #85ce61;
}
.fileInfoBox {
  margin: 0;
  padding: 0;
  font-size: 12px;
  width: 100%;
  height: 30px;
  line-height: 30px;
  margin-left: 10px;
  margin-bottom: 5px;

  .fileInfoItem {
    display: inline-block;
    width: 33%;
  }
}
.fileInfoBoxSuccess {
  margin: 0;
  padding: 0;
  font-size: 12px;
  width: 85%;
  height: 30px;
  line-height: 30px;
  margin-bottom: 5px;
  text-align: center;
}
</style>
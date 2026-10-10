<template>
  <div class="file-wraps">
    上传shp
    <input ref="file" type="file" accept="application/zip" @change="handleSelect">
    <a-icon v-if="flag == 1" type="check-circle"/>
    <a-icon v-else-if=" flag == -1" type="close-circle"/>
  </div>

</template>

<script>
import { open as shapeOpen, read as shapeRead } from 'shapefile'
import JsZip from 'jszip'

export default {
  name: "ShpUpload",
  components: {

  },
  /**
   * one 一个shp压缩文件
   * many  一个包含多个shp压缩文件的压缩文件
   */
  props: {
    type: {
      type: String,
      default: 'one'
    },
  },
  watch: {

  },
  data() {
    return {
      flag:0
    }
  },


  methods:{
    // 选择文件后确认
    handleSelect() {
      let files = this.$refs.file.files;
      if (files.length<=0){
        this.$message.error("请选择zip格式的shp文件");
        return
      }
      let file = files[0];
      let suffixName = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
      if (suffixName !== 'zip'){
        this.$message.error("请选择zip格式的shp文件");
        this.flag=-1;
        return;
      }

      if (this.type!=="many"){
        //解析zip格式的shp文件
        this.analysisShpZip(file).then(res=>{
          // this.$message.success("解析成功");
          this.flag=1;
          this.$emit("myChange", res);
        }).catch(e=>{
          this.flag=-1;
        })
      }else {
        //一个包含多个shp压缩文件的压缩文件
        this.openZip(file).then(fileArr=>{
          let shpZipPromiseAll = [];
          for (let i = 0; i < fileArr.length; i++) {
            shpZipPromiseAll.push(this.analysisShpZip(fileArr[i]));
          }
          Promise.all(shpZipPromiseAll).then(arrRes=>{
            this.flag=1;
            this.$emit("myChange", arrRes);
          }).catch(e=>{
            this.flag=-1;
          })
        });
      }

    },

    /**
     * 解析zip格式的shp文件
     * @param file
     */
    analysisShpZip(file){
      let that = this;
      return new Promise((resolve, reject) => {
        this.openZip(file).then(fileArr=>{
          this.parseShapefile(fileArr).then(res=>{
            if (res){
              res['fileName']= file.name;
            }
            resolve(res);
          }).catch(e=>{
            reject();
            this.$message.error("无法解析！！！,请选择zip格式的shp文件");
          });
        });
      });

    },

    /**
     * 解压zip 文件
     * @param file
     */
    openZip(file){
      let newZip = new JsZip();
      return new Promise((resolve, reject) => {
        newZip.loadAsync(file).then(res=>{
          // console.log("解压的文件列表",res.files)
          let zipFileArr =  Object.values(res.files);
          let promiseArr=[];
          for (let zipFile of zipFileArr) {
            let promise = zipFile.async('blob');
            promiseArr.push(promise);
          }
          // 存放file 文件对象
          let fileArr= [];
          Promise.all(promiseArr).then(blobArr=>{
            for (let i = 0; i < blobArr.length; i++) {
              let blob = blobArr[i];
              let name = zipFileArr[i].name;
              let file = new window.File(
                [blob],
                name,
                { type: blob.type }
              );
              fileArr.push(file);
            }
            // 解压后的文件,fileArr;
            resolve(fileArr);
          })

        }).catch(err=>{
          console.log("解压文件失败：",err);
          reject(err);
        })
      })
    },


    /**
     * 传递files 数组包含.shp 和.dbf 文件数组 解析shp文件数据
     * @param files
     */
    parseShapefile(files,encoding='UTF-8') {
      let that = this;
      return new Promise((resolve, reject) => {
        // 找出文件中的.shp和.dbf 文件
        const shpFile = files.find(f => f.name.endsWith('.shp'));
        const dbfFile = files.find(f => f.name.endsWith('.dbf'));
        if (!shpFile || !dbfFile){
          reject();
          return
        }

        const promises = [shpFile, dbfFile].map(i => this.readInputFile(i))
        Promise.all(promises).then(([shp, dbf]) => {
          return shapeRead(shp, dbf, { encoding:encoding })
        }).then(async(source) => {
          // 如果发现字符包含�  则转成GBK编码 再分析一遍
          let  sourceStr = JSON.stringify(source);
          if (sourceStr.includes("�")){
            that.parseShapefile(files,"GBK").then(res=>{
              resolve(res)
            }).catch(e=>{
              reject();
            });
            return;
          }
          // 没有字体乱码就解析完成
          resolve(source);
        }).catch(error =>{
          console.error(error.stack);
          reject(error);
        })
      });
    },

    // 读取文件
    async readInputFile(file, type = 'ArrayBuffer') {
      // 读取文件
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        switch (type) {
          case 'ArrayBuffer':
            reader.readAsArrayBuffer(file)
            break
          case 'Text':
            reader.readAsText(file)
            break
          case 'BinaryString':
            reader.readAsBinaryString(file)
            break
          case 'DataURL':
            reader.readAsDataURL(file)
            break
        }
        reader.onload = function() {
          // this.result 就是读取到的文件的数据
          resolve(this.result)
        }
        reader.onerror = function() {
          reject(this)
        }
      })


    }
  }
}
</script>

<style scoped>
.file-wraps{
  background: #1890FF;
  width: 100px;
  height: 32px;
  position: relative;
  color: white;
  text-align: center;
  line-height: 32px;
}
.file-wraps input{
  position: absolute;
  top: 0;
  bottom: 0;
  bottom: 0;
  right: 0;
  opacity: 0;
}



</style>
<template>
  <div>
    <a-drawer
      title="数据日志"
      placement="right"
      :closable="true"
      :visible="visible"
      width="40%"
      :after-visible-change="afterVisibleChange"
      @close="onClose"
    >
      <a-list item-layout="horizontal" :data-source="dataArr">
        <a-list-item slot="renderItem" slot-scope="item, index">
          <a-list-item-meta>
            <div slot="description">
              <div class="journal_box">
                <div></div>
                <h3 style="background: #55aaff">原信息内容</h3>
                <h3 style="background: #00aa7f">更新后内容</h3>
              </div>
              <div class="journal_boxs" v-for="(itemValue, key, inde) in item.changeData" :key="inde">
                <div style="width: 30%; border-right: 1px solid #8d8d8d">{{ key }}</div>
                <div >
                  {{ itemValue.yValue }}
                  <a-icon type="arrow-right" />
                </div>
                <div>  {{ itemValue.cValue }}</div>
              </div>
            </div>

            <h3 slot="title">
              <p><b style="color: #55aaff">修正人: </b>{{ item.createBy }}</p>
              <p><b style="color: #55aaff">&nbsp;&nbsp; 时 间: </b>{{ item.createTime.substring(0, 10) }}</p>
            </h3>
          </a-list-item-meta>


        </a-list-item>
      </a-list>

    </a-drawer>
  </div>
</template>

<script>
import { getDictObjByCode, screenDataChangLog } from '@comp/common/log/LogUtil'

export default {
  name: "ZtDataLogDrawer",

  data() {
    return {
      tableName:"",
      id:"",
      visible:false,
      columns:[],
      dict:{},
      dataArr:[]
    }
  },
  methods: {
    afterVisibleChange(val) {
    },
    /**
     {
         tableName:"jeecg_demo",   // 表名
         id:"4028ef81550c1a7901550c1cd6e70001",// 这条数据的id
         columns:[         // columns 需要显示的字段以及翻译
            {title:"用户名",dataIndex:'userName',dictCode:''},
            {title:"mobile电话",dataIndex:'mobilePhone'},
            {title:"office电话",dataIndex:'officePhone'},
         ],
     }
     * @param options
     */
    showDrawer(options) {
      this.tableName = options.tableName || ''
      this.id = options.id || ''
      this.columns = options.columns || [];



      this.loadData();
      this.visible = true;
    },
    onClose() {
      this.visible = false;
    },

    loadData(){

      let columns = this.columns;
      // TODO 待完善组装字典格式 查询字典并返回翻译的数据
      let filedDictCodeList = {};
      let tempArr = columns.filter(item => item.dictCode && item.dictCode!=='');
      for (let item of tempArr) {
        let dictCode = item.dictCode;
        let obj = {
          "dictCode":dictCode,
          "dictText":{}
        }
        getDictObjByCode(dictCode).then(dictObj=>{
          obj.dictText = dictObj;
        })

      }
      this.dict=filedDictCodeList;



      // 加载数据
      screenDataChangLog(this.tableName,this.id).then(res=>{
        for (const item of res) {
          let dataMap = item.changeData;
          let changeData ={};
          for (let index in columns) {
            let column = columns[index];
            let key = column['dataIndex'];
            let title = column['title'];
            let value = dataMap[key];
            if (value){
              changeData[title] = value;
            }
          }
          console.log("===>",changeData)
          item.changeData = changeData;
        }

        this.dataArr = res;
      })
    }
  }
}
</script>

<style scoped>
.journal_box,
.journal_boxs {
  display: flex;
  width: 90%;
  margin: auto;
  border: 1px solid #8d8d8d;
  line-height: 40px;
  text-align: center;
}

.journal_boxsjournal_boxs {
  min-height: 40px !important;
  height: auto;
  align-items: center;
  line-height: 20px !important;
}

.journal_box * {
  margin: 0;
}

.journal_box > div {
  width: 30%;
}

.journal_boxs > div {
  width: 35%;
  color: #464646;
  position: relative;
  padding: 10px;
}

.journal_boxs > div > i {
  font-size: 15px;
  color: #ff6a71;
  position: absolute;
  right: -5%;
  line-height: 45px;
}

.journal_box > h3 {
  width: 35%;
  background: #8d8d8d;
}
</style>
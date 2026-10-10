<template>
    <div>
      <el-dialog
        title="部门选择"
        :visible.sync="dialogVisible"
        :append-to-body="true"
        width="30%"
      >
        <el-input
          v-model="filterText"
          placeholder="输入关键字进行过滤"
        />
  
        <!-- 单选 -->
        <template v-if="!multi">
          <el-tree
            ref="tree"
            class="filter-tree"
            show-checkbox
            :data="deptData"
            node-key="id"
            :props="defaultProps"
            :filter-node-method="filterNode"
            :check-strictly="true"
            @check-change="handleCheckChange"
          />
        </template>
        <!-- 多选 -->
        <template v-if="multi">
          <el-tree
            ref="tree"
            class="filter-tree"
            show-checkbox
            :data="deptData"
            node-key="id"
            :props="defaultProps"
            :filter-node-method="filterNode"
            @check="handleCheckChangeMulti"
          />
        </template>
  
        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button
            type="primary"
            @click="onConfirm"
          >确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </template>
  
  <script>
  import { getAction } from '@/api/manage'
  export default {
    props: {
      multi: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        dialogVisible: false,
        filterText: '',
        defaultProps: {
          children: 'children',
          label: 'title',
        },
  
        urlList: {
          dept: '/sys/sysDepart/queryTreeList',
        },
        url: { list: '/sys/sysDepart/queryTreeList' },
  
        selectData: {},
        deptData: [],
      }
    },
    watch: {
      filterText(val) {
        this.$refs.tree.filter(val)
      },
      dialogVisible: {
        handler(newV) {
          if (newV) this.getDeptData()
        },
      },
    },
    methods: {
      // 部门数据
      async getDeptData() {
        getAction(this.url.list).then(res => {
            console.log("getDeptData res",res);
            this.deptData=res.result
            // this.ipagination.total=res.result.total
          }).catch(e=>{
            this.$emit(e);
          })
        // this.deptData = this.deptData_1;
      },
      filterNode(value, data) {
        if (!value) return true
        return data.title.indexOf(value) !== -1
      },
      handleCheckChange(data, checked, indeterminate) {
        let selectArray = this.$refs.tree.getCheckedKeys();
        if (checked) {
          this.selectData = [data]
          this.$refs.tree.setCheckedKeys([data.id])
        }
        if(!selectArray.length){
          this.selectData = []
        }
        console.log('selectData-1:', this.selectData)
      },
      handleCheckChangeMulti(nodeObj, SelectedObj) {
        console.log('SelectedObj-2:', SelectedObj)
        this.selectData = SelectedObj.checkedNodes
      },
      onConfirm() {
        this.dialogVisible = false
        const arr1 = this.selectData.map((item) => item.title)
        const arr2 = this.selectData.map((item) => item.id)
        const obj = {
          names: arr1.length ? arr1.join(',') : '',
          ids: arr2.length ? arr2.join(',') : '',
        }
        console.log('obj:', obj)
        this.$emit('onSelect', obj)
      },
    },
  }
  </script>
  
  <style lang="scss" scoped>
  ::v-deep .el-dialog__body {
    padding: 10px 20px;
  }
  </style>
  
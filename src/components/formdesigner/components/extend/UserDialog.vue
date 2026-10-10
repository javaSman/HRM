<template>
    <div>
      <el-dialog
        title="用户选择"
        :visible.sync="dialogVisible"
        :append-to-body="true"
        width="60%"
      >
        <el-input
          v-model="queryParam.userDepartName"
          placeholder="请输入用户昵称/部门称并按下回车键搜索"
          prefix-icon="el-icon-search"
          @keyup.enter.native="getUserData(1)"
        />
        <el-table
          ref="multipleTable"
          :data="userData"
          tooltip-effect="dark"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="username" label="账号" />
          <el-table-column prop="realname" label="昵称" />
          <el-table-column prop="orgCodeTxt" label="部门" />
        </el-table>
  
        <div style="margin: 20px 0; display: flex; justify-content: flex-end">
          <el-pagination
            background
            @size-change="
              (val) => {
                ipagination.pageSize = val
              }
            "
            @current-change="
              (val) => {
                ipagination.current = val
                getUserData()
              }
            "
            :current-page="ipagination.current"
            :page-sizes="ipagination.pageSizeOptions"
            :page-size="ipagination.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="ipagination.total"
          >
          </el-pagination>
        </div>
  
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="onConfirm">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </template>
  
  <script>
  import { postAction, getAction } from '@/api/manage'
  import { param } from '../../../../utils'
  export default {
    props: {
      multi: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        disableMixinCreated: true,
        dialogVisible: false,
        searchVal: '',
        userData: [],
        selectData: [],
        urlList: {
          user: '/activiti/System/UserDeptPage',
        },
        url: { list: '/sys/user/list' },
  
        queryParam: {},
        /* 分页参数 */
        ipagination:{
          current: 1,
          pageSize: 10,
          pageSizeOptions: ['10', '20', '30', '50', '100'],
          showTotal: (total, range) => {
            return range[0] + "-" + range[1] + " 共" + total + "条"
          },
          showQuickJumper: true,
          showSizeChanger: true,
          total: 0
        },
      }
    },
    watch: {
      dialogVisible: {
        handler(newV) {
          if (newV) this.getUserData()
        },
      },
    },
    methods: {
      // 用户数据
      async getUserData() {
        let param = {
          pageNo:this.ipagination.current
            }
        getAction(this.url.list,param).then(res => {
            console.log(res);
            this.userData=res.result.records
            this.ipagination.total=res.result.total
          }).catch(e=>{
            this.$emit(e);
          })
      },
      // 表格选择
      handleSelectionChange(val) {
        if (this.multi) {
          this.selectData = val
        } else if (val.length > 1) {
          this.$refs.multipleTable.clearSelection() // 清除
          this.$refs.multipleTable.toggleRowSelection(val.pop()) // pop：最后一个
        } else {
          this.selectData = val
        }
      },
      onConfirm() {
        this.dialogVisible = false
        console.log('selectData-0:', this.selectData)
        const arr1 = this.selectData.map((item) => item.realname)
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
  
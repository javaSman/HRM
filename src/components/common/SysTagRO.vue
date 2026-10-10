<!--  :checkable="checkable" checkStrictly  一起写父子节点选中状态不再关联-->
<!-- expandedKeys 展开的节点 -->
<template>
  <div>
    <a-card :bordered="false" :bodyStyle="{padding:'0px'}">
      <div style="display: flex;justify-content: end;padding-right: 20px;height:40px">
        <span style="position: absolute;left: 10px;">{{ title }}</span>
        <a-button slot="extra" v-if="operable" type="primary" size="small" @click="onContextMenuClick('0','add')">添加
        </a-button>
      </div>
      <a-input-search v-model="searchValue" style="margin-bottom: 8px" placeholder="Search" @change="onChange" />
      <div :style="bodyStyle">
        <a-tree v-if='gData.length>0' :replaceFields="{children:'children', title:'name', key:'id' }"
          :auto-expand-parent="autoExpandParent" :tree-data="gData" :expanded-keys="expandedKeys" :checkable="checkable"
          checkStrictly :multiple="multiple" :checkedKeys="checkedKeys" show-line @expand="onExpand" @select="getTab">
          <template #name="{id:treeKey,name,pids,}" v-if="operable">
            <a-dropdown :trigger="['contextmenu']">
              <span title='鼠标右键可进行操作'>
                <p v-if="name.indexOf(searchValue) > -1">
                  {{ name.substr(0, name.indexOf(searchValue)) }}
                  <span style="color: #f50">{{ searchValue }}</span>
                  {{ name.substr(name.indexOf(searchValue) + searchValue.length) }}
                </p>
                <p v-else>{{ name }}</p>
                <!-- <span v-if='count'>
									( <span style='color:#0055ff;'>{{count}}</span> )
								</span> -->
              </span>
              <template #overlay>
                <a-menu @click="({ key: menuKey }) => onContextMenuClick(treeKey, menuKey,123)">
                  <a-menu-item key="add">新增下级</a-menu-item>
                  <a-menu-item key="sq">授权</a-menu-item>
                  <a-menu-item key="edit">编辑</a-menu-item>
                  <a-menu-item key="delete">删除</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
        </a-tree>
      </div>
    </a-card>

    <!--  不显示标题   -->

    <!-- 树状增删改 -->
    <a-modal v-model="treeShow" :title="treeTitle" @ok="TreeOk">
      <a-form-model ref="form" :model="model" :rules="validatorRules">
        <a-form-model-item label="角色编码" required prop="roleCode">
          <a-input v-model="model.roleCode" :disabled="treeTitle=='编辑'" placeholder="请输入角色编码" />
        </a-form-model-item>
        <a-form-model-item label="角色名称" required prop="roleName">
          <a-input v-model="model.roleName" placeholder="请输入角色名称" />
        </a-form-model-item>
        <a-form-model-item label="排序" required prop="roleName">
          <a-input-number :min="0" v-model="model.sort" placeholder="请输入角色名称" />
        </a-form-model-item>
        <a-form-model-item label="描述" prop="description">
          <a-textarea :rows="5" v-model="model.description" placeholder="请输入角色描述" />
        </a-form-model-item>
      </a-form-model>
    </a-modal>

    <dynamic-fields-drawer ref="fieldsDrawer"></dynamic-fields-drawer>

  </div>
</template>


<script>
  // 树转数组
  const treeToArray = (list, newArr = []) => {
    list.forEach(item => {
      const {
        children
      } = item
      if (children) {
        delete item.children
        if (children.length) {
          newArr.push(item)
          return treeToArray(children, newArr)
        }
      }
      newArr.push(item)
    })
    return newArr
  }

  // 根据id 拿到本id下树结构
  const getTreeDataById = (list, id) => {
    for (let index in list) {
      let item = list[index];
      if (item.id == id) {
        return item;
      } else if (item.children) {
        let data = getTreeDataById(item.children, id);
        if (data) {
          return data;
        }
      }
    }
  }

  //将list添加scopedSlots 需要的格式，num，添加到第几层
  const creadItem = (list) => {
    if (list == null || list.length == 0) {
      return;
    }
    list.forEach(item => {
      item['scopedSlots'] = {
        title: "name"
      }
      creadItem(item.children);
    });
  }
  const operate = {
    // 添加
    "add": (that, treeKey) => {
      let data;
      if (treeKey == '0') {
        treeKey = ''
      } else {
        data = getTreeDataById(that.gData, treeKey);
      }
      if (data && data.children) {}
      that.treeTitle = '新增'
      that.newTree.id = ''
      that.newTree.pid = treeKey
      // that.newTree.templateId=that.templateId;
      
      that.model = {
        roleName: '',
        roleCode: '',
        description: '',
        sort: 0,
      }
      
      that.treeShow = true
    },
    "sq": (that, treeKey) => {
      that.$emit('modalUser', treeKey);
    },
    // 编辑
    "edit": (that, treeKey) => {
      that.treeTitle = '编辑'
      that.dataList.map(item => {
        if (item.id == treeKey) {
          that.newTree.name = JSON.parse(JSON.stringify(item.name))
          that.newTree.pid = null;
          that.newTree.id = treeKey;
          that.model.roleName = JSON.parse(JSON.stringify(item.name))
          that.model.sort = JSON.parse(JSON.stringify(item.sort))
          that.model.roleCode = JSON.parse(JSON.stringify(item.code))
          that.model.id = treeKey
        }
      })
      that.treeShow = true
    },
    // 删除
    "delete": (that, treeKey) => {
      that.dataList.map(item => {
        if (item.id == treeKey) {
          that.$confirm({
            title: '提示',
            content: `是否对"${item.name}"进行删除,用户配置将会失效!`,
            okText: '是',
            okType: 'danger',
            cancelText: '否',
            onOk() {
              // that.TreeOk('', treeKey, 'delete')
              that.deleteHandler(treeKey);
            },
          });
        }
      })
    },
    // 配置
    "config": (that, treeKey) => {
      that.$refs.fieldsDrawer.show(treeKey);
    },
    // copyStructure 拷贝结构
    "copyStructure": (that, treeKey) => {
      let itemTreeData = getTreeDataById(that.gData, treeKey);
      that.copyData.isCopy = true;
      that.copyData.name = itemTreeData.name;
      that.copyData.list = itemTreeData.children;
      that.$message.success("复制成功");
    },
    // 在此节点下生成 拷贝结构
    "pasteStructure": (that, treeKey) => {
      let list = that.copyData.list;
      let name = that.copyData.name;
      that.$confirm({
        title: '提示',
        content: `是否在此节点生成"${name}"下的结构？`,
        okText: '是',
        okType: 'danger',
        cancelText: '否',
        onOk() {
          let params = {
            id: treeKey,
            tagList: list,
          };
          that.treeBatchSave(params);
        },
      });

    }
  }

  import {
    postAction,
    getAction,
    putAction,
    deleteAction,
    postFormAction,
    putFormAction,
  } from '@/api/manage';
  import dynamicFieldsDrawer from "@/components/common/DynamicFieldsDrawer";

  import {
    addRole,
    editRole,
    duplicateCheck
  } from '@/api/api'

  export default {
    name: "SysTag",
    components: {
      dynamicFieldsDrawer
    },
    props: {
      // 双向绑定的值  父组件通过 :value.sync="" 绑定值
      value: [String, Object],
      bodyStyle: {
        type: Object,
        required: false,
        // 内容区样式
        default: function() {
          return {
            height: "65vh",
            "overflow-y": "auto",
          }
        },
      },
      templateId: {
        // 模板id  （也就是项目id）
        type: String,
        required: false,
      },

      title: {
        type: String,
        required: false,
        // 标题文字
        default: "分类",
      },
      titleShow: {
        type: Boolean,
        required: false,
        // 标题是否显示
        default: true,
      },
      checkable: {
        type: Boolean,
        required: false,
        // 是否显示复选框
        default: false,
      },
      multiple: {
        type: Boolean,
        required: false,
        // 是否多选
        default: false,
      },
      type: {
        type: String,
        required: false,
        //[id,name,obj]  点击选择后返回的字段
        default: "id",
      },
      operable: {
        type: Boolean,
        required: false,
        // 是否 可操作（增删改）
        default: false,
      },
      layer: {
        type: Number,
        required: false,
        // 树的可操作层数
        default: 2,
      }
    },
    watch: {
      templateId: {
        handler(newValue, oldValue) {
          // this.newTree.templateId = newValue;
          this.getBMAll();
        },
        immediate: true
      },
      model: {
        handler(newValue, oldValue) {
          console.log(newValue,'model')
        },
        immediate: true
      },
    },
    data() {
      return {
        // 复制结构的数据
        copyData: {
          isCopy: false,
          name: "",
          list: []
        },

        // 选中节点
        checkedKeys: [],

        expandedKeys: [],
        searchValue: '',
        autoExpandParent: true,
        gData: [],
        dataList: [],

        labelCol: {
          xs: {
            span: 24
          },
          sm: {
            span: 5
          },
        },
        wrapperCol: {
          xs: {
            span: 24
          },
          sm: {
            span: 16
          },
        },

        treeShow: false,
        treeTitle: '新增',
        newTree: {
          name: '',
          id: '',
          pid: '',
        },
        model: {
          roleName: '',
          roleCode: '',
          description: '',
          sort: 0,
        },
        

        validatorRules: {
          roleName: [{
              required: true,
              message: '请输入角色名称!'
            },
            {
              min: 2,
              max: 30,
              message: '长度在 2 到 30 个字符',
              trigger: 'blur'
            }
          ],
          roleCode: [{
              required: true,
              message: '请输入角色名称!'
            },
            {
              min: 0,
              max: 64,
              message: '长度不超过 64 个字符',
              trigger: 'blur'
            },
            {
              validator: this.validateRoleCode
            }
          ],
          description: [{
            min: 0,
            max: 126,
            message: '长度不超过 126 个字符',
            trigger: 'blur'
          }]
        },
      }
    },
    created() {

    },
    methods: {
      onChange(e) {
            const value = e.target.value;
            this.expandedKeys = this.dataList.map(item => {
                if (item.name.indexOf(value) > -1) {
                  return this.getParentKey(item.id, this.gData);
                }
                return null;
              }).filter((item, i, self) => item && self.indexOf(item) === i);
           
      },
      getParentKey(key, tree){
        let parentKey;
          for (let i = 0; i < tree.length; i++) {
            const node = tree[i];
            if (node.children) {
              if (node.children.some(item => item.id === key)) {
                parentKey = node.id;
              } else if (this.getParentKey(key, node.children)) {
                parentKey = this.getParentKey(key, node.children);
              }
            }
          }
          return parentKey;
      },
      
      
      validateRoleCode(rule, value, callback) {
        if (/[\u4E00-\u9FA5]/g.test(value)) {
          callback("角色编码不可输入汉字!");
        } else {
          let params = {
            tableName: "sys_role",
            fieldName: "role_code",
            fieldVal: value,
            dataId: this.model.id,
          };
          duplicateCheck(params).then((res) => {
            if (res.success) {
              callback();
            } else {
              callback(res.message);
            }
          });
        }
      },

      text(data) {
        console.log(data);
      },

      getTab(ids, e) {
        this.checkedKeys = ids;
        console.log(ids, e)
        if (ids.length <= 0) {
          return
        }
        // 获取得到的数据; 如果是单选
        if (!this.multiple) {
          let tempId = this.checkedKeys[0];
          let TreeDataList = JSON.parse(JSON.stringify(this.gData)); // 将树列表数据 拷贝一份
          let dataArr = treeToArray(TreeDataList, []); // 将拷贝树列表 转成数组列表格式
          let arr = dataArr.filter(item => item.id == tempId);
          let data = this.type == "obj" ? arr[0] : arr[0][this.type];
          this.$emit("update:value", data);
          this.$emit("myChange", data);
        } else {
          let keys = this.checkedKeys;
          let TreeDataList = JSON.parse(JSON.stringify(this.gData)); // 将树列表数据 拷贝一份
          let dataArr = treeToArray(TreeDataList, []); // 将拷贝树列表 转成数组列表格式
          // 在列表中根据keys 筛选出选中的数据
          let selectArr = dataArr.filter(item => {
            for (let i = 0; i < keys.length; i++) {
              if (item.id == keys[i]) {
                return true;
              }
            }
          })
          // 根据外部传递的 this.type  返回对应数据
          let arr = [];
          if (this.type != "obj") {
            arr = selectArr.map(item => item[this.type])
          } else {
            arr = selectArr;
          }
          this.$emit("update:value", arr);
          this.$emit("myChange", arr);
        }
      },
      generateList(data) {
        if (data == null) {
          return
        }
        for (let i = 0; i < data.length; i++) {
          const node = data[i];
          this.dataList.push({
            id: node.id,
            name: node.name,
            code: node.code,
            sort: node.sort,
          });
          if (node.children) {
            this.generateList(node.children);
          }
        }
      },
      getBMAll() {
        // let url = "common/sysTag/queryTreeList?templateCode=" + this.newTree.templateId;
        postAction(`/role/hrmRoleTree/treeData`).then((res) => {
          if (res.success && res.result) {
            // 默认可以添加到几层
            creadItem(res.result);
            this.gData = res.result
            this.dataList = []
            this.generateList(res.result)
          }
        })
      },
      onContextMenuClick(treeKey, menuKey) {
        console.log(treeKey, menuKey);
        let that = this;
        //根据menuKey 执行对应方法
        operate[menuKey](that, treeKey);
      },
      treeAdd(data, state) {
        let that = this;
        if (state == 1) {
          postAction("/role/hrmRoleTree/add", data).then((res) => {
            if (res.success) {
              this.$message.success("操作成功");
              this.model = {
                roleName: '',
                roleCode: '',
                description: '',
                sort: 0,
              }
              this.treeShow = false;
              this.getBMAll();
            }
          });
        } else  if (state == 2){
          putAction("/role/hrmRoleTree/edit", data).then((res) => {
            if (res.success) {
              this.$message.success("操作成功");
              this.model = {
                roleName: '',
                roleCode: '',
                description: '',
                sort: 0,
              }
              this.treeShow = false;
              this.getBMAll();
            }
          });
        }
        else {
          deleteAction("/role/hrmRoleTree/delete", data).then((res) => {
            if (res.success) {
              this.$message.success("操作成功");
              this.treeShow = false;
              this.model = {
                roleName: '',
                roleCode: '',
                description: '',
                sort: 0,
              }
              this.getBMAll();
            }
          })
        }
      },

      TreeOk() {
        const that = this;
        console.log(this.newTree)
        console.log(this.model)
        // 触发表单验证
        this.$refs.form.validate(valid => {
          if (valid) {
            let obj;
            let state
            if (!this.model.id) {
              obj = addRole(this.model);
              state = 1
            } else {
              obj = editRole(this.model);
              state = 2
            }
            obj.then((res) => {
              if (res.success) {
                let data = this.newTree
                data.name = this.model.roleName
                data['roleCode'] = this.model.roleCode
                data['sort'] = this.model.sort
                
                this.treeAdd(data, state)
              } else {
                that.$message.warning(res.message);
              }
            }).finally(() => {
              // that.confirmLoading = false;
              // that.close();
            })
          } else {
            return false;
          }
        })
      },


      // 删除
      deleteHandler(id) {
        var that = this;

        deleteAction('/sys/role/delete', {
          id: id
        }).then((res) => {
          if (res.success) {
            //重新计算分页问题
            that.treeAdd({
              id: id
            }, '')
          } else {
            that.$message.warning(res.message);
          }
        });
      },
      // 批量添加
      treeBatchSave(params) {
        let url = "common/sysTag/addBatch";
        postAction(url, params).then((res) => {
          if (res.success) {
            this.$message.success("添加成功");
            this.getBMAll();
          }
        })
      },

      onExpand(expandedKeys) {
        console.log(expandedKeys)
        this.expandedKeys = expandedKeys;
        this.autoExpandParent = false;
      },

    }
  }
</script>

<style scoped>
  ::v-deep .ant-tree li .ant-tree-node-content-wrapper.ant-tree-node-selected {
    background-color: #1890ff;
    color: #fff;
  }

  /deep/ .ant-tree li .ant-tree-node-content-wrapper {
    width: 80%;
    text-overflow: ellipsis;
    overflow: hidden;
  }
</style>
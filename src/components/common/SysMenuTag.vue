<!--  :checkable="checkable" checkStrictly  一起写父子节点选中状态不再关联-->
<!-- expandedKeys 展开的节点 -->
<template>
	<div>
		<a-card v-if="titleShow" :bordered="false" :bodyStyle="{padding:'0px'}">
			<div style="display: flex;justify-content: end;padding-right: 20px;">
        <span style="position: absolute;left: 10px;">{{ title }}</span>
				<a-button slot="extra" v-if="operable" type="primary" size="small" @click="onContextMenuClick('0','add')">添加
				</a-button>
			</div>
			<div :style="bodyStyle" v-if='gData.length>0'>
        <a-input-search style="margin-bottom: 8px" placeholder="Search" v-model="searchValue" @change="onSearchChange" />
				<a-tree :replaceFields="{children:'children', title:'name', key:'id' }"
					:auto-expand-parent="autoExpandParent" :tree-data="gData" :expanded-keys="expandedKeys"
					:checkable="checkable" checkStrictly :multiple="multiple" :checkedKeys="checkedKeys" show-line
					@expand="onExpand" @select="getTab" :draggable="draggable" @drop="onDrop">
<!--          右击菜单-->
					<template #name="{id:treeKey,name,pids,count}" v-if="operable">
						<a-dropdown :trigger="['contextmenu']">
							<span title='鼠标右键可进行操作'>
								 <b :class="expandedKey == treeKey?'blueClass':''">{{ name }}</b>
								<span v-if='count'>
									( <span style='color:#0055ff;'>{{count}}</span> )
								</span>
							</span>
							<template #overlay>
								<a-menu @click="({ key: menuKey }) => onContextMenuClick(treeKey, menuKey)">
<!--									<a-menu-item key="config">配置字段</a-menu-item>-->
									<a-menu-item v-show="pids.split(',').length < layer" key="add">新增下级</a-menu-item>
                  <a-menu-item key="enableDraggable" v-if="!draggable">启用排序</a-menu-item>
                  <a-menu-item key="handelDraggable" v-else-if="!sortAutoUpdate">更新排序</a-menu-item>
									<a-menu-item key="edit">编辑</a-menu-item>
									<a-menu-item key="delete">删除</a-menu-item>
<!--									<a-menu-item key="copyStructure">复制结构</a-menu-item>-->
									<a-menu-item key="pasteStructure" v-show="copyData.isCopy">粘贴结构</a-menu-item>
								</a-menu>
							</template>
						</a-dropdown>
					</template>
				</a-tree>
			</div>
		</a-card>

		<!--  不显示标题   -->
		<div :style="bodyStyle" v-if='gData.length>0 && !titleShow'>
			<a-tree :replaceFields="{children:'children', title:'name', key:'id' }"
				:auto-expand-parent="autoExpandParent" :tree-data="gData" :expanded-keys="expandedKeys"
				:checkable="checkable" checkStrictly :multiple="multiple" :checkedKeys="checkedKeys" show-line
				@expand="onExpand" @select="getTab" :draggable="draggable"  @drop="onDrop">
				<template #name="{id:treeKey,name,pids}" v-if="operable">
					<a-dropdown :trigger="['contextmenu']">
						<span title='鼠标右键可进行操作'>{{ name }}</span>
						<template #overlay>
							<a-menu @click="({ key: menuKey }) => onContextMenuClick(treeKey, menuKey)">
<!--								<a-menu-item key="config">配置字段</a-menu-item>-->
								<a-menu-item v-show="pids.split(',').length < layer" key="add">新增下级</a-menu-item>
                <a-menu-item key="enableDraggable" v-if="!draggable">启用排序</a-menu-item>
                <a-menu-item key="handelDraggable" v-else>更新排序</a-menu-item>
								<a-menu-item key="edit">编辑</a-menu-item>
								<a-menu-item key="delete">删除</a-menu-item>
<!--								<a-menu-item key="copyStructure">复制结构</a-menu-item>-->
								<a-menu-item key="pasteStructure" v-show="copyData.isCopy">粘贴结构</a-menu-item>
							</a-menu>
						</template>
					</a-dropdown>
				</template>
			</a-tree>
		</div>



		<!-- 树状增删改 -->
		<a-modal v-model="treeShow" :title="treeTitle" @ok="TreeOk">
			<a-form-model-item label="名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
				<a-input v-model="newTree.name" placeholder="请输入名称"></a-input>
			</a-form-model-item>
			<a-form-model-item label="排序" :labelCol="labelCol" :wrapperCol="wrapperCol">
				<a-input-number v-model="newTree.sort" placeholder="排序" :min="0" disabled></a-input-number>
			</a-form-model-item>
		</a-modal>

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
				// delete item.children
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
			that.newTree.sort = 0;
			if (treeKey == '0') {
				that.newTree.sort = that.gData.length;
			} else {
				data = getTreeDataById(that.gData, treeKey);
			}
			if (data && data.children) {
				that.newTree.sort = data.children.length;
			}
			that.treeTitle = '新增'
			that.newTree.id = ''
			that.newTree.pid = treeKey
			// that.newTree.templateId=that.templateId;
			that.treeShow = true
		},
		// 编辑
		"edit": (that, treeKey) => {
			that.treeTitle = '编辑'
			that.dataList.map(item => {
				if (item.id == treeKey) {
					that.newTree.name = JSON.parse(JSON.stringify(item.name))
					that.newTree.pid = null;
					that.newTree.sort = item.sort;
					that.newTree.id = treeKey;
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
						content: `是否对"${item.name}"进行删除`,
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
			// that.$refs.fieldsDrawer.show(treeKey);
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

		},
    // 启用排序
    "enableDraggable":(that, treeKey)=>{
      that.draggable = true;
    },
    // 全部更新排序
    "handelDraggable":(that, treeKey)=>{
      // 处理更新
      let arr =[];
      that.dataList.forEach(item=>{
        arr.push({
          id:item.id,
          sort:item.sort
        })
      })
      let url ="sysMenu/sysTag/updateSort";
      putAction(url,arr).then(res=>{
        if (res.success){
          that.$message.success("更新成功")
          that.draggable = false;
        }else{
          that.$message.success("更新失败")
        }
      })

    },




	}

  import { postAction, deleteAction, postFormAction, putFormAction, putAction, } from '@/api/manage'
  import { arrMove } from '@/utils/sysTreeTagUtil'

  export default {
		name: "SysMenuTag",
		components: {

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
      expandedKey:{
        // 展开的节点
        type: String,
        required: false,
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
				default: 10,
			},
      // 拖拽排序后 是否自动更新， true：自动更新  ，false：手动更新
      sortAutoUpdate:{
        type: Boolean,
        required: false,
        default: false,
      }
		},
		watch: {
			templateId: {
				handler(newValue, oldValue) {
					this.newTree.templateId = newValue;
					this.getBMAll();
				},
				immediate: true
			},
      expandedKey:{
        handler(newValue, oldValue) {
          // 找到父亲节点 并展开
         let itemArr = this.dataList.filter(item =>{
           console.log(item)
            if (item.id == newValue){
              return true;
            }
          })
          let item = itemArr[0];
         if (!item){
           return
         }
         let arr = item.pids.split(',');
          this.expandedKeys = arr;
        },
        immediate: true
      }
		},
		data() {
			return {
        // 启动排序
        draggable:false,

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
					templateId: '',
					sort: 0
				},
			}
		},
		created() {

		},
		methods: {
			text(data) {
				console.log(data);
			},
      // 根据传入list的局部排序 更新排序
      partDraggableSort(arrSort){
        // 处理更新
        let arr =[];
        arrSort.forEach(item=>{
          arr.push({
            id:item.id,
            sort:item.sort
          })
        })
        let url ="sysMenu/sysTag/updateSort";
        putAction(url,arr).then(res=>{
          if (res.success){
            this.$message.success("更新成功")
            //this.draggable = false;
          }else{
            this.$message.success("更新失败")
          }
        })
      },



			getTab(ids, e) {
				this.checkedKeys = ids;
        if (!ids || ids.length===0){
          this.$emit("update:value", null);
          this.$emit("myChange", null);
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
					this.dataList.push(node);
					if (node.children) {
						this.generateList(node.children);
					}
				}
			},
			getBMAll() {
				let url = "sysMenu/sysTag/queryTreeList?templateCode=" + this.newTree.templateId;
				postAction(url).then((res) => {
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
        console.log("123456");
        console.log(treeKey, menuKey);
				let that = this;
				//根据menuKey 执行对应方法
				operate[menuKey](that, treeKey);
			},
			TreeOk() {
				if (this.treeTitle == '新增') {
					postFormAction("sysMenu/sysTag/add", this.newTree).then((res) => {
						if (res.success) {
							this.$message.success("操作成功");
							this.treeShow = false;
							this.getBMAll();
						}
					});
				} else {
					let that = this;
					let params = {
						id: that.newTree.id,
						pid: that.newTree.pid,
						name: that.newTree.name,
						sort: that.newTree.sort,
					}
					putFormAction("sysMenu/sysTag/edit", params).then((res) => {
						if (res.success) {
							this.$message.success("操作成功");
							this.treeShow = false;
							this.getBMAll();
						}
					})
				}
			},


			// 删除
			deleteHandler(id) {
				deleteAction("sysMenu/sysTag/delete", {
					id: id
				}).then((res => {
					if (res.success) {
						this.$message.success("删除成功");
						this.getBMAll();
					} else {
						this.$message.error(res.message);
					}
				}))
			},
			// 批量添加
			treeBatchSave(params) {
				let url = "sysMenu/sysTag/addBatch";
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

      onSearchChange(e){
        const value = e.target.value;
        if (value === null || value === undefined || value.trim() === ''){
          return;
        }
        // 找到匹配的元素主键
        let expandedKeys =  this.dataList.filter(item=>{
          return item.name.includes(value);
        }).map(item => item.id);

        Object.assign(this, {
          expandedKeys,
          searchValue: value,
          autoExpandParent: true,
        });
      },


      // 拖拽排序后的
      onDrop(info) {
        const dropPos = info.node.pos.split('-');
        const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
        console.log("==dropPosition:1节点下 0节点本身  -1节点上"+dropPosition,dropPosition==1?"下":"上")
        console.log("==info==",info)

        let targetId = info.node.eventKey;// 目标点id
        let dragId = info.dragNode.eventKey;// 被拖拽的id
        // 拖拽节点
        let dragNode = getTreeDataById(this.gData,dragId);
        let commePNodeArr = this.gData;
        if(dragNode.pid!='0'){
          commePNodeArr = getTreeDataById(this.gData,dragNode.pid).children;  // 拖拽节点的父节点
        }
        // 目标节点的下标
        let targetIndex = commePNodeArr.findIndex(obj => obj.id === targetId);
        let dragIndex = commePNodeArr.findIndex(obj => obj.id === dragId);
        if (targetIndex == -1) {
          // 没找到 证明目标节点和拖拽节点不在一个层级
          this.$message.error("只可以同级之间排序");
          return;
        }
        arrMove(commePNodeArr,dragIndex,targetIndex);
        // 根据下标重置sort 排序值
        for (let i = 0; i < commePNodeArr.length; i++) {
          let item = commePNodeArr[i];
          item.sort = i;
        }
        // 自动排序
        if (this.sortAutoUpdate){
          this.partDraggableSort(commePNodeArr);
        }
        // let targetNode = getTreeDataById(this.gData,targetId);
        console.log("==公共父节点.数组==",commePNodeArr);
        // console.log("==目标节点==",targetNode)
        console.log("==被拖拽节点==",dragNode)

      }



		}
	}
</script>

<style scoped>
	::v-deep .ant-tree li .ant-tree-node-content-wrapper.ant-tree-node-selected {
		background-color: #1890ff;
		color: #fff;
	}

  .blueClass{
    background-color: #1890ff;
    color: #fff;
  }

	/deep/ .ant-tree li .ant-tree-node-content-wrapper {
		width: 80%;
		text-overflow: ellipsis;
		overflow: hidden;
	}
</style>

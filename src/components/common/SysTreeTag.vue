<!--  :checkable="checkable" checkStrictly  一起写父子节点选中状态不再关联-->
<!-- expandedKeys 展开的节点 -->
<template>
	<div :class="selectedStyleShow ? 'selectedTrue': 'selectedFalse'">
		<a-card  :bordered="false" :bodyStyle="{padding:'0px'}">
			<div style="display: flex;justify-content: end;padding-right: 20px;height: 24px;">
        <span style="position: absolute;left: 10px;" v-if="titleShow">{{ title }}</span>
        <div slot="extra" v-if="operable">
          <a-button   type="primary" size="small" style="margin-right: 5px" @click="onContextMenuClick('0','add')">添加</a-button>
          <a-button   type="primary" size="small" @click="onContextMenuClick('0','config')">配置</a-button>
        </div>
        <div slot="extra" v-else>
          <slot name="header"></slot>
        </div>
			</div>
			<div :style="bodyStyle" v-if='gData.length>0'>
        <a-input-search style="margin-bottom: 8px" v-if="searchShow" placeholder="Search" v-model="searchValue" @change="onSearchChange" />
				<a-tree :replaceFields="{children:'children', title:'name', key:'id' }"
					:auto-expand-parent="autoExpandParent" :tree-data="gData" :expanded-keys="expandedKeys"
					:checkable="checkable" :checkStrictly="true" :multiple="multiple" :checkedKeys="checkedKeys" :selectedKeys="checkedKeys" show-line
					@expand="onExpand" @select="getTab" @check="checkHandel" :draggable="draggable"  @drop="onDrop">
          <!--          节点插槽-->
					<template #name="{id:treeKey,name,pids,count,childCode,hasOpen}" v-if="operable">
						<a-dropdown :trigger="['contextmenu']">
							<span title='鼠标右键可进行操作'>
								 <b >
                   {{ name }}
                   <a-switch   :checked="hasOpen === '1'"  @change="openChange(treeKey,hasOpen)" size="small" style="margin-left: 5px;margin-bottom: 3px"/>
                   <slot name="nodeSlot" :data="{treeKey,name,pids,count,childCode,hasOpen}">
                     <a-icon  v-if="childCode" type="align-left" class="redClass" ></a-icon>
                   </slot>
                 </b>
								<span v-if='count'>
									( <span style='color:#0055ff;'>{{count}}</span> )
								</span>
							</span>
							<template #overlay>
								<a-menu @click="({ key: menuKey }) => onContextMenuClick(treeKey, menuKey)">
									<a-menu-item v-show="pids.split(',').length < layer" key="add">新增下级</a-menu-item>
                  <a-menu-item key="enableDraggable" v-if="!draggable">启用排序</a-menu-item>
                  <a-menu-item key="handelDraggable" v-else>更新排序</a-menu-item>
									<a-menu-item key="edit">编辑</a-menu-item>
                  <a-menu-item key="view">角色授权</a-menu-item>
                  <a-menu-item key="bindDataRule">绑定数据规则</a-menu-item>
                  <a-menu-item key="bindButton">绑定按钮</a-menu-item>
                  <a-menu-item key="copy">拷贝</a-menu-item>
									<a-menu-item key="delete">删除</a-menu-item>
								</a-menu>
							</template>
						</a-dropdown>
					</template>

          <!--          节点插槽-->
          <template slot="name" slot-scope="item" v-else>
            {{ item.name }}
            <slot name="nodeSlot" :data="item">
            </slot>
          </template>>

        </a-tree>
			</div>
		</a-card>

		<!--  不显示标题   -->
<!--		<div :style="bodyStyle" v-if='gData.length>0 && !titleShow'>-->

<!--      &lt;!&ndash;  不显示标题  的header插槽 &ndash;&gt;-->
<!--      <div style="position: absolute; right: 25px; top: 57px;">-->
<!--        <div slot="extra">-->
<!--          <slot name="header"></slot>-->
<!--        </div>-->
<!--      </div>-->

<!--      <a-input-search style="margin-bottom: 8px" v-if="searchShow" placeholder="Search" v-model="searchValue" @change="onSearchChange" />-->
<!--			<a-tree :replaceFields="{children:'children', title:'name', key:'id' }"-->
<!--				:auto-expand-parent="autoExpandParent" :tree-data="gData" :expanded-keys="expandedKeys"-->
<!--				:checkable="checkable" :checkStrictly="true" :multiple="multiple" :checkedKeys="checkedKeys" :selectedKeys="checkedKeys" show-line-->
<!--				@expand="onExpand" @select="getTab" @check="checkHandel" :draggable="draggable"  @drop="onDrop">-->

<!--				<template #name="{id:treeKey,name,pids}" v-if="operable">-->
<!--					<a-dropdown :trigger="['contextmenu']">-->
<!--						<span title='鼠标右键可进行操作'>{{ name }}</span>-->
<!--						<template #overlay>-->
<!--							<a-menu @click="({ key: menuKey }) => onContextMenuClick(treeKey, menuKey)">-->

<!--								<a-menu-item v-show="pids.split(',').length < layer" key="add">新增下级</a-menu-item>-->
<!--                <a-menu-item key="enableDraggable" v-if="!draggable">启用排序</a-menu-item>-->
<!--                <a-menu-item key="handelDraggable" v-else>更新排序</a-menu-item>-->
<!--								<a-menu-item key="edit">编辑</a-menu-item>-->
<!--                <a-menu-item key="view">角色授权</a-menu-item>-->
<!--                <a-menu-item key="copy">拷贝</a-menu-item>-->
<!--								<a-menu-item key="delete">删除</a-menu-item>-->
<!--							</a-menu>-->
<!--						</template>-->
<!--					</a-dropdown>-->
<!--				</template>-->
<!--			</a-tree>-->
<!--		</div>-->


    <!-- 树状增删改 -->
    <sys-tree-tag-from  ref="tagFrom" :code="templateId" :disableField="false" @renewCallback="getBMAll"></sys-tree-tag-from>

    <!-- 配置的弹框 -->
    <a-modal v-model="configShow" title="配置" :footer="null" width="60%" @cancel="configClose">
      <dynamic-fields :code-id="templateId"></dynamic-fields>
    </a-modal>

    <!-- 拷贝的的弹框 -->
    <a-modal v-model="copyShow" title="是否拷贝？" :maskClosable="false" centered width="300px" @ok="copyOk" @cancel="configClose">
      拷贝{{ copy.num }}个
      <a-slider v-model="copy.num" :min="1" :max="20" />
    </a-modal>

    <!-- 显示授权的角色弹框   -->
    <tree-tag-role-permission ref="tagRole"></tree-tag-role-permission>


    <!--    绑定数据规则-->
    <zt-data-rule ref="dataRule"></zt-data-rule>
    <!--    绑定按钮-->
    <zt-tree-tag-button-type ref="buttonType" ></zt-tree-tag-button-type>

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
      if (item.children==null){
        item.children=[];
      }
      // 过滤掉 指定类型
      item.children = item.children.filter( item =>  {
        for (let key in nodeType) {
          let node = nodeType[key];
          if (node.value === item.hasChild){
            return !node.filter;
          }
        }
        return false;
      });
			creadItem(item.children);
		});
	}
	const operate = {
		// 添加
		"add": (that, treeKey) => {
      let sort = 0;
      // 如果是直接点的添加
      if (treeKey == '0') {
        sort = that.gData.length;
        // 通过添加下级点的添加
      } else {
        let data = getTreeDataById(that.gData, treeKey);
        if (data && data.children) {
          sort = data.children.length;
        }
      }
      // 添加一个基础项
      let oneAddItem={
        name: '',
        id: '',
        pid: treeKey,
        templateId: '',
        hasChild:'1',
        fieldJson:null,
        sort: sort
      }
      that.$refs.tagFrom.add(oneAddItem);
		},

		// 编辑
		"edit": (that, treeKey) => {
      let item = that.dataList.find(item => item.id == treeKey);
      let oneEditItem={
        name: item.name,
        id: item.id,
        pid: item.pid,
        templateId: item.templateId,
        hasChild:item.hasChild,
        childCode:item.childCode,
        fieldJson:item.fieldJson,
        sort: item.sort
      }

      that.$refs.tagFrom.edit(oneEditItem);
		},

    "view":(that, treeKey)=>{
      console.log(treeKey);
      let code = that.templateId;
      // 显示授权组件
      that.$refs.tagRole.showDrawer(treeKey,code);
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
      // 配置显示信息
      console.log("配置模板:",that.templateId)
      that.configShow = true;
		},
    "copy":(that, treeKey)=>{
      // 拷贝一个节点
      that.copy.id = treeKey;
      that.copyShow = true;

    },
    // 绑定数据规则
    bindDataRule:(that, treeKey)=>{
      // 显示授权组件
      that.$refs.dataRule.showDrawer(treeKey);
    },
    // 绑定按钮
    bindButton:(that, treeKey)=>{
      that.$refs.buttonType.showDrawer(treeKey);
    },
    // 启用排序
    "enableDraggable":(that, treeKey)=>{
      that.draggable = true;
    },
    // 更新排序
    "handelDraggable":(that, treeKey)=>{
      // 处理更新
      let arr =[];
      that.dataList.forEach(item=>{
        arr.push({
          id:item.id,
          sort:item.sort
        })
      })
      let url ="sys/sysTreeTag/updateSort";
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
  import SysTreeTagFrom from '@comp/common/SysTreeTagFrom'
  import ztDataRule from '@comp/common/ZtDataRule'
  import ztTreeTagButtonType from '@comp/common/ZtTreeTagButtonType'
  import { nodeType } from '@/utils/sysTreeTagUtil'

  import { postAction, deleteAction, postFormAction, putFormAction, putAction, } from '@/api/manage'
  import { getVariableList } from '@/utils/util';
  import dynamicFields from "@comp/common/DynamicFields";
  import TreeTagRolePermission from '@comp/common/TreeTagRolePermission'


  import {arrMove} from '@/utils/sysTreeTagUtil'
	export default {
		name: "SysTreeTag",
		components: {
      SysTreeTagFrom,
      dynamicFields,
      TreeTagRolePermission,
      ztDataRule,
      ztTreeTagButtonType
		},
		props: {
			// 双向绑定的值  父组件通过 :value.sync="" 绑定值
			value: [String, Object,Array],
			bodyStyle: {
				type: Object,
				required: false,
				// 内容区样式
				default: function() {
					return {
						"height": "auto",
						"overflow-y": "auto",
					}
				},
			},
			templateId: {
				// 模板id  （也就是项目id）
				type: String,
				required: true,
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
      selectedStyleShow:{
        type: Boolean,
        required: false,
        // 选中样式 切换
        default: false,
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
      searchShow:{
        type: Boolean,
        required: false,
        // 是否显示搜索框
        default: false,
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
      dataHas0pen:{
        type: String,
        required: false,
        // 数据的打开状态 “”获取全部 1获取打开的 0 获取不可打开的状态数据 dataHas0pen
        default: "",
      }
		},
		watch: {
			templateId: {
				handler(newValue, oldValue) {
					this.getBMAll();
				},
				immediate: true
			},
      value(newValue, oldValue) {
        console.log(`selectTreeId值变化为 ${newValue}`) // 打印新的值
        this.updateCheckedKeys();
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

        configShow:false,
        copyShow:false,
        copy:{
          id:'',
          num:1,
        },
			}
		},
		created() {

		},
    computed:{

    },
    // <a-switch checkedChildren="是" unCheckedChildren="否" v-model="model.route"/>
		methods: {
      openChange(treeKey,hasOpen) {
        console.log(treeKey,hasOpen);
        let item = getTreeDataById(this.gData,treeKey);
        let hasOpenStatus = '1';
        if (item.hasOpen=='1'){
          hasOpenStatus='0'
        }
        // 发送请求 编辑节点状态
        let params = {
          id: item.id,
          hasOpen:hasOpenStatus
        }
        putFormAction("sys/sysTreeTag/edit", params).then((res) => {
          if (res.success) {
            item.hasOpen= hasOpenStatus;
            if (hasOpenStatus === '1'){
              this.$message.success("打开成功");
            }else {
              this.$message.success("关闭成功");
            }

          }else {
            this.$message.error("更新失败");
          }
        })

      },

      // 根据value值 更新选中的值
      updateCheckedKeys(){
        if (! this.value){
          return
        }
        console.log("sysTreeTag created")
        // type 是obj  value就是对象    multiple（是否多选）如果true就是数组
        // 传递value（可能是个单个对象，（对象一定有id 属性），对象数组，单个id，或者id数组） 时自动勾选 checkedKeys
        if (this.multiple && this.type == "id"){
          this.checkedKeys=this.value;
        }else if (this.multiple && this.type == "obj") {
          let arr = this.value.map(item=>item.id);
          this.checkedKeys=arr;
        }else if (!this.multiple && this.type == 'id'){
          this.checkedKeys.push(this.value)
        }else {
          this.checkedKeys.push(this.value.id);
        }
      },


			getTab(ids, e) {
        this.checkedKeys=ids;
        // 数组连接完后去重
        // this.checkedKeys = [...new Set(arrKeys.concat(ids))];

        let TreeDataList = JSON.parse(JSON.stringify(this.gData)); // 将树列表数据 拷贝一份
        let dataArr = treeToArray(TreeDataList, []); // 将拷贝树列表 转成数组列表格式
				// 获取得到的数据; 如果是单选
				if (!this.multiple) {
          if(this.checkedKeys.length<=0){
            return;
          }
					let tempId = this.checkedKeys[0];
					let arr = dataArr.filter(item => item.id == tempId);
					let data = this.type == "obj" ? arr[0] : arr[0][this.type];
					this.$emit("update:value", data);
					this.$emit("myChange", data,arr[0]);
				} else {
					let keys = this.checkedKeys;
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
					this.$emit("myChange", arr,selectArr);
				}
			},

      // onCheck(checkedKeys, info) {
      //   console.log('onCheck', checkedKeys, info);
      //   this.getTab(checkedKeys,null);
      //
      // },


			generateList(data) {
				if (data == null) {
					return
				}
				for (let i = 0; i < data.length; i++) {
					const node = data[i];
          this.dataList.push(node);

					// this.dataList.push({
					// 	id: node.id,
					// 	name: node.name,
					// 	sort: node.sort,
          //   hasChild:node.hasChild,
          //   hasOpen:node.hasOpen,
          //   childCode:node.childCode,
          //   fieldJson:node.fieldJson
					// });
					if (node.children) {
						this.generateList(node.children);
					}
				}
			},
			getBMAll() {
        // dataHas0pen 1获取打开的 0 不打开的  “” 全部
				let url = "sys/sysTreeTag/queryTreeList?templateCode=" + this.templateId;
        if (this.dataHas0pen!=null && this.dataHas0pen!=""){
          url+=`&hasOpen=${this.dataHas0pen}`;
        }
				postAction(url).then((res) => {
					if (res.success) {
            if (!res.result){
              res.result=[];
            }
						// 默认可以添加到几层
						creadItem(res.result);
						this.gData = res.result;
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


			// 删除
			deleteHandler(id) {
				deleteAction("sys/sysTreeTag/delete", {
					id: id
				}).then((res => {
					if (res.success) {
						this.$message.success("删除成功");
						this.getBMAll();
            // 添加数据 或者更新数据 给父组件的回调事件
            this.$emit('renewCallback');
					} else {
						this.$message.error(res.message);
					}
				}))
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
      /**
       * 复选框的点击事件(全选其孩子节点的功能)
       * @param checkedKeys
       * @param e
       */
      checkHandel(checkedKeys,e){
        let keyArr = checkedKeys.checked;
        let dataRef = e.node.dataRef;

        // 如果是多选
        if (this.multiple){
          // 当前点击是选中 并且菜单节点 并且有孩子 全选加入其全部的孩子节点
          if (e.checked && dataRef.hasChild == "1" && dataRef.children){
            let keyChildren = dataRef.children.map( item=> item.id);
            keyArr = [...new Set([...keyArr, ...keyChildren])];
          }else if (dataRef.hasChild == "1" && dataRef.children) {
            let keyChildren = dataRef.children.map( item=> item.id);
            keyArr = keyArr.filter(id=> !keyChildren.includes(id));
          }

          this.getTab(keyArr,null);
          return;
        }
        //如果单选 选中一个
        if (e.checked){
          let key = dataRef.id;
          this.getTab([key],null);
        }else {
          this.getTab([],null);
        }

      },
      /**
       * config 弹出窗的 关闭事件
       */
      configClose(){
        // 重新加载
        getVariableList();
      },

      //
      copyOk(){
        console.log("开始拷贝===",this.copy);
        let url = `sys/sysTreeTag/copyNode`;
        putFormAction(url,this.copy).then(res=>{
          if (res.success) {
            this.$message.success("拷贝成功");
            this.copyShow = false;
            this.getBMAll();
            // 添加数据 或者更新数据 给父组件的回调事件
            this.$emit('renewCallback');
          } else {
            this.$message.error(res.message);
          }
        })

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
        // let targetNode = getTreeDataById(this.gData,targetId);
        console.log("==公共父节点.数组==",commePNodeArr);
        // console.log("==目标节点==",targetNode)
        console.log("==被拖拽节点==",dragNode)
      }
		}
	}
</script>

<style scoped>
  /* 弹框样式 */
  .newTab {
    width: 98%;
    border-collapse: collapse;
    border: solid 1px #e8e8e8;
    margin: auto;
  }

  .newTab th {
    background-color: #fafafa;
    width: 6%;
    text-align: center;
  }

  .newTab td {
    width: 30%;
  }

  .newTabA td {
    width: 10% !important;
  }



  .redClass{
    margin-left:5px;color: red;
  }


  .selectedTrue ::v-deep .ant-tree li .ant-tree-node-content-wrapper.ant-tree-node-selected {
		background-color: #1890ff;
		color: #fff;
	}
  .selectedFalse ::v-deep .ant-tree li .ant-tree-node-content-wrapper.ant-tree-node-selected {
    background-color: rgba(24, 144, 255, 0);
  }

	/deep/ .ant-tree li .ant-tree-node-content-wrapper {
		width: 80%;
		text-overflow: ellipsis;
		overflow: hidden;
	}
</style>

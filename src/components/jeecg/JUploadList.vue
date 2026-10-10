<template>
	<div :id="containerId" style="position: relative">
		<a-upload name="file" :multiple="true" :action="uploadAction" :headers="headers" :data="{ 'biz': bizPath }"
			:fileList="fileList" :beforeUpload="beforeUpload" @change="handleChange" :disabled="disabled"
			:returnUrl="returnUrl" :listType="complistType" @preview="handlePreview" :accept="accept"
			:showUploadList="false" :class="{ 'uploadty-disabled': disabled }">
			<template v-if='!disabled'>
				<div v-if="isImageComp">
					<a-icon type="plus" />
					<div class="ant-upload-text">{{ text }}</div>
				</div>
				<a-button v-else-if="buttonVisible">
					<a-icon type="upload" />{{ text }}
				</a-button>
			</template>
		</a-upload>

		<!-- 自定义文件列表 -->
		<div v-if="!isImageComp && fileList.length > 0" class="custom-file-list">
			<div v-for="file in fileList" :key="file.uid" class="file-card-item"
				:class="{ 'file-card-clickable': file.status === 'done', 'file-card-uploading': file.status === 'uploading', 'file-card-only-suffix': onlySuffix }"
				@click="handlePreview(file)">
				<div class="file-card-icon">
					<a-icon v-if="file.status === 'uploading'" type="loading" />
					<a-icon v-else theme="twoTone" :two-tone-color="getFileIconCor(file.name)"
						:type="getFileIconType(file.name)" />
				</div>
				<div class="file-card-info">
					<div class="file-card-name">{{ onlySuffix ? getSuffix(file.url) : file.name }}</div>
					<div v-if="file.status === 'uploading'" class="file-card-progress-wrap">
						<a-progress class="file-card-progress" :percent="getFilePercent(file)" size="small" :showInfo="false" />
						<span class="file-card-percent">{{ getFilePercent(file) }}%</span>
					</div>
				</div>
				<div v-if="!disabled" class="file-card-remove" @click.stop="handleRemoveFile(file)">
					<a-icon type="close" />
				</div>
			</div>
		</div>

		<!-- PDF预览 -->
		<all-preview :visible="pdfIsShow" :url-arr="pdfList" @close="pdfIsShow = false"></all-preview>
	</div>
</template>

<script>
import Vue from 'vue'
import {
	ACCESS_TOKEN
} from "@/store/mutation-types"
import {
	getFileAccessHttpUrl
} from '@/api/manage';

import AllPreview from "@/components/common/AllPreview";

const FILE_TYPE_ALL = "all"
const FILE_TYPE_IMG = "image"
const FILE_TYPE_TXT = "file"
const uidGenerator = () => {
	return '-' + parseInt(Math.random() * 10000 + 1, 10);
}
const getFileName = (path) => {
	if (path.lastIndexOf("\\") >= 0) {
		let reg = new RegExp("\\\\", "g");
		path = path.replace(reg, "/");
	}
	return path.substring(path.lastIndexOf("/") + 1);
}
export default {
	name: 'JUpload',
	components: {
		AllPreview
	},
	data() {
		return {
			pdfIsShow: false,
			pdfList: [],
			uploadAction: window._CONFIG['domianURL'] + "/sys/common/upload",
			headers: {},
			fileList: [],
			newFileList: [],
			uploadGoOn: true,
			times:'',
			//---------------------------- begin 图片左右换位置 -------------------------------------
			previewImage: '',
			containerId: '',
			top: '',
			left: '',
			moveDisplay: 'none',
			showMoverTask: false,
			moverHold: false,
			currentImg: ''
			//---------------------------- end 图片左右换位置 -------------------------------------
		}
	},
	props: {
		accept: {
			type: String,
			required: false,
			default: ''
		},
		text: {
			type: String,
			required: false,
			default: "点击上传"
		},
		fileType: {
			type: String,
			required: false,
			default: FILE_TYPE_ALL
		},
		/*这个属性用于控制文件上传的业务路径*/
		bizPath: {
			type: String,
			required: false,
			default: "temp"
		},
		value: {
			type: [String, Array],
			required: false
		},
		// update-begin- --- author:wangshuai ------ date:20190929 ---- for:Jupload组件增加是否能够点击
		disabled: {
			type: Boolean,
			required: false,
			default: false
		},
		// update-end- --- author:wangshuai ------ date:20190929 ---- for:Jupload组件增加是否能够点击
		//此属性被废弃了
		triggerChange: {
			type: Boolean,
			required: false,
			default: false
		},
		/**
		 * update -- author:lvdandan -- date:20190219 -- for:Jupload组件增加是否返回url，
		 * true：仅返回url
		 * false：返回fileName filePath fileSize
		 */
		returnUrl: {
			type: Boolean,
			required: false,
			default: true
		},
		number: {
			type: Number,
			required: false,
			default: 0
		},
		buttonVisible: {
			type: Boolean,
			required: false,
			default: true
		},
		delete: {
			type: Boolean,
			default: false
		},
    onlySuffix: {
      type: Boolean,
      default: false
    }
	},
	watch: {
		value: {
			immediate: true,
			handler() {
				let val = this.value
				if (val instanceof Array) {
					if (this.returnUrl) {
						this.initFileList(val.join(','))
					} else {
						this.initFileListArr(val);
					}
				} else {
					this.initFileList(val)
				}
			}
		}
	},
	computed: {
		isImageComp() {
			return this.fileType === FILE_TYPE_IMG
		},
		complistType() {
			return 'picture'
		}
	},
	created() {
		const token = Vue.ls.get(ACCESS_TOKEN);
		this.headers = {
			"X-Access-Token": token
		};
		this.containerId = 'container-ty-' + new Date().getTime();
	},

	methods: {
		initFileListArr(val) {
			if (!val || val.length == 0) {
				this.fileList = [];
				return;
			}
			let fileList = [];
			for (var a = 0; a < val.length; a++) {
				let url = getFileAccessHttpUrl(val[a].filePath);
				fileList.push({
					uid: uidGenerator(),
					name: val[a].fileName,
					status: 'done',
					url: url,
					response: {
						status: "history",
						message: val[a].filePath
					}
				})
			}
			this.fileList = fileList
		},
		initFileList(paths) {
			if (!paths || paths.length == 0) {
				//return [];
				// update-begin- --- author:os_chengtgen ------ date:20190729 ---- for:issues:326,Jupload组件初始化bug
				this.fileList = [];
				return;
				// update-end- --- author:os_chengtgen ------ date:20190729 ---- for:issues:326,Jupload组件初始化bug
			}
			let fileList = [];
			let arr = paths.split(",")
			for (var a = 0; a < arr.length; a++) {
				let url = getFileAccessHttpUrl(arr[a]);
				fileList.push({
					uid: uidGenerator(),
					name: getFileName(arr[a]),
					status: 'done',
					url: url,
					response: {
						status: "history",
						message: arr[a]
					}
				})
			}
			this.fileList = fileList
		},
		handlePathChange() {
			let uploadFiles = this.fileList

			let path = ''
			if (!uploadFiles || uploadFiles.length == 0) {
				path = ''
			}
			let arr = [];

			for (var a = 0; a < uploadFiles.length; a++) {
				// update-begin-author:lvdandan date:20200603 for:【TESTA-514】【开源issue】多个文件同时上传时，控制台报错
				if (uploadFiles[a].status === 'done') {
					arr.push(uploadFiles[a].response.message)
				} else {
					return;
				}
				// update-end-author:lvdandan date:20200603 for:【TESTA-514】【开源issue】多个文件同时上传时，控制台报错
			}
			if (arr.length > 0) {
				path = arr.join(",")
			}
			this.$emit('change', path);
		},
		beforeUpload(file) {
			this.uploadGoOn = true
			var fileType = file.type;
			if (this.fileType === FILE_TYPE_IMG) {
				if (fileType.indexOf('image') < 0) {
					this.$message.warning('请上传图片');
					this.uploadGoOn = false
					return false;
				}
			}
			//TODO 扩展功能验证文件大小
			return true
		},
		handleChange(info) {
			if (!info.file.status && this.uploadGoOn === false) {
				info.fileList.pop();
			}
			console.log('timestimestimestimes',this.times)

			let fileList = info.fileList
			if (info.file.status === 'removed') {
				if (this.delete) {
					let aa = this.handleDelete(info, info.file)
					if (aa) {
						return
					} else {
						this.fileList = fileList
					}
				}
			}

			if (info.file.status === 'done') {
				if (this.number > 0) {
					fileList = fileList.slice(-this.number);
				}

				if (info.file.response.success) {
					fileList = fileList.map((file) => {
						if (file.response) {
							let reUrl = file.response.message;
							file.url = getFileAccessHttpUrl(reUrl);
						}
						return file;
					});
				} else {
					let arr = JSON.parse(JSON.stringify(fileList))
					for (var a = 0; a < fileList.length; a++) {
						let file = fileList[a]
						if (!file.response.success && file.response.code) {
							arr.splice(a, 1)
							this.times = new Date().getTime()
							console.log('splicesplicesplice1',this.times)
						}
					}
					this.fileList = arr
					this.$message.warning(`${info.file.response.message} 上传失败.`);
				}
			} else if (info.file.status === 'error') {
				let arr = JSON.parse(JSON.stringify(fileList))
					for (var a = 0; a < fileList.length; a++) {
						let file = fileList[a]
						if (!file.response.success && file.response.code) {
							arr.splice(a, 1)
							this.times = new Date().getTime()
							console.log('splicesplicesplice1',this.times)
						}
					}
					this.fileList = arr
				this.$message.error(`${info.file.name} 上传失败.`);
			} else {
				this.fileList = fileList
			}

			if (info.file.status === 'done' || info.file.status === 'removed') {
				//returnUrl为true时仅返回文件路径
				if (this.returnUrl) {
					this.handlePathChange()
				} else {
					//returnUrl为false时返回文件名称、文件路径及文件大小
					this.newFileList = [];
					for (var a = 0; a < fileList.length; a++) {
						// update-begin-author:lvdandan date:20200603 for:【TESTA-514】【开源issue】多个文件同时上传时，控制台报错
						if (fileList[a].status === 'done') {
							var fileJson = {
								fileName: fileList[a].name,
								filePath: fileList[a].response.message,
								fileSize: fileList[a].size
							};
							this.newFileList.push(fileJson);
						} else {
							return;
						}
						// update-end-author:lvdandan date:20200603 for:【TESTA-514】【开源issue】多个文件同时上传时，控制台报错
					}
					this.$emit('change', this.newFileList);
				}
			}
		},
		handleDelete(info, file) {
			//如有需要新增 删除逻辑
			let aa = false
			if (this.fileList.length == 1 && this.delete) {
				aa = true
				if (this.fileList[0].file) {
					this.fileList[0].file.status = 'done'
					this.$message.error('至少上传一张附件')
				} else {
					this.fileList[0].status = 'done'
					this.$message.error('至少上传一张附件')

				}
				return aa
			}


		},
		handlePreview(file) {
			if (!file || file.status !== 'done' || !file.url) {
				return
			}
			// 预览全部文件
			this.pdfList = [file.url]
			this.pdfIsShow = true
			console.log('你是什麼格式', file.url)
		},
		//---------------------------- begin 图片左右换位置 -------------------------------------
		moveLast() {
			//console.log(ev)
			//console.log(this.fileList)
			//console.log(this.currentImg)
			let index = this.getIndexByUrl();
			if (index == 0) {
				this.$message.warn('未知的操作')
			} else {
				let curr = this.fileList[index].url;
				let last = this.fileList[index - 1].url;
				let arr = []
				for (let i = 0; i < this.fileList.length; i++) {
					if (i == index - 1) {
						arr.push(curr)
					} else if (i == index) {
						arr.push(last)
					} else {
						arr.push(this.fileList[i].url)
					}
				}
				this.currentImg = last
				this.$emit('change', arr.join(','))
			}
		},
		moveNext() {
			let index = this.getIndexByUrl();
			if (index == this.fileList.length - 1) {
				this.$message.warn('已到最后~')
			} else {
				let curr = this.fileList[index].url;
				let next = this.fileList[index + 1].url;
				let arr = []
				for (let i = 0; i < this.fileList.length; i++) {
					if (i == index + 1) {
						arr.push(curr)
					} else if (i == index) {
						arr.push(next)
					} else {
						arr.push(this.fileList[i].url)
					}
				}
				this.currentImg = next
				this.$emit('change', arr.join(','))
			}
		},
		getIndexByUrl() {
			for (let i = 0; i < this.fileList.length; i++) {
				if (this.fileList[i].url === this.currentImg || encodeURI(this.fileList[i].url) === this.currentImg) {
					return i;
				}
			}
			return -1;
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
    getSuffix(url) {
      return url.split('.').pop().toLowerCase()
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
		getFilePercent(file) {
			let percent = Math.floor(file.percent || 0)
			if (percent < 0) {
				return 0
			}
			return percent > 100 ? 100 : percent
		},
		handleRemoveFile(file) {
			this.fileList = this.fileList.filter(item => item.uid !== file.uid)
			if (this.returnUrl) {
				this.handlePathChange()
			} else {
				this.newFileList = this.newFileList.filter(item => item.filePath !== file.response.message)
				this.$emit('change', this.newFileList)
			}
		}
	},
	mounted() {
		const moverObj = document.getElementById(this.containerId + '-mover');
		if (moverObj) {
			moverObj.addEventListener('mouseover', () => {
				this.moverHold = true
				this.moveDisplay = 'block';
			});
			moverObj.addEventListener('mouseout', () => {
				this.moverHold = false
				this.moveDisplay = 'none';
			});
		}

		let picList = document.getElementById(this.containerId) ? document.getElementById(this.containerId)
			.getElementsByClassName('ant-upload-list-picture-card') : [];
		if (picList && picList.length > 0) {
			picList[0].addEventListener('mouseover', (ev) => {
				ev = ev || window.event;
				let target = ev.target || ev.srcElement;
				if ('ant-upload-list-item-info' == target.className) {
					this.showMoverTask = false
					let item = target.parentElement
					this.left = item.offsetLeft
					this.top = item.offsetTop + item.offsetHeight - 50;
					this.moveDisplay = 'block';
					this.currentImg = target.getElementsByTagName('img')[0].src
				}

			});

			picList[0].addEventListener('mouseout', (ev) => {
				ev = ev || window.event;
				let target = ev.target || ev.srcElement;
				//console.log('移除',target)
				if ('ant-upload-list-item-info' == target.className) {
					this.showMoverTask = true
					setTimeout(() => {
						if (this.moverHold === false)
							this.moveDisplay = 'none';
					}, 100)
				}
				if ('ant-upload-list-item ant-upload-list-item-done' == target.className ||
					'ant-upload-list ant-upload-list-picture-card' == target.className) {
					this.moveDisplay = 'none';
				}
			})
			//---------------------------- end 图片左右换位置 -------------------------------------
		}
	},
	model: {
		prop: 'value',
		event: 'change'
	}
}
</script>

<style lang="less" scoped>
.uploadty-disabled {
	.ant-upload-list-item {
		.anticon-close {
			display: none;
		}

		.anticon-delete {
			display: none;
		}
	}
}

::v-deep .ant-upload-list-picture .ant-upload-list-item,
::v-deep .ant-upload-list-picture-card .ant-upload-list-item {
	height: 50px;
}

::v-deep .ant-upload-list-picture .ant-upload-list-item-thumbnail,
::v-deep .ant-upload-list-picture-card .ant-upload-list-item-thumbnail {
	width: 30px;
	height: 30px;
	line-height: 30px;
}

::v-deep .ant-upload-list-picture .ant-upload-list-item-thumbnail img,
::v-deep .ant-upload-list-picture-card .ant-upload-list-item-thumbnail img {
	width: 30px;
	height: 30px;
}

::v-deep .ant-upload-list-picture .ant-upload-list-item-name,
::v-deep .ant-upload-list-picture-card .ant-upload-list-item-name {
	line-height: 30px;
	padding-left: 31px;
}

::v-deep .ant-upload-list-picture .ant-upload-list-item-name-icon-count-1 {
	padding-right: 25px;
}

::v-deep .ant-upload-list-picture .ant-upload-list-item-card-actions.picture {
	top: 18px;
}

::v-deep .ant-upload-list-item-progress {
	width: 98%;
	padding-left: 32px;
}

::v-deep .ant-upload-list-picture .ant-upload-list-item-progress,
::v-deep .ant-upload-list-picture-card .ant-upload-list-item-progress {
	bottom: 5px;
	width: calc(98% - 24px);
	margin-top: 0;
	padding-left: 32px;
}


//---------------------------- begin 图片左右换位置 -------------------------------------
.uploadty-mover-mask {
	background-color: rgba(0, 0, 0, 0.5);
	opacity: .8;
	color: #fff;
	height: 28px;
	line-height: 28px;
}

//---------------------------- end 图片左右换位置 -------------------------------------
.custom-file-list {
	padding-top: 10px;
}

.file-card-item {
	display: flex;
	align-items: center;
	padding: 5px 10px;
	border: 1px solid #e8e8e8;
	border-radius: 5px;
	margin-bottom: 8px;
	background: #fff;
	position: relative;
	transition: all 0.3s;
	cursor: default;
	&.file-card-only-suffix {
		display:inline-flex;
    margin-right: 8px;
	}

		&.file-card-clickable {
			cursor: pointer;
		}

		&.file-card-clickable {
		cursor: pointer;
	}

	&.file-card-clickable:hover {
		border-color: #1890ff;
		box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
	}

	&.file-card-uploading {
		background: #fafafa;
	}

	.file-card-icon {
		// font-size: 25px;
		font-size: 15px;
		margin-right: 12px;
		flex-shrink: 0;
	}

	.file-card-info {
		flex: 1;
		min-width: 0;

		.file-card-name {
			// font-size: 14px;
			font-size: 11px;
			color: #333;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			padding-bottom: 1px;
		}

		.file-card-progress-wrap {
			display: flex;
			align-items: center;
			margin-top: 4px;
		}

		.file-card-progress {
			flex: 1;
			min-width: 0;
			margin-right: 8px;
		}

		.file-card-percent {
			color: #999;
			font-size: 11px;
			line-height: 1;
			flex-shrink: 0;
		}
	}

	.file-card-remove {
		position: absolute;
		top: -5px;
		right: -5px;
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: #ff4d4f;
		color: #fff;
		cursor: pointer;
		transition: all 0.3s;
		font-size: 12px;


	}
}
</style>

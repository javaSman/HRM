<template>
    <div class="information">
        <div class="header" v-if="false">
            <a-icon type="left" class="back-icon" @click="goBack" />
            <span class="back-text">返回上一级</span>
        </div>


        <div class="logo-section flex items-center justify-center gap-10">
            <img src="../../assets/logo-white.png" alt="logo" class="logo" />
            <div class="company-name">
                <div>博 罗 产 业 投 资 集 团</div>
                <div>广东博创供应链管理有限公司</div>
            </div>
        </div>

        <div class="form-title">请完善以下信息</div>
        <a-form-model ref="form" :model="form" :rules="rules" class="info-form">
            <a-form-model-item label="公司名称:" prop="name">
                <a-input v-model="form.name" placeholder="请输入公司名称" />
            </a-form-model-item>
            <a-form-model-item label="行业类型:" prop="type">
                <a-select v-model="form.type" placeholder="请选择行业类型" style="width: 100%" @change="onPrimaryTypeChange">
                    <a-select-option v-for="item in options" :key="item.value" :value="item.value">{{ item.label
                        }}</a-select-option>
                </a-select>
            </a-form-model-item>
            <a-form-model-item label="类别名称:" prop="typetwo">
                <a-select v-model="form.typetwo" placeholder="请选择类别名称" style="width: 100%"
                    :disabled="!secondaryOptions.length">
                    <a-select-option v-for="item in secondaryOptions" :key="item.value" :value="item.value">{{
                        item.label }}</a-select-option>
                </a-select>
            </a-form-model-item>

            <a-form-model-item label="入库品类:" prop="category">
                <a-select ref="categorySelect" v-model="form.category" mode="multiple" :showSearch="false"
                    placeholder="请选择入库品类" style="width: 100%">
                    <a-select-option value="建材类">建材类</a-select-option>
                    <a-select-option value="货物类">货物类</a-select-option>
                    <a-select-option value="服务类">服务类</a-select-option>
                </a-select>
            </a-form-model-item>

            <a-form-model-item label="联系方式:" prop="phoneNum">
                <a-input v-model="form.phoneNum" placeholder="请输入联系方式" />
            </a-form-model-item>

            <a-form-model-item label="成立时间:" prop="clTime">
                <a-date-picker v-model="form.clTime" placeholder="请选择成立时间" style="width: 100%" format="YYYY-MM-DD"
                    valueFormat="YYYY-MM-DD" />
            </a-form-model-item>

            <a-form-model-item label="法人信息:" prop="frInfo">
                <a-input v-model="form.frInfo" placeholder="请输入法人信息" />
            </a-form-model-item>

            <a-form-model-item label="注册地址:" prop="zcAddress">
                <a-input v-model="form.zcAddress" placeholder="请输入注册地址" />
            </a-form-model-item>

            <a-form-model-item label="注册资本(元):" prop="zcCapital">
                <a-input-number v-model="form.zcCapital" placeholder="请输入注册资本"
                    :formatter="value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                    :parser="value => value.replace(/\$\s?|(,*)/g, '')" style="width: 100%" :min="0" />
            </a-form-model-item>

            <a-form-model-item label="年销售额(元):" prop="annualSales">
                <a-input-number v-model="form.annualSales" placeholder="请输入年销售额"
                    :formatter="value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                    :parser="value => value.replace(/\$\s?|(,*)/g, '')" style="width: 100%" :min="0" />
            </a-form-model-item>

            <a-form-model-item label="近期主要业绩:" prop="mainPerformance">
                <a-textarea v-model="form.mainPerformance" placeholder="请输入近期主要业绩" :rows="4" />
            </a-form-model-item>

            <a-form-model-item label="企业所在地:" prop="companyLocation">
                <div class="location-input">
                    <a-input v-model="form.address" placeholder="请输入企业所在地" @pressEnter="handleSearch(form.address)" />
                    <div class="location-icon" @click="getNowGps">
                        <a-icon type="environment" />
                    </div>
                </div>
            </a-form-model-item>
            <div style="color: #fff;margin-bottom: 2px;">
                {{ form.companyLocation }}
            </div>
            <ZtPcWzMap ref="ZtPcWzMap" :rwwz="searchAddress" @addressR="getZB"
                :rwXY="{ longitude: form.lng, latitude: form.lat }" style="height: 280px;width: 100%;">
            </ZtPcWzMap>

            <a-form-model-item class="submit-section">
                <a-button type="primary" class="submit-btn" @click="onSubmit">
                    提交
                </a-button>
            </a-form-model-item>
        </a-form-model>
    </div>
</template>
<script>
import ZtPcWzMap from '@/components/common/wzMap/index.vue'
import { postAction } from '@/api/manage'
import options from './options';
export default {
    name: 'Information',
    components: {
        ZtPcWzMap
    },
    data() {
        return {
            options,
            secondaryOptions: [],
            rwwz: '',
            rwXY: {
                lng: '',
                lat: ''
            },
            searchAddress: "",
            form: {
                name: '',              // 公司名称
                type: undefined,              // 行业类型
                typetwo: undefined,           // 行业类型2
                category: [],          // 入库品类（多选）
                phoneNum: '',          // 联系方式
                clTime: '',            // 成立时间
                frInfo: '',            // 法人信息
                zcAddress: '',         // 注册地址
                zcCapital: undefined,  // 注册资本
                annualSales: undefined, // 年销售额
                mainPerformance: '',   // 近期主要业绩
                companyLocation: '',   // 企业所在地
                address: '',           // 详细地址
                lng: '',               // 经度
                lat: '',               // 纬度
            },
            //    form: {"name":"正图科技","type":"互联网","category":"58","phoneNum":"13800138000","clTime":"2026-02-09","frInfo":"法人信息","zcAddress":"注册","zcCapital":"1000000","annualSales":"1000000","mainPerformance":"近期产品","companyLocation":"广东省惠州市博罗县罗阳街道罗阳镇东山公园","address":"","lng":"114.301365","lat":"23.170908"},
            rules: {
                name: [
                    { required: true, message: '请输入公司名称', trigger: ['blur'] },
                ],
                type: [
                    { required: true, message: '请选择行业类型', trigger: ['blur', 'change'] },
                ],
                typetwo: [
                    { required: true, message: '请选择类别名称', trigger: ['blur', 'change'] },
                ],
                category: [
                    { required: true, message: '请选择入库品类', trigger: ['blur', 'change'], type: 'array' },
                ],
                phoneNum: [
                    { required: true, message: '请输入联系方式', trigger: ['blur'] },
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: ['blur', 'change'] }
                ],
                clTime: [
                    { required: true, message: '请选择成立时间', trigger: ['change'] },
                ],
                frInfo: [
                    { required: true, message: '请输入法人信息', trigger: ['blur'] },
                ],
                zcAddress: [
                    { required: true, message: '请输入注册地址', trigger: ['blur'] },
                ],
                zcCapital: [
                    { required: true, message: '请输入注册资本', trigger: ['blur'] },
                ],
                annualSales: [
                    { required: true, message: '请输入年销售额', trigger: ['blur'] },
                ],
                mainPerformance: [
                    { required: true, message: '请输入近期主要业绩', trigger: ['blur'] },
                ],
                companyLocation: [
                    { required: true, message: '请选择企业所在地', trigger: ['change'] },
                ],
            },
        }
    },
    mounted() {
        // 防止移动端 select 弹出键盘
        this.$nextTick(() => {
            const selectInputs = document.querySelectorAll('.ant-select-search__field');
            selectInputs.forEach(input => {
                input.setAttribute('readonly', 'readonly');
                input.setAttribute('unselectable', 'on');
            });
        });
    },
    methods: {
        onPrimaryTypeChange(value) {
            // 清空二级选项
            this.form.typetwo = undefined;
            // 根据一级选项更新二级选项
            const selectedOption = this.options.find(item => item.value === value);
            this.secondaryOptions = selectedOption ? selectedOption.children : [];
        },
        onChange(value) {
            console.log(value);
        },
        goBack() {
            this.$router.go(-1);
        },
        getZB(item) {
            console.log('item---------', item)
            this.form.lng = item.x
            this.form.lat = item.y
            this.form.companyLocation = item.rwwz
        },
        getNowGps() {
            this.$refs.ZtPcWzMap.getNowGps()
        },
        handleSearch(value) {
            this.$refs.ZtPcWzMap.setMapCenter(value)
            // this.searchAddress = value;
        },
        onSubmit() {
            this.$refs.form.validate(valid => {
                if (valid) {
                    const loading = this.$message.loading('提交中...', 0);
                    const data = JSON.parse(JSON.stringify(this.form))

                    // // 组合行业类型
                    // if (data.type && data.typetwo) {
                    //     data.type = data.type + ' - ' + data.typetwo
                    // }
                    if (data.category.length) {
                        data.category = data.category.join(',')
                    }
                    postAction('/info/ztInfoRegistration/add', data).then(res => {
                        loading();
                        if (res.success) {
                            this.$message.success('提交成功！');
                            // 重置表单
                            this.form = {
                                name: '',
                                type: undefined,              // 行业类型
                                typetwo: undefined,           // 行业类型2
                                category: [],          // 入库品类（多选）
                                phoneNum: '',
                                clTime: '',
                                frInfo: '',
                                zcAddress: '',
                                zcCapital: undefined,
                                annualSales: undefined,
                                mainPerformance: '',
                                companyLocation: '',
                                address: '',
                                lng: '',
                                lat: '',
                            }
                            this.secondaryOptions = [];
                            this.$refs.form.resetFields();
                        } else {
                            this.$message.error(res.message || '提交失败，请重试');
                        }
                    }).catch(err => {
                        loading();
                        console.error('提交失败:', err);
                        this.$message.error('提交失败，请重试');
                    });
                } else {
                    this.$message.error('请完善表单信息');
                    return false;
                }
            });
        },
    }
}
</script>
<style lang="less" scoped>
.information {
    min-height: 100vh;
    background-color: linear-gradient(180deg, #1a237e 0%, #0d47a1 100%);
    background: url(../../assets/tb.png) no-repeat center;
    background-size: 100% 100%;
    padding-bottom: 30px;

    .header {
        padding: 15px 20px;
        display: flex;
        align-items: center;
        color: #fff;

        .back-icon {
            font-size: 18px;
            margin-right: 8px;
        }

        .back-text {
            font-size: 14px;
        }
    }

    .logo-section {
        text-align: center;
        padding: 20px 0;

        .logo {
            width: 80px;
            height: 80px;
            margin-bottom: 15px;
        }

        .company-name {
            color: #fff;
            font-size: 20px;
            line-height: 1.6;
            font-weight: 700;
        }
    }

    .form-title {
        text-align: center;
        color: #fff;
        font-size: 16px;
        margin: 20px 0;
        font-weight: 500;
    }

    .info-form {
        padding: 0 9vw;

        /deep/ .ant-form-item-label>label {
            color: #fff;
            font-size: 14px;
            // margin-bottom: 6px;
            margin-bottom: 1px;
        }

        /deep/ .ant-form-item {
            // margin-bottom: 12px;
            margin-bottom: 5px;
        }

        /deep/ .ant-input,
        /deep/ .ant-input-number,
        /deep/ .ant-select-selection,
        /deep/ .ant-calendar-picker-input,
        /deep/ .ant-calendar-picker,
        /deep/ .ant-input-textarea textarea {
            background: #fff;
            border: none;
            border-radius: 4px;
            padding: 12px 15px;
            font-size: 14px;
            color: #333;

            &::placeholder {
                color: #bbb;
            }
        }

        /deep/ .ant-calendar-picker {
            padding: 0;
        }

        /deep/ .ant-input-number {
            padding: 0;
        }

        /deep/ .ant-select-selection {
            padding: 0;
            padding-top: 1px;
        }

        /deep/ .ant-input-textarea textarea {
            min-height: 100px;
        }


        .location-input {
            position: relative;

            .location-icon {
                position: absolute;
                right: 15px;
                top: 50%;
                transform: translateY(-50%);
                color: #1890ff;
                font-size: 20px;
                cursor: pointer;
            }
        }

        // .map-container {
        //     margin: 20px 0;
        //     border-radius: 8px;
        //     overflow: hidden;

        //     .map {
        //         width: 100%;
        //         height: 200px;
        //         // background: #e0e0e0;
        //         display: flex;
        //         align-items: center;
        //         justify-content: center;
        //         // color: #999;
        //     }
        // }

        .submit-section {
            margin-top: 30px;
            text-align: center;

            .submit-btn {
                width: 200px;
                height: 45px;
                background: linear-gradient(90deg, #ffa726 0%, #ff9800 100%);
                border: none;
                border-radius: 25px;
                font-size: 16px;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);

                &:hover {
                    background: linear-gradient(90deg, #ff9800 0%, #f57c00 100%);
                }
            }
        }
    }
}

/deep/ .ant-form-item-control {
    line-height: 22px;
}

/deep/ .ant-form-explain {
    margin-top: 2px;
}

// 防止移动端 select 弹出键盘
/deep/ .ant-select-search__field {
    pointer-events: none !important;
    cursor: default !important;
}

/deep/ .ant-select-selection__rendered {
    pointer-events: none !important;
}

/deep/ .ant-select-selection {
    input {
        pointer-events: none !important;
        cursor: default !important;
    }
}

// 隐藏多选框中的删除按钮
/deep/ .ant-select-selection__choice__remove {
    display: none !important;
}

/deep/ .ant-select-remove-icon {
    display: none !important;
}

/deep/ .ant-select-selection--multiple .ant-select-selection__choice {
    padding: 0 10px 0 10px;
}
</style>
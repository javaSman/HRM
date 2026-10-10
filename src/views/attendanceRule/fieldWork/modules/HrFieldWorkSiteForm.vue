<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container>
      <a-form-model
        ref="form"
        slot="detail"
        layout="vertical"
        :model="model"
        :rules="validatorRules"
        class="fieldwork-site-form"
      >
        <a-row :gutter="24" class="fieldwork-form-row">
          <!-- ===== 左侧：基本信息 ===== -->
          <a-col :xs="24" :sm="12" class="form-col-left">
            <div class="form-section-title">
              <span>基本信息</span>
            </div>

            <a-row :gutter="16">
              <a-col :span="24">
                <a-form-model-item label="外勤点名称" prop="wqd" :required="true">
                  <a-input v-model="model.wqd" :disabled="formDisabled" placeholder="请输入外勤点名称" />
                </a-form-model-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :span="24">
                <a-form-model-item label="地址" prop="address" :required="true">
                  <a-input v-model="model.address" readOnly :disabled="formDisabled" placeholder="请输入地址" />
                </a-form-model-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="经度" prop="longitude" :required="true">
                  <a-input v-model="model.longitude" readOnly :disabled="formDisabled" placeholder="请选择地图位置" />
                </a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="纬度" prop="latitude" :required="true">
                  <a-input v-model="model.latitude" readOnly :disabled="formDisabled" placeholder="请选择地图位置" />
                </a-form-model-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="上班时间" prop="sbTime" :required="true">
                  <a-time-picker
                    placeholder="请选择上班时间"
                    :disabled="formDisabled"
                    v-model="model.sbTime"
                    format="HH:mm"
                    value-format="HH:mm"
                    style="width: 100%"
                  />
                </a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="下班时间" prop="xbTime" :required="true">
                  <a-time-picker
                    placeholder="请选择下班时间"
                    :disabled="formDisabled"
                    v-model="model.xbTime"
                    format="HH:mm"
                    value-format="HH:mm"
                    style="width: 100%"
                  />
                </a-form-model-item>
              </a-col>
            </a-row>
          </a-col>

          <!-- ===== 右侧：地图选点 ===== -->
          <a-col :xs="24" :sm="12" class="form-col-right" v-if="!formDisabled">
            <div class="form-section-title">
              <span>地图选点</span>
            </div>
            <!-- 地址搜索输入框（与地图联动） -->
            <div class="location-input">
              <a-select
                v-model="searchAddress"
                show-search
                :filter-option="false"
                :not-found-content="searching ? undefined : null"
                placeholder="输入地址搜索，选择后定位"
                @search="handleSearchDebounce"
                @change="handleSelectAddress"
                :disabled="formDisabled"
              >
                <a-spin v-if="searching" slot="notFoundContent" size="small" />
                <a-select-option
                  v-for="item in addressOptions"
                  :title="item.address"
                  :key="item.address"
                  :value="item.address"
                >
                  {{ item.address }}
                </a-select-option>
              </a-select>
              <div class="location-icon" @click="getNowGps">
                <a-icon type="environment" />
              </div>
            </div>
            <ZtPcWzMap ref="ZtPcWzMap" @addressR="getZB" :rwXY="mapCenter" style="height: 350px; width: 100%">
            </ZtPcWzMap>
          </a-col>
        </a-row>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>
import ZtPcWzMap from '@/components/common/wzMap/index.vue'
import { httpAction, getAction } from '@/api/manage'

const baseUrl = 'https://api.newayz.com/location/scenario/v1'
const accessTokenPoi = 'TBSilqkebqqDGRYNlyFM1kDqSa1uByQt'

export default {
  name: 'HrFieldWorkSiteForm',
  components: {
    ZtPcWzMap,
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
    title: {
      type: String,
      default: '',
      required: false,
    },
  },
  data() {
    return {
      confirmLoading: false,
      searchAddress: '',
      addressOptions: [], // 地址搜索结果列表
      searching: false, // 搜索加载状态
      searchTimer: null, // 防抖定时器
      model: {
        wqd: '',
        address: '',
        longitude: '',
        latitude: '',
        sbTime: '',
        xbTime: '',
      },
      validatorRules: {
        wqd: [{ required: true, message: '请输入外勤点名称', trigger: 'blur' }],
        address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
        longitude: [{ required: true, message: '请选择地图位置获取经度', trigger: 'blur' }],
        latitude: [{ required: true, message: '请选择地图位置获取纬度', trigger: 'blur' }],
        sbTime: [{ required: true, message: '请选择上班时间', trigger: 'change' }],
        xbTime: [{ required: true, message: '请选择下班时间', trigger: 'change' }],
      },
      url: {
        add: '/hr_wqd/hrWqd/add',
        edit: '/hr_wqd/hrWqd/edit',
        queryById: '/hr_wkd/hrWqd/queryById',
      },
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
    mapCenter() {
      if (this.model.longitude && this.model.latitude) {
        return { longitude: this.model.longitude, latitude: this.model.latitude }
      }
      return { longitude: '', latitude: '' }
    },
  },
  created() {
    this.modelDefault = JSON.parse(JSON.stringify(this.model))
  },
  methods: {
    /**
     * 地图选址回调
     */
    getZB(item) {
      this.model.longitude = String(item.x)
      this.model.latitude = String(item.y)
      if (item.rwwz) {
        this.model.address = item.rwwz
        //this.searchAddress = item.rwwz
      }
      this.$forceUpdate()
      // 地图选址完成后，手动校验相关必填项
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.validateField('address')
          this.$refs.form.validateField('longitude')
          this.$refs.form.validateField('latitude')
        }
      })
    },

    /**
     * 地址搜索防抖（500ms）
     */
    handleSearchDebounce(value) {
      // 清除之前的定时器
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }

      // 如果搜索值为空，清空列表
      if (!value || value.trim() === '') {
        this.addressOptions = []
        return
      }

      // 设置新的防抖定时器
      this.searchTimer = setTimeout(() => {
        this.handleSearch(value)
      }, 500)
    },

    /**
     * 地址搜索：调用地图API获取搜索结果
     */
    handleSearch(value) {
      if (!value || value.trim() === '') {
        this.addressOptions = []
        return
      }

      this.searching = true

      getAction(baseUrl + '/placesearch', {
        access_key: accessTokenPoi,
        city: 'all',
        city_code: '',
        radius: 1,
        name: value,
        page_index: 1,
        page_size: 20,
      })
        .then((result) => {
          console.log('搜索结果:', result)
          if (result && result.length > 0) {
            // 格式化搜索结果
            this.addressOptions = result.map((item) => ({
              address: `${item.name} (${item.address.name})`,
              geoPoint: item.geoPoint,
              longitude: item.geoPoint.split(',')[0],
              latitude: item.geoPoint.split(',')[1],
            }))
          } else {
            this.addressOptions = []
          }
        })
        .catch((error) => {
          console.error('搜索失败:', error)
          this.addressOptions = []
        })
        .finally(() => {
          this.searching = false
        })
    },

    /**
     * 选择地址后定位
     */
    handleSelectAddress(value) {
      if (!value) {
        this.searchAddress = ''
        return
      }

      // 从选项列表中找到选中的地址
      const selected = this.addressOptions.find((item) => item.address === value)
      if (selected) {
        console.log('选中地址:', selected)

        // 设置经纬度和地址
        this.model.longitude = selected.longitude
        this.model.latitude = selected.latitude
        this.model.address = selected.address
        this.searchAddress = selected.address

        // 强制更新视图
        this.$forceUpdate()

        // 调用地图组件的定位方法
        if (this.$refs.ZtPcWzMap && this.$refs.ZtPcWzMap.WzMaps) {
          const lng = selected.longitude
          const lat = selected.latitude

          // 设置地图中心
          this.$refs.ZtPcWzMap.WzMaps.setCenter([lng, lat])
          this.$refs.ZtPcWzMap.WzMaps.setZoom(15)

          // 设置标记点
          if (this.$refs.ZtPcWzMap.marker) {
            this.$refs.ZtPcWzMap.marker.setLngLat([lng, lat])
          }
          if (this.$refs.ZtPcWzMap.popup) {
            this.$refs.ZtPcWzMap.popup.setLngLat([lng, lat]).setText(selected.address)
          }
        }

        // 清除校验错误（因为数据已经正确设置）
        this.$nextTick(() => {
          if (this.$refs.form) {
            this.$refs.form.clearValidate(['address', 'longitude', 'latitude'])
          }
        })
      }
    },

    /**
     * 获取当前 GPS 定位
     */
    getNowGps() {
      if (this.$refs.ZtPcWzMap && this.$refs.ZtPcWzMap.getNowGps) {
        this.$refs.ZtPcWzMap.getNowGps()
      }
    },

    add() {
      this.edit(this.modelDefault)
    },
    edit(record) {
      this.model = Object.assign({}, record)
      this.searchAddress = this.model.address || ''
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
        // 地图回显
        if (this.model.longitude && this.model.latitude) {
          this.$refs.ZtPcWzMap &&
            this.$refs.ZtPcWzMap.setMarker &&
            this.$refs.ZtPcWzMap.setMarker({
              lng: this.model.longitude,
              lat: this.model.latitude,
            })
        }
      })
    },
    submitForm() {
      const that = this
      this.$refs.form.validate((valid) => {
        if (valid) {
          that.$emit('submit', true)
          let httpurl = ''
          let method = ''
          if (!this.model.id) {
            httpurl += this.url.add
            method = 'post'
          } else {
            httpurl += this.url.edit
            method = 'put'
          }
          httpAction(httpurl, { ...this.model }, method)
            .then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                that.$emit('ok')
              } else {
                that.$message.warning(res.message)
              }
            })
            .finally(() => {
              that.$emit('submit', false)
            })
        }
      })
    },
  },
}
</script>

<style scoped lang="less">
.fieldwork-site-form {
  min-height: 400px;
}

/* ===== 全局表单项紧致 ===== */
.fieldwork-site-form /deep/ .ant-form-item {
  margin-bottom: 12px;
}

.fieldwork-site-form /deep/ .ant-form-item-label {
  padding-bottom: 4px;
  line-height: 20px;
}

.fieldwork-site-form /deep/ .ant-form-item-label > label {
  color: #555;
  font-size: 13px;
}

.fieldwork-site-form /deep/ .ant-form-item-required::before {
  color: #ff4d4f;
  font-size: 14px;
  margin-right: 2px;
}

/* ===== 左右两栏布局 ===== */
.fieldwork-form-row {
  display: flex;
  flex-wrap: wrap;
}

.form-col-left {
  border-right: 1px dashed #e6e8eb;
  padding-right: 24px;
}

.form-col-right {
  padding-left: 8px;
}

@media (max-width: 768px) {
  .form-col-left {
    border-right: 0;
    padding-right: 0;
    margin-bottom: 16px;
  }

  .form-col-right {
    padding-left: 0;
  }
}

/* ===== 区块标题 ===== */
.form-section-title {
  position: relative;
  margin: 0 0 16px;
  padding: 0 0 10px;
  border-bottom: 1px solid #e6e8eb;
  color: #1f2937;
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
}

/* ===== 地图地址搜索输入框（与 information/index.vue 保持一致） ===== */
.location-input {
  position: relative;
  margin-bottom: 8px;

  .location-icon {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #2d78ff;
    font-size: 18px;
    cursor: pointer;

    &:hover {
      color: #00b4d8;
    }
  }
}
</style>

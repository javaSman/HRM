<template>
    <div class="WzMapBox">
        <div id="WzMap"></div>
    </div>
</template>

<script>
import { getAction, postAction, deleteAction } from '@/api/manage'

const baseUrl = 'https://api.newayz.com/location/scenario/v1' //接口请求
const baseApiUrl = 'https://location-dev.newayz.com' //地图服务地址
const accessToken = 'WsZmI1z7wyzbqhSntF0iFrvplyD8UHmv' //地图秘钥
const accessTokenGis = '2XHtHEJcKe2kBWiGJzu9hFKmh7u7ZURD' //定位秘钥
const accessTokenPoi = 'TBSilqkebqqDGRYNlyFM1kDqSa1uByQt' //查询秘钥
import {
    loadData,
    getLocation,
    reverseGeocode,
    geocode,
    poiSearch,
    nearbySearch,
    transferCoord,
} from './js/wz_location.min.js'

// 指定 accessToken，用于服务鉴权
aimap.accessToken = accessToken
// 指定 baseApiUrl，用于指定服务地址，当处于私有化部署的环境中时，务必注意修改此项
aimap.baseApiUrl = baseApiUrl

export default {
    name: 'WzMap',
    props: {
        zoom: {
            type: Number,
            default: 15,
            required: false,
        },
        rwwz: {
            type: String,
            default: '',
            required: false,
        },
        rwXY: {
            type: Object,
            default: () => {
                return {}
            },
            required: false,
        },
        // 表单禁用
        disabled: {
            // 是否禁止操作
            type: Boolean,
            default: false,
            required: false,
        },
    },
    data() {
        return {
            logMapinfoOn: true,
            shake: false,
            WzMaps: null,
            marker: null,
            popup: null,
            MapLocation: '',
            MapPoint: '',
            seFD: false,
        }
    },
    computed: {},
    watch: {
        rwwz: {
            handler(v) {
                this.$nextTick(() => {
                    if (this.disabled && v) {
                        this.popup.setText(v)
                        return
                    }
                    if (v && !this.rwXY.longitude) {
                        this.setMapCenter(v)
                    }
                })
            },
            deep: true,
            immediate: true
        },
        rwXY: {
            handler(v) {
                this.$nextTick(() => {

                    if (!v.longitude) {
                        return
                    }
                    let location = [v.longitude, v.latitude]

                    if (this.disabled) {
                        setTimeout(() => {
                            this.WzMaps.setCenter([location[0], location[1]])
                            this.marker.setLngLat([location[0], location[1]]) // 调整marker位置
                            this.popup.setLngLat(location) // 调整popup位置
                        }, 1000);

                        return
                    }
                    let MapPoint = {
                        longitude: location[0],
                        latitude: location[1]
                    }
                    // 处理抖动飞行问题
                    this.shake = true
                    console.log('MapPoint', MapPoint)
                    this.allAround(MapPoint)
                    setTimeout(() => {
                        this.shake = false
                    }, 3000)
                })

            },
            deep: true,
            immediate: true
        },
    },
    created() {
        loadData(accessTokenGis)
        console.log(11111)
    },
    mounted() {
        console.log(22222)

        this.WzMaps = new aimap.Map({
            container: 'WzMap',
            // 地图中心点
            center: [116.397463, 39.909187],
            // 地图缩放级别
            zoom: this.zoom,
            // 地图倾斜角度
            pitch: 0,
            // 地图旋转角度
            bearing: 0,
            // 地图样式
            style: 'aimap://styles/aimap/normal-v4',

        })
        console.log(33333)

        // 创建一个默认的 Marker
        this.marker = new aimap.Marker({
            color: 'red',
            scale: 0.8,
        }).setLngLat([116.397463, 39.909187]).addTo(this.WzMaps)
        this.popup = new aimap.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: [0, -30],
        }).setLngLat([116.397463, 39.909187]).addTo(this.WzMaps)

        if (!this.disabled) {
            // 若无任务位置/坐标，则自动定位
            console.log(this.rwwz, this.rwXY)
            console.log('!this.rwwz && !this.rwXY.longitude', !this.rwwz && !this.rwXY.longitude)
            if (!this.rwwz && !this.rwXY.longitude) this.getNowGps()
            //绑定地图移动与缩放事件
            this.WzMaps.on('move', this.logMapinfo)
            this.WzMaps.on('zoom', this.logMapinfo)
            console.log(444)

            return
        } else {

        }
    },
    methods: {
        // 获取当前定位
        getNowGps() {
            console.log('获取当前定位')
            let that = this
            getLocation('gcj02')
                .then((data) => {
                    console.log('定位返回信息结果:', data)
                    // 此处可进行地址展示或后续业务逻辑
                    that.MapLocation = data.location
                    console.log(that.MapLocation)
                    that.MapPoint = data.location.position.point
                    that.WzMaps.setCenter([that.MapPoint.longitude, that.MapPoint.latitude])
                    that.marker.setLngLat([that.MapPoint.longitude, that.MapPoint.latitude]) //调整marker位置

                    that.allAround(that.MapPoint)
                })
                .catch((error) => {
                    console.error('定位失败:', error)
                })
        },
        
        // 获取地点
        allAround(MapPoint) {
            if (this.seFD) {
                return
            }
            this.seFD = !this.seFD
            setTimeout(() => {
                this.seFD = false
            }, 1000)

            let { longitude, latitude } = MapPoint
            let location = { longitude: Number(longitude), latitude: Number(latitude), accuracy: 30 }
            //都需要数字类型  参数一：坐标 参数二：当前坐标的坐标系 参数三：返回坐标系
            reverseGeocode(location, 'gcj02', 'gcj02')
                .then((data) => {
                    console.log(`请求成功，返回数据：`, data)
                    this.popup.setText(data.location.address.name)

                    if (!this.disabled) {

                        // 处理抖动飞行问题 区分地图拖拽的时候不处理
                        if (this.shake) {
                            this.WzMaps.setCenter([longitude, latitude])
                            this.marker.setLngLat([longitude, latitude]) //调整marker位置
                            this.popup.setLngLat([longitude, latitude]) //调整popup位置
                        }

                        // this.$emit('addressR',data)
                        this.$emit('addressR', {
                            rwwz: data.location.address.name,
                            x: data.location.position.point.longitude,
                            y: data.location.position.point.latitude,
                        })
                    }
                })
                .catch((error) => {
                    console.log(`请求失败：${error}`)
                })
        },
        // 查询位置 和经纬度
        setMapCenter(name) {
            getAction(baseUrl + '/placesearch', {
                access_key: accessTokenPoi,
                city: 'all',
                city_code: '',
                radius: 1, // 范围半径 米
                name: name,
                page_index: 1,
                page_size: 20,
            })
                .then((result) => {
                    console.log('搜索结果:', result)
                    let item = result[0]
                    let location = item.geoPoint.split(',')

                    this.WzMaps.setCenter([location[0], location[1]])
                    this.marker.setLngLat([location[0], location[1]]) //调整marker位置
                    this.MapPoint = {
                        longitude: location[0],
                        latitude: location[1],
                    }

                    this.popup.setText(item.address.name).setLngLat([location[0], location[1]]) //调整popup位置

                    if (!this.disabled) {
                        // this.$emit('addressR',item)
                        this.$emit('addressR', {
                            rwwz: item.address.name,
                            x: location[0],
                            y: location[1],
                        })
                    }
                })
                .catch((error) => {
                    console.error('搜索失败:', error)
                })
        },
    },
}
</script>

<style scoped>
.WzMapBox {
    width: 100%;
    height: 100%;
    display: flex;
    position: relative;
}

#WzMap {
    flex: 1;
    position: relative;
    top: 0;
    left: 0;
    z-index: 1;
}
</style>

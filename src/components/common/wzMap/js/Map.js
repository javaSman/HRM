let logMapinfoOn = true

// 指定 accessToken，用于服务鉴权
aimap.accessToken = accessToken;
// 指定 baseApiUrl，用于指定服务地址，当处于私有化部署的环境中时，务必注意修改此项
aimap.baseApiUrl = baseApiUrl;

// 声明地图初始化
const map = new aimap.Map({
    container: 'map',
    // 地图中心点
    center: [116.397463, 39.909187],
    // 地图缩放级别
    zoom: 13,
    // 地图倾斜角度
    pitch: 0,
    // 地图旋转角度
    bearing: 0,
    // 地图样式
    style: 'aimap://styles/aimap/white-21Q4-v1',
});
// 创建一个默认的 Marker
const marker = new aimap.Marker({
    color: 'red',
    scale: 0.8,
}).setLngLat([116.397463, 39.909187]).addTo(map);

//显示地图层级与中心点信息
function logMapinfo() {
    const zoom = map.getZoom(); //获取当前地图级别
    const center = map.getCenter(); //获取当前地图中心位置
    marker.setLngLat([center.lng, center.lat]);//调整marker位置

    if (logMapinfoOn && MapLocation) {
        MapPoint = {
            longitude: center.lng.toFixed(5),
            latitude: center.lat.toFixed(5),
        }
        allAround() 
        console.log(`地图层级：${zoom.toFixed(1)};坐标：${center.lng.toFixed(5)}, ${center.lat.toFixed(5)};`);

    }
};
//绑定地图移动与缩放事件
map.on('move', logMapinfo);
map.on('zoom', logMapinfo);
logMapinfo();
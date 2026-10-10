import proj4 from 'proj4';
/**
 *                                       == WGS-84坐标系==
 *     WGS84 = "WGS84",
 *     WGS1984 = "WGS84",
 *     EPSG4326 = "WGS84",
 *
 *                  ==  GCJ-02坐标系，google中国地图、soso地图、aliyun地图、mapabc地图和高德地图所用的经纬度坐标 ==
 *     GCJ02 = "GCJ02",
 *     AMap = "GCJ02",
 *
 *                                   ======= 百度坐标系  ======
 *     BD09 = "BD09",
 *     BD09LL = "BD09",
 *     Baidu = "BD09",
 *     BMap = "BD09",
 *     BD09MC = "BD09MC",  单位米
 *     BD09Meter = "BD09MC",
 *
 *                        ========= Web Mercator投影，墨卡托投影，同EPSG3857，单位：米  ==========
 *     EPSG3857 = "EPSG3857",
 *     EPSG900913 = "EPSG3857",
 *     EPSG102100 = "EPSG3857",
 *     WebMercator = "EPSG3857",
 *     WM = "EPSG3857"
 */
import gcoord from 'gcoord';
const GcoordTypes =gcoord.CRSTypes;
const proj4Type={
  WGS84:new proj4.Proj('EPSG:4326'),
  CGCS2000:'+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=38500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
};
/**
 * 坐标类型
 * @type {{wgs84: Projection, cgcs2000: string}}
 */
export const EPSGType={
  // proj4  定义的类型
  WGS84:proj4Type.WGS84,
  CGCS2000:proj4Type.CGCS2000,  // 中国 2000国家大地坐标系

  // gcoord 定义的类型
  GCJ02:GcoordTypes.GCJ02, // GCJ-02坐标系，google中国地图、soso地图、aliyun地图、mapabc地图和高德地图所用的经纬度坐标
  WebMercator:GcoordTypes.EPSG3857, // Web Mercator投影，墨卡托投影，同EPSG3857，单位：米
  Baidu:GcoordTypes.Baidu,  // 百度坐标系
  BD09MC:GcoordTypes.BD09MC,  // 百度： BD-09米制坐标，百度地图采用的米制坐标，单位：米
}

/**
 * 实体类型
 * @type {{LineString: string, Point: string, Polygon: string}}
 */
const entityType={
  Polygon:"Polygon",
  Point:"Point",
  LineString:"LineString",
}

/**
 * 判断坐标类型是否申明
 * @param enumType
 * @param item
 * @returns {boolean}
 */
function checkType(enumType,item){
  for (let key in enumType) {
    if (enumType[key]===item){
      return true
    }
  }
  return false;
}

/**
 * 坐标转换类
 */
class CoordinateTransform{

  constructor(fromProj,toProj){
    this.fromProj=fromProj;
    this.toProj=toProj;
    if (fromProj === toProj){
      throw `同一个坐标系，无需转化，请检查初始化是否正确`;
    }
    // 如果都存在 gcoord 定义的类型中 那处理处理这个转坐标的就是gcoord库
    if (checkType(GcoordTypes,fromProj) && checkType(GcoordTypes,toProj)){
      this.handel=(coord)=>{
        return  gcoord.transform(coord, fromProj, toProj);
      }
      return;
    }
    // 如果都存在 proj4Type 定义的类型中 那处理处理这个转坐标的就是proj4库
    if (checkType(proj4Type,fromProj) && checkType(proj4Type,toProj)){
      this.handel=(coord)=>{
        return  proj4(this.fromProj,toProj,coord);
      }
      return;
    }
    // 剩下的就是 一个存在于gcoord类型 一个存在于proj4Type
    if (checkType(GcoordTypes,fromProj)){
      // fromProj 在一个存在于gcoord类型的  toProj 是proj4Type类型的处理方法
      this.handel=(coord)=>{
        let arr = gcoord.transform(coord, fromProj, GcoordTypes.WGS84);
        return  proj4(proj4Type.WGS84,toProj,arr);
      }

    }else {
      // fromProj 在一个存在于proj4Typ类型的  toProj 是gcoord类型的处理方法
      this.handel=(coord)=>{
        let arr = proj4(fromProj,proj4Type.WGS84,coord);
        return gcoord.transform(arr, GcoordTypes.WGS84,toProj );
      }
    }

  }

  /**
   * 坐标转换 传递一个[xxx,xxx] 数组长度为2的坐标点
   * @param coord
   */
  transformArr(coord){
    return this.handel(coord);
  }

  /**
   * 坐标转化 传递一个{x:xx ,y:xxx } 对象转换坐标
   * @param x
   * @param y
   * @returns {{x: *, y: *}}
   */
  transformXY(x,y){
    let arr =this.handel([x,y]);
    return {
     x:arr[0],
     y:arr[1]
    };
  }

  /**
   * 坐标转化传入一个多维数组（多维数组的最小单位是一个[xxx,xxx] 数组长度为2的数组构成）
   */
  transformMultidimensionalArr(coord){
    if (!Array.isArray(coord)){
      throw `请检查数据结构是否正确，是一个多维数组，并且最后一个数组的长度必须大于等于2`;
    }
    let arr = [];
    //如果是一个数组 且下面元素不是一个 typeof value === 'number'
    if (coord.length >= 2 && typeof coord[0]==='number' && typeof coord[1]==='number') {
      return this.transformArr([coord[0],coord[1]]);
    } else {
      coord.forEach(subArr=>{
        arr.push(this.transformMultidimensionalArr(subArr));
      })
    }
    return arr;
  }

  /**
   * 传递一个FeatureCollection对象 进行坐标转化后返回
   */
  transformByFeatureCollection(obj){
    let bbox = obj.bbox;
    let features = obj.features;
    if (bbox && Array.isArray(bbox) && bbox.length>=2 && bbox.length%2===0){
      let tempBbox = [];
      for (let i = 0; i <  bbox.length; i+=2) {
        let xyBbj = this.transformXY(bbox[i],bbox[i+1])
        tempBbox.push(xyBbj.x)
        tempBbox.push(xyBbj.y)
      }
      obj.bbox = tempBbox;
    }
    if (!Array.isArray(features)){
      return obj;
    }
    for (let index in features) {
      let item = features[index];
      if (item.geometry && item.geometry.coordinates){
        item.geometry.coordinates = this.transformMultidimensionalArr(item.geometry.coordinates);
      }
    }
    return obj;
  }


}

/**
 * 获取转化坐标工具类
 * @param fromProj
 * @param toProj
 * @returns {CoordinateTransform}
 */
export function getCoordinateTransform(fromProj,toProj){
  // 检查是否存在fromProj 和 toProj 是否存在
  if (!checkType(EPSGType,fromProj) || !checkType(EPSGType,toProj)){
    throw `请检查输入的坐标系是否正确`;
  }
  return new CoordinateTransform(fromProj,toProj);
}

<template>
  <div id="userLayout" :class="['user-layout-wrapper', device]">
    <div class="container">
      <video src="~@/assets/login/bj.mp4" autoplay muted loop></video>
      <div class="top">
        <div class="header">
            <img src="~@/assets/login/logo.png" class="logodl" alt="logo">
           <!-- <img src="~@/assets/login/tle.png" class="logodT" alt="logo"> -->
          <div class="logodT">HRM综合管理平台</div>

           <img src="~@/assets/login/tab.png" class="logod" alt="logo">

        </div>
      </div>

      <route-view ></route-view>

      
    </div>
  </div>
</template>

<script>
  import RouteView from "@/components/layouts/RouteView"
  import { mixinDevice } from '@/utils/mixin.js'

  export default {
    name: "UserLayout",
    components: { RouteView },
    mixins: [mixinDevice],
    data () {
      return {}
    },
    mounted () {
      document.body.classList.add('userLayout')
    },
    beforeDestroy () {
      document.body.classList.remove('userLayout')
    },
  }
</script>

<style lang="less" scoped>

  .logodl{
   position: absolute;
    left: 5vw;
    height:60px;
    top: 15vh;
  }
  .logodT{
    position: absolute;
    left: 10vw;
    top: 20vh;
    font-size:65px;
    font-weight: bold;
    line-height: 150px;
    text-align: center;
    background: linear-gradient(135deg, #1f7fec 0%, #0047ca 50%, #002d86 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .logod{
    position: absolute;
    bottom: 12vh;
    left: 5vw;
    width: 950px;
  }



  #userLayout.user-layout-wrapper {
    height: 100%;

    &.mobile {
      .container {
        .main {
          max-width: 368px;
          width: 98%;
        }
      }
    }

    .container {
      width: 100%;
      min-height: 100%;
      // background: #f0f2f5 url(~@/assets/big.gif) no-repeat 50%;
      // background-size: 100%;
      padding: 110px 0 144px;
      position: relative;

      video {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: -1;
      }

      a {
        text-decoration: none;
      }

      .top {
        text-align: center;

        .header {
          height: 44px;
          line-height: 44px;

          .badge {
            position: absolute;
            display: inline-block;
            line-height: 1;
            vertical-align: middle;
            margin-left: -12px;
            margin-top: -10px;
            opacity: 0.8;
          }

          .logo {
            height: 44px;
            vertical-align: top;
            margin-right: 16px;
            border-style: none;
          }

          .title {
            font-size: 50px;
            color: rgba(0, 0, 0, .85);
            font-family: "Chinese Quote", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
            font-weight: 600;
            position: relative;
            top: 2px;
            margin: 10 px;
          }
        }
        .desc {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.45);
          margin-top: 12px;
          margin-bottom: 40px;
        }
      }

      /*.main {*/
        /*min-width: 260px;*/
        /*width: 368px;*/
        /*margin: 0 auto;*/
      /*}*/

      .footer {
        position: absolute;
        width: 100%;
        bottom: 0;
        padding: 0 16px;
        line-height: 40px;
        text-align: center;

        .links {
          margin-bottom: 8px;
          font-size: 14px;
          a {
            color: rgba(0, 0, 0, 0.45);
            transition: all 0.3s;
            &:not(:last-child) {
              margin-right: 40px;
            }
          }
        }
        .copyright {
          color: #ffffff;
          font-size: 15px;
          display: flex;
          justify-content: center;

        }
        .chupin{
          margin-left: 70px;
          border-radius: 5px;
          text-align: center;
          padding: 5px;
          width: 25%;
          background-color: rgba(0,0,0,0.4);
        }
      }
    }
  }
</style>
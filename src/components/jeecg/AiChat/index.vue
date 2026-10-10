<template>
  <div ref="chatContainerRef" class="chat-container" :style="chatContainerStyle">
    <template v-if="dataSource">
      <div class="leftArea" :class="[expand ? 'expand' : 'shrink']">
        <div class="content">
          <slide v-if="uuid" :data-source="dataSource" @save="handleSave"></slide>
        </div>
        <div class="toggle-btn" @click="handleToggle">
          <span class="icon">
            <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M5.64645 3.14645C5.45118 3.34171 5.45118 3.65829 5.64645 3.85355L9.79289 8L5.64645 12.1464C5.45118 12.3417 5.45118 12.6583 5.64645 12.8536C5.84171 13.0488 6.15829 13.0488 6.35355 12.8536L10.8536 8.35355C11.0488 8.15829 11.0488 7.84171 10.8536 7.64645L6.35355 3.14645C6.15829 2.95118 5.84171 2.95118 5.64645 3.14645Z"
                fill="currentColor"
              />
            </svg>
          </span>
        </div>
      </div>
      <div class="rightArea" :class="[expand ? 'expand' : 'shrink']">
        <chat v-if="uuid && chatVisible" :uuid="uuid" :chat-data="chatData" :data-source="dataSource" @save="handleSave"></chat>
      </div>
    </template>
    <a-spin v-else :spinning="true"></a-spin>
  </div>
</template>

<script>
import Slide from './components/slide.vue';
import Chat from './components/chat.vue';
import { Spin } from 'ant-design-vue';
// import { defHttp } from '@/utils/http/axios';
import { JEECG_CHAT_KEY } from '@/enums/cacheEnum';
import { mapGetters } from 'vuex';
import { getAction, postAction } from '@api/manage'

export default {
  components: {
    Slide,
    Chat,
    'a-spin': Spin
  },
  data() {
    return {
      configUrl: {
        get: '/test/ai/chat/history/get',
        save: '/test/ai/chat/history/save'
      },
      dataSource: null,
      uuid: null,
      chatData: [],
      expand: true,
      chatVisible: true,
      chatContainerRef: null,
      chatContainerStyle: {},
      timer: null,
      unwatch01: null,
      unwatch02: null
    };
  },
  computed: {
    ...mapGetters('user', ['userInfo']),
    localKey() {
      return JEECG_CHAT_KEY + ((this.userInfo && this.userInfo.id) || '');
    }
  },
  watch: {
    'dataSource.active': {
      handler(value) {
        if (value) {
          const findItem = this.dataSource.chat.find(item => item.uuid === value);
          if (findItem) {
            this.uuid = findItem.uuid;
            this.chatData = findItem.data;
          }
          this.chatVisible = false;
          this.$nextTick(() => {
            this.chatVisible = true;
          });
        }
      },
      immediate: true
    },
    dataSource: {
      deep: true,
      handler() {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.save(this.dataSource);
        }, 2000);
      }
    },
    chatContainerRef() {
      if (this.chatContainerRef) {
        this.chatContainerStyle = {
          height: `${this.chatContainerRef.offsetHeight}px`
        };
      }
    }
  },
  created() {
    this.init();
  },
  beforeDestroy() {
    if (this.unwatch01) this.unwatch01();
    if (this.unwatch02) this.unwatch02();
    clearTimeout(this.timer);
  },
  methods: {
    handleToggle() {
      this.expand = !this.expand;
    },
    init() {
      const priming = () => {
        this.dataSource = {
          active: 1002,
          usingContext: true,
          history: [{ uuid: 1002, title: '新建聊天', isEdit: false }],
          chat: [{ uuid: 1002, data: [] }]
        };
      };
      getAction(this.configUrl.get).then(res => {
        if (res.success) {
          const { content } = res.result;
          // 内容存在时的处理流程
          if (content) {
            try {
              const json = JSON.parse(content);
              // 有效历史数据判断
              if (json.history && json.history.length) {
                this.dataSource = json;
              } else {
                priming();
              }
            } catch (e) {
              console.error('JSON解析失败:', e);
              priming();
            }
          } else {
            priming();
          }
        } else {
          priming();
        }
      }).catch(error => {
        priming();
      });
    },
    save(content) {
      // defHttp.post({
      //   url: this.configUrl.save,
      //   params: { content: JSON.stringify(content) }
      // }, { isTransformResponse: false });
      postAction(this.configUrl.save,{ content: JSON.stringify(content) }).then(res=>{
        console.log("???",res)
      })

    },
    handleSave() {
      this.save(this.dataSource);
      setTimeout(() => {
        clearTimeout(this.timer);
      }, 50);
    }
  }
};
</script>

<style scoped lang="less">
@width: 260px;
.chat-container {
  position: relative;
  height: 100%;
  box-shadow: 0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  border-width: 1px;
  border-radius: 0.375rem;
  display: flex;
  overflow: hidden;
  :deep(.ant-spin) {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

.leftArea {
  width: @width;
  transition: 0.3s left;
  position: absolute;
  left: 0;
  height: 100%;
  .content {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  &.shrink {
    left: -@width;
    .toggle-btn {
      .icon {
        transform: rotate(0deg);
      }
    }
  }
  .toggle-btn {
    transition: color 0.3s cubic-bezier(0.4, 0, 0.2, 1), right 0.3s cubic-bezier(0.4, 0, 0.2, 1), left 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    width: 24px;
    height: 24px;
    position: absolute;
    top: 50%;
    right: 0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: rgb(51, 54, 57);
    border: 1px solid rgb(239, 239, 245);
    background-color: #fff;
    box-shadow: 0 2px 4px 0px rgba(0, 0, 0, 0.06);
    transform: translateX(50%) translateY(-50%);
    z-index: 1;
  }
  .icon {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: rotate(180deg);
    font-size: 18px;
    height: 18px;
    svg {
      height: 1em;
      width: 1em;
      vertical-align: top;
    }
  }
}

.rightArea {
  margin-left: @width;
  transition: 0.3s margin-left;
  &.shrink {
    margin-left: 0;
  }
  flex: 1;
  min-width: 0;
}
</style>
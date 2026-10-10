<template>
  <div class="presetQuestion-wrap">
    <svg
      v-if="btnShow"
      class="leftBtn"
      :class="leftBtnStatus"
      t="1710296339017"
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="5070"
      @click="onScroll('prev')"
    >
      <path
        d="M970.496 543.829333l30.165333-30.165333-415.829333-415.914667a42.837333 42.837333 0 0 0-60.288 0 42.538667 42.538667 0 0 0 0 60.330667l355.413333 355.498667-355.413333 355.285333a42.496 42.496 0 0 0 0 60.288c16.64 16.64 43.861333 16.469333 60.288 0.042667l383.914667-383.701334 1.749333-1.664z"
        fill="currentColor"
        p-id="5071"
      />
    </svg>
    <div class="content">
      <ul ref="ulElem">
        <li
          v-for="(item, index) in data"
          :key="index"
          class="item"
          @click="handleQuestion(item)"
        >
          {{ item }}
        </li>
      </ul>
    </div>
    <svg
      v-if="btnShow"
      class="rightBtn"
      :class="rightBtnStatus"
      t="1710296339017"
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="5070"
      @click="onScroll('next')"
    >
      <path
        d="M970.496 543.829333l30.165333-30.165333-415.829333-415.914667a42.837333 42.837333 0 0 0-60.288 0 42.538667 42.538667 0 0 0 0 60.330667l355.413333 355.498667-355.413333 355.285333a42.496 42.496 0 0 0 0 60.288c16.64 16.64 43.861333 16.469333 60.288 0.042667l383.914667-383.701334 1.749333-1.664z"
        fill="currentColor"
        p-id="5071"
      />
    </svg>
  </div>
</template>

<script>
export default {
  name: 'PresetQuestion',
  data() {
    return {
      data: ['请介绍一下正图科技', '介绍一下卫星影像平台？', '你可以干什么？'],
      leftBtnStatus: '',
      rightBtnStatus: '',
      btnShow: false,
      timer: null
    };
  },
  mounted() {
    this.$nextTick(() => {
      const ulElem = this.$refs.ulElem;
      ulElem.addEventListener('scroll', this.handleScroll);
      this.handleScroll({ target: ulElem });
    });
  },
  beforeDestroy() {
    const ulElem = this.$refs.ulElem;
    if (ulElem) {
      ulElem.removeEventListener('scroll', this.handleScroll);
    }
    clearTimeout(this.timer);
  },
  methods: {
    handleScroll(e) {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        const scrollLeft = e.target.scrollLeft;
        const offsetWidth = e.target.offsetWidth;
        const scrollWidth = e.target.scrollWidth;

        this.btnShow = scrollWidth > offsetWidth;

        if (scrollLeft <= 0) {
          this.leftBtnStatus = 'disabled';
          this.rightBtnStatus = '';
        } else if (scrollWidth - offsetWidth <= scrollLeft) {
          this.rightBtnStatus = 'disabled';
          this.leftBtnStatus = '';
        } else {
          this.leftBtnStatus = '';
          this.rightBtnStatus = '';
        }
      }, 100);
    },
    onScroll(flag) {
      const ulElem = this.$refs.ulElem;
      const offsetWidth = ulElem.offsetWidth;

      if (flag === 'prev') {
        ulElem.scrollLeft -= offsetWidth;
      } else {
        ulElem.scrollLeft += offsetWidth;
      }
    },
    handleQuestion(item) {
      this.$emit('outQuestion', item);
    }
  }
};
</script>

<style lang="less" scoped>
.presetQuestion-wrap {
  display: flex;
  align-items: center;
  padding: 8px 0;

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    cursor: pointer;
    color: #666;
    transition: opacity 0.3s;

    &.leftBtn {
      transform: rotate(180deg);
    }

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .content {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    margin: 0 8px;
  }

  ul {
    display: flex;
    padding: 0;
    margin: 0;
    list-style: none;
    overflow-x: auto;
    scroll-behavior: smooth;
    -ms-overflow-style: none;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .item {
    border: 1px solid rgba(@primary-color, 0.3);
    border-radius: 16px;
    padding: 4px 12px;
    margin-right: 8px;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.3s;
    background-color: rgba(@primary-color, 0.1);
    color: @primary-color;

    &:last-child {
      margin-right: 0;
    }

    &:hover {
      background-color: @primary-color;
      color: #fff;
      border-color: @primary-color;
    }
  }
}
</style>
<template>
  <a-card>
    <!--     @submit="handleSubmit"-->
    <a-row class='jsonClass'>
      <a-col :span='24' v-for='(index,item) in parameter'>
        <a-form-item :label="item.split('-')[1]"
                     v-if="checkType(parameter[item])!='@Arr' && checkType(parameter[item])!='@Obj'">
          <!--            参考SysTreeTag 组件的<component-->
          <!--          {{ ObjValue }}-->
          <component style='margin-left: 20px;display: inline-block'
                     :is='getMyComponentByType(parameter[item])' :is-json-string='false'
                     v-model="ObjValue[item.split('-')[0]]" :parameter="item.split('-')[2]"
                     :placeholder="item.split('-')[1]"
          />
        </a-form-item>


        <a-form-item :label="item.split('-')[1]" v-else-if="checkType(parameter[item])=='@Arr'">
          <list-json-edit style='width: 120vh;'
                          v-model="ObjValue[item.split('-')[0]]"
                          :parameter='parameter[item][0]'
                          :is-json-string='false'>

          </list-json-edit>
        </a-form-item>


        <a-form-item :label="item.split('-')[1]" v-else>
          <div style='margin-left: 50px;'>
            <obj-json-edit v-model="ObjValue[item.split('-')[0]]" :showLayerNotes='false' :parameter='parameter[item]'
                           :is-json-string='false'></obj-json-edit>
          </div>
        </a-form-item>
      </a-col>

    </a-row>
  </a-card>
</template>

<script>

  import { getComponentByType } from '@/utils/sysTreeTagUtil'
  import { isJSONToBoole } from '@/utils/util'
  import listJsonEdit from '@comp/ChoiceSelector/listJsonEdit'


  export default {
    name: 'objJsonEdit',
    components: {
      listJsonEdit
    },
    props: {
      value: {
        // 自定义验证逻辑（此处不限制类型）
        validator: function(value) {
          return true
        }
      },
      showLayerNotes: {
        type: Boolean,
        default: true,
        required: false
      },


      parameter: {
        type: Object,
        required: true
      },
      isJsonString: {
        type: Boolean,
        default: true,
        required: false
      }
    },
    watch: {

      value: {
        handler(newValue, oldValue) {
          if (this.isFirstChange) {
            // 在值第一次变化时执行的逻辑
            this.initObjValue()
            this.isFirstChange = false
          }
        },
        immediate: true // 设置immediate为true
      },

      parameter: {
        immediate: true, // 监听初始时的值变化
        handler(newValue, oldValue) {
          //
        }
      },
      ObjValue: {
        immediate: true, // 监听初始时的值变化
        handler(newValue, oldValue) {
          if (!this.isJsonString) {
            this.handleSubmit()
          }
        }
      }
    },
    created() {
      this.initObjValue()
    },
    data() {
      return {
        isFirstChange: true,
        ObjValue: {},
        wIndex: 0
      }
    },
    methods: {
      initObjValue() {
        let para = this.parameter

        let objValue = JSON.parse(JSON.stringify(this.ObjValue))
        let value
        // 如果数据本来就是json 字符串
        if (this.isJsonString) {
          value = JSON.parse(this.value)
          // 如果数据本来不是json 字符串
        } else {
          value = this.value
        }


        for (let key in para) {
          let keyArr = key.split('-')
          let keyName = keyArr[0]
          let keyChName = keyArr[1]

          if (value[keyName]) {
            objValue[keyName] = value[keyName]
            // this.$set(this.ObjValue, keyName, value[keyName])
          } else {
            objValue[keyName] = null
            // this.$set(this.ObjValue, keyName, null)
          }

        }
        this.ObjValue = objValue
      },

      checkType(value) {
        if (typeof value === 'object') {
          // 数组类型
          if (Array.isArray(value)) {
            return '@Arr'
            //obj 类型
          } else {
            return '@Obj'
          }
          // 文本类型
        } else {
          return value
        }
      },

      getMyComponentByType(type) {
        return getComponentByType(type).component
      },
      handleSubmit() {
        // 如果数据本来就是对象
        let value
        if (this.isJsonString) {
          // 如果数据本来是json 字符串
          value = JSON.stringify(this.ObjValue)
        } else {
          value = this.ObjValue

        }

        this.$emit('input', value)
        this.$emit('change', value)
        return value
      }

    }
  }
</script>

<style scoped>
  /deep/ .jsonClass .ant-col .ant-form-item-control-wrapper {
    display: inline-block;
  }

  /deep/ .jsonClass .ant-col .ant-form-item-label {
    vertical-align: top;
  }

</style>
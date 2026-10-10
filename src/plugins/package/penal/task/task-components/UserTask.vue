<template>
  <div style="margin-top: 16px">
    <el-row>
      <h4><b>设置用户类型</b></h4>
      <el-radio-group v-model="defaultTaskForm.dataType" @change="changeDataType">
        <div v-if="bDisplayUser">
          <el-radio label="ASSIGNEE">指定用户</el-radio>
          <el-radio label="INITIATOR">发起人</el-radio>
	      </div>
        <el-radio label="MANAGER">部门经理</el-radio>
        <el-radio label="USERS">候选用户</el-radio>
        <el-radio label="ROLES">候选角色</el-radio>
      </el-radio-group>
    </el-row>
    <el-row>
      <div v-if="defaultTaskForm.dataType === 'ASSIGNEE'">
        <el-select v-model="userTaskForm.assignee" filterable allow-create clearable @change="updateElementTask('assignee')">
          <el-option v-for="ak in users" :key="ak.id" :label="ak.name" :value="ak.id" />
        </el-select>
      </div>   
    </el-row>
    <el-row>
      <div v-if="defaultTaskForm.dataType === 'USERS'">
        <el-select v-model="userTaskForm.candidateUsers" filterable allow-create multiple collapse-tags @change="updateElementTask('candidateUsers')">
          <el-option v-for="uk in users" :key="uk.id" :label="uk.name" :value="uk.id" />
        </el-select>
      </div>   
    </el-row>
    <el-row>
      <div v-if="defaultTaskForm.dataType === 'ROLES'">
        <el-select v-model="userTaskForm.candidateGroups" filterable allow-create multiple collapse-tags @change="updateElementTask('candidateGroups')">
          <el-option v-for="gk in groups" :key="gk.id" :label="gk.name" :value="gk.id" />
        </el-select>
      </div>  
    </el-row>
    <el-row v-if="defaultTaskForm.dataType === 'USERS' || defaultTaskForm.dataType === 'ROLES' || defaultTaskForm.dataType === 'MANAGER'">
      <h4><b>多实例</b></h4>
      <div>
        <element-multi-instance :business-object="bpmnElement.businessObject" @multiInsEvent="multiIns"/>
      </div>  
    </el-row>
    <!-- <el-form-item label="到期时间">
      <el-input v-model="userTaskForm.dueDate" clearable @change="updateElementTask('dueDate')" />
    </el-form-item>
    <el-form-item label="跟踪时间">
      <el-input v-model="userTaskForm.followUpDate" clearable @change="updateElementTask('followUpDate')" />
    </el-form-item>
    <el-form-item label="优先级">
      <el-input v-model="userTaskForm.priority" clearable @change="updateElementTask('priority')" />
    </el-form-item> -->
  </div>
</template>

<script>
import ElementMultiInstance from "../../multi-instance/ElementMultiInstance";
export default {
  name: "UserTask",
  components: {
    ElementMultiInstance,
  },  
  props: {
    users: {//兼容老系统add by nbacheng
      type: Array,
      required: true
    },
    groups: {//兼容老系统
      type: Array,
      required: true
    },
    id: String,
    type: String
  },
  data() {
    return {
      defaultTaskForm: {
        assignee: "",
        candidateUsers: [],
        candidateGroups: [],
        dueDate: "",
        followUpDate: "",
        priority: "",
        dataType: "",
      },
      userTaskForm: {},
      bDisplayUser: true,
    };
  },
  watch: {
    id: {
      immediate: true,
      handler() {
        this.bpmnElement = window.bpmnInstances.bpmnElement;
        console.log("watch this.bpmnElement",this.bpmnElement)
        if (this.containsKey(this.bpmnElement.businessObject, 'loopCharacteristics') &&
             this.bpmnElement.businessObject.loopCharacteristics != null) {
          this.bDisplayUser = false;
          if (this.containsKey(this.bpmnElement.businessObject, 'candidateUsers') &&
               this.bpmnElement.businessObject.candidateUsers != null) {
            this.defaultTaskForm.dataType = "USERS";
          }
          if (this.containsKey(this.bpmnElement.businessObject, 'candidateGroups') &&
               this.bpmnElement.businessObject.candidateGroups === '${DepManagerHandler.getUsers(execution)}') {
            this.defaultTaskForm.dataType = "MANAGER";
          }
          if (this.containsKey(this.bpmnElement.businessObject, 'candidateGroups') &&
               this.bpmnElement.businessObject.candidateGroups != null &&
               this.bpmnElement.businessObject.candidateGroups != '${DepManagerHandler.getUsers(execution)}') {
            this.defaultTaskForm.dataType = "ROLES";
          }
        }
        else {
          this.bDisplayUser = true;
          if (this.containsKey(this.bpmnElement.businessObject, 'assignee') &&
            this.bpmnElement.businessObject.assignee != null) {
            this.defaultTaskForm.dataType = "ASSIGNEE";
          } 
          if (this.containsKey(this.bpmnElement.businessObject, 'candidateUsers') &&
            this.bpmnElement.businessObject.candidateUsers != null) {
            this.defaultTaskForm.dataType = "USERS";
          }
          if (this.containsKey(this.bpmnElement.businessObject, 'candidateGroups') &&
            this.bpmnElement.businessObject.candidateGroups === '${DepManagerHandler.getUsers(execution)}') {
            this.defaultTaskForm.dataType = "MANAGER";
          }
          if (this.containsKey(this.bpmnElement.businessObject, 'candidateGroups') &&
            this.bpmnElement.businessObject.candidateGroups != null &&
            this.bpmnElement.businessObject.candidateGroups != '${DepManagerHandler.getUsers(execution)}') {
            this.defaultTaskForm.dataType = "ROLES";
          }
          if (this.containsKey(this.bpmnElement.businessObject, 'assignee') &&
            this.bpmnElement.businessObject.assignee === '${INITIATOR}') {
            this.defaultTaskForm.dataType = "INITIATOR";
          }
        }
        this.$nextTick(() => this.resetTaskForm());
      }
    }
  },
  methods: {
    multiIns(val) { //子组件传递是否是多实例
      this.bDisplayUser = val;
    },
    containsKey(obj, key ) {
        return Object.keys(obj).includes(key);
    },
    resetTaskForm() {
      for (let key in this.defaultTaskForm) {
        let value;
        if (key === "candidateUsers" || key === "candidateGroups") {
          value = this.bpmnElement?.businessObject[key] ? this.bpmnElement.businessObject[key].split(",") : [];
        } else {
          value = this.bpmnElement?.businessObject[key] || this.defaultTaskForm[key];
        }
        this.$set(this.userTaskForm, key, value);
      }
    },
    changeDataType(val) {
      // 清空 userTaskForm 所有属性值
      //Object.keys(this.userTaskForm).forEach(key => this.userTaskForm[key] = null);
      this.userTaskForm.dataType = val;
      if (val === 'INITIATOR') {
        this.userTaskForm.assignee = "${INITIATOR}";
        this.userTaskForm.text = "流程发起人";
        const taskAttr = Object.create(null);
        taskAttr['candidateUsers'] = null;
        taskAttr['candidateGroups'] = null;
        this.userTaskForm['candidateUsers'] = null;
        this.userTaskForm['candidateGroups'] = null;
        taskAttr['assignee'] = this.userTaskForm['assignee'] || null;
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, taskAttr);
      }
      if (val === 'MANAGER') {
        this.userTaskForm.candidateGroups = "${DepManagerHandler.getUsers(execution)}";
        this.userTaskForm.assignee="${assignee}"
        this.userTaskForm.text = "部门经理";
        const taskAttr = Object.create(null);
        taskAttr['candidateUsers'] = null;
        this.userTaskForm['candidateUsers'] = null;
        taskAttr['candidateGroups'] = this.userTaskForm['candidateGroups'] || null;
        taskAttr['assignee'] = this.userTaskForm['assignee'] || null;
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, taskAttr);
      }   
    },  
    updateElementTask(key) {
      const taskAttr = Object.create(null);
      if (key === "candidateUsers") {
        taskAttr[key] = this.userTaskForm[key] && this.userTaskForm[key].length ? this.userTaskForm[key].join() : null;
        if(taskAttr[key] !=null) {
          taskAttr['candidateGroups'] = null;
          taskAttr['assignee'] = null;
          this.userTaskForm['candidateGroups'] = null;
          this.userTaskForm['assignee'] = null;
        }  
      } 
      else if (key === "candidateGroups") {
        taskAttr[key] = this.userTaskForm[key] && this.userTaskForm[key].length ? this.userTaskForm[key].join() : null;
        if(taskAttr[key] !=null) {
          taskAttr['candidateUsers'] = null;
          taskAttr['assignee'] = null;
          this.userTaskForm['candidateUsers'] = null;
          this.userTaskForm['assignee'] = null;
        }  
      } 
      else if (key === "assignee") {
        taskAttr[key] = this.userTaskForm[key] && this.userTaskForm[key].length ? this.userTaskForm[key] : null;
        if(taskAttr[key] !=null) {
          taskAttr['candidateUsers'] = null;
          taskAttr['candidateGroups'] = null;
          this.userTaskForm['candidateUsers'] = null;
          this.userTaskForm['candidateGroups'] = null;
        }
      } 
      else {
        taskAttr[key] = this.userTaskForm[key] || null;
      }
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, taskAttr);
    }
  },
  beforeDestroy() {
    this.bpmnElement = null;
  }
};
</script>

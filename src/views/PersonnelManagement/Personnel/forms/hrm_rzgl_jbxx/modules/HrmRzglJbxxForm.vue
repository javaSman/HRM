<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="8">
            <a-form-model-item label="创建日期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="createTime">
              <j-date placeholder="请选择创建日期"  v-model="model.createTime" :show-time="true" date-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="员工姓名" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="name">
              <a-input v-model="model.name" placeholder="请输入员工姓名"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="性别" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="gender">
              <a-input v-model="model.gender" placeholder="请输入性别"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="出生日期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="birthDate">
              <j-date placeholder="请选择出生日期" v-model="model.birthDate"  style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="民族" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="mz">
              <a-input v-model="model.mz" placeholder="请输入民族"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="籍贯" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="jg">
              <a-input v-model="model.jg" placeholder="请输入籍贯"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="证件类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="idType">
              <a-input v-model="model.idType" placeholder="请输入证件类型"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="身份证号码" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="idCard">
              <a-input v-model="model.idCard" placeholder="请输入身份证号码"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="户籍性质" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="hjxz">
              <a-input v-model="model.hjxz" placeholder="请输入户籍性质"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="户籍地址" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="hjdz">
              <a-input v-model="model.hjdz" placeholder="请输入户籍地址"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="员工照片" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="photo">
              <a-input v-model="model.photo" placeholder="请输入员工照片"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="政治面貌" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="zzmm">
              <a-input v-model="model.zzmm" placeholder="请输入政治面貌"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="婚姻状况" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="hyzk">
              <a-input v-model="model.hyzk" placeholder="请输入婚姻状况"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="健康状况" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="jkzk">
              <a-input v-model="model.jkzk" placeholder="请输入健康状况"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="以往病史" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="ywbs">
              <a-input v-model="model.ywbs" placeholder="请输入以往病史"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="兴趣爱好" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="xqah">
              <a-input v-model="model.xqah" placeholder="请输入兴趣爱好"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="联系方式" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="phoneNumber">
              <a-input v-model="model.phoneNumber" placeholder="请输入联系方式"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="邮箱" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="email">
              <a-input v-model="model.email" placeholder="请输入邮箱"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="联系地址" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="address">
              <a-input v-model="model.address" placeholder="请输入联系地址"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="居住地" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="jzd">
              <a-input v-model="model.jzd" placeholder="请输入居住地"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="暂住地址" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="zzdz">
              <a-input v-model="model.zzdz" placeholder="请输入暂住地址"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="住宿方式" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="zsfs">
              <a-input v-model="model.zsfs" placeholder="请输入住宿方式"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="宿舍信息" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="dormitory">
              <a-input v-model="model.dormitory" placeholder="请输入宿舍信息"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="员工卡号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="card">
              <a-input v-model="model.card" placeholder="请输入员工卡号"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="员工工号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="no">
              <a-input v-model="model.no" placeholder="请输入员工工号"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="员工类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="employeeType">
              <a-input v-model="model.employeeType" placeholder="请输入员工类型"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="所属公司 ID" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="companyId">
              <a-input v-model="model.companyId" placeholder="请输入所属公司 ID"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="所属部门 ID" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="dept">
              <a-input v-model="model.dept" placeholder="请输入所属部门 ID"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="主部门" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="mainDept">
              <a-input v-model="model.mainDept" placeholder="请输入主部门"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="所属岗位 ID" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="postId">
              <a-input v-model="model.postId" placeholder="请输入所属岗位 ID"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="岗位职级 ID" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="postRank">
              <a-input v-model="model.postRank" placeholder="请输入岗位职级 ID"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="岗位信息 ID" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="positionInfoId">
              <a-input v-model="model.positionInfoId" placeholder="请输入岗位信息 ID"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="岗位备注" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="gwbz">
              <a-input v-model="model.gwbz" placeholder="请输入岗位备注"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="入职方式" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="rzfs">
              <a-input v-model="model.rzfs" placeholder="请输入入职方式"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="招聘计划" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="sourceTag">
              <a-input v-model="model.sourceTag" placeholder="请输入招聘计划"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="入职状态" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="status">
              <a-input v-model="model.status" placeholder="请输入入职状态"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="试用期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="syq">
              <a-input v-model="model.syq" placeholder="请输入试用期"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="入职日期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="entryDate">
              <j-date placeholder="请选择入职日期" v-model="model.entryDate"  style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="实际到岗日期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="actualDate">
              <j-date placeholder="请选择实际到岗日期" v-model="model.actualDate"  style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="报道日期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="bdrq">
              <j-date placeholder="请选择报道日期"  v-model="model.bdrq" :show-time="true" date-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="转正类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="becomeType">
              <a-input v-model="model.becomeType" placeholder="请输入转正类型"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="计划转正日期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="sjzzrq">
              <j-date placeholder="请选择计划转正日期" v-model="model.sjzzrq"  style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="正式离职日期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="formalResignDate">
              <j-date placeholder="请选择正式离职日期" v-model="model.formalResignDate"  style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="工作年限" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="workYears">
              <a-input-number v-model="model.workYears" placeholder="请输入工作年限" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="入职负责人" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="entryDirector">
              <a-input v-model="model.entryDirector" placeholder="请输入入职负责人"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="导师姓名" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="mentor">
              <a-input v-model="model.mentor" placeholder="请输入导师姓名"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="资料状态" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="profileStatus">
              <a-input v-model="model.profileStatus" placeholder="请输入资料状态"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="个人信息 ID" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="informationId">
              <a-input v-model="model.informationId" placeholder="请输入个人信息 ID"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="工作厂区 / 位置" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="workLocation">
              <a-input v-model="model.workLocation" placeholder="请输入工作厂区 / 位置"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="是否存在竞业限制协议" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="sfczjyxzxy">
              <a-input v-model="model.sfczjyxzxy" placeholder="请输入是否存在竞业限制协议"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="合同归属" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="constractBelong">
              <a-input v-model="model.constractBelong" placeholder="请输入合同归属"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="合同类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="constractType">
              <a-input v-model="model.constractType" placeholder="请输入合同类型"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="合同开始日期	" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="contractStartDate">
              <j-date placeholder="请选择合同开始日期	" v-model="model.contractStartDate"  style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="合同到期日期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="contractExpDate">
              <j-date placeholder="请选择合同到期日期" v-model="model.contractExpDate"  style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="薪资(k)" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="salary">
              <a-input-number v-model="model.salary" placeholder="请输入薪资(k)" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="薪资类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="salaryType">
              <j-dict-select-tag v-model="model.salaryType" dictCode="xzlx" placeholder="请选择薪资类型" />
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="银行卡号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="gzkyhkh">
              <a-input v-model="model.gzkyhkh" placeholder="请输入银行卡号"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="工资卡银行" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="gzkyh">
              <a-input v-model="model.gzkyh" placeholder="请输入工资卡银行"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="工资卡开户行" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="gzkkhh">
              <a-input v-model="model.gzkkhh" placeholder="请输入工资卡开户行"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="社保状态" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="socialSecurityStatus">
              <a-input v-model="model.socialSecurityStatus" placeholder="请输入社保状态"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="社保情况" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="sbqk">
              <a-input v-model="model.sbqk" placeholder="请输入社保情况"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="社保电脑号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="sbdnh">
              <a-input v-model="model.sbdnh" placeholder="请输入社保电脑号"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="社保停缴状态" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="stopSocialSecurityStatus">
              <a-input v-model="model.stopSocialSecurityStatus" placeholder="请输入社保停缴状态"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="首次社保缴纳日期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="sbStartDate">
              <j-date placeholder="请选择首次社保缴纳日期" v-model="model.sbStartDate"  style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="公积金状态" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="accumulationFundStatus">
              <a-input v-model="model.accumulationFundStatus" placeholder="请输入公积金状态"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="公积金情况" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="gjjqk">
              <a-input v-model="model.gjjqk" placeholder="请输入公积金情况"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="公积金电脑号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="gjjdhh">
              <a-input v-model="model.gjjdhh" placeholder="请输入公积金电脑号"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="公积金停缴状态" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="stopAccumulationFundStatus">
              <a-input v-model="model.stopAccumulationFundStatus" placeholder="请输入公积金停缴状态"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="公积金银行卡号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="gjjyhkh">
              <a-input v-model="model.gjjyhkh" placeholder="请输入公积金银行卡号"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="公积金银行" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="gjjyh">
              <a-input v-model="model.gjjyh" placeholder="请输入公积金银行"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="公积金开户银行" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="gjjkhyh">
              <a-input v-model="model.gjjkhyh" placeholder="请输入公积金开户银行"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="毕业院校" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="byyx">
              <a-input v-model="model.byyx" placeholder="请输入毕业院校"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="学历" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="xl">
              <a-input v-model="model.xl" placeholder="请输入学历"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="专业" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="zy">
              <a-input v-model="model.zy" placeholder="请输入专业"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="学位" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="xw">
              <a-input v-model="model.xw" placeholder="请输入学位"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="主表" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="hrmRzglId">
              <a-input v-model="model.hrmRzglId" placeholder="请输入主表"  ></a-input>
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>

  import { httpAction, getAction } from '@/api/manage'
  import { validateDuplicateValue } from '@/utils/util'

  export default {
    name: 'HrmRzglJbxxForm',
    components: {
    },
    props: {
      //表单禁用
      disabled: {
        type: Boolean,
        default: false,
        required: false
      }
    },
    data () {
      return {
        model:{
         },
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        confirmLoading: false,
        validatorRules: {
        },
        url: {
          add: "/ryManage/hrmRzglJbxx/add",
          edit: "/ryManage/hrmRzglJbxx/edit",
          queryById: "/ryManage/hrmRzglJbxx/queryById"
        }
      }
    },
    computed: {
      formDisabled(){
        return this.disabled
      },
    },
    created () {
       //备份model原始值
      this.modelDefault = JSON.parse(JSON.stringify(this.model));
    },
    methods: {
      add () {
        this.edit(this.modelDefault);
      },
      edit (record) {
        this.model = Object.assign({}, record);
        this.visible = true;
      },
      submitForm () {
        const that = this;
        // 触发表单验证
        this.$refs.form.validate(valid => {
          if (valid) {
            that.confirmLoading = true;
            let httpurl = '';
            let method = '';
            if(!this.model.id){
              httpurl+=this.url.add;
              method = 'post';
            }else{
              httpurl+=this.url.edit;
               method = 'put';
            }
            httpAction(httpurl,this.model,method).then((res)=>{
              if(res.success){
                that.$message.success(res.message);
                that.$emit('ok');
              }else{
                that.$message.warning(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
            })
          }
         
        })
      },
    }
  }
</script>
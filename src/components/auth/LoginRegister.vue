<template>
  <div class="auth-modal">
    <!-- 选项卡切换 -->
    <div class="tabs">
      <button
          :class="{ active: activeTab === 'login' }"
          @click="activeTab = 'login'"
      >
        登录
      </button>
      <button
          :class="{ active: activeTab === 'register' }"
          @click="activeTab = 'register'"
      >
        注册
      </button>
    </div>

    <!-- 登录表单 -->
    <form v-if="activeTab === 'login'" @submit.prevent="handleLogin">
      <div class="login-type">
        <label>
          <input
              type="radio"
              v-model="loginType"
              value="password"
          > 密码登录
        </label>
        <label>
          <input
              type="radio"
              v-model="loginType"
              value="code"
          > 验证码登录
        </label>
      </div>

      <div class="form-group">
        <input
            type="text"
            v-model="loginForm.phone"
            placeholder="用户名/手机号"
            required
        >
      </div>

      <div class="form-group" v-if="loginType === 'password'">
        <input
            type="password"
            v-model="loginForm.password"
            placeholder="密码"
            required
        >
      </div>

      <div class="form-group code-group" v-else>
        <input
            type="text"
            v-model="loginForm.code"
            placeholder="验证码"
            required
        >
        <button
            type="button"
            class="send-code"
            :disabled="countdown > 0"
            @click="sendCode"
        >
          {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
        </button>
      </div>

      <button type="submit" class="submit-btn">登录</button>
    </form>

    <!-- 注册表单 -->
    <form v-else @submit.prevent="handleRegister">
      <div class="form-group">
        <input
            type="text"
            v-model="registerForm.username"
            placeholder="用户名"
            required
        >
      </div>

      <div class="form-group">
        <input
            type="password"
            v-model="registerForm.password"
            placeholder="密码"
            required
        >
      </div>

      <div class="form-group">
        <input
            type="password"
            v-model="registerForm.confirmPassword"
            placeholder="确认密码"
            required
        >
      </div>

      <div class="form-group">
        <input
            type="text"
            v-model="registerForm.phone"
            placeholder="手机号"
            required
        >
      </div>
      <button type="submit" class="submit-btn">注册</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from "axios";
import request from '../../utils/request.ts'
import {alertEffects} from "element-plus";

interface LoginForm {
  phone: string
  password: string
  code: string
}

interface RegisterForm {
  username: string
  password: string
  confirmPassword: string
  phone:string
}

const router = useRouter()

// 选项卡状态
const activeTab = ref<'login' | 'register'>('login')

// 登录类型
const loginType = ref<'password' | 'code'>('password')

// 登录表单数据
const loginForm = reactive<LoginForm>({
  phone: '',
  password: '',
  code: ''
})

// 注册表单数据
const registerForm = reactive<RegisterForm>({
  username: '',
  password: '',
  confirmPassword: '',
  phone:'',
})

// 验证码倒计时
const countdown = ref(0)
let timer: number | null = null
const handleLogin=()=> {
  console.log(loginType.value)
  const apiPath = loginType.value === 'password'
      ? 'api/douyin/user/login'
      : 'api/douyin/user/login/code'

  const payload = loginType.value === 'password'
      ? {
        phone: loginForm.phone,
        password: loginForm.password
      }
      : {
        phone: loginForm.phone,
        verifyCode: loginForm.code
      }
  console.log(apiPath)
  request.post(apiPath, payload).then((res) => {
    if (res.data.success) {
      console.log(res.data)
      console.log(res)
      console.log(333)
      if ( loginType.value === 'code'){
        window.sessionStorage.setItem("token", res.data.token)
      }else {
        window.sessionStorage.setItem("token", res.data.token)

      }
      console.log(window.sessionStorage.getItem("token"))
      console.log(res.data.success)
      // 登录成功逻辑
      router.push('/')
    }else if (res.data === '用户不存在') {
      alert("用户不存在，请注册")
      activeTab.value = 'register'
    }else {
      alert(res.data.errorMsg)
    }

  })

  console.log("成功")
  console.log(window.sessionStorage.getItem("token"))

  // axios.defaults.headers.common['authorization'] = window.sessionStorage.getItem("token");    this.$store.commit('SET_TOKEN', data.token) // 状态管理‌:ml-citation{ref="7" data="citationList"}
  // this.$router.push('/dashboard') // 跳转逻辑‌:ml-citation{ref="3" data="citationList"}

}

const sendCode = () => {
  if (!/^1[3-9]\d{9}$/.test(loginForm.phone)) {
    alert('请输入有效的手机号')
    return
  }

  countdown.value = 60
  console.log(333)
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0 && timer) {
      clearInterval(timer)
      timer = null
    }
  }, 1000)
  request.post(`/api/douyin/user/code?phone=${loginForm.phone}`).then((res) => {
    console.log(res)
    console.log(333)
    // alert("您本次的验证码为"+res.data.data.code+"有效期5分钟")
    // console.log(window.sessionStorage.getItem("token"))
  })
}

// const handleLogin = async () => {
//   // 模拟登录逻辑
//   const userExists = Math.random() > 0.5 // 模拟用户是否存在
//
//   if (!userExists) {
//     alert('用户不存在，自动跳转注册')
//     activeTab.value = 'register'
//     return
//   }
//
//   // 登录成功逻辑
//   router.push('/chatim')
// }

const handleRegister = () => {
  if (registerForm.password !== registerForm.confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }
  console.log(registerForm)
  request.post("/api/register/user", {
    "phone": registerForm.phone,
    "password": registerForm.password,
    "userName": registerForm.username,
  }).then((res) => {
    let alertMsg = ""

    if (res.data.errorMsg === '用户已注册过，请登录') {
      activeTab.value = 'login'
      alertMsg = res.data.errorMsg
    }else if (res.data.code===200){
      alertMsg = "注册成功"
      activeTab.value = 'login'
    }
    alert(alertMsg)
  })
  // 清空注册表单
  Object.assign(registerForm, {
    username: '',
    password: '',
    confirmPassword: '',
    phone:'',
  })
}
</script>

<style scoped>
/* 抖音风格登录页面样式 */
.auth-modal {
  width: 100%;
  height: 100vh;
  background: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  box-sizing: border-box;
}

/* 标题样式 */
.tabs {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  position: relative;
}

.tabs button {
  background: none;
  border: none;
  color: #fff;
  font-size: 24px;
  padding: 0 20px;
  position: relative;
  opacity: 0.6;
  transition: all 0.3s;
}

.tabs button.active {
  opacity: 1;
  font-weight: 500;
}

.tabs button.active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: #FE2C55;
  border-radius: 2px;
}

/* 表单样式 */
form {
  width: 100%;
  max-width: 320px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group input {
  width: 100%;
  height: 48px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 16px;
  padding: 0 16px;
  transition: all 0.3s;
}

.form-group input:focus {
  background: rgba(255, 255, 255, 0.15);
  outline: none;
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

/* 登录方式切换 */
.login-type {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 30px;
}

.login-type label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.login-type input[type="radio"] {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  accent-color: #FE2C55;
}

/* 验证码按钮 */
.code-group {
  display: flex;
  gap: 12px;
}

.send-code {
  flex-shrink: 0;
  width: 120px;
  height: 48px;
  background: #FE2C55;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.send-code:disabled {
  background: rgba(254, 44, 85, 0.5);
  cursor: not-allowed;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 48px;
  background: #FE2C55;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 20px;
}

.submit-btn:hover {
  background: #ff3e6c;
  transform: translateY(-1px);
}

.submit-btn:active {
  transform: translateY(0);
}

/* 动画效果 */
@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(6px); }
  50% { transform: translateX(-6px); }
  100% { transform: translateX(0); }
}

/* 错误提示样式 */
.error-message {
  color: #FE2C55;
  font-size: 14px;
  margin-top: 4px;
  animation: shake 0.3s ease-in-out;
}
</style>

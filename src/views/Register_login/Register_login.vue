<script setup>
import { ref, reactive,onMounted } from 'vue';
import { useRouter } from "vue-router";
import axios from "axios";
import { useUserStore } from "../../stores/User"
import { ElMessage } from "element-plus";

const store = useUserStore();
const router = useRouter();

const showRegister = ref(false);
const usernameNew = ref('');
const passwordNew = ref('');
const Email = ref('');
const username = ref('');
const password = ref('');
const rememberName = ref(false);
const rememberAll = ref(false);

const validUsername = ref(false);
const validPassword = ref(false);
const validEmail = ref(false);

const Request = axios.create({
    baseURL: 'api',
    timeout: 3000,
    withCredentials: true,
});

let usernameValidationText = 'Username should be 1-12 Chinese or English characters or numbers'
let passwordValidationText = 'Password should be English characters or numbers more than 8 words and within 15 words';
let EmailValidationText = 'Please input your QQ-Email in the correct format';


function checkUsername(value) {
    const regex = /^[a-zA-Z0-9\u4e00-\u9fa5]{1,12}$/;
    validUsername.value = regex.test(value);
    usernameValidationText = validUsername.value ?
        'right!' :
        'Username should be 1-12 Chinese or English characters or numbers';
}

function checkPassword(value) {
    const regex = /^[a-zA-Z0-9]{8,15}$/;
    validPassword.value = regex.test(value);
    passwordValidationText = validPassword.value ?
        'right!' :
        'Password should be English characters or numbers more than 8 words and within 15 words';
}

function checkEmail(value) {
    const regex = /^[1-9]\d{7,10}@qq\.com$/;
    validEmail.value = regex.test(value);
    EmailValidationText = validEmail.value ?
        'right!' :
        'Please input your QQ-Email in the correct format';
}

onMounted(() => {
    Request.get("/clearSession").then(
        (res) => {
            console.log(res);
            if (res.data.status == 'clear') {
                ElMessage({
                        type: "success",
                        message: "登录认证已重置",
                        duration: 2000,
                    });
            }
            else if (res.data.status != 'new'){
                ElMessage({
                        type: "error",
                        message: "出错了",
                        duration: 2000,
                    });
            }
        })
})
function handleRegister() {
    //注册合法
    if (validUsername.value && validPassword.value && validEmail.value) {
        const _username = usernameNew.value.trim(); //trim()方法用于处理空格
        console.log("姓名" + _username);
        console.log("密码" + passwordNew.value);
        console.log("邮箱" + Email.value);
        //发送请求
        let request = {
            userName: _username,
            password: passwordNew.value,
            email: Email.value,
        };
        Request.post("/register", request).then(
            (res) => {
                console.log(res);
                if (res.data.status == "registerSucceed") {
                    //清空内容,切换至登录界面
                    toggleForm();
                    //成功通知
                    ElMessage({
                        type: "success",
                        message: "注册成功！",
                        duration: 2000,
                    });
                    setTimeout(() => {
                        router.push("/");
                    }, 500);
                } else if (res.data.status == "renameFail") {
                    ElMessage({
                        type: "error",
                        message: "你取得用户名和别人重名了",
                        duration: 2000,
                    });
                }
                else if (res.data.status == "nullAgainst") {
                    ElMessage({
                        type: "error",
                        message: "传输出错！注册信息存在空值",
                        duration: 2000,
                    });
                }
            })
    }
}

function handleLogin() {
    const _username = username.value.trim(); //trim()方法用于处理空格
    let yy = new Date().getFullYear();
    let mm = new Date().getMonth() + 1;
    let dd = new Date().getDate();
    const weeks = new Array("Sun.", "Mon.", "Tues.", "Wed.", "Thur.", "Fri.", "Sat.");
    let nowWeek = weeks[new Date().getDay()];
    //非空
    if (_username != '' && password.value != '') {
        //发送请求
        let request = {
            userName: _username,
            password: password.value,
            lastLoginTime:  yy + '-' + (mm < 10 ? '0' + mm : mm) + '-' + (dd < 10 ? '0' + dd : dd)
        };
        Request.post("/login", request).then(
            (res) => {
                console.log(res);
                if (res.data.status == "loginSucceed") {
                    // 本地、pinia存储用户名等用户信息
                    localStorage.setItem("userName", _username);
                    localStorage.setItem("todayNum", res.data.todayNum);
                    localStorage.setItem("allNum", res.data.allNum);
                    localStorage.setItem("todayTime", res.data.todayTime);
                    localStorage.setItem("allTime", res.data.allTime);
                    localStorage.setItem("teamId", res.data.teamId);
                    localStorage.setItem("userId", res.data.userId);
                    localStorage.setItem("chooseBookId", res.data.bookId);
                    localStorage.setItem("lastClockinTime", res.data.lastClockinTime);
                    localStorage.setItem("accumulateDay", res.data.accumulateDay);

                    store.$patch({
                        userId: res.data.userId,
                        userName: _username,
                        todayNum: res.data.todayNum,
                        allNum: res.data.allNum,
                        todayTime: res.data.todayTime,
                        allTime: res.data.allTime,
                        teamId: res.data.teamId,
                        chooseBookId: res.data.bookId,
                        nowDay: nowWeek,
                    })
                    //清空内容
                    clearForm();
                    console.log(res.data.bookId);
                    if (res.data.bookId != null) {
                        setTimeout(() => {
                            router.push("/main");
                        }, 100);
                        ElMessage({
                        type: "success",
                        message: _username + "，好久不见！",
                        duration: 2000,
                    });
                    }
                    else {
                        setTimeout(() => {
                            router.push("/dashboard");
                        }, 100);
                        ElMessage({
                        type: "success",
                        message: _username + "，好久不见！请先选择一本单词书再开始学习",
                        duration: 2000,
                    });
                    }
                    //成功通知

                } else if (res.data.status == "PasswordWrong") {
                    ElMessage({
                        type: "error",
                        message: "密码错误",
                        duration: 2000,
                    });
                }
                else if (res.data.status == "UserNotExist") {
                    ElMessage({
                        type: "error",
                        message: "用户不存在",
                        duration: 2000,
                    });
                }
            })
    }
    else {
        ElMessage({
            type: "error",
            message: "用户名或密码不能为空！",
            duration: 2000,
        });
    }
}

function toggleForm() {
    showRegister.value = !showRegister.value;
    clearForm();
}

function clearForm() {
    usernameNew.value = '';
    passwordNew.value = '';
    Email.value = '';
    username.value = '';
    password.value = '';
    rememberName.value = false;
    rememberAll.value = false;
    validUsername.value = false;
    validPassword.value = false;
    validEmail.value = false;
    usernameValidationText = '';
    passwordValidationText = '';
    EmailValidationText = '';
}

function forget() {
    router.push("/forget");
}

</script>
<template>
    <div class="allbox">
        <div class="main" :class="{ 'short': !showRegister, 'tall': showRegister }">
            <div class="new-box" :class="{ 'left': !showRegister, 'mid': showRegister }">
                <div class="title">register</div>
                <form @submit.prevent="handleRegister">
                    <ul>
                        <li>
                            <input v-model="usernameNew" type="text" placeholder="Username"
                                @keyup="checkUsername(usernameNew)" />
                        </li>
                        <li class="namejudge" :class="{ 'wrong': !validUsername, 'right': validUsername }">
                            {{ usernameValidationText }}
                        </li>
                        <li>
                            <input v-model="passwordNew" type="password" placeholder="Password"
                                @keyup="checkPassword(passwordNew)" />
                        </li>
                        <li class="passwordjudge" :class="{ 'wrong': !validPassword, 'right': validPassword }">
                            {{ passwordValidationText }}
                        </li>
                        <li>
                            <input v-model="Email" type="text" placeholder="Email" @keyup="checkEmail(Email)" />
                        </li>
                        <li class="Emailjudge" :class="{ 'wrong': !validEmail, 'right': validEmail }">
                            {{ EmailValidationText }}
                        </li>
                        <li class="change-login" @click="toggleForm">login an existing account?</li>
                        <li class="btn-new">
                            <button type="submit">SUBMIT</button>
                        </li>
                    </ul>
                </form>
            </div>
            <div class="login-box" :class="{ 'mid': !showRegister, 'left': showRegister }">
                <div class="title">login</div>
                <form @submit.prevent="handleLogin">
                    <ul>
                        <li>
                            <input v-model="username" type="text" placeholder="Username" />
                        </li>
                        <li>
                            <input v-model="password" type="password" placeholder="Password" />
                        </li>
                        <li>
                            <input v-model="rememberName" type="checkbox" id="remember1" />
                            <span>remember name</span>
                            <input v-model="rememberAll" type="checkbox" id="remember2" :disabled="!rememberName" />
                            <span>remember all</span>
                        </li>
                        <li class="change-new word-left" @click="toggleForm">register a new account?</li>
                        <li class="change-new word-right" @click="forget">forget the password?</li>
                        <li class="btn">
                            <button type="submit">SUBMIT</button>
                        </li>
                    </ul>
                </form>
            </div>
        </div>
    </div>
</template>
<style scoped>
@import 'Register_login.css';
</style>
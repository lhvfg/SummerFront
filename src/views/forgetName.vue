<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from "vue-router";
import axios from "axios";
import { useUserStore } from "../stores/User"
import { ElMessage } from "element-plus";

const passwordNew = ref('');
const username = ref('');
const validPassword = ref(false);
const code = ref('');
const router = useRouter();
const Request = axios.create({
    baseURL:'api',
    timeout: 3000,
    withCredentials: true,
});
let codeRequest = ref('get code');
let passwordValidationText = '';
const timeCheck = ref(false);
const waitTime = 10;
let _username = '';

function checkPassword(value) {
    const regex = /^[a-zA-Z0-9]{8,15}$/;
    validPassword.value = regex.test(value);
    passwordValidationText = validPassword.value ?
        'right!' :
        'Password should be English characters or numbers more than 8 words and within 15 words';
}

function clearForm() {
    code.value = '';
    username.value = '';
    passwordNew.value = '';
}

function back() {
    clearForm();
    setTimeout(() => {
        router.push("/");
    }, 500);
}

function getCode() {
    _username = username.value.trim(); //trim()方法用于处理空格
    const regex = /^[a-zA-Z0-9\u4e00-\u9fa5]{1,12}$/;
    if (regex.test(_username)) {
        let request = {
            requestType: "changePasswordRequest",
            userName: _username,
        }
        Request.post("/changePassword", request).then(
            (res) => {
                console.log(res);
                if (res.data.status == "UserNotExist") {
                    ElMessage({
                        type: "error",
                        message: "用户名不存在！",
                        duration: 2000,
                    });
                } else if (res.data.status == "emailSented") {
                    ElMessage({
                        type: "succees",
                        message: "验证码已发送至注册邮箱,300秒后过期!" + waitTime + "秒后可重新发送",
                        duration: 3000,
                    });
                    timeCheck.value = true;
                    codeRequest.value = 'wait';
                    console.log("按钮失效");
                    setTimeout(() => {
                        timeCheck.value = false;
                        console.log("按钮恢复");
                        codeRequest.value = 'get code';
                    }, waitTime * 1000);
                }

            }
        )
    }
    else {
        ElMessage({
            type: "error",
            message: "用户名不可为空",
            duration: 3000,
        });
    }
}

function handleChangePassword() {
    if (validPassword.value) {
        let request = {
            requestType: "changePasswordTest",
            userName: _username,
            password: passwordNew.value,
            code: code.value,
        };
        Request.post("/changePassword", request).then(
            (res) => {
                console.log(res);
                if (_username == null) {
                    ElMessage({
                        type: "error",
                        message: "异常刷新，请重新获取验证码",
                        duration: 2000,
                    });
                }
                else if (res.data.status == "changePasswordSucceed") {
                    //清空内容,切换至登录界面
                    clearForm();
                    setTimeout(() => {
                        router.push("/");
                    }, 500);
                    //成功通知
                    ElMessage({
                        type: "success",
                        message: _username + ",修改密码成功！",
                        duration: 2000,
                    });
                }
                else if (res.data.status == "codaWrong") {
                    ElMessage({
                        type: "error",
                        message: "验证码错误",
                        duration: 2000,
                    });
                }
                else if (res.data.status == "changePasswordSucceed") {
                    ElMessage({
                        type: "error",
                        message: "验证码已过期",
                        duration: 2000,
                    });
                }
            })

    }
}
</script>
<template>
    <div style="width: 98vw;height: 100vw;background-color: #d7daca;">
        <div class="main tall">
            <div class="new-box mid">
                <div class="title">change password</div>
                <form @submit.prevent="handleChangePassword">
                    <ul>
                        <li>
                            <input v-model="username" type="text" placeholder="Username" />
                        </li>
                        <li>
                            <input v-model="code" type="text" placeholder="code" />
                            <button
                                style="background-color: white;width: 68px;height: 30px;border-radius: 5px;margin-left: 25px;font-size: 15px;"
                                @click="getCode" :disabled="timeCheck">{{ codeRequest }}</button>
                        </li>
                        <li>
                            <input v-model="passwordNew" type="password" placeholder="New Password"
                                @keyup="checkPassword(passwordNew)" />
                        </li>
                        <li class="passwordjudge" :class="{ 'wrong': !validPassword, 'right': validPassword }">
                            {{ passwordValidationText }}
                        </li>
                        <li class="change-login" @click="back">login or register the account?</li>
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
* {
    padding: 0;
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
}

body {
    /* background: url(../绘蓝杯1/插画集/10.png) center center no-repeat;
            background-size: contain; */
    background-color: #d7daca;
    height: 98vw;
    width: 100vw;
}

.imgbox {
    overflow: hidden;
    height: 100%;
    /* width: 1280px; */
}

.background {
    width: 100vw;
    transform: scale(1.06);
    height: 56vw;
    top: 0;
    left: 0;
    z-index: -6;
}

.main {
    background: #15152a11;
    width: 379px;
    position: absolute;
    left: 50%;
    top: 47.5%;
    transform: translate(-50%, -50%) scale(1.2);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(4px);
    box-shadow: 0px 0px 5px 5px rgb(0 0 0 / 39%);
    border-radius: 11px;
    flex-wrap: wrap;
    overflow: hidden;
}

.short,
.tall {
    transition: all .3s;
}

.short {
    height: 400px;
}

.tall {
    height: 490px;
}

.new-box,
.login-box {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    flex-direction: column;
}

.left,
.mid {
    top: 50%;
    transform: translate(-50%, -50%);
    transition: all .4s;
}

.left {
    left: -400px;
}

.mid {
    left: 50%;
}

ul {
    margin-top: 105px;
}

li {
    list-style: none;
    text-align: center;
    padding-top: 11px;
}

li input {
    font-size: 20px;
    border: none;
    box-sizing: border-box;
    padding: 5px;
    background-color: transparent;
    border-bottom: 1px solid white;
    outline: none;
    color: white;
}

li button {
    font-size: 20px;
    padding: 5px;
    background-color: transparent;
    color: black;
    border: 0;
}

.title {
    font-weight: 900;
    color: white;
    margin: 17px 0px -65px;
    font-size: 36px;
}

ul span {
    margin-right: 8px;
    color: wheat;
}

.btn,
.btn-new {
    position: relative;
}

.btn::after,
.btn-new::after {
    position: absolute;
    content: '';
    bottom: -1px;
    left: 50%;
    transform: translate(-50%, -50%);
    display: block;
    background-color: rgb(255, 122, 58);
    height: 2px;
    width: 7px;
    color: white;
    transition: all .2s;
}

.btn:hover::after,
.btn-new:hover::after {
    width: 85px;
}

.change-new,
.change-login {
    color: aqua;
    font-size: 13px;
}

.change-new:hover,
.change-login:hover {
    cursor: pointer;
}

.wrong,
.right {
    font-size: 15px;
    width: 375px;
}

.wrong {
    color: hotpink;
}

.right {
    color: #00c700;
}

#Email::-webkit-input-placeholder {
    color: rgb(183, 176, 176);
}

button {
    cursor: pointer;
}

.word-left {
    left: 30px;
}

.word-right {
    right: 30px;
}
</style>
<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from "vue-router";
import axios from "axios";
import { useUserStore } from "../../stores/User"

let router = useRouter();
let Request = axios.create({
    baseURL: '/api',
    timeout: 3000,
    withCredentials: true,
});
let store = useUserStore();
const userId = localStorage.getItem("userId");
const bookId = localStorage.getItem("chooseBookId")

const bookNum = ref(0)
const allRecitedNum = ref(0)
const starNum = ref(0)
const noteNum = ref(0)
//获取数据
onMounted(() => {
    let request = {
        requestType: "getData",
        userId: userId,
        bookId: bookId
    }
    Request.post("/mycontent", request).then(
        (res) => {
            console.log(res);
            if (res.data.status == 'getDataSuccess') {
                bookNum.value = res.data.contentNumData.bookNum;
                allRecitedNum.value = res.data.contentNumData.allRecitedNum;
                starNum.value = res.data.contentNumData.starNum;
                noteNum.value = res.data.contentNumData.noteNum;
            }
            else if (res.data.status == 'block') {
                router.push('/login');
                ElMessage({
                    type: "error",
                    message: "登陆过期或未登录！",
                    duration: 2000,
                });
            }
        }
    )
})
//页面跳转    
function backToMain() {
    setTimeout(() => {
        router.push('/main');
    }, 500)
};
function learning() {
    setTimeout(() => {
        router.push('/learning');
    }, 500)
};
function allRecited() {
    setTimeout(() => {
        router.push('/allRecited');
    }, 500)
};
function star() {
    setTimeout(() => {
        router.push('/star');
    }, 500)
};
function note() {
    setTimeout(() => {
        router.push('/note');
    }, 500)
};
</script>
<template>
    <div>
        <div class="main">
            <div class="top">
                <span class="viewName">我的内容</span>
                <button class="buttonCommon outButton">
                    <el-icon @click="backToMain()">
                        <ArrowLeft />
                    </el-icon>
                </button>
            </div>
            <div class="whiteBox" style="margin-top: 70px;">
                <div class="buttonBox" @click="learning">
                    <el-icon class="icon iconGreen">
                        <Management />
                    </el-icon>
                    <button class="buttonCommon">在学词书</button>
                    <span class="rightWord1">{{ bookNum }}</span>
                    <span class="rightWord2">词</span>
                    <el-icon class="rightArrow">
                        <ArrowRightBold />
                    </el-icon>
                    
                </div>
            </div>
            <div class="whiteBox">
                <div class="buttonBox" @click="allRecited">
                    <el-icon class="icon iconYellow">
                        <Checked />
                    </el-icon>
                    <button class="buttonCommon">全部已学</button>
                    <span class="rightWord1">{{ allRecitedNum }}</span>
                    <span class="rightWord2">词</span>
                    <el-icon class="rightArrow">
                        <ArrowRightBold />
                    </el-icon>
                </div>
            </div>
            <div class="whiteBox">
                <div class="buttonBox" @click="star">
                    <el-icon class="icon iconBlue">
                        <Collection />
                    </el-icon>
                    <button class="buttonCommon">生词本</button>
                    <span class="rightWord1">{{ starNum }}</span>
                    <span class="rightWord2">词</span>
                    <el-icon class="rightArrow">
                        <ArrowRightBold />
                    </el-icon>
                </div>
                <div class="buttonBox">
                    <el-icon class="icon iconBlue">
                        <ChatLineSquare />
                    </el-icon>
                    <button class="buttonCommon">
                        句库
                    </button>
                    <span class="rightWord1">0</span>
                    <span class="rightWord2">句</span>
                    <el-icon class="rightArrow">
                        <ArrowRightBold />
                    </el-icon>
                </div>
                <div class="buttonBox" @click="note">
                    <el-icon class="icon iconBlue">
                        <EditPen />
                    </el-icon>
                    <button class="buttonCommon">
                        笔记
                    </button>
                    <span class="rightWord1">{{ noteNum }}</span>
                    <span class="rightWord2">条</span>
                    <el-icon class="rightArrow">
                        <ArrowRightBold />
                    </el-icon>
                </div>
            </div>
        </div>
</div></template>
<style scoped>@import './mycontent.css';</style>
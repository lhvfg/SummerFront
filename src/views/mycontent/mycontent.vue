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
//回到主页面
function backToMain() {
    setTimeout(() => {
        router.push('/main');
    }, 500)}
</script>
<template>

<div> 
    <div class="main">
        <div class="top">
            <span class="viewName">我的内容</span>
            <button class="buttonCommon outButton">
            <el-icon @click="backToMain()"><ArrowLeft /></el-icon>
            </button>
        </div>
        <div class="whiteBox" style="margin-top: 70px;">
            <div class="buttonBox" @click="addWord">
                <el-icon class="icon iconGreen"><Management /></el-icon>
                <button class="buttonCommon" >在学词书</button>
                <el-icon class="rightArrow"><ArrowRight /></el-icon>
            </div>
        </div>
        <div class="whiteBox">
            <div class="buttonBox" @click="addWord">
                <el-icon class="icon iconYellow"><Checked /></el-icon>
                <button class="buttonCommon" >全部已学</button>
                <el-icon class="rightArrow"><ArrowRight /></el-icon>
            </div>
        </div>
        <div class="whiteBox">
            <div class="buttonBox" @click="addBook">
                <el-icon class="icon iconBlue"><Collection /></el-icon>
                <button class="buttonCommon" >生词本</button>
                <el-icon class="rightArrow"><ArrowRight /></el-icon>
            </div>
            <div class="buttonBox">
                <el-icon class="icon iconBlue"><ChatLineSquare /></el-icon>
                <button class="buttonCommon" >
                    句库
                </button>
                <el-icon class="rightArrow"><ArrowRight /></el-icon>
            </div>
            <div class="buttonBox">
                <el-icon class="icon iconBlue"><EditPen /></el-icon>
                <button class="buttonCommon" >
                    笔记
                </button>
                <el-icon class="rightArrow"><ArrowRight /></el-icon>
            </div>
        </div>
    </div>
</div>
</template>
<style scoped>
@import './mycontent.css';
</style>
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

console.log(userId);
console.log(bookId);


const data = ref({
    bookName: '',

})

onMounted(() => {
    let request = {
        requestType: "getData",
        userId: userId,
        bookId: bookId
    }
    Request.post("/dashboard", request).then(
        (res) => {
            console.log(res);
            if (res.data.status == 'getDataSuccess') {
                data.value = res.data.dashBoardData;

            }
        }
    )
})
</script>
<template>
    <div class="main">
        <div class="top">
            <button class="outButton" @click="reciteOver"><el-icon>
                    <ArrowLeft />
                </el-icon></button>
            <span style="position: absolute; top: 13.2px; left: 45%;">仪表盘</span>
        </div>
        <div class="nowLearnBox">
            <h2>正在学习</h2>
            <div>{{ data.bookName }}</div>
            <span>生词本{{ data.starNum }}</span>
            <div>
                <div>
                    <span>已学习{{ data.recitedNum }}</span>
                    <span>总词数{{ data.allStudyNum }}</span>
                </div>
            </div>
        </div>
        <div class="myDataBox">
            <h2>我的数据</h2>
            <div>
                <div>
                    <span>今日学习&复习</span>
                    <span><span>{{ data.todayNum }}</span>词</span>
                </div>
                <div>
                    <span>累计学习</span>
                    <span><span>{{ data.allRecitedNum }}</span>词</span>
                </div>
                <div>
                    <span>今日学习时间</span>
                    <span><span>{{ data.todayTime }}</span>分钟</span>
                </div>
                <div>
                    <span>今日学习&复习</span>
                    <span><span>{{ data.allTime }}</span>分钟</span>
                </div>
            </div>
            <div>
                <span>日历</span>
            </div>
        </div>
    </div>
</template>
<style scoped>
@import './dashboard.css';
</style>
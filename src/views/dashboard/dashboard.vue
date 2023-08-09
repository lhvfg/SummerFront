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

const starNum = ref();
const bookName = ref();
const recitedNum = ref();
const allStudyNum = ref();
const todayNum = ref();
const allRecitedNum = ref();
const todayTime = ref();
const allTime = ref();

</script>
<template>
<div>
    <h2>正在学习</h2>
    <div>{{ bookName }}</div>
    <span>生词本{{ starNum }}</span>
    <div>
        <div>
            <span>已学习{{ recitedNum }}</span>
            <span>总词数{{ allStudyNum }}</span>
        </div>
    </div>
</div>
<div>
<h2>我的数据</h2>
<div>
    <div>
        <span>今日学习&复习</span>
        <span><span>{{ todayNum }}</span>词</span>
    </div>
    <div>
        <span>累计学习</span>
        <span><span>{{ allRecitedNum }}</span>词</span>
    </div>
    <div>
        <span>今日学习时间</span>
        <span><span>{{ todayTime }}</span>分钟</span>
    </div>
    <div>
        <span>今日学习&复习</span>
        <span><span>{{ allTime }}</span>分钟</span>
    </div>
</div>     
</div>
<div>
    <span>日历</span>
</div>

</template>
<style scoped>

</style>
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

const note = ref([])
//现在点的单词序号
const nowClick = ref(null);
//获取数据
onMounted(() => {
    let request = {
        requestType: "getNote",
        userId: userId
    }
    Request.post("/mycontent", request).then(
        (res) => {
            console.log(res);
            if (res.data.status == 'getNote') {
                note.value = res.data.noteData;
                console.log(note.value);
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

//处理点击
function handleClick(i) {
    nowClick.value = i;
}
//页面跳转    
function back() {
    setTimeout(() => {
        router.push('/mycontent');
    }, 500)
};
</script>
<template>
<div class="main" style="background-color: white;">
        <div class="top">
            <span class="viewName">笔记</span>
            <button class="buttonCommon outButton">
                <el-icon @click="back()">
                    <ArrowLeft />
                </el-icon>
            </button>
        </div>
        <div class="whiteBoxPlus">
            <div class="wordList">
                <ul>
                    <li v-for="(n,index) in note" @click="handleClick(index)" class="wordBox" :class="{ 'orangeBox': nowClick == index }">
                        <span>{{ n.spell }}</span>
                        <ul style="list-style: circle;font-size: 14px;">
                            <li v-for="note in n.notes" style="margin: 3px;">
                                <span>{{ note.content }}</span>
                            </li>
                        </ul>
                        <el-divider class="wordLine" />
                    </li>
                </ul>
            </div>
        </div>
    </div>

</template>
<style scoped>@import './mycontent.css';</style>
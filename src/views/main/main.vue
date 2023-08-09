<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from "vue-router";
import axios from "axios";
import { useUserStore } from "../../stores/User"
import { storeToRefs } from 'pinia';

const store = useUserStore();
const router = useRouter();
const learnNum = ref(0);
const reviewNum = ref(0);
const Request = axios.create({
    baseURL: '/api',
    timeout: 3000,
    withCredentials: true,
});
const bookId = ref(localStorage.getItem("chooseBookId"));
const userId = ref(localStorage.getItem("userId"));

var month = ref(new Date().getMonth() + 1);
month.value = (month.value < 10 ? '0' : '') + month.value;
var day = ref(new Date().getDate());
day.value = (day.value < 10 ? '0' : '') + day.value + '  ';
const weeks = ref(["Sun.", "Mon.", "Tues.", "Wed.", "Thur.", "Fri.", "Sat."]);
const nowDay = computed(() => weeks.value[new Date().getDay()]);
const successive = ref(1);
const drawer = ref(false);

onMounted(() => {
    let request1 = {
        requestType: "getNum",
        bookId: bookId.value,
        userId: userId.value,
        today: store.Today
    };
    let request2 = {
        requestType: "getNum",
        bookId: bookId.value,
        userId: userId.value
    };
    Request.post("/review", request1).then(
        (res) => {
            console.log(res);
            if (res.data.status == 'reciteNumSuccess') {
                reviewNum.value = res.data.wordNum;
                store.$patch({ reviewNum: reviewNum.value });
                console.log(store.$state.reviewNum);
            }
            else if (res.data.status == 'block') {
                router.push('/login');
                ElMessage({
                    type: "error",
                    message: "登陆过期或未登录！",
                    duration: 2000,
                });
            }
            else {
                ElMessage({
                    type: "error",
                    message: "出错了",
                    duration: 2000,
                });
            }
        })
    Request.post("/recite", request2).then(
        (res) => {
            console.log(res);
            if (res.data.status == 'learnNumSuccess') {
                learnNum.value = res.data.wordNum;
            }
            else if (res.data.status == 'block') {
                router.push('/login');
                ElMessage({
                    type: "error",
                    message: "登陆过期或未登录！",
                    duration: 2000,
                });
            }
            else {
                ElMessage({
                    type: "error",
                    message: "出错了",
                    duration: 2000,
                });
            }
        })
})
function Learn() {
    if (learnNum.value > 0) {
        setTimeout(() => {
            router.push('/learn');
        }, 500);
    }
    else {
        ElMessage({
            type: "error",
            message: "没有要学习的单词！",
            duration: 2000,
        });
    }
}
function manageContent() {
    setTimeout(() => {
        router.push('/contentManager');
    }, 500);
}
function Review() {
    if (reviewNum.value > 0) {
        setTimeout(() => {
            router.push('/review');
        }, 500);
    }
    else {
        ElMessage({
            type: "error",
            message: "没有要复习的单词！",
            duration: 2000,
        });
    }
}
function logout() {
    Request.get('/clearSession').then(
        (res)=>{
            console.log(res);
            if(res.data.status == 'clear')
            {
                ElMessage({
                    type: "success",
                    message: "已清除登录数据",
                    duration: 2000,
                });
                router.push('/login');
            }
            else{
                ElMessage({
                    type: "error",
                    message: "出错了",
                    duration: 2000,
                });
            }
        }
    )
}
</script>
<template>
    <div class="allbox">
        <div>
            <button class="avatarBox" @click="drawer = true">
                <el-avatar class="avatar" src="../../public/default.jpg"></el-avatar>
            </button>
            <el-drawer v-model="drawer" title="I am the title" :with-header="false" direction="ltr" class="drawerBox">
                <button class="drawerButton"><el-icon class="drawerImg"><User /></el-icon><span class="drawerWord">个人设置</span><el-icon class="right"><ArrowRight /></el-icon></button>
                <button class="drawerButton" @click="logout()"><el-icon class="drawerImg"><House /></el-icon><span class="drawerWord">退出登录</span><el-icon class="right"><ArrowRight /></el-icon></button>
            </el-drawer>
        </div>
        <button class="daka">
            <el-icon>
                <Calendar style="height: 26px;width: 22px;transform: scale(1.8);margin-bottom: -40px;" />
            </el-icon>
            <span style="margin-top: 48px;">签到</span>
            <span v-if="true" style="margin-top: 7px;margin-bottom: 12px;">{{ month }}/{{ day }}{{ nowDay }}</span>
            <span v-if="false" style="margin-top: 7px;margin-bottom: 12px;">已连续登录{{ successive }}天</span>
        </button>
        <div class="mid">
            <el-button text @click="Learn" class="glass studyButton">
                <div style="flex-direction: column;">
                    <span class="word">Learn</span>
                    <span class="red">{{ learnNum }}</span>
                </div>
            </el-button>
            <el-button text @click="Review" class="glass studyButton">
                <div style="flex-direction: column;">
                    <span style="left: -19px;" class="word">Review</span>
                    <span class="red">{{ reviewNum }}</span>
                </div>
            </el-button>
        </div>
        <div class="button">
            <el-button text @click="manageContent">
                manageContent
            </el-button>
            <el-button text @click="myContent">
                myContent
            </el-button>
            <el-button text @click="dashboard">
                dashboard
            </el-button>
        </div>

    </div>
</template>
<style scoped>
@import './main.css';
</style>
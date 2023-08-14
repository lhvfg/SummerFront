<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from "vue-router";
import axios from "axios";
import { useUserStore } from "../../stores/User"
import { storeToRefs } from 'pinia';
import Dashboard from '../dashboard/dashboard.vue';

const Request = axios.create({
    baseURL: '/api',
    timeout: 3000,
    withCredentials: true,
});
const bookId = ref(localStorage.getItem("chooseBookId"));
const userId = ref(localStorage.getItem("userId"));
const store = useUserStore();
const router = useRouter();

let today;
const learnNum = ref(0);
const reviewNum = ref(0);
const successive = ref(0);
const drawer = ref(false);
const clockinValid = ref(false);
const clocking = ref(false);

var month = ref(new Date().getMonth() + 1);
month.value = (month.value < 10 ? '0' : '') + month.value;
var day = ref(new Date().getDate());
day.value = (day.value < 10 ? '0' : '') + day.value + '  ';
const weeks = ref(["Sun.", "Mon.", "Tues.", "Wed.", "Thur.", "Fri.", "Sat."]);
const nowDay = computed(() => weeks.value[new Date().getDay()]);

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
    let yy = new Date().getFullYear();
    let mm = new Date().getMonth() + 1;
    let dd = new Date().getDate();
    today = yy + '-' + (mm < 10 ? '0' + mm : mm) + '-' + (dd < 10 ? '0' + dd : dd);

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
        });
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
        });
    if (today != localStorage.getItem("lastClockinTime")) {
        clockinValid.value = true;
    }
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
        (res) => {
            console.log(res);
            if (res.data.status == 'clear'||'new') {
                localStorage.clear();
                ElMessage({
                    type: "success",
                    message: "已清除登录数据",
                    duration: 2000,
                });
                router.push('/login');
            }
            else {
                ElMessage({
                    type: "error",
                    message: "出错了",
                    duration: 2000,
                });
            }
        }
    )
}
function mycontent() {
    if (bookId == null) {
        ElMessage({
            type: "error",
            message: "清先选择要背的单词书！",
            duration: 2000,
        });
    }
    else
        router.push('/mycontent');
}
function dashboard() {
    if (bookId == null) {
        ElMessage({
            type: "error",
            message: "清先选择要背的单词书！",
            duration: 2000,
        });
    }
    else
        router.push('/dashboard');
}
function handleClockin() {
    if (clockinValid.value) {
        let request3 = {
            id: userId.value,
            lastClockinTime: today
        };
        Request.post("/clockin", request3).then(
            (res) => {
                console.log(res);
                if (res.data.status == 'clockInSuccess') {
                    successive.value = res.data.accumulateDay;
                    clocking.value = true;
                    localStorage.setItem("lastClockinTime",today)
                    localStorage.setItem("accumulateDay",successive.value)
                    setTimeout(()=>{
                        clocking.value = false;
                        clockinValid.value = false;
                    },3000)
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
            });
    }
}
</script>
<template>
    <div class="allbox">
        <div>
            <button class="avatarBox" @click="drawer = true">
                <el-avatar class="avatar" src="../../public/default.jpg"></el-avatar>
            </button>
            <el-drawer v-model="drawer" title="I am the title" :with-header="false" direction="ltr" size="260px"
                open-delay="0.4s">
                <button class="drawerButton"><el-icon class="drawerImg">
                        <User />
                    </el-icon><span class="drawerWord">个人设置</span><el-icon class="right">
                        <ArrowRight />
                    </el-icon></button>
                <button class="drawerButton" @click="logout()"><el-icon class="drawerImg">
                        <House />
                    </el-icon><span class="drawerWord">退出登录</span><el-icon class="right">
                        <ArrowRight />
                    </el-icon></button>
            </el-drawer>
        </div>
        <button :class="{ 'daka': clockinValid, 'dakaOver': !clockinValid }" @click="handleClockin()">
            <el-icon v-show="clockinValid && !clocking">
                <Calendar style="height: 26px;width: 22px;transform: scale(1.8);margin-bottom: -40px;" />
            </el-icon>
            <span v-show="clockinValid && !clocking" style="margin-top: 48px;">签到</span>
            <span v-show="clockinValid && !clocking" style="margin-top: 7px;margin-bottom: 12px;">{{ month }}/{{ day }}{{
                nowDay }}</span>
            <span v-show="clocking" style="scale: 2.2;margin-bottom: 17px;"><el-icon>
                    <Check />
                </el-icon></span>
            <span v-show="clocking" style="margin-top: 7px;margin-bottom: 12px;font-size: 15px;">已累计登录<span style="margin: 2px;color: #f56c6c;">{{ successive }}</span>天</span>
            <span v-show="!clockinValid" style="font-size: 38px;font-weight: bolder;">Clock</span>
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
        <div class="buttonBox">
            <button text @click="manageContent">
                <el-icon>
                    <DocumentAdd />
                </el-icon>
            </button>
            <button text @click="mycontent">
                <el-icon>
                    <Files />
                </el-icon>
            </button>
            <button text @click="dashboard">
                <el-icon>
                    <Histogram />
                </el-icon>
            </button>
        </div>

    </div>
</template>
<style scoped>@import './main.css';</style>
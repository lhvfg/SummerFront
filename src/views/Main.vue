<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from "vue-router";
import axios from "axios";
import { useUserStore } from "../stores/User"
import { storeToRefs } from 'pinia';

const store = useUserStore();
const router = useRouter();
const learnNum = 100;
const reciteNum = 100;
const Request = axios.create({
    baseURL:'/api',
    timeout: 3000,
    withCredentials: true,
});

const { userId } = storeToRefs(useUserStore());
console.log(userId.value);

var month = ref(new Date().getMonth() + 1);
month.value = (month.value < 10 ? '0' : '') + month.value;
var day = ref(new Date().getDate());
day.value = (day.value < 10 ? '0' : '') + day.value + '  ';
const weeks = ref(["Sun.", "Mon.", "Tues.", "Wed.", "Thur.", "Fri.", "Sat."]);
const nowDay = computed(() => weeks.value[new Date().getDay()]);

const successive = ref(1);
function Learn() {
    setTimeout(() => {
        router.push('/learn');
    }, 500);
}
function manageContent(){
    setTimeout(() => {
        router.push('/contentManager');
    }, 500); 
}
</script>
<template>
    <div class="allbox">
        <div>
            <el-avatar class="avatar"></el-avatar>
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
            <el-button text @click="Recite" class="glass studyButton">
                <div style="flex-direction: column;">
                    <span class="word">Recite</span>
                    <span class="red">{{ reciteNum }}</span>
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
* {
    padding: 0;
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
}

.allbox {
    height: 46.97vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0;
    padding: 0;
    background: url(/alarm.jpg);
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-size: cover;
    -moz-background-size: cover;
    -webkit-background-size: cover;
}

.avatar {
    position: relative;
    left: -557px;
    top: 25px;
    --el-avatar-size: 74px;
}

.daka {
    background: rgba(255, 255, 255, 0.65);
    /* box-shadow: 0 1px 11px 0 rgba(31, 38, 135, 0.37); */
    backdrop-filter: blur(19px);
    -webkit-backdrop-filter: blur(19px);
    border-radius: 34px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    width: 162px;
    height: 156px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.glass {
    background: rgba(255, 255, 255, 0.65);
    /* box-shadow: 0 1px 11px 0 rgba(31, 38, 135, 0.37); */
    backdrop-filter: blur(19px);
    -webkit-backdrop-filter: blur(19px);
    border-radius: 34px;
}

.mid {
    margin: 243px 0px 37px;
}

.red {
    color: rgb(255, 98, 0);
    position: relative;
    font-size: 17px;
    left: -42.7px;
}

.studyButton {
    width: 162px;
    height: 72px;
    font-size: 27px;
    border-radius: 7px;
    /* display: flex; */
    /* flex-direction: column; */
    margin: 0 150px;
}

.word {
    display: block;
    position: relative;
    left: -26px;
    font-size: 23px;
    /* font-family: unset; */
    top: 5px;
    color: black;
    font-weight: 500;
}
</style>
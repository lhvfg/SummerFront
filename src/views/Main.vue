<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from "vue-router";
import axios from "axios";
const learnNum =100;
const reciteNum =100;
window.onresize = function () {
            var el = document.getElementById('div');
            el.style.height = el.clientWidth + 'px';
        }

</script>
<template>
    <div class="allbox">
        <div>
            <el-avatar class="avatar"></el-avatar>
        </div>
        <button class="daka">
            <el-icon ><Calendar style="height: 26px;width: 22px;transform: scale(1.8);margin-bottom: -40px;" /></el-icon>
            <span style="margin-top: 48px;">签到</span>
            <span style="margin-top: 7px;margin-bottom: 12px;">已连续登录{{ day }}天</span>
        </button>
        <div class="mid">
            <el-button text @click="Learn" class="glass studyButton">
                Learn
                <span>{{ learnNum }}</span>
            </el-button>
            <el-button text @click="Recite" class="glass studyButton">
                Recite
                <span>{{ reciteNum }}</span>
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
.glass
{
    background: rgba(255, 255, 255, 0.65);
    /* box-shadow: 0 1px 11px 0 rgba(31, 38, 135, 0.37); */
    backdrop-filter: blur(19px);
    -webkit-backdrop-filter: blur(19px);
    border-radius: 34px;
}
.mid {
    margin: 243px 0px 37px;
}
.studyButton{
    width: 140px;
    height: 72px;
    font-size: 27px;
    border-radius: 15px;
    margin: 0 150px;
}
</style>
<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from "vue-router";
import axios from "axios";
import { useUserStore } from "../../stores/User"

let router = useRouter();
let Request = axios.create({
    baseURL: '/api',
    timeout: 30000,
    withCredentials: true,
});
let store = useUserStore();
const userId = localStorage.getItem("userId");
const bookId = localStorage.getItem("chooseBookId")

const all = ref([])
const bookName = ref('')
const unRecite = ref([])
const learning = ref([])
const recited = ref([])
const finish = ref([])

const hide = ref(true)

const allValid = ref(true)
const allWordValid = ref([])
const unReciteValid = ref(false)
const unReciteWordValid = ref([])
const learningValid = ref(false)
const learningWordValid = ref([])
const recitedValid = ref(false)
const recitedWordValid = ref([])
const finishValid = ref(false)
const finishWordValid = ref([])

const choseButton = ref([true, false, false, false])
let len = new Array;

const nowNum = ref();

//现在点的单词序号
const nowClick = ref();
//获取数据
onMounted(() => {
    let request = {
        requestType: "getStar",
        userId: userId,
        bookId: bookId
    }
    Request.post("/mycontent", request).then(
        (res) => {
            console.log(res);
            if (res.data.status == 'getStarSuccess') {
                unRecite.value = res.data.unRecite;
                len[0] = unRecite.value.length;
                learning.value = res.data.learning;
                len[1] = learning.value.length;
                recited.value = res.data.recited;
                len[2] = recited.value.length;
                finish.value = res.data.finish;
                len[3] = finish.value.length;
                all.value = all.value.concat(unRecite.value).concat(learning.value).concat(recited.value).concat(finish.value)
                console.log(all.value);
                ValidClear();
                handleShow(0);
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
function back() {
    setTimeout(() => {
        router.push('/mycontent');
    }, 500)
};
//处理显示
function handleShow(i) {
    nowClick.value = null;
    console.log(i + "被点击了");
    for (var j = 0; j < 5; j++) {
        choseButton.value[j] = false;
    }
    choseButton.value[i] = true;
    switch (i) {
        case 0: {
            allValid.value = true;
            unReciteValid.value = false;
            learningValid.value = false;
            recitedValid.value = false;
            finishValid.value = false;
            nowNum.value = len[0] + len[1] + len[2] + len[3];
            break;
        }
        case 1: {
            allValid.value = false;
            unReciteValid.value = true;
            learningValid.value = false;
            recitedValid.value = false;
            finishValid.value = false;
            nowNum.value = len[i - 1];
            break;
        }
        case 2: {
            allValid.value = false;
            unReciteValid.value = false;
            learningValid.value = true;
            recitedValid.value = false;
            finishValid.value = false;
            nowNum.value = len[i - 1];
            break;
        }
        case 3: {
            allValid.value = false;
            unReciteValid.value = false;
            learningValid.value = false;
            recitedValid.value = true;
            finishValid.value = false;
            nowNum.value = len[i - 1];
            break;
        }
        case 4: {
            allValid.value = false;
            unReciteValid.value = false;
            learningValid.value = false;
            recitedValid.value = false;
            finishValid.value = true;
            nowNum.value = len[i - 1];
            break;
        }
    }
}
//数组至false
function ValidClear() {
    //现在选中的置空
    nowClick.value = null;
    for (var i = 0; i < len[0] + len[1] + len[2] + len[3]; i++) {
        allWordValid.value[i] = false;
    }
    for (var i = 0; i < len[0]; i++) {
        unReciteWordValid.value[i] = false;
    }
    for (var i = 0; i < len[1]; i++) {
        learningWordValid.value[i] = false;
    }
    for (var i = 0; i < len[2]; i++) {
        recitedWordValid.value[i] = false;
    }
    for (var i = 0; i < len[3]; i++) {
        finishWordValid.value[i] = false;
    }
}
//数组至True
function ValidAvailable() {
    for (var i = 0; i < len[0] + len[1] + len[2] + len[3]; i++) {
        allWordValid.value[i] = true;
    }
    for (var i = 0; i < len[0]; i++) {
        unReciteWordValid.value[i] = true;
    }
    for (var i = 0; i < len[1]; i++) {
        learningWordValid.value[i] = true;
    }
    for (var i = 0; i < len[2]; i++) {
        recitedWordValid.value[i] = true;
    }
    for (var i = 0; i < len[3]; i++) {
        finishWordValid.value[i] = true;
    }
}
//处理点击
function handleClick(i) {
    nowClick.value = i; hide.value = false;
}
//收藏
function deleteStar(word) {
    let request = {
        requestType: "deleteStar",
        userId: userId,
        wordId: word.wordId
    };
    Request.post("/recite", request).then(
        (res) => {
            console.log(res);
            if (res.data.status == "deleteStar") {
                ElMessage({
                    type: "success",
                    message: "已从生词本中去除",
                    duration: 2000,
                });
                word.star = false;
            }
            else {
                ElMessage({
                    type: "error",
                    message: "出错了",
                    duration: 2000,
                });
            }
        })
}
function addStar(word) {
    let request = {
        requestType: "addStar",
        userId: userId,
        wordId: word.wordId
    };
    Request.post("/recite", request).then(
        (res) => {
            console.log(res);
            if (res.data.status == "addStar") {
                ElMessage({
                    type: "success",
                    message: "已添加进生词本",
                    duration: 2000,
                });
                word.star = true;
            }
            else {
                ElMessage({
                    type: "error",
                    message: "出错了",
                    duration: 2000,
                });
            }
        })
}
</script>
<template>
    <div class="main" style="background-color: white;">
        <div class="top">
            <span class="viewName">生词本</span>
            <button class="buttonCommon outButton">
                <el-icon @click="back()">
                    <ArrowLeft />
                </el-icon>
            </button>
            <el-icon v-show="!hide" class="eye" @click="hide = true, ValidClear()">
                <Hide />
            </el-icon>
            <el-icon v-show="hide" class="eye" @click="hide = false, ValidAvailable()">
                <View />
            </el-icon>
        </div>
        <div class="greyBox">
            <button class="buttonCommon contentChose" :class="{ 'white': choseButton[0] }"
                @click="handleShow(0)">全部</button>
            <el-divider direction="vertical" style="font-size: 10px; scale: 2;" />
            <button class="buttonCommon contentChose" :class="{ 'white': choseButton[1] }"
                @click="handleShow(1)">未学习</button>
            <el-divider direction="vertical" style="font-size: 10px; scale: 2;" />
            <button class="buttonCommon contentChose" :class="{ 'white': choseButton[2] }"
                @click="handleShow(2)">学习中</button>
            <el-divider direction="vertical" style="font-size: 10px; scale: 2;" />
            <button class="buttonCommon contentChose" :class="{ 'white': choseButton[3] }"
                @click="handleShow(3)">复习中</button>
            <el-divider direction="vertical" style="font-size: 10px; scale: 2;" />
            <button class="buttonCommon contentChose" :class="{ 'white': choseButton[4] }"
                @click="handleShow(4)">复习完成</button>
        </div>
        <div class="whiteBoxPlus">
            <div class="numTip">
                <div
                    style="height: 14px;width: 4.5px;background-color: grey;border-radius: 3px;display: inline-block;margin-right: 16px;">
                </div>
                <span style="line-height: 14px;">{{ nowNum }}词</span>
            </div>
            <el-divider style="width: 600px;margin: 12px 0 0 -45px;" />
            <div v-show="allValid" class="wordList">
                <ul>
                    <li v-for="(word, index) in all" class="wordBox" :class="{ 'orangeBox': nowClick == index }"
                        @click="allWordValid[index] = true, handleClick(index)">
                        <span :class="{ 'fontOrange': nowClick == index }">{{ word.spell }}</span>
                        <ul v-show="allWordValid[index]">
                            <li v-for="mean in word.meanings">
                                <span>{{ mean.part }}</span>
                                <span>{{ mean.content }}</span>
                            </li>
                            <button v-show="word.star" @click="deleteStar(word)" class="buttonCommon star"><el-icon>
                                    <StarFilled />
                                </el-icon></button>
                            <button v-show="!word.star" @click="addStar(word)" class="buttonCommon star"><el-icon>
                                    <Star />
                                </el-icon></button>
                        </ul>
                        <el-divider class="wordLine" />
                    </li>
                </ul>
            </div>
            <div v-show="unReciteValid" class="wordList">
                <ul>
                    <li v-for="(word, index) in unRecite" class="wordBox" :class="{ 'orangeBox': nowClick == index }"
                        @click="unReciteWordValid[index] = true, handleClick(index)">
                        <span :class="{ 'fontOrange': nowClick == index }">{{ word.spell }}</span>
                        <ul v-show="unReciteWordValid[index]">
                            <li v-for="mean in word.meanings">
                                <span>{{ mean.part }}</span>
                                <span>{{ mean.content }}</span>
                            </li>
                            <button v-show="word.star" @click="deleteStar(word)" class="buttonCommon star"><el-icon>
                                    <StarFilled />
                                </el-icon></button>
                            <button v-show="!word.star" @click="addStar(word)" class="buttonCommon star"><el-icon>
                                    <Star />
                                </el-icon></button>
                        </ul>
                        <el-divider class="wordLine" />
                    </li>
                </ul>
            </div>
            <div v-show="learningValid" class="wordList">
                <ul>
                    <li v-for="(word, index) in learning" class="wordBox" :class="{ 'orangeBox': nowClick == index }"
                        @click="learningWordValid[index] = true, handleClick(index)">
                        <span :class="{ 'fontOrange': nowClick == index }">{{ word.spell }}</span>
                        <ul v-show="learningWordValid[index]">
                            <li v-for="mean in word.meanings">
                                <span>{{ mean.part }}</span>
                                <span>{{ mean.content }}</span>
                            </li>
                            <button v-show="word.star" @click="deleteStar(word)" class="buttonCommon star"><el-icon>
                                    <StarFilled />
                                </el-icon></button>
                            <button v-show="!word.star" @click="addStar(word)" class="buttonCommon star"><el-icon>
                                    <Star />
                                </el-icon></button>
                        </ul>
                        <el-divider class="wordLine" />
                    </li>
                </ul>
            </div>
            <div v-show="recitedValid" class="wordList">
                <ul>
                    <li v-for="(word, index) in recited" class="wordBox" :class="{ 'orangeBox': nowClick == index }"
                        @click="recitedWordValid[index] = true, handleClick(index)">
                        <span :class="{ 'fontOrange': nowClick == index }">{{ word.spell }}</span>
                        <ul v-show="recitedWordValid[index]">
                            <li v-for="mean in word.meanings">
                                <span>{{ mean.part }}</span>
                                <span>{{ mean.content }}</span>
                            </li>
                            <button v-show="word.star" @click="deleteStar(word)" class="buttonCommon star"><el-icon>
                                    <StarFilled />
                                </el-icon></button>
                            <button v-show="!word.star" @click="addStar(word)" class="buttonCommon star"><el-icon>
                                    <Star />
                                </el-icon></button>
                        </ul>
                        <el-divider class="wordLine" />
                    </li>
                </ul>
            </div>
            <div v-show="finishValid" class="wordList">
                <ul>
                    <li v-for="(word, index) in finish" class="wordBox" :class="{ 'orangeBox': nowClick == index }"
                        @click="finishWordValid[index] = true, handleClick(index)">
                        <span :class="{ 'fontOrange': nowClick == index }">{{ word.spell }}</span>
                        <ul v-show="finishWordValid[index]">
                            <li v-for="mean in word.meanings">
                                <span>{{ mean.part }}</span>
                                <span>{{ mean.content }}</span>
                            </li>
                            <button v-show="word.star" @click="deleteStar(word)" class="buttonCommon star"><el-icon>
                                    <StarFilled />
                                </el-icon></button>
                            <button v-show="!word.star" @click="addStar(word)" class="buttonCommon star"><el-icon>
                                    <Star />
                                </el-icon></button>
                        </ul>
                        <el-divider class="wordLine" />
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>
<style scoped>@import './mycontent.css';</style>
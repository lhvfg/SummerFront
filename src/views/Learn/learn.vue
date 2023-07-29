<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from "vue-router";
import axios from "axios";
import { ElMessage } from "element-plus";
import { storeToRefs } from 'pinia';

const router = useRouter();
const Request = axios.create({
    baseURL: '/api',
    timeout: 3000,
    withCredentials: true,
});

const userId = localStorage.getItem("userId");
const bookId = localStorage.getItem("chooseBookId");
const reciteWord = ref(
    [[
        {
            wordId: 0,
            spell: '',
            meaning: [
                {
                    meaningContent: '',
                    function: ''
                }
            ],
            count: 0,
            notes: [{ content: '' }],
            sentence: [{
                sentenceContent: '',
                sentenceContentMean: ''
            }],
            synonymous: [{
                meaning: '',
                function: '',
                spell: ['']
            }],
            derived: [{
                spell: '',
                meanings: [
                    {
                        content: '',
                        function: ''
                    }
                ],
            }],
            star: false
        }
    ]]
)
const deriveWords = ref([{
    spell: '',
    meaning: [
        {
            content: '',
            function: '',
            id: 0,
            wordId: 0
        }
    ],
}])
const sentences = ref([{
    content: '',
    contentMean: ''
}])

let countFlag = ref([false]);
let maxNum = ref(10);
let len = ref([]);
//当前在背的是该count中的几个，从零开始
let nowNum = 0;
//现在在背的单词的拼写
let nowSpell = '';
//当前在背的是count几
let nowCount = 0;
//当前背完了几个单词
let recitedWordNum = ref(0);
let date = new Date();
let startTime;
let wordId;

const question = ref(true);
const tip1Valid = ref(false);
const tip2Valid = ref(false);
const meaningValid = ref(false);
const meanChose = ref(false);
const sentenceValid = ref(false);
const sentenceChineseValid = ref(false);
const prompt = ref(false);
const answerValid = ref(false);
const starValid = ref(false);
const deleteValid = ref(false);

onMounted(() => {
    startTime = parseInt(new Date().getTime() / 1000);
    let request = {
        requestType: "getWords",
        userId: userId,
        bookId: bookId,
    };
    Request.post("/recite", request).then(
        (res) => {
            console.log(res);
            console.log(111);
            if (res.data.status == "reciteWords") {
                reciteWord.value[0] = res.data.reciteNewWordDates;
                reciteWord.value[1] = res.data.reciteOneWordDates;
                reciteWord.value[2] = res.data.reciteTwoWordDates;
                console.log(reciteWord.value[0]);
                console.log(reciteWord.value[1]);
                console.log(reciteWord.value[2]);
                for (var i = 0; i < 3; i++) {
                    len[i] = reciteWord.value[i].length;
                }
                //明确要背的数量
                if (len[0] + len[1] + len[2] < 10) {
                    maxNum.value = len[0] + len[1] + len[2];
                }
                handleData(reciteWord);
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
function handleData(reciteWord) {
    console.log(222);
    console.log(reciteWord.value[nowCount].length);
    while (reciteWord.value[nowCount].length == 0 && nowCount < 3) {
        console.log("nowCount++");
        nowCount++;
        nowNum = 0;
    }
    if (reciteWord.value[nowCount].length > 0) {
        nowCount = reciteWord.value[nowCount][nowNum].count;
        nowSpell = reciteWord.value[nowCount][nowNum].spell;
        wordId = reciteWord.value[nowCount][nowNum].wordId;
        starValid.value = reciteWord.value[nowCount][nowNum].star;
        console.log(reciteWord.value[nowCount][nowNum].derived[0].spell);
        console.log(reciteWord.value[nowCount][nowNum].derived[0].meanings);
        handleDerive(reciteWord.value[nowCount][nowNum].derived);
        //处理显示绿球的数量
        handleCount(nowCount);
        handleSentence(reciteWord.value[nowCount][nowNum].sentence)
        handleShow();
    }
}
function handleCount(count) {
    for (var i = 0; i < count; i++) { countFlag.value[i] = true }
}
function handleShow() {
    if (question) {
        if (nowCount == 0) {
            tip1Valid.value = true;
            tip2Valid.value = false;
            meaningValid.value = false;
            meanChose.value = true;
            sentenceValid.value = false;
            prompt.value = false;
            answerValid.value = false;
        }
    }
}
function handleDerive(derives) {
    deriveWords.value = derives.map(
        (derive) => ({
            spell: derive.spell,
            meaning: derive.meanings
        })
    )
    console.log(deriveWords.value);
}
function handleSentence(s) {
    sentences.value = s.map(
        (sentence) => ({
            content: sentence.content,
            contentMean: sentence.contentMean
        })
    )
}
function reciteOver() {
    router.push('/main');
    let seconds = Math.floor(parseInt(new Date().getTime() / 1000) - startTime);
    let request = {
        requestType: "reciteOver",
        time: seconds,
        number: recitedWordNum.value,
        userId: userId
    }
    console.log(seconds);
    Request.post("/recite", request).then(
        (res) => {
            console.log(res);
            if (res.data.status == "timeNumChanged") {
                ElMessage({
                    type: "success",
                    message: "背诵数据已更新！",
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
}
function deleteStar() {
    let request = {
        requestType: "deleteStar",
        userId: userId,
        wordId: wordId
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
                starValid.value = false;
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
function addStar() {
    let request = {
        requestType: "addStar",
        userId: userId,
        wordId: wordId
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
                starValid.value = true;
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
function deleteWord() {
    let request = {
        requestType: "delete",
        userId: userId,
        wordId: wordId
    };
    Request.post("/recite", request).then(
        (res) => {
            console.log(res);
            if (res.data.status == "deleteSuccess") {
                ElMessage({
                    type: "success",
                    message: "已标熟",
                    duration: 2000,
                });
                deleteValid.value = true;
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
function undoDeleteWord() {
    let request = {
        requestType: "undoDelete",
        userId: userId,
        wordId: wordId
    };
    Request.post("/recite", request).then(
        (res) => {
            console.log(res);
            if (res.data.status == "undoDeleteSuccess") {
                ElMessage({
                    type: "success",
                    message: "取消标熟",
                    duration: 2000,
                });
                deleteValid.value = false;
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
    <div class="main">
        <div class="inner"></div>
        <div class="top">
            <button class="outButton" @click="reciteOver"><el-icon>
                    <ArrowLeft />
                </el-icon></button>
            <div class="reciteNum">
                <span>{{ recitedWordNum }}</span><span>/</span><span>{{ maxNum }}</span>
            </div>
            <div class="functionButton">
                <button v-show="starValid" @click="deleteStar">已收藏</button>
                <button v-show="!starValid" @click="addStar">收藏</button>
                <button v-show="!deleteValid" @click="deleteWord">标熟</button>
                <button v-show="deleteValid" @click="undoDeleteWord">已标熟</button>
            </div>
        </div>
        <div class="mid">
            <div class="share">
                <div class="spell_count">
                    <span class="spell">{{ nowSpell }}</span>
                    <ul>
                        <li class="point" :class="{ 'grey': !countFlag[2], 'green': countFlag[2] }"></li>
                        <li class="point" :class="{ 'grey': !countFlag[1], 'green': countFlag[1] }"></li>
                        <li class="point" :class="{ 'grey': !countFlag[0], 'green': countFlag[0] }"></li>
                    </ul>
                </div>
                <div v-show="meaningValid">
                    <ul>
                        <li>
                            <span>词性</span><span>释义</span>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="question">
                <span v-show="tip1Valid" class="tip1">先回想词义再选择，想不起来「看答案」</span>
                <ul class="meanChose" v-show="meanChose">
                    <li class="option"  v-for="(deriveWord, index) in  deriveWords.slice(0,4) ">
                        <div style="margin-left: 20px;">
                            <span class="Function">
                                {{ deriveWord.meaning[0].function }}
                            </span>
                            <span style="display: block;">
                                {{ deriveWord.meaning[0].content }}
                            </span>
                        </div>
                    </li>
                </ul>
                <ul v-show=" sentenceValid ">
                    <li>{{ sentences[0].content }}</li>
                    <li v-show=" sentenceChineseValid ">{{ sentences[0].contentMean }}</li>
                </ul>
                <button v-show=" prompt ">提示一下</button>
                <span v-show=" tip2Valid ">tip2</span>
            </div>

            <div v-show=" answerValid " class="answer">
                <div>
                    <ul>
                        <li>
                            派生内容
                        </li>
                        <li>
                            近义内容
                        </li>
                        <li>
                            笔记内容
                        </li>
                    </ul>
                    <ul>
                        <li>
                            <button>
                                派生按钮
                            </button>
                        </li>
                        <li>
                            <button>
                                近义按钮
                            </button>
                        </li>
                        <li>
                            <button>
                                笔记按钮
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="buttonBox">
            <div v-show=" question ">
                <button class="seeAnswer" v-show=" nowCount == 0 ">
                    <span class="linedown"  style="font-size: 17px;">看答案</span>
                </button>
                <button v-show=" nowCount != 0 ">
                    <span>认识</span>
                </button>
                <button v-show=" nowCount != 0 ">
                    <span>不认识</span>
                </button>
            </div>
            <div v-show=" !question ">
                <button>
                    <span>下一词</span>
                </button>
                <button>
                    <span>记错了</span>
                </button>
            </div>
        </div>


    </div>
</template>
<style scoped>
@import './learn.css';
</style>

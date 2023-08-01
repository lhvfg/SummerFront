<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from "vue-router";
import axios from "axios";
import { ElMessage } from "element-plus";
import { useUserStore } from "../../stores/User"

const router = useRouter();
const Request = axios.create({
    baseURL: '/api',
    timeout: 3000,
    withCredentials: true,
});
const store = useUserStore();

const userId = localStorage.getItem("userId");
const bookId = localStorage.getItem("chooseBookId");
//接收后端数据
const reciteWord = ref(
    [[
        {
            wordId: 0,
            spell: '',
            meaning: [
                {
                    content: '',
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
//实际选出的背诵单词
const zeroWord = ref([]);
const oneWord = ref([]);
const twoWord = ref([]);
//背诵总数
let maxNum = ref(10);
//count0/1/2各数组长度
let len = ref([]);
//当前单词的派生词
const deriveWords = ref([])
//当前单词的派生词选项
const deriveOption = ref([])
const sentences = ref([{
    content: '',
    contentMean: ''
}])
//当前在背第几轮
let trun = 0;
//现在在背的单词的id
let wordId;
//当前在背的是该count中的几个，从零开始
let nowNum = 0;
//现在在背的单词的拼写
let nowSpell = '';
//当前在背的是count几
let nowCount = 0;
//当前背完了几个单词
let recitedWordNum = ref(0);
//当前背的单词的释义
let nowMeaning = [
    {
        content: '',
        function: '',
        id: 0,
        wordId: 0
    }
]
//现在选择的正确选项
let ans;
//用于选项样式变化
const optionValid = ref([false]);
let date = new Date();
let startTime;

//问题界面显示的判定
const question = ref(true);
const tip1Valid = ref(false);
const tip2Valid = ref(false);
//单词释义显示的判定
const meaningValid = ref(false);
//释义选项显示的判定
const meanChose = ref(false);
//释义选项被选中的判定
let countFlag = ref([false]);
//例句显示的判定
const sentenceValid = ref(false);
//例句中文显示的判定
const sentenceChineseValid = ref(false);
//提示一下按钮
const prompt = ref(false);
//答案界面的判定
const answerValid = ref(false);
//收藏与标熟的判定
const starValid = ref(false);
const deleteValid = ref(false);
//显示选项答案的判定
const ansValid = ref(false)
//当前背对了没有
let flag = null;
//详细内容框显示的判定
const detailValid = ref(false);

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
                //count = 0
                zeroWord.value = reciteWord.value[0] = res.data.reciteNewWordDates;
                //count = 1
                reciteWord.value[1] = res.data.reciteOneWordDates;
                if (reciteWord.value[1].length > 0)
                    oneWord.value = reciteWord.value[1].splice(0, reciteWord.value[1].length > 3 ? 2 : reciteWord.value[1].length - 1);
                //count = 2
                reciteWord.value[2] = res.data.reciteTwoWordDates;
                if (reciteWord.value[2].length > 0)
                    twoWord.value = reciteWord.value[2].splice(0, reciteWord.value[2].length > 4 ? 3 : reciteWord.value[2].length - 1);
                //console.log(reciteWord.value[0]);
                //console.log(reciteWord.value[1]);
                //console.log(reciteWord.value[2]);
                for (var i = 0; i < 3; i++) {
                    len[i] = reciteWord.value[i].length;
                }
                //明确要背的数量
                if (len[0] + len[1] + len[2] < 10) {
                    maxNum.value = len[0] + len[1] + len[2];
                }
                handleData();
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
//初始化
function handleData() {
    console.log(222);
    //寻找数据
    while (reciteWord.value[nowCount].length == 0 && nowCount < 3) {
        console.log("nowCount++");
        nowCount++;
        nowNum = 0;
    }
    //找到数据
    if (reciteWord.value[nowCount].length > 0) {
        nowCount = reciteWord.value[nowCount][nowNum].count;
        nowSpell = reciteWord.value[nowCount][nowNum].spell;
        wordId = reciteWord.value[nowCount][nowNum].wordId;
        starValid.value = reciteWord.value[nowCount][nowNum].star;
        nowMeaning = reciteWord.value[nowCount][nowNum].meaning;
        //console.log(reciteWord.value[nowCount][nowNum].derived[0].spell);
        //console.log(reciteWord.value[nowCount][nowNum].derived[0].meanings);
        handleDerive(reciteWord.value[nowCount][nowNum].derived);
        //处理显示绿球的数量
        handlePoint(nowCount);
        handleSentence(reciteWord.value[nowCount][nowNum].sentence);
        handleShow();
    }
}
//处理绿球显示
function handlePoint(count) {
    for (var i = 0; i < count; i++) { countFlag.value[i] = true }
}
//处理模块显示
function handleShow() {
    //问题
    if (question.value) {
        //当前需处理的显示是count等于几的显示
        if (nowCount == 0) {
            tip1Valid.value = true;
            tip2Valid.value = false;
            meaningValid.value = false;
            meanChose.value = true;
            sentenceValid.value = false;
            prompt.value = false;
            answerValid.value = false;
        }
        else if (nowCount == 1) {
            tip1Valid.value = true;
            tip2Valid.value = false;
            meaningValid.value = false;
            meanChose.value = true;
            sentenceValid.value = false;
            prompt.value = false;
            answerValid.value = false;
        }
        else if (nowCount == 2) {
            tip1Valid.value = true;
            tip2Valid.value = false;
            meaningValid.value = false;
            meanChose.value = true;
            sentenceValid.value = false;
            prompt.value = false;
            answerValid.value = false;
        }
    }
    //答案
    else if (answerValid.value) {
        tip1Valid.value = false;
        tip2Valid.value = false;
        meaningValid.value = true;
        meanChose.value = false;
        sentenceValid.value = true;
        prompt.value = false;
    }

}
//处理派生词数据
function handleDerive(derives) {
    //衍生词
    //console.log(derives);
    for (var index = 0; index < derives.length; index++) {
        //console.log("第"+index+"次循环"+derives[index].spell);
        deriveWords.value.push({ spell: derives[index].spell, meaning: derives[index].meanings });
    }
    //console.log(deriveWords.value);

    //释义选项
    if (nowCount == 0) {
        var pos = new Array();
        ans = Math.floor(Math.random() * 4);
        pos.push(ans);
        deriveOption.value[ans] = { spell: nowSpell, meaning: nowMeaning[0] };
        var c = 0, j = 0;
        while (j < 3) {
            if (c == ans) {
                c++;
            };
            deriveOption.value[c] = { spell: deriveWords.value[j].spell, meaning: deriveWords.value[j].meaning[0] };
            c++; j++
        }
    }
}
//处理例句数据
function handleSentence(s) {
    sentences.value = s.map(
        (sentence) => ({
            content: sentence.content,
            contentMean: sentence.contentMean
        })
    )
}
//处理作答
function handleChick(index) {
    ansValid.value = true;
    if (index != ans) {
        optionValid.value[index] = true;
        handleWrong();
    }
    else {
        handleRight(nowCount);
    }
}
//答错了总处理
function handleWrong() {
    if (nowCount != 0) {
        //向后端发送请求
        let request = {
            requestType: "wrong",
            userId: userId,
            wordId: wordId
        }
        Request.post("/recite", request).then(
            (res) => {
                console.log(res);
                if (res.data.status == "countClear") {
                    //处理显示绿球的数量
                    nowCount = 0;
                    handlePoint(nowCount);
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
}
//答对总处理
function handleRight(i) {
    //向后端发送请求
    let request;
    if (i == 0 || 1) {
        request = {
            requestType: "right",
            userId: userId,
            wordId: wordId
        }
    }
    else if (i == 2) {
        request = {
            requestType: "wordRecite",
            userId: userId,
            wordId: wordId
        }
    }
    Request.post("/recite", request).then(
        (res) => {
            console.log(res);
            if (res.data.status == "wordRecite") {
                //背诵数据加一
                recitedWordNum.value++;
                //短暂停留后变更显示
                setTimeout(() => {
                    question.value = false;
                    answerValid.value = true;
                    handleShow();
                }, 1500)
                //处理显示绿球的数量
                handlePoint(nowCount + 1);
            }
            else if (res.data.status == "countAdd") {
                //处理显示绿球的数量
                handlePoint(nowCount + 1);
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
//答题后处理数组
function handleArray(flag, nowCount) {
    if (flag == null) {
        return;
    }
    //答对了
    if (flag) {
        switch (nowCount) {
            case 0:
                {
                    //取出首个，加到另一个数组末尾
                    const temp = zeroWord.value.shift();
                    oneWord.value.push(temp);
                    break;
                }
            case 1: {
                //取出首个，加到另一个数组末尾
                const temp = oneWord.value.shift();
                twoWord.value.push(temp);
                break;
            }
            case 2: {
                //取出首个
                twoWord.value.shift();
                break;
            }

        }
    }
    //答错了,取出首个，加到数组末尾
    else {
        switch (nowCount) {
            case 0: {
                const temp = zeroWord.value.shift();
                zeroWord.value.push(temp);
                break;
            }
            case 1: {
                const temp = oneWord.value.shift();
                oneWord.value.push(temp);
                break;
            }
            case 2: {
                const temp = twoWord.value.shift();
                twoWord.value.push(temp);
                break;
            }

        }
    }
}
//答题后判断下一个背什么单词
function handleNextWord() {
    
}
//退出界面
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
//收藏与标熟
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
                <ul v-show="sentenceValid">
                    <li>{{ sentences[0].content }}</li>
                    <li v-show="sentenceChineseValid">{{ sentences[0].contentMean }}</li>
                </ul>
            </div>
            <div class="question">
                <span v-show="tip1Valid" class="tip1">先回想词义再选择，想不起来「看答案」</span>
                <ul class="meanChose" v-show="meanChose">
                    <li class="option"
                        :class="{ 'optionGrey': (ansValid && !optionValid[index] && index != ans) || !ansValid, 'optionGreen': ansValid && index == ans, 'optionRed': optionValid[index] }"
                        v-for="(deriveWord, index) in  deriveOption " @click="handleChick(index)">
                        <div style="margin: 14px 0px auto 21px;">
                            <span v-show="!ansValid || ansValid && (!optionValid[index] && index != ans)" class="Function">
                                {{ deriveWord.meaning.function }}
                            </span>
                            <span v-show="!ansValid || ansValid && (!optionValid[index] && index != ans)"
                                style="display: block;"
                                :class="{ 'fontGrey': ansValid && !optionValid[index] && index != ans }">
                                {{ deriveWord.meaning.content }}
                            </span>
                            <span v-show="optionValid[index] || (ansValid && index == ans)"
                                style="    font-size: 17px;margin-top: 4px;display: inline-block;">
                                {{ deriveWord.spell }}
                            </span>
                            <span v-show="(ansValid && index == ans)" style="color: rgb(1 128 1);">
                                <el-icon>
                                    <Check style="scale: 1.2;margin-left: 17px;overflow: visible;" />
                                </el-icon>
                            </span>
                            <span v-show="optionValid[index] || (ansValid && index == ans)" class="Function">
                                {{ deriveWord.meaning.function }}{{ deriveWord.meaning.content }}
                            </span>
                        </div>
                    </li>
                </ul>
                <button v-show="prompt">提示一下</button>
                <span v-show="tip2Valid">tip2</span>
            </div>
            <div v-show="answerValid" class="answer">
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
            <div v-show="question">
                <button class="seeAnswer" v-show="nowCount == 0">
                    <span v-show="!ansValid" class="linedown1" style="font-size: 17px;" @click="ansValid = true">看答案</span>
                    <span v-show="ansValid" class="linedown2" style="font-size: 17px;" @click="handleChange()">继续</span>
                </button>
                <button v-show="nowCount != 0">
                    <span>认识</span>
                </button>
                <button v-show="nowCount != 0">
                    <span>不认识</span>
                </button>
            </div>
            <div v-show="!question">
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

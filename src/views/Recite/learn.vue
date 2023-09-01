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
let form = reactive({
    data: ''
})

let userId = localStorage.getItem("userId");
let bookId = localStorage.getItem("chooseBookId");
//接收后端数据
let reciteWord = ref(
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
let wordData = ref([[]]);
//各wordData[count]没有数据的标识
let countOver = [false, false, false];
//是否没有访问过count 1/2
let neverVisit = [false, true, true]
//背诵总数
let maxNum = ref(10);
//count0/1/2各数组长度
let len = ref([]);
//当前单词的派生词
let deriveWords = ref([])
//当前单词的派生词选项
let deriveOption = ref([])
//当前单词的例句
let sentences = ref([{
    content: '',
    contentMean: ''
}])
//当前单词的近义词
let synonymous = ref([])
//当前单词的笔记
let notes = ref([])
let newNote = ref();
//现在在背的单词的id
let wordId;
//现在在背的单词的拼写
let nowSpell = '';
//当前在背的是count几
let nowCount = 0;
//当前背完了几个单词
let recitedWordNum = ref(0);
//还存在下一个的判定
let nextOneValid = ref(true);
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
let date = new Date();
let startTime;
//选线是否选择了
let optionValid = ref([false]);
//笔记添加是否可视
let dialogFormVisible = ref(false)
//问题界面显示的判定
let question = ref(true);
let tip1Valid = ref(false);
let tip2Valid = ref(false);
//单词释义显示的判定
let meaningValid = ref(false);
//释义选项显示的判定
let meanChose = ref(false);
//释义选项被选中的判定
let countFlag = ref([false]);
//例句显示的判定
let sentenceValid = ref(false);
//例句中文显示的判定
let sentenceChineseValid = ref(false);
//提示一下按钮显示判定
let prompt = ref(false);
let promptUsed = false;
//答案界面的判定
let answerValid = ref(false);
//收藏与标熟的判定
let starValid = ref(false);
let deleteValid = ref(false);
//显示选项答案的判定
let ansValid = ref(false)
//当前背对了没有
let flag = null;
//当前选中的细节按钮
let chooseDetail = ref([true, false, false])


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
            if (res.data.status == "reciteWords") {
                //count = 0
                wordData.value[0] = reciteWord.value[0] = res.data.reciteNewWordDates;
                if (reciteWord.value[0].length == 0) {
                    console.log("没有count = 0的单词");
                    console.log(wordData.value[0]);
                    wordData.value[0] = new Array();
                    console.log(wordData.value[0].length);
                }
                //count = 1
                reciteWord.value[1] = res.data.reciteOneWordDates;
                if (reciteWord.value[1].length > 0) {
                    wordData.value[1] = reciteWord.value[1].splice(0, reciteWord.value[1].length > 3 ? 3 : reciteWord.value[1].length);
                    console.log(wordData.value[1]);
                }
                else {
                    console.log("没有count = 1的单词");
                    wordData.value[1] = new Array();
                }
                //count = 2
                reciteWord.value[2] = res.data.reciteTwoWordDates;
                if (reciteWord.value[2].length > 0) {
                    wordData.value[2] = reciteWord.value[2].splice(0, reciteWord.value[2].length > 4 ? 4 : reciteWord.value[2].length);
                    console.log(wordData.value[2]);
                }
                else {
                    console.log("没有count = 1的单词");
                    wordData.value[2] = new Array();
                }
                // console.log(reciteWord.value[0]);
                // console.log(reciteWord.value[1]);
                // console.log(reciteWord.value[2]);
                for (var i = 0; i < 3; i++) {
                    len[i] = wordData.value[i].length;
                    console.log("count"+i+"数组的长度为"+len[i]);
                }
                //明确要背的数量
                if (len[0] + len[1] + len[2] < 10) {
                    maxNum.value = len[0] + len[1] + len[2];
                }
                // console.log(reciteWord.value[0]);
                // console.log(len[0]+' '+len[1]+' '+len[2]);
                handleData();
                handleShow();
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
//初始化
function handleData(num) {
    //初次进入寻找数据
    if (num == null) {
        while (nowCount < 3 && wordData.value[nowCount].length == 0) {
            console.log("现在的count是" + nowCount);
            console.log(wordData.value[nowCount]);
            console.log("nowCount++");
            nowCount++;
        }
    }
    //处理数据
    if (wordData.value[nowCount].length > 0) {
        console.log("现在处理的是count" + nowCount + "数组首个单词的数据,这个数组：" + wordData.value[nowCount]);
        nowSpell = wordData.value[nowCount][0].spell;
        wordId = wordData.value[nowCount][0].wordId;
        starValid.value = wordData.value[nowCount][0].star;
        nowMeaning = wordData.value[nowCount][0].meaning;
        //console.log(nowMeaning);
        //console.log(reciteWord.value[nowCount][0].derived[0].spell);
        //console.log(reciteWord.value[nowCount][0].derived[0].meanings);
        handleDerive(wordData.value[nowCount][0].derived);
        //console.log("在处理绿球前count为"+nowCount);
        //处理显示绿球的数量
        handlePoint(nowCount);
        handleSentence(wordData.value[nowCount][0].sentence);
        synonymous.value = wordData.value[nowCount][0].synonymous;
        //console.log(synonymous.value);
        notes.value = wordData.value[nowCount][0].notes

    }
    else {
        console.log("handleData出错,count判定出错");
    }
}
//处理绿球显示
function handlePoint(count) {
    for (var i = 0; i < 3; i++) { countFlag.value[i] = false }
    for (var i = 0; i < count; i++) { countFlag.value[i] = true }
    console.log("有" + count + "个绿球将显示");
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
            sentenceChineseValid.value = false;
            prompt.value = false;
            answerValid.value = false;
        }
        else if (nowCount == 1) {
            tip1Valid.value = false;
            tip2Valid.value = false;
            meaningValid.value = true;
            meanChose.value = false;
            sentenceValid.value = true;
            sentenceChineseValid.value = false;
            prompt.value = true;
            answerValid.value = false;
        }
        else if (nowCount == 2) {
            tip1Valid.value = false;
            tip2Valid.value = true;
            meaningValid.value = true;
            meanChose.value = false;
            sentenceValid.value = false;
            sentenceChineseValid.value = false;
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
        sentenceChineseValid.value = true;
        prompt.value = false;
    }

}
//处理派生词数据
function handleDerive(derives) {
    //衍生词
    //console.log(derives);
    for (var index = 0; index < derives.length; index++) {
        //console.log("第" + index + "次循环" + derives[index].spell);
        deriveWords.value.push({ spell: derives[index].spell, meaning: derives[index].meanings });
    }
    console.log(nowSpell + "单词的派生词数据：" + deriveWords.value);

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
            //console.log(deriveWords.value[j].spell);
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
    if (ansValid.value == false) {
        ansValid.value = true;
        if (index != ans) {
            optionValid.value[index] = true;
            flag = false;
            handleWrong();
        }
        else {
            flag = true;
            handleRight(nowCount);
        }
    }
    else {
        if (index != ans) {
            optionValid.value[index] = true;
        }
    }
}
//答错总处理
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
                flag = false;
                if (res.data.status == "countClear") {
                    //处理显示绿球的数量
                    handlePoint(0);
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
    console.log("答对了，向后端发请求时count等于" + i);
    //向后端发送请求
    let request;
    if (i == 0 || i == 1) {
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
            flag = true;
            if (res.data.status == "wordRecite") {
                //背诵数据加一
                recitedWordNum.value++;
                //判断有没有背完
                if (recitedWordNum.value == maxNum.value) {
                    nextOneValid.value = false;
                }
            }
            else if (res.data.status != "countAdd") {
                ElMessage({
                    type: "error",
                    message: "出错了",
                    duration: 2000,
                });
                return;
            }
            //短暂停留后变更显示
            if (i == 0) {
                setTimeout(() => {
                    toAnswer()
                }, 1500)
            }
            else if (i == 1) {
                toAnswer()
            }
            else if (i == 2) {
                toAnswer();
            }
            //处理显示绿球的数量
            handlePoint(nowCount + 1);
        })

}
//答对后记错总处理
function handleReciteWrong() {
    //count虽然在前端没有修改，但在后端已经发送请求修改了，这样做好在如果答对一题中途退出也不会出现count没有改变的情况
    //后端count>0,一定要发请求的
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
                handlePoint(0);
                //如果之前recitedWordNum+1了
                if (nowCount == 2) {
                    recitedWordNum.value--;
                    //判断要不要修改背完判定
                    if (!nextOneValid.value) {
                        nextOneValid.value = true;
                    }
                }
                //修改flag
                if (flag) {
                    flag = false;
                }
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
//点击下一个后处理数组,此时nowCount还没有改变
function handleArray(flag, nowCount) {
    if (flag == null) {
        return;
    }
    //答对了
    if (flag) {
        switch (nowCount) {
            case 0: {
                //取出首个，加到另一个数组末尾
                let temp = wordData.value[0].shift();
                wordData.value[1].push(temp);
                console.log("数组处理0");
                break;
            }
            case 1: {
                //取出首个，加到另一个数组末尾
                let temp = wordData.value[1].shift();
                wordData.value[2].push(temp);
                console.log("数组处理1");
                break;
            }
            case 2: {
                //取出首个
                wordData.value[2].shift();
                console.log("数组处理2");
                break;
            }

        }
    }
    //答错了,取出首个，加到count = 0的数组末尾
    else {
        let temp = wordData.value[nowCount].shift();
        wordData.value[0].push(temp);
    }
    //处理一下每个数组有无数据的判定
    for (var i = 0; i < 3; i++) {
        countOver[i] = false;
        if (wordData.value[i].length == 0) {
            countOver[i] = true;
        }
    }
    console.log("现在数组里：");
    for (var i = 0; i < 3; i++) {
        console.log(wordData.value[i]);
    }
}
//处理数组后判断下一个要背的单词是count几
function handleNowCount(f, count) {
    //理论情况下进入这个方法一定是有单词还要背的
    //答对了
    if (f && (!countOver[0] || !countOver[1] || !countOver[2])) {
        count >= 2 ? count = 0 : count++;
        //初次访问，要数量大于等于三才可以
        if (neverVisit[count]) {
            console.log("进入初次访问的判断");
            if (wordData.value[count].length < 3) {
                console.log(count + "数组长度不够三，count置零");
                count = 0;
            }
            else {
                //此次就将访问该count数组
                neverVisit[count] = false;
            }
        }
        //该count背完判定
        while (countOver[count]) {
            console.log("进入数组背完判定");
            count == 2 ? count = 0 : count++;
            //此处为前一个数组已经背完了，没办法，在不够3个的情况下也要背了
            if (neverVisit[count]) {
                neverVisit[count] = false;
            }
        }
        nowCount = count;
        console.log("判定后nowCount为" + nowCount);
    }
    //答错了,count尽可能变小
    else if ((!f) && (!countOver[0] || !countOver[1] || !countOver[2])) {
        count = 0;
        while (countOver[count]) {
            count == 2 ? count = 0 : count++;
        }
        nowCount = count;
        console.log("判定后nowCount为" + nowCount);
        return;
    }
    else {
        console.log("啥都不对");
    }
}
//答题后跳至答案界面
function toAnswer() {
    question.value = false;
    answerValid.value = true;
    handleShow();
}
//选择某个细节按钮
function buttonChoose(i) {
    for (var j = 0; j < 3; j++) {
        chooseDetail.value[j] = false;
    }
    chooseDetail.value[i] = true;
}
//答题后判断下一个背什么单词,能进入这个方法说明还有单词没背完
function handleNextWord() {
    //如果这个单词标熟了,但之前背错了,要把flag修改成true
    if (deleteValid.value && !flag) {
        flag = true;
    }
    //只有明确了现在有没有背错才可以进行数组的修改
    handleArray(flag, nowCount);
    handleNowCount(flag, nowCount);
    handleClear();
    handleData(1);
    question.value = true;
    answerValid.value = false;
    handleShow();
}
//提示一下显示例句中文
function promptUse() {
    sentenceChineseValid.value = true;
    promptUsed = true;
}
//退出界面
function reciteOver() {
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
                router.push('/main');
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
                //如果不是背完的单词标熟，背过的单词数加一
                if (nowCount != 3) {
                    recitedWordNum.value++;
                    if (recitedWordNum.value == 10) {
                        reciteOver();
                    }
                }
                handleNextWord();
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
                //如果不是背完的单词取消标熟，背过的单词数减一
                if (nowCount != 3)
                    recitedWordNum.value--;
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
//笔记的添加
function handleNote() {
    dialogFormVisible.value = false;
    let request = {
        requestType: "addNote",
        userId: userId,
        wordId: wordId,
        note: newNote.value
    };
    Request.post("/recite", request).then(
        (res) => {
            console.log(res);
            if (res.data.status == "noteAddSuccess") {
                notes.value.push({ content: newNote.value });
                newNote.value = null;
                ElMessage({
                    type: "success",
                    message: "添加笔记成功",
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
//一些变量的重置
function handleClear() {
    flag = null;
    optionValid = ref([false]);
    ansValid = ref(false)
    chooseDetail = ref([true, false, false])
    deriveWords = ref([])
    deriveOption = ref([])
    sentences = ref([{
        content: '',
        contentMean: ''
    }])
    synonymous = ref([])
    notes = ref([])
    newNote = ref();
    nowMeaning = [
        {
            content: '',
            function: '',
            id: 0,
            wordId: 0
        }
    ]
    countFlag = ref([false]);
    promptUsed = false;
    deleteValid.value = false;
}
</script>
<template>
    <el-dialog v-model="dialogFormVisible" title="添加笔记" style="border-radius: 10px;">
        <el-form :model="form">
            <el-form-item>
                <el-input v-model="newNote" autocomplete="off" />
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogFormVisible = false">Cancel</el-button>
                <el-button style="color: #606266;" type="primary" @click="handleNote()">
                    Confirm
                </el-button>
            </span>
        </template>
    </el-dialog>
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
                <button v-show="starValid" @click="deleteStar" class="star"><el-icon>
                        <StarFilled />
                    </el-icon></button>
                <button v-show="!starValid" @click="addStar" class="star"><el-icon>
                        <Star />
                    </el-icon></button>
                <button v-show="!deleteValid" @click="deleteWord" class="delete"><el-icon>
                        <Delete />
                    </el-icon></button>
                <button v-show="deleteValid" @click="undoDeleteWord" class="delete"><el-icon>
                        <DeleteFilled />
                    </el-icon></button>
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
                <div v-show="meaningValid" class="mean">
                    <ul style="display: flex;justify-content: center;flex-direction: column;">
                        <li class="meanContent" v-for="mean in nowMeaning">
                            <div style="display: inline;"
                                :class="{ 'meanBox': (nowCount == 1 || nowCount == 2) && flag == null }">
                                <span class="meanFunction"
                                    :class="{ 'transprent': (nowCount == 1 || nowCount == 2) && flag == null }">{{
                                        mean.part
                                    }}</span><span class="meanWord"
                                    :class="{ 'transprent': (nowCount == 1 || nowCount == 2) && flag == null }">{{
                                        mean.content
                                    }}</span>
                            </div>
                        </li>
                    </ul>
                </div>
                <ul v-show="sentenceValid" class="optionGrey sentenceBox"
                    :class="{ 'middle': nowCount == 1 && flag == null }">
                    <div>
                        <li style="width: 372px;white-space: normal;">{{ sentences[0].content }}</li>
                        <li v-show="sentenceChineseValid" style="margin-top: 3px;font-size: 14px;">{{
                            sentences[0].contentMean }}</li>
                    </div>

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
                                {{ deriveWord.meaning.part }}
                            </span>
                            <span v-show="!ansValid || ansValid && (!optionValid[index] && index != ans)"
                                class="meaningContent"
                                :class="{ 'fontGrey': ansValid && !optionValid[index] && index != ans }">
                                {{ deriveWord.meaning.content }}
                            </span>
                            <span v-show="optionValid[index] || (ansValid && index == ans)"
                                style="    font-size: 17px;margin-top: 4px;display: inline-block;">
                                {{ deriveWord.spell }}
                            </span>
                            <span v-show="(ansValid && index == ans)" style="color: rgb(1 128 1);">
                                <el-icon style="width: 39px;left: -13px;">
                                    <Check style="scale: 1.2;margin-left: 17px;overflow: visible;" />
                                </el-icon>
                            </span>
                            <span v-show="optionValid[index] || (ansValid && index == ans)" class="Function"
                                style="overflow: hidden;">
                                {{ deriveWord.meaning.function }}{{ deriveWord.meaning.content }}
                            </span>
                        </div>
                    </li>
                </ul>
                <button v-show="prompt" class="promptBox" @click="promptUse()">
                    <div class="optionGrey prompt" v-if="!promptUsed">
                        <el-icon style="scale: 1.5;margin-top: 13px;">
                            <Search />
                        </el-icon>
                    </div>
                    <span class="fontGrey promptFont" v-if="!promptUsed">提示一下</span>
                </button>
                <span v-show="tip2Valid" class="tip2">本词最后一关<img class="winkSmile"
                        src="/093E7A6B.png">:请在无提示的情况下判断</span>
            </div>
            <div v-show="answerValid" class="answer">
                <div class="detailBox optionGrey">
                    <div class="detail">
                        <div :class="{ 'detailShow': chooseDetail[0], 'detailLeft': !chooseDetail[0] }">
                            <ul id="derive">
                                <span style="position: absolute;left: 4px;scale: 0.65;color: #ff6f00;">&#9658;</span>
                                <li><span>{{ nowSpell }}</span><span style="margin:0px 3px 0 10px ;">{{
                                    nowMeaning[0].part
                                }}</span><span style="display: block;">{{ nowMeaning[0].content }}</span></li>
                                <li v-for="derive in deriveWords">
                                    <span style="position: absolute;left: 4px;scale: 0.65;color: #ff6f00;">&#9658;</span>
                                    <span>{{ derive.spell }}</span>
                                    <span style="margin:0px 3px 0 10px ;">{{ derive.meaning[0].part }}</span>
                                    <span style="display: block;">{{ derive.meaning[0].content }}</span>
                                </li>
                            </ul>
                        </div>
                        <div
                            :class="{ 'detailShow': chooseDetail[1], 'detailLeft': !chooseDetail[1] && chooseDetail[2], 'detailRight': !chooseDetail[1] && chooseDetail[0] }">
                            <ul id="synonymous">
                                <li v-for="s in synonymous">
                                    <span style="display: inline-block;margin-right: 3px;" class="fontGrey Function">{{
                                        s.function }}</span>
                                    <span style="display: inline-block;" class="fontGrey Function">{{ s.meaning }}</span>
                                    <ul style="margin-top: -5px;">
                                        <li style="display: inline-block;" class="fontGrey">{{ nowSpell }}</li>
                                        <li v-for="(spell, index) in s.spells" style="display: inline-block;">
                                            <span style="margin: 0 4px;">/</span>
                                            <span>{{ spell }}</span>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <ul :class="{ 'detailShow': chooseDetail[2], 'detailRight': !chooseDetail[2] }" id="notes">
                                <li v-for="n in notes">
                                    <span>{{ n.content }}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="detailButton">
                        <ul style="width: 384px;">
                            <li style="display: inline-block;">
                                <button class="deriveButton" :class="{ 'buttonWhite': chooseDetail[0] }"
                                    @click="buttonChoose(0)">
                                    形近
                                </button>
                            </li>
                            <li style="display: inline-block;" v-show="synonymous.length > 0">
                                <button class="synonymousButton" :class="{ 'buttonWhite': chooseDetail[1] }"
                                    @click="buttonChoose(1)">
                                    近义
                                </button>
                            </li>
                            <li style="display: inline-block;" v-if="notes.length > 0">
                                <button class="noteButton" :class="{ 'buttonWhite': chooseDetail[2] }"
                                    @click="buttonChoose(2)">
                                    笔记
                                </button>
                            </li>
                            <li class="noteAdd">
                                <el-button @click="dialogFormVisible = true">
                                    <el-icon>
                                        <EditPen />
                                    </el-icon>
                                </el-button>
                            </li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
        <div class="buttonBox">
            <div v-show="question">
                <button class="seeAnswer" v-show="nowCount == 0">
                    <span v-show="!ansValid" class="linedown1" style="font-size: 17px;"
                        @click="ansValid = true, flag = false">看答案</span>
                    <span v-show="ansValid" class="linedown2" style="font-size: 17px;" @click="toAnswer()">继续</span>
                </button>
                <div class="questionButton">
                    <button v-show="nowCount != 0">
                        <span class="linedown2 left" style="font-size: 17px;" @click="handleRight(nowCount)">认识</span>
                    </button>
                    <button v-show="nowCount != 0">
                        <span class="linedown1 right" style="font-size: 17px;" @click="handleWrong(), toAnswer()">不认识</span>
                    </button>
                </div>
            </div>
            <div class="questionButton" v-show="!question">
                <button :class="{ 'left': flag, 'mid': !flag }">
                    <span v-show="nextOneValid" class="linedown2" @click="handleNextWord()">下一个</span>
                    <span v-show="!nextOneValid" class="linedown2" @click="reciteOver()">完成</span>
                </button>
                <button class="right">
                    <span v-show="flag" class="linedown1 fontGrey" @click="handleReciteWrong()">记错了</span>
                </button>
            </div>
        </div>


    </div>
</template>
<style scoped>
@import './recite.css';
</style>

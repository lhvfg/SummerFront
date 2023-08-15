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
let form = reactive({
    data: ''
})

let userId = localStorage.getItem("userId");
let bookId = localStorage.getItem("chooseBookId");
//接收后端数据
let reciteWord = ref(
    [
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
            stage: 0,
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
    ]
)
//后端返回长度
let len;
//背诵总数
let maxNum = ref(10);
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
//当前在背的是count几,此处的count会影响出题
let nowCount = 0;
//当前单词下次复习日期
let AddDayCount;
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
//选项是否选择了
let optionValid = ref([false]);
//笔记添加是否可视
let dialogFormVisible = ref(false)
//问题界面显示的判定
let question = ref(true);
let tip1Valid = ref(false);
let tip2Valid = ref(false);
let tip3Valid = ref(false);
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
//答案界面的判定
let answerValid = ref(false);
//收藏与标熟的判定
let starValid = ref(false);
let deleteValid = ref(false);
//显示选项答案的判定
let ansValid = ref(false)
//当前背对了没有
let flag = ref(null);
//当前选中的细节按钮
let chooseDetail = ref([true, false, false])
//当前单词的stage
let nowStage = 0;
//结算页面数据
let wordNextTime = ref([])
//结算页面显示判定
let overShowValid = ref(false)
const less = ref()


onMounted(() => {
    less.value = store.$state.reviewNum > 10 ? store.$state.reviewNum - 10 : 0;
    console.log(less.value);
    startTime = parseInt(new Date().getTime() / 1000);
    let yy = new Date().getFullYear();
    let mm = new Date().getMonth() + 1;
    let dd = new Date().getDate();
    let request = {
        requestType: "getWords",
        userId: userId,
        bookId: bookId,
        today: yy + '-' + (mm < 10 ? '0' + mm : mm) + '-' + (dd < 10 ? '0' + dd : dd)
    };
    Request.post("/review", request).then(
        (res) => {
            console.log(res);
            console.log(111);
            if (res.data.status == "getWordSuccess") {
                reciteWord.value = res.data.reviewWords;
                len = reciteWord.value.length;
                //明确要背的数量
                if (len < 10) {
                    maxNum.value = len;
                }
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
//获取日期字符串
function handleNextTime() {
    console.log(flag.value);
    if (flag.value) {
        switch (nowStage) {
            case 0: AddDayCount = 2; break;
            case 1: AddDayCount = 3; break;
            case 2: AddDayCount = 5; break;
            case 3: AddDayCount = 8; break;
            case 4: AddDayCount = 16; break;
        }
    }
    else if (!flag.value) {
        AddDayCount = 2;
    }
    console.log(AddDayCount);
    let nowDate = new Date()
    let nowTime = nowDate.getTime()  //当前时间戳
    let futureTime = Math.abs(nowTime) + (AddDayCount * 24 * 60 * 60 * 1000) //days天后的时间戳
    let futureDate = new Date(futureTime);
    let year = futureDate.getFullYear();
    let month = futureDate.getMonth() + 1;
    if (month < 10) month = "0" + month;
    let date = futureDate.getDate();
    if (date < 10) date = "0" + date;
    return (year + "-" + month + "-" + date);
}

//初始化
function handleData(num) {
    console.log(222);
    if (num == null) {
        nowCount = -1;
    }
    //处理数据
    if (reciteWord.value.length > 0) {
        //这里的count不是数据库里存的count,而是后端传数据过来时主动设置的默认-1
        nowCount = reciteWord.value[0].count;
        nowSpell = reciteWord.value[0].spell;
        wordId = reciteWord.value[0].wordId;
        starValid.value = reciteWord.value[0].star;
        nowMeaning = reciteWord.value[0].meaning;
        handleDerive(reciteWord.value[0].derived);
        handleSentence(reciteWord.value[0].sentence);
        synonymous.value = reciteWord.value[0].synonymous;
        console.log(synonymous.value);
        notes.value = reciteWord.value[0].notes
        nowStage = reciteWord.value[0].stage
    }
    else {
        console.log("handleData出错");
    }
}
//处理模块显示
function handleShow() {
    //问题
    if (question.value) {
        //当前需处理的显示是count等于几的显示
        //释义模糊,有释义(无例句)
        if (nowCount == 0 || nowCount == -1) {
            tip1Valid.value = false;
            tip2Valid.value = true;
            tip3Valid.value = false;
            meaningValid.value = true;
            meanChose.value = false;
            sentenceValid.value = false;
            sentenceChineseValid.value = false;
            answerValid.value = false;
        }
        else if (nowCount == 1) {
            tip1Valid.value = true;
            tip2Valid.value = false;
            tip3Valid.value = false;
            meaningValid.value = false;
            meanChose.value = true;
            sentenceValid.value = false;
            sentenceChineseValid.value = false;
            answerValid.value = false;
        }
        else if (nowCount == 2) {
            tip1Valid.value = false;
            tip2Valid.value = false;
            tip3Valid.value = true;
            meaningValid.value = true;
            meanChose.value = false;
            sentenceValid.value = false;
            sentenceChineseValid.value = false;
            answerValid.value = false;
        }
    }
    //答案
    else if (answerValid.value) {
        tip1Valid.value = false;
        tip2Valid.value = false;
        tip3Valid.value = false;
        meaningValid.value = true;
        meanChose.value = false;
        sentenceValid.value = true;
        sentenceChineseValid.value = true;
    }

}
//处理派生词数据
function handleDerive(derives) {
    //衍生词
    //console.log(derives);
    for (var index = 0; index < derives.length; index++) {
        console.log("第" + index + "次循环" + derives[index].spell);
        deriveWords.value.push({ spell: derives[index].spell, meaning: derives[index].meanings });
    }
    console.log(deriveWords.value);

    //释义选项
    if (nowCount == 1) {
        var pos = new Array();
        ans = Math.floor(Math.random() * 4);
        pos.push(ans);
        deriveOption.value[ans] = { spell: nowSpell, meaning: nowMeaning[0] };
        var c = 0, j = 0;
        while (j < 3) {
            if (c == ans) {
                c++;
            };
            console.log(deriveWords.value[j].spell);
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
//处理选项作答
function handleChick(index) {
    if (ansValid.value == false) {
        ansValid.value = true;
        if (index != ans) {
            optionValid.value[index] = true;
            flag.value = false;
            handleWrong();
        }
        else {
            flag.value = true;
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
function handleWrong(num) {
    console.log("答错了" + "此时的count为" + nowCount + "此时的stage为" + nowStage);
    flag.value = false;
    var stage2;
    if (num != null) {
        stage2 = 1;
    }
    else {
        stage2 = 0;
    }
    if (nowCount == -1) {
        //变更stage和time
        let request = {
            requestType: "setNextTime",
            userId: userId,
            wordId: wordId,
            nextTime: handleNextTime(),
            stage: stage2
        }
        Request.post("/review", request).then(
            (res) => {
                console.log(res);
                if (res.data.status == "setTimeSuccess") {
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
    console.log("答对了" + "此时的count为" + nowCount + "此时的stage为" + nowStage);
    flag.value = true;
    console.log(handleNextTime());
    let request;
    //判断是否要向后端发送请求
    if (i == -1 && nowStage < 4) {
        //返回下次复习时间和stage
        request = {
            requestType: "setNextTime",
            userId: userId,
            wordId: wordId,
            nextTime: handleNextTime(),
            stage: nowStage + 1
        }
        Request.post("/review", request).then(
            (res) => {
                console.log(res);
                if (res.data.status == "setTimeSuccess") {
                    //背诵数据加一
                    recitedWordNum.value++;
                    //判断有没有背完
                    if (recitedWordNum.value == maxNum.value) {
                        nextOneValid.value = false;
                    }
                }
            })
    }
    else if (i == -1 && nowStage >= 4) {
        //finish
        let request = {
            requestType: "delete",
            userId: userId,
            wordId: wordId
        };
        Request.post("/recite", request).then(
            (res) => {
                console.log(res);
                if (res.data.status == "deleteSuccess") {
                    recitedWordNum.value++;
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
    //短暂停留后变更显示
    else if (i == 1) {
                    setTimeout(() => {
                        toAnswer()
                    }, 1300)
                }
    else if (i == 2) {
        //背诵数据加一
        recitedWordNum.value++;
        //判断有没有背完
        if (recitedWordNum.value == maxNum.value) {
            nextOneValid.value = false;
        }
    }


}
//模糊
function handleVague() {
    //count = -1时判定为错
    if (nowCount == -1)
        handleWrong(1);
    //其余情况判定为对
    else if (nowCount > -1 && nowCount <= 2)
        handleRight(nowCount);

}
//答对后记错总处理
function handleReciteWrong() {
    //先变更答题判定
    console.log("记错了");
    flag.value = false;
    //如果是首次作答
    if (nowCount == -1) {
        //stage和时间在后端已经发送请求修改了,要再发一次重置数据
        let request = {
            requestType: "setNextTime",
            userId: userId,
            wordId: wordId,
            stage: 0,
            nextTime: handleNextTime(),
        }
        Request.post("/review", request).then(
            (res) => {
                console.log(res);
                if (res.data.status == "setTimeSuccess") {
                    recitedWordNum.value--;
                    //判断要不要修改背完判定
                    if (!nextOneValid.value) {
                        nextOneValid.value = true;
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
    else if(nowCount == 2){
        //背诵数据减一
        recitedWordNum.value--;
        //判断要不要修改背完判定
        if (!nextOneValid.value) {
            nextOneValid.value = true;
        }
    }

}
//点击下一个后处理数组,此时nowCount还没有改变
function handleArray(flag) {
    if (flag == null) {
        return;
    }
    //答对了
    if (flag) {
        switch (nowCount) {
            //取出首元素，wordNextTime添加数据
            case -1: {
                reciteWord.value.shift();
                if (nowStage < 4)
                    wordNextTime.value.push({ spell: nowSpell, nextTime: AddDayCount + "天后", overFlag: false });
                else {
                    wordNextTime.value.push({ spell: nowSpell, nextTime: "复习完成", overFlag: true });
                }
                break;
            }
            //取出首元素修改count添加末尾
            case 0: case 1: {
                var temp = reciteWord.value.shift();
                temp.count++;
                reciteWord.value.push(temp);
                break;
            }
            case 2: {
                reciteWord.value.shift();
            }
        }
    }
    //答错了
    else {
        switch (nowCount) {
            //取出首元素修改count添加末尾
            case -1: {
                var temp = reciteWord.value.shift();
                temp.count = 0;
                reciteWord.value.push(temp);
                wordNextTime.value.push({ spell: nowSpell, nextTime: "2天后", overFlag: false });
                break;
            }
            default: {
                var temp = reciteWord.value.shift();
                reciteWord.value.push(temp);
            }
        }
    }
    console.log("现在数组里：");
    console.log(reciteWord.value);
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
    if (deleteValid.value && !flag.value) {
        flag.value = true;
    }
    //只有明确了现在有没有背错才可以进行数组的修改
    handleArray(flag.value);
    handleClear();
    handleData(1);
    question.value = true;
    answerValid.value = false;
    handleShow();
}
//进入结算界面
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
                overShowValid.value = true;
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
//回到主页面
function backToMain(){
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
                setTimeout(()=>{
                    router.push('/main');
                },500)
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
                recitedWordNum.value++;
                if (recitedWordNum.value == 10) {
                    reciteOver();
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
//处理笔记
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
    flag.value = null;
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
    <div class="main" v-show="!overShowValid">
        <div class="inner"></div>
        <div class="top">
            <button class="outButton" @click="backToMain"><el-icon>
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
                    <div :class="{ 'shadowBox': (nowCount == 2) && flag == null }">
                        <span class="spell" :class="{ 'transprent': nowCount == 2 && flag == null }">{{ nowSpell }}</span>
                    </div>
                </div>
                <div v-show="meaningValid" class="mean">
                    <ul style="display: flex;justify-content: center;flex-direction: column;">
                        <li class="meanContent" v-for="mean in nowMeaning">
                            <div style="display: inline;"
                                :class="{ 'shadowBox': (nowCount == -1 || nowCount == 0) && flag == null }">
                                <span class="meanFunction"
                                    :class="{ 'transprent': (nowCount == -1 || nowCount == 0) && flag == null }">
                                    {{ mean.part }}</span>
                                <span class="meanWord"
                                    :class="{ 'transprent': (nowCount == -1 || nowCount == 0) && flag == null }">
                                    {{ mean.content }}</span>
                            </div>
                        </li>
                    </ul>
                </div>
                <ul v-show="sentenceValid" class="optionGrey sentenceBox">
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
                                {{ deriveWord.meaning.part }}{{ deriveWord.meaning.content }}
                            </span>
                        </div>
                    </li>
                </ul>
                <div v-show="tip2Valid" class="tip2" style="display: flex;flex-direction: column;justify-content: center;">
                    <span style="text-align: center;">瞬间想起词义，选「认识」</span>
                    <span style="text-align: center;">思考后想起词义，选「模糊」</span>
                </div>
                <div v-show="tip3Valid" class="tip3" style="display: flex;flex-direction: column;justify-content: center;">
                    <span style="text-align: center;">瞬间想起单词，选「认识」</span>
                    <span style="text-align: center;">思考后想起单词，选「模糊」</span>
                </div>
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
                                    派生
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
                <button class="seeAnswer" v-show="nowCount == 1">
                    <span v-show="!ansValid" class="linedown1" style="font-size: 17px;"
                        @click="ansValid = true, flag = false">看答案</span>
                    <span v-show="ansValid" class="linedown2" style="font-size: 17px;" @click="toAnswer()">继续</span>
                </button>
                <div class="questionButton">
                    <button v-show="nowCount != 1">
                        <span class="linedown2 left" style="font-size: 17px;"
                            @click="handleRight(nowCount), toAnswer()">认识</span>
                    </button>
                    <button v-show="nowCount != 1">
                        <span class="linedown3 buttonMid" style="font-size: 17px;"
                            @click="handleVague(), toAnswer()">模糊</span>
                    </button>
                    <button v-show="nowCount != 1">
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
    <div class="main" style="background: #fffdf9;" v-show="overShowValid">
        <img src="../../../OIP-C.jpg" class="overSmile">
        <div class="flexBox">
            <h2>本组单词复习完成</h2>
            <span class="fontGrey" style="margin: 6px 0 26px;">还有<span style="color: #ff6f00; margin: 0 4px;">{{ less }}</span>个单词需要复习</span>
            <div class="overDetailBox">
                <div class="overDetailTitle fontGrey">
                    <span style="position: absolute;left: 300px;">单词</span>
                    <span style="position: absolute; right: 261px;">下次复习</span>
                </div>
                <div class="overDetailContent">
                    <ul>
                        <li v-for="word in wordNextTime" style="display: block; height: 16px;margin: 6px auto;">
                            <span class="overWord">{{ word.spell }}</span>
                            <span v-if="word.overFlag" style="position: absolute;">flag</span>
                            <span class="overTime" :class="{ 'green': word.overFlag }">{{ word.nextTime }}</span>
                        </li>
                    </ul>
                </div>
                    <button class="overButton" @click="router.push('/main')">休息一下</button>
                    <button v-show="less>0">继续复习</button>
            </div>
        </div>
    </div>
</template>
<style scoped>
@import './recite.css';
</style>

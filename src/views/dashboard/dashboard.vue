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
let bookId = localStorage.getItem("chooseBookId")
const customColor = ref('#f56c6c');
const percentage = ref()
const data = ref({
    bookName: ''
})
const value = ref(new Date())
const successiveDay = ref(localStorage.getItem("accumulateDay"));
const bookName = ref('')
const validName = ref(false);
const validNameText = ref('');
const books = ref([])
const dialogFormVisible = ref(false)
const formLabelWidth = '140px'
const clicked = ref(true);

var flag;
const form = reactive({
    name: '',
    region: [],
    date1: '',
    date2: '',
    delivery: false,
    type: [],
    resource: '',
    desc: '',
})
const bookNames = ref([])

onMounted(() => {
    if(localStorage.getItem("accumulateDay")==null){
        clicked.value = false;
    }
    let request = {
        requestType: "chooseBookRequest",
    };
    Request.post("/chooseBook", request).then(
        (res) => {
            console.log(res);
            if (res.data.status != 'block') {
                books.value = res.data.bookList;
                books.value = books.value.filter((item) => { return item.hide != 1 || item.userId == localStorage.getItem("userId") });
                bookNames.value = books.value.map(item => item.bookName)
                console.log(books.value);
                console.log(bookNames.value);
            }
            else {
                router.push('/login');
                ElMessage({
                    type: "error",
                    message: "登陆过期或未登录！",
                    duration: 2000,
                });
            }
        })
    if(localStorage.getItem("chooseBookId")!='null')
    {
        console.log(localStorage.getItem("chooseBookId"));
        console.log(11);
        getdashboardData();}
})
//获取dashboard相关数据
function getdashboardData(){
    let request = {
        requestType: "getData",
        userId: userId,
        bookId: bookId
    }
    Request.post("/dashboard", request).then(
        (res) => {
            console.log(res);
            if (res.data.status == 'getDataSuccess') {
                data.value = res.data.dashBoardData;
                percentage.value = Math.floor(data.value.recitedNum / data.value.allStudyNum * 100);

            }
        }
    )
}
//判定书名
function checkName() {
    clearTimeout(flag);
    flag = setTimeout(() => {
        let result = bookNames.value.find(value => value == bookName.value)
        console.log(result);
        if (result == undefined) {
            validName.value = false;
            validNameText.value = "没有这本书或无权限访问"
        }
        else {
            validName.value = true;
            validNameText.value = "可用！"
        }
    }, 1000)
}
//选了列表后替换上侧内容
function changeBookName(newName) {
    bookName.value = newName;
    validName.value = true;
    validNameText.value = "可用！"
}
//选择单词书
function chooseBook() {
    let request;
    if (validName.value) {
        dialogFormVisible.value = false;
        if (localStorage.getItem("chooseBookId") == 'null') {
            request = {
                requestType: "chooseBookAdd",
                bookId: books.value.find(item => item.bookName == bookName.value).id,
                userId: localStorage.getItem("userId")
            }
        }
        else {
            request = {
                requestType: "chooseBookUpdate",
                bookId: books.value.find(item => item.bookName == bookName.value).id,
                userId: localStorage.getItem("userId")
            }
        }
        Request.post("/chooseBook", request).then(
            (res) => {
                console.log(res);
                if (res.data.status == "chooseSucceed") {
                    ElMessage({
                        type: "success",
                        message: "选择成功！",
                        duration: 2000,
                    });
                    bookId = books.value.find(item => item.bookName == bookName.value).id 
                    localStorage.setItem("chooseBookId", bookId);
                    //再次获取一次数据
                    getdashboardData()
                }
                else {
                    ElMessage({
                        type: "error",
                        message: "出错了！",
                        duration: 2000,
                    });
                }
            })
    }
    else {
        ElMessage({
            type: "error",
            message: "请选择合法的单词书",
            duration: 2000,
        });
    }
}
//回到主页面
function backToMain() {
    setTimeout(() => {
        router.push('/main');
    }, 500)

}
</script>
<template>
    <div class="main">
        <div class="top">
            <button class="buttonCommon outButton" @click="backToMain()"><el-icon>
                    <ArrowLeft />
                </el-icon></button>
            <span style="position: absolute; top: 13.2px; left: 47%;">仪表盘</span>
        </div>
        <div class="nowLearnBox">
            <div class="title">
                <h3 style="display: inline-block;" class="bigWord">正在学习</h3>
                <button class="buttonCommon organ" @click="dialogFormVisible = true">
                    换本词书
                </button>
                <el-dialog v-model="dialogFormVisible" title="选择单词书">
                    <el-form :model="form">
                        <el-form-item label="搜索名称" :label-width="formLabelWidth">
                            <el-input v-model="bookName" autocomplete="off" placeholder="用名称搜索" @keyup="checkName()" />
                            <br>
                            <span :class="{ 'wrong': !validName, 'right': validName }">{{ validNameText }}</span>
                        </el-form-item>
                        <el-form-item label="列表选择" :label-width="formLabelWidth">
                            <el-select v-model="form.region" placeholder="请选择一本单词书">
                                <el-option v-for="(book, index) in books" :label="book.bookName" :value="book.bookName"
                                    @click="changeBookName(book.bookName)" />
                            </el-select>
                        </el-form-item>
                    </el-form>
                    <template #footer>
                        <span class="dialog-footer">
                            <el-button @click="dialogFormVisible = false">Cancel</el-button>
                            <el-button type="primary" @click="chooseBook">
                                Confirm
                            </el-button>
                        </span>
                    </template>
                </el-dialog>
            </div>
            <div class="whiteBox" style="height: 230px">
                <div class="book">{{ data.bookName!=null?data.bookName:"无" }}</div>
                <span class="starBook midWord">生词本<span style="margin-left: 5px;font-size: 16px;">{{ data.starNum!=null?data.starNum:0}}</span></span>
                <div class="progressBox">
                    <div>
                        <div class="demo-progress">
                            <el-progress :percentage="percentage" :color="customColor" :show-text="false"
                                :stroke-width="8" />
                            <span class="fontGrey midWord" style="float: left;">已学习<span style="margin-left: 5px;">{{
                                data.recitedNum!=null?data.recitedNum:0 }}</span></span>
                            <span class="fontGrey midWord" style="float: right;">总词数<span style="margin-left: 5px;">{{
                                data.allStudyNum!=null?data.allStudyNum:0 }}</span></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="myDataBox">
            <h2 class="bigWord title">我的数据</h2>
            <div class="whiteBox" style="padding-bottom: 10px;">
                <div class="dataBox1">
                    <el-icon>
                        <Finished />
                    </el-icon>
                    <span class="smallWord">今日学习&复习</span>
                    <span><span>{{ data.todayNum!=null?data.todayNum:0 }}</span>词</span>
                </div>
                <div class="dataBox2">
                    <el-icon>
                        <TrendCharts />
                    </el-icon>
                    <span class="smallWord">累计学习</span>
                    <span><span>{{ data.allRecitedNum!=null?data.allRecitedNum:0 }}</span>词</span>
                </div>
                <div class="dataBox3">
                    <el-icon>
                        <Timer />
                    </el-icon>
                    <span class="smallWord">今日学习时长</span>
                    <span><span>{{ data.todayTime!=null?data.todayTime:0 }}</span></span>
                </div>
                <div class="dataBox4">
                    <el-icon>
                        <Clock />
                    </el-icon>
                    <span class="smallWord">累计学习时长</span>
                    <span><span>{{ data.allTime!=null?data.allTime:0 }}</span></span>
                </div>
            </div>
            <div class="whiteBox" style="padding-top: 10px;">
                <div>
                    <span style="position: relative;top: 4px;left: 15px;">日历</span>
                    <span style="position: relative;top: 4px;right: -355px;">
                        <span v-show="clicked">累计签到<span style="margin: 0 3px;">{{successiveDay }}</span>天</span>
                    </span>
                    <el-calendar style="margin-top: 10px;" v-model="value" />
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
@import './dashboard.css';
</style>
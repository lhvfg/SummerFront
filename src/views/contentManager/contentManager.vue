<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from "../../stores/User"
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
let store = useUserStore();

const bookName = ref('')
const validName = ref(false);
const validNameText = ref('');
const books = ref([])
const dialogFormVisible = ref(false)
const formLabelWidth = '140px'
const Request = axios.create({
    baseURL: 'api',
    timeout: 3000,
    withCredentials: true,
});
var flag;
let request;
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
})
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
function changeBookName(newName) {
    bookName.value = newName;
    validName.value = true;
    validNameText.value = "可用！"
}
function chooseBook() {
    if (validName.value) {
        dialogFormVisible.value = false;
        if (localStorage.getItem("chooseBookId") == null) {
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
                    localStorage.setItem("chooseBookId", books.value.find(item => item.bookName == bookName.value).id);
                    store.$state.bookName = bookName.value;
                    // clearAll();
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
function back() {
    router.push('/main')
}
function upLoadWord() {
    router.push('/uploadWord')
}
function addWord() {
    setTimeout(() => {
        router.push("/addWord");
    }, 500)
}
function addBook() {
    setTimeout(() => {
        router.push("/addBook");
    }, 500)
}
</script>
<template>
    <div class="main">
        <div class="top">
            <span class="viewName">内容管理</span>
            <button class="buttonCommon outButton" @click="back">
            <el-icon ><ArrowLeft /></el-icon>
            </button>
        </div>
        <div class="whiteBox" style="margin-top: 70px;">
            <div class="buttonBox" @click="addWord">
                <el-icon class="icon iconYellow"><Document /></el-icon>
                <button class="buttonCommon" >新增与修改单词</button>
                <el-icon class="rightArrow"><ArrowRight /></el-icon>
            </div>
            <div class="buttonBox" @click="upLoadWord">
                <el-icon class="icon iconYellow"><FolderAdd /></el-icon>
                <button class="buttonCommon" >上传单词</button>
                <el-icon class="rightArrow"><ArrowRight /></el-icon>
            </div>
        </div>
        <div class="whiteBox">
            <div class="buttonBox" @click="addBook">
                <el-icon class="icon iconBlue"><Reading /></el-icon>
                <button class="buttonCommon" >新增单词书</button>
                <el-icon class="rightArrow"><ArrowRight /></el-icon>
            </div>
            <div class="buttonBox" @click="dialogFormVisible = true">
                <el-icon class="icon iconBlue"><Pointer /></el-icon>
                <button class="buttonCommon" >
                    选择单词书
                </button>
                <el-icon class="rightArrow"><ArrowRight /></el-icon>
            </div>
        </div>
        <!-- Form -->
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
</template>
<style scoped>
@import './contentManager.css';
</style>
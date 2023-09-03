<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from "vue-router";
import axios from "axios";
import { useUserStore } from "../../stores/User"
import { ElMessage } from "element-plus";

const userStore = useUserStore();
const router = useRouter();
const words = ref([]);
const dis = ref([]);
const validBookName = ref(false);
let booknameValidationText = "Please enter the book name"
let centerDialogVisible = ref(false)
const bookName = ref('');
const hide = ref(false);
let bookId;
var flag;
//总页数
let pages;
//当前页码
const nowPage = ref(1)
var checkedWord = new Array();

const Request = axios.create({
    baseURL: 'api',
    timeout: 3000,
    withCredentials: true,
});
//获取第一页的数据
onMounted(() => {
    let request = {
        requestType: "getWordList",
        pageNumber: 1
    };
    Request.post("/addBook", request).then(
        (res) => {
            console.log(res);
            if (res.data.status == 'wordList') {
                words.value = res.data.wordList;
                pages = res.data.pages;
                console.log(pages);
            }
            else if (res.data.status == 'block') {
                router.push('/login');
                ElMessage({
                    type: "error",
                    message: "登陆过期或未登录！",
                    duration: 2000,
                });
            }
        })
})
function checkBookname() {
    clearTimeout(flag);
    flag = setTimeout(() => {
        let request = {
            requestType: "addBookRequest",
            bookName: bookName.value
        }
        Request.post("/addBook", request).then(
            (res) => {
                console.log(res);
                console.log(bookName.value);
                bookId = res.data.bookId+1;
                if (res.data.status == "bookRename") {
                    validBookName.value = false;
                }
                else if (res.data.status == "bookNotExist") {
                    validBookName.value = true;
                }
                booknameValidationText = validBookName.value ?
                    "right!" :
                    "duplicate name!"
            }
        )
    }, 1000)


}
function choose(id) {
    if (dis.value[id]) {
        console.log(id + '号单词被选中');
        checkedWord.push(id);
        console.log(checkedWord);
    }
    else {
        console.log(id + '号单词被去除');
        var index = checkedWord.indexOf(id);
        checkedWord.splice(index, 1);
        console.log(checkedWord);
    }
}
function createBookCheck() {
    console.log(666);
    if (bookName.value == null || !validBookName.value) {
        ElMessage({
            type: "error",
            message: "书名为空或重名！",
            duration: 2000,
        });
    }
    else {
        if (checkedWord.length == 0) {
            console.log(555);
            centerDialogVisible.value = true;
        }
        else {
            console.log(123123);
            createBook();
        }
    }
}
function createBook() {
    console.log(userStore.userId);
    console.log(sessionStorage.getItem("userId"));
    centerDialogVisible.value = false
    let request = {
        requestType: "addBook",
        bookName: bookName.value,
        hide: hide.value ? 0 : 1,
        wordNum: checkedWord.length,
        bookId: bookId,
        wordId: checkedWord,
        userId: localStorage.getItem("userId")
    };
    Request.post("/addBook", request).then(
        (res) => {
            console.log(res);
            if (res.data.status == "addBookSucceed") {
                ElMessage({
                    type: "success",
                    message: "创建成功",
                    duration: 2000,
                });
                setTimeout
                    (() => { router.push("/main") }, 500)
            }
            else {
                ElMessage({
                    type: "error",
                    message: "出错了！",
                    duration: 2000,
                });
            }
        }
    )
}
//返回
function back() {
    router.push('/contentManager')
}
//获取下一页的数据
watch(nowPage, (newCount) => {
    console.log(newCount);
    let request = {
        requestType: "getWordList",
        pageNumber: newCount
    };
    Request.post("/addBook", request).then(
        (res) => {
            console.log(res);
            words.value = res.data.wordList;
            pages = res.data.pages;
            console.log(pages);
        })
})
</script>
<template>
    <div class="main">
        <div class="top">
            <span class="viewName">新增单词书</span>
            <button class="buttonCommon outButton" @click="back">
                <el-icon>
                    <ArrowLeft />
                </el-icon>
            </button>
        </div>
        <div class="whiteBoxPlus" style="top: 8px;">
            <el-dialog v-model="centerDialogVisible" title="Warning" width="30%" align-center>
                <span>There are no words in the book, are you sure?</span>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="centerDialogVisible = false">Cancel</el-button>
                        <el-button type="primary" @click="createBook">
                            Confirm
                        </el-button>
                    </span>
                </template>
            </el-dialog>
            <form @submit.prevent="createBookCheck" style="display: flex;
    justify-content: center;
    flex-direction: column;
    width: 326px;
    margin: 0 auto;">
                <input style="height: 24px;" v-model="bookName" type="text" placeholder="bookName" @keyup="checkBookname()">
                <li class="namejudge" :class="{ 'wrong': !validBookName, 'right': validBookName }">
                    {{ booknameValidationText }}
                </li>
                <ul>
                    <li v-for="word in words">
                        {{ word.spell }} <input v-model="dis[word.id]" type="checkbox" @change="choose(word.id)" />
                    </li>
                </ul>
                <div class="example-pagination-block" style="margin: 10px 0 15px;">
                    <el-pagination layout="prev, pager, next" :total="pages * 10" v-model:current-page="nowPage" />
                </div>
                <span>是否共享单词书<input v-model="hide" type="checkbox" style="display: inline-block;margin-left: 4px;" /></span>
                <br>
                <button type="submit" style="margin: 10px 0;" class="buttonCommon">创建单词书</button>
            </form>
        </div>

    </div>
</template>
<style scoped>
@import './contentManager.css';

.example-pagination-block+.example-pagination-block {
    margin: 10px 5px;
}
</style>
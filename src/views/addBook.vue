<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from "vue-router";
import axios from "axios";
import { useUserStore } from "../stores/User"
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


var checkedWord = new Array();

const Request = axios.create({
    baseURL:'api',
    timeout: 3000,
    withCredentials: true,
});

onMounted(() => {
    let request = {
        requestType: "getWordList",
        pageNumber: 1
    };
    Request.post("/addBook", request).then(
        (res) => {
            console.log(res);
            words.value = res.data.wordList;
            console.log(words.value);
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
                bookId = res.data.bookId;
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

function choose(i,id) {
    if (dis.value[i]) {
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


</script>
<template>
    <div>
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
        <form @submit.prevent="createBookCheck">
            <input v-model="bookName" type="text" placeholder="bookName" @keyup="checkBookname()">
            <li class="namejudge" :class="{ 'wrong': !validBookName, 'right': validBookName }">
                {{ booknameValidationText }}
            </li>
            <ul>
                <li v-for="(word,index) in words">
                    {{ word.spell }} <input v-model="dis[index]" type="checkbox" @change="choose(index,word.id)" />
                </li>
            </ul>
            <span>是否共享单词书</span><input v-model="hide" type="checkbox" />
            <br>
            <button type="submit">创建单词书</button>
        </form>
    </div>
</template>
<style scoped>
.dialog-footer button:first-child {
    margin-right: 10px;
}

* {
    padding: 0;
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
}


.wrong {
    color: hotpink;
}

.right {
    color: #00c700;
}


</style>
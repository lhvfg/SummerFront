<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const bookName = ref('')
const validName = ref(false);
const validNameText = ref('');
const books = ref([])
const dialogFormVisible = ref(false)
const formLabelWidth = '140px'
const Request = axios.create({
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
        Request.post("http://localhost:8080/chooseBook", request).then(
            (res) => {
                console.log(res);
                if (res.data.status == "chooseSucceed") {
                    ElMessage({
                        type: "success",
                        message: "选择成功！",
                        duration: 2000,
                    });
                    clearAll();
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


onMounted(() => {
    let request = {
        requestType: "chooseBookRequest",
    };
    Request.post("http://localhost:8080/chooseBook", request).then(
        (res) => {
            console.log(res);
            books.value = res.data.bookList;
            books.value = books.value.filter((item) => { return item.hide != 1 || item.userId == localStorage.getItem("userId") });
            bookNames.value = books.value.map(item => item.bookName)
            console.log(books.value);
            console.log(bookNames.value);
        })
})
</script>
<template>
    <div>
        <button @click="addWord">新增单词</button>
        <button @click="upLoadWord">上传单词</button>
        <button @click="addBook">新增单词书</button>
        <button @click="upLoadBook">上传单词书</button>
    </div>
    <!-- Form -->
    <el-button text @click="dialogFormVisible = true">
        选择单词书
    </el-button>

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
</template>
<style scoped>
.wrong,
.right {
    width: 400px;
    margin-bottom: -13px;
}

.wrong {
    color: hotpink;
}

.right {
    color: #00c700;
}

.el-button--text {
    margin-right: 15px;
}

.el-select {
    width: 300px;
}

.el-input {
    width: 300px;
}

.dialog-footer button:first-child {
    margin-right: 10px;
}
</style>
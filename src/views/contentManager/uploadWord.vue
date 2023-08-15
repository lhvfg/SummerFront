<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { genFileId } from 'element-plus'
import type { UploadInstance, UploadProps, UploadRawFile } from 'element-plus'
import axios, { AxiosInstance } from "axios"
import { ElMessage } from "element-plus"
import { useRouter } from "vue-router";

const router = useRouter();
const books = ref<Book[]>([])
let dis = ref<boolean[]>([]);
const Request: AxiosInstance = axios.create({
    baseURL: 'api',
    timeout: 3000,
    withCredentials: true,
});
let checkedBook: number[] = [];
const config = {
    headers: {
        'Content-Type': 'multipart/form-data' // 请求头的 content-Type
    }
}
interface Book {
    id: number;
    bookName: string;
    hide: number;
    userId: string;
}
const centerDialogVisible = ref(false);
const dialog = "所上传单词不会添加进任何一本单词书，确定？"
const upload = ref<UploadInstance>()
var nowFile;
//文件覆盖
const handleExceed: UploadProps['onExceed'] = (files) => {
    upload.value!.clearFiles()
    const file = files[0] as UploadRawFile
    file.uid = genFileId()
    upload.value!.handleStart(file)
}
//文件更新
const handleChange: UploadProps['onChange'] = (files) => {
    nowFile = files.raw;
    console.log(nowFile);
}
// 提交验证
function bookIdCheck(): void {
    if (!upload.value) {
        ElMessage({
            type: "error",
            message: "请添加文件",
            duration: 2000,
        });
    } else if (checkedBook.length > 0) {
        submitUpload();
    } else {
        centerDialogVisible.value = true;
    }
}
//文件提交
const submitUpload = (): void => {
    //console.log(file);
    const formData = new FormData();
    formData.append('file', nowFile);
    for (var i = 0; i < checkedBook.length; i++) {
        formData.append('bookId[]', '' + checkedBook[i]);
    }
    console.log(nowFile);
    formData.forEach(f => {
        console.log(f);
    })
    // const request = {
    //     file: formData, 
    //     bookId : checkedBook
    // }
    Request.post('/upload', formData, config)
        .then((res) => {
            console.log(res.data);
            if (res.data.status === "uploadSuccess") {
                ElMessage({
                    type: "success",
                    message: "添加成功！",
                    duration: 2000,
                });
                //清空数据
                checkedBook = [];
                upload.value!.clearFiles();
                for(var i = 0;i < books.value.length;i++)
                {
                    dis.value[i] = false;
                }
            }
            else{
                ElMessage({
                        type: "error",
                        message: "出错了",
                        duration: 2000,
                    });
            }
        })
        .catch(error => {
            console.error(error);
            ElMessage({
                        type: "error",
                        message: "出错了",
                        duration: 2000,
                    });
        });
}


//单词书列表
onMounted(() => {
    const request = {
        requestType: "bookList",
    };
    Request.post("/addword", request).then(
        (res) => {
            console.log(res);
            books.value = res.data.bookList;
            books.value = books.value.filter((item) => { return item.hide != 1 || item.userId == localStorage.getItem("userId") });
            console.log(books.value);
        });
})
// 选中单词书
function choose(i: number, id: number): void {
    if (dis.value[i]) {
        console.log(id + '号单词书被选中');
        checkedBook.push(id);
        console.log(checkedBook);
    } else {
        console.log(id + '号单词书被去除');
        const index = checkedBook.indexOf(id);
        checkedBook.splice(index, 1);
        console.log(checkedBook);
    }
}
function back() {
    router.push('/main')
}
</script>

<template>
    <button class="outButton" @click="back"><el-icon>
            <ArrowLeft />
        </el-icon></button>
    <el-dialog v-model="centerDialogVisible" title="Warning" width="30%" align-center>
        <span>{{ dialog }}</span>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="centerDialogVisible = false">Cancel</el-button>
                <el-button type="primary" @click="submitUpload">
                    Confirm
                </el-button>
            </span>
        </template>
    </el-dialog>
    <el-upload ref="upload" class="upload-demo" action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
        :limit="1" :on-change="handleChange" :on-exceed="handleExceed" :auto-upload="false">
        <template #trigger>
            <el-button type="primary">select file</el-button>
        </template>
        <el-button class="ml-3" type="success" @click="bookIdCheck">
            upload to server
        </el-button>
        <template #tip>
            <div class="el-upload__tip text-red">
                limit 1 file, new file will cover the old file
            </div>
        </template>
    </el-upload>
    <ul>
        <li>选择要添加进的单词书：</li>
        <li v-for="(book, index) in books">
            {{ book.bookName }}<input v-model="dis[index]" type="checkbox" @change="choose(index, book.id)" />
        </li>
    </ul>
</template>
  
<style scoped>
.dialog-footer button:first-child {
    margin-right: 10px;
}
</style>
  
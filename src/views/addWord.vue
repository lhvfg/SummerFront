<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useRouter } from "vue-router";
import axios from "axios";
import { useUserStore } from "../stores/User"

const userStore = useUserStore();
const spell = ref('');
let meaningList = ref([{
    mean: null,
    part: null
}]);
let sentences = ref([{
    content: null,
    contentMean: null
}]);
let notes = ref([{
    content: null
}])
let centerDialogVisible = ref(false);
const dialog = ref('当前词条存在数据，确定删除？')
const types = [0, 1, 2]
let typeValue;
let deletIndex;
const Request = axios.create({
    baseURL:'api',
    timeout: 3000,
    withCredentials: true,
});
let spellValidationText = "Please enter the word spell"
const books = ref([])
const dis = ref([]);
const validSpell = ref(false);
var flag;
let wordId;
var checkedBook = new Array();
//清空界面
function clearAll() {
    spell.value = '';
    meaningList.value = [{
        mean: null,
        part: null
    }];
    sentences.value = [{
        content: null,
        contentMean: null
    }];
    notes.value = [{
        content: null
    }]
    centerDialogVisible.value = false;
    spellValidationText = "Please enter the word spell"
    books.value = []
    dis.value = [];
    validSpell.value = false;
    wordId = null;
    checkedBook = new Array();
}
//获取单词书
onMounted(() => {
    let request = {
        requestType: "bookList",
    };
    Request.post("/addword", request).then(
        (res) => {
            console.log(res);
            books.value = res.data.bookList;
            books.value = books.value.filter((item) => { return item.hide != 1||item.userId==localStorage.getItem("userId") });
            console.log(books.value);
        })
})
//判断重复
function checkSpell() {
    clearTimeout(flag);
    flag = setTimeout(() => {
        let request = {
            requestType: "addWordRequest",
            spell: spell.value
        }
        Request.post("/addword", request).then(
            (res) => {
                wordId = res.data.wordId;
                if (res.data.status == "wordExisted") {
                    validSpell.value = false;
                }
                else if (res.data.status == "wordNotExist") {
                    validSpell.value = true;
                }
                spellValidationText = validSpell.value ?
                    "wordNotExist!" :
                    "wordExisted!"
            }
        )
    }, 1000)


}
//输入数据
function addMeaning(i) {
    if (meaningList.value[i].part == null || meaningList.value[i].mean == null) {
        ElMessage({
            type: "warning",
            message: "当前词条存在null,不可添加新词条！",
            duration: 2000,
        });
    }
    else {
        meaningList.value.push({ mean: null, part: null });
    }
}
function deleteMeaningRequest(i, type) {
    if (meaningList.value.length == 1) {
        ElMessage({
            type: "warning",
            message: "必须存在一条释义、例句、笔记！",
            duration: 2000,
        });
    }
    else {
        typeValue = type;
        deletIndex = i;
        if (meaningList.value[i].part != null || meaningList.value[i].mean != null) {
            centerDialogVisible.value = true;
        }
        else {
            Delete();
        }
    }
}
function addSentence(i) {
    if (sentences.value[i].content == null || sentences.value[i].contentMean == null) {
        ElMessage({
            type: "warning",
            message: "当前词条存在null,不可添加新词条！",
            duration: 2000,
        });
    }
    else {
        sentences.value.push({ content: null, contentMean: null });
    }
}
function deleteSentenceRequest(i, type) {
    if (sentences.value.length == 1) {
        ElMessage({
            type: "warning",
            message: "必须存在一条释义、例句、笔记！",
            duration: 2000,
        });
    }
    else {
        typeValue = type;
        deletIndex = i;
        if (sentences.value[i].content != null || sentences.value[i].contentMean != null) {
            centerDialogVisible.value = true;
        }
        else {
            Delete();
        }
    }
}
function addNote(i) {
    if (notes.value[i].content == null) {
        ElMessage({
            type: "warning",
            message: "当前词条存在null,不可添加新词条！",
            duration: 2000,
        });
    }
    else {
        notes.value.push({ content: null });
    }
}
function deleteNoteRequest(i, type) {
    if (notes.value.length == 1) {
        ElMessage({
            type: "warning",
            message: "必须存在一条释义、例句、笔记！",
            duration: 2000,
        });
    }
    else {
        typeValue = type;
        deletIndex = i;
        if (notes.value[i].content != null) {
            centerDialogVisible.value = true;
        }
        else {
            Delete();
        }
    }
}
function Delete() {
    centerDialogVisible.value = false;
    if (typeValue == 0)
        meaningList.value.splice(deletIndex, 1);
    else if (typeValue == 1)
        sentences.value.splice(deletIndex, 1);
    else if (typeValue == 2)
        notes.value.splice(deletIndex, 1)
}
//选中单词书
function choose(i, id) {
    if (dis.value[i]) {
        console.log(id + '号单词书被选中');
        checkedBook.push(id);
        console.log(checkedBook);
    }
    else {
        console.log(id + '号单词书被去除');
        var index = checkedBook.indexOf(id);
        checkedBook.splice(index, 1);
        console.log(checkedBook);
    }
}
() => {

}
//添加单词
function createWord() {
    let request = {
        requestType: "addWord",
        wordId: wordId,
        wordType: validSpell.value ? 1 : 0,
        spell: spell.value,
        meaningContent: meaningList.value.map(item => item.mean),
        function: meaningList.value.map(item => item.part),
        sentenceContent: sentences.value.map(item => item.content),
        sentenceContentMean: sentences.value.map(item => item.contentMean),
        noteContent: notes.value.map(item => item.content),
        userId: userStore.userId,
        bookId: checkedBook
    };
    Request.post("/addword", request).then(
        (res) => {
            console.log(res);
            if (res.data.status == "addWordSucceed") {
                ElMessage({
                    type: "success",
                    message: "创建成功",
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
        }
    )

}


</script>
<template>
    <div>
        <el-dialog v-model="centerDialogVisible" title="Warning" width="30%" align-center>
            <span>{{ dialog }}</span>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="centerDialogVisible = false">Cancel</el-button>
                    <el-button type="primary" @click="Delete()">
                        Confirm
                    </el-button>
                </span>
            </template>
        </el-dialog>
        <form @submit.prevent="createWord">
            <ul>
                <li>
                    <input v-model="spell" type="text" placeholder="拼写" @keyup="checkSpell()">
                </li>
                <li class="namejudge" :class="{ 'wrong': !validSpell, 'right': validSpell }">
                    {{ spellValidationText }}
                </li>
                <li v-for="(meaning, index) in meaningList">
                    <input v-model="meaning.part" type="text" placeholder="词性">
                    <input v-model="meaning.mean" type="text" placeholder="对应释义">
                    <button type="button" @click="addMeaning(index)">添加</button>
                    <button type="button" @click="deleteMeaningRequest(index, types[0])">删除</button>
                </li>
                <li v-for="(sentence, index) in sentences">
                    <input v-model="sentence.content" type="text" placeholder="例句">
                    <input v-model="sentence.contentMean" type="text" placeholder="中文释义">
                    <button type="button" @click="addSentence(index)">添加</button>
                    <button type="button" @click="deleteSentenceRequest(index, types[1])">删除</button>
                </li>
                <li v-for="(note, index) in notes">
                    <input v-model="note.content" type="text" placeholder="笔记">
                    <button type="button" @click="addNote(index)">添加</button>
                    <button type="button" @click="deleteNoteRequest(index, types[2])">删除</button>
                </li>
                <li v-for="(book, index) in books">
                    {{ book.bookName }}<input v-model="dis[index]" type="checkbox" @change="choose(index, book.id)" />
                </li>
                <li>
                    <button type="submit">
                        创建单词
                    </button>
                </li>
            </ul>
        </form>
    </div>
</template>
<style scoped>
.wrong {
    color: hotpink;
}

.right {
    color: #00c700;
}

.dialog-footer button:first-child {
    margin-right: 10px;
}

* {
    padding: 0;
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
}
</style>
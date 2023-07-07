<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from "vue-router";
import axios from "axios";
import { useUserStore } from "../stores/User"
import { ElMessage } from "element-plus";

const userStore = useUserStore();
const router = useRouter();
const words = ref([]);
const dis = ref(false);

var checkedWord = new Array();

const Request = axios.create({
    timeout: 3000,
    withCredentials: true,
});

onMounted(() => {
    let request = {
        requestType: "getWordList",
        pageNumber: 1
    };
    Request.post("http://localhost:8080/addBook", request).then(
        (res) => {
            console.log(res);
            words.value = res.data.wordList;
            console.log(words.value);
        })
})

function choose(id) {
    if (dis.value) {
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


const bookName = ref('');

</script>
<template>
    <div>
        <form>
            <input v-model="bookName" type="text">
            <ul>
                <li v-for="word in words">
                    {{ word.spell }} <input v-model="dis" type="checkbox" @change="choose(word.id)" />
                </li>
            </ul>
        </form>
    </div>
</template>
<style scoped></style>
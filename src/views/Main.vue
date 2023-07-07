<script setup>
import {ref,reactive} from 'vue'
import { useRouter } from "vue-router";
const router = useRouter();
function addWord (){
    setTimeout(()=>{
        router.push("/addWord");
    },500)
}
function addBook (){
    setTimeout(()=>{
        router.push("/addBook");
    },500)
}
function chooseBook (){
    setTimeout(()=>{
        router.push("/chooseBook");
    },500)
}

</script>
<template>

<div> 
   <button @click="addWord">新增单词</button>
   <button @click="upLoadWord">上传单词</button>
   <button @click="addBook">新增单词书</button>
   <button @click="chooseBook">选择单词书</button>
   <button @click="upLoadBook">上传单词书</button>
</div>

</template>
<style scoped>

</style>
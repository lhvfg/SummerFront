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

</script>
<template>

<div> </div>

</template>
<style scoped>

</style>
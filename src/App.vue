<script setup>
import {ref,reactive} from 'vue'
import { RouterLink, RouterView } from "vue-router";
import SignIn from './views/SignIn.vue';
import Child from "./views/Child.vue"

</script>

<template>
<RouterView></RouterView>
</template>

<style>
	.Main-container {
		display: flex;
		justify-content: center;
		align-items: center;
		background-image: linear-gradient(to bottom right, transparent, mistyrose);
		background-color: #212121;
		background-repeat: no-repeat;
		background-size: cover;
		background-attachment: fixed;
	}
</style>
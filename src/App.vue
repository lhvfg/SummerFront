<script setup>
import {ref,reactive} from 'vue'
import { RouterLink, RouterView } from "vue-router";


</script>

<template>
<RouterView></RouterView>
</template>

<style>
* {
            padding: 0;
            margin: 0;
            font-family: Arial, Helvetica, sans-serif;
        }
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
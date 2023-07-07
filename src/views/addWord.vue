<script setup>
import { ref, reactive } from 'vue'
const spell= reactive('');

</script>
<template>
    <div>
        <form>
            <input v-model="spell" type="text" >
            
        </form>
    </div>
</template>
<style scoped></style>
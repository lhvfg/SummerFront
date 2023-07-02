<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from "vue-router";
import axios from "axios";
const router = useRouter();
const showRegister = ref(false);
      const usernameNew = ref('');
      const passwordNew = ref('');
      const Email = ref('');
      const username = ref('');
      const password = ref('');
      const rememberName = ref(false);
      const rememberAll = ref(false);
  
      const validUsername = ref(false);
      const validPassword = ref(false);
      const validEmail = ref(false);

	  const Register = axios.create({
		timeout: 3000,
		withCredentials: true,
	});
  
      const usernameValidationText = 'Username should be 1-12 English characters or numbers'
      const passwordValidationText = ref('Password should be English characters or numbers more than 8 words and within 15 words');
      const EmailValidationText = ref('Please input your QQ-Email in the correct format');
  
      function checkUsername(value) {
        const regex = /^[a-zA-Z0-9]{1,12}$/;
        validUsername.value = regex.test(value);
        usernameValidationText.value = validUsername.value
          ? 'right!'
          : 'Username should be 1-12 English characters or numbers';
      }
  
      function checkPassword(value) {
        const regex = /^[a-zA-Z0-9]{8,15}$/;
        validPassword.value = regex.test(value);
        passwordValidationText.value = validPassword.value
          ? 'right!'
          : 'Password should be English characters or numbers more than 8 words and within 15 words';
      }
  
      function checkEmail(value) {
        const regex = /^[1-9]\d{7,10}@qq\.com$/;
        validEmail.value = regex.test(value);
        EmailValidationText.value = validEmail.value
          ? 'right!'
          : 'Please input your QQ-Email in the correct format';
      }
  
      function handleRegister() {
		const _username = username.value.trim(); //trim()方法用于处理空格
		localStorage.setItem("username", _username);

		// store.username = _username;
		username.value = "";
		let request = {
			name: localStorage.getItem("username"),
		};
        if (validUsername.value && validPassword.value && validEmail.value) {
            Register.post
			alert('Registration successful');
        } else {
          alert('Registration failed');
        }
      }
  
      function handleLogin() {
        // Implement login logic here
      }
  
      function toggleForm() {
        showRegister.value = !showRegister.value;
        clearForm();
      }
  
      function clearForm() {
        usernameNew.value = '';
        passwordNew.value = '';
        Email.value = '';
        username.value = '';
        password.value = '';
        rememberName.value = false;
        rememberAll.value = false;
        validUsername.value = false;
        validPassword.value = false;
        validEmail.value = false;
        usernameValidationText.value = '';
        passwordValidationText.value = '';
        EmailValidationText.value = '';
      }

	  function forget(){
		router.push("/forget");
	  }

</script>
<template>
	<div style="width: 98vw;height: 100vw;background-color: #d7daca;">
		<div class="main" :class="{ short: !showRegister, tall: showRegister }">
		<div class="new-box" :class="{ 'left': !showRegister, 'mid': showRegister }">
			<div class="title">register</div>
			<form @submit.prevent="handleRegister">
				<ul>
					<li>
						<input v-model="usernameNew" type="text" placeholder="Username"
							@keyup="checkUsername(usernameNew)" />
					</li>
					<li class="namejudge" :class="{ 'wrong': !validUsername, 'right': validUsername }">
						{{ usernameValidationText }}
					</li>
					<li>
						<input v-model="passwordNew" type="password" placeholder="Password"
							@keyup="checkPassword(passwordNew)" />
					</li>
					<li class="passwordjudge" :class="{ 'wrong': !validPassword, 'right': validPassword }">
						{{ passwordValidationText }}
					</li>
					<li>
						<input v-model="Email" type="text" placeholder="Email" @keyup="checkEmail(Email)" />
					</li>
					<li class="Emailjudge" :class="{ 'wrong': !validEmail, 'right': validEmail }">
						{{ EmailValidationText }}
					</li>
					<li class="change-login" @click="toggleForm">login an existing account?</li>
					<li class="btn-new">
						<button type="submit">SUBMIT</button>
					</li>
				</ul>
			</form>
		</div>
		<div class="login-box" :class="{ 'mid': !showRegister, 'left': showRegister }">
			<div class="title">login</div>
			<form @submit.prevent="handleLogin">
				<ul>
					<li>
						<input v-model="username" type="text" placeholder="Username" />
					</li>
					<li>
						<input v-model="password" type="password" placeholder="Password" />
					</li>
					<li>
						<input v-model="rememberName" type="checkbox" id="remember1" />
						<span>remember name</span>
						<input v-model="rememberAll" type="checkbox" id="remember2" :disabled="!rememberName"  />
						<span>remember all</span>
					</li>
					<li class="change-new word-left" @click="toggleForm">register a new account?</li>
					<li class="change-new word-right" @click="forget">forget the password?</li>
					<li class="btn">
						<button type="submit">SUBMIT</button>
					</li>
				</ul>
			</form>
		</div>
	</div>
	</div>
	
</template>
<style scoped>
* {
            padding: 0;
            margin: 0;
            font-family: Arial, Helvetica, sans-serif;
        }
        
        body {
            /* background: url(../绘蓝杯1/插画集/10.png) center center no-repeat;
            background-size: contain; */
            background-color: #d7daca;
			height: 98vw;
			width: 100vw;
        }
        
        .imgbox {
            overflow: hidden;
            height: 100%;
            /* width: 1280px; */
        }
        
        .background {
            width: 100vw;
            transform: scale(1.06);
            height: 56vw;
            top: 0;
            left: 0;
            z-index: -6;
        }
        
        .main {
            background: #15152a11;
            width: 379px;
            position: absolute;
            left: 50%;
            top: 47.5%;
            transform: translate(-50%, -50%) scale(1.2);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur( 4px);
            box-shadow: 0px 0px 5px 5px rgb(0 0 0 / 39%);
            border-radius: 11px;
            flex-wrap: wrap;
            overflow: hidden;
        }
        
        .short,
        .tall {
            transition: all .3s;
        }
        
        .short {
            height: 400px;
        }
        
        .tall {
            height: 490px;
        }
        
        .new-box,
        .login-box {
            display: flex;
            justify-content: center;
            align-items: center;
            position: absolute;
            flex-direction: column;
        }
        
        .left,
        .mid {
            top: 50%;
            transform: translate(-50%, -50%);
            transition: all .4s;
        }
        
        .left {
            left: -400px;
        }
        
        .mid {
            left: 50%;
        }
        
        ul {
            margin-top: 105px;
        }
        
        li {
            list-style: none;
            text-align: center;
            padding-top: 11px;
        }
        
        li input {
            font-size: 20px;
            border: none;
            box-sizing: border-box;
            padding: 5px;
            background-color: transparent;
            border-bottom: 1px solid white;
            outline: none;
            color: white;
        }
        
        li button {
            font-size: 20px;
            padding: 5px;
            background-color: transparent;
            color: black;
            border: 0;
        }
        
        .title {
            font-weight: 900;
            color: white;
            margin: 0 100px -60px;
            font-size: 53px;
        }
        
        ul span {
            margin-right: 8px;
            color: wheat;
        }
        
        .btn,
        .btn-new {
            position: relative;
        }
        
        .btn::after,
        .btn-new::after {
            position: absolute;
            content: '';
            bottom: -1px;
            left: 50%;
            transform: translate(-50%, -50%);
            display: block;
            background-color: rgb(255, 122, 58);
            height: 2px;
            width: 7px;
            color: white;
            transition: all .2s;
        }
        
        .btn:hover::after,
        .btn-new:hover::after {
            width: 85px;
        }
        
        .change-new,
        .change-login {
            color: aqua;
            font-size: 13px;
        }
        
        .change-new:hover,
        .change-login:hover {
            cursor: pointer;
        }
        
        .wrong,
        .right {
            font-size: 15px;
			width: 375px;
        }
        
        .wrong {
            color: hotpink;
        }
        
        .right {
            color: #00c700;
        }
        
        #Email::-webkit-input-placeholder {
            color: rgb(183, 176, 176);
        }
        
        button {
            cursor: pointer;
        }
		
		.word-left{
			left: 30px;
		}
		.word-right{
			right: 30px;
		}
</style>
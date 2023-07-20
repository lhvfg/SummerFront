import { defineStore } from "pinia";
import axios from "axios";

export const useUserStore = defineStore(
    "User", {
        state: () => ({
            userId: null,
            userName: "Default",
            todayNum: 0,
            allNum: 0,
            todayTime: "0",
            allTime: "0",
            teamId: null,
            chooseBookId: null,
            nowDay: null
        }),
        actions: {
            setUserId(id) {
                this.userId = id;
            }
        },
        getters: {
            //computed
            WelcomeUser: (state) => {
                return "欢迎你的到来!" + state.userName;
            },
            RandomNum: () => {
                return Math.floor(Math.random() * 10) + 1;
            },
        },




    }
)
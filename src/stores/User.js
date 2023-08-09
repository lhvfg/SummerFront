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
            nowDay: null,
            reviewNum: 0,
            bookName: null
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
            RandomNum: (max) => {
                return Math.floor(Math.random() * max);
            },
            Today: () => {
                let yy = new Date().getFullYear();
                let mm = new Date().getMonth() + 1;
                let dd = new Date().getDate();
                return yy + '-' + (mm < 10 ? '0' + mm : mm) + '-' + (dd < 10 ? '0' + dd : dd);
            }
        },
    }
)
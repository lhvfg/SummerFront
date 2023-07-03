import { defineStore } from "pinia";
import axios from "axios";

export const useUserStore = defineStore(
    "User", {
        state: () => ({
            username: "Default"
        }),
        getters: {
            //computed
            WelcomeUser: (state) => {
                return "欢迎你的到来!" + state.username;
            },
            RandomNum: () => {
                Math.floor(Math.random() * 10) + 1;
            },
        },




    }
)
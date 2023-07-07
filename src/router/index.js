import { createRouter, createWebHistory } from "vue-router";
const router = createRouter({
    history: createWebHistory(),
    routes: [{
            path: "/login",
            name: "login",
            component: () =>
                import ("../views/Register_login/Register_login.vue"),
        },
        {
            path: "/forget",
            name: "forgetName",
            component: () =>
                import ("../views/forgetName.vue"),
        },
        {
            path: "/main",
            name: "MainPage",
            component: () =>
                import ("../views/Main.vue"),
        },
        {
            path: "/addword",
            name: "addWord",
            component: () =>
                import ("../views/addWord.vue"),
        },
        {
            path: "/addBook",
            name: "addBook",
            component: () =>
                import ("../views/addBook.vue"),
        },
        {
            path: "/",
            redirect: {
                name: "login",
            },
        },
    ],
});

export default router;
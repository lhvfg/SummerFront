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
            name: "Main",
            component: () =>
                import ("../views/main/main.vue"),
        },
        {
            path: "/contentManager",
            name: "contentManager",
            component: () =>
                import ("../views/contentManager/contentManager.vue"),
        },
        {
            path: "/addword",
            name: "addWord",
            component: () =>
                import ("../views/contentManager/addWord.vue"),
        },
        {
            path: "/uploadWord",
            name: "uploadWord",
            component: () =>
                import ("../views/contentManager/uploadWord.vue"),
        },
        {
            path: "/addBook",
            name: "addBook",
            component: () =>
                import ("../views/contentManager/addBook.vue"),
        },
        {
            path: "/learn",
            name: "learn",
            component: () =>
                import ("../views/Recite/learn.vue"),
        },
        {
            path: "/review",
            name: "review",
            component: () =>
                import ("../views/Recite/review.vue"),
        },
        {
            path: "/mycontent",
            name: "mycontent",
            component: () =>
                import ("../views/mycontent/mycontent.vue"),
        },
        {
            path: "/dashboard",
            name: "dashboard",
            component: () =>
                import ("../views/dashboard/dashboard.vue"),
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
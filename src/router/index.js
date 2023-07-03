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
            path: "/",
            redirect: {
                name: "login",
            },
        },
    ],
});

export default router;
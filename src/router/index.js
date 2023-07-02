import { createRouter, createWebHistory } from "vue-router";
const router = createRouter({
    history: createWebHistory(),
    routes: [{
            path: "/login",
            name: "login",
            component: () =>
                import ("../views/SignIn.vue"),
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
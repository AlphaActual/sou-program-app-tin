import { createRouter, createWebHistory } from "vue-router";

const routes = [
    {
        path: "/",
        name: "WebWrapper",
        component: () => import("@/WebWrapper.vue"),
        meta: {
            authRequired: false,
        },
        children: [
            {
                path: "",
                name: "HomeView",
                component: () => import("@/views/Web/HomeView.vue"),
            },
            {
                path: "about",
                name: "AboutView",
                component: () => import("@/views/Web/AboutView"),
            },
            {
                path: "contact",
                name: "ContactView",
                component: () => import("@/views/Web/ContactView"),
            },
            {
                path: "educators",
                name: "EducatorsView",
                component: () => import("@/views/Web/EducatorsView"),
            },
            {
                path: "podcast",
                name: "PodcastView",
                component: () => import("@/views/Web/PodcastView"),
            },
        ],
    },
    {
        path: "/",
        name: "AppWrapper",
        component: () => import("@/AppWrapper.vue"),
        meta: {
            authRequired: true,
        },
        children: [
            {
                path: "/login",
                name: "LoginView",
                meta: {
                    authRequired: false,
                },
                component: () => import("../views/LoginView.vue"),
            },
            {
                path: "/error",
                name: "Error",
                component: () => import("../views/Error.vue"),
            },
            {
                path: "/success",
                name: "Success",
                component: () => import("../views/Success.vue"),
            },
            {
                path: "/newsfeed",
                name: "NewsfeedView",

                component: () => import("../views/NewsfeedView.vue"),
            },
            {
                path: "/search",
                name: "SearchView",
                component: () => import("../views/SearchView.vue"),
            },
            {
                path: "/my-profile",
                name: "MyProfileView",
                component: () => import("../views/MyProfileView.vue"),
            },
            {
                path: "/user-profile",
                name: "UserProfileView",
                component: () => import("../views/UserProfileView.vue"),
            },
        ],
    },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,

    // TODO Check if we can apply this globaly
    scrollBehavior(to, from, savedPosition) {
        return {
            top: -1,
        };
    },
});

router.beforeEach((to, _from, next) => {
    const token = localStorage.getItem("token");
    const isUserLoggedIn = token !== null;

    // success and error
    let shouldRefresh = localStorage.getItem("shouldRefresh") === "true";
    if (shouldRefresh) {
        localStorage.removeItem("shouldRefresh");
        location.reload();
    }

    // provjera auth
    if (to.meta.authRequired) {
        if (!isUserLoggedIn) {
            return next({ name: "LoginView" });
        }
    } else {
        if (isUserLoggedIn) {
            if (to.name === "LoginView") {
                return next({ name: "NewsfeedView" });
            }
        }
    }

    return next();
});

export default router;

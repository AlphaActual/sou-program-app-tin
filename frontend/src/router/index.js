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
        path: "/login",
        name: "LoginView",
        meta: {
            authRequired: false,
        },
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
            import(/* webpackChunkName: "about" */ "../views/LoginView.vue"),
    },
    {
        path: "/error",
        name: "Error",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
            import(/* webpackChunkName: "about" */ "../views/Error.vue"),
    },
    {
        path: "/success",
        name: "Success",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
            import(/* webpackChunkName: "about" */ "../views/Success.vue"),
    },
    {
        path: "/newsfeed",
        name: "NewsfeedView",
        meta: {
            authRequired: true,
        },
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
            import(/* webpackChunkName: "about" */ "../views/NewsfeedView.vue"),
    },
    {
        path: "/search",
        name: "SearchView",
        meta: {
            authRequired: true,
        },
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
            import(/* webpackChunkName: "about" */ "../views/SearchView.vue"),
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

    // provjera auth
    if (to.meta.authRequired) {
        if (isUserLoggedIn) {
            if (to.name !== "NewsfeedView" && to.name !== "SearchView") {
                return next({ name: "NewsfeedView" });
            }
        }
    } else {
        if (isUserLoggedIn) {
            if (
                to.name === "LoginView" ||
                to.name === "HomeView" ||
                to.name === "SearchView"
            ) {
                return next({ name: "NewsfeedView" });
            }
        }
    }

    return next();
});

export default router;

import { defineStore } from 'pinia';
import backendApiService from '@/services/backendApiService';
import imageService from '@/services/imageService';
import authService from '@/services/authService';

const formatUserData = async (user) => {
    let profilePictureSrc = await imageService.getImageSrc(
        user.profile_picture_key
    );
    if (!profilePictureSrc) {
        profilePictureSrc = require('@/assets/sp-icon.png');
    }

    return {
        ...user,
        fullName: `${user.name} ${user.surname}`,
        email: user.e_mail,
        profilePictureSrc,
    };
};

export const useStoreUser = defineStore('storeUser', {
    state: () => ({
        users: [],
    }),
    getters: {
        getUserByUsername: (state) => (username) => {
            return state.users.find(
                (user) => user.username.toLowerCase() === username.toLowerCase()
            );
        },
        getUserByID: (state) => (userID) => {
            return state.users.find((user) => user.id === Number(userID));
        },
        getSearchedUsersByUsername: (state) => (searchedUsername) => {
            const searchLowerCase = searchedUsername.toLowerCase();
            const currentUser = state.getUserByUsername(
                authService.getAuthUsername()
            );

            return state.users.filter((user) => {
                const fullNameLowerCase = user.fullName.toLowerCase();
                const reversedFullNameLowerCase =
                    `${user.surname} ${user.name}`.toLowerCase();

                return (
                    (authService.isAuthUserDemos() || user !== currentUser) &&
                    (fullNameLowerCase.includes(searchLowerCase) ||
                        reversedFullNameLowerCase.includes(searchLowerCase))
                );
            });
        },
    },
    actions: {
        async fetchUsers() {
            const res = await backendApiService.get({
                url: '/users',
            });

            if (!res.ok) {
                this.$router.push('/error');
                return;
            }

            const resObj = await res.json();
            this.users = await Promise.all(
                resObj.data.users.map(formatUserData)
            );

            return this.users;
        },
        async createUser(user) {
            const res = await backendApiService.post({
                url: '/users',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user),
            });

            this.$router.push(res.ok ? '/success' : '/error');
        },
        async updateUser(user) {
            const res = await backendApiService.patch({
                url: `/users/${user.id}`,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user),
            });

            this.$router.push(res.ok ? '/success' : '/error');
        },
        async deleteUser(userID) {
            const res = await backendApiService.delete({
                url: `/users/${userID}`,
                headers: { 'Content-Type': 'application/json' },
            });

            this.$router.push(res.ok ? '/success' : '/error');
        },
    },
});

import Vue from 'vue'
import Vuex from 'vuex'

const fb = require('./firebaseConfig')

Vue.use(Vuex)

fb.auth.onAuthStateChanged(user => {
    if (user) {
        store.commit('setCurrentUser', user)
        store.dispatch('fetchUserProfile')

        fb.postsCollection.orderBy('createdOn', 'desc').onSnapshot(querySnapshot => {
            let postsArray = []

            querySnapshot.forEach(doc => {
                let post = doc.data()
                post.id = doc.id
                postsArray.push(post)
            })

            store.commit('setPosts', postsArray)
        })
    }
});

export const store = new Vuex.Store({
    state: {
        currentUser: null,
        userProfile: {},
        posts: [],
        photos: null,
        file: null,
        showPostModal: false    
    },
    actions: {
        clearData({ commit }) {
            commit('setCurrentUser', null)
            commit('setUserProfile', {})
            commit('setPosts', null)
        },
        postModal({ commit }) {
            commit('setPostModal', true)
        },
        closePostModal({ commit }) {
            commit('setPostModal', false)
        },
        fetchUserProfile({ commit, state }) {
            fb.usersCollection.doc(state.currentUser.uid).get()
                .then(res => {
                    commit('setUserProfile', res.data())
                    console.log(res.data())
                }).catch(err => {
                    console.log(err)
                })
        },
        fetchPhotoURL({ commit, state }) {
            fb.uploads.child(state.file).getDownloadURL()
                .then((url) => {
                    commit('setPhotos', url);
                }).catch(err => {
                    console.log(err)
                })
        }
    }, 
    mutations: {
        setCurrentUser(state, val) {
            state.currentUser = val
            console.log(val)
        },
        setUserProfile(state, val) {
            state.userProfile = val
        },
        setPosts(state, val) {
            state.posts = val
        },
        setPhotos(state, val) {
            state.photos = val
        },
        setFile(state, val) {
            state.file = val
        },
        setPostModal(state, val) {
            state.showPostModal = val
        }
    }
})
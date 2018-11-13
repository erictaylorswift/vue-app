<template>
    <div id='dashboard'>

        <transition name="fade">
            <div v-if="showPostModal" class="c-modal">
                <div class="c-container">
                    <a @click="closePostModal">X</a>
                    <h5>{{ userProfile.name }}</h5>
                    <p>{{ userProfile.title }}</p>
                    <div class="create-post">
                        <p>create a post</p>
                        <form @submit.prevent>
                            <input type="file" @change="onFileSelected">
                            <textarea v-model.trim="post.content"></textarea>
                            <button @click="createPost" :disabled="post.content === ''" class="button">post</button>
                        </form>
                    </div>
                </div>
            </div>
        </transition>

       <!-- comment modal -->
        <transition name="fade">
            <div v-if="showCommentModal" class="c-modal">
                <div class="c-container">
                    <a @click="closeCommentModal">X</a>
                    <p>add a comment</p>
                    <form @submit.prevent>
                        <textarea v-model.trim="comment.content"></textarea>
                        <button @click="addComment" :disabled="comment.content == ''" class="button">add comment</button>
                    </form>
                </div>
            </div>
        </transition>

        <a @click="openPostModal" class="createPostButton">Create Post</a>
        <section>
            <div v-if="posts.length" class="postsContainer">
                <div v-for="post in posts" :key="post.id" class="post">
                    <img :src="post.photo" style="width: 100%">
                    <h5>{{ post.userName }}</h5>
                    <span>{{ post.createdOn | formatDate }}</span>
                    <p>{{ post.content | trimLength }}</p>
                    <ul>
                        <li>comments: {{ post.comments }}</li>
                        <li>like: {{ post.likes }}</li>
                    </ul>
                    <ul>
                        <li><a @click="openCommentModal(post)">Comment</a></li>
                        <li><a>Full post</a></li>
                    </ul>
                </div>
            </div>
            <div v-else>
                <p class="no-results">There are currently no posts</p>
            </div>
        </section>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import moment from 'moment';
    const fb = require('../firebaseConfig');

    export default {
        data() {
            return {
                post: {
                    content: ''
                },
                comment: {
                    postId: '',
                    userId: '',
                    content: '',
                    postComments: 0
                },
                showCommentModal: false,
                showPostModal: false,
                selectedFile: null,
               }
        },
        computed: {
            ...mapState(['userProfile', 'currentUser', 'posts', 'photos'])
        },
        methods: {
            openPostModal() {
                this.showPostModal = true
            },
            closePostModal() {
                this.showPostModal = false
                this.photos = ''
            },
            openCommentModal(post) {
                this.comment.postId = post.id
                this.comment.userId = post.userId
                this.comment.postComments = post.comments
                this.showCommentModal = true
            },
            closeCommentModal() {
                this.comment.postId = ''
                this.comment.userId = ''
                this.comment.content = ''
                this.showCommentModal = false
            },
            addComment() {
                let postId = this.comment.postId
                let postComments = this.comment.postComments

                fb.commentsCollection.add({
                    createdOn: new Date(),
                    content: this.comment.content,
                    postId: postId,
                    userId: this.currentUser.uid,
                    userName: this.userProfile.name
                }).then(doc => {
                    fb.postsCollection.doc(postId).update({
                        comments: postComments + 1
                    }).then(() => {
                        this.closeCommentModal()
                    })
                }).catch(err => {
                    console.log(err)
                })
            },
            createPost() {

                fb.uploads.child(this.selectedFile.name).put(this.selectedFile)
                    .then(() => {
                        this.$store.commit('setFile', this.selectedFile.name)
                        
                    }).then(() => {
                        this.$store.dispatch('fetchPhotoURL')
                    }).catch(err => {
                        console.log(err)
                    })

                fb.postsCollection.add({
                    createdOn: new Date(),
                    content: this.post.content,
                    userId: this.currentUser.uid,
                    userName: this.userProfile.name,
                    photo: this.photos,
                    comments: 0,
                    likes: 0
                }).then(ref => {
                    this.post.content = ''
                }).then(() => {
                    this.closePostModal()
                }).catch(err => {
                    console.log(err)
                })
            },
            onFileSelected(event) {
                this.selectedFile = event.target.files[0]
            }
        },
        filters: {
            formatDate(val) {
                if (!val) { return '-'}
                let date = val.toDate()
                return moment(date).fromNow()
            },
            trimLength(val) {
                if (val.length < 200 ) {
                    return val
                }
                return `${val.substring(0, 200)}...`
            }
        }    
    }
</script>
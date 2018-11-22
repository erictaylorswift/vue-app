<template>
    <div id='dashboard'>

        <transition name="fade">
            <div v-if="showPostModal" class="c-modal">
                <div class="c-container">
                    <a @click="closePostModal">X</a>
                    <h5>Post your art</h5>
                    <div class="create-post">
                        <form @submit.prevent>
                            <croppa 
                                v-model="myCroppa"
                                :width="300"
                                :height="300"
                                :placeholder="'Upload your art'"
                                :accept="'image/*'"
                                :disable-drag-and-drop="false"
                                @image-remove="onRemove"
                                @new-image="onFileSelected"></croppa>
                            <textarea v-if="fileGenerated" v-model.trim="post.content" placeholder="describe your art here"></textarea>
                            <button v-if="fileGenerated" @click="createPost" :disabled="post.content === ''" class="button">post</button>
                            <button v-else @click="uploadCroppedImage" class="button">Crop Image</button>
                        </form>
                    </div>
                </div>
            </div>
        </transition>

        <!-- error modal -->
        <transition name="fade">
            <div v-if="showError" class="c-modal">
                <div class="c-container">
                    <a @click="closeErrorModal">X</a>
                    <h5>Error</h5>
                    <p>Please upload a photo</p>
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

        <!-- <a @click="openPostModal" class="createPostButton">Create Post</a> -->
        <section>
            <div v-if="posts.length" class="postsContainer">
                <div v-for="post in posts" :key="post.id" class="post" v-if="post.userId === currentUser.uid" >
                    <div>
                        <img :src="post.photo" style="width: 100%" >
                    </div>
                        
                    
                    <!-- <p>{{ post.content }}</p> -->
                    <div class="post-info">
                        <span>{{ post.createdOn | formatDate }}</span>
                        
                        <ul>
                            <li>comments: {{ post.comments }}</li>
                            <li>like: {{ post.likes }}</li>
                        </ul>
                    </div>
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
                    content: '',
                    photoURL: '',
                    file: ''
                },
                comment: {
                    postId: '',
                    userId: '',
                    content: '',
                    postComments: 0
                },
                myCroppa: {},
                showCommentModal: false,
                // showPostModal: false,
                selectedFile: null,
                showError: false,
                fileGenerated: false
               }
        },
        computed: {
            ...mapState(['userProfile', 'currentUser', 'posts', 'showPostModal'])
        },
        methods: {
            
            closePostModal() {
                this.$store.dispatch('closePostModal')
            },
            closeErrorModal() {
                this.showError = false
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
                fb.uploads.child(this.selectedFile).getDownloadURL()
                    .then((url) => {
                        return this.post.photoURL = url
                    }).then(() => {
                        fb.postsCollection.add({
                            createdOn: new Date(),
                            content: this.post.content,
                            userId: this.currentUser.uid,
                            userName: this.userProfile.name,
                            photo: this.post.photoURL,
                            comments: 0,
                            likes: 0
                        }).then(ref => {
                            this.post.content = ''
                            this.fileGenerated = false
                        }).then(() => {
                            this.closePostModal()
                        }).catch(err => {
                            console.log(err)
                        })
                    })
            },
            onRemove() {
                this.selectedFile = null
                this.fileGenerated = false
            },
            onFileSelected() {
                this.selectedFile = this.myCroppa.chosenFile.name
            },
            uploadCroppedImage() {
                this.myCroppa.generateBlob(blob => {
                    fb.uploads.child(this.selectedFile).put(blob)
                    this.fileGenerated = true
            })}
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
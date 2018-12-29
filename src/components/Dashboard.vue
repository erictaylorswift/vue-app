<template>
    <div id='dashboard'>

        <modal name="create-post" height="auto">
            <div class="create-post">
                <h5 v-if="!fileGenerated">Post your art</h5>
                <form @submit.prevent>
                    <label v-if="fileGenerated" class="post-title-label">Title</label>
                    <textarea v-if="fileGenerated" v-model.trim="post.title" placeholder="name your art" class="post-title"></textarea>
                    <croppa 
                        v-model="myCroppa"
                        :width="450"
                        :height="400"
                        :placeholder="'Upload your art'"
                        :remove-button-color="'gray'"
                        :remove-button-size="28"
                        :accept="'image/*'"
                        :disable-drag-and-drop="false"
                        @image-remove="onRemove"
                        @new-image="onFileSelected"></croppa>
                    <label v-if="fileGenerated">Describe your art</label>
                    <textarea v-if="fileGenerated" v-model.trim="post.content" ></textarea>
                    <button v-if="fileGenerated" @click="createPost" :disabled="post.content === ''" class="modal-button">post</button>
                    <button v-else @click="uploadCroppedImage" class="modal-button">Crop Image</button>
                </form>
            </div>
        </modal>

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


        <modal name="post-details" height="auto" :scrollable="true" @closed="closed" :maxWidth="800">
            <h3 class="modal-title">
                {{ this.selectedPost.content }}
            </h3>
            <p class="modal-subtitle">by <span>{{ this.selectedPost.name }}</span> created on {{ this.selectedPost.createdOn | dateFilter }}</p>
            <img :src="this.selectedPost.photo" alt="" class="modal-img">
            <div>
                <h3 class="modal-critiques">Critiques: {{ selectedPost.comments }}</h3>
                <a class="modal-comment-link" href="#commentBox">Add critique</a>
            </div>
             <div v-for="comment in comments" :key="comment.postId">
                <p class="modal-comments-user">{{ comment.userName }}</p>
                <p class="modal-comments">{{ comment.content }}</p>
                <hr class="modal-comments-line">
            </div>
            <form @submit.prevent>
                <textarea v-model.trim="comment.content" id="commentBox"></textarea>
                <button @click="addComment" :disabled="comment.content == ''" class="button">Add comment</button>
            </form>
        </modal>

        <!-- <a @click="openPostModal" class="createPostButton">Create Post</a> -->
        <posts></posts>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import moment from 'moment';
    const fb = require('../firebaseConfig');
    import PostDetails from './PostDetails'
    import Posts from './Posts'

    export default {
        components: { PostDetails, Posts },
        data() {
            return {
                post: {
                    content: '',
                    photoURL: '',
                    title: ''
                },
                selectedPost: {
                    photo: '',
                    content: '',
                    name: '',
                    avatar: '',
                    comments: '',
                    createdOn: '',
                    likes: '',
                    id: '',
                    comments: 0
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
                fileGenerated: false,
                showPostDetails: false,
                comments: [],
               }
        },
        computed: {
            ...mapState(['userProfile', 'currentUser', 'posts', 'showPostModal'])
        },
        methods: {
            closed() {
                this.comments = [];
            },
            closePostModal() {
                this.$store.dispatch('closePostModal')
            },
            closePostDetails() {
                this.showPostDetails = false;
                this.comments = []
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
                let postId = this.selectedPost.id
                let postComments = this.selectedPost.comments

                fb.commentsCollection.add({
                    createdOn: new Date(),
                    content: this.comment.content,
                    postId: this.selectedPost.id,
                    userId: this.currentUser.uid,
                    userName: this.userProfile.name
                }).then(doc => {
                    fb.postsCollection.doc(postId).update({
                        comments: postComments + 1
                    }).then(() => {
                        this.comment.content = ''
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
                            title: this.post.title,
                            userId: this.currentUser.uid,
                            userName: this.userProfile.name,
                            avatar: this.userProfile.avatar,
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
            },
            dateFilter(val) {
                if (!val) { return "'??'"}
                let date = val.toDate()
                return moment(date).format("MMM Do, YYYY")
            }
        }    
    }
</script>
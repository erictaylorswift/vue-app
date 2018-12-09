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
                    <a @click="closeCommentModal()">X</a>
                    <p>add a comment</p>
                    <form @submit.prevent>
                        <textarea v-model.trim="comment.content"></textarea>
                        <button @click="addComment" :disabled="comment.content == ''" class="button">add comment</button>
                    </form>
                </div>
            </div>
        </transition>

        <transition>
            <div v-if="showPostDetails" class="d-modal">
                <div class="d-container">
                    <a @click="closePostDetails"> <i class="fas fa-times-circle"></i></a>
                    <div class="detailsWrapper">
                        <img :src="this.selectedPost.avatar" alt="" class="avatar">
                        <div class="detailsInfo">
                            <h3>{{ this.selectedPost.content }}</h3>
                            <p>by <span class="username">{{ this.selectedPost.name }}</span> created on {{ this.selectedPost.createdOn | dateFilter }}</p>
                        </div>
                    </div>
                    <img :src="this.selectedPost.photo" alt="">
                    <div v-for="comment in comments" :key="comment.postId">
                        <p>{{ comment.content }}</p>
                    </div>
                    <form @submit.prevent>
                        <textarea v-model.trim="comment.content" id="commentBox"></textarea>
                        <button @click="addComment" :disabled="comment.content == ''" class="button">Add comment</button>
                    </form>
                </div>
            </div>
        </transition>

        <!-- <a @click="openPostModal" class="createPostButton">Create Post</a> -->
        <section>
            <div v-if="posts.length" class="postsContainer">
                <div v-for="post in posts" :key="post.id" class="post" > 
                    <!-- v-if="post.userId === currentUser.uid" -->
                    <div class="postCard">
                        <div>
                            <a @click="openPostDetails(post.id)">
                                <img :src="post.photo" style="width: 100%" >
                            </a>
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
                    <div class="userData">
                        <img class="avatarThumbnail" :src="post.avatar" alt="">
                        <p>{{ post.userName }}</p>
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
                    photoURL: ''
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
            openPostDetails(key) {
                this.showPostDetails = true;
                
                fb.postsCollection.doc(key).get()
                    .then((doc) =>{
                        let postData = doc.data()
                        this.selectedPost.content = postData.content
                        this.selectedPost.photo = postData.photo
                        this.selectedPost.name = postData.userName
                        this.selectedPost.avatar = postData.avatar
                        this.selectedPost.createdOn = postData.createdOn
                        this.selectedPost.id = key,
                        this.selectedPost.comments = postData.comments

                    }).catch((err) => {
                        console.log(err)
                    })

                    fb.commentsCollection.where('postId', '==', key).get()
                        .then(snapshot => {
                            let commentsArray = this.comments;

                            if (snapshot.empty) {
                                console.log('no match docs');
                                return;
                            }

                            snapshot.forEach(doc => {
                                // let results = doc.data();

                                commentsArray.push(doc.data());

                            })
                        })
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
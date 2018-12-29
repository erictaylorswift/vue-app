<template>
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
</template>

<script>
import { mapState } from 'vuex'
import moment from 'moment'

const fb = require('../firebaseConfig');

export default {
    data() {
        return {
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
            comments: [],
        }
    },
    computed: {
        ...mapState(['posts'])
    },
    methods: {
        openPostDetails(key) {
                
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
                }).then(() => {
                    this.$modal.show('post-details')
                })
        },
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

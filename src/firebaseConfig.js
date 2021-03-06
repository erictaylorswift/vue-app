import firebase from 'firebase'
import 'firebase/firestore'

// firebase init goes here
const config = {
    apiKey: "AIzaSyA-Jy67gMh0SDBkLImQmXXZfljwSbHbc9I",
    authDomain: "my-vue-app-1b7cc.firebaseapp.com",
    databaseURL: "https://my-vue-app-1b7cc.firebaseio.com",
    projectId: "my-vue-app-1b7cc",
    storageBucket: "my-vue-app-1b7cc.appspot.com",
    messagingSenderId: "106793031901"
}
firebase.initializeApp(config)

// firebase utils
const db = firebase.firestore()
const auth = firebase.auth()
const currentUser = auth.currentUser
const storage = firebase.storage()
const storageRef = storage.ref()

// date issue fix according to firebase
const settings = {
    timestampsInSnapshots: true
}
db.settings(settings)

// firebase storage

const uploads = storageRef

// firebase collections
const usersCollection = db.collection('users')
const postsCollection = db.collection('posts')
const commentsCollection = db.collection('comments')
const likesCollection = db.collection('likes')

export {
    db,
    auth,
    currentUser,
    usersCollection,
    postsCollection,
    commentsCollection,
    likesCollection,
    uploads
}
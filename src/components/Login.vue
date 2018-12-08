<template>
    <div id="login">
        <transition name="fade">
            <div v-if="performingRequest" class="loading">
                <p>Loading...</p>
            </div>
        </transition>
        
        <transition name="fade">
            <div v-if="showAvatarModal" class="c-modal">
                <div class="c-container">
                    <a @click="closeAvatarModal">X</a>
                    <h5>Upload your profile picture</h5>
                    <p v-if="this.avatarSelected === null" class="avatarPlaceholder">Drag and drop your profile picture</p>
                    <croppa 
                        v-model="myCroppa"
                        :placeholder="''"
                        :accept="'image/*'"
                        :disable-drag-and-drop="false"
                        @image-remove="handleImageRemove"
                        @new-image="onAvatarSelected"></croppa>
                    <div class="button-container">
                        <button 
                            @click="uploadCroppedImage" 
                            :disabled="this.avatarSelected === null"
                            class="button">
                            Crop Image
                        </button>
                    </div>
                </div>
            </div>

        </transition>

        <section>
            <div class="col1">
                <h1>Vuegram</h1>
            </div>
            <div class="col2" >
                    <form v-if="showLoginForm" @submit.prevent >
                        <h1>Welcome Back</h1>

                        <label for="email1">Email</label>
                        <input v-model.trim="loginForm.email" type="text" placeholder="you@email.com" id="email1" >

                        <label for="password1">Password</label>
                        <input v-model.trim="loginForm.password" type="password" placeholder="******" id="password1" >

                        <button @click="login" class="button">Log In</button>

                        <div class="extras">
                            <a @click="toggleForm">Create an Account</a>
                            <a @click="toggleForgotPasswordReset">Forgot Password</a>
                        </div>

                    </form>
                    <form v-if="!showLoginForm && !showForgotPassword" @submit.prevent>
                        <h1>Get Started</h1>
                            <div class="avatarDefault">
                                <a @click="uploadAvatar">
                                    <img v-if="!avatarGenerated" src="https://firebasestorage.googleapis.com/v0/b/my-vue-app-1b7cc.appspot.com/o/default_avatar.png?alt=media&token=50db3258-a5ff-4514-8fd5-65cf27df6fb8" alt="default_avatar">
                                    <img v-else :src="this.avatarURL" alt="">
                                </a>
                            </div>

                        <label for='name'>Name</label>
                        <input v-model.trim="signupForm.name" type="text" placeholder="Name" id="name">

                        <label for="email2">Email</label>
                        <input v-model.trim="signupForm.email" type="text" placeholder="you@email.com" id="email2">

                        <label for="password2">Password</label>
                        <input v-model.trim="signupForm.password" type="password" placeholder="min 6 characters" id="password2">

                        <button @click="signup" class="button">Sign Up</button>

                        <div class="extras">
                            <a @click="toggleForm">Back to Log In</a> 
                        </div>

                    </form>
                <form v-if="showForgotPassword" @submit.prevent class="password-reset">
                    <div v-if="!passwordResetSuccess">
                        <h1>Reset Password</h1>
                        <p>We will send you an email to reset your password</p>

                        <label for="email3">Email</label>
                        <input v-model.trim="passwordForm.email" type="text" placeholder="you@email.com" id="email3">

                        <button @click="resetPassword" class="button">Submit</button>

                        <div class="extras">
                            <a @click="toggleForgotPasswordReset">Back To Log In</a>
                        </div>
                    </div>
                    <div v-else>
                        <h1>Email Sent</h1>
                        <p>check your email for a link to reset your password</p>
                        <button @click="toggleForgotPasswordReset" class="button">Back to login</button>
                    </div>
                </form>
                <transition name="fade">
                    <div v-if="errorMsg !== ''" class="error-msg">
                        <p>{{ errorMsg }}</p>
                    </div>
                </transition>
            </div>
        </section>
    </div>
</template>

<script>
    const fb = require('../firebaseConfig');

    export default {
        data() {
            return {
                loginForm: {
                    email: '',
                    password: ''
                },
                signupForm: {
                    name: '',
                    email: '',
                },
                avatarURL: '',
                passwordForm: {
                    email: ''
                },
                myCroppa: {},
                showLoginForm: true,
                showForgotPassword: false,
                passwordResetSuccess: false,
                performingRequest: false,
                errorMsg: '',
                avatarSelected: null,
                avatarGenerated: false,
                showAvatarModal: false
            }
        },
        methods: {
            toggleForm() {
                this.errorMsg = ''
                this.showLoginForm = !this.showLoginForm
            },
            closeAvatarModal() {
                this.showAvatarModal = false;
            },
            toggleForgotPasswordReset() {
                this.errorMsg = ''
                this.showLoginForm = !this.showLoginForm
                this.showForgotPassword = !this.showForgotPassword
            },
            login() {
                this.performingRequest = true;

                fb.auth.signInWithEmailAndPassword(this.loginForm.email, this.loginForm.password)
                    .then(user => {
                        this.$store.commit('setCurrentUser', user.user)
                        this.$store.dispatch('fetchUserProfile')
                        this.performingRequest = false
                        this.$router.push('/dashboard')
                    }).catch(err => {
                        console.log(err)
                        this.performingRequest = false
                        this.errorMsg = err.message
                    })
            },
            signup() {
                this.performingRequest = true

                fb.auth.createUserWithEmailAndPassword(this.signupForm.email, this.signupForm.password)
                    .then(user => {
                        this.$store.commit('setCurrentUser', user)

                        fb.usersCollection.doc(this.$store.state.currentUser.user.uid).set({
                            name: this.signupForm.name,
                            email: this.signupForm.email,
                            avatar: this.avatarURL || 'https://firebasestorage.googleapis.com/v0/b/my-vue-app-1b7cc.appspot.com/o/default_avatar.png?alt=media&token=50db3258-a5ff-4514-8fd5-65cf27df6fb8'
                        }).then(() => {
                            this.$store.dispatch('fetchUserProfile')
                            this.performingRequest = false
                            this.$router.push('/dashboard')
                        }).catch(err => {
                            console.log(err)
                            this.performingRequest = false
                            this.errorMsg = err.message
                        })
                    }).catch(err => {
                        console.log(err)
                    })
            },
            resetPassword() {
                this.performingRequest = true

                fb.auth.sendPasswordResetEmail(this.passwordForm.email).then(() => {
                    this.performingRequest = false
                    this.passwordResetSuccess = true
                    this.passwordForm.email = ''
                }).catch(err => {
                    console.log(err)
                    this.performingRequest = false
                    this.errorMsg = err.message
                })
            },
            onAvatarSelected() {
                this.avatarSelected = this.myCroppa.chosenFile.name
            },
            uploadAvatar() {
                this.showAvatarModal = true
            },
            uploadCroppedImage() {
                this.myCroppa.generateBlob(blob => {
                    fb.uploads.child(this.avatarSelected).put(blob)
                    this.avatarGenerated = true

                fb.uploads.child(this.avatarSelected).getDownloadURL()
                    .then((url) => {
                        return this.avatarURL = url;
                    })
                this.showAvatarModal = false
                })
            },
            handleImageRemove() {
                this.avatarSelected = null;
            }
        }

    }
</script>
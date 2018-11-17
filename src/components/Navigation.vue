<template>
    <header>
        <section>
            <div class="col1">
                <router-link to="dashboard">
                    <h3>Vuegram</h3>
                </router-link>
                <div class="navRow">
                    <ul class="inline">
                        <li><router-link to="dashboard">Dashboard</router-link></li>
                        <li><router-link to="settings">Settings</router-link></li>
                        <li><router-link :to="user/this.userProfile.name">{{this.userProfile.name}}</router-link></li>
                    </ul>
                    <ul class="inlineRight">
                        <li v-if="['Dashboard'].indexOf($route.name) > -1">
                                <a @click="openPostModal" v-tooltip.bottom="{ content: 'Upload your art', offset: 12 }">
                                    <i class="fas fa-cloud-upload-alt"></i>
                                </a>
                        </li>     
                        <li>
                            <a @click="logout">
                                <i class="fas fa-sign-out-alt"></i>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    </header>
</template>

<script>
    import { mapState } from 'vuex';
    const fb = require('../firebaseConfig');

    export default {
        data() {
            return {
                active: false,
                name: ""
            }
        },
        created() {
            this.name = this.userProfile.name
        },
        computed: {
            ...mapState(['userProfile'])
        },
        methods: {
            logout() {
                fb.auth.signOut().then(() => {
                    this.$store.dispatch('clearData')
                    this.$router.push('/login')
                }).catch(err => {
                    console.log(err)
                })
            },
            openPostModal() {
                this.$store.dispatch('postModal')
            },
            showTooltip() {
                this.active = !this.active
            },
            hideTooltip() {
                this.active = false
            }
        }    
    }
</script>
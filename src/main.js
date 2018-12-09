import Vue from 'vue'
import App from './App'
import router from './router'
import { store } from './store.js'
import './assets/scss/app.scss'
import VModal from 'vue-js-modal'
import Croppa from 'vue-croppa'
import 'vue-croppa/dist/vue-croppa.css'
import VTooltip from 'v-tooltip'

const fb = require('./firebaseConfig')

Vue.config.productionTip = false

Vue.use(VModal)
Vue.use(Croppa)
Vue.use(VTooltip)

let app

fb.auth.onAuthStateChanged(user => {
    if (!app) {
        app = new Vue({
            el: '#app',
            router,
            store,
            render: h => h(App)
        })
    }
})
import Vue from 'vue'
import App from './App'
import router from './router'
import { store } from './store.js'
import './assets/scss/app.scss'
import VModal from 'vue-js-modal'
import VueSidebarMenu from 'vue-sidebar-menu'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faCoffee } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faCoffee)

const fb = require('./firebaseConfig')

Vue.config.productionTip = false

Vue.use(VModal)
Vue.use(VueSidebarMenu)

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
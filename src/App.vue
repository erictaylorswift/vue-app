<template>
    <div id="app">
        <Menu v-if="currentUser"></Menu>
        <router-view/>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import Menu from './components/Menu';
    
    export default {
        components: { Menu },
        computed: {
            ...mapState(['currentUser'])
        }
    }
</script>
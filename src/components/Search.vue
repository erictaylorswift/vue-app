<template>
    <div>
        <input type="text" v-model.trim="user.name">
        <button @click="searchUser" >Search</button>
    </div>
</template>

<script>
export default {
    data() {
        return {
            user: {
                name: ''
            }
        }
    },
    methods: {
        searchUser() {
            
        }
    }
}
</script>

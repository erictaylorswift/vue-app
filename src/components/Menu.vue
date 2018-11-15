<template>
    <sidebar-menu :menu="menu" :collapsed="collapsed" @collapse="onCollapse"/>
</template>

<script>
export default {
    data() {
        return {
            menu: [
                {
                    href: '/dashboard',
                    title: 'My Art',
                    icon: 'fa fa-user'
                },
                {
                    href: '/settings',
                    title: 'Settings',
                    icon: 'fas fa-cogs'
                }
            ],
            collapsed: false
        }
    },
    methods: {
        onCollapse(val) {
            console.log(`collapse ${val}`)
            this.collapsed = val
        }
    }
}
</script>

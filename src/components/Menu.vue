<template>
    <sidebar-menu :menu="menu"/>
</template>

<script>
export default {
    data() {
        return {
            menu: [
            {
                href: '/dashboard',
                title: 'My Art',
                icon: 'fa fa-paint-brush'
            },
            {
                href: 'logout',
                title: 'Logout',
                icon: 'fa fa-sign-out-alt'
            }
        ]
        }
    }
}
</script>

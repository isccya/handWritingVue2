<template>
  <div class="home">
    Home
    <router-link to="/a">切 a</router-link>
    <router-link to="/b">切 b</router-link>
    <router-view></router-view>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'Home',
  components: {
    HelloWorld
  },
  mounted(){
    console.log(this.$router)
  }
}
</script>

<template>
  <div class="clash" :class="{ allowed: allowed }"></div>
</template>

<script>
  export default {
    props: {
      allowed: {
        type: Boolean,
        default: false
      }
    }
  }
</script>

<style scoped>
.clash::before, .clash::after {
  content: '';
  width: 5px;
  position: absolute;
  top: 0px;
  bottom: 0px;
  background-color: #000;
  border-color: #D32F2F;
  border-style: solid;
  border-width: 0px;
  transition: border-color 0.3s;
}
.allowed .clash::before, .allowed .clash::after {
  border-color: #FFA000;
}
.clash::before {
  left: 0px;
  border-left-width: 2px;
}
.clash::after {
  right: 0px;
  border-right-width: 2px;
}
</style>

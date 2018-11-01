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
  background-color: #D32F2F;
  border-color: #000;
  border-style: solid;
  border-width: 0px;
  transition: background-color 0.3s;
}
.allowed.clash::before, .allowed.clash::after {
  background-color: #FFA000;
}
.clash::before {
  left: 0px;
  border-right-width: 2px;
}
.clash::after {
  right: 0px;
  border-left-width: 2px;
}
</style>

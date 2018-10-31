<template>
  <v-snackbar v-model="showMessage" :timeout="timeout" class="close">
    {{ resultMessage }}
    <v-spacer />
    <v-btn dark flat icon @click="showMessage = false">
      <v-icon>
        close
      </v-icon>
    </v-btn>
  </v-snackbar>
</template>

<script>
  export default {
    data () {
      return {
        showMessage: false
      }
    },
    computed: {
      resultMessage () {
        return (this.$store.state.alert || {}).message
      },
      timeout () {
        return (this.$store.state.alert || {}).timeout || 5000
      }
    },
    watch: {
      resultMessage () {
        if (this.resultMessage) {
          this.showMessage = true
        }
      }
    }
  }
</script>

<style>
  .v-snack.close .v-snack__content {
    padding-right: 8px;
  }
</style>

<template>
  <v-snackbar
    v-model="showMessage"
    :timeout="0"
    auto-height
    class="close"
  >
    This app has been updated since you last visited
    <v-spacer />

    <v-btn
      dark
      flat
      color="info"
      @click="refreshPage()"
    >
      Refresh
    </v-btn>
    <v-btn
      dark
      flat
      icon
      @click="showMessage = false"
    >
      <v-icon>
        close
      </v-icon>
    </v-btn>
  </v-snackbar>
</template>

<script>
  export default {
    computed: {
      showMessage: {
        get () {
          return this.$store.state.updateAvailable
        },
        set (newValue) {
          this.$store.commit('updateAvailable', newValue)
        }
      }
    },
    methods: {
      refreshPage () {
        this.$store.state.serviceWorker.unregister().then((success) => {
          window.location.reload()
        })
        this.showMessage = false
      }
    }
  }
</script>

<style>
  .v-snack.close .v-snack__content {
    padding-right: 8px;
  }
</style>

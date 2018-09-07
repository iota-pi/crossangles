<template>
  <v-layout row wrap class="pt-3">
    <v-flex xs12 sm4 v-for="option in allOptions" :key="option.title">
      <v-checkbox
        v-model="options"
        :value="option"
        :label="option.title"
        color="secondary"
        class="mt-2"
        hide-details
      >
      </v-checkbox>
    </v-flex>
  </v-layout>
</template>

<script>
  export default {
    data () {
      return {
        options: [],
        allOptions: [
          {
            title: 'Show class locations'
          },
          {
            title: 'Show class enrolments'
          },
          {
            title: 'Include full classes'
          }
        ]
      }
    },
    watch: {
      options () {
        this.$store.commit('options', this.options)
      }
    }
  }
</script>

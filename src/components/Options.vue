<template>
  <v-layout row wrap class="pt-3">
    <v-flex
      v-for="option in allOptions"
      :key="option.title"
      xs12 sm6
    >
      <v-checkbox
        v-model="options"
        :value="option.value"
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
            title: 'Show class locations',
            value: { 'locations': true }
          },
          {
            title: 'Show class enrolments',
            value: { 'enrolments': true }
          },
          {
            title: 'Include full classes',
            value: { 'allowFull': true }
          },
          {
            title: 'Manually update timetable',
            value: { 'manual': true }
          }
        ]
      }
    },
    watch: {
      options () {
        let asObject = Object.assign({}, ...this.options)
        this.$store.commit('options', asObject)
      }
    }
  }
</script>

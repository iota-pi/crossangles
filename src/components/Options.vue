<template>
  <v-layout row wrap class="pt-3 px-2">
    <v-flex
      v-for="option in allOptions"
      :key="option.title"
      xs12 sm6
    >
      <v-switch
        v-model="options"
        :value="option.value"
        :label="option.title"
        color="secondary"
        class="mt-2"
        hide-details
      >
      </v-switch>
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
            value: 'locations'
          },
          {
            title: 'Show class enrolments',
            value: 'enrolments'
          },
          {
            title: 'Include full classes',
            value: 'allowFull'
          },
          {
            title: 'Manually update timetable',
            value: 'manual'
          }
        ]
      }
    },
    watch: {
      options () {
        let asObject = this.options.reduce((a, o) => {
          return Object.assign(a, { [o]: true })
        }, {})
        this.$store.commit('options', asObject)
      }
    }
  }
</script>

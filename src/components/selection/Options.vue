<template>
  <v-layout
    row
    wrap
    class="px-2"
  >
    <v-flex
      v-for="option in allOptions"
      :key="option.title"
      xs12
      sm6
      md3
      @click.stop="chosenOption(option.value)"
    >
      <v-switch
        v-model="options"
        :value="option.value"
        :label="option.title"
        color="secondary"
        class="mt-2"
        hide-details
      />
    </v-flex>
  </v-layout>
</template>

<script>
  export default {
    data () {
      return {
        allOptions: [
          {
            title: 'Show locations',
            value: 'locations'
          },
          {
            title: 'Show enrolments',
            value: 'enrolments'
          },
          {
            title: 'Show weeks',
            value: 'weeks'
          },
          {
            title: 'Include full classes',
            value: 'allowFull'
          }
        ]
      }
    },
    computed: {
      options: {
        get () {
          return Object.keys(this.$store.state.options)
        },
        set (newValue) {
          let asObject = newValue.reduce((a, o) => {
            return Object.assign(a, { [o]: true })
          }, {})
          this.$store.commit('options', asObject)
        }
      }
    },
    methods: {
      chosenOption (option) {
        window.dataLayer.push({
          event: 'option_selection',
          action: 'Option ' + (this.options.includes(option) ? 'Added' : 'Removed'),
          label: option
        })
      }
    }
  }
</script>

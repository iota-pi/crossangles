<template>
  <v-layout
    row
    wrap
    class="pb-1"
  >
    <v-flex
      v-for="event in allEvents"
      :key="event.title"
      xs12
      sm6
      md3
    >
      <v-checkbox
        v-model="events"
        :value="event"
        :label="event"
        color="secondary"
        class="pt-0 mt-2 mb-1"
        hide-details
      />
    </v-flex>
  </v-layout>
</template>

<script>
  export default {
    computed: {
      events: {
        get () {
          return this.$store.state.events
        },
        set (newValue) {
          this.$store.commit('events', newValue)
        }
      },
      allEvents () {
        let data = this.$store.getters.courses.CBS
        if (!data) {
          return []
        } else {
          let streams = data.streams
          let components = streams.map(s => s.component)
          let unique = components.filter((c, i) => components.indexOf(c) === i)
          return unique
        }
      }
    }
  }
</script>

<template>
  <v-layout row wrap>
    <v-flex
      v-for="event in allEvents"
      :key="event.title"
      xs12 sm6
    >
      <v-checkbox
        v-model="events"
        :value="event"
        :label="event"
        color="secondary"
        class="mt-3"
        hide-details
      >
      </v-checkbox>
    </v-flex>
  </v-layout>
</template>

<script>
  const initialEvents = () => [
    'The Bible Talks',
    'Bible Studies',
    'Core Theology',
    'Core Training'
  ]

  export default {
    data () {
      return {
        events: initialEvents()
      }
    },
    computed: {
      allEvents () {
        let data = this.$store.state.courseData.CBS
        if (!data) {
          return initialEvents()
        } else {
          let streams = data.streams
          let components = streams.map(s => s.component)
          let unique = components.filter((c, i) => components.indexOf(c) === i)
          return unique
        }
      }
    },
    watch: {
      events () {
        this.$store.commit('events', this.events)
      }
    }
  }
</script>

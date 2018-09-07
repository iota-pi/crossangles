<template>
  <v-layout row wrap>
    <v-flex xs12 sm3 v-for="event in allEvents" :key="event.title">
      <v-checkbox
        v-model="events"
        :value="event"
        :label="event.title"
        color="secondary"
        class="mt-2"
        hide-details
      >
      </v-checkbox>
    </v-flex>
  </v-layout>
</template>

<script>
  import axios from 'axios'

  export default {
    data () {
      return {
        events: [],
        allEvents: []
      }
    },
    watch: {
      events () {
        this.$store.commit('events', this.events)
      }
    },
    mounted () {
      axios.get('/static/cbs.json').then((r) => {
        this.allEvents = r.data
      })
    }
  }
</script>

<template>
  <v-dialog v-model="show" :max-width="700">
    <v-card>
      <v-card-title class="pb-2">
        <span class="headline">Custom Event</span>
      </v-card-title>

      <v-card-text class="pt-0">
        <v-text-field v-model="name" label="Name of event" :counter="40" required autofocus />

        <v-select
          v-model="duration"
          :items="durations"
          item-text="text"
          item-value="duration"
          label="Duration"
          prepend-icon="timelapse"
        />

        <p class="pt-2">
          You may enter any number of possible times for this commitment
          (it will only be included once on your timetable).
        </p>

        <div v-for="option, i in options" :key="option.id">
          <v-layout row wrap align-center>
            <div class="pr-2">
              <span class="body-2">Option {{ i + 1 }}</span>
            </div>
            <v-spacer />
            <v-flex xs12 sm5>
              <v-select
                v-model="option.day"
                :items="days"
                item-text="text"
                item-value="letter"
                @input="updateOptions(i)"
                clearable
                label="Day"
                prepend-icon="calendar_today"
              />
            </v-flex>
            <div class="px-2"></div>
            <v-flex xs12 sm5>
              <v-select
                v-model="option.time"
                :items="validTimes"
                item-text="text"
                item-value="time"
                @input="updateOptions(i)"
                clearable
                label="Start time"
                prepend-icon="access_time"
              />
            </v-flex>
          </v-layout>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-btn block color="primary" @click="addEvent" :disabled="disabled">
          Add Event
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  const validTimes = [
    { text: '08:00 AM', time: 8.0 },
    { text: '08:30 AM', time: 8.5 },
    { text: '09:00 AM', time: 9.0 },
    { text: '09:30 AM', time: 9.5 },
    { text: '10:00 AM', time: 10.0 },
    { text: '10:30 AM', time: 10.5 },
    { text: '11:00 AM', time: 11.0 },
    { text: '11:30 AM', time: 11.5 },
    { text: '12:00 PM', time: 12.0 },
    { text: '12:30 PM', time: 12.5 },
    { text: '01:00 PM', time: 13.0 },
    { text: '01:30 PM', time: 13.5 },
    { text: '02:00 PM', time: 14.0 },
    { text: '02:30 PM', time: 14.5 },
    { text: '03:00 PM', time: 15.0 },
    { text: '03:30 PM', time: 15.5 },
    { text: '04:00 PM', time: 16.0 },
    { text: '04:30 PM', time: 16.5 },
    { text: '05:00 PM', time: 17.0 },
    { text: '05:30 PM', time: 17.5 },
    { text: '06:00 PM', time: 18.0 },
    { text: '06:30 PM', time: 18.5 },
    { text: '07:00 PM', time: 19.0 },
    { text: '07:30 PM', time: 19.5 },
    { text: '08:00 PM', time: 20.0 },
    { text: '08:30 PM', time: 20.5 },
    { text: '09:00 PM', time: 21.0 }
  ]
  const days = [
    { text: 'Monday', letter: 'M' },
    { text: 'Tuesday', letter: 'T' },
    { text: 'Wednesday', letter: 'W' },
    { text: 'Thursday', letter: 'H' },
    { text: 'Friday', letter: 'F' }
  ]
  const durations = [
    { text: '½ an hour', duration: 0.5 },
    { text: '1 hour', duration: 1 },
    { text: '1½ hours', duration: 1.5 },
    { text: '2 hours', duration: 2 },
    { text: '2½ hours', duration: 2.5 },
    { text: '3 hours', duration: 3 },
    { text: '3½ hours', duration: 3.5 },
    { text: '4 hours', duration: 4 },
    { text: '4½ hours', duration: 4.5 },
    { text: '5 hours', duration: 5 },
    { text: '5½ hours', duration: 5.5 },
    { text: '6 hours', duration: 6 },
    { text: '6½ hours', duration: 6.5 },
    { text: '7 hours', duration: 7 },
    { text: '7½ hours', duration: 7.5 },
    { text: '8 hours', duration: 8 },
    { text: '8½ hours', duration: 8.5 },
    { text: '9 hours', duration: 9 },
    { text: '9½ hours', duration: 9.5 },
    { text: '10 hours', duration: 10 }
  ]
  const baseOption = () => ({ day: null, time: null, id: Math.random() })

  export default {
    data () {
      return {
        name: null,
        duration: 1,
        options: [baseOption()],
        validTimes: validTimes,
        days: days,
        durations: durations
      }
    },
    computed: {
      show: {
        get () {
          return this.display
        },
        set (newValue) {
          if (!newValue) {
            this.$emit('hide')
          }
        }
      },
      disabled () {
        return !this.name || this.options.length <= 1
      }
    },
    methods: {
      updateOptions (i) {
        // Remove this option if it is now empty
        if (!this.options[i].day && !this.options[i].time) {
          this.$vuetify.$nextTick(() => {
            this.options.splice(i, 1)
          })
        }

        // Add an empty one at the end
        let last = this.options[this.options.length - 1]
        if (!last || (last.day && last.time)) {
          this.options.push(baseOption())
        }
      },
      addEvent () {
        let custom = this.$store.state.custom

        let customEvent = {
          name: this.name,
          duration: this.duration,
          options: this.options.slice(0, -1),
          color: null,
          id: Math.random()
        }

        if (this.edit) {
          let index = custom.indexOf(this.edit)
          custom.splice(index, 1, customEvent)
        } else {
          custom.push(customEvent)
        }

        // Update state
        this.$store.commit('custom', custom)
        this.$store.dispatch('addCustom', customEvent)

        // Hide dialog
        this.$emit('hide')
      }
    },
    watch: {
      show () {
        // Reset dialog when hidden
        if (!this.show) {
          this.name = null
          this.duration = 1
          this.options = [baseOption()]
        }
      },
      edit () {
        if (this.edit) {
          this.name = this.edit.name
          this.duration = this.edit.duration
          this.options = this.edit.options
        }
      }
    },
    props: {
      display: {
        type: Boolean,
        default: false
      },
      edit: {
        type: Object,
        default: null
      }
    }
  }
</script>

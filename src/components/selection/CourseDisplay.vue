<template>
  <v-list v-if="chosen.length > 0" class="py-0">
    <template v-for="course in chosen">
      <v-divider />
      <v-list-tile :key="course.code">
        <v-list-tile-content>
          <v-layout row align-center>
            <v-list-tile-title>
              {{ (course.code !== 'CBS' && !course.custom) ? course.code : course.title }}

              <span class="faded" v-if="course.code !== 'CBS' && !course.custom">
                — {{ course.title }}
              </span>
            </v-list-tile-title>

            <v-tooltip
              v-if="course.code === 'CBS'"
              right
              :max-width="450"
              class="pl-2 pb-1"
              content-class="body-1"
            >
              <v-icon small slot="activator">
                help
              </v-icon>

              Campus Bible Study is a group of people at UNSW who are
              interested in learning together about Jesus from the Bible.
              Whether you follow Jesus, or want to find out what He's all about,
              Campus Bible Study is a great place for you to learn more.
              If you've never come before, we recommend checking out the Bible talks.
            </v-tooltip>
          </v-layout>
        </v-list-tile-content>

        <div class="no-spacing pl-2">
          <v-btn
            icon
            v-if="course.custom"
            @click="$emit('editCustom', course)"
          >
            <v-icon color="grey darken-2">edit</v-icon>
          </v-btn>
        </div>

        <div class="no-spacing pl-2">
          <swatches
            v-model="course.color"
            :colors="colors"
            :row-length="4"
            popover-to="left"
            shapes="circles"
            :swatch-size="32"
            :trigger-style="{ width: '32px', height: '32px' }"
          />
        </div>

        <v-list-tile-action>
          <v-btn
            icon
            v-if="course.code !== 'CBS'"
            @click="$store.dispatch('removeCourse', course)"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </v-list-tile-action>
      </v-list-tile>

      <v-list-tile
        v-if="course.streams.filter(s => s.web).length > 0"
        class="flexible-height"
      >
        <v-checkbox
          v-model="webStreams"
          :value="course.code"
          label="Choose online-only lecture stream"
          color="secondary"
          class="pt-0 pb-2"
        />
      </v-list-tile>
    </template>

    <v-list-tile class="flexible-height">
      <cbs-events />
    </v-list-tile>

    <v-divider />
  </v-list>
</template>

<script>
  import Swatches from 'vue-swatches'
  import 'vue-swatches/dist/vue-swatches.min.css'

  import cbsEvents from './CBSEvents'
  import colors from '../mixins/colors'

  export default {
    data () {
      return {
        color: ''
      }
    },
    computed: {
      chosen () {
        return this.$store.state.chosen
      },
      custom () {
        return this.$store.state.custom
      },
      chosenColors () {
        return this.chosen.map(c => c.color)
      },
      customColors () {
        return this.custom.map(c => c.color)
      },
      webStreams: {
        get () {
          return this.$store.state.webStreams
        },
        set (newValue) {
          this.$store.commit('webStreams', newValue)
        }
      }
    },
    watch: {
      chosenColors () {
        // Re-commit chosen courses when color changes
        this.$store.commit('chosen', this.chosen)

        // Update custom event colors
        for (let course of this.chosen) {
          if (course.custom) {
            let customIndex = this.custom.map(c => c.id).indexOf(course.code)
            this.custom[customIndex].color = course.color
          }
        }
      },
      customColors () {
        // Commit changes to custom colors
        this.$store.commit('custom', this.custom)
      }
    },
    components: {
      Swatches,
      cbsEvents
    },
    mixins: [ colors ]
  }
</script>

<style scoped>
  .faded {
    opacity: 0.7;
  }
  .no-spacing {
    line-height: 0.1;
    font-size: 1px;
  }
</style>

<style>
  .flexible-height > .v-list__tile {
    height: auto;
  }
</style>

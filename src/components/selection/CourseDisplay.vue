<template>
  <v-list
    v-if="chosen.length > 0"
    class="py-0"
  >
    <template v-for="course in chosen">
      <v-divider :key="'divider-' + course.code" />
      <v-list-tile :key="course.code">
        <v-list-tile-content>
          <v-layout
            row
            align-center
          >
            <v-list-tile-title>
              <div v-if="course.code !== 'CBS' && !course.custom">
                <a
                  :href="courseLink(course.code)"
                  target="_blank"
                  class="no-decoration v-center"
                >
                  <span>{{ course.code }}</span>

                  <span class="font-weight-light ml-1">—</span>
                  <span class="font-weight-light ml-1">{{ course.title }}</span>

                  <v-icon
                    small
                    class="ml-1 faded"
                  >
                    open_in_new
                  </v-icon>
                </a>
              </div>
              <div v-else>
                {{ course.title }}
              </div>
            </v-list-tile-title>

            <v-tooltip
              v-if="course.code === 'CBS'"
              right
              :max-width="450"
              class="pl-2 pb-1"
              content-class="body-1"
            >
              <v-icon
                slot="activator"
                small
              >
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
            v-if="course.custom"
            icon
            @click="$emit('editCustom', course)"
          >
            <v-icon color="grey darken-2">
              edit
            </v-icon>
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
            @open="changeColor"
            @input="changeColor"
          />
        </div>

        <v-list-tile-action>
          <v-btn
            v-if="course.code !== 'CBS'"
            icon
            @click="removeCourse(course)"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </v-list-tile-action>
      </v-list-tile>

      <v-list-tile
        v-if="course.streams.filter(s => s.web).length > 0"
        :key="'extension-' + course.code"
        class="flexible-height mt-minus-1"
      >
        <v-list-tile-content
          class="visible-overflow"
          @click="webHook(course)"
        >
          <v-checkbox
            v-model="webStreams"
            :value="course.code"
            label="Choose online-only lecture stream"
            color="secondary"
            class="mt-0 pt-0 pb-2"
            hide-details
          />
        </v-list-tile-content>
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

  import CbsEvents from './CBSEvents'
  import colors from '../../store/colors'

  export default {
    components: {
      Swatches,
      CbsEvents
    },
    data () {
      return {
        color: '',
        colors: colors
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
    methods: {
      removeCourse (course) {
        this.$store.dispatch('removeCourse', course)

        window.dataLayer.push({
          event: 'remove_course',
          label: course.code
        })
      },
      changeColor (newColor) {
        window.dataLayer.push({
          event: 'change_color',
          color: newColor || 'Opened'
        })
      },
      webHook (course) {
        window.dataLayer.push({
          event: 'choose_web',
          action: (this.webStreams.includes(course.code) ? 'S' : 'Des') + 'elect Web Stream',
          label: course.code
        })
      },
      courseLink (courseCode) {
        return process.env.VUE_APP_HANDBOOK + courseCode.toLowerCase()
      }
    }
  }
</script>

<style scoped>
  .faded {
    opacity: 0.7;
  }
  .no-decoration {
    text-decoration: none;
    color: inherit;
  }
  .no-spacing {
    line-height: 0.1;
    font-size: 1px;
  }
  .visible-overflow {
    overflow: visible;
  }
  .mt-minus-1 {
    margin-top: -4px;
  }
  .v-center {
    display: flex;
    align-items: center;
  }
</style>

<style>
  .flexible-height > .v-list__tile {
    height: auto;
  }
</style>

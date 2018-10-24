<template>
  <v-app>
    <div
      @mousemove="mousemove"
      @touchmove="mousemove"
      @mousedown="mousedown"
      @touchstart="mousedown"
      @mouseup="mouseup"
      @touchend="mouseup"
    >
      <v-toolbar
        app
        dark
        color="primary"
      >
        <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
        <v-toolbar-title v-text="title"></v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-navigation-drawer
        v-model="drawer"
        enable-resize-watcher
        temporary
        fixed
        app
      >
        <v-list>
          <v-list-tile
            value="true"
            v-for="(item, i) in items"
            :key="i"
          >
            <v-list-tile-action>
              <v-icon v-html="item.icon"></v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title v-text="item.title"></v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-navigation-drawer>

      <v-content>
        <v-container class="narrow">
          <div class="font-weight-light subheading">
            <p>
              Welcome to <span class="font-weight-regular">{{ title }}</span>!
              To get started with planning your timetable for
              <span class="font-weight-regular">Term {{ meta.term }}, {{ meta.year }}</span>
              select the courses you've enrolled in below.
            </p>
            <p>
              To make the most out of this tool, don't miss out on personalising your timetable by
              <span class="font-weight-regular">dragging classes around</span> to suit you better,
              <span class="font-weight-regular">changing the color</span> for each of your courses,
              and <span class="font-weight-regular">saving your timetable as an image</span> when you're done.
            </p>
          </div>
          <course-selection />
          <course-display />
          <options />
          <v-slide-y-transition>
            <v-layout class="pt-3" v-if="this.$store.state.options.manual">
              <v-btn
                block
                color="secondary"
                @click="timetableToggle = !timetableToggle"
              >
                Generate New Timetable
              </v-btn>
            </v-layout>
          </v-slide-y-transition>
          <timetable
            class="mt-4"
            :pointers="pointers"
            :updateToggle="timetableToggle"
          />
          <div class="font-weight-light pt-5">
            <p>
              This tool is provided free by
              <span class="font-weight-regular">
                <a href="https://www.campusbiblestudy.org/">Campus Bible Study</a>
              </span>
              a group at UNSW for anyone who is interested in investigating
              what the Bible has to say.
              If you've never come before we recommend checking out one of the
              Bible talks.
              The talks are intended for both non-Christians and Christians.
            </p>
            <p>
              This tool comes without any gaurantee of data accuracy.
              The data is updated frequently using
              <a href="http://classutil.unsw.edu.au">classutil.unsw.edu.au</a>
            </p>
          </div>
        </v-container>
      </v-content>
      <v-footer>
        <v-container class="py-0 narrow">
          <span>Last data update:</span>
          <span>{{ meta.updateTime }}</span>
          <span class="faded">({{ meta.updateDate }})</span>
        </v-container>
      </v-footer>
    </div>
  </v-app>
</template>

<script>
  import Vue from 'vue'

  import courseSelection from './components/CourseSelection'
  import courseDisplay from './components/CourseDisplay'
  import options from './components/Options'
  import timetable from './components/Timetable'

  export default {
    data () {
      return {
        drawer: false,
        mouse: { x: 0, y: 0, held: false },
        pointers: {},
        timetableToggle: false,
        items: [
          {
            icon: 'bubble_chart',
            title: 'Save as Image'
          },
          {
            icon: 'bubble_chart',
            title: 'Reset Page'
          },
          {
            icon: 'bubble_chart',
            title: 'Save a Backup'
          }
        ],
        title: 'CrossAngles'
      }
    },
    computed: {
      meta () {
        return this.$store.state.meta
      }
    },
    methods: {
      getTargetSession (targetNode) {
        let timetable = document.getElementById('timetable')
        let sessions = timetable.querySelectorAll('.session')

        for (let session of sessions) {
          if (session.contains(targetNode)) {
            return session
          }
        }

        return null
      },
      getPointerID (pointer) {
        return (pointer.identifier !== undefined) ? pointer.identifier : 'mouse'
      },
      mousemove (e) {
        let pointers = e.changedTouches || [ e ]
        let dragged = false
        for (let pointer of pointers) {
          let id = this.getPointerID(pointer)

          // Update the position of this pointer if we are tracking it
          let tracker = this.pointers[id]
          if (tracker) {
            tracker.x = pointer.pageX
            tracker.y = pointer.pageY
            dragged = true
          }
        }

        if (dragged && e.touches) {
          e.preventDefault()
        }
      },
      mousedown (e) {
        // Block multiple touches
        if (Object.keys(this.pointers).length > 0) {
          return
        }

        let pointers = e.changedTouches || [ e ]
        for (let pointer of pointers) {
          let target = this.getTargetSession(pointer.target)
          if (target !== null) {
            let id = this.getPointerID(pointer)
            Vue.set(this.pointers, id, {
              x: pointer.pageX,
              y: pointer.pageY,
              startX: pointer.pageX,
              startY: pointer.pageY,
              target: target,
              id: id
            })
          }
        }
      },
      mouseup (e) {
        let pointers = e.changedTouches || [ e ]
        for (let pointer of pointers) {
          let id = this.getPointerID(pointer)

          // Stop tracking this pointer
          Vue.delete(this.pointers, id)
        }
      }
    },
    mounted () {
      this.$store.dispatch('loadData')
    },
    name: 'App',
    components: {
      courseSelection,
      courseDisplay,
      options,
      timetable
    }
  }
</script>

<style scoped>
  .container.narrow {
    max-width: 900px;
  }
  .faded {
    opacity: 0.8;
  }
</style>

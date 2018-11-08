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
        <v-toolbar-side-icon @click.stop="menu = !menu"></v-toolbar-side-icon>
        <v-toolbar-title v-text="title"></v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>
      <side-menu
        :display="menu"
        @hide="menu = false"
        @save="save"
        @report="report"
        @contact="contact"
      />

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
              To make the most out of this tool,
              don't miss out on personalising your timetable by
              <span class="font-weight-regular">dragging classes around</span>
              to suit you better,
              <span class="font-weight-regular">changing the color</span>
              for each of your courses,
              <span class="font-weight-regular">adding custom events</span>,
              and
              <span class="font-weight-regular">saving your timetable as an image</span>
              when you're done.
            </p>
          </div>

          <course-selection class="mb-1" @custom="customDialog = true" />
          <course-display class="mb-3" @editCustom="editCustom" />
          <options class="mb-5" />

          <timetable :pointers="pointers" />

          <v-layout class="font-weight-light pt-4" row>
            <v-flex class="text-xs-center">
              <v-btn color="primary" @click="save" class="fixed-width">
                <span v-if="!saving">Save Timetable as Image</span>
                <v-progress-circular
                  v-else
                  color="white"
                  indeterminate
                  :size="24"
                  :width="3"
                />
              </v-btn>
            </v-flex>
          </v-layout>

          <div class="font-weight-light pt-5">
            <p>
              This tool is provided by
              <span class="font-weight-regular">
                <a href="https://www.campusbiblestudy.org/">Campus Bible Study</a>
              </span>
              — a group of people at UNSW who are interested in learning together
              about Jesus from the Bible.
              Whether you follow Jesus, or want to find out what He's all about,
              <span class="font-weight-regular">Campus Bible Study</span>
              is a great place for you to learn more.
              If you've never come before, we recommend checking out the Bible talks.
            </p>
            <p class="pt-3">
              The data was last updated at {{ meta.updateTime }}
              <span class="faded">({{ meta.updateDate }})</span>
              from <a href="http://classutil.unsw.edu.au">classutil.unsw.edu.au</a>.
              This tool comes without any guarantee of data accuracy or completeness.
            </p>
          </div>
        </v-container>
      </v-content>
    </div>
    <custom
      :display="customDialog"
      :edit="customToEdit"
      @hide="customDialog = false;
      customToEdit = null"
    />
    <contact
      :display="contactDialog"
      :title="contactTitle || 'Get in Contact'"
      @hide="contactDialog = false"
    />
    <alert />
  </v-app>
</template>

<script>
  import Vue from 'vue'
  import WebFontLoader from 'webfontloader'

  import CourseSelection from './components/selection/CourseSelection'
  import CourseDisplay from './components/selection/CourseDisplay'
  import Options from './components/selection/Options'

  import image from './components/mixins/image'

  export default {
    data () {
      return {
        menu: false,
        mouse: { x: 0, y: 0, held: false },
        pointers: {},
        contactDialog: false,
        contactTitle: null,
        customDialog: false,
        customToEdit: null,
        saving: false,
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
      },
      editCustom (customCourse) {
        this.customToEdit = this.$store.state.custom.filter(c => c.id === customCourse.code)[0]
        this.customDialog = true
      },
      save () {
        this.saving = true
        this.saveTimetable(() => { this.saving = false })
        this.menu = false
      },
      report () {
        this.contactDialog = true
        this.contactTitle = 'Report a Bug'
        this.menu = false
      },
      contact () {
        this.contactDialog = true
        this.contactTitle = null
        this.menu = false
      }
    },
    mounted () {
      this.$store.dispatch('loadData')

      // Load Roboto and Material Icons
      WebFontLoader.load({
        google: {
          families: ['Roboto:300,400,500,700|Material+Icons']
        }
      })
    },
    name: 'App',
    components: {
      CourseSelection,
      CourseDisplay,
      Options,
      Timetable: () => import('./components/timetable/Timetable'),
      SideMenu: () => import('./components/SideMenu'),
      Custom: () => import('./components/selection/Custom'),
      Contact: () => import('./components/Contact'),
      Alert: () => import('./components/Alert')
    },
    mixins: [ image ]
  }
</script>

<style scoped>
  .container.narrow {
    max-width: 900px;
  }
  .faded {
    opacity: 0.8;
  }
  .v-btn.fixed-width {
    min-width: 250px;
  }
</style>

<style>
  /* Fix strange dialog snapping */
  html.overflow-y-hidden > body {
    overflow-y: scroll;
  }
</style>

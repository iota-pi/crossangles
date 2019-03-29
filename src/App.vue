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
      <v-fade-transition>
        <div
          v-if="$store.state.loading"
          class="loading-overlay"
        >
          <v-progress-circular
            color="primary"
            indeterminate
            :size="40"
            :width="4"
          />
        </div>
      </v-fade-transition>

      <toolbar
        @menu="menu = !menu"
      />
      <side-menu
        v-if="!$store.state.loading"
        :display="menu"
        @hide="menu = false"
        @about="about"
        @save="save"
        @contact="contact"
        @custom="editCustom(null)"
      />

      <v-fade-transition>
        <div
          v-if="$store.state.loading"
          class="loading-overlay"
        >
          <v-progress-circular
            color="primary"
            indeterminate
            :size="40"
            :width="4"
          />
        </div>
      </v-fade-transition>

      <v-content app>
        <v-fade-transition>
          <v-container
            v-show="!$store.state.loading"
            class="narrow"
          >
            <div class="font-weight-light subheading">
              <p>
                Welcome to CrossAngles!
                To get started with planning your timetable for
                <span class="font-weight-regular">Term {{ meta.term }}, {{ meta.year }}</span>
                select the courses you've enrolled in below.
              </p>
            </div>

            <course-selection
              class="mb-1"
              @custom="editCustom(null)"
            />
            <course-display
              class="mb-3"
              @editCustom="editCustom"
            />
            <options class="mb-5" />

            <timetable :pointers="pointers" />

            <div class="text-xs-center pt-4">
              <div>
                <save-timetable
                  :saving="saving"
                  @save="save"
                />
              </div>

              <div class="pt-2">
                <a
                  v-if="$store.state.events.length > 0 && meta.signup"
                  :href="meta.signup"
                  target="_blank"
                >
                  Sign Up for Campus Bible Study
                </a>
              </div>
            </div>

            <div class="font-weight-light pt-5">
              <p>
                This tool is provided by
                <a
                  href="https://www.campusbiblestudy.org/"
                  target="_blank"
                >Campus Bible Study</a>—a group of people at UNSW who are
                interested in learning together about Jesus from the Bible.
                Whether you follow Jesus, or want to find out what He's all about,
                Campus Bible Study is a great place for you to learn more.
                If you've never come before, we recommend checking out the Bible talks.
              </p>

              <p>
                To make the most out of this tool,
                don't miss out on personalising your timetable by:
                <span class="font-weight-regular">dragging classes around</span>
                to suit you better,
                <span class="font-weight-regular">changing the color</span>
                for each of your courses,
                <span class="font-weight-regular">adding custom events</span>,
                and
                <span class="font-weight-regular">saving your timetable as an image</span>
                when you're done.
              </p>

              <p class="pt-3">
                The data was last updated at
                <span class="font-weight-regular">
                  {{ meta.updateTime }} ({{ meta.updateDate }})
                </span>
                from
                <a
                  href="http://classutil.unsw.edu.au"
                  target="_blank"
                >classutil.unsw.edu.au</a>.
                CrossAngles comes without any guarantee of data accuracy or of optimality.
                We also collect anonymous information about how people tend to use
                this tool to help us make improvements.
                If you have any questions or suggestions, please
                <a
                  class="underlined"
                  @click="contact"
                >contact us</a>.
              </p>
            </div>
          </v-container>
        </v-fade-transition>
      </v-content>
      <custom
        v-if="!$store.state.loading"
        :display="customDialog"
        :edit="customToEdit"
        @hide="customDialog = false;
               customToEdit = null"
      />
      <contact
        v-if="!$store.state.loading"
        :display="contactDialog"
        title="Get in Contact"
        @hide="contactDialog = false"
      />
      <about
        v-if="!$store.state.loading"
        :display="aboutDialog"
        @hide="aboutDialog = false"
        @contact="contact()"
      />
      <alert v-if="!$store.state.loading" />
    </div>
  </v-app>
</template>

<script>
  import Vue from 'vue'
  import WebFontLoader from 'webfontloader'
  import image from './components/mixins/image'

  export default {
    name: 'App',
    components: {
      Toolbar: () => import(/* webpackChunkName: "toolbar" */ './components/Toolbar'),
      CourseSelection: () => import(/* webpackChunkName: "selection" */ './components/selection/CourseSelection'),
      CourseDisplay: () => import(/* webpackChunkName: "courses" */ './components/selection/CourseDisplay'),
      Options: () => import(/* webpackChunkName: "options" */ './components/selection/Options'),
      Timetable: () => import(/* webpackChunkName: "timetable" */ './components/timetable/Timetable'),
      SaveTimetable: () => import(/* webpackChunkName: "image" */ './components/SaveTimetable'),
      SideMenu: () => import(/* webpackChunkName: "menu" */ './components/SideMenu'),
      Custom: () => import(/* webpackChunkName: "custom" */ './components/selection/Custom'),
      Contact: () => import(/* webpackChunkName: "contact" */ './components/Contact'),
      Alert: () => import(/* webpackChunkName: "alert" */ './components/Alert'),
      About: () => import(/* webpackChunkName: "about" */ './components/About')
    },
    mixins: [ image ],
    data () {
      return {
        menu: false,
        pointers: {},
        contactDialog: false,
        customDialog: false,
        customToEdit: null,
        aboutDialog: false,
        saving: false
      }
    },
    computed: {
      meta () {
        return this.$store.state.meta
      }
    },
    mounted () {
      // Load course data
      this.$store.dispatch('loadData')

      // Ensure dataLayer is initialised
      window.dataLayer = window.dataLayer || []

      // Load Roboto and Material Icons
      WebFontLoader.load({
        google: {
          families: ['Roboto:300,400,500,700|Material+Icons']
        }
      })
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
        // Set custom course to edit
        if (customCourse) {
          this.customToEdit = this.$store.state.custom.filter(c => c.id === customCourse.key)[0]
        }

        // Hide the side menu
        this.menu = false

        // Show the dialog
        this.customDialog = true

        // Push this event to the dataLayer
        window.dataLayer.push({
          event: 'show_custom',
          label: customCourse ? 'Show Edit Custom' : 'Show Add Custom'
        })
      },
      save () {
        if (!this.saving) {
          this.saving = true
          this.menu = false

          this.saveAsImage((success) => {
            this.saving = false

            window.dataLayer.push({
              event: 'save_image',
              action: 'Result',
              courses: this.$store.state.chosen.map(c => c.custom ? c.title : c.code).join(','),
              events: this.$store.state.events.join(','),
              options: Object.keys(this.$store.state.options).join(','),
              value: +success
            })
          })
        }
      },
      contact () {
        // Display contact form
        this.contactDialog = true

        // Hide menu and about dialogs (if showing)
        this.menu = false
        this.aboutDialog = false

        window.dataLayer.push({
          event: 'side_menu',
          label: 'Contact'
        })
      },
      about () {
        this.aboutDialog = true
        this.menu = false

        window.dataLayer.push({
          event: 'side_menu',
          label: 'About'
        })
      }
    }
  }
</script>

<style scoped>
  .container.narrow {
    max-width: 900px;
  }
  .loading-overlay {
    background-color: rgba(0, 0, 0, 0.04);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }
  a.underlined {
    text-decoration: underline;
  }
</style>

<style>
  /* Fix strange dialog snapping */
  html.overflow-y-hidden > body {
    overflow-y: scroll;
  }
  html:not(.wf-active) .material-icons {
    opacity: 0;
    transition: opacity 0.3s;
  }
  html:not(.wf-active) {
    font-family: sans-serif !important;
  }
</style>

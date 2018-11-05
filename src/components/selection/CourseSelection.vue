<template>
  <v-autocomplete
    v-model="course"
    @input="addCourse"
    ref="courseSelect"
    label="Select your courses"
    :filter="courseFilter"
    :search-input.sync="searchText"
    :items="courses"
    item-value="code"
    return-object
    hide-selected
    hide-details
    no-data-text="No matching courses found"
    color="secondary"
  >
    <template slot="item" slot-scope="data">
      <v-list-tile-content>
        <v-list-tile-title>
          <span v-html="highlight(data.item.code)"></span>

          <span class="faded">
            — <span v-html="highlight(data.item.title)"></span>
          </span>
        </v-list-tile-title>
      </v-list-tile-content>
    </template>
  </v-autocomplete>
</template>

<script>
  import colors from '../mixins/colors'

  function escapeRegExp (string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  function choice (array) {
    return array[Math.floor(Math.random() * array.length)]
  }

  export default {
    data () {
      return {
        course: null,
        searchText: null
      }
    },
    computed: {
      chosen () {
        return this.$store.state.chosen
      },
      courses () {
        let data = Object.values(this.$store.state.courses)
        data = data.filter(c => this.courseFilter(c, '', ''))

        data.sort((a, b) => {
          let aCode = a.code.toLowerCase()
          let bCode = b.code.toLowerCase()
          let search = (this.searchText || '').toLowerCase()

          let alphaOrder = (aCode > bCode) - (aCode < bCode)

          if (search) {
            let matchesA = aCode.indexOf(search) === 0
            let matchesB = bCode.indexOf(search) === 0

            return (matchesB - matchesA) || alphaOrder
          }

          return alphaOrder
        })

        return data
      }
    },
    methods: {
      addCourse () {
        // Check course has been set (this function is called when field is cleared too)
        if (this.course) {
          // Assign this course an unused color
          let used = this.$store.state.chosen.map(course => course.color)
          this.course.color = choice(this.colors.filter(c => !used.includes(c)))

          // Add this course and then sort the list of chosen courses
          let courses = this.chosen.slice(0, -1)
          courses.push(this.course)
          courses.sort((a, b) => (a.code > b.code) - (a.code < b.code))
          courses.push(this.chosen[this.chosen.length - 1])

          this.$store.commit('chosen', courses)

          // Clear current input
          this.$refs.courseSelect.reset()
          this.$refs.courseSelect.blur()
        }
      },
      courseFilter (course, queryText, itemText) {
        // Don't show courses we've already chosen
        if (this.chosen.includes(course)) {
          return false
        }

        // Check for a match in the course code
        if (course.code.toLowerCase().indexOf(queryText.toLowerCase()) !== -1) {
          return true
        }

        // Check for a match in the course name
        if (course.title.toLowerCase().indexOf(queryText.toLowerCase()) !== -1) {
          return true
        }

        return false
      },
      highlight (haystack, needle) {
        haystack = haystack.replace(/[<>]/gi, '')
        needle = needle || this.searchText

        if (needle) {
          let re = new RegExp(escapeRegExp(needle), 'gi')
          return haystack.replace(re, '<em class="highlight">$&</em>')
        }

        return haystack
      }
    },
    mixins: [ colors ]
  }
</script>

<style scoped>
  .faded {
    opacity: 0.7;
  }
</style>

<style>
  em.highlight {
    font-weight: 500 !important;
    text-decoration: none;
    font-style: normal;
  }
  em.highlight.faded {
    opacity: 0.9;
  }
</style>

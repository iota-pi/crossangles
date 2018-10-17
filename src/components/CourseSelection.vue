<template>
  <v-autocomplete
    v-model="chosen"
    label="Enter your courses"
    multiple
    :filter="filter"
    :search-input.sync="searchText"
    :items="courseData"
    item-value="code"
    return-object
    hide-selected
    no-data-text="No matching courses found"
    color="secondary"
  >
    <template slot="selection" slot-scope="data">
    </template>
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
  import colors from './mixins/colors'

  function escapeRegExp (string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  function choice (array) {
    return array[Math.floor(Math.random() * array.length)]
  }

  export default {
    data () {
      return {
        chosen: [],
        searchText: null
      }
    },
    computed: {
      courses () {
        return this.$store.state.courses
      },
      courseData () {
        let data = Object.values(this.$store.state.courseData)

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
      filter (course, queryText, itemText) {
        // Don't show Campus Bible Study as a course
        if (course.code === 'CBS') {
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
        needle = needle || this.searchText

        if (needle) {
          haystack = haystack.replace(/</gi, '&lt;').replace(/>/gi, '&gt;')
          let re = new RegExp(escapeRegExp(needle), 'gi')
          return haystack.replace(re, '<em class="highlight">$&</em>')
        }

        return haystack
      }
    },
    watch: {
      chosen () {
        // Add CBS to the 'chosen' courses
        let courses = this.chosen.concat([this.$store.state.courseData.CBS])

        // Assign a random colour to the new course (if any)
        let used = courses.map(course => course.color)
        for (let course of courses) {
          if (!course.color) {
            course.color = choice(this.colors.filter(c => !used.includes(c)))
            break
          }
        }

        this.$store.commit('courses', courses)
      },
      courses () {
        // Check we need to update our chosen list (e.g. if a course is removed)
        // NB: the -1 is to deal with the added CBS course
        if (this.courses.length - 1 !== this.chosen.length) {
          this.chosen = this.courses.filter(c => c.code !== 'CBS')
        }
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

<template>
  <v-list v-if="courses.length > 0" class="py-0">
    <v-list-tile v-for="course in courses" :key="course.code">
      <v-list-tile-content>
        <v-list-tile-title>
          {{ course.code }}

          <span class="faded">
            — {{ course.title }}
          </span>
        </v-list-tile-title>
      </v-list-tile-content>
      <v-list-tile-action>
        <v-btn icon @click="courses.splice(courses.indexOf(course), 1)">
          <v-icon>close</v-icon>
        </v-btn>
      </v-list-tile-action>
    </v-list-tile>
  </v-list>
</template>

<script>
  export default {
    data () {
      return {
      }
    },
    computed: {
      courses () {
        return this.$store.state.courses
      }
    },
    methods: {

    }
  }
</script>

<style scoped>
  .faded {
    opacity: 0.7;
  }
</style>

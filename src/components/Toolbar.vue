<template>
  <v-toolbar
    app
    fixed
    clipped-left
    dark
    color="primary"
  >
    <v-toolbar-side-icon @click.stop="$emit('menu')"></v-toolbar-side-icon>
    <v-toolbar-title v-text="title"></v-toolbar-title>
    <v-spacer></v-spacer>
  </v-toolbar>
</template>

<script>
  export default {
    props: {
      title: {
        type: String,
        required: true
      }
    }
  }
</script>

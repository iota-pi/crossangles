<template>
  <v-toolbar
    app
    fixed
    clipped-left
    dark
    color="primary"
  >
    <v-toolbar-side-icon @click.stop="$emit('menu')" />
    <v-toolbar-title>CrossAngles</v-toolbar-title>
    <v-spacer />
  </v-toolbar>
</template>

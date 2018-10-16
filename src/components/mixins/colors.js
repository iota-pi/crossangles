const colorBases = [
  {
    hex: '#C2185B',
    vuetify: 'pink darken-2'
  },
  {
    hex: '#512DA8',
    vuetify: 'deep-purple darken-2'
  },
  {
    hex: '#303F9F',
    vuetify: 'indigo darken-2'
  },
  {
    hex: '#1976D2',
    vuetify: 'blue darken-2'
  },
  {
    hex: '#00796B',
    vuetify: 'teal darken-2'
  },
  {
    hex: '#689F38',
    vuetify: 'light-green darken-2'
  },
  {
    hex: '#FFA000',
    vuetify: 'amber darken-2'
  },
  {
    hex: '#E64A19',
    vuetify: 'deep-orange darken-2'
  }
]

export default {
  data () {
    return {
      colors: colorBases.map(color => color.hex)
    }
  }
}

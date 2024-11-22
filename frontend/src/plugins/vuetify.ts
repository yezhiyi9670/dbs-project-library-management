import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { md3 } from 'vuetify/blueprints'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

import { zhHans } from 'vuetify/locale'

export default createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  blueprint: md3,
  locale: {
    locale: 'zhHans',
    fallback: 'en',
    messages: { zhHans }
  }
})

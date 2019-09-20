import QDateFilter from 'quasar-app-extension-q-date-filter/src/component/QDateFilter.vue'
import VCalendar from 'v-calendar'

export default ({ Vue }) => {
  Vue.use(VCalendar)
  Vue.component('q-date-filter', QDateFilter)
}

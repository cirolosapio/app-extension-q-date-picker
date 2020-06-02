import QDatePicker from 'quasar-app-extension-q-date-picker/src/component/QDatePicker.vue'
import VCalendar from 'v-calendar'

export default ({ Vue }) => {
  Vue.use(VCalendar)
  Vue.component('q-date-picker', QDatePicker)
}

<template>
  <div>
    <q-item dense class="cursor-pointer q-pr-xs q-pl-sm" style="min-height: 28px">
      <q-item-section side class="q-pr-sm-important">
        <q-item-label caption>{{displayValue}}</q-item-label>
      </q-item-section>
      <q-item-section no-wrap>
        <q-item-label class="text-caption">
          {{displayDate}}
        </q-item-label>
      </q-item-section>
      <q-item-section side class="q-pl-xs-important">
        <q-icon name="arrow_drop_down" />
      </q-item-section>
      <q-item-section side class="q-pl-xs-important">
        <div class="items-center">
          <q-icon class="cursor-pointer hover-black" color="grey" size="24px" name="keyboard_arrow_left" @click.stop="prev()" />
          <q-icon class="cursor-pointer hover-black" color="grey" size="24px" name="keyboard_arrow_right" @click.stop="next()" />
        </div>
      </q-item-section>

      <q-menu fit anchor="top right" self="top right" :offset="[70, 0]" transition-show="jump-left" transition-hide="jump-right" max-height="1000px"
        ref="menu" :persistent="choise === 'custom' || comparing">
        <div class="row">
          <div class="col-5">
            <q-list padding class="custom-list" style="transition: width .3s, height .3s">
              <q-tabs no-caps dense v-model="choise" vertical switch-indicator :indicator-color="color" active-bg-color="grey-2">
                <q-tab name="custom" :label="$q.lang.qDateFilter.custom" />
                <q-separator spaced />
                <q-tab :name="value" :label="$q.lang.qDateFilter[value]" v-for="{ value } in periods" :key="value" />
              </q-tabs>
              <q-separator spaced />
              <q-item class="q-pl-none q-py-none q-my-xs" style="min-height: 20px" clickable @click="choise = 'x_days_to_today'" :class="{ 'bg-grey-2': choise === 'x_days_to_today' }">
                <q-separator vertical :color="choise === 'x_days_to_today' ? color : 'white'" style="width: 2px"/>
                <div class="flex items-baseline q-gutter-x-sm q-pl-md q-py-xs">
                  <q-input v-model="days_to_today" dense style="max-width: 30px" @click.stop="$refs.days_to_today.focus()" ref="days_to_today" />
                  <q-item-label>{{$q.lang.qDateFilter.daysToToday}}</q-item-label>
                </div>
              </q-item>
              <q-item class="q-pl-none q-py-none q-my-xs" style="min-height: 20px" clickable @click="choise = 'x_days_to_yesterday'" :class="{ 'bg-grey-2': choise === 'x_days_to_yesterday' }">
                <q-separator vertical :color="choise === 'x_days_to_yesterday' ? color : 'white'" style="width: 2px"/>
                <div class="flex items-baseline q-gutter-x-sm q-pl-md q-py-xs">
                  <q-input v-model="days_to_yesterday" dense style="max-width: 30px" @click.stop="$refs.days_to_yesterday.focus()" ref="days_to_yesterday" />
                  <q-item-label>{{$q.lang.qDateFilter.daysToYesterday}}</q-item-label>
                </div>
              </q-item>

              <template v-if="!noCompare">
                <q-separator spaced />

                <q-item tag="label" dense clickable :disable="choise === 'from_start'">
                  <q-item-section>
                    <q-item-label>{{$q.lang.qDateFilter.compare}}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle v-model="comparing" dense :color="toggleColor" :disable="choise === 'from_start'" />
                  </q-item-section>
                </q-item>
                <q-tabs no-caps dense v-model="compare_choise" vertical switch-indicator :indicator-color="color" v-if="comparing">
                  <q-tab name="previous_period" :label="displayComparingValue" />
                  <q-tab name="previous_year" :label="$q.lang.qDateFilter.last_year" />
                  <q-tab name="custom" :label="$q.lang.qDateFilter.custom" />
                </q-tabs>
              </template>

              <q-resize-observer @resize="onResize" :debounce="0" />
            </q-list>
          </div>

          <q-separator vertical />

          <div class="col">
            <div class="row no-wrap items-baseline justify-center q-px-sm q-pt-sm q-gutter-x-sm">
              <div class="col">
                <q-input v-model="start" :color="color" dense type="date" style="min-width: 110px" :rules="[ val => maxEnd(val, end) ]" no-error-icon hide-bottom-space ref="input" />
              </div>
              <q-icon name="mdi-minus" />
              <div class="col">
                <q-input v-model="end" :color="color" dense type="date" style="min-width: 110px" :rules="[ val => minStart(val, start) ]" no-error-icon hide-bottom-space ref="input" />
              </div>
            </div>
            <template v-if="comparing">
              <q-item-label caption class="q-pt-sm q-pl-md">{{$q.lang.qDateFilter.compare}}</q-item-label>
              <div class="row no-wrap items-baseline justify-center q-px-sm q-gutter-x-sm">
                <div class="col">
                  <q-input v-model="previous_start" :color="previousColor" dense type="date" :rules="[ val => maxEnd(val, previous_end) ]" no-error-icon hide-bottom-space ref="input" />
                </div>
                <q-icon name="mdi-minus" />
                <div class="col">
                  <q-input v-model="previous_end" :color="previousColor" dense type="date" :rules="[ val => minStart(val, previous_start) ]" no-error-icon hide-bottom-space ref="input" />
                </div>
              </div>
            </template>

            <q-separator class="q-mt-sm" />

            <div style="overflow-y: auto; overflow-x: hidden" :style="calendarHeight">
              <v-date-picker mode="range" v-model="selectedDate" title-position="left" :rows="2" is-inline :attributes="attrs"
                is-expanded style="border-width: 0px">
                <template #header="{ title }">
                  <div class="vc-header vc-text-gray-900">
                    <div class="vc-title-layout align-left">
                        <div class="vc-title-wrapper">
                          <div class="vc-text-lg vc-text-gray-800 vc-font-semibold">{{title}}</div>
                        </div>
                    </div>
                  </div>
                </template>
                <template #header-left-button>
                  <q-btn dense round flat icon="keyboard_arrow_left" />
                </template>
                <template #header-right-button>
                  <q-btn dense round flat icon="keyboard_arrow_right" />
                </template>
              </v-date-picker>
            </div>
          </div>
        </div>

        <template v-if="choise === 'custom' || comparing">
          <q-separator  />

          <q-card-actions align="right">
            <q-btn no-caps flat :label="$q.lang.label.cancel" color="grey" v-close-popup />
            <q-btn no-caps flat :label="$q.lang.label.set" :color="color" @click="ok()" v-close-popup />
          </q-card-actions>
        </template>
      </q-menu>
    </q-item>

    <!-- <q-separator /> -->

    <q-item-label class="float-right" caption v-if="comparing">
      {{$q.lang.qDateFilter.compareTo}}: {{displayComparingDate}}
    </q-item-label>
  </div>
</template>

<script>
import { QMenu, QTabs, QTab, QSeparator, QInput, QToggle, QCardActions, QResizeObserver } from 'quasar'
import * as m from 'moment'
export default {
  name: 'QDateFilter',
  components: { QMenu, QTabs, QTab, QSeparator, QInput, QToggle, QCardActions, QResizeObserver },
  props: {
    locale: {
      type: String,
      default: () => 'it'
    },
    value: {
      type: Object,
      required: true
    },
    noCompare: {
      type: Boolean,
      default: () => false
    },
    maxYears: {
      type: Number,
      default: () => 2
    },
    color: {
      type: String,
      default: () => 'primary'
    },
    previousColor: {
      type: String,
      default: () => 'amber'
    },
    toggleColor: {
      type: String,
      default: () => 'teal'
    }
  },

  beforeCreate () { this.$q.lang.qDateFilter = {} },

  created () {
    import(`../lang/${this.locale}`).then(({ default: { qDateFilter } }) => {
      this.$q.lang.qDateFilter = qDateFilter
    })
    if (m(this.value.start).isValid() && m(this.value.end).isValid()) this.selectedDate = {
      start: this.value.start,
      end: this.value.end
    }
  },

  data () {
    return {
      start: '',
      end: '',
      previous_start: '',
      previous_end: '',

      choise: '',
      lastChoise: '',
      compare_choise: '',
      days_to_today: 30,
      days_to_yesterday: 30,
      custom: true,
      comparing: false,
      calendarHeight: null,

      periods: [
        { value: 'today', period: 'day', start: m(), end: m() },
        { value: 'yesterday', period: 'day', start: m().subtract(1, 'days'), end: m().subtract(1, 'days') },
        { period: 'week', value: 'this_week', start: m().startOf('week'), end: m() },
        { value: 'last_7_days', start: m().subtract(6, 'days'), end: m() },
        { value: 'last_week', period: 'week', start: m().subtract(1, 'week').startOf('week'), end: m().subtract(1, 'week').endOf('week') },
        { value: 'last_14_days', start: m().subtract(13, 'days'), end: m() },
        { value: 'this_month', period: 'month', start: m().startOf('month'), end: m() },
        { value: 'last_30_days', start: m().subtract(29, 'days'), end: m() },
        { value: 'last_month', period: 'month', start: m().subtract(1, 'month').startOf('month'), end: m().subtract(1, 'month').endOf('month') },
        { value: 'this_quarter', period: 'quarter', start: m().startOf('quarter'), end: m() },
        { value: 'last_90_days', start: m().subtract(89, 'days'), end: m() },
        { value: 'last_quarter', period: 'quarter', start: m().subtract(1, 'quarter').startOf('quarter'), end: m().subtract(1, 'quarter').endOf('quarter') },
        { value: 'from_start', start: m().subtract(this.maxYears, 'years').startOf('month'), end: m() }
      ],
      previous_periods: [
        { value: 'today', display: 'yesterday', start: m().subtract(1, 'days'), end: m().subtract(1, 'days') },
        { value: 'yesterday', display: '2_days_ago', start: m().subtract(2, 'days'), end: m().subtract(2, 'days') },
        { value: 'this_week', display: 'last_week', start: m().subtract(1, 'week').startOf('week'), end: m().subtract(1, 'week').endOf('week') },
        { value: 'last_7_days', start: m().subtract(13, 'days'), end: m().subtract(7, 'days') },
        { value: 'last_week', display: '2_weeks_ago', start: m().subtract(2, 'week').startOf('week'), end: m().subtract(2, 'week').endOf('week') },
        { value: 'last_14_days', start: m().subtract(27, 'days'), end: m().subtract(14, 'days') },
        { value: 'this_month', display: 'last_month', start: m().subtract(1, 'month').startOf('month'), end: m().subtract(1, 'month').endOf('month') },
        { value: 'last_30_days', start: m().subtract(59, 'days'), end: m().subtract(30, 'days') },
        { value: 'last_month', display: '2_months_ago', start: m().subtract(2, 'month').startOf('month'), end: m().subtract(2, 'month').endOf('month') },
        { value: 'this_quarter', display: 'last_quarter', start: m().subtract(1, 'quarter').startOf('quarter'), end: m().subtract(1, 'quarter').endOf('quarter') },
        { value: 'last_90_days', start: m().subtract(179, 'days'), end: m().subtract(90, 'days') },
        { value: 'last_quarter', display: '2_quarters_ago', start: m().subtract(2, 'quarter').startOf('quarter'), end: m().subtract(2, 'quarter').endOf('quarter') }
      ]
    }
  },

  watch: {
    choise (choise) {
      if (choise !== 'custom') this.lastChoise = choise
      if (choise === 'from_start') this.comparing = false
      if (this.periods.findIndex(({ value }) => value === choise) !== -1) {
        let { start, end } = this.periods.find(({ value }) => value === choise)
        this.selectedDate = { start: start.toDate(), end: end.toDate() }
      } else if (choise === 'x_days_to_today') this.selectedDate = { start: m().subtract(this.days_to_today - 1, 'days').toDate(), end: m().toDate() }
      else if (choise === 'x_days_to_yesterday') this.selectedDate = { start: m().subtract(this.days_to_yesterday, 'days').toDate(), end: m().subtract(1, 'days').toDate() }
      else return
      if (!this.comparing) this.$refs.menu.hide()
    },
    days_to_today (days) {
      this.choise = 'x_days_to_today'
      this.selectedDate = { start: m().subtract(this.days_to_today - 1, 'days').toDate(), end: m().toDate() }
    },
    days_to_yesterday (days) {
      this.choise = 'x_days_to_yesterday'
      this.selectedDate = { start: m().subtract(this.days_to_yesterday, 'days').toDate(), end: m().subtract(1, 'days').toDate() }
    },
    comparing (comparing) {
      if (comparing && !this.compare_choise) this.compare_choise = 'previous_period'
    },
    compare_choise () {
      this.updatePrevious()
    }
  },

  methods: {
    ok () {
      let range = {
        start: this.start,
        end: this.end
      }
      if (this.comparing) {
        range.previous_start = this.previous_start
        range.previous_end = this.previous_end
      }
      this.$emit('input', range)
    },
    updateChoise () {
      // 1 - è una dei periodi
      // 2 - corrisponde a x_days_to_today
      // 3 - corrisponde a x_days_to_yesterday
      // 4 - è custom

      let start_from_today = m().subtract(this.days_to_today - 1, 'days'),
        end_from_today = m(),
        start_from_yesterday = m().subtract(this.days_to_yesterday, 'days'),
        end_from_yesterday = m().subtract(1, 'days'),
        isAPeriod = false

      this.periods.forEach(({ start, end }, index) => {
        if (start.format('YYYY-MM-DD') === this.start && end.format('YYYY-MM-DD') === this.end) {
          this.choise = this.periods[index].value
          isAPeriod = true
        }
      })

      if (start_from_today.format('YYYY-MM-DD') === this.start && end_from_today.format('YYYY-MM-DD') === this.end) this.choise = 'x_days_to_today'
      else if (start_from_yesterday.format('YYYY-MM-DD') === this.start && end_from_yesterday.format('YYYY-MM-DD') === this.end) this.choise = 'x_days_to_yesterday'
      else if (!isAPeriod) this.choise = 'custom'
    },
    updatePrevious () {
      if (this.compare_choise === 'previous_period') {
        if (this.previous_periods.findIndex(({ value }) => value === this.choise) !== -1) {
          let { start, end } = this.previous_periods.find(({ value }) => value === this.choise)
          this.previousDate = { start: start.toDate(), end: end.toDate() }
        } else {
          // se non è uno dei periodi rifletto a specchio
          let end = m(this.start).subtract(1, 'days').toDate(),
            diff = m(this.end).diff(m(this.start), 'days'),
            start = m(this.start).subtract(diff + 1, 'days').toDate()
          this.previousDate = { start, end }
        }
      } else if (this.compare_choise === 'previous_year') {
        let start = m(this.start).subtract(1, 'years').toDate(),
          end = m(this.end).subtract(1, 'years').toDate()
        this.previousDate = { start, end }
      }
    },
    prev () {
      if (this.period) this.selectedDate = {
        start: m(this.start).subtract(1, this.period).toDate(),
        end: m(this.end).subtract(1, this.period).endOf(this.period).toDate()
      }
      else this.selectedDate = {
        start: m(this.start).subtract(this.dayDiff + 1, 'days').toDate(),
        end: m(this.end).subtract(this.dayDiff + 1, 'days').toDate()
      }
      this.ok()
    },
    next () {
      if (this.period) this.selectedDate = {
        start: m(this.start).add(1, this.period).toDate(),
        end: m(this.end).add(1, this.period).endOf(this.period).toDate()
      }
      else this.selectedDate = {
        start: m(this.start).add(this.dayDiff + 1, 'days').toDate(),
        end: m(this.end).add(this.dayDiff + 1, 'days').toDate()
      }
      this.ok()
    },
    onResize () {
      let height = 30 * (this.periods.length) + 142
      height += this.comparing ? 38 : 0
      height += this.noCompare ? -45 : 0
      height += 'px'
      this.calendarHeight = { height }
    }
  },

  computed: {
    selectedDate: {
      get () {
        if (this.choise !== 'custom' && !this.comparing) this.ok()
        return {
          start: m(this.start).toDate(),
          end: m(this.end).toDate()
        }
      },
      set ({ start, end }) {
        this.start = m(start).format('YYYY-MM-DD')
        this.end = m(end).format('YYYY-MM-DD')

        this.updateChoise()
        this.updatePrevious()
      }
    },
    previousDate: {
      get () {
        if (this.isCustomCompare) this.compare_choise = 'custom'
        return {
          start: m(this.previous_start).toDate(),
          end: m(this.previous_end).toDate()
        }
      },
      set ({ start, end }) {
        this.previous_start = m(start).format('YYYY-MM-DD')
        this.previous_end = m(end).format('YYYY-MM-DD')
      }
    },
    attrs () {
      return (this.comparing && m(this.start).isValid() && m(this.end).isValid()) ? [
        {
          key: 'previousDate',
          highlight: 'yellow',
          dates: [this.previousDate]
        }
      ] : []
    },
    minStart () {
      return (date, start) => start ? date >= start : true
    },
    maxEnd () {
      return (date, end) => end ? date <= end : true
    },
    displayValue () {
      if (this.periods.findIndex(({ value }) => value === this.choise) !== -1) return this.$q.lang.qDateFilter[this.choise]
      else if (this.choise === 'x_days_to_today') return this.days_to_today + this.$q.lang.qDateFilter.daysToToday
      else if (this.choise === 'x_days_to_yesterday') return this.days_to_yesterday + this.$q.lang.qDateFilter.daysToYesterday
      return this.$q.lang.qDateFilter.custom
    },
    displayDate () {
      // if (!m(this.start).isValid() || !m(this.end).isValid()) return ''
      if (this.start === this.end) return m(this.start).format('D MMM YYYY')
      else if (m(this.start).month() === m(this.end).month()) return `${m(this.start).date()} - ${m(this.end).format('D MMM YYYY')}`
      else if (m(this.start).year() === m(this.end).year()) return `${m(this.start).format('D MMM')} - ${m(this.end).format('D MMM YYYY')}`
      else return `${m(this.start).format('D MMM YYYY')} - ${m(this.end).format('D MMM YYYY')}`
    },
    displayComparingValue () {
      if (this.choise && !['from_start', 'custom', 'x_days_to_today', 'x_days_to_yesterday'].includes(this.choise) && !this.isCustom) {
        let { display } = this.previous_periods.find(({ value }) => value === this.choise)
        return display ? this.$q.lang.qDateFilter[display] : this.$q.lang.qDateFilter.previous_period
      } return this.$q.lang.qDateFilter.previous_period
    },
    displayComparingDate () {
      if (this.previous_start === this.previous_end) return m(this.previous_start).format('D MMM YYYY')
      else if (m(this.previous_start).month() === m(this.previous_end).month()) return `${m(this.previous_start).date()} - ${m(this.previous_end).format('D MMM YYYY')}`
      else if (m(this.previous_start).year() === m(this.previous_end).year()) return `${m(this.previous_start).format('D MMM')} - ${m(this.previous_end).format('D MMM YYYY')}`
      else return `${m(this.previous_start).format('D MMM YYYY')} - ${m(this.previous_end).format('D MMM YYYY')}`
    },
    isCustomCompare () {
      let isCustom = true
      // fa parte dei periodi?
      this.previous_periods.forEach(({ start, end }) => {
        if (start.format('YYYY-MM-DD') === this.previous_start && end.format('YYYY-MM-DD') === this.previous_end) isCustom = false
      })

      // è l'anno precedente?
      if (m(this.start).subtract(1, 'years').format('YYYY-MM-DD') === this.previous_start &&
        m(this.end).subtract(1, 'years').format('YYYY-MM-DD') === this.previous_end) isCustom = false

      // è il periodo specchiato?
      let end = m(this.start).subtract(1, 'days').format('YYYY-MM-DD'),
        diff = m(this.end).diff(m(this.start), 'days'),
        start = m(this.start).subtract(diff + 1, 'days').format('YYYY-MM-DD')
      if (start === this.previous_start && end === this.previous_end) isCustom = false
      return isCustom
    },
    dayDiff () {
      return m(this.end).diff(m(this.start), 'days')
    },
    period () {
      if (this.lastChoise && !['x_days_to_today', 'x_days_to_yesterday'].includes(this.lastChoise)) {
        return this.periods.find(({ value }) => value === this.lastChoise).period
      }
      return null
    }
  }
}
</script>

<style lang="stylus">
  .custom-list
    .q-tab
      justify-content left !important
      min-height 30px
      padding 0 15px
    .q-tab__label
      font-size 12px !important
      font-weight 400 !important
    .q-item__label
      font-size 12px !important
    .q-field--dense
      .q-field__control
        height 20px
  .q-field--dense
    .q-field__control
      height 30px
  .q-field__native
    padding 0px
  .vc-grid-cell
    .on-left
      margin-right 0
    .on-right
      margin-left 0
  .hover-black
    &:hover
      color black !important
  .q-pl-xs-important
    padding-left 4px !important
  .q-pr-sm-important
    padding-right 8px !important
  // .q-pl-sm-important
  //   padding-left 8px !important
</style>

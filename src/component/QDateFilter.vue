<template>
  <div>
    <q-item dense class="cursor-pointer custom-button">
      <template v-if="start || end">
        <q-item-section side v-if="getChoiseFromDate">
          <q-item-label caption>{{ getChoiseFromDate.label }}</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ displayDate }}</q-item-label>
        </q-item-section>
      </template>
      <q-item-section v-else>
        <q-item-label caption>Select a date</q-item-label> <!-- TODO: lang -->
      </q-item-section>
      <q-item-section side>
        <q-icon :name="icons.mdiMenuDown" />
      </q-item-section>
      <q-item-section side v-if="start || end">
        <div class="items-center">
          <q-icon class="cursor-pointer custom-hover" color="grey" size="24px" :name="icons.mdiChevronLeft" @click.stop="prev()" />
          <q-icon class="cursor-pointer custom-hover" color="grey" size="24px" :name="icons.mdiChevronRight" @click.stop="next()" />
          <q-icon class="cursor-pointer custom-hover" color="grey" size="24px" :name="icons.mdiCloseCircle" v-if="clearable" @click.stop="clear()" />
        </div>
      </q-item-section>

      <q-popup-proxy v-bind="popupProps" @before-show="resetModel">
        <q-card-section horizontal>
          <q-card-section class="q-pa-none" style="min-width: 150px">
            <q-list padding class="custom-tabs">
              <q-tabs v-bind="tabsProps(color)" v-model="choise">
                <q-tab label="Custom" name="custom" />
                <q-separator spaced />
                <q-tab :label="label" :name="value" v-for="{ value, label } in dates" :key="value" />
              </q-tabs>

              <template v-if="compare">
                <q-separator spaced />

                <q-item tag="label" dense clickable>
                  <q-item-section>
                    <q-item-label>Compare</q-item-label> <!-- TODO: lang -->
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle dense :color="toggleColor" v-model="comparing" />
                  </q-item-section>
                </q-item>
                <q-tabs v-bind="tabsProps(prevColor)" v-if="comparing" v-model="compare_choise">
                  <q-tab name="prev_period" :label="getCompareChoiseFromDate ? getCompareChoiseFromDate.label : 'Previous period'" /> <!-- TODO: lang -->
                  <q-tab name="prev_year" :label="'Last Year'" /> <!-- TODO: lang -->
                  <q-tab name="custom" :label="'Custom'" /> <!-- TODO: lang -->
                </q-tabs>
              </template>
            </q-list>
          </q-card-section>

          <q-separator vertical />

          <q-card-section class="q-pa-none">
            <q-list>
              <q-item dense class="q-px-xs custom-input">
                <q-item-section side>
                  <q-input v-bind="inputProps" :max="end" :color="color" v-model="start" />
                </q-item-section>
                <q-item-section>
                  <q-icon :name="icons.mdiMinus" />
                </q-item-section>
                <q-item-section side>
                  <q-input v-bind="inputProps" :min="start" :color="color" v-model="end" />
                </q-item-section>
              </q-item>

              <template v-if="comparing">
                <q-item-label caption class="q-pt-sm q-pl-md" :class="{ 'text-white': $q.dark.isActive }">Compare</q-item-label> <!-- TODO: lang -->
                <q-item dense class="q-px-xs custom-input">
                  <q-item-section side>
                    <q-input v-bind="inputProps" :max="prev_end" :color="color" v-model="prev_start" @input="updatePrevChoises" />
                  </q-item-section>
                  <q-item-section>
                    <q-icon :name="icons.mdiMinus" />
                  </q-item-section>
                  <q-item-section side>
                    <q-input v-bind="inputProps" :min="prev_start" :color="color" v-model="prev_end" @change="updatePrevChoises" />
                  </q-item-section>
                </q-item>
              </template>
            </q-list>

            <q-separator />

            <div>
              <date-picker v-bind="datePickerProps" v-model="selectedDate" />
            </div>
          </q-card-section>
        </q-card-section>

        <template v-if="choise === 'custom' || comparing">
          <q-separator />

          <q-card-actions align="right">
            <q-btn no-caps flat :label="$q.lang.label.cancel" color="grey" @click="cancel()" />
            <q-btn no-caps flat :label="$q.lang.label.set" :color="color" @click="emitInput()" />
          </q-card-actions>
        </template>
      </q-popup-proxy>
    </q-item>

    <q-item-label class="float-right" caption v-if="comparing && (prev_start || prev_end)">
      <!-- TODO: lang -->
      Compare to: {{ displayPrevDate }}
    </q-item-label>
  </div>
</template>

<script>
import { mdiChevronLeft, mdiChevronRight, mdiMenuDown, mdiMinus, mdiCloseCircle } from '@quasar/extras/mdi-v5'
import { startOfDate, endOfDate, deepEqual } from '../utils'
import { DatePicker } from 'v-calendar'
import { date } from 'quasar'
export default {
  name: 'QDateFilter',
  props: {
    value: {
      type: Object,
      required: true
    },
    menuProps: {
      type: Object,
      default: () => ({
        anchor: 'top right',
        transitionShow: 'jump-left',
        transitionHide: 'jump-right'
      })
    },
    compare: Boolean,
    clearable: Boolean,
    periods: {
      type: Array,
      required: true
    },
    dateFormat: {
      type: String,
      default: () => 'YYYY-MM-DD'
    },
    displayFormat: {
      type: String,
      default: () => 'D MMM YYYY'
    },
    color: {
      type: String,
      default: () => 'blue'
    },
    prevColor: {
      type: String,
      default: () => 'orange'
    },
    toggleColor: {
      type: String,
      default: () => 'teal'
    }
  },
  components: { DatePicker },

  data () {
    return {
      choise: 'custom',
      compare_choise: 'prev_period',
      comparing: false,

      icons: {
        mdiChevronLeft,
        mdiChevronRight,
        mdiMenuDown,
        mdiMinus,
        mdiCloseCircle
      },

      start: null,
      end: null,
      prev_start: null,
      prev_end: null
    }
  },

  computed: {
    // date-picker models
    selectedDate: {
      get () {
        const start = this.start ? date.extractDate(this.start, this.dateFormat) : null
        const end = this.end ? date.extractDate(this.end, this.dateFormat) : null
        return { start, end }
      },
      set ({ start, end }) {
        this.start = date.formatDate(start, this.dateFormat)
        this.end = date.formatDate(end, this.dateFormat)
      }
    },
    selectedPrevDate () {
      return (this.comparing && this.start && this.end && this.prev_start && this.prev_end) ? [
        {
          key: 'prevDate',
          highlight: this.prevColor,
          dates: [{
            start: date.extractDate(this.prev_start, this.dateFormat),
            end: date.extractDate(this.prev_end, this.dateFormat)
          }]
        }
      ] : []
    },

    // configs
    datePickerProps () {
      return {
        ref: 'datePicker',
        mode: 'range',
        titlePosition: 'left',
        rows: this.dates.length >= 9 ? 2 : 1,
        isInline: true,
        isExpanded: true,
        color: this.color,
        locale: this.$q.lang.isoName,
        firstDayOfWeek: this.$q.lang.date.firstDayOfWeek + 1,
        attributes: this.selectedPrevDate
      }
    },
    popupProps () {
      return {
        ref: 'menu',
        maximized: true,
        cover: true,
        maxHeight: '1000px',
        ...this.menuProps,
        persistent: this.choise === 'custom' || this.comparing
      }
    },
    tabsProps () {
      return color => ({
        vertical: true,
        switchIndicator: true,
        noCaps: true,
        indicatorColor: color,
        activeBgColor: this.$q.dark.isActive ? 'grey-10' : color + '-1',
        activeColor: this.$q.dark.isActive ? color : color
      })
    },
    inputProps () {
      return {
        dense: true,
        borderless: true,
        noErrorIcon: true,
        hideBottomSpace: true,
        type: 'date'
      }
    },

    // getters
    dates () {
      return this.periods.map(({ start = {}, end = {}, startOf, endOf, ...rest }) => {
        const today = new Date().toJSON().slice(0, 10)

        start = date.addToDate(today, start)
        end = date.addToDate(today, end)

        if (startOf) start = startOfDate(start, startOf, this.$q.lang.date.firstDayOfWeek)
        if (endOf) end = endOfDate(end, endOf, this.$q.lang.date.firstDayOfWeek)

        return { ...rest, start, end }
      })
    },
    prev_dates () {
      if (!this.comparing) return []
      return this.dates.map(({ start, end, prev, value }, idx, dates) => {
        start = date.addToDate(start, prev)
        end = date.addToDate(end, prev)
        const res = { start, end, value, label: 'Previous period' } // TODO: lang

        const next = dates[idx + 1]
        if (next) {
          const { label, prev: period } = next
          if (deepEqual(period, prev)) res.label = label
        }

        return res
      })
    },
    getChoiseFromDate () {
      return this.dates.find(({ start, end }) =>
        this.start === date.formatDate(start, this.dateFormat) &&
        this.end === date.formatDate(end, this.dateFormat))
    },
    getCompareChoiseFromDate () {
      return this.prev_dates.find(({ start, end }) =>
        this.prev_start === date.formatDate(start, this.dateFormat) &&
        this.prev_end === date.formatDate(end, this.dateFormat))
    },
    getDateFromChoise () {
      return this.dates.find(({ value }) => value === this.choise)
    },
    getPrevDateFromChoise () {
      return this.prev_dates.find(({ value }) => value === this.choise)
    },
    getDayDiff () {
      return date.getDateDiff(this.start, this.end, 'days')
    },
    getPeriodFromChoise () {
      return this.getDateFromChoise ? this.getDateFromChoise.prev : { days: -this.getDayDiff - 1 }
    },

    // display values
    displayDate () {
      if (!this.start || !this.end) return null
      if (this.start === this.end) return date.formatDate(this.start, this.displayFormat)
      else if (date.isSameDate(this.start, this.end, 'month')) return `${date.formatDate(this.start, 'D')} - ${date.formatDate(this.end, this.displayFormat)}`
      else if (date.isSameDate(this.start, this.end, 'year')) return `${date.formatDate(this.start, 'D MMM')} - ${date.formatDate(this.end, this.displayFormat)}`
      else return `${date.formatDate(this.start, this.displayFormat)} - ${date.formatDate(this.end, this.displayFormat)}`
    },
    displayPrevDate () {
      if (!this.prev_start || !this.prev_end) return null
      if (this.prev_start === this.prev_end) return date.formatDate(this.prev_start, this.displayFormat)
      else if (date.isSameDate(this.prev_start, this.prev_end, 'month')) return `${date.formatDate(this.prev_start, 'D')} - ${date.formatDate(this.prev_end, this.displayFormat)}`
      else if (date.isSameDate(this.prev_start, this.prev_end, 'year')) return `${date.formatDate(this.prev_start, 'D MMM')} - ${date.formatDate(this.prev_end, this.displayFormat)}`
      else return `${date.formatDate(this.prev_start, this.displayFormat)} - ${date.formatDate(this.prev_end, this.displayFormat)}`
    }
  },

  watch: {
    choise (choise) {
      if (this.dates.findIndex(({ value }) => value === choise) !== -1) {
        const { start, end } = this.dates.find(({ value }) => value === choise)
        this.start = date.formatDate(start, this.dateFormat)
        this.end = date.formatDate(end, this.dateFormat)
      }
      if (this.comparing && this.prev_dates.findIndex(({ value }) => value === choise) !== -1) {
        const { start, end } = this.prev_dates.find(({ value }) => value === choise)
        this.prev_start = date.formatDate(start, this.dateFormat)
        this.prev_end = date.formatDate(end, this.dateFormat)
      }
      if (!this.comparing && choise !== 'custom') this.emitInput()
    },
    compare_choise () { this.updatePrev() },
    start () {
      this.choise = this.getChoiseFromDate?.value ?? 'custom'
      this.updatePrev()
      this.move()
    },
    end () {
      this.choise = this.getChoiseFromDate?.value ?? 'custom'
      this.updatePrev()
    }
  },

  methods: {
    // actions
    resetModel () {
      this.start = this.value.start
      this.end = this.value.end
      this.prev_start = this.value.prev_start
      this.prev_end = this.value.prev_end
    },
    async move () {
      const ref = this.$refs.datePicker
      if (ref) await ref.$refs.calendar.move(this.start)
    },
    prev () {
      const diff = this.getPeriodFromChoise
      this.start = date.formatDate(date.addToDate(this.start, diff), this.dateFormat)
      this.end = date.formatDate(date.addToDate(this.end, diff), this.dateFormat)
      if (this.comparing) {
        this.prev_start = date.formatDate(date.addToDate(this.prev_start, diff), this.dateFormat)
        this.prev_end = date.formatDate(date.addToDate(this.prev_end, diff), this.dateFormat)
      }
      this.emitInput()
    },
    next () {
      const diff = this.getPeriodFromChoise
      this.start = date.formatDate(date.subtractFromDate(this.start, diff), this.dateFormat)
      this.end = date.formatDate(date.subtractFromDate(this.end, diff), this.dateFormat)
      if (this.comparing) {
        this.prev_start = date.formatDate(date.subtractFromDate(this.prev_start, diff), this.dateFormat)
        this.prev_end = date.formatDate(date.subtractFromDate(this.prev_end, diff), this.dateFormat)
      }
      this.emitInput()
    },
    cancel () {
      this.resetModel()
      this.$refs.menu.hide()
    },
    clear () {
      this.start = null
      this.end = null
      this.prev_start = null
      this.prev_end = null
      this.emitInput()
    },
    updatePrev () {
      if (!this.start || !this.end) return
      if (this.compare_choise === 'prev_period') {
        if (this.prev_dates.findIndex(({ value }) => value === this.choise) !== -1) {
          const { start, end } = this.prev_dates.find(({ value }) => value === this.choise)
          this.prev_start = date.formatDate(start, this.dateFormat)
          this.prev_end = date.formatDate(end, this.dateFormat)
        } else {
          // se non è uno dei periodi rifletto a specchio
          const end = date.subtractFromDate(this.start, { days: 1 }),
            start = date.subtractFromDate(this.start, { days: -this.getDayDiff + 1 })
          this.prev_start = date.formatDate(start, this.dateFormat)
          this.prev_end = date.formatDate(end, this.dateFormat)
        }
      } else if (this.compare_choise === 'prev_year') {
        const start = date.subtractFromDate(this.start, { year: 1 }),
          end = date.subtractFromDate(this.end, { year: 1 })
        this.prev_start = date.formatDate(start, this.dateFormat)
        this.prev_end = date.formatDate(end, this.dateFormat)
      }
    },
    updatePrevChoises () {
      // fa parte dei periodi?
      if (this.getCompareChoiseFromDate) this.compare_choise = 'prev_period'

      // è l'anno precedente?
      else if (this.prev_start === date.formatDate(date.subtractFromDate(this.start, { year: 1 }), this.dateFormat) &&
        this.prev_end === date.formatDate(date.subtractFromDate(this.end, { year: 1 }), this.dateFormat)) this.compare_choise = 'prev_year'

      // è il periodo specchiato?
      else if (this.prev_start === date.formatDate(date.subtractFromDate(this.start, { days: this.getDayDiff + 1 }), this.dateFormat) &&
        this.prev_end === date.formatDate(date.subtractFromDate(this.start, { days: 1 }), this.dateFormat)) this.compare_choise = 'prev_period'

      else this.compare_choise = 'custom'
    },
    emitInput () {
      const range = {
        start: this.start,
        end: this.end
      }
      if (this.comparing) {
        range.prev_start = this.prev_start
        range.prev_end = this.prev_end
      }
      this.$emit('input', range)
      this.$refs.menu.hide()
    }
  }
}
</script>

<style lang="stylus" scoped>
.custom-tabs >>>
  .q-tab
    justify-content left !important
    padding 0 15px
    min-height 30px

  .q-tab
    .q-tab__content
      min-width 0

  .q-tab__label
    font-size 12px !important
    font-weight 400 !important

  .q-item__label
    font-size 12px !important

.custom-button >>>
  .q-list--dense > .q-item, .q-item--dense
    padding 2px 0

  .q-item__section--main ~ .q-item__section--side
    padding-left 2px

.custom-input >>>
  .q-field--dense
    .q-field__control
      height 28px

  .q-field__native
    padding 0px

  .q-item__section--side
    padding-right 0px

.custom-hover
  &:hover
    color $primary !important

div >>>
  .vc-grid-cell
    .on-left
      margin-right 0

    .on-right
      margin-left 0

  .vc-border
    border-style none

  .vc-weeks
    padding 0
</style>

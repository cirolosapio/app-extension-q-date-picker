<template>
  <div class="column">
    <div class="col">
      <div class="row">
        <div class="col">
          <q-item clickable dense class="cursor-pointer custom-button q-px-xs rounded-borders">
            <template v-if="start || end">
              <q-item-section side v-if="getChoiseFromDate && !hidePeriodLabel">
                <q-item-label caption>{{ getChoiseFromDate.label }}</q-item-label>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ displayDate }}</q-item-label>
              </q-item-section>
            </template>
            <q-item-section v-else>
              <q-item-label caption>{{ $q.lang.label.select }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon :name="icons.mdiMenuDown" />
            </q-item-section>

            <q-popup-proxy v-bind="popupProps" @before-show="refresh">
              <q-card>
                <q-card-section horizontal>
                  <q-card-section class="q-pa-none" style="min-width: 130px">
                    <q-list padding class="custom-tabs">
                      <q-tabs v-bind="tabsProps(color)" v-model="choise">
                        <q-tab :label="labels.custom" name="custom" />
                        <q-separator spaced />
                        <q-tab :label="label" :name="value" v-for="{ value, label } in dates" :key="value" />
                      </q-tabs>

                      <template v-if="compare">
                        <q-separator spaced />

                        <q-item tag="label" dense clickable class="q-px-sm" v-if="!hideCompareToggle">
                          <q-item-section>
                            <q-item-label>{{ labels.compare }}</q-item-label>
                          </q-item-section>
                          <q-item-section side>
                            <q-toggle dense :color="toggleColor" v-model="comparing" />
                          </q-item-section>
                        </q-item>
                        <q-tabs v-bind="tabsProps(prevColor)" v-if="comparing" v-model="compare_choise">
                          <q-tab name="prev_period" :label="getCompareChoiseFromDate ? getCompareChoiseFromDate.label : labels.prev_period" />
                          <q-tab name="prev_year" :label="labels.last_year" />
                          <q-tab name="custom" :label="labels.custom" />
                        </q-tabs>
                      </template>
                    </q-list>
                  </q-card-section>

                  <q-separator vertical />

                  <q-card-section class="q-pa-none col column">
                    <div class="col-auto">
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
                          <q-item-label caption class="q-pt-sm q-pl-md">{{ labels.compare }}</q-item-label>
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
                    </div>

                    <q-separator />

                    <div :style="$q.dark.isActive ? 'background-color: #0B1419' : ''" class="custom-calendar col">
                      <date-picker v-bind="datePickerProps" v-model="selectedDate" />
                    </div>
                  </q-card-section>
                </q-card-section>

                <template v-if="choise === 'custom' || comparing">
                  <q-separator />

                  <q-card-actions align="between">
                    <div class="items-center">
                      <q-icon class="cursor-pointer custom-hover" color="grey" size="24px" :name="icons.mdiChevronLeft" v-show="start && end" @click.stop="prev(false)" />
                      <q-icon class="cursor-pointer custom-hover" color="grey" size="24px" :name="icons.mdiChevronRight" v-show="start && end" @click.stop="next(false)" />
                    </div>

                    <div>
                      <q-btn no-caps flat :label="$q.lang.label.cancel" color="grey" @click="cancel()" />
                      <q-btn no-caps flat :label="$q.lang.label.refresh" color="secondary" @click="refresh()" />
                      <q-btn no-caps flat :label="$q.lang.label.set" :color="color" :disable="!start || !end" @click="emitInput()" />
                    </div>
                  </q-card-actions>
                </template>
              </q-card>
            </q-popup-proxy>
          </q-item>
        </div>
        <div class="col-auto column justify-center" v-if="start || end">
          <div>
            <q-icon class="cursor-pointer custom-hover" color="grey" size="24px" :name="icons.mdiChevronLeft" @click.stop="prev()" />
            <q-icon class="cursor-pointer custom-hover" color="grey" size="24px" :name="icons.mdiChevronRight" @click.stop="next(true)" />
            <q-icon class="cursor-pointer custom-hover" color="grey" size="24px" :name="icons.mdiCloseCircle" v-if="clearable" @click.stop="clear()" />
          </div>
        </div>
      </div>
    </div>

    <div class="col">
      <q-item class="q-py-xs" style="min-height: 0" dense>
        <q-item-label class="float-right" caption v-if="comparing && (prev_start || prev_end)">
          {{ labels.compare }}:
          {{ displayPrevDate }}
          <template v-if="getCompareChoiseFromDate && !hidePeriodLabel">
            ({{ getCompareChoiseFromDate.label }})
          </template>
        </q-item-label>
      </q-item>
    </div>
  </div>
</template>

<script>
import { mdiChevronLeft, mdiChevronRight, mdiMenuDown, mdiMinus, mdiCloseCircle } from '@quasar/extras/mdi-v5'
import { startOfDate, endOfDate, deepEqual } from '../utils'
import { DatePicker } from 'v-calendar'
import { date } from 'quasar'

const
  dateFormat = 'YYYY-MM-DD',
  { extractDate, formatDate, addToDate, subtractFromDate, getDateDiff, isSameDate } = date

export default {
  name: 'QDatePicker',
  props: {
    value: {
      type: Object,
      required: true
    },
    now: String,
    periods: {
      type: Array,
      required: true
    },

    // features
    compare: Boolean,
    hideCompareToggle: Boolean,
    clearable: Boolean,
    hidePeriodLabel: Boolean,

    // formats
    displayFormat: {
      type: String,
      default: () => 'D MMM YYYY'
    },

    // configs
    menuProps: {
      type: Object,
      default: () => ({
        anchor: 'top right',
        transitionShow: 'jump-left',
        transitionHide: 'jump-right'
      })
    },
    labels: {
      type: Object,
      default: () => ({
        custom: 'Custom',
        last_year: 'Last Year',
        compare: 'Compare',
        prev_period: 'Previous Period'
      })
    },
    color: {
      type: String,
      default: () => 'blue',
      validator: c => ['blue', 'purple', 'red', 'green', 'teal', 'orange', 'indigo', 'yellow', 'pink'].includes(c)
    },
    prevColor: {
      type: String,
      default: () => 'orange',
      validator: c => ['blue', 'purple', 'red', 'green', 'teal', 'orange', 'indigo', 'yellow', 'pink'].includes(c)
    },
    toggleColor: {
      type: String,
      default: () => 'teal'
    }
  },

  components: { DatePicker },

  data () {
    return {
      choise: null,
      compare_choise: null,
      last_choise: null,
      comparing: this.compare && this.hideCompareToggle,

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

  created () { this.refresh() },

  computed: {
    // date-picker models
    selectedDate: {
      get () {
        const start = this.start ? extractDate(this.start, dateFormat) : null
        const end = this.end ? extractDate(this.end, dateFormat) : null
        return { start, end }
      },
      set ({ start, end }) {
        this.start = formatDate(start, dateFormat)
        this.end = formatDate(end, dateFormat)
      }
    },
    selectedPrevDate () {
      return (this.comparing && this.prev_start && this.prev_end)
        ? [{
            key: 'prevDate',
            highlight: this.prevColor,
            dates: [{
              start: extractDate(this.prev_start, dateFormat),
              end: extractDate(this.prev_end, dateFormat)
            }]
          }]
        : []
    },

    // configs
    datePickerProps () {
      return {
        ref: 'datePicker',
        transition: 'slide-v',
        titlePosition: 'left',
        class: 'transparent',
        rows: this.dates.length >= 9 ? 2 : 1,
        isRange: true,
        isInline: true,
        isExpanded: true,
        isDark: this.$q.dark.isActive,
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
        maxHeight: '100vh',
        persistent: this.choise === 'custom' || this.comparing,
        ...this.menuProps
      }
    },
    tabsProps () {
      return color => ({
        vertical: true,
        switchIndicator: true,
        noCaps: true,
        indicatorColor: color,
        activeBgColor: this.$q.dark.isActive ? 'grey-9' : color + '-1',
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
        const today = this.now || new Date().toJSON().slice(0, 10)

        start = addToDate(today, start)
        end = addToDate(today, end)

        if (startOf) start = startOfDate(start, startOf, this.$q.lang.date.firstDayOfWeek)
        if (endOf) end = endOfDate(end, endOf, this.$q.lang.date.firstDayOfWeek)

        return { ...rest, start, end, endOf }
      })
    },
    prev_dates () {
      if (!this.comparing) return []
      return this.dates.map(({ start, end, endOf, prev, value }, idx, dates) => {
        start = addToDate(start, prev)
        end = addToDate(end, prev)

        if (endOf) end = endOfDate(end, endOf, this.$q.lang.date.firstDayOfWeek)

        const res = { start, end, value, label: this.labels.prev_period }

        const next = dates[idx + 1]
        if (next && deepEqual(next.prev, prev)) res.label = next.label

        return res
      })
    },
    getChoiseFromDate () {
      return this.dates.find(({ start, end }) =>
        this.start === formatDate(start, dateFormat) &&
        this.end === formatDate(end, dateFormat))
    },
    getCompareChoiseFromDate () {
      return this.prev_dates.find(({ start, end }) =>
        this.prev_start === formatDate(start, dateFormat) &&
        this.prev_end === formatDate(end, dateFormat))
    },
    getDateFromChoise () {
      return this.dates.find(({ value }) => value === this.last_choise)
    },
    getDayDiff () {
      return getDateDiff(this.end, this.start, 'days')
    },
    getPeriodFromChoise () {
      if (!this.getDateFromChoise) return { days: -this.getDayDiff - 1 }
      else return this.getDateFromChoise.prev
    },

    // display values
    getReadableFormat () {
      return (start, end) => {
        if (isSameDate(start, end, 'day')) return formatDate(start, this.displayFormat)
        else if (isSameDate(start, end, 'month')) {
          if (isSameDate(start, startOfDate(start, 'month'), 'day') && isSameDate(end, endOfDate(end, 'month'), 'day')) return formatDate(start, 'MMMM YYYY')
          return `${formatDate(start, 'D')} - ${formatDate(end, this.displayFormat)}`
        } else if (isSameDate(start, end, 'year')) {
          if (isSameDate(start, startOfDate(start, 'year'), 'day') && isSameDate(end, endOfDate(end, 'year'), 'day')) return formatDate(start, 'YYYY')
          return `${formatDate(start, 'D MMM')} - ${formatDate(end, this.displayFormat)}`
        } else return `${formatDate(start, this.displayFormat)} - ${formatDate(end, this.displayFormat)}`
      }
    },
    displayDate () {
      if (!this.start || !this.end) return null
      else return this.getReadableFormat(extractDate(this.start, dateFormat), extractDate(this.end, dateFormat))
    },
    displayPrevDate () {
      if (!this.prev_start || !this.prev_end) return null
      else return this.getReadableFormat(extractDate(this.prev_start, dateFormat), extractDate(this.prev_end, dateFormat))
    }
  },

  watch: {
    choise (choise) {
      if (choise !== 'custom') this.last_choise = choise
      if (this.dates.findIndex(({ value }) => value === choise) !== -1) {
        const { start, end } = this.dates.find(({ value }) => value === choise)
        this.start = formatDate(start, dateFormat)
        this.end = formatDate(end, dateFormat)
      }
      if (this.comparing && this.prev_dates.findIndex(({ value }) => value === choise) !== -1) {
        const { start, end } = this.prev_dates.find(({ value }) => value === choise)
        this.prev_start = formatDate(start, dateFormat)
        this.prev_end = formatDate(end, dateFormat)
      }
      if (!this.comparing && choise !== 'custom') this.emitInput()
    },
    compare_choise () { this.updatePrev() },
    comparing (needCompute) { if (needCompute) this.updatePrev() },
    start () {
      this.choise = this.getChoiseFromDate && this.getChoiseFromDate.value ? this.getChoiseFromDate.value : 'custom'
      this.updatePrev()
      this.move()
    },
    end () {
      this.choise = this.getChoiseFromDate && this.getChoiseFromDate.value ? this.getChoiseFromDate.value : 'custom'
      this.updatePrev()
    }
  },

  methods: {
    refresh () {
      this.start = this.value.start
      this.end = this.value.end
      this.prev_start = this.value.prev_start
      this.prev_end = this.value.prev_end
    },
    async move () {
      const ref = this.$refs.datePicker
      if (ref) {
        const from = extractDate(this.prev_end, dateFormat)
        const to = extractDate(this.end, dateFormat)
        await ref.$refs.calendar.showPageRange({ from, to })
      }
    },
    prev (emit = true) {
      const diff = this.getPeriodFromChoise
      this.start = formatDate(addToDate(this.start, diff), dateFormat)
      this.end = Object.keys(diff).includes('month')
        ? formatDate(endOfDate(addToDate(this.end, diff), 'month'), dateFormat)
        : formatDate(addToDate(this.end, diff), dateFormat)
      if (this.comparing) {
        this.prev_start = formatDate(addToDate(this.prev_start, diff), dateFormat)
        this.prev_end = Object.keys(diff).includes('month')
          ? formatDate(endOfDate(addToDate(this.prev_end, diff), 'month'), dateFormat)
          : formatDate(addToDate(this.prev_end, diff), dateFormat)
      }
      if (emit) this.emitInput()
    },
    next (emit) {
      const diff = this.getPeriodFromChoise
      this.start = formatDate(subtractFromDate(this.start, diff), dateFormat)
      this.end = Object.keys(diff).includes('month')
        ? formatDate(endOfDate(subtractFromDate(this.end, diff), 'month'), dateFormat)
        : formatDate(subtractFromDate(this.end, diff), dateFormat)
      if (this.comparing) {
        this.prev_start = formatDate(subtractFromDate(this.prev_start, diff), dateFormat)
        this.prev_end = Object.keys(diff).includes('month')
          ? formatDate(endOfDate(subtractFromDate(this.prev_end, diff), 'month'), dateFormat)
          : formatDate(subtractFromDate(this.prev_end, diff), dateFormat)
      }
      if (emit) this.emitInput()
    },
    cancel () {
      this.refresh()
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
          this.prev_start = formatDate(start, dateFormat)
          this.prev_end = formatDate(end, dateFormat)
        } else {
          // se non è uno dei periodi rifletto a specchio
          const end = subtractFromDate(this.start, { days: 1 }),
            start = subtractFromDate(this.start, { days: this.getDayDiff + 1 })
          this.prev_start = formatDate(start, dateFormat)
          this.prev_end = formatDate(end, dateFormat)
        }
      } else if (this.compare_choise === 'prev_year') {
        const start = subtractFromDate(this.start, { year: 1 }),
          end = subtractFromDate(this.end, { year: 1 })
        this.prev_start = formatDate(start, dateFormat)
        this.prev_end = formatDate(end, dateFormat)
      }
    },
    updatePrevChoises () {
      // fa parte dei periodi?
      if (this.getCompareChoiseFromDate) this.compare_choise = 'prev_period'

      // è l'anno precedente?
      else if (this.prev_start === formatDate(subtractFromDate(this.start, { year: 1 }), dateFormat) &&
        this.prev_end === formatDate(subtractFromDate(this.end, { year: 1 }), dateFormat)) this.compare_choise = 'prev_year'

      // è il periodo specchiato?
      else if (this.prev_start === formatDate(subtractFromDate(this.start, { days: this.getDayDiff + 1 }), dateFormat) &&
        this.prev_end === formatDate(subtractFromDate(this.start, { days: 1 }), dateFormat)) this.compare_choise = 'prev_period'

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

.custom-calendar >>>
  .vc-grid-cell
    .on-left
      margin-right 0

    .on-right
      margin-left 0

  .vc-container
    border-style none

  .vc-weeks
    padding 0
</style>

/**
 * Quasar App Extension uninstall script
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/UninstallAPI.js
 */

module.exports = function (api) {
  api.removePath('src/boot/q-date-filter.js')

  api.onExitLog('Thanks for having used my extension!')
}

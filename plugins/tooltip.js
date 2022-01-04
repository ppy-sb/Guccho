import Vue from 'vue'
import {
  // Directives
  VTooltip,
  VClosePopper,
  // Components
  Dropdown,
  Tooltip,
  Menu
} from 'v-tooltip'

Vue.directive('tooltip', VTooltip)
Vue.directive('close-popper', VClosePopper)

Vue.component('VDropdown', Dropdown)
Vue.component('VTooltip', Tooltip)
Vue.component('VMenu', Menu)

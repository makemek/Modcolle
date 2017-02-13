/* Depends on http://203.104.209.7/gadget/js/kcs_const.js */
/* global MaintenanceInfo */

'use strict'

const timer = {
  day: document.getElementById('day'),
  hour: document.getElementById('hour'),
  minute: document.getElementById('minute'),
  second: document.getElementById('second')
}
const maintenanceNotice = document.getElementById('maintenance-timer')
const state = document.getElementById('maintenance-state')

maintenanceCheck()

function maintenanceCheck() {
  const now = Date.now()
  const willMaintenacne = now <= MaintenanceInfo.StartDateTime
  const onMaintenance = now > MaintenanceInfo.StartDateTime && now < MaintenanceInfo.EndDateTime
  let remaining = 0

  if(willMaintenacne) {
    remaining = MaintenanceInfo.StartDateTime - now
    state.innerHTML = 'begins'
  } else if(onMaintenance) {
    remaining = MaintenanceInfo.EndDateTime - now
    state.innerHTML = 'ends'
  } else {
    maintenanceNotice.style.display = 'none'
    return
  }

  maintenanceNotice.style.display = 'block'
  tick(remaining)
  setTimeout(maintenanceCheck, 1000)
}

function tick(timeRemaining) {
  timer.day.innerHTML = Math.floor(timeRemaining / (1000 * 60 * 60 * 24))
  timer.hour.innerHTML = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  timer.minute.innerHTML = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
  timer.second.innerHTML = Math.floor((timeRemaining % (1000 * 60)) / 1000)
}

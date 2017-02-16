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

maintenanceCheck()

function maintenanceCheck() {
  const now = Date.now()
  const onMaintenance = now > MaintenanceInfo.StartDateTime && now < MaintenanceInfo.EndDateTime
  if(onMaintenance) {
    const remaining = MaintenanceInfo.EndDateTime - now
    maintenanceNotice.style.display = 'block'
    tick(remaining)
    setTimeout(maintenanceCheck, 1000)
    return
  }
  maintenanceNotice.style.display = 'none'
}

function tick(timeRemaining) {
  timer.day.innerHTML = Math.floor(timeRemaining / (1000 * 60 * 60 * 24))
  timer.hour.innerHTML = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  timer.minute.innerHTML = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
  timer.second.innerHTML = Math.floor((timeRemaining % (1000 * 60)) / 1000)
}

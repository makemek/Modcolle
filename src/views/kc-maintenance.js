var timer_day = document.getElementById('day')
var timer_hour = document.getElementById('hour')
var timer_minute = document.getElementById('minute')
var timer_second = document.getElementById('second')
var maintenanceNotice = document.getElementById('maintenance-timer')

maintenanceCheck()

function maintenanceCheck() {
  var now = Date.now()
  var onMaintenance = now > MaintenanceInfo.StartDateTime && now < MaintenanceInfo.EndDateTime
  if(onMaintenance) {
    var remaining = MaintenanceInfo.EndDateTime - now
    maintenanceNotice.style.display = 'block'
    tick(remaining)
    setTimeout(maintenanceCheck, 1000)
    return
  }
  maintenanceNotice.style.display = 'none'
}

function tick(timeRemaining) {
  var days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24))
  var hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  var minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
  var seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)

  timer_day.innerHTML = days
  timer_hour.innerHTML = hours
  timer_minute.innerHTML = minutes
  timer_second.innerHTML = seconds
}
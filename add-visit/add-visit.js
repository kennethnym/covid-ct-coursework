'use strict'

/**
 * A reference to the location map on the page.
 * @type {HTMLImageElement}
 */
const locationMap = document.getElementById('location-map')

/**
 * A reference to the marker that marks the selected location on the map.
 * @type {HTMLImageElement}
 */
const locationMarker = document.getElementById('location-marker')

/**
 * A reference to the form that lets user add a new visit.
 * @type {HTMLFormElement}
 */
const addVisitForm = document.getElementById('add-visit-form')

/** @type {HTMLButtonElement} */
const addVisitButton = document.getElementById('add-visit-btn')

/** @type {HTMLButtonElement} */
const cancelAddVisitButton = document.getElementById('cancel-add-visit-btn')

const FIELDS = {
  date: 'date',
  time: 'time',
  duration: 'duration',
  visitDate: 'visitDate',
  locationX: 'x',
  locationY: 'y',
}

/**
 * The x, y coordinate of the visit on the map picked by the user. Stored as a tuple.
 * @type {number[]}
 */
let visitLocation = null

function toggleButtons({ disabled }) {
  addVisitButton.disabled = disabled
  cancelAddVisitButton.disabled = disabled
}

/**
 * Sets the location of the visit. Called when user clicks on the location map.
 * @param {MouseEvent} event The mouse event raised by clicking on the map.
 */
function setLocationCoordinate(event) {
  const rect = event.currentTarget.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  locationMarker.classList.remove('hidden')
  locationMarker.style.left = `${x - 8}px`
  locationMarker.style.top = `${y - 16}px`

  visitLocation = [x, y]
}

/**
 * Validates the form the user has submitted
 * @param {FormData} form The form the user has submitted.
 * @returns {Boolean} Whether the form is valid.
 */
function validateForm(form) {
  console.log(visitLocation)
  if (visitLocation == null) return false

  const { visitDate, locationX, locationY, ...requiredFields } = FIELDS
  const missingField = findMissingField(form, requiredFields)

  console.log(missingField);

  if (missingField) return false

  /** @type {String} */
  const submittedDateString = form.get(FIELDS.date)
  const submittedTimeString = form.get(FIELDS.time)

  const [year, month, date] = submittedDateString.split('-')
  const [hour, minute] = submittedTimeString.split('-')

  const submittedDate = new Date(year, month - 1, date, hour, minute, 0, 0)

  if (!isDateValid(submittedDate)) {
    new Notification({
      title: 'The date you submitted is invalid!',
      message: 'Please make sure the date and time you put in is correct.',
      level: NOTIFICATION_ERROR,
    })
  }

  if (submittedDate > new Date()) {
    new Notification({
      title: 'The visit data must be in the past!',
      message: 'The date of visit must be in the past (obviously).',
      level: NOTIFICATION_ERROR,
    }).show()

    return false
  }

  form.delete(FIELDS.date)
  form.delete(FIELDS.time)
  // sends the submitted date as a unix timestamp
  // javascript returns timestamp in milliseconds, so it has to be divided by 1000
  form.set(FIELDS.visitDate, Math.floor(submittedDate.getTime() / 1000))

  const [x, y] = visitLocation
  form.set(FIELDS.locationX, x)
  form.set(FIELDS.locationY, y)

  return true
}

/**
 * called when a form submission is made.
 * @param {Event} event The associated submit event
 */
function handleFormSubmission(event) {
  event.preventDefault()
  toggleButtons({ disabled: true })

  const submittedForm = new FormData(addVisitForm)
  const isFormValid = validateForm(submittedForm)

  if (isFormValid) {
    new Request({
      method: 'POST',
      url: '/locations',
      form: submittedForm,
    })
      .addListener(addVisitRequestResultListener)
      .send()
  }
}

function addVisitRequestResultListener() {
  toggleButtons({ disabled: false })

  switch (this.status) {
    case 500:
      new Notification({
        title: 'An error occurred when trying to add your visit details.',
        message: 'Please try again later.',
        level: NOTIFICATION_ERROR,
      }).show()
      break

    case 200:
      new Notification({
        title: 'Your visit details has been recorded successfully.',
        message: 'You can continue to register more visits.',
        level: NOTIFICATION_SUCCESS,
      }).show()
      addVisitForm.reset()
      break

    default:
      break
  }
}

locationMap.addEventListener('click', setLocationCoordinate)
addVisitForm.addEventListener('submit', handleFormSubmission)

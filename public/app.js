/* global fetch, io */

const getMsgEl = (origin, msg) => {
  if (origin === 'customer') {
    return parseHtml(`<div class='request customer'>${msg}</div>`)
  }
  if (origin === 'rep') {
    return parseHtml(`<div class='response rep'>${msg}</div>`)
  }
  if (origin === 'bot') {
    return parseHtml(`<div class='response bot'>${msg}</div>`)
  }

  return ''
}

const webhook = (id, origin, msg) => {
  const muteBot = document.querySelector(`#mute-${id}`).checked
  fetch('/api/message', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      threadId: id,
      origin,
      msg,
      muteBot
    })
  })
  .then(res => res.json())
  .then(data => console.log(data))
}

function parseHtml (str) {
  var parser = new window.DOMParser()
  var doc = parser.parseFromString(str, 'text/html')
  return doc.body.firstChild
}

function addToThread (id, origin, msg) {
  const selector = `#convo-${id} .messages`
  const messageBox = document.querySelector(selector)
  const messageEl = getMsgEl(origin, msg)
  messageBox.appendChild(messageEl)
}

const smsFormsArray = [...document.querySelectorAll('.sms-input form')]
smsFormsArray.forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const msg = event.target.querySelector('input').value
    event.target.querySelector('input').value = ''
    const id = event.target.parentNode.id.split('-')[1]
    addToThread(id, 'customer', msg)
    webhook(id, 'customer', msg)
  })
})

const repFormsArray = [...document.querySelectorAll('.conversation form')]
repFormsArray.forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const msg = event.target.querySelector('input').value
    event.target.querySelector('input').value = ''
    const id = event.target.parentNode.id.split('-')[1]
    addToThread(id, 'rep', msg)
    webhook(id, 'rep', msg)
  })
})

const socket = io()

socket.on('bot message', ({id, msg}) => {
  addToThread(id, 'bot', msg)
})

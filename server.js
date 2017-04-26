require('dotenv').config()
var express = require('express')
var bodyParser = require('body-parser')
var path = require('path')

var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)

var fetch = require('node-fetch')
const {BOT_ENDPOINT} = process.env

// app.use(express.static('public'))

app.get('/', function (req, res) {
  res.sendFile(path.resolve(__dirname, 'public/index.html'))
})
app.get('/app.js', function (req, res) {
  res.sendFile(path.resolve(__dirname, 'public/app.js'))
})

app.get('/styles.css', function (req, res) {
  res.sendFile(path.resolve(__dirname, 'public/styles.css'))
})

app.use(bodyParser.json())

app.post('/api/message', ({body}, res, next) => {
  const {msg, muteBot, threadId, origin} = body

  const payload = {
    'customerId': '148332',
    'customerThreadId': threadId, // 'foo', 'bar', or 'baz'
    'messageTimestamp': Date.now(),
    'employeeUserId': 7889,
    'messageId': 4683951,
    'messageBody': msg,
    'businessId': 907,
    'messageAttachmentName': null,
    'messageAttachmentContentType': null,
    'messageAttachmentUUID': null,
    'messageAttachmentContentLength': null,
    'fromCustomer': origin === 'customer',
    'messageExternalId': null,
    'invisible': false,
    muteBot,
    'customerType': 'prospect'
  }

  console.log(payload)

  if (!BOT_ENDPOINT) {
    console.log('add BOT_ENDPOINT')
    return
  }

  console.log('BOTENDPOINT:', BOT_ENDPOINT)

  fetch(BOT_ENDPOINT, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => console.log('got from the bot', data))

  res.json({'message': 'ok'})
})

app.post('/api/send-message-to-customer-thread', (request, response, next) => {
  const body = request.body
  const token = request.get('token')
  if (token !== 'abc') {
    response.json({message: 'wrong token'})
    return
  }
  const {customerThreadId, text} = body
  io.emit('bot message', {id: customerThreadId, msg: text})
  console.log('got a message from bot')
  response.json({'message': 'done'})
})

http.listen(8090, function () {
  console.log('Example app listening on port 8090!')
})

io.on('connection', function (socket) {
  console.log('a user connected')
})

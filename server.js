var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
mongoose.Promise = Promise

var dbUrl = 'mongodb+srv://user:user@node-learning.xrvkj.mongodb.net/Node-Learning?retryWrites=true&w=majority'

var Message = mongoose.model('Message', {
    name: String,
    message: String
})

app.get('/messages', (req, res) =>{
    Message.find({}, (err, messages) => { 
        res.send(messages)
    })
    
})

app.post('/messages', async (req, res) =>{

    try {
        var message = new Message(req.body)
        var savedMessage = await message.save()
        console.log('Saving')  
        var censored = await Message.findOne({message: 'badword'})
        if(censored) 
            await Message.deleteOne({_id: censored.id})
        else
            io.emit('message', req.body)
        
        res.sendStatus(200)

    } catch(error) {
        res.sendStatus(500)
        return console.error(error)

    } finally {
        console.log('Done')

    }
})


io.on('connection', (socket) => {

})

mongoose.connect(dbUrl, {useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
    console.log("MongoDB conected..")
}).catch(err => console.log(err))

var server = http.listen(process.env.port, () => {
    console.log('server is listening on port', server.address().port)
})
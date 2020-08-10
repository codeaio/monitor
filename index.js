var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    })

    socket.on('start', () => {
        const { spawn } = require('child_process');

        const frontpage = spawn('npm', ['start', '--prefix', '../frontpage']);
        frontpage.stdout.on('data', (data) => {
            io.emit('frontpage', data.toString());
        });

        const client = spawn('npm', ['start', '--prefix', '../client']);
        client.stdout.on('data', (data) => {
            io.emit('client', data.toString());
        });

        const api = spawn('npm', ['start', '--prefix', '../api']);
        api.stdout.on('data', (data) => {
            io.emit('api', data.toString());
        });

        const worker = spawn('python3', ['../worker/server.py']);
        worker.stdout.on('data', (data) => {
            io.emit('worker', data.toString());
        });

        worker.stderr.on('data', (data) => {
            io.emit('worker', data.toString());
        })

        socket.on('stop', () => {
            frontpage.kill();
            client.kill();
            api.kill();
            worker.kill();

            io.emit('stopped', '');
        })
    })
})

http.listen(3001, () => {
    console.log('listening on *:3001')
})
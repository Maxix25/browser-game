import express from 'express';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';

// Initialize server and socket.io
const app = express();
const serv = http.Server(app);
const io = new Server(serv)
const PORT = process.env.PORT || 3000
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const SOCKET_LIST = {}; // Create socket list
const PLAYER_LIST = {}; // Create player's list
const Player = (id) => {
    const self = {
        x:250,
        y:250,
        id:id,
        number:Math.floor(Math.random() * 10),
        pressingUp: false,
        pressingDown: false,
        pressingRight: false,
        pressingLeft: false,
        maxSpd: 10
    }
    self.updatePosition = () => {
        if (self.pressingUp){
            self.y -= self.maxSpd;
        }
        if (self.pressingDown){
            self.y += self.maxSpd;
        }
        if (self.pressingRight){
            self.x += self.maxSpd;
        }
        if (self.pressingLeft){
            self.x -= self.maxSpd;
        }
    }
    return self;
}


app.get("/", (req, res) => {
    res.sendFile(__dirname + "/client/index.html");
});

app.use("/client", express.static(__dirname + "/client"));
io.sockets.on("connection", (socket) => {
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket // Pushing the socket to the socket list
    const player = Player(socket.id);
    PLAYER_LIST[socket.id] = player
    console.log("Someone connected!");
    socket.on("disconnect", () =>{
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[socket.id];
    });
    socket.on("keyPress", (key) => {
        console.log(`The key pressed is ${key.inputId} and the state is ${key.state}`)
        switch (key.inputId)
        {
            case "Up":
                player.pressingUp = key.state;
                break;
            case "Down":
                player.pressingDown = key.state;
                break;
            case "Left":
                player.pressingLeft = key.state;
                break;
            case "Right":
                player.pressingRight = key.state;
                break;
        }
    })
});

setInterval(function (){
    let pack = [];
    for(let i in PLAYER_LIST){
        let player = PLAYER_LIST[i]
        player.updatePosition()
        pack.push({
            x: player.x,
            y: player.y,
            number: player.number
        });
    }
    for(let i in SOCKET_LIST){
        let socket = SOCKET_LIST[i]
        socket.emit("newPositions", pack)
    }
}, 1000/25)

serv.listen(PORT, () => {
    console.log(`Listening on port ${PORT}!`); // Listen on http://localhost:PORT
});
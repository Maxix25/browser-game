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
const DEBUG = true;

const Entity = () => {
    const self = {
        x: 250,
        y: 250,
        spdX: 0,
        spdY: 0,
        id: ""
    }
    self.update = () => {
        self.updatePosition();
    }
    self.updatePosition = () => {
        self.x += self.spdX;
        self.y += self.spdY;
    }
    return self;
}

const Player = (id) => {
    const self = Entity();
    const maxSpd = 10;
    const super_update = self.update
    self.id = id;
    self.number = "" + Math.floor(10 * Math.random());
    self.pressingRight = false;
    self.pressingLeft = false;
    self.pressingUp = false;
    self.pressingDown = false;
    self.update = () => {
        self.updateSpd();
        super_update();
    }
    self.updateSpd = () => {
        if (self.pressingUp)
        {
            self.spdY = -maxSpd;
        }
        else if (self.pressingDown)
        {
            self.spdY = maxSpd;
        }
        else
        {
            self.spdY = 0
        }
        if (self.pressingRight)
        {
            self.spdX = maxSpd;
        }
        else if (self.pressingLeft)
        {
            self.spdX = -maxSpd;
        }
        else
        {
            self.spdX = 0
        }
    }
    Player.list[id] = self;
    return self;
}

const Bullet = (angle) => {
    const self = Entity();
    self.id = Math.random();
    self.spdX = Math.cos(angle/180*Math.PI) * 10;
    self.spdY = Math.sin(angle/180*Math.PI) * 10;
    self.timer = 0;
    self.toRemove = false;
    const super_update = self.update;
    self.update = () => {
        if (self.timer++ > 100)
        {
            self.toRemove = true;
        }
        super_update();
    
    }
    Bullet.list[self.id] = self;
    return self;
}

Player.list = {};
Bullet.list = {};
Player.onConnect = (socket) => {
    const player = Player(socket.id)
    socket.on("keyPress", (key) => {
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
    });
}

Player.onDisconnect = (socket) => {
    delete Player.list[socket.id]
}

Bullet.update = () => {
    if (Math.random() < 0.1){
        Bullet(Math.random() * 360);
    }
    let pack = [];
    for(let i in Bullet.list){
        let bullet = Bullet.list[i]
        bullet.update()
        pack.push({
            x: bullet.x,
            y: bullet.y
        });
    }
    return pack;
}


Player.update = () => {
    let pack = [];
    for(let i in Player.list){
        let player = Player.list[i]
        player.update()
        pack.push({
            x: player.x,
            y: player.y,
            number: player.number
        });
    }
    return pack;
}


app.get("/", (req, res) => {
    res.sendFile(__dirname + "/client/index.html");
});


app.use("/client", express.static(__dirname + "/client"));

io.sockets.on("connection", (socket) => {
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket // Pushing the socket to the socket list
    Player.onConnect(socket);
    console.log("Someone connected!");
    socket.on("disconnect", () =>{
        delete SOCKET_LIST[socket.id];
        Player.onDisconnect(socket);
    });
    socket.on("sendMsgToServer", (data) => {
        const playerName = ("" + socket.id).slice(2, 7);
        for (let i in SOCKET_LIST){
            SOCKET_LIST[i].emit("addToChat", playerName + ":" + data);
        }
    });
    socket.on('evalServer', (data) => {
        if (!DEBUG){
            return;
        }
        const res = eval(data);
        socket.emit("evalAnswer", res);
    })

});

setInterval(function (){
    let pack = {
        player: Player.update(),
        bullet: Bullet.update()
    }
    for(let i in SOCKET_LIST){
        let socket = SOCKET_LIST[i]
        socket.emit("newPositions", pack)
    }
}, 1000/25)

serv.listen(PORT, () => {
    console.log(`Listening on port ${PORT}!`); // Listen on http://localhost:PORT
});
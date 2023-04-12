
const socket = io();
const ctx = document.getElementById("ctx").getContext("2d");
const chatText = document.getElementById("chat-text");
const chatInput = document.getElementById("chat-input");
const chatForm = document.getElementById("chat-form");
ctx.font = "30px Arial";
socket.on("newPositions", (data) => {
    ctx.clearRect(0,0,800,500);
    for(let i = 0; i < data.player.length; i++){
        ctx.fillText(data.player[i].number, data.player[i].x, data.player[i].y);
    }
    for(let i = 0; i < data.bullet.length; i++){
        ctx.fillRect(data.bullet[i].x-5, data.bullet[i].y-5, 10, 10);
    }
});

socket.on("addToChat", (data) => {
    chatText.innerHTML += "<div>" + data + "</div>";
});

socket.on('evalAnswer', (data) => {
    console.log(data);
})

chatForm.onsubmit = (e) => {
    e.preventDefault();
    if (chatInput.value[0] === '/')
    {
        socket.emit('evalServer', chatInput.value.slice(1));
    }
    else
    {
        socket.emit("sendMsgToServer", chatInput.value);
    }
    chatInput.value = '';
}

document.onkeydown = (event) => {
    switch (event.key)
    {
        case "w":
            socket.emit("keyPress", {inputId: "Up", state: true});
            break;
        case "s":
            socket.emit("keyPress", {inputId: "Down", state: true});
            break;
        case "a":
            socket.emit("keyPress", {inputId: "Left", state: true});
            break;
        case "d":
            socket.emit("keyPress", {inputId: "Right", state: true});
    }
}
document.onkeyup = (event) => {
    switch (event.key)
    {
        case "w":
            socket.emit("keyPress", {inputId: "Up", state: false});
            break;
        case "s":
            socket.emit("keyPress", {inputId: "Down", state: false});
            break;
        case "a":
            socket.emit("keyPress", {inputId: "Left", state: false});
            break;
        case "d":
            socket.emit("keyPress", {inputId: "Right", state: false});
            break;
    }
}
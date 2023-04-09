const socket = io();
const ctx = document.getElementById("ctx").getContext("2d");
ctx.font = "30px Arial";
socket.on("newPositions", (data) => {
    ctx.clearRect(0,0,800,500);
    for(let i = 0; i < data.length; i++){
        ctx.fillText(data[i].number, data[i].x, data[i].y);
    }
});

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
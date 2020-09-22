const {
    v4: uuidv4
} = require('uuid');
const express = require("express");
const app = express();
const serv = require("http").Server(app);

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});
app.use("/", express.static(__dirname));

serv.listen(2000);
console.log("Server started");

var SOCKET_LIST = {};

var io = require("socket.io")
    (serv, {});

function Player(id) {
    this.id = id;

    Player.list[id] = this;
}
Player.list = {};

function Line(x1, y1, x2, y2, color, size = 1) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.size = size;
    this.color = color;

    Line.list.push(this);
}
Line.list = [];

io.sockets.on("connection", function (socket) {
    socket.id = uuidv4();
    SOCKET_LIST[socket.id] = socket;
    new Player(socket.id);

    console.log("Player with id: " + socket.id + " connected.");
    if (Line.list.length > 0) {
        let pack = [];
        for (const key in Line.list) {
            const line = Line.list[key];
            pack.push({
                x1: line.x1,
                y1: line.y1,
                x2: line.x2,
                y2: line.y2,
                size: line.size,
                color: line.color,
            });
        }
        socket.emit("load", pack);
    }

    socket.on("clientLines", function (line) {
        new Line(line.x1, line.y1, line.x2, line.y2, line.color, line.size > 0 && line.size < 51 ? line.size : 1);
        socket.broadcast.emit("serverLines", {
            x1: line.x1,
            y1: line.y1,
            x2: line.x2,
            y2: line.y2,
            size: line.size,
            color: line.color
        });
    });

    socket.on("disconnect", function () {
        delete SOCKET_LIST[socket.id];
        delete Player.list[socket.id];
        console.log("Player with id: " + socket.id + " disconnected.");
    });

    socket.on("clear", function () {
        if (Line.list.length > 0) {
            Line.list = [];
            socket.broadcast.emit("clear");
            console.log("Player with id: " + socket.id + " cleared the canvas.");
        }
    });

    socket.on("requestBoard", function () {
        if (Line.list.length > 0) {
            let pack = [];
            for (const key in Line.list) {
                const line = Line.list[key];
                pack.push({
                    x1: line.x1,
                    y1: line.y1,
                    x2: line.x2,
                    y2: line.y2,
                    size: line.size,
                    color: line.color,
                });
            }
            socket.emit("load", pack);
        };
    });
});
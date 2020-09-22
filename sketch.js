const socket = io();
let button;
let size = 1;
let mDown = false;
let canvasChanged = false;

function setup() {
    createCanvas(windowWidth - 10, windowHeight - 10);
    background(0);

    socket.on("load", function (lines) {
        for (let i = 0; i < lines.length; i++) {
            drawLine(lines[i]);
        }
    });

    socket.on("serverLines", function (line) {
        drawLine(line);
    });

    socket.on("clear", function () {
        background(0);
    });
}

function draw() {
    textSize(18);
    fill(0, 255, 0);
    text('esc -> clear', 25, 25);

    push();
    circle(mouseX, mouseY, 299);
    //clear();
    pop();

    if (mouseIsPressed || mDown) {
        socket.emit('clientLines', {
            x1: mouseX,
            y1: mouseY,
            x2: pmouseX,
            y2: pmouseY,
            size: size
        });
    }

    if (canvasChanged) {
        socket.emit('requestBoard');
        canvasChanged = false;
    }
}

function mouseWheel(event) {
    if (event.delta > 0) {
        size <= 1 ? size = 1 : size--;
    } else {
        size >= 50 ? size = 50 : size++;
    }
}

function drawLine(l) {
    push();
    stroke(l.color.r, l.color.g, l.color.b);
    strokeWeight(l.size)
    line(l.x1, l.y1, l.x2, l.y2);
    pop();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    canvasChanged = true;
    background(0);
}

function clearCanvas() {
    background(0);
    socket.emit('clear');
}

function keyPressed() {
    num = keyCode;
    if (num === 27)
        clearCanvas();
}

// function mousePressed() {
//     mDown = true;
// }

// function mouseReleased() {
//     mDown = false;
// }

function touchStarted(event) {
    mDown = true;
}

function touchEnded(event) {
    mDown = false;
}
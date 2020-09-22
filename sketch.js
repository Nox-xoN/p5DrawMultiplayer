const socket = io();
let canvas;
let size = 1;
let mDown = false;
let canvasChanged = false;

let cSatSlider;
let cBrigSlider;
let cBrightness = 100;
let cSaturation = 100;
let color = {};
let lColor = {};
let erase = false;

let cursorC;

function setup() {
    cursorC = document.getElementById('cursorCircle');
    document.addEventListener('mousemove', function (event) {
        var x = event.clientX;
        var y = event.clientY;
        cursorC.style.left = x + "px";
        cursorC.style.top = y + "px";
    });

    canvas = createCanvas(windowWidth, windowHeight);
    cSatSlider = createSlider(0, 100, 100);
    cBrigSlider = createSlider(0, 100, 100);
    cSatSlider.input(changeSaturation);
    cBrigSlider.input(changeBrightness);
    cSatSlider.position(10, windowHeight - 80);
    cBrigSlider.position(10, windowHeight - 60);
    background(0);
    changeColor("RANDOM");

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
    drawInfo();
    drawColorSpectrum();
    drawMouse();

    if (canvasChanged) {
        background(0);
        cSatSlider.position(10, windowHeight - 100);
        cBrigSlider.position(10, windowHeight - 80);
        socket.emit('requestBoard');
        canvasChanged = false;
    }
}

function mouseWheel(event) {
    if (event.delta > 0) {
        size <= 2 ? size = 1 : size = size - 2;
    } else {
        size >= 49 ? size = 50 : size = size + 2;
    }
    cursorC.style.height = size + "px";
    cursorC.style.width = size + "px";
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
}

function clearCanvas() {
    background(0);
    socket.emit('clear');
}

function keyPressed() {
    num = keyCode;
    if (num === 27) { //esc
        let r = confirm("Are you sure you want to CLEAR the canvas for EVERYONE?");
        if (r) {
            clearCanvas();
        }
    } else if (num === 80) { //p
        saveCanvas("drawing", "png")
    }
}

function touchStarted(event) {
    mDown = true;
}

function touchEnded(event) {
    mDown = false;
}

function drawColorSpectrum() {
    push();
    colorMode(HSB);
    for (var x = 0; x < windowWidth; x = x + 20) {
        fill(x / windowWidth * 360, cSaturation, cBrightness, 1);
        strokeWeight(0)
        rect(x, height - 30, windowWidth, 30)
    }
    pop();
}

function changeSaturation() {
    cSaturation = cSatSlider.value();
}

function changeBrightness() {
    cBrightness = cBrigSlider.value();
}

function mouseClicked() {
    if (mouseY > windowHeight - 30 && mouseY < windowHeight) {
        changeColor();
    }
}

function changeColor(MODE) {

    switch (MODE) {
        case "BLACK":
            color = {
                r: 0,
                g: 0,
                b: 0,
            }
            break;
        case "RANDOM":
            color = {
                r: Math.floor(Math.random() * 255),
                g: Math.floor(Math.random() * 255),
                b: Math.floor(Math.random() * 255)
            }
            break;
        case "OLD":
            color = lColor;
            break;
        default:
            let c = get(mouseX, mouseY);
            color = {
                r: c[0],
                g: c[1],
                b: c[2],
            }
            break;
    }
    cursorC.style.border = "solid 2px rgb(" + color.r + "," + color.g + "," + color.b + ")";
}

function drawMouse() {
    if ((mouseIsPressed || mDown) && mouseY < windowHeight - 30) {

        if (mouseButton === LEFT) {
            if (erase) {
                changeColor("OLD");
                erase = false;
            }
        } else if (mouseButton === RIGHT && !erase) {
            lColor = color;
            changeColor("BLACK")
            erase = true;
        }
        socket.emit('clientLines', {
            x1: mouseX,
            y1: mouseY,
            x2: pmouseX,
            y2: pmouseY,
            size: size,
            color: color,
        });
    } else if (!mouseIsPressed && erase) {
        changeColor("OLD");
        erase = false;
    }
}

function drawInfo() {
    push();
    stroke("blue");
    strokeWeight(1);
    textSize(20);
    fill("white");
    textFont('Helvetica');
    text('Left Click : Draw', 20, 30);
    text('Right Click : Erase', 20, 60);
    text('Mouse Wheel : Thickness', 20, 90);
    text('P Key : Save Canvas', 20, 120);
    text('Esc : clear', 20, 150);
    pop();
}
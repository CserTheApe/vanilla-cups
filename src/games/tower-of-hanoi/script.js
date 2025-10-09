const RINGS = [
    {
        halfWidth: 180,
        color: "#FFADAD",
    },
    {
        halfWidth: 160,
        color: "#ffd6a5",
    },
    {
        halfWidth: 140,
        color: "#fdffb6",
    },
    {
        halfWidth: 120,
        color: "#caffbf",
    },
    {
        halfWidth: 100,
        color: "#9bf6ff",
    },
    {
        halfWidth: 80,
        color: "#a0c4ff",
    },
    {
        halfWidth: 60,
        color: "#bdb2ff",
    },
    {
        halfWidth: 40,
        color: "#ffc6ff",
    },
];
const FRAME_X = [320, 800, 1280];
let ringCount = document.getElementById("ring-select").value;
let selections = [RINGS.slice(0, ringCount), [], []];
let movingRing = null;
let prevFrame = null;
let moves = 0;
let perfectMoves = Math.pow(2, ringCount) - 1;
let gameEnd = false;

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
ctx.lineWidth = 4;

document.getElementById("ring-select").addEventListener("change", function (e) {
    ringCount = Number(e.target.value);
    initGame();
});

canvas.addEventListener("mousedown", function (e) {
    if (gameEnd) return;
    const relX = (e.offsetX * e.target.width) / e.target.offsetWidth;
    const relY = (e.offsetY * e.target.height) / e.target.offsetHeight;
    const response = checkMouseOverRing(relX, relY);
    if (response) {
        movingRing = response[0];
        const fIndex = response[1];
        prevFrame = fIndex;
        selections[fIndex] = selections[fIndex].slice(
            0,
            selections[fIndex].length - 1
        );
    }
});
canvas.addEventListener("mousemove", function (e) {
    if (gameEnd) return;
    const relX = (e.offsetX * e.target.width) / e.target.offsetWidth;
    const relY = (e.offsetY * e.target.height) / e.target.offsetHeight;
    if (movingRing) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawFrames();
        drawRings();
        drawRing(movingRing, relX, relY + 25);
    } else {
        const response = checkMouseOverRing(relX, relY);
        if (response) {
            e.target.style.cursor = "pointer";
        } else {
            e.target.style.cursor = "default";
        }
    }
});
canvas.addEventListener("mouseup", function (e) {
    const relX = (e.offsetX * e.target.width) / e.target.offsetWidth;
    const relY = (e.offsetY * e.target.height) / e.target.offsetHeight;
    if (movingRing) {
        const response = checkMouseOverFrame(relX, relY);
        if (response && response !== prevFrame) {
            const topRing =
                selections[response][selections[response].length - 1];
            if (!topRing || topRing.halfWidth > movingRing.halfWidth) {
                selections[response] = [...selections[response], movingRing];
                setMoveCount(moves + 1);
                afterMove();
                return;
            }
        }
        selections[prevFrame] = [...selections[prevFrame], movingRing];
        afterMove();
    }
});
canvas.addEventListener("mouseleave", function () {
    if (movingRing) {
        selections[prevFrame] = [...selections[prevFrame], movingRing];
        afterMove();
    }
});

function setMoveCount(num) {
    moves = num;
    if (moves > perfectMoves)
        document.getElementById("move-span").innerText = moves;
    else
        document.getElementById(
            "move-span"
        ).innerText = `${moves}/${perfectMoves}`;
}

function afterMove() {
    movingRing = null;
    prevFrame = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFrames();
    drawRings();
    if (
        selections[0].length === 0 &&
        selections[1].length === 0 &&
        selections[2].length == ringCount
    ) {
        setTimeout(() => createMessageModal(moves === perfectMoves ? "Perfect Score" : "You win"), 500);
        gameEnd = true;
        canvas.style.cursor = "default";
    }
}

function getRingDimensions(frameX, frameY, halfWidth) {
    return [frameX - halfWidth, frameX + halfWidth, frameY - 52, frameY];
}

function checkMouseOverRing(x, y) {
    for (let fIndex in selections) {
        const frameRingCount = selections[fIndex].length;
        if (frameRingCount < 1) continue;
        const ring = selections[fIndex][selections[fIndex].length - 1];
        const [minX, maxX, minY, maxY] = getRingDimensions(
            FRAME_X[fIndex],
            610 - 52 * (frameRingCount - 1),
            ring.halfWidth + 5
        );
        if (x >= minX && x <= maxX && y >= minY && y <= maxY)
            return [ring, fIndex];
    }
    return null;
}

function checkMouseOverFrame(x, y) {
    for (let fIndex in selections) {
        let minX = FRAME_X[fIndex] - 180;
        let maxX = FRAME_X[fIndex] + 180;
        let minY = 150,
            maxY = 610;
        if (x >= minX && x <= maxX && y >= minY && y <= maxY) return fIndex;
    }
    return null;
}

function drawFrame(frameX, frameY) {
    ctx.beginPath();
    ctx.moveTo(frameX - 200, frameY);
    ctx.lineTo(frameX + 200, frameY);
    ctx.lineTo(frameX + 180, frameY - 40);
    ctx.lineTo(frameX + 20, frameY - 40);
    ctx.lineTo(frameX + 20, frameY - 500);
    ctx.lineTo(frameX - 20, frameY - 500);
    ctx.lineTo(frameX - 20, frameY - 40);
    ctx.lineTo(frameX - 180, frameY - 40);
    ctx.lineTo(frameX - 200, frameY);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
}
function drawFrames() {
    ctx.fillStyle = "#6f4a3b";
    for (let fIndex in selections) drawFrame(FRAME_X[fIndex], 650);
}

function drawRing(ring, x, y) {
    ctx.fillStyle = ring.color;
    ctx.beginPath();
    ctx.moveTo(x - ring.halfWidth, y);
    ctx.lineTo(x + ring.halfWidth, y);
    ctx.arc(
        x + ring.halfWidth,
        y - 25,
        25,
        0.5 * Math.PI,
        -0.5 * Math.PI,
        true
    );
    ctx.lineTo(x - ring.halfWidth, y - 50);
    ctx.arc(
        x - ring.halfWidth,
        y - 25,
        25,
        -0.5 * Math.PI,
        0.5 * Math.PI,
        true
    );
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
}

function drawRings() {
    for (let fIndex in selections) {
        let frameX = FRAME_X[fIndex];
        let frameY = 610;
        for (let ring of selections[fIndex]) {
            drawRing(ring, frameX, frameY);
            frameY -= 52;
        }
    }
}

function initGame() {
    selections = [RINGS.slice(0, ringCount), [], []];
    movingRing = null;
    prevFrame = null;
    perfectMoves = Math.pow(2, ringCount) - 1;
    setMoveCount(0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFrames();
    drawRings();
    gameEnd = false;
}

initGame();

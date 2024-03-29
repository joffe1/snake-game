window.onload = function() {
    document.addEventListener('keydown', changeDirection);
    setInterval(loop, 1000 / 60); // 60 FPS
}

var
    canv = document.getElementById('canvas'), // canvas
    ctx = canv.getContext('2d'), // 2d context
    gs = fkp = false, // game started && first key pressed (initialization states)
    speed = baseSpeed = 3, // snake movement speed
    xv = yv = 0, // velocity (x & y)
    px = ~~(canv.width) / 2, // player X position
    py = ~~(canv.height) / 2, // player Y position
    pw = ph = 20, // player size
    aw = ah = 20, // apple size
    apples = [], // apples list
    trail = [], // tail elements list (aka trail)
    tail = 100, // tail size (1 for 10)
    tailSafeZone = 20, // self eating protection for head zone (aka safeZone)
    cooldown = false, // is key in cooldown mode
    score = 0; // current score



// audio
var
    dead = new Audio(),
    eat = new Audio(),
    up = new Audio(),
    right = new Audio(),
    left = new Audio(),
    down = new Audio();

dead.src = "assets/audio/snake-dead.mp3";
eat.src = "assets/audio/snake-eat.mp3";
up.src = "assets/audio/snake-up.mp3";
right.src = "assets/audio/snake-right.mp3";
left.src = "assets/audio/snake-left.mp3";
down.src = "assets/audio/snake-down.mp3";

// game main loop
function loop() {
    // logic
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canv.width, canv.height);

    // scores
    ctx.fillStyle = "white";
    ctx.font = "24px Verdana";
    ctx.fillText("Score: " + score, 10, canv.height - 10);

    // force speed
    px += xv;
    py += yv;

    // teleports
    if (px > canv.width) { px = 0; }

    if (px + pw < 0) { px = canv.width; }

    if (py + ph < 0) { py = canv.height; }

    if (py > canv.height) { py = 0; }

    // paint the snake itself with the tail elements
    ctx.fillStyle = 'lime';
    for (var i = 0; i < trail.length; i++) {
        ctx.fillStyle = trail[i].color || 'lime';
        ctx.fillRect(trail[i].x, trail[i].y, pw, ph);
    }

    trail.push({ x: px, y: py, color: ctx.fillStyle });

    // limiter
    if (trail.length > tail) {
        trail.shift();
    }

    // eaten
    if (trail.length > tail) {
        trail.shift();
    }

    // self collisions
    if (trail.length >= tail && gs) {
        for (var i = trail.length - tailSafeZone; i >= 0; i--) {
            if (
                px < (trail[i].x + pw) &&
                px + pw > trail[i].x &&
                py < (trail[i].y + ph) &&
                py + ph > trail[i].y
            ) {

                score = 0;
                dead.play();
                // got collision
                tail = 10; // cut the tail
                speed = baseSpeed; // cut the speed

                for (var t = 0; t < trail.length; t++) {
                    // highlight lossed area
                    trail[t].color = 'red';

                    if (t >= trail.length - tail) { break; }
                }
            }
        }
    }

    // paint apples
    for (var a = 0; a < apples.length; a++) {
        ctx.fillStyle = apples[a].color;
        ctx.fillRect(apples[a].x, apples[a].y, aw, ah);
    }

    // check for snake head collisions with apples
    for (var a = 0; a < apples.length; a++) {
        if (
            px < (apples[a].x + pw) &&
            px + pw > apples[a].x &&
            py < (apples[a].y + ph) &&
            py + ph > apples[a].y
        ) {
            // score
            score++;
            eat.play();
            // got collision with apple
            apples.splice(a, 1); // remove this apple from the apples list
            tail += 10; // add tail length
            speed += .1; // add some speed
            spawnApple(); // spawn another apple(-s)
            break;
        }
    }
}

// apples spawner
function spawnApple() {
    var
        newApple = {
            x: ~~(Math.random() * canv.width),
            y: ~~(Math.random() * canv.height),
            color: 'red'
        };

    // forbid to spawn near the edges
    if (
        (newApple.x < aw || newApple.x > canv.width - aw) ||
        (newApple.y < ah || newApple.y > canv.height - ah)
    ) {
        spawnApple();
        return;
    }

    // check for collisions with tail element, so no apple will be spawned in it
    for (var i = 0; i < tail.length; i++) {
        if (
            newApple.x < (trail[i].x + pw) &&
            newApple.x + aw > trail[i].x &&
            newApple.y < (trail[i].y + ph) &&
            newApple.y + ah > trail[i].y
        ) {
            // got collision
            spawnApple();
            return;
        }
    }

    apples.push(newApple);

    if (apples.length < 3 && ~~(Math.random() * 1000) > 700) {
        // 30% chance to spawn one more apple
        spawnApple();
    }
}

// random color generator (for debugging purpose or just 4fun)
function rc() {
    return '#' + ((~~(Math.random() * 255)).toString(16)) + ((~~(Math.random() * 255)).toString(16)) + ((~~(Math.random() * 255)).toString(16));
}

// velocity changer (controls)
function changeDirection(evt) {
    if (!fkp && [37, 38, 39, 40].indexOf(evt.keyCode) > -1) {
        setTimeout(function() { gs = true; }, 1000);
        fkp = true;
        spawnApple();
    }

    if (cooldown) { return false; }

    /*
      4 directional movement.
     */
    // remove starter block
    function removeBlock() {
        var element = document.getElementById('bs');
        element.parentNode.removeChild(element);
    }

    if (evt.keyCode == 37 && !(xv > 0)) // left arrow
    {
        xv = -speed;
        yv = 0;
        left.play();
        removeBlock();
    }

    if (evt.keyCode == 38 && !(yv > 0)) // top arrow
    {
        xv = 0;
        yv = -speed;
        up.play();
        removeBlock();
    }

    if (evt.keyCode == 39 && !(xv < 0)) // right arrow
    {
        xv = speed;
        yv = 0;
        right.play();
        removeBlock();
    }

    if (evt.keyCode == 40 && !(yv < 0)) // down arrow
    {
        xv = 0;
        yv = speed;
        down.play();
        removeBlock();
    }

    cooldown = true;
    setTimeout(function() { cooldown = false; }, 100);
}
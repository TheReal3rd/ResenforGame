class Pair {
    #var1;
    #var2;
    constructor(var1, var2) {
        this.#var1 = var1
        this.#var2 = var2
    }

    get var1() {
        return this.#var1;
    }

    // Setter for var1
    set var1(value) {
        this.#var1 = value;
    }

    // Getter for var2
    get var2() {
        return this.#var2;
    }

    // Setter for var2
    set var2(value) {
        this.#var2 = value;
    }

    toArray() {
        return [this.#var1, this.#var2];
    }

    toString() {
        return `(${this.#var1}, ${this.#var2})`;
    }
}
const app = new PIXI.Application({
    antialias: false,
    autoDensity: true,
    transparent: true
});
await app.init({
    width: 1280,
    height: 720,
});
document.body.appendChild(app.canvas);

const style = new PIXI.TextStyle({
    fontFamily: 'Ubuntu',
    fontSize: 24,
    fill: 'white',
    stroke: '#000000',
    strokeThickness: 4,
});

const styleTitle = new PIXI.TextStyle({
    fontFamily: 'Ubuntu',
    fontSize: 32,
    fill: 'white',
    stroke: '#000000',
    strokeThickness: 4,
});

app.stage.sortableChildren = true;



let gameOver = null;
const gameOverText = new PIXI.Text('Game Over!', styleTitle);
gameOverText.x = (app.screen.width / 2) - (gameOverText.width / 2);
gameOverText.y = (app.screen.height / 2) + 15;
gameOverText.zIndex = 100000;
app.stage.addChild(gameOverText);
gameOverText.visible = false;

const pHealthText = new PIXI.Text('--/--', style);
pHealthText.x = 10;
pHealthText.y = 10;
app.stage.addChild(pHealthText);

const turdHealthText = new PIXI.Text('--/--', style);
turdHealthText.x = (app.screen.width - turdHealthText.width) - 10;
turdHealthText.y = 10;
app.stage.addChild(turdHealthText);

const gameInfo = new PIXI.Text('V: 1.1', style);
gameInfo.x = 10;
gameInfo.y = (app.screen.height - gameInfo.height) - 10;
app.stage.addChild(gameInfo);

//Texture loading.
const textureThird = PIXI.Assets.cache.get('/Assets/Third.png') || await PIXI.Assets.load('/Assets/Third.png');
textureThird.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
const texturePlayer = PIXI.Assets.cache.get('/Assets/Resenfor.png') || await PIXI.Assets.load('/Assets/Resenfor.png');
texturePlayer.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
const bullet1 = PIXI.Assets.cache.get('/Assets/Bullets/bullet1.png') || await PIXI.Assets.load('/Assets/Bullets/bullet1.png');
bullet1.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
const bullet2 = PIXI.Assets.cache.get('/Assets/Bullets/bullet2.png') || await PIXI.Assets.load('/Assets/Bullets/bullet2.png');
bullet2.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
const bullet3 = PIXI.Assets.cache.get('/Assets/Bullets/bullet3.png') || await PIXI.Assets.load('/Assets/Bullets/bullet3.png');
bullet3.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
const skull = PIXI.Assets.cache.get('/Assets/SkullIcon.png') || await PIXI.Assets.load('/Assets/SkullIcon.png');
skull.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

let skullIcon = new PIXI.Sprite(skull);
skullIcon.anchor.set(0.5); // center anchor
skullIcon.scale.set(12, 12);
skullIcon.x = app.screen.width / 2;
skullIcon.y = app.screen.height / 2 - 70;
skullIcon.zIndex = 100000;
app.stage.addChild(skullIcon);
skullIcon.visible = false;

let thirdOne = new PIXI.Sprite(textureThird);
thirdOne.anchor.set(0.5); // center anchor
thirdOne.scale.set(-4, 4);
thirdOne.x = app.screen.width + 25;
thirdOne.y = app.screen.height / 2;
app.stage.addChild(thirdOne);

const thirdOneHitPoint = new PIXI.Graphics();
thirdOneHitPoint.beginFill(0x00ff00);
thirdOneHitPoint.drawCircle(0, 0, 16);
thirdOneHitPoint.endFill();
thirdOneHitPoint.x = thirdOne.x
thirdOneHitPoint.y = thirdOne.y
thirdOneHitPoint.zIndex = 100
thirdOneHitPoint.alpha = 0.35
app.stage.addChild(thirdOneHitPoint);

let thirdHealth = 50;
let waypointXY = new Pair(app.screen.width - 70, app.screen.height / 2);
let walkOnAnime = false;
let minDistMove = 85; // Minimum distance away from the player to move to.
let moveTimer = Date.now();
let attackTimer = Date.now();
let bulletSpeeds = [5, 6, 8]
let spiralOffsets = [5, 8, 10]
let attackDelay = 1800;

let playerOne = new PIXI.Sprite(texturePlayer);
playerOne.anchor.set(0.5);
playerOne.scale.set(4, 4);
playerOne.x = 50;
playerOne.y = app.screen.height / 2;
app.stage.addChild(playerOne);

const playerOneHitPoint = new PIXI.Graphics();
playerOneHitPoint.beginFill(0xff0000);
playerOneHitPoint.drawCircle(0, 0, 9);
playerOneHitPoint.endFill();
playerOneHitPoint.x = playerOne.x
playerOneHitPoint.y = playerOne.y
playerOneHitPoint.zIndex = 100
playerOneHitPoint.alpha = 0.35
app.stage.addChild(playerOneHitPoint);

// Player vars
let health = 3;
let shootTimer = Date.now();
let damageTimer = Date.now();
let invincible = false

// Game vars
const bullets = [];

// Keyboard input
const keys = {
    arrowup: false,
    arrowdown: false,
    arrowleft: false,
    arrowright: false,
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
    shift: false,
    r: false,
};

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();

    // Prevent default behavior for critical keys
    const blockKeys = [' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift', 'control', 'alt'];
    if (blockKeys.includes(key) || e.code === 'Space') {
        e.preventDefault();
    }

    // Prevent common shortcuts
    if ((e.ctrlKey || e.metaKey) && ['r', 'w', 's'].includes(key)) {
        e.preventDefault(); // Ctrl+R, Ctrl+W, Ctrl+S, etc.
    }

    if (e.code === 'Space') keys.space = true;
    else if (key in keys) keys[key] = true;
});

window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (e.code === 'Space') keys.space = false;
    else if (key in keys) keys[key] = false;
});

const getRandomInteger = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calcDist(posX, posY, posX1, posY1) {
    const dx = posX - posX1;
    const dy = posY - posY1;
    return Math.sqrt(dx * dx + dy * dy);
}

//IK hacky.
function calcAxisDist(posXY, posXY1) {
	const diff = posXY - posXY1;
    return Math.sqrt( diff * diff );
}

function getAngleBetweenPoints(posX, posY, posX1, posY1) {
    return Math.atan2(posY1 - posY, posX1 - posX);
}

function toDegrees(angle) {
    return angle * (180 / Math.PI);
}

function PlayerShootProjectile() {
    const bullet = new PIXI.Sprite(bullet1)
    bullet.anchor.set(0.5);
    bullet.scale.set(2.5, 2.5);
    bullet.tint = 0xff00ff;

    bullet.x = playerOne.x - 3;
    bullet.y = playerOne.y - 3;

    bullet.vx = 12;
    bullet.vy = 0;

    app.stage.addChild(bullet);
    bullets.push(new Pair(bullet, 0));
}

function CircleShotProjectile(fromSprite, count = 20, speed = 5, spiralOffset = 0) {
    let originX = fromSprite.x;
    let originY = fromSprite.y;

    for (let i = 0; i < count; i++) {
        const angle = ((i / count) * Math.PI * 2) + spiralOffset;
        const bullet = new PIXI.Sprite(bullet2)
        bullet.anchor.set(0.5);
        bullet.scale.set(2.5, 2.5);
        bullet.tint = 0xff0000;

        bullet.x = originX;
        bullet.y = originY;

        bullet.vx = Math.cos(angle) * speed;
        bullet.vy = Math.sin(angle) * speed;

        app.stage.addChild(bullet);
        bullets.push(new Pair(bullet, 1));
    }
}

function FlakShotProjectile() {
    const bullet = new PIXI.Sprite(bullet3)
    bullet.anchor.set(0.5);
    bullet.scale.set(2.5, 2.5);
    bullet.tint = 0xff0000;

    bullet.x = thirdOne.x - 3;
    bullet.y = thirdOne.y - 3;

    let speed = 20;
    const angle = getAngleBetweenPoints(thirdOne.x, thirdOne.y, playerOne.x, playerOne.y);
    bullet.vx = Math.cos(angle) * speed;
    bullet.vy = Math.sin(angle) * speed;

    bullet.rotation = angle - (Math.PI / 2);

    app.stage.addChild(bullet);
    bullets.push(new Pair(bullet, 1));
}

function UpdateThirdOne() {
    if (walkOnAnime) {
        let randomChoice = getRandomInteger(0, 4);
        if (randomChoice <= 1) {
            if (Date.now() - moveTimer >= 300 && waypointXY.var1 == -1 && waypointXY.var2 == -1) {
                moveTimer = Date.now();
                let retryAttempts = 50;
                let closestPoint = null;
                let closestDist = 30000000;
                while (retryAttempts >> 0) {
                    retryAttempts--;
                    let tempWaypoint = new Pair(getRandomInteger(5, app.screen.width - 5), getRandomInteger(5, app.screen.height - 5));
                    let distFromPlayer = calcDist(playerOne.x, playerOne.y, waypointXY.var1, waypointXY.var2);
                    if (distFromPlayer <= minDistMove) continue;
                    if (distFromPlayer < closestDist) {
                        closestDist = distFromPlayer;
                        closestPoint = tempWaypoint;
                        break
                    }
                }
                if (closestPoint != null) waypointXY = closestPoint;
            }
        } else if (randomChoice == 2) {
            if (Date.now() - attackTimer >= attackDelay) {
                for (let i = 0; i != 3; i++) {
                    CircleShotProjectile(thirdOne, 20, bulletSpeeds[i], spiralOffsets[i]);
                }
                attackTimer = Date.now();
            }
        } else {
            if (Date.now() - attackTimer >= attackDelay) {
                for (let i = 0; i != 3; i++) {
                    FlakShotProjectile()
                }
                attackTimer = Date.now();
            }
        }
    }
    if (waypointXY.var1 != -1 && waypointXY.var2 != -1) {
        let dist = calcDist(thirdOne.x, thirdOne.y, waypointXY.var1, waypointXY.var2);
        let distFromPlayer = calcDist(playerOne.x, playerOne.y, waypointXY.var1, waypointXY.var2);

        if (dist <= 4 || distFromPlayer <= minDistMove) {
            waypointXY = new Pair(-1, -1);
        } else {
        	//This fixes glitchy movement and skipping by moving 3 pixel max and less when target is less then 3 pixels.
        	let xDist = Math.min(2, calcAxisDist(thirdOne.x, waypointXY.var1));
            if (thirdOne.x < waypointXY.var1) {
            	thirdOne.scale.set(4, 4);
            	thirdOne.x += xDist;
            } else if (thirdOne.x > waypointXY.var1)  {
            	thirdOne.scale.set(-4, 4);
            	thirdOne.x -= xDist;
            }

        	let yDist = Math.min(2, calcAxisDist(thirdOne.y, waypointXY.var2));
            if (thirdOne.y < waypointXY.var2) thirdOne.y += yDist;
            else if (thirdOne.y > waypointXY.var2) thirdOne.y -= yDist;

            thirdOne.x = Math.round(thirdOne.x);
            thirdOne.y = Math.round(thirdOne.y);
        }
        walkOnAnime = true // Walk on screen animation is done now attack the player.
    }
}

app.ticker.add(() => {
    if (keys.r) {
        window.location.reload();
    }

    if (gameOver === "Lose") {
        gameOverText.visible = true;
        skullIcon.visible = true;
    } else if (gameOver === "Win") {
    	gameOverText.text = "You've won!"
    	gameOverText.visible = true;
    } else {
        let speed = keys.shift ? 2 : 5;
        let shootDelay = keys.shift ? 150 : 250;

        if (keys.space && Date.now() - shootTimer > shootDelay) {
            PlayerShootProjectile();
            shootTimer = Date.now();
        }

        if (keys.arrowup || keys.w) playerOne.y -= speed;
        if (keys.arrowdown || keys.s) playerOne.y += speed;
        if (keys.arrowleft || keys.a) {
        	playerOne.scale.set(-4, 4);
        	playerOne.x -= speed;
        } if (keys.arrowright || keys.d) {
        	playerOne.scale.set(4, 4);
        	playerOne.x += speed;
        }

        playerOne.x = Math.round(playerOne.x);
        playerOne.y = Math.round(playerOne.y);

        playerOne.x = Math.max(0, Math.min(app.screen.width, playerOne.x));
        playerOne.y = Math.max(0, Math.min(app.screen.height, playerOne.y));

        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i].var1;
            const t = bullets[i].var2;
            b.x += b.vx;
            b.y += b.vy;
            if (b.texture != bullet3) {
                b.rotation += 0.05
            }

            if (t == 0) {
                let distToThird = calcDist(thirdOne.x, thirdOne.y, b.x, b.y);
                if (distToThird <= 16) {
                    app.stage.removeChild(b);
                    bullets.splice(i, 1);
                    thirdHealth--;
                }
            } else {
                let distToPlayer = calcDist(playerOne.x, playerOne.y, b.x, b.y);
                if (b.texture == bullet3) {
                    if (distToPlayer <= 250) {
                        CircleShotProjectile(b, 15, 3, 8)
                        app.stage.removeChild(b);
                        bullets.splice(i, 1);
                    }
                } else {
                    if (distToPlayer <= 9 && !invincible) {
                        app.stage.removeChild(b);
                        bullets.splice(i, 1);
                        damageTimer = Date.now();
                        health--;
                        playerOne.alpha = 0.5
                        invincible = true
                    }
                }
            }

            if (b.x < 0 || b.x > app.screen.width || b.y < 0 || b.y > app.screen.height) {
                app.stage.removeChild(b);
                bullets.splice(i, 1);
            }
        }
        UpdateThirdOne();
    }

    if (Date.now() - damageTimer >= 1000) {
        playerOne.alpha = 1;
        invincible = false
    }
    thirdOneHitPoint.x = thirdOne.x;
    thirdOneHitPoint.y = thirdOne.y;
    playerOneHitPoint.x = playerOne.x;
    playerOneHitPoint.y = playerOne.y;
    pHealthText.text = health + "/3";
    turdHealthText.text = thirdHealth + "/50"
    turdHealthText.x = (app.screen.width - turdHealthText.width) - 10;

    if (health <= 0) {
        gameOver = "Lose";
    }
    if (thirdHealth <= 0) {
    	gameOver = "Win";
        setTimeout(() => {
            window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        }, 500);
    }
});
const cvs = document.getElementById("mycanvas");
const ctx = cvs.getContext("2d");

let frames = 0;
const DEGREE = Math.PI / 180;
//LOAD IMAGE
const image = new Image();
image.src = "img/sprite.png";
//LOAD MUSICS
const flap = new Audio();
flap.src = "./audio/sfx_flap.wav";
const die = new Audio();
die.src = "./audio/sfx_die.wav";
const hit = new Audio();
hit.src = "./audio/sfx_hit.wav";
const point = new Audio();
point.src = "./audio/sfx_point.wav";
const swoosh = new Audio();
swoosh.src = "./audio/sfx_swooshing.wav";
//GAME STATES
const state = {
  current: 0,
  getReady: 0,
  game: 1,
  over: 2,
};
//HANDLE GAME STATES
function stateHandler() {
  switch (state.current) {
    case state.getReady:
      state.current = state.game;
      swoosh.play();
      break;

    case state.game:
      bird.flap();
      flap.play();
      break;
    default:
      score.value = 0;
      bird.speed = 0;
      bird.rotation = 0;
      pipes.position = [];
      state.current = state.getReady;
      break;
  }
}
document.addEventListener("click", stateHandler);
document.addEventListener("keydown", (e) => {
  if (e.key == " ") {
    stateHandler();
  }
});
//CREATE BACKGROUND
const bg = {
  sX: 0,
  sY: 0,
  w: 275,
  h: 226,
  x: 0,
  y: cvs.height - 226,

  draw: function () {
    ctx.drawImage(
      image,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x,
      this.y,
      this.w,
      this.h
    );

    ctx.drawImage(
      image,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x + this.w,
      this.y,
      this.w,
      this.h
    );
  },
};
//CREATE FOREGROUND
const fg = {
  sX: 276,
  sY: 0,
  w: 224,
  h: 112,
  x: 0,
  y: cvs.height - 112,

  dx: 2,

  draw: function () {
    ctx.drawImage(
      image,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x,
      this.y,
      this.w,
      this.h
    );

    ctx.drawImage(
      image,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x + this.w,
      this.y,
      this.w,
      this.h
    );
  },
  //FOREGROUND MOVE CONTROL
  update: function () {
    if (state.current == state.game) {
      this.x = (this.x - this.dx) % (this.w / 2);
    }
  },
};
//CREATE BIRD ELEMENT
const bird = {
  animation: [
    { sX: 276, sY: 112 },
    { sX: 276, sY: 139 },
    { sX: 276, sY: 164 },
    { sX: 276, sY: 139 },
  ],
  x: 50,
  y: 150,
  w: 34,
  h: 26,
  radius: 12,

  animationIndex: 0,

  gravity: 0.25,
  jump: 4.6,
  speed: 0,
  rotation: 0,

  draw: function () {
    //BIRD STATES
    let bird = this.animation[this.animationIndex];

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.drawImage(
      image,
      bird.sX,
      bird.sY,
      this.w,
      this.h,
      -this.w / 2,
      -this.h / 2,
      this.w,
      this.h
    );

    ctx.restore();
  },
  //JUMP HANDLER
  flap: function () {
    this.speed = -this.jump;
  },

  update: function () {
    //CHECK IF STATE IS GET READY FLAP SLOWER
    this.period = state.current == state.getReady ? 10 : 5;
    //THE BIRD FLAPS EVERY 5 FRAMES
    this.animationIndex += frames % this.period == 0 ? 1 : 0;
    //BIRD FRAMES GOES FROM 0 TO 4
    this.animationIndex = this.animationIndex % this.animation.length;

    if (state.current == state.getReady) {
      this.y = 150;
      this.rotation = 0 * DEGREE;
    } else {
      //ADD GRAVITY TO BIRD
      this.speed += this.gravity;
      this.y += this.speed;
      //CHECK BIRD DIES
      if (this.y + this.h / 2 >= cvs.height - fg.h) {
        this.y = cvs.height - fg.h - this.h / 2;
        if (state.current == state.game) {
          state.current = state.over;
          die.play();
        }
      }
      //BIRD ANGLE CONTROL
      if (this.speed >= this.jump) {
        this.rotation = 90 * DEGREE;
        this.animationIndex = 1;
      } else {
        this.rotation = -25 * DEGREE;
      }
    }
  },
};
//CREATE PIPES
const pipes = {
  top: {
    sX: 553,
    sY: 0,
  },
  bottom: {
    sX: 502,
    sY: 0,
  },

  w: 53,
  h: 400,
  gap: 85,
  dx: 2,
  position: [],
  maxYpos: -150,

  draw() {
    //DRAW RANDOM PIPES
    for (let i = 0; i < this.position.length; i++) {
      let pipe = this.position[i];
      let topPos = pipe.y;
      let bottomPos = pipe.y + this.gap + this.h;

      ctx.drawImage(
        image,
        this.top.sX,
        this.top.sY,
        this.w,
        this.h,
        pipe.x,
        topPos,
        this.w,
        this.h
      );
      ctx.drawImage(
        image,
        this.bottom.sX,
        this.bottom.sY,
        this.w,
        this.h,
        pipe.x,
        bottomPos,
        this.w,
        this.h
      );
    }
  },
  update() {
    //CREATE PIPES EVERY 100 FRAMES
    if (state.current != state.game) return;
    if (frames % 100 == 0) {
      this.position.push({
        x: cvs.width,
        y: this.maxYpos * (Math.random() + 1),
      });
    }
    // MOVE PIPES
    for (let i = 0; i < this.position.length; i++) {
      let pipe = this.position[i];
      pipe.x -= this.dx;
      let bottomPipePos = pipe.y + this.gap + this.h;
      //DETTECT COLLISON BETWEEN PIPE AND BIRD
      if (
        bird.radius + bird.x > pipe.x &&
        bird.x - bird.radius < pipe.x + this.w &&
        bird.y + bird.radius > pipe.y &&
        bird.y - bird.radius < pipe.y + this.h
      ) {
        state.current = state.over;
        hit.play();
      }
      //DETTEXT COLLISON BETWEEN PIPE AND BIRD
      if (
        bird.radius + bird.x > pipe.x &&
        bird.x - bird.radius < pipe.x + this.w &&
        bird.y + bird.radius > bottomPipePos &&
        bird.y - bird.radius < bottomPipePos + this.h
      ) {
        state.current = state.over;
        hit.play();
      }
      //EARN POINT
      if (pipe.x + this.w <= 0) {
        this.position.shift();
        point.play();
        score.value += 1;
        score.best = Math.max(score.value, score.best);
        localStorage.setItem("best", score.best);
      }
    }
  },
};
//GET READY BOX
const getReady = {
  sX: 0,
  sY: 228,
  w: 173,
  h: 152,
  x: cvs.width / 2 - 173 / 2,
  y: 80,

  draw: function () {
    if (state.current == state.getReady) {
      ctx.drawImage(
        image,
        this.sX,
        this.sY,
        this.w,
        this.h,
        this.x,
        this.y,
        this.w,
        this.h
      );
    }
  },
};
//SCORE
const score = {
  value: 0,
  best: parseInt(localStorage.getItem("best")) || 0,
  draw() {
    ctx.fillStyle = "#FFF";

    if (state.current == state.game) {
      ctx.lineWidth = 2;
      ctx.font = "35px IMPACT";

      ctx.fillText(this.value, cvs.width / 2 - 15, 50);
      ctx.strokeText(this.value, cvs.width / 2 - 15, 50);
    } else if (state.current == state.over) {
      ctx.lineWidth = 2;
      ctx.font = "25px IMPACT";
      ctx.fillText(this.value, 225, 186);
      ctx.strokeText(this.value, 225, 186);
      ctx.fillText(this.best, 225, 228);
      ctx.strokeText(this.best, 225, 228);
    }
  },
};
//GAMEOVER BOX
const gameOver = {
  sX: 175,
  sY: 228,
  w: 225,
  h: 202,
  x: cvs.width / 2 - 225 / 2,
  y: 90,

  draw: function () {
    if (state.current == state.over) {
      ctx.drawImage(
        image,
        this.sX,
        this.sY,
        this.w,
        this.h,
        this.x,
        this.y,
        this.w,
        this.h
      );
    }
  },
};
//UPDATE
function update() {
  bird.update();
  fg.update();
  pipes.update();
}
//DRAW
function draw() {
  ctx.fillStyle = "#70c5ce";
  ctx.fillRect(0, 0, cvs.width, cvs.height);
  bg.draw();
  pipes.draw();
  fg.draw();
  bird.draw();
  getReady.draw();
  gameOver.draw();
  score.draw();
}
//ANIMATION FUNCTION
function animation() {
  draw();
  update();
  frames++;
  requestAnimationFrame(animation);
}
animation();

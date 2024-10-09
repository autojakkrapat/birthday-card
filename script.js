
var w = c.width = window.innerWidth,
  h = c.height = window.innerHeight,
  ctx = c.getContext("2d"),
  hw = w / 2, // half-width
  hh = h / 2,
  opts = {
    strings: ["HAPPY", "BIRTHDAY LITTLE CAT PUNPUN<3!"],
    charSize: 30,
    charSpacing: 35,
    lineHeight: 40,
    cx: w / 2,
    cy: h / 2,
    fireworkPrevPoints: 10,
    fireworkBaseLineWidth: 5,
    fireworkAddedLineWidth: 8,
    fireworkSpawnTime: 200,
    fireworkBaseReachTime: 30,
    fireworkAddedReachTime: 30,
    fireworkCircleBaseSize: 20,
    fireworkCircleAddedSize: 10,
    fireworkCircleBaseTime: 30,
    fireworkCircleAddedTime: 30,
    fireworkCircleFadeBaseTime: 10,
    fireworkCircleFadeAddedTime: 5,
    fireworkBaseShards: 5,
    fireworkAddedShards: 5,
    fireworkShardPrevPoints: 3,
    fireworkShardBaseVel: 4,
    fireworkShardAddedVel: 2,
    fireworkShardBaseSize: 3,
    fireworkShardAddedSize: 3,
    gravity: 0.1,
    upFlow: -0.1,
    letterContemplatingWaitTime: 1500,
    balloonSpawnTime: 20,
    balloonBaseInflateTime: 10,
    balloonAddedInflateTime: 10,
    balloonBaseSize: 20,
    balloonAddedSize: 20,
    balloonBaseVel: 0.4,
    balloonAddedVel: 0.4,
    balloonBaseRadian: -(Math.PI / 2 - 0.5),
    balloonAddedRadian: -1,
  },
  calc = {
    totalWidth: opts.charSpacing * Math.max(opts.strings[0].length, opts.strings[1].length),
  },
  Tau = Math.PI * 2,
  TauQuarter = Tau / 4,
  letters = [];

ctx.font = opts.charSize + "px Verdana";

function Letter(char, x, y) {
  this.char = char;
  this.x = x;
  this.y = y;
  this.dx = -ctx.measureText(char).width / 2;
  this.dy = +opts.charSize / 2;
  this.fireworkDy = this.y - hh;

  var hue = (x / calc.totalWidth) * 360;
  this.color = "hsl(hue,80%,50%)".replace("hue", hue);
  this.lightAlphaColor = "hsla(hue,80%,light%,alp)".replace("hue", hue);
  this.lightColor = "hsl(hue,80%,light%)".replace("hue", hue);
  this.alphaColor = "hsla(hue,80%,50%,alp)".replace("hue", hue);

  this.reset();
}
Letter.prototype.reset = function () {
  this.phase = "firework";
  this.tick = 0;
  this.spawned = false;
  this.spawningTime = (opts.fireworkSpawnTime * Math.random()) | 0;
  this.reachTime = (opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random()) | 0;
  this.lineWidth = opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random();
  this.prevPoints = [[0, hh, 0]];
};
Letter.prototype.step = function () {
  if (this.phase === "firework") {
    if (!this.spawned) {
      ++this.tick;
      if (this.tick >= this.spawningTime) {
        this.tick = 0;
        this.spawned = true;
      }
    } else {
      ++this.tick;
      var linearProportion = this.tick / this.reachTime,
        armonicProportion = Math.sin(linearProportion * TauQuarter),
        x = linearProportion * this.x,
        y = hh + armonicProportion * this.fireworkDy;

      if (this.prevPoints.length > opts.fireworkPrevPoints)
        this.prevPoints.shift();

      this.prevPoints.push([x, y, linearProportion * this.lineWidth]);

      for (var k = 0; k < this.prevPoints.length - 1; ++k) {
        var point = this.prevPoints[k],
          point2 = this.prevPoints[k + 1];

        ctx.strokeStyle = this.alphaColor.replace("alp", k / this.prevPoints.length);
        ctx.lineWidth = point[2];
        ctx.beginPath();
        ctx.moveTo(point[0], point[1]);
        ctx.lineTo(point2[0], point2[1]);
        ctx.stroke();
      }

      if (this.tick >= this.reachTime) {
        this.phase = "contemplate";
        this.circleFinalSize = opts.fireworkCircleBaseSize + opts.fireworkCircleAddedSize * Math.random();
        this.circleCompleteTime = (opts.fireworkCircleBaseTime + opts.fireworkCircleAddedTime * Math.random()) | 0;
        this.circleCreating = true;
        this.circleFading = false;
        this.circleFadeTime = (opts.fireworkCircleFadeBaseTime + opts.fireworkCircleFadeAddedTime * Math.random()) | 0;
        this.tick = 0;
        this.shards = [];

        var shardCount = (opts.fireworkBaseShards + opts.fireworkAddedShards * Math.random()) | 0,
          angle = Tau / shardCount,
          cos = Math.cos(angle),
          sin = Math.sin(angle),
          x = 1,
          y = 0;

        for (var i = 0; i < shardCount; ++i) {
          var x1 = x;
          x = x * cos - y * sin;
          y = y * cos + x1 * sin;

          this.shards.push(new Shard(this.x, this.y, x, y, this.alphaColor));
        }
      }
    }
  } else if (this.phase === "contemplate") {
    ++this.tick;

    if (this.circleCreating) {
      var proportion = this.tick / this.circleCompleteTime,
        armonic = -Math.cos(proportion * Math.PI) / 2 + 0.5;

      ctx.beginPath();
      ctx.fillStyle = this.lightAlphaColor.replace("light", 50).replace("alp", 0.2 + 0.8 * armonic);
      ctx.arc(this.x, this.y, armonic * this.circleFinalSize, 0, Tau);
      ctx.fill();

      if (this.tick >= this.circleCompleteTime) {
        this.tick = 0;
        this.circleCreating = false;
        this.circleFading = true;
      }
    } else if (this.circleFading) {
      var proportion = this.tick / this.circleFadeTime,
        armonic = -Math.cos(proportion * Math.PI) / 2 + 0.5;

      ctx.beginPath();
      ctx.fillStyle = this.lightAlphaColor.replace("light", 50).replace("alp", 0.2 * (1 - armonic));
      ctx.arc(this.x, this.y, armonic * this.circleFinalSize, 0, Tau);
      ctx.fill();

      if (this.tick >= this.circleFadeTime) this.circleFading = false;
    } else {
      ctx.fillStyle = this.lightColor.replace("light", (this.tick / opts.letterContemplatingWaitTime) * 40);
      ++this.tick;
      ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
      for (var i = 0; i < this.shards.length; ++i) this.shards[i].step();

      if (this.tick > opts.letterContemplatingWaitTime) {
        this.phase = "balloon";
        this.tick = 0;
        this.balloonInflateTime = (opts.balloonBaseInflateTime + opts.balloonAddedInflateTime * Math.random()) | 0;
        this.balloonSize = opts.balloonBaseSize + opts.balloonAddedSize * Math.random();

        var rad = opts.balloonBaseRadian + opts.balloonAddedRadian * Math.random(),
          vel = opts.balloonBaseVel + opts.balloonAddedVel * Math.random();

        this.vx = Math.cos(rad) * vel;
        this.vy = Math.sin(rad) * vel;
      }
    }
  } else if (this.phase === "balloon") {
    ++this.tick;

    if (this.tick <= this.balloonInflateTime) {
      var proportion = this.tick / this.balloonInflateTime,
        x = this.x,
        y = this.y - opts.upFlow * proportion,
        size = proportion * this.balloonSize;

      ctx.beginPath();
      ctx.fillStyle = this.lightAlphaColor.replace("light", 80).replace("alp", 0.8);
      ctx.arc(x, y, size, 0, Tau);
      ctx.fill();
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = this.alphaColor.replace("alp", 0.6);
      ctx.arc(x, y, size * 0.9, 0, Tau);
      ctx.stroke();
    } else {
      var x = (this.x += this.vx),
        y = (this.y += this.vy - opts.upFlow),
        size = this.balloonSize;

      ctx.beginPath();
      ctx.fillStyle = this.lightAlphaColor.replace("light", 80).replace("alp", 0.6);
      ctx.arc(x, y, size, 0, Tau);
      ctx.fill();
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = this.alphaColor.replace("alp", 0.6);
      ctx.arc(x, y, size * 0.9, 0, Tau);
      ctx.stroke();

      if (y + size < -hh || x < -hw || x > hw) this.reset();
    }
  }
};

function Shard(x, y, vx, vy, color) {
  var vel = opts.fireworkShardBaseVel + opts.fireworkShardAddedVel * Math.random();
  this.vx = vx * vel;
  this.vy = vy * vel;
  this.x = x;
  this.y = y;s
  this.prevPoints = [[x, y]];
  this.color = color;
  this.size = opts.fireworkShardBaseSize + opts.fireworkShardAddedSize * Math.random();
}
Shard.prototype.step = function () {
  this.x += this.vx;
  this.y += this.vy += opts.gravity;

  if (this.prevPoints.length > opts.fireworkShardPrevPoints) this.prevPoints.shift();

  this.prevPoints.push([this.x, this.y]);

  for (var k = 0; k < this.prevPoints.length - 1; ++k) {
    var point = this.prevPoints[k],
      point2 = this.prevPoints[k + 1];

    ctx.lineWidth = this.size * (k / this.prevPoints.length);
    ctx.strokeStyle = this.color.replace("alp", k / this.prevPoints.length);
    ctx.beginPath();
    ctx.moveTo(point[0], point[1]);
    ctx.lineTo(point2[0], point2[1]);
    ctx.stroke();
  }

  if (this.prevPoints[this.prevPoints.length - 1][1] > hh) this.reset();
};
Letter.prototype.reset = Shard.prototype.reset = function () {
  this.phase = "firework";
  this.tick = 0;
  this.spawned = false;
  this.spawningTime = (opts.fireworkSpawnTime * Math.random()) | 0;
  this.reachTime = (opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random()) | 0;
  this.lineWidth = opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random();
  this.prevPoints = [[0, hh, 0]];
};

for (var i = 0; i < opts.strings.length; ++i)
  for (var j = 0; j < opts.strings[i].length; ++j)
    letters.push(new Letter(opts.strings[i][j], j * opts.charSpacing + opts.cx - opts.strings[i].length * opts.charSpacing / 2, i * opts.lineHeight + opts.cy - opts.strings.length * opts.lineHeight / 2));

function anim() {
  window.requestAnimationFrame(anim);

  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, w, h);

  for (var i = 0; i < letters.length; ++i) letters[i].step();
}
anim();

document.addEventListener('DOMContentLoaded', () => {
    // กำหนดจำนวนของ bubble
    const bubbleCount = 20;
  
    // ค่าสีสุ่มที่ต้องการใช้สำหรับ bubble
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33D4', '#FFFF33'];
  
    // อ้างอิงถึง container ที่จะสร้าง bubble เข้าไป
    const bubbleContainer = document.querySelector('.bubbles');
  
    // สร้าง bubble ตามจำนวนที่กำหนด
    for (let i = 0; i < bubbleCount; i++) {
      // สร้าง div ใหม่สำหรับ bubble แต่ละอัน
      const bubble = document.createElement('div');
      bubble.classList.add('bubble');
  
      // สุ่มขนาดของ bubble
      const size = Math.random() * 60 + 20; // ขนาดสุ่มระหว่าง 20px ถึง 80px
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
  
      // สุ่มตำแหน่งการเกิดของ bubble
      bubble.style.left = `${Math.random() * 100}%`; // สุ่มตำแหน่งจากซ้ายสุดถึงขวาสุด
  
      // สุ่มสีของ bubble
      const colorIndex = Math.floor(Math.random() * colors.length); // เลือกสีสุ่มจาก array
      bubble.style.backgroundColor = colors[colorIndex];
  
      // สุ่มความเร็วของ animation
      const animationDuration = Math.random() * 10 + 15; // ความเร็วสุ่มระหว่าง 15s ถึง 25s
      bubble.style.animationDuration = `${animationDuration}s`;
  
      // สุ่มการหน่วงเวลาเริ่ม animation
      const animationDelay = Math.random() * 5; // หน่วงเวลา 0 ถึง 5 วินาที
      bubble.style.animationDelay = `${animationDelay}s`;
  
      // ใส่ bubble ที่สร้างลงใน container
      bubbleContainer.appendChild(bubble);
    }
  });
  

// โค้ดของคุณเดิม
setTimeout(() => {
    document.querySelector("canvas").style.display = "none";
    document.querySelector("p").style.display = "none";
    document.getElementById("card").style.display = "block";
    document.querySelector(".bubbles").style.display = "block";
  }, 9000);
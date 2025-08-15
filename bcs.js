class BallCollisionSimulator {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.balls = [];
    this.animationId = null;
    this.colors = options.colors || ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
    this.killFeed = [];
    this.onKill = null;

    // 小刀属性
    this.knife = {
      img: options.knifeImage || null,
      x: 0,
      y: 0,
      width: 50,
      height: 50,
      available: true
    };

    // 方框边界
    this.box = {
      x: 20,
      y: 20,
      width: canvas.width - 40,
      height: canvas.height - 40
    };

    // 默认小球配置
    this.defaultBallConfig = {
      radius: 20,
      mass: 2,
      x: null,
      y: null,
      vx: 0,
      vy: 0,
      color: null,
      hasKnife: false
    };

    // 初始化
    this._setupCanvas();
    this._placeKnifeRandomly();
  }

  /**
   * 初始化画布
   */
  _setupCanvas() {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this._drawBox();
  }

  /**
   * 绘制方框
   */
  _drawBox() {
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
  }

  /**
   * 随机放置小刀
   */
  _placeKnifeRandomly() {
    if (!this.knife.img) return;

    this.knife.x = Math.random() * (this.box.width - this.knife.width) + this.box.x;
    this.knife.y = Math.random() * (this.box.height - this.knife.height) + this.box.y;
    this.knife.available = true;
  }

  /**
   * 绘制小刀
   */
  _drawKnife() {
    if (!this.knife.img || !this.knife.available) return;

    this.ctx.drawImage(
      this.knife.img,
      this.knife.x,
      this.knife.y,
      this.knife.width,
      this.knife.height
    );
  }

  /**
   * 检测小球与小刀的碰撞
   */
  _checkKnifeCollision() {
    if (!this.knife.available || !this.knife.img) return;

    for (const ball of this.balls) {

      // 简单的矩形与圆形碰撞检测
      const testX = Math.max(this.knife.x, Math.min(ball.x, this.knife.x + this.knife.width));
      const testY = Math.max(this.knife.y, Math.min(ball.y, this.knife.y + this.knife.height));

      const distX = ball.x - testX;
      const distY = ball.y - testY;
      const distance = Math.sqrt(distX * distX + distY * distY);

      if (distance <= ball.radius) {
        ball.hasKnife = true;
        this.knife.available = false;
        this._placeKnifeRandomly();
        break;
      }
    }
  }

  /**
   * 添加小球
   */
  addBall(config = {}) {
    const mergedConfig = { ...this.defaultBallConfig, ...config };

    // 自动分配位置(如果未指定)
    if (mergedConfig.x === null) {
      mergedConfig.x = Math.random() * (this.box.width - 2 * mergedConfig.radius) +
        this.box.x + mergedConfig.radius;
    }
    if (mergedConfig.y === null) {
      mergedConfig.y = Math.random() * (this.box.height - 2 * mergedConfig.radius) +
        this.box.y + mergedConfig.radius;
    }

    // 自动分配颜色
    if (mergedConfig.color === null) {
      mergedConfig.color = this.colors[this.balls.length % this.colors.length];
    }

    // 生成唯一ID
    const id = this.balls.length + 1;
    const ball = { ...mergedConfig, id };

    this.balls.push(ball);
    return id;
  }

  /**
   * 移除小球
   */
  removeBall(id) {
    this.balls = this.balls.filter(ball => ball.id !== id);
  }

  /**
   * 获取所有小球
   */
  getBalls() {
    return [...this.balls];
  }

  /**
   * 获取指定ID的小球
   */
  getBall(id) {
    return this.balls.find(ball => ball.id === id) || null;
  }

  /**
   * 更新小球属性
   */
  updateBall(id, updates) {
    const ball = this.getBall(id);
    if (ball) {
      Object.assign(ball, updates);
    }
  }

  /**
   * 清空所有小球
   */
  clearBalls() {
    this.balls = [];
  }

  /**
   * 重置模拟
   */
  reset() {
    this.clearBalls();
    this._setupCanvas();
    this._placeKnifeRandomly();
  }

  /**
   * 绘制所有小球(带小刀状态)
   */
  _drawBalls() {
    this.balls.forEach(ball => {
      // 绘制小球
      this.ctx.beginPath();
      this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = ball.color;
      this.ctx.fill();
      this.ctx.strokeStyle = 'black';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();

      // 绘制中心点
      this.ctx.beginPath();
      this.ctx.arc(ball.x, ball.y, 2, 0, Math.PI * 2);
      this.ctx.fillStyle = 'black';
      this.ctx.fill();

      // 如果小球有小刀，绘制小刀
      if (ball.hasKnife && this.knife.img) {
        const knifeSize = ball.radius * 1.2;
        this.ctx.drawImage(
          this.knife.img,
          ball.x + ball.radius * 0.2,
          ball.y - knifeSize / 2,
          knifeSize,
          knifeSize
        );
      }
    });
  }

  /**
   * 更新小球位置
   */
  _updateBalls() {
    this.balls.forEach(ball => {
      ball.x += ball.vx;
      ball.y += ball.vy;

      // 边界碰撞检测
      if (ball.x - ball.radius < this.box.x) {
        ball.x = this.box.x + ball.radius;
        ball.vx = -ball.vx;
      }
      if (ball.x + ball.radius > this.box.x + this.box.width) {
        ball.x = this.box.x + this.box.width - ball.radius;
        ball.vx = -ball.vx;
      }
      if (ball.y - ball.radius < this.box.y) {
        ball.y = this.box.y + ball.radius;
        ball.vy = -ball.vy;
      }
      if (ball.y + ball.radius > this.box.y + this.box.height) {
        ball.y = this.box.y + this.box.height - ball.radius;
        ball.vy = -ball.vy;
      }
    });

    // 小球间碰撞检测
    this._detectBallCollisions();
  }

  /**
   * 检测所有小球碰撞(带小刀效果)
   */
  _detectBallCollisions() {
    for (let i = 0; i < this.balls.length; i++) {
      for (let j = i + 1; j < this.balls.length; j++) {
        const ball1 = this.balls[i];
        const ball2 = this.balls[j];

        const dx = ball2.x - ball1.x;
        const dy = ball2.y - ball1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < ball1.radius + ball2.radius) {
          // 小刀效果处理
          this._handleKnifeEffect(ball1, ball2);

          // 原始碰撞物理
          const angle = Math.atan2(dy, dx);
          const sin = Math.sin(angle);
          const cos = Math.cos(angle);

          // 旋转速度
          const vx1Rotated = ball1.vx * cos + ball1.vy * sin;
          const vy1Rotated = ball1.vy * cos - ball1.vx * sin;
          const vx2Rotated = ball2.vx * cos + ball2.vy * sin;
          const vy2Rotated = ball2.vy * cos - ball2.vx * sin;

          // 一维弹性碰撞
          const vx1RotatedAfter = ((ball1.mass - ball2.mass) * vx1Rotated + 2 * ball2.mass * vx2Rotated) /
            (ball1.mass + ball2.mass);
          const vx2RotatedAfter = ((ball2.mass - ball1.mass) * vx2Rotated + 2 * ball1.mass * vx1Rotated) /
            (ball1.mass + ball2.mass);

          // 旋转回原始坐标系
          ball1.vx = vx1RotatedAfter * cos - vy1Rotated * sin;
          ball1.vy = vy1Rotated * cos + vx1RotatedAfter * sin;
          ball2.vx = vx2RotatedAfter * cos - vy2Rotated * sin;
          ball2.vy = vy2Rotated * cos + vx2RotatedAfter * sin;

          // 防止重叠
          const overlap = (ball1.radius + ball2.radius - distance) / 2;
          ball1.x -= overlap * Math.cos(angle);
          ball1.y -= overlap * Math.sin(angle);
          ball2.x += overlap * Math.cos(angle);
          ball2.y += overlap * Math.sin(angle);
        }
      }
    }
  }

  /**
   * 处理小刀效果
   */
  _handleKnifeEffect(ball1, ball2) {
    // // 情况1: ball1有刀，ball2没有
    // if (ball1.hasKnife && !ball2.hasKnife) {
    //   // 减少ball2的质量和半径
    //   ball2.mass = ball2.mass - 1;
    //   ball2.radius = ball2.radius - 10;
    //   ball1.hasKnife = false
    // }
    // // 情况2: ball2有刀，ball1没有
    // else if (ball2.hasKnife && !ball1.hasKnife) {
    //   // 减少ball1的质量和半径
    //   ball1.mass = ball1.mass - 1;
    //   ball1.radius = ball1.radius - 10;
    //   ball2.hasKnife = false
    // }
    // // 情况3: 双方都有刀
    // else if (ball1.hasKnife && ball2.hasKnife) {
    //   // 双方都失去刀
    //   ball1.hasKnife = false;
    //   ball2.hasKnife = false;
    // }
    // 情况1: ball1有刀，ball2没有
    if (ball1.hasKnife && !ball2.hasKnife) {
      // 减少ball2的质量和半径
      ball2.mass = Math.max(0, ball2.mass - 1);
      ball2.radius = Math.max(0, ball2.radius - 10);
      ball2.lastHitBy = ball1.id; // 记录最后击中者
      ball1.hasKnife = false;
    }
    // 情况2: ball2有刀，ball1没有
    else if (ball2.hasKnife && !ball1.hasKnife) {
      // 减少ball1的质量和半径
      ball1.mass = Math.max(0, ball1.mass - 1);
      ball1.radius = Math.max(0, ball1.radius - 10);
      ball1.lastHitBy = ball2.id; // 记录最后击中者
      ball2.hasKnife = false;
    }
    // 情况3: 双方都有刀
    else if (ball1.hasKnife && ball2.hasKnife) {
      // 双方都失去刀
      ball1.hasKnife = false;
      ball2.hasKnife = false;
    }
  }

  /**
   * 动画循环
   */
  _animate() {
    // this.ctx.fillStyle = 'white';
    // this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    // this._drawBox();
    // this._updateBalls();
    // this._checkKnifeCollision();
    // this._drawKnife();
    // this._drawBalls();
    // for(var i=0;i<this.balls.length;i++){
    //   if(this.balls[i].radius==0){
    //     this.balls.splice(i,1)
    //   }
    // }
    // this.animationId = requestAnimationFrame(() => this._animate());
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this._drawBox();
    this._updateBalls();
    this._checkKnifeCollision();
    this._drawKnife();
    this._drawBalls();

    // 检查小球是否死亡（半径为0）
    for (let i = 0; i < this.balls.length; i++) {
      if (this.balls[i].radius <= 0) {
        const deadBall = this.balls[i];
        // 查找可能的击杀者（最后一个带有小刀并与它碰撞的小球）
        let killer = null;
        if (deadBall.lastHitBy) {
          killer = this.getBall(deadBall.lastHitBy);
        }

        // 记录击杀信息
        if (killer) {
          this.killFeed.push({
            killerId: killer.id,
            killerColor: killer.color,
            victimId: deadBall.id,
            victimColor: deadBall.color,
            time: new Date()
          });

          // 触发击杀事件
          if (this.onKill) {
            this.onKill({
              killerColor: killer.color,
              victimColor: deadBall.color,
              ballsNumber: this.balls.length-1
            });
          }
        }

        this.balls.splice(i, 1);
        i--; // 调整索引
      }
    }

    this.animationId = requestAnimationFrame(() => this._animate());
  }

  /**
   * 开始模拟
   */
  start() {
    if (!this.animationId) {
      this._animate();
    }
  }

  /**
   * 停止模拟
   */
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * 设置方框边界
   */
  setBoxBoundary(x, y, width, height) {
    this.box = { x, y, width, height };
  }

  /**
   * 设置小刀图片
   */
  setKnifeImage(img) {
    this.knife.img = img;
    this._placeKnifeRandomly();
  }
}
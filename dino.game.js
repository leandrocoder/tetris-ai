class DinoGame extends Game {
    dino = {
        x: 0,
        y: 0,
        width: 8,
        height: 16,
        speed: 2.5,
        vy: 0,
        ducking: false,
        duckHeight: 8,
        jumping: false,
        jumpSpeed: 8,
        gravity: 0.9,
    };

    ground = { x: 0, y: 120, width: 160, height: 8 }
    cactus = { x: 0, y: 0, width: 8, height: 8, passed: false, distance: 160 }
    score = 0;
    highScore = 0;

    cacti = [];
    nextCarctus = 0;

    start() {
        this.reset();
    }

    reset() {
        super.reset();
        
        this.dino.x = 20;
        this.dino.y = this.ground.y - this.dino.height;
        this.dino.vy = 0;
        this.dino.speed = 2.5;
        this.dino.jumping = false;
        this.dino.ducking = false,
            this.score = 0;
        this.cacti = [];
        this.createCactus();
    }

    createCactus() {
        const cactus = Object.assign({}, this.cactus);
        cactus.x = 160;
        cactus.y = this.ground.y - cactus.height;
        cactus.passed = false;
        this.cacti.push(cactus);
        this.nextCarctus = Math.random() * 1000 + 1000;
    }

    update(delta) {

        const dinoHeight = this.dino.ducking ? this.dino.duckHeight : this.dino.height;

        this.dino.vy += this.dino.gravity * delta / 25 * (this.dino.ducking ? 2 : 1);
        this.dino.y += this.dino.vy * delta / 25;
        if (this.dino.y >= this.ground.y - this.dino.height) {
            this.dino.jumping = false;
            const dinoY = this.dino.ducking ? this.ground.y - this.dino.duckHeight : this.ground.y - this.dino.height;
            this.dino.y = dinoY;
            this.dino.vy = 0;
        }

        // move cacuts
        for (const cactus of this.cacti) {
            cactus.x -= this.dino.speed * delta / 25;


            // check collision with cactus
            if (this.dino.x + this.dino.width > cactus.x &&
                this.dino.x < cactus.x + cactus.width &&
                this.dino.y + dinoHeight > cactus.y) {
                this.highScore = Math.max(this.highScore, this.score);
                this.dispatchEvent('gameover', { reward: this.score });
                this.reset();
                return;
            }

            // check if cactus has been passed
            if (!cactus.passed && this.dino.x > cactus.x) {
                cactus.passed = true;
                this.score++;
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                }
                if (this.score % 10 === 0) {
                    this.dino.speed += 0.5;
                    if (this.dino.speed > 14) {
                        this.dino.speed = 14;
                    }
                }
            }

            cactus.distance = cactus.x - this.dino.x - this.dino.width;

        }

        // remove off-screen cacti and create new ones
        this.cacti = this.cacti.filter(cactus => cactus.x > -20);
        if (this.cacti.length < 2) {
            this.nextCarctus -= delta;
            if (this.nextCarctus < 0)
            {
                this.createCactus();
            }
        }

        // get the closest cactus
        const closestCactus = this.cacti.reduce((closest, cactus) => {
            if (cactus.distance > 0 && (closest === null || cactus.distance < closest.distance)) {
                return cactus;
            }
            return closest;
        }, null);

        this.dispatchEvent('tick', { reward:this.score, input: [closestCactus?.distance || 160, this.dino.speed, this.dino.jumping, this.dino.ducking], reward: this.score });
    }

    draw() {
        this.drawRect(this.ground.x, this.ground.y, this.ground.width, this.ground.height, '#fff')
        const dinoHeight = this.dino.ducking ? this.dino.duckHeight : this.dino.height;
        this.drawRect(this.dino.x, this.dino.y, this.dino.width, dinoHeight, '#fff');
        for (const cactus of this.cacti) {
            this.drawRect(cactus.x, cactus.y, cactus.width, cactus.height, '#fff');
        }
        this.drawText(`Score: ${this.score}`, 1, 1);
        this.drawText(`High Score: ${this.highScore}`, 1, 3);
    }

    handleKeyDown(event) {
        if (event.keyCode === 38 && !this.dino.jumping && !this.dino.ducking) {
            this.dino.jumping = true;
            this.dino.vy -= this.dino.jumpSpeed;
        } else if (event.keyCode === 40 && !this.dino.ducking) {
            this.dino.ducking = !this.dino.ducking;
        }
    }

    handleKeyUp(event) {
        if (event.keyCode === 40) {
            this.dino.ducking = false;
        }
    }
}
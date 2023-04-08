class Game {

    framework = {
        canvas: null,
        ctx: null,
        tickSpeed: 1,
        scale: 1,
        tile_size: 8,
        isPlaying: false,
        inited: false
    }

    constructor(target, options = {}) {

        this.__eventList = []

        Object.assign(this.framework, options);
        if (!target) target = 'gamecanvas';
        this.framework.canvas = document.getElementById(target);
        if (!this.framework.canvas) {
            this.framework.canvas = document.createElement('framework.canvas');
            this.framework.canvas.id = target;
            document.body.appendChild(this.framework.canvas);
        }

        this.framework.canvas.width = 160 * this.framework.scale;
        this.framework.canvas.height = 144 * this.framework.scale;
        this.framework.ctx = this.framework.canvas.getContext('2d');
        this.framework.ctx.scale(this.framework.scale * this.framework.tile_size, this.framework.scale * this.framework.tile_size);
        this.framework.ctx.imageSmoothingEnabled = false;
        this.framework.ctx.textBaseline = 'top';
        this.framework.ctx.textAlign = 'left';
        this.framework.ctx.font = `1px "Press Start 2P"`; // 1px because we scale it up

        document.addEventListener('keydown', e => this.handleKeyDown(e));
        document.addEventListener('keyup', e => this.handleKeyUp(e));
        setTimeout(() => this.initGameLoop());
    }

    addEventListener(name, callback)
    {
        if (name && callback) this.__eventList.push({name, callback})
    }

    removeEventListener(name, callback)
    {
        if (this.__eventList && this.__eventList.length)
        {
            for (let i = this.__eventList.length - 1; i >= 0; i--)
            {
                if (this.__eventList[i] && this.__eventList[i].name === name)
                {
                    if (!callback || this.__eventList[i].callback === callback)
                    {
                        this.__eventList.splice(i, 1)
                    }
                }
            }
        }
    }

    dispatchEvent(name, data)
    {
        for (let i = 0; i < this.__eventList.length; i++)
        {
            if (this.__eventList[i].name === name) this.__eventList[i].callback(data) 
        }
    }

    initGameLoop() {
        if (this.framework.inited) return;
        this.framework.inited = true;
        let lastTimeStamp = 0;
        this.framework.isPlaying = true;
        const _update = (timestamp) => {
            const delta = timestamp - lastTimeStamp;
            lastTimeStamp = timestamp;
            if (this.framework.isPlaying) {
                for (let i = 0; i < this.framework.tickSpeed; i++) this.update(delta);
                this.drawRect(0, 0, this.framework.canvas.width, this.framework.canvas.height, '#000');
                this.draw();
            }
            requestAnimationFrame(_update);
        };
        this.start()
        _update(0);
    }

    drawText(text, x, y, color = '#fff') {
        this.framework.ctx.fillStyle = color;
        this.framework.ctx.fillText(text, x, y);
    }

    drawRect(x, y, w, h, color = '#fff') {
        this.framework.ctx.fillStyle = color;
        this.framework.ctx.fillRect(x / this.framework.tile_size, y / this.framework.tile_size, w / this.framework.tile_size, h / this.framework.tile_size);
    }

    // Methods to override
    start() { }
    reset() { }
    update() { }
    draw() { }
    handleKeyDown(event) { }
    handleKeyUp(event) { }
}


class Tetris {
    
    constructor(options = {}) {

        this.options = Object.assign({
            scale: 15,
            tickSpeed: 1,
            gameCanvas: 'game', 
            nextCanvas:'next', 
            cols:10, 
            rows:20,
            use7Bag: true,
            showNextPiece: true,
            increaseLevel: true,
            onGameOver: null,
            onBeforeConnect:null,
            onLineClear: null,
            onStartTurn:null,
            onReset: null
        }, options);

        this.canvas = document.getElementById(this.options.gameCanvas);
        if (this.canvas) {
            this.canvas.width = this.options.cols * this.options.scale;
            this.canvas.height = this.options.rows * this.options.scale;
            this.ctx = this.canvas.getContext('2d');
            this.ctx.scale(this.options.scale, this.options.scale);
        }
        this.nextCanvas = document.getElementById(this.options.nextCanvas);
        if (this.nextCanvas) {
            this.nextCanvas.width = 4 * this.options.scale;
            this.nextCanvas.height = 4 * this.options.scale;
            this.nextCtx = this.nextCanvas.getContext('2d');
            this.nextCtx.scale(this.options.scale, this.options.scale);
        }

        this.grid = this.createMatrix(10, this.options.rows + 2);
        this.piece = null;
        this.nextPiece = null;

        this.colors = [
            null,
            '#D35F5F', // Vermelho claro
            '#DBA253', // Laranja
            '#6BB26B', // Verde claro
            '#1C86EE', // Azul
            '#9370DB', // Roxo
            '#3CB371', // Verde escuro
            '#FFD700', // Amarelo
        ];

        this.points = 0;
        this.lines = 0;

        this.dropCounter = 0;
        this.dropInterval = 500;

        this.running = false;

        this.bag = ['T', 'O', 'L', 'J', 'I', 'S', 'Z'];
        this.bag.sort(() => Math.random() - 0.5);

        this.draw = this.draw.bind(this);
        this.drawNextPiece = this.drawNextPiece.bind(this);
        this.update = this.update.bind(this);
        if (this.nextCanvas) this.drawNextPiece();
        if (this.canvas) {
            this.draw();
            document.addEventListener('keydown', event => {
                if (!this.running) return;
                if (event.keyCode === 32) this.drop(Infinity);
                else if (event.keyCode === 37) this.move(-1);
                else if (event.keyCode === 39) this.move(1);
                else if (event.keyCode === 38)  this.rotate(1);
                else if (event.keyCode === 40) this.drop();
            });
        }
        this.update();
    }
    
    start() {
        this.pieceReset();
        this.running = true;
        this.options.onReset?.();
    }

    gameOver() {
        this.running = false;
        this.options.onGameOver?.();
    }

    reset() {
        this.grid = this.createMatrix(this.options.cols, this.options.rows + 2);
        this.piece = null;
        this.nextPiece = null;
        this.points = 0;
        this.lines = 0;
        this.dropCounter = 0;
        this.dropInterval = 500;
        this.bag = ['T', 'O', 'L', 'J', 'I', 'S', 'Z'];
        this.bag.sort(() => Math.random() - 0.5);
        if (this.canvas) {
            this.canvas.width = this.options.cols * this.options.scale;
            this.canvas.height = this.options.rows * this.options.scale;
            this.ctx = this.canvas.getContext('2d');
            this.ctx.scale(this.options.scale, this.options.scale);
        }
        this.start();
    }

    createMatrix(w, h) {
        const matrix = [];
        while (h--) matrix.push(new Array(w).fill(0));
        return matrix;
    }

    collide(grid, matrix, pos) {
        const m = matrix;
        const o = pos;
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                    (grid[y + o.y] &&
                        grid[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    merge(piece, grid) {
        this.options.onBeforeConnect?.(piece, grid);
        piece.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    grid[y + piece.pos.y][x + piece.pos.x] = value;
                }
            });
        });
    }

    drop(amount, piece, grid) {
        if (!this.running) return;
        if (!piece) piece = this.piece;
        if (!grid) grid = this.grid;
        if (!amount) amount = 1;
        for (let i = 0; i < amount; i++)
        {
            piece.pos.y++;
            if (this.collide(grid, piece.matrix, piece.pos)) {
                piece.pos.y--;
                this.merge(piece, grid);
                this.pieceReset();
                this.clearLines();
                break;
            }
        }
        this.dropCounter = 0;
    }

    move(offset, piece, grid) {
        if (!piece) piece = this.piece;
        if (!grid) grid = this.grid;
        piece.pos.x += offset;
        if (this.collide(grid, piece.matrix, piece.pos)) {
            piece.pos.x -= offset;
            return false;
        }
        return true;
    }

    randomizePiece() {
        if (this.options.use7Bag) {
            const next = this.bag.pop();
            if (this.bag.length === 0) {
                this.bag = ['T', 'O', 'L', 'J', 'I', 'S', 'Z'];
                this.bag.sort(() => Math.random() - 0.5);
            }
            return next;
        }
        const pieces = 'TOLJISZ';
        return 'TOLJISZ'[pieces.length * Math.random() | 0];
    }

    pieceReset() {
        this.piece = this.createPiece(this.nextPiece?.type || this.randomizePiece());
        this.nextPiece = this.createPiece(this.randomizePiece());

        if (this.collide(this.grid, this.piece.matrix, this.piece.pos)) {
            this.gameOver();
            return false;
        }

        this.options.onStartTurn?.(this.piece?.type, this.nextPiece?.type);
        return true;
    }

    rotate(dir, piece, grid) {
        if (!piece) piece = this.piece;
        if (!grid) grid = this.grid;
        const pos = piece.pos.x;
        let offset = 1;
        this._rotate(piece.matrix, dir);
        while (this.collide(grid, piece.matrix, piece.pos)) {
            piece.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > piece.matrix[0].length) {
                this._rotate(piece.matrix, -dir);
                piece.pos.x = pos;
                return;
            }
        }
    }

    _rotate(matrix, dir) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
            }
        }

        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }

    projectGhost(piece, grid) {
        if (!piece) piece = this.piece;
        if (!grid) grid = this.grid;
        if (!piece || !grid) return;
        const ghost = JSON.parse(JSON.stringify(piece));
        while (!this.collide(grid, ghost.matrix, ghost.pos)) {
            ghost.pos.y++;
        }
        ghost.pos.y--;
        return ghost;
    }

    drawNextPiece() {
        requestAnimationFrame(this.drawNextPiece);
        this.nextCtx.fillStyle = '#F0EAD6';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        if (!this.options.showNextPiece) return;
        this.drawMatrix(this.nextCtx, this.nextPiece?.matrix, { 
            x: (4 - this.nextPiece?.matrix[0].length) / 2 , 
            y: (4 - this.nextPiece?.matrix.length) / 2
        });
    }

    draw() {
        requestAnimationFrame(this.draw);
        this.ctx.fillStyle = '#F0EAD6';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawMatrix(this.ctx, this.grid, { x: 0, y: -2 });
        this.drawMatrix(this.ctx, this.projectGhost()?.matrix, { x: this.projectGhost()?.pos?.x, y: this.projectGhost()?.pos?.y - 2 }, '#00000011');
        this.drawMatrix(this.ctx, this.piece?.matrix, { x: this.piece?.pos?.x, y: this.piece?.pos?.y - 2 });
    }

    drawMatrix(ctx, matrix, offset, colorOverride) {
        if (!matrix) return;
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    ctx.fillStyle = colorOverride ? colorOverride : this.colors[value];
                    ctx.fillRect(x + offset.x,
                        y + offset.y,
                        1, 1);
                }
            });
        });
    }

    update() {
        setTimeout(() => this.update(), 0);
        if (!this.running) return;
        for (let i = 0; i < this.options.tickSpeed; i++) {
            this.dropCounter += 10;
            if (this.dropCounter > this.dropInterval) {
                this.drop();
            }
        }
    }

    clearLines() {
        let amount = 0;
        for (let y = this.grid.length - 1; y >= 0; y--) {
            let isLineFull = this.grid[y].every(value => value !== 0);
            if (isLineFull) {
                this.grid.splice(y, 1);
                this.grid.unshift(new Array(this.grid[0].length).fill(0));
                this.points += 100;
                amount++;
            }
        }
        this.lines += amount;
        this.options.onLineClear?.(amount);
    }

    createPiece(type) {
        const piece = { type };
        if (type === 'T') {
            piece.matrix = [
                [1, 1, 1],
                [0, 1, 0],
                [0, 0, 0],
            ];
        } else if (type === 'O') {
            piece.matrix = [
                [2, 2],
                [2, 2],
            ];
        } else if (type === 'L') {
            piece.matrix = [
                [0, 3, 0],
                [0, 3, 0],
                [0, 3, 3],
            ];
        } else if (type === 'J') {
            piece.matrix = [
                [0, 4, 0],
                [0, 4, 0],
                [4, 4, 0],
            ];
        } else if (type === 'I') {
            piece.matrix = [
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
            ];
        } else if (type === 'S') {
            piece.matrix = [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0],
            ];
        } else if (type === 'Z') {
            piece.matrix = [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0],
            ];
        }
        piece.pos = { 
            x: Math.floor((this.options.cols - piece.matrix[0].length) / 2), 
            y: 0 
        };
        return piece;
    }
}

class Tetris {
    
    constructor(options = {}) {

        this.options = Object.assign({
            scale: 15,
            tickSpeed: 1,
            gameCanvas: 'game', 
            nextCanvas:'next', 
            cols:10, 
            rows:20,
            use7Bag: true
        }, options);
        
        this.scale = this.options.scale;
        this.tickSpeed = this.options.tickSpeed;

        this.canvas = document.getElementById(this.options.gameCanvas);
        if (this.canvas) {
            this.canvas.width = this.options.cols * this.scale;
            this.canvas.height = this.options.rows * this.scale;
            this.ctx = this.canvas.getContext('2d');
            this.ctx.scale(this.scale, this.scale);
        }
        this.nextCanvas = document.getElementById(this.options.nextCanvas);
        if (this.nextCanvas) {
            this.nextCanvas.width = 4 * this.scale;
            this.nextCanvas.height = 4 * this.scale;
            this.nextCtx = this.nextCanvas.getContext('2d');
            this.nextCtx.scale(this.scale, this.scale);
        }

        this.grid = this.createMatrix(10, this.options.rows + 2);
        this.piece = {
            type: 'O',
            pos: { x: 0, y: 0 },
            matrix: null
        };

        this.nextPiece = null;
        this.nextPieceMatrix = null;

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
        this.level = 1;

        this.dropCounter = 0;
        this.dropInterval = 500;

        this.bag = ['T', 'O', 'L', 'J', 'I', 'S', 'Z'];
        this.bag.sort(() => Math.random() - 0.5);

        this.draw = this.draw.bind(this);
        this.drawNextPiece = this.drawNextPiece.bind(this);
        this.update = this.update.bind(this);
        if (this.canvas) this.draw();
        if (this.nextCanvas) this.drawNextPiece();
    }

    start() {
        this.pieceReset();
        this.update();
    }

    createMatrix(w, h) {
        const matrix = [];
        while (h--) matrix.push(new Array(w).fill(0));
        return matrix;
    }

    collide(grid, piece) {
        const m = piece.matrix;
        const o = piece.pos;
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

    merge(grid, piece) {
        piece.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    grid[y + piece.pos.y][x + piece.pos.x] = value;
                }
            });
        });
    }

    drop() {
        this.piece.pos.y++;
        if (this.collide(this.grid, this.piece)) {
            this.piece.pos.y--;
            this.merge(this.grid, this.piece);
            this.pieceReset();
            this.clearLines();
        }
        this.dropCounter = 0;
    }

    move(offset) {
        this.piece.pos.x += offset;
        if (this.collide(this.grid, this.piece)) {
            this.piece.pos.x -= offset;
        }
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
        this.piece.type = this.nextPiece || this.randomizePiece();
        this.piece.matrix = this.createPiece(this.piece.type);
        this.piece.pos.y = 0;
        this.piece.pos.x = (this.grid[0].length / 2 | 0) - (this.piece.matrix[0].length / 2 | 0);
        
        this.nextPiece = this.randomizePiece();
        this.nextPieceMatrix = this.createPiece(this.nextPiece);

        if (this.collide(this.grid, this.piece)) {
            this.grid.forEach(row => row.fill(0));
        }
    }

    rotate(dir) {
        const pos = this.piece.pos.x;
        let offset = 1;
        this._rotate(this.piece.matrix, dir);
        while (this.collide(this.grid, this.piece)) {
            this.piece.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > this.piece.matrix[0].length) {
                this._rotate(this.piece.matrix, -dir);
                this.piece.pos.x = pos;
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

    drawNextPiece() {
        requestAnimationFrame(this.drawNextPiece);
        this.nextCtx.fillStyle = '#F0EAD6';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        this.drawMatrix(this.nextCtx, this.nextPieceMatrix, { x: 0, y: 0 });
    }

    draw() {
        requestAnimationFrame(this.draw);
        this.ctx.fillStyle = '#F0EAD6';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawMatrix(this.ctx, this.grid, { x: 0, y: -2 });
        this.drawMatrix(this.ctx, this.piece.matrix, { x: this.piece.pos.x, y: this.piece.pos.y - 2 });
    }

    drawMatrix(ctx, matrix, offset) {
        if (!matrix) return;
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    ctx.fillStyle = this.colors[value];
                    ctx.fillRect(x + offset.x,
                        y + offset.y,
                        1, 1);
                }
            });
        });
    }

    update() {
        //requestAnimationFrame(this.update);
        setTimeout(() => this.update(), 0);
        for (let i = 0; i < this.tickSpeed; i++) {
            this.dropCounter += 10;
            if (this.dropCounter > this.dropInterval) {
                this.drop();
            }
        }
    }

    increaseLevel() {
        this.level++;
        this.dropInterval = Math.max(this.dropInterval * 0.8, 100);
    }

    clearLines() {
        for (let y = this.grid.length - 1; y >= 0; y--) {
            let isLineFull = this.grid[y].every(value => value !== 0);
            if (isLineFull) {
                this.grid.splice(y, 1);
                this.grid.unshift(new Array(this.grid[0].length).fill(0));
                this.points += 100;
                this.lines++;
                if (this.lines >= this.level * 10) {
                    this.increaseLevel();
                }
            }
        }
    }

    createPiece(type) {
        if (type === 'T') {
            return [
                [1, 1, 1],
                [0, 1, 0],
                [0, 0, 0],
            ];
        } else if (type === 'O') {
            return [
                [2, 2],
                [2, 2],
            ];
        } else if (type === 'L') {
            return [
                [0, 3, 0],
                [0, 3, 0],
                [0, 3, 3],
            ];
        } else if (type === 'J') {
            return [
                [0, 4, 0],
                [0, 4, 0],
                [4, 4, 0],
            ];
        } else if (type === 'I') {
            return [
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
            ];
        } else if (type === 'S') {
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0],
            ];
        } else if (type === 'Z') {
            return [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0],
            ];
        }
    }
}

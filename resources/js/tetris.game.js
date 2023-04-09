class TetrisGame extends Game {

    constructor(canvasId) {

        super(canvasId, { scale: 2, tile_size: 7} );

        this.arena = this.createMatrix(10, 20);
        this.player = {
            pos: { x: 0, y: 0 },
            matrix: null
        };

        this.futurePlayer = JSON.parse(JSON.stringify(this.player));

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
        this.maxHeight = 0;
        this.holes = 0;
        this.roughness = 0;

        this.lines = 0;
        this.level = 1;

        this.dropCounter = 0;
        this.dropInterval = 400;
        this.lastTime = 0;

        this.hold = null;
        this.hasHold = false;
    }

    handleKeyDown(e) {
        const { keyCode } = e;
        if (keyCode === 37) {
            this.playerMove(-1);
        } else if (keyCode === 38) {
            this.playerRotate(1);
        } else if (keyCode === 39) {
            this.playerMove(1);
        } else if (keyCode === 40) {
            this.playerDrop();
        } else if (keyCode === 72) { // Pressione a tecla 'H' para segurar a peça
            this.playerHold();
        }
    }

    start() {
        this.playerReset();
    }

    createMatrix(w, h) {
        const matrix = [];
        while (h--) {
            matrix.push(new Array(w).fill(0));
        }
        return matrix;
    }

    collide(arena, player) {
        const m = player.matrix;
        const o = player.pos;
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                    (arena[y + o.y] &&
                        arena[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    merge(arena, player) {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    arena[y + player.pos.y][x + player.pos.x] = value;
                }
            });
        });
    }

    playerDrop() {
        this.player.pos.y++;
        if (this.collide(this.arena, this.player)) {
            this.player.pos.y--;
            this.merge(this.arena, this.player);
            this.playerReset();
            this.clearLines();

            this.dispatchEvent('connect', {
                holes: this.getHoles(),
                maxHeight: this.getMaxHeight(),
                roughness: this.getRoughness(),
            });
        }
        this.dropCounter = 0;
    }

    playerMove(offset) {
        this.player.pos.x += offset;
        if (this.collide(this.arena, this.player)) {
            this.player.pos.x -= offset;
        }
    }

    playerReset() {
        this.hasHold = false;

        const pieces = 'TJLOSZI';
        const index = pieces.length * Math.random() | 0;

        this.player.matrix = this.createPiece(pieces[index]);
        this.player.type = index;
        this.player.pos.y = 0;
        this.player.pos.x = (this.arena[0].length / 2 | 0) - (this.player.matrix[0].length / 2 | 0);

        if (this.collide(this.arena, this.player)) {
            // GAME OVER
            this.arena.forEach(row => row.fill(0));
            this.dispatchEvent('gameover');
        }
    }

    playerRotate(dir) {
        const pos = this.player.pos.x;
        let offset = 1;
        this.rotate(this.player.matrix, dir);
        while (this.collide(this.arena, this.player)) {
            this.player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > this.player.matrix[0].length) {
                this.rotate(this.player.matrix, -dir);
                this.player.pos.x = pos;
                return;
            }
        }
    }

    rotate(matrix, dir) {
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

    draw() {
        this.drawRect(0, 0, this.framework.canvas.width, this.framework.canvas.height, '#619f98')
        this.drawWalls();
        this.drawMatrix(this.arena, { x: 2, y: 0 });
        this.drawMatrix(this.player.matrix, { x: 2 + this.player.pos.x, y: this.player.pos.y });
        this.drawMatrix(this.futurePlayer.matrix, { x: 2 + this.futurePlayer.pos.x, y: this.futurePlayer.pos.y }, '#00000033');
        this.drawStats();
    }

    drawWalls() {
        this.framework.ctx.fillStyle = '#F0EAD6'; // Fundo estilo Game Boy
        this.framework.ctx.fillRect(1, 0, 12, this.framework.canvas.height);
        this.framework.ctx.fillStyle = '#003300';
        this.framework.ctx.fillRect(1, 0, 1, this.framework.canvas.height);
        this.framework.ctx.fillRect(12, 0, 1, this.framework.canvas.height);
        this.framework.ctx.fillRect(1, 20, 12, 1);
    }

    drawMatrix(matrix, offset, color = null) {
        if (!matrix) return;
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.framework.ctx.fillStyle = !color ? this.colors[value] : color;
                    this.framework.ctx.fillRect(x + offset.x,
                        y + offset.y,
                        1, 1);
                }
            });
        });
    }

    projectFuturePlayer() {
        this.futurePlayer = JSON.parse(JSON.stringify(this.player));

        let collide = false;
        while (!collide) {
            this.futurePlayer.pos.y++;
            collide = this.collide(this.arena, this.futurePlayer);
            if (collide) {
                this.futurePlayer.pos.y--;
            }
        }
    }

    update(delta = 0) {

        this.dropCounter += delta;
        if (this.dropCounter > this.dropInterval) {
            this.playerDrop();
        }

        this.projectFuturePlayer();

        this.dispatchEvent('tick', {delta});
    }

    /*
    drawText(text, x, y, size = 0.9, color = '#003300') {
        const maxChars = 9;
        text = text.substring(0, maxChars);
        while (text.length < maxChars) text = ' ' + text;
        this.framework.ctx.font = `${size}px "Press Start 2P"`;
        this.framework.ctx.fillStyle = color;
        this.framework.ctx.fillText(text, x, y);
    }
    */

    increaseLevel() {
        this.level++;
        this.dropInterval = Math.max(this.dropInterval * 0.8, 100); // Ajuste o fator de 0.8 e o valor mínimo (100) conforme desejado
    }

    drawStats() {
        this.drawText(`SCORE`, 14, 1, '#003300');
        this.drawText(`${this.points}`, 14, 3, '#003300');

        this.drawText(`LEVEL`, 14, 5, '#003300');
        this.drawText(`${this.level}`, 14, 7, '#003300');

        this.drawText(`LINES`, 14, 9, '#003300');
        this.drawText(`${this.lines}`, 14, 11, '#003300');
    }

    clearLines() {
        for (let y = this.arena.length - 1; y >= 0; y--) {
            let isLineFull = this.arena[y].every(value => value !== 0);
            if (isLineFull) {
                this.arena.splice(y, 1);
                this.arena.unshift(new Array(this.arena[0].length).fill(0));

                this.points += 100; // Atualiza a pontuação ao limpar uma linha
                this.lines++;

                this.dispatchEvent('line');

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

    playerHold() {
        if (!this.hasHold) {
            if (this.hold === null) {
                this.hold = this.player.matrix;
                this.playerReset();
            } else {
                const temp = this.player.matrix;
                this.player.matrix = this.hold;
                this.hold = temp;
                this.player.pos.y = 0;
                this.player.pos.x = Math.floor(this.arena[0].length / 2) - Math.floor(this.player.matrix[0].length / 2);
            }
            this.hasHold = true;
        }
    }

    getMaxHeight() {
        let maxHeight = 0;
        for (let x = 0; x < this.arena[0].length; x++) {
            for (let y = 0; y < this.arena.length; y++) {
                if (this.arena[y][x] !== 0) {
                    maxHeight = Math.max(maxHeight, this.arena.length - y);
                    break;
                }
            }
        }
        return maxHeight;
    }

    getHoles(future = false) {
        let holes = 0;

        let matrix = JSON.parse(JSON.stringify(this.arena));

        if (future) {
            this.merge(matrix, this.player);
        }

        for (let x = 0; x < matrix[0].length; x++) {
            let foundFilled = false;
            for (let y = 0; y < matrix.length; y++) {
                if (matrix[y][x] !== 0) {
                    foundFilled = true;
                } else if (foundFilled && matrix[y][x] === 0) {
                    holes++;
                }
            }
        }

        return holes;
    }

    getIncompleteLines() {
        let incompleteLines = 0;
        for (let y = 0; y < this.arena.length; y++) {
            let hasEmpty = false;
            let hasFilled = false;
            for (let x = 0; x < this.arena[y].length; x++) {
                if (this.arena[y][x] === 0) {
                    hasEmpty = true;
                } else {
                    hasFilled = true;
                }
            }
            if (hasEmpty && hasFilled) {
                incompleteLines++;
            }
        }
        return incompleteLines;
    }

    getRoughness(future = false) {
        let roughness = 0;

        let matrix = JSON.parse(JSON.stringify(this.arena));

        if (future) {
            this.merge(matrix, this.player);
        }

        for (let x = 0; x < matrix[0].length - 1; x++) {
            let col1Height = 0;
            let col2Height = 0;
            for (let y = 0; y < matrix.length; y++) {
                if (matrix[y][x] !== 0) {
                    col1Height = matrix.length - y;
                    break;
                }
            }
            for (let y = 0; y < matrix.length; y++) {
                if (matrix[y][x + 1] !== 0) {
                    col2Height = matrix.length - y;
                    break;
                }
            }
            roughness += Math.abs(col1Height - col2Height);
        }
        return roughness;
    }
}
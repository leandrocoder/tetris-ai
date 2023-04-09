class TetrisAI extends AI {

    // Camada de entrada
    // board, peça atual, posição da peça atual, rotação da peça atual

    constructor(game) {
        super();
        this.game = game;
        this.inputNeurons = 34;
        this.hiddenNeurons = 48;
        this.outputNeurons = 2;
        this.genomesPerGeneration = 16;
        this.best = 0;
        this.iterations = 1;

        this.mutationProbability = 0.4;

        this.connectedPieces = 0;
        this.goodConnections = 0;
        this.awesomeConnections = 0;
        this.lines = 0;
        this.holes = 0;
        this.maxHeight = 0;
        this.roughness = 0;

        this.game.addEventListener('line', () => {
            this.lines++;
        });

        this.game.addEventListener('connect', ({holes = 0, maxHeight = 0, roughness = 0}) => {
            this.connectedPieces++;
            
            if (maxHeight === this.maxHeight) {
                this.goodConnections++;
            }

            if (maxHeight < this.maxHeight) {
                this.awesomeConnections++;
            }
            
            if (holes === this.holes) {
                this.goodConnections++;
            }

            if (holes < this.holes) {
                this.awesomeConnections++;
            }

            this.holes = holes;
            this.maxHeight = maxHeight;
            this.roughness = roughness;
        });
    }

    buildGenome() {
        return new Architect.Perceptron(this.inputNeurons, this.hiddenNeurons, this.outputNeurons);
    }

    calculateFitness() {

        let fitness = 0;
        fitness += this.connectedPieces;
        fitness += this.goodConnections * 100;
        fitness += this.awesomeConnections * 500;
        fitness += this.lines * 10000;
        return fitness;
    }

    matrixToNumber(matrix) {
        let res = '';
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                res += matrix[y][x];
            }
        }
        return parseInt(res);
    }

    get2DMatrix(matrix, piece) {

        const matrixClone = JSON.parse(JSON.stringify(matrix));

        for (let y = 0; y < matrixClone.length; y++) {
            for (let x = 0; x < matrixClone[y].length; x++) {
                if (matrixClone[y][x] !== 0) {
                    matrixClone[y][x] = 1;
                }
            }
        }

        /*
        const pieceMatrix = piece.matrix;
        const pieceX = piece.pos.x;
        const pieceY = piece.pos.y;

        for (let y = 0; y < pieceMatrix.length; y++) {
            for (let x = 0; x < pieceMatrix[y].length; x++) {
                if (pieceMatrix[y][x] !== 0) {
                    matrixClone[y + pieceY][x + pieceX] = piece.type;
                }
            }
        }
        */

        const result = [];
        for (let y = 0; y < matrixClone.length; y++) {
            let row = '1';
            for (let x = 0; x < matrixClone[y].length; x++) {
                row += matrixClone[y][x];
            }
            row += '1';
            result.push(parseInt(row));
        }

        

        return result;
    }

    getPiecePositions(piece) {
        let result = []
        for (let y = 0; y < piece.matrix.length; y++) {
            for (let x = 0; x < piece.matrix[y].length; x++) {
                if (piece.matrix[y][x] !== 0) {
                    result.push(x + piece.pos.x);
                    result.push(y + piece.pos.y);
                }
            }
        }
        return result;
    }

    executeGenome(genome, next) {
        super.executeGenome(genome, next);

        this.game.reset();
        this.game.removeEventListener('tick');
        this.game.removeEventListener('gameover');

        let tickCount = 0;

        this.genome++;
        this.iterations++;

        const onTick = () => {

            tickCount++;
            if (tickCount % 10 !== 0) return;

            const input = [
                tickCount,
                this.game.player.type,
                this.game.player.pos.x,
                this.game.player.pos.y,
                ...this.getPiecePositions(this.game.futurePlayer),
                this.holes - this.game.getHoles(true),
                this.roughness - this.game.getRoughness(true),
                ...this.get2DMatrix(this.game.arena, this.game.player),
            ]

            this.input = input;

            const reward = this.calculateFitness();

            this.currentReward = reward;
            this.currentInput = input;
            const outputs = genome.activate(input);
            
            if (outputs[0] <= 0.4) this.game.handleKeyDown({keyCode: 37});
            if (outputs[0] >= 0.6) this.game.handleKeyDown({keyCode: 39});
            if (outputs[1] > 0.4) this.game.handleKeyDown({keyCode: 38});

            this.dispatchEvent('data', {
                iterations: this.iterations,
                reward,
                best: this.best,
                generation: this.generation,
                bestGeneration: this.bestGeneration,
                genome: `${this.genome}/${this.genomesPerGeneration}`,
                input: this.input
            });
        }

        const onGameOver = () => {
            const reward = this.calculateFitness();
            genome.fitness = reward;
            if (reward > this.best) {
                this.best = reward;
                this.bestGeneration = this.generation;
                this.bestGenomes = JSON.parse(JSON.stringify(this.genomes));
            }

            this.active--;

            if (this.active === 0) {

                this.dispatchEvent('save-data', {
                    iterations: this.iterations,
                    best: this.best,
                    generation: this.generation,
                    bestGeneration: this.bestGeneration,
                    genomes: this.genomes
                });
            }

            this.connectedPieces = 0;
            this.goodConnections = 0;
            this.awesomeConnections = 0;
            this.lines = 0;
            this.holes = 0;
            this.maxHeight = 0;
            this.roughness = 0;

            this.game.removeEventListener('tick', onTick);
            this.game.removeEventListener('gameover', onGameOver);
            next();
        }

        this.game.addEventListener('tick', onTick);
        this.game.addEventListener('gameover', onGameOver);
    }
}
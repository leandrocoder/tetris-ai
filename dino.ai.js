class DinoAI extends AI {

    constructor(game) {
        super();
        this.game = game;
        this.inputNeurons = 3;
        this.hiddenNeurons = 6;
        this.outputNeurons = 2;
    }

    executeGenome(genome, next) {
        super.executeGenome(genome, next);

        this.game.reset();
        this.game.removeEventListener('tick');
        this.game.removeEventListener('gameover');

        this.game.addEventListener('tick', ({input, reward}) => {
            this.currentReward = reward;
            this.currentInput = input;
            const outputs = genome.activate(input);

            if (outputs[0] > 0.5) {
                this.game.handleKeyDown({keyCode: 38});
            }

            if (outputs[1] > 0.7) {
                this.game.handleKeyDown({keyCode: 40});
            }
            else {
                this.game.handleKeyUp({keyCode: 40});
            }
        });


        this.game.addEventListener('gameover', ({reward}) => {
            genome.fitness = reward;
            if (reward > this.best) this.best = reward;
            this.active--;
            next();
        });
    }
}
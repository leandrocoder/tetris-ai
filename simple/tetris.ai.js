class IA {

    constructor(game) {
        this.game = game;
        this.heightWeight = weights.heightWeight;
        this.linesWeight = weights.linesWeight;
        this.holesWeight = weights.holesWeight;
        this.bumpinessWeight = weights.bumpinessWeight;
    }

    getMaxHeight() {
        let maxHeight = 0;
        for (let x = 0; x < this.game.grid[0].length; x++) {
            for (let y = 0; y < this.game.grid.length; y++) {
                if (this.game.grid[y][x] !== 0) {
                    maxHeight = Math.max(maxHeight, this.game.grid.length - y);
                    break;
                }
            }
        }
        return maxHeight;
    }

    getHoles() {
        let holes = 0;
        for (let x = 0; x < this.game.grid[0].length; x++) {
            let foundFilled = false;
            for (let y = 0; y < this.grid.length; y++) {
                if (this.game.grid[y][x] !== 0) {
                    foundFilled = true;
                } else if (foundFilled && this.game.grid[y][x] === 0) {
                    holes++;
                }
            }
        }
        return holes;
    }

    getIncompleteLines() {
        let incompleteLines = 0;
        for (let y = 0; y < this.game.grid.length; y++) {
            let hasEmpty = false;
            let hasFilled = false;
            for (let x = 0; x < this.game.grid[y].length; x++) {
                if (this.game.grid[y][x] === 0) {
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

    getRoughness() {
        let roughness = 0;
        for (let x = 0; x < this.game.grid[0].length - 1; x++) {
            let col1Height = 0;
            let col2Height = 0;
            for (let y = 0; y < this.game.grid.length; y++) {
                if (this.game.grid[y][x] !== 0) {
                    col1Height = this.game.grid.length - y;
                    break;
                }
            }
            for (let y = 0; y < this.game.grid.length; y++) {
                if (this.game.grid[y][x + 1] !== 0) {
                    col2Height = this.game.grid.length - y;
                    break;
                }
            }
            roughness += Math.abs(col1Height - col2Height);
        }
        return roughness;
    }


}
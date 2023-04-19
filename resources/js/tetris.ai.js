class TetrisAI {

    constructor(game, weights = {
        ///*
        heightWeight: 0.687,
        linesWeight: 0.854,
        holesWeight: 0.542,
        bumpinessWeight: 0.112,
        nextPieceWeight: 0.801
        //*/
        //"heightWeight":0.7268714326405017,"linesWeight":0.09768013045919961,"holesWeight":0.5816493240708775,"bumpinessWeight":0.34071182931514626,"nextPieceWeight":-0.08784091129557045
    }) {
        this.game = game;
        this.heightWeight = weights.heightWeight;
        this.linesWeight = weights.linesWeight;
        this.holesWeight = weights.holesWeight;
        this.bumpinessWeight = weights.bumpinessWeight;
        this.nextPieceWeight = weights.nextPieceWeight;

        this.enabled = true;
    }

    best(pieces, pieceIndex, grid) {
        let best = null;
        let bestScore = null;
        let workingPiece = pieces[pieceIndex];
        let allOptions = [];
        if (!grid) grid = this.game.grid;

        for (let rotation = 0; rotation < 4; rotation++) {
            let _piece = this.game.createPiece(workingPiece);
            for (let i = 0; i < rotation; i++) {
                this.game._rotate(_piece.matrix, 1);
            }

            while (this.game.move(-1, _piece));

            let moved = true;
            while (moved) {
                const ghost = this.game.projectGhost(_piece);
                const results = this.getResults(ghost, grid);
                if (!results) break;
                let score = (this.linesWeight * results.lines) - (this.heightWeight * results.height) - (this.holesWeight * results.holes) - (this.bumpinessWeight * results.bumpiness);
                if (pieceIndex === 0 && this.game.options.showNextPiece) score += (this.best(pieces, pieceIndex + 1, results.grid)?.score || 0) * this.nextPieceWeight;

                allOptions.push({ piece: ghost, score: score });
                if (!bestScore || score > bestScore) {
                    bestScore = score;
                    best = ghost;
                }
                moved = this.game.move(1, _piece);
            }
        }

        allOptions.sort((a, b) => b.score - a.score);
        return allOptions[0];
    }

    getResults(piece, grid) {
        
        if (!piece || !grid || piece.pos.y < 0) return null;
        const rows = grid.length;
        const columns = grid[0].length;

        grid = JSON.parse(JSON.stringify(grid));
        piece = JSON.parse(JSON.stringify(piece));


        piece.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    grid[y + piece.pos.y][x + piece.pos.x] = value;
                }
            });
        });

        const columnHeight = (column) => {
            let r = 0;
            for(; r < rows && grid[r][column] == 0; r++);
            return rows - r;
        }

        // check completed lines
        let lines = 0;
        for (let r = rows - 1; r >= 0; r--) {
            if (grid[r].every(value => value !== 0)) lines++;
        }

        // check holes
        let holes = 0;
        for(let c = 0; c < columns; c++){
            let block = false;
            for(let r = 0; r < rows; r++){
                if (grid[r][c] != 0) {
                    block = true;
                }else if (grid[r][c] == 0 && block){
                    holes++;
                }
            }
        }

        // bumpiness
        let bumpiness = 0;
        for(let c = 0; c < columns - 1; c++){
            bumpiness += Math.abs(columnHeight(c) - columnHeight(c+ 1));
        }

        let height = 0;
        for(let c = 0; c < columns; c++){
            height += columnHeight(c);
        }

        // clear the lines from final grid
        for (let y = grid.length - 1; y >= 0; y--) {
            let isLineFull = grid[y].every(value => value !== 0);
            if (isLineFull) {
                grid.splice(y, 1);
                grid.unshift(new Array(grid[0].length).fill(0));
            }
        }

        return { lines, holes, bumpiness, height, grid };
    }
}
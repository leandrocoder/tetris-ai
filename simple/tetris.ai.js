class IA {

    constructor(game, weights = {
        heightWeight: 0.510066,
        linesWeight: 0.760666,
        holesWeight: 0.35663,
        bumpinessWeight: 0.184483
    }) {
        this.game = game;
        this.heightWeight = weights.heightWeight;
        this.linesWeight = weights.linesWeight;
        this.holesWeight = weights.holesWeight;
        this.bumpinessWeight = weights.bumpinessWeight;
    }

    rnd(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    best(pieces, pieceIndex) {
        let best = null;
        let bestScore = null;
        let workingPiece = pieces[pieceIndex];
        let allOptions = [];

        for (let rotation = 0; rotation < 4; rotation++) {
            let _piece = this.game.createPiece(workingPiece);
            for (let i = 0; i < rotation; i++) {
                this.game._rotate.rotate(1);
            }

            while (_piece.moveLeft(this.game.grid));
            while (this.game.grid.valid(_piece)) {
                let _pieceSet = _piece.clone();
                while (_pieceSet.moveDown(this.game.grid));
                let _grid = this.game.grid.clone();
                _grid.addPiece(_pieceSet);

                let score = null;
                score = -this.heightWeight * _grid.aggregateHeight() + this.linesWeight * _grid.lines() - this.holesWeight * _grid.holes() - this.bumpinessWeight * _grid.bumpiness();

                allOptions.push({ piece: _piece.clone(), score: score });
                if (!bestScore || score > bestScore) {
                    bestScore = score;
                    best = _piece.clone();
                }
                _piece.column++;
            }
        }

        allOptions.sort((a, b) => b.score - a.score);
        return allOptions[Math.min(window.MOVE_CHOICE, allOptions.length - 1)].piece;
    }

    sort(candidates){
        candidates.sort((a, b) => b.fitness - a.fitness);
    }

    train(params) {
        /*
        function deleteNLastReplacement(candidates, newCandidates){
            candidates.splice(-newCandidates.length);
            for(var i = 0; i < newCandidates.length; i++){
                candidates.push(newCandidates[i]);
            }
            sort(candidates);
        }
        */
        /*
        var config = Object.assign({}, {
            // Defaults:
            // Theoretical fitness limit = 5 * 200 * 4 / 10 = 400
            population: 100,
            rounds: 5,
            moves: 200,
            generations: 250
        }, params);
        var candidates = [];

        // Initial population generation
        for(var i = 0; i < config.population; i++){
            candidates.push(generateRandomCandidate());
        }

        console.log('Computing fitnesses of initial population...');
        computeFitnesses(candidates, config.rounds, config.moves);
        sort(candidates);

        var count = 0;
        while(true){
            var newCandidates = [];
            for(var i = 0; i < Math.floor(config.population * 0.3); i++){ // 30% of population
                var pair = tournamentSelectPair(candidates, 10); // 10% of population
                //console.log('fitnesses = ' + pair[0].fitness + ',' + pair[1].fitness);
                var candidate = crossOver(pair[0], pair[1]);
                if(Math.random() < 0.05){// 5% chance of mutation
                    mutate(candidate);
                }
                normalize(candidate);
                newCandidates.push(candidate);
            }
            console.log('Computing fitnesses of new candidates. (' + count + ')');
            computeFitnesses(newCandidates, config.rounds, config.moves);
            deleteNLastReplacement(candidates, newCandidates);
            var totalFitness = 0;
            for(var i = 0; i < candidates.length; i++){
                totalFitness += candidates[i].fitness;
            }
            console.log('Average fitness = ' + (totalFitness / candidates.length));
            console.log('Highest fitness = ' + candidates[0].fitness + '(' + count + ')');
            console.log('Fittest candidate = ' + JSON.stringify(candidates[0]) + '(' + count + ')');
            count++;

            if (count === 10) break;
        }
        */
    }

    computeFitnesses(candidates, numberOfGames, maxNumberOfMoves) {
        /*
        for(var i = 0; i < candidates.length; i++){
            var candidate = candidates[i];
            var ai = new AI(candidate);
            var totalScore = 0;
            for(var j = 0; j < numberOfGames; j++){
                var grid = new Grid(window.ROWS, window.COLS);
                var rpg = new RandomPieceGenerator();
                var workingPieces = [rpg.nextPiece(), rpg.nextPiece()];
                var workingPiece = workingPieces[0];
                var score = 0;
                var numberOfMoves = 0;
                while((numberOfMoves++) < maxNumberOfMoves && !grid.exceeded()){
                    workingPiece = ai.best(grid, workingPieces);
                    while(workingPiece.moveDown(grid));
                    grid.addPiece(workingPiece);
                    score += grid.clearLines();
                    for(var k = 0; k < workingPieces.length - 1; k++){
                        workingPieces[k] = workingPieces[k + 1];
                    }
                    workingPieces[workingPieces.length - 1] = rpg.nextPiece();
                    workingPiece = workingPieces[0];
                }
                totalScore += score;
            }
            candidate.fitness = totalScore;
        }
        */
    }

    tournamentSelectPair(candidates, ways) {
        /*
        var indices = [];
        for(var i = 0; i <  candidates.length; i++){
            indices.push(i);
        }

        var fittestCandidateIndex1 = null;
        var fittestCandidateIndex2 = null;
        for(var i = 0; i < ways; i++){
            var selectedIndex = indices.splice(randomInteger(0, indices.length), 1)[0];
            if(fittestCandidateIndex1 === null || selectedIndex < fittestCandidateIndex1){
                fittestCandidateIndex2 = fittestCandidateIndex1;
                fittestCandidateIndex1 = selectedIndex;
            }else if (fittestCandidateIndex2 === null || selectedIndex < fittestCandidateIndex2){
                fittestCandidateIndex2 = selectedIndex;
            }
        }
        return [candidates[fittestCandidateIndex1], candidates[fittestCandidateIndex2]];
        */
    }

    crossOver(candidate1, candidate2){
        const candidate = {
            heightWeight: candidate1.fitness * candidate1.heightWeight + candidate2.fitness * candidate2.heightWeight,
            linesWeight: candidate1.fitness * candidate1.linesWeight + candidate2.fitness * candidate2.linesWeight,
            holesWeight: candidate1.fitness * candidate1.holesWeight + candidate2.fitness * candidate2.holesWeight,
            bumpinessWeight: candidate1.fitness * candidate1.bumpinessWeight + candidate2.fitness * candidate2.bumpinessWeight
        };
        normalize(candidate);
        return candidate;
    }

    mutate(candidate){
        const quantity = Math.random() * 0.4 - 0.2; // plus/minus 0.2
        switch(randomInteger(0, 4)){
            case 0:
                candidate.heightWeight += quantity;
                break;
            case 1:
                candidate.linesWeight += quantity;
                break;
            case 2:
                candidate.holesWeight += quantity;
                break;
            case 3:
                candidate.bumpinessWeight += quantity;
                break;
        }
    }

    normalize(candidate){
        const norm = Math.sqrt(candidate.heightWeight * candidate.heightWeight + candidate.linesWeight * candidate.linesWeight + candidate.holesWeight * candidate.holesWeight + candidate.bumpinessWeight * candidate.bumpinessWeight);
        candidate.heightWeight /= norm;
        candidate.linesWeight /= norm;
        candidate.holesWeight /= norm;
        candidate.bumpinessWeight /= norm;
    }

    generateRandomCandidate(){
        const candidate = {
            heightWeight: Math.random() - 0.5,
            linesWeight: Math.random() - 0.5,
            holesWeight: Math.random() - 0.5,
            bumpinessWeight: Math.random() - 0.5
        };
        this.normalize(candidate);
        return candidate;
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
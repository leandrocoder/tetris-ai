class TetrisAIGens {

    constructor(game, ai) {
        this.game = game;
        this.ai = ai;
        this.training = false;
    }

    rnd(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    deleteNLastReplacement(candidates, newCandidates) {
        candidates.splice(-newCandidates.length);
        for (let i = 0; i < newCandidates.length; i++) {
            candidates.push(newCandidates[i]);
        }
        this.sort(candidates);
    }

    train(params) {

        this.training = true;
        try {
            let config = Object.assign({}, {
                population: 100,
                rounds: 10,
                moves: 250,
                generations: 150
            }, params);
            let candidates = [];

            for (let i = 0; i < config.population; i++) {
                candidates.push(this.generateRandomCandidate());
            }

            console.log('Computing fitnesses of initial population...');
            this.computeFitnesses(candidates, config.rounds, config.moves);
            this.sort(candidates);

            let count = 0;
            while (true) {
                let newCandidates = [];
                for (let i = 0; i < Math.floor(config.population * 0.3); i++) { // 30% of population
                    let pair = this.tournamentSelectPair(candidates, 10); // 10% of population
                    let candidate = this.crossOver(pair[0], pair[1]);
                    if (Math.random() < 0.05) {// 5% chance of mutation
                        this.mutate(candidate);
                    }
                    this.normalize(candidate);
                    newCandidates.push(candidate);
                }
                console.log('Computing fitnesses of new candidates. (' + count + ')');
                this.computeFitnesses(newCandidates, config.rounds, config.moves);
                this.deleteNLastReplacement(candidates, newCandidates);
                let totalFitness = 0;
                for (let i = 0; i < candidates.length; i++) {
                    totalFitness += candidates[i].fitness;
                }
                console.log('Average fitness = ' + (totalFitness / candidates.length));
                console.log('Highest fitness = ' + candidates[0].fitness + '(' + count + ')');
                console.log('Fittest candidate = ' + JSON.stringify(candidates[0]) + '(' + count + ')');
                count++;

                if (count >= config.generations) {
                    break;
                }
            }

        } catch (e) {
            console.error(e);
        } finally {
            this.training = false;
        }
    }

    computeFitnesses(candidates, numberOfGames, maxNumberOfMoves) {
        for (let i = 0; i < candidates.length; i++) {
            console.log(`${i + 1} of ${candidates.length}`);
            let candidate = candidates[i];
            let totalScore = 0;
            for (let j = 0; j < numberOfGames; j++) {
                Object.assign(this.ai, candidate);
                this.game.reset();
                let numberOfMoves = 0;
                while ((numberOfMoves++) < maxNumberOfMoves && this.game.running) {
                    const best = this.ai.best([this.game.piece.type, this.game.nextPiece.type], 0);
                    if (best) {
                        this.game.piece = best.piece;
                        this.game.piece.pos.y = 0;
                    }
                    this.game.drop(Infinity);
                }
                console.log("score:", this.game.lines);
                totalScore += this.game.lines;
            }
            candidate.fitness = totalScore;
        }
    }

    tournamentSelectPair(candidates, ways) {
        let indices = [];
        for (let i = 0; i < candidates.length; i++) {
            indices.push(i);
        }

        let fittestCandidateIndex1 = null;
        let fittestCandidateIndex2 = null;
        for (let i = 0; i < ways; i++) {
            let selectedIndex = indices.splice(this.rnd(0, indices.length), 1)[0];
            if (fittestCandidateIndex1 === null || selectedIndex < fittestCandidateIndex1) {
                fittestCandidateIndex2 = fittestCandidateIndex1;
                fittestCandidateIndex1 = selectedIndex;
            } else if (fittestCandidateIndex2 === null || selectedIndex < fittestCandidateIndex2) {
                fittestCandidateIndex2 = selectedIndex;
            }
        }
        return [candidates[fittestCandidateIndex1], candidates[fittestCandidateIndex2]];
    }

    sort(candidates) {
        candidates.sort((a, b) => b.fitness - a.fitness);
    }

    crossOver(candidate1, candidate2) {
        const candidate = {
            heightWeight: candidate1.fitness * candidate1.heightWeight + candidate2.fitness * candidate2.heightWeight,
            linesWeight: candidate1.fitness * candidate1.linesWeight + candidate2.fitness * candidate2.linesWeight,
            holesWeight: candidate1.fitness * candidate1.holesWeight + candidate2.fitness * candidate2.holesWeight,
            bumpinessWeight: candidate1.fitness * candidate1.bumpinessWeight + candidate2.fitness * candidate2.bumpinessWeight,
            nextPieceWeight: candidate1.fitness * candidate1.nextPieceWeight + candidate2.fitness * candidate2.nextPieceWeight
        };
        this.normalize(candidate);
        return candidate;
    }

    normalize(candidate) {
        const norm = Math.sqrt(
            candidate.heightWeight * candidate.heightWeight
            + candidate.linesWeight * candidate.linesWeight
            + candidate.holesWeight * candidate.holesWeight
            + candidate.bumpinessWeight * candidate.bumpinessWeight
            + candidate.nextPieceWeight * candidate.nextPieceWeight
        );
        candidate.heightWeight /= norm;
        candidate.linesWeight /= norm;
        candidate.holesWeight /= norm;
        candidate.bumpinessWeight /= norm;
        candidate.nextPieceWeight /= norm;
    }

    generateRandomCandidate() {
        const candidate = {
            heightWeight: Math.random() - 0.5,
            linesWeight: Math.random() - 0.5,
            holesWeight: Math.random() - 0.5,
            bumpinessWeight: Math.random() - 0.5,
            nextPieceWeight: Math.random() - 0.5
        };
        this.normalize(candidate);
        return candidate;
    }

    mutate(candidate) {
        const quantity = Math.random() * 0.4 - 0.2; // plus/minus 0.2
        switch (this.rnd(0, 5)) {
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
            case 3:
                candidate.nextPieceWeight += quantity;
                break;
        }
    }
}

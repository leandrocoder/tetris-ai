const Architect = synaptic.Architect;
const Network = synaptic.Network;

class AI {

    game = null;
    genomes =  []
    genome = 0
    generation = 0
    genomesPerGeneration = 16;
    mutationProbability = 0.3;
    currentInput = null;
    currentReward = 0;

    best = 0;
    active = 0;

    debugElement = null;
    debugGenome = null;

    inputNeurons = 1;
    hiddenNeurons = 2;
    outputNeurons = 1;

    socket = null;

    constructor() {
        this.socket = new WebSocket('ws://localhost:8080');
        this.socket.onopen = () => {
            console.log('Conectado ao servidor');
            this.socket.send('Olá, servidor!');
        };
        this.socket.onmessage = (event) => {
            console.log('Mensagem recebida:', event.data);
        };
        this.socket.onclose = () => {
            console.log('Desconectado do servidor');
        };
    }

    train() {
        this.genome = 0;
        this.generation = 0;
        this.active = 0;
        this.debugElement = document.getElementById('debug');
        this.runGeneration();
        setInterval(() => {this.drawDebug()}, 100)
    }

    drawDebug() {
        if (!this.debugElement) return;
        let debug = '';
        debug += 'Generation: ' + this.generation + '<br>';
        debug += 'Genome: ' + this.active + " / " + this.genomesPerGeneration + '<br>';
        debug += 'Best: ' + (this.best) + '<br>';
        debug += 'Current: ' + (this.currentReward ) + '<br>';
        this.debugElement.innerHTML = debug
    }

    clone(obj) { return JSON.parse(JSON.stringify(obj)); }

    getSample(items) {
        return items[Math.floor(Math.random() * items.length)];
    }

    buildGenome() {
        return new Architect.Perceptron(this.inputNeurons, this.hiddenNeurons, this.outputNeurons);
    }

    runGeneration() {
        this.game.reset();
        this.generation++;
        this.active = this.genomesPerGeneration;
        this.genome = 0;

        while (this.genomes.length < this.genomesPerGeneration) {
            this.genomes.push(this.buildGenome());
        }

        this.mapSeries(this.genomes, this.executeGenome.bind(this), () => {

            // Remove wrost players
            this.genomes = this.genomes.sort((a, b) => a.fitness - b.fitness).reverse()
            while (this.genomes.length > 2) {
                this.genomes.pop();
            }

            const bestGenomes = this.clone(this.genomes);

            // Cross gen some of best players
            while (this.genomes.length < this.genomesPerGeneration - 2) {
                const genA = this.getSample(bestGenomes);
                const genB = this.getSample(bestGenomes);
                const newGenome = this.mutate(this.crossOver(genA, genB));
                this.genomes.push(Network.fromJSON(newGenome));
            }

            // Create new mutate guys based on best players
            while (this.genomes.length < this.genomesPerGeneration) {
                const gen = this.getSample(bestGenomes);
                const newGenome = this.mutate(gen);
                this.genomes.push(Network.fromJSON(newGenome));
            }

            this.runGeneration();
        })
    }

    mapSeries(items, fn, callback, index = 0) {
        if (index >= items.length) return callback();
        fn(items[index], () => {
            this.mapSeries(items, fn, callback, index + 1);
        });
    }

    executeGenome(genome, next) {
        this.debugGenome = genome;
    }

    crossOver(a, b) {
        if (Math.random() < 0.5) {
            const tmp = a;
            a = b;
            b = tmp;
        }

        a = this.clone(a);
        b = this.clone(b);
        this.crossOverDataKey(a.neurons, b.neurons, 'bias');
        return a;
    }

    crossOverDataKey(a, b, key) {
        const cut = Math.floor(Math.random() * a.length);
        let temp = null;
        for (let i = cut; i < a.length; i++) {
            const tmp = a[i][key];
            a[i][key] = b[i][key];
            b[i][key] = tmp;
        }
    }

    mutate(network) {
        this.mutateDataKeys(network.neurons, 'bias', this.mutationProbability);
        this.mutateDataKeys(network.connections, 'weight', this.mutationProbability);
        return network;
    }

    mutateDataKeys(a, key, mutationRate) {
        for (let i = 0; i < a.length; i++) {
            if (Math.random() < mutationRate) {
                const val = a[i][key]
                a[i][key] = val * (Math.random() - 0.5) * 3 + (Math.random() - 0.5);
            }
        }
    }
}


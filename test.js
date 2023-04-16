const fs = require('fs');
const path = require('path');

async function start() {
    const files = fs.readdirSync(path.join(__dirname, 'results'));
    const stats = {};
    for (let f = 0; f < files.length; f++) {
        const file = files[f];
        const data = fs.readFileSync(path.join(__dirname, 'results', file), 'utf8');
        const json = JSON.parse(data);
        const { lines, cols, rows } = json;
        if (!stats[cols]) stats[cols] = [];
        //if (lines >= 99) {
            stats[cols].push(json);
        //}
    }

    const keys = Object.keys(stats);
    for (let k = 0; k < keys.length; k++) {
        const key = keys[k];
        for (let i = 0; i < stats[key].length; i++) {
            console.log('key', key, stats[key][i].drops);
        }
    }
}

start();
const express = require('express');
const app = express();
app.use(express.json());

let args = process.argv.slice(2);
const port = args[0];
const STEPS = 8;
const DIR_VECTORS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
const DIRECTIONS = ['east', 'south', 'west', 'north'];
let landmarks = {};
let moves = [];
let targetLandmark = undefined;
let prev_dir = -1;
let direction = -1;
let remainder = undefined;

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function* getLandmarks(vision){
    let center = Math.floor(vision.length / 2);
    for(let i = 0; i < vision.length; i++) {
        for(let j = 0; j < vision[i].length; j++) {
            if (vision[i][j] >= 100 && vision[i][j] <= 999) {
                yield [vision[i][j], [center - i, center - j]];
            }
        }
    }
}

function reverseMove(move){
    return [2, 3, 0, 1][move];
}

app.get('/players/name', (req, res) => {
    // reset variables
    landmarks = {};
    moves = [];
    targetLandmark = undefined;
    remainder = undefined;

    return res.json({'name': 'nbot'+args[0]});
});

app.put('/players/:playerName/move', (req, res) => {    
    let vision = req.body['vision'];

    if (targetLandmark === undefined){
        // EXPLORE
        for (const lm of getLandmarks(vision)){
            landmarks[lm[0]] = [moves.length, lm[1]];
        }
        if (getRandomInt(STEPS + getRandomInt(STEPS)) === 0 || req.header('Valid-Last-Move') === 'False') {
            prev_dir = -1;
        }
        direction = prev_dir === -1 ? getRandomInt(DIRECTIONS.length) : prev_dir;
        prev_dir = direction;
        moves.push(direction);
    } else {
        // GO TO LANDMARK
        if (remainder === undefined){
            remainder = moves.length;
        }
        if (remainder > landmarks[targetLandmark][0]) {
            direction = reverseMove(moves[remainder]);
            remainder -= 1;
        } else if (remainder === landmarks[targetLandmark][0]){

        } else {
            direction = -1;
        }
    }
    return res.json({'direction': DIRECTIONS[direction]});
});

app.get('/players/:playerName/radio', (req, res) => {
    return res.json({'radio': Object.keys(landmarks)});
});

app.post('/players/:playerName/radio', (req, res) => {
    if (targetLandmark === undefined) {
        let radios = [];
        for (let playerName in req.body) {
            radios.push(req.body[playerName]);
        }
        let intersection = radios.reduce((a, b) => a.filter(c => b.includes(c)));
        console.log(intersection);
        if (intersection.length > 0) {
            targetLandmark = Math.min(...intersection);
        }
    }
    return res.send('nil');
});

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
});
const express = require('express');
const app = express();
app.use(express.json());

let args = process.argv.slice(2);
const port = args[0];

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

let prev_dir = -1;
let direction = -1;

app.get('/players/name', (req, res) => {
    console.log('got call name');
    return res.json(
        {
            'name': 'nbot'+args[0]
        }
    );
});

app.put('/players/:playerName/move', (req, res) => {    
    let response = '';
    if (getRandomInt(8 + getRandomInt(8)) === 0 || req.header('Valid-Last-Move') === 'False') {
        prev_dir = -1;
    }
    if (prev_dir === -1) {
        direction = getRandomInt(4);
    } else {
        direction = prev_dir;
    }
    prev_dir = direction;
    if (direction === 0){
        response = 'north';
    } else if (direction === 1){
        response = 'east';
    } else if (direction === 2){
        response = 'west';
    } else {
        response = 'south';
    }
    return res.json(
        {
            'direction': response
        }
    );
});

app.get('/players/:playerName/radio', (req, res) => {
    console.log('got call radio');
    return res.json(
        {
            'radio': 0
        }
    );
});

app.post('/players/:playerName/radio', (req, res) => {
    console.log('got post radio');
    console.log(req.body);
    return res.send('nil');
});

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${port}`)
});
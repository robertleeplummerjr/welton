const fs = require('fs');
const brain = require('brain.js');
const hexRgb = require('hex-rgb');
const { getAllValues } = require('./train-utils');
const trainingData = require('./assets/training-data.json');
const allValues = getAllValues(trainingData);
const bounds = {};

allValues.forEach(recipe => {
  for (const itemName in recipe) {
    if (itemName === 'Color') continue;
    if (!recipe.hasOwnProperty(itemName)) continue;
    if (bounds[itemName]) continue;
    const allNumbers = allValues.map(v => v[itemName] ? v[itemName].value : 0);
    bounds[itemName] = {
      largest: Math.max(...allNumbers),
      smallest: Math.min(...allNumbers),
    }
  }
});

function normalizeColor(quality) {
  const { red, green, blue } = hexRgb(quality.value);
  return { red: red / 255, green: green / 255, blue: blue / 255 };
}

function normalizeObject(data, includeColor) {
  let io = {};
  for (const quality in data) {
    if (!data.hasOwnProperty(quality)) continue;
    if (quality === 'Color') continue;
    const bound = bounds[quality];
    io[quality] = (data[quality].value - bound.smallest) / (bound.largest - bound.smallest);
  }
  return io;
}

const net = new brain.NeuralNetwork();

net.train(trainingData.map(beer => {
  const { red, green, blue } = normalizeColor(beer.result.Color);
  return {
    input: normalizeObject(beer.result),
    output: {
      Pilsner: beer.result.Pilsner ? beer.result.Pilsner.value : 0,
      Ale: beer.result.Ale ? beer.result.Ale.value : 0,
      red, green, blue,
      ...normalizeObject(beer.recipe),
    },
  };
}), { log: true });

fs.writeFileSync('./src/assets/trained-net.json', JSON.stringify(net.toJSON()));

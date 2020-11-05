import { getAllOutputs } from './train-utils';
import trainingData from './assets/training-data.json';
const outputs = getAllOutputs(trainingData);

const sliderBounds = getSliderBounds();

function getSliderBounds() {
  const bounds = {
    'Brew Time': { min: Infinity, max: 0 },
    'Gravity': { min: Infinity, max: 0 },
    'ABV': { min: Infinity, max: 0 },
  };
  const keys = Object.keys(bounds);
  trainingData.forEach(beer => {
    keys.forEach(key => {
      bounds[key] = getLargest(bounds[key], beer.recipe[key] ? beer.recipe[key].value : beer.result[key].value);
    });
  });
  return bounds;
}

function getLargest(bound, value) {
  let {min, max} = bound;
  if (value < min) {
    min = value;
  }
  if (value > max) {
    max = value;
  }
  return {min, max};
}

function denormalizeSliderValue(value, bound) {
  return (value * .1 * (bound.max - bound.min) + bound.min);
}


export function formatSliderInput(type, value) {
  switch (type) {
    case 'Brew Time':
      return denormalizeSliderValue(value, sliderBounds['Brew Time']) + ' Weeks';
    case 'Gravity':
      return denormalizeSliderValue(value, sliderBounds['Gravity']);
    case 'ABV':
      return denormalizeSliderValue(value, sliderBounds['ABV']) + '%';
    default:
      return value;
  }
}

function denormalizeOutputValue(value, bound) {
  return (value * (bound.max - bound.min) + bound.min);
}

const outputBounds = getOutputBounds();
function getOutputBounds() {
  const bounds = {};
  trainingData.forEach(beer => {
    const recipe = beer.recipe;
    for (const key in recipe) {
      if (!bounds[key]) {
        bounds[key] = { min: Infinity, max: 0 };
      }
      bounds[key] = {...getLargest(bounds[key], beer.recipe[key].value), formatter: beer.recipe[key].type};
    }
  });
  return bounds;
}

export function formatRecipeOutput(name, type, value) {
  const bound = outputBounds[name];
  if (name === 'Water') {
    return denormalizeOutputValue(value, bound) + ' Gallons'
  }
  switch (bound.formatter) {
    case 'minute': return denormalizeOutputValue(value, bound) + ' minutes';
    case 'pound': return denormalizeOutputValue(value, bound) + ' lbs';
    case 'tablet': return denormalizeOutputValue(value, bound);
    case 'ounce': return denormalizeOutputValue(value, bound) + ' ounces';
    case 'pack': return denormalizeOutputValue(value, bound) + ' pack(s)';
    case 'temperature fahrenheit': return denormalizeOutputValue(value, bound) + ' °F';
    default:
      return value;
  }
}

/**
 * @param trainingData Array<{recipe: [], result: []}>
 */
function getAllValues(trainingData) {
  const allRecipes = trainingData.map(v => v.recipe);
  const allResults = trainingData.map(v => v.result);
  return allRecipes.concat(allResults);
}

function getAllInputs(trainingData) {
  const completed = {};
  const qualities = [];
  for (let i = 0; i < trainingData.length; i++) {
    const result = trainingData[i].result;
    for (const quality in result) {
      if (!result.hasOwnProperty(quality)) continue;
      if (!result[quality]['input-type']) continue;
      if (completed[quality]) continue;
      completed[quality] = true;
      qualities.push({
        inputType: result[quality]['input-type'],
        name: quality,
      });
    }
  }
  return qualities;
}

function getAllOutputs(trainingData) {
  const completed = {};
  const qualities = [];
  const allValues = getAllValues(trainingData);
  for (let i = 0; i < allValues.length; i++) {
    const value = allValues[i];
    for (const quality in value) {
      if (!value.hasOwnProperty(quality)) continue;
      if (value[quality]['input-type']) continue;
      if (completed[quality]) continue;
      completed[quality] = true;
      qualities.push({
        formatter: value[quality].type,
        name: quality,
      });
    }
  }
  return qualities;
}

function getNetResultsArray(output) {
  const result = [];
  Object.keys(output).forEach(key => {
    result.push({ outputType: key, value: output[key] });
  });
  console.log(result);
  return result;
}

module.exports = {
  getAllValues,
  getAllInputs,
  getAllOutputs,
  getNetResultsArray,
};

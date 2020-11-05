const path = require('path');
export default (config, env, helpers) => {
  config.resolve.modules.push(
    "node_modules/brain.js",
    "node_modules/gpu.js",
  );
};

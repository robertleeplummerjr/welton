const path = require('path');
export default (config, env, helpers) => {
  config.resolve.modules.push(
    "node_modules/brain.js",
    "node_modules/gpu.js",
  );
  const publicPath = process.env.GITHUB_PAGES
    ? `/${process.env.GITHUB_PAGES}/`
    : '/';
  const ghEnv = process.env.GITHUB_PAGES
    && JSON.stringify(`${process.env.GITHUB_PAGES}`);

  config.output.publicPath = publicPath;
  const { plugin } = helpers.getPluginsByName(config, 'DefinePlugin')[0];
  Object.assign(
    plugin.definitions,
    { ['process.env.GITHUB_PAGES']: ghEnv }
  );
};

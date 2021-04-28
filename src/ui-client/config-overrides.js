const { override, addExternalBabelPlugins } = require('customize-cra')

/**
 * This is needed as Vega-Lite includes nullish coalescing
 * operators in its source, which babel (as used by CRA) does
 * not automatically transpile (as it is under /node_modules, rather than /src).
 * 
 * Adding addExternalBabelPlugins() here allows Leaf to avoid
 * transpile errors without ejecting from CRA.
 */
module.exports = override(
  addExternalBabelPlugins(
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-syntax-optional-chaining'
  ),
)
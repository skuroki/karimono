module.exports = {
  "extends": ["eslint:recommended", "google"],
  "parserOptions": {
    "ecmaVersion": 8,
  },
  "plugins": [
    "googleappsscript"
  ],
  "env": {
    "node": true,
    "googleappsscript/googleappsscript": true
  },
  "rules": {
    "require-jsdoc": "off",
    "no-console": "off",
    "no-unused-vars": ["error", { "varsIgnorePattern": "doPost" }],
    "object-curly-spacing": ["error", "always"],
    "arrow-parens": "off"
  }
};

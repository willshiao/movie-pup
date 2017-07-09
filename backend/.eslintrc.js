module.exports = {
  env: {
    node: true,
    es6: true,
    mocha: true
  },
  extends: 'airbnb-base',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'script',
    "impliedStrict": false
  },
  rules: {
    'no-console': 0,
    'consistent-return': 0,
    'keyword-spacing': ['error', {'overrides': {
      'if': {'after': false},
      'for': {'after': false},
      'while': {'after': false}
    }}],
    'linebreak-style': 'off',
    'no-param-reassign': ['error', { 'props': false }],
  }
};

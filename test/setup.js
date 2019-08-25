const register = require('@babel/register');

register({
  cache: false,
  extensions: ['.ts', '.js'],
});

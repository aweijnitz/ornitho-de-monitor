const mode = process.env.NODE_ENV || 'development';

const isProductionMode = () => (mode.indexOf('production') > -1);

const currentRunMode = () => mode;

module.exports = {
  isProductionMode,
  currentRunMode
}

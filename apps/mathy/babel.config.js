// El plugin de worklets tiene que ir último: es el que marca las funciones que
// corren en el hilo de UI, y Reanimated 4 depende de él también en web.
module.exports = (api) => {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["react-native-worklets/plugin"],
  };
};

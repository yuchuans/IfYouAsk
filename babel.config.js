// Babel config for the IfYouAsk Expo app.
//
// We need to explicitly add `react-native-worklets/plugin` because Reanimated 4
// (used for the QuestionCard swipe gesture) requires it to compile worklets
// into proper UI-thread functions. Without this, the app throws at startup:
// "Exception in HostFunction: <unknown> NativeWorklets".
//
// IMPORTANT: react-native-worklets/plugin MUST be the LAST plugin in the
// plugins array (per Reanimated's docs). Don't reorder.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-worklets/plugin'],
  };
};

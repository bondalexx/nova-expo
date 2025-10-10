export default ({ config }) => ({
  ...config,
  extra: { API_URL: "http://10.0.2.2:4000" }, // Android emulator
});

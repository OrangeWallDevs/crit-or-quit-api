export const wait = (seconds) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1_000));

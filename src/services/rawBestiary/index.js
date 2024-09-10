export const getRawBestiary = async (filesURLList) => {
  const fullBestiary = [];

  const promises = filesURLList.map((fluffFile) =>
    fetch(fluffFile)
      .then((res) => res.json())
      .then((a) => {
        fullBestiary.push(...a.monsterFluff);
      })
      .catch(() => {})
  );

  await Promise.all(promises);

  return fullBestiary;
};

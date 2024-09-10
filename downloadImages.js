import { writeFile } from 'fs/promises';
import { resolve } from 'path';

export const downloadImages = (images, path) =>
  images.map(async ({ url, name }) => {
    try {
      const blob = await fetch(url).then((response) => response.blob());

      return writeFile(
        resolve(path, `${name}.webp`),
        Buffer.from(await blob.arrayBuffer())
      );
    } catch {}
  });

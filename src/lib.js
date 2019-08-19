import path from 'path';
import fs from 'fs';

export function buildChunkMap(compilation) {
  const publicPath = compilation.mainTemplate.getPublicPath({
    hash: compilation.hash,
  });

  const chunkMap = new Map();
  for (const chunk of compilation.getStats().toJson().chunks) {
    for (const [index, file] of chunk.files.entries()) {
      chunkMap.set(
        `${publicPath}${chunk.names[index]}${path.extname(file)}`,
        `${publicPath}${file}`
      );
    }

    chunk.modules
    .filter(moduleObject => moduleObject.assets.length > 0)
    .forEach(moduleObject => {
      moduleObject.assets.forEach(asset =>{
        chunkMap.set(
            `${publicPath}${asset.replace(
                path.basename(asset),
                path.basename(moduleObject.name)
            )}`,
            `${publicPath}${asset}`
        );
      });
    });

  }

  return chunkMap;
}

export function replaceSource(file, chunkMap) {
  let source = fs.readFileSync(file, 'utf8');

  for (const key of chunkMap.keys()) {
    source = source.replace(new RegExp(key, 'gm'), chunkMap.get(key));
  }

  return source;
}

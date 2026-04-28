const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Path aliases. Each alias has an ordered list of candidate roots; the first
// match wins. The repo has parallel layouts (`<dir>/` and `src/<dir>/`) and
// most real screens live under `src/`, so prefer that and fall back to the
// legacy root for the few modules still there (e.g. `app/store.ts`).
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const aliasMap = {
    '@app/': [path.join(__dirname, 'src/app/'), path.join(__dirname, 'app/')],
    '@features/': [path.join(__dirname, 'src/features/'), path.join(__dirname, 'features/')],
    '@entities/': [path.join(__dirname, 'src/entities/'), path.join(__dirname, 'entities/')],
    '@shared/': [path.join(__dirname, 'src/shared/'), path.join(__dirname, 'shared/')],
    '@screens/': [path.join(__dirname, 'src/screens/'), path.join(__dirname, 'screens/')],
    '@src/': [path.join(__dirname, 'src/')],
  };

  for (const [alias, candidates] of Object.entries(aliasMap)) {
    if (!moduleName.startsWith(alias)) continue;
    const relativePath = moduleName.slice(alias.length);
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js'];

    for (const root of candidates) {
      for (const ext of extensions) {
        const fullPath = path.join(root, relativePath + ext);
        try {
          require.resolve(fullPath);
          return { filePath: fullPath, type: 'sourceFile' };
        } catch {
          continue;
        }
      }
    }
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add path aliases for TypeScript
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const aliasMap = {
    '@app/': path.join(__dirname, 'app/'),
    '@features/': path.join(__dirname, 'features/'),
    '@entities/': path.join(__dirname, 'entities/'),
    '@shared/': path.join(__dirname, 'shared/'),
    '@screens/': path.join(__dirname, 'screens/'),
  };

  for (const [alias, resolvedPath] of Object.entries(aliasMap)) {
    if (moduleName.startsWith(alias)) {
      const relativePath = moduleName.replace(alias, '');
      const extensions = ['.ts', '.tsx', '.js', '.jsx'];
      
      for (const ext of extensions) {
        const fullPath = path.join(resolvedPath, relativePath + ext);
        try {
          require.resolve(fullPath);
          return {
            filePath: fullPath,
            type: 'sourceFile',
          };
        } catch {
          continue;
        }
      }
    }
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

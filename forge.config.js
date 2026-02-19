const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    prune: false,
    asar: false, // Desabilitado temporariamente para debug
  },
  rebuildConfig: {
    extraModules: ['better-sqlite3'],
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        build: [
          {
            entry: 'src/main.js',
            config: 'vite.main.config.mjs',
            target: 'main',
          },
          {
            entry: 'src/preload.js',
            config: 'vite.preload.config.mjs',
            target: 'preload',
          },
        ],
        renderer: [
          {
            name: 'main_window',
            config: 'vite.renderer.config.mjs',
          },
        ],
      },
    },
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: false,
    }),
  ],
  hooks: {
    packageAfterPrune: async (config, buildPath) => {
      const fs = require('fs');
      const path = require('path');
      const betterSqlite3Path = path.join(__dirname, 'node_modules', 'better-sqlite3');
      const destNodeModules = path.join(buildPath, 'node_modules');
      const destPath = path.join(destNodeModules, 'better-sqlite3');

      if (!fs.existsSync(destNodeModules)) {
        fs.mkdirSync(destNodeModules, { recursive: true });
      }

      if (fs.existsSync(betterSqlite3Path)) {
        console.log(`[Hook] Copiando better-sqlite3 para ${destPath}...`);
        fs.cpSync(betterSqlite3Path, destPath, { recursive: true });
        console.log('[Hook] better-sqlite3 copiado com sucesso.');
      } else {
        console.warn('[Hook] better-sqlite3 não encontrado em node_modules!');
        throw new Error('better-sqlite3 missing in dev node_modules');
      }
    },
  },
};

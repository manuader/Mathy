// Metro en monorepo: hay que decirle que mire fuera de la carpeta de la app,
// porque los paquetes del workspace viven en ../../packages.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
// Sin esto Metro puede levantar dos copias de react desde node_modules anidados.
config.resolver.disableHierarchicalLookup = true;

module.exports = config;

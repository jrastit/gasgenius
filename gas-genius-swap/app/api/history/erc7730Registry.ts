import fs from 'fs/promises';
import path from 'path';

//const REGISTRY_DIR = path.resolve(__dirname, '../../../clear-signing-erc7730-registry/registry');
const REGISTRY_DIR =
  process.env.ERC7730_REGISTRY_DIR ??
  path.resolve(process.cwd(), '..', 'clear-signing-erc7730-registry', 'registry');

export async function getErc7730Registry(): Promise<Record<string, any>> {
  try {
    const stats = await fs.stat(REGISTRY_DIR);
    if (!stats.isDirectory()) {
      throw new Error(`Registry directory does not exist: ${REGISTRY_DIR}`);
    }
  } catch (err) {
    console.error(`Error accessing registry directory: ${err}`);
    return {};
  }
  const registry: Record<string, any> = {};
  const dirs = await fs.readdir(REGISTRY_DIR, { withFileTypes: true });
  for (const dirent of dirs) {
    //console.log(`Processing directory: ${dirent.name}`);
    if (!dirent.isDirectory()) continue;
    const subdir = path.join(REGISTRY_DIR, dirent.name);
    const files = await fs.readdir(subdir);
    for (const file of files) {
      //console.log(`Processing file: ${file}`);
      if (!file.endsWith('.json')) continue;
      const filePath = path.join(subdir, file);
      try {
        const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
        
        const deployments = data.context.contract?.deployments || data.context.eip712?.deployments
        if (!deployments) {
          console.warn(`No deployments found in file: ${filePath}`);
          continue;
        }
        for (const deployment of deployments) {
          const address = deployment.address;
          const chainId = deployment.chainId;
          //console.log(address, chainId);
          if (address && chainId) {
            registry[address.toLowerCase()] = data;
          } else {
            console.warn(`Invalid entry in file ${filePath}: missing address or name`);
          }
        }
      } catch (err) {
        console.warn(`Invalid JSON in file: ${filePath}`, err);
      }
    }
  }
  return registry;
}

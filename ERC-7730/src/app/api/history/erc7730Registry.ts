'use server';

import fs from 'fs/promises';
import path from 'path';

export interface Erc7730Info {
  name: string;
  description?: string;
  symbol?: string;
  abi?: any[];
  formatData?: (data: string) => Record<string, any>;
}

//const REGISTRY_DIR = path.resolve(__dirname, '../../../clear-signing-erc7730-registry/registry');
const REGISTRY_DIR =
  process.env.ERC7730_REGISTRY_DIR ??
  path.resolve(process.cwd(), '..', 'clear-signing-erc7730-registry', 'registry');

export async function getErc7730Registry(): Promise<Record<string, Erc7730Info>> {
  const registry: Record<string, Erc7730Info> = {};
  const dirs = await fs.readdir(REGISTRY_DIR, { withFileTypes: true });
  for (const dirent of dirs) {
    if (!dirent.isDirectory()) continue;
    const subdir = path.join(REGISTRY_DIR, dirent.name);
    const files = await fs.readdir(subdir);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const filePath = path.join(subdir, file);
      try {
        const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
        if (data.address && data.name) {
          registry[data.address.toLowerCase()] = {
            name: data.name,
            description: data.description,
            symbol: data.symbol,
          };
        }
      } catch {
        console.warn(`Invalid JSON in file: ${filePath}`);
      }
    }
  }
  return registry;
}

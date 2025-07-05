// pages/api/validate.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const descriptor = req.body;                     // assumes JSON body
  const tmp = path.join(tmpdir(), `desc-${Date.now()}.json`);
  writeFileSync(tmp, JSON.stringify(descriptor));

  const proc = spawn('erc7730', ['lint', tmp]); 
  let stderr = '';

  proc.stderr.on('data', (d) => (stderr += d));
  proc.on('close', (code) => {
    unlinkSync(tmp);
    if (code === 0) return res.status(200).json({ valid: true });
    res.status(400).json({ valid: false, error: stderr.trim() });
  });
}
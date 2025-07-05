// src/app/api/validate/route.ts
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { NextResponse } from 'next/server';

/** Ensure Node runtime (needed for child_process). */
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    /* 1️⃣ Read JSON body */
    const descriptor = await req.json();

    /* 2️⃣ Write descriptor to a temp file */
    const tmpFile = path.join(tmpdir(), `desc-${Date.now()}.json`);
    writeFileSync(tmpFile, JSON.stringify(descriptor));

    /* 3️⃣ Run the erc7730 linter */
    const proc = spawn('erc7730', ['lint', tmpFile]);
    let stderr = '';

    // Collect stderr as it streams
    for await (const chunk of proc.stderr) {
      stderr += chunk;
    }

    // Wait for process to exit
    const exitCode: number = await new Promise((resolve) =>
      proc.on('close', resolve)
    );

    /* 4️⃣ Clean up the temp file */
    unlinkSync(tmpFile);

    /* 5️⃣ Return result */
    if (exitCode === 0) {
      return NextResponse.json({ valid: true }, { status: 200 });
    }

    return NextResponse.json(
      { valid: false, error: stderr.trim() || 'Validation failed' },
      { status: 400 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { valid: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
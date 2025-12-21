import { rm } from 'node:fs/promises';
import { resolve as resolvePath } from 'node:path';
import { cwd } from 'node:process';

const distPath = resolvePath( cwd(), 'dist' );
await rm( distPath, {
	recursive: true,
	force: true
} );

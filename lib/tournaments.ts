import fs from 'fs';
import path from 'path';
import type { Tournament } from '@/types';

export function getTournaments(): Tournament[] {
  const dataDir = path.join(process.cwd(), 'data', 'tournaments');

  if (!fs.existsSync(dataDir)) {
    return [];
  }

  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json'));

  return files
    .map((file) => {
      const content = fs.readFileSync(path.join(dataDir, file), 'utf-8').replace(/^\uFEFF/, '');
      return JSON.parse(content) as Tournament;
    })
    .sort((a, b) => a.schedule.startDate.localeCompare(b.schedule.startDate));
}

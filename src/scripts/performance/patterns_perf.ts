import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import StringArt, { DrawOptions } from '../StringArt';
import { Dimensions } from '../types/general.types';
import { TestRenderer } from '../renderers/TestRenderer';
import { getAllPatternsTypes } from '../helpers/pattern_utils';
import { sizeConvert } from '../helpers/size_utils';

export interface PatternPerfResult {
  stepCount: number;
  runsPerSecond: number;
  time: number;
}

// Recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFile: string = path.join(__dirname, 'pattern_run_times.csv');

// Clear the file before running tests
if (fs.existsSync(logFile)) {
  fs.unlinkSync(logFile);
}

const patterns = getAllPatternsTypes().sort((a, b) =>
  a.name > b.name ? 1 : -1
);

const patternTimes: [string, number, number, number][] = [];

patterns.forEach((pattern, i) => {
  const result = measurePattern(pattern);
  console.log(
    `${pattern.name} [${i + 1}/${patterns.length}] (${Math.trunc(
      result.time
    )}ms)`
  );
  patternTimes.push([
    pattern.name,
    result.runsPerSecond,
    result.stepCount,
    result.time,
  ]);
});

const CSV =
  'Pattern type, Runs per second, Step count, Time\n' +
  patternTimes.map(run => run.join(',')).join('\n');

fs.appendFileSync(logFile, CSV, { encoding: 'utf-8' });
console.log('Wrote file ' + logFile);

export function measurePattern(pattern: StringArt): PatternPerfResult {
  const cycles = 10;
  const drawCountPerCycle = 1000;
  const warmupDrawCount = 500;
  const size: Dimensions = [1000, 1000];

  const renderer = new TestRenderer(size);
  const options: DrawOptions = {
    sizeChanged: true,
    redrawNails: true,
    redrawStrings: true,
  };
  // warmup
  for (let i = 0; i < warmupDrawCount; i++) {
    pattern.draw(renderer, options);
  }

  const timeStart = performance.now();

  for (let cycle = 0; cycle < cycles; cycle++) {
    for (let i = 0; i < drawCountPerCycle; i++) {
      pattern.draw(renderer, options);
    }
  }

  const time = Math.trunc(performance.now() - timeStart);
  const avg = time / (cycles * drawCountPerCycle);
  const runsPerSecond = Math.trunc(1000 / avg);
  return {
    runsPerSecond,
    stepCount: pattern.getStepCount({ size }),
    time,
  };
}

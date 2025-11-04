import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import StringArt, { DrawOptions } from '../infra/StringArt';
import { Dimensions } from '../types/general.types';
import { TestRenderer } from '../infra/renderers/TestRenderer';
import { getAllPatternsTypes } from '../helpers/pattern_utils';

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

const singlePatternId = process.argv.includes('-p')
  ? process.argv[process.argv.lastIndexOf('-p') + 1]
  : null;

const patterns = getAllPatternsTypes()
  .filter(p => !singlePatternId || p.id === singlePatternId)
  .sort((a, b) => (a.name > b.name ? 1 : -1));

const patternTimes: [string, number, number, number][] = [];
const longestPatternNameLength = Math.max(...patterns.map(p => p.name.length));

patterns.forEach((pattern, i) => {
  const patternStr = `${pattern.name.padEnd(
    longestPatternNameLength,
    '_'
  )} [${String(i + 1).padStart(2, '0')}/${patterns.length}]`;
  process.stdout.write('\x1b[37m' + patternStr + ' \x1b[36m(working...)');
  const result = measurePattern(pattern);
  process.stdout.write(
    `\r\x1b[37m${patternStr} ${getTimeColor(result.time)}${String(
      Math.trunc(result.time)
    ).padStart(5)} ms               \n`
  );
  patternTimes.push([
    pattern.name,
    result.runsPerSecond,
    result.stepCount,
    result.time,
  ]);
});

function getTimeColor(time: number): string {
  if (time < 800) {
    return '\x1b[32m';
  }
  if (time > 8000) {
    return '\x1b[31m';
  }
  if (time > 4000) {
    return '\x1b[33m';
  }

  return '\x1b[37m';
}

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
    sizeChanged: false,
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

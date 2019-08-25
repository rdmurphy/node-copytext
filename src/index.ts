// packages
import XLSX from 'xlsx';

// local
import { keyvalue, table } from './processors';

const processors = { keyvalue, table } as { [key: string]: Function };

/**
 * Retrieves a processor by name. Throws an error if it does not exist.
 *
 * @private
 * @param name The name of the processor
 */
function getProcessor(name: string) {
  if (processors.hasOwnProperty(name)) return processors[name];

  throw new Error(`\`${name}\` is not a valid sheet processor.`);
}

export interface ProcessOptions {
  include?: string[] | Function;
  exclude?: string[] | Function;
  processor?: string;
  overrides?: { [sheetName: string]: 'keyvalue' | 'table' };
}

export type ProcessResults = { [sheetName: string]: unknown };

/**
 * Accepts a raw XLSX file and options that determine how `copytext` should
 * process it.
 *
 * @param file A Buffer of, or path to, an XLSX file
 * @param options
 * @param options.include A list of sheets to include, or a Function that receives each sheet's name and returns a Boolean
 * @param options.exclude A list of sheets to exclude, or a Function that receives each sheet's name and returns a Boolean
 * @param options.processor The processor used on all sheets without overrides
 * @param options.overrides Key-value pairs of the sheet name and processor that should be used
 */
export function process(
  file: string | Buffer,
  {
    include,
    exclude,
    processor = 'keyvalue',
    overrides = {},
  }: ProcessOptions = {}
): ProcessResults {
  const workbook = Buffer.isBuffer(file)
    ? XLSX.read(file, { type: 'buffer' })
    : XLSX.readFile(file);

  let sheetNames = workbook.SheetNames;

  if (include) {
    const includeFn = Array.isArray(include)
      ? (name: string) => include.includes(name)
      : (include as (value: string) => boolean);
    sheetNames = sheetNames.filter(includeFn);
  }

  if (exclude) {
    const excludeFn = Array.isArray(exclude)
      ? (name: string) => !exclude.includes(name)
      : (exclude as (value: string) => boolean);
    sheetNames = sheetNames.filter(excludeFn);
  }

  const results = {} as ProcessResults;

  for (const name of sheetNames) {
    // determine the appropriate processor, using the override if it exists
    const activeProcessor = overrides.hasOwnProperty(name)
      ? overrides[name]
      : processor;

    const fn = getProcessor(activeProcessor);
    const sheet = workbook.Sheets[name];

    results[name] = fn(sheet);
  }

  return results;
}

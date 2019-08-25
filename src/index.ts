// packages
import XLSX from 'xlsx';

// local
import { keyvalue, table } from './processors';

const processors = { keyvalue, table } as { [key: string]: Function };

/**
 * Retrieves a processor by name. Throws an error if it does not exist.
 *
 * @param name The name of the processor
 */
function getProcessor(name: string) {
  if (processors.hasOwnProperty(name)) return processors[name];

  throw new Error(`\`${name}\` is not a valid sheet processor.`);
}

export interface ProcessOptions {
  include?: string[];
  exclude?: string[];
  processor?: string;
  overrides?: { [sheetName: string]: 'keyvalue' | 'table' };
}

export type ProcessResults = { [sheetName: string]: unknown };

export function process(
  file: string | Buffer,
  {
    include,
    exclude,
    processor = 'keyvalue',
    overrides = {},
  }: ProcessOptions = {}
) {
  const workbook = Buffer.isBuffer(file)
    ? XLSX.read(file, { type: 'buffer' })
    : XLSX.readFile(file);

  let sheetNames = workbook.SheetNames;

  if (include) {
    sheetNames = sheetNames.filter(name => include.includes(name));
  }

  if (exclude) {
    sheetNames = sheetNames.filter(name => !exclude.includes(name));
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

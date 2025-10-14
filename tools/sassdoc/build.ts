// @ts-expect-error there are no types for this package
import sassdoc from 'sassdoc';

import { SassDocConfig } from './sassdoc.config';
import {
  processSassDocData,
  SassDocItem,
} from './value-parser';

export interface ParsedSassDocResult {
  data: SassDocItem[];
  config: SassDocConfig;
}

export async function processSassDoc(config: SassDocConfig): Promise<ParsedSassDocResult> {
  try {
    const data: SassDocItem[] = await sassdoc.parse(config.src, { verbose: config.verbose });

    const enhancedData = processSassDocData(data);

    return {
      data: enhancedData,
      config,
    };

  } catch (error) {
    console.error('SassDoc processing failed:', error);
    throw error;
  }
}

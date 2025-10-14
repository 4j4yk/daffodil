export interface SassDocItem {
  context?: {
    type: string;
    name: string;
    value: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export enum SassType {
  MAP = 'sass-map',
  VARIABLE = 'sass-variable',
  COLOR = 'color',
  STRING = 'string',
  UNKNOWN = 'unknown',
};

export interface ParsedValue {
  raw: string;
  parsed?: any;
  type: SassType;
}

interface ParsedSassMap {
  [key: string]: string | ParsedSassMap;
}

function isSassMap(value: string): boolean {
  return value.startsWith('(') && value.endsWith(')') && value.includes(':');
}

function isColor(value: string): boolean {
  return value.startsWith('#') ||
				 /^rgb\(/.test(value) ||
				 /^rgba\(/.test(value) ||
				 /^hsl\(/.test(value) ||
				 /^hsla\(/.test(value);
}

function isSassVariable(value: string): boolean {
  return value.startsWith('$');
}

function isString(value: string): boolean {
  return value.startsWith('"') || value.startsWith('\'');
}

function getType(value: string): SassType {
  const trimmed = value.trim();
  if (isSassMap(trimmed)) {
    return SassType.MAP;
  } else if (isSassVariable(trimmed)) {
    return SassType.VARIABLE;
  } else if (isColor(trimmed)) {
    return SassType.COLOR;
  } else if (isString(trimmed)) {
    return SassType.STRING;
  }  else {
    return SassType.UNKNOWN;
  }
}

function parseSassMap(value: string): ParsedSassMap | null {
  try {
    const mapContent = value
      .trim()
    // remove leading and trailing parentheses
      .slice(1, -1)
      .replace(/\n\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const result: ParsedSassMap = {};

    let depth = 0;
    let currentKey = '';
    let currentValue = '';
    let inKey = true;

    for (const char of mapContent) {
      if (char === '(' && !inKey) {
        // begin nested map
        depth++;
        currentValue += char;
      } else if (char === ')' && !inKey) {
        // end nested map
        depth--;
        currentValue += char;
      } else if (char === ':' && depth === 0 && inKey) {
        // end key def
        inKey = false;
        continue;
      } else if (char === ',' && depth === 0 && !inKey) {
        // end value def
        const key = currentKey.trim();
        const val = currentValue.trim();
        const parsedKey = key.replace(/^['"]|['"]$/g, '');

        // store the result of the key/value parse, could be a nested map
        result[parsedKey] = isSassMap(val)
          ? parseSassMap(val) || val
          : isColor(val)
            ? val.trim()
            : val.replace(/^['"]|['"]$/g, '');

        // reset values, ready for next key/value pair
        currentKey = '';
        currentValue = '';
        inKey = true;
      } else if (inKey) {
        // append key
        currentKey += char;
      } else {
        // append value
        currentValue += char;
      }
    }

    if (currentKey.trim() && currentValue.trim()) {
      const key = currentKey.trim();
      const val = currentValue.trim();

      const parsedKey = key.replace(/^['"]|['"]$/g, '');
      let parsedValue: any = val;

      if (isSassMap(val)) {
        parsedValue = parseSassMap(val);
      } else if (isColor(val)) {
        parsedValue = val.trim();
      } else {
        parsedValue = val.replace(/^['"]|['"]$/g, '');
      }

      result[parsedKey] = parsedValue;
    }

    return result;
  } catch (error) {
    console.warn('Failed to parse Sass map:', value, error);
    return null;
  }
}

export function parseValue(value: string): ParsedValue {
  const trimmed = value.trim();
  const type = getType(trimmed);
  let parsed: ParsedValue['parsed'];

  switch (type) {
    case SassType.MAP:
      parsed = parseSassMap(trimmed);
      break;

    case SassType.STRING:
    case SassType.UNKNOWN:
      parsed = trimmed.replace(/^['"]|['"]$/g, '');
      break;

    case SassType.VARIABLE:
    case SassType.COLOR:
    default:
      parsed = trimmed;
      break;
  }

  return {
    raw: value,
    type,
    parsed,
  };
}

export function processSassDocData(sassDocData: SassDocItem[]): SassDocItem[] {
  return sassDocData.map(item => {
    if (!item.context?.value) {
      return item;
    }

    return {
      ...item,
      context: {
        ...item.context,
        parsedValue: parseValue(item.context.value),
      },
    };
  });
}

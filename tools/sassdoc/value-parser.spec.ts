import assert from 'node:assert';
import {
  describe,
  it,
} from 'node:test';

import {
  parseValue,
  SassType,
} from './value-parser';

describe('@daffodil/tools-sassdoc | ValueParser', () => {
  it('should parse a sass map', () => {
    const result = parseValue(` (
			key1: "value1",
			key2: "value2",
		 ) `);
    assert.strictEqual(result.type, SassType.MAP);
    assert.deepStrictEqual(result.parsed, {
      key1: 'value1',
      key2: 'value2',
    });
  });

  it('should parse a nested sass map', () => {
    const result = parseValue(` (
			key1: "value1",
			key2:  "value2",
			nested: (
				key: "value"
			 )
		)`);
    assert.strictEqual(result.type, SassType.MAP);
    assert.deepStrictEqual(result.parsed, {
      key1: 'value1',
      key2: 'value2',
      nested: {
        key: 'value',
      },
    });
  });

  it('should parse a sass color', () => {
    const result = parseValue(' #ffffff');
    assert.strictEqual(result.type, SassType.COLOR);
    assert.deepStrictEqual(result.parsed, '#ffffff');
  });

  it('should parse a sass string', () => {
    const result = parseValue(' " hello"');
    assert.strictEqual(result.type, SassType.STRING);
    assert.deepStrictEqual(result.parsed, ' hello');
  });

  it('should parse a sass variable', () => {
    const result = parseValue(' $taco ');
    assert.strictEqual(result.type, SassType.VARIABLE);
    assert.deepStrictEqual(result.parsed, '$taco');
  });

  it('should parse something unknown', () => {
    const result = parseValue(' iamverysmart ');
    assert.strictEqual(result.type, SassType.UNKNOWN);
    assert.deepStrictEqual(result.parsed, 'iamverysmart');
  });
});

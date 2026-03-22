import { describe, it, expect } from 'vitest';
import { aiErrorResponse } from '../ai-error';

describe('aiErrorResponse', () => {
  it('should return structured error json', () => {
    const res = aiErrorResponse('TEST_CODE', 'Test message', { foo: 'bar' });
    const obj = JSON.parse(res.content[0].text);
    expect(obj.error).toBe(true);
    expect(obj.code).toBe('TEST_CODE');
    expect(obj.message).toBe('Test message');
    expect(obj.details.foo).toBe('bar');
  });
});

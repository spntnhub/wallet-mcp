import logger from '../logger';

describe('logger', () => {
  it('should log info message', () => {
    logger.info('Test info log', { foo: 'bar' });
  });
  it('should log error message', () => {
    logger.error('Test error log', { error: 'fail' });
  });
});

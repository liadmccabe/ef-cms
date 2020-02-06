const jsCheckDecorator = testUrl => {
  let decorated;
  if (typeof testUrl === 'string') {
    decorated = {
      actions: ['wait for .progress-indicator to be hidden'],
      notes: 'verifies that page has loaded and JS is not broken',
      url: testUrl,
    };
  } else {
    decorated = testUrl;
  }
  return decorated;
};

const defaults = {
  chromeLaunchConfig: {
    args: ['--no-sandbox'],
  },
  concurrency: 2,
  debug: true,
  'include-notices': true,
  'include-warnings': true,
  standard: 'WCAG2AA',
  timeout: 30000,
  wait: 5000,
};

module.exports = {
  defaults,
  jsCheckDecorator,
};

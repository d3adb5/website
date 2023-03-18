module.exports = {
  ci: {
    collect: {
      staticDistDir: './public'
    },
    upload: {
      target: 'temporary-public-storage'
    },
    assert: {
      preset: 'lighthouse:no-pwa',
      assertions: {
        'color-contrast': 'off',
        'uses-responsive-images': 'off',
        'unsized-images': 'off',
        'tap-targets': 'warn',
        'csp-xss': 'off'
      }
    }
  }
};

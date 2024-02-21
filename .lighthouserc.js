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
        'csp-xss': 'off',
        'errors-in-console': 'off',
        'unminified-javascript': 'warn',

        // Does not seem to be a problem to me.
        'identical-links-same-purpose': 'off',
        'td-has-header': 'off',

        // This is a problem for future me.
        'total-byte-weight': 'warn',

        // Links being styled the way they are is a style choice.
        'link-in-text-block': 'off',

        // Not sure where this one is coming from!
        'bootup-time': 'off',

        // Server response time is out of our control.
        'server-response-time': 'off',
      }
    }
  }
};

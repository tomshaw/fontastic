module.exports = {
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    borderWidth: {
      DEFAULT: '1px',
      '0': '0',
      '2': '2px',
      '3': '3px',
      '4': '4px',
      '6': '6px',
      '8': '8px',
    },
    fontFamily: {
      'body': ['"Roboto"'],
    },
    extend: {
      colors: {
        'default': '#00a0be',
        'dashboard': '#ffffff',
        'euphoria': '#deb431',
        'mellow': '#252525',
        'midnight': '#ffffff',
        'passion': '#ffffff',
        'swiss': '#ffffff',
      },
      backgroundColor: {
        'default': '#ffffff',
        'dashboard': '#14202b',
        'euphoria': '#23121c',
        'mellow': '#ffdf00',
        'midnight': '#000000',
        'passion': '#620f72',
        'swiss': '#ed1b24',
      },
      borderColor: {
        'default': '#00a0be',
        'dashboard': '#0e161f',
        'euphoria': '#3a1f32',
        'mellow': '#252525',
        'midnight': '#ffffff',
        'passion': '#fe1963',
        'swiss': '#ffcccc',
      },
      fill: {
        'default': '#808080',
        'dashboard': '#637785',
        'euphoria': '#c10156',
        'mellow': '#3e4245',
        'midnight': '#777777',
        'passion': '#ffffff',
        'swiss': '#3e4245',
      },
      stroke: {
        'default': '#000000',
        'dashboard': '#ffffff',
        'euphoria': '#deb431',
        'mellow': '#252525',
        'midnight': '#ffffff',
        'passion': '#fe1963',
        'swiss': '#ffffff',
      }
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
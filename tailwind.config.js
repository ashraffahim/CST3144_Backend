/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.js', './*.html'],
  theme: {
    extend: {
      'fontFamily': {
        'poppins': ['Poppins', 'system-ui', 'sans-serif'],
        'raleway': ['Raleway', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}


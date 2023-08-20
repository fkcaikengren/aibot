/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
 
  ],
  theme: {
    extend: {
      maxWidth: {
        '50vw': '50vw',
        '1/2': '50%',
        '4/5': '80%'
        
      },
      keyframes: {
        'slide-in': {
          'from': { opacity: 0, transform: 'translateY(20px)'},
          'to': { opacity: 1, transform: 'translateY(0px)' },
        },
        'slide-in-from-top': {
          'from': { opacity: 0, transform: 'translateY(-20px)'},
          'to': { opacity: 1, transform: 'translateY(0px)' },
        }
      },
      animation: {
        'slide-in_ease_3': 'slide-in ease 0.3s'
      }
      
    },
  },
  plugins: [],
}


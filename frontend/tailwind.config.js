/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lineBack: "#7494C0",
      }
    }
  },
  plugins: [],
}

// module.exports = {
//   theme: {
//     colors: {
//       lineBack: "#7494C0",
//     }
//   }
// }

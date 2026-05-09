module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    // 1. Inline styles ke error ko disable karne ke liye
    'react-native/no-inline-styles': 'off',

    // 2. Props mein inline functions (arrow functions) allow karne ke liye
    'react/jsx-no-bind': 'off',

    // 3. Unused variables ki wajah se error na aaye (sirf warning)
    '@typescript-eslint/no-unused-vars': 'warn',

    // 4. Any type use karne par error na aaye
    '@typescript-eslint/no-explicit-any': 'off',

    // 5. Hooks ki dependency array check ko thoda relax karne ke liye
    'react-hooks/exhaustive-deps': 'warn',

    // 6. Console logs ko allow karne ke liye (agar error de raha ho)
    'no-console': 'off',
  },
};
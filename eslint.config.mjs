import expo from 'eslint-config-expo/flat.js'
import prettier from 'eslint-config-prettier'
import reactNative from 'eslint-plugin-react-native'
import globals from 'globals'

// Flat config, in three layers.
//
//   1. `eslint-config-expo` — the Expo, React, React Hooks and import rules for
//      an Expo Router app. It registers `@typescript-eslint` and the TS parser
//      itself, so neither is a direct dependency here.
//   2. The two org rules `ui`, `inertia` and `impulse` enforce and the Expo
//      config does not. Those three repos hand-build a config from
//      `typescript-eslint`; this one starts from Expo's and adds the delta, so
//      the app gets the Expo rules AND the conventions the libraries share.
//   3. `eslint-config-prettier`, last, to turn off anything that fights
//      `.prettierrc`.
export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'web-build/**',
      '.expo/**',
      'expo-env.d.ts',
      // Generated from the org avatar by scripts/build-icons.mjs.
      'assets/**',
    ],
  },

  ...expo,

  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-native': reactNative },
    rules: {
      // Both rules match inertia/impulse/ui. See eslint.config.mjs in any of
      // those repos.
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      'react-native/no-inline-styles': 'error',
    },
  },

  prettier,

  {
    // `react-hooks/immutability` comes from the React Compiler, which treats
    // every value a hook returns as frozen. An inertia `useMotionValue` returns
    // a Reanimated `SharedValue`, and writing `sharedValue.value = x` is that
    // type's entire API — the write is the point, and it never triggers a
    // render. The rule therefore fires on correct code at every shared-value
    // write in this repo, and would fire on every new one. Off once here, with
    // the reason, beats a disable comment at each use site.
    //
    // This rule family is why this repo needs suppressions the library repos do
    // not: `eslint-config-expo@57` pulls `eslint-plugin-react-hooks@7`, which
    // enables the React Compiler rules. `inertia` pins that plugin at `^5`,
    // whose recommended set is only `rules-of-hooks` and `exhaustive-deps`.
    //
    // The rest of the React Hooks rules stay on.
    rules: {
      'react-hooks/immutability': 'off',
    },
  },

  {
    // Build scripts run in Node, not in the app bundle, so they need Node
    // globals (`Buffer`, `process`, `console`). The Expo config assumes a React
    // Native / browser environment and flags all of them as undefined.
    files: ['scripts/**/*.mjs', '*.mjs', '*.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
]

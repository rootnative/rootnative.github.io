import {
  cubicBezier,
  type NamedTransitions,
  type TimingTransition,
  type TransitionConfig,
} from '@rootnative/inertia'

/**
 * The motion vocabulary of the site. `app/_layout.tsx` registers it on a
 * `MotionConfig`, so a component writes `transition="entrance"` and never
 * repeats a curve.
 *
 * The curves are the Material Design 3 easing tokens in the CSS form that
 * `cubicBezier` reads, because `lib/theme.ts` builds a Material Design 3
 * theme. Keep the two in agreement.
 */
export const TRANSITIONS = {
  /** Emphasised decelerate. For content that arrives on the screen. */
  entrance: {
    type: 'timing',
    duration: 520,
    easing: cubicBezier('cubic-bezier(0.05, 0.7, 0.1, 1)'),
  },
  /** The hover lift of a card. Short, and it settles without an overshoot. */
  lift: { type: 'spring', tension: 320, friction: 26 },
  /** A pill that appears after the npm registry answers. */
  pill: { type: 'spring', tension: 340, friction: 18 },
  /** The idle drift of the hero mark. Standard easing, so it never stops hard. */
  float: {
    type: 'timing',
    duration: 4200,
    easing: cubicBezier('cubic-bezier(0.4, 0, 0.2, 1)'),
    repeat: 'infinite',
  },
} satisfies NamedTransitions

/**
 * The entrance curve as a config, for a call site that adds its own delay.
 * Typed as the timing member, not the whole `TransitionConfig` union, so a
 * spread that adds `delay` still type-checks.
 */
export const ENTRANCE: TimingTransition = TRANSITIONS.entrance

/** The gap between two hero entrance slots, in milliseconds. */
export const STAGGER_INTERVAL = 70

/** The delay of the first card, in milliseconds. The hero cascade runs first. */
export const CARD_DELAY = 300

/** The gap between two card entrances, in milliseconds. */
export const CARD_STEP = 80

/**
 * Marks an element that the static export bakes at `opacity: 0`, because it
 * waits for an entrance animation. Put it on every such element with the
 * `dataSet` prop, which react-native-web writes out as `data-entrance`.
 *
 * `app/+html.tsx` reveals all of them when the bundle never runs. Keep the
 * attribute name there in agreement with this one.
 */
export const ENTRANCE_MARKER: Record<string, string> = { entrance: 'true' }

/** Narrows `transition="…"` to the names above, and makes a typo an error. */
declare module '@rootnative/inertia' {
  interface RegisteredTransitions {
    entrance: TransitionConfig
    lift: TransitionConfig
    pill: TransitionConfig
    float: TransitionConfig
  }
}

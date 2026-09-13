import {
  cubicBezier,
  type NamedTransitions,
  type TimingTransition,
  type TransitionConfig,
} from '@rootnative/inertia'
import { ENTRANCE_ATTRIBUTE } from '@rootnative/inertia/static-export'

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
  /**
   * The idle drift of the hero mark. Standard easing, so it never stops hard.
   *
   * `repeat: 'infinite'` alternates, so one leg is enough: the mark travels
   * from its `initial` to its `animate` value and back, for ever. Keep this
   * form for a two-point drift: it alternates for free, and the
   * reduced-motion snap lands on `animate`, which is the resting position.
   *
   * A keyframe array is also safe now. Inertia 0.0.10 resolved each step of
   * an array to a plain number under reduced motion, handed those numbers to
   * `withSequence`, and threw `Cannot create property 'finished' on number`,
   * which took the whole page down. Inertia 0.0.11 fixes that, and the site
   * pins 0.0.11.
   */
  float: {
    type: 'timing',
    duration: 2600,
    easing: cubicBezier('cubic-bezier(0.4, 0, 0.2, 1)'),
    repeat: 'infinite',
  },
  /**
   * The hover and focus layer of a card. One `useGesture` drives the lift, the
   * shadow, the border colour, and the brand mark from this one curve, so the
   * four never drift apart.
   */
  hover: { type: 'spring', tension: 260, friction: 22 },
  /**
   * The idle bob of the inertia preview. A spring, so the bars settle instead
   * of turning at the top, and `repeat: 'infinite'` alternates the leg — the
   * same two-point form the hero mark uses.
   */
  bob: { type: 'spring', tension: 150, friction: 11, repeat: 'infinite' },
} satisfies NamedTransitions

/**
 * The entrance curve as a config, for a call site that adds its own delay.
 * Typed as the timing member, not the whole `TransitionConfig` union, so a
 * spread that adds `delay` still type-checks.
 */
export const ENTRANCE: TimingTransition = TRANSITIONS.entrance

/** The gap between two hero entrance slots, in milliseconds. */
export const STAGGER_INTERVAL = 70

/**
 * The gap between two bars of the inertia preview, in milliseconds.
 *
 * The cards no longer carry an entrance delay. Each one enters when it comes
 * into view instead — see `IN_VIEW` below — because a delay counted from page
 * load finished off-screen for every card below the fold.
 */
export const PREVIEW_INTERVAL = 110

/**
 * The in-view trigger of every block below the hero, in one place so the cards
 * and the footer enter alike.
 *
 * `amount` waits for a sixth of the block rather than firing on its first
 * pixel — a card that starts the moment its top edge appears has finished
 * before the visitor can read it. `transition` is the page's own entrance
 * curve, so a block that scrolls into view and a hero block that cascades on
 * load move the same way. `once` stays at its default: an entrance that
 * replays on every scroll past reads as flicker.
 */
export const IN_VIEW = { amount: 1 / 6, transition: 'entrance' } as const

/**
 * Marks an element that the static export bakes at a pre-animation value, for
 * the case the library cannot see.
 *
 * From inertia 0.0.12 a `Motion.*` writes this attribute itself whenever it
 * carries an `initial`, so an element with an `initial` needs nothing. An
 * element hidden by an **animated style** instead — the cards and the footer,
 * which start at `opacity: 0` because their `useInView` value starts at `0` —
 * has no `initial`, so the library has no signal to mark it. Put this on
 * those, with the `dataSet` prop.
 *
 * `entranceGuardCss()` in `app/+html.tsx` reveals every marked element when the
 * bundle never runs, whichever side wrote the attribute. The key is derived
 * from the library's own constant, so the two cannot drift apart.
 */
export const ENTRANCE_MARKER: Record<string, string> = {
  [ENTRANCE_ATTRIBUTE.replace(/^data-/, '')]: 'true',
}

/** Narrows `transition="…"` to the names above, and makes a typo an error. */
declare module '@rootnative/inertia' {
  interface RegisteredTransitions {
    entrance: TransitionConfig
    lift: TransitionConfig
    pill: TransitionConfig
    float: TransitionConfig
    hover: TransitionConfig
    bob: TransitionConfig
  }
}

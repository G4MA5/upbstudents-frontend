// Motion language of the application (mirrors the CSS tokens of index.css).
//
//   micro     ~140 ms  hover, press, focus, icon swaps, small toggles
//   standard  ~220 ms  cards, menus, dropdowns, filters, panels
//   large     ~320 ms  pages, modals and sheets, navigation changes
//
// Everything enters with the same decelerating curve (things arrive and
// settle) and leaves faster with an accelerating one (things get out of the
// way). Springs are reserved for elements the user directly manipulates or
// that indicate a selection. Reduced motion is handled globally by
// <MotionConfig reducedMotion="user"> and the CSS media query.
import type { Transition } from "framer-motion";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_IN = [0.4, 0, 1, 1] as const;

export const DURATION = { micro: 0.14, standard: 0.22, large: 0.32 } as const;

export const TRANSITION = {
  micro: { duration: DURATION.micro, ease: EASE_OUT },
  standard: { duration: DURATION.standard, ease: EASE_OUT },
  large: { duration: DURATION.large, ease: EASE_OUT },
  exit: { duration: DURATION.micro, ease: EASE_IN },
} satisfies Record<string, Transition>;

export const SPRING = {
  /** Selection indicators (tab capsule, chips, switches). */
  snappy: { type: "spring", stiffness: 520, damping: 38 },
  /** Sheets, dialogs, toasts: settle quickly without bouncing. */
  smooth: { type: "spring", stiffness: 380, damping: 36 },
  /** Small acknowledgements (badge appears, icon becomes active). */
  pop: { type: "spring", stiffness: 600, damping: 22 },
} satisfies Record<string, Transition>;

/** Content that appears in place (sections, success screens, forms). */
export const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4, transition: TRANSITION.exit },
  transition: TRANSITION.standard,
};

/** Route change: short, so navigation never feels slowed down. */
export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4, transition: TRANSITION.exit },
  transition: TRANSITION.large,
};

/** Menus, dropdowns and popovers, growing from their anchor. */
export const popover = {
  initial: { opacity: 0, y: -6, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -4, scale: 0.98, transition: TRANSITION.exit },
  transition: TRANSITION.standard,
};

/** Inline messages and optional blocks that push the content below. */
export const collapse = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: "auto" },
  exit: { opacity: 0, height: 0, transition: TRANSITION.exit },
  transition: TRANSITION.standard,
};

/** Switching between two views of the same area (tabs, auth steps). */
export const swap = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12, transition: TRANSITION.exit },
  transition: TRANSITION.standard,
};

/** Items of a list or grid: a short stagger, capped so long lists stay fast. */
export function listItem(index: number) {
  return {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { ...TRANSITION.standard, delay: Math.min(index % 12, 8) * 0.03 },
  };
}

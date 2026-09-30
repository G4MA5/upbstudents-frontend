// Interface switches: turning a feature off hides it without removing the code.
export const FEATURES = {
  /**
   * Right column on desktop (quick search, filières, quick preview).
   * Hidden for now; the components (RightRail.tsx) stay intact and are
   * still used elsewhere (FiliereAvatar, TopFilieres).
   */
  rightRail: false,
} as const;

// Ordered list of the documents currently shown by a page (filtered and
// sorted results, favourites…), so the preview can offer "previous / next"
// in the same order the student sees them.
let sequence: number[] = [];
let owner: symbol | null = null;

/** Registers the list of the calling page; returns the cleanup function. */
export function registerPreviewSequence(ids: number[]) {
  const me = Symbol("sequence");
  owner = me;
  sequence = ids;
  return () => {
    if (owner === me) {
      owner = null;
      sequence = [];
    }
  };
}

export function neighboursOf(id: number) {
  const i = sequence.indexOf(id);
  if (i === -1) return { prev: null, next: null, index: -1, total: 0 };
  return {
    prev: i > 0 ? sequence[i - 1] : null,
    next: i < sequence.length - 1 ? sequence[i + 1] : null,
    index: i,
    total: sequence.length,
  };
}

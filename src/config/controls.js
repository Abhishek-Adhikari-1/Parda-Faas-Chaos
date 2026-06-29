// ============================================================
// PARDA FAAS — Controls Configuration
// ============================================================

export const KEYS = {
  // Movement
  LEFT:   ['LEFT', 'A'],
  RIGHT:  ['RIGHT', 'D'],
  UP:     ['UP', 'W'],
  DOWN:   ['DOWN', 'S'],

  // Actions
  INTERACT:    'E',
  SPECIAL:     'Q',
  SHIELD:      'F',
  REJECT_BRIBE:'B',
  CASE_FILE:   'TAB',
  PUBLISH:     'SPACE',
  PAUSE:       'ESC',

  // Player 2 (Level 3+ co-op)
  P2_LEFT:  'J',
  P2_RIGHT: 'L',
  P2_UP:    'I',
  P2_DOWN:  'K',
  P2_INTERACT: 'U',
  P2_SPECIAL:  'O',
};

// Combo: E → E → Q within 4s = Rapid Evidence Chain
export const RAPID_EVIDENCE_CHAIN = {
  sequence: ['INTERACT', 'INTERACT', 'SPECIAL'],
  timeWindow: 4000,
  multiplier: 2.5,
  name: 'Rapid Evidence Chain',
  nameNP: 'द्रुत प्रमाण श्रृंखला',
};

export default KEYS;

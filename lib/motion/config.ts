export const motionDurations = {
  quick: 0.24,
  soft: 0.56,
  cover: 0.96,
  reveal: 0.72,
} as const;

export const motionStaggers = {
  tight: 0.045,
  row: 0.06,
} as const;

export const motionEases = {
  reveal: "power4.inOut",
  move: "expo.inOut",
  soft: "power3.out",
  snap: "power2.inOut",
} as const;

export const motionBreakpoints = {
  mobile: 768,
  desktop: 1024,
} as const;

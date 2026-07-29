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

export function randomFactor(amount: number = 0.1, offset: number = 1) {
  return offset - amount / 2 + Math.random() * amount;
}

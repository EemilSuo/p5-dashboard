export const factorial = (n) => {
  if (n <= 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
};

export const poissonProb = (k, L) => {
  if (L <= 0) return k === 0 ? 1 : 0;
  // Poisson-kaava: (L^k * e^-L) / k!
  return (Math.pow(L, k) * Math.exp(-L)) / factorial(k);
};

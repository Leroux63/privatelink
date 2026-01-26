export function formatSol(lamports: number) {
  return (lamports / 1e9).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 9,
  });
}

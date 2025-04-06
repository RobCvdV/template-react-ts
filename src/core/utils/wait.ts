export async function waitSeconds(seconds: number): Promise<void> {
  return waitMs(seconds * 1000);
}

export async function waitMs(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

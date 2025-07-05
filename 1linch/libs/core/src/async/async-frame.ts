export async function asyncFrame(tik = 1) {
  for (let i = 0; i < tik; i++) {
    await new Promise((resolve) => requestAnimationFrame(resolve))
  }
}

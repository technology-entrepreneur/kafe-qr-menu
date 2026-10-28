/**
 * Lüks Altın & Kehribar Konfeti / Işıltı Efekti (Awwwards / Apple Standardı)
 * Client-side güvenli ve performansı optimize edilmiştir.
 */
export async function triggerGoldenConfetti(originX = 0.5, originY = 0.55) {
  if (typeof window === "undefined") return;

  try {
    const confettiModule = await import("canvas-confetti");
    const confetti = confettiModule.default;

    // 1. Aşama: Merkezden patlayan altın yıldız ve ışıltı parçacıkları
    confetti({
      particleCount: 45,
      spread: 80,
      startVelocity: 35,
      origin: { x: originX, y: originY },
      colors: ["#f59e0b", "#fbbf24", "#fcd34d", "#ffffff", "#d97706"],
      disableForReducedMotion: true,
      scalar: 1.1,
      ticks: 200,
      gravity: 0.8,
    });

    // 2. Aşama: İki yandan yükselen ince şampanya parıltısı
    setTimeout(() => {
      confetti({
        particleCount: 25,
        angle: 60,
        spread: 50,
        startVelocity: 30,
        origin: { x: Math.max(0.1, originX - 0.15), y: originY },
        colors: ["#f59e0b", "#fde68a", "#ffffff"],
        ticks: 180,
        scalar: 0.9,
      });

      confetti({
        particleCount: 25,
        angle: 120,
        spread: 50,
        startVelocity: 30,
        origin: { x: Math.min(0.9, originX + 0.15), y: originY },
        colors: ["#f59e0b", "#fde68a", "#ffffff"],
        ticks: 180,
        scalar: 0.9,
      });
    }, 120);
  } catch (err) {
    console.error("Confetti error:", err);
  }
}

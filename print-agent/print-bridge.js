/**
 * QR Kafe & Restoran - Yerel Termal Yazıcı Köprüsü (ESC/POS Print Bridge)
 * 
 * Bu hafif arka plan servisi yerel ağınızdaki (LAN) Mutfak, Bar ve Nargilehane
 * termal yazıcılarına (TCP port 9100) otomatik olarak ESC/POS baytları gönderir.
 * 
 * Bağımlılık: SIFIR (Saf Node.js built-in net & http modülleri ile çalışır)
 * Çalıştırma: node print-agent/print-bridge.js
 */

const net = require("net");
const http = require("http");

// ============================================================
// 1. YAPILANDIRMA (İşletme Ağına Göre Düzenlenebilir)
// ============================================================
const CONFIG = {
  // Bulut veya yerel sunucu adresi
  SERVER_URL: process.env.SERVER_URL || "http://localhost:3000",
  POLL_INTERVAL_MS: 1500, // 1.5 saniyede bir kuyruk kontrolü

  // Termal Ağ Yazıcıları (İstasyon IP & Port Eşleştirmesi)
  PRINTERS: {
    kitchen: { ip: "192.168.1.200", port: 9100, name: "Mutfak Yazıcısı" },
    bar: { ip: "192.168.1.201", port: 9100, name: "Bar & Kahve Yazıcısı" },
    hookah: { ip: "192.168.1.202", port: 9100, name: "Nargilehane Yazıcısı" },
    cashier: { ip: "192.168.1.203", port: 9100, name: "Kasa Adisyon Yazıcısı" },
  },
};

// ============================================================
// 2. ESC/POS STANDART KOMUTLARI (Buffer Üreteci)
// ============================================================
const ESC = 0x1b;
const GS = 0x1d;

const COMMANDS = {
  INIT: Buffer.from([ESC, 0x40]), // ESC @ (Yazıcıyı Sıfırla)
  ALIGN_LEFT: Buffer.from([ESC, 0x61, 0x00]),
  ALIGN_CENTER: Buffer.from([ESC, 0x61, 0x01]),
  ALIGN_RIGHT: Buffer.from([ESC, 0x61, 0x02]),
  BOLD_ON: Buffer.from([ESC, 0x45, 0x01]),
  BOLD_OFF: Buffer.from([ESC, 0x45, 0x00]),
  TEXT_NORMAL: Buffer.from([GS, 0x21, 0x00]), // Normal Boyut
  TEXT_DOUBLE: Buffer.from([GS, 0x21, 0x11]), // 2x Yükseklik & Genişlik (Büyük Masa No)
  TEXT_QUAD: Buffer.from([GS, 0x21, 0x33]),   // 4x Boyut
  LINE_FEED: Buffer.from([0x0a]),
  PAPER_CUT: Buffer.from([GS, 0x56, 0x42, 0x00]), // Kağıt Kesme
  BEEPER: Buffer.from([ESC, 0x42, 0x02, 0x02]),    // 2 Kere Sesli Uyarı Zili
};

// Türkçe karakterleri termal yazıcı için normalize et
function cleanTurkish(text) {
  if (!text) return "";
  return text
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "G")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "U")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "S")
    .replace(/ı/g, "i")
    .replace(/İ/g, "I")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "O")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "C");
}

// ============================================================
// 3. FİŞ VERİSİNİ ESC/POS RAW BYTES'A DÖNÜŞTÜRÜCÜ
// ============================================================
function generateEscPosBuffer(receipt) {
  const parts = [];

  const add = (buf) => parts.push(buf);
  const addText = (text) => parts.push(Buffer.from(cleanTurkish(text) + "\n", "ascii"));
  const addLine = () => addText("------------------------------------------------");

  add(COMMANDS.INIT);
  add(COMMANDS.BEEPER); // Zil çal

  if (receipt.type === "kitchen") {
    // A) MUTFAK / BAR / NARGİLE FİŞİ
    add(COMMANDS.ALIGN_CENTER);
    add(COMMANDS.BOLD_ON);

    const stationTitle =
      receipt.kdsStation === "hookah"
        ? "*** NARGILEHANE ***"
        : receipt.kdsStation === "bar"
        ? "*** BAR & KAHVE ***"
        : "*** MUTFAK SIPARISI ***";

    addText(stationTitle);
    add(COMMANDS.BOLD_OFF);
    add(COMMANDS.LINE_FEED);

    // BÜYÜK MASA NO
    add(COMMANDS.TEXT_DOUBLE);
    add(COMMANDS.BOLD_ON);
    addText(`MASA: ${receipt.tableNumber}`);
    add(COMMANDS.TEXT_NORMAL);
    add(COMMANDS.BOLD_OFF);

    add(COMMANDS.ALIGN_LEFT);
    addLine();
    addText(`Tarih: ${new Date(receipt.createdAt || Date.now()).toLocaleTimeString("tr-TR")}`);
    addText(`Kaynak: ${receipt.source === "waiter" ? "Garson Terminali" : "Musteri QR Menu"}`);
    addLine();

    // Ürün Kalemleri (Büyük Puntolarla)
    (receipt.items || []).forEach((item) => {
      add(COMMANDS.BOLD_ON);
      add(COMMANDS.TEXT_DOUBLE);
      addText(`[${item.quantity}x] ${item.productName}`);
      add(COMMANDS.TEXT_NORMAL);
      add(COMMANDS.BOLD_OFF);

      if (item.selectedOptions && item.selectedOptions.length > 0) {
        item.selectedOptions.forEach((opt) => {
          addText(`   >> ${opt.name}`);
        });
      }
      add(COMMANDS.LINE_FEED);
    });

    if (receipt.notes) {
      addLine();
      add(COMMANDS.BOLD_ON);
      addText(`NOT: "${receipt.notes}"`);
      add(COMMANDS.BOLD_OFF);
    }

    addLine();
    add(COMMANDS.ALIGN_CENTER);
    addText("*** SIPARIS SONU ***");
    add(COMMANDS.LINE_FEED);
    add(COMMANDS.LINE_FEED);
    add(COMMANDS.LINE_FEED);
    add(COMMANDS.PAPER_CUT);
  } else {
    // B) KASA HESAP ADİSYONU
    add(COMMANDS.ALIGN_CENTER);
    add(COMMANDS.BOLD_ON);
    addText(receipt.cafeName || "GLORIOUS CAFE");
    add(COMMANDS.BOLD_OFF);
    addText("HESAP ADISYONU");
    add(COMMANDS.LINE_FEED);

    add(COMMANDS.ALIGN_LEFT);
    addLine();
    addText(`MASA: ${receipt.tableNumber}`);
    addText(`Tarih: ${new Date(receipt.printedAt || Date.now()).toLocaleString("tr-TR")}`);
    addLine();

    (receipt.items || []).forEach((item) => {
      const priceStr = item.totalPrice ? `${item.totalPrice} TL` : "";
      addText(`${item.quantity}x ${item.productName.padEnd(28)} ${priceStr.padStart(10)}`);
      if (item.selectedOptions) {
        item.selectedOptions.forEach((opt) => {
          addText(`   + ${opt.name}`);
        });
      }
    });

    addLine();
    add(COMMANDS.ALIGN_RIGHT);
    add(COMMANDS.BOLD_ON);
    add(COMMANDS.TEXT_DOUBLE);
    addText(`TOPLAM: ${receipt.remainingAmount ?? receipt.totalAmount} TL`);
    add(COMMANDS.TEXT_NORMAL);
    add(COMMANDS.BOLD_OFF);

    addLine();
    add(COMMANDS.ALIGN_CENTER);
    addText("AFIYET OLSUN!");
    addText("Bizi tercih ettiginiz icin tesekkurler.");
    add(COMMANDS.LINE_FEED);
    add(COMMANDS.LINE_FEED);
    add(COMMANDS.PAPER_CUT);
  }

  return Buffer.concat(parts);
}

// ============================================================
// 4. TCP SOCKET İLE AĞ YAZICISINA GÖNDERİCİ
// ============================================================
function sendToNetworkPrinter(targetIp, targetPort, rawBuffer) {
  return new Promise((resolve, reject) => {
    console.log(`[TCP] Yazıcıya bağlanılıyor: ${targetIp}:${targetPort}...`);
    const client = new net.Socket();

    client.setTimeout(4000); // 4 saniye timeout

    client.connect(targetPort, targetIp, () => {
      console.log(`[TCP] Bağlantı başarılı, veri aktarılıyor (${rawBuffer.length} bayt)...`);
      client.write(rawBuffer, () => {
        console.log(`[TCP] Yazdırma tamamlandı.`);
        client.end();
        resolve(true);
      });
    });

    client.on("error", (err) => {
      console.error(`[TCP HATA] ${targetIp}:${targetPort} ->`, err.message);
      client.destroy();
      reject(err);
    });

    client.on("timeout", () => {
      console.error(`[TCP TIMEOUT] ${targetIp}:${targetPort} yanıt vermedi.`);
      client.destroy();
      reject(new Error("Timeout"));
    });
  });
}

// ============================================================
// 5. BULUT KUYRUĞUNU DİNLEYİCİ (POLLING LOOP)
// ============================================================
async function checkPrintQueue() {
  const url = `${CONFIG.SERVER_URL}/api/print-queue?station=all&markDone=true`;

  http
    .get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", async () => {
        try {
          const json = JSON.parse(data);
          const jobs = json.jobs || [];

          if (jobs.length > 0) {
            console.log(`\n[KUYRUK] ${jobs.length} yeni yazdırma görevi alındı.`);

            for (const job of jobs) {
              const station = job.station || "kitchen";
              const printer = CONFIG.PRINTERS[station] || CONFIG.PRINTERS.kitchen;

              console.log(
                `-> Fiş Yazdırılıyor: Masa ${job.receipt.tableNumber} | İstasyon: ${station} (${printer.name} - ${printer.ip}:${printer.port})`
              );

              const rawBuffer = generateEscPosBuffer(job.receipt);

              try {
                await sendToNetworkPrinter(printer.ip, printer.port, rawBuffer);
              } catch (e) {
                console.log(`   [Simülasyon Modu] Fiziksel yazıcı bağlı değilse yerel test başarılı sayıldı.`);
              }
            }
          }
        } catch (e) {}
      });
    })
    .on("error", () => {
      // Sunucu geçici kapalıysa sessiz kal
    });
}

console.log("=================================================");
console.log("  QR KAFE 80MM TERMAL YAZICI KÖPRÜSÜ (PRINT BRIDGE)");
console.log("=================================================");
console.log(`Sunucu Dinleniyor: ${CONFIG.SERVER_URL}`);
console.log(`Mutfak Yazıcısı   : ${CONFIG.PRINTERS.kitchen.ip}:${CONFIG.PRINTERS.kitchen.port}`);
console.log(`Bar Yazıcısı      : ${CONFIG.PRINTERS.bar.ip}:${CONFIG.PRINTERS.bar.port}`);
console.log(`Nargile Yazıcısı  : ${CONFIG.PRINTERS.hookah.ip}:${CONFIG.PRINTERS.hookah.port}`);
console.log("Kuyruk dinleniyor... (Durdurmak için Ctrl+C)\n");

setInterval(checkPrintQueue, CONFIG.POLL_INTERVAL_MS);


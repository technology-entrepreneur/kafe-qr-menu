# 🖨️ 80mm Termal Yazıcı Köprüsü (ESC/POS Print Bridge)

Bu modül, bulut üzerindeki QR Menü & Kafe sisteminizin yerel ağdaki (LAN) Ethernet/Wi-Fi ve USB termal yazıcılara doğrudan, sessiz ve otomatik fiş göndermesini sağlar.

---

## 🚀 1. Sessiz ve Otomatik Yazdırma (Chrome Kiosk Modu)
Kasa veya Mutfak bilgisayarında hiçbir "Yazdır" penceresi çıkmadan, sıfır tıkla termal fiş çıkması için:

1. Masaüstündeki Google Chrome kısayoluna sağ tıklayın -> **Özellikler** deyin.
2. **Hedef (Target)** alanının sonuna bir boşluk bırakarak şu parametreyi ekleyin:
   ```bash
   --kiosk-printing
   ```
3. Chrome varsayılan yazıcısını 80mm Termal Yazıcınız olarak seçin.
4. Artık KDS veya Kasa ekranında sipariş düştüğünde fiş doğrudan yazıcıdan fırlar!

---

## 🌐 2. Ağ Yazıcıları Köprüsü (TCP/IP Port 9100)
Mutfak, Bar veya Nargilehane yazıcıları ağ kablosu (Ethernet) veya Wi-Fi ile modeme bağlıysa:

1. İşletme bilgisayarında terminali açın:
   ```bash
   node print-agent/print-bridge.js
   ```
2. Bu betik:
   - Bulut yazdırma kuyruğunu dinler (`/api/print-queue`).
   - Mutfak siparişlerini `192.168.1.200:9100` adresine,
   - Bar siparişlerini `192.168.1.201:9100` adresine,
   - Nargilehane siparişlerini `192.168.1.202:9100` adresine yönlendirir.
   - Kağıdı otomatik keser (`GS V 66 0`) ve dahili zili çalar.

---

## ⚙️ Yapılandırma
`print-agent/print-bridge.js` dosyasındaki `PRINTERS` objesinden işletmenizin yazıcı IP adreslerini dilediğiniz gibi güncelleyebilirsiniz.


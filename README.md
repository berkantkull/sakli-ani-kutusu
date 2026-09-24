# Saklı — dijital anı kutusu

Konseptini ve hayal dünyanı seç; kartpostal, şekilli not, fotoğraf, şarkı, sesli mesaj, gizli kart ve zaman çizgisinden kişisel bir anı kutusu oluştur.

Canlı site: https://saklianikutusu.berkantkul.com.tr/

Site haritası: https://saklianikutusu.berkantkul.com.tr/sitemap.xml

## Özellikler
- Aşk, doğum günü, yıl dönümü, Sevgililer Günü, terfi, içimden geldi ve serbest içerikli Özel konsepti.
- Girişte keşfedilebilen Saklı kâğıt, Yıldızlı gece, Eski film, Botanik bahçe, Şişedeki mesaj ve Rüya bulutu atmosferleri.
- Düzenlenebilir ve sıralanabilir en fazla 16 anı.
- Ses dosyası, dokununca açılan gizli mesaj ve tarihli anılardan oluşan zaman çizgisi kartları.
- Cihazda fotoğraf boyutlandırma, tarayıcıda taslak kaydı.
- Alıcının açabileceği sürpriz kutu önizlemesi.
- Beş renk paleti, beş kapak simgesi, üç yazı havası, iki anı düzeni ve seçilebilen dekoratif çıkartmalar.
- Kutu açılırken kalp, yıldız, konfeti veya sade açılış efekti.
- Kişiye özel kapanış cümlesi.
- Konsepte göre düzenlenebilir yazı önerileri; kişiselleştirme seçenekleri isteğe bağlı ve kapalı başlar.
- Tek tıkla üretilen, kopyalanabilen ve mobil paylaşım menüsüyle gönderilebilen kalıcı kutu bağlantısı.
- Alıcı için düzenleme araçlarından arındırılmış, salt okunur hediye sayfası.
- Kullanıcının seçtiği Spotify bağlantısının, dinleme düğmesine basıldıktan sonra gömülü oynatıcıda açılması.

## Gizlilik ve paylaşım
Kutuyu hazırlarken taslak yalnızca kullanılan tarayıcının localStorage alanında saklanır. “Paylaşım linki oluştur” düğmesine basıldığında notlar ve kutu ayarları D1 veritabanına, fotoğraflar ile ses kayıtları R2 nesne deposuna yüklenir. Bağlantı uzun ve tahmin edilmesi güç bir kimlik taşır; bağlantıya sahip olan herkes kutuyu görebilir.

Spotify ve Google Fonts bağlantıları internet gerektirir. Kutular anonimdir; kullanıcı hesabı, düzenleme bağlantısı veya silme paneli bu sürümde yoktur.

## Çalıştırma
`npm install`, ardından `npm run build` komutlarını çalıştırın. Üretim çıktısı `dist/server/index.js`; D1 geçişleri `dist/.openai/drizzle` altında hazırlanır.

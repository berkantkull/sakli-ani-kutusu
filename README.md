# Saklı — dijital anı kutusu

Konseptini seç, kartpostal, şekilli not, fotoğraf ve Spotify şarkısından kişisel bir anı kutusu oluştur.

## Özellikler
- Aşk, doğum günü, yıl dönümü, Sevgililer Günü, terfi, içimden geldi konseptleri.
- Düzenlenebilir ve sıralanabilir en fazla 16 anı.
- Cihazda fotoğraf boyutlandırma, tarayıcıda taslak kaydı.
- Alıcının açabileceği sürpriz kutu önizlemesi.
- Beş renk paleti, beş kapak simgesi, üç yazı havası ve iki anı düzeni.
- Kutu açılırken kalp, yıldız, konfeti veya sade açılış efekti.
- Kişiye özel kapanış cümlesi.
- Konsepte göre düzenlenebilir yazı önerileri; kişiselleştirme seçenekleri isteğe bağlı ve kapalı başlar.
- Tek tıkla üretilen, kopyalanabilen ve mobil paylaşım menüsüyle gönderilebilen kalıcı kutu bağlantısı.
- Alıcı için düzenleme araçlarından arındırılmış, salt okunur hediye sayfası.
- Kullanıcının seçtiği Spotify bağlantısının, dinleme düğmesine basıldıktan sonra gömülü oynatıcıda açılması.

## Gizlilik ve paylaşım
Kutuyu hazırlarken taslak yalnızca kullanılan tarayıcının localStorage alanında saklanır. “Paylaşım linki oluştur” düğmesine basıldığında notlar ve kutu ayarları D1 veritabanına, fotoğraflar R2 nesne deposuna yüklenir. Bağlantı uzun ve tahmin edilmesi güç bir kimlik taşır; bağlantıya sahip olan herkes kutuyu görebilir.

Spotify ve Google Fonts bağlantıları internet gerektirir. Kutular anonimdir; kullanıcı hesabı, düzenleme bağlantısı veya silme paneli bu sürümde yoktur.

## Çalıştırma
`npm install`, ardından `npm run build` komutlarını çalıştırın. Üretim çıktısı `dist/server/index.js`; D1 geçişleri `dist/.openai/drizzle` altında hazırlanır.

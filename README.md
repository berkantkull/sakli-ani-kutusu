# Saklı — dijital anı kutusu

Konseptini seç, kartpostal, şekilli not, fotoğraf ve Spotify şarkısından kişisel bir anı kutusu oluştur.

## Özellikler
- Aşk, doğum günü, yıl dönümü, Sevgililer Günü, terfi, içimden geldi konseptleri.
- Düzenlenebilir ve sıralanabilir en fazla 16 anı.
- Cihazda fotoğraf boyutlandırma, tarayıcıda taslak kaydı.
- Alıcının açabileceği sürpriz kutu önizlemesi.
- Fotoğrafları içinde taşıyan indirilebilir HTML hediye dosyası.
- Kullanıcının seçtiği Spotify bağlantısının, dinleme düğmesine basıldıktan sonra gömülü oynatıcıda açılması.

## Gizlilik ve paylaşım
Anılar sunucuya gönderilmez. Taslak yalnızca kullanılan tarayıcının localStorage alanında saklanır. Paylaşılan cihazlarda diğer kullanıcılar taslağa erişebilir. Saklama alanı dolarsa uygulama uyarır; taslak kaydı garanti edilmez. Fotoğraflar ve notlar indirilen dosyanın içinde bulunur; dosya şifreli değildir, gönderdiğiniz kişi içeriğini görebilir.

Bu sürüm çevrimiçi kutu kaydetme veya kişiye özel paylaşım bağlantısı üretmez. Alıcı indirilen HTML dosyasını bir web tarayıcısında açar. Bazı mobil mesajlaşma uygulamaları HTML önizlemesini desteklemediğinden dosyayı indirmek veya bilgisayarda açmak gerekebilir. Spotify ve Google Fonts bağlantıları internet gerektirir; notlar ve fotoğraflar dosyadadır.

## Çalıştırma
Dosyaları bir statik HTTP sunucusuyla sunun. Paket kurulumu veya derleme gerekmez. GitHub Pages: main dalı ve kök klasör.

# Minnosh — OPNsense için kolay yönetim eklentisi

En sık kullanılan OPNsense ayarlarını menülerde aramak yerine tek ekrandan yönetmek için bir eklenti.
Hedef sürüm: **OPNsense 26.7** (26.7.8 üzerinde geliştiriliyor).

Tasarım taslağı: https://claude.ai/artifact/9HQfR7v4fu2ouPT9Xh73qN

## Sürüm 0.1'de neler var

| Sekme | Ne yapıyor | OPNsense'te nereye yazıyor |
|---|---|---|
| Genel bakış | Koruma durumu, çevrimiçi cihazlar, WAN anlık hız ve grafik, engellenen DNS istekleri, en aktif cihazlar, hızlı koruma anahtarları | Sadece okur (`interface show traffic`, `unbound qstats totals`) |
| Cihazlar | Korunan ağlardaki cihaz listesi, ad/tür verme, tek tıkla internet kesme | `minnosh_blocked` adlı MAC takma adı + otomatik engel kuralı |
| Engelleme | Reklam, zararlı, yetişkin, kumar, VPN/DoH atlatma kategorileri; 12 uygulama; izin/engel listeleri; güvenli arama; DNS zorlama | Unbound engel listesi politikası `Minnosh (managed)`, Unbound SafeSearch, otomatik NAT (rdr) kuralı |
| Ayarlar | Dil, korunan ağlar, engel yanıtı (0.0.0.0 / NXDOMAIN), DNS istatistikleri, Minnosh aç/kapat | `OPNsense/Minnosh` modeli |

Diğer bölümler (Ağ ve İnternet, Zamanlama, Port yönlendirme, VPN, Misafir ağı, Ülke engelleme) arayüzde "Yakında" olarak görünür.

**Çalışma şekli:** Ekranda yapılan her değişiklik önce taslak olarak tutulur. "Uygula"ya basılınca tek istekte kaydedilir:
1. Minnosh modeli doğrulanır ve kaydedilir.
2. `minnosh_blocked` takma adı ve Unbound politikası güncellenir.
3. Güvenlik duvarı yeniden yüklenir ve takma ad tabloları doldurulur.
4. İnterneti kesilen cihazların açık bağlantıları düşürülür.
5. Unbound yapılandırması yenilenir; engel listeleri arka planda indirilir.

Minnosh, OPNsense ayarlarının ayrı bir kopyasını tutmaz. Yaptığı her şey normal OPNsense sayfalarında da görünür.

## Klasör yapısı

```
os-minnosh/                       opnsense/plugins deposundaki bir eklenti klasörüyle aynı yapı
  Makefile, pkg-descr
  src/etc/inc/plugins.inc.d/minnosh.inc        otomatik güvenlik duvarı kuralları (minnosh_firewall)
  src/opnsense/mvc/app/models/OPNsense/Minnosh model (Minnosh.xml), menü, ACL
  src/opnsense/mvc/app/library/OPNsense/Minnosh Catalog (kategori→liste, uygulama→alan adı), Integration (uygulama)
  src/opnsense/mvc/app/controllers/OPNsense/Minnosh  sayfa + API (state, devices, dashboard, service)
  src/opnsense/mvc/app/views/OPNsense/Minnosh  index.volt
  src/opnsense/www/js/minnosh/app.js           tek sayfa arayüz
  src/opnsense/www/js/minnosh/i18n/{tr,en}.js  dil dosyaları
  src/opnsense/www/css/minnosh/minnosh.css
  src/opnsense/scripts/OPNsense/Minnosh        hosts.py (cihaz listesi), killstates.py
  src/opnsense/service/conf/actions.d/actions_minnosh.conf
tools/deploy.sh, tools/remove.sh             test cihazına kopyalama / kaldırma
```

### API

| Uç nokta | Açıklama |
|---|---|
| `GET /api/minnosh/state/get` | Tüm Minnosh ayarları ve seçenekler |
| `GET /api/minnosh/devices/list` | Görülen cihazlar ve kayıtlı cihazlar |
| `GET /api/minnosh/dashboard/traffic` | WAN bayt sayaçları (hız tarayıcıda hesaplanır) |
| `GET /api/minnosh/dashboard/dns` | DNS toplamları, en çok engellenenler |
| `POST /api/minnosh/service/apply` | Taslağı kaydet ve uygula (tam yönetici yetkisi gerekir) |

## Proxmox'ta test

1. Proxmox'ta bir OPNsense 26.7 sanal makinesi kurun. En az iki ağ kartı olsun: WAN ve LAN.
2. LAN tarafına bir test istemcisi (sanal makine veya konteyner) bağlayın.
3. OPNsense'te **Sistem › Ayarlar › Yönetim** altında SSH'ı açın ve root ile anahtar girişine izin verin.
4. Önerilen: **Arayüzler › Komşular › Keşif Ayarları**'ndan host keşfini (Hostwatch) açın. Kapalıysa cihaz listesi ARP tablosundan alınır.
5. Buradan kurulum yapın:
   ```sh
   tools/deploy.sh root@<opnsense-ip>
   ```
6. Tarayıcıda `https://<opnsense-ip>/ui/minnosh` adresini açın (menüde **Minnosh › Panel**).

### Kontrol listesi
- [ ] Cihazlar sekmesinde test istemcisi görünüyor.
- [ ] İnterneti kes + Uygula: istemci internete çıkamıyor, OPNsense'e (DNS, arayüz) erişebiliyor. **Güvenlik Duvarı › Takma Adlar**'da `minnosh_blocked` içinde istemcinin MAC adresi var.
- [ ] Reklam kategorisi + Uygula: **Servisler › Unbound DNS › Engel Listeleri**'nde `Minnosh (managed)` politikası var; `doubleclick.net` 0.0.0.0 dönüyor.
- [ ] TikTok + Uygula: `tiktok.com` engelleniyor.
- [ ] DNS'i zorla + Uygula: istemci `nslookup example.com 8.8.8.8` yapsa bile cevap OPNsense'ten geliyor.
- [ ] Genel bakış: WAN hızı ve grafik birkaç saniyede bir güncelleniyor; engellenen istek sayısı artıyor.
- [ ] Dil TR/EN geçişi tüm metinleri değiştiriyor.

### Sorun giderme
- Sayfa açılmıyor veya menü görünmüyor: `rm -f /tmp/opnsense_menu_cache.xml /tmp/opnsense_acl_cache.json`
- API hataları: **Sistem › Günlük Dosyaları › Web GUI**, `/var/log/configd/latest.log`
- Üretilen kurallar: `pfctl -sr | grep -i minnosh` ve `pfctl -sn | grep -i minnosh`

## Bilinen sınırlar (0.1)

- Uygulama engelleme DNS tabanlıdır. Sabit IP kullanan veya kendi DNS'ini şifreli kullanan uygulamalar için "VPN, proxy ve şifreli DNS" kategorisini ve "DNS'i zorla" seçeneğini birlikte açın.
- DNS zorlama yalnızca IPv4 düz DNS'i (53) yönlendirir. DoT (853) ve DoH, "atlatma" kategorisiyle engellenir.
- Engelleme kuralları şimdilik tüm ağ için geçerli. Cihaza ve ağa özel politikalar Unbound'un `source_nets` özelliğiyle sonraki sürümde gelecek.
- "Bağlantı" sütunu, cihazın o anki pf durum (state) sayısıdır; bu bir trafik miktarı değildir.

## Yeni dil eklemek

1. `www/js/minnosh/i18n/en.js` dosyasını kopyalayın (ör. `de.js`). `window.MinnoshI18n.de = {...}` olarak değiştirip metinleri çevirin.
2. `index.volt` içine bir `<script>` satırı ekleyin.
3. `Minnosh.xml` içindeki `language` seçeneklerine `<de>Deutsch</de>` ekleyin.

## Paket olarak derleme

`os-minnosh` klasörünü bir FreeBSD/OPNsense derleme ortamındaki `opnsense/plugins` deposuna (ör. `security/minnosh`) kopyalayın. Ardından o klasörde `make package` çalıştırın.

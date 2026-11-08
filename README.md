# Minnosh — OPNsense için kolay yönetim eklentisi

En sık kullanılan OPNsense ayarlarını menülerde aramak yerine tek ekrandan yönetmek için bir eklenti.
Hedef sürüm: **OPNsense 26.7** (26.7.8 üzerinde geliştiriliyor).

Tasarım taslağı: https://claude.ai/artifact/9HQfR7v4fu2ouPT9Xh73qN

## Sürüm 0.2'de neler var

| Sekme | Ne yapıyor | OPNsense'te nereye yazıyor |
|---|---|---|
| Genel bakış | Koruma durumu, çevrimiçi cihazlar, WAN hızı ve grafik, engellenen DNS istekleri, en aktif cihazlar, hızlı koruma anahtarları, ilk açılışta karşılama kartı | Sadece okur |
| Cihazlar | Cihaz listesi, ad/tür verme, tek tıkla internet kesme | `minnosh_blocked` MAC takma adı + otomatik engel kuralı |
| Ağ ve İnternet | WAN: DHCP / PPPoE (VLAN etiketli) / sabit IP, IPv6, port; yerel ağ ekleme (VLAN veya ayrı port), adres ve DHCP; üç durumlu ağlar arası erişim tablosu; port görünümü | Arayüzler, VLAN'lar, PPPoE, ağ geçidi, dnsmasq DHCP aralıkları (OPNsense kurulum sihirbazıyla aynı yöntem); erişim kuralları otomatik kural olarak |
| Engelleme | Kategoriler, 12 uygulama, izin/engel listeleri, güvenli arama, DNS zorlama | Unbound politikası `Minnosh (managed)`, otomatik rdr kuralı |
| Zamanlama | Gün/saat aralığında cihazın internetini kesme veya uygulama engelleme; her dakika değerlendirilir | pf tablosu `minnosh_sched`, zamanlama başına Unbound politikası `Minnosh schedule: …` |
| Port yönlendirme | Hazır servisler, hedef cihaz seçimi, aç/kapat, sil; UPnP durumu | Güvenlik Duvarı › NAT › Port Forward kuralları (izin kuralı otomatik) |
| VPN | WireGuard sunucusu, cihaz ekleme (QR kodu + dosya, gizli anahtar bir kez gösterilir), tüm trafik / sadece ev ağı | WireGuard örneği `minnosh` + peer'lar; WAN izin, VPN izin ve NAT otomatik kural olarak |
| Misafir ağı | Misafir türündeki ağları izole etme, hız sınırı, bağlı misafirler | Erişim tablosu + Trafik Şekillendirici `Minnosh guest …` |
| Ülke engelleme | Ülke seçimi, yalnız gelen / gelen ve giden, engellenen deneme sayısı. Ülke verisi kayıt gerektirmeden **DB-IP Lite**'tan (CC BY 4.0) alınır, ayda bir yenilenir; isteyen kendi MaxMind anahtarını kullanabilir | GeoIP takma adı `minnosh_geo` + otomatik kural; OPNsense'te kaynak ayarlı değilse ülke dosyaları `/usr/local/share/GeoIP/alias` altına yazılır |
| Ayarlar | Dil, korunan ağlar, engel yanıtı, DNS istatistikleri, **Minnosh'un eklediklerini kaldır** | `OPNsense/Minnosh` modeli |

**Çalışma şekli**
- Ayarlar önce taslakta tutulur; başlıktaki çubukta sayılır, **Değişiklikleri göster** ile tek tek görülüp geri alınabilir, **Uygula** ile tek seferde yazılır.
- Port yönlendirme ve VPN cihazı ekleme/silme anında geçerli olur (OPNsense'teki gibi).
- **Ağ değişiklikleri** (WAN, ağ ekleme/silme, adres) kendi düğmesiyle uygulanır ve **geri alma korumalıdır**: değişiklikten önce yapılandırmanın yedeği alınır; 90 saniye içinde "Çalışıyor, kalıcı yap" ile onaylanmazsa OPNsense eski yapılandırmayı kendi kendine geri yükler.

## Mevcut (önceden yapılandırılmış) OPNsense'e kurulum

Minnosh mevcut ayarları okur ve yalnızca kullanıcının Minnosh'tan değiştirdiği şeye dokunur:
- İlk açılışta hiçbir koruma kendiliğinden açılmaz; panelde "Önerilen korumaları aç" kartı çıkar.
- Erişim tablosundaki her hücre varsayılan olarak **"OPNsense"** durumundadır: mevcut güvenlik duvarı kuralları geçerlidir. Kural yalnızca kullanıcı bir hücreyi İzinli/Engelli yaptığında eklenir.
- Minnosh'un anlayamadığı yapılar (çoklu WAN, LAGG/bridge üyesi ağlar, takma ad kullanan port yönlendirmeleri…) **salt okunur** gösterilir.
- Minnosh yalnızca kendi oluşturduğu ağları silebilir. Kendi WireGuard örneği için boş bir port ve çakışmayan bir tünel ağı seçer; varsa GeoIP adresinin üzerine yazmaz.
- Eklediği her kayıt "Minnosh" etiketi taşır. **Ayarlar › Minnosh'un eklediklerini kaldır**, yalnızca bu kayıtları siler ve Minnosh'u kapatır. Port yönlendirmeleri, ağlar ve VPN cihazları kullanıcının bilinçli oluşturduğu şeyler olduğu için kalır.
- Otomatik güvenlik duvarı kuralları config.xml'e yazılmaz; eklenti kaldırılınca kendiliğinden kaybolur.

## Klasör yapısı

```
os-minnosh/                       opnsense/plugins deposundaki bir eklenti klasörüyle aynı yapı
  Makefile, pkg-descr
  src/etc/inc/plugins.inc.d/minnosh.inc        otomatik güvenlik duvarı kuralları (minnosh_firewall)
  src/opnsense/mvc/app/models/OPNsense/Minnosh model (Minnosh.xml), menü, ACL
  src/opnsense/mvc/app/library/OPNsense/Minnosh Catalog, Integration (Uygula), Network, Rollback, PortForward, Vpn, Extras (GeoIP, hız sınırı)
  src/opnsense/mvc/app/controllers/OPNsense/Minnosh  sayfa + API (state, devices, dashboard, service, network, portforward, vpn, geo)
  src/opnsense/mvc/app/views/OPNsense/Minnosh  index.volt
  src/opnsense/www/js/minnosh/app.js           çekirdek: durum, taslak, değişiklik listesi, sekme altyapısı
  src/opnsense/www/js/minnosh/views/*.js       net, sched, pf, vpn, guest, geo sekmeleri
  src/opnsense/www/js/minnosh/i18n/{tr,en}.js  dil dosyaları
  src/opnsense/www/css/minnosh/minnosh.css
  src/opnsense/scripts/OPNsense/Minnosh        hosts.py, killstates.py, dnsbl.sh, schedule.php (her dakika), rollback.php, nettest.py, geoip_dbip.py
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
| `POST /api/minnosh/service/language` | Arayüz dilini hemen kaydet |
| `POST /api/minnosh/service/cleanup` | Minnosh'un eklediklerini kaldır, Minnosh'u kapat |
| `GET /api/minnosh/network/get`, `POST …/apply`, `POST …/confirm`, `GET …/test` | Ağ durumu, geri alma korumalı değişiklik, onay, bağlantı testi |
| `GET /api/minnosh/portforward/list`, `POST …/add`, `…/toggle/{uuid}`, `…/del/{uuid}` | Port yönlendirme |
| `GET /api/minnosh/vpn/status`, `POST …/enable`, `…/add`, `…/toggle/{uuid}`, `…/del/{uuid}` | WireGuard VPN |
| `GET /api/minnosh/geo/status` | GeoIP veritabanı durumu, engellenen deneme sayısı |

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
- [ ] Reklam kategorisi + Uygula: **Servisler › Unbound DNS › Engel Listeleri**'nde `Minnosh (managed)` politikası var; `ad.ae.doubleclick.net` 0.0.0.0 dönüyor. (hagezi NORMAL listesi kırılmaları önlemek için `doubleclick.net`'in kendisini engellemez.)
- [ ] TikTok + Uygula: `tiktok.com` engelleniyor. Daha önce sorgulanmış alan adları için engel **1-2 dakika** içinde devreye girer (Unbound'un engel modülü listeyi dakikada bir yeniden okur; ardından DNS önbelleği temizlenir).
- [ ] DNS'i zorla + Uygula: istemci `dig @8.8.8.8 tiktok.com` yapsa bile cevap OPNsense'ten geliyor (0.0.0.0).
- [ ] Genel bakış: WAN hızı ve grafik birkaç saniyede bir güncelleniyor; engellenen istek sayısı artıyor.
- [ ] Dil TR/EN geçişi tüm metinleri değiştiriyor.

### Sorun giderme
- Sayfa açılmıyor veya menü görünmüyor: `rm -f /tmp/opnsense_menu_cache.xml /tmp/opnsense_acl_cache.json`
- API hataları: **Sistem › Günlük Dosyaları › Web GUI**, `/var/log/configd/latest.log`
- Üretilen kurallar: `pfctl -sr | grep -i minnosh` ve `grep -i minnosh /tmp/rules.debug` (pfctl DNS portunu "domain" diye gösterir)
- OPNsense'te root'un kabuğu `csh`'dir; SSH ile `sh` komutları çalıştırırken `ssh root@firewall /bin/sh -s <<'EOF' ... EOF` kullanın.
- Test ağı WAN'ı ev ağının içindeyse (ör. 192.168.1.0/24), yönetim kuralında **reply-to'yu kapatın**; yoksa yanıtlar modem üzerinden döner ve SSH/GUI bağlantıları kopar.

## Bilinen sınırlar ve test edilmeyenler (0.2)

- **Gerçek cihazla test edilmedi:** PPPoE (test ortamında PPPoE sunucusu yok), WireGuard el sıkışması (telefonla), UPnP. Yapılandırma üretimi, arayüz ve kurallar doğrulandı.
- Port atamaları şimdilik görüntülenir; internet portu WAN ayarından, ağ portu ağ eklerken seçilir. Mevcut bir ağın portunu değiştirmek OPNsense menülerinden yapılır.
- Uygulama engelleme DNS tabanlıdır; "VPN, proxy ve şifreli DNS" kategorisi ile "DNS'i zorla" birlikte açılmalıdır.
- Engel listesi yenilemesi ağır bir iştir (büyük listelerde ~1 GB bellek); Minnosh aynı anda yalnızca birini çalıştırır, yeni istekler sıraya girer.
- Ülke verisi OPNsense'te başka bir GeoIP kaynağı (MaxMind, ipinfo) ayarlıysa o kullanılır; Minnosh DB-IP verisini yalnızca kaynak ayarlı değilken yazar.
- "Bağlantı" sütunu o anki pf durum sayısıdır, trafik miktarı değildir.

## Yeni dil eklemek

1. `www/js/minnosh/i18n/en.js` dosyasını kopyalayın (ör. `de.js`). `window.MinnoshI18n.de = {...}` olarak değiştirip metinleri çevirin.
2. `index.volt` içine bir `<script>` satırı ekleyin.
3. `Minnosh.xml` içindeki `language` seçeneklerine `<de>Deutsch</de>` ekleyin.

## Paket olarak derleme

`os-minnosh` klasörünü bir FreeBSD/OPNsense derleme ortamındaki `opnsense/plugins` deposuna (ör. `security/minnosh`) kopyalayın. Ardından o klasörde `make package` çalıştırın.

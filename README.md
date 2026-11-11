# Inversa Panel — OPNsense için kolay yönetim eklentisi

En sık kullanılan OPNsense ayarlarını menülerde aramak yerine tek ekrandan yönetmek için bir eklenti.
Hedef sürüm: **OPNsense 26.7** (26.7.8 üzerinde geliştiriliyor).

Tasarım taslağı: https://claude.ai/artifact/9HQfR7v4fu2ouPT9Xh73qN

## Bellek gereksinimi

**DNS engelleme kullanılacaksa en az 8 GB RAM önerilir; 4 GB yetmez.**

Engelleme, OPNsense'in kendi DNS sunucusu Unbound üzerinden çalışır ve Unbound engel listelerinin tamamını bellekte tutar. Bellek ihtiyacını Inversa Panel değil, açılan kategorilerin listeleri belirler:

- "Reklam ve izleyiciler", "Zararlı yazılım ve oltalama" ve "Kumar ve bahis" birlikte açıkken (yaklaşık 2,2 milyon alan adı) Unbound tek başına **1,6 GB** kullanır. En büyük pay "Zararlı yazılım ve oltalama" listesindedir (yaklaşık 1,5 milyon alan adı).
- Listeler yenilenirken buna geçici olarak **yaklaşık 1 GB** daha eklenir.
- Takas alanı olmayan 4 GB'lık bir test kurulumunda yenileme, Unbound'un yeniden başlamasıyla çakıştığında bellek tükendi: bir seferinde Unbound durdu (DNS kesildi), bir seferinde güvenlik duvarı tamamen yanıt vermez oldu.

Engelleme kategorileri kapalıyken eklentinin kayda değer bir bellek ihtiyacı yoktur.

## Sürüm 0.2'de neler var

| Sekme | Ne yapıyor | OPNsense'te nereye yazıyor |
|---|---|---|
| Genel bakış | Koruma durumu, çevrimiçi cihazlar, WAN hızı ve grafik, engellenen DNS istekleri, en aktif cihazlar, hızlı koruma anahtarları, ilk açılışta karşılama kartı | Sadece okur |
| Cihazlar | Cihaz listesi, ad/tür verme, tek tıkla internet kesme, sabit IP (DHCP rezervasyonu); **yeni cihaz onayı**: onay isteyen ağlarda bekleyen cihazlar listenin başında, "Onayla" düğmesiyle | `inversapanel_blocked` MAC takma adı + otomatik engel kuralı; sabit IP'ler Dnsmasq › Hosts kaydı olarak; onaylı cihazlar `inversapanel_approved` MAC takma adında (yalnızca bir ağ onay isterken vardır) |
| Ağ ve İnternet | WAN: DHCP / PPPoE (VLAN etiketli) / sabit IP, IPv6, port; yerel ağ ekleme (VLAN veya ayrı port), adres, DHCP sunucusu aç/kapat, DHCP aralığı ve kira süresi (ağ eklerken de); ağ başına **"yeni cihazlar onay beklesin"**; üç durumlu ağlar arası erişim tablosu; port görünümü | Arayüzler, VLAN'lar, PPPoE, ağ geçidi, dnsmasq DHCP aralıkları (OPNsense kurulum sihirbazıyla aynı yöntem); erişim kuralları otomatik kural olarak |
| Engelleme | Kategoriler, 12 uygulama, izin/engel listeleri, güvenli arama, DNS zorlama | Unbound politikası `Inversa Panel (managed)`, otomatik rdr kuralı |
| Zamanlama | Gün/saat aralığında cihazın internetini kesme veya uygulama engelleme; her dakika değerlendirilir | pf tablosu `inversapanel_sched`, zamanlama başına Unbound politikası `Inversa Panel schedule: …` |
| Port yönlendirme | Hazır servisler, hedef cihaz seçimi, aç/kapat, sil; UPnP durumu | Güvenlik Duvarı › NAT › Port Forward kuralları (izin kuralı otomatik) |
| VPN | Birden çok WireGuard bağlantısı, her biri kendi UDP portunda: **uzaktan erişim** (cihaz başına QR kodu + `.conf`, istendiği zaman tekrar alınabilir; tüm trafik / yalnızca seçili iç ağlar; hiç iç ağ seçilmezse **yalnızca internet**: cihaz sadece buranın internet IP'siyle dışarı çıkar, iç ağlara ve firewall'a erişemez) ve **siteden siteye** (seçili yerel ağlar ⇄ karşı ağlar; karşı tarafın anahtarı yoksa Inversa Panel üretip hazır yapılandırma verir). Her bağlantının erişebileceği iç ağlar ve VPN IP bloğu (ör. 10.70.0.0/24, çakışma denetimli; değişince cihazlar yeniden numaralanır) ayrı seçilir. | Bağlantı başına bir WireGuard örneği (`inversapanel-…`) + peer'lar; WAN izni, seçili ağlara izin (tam modda diğer iç ağlara engel), NAT otomatik kural olarak |
| Misafir ağı | Misafir türündeki ağları izole etme, hız sınırı, bağlı misafirler | Erişim tablosu + Trafik Şekillendirici `Inversa Panel guest …` |
| Ülke engelleme | Ülke seçimi, yalnız gelen / gelen ve giden, engellenen deneme sayısı. Ülke verisi kayıt gerektirmeden **DB-IP Lite**'tan (CC BY 4.0) alınır, ayda bir yenilenir; isteyen kendi MaxMind anahtarını kullanabilir | GeoIP takma adı `inversapanel_geo` + otomatik kural; OPNsense'te kaynak ayarlı değilse ülke dosyaları `/usr/local/share/GeoIP/alias` altına yazılır |
| Ayarlar | Dil, korunan ağlar, engel yanıtı, DNS istatistikleri, **Inversa Panel'in eklediklerini kaldır** | `OPNsense/InversaPanel` modeli |

**Çalışma şekli**
- Ayarlar önce taslakta tutulur; başlıktaki çubukta sayılır, **Değişiklikleri göster** ile tek tek görülüp geri alınabilir, **Uygula** ile tek seferde yazılır.
- Port yönlendirme ve VPN cihazı ekleme/silme anında geçerli olur (OPNsense'teki gibi).
- **Ağ değişiklikleri** (WAN, ağ ekleme/silme, adres) kendi düğmesiyle uygulanır ve **geri alma korumalıdır**: değişiklikten önce yapılandırmanın yedeği alınır; 90 saniye içinde "Çalışıyor, kalıcı yap" ile onaylanmazsa OPNsense eski yapılandırmayı kendi kendine geri yükler.

## Mevcut (önceden yapılandırılmış) OPNsense'e kurulum

Inversa Panel mevcut ayarları okur ve yalnızca kullanıcının Inversa Panel'den değiştirdiği şeye dokunur:
- İlk açılışta hiçbir koruma kendiliğinden açılmaz; panelde "Önerilen korumaları aç" kartı çıkar.
- Erişim tablosundaki her hücre varsayılan olarak **"OPNsense"** durumundadır: mevcut güvenlik duvarı kuralları geçerlidir. Kural yalnızca kullanıcı bir hücreyi İzinli/Engelli yaptığında eklenir.
- Inversa Panel'in anlayamadığı yapılar (çoklu WAN, LAGG/bridge üyesi ağlar, takma ad kullanan port yönlendirmeleri…) **salt okunur** gösterilir.
- Inversa Panel yalnızca kendi oluşturduğu ağları silebilir. Her VPN bağlantısı için boş bir port ve çakışmayan bir tünel ağı seçer (0.2'deki tek `inversapanel` örneği ilk açılışta bağlantı olarak devralınır); varsa GeoIP adresinin üzerine yazmaz.
- Eklediği her kayıt "Inversa Panel" etiketi taşır. **Ayarlar › Inversa Panel'in eklediklerini kaldır**, yalnızca bu kayıtları siler ve Inversa Panel'i kapatır. Port yönlendirmeleri, ağlar ve VPN cihazları kullanıcının bilinçli oluşturduğu şeyler olduğu için kalır.
- Otomatik güvenlik duvarı kuralları config.xml'e yazılmaz; eklenti kaldırılınca kendiliğinden kaybolur.

## Klasör yapısı

```
os-inversa-panel/                       opnsense/plugins deposundaki bir eklenti klasörüyle aynı yapı
  Makefile, pkg-descr
  src/etc/inc/plugins.inc.d/inversapanel.inc        otomatik güvenlik duvarı kuralları (inversapanel_firewall)
  src/opnsense/mvc/app/models/OPNsense/InversaPanel model (InversaPanel.xml), menü, ACL
  src/opnsense/mvc/app/library/OPNsense/InversaPanel Catalog, Integration (Uygula), Network, Rollback, PortForward, Vpn, Extras (GeoIP, hız sınırı)
  src/opnsense/mvc/app/controllers/OPNsense/InversaPanel  sayfa + API (state, devices, dashboard, service, network, portforward, vpn, geo)
  src/opnsense/mvc/app/views/OPNsense/InversaPanel  index.volt
  src/opnsense/www/js/inversapanel/app.js           çekirdek: durum, taslak, değişiklik listesi, sekme altyapısı
  src/opnsense/www/js/inversapanel/views/*.js       net, sched, pf, vpn, guest, geo sekmeleri
  src/opnsense/www/js/inversapanel/i18n/{tr,en}.js  dil dosyaları
  src/opnsense/www/css/inversapanel/inversapanel.css
  src/opnsense/scripts/OPNsense/InversaPanel        hosts.py, killstates.py, dnsbl.sh, schedule.php (her dakika), rollback.php, nettest.py, geoip_dbip.py
  src/opnsense/service/conf/actions.d/actions_inversapanel.conf
tools/deploy.sh, tools/remove.sh             test cihazına kopyalama / kaldırma
```

### API

| Uç nokta | Açıklama |
|---|---|
| `GET /api/inversapanel/state/get` | Tüm Inversa Panel ayarları ve seçenekler |
| `GET /api/inversapanel/devices/list` | Görülen cihazlar ve kayıtlı cihazlar |
| `GET /api/inversapanel/dashboard/traffic` | WAN bayt sayaçları (hız tarayıcıda hesaplanır) |
| `GET /api/inversapanel/dashboard/dns` | DNS toplamları, en çok engellenenler |
| `POST /api/inversapanel/service/apply` | Taslağı kaydet ve uygula (tam yönetici yetkisi gerekir) |
| `POST /api/inversapanel/service/language` | Arayüz dilini hemen kaydet |
| `POST /api/inversapanel/service/cleanup` | Inversa Panel'in eklediklerini kaldır, Inversa Panel'i kapat |
| `GET /api/inversapanel/network/get`, `POST …/apply`, `POST …/confirm`, `GET …/test` | Ağ durumu, geri alma korumalı değişiklik, onay, bağlantı testi |
| `GET /api/inversapanel/portforward/list`, `POST …/add`, `…/toggle/{uuid}`, `…/del/{uuid}` | Port yönlendirme |
| `GET /api/inversapanel/vpn/status`, `POST …/create`, `…/update/{uuid}`, `…/delete/{uuid}`, `…/peeradd/{conn}`, `GET …/peerconfig/{conn}/{peer}`, `POST …/peerrenew/{conn}/{peer}`, `…/peertoggle/{conn}/{peer}`, `…/peerdel/{conn}/{peer}` | WireGuard VPN bağlantıları ve cihazları |
| `GET /api/inversapanel/geo/status` | GeoIP veritabanı durumu, engellenen deneme sayısı |

## Proxmox'ta test

1. Proxmox'ta bir OPNsense 26.7 sanal makinesi kurun. En az iki ağ kartı olsun: WAN ve LAN.
2. LAN tarafına bir test istemcisi (sanal makine veya konteyner) bağlayın.
3. OPNsense'te **Sistem › Ayarlar › Yönetim** altında SSH'ı açın ve root ile anahtar girişine izin verin.
4. Önerilen: **Arayüzler › Komşular › Keşif Ayarları**'ndan host keşfini (Hostwatch) açın. Kapalıysa cihaz listesi ARP tablosundan alınır.
5. Buradan kurulum yapın:
   ```sh
   tools/deploy.sh root@<opnsense-ip>
   ```
6. Tarayıcıda `https://<opnsense-ip>/ui/inversapanel` adresini açın (menüde **Inversa › Genel bakış**).

### Kontrol listesi
- [ ] Cihazlar sekmesinde test istemcisi görünüyor.
- [ ] İnterneti kes + Uygula: istemci internete çıkamıyor, OPNsense'e (DNS, arayüz) erişebiliyor. **Güvenlik Duvarı › Takma Adlar**'da `inversapanel_blocked` içinde istemcinin MAC adresi var.
- [ ] Reklam kategorisi + Uygula: **Servisler › Unbound DNS › Engel Listeleri**'nde `Inversa Panel (managed)` politikası var; `ad.ae.doubleclick.net` 0.0.0.0 dönüyor. (hagezi NORMAL listesi kırılmaları önlemek için `doubleclick.net`'in kendisini engellemez.)
- [ ] TikTok + Uygula: `tiktok.com` engelleniyor. Daha önce sorgulanmış alan adları için engel **1-2 dakika** içinde devreye girer (Unbound'un engel modülü listeyi dakikada bir yeniden okur; ardından DNS önbelleği temizlenir).
- [ ] DNS'i zorla + Uygula: istemci `dig @8.8.8.8 tiktok.com` yapsa bile cevap OPNsense'ten geliyor (0.0.0.0).
- [ ] Genel bakış: WAN hızı ve grafik birkaç saniyede bir güncelleniyor; engellenen istek sayısı artıyor.
- [ ] Dil TR/EN geçişi tüm metinleri değiştiriyor.

### Sorun giderme
- Sayfa açılmıyor veya menü görünmüyor: `rm -f /tmp/opnsense_menu_cache.xml /tmp/opnsense_acl_cache.json`
- API hataları: **Sistem › Günlük Dosyaları › Web GUI**, `/var/log/configd/latest.log`
- Üretilen kurallar: `pfctl -sr | grep -i inversapanel` ve `grep -i inversapanel /tmp/rules.debug` (pfctl DNS portunu "domain" diye gösterir)
- OPNsense'te root'un kabuğu `csh`'dir; SSH ile `sh` komutları çalıştırırken `ssh root@firewall /bin/sh -s <<'EOF' ... EOF` kullanın.
- Test ağı WAN'ı ev ağının içindeyse (ör. 192.168.1.0/24), yönetim kuralında **reply-to'yu kapatın**; yoksa yanıtlar modem üzerinden döner ve SSH/GUI bağlantıları kopar.

## Bilinen sınırlar ve test edilmeyenler (0.2)

- **Gerçek cihazla test edilmedi:** PPPoE (test ortamında PPPoE sunucusu yok), WireGuard el sıkışması (telefonla), UPnP. Yapılandırma üretimi, arayüz ve kurallar doğrulandı.
- Port atamaları şimdilik görüntülenir; internet portu WAN ayarından, ağ portu ağ eklerken seçilir. Mevcut bir ağın portunu değiştirmek OPNsense menülerinden yapılır.
- Uygulama engelleme DNS tabanlıdır; "VPN, proxy ve şifreli DNS" kategorisi ile "DNS'i zorla" birlikte açılmalıdır.
- Engel listesi yenilemesi ağır bir iştir (büyük listelerde ~1 GB bellek, Unbound'un kendi kullanımına ek olarak; bkz. [Bellek gereksinimi](#bellek-gereksinimi)); Inversa Panel aynı anda yalnızca birini çalıştırır, yeni istekler sıraya girer.
- Ülke verisi OPNsense'te başka bir GeoIP kaynağı (MaxMind, ipinfo) ayarlıysa o kullanılır; Inversa Panel DB-IP verisini yalnızca kaynak ayarlı değilken yazar.
- "Bağlantı" sütunu o anki pf durum sayısıdır, trafik miktarı değildir.
- **Yeni cihaz onayı** güvenlik duvarında uygulanır: onaysız cihaz internete ve diğer ağlara çıkamaz, yalnızca güvenlik duvarının kendisine (DHCP, DNS, yönetim arayüzü) erişir. Aynı anahtara (switch) ya da Wi-Fi'ye bağlı cihazların birbirine doğrudan erişimi güvenlik duvarından geçmediği için engellenemez (erişim noktasında istemci yalıtımı veya 802.1X gerekir). Onay MAC adresine göredir (MAC taklit edilebilir); adresler OPNsense'in MAC takma adı mekanizmasıyla dakikada bir yenilenir, bu yüzden onaylı bir cihaz yeni bir IP aldığında erişimi en geç bir dakika içinde açılır. Onay ilk açıldığında o ana kadar görülen cihazlar onaylı sayılır.

## Yeni dil eklemek

1. `www/js/inversapanel/i18n/en.js` dosyasını kopyalayın (ör. `de.js`). `window.InversaPanelI18n.de = {...}` olarak değiştirip metinleri çevirin.
2. `index.volt` içine bir `<script>` satırı ekleyin.
3. `InversaPanel.xml` içindeki `language` seçeneklerine `<de>Deutsch</de>` ekleyin.

## Paket olarak derleme

`os-inversa-panel` klasörünü bir FreeBSD/OPNsense derleme ortamındaki `opnsense/plugins` deposuna (ör. `security/inversa-panel`) kopyalayın. Ardından o klasörde `make package` çalıştırın.

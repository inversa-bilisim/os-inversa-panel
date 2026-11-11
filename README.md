# Inversa Panel — OPNsense için kolay yönetim eklentisi

En sık kullanılan OPNsense ayarlarını menülerde aramak yerine tek ekrandan yönetmek için bir eklenti.
Hedef sürüm: **OPNsense 26.7** (26.7.8 üzerinde geliştiriliyor).

Tasarım taslağı: https://claude.ai/artifact/9HQfR7v4fu2ouPT9Xh73qN

## Bellek gereksinimi

**DNS engelleme veya saldırı önleme kullanılacaksa en az 8 GB RAM önerilir; 4 GB yetmez.**

Engelleme, OPNsense'in kendi DNS sunucusu Unbound üzerinden çalışır ve Unbound engel listelerinin tamamını bellekte tutar. Bellek ihtiyacını Inversa Panel değil, açılan kategorilerin listeleri belirler:

- "Reklam ve izleyiciler", "Zararlı yazılım ve oltalama" ve "Kumar ve bahis" birlikte açıkken (yaklaşık 2,2 milyon alan adı) Unbound tek başına **1,6 GB** kullanır. En büyük pay "Zararlı yazılım ve oltalama" listesindedir (yaklaşık 1,5 milyon alan adı).
- Listeler yenilenirken buna geçici olarak **yaklaşık 1 GB** daha eklenir.
- Takas alanı olmayan 4 GB'lık bir test kurulumunda yenileme, Unbound'un yeniden başlamasıyla çakıştığında bellek tükendi: bir seferinde Unbound durdu (DNS kesildi), bir seferinde güvenlik duvarı tamamen yanıt vermez oldu.

**Saldırı önleme (Suricata)** de bellek ister, ne kadar isteyeceğini desen eşleyici belirler. Dört varsayılan grupla (yaklaşık 41 bin kural) ölçülen:

- Hyperscan ile **450 MB**. İşlemci destekliyorsa (SSSE3; son 15 yılın bütün işlemcileri) Inversa Panel bunu kendisi seçer.
- OPNsense'in varsayılan eşleyicisiyle (Aho-Corasick) **3,5 GB**. 4 GB'lık test kurulumu bu ayarla, DNS engelleme de açıkken kilitlendi.
- Kurallar her gece yenilenirken yeni kurallar eskilerin yanında kurulur; bellek kısa süre artar.

Inversa Panel, Suricata'yı başlatmadan önce boş belleğe bakar (Hyperscan ile 1 GB, onsuz 4,5 GB); yetmiyorsa başlatmaz ve bunu ekranda söyler. Engel listesi yenilemesi ile Suricata'nın başlaması aynı anda çalıştırılmaz.

DNS engelleme ve saldırı önleme kapalıyken eklentinin kayda değer bir bellek ihtiyacı yoktur.

## Sürüm 0.2'de neler var

Üst menüde altı başlık var; birden çok sayfası olan başlıklar sayfalarını alt sekme olarak gösterir. OPNsense'in yan menüsünde (**Inversa**) aynı altı başlık bulunur.

| Başlık › sayfa | Ne yapıyor | OPNsense'te nereye yazıyor |
|---|---|---|
| Genel bakış | Koruma durumu ve ilgi bekleyen konular, her korumanın tek satırlık durumu, hızlı koruma anahtarları; çevrimiçi cihazlar, bugün engellenen DNS istekleri ve saldırı uyarıları, WAN hızı ve grafik, bugünkü veri kullanımı; internet bağlantısı, yerel ağlar, en aktif cihazlar, VPN bağlantıları, son olaylar, sistem durumu; ilk açılışta karşılama kartı | Sadece okur; günlük veri kullanımı ve olaylar için dakikada bir `/var/db/inversapanel` altına not alır |
| Ağ ve İnternet › İnternet bağlantısı | Üç sütun: bağlantı türü (PPPoE / sabit IP / modem arkasında), seçilen türün ayarları (VLAN etiketi, IPv6, port; **Gelişmiş**: MAC adresi, MTU) ve **o anki bağlantı durumu** (port, IP, ağ geçidi, DNS, IPv6, kendiliğinden çalışan bağlantı testi, istenince dış IP) | Arayüzler (`spoofmac`, `mtu` dahil), VLAN'lar, PPPoE, ağ geçidi (OPNsense kurulum sihirbazıyla aynı yöntem) |
| Ağ ve İnternet › Yerel ağlar | Ağ kartları (renk, bağlı cihaz sayısı, izolasyon, hız sınırı) ve tek bir ağ formu: ad, renk, bağlantı (VLAN veya ayrı port), adres, DHCP (aralıkta yalnızca son kısım yazılır), **diğer ağlardan izole et** (yine de karşılıklı konuşacağı ağlar seçilir), **ağ başına hız sınırı**, **"yeni cihazlar onay beklesin"**. Formdaki her şey tek "Kaydet" ile, geri alma korumalı uygulanır. Altında üç durumlu ağlar arası erişim tablosu (tek yönlü ince ayar için) | Arayüzler (ad = arayüz açıklaması), VLAN'lar, dnsmasq DHCP aralıkları; erişim kuralları otomatik kural olarak; hız sınırı Trafik Şekillendirici `Inversa Panel guest …`; renk ve izolasyon `OPNsense/InversaPanel` modelinde |
| Ağ ve İnternet › Fiziksel portlar | Ağ portlarının ne için kullanıldığı (yalnızca görünüm) | Sadece okur |
| Ağ ve İnternet › DNS | **Yerel alan adı kayıtları**: bir alan adını iç ağdaki bir adrese yönlendirme (ör. `nas.ev.lan` → `192.168.1.20`), isteğe bağlı alt alan adlarıyla birlikte; OPNsense'te oluşturulmuş kayıtlar salt okunur listelenir. **DNS sunucuları**: otomatik (OPNsense'in kendi ayarı), Cloudflare, Google, Quad9 veya özel adresler; isteğe bağlı şifreli DNS (DNS over TLS). Sunucular uygulanmadan önce denenir, yanıt vermeyen seçim uygulanmaz | Unbound host geçersiz kılmaları ve sorgu yönlendirme / DNS over TLS kayıtları, açıklaması `Inversa Panel (managed)`; seçim `OPNsense/InversaPanel` modelinde |
| Ağ ve İnternet › Port yönlendirme | Tek satırda yeni yönlendirme: dış port kutusu yaygın portları önerir ve ad, iç port ve protokolü doldurur; hedef cihaz adıyla ya da IP ile seçilir. Yönlendirmeler tablo halinde: aç/kapat, sil; UPnP durumu | Güvenlik Duvarı › NAT › Port Forward kuralları (izin kuralı otomatik) |
| VPN | **IPsec ile siteden siteye** (başka marka güvenlik duvarlarıyla: IKEv2, ortak anahtar, AES-256 / SHA-256 / DH grup 14; seçili yerel ağlar ⇄ karşı ağlar, bağlantı durumu ve karşı cihaza girilecek değerlerin tam listesi) ve birden çok WireGuard bağlantısı, her biri kendi UDP portunda: **uzaktan erişim** (cihaz başına QR kodu + `.conf`, istendiği zaman tekrar alınabilir; tüm trafik / yalnızca seçili iç ağlar; hiç iç ağ seçilmezse **yalnızca internet**: cihaz sadece buranın internet IP'siyle dışarı çıkar, iç ağlara ve firewall'a erişemez) ve **siteden siteye** (seçili yerel ağlar ⇄ karşı ağlar; karşı tarafın anahtarı yoksa Inversa Panel üretip hazır yapılandırma verir). Her bağlantının erişebileceği iç ağlar ve VPN IP bloğu (ör. 10.70.0.0/24, çakışma denetimli; değişince cihazlar yeniden numaralanır) ayrı seçilir. | IPsec: VPN › IPsec › Bağlantılar altında bir bağlantı (`inversapanel-…`) + ağ çifti başına bir alt bağlantı + ortak anahtar; WAN'da UDP 500/4500 ve ESP izni, tünelden (enc0) seçili ağlara izin. WireGuard: bağlantı başına bir örnek (`inversapanel-…`) + peer'lar; WAN izni, seçili ağlara izin (tam modda diğer iç ağlara engel), NAT otomatik kural olarak |
| Cihazlar › Cihazlar | Cihaz listesi (her cihazın **hangi ağda** olduğu sütunuyla; ağa göre sıralanır, aranır), ad/tür verme, tek tıkla internet kesme, sabit IP (DHCP rezervasyonu); **yeni cihaz onayı**: onay isteyen ağlarda bekleyen cihazlar listenin başında, "Onayla" düğmesiyle | `inversapanel_blocked` MAC takma adı + otomatik engel kuralı; sabit IP'ler Dnsmasq › Hosts kaydı olarak; onaylı cihazlar `inversapanel_approved` MAC takma adında (yalnızca bir ağ onay isterken vardır) |
| Cihazlar › Zamanlama | Gün/saat aralığında cihazın internetini kesme veya uygulama engelleme; her dakika değerlendirilir | pf tablosu `inversapanel_sched`, zamanlama başına Unbound politikası `Inversa Panel schedule: …` |
| Güvenlik › Kategoriler ve uygulamalar | Kategoriler, 12 uygulama, güvenli arama, DNS zorlama | Unbound politikası `Inversa Panel (managed)`, otomatik rdr kuralı |
| Güvenlik › Beyaz / kara liste | Her zaman izin verilen ve her zaman engellenen alan adları | Aynı Unbound politikası (izin listesi / joker alan adları) |
| Güvenlik › Ülkeler | İki mod: **seçilen ülkeleri engelle** (yalnız gelen / gelen ve giden) veya **yalnızca seçilen ülkelere izin ver** (ör. yalnızca Türkiye ve Azerbaycan; yalnızca gelen bağlantıları kısıtlar, içeriden çıkış etkilenmez). Her modun ülke listesi ayrı tutulur. **VPN bağlantıları muaf** seçeneği (varsayılan kapalı), engellenen deneme sayısı. Ülke verisi kayıt gerektirmeden **DB-IP Lite**'tan (CC BY 4.0) alınır, ayda bir yenilenir; isteyen kendi MaxMind anahtarını kullanabilir | GeoIP takma adı `inversapanel_geo` + otomatik kural; izin modunda ayrıca `inversapanel_geo_allow` (seçilen ülkeler + hiçbir ülkeye ait olmayan özel/yerel adres aralıkları); OPNsense'te kaynak ayarlı değilse ülke dosyaları `/usr/local/share/GeoIP/alias` altına yazılır |
| Güvenlik › Saldırı önleme | Suricata ile korunan ağlardaki trafiği bilinen saldırı ve zararlı yazılım izlerine karşı denetler: **yalnızca uyar** veya **engelle**; beş grup (zararlı yazılım ve komuta sunucuları, bilinen saldırgan adresler, açık istismarı, oltalama, tarama); son uyarılar cihaz adıyla listelenir | OPNsense'in Saldırı Tespiti ayarları (Servisler › Saldırı Tespiti): seçilen kural setleri, engelleme için `Inversa Panel (managed)` politikası, gecelik kural güncelleme görevi |
| Ayarlar | Dil, korunan ağlar, engel yanıtı, DNS istatistikleri, **Inversa Panel'in eklediklerini kaldır** | `OPNsense/InversaPanel` modeli |

**Çalışma şekli**
- Ayarlar önce taslakta tutulur; başlıktaki çubukta sayılır, **Değişiklikleri göster** ile tek tek görülüp geri alınabilir, **Uygula** ile tek seferde yazılır.
- Port yönlendirme ve VPN cihazı ekleme/silme anında geçerli olur (OPNsense'teki gibi).
- **Ağ değişiklikleri** (WAN, ağ ekleme/silme, adres) kendi düğmesiyle uygulanır ve **geri alma korumalıdır**: değişiklikten önce yapılandırmanın yedeği alınır; 90 saniye içinde "Çalışıyor, kalıcı yap" ile onaylanmazsa OPNsense eski yapılandırmayı kendi kendine geri yükler.
- Aynı koruma, **Uygula** ile yazılan iki riskli değişiklikte de devreye girer: "yalnızca seçilen ülkelere izin ver" kısıtının sıkılaşması (açılması, listeden ülke çıkarılması, VPN muafiyetinin kapatılması) ve DNS sunucularının değiştirilmesi. Onay şeridi hangi sayfada olursanız olun görünür; onay beklenirken yeni bir "Uygula" kabul edilmez. Geri yüklemede o "Uygula" ile yazılan her şey geri alınır.

## Mevcut (önceden yapılandırılmış) OPNsense'e kurulum

Inversa Panel mevcut ayarları okur ve yalnızca kullanıcının Inversa Panel'den değiştirdiği şeye dokunur:
- İlk açılışta hiçbir koruma kendiliğinden açılmaz; panelde "Önerilen korumaları aç" kartı çıkar.
- Erişim tablosundaki her hücre varsayılan olarak **"OPNsense"** durumundadır: mevcut güvenlik duvarı kuralları geçerlidir. Kural yalnızca kullanıcı bir hücreyi İzinli/Engelli yaptığında eklenir.
- Inversa Panel'in anlayamadığı yapılar (çoklu WAN, LAGG/bridge üyesi ağlar, takma ad kullanan port yönlendirmeleri…) **salt okunur** gösterilir.
- Inversa Panel yalnızca kendi oluşturduğu ağları silebilir. Her VPN bağlantısı için boş bir port ve çakışmayan bir tünel ağı seçer (0.2'deki tek `inversapanel` örneği ilk açılışta bağlantı olarak devralınır); varsa GeoIP adresinin üzerine yazmaz.
- OPNsense'te tüm alan adları için DNS yönlendirme zaten ayarlıysa ("sistem DNS sunucularını kullan" veya kendi yönlendirme / DNS over TLS kayıtlarınız) Inversa Panel DNS sunucusu seçimini sunmaz ve o ayarlara dokunmaz. OPNsense'te oluşturulmuş alan adı geçersiz kılmaları salt okunur gösterilir.
- OPNsense'te saldırı tespiti zaten açıksa Inversa Panel onu yönetmez: ayarlarına dokunmaz, yalnızca durumunu ve uyarılarını gösterir. Yalnızca kendi açtığı saldırı tespitini değiştirir ve kapatır.
- Eklediği her kayıt "Inversa Panel" etiketi taşır. **Ayarlar › Inversa Panel'in eklediklerini kaldır**, yalnızca bu kayıtları siler ve Inversa Panel'i kapatır. Port yönlendirmeleri, ağlar, VPN cihazları ve DNS ayarları (yerel alan adı kayıtları, sunucu seçimi) kullanıcının bilinçli oluşturduğu şeyler olduğu için kalır.
- Otomatik güvenlik duvarı kuralları config.xml'e yazılmaz; eklenti kaldırılınca kendiliğinden kaybolur.

## Klasör yapısı

```
os-inversa-panel/                       opnsense/plugins deposundaki bir eklenti klasörüyle aynı yapı
  Makefile, pkg-descr
  src/etc/inc/plugins.inc.d/inversapanel.inc        otomatik güvenlik duvarı kuralları (inversapanel_firewall)
  src/opnsense/mvc/app/models/OPNsense/InversaPanel model (InversaPanel.xml), menü, ACL
  src/opnsense/mvc/app/library/OPNsense/InversaPanel Catalog, Integration (Uygula), Network, Rollback, PortForward, Vpn (WireGuard), Ipsec (siteden siteye), Ips (Suricata), Dns (yerel adlar, DNS sunucuları), Extras (GeoIP, hız sınırı)
  src/opnsense/mvc/app/controllers/OPNsense/InversaPanel  sayfa + API (state, devices, dashboard, service, network, portforward, vpn, geo, ips)
  src/opnsense/mvc/app/views/OPNsense/InversaPanel  index.volt
  src/opnsense/www/js/inversapanel/app.js           çekirdek: durum, taslak, değişiklik listesi, menü ve alt sayfalar, onay sayacı
  src/opnsense/www/js/inversapanel/views/*.js       net (İnternet bağlantısı, Yerel ağlar, Fiziksel portlar), sched, pf, vpn, geo, ips, dns sayfaları
  src/opnsense/www/js/inversapanel/i18n/{tr,en}.js  dil dosyaları
  src/opnsense/www/css/inversapanel/inversapanel.css
  src/opnsense/scripts/OPNsense/InversaPanel        hosts.py, killstates.py, dnsbl.sh, ips.sh, schedule.php (her dakika), rollback.php, nettest.py, dnscheck.py, geoip_dbip.py
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
| `POST /api/inversapanel/service/apply` | Taslağı kaydet ve uygula (tam yönetici yetkisi gerekir). Yanıtta `confirm` varsa değişiklik o kadar saniye içinde `network/confirm` ile onaylanmalıdır, yoksa geri alınır |
| `POST /api/inversapanel/service/language` | Arayüz dilini hemen kaydet |
| `POST /api/inversapanel/service/cleanup` | Inversa Panel'in eklediklerini kaldır, Inversa Panel'i kapat |
| `GET /api/inversapanel/network/get`, `POST …/apply`, `POST …/confirm`, `GET …/test`, `GET …/extip` | Ağ durumu, geri alma korumalı değişiklik, onay, bağlantı testi |
| `GET /api/inversapanel/portforward/list`, `POST …/add`, `…/toggle/{uuid}`, `…/del/{uuid}` | Port yönlendirme |
| `GET /api/inversapanel/vpn/status`, `POST …/create`, `…/update/{uuid}`, `…/delete/{uuid}`, `…/peeradd/{conn}`, `GET …/peerconfig/{conn}/{peer}`, `POST …/peerrenew/{conn}/{peer}`, `…/peertoggle/{conn}/{peer}`, `…/peerdel/{conn}/{peer}` , `GET …/ipsecconfig/{conn}` | WireGuard VPN bağlantıları ve cihazları; IPsec bağlantısının karşı tarafa girilecek ayarları (ortak anahtar dahil) |
| `GET /api/inversapanel/geo/status` | GeoIP veritabanı durumu, izin verilen ülkeler için veri olup olmadığı, engellenen deneme sayısı |
| `GET /api/inversapanel/ips/status`, `POST …/start` | Suricata durumu, bellek kullanımı, engellemenin bu donanımda mümkün olup olmadığı, son uyarılar; çalışmıyorsa yeniden başlatma |

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
- [ ] Ağ ve İnternet › DNS: `nas.ev.lan` → istemcinin IP'si + Uygula: istemcide `getent hosts nas.ev.lan` o adresi döndürüyor. "Alt alan adları da dahil" ile eklenen `ornek.test` için `www.ornek.test` de aynı adrese gidiyor.
- [ ] DNS sunucusu olarak Quad9 + şifreli DNS + Uygula: onay şeridi çıkıyor; `unbound-control -c /var/unbound/unbound.conf list_forwards` iki Quad9 adresini gösteriyor. Onaylanmazsa 90 saniye sonra liste boşalıyor (otomatik).
- [ ] VPN › Yeni VPN bağlantısı › Siteden siteye › IPsec: karşı adres ve karşı ağ girilip oluşturulunca **VPN › IPsec › Bağlantılar**'da `inversapanel-…` bağlantısı var; "Karşı tarafın ayarları" listesi karşı cihaza girilince durum "Bağlı" oluyor ve iki ağ birbirine ping atabiliyor (`swanctl --list-sas`).
- [ ] Güvenlik › Ülkeler: "Sadece seçtiğim ülkelere izin ver" + TR + Uygula: `pfctl -sr | grep geo_allow` kuralı gösteriyor; `pfctl -t inversapanel_geo_allow -T test 8.8.8.8` eşleşmiyor, bir Türkiye adresi ve `192.168.1.1` eşleşiyor; istemci yabancı sitelere girmeye devam ediyor.

### Sorun giderme
- Sayfa açılmıyor veya menü görünmüyor: `rm -f /tmp/opnsense_menu_cache.xml /tmp/opnsense_acl_cache.json`
- API hataları: **Sistem › Günlük Dosyaları › Web GUI**, `/var/log/configd/latest.log`
- Üretilen kurallar: `pfctl -sr | grep -i inversapanel` ve `grep -i inversapanel /tmp/rules.debug` (pfctl DNS portunu "domain" diye gösterir)
- OPNsense'te root'un kabuğu `csh`'dir; SSH ile `sh` komutları çalıştırırken `ssh root@firewall /bin/sh -s <<'EOF' ... EOF` kullanın.
- Test ağı WAN'ı ev ağının içindeyse (ör. 192.168.1.0/24), yönetim kuralında **reply-to'yu kapatın**; yoksa yanıtlar modem üzerinden döner ve SSH/GUI bağlantıları kopar.

## Bilinen sınırlar ve test edilmeyenler (0.2)

- **IPsec siteden siteye:** yalnızca IKEv2, ortak anahtar ve IPv4; şifreleme seti sabittir (AES-256, SHA-256, DH 14) ve arayüzden değiştirilemez. Her ağ çifti ayrı bir alt bağlantıdır. Bu tarafın kimliği "Bu tarafın adresi" alanı (boşsa oluşturma anındaki WAN adresi), karşı tarafın kimliği girilen adresidir; karşı cihaz kendi kimliği olarak başka bir değer gönderiyorsa orada bu değerler ayarlanmalıdır. Şubeler arası geçiş (A şubesinin B şubesine merkez üzerinden ulaşması) yoktur. OPNsense'te elle kurulmuş IPsec tünelleri yalnızca adlarıyla listelenir. İki OPNsense 26.7.8 arasında denendi (tünel kuruldu, iki yönde trafik geçti, kapat/aç/sil); **başka marka cihazlarla (FortiGate, MikroTik, Sophos, Zyxel…) denenmedi**. Modem arkasındaki (NAT) kurulum da denenmedi.
- **Ağ türleri kalktı (önceki sürümlerde: Ev, IoT, Misafir, Kamera, Sunucu).** Her ağın bir rengi vardır; eski tür renge çevrilir, misafir ağlarının ortak hız sınırı o ağların kendi sınırı olur, bütün ağlardan kapatılmış ağ "izole" sayılır. Bu taşıma panel ilk açıldığında bir kez yapılır. İzolasyon çift yönlüdür (seçilen ağla karşılıklı erişim); tek yönlü kural erişim tablosundan verilir. Yeni ağ izole kurulur. Hız sınırı ağın tamamı içindir, cihaz başına değildir.
- **Dış IP** yalnızca düğmeye basılınca sorulur: güvenlik duvarı `https://1.1.1.1/cdn-cgi/trace` adresine (Cloudflare) bağlanır. **MAC adresi** değişikliği test edilmedi (test kutusunun adresini değiştirirdi); MTU ayarlama ve temizleme denendi. PPPoE üzerinden IPv6 ve PPPoE bağlantı süresi gösterimi yok/denenmedi.
- **Gerçek cihazla test edilmedi:** PPPoE (test ortamında PPPoE sunucusu yok), WireGuard el sıkışması (telefonla), UPnP. Yapılandırma üretimi, arayüz ve kurallar doğrulandı.
- Port atamaları şimdilik görüntülenir; internet portu WAN ayarından, ağ portu ağ eklerken seçilir. Mevcut bir ağın portunu değiştirmek OPNsense menülerinden yapılır.
- Uygulama engelleme DNS tabanlıdır; "VPN, proxy ve şifreli DNS" kategorisi ile "DNS'i zorla" birlikte açılmalıdır.
- Engel listesi yenilemesi ağır bir iştir (büyük listelerde ~1 GB bellek, Unbound'un kendi kullanımına ek olarak; bkz. [Bellek gereksinimi](#bellek-gereksinimi)); Inversa Panel aynı anda yalnızca birini çalıştırır, yeni istekler sıraya girer.
- Engel listeleri yalnızca DNS engelleme ayarları değiştiğinde yenilenir; başka bir ayar için "Uygula"ya basmak yenileme başlatmaz.
- **Saldırı önleme:** Suricata korunan (iç) ağlarda dinler, internet tarafında değil: uyarılar hangi cihazın tetiklediğini gösterir ve yalnızca güvenlik duvarından geçen trafik denetlenir. Şifreli (HTTPS) trafiğin içeriği görülmez. Engelleme modu OPNsense'in netmap (IPS) modudur: birleştirilmiş port (LAGG), köprü ve sanal arayüzlerde ya da donanım hızlandırmaları (CRC, TSO, LRO) açıkken sunulmaz. Uyarı ve engelleme etiketsiz bir LAN üzerinde sanal ağ kartıyla (vtnet) denendi; **VLAN üzerindeki trafikte ve gerçek ağ kartlarında engelleme test edilmedi**. Engelleme açıkken Suricata yeniden başlatılırsa (ayar değişikliği) denetlenen ağ kartı kısa süre kesilir.
- Ülke verisi OPNsense'te başka bir GeoIP kaynağı (MaxMind, ipinfo) ayarlıysa o kullanılır; Inversa Panel DB-IP verisini yalnızca kaynak ayarlı değilken yazar.
- **"Yalnızca seçilen ülkelere izin ver"** yalnızca internetten gelen bağlantıları (port yönlendirme, VPN, dışarıdan yönetim) kısıtlar. Ülke verisi inene kadar ve izin verilen hiçbir ülke için adres verisi yokken kısıt **uygulanmaz** (aksi halde internetin tamamı dışarıda kalırdı); sayfa bunu söyler. Özel ağ aralıkları (10/8, 172.16/12, 192.168/16), taşıyıcı NAT (100.64/10), bağlantı-yerel ve çoklu yayın adresleri her zaman izinlidir. Kural ve tablo içeriği, onaysız değişikliğin geri alınması ve içeriden çıkış test edildi; **gerçek bir yabancı adresten bağlantı denemesi test edilmedi** (tablo üyeliği `pfctl -T test` ile doğrulandı). Engellenen deneme sayacı OPNsense tarafında 5 dakikaya kadar önbellekten gelir.
- **DNS sunucusu** değişikliği ve yerel alan adı kaydı ekleme/silme Unbound'u yeniden başlatır (test kurulumunda yaklaşık 2 saniye, sorgu kaybı olmadan). Yerel kayıtlar yalnızca güvenlik duvarını DNS sunucusu olarak kullanan cihazlarda geçerlidir. Özel sunucuda şifreli DNS için sertifika adı boş bırakılırsa Unbound sunucunun kimliğini doğrulamaz. Hazır sağlayıcılar yalnızca IPv4 adresleriyle eklenir.
- "Bağlantı" sütunu o anki pf durum sayısıdır, trafik miktarı değildir.
- **Yeni cihaz onayı** güvenlik duvarında uygulanır: onaysız cihaz internete ve diğer ağlara çıkamaz, yalnızca güvenlik duvarının kendisine (DHCP, DNS, yönetim arayüzü) erişir. Aynı anahtara (switch) ya da Wi-Fi'ye bağlı cihazların birbirine doğrudan erişimi güvenlik duvarından geçmediği için engellenemez (erişim noktasında istemci yalıtımı veya 802.1X gerekir). Onay MAC adresine göredir (MAC taklit edilebilir); adresler OPNsense'in MAC takma adı mekanizmasıyla dakikada bir yenilenir, bu yüzden onaylı bir cihaz yeni bir IP aldığında erişimi en geç bir dakika içinde açılır. Onay ilk açıldığında o ana kadar görülen cihazlar onaylı sayılır.

## Yeni dil eklemek

1. `www/js/inversapanel/i18n/en.js` dosyasını kopyalayın (ör. `de.js`). `window.InversaPanelI18n.de = {...}` olarak değiştirip metinleri çevirin.
2. `index.volt` içine bir `<script>` satırı ekleyin.
3. `InversaPanel.xml` içindeki `language` seçeneklerine `<de>Deutsch</de>` ekleyin.

## Paket olarak derleme

`os-inversa-panel` klasörünü bir FreeBSD/OPNsense derleme ortamındaki `opnsense/plugins` deposuna (ör. `security/inversa-panel`) kopyalayın. Ardından o klasörde `make package` çalıştırın.

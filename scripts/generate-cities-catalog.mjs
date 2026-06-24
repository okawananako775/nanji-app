import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

/**
 * [id, name, nameJa, country, flag, timezone]
 * id omitted in source rows uses timezone when first for that zone, else slugified name.
 */
const RAW = `
America/Vancouver|Vancouver|バンクーバー|Canada|🇨🇦|America/Vancouver
Asia/Tokyo|Tokyo|東京|Japan|🇯🇵|Asia/Tokyo
osaka|Osaka|大阪|Japan|🇯🇵|Asia/Tokyo
nagoya|Nagoya|名古屋|Japan|🇯🇵|Asia/Tokyo
sapporo|Sapporo|札幌|Japan|🇯🇵|Asia/Tokyo
fukuoka|Fukuoka|福岡|Japan|🇯🇵|Asia/Tokyo
Europe/Amsterdam|Amsterdam|アムステルダム|Netherlands|🇳🇱|Europe/Amsterdam
rotterdam|Rotterdam|ロッテルダム|Netherlands|🇳🇱|Europe/Amsterdam
America/New_York|New York|ニューヨーク|USA|🇺🇸|America/New_York
boston|Boston|ボストン|USA|🇺🇸|America/New_York
washington-dc|Washington D.C.|ワシントンD.C.|USA|🇺🇸|America/New_York
philadelphia|Philadelphia|フィラデルフィア|USA|🇺🇸|America/New_York
miami|Miami|マイアミ|USA|🇺🇸|America/New_York
atlanta|Atlanta|アトランタ|USA|🇺🇸|America/New_York
Europe/London|London|ロンドン|UK|🇬🇧|Europe/London
manchester|Manchester|マンチェスター|UK|🇬🇧|Europe/London
edinburgh|Edinburgh|エディンバラ|UK|🇬🇧|Europe/London
Europe/Paris|Paris|パリ|France|🇫🇷|Europe/Paris
lyon|Lyon|リヨン|France|🇫🇷|Europe/Paris
marseille|Marseille|マルセイユ|France|🇫🇷|Europe/Paris
Europe/Berlin|Berlin|ベルリン|Germany|🇩🇪|Europe/Berlin
munich|Munich|ミュンヘン|Germany|🇩🇪|Europe/Berlin
frankfurt|Frankfurt|フランクフルト|Germany|🇩🇪|Europe/Berlin
hamburg|Hamburg|ハンブルク|Germany|🇩🇪|Europe/Berlin
Australia/Sydney|Sydney|シドニー|Australia|🇦🇺|Australia/Sydney
melbourne|Melbourne|メルボルン|Australia|🇦🇺|Australia/Melbourne
brisbane|Brisbane|ブリスベン|Australia|🇦🇺|Australia/Brisbane
perth|Perth|パース|Australia|🇦🇺|Australia/Perth
adelaide|Adelaide|アデレード|Australia|🇦🇺|Australia/Adelaide
Asia/Singapore|Singapore|シンガポール|Singapore|🇸🇬|Asia/Singapore
Asia/Dubai|Dubai|ドバイ|UAE|🇦🇪|Asia/Dubai
abu-dhabi|Abu Dhabi|アブダビ|UAE|🇦🇪|Asia/Dubai
Asia/Seoul|Seoul|ソウル|South Korea|🇰🇷|Asia/Seoul
busan|Busan|プサン|South Korea|🇰🇷|Asia/Seoul
Asia/Bangkok|Bangkok|バンコク|Thailand|🇹🇭|Asia/Bangkok
America/Chicago|Chicago|シカゴ|USA|🇺🇸|America/Chicago
dallas|Dallas|ダラス|USA|🇺🇸|America/Chicago
houston|Houston|ヒューストン|USA|🇺🇸|America/Chicago
minneapolis|Minneapolis|ミネアポリス|USA|🇺🇸|America/Chicago
America/Los_Angeles|Los Angeles|ロサンゼルス|USA|🇺🇸|America/Los_Angeles
san-francisco|San Francisco|サンフランシスコ|USA|🇺🇸|America/Los_Angeles
seattle|Seattle|シアトル|USA|🇺🇸|America/Los_Angeles
san-diego|San Diego|サンディエゴ|USA|🇺🇸|America/Los_Angeles
portland|Portland|ポートランド|USA|🇺🇸|America/Los_Angeles
America/Toronto|Toronto|トロント|Canada|🇨🇦|America/Toronto
montreal|Montreal|モントリオール|Canada|🇨🇦|America/Toronto
ottawa|Ottawa|オタワ|Canada|🇨🇦|America/Toronto
calgary|Calgary|カルガリー|Canada|🇨🇦|America/Edmonton
Asia/Kolkata|Mumbai|ムンバイ|India|🇮🇳|Asia/Kolkata
delhi|Delhi|デリー|India|🇮🇳|Asia/Kolkata
bangalore|Bangalore|バンガロール|India|🇮🇳|Asia/Kolkata
chennai|Chennai|チェンナイ|India|🇮🇳|Asia/Kolkata
hyderabad|Hyderabad|ハイデラバード|India|🇮🇳|Asia/Kolkata
kolkata|Kolkata|コルカタ|India|🇮🇳|Asia/Kolkata
Africa/Cairo|Cairo|カイロ|Egypt|🇪🇬|Africa/Cairo
Europe/Moscow|Moscow|モスクワ|Russia|🇷🇺|Europe/Moscow
saint-petersburg|Saint Petersburg|サンクトペテルブルク|Russia|🇷🇺|Europe/Moscow
Asia/Shanghai|Beijing|北京|China|🇨🇳|Asia/Shanghai
shanghai|Shanghai|上海|China|🇨🇳|Asia/Shanghai
guangzhou|Guangzhou|広州|China|🇨🇳|Asia/Shanghai
shenzhen|Shenzhen|深圳|China|🇨🇳|Asia/Shanghai
chengdu|Chengdu|成都|China|🇨🇳|Asia/Shanghai
Asia/Hong_Kong|Hong Kong|香港|Hong Kong|🇭🇰|Asia/Hong_Kong
Pacific/Auckland|Auckland|オークランド|New Zealand|🇳🇿|Pacific/Auckland
wellington|Wellington|ウェリントン|New Zealand|🇳🇿|Pacific/Auckland
America/Sao_Paulo|São Paulo|サンパウロ|Brazil|🇧🇷|America/Sao_Paulo
rio-de-janeiro|Rio de Janeiro|リオデジャネイロ|Brazil|🇧🇷|America/Sao_Paulo
brasilia|Brasília|ブラジリア|Brazil|🇧🇷|America/Sao_Paulo
Europe/Lisbon|Lisbon|リスボン|Portugal|🇵🇹|Europe/Lisbon
porto|Porto|ポルト|Portugal|🇵🇹|Europe/Lisbon
Asia/Jakarta|Jakarta|ジャカルタ|Indonesia|🇮🇩|Asia/Jakarta
bali|Bali|バリ|Indonesia|🇮🇩|Asia/Makassar
Asia/Manila|Manila|マニラ|Philippines|🇵🇭|Asia/Manila
cebu|Cebu|セブ|Philippines|🇵🇭|Asia/Manila
Europe/Zurich|Zurich|チューリッヒ|Switzerland|🇨🇭|Europe/Zurich
geneva|Geneva|ジュネーブ|Switzerland|🇨🇭|Europe/Zurich
America/Mexico_City|Mexico City|メキシコシティ|Mexico|🇲🇽|America/Mexico_City
guadalajara|Guadalajara|グアダラハラ|Mexico|🇲🇽|America/Mexico_City
cancun|Cancún|カンクン|Mexico|🇲🇽|America/Cancun
Asia/Taipei|Taipei|台北|Taiwan|🇹🇼|Asia/Taipei
Asia/Kuala_Lumpur|Kuala Lumpur|クアラルンプール|Malaysia|🇲🇾|Asia/Kuala_Lumpur
Europe/Stockholm|Stockholm|ストックホルム|Sweden|🇸🇪|Europe/Stockholm
Europe/Madrid|Madrid|マドリード|Spain|🇪🇸|Europe/Madrid
barcelona|Barcelona|バルセロナ|Spain|🇪🇸|Europe/Madrid
Europe/Rome|Rome|ローマ|Italy|🇮🇹|Europe/Rome
milan|Milan|ミラノ|Italy|🇮🇹|Europe/Rome
Europe/Vienna|Vienna|ウィーン|Austria|🇦🇹|Europe/Vienna
Europe/Prague|Prague|プラハ|Czech Republic|🇨🇿|Europe/Prague
Europe/Warsaw|Warsaw|ワルシャワ|Poland|🇵🇱|Europe/Warsaw
Europe/Athens|Athens|アテネ|Greece|🇬🇷|Europe/Athens
Europe/Helsinki|Helsinki|ヘルシンキ|Finland|🇫🇮|Europe/Helsinki
Europe/Oslo|Oslo|オスロ|Norway|🇳🇴|Europe/Oslo
Europe/Copenhagen|Copenhagen|コペンハーゲン|Denmark|🇩🇰|Europe/Copenhagen
Europe/Dublin|Dublin|ダブリン|Ireland|🇮🇪|Europe/Dublin
Europe/Brussels|Brussels|ブリュッセル|Belgium|🇧🇪|Europe/Brussels
Europe/Budapest|Budapest|ブダペスト|Hungary|🇭🇺|Europe/Budapest
Europe/Bucharest|Bucharest|ブカレスト|Romania|🇷🇴|Europe/Bucharest
Europe/Istanbul|Istanbul|イスタンブール|Turkey|🇹🇷|Europe/Istanbul
Europe/Kiev|Kyiv|キーウ|Ukraine|🇺🇦|Europe/Kyiv
Europe/Zagreb|Zagreb|ザグレブ|Croatia|🇭🇷|Europe/Zagreb
Europe/Belgrade|Belgrade|ベオグラード|Serbia|🇷🇸|Europe/Belgrade
Europe/Sofia|Sofia|ソフィア|Bulgaria|🇧🇬|Europe/Sofia
Europe/Riga|Riga|リガ|Latvia|🇱🇻|Europe/Riga
Europe/Vilnius|Vilnius|ヴィリニュス|Lithuania|🇱🇹|Europe/Vilnius
Europe/Tallinn|Tallinn|タリン|Estonia|🇪🇪|Europe/Tallinn
Europe/Luxembourg|Luxembourg|ルクセンブルク|Luxembourg|🇱🇺|Europe/Luxembourg
Europe/Malta|Valletta|バレッタ|Malta|🇲🇹|Europe/Malta
Europe/Nicosia|Nicosia|ニコシア|Cyprus|🇨🇾|Asia/Nicosia
Asia/Jerusalem|Jerusalem|エルサレム|Israel|🇮🇱|Asia/Jerusalem
tel-aviv|Tel Aviv|テルアビブ|Israel|🇮🇱|Asia/Jerusalem
Asia/Riyadh|Riyadh|リヤド|Saudi Arabia|🇸🇦|Asia/Riyadh
jeddah|Jeddah|ジッダ|Saudi Arabia|🇸🇦|Asia/Riyadh
Asia/Qatar|Doha|ドーハ|Qatar|🇶🇦|Asia/Qatar
Asia/Kuwait|Kuwait City|クウェート|Kuwait|🇰🇼|Asia/Kuwait
Asia/Bahrain|Manama|マナーマ|Bahrain|🇧🇭|Asia/Bahrain
Asia/Muscat|Muscat|マスカット|Oman|🇴🇲|Asia/Muscat
Asia/Tehran|Tehran|テヘラン|Iran|🇮🇷|Asia/Tehran
Asia/Karachi|Karachi|カラチ|Pakistan|🇵🇰|Asia/Karachi
lahore|Lahore|ラホール|Pakistan|🇵🇰|Asia/Karachi
islamabad|Islamabad|イスラマバード|Pakistan|🇵🇰|Asia/Karachi
Asia/Dhaka|Dhaka|ダッカ|Bangladesh|🇧🇩|Asia/Dhaka
Asia/Colombo|Colombo|コロンボ|Sri Lanka|🇱🇰|Asia/Colombo
Asia/Kathmandu|Kathmandu|カトマンズ|Nepal|🇳🇵|Asia/Kathmandu
Asia/Yangon|Yangon|ヤンゴン|Myanmar|🇲🇲|Asia/Yangon
Asia/Ho_Chi_Minh|Ho Chi Minh City|ホーチミン|Vietnam|🇻🇳|Asia/Ho_Chi_Minh
hanoi|Hanoi|ハノイ|Vietnam|🇻🇳|Asia/Bangkok
Asia/Phnom_Penh|Phnom Penh|プノンペン|Cambodia|🇰🇭|Asia/Phnom_Penh
Asia/Vientiane|Vientiane|ビエンチャン|Laos|🇱🇦|Asia/Bangkok
Asia/Ulaanbaatar|Ulaanbaatar|ウランバートル|Mongolia|🇲🇳|Asia/Ulaanbaatar
Asia/Almaty|Almaty|アルマトイ|Kazakhstan|🇰🇿|Asia/Almaty
Asia/Tashkent|Tashkent|タシケント|Uzbekistan|🇺🇿|Asia/Tashkent
Asia/Tbilisi|Tbilisi|トビリシ|Georgia|🇬🇪|Asia/Tbilisi
Asia/Yerevan|Yerevan|エレバン|Armenia|🇦🇲|Asia/Yerevan
Asia/Baku|Baku|バクー|Azerbaijan|🇦🇿|Asia/Baku
Africa/Johannesburg|Johannesburg|ヨハネスブルグ|South Africa|🇿🇦|Africa/Johannesburg
cape-town|Cape Town|ケープタウン|South Africa|🇿🇦|Africa/Johannesburg
Africa/Lagos|Lagos|ラゴス|Nigeria|🇳🇬|Africa/Lagos
Africa/Nairobi|Nairobi|ナイロビ|Kenya|🇰🇪|Africa/Nairobi
Africa/Addis_Ababa|Addis Ababa|アディスアベバ|Ethiopia|🇪🇹|Africa/Addis_Ababa
Africa/Casablanca|Casablanca|カサブランカ|Morocco|🇲🇦|Africa/Casablanca
Africa/Algiers|Algiers|アルジェ|Algeria|🇩🇿|Africa/Algiers
Africa/Tunis|Tunis|チュニス|Tunisia|🇹🇳|Africa/Tunis
Africa/Accra|Accra|アクラ|Ghana|🇬🇭|Africa/Accra
Africa/Dakar|Dakar|ダカール|Senegal|🇸🇳|Africa/Dakar
Africa/Khartoum|Khartoum|ハルツーム|Sudan|🇸🇩|Africa/Khartoum
Africa/Kampala|Kampala|カンパラ|Uganda|🇺🇬|Africa/Nairobi
Africa/Kigali|Kigali|キガリ|Rwanda|🇷🇼|Africa/Kigali
Africa/Maputo|Maputo|マプト|Mozambique|🇲🇿|Africa/Maputo
Africa/Harare|Harare|ハラレ|Zimbabwe|🇿🇼|Africa/Harare
Africa/Lusaka|Lusaka|ルサカ|Zambia|🇿🇲|Africa/Lusaka
Africa/Windhoek|Windhoek|ウィントフック|Namibia|🇳🇦|Africa/Windhoek
Africa/Douala|Douala|ドゥアラ|Cameroon|🇨🇲|Africa/Douala
Africa/Abidjan|Abidjan|アビジャン|Côte d'Ivoire|🇨🇮|Africa/Abidjan
America/Buenos_Aires|Buenos Aires|ブエノスアイレス|Argentina|🇦🇷|America/Buenos_Aires
America/Santiago|Santiago|サンティアゴ|Chile|🇨🇱|America/Santiago
America/Bogota|Bogotá|ボゴタ|Colombia|🇨🇴|America/Bogota
medellin|Medellín|メデジン|Colombia|🇨🇴|America/Bogota
America/Lima|Lima|リマ|Peru|🇵🇪|America/Lima
America/Caracas|Caracas|カラカス|Venezuela|🇻🇪|America/Caracas
America/Guayaquil|Quito|キト|Ecuador|🇪🇨|America/Guayaquil
America/La_Paz|La Paz|ラパス|Bolivia|🇧🇴|America/La_Paz
America/Asuncion|Asunción|アスンシオン|Paraguay|🇵🇾|America/Asuncion
America/Montevideo|Montevideo|モンテビデオ|Uruguay|🇺🇾|America/Montevideo
America/Panama|Panama City|パナマシティ|Panama|🇵🇦|America/Panama
America/Costa_Rica|San José|サンホセ|Costa Rica|🇨🇷|America/Costa_Rica
America/Guatemala|Guatemala City|グアテマラシティ|Guatemala|🇬🇹|America/Guatemala
America/Tegucigalpa|Tegucigalpa|テグシガルパ|Honduras|🇭🇳|America/Tegucigalpa
America/El_Salvador|San Salvador|サンサルバドル|El Salvador|🇸🇻|America/El_Salvador
America/Managua|Managua|マナグア|Nicaragua|🇳🇮|America/Managua
America/Havana|Havana|ハバナ|Cuba|🇨🇺|America/Havana
America/Jamaica|Kingston|キングストン|Jamaica|🇯🇲|America/Jamaica
America/Puerto_Rico|San Juan|サンフアン|Puerto Rico|🇵🇷|America/Puerto_Rico
America/Santo_Domingo|Santo Domingo|サントドミンゴ|Dominican Republic|🇩🇴|America/Santo_Domingo
America/Barbados|Bridgetown|ブリッジタウン|Barbados|🇧🇧|America/Barbados
America/Denver|Denver|デンバー|USA|🇺🇸|America/Denver
salt-lake-city|Salt Lake City|ソルトレイクシティ|USA|🇺🇸|America/Denver
phoenix|Phoenix|フェニックス|USA|🇺🇸|America/Phoenix
las-vegas|Las Vegas|ラスベガス|USA|🇺🇸|America/Los_Angeles
America/Anchorage|Anchorage|アンカレッジ|USA|🇺🇸|America/Anchorage
Pacific/Honolulu|Honolulu|ホノルル|USA|🇺🇸|Pacific/Honolulu
America/Detroit|Detroit|デトロイト|USA|🇺🇸|America/Detroit
cleveland|Cleveland|クリーブランド|USA|🇺🇸|America/New_York
charlotte|Charlotte|シャーロット|USA|🇺🇸|America/New_York
nashville|Nashville|ナッシュビル|USA|🇺🇸|America/Chicago
austin|Austin|オースティン|USA|🇺🇸|America/Chicago
new-orleans|New Orleans|ニューオーリンズ|USA|🇺🇸|America/Chicago
kansas-city|Kansas City|カンザスシティ|USA|🇺🇸|America/Chicago
st-louis|St. Louis|セントルイス|USA|🇺🇸|America/Chicago
America/Edmonton|Edmonton|エドモントン|Canada|🇨🇦|America/Edmonton
victoria|Victoria|ビクトリア|Canada|🇨🇦|America/Vancouver
winnipeg|Winnipeg|ウィニペグ|Canada|🇨🇦|America/Winnipeg
halifax|Halifax|ハリファックス|Canada|🇨🇦|America/Halifax
st-johns|St. John's|セントジョンズ|Canada|🇨🇦|America/St_Johns
America/Monterrey|Monterrey|モンテレイ|Mexico|🇲🇽|America/Monterrey
tijuana|Tijuana|ティフアナ|Mexico|🇲🇽|America/Tijuana
merida|Mérida|メリダ|Mexico|🇲🇽|America/Merida
America/Argentina/Cordoba|Córdoba|コルドバ|Argentina|🇦🇷|America/Argentina/Cordoba
America/Argentina/Mendoza|Mendoza|メンドーサ|Argentina|🇦🇷|America/Argentina/Mendoza
America/Recife|Recife|レシフェ|Brazil|🇧🇷|America/Recife
America/Fortaleza|Fortaleza|フォルタレザ|Brazil|🇧🇷|America/Fortaleza
America/Manaus|Manaus|マナウス|Brazil|🇧🇷|America/Manaus
America/Cuiaba|Cuiabá|クイアバ|Brazil|🇧🇷|America/Cuiaba
America/Belem|Belém|ベレン|Brazil|🇧🇷|America/Belem
America/Porto_Velho|Porto Velho|ポルトベーリョ|Brazil|🇧🇷|America/Porto_Velho
Pacific/Guam|Guam|グアム|Guam|🇬🇺|Pacific/Guam
Pacific/Port_Moresby|Port Moresby|ポートモレスビー|Papua New Guinea|🇵🇬|Pacific/Port_Moresby
Pacific/Fiji|Suva|スバ|Fiji|🇫🇯|Pacific/Fiji
Pacific/Tahiti|Papeete|パペーテ|French Polynesia|🇵🇫|Pacific/Tahiti
Pacific/Tongatapu|Nuku'alofa|ヌクアロファ|Tonga|🇹🇴|Pacific/Tongatapu
Pacific/Apia|Apia|アピア|Samoa|🇼🇸|Pacific/Apia
Pacific/Guadalcanal|Honiara|ホニアラ|Solomon Islands|🇸🇧|Pacific/Guadalcanal
Pacific/Noumea|Nouméa|ヌメア|New Caledonia|🇳🇨|Pacific/Noumea
Pacific/Chatham|Chatham Islands|チャタム諸島|New Zealand|🇳🇿|Pacific/Chatham
Indian/Maldives|Malé|マレ|Maldives|🇲🇻|Indian/Maldives
Indian/Mauritius|Port Louis|ポートルイス|Mauritius|🇲🇺|Indian/Mauritius
Indian/Reunion|Réunion|レユニオン|France|🇫🇷|Indian/Reunion
Indian/Seychelles|Victoria|ビクトリア|Seychelles|🇸🇨|Indian/Mahe
Asia/Brunei|Bandar Seri Begawan|バンダルスリブガワン|Brunei|🇧🇳|Asia/Brunei
Asia/Macau|Macau|マカオ|Macau|🇲🇴|Asia/Macau
Asia/Dili|Dili|ディリ|Timor-Leste|🇹🇱|Asia/Dili
Asia/Kabul|Kabul|カブール|Afghanistan|🇦🇫|Asia/Kabul
Asia/Baghdad|Baghdad|バグダッド|Iraq|🇮🇶|Asia/Baghdad
Asia/Amman|Amman|アンマン|Jordan|🇯🇴|Asia/Amman
Asia/Beirut|Beirut|ベイルート|Lebanon|🇱🇧|Asia/Beirut
Asia/Damascus|Damascus|ダマスカス|Syria|🇸🇾|Asia/Damascus
Asia/Aden|Sana'a|サナア|Yemen|🇾🇪|Asia/Riyadh
Asia/Ashgabat|Ashgabat|アシガバット|Turkmenistan|🇹🇲|Asia/Ashgabat
Asia/Dushanbe|Dushanbe|ドゥシャンベ|Tajikistan|🇹🇯|Asia/Dushanbe
Asia/Bishkek|Bishkek|ビシュケク|Kyrgyzstan|🇰🇬|Asia/Bishkek
Asia/Vladivostok|Vladivostok|ウラジオストク|Russia|🇷🇺|Asia/Vladivostok
Asia/Novosibirsk|Novosibirsk|ノヴォシビルスク|Russia|🇷🇺|Asia/Novosibirsk
Asia/Yekaterinburg|Yekaterinburg|エカテリンブルク|Russia|🇷🇺|Asia/Yekaterinburg
Asia/Krasnoyarsk|Krasnoyarsk|クラスノヤルスク|Russia|🇷🇺|Asia/Krasnoyarsk
Asia/Irkutsk|Irkutsk|イルクーツク|Russia|🇷🇺|Asia/Irkutsk
Asia/Kamchatka|Petropavlovsk-Kamchatsky|ペトロパブロフスク|Russia|🇷🇺|Asia/Kamchatka
Asia/Sakhalin|Yuzhno-Sakhalinsk|ユジノサハリンスク|Russia|🇷🇺|Asia/Sakhalin
Asia/Magadan|Magadan|マガダン|Russia|🇷🇺|Asia/Magadan
Europe/Kaliningrad|Kaliningrad|カリーニングラード|Russia|🇷🇺|Europe/Kaliningrad
Europe/Samara|Samara|サマラ|Russia|🇷🇺|Europe/Samara
Atlantic/Reykjavik|Reykjavik|レイキャビク|Iceland|🇮🇸|Atlantic/Reykjavik
Atlantic/Azores|Ponta Delgada|ポンタデルガダ|Portugal|🇵🇹|Atlantic/Azores
Atlantic/Cape_Verde|Praia|プライア|Cape Verde|🇨🇻|Atlantic/Cape_Verde
Africa/Tripoli|Tripoli|トリポリ|Libya|🇱🇾|Africa/Tripoli
Africa/Bamako|Bamako|バマコ|Mali|🇲🇱|Africa/Abidjan
Africa/Ouagadougou|Ouagadougou|ワガドゥグー|Burkina Faso|🇧🇫|Africa/Abidjan
Africa/Conakry|Conakry|コナクリ|Guinea|🇬🇳|Africa/Abidjan
Africa/Freetown|Freetown|フリータウン|Sierra Leone|🇸🇱|Africa/Abidjan
Africa/Monrovia|Monrovia|モンロビア|Liberia|🇱🇷|Africa/Monrovia
Africa/Banjul|Banjul|バンジュール|Gambia|🇬🇲|Africa/Abidjan
Africa/Ndjamena|N'Djamena|ンジャメナ|Chad|🇹🇩|Africa/Ndjamena
Africa/Brazzaville|Brazzaville|ブラザビル|Congo|🇨🇬|Africa/Lagos
Africa/Kinshasa|Kinshasa|キンシャサ|DR Congo|🇨🇩|Africa/Kinshasa
Africa/Lubumbashi|Lubumbashi|ルブンバシ|DR Congo|🇨🇩|Africa/Lubumbashi
Africa/Luanda|Luanda|ルアンダ|Angola|🇦🇴|Africa/Lagos
Africa/Dar_es_Salaam|Dar es Salaam|ダルエスサラーム|Tanzania|🇹🇿|Africa/Nairobi
Africa/Mogadishu|Mogadishu|モガディシュ|Somalia|🇸🇴|Africa/Nairobi
Africa/Djibouti|Djibouti|ジブチ|Djibouti|🇩🇯|Africa/Djibouti
Africa/Asmara|Asmara|アスマラ|Eritrea|🇪🇷|Africa/Asmara
Africa/Mbabane|Mbabane|ムババーネ|Eswatini|🇸🇿|Africa/Johannesburg
Africa/Maseru|Maseru|マセル|Lesotho|🇱🇸|Africa/Johannesburg
Africa/Gaborone|Gaborone|ハボローネ|Botswana|🇧🇼|Africa/Gaborone
Africa/Blantyre|Blantyre|ブランタイア|Malawi|🇲🇼|Africa/Blantyre
Africa/Antananarivo|Antananarivo|アンタナナリボ|Madagascar|🇲🇬|Indian/Antananarivo
Indian/Comoro|Moroni|モロニ|Comoros|🇰🇲|Indian/Comoro
Africa/Port_Louis|Port Louis|ポートルイス|Mauritius|🇲🇺|Indian/Mauritius
Asia/Rangoon|Yangon|ヤンゴン|Myanmar|🇲🇲|Asia/Yangon
Asia/Thimphu|Thimphu|ティンプー|Bhutan|🇧🇹|Asia/Thimphu
Asia/Pyongyang|Pyongyang|平壌|North Korea|🇰🇵|Asia/Pyongyang
Asia/Hovd|Hovd|ホブド|Mongolia|🇲🇳|Asia/Hovd
Asia/Choibalsan|Choibalsan|チョイバルサン|Mongolia|🇲🇳|Asia/Choibalsan
pittsburgh|Pittsburgh|ピッツバーグ|USA|🇺🇸|America/New_York
orlando|Orlando|オーランド|USA|🇺🇸|America/New_York
tampa|Tampa|タンパ|USA|🇺🇸|America/New_York
raleigh|Raleigh|ローリー|USA|🇺🇸|America/New_York
indianapolis|Indianapolis|インディアナポリス|USA|🇺🇸|America/Indiana/Indianapolis
columbus|Columbus|コロンバス|USA|🇺🇸|America/New_York
cincinnati|Cincinnati|シンシナティ|USA|🇺🇸|America/New_York
milwaukee|Milwaukee|ミルウォーキー|USA|🇺🇸|America/Chicago
memphis|Memphis|メンフィス|USA|🇺🇸|America/Chicago
oklahoma-city|Oklahoma City|オクラホマシティ|USA|🇺🇸|America/Chicago
san-antonio|San Antonio|サンアントニオ|USA|🇺🇸|America/Chicago
sacramento|Sacramento|サクラメント|USA|🇺🇸|America/Los_Angeles
san-jose|San Jose|サンノゼ|USA|🇺🇸|America/Los_Angeles
reno|Reno|リノ|USA|🇺🇸|America/Los_Angeles
boise|Boise|ボイジー|USA|🇺🇸|America/Boise
albuquerque|Albuquerque|アルバカーキ|USA|🇺🇸|America/Denver
tucson|Tucson|ツーソン|USA|🇺🇸|America/Phoenix
el-paso|El Paso|エルパソ|USA|🇺🇸|America/Denver
baltimore|Baltimore|ボルチモア|USA|🇺🇸|America/New_York
richmond|Richmond|リッチモンド|USA|🇺🇸|America/New_York
buffalo|Buffalo|バッファロー|USA|🇺🇸|America/New_York
hartford|Hartford|ハートフォード|USA|🇺🇸|America/New_York
providence|Providence|プロビデンス|USA|🇺🇸|America/New_York
jacksonville|Jacksonville|ジャクソンビル|USA|🇺🇸|America/New_York
louisville|Louisville|ルイビル|USA|🇺🇸|America/Kentucky/Louisville
birmingham-us|Birmingham|バーミングハム|USA|🇺🇸|America/Chicago
omaha|Omaha|オマハ|USA|🇺🇸|America/Chicago
des-moines|Des Moines|デモイン|USA|🇺🇸|America/Chicago
fresno|Fresno|フレズノ|USA|🇺🇸|America/Los_Angeles
long-beach|Long Beach|ロングビーチ|USA|🇺🇸|America/Los_Angeles
europe-skopje|Skopje|スコピエ|North Macedonia|🇲🇰|Europe/Skopje
europe-tirane|Tirana|ティラナ|Albania|🇦🇱|Europe/Tirane
europe-sarajevo|Sarajevo|サラエボ|Bosnia|🇧🇦|Europe/Sarajevo
europe-ljubljana|Ljubljana|リュブリャナ|Slovenia|🇸🇮|Europe/Ljubljana
europe-bratislava|Bratislava|ブラチスラバ|Slovakia|🇸🇰|Europe/Bratislava
europe-chisinau|Chișinău|キシナウ|Moldova|🇲🇩|Europe/Chisinau
europe-minsk|Minsk|ミンスク|Belarus|🇧🇾|Europe/Minsk
europe-volgograd|Volgograd|ヴォルゴグラード|Russia|🇷🇺|Europe/Volgograd
europe-rostov|Rostov-on-Don|ロストフ|Russia|🇷🇺|Europe/Moscow
europe-kazan|Kazan|カザン|Russia|🇷🇺|Europe/Moscow
europe-ufa|Ufa|ウファ|Russia|🇷🇺|Asia/Yekaterinburg
europe-murmansk|Murmansk|ムルマンスク|Russia|🇷🇺|Europe/Moscow
europe-odessa|Odesa|オデッサ|Ukraine|🇺🇦|Europe/Kyiv
europe-lviv|Lviv|リヴィウ|Ukraine|🇺🇦|Europe/Kyiv
europe-kharkiv|Kharkiv|ハルキウ|Ukraine|🇺🇦|Europe/Kyiv
europe-thessaloniki|Thessaloniki|テッサロニキ|Greece|🇬🇷|Europe/Athens
europe-porto-pt|Porto|ポルト|Portugal|🇵🇹|Europe/Lisbon
europe-valencia|Valencia|バレンシア|Spain|🇪🇸|Europe/Madrid
europe-seville|Seville|セビリア|Spain|🇪🇸|Europe/Madrid
europe-bilbao|Bilbao|ビルバオ|Spain|🇪🇸|Europe/Madrid
europe-naples|Naples|ナポリ|Italy|🇮🇹|Europe/Rome
europe-turin|Turin|トリノ|Italy|🇮🇹|Europe/Rome
europe-florence|Florence|フィレンツェ|Italy|🇮🇹|Europe/Rome
europe-venice|Venice|ベネチア|Italy|🇮🇹|Europe/Rome
europe-bologna|Bologna|ボローニャ|Italy|🇮🇹|Europe/Rome
europe-geneva-ch|Geneva|ジュネーブ|Switzerland|🇨🇭|Europe/Zurich
europe-basel|Basel|バーゼル|Switzerland|🇨🇭|Europe/Zurich
europe-bern|Bern|ベルン|Switzerland|🇨🇭|Europe/Zurich
europe-graz|Graz|グラーツ|Austria|🇦🇹|Europe/Vienna
europe-salzburg|Salzburg|ザルツブルク|Austria|🇦🇹|Europe/Vienna
europe-krakow|Kraków|クラクフ|Poland|🇵🇱|Europe/Warsaw
europe-gdansk|Gdańsk|グダニスク|Poland|🇵🇱|Europe/Warsaw
europe-wroclaw|Wrocław|ヴロツワフ|Poland|🇵🇱|Europe/Warsaw
europe-brno|Brno|ブルノ|Czech Republic|🇨🇿|Europe/Prague
europe-debrecen|Debrecen|デブレツェン|Hungary|🇭🇺|Europe/Budapest
europe-cluj|Cluj-Napoca|クルジュ|Romania|🇷🇴|Europe/Bucharest
europe-antwerp|Antwerp|アントワープ|Belgium|🇧🇪|Europe/Brussels
europe-rotterdam-nl|Rotterdam|ロッテルダム|Netherlands|🇳🇱|Europe/Amsterdam
europe-the-hague|The Hague|ハーグ|Netherlands|🇳🇱|Europe/Amsterdam
europe-utrecht|Utrecht|ユトレヒト|Netherlands|🇳🇱|Europe/Amsterdam
europe-cologne|Cologne|ケルン|Germany|🇩🇪|Europe/Berlin
europe-stuttgart|Stuttgart|シュトゥットガルト|Germany|🇩🇪|Europe/Berlin
europe-dusseldorf|Düsseldorf|デュッセルドルフ|Germany|🇩🇪|Europe/Berlin
europe-leipzig|Leipzig|ライプツィヒ|Germany|🇩🇪|Europe/Berlin
europe-dresden|Dresden|ドレスデン|Germany|🇩🇪|Europe/Berlin
europe-nuremberg|Nuremberg|ニュルンベルク|Germany|🇩🇪|Europe/Berlin
europe-lyon-fr|Lyon|リヨン|France|🇫🇷|Europe/Paris
europe-nice|Nice|ニース|France|🇫🇷|Europe/Paris
europe-toulouse|Toulouse|トゥールーズ|France|🇫🇷|Europe/Paris
europe-strasbourg|Strasbourg|ストラスブール|France|🇫🇷|Europe/Paris
europe-bordeaux|Bordeaux|ボルドー|France|🇫🇷|Europe/Paris
europe-glasgow|Glasgow|グラスゴー|UK|🇬🇧|Europe/London
europe-birmingham-uk|Birmingham|バーミンガム|UK|🇬🇧|Europe/London
europe-leeds|Leeds|リーズ|UK|🇬🇧|Europe/London
europe-liverpool|Liverpool|リバプール|UK|🇬🇧|Europe/London
europe-bristol|Bristol|ブリストル|UK|🇬🇧|Europe/London
europe-cardiff|Cardiff|カーディフ|UK|🇬🇧|Europe/London
europe-belfast|Belfast|ベルファスト|UK|🇬🇧|Europe/London
europe-gothenburg|Gothenburg|ヨーテボリ|Sweden|🇸🇪|Europe/Stockholm
europe-malmo|Malmö|マルメ|Sweden|🇸🇪|Europe/Stockholm
europe-bergen|Bergen|ベルゲン|Norway|🇳🇴|Europe/Oslo
europe-trondheim|Trondheim|トロンハイム|Norway|🇳🇴|Europe/Oslo
europe-tampere|Tampere|タンペレ|Finland|🇫🇮|Europe/Helsinki
europe-turku|Turku|トゥルク|Finland|🇫🇮|Europe/Helsinki
europe-aarhus|Aarhus|オーフス|Denmark|🇩🇰|Europe/Copenhagen
europe-odense|Odense|オーデンセ|Denmark|🇩🇰|Europe/Copenhagen
europe-cork|Cork|コーク|Ireland|🇮🇪|Europe/Dublin
europe-galway|Galway|ゴールウェイ|Ireland|🇮🇪|Europe/Dublin
asia-ahmedabad|Ahmedabad|アーメダバード|India|🇮🇳|Asia/Kolkata
asia-pune|Pune|プネ|India|🇮🇳|Asia/Kolkata
asia-jaipur|Jaipur|ジャイプール|India|🇮🇳|Asia/Kolkata
asia-lucknow|Lucknow|ラクナウ|India|🇮🇳|Asia/Kolkata
asia-kanpur|Kanpur|カンプール|India|🇮🇳|Asia/Kolkata
asia-surat|Surat|スーラト|India|🇮🇳|Asia/Kolkata
asia-kochi|Kochi|コーチ|India|🇮🇳|Asia/Kolkata
asia-thiruvananthapuram|Thiruvananthapuram|トリヴァンドラム|India|🇮🇳|Asia/Kolkata
asia-indore|Indore|インドール|India|🇮🇳|Asia/Kolkata
asia-nagpur|Nagpur|ナーグプール|India|🇮🇳|Asia/Kolkata
asia-patna|Patna|パトナ|India|🇮🇳|Asia/Kolkata
asia-chandigarh|Chandigarh|チャンディーガル|India|🇮🇳|Asia/Kolkata
asia-guwahati|Guwahati|グワハティ|India|🇮🇳|Asia/Kolkata
asia-visakhapatnam|Visakhapatnam|ヴィシャーカパトナム|India|🇮🇳|Asia/Kolkata
asia-coimbatore|Coimbatore|コーヤンブットゥール|India|🇮🇳|Asia/Kolkata
asia-madurai|Madurai|マドゥライ|India|🇮🇳|Asia/Kolkata
asia-da-nang|Da Nang|ダナン|Vietnam|🇻🇳|Asia/Ho_Chi_Minh
asia-can-tho|Can Tho|カントー|Vietnam|🇻🇳|Asia/Ho_Chi_Minh
asia-hai-phong|Hai Phong|ハイフォン|Vietnam|🇻🇳|Asia/Bangkok
asia-penang|Penang|ペナン|Malaysia|🇲🇾|Asia/Kuala_Lumpur
asia-johor-bahru|Johor Bahru|ジョホールバル|Malaysia|🇲🇾|Asia/Kuala_Lumpur
asia-kota-kinabalu|Kota Kinabalu|コタキナバル|Malaysia|🇲🇾|Asia/Kuching
asia-kuching|Kuching|クチン|Malaysia|🇲🇾|Asia/Kuching
asia-davao|Davao|ダバオ|Philippines|🇵🇭|Asia/Manila
asia-quezon-city|Quezon City|ケソン|Philippines|🇵🇭|Asia/Manila
asia-cagayan-de-oro|Cagayan de Oro|カガヤン|Philippines|🇵🇭|Asia/Manila
asia-bandung|Bandung|バンドン|Indonesia|🇮🇩|Asia/Jakarta
asia-surabaya|Surabaya|スラバヤ|Indonesia|🇮🇩|Asia/Jakarta
asia-medan|Medan|メダン|Indonesia|🇮🇩|Asia/Jakarta
asia-yogyakarta|Yogyakarta|ジョグジャカルタ|Indonesia|🇮🇩|Asia/Jakarta
asia-makassar|Makassar|マカッサル|Indonesia|🇮🇩|Asia/Makassar
asia-denpasar|Denpasar|デンパサール|Indonesia|🇮🇩|Asia/Makassar
asia-palembang|Palembang|パレンバン|Indonesia|🇮🇩|Asia/Jakarta
asia-kaohsiung|Kaohsiung|高雄|Taiwan|🇹🇼|Asia/Taipei
asia-taichung|Taichung|台中|Taiwan|🇹🇼|Asia/Taipei
asia-tainan|Tainan|台南|Taiwan|🇹🇼|Asia/Taipei
asia-guangzhou-cn|Guangzhou|広州|China|🇨🇳|Asia/Shanghai
asia-shenzhen-cn|Shenzhen|深圳|China|🇨🇳|Asia/Shanghai
asia-chengdu-cn|Chengdu|成都|China|🇨🇳|Asia/Shanghai
asia-chongqing|Chongqing|重慶|China|🇨🇳|Asia/Shanghai
asia-wuhan|Wuhan|武漢|China|🇨🇳|Asia/Shanghai
asia-xian|Xi'an|西安|China|🇨🇳|Asia/Shanghai
asia-hangzhou|Hangzhou|杭州|China|🇨🇳|Asia/Shanghai
asia-nanjing|Nanjing|南京|China|🇨🇳|Asia/Shanghai
asia-tianjin|Tianjin|天津|China|🇨🇳|Asia/Shanghai
asia-qingdao|Qingdao|青島|China|🇨🇳|Asia/Shanghai
asia-dalian|Dalian|大連|China|🇨🇳|Asia/Shanghai
asia-shenyang|Shenyang|瀋陽|China|🇨🇳|Asia/Shanghai
asia-harbin|Harbin|哈爾浜|China|🇨🇳|Asia/Shanghai
asia-kunming|Kunming|昆明|China|🇨🇳|Asia/Shanghai
asia-changsha|Changsha|長沙|China|🇨🇳|Asia/Shanghai
asia-zhengzhou|Zhengzhou|鄭州|China|🇨🇳|Asia/Shanghai
asia-urumqi|Ürümqi|ウルムチ|China|🇨🇳|Asia/Urumqi
asia-lhasa|Lhasa|ラサ|China|🇨🇳|Asia/Urumqi
asia-macau-cn|Macau|マカオ|Macau|🇲🇴|Asia/Macau
asia-chiang-mai|Chiang Mai|チェンマイ|Thailand|🇹🇭|Asia/Bangkok
asia-phuket|Phuket|プーケット|Thailand|🇹🇭|Asia/Bangkok
asia-pattaya|Pattaya|パタヤ|Thailand|🇹🇭|Asia/Bangkok
asia-daegu|Daegu|大邱|South Korea|🇰🇷|Asia/Seoul
asia-incheon|Incheon|仁川|South Korea|🇰🇷|Asia/Seoul
asia-jeju|Jeju|済州|South Korea|🇰🇷|Asia/Seoul
asia-ulaanbaatar-mn|Ulaanbaatar|ウランバートル|Mongolia|🇲🇳|Asia/Ulaanbaatar
asia-astana|Astana|アスタナ|Kazakhstan|🇰🇿|Asia/Almaty
asia-bishkek-kg|Bishkek|ビシュケク|Kyrgyzstan|🇰🇬|Asia/Bishkek
africa-port-elizabeth|Port Elizabeth|ポートエリザベス|South Africa|🇿🇦|Africa/Johannesburg
africa-durban|Durban|ダーバン|South Africa|🇿🇦|Africa/Johannesburg
africa-pretoria|Pretoria|プレトリア|South Africa|🇿🇦|Africa/Johannesburg
africa-kano|Kano|カノ|Nigeria|🇳🇬|Africa/Lagos
africa-abuja|Abuja|アブジャ|Nigeria|🇳🇬|Africa/Lagos
africa-port-harcourt|Port Harcourt|ポートハーコート|Nigeria|🇳🇬|Africa/Lagos
africa-mombasa|Mombasa|モンバサ|Kenya|🇰🇪|Africa/Nairobi
africa-zanzibar|Zanzibar|ザンジバル|Tanzania|🇹🇿|Africa/Nairobi
africa-kumasi|Kumasi|クマシ|Ghana|🇬🇭|Africa/Accra
africa-tema|Tema|テマ|Ghana|🇬🇭|Africa/Accra
africa-marrakech|Marrakech|マラケシュ|Morocco|🇲🇦|Africa/Casablanca
africa-rabat|Rabat|ラバト|Morocco|🇲🇦|Africa/Casablanca
africa-fes|Fes|フェズ|Morocco|🇲🇦|Africa/Casablanca
africa-oran|Oran|オラン|Algeria|🇩🇿|Africa/Algiers
africa-constantine|Constantine|コンスタンティーヌ|Algeria|🇩🇿|Africa/Algiers
africa-sfax|Sfax|スファックス|Tunisia|🇹🇳|Africa/Tunis
africa-sousse|Sousse|スース|Tunisia|🇹🇳|Africa/Tunis
africa-alexandria|Alexandria|アレクサンドリア|Egypt|🇪🇬|Africa/Cairo
africa-giza|Giza|ギザ|Egypt|🇪🇬|Africa/Cairo
africa-luxor|Luxor|ルクソール|Egypt|🇪🇬|Africa/Cairo
america-curacao|Willemstad|ウィレムスタット|Curaçao|🇨🇼|America/Curacao
america-aruba|Oranjestad|オラニエスタッド|Aruba|🇦🇼|America/Aruba
america-grand-turk|Grand Turk|グランドターク|Turks and Caicos|🇹🇨|America/Grand_Turk
america-nassau|Nassau|ナッソー|Bahamas|🇧🇸|America/Nassau
america-belize|Belize City|ベリーズシティ|Belize|🇧🇿|America/Belize
america-george-town|George Town|ジョージタウン|Cayman Islands|🇰🇾|America/Cayman
america-port-of-spain|Port of Spain|ポートオブスペイン|Trinidad|🇹🇹|America/Port_of_Spain
america-paramaribo|Paramaribo|パラマリボ|Suriname|🇸🇷|America/Paramaribo
america-cayenne|Cayenne|カイエンヌ|French Guiana|🇬🇫|America/Cayenne
america-georgetown|Georgetown|ジョージタウン|Guyana|🇬🇾|America/Guyana
america-quito-ec|Quito|キト|Ecuador|🇪🇨|America/Guayaquil
america-guayaquil-ec|Guayaquil|グアヤキル|Ecuador|🇪🇨|America/Guayaquil
america-cali|Cali|カリ|Colombia|🇨🇴|America/Bogota
america-barranquilla|Barranquilla|バランキージャ|Colombia|🇨🇴|America/Bogota
america-cartagena|Cartagena|カルタヘナ|Colombia|🇨🇴|America/Bogota
america-valparaiso|Valparaíso|バルパライソ|Chile|🇨🇱|America/Santiago
america-concepcion|Concepción|コンヘプシオン|Chile|🇨🇱|America/Santiago
america-antofagasta|Antofagasta|アントファガスタ|Chile|🇨🇱|America/Santiago
america-mendoza-cl|Mendoza|メンドーサ|Chile|🇨🇱|America/Santiago
america-rosario|Rosario|ロサリオ|Argentina|🇦🇷|America/Buenos_Aires
america-cordoba-ar|Córdoba|コルドバ|Argentina|🇦🇷|America/Argentina/Cordoba
america-mar-del-plata|Mar del Plata|マルデルプラタ|Argentina|🇦🇷|America/Buenos_Aires
america-salta|Salta|サルタ|Argentina|🇦🇷|America/Argentina/Salta
america-ushuaia|Ushuaia|ウシュアイア|Argentina|🇦🇷|America/Argentina/Ushuaia
america-punta-del-este|Punta del Este|プンタデルエステ|Uruguay|🇺🇾|America/Montevideo
america-santa-cruz|Santa Cruz|サンタクルス|Bolivia|🇧🇴|America/La_Paz
america-cusco|Cusco|クスコ|Peru|🇵🇪|America/Lima
america-arequipa|Arequipa|アレキパ|Peru|🇵🇪|America/Lima
america-iquitos|Iquitos|イキトス|Peru|🇵🇪|America/Lima
america-valencia-ve|Valencia|バレンシア|Venezuela|🇻🇪|America/Caracas
america-maracaibo|Maracaibo|マラカイボ|Venezuela|🇻🇪|America/Caracas
`;

const rows = RAW.trim()
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => {
    const [id, name, nameJa, country, countryFlag, timezone] = line.split("|");
    return { id, name, nameJa, country, countryFlag, timezone };
  });

const seenIds = new Set();
const seenKeys = new Set();
const catalog = [];

for (const row of rows) {
  if (seenIds.has(row.id) || seenKeys.has(`${row.name}|${row.timezone}`)) continue;
  seenIds.add(row.id);
  seenKeys.add(`${row.name}|${row.timezone}`);
  catalog.push(row);
}

catalog.sort((a, b) => a.name.localeCompare(b.name));

const outPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/data/citiesCatalog.json");
writeFileSync(outPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Wrote ${catalog.length} cities to ${outPath}`);

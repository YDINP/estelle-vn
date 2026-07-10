# ILLUST-SPEC — 일러스트 제작 명세 (대개편)

> 정본: PRD-story-overhaul.md · characters.ts · cgs.ts · skeleton-*.md.
> 목적: 30화 멀티엔딩·7대죄 대개편에 맞춘 **신규 일러스트 전량**의 제작 사양·구도·배경·프롬프트.
> 기존 아트는 `art-backup/`(char 535장 + cg 26장, gitignore)와 **git 히스토리**에 보존됨.
> 생성 모델 권장: `nano-banana-pro`(초상·CG). i2i 보정: `gpt-image-2-i2i`. 표정 배리에이션은 캐릭터 시트 i2i로 일관성 유지.

---

## 0. 공통 규격

### 0.1 아트 톤 (전 일러 공통)
- **로판(로맨스 판타지) 오토메 비주얼노벨 일러** — 세미리얼 아니메, 부드러운 페인터리 채색.
- 유럽풍 로코코 판타지 세계관(아르덴 제국). 게임 UI 팔레트와 조화: **다크브라운 가죽 · 금장(gold) · 로즈핑크** 포인트. 차가운 형광색 지양.
- 조명: 부드러운 역광/림라이트, 얼굴에 따뜻한 하이라이트. 감정에 따라 명암 대비 조절.
- 화풍 앵커(영문, 모든 프롬프트 앞에 공통 삽입):
  `Korean romance-fantasy (romfan) otome visual-novel illustration, semi-realistic anime style, soft painterly rendering, ornate rococo European fantasy costume, warm dark-brown/gold/rose color harmony, delicate rim lighting, highly detailed, official character-art quality, 8k`
- 네거티브(공통): `lowres, bad anatomy, extra fingers, deformed hands, watermark, text, signature, modern clothing, cartoonish, chibi, harsh neon`

### 0.2 캐릭터 초상 (portrait) 규격
- **투명 배경 PNG** 2세트. 게임이 대사창/홈/CG 위에 얹으므로 배경 없음.
  - 전신: `{emotion}.png` — 약 **925 × 1700**, 인물 중앙, 발끝~머리끝, 하단은 CSS 페이드.
  - 상반신: `bust_{emotion}.png` — 약 **640 × 1025**(전신에서 머리끝~허리 크롭 규격). 종횡비 0.626.
- 카메라: 정면~살짝 3/4, 눈높이. 시선은 정면(플레이어)을 향함.
- **동일 인물·의상·헤어 고정**, 표정만 16종 변주(§0.4). 포즈 큰 변화 없이 얼굴·손짓 위주.
- 경로: `public/char/{id}/`.

### 0.3 이벤트 CG 규격
- **배경 포함 풀 일러 JPG**. 세로 VN 프레임 기준 약 **1200 × 1600**(또는 상황에 맞는 비율).
- 인물 1~3명 + 배경 + 조명 연출. 스토리 절정 장면.
- 경로: `public/cg/{id}/{file}.jpg` (cgs.ts의 `char`=신 id, `file`=파일명과 일치).

### 0.4 표정 16종 (전 캐릭터 공유 변주)
| 키 | 라벨 | 연출 지시(영문 modifier) |
|---|---|---|
| neutral | 무표정 | calm neutral expression, relaxed mouth, steady eyes |
| soft | 온화한 미소 | gentle soft smile, warm half-lidded eyes |
| happy | 기쁨 | bright genuine smile, sparkling eyes |
| laugh | 웃음 | laughing, eyes closed/curved, open smile |
| shy | 수줍음 | shy blush, averted eyes, slight bite of lip |
| serious | 진지함 | serious focused gaze, firm mouth, subtle frown |
| determined | 결의 | determined resolute stare, clenched jaw, brave |
| surprised | 놀람 | wide surprised eyes, slightly open mouth, raised brows |
| sad | 슬픔 | downcast sorrowful eyes, faint frown, melancholy |
| distressed | 괴로움 | pained anguished expression, brows knit, tension |
| tearful | 눈물 | tears welling/streaming, trembling lips, glossy eyes |
| angry | 분노 | angry glare, furrowed brows, tense mouth |
| smirk | 조소 | sly smirk, one brow raised, knowing half-smile |
| scheme | 계략 | scheming cunning look, shadowed eyes, faint cruel smile |
| embarrassed | 당황 | flustered embarrassed blush, uneasy eyes, awkward |
| cold | 냉담 | cold indifferent expression, distant eyes, flat mouth |

> 제작 순서 권장: **soft(기준 표정)로 캐릭터 시트 확정 → i2i로 나머지 15종 표정 파생**(의상·헤어·조명 고정).

---

## 1. 캐릭터 초상 시트 (8인 + 실루엣 2)

> 각 시트: 외형 → 의상(죄·지위 반영) → 구도 → **Base Prompt**(soft 기준, 표정만 §0.4로 교체). 색상 = characters.ts 테마색.

### 1.1 릴리아 (id: `lilia`) — 하이델 공작영애 · 거울/희생 · 테마 #ffdf9e
- **외형**: 20대 초, 물결치는 **금발** 롱헤어(반묶음, 꽃·리본 장식), **맑은 블루 아이**, 흰 피부, 단아·기품.
- **의상**: 세이지그린+크림 로코코 드레스, 금사 자수, 초커에 에메랄드. 봄·볕의 상징. 화려하되 절제.
- **구도**: 손끝을 턱 근처에 살짝, 정면 3/4. 온화하지만 어딘가 그림자 진 눈(스러질 봄을 아는).
- **Base Prompt**:
  `{공통앵커}, a graceful young duchess, long wavy golden-blonde hair with braided half-updo and small flower hair ornament, clear blue eyes, fair skin, elegant sage-green and cream rococo gown with gold embroidery, emerald choker, gentle soft smile, warm half-lidded eyes, spring-noble aura, transparent background, full body, standing`
- **표정 비고**: sad/tearful 비중 큼(누명·봄). determined는 "봄을 지키는" 의지.

### 1.2 마리온 (id: `marion`) — 발루아 후작영애 · 탐욕/Mammon · 테마 #ff96a6
- **외형**: 20대 중, 짙은 **와인빛 적발**(우아한 업스타일, 보석 핀), 붉은 눈매, 매혹적·오만한 화려함.
- **의상**: **크림슨~와인 고딕글램 드레스**, 검정 레이스, 과한 금장식·루비, 붉은 장미 코사지, 부채. "가장 높은 계단"의 사교계 여왕. 대중 로판 악덕영애 톤(단, '악녀' 직접 묘사 지양—우아·화려로).
- **구도**: 부채를 반쯤 편 채 내려다보는 시선, 도도한 3/4. 가면 뒤 피로가 눈가에 스미는 결.
- **Base Prompt**:
  `{공통앵커}, a glamorous haughty marchioness, deep wine-red hair in an elegant jeweled updo, sharp crimson eyes, opulent crimson-and-wine gothic-glam ball gown with black lace and heavy gold-and-ruby ornaments, red rose corsage, holding a folded lace fan, sly confident smirk, high-society queen aura, transparent background, full body, standing`
- **표정 비고**: smirk/scheme(가면) ↔ sad/tearful(민낯) 갭이 핵심. 두 결을 뚜렷이.

### 1.3 벨리안 (id: `belian`) — 제1황태자 · 식탐(가문 포식)/Beelzebub · 테마 #e8a06d
- **외형**: 20대 중, 빛나는 **금발**(살짝 흐트러진 우아함), 앰버/골드빛 눈, 위험한 미소의 미남.
- **의상**: 와인+금 제국 황태자 예복, 견장·망토, 태양·왕관 모티프 자수. 여유롭되 포식자다운 위압.
- **구도**: 난간에 팔을 걸치거나 잔을 기울인 자세, 내려다보는 조소. '삼키는 태양'의 오만.
- **Base Prompt**:
  `{공통앵커}, a dangerously charming crown prince, radiant golden-blonde hair slightly tousled, amber-gold eyes, wine-and-gold imperial royal coat with epaulettes and sun/crown-motif embroidery and cape, tilting a goblet, arrogant knowing smirk, predatory regal aura, transparent background, full body, standing`
- **표정 비고**: smirk 기본. distressed/sad는 "웃음 아래의 허기". angry는 냉정한 태양의 칼날.

### 1.4 벨포르 (id: `belfor`) — 근위대 부단장 · 나태(acedia)/Belphegor · 테마 #cfe0f5
- **외형**: 20대 후, 단정한 **백금발** 숏컷, 회청색 눈, 평민 출신의 강직한 미남, 옅은 흉터.
- **의상**: 은빛 근위대 갑주(제국 문장), 남색 견장, 허리에 검. 손엔 금 간 낡은 목검(첫 검) 소품 옵션.
- **구도**: 부동자세 경례 or 검집에 손. 명령과 양심 사이 굳은 표정.
- **Base Prompt**:
  `{공통앵커}, a principled commoner-born guard vice-captain, neat platinum-blonde short hair, blue-grey eyes, faint scar, silver imperial guard armor with navy epaulettes and crest, sword at hip, upright disciplined posture, serious focused gaze, transparent background, full body, standing`
- **표정 비고**: serious/neutral 기본. distressed(양심 흔들림), tearful(꺾인 검).

### 1.5 레이먼 (id: `reimon`) — 기사단장·북부대공 · 분노/Amon · 테마 #b9c9dd
- **외형**: 30대 초, **블루그레이** 헤어(묶음), 서늘한 회색 눈, 과묵한 북방 무인, 굳은 이목구비.
- **의상**: 짙은 은빛+검정 북부 갑주, 늑대 문장, 모피 망토, 장검. 황실·북부 이중 문장.
- **구도**: 검을 짚거나 팔짱, 최소한의 움직임. 침묵의 무게가 실린 냉정.
- **Base Prompt**:
  `{공통앵커}, a stern northern grand-duke knight-commander, blue-grey tied-back hair, cold grey eyes, chiseled stoic face, dark silver-and-black northern plate armor with wolf crest and fur-lined cloak, resting hand on a longsword, minimal terse posture, cold indifferent expression, transparent background, full body, standing`
- **표정 비고**: cold/neutral 기본. angry는 벨 곳 잃은 검의 분노. soft 극히 드물게.

### 1.6 루시엔 (id: `lucienne`) — 후작영애·흰 백합 · 교만/Lucifer · 테마 #bfe3ea
- **외형**: 20대 중, **은백발** 롱헤어(완벽한 세팅), 아이스블루 눈, 얼음처럼 완전한 미모, 흠 없는 자세.
- **의상**: **순백~아이스블루 드레스**, 은사 자수, 백합 장식, 진주. 완벽주의의 갑옷 같은 예복.
- **구도**: 완벽하게 곧은 자세, 자수틀 or 백합 소품. 미세한 균열도 없는 냉정(붕괴 시 흐트러진 변주).
- **Base Prompt**:
  `{공통앵커}, a flawless perfectionist marchioness "white lily", long silver-white hair impeccably styled, ice-blue eyes, porcelain skin, pristine white and ice-blue gown with silver embroidery, lily and pearl ornaments, perfectly upright poised posture, calm neutral expression, cold immaculate aura, transparent background, full body, standing`
- **표정 비고**: neutral/cold 기본(완벽). distressed/tearful는 '끊긴 문장=붕괴' 신호(머리·옷 흐트러짐 포함).

### 1.7 리비아 (id: `livia`) — 하이델 서녀 · 시기/Leviathan · 테마 #f2cfa6
- **외형**: 10대 후, 수수한 **갈색 머리**(대충 묶음), 옅은 갈색 눈, 그늘에서 자란 창백함, 조심스러운 눈빛.
- **의상**: 낡고 소박한 회갈색 원피스(본채 화려함과 대비), 소맷단 헤짐. 손엔 손때 묻은 책 or 들꽃 다발.
- **구도**: 몸을 살짝 웅크리거나 문틈으로 내다보는, 경계 반 호기심 반. 소녀다운 작은 체구.
- **Base Prompt**:
  `{공통앵커}, a shy illegitimate noble girl raised in the shadows, plain brown hair loosely tied, light brown eyes, pale skin, simple worn grey-brown dress with frayed cuffs, holding a well-worn book or bundle of wildflowers, slightly guarded curious posture, quiet reserved expression, transparent background, full body, standing`
- **표정 비고**: neutral/shy 기본. happy(이름 불릴 때), tearful(지워지는 밤), scheme는 옅게(시기).

### 1.8 아젤 (id: `azael`) — 신성왕국 성기사 · 색욕→타락한 사제/Asmodeus · 테마 #ece5cf
- **외형**: 20대 후, **은/아이보리** 헤어(단정), 옅은 금빛 눈, 이국적 성기사, 신성하되 억눌린 갈망이 스민.
- **의상**: 백은+아이보리 성기사 갑주 위 사제 예복, 빛·문장 자수, 봉랍 인장·기록함 소품. 타락 분기용: 문장 뜯긴 갑주·흐트러진 예복 변주.
- **구도**: 봉랍을 든 손 or 기도 자세, 정중한 격식. 빛과 미혹이 얼굴 좌우로 갈리는 명암.
- **Base Prompt**:
  `{공통앵커}, a foreign holy-kingdom paladin-priest, neat silver-ivory hair, pale golden eyes, exotic refined features, white-silver holy armor beneath a ceremonial priest robe with light/emblem embroidery, holding a wax seal and record box, dignified formal posture, half his face in warm light and half in shadow, serene yet subtly restrained expression, transparent background, full body, standing`
- **표정 비고**: neutral/serious(격식) 기본. distressed(미혹의 흔들림), 타락 분기 전용: 어두운 smirk·흐트러진 예복.

### 1.9 메피안 (id: `mephian`) — 재상·배후 각본가 (실루엣)
- **외형**: 60대 노신사, 회백 머리·수염 단정, 부드러운 미소(그러나 눈은 웃지 않음). 게임에선 **검은 실루엣**(CSS 필터)로 표시되나 원화는 디테일 있게 그림(추후 정체 공개 대비).
- **의상**: 회색+금장 재상 예복, 인장 반지, 홀(笏) 옵션. 손짓이 부드러운 협박.
- **Base Prompt**:
  `{공통앵커}, a soft-spoken elderly imperial chancellor, neat grey hair and beard, gentle smile with cold unsmiling eyes, grey-and-gold chancellor robe, signet ring, one hand extended in a courteous gesture, silhouette-ready high-contrast lighting, transparent background, full body, standing`
- **비고**: 게임 표시는 실루엣 1종(bust_soft)만 필요, 표정 세트 불요. 원화는 보존용.

### 1.10 약혼자 (id: `fiance`) — 무명 정략 약혼자 (실루엣)
- **외형**: 20대 후 귀족 남성, 얼굴은 그림자로 가림(무명·감시자). 게임 실루엣.
- **의상**: 어두운 남색 귀족 정장, 재상부 봉랍 반지.
- **Base Prompt**:
  `{공통앵커}, an unnamed young nobleman conspirator, face obscured in shadow, dark navy noble formal attire, chancellery signet ring, cold detached posture, silhouette-ready lighting, transparent background, full body, standing`
- **비고**: 실루엣 1종만.

---

## 2. 이벤트 CG — 신 30화 스토리 기준

> 우선순위: **A) 프롤로그 8종**(각 루트 1회차 죄 파멸) → **B) 1막 핵심 8×5**(현재 배선분) → **C) 엔딩 24종**(GOOD/BAD/TRUE).
> cgs.ts 매핑: `char`=신 id, `file`=아래 파일명. 신 에피소드 id에 `unlockEp` 재배선 필요(현재는 구 id).

### 2.A 프롤로그 CG (8종) — "죄에 삼켜진 1회차"
| id.file | 루트 | 장면 (캐릭터·구도·배경·조명) | Prompt(요지) |
|---|---|---|---|
| `lilia/prologue_tower` | 릴리아 | 세 번째 누명 재판정→탑 유폐. 높고 좁은 탑 창가에 시든 릴리아, 창밖 지는 봄. 등진 방청석. 차가운 회청 톤. | dying blonde duchess by a narrow tower window, wilting spring outside, cold blue tones, backs of a courtroom crowd turned away, tragic |
| `marion/prologue_exile` | 마리온 | 커튼콜 없는 퇴장. 문장 지워진 마차, 성에 낀 창에 숫자를 적는 마리온, 국경 검문소 어둠. 배웅 없음. | red-haired lady in a crestless carriage, writing numbers on a frosted window, dark border checkpoint, no one to see her off, lonely |
| `belian/prologue_swallowed` | 벨리안 | 삼켜진 태양. 대관 홀 금빛, 독배를 삼킨 뒤 웃음이 지워지는 황제, 옥좌 위 왕관을 얹는 재상의 손. | golden coronation hall, emperor who just drank the poisoned chalice, smile fading from his face, chancellor's hand placing a crown, gilded doom |
| `belfor/prologue_broken_sword` | 벨포르 | 스스로 꺾은 검. 빗속 연병장, 무릎에 검을 대고 부러뜨리는 부단장, 발치에 젖은 명령서·훈장. | knight in rain breaking his own sword over his knee, wet order-document and medal at his feet, empty drill yard, grief |
| `reimon/prologue_snow_oath` | 레이먼 | 두 맹세에 버림받은 검. 눈 내리는 연무장, 검을 눈밭에 꽂고 홀로 선 북부대공, 어깨에 쌓이는 눈. | northern knight alone in falling snow, sword thrust into the snow, snow piling on his shoulders, isolated, cold blue-white |
| `lucienne/prologue_broken_vow` | 루시엔 | 완벽의 붕괴. 서약식 단상, 만인 앞 한가운데서 끊긴 문장에 얼어붙은 흰 백합, 떨리는 손끝. | white-lily marchioness frozen mid-sentence on a vow-ceremony dais, trembling fingertip, a hall of staring nobles, shattered perfection |
| `livia/prologue_erased` | 리비아 | 지워진 이름. 무너지는 본채 불빛을 등진 별채 창가의 소녀, 종이에 제 이름을 적음, 꺼지는 마지막 등불. | girl at a cottage window, distant burning manor light, writing her own name on paper, last lamp going out, erased-into-darkness |
| `azael/prologue_sold_light` | 아젤 | 빛을 판 새벽. 국경 이정표 아래, 문장 뜯긴 백은 갑주·빈 기록함의 타락한 사제. 잿빛 새벽. | fallen paladin at a border marker, crest torn from silver armor, empty record box, ashen dawn, disgraced holy figure |

### 2.B 1막 핵심 CG (루트당 대표 1~2종, 현재 배선분 기준)
> 각 화 콜드오픈/엔드훅 절정. 파일명 규약 `{id}/{scene}`.
- **릴리아**: `lilia/study_shadow`(2화 서재의 심는 손·자정 어둠) · `lilia/faceless_portrait`(10화 초상 속 반지 폭로).
- **마리온**: `marion/debt_candle`(1화 촛불에 그을리는 차용증) · `marion/dressing_room`(3화 가면 벗는 대기실).
- **벨리안**: `belian/devouring_court`(3화 몰락 가문을 삼키는 알현) · `belian/thrice_cup`(4화 세 번 바뀐 잔·시종장 손).
- **벨포르**: `belfor/dawn_duel`(1화 귀족 장교와 3합) · `belfor/silent_hand`(2화 검집에 머무는 손).
- **레이먼**: `reimon/two_seals`(6화/2화 봉랍 대조) · `reimon/inspection_raid`(4화 감찰 급습·위조 초안).
- **루시엔**: `lucienne/tea_scale`(7화 장미vs백합 다과회) · `lucienne/crooked_stitch`(자수 한 땀).
- **리비아**: `livia/cottage_meet`(8화 별채 첫 대면) · `livia/name_on_paper`(이름 적는 밤).
- **아젤**: `azael/envoy_arrival`(1화 국경 넘어온 증인) · `azael/worship_bait`(2화 숭배의 미끼).

> 프롬프트는 §0 앵커 + "루트 죄 모티프 + 장면 요지 + 인물"로 구성. 예)
> `{앵커}, a masked red-haired lady removing her stage-smile alone in a dim dressing room mirror, exhaustion under the mask, wine-and-gold theatre backstage, melancholy` (marion/dressing_room)

### 2.C 엔딩 CG (24종) — GOOD / BAD / TRUE
루트당 3종. 파일명 `{id}/end_good|end_bad|end_true`.
- **GOOD(구원)**: 죄 극복의 정점. 예 릴리아 `end_good`=봄 정원에서 웃으며 인사 / 벨리안=독 없는 잔으로 웃으며 대관 / 리비아=이름이 불리는 볕.
- **BAD(파멸)**: 프롤로그의 재현(더 어둡게). 프롤로그 CG를 어둡게 변주하거나 별도 컷.
- **TRUE(진실)**: 구원 + 메피안 너머 '제3의 손' 암시(그림자·미회수 떡밥). 전 8루트 GOOD 관통 시 개방.
- 프롬프트: 각 §2.A 프롤로그를 반전(밝음/재생)하거나, skeleton-*.md의 30화 GOOD/BAD/TRUE 요약을 장면화.

---

## 3. 제작·통합 워크플로우
1. **1단계(최우선)**: 8인 `soft` 기준 캐릭터 시트 확정(§1) → i2i로 16표정 파생 → `public/char/{id}/{emotion}.png`·`bust_{emotion}.png` 교체.
2. **2단계**: 프롤로그 CG 8종(§2.A) → `public/cg/{id}/{file}.jpg`.
3. **3단계**: cgs.ts를 **신 스토리 id로 재배선**(현재 구 ep/vep 등 → lip/map/blp… 신 프리픽스 + 신 CG 파일명). 스토리 프로즈에 `CG("...")` 스텝 삽입.
4. **4단계**: 1막 핵심 CG(§2.B) → 이후 2막~ 진행에 맞춰 확장. 엔딩 CG(§2.C)는 6막 배선 시.
5. 각 배치 후 `npm run build` + 부팅 확인. 실루엣(메피안·약혼자)은 원화 보존, 게임은 CSS 필터로 어둡게.

## 4. 우선순위 요약 (제작 발주 순서)
1. **릴리아·마리온·벨리안** 캐릭터 시트+16표정 (메인·2막 진행 루트)
2. 나머지 5인 캐릭터 시트+16표정
3. 프롤로그 CG 8종
4. 1막 핵심 CG(진행 루트부터)
5. 엔딩 CG(스토리 6막 도달 시)

> 총 물량 개산: 초상 8인 × 16표정 × 2세트 = **256장**(실루엣 2인 각 1장 별도) + CG 프롤로그 8 + 1막 핵심 ~16 + 엔딩 24 = **CG 약 48장**.

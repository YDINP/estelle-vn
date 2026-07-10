# ILLUST-CG-LIST — 상황별 이벤트 CG 리스트 & 프롬프트

> 짝 문서: `ILLUST-SPEC.md`(공통 규격·캐릭터 시트). 이 문서는 **실제 배선된 스토리 장면별 이벤트 CG**를 정리.
> 대상: 8루트 프롤로그+1막(릴리아는 2막까지) 현행 배선분 + 엔딩. 이후 2막~6막 진행 시 같은 형식으로 확장.
> 배선: `cgs.ts`에 `{ id, char:"{신id}", title, file, unlockEp:"{신 에피소드 id}" }` 추가 → 프로즈에 `CG("cg_id")` 스텝 삽입 → `public/cg/{id}/{file}.jpg`.

## 공통 규약
- **[A] 화풍 앵커**(모든 프롬프트 앞에 삽입):
  `Korean romance-fantasy (romfan) otome visual-novel event CG, semi-realistic anime style, soft painterly rendering, ornate rococo European fantasy, warm dark-brown/gold/rose color harmony, cinematic lighting, highly detailed background, vertical composition ~1200x1600, 8k`
- **네거티브**: `lowres, bad anatomy, deformed hands, extra fingers, watermark, text, signature, modern clothing, chibi`
- **주인공('당신') 비묘사**: 성별·이름·외모 불특정 → CG에 얼굴로 등장 금지. 필요 시 **뒤에서 본 실루엣/손/어깨**까지만. 초점은 상대 캐릭터·장면.
- 캐릭터 외형은 `ILLUST-SPEC.md §1` 시트 고정. 아래 프롬프트는 그 위에 **장면·구도·배경·감정**만 지정.
- CG는 **화당 1컷(절정 장면)** 원칙. `file`은 영문 스네이크케이스.

---

## 1. 릴리아 루트 (id: `lilia`) — 거울/희생 · 프롤로그+1~10화

| id | file | 화·상황 | 프롬프트 (= [A] + 아래) |
|---|---|---|---|
| cg_lip0 | `prologue_tower` | P 봄을 빼앗긴 탑 | dying young blonde-blue duchess seated by a narrow cold tower window, wilting spring blossoms falling outside, backs of a courtroom crowd turned away in the distance, desaturated blue-grey tones, tragic solemn atmosphere |
| cg_lip1 | `spring_garden` | 1화 다시, 정원의 봄 | the same duchess alive and turning under warm sunlight in a blooming spring garden of a grand ducal estate, golden hour, gentle hopeful mood, petals in the breeze |
| cg_lip2 | `study_shadow` | 2화 서재의 그림자 | a dark midnight study, a black-gloved hand placing a wax-sealed letter on a desk by an opened window, moonlight sliver, the duchess watching tensely from the shadows, suspense noir lighting |
| cg_lip3 | `red_rose_tea` | 3화 붉은 장미의 값 | a lavish morning drawing room, a glamorous wine-red-haired lady (Marion) lifting a teacup with a sly smirk, the blonde duchess facing her coolly, tension between two women, rococo interior, gold light |
| cg_lip4 | `fiance_drawer` | 4화 약혼의 그늘 | a dim nobleman's study, the duchess secretly lifting a chancellery signet from a locked box, a shadowed faceless fiancé silhouette approaching the doorway, heartbeat suspense, candlelight |
| cg_lip5 | `corridor_chancellor` | 5화 아는 얼굴, 모르는 눈 | a grand palace corridor, a soft-smiling elderly chancellor (grey-gold robe) pausing before the viewer, at the far end a golden-haired crown prince leaning on a balustrade watching, cold golden light, ominous |
| cg_lip6 | `two_seals` | 6화 두 개의 인장 | a dim backstreet seal-office, two identical wax seals overlaid under lamplight, a stern silver-armored northern knight (Reimon) stepping from the shadows, investigative noir mood |
| cg_lip7 | `rose_lily_tea` | 7화 흰 백합의 초대 | a sunlit afternoon salon tea table, a wine-red-haired lady (Marion) and a flawless silver-white-haired lady (Lucienne) facing each other with polished smiles, rose vs lily rivalry, elegant tension |
| cg_lip8 | `annex_child` | 8화 별채의 아이 | a humble shaded cottage annex, a shy brown-haired girl (Livia) looking up from a worn book, the blonde duchess pausing at the doorway in surprise, a shaft of warm light into the gloom, tender |
| cg_lip9 | `printing_raid` | 9화 흐려지는 책장 | a cramped backstreet printing workshop at night, scattered scandal broadsheets, the duchess arriving too late as sheets scatter, anxious frantic energy, ink and lamplight |
| cg_lip10 | `faceless_portrait` | 10화 얼굴 없는 초상 | a scandalous painting displayed in a ballroom, a "faceless lover" figure whose hand bears a recognizable ring, gasping onlookers, the duchess staring in cold realization, dramatic reveal lighting |

---

## 2. 마리온 루트 (id: `marion`) — 탐욕 · 프롤로그+1~5화

| id | file | 화·상황 | 프롬프트 |
|---|---|---|---|
| cg_map0 | `prologue_exile` | P 커튼콜 없는 퇴장 | a lonely crestless carriage at a dark border checkpoint at night, a wine-red-haired lady writing numbers on a frost-covered window with her fingertip, no one to see her off, cold desolate blue tones |
| cg_map1 | `debt_candle` | 1화 장미의 값 | an incense-heavy chancellery study, the elderly chancellor holding an old promissory note dangerously close to a candle flame, the red-haired lady's composure cracking for an instant, sinister soft light |
| cg_map2 | `moonlit_wall` | 2화 달빛 아래 부채 | a moonlit estate garden wall at night, the red-haired lady atop the wall half-hiding her face behind a lace fan, gazes crossing with someone below, cool silver moonlight, intrigue |
| cg_map3 | `dressing_room` | 3화 무대 위의 미소 | a dim theatre-like dressing room, the red-haired lady wiping off her stage-smile before a mirror, exhaustion beneath the mask, wine-and-gold backstage, melancholy, a quiet brown-haired girl at the door |
| cg_map4 | `red_teatime` | 4화 붉은 티타임 | an elegant high-society tea party, the red-haired lady pouring tea with a subtly trembling hand while trading barbed smiles with the blonde duchess, opulent setting, hidden strain |
| cg_map5 | `cracked_mask` | 5화 금이 간 가면 | a chancellery reception corridor, the red-haired lady doubling over against a pillar after applause, mask slipping; the chancellor emerging with a soft threatening smile, gilded cruelty, rose-and-shadow |

---

## 3. 벨리안 루트 (id: `belian`) — 식탐(가문 포식) · 프롤로그+1~5화

| id | file | 화·상황 | 프롬프트 |
|---|---|---|---|
| cg_blp0 | `prologue_swallowed` | P 삼켜진 태양 | a golden coronation hall, a young golden-haired emperor whose bright smile is fading after drinking a poisoned chalice, the chancellor's hand lowering a crown onto him, gilded doom, warm light curdling to cold |
| cg_blp1 | `corridor_sun` | 1화 다시, 독이 든 축배 | a sunlit west palace corridor, the golden-haired crown prince pouring wine over a flower bed from a goblet instead of drinking, a knowing smirk, predatory ease, warm afternoon light |
| cg_blp2 | `moonlit_chess` | 2화 체스판의 왕 | a moonlit corridor chessboard, the crown prince holding a black king piece with an amused sly look, a silver northern knight passing in the background, cool blue-silver night, quiet tension |
| cg_blp3 | `devouring_court` | 3화 삼키는 태양 | an empty throne hall, an impoverished baron kneeling and offering his house's fortune to the reclining crown prince who accepts with a devouring smile, "eat or be eaten" predatory grandeur, gold shadow |
| cg_blp4 | `thrice_cup` | 4화 마지막 방패 | a long palace banquet table, a chamberlain's trembling hand refilling the prince's goblet (swapped thrice), the prince counting sidelong with a shadowed weary smile, candlelit unease |
| cg_blp5 | `chancellor_counts` | 5화 굶는 태양 | a palace corridor, the soft-smiling chancellor pausing near the viewer while the crown prince watches from balustrade shadow with a cold sharpened gaze, "swallowed alive" dread, cold gold lighting |

---

## 4. 벨포르 루트 (id: `belfor`) — 나태(acedia) · 프롤로그+1~5화

| id | file | 화·상황 | 프롬프트 |
|---|---|---|---|
| cg_bfp0 | `prologue_broken_sword` | P 스스로 꺾은 검 | a rain-soaked guard drill yard at dawn, a silver-armored knight breaking his own sword over his knee, a wet order-document and medal at his feet, grief and rain, desaturated cold |
| cg_bfp1 | `dawn_duel` | 1화 다시, 훈련장의 봄 | a pre-dawn training ground, the platinum-blonde vice-captain halting a wooden sword a hair from an arrogant noble officer's throat, disciplined restraint, misty blue dawn |
| cg_bfp2 | `crime_scene` | 2화 신분의 검 | a ransacked study crime scene, the vice-captain crouched examining a scratched window sill and a drop of wax seal, a cracked old wooden training sword nearby, investigative lamplight |
| cg_bfp3 | `sunset_rampart` | 3화 원칙의 무게 | a sunset rampart above a ball, the vice-captain witnessing a fiancé handing a sealed letter to a chancellery man; on the upper wall a stern northern commander watches in silence, red-gold dusk, moral weight |
| cg_bfp4 | `sealed_order` | 4화 흐려지는 명령서 | a barracks desk at night, an unopened wax-sealed order bearing the chancellery crest, the vice-captain's hand hovering unable to open it, single candle, heavy hesitation |
| cg_bfp5 | `chancellor_blade` | 5화 아는 얼굴, 모르는 눈 | a palace corridor, the chancellor studying the vice-captain's sword (not his face) with a soft smile, at the corridor's end the golden prince eyeing the blade sidelong, cold gold, ominous |

---

## 5. 레이먼 루트 (id: `reimon`) — 분노 · 프롤로그+1~5화

| id | file | 화·상황 | 프롬프트 |
|---|---|---|---|
| cg_rmp0 | `prologue_snow_oath` | P 두 맹세에 버림받은 검 | a northern knight alone in a snowfall-filled drill yard, his sword thrust into the snow, snow piling untouched on his shoulders, isolated betrayal, cold blue-white desolation |
| cg_rmp1 | `training_dawn` | 1화 얼어붙기 전의 검 | a frost-lit drill yard at dawn, the blue-grey-haired commander mid-swing with a wooden sword, precise silent motion, someone watching from beyond the wall, pale cold morning |
| cg_rmp2 | `seal_check` | 2화 연무장의 서리 | a lamplit desk, the commander lifting a sealed letter on his blade-tip, noticing the wax was melted and re-set twice, cold suspicion in his grey eyes, frost and lamp glow |
| cg_rmp3 | `two_crests` | 3화 두 개의 문장 | a windswept rampart between two banners — imperial sun and northern wolf — the commander standing between them, the golden prince strolling up with a teasing smirk, tension of a caged sword |
| cg_rmp4 | `inspection_raid` | 4화 인질에게도 검은 있다 | a sudden inspection bursting into a quarters, an inspector "discovering" a forged treasonous draft in the commander's own hand, the commander's stoic face cracking, harsh torchlight |
| cg_rmp5 | `chancellor_measures` | 5화 표적은 검이 아니다 | a palace corridor, the chancellor measuring the viewer beside the commander with a soft smile; at the corridor end the golden prince watches; the commander's cold gaze like a sword with no target, cold light |

---

## 6. 루시엔 루트 (id: `lucienne`) — 교만 · 프롤로그+1~5화

| id | file | 화·상황 | 프롬프트 |
|---|---|---|---|
| cg_lup0 | `prologue_broken_vow` | P 완벽의 붕괴 | a silver-white-haired marchioness frozen mid-sentence on a vow-ceremony dais, a trembling fingertip, a hall of nobles staring, her flawless composure shattering, cold spotlight, isolation |
| cg_lup1 | `frozen_salon` | 1화 다시, 얼음의 살롱 | a perfectly ordered white-and-ice salon, the marchioness pausing her precise routine as an unexpected guest enters, a lily embroidery hoop on the table, immaculate cold elegance |
| cg_lup2 | `rose_vs_lily` | 2화 장미와 백합 | a sunlit afternoon salon, the wine-red lady (Marion) and the silver-white lady (Lucienne) trading polished barbs across a table, rose vs lily, a half-beat waver in the lily's flawless mask |
| cg_lup3 | `two_cages` | 3화 의제에 없는 이름 | a formal meeting table, the terse northern commander and the perfect marchioness seated as two "flawless prisons" mirroring each other, no romance, cool distant elegance, a familiar wax seal on a letter |
| cg_lup4 | `crooked_stitch` | 4화 완벽이라는 값 | a quiet parlor, the marchioness about to tear out a single crooked stitch on a white-lily embroidery, a hand gently stopping hers, first permitted imperfection, tender cool light |
| cg_lup5 | `perfect_silence` | 5화 앞당겨진 그림 | a palace corridor, the chancellor speaking of the lily's "perfect silence" with a soft smile, an invitation with wet ink in the viewer's hand, cold realization, ice-blue and gold |

---

## 7. 리비아 루트 (id: `livia`) — 시기 · 프롤로그+1~5화

| id | file | 화·상황 | 프롬프트 |
|---|---|---|---|
| cg_lvp0 | `prologue_erased` | P 지워진 이름 | a girl at a cottage-annex window, backlit by a distant burning manor, writing her own name on a scrap of paper as the last lamp gutters out, being erased into darkness, sorrowful cold |
| cg_lvp1 | `annex_spring` | 1화 다시, 별채의 봄 | a sunlit neglected back-garden annex, a shy brown-haired girl looking up startled as someone speaks her name for the first time, a shaft of warm light, fragile wonder |
| cg_lvp2 | `wildflowers` | 2화 별채의 손님 | the annex interior stacked with worn books, the girl binding a bundle of nameless wildflowers, half-opening the door to a returning visitor, quiet warmth breaking her guard |
| cg_lvp3 | `wall_ghost` | 3화 담을 넘는 유령 | a night estate wall, the girl slipping over a cracked gap she knows well, a grey-robed elderly chancellor passing below and noticing the "nameless" girl for the first time, dangerous chill |
| cg_lvp4 | `two_sisters` | 4화 두 언니 사이 | a theatre dressing room, the girl beside the mask-off red-haired lady (Marion), the chancellor lingering in the corridor measuring the "nameless flower", shadow and warm lamp contrast |
| cg_lvp5 | `nameless_flower` | 5화 이름 없는 꽃 | a night cottage window, the girl gazing at the darkness outside, a chancellery document nearby bearing the words "Heidel bastard daughter" for the first time, cold dread creeping into a small warm room |

---

## 8. 아젤 루트 (id: `azael`) — 색욕→타락한 사제 · 프롤로그+1~5화

| id | file | 화·상황 | 프롬프트 |
|---|---|---|---|
| cg_azp0 | `prologue_sold_light` | P 빛을 판 새벽 | a fallen silver-ivory paladin-priest at a border marker at ashen dawn, the crest torn from his silver armor, an empty record box, disgraced and adrift, cold grey light, holy fall |
| cg_azp1 | `envoy_arrival` | 1화 국경을 넘어온 증인 | the untarnished silver paladin-priest arriving before an envoy hall, an intact wax-sealed record box under his arm, curious foreign onlookers, dignified stranger, cool ivory light |
| cg_azp2 | `worship_bait` | 2화 잿빛 예복의 초대 | a chancellery parlor thick with incense, the chancellor offering not gold but a "living saint's seat" — adoration — as bait; the priest's answer delayed a beat, tempting shadow, ivory and gold |
| cg_azp3 | `sealed_answer` | 3화 팔리지 않는 것 | an envoy candlelit desk, the priest sealing his records with hot wax, his hand lingering a beat over a warmth he refused, restrained hunger under serenity, warm candle glow and shadow |
| cg_azp4 | `three_oaths` | 4화 세 개의 맹세, 하나의 굶주림 | a small foreign chapel, the priest kneeling before an altar reciting three oaths, half his face in warm light and half in shadow, a nameless hunger beneath the holy calm, exotic candlelight |
| cg_azp5 | `poisoned_seal` | 5화 성인의 값 | a palace corridor with an incense censer, the chancellor smiling that "a fallen witness's seal turns lies to truth", the priest closing his eyes at a hauntingly familiar scent, temptation dread, gold-shadow |

---

## 9. 엔딩 CG (24종) — 루트별 GOOD / BAD / TRUE
> 파일 `{id}/end_good` · `{id}/end_bad` · `{id}/end_true`. BAD는 각 프롤로그를 더 어둡게 변주(프롤로그 재현). TRUE는 GOOD + '제3의 손'(메피안 너머) 그림자 암시.

| 루트 | GOOD (죄 극복) | BAD (죄에 삼켜짐 = 프롤로그 재현) | TRUE (구원 + 떡밥) |
|---|---|---|---|
| 릴리아 | 봄 정원에서 웃으며 인사하는 블론드 공작영애, 만개한 봄, 따뜻한 금빛 재생 | 프롤로그 탑, 이번엔 창밖에서 지켜보는 시점, 더 짙은 절망 | GOOD 장면 + 정원 그늘에 드리운 정체 모를 그림자(메피안 너머) |
| 마리온 | 계단이 아닌 제 이름으로 서는 붉은 장미, 가면을 벗은 자유로운 미소 | 커튼콜 없는 국경 마차 재현, 더 차가운 겨울 | GOOD + 어둠 속 미회수 손(빚 너머의 진짜 채권자) |
| 벨리안 | 독 없는 잔으로 웃으며 대관하는 황제, 웃음이 지워지지 않는 밤 | 삼켜진 태양(꼭두각시 황제) 재현, 옥좌 아래서 지켜보는 시점 | GOOD + 왕관 그림자 뒤의 더 큰 아가리 암시 |
| 벨포르 | 지킬 것을 스스로 고른 검을 든 기사, 부러지지 않은 검, 새벽빛 | 빗속 꺾인 검 재현, 더 짙은 회한 | GOOD + 명령서 배후의 또 다른 서명 그림자 |
| 레이먼 | 두 맹세를 화해시키고 북으로 향하는 검, 눈 녹는 길, 따뜻한 은빛 | 눈밭의 고립된 검 재현 | GOOD + 북부 겨울 너머의 낯선 그림자 |
| 루시엔 | 스스로 고른 미완성(끊긴 문장)을 웃으며 받아들이는 백합, 흐트러진 자유 | 완벽의 붕괴(서약식) 재현, 더 차가운 매장 | GOOD + 완벽의 감옥을 설계한 손의 잔영 |
| 리비아 | 볕 아래 세 번 불리는 이름, 자매의 화해, 따뜻한 봄볕 | 지워진 이름(꺼지는 등불) 재현 | GOOD + 이름을 지운 기록부 뒤의 그림자 |
| 아젤 | 세 맹세를 되찾아 국경을 넘는 빛의 사제, 맑은 새벽 | 빛을 판 타락 사제 재현, 더 짙은 잿빛 | GOOD + 미혹을 설계한 향로 너머의 손 |

> 엔딩 프롬프트 = [A] + 위 장면 + 해당 캐릭터 시트. 예)
> `[A], a blonde-blue duchess greeting warmly with a genuine smile in a fully bloomed spring garden, golden restorative light, closure and renewal` (lilia/end_good)

---

## 10. 배선 체크리스트 (CG 추가 시)
1. `public/cg/{id}/{file}.jpg` 저장(위 file명).
2. `cgs.ts`에 `{ id:"cg_xxx", char:"{id}", title:"…", file:"{file}", unlockEp:"{신 에피소드 id}" }` 추가. ⚠️ id 프리픽스 고유(충돌 금지), `char`=신 id, `unlockEp`=신 에피소드 id(lip0·map1…).
3. 프로즈 스텝에 절정 위치로 `CG("cg_xxx")` (필요 시 `CGX()` 로 포트레이트 복귀) 삽입.
4. `npm run build` + 부팅 확인. 도감(수집)에서 해금·표시 확인.

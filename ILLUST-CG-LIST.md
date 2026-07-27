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
- **각 CG 행 읽는 법**: `등장` = 그 컷에 나오는 캐릭터(당신=POV 비묘사). `상황` = 스토리 맥락(무슨 일). `프롬프트` = [A] + 아래 영문.
- **인물 외형 태그**(프롬프트에서 캐릭터 지칭 시 사용, 시트와 일치):
  릴리아=`blonde-blue duchess` / 마리온=`wine-red-haired lady (Marion)` / 벨리안=`golden-haired crown prince` / 벨포르=`platinum-blonde vice-captain` / 레이먼=`blue-grey-haired northern commander` / 루시엔=`silver-white-haired marchioness` / 리비아=`shy brown-haired girl` / 아젤=`silver-ivory paladin-priest` / 메피안=`soft-smiling elderly chancellor` / 약혼자=`shadowed faceless nobleman`.

---

## 1. 릴리아 루트 (id: `lilia`) — 거울/희생 · 프롤로그+1~10화

| id | file | 화·상황(무슨 일) | 등장 캐릭터 | 프롬프트 (= [A] + 아래) |
|---|---|---|---|---|
| cg_lip0 | `prologue_tower` | P — 1회차 결말. 세 번째 누명으로 탑에 유폐된 릴리아가 창밖 지는 봄을 세며 시듦(죄에 삼켜진 봄) | 릴리아 | dying blonde-blue duchess (Lilia) seated by a narrow cold tower window, wilting spring blossoms falling outside, backs of a courtroom crowd turned away in the distance, desaturated blue-grey tones, tragic solemn |
| cg_lip1 | `spring_garden` | 1화 — 회귀 후, 아직 살아 있는 봄의 릴리아와 첫 대면(당신 시점) | 릴리아 (+당신 POV) | the blonde-blue duchess (Lilia) alive, turning under warm sunlight in a blooming spring garden of a grand ducal estate, golden hour, gentle hopeful mood, petals in the breeze |
| cg_lip2 | `study_shadow` | 2화 — 자정 서재, 검은 장갑의 심부름꾼이 밀서를 '두고' 감. 담장 위엔 마리온 실루엣 | (심부름꾼 손) + 릴리아 + 담장 위 마리온 실루엣 | a dark midnight study, a black-gloved courier's hand placing a wax-sealed letter on a desk by an open window, the blonde duchess (Lilia) watching tensely from shadow, a fan-hiding lady's silhouette atop the outer wall, suspense noir |
| cg_lip3 | `red_rose_tea` | 3화 — 다음 날, 밀서를 심은 붉은 장미 마리온이 태연히 응접실에 앉아 릴리아와 대치 | 마리온 + 릴리아 | the wine-red-haired lady (Marion) lifting a teacup with a sly smirk in a lavish drawing room, the blonde duchess (Lilia) facing her coldly, tension between two women, rococo interior, gold light |
| cg_lip4 | `fiance_drawer` | 4화 — 약혼자 방 잠입. 잠긴 함에서 재상부 인장을 초로 뜨는데 문고리가 돌아감 | (당신 손) + 약혼자 실루엣 | a dim nobleman's study, a hand pressing a chancellery signet into candle-wax, a shadowed faceless fiancé silhouette appearing at the doorway, heartbeat suspense, candlelight |
| cg_lip5 | `corridor_chancellor` | 5화[막①] — 궁 회랑에서 재상 메피안이 처음 당신을 '셈'. 회랑 끝엔 태양 벨리안 | 메피안 + (회랑 끝) 벨리안 + 당신 POV | a grand palace corridor, the soft-smiling elderly chancellor (Mephian, grey-gold robe) pausing before the viewer, at the far end the golden-haired crown prince (Belian) leaning on a balustrade watching, cold golden light, ominous |
| cg_lip6 | `two_seals` | 6화 — 검인청 뒷골목, 릴리아 밀서·레이먼 위조편지의 봉랍이 동일함을 대조. 레이먼 등장 | 릴리아 + 레이먼 | a dim backstreet seal-office, two identical wax seals overlaid under lamplight, the stern blue-grey-haired northern commander (Reimon) stepping from shadow, the blonde duchess comparing them, investigative noir |
| cg_lip7 | `rose_lily_tea` | 7화 — 다과회에서 붉은 장미 마리온과 흰 백합 루시엔이 저울에 오름 | 마리온 + 루시엔 | a sunlit afternoon salon tea table, the wine-red lady (Marion) and the flawless silver-white lady (Lucienne) trading polished smiles across the table, rose vs lily rivalry, elegant tension |
| cg_lip8 | `annex_child` | 8화 — 하이델 별채에서 릴리아가 이복동생 서녀 리비아를 처음 대면 | 리비아 + 릴리아 | a humble shaded cottage annex, the shy brown-haired girl (Livia) looking up from a worn book, the blonde duchess (Lilia) pausing at the doorway in surprise, a shaft of warm light into gloom, tender |
| cg_lip9 | `printing_raid` | 9화 — 회귀 지식이 흐려지는 사이 초상화 스캔들 조기 발발. 인쇄소를 반 발 늦게 덮침 | (당신 POV) | a cramped backstreet printing workshop at night, scattered scandal broadsheets being carried out, the scene of arriving too late, anxious frantic energy, ink and lamplight |
| cg_lip10 | `faceless_portrait` | 10화[막②] — 초상 속 '얼굴 없는 연인'의 손 반지가 릴리아 약혼자 것으로 밝혀짐 | 릴리아 (초상화 속 약혼자 손) | a scandalous painting in a ballroom showing a "faceless lover" whose hand bears a recognizable ring, gasping onlookers, the blonde duchess (Lilia) staring in cold realization, dramatic reveal lighting |

---

## 2. 마리온 루트 (id: `marion`) — 탐욕 · 프롤로그+1~5화

| id | file | 화·상황(무슨 일) | 등장 캐릭터 | 프롬프트 |
|---|---|---|---|---|
| cg_map0 | `prologue_exile` | P — 1회차 결말. 쓸모 다한 마리온이 죄 뒤집어쓰고 배웅 없는 국경 밖으로 추방(정점→추락) | 마리온 | a lonely crestless carriage at a dark border checkpoint at night, the wine-red-haired lady (Marion) writing numbers on a frost-covered window with her fingertip, no one to see her off, cold desolate blue |
| cg_map1 | `debt_candle` | 1화 — 재상부 서재, 메피안이 마리온 가문의 차용증을 촛불에 그을리며 낯빛을 시험 | 메피안 + 마리온 | an incense-heavy chancellery study, the elderly chancellor (Mephian) holding an old promissory note dangerously close to a candle flame, the wine-red lady's (Marion) composure cracking for an instant, sinister soft light |
| cg_map2 | `moonlit_wall` | 2화 — 보름밤, 마리온이 사내를 앞세워 하이델 담장 밖에 서서 부채로 얼굴을 반쯤 가림 | 마리온 (+담장 위) | a moonlit estate garden wall at night, the wine-red lady (Marion) atop the wall half-hiding her face behind a lace fan, gazes crossing with someone below, cool silver moonlight, intrigue |
| cg_map3 | `dressing_room` | 3화 — 무대를 끝낸 마리온이 대기실 거울 앞에서 가면(독설)을 지움. 문가엔 리비아 | 마리온 + (문가) 리비아 | a dim theatre-like dressing room, the wine-red lady (Marion) wiping off her stage-smile before a mirror, exhaustion beneath the mask, the shy brown-haired girl (Livia) at the door, wine-and-gold backstage, melancholy |
| cg_map4 | `red_teatime` | 4화 — 티타임, 마리온이 릴리아와 독설을 주고받으며 찻주전자를 든 손끝이 미세히 떨림 | 마리온 + 릴리아 | an elegant high-society tea party, the wine-red lady (Marion) pouring tea with a subtly trembling hand while trading barbed smiles with the blonde duchess (Lilia), opulent setting, hidden strain |
| cg_map5 | `cracked_mask` | 5화[막①] — 연회 뒤 회랑에서 마리온이 헛구역질. 메피안이 나와 벗 리비아를 저울에 올림 | 마리온 + 메피안 | a chancellery reception corridor, the wine-red lady (Marion) doubling over against a pillar after applause, mask slipping; the chancellor (Mephian) emerging with a soft threatening smile, gilded cruelty, rose-and-shadow |

### 2막 이후 (6~30화, 30화 체계) — `story/cg-manifest-marion.json` 병합(2026-07-27)

> ⚠️ 아래 항목은 `cgs.ts`에 이미 등재됐으나 **`public/cg/marion/` 아트 파일은 아직 없음**(다음 단계 이미지 생성 대상).

| id | file | 화·상황(무슨 일) | 등장 캐릭터 | 프롬프트 |
|---|---|---|---|---|
| cg_map12 | `faceless_portrait_ring` | 12화[3막] — 왕궁 화랑, 얼굴 없는 연인 초상 왼손 약지에 발루아 인장 반지. 소문을 팔던 자가 소문 한복판에 섬 | 마리온 + 릴리아 + 군중 | a grand palace picture gallery, a large scandalous oil portrait of a faceless lover, the faceless man's left ring finger bearing a rose-stemmed signet ring, the wine-red-haired lady (Marion) standing frozen before it with her lace fan half-lowered, the blonde-blue duchess (Lilia) beside her staring coldly, hundreds of turned faces behind them, gilded gallery, harsh chandelier light |
| cg_map15 | `debt_notice_candle` | 15화[막③·배드게이트①] — 재상부 서재. 독촉장·증언인 백지가 촛불 앞에 나란히, 메피안이 벗의 이름을 값으로 제시 | 마리온 + 메피안 | a dim incense-heavy chancellery study at night, a red-sealed debt notice curling in flame beside a blank sworn-testimony sheet, the elderly chancellor (Mephian) pushing the blank sheet forward, the wine-red-haired lady (Marion) staring at a quill she cannot pick up, mask cracked into anguish |
| cg_map18 | `forged_ledger` | 18화[4막] — 발루아 서고, 필체 세 장 대조로 숫자 칠의 위조 확인 | 마리온 + (당신 손) | a long-sealed dusty family library, three sheets of handwriting compared under a magnifying lens, a numeral's overlong horizontal stroke, the wine-red-haired lady (Marion) kneeling with fallen fan and unwiped tears, twenty-three unsent letters spilled beside her |
| cg_map20 | `third_hand_drawer` | 20화[막④] — 각본실, 십이 년 전 서랍만 낯선 가로 열쇠 구멍. 메피안 "나도 못 여오" | 마리온 + 메피안 | a narrow archive room walled with dated drawers, one oldest drawer with a strange horizontally-set keyhole, the wine-red-haired lady (Marion) hand still on its pull, the chancellor (Mephian) in the doorway with his smile gone |
| cg_map21 | `leash_rehearsal` | 21화[5막] — 위증 열한 줄 낭독 시연, 대가는 만인 앞 차용증 소각 | 마리온 + 메피안 + 서기 둘 | a small chancellery meeting room, the wine-red-haired lady (Marion) on a rehearsal dais holding eleven written lines, fingertips white at the eighth line, the chancellor (Mephian) seated in shadow timing her |
| cg_map23 | `seven_threads` | 23화[5막] — D-30 최종 예행, 일곱 사람 동선이 한 홀로 수렴 | 마리온 + 레이먼 + 아젤 + 루시엔(원경) | an immense coronation ballroom rehearsal, the wine-red-haired lady (Marion) alone tracing a seating chart, the northern commander (Reimon) directing patrol lines above, the paladin-priest (Azael) and marchioness (Lucienne) at envoy seats, converging sightlines |
| cg_map25 | `three_hours_before` | 25화[막⑤·배드게이트②] — 각본실, 위증 대본과 부치지 못한 편지 다발을 양손에 나눠 든 마지막 저울질 | 마리온 + 메피안 + 릴리아 | the archive room three hours before midnight, the wine-red-haired lady (Marion) with a false-testimony script in one hand and unsent letters in the other, the chancellor (Mephian) hurried, the duchess (Lilia) at the doorway |
| cg_map26 | `midnight_accusation` | 26화[6비트①] — 자정 종 아홉 번째, 메피안이 하이델 공작영애를 반역으로 고발 | 메피안 + 릴리아 + 마리온 + 벨리안(난간) | a coronation ball at midnight, the chancellor (Mephian) stepping forward in formal accusation, the duchess (Lilia) standing alone as the crowd parts, the wine-red lady (Marion) rising from the witness bench, the crown prince (Belian) watching from the balustrade |
| cg_map27 | `lost_script` | 27화[6비트②] — 증언대의 마리온, 예법의 빈틈에 선 당신을 보고 열한 줄을 발화하지 않음(이 루트의 주 카메라) | 마리온 + (당신 실루엣) + 아젤(원경) | the brightest point of a vast ballroom, the wine-red-haired lady (Marion) alone at the testimony stand with empty hands and stage-smile gone, a back silhouette standing in a forbidden protocol gap, the paladin-priest (Azael) rising with a no-longer-empty record box |
| cg_map28 | `the_seizure` | 28화[6비트④⑤⑥] — 레이먼의 확보 명령을 벨포르가 집행. 표적은 약혼자·집사. 벨리안 재가 | 레이먼 + 벨포르 + 약혼자 + 마리온 + 벨리안 | a ballroom the instant a verdict inverts, the northern commander (Reimon) signaling from the gallery, the vice-captain (Belfor) seizing a shadowed faceless nobleman and a steward, the wine-red lady (Marion) watching without breathing, the crown prince (Belian) granting it with a glance |
| cg_map_good | `ruined_rose_garden` | 30화 GOOD — 경매로 넘어간 발루아 온실 잔해에 마리온이 스물두 그루 장미를 손수 심음 | 마리온 + 리비아 + (당신 손·어깨) | a demolished glass conservatory ruin, the wine-red-haired lady (Marion) kneeling in the dirt without fan or gloves planting a rose cutting, the girl (Livia) working two rows over, twenty-two young roses set across the wreckage, warm honest daylight |
| cg_map_bad | `border_carriage_watched` | 30화 BAD(15·25화 실패 분기 공용) — 프롤로그 반복, 이번엔 당신이 창밖에서 지켜봄 | 마리온(마차 안) + 당신(실루엣) | a crestless carriage at a night border checkpoint in deep winter seen from outside, the wine-red-haired lady (Marion) dimly visible tracing numbers on the frosted glass, a back silhouette standing in the snow unable to be seen by her |
| cg_map_true | `erased_name` | 30화 TRUE — 흙 묻은 손으로 검인청 명부를 펼침. 이름 하나가 종이째 깎여 지워져 있음 | 마리온 + (당신 손) | a seal-office record room, a twelve-year-old register with one entry physically shaved from the paper, a numeral with the same overlong stroke in the margin, the wine-red-haired lady (Marion) leaning over with soil under her fingernails, a dried rose and a seal-sample ring on the page |

---

## 3. 벨리안 루트 (id: `belian`) — 식탐(가문 포식) · 프롤로그+1~5화

| id | file | 화·상황(무슨 일) | 등장 캐릭터 | 프롬프트 |
|---|---|---|---|---|
| cg_blp0 | `prologue_swallowed` | P — 1회차 결말. 대관 축배(독)를 삼킨 벨리안의 웃음이 지워지고 재상이 왕관을 얹음(삼켜진 태양) | 벨리안 + 메피안 | a golden coronation hall, the young golden-haired emperor (Belian) whose bright smile is fading after drinking a poisoned chalice, the chancellor's (Mephian) hand lowering a crown onto him, gilded doom, warm light curdling cold |
| cg_blp1 | `corridor_sun` | 1화 — 궁 회랑, 벨리안이 술을 마시는 대신 화단에 부어 독을 시험하는 습관 | 벨리안 (+당신 POV) | a sunlit west palace corridor, the golden-haired crown prince (Belian) pouring wine over a flower bed from a goblet instead of drinking, a knowing smirk, predatory ease, warm afternoon light |
| cg_blp2 | `moonlit_chess` | 2화 — 달빛 회랑 체스판. 벨리안이 흑 왕을 쥐고, 배경엔 순찰 온 레이먼 | 벨리안 + (배경) 레이먼 | a moonlit corridor chessboard, the crown prince (Belian) holding a black king piece with an amused sly look, the silver northern knight (Reimon) passing in the background, cool blue-silver night, quiet tension |
| cg_blp3 | `devouring_court` | 3화 — 알현실, 몰락 남작이 가문 전부를 바치고 벨리안이 '삼키는' 포식의 미소 | 벨리안 + 몰락 남작(엑스트라) | an empty throne hall, an impoverished baron kneeling and offering his house's fortune to the reclining crown prince (Belian) who accepts with a devouring smile, "eat or be eaten" predatory grandeur, gold shadow |
| cg_blp4 | `thrice_cup` | 4화 — 만찬, 시종장의 떨리는 손이 벨리안의 잔을 세 번 바꿔 채움(독배 예행) | 벨리안 + 시종장(엑스트라) | a long palace banquet table, an old chamberlain's trembling hand refilling the prince's (Belian) goblet swapped thrice, the prince counting sidelong with a shadowed weary smile, candlelit unease |
| cg_blp5 | `chancellor_counts` | 5화[막①] — 회랑에서 메피안이 당신을 셈, 벨리안이 그늘에서 서늘한 시선(산 채로 삼키는 독의 정체) | 메피안 + 벨리안 | a palace corridor, the soft-smiling chancellor (Mephian) pausing near the viewer while the crown prince (Belian) watches from balustrade shadow with a cold sharpened gaze, "swallowed alive" dread, cold gold |

---

## 4. 벨포르 루트 (id: `belfor`) — 나태(acedia) · 프롤로그+1~5화

| id | file | 화·상황(무슨 일) | 등장 캐릭터 | 프롬프트 |
|---|---|---|---|---|
| cg_bfp0 | `prologue_broken_sword` | P — 1회차 결말. 명령과 양심 사이에서 지쳐 스스로 검을 꺾은 벨포르, 발치엔 젖은 명령서·훈장 | 벨포르 | a rain-soaked guard drill yard at dawn, the platinum-blonde vice-captain (Belfor) breaking his own sword over his knee, a wet order-document and medal at his feet, grief and rain, desaturated cold |
| cg_bfp1 | `dawn_duel` | 1화 — 회귀 후, 새벽 훈련장에서 오만한 귀족 장교의 목 앞 한 치에 목검을 세워 절제 | 벨포르 + 귀족 장교(엑스트라) | a pre-dawn training ground, the platinum-blonde vice-captain (Belfor) halting a wooden sword a hair from an arrogant noble officer's throat, disciplined restraint, misty blue dawn |
| cg_bfp2 | `crime_scene` | 2화 — 털린 서재 현장에서 벨포르가 긁힌 창틀·봉랍 한 방울을 조사(신분보다 원칙) | 벨포르 | a ransacked study crime scene, the vice-captain (Belfor) crouched examining a scratched window sill and a drop of wax seal, a cracked old wooden training sword nearby, investigative lamplight |
| cg_bfp3 | `sunset_rampart` | 3화 — 노을 성벽에서 약혼자가 재상부 사람에게 밀서를 넘기는 걸 벨포르가 목격. 위쪽 성벽엔 레이먼 | 벨포르 + 약혼자 + (위쪽) 레이먼 | a sunset rampart above a ball, the platinum-blonde vice-captain (Belfor) witnessing a shadowed faceless fiancé handing a sealed letter to a chancellery man; on the upper wall the stern blue-grey-haired commander (Reimon) watches in silence, red-gold dusk, moral weight |
| cg_bfp4 | `sealed_order` | 4화 — 밤 병영 책상, 재상부 봉랍이 찍힌 미개봉 명령서를 열지 못하고 손만 머무름 | 벨포르 | a barracks desk at night, an unopened wax-sealed order bearing the chancellery crest, the vice-captain's (Belfor) hand hovering unable to open it, single candle, heavy hesitation |
| cg_bfp5 | `chancellor_blade` | 5화[막①] — 회랑에서 메피안이 벨포르의 '검'(얼굴 아닌)을 가늠, 회랑 끝 벨리안이 곁눈질 | 메피안 + 벨포르 + (끝) 벨리안 | a palace corridor, the soft-smiling chancellor (Mephian) studying the vice-captain's (Belfor) sword — not his face — with a soft smile, at the corridor's end the golden-haired prince (Belian) eyeing the blade sidelong, cold gold, ominous |

---

## 5. 레이먼 루트 (id: `reimon`) — 분노 · 프롤로그+1~5화

| id | file | 화·상황(무슨 일) | 등장 캐릭터 | 프롬프트 |
|---|---|---|---|---|
| cg_rmp0 | `prologue_snow_oath` | P — 1회차 결말. 황실·북부 두 맹세에 동시에 버림받고 눈밭에 검을 꽂은 채 홀로 선 레이먼 | 레이먼 | the blue-grey-haired northern commander (Reimon) alone in a snowfall-filled drill yard, his sword thrust into the snow, snow piling untouched on his shoulders, isolated betrayal, cold blue-white desolation |
| cg_rmp1 | `training_dawn` | 1화 — 회귀 후, 서리 낀 새벽 연무장에서 레이먼이 목검을 휘두름. 담장 너머서 누군가 지켜봄 | 레이먼 (+담장 너머 당신 POV) | a frost-lit drill yard at dawn, the blue-grey-haired commander (Reimon) mid-swing with a wooden sword, precise silent motion, someone watching from beyond the wall, pale cold morning |
| cg_rmp2 | `seal_check` | 2화 — 봉랍이 두 번 녹였다 다시 찍힌 걸 검끝으로 들어 눈치챔(위조 편지의 첫 단서) | 레이먼 | a lamplit desk, the commander (Reimon) lifting a sealed letter on his blade-tip, noticing the wax was melted and re-set twice, cold suspicion in his grey eyes, frost and lamp glow |
| cg_rmp3 | `two_crests` | 3화 — 제국의 태양·북부의 늑대 두 깃발 사이에 선 레이먼에게 벨리안이 히죽이며 다가옴 | 레이먼 + 벨리안 | a windswept rampart between two banners — imperial sun and northern wolf — the commander (Reimon) standing between them, the golden-haired prince (Belian) strolling up with a teasing smirk, tension of a caged sword |
| cg_rmp4 | `inspection_raid` | 4화 — 급습 감찰이 레이먼 필적을 위조한 반역 초안을 그의 처소에서 '발견'. 스토익한 얼굴에 금 | 레이먼 + 감찰관(엑스트라) | a sudden inspection bursting into a quarters, an inspector "discovering" a forged treasonous draft in the commander's (Reimon) own hand, the commander's stoic face cracking, harsh torchlight |
| cg_rmp5 | `chancellor_measures` | 5화[막①] — 회랑에서 메피안이 레이먼 곁의 당신을 가늠, 회랑 끝 벨리안. 표적이 검이 아님을 깨달음 | 메피안 + 레이먼 + (끝) 벨리안 | a palace corridor, the soft-smiling chancellor (Mephian) measuring the viewer beside the commander (Reimon), at the corridor end the golden prince (Belian) watching; the commander's cold gaze like a sword with no target, cold light |

---

## 6. 루시엔 루트 (id: `lucienne`) — 교만 · 프롤로그+1~5화

| id | file | 화·상황(무슨 일) | 등장 캐릭터 | 프롬프트 |
|---|---|---|---|---|
| cg_lup0 | `prologue_broken_vow` | P — 1회차 결말. 서약식 단상에서 만인 앞 문장이 한가운데 끊겨 얼어붙은 루시엔, 완벽이 붕괴 | 루시엔 | the silver-white-haired marchioness (Lucienne) frozen mid-sentence on a vow-ceremony dais, a trembling fingertip, a hall of nobles staring, her flawless composure shattering, cold spotlight, isolation |
| cg_lup1 | `frozen_salon` | 1화 — 회귀 후, 얼음처럼 정돈된 살롱에서 예고 없는 손님이 들어서자 루시엔의 완벽한 루틴이 멈춤 | 루시엔 (+당신 POV) | a perfectly ordered white-and-ice salon, the silver-white marchioness (Lucienne) pausing her precise routine as an unexpected guest enters, a lily embroidery hoop on the table, immaculate cold elegance |
| cg_lup2 | `rose_vs_lily` | 2화 — 오후 살롱에서 붉은 장미 마리온과 흰 백합 루시엔이 독설 응수, 완벽한 가면에 반 박자 흔들림 | 마리온 + 루시엔 | a sunlit afternoon salon, the wine-red lady (Marion) and the silver-white lady (Lucienne) trading polished barbs across a table, rose vs lily, a half-beat waver in the lily's flawless mask |
| cg_lup3 | `two_cages` | 3화 — 회의 탁자에서 과묵한 레이먼과 완벽한 루시엔이 '두 개의 완벽한 감옥'으로 마주 앉음(로맨스 아님) | 레이먼 + 루시엔 | a formal meeting table, the terse blue-grey commander (Reimon) and the perfect silver-white marchioness (Lucienne) seated as two "flawless prisons" mirroring each other, no romance, cool distant elegance, a familiar wax seal on a letter |
| cg_lup4 | `crooked_stitch` | 4화 — 백합 자수의 삐뚤어진 한 땀을 뜯으려는 루시엔의 손을 누군가 부드럽게 멈춤(첫 허용된 불완전) | 루시엔 (+당신 손) | a quiet parlor, the silver-white marchioness (Lucienne) about to tear out a single crooked stitch on a white-lily embroidery, a hand gently stopping hers, first permitted imperfection, tender cool light |
| cg_lup5 | `perfect_silence` | 5화[막①] — 회랑에서 메피안이 백합의 '완벽한 침묵'을 언급, 당신 손엔 잉크 안 마른 초대장 | 메피안 (+당신 POV) | a palace corridor, the soft-smiling chancellor (Mephian) speaking of the lily's "perfect silence", an invitation with wet ink in the viewer's hand, cold realization, ice-blue and gold |

---

## 7. 리비아 루트 (id: `livia`) — 시기 · 프롤로그+1~5화

| id | file | 화·상황(무슨 일) | 등장 캐릭터 | 프롬프트 |
|---|---|---|---|---|
| cg_lvp0 | `prologue_erased` | P — 1회차 결말. 불타는 본채를 등진 별채 창가에서 리비아가 종이에 제 이름을 적으며 어둠에 지워짐 | 리비아 | the shy brown-haired girl (Livia) at a cottage-annex window, backlit by a distant burning manor, writing her own name on a scrap of paper as the last lamp gutters out, being erased into darkness, sorrowful cold |
| cg_lvp1 | `annex_spring` | 1화 — 회귀 후, 볕 든 뒷정원 별채에서 처음으로 제 이름이 불리자 놀라 고개를 드는 리비아 | 리비아 (+당신 POV) | a sunlit neglected back-garden annex, the shy brown-haired girl (Livia) looking up startled as someone speaks her name for the first time, a shaft of warm light, fragile wonder |
| cg_lvp2 | `wildflowers` | 2화 — 낡은 책이 쌓인 별채 안, 리비아가 이름 없는 들꽃을 묶다 돌아온 손님에게 문을 반쯤 엶 | 리비아 (+당신 POV) | the annex interior stacked with worn books, the girl (Livia) binding a bundle of nameless wildflowers, half-opening the door to a returning visitor, quiet warmth breaking her guard |
| cg_lvp3 | `wall_ghost` | 3화 — 밤, 리비아가 아는 담장 틈으로 넘던 중 지나가던 메피안이 '이름 없는' 소녀를 처음 인지 | 리비아 + 메피안 | a night estate wall, the girl (Livia) slipping over a cracked gap she knows well, the grey-robed elderly chancellor (Mephian) passing below and noticing the "nameless" girl for the first time, dangerous chill |
| cg_lvp4 | `two_sisters` | 4화 — 대기실에서 가면 벗은 마리온 곁의 리비아, 회랑엔 메피안이 '이름 없는 꽃'을 저울에 올림 | 리비아 + 마리온 + (회랑) 메피안 | a theatre dressing room, the girl (Livia) beside the mask-off wine-red lady (Marion), the chancellor (Mephian) lingering in the corridor measuring the "nameless flower", shadow and warm lamp contrast |
| cg_lvp5 | `nameless_flower` | 5화[막①] — 밤 별채에서 리비아가 어둠을 바라봄, 곁의 재상부 문서에 '하이델 서녀' 넉 자가 처음 적힘 | 리비아 | a night cottage window, the girl (Livia) gazing at the darkness outside, a chancellery document nearby bearing the words "Heidel bastard daughter" for the first time, cold dread creeping into a small warm room |

---

## 8. 아젤 루트 (id: `azael`) — 색욕→타락한 사제 · 프롤로그+1~5화

| id | file | 화·상황(무슨 일) | 등장 캐릭터 | 프롬프트 |
|---|---|---|---|---|
| cg_azp0 | `prologue_sold_light` | P — 1회차 결말. 미혹에 넘어가 빛을 판 아젤, 갑주에서 문장이 뜯기고 기록함은 빈 채 국경에 표류 | 아젤 | a fallen silver-ivory paladin-priest (Azael) at a border marker at ashen dawn, the crest torn from his silver armor, an empty record box, disgraced and adrift, cold grey light, holy fall |
| cg_azp1 | `envoy_arrival` | 1화 — 회귀 후, 문장 온전한 백은 사제 아젤이 봉랍 찍힌 기록함을 안고 사절 홀에 도착 | 아젤 | the untarnished silver paladin-priest (Azael) arriving before an envoy hall, an intact wax-sealed record box under his arm, curious foreign onlookers, dignified stranger, cool ivory light |
| cg_azp2 | `worship_bait` | 2화 — 향 짙은 응접실, 메피안이 금이 아니라 '살아 있는 성인의 자리'(숭배)를 미끼로 제시. 아젤의 답이 한 박자 늦음 | 메피안 + 아젤 | a chancellery parlor thick with incense, the chancellor (Mephian) offering not gold but a "living saint's seat" — adoration — as bait; the priest's (Azael) answer delayed a beat, tempting shadow, ivory and gold |
| cg_azp3 | `sealed_answer` | 3화 — 촛불 책상에서 아젤이 뜨거운 밀랍으로 기록을 봉함, 거절한 온기 위에 손이 한 박자 머무름 | 아젤 | an envoy candlelit desk, the priest (Azael) sealing his records with hot wax, his hand lingering a beat over a warmth he refused, restrained hunger under serenity, warm candle glow and shadow |
| cg_azp4 | `three_oaths` | 4화 — 이국 예배당에서 아젤이 제단 앞에 무릎 꿇고 세 맹세를 욈, 얼굴 반은 빛 반은 그늘(성스러움 아래 굶주림) | 아젤 | a small foreign chapel, the priest (Azael) kneeling before an altar reciting three oaths, half his face in warm light and half in shadow, a nameless hunger beneath the holy calm, exotic candlelight |
| cg_azp5 | `poisoned_seal` | 5화[막①] — 향로 놓인 회랑, 메피안이 '타락한 증인의 봉인은 거짓을 진실로 만든다'며 미소, 낯익은 향에 아젤이 눈을 감음 | 메피안 + 아젤 | a palace corridor with an incense censer, the chancellor (Mephian) smiling that "a fallen witness's seal turns lies to truth", the priest (Azael) closing his eyes at a hauntingly familiar scent, temptation dread, gold-shadow |

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

---

## 11. 제작 대기 CG (아트 파일 없음) — 2026-07-27 점검

> 위 표(1~9절)에 **id/file/장면이 이미 정해져 있으나 `public/cg/`에 실제 파일이 없는 항목**만 추린 목록.
> **2026-07-27: 8루트 `cg-manifest-{lilia,marion,belian,reimon,livia,belfor,lucienne,azael}.json` 전량 도착 →
> 전부 `cgs.ts`에 병합 완료.** 아래는 그 결과물의 파일-존재 스냅샷(생성 파이프라인이 실시간으로
> 채우고 있어 이 문서 시점 이후 계속 줄어든다 — 최신 수치는 `cgs.ts` 자체 + 대조 스크립트로 확인).

### ⚠️ 파일명 불일치 발견 — art 재검증 필요 (8개 팀 병렬 작업 중 발생)

각 매니페스트 도착 전에, 8루트 전체에 대해 **§9(기존 스펙) 기준의 generic 엔딩 아트**
(`{char}/end_good.webp` 등)가 먼저 일괄 생성돼 있었다. 매니페스트가 도착하면서 실제로
같은 파일명(`end_good`/`end_bad`/`end_true`)을 그대로 지정한 경우와, **전혀 다른 파일명·장면**을
새로 지정한 경우가 갈렸다 — 즉 이미 생성된 art가 최신 스토리와 안 맞을 수 있다:

| 루트 | GOOD | BAD | TRUE | 비고 |
|---|---|---|---|---|
| 릴리아 | 신규 file 지정 | 신규 file 지정 | 신규 file 지정 | 기존 end_*.webp는 근접하나 배경 인물(마리온·리비아) 미확인 — 재검증 권장 |
| 마리온 | 신규 file 지정 | 신규 file 지정 | 신규 file 지정 | 기존 end_good.webp=무대 위 개선(구스펙) vs 매니페스트=폐허 정원 가드닝(신규) — **확실히 다른 장면** |
| 벨리안 | 신규 file 지정 | 신규 file 지정 | 신규 file 지정 | 기존 end_good.webp=황금 잔·환호 군중(구스펙) vs 매니페스트=이 나간 낡은 잔·주교 대관(신규) — **확실히 다른 장면** |
| 벨포르 | 신규 file 지정 | 신규 file 지정 | 신규 file 지정 | 기존 end_*.webp 미검증, 매니페스트가 전량 새 file 지정 |
| 레이먼 | 신규 file 지정 | 신규 file 지정 | 신규 file 지정 | 기존 end_*.webp 미검증, 매니페스트가 전량 새 file 지정 |
| 루시엔 | **end_good 그대로** | **end_bad 그대로** | **end_true 그대로** | title까지 완전 일치 확인 — 기존 art 그대로 유효, 재생성 불필요 |
| 리비아 | 신규 file 지정 | 신규 file 지정 | 신규 file 지정 | 기존 end_*.webp 미검증, 매니페스트가 전량 새 file 지정 |
| 아젤 | **end_good 그대로**(title 일치) | **end_bad 그대로**(title 일치) | 신규 file 지정 | GOOD/BAD는 파일명 재사용됐으나 실제 art는 구스펙(대성당 문 앞) 장면 — 매니페스트 신규 장면(재심정 내부)과 다름, 재생성 검토 필요 |

**결론**: 루시엔만 기존 엔딩 art가 그대로 유효. 나머지 7루트는 새 file명으로 등재했으므로
`cgs.ts` 항목은 정상(미생성 상태), 벨리안·마리온·아젤(GOOD/BAD)은 **기존 end_*.webp가 이미
있지만 최신 스토리와 안 맞는 것으로 확인된 파일**이니 별도 정리(삭제 또는 참고자료 보관) 판단이
필요 — 이미지 생성팀에 인계할 사항.

### 11.1 1막(프롤로그+1~5/10화) 미제작분 — 이 문서에 장면·프롬프트 이미 확정됨

| 루트 | id | file | 화 | 상황 요약 |
|---|---|---|---|---|
| 릴리아 | cg_lip6 | `two_seals` | 6화 | 검인청 뒷골목, 릴리아·레이먼 위조편지 봉랍 대조 |
| 릴리아 | cg_lip7 | `rose_lily_tea` | 7화 | 다과회, 마리온·루시엔 저울질 |
| 릴리아 | cg_lip8 | `annex_child` | 8화 | 하이델 별채, 릴리아·리비아 첫 대면 |
| 릴리아 | cg_lip9 | `printing_raid` | 9화 | 인쇄소 습격, 스캔들 조기 발발 |
| 릴리아 | cg_lip10 | `faceless_portrait` | 10화[막②] | 초상화 속 약혼자 반지 발각 |
| 마리온 | cg_map1 | `debt_candle` | 1화 | 메피안, 마리온 가문 차용증을 촛불에 시험 |
| 마리온 | cg_map4 | `red_teatime` | 4화 | 티타임, 마리온 손끝 떨림 |
| 마리온 | cg_map5 | `cracked_mask` | 5화[막①] | 회랑 헛구역질, 메피안 등장 |
| 벨리안 | cg_blp1 | `corridor_sun` | 1화 | 화단에 독주 시험 습관 |
| 벨리안 | cg_blp2 | `moonlit_chess` | 2화 | 달빛 체스판, 배경 레이먼 |
| 벨리안 | cg_blp3 | `devouring_court` | 3화 | 알현실, 몰락 남작 포식 |
| 벨리안 | cg_blp4 | `thrice_cup` | 4화 | 만찬, 독배 예행(잔 3회 교체) |
| 벨리안 | cg_blp5 | `chancellor_counts` | 5화[막①] | 회랑, 메피안 셈+벨리안 냉시선 |
| 벨포르 | cg_bfp1 | `dawn_duel` | 1화 | 새벽 훈련장, 목검 절제 |
| 벨포르 | cg_bfp2 | `crime_scene` | 2화 | 털린 서재 현장 조사 |
| 벨포르 | cg_bfp3 | `sunset_rampart` | 3화 | 노을 성벽, 약혼자 밀서 목격(+레이먼) |
| 벨포르 | cg_bfp4 | `sealed_order` | 4화 | 밤 병영, 봉인 명령서 앞 망설임 |
| 벨포르 | cg_bfp5 | `chancellor_blade` | 5화[막①] | 회랑, 메피안이 검을 가늠(+벨리안) |
| 레이먼 | cg_rmp1 | `training_dawn` | 1화 | 서리 연무장, 목검 수련 |
| 레이먼 | cg_rmp2 | `seal_check` | 2화 | 재봉인된 밀랍 발견 |
| 레이먼 | cg_rmp3 | `two_crests` | 3화 | 태양·늑대 깃발 사이, 벨리안 접근 |
| 레이먼 | cg_rmp4 | `inspection_raid` | 4화 | 급습 감찰, 필적 위조 발견 |
| 레이먼 | cg_rmp5 | `chancellor_measures` | 5화[막①] | 회랑, 메피안 셈(+벨리안) |
| 루시엔 | cg_lup1 | `frozen_salon` | 1화 | 얼음 살롱, 루틴 정지 |
| 루시엔 | cg_lup2 | `rose_vs_lily` | 2화 | 살롱, 마리온·루시엔 독설 응수 |
| 루시엔 | cg_lup3 | `two_cages` | 3화 | 회의 탁자, 레이먼과 대치(로맨스 아님) |
| 루시엔 | cg_lup4 | `crooked_stitch` | 4화 | 삐뚤어진 자수, 손 멈춤 |
| 루시엔 | cg_lup5 | `perfect_silence` | 5화[막①] | 회랑, 메피안 언급+잉크 안 마른 초대장 |
| 리비아 | cg_lvp1 | `annex_spring` | 1화 | 별채, 처음 이름 불림 |
| 리비아 | cg_lvp2 | `wildflowers` | 2화 | 별채, 들꽃 묶다 문 엶 |
| 리비아 | cg_lvp3 | `wall_ghost` | 3화 | 밤 담장, 메피안 첫 인지 |
| 리비아 | cg_lvp4 | `two_sisters` | 4화 | 대기실, 마리온 곁+메피안 저울질 |
| 리비아 | cg_lvp5 | `nameless_flower` | 5화[막①] | 별채, '하이델 서녀' 문서 첫 기재 |
| 아젤 | cg_azp1 | `envoy_arrival` | 1화 | 사절 홀 도착 |
| 아젤 | cg_azp2 | `worship_bait` | 2화 | 메피안, 숭배를 미끼로 제시 |
| 아젤 | cg_azp3 | `sealed_answer` | 3화 | 촛불 책상, 거절 후 손 머무름 |
| 아젤 | cg_azp4 | `three_oaths` | 4화 | 이국 예배당, 세 맹세 |
| 아젤 | cg_azp5 | `poisoned_seal` | 5화[막①] | 회랑, 메피안 미소+낯익은 향 |

**소계: 36장** (릴리아 5 + 마리온 3 + 나머지 6루트 각 5장)

### 11.2 엔딩 CG — 8루트 × GOOD/BAD/TRUE = 24장 전량 미제작

`{id}/end_good.webp` · `{id}/end_bad.webp` · `{id}/end_true.webp` (id = lilia/marion/belian/belfor/reimon/lucienne/livia/azael).
장면 지정은 위 9절 표 참고. **8루트 전종, 24장 모두 아직 파일 없음.**

### 11.3 2막 이후 (11~30화 / 6~30화) — 8루트 전량 매니페스트 병합 완료

8개 `cg-manifest-{루트id}.json`이 전부 도착해 `cgs.ts`에 병합됐다. 루트별 신규 등재 수
(에피소드 CG + 엔딩 3종, 프롤로그·1막은 §1~9에 이미 있던 것 제외):

| 루트 | 신규 등재 수(2막 이후) | 화 범위 |
|---|---|---|
| 릴리아 | 9화 + 엔딩 3 = 12 | 15~29화 |
| 마리온 | 10화 + 엔딩 3 = 13 | 12~28화 |
| 벨리안 | 9화 + 엔딩 3 = 12 | 12~28화 |
| 벨포르 | 9화 + 엔딩 3 = 12 | 12~28화 |
| 레이먼 | 10화 + 엔딩 3 = 13 | 12~28화 |
| 루시엔 | 8화 + 엔딩 3 = 11 | 13~28화 |
| 리비아 | 9화 + 엔딩 3 = 12 | 14~28화 |
| 아젤 | 8화 + 엔딩 3 = 11 | 12~27화 |

**합계 96장 신규 등재.** 대부분 art 미생성 상태로 시작했으나, 이 문서 작업 도중에도
이미지 생성 파이프라인이 실시간으로 파일을 채우고 있어(예: 마리온 map12/20/25/28 등은
이미 생성 완료 확인) 실제 미생성 수는 계속 감소 중이다. 최신 수치는 아래 명령으로 확인:

```
node -e "…(cgs.ts 파싱 + fs.existsSync 대조 스크립트, 본 점검에 사용한 것과 동일)…"
```

### 11.4 요약

| 구분 | 수량 | 상태 |
|---|---|---|
| 1막(§1~9, 프롤로그~5/10화) 아트 미제작분 | 36 | file/장면 확정, art 대기 |
| 2막 이후(§11.3, 8루트 매니페스트 병합) | 96 | id/file/unlockEp 등재 완료, art 대부분 대기(실시간 생성 중) |
| `cgs.ts` 총 항목 수 | 111 | (기존 15 + 신규 96) |
| 그중 실제 art 파일 존재 | 34 (2026-07-27 이 점검 시점) | 나머지는 다음 단계 이미지 생성 대상 |

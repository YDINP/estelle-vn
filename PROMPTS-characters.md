# 신규 캐릭터 이미지 생성 프롬프트 (이졸데 · 아델 · 이든 · 레이너 · 미카엘)

> 시트가 준비되면 `바탕화면\1\008(이졸데)`, `009(아델)`, `010(이든)`,
> `011(레이너)`, `012(미카엘)` 폴더에 넣고 요청 — 블롭 검출 컷터로 잘라서 적용.
> **배경은 반드시 순수 검정(#000)**, 캐릭터가 칸 경계를 살짝 넘어도 됨.

## 공통 스타일 (기존 캐릭터와 톤 일치)

```
elegant romance-fantasy (rofan) anime illustration, delicate watercolor-like shading,
ornate 19th-century European noble fashion, soft painterly finish, full body,
standing pose, pure black background (#000000), no frame, no text
```

- 전신 시트: **3×2 그리드 × 2장** (총 12포즈 = 12감정)
- 흉상 시트: **4×2 그리드 × 1장** (8표정, 허리 위)
- 12감정 슬롯: 인사/미소/활짝/수줍음/결의/놀람/슬픔/눈물/조소/폭소/분노/획책

---

## ① 이졸데 — 백발의 얼음 공녀 (도도·차가움)

북부 대공가의 공녀. 사교계의 '얼음 백합'. 완벽하게 정돈된 냉담함,
좀처럼 웃지 않고 웃어도 서리 같은 미소. 화자 색: 아이스 시안 `#bfe3ea`

```
A beautiful noblewoman with long straight silver-white hair and pale ice-blue eyes,
porcelain skin, tall and poised, haughty and glacial expression by default.
She wears a regal silver-blue and white gown with white fox fur trim on the shoulders,
sapphire jewelry, an ornate silver hairpin shaped like a frost lily.
Northern grand-duchy princess aesthetic: refined, distant, untouchable elegance.
Elegant rofan anime illustration, watercolor-like shading, full body,
character sheet, 3x2 grid of 6 poses with different expressions,
pure black background, no text.
```

- 시트1 표정: 정자세 냉담(미소X)=soft / 옅은 서리 미소=happy / 부채 든 인사=greet / 놀람=surprised / 시선 회피 홍조=shy / 검지 세운 조소=smirk
- 시트2 표정: 팔짱 결의=serious / 슬픔=sad / 눈물 참기=tearful / 분노=angry / 입가 가린 획책=scheme / 드물게 터진 웃음=laugh
- 흉상(4×2): soft, greet, smirk, serious, surprised, sad, angry, scheme

## ② 아델 — 갈색머리 서녀 (수수·따뜻함)

백작가의 서녀(庶女). 본가의 그늘에서 숨죽여 살지만 심지가 곧다.
수수한 옷차림, 낮게 묶은 머리, 조심스러운 몸가짐. 화자 색: 웜 베이지 `#f2cfa6`

```
A gentle young noblewoman of low standing (illegitimate daughter of a count),
wavy warm-brown hair loosely tied low with a plain ribbon, soft hazel eyes,
modest and slightly worn muted-beige cotton dress with a simple apron-like bodice,
no flashy jewelry except a small locket. Timid but quietly resolute demeanor,
downcast gentle gaze, humble posture. Cinderella-like understated beauty.
Elegant rofan anime illustration, watercolor-like shading, full body,
character sheet, 3x2 grid of 6 poses with different expressions,
pure black background, no text.
```

- 시트1 표정: 다소곳한 미소=soft / 환한 웃음=happy / 치마 잡고 인사=greet / 놀람=surprised / 수줍음=shy / 고개 숙인 슬픔=sad
- 시트2 표정: 주먹 쥔 결의=serious / 눈물=tearful / 드문 분노=angry / 활짝 웃음=laugh / (조소·획책은 성격상 생략 가능 — 폴백 처리)
- 흉상(4×2): soft, happy, greet, shy, serious, surprised, sad, tearful

---

## ③ 이든 — 백금발의 근위대 부단장 (구 루시안 재설정, 일러 재생성)

황실 근위대 부단장. 단장의 그림자에서 실무를 지휘하는 젊은 검.
원칙주의자지만 무도회장에서 "근위대는 진실의 편"이라 말하는 강직함. 화자 색: 플래티넘 `#cfe0f5`

```
A young imperial guard vice-captain with platinum-blond hair neatly swept back,
sharp gray-blue eyes, tall disciplined posture. He wears a white-and-silver imperial
guard dress uniform with pale blue sash, silver epaulettes, ceremonial sword at his hip,
white gloves. Dutiful, upright, quietly loyal knight aesthetic.
Elegant rofan anime illustration, watercolor-like shading, full body,
character sheet, 3x2 grid of 6 poses with different expressions,
pure black background, no text.
```

- 전신 3x2 x2 (12감정) + 흉상 4x2 (soft, greet, serious, smirk, surprised, sad, angry, shy)

## ④ 레이너 — 북부의 서리 대공 (냉엄한 무인)

북부 변경을 다스리는 대공. 과묵하고 냉엄한 전장의 주인.
(이졸데와 같은 북부 혈통 — 남매/친족 설정 여지). 화자 색: 스틸 블루그레이 `#b9c9dd`

```
A stern northern grand duke in his late twenties, long silver-ash hair tied low,
piercing glacier-blue eyes, battle-hardened composed face with a faint scar,
massive dark fur-lined slate-blue military coat over black armor plates,
wolf-fur mantle, heavy gauntlets, a greatsword. Frost-covered warlord nobility,
silent and imposing. Elegant rofan anime illustration, watercolor-like shading,
full body, character sheet, 3x2 grid of 6 poses with different expressions,
pure black background, no text.
```

- 전신 3x2 x2 (12감정) + 흉상 4x2 (soft, serious, greet, surprised, sad, angry, smirk, scheme)

## ⑤ 미카엘 — 신전의 성기사 (빛의 맹세)

신전 성기사단 소속. 온화한 미소 뒤에 흔들리지 않는 신념.
축성된 백은 갑주에 금빛 성인(聖印). 화자 색: 아이보리 실버 `#ece5cf`

```
A holy paladin of the temple order, soft golden-white hair with gentle waves,
warm amber eyes, serene compassionate smile. He wears consecrated white-silver
plate armor with gold filigree and sacred sun emblems, a white cape with gold trim,
a blessed longsword and prayer beads on the sword belt. Radiant, gentle,
unwavering holy knight aesthetic. Elegant rofan anime illustration,
watercolor-like shading, full body, character sheet,
3x2 grid of 6 poses with different expressions,
pure black background, no text.
```

- 전신 3x2 x2 (12감정) + 흉상 4x2 (soft, happy, greet, serious, surprised, sad, shy, tearful)

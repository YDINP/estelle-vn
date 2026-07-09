# 스토리 전면 재구성 — 스켈레톤 인덱스

> 상위 설계: [`PRD-story-overhaul.md`](../PRD-story-overhaul.md) (30화 6막·멀티엔딩·7대죄·개명·정합성).
> 각 스켈레톤 = 프롤로그(죄에 삼켜진 1회차 배드엔딩) + 6막 30화(화별 제목·클리프행어·비트·반전·죄 심화)
> + 왕관의 밤 6비트 정합성 체크 + 죄→구원 아크 + 자각 없는 에코. 전 8인 30/30화 완비.

## 8인 스켈레톤 (죄 / 前 이름 / 악마 유래)

| 새 이름 | 7대죄 | 前 이름 | 악마 | 스켈레톤 |
|---|---|---|---|---|
| **릴리아** | (거울·희생) | 에스텔 | Lilith | [skeleton-lilia.md](./skeleton-lilia.md) *(표준 예시)* |
| **벨리안** | 식탐 暴食 | 발렌 | Beelzebub | [skeleton-belian.md](./skeleton-belian.md) |
| **루시엔** | 교만 傲慢 | 이졸데 | Lucifer | [skeleton-lucienne.md](./skeleton-lucienne.md) |
| **마논** | 탐욕 貪慾 | 로젤린 | Mammon | [skeleton-manon.md](./skeleton-manon.md) |
| **벨포르** | 나태 懶怠 | 이든 | Belphegor | [skeleton-belfor.md](./skeleton-belfor.md) |
| **리비아** | 시기 嫉妬 | 클로에 | Leviathan | [skeleton-livia.md](./skeleton-livia.md) |
| **레이먼** | 분노 憤怒 | 레이너 | Amon | [skeleton-reimon.md](./skeleton-reimon.md) |
| **아젤** | 색욕 色慾→타락한 사제 | 미카엘 | Asmodeus | [skeleton-azael.md](./skeleton-azael.md) |

## 공통 정합 축 (전 스켈레톤 준수 확인됨)
- 왕관의 밤 D-0 **6비트 골격 불변**: 고발 → 위증 거부(마논) → 봉랍 증언(아젤) → 확보(레이먼 명령/벨포르 집행, 표적=약혼자·집사) → 벨리안 "짐의 검을 시험하는가" → 카닐 실각.
- **엔딩 3게이트**(15/25/30화): BAD①·BAD②·엔딩③(GOOD 구원 / BAD 프롤로그 재현 / TRUE 카닐 '두 번' 떡밥 회수, 전 8루트 GOOD 관통 시).
- 캘린더 D-300(회귀)/270/200/150/90/30/0(왕관의 밤). 회귀=끝까지 캐릭터 비밀(무귀속 서늘함까지).
- 로맨스는 GOOD에서 불성립(벗 상한), BAD/파멸 분기에서만 어두운 감정선 개방.

## 다음 단계 (P2~)
1. STORY-BIBLE.md / SHARED-TIMELINE.md를 30화·멀티엔딩·개명으로 갱신.
2. 멀티엔딩 엔진 확장 설계 확정(flag/branch/endingType, 세이브 additive).
3. **코드 리네임 리팩터**(id·파일·주석·이미지 폴더·세이브 마이그레이션) — 카닐/약혼자 개명 확정 후.
4. 프롤로그부터 프로즈 집필 → `src/data/*_route.ts` 데이터화(다중 세션). 화당 tsc+부팅+어투 감사.
5. 밸런스 다이얼(대기타이머·코인) 조정 후 QA/배포.

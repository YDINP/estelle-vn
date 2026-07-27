// 루트 DOM 템플릿 — 화면 전체의 정적 골격 한 곳.
// 동적 부분(목록/그리드)은 각 screens/* 모듈이 컨테이너 안을 채운다.

import { MAX_AFFECTION, GIFT_COST, AD_REWARD, AFFECTION_ENABLED, COSMETICS_ENABLED } from "../state";
import { EAGER_IMG } from "./dom";

export function template(): string {
  return `
  <div class="stage">
    <div class="hud"><!-- 좌상단/우상단 분리 배치 — 중앙(캐릭터 머리)을 비움 -->
      <div class="hud-left">
        <button class="home-btn" id="btnMain" aria-label="메인으로">🏰</button>
        <button class="home-btn" id="btnMute" aria-label="소리">🔊</button>
      </div>
      <div class="hud-right">
        <div class="coins">🪙 <span id="coinVal">0</span></div>
      </div>
    </div>

    ${AFFECTION_ENABLED ? `
    <div class="aff-slider" aria-label="호감도"><!-- 우측 세로 게이지 (아래→위 충전) -->
      <span class="aff-tier" id="tierName">낯가림</span>
      <div class="aff-rail"><div id="affFill" class="aff-fill"></div></div>
      <span class="aff-val"><span id="affVal">0</span>/${MAX_AFFECTION}</span>
    </div>` : ""}

    <div class="character" id="char">
      <img class="portrait" id="charImg" alt="에스텔" ${EAGER_IMG} />
      ${COSMETICS_ENABLED ? `<div class="acc" id="charAcc"></div>` : ""}
    </div>

    <div class="bubble" id="bubble"></div>

    <div class="actions">
      <button class="btn" id="btnStory">📖 이야기</button>
      <button class="btn" id="btnDaily">🌸 오늘의 일상 <small id="dailyState"></small></button>
      ${AFFECTION_ENABLED ? `<button class="btn" id="btnGift">🎁 선물하기 <small>(${GIFT_COST}🪙)</small></button>` : ""}
      <button class="btn" id="btnCollect">🗂 수집</button>
    </div><!-- 옷장/선물/호감도: state.ts 플래그로 비활성 (코드·모달은 보존) -->
  </div>

  <div class="main-screen hidden" id="mainScreen">
    <button class="ms-mute" id="btnMuteMain" aria-label="소리">🔊</button>
    <div class="ms-inner">
      <div class="ms-crest">✧</div>
      <div class="ms-title">에스텔<br><span>— 스러진 봄의 약속 —</span></div>
      <div class="ms-sub">회귀한 당신이, 정해진 비극의 실을 하나씩 끊어낸다.<br>하나의 사건, 그러나 시점마다 다른 이야기.</div>
      <button class="btn ms-prologue" id="btnPrologue">✦ 프롤로그 — 스러진 봄</button>
      <div class="route-cards" id="routeCards"></div>
      <button class="btn ms-illust" id="btnMainCollect">🖼 일러스트 도감</button>
      <div class="ms-foot">캐릭터를 선택해 그 시점의 이야기를 시작하세요</div>
    </div>
  </div>

  <div class="modal hidden" id="closet">
    <div class="sheet">
      <div class="sheet-head">👗 옷장 <button class="x" id="closetX">✕</button></div>
      <div class="tabs">
        <button class="tab active" data-slot="outfit">의상</button>
        <button class="tab" data-slot="accessory">악세서리</button>
      </div>
      <div class="grid" id="closetGrid"></div>
    </div>
  </div>

  <div class="modal hidden" id="adModal">
    <div class="ad-card">
      <div class="ad-badge">광고</div>
      <div class="ad-spin"></div>
      <div class="ad-text">광고 재생 중… <span id="adCount">3</span>s</div>
      <div class="ad-note">시청 완료 후 코인이 지급됩니다</div>
    </div>
  </div>

  <div class="modal hidden" id="interAd">
    <div class="ad-card">
      <div class="ad-badge">광고</div>
      <div class="ad-spin"></div>
      <div class="ad-text">잠시 후 계속됩니다…</div>
      <div class="ad-note">전면 광고</div>
    </div>
  </div>

  <div class="modal hidden" id="coinShort">
    <div class="sheet mini-sheet">
      <div class="cs-msg">코인이 부족해요</div>
      <div class="cs-sub">📺 광고를 <b>끝까지 시청 후</b> +${AD_REWARD}🪙를 받을 수 있어요</div>
      <div class="cs-actions">
        <button class="btn ad" id="coinAdWatch">📺 광고 시청 후 +${AD_REWARD} 받기</button>
        <button class="btn ghost" id="coinAdClose">닫기</button>
      </div>
    </div>
  </div>

  <!-- 되돌릴 수 없는 동작(루트 재도전 등) 확인 -->
  <div class="modal hidden" id="confirmModal">
    <div class="sheet mini-sheet">
      <div class="cs-msg" id="confirmTitle"></div>
      <div class="cs-sub" id="confirmBody"></div>
      <div class="cs-actions">
        <button class="btn ad" id="confirmOk">확인</button>
        <button class="btn ghost" id="confirmCancel">취소</button>
      </div>
    </div>
  </div>

  <div class="modal hidden" id="storyList">
    <div class="sheet">
      <div class="sheet-head">📖 이야기 <button class="x" id="storyX">✕</button></div>
      <div class="route-ending-bar hidden" id="routeEndingBar"></div>
      <div class="story-items" id="storyItems"></div>
    </div>
  </div>

  <div class="modal hidden" id="collect">
    <div class="sheet">
      <div class="sheet-head">🗂 수집 <span id="collectCount" class="collect-count"></span>
        <button class="x" id="collectX">✕</button></div>
      <div class="tabs cat-tabs" id="collectCats">
        <button class="tab active" data-cat="illust">🖼 일러스트</button>
        <button class="tab" data-cat="lines">💬 대사</button>
        <button class="tab" data-cat="endings">🏆 엔딩</button>
      </div>
      <div class="tabs" id="collectTabs"></div>
      <div id="illustWrap"></div>
    </div>
  </div>

  <div class="modal hidden" id="illustView">
    <div class="illust-figure" id="illustFig"><img id="illustViewImg" alt="" ${EAGER_IMG} /></div>
    <div class="illust-cap" id="illustViewCap"></div>
    <div class="illust-modes hidden" id="illustViewModes">
      <button data-mode="bust" class="on">👤 반신</button>
      <button data-mode="chest">🙂 흉상</button>
      <button data-mode="body">🧍 전신</button>
    </div>
  </div>

  <div class="vn hidden" id="vn">
    <button class="vn-exit" id="vnExit" aria-label="나가기">✕</button>
    <button class="vn-log-btn" id="vnLogBtn" aria-label="대화 기록">📜</button>
    <div class="vn-portrait-wrap"><img class="vn-portrait" id="vnPortrait" alt="" ${EAGER_IMG} />
      <div class="ph-badge hidden" id="vnPh">임시</div></div>
    <div class="vn-cg hidden" id="vnCg"><img id="vnCgImg" alt="" ${EAGER_IMG} /></div>
    <div class="vn-box">
      <div class="panel">
        <div class="vn-name" id="vnName"></div>
        <div class="vn-text" id="vnText"></div>
        <div class="vn-hint" id="vnHint">▼</div>
      </div>
    </div>
    <div class="vn-choices hidden" id="vnChoices"></div>
    <div class="vn-backlog hidden" id="vnBacklog">
      <div class="vn-backlog-head">📜 대화 기록 <button class="x" id="vnBacklogX">✕</button></div>
      <div class="vn-backlog-list" id="vnBacklogList"></div>
    </div>
  </div>

  <!-- 루트 대본 청크 로딩 (동적 import 대기) -->
  <div class="modal hidden" id="routeLoading">
    <div class="rl-card"><div class="ad-spin"></div><div class="rl-text">이야기를 불러오는 중…</div></div>
  </div>

  <div class="toasts" id="toasts"></div>`;
}

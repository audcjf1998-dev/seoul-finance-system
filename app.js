"use strict";

const $ = id => document.getElementById(id);
const E = 1e8;
const won = n => (n == null || isNaN(n)) ? "–" : Math.round(n).toLocaleString("ko-KR") + "원";

function korUnit(n){
  if(!n) return "";
  const eok = Math.floor(n/E), man = Math.floor((n%E)/1e4), rest = n%1e4;
  let s = "";
  if(eok) s += eok.toLocaleString()+"억 ";
  if(man) s += man.toLocaleString()+"만 ";
  if(rest) s += rest.toLocaleString();
  return (s.trim()||"0")+"원";
}

const num = el => {
  if(!el) return 0;
  return parseInt((el.value||"").replace(/[^0-9]/g,""),10) || 0;
};

/* 콤마 입력 + 한글 읽기 */
function attachMoney(inp){
  if(!inp) return;
  inp.addEventListener("input", ()=>{
    const raw = inp.value.replace(/[^0-9]/g,"");
    inp.value = raw ? parseInt(raw,10).toLocaleString("ko-KR") : "";
    const hint = inp.id ? $(inp.id+"-kor") : null;
    if(hint) hint.textContent = raw ? "= "+korUnit(parseInt(raw,10)) : "";
    if (inp.id === "price" && typeof window.updateOptionStates === "function") {
      window.updateOptionStates();
    }
  });
}

/* ─────────────────── 글로벌 법령 호버 툴팁 사전에 정의 ─────────────────── */
const LEGAL_CLAUSES = {
  "령 §25·§30": "<b>지방계약법 시행령 제25조 및 제30조</b><br>추정가격 2천만원 이하(특례기업 5천만원 이하) 1인 견적 수의계약 근거 규정입니다.",
  "령 §25①5호·§30": "<b>지방계약법 시행령 제25조 제1항 제5호 및 제30조</b><br>전자공개 견적 수의계약 (공사 4억/2억/1.6억 이하, 용역·물품 1억원 이하) 대상 및 3일 이상(신규 5일) 안내공고 규정입니다.",
  "집행기준 제5장": "<b>행정안전부 예규 「입찰 및 계약 집행기준」 제5장</b><br>수의계약 운영요령 (견적서 징구, 수의계약 체결제한 여부 확인, 동일업체 연 4회/9회 제한 등) 세부 지침입니다.",
  "령 §35": "<b>지방계약법 시행령 제35조 (입찰공고 시기)</b><br>공사 금액별 7일~40일, 용역·물품 7일(신규 10일), 긴급·재공고 5일 — 게시일과 개찰일을 제외한 법정 공고기간입니다.",
  "적격심사 — 낙찰자 결정기준 제2~4장": "<b>행정안전부 예규 「낙찰자 결정기준」 제2~4장</b><br>입찰가격 및 수행능력(이행실적, 재무상태 등)을 종합 평가하여 낙찰하한율 이상 최적업체를 낙찰자로 결정하는 심사기준입니다.",
  "령 §43·§44": "<b>지방계약법 시행령 제43조 및 제44조</b><br>전문성·기술성·창의성이 필요한 용역·물품 계약 시 제안서 평가를 거쳐 낙찰자를 선정하는 협상에 의한 계약 규정입니다.",
  "낙찰자 결정기준 제7장": "<b>행정안전부 예규 「낙찰자 결정기준」 제7장</b><br>협상에 의한 계약 체결기준 (배점 80:20 구성, 정성평가 위원 구성 및 최고·최저점 제외 평균 산식) 규정입니다.",
  "기술 90 : 가격 10 (SW사업 준수사항)": "<b>소프트웨어 진흥법 제50조</b><br>SW 구축·개발 정보화사업은 기술능력 배점을 90% 이상 필수로 적용해야 합니다.",
  "협상적격 — 기술점수 85%↑": "<b>소프트웨어사업 계약지침</b><br>기술능력 평가 점수가 기술배점 한도(90점)의 85%인 76.5점 이상인 자를 협상적격자로 결정합니다.",
  "협상적격 종합 70점↑": "<b>행정안전부 예규 협상 체결기준</b><br>제안서 종합평가 점수(기술+가격)가 70점 이상인 자를 협상적격자로 선정합니다.",
  "견적서 1인 제출": "<b>1인 수의계약 절차</b><br>추정가격 2천만원 이하(특례 5천만원 이하)는 지정 1개 업체로부터 직인 날인된 견적서를 직접 제출받아 계약을 체결합니다.",
  "동일업체 연 4회/9회 제한": "<b>서울특별시 수의계약 운영지침</b><br>1인 견적 수의계약 시 동일 업체와의 체결 횟수는 동일 실·국별 연 4회, 서울시 전체 연 9회를 초과할 수 없습니다.",
  "변경계약 한도 2,200만원": "<b>서울특별시 수의계약 변경지침</b><br>소액 1인 수의계약 변경 시 증액 후 총 계약금액이 2,200만원(부가세 포함)을 초과할 수 없습니다.",
  "변경계약 한도 5,500만원": "<b>서울특별시 수의계약 변경지침</b><br>특례기업 1인 수의계약 변경 시 증액 후 총 계약금액이 5,500만원(부가세 포함)을 초과할 수 없습니다.",
  "일상감사 대상": "<b>서울특별시 일상감사 규정</b><br>발주 전 감사의견 징구 (공사 20억/10억, 용역 10억/협상 5억, 물품 5억, 수의 2천만원 초과)",
  "일상감사 제외 (5천만 이하 장애인·여성기업)": "<b>서울특별시 일상감사 예외지침</b><br>추정가격 5천만원 이하의 장애인기업·여성기업 수의계약은 일상감사 대상에서 제외됩니다.",
  "법정": "<b>법정 의무 절차</b><br>지방계약법령 및 관련 예규상 반드시 준수해야 하는 법적 의무 절차 및 기한입니다.",
  "통상": "<b>통상 내부절차</b><br>지방자치단체 내부 결재, 감사, 심의 등 실무 추진 시 소요되는 표준 행정 기간입니다."
};

function tagHtml(text, colorClass) {
  return `<span class="tag ${colorClass}">${text}</span>`;
}
window.tagHtml = tagHtml;

/* ─────────────────── 글로벌 플로팅 툴팁 엔진 ─────────────────── */
function initGlobalTooltip() {
  let tooltipEl = $("globalLegalTooltip");
  if (!tooltipEl) {
    tooltipEl = document.createElement("div");
    tooltipEl.id = "globalLegalTooltip";
    tooltipEl.className = "global-tip-box";
    document.body.appendChild(tooltipEl);
  }

  function showTip(e, text) {
    let key = text.trim();
    if (!LEGAL_CLAUSES[key] && key.includes(" · ")) {
      key = key.split(" · ")[0];
    }
    const html = LEGAL_CLAUSES[key] || LEGAL_CLAUSES[text.trim()];
    if (!html) return;

    tooltipEl.innerHTML = html;
    tooltipEl.style.display = "block";

    const rect = e.currentTarget.getBoundingClientRect();
    tooltipEl.style.opacity = "1";

    const tipWidth = tooltipEl.offsetWidth || 280;
    const tipHeight = tooltipEl.offsetHeight || 80;

    let top = rect.top - tipHeight - 10;
    let left = rect.left + (rect.width / 2) - (tipWidth / 2);

    if (top < 10) top = rect.bottom + 10;
    if (left < 10) left = 10;
    if (left + tipWidth > window.innerWidth - 10) left = window.innerWidth - tipWidth - 10;

    tooltipEl.style.top = (top + window.scrollY) + "px";
    tooltipEl.style.left = (left + window.scrollX) + "px";
  }

  function hideTip() {
    tooltipEl.style.opacity = "0";
    tooltipEl.style.display = "none";
  }

  window.attachLegalTooltips = function() {
    document.querySelectorAll(".tag, [data-tip]").forEach(el => {
      const text = el.getAttribute("data-tip") || el.textContent;
      let key = text.trim();
      if (!LEGAL_CLAUSES[key] && key.includes(" · ")) {
        key = key.split(" · ")[0];
      }
      const rawClause = LEGAL_CLAUSES[key] || LEGAL_CLAUSES[text.trim()];
      if (rawClause) {
        el.classList.add("has-legal-tip");
        el.setAttribute("title", rawClause.replace(/<[^>]*>/g, ' '));
        
        el.removeEventListener("mouseenter", el._tipShow);
        el.removeEventListener("mouseleave", el._tipHide);

        el._tipShow = (e) => showTip(e, text);
        el._tipHide = () => hideTip();

        el.addEventListener("mouseenter", el._tipShow);
        el.addEventListener("mouseleave", el._tipHide);
      }
    });
  };

  attachLegalTooltips();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll(".money").forEach(attachMoney);
  initGlobalTooltip();

  /* 탭 스위칭 */
  window.showTab = function(p){
    const userSession = JSON.parse(localStorage.getItem("seoul_user_session") || "null");
    if ((!userSession || !userSession.name) && p !== "login") {
      showStep("login");
      return;
    }
    document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("on",t.dataset.p===p));
    document.querySelectorAll(".panel").forEach(s=>{
      s.classList.toggle("on",s.id==="p-"+p);
      s.style.display = (s.id==="p-"+p) ? "block" : "none";
    });
    window.scrollTo({top:0,behavior:"smooth"});
    if (p === "gpt" && window.openAiChatbotWidget) {
      window.openAiChatbotWidget();
    }
    setTimeout(() => { if (window.attachLegalTooltips) window.attachLegalTooltips(); }, 50);
  };

  document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>showTab(t.dataset.p)));

  /* 업무 목적별 맞춤 바로가기 네비게이터 (상단 탭 바 100% 매칭) */
  window.navToPurpose = function(type) {
    const userSession = JSON.parse(localStorage.getItem("seoul_user_session") || "null");
    if (!userSession || !userSession.name) {
      showStep("login");
      return;
    }
    if (type === "guide") {
      showTab("guide");
      if (typeof window.showStep === "function") window.showStep("input");
      const pEl = $("price");
      if (pEl) {
        pEl.scrollIntoView({ behavior: "smooth", block: "center" });
        pEl.focus();
      }
    } else if (type === "check" || type === "timeline") {
      showTab("check");
    } else if (type === "calc" || type === "calc_helper") {
      showTab("calc");
    } else if (type === "rate") {
      showTab("rate");
    } else if (type === "g2b") {
      showTab("g2b");
    } else if (type === "ref") {
      showTab("ref");
    } else if (type === "forms") {
      showTab("forms");
    }
  };

  /* 옵션 토글 스타일 */
  document.querySelectorAll(".opt input").forEach(c=>{
    c.addEventListener("change",()=>{
      c.closest(".opt").classList.toggle("on",c.checked);
    });
  });

  /* ───── "해당 사항 없음" 토글 제어 ───── */
  const chkNone = $("chk-none");
  const optNone = $("opt-none");
  
  const specialIds = ["opt-special", "opt-severe", "opt-nego", "opt-festival", "opt-gam", "opt-it", "opt-itpub", "opt-itaudit", "opt-mat", "opt-mat-3ja", "opt-mat-mas", "opt-mat-self"];

  if (chkNone && optNone) {
    chkNone.addEventListener("change", () => {
      if (chkNone.checked) {
        optNone.classList.add("on");
        specialIds.forEach(id => {
          const el = $(id);
          if (el) {
            const inp = el.querySelector("input");
            if (inp) inp.checked = false;
            el.classList.remove("on");
          }
        });
        syncOpts();
      } else {
        optNone.classList.remove("on");
      }
    });

    specialIds.forEach(id => {
      const el = $(id);
      if (el) {
        const inp = el.querySelector("input");
        if (inp) {
          inp.addEventListener("change", () => {
            if (inp.checked) {
              chkNone.checked = false;
              optNone.classList.remove("on");
            }
          });
        }
      }
    });
  }

  /* 종류 칩 (초기 선택 없음 - 사용자 직접 클릭 필수) */
  let KIND = null;

  function updateKindDesc() {
    const descEl = $("kind-info-box");
    if (!descEl) return;
    if (!KIND) {
      descEl.style.display = "none";
      return;
    }
    descEl.style.display = "block";

    if (KIND === "gc") {
      descEl.innerHTML = '<div style="font-weight:700; color:#0f766e; margin-bottom:6px; font-size:0.92rem; display:flex; align-items:center; gap:6px;"><span>💡</span><span>🏗️ 종합공사 (종합건설업) 맞춤 발주 가이드</span></div>'
        + '<div style="color:#1e293b; line-height:1.7;">토목·건축·조경 등 5개 종합 업종. 종합적인 계획·관리·조정을 통한 복합 공종 총괄 시공.<br>'
        + '• <b>소액 수의계약 한도:</b> 2인 공개수의 <b>4억원 이하</b> (VAT 포함 4.4억원) · 1인 수의 2,000만원(특례 5,000만원) 이하<br>'
        + '• <b>주요 사전절차:</b> 원가계약심사 3억~5억원 이상 · 일상감사 20억원 이상 · 계약심의위원회 50억원 이상 (시본청 기준)</div>';
    } else if (KIND === "sc") {
      descEl.innerHTML = '<div style="font-weight:700; color:#0f766e; margin-bottom:6px; font-size:0.92rem; display:flex; align-items:center; gap:6px;"><span>💡</span><span>🛠️ 전문공사 (전문건설업) 맞춤 발주 가이드</span></div>'
        + '<div style="color:#1e293b; line-height:1.7;">실내건축·토공·방수·금속·도장 등 14개 전문 업종. 단일 전문 기술 시공.<br>'
        + '• <b>소액 수의계약 한도:</b> 2인 공개수의 <b>2억원 이하</b> (VAT 포함 2.2억원) · 1인 수의 2,000만원(특례 5,000만원) 이하<br>'
        + '• <b>주요 사전절차:</b> 원가계약심사 3억원 이상 · 일상감사 10억원 이상 · 계약심의위원회 30억원 이상</div>';
    } else if (KIND === "oc") {
      descEl.innerHTML = '<div style="font-weight:700; color:#0f766e; margin-bottom:6px; font-size:0.92rem; display:flex; align-items:center; gap:6px;"><span>💡</span><span>⚡ 그 밖의 공사 (전기 · 정보통신 · 소방 · 문화재) 맞춤 가이드</span></div>'
        + '<div style="color:#1e293b; line-height:1.7;">전기공사 · 정보통신공사 · 소방시설공사 · 문화재수리공사 (개별 법령 분리발주 원칙).<br>'
        + '• <b>소액 수의계약 한도:</b> 2인 공개수의 <b>1.6억원 이하</b> (VAT 포함 1.76억원) · 1인 수의 2,000만원(특례 5,000만원) 이하<br>'
        + '• <b>주요 사전절차:</b> 원가계약심사 3억원 이상 · 일상감사 10억원 이상 · 계약심의위원회 30억원 이상</div>';
    } else if (KIND === "service") {
      descEl.innerHTML = '<div style="font-weight:700; color:#0f766e; margin-bottom:6px; font-size:0.92rem; display:flex; align-items:center; gap:6px;"><span>💡</span><span>💼 용역 사업 맞춤 발주 가이드</span></div>'
        + '<div style="color:#1e293b; line-height:1.7;">학술연구, 일반용역, 엔지니어링·설계·감리 등 기술용역 및 정보화(SW) 사업.<br>'
        + '• <b>소액 수의계약 한도:</b> 2인 공개수의 <b>1억원 이하</b> (VAT 포함 1.1억원) · 1인 수의 2,000만원(특례 5,000만원) 이하<br>'
        + '• <b>주요 사전절차:</b> 원가계약심사 2억원 이상 (법정 대가 요율 적용 기술용역 면제) · 일상감사 10억원 이상 (협상계약 5억↑) · 계약심의위원회 20억원 이상</div>';
    } else {
      descEl.innerHTML = '<div style="font-weight:700; color:#0f766e; margin-bottom:6px; font-size:0.92rem; display:flex; align-items:center; gap:6px;"><span>💡</span><span>📦 물품 구매 · 납품계약 맞춤 가이드</span></div>'
        + '<div style="color:#1e293b; line-height:1.7;">행정 물품, 비품, 장비 구매 및 조달청 3자단가·MAS 다수공급자계약.<br>'
        + '• <b>소액 수의계약 한도:</b> 2인 공개수의 <b>1억원 이하</b> (VAT 포함 1.1억원) · 1인 수의 2,000만원(특례 5,000만원) 이하<br>'
        + '• <b>주요 사전절차:</b> 원가계약심사 2,000만원 이상 (조달청 3자단가 제외) · 일상감사 5억원 이상 · 계약심의위원회 10억원 이상</div>';
    }
  }
  window.updateKindDesc = updateKindDesc;

  const kindEl = $("kind");
  if (kindEl) {
    kindEl.querySelectorAll(".chip").forEach(ch=>{
      ch.addEventListener("click",()=>{
        KIND = ch.dataset.k;
        kindEl.querySelectorAll(".chip").forEach(x=>x.classList.toggle("on",x===ch));
        const subFields = $("input-sub-fields");
        if (subFields) {
          subFields.style.display = "block";
          subFields.classList.remove("fade-in");
          void subFields.offsetWidth;
          subFields.classList.add("fade-in");
        }
        updateKindDesc();
        syncOpts();
        updateOptionStates();
      });
    });
  }

  const KINFO = {
    goods:{name:"물품", two:1e8, isC:false},
    service:{name:"용역", two:1e8, isC:false},
    gc:{name:"종합공사", two:4e8, isC:true},
    sc:{name:"전문공사", two:2e8, isC:true},
    oc:{name:"그 밖의 공사", two:1.6e8, isC:true}
  };

  /* ───── 계약 방식 (수의/입찰/협상/관급자재 구매) 상호 배타적 단일 선택 제어 ───── */
  /* 수의계약 세부 특례 옵션(sui-subs) 펼침/접힘 동기화 */
  function syncSui() {
    const suiInp = $("chk-sui");
    const suiSubs = $("sui-subs");
    if (!suiSubs) return;

    const spInp = $("opt-special") ? $("opt-special").querySelector("input") : null;
    const seInp = $("opt-severe") ? $("opt-severe").querySelector("input") : null;
    const isSubChecked = (spInp && spInp.checked) || (seInp && seInp.checked);

    // 하위 수의 특례(여성·장애인기업 등)가 체크된 경우 부모 수의계약 체크 상태 유지
    if (isSubChecked && suiInp) {
      suiInp.checked = true;
      const elSui = $("opt-sui");
      if (elSui) {
        elSui.classList.add("on");
        elSui.classList.remove("disabled-opt");
      }
    }

    const isSuiChecked = suiInp && suiInp.checked;
    suiSubs.style.display = isSuiChecked ? "block" : "none";
  }
  window.syncSui = syncSui;

  const setupContractMethodRadio = () => {
    const groupIds = ["opt-sui", "opt-bid", "opt-nego", "opt-mat"];
    groupIds.forEach(id => {
      const el = $(id);
      if (!el) return;
      const inp = el.querySelector("input");
      if (!inp) return;
      inp.addEventListener("change", () => {
        if (inp.checked) {
          groupIds.forEach(otherId => {
            if (otherId !== id) {
              const otherEl = $(otherId);
              if (otherEl) {
                const c = otherEl.querySelector("input");
                if (c) c.checked = false;
                otherEl.classList.remove("on");
              }
            }
          });
          el.classList.add("on");
          if (id === "opt-nego" || id === "opt-mat") {
            const badgeSui = $("badge-sui-rec");
            const badgeBid = $("badge-bid-rec");
            if (badgeSui) badgeSui.style.display = "none";
            if (badgeBid) badgeBid.style.display = "none";
          }
          if (id === "opt-sui") syncSui();
          if (id !== "opt-sui") syncSui();
          if (id === "opt-nego") syncFestival();
          if (id === "opt-mat") syncMat();
          if (id !== "opt-mat") syncMat();
        } else {
          el.classList.remove("on");
          if (id === "opt-sui") syncSui();
          if (id === "opt-mat") syncMat();
        }
      });
    });
  };
  setupContractMethodRadio();

  /* ───── 옵션 가능 여부 및 금액별 자동 추천/동적 검증 (사용 불가 제어) ───── */
  function updateOptionStates() {
    const p = num($("price"));
    const k = KINFO[KIND];

    // 1. 수의계약 법정 소액 한도 계산
    let suiLimit = 5.5e7;
    let limitText = "5,500만원";
    if (KIND === "gc") { suiLimit = 2*E; limitText = "2억원"; }
    else if (KIND === "sc") { suiLimit = 1*E; limitText = "1억원"; }
    else if (KIND === "oc") { suiLimit = 8e7; limitText = "8,000만원"; }

    // (A) 수의계약 (opt-sui) 한도 초과 검증
    const elSui = $("opt-sui");
    const inpSui = $("chk-sui");
    const badgeSuiRec = $("badge-sui-rec");
    const badgeSuiDis = $("badge-sui-dis");

    const suiDisabled = (p > 0 && p > suiLimit);

    if (suiDisabled) {
      if (inpSui) { inpSui.checked = false; inpSui.disabled = true; }
      if (elSui) { elSui.classList.remove("on"); elSui.classList.add("disabled-opt"); }
      if (badgeSuiRec) badgeSuiRec.style.display = "none";
      if (badgeSuiDis) {
        badgeSuiDis.textContent = `[사용 불가: 수의 한도(${limitText}) 초과]`;
        badgeSuiDis.style.display = "inline-block";
      }
    } else {
      if (inpSui) inpSui.disabled = false;
      if (elSui) elSui.classList.remove("disabled-opt");
      if (badgeSuiDis) badgeSuiDis.style.display = "none";
    }

    // (B) 특례 기업 (opt-special) 한도 초과 검증 (5,500만원 초과 불가)
    const elSpecial = $("opt-special");
    const inpSpecial = elSpecial ? elSpecial.querySelector("input") : null;
    const badgeSpecialDis = $("badge-special-dis");

    const specialDisabled = (p > 0 && p > 5.5e7);

    if (specialDisabled) {
      if (inpSpecial) { inpSpecial.checked = false; inpSpecial.disabled = true; }
      if (elSpecial) { elSpecial.classList.remove("on"); elSpecial.classList.add("disabled-opt"); }
      if (badgeSpecialDis) {
        badgeSpecialDis.textContent = "[사용 불가: 특례 한도(5.5천만원) 초과]";
        badgeSpecialDis.style.display = "inline-block";
      }
    } else {
      if (inpSpecial) inpSpecial.disabled = false;
      if (elSpecial) elSpecial.classList.remove("disabled-opt");
      if (badgeSpecialDis) badgeSpecialDis.style.display = "none";
    }

    // (C) 협상에 의한 계약 (opt-nego) 공사 계약 적용 불가 검증
    const elNego = $("opt-nego");
    const inpNego = elNego ? elNego.querySelector("input") : null;
    const badgeNegoDis = $("badge-nego-dis");

    const negoDisabled = k.isC;

    if (negoDisabled) {
      if (inpNego) { inpNego.checked = false; inpNego.disabled = true; }
      if (elNego) { elNego.classList.remove("on"); elNego.classList.add("disabled-opt"); }
      if (badgeNegoDis) {
        badgeNegoDis.textContent = "[사용 불가: 공사 계약 적용 불가]";
        badgeNegoDis.style.display = "inline-block";
      }
    } else {
      if (inpNego) inpNego.disabled = false;
      if (elNego) elNego.classList.remove("disabled-opt");
      if (badgeNegoDis) badgeNegoDis.style.display = "none";
    }

    // (D) 금액 기반 자동 추천 로직 (금액이 있을 때만 동작)
    const badgeBidRec = $("badge-bid-rec");
    const elBid = $("opt-bid");
    const inpBid = $("chk-bid");

    const isNegoChecked = inpNego ? inpNego.checked : false;
    const isMatChecked = $("opt-mat") ? $("opt-mat").querySelector("input").checked : false;

    const spInp = $("opt-special") ? $("opt-special").querySelector("input") : null;
    const seInp = $("opt-severe") ? $("opt-severe").querySelector("input") : null;
    const isSubChecked = (spInp && spInp.checked) || (seInp && seInp.checked);

    if (!p || p <= 0) {
      // 금액 미입력(또는 0원)일 때는 자동 추천하지 않되, 수의 세부 특례가 이미 체크된 경우 수의계약 유지
      if (!isSubChecked && inpSui) { inpSui.checked = false; if (elSui) elSui.classList.remove("on"); }
      if (inpBid) { inpBid.checked = false; if (elBid) elBid.classList.remove("on"); }
      if (badgeSuiRec) badgeSuiRec.style.display = "none";
      if (badgeBidRec) badgeBidRec.style.display = "none";
    } else if (isNegoChecked || isMatChecked) {
      // 협상계약 또는 관급자재 구매 선택 시 수의계약/경쟁입찰 자동 체크를 방지하고 추천 태그도 숨김
      if (badgeSuiRec) badgeSuiRec.style.display = "none";
      if (badgeBidRec) badgeBidRec.style.display = "none";
      if (isMatChecked) {
        if (!isSubChecked && inpSui) { inpSui.checked = false; if (elSui) elSui.classList.remove("on"); }
        if (inpBid) { inpBid.checked = false; if (elBid) elBid.classList.remove("on"); }
      }
    } else {
      // 1인 수의 한도 기준: 기본 2,000만원 (VAT 2,200만원) / 특례기업 5,000만원 (VAT 5,500만원)
      const isOneLimitOk = p <= 2.2e7 || (isSubChecked && p <= 5.5e7);

      if (p <= suiLimit) {
        if (isOneLimitOk) {
          // 1인 견적 수의계약 한도 이내 (2천만원 이하 또는 특례 적용 시)
          if (inpSui && !inpSui.disabled) {
            inpSui.checked = true;
            if (elSui) elSui.classList.add("on");
          }
          if (inpBid) {
            inpBid.checked = false;
            if (elBid) elBid.classList.remove("on");
          }
          if (badgeSuiRec) {
            badgeSuiRec.textContent = isSubChecked ? "[추천: 특례 1인 수의]" : "[추천: 1인 수의]";
            badgeSuiRec.style.background = "#10b981";
            badgeSuiRec.style.display = "inline-block";
          }
          if (badgeBidRec) badgeBidRec.style.display = "none";
        } else {
          // 2천만원 초과 5,500만원 이하이고 특례 미체크 시 ➔ 1인 수의 불가, 2인 이상 전자견적 수의 대상
          if (inpSui) {
            inpSui.checked = false;
            if (elSui) elSui.classList.remove("on");
          }
          if (inpBid) {
            inpBid.checked = false;
            if (elBid) elBid.classList.remove("on");
          }
          if (badgeSuiRec) {
            badgeSuiRec.textContent = "[2인 이상 전자견적 수의 대상 (1인 수의 2천만원 초과)]";
            badgeSuiRec.style.background = "#3b82f6";
            badgeSuiRec.style.display = "inline-block";
          }
          if (badgeBidRec) badgeBidRec.style.display = "none";
        }
      } else {
        // 5,500만원 초과 시 수의계약 불가 ➔ 경쟁입찰 추천
        if (inpSui) {
          inpSui.checked = false;
          if (elSui) elSui.classList.remove("on");
        }
        if (inpBid) {
          inpBid.checked = true;
          if (elBid) elBid.classList.add("on");
        }
        if (badgeBidRec) badgeBidRec.style.display = "inline-block";
        if (badgeSuiRec) badgeSuiRec.style.display = "none";
      }
    }
    if (typeof syncSui === "function") syncSui();
  }
  window.updateOptionStates = updateOptionStates;

  function syncGam() {
    const gamInp = $("opt-gam") ? $("opt-gam").querySelector("input") : null;
    const gamSubs = $("gam-subs");
    if (gamSubs) {
      const isGamChecked = gamInp && gamInp.checked && KIND === "service";
      gamSubs.style.display = isGamChecked ? "block" : "none";
      if (!isGamChecked) {
        const lcInp = $("opt-gam-legal-cost") ? $("opt-gam-legal-cost").querySelector("input") : null;
        if (lcInp) lcInp.checked = false;
        if ($("opt-gam-legal-cost")) $("opt-gam-legal-cost").classList.remove("on");
      }
    }
  }
  window.syncGam = syncGam;

  const gamChk = $("opt-gam") ? $("opt-gam").querySelector("input") : null;
  if (gamChk) gamChk.addEventListener("change", syncGam);

  ["opt-special", "opt-severe", "opt-nego", "opt-gam-legal-cost", "opt-disaster", "opt-legal-exempt"].forEach(id => {
    const el = $(id);
    if (el) {
      const inp = el.querySelector("input");
      if (inp) inp.addEventListener("change", updateOptionStates);
    }
  });

  function syncOpts(){
    if (!KIND || !KINFO[KIND]) return;
    const isC = KINFO[KIND].isC;
    ["opt-severe","opt-nego","opt-it"].forEach(id=>{
      const el = $(id);
      if(el) {
        el.style.display = isC ? "none" : "";
        if(isC){ const c = el.querySelector("input"); if(c) c.checked = false; el.classList.remove("on"); }
      }
    });
    const g = $("opt-gam");
    if(g) {
      g.style.display = (KIND==="service") ? "" : "none";
      if(KIND!=="service"){ const gc = g.querySelector("input"); if(gc) gc.checked = false; g.classList.remove("on"); }
    }
    syncGam();
    const m = $("opt-mat");
    if(m) {
      const isGoods = (KIND === "goods");
      m.style.display = isGoods ? "" : "none";
      if(!isGoods){ const mc = m.querySelector("input"); if(mc) mc.checked = false; m.classList.remove("on"); }
    }
    syncFestival();
    syncIt();
    syncMat();
  }
  window.syncOpts = syncOpts;
  window.syncFestival = syncFestival;
  window.syncMat = syncMat;

  function syncFestival(){
    const negoEl = $("opt-nego");
    const on = negoEl && negoEl.querySelector("input").checked && !KINFO[KIND].isC;
    const f = $("opt-festival");
    if(f) {
      f.style.display = on ? "" : "none";
      if(!on){ const c = f.querySelector("input"); if(c) c.checked = false; f.classList.remove("on"); }
    }
  }

  function syncIt(){
    const itEl = $("opt-it");
    const on = itEl && itEl.querySelector("input").checked && !KINFO[KIND].isC;
    const subs = $("it-subs");
    if(subs) subs.style.display = on ? "" : "none";
    if(!on){
      ["opt-itnew","opt-itmaint","opt-itpub","opt-itaudit"].forEach(id=>{
        const sub = $(id);
        if(sub){
          const c = sub.querySelector("input");
          if(c) c.checked = false;
          sub.classList.remove("on");
        }
      });
    }
  }

  function syncMat(){
    const matEl = $("opt-mat");
    const on = matEl && matEl.querySelector("input").checked && (KIND === "goods");
    const subs = $("mat-subs");
    if(subs) subs.style.display = on ? "" : "none";
    if(!on){
      ["opt-mat-3ja","opt-mat-mas","opt-mat-self"].forEach(id=>{
        const sub = $(id);
        if(sub){
          const c = sub.querySelector("input");
          if(c) c.checked = false;
          sub.classList.remove("on");
        }
      });
    }
  }

  const setupMatRadio = (targetId, otherIds) => {
    const targetEl = $(targetId);
    if (!targetEl) return;
    const inp = targetEl.querySelector("input");
    if (!inp) return;
    inp.addEventListener("change", () => {
      if (inp.checked) {
        otherIds.forEach(id => {
          const el = $(id);
          if (el) {
            const c = el.querySelector("input");
            if (c) c.checked = false;
            el.classList.remove("on");
          }
        });
      }
    });
  };
  setupMatRadio("opt-mat-3ja", ["opt-mat-mas", "opt-mat-self"]);
  setupMatRadio("opt-mat-mas", ["opt-mat-3ja", "opt-mat-self"]);
  setupMatRadio("opt-mat-self", ["opt-mat-3ja", "opt-mat-mas"]);

  const itMaintInp = $("opt-itmaint") ? $("opt-itmaint").querySelector("input") : null;
  if (itMaintInp) {
    itMaintInp.addEventListener("change", () => {
      if (itMaintInp.checked) {
        ["opt-itnew", "opt-itaudit"].forEach(id => {
          const el = $(id);
          if (el) {
            const c = el.querySelector("input");
            if (c) c.checked = false;
            el.classList.remove("on");
          }
        });
      }
    });
  }
  const itNewInp = $("opt-itnew") ? $("opt-itnew").querySelector("input") : null;
  if (itNewInp) {
    itNewInp.addEventListener("change", () => {
      if (itNewInp.checked && itMaintInp) {
        itMaintInp.checked = false;
        $("opt-itmaint").classList.remove("on");
      }
    });
  }
  const itAuditInp = $("opt-itaudit") ? $("opt-itaudit").querySelector("input") : null;
  if (itAuditInp) {
    itAuditInp.addEventListener("change", () => {
      if (itAuditInp.checked && itMaintInp) {
        itMaintInp.checked = false;
        $("opt-itmaint").classList.remove("on");
      }
    });
  }

  const negoChk = $("opt-nego") ? $("opt-nego").querySelector("input") : null;
  if(negoChk) negoChk.addEventListener("change", syncFestival);

  const itChk = $("opt-it") ? $("opt-it").querySelector("input") : null;
  if(itChk) itChk.addEventListener("change", syncIt);

  const matChk = $("opt-mat") ? $("opt-mat").querySelector("input") : null;
  if(matChk) matChk.addEventListener("change", syncMat);

  syncOpts();

  /* ───── 판단 로직 ───── */
  function decide(){
    if (!KIND || !KINFO[KIND]) return null;
    const k = KINFO[KIND], p = num($("price"));
    const special = $("opt-special") ? $("opt-special").querySelector("input").checked : false;
    const severe = $("opt-severe") ? ($("opt-severe").querySelector("input").checked && !k.isC) : false;
    const rawNego = $("opt-nego") ? ($("opt-nego").querySelector("input").checked && !k.isC) : false;
    const festival = rawNego && $("opt-festival") && $("opt-festival").querySelector("input").checked;
    const it = $("opt-it") ? ($("opt-it").querySelector("input").checked && !k.isC) : false;
    const itNew = it && $("opt-itnew") && $("opt-itnew").querySelector("input").checked;
    const itMaint = it && $("opt-itmaint") && $("opt-itmaint").querySelector("input").checked;
    const itPub = it && $("opt-itpub") && $("opt-itpub").querySelector("input").checked;
    const itAudit = it && $("opt-itaudit") && $("opt-itaudit").querySelector("input").checked;
    const gam = KIND==="service" && $("opt-gam") && $("opt-gam").querySelector("input").checked;
    const gamLegalCost = gam && $("opt-gam-legal-cost") && $("opt-gam-legal-cost").querySelector("input").checked;
    const disaster = $("opt-disaster") ? $("opt-disaster").querySelector("input").checked : false;
    const legalExempt = $("opt-legal-exempt") ? $("opt-legal-exempt").querySelector("input").checked : false;

    const mat = $("opt-mat") ? $("opt-mat").querySelector("input").checked : false;
    const mat3ja = mat && $("opt-mat-3ja") && $("opt-mat-3ja").querySelector("input").checked;
    const matMas = mat && $("opt-mat-mas") && $("opt-mat-mas").querySelector("input").checked;
    const matSelf = mat && $("opt-mat-self") && $("opt-mat-self").querySelector("input").checked;

    // SW 감리는 법령(전자정부법 §57, SW진흥법)상 협상에 의한 계약 필수 대상!
    const nego = rawNego || itAudit;

    const oneLimit = severe ? Infinity : (special ? 5e7 : 2e7);
    const oneOk = p>0 && p<=oneLimit;
    const twoOk = p>0 && p<=k.two;
    const rec = nego ? "nego" : (oneOk ? "one" : (twoOk ? "two" : "bid"));
    const noticeDays = nego ? (p<1e8?10 : p<10*E?20 : 40)
                           : (k.isC ? (p<10*E?7 : p<50*E?15 : 30) : 7);
    const quoteRate = k.isC ? "89.745%" : (p<=2e7 ? "90%" : "88%");

    /* 사전절차 면제 / 제외 판정 */
    const costExemptReason = (()=>{
      if (legalExempt) return "법정 의무 경비·인건비·공공요금 ➔ 원가계약심사 면제 (서울시 계약심사 규칙 §3)";
      if (disaster) return "재난복구·긴급구호 사업 ➔ 계약심사 면제 (사후통보 대체)";
      if (mat3ja) return "조달청 제3자 단가계약 물품 ➔ 원가계약심사 면제 (서울시 계약심사 규칙 §3)";
      if (severe) return "중증장애인생산품 직접 구매 ➔ 원가계약심사 면제 (특별법 §7)";
      if (gamLegalCost) return "법정 대가기준(엔지니어링·건설기술 대가요율) 직접 적용 기술용역 ➔ 원가계약심사 제외 (서울시 계약심사 규칙 §3)";
      if (p > 0 && p <= 2e7) return "추정가격 2,000만원 이하 소액 ➔ 원가계약심사 면제";
      return null;
    })();

    const cost = (()=>{
      if (costExemptReason) return null; // 면제 대상 시 원가심사 의뢰 대상 제외
      if (k.isC && p >= 3*E) return "공사 — 공종에 따라 3억원(전문·전기·통신 등) 또는 5억원(종합) 이상";
      if (KIND === "service" && p >= 2*E) return "용역 2억원 이상 (※ 법정 대가기준 직접 적용 기술용역은 심사 제외)";
      if (KIND === "goods" && p >= 2e7) return "물품 구매 2,000만원 이상 (※ 조달청 3자단가 제외)";
      return null;
    })();

    const auditExemptReason = (()=>{
      if (legalExempt) return "법정 의무 경비·인건비·공공요금 ➔ 일상감사 면제 (서울시 일상감사 세칙 §4)";
      if (disaster) return "긴급 재난복구 사업 ➔ 일상감사 사전절차 면제 (사후통보 대체)";
      if (mat3ja) return "조달청 제3자 단가계약 물품 ➔ 일상감사 면제 (서울시 일상감사 세칙 §4)";
      return null;
    })();

    const audit = (()=>{
      if (auditExemptReason) return null;
      if (nego) return festival ? (p >= 1e8 ? "축제·행사 협상 계약 1억원 이상" : null)
                               : (p >= 5*E ? "협상에 의한 계약 5억원 이상" : null);
      if (KIND === "gc" && p >= 20*E) return "종합공사 20억원 이상";
      if ((KIND === "sc" || KIND === "oc") && p >= 10*E) return "공사(종합 외) 10억원 이상";
      if (KIND === "service" && p >= 10*E) return "용역 10억원 이상 (협상계약은 5억↑)";
      if (KIND === "goods" && p >= 5*E) return "물품 5억원 이상 (조달청 제3자단가 제외)";
      if (rec === "one" && p > 2e7) return (special && p <= 5e7) ? null : "1인 견적 수의계약 2천만원 초과";
      return null;
    })();

    const spec = ((rec==="bid"||nego) && p>=5e7 && !mat3ja && !disaster)
      ? "입찰 대상 5천만원 이상 — 나라장터 사전규격 공개"+(nego?" (신규사업은 금액 무관)":"") : null;

    const agree = (()=>{
      if(k.isC && p>=10*E) return "공사 10억원 이상";
      if(KIND==="service" && p>=5*E) return "용역 5억원 이상";
      if(KIND==="goods" && p>=2*E) return "물품 구매 2억원 이상 (제조는 5억↑)";
      if(nego) return "협상에 의한 계약 — 계약의뢰 시 재정합의 필수";
      return null;
    })();

    const ombudsmanExemptReason = (()=>{
      if (rec === "one" || severe || mat3ja) return "1인 수의계약 및 3자단가계약 ➔ 시민감사옴부즈만 입회 면제";
      return null;
    })();

    const ombudsman = (()=>{
      if (ombudsmanExemptReason) return null;
      if (k.isC && p >= 30*E) return "공사 30억원 이상 — 제안서/입찰 평가위 개최 7일 전 시민감사옴부즈만 입회·감시 요청";
      if (KIND === "service" && p >= 5*E) return "용역 5억원 이상 — 제안서 평가위원회 개최 7일 전 시민감사옴부즈만 입회·감시 요청";
      if (KIND === "goods" && p >= 1*E) return "물품 구매 1억원 이상 — 제안서/입찰 평가위원회 개최 7일 전 시민감사옴부즈만 입회·감시 요청";
      return null;
    })();

    /* 계약심의위원회 심의 대상 판정 (지방계약법 §32, 령 §108) */
    const committee = (()=>{
      if (KIND === "service" && p >= 20*E) {
        return "용역 20억원 이상 — 입찰공고/계약의뢰 전 계약심의위원회 심의 필수 (계약방법 · 입찰참가자격 · 낙찰자결정방법 심의)";
      }
      if (k.isC && p >= 50*E) {
        return "공사 50억원 이상 (자치구 30억↑) — 입찰공고 전 계약심의위원회 심의 필수";
      }
      if (KIND === "goods" && p >= 10*E) {
        return "물품 구매·제조 10억원 이상 — 입찰공고 전 계약심의위원회 심의 필수";
      }
      return null;
    })();

    return {k,p,special,severe,nego,festival,it,itNew,itMaint,itPub,itAudit,gam,gamLegalCost,disaster,legalExempt,mat,mat3ja,matMas,matSelf,oneLimit,oneOk,twoOk,rec,noticeDays,quoteRate,audit,auditExemptReason,cost,costExemptReason,spec,agree,ombudsman,ombudsmanExemptReason,committee};
  }

  /* ───── 타임라인 ───── */
  function buildTimeline(d){
    const pre = [];
    if(d.rec==="nego"){
      pre.push({t:"제안요청서 · 과업지시서 작성", tag:"통상", days:[5,10], soft:true, s:"평가요소·방법 명시 · 부당계약 문구 검토"});
    } else {
      pre.push({t:"발주 준비 — 과업내용서·예산 확정", tag:"통상", days:[3,5], soft:true});
    }
    if(d.committee) pre.push({t:"계약심의위원회 심의", tag:"법정", days:[7,14], s:d.committee});
    if(d.cost) pre.push({t:"원가(계약)심사", tag:"통상", days:[5,10], soft:true, s:d.cost});
    if(d.audit) pre.push({t:"일상감사", tag:"통상", days:[3,7], soft:true, s:d.audit});
    if(d.gam && d.p>=3e7) pre.push({t:"기술용역 타당성 심사", tag:"통상", days:[7,14], soft:true, s:"기술심사담당관 — 용역 필요성·대가 적정성 (예산 반영 전 원칙, 당해연도 사업은 발주 전)"});
    if(d.gam && d.p>=2.3*E) pre.push({t:"사업수행능력(PQ) 세부기준 심의", tag:"통상", days:[5,10], soft:true, s:"건설기술심의 — 시 표준기준과 동일하면 서면협의로 대체"});
    if(d.it){
      pre.push({t:"과업심의위원회 (SW 과업 확정)", tag:"통상", days:[5,10], soft:true, s:"모든 SW사업 대상 · 과업내용 및 계약기간 확정"});
      if(d.itNew || d.p>=2*E) pre.push({t:"행안부 사전협의", tag:"법정", days:[30,30], s:d.itNew ? "신규 정보화사업 — 발주 40일 전 IRM 신청 · 검토 30일" : "유지보수·계속사업 2억원 이상 — 발주 40일 전 IRM 신청 · 검토 30일"});
      if(!d.itAudit && !d.itMaint){
        pre.push({t:"정보통신 보안성 검토", tag:"통상", days:[5,10], soft:true, s:"정보보안과 (중요 사업은 국정원) · 검토 결과 제안요청서 반영"});
      }
    }
    if(d.spec) pre.push({t:"사전규격 공개", tag:"통상", days:[5,5], soft:true, s:"공개 5일(긴급 3일)"+(d.it?" · SW사업 영향평가 결과 함께 공개":"")});
    if(d.rec==="nego"){
      pre.push({t:"제안서평가위원회 예비명부 구성", tag:"통상", days:[5,7], soft:true, s:"위원 수 3배수(21~30인) · 공공감사담당관(일상감사팀장) 협조결재"});
      pre.push({t:"입찰공고 (협상)", tag:"법정", days:[d.noticeDays,d.noticeDays], s:"1억 미만 10일(신규 15일) · 1억~10억 20일 · 10억 이상 40일 — 게시일·개찰일 제외, 긴급·재공고 10일"});
      pre.push({t:"제안서 평가 — 정량·정성·가격", tag:"통상", days:[3,7], soft:true, s:"위원장 포함 7인 이상 출석 · 최고·최저 위원 점수 제외 산술평균"});
      pre.push({t:"협상 (기술 → 가격) · 낙찰자 결정", tag:"통상", days:[5,10], soft:true, s:"종합 70점 이상 협상적격자 (SW사업은 기술점수 85% 이상) · 1순위 불성립 시 2순위"});
    } else if(d.rec==="bid"){
      pre.push({t:"입찰공고", tag:"법정", days:[d.noticeDays,d.noticeDays], s:"추정가격 기준 "+d.noticeDays+"일 이상 (재공고·긴급 5일)"});
      if(d.gam && d.p>=2.3*E) pre.push({t:"사업수행능력평가(PQ)", tag:"통상", days:[7,14], soft:true, s:"평가서류 심사 — 적격자에 한해 가격개찰 진행"});
      pre.push({t:"개찰 · 적격심사", tag:"통상", days:[7,14], soft:true, s:"낙찰하한율 참고 — 📊 탭"});
    } else if(d.rec==="two"){
      pre.push({t:"전자공개 견적 안내공고", tag:"법정", days:[3,5], s:"3일 이상 (신규 사업자 대상 5일) · 견적률 "+d.quoteRate+" 이상"});
    } else {
      pre.push({t:"견적서 징구 · 가격 검토", tag:"통상", days:[1,3], soft:true});
    }
    pre.push({t:"계약 체결", tag:"법정", days:[1,10], s:"낙찰(결정) 통지 후 10일 이내 · 보증금·인지세 등 확인"});
    const post = [
      {t:"검사", tag:"법정", days:[1,14], s:"이행 완료 통지 후 14일 이내"},
      {t:"대가 지급", tag:"법정", days:[1,5], s:"검사 후 청구일부터 5일 이내"}
    ];
    let lo=0, hi=0;
    pre.forEach(x=>{lo+=x.days[0];hi+=x.days[1];});
    let html = '<div class="tl">';
    pre.forEach(x=>{ html += tlItem(x); });
    html += '<div class="tl-gap">— 계약이행 기간 (과업 내용에 따라 다름) —</div>';
    post.forEach(x=>{ html += tlItem(x); });
    html += '</div>';
    html += '<div class="tl-sum">⏳ 발주 준비부터 계약 체결까지 <b>약 '+lo+' ~ '+hi+'일</b> · 이행 완료 후 대금 수령까지 최대 <b>19일</b></div>';
    html += '<p class="note">「통상」 표시는 기관 사정에 따라 달라지는 내부 처리 기간(예시)이고, 「법정」은 법령·지침상 기간이에요. 절차 일부는 동시에 진행해 단축할 수 있어요.</p>';
    return html;
  }

  function tlItem(x){
    const dd = x.days[0]===x.days[1] ? x.days[0]+"일" : x.days[0]+"~"+x.days[1]+"일";
    return '<div class="tl-i'+(x.soft?' soft':'')+'"><div class="h"><b>'+x.t+'</b>'
      + tagHtml(x.tag + " · " + dd, x.tag === "법정" ? "b" : "g") +'</div>'
      +(x.s?'<div class="d">'+x.s+'</div>':'')+'</div>';
  }

  /* ───── Step Login ↔ Step 0(Landing) ↔ Step 1(Input) ↔ Step 2(Result) 페이지 전환 기능 ───── */
  function showStep(stepName) {
    const userSession = JSON.parse(localStorage.getItem("seoul_user_session") || "null");
    if ((!userSession || !userSession.name) && stepName !== "login") {
      stepName = "login";
    }

    const loginView = $("step-login");
    const landingView = $("step-landing");
    const inputView = $("step-input");
    const resultView = $("step-result");

    if (loginView) loginView.style.setProperty("display", (stepName === "login") ? "block" : "none", "important");
    if (landingView) landingView.style.setProperty("display", (stepName === "landing") ? "block" : "none", "important");
    if (inputView) inputView.style.setProperty("display", (stepName === "input") ? "block" : "none", "important");
    if (resultView) resultView.style.setProperty("display", (stepName === "result") ? "block" : "none", "important");

    const mainTabsWrap = $("main-tabs-wrap") || document.querySelector(".tabs-wrap");

    if (stepName === "login") {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("on"));
      document.querySelectorAll(".panel").forEach(p => {
        p.classList.toggle("on", p.id === "p-guide");
        p.style.setProperty("display", p.id === "p-guide" ? "block" : "none", "important");
      });
      if (mainTabsWrap) mainTabsWrap.style.setProperty("display", "none", "important");
    } else if (stepName === "landing") {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("on"));
      document.querySelectorAll(".panel").forEach(p => {
        p.classList.toggle("on", p.id === "p-guide");
        p.style.setProperty("display", p.id === "p-guide" ? "block" : "none", "important");
      });
      if (mainTabsWrap) mainTabsWrap.style.setProperty("display", "flex", "important");
    } else if (stepName === "input" || stepName === "result") {
      document.querySelectorAll(".tab").forEach(t => t.classList.toggle("on", t.dataset.p === "guide"));
      if (mainTabsWrap) mainTabsWrap.style.setProperty("display", "flex", "important");
    }

    const targetView = stepName === "login" ? loginView : (stepName === "landing" ? landingView : (stepName === "result" ? resultView : inputView));
    if (targetView) {
      targetView.classList.remove("fade-in");
      void targetView.offsetWidth;
      targetView.classList.add("fade-in");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  window.showStep = showStep;

  window.resetAll = function() {
    try {
      localStorage.removeItem("seoul_contract_state");
    } catch(e) {}

    const priceInput = $("price");
    if(priceInput) priceInput.value = "";
    const priceKor = $("price-kor");
    if(priceKor) priceKor.textContent = "";

    KIND = null;
    const kindEl = $("kind");
    if(kindEl) {
      kindEl.querySelectorAll(".chip").forEach(b => {
        b.classList.remove("on");
      });
    }
    const subFields = $("input-sub-fields");
    if (subFields) subFields.style.display = "none";
    const kindInfo = $("kind-info-box");
    if (kindInfo) kindInfo.style.display = "none";

    const allOptIds = [
      "opt-sui", "opt-bid", "opt-special", "opt-severe", "opt-nego", "opt-festival",
      "opt-gam", "opt-gam-legal-cost", "opt-it", "opt-itnew", "opt-itmaint", "opt-itpub", "opt-itaudit",
      "opt-mat", "opt-mat-3ja", "opt-mat-mas", "opt-mat-self", "opt-disaster", "opt-legal-exempt"
    ];
    allOptIds.forEach(id => {
      const el = $(id);
      if(el) {
        const input = el.querySelector("input") || (el.tagName === "INPUT" ? el : null);
        if(input) { input.checked = false; input.disabled = false; }
        el.classList.remove("on");
        el.classList.remove("disabled-opt");
      }
    });
    if (typeof window.updateOptionStates === "function") window.updateOptionStates();

    const festivalOpt = $("opt-festival");
    if(festivalOpt) festivalOpt.style.display = "none";
    const itSubs = $("it-subs");
    if(itSubs) itSubs.style.display = "none";

    CKSET.clear();
    CKS = null;
    CURR_STAGE = 0;
    VIEW_ALL_STAGES = false;
    LAST = null;

    if(typeof syncOpts === "function") syncOpts();
    showTab("guide");
    showStep("landing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.goHome = function() {
    showTab("guide");
    showStep("landing");
  };

  /* ───── 진단 결과 렌더 ───── */
  let LAST = null;

  function renderResult() {
    const d = decide();
    const resEl = $("result");
    if(!resEl) return;

    if(!d.p){ 
      resEl.innerHTML = '<div class="card"><p class="placeholder">추정가격을 입력해 주세요 🙂</p></div>'; 
      return; 
    }

    let h = '<div class="result-grid-layout">';
    
    // LEFT COLUMN (주요 계약 방식 & 사전절차)
    h += '<div class="result-col-main">';
    
    // 1. 추천 계약 방법 카드
    h += '<div class="card"><h2>이렇게 진행할 수 있어요</h2><p class="desc">'+d.k.name+' · 추정가격 '+korUnit(d.p)+'</p>';
    if(d.rec==="nego"){
      h += '<div class="mcard rec"><span class="badge">추천</span><b>🗣️ 협상에 의한 계약 (제안서 평가)</b>'
        +'<p>'+(d.itAudit
          ? '전자정부법 §57 및 소프트웨어 진흥법에 따라 <b>정보시스템 감리(SW 감리) 용역은 제안서 평가(기술 90 : 가격 10) 협상 계약</b>으로 발주합니다.'
          : '전문성·기술성·창의성·안전성 등이 필요한 용역·물품 — 단순노무용역·단순물품구매는 대상이 아니에요 (령 §43·§44)')+'</p>'
        +'<div class="tags">'+((d.it || d.itAudit)
          ? tagHtml("기술 90 : 가격 10 (SW사업·감리 준수)", "v") + tagHtml("협상적격 — 기술점수 85%↑", "b")
          : tagHtml("배점 100 = 정량 20 + 정성 60 + 가격 20", "v") + tagHtml("협상적격 종합 70점↑", "b"))
        + tagHtml("공고 "+d.noticeDays+"일", "o")
        + tagHtml("령 §43·§44", "g")
        + tagHtml(d.itAudit ? "전자정부법 §57" : "낙찰자 결정기준 제7장", "g") +'</div></div>';
      if(d.oneOk||d.twoOk) h += '<p class="note">'+(d.itAudit ? 'SW 감리 용역은 전문·기술성 평가를 위해 협상에 의한 계약 절차로 안내해 드려요.' : '금액만 보면 수의계약도 가능한 범위지만, 협상 방식을 선택하셨으니 제안서 평가 절차로 안내해 드려요.')+'</p>';
      h += '<p class="note">분야별 배점은 ±10점 범위에서 조정할 수 있어요. 대상 여부(지식기반사업 등)는 「📚 기준 한눈에」에서 확인하세요.</p>';
    } else {
      if(d.oneOk){
        h += '<div class="mcard rec"><span class="badge">추천</span><b>🤝 1인 견적 수의계약</b>'
          +'<p>'+(d.severe?'중증장애인생산품 직접 생산 — 금액 제한 없이 가능':(d.special?'특례 대상 기업 — 5천만원 이하 가능':'추정가격 2천만원 이하'))+'</p>'
          +'<div class="tags">'
          + tagHtml("령 §25·§30", "g")
          + tagHtml("견적서 1인 제출", "k")
          + tagHtml("동일업체 연 4회/9회 제한", "o")
          + tagHtml("변경계약 한도 "+(d.special?"5,500만원":"2,200만원"), "v")
          +(d.audit ? tagHtml("일상감사 대상", "r") : (d.special&&d.p>2e7 ? tagHtml("일상감사 제외 (5천만 이하 장애인·여성기업)", "g") : ''))
          +'</div></div>';
      }
      if(d.twoOk){
        h += '<div class="mcard'+(d.rec==="two"?' rec':'')+'">'+(d.rec==="two"?'<span class="badge">추천</span>':'')
          +'<b>💻 전자공개 수의계약 (2인 이상 견적)</b>'
          +'<p>'+d.k.name+' '+korUnit(d.k.two)+' 이하 — 나라장터 안내공고 3일(신규 5일), 견적률 '+d.quoteRate+' 이상 최저가</p>'
          +'<div class="tags">'
          + tagHtml("령 §25①5호·§30", "g")
          + tagHtml("집행기준 제5장", "g")
          +'</div></div>';
      }
      h += '<div class="mcard'+(d.rec==="bid"?' rec':'')+'">'+(d.rec==="bid"?'<span class="badge">추천</span>':'')
        +'<b>📢 일반(경쟁)입찰</b><p>'+(d.k.isC
          ?'공고 '+d.noticeDays+'일 이상 (10억 미만 7일 · 10~50억 15일 · 50억~국제입찰 미만 30일 · 국제입찰 40일 · 긴급·재공고 5일)'
          :'공고 7일 이상 (신규사업 10일 · 긴급·재공고 5일) — 게시일·개찰일 제외')
        +'</p><div class="tags">'
        + tagHtml("령 §35", "g")
        + tagHtml("적격심사 — 낙찰자 결정기준 제2~4장", "g")
        +'</div></div>';
      if(d.rec==="bid" && !d.k.isC) h += '<p class="note">'+(d.it
        ?'정보화·SW사업은 보통 협상에 의한 계약으로 발주해요. ③에서 「협상에 의한 계약」을 함께 체크하면 절차와 배점을 협상 기준으로 안내해 드려요.'
        :'전문성·기술성이 필요한 사업이면 ③에서 「협상에 의한 계약」을 체크해 보세요. 절차와 체크리스트를 협상 기준으로 바꿔 드려요.')+'</p>';
    }
    h += '</div>'; // End Left Main Card 1

    // 2. 사전 확인 절차 카드
    h += '<div class="card" style="margin-top:20px;">'
      +'<h3>📋 계약의뢰 시 사전 확인 절차 <span style="font-weight:400;font-size:.8rem;color:var(--mut)">— 필수 절차 및 면제 사유 안내</span></h3>';

    // 법정 면제 / 제외 요약 박스
    if (d.costExemptReason || d.auditExemptReason || d.ombudsmanExemptReason) {
      h += '<div class="mcard rec" style="background:#f0fdf4; border:1.5px solid #86efac; margin-bottom:16px;">'
        + '<b style="color:#166534; font-size:1.02rem;">🛡️ 법정 면제 / 사전절차 제외 안내</b>'
        + '<ul style="font-size:0.88rem; color:#1e293b; margin:8px 0 0; padding-left:18px; line-height:1.8;">';
      if (d.costExemptReason) h += '<li><b>원가(계약)심사 면제:</b> ' + d.costExemptReason + '</li>';
      if (d.auditExemptReason) h += '<li><b>일상감사 면제:</b> ' + d.auditExemptReason + '</li>';
      if (d.ombudsmanExemptReason) h += '<li><b>시민감사옴부즈만 면제:</b> ' + d.ombudsmanExemptReason + '</li>';
      h += '</ul></div>';
    }

    const pres = [
      {
        n: "일상감사",
        v: d.audit,
        ex: !d.audit && !!d.auditExemptReason,
        r: d.auditExemptReason
      },
      {
        n: "원가(계약)심사",
        v: d.cost,
        ex: !d.cost && !!d.costExemptReason,
        r: d.costExemptReason
      },
      {
        n: "계약심의위원회 심의 (계약방법·자격요건 확정)",
        v: d.committee,
        ex: false,
        r: null
      },
      {
        n: "사전규격 공개",
        v: d.spec,
        ex: false,
        r: null
      },
      {
        n: "재정합의 (계약의뢰 시)",
        v: d.agree,
        ex: false,
        r: null
      },
      {
        n: "시민감사옴부즈만 입회·감시 (청렴계약)",
        v: d.ombudsman,
        ex: !d.ombudsman && !!d.ombudsmanExemptReason,
        r: d.ombudsmanExemptReason
      }
    ];

    if(d.gam){
      pres.push({
        n: "기술용역 타당성 심사 (건설기술)",
        v: d.p>=1e8 ? "전 분야 대상 — 기술심사담당관 (예산 반영 전, 당해연도는 발주 전)"
          : d.p>=5e7 ? "건축 5천만↑ · 기계·전기·조경 3천만↑ 대상 (토목·도시계획은 1억↑)"
          : d.p>=3e7 ? "기계·전기·조경 등 3천만↑ 대상 (건축 5천만 · 토목 1억 기준)" : null,
        ex: false
      });
      pres.push({
        n: "용역발주심의 (건설기술심의)",
        v: d.p>=2*E ? "전 분야 대상 — 발주 타당성·과업 적정성"
          : d.p>=1*E ? "전기·기계·조경 1억↑ 대상 (토목·건축은 2억↑)" : null,
        ex: false
      });
      pres.push({
        n: "사업수행능력(PQ) 세부기준 심의",
        v: d.p>=2.3*E ? "설계·건설사업관리 2.3억↑ — 시 표준기준과 동일 시 서면협의 대체" : null,
        ex: false
      });
    }

    if(d.it){
      pres.push({ n: "과업심의위원회 (SW)", v: "모든 SW사업 — 과업내용·기간 확정 (1억 이하 간소화)", ex: false });
      pres.push({ n: "행안부 사전협의 (IRM)", v: (d.itNew||d.p>=2*E)?(d.itNew?"신규 정보화사업 — 발주 40일 전 신청":"유지보수·계속사업 2억원 이상 — 발주 40일 전 신청"):null, ex: false });
      pres.push({ n: "정보통신 보안성 검토", v: (!d.itAudit && !d.itMaint) ? "정보시스템 신·증설 및 구축·개발 사업 대상 — 정보보안과 (유지보수 및 단순 SW 감리 제외)" : null, ex: false });
      pres.push({
        n: "정보시스템 감리 (SW 감리)",
        v: (!d.itMaint && (d.itAudit || d.p>=5*E || (d.itPub && d.p>=1*E)))
          ? (d.p>=20*E ? "전자정부법 §57 — 20억 이상 SW 구축: 3단계 감리(착수·중간·종료) 의무"
          : (d.p>=5*E || (d.itPub && d.p>=1*E)) ? "전자정부법 §57 — 5억 이상(대국민 1억 이상) 의무 감리 · 20억 미만·6개월 미만 2단계 감리 가능" : "SW 감리 대상 여부 검토") : null,
        ex: false
      });
      pres.push({ n: "SW사업 영향평가", v: (!d.itAudit && !d.itMaint) ? "자체평가 후 사전규격 공개 시 결과 공개" : null, ex: false });
      pres.push({ n: "예산타당성 심사", v: (d.itNew && !d.itMaint) ? "신규 구축·SW개발 — 전년도 예산편성 단계 이행 확인" : null, ex: false });
    }

    const hit = pres.filter(x => x.v || x.ex);
    if(hit.length){
      h += '<div class="pre">';
      hit.forEach(x => {
        if (x.ex) {
          h += '<div class="p" style="background:#f0fdf4; border:1.5px solid #86efac;">'
            + '<div class="n" style="color:#166534; font-weight:700;">✅ ' + x.n + ' <span style="font-size:0.78rem; font-weight:700; color:#15803d; background:#dcfce7; padding:2px 8px; border-radius:12px; margin-left:6px;">[면제 / 심사 제외]</span></div>'
            + '<div class="y" style="color:#166534; font-weight:600; margin-top:6px; background:#ffffff; padding:8px 12px; border-radius:8px; border:1px solid #bbf7d0;">💡 <b>면제 사유:</b> ' + x.r + '</div>'
            + '</div>';
        } else {
          h += '<div class="p on"><div class="n">⚠️ ' + x.n + '</div><div class="y">' + x.v + '</div></div>';
        }
      });
      h += '</div>';
    } else {
      h += '<div class="verdict"><span class="big">🎈</span><div><b>필수 사전절차 대상이 없어요</b><small>이 금액·조건에서는 일상감사 · 원가심사 · 재정합의 등 대상이 아니에요</small></div></div>';
    }
    if(d.gam && d.rec==="nego" && !d.itAudit) h += '<div class="warnbox">🧐 <b>건설기술용역(공사감리·건설사업관리)</b>은 협상이 아니라 <b>사업수행능력평가(PQ) + 적격심사</b>로 낙찰자를 정하는 게 원칙이에요.<br>💡 반면 <b>정보시스템 감리(SW 감리)</b>는 전자정부법 §57에 따라 <b>협상에 의한 계약(기술 90:가격 10)</b>으로 진행해야 합니다.</div>';
    if(d.rec!=="bid"){
      h += '<div class="warnbox">🔍 수의계약 시 유의 — 금액 기준을 피하려는 <b>분리발주(쪼개기)는 금지</b>돼요(령 §77). 1인 견적은 동일업체와 실·국 연 4회 / 시 전체 연 9회까지, 변경계약도 수의 기준금액(계약금액 소액 2,200만원 · 여성기업 등 5,500만원) 안에서만 가능해요.</div>';
      if(d.rec==="one" && KIND==="service") h += '<div class="warnbox">♻️ 폐기물처리 · 재해예방기술지도 용역은 1인 수의 금액이라도 <b>전자공개 수의계약으로 의무발주</b> 대상이에요(시범사업 연장).</div>';
    }
    if(d.mat){
      if(d.mat3ja){
        h += '<div class="mcard rec" style="background:#f0fdf4;border:1.5px solid #86efac;margin-top:16px;">'
          +'<b style="color:#166534;font-size:1.02rem;">📦 관급자재 — 조달청 제3자 단가계약 (단일 납품요구) 맞춤 가이드</b>'
          +'<ul style="font-size:0.88rem;color:#1e293b;margin:8px 0 0;padding-left:18px;line-height:1.8;">'
          +'<li><b>구매 방식:</b> 나라장터 종합쇼핑몰(shopping.g2b.go.kr)에 등록된 제3자단가계약 물품을 검색 후 희망 규격·단가 품목 1개를 선택하여 <b>단일 납품요구(구매)</b>로 즉시 발주합니다.</li>'
          +'<li><b>일상감사 · 원가심사 면제:</b> 조달청장이 사전 계약 체결한 제3자단가 물품은 원가검증이 완료되어 <b>원가심사 및 일상감사 대상에서 제외</b>됩니다 (단, 조달 수수료 납부 예산 반영).</li>'
          +'<li><b>2단계경쟁 미대상:</b> 1회 납품요구 금액이 2단계경쟁 기준(중기 1억 미만 · 가구 4천만 미만 · 일반 5천만 미만) 미만이므로 5개사 제안서 요청 없이 단일 지정을 통해 즉시 구매 가능합니다.</li>'
          +'<li><b>금액 구분 (추정가격 vs 추정금액):</b> 수의·입찰 한도 판단(추정가격)은 <b>관급자재대를 제외</b>하고, 일상감사·원가심사·재정합의 대상 판단(추정금액)은 <b>관급자재비를 포함</b>하여 판단합니다.</li>'
          +'<li><b>보증금 · 지연배상금:</b> 계약보증금(10%)과 지연배상금은 관급자재대를 제외한 <b>실제 계약금액(도급비)</b> 기준으로 산정합니다 (시행령 §51, §90).</li>'
          +'<li><b>수불관리 및 반납:</b> 과업지시서에 관급자재 인도장소, 검수 절차, 관급자재 수불부 작성 및 완공/납품 후 남은 자재(잔재) 즉시 반납 조항을 명시하세요.</li>'
          +'</ul></div>';
      } else if(d.matMas){
        h += '<div class="mcard rec" style="background:#f0fdf4;border:1.5px solid #86efac;margin-top:16px;">'
          +'<b style="color:#166534;font-size:1.02rem;">📦 관급자재 — 조달청 MAS 2단계 경쟁 (다수공급자계약) 맞춤 가이드</b>'
          +'<ul style="font-size:0.88rem;color:#1e293b;margin:8px 0 0;padding-left:18px;line-height:1.8;">'
          +'<li><b>2단계경쟁 필수 대상:</b> 1회 납품요구 금액이 기준(중기 경쟁제품 1억원↑ / 건설자재·가구 4,000만원↑ / 일반 5,000만원↑) 이상이므로 <b>5개 이상 계약상대자(규격) 제안서 제출 요청 후 평가</b>를 거쳐 업체를 선정해야 합니다.</li>'
          +'<li><b>진행 절차:</b> 종합쇼핑몰 2단계경쟁 접속 ➔ 5개사 제안요청서 전송 ➔ 5일 이상 제안서 접수 ➔ 제안서 평가(기본·종합·표준) ➔ 최저가/최고점수 납품요구 대상 결정 ➔ 납품요구 결재.</li>'
          +'<li><b>일상감사 · 원가심사 면제:</b> 조달청 MAS 물품으로 <b>원가심사 및 일상감사는 면제</b>되나, 자체 제안서 평가위원회/평가 절차를 이행하고 조달 수수료 예산을 확보해야 합니다.</li>'
          +'<li><b>금액 구분 (추정가격 vs 추정금액):</b> 수의·입찰 한도 판단(추정가격)은 <b>관급자재대를 제외</b>하고, 일상감사·원가심사·재정합의 대상 판단(추정금액)은 <b>관급자재비를 포함</b>하여 판단합니다.</li>'
          +'<li><b>보증금 · 지연배상금:</b> 계약보증금(10%)과 지연배상금은 관급자재대를 제외한 <b>실제 계약금액(도급비)</b> 기준으로 산정합니다 (시행령 §51, §90).</li>'
          +'</ul></div>';
      } else if(d.matSelf){
        h += '<div class="mcard rec" style="background:#fff7ed;border:1.5px solid #fed7aa;margin-top:16px;">'
          +'<b style="color:#c2410c;font-size:1.02rem;">📦 관급자재 — 자체 발주 (자체 총액 입찰 · 수의계약) 맞춤 가이드</b>'
          +'<ul style="font-size:0.88rem;color:#1e293b;margin:8px 0 0;padding-left:18px;line-height:1.8;">'
          +'<li><b>자체 구매 방식:</b> 조달청 종합쇼핑몰 미등록 물품 등 발주부서에서 <b>자체 총액 입찰 또는 수의계약</b>으로 분리발주 구매합니다.</li>'
          +'<li><b>일상감사 & 원가계약심사 필수:</b> 자체 발주는 조달청 단가계약과 달리 관급자재비를 포함한 <b>총 추정금액 기준으로 일상감사 및 원가계약심사를 필수 의뢰</b>해야 합니다.</li>'
          +'<li><b>분리발주 의무 (중소기업 판로지원법 §12):</b> 공사 추정가격 40억원(전문 25억) 이상 사업 중 4천만원 이상의 중소기업자간 경쟁제품 자재는 관급자재 분리발주 의무를 준수해야 합니다.</li>'
          +'<li><b>수불관리 및 반납:</b> 과업지시서에 관급자재 인도장소, 검수 절차, 관급자재 수불부 작성 및 완공/납품 후 남은 자재(잔재) 즉시 반납 조항을 명시하세요.</li>'
          +'</ul></div>';
      } else {
        h += '<div class="mcard rec" style="background:#f0fdf4;border:1.5px solid #86efac;margin-top:16px;">'
          +'<b style="color:#166534;font-size:1.02rem;">📦 관급자재 (지급자재 · 관급물품) 반영 특화 실무 가이드 — 조달청 MAS · 제3자단가</b>'
          +'<ul style="font-size:0.88rem;color:#1e293b;margin:8px 0 0;padding-left:18px;line-height:1.8;">'
          +'<li><b>조달청 MAS(다수공급자계약) · 제3자단가계약:</b> 관급자재 구매 시 나라장터 종합쇼핑몰(shopping.g2b.go.kr)에 등록된 제3자단가계약 물품 또는 MAS 물품으로 납품요구(구매)를 진행합니다.</li>'
          +'<li><b>MAS 2단계 경쟁 대상 (필수 기준):</b> 1회 납품요구 금액이 아래 금액 이상일 경우 5개 이상 규격(계약상대자) 제안서 제출 요청 후 평가를 거쳐 업체를 선정해야 합니다.<br>'
          +'&nbsp;&nbsp;• <b>중소기업자간 경쟁제품:</b> 1회 납품요구 금액 <b>1억원 이상</b> (단, 건설자재·가구류는 <b>4,000만원 이상</b>)<br>'
          +'&nbsp;&nbsp;• <b>일반 물품 (중소기업 경쟁제품 외):</b> 1회 납품요구 금액 <b>5,000만원 이상</b></li>'
          +'<li><b>일상감사 · 원가계약심사 면제:</b> 조달청 제3자단가계약 및 MAS 물품 구매는 원가검증이 완료되어 <b>원가심사 및 일상감사 대상에서 제외</b>됩니다 (단, 조달 수수료 납부 예산 확보 필요).</li>'
          +'<li><b>금액 구분 (추정가격 vs 추정금액):</b> 수의·입찰 한도 판단(추정가격)은 <b>관급자재대를 제외</b>하고, 일상감사·원가심사·재정합의 대상 판단(추정금액)은 <b>관급자재비를 포함</b>하여 판단합니다.</li>'
          +'<li><b>보증금 · 지연배상금 산정:</b> 계약보증금(10%)과 지연배상금(물품 0.8‰ 등)은 관급자재대를 제외한 <b>실제 계약금액(도급비)</b> 기준으로 산정합니다 (지방계약법 시행령 §51, §90).</li>'
          +'<li><b>분리발주 의무 (중소기업 판로지원법 §12):</b> 공사 추정가격 40억원(전문 25억) 이상 사업 중 4천만원 이상의 중소기업자간 경쟁제품 자재는 관급자재 분리발주 의무를 준수해야 합니다.</li>'
          +'<li><b>수불관리 및 반납:</b> 과업지시서에 관급자재 인도장소, 검수 절차, 관급자재 수불부 작성 및 완공/납품 후 남은 자재(잔재) 즉시 반납 조항을 명시하세요.</li>'
          +'</ul></div>';
      }
    }
    h += '</div>'; // End Left Main Card 2

    h += '</div>'; // End Left Column (result-col-main)

    // RIGHT COLUMN (예상 진행 일정 & 체크리스트 실행)
    h += '<div class="result-col-side">'
      +'<div class="card sticky-side-card">'
      +'<h3>⏱️ 예상 진행 일정</h3>' + buildTimeline(d)
      +'<div style="margin-top:20px"><button class="btn" style="width:100%;padding:14px;font-size:1.05rem;" onclick="makeChecklist()">✅ 이 조건으로 체크리스트 만들기</button></div>'
      +'</div>'
      +'</div>'; // End Right Column (result-col-side)

    h += '</div>'; // End Grid Layout (result-grid-layout)

    resEl.innerHTML = h;
    LAST = d;
    if (window.attachLegalTooltips) window.attachLegalTooltips();
  }
  window.renderResult = renderResult;

  // "진단 결과 보기 →" 버튼 이벤트 (유효성 및 법령 알림 검증)
  const handleGo = () => {
    if (!KIND || !KINFO[KIND]) {
      alert("⚠️ ① 계약 종류(물품, 용역, 종합공사, 전문공사, 그 밖의 공사 중 하나)를 먼저 선택해 주세요! 🙂");
      const kindEl = $("kind");
      if (kindEl) kindEl.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const p = num($("price"));
    if(!p || p <= 0) {
      alert("⚠️ 추정가격을 정확히 입력해 주세요 🙂 (예: 80,000,000원)");
      const pEl = $("price");
      if(pEl) pEl.focus();
      return;
    }

    const isSui = $("opt-sui") ? $("opt-sui").querySelector("input").checked : false;
    const isBid = $("opt-bid") ? $("opt-bid").querySelector("input").checked : false;
    const special = $("opt-special") ? $("opt-special").querySelector("input").checked : false;
    const severe = $("opt-severe") ? $("opt-severe").querySelector("input").checked : false;
    const nego = $("opt-nego") ? $("opt-nego").querySelector("input").checked : false;
    const itNew = $("opt-itnew") ? $("opt-itnew").querySelector("input").checked : false;
    const itMaint = $("opt-itmaint") ? $("opt-itmaint").querySelector("input").checked : false;
    const itAudit = $("opt-itaudit") ? $("opt-itaudit").querySelector("input").checked : false;

    const kindName = KINFO[KIND] ? KINFO[KIND].name : "계약";

    // 1. 수의계약 선택 시 한도 초과 오류 검증 (2인 공개수의 법정 한도)
    let suiLimit = 1e8;
    let limitText = "1억원";
    if (KIND === "gc") { suiLimit = 4e8; limitText = "4억원"; }
    else if (KIND === "sc") { suiLimit = 2e8; limitText = "2억원"; }
    else if (KIND === "oc") { suiLimit = 1.6e8; limitText = "1.6억원"; }

    if (isSui && p > suiLimit) {
      alert(`🚫 [수의계약 진행 불가 알림 — 지방계약법 시행령 §25, §30]\n\n선택하신 '${kindName}'의 입력 추정가격 ${korUnit(p)}은 수의계약 법정 소액 한도(${limitText} 이하)를 초과하여 수의계약이 불가능합니다.\n\n💡 조치방법: 옵션을 '일반 경쟁입찰'로 변경하시거나 추정가격을 확인해 주세요.`);
      return;
    }

    // 2. 공사 계약과 협상에 의한 계약 불일치 검증
    if ((KIND === "gc" || KIND === "sc" || KIND === "oc") && nego) {
      alert(`🚫 [계약 종류 및 방식 불일치 알림 — 지방계약법 시행령 §43]\n\n${kindName}은 '협상에 의한 계약(제안서 평가)'을 적용할 수 없는 계약입니다.\n\n💡 조치방법: 공사 계약은 적격심사 또는 종합심사낙찰제로 진행해야 하므로 '협상에 의한 계약' 체크를 해제해 주세요.`);
      return;
    }

    // 3. SW 감리와 신규/유지보수 사업 중복 선택 검증
    if (itAudit && (itNew || itMaint)) {
      alert(`🚫 [정보화 하위 사업 중복 선택 알림]\n\n'정보시스템 감리(SW 감리)'는 구축·유지보수 본 사업과 별도로 발주하는 독립 감리 용역입니다.\n\n💡 조치방법: '신규 사업' 또는 '유지관리·유지보수 사업' 체크를 해제해 주세요.`);
      return;
    }

    // 4. 신규 사업과 유지보수 사업 동시 선택 검증
    if (itNew && itMaint) {
      alert(`🚫 [신규/유지보수 사업 동시 선택 알림]\n\n'신규 사업'과 '유지관리·유지보수 사업'을 동시에 선택할 수 없습니다.\n\n💡 조치방법: 신규 사업과 유지보수 사업 중 하나만 선택해 주세요.`);
      return;
    }

    renderResult();
    showStep("result");
  };

  const btnGo = $("go");
  if(btnGo) btnGo.addEventListener("click", handleGo);
  const btnGoTop = $("go-top");
  if(btnGoTop) btnGoTop.addEventListener("click", handleGo);
  const btnGoBottom = $("go-bottom");
  if(btnGoBottom) btnGoBottom.addEventListener("click", handleGo);

  // "← 조건 다시 선택하기" 버튼 이벤트
  const btnBack = $("btn-back");
  if(btnBack) {
    btnBack.addEventListener("click", ()=>{
      showStep("input");
    });
  }

  /* ───── 체크리스트 ───── */
  const stampDuty = a => a<=1e7?0 : a<=3e7?2e4 : a<=5e7?4e4 : a<=1*E?7e4 : a<=10*E?15e4 : 35e4;
  function ckItems(d){
    const items = [];
    const add = (ph,label,sub,lv,show)=>{ if(show) items.push({ph,label,sub,lv,id:"ck"+items.length}); };
    const P = "📝 1. 발주 준비", N = "📣 2. 공고 · 업체 선정", C = "✍️ 3. 계약 체결 및 보증", I = "🚚 4. 이행 및 선금 관리", F = "💳 5. 검사 및 대가 지급";
    add(P,"예산 편성·배정 확인","지출원인행위 전 예산 확보","권장",true);
    add(P,"과업내용서 · 시방서 · 설계서 확정","산출 근거 포함","권장",true);
    add(P,"분리발주(쪼개기) 여부 점검","수의 기준 회피 목적 분할 금지 — 시행령 §77","필수",true);
    add(P,"동일업체 수의계약 횟수 확인","실·국 연 4회 / 시 전체 연 9회 이내","필수",d.rec==="one");
    add(P,"계약심의위원회 심의 (발주 전 필수)",d.committee||"","필수",!!d.committee);
    add(P,"원가(계약)심사 의뢰",d.cost||"","필수",!!d.cost);
    add(P,"재정합의 (계약의뢰 시 필수)",d.agree||"","필수",!!d.agree);
    add(P,"일상감사 의뢰",d.audit||"","필수",!!d.audit);
    add(P,"사전규격 공개 (나라장터)",d.spec||"","필수",!!d.spec);
    add(P,"협상 대상 여부 확인","단순노무용역·단순물품구매 제외 — 지식기반사업 등 (령 §44①)","필수",d.rec==="nego");
    add(P,"제안요청서 · 과업지시서 작성","평가요소·평가방법·제안서 규격 명시, 부당계약 체크리스트 검토","필수",d.rec==="nego");
    add(P,"평가위원 예비명부 구성 (3배수, 21~30인)","공공감사담당관(일상감사팀장) 협조결재 · 위원정보 비공개","필수",d.rec==="nego");
    add(P,"예산타당성 심사 이행 확인","신규 구축·SW개발 포함 사업 — 정보시스템과 (전년도 정기 7~9월 · 소요 30일)","필수",d.it&&d.itNew&&!d.itMaint);
    add(P,"과업심의위원회 심의","모든 SW사업 · 과업내용 확정, SW개발 시 적정 사업기간 산정 — 1억 이하·상용SW 구매는 간소화","필수",d.it);
    add(P,"행안부 사전협의 (irm.go.kr)",d.itNew?"신규 40일 전 신청 · 검토 30일":"유지관리·계속사업 2억원 이상 — 발주 40일 전 신청","필수",d.it&&(d.itNew||d.p>=2*E));
    add(P,"정보시스템 감리 (SW 감리) 이행","전자정부법 §57 — 5억 이상(대국민 1억 이상) 감리 의무, 전문 감리기관 계약","필수",d.it&&!d.itMaint&&(d.itAudit||d.p>=5*E||(d.itPub&&d.p>=1*E)));
    add(P,"SW사업 영향평가 (자체)","사전규격 공개 시 결과 공개 · 1억 이상 신규 개발은 발주 30일 전 과기부 검토요청","필수",d.it&&!d.itMaint);
    add(P,"정보통신 보안성 검토","정보보안과 의뢰 — 정보시스템 구축·신증설 본 사업 대상 (유지보수 및 단순 SW 감리 용역 제외)","필수",d.it && !d.itAudit && !d.itMaint);
    add(P,"상용SW 직접구매 대상 검토","3억 이상 + 조달 등록 SW 포함 시 구매계획 첨부 · 경쟁입찰 구매 시 BMT 검토","필수",d.it&&!d.itMaint&&d.p>=3*E);
    add(P,"클라우드 우선 이용 검토","SaaS → 민간 클라우드 → 데이터센터 순 비교 검토서","권장",d.it&&d.itNew&&!d.itMaint);
    add(P,"기술용역 타당성 심사 요청","기술심사담당관 — 토목·도시계획 1억↑ · 건축 5천만↑ · 기계·전기·조경 3천만↑ (예산 반영 전, 당해연도는 발주 전)","필수",d.gam&&d.p>=3e7);
    add(P,"용역발주심의 (건설기술심의)","토목·건축 2억↑ · 전기·기계·조경 1억↑ — 발주 타당성·과업 적정성","필수",d.gam&&d.p>=1*E);
    add(P,"PQ 세부평가기준 건설기술심의","설계·건설사업관리 2.3억↑ (정밀안전진단 1억↑) — 시 표준기준과 동일 시 서면협의 대체","필수",d.gam&&d.p>=2.3*E);
    add(P,"대가 산정 적정성 확인","엔지니어링사업대가 기준·표준품셈 — 설계요율·개략공사비·추가업무 산정","권장",d.gam);
    add(P,"지역제한 발주 검토","3.3억 미만 건설기술·설계·감리용역은 지역제한 경쟁 가능","권장",d.gam&&d.p<3.3e8);
    add(P,"중소기업자간 경쟁제품 해당 여부 확인","해당 시 중기부 기준 적용 (판로지원법) · 1천만원 이상 구매는 직접생산 증명서 확인","권장",!d.k.isC);
    add(P,"수의계약 배제 사유 확인","부정당업자 제재 중인 업체 등 (법 §31·령 §92) · 나라장터 제재정보 조회","필수",d.rec==="one"||d.rec==="two");
    add(P,"특례 대상 증빙 확보","장애인·여성기업 확인서 등 유효기간 확인","필수",d.special&&d.rec==="one");
    add(P,"중증장애인생산품 직접생산 확인","생산시설 지정 및 직접생산 여부","필수",d.severe);
    add(P,"시민감사옴부즈만 입회·감시 사전 확인 (청렴계약)",d.ombudsman||"","필수",!!d.ombudsman);
    if(d.mat3ja){
      add(P,"조달청 제3자 단가계약 물품 납품요구 검토","나라장터 종합쇼핑몰 계약물품 검색 및 단일 납품요구 수수료 예산 확보","필수",true);
      add(P,"MAS 2단계경쟁 미대상 확인","중기 1억 미만 · 가구 4천만 미만 · 일반 5천만 미만 1회 납품요구 금액 확인","필수",true);
      add(P,"일상감사 · 원가계약심사 면제 확인","조달청장이 가격검증 완료한 제3자단가계약 물품으로 심사 면제 대상 확인","필수",true);
    } else if(d.matMas){
      add(P,"조달청 MAS 2단계 경쟁 대상 기준 확인","중기 1억↑ · 가구 4천만↑ · 일반 5천만↑ 1회 납품요구 금액 확인","필수",true);
      add(P,"MAS 2단계 경쟁 5개사 제안요청서 작성","나라장터 종합쇼핑몰 시스템을 통해 5개 이상 계약상대자 제안서 제출 요청","필수",true);
      add(P,"일상감사 · 원가계약심사 면제 및 조달수수료 반영","MAS 계약물품 심사 면제 확인 · 조달수수료 예산 확보","필수",true);
    } else if(d.matSelf){
      add(P,"관급자재 자체 발주(총액입찰 · 수의계약) 세부계획 수립","종합쇼핑몰 미등록 물품 등 발주부서 자체 수의계약/경쟁입찰 집행계획 수립","필수",true);
      add(P,"관급자재비 포함 총 추정금액 산정 및 일상감사·원가심사 의뢰","자체 발주는 관급자재비를 포함한 총 금액 기준 일상감사 및 원가계약심사 필수 의뢰","필수",true);
      add(P,"중소기업자간 경쟁제품 관급자재 분리발주 검토","4천만원 이상 자재 직접구매 대상 확인 (중소기업 판로지원법 §12)","필수",true);
    } else if(d.mat){
      add(P,"조달청 MAS (다수공급자계약) · 제3자단가계약 물품납품요구 검토","나라장터 종합쇼핑몰 계약물품 여부 확인 및 조달수수료 예산 반영","필수",true);
      add(P,"MAS 2단계 경쟁 대상 여부 및 기준 점검","중기 경쟁제품 1억↑(건설자재·가구 4천만↑) / 일반물품 5천만↑ 1회 납품요구 시 5개사 제안서 요청","필수",true);
      add(P,"관급자재 포함 추정금액 산정 및 심사 대상 확인","자체 발주 시 자재대 포함 총 추정금액으로 일상감사·원가심사 의뢰 (조달 3자단가·MAS는 심사 면제)","필수",true);
    }
    add(N,"시민감사옴부즈만 입회·감시 요청서 제출","공사 30억·용역 5억·물품 1억 이상 — 제안서/입찰 평가위 개최 7일 전 입회요청서 제출 (서울특별시 청렴계약옴부즈만 운영 규칙)","필수",!!d.ombudsman);
    if(d.rec==="nego"){
      add(N,"입찰공고 게시 — 협상 ("+d.noticeDays+"일)","게시일·개찰일 제외 · 긴급·재공고 10일 · 1억 미만 신규사업은 15일","법정",true);
      add(N,"가격 투찰(나라장터) = 밀봉 가격제안서 금액 일치 확인","제안서·가격제안서는 발주부서에 직접 제출","필수",true);
      add(N,"평가위원 추첨 (참가업체가 제출 시 추첨 · 다빈도순)","동수는 연장자순 · 예비평가위원 2명 이상 추가 선정","필수",true);
      add(N,"제안서 평가 — 정량 20 · 정성 60 · 가격 20","정성 최저점은 항목 배점의 60% 이상 · 최고·최저 위원 제외 평균","필수",true);
      add(N,"평가 결과 서울계약마당 등록 · 협상 순위 통보",d.it?"협상적격 — 기술능력 점수가 배점한도의 85% 이상 (SW 기준)":"협상적격 — 종합평점 70점 이상","필수",true);
      add(N,"기술능력 배점 90% 적용","SW사업 준수사항 — 기술 90 : 가격 10 · SW기술성 평가기준으로 평가항목 구성","필수",d.it);
      add(N,"제안요청 설명회 개최","추정가격 20억 이상 의무 — 입찰공고는 설명일 전일부터 7일 전","법정",d.it&&d.p>=20*E);
      add(N,"제안서 보상 여부 명기","총사업비 20억 이상 SW사업 — 우수 제안서 보상 검토·명기","필수",d.it&&d.p>=20*E);
      add(N,"기술협상 → 가격협상","제안 내용 가감 시 예정가격 범위 내 조정 · 가감 없으면 제안가 조정 불가","필수",true);
    } else if(d.rec==="bid"){
      add(N,"입찰공고 게시 ("+d.noticeDays+"일 이상)",d.k.isC?"나라장터 — 게시일·개찰일 제외 · 재공고·긴급 5일 (령 §35)":"나라장터 — 신규사업은 10일 · 재공고·긴급 5일 (령 §35)","법정",true);
      add(N,"입찰참가자격 · 실적 기준 확인","면허·등록, 지역제한 여부 등","권장",true);
      add(N,"사업수행능력평가(PQ) 서류심사","적격자에 한해 가격개찰 — 하한율은 기술용역(PQ) 79.995~86.745%","필수",d.gam&&d.p>=2.3*E);
      add(N,"개찰 · 적격심사","낙찰하한율 참고 — 📊 탭","권장",true);
    } else if(d.rec==="two"){
      add(N,"전자공개 견적 안내공고 (3일, 신규 5일)","나라장터 전자견적","법정",true);
      add(N,"견적률 확인 — "+d.quoteRate+" 이상","예정가격 대비 · 최저가격 순 결정","권장",true);
    } else {
      add(N,"전자공개 의무발주 대상 확인","폐기물처리·재해예방기술지도 용역은 1인 수의 금액이라도 전자공개 수의로 발주 (시범 연장)","필수",KIND==="service");
      add(N,"수의계약 체결제한 여부 확인서 징구","이해충돌방지법 §12 · 발주부서 퇴직공무원(2년) · 유착비리 지정업체 제한 — 서식 모음 참고","필수",true);
      add(N,"수의계약 사유 명시","사유서 작성 — 시행령 §25 근거 명확히","필수",true);
      add(N,"견적서 징구 · 가격 적정성 검토","시장가격·과거 계약단가 비교","권장",true);
      add(N,"변경계약 한도 확인","계약금액 기준 소액 2,200만원 · 여성기업 등 5,500만원 초과 변경 불가 (불가피 시 부시장 보고)","필수",true);
    }
    add(N,"MAS 2단계 경쟁 제안서 제출 접수 및 평가","종합쇼핑몰 2단계경쟁 제안서 접수(5일 이상) → 평가기준(기본·종합·표준) 심사 후 최종 업체 결정","필수",d.matMas||d.mat);
    add(C,"계약보증금 확인 — 약 "+won(Math.round(d.p*0.1)),d.p<=5e7?"계약금액 5천만원 이하 — 지급확약서로 면제 가능 (령 §53)":"계약금액의 10% 이상 (법 §15·령 §51) — 한시특례는 '26.6.30. 종료","필수",true);
    add(C,"계약보증금 산정 시 관급자재대 제외 확인","실제 계약금액(도급비) 기준 10% 이상 적용 (지방계약법 시행령 §51)","필수",d.mat);
    add(C,"과업지시서에 관급자재 인도장소 및 잔재 반납 규정 명시","인도장소 명시, 관급자재 수불부 작성 및 잔여 자재 반납 규정 작성","필수",d.mat);
    add(C,"손해배상보증서 제출 확인","전기공사 · 소방시설공사·설계·감리·관리용역 · 건설기술용역 등 개별법상 의무 — 건설사업관리는 공사착공일~완공일 (건진법 §34·령 §50)","권장",KIND==="oc"||KIND==="service");
    add(C,"인지세 납부 확인 — "+(stampDuty(d.p)?won(stampDuty(d.p)):"비과세(1천만원 이하)"),"전자수입인지 · 공동 부담","필수",true);
    add(C,"도시철도공채 매입 확인","건설공사 도급 2천만원 이상 — 계약금액의 2%","필수",d.k.isC&&d.p>=2e7);
    add(C,"청렴계약 이행 서약서 징구 및 옴부즈만 조항 확인","지방계약법 §6의2 · 서울시 청렴계약제 운영 — 대표자 및 담당 공무원 서명 서약서 편철","필수",true);
    add(C,"국세·지방세 및 4대보험 완납증명서 확인","령 §25①각 호 수의계약은 생략 가능(제7호 가목 제외)","필수",true);
    add(C,"근로자권리보호 · 안전보건관리준수 서약서","협상 공고 시 3대 서약서 제출 의무","필수",d.rec==="nego");
    add(C,"협상 결과 반영 과업지시서 · 산출내역서 확인","협상 계약금액에 맞게 조정 후 계약부서 송부","필수",d.rec==="nego");
    add(C,"계약서 작성 · 전자서명","낙찰(결정) 통지 후 10일 이내","법정",true);
    add(C,"하도급 제한사항 확인","SW사업 50% 초과 하도급 금지 · 재하도급 원칙 금지 · 하도급계획서 (공고문 명시)","필수",d.it);
    add(I,"착수계 제출 확인","발주부서·계약부서 각 1부 (전자제출 원칙)","권장",d.rec==="nego");
    add(I,"사업수행계획서 검토·승인","계약 후 10일 이내 착수계(수행계획서·보안서약서 포함) 검토","권장",d.it);
    add(I,"정보시스템 감리","5억 이상 구축 의무 (대국민·다수부서 공동은 1억 이상) — 20억 미만 2단계 가능","필수",d.it&&(d.itAudit||d.p>=5*E||(d.itPub&&d.p>=1*E)));
    add(I,"과업 변경 시 과업심의위원회","계약금액·기간 조정이 따르는 변경은 심의 후 변경계약","권장",d.it);
    add(I,"감독 · 검사공무원 지정","공사·용역 이행 관리","권장",true);
    add(I,"건설기계 임대료 지급 확인","'26년 신설 제도 — 건설기계 대여대금 체불 방지, 지급 확인 (매뉴얼 p.278)","권장",d.k.isC);
    add(I,"감리원(참여기술인) 배치·교체 승인","배치계획 승인 후 착수 — 교체는 발주청 사전 승인","필수",d.gam);
    add(I,"감리 정기·수시 보고 확인","월간 보고 · 검측·기성 검토 결과 관리","권장",d.gam);
    add(I,"선금 지급 (청구 시 14일 이내)","한도 70% (재무건전성 우수 100%) — 물품 구매 제외","법정",KIND!=="goods");
    add(I,"계약변경 사유 발생 시 변경계약","설계변경·물가변동·기타 계약내용 변경 (법 §16·령 §73~§75)","권장",true);
    add(I,"지연 발생 시 지연배상금 산정","🧮 탭에서 계산 — 10% 이상이면 해제·해지 검토","권장",true);
    add(F,"검사 — 완료 통지 후 14일 이내","필요 시 전문기관 검사","법정",true);
    add(F,"보안취약점 점검 · 보안점검표 제출","준공 1주 전 정보보안과 제출 · SW개발 1억 이상은 보안약점(시큐어코딩) 진단","필수",d.it);
    add(F,"대시민 오픈 심의 · 성별영향평가","오픈 15일 전 취약점 점검 → 콘텐츠담당관 오픈 심의 (웹사이트는 성별영향평가 병행)","필수",d.itPub);
    add(F,"SW사업정보 제출 (spir.kr)","1억 이상 — 계약 후 1개월 · 검수 후 1개월 이내 각 1회","법정",d.it&&d.p>=1*E);
    add(F,"정보자원 등록·현행화 (irm.go.kr)","계약·완료 시 등록, 사전협의 이행결과 증빙 (요청 후 21일 이내)","법정",d.it);
    add(F,"감리 최종보고서 · 성과품 인수","최종보고서·검측대장 등 성과품 확인 후 대가 지급","권장",d.gam);
    add(F,"하자보수보증금 납부 확인","공종별 2~5% — 3천만원 이하 공사(조경 제외) 면제","필수",d.k.isC);
    add(F,"대가 지급 — 청구 후 5일 이내","지연 시 지연이자 발생","법정",true);
    add(F,"선금 정산 확인","정산액 = 선금 × 기성액 ÷ 계약금액","권장",KIND!=="goods");
    add(F,"계약 서류 정리 · 보존","실적 등록, 증빙 편철","권장",true);
    return items;
  }

  const STAGES = [
    { id: "p1", name: "1. 발주 준비", key: "📝 1. 발주 준비", desc: "지출원인행위 전 예산확정 · 과업내용서 · 원가심사 · 일상감사 · 사전협의 등 준비 단계" },
    { id: "p2", name: "2. 공고 · 업체 선정", key: "📣 2. 공고 · 업체 선정", desc: "사전규격공개 · 입찰공고 · 제안서/PQ평가 · 낙찰자 결정 및 협상 단계" },
    { id: "p3", name: "3. 계약 체결 및 보증", key: "✍️ 3. 계약 체결 및 보증", desc: "계약보증금 · 인지세 납부 · 청렴서약서 · 계약서 전자서명 단계" },
    { id: "p4", name: "4. 이행 및 선금 관리", key: "🚚 4. 이행 및 선금 관리", desc: "착수계 · 선금 청구 · 감독관 지정 · 감리 및 변경계약 관리 단계" },
    { id: "p5", name: "5. 검사 및 대가 지급", key: "💳 5. 검사 및 대가 지급", desc: "검사원/검수 · 하자보수보증 · 대가 청구 · 정보자원 등록 마무리 단계" }
  ];

  let CURR_STAGE = 0;
  let VIEW_ALL_STAGES = false;

  window.setStage = function(idx) {
    CURR_STAGE = idx;
    VIEW_ALL_STAGES = false;
    renderCk();
    const ckArea = $("ck-area");
    if(ckArea) ckArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  window.toggleViewAllStages = function() {
    VIEW_ALL_STAGES = !VIEW_ALL_STAGES;
    renderCk();
  };

  let CKS = null, CKSET = new Set();
  window.makeChecklist = function(){
    if(!LAST) return;
    CKS = ckItems(LAST); 
    CKSET = new Set();
    CURR_STAGE = 0;
    VIEW_ALL_STAGES = false;
    renderCk(); 
    showTab("check");
  };

  function renderCk(){
    const byPh = {};
    CKS.forEach(it=>{(byPh[it.ph]=byPh[it.ph]||[]).push(it);});
    const totalDone = CKS.filter(it=>CKSET.has(it.id)).length;
    const missReq = CKS.filter(it=>(it.lv!=="권장")&&!CKSET.has(it.id));

    let h = '<div class="card"><h2>이 계약의 단계별 점검 목록</h2>'
      +'<p class="desc">'+LAST.k.name+' · '+korUnit(LAST.p)+' · 전체 '+CKS.length+'개 항목 중 '+totalDone+'개 완료 ('+Math.round(totalDone/CKS.length*100)+'%)</p>';

    // 1. STAGE STEPPER NAVIGATION BAR
    h += '<div class="stage-stepper-wrap">';
    h += '<div class="stage-stepper">';
    STAGES.forEach((stg, i)=>{
      const list = byPh[stg.key] || [];
      const done = list.filter(it=>CKSET.has(it.id)).length;
      const isComplete = list.length > 0 && done === list.length;
      const isActive = !VIEW_ALL_STAGES && CURR_STAGE === i;
      h += '<button class="stage-step-btn'+(isActive?' active':'')+(isComplete?' complete':'')+'" onclick="window.setStage('+i+')">'
        +'<span class="stg-num">'+(isComplete?'✓':(i+1))+'</span>'
        +'<span class="stg-title">'+stg.name.split(". ")[1]+'</span>'
        +'<span class="stg-badge">'+done+'/'+list.length+'</span>'
        +'</button>';
    });
    h += '</div>';

    h += '<div class="stage-view-toggle">'
      +'<button class="btn-toggle'+(VIEW_ALL_STAGES?' on':'')+'" onclick="window.toggleViewAllStages()">'
      +(VIEW_ALL_STAGES ? '📌 단계별 순서대로 보기' : '📜 전체 5단계 한눈에 보기')
      +'</button></div>';
    h += '</div>'; // End Stepper Wrap

    // 2. REQUIRED MISSING BANNER
    h += missReq.length
      ? '<details class="miss">'
        +'<summary class="miss-header">'
        +'<span class="miss-title">🔔 아직 확인이 필요한 필수·법정 항목 <b>'+missReq.length+'건</b></span>'
        +'<span class="miss-toggle-btn">👁️ 미완료 항목 목록 보기 / 접기</span>'
        +'</summary>'
        +'<div class="list">'+missReq.map(it=>tagHtml(it.label.split(" — ")[0], it.lv==="법정"?"b":"r")).join("")+'</div>'
        +'</details>'
      : '<div class="miss ok"><b>🎉 모든 단계 필수·법정 항목 확인 완료!</b><div class="s" style="font-size:.85rem;color:var(--sub);margin-top:4px">권장 항목도 한 번 더 훑어보면 안전해요.</div></div>';

    // 3. RENDER STAGE ITEMS (Sequential View vs All View)
    if(VIEW_ALL_STAGES){
      for(const ph in byPh){
        const list = byPh[ph], done = list.filter(it=>CKSET.has(it.id)).length;
        h += '<div class="phase"><div class="phase-h"><b>'+ph+'</b><span class="pbar"><i style="width:'+(done/list.length*100)+'%"></i></span><span class="pcnt">'+done+'/'+list.length+'</span></div>';
        list.forEach(it=>{
          const on = CKSET.has(it.id);
          h += '<label class="ck'+(on?' on':'')+'"><input type="checkbox" data-id="'+it.id+'"'+(on?' checked':'')+'>'
            +'<span><span class="l">'+it.label+'</span> '+tagHtml(it.lv, it.lv==="법정"?"b":it.lv==="필수"?"r":"g")
            +(it.sub?'<div class="s">'+it.sub+'</div>':'')+'</span></label>';
        });
        h += '</div>';
      }
    } else {
      const currStgObj = STAGES[CURR_STAGE];
      const list = byPh[currStgObj.key] || [];
      const done = list.filter(it=>CKSET.has(it.id)).length;
      const stageDone = list.length > 0 && done === list.length;

      h += '<div class="phase" style="border:2px solid #2563eb;background:#fcfdff;border-radius:20px;padding:24px;margin-bottom:20px;">';
      h += '<div class="phase-h" style="border-bottom:1.5px solid #e2e8f0;padding-bottom:14px;margin-bottom:18px;">'
        +'<div><b style="font-size:1.15rem;color:#1e40af;">'+currStgObj.name+'</b>'
        +'<div style="font-size:0.84rem;color:#64748b;margin-top:4px;">'+currStgObj.desc+'</div></div>'
        +'<div style="text-align:right;"><span class="pcnt" style="font-size:1rem;font-weight:800;color:#2563eb;">'+done+' / '+list.length+' 완료</span>'
        +'<span class="pbar" style="width:140px;height:8px;margin-top:6px;"><i style="width:'+(done/list.length*100)+'%"></i></span></div>'
        +'</div>';

      list.forEach(it=>{
        const on = CKSET.has(it.id);
        h += '<label class="ck'+(on?' on':'')+'"><input type="checkbox" data-id="'+it.id+'"'+(on?' checked':'')+'>'
          +'<span><span class="l">'+it.label+'</span> '+tagHtml(it.lv, it.lv==="법정"?"b":it.lv==="필수"?"r":"g")
          +(it.sub?'<div class="s">'+it.sub+'</div>':'')+'</span></label>';
      });

      // STAGE BOTTOM NAVIGATION BUTTONS
      h += '<div class="stage-nav-bar">';
      if(CURR_STAGE > 0){
        h += '<button class="btn ghost" onclick="window.setStage('+(CURR_STAGE-1)+')">← 이전 단계 ('+STAGES[CURR_STAGE-1].name.split(". ")[1]+')</button>';
      } else {
        h += '<div></div>';
      }
      if(CURR_STAGE < 4){
        h += '<button class="btn '+(stageDone?'ok-btn':'pri-btn')+'" onclick="window.setStage('+(CURR_STAGE+1)+')">'
          +(stageDone ? '🎉 현 단계 완료! 다음 단계로 이동 ('+STAGES[CURR_STAGE+1].name.split(". ")[1]+') ➔' : '다음 단계: '+STAGES[CURR_STAGE+1].name.split(". ")[1]+' 진행 ➔')
          +'</button>';
      } else {
        h += '<div style="font-size:0.95rem;font-weight:800;color:#00c283;background:#f0fdf4;padding:10px 18px;border-radius:99px;border:1px solid #bbf7d0;">🎉 모든 계약 단계 점검을 완료했습니다!</div>';
      }
      h += '</div>'; // End Stage Nav Bar

      h += '</div>'; // End Phase Card
    }

    h += '<div style="display:flex;gap:8px;margin-top:16px"><button class="btn pri-btn" style="background:#2563eb;color:#fff;" onclick="window.goHome()">🏠 홈으로 (조건 다시 입력)</button><button class="btn ghost" onclick="window._clearCk()">전체 해제</button></div>';
    h += '<p class="note">체크 상태는 저장 버튼으로 보관하거나 화면을 새로고침하면 유지돼요.</p></div>';
    
    const ckArea = $("ck-area");
    if(ckArea) {
      ckArea.innerHTML = h;
      ckArea.querySelectorAll("input[type=checkbox]").forEach(c=>{
        c.addEventListener("change",()=>{
          c.checked ? CKSET.add(c.dataset.id) : CKSET.delete(c.dataset.id);
          renderCk();
        });
      });
    }
    if (window.attachLegalTooltips) window.attachLegalTooltips();
  }

  window._clearCk = function() {
    CKSET.clear();
    renderCk();
  };

  /* ───── 계산: 보증금 ───── */
  const btnGRun = $("g-run");
  if(btnGRun) {
    btnGRun.addEventListener("click",()=>{
      const a = num($("g-amt"));
      if(!a){ $("g-out").innerHTML='<p class="placeholder">계약금액을 입력해 주세요.</p>'; return; }
      const cut = $("g-cut") && $("g-cut").querySelector("input").checked ? 0.5 : 1;
      const bid = Math.round(a*0.05*cut), con = Math.round(a*0.10*cut);
      const hv = $("g-haja") ? $("g-haja").value : "0";
      let h = '<div class="res">입찰보증금(5%'+(cut<1?" × ½":"")+') <b class="money">'+won(bid)+'</b> — 전자입찰은 지급각서 갈음<br>'
        +'계약보증금(10%'+(cut<1?" × ½":"")+') <b class="money">'+won(con)+'</b>'
        +(a<=5e7?' — <b>5천만원 이하: 지급확약서로 면제 가능</b>':'');
      if(["5","4","3","2"].includes(hv)) h += '<br>공사이행보증서 선택 시('+(cut<1?"특례 20%":"40%")+') <b class="money">'+won(Math.round(a*(cut<1?0.20:0.40)))+'</b> — 계약보증금 납부 대신 이행보증서 제출 방식';
      if(hv!=="0"){
        const r = hv==="s2"?2 : hv==="m3"?3 : hv==="m2"?2 : parseInt(hv,10);
        h += '<br>하자보수보증금('+r+'%) <b class="money">'+won(Math.round(a*r/100))+'</b>';
        if(["5","4","3","2"].includes(hv) && a<=3e7) h += ' — 3천만원 이하 공사(조경 제외) 면제 가능';
      }
      h += '</div>';
      h += '<p class="note">근거 — 입찰보증금 법 §12·령 §37, 계약보증금 법 §15·령 §51~§53, 하자보수보증금 법 §21·령 §70~§71</p>';
      if(cut<1) h += '<div class="warnbox">이 한시특례는 \'26.6.30.자로 종료됐어요. 현재는 원칙(입찰 5% · 계약 10%)이 적용되니, 연장·재시행 여부를 현행 행안부 고시로 확인하세요.</div>';
      $("g-out").innerHTML = h;
    });
  }

  /* ───── 계산: 지연배상금 ───── */
  const btnDRun = $("d-run");
  if(btnDRun) {
    btnDRun.addEventListener("click",()=>{
      const a = num($("d-amt")), r = parseFloat($("d-rate").value);
      let days = parseInt(($("d-days").value||"").replace(/[^0-9]/g,""),10)||0;
      if(!days && $("d-from").value && $("d-to").value){
        const diff = (new Date($("d-to").value)-new Date($("d-from").value))/(864e5);
        days = diff>=0 ? Math.round(diff)+1 : 0;
      }
      if(!a||!days){ $("d-out").innerHTML='<p class="placeholder">계약금액과 지연 일수를 입력해 주세요.</p>'; return; }
      const pay = Math.round(a*days*r/1000), ratio = pay/a*100;
      let h = '<div class="res">'+won(a)+' × '+days+'일 × '+r+'/1000 = <b class="money">'+won(pay)+'</b> <span style="color:var(--sub)">(계약금액의 '+ratio.toFixed(2)+'%)</span></div>';
      if(ratio>=10) h += '<div class="badbox">🚨 지연배상금이 계약금액의 10% 이상 — 계약 해제·해지 검토 사유예요.</div>';
      else if(ratio>=7) h += '<div class="warnbox">10%에 가까워지고 있어요. 이행 독촉·계약변경 여부를 점검하세요.</div>';
      h += '<p class="note">근거 — 지방계약법 §30의2, 시행령 §90 · 집행기준 제9장 (면제사유: 불가항력, 관급자재 공급 지연, 발주기관 책임 등)</p>';
      $("d-out").innerHTML = h;
    });
  }

  /* ───── 계산: 선금 ───── */
  const btnSRun = $("s-run");
  if(btnSRun) {
    btnSRun.addEventListener("click",()=>{
      const a = num($("s-amt")), req = num($("s-req")), done = num($("s-done"));
      if(!a){ $("s-out").innerHTML='<p class="placeholder">계약금액을 입력해 주세요.</p>'; return; }
      const cap = Math.round(a*0.7), duty = Math.round(a*0.3);
      let h = '<div class="res">최초 의무 지급률(30%) <b class="money">'+won(duty)+'</b> · 지급 한도(70%) <b class="money">'+won(cap)+'</b>';
      if(req){
        const pr = req/a*100;
        if(req<=a*0.3) h += '<br>신청액 '+won(req)+' ('+pr.toFixed(1)+'%) — <b>신청한 대로 지급</b> (30% 이하)';
        else if(req<=cap) h += '<br>신청액 '+won(req)+' ('+pr.toFixed(1)+'%) — 30% 초과분은 계약 목적·성질을 고려해 지급 가능 (한도 내)';
        else h += '<br><span style="color:var(--bad)">신청액 '+won(req)+' ('+pr.toFixed(1)+'%) — 한도(70%) 초과!</span>';
      }
      if(req&&done){
        const set = Math.round(req*done/a);
        h += '<br>선금 정산액 = '+won(req)+' × '+won(done)+' ÷ '+won(a)+' = <b class="money">'+won(set)+'</b>';
      }
      h += '</div><p class="note">근거 — 지방계약법 §18, 지방회계법 시행령 §44, 집행기준 제1장 · 선금 지급한도 확대 세부기준(서울시) · 청구 후 14일 이내 지급, 하수급인 배분 15일 이내</p>';
      $("s-out").innerHTML = h;
    });
  }

  /* ───── 계산: 인지세·공채 ───── */
  const btnTRun = $("t-run");
  if(btnTRun) {
    btnTRun.addEventListener("click",()=>{
      const a = num($("t-amt"));
      if(!a){ $("t-out").innerHTML='<p class="placeholder">계약금액을 입력해 주세요.</p>'; return; }
      const st = stampDuty(a);
      let h = '<div class="res">인지세: <b class="money">'+(st?won(st):"비과세 (1천만원 이하)")+'</b> — 전자수입인지, 계약당사자 공동 부담';
      if($("t-const") && $("t-const").querySelector("input").checked){
        if(a>=2e7){
          const raw = a*0.02, base = Math.floor(raw/5000)*5000;
          const bond = (raw-base>=2500)?base+5000:base;
          h += '<br>도시철도공채(2%): <b class="money">'+won(bond)+'</b> <span style="color:var(--sub)">(5천원 단위 — 2,500원 이상 절상)</span>';
        } else h += '<br>도시철도공채: 계약금액 2천만원 미만 — 매입 대상 아님';
      }
      h += '</div><p class="note">근거 — 인지세법 §3 (전자수입인지) · 도시철도법 §20 및 서울특별시 도시철도채권 매입 기준 (건설공사 도급 2천만원 이상, 계약금액의 2%)</p>';
      $("t-out").innerHTML = h;
    });
  }

  /* ───── 협상 제안서 평가 계산기 (3단계 프로세스 및 정성 세부항목 관리) ───── */

  const DEFAULT_CRITERIA = [
    { name: "기술·지식능력", weight: 15 },
    { name: "사업수행계획", weight: 20 },
    { name: "지원기술·사후관리", weight: 10 },
    { name: "상호협력 관계", weight: 10 },
    { name: "그 밖에 필요한 사항", weight: 5 }
  ];

  let CRITERIA_LIST = JSON.parse(JSON.stringify(DEFAULT_CRITERIA));
  let EVAL_SCORES_STORE = {}; // Store structure: { companyId: { memberIdx: { criterionIdx: score } } }

  function getMemberCount() {
    const el = $("ev-member-count");
    return el ? parseInt(el.value, 10) || 7 : 7;
  }

  function getQualTargetScore() {
    const el = $("ev-qual-max");
    return el ? (parseFloat(el.value) || 60) : 60;
  }

  function getCriteriaTotalWeight() {
    return CRITERIA_LIST.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
  }

  function updateCriteriaSumBadge() {
    const badge = $("ev-criteria-sum-badge");
    const targetLabel = $("ev-qual-target-display");
    const target = getQualTargetScore();
    if (targetLabel) targetLabel.textContent = target;

    if (!badge) return;
    const total = getCriteriaTotalWeight();
    badge.textContent = `배점 합계: ${total} / ${target}점`;
    if (total === target) {
      badge.style.background = "#dbeafe";
      badge.style.color = "#1d4ed8";
    } else {
      badge.style.background = "#ffe4e6";
      badge.style.color = "#e11d48";
    }
  }

  function renderCriteriaRows() {
    const container = $("ev-criteria-rows");
    if (!container) return;
    let h = '';
    CRITERIA_LIST.forEach((crit, idx) => {
      h += `
        <div class="ev-criteria-row" data-idx="${idx}">
          <span style="font-weight:700;color:var(--sub);font-size:0.85rem;width:24px;">${idx + 1}.</span>
          <input type="text" class="crit-name" value="${crit.name}" placeholder="평가항목명">
          <input type="number" class="crit-weight" value="${crit.weight}" min="1" max="100" placeholder="배점">
          <span style="font-size:0.85rem;color:var(--sub);">점</span>
          <button type="button" class="rm-crit" style="background:none;border:none;color:var(--bad);cursor:pointer;font-weight:800;padding:2px 6px;" title="항목 삭제">✕</button>
        </div>
      `;
    });
    container.innerHTML = h;

    container.querySelectorAll(".ev-criteria-row").forEach(row => {
      const idx = parseInt(row.dataset.idx, 10);
      const nameInput = row.querySelector(".crit-name");
      const weightInput = row.querySelector(".crit-weight");
      const rmBtn = row.querySelector(".rm-crit");

      nameInput.addEventListener("input", () => {
        CRITERIA_LIST[idx].name = nameInput.value;
      });
      weightInput.addEventListener("input", () => {
        CRITERIA_LIST[idx].weight = parseFloat(weightInput.value) || 0;
        updateCriteriaSumBadge();
      });
      rmBtn.addEventListener("click", () => {
        if (CRITERIA_LIST.length <= 1) {
          alert("⚠️ 최소 1개 이상의 평가항목이 필요합니다.");
          return;
        }
        CRITERIA_LIST.splice(idx, 1);
        renderCriteriaRows();
        updateCriteriaSumBadge();
      });
    });

    updateCriteriaSumBadge();
  }

  const btnAddCriterion = $("ev-add-criterion");
  if (btnAddCriterion) {
    btnAddCriterion.addEventListener("click", () => {
      CRITERIA_LIST.push({ name: "새 평가항목", weight: 5 });
      renderCriteriaRows();
    });
  }

  const btnResetCriteria = $("ev-reset-criteria");
  if (btnResetCriteria) {
    btnResetCriteria.addEventListener("click", () => {
      CRITERIA_LIST = JSON.parse(JSON.stringify(DEFAULT_CRITERIA));
      renderCriteriaRows();
    });
  }

  const qualMaxInput = $("ev-qual-max");
  if (qualMaxInput) {
    qualMaxInput.addEventListener("input", updateCriteriaSumBadge);
  }

  renderCriteriaRows();

  // Helper to open Member Criteria Score Entry Modal
  window.openMemberEntryModal = function(companyId, companyName, memberIdx) {
    const memberCount = getMemberCount();
    const targetQualScore = getQualTargetScore();
    EVAL_SCORES_STORE[companyId] = EVAL_SCORES_STORE[companyId] || {};
    EVAL_SCORES_STORE[companyId][memberIdx] = EVAL_SCORES_STORE[companyId][memberIdx] || {};

    const currentScores = EVAL_SCORES_STORE[companyId][memberIdx];

    const overlay = document.createElement("div");
    overlay.className = "ev-modal-overlay";

    let h = `
      <div class="ev-modal-card">
        <div class="ev-modal-header">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <h3 style="margin:0;color:#1e40af;font-size:1.15rem;">위원 ${memberIdx + 1} 세부 평가 점수 입력</h3>
              <span style="font-size:0.88rem;color:#475569;font-weight:700;">대상 업체: <b>${companyName}</b></span>
            </div>
            <button type="button" class="close-modal" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:#64748b;">✕</button>
          </div>
          <p class="note" style="margin-top:6px;margin-bottom:0;">각 항목의 점수는 배점을 초과할 수 없으며, 합계는 자동으로 산출됩니다.</p>
        </div>
        <div class="ev-modal-body">
    `;

    CRITERIA_LIST.forEach((crit, cIdx) => {
      const val = currentScores[cIdx] !== undefined ? currentScores[cIdx] : '';
      h += `
        <div style="display:flex;justify-content:space-between;align-items:center;background:#f8fafc;padding:10px 14px;border-radius:12px;border:1px solid #e2e8f0;flex-shrink:0;">
          <div>
            <b style="font-size:0.94rem;color:#1e293b;">${crit.name}</b>
            <span style="font-size:0.82rem;color:#64748b;margin-left:6px;">(배점: ${crit.weight}점)</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <input type="number" class="modal-score-item" data-cidx="${cIdx}" data-max="${crit.weight}"
              style="width:80px;height:40px;text-align:center;font-weight:800;font-size:1rem;border-radius:8px;border:1.5px solid #93c5fd;"
              step="0.1" min="0" max="${crit.weight}" value="${val}" placeholder="0~${crit.weight}">
            <span style="font-weight:700;color:#475569;">/ ${crit.weight}점</span>
          </div>
        </div>
      `;
    });

    h += `
        </div>
        <div class="ev-modal-footer">
          <div style="display:flex;justify-content:space-between;align-items:center;background:#eff6ff;padding:12px 18px;border-radius:12px;border:1.5px solid #bfdbfe;">
            <b style="color:#1d4ed8;font-size:1.05rem;">이 위원의 정성평가 총점</b>
            <span style="font-size:1.2rem;font-weight:900;color:#1d4ed8;" id="modal-calculated-total">0.00 / ${targetQualScore}점</span>
          </div>
          <div style="display:flex;justify-content:flex-end;gap:10px;">
            <button type="button" class="btn ghost close-modal">취소</button>
            <button type="button" class="btn" id="modal-save-btn" style="background:#2563eb;">점수 저장 완료</button>
          </div>
        </div>
      </div>
    `;

    overlay.innerHTML = h;
    document.body.appendChild(overlay);

    const inputs = overlay.querySelectorAll(".modal-score-item");
    const totalEl = overlay.querySelector("#modal-calculated-total");

    function updateModalTotal() {
      let sum = 0;
      inputs.forEach(inp => {
        const v = parseFloat(inp.value) || 0;
        sum += v;
      });
      totalEl.textContent = `${sum.toFixed(2)} / ${targetQualScore}점`;
    }
    updateModalTotal();

    inputs.forEach(inp => {
      inp.addEventListener("input", () => {
        const max = parseFloat(inp.dataset.max) || 0;
        let v = parseFloat(inp.value) || 0;
        if (v > max) {
          alert(`⚠️ 입력 점수 (${v}점)가 항목 배점 한도(${max}점)를 초과할 수 없습니다.`);
          inp.value = max;
        }
        updateModalTotal();
      });
    });

    overlay.querySelectorAll(".close-modal").forEach(b => {
      b.addEventListener("click", () => overlay.remove());
    });

    overlay.querySelector("#modal-save-btn").addEventListener("click", () => {
      let valid = true;
      inputs.forEach(inp => {
        const cIdx = parseInt(inp.dataset.cidx, 10);
        const max = parseFloat(inp.dataset.max) || 0;
        const v = parseFloat(inp.value);
        if (isNaN(v) || v < 0 || v > max) {
          valid = false;
        } else {
          currentScores[cIdx] = v;
        }
      });

      if (!valid) {
        alert("⚠️ 올바른 점수를 입력해 주세요.");
        return;
      }

      overlay.remove();
      const div = document.querySelector(`.ev-row[data-cid="${companyId}"]`);
      if (div) updateRowMemberButtons(div, companyId);
    });
  };

  // Helper to open Member Detail Breakdown Modal
  window.openMemberDetailModal = function(companyId, companyName, memberIdx) {
    const targetQualScore = getQualTargetScore();
    const scores = (EVAL_SCORES_STORE[companyId] && EVAL_SCORES_STORE[companyId][memberIdx]) || {};

    const overlay = document.createElement("div");
    overlay.className = "ev-modal-overlay";

    let h = `
      <div class="ev-modal-card">
        <div class="ev-modal-header">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <h3 style="margin:0;color:#0f766e;font-size:1.15rem;">위원 ${memberIdx + 1} 세부 평가 내역</h3>
              <span style="font-size:0.88rem;color:#475569;font-weight:700;">대상 업체: <b>${companyName}</b></span>
            </div>
            <button type="button" class="close-modal" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:#64748b;">✕</button>
          </div>
        </div>
        <div class="ev-modal-body">
    `;

    let totalSum = 0;
    CRITERIA_LIST.forEach((crit, cIdx) => {
      const val = scores[cIdx] !== undefined ? scores[cIdx] : 0;
      totalSum += val;
      h += `
        <div style="display:flex;justify-content:space-between;align-items:center;background:#f8fafc;padding:10px 14px;border-radius:10px;border:1px solid #e2e8f0;flex-shrink:0;">
          <span style="font-weight:700;color:#334155;">• ${crit.name}</span>
          <b style="font-size:0.96rem;color:#0f766e;">${val.toFixed(1)} / ${crit.weight}점</b>
        </div>
      `;
    });

    h += `
        </div>
        <div class="ev-modal-footer">
          <div style="display:flex;justify-content:space-between;align-items:center;background:#f0fdf4;padding:14px 18px;border-radius:12px;border:1.5px solid #bbf7d0;">
            <b style="color:#047857;font-size:1.05rem;">이 위원의 정성평가 총점</b>
            <span style="font-size:1.25rem;font-weight:900;color:#047857;">${totalSum.toFixed(2)} / ${targetQualScore}점</span>
          </div>
          <div style="display:flex;justify-content:flex-end;">
            <button type="button" class="btn close-modal" style="background:#0f766e;">닫기</button>
          </div>
        </div>
      </div>
    `;

    overlay.innerHTML = h;
    document.body.appendChild(overlay);

    overlay.querySelectorAll(".close-modal").forEach(b => {
      b.addEventListener("click", () => overlay.remove());
    });
  };

  function updateRowMemberButtons(div, companyId) {
    const wrap = div.querySelector(".ev-quals-wrap");
    if (!wrap) return;
    const count = getMemberCount();
    const companyScores = EVAL_SCORES_STORE[companyId] || {};

    let h = '';
    for (let i = 0; i < count; i++) {
      const mScores = companyScores[i];
      let sumText = "입력";
      let isFilled = false;

      if (mScores && Object.keys(mScores).length > 0) {
        let sum = 0;
        CRITERIA_LIST.forEach((_, cIdx) => {
          if (mScores[cIdx] !== undefined) sum += mScores[cIdx];
        });
        sumText = `${sum.toFixed(1)}점`;
        isFilled = true;
      }

      const compName = div.querySelector(".ev-name").value.trim() || `업체`;
      h += `
        <button type="button" class="btn-member-entry" data-midx="${i}"
          onclick="window.openMemberEntryModal('${companyId}', '${compName}', ${i})"
          style="padding:6px 10px;border-radius:8px;font-size:0.84rem;font-weight:700;border:1.5px solid ${isFilled ? '#2563eb' : '#cbd5e1'};background:${isFilled ? '#eff6ff' : '#ffffff'};color:${isFilled ? '#1d4ed8' : '#64748b'};cursor:pointer;white-space:nowrap;">
          위원${i+1}: <b>${sumText}</b>
        </button>
      `;
    }
    wrap.innerHTML = h;
  }

  function evRow() {
    const rowsEl = $("ev-rows");
    if (!rowsEl) return;
    const companyId = "c_" + Math.random().toString(36).substr(2, 9);

    const div = document.createElement("div");
    div.className = "ev-row";
    div.dataset.cid = companyId;
    div.innerHTML = `
      <div class="ev-row-top">
        <input type="text" class="ev-name" placeholder="업체명 (예: 업체A)">
        <input type="text" class="money ev-bid" inputmode="numeric" placeholder="입찰가격 (원)">
        <input type="text" class="ev-quant" inputmode="numeric" placeholder="정량점수">
        <button type="button" class="rm" title="행 삭제">✕</button>
      </div>
      <div class="ev-row-bottom">
        <span style="font-size:0.84rem;font-weight:700;color:var(--sub);white-space:nowrap;">위원별 세부평가 점수:</span>
        <div class="ev-quals-wrap" style="display:flex;gap:6px;flex-wrap:wrap;flex:1;"></div>
      </div>
    `;

    attachMoney(div.querySelector(".ev-bid"));
    div.querySelector(".rm").addEventListener("click", () => {
      delete EVAL_SCORES_STORE[companyId];
      div.remove();
    });

    rowsEl.appendChild(div);
    updateRowMemberButtons(div, companyId);
  }

  const btnEvAdd = $("ev-add");
  if (btnEvAdd) {
    btnEvAdd.addEventListener("click", evRow);
    evRow(); evRow(); evRow();
  }

  const memberCountEl = $("ev-member-count");
  if (memberCountEl) {
    memberCountEl.addEventListener("change", () => {
      document.querySelectorAll("#ev-rows .ev-row").forEach(div => {
        const cid = div.dataset.cid;
        if (cid) updateRowMemberButtons(div, cid);
      });
    });
  }

  const swChk = $("ev-sw") ? $("ev-sw").querySelector("input") : null;
  if (swChk) {
    swChk.addEventListener("change", e => {
      if ($("ev-tech")) $("ev-tech").value = e.target.checked ? "90" : "80";
      if ($("ev-price-w")) $("ev-price-w").value = e.target.checked ? "10" : "20";
      if ($("ev-qual-max")) $("ev-qual-max").value = e.target.checked ? "70" : "60";
      updateCriteriaSumBadge();
    });
  }

  function calculateQualDetailsWithMembers(memberTotals) {
    const valid = memberTotals.filter(m => m.val !== null && !isNaN(m.val));
    if (!valid.length) {
      return { v: 0, trim: false, maxMember: null, minMember: null, valid, count: 0 };
    }
    if (valid.length >= 3) {
      const sorted = [...valid].sort((a, b) => a.val - b.val);
      const minMember = sorted[0];
      const maxMember = sorted[sorted.length - 1];
      const middle = sorted.slice(1, -1);
      const sum = middle.reduce((p, c) => p + c.val, 0);
      const avg = sum / middle.length;
      return { v: avg, trim: true, maxMember, minMember, middle, valid, count: valid.length };
    } else {
      const sum = valid.reduce((p, c) => p + c.val, 0);
      return { v: sum / valid.length, trim: false, maxMember: null, minMember: null, middle: valid, valid, count: valid.length };
    }
  }

  const btnEvRun = $("ev-run");
  if (btnEvRun) {
    btnEvRun.addEventListener("click", () => {
      const base = num($("ev-base"));
      const techW = parseFloat($("ev-tech").value) || 0, priceW = parseFloat($("ev-price-w").value) || 0;
      const sw = $("ev-sw") ? $("ev-sw").querySelector("input").checked : false;
      const memberCount = getMemberCount();
      const totalCriteriaWeight = getCriteriaTotalWeight();
      const targetQualScore = getQualTargetScore();
      const out = $("ev-out");

      if (!base) { alert("⚠️ 예정가격을 입력해 주세요."); return; }
      if (totalCriteriaWeight !== targetQualScore) {
        alert(`⚠️ 정성적 평가 항목 배점의 합계(${totalCriteriaWeight}점)가 설정하신 정성평가 총 배점 한도(${targetQualScore}점)와 일치해야 합니다.`);
        return;
      }

      const rows = [...document.querySelectorAll("#ev-rows .ev-row")].map((r, i) => {
        const companyId = r.dataset.cid;
        const name = r.querySelector(".ev-name").value.trim() || ("업체 " + String.fromCharCode(65 + i));
        const bid = parseInt((r.querySelector(".ev-bid").value || "").replace(/[^0-9]/g, ""), 10) || 0;
        const quant = parseFloat(r.querySelector(".ev-quant").value) || 0;

        const cScores = EVAL_SCORES_STORE[companyId] || {};
        const memberTotals = [];

        for (let m = 0; m < memberCount; m++) {
          const mSc = cScores[m];
          if (mSc && Object.keys(mSc).length > 0) {
            let sum = 0;
            CRITERIA_LIST.forEach((_, cIdx) => {
              if (mSc[cIdx] !== undefined) sum += mSc[cIdx];
            });
            memberTotals.push({ memberIdx: m, val: sum });
          } else {
            memberTotals.push({ memberIdx: m, val: null });
          }
        }

        return { companyId, name, bid, quant, memberTotals };
      }).filter(r => r.bid > 0);

      if (!rows.length) { alert("⚠️ 입찰가격을 입력한 업체를 1건 이상 등록해 주세요."); return; }

      const floorR = sw ? 0.8 : 0.7, p80 = base * 0.8, p70 = base * 0.7, floorV = base * floorR;
      const rawMin = Math.min(...rows.map(r => r.bid));
      const minBid = Math.max(rawMin, floorV);
      const notes = new Set();

      if (rawMin < floorV) notes.add("최저입찰가격이 예정가격의 " + (floorR * 100) + "% 미만이라 " + (floorR * 100) + "% 상당가격(" + won(Math.round(floorV)) + ")으로 보정해 계산했어요.");

      rows.forEach(r => {
        const qDetail = calculateQualDetailsWithMembers(r.memberTotals);
        r.qualDetail = qDetail;
        r.qual = qDetail.v;
        if (r.memberTotals.filter(m => m.val !== null).length && !qDetail.trim) notes.add("위원 점수가 3개 미만인 업체는 최고·최저 제외 없이 전체 평균으로 계산했어요.");
        if (r.bid < floorV) { r.pricePt = priceW * 0.3; r.tagP = "하한 미만 → 배점의 30%"; }
        else if (r.bid >= p80) { r.pricePt = priceW * minBid / r.bid; r.tagP = ""; }
        else {
          r.pricePt = priceW * minBid / p80 + 2 * ((p80 - r.bid) / (p80 - p70)); r.tagP = "80% 미만 산식";
          notes.add("예정가격의 80% 미만 입찰은 예규 제2산식(가산 최대 2점)으로 계산했어요.");
        }
        r.tech = r.quant + r.qual;
        r.total = r.tech + r.pricePt;
        r.pass = sw ? (r.tech >= techW * 0.85) : (r.total >= 70);
      });

      rows.sort((a, b) => b.total - a.total).forEach((r, i) => r.rank = i + 1);

      // PRIORITY BANNER & TABLE 1: SUMMARY RANKING TABLE
      const passingRows = rows.filter(r => r.pass);
      let priBox = '<div style="background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:14px;padding:16px;margin-top:20px;margin-bottom:18px;">';
      priBox += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px;">';
      priBox += '<h4 style="margin:0;color:#1d4ed8;font-size:1.08rem;display:flex;align-items:center;gap:6px;">🏆 최종 협상 우선순위 결과</h4>';
      priBox += '<button type="button" class="btn-print-report" onclick="window.printEvaluationReport()">🖨️ 평가 결과 PDF 저장 / 인쇄 출력</button>';
      priBox += '</div>';

      if (passingRows.length) {
        priBox += '<div style="display:flex;flex-direction:column;gap:8px;">';
        passingRows.forEach((r, idx) => {
          const label = idx === 0 ? "🥇 1순위 [우선협상대상자]" : (idx === 1 ? "🥈 2순위 [차순위 협상대상자]" : `${idx + 1}순위 [차순위]`);
          const bg = idx === 0 ? "#dcfce7" : "#ffffff";
          const border = idx === 0 ? "#86efac" : "#cbd5e1";
          const color = idx === 0 ? "#15803d" : "#334155";
          priBox += `<div style="background:${bg};border:1px solid ${border};padding:10px 14px;border-radius:10px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
            <span style="font-weight:800;color:${color};font-size:0.96rem;">${label}: <b>${r.name}</b></span>
            <span style="font-weight:900;color:${color};font-size:1.02rem;">종합점수 <b>${r.total.toFixed(2)}점</b> <small style="font-weight:400;color:#64748b;">(기술 ${r.tech.toFixed(2)}점 + 가격 ${r.pricePt.toFixed(2)}점)</small></span>
          </div>`;
        });
        priBox += '</div>';
        priBox += '<p class="note" style="margin-top:10px;margin-bottom:0;color:#1e40af;">※ 1순위 우선협상대상자와 제안서 내용 및 입찰가격 협상을 진행하며, 협상 타결 시 최종 계약대상자로 선정됩니다.</p>';
      } else {
        priBox += '<p style="margin:0;color:#e11d48;font-weight:700;">⚠️ 기술점수(정량+정성) 기준 미달로 협상적격자가 없습니다.</p>';
      }
      priBox += '</div>';

      let h = priBox;
      h += '<div style="margin-top:20px;margin-bottom:24px;">';
      h += '<h3 style="color:#1e40af;margin-bottom:8px;">1. 제안서 종합 평가 및 낙찰 적격 판정 결과</h3>';
      h += '<div class="res" style="overflow-x:auto"><table>';
      h += '<tr><th>순위</th><th>우선순위 (협상대상)</th><th>업체명</th><th>입찰가 (예가 대비)</th><th>정량점수</th><th>정성평균(최고·최저 제외)</th><th>가격평점</th><th>기술점수</th><th>종합점수</th><th>적격 여부</th></tr>';
      rows.forEach(r => {
        let pBadge = '';
        if (!r.pass) {
          pBadge = '<span class="badge-priority p-fail">순위 외 (적격 미달)</span>';
        } else if (r.rank === 1) {
          pBadge = '<span class="badge-priority p1">🥇 1순위 (우선협상)</span>';
        } else if (r.rank === 2) {
          pBadge = '<span class="badge-priority p2">🥈 2순위 (차순위)</span>';
        } else if (r.rank === 3) {
          pBadge = '<span class="badge-priority p3">🥉 3순위 (차순위)</span>';
        } else {
          pBadge = `<span class="badge-priority p-other">${r.rank}순위 (후순위)</span>`;
        }

        h += '<tr' + (r.rank === 1 && r.pass ? ' class="win"' : '') + '><td>' + r.rank + '</td>'
          + '<td>' + pBadge + '</td>'
          + '<td><b>' + r.name + '</b></td>'
          + '<td class="num">' + won(r.bid) + '<br><span style="color:var(--sub)">' + (r.bid / base * 100).toFixed(2) + '%</span>'
          + (r.tagP ? ' ' + tagHtml(r.tagP, "o") : '') + '</td>'
          + '<td class="num">' + r.quant.toFixed(2) + '</td><td class="num"><b style="color:#2563eb">' + r.qual.toFixed(2) + '</b></td>'
          + '<td class="num">' + r.pricePt.toFixed(2) + '</td><td class="num">' + r.tech.toFixed(2) + '</td>'
          + '<td class="num"><b style="font-size:1.05rem;">' + r.total.toFixed(2) + '</b></td>'
          + '<td>' + (r.pass ? tagHtml("적격", "k") : tagHtml("미달", "r")) + '</td></tr>';
      });
      h += '</table></div>';
      h += '<p class="note">적격 기준 — ' + (sw
        ? 'SW사업: 기술점수(정량+정성)가 기술배점 ' + techW + '점의 85%인 ' + (techW * 0.85).toFixed(2) + '점 이상'
        : '일반: 종합평점 70점 이상') + ' · 적격자 중 1순위부터 기술협상 → 가격협상 순으로 진행해요.</p></div>';

      // TABLE 2: DETAILED COMMITTEE MEMBER SCORE BREAKDOWN MATRIX WITH LINKS
      h += '<div style="margin-top:20px;margin-bottom:16px;">';
      h += '<h3 style="color:#0f766e;margin-bottom:8px;">2. 위원별 정성적 평가 세부 집계표 (최고·최저 총점 제외 내역)</h3>';
      h += '<div class="res" style="overflow-x:auto"><table>';
      h += '<tr><th>업체명</th>';
      for (let m = 1; m <= memberCount; m++) {
        h += `<th>위원 ${m}</th>`;
      }
      h += '<th>최고 총점 (제외 위원)</th><th>최저 총점 (제외 위원)</th><th>최종 정성평균</th></tr>';

      rows.forEach(r => {
        const qd = r.qualDetail;
        h += '<tr><td><b>' + r.name + '</b></td>';
        for (let m = 0; m < memberCount; m++) {
          const mObj = r.memberTotals[m];
          const scoreVal = mObj ? mObj.val : null;

          if (scoreVal === null) {
            h += '<td style="color:#94a3b8;">미입력</td>';
          } else if (qd.trim && qd.maxMember && qd.maxMember.memberIdx === m) {
            h += `<td><button class="btn-member-link max-link" onclick="window.openMemberDetailModal('${r.companyId}', '${r.name}', ${m})" title="클릭 시 위원 세부 평가항목 보기">[최고 제외] 위원${m+1}: ${scoreVal.toFixed(1)}점</button></td>`;
          } else if (qd.trim && qd.minMember && qd.minMember.memberIdx === m) {
            h += `<td><button class="btn-member-link min-link" onclick="window.openMemberDetailModal('${r.companyId}', '${r.name}', ${m})" title="클릭 시 위원 세부 평가항목 보기">[최저 제외] 위원${m+1}: ${scoreVal.toFixed(1)}점</button></td>`;
          } else {
            h += `<td><button class="btn-member-link" onclick="window.openMemberDetailModal('${r.companyId}', '${r.name}', ${m})" title="클릭 시 위원 세부 평가항목 보기">위원${m+1}: ${scoreVal.toFixed(1)}점</button></td>`;
          }
        }

        const maxStr = qd.maxMember ? `<span class="badge-max">위원${qd.maxMember.memberIdx + 1} (${qd.maxMember.val.toFixed(1)}점)</span>` : '–';
        const minStr = qd.minMember ? `<span class="badge-min">위원${qd.minMember.memberIdx + 1} (${qd.minMember.val.toFixed(1)}점)</span>` : '–';

        h += `<td class="num">${maxStr}</td>`;
        h += `<td class="num">${minStr}</td>`;
        h += `<td class="num"><b style="color:#0f766e;font-size:1.02rem;">${r.qual.toFixed(2)}점</b></td>`;
        h += '</tr>';
      });
      h += '</table></div>';
      h += '<p class="note">※ 행안부 예규: 평가위원이 3인 이상인 경우 위원별 총점 기준 최고점 1명과 최저점 1명을 제외하고 남은 위원의 총점을 산술평균합니다. 위원 버튼을 클릭하면 세부 평가항목 점수를 확인하실 수 있습니다.</p></div>';

      if (notes.size) h += '<div class="warnbox">' + [...notes].map(n => '· ' + n).join('<br>') + '</div>';

      out.innerHTML = h;
      if (window.attachLegalTooltips) window.attachLegalTooltips();
    });
  }

  window.printEvaluationReport = function() {
    window.print();
  };

  /* ───── 낙찰하한율 ───── */
  const RATE_TABLE = {
    gongsa:{label:"공사 (행안부 적격심사)",note:"추정가격 300억원 이상은 종합평가 낙찰자 결정 등 별도 기준",
      brackets:[[100*E,300*E,81.995],[50*E,100*E,87.495],[30*E,50*E,88.745],[10*E,30*E,88.745],[3*E,10*E,89.745],[2*E,3*E,87.745],[0,2*E,87.745]]},
    ilban:{label:"일반용역 적격심사",
      brackets:[[30*E,Infinity,72.995],[10*E,30*E,77.995],[5*E,10*E,85.495],[2*E,5*E,86.745],[0,2*E,87.745]]},
    danso:{label:"일반용역 — 단순노무",flat:87.745,note:"금액과 관계없이 87.745%"},
    gisulPQ:{label:"기술용역 (PQ)",note:"건설엔지니어링(설계·건설사업관리·감리 등) — 사업수행능력평가 통과자 대상",brackets:[[10*E,Infinity,79.995],[5*E,10*E,85.495],[0,5*E,86.745]]},
    gisulNPQ:{label:"기술용역 (비PQ)",note:"PQ 비대상 기술용역 적격심사",brackets:[[10*E,Infinity,79.995],[5*E,10*E,85.495],[2*E,5*E,86.745],[0,2*E,87.745]]},
    haksul:{label:"학술용역",flat:80.495},
    mulpumH:{label:"물품 (행안부 적격심사)",goshi:[80.495,84.245],
      note:"고시금액 이상 80.495% · 미만 84.245% — 고시금액은 2년마다 변경되니 현행 고시 확인"},
    mulpumJ:{label:"물품 — 중소기업자간 경쟁제품 (계약이행능력심사)",flat:89.995,note:"'26.7.31. 매뉴얼 개정 — 87.995%에서 89.995%로 상향"},
    gunpye:{label:"건설폐기물처리용역 (환경부)",
      brackets:[[100*E,Infinity,72.995],[30*E,100*E,77.995],[15*E,30*E,82.995],[5*E,15*E,85.495],[2*E,5*E,86.745],[0,2*E,87.745]]},
    ilpye:{label:"일반폐기물처리용역 (서울시)",note:"생활폐기물 수집·운반만 평가 시 금액 무관 87.745%",
      brackets:[[30*E,Infinity,72.995],[10*E,30*E,77.995],[5*E,10*E,85.495],[2*E,5*E,86.745],[1*E,2*E,87.745],[0,1*E,87.745]]},
    boheom:{label:"보험용역",flat:47.995},
    ganhaeng:{label:"간행물 (간행물평가기준)",flat:89.995},
    "su-gongsa":{label:"2인 견적 수의 — 공사",flat:89.745,note:"예정가격 대비 89.745% 이상 최저가 순"},
    "su-yong":{label:"2인 견적 수의 — 용역·물품",suyong:true,note:"2천만원 초과 88% · 이하 90% 이상"},
    "su-ganhaeng":{label:"2인 견적 수의 — 간행물",flat:90,note:"출판문화산업 진흥법 §22 간행물 — 90% 이상"}
  };

  function bracketLabel(lo,hi){
    const f = x => x>=E ? (x/E).toLocaleString()+"억" : (x/1e4).toLocaleString()+"만";
    if(hi===Infinity) return f(lo)+"원 이상";
    if(lo===0) return f(hi)+"원 미만";
    return f(lo)+"원 ~ "+f(hi)+"원 미만";
  }

  const btnRRun = $("r-run");
  if(btnRRun) {
    btnRRun.addEventListener("click",()=>{
      const cat = RATE_TABLE[$("r-cat").value], p = num($("r-price")), base = num($("r-base"));
      let rate=null, cond="";
      if(cat.flat!=null){ rate=cat.flat; cond="금액 구간과 무관"; }
      else if(cat.suyong){
        if(!p){ $("r-out").innerHTML='<p class="placeholder">추정가격을 입력해 주세요.</p>'; return; }
        rate = p<=2e7?90:88; cond = p<=2e7?"추정가격 2천만원 이하":"추정가격 2천만원 초과";
      }
      else if(cat.goshi){
        if(p>=10*E){ rate=cat.goshi[0]; cond="10억원 이상 (고시금액 이상 확실)"; }
      }
      else{
        if(!p){ $("r-out").innerHTML='<p class="placeholder">추정가격을 입력해 주세요.</p>'; return; }
        for(const [lo,hi,r] of cat.brackets){ if(p>=lo&&p<hi){ rate=r; cond=bracketLabel(lo,hi); break; } }
      }
      let h="";
      if(rate!==null){
        h += '<div class="verdict blue"><span class="big">'+rate+'%</span><div><b>'+cat.label+'</b><small>'+cond+(p?' · 추정가격 '+korUnit(p):'')+'</small></div></div>';
        if(base){
          const floor = Math.ceil(base*rate/100);
          h += '<div class="res">예정가격 '+won(base)+' × '+rate+'% = 투찰 하한액 <b class="money">'+won(floor)+'</b><br><span style="color:var(--sub);font-size:.84rem">이 금액 이상 ~ 예정가격 이하에서 하한율 직상 최저가격이 1순위</span></div>';
        }
      } else if(cat.goshi){
        h += '<div class="verdict blue"><span class="big">🔎</span><div><b>'+cat.label+'</b><small>고시금액 이상 80.495% · 미만 84.245% — 현행 고시금액과 비교 필요</small></div></div>';
      } else {
        h += '<div class="verdict blue"><span class="big">📐</span><div><b>별도 기준</b><small>'+(cat.note||"해당 구간은 별도 기준(종합평가 등) 적용")+'</small></div></div>';
      }
      if(cat.note) h += '<p class="note">'+cat.note+'</p>';
      $("r-out").innerHTML = h;
      if (window.attachLegalTooltips) window.attachLegalTooltips();
    });
  }

  /* ───── 조달청 Open API 연동 ───── */
  const btnTestG2bApi = $("btnTestG2bApi");
  if(btnTestG2bApi) {
    btnTestG2bApi.addEventListener("click", async () => {
      const keyEl = $("apiServiceKey");
      const instEl = $("apiInstCd");
      const resultArea = $("g2bApiResultArea");
      const logEl = $("g2bApiLog");

      const key = keyEl ? keyEl.value.trim() : "";
      const instCd = instEl ? instEl.value.trim() : "6110000";

      if(resultArea) resultArea.style.display = "block";
      if(logEl) logEl.innerHTML = `<span style="color:var(--pri)">⏳ 조달청 나라장터 API 요청 서버와 연결 시도 중...</span><br>`;

      if (!key) {
        if(logEl) {
          logEl.innerHTML += `
<span style="color:var(--warn)">⚠️ 안내: 공공데이터포털(data.go.kr) 서비스키가 입력되지 않았습니다.</span><br>
----------------------------------------------------------------<br>
<b>[조달청 나라장터 Open API 실제 호출 가이드]</b><br>
• 엔드포인트: https://apis.data.go.kr/1230000/BidPublicInfoService04/getBidPblancListInfoInfo01<br>
• 파라미터:<br>
  - serviceKey: {공공데이터포털 발급 디코딩 키}<br>
  - numOfRows: 10<br>
  - pageNo: 1<br>
  - inqryDiv: 1<br>
  - type: json<br>
  - instCd: ${instCd} (서울특별시 본청)<br>
----------------------------------------------------------------<br>
공공데이터포털(data.go.kr)에서 [조달청_나라장터 입찰공고 정보] 신청 후 발급받은 ServiceKey를 위 입력란에 붙여넣고 버튼을 다시 눌러주세요.
`;
        }
        return;
      }

      try {
        const targetUrl = `https://apis.data.go.kr/1230000/BidPublicInfoService04/getBidPblancListInfoInfo01?serviceKey=${encodeURIComponent(key)}&numOfRows=10&pageNo=1&inqryDiv=1&type=json&instCd=${encodeURIComponent(instCd)}`;
        if(logEl) logEl.innerHTML += `<span>요청 URL: ${targetUrl.substring(0, 80)}...</span><br>`;
        
        const resp = await fetch(targetUrl);
        if (resp.ok) {
          const json = await resp.json();
          if(logEl) logEl.innerHTML += `<span style="color:var(--ok)">✓ 조달청 API 응답 성공! (Status 200 OK)</span><br><pre style="white-space:pre-wrap">${JSON.stringify(json, null, 2)}</pre>`;
        } else {
          if(logEl) logEl.innerHTML += `<span style="color:var(--bad)">❌ API 응답 오류 (HTTP Status: ${resp.status})</span><br>인증키 유효 여부 및 공공데이터포털 활용신청 상태를 확인하세요.`;
        }
      } catch (err) {
        if(logEl) logEl.innerHTML += `<span style="color:var(--warn)">ℹ️ 브라우저 보안 제약 (CORS):</span><br>클라이언트 웹 브라우저에서 공공데이터포털 direct fetch 시 CORS 보안 정책이 적용될 수 있습니다. 백엔드 프록시 서버를 구축하거나 공공데이터포털 도메인을 허용하여 호출하는 것을 권장합니다.`;
      }
    });
  }

  /* ───── Save / Load Progress System (파일 저장 & 불러오기 & LocalStorage 자동저장) ───── */

  // Calculator Sub-tab click listeners
  document.querySelectorAll(".calc-subtab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".calc-subtab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".calc-panel").forEach(p => p.classList.remove("on"));

      btn.classList.add("active");
      const calcKey = btn.dataset.calc;
      const target = $("calc-panel-" + calcKey);
      if (target) target.classList.add("on");
    });
  });

  /* ───── 6. 기준 한눈에 서브 탭 switching ───── */
  document.querySelectorAll(".ref-subtab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".ref-subtab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".ref-panel").forEach(p => p.classList.remove("on"));

      btn.classList.add("active");
      const refKey = btn.dataset.ref;
      const target = $("ref-panel-" + refKey);
      if (target) target.classList.add("on");
    });
  });

  /* ───── 7. AI 계약 Q&A (OpenAI GPT API 연동 & 플로팅 챗봇 위젯) ───── */
  const aiWidget = $("ai-chatbot-widget");
  const btnToggleAiWidget = $("btn-toggle-ai-widget");
  const btnCloseAiWidget = $("btn-close-ai-widget");
  const btnToggleGptKeybox = $("btn-toggle-gpt-keybox");
  const gptKeyboxPanel = $("gpt-keybox-panel");

  const gptKeyInput = $("gpt-api-key");
  const gptModelSelect = $("gpt-model");
  const btnSaveGptKey = $("btn-save-gpt-key");
  const gptChatBox = $("gpt-chat-box");
  const gptInputText = $("gpt-input-text");
  const btnSendGpt = $("btn-send-gpt");
  const btnGptClear = $("btn-gpt-clear");

  window.openAiChatbotWidget = function() {
    if (aiWidget) {
      aiWidget.classList.add("open");
      if (gptInputText) gptInputText.focus();
    }
  };

  function toggleAiChatbotWidget() {
    if (aiWidget) {
      aiWidget.classList.toggle("open");
      if (aiWidget.classList.contains("open") && gptInputText) {
        gptInputText.focus();
      }
    }
  }

  if (btnToggleAiWidget) {
    btnToggleAiWidget.addEventListener("click", toggleAiChatbotWidget);
  }

  if (btnCloseAiWidget) {
    btnCloseAiWidget.addEventListener("click", () => {
      if (aiWidget) aiWidget.classList.remove("open");
    });
  }

  if (btnToggleGptKeybox) {
    btnToggleGptKeybox.addEventListener("click", () => {
      if (gptKeyboxPanel) {
        gptKeyboxPanel.style.display = gptKeyboxPanel.style.display === "none" ? "block" : "none";
      }
    });
  }

  if (gptInputText) {
    gptInputText.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendGptMessage();
      }
    });
  }

  // Restore API key if saved
  try {
    const savedKey = localStorage.getItem("seoul_gpt_api_key");
    if (savedKey && gptKeyInput) gptKeyInput.value = savedKey;
  } catch(e) {}

  if (btnSaveGptKey) {
    btnSaveGptKey.addEventListener("click", () => {
      const key = gptKeyInput ? gptKeyInput.value.trim() : "";
      if (!key) {
        alert("⚠️ OpenAI API Key를 입력해 주세요.");
        return;
      }
      try {
        localStorage.setItem("seoul_gpt_api_key", key);
        alert("✅ OpenAI API Key가 성공적으로 보관되었습니다.");
      } catch(e) {
        alert("⚠️ Key 저장 중 오류: " + e.message);
      }
    });
  }

  function appendChatBubble(role, text) {
    if (!gptChatBox) return;
    const div = document.createElement("div");
    div.className = `chat-bubble ${role}`;
    div.innerHTML = text.replace(/\n/g, "<br>");
    gptChatBox.appendChild(div);
    gptChatBox.scrollTop = gptChatBox.scrollHeight;
  }

  if (btnGptClear) {
    btnGptClear.addEventListener("click", () => {
      if (gptChatBox) {
        gptChatBox.innerHTML = '<div class="chat-bubble system-info">🤖 대화 내용이 초기화되었습니다. 질문을 입력해 주세요.</div>';
      }
    });
  }

  // Preset chips click
  document.querySelectorAll(".preset-chip-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const q = btn.dataset.q;
      if (gptInputText) {
        gptInputText.value = q;
        sendGptMessage();
      }
    });
  });

  if (btnSendGpt) {
    btnSendGpt.addEventListener("click", sendGptMessage);
  }

  async function sendGptMessage() {
    const prompt = gptInputText ? gptInputText.value.trim() : "";
    if (!prompt) { alert("⚠️ 질문 내용을 입력해 주세요."); return; }

    const apiKey = gptKeyInput ? gptKeyInput.value.trim() : localStorage.getItem("seoul_gpt_api_key") || "";
    if (!apiKey) {
      alert("⚠️ OpenAI API Key가 필요합니다. 상단 키 설정 칸에 sk-... 형태로 입력 후 [키 저장]을 눌러주세요.");
      return;
    }

    appendChatBubble("user", prompt);
    if (gptInputText) gptInputText.value = "";

    const loadingId = "gpt-loading-" + Date.now();
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "chat-bubble ai";
    loadingDiv.id = loadingId;
    loadingDiv.innerHTML = "⌛ 해치가 지방계약 규정을 검토 중입니다... (GPT 답변 생성 중)";
    if (gptChatBox) {
      gptChatBox.appendChild(loadingDiv);
      gptChatBox.scrollTop = gptChatBox.scrollHeight;
    }

    const model = gptModelSelect ? gptModelSelect.value : "gpt-4o-mini";

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content: "당신은 서울특별시 지방계약법 및 행안부 예규, 서울시 회계규칙 전문 AI 계약 자문관입니다. 지방계약법 시행령, 낙찰자 결정기준, 수의계약 특례, 계약 절차 등에 대해 친절하고 정확하며 명확한 조항과 함께 전문적으로 답변해 주세요."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error ? errData.error.message : response.statusText);
      }

      const data = await response.json();
      const aiMessage = data.choices && data.choices[0] ? data.choices[0].message.content : "답변을 수신하지 못했습니다.";
      
      const targetLoading = document.getElementById(loadingId);
      if (targetLoading) {
        targetLoading.innerHTML = aiMessage.replace(/\n/g, "<br>");
      }
    } catch(err) {
      console.error("GPT API Error:", err);
      const targetLoading = document.getElementById(loadingId);
      if (targetLoading) {
        targetLoading.innerHTML = `<span style="color:#e11d48;font-weight:700;">⚠️ API 호출 오류: ${err.message}</span><br><small style="color:#64748b;">API Key 및 네트워크 상태를 확인하세요.</small>`;
      }
    }
  }

  /* ───── 8. 계약서식 모음 및 사용자 파일 등록 ───── */
  window.downloadSampleForm = function(filename) {
    const sampleText = `[서울특별시 발주실무 서식 양식]\n\n서식명: ${filename}\n작성일자: ${new Date().toLocaleDateString("ko-KR")}\n발주기관: 서울특별시\n\n※ 본 서식은 서울계약 도우미 실무 표준 가이드 양식입니다. 해당 업무에 맞춰 수정하여 사용하세요.`;
    const blob = new Blob([sampleText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const btnAddUserForm = $("btn-add-user-form");
  const userFormFileInput = $("user-form-file-input");
  const userFormTitle = $("user-form-title");
  const userFormDesc = $("user-form-desc");
  const userFormsList = $("user-forms-list");

  function getUserForms() {
    try {
      const saved = localStorage.getItem("seoul_user_contract_forms");
      return saved ? JSON.parse(saved) : [];
    } catch(e) { return []; }
  }

  function saveUserForms(list) {
    try {
      localStorage.setItem("seoul_user_contract_forms", JSON.stringify(list));
      renderUserFormsList();
    } catch(e) {
      alert("⚠️ 파일 저장용량 한도를 초과하였거나 저장에 실패했습니다.");
    }
  }

  function renderUserFormsList() {
    if (!userFormsList) return;
    const forms = getUserForms();
    if (!forms.length) {
      userFormsList.innerHTML = '<p style="color:#94a3b8;font-size:0.88rem;padding:8px 0;">아직 등록된 사용자 지정 서식이 없습니다. 위에서 파일을 선택해 추가해 보세요.</p>';
      return;
    }

    let h = '<div class="res" style="overflow-x:auto"><table>';
    h += '<tr><th>서식 제목</th><th>파일명</th><th>크기</th><th>등록일</th><th>관리 / 다운로드</th></tr>';
    forms.forEach((f, idx) => {
      h += `<tr>
        <td><b>${f.title}</b>${f.desc ? '<br><small style="color:#64748b;">'+f.desc+'</small>' : ''}</td>
        <td><code style="font-size:0.82rem;">${f.name}</code></td>
        <td class="num">${(f.size / 1024).toFixed(1)} KB</td>
        <td>${f.date}</td>
        <td>
          <a href="${f.data}" download="${f.name}" class="btn ghost" style="padding:4px 10px;font-size:0.82rem;text-decoration:none;display:inline-flex;align-items:center;gap:4px;">💾 다운로드</a>
          <button type="button" class="btn ghost" onclick="window.deleteUserForm(${idx})" style="padding:4px 8px;font-size:0.82rem;color:#e11d48;">❌ 삭제</button>
        </td>
      </tr>`;
    });
    h += '</table></div>';
    userFormsList.innerHTML = h;
  }

  window.deleteUserForm = function(idx) {
    if (confirm("정말 이 서식을 삭제하시겠습니까?")) {
      const forms = getUserForms();
      forms.splice(idx, 1);
      saveUserForms(forms);
    }
  };

  if (btnAddUserForm) {
    btnAddUserForm.addEventListener("click", () => {
      const title = userFormTitle ? userFormTitle.value.trim() : "";
      const desc = userFormDesc ? userFormDesc.value.trim() : "";
      const file = userFormFileInput && userFormFileInput.files[0] ? userFormFileInput.files[0] : null;

      if (!title) { alert("⚠️ 서식 제목을 입력해 주세요."); return; }
      if (!file) { alert("⚠️ 내 PC에서 등록할 파일(.hwp, .xlsx, .pdf 등)을 선택해 주세요."); return; }

      const reader = new FileReader();
      reader.onload = function(e) {
        const fileData = e.target.result;
        const newForm = {
          title: title,
          desc: desc,
          name: file.name,
          size: file.size,
          date: new Date().toLocaleDateString("ko-KR"),
          data: fileData
        };

        const list = getUserForms();
        list.push(newForm);
        saveUserForms(list);

        if (userFormTitle) userFormTitle.value = "";
        if (userFormDesc) userFormDesc.value = "";
        if (userFormFileInput) userFormFileInput.value = "";
        alert(`🎉 '${file.name}' 서식이 성공적으로 등록되었습니다!`);
      };
      reader.readAsDataURL(file);
    });
  }

  renderUserFormsList();

  function getCurrentStateObj() {
    const p = num($("price"));
    return {
      version: "2.0",
      savedAt: new Date().toLocaleString("ko-KR"),
      kind: KIND,
      price: p,
      options: {
        special: $("opt-special") ? $("opt-special").querySelector("input").checked : false,
        severe: $("opt-severe") ? $("opt-severe").querySelector("input").checked : false,
        nego: $("opt-nego") ? $("opt-nego").querySelector("input").checked : false,
        festival: $("opt-festival") ? $("opt-festival").querySelector("input").checked : false,
        gam: $("opt-gam") ? $("opt-gam").querySelector("input").checked : false,
        it: $("opt-it") ? $("opt-it").querySelector("input").checked : false,
        itNew: $("opt-itnew") ? $("opt-itnew").querySelector("input").checked : false,
        itMaint: $("opt-itmaint") ? $("opt-itmaint").querySelector("input").checked : false,
        itPub: $("opt-itpub") ? $("opt-itpub").querySelector("input").checked : false,
        itAudit: $("opt-itaudit") ? $("opt-itaudit").querySelector("input").checked : false,
        mat: $("opt-mat") ? $("opt-mat").querySelector("input").checked : false,
        mat3ja: $("opt-mat-3ja") ? $("opt-mat-3ja").querySelector("input").checked : false,
        matMas: $("opt-mat-mas") ? $("opt-mat-mas").querySelector("input").checked : false,
        matSelf: $("opt-mat-self") ? $("opt-mat-self").querySelector("input").checked : false
      },
      currStage: CURR_STAGE,
      viewAllStages: VIEW_ALL_STAGES,
      checkedIds: Array.from(CKSET),
      evalCriteria: CRITERIA_LIST,
      evalQualMax: getQualTargetScore(),
      evalScores: EVAL_SCORES_STORE
    };
  }

  function autoSaveLocal() {
    try {
      const state = getCurrentStateObj();
      localStorage.setItem("seoul_contract_state", JSON.stringify(state));
    } catch(e) {}
  }

  window.saveProgressFile = function() {
    const state = getCurrentStateObj();
    const jsonStr = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const kindName = (state.kind && KINFO[state.kind]) ? KINFO[state.kind].name : "계약";
    const priceText = state.price ? korUnit(state.price).replace(/\s+/g, "") : "미입력";
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const fileName = `서울계약_점검현황_${kindName}_${priceText}_${dateStr}.json`;

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  window.loadProgressFile = function(file) {
    const fileInput = $("load-file-input");
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const state = JSON.parse(e.target.result);
        restoreStateObj(state);
        const stageName = STAGES[state.currStage] ? STAGES[state.currStage].name : "진행 단계";
        const count = state.checkedIds ? state.checkedIds.length : 0;
        alert(`🎉 계약 점검 및 계산 데이터를 성공적으로 불러왔습니다!\n\n• 저장 일시: ${state.savedAt || '기록 없음'}\n• 현재 단계: ${stageName}\n• 체크 완료 항목: 총 ${count}건`);
      } catch(err) {
        console.error("Load File Error:", err);
        alert("⚠️ 저장 파일(.json) 처리 중 오류가 발생했습니다: " + err.message);
      } finally {
        if(fileInput) fileInput.value = "";
      }
    };
    reader.readAsText(file);
  };

  window.triggerLoadFile = function() {
    const fileInput = $("load-file-input");
    if(fileInput) fileInput.click();
  };

  function restoreStateObj(state) {
    if(!state) return;
    if(state.kind && KINFO[state.kind]) {
      KIND = state.kind;
      const kindEl = $("kind");
      if(kindEl) {
        kindEl.querySelectorAll(".chip").forEach(b => {
          b.classList.toggle("on", b.dataset.k === KIND);
        });
      }
    }
    if(state.price !== undefined) {
      const priceInput = $("price");
      if(priceInput) {
        const pVal = state.price ? parseInt(state.price, 10) : 0;
        priceInput.value = pVal ? pVal.toLocaleString("ko-KR") : "";
        const hint = $("price-kor");
        if(hint) hint.textContent = pVal ? "= " + korUnit(pVal) : "";
      }
    }
    if(state.options) {
      const opts = state.options;
      const setChk = (id, val) => {
        const el = $(id);
        if(!el) return;
        const input = el.querySelector("input") || (el.tagName === "INPUT" ? el : null);
        if(input) {
          input.checked = !!val;
          el.classList.toggle("on", !!val);
        }
      };
      setChk("opt-special", opts.special);
      setChk("opt-severe", opts.severe);
      setChk("opt-nego", opts.nego);
      setChk("opt-festival", opts.festival);
      setChk("opt-gam", opts.gam);
      setChk("opt-it", opts.it);
      setChk("opt-itnew", opts.itNew);
      setChk("opt-itmaint", opts.itMaint);
      setChk("opt-itpub", opts.itPub);
      setChk("opt-itaudit", opts.itAudit);
      setChk("opt-mat", opts.mat);
      setChk("opt-mat-3ja", opts.mat3ja);
      setChk("opt-mat-mas", opts.matMas);
      setChk("opt-mat-self", opts.matSelf);
    }
    if(typeof syncOpts === "function") syncOpts();
    if(typeof updateOptionStates === "function") updateOptionStates();

    if (state.evalCriteria && Array.isArray(state.evalCriteria)) {
      CRITERIA_LIST = state.evalCriteria;
    }
    if (state.evalQualMax) {
      const qm = $("ev-qual-max");
      if (qm) qm.value = state.evalQualMax;
    }
    if (state.evalScores && typeof state.evalScores === "object") {
      EVAL_SCORES_STORE = state.evalScores;
    }
    if (typeof renderCriteriaRows === "function") renderCriteriaRows();
    document.querySelectorAll("#ev-rows .ev-row").forEach(div => {
      const cid = div.dataset.cid;
      if (cid && typeof updateRowMemberButtons === "function") updateRowMemberButtons(div, cid);
    });

    const d = decide();
    LAST = d;
    renderResult();

    CKS = ckItems(d);
    CKSET = new Set(state.checkedIds || []);
    CURR_STAGE = state.currStage !== undefined ? state.currStage : 0;
    renderCk();
    autoSaveLocal();
  }

  // Restore from LocalStorage on page load if present
  try {
    const localSaved = localStorage.getItem("seoul_contract_state");
    if(localSaved) {
      const parsed = JSON.parse(localSaved);
      if(parsed && parsed.price) {
        restoreStateObj(parsed);
      }
    }
  } catch(e) {}

  // 초기 상태 검증 및 화면 표시
  if (typeof updateOptionStates === "function") updateOptionStates();

  /* ─────────── NAVER-STYLE LOGIN & USER SESSION MANAGEMENT ─────────── */
  function updateLoginUI() {
    const userSession = JSON.parse(localStorage.getItem("seoul_user_session") || "null");
    const loggedInfoEl = $("user-logged-info");
    const deptDisplay = $("user-dept-display");
    const nameDisplay = $("user-name-display");
    const mainTabsWrap = $("main-tabs-wrap") || document.querySelector(".tabs-wrap");

    if (userSession && userSession.dept && userSession.name) {
      if (loggedInfoEl) loggedInfoEl.style.setProperty("display", "flex", "important");
      if (deptDisplay) deptDisplay.textContent = `🏛️ ${userSession.dept}`;
      if (nameDisplay) nameDisplay.innerHTML = `<b>${userSession.name}님</b>`;
      if (mainTabsWrap) mainTabsWrap.style.setProperty("display", "flex", "important");

      const landingSpeechP = document.querySelector("#step-landing .speech-content p");
      if (landingSpeechP) {
        landingSpeechP.innerHTML = `👋 <b>${userSession.name} 담당자님(${userSession.dept})</b> 환영합니다! 오늘 필요하신 계약 업무를 선택해 보세요.`;
      }
    } else {
      if (loggedInfoEl) loggedInfoEl.style.setProperty("display", "none", "important");
      if (mainTabsWrap) mainTabsWrap.style.setProperty("display", "none", "important");
    }
  }

  window.quickLogin = function(dept, name) {
    const session = { dept, name, loggedAt: new Date().toISOString() };
    localStorage.setItem("seoul_user_session", JSON.stringify(session));
    updateLoginUI();
    showStep("landing");
    if (typeof toast === "function") {
      toast(`👋 ${name}님 (${dept}) 환영합니다!`);
    }
  };

  window.handleCustomLogin = function(e) {
    if (e) e.preventDefault();
    const deptInput = $("login-first-dept");
    const nameInput = $("login-first-name");
    let dept = (deptInput ? deptInput.value : "").trim();
    let name = (nameInput ? nameInput.value : "").trim();

    if (!dept || !name) {
      alert("⚠️ 소속 기관 및 성명을 입력해 주세요.");
      return;
    }
    quickLogin(dept, name);
  };

  window.doLogout = function() {
    if (confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem("seoul_user_session");
      updateLoginUI();
      showStep("login");
      if (typeof toast === "function") {
        toast("로그아웃 되었습니다.");
      }
    }
  };

  updateLoginUI();
  const initUserSession = JSON.parse(localStorage.getItem("seoul_user_session") || "null");
  if (initUserSession && initUserSession.dept && initUserSession.name) {
    showStep("landing");
  } else {
    showStep("login");
  }
});

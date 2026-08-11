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
    document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("on",t.dataset.p===p));
    document.querySelectorAll(".panel").forEach(s=>s.classList.toggle("on",s.id==="p-"+p));
    window.scrollTo({top:0,behavior:"smooth"});
    setTimeout(() => { if (window.attachLegalTooltips) window.attachLegalTooltips(); }, 50);
  };

  document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>showTab(t.dataset.p)));

  /* 옵션 토글 스타일 */
  document.querySelectorAll(".opt input").forEach(c=>{
    c.addEventListener("change",()=>{
      c.closest(".opt").classList.toggle("on",c.checked);
    });
  });

  /* ───── "해당 사항 없음" 토글 제어 ───── */
  const chkNone = $("chk-none");
  const optNone = $("opt-none");
  
  const specialIds = ["opt-special", "opt-severe", "opt-nego", "opt-festival", "opt-gam", "opt-it", "opt-itpub", "opt-itaudit"];

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

  /* 종류 칩 */
  let KIND = "goods";
  const kindEl = $("kind");
  if (kindEl) {
    kindEl.querySelectorAll(".chip").forEach(ch=>{
      ch.addEventListener("click",()=>{
        KIND = ch.dataset.k;
        kindEl.querySelectorAll(".chip").forEach(x=>x.classList.toggle("on",x===ch));
        syncOpts();
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

  function syncOpts(){
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
    syncFestival();
    syncIt();
  }
  window.syncOpts = syncOpts;
  window.syncFestival = syncFestival;

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
  }

  const negoChk = $("opt-nego") ? $("opt-nego").querySelector("input") : null;
  if(negoChk) negoChk.addEventListener("change", syncFestival);

  const itChk = $("opt-it") ? $("opt-it").querySelector("input") : null;
  if(itChk) itChk.addEventListener("change", syncIt);

  syncOpts();

  /* ───── 판단 로직 ───── */
  function decide(){
    const k = KINFO[KIND], p = num($("price"));
    const special = $("opt-special") ? $("opt-special").querySelector("input").checked : false;
    const severe = $("opt-severe") ? ($("opt-severe").querySelector("input").checked && !k.isC) : false;
    const nego = $("opt-nego") ? ($("opt-nego").querySelector("input").checked && !k.isC) : false;
    const festival = nego && $("opt-festival") && $("opt-festival").querySelector("input").checked;
    const it = $("opt-it") ? ($("opt-it").querySelector("input").checked && !k.isC) : false;
    const itNew = it && $("opt-itnew") && $("opt-itnew").querySelector("input").checked;
    const itPub = it && $("opt-itpub") && $("opt-itpub").querySelector("input").checked;
    const itAudit = it && $("opt-itaudit") && $("opt-itaudit").querySelector("input").checked;
    const gam = KIND==="service" && $("opt-gam") && $("opt-gam").querySelector("input").checked;
    const oneLimit = severe ? Infinity : (special ? 5e7 : 2e7);
    const oneOk = p>0 && p<=oneLimit;
    const twoOk = p>0 && p<=k.two;
    const rec = nego ? "nego" : (oneOk ? "one" : (twoOk ? "two" : "bid"));
    const noticeDays = nego ? (p<1e8?10 : p<10*E?20 : 40)
                           : (k.isC ? (p<10*E?7 : p<50*E?15 : 30) : 7);
    const quoteRate = k.isC ? "89.745%" : (p<=2e7 ? "90%" : "88%");

    /* 사전절차 */
    const audit = (()=>{
      if(nego) return festival ? (p>=1e8 ? "축제·행사 협상 계약 1억원 이상" : null)
                               : (p>=5*E ? "협상에 의한 계약 5억원 이상" : null);
      if(KIND==="gc" && p>=20*E) return "종합공사 20억원 이상";
      if((KIND==="sc"||KIND==="oc") && p>=10*E) return "공사(종합 외) 10억원 이상";
      if(KIND==="service" && p>=10*E) return "용역 10억원 이상 (협상계약은 5억↑)";
      if(KIND==="goods" && p>=5*E) return "물품 5억원 이상 (조달청 제3자단가·다수공급자계약 제외)";
      if(rec==="one" && p>2e7) return (special && p<=5e7) ? null : "1인 견적 수의계약 2천만원 초과";
      return null;
    })();

    const cost = (()=>{
      if(k.isC && p>=3*E) return "공사 — 공종에 따라 3억(조경·전기·통신·설비 등) 또는 5억(토목·건축) 이상";
      if(KIND==="service" && p>=2*E) return "용역 2억원 이상";
      if(KIND==="goods" && p>=2e7) return "물품 2천만원 이상";
      return null;
    })();

    const spec = ((rec==="bid"||nego) && p>=5e7)
      ? "입찰 대상 5천만원 이상 — 나라장터 사전규격 공개"+(nego?" (신규사업은 금액 무관)":"") : null;

    const agree = (()=>{
      if(k.isC && p>=10*E) return "공사 10억원 이상";
      if(KIND==="service" && p>=5*E) return "용역 5억원 이상";
      if(KIND==="goods" && p>=2*E) return "물품 구매 2억원 이상 (제조는 5억↑)";
      if(nego) return "협상에 의한 계약 — 계약의뢰 시 재정합의 필수";
      return null;
    })();

    return {k,p,special,severe,nego,festival,it,itNew,itPub,itAudit,gam,oneLimit,oneOk,twoOk,rec,noticeDays,quoteRate,audit,cost,spec,agree};
  }

  /* ───── 타임라인 ───── */
  function buildTimeline(d){
    const pre = [];
    if(d.rec==="nego"){
      pre.push({t:"제안요청서 · 과업지시서 작성", tag:"통상", days:[5,10], soft:true, s:"평가요소·방법 명시 · 부당계약 문구 검토"});
    } else {
      pre.push({t:"발주 준비 — 과업내용서·예산 확정", tag:"통상", days:[3,5], soft:true});
    }
    if(d.cost) pre.push({t:"원가(계약)심사", tag:"통상", days:[5,10], soft:true, s:d.cost});
    if(d.audit) pre.push({t:"일상감사", tag:"통상", days:[3,7], soft:true, s:d.audit});
    if(d.gam && d.p>=3e7) pre.push({t:"기술용역 타당성 심사", tag:"통상", days:[7,14], soft:true, s:"기술심사담당관 — 용역 필요성·대가 적정성 (예산 반영 전 원칙, 당해연도 사업은 발주 전)"});
    if(d.gam && d.p>=2.3*E) pre.push({t:"사업수행능력(PQ) 세부기준 심의", tag:"통상", days:[5,10], soft:true, s:"건설기술심의 — 시 표준기준과 동일하면 서면협의로 대체"});
    if(d.it){
      pre.push({t:"과업심의위원회 (SW 과업 확정)", tag:"통상", days:[5,10], soft:true, s:"모든 SW사업 대상 · SW개발 포함 시 적정 사업기간 산정 (1억 이하·상용SW 구매는 간소화 심의)"});
      if(d.itNew || d.p>=2*E) pre.push({t:"행안부 사전협의", tag:"법정", days:[30,30], s:"발주 40일 전 IRM(irm.go.kr) 신청 · 검토 30일 — 결과를 제안요청서에 반영한 뒤 사전규격 공개"});
      pre.push({t:"정보통신 보안성 검토", tag:"통상", days:[5,10], soft:true, s:"정보보안과 (중요 사업은 국정원) · 검토 결과 제안요청서 반영"});
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

  /* ───── Step 1 ↔ Step 2 페이지 전환 기능 ───── */
  function showStep(stepName) {
    const inputView = $("step-input");
    const resultView = $("step-result");
    
    if (stepName === "result") {
      if (inputView) inputView.style.display = "none";
      if (resultView) {
        resultView.style.display = "block";
        resultView.classList.remove("fade-in");
        void resultView.offsetWidth;
        resultView.classList.add("fade-in");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      if (resultView) resultView.style.display = "none";
      if (inputView) {
        inputView.style.display = "block";
        inputView.classList.remove("fade-in");
        void inputView.offsetWidth;
        inputView.classList.add("fade-in");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
  window.showStep = showStep;

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
    let h = '<div class="card"><h2>이렇게 진행할 수 있어요</h2><p class="desc">'+d.k.name+' · 추정가격 '+korUnit(d.p)+'</p>';

    if(d.rec==="nego"){
      h += '<div class="mcard rec"><span class="badge">추천</span><b>🗣️ 협상에 의한 계약 (제안서 평가)</b>'
        +'<p>전문성·기술성·창의성·안전성 등이 필요한 용역·물품 — 단순노무용역·단순물품구매는 대상이 아니에요 (령 §43·§44)</p>'
        +'<div class="tags">'+(d.it
          ? tagHtml("기술 90 : 가격 10 (SW사업 준수사항)", "v") + tagHtml("협상적격 — 기술점수 85%↑", "b")
          : tagHtml("배점 100 = 정량 20 + 정성 60 + 가격 20", "v") + tagHtml("협상적격 종합 70점↑", "b"))
        + tagHtml("공고 "+d.noticeDays+"일", "o")
        + tagHtml("령 §43·§44", "g")
        + tagHtml("낙찰자 결정기준 제7장", "g") +'</div></div>';
      if(d.oneOk||d.twoOk) h += '<p class="note">금액만 보면 수의계약도 가능한 범위지만, 협상 방식을 선택하셨으니 제안서 평가 절차로 안내해 드려요.</p>';
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

    if(d.gam && d.rec==="nego") h += '<div class="warnbox">🧐 건설기술용역(공사감리·건설사업관리)은 협상이 아니라 <b>사업수행능력평가(PQ) + 적격심사</b>로 낙찰자를 정하는 게 원칙이에요. 정보시스템 감리(SW 감리)는 협상 계약 및 SW 관리지침 기준을 적용해요.</div>';

    h += '<h3>📋 계약의뢰 시 사전 확인 절차 <span style="font-weight:400;font-size:.8rem;color:var(--mut)">— 금액·조건별 필수 절차만 안내해요</span></h3>';
    const pres = [["일상감사",d.audit],["원가(계약)심사",d.cost],["사전규격 공개",d.spec],["재정합의 (계약의뢰 시)",d.agree]];
    if(d.gam){
      pres.push(["기술용역 타당성 심사 (건설기술)", d.p>=1e8 ? "전 분야 대상 — 기술심사담당관 (예산 반영 전, 당해연도는 발주 전)"
        : d.p>=5e7 ? "건축 5천만↑ · 기계·전기·조경 3천만↑ 대상 (토목·도시계획은 1억↑)"
        : d.p>=3e7 ? "기계·전기·조경 등 3천만↑ 대상 (건축 5천만 · 토목 1억 기준)" : null]);
      pres.push(["용역발주심의 (건설기술심의)", d.p>=2*E ? "전 분야 대상 — 발주 타당성·과업 적정성"
        : d.p>=1*E ? "전기·기계·조경 1억↑ 대상 (토목·건축은 2억↑)" : null]);
      pres.push(["사업수행능력(PQ) 세부기준 심의", d.p>=2.3*E ? "설계·건설사업관리 2.3억↑ — 시 표준기준과 동일 시 서면협의 대체" : null]);
    }
    if(d.it){
      pres.push(["과업심의위원회 (SW)", "모든 SW사업 — 과업내용·기간 확정 (1억 이하 간소화)"]);
      pres.push(["행안부 사전협의 (IRM)", (d.itNew||d.p>=2*E)?(d.itNew?"신규 정보화사업 — 발주 40일 전 신청":"계속사업 2억원 이상 — 발주 40일 전 신청"):null]);
      pres.push(["정보통신 보안성 검토", "정보시스템 신·증설 — 정보보안과"]);
      pres.push(["정보시스템 감리 (SW 감리)", (d.itAudit || d.p>=5*E || (d.itPub && d.p>=1*E))
        ? (d.p>=20*E ? "전자정부법 §57 — 20억 이상 SW 구축: 3단계 감리(착수·중간·종료) 의무"
        : (d.p>=5*E || (d.itPub && d.p>=1*E)) ? "전자정부법 §57 — 5억 이상(대국민 1억 이상) 의무 감리 · 20억 미만·6개월 미만 2단계 감리 가능" : "SW 감리 대상 여부 검토") : null]);
      pres.push(["SW사업 영향평가", "자체평가 후 사전규격 공개 시 결과 공개"]);
      pres.push(["예산타당성 심사", d.itNew?"신규 구축·SW개발 — 전년도 예산편성 단계 이행 확인":null]);
    }
    const hit = pres.filter(x=>x[1]);
    if(hit.length){
      h += '<div class="pre">';
      hit.forEach(([n,v])=>{ h += '<div class="p on"><div class="n">⚠️ '+n+'</div><div class="y">'+v+'</div></div>'; });
      h += '</div>';
    } else {
      h += '<div class="verdict"><span class="big">🎈</span><div><b>필수 사전절차 대상이 없어요</b><small>이 금액·조건에서는 일상감사 · 원가심사 · 재정합의 등 대상이 아니에요</small></div></div>';
    }
    if(d.rec!=="bid"){
      h += '<div class="warnbox">🔍 수의계약 시 유의 — 금액 기준을 피하려는 <b>분리발주(쪼개기)는 금지</b>돼요(령 §77). 1인 견적은 동일업체와 실·국 연 4회 / 시 전체 연 9회까지, 변경계약도 수의 기준금액(계약금액 소액 2,200만원 · 여성기업 등 5,500만원) 안에서만 가능해요.</div>';
      if(d.rec==="one" && KIND==="service") h += '<div class="warnbox">♻️ 폐기물처리 · 재해예방기술지도 용역은 1인 수의 금액이라도 <b>전자공개 수의계약으로 의무발주</b> 대상이에요(시범사업 연장).</div>';
    }

    h += '<h3>⏱️ 예상 진행 일정</h3>' + buildTimeline(d);
    h += '<div style="margin-top:16px"><button class="btn" onclick="makeChecklist()">✅ 이 조건으로 체크리스트 만들기</button></div>';
    h += '</div>';
    resEl.innerHTML = h;
    LAST = d;
    if (window.attachLegalTooltips) window.attachLegalTooltips();
  }
  window.renderResult = renderResult;

  // "진단 결과 보기 →" 버튼 이벤트
  const btnGo = $("go");
  if(btnGo) {
    btnGo.addEventListener("click", ()=>{
      const p = num($("price"));
      if(!p) {
        alert("추정가격을 입력해 주세요 🙂");
        const pEl = $("price");
        if(pEl) pEl.focus();
        return;
      }
      renderResult();
      showStep("result");
    });
  }

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
    const P = "📝 발주 준비", N = "📣 공고 · 업체 선정", C = "✍️ 계약 체결", I = "🚚 이행 관리", F = "💳 검사 · 대가";
    add(P,"예산 편성·배정 확인","지출원인행위 전 예산 확보","권장",true);
    add(P,"과업내용서 · 시방서 · 설계서 확정","산출 근거 포함","권장",true);
    add(P,"분리발주(쪼개기) 여부 점검","수의 기준 회피 목적 분할 금지 — 시행령 §77","필수",true);
    add(P,"동일업체 수의계약 횟수 확인","실·국 연 4회 / 시 전체 연 9회 이내","필수",d.rec==="one");
    add(P,"원가(계약)심사 의뢰",d.cost||"","필수",!!d.cost);
    add(P,"재정합의 (계약의뢰 시 필수)",d.agree||"","필수",!!d.agree);
    add(P,"일상감사 의뢰",d.audit||"","필수",!!d.audit);
    add(P,"사전규격 공개 (나라장터)",d.spec||"","필수",!!d.spec);
    add(P,"협상 대상 여부 확인","단순노무용역·단순물품구매 제외 — 지식기반사업 등 (령 §44①)","필수",d.rec==="nego");
    add(P,"제안요청서 · 과업지시서 작성","평가요소·평가방법·제안서 규격 명시, 부당계약 체크리스트 검토","필수",d.rec==="nego");
    add(P,"평가위원 예비명부 구성 (3배수, 21~30인)","공공감사담당관(일상감사팀장) 협조결재 · 위원정보 비공개","필수",d.rec==="nego");
    add(P,"예산타당성 심사 이행 확인","신규 구축·SW개발 포함 사업 — 정보시스템과 (전년도 정기 7~9월 · 소요 30일)","필수",d.it&&d.itNew);
    add(P,"과업심의위원회 심의","모든 SW사업 · 과업내용 확정, SW개발 시 적정 사업기간 산정 — 1억 이하·상용SW 구매는 간소화","필수",d.it);
    add(P,"행안부 사전협의 (irm.go.kr)","발주 40일 전 신청 · 검토 30일 — 미이행 시 사전협의 이행 후 재공고 대상","필수",d.it&&(d.itNew||d.p>=2*E));
    add(P,"정보시스템 감리 (SW 감리) 이행","전자정부법 §57 — 5억 이상(대국민 1억 이상) 감리 의무, 전문 감리기관 계약","필수",d.it&&(d.itAudit||d.p>=5*E||(d.itPub&&d.p>=1*E)));
    add(P,"SW사업 영향평가 (자체)","사전규격 공개 시 결과 공개 · 1억 이상 신규 개발은 발주 30일 전 과기부 검토요청","필수",d.it);
    add(P,"정보통신 보안성 검토","정보보안과 의뢰 — 결과 제안요청서 반영 (준공 1주 전 보안점검표 별도)","필수",d.it);
    add(P,"상용SW 직접구매 대상 검토","3억 이상 + 조달 등록 SW 포함 시 구매계획 첨부 · 경쟁입찰 구매 시 BMT 검토","필수",d.it&&d.p>=3*E);
    add(P,"클라우드 우선 이용 검토","SaaS → 민간 클라우드 → 데이터센터 순 비교 검토서","권장",d.it&&d.itNew);
    add(P,"기술용역 타당성 심사 요청","기술심사담당관 — 토목·도시계획 1억↑ · 건축 5천만↑ · 기계·전기·조경 3천만↑ (예산 반영 전, 당해연도는 발주 전)","필수",d.gam&&d.p>=3e7);
    add(P,"용역발주심의 (건설기술심의)","토목·건축 2억↑ · 전기·기계·조경 1억↑ — 발주 타당성·과업 적정성","필수",d.gam&&d.p>=1*E);
    add(P,"PQ 세부평가기준 건설기술심의","설계·건설사업관리 2.3억↑ (정밀안전진단 1억↑) — 시 표준기준과 동일 시 서면협의 대체","필수",d.gam&&d.p>=2.3*E);
    add(P,"대가 산정 적정성 확인","엔지니어링사업대가 기준·표준품셈 — 설계요율·개략공사비·추가업무 산정","권장",d.gam);
    add(P,"지역제한 발주 검토","3.3억 미만 건설기술·설계·감리용역은 지역제한 경쟁 가능","권장",d.gam&&d.p<3.3e8);
    add(P,"중소기업자간 경쟁제품 해당 여부 확인","해당 시 중기부 기준 적용 (판로지원법) · 1천만원 이상 구매는 직접생산 증명서 확인","권장",!d.k.isC);
    add(P,"수의계약 배제 사유 확인","부정당업자 제재 중인 업체 등 (법 §31·령 §92) · 나라장터 제재정보 조회","필수",d.rec==="one"||d.rec==="two");
    add(P,"특례 대상 증빙 확보","장애인·여성기업 확인서 등 유효기간 확인","필수",d.special&&d.rec==="one");
    add(P,"중증장애인생산품 직접생산 확인","생산시설 지정 및 직접생산 여부","필수",d.severe);
    if(d.rec==="nego"){
      add(N,"입찰공고 게시 — 협상 ("+d.noticeDays+"일)","게시일·개찰일 제외 · 긴급·재공고 10일 · 1억 미만 신규사업은 15일","법정",true);
      add(N,"가격 투찰(나라장터) = 밀봉 가격제안서 금액 일치 확인","제안서·가격제안서는 발주부서에 직접 제출","필수",true);
      add(N,"평가위원 추첨 (참가업체가 제출 시 추첨 · 다빈도순)","동수는 연장자순 · 예비평가위원 2명 이상 추가 선정","필수",true);
      add(N,"제안서 평가 — 정량 20 · 정성 60 · 가격 20","정성 최저점은 항목 배점의 60% 이상 · 최고·최저 위원 제외 평균","필수",true);
      add(N,"평가 결과 서울계약마당 등록 · 협상 순위 통보",d.it?"협상적격 — 기술능력 점수가 배점한도의 85% 이상 (SW 기준)":"협상적격 — 종합평점 70점 이상","필수",true);
      add(N,"기술능력 배점 90% 적용","SW사업 준수사항 — 기술 90 : 가격 10 · SW기술성 평가기준으로 평가항목 구성","필수",d.it);
      add(N,"제안요청 설명회 개최","추정가격 20억 이상 의무 — 입찰공고는 설명일 전일부터 7일 전","법정",d.it&&d.p>=20*E);
      add(N,"시민감사옴부즈만 입회 요청","용역 5억·물품 1억 이상 — 평가위 개최 7일 전 입회요청서 제출","필수",(KIND==="service"&&d.p>=5*E)||(KIND==="goods"&&d.p>=1*E));
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
    add(C,"계약보증금 확인 — 약 "+won(Math.round(d.p*0.1)),d.p<=5e7?"계약금액 5천만원 이하 — 지급확약서로 면제 가능 (령 §53)":"계약금액의 10% 이상 (법 §15·령 §51) — 한시특례는 '26.6.30. 종료","필수",true);
    add(C,"손해배상보증서 제출 확인","전기공사 · 소방시설공사·설계·감리·관리용역 · 건설기술용역 등 개별법상 의무 — 건설사업관리는 공사착공일~완공일 (건진법 §34·령 §50)","권장",KIND==="oc"||KIND==="service");
    add(C,"인지세 납부 확인 — "+(stampDuty(d.p)?won(stampDuty(d.p)):"비과세(1천만원 이하)"),"전자수입인지 · 공동 부담","필수",true);
    add(C,"도시철도공채 매입 확인","건설공사 도급 2천만원 이상 — 계약금액의 2%","필수",d.k.isC&&d.p>=2e7);
    add(C,"청렴계약서 · 행동강령 서약","법 §6의2 청렴계약 · 서울시 청렴계약제","필수",true);
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

  let CKS = null, CKSET = new Set();
  window.makeChecklist = function(){
    if(!LAST) return;
    CKS = ckItems(LAST); CKSET = new Set();
    renderCk(); showTab("check");
  };

  function renderCk(){
    const byPh = {};
    CKS.forEach(it=>{(byPh[it.ph]=byPh[it.ph]||[]).push(it);});
    const missReq = CKS.filter(it=>(it.lv!=="권장")&&!CKSET.has(it.id));
    let h = '<div class="card"><h2>이 계약의 점검 목록</h2>'
      +'<p class="desc">'+LAST.k.name+' · '+korUnit(LAST.p)+' · 총 '+CKS.length+'개 항목 — 체크하면서 빠진 것이 없는지 확인하세요.</p>';
    h += missReq.length
      ? '<div class="miss"><b>🔔 아직 확인 안 된 필수·법정 항목 '+missReq.length+'건</b><div class="list">'+missReq.map(it=>tagHtml(it.label.split(" — ")[0], it.lv==="법정"?"b":"r")).join("")+'</div></div>'
      : '<div class="miss ok"><b>🎉 필수·법정 항목을 모두 확인했어요!</b><div class="s" style="font-size:.85rem;color:var(--sub);margin-top:4px">권장 항목도 한 번 더 훑어보면 좋아요.</div></div>';
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
    h += '<div style="display:flex;gap:8px;margin-top:12px"><button class="btn ghost" onclick="window._clearCk()">전체 해제</button>'
      +'<button class="btn ghost" onclick="showTab(\'guide\');showStep(\'input\');">조건 바꾸기</button></div>';
    h += '<p class="note">체크 상태는 화면을 새로고침하면 초기화돼요.</p></div>';
    
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

  /* ───── 협상 제안서 평가 계산 ───── */
  function evRow(){
    const rowsEl = $("ev-rows");
    if(!rowsEl) return;
    const div = document.createElement("div");
    div.className = "ev-row";
    div.innerHTML = '<input type="text" class="ev-name" placeholder="업체명">'
      +'<input type="text" class="money ev-bid" inputmode="numeric" placeholder="입찰가격(원)">'
      +'<input type="text" class="ev-quant" inputmode="numeric" placeholder="정량">'
      +'<input type="text" class="ev-qual" placeholder="위원 정성점수 — 쉼표 구분 (예: 52,55,48,50,53,51,49)">'
      +'<button type="button" class="rm" title="행 삭제">✕</button>';
    attachMoney(div.querySelector(".ev-bid"));
    div.querySelector(".rm").addEventListener("click", ()=>div.remove());
    rowsEl.appendChild(div);
  }

  const btnEvAdd = $("ev-add");
  if(btnEvAdd) {
    btnEvAdd.addEventListener("click", evRow);
    evRow(); evRow(); evRow();
  }

  const swChk = $("ev-sw") ? $("ev-sw").querySelector("input") : null;
  if(swChk) {
    swChk.addEventListener("change", e=>{
      if($("ev-tech")) $("ev-tech").value = e.target.checked ? "90" : "80";
      if($("ev-price-w")) $("ev-price-w").value = e.target.checked ? "10" : "20";
    });
  }

  function trimmedMean(a){
    if(a.length>=3){ const s=[...a].sort((x,y)=>x-y);
      return {v:s.slice(1,-1).reduce((p,c)=>p+c,0)/(s.length-2), trim:true}; }
    return {v:a.length ? a.reduce((p,c)=>p+c,0)/a.length : 0, trim:false};
  }

  const btnEvRun = $("ev-run");
  if(btnEvRun) {
    btnEvRun.addEventListener("click", ()=>{
      const base = num($("ev-base"));
      const techW = parseFloat($("ev-tech").value)||0, priceW = parseFloat($("ev-price-w").value)||0;
      const sw = $("ev-sw") ? $("ev-sw").querySelector("input").checked : false;
      const out = $("ev-out");
      if(!base){ out.innerHTML='<p class="placeholder">예정가격을 입력해 주세요.</p>'; return; }
      const rows = [...document.querySelectorAll("#ev-rows .ev-row")].map((r,i)=>{
        const bid = parseInt((r.querySelector(".ev-bid").value||"").replace(/[^0-9]/g,""),10)||0;
        const quant = parseFloat(r.querySelector(".ev-quant").value)||0;
        const quals = (r.querySelector(".ev-qual").value||"").split(/[,\s]+/).map(Number).filter(n=>!isNaN(n)&&n>0);
        return {name: r.querySelector(".ev-name").value || ("업체 "+(i+1)), bid, quant, quals};
      }).filter(r=>r.bid>0);

      if(!rows.length){ out.innerHTML='<p class="placeholder">업체 입찰가격을 1건 이상 입력해 주세요.</p>'; return; }
      const floorR = sw?0.8:0.7, p80 = base*0.8, p70 = base*0.7, floorV = base*floorR;
      const rawMin = Math.min(...rows.map(r=>r.bid));
      const minBid = Math.max(rawMin, floorV);
      const notes = new Set();

      if(rawMin < floorV) notes.add("최저입찰가격이 예정가격의 "+(floorR*100)+"% 미만이라 "+(floorR*100)+"% 상당가격("+won(Math.round(floorV))+")으로 보정해 계산했어요.");
      rows.forEach(r=>{
        const q = trimmedMean(r.quals);
        r.qual = q.v;
        if(r.quals.length && !q.trim) notes.add("위원 점수가 3개 미만인 업체는 최고·최저 제외 없이 전체 평균으로 계산했어요.");
        if(r.bid < floorV){ r.pricePt = priceW*0.3; r.tagP = "하한 미만 → 배점의 30%"; }
        else if(r.bid >= p80){ r.pricePt = priceW*minBid/r.bid; r.tagP = ""; }
        else { r.pricePt = priceW*minBid/p80 + 2*((p80-r.bid)/(p80-p70)); r.tagP = "80% 미만 산식";
          notes.add("예정가격의 80% 미만 입찰은 예규 제2산식(가산 최대 2점)으로 계산했어요."); }
        r.tech = r.quant + r.qual;
        r.total = r.tech + r.pricePt;
        r.pass = sw ? (r.tech >= techW*0.85) : (r.total >= 70);
      });
      rows.sort((a,b)=>b.total-a.total).forEach((r,i)=>r.rank=i+1);
      let h = '<div class="res" style="overflow-x:auto"><table>';
      h += '<tr><th>순위</th><th>업체</th><th>입찰가 (예가 대비)</th><th>정량</th><th>정성(제외 평균)</th><th>가격평점</th><th>기술점수</th><th>종합</th><th>적격</th></tr>';
      rows.forEach(r=>{
        h += '<tr'+(r.rank===1&&r.pass?' class="win"':'')+'><td>'+r.rank+'</td><td>'+r.name+'</td>'
          +'<td class="num">'+won(r.bid)+'<br><span style="color:var(--sub)">'+(r.bid/base*100).toFixed(2)+'%</span>'
          +(r.tagP?' '+tagHtml(r.tagP, "o"):'')+'</td>'
          +'<td class="num">'+r.quant.toFixed(2)+'</td><td class="num">'+r.qual.toFixed(2)+'</td>'
          +'<td class="num">'+r.pricePt.toFixed(2)+'</td><td class="num">'+r.tech.toFixed(2)+'</td>'
          +'<td class="num"><b>'+r.total.toFixed(2)+'</b></td>'
          +'<td>'+(r.pass?tagHtml("적격","k"):tagHtml("미달","r"))+'</td></tr>';
      });
      h += '</table></div>';
      h += '<p class="note">적격 기준 — '+(sw
        ? 'SW사업: 기술점수(정량+정성)가 기술배점 '+techW+'점의 85%인 '+(techW*0.85).toFixed(2)+'점 이상'
        : '일반: 종합평점 70점 이상')+' · 적격자 중 1순위부터 기술협상 → 가격협상 순으로 진행해요.</p>';
      if(notes.size) h += '<div class="warnbox">'+[...notes].map(n=>'· '+n).join('<br>')+'</div>';
      out.innerHTML = h;
      if (window.attachLegalTooltips) window.attachLegalTooltips();
    });
  }

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
});

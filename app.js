/* ==========================================================================
   한눈에 보이는 서울계약 - 서울시 계약시스템 JavaScript Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // 1. Navigation & Tab Switching
    const navBtns = document.querySelectorAll('.sidebar-nav .nav-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const currentChapterEl = document.getElementById('currentChapter');
    const currentPageTitleEl = document.getElementById('currentPageTitle');

    const tabTitles = {
        'dashboard': { chapter: '메인 대시보드', title: '서울시 계약 현황 및 지표' },
        'prep-finder': { chapter: '제1장 계약준비', title: '내 사업 맞춤 계약방법 찾기' },
        'prep-checklist': { chapter: '제1장 계약준비', title: '발주단계 체크리스트 & 사전심의' },
        'prep-spec': { chapter: '제1장 계약준비', title: '사전규격 공개 & 발주계획 등록' },
        'bid-methods': { chapter: '제2장 입찰 및 계약', title: '계약목적물·금액별 낙찰자 결정방법 표' },
        'bid-private': { chapter: '제2장 입찰 및 계약', title: '수의계약 관리 및 일감몰아주기 차단' },
        'bid-eval': { chapter: '제2장 입찰 및 계약', title: '적격심사 & 예정가격 계산기' },
        'bid-proposal': { chapter: '제2장 입찰 및 계약', title: '협상에 의한 계약 (제안서 평가위원회)' },
        'exec-advance': { chapter: '제3장 계약이행', title: '선금 신청 & 기성정산 계산기' },
        'exec-payment': { chapter: '제3장 계약이행', title: '검사 및 대가지급 5단계 트래킹' },
        'exec-penalty': { chapter: '제3장 계약이행', title: '지연배상금 & 하자보수/부정당제재' },
        'exec-documents': { chapter: '제3장 계약이행', title: '서류 양식함 & 서울계약마당 자료실' }
    };

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            navBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPane = document.getElementById(`tab-${targetTab}`);
            if (targetPane) targetPane.classList.add('active');

            if (tabTitles[targetTab]) {
                currentChapterEl.textContent = tabTitles[targetTab].chapter;
                currentPageTitleEl.textContent = tabTitles[targetTab].title;
            }

            // Close sidebar on mobile after choosing a tab
            if (window.innerWidth <= 992 && sidebar && sidebarOverlay) {
                sidebar.classList.remove('open');
                sidebarOverlay.classList.remove('active');
            }
        });
    });

    // Mobile Sidebar Drawer Toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (mobileMenuToggle && sidebar && sidebarOverlay) {
        function toggleMobileMenu() {
            sidebar.classList.toggle('open');
            sidebarOverlay.classList.toggle('active');
        }

        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
        sidebarOverlay.addEventListener('click', toggleMobileMenu);
    }

    // 2. Dark / Light Theme Toggle
    const themeToggleBtn = document.getElementById('themeToggle');
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        document.body.classList.toggle('dark-theme');
        const isLight = document.body.classList.contains('light-theme');
        themeToggleBtn.innerHTML = isLight ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
        if (window.lucide) lucide.createIcons();
    });

    // 3. Mock Contract Data & Table Render
    const mockBids = [
        { id: '2026-SEOUL-091', type: '용역', title: '2026년 서울시 AI 기반 자산격차 분석 플랫폼 구축', dept: '금융투자과', price: 480000000, method: '협상에 의한 계약', endDate: '2026-08-20', status: '입찰중', badgeClass: 'warning' },
        { id: '2026-SEOUL-090', type: '공사', title: '여의도 디지털금융지원센터 시설 보수 및 리모델링', dept: '도시기반시설본부', price: 245000000, method: '적격심사 낙찰제', endDate: '2026-08-18', status: '개찰완료', badgeClass: 'success' },
        { id: '2026-SEOUL-089', type: '물품', title: '서울시 청년 가계부채 상담용 태블릿 PC 150대 구매', dept: '복지기획과', price: 65000000, method: '2인 전자공개 수의', endDate: '2026-08-15', status: '계약체결', badgeClass: 'blue' },
        { id: '2026-SEOUL-088', type: '용역', title: '서울시 소상공인 안심통장 이자지원 정책 효용성 연구', dept: '소상공인정책과', price: 18000000, method: '1인 수의계약', endDate: '2026-08-12', status: '대가지급완료', badgeClass: 'success' },
        { id: '2026-SEOUL-087', type: '공사', title: '상암 IT 콤플렉스 데이터센터 전력 케이블 보강공사', dept: '정보시스템담당관', price: 130000000, method: '2인 전자공개 수의', endDate: '2026-08-22', status: '입찰중', badgeClass: 'warning' }
    ];

    function renderBidsTable(filter = 'all') {
        const tbody = document.querySelector('#dashboardBidsTable tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const filtered = filter === 'all' ? mockBids : mockBids.filter(b => b.type === filter);

        filtered.forEach(bid => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${bid.id}</strong></td>
                <td><span class="badge ${bid.type === '공사' ? 'green' : bid.type === '용역' ? 'blue' : 'gold'}">${bid.type}</span></td>
                <td>${bid.title}</td>
                <td>${bid.dept}</td>
                <td>${bid.price.toLocaleString()} 원</td>
                <td><small>${bid.method}</small></td>
                <td>${bid.endDate}</td>
                <td><span class="badge ${bid.badgeClass}">${bid.status}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }

    renderBidsTable();

    // Table Filter Pills
    const filterPills = document.querySelectorAll('.filter-pills .pill');
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            renderBidsTable(pill.getAttribute('data-filter'));
        });
    });

    // 4. Chart.js Initialization
    initCharts();

    function initCharts() {
        const ctx1 = document.getElementById('chartContractCategory');
        if (ctx1) {
            new Chart(ctx1, {
                type: 'doughnut',
                data: {
                    labels: ['공사 계약 (55.1%)', '용역 계약 (32.7%)', '물품 구매 (12.2%)'],
                    datasets: [{
                        data: [19200, 11400, 4220],
                        backgroundColor: ['#0068ff', '#10b981', '#ffb800'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { color: '#9ca3af', font: { family: 'Noto Sans KR' } } }
                    }
                }
            });
        }

        const ctx2 = document.getElementById('chartMonthlyPayment');
        if (ctx2) {
            new Chart(ctx2, {
                type: 'bar',
                data: {
                    labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월'],
                    datasets: [
                        { label: '선금 지급 (억원)', data: [1200, 1500, 2100, 1800, 2400, 3100, 2900, 1600], backgroundColor: '#3b82f6' },
                        { label: '기성/잔금 지급 (억원)', data: [800, 1100, 1600, 1400, 1900, 2700, 3400, 2100], backgroundColor: '#10b981' }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { grid: { display: false }, ticks: { color: '#9ca3af' } },
                        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } }
                    },
                    plugins: {
                        legend: { position: 'bottom', labels: { color: '#9ca3af' } }
                    }
                }
            });
        }
    }

    // 5. Contract Method Wizard Engine (Finding right method)
    let wizardState = { type: '공사', subType: '종합공사', price: 45000000, isFemaleSocial: false, isPatented: false };

    const wizardPages = document.querySelectorAll('.wizard-page');
    const wizardSteps = document.querySelectorAll('.wizard-steps .step');

    // Step 1 Options
    const optCards = document.querySelectorAll('#w-page-1 .option-card');
    optCards.forEach(card => {
        card.addEventListener('click', () => {
            optCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            wizardState.type = card.getAttribute('data-val');

            renderWizardSubTypes(wizardState.type);
            switchWizardPage(2);
        });
    });

    function renderWizardSubTypes(type) {
        const container = document.getElementById('wSubTypes');
        container.innerHTML = '';

        let subTypes = [];
        if (type === '공사') subTypes = ['종합공사', '전문공사', '기타공사(전기/통신/소방 등)'];
        else if (type === '용역') subTypes = ['일반용역 (행사/운영 등)', '기술용역 (설계/감리)', '학술연구용역'];
        else subTypes = ['물품 제조구매', '단순 물품구매', '녹색/장애인 우선조달물품'];

        subTypes.forEach(st => {
            const div = document.createElement('div');
            div.className = 'option-card';
            div.innerHTML = `<h5>${st}</h5><p>${type} 세부 분류 선택</p>`;
            div.addEventListener('click', () => {
                wizardState.subType = st;
                switchWizardPage(3);
            });
            container.appendChild(div);
        });
    }

    function switchWizardPage(pageNum) {
        wizardPages.forEach(p => p.classList.remove('active'));
        wizardSteps.forEach(s => s.classList.remove('active'));

        const pageEl = document.getElementById(`w-page-${pageNum}`);
        const stepEl = document.getElementById(`step-node-${pageNum}`);
        if (pageEl) pageEl.classList.add('active');
        if (stepEl) stepEl.classList.add('active');
    }

    // Input Price Format Hint
    const inputEstimatePrice = document.getElementById('inputEstimatePrice');
    const priceHintText = document.getElementById('priceHintText');
    if (inputEstimatePrice) {
        inputEstimatePrice.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value) || 0;
            wizardState.price = val;
            if (val >= 100000000) {
                priceHintText.textContent = `${(val / 100000000).toFixed(2)} 억원 (VAT 별도)`;
            } else {
                priceHintText.textContent = `${(val / 10000).toLocaleString()} 만원 (VAT 별도)`;
            }
        });
    }

    // Calculate Wizard Result
    const btnCalculateWizard = document.getElementById('btnCalculateWizard');
    if (btnCalculateWizard) {
        btnCalculateWizard.addEventListener('click', () => {
            const chkFemaleSocial = document.getElementById('chkFemaleSocial').checked;
            const chkPatented = document.getElementById('chkPatented').checked;
            const price = parseFloat(inputEstimatePrice.value) || 0;

            let method = '';
            let desc = '';
            let details = [];

            if (chkPatented) {
                method = '1인 견적 수의계약 (특허/신기술 수의)';
                desc = '특허공법, 신기술 또는 1인 생산물품에 해당하여 추정가격에 관계없이 1인 수의계약이 가능합니다.';
                details.push('지방계약법 시행령 제25조 제1항 제4호 적용');
                details.push('특정제품 선정심사위원회 및 사유서 첨부 필수');
            } else if (price <= 20000000 || (chkFemaleSocial && price <= 50000000)) {
                method = '1인 견적 수의계약 (소액 수의)';
                desc = `추정가격 ${price <= 20000000 ? '2천만원' : '5천만원(희망기업)'} 이하 소액 계약에 해당하여 지정업체 1인 견적으로 계약 체결이 가능합니다.`;
                details.push('지방계약법 시행령 제25조 제1항 제5호 적용');
                details.push('동일업체 연간 수의계약 5회/10회 제한 여부 확인 필수');
            } else if (
                (wizardState.type === '공사' && wizardState.subType === '종합공사' && price <= 400000000) ||
                (wizardState.type === '공사' && wizardState.subType === '전문공사' && price <= 200000000) ||
                (wizardState.type === '공사' && price <= 160000000) ||
                (wizardState.type !== '공사' && price <= 100000000)
            ) {
                method = '2인 이상 견적 수의계약 (전자공개 수의)';
                desc = '소액 전자공개 범위에 해당하여 나라장터를 통해 2인 이상견적을 받아 낙찰자를 결정합니다 (적격심사 없음).';
                details.push('지방계약법 시행령 제30조 적용');
                details.push('안내공고기간: 원칙 3일 이상 (공휴일 제외)');
            } else if (wizardState.type === '용역' && wizardState.subType.includes('일반')) {
                method = '협상에 의한 계약 (제안서 평가)';
                desc = '전문성 및 창의성이 요구되는 일반용역 사업으로 제안서를 제출받아 제안서평가위원회 평가 후 협상하여 계약합니다.';
                details.push('기술능력평가 (80~85%) + 가격평가 (15~20%)');
                details.push('합산점수 70점 이상 고득점자순 우선협상');
            } else {
                method = '적격심사 낙찰제 (공개경쟁입찰)';
                desc = '예정가격 이하 최저가 입찰자순으로 적격심사(수행능력+가격)를 실시하여 종합 95점 이상자를 낙찰자로 결정합니다.';
                details.push('입찰공고기간: 7일 ~ 40일 (추정가격별 차등)');
                details.push('적격심사 서류 제출 7일 이내');
            }

            document.getElementById('resContractMethod').textContent = method;
            document.getElementById('resContractDesc').textContent = desc;

            const resDetailsList = document.getElementById('resDetailsList');
            resDetailsList.innerHTML = details.map(d => `<div class="badge blue mt-1 mr-1">✓ ${d}</div>`).join('');

            switchWizardPage(4);
        });
    }

    const btnResetWizard = document.getElementById('btnResetWizard');
    if (btnResetWizard) {
        btnResetWizard.addEventListener('click', () => {
            switchWizardPage(1);
        });
    }

    // 6. Checkable Checklist Progress Tracker
    const chkItems = document.querySelectorAll('#interactiveChecklist input[type="checkbox"]');
    chkItems.forEach(item => {
        item.addEventListener('change', updateChecklistProgress);
    });

    function updateChecklistProgress() {
        const total = chkItems.length;
        const checked = document.querySelectorAll('#interactiveChecklist input[type="checkbox"]:checked').length;
        const percent = Math.round((checked / total) * 100);

        document.getElementById('chkProgressPercent').textContent = `${percent}%`;
        document.getElementById('chkProgressFill').style.width = `${percent}%`;
    }

    // 7. Vendor Sole Source Limit Checker
    const btnCheckVendorLimit = document.getElementById('btnCheckVendorLimit');
    if (btnCheckVendorLimit) {
        btnCheckVendorLimit.addEventListener('click', () => {
            const inputVal = document.getElementById('inputVendorBizNo').value.trim();
            if (!inputVal) {
                alert('사업자등록번호 또는 업체명을 입력해주세요.');
                return;
            }

            const resArea = document.getElementById('vendorStatusResult');
            resArea.classList.remove('hidden');

            const isBlocked = inputVal.includes('제한') || inputVal.includes('초과');
            if (isBlocked) {
                document.getElementById('vResultName').textContent = inputVal;
                document.getElementById('vResultBadge').textContent = '체결불가 (한도초과)';
                document.getElementById('vResultBadge').className = 'badge danger';
                document.getElementById('vDeptCount').textContent = '5 회';
                document.getElementById('vTotalCount').textContent = '11 회';
                document.getElementById('vMessageText').textContent = '⚠️ 해당 업체는 연간 수의계약 한도(본청 5회 / 서울시 10회)를 초과하여 수의계약 체결이 불가합니다.';
            } else {
                document.getElementById('vResultName').textContent = inputVal;
                document.getElementById('vResultBadge').textContent = '계약가능';
                document.getElementById('vResultBadge').className = 'badge success';
                document.getElementById('vDeptCount').textContent = '2 회';
                document.getElementById('vTotalCount').textContent = '4 회';
                document.getElementById('vMessageText').textContent = '✓ 현재 수의계약 체결 한도 내에 있으므로 정상적으로 수의계약 체결이 가능합니다.';
            }
        });
    }

    // 8. Multiple Estimate & Reserve Price Calculator (15 prices -> Pick 4)
    const btnGenEstimates = document.getElementById('btnGenEstimates');
    if (btnGenEstimates) {
        btnGenEstimates.addEventListener('click', () => {
            const baseAmount = parseFloat(document.getElementById('inputBaseAmount').value) || 100000000;
            const priceGrid15 = document.getElementById('priceGrid15');
            priceGrid15.innerHTML = '';

            let prices = [];
            for (let i = 0; i < 15; i++) {
                // ±3% variation
                const factor = 0.97 + Math.random() * 0.06;
                const p = Math.round(baseAmount * factor);
                prices.push(p);
            }

            // Shuffle and pick 4
            const indices = Array.from({ length: 15 }, (_, i) => i).sort(() => Math.random() - 0.5);
            const pickedIndices = indices.slice(0, 4);

            let pickedSum = 0;
            pickedIndices.forEach(idx => pickedSum += prices[idx]);
            const avgEstPrice = Math.round(pickedSum / 4);

            prices.forEach((p, idx) => {
                const isPicked = pickedIndices.includes(idx);
                const div = document.createElement('div');
                div.className = `price-badge ${isPicked ? 'picked' : ''}`;
                div.innerHTML = `<strong>#${idx + 1}</strong><br>${p.toLocaleString()}원`;
                priceGrid15.appendChild(div);
            });

            document.getElementById('finalEstPrice').textContent = `${avgEstPrice.toLocaleString()} 원`;
            document.getElementById('estResultsArea').classList.remove('hidden');
        });
    }

    // 적격심사 점수 계산기
    const btnCalcEvalScore = document.getElementById('btnCalcEvalScore');
    if (btnCalcEvalScore) {
        btnCalcEvalScore.addEventListener('click', () => {
            const scorePerf = parseFloat(document.getElementById('scorePerf').value) || 0;
            const scoreBidPriceVal = parseFloat(document.getElementById('scoreBidPrice').value) || 0;
            const scoreCredit = parseFloat(document.getElementById('scoreCredit').value) || 0;
            const scorePenalty = parseFloat(document.getElementById('scorePenalty').value) || 0;

            // Simple Price Evaluation Formula simulation (70 points max)
            const priceScore = Math.max(60, 70 - Math.abs(87750000 - scoreBidPriceVal) / 1000000);
            const totalScore = (scorePerf + priceScore + scoreCredit - scorePenalty).toFixed(2);

            document.getElementById('totalEvalScore').textContent = `${totalScore} 점`;
            const area = document.getElementById('evalResultArea');
            area.classList.remove('hidden');

            const badge = document.getElementById('evalPassBadge');
            if (totalScore >= 95.0) {
                badge.textContent = '✓ 적격심사 통과 (낙찰예정자 선정)';
                badge.className = 'badge-status pass mt-2 text-green';
            } else {
                badge.textContent = '❌ 점수 미달 (통과 기준 95.0점 미만)';
                badge.className = 'badge-status fail mt-2 text-red';
            }
        });
    }

    // 9. Committee Simulation (Proposal Evaluation)
    const btnRunCommitteeSim = document.getElementById('btnRunCommitteeSim');
    if (btnRunCommitteeSim) {
        btnRunCommitteeSim.addEventListener('click', () => {
            const grid = document.getElementById('committeeGrid');
            grid.innerHTML = '';

            const candidates = Array.from({ length: 21 }, (_, i) => ({
                id: i + 1,
                name: `평가위원 ${i + 1}호`,
                dept: i % 3 === 0 ? '교수' : i % 2 === 0 ? '연구원' : '기술사',
                pickedCount: Math.floor(Math.random() * 8)
            }));

            // Sort by count desc
            candidates.sort((a, b) => b.pickedCount - a.pickedCount);

            candidates.forEach((c, idx) => {
                const isSelected = idx < 7; // Top 7 chosen
                const div = document.createElement('div');
                div.className = `c-card ${isSelected ? 'selected' : ''}`;
                div.innerHTML = `
                    <strong>${c.name}</strong><br>
                    <small>${c.dept}</small><br>
                    <span class="badge ${isSelected ? 'success' : 'blue'} mt-1">${c.pickedCount}회 추첨</span>
                `;
                grid.appendChild(div);
            });
        });
    }

    // 10. Advance Payment Calculator
    const btnCalcAdvance = document.getElementById('btnCalcAdvance');
    if (btnCalcAdvance) {
        btnCalcAdvance.addEventListener('click', () => {
            const totalAmt = parseFloat(document.getElementById('advContractAmt').value) || 0;
            const givenAmt = parseFloat(document.getElementById('advGivenAmt').value) || 0;
            const progressAmt = parseFloat(document.getElementById('advProgressAmt').value) || 0;

            if (totalAmt <= 0) return;

            const deductAmt = Math.round(givenAmt * (progressAmt / totalAmt));
            const netPay = Math.round(progressAmt - deductAmt);

            document.getElementById('resAdvDeduct').textContent = `${deductAmt.toLocaleString()} 원`;
            document.getElementById('resAdvNetPay').textContent = `${netPay.toLocaleString()} 원`;
            document.getElementById('advCalcResult').classList.remove('hidden');
        });
    }

    // 11. Penalty Calculator
    const btnCalcPenalty = document.getElementById('btnCalcPenalty');
    if (btnCalcPenalty) {
        btnCalcPenalty.addEventListener('click', () => {
            const rate = parseFloat(document.getElementById('penType').value) || 0.0013;
            const amt = parseFloat(document.getElementById('penContractAmt').value) || 0;
            const days = parseInt(document.getElementById('penDays').value) || 0;

            const penAmt = Math.round(amt * days * rate);
            document.getElementById('resPenaltyAmt').textContent = `${penAmt.toLocaleString()} 원`;
            document.getElementById('penResultArea').classList.remove('hidden');
        });
    }

    // 12. Modal & Draft Registration
    const draftModal = document.getElementById('draftModal');
    const btnNewDraft = document.getElementById('btnNewDraft');
    const btnCloseModal = document.getElementById('btnCloseModal');

    if (btnNewDraft && draftModal) {
        btnNewDraft.addEventListener('click', () => draftModal.classList.remove('hidden'));
    }
    if (btnCloseModal && draftModal) {
        btnCloseModal.addEventListener('click', () => draftModal.classList.add('hidden'));
    }

    const formNewDraft = document.getElementById('formNewDraft');
    if (formNewDraft) {
        formNewDraft.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('신규 계약의뢰 기안문이 전자결재시스템(e-호조)으로 전송되었습니다.');
            draftModal.classList.add('hidden');
        });
    }

    // Data Export
    const btnExportData = document.getElementById('btnExportData');
    if (btnExportData) {
        btnExportData.addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mockBids, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", "seoul_contracts_data_2026.json");
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        });
    }

    /* ==========================================================================
       Seoul Contract Helper Engine Extensions
       ========================================================================== */

    const E_AMT = 1e8; // 1억원
    const formatWon = n => (n == null || isNaN(n)) ? "–" : Math.round(n).toLocaleString("ko-KR") + "원";
    
    function getKorUnitStr(n) {
        if (!n) return "";
        const eok = Math.floor(n / E_AMT);
        const man = Math.floor((n % E_AMT) / 1e4);
        const rest = n % 1e4;
        let s = "";
        if (eok) s += eok.toLocaleString() + "억 ";
        if (man) s += man.toLocaleString() + "만 ";
        if (rest) s += rest.toLocaleString();
        return (s.trim() || "0") + "원";
    }

    const parseNum = val => parseInt((String(val) || "").replace(/[^0-9]/g, ""), 10) || 0;

    // Money Input formatting with Korean hints
    document.querySelectorAll('.money').forEach(inp => {
        inp.addEventListener('input', () => {
            const raw = parseNum(inp.value);
            inp.value = raw ? raw.toLocaleString('ko-KR') : '';
            const hint = document.getElementById(inp.id + 'Kor');
            if (hint) hint.textContent = raw ? '= ' + getKorUnitStr(raw) : '';
        });
    });

    // Helper Contract Kind Chips
    let selectedHelperKind = 'goods';
    const helperKindChips = document.querySelectorAll('#helperKindChips .chip');
    helperKindChips.forEach(chip => {
        chip.addEventListener('click', () => {
            selectedHelperKind = chip.getAttribute('data-k');
            helperKindChips.forEach(c => c.classList.remove('on'));
            chip.classList.add('on');
        });
    });

    const KINFO_DICT = {
        goods: { name: '물품', two: 1e8, isC: false },
        service: { name: '용역', two: 1e8, isC: false },
        gc: { name: '종합공사', two: 4e8, isC: true },
        sc: { name: '전문공사', two: 2e8, isC: true },
        oc: { name: '그 밖의 공사', two: 1.6e8, isC: true }
    };

    let LAST_HELPER_DATA = null;

    function decideHelperContract() {
        const k = KINFO_DICT[selectedHelperKind];
        const p = parseNum(document.getElementById('helperPrice').value);
        const chkSpecialEl = document.getElementById('chkOptSpecial');
        const chkSevereEl = document.getElementById('chkOptSevere');
        
        const special = chkSpecialEl ? chkSpecialEl.checked : false;
        const severe = (chkSevereEl ? chkSevereEl.checked : false) && !k.isC;

        const oneLimit = severe ? Infinity : (special ? 5e7 : 2e7);
        const oneOk = p > 0 && p <= oneLimit;
        const twoOk = p > 0 && p <= k.two;
        const rec = oneOk ? 'one' : (twoOk ? 'two' : 'bid');

        const noticeDays = p < 10 * E_AMT ? 7 : (p < 50 * E_AMT ? 15 : 30);
        const quoteRate = k.isC ? '89.745%' : (p <= 2e7 ? '90%' : '88%');

        // Audit pre-procedures
        const audit = (() => {
            if (selectedHelperKind === 'gc' && p >= 20 * E_AMT) return '종합공사 20억원 이상';
            if ((selectedHelperKind === 'sc' || selectedHelperKind === 'oc') && p >= 10 * E_AMT) return '공사(종합 외) 10억원 이상';
            if (selectedHelperKind === 'service' && p >= 10 * E_AMT) return '용역 10억원 이상 (협상계약 5억↑)';
            if (selectedHelperKind === 'goods' && p >= 5 * E_AMT) return '물품 5억원 이상';
            if (rec === 'one' && p > 2e7) return '1인 견적 수의계약 2천만원 초과';
            return null;
        })();

        const cost = (() => {
            if (k.isC && p >= 3 * E_AMT) return '공사 — 공종에 따라 3억(조경·전기·통신·설비 등) 또는 5억(토목·건축) 이상';
            if (selectedHelperKind === 'service' && p >= 2 * E_AMT) return '용역 2억원 이상';
            if (selectedHelperKind === 'goods' && p >= 2e7) return '물품 2천만원 이상';
            return null;
        })();

        const spec = (rec === 'bid' && p >= 5e7) ? '입찰 대상 5천만원 이상 — 나라장터 사전규격 공개 5일' : null;
        const agree = (() => {
            if (k.isC && p >= 10 * E_AMT) return '공사 10억원 이상';
            if (selectedHelperKind === 'service' && p >= 5 * E_AMT) return '용역 5억원 이상';
            if (selectedHelperKind === 'goods' && p >= 2 * E_AMT) return '물품 구매 2억원 이상 (제조는 5억↑)';
            return null;
        })();

        return { k, p, special, severe, oneLimit, oneOk, twoOk, rec, noticeDays, quoteRate, audit, cost, spec, agree };
    }

    function buildTimelineHtml(d) {
        const pre = [];
        pre.push({ t: '발주 준비 — 과업내용서·예산 확정', tag: '통상', days: [3, 5], soft: true });
        if (d.cost) pre.push({ t: '원가(계약)심사', tag: '통상', days: [5, 10], soft: true, s: d.cost });
        if (d.agree) pre.push({ t: '재정합의 (재무과장)', tag: '통상', days: [2, 3], soft: true, s: d.agree });
        if (d.audit) pre.push({ t: '일상감사', tag: '통상', days: [3, 7], soft: true, s: d.audit });
        if (d.spec) pre.push({ t: '사전규격 공개', tag: '통상', days: [5, 5], soft: true, s: '통상 5일 내외 (나라장터)' });

        if (d.rec === 'bid') {
            pre.push({ t: '입찰공고', tag: '법정', days: [d.noticeDays, d.noticeDays], s: '추정가격 기준 ' + d.noticeDays + '일 이상 (재공고·긴급 5일)' });
            pre.push({ t: '개찰 · 적격심사', tag: '통상', days: [7, 14], soft: true, s: '낙찰하한율 기준 점수 심사' });
        } else if (d.rec === 'two') {
            pre.push({ t: '전자공개 견적 안내공고', tag: '법정', days: [3, 5], s: '3일 이상 (신규 사업자 대상 5일) · 견적률 ' + d.quoteRate + ' 이상' });
        } else {
            pre.push({ t: '견적서 징구 · 가격 검토', tag: '통상', days: [1, 3], soft: true });
        }
        pre.push({ t: '계약 체결', tag: '법정', days: [1, 10], s: '낙찰(결정) 통지 후 10일 이내 · 보증금·인지세 확인' });

        const post = [
            { t: '검사 · 검수', tag: '법정', days: [1, 14], s: '이행 완료 통지 후 14일 이내' },
            { t: '대가 지급', tag: '법정', days: [1, 5], s: '검사 후 청구일부터 5일 이내' }
        ];

        let lo = 0, hi = 0;
        pre.forEach(x => { lo += x.days[0]; hi += x.days[1]; });

        let html = '<div class="tl">';
        pre.forEach(x => {
            const dd = x.days[0] === x.days[1] ? x.days[0] + "일" : x.days[0] + "~" + x.days[1] + "일";
            html += `<div class="tl-i ${x.soft ? 'soft' : ''}">
                <div class="h">
                    <b>${x.t}</b>
                    <span class="tag ${x.tag === '법정' ? 'b' : 'g'}">${x.tag} · ${dd}</span>
                </div>
                ${x.s ? `<div class="d">${x.s}</div>` : ''}
            </div>`;
        });
        html += '<div class="tl-gap">— 계약이행 기간 (과업 내용 및 시방서 기준) —</div>';
        post.forEach(x => {
            const dd = x.days[0] === x.days[1] ? x.days[0] + "일" : x.days[0] + "~" + x.days[1] + "일";
            html += `<div class="tl-i ${x.soft ? 'soft' : ''}">
                <div class="h">
                    <b>${x.t}</b>
                    <span class="tag ${x.tag === '법정' ? 'b' : 'g'}">${x.tag} · ${dd}</span>
                </div>
                ${x.s ? `<div class="d">${x.s}</div>` : ''}
            </div>`;
        });
        html += '</div>';
        html += `<div class="tl-sum">⏳ 발주 준비부터 계약 체결까지 <b>약 ${lo} ~ ${hi}일</b> · 이행 완료 후 대금 수령까지 최대 <b>19일</b></div>`;
        return html;
    }

    const btnRunHelperGuide = document.getElementById('btnRunHelperGuide');
    if (btnRunHelperGuide) {
        btnRunHelperGuide.addEventListener('click', () => {
            const d = decideHelperContract();
            const resArea = document.getElementById('helperGuideResult');
            if (!d.p) {
                resArea.innerHTML = '<div class="card"><p class="placeholder text-red">추정가격을 입력해 주세요 🙂</p></div>';
                return;
            }

            let h = `<div class="card">
                <h2>진단 결과 & 발주 가이드</h2>
                <p class="desc">${d.k.name} · 추정가격 ${getKorUnitStr(d.p)}</p>`;

            if (d.oneOk) {
                h += `<div class="mcard rec">
                    <span class="badge">추천</span>
                    <b>🤝 1인 견적 수의계약</b>
                    <p>${d.severe ? '중증장애인생산품 직접 생산 — 금액 제한 없이 수의 체결 가능' : (d.special ? '특례 대상 기업 — 5천만원 이하 가능' : '추정가격 2천만원 이하 소액 수의계약')}</p>
                    <div class="tags">
                        <span class="tag k">견적서 1인 제출</span>
                        <span class="tag o">동일업체 연 4회/9회 제한</span>
                        ${d.p > 2e7 ? '<span class="tag r">일상감사 대상</span>' : ''}
                    </div>
                </div>`;
            }

            if (d.twoOk) {
                h += `<div class="mcard ${d.rec === 'two' ? 'rec' : ''}">
                    ${d.rec === 'two' ? '<span class="badge">추천</span>' : ''}
                    <b>💻 전자공개 수의계약 (2인 이상 견적)</b>
                    <p>${d.k.name} ${getKorUnitStr(d.k.two)} 이하 — 나라장터 안내공고 3일(신규 5일), 견적률 ${d.quoteRate} 이상 최저가</p>
                </div>`;
            }

            h += `<div class="mcard ${d.rec === 'bid' ? 'rec' : ''}">
                ${d.rec === 'bid' ? '<span class="badge">추천</span>' : ''}
                <b>📢 일반(경쟁)입찰</b>
                <p>공고 ${d.noticeDays}일 이상 · 적격심사 낙찰제</p>
            </div>`;

            h += `<h3>📋 발주 전 확인할 사전절차</h3><div class="pre">`;
            const pres = [["일상감사", d.audit], ["원가(계약)심사", d.cost], ["사전규격 공개", d.spec], ["재정합의", d.agree]];
            pres.forEach(([n, v]) => {
                h += `<div class="p ${v ? 'on' : ''}">
                    <div class="n">${v ? '⚠️ ' : '✓ '}${n}</div>
                    <div class="y">${v ? v : '대상 아님'}</div>
                </div>`;
            });
            h += `</div>`;

            h += `<h3 class="mt-4">⏱️ 예상 진행 일정 타임라인</h3>` + buildTimelineHtml(d);
            h += `<div class="mt-3"><button class="btn btn-success" id="btnMakeChecklistFromGuide"><i data-lucide="list-checks"></i> 이 조건으로 5단계 체크리스트 생성</button></div></div>`;

            resArea.innerHTML = h;
            if (window.lucide) lucide.createIcons();

            LAST_HELPER_DATA = d;

            const btnMakeChecklistFromGuide = document.getElementById('btnMakeChecklistFromGuide');
            if (btnMakeChecklistFromGuide) {
                btnMakeChecklistFromGuide.addEventListener('click', () => {
                    renderDynamicChecklist();
                    // Switch to tab-prep-checklist
                    const navBtnChecklist = document.querySelector('.sidebar-nav .nav-btn[data-tab="prep-checklist"]');
                    if (navBtnChecklist) navBtnChecklist.click();
                });
            }
        });
    }

    // Dynamic 5-Phase Checklist Engine
    let activeCheckedItems = new Set();

    function getDynamicChecklistItems(d) {
        if (!d) d = { k: { name: '일반계약', two: 1e8, isC: false }, p: 45000000, rec: 'two', noticeDays: 7, quoteRate: '88%' };
        const items = [];
        const add = (ph, label, sub, lv) => items.push({ ph, label, sub, lv, id: 'ck_' + items.length });
        const P = "📝 발주 준비", N = "📣 공고 · 업체 선정", C = "✍️ 계약 체결", I = "🚚 이행 관리", F = "💳 검사 · 대가";

        add(P, "예산 편성·배정 확인", "지출원인행위 전 예산 확정", "권장");
        add(P, "과업내용서 · 시방서 · 설계서 확정", "산출 근거 및 설계도서 포함", "권장");
        add(P, "분리발주(쪼개기) 여부 점검", "수의 기준 회피 목적 분할 금지 — 시행령 §77", "필수");
        if (d.rec === 'one') add(P, "동일업체 수의계약 횟수 확인", "실·국 연 4회 / 서울시 전체 연 9회 이내", "필수");
        if (d.cost) add(P, "원가(계약)심사 의뢰", d.cost, "필수");
        if (d.agree) add(P, "재정합의 (재무과장)", d.agree, "필수");
        if (d.audit) add(P, "일상감사 의뢰", d.audit, "필수");
        if (d.spec) add(P, "사전규격 공개 (나라장터)", d.spec, "필수");

        if (d.rec === 'bid') {
            add(N, `입찰공고 게시 (${d.noticeDays}일 이상)`, "나라장터 — 재공고·긴급은 5일", "법정");
            add(N, "입찰참가자격 · 실적 기준 확인", "면허·등록, 지역제한 여부 등", "권장");
            add(N, "개찰 · 적격심사", "낙찰하한율 기준 점수 심사", "권장");
        } else if (d.rec === 'two') {
            add(N, "전자공개 견적 안내공고 (3일, 신규 5일)", "나라장터 전자견적", "법정");
            add(N, `견적률 확인 — ${d.quoteRate} 이상`, "예정가격 대비 · 최저가격 순 결정", "권장");
        } else {
            add(N, "수의계약 사유 명시", "사유서 작성 — 시행령 §25 근거 명확히", "필수");
            add(N, "견적서 징구 · 가격 적정성 검토", "시장가격·과거 계약단가 비교", "권장");
        }

        add(C, `계약보증금 확인 — 약 ${formatWon(Math.round(d.p * 0.1))}`, d.p <= 5e7 ? "계약금액 5천만원 이하 — 지급확약서로 면제 가능" : "계약금액의 10% 이상", "필수");
        add(C, "인지세 납부 확인", "전자수입인지 · 공동 부담", "필수");
        if (d.k.isC && d.p >= 2e7) add(C, "도시철도공채 매입 확인", "건설공사 도급 2천만원 이상 — 계약금액의 2%", "필수");
        add(C, "청렴계약서 · 행동강령 서약", "서울시 청렴계약제 적용", "필수");
        add(C, "계약서 작성 · 전자서명", "낙찰 통지 후 10일 이내", "법정");

        add(I, "감독 · 검사공무원 지정", "공사·용역 이행 관리", "권장");
        add(I, "선금 지급 (청구 시 14일 이내)", "한도 70% (재무건전성 우수 100%)", "법정");
        add(I, "지연 발생 시 지연배상금 산정", "10% 이상이면 해제·해지 검토", "권장");

        add(F, "검사 — 완료 통지 후 14일 이내", "필요 시 전문기관 검사", "법정");
        if (d.k.isC) add(F, "하자보수보증금 납부 확인", "공종별 2~5% — 3천만원 이하 공사 면제 가능", "필수");
        add(F, "대가 지급 — 청구 후 5일 이내", "지연 시 지연이자 발생", "법정");

        return items;
    }

    function renderDynamicChecklist() {
        const area = document.getElementById('dynamicChecklistArea');
        if (!area) return;

        const items = getDynamicChecklistItems(LAST_HELPER_DATA);
        const byPh = {};
        items.forEach(it => { (byPh[it.ph] = byPh[it.ph] || []).push(it); });

        const missReq = items.filter(it => it.lv !== '권장' && !activeCheckedItems.has(it.id));

        let h = `<div class="card-header flex-between mb-3">
            <div>
                <h4>이 계약의 5단계 점검 목록</h4>
                <p class="text-muted text-sm">총 ${items.length}개 항목 — 법정 및 필수 사전절차를 확인하세요.</p>
            </div>
        </div>`;

        h += missReq.length
            ? `<div class="miss"><b>🔔 아직 확인되지 않은 필수·법정 항목 (${missReq.length}건)</b><div class="list">${missReq.map(it => `<span class="tag ${it.lv === '법정' ? 'b' : 'r'}">${it.label}</span>`).join('')}</div></div>`
            : `<div class="miss ok"><b>🎉 필수 및 법정 체크항목이 모두 확인되었습니다!</b></div>`;

        for (const ph in byPh) {
            const list = byPh[ph];
            const done = list.filter(it => activeCheckedItems.has(it.id)).length;
            const pct = Math.round((done / list.length) * 100);
            h += `<div class="phase">
                <div class="phase-h">
                    <b>${ph}</b>
                    <span class="pbar"><i style="width:${pct}%"></i></span>
                    <span class="pcnt">${done}/${list.length}</span>
                </div>`;
            list.forEach(it => {
                const on = activeCheckedItems.has(it.id);
                h += `<label class="ck ${on ? 'on' : ''}">
                    <input type="checkbox" data-id="${it.id}" ${on ? 'checked' : ''}>
                    <span>
                        <span class="l">${it.label}</span>
                        <span class="tag ${it.lv === '법정' ? 'b' : it.lv === '필수' ? 'r' : 'g'}">${it.lv}</span>
                        ${it.sub ? `<div class="s">${it.sub}</div>` : ''}
                    </span>
                </label>`;
            });
            h += `</div>`;
        }

        area.innerHTML = h;

        area.querySelectorAll('input[type="checkbox"]').forEach(c => {
            c.addEventListener('change', () => {
                if (c.checked) activeCheckedItems.add(c.getAttribute('data-id'));
                else activeCheckedItems.delete(c.getAttribute('data-id'));
                renderDynamicChecklist();
            });
        });
    }

    const btnResetDynamicChecklist = document.getElementById('btnResetDynamicChecklist');
    if (btnResetDynamicChecklist) {
        btnResetDynamicChecklist.addEventListener('click', () => {
            activeCheckedItems.clear();
            renderDynamicChecklist();
        });
    }

    // Bidding Floor & Rate Calculator
    const RATE_TABLE_DICT = {
        gongsa: { label: "공사 (행안부 적격심사)", brackets: [[100 * E_AMT, 300 * E_AMT, 81.995], [50 * E_AMT, 100 * E_AMT, 87.495], [30 * E_AMT, 50 * E_AMT, 88.745], [10 * E_AMT, 30 * E_AMT, 88.745], [3 * E_AMT, 10 * E_AMT, 89.745], [2 * E_AMT, 3 * E_AMT, 87.745], [0, 2 * E_AMT, 87.745]] },
        ilban: { label: "일반용역 적격심사", brackets: [[30 * E_AMT, Infinity, 72.995], [10 * E_AMT, 30 * E_AMT, 77.995], [5 * E_AMT, 10 * E_AMT, 85.495], [2 * E_AMT, 5 * E_AMT, 86.745], [0, 2 * E_AMT, 87.745]] },
        danso: { label: "일반용역 — 단순노무", flat: 87.745 },
        gisulPQ: { label: "기술용역 (PQ)", brackets: [[10 * E_AMT, Infinity, 79.995], [5 * E_AMT, 10 * E_AMT, 85.495], [0, 5 * E_AMT, 86.745]] },
        gisulNPQ: { label: "기술용역 (비PQ)", brackets: [[10 * E_AMT, Infinity, 79.995], [5 * E_AMT, 10 * E_AMT, 85.495], [2 * E_AMT, 5 * E_AMT, 86.745], [0, 2 * E_AMT, 87.745]] },
        haksul: { label: "학술용역", flat: 80.495 },
        mulpumH: { label: "물품 (행안부 적격심사)", goshi: [80.495, 84.245] },
        mulpumJ: { label: "물품 — 중소기업자간 경쟁제품", flat: 87.995 },
        gunpye: { label: "건설폐기물처리용역 (환경부)", brackets: [[100 * E_AMT, Infinity, 72.995], [30 * E_AMT, 100 * E_AMT, 77.995], [15 * E_AMT, 30 * E_AMT, 82.995], [5 * E_AMT, 15 * E_AMT, 85.495], [2 * E_AMT, 5 * E_AMT, 86.745], [0, 2 * E_AMT, 87.745]] },
        ilpye: { label: "일반폐기물처리용역 (서울시)", brackets: [[30 * E_AMT, Infinity, 72.995], [10 * E_AMT, 30 * E_AMT, 77.995], [5 * E_AMT, 10 * E_AMT, 85.495], [2 * E_AMT, 5 * E_AMT, 86.745], [1 * E_AMT, 2 * E_AMT, 87.745], [0, 1 * E_AMT, 87.745]] },
        boheom: { label: "보험용역", flat: 47.995 },
        ganhaeng: { label: "간행물", flat: 89.995 },
        "su-gongsa": { label: "2인 견적 수의 — 공사", flat: 89.745 },
        "su-yong": { label: "2인 견적 수의 — 용역·물품", suyong: true },
        "su-ganhaeng": { label: "2인 견적 수의 — 간행물", flat: 90 }
    };

    const btnRunRateCalc = document.getElementById('btnRunRateCalc');
    if (btnRunRateCalc) {
        btnRunRateCalc.addEventListener('click', () => {
            const catKey = document.getElementById('rCat').value;
            const cat = RATE_TABLE_DICT[catKey];
            const p = parseNum(document.getElementById('rPrice').value);
            const base = parseNum(document.getElementById('rBase').value);
            const out = document.getElementById('rOut');

            let rate = null;
            let cond = "";

            if (cat.flat != null) {
                rate = cat.flat;
                cond = "금액 구간과 무관";
            } else if (cat.suyong) {
                if (!p) { out.innerHTML = '<p class="placeholder text-red">추정가격을 입력해 주세요.</p>'; return; }
                rate = p <= 2e7 ? 90 : 88;
                cond = p <= 2e7 ? "추정가격 2천만원 이하" : "추정가격 2천만원 초과";
            } else if (cat.goshi) {
                if (p >= 10 * E_AMT) { rate = cat.goshi[0]; cond = "10억원 이상 (고시금액 이상)"; }
                else { rate = cat.goshi[1]; cond = "고시금액 미만"; }
            } else {
                if (!p) { out.innerHTML = '<p class="placeholder text-red">추정가격을 입력해 주세요.</p>'; return; }
                for (const [lo, hi, r] of cat.brackets) {
                    if (p >= lo && p < hi) { rate = r; cond = `${getKorUnitStr(lo)} ~ ${hi === Infinity ? '이상' : getKorUnitStr(hi) + ' 미만'}`; break; }
                }
            }

            let h = "";
            if (rate !== null) {
                h += `<div class="verdict blue">
                    <span class="big">${rate}%</span>
                    <div>
                        <b>${cat.label}</b>
                        <small>${cond} ${p ? ' · 추정가격 ' + getKorUnitStr(p) : ''}</small>
                    </div>
                </div>`;
                if (base) {
                    const floor = Math.ceil(base * rate / 100);
                    h += `<div class="res">
                        예정가격 ${formatWon(base)} × 낙찰하한율 ${rate}% = <strong>투찰 하한액 <b class="money">${formatWon(floor)}</b></strong><br>
                        <span class="text-sm text-muted">이 금액 이상 ~ 예정가격 이하 범위에서 하한율 직상 최저가격 입찰자가 1순위</span>
                    </div>`;
                }
            } else {
                h += `<div class="verdict blue"><span class="big">📐</span><div><b>별도 기준 적용</b></div></div>`;
            }
            out.innerHTML = h;
        });
    }

    // Stamp Duty & Metro Rail Bond Calculator
    const getStampDutyAmt = a => a <= 1e7 ? 0 : a <= 3e7 ? 2e4 : a <= 5e7 ? 4e4 : a <= 1 * E_AMT ? 7e4 : a <= 10 * E_AMT ? 15e4 : 35e4;

    const btnRunTaxBondCalc = document.getElementById('btnRunTaxBondCalc');
    if (btnRunTaxBondCalc) {
        btnRunTaxBondCalc.addEventListener('click', () => {
            const a = parseNum(document.getElementById('tAmt').value);
            const out = document.getElementById('tOut');
            if (!a) { out.innerHTML = '<p class="placeholder text-red">계약금액을 입력해 주세요.</p>'; return; }

            const st = getStampDutyAmt(a);
            let h = `<div class="res">
                <strong>인 지 세:</strong> <b class="money">${st ? formatWon(st) : "비과세 (1천만원 이하)"}</b> — 전자수입인지 매입 (계약당사자 공동 부담)<br>`;

            const chkConstBond = document.getElementById('chkConstBond');
            if (chkConstBond && chkConstBond.checked) {
                if (a >= 2e7) {
                    const raw = a * 0.02;
                    const base = Math.floor(raw / 5000) * 5000;
                    const bond = (raw - base >= 2500) ? base + 5000 : base;
                    h += `<strong>도시철도공채 (2%):</strong> <b class="money">${formatWon(bond)}</b> <span class="text-sm text-muted">(5,000원 단위 매입 — 2,500원 이상 절상)</span>`;
                } else {
                    h += `<strong>도시철도공채:</strong> 계약금액 2천만원 미만으로 매입 대상 제외`;
                }
            }
            h += `</div>`;
            out.innerHTML = h;
        });
    }

    // AI Contract Advisory Assistant Chat Logic
    const btnSendChatMessage = document.getElementById('btnSendChatMessage');
    const chatInputText = document.getElementById('chatInputText');
    const chatLogArea = document.getElementById('chatLogArea');

    if (btnSendChatMessage && chatInputText && chatLogArea) {
        function handleAIChatMessage() {
            const q = chatInputText.value.trim();
            if (!q) return;

            chatLogArea.insertAdjacentHTML('beforeend', `<div class="bubble user">${q}</div>`);
            chatInputText.value = '';

            let a = "서울시 계약 매뉴얼 기준: 수의계약은 원칙적으로 2천만원 이하(여성/장애인/사회적기업 5천만원)이며, 1억원 이하 용역/물품은 나라장터 2인 이상 전자공개 수의계약이 가능합니다.";

            if (q.includes('8천') || q.includes('8,000')) {
                a = "추정가격 8천만원 용역계약은 2인 이상 전자공개 수의계약(나라장터 안내공고 3일, 견적률 88% 이상 최저가) 대상에 해당합니다. 사전규격 공개 및 사전협의 대상 여부도 확인하세요.";
            } else if (q.includes('선금') || q.includes('정산')) {
                a = "선금은 공사·용역·물품제조 계약 시 총금액의 70%(재무건전성 우수 시 100%) 한도 내에서 청구 후 14일 이내 지급하며, 기성 정산 시 [선금정산액 = 선금액 × (기성액 ÷ 총계약금액)] 공식으로 공제됩니다.";
            } else if (q.includes('지연') || q.includes('배상금')) {
                a = "지연배상금률은 공사 0.5/1000, 용역 1.3/1000, 물품 0.8/1000 이며, 지연배상금이 총 계약금액의 10% 이상에 달하는 경우 계약 해제·해지 및 부정당업자 제재 검토 대상이 됩니다.";
            }

            chatLogArea.insertAdjacentHTML('beforeend', `<div class="bubble ai">${a}</div>`);
            chatLogArea.scrollTop = chatLogArea.scrollHeight;
        }

        btnSendChatMessage.addEventListener('click', handleAIChatMessage);
        chatInputText.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleAIChatMessage();
        });
    }
});


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
});

// Presets Library
const PRESETS = {
    fatiha: `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
الرَّحْمَٰنِ الرَّحِيمِ
مَالِكِ يَوْمِ الدِّينِ
إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ
اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ
صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ`,

    ikhlas: `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
قُلْ هُوَ اللَّهُ أَحَدٌ
اللَّهُ الصَّمَدُ
لَمْ يَلِدْ وَلَمْ يُولَدْ
وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ
بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ
مِن شَرِّ مَا خَلَقَ
وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ
وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ
وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ`,

    mutanabbi: `عَلَى قَدْرِ أَهْلِ الْعَزْمِ تَأْتِي الْعَزَائِمُ ... وَتَأْتِي عَلَى قَدْرِ الْكِرَامِ الْمَكَارِمُ
وَتَعْظُمُ فِي عَيْنِ الصَّغِيرِ صِغَارُهَا ... وَتَصْغُرُ فِي عَيْنِ الْعَظِيمِ الْعَظَائِمُ
إِذَا رَأَيْتَ نُيُوبَ اللَّيْثِ بَارِزَةً ... فَلَا تَظُنَّنَّ أَنَّ اللَّيْثَ يَبْتَسِمُ
وَإِذَا أَتَتْكَ مَذَمَّتِي مِنْ نَاقِصٍ ... فَهِيَ الشَّهَادَةُ لِي بِأَنِّي كَامِلُ
مَا كُلُّ مَا يَتَمَنَّى الْمَرْءُ يُدْرِكُهُ ... تَجْرِي الرِّيَاحُ بِمَا لَا تَشْتَهِي السُّفُنُ`,

    wardi: `اِعْتَزِلْ ذِكْرَ الأَغَانِي وَالغَزَلْ ... وَدَعِ التَّهْيَامَ فِيهَا وَالقُبَلْ
وَاتَّقِ اللهَ فَتَقْوَى اللهِ مَا ... جَاوَرَتْ قَلْبَ امْرِئٍ إِلا وَصَلْ
كُتِبَ المَوْتُ عَلَى الخَلْقِ فَمَا ... لِفَتًى مِنْ مَوْتِهِ المَحْتُومِ حَلْ
اُطْلُبِ العِلْمَ وَلا تَكْسَلْ فَمَا ... أَبْعَدَ الخَيْرَ عَلَى أَهْلِ الكَسَلْ
لا تَقُلْ أَصْلِي وَفَصْلِي أَبَداً ... إِنَّمَا أَصْلُ الفَتَى مَا قَدْ حَصَلْ`
};

// Application State
let state = {
    originalText: '',
    segments: [], // Array of segments. Each segment has text and words array
    currentSegmentIndex: 0,
    chunkMode: 'all', // 'all' or 'split'
    activeTab: 'read', // 'read', 'erasure', 'first-letter', 'typing'
    
    // Erasure Mode State
    erasurePct: 0,
    erasureShuffledIndices: [], // Shuffled word indices for progressive erasure
    erasureManualHidden: new Set(), // Set of word IDs manually hidden/revealed
    
    // First Letter Mode State
    flType: 'dots', // 'dots' or 'blank'
    flTemporarilyRevealedWords: new Set(), // Words revealed temporarily on click

    // Typing Mode State
    typingRevealIndex: 0, // Current character index in the active text block
    typingErrors: 0,
    typingCorrectKeys: 0,
    typingStartTime: null,
    typingTimer: null,
    typingWpm: 0,
    isTypingFinished: false,

    // Audio State
    synth: window.speechSynthesis,
    activeUtterance: null,
    isPlayingAudio: false,
    arabicVoices: []
};

// DOM Elements
const elements = {
    setupSection: document.getElementById('setup-section'),
    workspaceSection: document.getElementById('workspace-section'),
    textInput: document.getElementById('text-input'),
    charCount: document.getElementById('char-count'),
    wordCount: document.getElementById('word-count'),
    lineCount: document.getElementById('line-count'),
    startBtn: document.getElementById('start-btn'),
    backBtn: document.getElementById('back-btn'),
    workspaceTitle: document.getElementById('workspace-title'),
    
    // Audio Elements
    ttsBtn: document.getElementById('tts-btn'),
    voiceSelect: document.getElementById('voice-select'),
    
    // Chunk Navigator Elements
    chunkModeAll: document.getElementById('chunk-mode-all'),
    chunkModeSplit: document.getElementById('chunk-mode-split'),
    chunkControls: document.getElementById('chunk-controls'),
    prevChunkBtn: document.getElementById('prev-chunk-btn'),
    nextChunkBtn: document.getElementById('next-chunk-btn'),
    chunkIndicator: document.getElementById('chunk-indicator'),
    
    // Tabs
    tabButtons: document.querySelectorAll('.tab-btn'),
    techniqueControls: document.getElementById('technique-controls'),
    ctrlSubpanels: {
        read: document.getElementById('ctrl-read'),
        erasure: document.getElementById('ctrl-erasure'),
        'first-letter': document.getElementById('ctrl-first-letter'),
        typing: document.getElementById('ctrl-typing')
    },
    
    // Erasure Controls
    erasureSlider: document.getElementById('erasure-slider'),
    erasurePercentage: document.getElementById('erasure-percentage'),
    hideMoreBtn: document.getElementById('hide-more-btn'),
    revealAllBtn: document.getElementById('reveal-all-btn'),
    
    // First Letter Controls
    flDotsBtn: document.getElementById('fl-dots-btn'),
    flBlankBtn: document.getElementById('fl-blank-btn'),
    
    // Typing Controls & Inputs
    typingProgressPct: document.getElementById('typing-progress-pct'),
    typingErrorsSpan: document.getElementById('typing-errors'),
    typingWpmSpan: document.getElementById('typing-wpm'),
    resetTypingBtn: document.getElementById('reset-typing-btn'),
    typingInputWrapper: document.getElementById('typing-input-wrapper'),
    typingInput: document.getElementById('typing-input'),
    nextCharHint: document.getElementById('next-char-hint'),
    
    // Workspace displays
    textDisplay: document.getElementById('text-display'),
    celebrationCard: document.getElementById('celebration-card'),
    celebrateClose: document.getElementById('celebrate-close')
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initVoices();
    setupEventListeners();
    updateTextStats();
    registerServiceWorker();
});

// Register PWA Service Worker
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker registered successfully:', reg.scope))
            .catch(err => console.error('Service Worker registration failed:', err));
    }
}

// Initialize Speech Synthesis Voices
function initVoices() {
    if (!state.synth) return;
    
    const loadVoices = () => {
        const voices = state.synth.getVoices();
        // Filter for Arabic voices
        state.arabicVoices = voices.filter(v => v.lang.toLowerCase().startsWith('ar'));
        
        elements.voiceSelect.innerHTML = '';
        if (state.arabicVoices.length === 0) {
            const opt = document.createElement('option');
            opt.textContent = 'لا توجد أصوات عربية';
            elements.voiceSelect.appendChild(opt);
            elements.voiceSelect.disabled = true;
        } else {
            state.arabicVoices.forEach((voice, index) => {
                const opt = document.createElement('option');
                opt.value = index;
                opt.textContent = `${voice.name} (${voice.lang})`;
                elements.voiceSelect.appendChild(opt);
            });
            elements.voiceSelect.disabled = false;
        }
    };

    loadVoices();
    if (state.synth.onvoiceschanged !== undefined) {
        state.synth.onvoiceschanged = loadVoices;
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Text stats listener
    elements.textInput.addEventListener('input', updateTextStats);

    // Preset selection
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            const presetKey = btn.dataset.preset;
            if (PRESETS[presetKey]) {
                elements.textInput.value = PRESETS[presetKey];
                btn.classList.add('active');
                updateTextStats();
            }
        });
    });

    // Start Button
    elements.startBtn.addEventListener('click', startMemorizing);

    // Back Button
    elements.backBtn.addEventListener('click', exitWorkspace);

    // Tab buttons
    elements.tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });

    // Chunk controls
    elements.chunkModeAll.addEventListener('click', () => setChunkMode('all'));
    elements.chunkModeSplit.addEventListener('click', () => setChunkMode('split'));
    elements.prevChunkBtn.addEventListener('click', prevChunk);
    elements.nextChunkBtn.addEventListener('click', nextChunk);

    // Erasure events
    elements.erasureSlider.addEventListener('input', handleErasureSliderChange);
    elements.hideMoreBtn.addEventListener('click', () => {
        let val = parseInt(elements.erasureSlider.value);
        if (val < 100) {
            elements.erasureSlider.value = val + 10;
            handleErasureSliderChange();
        }
    });
    elements.revealAllBtn.addEventListener('click', resetErasureState);

    // First Letter Type toggle
    elements.flDotsBtn.addEventListener('click', () => {
        elements.flDotsBtn.classList.add('active');
        elements.flBlankBtn.classList.remove('active');
        state.flType = 'dots';
        renderWorkspaceText();
    });
    elements.flBlankBtn.addEventListener('click', () => {
        elements.flBlankBtn.classList.add('active');
        elements.flDotsBtn.classList.remove('active');
        state.flType = 'blank';
        renderWorkspaceText();
    });

    // Typing Input events
    elements.typingInput.addEventListener('input', handleTypingInput);
    elements.resetTypingBtn.addEventListener('click', resetTypingState);

    // TTS click
    elements.ttsBtn.addEventListener('click', toggleTTS);

    // Celebration close
    elements.celebrateClose.addEventListener('click', () => {
        elements.celebrationCard.classList.add('hidden');
    });

    // Handle voice select change to stop any active speaking
    elements.voiceSelect.addEventListener('change', stopAudio);
}

// --- Text Processing Helpers ---

// Normalize Arabic text (removes diacritics, normalizes Alifs, Haa/Taa, etc.)
function normalizeArabic(text) {
    if (!text) return '';
    return text
        // Strip diacritics (tashkeel: Fatha, Damma, Kasra, Shadda, Sukun, Tanweens, superscript Alif)
        .replace(/[\u064B-\u065F\u0670]/g, '')
        // Normalize Alif variations to bare Alif
        .replace(/[أإآٱ]/g, 'ا')
        // Normalize Teh Marbuta to Heh
        .replace(/ة/g, 'ه')
        // Normalize Alef Maqsura to Yeh
        .replace(/ى/g, 'ي')
        // Normalize Hamza variations
        .replace(/[ؤئ]/g, 'ء')
        // Replace Kashida (stretch character)
        .replace(/ـ/g, '')
        .trim();
}

function isArabicLetter(char) {
    if (!char) return false;
    const code = char.charCodeAt(0);
    // Standard Arabic Unicode block letters (excluding diacritics)
    return (code >= 0x0621 && code <= 0x064A);
}

// Update character, word, and line statistics on Setup screen
function updateTextStats() {
    const text = elements.textInput.value.trim();
    if (!text) {
        elements.charCount.textContent = '0 حرف';
        elements.wordCount.textContent = '0 كلمة';
        elements.lineCount.textContent = '0 سطر';
        elements.startBtn.disabled = true;
        return;
    }
    
    elements.charCount.textContent = `${text.length} حرف`;
    
    const words = text.split(/\s+/).filter(w => w.length > 0);
    elements.wordCount.textContent = `${words.length} كلمة`;
    
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    elements.lineCount.textContent = `${lines.length} سطر`;
    
    elements.startBtn.disabled = false;
}

// --- Workflow Transitions ---

function startMemorizing() {
    const text = elements.textInput.value.trim();
    if (!text) return;

    state.originalText = text;
    
    // Parse text into lines
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // Build segment structure
    let globalWordId = 0;
    state.segments = lines.map((lineText, lineIdx) => {
        let words = [];
        let regex = /\S+/g;
        let match;
        while ((match = regex.exec(lineText)) !== null) {
            words.push({
                id: globalWordId++,
                text: match[0],
                start: match.index,
                end: match.index + match[0].length,
                normalized: normalizeArabic(match[0])
            });
        }
        return {
            text: lineText,
            words: words
        };
    });

    state.currentSegmentIndex = 0;
    
    // Setup initial chunking
    if (state.segments.length > 1) {
        setChunkMode('split'); // Default to chunking if multiple lines
    } else {
        setChunkMode('all');
    }

    // Reset techniques states
    resetErasureState();
    resetTypingState();
    
    // Switch visual sections
    elements.setupSection.classList.add('hidden');
    elements.workspaceSection.classList.remove('hidden');
    
    // Render
    switchTab('read');
    renderWorkspaceTitle();
}

function exitWorkspace() {
    stopAudio();
    elements.workspaceSection.classList.add('hidden');
    elements.setupSection.classList.remove('hidden');
}

function renderWorkspaceTitle() {
    if (state.chunkMode === 'all') {
        elements.workspaceTitle.textContent = 'حفظ النص كاملاً';
    } else {
        elements.workspaceTitle.textContent = `تثبيت الجزء ${state.currentSegmentIndex + 1}`;
    }
}

// --- Chunking / Navigation ---

function setChunkMode(mode) {
    state.chunkMode = mode;
    stopAudio();
    
    if (mode === 'all') {
        elements.chunkModeAll.classList.add('active');
        elements.chunkModeSplit.classList.remove('active');
        elements.chunkControls.classList.add('hidden');
    } else {
        elements.chunkModeAll.classList.remove('active');
        elements.chunkModeSplit.classList.add('active');
        elements.chunkControls.classList.remove('hidden');
        updateChunkIndicator();
    }
    
    // Reset specific mode variables when changing viewport size
    resetErasureState();
    resetTypingState();
    renderWorkspaceTitle();
    renderWorkspaceText();
}

function updateChunkIndicator() {
    elements.chunkIndicator.textContent = `السطر ${state.currentSegmentIndex + 1} من ${state.segments.length}`;
}

function nextChunk() {
    if (state.currentSegmentIndex < state.segments.length - 1) {
        state.currentSegmentIndex++;
        updateChunkIndicator();
        resetErasureState();
        resetTypingState();
        renderWorkspaceTitle();
        renderWorkspaceText();
        stopAudio();
    }
}

function prevChunk() {
    if (state.currentSegmentIndex > 0) {
        state.currentSegmentIndex--;
        updateChunkIndicator();
        resetErasureState();
        resetTypingState();
        renderWorkspaceTitle();
        renderWorkspaceText();
        stopAudio();
    }
}

// Get active text and words representation depending on Chunk Mode
function getActiveTextData() {
    if (state.chunkMode === 'all') {
        // Flatten all words
        let allWords = [];
        let fullText = state.segments.map(s => s.text).join('\n');
        
        // Re-calculate word IDs sequentially for the whole text
        let id = 0;
        state.segments.forEach(seg => {
            seg.words.forEach(w => {
                allWords.push({
                    ...w,
                    id: id++
                });
            });
        });
        
        return {
            text: fullText,
            words: allWords
        };
    } else {
        const seg = state.segments[state.currentSegmentIndex];
        return {
            text: seg.text,
            words: seg.words
        };
    }
}

// --- Workspace Tab Management ---

function switchTab(tabName) {
    state.activeTab = tabName;
    stopAudio();
    
    // Update Tab buttons
    elements.tabButtons.forEach(btn => {
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Hide all control panels
    Object.keys(elements.ctrlSubpanels).forEach(key => {
        elements.ctrlSubpanels[key].classList.add('hidden');
    });
    // Show active control panel
    elements.ctrlSubpanels[tabName].classList.remove('hidden');

    // Toggle Typing Input box visibility
    if (tabName === 'typing') {
        elements.typingInputWrapper.classList.remove('hidden');
        elements.typingInput.focus();
        resetTypingState();
    } else {
        elements.typingInputWrapper.classList.add('hidden');
    }

    renderWorkspaceText();
}

// --- Core Workspace Rendering ---

function renderWorkspaceText() {
    const data = getActiveTextData();
    elements.textDisplay.innerHTML = '';
    
    // Handle split layout if we are displaying all lines, we want line breaks
    if (state.chunkMode === 'all') {
        let currentLineWords = [];
        let wordPointer = 0;
        
        state.segments.forEach((seg, sIdx) => {
            const segDiv = document.createElement('div');
            segDiv.className = 'text-line-block';
            segDiv.style.marginBottom = '12px';
            
            seg.words.forEach(() => {
                const w = data.words[wordPointer++];
                segDiv.appendChild(createWordElement(w));
            });
            
            elements.textDisplay.appendChild(segDiv);
        });
    } else {
        // Just single line words
        data.words.forEach(w => {
            elements.textDisplay.appendChild(createWordElement(w));
        });
    }

    // Post rendering configurations for special modes
    if (state.activeTab === 'typing') {
        renderTypingProgress();
    }
}

function createWordElement(wordObj) {
    const span = document.createElement('span');
    span.className = 'word-span';
    span.dataset.id = wordObj.id;
    
    // Context-dependent display based on Active Tab
    if (state.activeTab === 'read') {
        span.textContent = wordObj.text;
        // Listen to word clicks for specific word pronunciations
        span.addEventListener('click', () => speakWord(wordObj.text, span));
    } 
    else if (state.activeTab === 'erasure') {
        // Erasure checks
        const isHidden = state.erasureManualHidden.has(wordObj.id) || 
                         isWordHiddenBySlider(wordObj.id);
        
        span.textContent = wordObj.text;
        if (isHidden) {
            span.classList.add('hidden-word');
        }
        
        // Manual Toggle on Click
        span.addEventListener('click', () => {
            if (state.erasureManualHidden.has(wordObj.id) || isWordHiddenBySlider(wordObj.id)) {
                // Currently hidden, reveal it
                state.erasureManualHidden.delete(wordObj.id);
                // If it was hidden by slider, we need to explicitly track it as manually revealed
                // But a simple workaround: toggle in our manual set
                if (isWordHiddenBySlider(wordObj.id)) {
                    // It is hidden by slider, to reveal it manually, we keep track of its reveal
                    // Actually, a simpler design: manual overrides everything
                    span.classList.remove('hidden-word');
                    state.erasureManualHidden.add(-wordObj.id - 1); // Negative index flag for manual reveal override
                } else {
                    span.classList.remove('hidden-word');
                }
            } else {
                // Currently visible, hide it
                // Remove any override
                state.erasureManualHidden.delete(-wordObj.id - 1);
                state.erasureManualHidden.add(wordObj.id);
                span.classList.add('hidden-word');
            }
        });
    } 
    else if (state.activeTab === 'first-letter') {
        // First Letter display logic
        if (state.flTemporarilyRevealedWords.has(wordObj.id)) {
            // Clicked to reveal
            span.textContent = wordObj.text;
            span.classList.add('gold-text');
        } else {
            const base = wordObj.normalized;
            if (base.length === 0) {
                // It's punctuation (like ... or .)
                span.textContent = wordObj.text;
            } else {
                const firstChar = base.charAt(0);
                if (state.flType === 'dots') {
                    // Count character dots
                    const dotsCount = Math.max(1, base.length - 1);
                    span.textContent = firstChar + '•'.repeat(dotsCount);
                } else {
                    span.textContent = firstChar;
                }
            }
        }
        
        // Temporary reveal on click
        span.addEventListener('click', () => {
            if (!state.flTemporarilyRevealedWords.has(wordObj.id)) {
                state.flTemporarilyRevealedWords.add(wordObj.id);
                span.textContent = wordObj.text;
                span.classList.add('gold-text');
                
                // Hide again after 2 seconds
                setTimeout(() => {
                    state.flTemporarilyRevealedWords.delete(wordObj.id);
                    // Re-render only this word if still in tab
                    if (state.activeTab === 'first-letter') {
                        const base = wordObj.normalized;
                        if (base.length > 0) {
                            span.classList.remove('gold-text');
                            if (state.flType === 'dots') {
                                span.textContent = firstChar + '•'.repeat(Math.max(1, base.length - 1));
                            } else {
                                span.textContent = firstChar;
                            }
                        }
                    }
                }, 2000);
            }
        });
    }
    else if (state.activeTab === 'typing') {
        // Typing mode rendering. 
        // We will build a unified character-based display in renderTypingProgress instead,
        // but let's output words as placeholder shells.
        span.textContent = wordObj.text;
        span.classList.add('typing-unrevealed');
    }

    return span;
}

// --- Progressive Erasure Logic ---

function isWordHiddenBySlider(wordId) {
    if (state.erasurePct === 0) return false;
    
    // Find count of words to hide based on percent
    const data = getActiveTextData();
    const countToHide = Math.floor((state.erasurePct / 100) * data.words.length);
    
    // Get list of hidden indices
    const hiddenIndices = state.erasureShuffledIndices.slice(0, countToHide);
    
    // Check if wordObj.id index (relative or global) is inside hiddenIndices
    // Find index of this word in current active words list
    const relativeIndex = data.words.findIndex(w => w.id === wordId);
    
    // If it's overrides by manual reveal (negative marker)
    if (state.erasureManualHidden.has(-wordId - 1)) {
        return false;
    }
    
    return hiddenIndices.includes(relativeIndex);
}

function handleErasureSliderChange() {
    state.erasurePct = parseInt(elements.erasureSlider.value);
    elements.erasurePercentage.textContent = `${state.erasurePct}%`;
    
    // Ensure shuffled index array matches active text size
    const data = getActiveTextData();
    if (state.erasureShuffledIndices.length !== data.words.length) {
        // Re-generate shuffled indexes
        state.erasureShuffledIndices = Array.from({length: data.words.length}, (_, i) => i);
        // Shuffle
        for (let i = state.erasureShuffledIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [state.erasureShuffledIndices[i], state.erasureShuffledIndices[j]] = 
                [state.erasureShuffledIndices[j], state.erasureShuffledIndices[i]];
        }
    }
    
    renderWorkspaceText();
}

function resetErasureState() {
    state.erasurePct = 0;
    elements.erasureSlider.value = 0;
    elements.erasurePercentage.textContent = '0%';
    state.erasureManualHidden.clear();
    state.erasureShuffledIndices = [];
    renderWorkspaceText();
}

// --- Typing & Blind Reveal Engine ---

function resetTypingState() {
    const data = getActiveTextData();
    state.typingRevealIndex = 0;
    state.typingErrors = 0;
    state.typingCorrectKeys = 0;
    state.typingStartTime = null;
    state.isTypingFinished = false;
    
    if (state.typingTimer) {
        clearInterval(state.typingTimer);
        state.typingTimer = null;
    }
    
    elements.typingProgressPct.textContent = '0%';
    elements.typingErrorsSpan.textContent = '0';
    elements.typingWpmSpan.textContent = '0 ك/د';
    elements.typingInput.value = '';
    elements.typingInput.disabled = false;
    elements.typingInput.classList.remove('typo-shake');
    elements.celebrationCard.classList.add('hidden');
    
    // Refresh display
    renderWorkspaceText();
    updateNextCharHint();
}

function updateNextCharHint() {
    const data = getActiveTextData();
    const text = data.text;
    
    if (state.typingRevealIndex >= text.length) {
        elements.nextCharHint.textContent = 'مكتمل';
        return;
    }
    
    // Get next letter we are expecting (skip spaces, diacritics, punctuation)
    let idx = state.typingRevealIndex;
    while (idx < text.length) {
        let char = text.charAt(idx);
        if (isArabicLetter(char)) {
            // Find its normalized base form for hints
            let norm = normalizeArabic(char);
            elements.nextCharHint.textContent = norm || char;
            return;
        }
        idx++;
    }
    
    elements.nextCharHint.textContent = 'ـ';
}

function handleTypingInput(e) {
    if (state.isTypingFinished) return;
    
    const val = elements.typingInput.value;
    if (!val) return;
    
    const typedChar = val.charAt(val.length - 1);
    elements.typingInput.value = ''; // Reset input immediately
    
    // Ignore spacebar inputs so user's spacing muscle memory doesn't trigger errors
    if (typedChar === ' ' || typedChar === 'Spacebar') {
        return;
    }
    
    // Start speed timer on first keypress
    if (!state.typingStartTime) {
        state.typingStartTime = Date.now();
        state.typingTimer = setInterval(calculateTypingSpeed, 2000);
    }
    
    const data = getActiveTextData();
    const text = data.text;
    
    // Find the index of the next letter in the text
    let targetIdx = state.typingRevealIndex;
    let targetChar = '';
    
    while (targetIdx < text.length) {
        let c = text.charAt(targetIdx);
        if (isArabicLetter(c)) {
            targetChar = c;
            break;
        }
        targetIdx++;
    }
    
    if (!targetChar) {
        // No letters left, completed!
        finishTyping();
        return;
    }
    
    // Check match
    const normTyped = normalizeArabic(typedChar);
    const normTarget = normalizeArabic(targetChar);
    
    if (normTyped === normTarget && normTyped.length > 0) {
        // Correct key typed!
        state.typingCorrectKeys++;
        
        // We reveal everything up to the matching letter (including diacritics, spaces, and punctuation immediately preceding it)
        // Set new reveal index to the character index AFTER the matched letter
        state.typingRevealIndex = targetIdx + 1;
        
        // Advance pointer past any trailing spaces/punctuation/diacritics immediately following it,
        // so they are revealed instantly as well!
        while (state.typingRevealIndex < text.length) {
            let nextC = text.charAt(state.typingRevealIndex);
            // If it's NOT an Arabic letter (e.g. space, diacritic, punctuation), auto-reveal it
            if (!isArabicLetter(nextC)) {
                state.typingRevealIndex++;
            } else {
                break;
            }
        }
        
        // Remove error outline
        elements.typingInput.classList.remove('typo-shake');
        
        // Render progress
        renderTypingProgress();
        updateNextCharHint();
        
        // Check if finished
        if (state.typingRevealIndex >= text.length) {
            finishTyping();
        }
    } else {
        // Incorrect key
        state.typingErrors++;
        elements.typingErrorsSpan.textContent = state.typingErrors;
        
        // Shake input animation
        elements.typingInput.classList.remove('typo-shake');
        void elements.typingInput.offsetWidth; // Trigger reflow
        elements.typingInput.classList.add('typo-shake');
    }
}

function renderTypingProgress() {
    const data = getActiveTextData();
    const text = data.text;
    const revealIdx = state.typingRevealIndex;
    
    // Build character-level spans
    let html = '';
    
    const prefix = text.slice(0, revealIdx);
    const remaining = text.slice(revealIdx);
    
    // Highlight first letter of remaining as cursor/active
    let activeCharHTML = '';
    let suffixHTML = '';
    
    if (remaining.length > 0) {
        // Find next letter character in remaining to highlight as cursor
        let cursorIndex = 0;
        while (cursorIndex < remaining.length && !isArabicLetter(remaining.charAt(cursorIndex))) {
            cursorIndex++;
        }
        
        if (cursorIndex < remaining.length) {
            // Split remaining into pre-cursor punctuation, cursor char, and rest
            const preCursor = remaining.slice(0, cursorIndex);
            const cursorChar = remaining.charAt(cursorIndex);
            const postCursor = remaining.slice(cursorIndex + 1);
            
            activeCharHTML = `<span class="char-correct">${preCursor}</span><span class="word-span typing-current">${cursorChar}</span>`;
            suffixHTML = `<span class="typing-unrevealed">${postCursor}</span>`;
        } else {
            // Just punctuation left
            activeCharHTML = `<span class="typing-unrevealed">${remaining}</span>`;
        }
    }
    
    html = `<span class="char-correct">${prefix}</span>${activeCharHTML}${suffixHTML}`;
    
    // To preserve newlines in the text, convert \n to <br>
    html = html.replace(/\n/g, '<br>');
    
    elements.textDisplay.innerHTML = html;
    
    // Calculate percentage progress
    const totalLetters = Array.from(text).filter(c => isArabicLetter(c)).length;
    const revealedLetters = Array.from(prefix).filter(c => isArabicLetter(c)).length;
    
    const pct = totalLetters > 0 ? Math.round((revealedLetters / totalLetters) * 100) : 100;
    elements.typingProgressPct.textContent = `${pct}%`;
}

function calculateTypingSpeed() {
    if (!state.typingStartTime || state.isTypingFinished) return;
    
    const mins = (Date.now() - state.typingStartTime) / 60000;
    if (mins < 0.05) return;
    
    // Word counts based on standard 5 chars per word typed
    const words = state.typingCorrectKeys / 5;
    state.typingWpm = Math.round(words / mins);
    elements.typingWpmSpan.textContent = `${state.typingWpm} ك/د`;
}

function finishTyping() {
    state.isTypingFinished = true;
    elements.typingInput.disabled = true;
    
    if (state.typingTimer) {
        clearInterval(state.typingTimer);
    }
    
    calculateTypingSpeed();
    elements.typingProgressPct.textContent = '100%';
    
    // Final reveal display
    const data = getActiveTextData();
    elements.textDisplay.innerHTML = `<span class="char-correct">${data.text.replace(/\n/g, '<br>')}</span>`;
    
    // Show celebration card
    elements.celebrationCard.classList.remove('hidden');
}

// --- Text-To-Speech (TTS) Voice Engine ---

function toggleTTS() {
    if (state.isPlayingAudio) {
        stopAudio();
    } else {
        startAudio();
    }
}

function startAudio() {
    if (!state.synth) return;
    
    stopAudio();
    
    const data = getActiveTextData();
    if (!data.text) return;
    
    state.activeUtterance = new SpeechSynthesisUtterance(data.text);
    
    // Set voice
    if (state.arabicVoices.length > 0) {
        const voiceIndex = parseInt(elements.voiceSelect.value);
        if (!isNaN(voiceIndex) && state.arabicVoices[voiceIndex]) {
            state.activeUtterance.voice = state.arabicVoices[voiceIndex];
        }
    }
    
    // Visual tracking during speaking (boundary event)
    state.activeUtterance.onboundary = (event) => {
        if (event.name === 'word') {
            const charIndex = event.charIndex;
            // Find which word in active dataset covers this index
            const activeWord = data.words.find(w => charIndex >= w.start && charIndex < w.end);
            
            if (activeWord) {
                highlightSpeakingWord(activeWord.id);
            }
        }
    };
    
    state.activeUtterance.onend = () => {
        stopAudio();
    };
    
    state.activeUtterance.onerror = () => {
        stopAudio();
    };
    
    // Set button state
    elements.ttsBtn.classList.add('playing');
    elements.ttsBtn.querySelector('i').className = 'fa-solid fa-square';
    elements.ttsBtn.querySelector('span').textContent = 'إيقاف الاستماع';
    state.isPlayingAudio = true;
    
    state.synth.speak(state.activeUtterance);
}

function stopAudio() {
    if (state.synth) {
        state.synth.cancel();
    }
    
    // Reset highlights
    document.querySelectorAll('.word-span').forEach(span => {
        span.classList.remove('speaking');
    });
    
    elements.ttsBtn.classList.remove('playing');
    elements.ttsBtn.querySelector('i').className = 'fa-solid fa-volume-high';
    elements.ttsBtn.querySelector('span').textContent = 'استمع للنص';
    state.isPlayingAudio = false;
    state.activeUtterance = null;
}

// Speak a single word (called on click in Read mode)
function speakWord(wordText, wordSpanElement) {
    if (!state.synth) return;
    
    // Stop full recitation if active
    if (state.isPlayingAudio) {
        stopAudio();
    }
    
    // Strip punctuation for speech
    const cleanWord = wordText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    if (!cleanWord.trim()) return;

    const utt = new SpeechSynthesisUtterance(cleanWord);
    
    // Set voice
    if (state.arabicVoices.length > 0) {
        const voiceIndex = parseInt(elements.voiceSelect.value);
        if (!isNaN(voiceIndex) && state.arabicVoices[voiceIndex]) {
            utt.voice = state.arabicVoices[voiceIndex];
        }
    }
    
    utt.onstart = () => {
        wordSpanElement.classList.add('speaking');
    };
    
    utt.onend = () => {
        wordSpanElement.classList.remove('speaking');
    };
    
    utt.onerror = () => {
        wordSpanElement.classList.remove('speaking');
    };
    
    state.synth.speak(utt);
}

function highlightSpeakingWord(wordId) {
    document.querySelectorAll('.word-span').forEach(span => {
        if (parseInt(span.dataset.id) === wordId) {
            span.classList.add('speaking');
            
            // Auto scroll display container to make sure the speaking word is visible if scrolled
            span.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            span.classList.remove('speaking');
        }
    });
}

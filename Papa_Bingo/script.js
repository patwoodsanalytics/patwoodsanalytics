document.addEventListener("DOMContentLoaded", () => {
  const DEFAULT_SAYINGS = [
    "Back in my day...",
    "I know a shortcut",
    "That’s too expensive",
    "I’m not lost",
    "They don’t make ’em like they used to",
    "Just watch this",
    "You call that driving?",
    "Need anything from the store?",
    "That’s a good deal",
    "Turn that down",
    "Who touched the thermostat?",
    "I could fix that",
    "Don’t tell grandma",
    "That reminds me of...",
    "Want some advice?",
    "That’ll put hair on your chest",
    "I’ve got a guy for that",
    "When I was your age...",
    "Not bad, not bad",
    "That’s how they get ya",
    "Mark my words",
    "Listen here",
    "No need for instructions",
    "It still works fine",
    "That road used to be different",
    "I remember when gas was cheap",
    "You don’t need to buy that",
    "Let me show you the right way",
    "That’s a real mess",
    "Did you bring a jacket?"
  ];

  const boardEl = document.getElementById("bingo-board");
  const statusEl = document.getElementById("status");
  const editorPanel = document.getElementById("editorPanel");
  const phrasesInput = document.getElementById("phrasesInput");
  const newCardBtn = document.getElementById("newCard");
  const editPhrasesBtn = document.getElementById("editPhrases");
  const clearMarksBtn = document.getElementById("clearMarks");
  const closeEditorBtn = document.getElementById("closeEditor");
  const savePhrasesBtn = document.getElementById("savePhrases");
  const resetDefaultsBtn = document.getElementById("resetDefaults");

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function getSavedPhrases() {
    const saved = localStorage.getItem("papaBingoPhrases");
    if (!saved) return DEFAULT_SAYINGS;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= 24) return parsed;
    } catch (e) {}
    return DEFAULT_SAYINGS;
  }

  function savePhrasesList(list) {
    localStorage.setItem("papaBingoPhrases", JSON.stringify(list));
  }

  function getCurrentBoardState() {
    const state = localStorage.getItem("papaBingoBoard");
    if (!state) return null;
    try {
      return JSON.parse(state);
    } catch (e) {
      return null;
    }
  }

  function saveBoardState(items, markedIndexes) {
    localStorage.setItem("papaBingoBoard", JSON.stringify({ items, markedIndexes }));
  }

  function clearSavedMarks() {
    const state = getCurrentBoardState();
    if (!state || !Array.isArray(state.items)) return;
    saveBoardState(state.items, [12]);
  }

  function populateEditor() {
    phrasesInput.value = getSavedPhrases().join("\n");
  }

  function persistCurrentBoard() {
    const squares = [...document.querySelectorAll(".square")];
    const items = squares.map((s) => s.textContent);
    const markedIndexes = squares
      .map((s, idx) => (s.classList.contains("marked") ? idx : null))
      .filter((v) => v !== null);
    saveBoardState(items, markedIndexes);
  }

  function checkBingo() {
    const squares = [...document.querySelectorAll(".square")];
    const marked = squares.map((s) => s.classList.contains("marked"));
    const wins = [];

    for (let i = 0; i < 5; i++) {
      wins.push([0, 1, 2, 3, 4].map((j) => i * 5 + j));
      wins.push([0, 1, 2, 3, 4].map((j) => j * 5 + i));
    }

    wins.push([0, 6, 12, 18, 24], [4, 8, 12, 16, 20]);

    const bingo = wins.some((combo) => combo.every((i) => marked[i]));
    statusEl.textContent = bingo ? "🎉 BINGO! 🎉" : "";
  }

  function createBoard(useExisting = false) {
    boardEl.innerHTML = "";
    statusEl.textContent = "";

    let items;
    let markedIndexes = [12];
    const existing = getCurrentBoardState();

    if (useExisting && existing && Array.isArray(existing.items) && existing.items.length === 25) {
      items = existing.items;
      markedIndexes = Array.isArray(existing.markedIndexes) ? existing.markedIndexes : [12];
    } else {
      const sayings = shuffle(getSavedPhrases()).slice(0, 24);
      sayings.splice(12, 0, "FREE");
      items = sayings;
    }

    items.forEach((text, idx) => {
      const div = document.createElement("button");
      div.type = "button";
      div.className = "square";
      div.textContent = text;
      div.setAttribute("aria-pressed", "false");

      const isMarked = text === "FREE" || markedIndexes.includes(idx);
      if (isMarked) {
        div.classList.add("marked");
        div.setAttribute("aria-pressed", "true");
      }

      div.addEventListener("click", () => {
        if (text === "FREE") return;
        div.classList.toggle("marked");
        div.setAttribute("aria-pressed", div.classList.contains("marked") ? "true" : "false");
        persistCurrentBoard();
        checkBingo();
      });

      boardEl.appendChild(div);
    });

    persistCurrentBoard();
    checkBingo();
  }

  function openEditor() {
    populateEditor();
    editorPanel.classList.remove("hidden");
    editorPanel.setAttribute("aria-hidden", "false");
    phrasesInput.focus();
  }

  function closeEditor() {
    editorPanel.classList.add("hidden");
    editorPanel.setAttribute("aria-hidden", "true");
  }

  newCardBtn.addEventListener("click", () => createBoard(false));
  editPhrasesBtn.addEventListener("click", openEditor);
  clearMarksBtn.addEventListener("click", () => {
    clearSavedMarks();
    createBoard(true);
  });
  closeEditorBtn.addEventListener("click", closeEditor);

  savePhrasesBtn.addEventListener("click", () => {
    const phrases = phrasesInput.value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (phrases.length < 24) {
      alert("Please enter at least 24 phrases.");
      return;
    }

    savePhrasesList(phrases);
    closeEditor();
    createBoard(false);
  });

  resetDefaultsBtn.addEventListener("click", () => {
    savePhrasesList(DEFAULT_SAYINGS);
    populateEditor();
  });

  window.addEventListener("click", (event) => {
    if (event.target === editorPanel) closeEditor();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !editorPanel.classList.contains("hidden")) {
      closeEditor();
    }
  });

  createBoard(true);
});

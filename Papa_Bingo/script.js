document.addEventListener('DOMContentLoaded', function () {
  var DEFAULT_SAYINGS = [
    'Back in my day...',
    'I know a shortcut',
    'That is too expensive',
    'I am not lost',
    'They do not make them like they used to',
    'Just watch this',
    'You call that driving?',
    'Need anything from the store?',
    'That is a good deal',
    'Turn that down',
    'Who touched the thermostat?',
    'I could fix that',
    'Do not tell grandma',
    'That reminds me of...',
    'Want some advice?',
    'That will put hair on your chest',
    'I have got a guy for that',
    'When I was your age...',
    'Not bad, not bad',
    'That is how they get ya',
    'Mark my words',
    'Listen here',
    'No need for instructions',
    'It still works fine',
    'That road used to be different',
    'I remember when gas was cheap',
    'You do not need to buy that',
    'Let me show you the right way',
    'That is a real mess',
    'Did you bring a jacket?'
  ];

  var boardEl = document.getElementById('bingo-board');
  var statusEl = document.getElementById('status');
  var editorPanel = document.getElementById('editorPanel');
  var phrasesInput = document.getElementById('phrasesInput');

  function getPhrases() {
    try {
      var saved = localStorage.getItem('papaBingoPhrases');
      if (!saved) return DEFAULT_SAYINGS.slice();
      var parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= 24) return parsed;
    } catch (e) {}
    return DEFAULT_SAYINGS.slice();
  }

  function setPhrases(list) {
    localStorage.setItem('papaBingoPhrases', JSON.stringify(list));
  }

  function shuffle(arr) {
    var copy = arr.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  function saveBoard(items, marked) {
    localStorage.setItem('papaBingoBoard', JSON.stringify({
      items: items,
      marked: marked
    }));
  }

  function loadBoard() {
    try {
      var saved = localStorage.getItem('papaBingoBoard');
      if (!saved) return null;
      var parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.items) && parsed.items.length === 25 && Array.isArray(parsed.marked)) {
        return parsed;
      }
    } catch (e) {}
    return null;
  }

  function getWinLines() {
    var wins = [];
    for (var i = 0; i < 5; i++) {
      wins.push([i*5, i*5+1, i*5+2, i*5+3, i*5+4]);
      wins.push([i, i+5, i+10, i+15, i+20]);
    }
    wins.push([0, 6, 12, 18, 24]);
    wins.push([4, 8, 12, 16, 20]);
    return wins;
  }

  function updateBingoStatus() {
    var squares = Array.prototype.slice.call(document.querySelectorAll('.square'));
    var marked = squares.map(function (sq) {
      return sq.classList.contains('marked');
    });

    var bingo = getWinLines().some(function (line) {
      return line.every(function (idx) { return marked[idx]; });
    });

    statusEl.textContent = bingo ? '🎉 BINGO! 🎉' : '';
  }

  function persistCurrentBoard() {
    var squares = Array.prototype.slice.call(document.querySelectorAll('.square'));
    var items = squares.map(function (sq) { return sq.textContent; });
    var marked = squares.map(function (sq) { return sq.classList.contains('marked'); });
    saveBoard(items, marked);
  }

  function renderBoard(items, marked) {
    boardEl.innerHTML = '';

    items.forEach(function (text, idx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'square';
      btn.textContent = text;

      if (marked[idx] || text === 'FREE') {
        btn.classList.add('marked');
      }

      btn.addEventListener('click', function () {
        if (text === 'FREE') return;
        btn.classList.toggle('marked');
        persistCurrentBoard();
        updateBingoStatus();
      });

      boardEl.appendChild(btn);
    });

    persistCurrentBoard();
    updateBingoStatus();
  }

  function createNewBoard() {
    var phrases = shuffle(getPhrases()).slice(0, 24);
    phrases.splice(12, 0, 'FREE');
    var marked = new Array(25).fill(false);
    marked[12] = true;
    renderBoard(phrases, marked);
  }

  function loadExistingOrNew() {
    var board = loadBoard();
    if (board) {
      renderBoard(board.items, board.marked);
    } else {
      createNewBoard();
    }
  }

  document.getElementById('newCard').addEventListener('click', function () {
    createNewBoard();
  });

  document.getElementById('clearMarks').addEventListener('click', function () {
    var board = loadBoard();
    if (!board) {
      createNewBoard();
      return;
    }
    var marked = new Array(25).fill(false);
    marked[12] = true;
    renderBoard(board.items, marked);
  });

  document.getElementById('editPhrases').addEventListener('click', function () {
    phrasesInput.value = getPhrases().join('\n');
    editorPanel.classList.remove('hidden');
  });

  document.getElementById('closeEditor').addEventListener('click', function () {
    editorPanel.classList.add('hidden');
  });

  document.getElementById('savePhrases').addEventListener('click', function () {
    var phrases = phrasesInput.value
      .split('\n')
      .map(function (line) { return line.trim(); })
      .filter(function (line) { return line.length > 0; });

    if (phrases.length < 24) {
      alert('Please enter at least 24 phrases.');
      return;
    }

    setPhrases(phrases);
    editorPanel.classList.add('hidden');
    createNewBoard();
  });

  document.getElementById('resetDefaults').addEventListener('click', function () {
    setPhrases(DEFAULT_SAYINGS);
    phrasesInput.value = DEFAULT_SAYINGS.join('\n');
  });

  editorPanel.addEventListener('click', function (event) {
    if (event.target === editorPanel) {
      editorPanel.classList.add('hidden');
    }
  });

  loadExistingOrNew();
});

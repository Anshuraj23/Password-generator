const CHARS = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  special: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// Toggle checkbox active state
document.querySelectorAll('.option-item').forEach(label => {
  label.addEventListener('click', () => {
    const cb = label.querySelector('input[type="checkbox"]');
    setTimeout(() => {
      label.classList.toggle('active', cb.checked);
    }, 0);
  });
});

// Sync slider value display
function syncLength(val) {
  document.getElementById('lengthVal').textContent = val;
}

// Get selected options
function getOptions() {
  return {
    upper: document.getElementById('chk-upper').checked,
    lower: document.getElementById('chk-lower').checked,
    numbers: document.getElementById('chk-numbers').checked,
    special: document.getElementById('chk-special').checked,
  };
}

// Generate password
function generatePassword() {
  const opts = getOptions();
  const length = parseInt(document.getElementById('lengthSlider').value);
  const errEl = document.getElementById('errorMsg');

  // Validate at least one option selected
  if (!opts.upper && !opts.lower && !opts.numbers && !opts.special) {
    errEl.style.display = 'block';
    return;
  }
  errEl.style.display = 'none';

  // Build charset and guarantee one char from each selected type
  let charset = '';
  let required = [];

  if (opts.upper)   { charset += CHARS.upper;   required.push(randomChar(CHARS.upper)); }
  if (opts.lower)   { charset += CHARS.lower;   required.push(randomChar(CHARS.lower)); }
  if (opts.numbers) { charset += CHARS.numbers; required.push(randomChar(CHARS.numbers)); }
  if (opts.special) { charset += CHARS.special; required.push(randomChar(CHARS.special)); }

  let password = [...required];
  for (let i = required.length; i < length; i++) {
    password.push(randomChar(charset));
  }

  // Shuffle password array
  password = password.sort(() => crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5);
  const result = password.join('');

  // Display password
  const el = document.getElementById('passwordOutput');
  el.textContent = result;
  el.classList.remove('placeholder');

  // Update strength indicator
  updateStrength(result, opts);
}

// Get a random character from a string
function randomChar(str) {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return str[arr[0] % str.length];
}

// Update strength bar and label
function updateStrength(pw, opts) {
  let score = 0;
  const len = pw.length;

  if (len >= 8)  score++;
  if (len >= 14) score++;
  if (len >= 20) score++;

  const typeCount = [opts.upper, opts.lower, opts.numbers, opts.special].filter(Boolean).length;
  if (typeCount >= 2) score++;
  if (typeCount >= 3) score++;
  if (typeCount === 4) score++;

  const level = Math.min(4, Math.max(1, Math.round(score / 1.5)));

  const colors = ['', '#f87171', '#fbbf24', '#34d399', '#6c63ff'];
  const labels = ['', 'weak', 'fair', 'good', 'strong'];

  for (let i = 1; i <= 4; i++) {
    const bar = document.getElementById('s' + i);
    bar.style.background = i <= level ? colors[level] : 'var(--border)';
  }

  document.getElementById('strengthLabel').textContent = labels[level];
  document.getElementById('strengthLabel').style.color = colors[level];
}

// Copy password to clipboard
function copyPassword() {
  const el = document.getElementById('passwordOutput');
  const text = el.textContent;

  if (!text || el.classList.contains('placeholder')) return;

  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('copyBtn');
    btn.textContent = 'copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'copy';
      btn.classList.remove('copied');
    }, 1800);
  });
}

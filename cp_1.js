
'use strict';

// all the elements we created
const form            = document.getElementById('feedback-form');
const fieldsWrapper   = document.getElementById('fields-wrapper');
const tooltip         = document.getElementById('tooltip');
const feedbackDisplay = document.getElementById('feedback-display');

const nameInput  = document.getElementById('user-name');
const emailInput = document.getElementById('user-email');
const commentsTA = document.getElementById('user-comments');
const ratingInput = document.getElementById('user-rating');
const ratingWrap  = document.getElementById('rating-wrap');
const stars       = Array.from(document.querySelectorAll('.star'));

const countName     = document.getElementById('count-name');
const countEmail    = document.getElementById('count-email');
const countComments = document.getElementById('count-comments');

const errName     = document.getElementById('err-name');
const errEmail    = document.getElementById('err-email');
const errRating   = document.getElementById('err-rating');
const errComments = document.getElementById('err-comments');

// character count
fieldsWrapper.addEventListener('input', function (e) {
  const el  = e.target;
  const max = parseInt(el.dataset.max, 10);
  if (!max) return; // not a counted field

  const len = el.value.length;

 // element
  let counter = null;
  if (el === nameInput)  counter = countName;
  if (el === emailInput) counter = countEmail;
  if (el === commentsTA) counter = countComments;

  if (counter) {
    counter.textContent = `${len} / ${max}`;
    counter.classList.toggle('warn',  len >= max * 0.8 && len < max);
    counter.classList.toggle('maxed', len >= max);
  }

  // Clear the error for this field as the user types
  clearErr(el);
});

// mouse wrapper witht the tooltip
fieldsWrapper.addEventListener('mouseover', function (e) {
  const el = e.target.closest('[data-tooltip]');
  if (!el) return;
  tooltip.textContent = el.dataset.tooltip;
  tooltip.classList.add('show');
  moveTooltip(e);
});

fieldsWrapper.addEventListener('mousemove', function (e) {
  if (tooltip.classList.contains('show')) moveTooltip(e);
});

fieldsWrapper.addEventListener('mouseout', function (e) {
  const el = e.target.closest('[data-tooltip]');
  if (el && !el.contains(e.relatedTarget)) {
    tooltip.classList.remove('show');
  }
});

function moveTooltip(e) {
  const gap = 12;
  let x = e.clientX + gap;
  let y = e.clientY + gap;
  if (x + 220 > window.innerWidth)  x = e.clientX - 220 - gap;
  if (y + 60  > window.innerHeight) y = e.clientY - 60  - gap;
  tooltip.style.left = x + 'px';
  tooltip.style.top  = y + 'px';
}

// Hide tooltip when mouse leaves the form area
document.body.addEventListener('mousemove', function (e) {
  if (!fieldsWrapper.contains(e.target)) tooltip.classList.remove('show');
});


// star rating for the website
stars.forEach(function (star) {

  star.addEventListener('mouseenter', function (e) {
    e.stopPropagation(); // stop tooltip from showing
    const val = parseInt(this.dataset.value, 10);
    stars.forEach((s, i) => {
      s.classList.toggle('hovered', i < val);
      s.classList.remove('active');
    });
  });

  star.addEventListener('click', function (e) {
    e.stopPropagation();
    const val = parseInt(this.dataset.value, 10);
    ratingInput.value = val;
    stars.forEach((s, i) => {
      s.classList.toggle('active', i < val);
      s.classList.remove('hovered');
    });
    setErr(errRating, ''); // clears the error
  });

});

// resets the (stars)
ratingWrap.addEventListener('mouseleave', function () {
  const current = parseInt(ratingInput.value, 10) || 0;
  stars.forEach((s, i) => {
    s.classList.toggle('active', i < current);
    s.classList.remove('hovered');
  });
});


// this is the stop
document.body.addEventListener('click', function (e) {
  if (!form.contains(e.target)) e.stopPropagation();
});


// error text message
function setErr(el, msg) {
  el.textContent = msg;
  el.classList.toggle('show', !!msg);

  // Highlight the input too
  const input = el.previousElementSibling;
  if (input && (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA')) {
    input.classList.toggle('has-error', !!msg);
  }
}

function clearErr(inputEl) {
  if (inputEl === nameInput)  setErr(errName, '');
  if (inputEl === emailInput) setErr(errEmail, '');
  if (inputEl === commentsTA) setErr(errComments, '');
}

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

// validate argument
function validate() {
  let ok = true;

  if (!nameInput.value.trim()) {
    setErr(errName, '✕ Name is required.'); ok = false;
  } else { setErr(errName, ''); }

  if (!emailInput.value.trim()) {
    setErr(errEmail, '✕ Email is required.'); ok = false;
  } else if (!isEmail(emailInput.value)) {
    setErr(errEmail, '✕ Enter a valid email.'); ok = false;
  } else { setErr(errEmail, ''); }

  if (!ratingInput.value) {
    setErr(errRating, '✕ Please pick a rating.'); ok = false;
  } else { setErr(errRating, ''); }

  if (!commentsTA.value.trim()) {
    setErr(errComments, '✕ Comments are required.'); ok = false;
  } else { setErr(errComments, ''); }

  return ok;
}


// ─────────────────────────────────────
// 4. FORM SUBMIT + ADD CARD
// ─────────────────────────────────────
form.addEventListener('submit', function (e) {
  e.preventDefault();
  e.stopPropagation();

  if (!validate()) {
    // Scroll to first error
    const first = form.querySelector('.error.show');
    if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Build the entry object
  const entry = {
    name:    nameInput.value.trim(),
    email:   emailInput.value.trim(),
    rating:  parseInt(ratingInput.value, 10),
    comment: commentsTA.value.trim(),
    time:    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  addCard(entry);
  resetForm();

  // Scroll down to show the new card
  document.getElementById('responses')
    .scrollIntoView({ behavior: 'smooth', block: 'start' });
});



function addCard(entry) {
  // Remove the "no responses" message
  const empty = feedbackDisplay.querySelector('.empty');
  if (empty) empty.remove();

  const starsHTML = '★'.repeat(entry.rating) + '☆'.repeat(5 - entry.rating);
  const initials  = entry.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="card-avatar">${initials}</div>
    <div>
      <div class="card-name">${safe(entry.name)}</div>
      <div class="card-meta">${safe(entry.email)} · ${entry.time}
        <span class="card-stars">&nbsp;${starsHTML}</span>
      </div>
      <p class="card-comment">${safe(entry.comment)}</p>
    </div>
  `;

  // Newest card goes on top
  feedbackDisplay.insertBefore(card, feedbackDisplay.firstChild);
}


// it fuly resets the form
function resetForm() {
  nameInput.value  = '';
  emailInput.value = '';
  commentsTA.value = '';
  ratingInput.value = '';
  stars.forEach(s => s.classList.remove('active', 'hovered'));

  countName.textContent     = '0 / 60';
  countEmail.textContent    = '0 / 80';
  countComments.textContent = '0 / 400';

  [countName, countEmail, countComments].forEach(c => {
    c.classList.remove('warn', 'maxed');
  });

  [errName, errEmail, errRating, errComments].forEach(e => setErr(e, ''));
}

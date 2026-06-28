// Shared course rendering engine
// Each course page sets window.COURSE before loading this script

(function () {
  const STORAGE_KEY = 'anthro-done-' + COURSE.id;
  let done = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  let currentId = null;

  function allLessons() {
    return COURSE.modules.flatMap(m => m.lessons);
  }
  function getLesson(id) { return allLessons().find(l => l.id === id); }
  function getIndex(id) { return allLessons().findIndex(l => l.id === id); }

  function renderSidebar() {
    let n = 0;
    const html = COURSE.modules.map((mod, mi) => `
      <div>
        <div class="sidebar-module">模块 ${mi + 1}：${mod.title}</div>
        ${mod.lessons.map(l => {
          n++;
          const isDone = done.has(l.id);
          const isActive = l.id === currentId;
          return `<a class="sidebar-lesson${isDone?' done':''}${isActive?' active':''}" onclick="loadLesson('${l.id}')" href="#">
            <div class="lesson-check">${isDone ? '✓' : ''}</div>
            <span>${n}. ${l.title}</span>
          </a>`;
        }).join('')}
      </div>`).join('');
    document.getElementById('sidebar-content').innerHTML = html;
    const total = allLessons().length;
    document.getElementById('progress-text').textContent = `${done.size} / ${total} 节`;
    document.getElementById('progress-fill').style.width = `${(done.size / total) * 100}%`;
  }

  window.loadLesson = function (id) {
    currentId = id;
    const lesson = getLesson(id);
    const all = allLessons();
    const idx = getIndex(id);
    const prev = idx > 0 ? all[idx - 1] : null;
    const next = idx < all.length - 1 ? all[idx + 1] : null;
    const nav = `<div class="lesson-nav">
      ${prev ? `<button class="nav-btn" onclick="loadLesson('${prev.id}')">← ${prev.title}</button>` : '<span></span>'}
      ${next
        ? `<button class="nav-btn primary" onclick="markAndNext('${id}','${next.id}')">下一节：${next.title} →</button>`
        : `<button class="nav-btn primary" onclick="markDone('${id}')">✓ 完成课程</button>`}
    </div>`;
    document.getElementById('main-content').innerHTML = lesson.html + nav;
    renderSidebar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelector('.sidebar').classList.remove('open');
    // Wire quizzes
    document.querySelectorAll('.quiz-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const radio = opt.querySelector('input[type=radio]');
        if (!radio) return;
        const name = radio.name;
        const correct = COURSE.answers[name];
        document.querySelectorAll(`input[name="${name}"]`).forEach(r =>
          r.closest('.quiz-option').classList.remove('selected-correct', 'selected-wrong'));
        opt.classList.add(radio.value === correct ? 'selected-correct' : 'selected-wrong');
        const el = document.getElementById(name + '-result');
        if (el) {
          el.className = 'quiz-result ' + (radio.value === correct ? 'correct' : 'wrong');
          el.textContent = radio.value === correct ? '✓ 正确！' : '✗ 再想想看。';
        }
      });
    });
  };

  window.markDone = function (id) {
    done.add(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...done]));
    renderSidebar();
  };

  window.markAndNext = function (id, nextId) {
    window.markDone(id);
    window.loadLesson(nextId);
  };

  window.copyPrompt = function (btn) {
    const text = btn.closest('.prompt-box,.code-block').querySelector('.prompt-body,pre').textContent;
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = '已复制 ✓'; btn.classList.add('copied');
      setTimeout(() => { btn.textContent = '复制'; btn.classList.remove('copied'); }, 2000);
    });
  };

  // Init
  loadLesson(allLessons()[0].id);
}());

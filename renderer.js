// ===== 含含开心学习 - 主逻辑 =====
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const ACHIEVE_THRESHOLD = 0.7; // 70% 达标

let state = {
  data: { tasks: {}, templates: [], achievements: {} },
  viewYear: new Date().getFullYear(),
  viewMonth: new Date().getMonth(),
  selectedDate: todayStr()
};

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function fmtDate(y, m, d) {
  return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

// ===== 数据加载 =====
async function loadData() {
  state.data = await window.api.loadData();
  if (!state.data.tasks) state.data.tasks = {};
  if (!state.data.templates) state.data.templates = [];
  if (!state.data.achievements) state.data.achievements = {};
}
async function saveData() {
  await window.api.saveData(state.data);
}

// ===== 日历渲染 =====
function renderCalendar() {
  const y = state.viewYear, m = state.viewMonth;
  $('#monthLabel').textContent = `${y}年${m+1}月`;
  const first = new Date(y, m, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(y, m+1, 0).getDate();
  const prevDays = new Date(y, m, 0).getDate();

  const grid = $('#calendarGrid');
  grid.innerHTML = '';

  // 上月尾巴
  for (let i = startDay - 1; i >= 0; i--) {
    const d = prevDays - i;
    const cell = makeDayCell(y, m-1, d, true);
    grid.appendChild(cell);
  }
  // 本月
  for (let d = 1; d <= daysInMonth; d++) {
    const cell = makeDayCell(y, m, d, false);
    grid.appendChild(cell);
  }
  // 下月开头补齐到 42 格
  const total = startDay + daysInMonth;
  const tail = (7 - (total % 7)) % 7;
  for (let d = 1; d <= tail; d++) {
    const cell = makeDayCell(y, m+1, d, true);
    grid.appendChild(cell);
  }
}

function makeDayCell(y, m, d, otherMonth) {
  // 规范化月份
  let yy = y, mm = m;
  if (mm < 0) { yy--; mm = 11; }
  if (mm > 11) { yy++; mm = 0; }
  const ds = fmtDate(yy, mm, d);
  const cell = document.createElement('div');
  cell.className = 'cal-day';
  if (otherMonth) cell.classList.add('other-month');
  if (ds === todayStr()) cell.classList.add('today');
  if (ds === state.selectedDate) cell.classList.add('selected');
  if (state.data.tasks[ds] && state.data.tasks[ds].length > 0) cell.classList.add('has-task');
  if (state.data.achievements[ds]) cell.classList.add('achieved');
  cell.textContent = d;
  cell.addEventListener('click', () => {
    state.selectedDate = ds;
    renderCalendar();
    renderTasks();
    renderMelody();
  });
  return cell;
}

// ===== 任务渲染 =====
function renderTasks() {
  const ds = state.selectedDate;
  const [y, m, d] = ds.split('-').map(Number);
  const weekDays = ['周日','周一','周二','周三','周四','周五','周六'];
  const wd = new Date(y, m-1, d).getDay();
  $('#selectedDateLabel').textContent = `${m}月${d}日 ${weekDays[wd]}`;

  const today = todayStr();
  const tl = $('#todayLabel');
  if (tl) tl.textContent = `今天是 ${today.replace(/-/g, '/')} ${weekDays[new Date().getDay()]}`;

  const tasks = state.data.tasks[ds] || [];
  const list = $('#taskList');
  list.innerHTML = '';
  const empty = $('#taskEmpty');

  if (tasks.length === 0) {
    empty.classList.add('show');
  } else {
    empty.classList.remove('show');
    tasks.forEach((t, i) => {
      const item = document.createElement('div');
      item.className = 'task-item' + (t.done ? ' done' : '');

      const check = document.createElement('div');
      check.className = 'task-check';
      check.textContent = t.done ? '✓' : '';
      check.addEventListener('click', async () => {
        t.done = !t.done;
        await saveData();
        renderTasks();
        renderCalendar();
        await checkAchievement(ds);
        renderMelody();
      });

      const body = document.createElement('div');
      body.className = 'task-body';
      const title = document.createElement('div');
      title.className = 'task-title';
      title.textContent = t.title;
      body.appendChild(title);

      // 附件按钮
      const attachBtn = document.createElement('button');
      attachBtn.className = 'task-attach-btn';
      if (t.attachment) attachBtn.classList.add('has-file');
      attachBtn.innerHTML = t.attachment ? '📎 已上传附件' : '📷 上传照片/视频';
      attachBtn.addEventListener('click', () => onAttachment(t, attachBtn));
      body.appendChild(attachBtn);

      // 已上传时显示删除附件 + 保存到相册按钮
      if (t.attachment) {
        const attachActions = document.createElement('span');
        attachActions.style.cssText = 'display:inline-flex;gap:4px;margin-top:4px;';

        // 删除附件
        const delAttach = document.createElement('button');
        delAttach.className = 'task-attach-btn';
        delAttach.style.cssText = 'color:#E53935;border-color:#FFCDD2;background:#FFEBEE;';
        delAttach.textContent = '✕ 删除附件';
        delAttach.addEventListener('click', async (e) => {
          e.stopPropagation();
          t.attachment = null;
          await saveData();
          renderTasks();
        });
        attachActions.appendChild(delAttach);

        // 保存到相册
        const saveToAlbum = document.createElement('button');
        saveToAlbum.className = 'task-attach-btn';
        saveToAlbum.style.cssText = 'color:#1976D2;border-color:#BBDEFB;background:#E3F2FD;';
        saveToAlbum.textContent = '💾 存到相册';
        saveToAlbum.addEventListener('click', async (e) => {
          e.stopPropagation();
          const b64 = await window.api.readAttachment(t.attachment.path);
          if (!b64) return;
          const mime = t.attachment.type || 'image/png';
          const dataUrl = 'data:' + mime + ';base64,' + b64;
          if (mime.startsWith('image/')) {
            // 创建下载链接
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = t.attachment.originalName || 'photo.jpg';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            alert('已保存到相册！');
          } else if (mime.startsWith('video/')) {
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = t.attachment.originalName || 'video.mp4';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            alert('已保存到相册！');
          }
        });
        attachActions.appendChild(saveToAlbum);
        body.appendChild(attachActions);
      }

      // 附件缩略图（图片）
      if (t.attachment && t.attachment.type && t.attachment.type.startsWith('image/')) {
        loadAttachmentThumb(t.attachment.path).then(src => {
          if (src) {
            const img = document.createElement('img');
            img.className = 'attach-thumb';
            img.src = src;
            img.addEventListener('click', () => openAttachModal(t.attachment));
            body.appendChild(img);
          }
        });
      } else if (t.attachment && t.attachment.type && t.attachment.type.startsWith('video/')) {
        const badge = document.createElement('div');
        badge.className = 'attach-thumb';
        badge.style.display = 'flex';
        badge.style.alignItems = 'center';
        badge.style.justifyContent = 'center';
        badge.style.background = '#000';
        badge.style.color = '#fff';
        badge.style.fontSize = '24px';
        badge.textContent = '🎬';
        badge.style.cursor = 'pointer';
        badge.addEventListener('click', () => openAttachModal(t.attachment));
        body.appendChild(badge);
      }

      const actions = document.createElement('div');
      actions.className = 'task-actions';
      const del = document.createElement('button');
      del.className = 'task-del';
      del.textContent = '🗑';
      del.title = '删除任务';
      del.addEventListener('click', async () => {
        state.data.tasks[ds].splice(i, 1);
        if (state.data.tasks[ds].length === 0) delete state.data.tasks[ds];
        await saveData();
        renderTasks();
        renderCalendar();
        await checkAchievement(ds);
        renderMelody();
      });
      actions.appendChild(del);

      item.appendChild(check);
      item.appendChild(body);
      item.appendChild(actions);
      list.appendChild(item);
    });
  }

  // 进度
  const done = tasks.filter(t => t.done).length;
  const pct = tasks.length === 0 ? 0 : Math.round(done / tasks.length * 100);
  $('#progressText').textContent = `${pct}%`;
  $('#progressFill').style.width = pct + '%';
}

// ===== 附件处理 =====
async function onAttachment(task, btn) {
  if (task.attachment) {
    // 已有附件，直接打开预览
    openAttachModal(task.attachment);
    return;
  }
  // 触发文件选择
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*,video/*';
  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;
    const buf = await file.arrayBuffer();
    const result = await window.api.saveAttachment(file.name, buf);
    task.attachment = { path: result.path, name: result.name, type: file.type, originalName: file.name };
    await saveData();
    renderTasks();
  });
  input.click();
}

async function loadAttachmentThumb(filePath) {
  const b64 = await window.api.readAttachment(filePath);
  if (!b64) return null;
  return 'data:image/png;base64,' + b64;
}

async function openAttachModal(attachment) {
  $('#attachTitle').textContent = attachment.originalName || attachment.name;
  const stage = $('#mediaStage');
  stage.innerHTML = '';
  const b64 = await window.api.readAttachment(attachment.path);
  if (!b64) {
    stage.innerHTML = '<p style="color:#fff;">附件读取失败</p>';
  } else if (attachment.type && attachment.type.startsWith('image/')) {
    const img = document.createElement('img');
    img.src = 'data:image/png;base64,' + b64;
    stage.appendChild(img);
  } else if (attachment.type && attachment.type.startsWith('video/')) {
    const video = document.createElement('video');
    video.controls = true;
    video.src = 'data:video/mp4;base64,' + b64;
    stage.appendChild(video);
  } else {
    stage.innerHTML = '<p style="color:#fff;">不支持的附件类型</p>';
  }
  // 绑定"用系统程序打开"
  const oae = $('#openAttachExternal');
  if (oae) oae.onclick = () => window.api.openAttachment(attachment.path);
  $('#attachModal').classList.add('show');
}

// ===== 达标判定 =====
async function checkAchievement(ds) {
  const tasks = state.data.tasks[ds] || [];
  if (tasks.length === 0) {
    delete state.data.achievements[ds];
    await saveData();
    return;
  }
  const done = tasks.filter(t => t.done).length;
  const ratio = done / tasks.length;
  const wasAchieved = state.data.achievements[ds] === true;
  if (ratio >= ACHIEVE_THRESHOLD) {
    state.data.achievements[ds] = true;
    await saveData();
    if (!wasAchieved) {
      // 触发庆祝动画
      playCelebrate();
    }
  } else {
    delete state.data.achievements[ds];
    await saveData();
  }
}

// ===== 美乐蒂渲染 =====
function renderMelody() {
  const ds = state.selectedDate;
  const tasks = state.data.tasks[ds] || [];
  const achieved = state.data.achievements[ds] === true;
  const stage = $('#melodyStage');
  const bubble = $('#melodyBubble');

  if (tasks.length === 0) {
    // 没任务：默认开心但提示
    stage.innerHTML = window.Melody.melodySVG('happy');
    bubble.textContent = '含含，先添加今天的学习计划吧！';
  } else if (achieved) {
    stage.innerHTML = window.Melody.melodySVG('happy');
    bubble.textContent = '谢谢含含！今天你真棒！';
  } else {
    stage.innerHTML = window.Melody.melodySVG('sad');
    bubble.textContent = '含含，你要加油噢！';
  }

  // 状态条
  const done = tasks.filter(t => t.done).length;
  const ratio = tasks.length === 0 ? 0 : done / tasks.length;
  const satiety = Math.round(ratio * 100);
  const clean = achieved ? 100 : Math.round(ratio * 80);
  $('#satietyBar').style.width = satiety + '%';
  $('#satietyText').textContent = satiety + '%';
  $('#cleanBar').style.width = clean + '%';
  $('#cleanText').textContent = clean + '%';

  // 统计
  const today = todayStr();
  let streak = 0;
  const d = new Date();
  while (true) {
    const ds2 = fmtDate(d.getFullYear(), d.getMonth(), d.getDate());
    if (state.data.achievements[ds2]) streak++;
    else break;
    d.setDate(d.getDate() - 1);
    if (streak > 365) break;
  }
  $('#streakDays').textContent = streak;
  $('#totalDays').textContent = Object.keys(state.data.achievements).length;
}

// ===== 庆祝动画 =====
function playCelebrate() {
  const overlay = $('#celebrateOverlay');
  overlay.innerHTML = `
    <div class="celebrate-scene">
      <div class="celebrate-step active" data-step="eat">
        <span class="big-emoji">🍚</span>
        <p>美乐蒂饱餐一顿！</p>
      </div>
      <div class="celebrate-step" data-step="bath" style="display:none;">
        <span class="big-emoji">🛁</span>
        <p>洗个香喷喷的澡！</p>
      </div>
      <div class="celebrate-step" data-step="done" style="display:none;">
        <span class="big-emoji">💕</span>
        <p>谢谢含含！今天你真棒！</p>
      </div>
    </div>
  `;
  overlay.classList.add('show');
  const steps = overlay.querySelectorAll('.celebrate-step');
  let i = 0;
  const show = () => {
    steps.forEach(s => s.classList.remove('active'));
    if (i < steps.length) {
      steps[i].classList.add('active');
      i++;
      setTimeout(show, 1300);
    } else {
      setTimeout(() => overlay.classList.remove('show'), 800);
    }
  };
  setTimeout(show, 100);
}

// ===== 模板 =====
function renderTemplates() {
  const list = $('#templateList');
  list.innerHTML = '';
  if (state.data.templates.length === 0) {
    list.innerHTML = '<p style="color:var(--text-muted);font-size:13px;text-align:center;padding:10px;">还没有模板，先添加一些常用任务吧</p>';
    return;
  }
  state.data.templates.forEach((t, i) => {
    const item = document.createElement('div');
    item.className = 'template-item';
    item.innerHTML = `<span>${escapeHtml(t)}</span>`;
    const del = document.createElement('button');
    del.className = 'task-del';
    del.textContent = '🗑';
    del.addEventListener('click', async () => {
      state.data.templates.splice(i, 1);
      await saveData();
      renderTemplates();
    });
    item.appendChild(del);
    list.appendChild(item);
  });
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ===== 事件绑定 =====
function bindEvents() {
  // 月份切换
  $('#prevMonth').addEventListener('click', () => {
    state.viewMonth--;
    if (state.viewMonth < 0) { state.viewMonth = 11; state.viewYear--; }
    renderCalendar();
  });
  $('#nextMonth').addEventListener('click', () => {
    state.viewMonth++;
    if (state.viewMonth > 11) { state.viewMonth = 0; state.viewYear++; }
    renderCalendar();
  });
  $('#todayBtn').addEventListener('click', () => {
    const d = new Date();
    state.viewYear = d.getFullYear();
    state.viewMonth = d.getMonth();
    state.selectedDate = todayStr();
    renderCalendar();
    renderTasks();
    renderMelody();
  });

  // 添加任务
  const addTask = async () => {
    const input = $('#taskInput');
    const v = input.value.trim();
    if (!v) return;
    const ds = state.selectedDate;
    if (!state.data.tasks[ds]) state.data.tasks[ds] = [];
    state.data.tasks[ds].push({ id: uid(), title: v, done: false, attachment: null });
    input.value = '';
    await saveData();
    renderTasks();
    renderCalendar();
    renderMelody();
  };
  $('#addTaskBtn').addEventListener('click', addTask);
  $('#taskInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') addTask(); });

  // 模板弹窗
  $('#templateBtn').addEventListener('click', () => {
    renderTemplates();
    $('#templateModal').classList.add('show');
  });
  $('#closeTemplate').addEventListener('click', () => $('#templateModal').classList.remove('show'));
  $('#addTemplateBtn').addEventListener('click', async () => {
    const v = $('#templateInput').value.trim();
    if (!v) return;
    state.data.templates.push(v);
    $('#templateInput').value = '';
    await saveData();
    renderTemplates();
  });
  $('#applyTemplateBtn').addEventListener('click', async () => {
    const ds = state.selectedDate;
    if (!state.data.tasks[ds]) state.data.tasks[ds] = [];
    state.data.templates.forEach(t => {
      // 避免重复添加
      if (!state.data.tasks[ds].some(x => x.title === t)) {
        state.data.tasks[ds].push({ id: uid(), title: t, done: false, attachment: null });
      }
    });
    await saveData();
    $('#templateModal').classList.remove('show');
    renderTasks();
    renderCalendar();
    renderMelody();
  });

  // 一键带入今天
  $('#useTemplateBtn').addEventListener('click', async () => {
    if (state.data.templates.length === 0) {
      // 没模板就打开模板弹窗
      renderTemplates();
      $('#templateModal').classList.add('show');
      return;
    }
    state.selectedDate = todayStr();
    const ds = state.selectedDate;
    if (!state.data.tasks[ds]) state.data.tasks[ds] = [];
    state.data.templates.forEach(t => {
      if (!state.data.tasks[ds].some(x => x.title === t)) {
        state.data.tasks[ds].push({ id: uid(), title: t, done: false, attachment: null });
      }
    });
    await saveData();
    renderCalendar();
    renderTasks();
    renderMelody();
  });

  // 附件弹窗关闭
  $('#closeAttach').addEventListener('click', () => $('#attachModal').classList.remove('show'));

  // 点击遮罩关闭
  [$('#templateModal'), $('#attachModal'), $('#syncModal')].forEach(m => {
    m.addEventListener('click', (e) => { if (e.target === m) m.classList.remove('show'); });
  });

  // 同步设置
  $('#syncBtn').addEventListener('click', () => {
    if (window.api.hasToken()) {
      $('#tokenInput').value = window.api.getToken();
      $('#syncStatus').textContent = '✅ 已设置同步';
    }
    $('#syncModal').classList.add('show');
  });
  $('#closeSync').addEventListener('click', () => $('#syncModal').classList.remove('show'));
  $('#saveTokenBtn').addEventListener('click', async () => {
    const token = $('#tokenInput').value.trim();
    if (!token) return;
    window.api.setToken(token);
    $('#syncStatus').textContent = '✅ 已保存！正在同步...';
    // 立即推送当前数据
    const raw = localStorage.getItem('hanhan-data');
    if (raw) {
      await window.api.saveData(JSON.parse(raw));
    }
    $('#syncStatus').textContent = '✅ 同步成功！妈妈和孩子数据互通了';
    setTimeout(() => $('#syncModal').classList.remove('show'), 1500);
  });
  $('#howToToken').addEventListener('click', () => {
    window.open('https://github.com/settings/tokens/new?scopes=repo&description=hanhan-sync', '_blank');
  });
}

// ===== 启动 =====
(async function init() {
  await loadData();
  bindEvents();
  renderCalendar();
  renderTasks();
  renderMelody();

  // 每 30 秒自动从 GitHub 同步一次（静默）
  setInterval(async () => {
    try {
      const prevData = JSON.stringify(state.data);
      state.data = await window.api.loadData();
      if (JSON.stringify(state.data) !== prevData) {
        renderCalendar();
        renderTasks();
        renderMelody();
      }
    } catch (e) {}
  }, 30000);
})();

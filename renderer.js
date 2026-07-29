// ===== 含含开心学习 v2.0 =====
const $ = s => document.querySelector(s);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6);

let state = {
  data: null,
  viewYear: new Date().getFullYear(),
  viewMonth: new Date().getMonth(),
  selectedDate: todayStr(),
  isParent: false,
  theme: 'melody'
};

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function fmtDate(y,m,d) { return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`; }

// ===== 数据 =====
async function loadData() {
  state.data = await window.api.loadData();
  // 强制修复旧版乱码商城数据
  if (!state.data.shop || state.data.shop.length === 0 || state.data.shop[0].icon === '👑') {
    state.data.shop = [
      { id: 's1', name: '皇冠', icon: '♛', cost: 20, category: '装扮' },
      { id: 's2', name: '蝴蝶结', icon: '♡', cost: 15, category: '装扮' },
      { id: 's3', name: '墨镜', icon: '◎', cost: 10, category: '装扮' },
      { id: 's4', name: '天使翅膀', icon: '❋', cost: 30, category: '装扮' },
      { id: 's5', name: '魔法棒', icon: '★', cost: 25, category: '装扮' },
      { id: 's6', name: '小裙子', icon: '♦', cost: 35, category: '装扮' },
      { id: 's7', name: '项链', icon: '◆', cost: 12, category: '装扮' },
      { id: 's8', name: '天使光环', icon: '◎', cost: 40, category: '装扮' },
      { id: 's9', name: '贴纸包', icon: '▣', cost: 5, category: '实物' },
      { id: 's10', name: '小零食', icon: '●', cost: 8, category: '实物' },
      { id: 's11', name: '小玩具', icon: '♤', cost: 50, category: '实物' },
      { id: 's12', name: '绘本', icon: '▤', cost: 60, category: '实物' },
      { id: 's13', name: '文具套装', icon: '✎', cost: 30, category: '实物' },
    ];
    saveData();
  }
  state.theme = state.data.settings?.theme || 'melody';
  applyTheme();
}
async function saveData() { await window.api.saveData(state.data); }

// ===== 主题 =====
function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  $('#themeIcon').textContent = state.theme === 'kuromi' ? '😈' : '🎀';
  renderMascot();
}

// ===== 导航 =====
function switchTab(id) {
  $$('.tab-content').forEach(t => t.classList.remove('active'));
  $$('.nav-item').forEach(n => n.classList.remove('active'));
  $(`#${id}`).classList.add('active');
  $(`.nav-item[data-tab="${id}"]`).classList.add('active');
  if (id === 'tabShop') renderShop();
  if (id === 'tabTasks') { renderCalendar(); renderTasks(); renderMascot(); }
}

// ===== 美乐蒂/库洛米 =====
function renderMascot() {
  const panel = $('#mascotPanel');
  const ds = state.selectedDate;
  const tasks = state.data.tasks?.[ds] || [];
  const done = tasks.filter(t => t.done).length;
  const ratio = tasks.length === 0 ? 0 : done / tasks.length;
  const achieved = tasks.length > 0 && ratio >= 0.7;

  // 同步更新 achievements
  if (achieved && !state.data.achievements?.[ds]) {
    if (!state.data.achievements) state.data.achievements = {};
    state.data.achievements[ds] = true;
    saveData();
  } else if (!achieved && tasks.length > 0 && state.data.achievements?.[ds]) {
    delete state.data.achievements[ds];
    saveData();
  }

  let svgFn, name;
  if (state.theme === 'kuromi') {
    svgFn = window.Kuromi?.kuromiSVG;
    name = '库洛米';
  } else {
    svgFn = window.Melody?.melodySVG;
    name = '美乐蒂';
  }

  let svg = '';
  let bubble = '';
  if (tasks.length === 0) {
    svg = svgFn('happy');
    bubble = '先添加今天的学习计划吧！';
  } else if (achieved) {
    svg = svgFn('happy');
    bubble = '谢谢含含！今天你真棒！';
  } else {
    svg = svgFn('sad');
    bubble = '含含，你要加油噢！';
  }

  const satiety = Math.round(ratio * 100);
  const clean = achieved ? 100 : Math.round(ratio * 80);

  panel.innerHTML = `
    ${svg}
    <div style="font-size:12px;font-weight:600;color:var(--deep);margin-top:2px">${name}</div>
    <div class="stars-badge">⭐ ${state.data.stars || 0}</div>
    <div style="margin-top:8px;font-size:10px;color:var(--text2)">
      <div style="display:flex;align-items:center;gap:4px;margin:2px 0">
        <span style="width:32px;text-align:right">饱腹</span>
        <div style="flex:1;height:6px;background:var(--bg3);border-radius:3px;overflow:hidden"><div style="height:100%;width:${satiety}%;background:linear-gradient(90deg,#FFD54F,#FF9800);border-radius:3px"></div></div>
        <span style="width:28px;font-weight:700">${satiety}%</span>
      </div>
      <div style="display:flex;align-items:center;gap:4px;margin:2px 0">
        <span style="width:32px;text-align:right">清洁</span>
        <div style="flex:1;height:6px;background:var(--bg3);border-radius:3px;overflow:hidden"><div style="height:100%;width:${clean}%;background:linear-gradient(90deg,#81D4FA,#29B6F6);border-radius:3px"></div></div>
        <span style="width:28px;font-weight:700">${clean}%</span>
      </div>
    </div>
    <div style="background:white;border:1px solid var(--bg3);border-radius:8px;padding:4px 6px;font-size:10px;color:var(--deep);margin-top:6px;position:relative">${bubble}</div>
  `;
}

// ===== 日历 =====
function renderCalendar() {
  const y = state.viewYear, m = state.viewMonth;
  $('#monthLabel').textContent = `${y}年${m+1}月`;
  const first = new Date(y,m,1), startDay = first.getDay();
  const daysInMonth = new Date(y,m+1,0).getDate();
  const prevDays = new Date(y,m,0).getDate();
  const grid = $('#calendarGrid'); grid.innerHTML = '';

  for (let i = startDay-1; i >= 0; i--) {
    const d = prevDays - i;
    grid.appendChild(makeDayCell(y, m-1, d, true));
  }
  for (let d = 1; d <= daysInMonth; d++) {
    grid.appendChild(makeDayCell(y, m, d, false));
  }
  const total = startDay + daysInMonth;
  const tail = (7 - (total % 7)) % 7;
  for (let d = 1; d <= tail; d++) {
    grid.appendChild(makeDayCell(y, m+1, d, true));
  }
}

function makeDayCell(y,m,d,otherMonth) {
  let yy=y,mm=m; if(mm<0){yy--;mm=11;} if(mm>11){yy++;mm=0;}
  const ds = fmtDate(yy,mm,d);
  const cell = document.createElement('div');
  cell.className = 'cal-day';
  if(otherMonth) cell.classList.add('other-month');
  if(ds === todayStr()) cell.classList.add('today');
  if(ds === state.selectedDate) cell.classList.add('selected');
  if(state.data.tasks?.[ds]?.length > 0) cell.classList.add('has-task');
  cell.textContent = d;
  cell.addEventListener('click', () => {
    state.selectedDate = ds;
    renderCalendar(); renderTasks(); renderMascot();
  });
  return cell;
}

// ===== 任务 =====
function renderTasks() {
  const ds = state.selectedDate;
  const [y,m,d] = ds.split('-').map(Number);
  const wd = ['周日','周一','周二','周三','周四','周五','周六'][new Date(y,m-1,d).getDay()];
  $('#selectedDateLabel').textContent = `${m}月${d}日 ${wd}`;

  // 家长模式显示添加行
  $('#taskAddRow').style.display = state.isParent ? 'flex' : 'none';

  const tasks = state.data.tasks?.[ds] || [];
  const list = $('#taskList'); list.innerHTML = '';
  const empty = $('#taskEmpty');

  if (tasks.length === 0) {
    empty.classList.add('show');
  } else {
    empty.classList.remove('show');
    tasks.forEach((t, i) => {
      const item = document.createElement('div');
      item.className = 'task-item' + (t.done ? ' done' : '');

      const body = document.createElement('div');
      body.className = 'task-body';

      const title = document.createElement('div');
      title.className = 'task-title';
      title.textContent = (t.done ? '✅ ' : '') + t.title;
      body.appendChild(title);

      const meta = document.createElement('div');
      meta.className = 'task-meta';
      meta.innerHTML = `<span class="task-stars">⭐${t.stars || 1}</span>`;
      body.appendChild(meta);

      // 上传附件按钮
      const attachBtn = document.createElement('button');
      attachBtn.className = 'task-attach-btn';
      if (t.attachment) attachBtn.classList.add('has-file');
      attachBtn.innerHTML = t.attachment ? '📎 查看附件' : '📷 上传';
      attachBtn.addEventListener('click', () => onAttachment(t));
      body.appendChild(attachBtn);

      // 已上传时显示操作按钮
      if (t.attachment) {
        const actRow = document.createElement('span');
        actRow.style.cssText = 'display:inline-flex;gap:3px;margin-top:2px';

        const delA = document.createElement('button');
        delA.className = 'task-attach-btn';
        delA.style.cssText = 'color:#E53935;border-color:#FFCDD2;background:#FFEBEE';
        delA.textContent = '✕ 删除';
        delA.addEventListener('click', async e => {
          e.stopPropagation(); t.attachment = null;
          if (!t.done) { t.done = true; state.data.stars = (state.data.stars||0) + (t.stars||1); }
          await saveData(); renderTasks(); renderMascot(); renderCalendar();
        });
        actRow.appendChild(delA);

        const saveA = document.createElement('button');
        saveA.className = 'task-attach-btn';
        saveA.style.cssText = 'color:#1976D2;border-color:#BBDEFB;background:#E3F2FD';
        saveA.textContent = '💾 保存';
        saveA.addEventListener('click', async e => {
          e.stopPropagation();
          const b64 = await window.api.readAttachment(t.attachment.path);
          if (!b64) return;
          const a = document.createElement('a');
          a.href = 'data:'+(t.attachment.type||'image/png')+';base64,'+b64;
          a.download = t.attachment.originalName || 'file';
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
        });
        actRow.appendChild(saveA);
        body.appendChild(actRow);
      }

      // 删除任务
      const del = document.createElement('button');
      del.className = 'task-del'; del.textContent = '🗑';
      del.title = '删除任务';
      if (state.isParent) {
        del.addEventListener('click', async () => {
          state.data.tasks[ds].splice(i,1);
          if (state.data.tasks[ds].length === 0) delete state.data.tasks[ds];
          await saveData(); renderTasks(); renderCalendar(); renderMascot();
        });
      } else {
        del.style.opacity = '0.3';
      }

      item.appendChild(body);
      item.appendChild(del);
      list.appendChild(item);
    });
  }
}

// ===== 附件处理 =====
async function onAttachment(task) {
  if (task.attachment) {
    openAttachModal(task.attachment);
    return;
  }
  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/*,video/*';
  input.addEventListener('change', async () => {
    const file = input.files[0]; if (!file) return;
    const buf = await file.arrayBuffer();
    const result = await window.api.saveAttachment(file.name, buf);
    task.attachment = { path: result.path, name: result.name, type: file.type, originalName: file.name };
    // 上传即自动完成
    if (!task.done) {
      task.done = true;
      state.data.stars = (state.data.stars||0) + (task.stars||1);
    }
    await saveData(); renderTasks(); renderMascot(); renderCalendar();
  });
  input.click();
}

async function openAttachModal(att) {
  $('#attachTitle').textContent = att.originalName || att.name;
  const stage = $('#mediaStage'); stage.innerHTML = '';
  const b64 = await window.api.readAttachment(att.path);
  if (!b64) { stage.innerHTML = '<p style="color:#fff">读取失败</p>'; }
  else if (att.type?.startsWith('image/')) {
    const img = document.createElement('img'); img.src = 'data:image/png;base64,'+b64;
    img.style.cssText = 'max-width:100%;max-height:50vh'; stage.appendChild(img);
  } else if (att.type?.startsWith('video/')) {
    const v = document.createElement('video'); v.controls = true;
    v.src = 'data:video/mp4;base64,'+b64; v.style.maxWidth='100%'; stage.appendChild(v);
  }
  $('#attachModal').classList.add('show');
}

// ===== 星星商城 =====
function renderShop() {
  // 修复旧数据没有 shop 的情况
  if (!state.data.shop || state.data.shop.length === 0) {
    state.data.shop = [
      { id: 's1', name: '皇冠', icon: '♛', cost: 20, category: '装扮' },
      { id: 's2', name: '蝴蝶结', icon: '♡', cost: 15, category: '装扮' },
      { id: 's3', name: '墨镜', icon: '◎', cost: 10, category: '装扮' },
      { id: 's4', name: '天使翅膀', icon: '❋', cost: 30, category: '装扮' },
      { id: 's5', name: '魔法棒', icon: '★', cost: 25, category: '装扮' },
      { id: 's6', name: '小裙子', icon: '♦', cost: 35, category: '装扮' },
      { id: 's7', name: '项链', icon: '◆', cost: 12, category: '装扮' },
      { id: 's8', name: '天使光环', icon: '◎', cost: 40, category: '装扮' },
      { id: 's9', name: '贴纸包', icon: '▣', cost: 5, category: '实物' },
      { id: 's10', name: '小零食', icon: '●', cost: 8, category: '实物' },
      { id: 's11', name: '小玩具', icon: '♤', cost: 50, category: '实物' },
      { id: 's12', name: '绘本', icon: '▤', cost: 60, category: '实物' },
      { id: 's13', name: '文具套装', icon: '✎', cost: 30, category: '实物' },
    ];
    saveData();
  }
  $('#shopStarCount').textContent = state.data.stars || 0;
  const grid = $('#shopGrid'); grid.innerHTML = '';

  (state.data.shop || []).forEach(item => {
    const purchased = (state.data.purchases || []).some(p => p.id === item.id);
    const card = document.createElement('div');
    card.className = 'shop-item' + (purchased ? ' purchased' : '');

    card.innerHTML = `
      <span class="si">${item.icon}</span>
      <div class="sn">${item.name}</div>
      <div class="sc">⭐ ${item.cost}</div>
      <button class="buy-btn" ${purchased ? 'disabled' : ''}>${purchased ? '已兑换' : '兑换'}</button>
    `;

    if (!purchased) {
      card.querySelector('.buy-btn').addEventListener('click', async () => {
        if ((state.data.stars||0) < item.cost) {
          alert('星星不够哦！还需要 ⭐' + (item.cost - (state.data.stars||0)) + ' 颗');
          return;
        }
        state.data.stars -= item.cost;
        if (!state.data.purchases) state.data.purchases = [];
        state.data.purchases.push({ id: item.id, name: item.name, date: todayStr() });
        await saveData(); renderShop(); renderMascot();
      });
    }

    // 家长模式下可删除
    if (state.isParent) {
      const delBtn = document.createElement('button');
      delBtn.textContent = '✕'; delBtn.style.cssText = 'background:transparent;border:none;color:#E53935;font-size:14px;cursor:pointer;position:absolute;top:2px;right:4px';
      delBtn.addEventListener('click', async e => {
        e.stopPropagation();
        state.data.shop = state.data.shop.filter(s => s.id !== item.id);
        await saveData(); renderShop();
      });
      card.style.position = 'relative';
      card.appendChild(delBtn);
    }

    grid.appendChild(card);
  });

  // 家长工具
  $('#parentTools').classList.toggle('show', state.isParent);
}

// ===== 家长模式 =====
function toggleParent() {
  if (state.isParent) {
    state.isParent = false;
    $('#parentBtn').textContent = '🔒';
    renderTasks(); renderShop();
    return;
  }
  $('#parentModal').classList.add('show');
  $('#parentPassword').value = '';
  $('#parentMsg').textContent = '';
}

// ===== 事件绑定 =====
function bindEvents() {
  // 导航
  $$('.nav-item').forEach(n => {
    n.addEventListener('click', () => switchTab(n.dataset.tab));
  });

  // 日历切换
  $('#prevMonth').addEventListener('click', () => {
    state.viewMonth--; if(state.viewMonth<0){state.viewMonth=11;state.viewYear--;} renderCalendar();
  });
  $('#nextMonth').addEventListener('click', () => {
    state.viewMonth++; if(state.viewMonth>11){state.viewMonth=0;state.viewYear++;} renderCalendar();
  });

  // 添加任务
  $('#addTaskBtn').addEventListener('click', async () => {
    const v = $('#taskInput').value.trim(); if (!v) return;
    const stars = parseInt($('#starSelect').value) || 1;
    const ds = state.selectedDate;
    if (!state.data.tasks[ds]) state.data.tasks[ds] = [];
    state.data.tasks[ds].push({ id: uid(), title: v, done: false, stars, attachment: null });
    $('#taskInput').value = '';
    await saveData(); renderTasks(); renderCalendar(); renderMascot();
  });

  // 主题
  $('#themeBtn').addEventListener('click', () => $('#themeModal').classList.add('show'));
  $('#closeTheme').addEventListener('click', () => $('#themeModal').classList.remove('show'));
  $('#pickMelody').addEventListener('click', async () => {
    state.theme = 'melody'; state.data.settings.theme = 'melody';
    await saveData(); applyTheme(); renderCalendar(); renderTasks(); $('#themeModal').classList.remove('show');
  });
  $('#pickKuromi').addEventListener('click', async () => {
    state.theme = 'kuromi'; state.data.settings.theme = 'kuromi';
    await saveData(); applyTheme(); renderCalendar(); renderTasks(); $('#themeModal').classList.remove('show');
  });

  // 重置数据（用于调试）
  $('#resetDataBtn').addEventListener('click', async () => {
    if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
      localStorage.removeItem('hanhan-data');
      localStorage.removeItem('gh_sync_token');
      state.data = await window.api.loadData();
      state.isParent = false;
      $('#parentBtn').textContent = '🔒';
      renderCalendar(); renderTasks(); renderMascot(); renderShop();
      alert('数据已清空！');
    }
  });

  // 同步
  $('#syncBtn').addEventListener('click', () => {
    if (window.api.hasToken()) $('#tokenInput').value = window.api.getToken();
    $('#syncModal').classList.add('show');
  });
  $('#closeSync').addEventListener('click', () => $('#syncModal').classList.remove('show'));
  $('#saveTokenBtn').addEventListener('click', async () => {
    const t = $('#tokenInput').value.trim(); if (!t) return;
    window.api.setToken(t); $('#syncStatus').textContent = '✅ 已保存';
    await window.api.saveData(state.data);
    setTimeout(() => $('#syncModal').classList.remove('show'), 1000);
  });

  // 家长模式
  $('#parentBtn').addEventListener('click', toggleParent);
  $('#closeParent').addEventListener('click', () => $('#parentModal').classList.remove('show'));
  $('#loginParent').addEventListener('click', () => {
    const pw = $('#parentPassword').value;
    if (pw === (state.data.settings?.password || '123456')) {
      state.isParent = true;
      $('#parentBtn').textContent = '🔓';
      $('#parentModal').classList.remove('show');
      renderTasks(); renderShop();
    } else {
      $('#parentMsg').textContent = '❌ 密码错误';
    }
  });

  // 商城家长工具
  $('#addStarsBtn').addEventListener('click', async () => {
    state.data.stars = (state.data.stars||0) + parseInt($('#starDelta').value||0);
    await saveData(); renderShop(); renderMascot();
  });
  $('#subStarsBtn').addEventListener('click', async () => {
    state.data.stars = Math.max(0, (state.data.stars||0) - parseInt($('#starDelta').value||0));
    await saveData(); renderShop(); renderMascot();
  });
  $('#addShopItemBtn').addEventListener('click', async () => {
    const name = $('#newItemName').value.trim();
    const icon = $('#newItemIcon').value.trim() || '🎁';
    const cost = parseInt($('#newItemCost').value) || 10;
    const cat = $('#newItemCat').value;
    if (!name) return;
    state.data.shop.push({ id: uid(), name, icon, cost, category: cat });
    $('#newItemName').value = ''; $('#newItemIcon').value = ''; $('#newItemCost').value = '';
    await saveData(); renderShop();
  });

  // 附件弹窗关闭
  $('#closeAttach').addEventListener('click', () => $('#attachModal').classList.remove('show'));

  // 点击遮罩关闭弹窗
  ['#parentModal','#syncModal','#attachModal','#themeModal'].forEach(s => {
    $(s).addEventListener('click', e => { if(e.target === $(s)) $(s).classList.remove('show'); });
  });
}

function $$(s) { return document.querySelectorAll(s); }

// ===== 启动 =====
(async function init() {
  await loadData();
  bindEvents();
  renderCalendar();
  renderTasks();
  renderMascot();
  renderShop();

  // 30 秒自动同步
  setInterval(async () => {
    try {
      const prev = JSON.stringify(state.data);
      state.data = await window.api.loadData();
      if (JSON.stringify(state.data) !== prev) {
        renderCalendar(); renderTasks(); renderMascot();
      }
    } catch(e) {}
  }, 30000);
})();

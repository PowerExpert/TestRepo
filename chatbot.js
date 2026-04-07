(function () {
  // ─── Styles ───────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

    #chat-fab {
      position: fixed; bottom: 28px; right: 28px; width: 64px; height: 64px;
      border-radius: 50%; background: #fb923c; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      z-index: 9999; transition: transform 0.2s;
      animation: pulse-glow 2s ease-in-out infinite;
    }
    #chat-fab:hover { transform: scale(1.08); background: #f97316; }
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 4px 28px rgba(251,146,60,0.6); }
      50% { box-shadow: 0 0 40px 8px rgba(251,146,60,0.95); }
    }
    #chat-window {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(10,12,22,0.97); border: none;
      border-radius: 0; display: flex; flex-direction: column; z-index: 9998;
      backdrop-filter: blur(16px); overflow: hidden;
      font-family: 'Inter', sans-serif;
    }
    #chat-header {
      padding: 18px 24px; border-bottom: 1px solid rgba(251,146,60,0.15);
      display: flex; align-items: center; justify-content: space-between;
    }
    .chat-header-left { display: flex; align-items: center; gap: 10px; }
    .chat-dot { width: 8px; height: 8px; border-radius: 50%; background: #fb923c; }
    .chat-title { color: #f1f0ee; font-size: 15px; font-weight: 600; letter-spacing: 0.01em; }
    .chat-sub { color: rgba(241,240,238,0.4); font-size: 12px; font-weight: 400; margin-top: 2px; }
    #chat-close { background: none; border: none; cursor: pointer; color: rgba(241,240,238,0.4); font-size: 20px; line-height: 1; padding: 4px 8px; border-radius: 6px; transition: color 0.2s; }
    #chat-close:hover { color: #fb923c; }
    #chat-messages {
      flex: 1; overflow-y: auto; padding: 24px;
      display: flex; flex-direction: column; gap: 12px; max-height: 100%;
    }
    #chat-messages::-webkit-scrollbar { width: 4px; }
    #chat-messages::-webkit-scrollbar-track { background: transparent; }
    #chat-messages::-webkit-scrollbar-thumb { background: rgba(251,146,60,0.3); border-radius: 4px; }
    .msg {
      max-width: 680px; padding: 11px 15px; border-radius: 14px;
      font-size: 14px; line-height: 1.65; font-family: 'Inter', sans-serif;
      letter-spacing: 0.01em;
    }
    .msg.bot {
      background: rgba(251,146,60,0.1); color: #f1e8d8;
      align-self: flex-start; border: 1px solid rgba(251,146,60,0.18);
      border-bottom-left-radius: 4px;
    }
    .msg.user {
      background: rgba(251,146,60,0.22); color: #fff8f0;
      align-self: flex-end; border-bottom-right-radius: 4px;
    }
    #chat-input-row {
      padding: 16px 24px; border-top: 1px solid rgba(251,146,60,0.15);
      display: flex; gap: 10px; align-items: center;
    }
    #chat-input {
      flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(251,146,60,0.2);
      border-radius: 10px; padding: 13px 16px; color: #f1f0ee;
      font-size: 14px; font-family: 'Inter', sans-serif; outline: none;
      transition: border-color 0.2s;
    }
    #chat-input::placeholder { color: rgba(241,240,238,0.3); }
    #chat-input:focus { border-color: rgba(251,146,60,0.5); }
    #chat-send {
      background: #fb923c; border: none; border-radius: 10px;
      width: 46px; height: 46px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.2s;
    }
    #chat-send:hover { background: #f97316; }
    #chat-send:disabled { background: rgba(251,146,60,0.3); cursor: not-allowed; }
  `;
  document.head.appendChild(style);

  // ─── HTML ─────────────────────────────────────────────────
  document.body.insertAdjacentHTML('beforeend', `
    <div id="chat-window">
      <div id="chat-header">
        <div class="chat-header-left">
          <div class="chat-dot"></div>
          <div>
            <div class="chat-title">Чистый Воздух</div>
            <div class="chat-sub">Ассистент по качеству воздуха</div>
          </div>
        </div>
        <button id="chat-close">✕</button>
      </div>
      <div id="chat-messages">
        <div class="msg bot">Привет! Я могу рассказать о качестве воздуха в Алматы, объяснить показатели AQI, PM2.5, NO₂ и дать рекомендации. Спрашивайте!</div>
      </div>
      <div id="chat-input-row">
        <input id="chat-input" placeholder="Спросите о воздухе в Алматы..." />
        <button id="chat-send">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  `);

  // ─── Logic ────────────────────────────────────────────────
  const win = document.getElementById('chat-window');
  const closeBtn = document.getElementById('chat-close');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const msgList = document.getElementById('chat-messages');
  const history = [];

  input.focus();
  closeBtn.addEventListener('click', () => win.style.display = 'none');
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); send(); } });
  sendBtn.addEventListener('click', send);

  function addMsg(text, role) {
    const el = document.createElement('div');
    el.className = 'msg ' + (role === 'user' ? 'user' : 'bot');
    el.textContent = text;
    msgList.appendChild(el);
    msgList.scrollTop = msgList.scrollHeight;
    return el;
  }

  async function send() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendBtn.disabled = true;
    addMsg(text, 'user');
    history.push({ role: 'user', content: text }); m 
    const typing = addMsg('...', 'bot');

    try {
      const res = await fetch('https://api.cohere.com/v2/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer EJawcjMYSHzOeMumAPLsOVWRNyj5b423yYG0zm8B'
        },
        body: JSON.stringify({
          model: 'command-a-03-2025',
          messages: [
            { role: 'system', content: `You are an assistant for "Chisty Vozdukh" (Clean Air) — an air quality monitoring website for Almaty, Kazakhstan. Always respond in Russian. Keep answers short and helpful. Topics: AQI, PM2.5, NO2, air quality recommendations.` },
            ...history
          ]
        })
      });
      const data = await res.json();
      const reply = data.message?.content?.[0]?.text || 'Нет ответа.';
      typing.remove();
      addMsg(reply, 'bot');
      history.push({ role: 'assistant', content: reply });
    } catch {
      typing.remove();
      addMsg('Ошибка соединения. Попробуйте позже.', 'bot');
    }
    sendBtn.disabled = false;
  }
})();
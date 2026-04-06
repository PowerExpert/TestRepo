(function () {
  // ─── Styles ───────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

    #chat-fab {
      position: fixed; bottom: 28px; right: 28px; width: 64px; height: 64px;
      border-radius: 50%; background: #6100cf; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      z-index: 9999; transition: transform 0.2s;
      animation: pulse-glow 2s ease-in-out infinite;
      font-family: 'Inter', sans-serif;
    }
    #chat-fab:hover { transform: scale(1.08); background: #7a00ff; }
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 4px 28px #48009b; }
      50% { box-shadow: 0 0 40px 8px #6100cf; }
    }
    #chat-window {
      position: fixed; bottom: 100px; right: 28px; width: 620px; max-height: 600px;
      background: rgba(10,12,22,0.97); border: 1px solid #6100cf;
      border-radius: 16px; display: none; flex-direction: column; z-index: 9998;
      backdrop-filter: blur(16px); overflow: hidden;
      box-shadow: 0 8px 40px rgba(0,0,0,0.5);
      font-family: 'Inter', sans-serif;
    }
    #chat-window.open { display: flex; }
    #chat-header {
      padding: 14px 16px; border-bottom: 1px solid rgba(97,0,207,0.4);
      display: flex; align-items: center; justify-content: space-between;
    }
    .chat-header-left { display: flex; align-items: center; gap: 10px; }
    .chat-dot { width: 8px; height: 8px; border-radius: 50%; background: #6100cf; }
    .chat-title { color: #f1f0ee; font-size: 14px; font-weight: 600; letter-spacing: 0.01em; }
    .chat-sub { color: rgba(241,240,238,0.4); font-size: 11px; font-weight: 400; margin-top: 2px; }
    #chat-close { background: none; border: none; cursor: pointer; color: rgba(241,240,238,0.4); font-size: 18px; padding: 4px 8px; border-radius: 6px; transition: color 0.2s; }
    #chat-close:hover { color: #6100cf; }
    #chat-messages {
      flex: 1; overflow-y: auto; padding: 14px;
      display: flex; flex-direction: column; gap: 10px; max-height: 440px;
    }
    #chat-messages::-webkit-scrollbar { width: 4px; }
    #chat-messages::-webkit-scrollbar-track { background: transparent; }
    #chat-messages::-webkit-scrollbar-thumb { background: rgba(97,0,207,0.4); border-radius: 4px; }
    .msg {
      max-width: 88%; padding: 10px 13px; border-radius: 12px;
      font-size: 13.5px; line-height: 1.6; font-family: 'Inter', sans-serif;
      letter-spacing: 0.01em;
    }
    .msg.bot {
      background: rgba(97,0,207,0.15); color: #ede8f5;
      align-self: flex-start; border: 1px solid rgba(97,0,207,0.35);
      border-bottom-left-radius: 4px;
    }
    .msg.user {
      background: rgba(97,0,207,0.35); color: #fff;
      align-self: flex-end; border-bottom-right-radius: 4px;
    }
    #chat-input-row {
      padding: 10px 12px; border-top: 1px solid rgba(97,0,207,0.3);
      display: flex; gap: 8px; align-items: center;
    }
    #chat-input {
      flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(97,0,207,0.35);
      border-radius: 8px; padding: 12px 14px; color: #f1f0ee;
      font-size: 14px; font-family: 'Inter', sans-serif; outline: none;
      transition: border-color 0.2s;
    }
    #chat-input::placeholder { color: rgba(241,240,238,0.3); }
    #chat-input:focus { border-color: rgba(97,0,207,0.7); }
    #chat-send {
      background: #6100cf; border: none; border-radius: 8px;
      width: 42px; height: 42px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.2s;
    }
    #chat-send:hover { background: #7a00ff; }
    #chat-send:disabled { background: rgba(97,0,207,0.3); cursor: not-allowed; }
  `;
  document.head.appendChild(style);

  // ─── HTML ─────────────────────────────────────────────────
  document.body.insertAdjacentHTML('beforeend', `
    <button id="chat-fab" title="Ask about medicine">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </button>
    <div id="chat-window">
      <div id="chat-header">
        <div class="chat-header-left">
          <div class="chat-dot"></div>
          <div>
            <div class="chat-title">MediAssist</div>
            <div class="chat-sub">Your medical information assistant</div>
          </div>
        </div>
        <button id="chat-close">✕</button>
      </div>
      <div id="chat-messages">
        <div class="msg bot">Hello! I'm MediAssist — I can answer questions about symptoms, medications, treatments, and general health advice. Ask me anything! (I also understand other languages — just ask in yours.)</div>
      </div>
      <div id="chat-input-row">
        <input id="chat-input" placeholder="Ask a medical question..." />
        <button id="chat-send">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  `);

  // ─── Logic ────────────────────────────────────────────────
  const fab = document.getElementById('chat-fab');
  const win = document.getElementById('chat-window');
  const closeBtn = document.getElementById('chat-close');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const msgList = document.getElementById('chat-messages');
  const history = [];

  fab.addEventListener('click', () => { win.classList.toggle('open'); if (win.classList.contains('open')) input.focus(); });
  closeBtn.addEventListener('click', () => win.classList.remove('open'));
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
    history.push({ role: 'user', content: text });
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
            {
              role: 'system',
              content: `You are MediAssist, a knowledgeable and friendly medical information assistant. Your role is to help users understand medical topics including symptoms, diseases, medications, treatments, anatomy, nutrition, mental health, and general wellness.

Rules:
- Default language is English.
- IMPORTANT: Detect the language of the user's message and always respond in that same language.
- Be clear, accurate, and easy to understand. Avoid excessive jargon.
- Always remind users to consult a real doctor for personal medical decisions.
- Never diagnose. You provide information, not diagnoses.
- Keep responses concise but complete.`
            },
            ...history
          ]
        })
      });
      const data = await res.json();
      const reply = data.message?.content?.[0]?.text || 'No response received.';
      typing.remove();
      addMsg(reply, 'bot');
      history.push({ role: 'assistant', content: reply });
    } catch {
      typing.remove();
      addMsg('Connection error. Please try again later.', 'bot');
    }
    sendBtn.disabled = false;
  }

  // ─── Tooltip ─────────────────────────────────────────────
  const tipStyle = document.createElement('style');
  tipStyle.textContent = `
    #chat-tip {
      position: fixed; bottom: 38px; right: 100px;
      background: rgba(10,12,22,0.95); border: 1px solid rgba(97,0,207,0.5);
      border-radius: 12px; padding: 10px 14px; z-index: 9997;
      color: #ede8f5; font-size: 13px; font-family: 'Inter', sans-serif;
      white-space: nowrap; pointer-events: none;
      animation: tip-in 0.4s ease forwards;
    }
    #chat-tip span { color: #a855f7; font-weight: 600; }
    #chat-tip::after {
      content: ''; position: absolute; right: -8px; top: 50%;
      transform: translateY(-50%);
      border: 8px solid transparent;
      border-left-color: rgba(97,0,207,0.5);
      border-right: none;
    }
    @keyframes tip-in {
      from { opacity: 0; transform: translateX(-10px); }
      to   { opacity: 1; transform: translateX(0); }
    }
  `;
  document.head.appendChild(tipStyle);

  const tip = document.createElement('div');
  tip.id = 'chat-tip';
  tip.innerHTML = 'Try our AI medical assistant!';
  document.body.appendChild(tip);

  setTimeout(() => {
    if (tip.parentNode) tip.remove();
  }, 5000);

  fab.addEventListener('click', () => {
    if (tip.parentNode) tip.remove();
  });
})();
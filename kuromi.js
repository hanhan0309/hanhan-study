// 库洛米 SVG 生成器 — 紫色小恶魔风格
// 和 melody.js 保持相同的 API：kuromiSVG(state)

function kuromiSVG(state = 'happy') {
  const happy = `
    <!-- 身体 -->
    <ellipse cx="200" cy="340" rx="90" ry="75" fill="#2D2D3F" stroke="#1A1A2E" stroke-width="3"/>
    <!-- 头 -->
    <ellipse cx="200" cy="210" rx="105" ry="95" fill="#3D3D5C" stroke="#1A1A2E" stroke-width="3"/>
    <!-- 左耳（尖） -->
    <path d="M 130 140 L 100 60 L 155 80 Z" fill="#2D2D3F" stroke="#1A1A2E" stroke-width="3"/>
    <!-- 右耳（尖） -->
    <path d="M 270 140 L 300 60 L 245 80 Z" fill="#2D2D3F" stroke="#1A1A2E" stroke-width="3"/>
    <!-- 紫色小恶魔帽 -->
    <path d="M 120 130 Q 200 40 280 130 Q 295 150 270 160 Q 200 135 130 160 Q 105 150 120 130 Z" fill="#9C27B0" stroke="#7B1FA2" stroke-width="3"/>
    <!-- 帽尖 -->
    <circle cx="200" cy="48" r="8" fill="#CE93D8"/>
    <!-- 粉色骷髅头装饰 -->
    <g transform="translate(200, 100)">
      <ellipse cx="0" cy="0" rx="14" ry="12" fill="#FF80AB"/>
      <ellipse cx="-5" cy="-3" rx="3" ry="4" fill="#1A1A2E"/>
      <ellipse cx="5" cy="-3" rx="3" ry="4" fill="#1A1A2E"/>
      <path d="M -4 4 L 0 6 L 4 4 L 0 7 Z" fill="#1A1A2E"/>
    </g>
    <!-- 眼睛（开心弯月） -->
    <path d="M 168 200 Q 180 185 193 200" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
    <path d="M 207 200 Q 220 185 232 200" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
    <!-- 腮红（紫色调） -->
    <ellipse cx="160" cy="230" rx="14" ry="8" fill="#CE93D8" opacity="0.6"/>
    <ellipse cx="240" cy="230" rx="14" ry="8" fill="#CE93D8" opacity="0.6"/>
    <!-- 嘴巴（微笑） -->
    <path d="M 188 240 Q 200 252 212 240" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
    <!-- 小爪子 -->
    <ellipse cx="152" cy="410" rx="20" ry="13" fill="#3D3D5C" stroke="#1A1A2E" stroke-width="2.5"/>
    <ellipse cx="248" cy="410" rx="20" ry="13" fill="#3D3D5C" stroke="#1A1A2E" stroke-width="2.5"/>
    <!-- 尾巴（小恶魔尖尾） -->
    <path d="M 280 380 Q 320 370 330 400 Q 340 420 350 410" fill="none" stroke="#9C27B0" stroke-width="4" stroke-linecap="round"/>
  `;

  const sad = `
    <ellipse cx="200" cy="345" rx="72" ry="65" fill="#2A2A35" stroke="#1A1A2E" stroke-width="3"/>
    <ellipse cx="200" cy="215" rx="92" ry="85" fill="#333344" stroke="#1A1A2E" stroke-width="3"/>
    <path d="M 138 148 L 110 75 L 158 90 Z" fill="#2A2A35" stroke="#1A1A2E" stroke-width="3" transform="rotate(-5 135 110)"/>
    <path d="M 262 148 L 290 75 L 242 90 Z" fill="#2A2A35" stroke="#1A1A2E" stroke-width="3" transform="rotate(5 265 110)"/>
    <path d="M 120 130 Q 200 40 280 130 Q 295 150 270 160 Q 200 135 130 160 Q 105 150 120 130 Z" fill="#7B1FA2" stroke="#6A1B9A" stroke-width="3"/>
    <circle cx="200" cy="48" r="7" fill="#9E9E9E"/>
    <g transform="translate(200, 100)">
      <ellipse cx="0" cy="0" rx="12" ry="10" fill="#E0E0E0"/>
      <ellipse cx="-4" cy="-2" rx="2.5" ry="3.5" fill="#1A1A2E"/>
      <ellipse cx="4" cy="-2" rx="2.5" ry="3.5" fill="#1A1A2E"/>
      <path d="M -3 4 L 0 5 L 3 4 L 0 6 Z" fill="#1A1A2E"/>
    </g>
    <ellipse cx="178" cy="208" rx="6" ry="10" fill="#FFFFFF"/>
    <ellipse cx="222" cy="208" rx="6" ry="10" fill="#FFFFFF"/>
    <path d="M 165 185 L 183 192" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M 235 185 L 217 192" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
    <ellipse cx="158" cy="235" rx="10" ry="5" fill="#9E9E9E" opacity="0.5"/>
    <ellipse cx="245" cy="240" rx="8" ry="4" fill="#9E9E9E" opacity="0.5"/>
    <path d="M 190 248 Q 200 238 210 248" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="160" cy="410" rx="14" ry="9" fill="#333344" stroke="#1A1A2E" stroke-width="2.5"/>
    <ellipse cx="240" cy="410" rx="14" ry="9" fill="#333344" stroke="#1A1A2E" stroke-width="2.5"/>
    <text x="115" y="100" font-size="18" fill="#9E9E9E">~</text>
  `;

  const body = state === 'happy' ? happy : sad;
  const animClass = state === 'happy' ? 'kuromi-happy' : 'kuromi-sad';

  return `
    <svg class="melody-svg ${animClass}" viewBox="0 0 400 440" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="halo-kuromi" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#CE93D8" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#CE93D8" stop-opacity="0"/>
        </radialGradient>
      </defs>
      ${state === 'happy' ? '<circle cx="200" cy="220" r="180" fill="url(#halo-kuromi)"/>' : ''}
      ${body}
      ${state === 'happy' ? '<text x="200" y="50" font-size="30" text-anchor="middle">💜</text>' : '<text x="200" y="55" font-size="26" text-anchor="middle">💭</text>'}
    </svg>
  `;
}

window.Kuromi = { kuromiSVG };

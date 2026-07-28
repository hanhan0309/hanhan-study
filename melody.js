// 美乐蒂小猫 SVG 生成器
// 两套状态：happy（达标，干净吃饱）/ sad（未达标，瘦瘦脏脏）
// 加上动画状态：eating（吃饭）+ bathing（洗澡）

function melodySVG(state = 'happy') {
  // 公共部分：粉色帽兜 + 蝴蝶结 + 白色小猫
  const happy = `
    <!-- 身体（圆润吃饱） -->
    <ellipse cx="200" cy="340" rx="95" ry="80" fill="#FFFFFF" stroke="#F8BBD0" stroke-width="3"/>
    <!-- 头 -->
    <ellipse cx="200" cy="210" rx="110" ry="100" fill="#FFFFFF" stroke="#F8BBD0" stroke-width="3"/>
    <!-- 左耳 -->
    <path d="M 120 130 Q 100 70 145 65 Q 165 90 168 130 Z" fill="#FFFFFF" stroke="#F8BBD0" stroke-width="3"/>
    <!-- 右耳 -->
    <path d="M 280 130 Q 300 70 255 65 Q 235 90 232 130 Z" fill="#FFFFFF" stroke="#F8BBD0" stroke-width="3"/>
    <!-- 粉色帽兜 -->
    <path d="M 120 130 Q 200 30 280 130 Q 295 150 275 165 Q 200 140 125 165 Q 105 150 120 130 Z" fill="#FF9EC4" stroke="#E91E63" stroke-width="2.5"/>
    <circle cx="125" cy="165" r="10" fill="#FFF0F5" stroke="#E91E63" stroke-width="2"/>
    <circle cx="200" cy="142" r="10" fill="#FFF0F5" stroke="#E91E63" stroke-width="2"/>
    <circle cx="275" cy="165" r="10" fill="#FFF0F5" stroke="#E91E63" stroke-width="2"/>
    <!-- 蝴蝶结 -->
    <g transform="translate(115,120) rotate(-15)">
      <path d="M 0 0 L -24 -14 L -24 14 Z" fill="#FF4081"/>
      <path d="M 0 0 L 24 -14 L 24 14 Z" fill="#FF4081"/>
      <circle cx="0" cy="0" r="6" fill="#E91E63"/>
    </g>
    <!-- 眼睛（开心弯月） -->
    <path d="M 165 200 Q 178 185 191 200" fill="none" stroke="#2B2B2B" stroke-width="5" stroke-linecap="round"/>
    <path d="M 209 200 Q 222 185 235 200" fill="none" stroke="#2B2B2B" stroke-width="5" stroke-linecap="round"/>
    <!-- 腮红 -->
    <ellipse cx="158" cy="230" rx="16" ry="9" fill="#FFB6C1" opacity="0.7"/>
    <ellipse cx="242" cy="230" rx="16" ry="9" fill="#FFB6C1" opacity="0.7"/>
    <!-- 嘴巴（微笑） -->
    <path d="M 185 240 Q 200 256 215 240" fill="none" stroke="#2B2B2B" stroke-width="4" stroke-linecap="round"/>
    <!-- 小爪子 -->
    <ellipse cx="150" cy="410" rx="22" ry="14" fill="#FFFFFF" stroke="#F8BBD0" stroke-width="2.5"/>
    <ellipse cx="250" cy="410" rx="22" ry="14" fill="#FFFFFF" stroke="#F8BBD0" stroke-width="2.5"/>
  `;

  const sad = `
    <!-- 身体（瘦瘦的） -->
    <ellipse cx="200" cy="345" rx="72" ry="68" fill="#F5F5F5" stroke="#D7CCC8" stroke-width="3"/>
    <!-- 头（瘦） -->
    <ellipse cx="200" cy="210" rx="98" ry="92" fill="#F5F5F5" stroke="#D7CCC8" stroke-width="3"/>
    <!-- 左耳（耷拉） -->
    <path d="M 128 135 Q 105 95 138 80 Q 160 110 165 140 Z" fill="#F5F5F5" stroke="#D7CCC8" stroke-width="3" transform="rotate(-8 140 110)"/>
    <!-- 右耳（耷拉） -->
    <path d="M 272 135 Q 295 95 262 80 Q 240 110 235 140 Z" fill="#F5F5F5" stroke="#D7CCC8" stroke-width="3" transform="rotate(8 260 110)"/>
    <!-- 帽兜（颜色暗淡） -->
    <path d="M 120 130 Q 200 30 280 130 Q 295 150 275 165 Q 200 140 125 165 Q 105 150 120 130 Z" fill="#E0A0B8" stroke="#BDBDBD" stroke-width="2.5"/>
    <circle cx="125" cy="165" r="10" fill="#EFE0E8" stroke="#BDBDBD" stroke-width="2"/>
    <circle cx="200" cy="142" r="10" fill="#EFE0E8" stroke="#BDBDBD" stroke-width="2"/>
    <circle cx="275" cy="165" r="10" fill="#EFE0E8" stroke="#BDBDBD" stroke-width="2"/>
    <!-- 蝴蝶结（歪了） -->
    <g transform="translate(115,120) rotate(-30)">
      <path d="M 0 0 L -24 -14 L -24 14 Z" fill="#C0C0C0"/>
      <path d="M 0 0 L 24 -14 L 24 14 Z" fill="#C0C0C0"/>
      <circle cx="0" cy="0" r="6" fill="#9E9E9E"/>
    </g>
    <!-- 眼睛（难过） -->
    <ellipse cx="178" cy="205" rx="8" ry="11" fill="#2B2B2B"/>
    <ellipse cx="222" cy="205" rx="8" ry="11" fill="#2B2B2B"/>
    <!-- 眉毛（八字） -->
    <path d="M 165 180 L 185 188" stroke="#2B2B2B" stroke-width="3" stroke-linecap="round"/>
    <path d="M 235 180 L 215 188" stroke="#2B2B2B" stroke-width="3" stroke-linecap="round"/>
    <!-- 脏污 -->
    <ellipse cx="160" cy="230" rx="14" ry="7" fill="#9E9E9E" opacity="0.5"/>
    <ellipse cx="245" cy="245" rx="10" ry="5" fill="#9E9E9E" opacity="0.5"/>
    <ellipse cx="200" cy="280" rx="18" ry="6" fill="#9E9E9E" opacity="0.4"/>
    <!-- 嘴巴（撇嘴） -->
    <path d="M 188 250 Q 200 240 212 250" fill="none" stroke="#2B2B2B" stroke-width="4" stroke-linecap="round"/>
    <!-- 瘦小爪子 -->
    <ellipse cx="158" cy="410" rx="16" ry="10" fill="#F5F5F5" stroke="#D7CCC8" stroke-width="2.5"/>
    <ellipse cx="242" cy="410" rx="16" ry="10" fill="#F5F5F5" stroke="#D7CCC8" stroke-width="2.5"/>
    <!-- 头顶灰尘小符号 -->
    <text x="115" y="90" font-size="20" fill="#9E9E9E">~</text>
    <text x="270" y="95" font-size="18" fill="#9E9E9E">~</text>
  `;

  const body = state === 'happy' ? happy : sad;
  const animClass = state === 'happy' ? 'melody-happy' : 'melody-sad';

  return `
    <svg class="melody-svg ${animClass}" viewBox="0 0 400 440" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="halo-${state}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFF0F5" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#FFF0F5" stop-opacity="0"/>
        </radialGradient>
      </defs>
      ${state === 'happy' ? '<circle cx="200" cy="220" r="180" fill="url(#halo-happy)"/>' : ''}
      ${body}
      ${state === 'happy' ? '<text x="200" y="50" font-size="34" text-anchor="middle">✨</text>' : '<text x="200" y="55" font-size="30" text-anchor="middle">💭</text>'}
    </svg>
  `;
}

// 达标瞬间的"吃饭+洗澡"庆祝动画层
function celebrateOverlay() {
  return `
    <div class="celebrate-overlay" id="celebrateOverlay">
      <div class="celebrate-scene">
        <div class="celebrate-step" data-step="eat">
          <span class="big-emoji">🍚</span>
          <p>美乐蒂饱餐一顿！</p>
        </div>
        <div class="celebrate-step" data-step="bath">
          <span class="big-emoji">🛁</span>
          <p>洗个香喷喷的澡！</p>
        </div>
        <div class="celebrate-step" data-step="done">
          <span class="big-emoji">💕</span>
          <p>谢谢含含！今天你真棒！</p>
        </div>
      </div>
    </div>
  `;
}

window.Melody = { melodySVG, celebrateOverlay };

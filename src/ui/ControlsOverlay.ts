import van from 'vanjs-core'

const { div, h2, p, span, button, a } = van.tags

const getGameModeInfo = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const roomParam = urlParams.get('room')
  const singlePlayer = urlParams.get('single') === 'true'
  
  if (singlePlayer) {
    return {
      text: '🎮 Single Player Mode',
      description: 'Playing alone in your own room'
    }
  }
  if (roomParam) {
    return {
      text: `🌐 Private Room: ${roomParam}`,
      description: 'Share this URL with friends to play together'
    }
  }
  return {
    text: '🌐 Public Multiplayer',
    description: 'Playing with everyone in the shared room'
  }
}

export const ControlsOverlay = () => {
  const isVisible = van.state(true)
  const gameMode = getGameModeInfo()
  
  return div(
    {
      class: () => isVisible.val 
        ? 'fixed top-4 left-4 bg-base-200 bg-opacity-95 p-6 rounded-lg shadow-2xl max-w-sm z-50 border border-base-300'
        : 'hidden'
    },
    div(
      { class: 'flex justify-between items-start mb-4' },
      h2({ class: 'text-xl font-bold text-primary' }, '🎮 Game Controls'),
      button(
        {
          class: 'btn btn-ghost btn-xs',
          onclick: () => isVisible.val = false
        },
        '✕'
      )
    ),
    
    div(
      { class: 'space-y-3' },
      
      // Movement controls
      div(
        { class: 'border-l-4 border-primary pl-3' },
        p({ class: 'font-semibold text-base' }, 'Movement'),
        div(
          { class: 'space-y-1 text-sm opacity-90' },
          p(
            span({ class: 'kbd kbd-sm' }, 'W'),
            ' / ',
            span({ class: 'kbd kbd-sm' }, '↑'),
            ' - Drive Forward'
          ),
          p(
            span({ class: 'kbd kbd-sm' }, 'S'),
            ' / ',
            span({ class: 'kbd kbd-sm' }, '↓'),
            ' - Drive Backward'
          ),
          p(
            span({ class: 'kbd kbd-sm' }, 'A'),
            ' / ',
            span({ class: 'kbd kbd-sm' }, '←'),
            ' - Turn Left'
          ),
          p(
            span({ class: 'kbd kbd-sm' }, 'D'),
            ' / ',
            span({ class: 'kbd kbd-sm' }, '→'),
            ' - Turn Right'
          ),
          p(
            span({ class: 'kbd kbd-sm' }, 'Space'),
            ' - Turbo Boost (Hold)',
            span({ class: 'text-xs text-warning ml-1' }, '+30% speed')
          )
        )
      ),
      
      // Audio control
      div(
        { class: 'border-l-4 border-secondary pl-3' },
        p({ class: 'font-semibold text-base' }, 'Audio'),
        p(
          { class: 'text-sm opacity-90' },
          span({ class: 'kbd kbd-sm' }, 'M'),
          ' - Toggle Mute'
        )
      ),
      
      // Mobile controls
      div(
        { class: 'border-l-4 border-accent pl-3' },
        p({ class: 'font-semibold text-base' }, 'Mobile'),
        p({ class: 'text-sm opacity-90' }, '📱 Use on-screen touch controls')
      ),
      
      // Game mode info
      div(
        { class: 'border-l-4 border-info pl-3' },
        p({ class: 'font-semibold text-base' }, 'Game Mode'),
        p({ class: 'text-sm font-medium' }, gameMode.text),
        p({ class: 'text-xs opacity-75 mt-1' }, gameMode.description)
      ),
      
      // Quick mode links
      div(
        { class: 'border-l-4 border-warning pl-3' },
        p({ class: 'font-semibold text-base mb-1' }, 'Quick Links'),
        div(
          { class: 'space-y-1' },
          a(
            { 
              class: 'text-xs link link-primary block',
              href: '?single=true'
            },
            '→ Play Single Player'
          ),
          a(
            { 
              class: 'text-xs link link-primary block',
              href: '/'
            },
            '→ Join Public Room'
          ),
          a(
            { 
              class: 'text-xs link link-primary block',
              href: `?room=private-${Math.random().toString(36).substr(2, 9)}`
            },
            '→ Create Private Room'
          )
        )
      )
    ),
    
    // Show controls button when hidden
    () => !isVisible.val ? button(
      {
        class: 'fixed top-4 left-4 btn btn-primary btn-sm z-50',
        onclick: () => isVisible.val = true
      },
      '🎮 Show Controls'
    ) : null
  )
}
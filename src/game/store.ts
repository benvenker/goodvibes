import { createRoom, hasSignificantStateChange, PlayerBase, RoomEventType, Vector3 } from 'vibescale'

export type Player = PlayerBase<{
  hasCollided: boolean
  collisionPoint: Vector3
  audioPreferences: {
    isMuted: boolean
    volume: number
  }
  username?: string
}>

// Check URL params for room override or single-player mode
const urlParams = new URLSearchParams(window.location.search)
const roomParam = urlParams.get('room')
const singlePlayer = urlParams.get('single') === 'true'

// Generate room ID based on mode
const getRoomId = () => {
  if (singlePlayer) {
    // Generate unique room ID for single-player mode
    return `single-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
  if (roomParam) {
    // Use room from URL parameter
    return roomParam
  }
  // Default to shared room
  return import.meta.env.VITE_VIBESCALE_ROOM_ID || 'goodvibes'
}

const roomId = getRoomId()
console.log('Connecting to room:', roomId, { singlePlayer, roomParam })

export const room = createRoom<Player>(roomId, {
  endpoint: import.meta.env.VITE_VIBESCALE_URL || 'https://vibescale.benallfree.com',
  stateChangeDetectorFn: (current, next) => {
    const hasChanged =
      hasSignificantStateChange(current, next) ||
      current.username !== next.username ||
      current.audioPreferences?.isMuted !== next.audioPreferences?.isMuted ||
      current.audioPreferences?.volume !== next.audioPreferences?.volume ||
      current.hasCollided !== next.hasCollided ||
      current.collisionPoint?.x !== next.collisionPoint?.x ||
      current.collisionPoint?.y !== next.collisionPoint?.y ||
      current.collisionPoint?.z !== next.collisionPoint?.z
    if (hasChanged) {
      console.log('change detected', { current, next })
    }
    return hasChanged
  },
})

room.on(RoomEventType.Any, (state) => {
  const { name, data } = state
  console.log(name, data)
})

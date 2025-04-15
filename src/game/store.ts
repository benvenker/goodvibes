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

export const room = createRoom<Player>(import.meta.env.VITE_VIBESCALE_ROOM_ID || 'goodvibes', {
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

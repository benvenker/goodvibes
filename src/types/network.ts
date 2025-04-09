export type PlayerId = string

export interface Vector3 {
  x: number
  y: number
  z: number
}

export interface PlayerState {
  id: PlayerId
  position: Vector3
  rotation: Vector3
  color: string
  username?: string
  hasCollided?: boolean
  collisionPoint?: Vector3
}

export type WebSocketMessage =
  | {
      type: 'player:id'
      id: PlayerId
      color: string
      spawnPosition: Vector3
    }
  | {
      type: 'player:state'
      player: PlayerState
    }
  | {
      type: 'player:leave'
      id: PlayerId
    }
  | {
      type: 'error'
      message: string
    }

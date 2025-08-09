import * as THREE from 'three'
import { RoomEventType } from 'vibescale'
import { EventEmitter } from '../utils/EventEmitter'
import { Car } from './Car'
import { PlayerManager } from './PlayerManager'
import { UserManager } from './UserManager'
import { room } from './store'

export class NetworkManager {
  constructor(
    private playerManager: PlayerManager,
    private car: Car,
    private userManager: UserManager & EventEmitter,
    private updateInterval: number = 50
  ) {
    console.log('NetworkManager constructor', { username: this.userManager.getUsername() })
    this.car.setUsername(this.userManager.getUsername() || 'enpeasea')
    this.initializeNetworkHandlers()

    // Listen for username changes
    this.userManager.on('usernameChanged', (newUsername: string | undefined) => {
      const username = newUsername || 'enpeasea'
      this.car.setUsername(username)
      room.mutatePlayer((player) => {
        player.username = username
      })
    })
  }

  private initializeNetworkHandlers(): void {
    // Clear all players when connected (fresh start)
    room.on(RoomEventType.Connected, () => {
      console.log('Connected to room - clearing all players')
      // Clear all existing players since connections are ephemeral
      this.playerManager.clearAllPlayers()
    })

    room.on(RoomEventType.Disconnected, () => {
      console.log('Disconnected from room')
      // Clear all players on disconnect
      this.playerManager.clearAllPlayers()
    })

    room.on(RoomEventType.PlayerJoined, (e) => {
      const { data: player } = e
      if (!player.id) return
      console.log('Player joined:', {
        id: player.id,
        isLocal: player.isLocal,
        username: player.username,
        position: player.position
      })
      if (player.isLocal) {
        this.car.setPlayerId(player.id)
        this.car.setColor(player.color)
        const threePosition = new THREE.Vector3(player.position.x, player.position.y, player.position.z)
        this.car.setPosition(threePosition)
      } else {
        console.log('Adding remote player to scene:', player.id)
        this.playerManager.updatePlayer(player)
      }
    })

    room.on(RoomEventType.PlayerUpdated, (e) => {
      const { data: player } = e
      if (!player.id) return
      // Only update non-local players
      if (!player.isLocal) {
        this.playerManager.updatePlayer(player)
      }
    })

    room.on(RoomEventType.PlayerLeft, (e) => {
      const { data: player } = e
      if (!player.id) return
      this.playerManager.removePlayer(player.id)
    })
  }

  connect(): void {
    room.connect()
  }

  disconnect(): void {}

  // Force an immediate state update regardless of time interval
  public forceStateUpdate(): void {
    const position = this.car.getPosition()
    const rotation = this.car.getMesh().rotation
    const hasCollided = this.car.getCollisionState()
    const collisionPoint = this.car.getCollisionPoint() || { x: 0, y: 0, z: 0 }

    // Round rotation values to 3 decimal places to prevent floating point noise
    const roundedRotation = {
      x: Math.round(rotation.x * 1000) / 1000,
      y: Math.round(rotation.y * 1000) / 1000,
      z: Math.round(rotation.z * 1000) / 1000,
    }

    room.mutatePlayer((player) => {
      player.position.x = position.x
      player.position.y = position.y
      player.position.z = position.z
      player.rotation.x = roundedRotation.x
      player.rotation.y = roundedRotation.y
      player.rotation.z = roundedRotation.z
      player.hasCollided = hasCollided
      player.collisionPoint = collisionPoint
    })
  }

  updatePlayerState(lastUpdateTime: number): number {
    const now = Date.now()
    if (now - lastUpdateTime < this.updateInterval) return lastUpdateTime

    this.forceStateUpdate()
    return now
  }
}

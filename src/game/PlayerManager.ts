import * as THREE from 'three'
import { PlayerId } from 'vibescale'
import { createCarMesh } from '../utils/createCarMesh'
import { AudioManager } from './AudioManager'
import { Player } from './store'
import { ResourceManager, Vector3Pool } from '../utils/resourceManager'

interface InterpolationState {
  currentPosition: THREE.Vector3
  targetPosition: THREE.Vector3
  currentRotation: THREE.Vector3
  targetRotation: THREE.Vector3
  lastUpdateTime: number
}

interface PlayerObjects {
  group: THREE.Group
  lastPosition?: THREE.Vector3
}

export class PlayerManager {
  private players = new Map<PlayerId, PlayerObjects>()
  private interpolationStates = new Map<PlayerId, InterpolationState>()
  private scene: THREE.Scene
  private readonly INTERPOLATION_DURATION = 0.1 // 100ms interpolation
  private audioManager?: AudioManager

  constructor(scene: THREE.Scene) {
    this.scene = scene
  }

  setAudioManager(audioManager: AudioManager): void {
    this.audioManager = audioManager
  }

  addPlayer(player: Player): void {
    // Create car mesh for the remote player
    const playerGroup = createCarMesh({
      bodyColor: player.color,
      username: player.username,
    })

    // Create player objects container
    const playerObjects: PlayerObjects = {
      group: playerGroup,
    }

    // Position the player
    playerGroup.position.set(player.position.x, player.position.y, player.position.z)
    const rotation = Vector3Pool.acquire(player.rotation.x, player.rotation.y, player.rotation.z)
    playerGroup.rotation.setFromVector3(rotation)
    Vector3Pool.release(rotation)

    // Initialize interpolation state
    this.interpolationStates.set(player.id, {
      currentPosition: Vector3Pool.acquire().copy(playerGroup.position),
      targetPosition: Vector3Pool.acquire().copy(playerGroup.position),
      currentRotation: Vector3Pool.acquire().setFromEuler(playerGroup.rotation),
      targetRotation: Vector3Pool.acquire().copy(rotation),
      lastUpdateTime: performance.now(),
    })

    // Add to scene and store reference
    this.scene.add(playerGroup)
    this.players.set(player.id, playerObjects)
  }

  updatePlayer(player: Player): void {
    const playerObjects = this.players.get(player.id)
    const interpolationState = this.interpolationStates.get(player.id)

    if (!playerObjects || !interpolationState) {
      this.addPlayer(player)
      return
    }

    // Play collision sounds if the player has collided
    if (player.hasCollided && player.collisionPoint && this.audioManager) {
      const soundPosition = Vector3Pool.acquire(player.collisionPoint.x, player.collisionPoint.y, player.collisionPoint.z)
      this.audioManager.playCollisionSounds(soundPosition)
      Vector3Pool.release(soundPosition)
    }

    // Update username if changed
    if (player.username !== playerObjects.group.userData.username) {
      // For now, recreate the mesh with updated username
      // TODO: Optimize this by updating only the text textures
      this.scene.remove(playerObjects.group)
      ResourceManager.disposeObject3D(playerObjects.group)

      // Create new group with updated username
      const newGroup = createCarMesh({
        bodyColor: player.color,
        username: player.username,
      })
      newGroup.position.copy(interpolationState.currentPosition)
      newGroup.rotation.setFromVector3(interpolationState.currentRotation)
      newGroup.userData.username = player.username

      // Update references
      playerObjects.group = newGroup
      this.scene.add(newGroup)
    }

    // Update interpolation targets
    interpolationState.currentPosition.copy(playerObjects.group.position)
    interpolationState.currentRotation.setFromEuler(playerObjects.group.rotation)
    interpolationState.targetPosition.set(player.position.x, player.position.y, player.position.z)
    interpolationState.targetRotation.set(player.rotation.x, player.rotation.y, player.rotation.z)
    interpolationState.lastUpdateTime = performance.now()
  }

  update(): void {
    const currentTime = performance.now()

    this.interpolationStates.forEach((state, playerId) => {
      const playerObjects = this.players.get(playerId)
      if (!playerObjects) return

      const timeDelta = (currentTime - state.lastUpdateTime) / 1000
      const alpha = Math.min(timeDelta / this.INTERPOLATION_DURATION, 1)

      // Interpolate position
      playerObjects.group.position.lerpVectors(state.currentPosition, state.targetPosition, alpha)

      // Interpolate rotation
      const interpolatedRotation = Vector3Pool.acquire()
      interpolatedRotation.lerpVectors(state.currentRotation, state.targetRotation, alpha)
      playerObjects.group.rotation.setFromVector3(interpolatedRotation)
      Vector3Pool.release(interpolatedRotation)
    })
  }

  removePlayer(playerId: PlayerId): void {
    const playerObjects = this.players.get(playerId)
    if (!playerObjects) return

    // Properly dispose of the player's resources
    this.scene.remove(playerObjects.group)
    ResourceManager.disposeObject3D(playerObjects.group)
    
    // Clear interpolation state and release pooled Vector3 instances
    const interpolationState = this.interpolationStates.get(playerId)
    if (interpolationState) {
      // These were acquired from the pool, so we can safely release them
      Vector3Pool.release(interpolationState.currentPosition)
      Vector3Pool.release(interpolationState.targetPosition)
      Vector3Pool.release(interpolationState.currentRotation)
      Vector3Pool.release(interpolationState.targetRotation)
    }
    
    this.players.delete(playerId)
    this.interpolationStates.delete(playerId)
  }

  public getPlayers(): Map<PlayerId, PlayerObjects> {
    return this.players
  }

  /**
   * Dispose of all resources
   */
  public dispose(): void {
    // Remove and dispose all players
    for (const [playerId] of this.players) {
      this.removePlayer(playerId)
    }
    
    // Clear all maps
    this.players.clear()
    this.interpolationStates.clear()
    this.audioManager = undefined
  }
}

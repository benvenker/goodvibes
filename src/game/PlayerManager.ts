import * as THREE from 'three'
import { PlayerId } from 'vibescale'
import { NETWORK, TIMING } from '../config/constants'
import { createCarMesh } from '../utils/createCarMesh'
import { AudioManager } from './AudioManager'
import { Player } from './store'

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
  private readonly INTERPOLATION_DURATION = NETWORK.INTERPOLATION_DURATION_SECONDS
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
    const rotation = new THREE.Vector3(player.rotation.x, player.rotation.y, player.rotation.z)
    playerGroup.rotation.setFromVector3(rotation)

    // Initialize interpolation state
    this.interpolationStates.set(player.id, {
      currentPosition: playerGroup.position.clone(),
      targetPosition: playerGroup.position.clone(),
      currentRotation: new THREE.Vector3().setFromEuler(playerGroup.rotation),
      targetRotation: rotation.clone(),
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
      const soundPosition = new THREE.Vector3(player.collisionPoint.x, player.collisionPoint.y, player.collisionPoint.z)
      this.audioManager.playCollisionSounds(soundPosition)
    }

    // Update username if changed
    if (player.username !== playerObjects.group.userData.username) {
      // Remove old group from scene
      this.scene.remove(playerObjects.group)

      // Create new group with updated username
      const newGroup = createCarMesh({
        bodyColor: player.color,
        username: player.username,
      })
      newGroup.position.copy(playerObjects.group.position)
      newGroup.rotation.copy(playerObjects.group.rotation)
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

      const timeDelta = (currentTime - state.lastUpdateTime) / TIMING.MS_TO_SECONDS
      const alpha = Math.min(timeDelta / this.INTERPOLATION_DURATION, TIMING.INTERPOLATION_ALPHA_MAX)

      // Interpolate position
      playerObjects.group.position.lerpVectors(state.currentPosition, state.targetPosition, alpha)

      // Interpolate rotation
      const interpolatedRotation = new THREE.Vector3()
      interpolatedRotation.lerpVectors(state.currentRotation, state.targetRotation, alpha)
      playerObjects.group.rotation.setFromVector3(interpolatedRotation)
    })
  }

  removePlayer(playerId: PlayerId): void {
    const playerObjects = this.players.get(playerId)
    if (!playerObjects) return

    this.scene.remove(playerObjects.group)
    this.players.delete(playerId)
    this.interpolationStates.delete(playerId)
  }

  public getPlayers(): Map<PlayerId, PlayerObjects> {
    return this.players
  }
}

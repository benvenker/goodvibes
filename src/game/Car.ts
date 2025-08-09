import * as THREE from 'three'
import { CarPhysicsConfig, defaultCarPhysics } from '../config/carPhysics'
import type { JoystickState } from '../core/controls/TouchControls'
import { createCarMesh } from '../utils/createCarMesh'
import { AudioManager } from './AudioManager'

export class Car {
  private mesh: THREE.Group
  private velocity: THREE.Vector3
  private velocityY = 0
  private isAirborne = false
  private physics: CarPhysicsConfig
  private username?: string
  private playerId?: string
  private audioManager?: AudioManager
  private hasCollided = false
  private collisionReported = false
  private lastCollisionPoint?: THREE.Vector3
  private readonly boundingBox: THREE.Box3
  private readonly CAR_WIDTH = 2
  private readonly CAR_LENGTH = 4
  private readonly GRAVITY = -30 // units/s²
  private readonly MIN_LAUNCH_VELOCITY = 10
  private polls: THREE.Mesh[] = []
  private obstacles: THREE.Mesh[] = []
  private walls: THREE.Mesh[] = []
  private ramps: THREE.Mesh[] = []
  private otherPlayers = new Map<string, THREE.Group>()

  constructor(physics: CarPhysicsConfig = defaultCarPhysics) {
    this.mesh = createCarMesh()
    this.velocity = new THREE.Vector3()
    this.physics = physics
    this.boundingBox = new THREE.Box3()
  }

  public setAudioManager(audioManager: AudioManager): void {
    this.audioManager = audioManager
  }

  public setPollObjects(polls: THREE.Mesh[]): void {
    this.polls = polls
  }

  public setObstacles(obstacles: THREE.Mesh[]): void {
    this.obstacles = obstacles
  }

  public setWalls(walls: THREE.Mesh[]): void {
    this.walls = walls
  }

  public setRamps(ramps: THREE.Mesh[]): void {
    this.ramps = ramps
  }

  public setOtherPlayers(players: Map<string, { group: THREE.Group }>): void {
    this.otherPlayers = new Map([...players].map(([id, obj]) => [id, obj.group]))
  }

  private handleCollisions(): boolean {
    // Update our bounding box
    this.boundingBox.setFromObject(this.mesh)
    let collided = false
    let collisionPoint: THREE.Vector3 | undefined
    const IMPACT_VELOCITY_THRESHOLD = 5 // Only count as collision if impact speed is above this

    // Check for ramp collisions first (they launch instead of blocking)
    for (const ramp of this.ramps) {
      const rampBox = new THREE.Box3().setFromObject(ramp)
      if (this.boundingBox.intersectsBox(rampBox) && !this.isAirborne) {
        // Calculate launch velocity based on forward speed
        const forwardSpeed = this.velocity.length()
        if (forwardSpeed > 5) { // Minimum speed to launch
          // Launch proportional to speed, with minimum launch
          this.velocityY = Math.max(forwardSpeed * 0.6, this.MIN_LAUNCH_VELOCITY)
          this.isAirborne = true
          
          // Play a launch sound if we have audio
          if (this.audioManager) {
            this.audioManager.playCollisionSounds(ramp.position)
          }
        }
      }
    }

    // Check all collidable objects (but not if we're airborne)
    if (this.isAirborne) return false
    
    const allObjects = [...this.walls, ...this.obstacles, ...this.polls]
    for (const obj of allObjects) {
      const objBox = new THREE.Box3().setFromObject(obj)
      if (this.boundingBox.intersectsBox(objBox)) {
        // Get overlap on each axis
        const overlap = new THREE.Vector3()
        overlap.x = Math.min(this.boundingBox.max.x - objBox.min.x, objBox.max.x - this.boundingBox.min.x)
        overlap.z = Math.min(this.boundingBox.max.z - objBox.min.z, objBox.max.z - this.boundingBox.min.z)

        // Push back along smallest overlap axis
        if (overlap.x < overlap.z) {
          // Move back to just touching
          this.mesh.position.x += overlap.x * (this.boundingBox.min.x < objBox.min.x ? -1 : 1)

          // Only apply bounce effects if impact is significant
          if (Math.abs(this.velocity.x) > IMPACT_VELOCITY_THRESHOLD) {
            collided = true
            collisionPoint = obj.position.clone()
            collisionPoint.y = 1
            this.lastCollisionPoint = collisionPoint
            this.velocity.x *= -this.physics.bounceRestitution
          } else {
            // For low speed, just zero out velocity in collision direction
            this.velocity.x = 0
          }
        } else {
          // Move back to just touching
          this.mesh.position.z += overlap.z * (this.boundingBox.min.z < objBox.min.z ? -1 : 1)

          // Only apply bounce effects if impact is significant
          if (Math.abs(this.velocity.z) > IMPACT_VELOCITY_THRESHOLD) {
            collided = true
            collisionPoint = obj.position.clone()
            collisionPoint.y = 1
            this.lastCollisionPoint = collisionPoint
            this.velocity.z *= -this.physics.bounceRestitution
          } else {
            // For low speed, just zero out velocity in collision direction
            this.velocity.z = 0
          }
        }
        this.mesh.position.y = 0
        break
      }
    }

    // Check other player collisions - same logic as static objects
    for (const [id, otherCar] of this.otherPlayers) {
      if (id === this.playerId) continue
      const otherBox = new THREE.Box3().setFromObject(otherCar)
      if (this.boundingBox.intersectsBox(otherBox)) {
        // Get overlap on each axis
        const overlap = new THREE.Vector3()
        overlap.x = Math.min(this.boundingBox.max.x - otherBox.min.x, otherBox.max.x - this.boundingBox.min.x)
        overlap.z = Math.min(this.boundingBox.max.z - otherBox.min.z, otherBox.max.z - this.boundingBox.min.z)

        // Push back along smallest overlap axis
        if (overlap.x < overlap.z) {
          // Move back to just touching
          this.mesh.position.x += overlap.x * (this.boundingBox.min.x < otherBox.min.x ? -1 : 1)

          // Only apply bounce effects if impact is significant
          if (Math.abs(this.velocity.x) > IMPACT_VELOCITY_THRESHOLD) {
            collided = true
            collisionPoint = otherCar.position.clone()
            collisionPoint.y = 1
            this.lastCollisionPoint = collisionPoint
            this.velocity.x *= -this.physics.bounceRestitution
          } else {
            // For low speed, just zero out velocity in collision direction
            this.velocity.x = 0
          }
        } else {
          // Move back to just touching
          this.mesh.position.z += overlap.z * (this.boundingBox.min.z < otherBox.min.z ? -1 : 1)

          // Only apply bounce effects if impact is significant
          if (Math.abs(this.velocity.z) > IMPACT_VELOCITY_THRESHOLD) {
            collided = true
            collisionPoint = otherCar.position.clone()
            collisionPoint.y = 1
            this.lastCollisionPoint = collisionPoint
            this.velocity.z *= -this.physics.bounceRestitution
          } else {
            // For low speed, just zero out velocity in collision direction
            this.velocity.z = 0
          }
        }
        this.mesh.position.y = 0
        break
      }
    }

    return collided
  }

  public update(input: JoystickState, deltaTime: number): void {
    // Update rotation based on input (works even when airborne for tricks!)
    if (Math.abs(input.x) > 0.1) {
      this.mesh.rotation.y -= input.x * this.physics.turnSpeed * deltaTime
    }

    // Calculate forward direction
    const forward = new THREE.Vector3(0, 0, 1)
    forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mesh.rotation.y)

    // Update velocity based on input (reduced control when airborne)
    if (Math.abs(input.y) > 0.1) {
      const controlMultiplier = this.isAirborne ? 0.3 : 1.0 // Less control in air
      const acceleration = forward.multiplyScalar(input.y * this.physics.acceleration * deltaTime * controlMultiplier)
      this.velocity.add(acceleration)
    }

    // Apply friction (only on ground)
    if (!this.isAirborne) {
      this.velocity.multiplyScalar(1 - this.physics.friction * deltaTime)
    } else {
      // Less air resistance
      this.velocity.multiplyScalar(1 - this.physics.friction * deltaTime * 0.1)
    }

    // Limit speed
    const speed = this.velocity.length()
    if (speed > this.physics.maxSpeed) {
      this.velocity.multiplyScalar(this.physics.maxSpeed / speed)
    }

    // Keep velocity in XZ plane
    this.velocity.y = 0

    // Apply gravity if airborne
    if (this.isAirborne || this.mesh.position.y > 0.1) {
      this.velocityY += this.GRAVITY * deltaTime
      this.isAirborne = true
    }

    // Update position
    const newPosition = this.mesh.position.clone().add(this.velocity.clone().multiplyScalar(deltaTime))
    newPosition.y = this.mesh.position.y + this.velocityY * deltaTime
    
    // Check for landing
    if (this.isAirborne && newPosition.y <= 0) {
      newPosition.y = 0
      this.isAirborne = false
      
      // Play landing sound if landing hard
      if (this.velocityY < -10 && this.audioManager) {
        this.audioManager.playCollisionSounds(this.mesh.position)
      }
      
      // Small bounce on hard landing
      if (this.velocityY < -15) {
        this.velocityY = -this.velocityY * 0.3
      } else {
        this.velocityY = 0
      }
    }
    
    this.mesh.position.copy(newPosition)

    // Handle collisions and get collision state
    const collided = this.handleCollisions()

    // Update collision state and play sounds
    if (collided && !this.collisionReported) {
      this.hasCollided = true
      this.collisionReported = true
      if (this.audioManager && this.lastCollisionPoint) {
        this.audioManager.playCollisionSounds(this.lastCollisionPoint)
      }
    } else if (!collided) {
      this.hasCollided = false
      this.collisionReported = false
    }
  }

  public getPosition(): THREE.Vector3 {
    return this.mesh.position.clone()
  }

  public getMesh(): THREE.Group {
    return this.mesh
  }

  public getCollisionState(): boolean {
    return this.hasCollided
  }

  public getCollisionPoint(): THREE.Vector3 | undefined {
    return this.lastCollisionPoint?.clone()
  }

  public setUsername(username: string): void {
    this.username = username
    // Recreate car mesh with new username
    const oldPosition = this.mesh.position.clone()
    const oldRotation = this.mesh.rotation.clone()
    const bodyMesh = this.mesh.children[0] as THREE.Mesh
    const oldColor = (bodyMesh.material as THREE.MeshPhongMaterial).color

    // Store old scene reference
    const scene = this.mesh.parent

    // Remove old mesh from scene
    if (scene) {
      scene.remove(this.mesh)
    }

    // Create new mesh with username
    this.mesh = createCarMesh({
      bodyColor: oldColor.getHex(),
      username: username,
    })

    // Restore position and rotation
    this.mesh.position.copy(oldPosition)
    this.mesh.rotation.copy(oldRotation)

    // Add back to scene if it was in one
    if (scene) {
      scene.add(this.mesh)
    }
  }

  public getUsername(): string | undefined {
    return this.username
  }

  public setPlayerId(id: string): void {
    this.playerId = id
  }

  public getPlayerId(): string | undefined {
    return this.playerId
  }

  public setColor(color: string | number): void {
    console.log('setColor', { color })
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material instanceof THREE.MeshPhongMaterial) {
          if (child.material.color.getHex() === 0x2196f3) {
            child.material.color.set(color)
          }
        }
      }
    })
  }

  public getColor(): string {
    // Find the body mesh (first child) and get its color
    const bodyMesh = this.mesh.children[0] as THREE.Mesh
    if (bodyMesh && bodyMesh.material instanceof THREE.MeshPhongMaterial) {
      return '#' + bodyMesh.material.color.getHexString()
    }
    return '#2196f3' // Default color if not found
  }

  public reset(): void {
    this.mesh.position.set(0, 0, 0)
    this.mesh.rotation.set(0, 0, 0)
    this.velocity.set(0, 0, 0)
    this.hasCollided = false
    this.collisionReported = false
    this.lastCollisionPoint = undefined
  }

  public setPosition(position: THREE.Vector3): void {
    this.mesh.position.copy(position)
  }
}

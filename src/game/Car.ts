import * as THREE from 'three'
import { CarPhysicsConfig, defaultCarPhysics } from '../config/carPhysics'
import { PHYSICS } from '../config/constants'
import type { JoystickState } from '../core/controls/TouchControls'
import { createCarMesh } from '../utils/createCarMesh'
import { AudioManager } from './AudioManager'
import { ResourceManager, Vector3Pool } from '../utils/resourceManager'

export class Car {
  private mesh: THREE.Group
  private velocity: THREE.Vector3
  private physics: CarPhysicsConfig
  private username?: string
  private playerId?: string
  private audioManager?: AudioManager
  private hasCollided = false
  private collisionReported = false
  private lastCollisionPoint?: THREE.Vector3
  private readonly boundingBox: THREE.Box3
  private readonly CAR_WIDTH = PHYSICS.CAR.WIDTH
  private readonly CAR_LENGTH = PHYSICS.CAR.LENGTH
  private polls: THREE.Mesh[] = []
  private obstacles: THREE.Mesh[] = []
  private walls: THREE.Mesh[] = []
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

  public setOtherPlayers(players: Map<string, { group: THREE.Group }>): void {
    this.otherPlayers = new Map([...players].map(([id, obj]) => [id, obj.group]))
  }

  private handleCollisions(): boolean {
    // Update our bounding box
    this.boundingBox.setFromObject(this.mesh)
    let collided = false
    let collisionPoint: THREE.Vector3 | undefined

    // Check all collidable objects
    const allObjects = [...this.walls, ...this.obstacles, ...this.polls]
    for (const obj of allObjects) {
      const objBox = new THREE.Box3().setFromObject(obj)
      if (this.boundingBox.intersectsBox(objBox)) {
        // Get overlap on each axis
        const overlap = Vector3Pool.acquire()
        overlap.x = Math.min(this.boundingBox.max.x - objBox.min.x, objBox.max.x - this.boundingBox.min.x)
        overlap.z = Math.min(this.boundingBox.max.z - objBox.min.z, objBox.max.z - this.boundingBox.min.z)

        // Push back along smallest overlap axis
        if (overlap.x < overlap.z) {
          // Move back to just touching
          this.mesh.position.x += overlap.x * (this.boundingBox.min.x < objBox.min.x ? -1 : 1)

          // Only apply bounce effects if impact is significant
          if (Math.abs(this.velocity.x) > PHYSICS.MOVEMENT.IMPACT_VELOCITY_THRESHOLD) {
            collided = true
            // Release old collision point if exists
            if (this.lastCollisionPoint) {
              Vector3Pool.release(this.lastCollisionPoint)
            }
            collisionPoint = Vector3Pool.acquire(obj.position.x, PHYSICS.CAR.COLLISION_POINT_HEIGHT, obj.position.z)
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
          if (Math.abs(this.velocity.z) > PHYSICS.MOVEMENT.IMPACT_VELOCITY_THRESHOLD) {
            collided = true
            // Release old collision point if exists
            if (this.lastCollisionPoint) {
              Vector3Pool.release(this.lastCollisionPoint)
            }
            collisionPoint = Vector3Pool.acquire(obj.position.x, PHYSICS.CAR.COLLISION_POINT_HEIGHT, obj.position.z)
            this.lastCollisionPoint = collisionPoint
            this.velocity.z *= -this.physics.bounceRestitution
          } else {
            // For low speed, just zero out velocity in collision direction
            this.velocity.z = 0
          }
        }
        this.mesh.position.y = PHYSICS.WORLD.GROUND_LEVEL
        Vector3Pool.release(overlap)
        break
      }
    }

    // Check other player collisions - same logic as static objects
    for (const [id, otherCar] of this.otherPlayers) {
      if (id === this.playerId) continue
      const otherBox = new THREE.Box3().setFromObject(otherCar)
      if (this.boundingBox.intersectsBox(otherBox)) {
        // Get overlap on each axis
        const overlap = Vector3Pool.acquire()
        overlap.x = Math.min(this.boundingBox.max.x - otherBox.min.x, otherBox.max.x - this.boundingBox.min.x)
        overlap.z = Math.min(this.boundingBox.max.z - otherBox.min.z, otherBox.max.z - this.boundingBox.min.z)

        // Push back along smallest overlap axis
        if (overlap.x < overlap.z) {
          // Move back to just touching
          this.mesh.position.x += overlap.x * (this.boundingBox.min.x < otherBox.min.x ? -1 : 1)

          // Only apply bounce effects if impact is significant
          if (Math.abs(this.velocity.x) > PHYSICS.MOVEMENT.IMPACT_VELOCITY_THRESHOLD) {
            collided = true
            // Release old collision point if exists
            if (this.lastCollisionPoint) {
              Vector3Pool.release(this.lastCollisionPoint)
            }
            collisionPoint = Vector3Pool.acquire(otherCar.position.x, PHYSICS.CAR.COLLISION_POINT_HEIGHT, otherCar.position.z)
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
          if (Math.abs(this.velocity.z) > PHYSICS.MOVEMENT.IMPACT_VELOCITY_THRESHOLD) {
            collided = true
            // Release old collision point if exists
            if (this.lastCollisionPoint) {
              Vector3Pool.release(this.lastCollisionPoint)
            }
            collisionPoint = Vector3Pool.acquire(otherCar.position.x, PHYSICS.CAR.COLLISION_POINT_HEIGHT, otherCar.position.z)
            this.lastCollisionPoint = collisionPoint
            this.velocity.z *= -this.physics.bounceRestitution
          } else {
            // For low speed, just zero out velocity in collision direction
            this.velocity.z = 0
          }
        }
        this.mesh.position.y = PHYSICS.WORLD.GROUND_LEVEL
        Vector3Pool.release(overlap)
        break
      }
    }

    return collided
  }

  public update(input: JoystickState, deltaTime: number): void {
    // Update rotation based on input
    if (Math.abs(input.x) > PHYSICS.MOVEMENT.INPUT_DEADZONE) {
      this.mesh.rotation.y -= input.x * this.physics.turnSpeed * deltaTime
    }

    // Calculate forward direction
    const forward = Vector3Pool.acquire(0, 0, 1)
    const yAxis = Vector3Pool.acquire(0, 1, 0)
    forward.applyAxisAngle(yAxis, this.mesh.rotation.y)
    Vector3Pool.release(yAxis)

    // Update velocity based on input
    if (Math.abs(input.y) > PHYSICS.MOVEMENT.INPUT_DEADZONE) {
      const acceleration = forward.multiplyScalar(input.y * this.physics.acceleration * deltaTime)
      this.velocity.add(acceleration)
    }
    
    // Release the forward vector after use
    Vector3Pool.release(forward)

    // Apply friction
    this.velocity.multiplyScalar(1 - this.physics.friction * deltaTime)

    // Limit speed
    const speed = this.velocity.length()
    if (speed > this.physics.maxSpeed) {
      this.velocity.multiplyScalar(this.physics.maxSpeed / speed)
    }

    // Keep velocity in XZ plane
    this.velocity.y = PHYSICS.WORLD.GROUND_LEVEL

    // Update position
    const velocityDelta = Vector3Pool.acquire().copy(this.velocity).multiplyScalar(deltaTime)
    const newPosition = Vector3Pool.acquire().copy(this.mesh.position).add(velocityDelta)
    newPosition.y = PHYSICS.WORLD.GROUND_LEVEL // Keep Y position at ground level
    this.mesh.position.copy(newPosition)
    Vector3Pool.release(velocityDelta)
    Vector3Pool.release(newPosition)

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
    return Vector3Pool.acquire().copy(this.mesh.position)
  }

  public getMesh(): THREE.Group {
    return this.mesh
  }

  public getCollisionState(): boolean {
    return this.hasCollided
  }

  public getCollisionPoint(): THREE.Vector3 | undefined {
    return this.lastCollisionPoint ? Vector3Pool.acquire().copy(this.lastCollisionPoint) : undefined
  }

  public setUsername(username: string): void {
    this.username = username
    // Recreate car mesh with new username
    const oldPosition = Vector3Pool.acquire().copy(this.mesh.position)
    const oldRotation = this.mesh.rotation.clone() // Euler, not Vector3
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
    
    // Release the pooled vector (not the Euler rotation)
    Vector3Pool.release(oldPosition)

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

  /**
   * Dispose of all resources used by this car
   */
  public dispose(): void {
    // Dispose of the mesh and all its children
    ResourceManager.disposeObject3D(this.mesh)
    
    // Clear references
    this.polls = []
    this.obstacles = []
    this.walls = []
    this.otherPlayers.clear()
    this.audioManager = undefined
    
    // Release Vector3 instances if using pooling
    if (this.lastCollisionPoint) {
      Vector3Pool.release(this.lastCollisionPoint)
      this.lastCollisionPoint = undefined
    }
  }
}
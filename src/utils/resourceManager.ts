import * as THREE from 'three'

/**
 * Utility for proper disposal of Three.js resources to prevent memory leaks
 */
export class ResourceManager {
  private static disposedCount = 0

  /**
   * Dispose of a Three.js material
   */
  static disposeMaterial(material: THREE.Material | THREE.Material[]): void {
    if (Array.isArray(material)) {
      material.forEach(m => this.disposeMaterial(m))
      return
    }

    if (material instanceof THREE.Material) {
      // Dispose of any textures
      const materialWithMap = material as any
      const maps = ['map', 'alphaMap', 'aoMap', 'bumpMap', 'displacementMap', 
                    'emissiveMap', 'envMap', 'lightMap', 'metalnessMap', 
                    'normalMap', 'roughnessMap']
      
      maps.forEach(mapName => {
        if (materialWithMap[mapName] && materialWithMap[mapName].dispose) {
          materialWithMap[mapName].dispose()
          this.disposedCount++
        }
      })

      material.dispose()
      this.disposedCount++
    }
  }

  /**
   * Dispose of a Three.js geometry
   */
  static disposeGeometry(geometry: THREE.BufferGeometry): void {
    if (geometry && geometry.dispose) {
      geometry.dispose()
      this.disposedCount++
    }
  }

  /**
   * Recursively dispose of a Three.js object and all its children
   */
  static disposeObject3D(object: THREE.Object3D): void {
    if (!object) return

    // Dispose of children first
    while (object.children.length > 0) {
      const child = object.children[0]
      if (child) {
        object.remove(child)
        this.disposeObject3D(child)
      }
    }

    // Dispose of geometry and material if it's a mesh
    if (object instanceof THREE.Mesh) {
      if (object.geometry) {
        this.disposeGeometry(object.geometry)
      }
      if (object.material) {
        this.disposeMaterial(object.material)
      }
    }

    // Dispose of line materials
    if (object instanceof THREE.Line) {
      if (object.geometry) {
        this.disposeGeometry(object.geometry)
      }
      if (object.material) {
        this.disposeMaterial(object.material)
      }
    }

    // Clear any references
    if (object.parent) {
      object.parent.remove(object)
    }
  }

  /**
   * Get count of disposed resources (for debugging)
   */
  static getDisposedCount(): number {
    return this.disposedCount
  }

  /**
   * Reset disposed count
   */
  static resetDisposedCount(): void {
    this.disposedCount = 0
  }
}

/**
 * Object pool for frequently created/destroyed objects like Vector3
 */
export class Vector3Pool {
  private static pool: THREE.Vector3[] = []
  private static maxPoolSize = 100

  /**
   * Get a Vector3 from the pool or create a new one
   */
  static acquire(x = 0, y = 0, z = 0): THREE.Vector3 {
    if (this.pool.length > 0) {
      const vector = this.pool.pop()!
      vector.set(x, y, z)
      return vector
    }
    return new THREE.Vector3(x, y, z)
  }

  /**
   * Return a Vector3 to the pool for reuse
   */
  static release(vector: THREE.Vector3): void {
    if (this.pool.length < this.maxPoolSize) {
      vector.set(0, 0, 0) // Reset to avoid stale data
      this.pool.push(vector)
    }
  }

  /**
   * Clear the pool
   */
  static clear(): void {
    this.pool.length = 0
  }

  /**
   * Get current pool size (for debugging)
   */
  static getPoolSize(): number {
    return this.pool.length
  }
}

/**
 * Object pool for Quaternions
 */
export class QuaternionPool {
  private static pool: THREE.Quaternion[] = []
  private static maxPoolSize = 50

  static acquire(): THREE.Quaternion {
    if (this.pool.length > 0) {
      const quaternion = this.pool.pop()!
      quaternion.identity()
      return quaternion
    }
    return new THREE.Quaternion()
  }

  static release(quaternion: THREE.Quaternion): void {
    if (this.pool.length < this.maxPoolSize) {
      quaternion.identity()
      this.pool.push(quaternion)
    }
  }

  static clear(): void {
    this.pool.length = 0
  }

  static getPoolSize(): number {
    return this.pool.length
  }
}
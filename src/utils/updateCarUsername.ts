import * as THREE from 'three'
import { createTextTexture } from './createTextTexture'

/**
 * Updates the username plates on an existing car mesh without recreating the entire car
 */
export function updateCarUsername(carGroup: THREE.Group, newUsername: string | undefined): void {
  // Remove existing name plates
  const namePlates = carGroup.children.filter(
    (child) => child.userData.isNamePlate
  )
  namePlates.forEach((plate) => {
    // Dispose of old textures and materials
    if (plate instanceof THREE.Mesh) {
      const material = plate.material as THREE.MeshBasicMaterial
      material.map?.dispose()
      material.dispose()
      plate.geometry.dispose()
    }
    carGroup.remove(plate)
  })

  // Add new username plates if username is provided
  if (newUsername) {
    const texture = createTextTexture(newUsername)

    // Create name plate helper function
    const createNamePlate = (
      width: number,
      height: number,
      position: THREE.Vector3,
      rotation: THREE.Euler
    ): void => {
      const geometry = new THREE.PlaneGeometry(width, height)
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.copy(position)
      mesh.rotation.copy(rotation)
      mesh.userData.isNamePlate = true
      carGroup.add(mesh)
    }

    // Left side name
    createNamePlate(
      2.2,
      0.5,
      new THREE.Vector3(-1.01, 0.5, 0),
      new THREE.Euler(0, -Math.PI / 2, 0)
    )

    // Right side name
    createNamePlate(
      2.2,
      0.5,
      new THREE.Vector3(1.01, 0.5, 0),
      new THREE.Euler(0, Math.PI / 2, 0)
    )

    // Hood name
    createNamePlate(
      1.5,
      1.5,
      new THREE.Vector3(0, 0.51, 1),
      new THREE.Euler(-Math.PI / 2, 0, 0)
    )
  }

  // Update username in userData
  carGroup.userData.username = newUsername
}
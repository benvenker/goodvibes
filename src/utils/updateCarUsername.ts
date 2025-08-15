import * as THREE from 'three'
import { CAR_MESH } from '../config/constants'
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
      CAR_MESH.NAME_PLATES.SIDE.WIDTH,
      CAR_MESH.NAME_PLATES.SIDE.HEIGHT,
      new THREE.Vector3(CAR_MESH.NAME_PLATES.SIDE.LEFT_X, CAR_MESH.NAME_PLATES.SIDE.Y_POSITION, 0),
      new THREE.Euler(0, -Math.PI / 2, 0)
    )

    // Right side name
    createNamePlate(
      CAR_MESH.NAME_PLATES.SIDE.WIDTH,
      CAR_MESH.NAME_PLATES.SIDE.HEIGHT,
      new THREE.Vector3(CAR_MESH.NAME_PLATES.SIDE.RIGHT_X, CAR_MESH.NAME_PLATES.SIDE.Y_POSITION, 0),
      new THREE.Euler(0, Math.PI / 2, 0)
    )

    // Hood name
    createNamePlate(
      CAR_MESH.NAME_PLATES.HOOD.WIDTH,
      CAR_MESH.NAME_PLATES.HOOD.HEIGHT,
      new THREE.Vector3(0, CAR_MESH.NAME_PLATES.HOOD.Y_POSITION, CAR_MESH.NAME_PLATES.HOOD.Z_POSITION),
      new THREE.Euler(-Math.PI / 2, 0, 0)
    )
  }

  // Update username in userData
  carGroup.userData.username = newUsername
}
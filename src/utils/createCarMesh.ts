import * as THREE from 'three'
import { CAR_MESH } from '../config/constants'
import { createTextTexture } from './createTextTexture'

interface CarMeshOptions {
  bodyColor?: number | string
  roofColor?: number
  username?: string
}

export function createCarMesh({
  bodyColor = 0x2196f3,
  roofColor = 0x1976d2,
  username,
}: CarMeshOptions = {}): THREE.Group {
  const carGroup = new THREE.Group()
  carGroup.userData.type = 'player'

  // Car body
  const bodyGeometry = new THREE.BoxGeometry(CAR_MESH.BODY.WIDTH, CAR_MESH.BODY.HEIGHT, CAR_MESH.BODY.LENGTH)
  const bodyMaterial = new THREE.MeshPhongMaterial({ color: bodyColor })
  const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial)
  bodyMesh.position.y = CAR_MESH.BODY.Y_POSITION
  bodyMesh.castShadow = true
  bodyMesh.receiveShadow = true
  carGroup.add(bodyMesh)

  // Add name textures if username is provided
  if (username) {
    const texture = createTextTexture(username)

    // Left side name - full size of car side
    const leftNameGeometry = new THREE.PlaneGeometry(CAR_MESH.NAME_PLATES.SIDE.WIDTH, CAR_MESH.NAME_PLATES.SIDE.HEIGHT) // Width between wheels, height matches body
    const leftNameMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    const leftNameMesh = new THREE.Mesh(leftNameGeometry, leftNameMaterial)
    leftNameMesh.rotation.y = -Math.PI / 2
    leftNameMesh.position.set(CAR_MESH.NAME_PLATES.SIDE.LEFT_X, CAR_MESH.NAME_PLATES.SIDE.Y_POSITION, 0) // Centered on car side
    carGroup.add(leftNameMesh)

    // Right side name - full size of car side
    const rightNameGeometry = new THREE.PlaneGeometry(CAR_MESH.NAME_PLATES.SIDE.WIDTH, CAR_MESH.NAME_PLATES.SIDE.HEIGHT) // Width between wheels, height matches body
    const rightNameMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    const rightNameMesh = new THREE.Mesh(rightNameGeometry, rightNameMaterial)
    rightNameMesh.rotation.y = Math.PI / 2
    rightNameMesh.position.set(CAR_MESH.NAME_PLATES.SIDE.RIGHT_X, CAR_MESH.NAME_PLATES.SIDE.Y_POSITION, 0) // Centered on car side
    carGroup.add(rightNameMesh)

    // Hood name - almost full size of hood
    const hoodNameGeometry = new THREE.PlaneGeometry(CAR_MESH.NAME_PLATES.HOOD.WIDTH, CAR_MESH.NAME_PLATES.HOOD.HEIGHT) // Adjusted to be square but fit within hood
    const hoodNameMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    const hoodNameMesh = new THREE.Mesh(hoodNameGeometry, hoodNameMaterial)
    hoodNameMesh.rotation.x = -Math.PI / 2
    hoodNameMesh.position.set(0, CAR_MESH.NAME_PLATES.HOOD.Y_POSITION, CAR_MESH.NAME_PLATES.HOOD.Z_POSITION) // Centered on hood
    carGroup.add(hoodNameMesh)

    // Store username in userData for comparison during updates
    carGroup.userData.username = username
  }

  // Car roof
  const roofGeometry = new THREE.BoxGeometry(CAR_MESH.ROOF.WIDTH, CAR_MESH.ROOF.HEIGHT, CAR_MESH.ROOF.LENGTH)
  const roofMaterial = new THREE.MeshPhongMaterial({ color: roofColor })
  const roofMesh = new THREE.Mesh(roofGeometry, roofMaterial)
  roofMesh.position.y = CAR_MESH.ROOF.Y_POSITION
  carGroup.add(roofMesh)

  // Wheels
  const wheelGeometry = new THREE.CylinderGeometry(CAR_MESH.WHEELS.RADIUS, CAR_MESH.WHEELS.RADIUS, CAR_MESH.WHEELS.HEIGHT, CAR_MESH.WHEELS.SEGMENTS)
  const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x212121 })

  const wheelPositions = CAR_MESH.WHEELS.POSITIONS

  wheelPositions.forEach((pos) => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial)
    wheel.rotation.z = Math.PI / 2
    wheel.position.set(pos.x, CAR_MESH.WHEELS.Y_POSITION, pos.z)
    carGroup.add(wheel)
  })

  // Add bumpers
  const bumperGeometry = new THREE.BoxGeometry(CAR_MESH.BUMPERS.WIDTH, CAR_MESH.BUMPERS.HEIGHT, CAR_MESH.BUMPERS.DEPTH)
  const bumperMaterial = new THREE.MeshPhongMaterial({ color: 0x424242 })

  const frontBumper = new THREE.Mesh(bumperGeometry, bumperMaterial)
  frontBumper.position.set(0, CAR_MESH.BUMPERS.Y_POSITION, CAR_MESH.BUMPERS.FRONT_Z)
  carGroup.add(frontBumper)

  const backBumper = new THREE.Mesh(bumperGeometry, bumperMaterial)
  backBumper.position.set(0, CAR_MESH.BUMPERS.Y_POSITION, CAR_MESH.BUMPERS.BACK_Z)
  carGroup.add(backBumper)

  // Add headlights
  const headlightGeometry = new THREE.CircleGeometry(CAR_MESH.LIGHTS.RADIUS, CAR_MESH.LIGHTS.SEGMENTS)
  const headlightMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 1,
  })

  // Front left headlight
  const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial)
  leftHeadlight.position.set(-CAR_MESH.LIGHTS.X_OFFSET, CAR_MESH.LIGHTS.Y_POSITION, CAR_MESH.LIGHTS.HEADLIGHT_Z)
  carGroup.add(leftHeadlight)

  // Front right headlight
  const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial)
  rightHeadlight.position.set(CAR_MESH.LIGHTS.X_OFFSET, CAR_MESH.LIGHTS.Y_POSITION, CAR_MESH.LIGHTS.HEADLIGHT_Z)
  carGroup.add(rightHeadlight)

  // Add taillights
  const taillightGeometry = new THREE.CircleGeometry(CAR_MESH.LIGHTS.RADIUS, CAR_MESH.LIGHTS.SEGMENTS)
  const taillightMaterial = new THREE.MeshPhongMaterial({
    color: 0xff0000,
    emissive: 0xff0000,
    emissiveIntensity: 1,
  })

  // Back left taillight
  const leftTaillight = new THREE.Mesh(taillightGeometry, taillightMaterial)
  leftTaillight.position.set(-CAR_MESH.LIGHTS.X_OFFSET, CAR_MESH.LIGHTS.Y_POSITION, CAR_MESH.LIGHTS.TAILLIGHT_Z)
  carGroup.add(leftTaillight)

  // Back right taillight
  const rightTaillight = new THREE.Mesh(taillightGeometry, taillightMaterial)
  rightTaillight.position.set(CAR_MESH.LIGHTS.X_OFFSET, CAR_MESH.LIGHTS.Y_POSITION, CAR_MESH.LIGHTS.TAILLIGHT_Z)
  carGroup.add(rightTaillight)

  return carGroup
}

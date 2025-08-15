import * as THREE from 'three'
import { createTextTexture } from './createTextTexture'

interface CarMeshOptions {
  bodyColor?: number | string
  roofColor?: number
  username?: string
}

interface WheelPosition {
  x: number
  z: number
}

interface LightPosition {
  x: number
  y: number
  z: number
}

function createCarBody(color: number | string): THREE.Mesh {
  const bodyGeometry = new THREE.BoxGeometry(2, 0.5, 4)
  const bodyMaterial = new THREE.MeshPhongMaterial({ color })
  const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial)
  bodyMesh.position.y = 0.5
  bodyMesh.castShadow = true
  bodyMesh.receiveShadow = true
  return bodyMesh
}

function createCarRoof(color: number): THREE.Mesh {
  const roofGeometry = new THREE.BoxGeometry(1.5, 0.4, 2)
  const roofMaterial = new THREE.MeshPhongMaterial({ color })
  const roofMesh = new THREE.Mesh(roofGeometry, roofMaterial)
  roofMesh.position.y = 1.2
  return roofMesh
}

function createNamePlate(
  texture: THREE.Texture,
  width: number,
  height: number
): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(width, height)
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.userData.isNamePlate = true // Mark as name plate for easy identification
  return mesh
}

function addUsernamePlates(carGroup: THREE.Group, username: string): void {
  const texture = createTextTexture(username)

  // Left side name
  const leftNameMesh = createNamePlate(texture, 2.2, 0.5)
  leftNameMesh.rotation.y = -Math.PI / 2
  leftNameMesh.position.set(-1.01, 0.5, 0)
  carGroup.add(leftNameMesh)

  // Right side name
  const rightNameMesh = createNamePlate(texture, 2.2, 0.5)
  rightNameMesh.rotation.y = Math.PI / 2
  rightNameMesh.position.set(1.01, 0.5, 0)
  carGroup.add(rightNameMesh)

  // Hood name
  const hoodNameMesh = createNamePlate(texture, 1.5, 1.5)
  hoodNameMesh.rotation.x = -Math.PI / 2
  hoodNameMesh.position.set(0, 0.51, 1)
  carGroup.add(hoodNameMesh)

  // Store username in userData for comparison during updates
  carGroup.userData.username = username
}

function createWheel(): THREE.Mesh {
  const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.4, 32)
  const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x212121 })
  const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial)
  wheel.rotation.z = Math.PI / 2
  return wheel
}

function addWheels(carGroup: THREE.Group): void {
  const wheelPositions: WheelPosition[] = [
    { x: -1.1, z: 1.5 }, // Front Left
    { x: 1.1, z: 1.5 }, // Front Right
    { x: -1.1, z: -1.5 }, // Back Left
    { x: 1.1, z: -1.5 }, // Back Right
  ]

  wheelPositions.forEach((pos) => {
    const wheel = createWheel()
    wheel.position.set(pos.x, 0.4, pos.z)
    carGroup.add(wheel)
  })
}

function createBumper(): THREE.Mesh {
  const bumperGeometry = new THREE.BoxGeometry(2.2, 0.4, 0.3)
  const bumperMaterial = new THREE.MeshPhongMaterial({ color: 0x424242 })
  return new THREE.Mesh(bumperGeometry, bumperMaterial)
}

function addBumpers(carGroup: THREE.Group): void {
  const frontBumper = createBumper()
  frontBumper.position.set(0, 0.4, 2)
  carGroup.add(frontBumper)

  const backBumper = createBumper()
  backBumper.position.set(0, 0.4, -2)
  carGroup.add(backBumper)
}

function createLight(color: number, emissive: number): THREE.Mesh {
  const geometry = new THREE.CircleGeometry(0.15, 32)
  const material = new THREE.MeshPhongMaterial({
    color,
    emissive,
    emissiveIntensity: 1,
  })
  return new THREE.Mesh(geometry, material)
}

function addLights(carGroup: THREE.Group): void {
  const headlightPositions: LightPosition[] = [
    { x: -0.7, y: 0.6, z: 2.01 }, // Front left
    { x: 0.7, y: 0.6, z: 2.01 }, // Front right
  ]

  const taillightPositions: LightPosition[] = [
    { x: -0.7, y: 0.6, z: -2.01 }, // Back left
    { x: 0.7, y: 0.6, z: -2.01 }, // Back right
  ]

  // Add headlights
  headlightPositions.forEach((pos) => {
    const headlight = createLight(0xffffff, 0xffffff)
    headlight.position.set(pos.x, pos.y, pos.z)
    carGroup.add(headlight)
  })

  // Add taillights
  taillightPositions.forEach((pos) => {
    const taillight = createLight(0xff0000, 0xff0000)
    taillight.position.set(pos.x, pos.y, pos.z)
    carGroup.add(taillight)
  })
}

export function createCarMesh({
  bodyColor = 0x2196f3,
  roofColor = 0x1976d2,
  username,
}: CarMeshOptions = {}): THREE.Group {
  const carGroup = new THREE.Group()
  carGroup.userData.type = 'player'

  // Add car components
  carGroup.add(createCarBody(bodyColor))
  carGroup.add(createCarRoof(roofColor))
  
  if (username) {
    addUsernamePlates(carGroup, username)
  }
  
  addWheels(carGroup)
  addBumpers(carGroup)
  addLights(carGroup)

  return carGroup
}

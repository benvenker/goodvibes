import * as THREE from 'three'
import { CAMERA } from '../config/constants'

const offsetVector = new THREE.Vector3(0, 1, 0)
const cameraOffset = new THREE.Vector3(CAMERA.OFFSET.x, CAMERA.OFFSET.y, CAMERA.OFFSET.z)
export class CameraController {
  private camera: THREE.PerspectiveCamera

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera
    this.initializeCamera()
  }

  private initializeCamera(): void {
    this.camera.position.set(CAMERA.INITIAL_POSITION.x, CAMERA.INITIAL_POSITION.y, CAMERA.INITIAL_POSITION.z)
    this.camera.lookAt(0, 0, 0)
  }

  public handleResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
  }

  public update(entity: THREE.Object3D): void {
    const { position, rotation } = entity
    // Position camera behind and slightly above the car
    cameraOffset.set(CAMERA.OFFSET.x, CAMERA.OFFSET.y, CAMERA.OFFSET.z)
    // Rotate the offset based on car's rotation to follow behind
    cameraOffset.applyAxisAngle(offsetVector, rotation.y)
    const targetPosition = position.clone().add(cameraOffset)

    // Smoothly move camera to new position
    this.camera.position.lerp(targetPosition, CAMERA.LERP_FACTOR)
    // Look slightly ahead of the car
    const lookAtPosition = position.clone().add(offsetVector)
    this.camera.lookAt(lookAtPosition)
  }
}

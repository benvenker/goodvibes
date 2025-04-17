import * as THREE from 'three'

const offsetVector = new THREE.Vector3(0, 1, 0)
const cameraOffset = new THREE.Vector3(0, 5, -8)
export class CameraController {
  private camera: THREE.PerspectiveCamera

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera
    this.initializeCamera()
  }

  private initializeCamera(): void {
    this.camera.position.set(0, 10, -10)
    this.camera.lookAt(0, 0, 0)
  }

  public handleResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
  }

  public update(entity: THREE.Object3D): void {
    const { position, rotation } = entity
    // Position camera behind and slightly above the car
    cameraOffset.set(0, 5, -8)
    // Rotate the offset based on car's rotation to follow behind
    cameraOffset.applyAxisAngle(offsetVector, rotation.y)
    const targetPosition = position.clone().add(cameraOffset)

    // Smoothly move camera to new position
    this.camera.position.lerp(targetPosition, 0.05)
    // Look slightly ahead of the car
    const lookAtPosition = position.clone().add(offsetVector)
    this.camera.lookAt(lookAtPosition)
  }
}

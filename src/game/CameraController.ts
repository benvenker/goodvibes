import * as THREE from 'three'

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

  public update(car: THREE.Object3D): void {
    const carPosition = car.position
    // Position camera behind and slightly above the car
    const cameraOffset = new THREE.Vector3(0, 5, -8)
    // Rotate the offset based on car's rotation to follow behind
    cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), car.rotation.y)
    const targetPosition = carPosition.clone().add(cameraOffset)

    // Smoothly move camera to new position
    this.camera.position.lerp(targetPosition, 0.05)
    // Look slightly ahead of the car
    const lookAtPosition = carPosition.clone().add(new THREE.Vector3(0, 1, 0))
    this.camera.lookAt(lookAtPosition)
  }
}

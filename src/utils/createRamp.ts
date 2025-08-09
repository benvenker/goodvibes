import * as THREE from 'three'

export interface RampOptions {
  width?: number
  length?: number
  height?: number
  color?: number
  angle?: number
}

export function createRamp({
  width = 8,
  length = 12,
  height = 6,
  color = 0xff6b00,
  angle = 30
}: RampOptions = {}): THREE.Mesh {
  // Create a wedge shape for the ramp
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.lineTo(length, 0)
  shape.lineTo(length, height)
  shape.lineTo(0, 0)
  
  const extrudeSettings = {
    steps: 1,
    depth: width,
    bevelEnabled: false
  }
  
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
  
  // Center the geometry
  geometry.translate(-length / 2, 0, -width / 2)
  
  // Create material with stripes for visibility
  const material = new THREE.MeshPhongMaterial({ 
    color: color,
    emissive: color,
    emissiveIntensity: 0.2,
    shininess: 100
  })
  
  const ramp = new THREE.Mesh(geometry, material)
  ramp.castShadow = true
  ramp.receiveShadow = true
  ramp.userData.type = 'ramp'
  
  // Add stripes for better visibility
  const stripeGeometry = new THREE.BoxGeometry(1, 0.1, width)
  const stripeMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xffff00,
    emissive: 0xffff00,
    emissiveIntensity: 0.5
  })
  
  // Add yellow warning stripes along the ramp
  for (let i = 0; i < 3; i++) {
    const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial)
    const t = (i + 1) / 4 // Position along ramp
    stripe.position.set(
      -length / 2 + length * t,
      height * t + 0.05,
      0
    )
    stripe.rotation.z = Math.atan2(height, length)
    ramp.add(stripe)
  }
  
  return ramp
}
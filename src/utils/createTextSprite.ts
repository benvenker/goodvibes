import * as THREE from 'three'
import { CAR_MESH, UI } from '../config/constants'

export function createTextSprite(text: string): THREE.Sprite {
  // Create a canvas to draw the text
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')!

  // Set canvas size
  canvas.width = UI.CANVAS.TEXT_SPRITE.WIDTH
  canvas.height = UI.CANVAS.TEXT_SPRITE.HEIGHT

  // Configure text style
  context.font = `Bold ${UI.CANVAS.TEXT_SPRITE.FONT_SIZE}px Arial`
  context.fillStyle = 'white'
  context.strokeStyle = 'black'
  context.lineWidth = UI.CANVAS.TEXT_SPRITE.OUTLINE_WIDTH

  // Center the text
  context.textAlign = 'center'
  context.textBaseline = 'middle'

  // Draw text with outline
  const x = canvas.width / 2
  const y = canvas.height / 2
  context.strokeText(text, x, y)
  context.fillText(text, x, y)

  // Create sprite from canvas
  const texture = new THREE.Texture(canvas)
  texture.needsUpdate = true

  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    sizeAttenuation: true,
  })

  const sprite = new THREE.Sprite(spriteMaterial)
  sprite.scale.set(CAR_MESH.TEXT_SPRITE.SCALE.x, CAR_MESH.TEXT_SPRITE.SCALE.y, CAR_MESH.TEXT_SPRITE.SCALE.z)

  return sprite
}

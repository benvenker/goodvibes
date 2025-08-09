import type { JoystickState } from './TouchControls'

export class KeyboardControls {
  private moveState: JoystickState = { x: 0, y: 0, boost: false }
  private keys = new Set<string>()

  constructor() {
    this.setupKeyboardEvents()
  }

  private setupKeyboardEvents(): void {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e))
    document.addEventListener('keyup', (e) => this.handleKeyUp(e))
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const key = e.key.toLowerCase()
    
    // Handle WASD keys
    if (['w', 'a', 's', 'd'].includes(key)) {
      this.keys.add(key)
      this.updateMoveState()
      return
    }
    
    // Handle spacebar for boost
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault() // Prevent page scroll
      this.keys.add('space')
      this.updateMoveState()
      return
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowUp') {
      this.keys.add('arrowup')
      this.updateMoveState()
    } else if (e.key === 'ArrowDown') {
      this.keys.add('arrowdown')
      this.updateMoveState()
    } else if (e.key === 'ArrowLeft') {
      this.keys.add('arrowleft')
      this.updateMoveState()
    } else if (e.key === 'ArrowRight') {
      this.keys.add('arrowright')
      this.updateMoveState()
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    const key = e.key.toLowerCase()
    
    // Handle WASD keys
    if (['w', 'a', 's', 'd'].includes(key)) {
      this.keys.delete(key)
      this.updateMoveState()
      return
    }
    
    // Handle spacebar for boost
    if (e.key === ' ' || e.code === 'Space') {
      this.keys.delete('space')
      this.updateMoveState()
      return
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowUp') {
      this.keys.delete('arrowup')
      this.updateMoveState()
    } else if (e.key === 'ArrowDown') {
      this.keys.delete('arrowdown')
      this.updateMoveState()
    } else if (e.key === 'ArrowLeft') {
      this.keys.delete('arrowleft')
      this.updateMoveState()
    } else if (e.key === 'ArrowRight') {
      this.keys.delete('arrowright')
      this.updateMoveState()
    }
  }

  private updateMoveState(): void {
    // Reset move state
    this.moveState = { x: 0, y: 0, boost: false }

    // Forward/Backward (W/S or Arrow keys)
    if (this.keys.has('w') || this.keys.has('arrowup')) this.moveState.y += 1
    if (this.keys.has('s') || this.keys.has('arrowdown')) this.moveState.y -= 1

    // Left/Right (A/D or Arrow keys)
    if (this.keys.has('a') || this.keys.has('arrowleft')) this.moveState.x -= 1
    if (this.keys.has('d') || this.keys.has('arrowright')) this.moveState.x += 1
    
    // Boost (Spacebar)
    if (this.keys.has('space')) this.moveState.boost = true
  }

  public getMoveState(): JoystickState {
    return this.moveState
  }
}

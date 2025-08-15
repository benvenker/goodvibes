export interface JoystickState {
  x: number
  y: number
}

export class TouchControls {
  private moveJoystick: HTMLElement | null
  private rotateJoystick: HTMLElement | null
  private moveState: JoystickState = { x: 0, y: 0 }
  private rotateState: JoystickState = { x: 0, y: 0 }
  private activeTouches: Map<number, { joystick: HTMLElement; startX: number; startY: number }> = new Map()
  private activeMouseJoystick: { joystick: HTMLElement; startX: number; startY: number } | null = null
  private disabled = false
  
  // Event handlers for cleanup
  private touchStartHandler: (e: TouchEvent) => void
  private touchMoveHandler: (e: TouchEvent) => void
  private touchEndHandler: (e: TouchEvent) => void
  private touchCancelHandler: (e: TouchEvent) => void
  private mouseMoveHandler: (e: MouseEvent) => void
  private mouseUpHandler: () => void
  private moveJoystickMouseDownHandler: (e: MouseEvent) => void
  private rotateJoystickMouseDownHandler: (e: MouseEvent) => void

  constructor() {
    this.moveJoystick = document.getElementById('move-joystick')
    this.rotateJoystick = document.getElementById('rotate-joystick')
    
    // Check if required DOM elements exist
    if (!this.moveJoystick || !this.rotateJoystick) {
      console.warn('TouchControls: Joystick elements not found in DOM. Touch controls disabled.')
      this.disabled = true
      // Initialize handlers as no-ops to avoid null reference errors
      this.touchStartHandler = () => {}
      this.touchMoveHandler = () => {}
      this.touchEndHandler = () => {}
      this.touchCancelHandler = () => {}
      this.mouseMoveHandler = () => {}
      this.mouseUpHandler = () => {}
      this.moveJoystickMouseDownHandler = () => {}
      this.rotateJoystickMouseDownHandler = () => {}
      return
    }
    
    // Bind event handlers
    this.touchStartHandler = (e) => this.handleTouchStart(e)
    this.touchMoveHandler = (e) => this.handleTouchMove(e)
    this.touchEndHandler = (e) => this.handleTouchEnd(e)
    this.touchCancelHandler = (e) => this.handleTouchEnd(e) // Reuse touchEnd logic for cancel
    this.mouseMoveHandler = (e) => this.handleMouseMove(e)
    this.mouseUpHandler = () => this.handleMouseUp()
    this.moveJoystickMouseDownHandler = (e) => this.handleMouseDown(e)
    this.rotateJoystickMouseDownHandler = (e) => this.handleMouseDown(e)
    
    this.setupTouchEvents()
    this.setupMouseEvents()
  }

  private setupTouchEvents(): void {
    if (this.disabled) return
    document.addEventListener('touchstart', this.touchStartHandler)
    document.addEventListener('touchmove', this.touchMoveHandler, { passive: false })
    document.addEventListener('touchend', this.touchEndHandler)
    document.addEventListener('touchcancel', this.touchCancelHandler)
  }

  private setupMouseEvents(): void {
    if (this.disabled) return
    this.moveJoystick!.addEventListener('mousedown', this.moveJoystickMouseDownHandler)
    this.rotateJoystick!.addEventListener('mousedown', this.rotateJoystickMouseDownHandler)
    document.addEventListener('mousemove', this.mouseMoveHandler)
    document.addEventListener('mouseup', this.mouseUpHandler)
  }

  private handleMouseDown(e: MouseEvent): void {
    const joystick = e.currentTarget as HTMLElement
    const rect = joystick.getBoundingClientRect()
    this.activeMouseJoystick = {
      joystick,
      startX: rect.left + rect.width / 2,
      startY: rect.top + rect.height / 2,
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.activeMouseJoystick) return

    const dx = e.clientX - this.activeMouseJoystick.startX
    const dy = e.clientY - this.activeMouseJoystick.startY
    const distance = Math.min(Math.sqrt(dx * dx + dy * dy), 35)
    const angle = Math.atan2(dy, dx)

    const x = Math.cos(angle) * distance
    const y = Math.sin(angle) * distance

    const knob = this.activeMouseJoystick.joystick.querySelector('.joystick-knob') as HTMLElement
    knob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`

    if (this.activeMouseJoystick.joystick === this.moveJoystick) {
      this.moveState = {
        x: x / 35,
        y: -y / 35,
      }
    } else {
      this.rotateState = {
        x: x / 35,
        y: -y / 35,
      }
    }
  }

  private handleMouseUp(): void {
    if (!this.activeMouseJoystick) return

    const knob = this.activeMouseJoystick.joystick.querySelector('.joystick-knob') as HTMLElement
    knob.style.transform = 'translate(-50%, -50%)'

    if (this.activeMouseJoystick.joystick === this.moveJoystick) {
      this.moveState = { x: 0, y: 0 }
    } else {
      this.rotateState = { x: 0, y: 0 }
    }

    this.activeMouseJoystick = null
  }

  private handleTouchStart(e: TouchEvent): void {
    if (this.disabled) return
    Array.from(e.changedTouches).forEach((touch) => {
      const moveJoystickRect = this.moveJoystick!.getBoundingClientRect()
      const rotateJoystickRect = this.rotateJoystick!.getBoundingClientRect()

      if (this.isPointInRect(touch.clientX, touch.clientY, moveJoystickRect)) {
        this.activeTouches.set(touch.identifier, {
          joystick: this.moveJoystick!,
          startX: moveJoystickRect.left + moveJoystickRect.width / 2,
          startY: moveJoystickRect.top + moveJoystickRect.height / 2,
        })
      } else if (this.isPointInRect(touch.clientX, touch.clientY, rotateJoystickRect)) {
        this.activeTouches.set(touch.identifier, {
          joystick: this.rotateJoystick!,
          startX: rotateJoystickRect.left + rotateJoystickRect.width / 2,
          startY: rotateJoystickRect.top + rotateJoystickRect.height / 2,
        })
      }
    })
  }

  private handleTouchMove(e: TouchEvent): void {
    if (this.disabled) return
    e.preventDefault()
    Array.from(e.changedTouches).forEach((touch) => {
      const touchData = this.activeTouches.get(touch.identifier)
      if (!touchData) return

      const dx = touch.clientX - touchData.startX
      const dy = touch.clientY - touchData.startY
      const distance = Math.min(Math.sqrt(dx * dx + dy * dy), 35)
      const angle = Math.atan2(dy, dx)

      const x = Math.cos(angle) * distance
      const y = Math.sin(angle) * distance

      const knob = touchData.joystick.querySelector('.joystick-knob') as HTMLElement
      knob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`

      if (touchData.joystick === this.moveJoystick) {
        this.moveState = {
          x: x / 35,
          y: -y / 35,
        }
      } else {
        this.rotateState = {
          x: x / 35,
          y: -y / 35,
        }
      }
    })
  }

  private handleTouchEnd(e: TouchEvent): void {
    Array.from(e.changedTouches).forEach((touch) => {
      const touchData = this.activeTouches.get(touch.identifier)
      if (!touchData) return

      const knob = touchData.joystick.querySelector('.joystick-knob') as HTMLElement
      knob.style.transform = 'translate(-50%, -50%)'

      if (touchData.joystick === this.moveJoystick) {
        this.moveState = { x: 0, y: 0 }
      } else {
        this.rotateState = { x: 0, y: 0 }
      }

      this.activeTouches.delete(touch.identifier)
    })
  }

  private isPointInRect(x: number, y: number, rect: DOMRect): boolean {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
  }

  public getMoveState(): JoystickState {
    return this.moveState
  }

  public getRotateState(): JoystickState {
    return this.rotateState
  }

  public dispose(): void {
    // Remove touch event listeners
    document.removeEventListener('touchstart', this.touchStartHandler)
    document.removeEventListener('touchmove', this.touchMoveHandler, { passive: false } as any)
    document.removeEventListener('touchend', this.touchEndHandler)
    document.removeEventListener('touchcancel', this.touchCancelHandler)
    
    // Remove mouse event listeners if not disabled
    if (!this.disabled && this.moveJoystick && this.rotateJoystick) {
      this.moveJoystick.removeEventListener('mousedown', this.moveJoystickMouseDownHandler)
      this.rotateJoystick.removeEventListener('mousedown', this.rotateJoystickMouseDownHandler)
    }
    document.removeEventListener('mousemove', this.mouseMoveHandler)
    document.removeEventListener('mouseup', this.mouseUpHandler)
    
    // Clear state
    this.activeTouches.clear()
    this.activeMouseJoystick = null
  }
}

import * as THREE from 'three'
import van from 'vanjs-core'
import { AudioManager } from '../AudioManager'
import { Car } from '../Car'
import { FpsWidget } from './widgets/FpsWidget'
import { VibescaleWidget } from './widgets/VibescaleWidget'

export class DebugPanel {
  private container!: HTMLDivElement
  private gearIcon!: HTMLDivElement
  private panel!: HTMLDivElement
  private fpsWidget: FpsWidget
  private vibescaleWidget: VibescaleWidget
  private fxButtons!: HTMLDivElement
  private errorDisplay!: HTMLDivElement
  private consoleErrors: string[] = []

  constructor(
    private car: Car,
    private audioManager: AudioManager
  ) {
    this.fpsWidget = new FpsWidget()
    this.vibescaleWidget = new VibescaleWidget(car)

    this.setupContainer()
    this.setupPanel()
    this.setupGearIcon()
    this.setupErrorHandling()
    this.update()
  }

  private setupContainer() {
    this.container = van.tags.div({
      style: 'position: fixed; top: 20px; left: 20px; z-index: 1000; display: none;',
    })
    document.body.appendChild(this.container)
  }

  public show(): void {
    this.container.style.display = 'block'
  }

  private setupGearIcon() {
    this.gearIcon = document.createElement('div')
    this.gearIcon.innerHTML = '⚙️'
    this.gearIcon.style.fontSize = '32px'
    this.gearIcon.style.cursor = 'pointer'
    this.gearIcon.style.transition = 'transform 0.3s'
    this.container.appendChild(this.gearIcon)

    // Restore panel state from localStorage
    const isPanelVisible = localStorage.getItem('debugPanelVisible') === 'true'
    this.panel.style.display = isPanelVisible ? 'block' : 'none'
    this.gearIcon.style.transform = isPanelVisible ? 'rotate(180deg)' : 'rotate(0deg)'

    this.gearIcon.addEventListener('click', () => {
      const newVisibility = this.panel.style.display === 'none' ? 'block' : 'none'
      this.panel.style.display = newVisibility
      this.gearIcon.style.transform = newVisibility === 'none' ? 'rotate(0deg)' : 'rotate(180deg)'
      // Save panel state to localStorage
      localStorage.setItem('debugPanelVisible', newVisibility === 'block' ? 'true' : 'false')
    })
  }

  private setupPanel() {
    this.panel = document.createElement('div')
    this.panel.style.display = 'none'
    this.panel.style.position = 'absolute'
    this.panel.style.top = '50px'
    this.panel.style.left = '0'
    this.panel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
    this.panel.style.color = 'white'
    this.panel.style.padding = '15px'
    this.panel.style.borderRadius = '5px'
    this.panel.style.minWidth = '300px'
    this.container.appendChild(this.panel)

    // Add FPS Widget
    this.panel.appendChild(this.fpsWidget.getElement())

    // Add Vibescale Widget
    this.panel.appendChild(this.vibescaleWidget.getElement())

    // FX Buttons
    this.fxButtons = document.createElement('div')
    this.fxButtons.style.marginBottom = '10px'
    this.panel.appendChild(this.fxButtons)
    this.setupFxButtons()

    // Error Display
    this.errorDisplay = document.createElement('div')
    this.errorDisplay.style.color = 'red'
    this.panel.appendChild(this.errorDisplay)
  }

  private setupFxButtons() {
    const createButton = (label: string, onClick: () => void) => {
      const button = document.createElement('button')
      button.textContent = label
      button.style.marginRight = '5px'
      button.style.marginBottom = '5px'
      button.style.padding = '5px 10px'
      button.style.backgroundColor = '#444'
      button.style.color = 'white'
      button.style.border = 'none'
      button.style.borderRadius = '3px'
      button.style.cursor = 'pointer'
      button.addEventListener('click', onClick)
      return button
    }

    // Add buttons for each sound effect
    const dummyPosition = new THREE.Vector3(0, 1, 0)
    this.fxButtons.appendChild(
      createButton('Collision', () => {
        this.audioManager.playCollisionSounds(dummyPosition)
      })
    )
  }

  private setupErrorHandling() {
    // Store original console.error
    const originalError = console.error
    console.error = (...args) => {
      // Call original console.error
      originalError.apply(console, args)

      // Add to our error list
      const errorMessage = args.map((arg) => (typeof arg === 'string' ? arg : JSON.stringify(arg))).join(' ')

      this.consoleErrors.push(errorMessage)
      // Keep only last 5 errors
      if (this.consoleErrors.length > 5) {
        this.consoleErrors.shift()
      }

      // Update gear icon color
      this.gearIcon.style.color = 'red'
    }

    // Clear errors when panel is opened
    this.gearIcon.addEventListener('click', () => {
      if (this.panel.style.display === 'none') {
        this.gearIcon.style.color = ''
      }
    })
  }

  public update() {
    const now = performance.now()

    // Update FPS widget
    this.fpsWidget.update(now)

    // Update Vibescale widget
    this.vibescaleWidget.update(now)

    // Update error display
    if (this.consoleErrors.length > 0) {
      this.errorDisplay.innerHTML = this.consoleErrors
        .map((err) => `<div style="margin-bottom: 5px;">${err}</div>`)
        .join('')
    } else {
      this.errorDisplay.textContent = ''
    }

    requestAnimationFrame(() => this.update())
  }

  /**
   * Clean up resources and remove event listeners
   */
  public dispose(): void {
    // Dispose of widgets
    this.vibescaleWidget.dispose()
    
    // Remove DOM element
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
    
    // Restore original console.error if we modified it
    // This would require storing the original reference, but for now we'll leave it
    // since console.error modifications are typically global for debugging
  }
}

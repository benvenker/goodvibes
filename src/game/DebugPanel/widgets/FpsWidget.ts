export class FpsWidget {
  private fpsDisplay: HTMLDivElement
  private frameCount = 0
  private fps = 0
  private lastFpsUpdate = performance.now()
  private readonly updateInterval = 500 // Update FPS every 500ms

  constructor() {
    this.fpsDisplay = document.createElement('div')
    this.fpsDisplay.style.marginBottom = '10px'
  }

  public getElement(): HTMLDivElement {
    return this.fpsDisplay
  }

  public update(now: number) {
    this.frameCount++

    // Update FPS every 500ms
    if (now - this.lastFpsUpdate >= this.updateInterval) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate))
      this.frameCount = 0
      this.lastFpsUpdate = now

      // Update display
      this.fpsDisplay.textContent = `FPS: ${this.fps}`
    }
  }
}

import { RoomEventType } from 'vibescale'
import { Car } from '../../Car'
import { Sparkline } from '../../Sparkline'
import { room } from '../../store'

export class VibescaleWidget {
  private container!: HTMLDivElement
  private statsContainer!: HTMLDivElement
  private urlDiv!: HTMLDivElement
  private totalMsgsDiv!: HTMLDivElement
  private bytesDiv!: HTMLDivElement
  private msgsDiv!: HTMLDivElement
  private userInfoDiv!: HTMLDivElement
  
  // Cached DOM references for frequent updates
  private bytesInSpan!: HTMLSpanElement
  private bytesOutSpan!: HTMLSpanElement
  private msgsInSpan!: HTMLSpanElement
  private msgsOutSpan!: HTMLSpanElement
  private totalMsgsInSpan!: HTMLSpanElement
  private totalMsgsOutSpan!: HTMLSpanElement

  // Network metrics tracking
  private lastMetricsUpdate = performance.now()
  private totalBytesIn = 0
  private totalBytesOut = 0
  private totalMsgsIn = 0
  private totalMsgsOut = 0
  private currentSecondBytesIn = 0
  private currentSecondBytesOut = 0
  private currentSecondMsgsIn = 0
  private currentSecondMsgsOut = 0

  private readonly WINDOW_SIZE = 60 // 60 seconds of history
  private windowIndex = 0
  private bytesInWindow: number[] = []
  private bytesOutWindow: number[] = []
  private msgsInWindow: number[] = []
  private msgsOutWindow: number[] = []

  // Network visualization
  private bytesInSparkline: Sparkline
  private bytesOutSparkline: Sparkline
  private msgsInSparkline: Sparkline
  private msgsOutSparkline: Sparkline

  // Event listeners for cleanup
  private rxListener?: (e: any) => void
  private txListener?: (e: any) => void

  constructor(private car: Car) {
    // Initialize sparklines
    this.bytesInSparkline = new Sparkline(60, 20, '#4ade80') // Green
    this.bytesOutSparkline = new Sparkline(60, 20, '#60a5fa') // Blue
    this.msgsInSparkline = new Sparkline(60, 20, '#4ade80') // Green
    this.msgsOutSparkline = new Sparkline(60, 20, '#60a5fa') // Blue

    this.setupContainer()
    this.setupWebSocketListeners()
  }

  private setupContainer() {
    this.container = document.createElement('div')
    this.container.style.marginBottom = '10px'

    // Create network stats container
    this.statsContainer = document.createElement('div')
    this.statsContainer.style.fontSize = '12px'
    this.statsContainer.style.fontFamily = 'monospace'

    // Server URL
    this.urlDiv = document.createElement('div')
    this.urlDiv.style.marginBottom = '5px'
    this.urlDiv.textContent = `Server: ${room.getEndpointUrl()}`
    this.statsContainer.appendChild(this.urlDiv)

    // User Info
    this.userInfoDiv = document.createElement('div')
    this.userInfoDiv.style.marginBottom = '5px'
    this.statsContainer.appendChild(this.userInfoDiv)

    // Total messages
    this.totalMsgsDiv = document.createElement('div')
    this.totalMsgsDiv.style.marginBottom = '5px'
    this.totalMsgsInSpan = document.createElement('span')
    this.totalMsgsInSpan.textContent = '0'
    this.totalMsgsOutSpan = document.createElement('span')
    this.totalMsgsOutSpan.textContent = '0'
    
    // Build DOM properly without innerHTML
    const totalMsgsInLabel = document.createTextNode('Total msgs in: ')
    this.totalMsgsDiv.appendChild(totalMsgsInLabel)
    this.totalMsgsDiv.appendChild(this.totalMsgsInSpan)
    
    const lineBreak = document.createElement('br')
    this.totalMsgsDiv.appendChild(lineBreak)
    
    const totalMsgsOutLabel = document.createTextNode('Total msgs out: ')
    this.totalMsgsDiv.appendChild(totalMsgsOutLabel)
    this.totalMsgsDiv.appendChild(this.totalMsgsOutSpan)
    
    this.statsContainer.appendChild(this.totalMsgsDiv)

    // Bytes stats
    this.bytesDiv = document.createElement('div')
    this.bytesDiv.style.marginBottom = '5px'
    this.bytesInSpan = document.createElement('span')
    this.bytesInSpan.textContent = '0'
    this.bytesOutSpan = document.createElement('span')
    this.bytesOutSpan.textContent = '0'
    
    const bytesInLabel = document.createElement('span')
    bytesInLabel.textContent = 'KB/s in: '
    this.bytesDiv.appendChild(bytesInLabel)
    this.bytesDiv.appendChild(this.bytesInSpan)
    this.bytesDiv.appendChild(this.bytesInSparkline.getElement())
    
    const bytesBreak = document.createElement('br')
    this.bytesDiv.appendChild(bytesBreak)
    
    const bytesOutLabel = document.createTextNode('KB/s out: ')
    this.bytesDiv.appendChild(bytesOutLabel)
    this.bytesDiv.appendChild(this.bytesOutSpan)
    this.bytesDiv.appendChild(this.bytesOutSparkline.getElement())
    this.statsContainer.appendChild(this.bytesDiv)

    // Messages stats
    this.msgsDiv = document.createElement('div')
    this.msgsInSpan = document.createElement('span')
    this.msgsInSpan.textContent = '0'
    this.msgsOutSpan = document.createElement('span')
    this.msgsOutSpan.textContent = '0'
    
    const msgsInLabel = document.createElement('span')
    msgsInLabel.textContent = 'Msgs/s in: '
    this.msgsDiv.appendChild(msgsInLabel)
    this.msgsDiv.appendChild(this.msgsInSpan)
    this.msgsDiv.appendChild(this.msgsInSparkline.getElement())
    
    const msgsBreak = document.createElement('br')
    this.msgsDiv.appendChild(msgsBreak)
    
    const msgsOutLabel = document.createTextNode('Msgs/s out: ')
    this.msgsDiv.appendChild(msgsOutLabel)
    this.msgsDiv.appendChild(this.msgsOutSpan)
    this.msgsDiv.appendChild(this.msgsOutSparkline.getElement())
    this.statsContainer.appendChild(this.msgsDiv)

    this.container.appendChild(this.statsContainer)
  }

  private setupWebSocketListeners() {
    this.rxListener = (e) => {
      const { data: message } = e
      this.totalBytesIn += message.length
      this.totalMsgsIn++
      this.currentSecondBytesIn += message.length
      this.currentSecondMsgsIn++
    }

    this.txListener = (e) => {
      const { data: message } = e
      this.totalBytesOut += message.length
      this.totalMsgsOut++
      this.currentSecondBytesOut += message.length
      this.currentSecondMsgsOut++
    }

    room.on(RoomEventType.Rx, this.rxListener)
    room.on(RoomEventType.Tx, this.txListener)
  }

  public getElement(): HTMLDivElement {
    return this.container
  }

  private updateWindowArray(arr: number[], value: number) {
    if (arr.length < this.WINDOW_SIZE) {
      // Still building up the window, just push
      arr.push(value)
    } else {
      // Window is full, use rotating index
      arr[this.windowIndex] = value
      this.windowIndex = (this.windowIndex + 1) % this.WINDOW_SIZE
    }
  }

  private calculateAverage(arr: number[]): number {
    if (arr.length === 0) return 0
    const sum = arr.reduce((acc, val) => acc + val, 0)
    return sum / arr.length
  }

  public update(now: number) {
    // Update metrics every second
    if (now - this.lastMetricsUpdate >= 1000) {
      // Store current second's rates in window arrays
      this.updateWindowArray(this.bytesInWindow, this.currentSecondBytesIn)
      this.updateWindowArray(this.bytesOutWindow, this.currentSecondBytesOut)
      this.updateWindowArray(this.msgsInWindow, this.currentSecondMsgsIn)
      this.updateWindowArray(this.msgsOutWindow, this.currentSecondMsgsOut)

      // Reset current second counters
      this.currentSecondBytesIn = 0
      this.currentSecondBytesOut = 0
      this.currentSecondMsgsIn = 0
      this.currentSecondMsgsOut = 0

      // Calculate averages
      const avgBytesIn = this.calculateAverage(this.bytesInWindow)
      const avgBytesOut = this.calculateAverage(this.bytesOutWindow)
      const avgMsgsIn = this.calculateAverage(this.msgsInWindow)
      const avgMsgsOut = this.calculateAverage(this.msgsOutWindow)

      // Update sparklines with the averages
      this.bytesInSparkline.addValue(avgBytesIn / 1024) // Convert to KB
      this.bytesOutSparkline.addValue(avgBytesOut / 1024)
      this.msgsInSparkline.addValue(avgMsgsIn)
      this.msgsOutSparkline.addValue(avgMsgsOut)

      // Update displays using cached references
      this.bytesInSpan.textContent = (avgBytesIn / 1024).toFixed(1)
      this.bytesOutSpan.textContent = (avgBytesOut / 1024).toFixed(1)
      this.msgsInSpan.textContent = avgMsgsIn.toFixed(1)
      this.msgsOutSpan.textContent = avgMsgsOut.toFixed(1)
      this.totalMsgsInSpan.textContent = this.totalMsgsIn.toString()
      this.totalMsgsOutSpan.textContent = this.totalMsgsOut.toString()

      // Update user info
      this.userInfoDiv.innerHTML =
        `Username: ${this.car.getUsername() || 'Anonymous'}<br>` +
        `Player ID: ${this.car.getPlayerId() || 'Not connected'}`

      this.lastMetricsUpdate = now
    }
  }

  /**
   * Clean up resources and remove event listeners
   */
  public dispose(): void {
    // Remove WebSocket event listeners
    if (this.rxListener) {
      room.off(RoomEventType.Rx, this.rxListener)
      this.rxListener = undefined
    }
    
    if (this.txListener) {
      room.off(RoomEventType.Tx, this.txListener)
      this.txListener = undefined
    }

    // Clear sparkline resources
    // Note: Sparkline class would need dispose method if it holds canvas contexts or other resources
    
    // Remove DOM element
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
  }
}

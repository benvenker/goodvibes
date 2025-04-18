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
    this.totalMsgsDiv.innerHTML =
      'Total msgs in: <span id="total-msgs-in">0</span><br>Total msgs out: <span id="total-msgs-out">0</span>'
    this.statsContainer.appendChild(this.totalMsgsDiv)

    // Bytes stats
    this.bytesDiv = document.createElement('div')
    this.bytesDiv.style.marginBottom = '5px'
    this.bytesDiv.innerHTML = 'KB/s in: <span id="bytes-in">0</span>'
    this.bytesDiv.appendChild(this.bytesInSparkline.getElement())
    this.bytesDiv.innerHTML += '<br>KB/s out: <span id="bytes-out">0</span>'
    this.bytesDiv.appendChild(this.bytesOutSparkline.getElement())
    this.statsContainer.appendChild(this.bytesDiv)

    // Messages stats
    this.msgsDiv = document.createElement('div')
    this.msgsDiv.innerHTML = 'Msgs/s in: <span id="msgs-in">0</span>'
    this.msgsDiv.appendChild(this.msgsInSparkline.getElement())
    this.msgsDiv.innerHTML += '<br>Msgs/s out: <span id="msgs-out">0</span>'
    this.msgsDiv.appendChild(this.msgsOutSparkline.getElement())
    this.statsContainer.appendChild(this.msgsDiv)

    this.container.appendChild(this.statsContainer)
  }

  private setupWebSocketListeners() {
    room.on(RoomEventType.Rx, (e) => {
      const { data: message } = e
      this.totalBytesIn += message.length
      this.totalMsgsIn++
      this.currentSecondBytesIn += message.length
      this.currentSecondMsgsIn++
    })

    room.on(RoomEventType.Tx, (e) => {
      const { data: message } = e
      this.totalBytesOut += message.length
      this.totalMsgsOut++
      this.currentSecondBytesOut += message.length
      this.currentSecondMsgsOut++
    })
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

      // Update displays
      document.getElementById('bytes-in')!.textContent = (avgBytesIn / 1024).toFixed(1)
      document.getElementById('bytes-out')!.textContent = (avgBytesOut / 1024).toFixed(1)
      document.getElementById('msgs-in')!.textContent = avgMsgsIn.toFixed(1)
      document.getElementById('msgs-out')!.textContent = avgMsgsOut.toFixed(1)
      document.getElementById('total-msgs-in')!.textContent = this.totalMsgsIn.toString()
      document.getElementById('total-msgs-out')!.textContent = this.totalMsgsOut.toString()

      // Update user info
      this.userInfoDiv.innerHTML =
        `Username: ${this.car.getUsername() || 'Anonymous'}<br>` +
        `Player ID: ${this.car.getPlayerId() || 'Not connected'}`

      this.lastMetricsUpdate = now
    }
  }
}

import { AudioManager } from '../game/AudioManager'
import { NetworkManager } from '../game/NetworkManager'
import { UserManager } from '../game/UserManager'
import './splash.css'

export class SplashScreen {
  private container: HTMLDivElement
  private playButton: HTMLButtonElement
  private title: HTMLHeadingElement
  private subtitle: HTMLHeadingElement
  private featuresContainer: HTMLDivElement = document.createElement('div')
  private instructionsContainer: HTMLDivElement = document.createElement('div')
  private usernameInput: HTMLInputElement
  private isConnected = false

  constructor(
    private networkManager: NetworkManager,
    private audioManager: AudioManager,
    private userManager: UserManager
  ) {
    this.container = document.createElement('div')
    this.container.className = 'splash-container'

    const headerSection = document.createElement('div')
    headerSection.className = 'splash-header'

    this.title = document.createElement('h1')
    this.title.className = 'splash-title'
    this.title.textContent = 'GoodVibes'
    headerSection.appendChild(this.title)

    this.subtitle = document.createElement('h2')
    this.subtitle.className = 'splash-subtitle'
    this.subtitle.textContent = 'Vibescale Game Starter Kit'
    headerSection.appendChild(this.subtitle)

    this.usernameInput = document.createElement('input')
    this.setupUsernameInput()
    headerSection.appendChild(this.usernameInput)

    this.playButton = document.createElement('button')
    this.setupPlayButton()
    headerSection.appendChild(this.playButton)

    this.container.appendChild(headerSection)

    const contentSection = document.createElement('div')
    contentSection.className = 'splash-content'

    this.setupFeatures()
    contentSection.appendChild(this.featuresContainer)

    this.setupInstructions()
    contentSection.appendChild(this.instructionsContainer)

    this.container.appendChild(contentSection)

    this.setupNetworkListeners()
  }

  private setupFeatures() {
    this.featuresContainer.className = 'splash-features'

    const features = [
      '🎮 Build Multiplayer Web Games Fast',
      '🌐 Real-time WebSocket Networking',
      '🚀 Cloudflare Edge Deployment',
      '⚡ Vite + TypeScript + Three.js',
      '🔌 Durable Objects for Game State',
    ]

    features.forEach((feature) => {
      const featureElement = document.createElement('div')
      featureElement.className = 'splash-feature'
      featureElement.textContent = feature
      this.featuresContainer.appendChild(featureElement)
    })
  }

  private setupInstructions() {
    const instructions = document.createElement('div')
    instructions.className = 'instruction-block'

    const devTitle = document.createElement('div')
    devTitle.className = 'instruction-title'
    devTitle.textContent = 'Development:'

    const devCommands = document.createElement('code')
    devCommands.className = 'instruction-code'
    devCommands.textContent =
      'bunx tiged benallfree/goodvibes my-new-vibe\nbun i\nbun run --cwd client dev\nbun run --cwd server dev'

    const deployTitle = document.createElement('div')
    deployTitle.className = 'instruction-title'
    deployTitle.textContent = 'Deployment:'

    const deployCommands = document.createElement('code')
    deployCommands.className = 'instruction-code'
    deployCommands.textContent = 'bun run build\nbun run deploy'

    instructions.appendChild(devTitle)
    instructions.appendChild(devCommands)
    instructions.appendChild(deployTitle)
    instructions.appendChild(deployCommands)

    this.instructionsContainer.className = 'splash-instructions'
    this.instructionsContainer.appendChild(instructions)
  }

  private setupUsernameInput() {
    this.usernameInput.type = 'text'
    this.usernameInput.className = 'splash-username'
    this.usernameInput.placeholder = 'Enter your username'
    this.usernameInput.value = this.userManager.getUsername() || ''
  }

  private setupPlayButton() {
    this.playButton.className = 'splash-play-button'
    this.playButton.textContent = 'Play'
    this.playButton.disabled = true

    this.playButton.addEventListener('click', () => this.handlePlay())
  }

  private setupNetworkListeners() {
    this.networkManager.onConnect(() => {
      this.isConnected = true
      this.playButton.disabled = false
    })
  }

  private handlePlay() {
    if (!this.isConnected) return

    const username = this.usernameInput.value.trim()
    if (username) {
      this.userManager.setUsername(username)
    }

    this.networkManager.forceStateUpdate()
    this.audioManager.playBackgroundMusic()

    this.container.style.transition = 'opacity 1s ease'
    this.container.style.opacity = '0'
    setTimeout(() => {
      this.container.remove()
    }, 1000)
  }

  public show(): void {
    document.body.appendChild(this.container)
  }
}

import { Game } from './game/Game'
import './styles/styles.css'

window.addEventListener('load', async () => {
  const game = new Game()
  try {
    await game.initialize()
    console.log('Game initialized')
  } catch (error) {
    console.error('Failed to start game:', error)
    // Here you could show an error UI to the user
  }
})

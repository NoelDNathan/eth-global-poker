let audioContext = null

const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioContext
}

const loadSound = async (url) => {
  const context = initAudioContext()
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  return await context.decodeAudioData(arrayBuffer)
}

const playSound = (buffer) => {
  const context = initAudioContext()
  const source = context.createBufferSource()
  source.buffer = buffer
  source.connect(context.destination)
  source.start(0)
}

export const initializeSounds = async () => {
  const sounds = {
    fold: await loadSound("/sounds/fold.wav"),
    call: await loadSound("/sounds/check.mp3"),
    check: await loadSound("/sounds/check.mp3"),
    raise: await loadSound("/sounds/chips.mp3"),
  }

  return {
    playFold: () => playSound(sounds.fold),
    playCall: () => playSound(sounds.call),
    playCheck: () => playSound(sounds.check),
    playRaise: () => playSound(sounds.raise),
  }
}

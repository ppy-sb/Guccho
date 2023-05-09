export * from '../universal/utils'

export function loadImage(src: string) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', resolve)
    image.addEventListener('error', reject)
    image.src = src
  })
}

export function placeholder(e: Event & { target: HTMLImageElement }) {
  e.target.src = '/images/image-placeholder.svg'
}

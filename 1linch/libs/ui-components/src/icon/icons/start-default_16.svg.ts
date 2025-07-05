import { svg } from 'lit'
import { IconContext } from './icon-context'

export const startDefault16Svg = ({ props }: IconContext<{ body: string; border: string }>) => svg`
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path style="transition: fill 0.3s ease, stroke 0.3s ease;" d="M8 1.33984L10.163 5.72184L15 6.42884L11.5 9.83784L12.326 14.6538L8 12.3788L3.674 14.6538L4.5 9.83784L1 6.42884L5.837 5.72184L8 1.33984Z" fill="${props?.body ?? ''}" stroke="${props?.border ?? ''}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

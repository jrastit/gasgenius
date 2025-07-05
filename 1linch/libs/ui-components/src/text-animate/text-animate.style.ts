import { css } from 'lit'

export const textAnimateStyle = css`
  :host {
    position: relative;
    display: flex;
    align-items: center;
    flex-direction: column;
    overflow: hidden;
    transition:
      height 0.2s,
      width 0.2s;
  }

  .text {
    white-space: nowrap;
  }

  .new-text {
    position: absolute;
    transform: translateY(-100%);
  }
`

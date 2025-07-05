import { css } from 'lit'

export const chainSelectorStyle = css`
  :host(.disabled) {
    cursor: not-allowed;
  }

  .icon-container {
    position: relative;
    width: 24px;
    height: 24px;
    background-color: transparent;
    overflow: hidden;
  }

  .icon-item-container {
    position: absolute;
    border-radius: 50%;
    transition:
      width 0.2s,
      height 0.2s,
      transform 0.2s,
      opacity 0.2s;
  }

  .icon-item {
    transition: opacity 0.2s;
  }
`

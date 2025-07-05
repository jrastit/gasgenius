import { css } from 'lit'

export const cardCloseOverlayStyle = css`
  :host {
    grid-area: overlay-close;
    display: flex;
    width: 56px;
    background-color: var(--secondary);
    padding: 24px 16px 0;
    box-sizing: border-box;
    color: var(--primary);
    cursor: pointer;
    border-right: 1px solid var(--color-border-border-tertiary);
    transition:
      border 0.2s,
      color 0.2s,
      background-color 0.2s;
  }

  @media (hover: hover) {
    :host(:hover) {
      background-color: var(--secondary-hover);
      color: var(--primary-hover);
      border-right: 1px solid var(--color-border-border-secondary);
    }
  }
`

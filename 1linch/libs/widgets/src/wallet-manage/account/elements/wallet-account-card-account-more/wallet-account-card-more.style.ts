import { css } from 'lit'

export const walletAccountCardMoreStyle = css`
  :host {
    width: 100%;
  }

  .popup-item-content-container__dangerous {
    color: var(--color-core-red-critical);
  }

  .popup-item {
    font-weight: 400;
    font-size: 16px;
  }

  .popup-item-content-container {
    display: flex;
    justify-content: start;
    align-items: center;
    width: 100%;
    gap: 4px;
  }

  .popup-item-content-icon {
    width: 14px;
    height: auto;
  }
`

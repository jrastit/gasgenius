import { css } from 'lit'

export const walletAccountHeaderStyle = css`
  :host {
    width: 100%;
  }

  .container {
    box-sizing: border-box;
    display: flex;
    gap: 16px;
    flex-direction: column;
    padding: 0 8px;
  }

  .tokens-list-title-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tokens-list-title {
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0;
    vertical-align: middle;
    color: var(--color-content-content-secondary);
  }
`

import { css } from 'lit'

export const walletListStyle = css`
  :host {
    height: 100%;
    display: block;
  }

  .container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
  }

  .agreements {
    margin-top: 16px;
    font-family: Inter, sans-serif;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0;
    text-align: center;
    vertical-align: middle;
    color: var(--color-content-content-secondary);
    padding-bottom: 16px;
  }

  .agreements-link {
    font-weight: 500;
    font-size: 14px;
    color: var(--primary);
    cursor: pointer;
  }
`

import { css } from 'lit'

export const swapOptionStyle = css`
  :host {
    display: block;
    --font-size: 16px;
    width: 100%;
  }

  .content-row {
    height: 40px;
    padding: 8px 0;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .mobile-content-row {
    height: 30px;
    --font-size: 13px;
  }
`

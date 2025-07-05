import { css } from 'lit'

export const walletManageStyle = css`
  :host {
    width: 100%;
    height: 100%;
    display: block;
  }

  .bnt-action__resize {
    width: 100%;
    max-width: 320px;
  }

  .wallet-manager-container {
    height: 100%;
    display: grid;
    grid-template-rows: 1fr fit-content(80px);
    overflow: hidden;
  }

  .wallet-manager-container-list {
    height: 100%;
    overflow: hidden;
  }

  .wallet-manager-actions {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80px;
    box-shadow: 0 4px 12px 0 #0000001f;
  }
`

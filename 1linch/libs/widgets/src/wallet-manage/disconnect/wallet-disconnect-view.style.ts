import { css } from 'lit'

export const walletDisconnectViewStyle = css`
  :host {
    width: 100%;
    height: 100%;
    display: block;
  }

  .bnt-action__resize {
    width: 100%;
    max-width: 320px;
  }

  .wallet-disconnect-container {
    display: grid;
    grid-template-rows: 1fr fit-content(128px);
    overflow: hidden;
    gap: 24px;
  }

  .wallet-disconnect-content {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 16px;
  }

  .wallet-disconnect-content-chip {
    display: flex;
    margin-top: 16px;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }

  .wallet-disconnect-content-msg {
    margin-top: 12px;
    font-family: Inter, sans-serif;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0;
    text-align: center;
    vertical-align: middle;
    color: var(--color-content-content-secondary);
  }

  .wallet-disconnect-actions {
    display: flex;
    height: 128px;
    width: 100%;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 16px;
  }

  .wallet-disconnect-content-icon:dir(rtl) {
    transform: scaleX(-1);
  }

  @media (hover: none) {
    .wallet-disconnect-content {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      padding: 0 16px;
    }

    .wallet-disconnect-container {
      display: grid;
      grid-template-rows: 1fr fit-content(128px);
      overflow: hidden;
      gap: 12px;
    }
  }
`

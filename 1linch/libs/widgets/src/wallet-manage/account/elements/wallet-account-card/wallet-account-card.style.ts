import { css } from 'lit'

export const walletAccountCardStyle = css`
  :host {
    width: 100%;
  }

  .loader {
    will-change: filter;
    height: 20px;
    width: 50% !important;
    background-color: var(--color-background-bg-secondary) !important;
    border-radius: 4px;
    animation: stub-loader-animation 3s ease-in-out infinite;
  }

  @keyframes stub-loader-animation {
    0%,
    100% {
      filter: opacity(1);
    }
    50% {
      filter: opacity(0.5);
    }
  }

  .card-item__color {
    color: var(--color-core-white);
  }

  .card {
    display: flex;
    gap: 28px;
    flex-direction: column;
    padding: 16px;
    width: 100%;
    height: 200px;
    background:
      linear-gradient(14deg, rgba(0, 0, 0, 0.7) 11%, rgba(0, 0, 0, 0) 85%),
      var(--card-background, var(--primary-hover));
    border-radius: 16px;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
    color: var(--color-core-white);
    transition:
      height 0.3s ease,
      gap 0.3s ease;
  }

  .card-wallet-info-container {
    display: grid;
    grid-template-columns: 1fr 24px;
    grid-template-rows: auto auto;
    width: 100%;
  }

  .card-wallet-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .card-wallet {
    background-color: var(--secondary);
    display: flex;
    gap: 8px;
    padding: 8px;
    border-radius: 8px;
    box-sizing: border-box;
    width: fit-content(50%);
    height: 40px;
    flex-shrink: 0;
    flex-grow: 0;
  }

  .card-wallet-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    width: 24px;
    height: 24px;
    overflow: hidden;
    background-color: var(--color-core-white);
    padding: 4px;
    box-sizing: border-box;

    .wallet-icon {
      width: 100%;
      height: auto;
    }
  }

  .card-wallet-address {
    color: var(--color-core-white);
    font-size: 16px;
    line-height: 24px;
    font-weight: 500;
    letter-spacing: 0;
  }

  .card-wallet-full-balance {
    margin-top: 28px;
    transition: margin-top 0.3s ease;
  }

  .card-wallet-balance {
    font-weight: 600;
    font-size: 24px;
    letter-spacing: 0;
    vertical-align: middle;
    color: var(--color-core-white);
  }

  .card-menu-more {
    grid-column: 2 / 3;
    grid-row: 1 / 3;
    margin-top: 8px;
  }

  .card-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 0;
    background-color: var(--secondary);
    border-radius: 12px;
    overflow: hidden;
  }

  .btn-send-icon-arrow {
    color: white;
    transform: rotate(-49deg);
    width: 16px;
    height: auto;
  }

  .btn-receive-icon-arrow {
    color: var(--color-core-white);
    transform: rotate(138deg);
    width: 16px;
    height: auto;
  }

  .background-unicorn {
    position: absolute;
    right: -64px;
    top: -12px;
    transition:
      top 0.3s ease,
      opacity 0.3s ease,
      transform 0.3s ease;
  }

  .background-unicorn.collapsed {
    top: -74px;
  }

  .background-unicorn:dir(rtl) {
    right: auto;
    left: -64px;
    transform: scaleX(-1);
  }

  .background-unicorn.collapsed:dir(rtl) {
    top: -74px;
  }

  .card.collapsed {
    height: 72px;
    gap: 6px;
  }

  .card-wallet-full-balance.collapsed {
    margin-top: 4px;
  }

  .fade-out {
    opacity: 0;
    height: 0;
    margin: 0;
    padding: 0;
    overflow: hidden;
    transition:
      opacity 0.3s ease,
      height 0.3s ease,
      margin 0.3s ease,
      padding 0.3s ease;
  }
`

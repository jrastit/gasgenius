import { css } from 'lit'

export const tokenItemBaseStyle = css`
  :host {
    --base-height: 72px;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: calc(var(--base-height) + var(--additional-height));
    padding: 12px 16px;
    border-radius: 16px;
    box-sizing: border-box;
    color: var(--color-content-content-primary);
    cursor: pointer;
    transition:
      background-color 0.2s,
      height 0.2s;
  }

  :host(.mobile) {
    padding: 12px 8px;
  }

  :host(.selected) {
    background-color: var(--color-background-bg-secondary);
  }

  :host(.disabled) {
    filter: grayscale(100%);
    opacity: 0.5;
    cursor: not-allowed;
  }

  .grid {
    margin-top: 2px;
    display: grid;
    align-items: center;
    column-gap: 12px;
    row-gap: 2px;
    grid-template-columns: minmax(0, auto) 1fr;
    grid-template-areas:
      'token-icon token-name token-balance'
      'token-icon token-networks token-fiat-balance';
  }

  :host(.show-after-icon) .grid {
    grid-template-areas:
      'token-icon token-name token-balance icon-after'
      'token-icon token-networks token-fiat-balance icon-after';
  }

  .token-icon {
    grid-area: token-icon;
  }

  .token-name {
    grid-area: token-name;
  }

  .token-networks {
    grid-area: token-networks;
  }

  .token-balance {
    grid-area: token-balance;
    justify-self: end;
  }

  .token-fiat-balance {
    grid-area: token-fiat-balance;
    justify-self: end;
  }

  .icon-after {
    grid-area: icon-after;
    display: flex;
    align-items: center;
  }

  .icon-after inch-icon {
    transition: transform 0.2s;
  }

  .token-balance-view {
    text-align: end;
    transition:
      transform 0.2s,
      opacity 0.2s;
  }

  .primary-text {
    color: var(--color-content-content-primary);
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0;
    vertical-align: middle;
  }

  .secondary-text {
    color: var(--color-content-content-secondary);
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0;
    vertical-align: middle;
    white-space: nowrap;
    overflow: hidden;
    position: relative;
  }

  :host(.selected) .token-balance-view {
    transform: translateY(50%);
    opacity: 0;
  }

  @media (hover: hover) {
    :host(:not(.disabled):hover) {
      background-color: var(--color-background-bg-secondary);
    }

    :host(.icon-after_on-hover) .icon-after {
      transform: translateX(200%);
    }

    :host(.icon-after_on-hover) .icon-after:dir(rtl) {
      transform: translateX(-200%);
    }

    :host(.icon-after_on-hover) .token-balance-view {
      transform: translateX(16px);
    }

    :host(.icon-after_on-hover) .token-balance-view:dir(rtl) {
      transform: translateX(-16px);
    }

    :host(.icon-after_on-hover:hover) .icon-after,
    :host(.icon-after_on-hover:hover) .token-balance-view,
    :host(.icon-after_on-hover:hover) .token-balance-view:dir(rtl) {
      transform: translateX(0);
    }
  }

  @media (hover: none) {
    :host(:active) {
      background-color: var(--color-background-bg-secondary);
    }
  }
`

import { css } from 'lit'

export const walletQrcodeViewStyle = css`
  .button__size {
    max-width: 260px;
    min-width: 180px;
  }

  .color__secondary {
    color: var(--color-content-content-secondary);
  }

  .qrcode-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0 24px;
    gap: 24px;
  }

  .qrcode-code-container {
    display: flex;
    width: 100%;
    max-width: 320px;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    border-radius: 32px;
    border: 1px solid var(--color-border-border-tertiary);
    overflow: hidden;
  }

  .qrcode-code {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    aspect-ratio: 1/1;
    border-radius: 32px;
    overflow: hidden;
    border: 1px solid var(--color-border-border-tertiary);
  }

  :host(:not(.loader)) .qrcode-code {
    background: var(--color-core-white);
  }

  .qrcode-code-svg-container {
    box-sizing: border-box;
    overflow: hidden;
    position: relative;
  }

  .connector-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .loader-icon {
    height: 16px;
    width: 16px;
  }

  .qrcode-title {
    display: flex;
    align-items: center;
    gap: 8px;

    font-family: Inter, sans-serif;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0;
    vertical-align: middle;
    color: var(--color-content-content-secondary);
  }

  .qrcode-copy-container {
    padding: 16px 0;
  }

  .qrcode-action-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 16px;
  }

  .loader {
    will-change: transform, background-position;
    width: 100%;
    aspect-ratio: 1 / 1;
    background-color: var(--color-background-bg-secondary);
    border-radius: 32px;
    position: relative;
    overflow: hidden;
  }

  .loader::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      transparent 0%,
      transparent 40%,
      color-mix(in srgb, var(--color-core-blue-info-hover) 10%, transparent) 50%,
      transparent 60%,
      transparent 100%
    );
    animation: diagonal-wave 3s ease-in-out infinite;
    animation-delay: 0s;
  }

  @keyframes diagonal-wave {
    0% {
      transform: translateX(-100%) translateY(-100%);
    }
    100% {
      transform: translateX(100%) translateY(100%);
    }
  }
`

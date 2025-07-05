import { css } from 'lit'

export const tokenIconStyle = css`
  :host {
    display: block;
    position: relative;
    user-select: none;
    outline: none;
    background-color: transparent;
    -webkit-user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .stub {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-background-bg-secondary);
    border-radius: 50%;
    color: var(--color-content-content-secondary);
    position: relative;
  }

  .stub-loader {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 1px solid;
    border-bottom-color: var(--secondary);
    border-top-color: var(--secondary);
    animation: spin 1s linear infinite;
  }

  img {
    user-select: none;
    outline: none;
    -webkit-user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .wrap-chain {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .wrap-chain img {
    inset: 0;
    background-color: inherit;
    mask-image: radial-gradient(
      circle var(--mask-image-size) at var(--mask-image-x) var(--mask-image-y),
      transparent 99%,
      black 100%
    );
  }

  .chain-view {
    position: absolute;
    bottom: -4px;
    right: 0;
    border-radius: 50%;
    z-index: 1;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
`

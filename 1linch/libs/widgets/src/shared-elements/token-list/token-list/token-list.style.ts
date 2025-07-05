import { css } from 'lit'

export const tokenListStyle = css`
  :host {
    position: relative;
  }

  .empty-search {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    color: var(--color-content-content-primary);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .empty-search span {
    color: var(--color-content-content-secondary);
  }

  .empty-search h3 {
    text-align: center;
  }

  .loaders-list {
    position: absolute;
    top: 117px;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
  }

  :host(.empty.search) .empty-search {
    opacity: 1;
  }

  :host(.empty:not(.search)) .loaders-list {
    opacity: 1;
  }
`

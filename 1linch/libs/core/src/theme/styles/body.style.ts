import { css } from 'lit'

export const bodyStyle = css`
  html {
    position: fixed;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  body {
    margin: 0;
    background-color: var(--color-background-bg-body);
    box-sizing: border-box;
  }

  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none;
    mix-blend-mode: normal;
  }

  * {
    user-select: none;
    outline: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
  }

  // checkered
  //body {
  //    --color1: var(--color-background-bg-body);
  //    --color2: var(--primary);
  //    --color3: var(--primary-12);
  //    --color4: var(--primary-50);
  //
  //    background: linear-gradient(-90deg, var(--color3) 1px, transparent 1px),
  //    linear-gradient(var(--color3) 1px, transparent 1px),
  //    linear-gradient(-90deg, var(--color4) 1px, transparent 1px),
  //    linear-gradient(var(--color4) 1px, transparent 1px),
  //    linear-gradient(transparent 3px, var(--color1) 3px, var(--color1) 78px, transparent 78px),
  //    linear-gradient(-90deg, var(--color2) 1px, transparent 1px),
  //    linear-gradient(-90deg, transparent 3px, var(--color1) 3px, var(--color1) 78px, transparent 78px),
  //    linear-gradient(var(--color2) 1px, transparent 1px),
  //    var(--color1);
  //    background-size: 4px 4px,
  //    4px 4px,
  //    80px 80px,
  //    80px 80px,
  //    80px 80px,
  //    80px 80px,
  //    80px 80px,
  //    80px 80px;
  //}

  // dot
  //body {
  //    background-color: var(--color-background-bg-body);
  //    background-size: 40px 40px;
  //    background-image: radial-gradient(circle, var(--primary-12) 1px, rgba(0, 0, 0, 0) 1px);
  //}

  // carbon
  //body {
  //    background-color: rgb(32, 32, 32);
  //    background-image: linear-gradient(to right, rgba(0,0,0,1), rgba(0,0,0,0) 20%, rgba(0,0,0,0) 80%, rgba(0,0,0,1)), linear-gradient(45deg, black 25%, transparent 25%, transparent 75%, black 75%, black), linear-gradient(45deg, black 25%, transparent 25%, transparent 75%, black 75%, black), linear-gradient(to bottom, rgb(8, 8, 8), rgb(32, 32, 32));
  //    background-size: 100% 100%, 10px 10px, 10px 10px, 10px 5px;
  //    background-position: 0px 0px, 0px 0px, 5px 5px, 0px 0px;
  //}
`

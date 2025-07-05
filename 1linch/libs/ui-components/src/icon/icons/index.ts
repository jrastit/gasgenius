import { TemplateResult } from 'lit'
import { IconContext } from './icon-context'

type IconLoader = (context: IconContext) => TemplateResult

export type IconsRecord = {
  loader: () => Promise<TemplateResult | IconLoader>
  width: string
  height: string
}

export const icons: Record<string, IconsRecord> = {
  plus24: {
    width: '24px',
    height: '24px',
    loader: () => import('./plus_24.svg').then((m) => m.plus24Svg),
  },
  minus24: {
    width: '24px',
    height: '24px',
    loader: () => import('./minus_24.svg').then((m) => m.minus24Svg),
  },
  github24: {
    width: '24px',
    height: '24px',
    loader: () => import('./github_24.svg').then((m) => m.github24Svg),
  },
  check24: {
    width: '24px',
    height: '24px',
    loader: () => import('./check_24.svg').then((m) => m.check24Svg),
  },
  circle16: {
    width: '16px',
    height: '16px',
    loader: () => import('./circle_16.svg').then((m) => m.circle16Svg),
  },
  cross8: {
    width: '8px',
    height: '8px',
    loader: () => import('./cross_8.svg').then((m) => m.cross8Svg),
  },
  startDefault16: {
    width: '16px',
    height: '16px',
    loader: () => import('./start-default_16.svg').then((m) => m.startDefault16Svg as IconLoader),
  },
  connect16: {
    width: '16px',
    height: '16px',
    loader: () => import('./connect_16.svg').then((m) => m.connect16Svg),
  },
  info16: {
    width: '16px',
    height: '16px',
    loader: () => import('./info_16.svg').then((m) => m.info16Svg),
  },
  cornerDownRight16: {
    width: '16px',
    height: '16px',
    loader: () => import('./corner-down-right_16.svg').then((m) => m.cornerDownRight16Svg),
  },
  chevronDown16: {
    width: '16px',
    height: '16px',
    loader: () => import('./chevron-down_16.svg').then((m) => m.chevronDown16Svg),
  },
  arrowDown16: {
    width: '16px',
    height: '16px',
    loader: () => import('./arrow-down_16.svg').then((m) => m.arrowDown16Svg),
  },
  fusion16: {
    width: '16px',
    height: '16px',
    loader: () => import('./fusion_16.svg').then((m) => m.fusion16Svg),
  },
  link16: {
    width: '16px',
    height: '16px',
    loader: () => import('./link_16.svg').then((m) => m.link16Svg),
  },
  alignRight16: {
    width: '16px',
    height: '16px',
    loader: () => import('./align-right_16.svg').then((m) => m.alignRight16Svg),
  },
  alignJustify16: {
    width: '16px',
    height: '16px',
    loader: () => import('./align-justify_16.svg').then((m) => m.alignJustify16Svg),
  },
  plusCircle16: {
    width: '16px',
    height: '16px',
    loader: () => import('./plus-circle_16.svg').then((m) => m.plusCircle16Svg),
  },
  trash16: {
    width: '16px',
    height: '16px',
    loader: () => import('./trash_16.svg').then((m) => m.trash16Svg),
  },
  xCircle16: {
    width: '16px',
    height: '16px',
    loader: () => import('./x-circle_16.svg').then((m) => m.xCircle16Svg),
  },
  lock16: {
    width: '16px',
    height: '16px',
    loader: () => import('./lock_16.svg').then((m) => m.lock16Svg),
  },
  circle24: {
    width: '24px',
    height: '24px',
    loader: () => import('./circle_24.svg').then((m) => m.circle24Svg),
  },
  arrowDown24: {
    width: '24px',
    height: '24px',
    loader: () => import('./arrow-down_24.svg').then((m) => m.arrowDown24Svg),
  },
  arrowLeft24: {
    width: '24px',
    height: '24px',
    loader: () => import('./arrow-left_24.svg').then((m) => m.arrowLeft24Svg),
  },
  cross24: {
    width: '24px',
    height: '24px',
    loader: () => import('./cross_24.svg').then((m) => m.cross24Svg),
  },
  search24: {
    width: '24px',
    height: '24px',
    loader: () => import('./search_24.svg').then((m) => m.search24Svg),
  },
  edit24: {
    width: '24px',
    height: '24px',
    loader: () => import('./edit_24.svg').then((m) => m.edit24Svg),
  },
  trash24: {
    width: '24px',
    height: '24px',
    loader: () => import('./trash_24.svg').then((m) => m.trash24Svg),
  },
  connect24: {
    width: '24px',
    height: '24px',
    loader: () => import('./connect_24.svg').then((m) => m.connect24Svg),
  },
  link24: {
    width: '24px',
    height: '24px',
    loader: () => import('./link_24.svg').then((m) => m.link24Svg),
  },
  bell24: {
    width: '24px',
    height: '24px',
    loader: () => import('./bell_24.svg').then((m) => m.bell24Svg),
  },
  alert24: {
    width: '24px',
    height: '24px',
    loader: () => import('./alert_24.svg').then((m) => m.alert24Svg),
  },
  l2Chain24: {
    width: '24px',
    height: '24px',
    loader: () => import('./l2-chain_24.svg').then((m) => m.l2Chain24Svg),
  },
  l2ChainRTL24: {
    width: '24px',
    height: '24px',
    loader: () => import('./l2-chain-rtl_24.svg').then((m) => m.l2Chain24Svg),
  },
  settings24: {
    width: '24px',
    height: '24px',
    loader: () => import('./settings_24.svg').then((m) => m.settings24Svg),
  },
  hideSidebar24: {
    width: '24px',
    height: '24px',
    loader: () => import('./hide-sidebar_24.svg').then((m) => m.hideSidebar24Svg),
  },
  fusion24: {
    width: '24px',
    height: '24px',
    loader: () => import('./fusion_24.svg').then((m) => m.fusion24Svg),
  },
  globe24: {
    width: '24px',
    height: '24px',
    loader: () => import('./globe_24.svg').then((m) => m.globe24Svg),
  },
  image24: {
    width: '24px',
    height: '24px',
    loader: () => import('./image_24.svg').then((m) => m.image24Svg),
  },
  sun24: {
    width: '24px',
    height: '24px',
    loader: () => import('./sun_24.svg').then((m) => m.sun24Svg),
  },
  moon24: {
    width: '24px',
    height: '24px',
    loader: () => import('./moon_24.svg').then((m) => m.moon24Svg),
  },
  command24: {
    width: '24px',
    height: '24px',
    loader: () => import('./command_24.svg').then((m) => m.command24Svg),
  },
  wallet24: {
    width: '24px',
    height: '24px',
    loader: () => import('./wallet_24.svg').then((m) => m.wallet24Svg),
  },
  authRefresh36: {
    width: '36px',
    height: '36px',
    loader: () => import('./auth-refresh_36.svg').then((m) => m.authRefresh36Svg),
  },
  logoFull: {
    width: '102px',
    height: '40px',
    loader: () => import('./logo-full.svg').then((m) => m.logoFullSvg),
  },
  unicornRun: {
    width: '38px',
    height: '24px',
    loader: () => import('./unicorn_run.svg').then((m) => m.unicornRunSvg),
  },
  fire48: {
    width: '48px',
    height: '48px',
    loader: () => import('./fire_48.png').then((m) => m.fire48Png),
  },
  emptySearch: {
    width: '160px',
    height: '160px',
    loader: () => import('./empty_search.svg').then((m) => m.emptySearch),
  },
  more24: {
    width: '24px',
    height: '24px',
    loader: () => import('./more_24.svg').then((m) => m.more24Svg),
  },
  swap24: {
    width: '24px',
    height: '24px',
    loader: () => import('./swap_24.svg').then((m) => m.swap24Svg),
  },
  unicornBackground: {
    width: '174px',
    height: '199px',
    loader: () => import('./unicorn_background.svg').then((m) => m.unicornBackground),
  },
  logout16: {
    width: '16px',
    height: '16px',
    loader: () => import('./logout_16.svg').then((m) => m.logout16Svg),
  },
  copy16: {
    width: '16px',
    height: '16px',
    loader: () => import('./copy_16.svg').then((m) => m.copy16Svg),
  },
  externalLink16: {
    width: '16px',
    height: '16px',
    loader: () => import('./external-link_16.svg').then((m) => m.externalLink16Svg),
  },
  arrowTopToRightRounded32: {
    width: '32px',
    height: '32px',
    loader: () => import('./arrow-top-to-right-rounded_32').then((m) => m.arrowTopToRightRounded32),
  },
  disconnectImageBig: {
    width: '160px',
    height: '160px',
    loader: () => import('./disconnect-image_big').then((m) => m.disconnectImage_big),
  },
  scan16: {
    width: '16px',
    height: '16px',
    loader: () => import('./scan_16.svg').then((m) => m.scan16Svg),
  },

  // chain icons
  eth24: {
    width: '24px',
    height: '24px',
    loader: () => import('./chain/eth_24.svg').then((m) => m.eth24Svg),
  },
  bnb24: {
    width: '24px',
    height: '24px',
    loader: () => import('./chain/bnb_24.svg').then((m) => m.bnb24Svg),
  },
  op24: {
    width: '24px',
    height: '24px',
    loader: () => import('./chain/op_24.svg').then((m) => m.op24Svg),
  },
  matic24: {
    width: '24px',
    height: '24px',
    loader: () => import('./chain/matic_24.svg').then((m) => m.matic24Svg),
  },
  arbitrum24: {
    width: '24px',
    height: '24px',
    loader: () => import('./chain/arbitrum_24.svg').then((m) => m.arbitrum24Svg),
  },
  gnosis24: {
    width: '24px',
    height: '24px',
    loader: () => import('./chain/gnosis_24.svg').then((m) => m.gnosis24Svg),
  },
  avalanche24: {
    width: '24px',
    height: '24px',
    loader: () => import('./chain/avalanche_24.svg').then((m) => m.avalanche24Svg),
  },
  fantom24: {
    width: '24px',
    height: '24px',
    loader: () => import('./chain/fantom_24.svg').then((m) => m.fantom24Svg),
  },
  aurora24: {
    width: '24px',
    height: '24px',
    loader: () => import('./chain/aurora_24.svg').then((m) => m.aurora24Svg),
  },
  klaytn24: {
    width: '24px',
    height: '24px',
    loader: () => import('./chain/klaytn_24.svg').then((m) => m.klaytn24Svg),
  },
  zkSyncEra24: {
    width: '24px',
    height: '24px',
    loader: () => import('./chain/zksyncera_24.svg').then((m) => m.zkSyncEra24Svg),
  },
  base24: {
    width: '24px',
    height: '24px',
    loader: () => import('./chain/base_24.svg').then((m) => m.base24Svg),
  },
}

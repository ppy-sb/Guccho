import { merge } from 'lodash-es'

import zhCN from '../../bancho.py/locales/zh-CN'
import type { ServerLocale } from './@types'
import { CountryCode } from '~/def/country-code'

export default merge(zhCN, {
  landing: {
    content: `欢迎来到 {title} ，一个面向全模式的osu!私服。我们有最先进的RX，AP算法，同时为全模式提供PP计算支持。
我们拥有全图排行榜，以及无限次数的改名机会。
群内的兽耳机器人24小时为您提供成绩查询等服务。
详情请加QQ群: 792778662。
Guccho 新版本目前仍在测试阶段，如出现问题或有改进建议，欢迎与我们联系与沟通。`,
  },
  country: {
    [CountryCode.HongKong]: '香港特别行政区',
    [CountryCode.Macao]: '澳门特别行政区',
    [CountryCode.Taiwan]: '台湾省',
  },
} satisfies ServerLocale as ServerLocale)

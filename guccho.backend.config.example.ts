import { Lang, Rank } from './src/def'
import { type UIConfig } from './src/def/config'

export default {
  legacyOption: {
    name: 'Guccho',
  },
  baseUrl: 'ppy.sb',
  iconLinks: [{ icon: 'tabler:brand-nuxt', link: '//nuxt.com', name: 'nuxt' }],
  footerLink: {
    about: [{
      localeKey: 'footer.blog',
      link: 'https://blog.ppy.sb',
    }],
    resources: [{
      localeKey: 'footer.nuxt',
      link: 'https://nuxt.com',
    }],
  },
  i18n: {
    messages: {
      [Lang.enGB]: {
        footer: {
          blog: 'Blog',
          nuxt: 'Nuxt',
        },
      },
      [Lang.zhCN]: {
        footer: {
          blog: '博客',
        },
      },
    },
  },
  leaderboardRankingSystem: {
    [Rank.PPv2]: {
      userpage: {
        show: 'tab',
      },
    },
    [Rank.PPv1]: {
      userpage: {
        show: 'dropdown',
      },
    },
    [Rank.RankedScore]: {
      userpage: {
        show: 'tab',
      },
    },
    [Rank.TotalScore]: {
      userpage: {
        show: 'tab',
      },
    },
  },
} satisfies UIConfig as UIConfig

import { type UIConfig } from './src/def/config.d'
import PackageJSON from './package.json'
import { Rank } from './src/def'
import { Lang } from '~/def'

export default {
  legacyOption: {
    name: 'Guccho',
  },
  baseUrl: 'dev.ppy.sb',
  version: PackageJSON.version,
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
} satisfies UIConfig

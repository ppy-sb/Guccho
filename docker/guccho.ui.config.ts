import { type UIConfig } from './src/def/config.d'
import { Rank } from './src/def'
import { env, safeEnv } from './src/server/common/utils'

/*
 * This file contains the UI configuration settings for Guccho. For optimal editing experience,
 * it is recommended to use an editor that supports TypeScript, as it will help in detecting errors.
 */
export default {
  legacyOption: {
    /*
     * The name of your server.
     * A more advanced customization for this name can be achieved through i18n translations,
     * allowing for different names in various languages.
     */
    name: safeEnv('SERVER_NAME') ?? 'Guccho',
  },

  /* Base domain of your site (use 'ppy.sh' if your server is at 'c.ppy.sh'). */
  baseUrl: env('BASE_URL'),

  /* Branding icon, displayed at the top and bottom left corners. */
  brand: {
    icon: 'ion:paw',
    iconClass: 'w-8 h-4',
  },

  /*
   * Small icons displayed as links in the footer.
   */
  // iconLinks: [{ icon: 'tabler:brand-nuxt', link: 'https://nuxt.com', name: 'nuxt' }],

  /*
   * Define the footer links.
   *
   * Predefined keys include 'about' and 'resources'.
   * You can add more sections like these. Guccho will provide translations only for the predefined keys.
   * To add a custom section, use the schema `footer.[key]`.
   * For instance, to add a 'store' section:
   * {
   *   footerLink: {
   *     store: [{
   *       localeKey: 'footer.my-store',
   *       link: 'https://store.ppy.sb',
   *     }],
   *   },
   *   i18n: {
   *     [Lang.enGB]: {
   *       footer: {
   *         store: 'Store',
   *         'my-store': 'My store',
   *       },
   *     },
   *     // ... other languages.
   *   }
   * }
   *
   * - localeKey: Key for translation. Define translations in the i18n block below.
   * - link: URL for the destination.
   */
  // footerLink: {
  //   about: [{
  //     localeKey: 'footer.blog',
  //     link: 'https://blog.ppy.sb',
  //   }],
  //   resources: [{
  //     localeKey: 'footer.nuxt',
  //     link: 'https://nuxt.com',
  //   }],
  // },

  /*
   * Locale mixins (Advanced configuration).
   * Supported languages are defined in ./src/def.
   * If you're interested in helping translate Guccho into other languages, please contact us.
   *
   * Example: I've included 'footer: { blog, nuxt }'. If these links are irrelevant to you,
   * remember to remove both the links and the corresponding entries in 'footer'.
   *
   * For example, to name your server differently in various languages:
   * {
   *   [Lang.enGB]: {
   *     server: {
   *       name: 'ppy.sb',
   *     },
   *   },
   *   [Lang.frFr]: {
   *     server: {
   *       name: 'ppŷ.śb',
   *     },
   *   },
   *   [Lang.zhCN]: {
   *     server: {
   *       name: '偏偏要上班',
   *     },
   *   },
   * }
   * in `messages`.
   *
   */
  // i18n: {
  //   messages: {
  //     [Lang.enGB]: {
  //       footer: {
  //         blog: 'Blog',
  //         nuxt: 'Nuxt',
  //       },
  //     },
  //   },
  // },
  /*
   * Configuration for the appearance of each ranking system.
   * In most cases, default settings are sufficient.
   */
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

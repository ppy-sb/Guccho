import type { RouteLocationRaw } from 'vue-router'
import { UserPrivilege } from '~/def/user'
import { useSession } from '~/store/session'

function loggedIn() {
  const session = useSession()
  return session.loggedIn
}
function notLoggedIn() {
  return !loggedIn()
}

function admin() {
  const session = useSession()
  return session.user?.roles.includes(UserPrivilege.Staff) || false
}

export const pages: {
  render: () => JSX.Element
  route: RouteLocationRaw
  keyword?: string[]
  show?(keyword: string): boolean
}[] = [
  {
    render: () => <><icon name="majesticons:login-half-circle-line" class="w-5 h-5" size="100%" />{ useI18n().t('global.login') }</>,
    route: {
      name: 'auth-login',
    },
    keyword: ['login', 'sign in'],
    show: notLoggedIn,
  },
  {
    render: () => <><icon name="mingcute:signature-fill" class="w-5 h-5" size="100%" />{ useI18n().t('global.register') }</>,
    route: {
      name: 'auth-register',
    },
    keyword: ['register', 'sign up'],
    show: notLoggedIn,
  },

  {
    render: () => <><icon name="material-symbols:admin-panel-settings-rounded" class="w-5 h-5" size="100%" />{ useI18n().t('titles.admin-panel') }</>,
    route: {
      name: 'admin',
    },
    keyword: ['settings', 'admin'],
    show: admin,
  },
  // {
  //   render: () => <><icon name="fa-solid fa-paragraph" class="w-5" />Articles</>,
  //   route: {
  //     name: 'article-edit',
  //   },
  //   keyword: ['settings', 'article'],
  //   show: admin,
  // },
  {
    render: () => <><icon name="tabler:circles-relation" class="w-5 h-5" size="100%" />{ useI18n().t('titles.relations') }</>,
    route: {
      name: 'me-relations',
    },
    keyword: ['settings', 'friends', 'blocks', 'relationship', 'revoke'],
    show: loggedIn,
  },
  {
    render: () => <><icon name="solar:settings-bold" class="w-5 h-5" size="100%" />{ useI18n().t('titles.settings') }</>,
    route: {
      name: 'me-settings',
    },
    keyword: ['settings', 'preference', 'profile', 'edit', 'change'],
    show: loggedIn,
  },
  {
    render: () => <><icon name="majesticons:logout-half-circle-line" class="w-5 h-5" size="100%" />{ useI18n().t('gloabl.logout') }</>,
    route: {
      name: 'auth-logout',
    },
    keyword: ['logout', 'sign out'],
    show: loggedIn,
  },
]

export default function () {
  return {
    pages,
    search(keyword: string) {
      return pages.filter((item) => {
        const kwResult = item.keyword?.some(kw => kw.includes(keyword)) ?? true
        const showResult = item.show?.(keyword)
        return kwResult && showResult
      })
    },
  }
}

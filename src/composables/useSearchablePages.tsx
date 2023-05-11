import {
  faBriefcase,
  faHeartCrack,
  faParagraph,
  faRightFromBracket,
  faRightToBracket,
  faSignature,
  faSliders,
} from '@fortawesome/free-solid-svg-icons'

import type { RouteLocationRaw } from 'vue-router'
import { FontAwesomeIcon } from '#components'
import { useSession } from '~/store/session'

const { addToLibrary } = useFAIcon()
addToLibrary(
  faRightFromBracket,
  faRightToBracket,
  faSignature,
  faSliders,
  faBriefcase,
  faHeartCrack,
  faParagraph
)
function loggedIn() {
  const session = useSession()
  return session.loggedIn
}
function notLoggedIn() {
  return !loggedIn()
}

function admin() {
  const session = useSession()
  return session.user?.roles.includes('staff') || false
}

export const pages: {
  render: () => JSX.Element
  route: RouteLocationRaw
  keyword?: string[]
  show?(keyword: string): boolean
}[] = [
  {
    render: () => <><FontAwesomeIcon icon="fa-solid fa-right-to-bracket" class="w-5" />Sign in</>,
    route: {
      name: 'auth-login',
    },
    keyword: ['login', 'sign in'],
    show: notLoggedIn,
  },
  {
    render: () => <><FontAwesomeIcon icon="fa-solid fa-signature" class="w-5"/>Sign up</>,
    route: {
      name: 'auth-register',
    },
    keyword: ['register', 'sign up'],
    show: notLoggedIn,
  },

  {
    render: () => <><FontAwesomeIcon icon="fa-solid fa-briefcase" class="w-5" />Admin Panel</>,
    route: {
      name: 'admin',
    },
    keyword: ['settings', 'admin'],
    show: admin,
  },
  {
    render: () => <><FontAwesomeIcon icon="fa-solid fa-paragraph" class="w-5" />Articles</>,
    route: {
      name: 'article-edit',
    },
    keyword: ['settings', 'article'],
    show: admin,
  },
  {
    render: () => <><FontAwesomeIcon icon="fa-solid fa-heart-crack" class="w-5" />Friends & Blocks</>,
    route: {
      name: 'me-relations',
    },
    keyword: ['settings', 'friends', 'blocks', 'relationship', 'revoke'],
    show: loggedIn,
  },
  {
    render: () => <><FontAwesomeIcon icon="fa-solid fa-sliders" class="w-5" />Settings</>,
    route: {
      name: 'me-settings',
    },
    keyword: ['settings', 'preference', 'profile', 'edit', 'change'],
    show: loggedIn,
  },
  {
    render: () => <><FontAwesomeIcon icon="fa-solid fa-right-from-bracket" class="w-5" />Sign out</>,
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

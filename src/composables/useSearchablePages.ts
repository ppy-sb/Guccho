import { useSession } from '../store/session'

function loggedIn() {
  const session = useSession()
  return session.loggedIn
}
function notLoggedIn() {
  return !loggedIn()
}

const pages: {
  route: {
    name: string
  }
  keyword?: string[]
  show?(keyword: string): boolean
}[] = [
  {
    route: {
      name: 'auth-login',
    },
    keyword: ['login', 'auth'],
    show: notLoggedIn,
  },
  {
    route: {
      name: 'auth-register',
    },
    keyword: ['login', 'register'],
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

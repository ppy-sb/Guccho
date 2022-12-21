import type { UserEssential } from '~/types/user'

// https://hypercolor.dev/
export default function (user: UserEssential<unknown>) {
  const roles = user.roles
  const classNames = ['text-transparent bg-clip-text animate-text']

  if (roles.includes('owner'))
    return [...classNames, 'bg-gradient-to-b from-red-300 via-red-500 to-yellow-400 dark:from-red-200 dark:via-red-300 dark:to-yellow-200']

  if (roles.includes('admin'))
    return [...classNames, 'bg-gradient-to-b from-purple-200 via-purple-400 to-purple-800']

  if (roles.includes('beatmapNominator'))
    return [...classNames, 'bg-gradient-to-b from-green-400 to-purple-500 dark:from-green-200 dark:to-purple-400']

  return []
}

export default function ({ separator } = { separator: ',' }) {
  function parse(hashContent: string) {
    let content: string = hashContent
    if (hashContent.startsWith('#'))
      content = hashContent.slice(1)

    const returnValue: Record<string, string> = {}

    const splitted = content.split(separator)

    for (let item of splitted) {
      item = decodeURIComponent(item)
      const result = item.match(/(?<key>\w+)\((?<value>\w+)\)/)
      if (!result?.groups?.key)
        continue
      returnValue[result.groups.key] = result.groups.value
    }

    return returnValue
  }

  function stringify(data: Record<string, string>) {
    let returnValue = ''

    for (const [key, value] of Object.entries(data)) {
      if (!value || !key)
        continue
      const str = `${encodeURIComponent(key)}(${encodeURIComponent(value)})`
      returnValue += str + separator
    }
    return returnValue.slice(0, -1)
  }

  return {
    parse,
    stringify,
  }
}

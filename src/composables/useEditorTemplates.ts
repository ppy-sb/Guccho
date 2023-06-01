const variables = new Map<String, Template>()

interface Template {
  description: string | number
  defaultFallback?: string | number
  value?: string | number
}
export default function useEditorTemplates() {
  const config = useAppConfig()

  variables.set('domain', {
    description: 'domain',
    defaultFallback: 'domain',
    value: config.baseUrl,
  })
  variables.set('test', {
    description: 'test',
    defaultFallback: 'test',
    value: 'test',
  })

  return {
    variables,
  }
}

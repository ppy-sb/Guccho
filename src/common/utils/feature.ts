import type { Feature } from '~/def/features'
import { GucchoError } from '~/def/messages'

export function isServerFeatureSupported(feature: Feature, features = useAdapterConfig().supportedFeatures) {
  return features.has(feature)
}

export function assertServerFeatureSupported(feature: Feature, features = useAdapterConfig().supportedFeatures) {
  if (!isServerFeatureSupported(feature, features)) {
    const { t } = useI18n({ useScope: 'global' })
    throw formatGucchoErrorCodeWithT(t, GucchoError.FeatureNotSupported)
  }
}

import { Image } from 'react-native'

interface BrandMarkProps {
  /** A brand mark URL from `lib/brand-marks.ts`. */
  uri: string
  size: number
  label: string
}

/** Draws a brand mark from its source repository. */
export function BrandMark({ uri, size, label }: BrandMarkProps) {
  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size }}
      resizeMode="contain"
      accessibilityLabel={label}
    />
  )
}

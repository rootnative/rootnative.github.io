import { Image } from 'react-native'

interface BrandMarkProps {
  /** A brand mark URL from `lib/brand-marks.ts`. */
  uri: string
  size: number
  label: string
  /**
   * Corner radius, for a mark that is an opaque tile rather than transparent
   * artwork.
   *
   * Every library mark is a transparent PNG and takes none — a radius on
   * transparent artwork clips the artwork itself. `MARK_ORG` is a filled square
   * and needs one, or it draws as a black box on a light page.
   */
  radius?: number
}

/** Draws a brand mark from its source on GitHub. */
export function BrandMark({ uri, size, label, radius }: BrandMarkProps) {
  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: radius }}
      resizeMode="contain"
      accessibilityLabel={label}
    />
  )
}

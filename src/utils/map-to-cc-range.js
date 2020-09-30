import mapToRange from './map-to-range';

export default function mapToCCRange(value, range) {
  return mapToRange(value, range, 127)
}

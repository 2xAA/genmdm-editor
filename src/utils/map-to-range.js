export default function mapToRange(value, range, maxValue) {
  return Math.round((value / range) * maxValue);
}

export default function mapToRange(value, range, maxValue) {
  return Math.floor((value / range) * maxValue);
}

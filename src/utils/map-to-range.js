export default function mapToRange(value, range, maxValue) {
  return Math.ceil((value / range) * maxValue);
}

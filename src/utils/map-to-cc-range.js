export default function mapToCCRange(value, range) {
  return Math.ceil((value / range) * 127);
}

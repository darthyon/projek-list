import { TYPE_META, type ListType } from "@/lib/types/list";

const RULES: Array<[RegExp, string]> = [
  [/pasar|grocer|groceries|market/i, "🥬"],
  [/ayam|chicken/i, "🍗"],
  [/ikan|fish/i, "🐟"],
  [/raya|celebrat/i, "🎉"],
  [/krismas|christmas/i, "🎄"],
  [/baby|bayi/i, "🍼"],
  [/gym|workout|senaman/i, "💪"],
  [/camp|khemah|hiking|hike/i, "🏕️"],
  [/trip|travel|cuti|holiday|langkawi/i, "✈️"],
  [/sekolah|school/i, "🎒"],
  [/birthday|bday|hari jadi/i, "🎂"],
  [/rumah|house|moving|pindah/i, "🏠"],
  [/kerja|work|office/i, "💼"],
  [/kahwin|wedding|nikah/i, "💍"],
  [/buku|book/i, "📚"],
  [/ubat|pharmacy|farmasi|clinic/i, "💊"],
  [/hardware|diy|repair|baiki/i, "🔧"],
  [/picnic|pantai|beach/i, "🏖️"],
  [/makan|dinner|lunch|food/i, "🍽️"],
  [/kucing|cat|anjing|dog|pet/i, "🐾"],
];

export function suggestEmoji(name: string, type: ListType): string {
  for (const [pattern, emoji] of RULES) {
    if (pattern.test(name)) return emoji;
  }
  return TYPE_META[type].emoji;
}

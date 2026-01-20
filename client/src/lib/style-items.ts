// Centralized style / genre items used across forms
export const STYLE_ITEMS = [
  "electronic",
  "rock",
  "pop",
  "jazz",
  "hip hop",
  "classical",
  "orchestral",
  "hipster",
  "lo-fi",
  "ambient",
  "70bpm",
  "edm",
  "soul",
];

export type ShareToEnum = "whatsapp" | "audius" | "youtube" | "facebook";
export const ShareToItems: {
  label: string;
  value: ShareToEnum;
}[] = [
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Audius", value: "audius" },
  { label: "YouTube", value: "youtube" },
  { label: "Facebook", value: "facebook" },
];
export const frequencyItems = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default STYLE_ITEMS;

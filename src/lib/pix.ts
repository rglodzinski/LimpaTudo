/**
 * Builds a static Pix "BR Code" payload (EMV QR Code spec used by Brazil's
 * Banco Central) for a donation QR code. No amount is set, so the payer
 * chooses how much to send. Reference: Bacen "Manual de Padrões para
 * Iniciação do Pix".
 */

interface PixPayloadOptions {
  key: string;
  merchantName: string;
  merchantCity: string;
  txId?: string;
}

function tlv(id: string, value: string): string {
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}

/** Uppercase ASCII only, stripped of accents — required by the Pix spec. */
function sanitize(value: string, maxLength: number): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, "")
    .slice(0, maxLength);
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function buildPixPayload({ key, merchantName, merchantCity, txId = "***" }: PixPayloadOptions): string {
  const merchantAccountInfo = tlv("00", "br.gov.bcb.pix") + tlv("01", key);
  const additionalData = tlv("05", txId);

  const withoutCrc =
    tlv("00", "01") + // Payload Format Indicator
    tlv("26", merchantAccountInfo) + // Merchant Account Information (Pix)
    tlv("52", "0000") + // Merchant Category Code
    tlv("53", "986") + // Currency: BRL
    tlv("58", "BR") + // Country
    tlv("59", sanitize(merchantName, 25)) +
    tlv("60", sanitize(merchantCity, 15)) +
    tlv("62", additionalData) +
    "6304"; // CRC id + length, value appended below

  return withoutCrc + crc16(withoutCrc);
}

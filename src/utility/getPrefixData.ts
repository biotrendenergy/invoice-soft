export function incrementString(input: string, count: number) {
  const match = input.match(/^([^\d]*)(\d*)$/);

  if (!match) return null;

  const prefix = match[1];
  const numberStr = match[2];
  const numberLength = numberStr.length;
  const number = parseInt(numberStr || "0", 10) + count;

  const newNumberStr = number.toString().padStart(numberLength, "0");

  return {
    prefix,
    number: newNumberStr,
  };
}

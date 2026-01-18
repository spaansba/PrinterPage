import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder";

export const babyCountdownCardBytes = async (
  daysLeft: number,
): Promise<Uint8Array> => {
  const encoder = new ReceiptPrinterEncoder({
    printerModel: "pos-8360",
    columns: 32,
    newLine: "\n",
    imageMode: "column",
    font: "9x17",
  });

  return encoder
    .initialize()
    .raw([0x1b, 0x40])
    .font("a")
    .rule()
    .align("center")
    .size(2)
    .text(daysLeft <= 0 ? "TODAY!" : `${daysLeft}`)
    .size(1)
    .newline(1)
    .text(daysLeft <= 0 ? "" : daysLeft === 1 ? "day to go" : "days to go")
    .newline(1)
    .rule()
    .newline(2)
    .align("left")
    .encode() as Uint8Array;
};

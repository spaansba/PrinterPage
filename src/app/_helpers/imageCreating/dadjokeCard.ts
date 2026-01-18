import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder";
export const dadJokeCardBytes = async (joke: string): Promise<Uint8Array> => {
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
    .size(1)
    .text(joke)
    .rule()
    .newline(2)
    .align("left")
    .encode() as Uint8Array;
};

"use client";
import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder";
import { HtmlEncoder } from "./HtmlEncoder";
import { PRINTER_WIDTH } from "@/lib/constants";
import { loadImages } from "./createImagesToPrint";
import {
  createBannerSection,
  createProfileSection,
} from "./imageCreating/toastBanner";

export const PrepareTextToSend = async (
  text: string,
  sender: string,
  imageURL: string,
): Promise<Uint8Array> => {
  const replaceImgTagsWithSrc = processImgTags(text);

  let utf8Encode = new TextEncoder();
  const userMessage = await HtmlEncoder(
    utf8Encode.encode(replaceImgTagsWithSrc.text),
    replaceImgTagsWithSrc.images,
  );
  const openTag = await printingOpenTag(sender, imageURL);
  const closingTag = await printingClosingTag();
  const combinedMultiple = combineMultipleUint8Arrays([
    openTag,
    userMessage,
    closingTag,
  ]);
  return combinedMultiple;
};

function processImgTags(rawText: string): { text: string; images: string[] } {
  const images: string[] = [];
  const text = rawText.replaceAll(
    /<img[^>]*src=["']([^"']+)["'][^>]*>/g,
    (_, srcUrl: string) => {
      images.push(srcUrl);
      return `|&^%image:`;
    },
  );

  return { text, images };
}

async function printingOpenTag(
  sender: string,
  profileImageUrl: string,
): Promise<Uint8Array> {
  const encoder = new ReceiptPrinterEncoder({
    printerModel: "pos-8360",
    columns: 32,
    newLine: "\n",
    imageMode: "column",
    font: "9x17",
  });

  try {
    const isDev = process.env.NODE_ENV === "development";

    const profileImg = await loadImages(profileImageUrl);
    const profileData = await createProfileSection(profileImg, sender);

    encoder.initialize().raw([0x1b, 0x40]).font("a").size(1);

    if (!isDev) {
      const bannerImg = await loadImages("/images/Toast.png");
      const bannerData = await createBannerSection(bannerImg);
      encoder.image(bannerData, PRINTER_WIDTH, 88, "atkinson", 128).rule();
    }

    return encoder
      .image(profileData, PRINTER_WIDTH, profileData.height, "atkinson", 128)
      .align("left")
      .encode();
  } catch (error) {
    throw error;
  }
}

async function printingClosingTag(): Promise<Uint8Array> {
  let encoder = new ReceiptPrinterEncoder({
    printerModel: "pos-8360",
    columns: 32,
    newLine: "\n",
    font: "9x17",
  });

  return encoder.newline(1).rule({ style: "double" }).newline(3).encode();
}

export function combineMultipleUint8Arrays(arrays: Uint8Array[]) {
  const totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  arrays.forEach((array) => {
    combined.set(array, offset);
    offset += array.length;
  });
  return combined;
}

import QRCode from "qrcode";

export async function generateQRCodeDataURL(url: string): Promise<string> {
  return await QRCode.toDataURL(url, {
    width: 600,
    margin: 2,
    color: {
      dark: "#2A1810",
      light: "#FFFFFF",
    },
  });
}

export async function generateQRCodeSVG(url: string): Promise<string> {
  return await QRCode.toString(url, {
    type: "svg",
    margin: 2,
    color: {
      dark: "#2A1810",
      light: "#FFFFFF",
    },
  });
}

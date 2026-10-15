export interface ShareImageData {
  imagePath: string;
  modelName: string;
  price: string | null;
  currency: string;
  shopName: string;
  logoPath: string | null;
}

const SIZE = 1080;

export async function generateShareImage(data: ShareImageData): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;

  // 1. Image principale
  const img = await loadImage(`/storage/${data.imagePath}`);
  drawCover(ctx, img, 0, 0, SIZE, SIZE);

  // 2. Overlay dégradé bas (pour lisibilité du texte)
  const gradient = ctx.createLinearGradient(0, SIZE * 0.4, 0, SIZE);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(0.5, "rgba(0,0,0,0.5)");
  gradient.addColorStop(1, "rgba(0,0,0,0.9)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, SIZE * 0.4, SIZE, SIZE * 0.6);

  // 3. Léger dégradé haut (pour lisibilité du nom boutique)
  const topGrad = ctx.createLinearGradient(0, 0, 0, SIZE * 0.25);
  topGrad.addColorStop(0, "rgba(0,0,0,0.55)");
  topGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, SIZE, SIZE * 0.25);

  // 4. Attendre le chargement des fonts Google
  await document.fonts.load('700 72px "Playfair Display"');
  await document.fonts.load("600 22px Inter");
  await document.fonts.load("500 36px Inter");

  // 5. Nom de la vitrine en haut
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "600 22px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if ("letterSpacing" in ctx) {
    (ctx as any).letterSpacing = "6px";
  }
  ctx.fillText(data.shopName.toUpperCase(), SIZE / 2, 72);

  // 6. Nom du modèle (gros, Playfair)
  ctx.fillStyle = "white";
  ctx.font = '700 76px "Playfair Display", serif';
  ctx.textAlign = "center";
  if ("letterSpacing" in ctx) {
    (ctx as any).letterSpacing = "0px";
  }
  wrapText(ctx, data.modelName, SIZE / 2, SIZE - 230, SIZE - 140, 90, 2);

  // 7. Prix
  if (data.price) {
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "500 38px Inter, sans-serif";
    const priceText = `${Number(data.price).toLocaleString("fr-FR")} ${data.currency}`;
    ctx.fillText(priceText, SIZE / 2, SIZE - 120);
  }

  // 8. Signature bas de page
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "500 16px Inter, sans-serif";
  if ("letterSpacing" in ctx) {
    (ctx as any).letterSpacing = "4px";
  }
  ctx.fillText("STYLWARD", SIZE / 2, SIZE - 45);

  // 9. Export en PNG
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Canvas toBlob failed")),
      "image/png",
      0.95,
    );
  });
}

/* ═══════════════════════════════════════════════════ */

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Impossible de charger ${src}`));
    img.src = src;
  });
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const imgAspect = img.width / img.height;
  const boxAspect = w / h;

  let srcX = 0,
    srcY = 0,
    srcW = img.width,
    srcH = img.height;

  if (imgAspect > boxAspect) {
    srcW = img.height * boxAspect;
    srcX = (img.width - srcW) / 2;
  } else {
    srcH = img.width / boxAspect;
    srcY = (img.height - srcH) / 2;
  }

  ctx.drawImage(img, srcX, srcY, srcW, srcH, x, y, w, h);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
      if (lines.length >= maxLines) break;
    } else {
      current = test;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);

  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, x, startY + i * lineHeight);
  });
}

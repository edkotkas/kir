import type { RefObject } from "react";
import { useEffect } from "react";

type UseQrMaskEffectInput = {
  useModuleImage: boolean;
  moduleImage: string | null;
  qrCanvasRef: RefObject<HTMLCanvasElement | null>;
  qrMaskCanvasRef: RefObject<HTMLCanvasElement | null>;
  bgColor: string;
  rerenderKey: string;
};

export function useQrMaskEffect({
  useModuleImage,
  moduleImage,
  qrCanvasRef,
  qrMaskCanvasRef,
  bgColor,
  rerenderKey
}: UseQrMaskEffectInput) {
  useEffect(() => {
    if (
      !useModuleImage ||
      !moduleImage ||
      !qrCanvasRef.current ||
      !qrMaskCanvasRef.current
    ) {
      return;
    }

    const targetCanvas = qrCanvasRef.current;
    const maskCanvas = qrMaskCanvasRef.current;
    const targetContext = targetCanvas.getContext("2d");
    const maskContext = maskCanvas.getContext("2d");
    if (!targetContext || !maskContext) {
      return;
    }

    let disposed = false;
    let rafId: number | null = null;
    const width = targetCanvas.width;
    const height = targetCanvas.height;

    const applyMask = async (attempt = 0) => {
      const qrMaskSnapshot = maskContext.getImageData(0, 0, width, height);

      let darkCount = 0;
      for (let i = 0; i < qrMaskSnapshot.data.length; i += 4) {
        const r = qrMaskSnapshot.data[i];
        const g = qrMaskSnapshot.data[i + 1];
        const b = qrMaskSnapshot.data[i + 2];
        const a = qrMaskSnapshot.data[i + 3];
        const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        if (a > 0 && luma < 128) {
          darkCount += 1;
        }
      }

      if (darkCount === 0) {
        if (attempt < 6 && !disposed) {
          rafId = window.requestAnimationFrame(() => {
            void applyMask(attempt + 1);
          });
        }
        return;
      }

      const image = new Image();
      image.decoding = "async";
      image.src = moduleImage;
      await image.decode();

      if (disposed) {
        return;
      }

      const patternCanvas = document.createElement("canvas");
      patternCanvas.width = width;
      patternCanvas.height = height;
      const patternContext = patternCanvas.getContext("2d");
      if (!patternContext) {
        return;
      }

      const sourceAspect = image.width / image.height;
      const targetAspect = width / height;

      let drawWidth: number;
      let drawHeight: number;
      let drawX = 0;
      let drawY = 0;

      if (sourceAspect > targetAspect) {
        drawHeight = height;
        drawWidth = drawHeight * sourceAspect;
        drawX = (width - drawWidth) / 2;
      } else {
        drawWidth = width;
        drawHeight = drawWidth / sourceAspect;
        drawY = (height - drawHeight) / 2;
      }

      patternContext.drawImage(image, drawX, drawY, drawWidth, drawHeight);

      const maskData = new ImageData(width, height);
      for (let i = 0; i < qrMaskSnapshot.data.length; i += 4) {
        const r = qrMaskSnapshot.data[i];
        const g = qrMaskSnapshot.data[i + 1];
        const b = qrMaskSnapshot.data[i + 2];
        const a = qrMaskSnapshot.data[i + 3];
        const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const isDarkModule = a > 0 && luma < 128;
        maskData.data[i + 3] = isDarkModule ? 255 : 0;
      }

      const alphaMaskCanvas = document.createElement("canvas");
      alphaMaskCanvas.width = width;
      alphaMaskCanvas.height = height;
      const alphaMaskContext = alphaMaskCanvas.getContext("2d");
      if (!alphaMaskContext) {
        return;
      }

      alphaMaskContext.putImageData(maskData, 0, 0);

      targetContext.clearRect(0, 0, width, height);
      targetContext.drawImage(patternCanvas, 0, 0);
      targetContext.globalCompositeOperation = "destination-in";
      targetContext.drawImage(alphaMaskCanvas, 0, 0);
      targetContext.globalCompositeOperation = "destination-over";
      targetContext.fillStyle = bgColor;
      targetContext.fillRect(0, 0, width, height);
      targetContext.globalCompositeOperation = "source-over";
    };

    void applyMask();

    return () => {
      disposed = true;
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [
    bgColor,
    moduleImage,
    qrCanvasRef,
    qrMaskCanvasRef,
    rerenderKey,
    useModuleImage
  ]);
}

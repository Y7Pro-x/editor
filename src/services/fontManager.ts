import { CustomFont } from '../types';

/**
 * Service to dynamically load and register custom .ttf fonts in browser via FontFace API
 */
export class FontManager {
  private static instance: FontManager;
  private loadedFontFamilies: Set<string> = new Set();

  public static getInstance(): FontManager {
    if (!FontManager.instance) {
      FontManager.instance = new FontManager();
    }
    return FontManager.instance;
  }

  /**
   * Register a custom font in document.fonts
   */
  public async loadFont(font: CustomFont): Promise<boolean> {
    if (this.loadedFontFamilies.has(font.fontFamily)) {
      return true;
    }

    try {
      // Convert base64 data to ArrayBuffer
      const binaryString = atob(font.dataBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const fontFace = new FontFace(font.fontFamily, bytes.buffer);
      await fontFace.load();
      document.fonts.add(fontFace);
      this.loadedFontFamilies.add(font.fontFamily);
      return true;
    } catch (err) {
      console.error(`Failed to load font "${font.name}":`, err);
      return false;
    }
  }

  /**
   * Load all saved custom fonts at app startup
   */
  public async loadAllFonts(fonts: CustomFont[]): Promise<void> {
    for (const font of fonts) {
      await this.loadFont(font);
    }
  }

  /**
   * Convert file to base64 string
   */
  public static readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip data:font/ttf;base64, prefix
        const base64 = result.split(',')[1] || result;
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Format byte size nicely
   */
  public static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 بايت';
    const k = 1024;
    const sizes = ['بايت', 'ك.ب', 'م.ب'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}

import type {
  Gate,
  Wire,
  GateMetadata,
  CustomGateDefinition,
} from '../types/circuit';

// 共有データの型定義
interface SharedGateData {
  id: string;
  t: string; // type
  p: { x: number; y: number }; // position
  i: string[]; // inputs
  o: boolean; // output
  m?: GateMetadata; // metadata（特殊ゲート用）
  c?: CustomGateDefinition; // カスタムゲート定義
}

interface SharedWireData {
  id: string;
  f: { gateId: string; pinIndex: number }; // from
  t: { gateId: string; pinIndex: number }; // to
}

/**
 * 回路共有URL機能
 * - 回路データをURLパラメータに圧縮エンコード
 * - サーバー不要でインスタント共有
 * - プライバシー保護（データはURLのみ）
 */
export class CircuitShareService {
  private static readonly URL_PARAM_KEY = 'circuit';
  private static readonly MAX_URL_LENGTH = 2048; // 一般的なブラウザのURL長制限

  /**
   * 回路データを共有URLに変換
   */
  public static async createShareUrl(
    gates: Gate[],
    wires: Wire[],
    options: {
      name?: string;
      description?: string;
      baseUrl?: string;
    } = {}
  ): Promise<{
    success: boolean;
    url?: string;
    error?: string;
  }> {
    try {
      // 共有用の最小限のデータ構造
      const shareData = {
        v: 1, // バージョン
        n: options.name, // 名前（オプション）
        d: options.description, // 説明（オプション）
        g: gates.map(gate => ({
          id: gate.id,
          t: gate.type, // type
          p: gate.position, // position
          i: gate.inputs, // inputs
          o: gate.output, // output
          m: gate.metadata, // metadata（特殊ゲート用）
          c: gate.customGateDefinition, // カスタムゲート定義
        })),
        w: wires.map(wire => ({
          id: wire.id,
          f: wire.from, // from
          t: wire.to, // to
        })),
      };

      // JSON化してBase64エンコード
      // 注：圧縮ライブラリが使えないため、直接Base64エンコード
      const json = JSON.stringify(shareData);
      const encoded = btoa(
        encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) =>
          String.fromCharCode(parseInt(p1, 16))
        )
      )
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      // URLを構築
      const baseUrl =
        options.baseUrl || window.location.origin + window.location.pathname;
      const shareUrl = `${baseUrl}?${this.URL_PARAM_KEY}=${encoded}`;

      // URL長チェック
      if (shareUrl.length > this.MAX_URL_LENGTH) {
        // 大きすぎる場合は、カスタムゲート定義を除外して再試行
        const minimalShareData = {
          ...shareData,
          g: shareData.g.map(g => ({
            ...g,
            c: undefined, // カスタムゲート定義を除外
          })),
        };

        const minimalJson = JSON.stringify(minimalShareData);
        const minimalEncoded = btoa(
          encodeURIComponent(minimalJson).replace(/%([0-9A-F]{2})/g, (_, p1) =>
            String.fromCharCode(parseInt(p1, 16))
          )
        )
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');

        const minimalShareUrl = `${baseUrl}?${this.URL_PARAM_KEY}=${minimalEncoded}`;

        if (minimalShareUrl.length > this.MAX_URL_LENGTH) {
          return {
            success: false,
            error: `回路が大きすぎて共有URLを生成できません（${gates.length}個のゲート、${wires.length}本のワイヤー）。回路を小さくしてから共有してください。`,
          };
        }

        return {
          success: true,
          url: minimalShareUrl,
        };
      }

      return {
        success: true,
        url: shareUrl,
      };
    } catch (error) {
      console.error('共有URL生成エラー:', error);
      return {
        success: false,
        error: '共有URLの生成に失敗しました。',
      };
    }
  }

  /**
   * 共有URLから回路データを復元
   */
  public static async parseShareUrl(url: string): Promise<{
    success: boolean;
    data?: {
      name?: string;
      description?: string;
      gates: Gate[];
      wires: Wire[];
    };
    error?: string;
  }> {
    try {
      // URLからパラメータを抽出
      const urlObj = new URL(url, window.location.origin);
      const encoded = urlObj.searchParams.get(this.URL_PARAM_KEY);

      if (!encoded) {
        return {
          success: false,
          error: '共有URLに回路データが含まれていません。',
        };
      }

      // Base64URLデコード
      const decoded = globalThis.atob(
        encoded
          .replace(/-/g, '+')
          .replace(/_/g, '/')
          .padEnd(encoded.length + ((4 - (encoded.length % 4)) % 4), '=')
      );

      // JSONパース
      const json = decodeURIComponent(
        decoded
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      if (!json) {
        return {
          success: false,
          error:
            '回路データのデコードに失敗しました。URLが破損している可能性があります。',
        };
      }

      // JSONパース
      const shareData = JSON.parse(json);

      // バージョンチェック
      if (shareData.v !== 1) {
        return {
          success: false,
          error: 'サポートされていないバージョンの共有URLです。',
        };
      }

      // データを復元
      const gates: Gate[] = shareData.g.map((g: SharedGateData) => ({
        id: g.id,
        type: g.t,
        position: g.p,
        inputs: g.i,
        output: g.o,
        metadata: g.m,
        customGateDefinition: g.c,
      }));

      const wires: Wire[] = shareData.w.map((w: SharedWireData) => ({
        id: w.id,
        from: w.f,
        to: w.t,
      }));

      return {
        success: true,
        data: {
          name: shareData.n,
          description: shareData.d,
          gates,
          wires,
        },
      };
    } catch (error) {
      console.error('共有URL解析エラー:', error);
      return {
        success: false,
        error: '共有URLの解析に失敗しました。URLが正しいか確認してください。',
      };
    }
  }

  /**
   * 現在のURLに回路データが含まれているかチェック
   */
  public static hasShareData(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has(this.URL_PARAM_KEY);
  }

  /**
   * 現在のURLから回路データを読み込み
   */
  public static async loadFromCurrentUrl(): Promise<{
    success: boolean;
    data?: {
      name?: string;
      description?: string;
      gates: Gate[];
      wires: Wire[];
    };
    error?: string;
  }> {
    return this.parseShareUrl(window.location.href);
  }

  /**
   * URLパラメータをクリア（読み込み後のクリーンアップ用）
   */
  public static clearShareParams(): void {
    const url = new URL(window.location.href);
    url.searchParams.delete(this.URL_PARAM_KEY);
    window.history.replaceState({}, '', url.toString());
  }
}

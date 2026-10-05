import { Transformer } from '@/modules/Transformer/Transformer';

export class GetApiKeysTransformer extends Transformer {
  public includeAttributes = (): string[] => {
    return ['id', 'name', 'token', 'createdAt', 'expiresAt', 'revokedAt'];
  };

  // Allowlist only: the raw `key` must never leave the server after creation.
  public excludeAttributes = (): string[] => {
    return ['*'];
  };

  public token(apiKey) {
    return apiKey.key ? `${apiKey.key.substring(0, 8)}...` : '';
  }
}

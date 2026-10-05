import { GetApiKeysTransformer } from './GetApiKeys.transformer';

describe('GetApiKeysTransformer', () => {
  it('never returns the raw API key', async () => {
    const key = 'bc_' + 'd'.repeat(96);
    const [row] = await new GetApiKeysTransformer().work([
      { id: 1, key, name: 'dummy', userId: 7, tenantId: 3, createdAt: '2026-01-01' },
    ]);

    expect(row.key).toBeUndefined();
    expect(row.userId).toBeUndefined();
    expect(row.tenantId).toBeUndefined();
    expect(row.token).toBe('bc_ddddd...');
    expect(row).toMatchObject({ id: 1, name: 'dummy', createdAt: '2026-01-01' });
  });
});

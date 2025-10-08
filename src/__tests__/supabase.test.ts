import { supabase, isConnected } from '../lib/supabase';

describe('Supabase Connection', () => {
  test('should have valid connection', () => {
    expect(isConnected).toBe(true);
  });

  test('should have supabase client', () => {
    expect(supabase).toBeDefined();
    expect(supabase.from).toBeDefined();
  });

  test('should be able to query companies table', async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});

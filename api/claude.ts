import type { VercelRequest, VercelResponse } from '@vercel/node';

const PROMPTS: Record<string, string> = {
  'music-news': `Search the web for the 3 most important music and guitar news stories from the past week. Include new album releases, artist news, and industry developments. For each story return a JSON object with: title (string), summary (exactly 2 sentences), url (string or null). Return ONLY a valid JSON array, no markdown, no other text.`,

  'gear-radar': `List the 3 most notable new guitar gear releases from the past few months — including guitars, pedals, amps, and audio interfaces. Use your knowledge. For each return a JSON object with: title (string), summary (exactly 2 sentences describing the gear and why it matters), url (string or null). Return ONLY a valid JSON array, no markdown, no other text.`,

  'discovery-pick': `Suggest 3 guitar artists or albums that a serious guitar enthusiast with eclectic taste should discover. Mix genres — include at least one hidden gem, one emerging artist, and one overlooked classic. For each return: artist (string), album (string or null), genre (string), why (exactly 2 sentences on why they're worth hearing). Return ONLY a valid JSON array, no markdown, no other text.`,
};

const USE_WEB_SEARCH: Record<string, boolean> = {
  'music-news': true,
  'gear-radar': false,
  'discovery-pick': false,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });

  const { type } = req.body as { type: string };
  const prompt = PROMPTS[type];
  if (!prompt) return res.status(400).json({ error: `Unknown type: ${type}` });

  const useWebSearch = USE_WEB_SEARCH[type] ?? false;
  const maxTokens = useWebSearch ? 2000 : 1000;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 28000);

  const requestBody: Record<string, unknown> = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  };
  if (useWebSearch) {
    requestBody.tools = [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }];
  }

  const headers: Record<string, string> = {
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
  };
  if (useWebSearch) {
    headers['anthropic-beta'] = 'web-search-2025-03-05';
  }

  let claudeRes: Response;
  try {
    claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers,
      body: JSON.stringify(requestBody),
    });
  } catch (e: any) {
    clearTimeout(timeout);
    return res.status(504).json({ error: e.name === 'AbortError' ? 'Claude timed out' : e.message });
  }
  clearTimeout(timeout);

  if (!claudeRes.ok) {
    const errBody = await claudeRes.text().catch(() => '(unreadable)');
    return res.status(claudeRes.status).json({ error: `Claude API error ${claudeRes.status}`, detail: errBody });
  }

  const data = await claudeRes.json() as any;
  const text = (data.content ?? [])
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text as string)
    .join('');

  let parsed: unknown;
  try {
    parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    return res.status(500).json({ error: 'Failed to parse Claude response', raw: text.slice(0, 500) });
  }

  return res.status(200).json({ data: parsed });
}

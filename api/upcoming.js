
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Método não permitido.'
    });
  }

  const token = process.env.FOOTBALL_DATA_TOKEN;

  if (!token) {
    return res.status(500).json({
      error: 'A variável FOOTBALL_DATA_TOKEN não está configurada na Vercel.'
    });
  }

  try {
    const response = await fetch(
      'https://api.football-data.org/v4/competitions/BSA/matches',
      {
        headers: {
          'X-Auth-Token': token
        },
        cache: 'no-store'
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({
        error:
          'Erro na football-data.org: ' +
          (data.message || JSON.stringify(data))
      });
    }

    const now = Date.now();

    // Seleciona jogos que ainda não começaram e possuem rodada.
    const matches = (data.matches || [])
      .filter(match =>
        match.matchday != null &&
        match.utcDate &&
        new Date(match.utcDate).getTime() >= now &&
        ['SCHEDULED', 'TIMED'].includes(match.status) &&
        match.homeTeam?.name &&
        match.awayTeam?.name
      )
      .sort((a, b) =>
        new Date(a.utcDate) - new Date(b.utcDate)
      );

    // Agrupa os jogos por número da rodada.
    const grouped = new Map();

    for (const match of matches) {
      const matchday = match.matchday;

      if (!grouped.has(matchday)) {
        grouped.set(matchday, {
          matchday,
          games: []
        });
      }

      grouped.get(matchday).games.push({
        home: match.homeTeam.name,
        away: match.awayTeam.name
      });
    }

    const requested = Number.parseInt(req.query?.n, 10);
    const limit = Number.isFinite(requested)
      ? Math.min(Math.max(requested, 1), 10)
      : 3;

    const rounds = Array.from(grouped.values())
      .sort((a, b) => a.matchday - b.matchday)
      .slice(0, limit);

    return res.status(200).json({ rounds });

  } catch (error) {
    console.error('Erro ao buscar próximas rodadas:', error);

    return res.status(500).json({
      error: 'Não foi possível buscar as próximas rodadas.'
    });
  }
}
// Função serverless (Vercel) que busca os resultados reais das partidas
// do Campeonato Brasileiro Série A na API-Football (api-sports.io) e
// compara com os jogos informados pelo site.
//
// Configure a variável de ambiente API_FOOTBALL_KEY no painel da Vercel
// com a chave gratuita obtida em https://dashboard.api-football.com

function normalize(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .trim();
}

// Apelidos comuns para bater o nome usado no bolão com o nome oficial da API
var ALIASES = {
  'atletico mg': 'atletico mineiro',
  'atleticomg': 'atletico mineiro',
  'athletico pr': 'athletico paranaense',
  'athleticopr': 'athletico paranaense',
  'rb bragantino': 'red bull bragantino',
  'bragantino': 'red bull bragantino',
  'vasco': 'vasco da gama'
};

function canonical(name) {
  var n = normalize(name);
  return ALIASES[n] || n;
}

function teamsMatch(apiName, ourName) {
  var a = canonical(apiName);
  var b = canonical(ourName);
  if (!a || !b) return false;
  return a === b || a.indexOf(b) !== -1 || b.indexOf(a) !== -1;
}

async function getBrasileiraoLeagueId(apiKey) {
  if (process.env.API_FOOTBALL_LEAGUE_ID) {
    return process.env.API_FOOTBALL_LEAGUE_ID;
  }
  var resp = await fetch('https://v3.football.api-sports.io/leagues?country=Brazil&type=League', {
    headers: { 'x-apisports-key': apiKey }
  });
  var data = await resp.json();
  var list = data.response || [];
  var match = list.find(function (l) {
    var n = (l.league.name || '').toLowerCase();
    return n.indexOf('serie a') !== -1 || n.indexOf('série a') !== -1 || n.indexOf('brasileirao') !== -1 || n.indexOf('brasileirão') !== -1;
  });
  if (!match) {
    throw new Error('Não encontrei o ID da Série A automaticamente. Defina API_FOOTBALL_LEAGUE_ID manualmente.');
  }
  return match.league.id;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  var apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'A variável de ambiente API_FOOTBALL_KEY não está configurada no servidor.' });
  }

  var matches = (req.body && req.body.matches) || [];
  if (!Array.isArray(matches) || matches.length === 0) {
    return res.status(400).json({ error: 'Nenhum jogo informado.' });
  }

  var season = new Date().getFullYear();

  try {
    var leagueId = await getBrasileiraoLeagueId(apiKey);

    var fixturesResp = await fetch(
      'https://v3.football.api-sports.io/fixtures?league=' + leagueId + '&season=' + season,
      { headers: { 'x-apisports-key': apiKey } }
    );
    var fixturesData = await fixturesResp.json();
    if (fixturesData.errors && Object.keys(fixturesData.errors).length > 0) {
      return res.status(502).json({ error: 'A API-Football retornou um erro: ' + JSON.stringify(fixturesData.errors) });
    }
    var fixtures = fixturesData.response || [];

    var results = matches.map(function (m) {
      var found = fixtures.find(function (fx) {
        return teamsMatch(fx.teams.home.name, m.home) && teamsMatch(fx.teams.away.name, m.away);
      });
      if (found && found.fixture.status.short === 'FT') {
        return {
          home: m.home,
          away: m.away,
          homeGoals: found.goals.home,
          awayGoals: found.goals.away,
          status: 'finished'
        };
      }
      return { home: m.home, away: m.away, homeGoals: null, awayGoals: null, status: 'not_found' };
    });

    return res.status(200).json({ results: results });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'Erro ao consultar a API-Football.' });
  }
}

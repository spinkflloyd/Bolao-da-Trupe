function normalize(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(sc|ec|fc|se|ac|aa|cr|efc)\b/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

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

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  var token = process.env.FOOTBALL_DATA_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'A variável de ambiente FOOTBALL_DATA_TOKEN não está configurada no servidor.' });
  }

  var matches = (req.body && req.body.matches) || [];
  if (!Array.isArray(matches) || matches.length === 0) {
    return res.status(400).json({ error: 'Nenhum jogo informado.' });
  }

  try {
    var resp = await fetch('https://api.football-data.org/v4/competitions/BSA/matches', {
      headers: { 'X-Auth-Token': token }
    });
    var data = await resp.json();

    if (!resp.ok) {
      return res.status(502).json({ error: 'A football-data.org retornou um erro: ' + (data.message || JSON.stringify(data)) });
    }

    var apiMatches = data.matches || [];

    var results = matches.map(function (m) {
      var found = apiMatches.find(function (fx) {
        return teamsMatch(fx.homeTeam.name, m.home) && teamsMatch(fx.awayTeam.name, m.away);
      });
      if (found && found.status === 'FINISHED' && found.score && found.score.fullTime && found.score.fullTime.home != null) {
        return {
          home: m.home,
          away: m.away,
          homeGoals: found.score.fullTime.home,
          awayGoals: found.score.fullTime.away,
          status: 'finished'
        };
      }
      return { home: m.home, away: m.away, homeGoals: null, awayGoals: null, status: 'not_found' };
    });

    return res.status(200).json({ results: results });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'Erro ao consultar a football-data.org.' });
  }
};
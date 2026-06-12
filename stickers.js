const TEAMS = [
  { code: 'MEX', name: 'Mexico' },
  { code: 'RSA', name: 'South Africa' },
  { code: 'KOR', name: 'South Korea' },
  { code: 'CZE', name: 'Czechia' },
  { code: 'CAN', name: 'Canada' },
  { code: 'BIH', name: 'Bosnia and Herzegovina' },
  { code: 'QAT', name: 'Qatar' },
  { code: 'SUI', name: 'Switzerland' },
  { code: 'BRA', name: 'Brazil' },
  { code: 'HAI', name: 'Haiti' },
  { code: 'MAR', name: 'Morocco' },
  { code: 'SCO', name: 'Scotland' },
  { code: 'USA', name: 'United States' },
  { code: 'PAR', name: 'Paraguay' },
  { code: 'AUS', name: 'Australia' },
  { code: 'TUR', name: 'Türkiye' },
  { code: 'GER', name: 'Germany' },
  { code: 'CUW', name: 'Curaçao' },
  { code: 'CIV', name: 'Ivory Coast' },
  { code: 'ECU', name: 'Ecuador' },
  { code: 'NED', name: 'Netherlands' },
  { code: 'JPN', name: 'Japan' },
  { code: 'SWE', name: 'Sweden' },
  { code: 'TUN', name: 'Tunisia' },
  { code: 'BEL', name: 'Belgium' },
  { code: 'EGY', name: 'Egypt' },
  { code: 'IRN', name: 'Iran' },
  { code: 'NZL', name: 'New Zealand' },
  { code: 'ESP', name: 'Spain' },
  { code: 'CPV', name: 'Cape Verde' },
  { code: 'KSA', name: 'Saudi Arabia' },
  { code: 'URU', name: 'Uruguay' },
  { code: 'FRA', name: 'France' },
  { code: 'SEN', name: 'Senegal' },
  { code: 'IRQ', name: 'Iraq' },
  { code: 'NOR', name: 'Norway' },
  { code: 'ARG', name: 'Argentina' },
  { code: 'ALG', name: 'Algeria' },
  { code: 'AUT', name: 'Austria' },
  { code: 'JOR', name: 'Jordan' },
  { code: 'POR', name: 'Portugal' },
  { code: 'COD', name: 'Congo DR' },
  { code: 'UZB', name: 'Uzbekistan' },
  { code: 'COL', name: 'Colombia' },
  { code: 'ENG', name: 'England' },
  { code: 'CRO', name: 'Croatia' },
  { code: 'GHA', name: 'Ghana' },
  { code: 'PAN', name: 'Panama' },
];

const STICKERS = (() => {
  const list = [];

  // Introduction (9 stickers)
  list.push({ code: '00',   name: 'Panini Logo',                      section: 'Introduction' });
  list.push({ code: 'FWC1', name: 'Official Emblem',                  section: 'Introduction' });
  list.push({ code: 'FWC2', name: 'Official Emblem',                  section: 'Introduction' });
  list.push({ code: 'FWC3', name: 'Official Mascots',                 section: 'Introduction' });
  list.push({ code: 'FWC4', name: 'Official Slogan',                  section: 'Introduction' });
  list.push({ code: 'FWC5', name: 'Official Ball',                    section: 'Introduction' });
  list.push({ code: 'FWC6', name: 'Canada - Host Countries & Cities', section: 'Introduction' });
  list.push({ code: 'FWC7', name: 'Mexico - Host Countries & Cities', section: 'Introduction' });
  list.push({ code: 'FWC8', name: 'USA - Host Countries & Cities',    section: 'Introduction' });

  // FIFA Museum (11 stickers: FWC9–FWC19)
  const museum = [
    'Italy 1934', 'Uruguay 1950', 'West Germany 1954', 'Brazil 1962',
    'West Germany 1974', 'Argentina 1986', 'Brazil 1994', 'Brazil 2002',
    'Italy 2006', 'Germany 2014', 'Argentina 2022',
  ];
  museum.forEach((name, i) => {
    list.push({ code: `FWC${9 + i}`, name, section: 'FIFA Museum' });
  });

  // Teams: 48 × 20 = 960 stickers
  // Per team: [1-2] Badge foil, [3-12] Players 1-10, [13] Team Photo, [14-20] Players 11-17
  for (const team of TEAMS) {
    list.push({ code: `${team.code}1`,  name: `${team.name} - Badge`,      section: team.name });
    list.push({ code: `${team.code}2`,  name: `${team.name} - Badge`,      section: team.name });
    for (let i = 3; i <= 12; i++) {
      list.push({ code: `${team.code}${i}`, name: `${team.name} - Player ${i - 2}`, section: team.name });
    }
    list.push({ code: `${team.code}13`, name: `${team.name} - Team Photo`, section: team.name });
    for (let i = 14; i <= 20; i++) {
      list.push({ code: `${team.code}${i}`, name: `${team.name} - Player ${i - 3}`, section: team.name });
    }
  }

  // Sanity check: should be 980
  if (list.length !== 980) console.warn(`Expected 980 stickers, got ${list.length}`);

  return list;
})();

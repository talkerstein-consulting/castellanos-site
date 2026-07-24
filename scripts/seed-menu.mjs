// One-time seed: populates menu_items from the site's original hardcoded menu content.
// Run with: npm run db:seed  (reads DB creds from .env via --env-file)
import mysql from 'mysql2/promise';

const connectionUri =
  process.env.DATABASE_URL ||
  `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME}`;

const items = [
  // section, subheading, name, price, description
  ['antipasti', 'Antipasti', 'Focaccia e Olive', '12', 'Homemade golden and airy Italian flatbread with marinated olives.'],
  ['antipasti', 'Antipasti', 'Fritto Misto', '30', "Fried calamari and shrimp dusted with corn flour and Castellano's seasoning, naturally gluten-free."],
  ['antipasti', 'Antipasti', 'Crudo di Polipo', '30', 'Thinly sliced octopus with capers, sun-dried black olives in a lemon extra virgin olive oil dressing.'],
  ['antipasti', 'Antipasti', 'Carpaccio di Manzo', '28', "Thinly sliced AAA beef tenderloin seasoned with peppercorns and Castellano's herbs, arugula and parmigiano shavings in a lemon extra virgin olive oil dressing."],
  ['antipasti', 'Antipasti', 'Burrata e Prosciutto', '28', 'Prosciutto di Parma, arugula and heirloom cherry tomatoes with creamy burrata.'],
  ['antipasti', 'Antipasti', 'Ostriche del Giorno', '22', "Chef's selection of a half-dozen fresh coastal oysters."],
  ['antipasti', 'Insalate', 'Indivia', '22', 'Crisp endive, crunchy pancetta and raspberries in a white balsamic vinaigrette.'],
  ['antipasti', 'Insalate', 'Cesare', '18', "Romaine hearts, smoked bacon, herb croutons and shaved parmigiano in Castellano's creamy garlic dressing."],
  ['antipasti', 'Insalate', 'Dal Campo', '16', 'Mixed greens, arugula, romaine, julienne fennel, carrots, cucumbers in a red vinaigrette dressing.'],

  ['pizze', null, 'Pizza Aragosta', '35', 'Lobster, fior di latte, roasted garlic and fresh chives.'],
  ['pizze', null, 'Bresaola e Rugola', '26', 'Dry salted beef, arugula, cherry tomatoes and parmigiano shavings.'],
  ['pizze', null, 'Prosciutto e Fichi', '28', 'Prosciutto, fresh figs, walnuts and honey.'],
  ['pizze', null, 'Cinghiale al Tartufo', '30', 'Wild boar sausage, porcini mushrooms and black truffles.'],
  ['pizze', null, 'Mortadella e Pistacchio', '28', 'Mortadella, shreds of burrata and roasted pistachio.'],
  ['pizze', null, 'Pizza Wagyu', '40', 'Wagyu beef, heirloom cherry tomatoes and bufala cheese.'],
  ['pizze', null, 'Bufalina', '25', 'Tomato sauce, bufala mozzarella and fresh basil.'],

  ['pasta', 'Pasta', 'Mezzelune al Brasato di Manzo', '26', 'Handmade half-moon pasta filled with short rib, ricotta and fior di latte in a light rosé sauce.'],
  ['pasta', 'Pasta', 'Spaghettoni alla Nerano', '27', 'Thick artisanal spaghetti tossed in a velvet smooth reduction of flash-fried zucchini and parmigiano.'],
  ['pasta', 'Pasta', 'Pescatore', '35', 'Linguine with mussels, clams, calamari and shrimp in a light cherry tomato sauce.'],
  ['pasta', 'Pasta', 'Scialatelli alla Siciliana', '26', 'Fresh handmade Neapolitan pasta ribbons with caramelized eggplant, fior di latte and basil in a San Marzano tomato sauce.'],
  ['pasta', 'Risotto', 'Risotto ai Porcini con cestino di Grano', '30', 'Creamy carnaroli rice infused with wild porcini mushrooms and finished with black truffle nectar served in a hand-sculpted parmigiano reggiano basket.'],
  ['pasta', 'Risotto', 'Gluten Free Available', '5', null, true],

  ['mains', 'La Carne', 'Bauletto di Vitello', '45', 'Milk-fed veal, stuffed with fontina cheese, prosciutto, mushrooms, in a red pepper sauce. Served with roasted potatoes.'],
  ['mains', 'La Carne', 'Supreme di Pollo alle Erbe', '38', "8 oz roasted chicken supreme dusted with Castellano's herbs. Served with roasted potatoes and seasonal vegetables."],
  ['mains', 'La Carne', 'Filetto di Manzo al Pepe Verde', '56', '8oz AAA beef tenderloin topped with green peppercorn sauce. Served with mashed potatoes and broccolini.'],
  ['mains', 'La Carne', 'Costolette di Agnello', '60', 'Four grilled Ontario lamb chops. Served with supplì di riso and asparagus spears.'],
  ['mains', 'La Carne', 'Bistecca alla Griglia', '65', "12oz Prime New York Striploin. Served with potato N'duja croquettes and balsamic glazed Brussels sprouts."],
  ['mains', 'Pesce', 'Spigola alla Griglia', '45', 'Grilled whole Mediterranean sea bass. Served with seasonal vegetables and roasted potatoes.'],
  ['mains', 'Pesce', 'Orata Acqua Pazza', '47', 'Fresh sea bream poached in light aromatic broth with cherry tomatoes, garlic, white wine, herbs and extra virgin olive oil.'],
  ['mains', 'Pesce', 'Grigliata Mista di Pesce', '80', 'Mixed grilled seafood: sea bass, salmon, shrimp, calamari and lobster tails. Served with an extra virgin olive oil dressing, portioned for two.'],
  ['mains', 'Sides', 'Baked Oyster Mushrooms', '10', null],
  ['mains', 'Sides', 'Asparagus Spears', '10', null],
  ['mains', 'Sides', 'Sautéed Broccolini', '10', null],
  ['mains', 'Sides', 'Roasted Balsamic Glazed Brussels Sprouts', '10', null],
  ['mains', 'Sides', 'Rapini', '10', null],

  ['desserts', null, 'Crème Brûlée', '12', null],
  ['desserts', null, 'Panna Cotta', '12', 'With mixed berry compote.'],
  ['desserts', null, 'Chocolate Lava Cake', '14', 'With vanilla gelato.'],
  ['desserts', null, 'Tiramisu', '10', null],
];

const conn = await mysql.createConnection(connectionUri);

const [[{ count }]] = await conn.query('SELECT COUNT(*) as count FROM menu_items');
if (count > 0) {
  console.log(`menu_items already has ${count} rows — skipping seed. Truncate the table first if you want to reseed.`);
  await conn.end();
  process.exit(0);
}

let sortOrder = 0;
for (const [section, subheading, name, price, description, isNote = false] of items) {
  await conn.query(
    'INSERT INTO menu_items (section, subheading, name, price, description, sort_order, is_active, is_note) VALUES (?, ?, ?, ?, ?, ?, true, ?)',
    [section, subheading, name, price, description, sortOrder++, isNote]
  );
}

console.log(`Seeded ${items.length} menu items.`);
await conn.end();

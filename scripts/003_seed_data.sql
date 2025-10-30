-- Insertar deportes de ejemplo
insert into public.sports (name, description) values
  ('Fútbol', 'Entrenamiento de fútbol profesional'),
  ('Básquetbol', 'Entrenamiento de básquetbol'),
  ('Natación', 'Entrenamiento de natación competitiva'),
  ('Atletismo', 'Entrenamiento de atletismo y carreras'),
  ('Voleibol', 'Entrenamiento de voleibol')
on conflict (name) do nothing;

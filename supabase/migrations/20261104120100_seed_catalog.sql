insert into public.categories (id, name, icon, description, sort_order)
values
  ('musique', 'Musique', 'Music', 'Les meilleurs artistes, voix, styles urbains, traditionnels et révélations musicales de l''Afrique et de la diaspora.', 1),
  ('danse', 'Danse et performance', 'Sparkles', 'Les danseurs, chorégraphes, DJs et performeurs scéniques qui enflamment les scènes et le public.', 2),
  ('arts', 'Arts et créativité', 'Palette', 'Peintres, photographes, réalisateurs, stylistes et créateurs visuels qui façonnent l''esthétique contemporaine.', 3),
  ('industrie', 'Industrie musicale', 'Briefcase', 'Les bâtisseurs de l''ombre, producteurs, managers, beatmakers et lieux culturels incontournables.', 4),
  ('speciaux', 'Prix spéciaux', 'Trophy', 'Les distinctions suprêmes décernées aux figures emblématiques et coups de cœur du festival.', 5)
on conflict (id) do update set
  name = excluded.name,
  icon = excluded.icon,
  description = excluded.description,
  sort_order = excluded.sort_order;

insert into public.prizes (category_id, name, sort_order)
select c.id, p.name, p.sort_order
from (values
  ('musique', 'Artiste masculin de l''année', 1),
  ('musique', 'Artiste féminin de l''année', 2),
  ('musique', 'Artiste masculin Diaspora', 3),
  ('musique', 'Artiste féminin Diaspora', 4),
  ('musique', 'Tube des vacances', 5),
  ('musique', 'Meilleur clip vidéo de l''année', 6),
  ('musique', 'Meilleur groupe musical', 7),
  ('musique', 'Meilleure collaboration musicale', 8),
  ('musique', 'Artiste Gospel', 9),
  ('musique', 'Artiste tradi-moderne', 10),
  ('musique', 'Artiste variété urbaine', 11),
  ('musique', 'Étoile montante variété urbaine', 12),
  ('musique', 'Tube de l''année', 13),
  ('musique', 'Artiste Rap de l''année', 14),
  ('musique', 'Étoile montante Rap de l''année', 15),
  ('musique', 'Artiste Drill de l''année', 16),
  ('musique', 'Étoile montante Drill de l''année', 17),
  ('musique', 'Artiste Slam masculin', 18),
  ('musique', 'Artiste Slam féminin', 19),
  ('musique', 'Feat Urbain', 20),
  ('musique', 'Artiste Afrique de l''Ouest', 21),
  ('musique', 'Artiste Amapiano', 22),
  ('musique', 'Album de l''année', 23),
  ('musique', 'Artiste Lover', 24),
  ('danse', 'DJ Platine de l''année', 1),
  ('danse', 'Meilleur animateur événementiel', 2),
  ('danse', 'Chorégraphe', 3),
  ('danse', 'Groupe de danse féminin', 4),
  ('danse', 'Groupe de danse masculin', 5),
  ('danse', 'Meilleur acteur ou actrice', 6),
  ('danse', 'Meilleur web humoriste', 7),
  ('arts', 'Meilleur artiste peintre', 1),
  ('arts', 'Meilleur photographe', 2),
  ('arts', 'Meilleur réalisateur de clips', 3),
  ('arts', 'Styliste ou créateur de mode', 4),
  ('arts', 'Meilleur mannequin', 5),
  ('arts', 'Créateur de contenu digital', 6),
  ('arts', 'Meilleur réalisateur de films', 7),
  ('arts', 'Architecte de l''année', 8),
  ('arts', 'Dessinateur', 9),
  ('arts', 'Maison d''esthétique', 10),
  ('industrie', 'Label / Maison de production de l''année', 1),
  ('industrie', 'Meilleur beatmaker', 2),
  ('industrie', 'Meilleur manager d''artiste', 3),
  ('industrie', 'Promoteur / booker de l''année', 4),
  ('industrie', 'Promoteur / booker Diaspora', 5),
  ('industrie', 'Meilleur média culturel', 6),
  ('industrie', 'Présentateur Radio/TV', 7),
  ('industrie', 'Bar, Club, Maquis', 8),
  ('speciaux', 'Révélation de l''année', 1),
  ('speciaux', 'PRIMART d''Or, Grand Prix', 2),
  ('speciaux', 'Femme des Arts', 3)
) as p(category_id, name, sort_order)
join public.categories c on c.id = p.category_id
on conflict (category_id, name) do update set sort_order = excluded.sort_order;

insert into public.vote_packs (id, votes, price, currency, badge, popular, discount, sort_order)
values
  ('pack-1', 5, 500, 'XOF', null, false, null, 1),
  ('pack-2', 10, 900, 'XOF', 'Populaire', true, '-10%', 2),
  ('pack-3', 50, 4000, 'XOF', 'Forte valeur', false, '-20%', 3),
  ('pack-4', 100, 7500, 'XOF', 'Meilleur Prix', false, '-25%', 4)
on conflict (id) do update set
  votes = excluded.votes,
  price = excluded.price,
  currency = excluded.currency,
  badge = excluded.badge,
  popular = excluded.popular,
  discount = excluded.discount,
  sort_order = excluded.sort_order;

insert into public.event_settings (id, event_name, votes_open, ends_at)
values ('primart', 'PRIMART 2028', false, '2028-11-20T23:59:59Z')
on conflict (id) do nothing;

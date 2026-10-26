-- Add 'matching' ("frågor med samband") question type and right-hand match text on answers.

ALTER TABLE questions
  MODIFY COLUMN question_type ENUM('multiple_choice', 'yes_no', 'free_text', 'matching')
  NOT NULL DEFAULT 'multiple_choice';

ALTER TABLE answers
  ADD COLUMN match_text VARCHAR(500) NULL DEFAULT NULL;

SET @author = (SELECT id FROM users WHERE username = 'admin_magnus');

-- [Anatomi] matching, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES (
  (SELECT id FROM topics WHERE name = 'Anatomi'),
  @author,
  'matching',
  'Para ihop varje muskel med dess primära funktion:',
  1
);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, match_text, is_correct) VALUES
  (@q, 'Gluteus maximus', 'Höftextension (sträcker i höftleden)', TRUE),
  (@q, 'Biceps brachii', 'Armbågsflexion (böjer i armbågsleden)', TRUE),
  (@q, 'Quadriceps femoris', 'Knäextension (sträcker i knäleden)', TRUE),
  (@q, 'Pectoralis major', 'Horisontell adduktion i axelleden', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Kenhub - Muscles of the human body', 'https://www.kenhub.com/en/library/anatomy/muscles');

-- [Anatomi] matching, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES (
  (SELECT id FROM topics WHERE name = 'Anatomi'),
  @author,
  'matching',
  'Para ihop varje led med rätt ledtyp:',
  2
);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, match_text, is_correct) VALUES
  (@q, 'Höftleden (art. coxae)', 'Kulled', TRUE),
  (@q, 'Armbågsleden (art. humeroulnaris)', 'Gångjärnsled', TRUE),
  (@q, 'Tummens rotled (art. carpometacarpalis pollicis)', 'Sadelled', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Synovial joint', 'https://en.wikipedia.org/wiki/Synovial_joint');

-- [Träningslära] matching, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES (
  (SELECT id FROM topics WHERE name = 'Träningslära'),
  @author,
  'matching',
  'Para ihop basövningen med den muskelgrupp som arbetar primärt:',
  1
);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, match_text, is_correct) VALUES
  (@q, 'Bänkpress', 'Bröstmuskulaturen (pectoralis major)', TRUE),
  (@q, 'Chins / Pull-ups', 'Breda ryggmuskeln (latissimus dorsi)', TRUE),
  (@q, 'Knäböj (Squat)', 'Framsida lår och säte (quadriceps & gluteus)', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Compound exercise', 'https://en.wikipedia.org/wiki/Compound_exercise');

-- [Träningslära] matching, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES (
  (SELECT id FROM topics WHERE name = 'Träningslära'),
  @author,
  'matching',
  'Para ihop träningsprincipen med rätt beskrivning:',
  2
);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, match_text, is_correct) VALUES
  (@q, 'Specificitetsprincipen', 'Du blir bra på det du tränar', TRUE),
  (@q, 'Överbelastningsprincipen', 'Belastningen måste överstiga vad kroppen är van vid', TRUE),
  (@q, 'Reversibilitetsprincipen', 'Träningseffekter går tillbaka vid uppehåll', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Sports training', 'https://en.wikipedia.org/wiki/Sports_training');

-- [Fysiologi] matching, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES (
  (SELECT id FROM topics WHERE name = 'Fysiologi'),
  @author,
  'matching',
  'Para ihop energisystemet med dess huvudsakliga egenskap:',
  1
);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, match_text, is_correct) VALUES
  (@q, 'ATP-PCr (kreatinfosfatsystemet)', 'Maximalt arbete under cirka 1–10 sekunder utan syre', TRUE),
  (@q, 'Anaerob glykolys', 'Högintensivt arbete under cirka 15–120 sekunder där laktat bildas', TRUE),
  (@q, 'Aerob energiomsättning', 'Långvarigt arbete med tillgång till syre i mitokondrierna', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Bioenergetic systems', 'https://en.wikipedia.org/wiki/Bioenergetic_systems');

-- [Fysiologi] matching, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES (
  (SELECT id FROM topics WHERE name = 'Fysiologi'),
  @author,
  'matching',
  'Para ihop muskelfibertypen med dess karaktäristiska egenskaper:',
  3
);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, match_text, is_correct) VALUES
  (@q, 'Typ I (långsamma fibrer)', 'Hög uthållighet, rikligt med mitokondrier och kapillärer', TRUE),
  (@q, 'Typ IIa (snabba oxidativa-glykolytiska)', 'Mellantyp med både god kraftutveckling och måttlig uthållighet', TRUE),
  (@q, 'Typ IIx (snabba glykolytiska)', 'Mycket hög kontraktionshastighet och kraft men tröttas snabbt', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Skeletal muscle', 'https://en.wikipedia.org/wiki/Skeletal_muscle');

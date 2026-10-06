-- Expanded question library: 108 questions with answers and sources.
-- Generated from researched + verified question data. IDs are resolved via
-- LAST_INSERT_ID() and topic/user lookups, so no hardcoded question ids.

SET @author = (SELECT id FROM users WHERE username = 'admin_magnus');

-- [Anatomi] multiple_choice, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Vilket är människokroppens största och tjockaste ben?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Överarmsbenet (humerus)', FALSE),
  (@q, 'Lårbenet (femur)', TRUE),
  (@q, 'Skenbenet (tibia)', FALSE),
  (@q, 'Ryggraden', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Femur', 'https://en.wikipedia.org/wiki/Femur');

-- [Anatomi] multiple_choice, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Vilken är den tjockaste senan i människokroppen?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Patellasenan', FALSE),
  (@q, 'Tricepssenan', FALSE),
  (@q, 'Hamstringssenan', FALSE),
  (@q, 'Hälsenan (Achillessenan)', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Achilles tendon', 'https://en.wikipedia.org/wiki/Achilles_tendon');

-- [Anatomi] multiple_choice, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Ungefär hur många ben har ett nyfött barn, innan en del ben vuxit samman?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Cirka 270', TRUE),
  (@q, 'Cirka 206', FALSE),
  (@q, 'Cirka 150', FALSE),
  (@q, 'Cirka 400', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Human skeleton', 'https://en.wikipedia.org/wiki/Human_skeleton');

-- [Anatomi] multiple_choice, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Vilken typ av led är knäleden?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Kulled', FALSE),
  (@q, 'Sadelled', FALSE),
  (@q, 'Modifierad gångjärnsled', TRUE),
  (@q, 'Vridled', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Knee', 'https://en.wikipedia.org/wiki/Knee');

-- [Anatomi] multiple_choice, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Vilken rörelse vrider underarmen så att handflatan vetter uppåt?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Pronation', FALSE),
  (@q, 'Supination', TRUE),
  (@q, 'Cirkumduktion', FALSE),
  (@q, 'Abduktion', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Anatomical terms of motion', 'https://en.wikipedia.org/wiki/Anatomical_terms_of_motion');

-- [Anatomi] multiple_choice, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Vilken av följande muskler ingår INTE i rotatorkuffen?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Supraspinatus', FALSE),
  (@q, 'Infraspinatus', FALSE),
  (@q, 'Subscapularis', FALSE),
  (@q, 'Teres major', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Rotator cuff', 'https://en.wikipedia.org/wiki/Rotator_cuff');

-- [Anatomi] multiple_choice, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Vilket ligament hindrar skenbenet från att glida bakåt i förhållande till lårbenet?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Bakre korsbandet (PCL)', TRUE),
  (@q, 'Främre korsbandet (ACL)', FALSE),
  (@q, 'Mediala kollateralligamentet', FALSE),
  (@q, 'Patellaligamentet', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Knee', 'https://en.wikipedia.org/wiki/Knee');

-- [Anatomi] multiple_choice, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Vilken av ryggradens uträtande muskelsträngar (erector spinae) ligger mest lateralt?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Spinalis', FALSE),
  (@q, 'Longissimus', FALSE),
  (@q, 'Iliocostalis', TRUE),
  (@q, 'Multifidus', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Erector spinae muscles', 'https://en.wikipedia.org/wiki/Erector_spinae_muscles');

-- [Anatomi] multiple_choice, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Vilken nerv innerverar quadriceps femoris?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ischiasnerven (n. ischiadicus)', FALSE),
  (@q, 'Lårnerven (n. femoralis)', TRUE),
  (@q, 'Axillarisnerven', FALSE),
  (@q, 'Radialisnerven', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Quadriceps femoris muscle', 'https://en.wikipedia.org/wiki/Quadriceps_femoris_muscle');

-- [Anatomi] multiple_choice, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Var på lårbenet fäster iliopsoas?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Linea aspera', FALSE),
  (@q, 'Stora trokantern (trochanter major)', FALSE),
  (@q, 'Kondylerna vid knäet', FALSE),
  (@q, 'Lilla trokantern (trochanter minor)', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Iliopsoas', 'https://en.wikipedia.org/wiki/Iliopsoas');

-- [Anatomi] multiple_choice, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Vilka av ryggradens krökningar är kyfotiska och finns redan vid födseln?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Bröstryggens och korsbenets', TRUE),
  (@q, 'Halsryggens och ländryggens', FALSE),
  (@q, 'Halsryggens och bröstryggens', FALSE),
  (@q, 'Ländryggens och korsbenets', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Vertebral column', 'https://en.wikipedia.org/wiki/Vertebral_column');

-- [Anatomi] multiple_choice, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Hur stor andel av motståndet mot att skenbenet förskjuts framåt står främre korsbandet (ACL) för vid 30 och 90 graders knäflexion?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Cirka 50 %', FALSE),
  (@q, 'Cirka 65 %', FALSE),
  (@q, 'Cirka 85 %', TRUE),
  (@q, 'Cirka 100 %', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Anterior cruciate ligament', 'https://en.wikipedia.org/wiki/Anterior_cruciate_ligament');

-- [Anatomi] yes_no, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Innebär abduktion att en kroppsdel flyttas bort från kroppens mittlinje?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Anatomical terms of motion', 'https://en.wikipedia.org/wiki/Anatomical_terms_of_motion');

-- [Anatomi] yes_no, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Har en vuxen människa ungefär 300 ben i skelettet?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Human skeleton', 'https://en.wikipedia.org/wiki/Human_skeleton');

-- [Anatomi] yes_no, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Delar sagittalplanet kroppen i en framsida och en baksida?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Anatomical plane', 'https://en.wikipedia.org/wiki/Anatomical_plane');

-- [Anatomi] yes_no, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Har biceps brachii två huvuden?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Biceps', 'https://en.wikipedia.org/wiki/Biceps');

-- [Anatomi] yes_no, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Förändras muskelns längd under en isometrisk kontraktion?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Muscle contraction', 'https://en.wikipedia.org/wiki/Muscle_contraction');

-- [Anatomi] yes_no, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Är typ I-muskelfibrer uthålliga och tröttas långsamt ut tack vare högt innehåll av mitokondrier och kapillärer?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Skeletal muscle', 'https://en.wikipedia.org/wiki/Skeletal_muscle');

-- [Anatomi] yes_no, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Kan gastrocnemius (tvillingvadsmuskeln) även böja knäet, utöver att plantarflektera foten?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Gastrocnemius muscle', 'https://en.wikipedia.org/wiki/Gastrocnemius_muscle');

-- [Anatomi] yes_no, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Innerveras biceps brachii av nervus musculocutaneus?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Biceps', 'https://en.wikipedia.org/wiki/Biceps');

-- [Anatomi] yes_no, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Innerveras deltoideus av nervus radialis?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Deltoid muscle', 'https://en.wikipedia.org/wiki/Deltoid_muscle');

-- [Anatomi] yes_no, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Innehåller sarkomeren, muskelns grundläggande kontraktila enhet, tjocka myosinfilament och tunna aktinfilament?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Skeletal muscle', 'https://en.wikipedia.org/wiki/Skeletal_muscle');

-- [Anatomi] yes_no, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Har tricepsens långa huvud sitt ursprung på skulderbladet så att det även påverkar skulderleden?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Triceps', 'https://en.wikipedia.org/wiki/Triceps');

-- [Anatomi] yes_no, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Registrerar Golgis senorgan muskelns längd via Ia-afferenta nervfibrer?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Golgi tendon organ', 'https://en.wikipedia.org/wiki/Golgi_tendon_organ');

-- [Anatomi] free_text, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Vad kallas den muskel i buken som ger "sixpack" (latinskt namn)?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Rectus abdominis', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Rectus abdominis muscle', 'https://en.wikipedia.org/wiki/Rectus_abdominis_muscle');

-- [Anatomi] free_text, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Vad kallas rörelsen som ökar vinkeln mellan två kroppssegment, motsatsen till flexion?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Extension', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Anatomical terms of motion', 'https://en.wikipedia.org/wiki/Anatomical_terms_of_motion');

-- [Anatomi] free_text, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Hur många huvuden har quadriceps femoris? (svara med siffra)', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '4', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Quadriceps femoris muscle', 'https://en.wikipedia.org/wiki/Quadriceps_femoris_muscle');

-- [Anatomi] free_text, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Vad kallas muskelgruppen på lårets baksida som består av semimembranosus, semitendinosus och biceps femoris?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Hamstrings', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Hamstring', 'https://en.wikipedia.org/wiki/Hamstring');

-- [Anatomi] free_text, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Vilket ben fäster hälsenan (Achillessenan) vid?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Calcaneus', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Achilles tendon', 'https://en.wikipedia.org/wiki/Achilles_tendon');

-- [Anatomi] free_text, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Hur många ben består en vuxen människas skalle av (hörselbenen oräknade)?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '22', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Human skeleton', 'https://en.wikipedia.org/wiki/Human_skeleton');

-- [Anatomi] free_text, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Vilken är den minsta skelettmuskeln i människokroppen, belägen i mellanörat?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Stapedius', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Stapedius muscle', 'https://en.wikipedia.org/wiki/Stapedius_muscle');

-- [Anatomi] free_text, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'På vilken del av ulna fäster tricepssenan?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Olecranon', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Triceps', 'https://en.wikipedia.org/wiki/Triceps');

-- [Anatomi] free_text, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Vilken rotatorkuffsmuskel internroterar överarmsbenet?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Subscapularis', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Rotator cuff', 'https://en.wikipedia.org/wiki/Rotator_cuff');

-- [Anatomi] free_text, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Vilken nerv innerverar latissimus dorsi?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Nervus thoracodorsalis', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Latissimus dorsi muscle', 'https://en.wikipedia.org/wiki/Latissimus_dorsi_muscle');

-- [Anatomi] free_text, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Främre korsbandet (ACL) består av två knippen. Det ena kallas det anteromediala – vad kallas det andra? Svara med ett ord.', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Posterolaterala', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Anterior cruciate ligament', 'https://en.wikipedia.org/wiki/Anterior_cruciate_ligament');

-- [Anatomi] free_text, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Vilken nerv innerverar gluteus maximus?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Nervus gluteus inferior', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Gluteus maximus', 'https://en.wikipedia.org/wiki/Gluteus_maximus');

-- [Träningslära] multiple_choice, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Vad innebär progressiv överbelastning i styrketräning?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Att alltid träna med samma vikt tills man tröttnar', FALSE),
  (@q, 'Att gradvis öka belastningen på musklerna över tid', TRUE),
  (@q, 'Att träna så många pass som möjligt varje vecka', FALSE),
  (@q, 'Att byta övningar vid varje träningspass', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Progressive overload', 'https://en.wikipedia.org/wiki/Progressive_overload');

-- [Träningslära] multiple_choice, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Vilken typ av muskelsammandragning sker när du lyfter vikten i en bicepscurl, där muskeln förkortas medan den utvecklar kraft?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Koncentrisk', TRUE),
  (@q, 'Excentrisk', FALSE),
  (@q, 'Isometrisk', FALSE),
  (@q, 'Passiv', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Muscle contraction', 'https://en.wikipedia.org/wiki/Muscle_contraction');

-- [Träningslära] multiple_choice, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Vad kallas det när muskeln förlängs samtidigt som den utvecklar spänning, till exempel när du sänker en vikt?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Koncentrisk sammandragning', FALSE),
  (@q, 'Isometrisk sammandragning', FALSE),
  (@q, 'Excentrisk sammandragning', TRUE),
  (@q, 'Anaerob sammandragning', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Muscle contraction', 'https://en.wikipedia.org/wiki/Muscle_contraction');

-- [Träningslära] multiple_choice, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Vilket av följande är ett exempel på aerob träning (cardio)?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Löpning i jämn takt under 30 minuter', TRUE),
  (@q, 'Ett maxlyft på en repetition', FALSE),
  (@q, 'Tre tunga set om fem repetitioner', FALSE),
  (@q, 'En 10 sekunder lång maxspurt', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Aerobic exercise', 'https://en.wikipedia.org/wiki/Aerobic_exercise');

-- [Träningslära] multiple_choice, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'När känns träningsvärk (DOMS) som starkast efter ett träningspass?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '24–72 timmar efter träningen', TRUE),
  (@q, 'Direkt under träningen', FALSE),
  (@q, 'Inom 30 minuter efter träningen', FALSE),
  (@q, 'Först 7–10 dagar efter träningen', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Delayed onset muscle soreness', 'https://en.wikipedia.org/wiki/Delayed_onset_muscle_soreness');

-- [Träningslära] multiple_choice, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Vilken belastning och hur många repetitioner per set används typiskt vid maximal styrketräning?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Cirka 60–80 % av 1RM och 8–12 repetitioner', FALSE),
  (@q, 'Cirka 80–100 % av 1RM och 1–5 repetitioner', TRUE),
  (@q, 'Under 60 % av 1RM och 15 repetitioner eller fler', FALSE),
  (@q, 'Cirka 50 % av 1RM och 20–25 repetitioner', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Strength training', 'https://en.wikipedia.org/wiki/Strength_training');

-- [Träningslära] multiple_choice, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'I modellen för superkompensation, vilken fas följer direkt efter träningsfasen, då konditionen tillfälligt har sjunkit?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Superkompensation', FALSE),
  (@q, 'Utgångsläge', FALSE),
  (@q, 'Återhämtning', TRUE),
  (@q, 'Överträning', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Supercompensation', 'https://en.wikipedia.org/wiki/Supercompensation');

-- [Träningslära] multiple_choice, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Vilket vilopulsintervall anger American Heart Association som typiskt för friska vuxna?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '40–60 slag per minut', FALSE),
  (@q, '100–120 slag per minut', FALSE),
  (@q, '30–50 slag per minut', FALSE),
  (@q, '60–100 slag per minut', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Heart rate', 'https://en.wikipedia.org/wiki/Heart_rate');

-- [Träningslära] multiple_choice, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Vilket intervall har den ursprungliga Borg-skalan för upplevd ansträngning (RPE)?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '6–20', TRUE),
  (@q, '0–10', FALSE),
  (@q, '1–5', FALSE),
  (@q, '1–100', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Rating of perceived exertion', 'https://en.wikipedia.org/wiki/Rating_of_perceived_exertion');

-- [Träningslära] multiple_choice, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Vilken vila mellan seten rekommenderas vanligen vid tung styrketräning för tränade personer?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '20–60 sekunder', FALSE),
  (@q, '3–5 minuter', TRUE),
  (@q, 'Mindre än 10 sekunder', FALSE),
  (@q, 'Mer än 15 minuter', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Strength training', 'https://en.wikipedia.org/wiki/Strength_training');

-- [Träningslära] multiple_choice, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Vad tros enligt aktuell forskning främst förklara att muskler återfår sin styrka snabbare vid återträning efter ett uppehåll (muskelminne)?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Att muskelfibrerna delar sig och blir fler', FALSE),
  (@q, 'Epigenetiska förändringar, till exempel DNA-metylering', TRUE),
  (@q, 'Att senorna förkortas permanent', FALSE),
  (@q, 'Att mjölksyra lagras kvar i muskeln', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Muscle memory (strength training)', 'https://en.wikipedia.org/wiki/Muscle_memory_(strength_training)');

-- [Träningslära] multiple_choice, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Vad gäller för hur lång tid olika vävnader behöver för att anpassa sig till träning?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Senor anpassar sig snabbare än muskelvävnad', FALSE),
  (@q, 'Alla vävnader anpassar sig lika snabbt', FALSE),
  (@q, 'Skelettet anpassar sig på några dagar', FALSE),
  (@q, 'Senor och skelettvävnad behöver betydligt längre tid än muskelvävnad', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Supercompensation', 'https://en.wikipedia.org/wiki/Supercompensation');

-- [Träningslära] yes_no, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Kallas aerob träning ofta för cardio?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Aerobic exercise', 'https://en.wikipedia.org/wiki/Aerobic_exercise');

-- [Träningslära] yes_no, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Innebär en isometrisk muskelsammandragning att muskeln förkortas?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Muscle contraction', 'https://en.wikipedia.org/wiki/Muscle_contraction');

-- [Träningslära] yes_no, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Enligt WHO:s riktlinjer från 2020 räcker det för vuxna att göra muskelstärkande aktiviteter en gång i veckan?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'PMC - World Health Organization 2020 guidelines on physical activity and sedentary behaviour', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7719906/');

-- [Träningslära] yes_no, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Kan lång statisk stretching (över en minut) precis före en styrkeövning tillfälligt minska muskelkraften?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Warming up', 'https://en.wikipedia.org/wiki/Warming_up');

-- [Träningslära] yes_no, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Består Tabata-protokollet av 8 omgångar med 20 sekunders vila följt av 10 sekunders mycket intensiv träning?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - High-intensity interval training', 'https://en.wikipedia.org/wiki/High-intensity_interval_training');

-- [Träningslära] yes_no, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Kan muskler utveckla större kraft vid excentriska än vid koncentriska sammandragningar?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Muscle contraction', 'https://en.wikipedia.org/wiki/Muscle_contraction');

-- [Träningslära] yes_no, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Orsakar rent koncentriskt arbete, utan någon excentrisk fas, nämnvärd träningsvärk (DOMS)?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Delayed onset muscle soreness', 'https://en.wikipedia.org/wiki/Delayed_onset_muscle_soreness');

-- [Träningslära] yes_no, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Kan överträning uppstå om nästa träningspass läggs under återhämtningsfasen, innan kroppen nått superkompensation?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Supercompensation', 'https://en.wikipedia.org/wiki/Supercompensation');

-- [Träningslära] yes_no, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Går Borgs CR-10-skala för upplevd ansträngning från 6 till 20?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Rating of perceived exertion', 'https://en.wikipedia.org/wiki/Rating_of_perceived_exertion');

-- [Träningslära] yes_no, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Ger formlerna från Epley och Brzycki för uppskattat 1RM samma resultat när man gör 10 repetitioner?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - One-repetition maximum', 'https://en.wikipedia.org/wiki/One-repetition_maximum');

-- [Träningslära] yes_no, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Avtar skyddseffekten av ett tidigare excentriskt träningspass (repeated bout effect) så att den inte längre går att mäta efter ungefär ett år?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Delayed onset muscle soreness', 'https://en.wikipedia.org/wiki/Delayed_onset_muscle_soreness');

-- [Träningslära] yes_no, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Kan ett 1RM som uppskattats med submaximala formler avvika med 10 % eller mer från det verkliga 1RM?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - One-repetition maximum', 'https://en.wikipedia.org/wiki/One-repetition_maximum');

-- [Träningslära] free_text, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'Vad kallas den största vikt man kan lyfta vid en enda repetition? Svara med förkortningen.', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '1RM', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - One-repetition maximum', 'https://en.wikipedia.org/wiki/One-repetition_maximum');

-- [Träningslära] free_text, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'Enligt WHO bör vuxna göra minst hur många minuter måttligt ansträngande fysisk aktivitet per vecka? Svara med ett tal.', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '150', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'WHO - Physical activity fact sheet', 'https://www.who.int/news-room/fact-sheets/detail/physical-activity');

-- [Träningslära] free_text, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'Vilket år myntade Dr Kenneth H. Cooper termen aerobics? Svara med årtal.', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '1966', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Aerobic exercise', 'https://en.wikipedia.org/wiki/Aerobic_exercise');

-- [Träningslära] free_text, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'Vad kallas tillståndet när man överskrider kroppens förmåga att återhämta sig från hård träning, vilket leder till stagnerad eller sämre prestation?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Överträning', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Overtraining', 'https://en.wikipedia.org/wiki/Overtraining');

-- [Träningslära] free_text, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'WHO:s riktlinjer från 2020 anger 150–300 minuter måttlig eller hur många minuter som lägst ansträngande aerob aktivitet per vecka? Svara med ett tal.', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '75', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'PMC - World Health Organization 2020 guidelines on physical activity and sedentary behaviour', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7719906/');

-- [Träningslära] free_text, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'Vid den vanliga uppskattningen av maxpuls (maxpuls = tal minus ålder), vilket tal subtraherar man åldern från? Svara med ett tal.', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '220', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Heart rate', 'https://en.wikipedia.org/wiki/Heart_rate');

-- [Träningslära] free_text, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'VO2 max anger kroppens maximala upptag av vilket ämne under fysisk ansträngning? Svara med ett ord.', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Syre', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - VO2 max', 'https://en.wikipedia.org/wiki/VO2_max');

-- [Träningslära] free_text, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'Hur många essentiella aminosyror, som kroppen inte kan tillverka själv, behöver människan? Svara med ett tal.', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '9', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Protein (nutrient)', 'https://en.wikipedia.org/wiki/Protein_(nutrient)');

-- [Träningslära] free_text, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'Vad kallas det när man tränar mycket hårt under en kort period men prestationen återställs inom dagar eller veckor med tillräcklig vila – till skillnad från överträning? Svara med det engelska ordet.', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Overreaching', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Overtraining', 'https://en.wikipedia.org/wiki/Overtraining');

-- [Träningslära] free_text, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'Hur många gram protein per kilo kroppsvikt och dag är det amerikanska och kanadensiska rekommenderade dagliga intaget (RDA) för vuxna? Svara med ett tal med decimalkomma.', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '0,8', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Protein (nutrient)', 'https://en.wikipedia.org/wiki/Protein_(nutrient)');

-- [Träningslära] free_text, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'Dr Thomas utvecklade 1944 den moderna metoden för progressiv motståndsträning i rehabilitering. Vad är hans efternamn?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'DeLorme', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Progressive overload', 'https://en.wikipedia.org/wiki/Progressive_overload');

-- [Träningslära] free_text, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'Vid ungefär vilken blodlaktatnivå (mmol/L) ligger den första laktattröskeln (LT1, den aeroba tröskeln)? Svara med ett tal.', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '2', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Lactate threshold', 'https://en.wikipedia.org/wiki/Lactate_threshold');

-- [Fysiologi] multiple_choice, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Vad kallas ofta cellens "energivaluta"?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'DNA', FALSE),
  (@q, 'ATP', TRUE),
  (@q, 'Kreatin', FALSE),
  (@q, 'Glukagon', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Adenosine triphosphate', 'https://en.wikipedia.org/wiki/Adenosine_triphosphate');

-- [Fysiologi] multiple_choice, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Vilket järnhaltigt protein i de röda blodkropparna transporterar syre från lungorna till vävnaderna?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Kollagen', FALSE),
  (@q, 'Fibrinogen', FALSE),
  (@q, 'Hemoglobin', TRUE),
  (@q, 'Keratin', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Hemoglobin', 'https://en.wikipedia.org/wiki/Hemoglobin');

-- [Fysiologi] multiple_choice, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Minutvolym beräknas som hjärtfrekvens multiplicerat med vad?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Slagvolym', TRUE),
  (@q, 'Blodtryck', FALSE),
  (@q, 'Ejektionsfraktion', FALSE),
  (@q, 'Syreupptagning', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Cardiac output', 'https://en.wikipedia.org/wiki/Cardiac_output');

-- [Fysiologi] multiple_choice, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Ungefär hur stor är minutvolymen i vila hos en frisk person på 70 kg?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '1 liter per minut', FALSE),
  (@q, '10 liter per minut', FALSE),
  (@q, '20 liter per minut', FALSE),
  (@q, '5 liter per minut', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Cardiac output', 'https://en.wikipedia.org/wiki/Cardiac_output');

-- [Fysiologi] multiple_choice, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Vad är den huvudsakliga orsaken till träningsvärk (DOMS)?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Uppbyggnad av mjölksyra i musklerna', FALSE),
  (@q, 'Excentriska muskelarbeten och mikroskopiska muskelskador', TRUE),
  (@q, 'Brist på ATP i musklerna', FALSE),
  (@q, 'Uttorkning av muskelcellerna', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Delayed onset muscle soreness', 'https://en.wikipedia.org/wiki/Delayed_onset_muscle_soreness');

-- [Fysiologi] multiple_choice, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Vilken är ungefär den respiratoriska kvoten (CO2 producerad dividerad med O2 förbrukad) vid ren fettförbränning?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '1,0', FALSE),
  (@q, '1,3', FALSE),
  (@q, '0,7', TRUE),
  (@q, '0,5', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Respiratory quotient', 'https://en.wikipedia.org/wiki/Respiratory_quotient');

-- [Fysiologi] multiple_choice, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Vad är satellitceller i skelettmuskulatur?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Nervceller som styr muskelfibrerna', FALSE),
  (@q, 'Fettceller mellan muskelfibrerna', FALSE),
  (@q, 'Blodkärlsceller som ger muskeln syre', FALSE),
  (@q, 'Muskelstamceller som ger extra cellkärnor vid tillväxt och reparation', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Skeletal muscle', 'https://en.wikipedia.org/wiki/Skeletal_muscle');

-- [Fysiologi] multiple_choice, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Vilket protein binder Ca2+ som frisätts från sarkoplasmatiska retiklet, så att myosinbindningsställena på aktin friläggs?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Troponin C', TRUE),
  (@q, 'Tropomyosin', FALSE),
  (@q, 'Myoglobin', FALSE),
  (@q, 'Kreatinkinas', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Muscle contraction', 'https://en.wikipedia.org/wiki/Muscle_contraction');

-- [Fysiologi] multiple_choice, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Vad kallas processen där levern omvandlar laktat från arbetande muskler tillbaka till glukos?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Citronsyracykeln', FALSE),
  (@q, 'Cori-cykeln', TRUE),
  (@q, 'Kreatinfosfatsystemet', FALSE),
  (@q, 'Pentosfosfatvägen', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Cori cycle', 'https://en.wikipedia.org/wiki/Cori_cycle');

-- [Fysiologi] multiple_choice, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Hemoglobin binder kolmonoxid med ungefär hur mycket större affinitet än det binder syre?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ungefär 2 gånger', FALSE),
  (@q, 'Ungefär 25 gånger', FALSE),
  (@q, 'Ungefär 250 gånger', TRUE),
  (@q, 'Ungefär 2 500 gånger', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Hemoglobin', 'https://en.wikipedia.org/wiki/Hemoglobin');

-- [Fysiologi] multiple_choice, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Vad kännetecknar sarkoplasmatisk hypertrofi?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ökat antal aktin- och myosinproteiner', FALSE),
  (@q, 'Fler muskelfibrer genom delning av befintliga fibrer', FALSE),
  (@q, 'Ökad mängd bindväv i muskeln', FALSE),
  (@q, 'Ökad volym sarkoplasmatisk vätska', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Muscle hypertrophy', 'https://en.wikipedia.org/wiki/Muscle_hypertrophy');

-- [Fysiologi] multiple_choice, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Vilket intervall är normalt för ejektionsfraktionen (slagvolym dividerad med slutdiastolisk volym)?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ungefär 55–70 %', TRUE),
  (@q, 'Ungefär 35–45 %', FALSE),
  (@q, 'Ungefär 80–90 %', FALSE),
  (@q, 'Ungefär 20–30 %', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Stroke volume', 'https://en.wikipedia.org/wiki/Stroke_volume');

-- [Fysiologi] yes_no, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Kyls kroppen när svett avdunstar från hudytan?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Perspiration', 'https://en.wikipedia.org/wiki/Perspiration');

-- [Fysiologi] yes_no, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Höjer hormonet insulin blodsockret?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Insulin', 'https://en.wikipedia.org/wiki/Insulin');

-- [Fysiologi] yes_no, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Produceras testosteron hos män huvudsakligen av Leydigcellerna i testiklarna?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Testosterone', 'https://en.wikipedia.org/wiki/Testosterone');

-- [Fysiologi] yes_no, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Är typ II-muskelfibrer långsamma och beroende av aerob ämnesomsättning?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Skeletal muscle', 'https://en.wikipedia.org/wiki/Skeletal_muscle');

-- [Fysiologi] yes_no, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Hämmar djup sömn utsöndringen av tillväxthormon?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Growth hormone', 'https://en.wikipedia.org/wiki/Growth_hormone');

-- [Fysiologi] yes_no, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Lagrar skelettmusklerna hos en vuxen på 70 kg mer glykogen totalt än levern?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Glycogen', 'https://en.wikipedia.org/wiki/Glycogen');

-- [Fysiologi] yes_no, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Har myoglobin lägre syreaffinitet än hemoglobin?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Myoglobin', 'https://en.wikipedia.org/wiki/Myoglobin');

-- [Fysiologi] yes_no, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Kan muskelglykogen direkt bidra till att höja blodsockret?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Glycogen', 'https://en.wikipedia.org/wiki/Glycogen');

-- [Fysiologi] yes_no, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Rekryteras enligt Hennemans storleksprincip små motoriska enheter (långsamma fibrer) före stora (snabba fibrer)?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Motor unit recruitment', 'https://en.wikipedia.org/wiki/Motor_unit_recruitment');

-- [Fysiologi] yes_no, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Ökar natriumkoncentrationen i svetten vid värmeanpassning (acklimatisering)?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Perspiration', 'https://en.wikipedia.org/wiki/Perspiration');

-- [Fysiologi] yes_no, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Beror de flesta tidiga styrkeökningar vid styrketräning främst på neurala anpassningar?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Muscle hypertrophy', 'https://en.wikipedia.org/wiki/Muscle_hypertrophy');

-- [Fysiologi] yes_no, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Är syreupptagningen (VO2) enligt Ficks princip lika med minutvolym multiplicerat med arteriovenös syredifferens?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - VO2 max', 'https://en.wikipedia.org/wiki/VO2_max');

-- [Fysiologi] free_text, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Vilken är normal kroppstemperatur hos människan i grader Celsius (ett tal)?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '37', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Thermoregulation', 'https://en.wikipedia.org/wiki/Thermoregulation');

-- [Fysiologi] free_text, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Vad heter hormonet epinefrin i vardagligt språk, centralt för "kamp eller flykt"-reaktionen?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Adrenalin', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Epinephrine (medication)/Adrenaline', 'https://en.wikipedia.org/wiki/Epinephrine');

-- [Fysiologi] free_text, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Vilket stresshormon produceras i binjurebarken (och kallas ofta "stresshormonet")?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Kortisol', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Cortisol', 'https://en.wikipedia.org/wiki/Cortisol');

-- [Fysiologi] free_text, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Vad heter den process i mitokondrierna där huvuddelen av cellens ATP bildas med hjälp av syre (två ord)?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Oxidativ fosforylering', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Mitochondrion', 'https://en.wikipedia.org/wiki/Mitochondrion');

-- [Fysiologi] free_text, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Vilket år isolerades insulin första gången av Banting och Best?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '1921', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Insulin', 'https://en.wikipedia.org/wiki/Insulin');

-- [Fysiologi] free_text, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Enligt Tanakas formel är maxpulsen 208 minus 0,7 gånger åldern. Vilken maxpuls ger det för en 40-åring?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '180', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Heart rate', 'https://en.wikipedia.org/wiki/Heart_rate');

-- [Fysiologi] free_text, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Vad kallas en motorisk nervcell tillsammans med alla muskelfibrer den styr?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Motorisk enhet', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Skeletal muscle', 'https://en.wikipedia.org/wiki/Skeletal_muscle');

-- [Fysiologi] free_text, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Hur många ATP ger glykolysen netto per glukosmolekyl?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '2', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Glycolysis', 'https://en.wikipedia.org/wiki/Glycolysis');

-- [Fysiologi] free_text, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Enligt Karvonens metod: vilken målpuls (slag per minut) motsvarar 70 % intensitet för någon med maxpuls 190 och vilopuls 60?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '151', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Heart rate', 'https://en.wikipedia.org/wiki/Heart_rate');

-- [Fysiologi] free_text, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Vid ungefär vilken blodlaktatnivå (i mmol/L) approximeras vanligen onset of blood lactate accumulation (OBLA)?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '4', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Lactate threshold', 'https://en.wikipedia.org/wiki/Lactate_threshold');

-- [Fysiologi] free_text, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Vilket protein var det första vars tredimensionella struktur löstes med röntgenkristallografi (John Kendrew, 1958)?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Myoglobin', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Myoglobin', 'https://en.wikipedia.org/wiki/Myoglobin');

-- [Fysiologi] free_text, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Hur många milliliter syre binder ungefär ett gram hemoglobin (svara med ett tal med decimalkomma)?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '1,34', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Hemoglobin', 'https://en.wikipedia.org/wiki/Hemoglobin');

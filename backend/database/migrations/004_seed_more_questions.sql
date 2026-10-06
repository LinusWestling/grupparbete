-- Expanded question library: 204 questions with answers and sources.
-- Generated from researched + verified question data. IDs are resolved via
-- LAST_INSERT_ID() and topic/user lookups, so no hardcoded question ids.

SET @author = (SELECT id FROM users WHERE username = 'admin_magnus');

-- [Anatomi] multiple_choice, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Hur många kotor har halsryggen (den cervikala delen av ryggraden)?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '5', FALSE),
  (@q, '7', TRUE),
  (@q, '9', FALSE),
  (@q, '12', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Vertebral column', 'https://en.wikipedia.org/wiki/Vertebral_column');

-- [Anatomi] multiple_choice, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Vilken muskel är ryggens bredaste?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Trapezius', FALSE),
  (@q, 'Rhomboideus', FALSE),
  (@q, 'Latissimus dorsi', TRUE),
  (@q, 'Erector spinae', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Latissimus dorsi muscle', 'https://en.wikipedia.org/wiki/Latissimus_dorsi_muscle');

-- [Anatomi] multiple_choice, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Hur många handrotsben (carpalben) har handleden?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '6', FALSE),
  (@q, '7', FALSE),
  (@q, '10', FALSE),
  (@q, '8', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Carpal bones', 'https://en.wikipedia.org/wiki/Carpal_bones');

-- [Anatomi] multiple_choice, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Vad kallas greppet vid en chins (chin-up), till skillnad från ett vanligt pull-up med överhandsgrepp?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Underhandsgrepp (supinerat)', TRUE),
  (@q, 'Neutralt grepp', FALSE),
  (@q, 'Blandat grepp', FALSE),
  (@q, 'Krokgrepp', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Pull-up (exercise)', 'https://en.wikipedia.org/wiki/Pull-up_(exercise)');

-- [Anatomi] multiple_choice, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Vilken nerv står för diafragmans motoriska innervation?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Vagusnerven', FALSE),
  (@q, 'Frenikusnerven (n. phrenicus)', TRUE),
  (@q, 'Långa bröstnerven', FALSE),
  (@q, 'Interkostalnerven', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Thoracic diaphragm', 'https://en.wikipedia.org/wiki/Thoracic_diaphragm');

-- [Anatomi] multiple_choice, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Vilken nerv innerverar serratus anterior?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Nervus thoracicus longus', TRUE),
  (@q, 'Nervus axillaris', FALSE),
  (@q, 'Nervus suprascapularis', FALSE),
  (@q, 'Nervus accessorius', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Serratus anterior muscle', 'https://en.wikipedia.org/wiki/Serratus_anterior_muscle');

-- [Anatomi] multiple_choice, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Vilken rörelse av skulderbladet utför de mellersta fibrerna i trapezius?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Höjning (elevation)', FALSE),
  (@q, 'Sänkning (depression)', FALSE),
  (@q, 'Retraktion (drar skulderbladet mot ryggraden)', TRUE),
  (@q, 'Protraktion', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Trapezius', 'https://en.wikipedia.org/wiki/Trapezius');

-- [Anatomi] multiple_choice, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'På vilket utskott på skulderbladet fäster pectoralis minor?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Acromion', FALSE),
  (@q, 'Processus coracoideus', TRUE),
  (@q, 'Spina scapulae', FALSE),
  (@q, 'Cavitas glenoidalis', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Pectoralis minor', 'https://en.wikipedia.org/wiki/Pectoralis_minor');

-- [Anatomi] multiple_choice, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Vilken av de platta bukmusklerna ligger innerst, djupt under m. obliquus internus?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Rectus abdominis', FALSE),
  (@q, 'Obliquus externus', FALSE),
  (@q, 'Transversus abdominis', TRUE),
  (@q, 'Pyramidalis', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Transversus abdominis muscle', 'https://en.wikipedia.org/wiki/Transversus_abdominis_muscle');

-- [Anatomi] multiple_choice, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Vilka muskler höjer revbenen vid inandning?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Yttre interkostalmuskler', TRUE),
  (@q, 'Inre interkostalmuskler', FALSE),
  (@q, 'Rectus abdominis', FALSE),
  (@q, 'Obliquus internus', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Intercostal muscle', 'https://en.wikipedia.org/wiki/Intercostal_muscle');

-- [Anatomi] free_text, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Vilken höftmuskel stabiliserar bäckenet i frontalplanet så att det inte sjunker åt motsatt sida när du står på ett ben? (latinskt namn, två ord)', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Gluteus medius', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Gluteus medius', 'https://en.wikipedia.org/wiki/Gluteus_medius');

-- [Anatomi] multiple_choice, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Vilken del av deltoideus hjälper till vid flexion av axeln, till exempel i ett frontlyft?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Främre fibrerna', TRUE),
  (@q, 'Bakre fibrerna', FALSE),
  (@q, 'Mellersta fibrerna', FALSE),
  (@q, 'Alla tre delarna lika mycket', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Deltoid muscle', 'https://en.wikipedia.org/wiki/Deltoid_muscle');

-- [Anatomi] yes_no, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Är axelleden (skulderleden) kroppens mest rörliga led?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Shoulder joint', 'https://en.wikipedia.org/wiki/Shoulder_joint');

-- [Anatomi] yes_no, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Har en människa vanligtvis 10 par revben?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Rib cage', 'https://en.wikipedia.org/wiki/Rib_cage');

-- [Anatomi] yes_no, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Passerar rectus femoris både höftleden och knäleden?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Quadriceps femoris muscle', 'https://en.wikipedia.org/wiki/Quadriceps_femoris_muscle');

-- [Anatomi] yes_no, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Fäster de flytande revbenen (par 11 och 12) enbart i kotorna och inte i bröstbenet?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Rib cage', 'https://en.wikipedia.org/wiki/Rib_cage');

-- [Anatomi] yes_no, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Är scaphoideum (båtbenet) det handrotsben som oftast bryts?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Scaphoid bone', 'https://en.wikipedia.org/wiki/Scaphoid_bone');

-- [Anatomi] yes_no, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Har ländkotorna tvärutskottshål (foramen transversarium) som halskotorna?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Lumbar vertebrae', 'https://en.wikipedia.org/wiki/Lumbar_vertebrae');

-- [Anatomi] yes_no, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Deltar m. brachialis i underarmens rotation?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Brachialis muscle', 'https://en.wikipedia.org/wiki/Brachialis_muscle');

-- [Anatomi] yes_no, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Bildar aponeurosen från m. obliquus externus abdominis ljumskbandet (lig. inguinale)?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Abdominal external oblique muscle', 'https://en.wikipedia.org/wiki/Abdominal_external_oblique_muscle');

-- [Anatomi] yes_no, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Ligger skulderbladet över revbenen 2–7 på den bakre sidan av bröstkorgen?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Kenhub - Scapula', 'https://www.kenhub.com/en/library/anatomy/scapula');

-- [Anatomi] yes_no, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Fäster latissimus dorsi i botten av den intertuberkulära fåran på överarmsbenet?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Latissimus dorsi muscle', 'https://en.wikipedia.org/wiki/Latissimus_dorsi_muscle');

-- [Anatomi] yes_no, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Roterar höger obliquus internus tillsammans med vänster obliquus externus vänster axel mot höger höft?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Abdominal internal oblique muscle', 'https://en.wikipedia.org/wiki/Abdominal_internal_oblique_muscle');

-- [Anatomi] free_text, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Hur många kotor har en normal mänsklig ryggrad totalt? (svara med siffra)', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '33', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Vertebral column', 'https://en.wikipedia.org/wiki/Vertebral_column');

-- [Anatomi] free_text, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Vilken grekisk bokstav har deltamuskeln (deltoideus) fått sitt namn efter?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Delta', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Deltoid muscle', 'https://en.wikipedia.org/wiki/Deltoid_muscle');

-- [Anatomi] free_text, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Vad kallas den andra halskotan (C2)? (latinskt namn, ett ord)', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Axis', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Vertebral column', 'https://en.wikipedia.org/wiki/Vertebral_column');

-- [Anatomi] free_text, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Vilken stor bröstmuskel arbetar primärt vid bänkpress? (latinskt namn, två ord)', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Pectoralis major', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Bench press', 'https://en.wikipedia.org/wiki/Bench_press');

-- [Anatomi] free_text, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Hur många revbenspar räknas som äkta revben, som fäster direkt i bröstbenet? (svara med siffra)', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '7', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Rib cage', 'https://en.wikipedia.org/wiki/Rib_cage');

-- [Anatomi] free_text, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Vilken muskel kallas ibland "boxarens muskel" eftersom den för skulderbladet framåt vid ett slag? (latinskt namn, två ord)', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Serratus anterior', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Serratus anterior muscle', 'https://en.wikipedia.org/wiki/Serratus_anterior_muscle');

-- [Anatomi] free_text, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Vad kallas nervrötterna som löper i ryggmärgskanalen nedanför ryggmärgens slut vid L1/L2? (latinskt namn, två ord)', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Cauda equina', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Vertebral column', 'https://en.wikipedia.org/wiki/Vertebral_column');

-- [Anatomi] free_text, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Vid vilket revben fäster quadratus lumborum, tillsammans med de fyra övre ländkotornas tvärutskott? (svara med siffra)', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '12', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Quadratus lumborum muscle', 'https://en.wikipedia.org/wiki/Quadratus_lumborum_muscle');

-- [Anatomi] multiple_choice, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Från vilka revben utgår m. obliquus externus abdominis?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Revben 1–4', FALSE),
  (@q, 'Revben 5–12', TRUE),
  (@q, 'Revben 3–5', FALSE),
  (@q, 'Revben 7–10', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Abdominal external oblique muscle', 'https://en.wikipedia.org/wiki/Abdominal_external_oblique_muscle');

-- [Anatomi] free_text, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Vilken vadmuskel ligger djupt under gastrocnemius? (latinskt namn, ett ord)', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Soleus', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Soleus muscle', 'https://en.wikipedia.org/wiki/Soleus_muscle');

-- [Anatomi] free_text, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Efter ungefär hur många graders abduktion tar deltoideus över som huvudsaklig abduktor av armen, efter att supraspinatus initierat rörelsen? (svara med siffra)', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '15', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Supraspinatus muscle', 'https://en.wikipedia.org/wiki/Supraspinatus_muscle');

-- [Anatomi] multiple_choice, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Vilka tre ben växer samman och bildar höftbenet?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Tarmbenet, korsbenet och svansbenet', FALSE),
  (@q, 'Tarmbenet, sittbenet och blygdbenet', TRUE),
  (@q, 'Sittbenet, blygdbenet och lårbenet', FALSE),
  (@q, 'Korsbenet, sittbenet och blygdbenet', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Hip bone', 'https://en.wikipedia.org/wiki/Hip_bone');

-- [Anatomi] multiple_choice, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Vilken är den längsta muskeln i människokroppen?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Rectus femoris', FALSE),
  (@q, 'Gracilis', FALSE),
  (@q, 'Sartorius (skräddarmuskeln)', TRUE),
  (@q, 'Biceps femoris', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Sartorius muscle', 'https://en.wikipedia.org/wiki/Sartorius_muscle');

-- [Anatomi] multiple_choice, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Vilken typ av brosk finns i knäledens menisker?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Fibrobrosk', TRUE),
  (@q, 'Elastiskt brosk', FALSE),
  (@q, 'Hyalint brosk', FALSE),
  (@q, 'Benbrosk', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Cartilage', 'https://en.wikipedia.org/wiki/Cartilage');

-- [Anatomi] multiple_choice, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Vilka två nerver delar ischiasnerven upp sig i vid knävecket (fossa poplitea)?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Lårnerven och sätesnerven', FALSE),
  (@q, 'Skenbensnerven och lårnerven', FALSE),
  (@q, 'Täcknerven (n. obturatorius) och skenbensnerven', FALSE),
  (@q, 'Skenbensnerven (n. tibialis) och gemensamma vadbensnerven (n. fibularis communis)', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Sciatic nerve', 'https://en.wikipedia.org/wiki/Sciatic_nerve');

-- [Anatomi] multiple_choice, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Vilken typ av led är höftleden?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Kulled', TRUE),
  (@q, 'Gångjärnsled', FALSE),
  (@q, 'Sadelled', FALSE),
  (@q, 'Planled', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Hip joint', 'https://en.wikipedia.org/wiki/Hip_joint');

-- [Anatomi] free_text, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Tibialis anterior fäster vid första mellanfotsbenets bas och vid vilket ben i fotroten? (svenskt namn, bestämd form)', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Mediala kilbenet', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Tibialis anterior muscle', 'https://en.wikipedia.org/wiki/Tibialis_anterior_muscle');

-- [Anatomi] multiple_choice, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Var på skenbenet fäster tractus iliotibialis (IT-bandet)?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Gerdys tuberkel på laterala kondylen', TRUE),
  (@q, 'Fibulahuvudet', FALSE),
  (@q, 'Tuberositas tibiae', FALSE),
  (@q, 'Mediala kondylen', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Iliotibial tract', 'https://en.wikipedia.org/wiki/Iliotibial_tract');

-- [Anatomi] multiple_choice, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Vilken rörelse i underarmen är biceps brachii mycket effektiv för, utöver armbågsböjning?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Supination', TRUE),
  (@q, 'Pronation', FALSE),
  (@q, 'Extension', FALSE),
  (@q, 'Abduktion', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Biceps', 'https://en.wikipedia.org/wiki/Biceps');

-- [Anatomi] multiple_choice, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Piriformis externroterar vanligen höften. Vilken rörelse bidrar den med i stället när höften är böjd minst 90 grader?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Extension', FALSE),
  (@q, 'Adduktion', FALSE),
  (@q, 'Internrotation', TRUE),
  (@q, 'Hyperextension', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Piriformis muscle', 'https://en.wikipedia.org/wiki/Piriformis_muscle');

-- [Anatomi] multiple_choice, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Vilket av följande ben ingår i det laterala längsgående fotvalvet?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Båtbenet (os naviculare)', FALSE),
  (@q, 'Kuboidbenet (os cuboideum)', TRUE),
  (@q, 'Mediala kilbenet (os cuneiforme mediale)', FALSE),
  (@q, 'Första mellanfotsbenet', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Arches of the foot', 'https://en.wikipedia.org/wiki/Arches_of_the_foot');

-- [Anatomi] multiple_choice, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Vilket av följande stämmer för hamstringsdelen av adductor magnus?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Sträcker höften och fäster vid adduktortuberkeln (tuberculum adductorium)', TRUE),
  (@q, 'Böjer höften och fäster vid linea aspera', FALSE),
  (@q, 'Abducerar höften och fäster vid trochanter major', FALSE),
  (@q, 'Sträcker knäet och fäster vid tuberositas tibiae', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Adductor magnus muscle', 'https://en.wikipedia.org/wiki/Adductor_magnus_muscle');

-- [Anatomi] multiple_choice, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'multiple_choice', 'Vilken av följande muskler har störst andel långsamma (typ I) muskelfibrer hos människan?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Soleus', TRUE),
  (@q, 'Gastrocnemius', FALSE),
  (@q, 'Rectus femoris', FALSE),
  (@q, 'Triceps brachii', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Soleus muscle', 'https://en.wikipedia.org/wiki/Soleus_muscle');

-- [Anatomi] yes_no, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Förbinder ligament muskler med skelettet?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Ligament', 'https://en.wikipedia.org/wiki/Ligament');

-- [Anatomi] yes_no, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Saknar brosk både blodkärl och nerver?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Cartilage', 'https://en.wikipedia.org/wiki/Cartilage');

-- [Anatomi] yes_no, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Är knäskålen (patella) människokroppens största sesamben?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Patella', 'https://en.wikipedia.org/wiki/Patella');

-- [Anatomi] yes_no, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Är hälbenet (calcaneus) det största benet i fotroten?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Tarsus (skeleton)', 'https://en.wikipedia.org/wiki/Tarsal_bones');

-- [Anatomi] yes_no, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Innerveras både gluteus medius och tensor fasciae latae av övre sätesnerven (n. gluteus superior)?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Gluteus medius', 'https://en.wikipedia.org/wiki/Gluteus_medius');

-- [Anatomi] yes_no, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Är det laterala kollateralligamentet i knät (lig. collaterale fibulare) fastvuxet i den laterala menisken?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Fibular collateral ligament', 'https://en.wikipedia.org/wiki/Fibular_collateral_ligament');

-- [Anatomi] yes_no, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Är båda kollateralligamenten i knät slappa när knäet är sträckt?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Fibular collateral ligament', 'https://en.wikipedia.org/wiki/Fibular_collateral_ligament');

-- [Anatomi] yes_no, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Går ischiasnerven hos vissa personer rakt igenom piriformismuskeln i stället för under den?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Piriformis muscle', 'https://en.wikipedia.org/wiki/Piriformis_muscle');

-- [Anatomi] yes_no, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Passerar gastrocnemius över tre leder: knäleden, fotleden och subtalarleden?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Gastrocnemius muscle', 'https://en.wikipedia.org/wiki/Gastrocnemius_muscle');

-- [Anatomi] yes_no, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Är blygdbenet (pubis) den del av höftbenet som bidrar mest till ledskålen (acetabulum)?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Hip bone', 'https://en.wikipedia.org/wiki/Hip_bone');

-- [Anatomi] yes_no, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'yes_no', 'Sluter sig tillväxtplattorna vanligen vid lägre ålder hos flickor än hos pojkar?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Epiphyseal plate', 'https://en.wikipedia.org/wiki/Epiphyseal_plate');

-- [Anatomi] free_text, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Vad heter människokroppens längsta och tjockaste nerv? (svenskt namn, bestämd form)', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ischiasnerven', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Sciatic nerve', 'https://en.wikipedia.org/wiki/Sciatic_nerve');

-- [Anatomi] free_text, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Hur många ben ingår i fotroten (tarsus) på varje fot? (svara med siffra)', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '7', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Tarsus (skeleton)', 'https://en.wikipedia.org/wiki/Tarsal_bones');

-- [Anatomi] free_text, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Vad kallas de stora flerkärniga cellerna som bryter ner benvävnad? (ett ord, flertal)', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Osteoklaster', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Bone', 'https://en.wikipedia.org/wiki/Bone');

-- [Anatomi] free_text, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Senor består främst av kollagen av vilken typ? (svara med arabisk siffra)', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '1', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Tendon', 'https://en.wikipedia.org/wiki/Tendon');

-- [Anatomi] free_text, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Hyalint brosk består huvudsakligen av kollagen av vilken typ? (svara med arabisk siffra)', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '2', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Hyaline cartilage', 'https://en.wikipedia.org/wiki/Hyaline_cartilage');

-- [Anatomi] free_text, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Vad kallas fästet på skenbenets insida där sartorius, gracilis och semitendinosus senor möts? (latinskt namn, två ord)', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Pes anserinus', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Sartorius muscle', 'https://en.wikipedia.org/wiki/Sartorius_muscle');

-- [Anatomi] free_text, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Vilket ben i fotroten avgör höjden på fotvalvet? (svenskt namn, bestämd form)', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Båtbenet', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Arches of the foot', 'https://en.wikipedia.org/wiki/Arches_of_the_foot');

-- [Anatomi] free_text, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Vad kallas den mekanism som spänner plantarfascian när tårna dorsalflekteras? (engelskt ord, ett ord)', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Windlass', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Plantar fascia', 'https://en.wikipedia.org/wiki/Plantar_fascia');

-- [Anatomi] free_text, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Vilken muskel är huvudsaklig armbågsextensor och arbetar bland annat i armhävningar? (latinskt namn, två ord)', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Triceps brachii', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Triceps', 'https://en.wikipedia.org/wiki/Triceps');

-- [Anatomi] free_text, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Vad heter det dominerande mineralet i ben? (ett ord)', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Hydroxyapatit', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Bone', 'https://en.wikipedia.org/wiki/Bone');

-- [Anatomi] free_text, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Anatomi'), @author, 'free_text', 'Vilka fibrer förankrar senor i benvävnaden? (efter anatomen, två ord)', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Sharpeys fibrer', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Tendon', 'https://en.wikipedia.org/wiki/Tendon');

-- [Träningslära] multiple_choice, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Vilka tre lyft ingår i styrkelyft?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ryck, stöt och marklyft', FALSE),
  (@q, 'Knäböj, bänkpress och marklyft', TRUE),
  (@q, 'Knäböj, axelpress och ryck', FALSE),
  (@q, 'Bänkpress, marklyft och militärpress', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Powerlifting', 'https://en.wikipedia.org/wiki/Powerlifting');

-- [Träningslära] multiple_choice, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Vilken av följande är en typisk kroppsviktsövning inom calisthenics?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Marklyft med skivstång', FALSE),
  (@q, 'Hantelcurl', FALSE),
  (@q, 'Armhävningar', TRUE),
  (@q, 'Benpress i maskin', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Calisthenics', 'https://en.wikipedia.org/wiki/Bodyweight_exercise');

-- [Träningslära] multiple_choice, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Vad kännetecknar en sammansatt (multiled) styrkeövning som knäböj, jämfört med en isoleringsövning?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Den belastar flera leder och muskelgrupper samtidigt', TRUE),
  (@q, 'Den belastar bara en enda led och en enda muskel', FALSE),
  (@q, 'Den görs alltid utan någon vikt', FALSE),
  (@q, 'Den tränar bara hjärtat och inte musklerna', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Strength training', 'https://en.wikipedia.org/wiki/Strength_training');

-- [Träningslära] multiple_choice, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Vilka muskler är huvudsakligen involverade i bänkpress?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Pectoralis major, främre deltoideus och triceps brachii', TRUE),
  (@q, 'Latissimus dorsi, biceps brachii och bakre deltoideus', FALSE),
  (@q, 'Trapezius, rhomboideus och biceps brachii', FALSE),
  (@q, 'Rectus abdominis, obliquer och quadriceps', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Bench press', 'https://en.wikipedia.org/wiki/Bench_press');

-- [Träningslära] multiple_choice, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Varför använder styrkelyftare ofta Valsalvamanövern vid tunga knäböj, bänkpress och marklyft?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'För att stabilisera bålen under lyftet', TRUE),
  (@q, 'För att sänka blodtrycket under lyftet', FALSE),
  (@q, 'För att värma upp musklerna innan lyftet', FALSE),
  (@q, 'För att slippa använda greppet', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Valsalva maneuver', 'https://en.wikipedia.org/wiki/Valsalva_maneuver');

-- [Träningslära] multiple_choice, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Hur bör man landa vid plyometriska hopp för att dämpa belastningen?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Med lätt böjda höft-, knä- och fotleder', TRUE),
  (@q, 'Med helt raka och låsta knän', FALSE),
  (@q, 'Med ett så stelt och rakt ben som möjligt', FALSE),
  (@q, 'Med hälarna först och utan att böja knäna', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Plyometrics', 'https://en.wikipedia.org/wiki/Plyometrics');

-- [Träningslära] multiple_choice, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Vad innebär hook grip (krokgrepp) i marklyft?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Att tummen fångas mellan skivstången och fingrarna för att öka friktionen', TRUE),
  (@q, 'Att ena handen greppar över och andra under stången', FALSE),
  (@q, 'Att man använder lyftremmar runt handlederna', FALSE),
  (@q, 'Att man greppar stången med öppna händer utan tummar', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Deadlift', 'https://en.wikipedia.org/wiki/Deadlift');

-- [Träningslära] multiple_choice, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Vilken av de tre varianterna av jerk (stöt) är vanligast i tävling?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Powerjerk', FALSE),
  (@q, 'Splitjerk', TRUE),
  (@q, 'Squatjerk', FALSE),
  (@q, 'Push press', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Clean and jerk', 'https://en.wikipedia.org/wiki/Clean_and_jerk');

-- [Träningslära] multiple_choice, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Vad kännetecknar en power clean jämfört med en squat clean?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Stången fångas vid eller ovanför halv knäböj, med höfterna över knäna', TRUE),
  (@q, 'Stången fångas i full djup knäböj', FALSE),
  (@q, 'Stången pressas över huvudet i stället för att fångas på axlarna', FALSE),
  (@q, 'Stången dras bara till höftnivå och fångas aldrig', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Clean and jerk', 'https://en.wikipedia.org/wiki/Clean_and_jerk');

-- [Träningslära] multiple_choice, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Vilka tre perioder delas en makrocykel (träningssäsong) vanligen in i?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Förberedelseperiod, tävlingsperiod och övergångsperiod', TRUE),
  (@q, 'Mikrocykel, mesocykel och makrocykel', FALSE),
  (@q, 'Uppvärmning, huvuddel och nedvarvning', FALSE),
  (@q, 'Excentrisk, amortiserings- och koncentrisk fas', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Sports periodization', 'https://en.wikipedia.org/wiki/Sports_periodization');

-- [Träningslära] multiple_choice, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Vilken typ av nervceller justerar känsligheten i sträckreflexen genom att ändra spänningen i muskelspolens intrafusala fibrer?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Alfa-motoneuroner', FALSE),
  (@q, 'Gamma-motoneuroner', TRUE),
  (@q, 'Golgis senorgan', FALSE),
  (@q, 'Renshawceller', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Stretch reflex', 'https://en.wikipedia.org/wiki/Stretch_reflex');

-- [Träningslära] multiple_choice, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Vilken signalväg som aktiveras av mekanisk spänning ökar muskelproteinsyntesen och driver muskeltillväxt (hypertrofi)?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'AMPK-signalering', FALSE),
  (@q, 'mTOR-signalering', TRUE),
  (@q, 'Cori-cykeln', FALSE),
  (@q, 'Kreatinfosfatsystemet', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Muscle hypertrophy', 'https://en.wikipedia.org/wiki/Muscle_hypertrophy');

-- [Träningslära] yes_no, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Är calisthenics styrketräning där man använder den egna kroppsvikten som motstånd, med lite eller ingen utrustning?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Calisthenics', 'https://en.wikipedia.org/wiki/Bodyweight_exercise');

-- [Träningslära] yes_no, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Består tävling i olympisk tyngdlyftning av lyften ryck, stöt och bänkpress?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Olympic weightlifting', 'https://en.wikipedia.org/wiki/Olympic_weightlifting');

-- [Träningslära] yes_no, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Fanns tyngdlyftning med redan vid de första moderna olympiska spelen 1896?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Olympic weightlifting', 'https://en.wikipedia.org/wiki/Olympic_weightlifting');

-- [Träningslära] yes_no, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Är styrketräning säker för barn om den är rätt upplagd och övervakad?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Strength training', 'https://en.wikipedia.org/wiki/Strength_training');

-- [Träningslära] yes_no, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Rekommenderas det ofta att hålla ryggen neutral (rak) genom hela ett marklyft?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Deadlift', 'https://en.wikipedia.org/wiki/Deadlift');

-- [Träningslära] yes_no, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Är mikrocykeln den största och längsta cykeln i en periodiseringsplan?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Sports periodization', 'https://en.wikipedia.org/wiki/Sports_periodization');

-- [Träningslära] yes_no, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Måste höftvecket hamna under knäets översida för att en knäböj ska bli godkänd i styrkelyftstävling?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Squat (exercise)', 'https://en.wikipedia.org/wiki/Squat_(exercise)');

-- [Träningslära] yes_no, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Måste stången ligga stilla på bröstet tills domaren ger tecken att pressa i en bänkpress i tävling?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Bench press', 'https://en.wikipedia.org/wiki/Bench_press');

-- [Träningslära] yes_no, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Förebygger statisk stretching före eller efter träning träningsvärk (DOMS)?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Delayed onset muscle soreness', 'https://en.wikipedia.org/wiki/Delayed_onset_muscle_soreness');

-- [Träningslära] yes_no, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Minskar stångens hastighet ungefär linjärt när belastningen ökar?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Velocity based training', 'https://en.wikipedia.org/wiki/Velocity_based_training');

-- [Träningslära] yes_no, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Är det muskelspolarna, inte senorna, som känner av sträckning i sträckreflexen?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Stretch reflex', 'https://en.wikipedia.org/wiki/Stretch_reflex');

-- [Träningslära] free_text, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'Hur många kilo väger herrstången (den olympiska skivstången för män)? Svara med ett tal.', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '20', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Olympic weightlifting', 'https://en.wikipedia.org/wiki/Olympic_weightlifting');

-- [Träningslära] free_text, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'Hur många försök har en tävlande på varje lyft i olympisk tyngdlyftning? Svara med ett tal.', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '3', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Olympic weightlifting', 'https://en.wikipedia.org/wiki/Olympic_weightlifting');

-- [Träningslära] free_text, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'Vilket tillstånd, vars namn kommer från grekiskans sarx (kött) och penia (brist), innebär förlust av muskelmassa och styrka? Svara med ett ord.', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Sarkopeni', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Sarcopenia', 'https://en.wikipedia.org/wiki/Sarcopenia');

-- [Träningslära] free_text, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'Vad kallas träningsmetoden där vikten sänks när man nått muskelsvikt och man fortsätter med den lättare vikten? Svara med ett ord.', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Dropset', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Drop set', 'https://en.wikipedia.org/wiki/Drop_set');

-- [Träningslära] free_text, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'Vilken stor sätesmuskel är, tillsammans med quadriceps femoris och adductor magnus, primär agonist i knäböj? Svara med det latinska namnet.', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Gluteus maximus', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Squat (exercise)', 'https://en.wikipedia.org/wiki/Squat_(exercise)');

-- [Träningslära] free_text, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'Hur lång tid omfattar en mikrocykel i periodisering vanligen? Svara med ett ord (t.ex. dag, vecka, månad).', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Vecka', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Sports periodization', 'https://en.wikipedia.org/wiki/Sports_periodization');

-- [Träningslära] free_text, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'Vilken är den högsta möjliga poängen på Beighton-skalan som används för att bedöma ledöverrörlighet? Svara med ett tal.', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '9', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Hypermobility (joints)', 'https://en.wikipedia.org/wiki/Hypermobility_(joints)');

-- [Träningslära] free_text, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'I Selyes allmänna anpassningssyndrom, som ligger till grund för periodisering, följer stadierna alarm, motstånd och vilket tredje stadium? Svara med ett ord.', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Utmattning', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - General adaptation syndrome', 'https://en.wikipedia.org/wiki/General_adaptation_syndrome');

-- [Träningslära] free_text, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'Vad kallas fasen mellan den excentriska och koncentriska delen i plyometrisk träning, som måste vara mycket kort för att inte elastisk energi ska gå förlorad som värme? Svara med ett ord.', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Amortiseringsfasen', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Plyometrics', 'https://en.wikipedia.org/wiki/Plyometrics');

-- [Träningslära] free_text, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'Hur många procents hastighetsförlust från den snabbaste repetitionen används ofta som gräns i hastighetsbaserad träning (VBT) för att undvika träning till failure? Svara med ett tal.', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '20', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Velocity based training', 'https://en.wikipedia.org/wiki/Velocity_based_training');

-- [Träningslära] free_text, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'Hos vilken muskelfibertyp, typ I eller typ II, minskar antalet mest vid sarkopeni? Svara med typ I eller typ II.', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Typ II', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Sarcopenia', 'https://en.wikipedia.org/wiki/Sarcopenia');

-- [Träningslära] multiple_choice, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Vad betyder det svenska ordet fartlek ungefär?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Långsam löpning', FALSE),
  (@q, 'Hastighetslek', TRUE),
  (@q, 'Backträning', FALSE),
  (@q, 'Skogslöpning', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Fartlek', 'https://en.wikipedia.org/wiki/Fartlek');

-- [Träningslära] multiple_choice, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Vad står förkortningen RICE för vid första hjälpen vid skador?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Rörelse, istapp, cirkulation, energi', FALSE),
  (@q, 'Rehab, intervall, cykling, extension', FALSE),
  (@q, 'Rotation, is, compound, elevation', FALSE),
  (@q, 'Vila, is, kompression och högläge', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - RICE (medicine)', 'https://en.wikipedia.org/wiki/RICE_(medicine)');

-- [Träningslära] multiple_choice, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Hur lång tid anses en nedvarvning efter ett träningspass vanligen räcka för de flesta?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '30–45 minuter', FALSE),
  (@q, '3–10 minuter', TRUE),
  (@q, '15–20 sekunder', FALSE),
  (@q, '1–2 timmar', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Cooling down', 'https://en.wikipedia.org/wiki/Cooling_down');

-- [Träningslära] multiple_choice, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Hur många minuter fysisk aktivitet per dag rekommenderar WHO i genomsnitt för barn och ungdomar?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '60 minuter', TRUE),
  (@q, '15 minuter', FALSE),
  (@q, '30 minuter', FALSE),
  (@q, '120 minuter', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'PMC - World Health Organization 2020 guidelines on physical activity and sedentary behaviour', 'https://pmc.ncbi.nlm.nih.gov/articles/7719906/');

-- [Träningslära] multiple_choice, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'För uthållighetstävlingar som varar längre än hur lång tid rekommenderas vanligen kolhydratladdning?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '45 minuter', FALSE),
  (@q, '90 minuter', TRUE),
  (@q, '150 minuter', FALSE),
  (@q, '240 minuter', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Carbohydrate loading', 'https://en.wikipedia.org/wiki/Carbohydrate_loading');

-- [Träningslära] multiple_choice, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Hur mycket syre per kilo kroppsvikt och minut motsvarar 1 MET (energikostnaden för att sitta stilla)?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '1,0 ml', FALSE),
  (@q, '2,0 ml', FALSE),
  (@q, '3,5 ml', TRUE),
  (@q, '7,0 ml', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Metabolic equivalent of task', 'https://en.wikipedia.org/wiki/Metabolic_equivalent_of_task');

-- [Träningslära] multiple_choice, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Vilken vattentemperatur används vanligen i ett isbad efter träning?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Cirka 0–2 °C', FALSE),
  (@q, 'Cirka 10–15 °C', TRUE),
  (@q, 'Cirka 20–25 °C', FALSE),
  (@q, 'Cirka 30–35 °C', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Cold water immersion', 'https://en.wikipedia.org/wiki/Cold_water_immersion');

-- [Träningslära] multiple_choice, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Vilken koffeindos per kilo kroppsvikt rekommenderar ISSN:s ställningstagande, vanligen intagen cirka 60 minuter före träning?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '0,5–1 mg/kg', FALSE),
  (@q, '1–2 mg/kg', FALSE),
  (@q, '8–12 mg/kg', FALSE),
  (@q, '3–6 mg/kg', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'ISSN position stand: caffeine and exercise performance', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7777221/');

-- [Träningslära] multiple_choice, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Vilket dagligt proteinintag rekommenderar ISSN:s ställningstagande för personer som tränar?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '0,4–0,6 g/kg', FALSE),
  (@q, '1,4–2,0 g/kg', TRUE),
  (@q, '3,5–4,5 g/kg', FALSE),
  (@q, '5,0–6,0 g/kg', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'ISSN position stand: protein and exercise', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5477153/');

-- [Träningslära] multiple_choice, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Hur ser Gibalas HIIT-protokoll ut?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '60 sekunder hårt (cirka 95 % av VO2max) med 75 sekunders vila, upprepat 8–12 gånger', TRUE),
  (@q, '10 minuter vid 60 % av VO2max utan vila', FALSE),
  (@q, '5 sekunders spurter med 5 minuters vila, upprepat 3 gånger', FALSE),
  (@q, '30 minuter jämn löpning vid 70 % av maxpulsen', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - High-intensity interval training', 'https://en.wikipedia.org/wiki/High-intensity_interval_training');

-- [Träningslära] multiple_choice, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Vad gäller för löpekonomi hos tränade löpare?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Högre syrekostnad vid en given fart innebär bättre löpekonomi', FALSE),
  (@q, 'VO2max förutsäger alltid loppresultat bättre än löpekonomi', FALSE),
  (@q, 'Lägre syrekostnad vid en given fart innebär bättre löpekonomi, och bland tränade löpare med samma VO2max hänger löpekonomin starkare ihop med prestationen', TRUE),
  (@q, 'Löpekonomi mäts i antal steg per minut', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Running economy', 'https://en.wikipedia.org/wiki/Running_economy');

-- [Träningslära] multiple_choice, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'multiple_choice', 'Hur mycket kolhydrater per kilo kroppsvikt innebär kolhydratladdning före evenemang över 90 minuter, med start 36–48 timmar innan?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Cirka 2–3 g/kg', FALSE),
  (@q, 'Cirka 4–5 g/kg', FALSE),
  (@q, 'Cirka 20–25 g/kg', FALSE),
  (@q, 'Cirka 10–12 g/kg', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Carbohydrate loading', 'https://en.wikipedia.org/wiki/Carbohydrate_loading');

-- [Träningslära] yes_no, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Räknas ett BMI på 22 som normalvikt enligt WHO:s klassificering för vuxna?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Body mass index', 'https://en.wikipedia.org/wiki/Body_mass_index');

-- [Träningslära] yes_no, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Beräknas BMI som kroppsvikt i kilogram delat med längden i meter i kvadrat?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Body mass index', 'https://en.wikipedia.org/wiki/Body_mass_index');

-- [Träningslära] yes_no, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Tyder en snabbare pulssänkning efter avslutad ansträngning på sämre kondition?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Heart rate', 'https://en.wikipedia.org/wiki/Heart_rate');

-- [Träningslära] yes_no, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Är nordic hamstring curl en excentrisk övning som ofta används för att förebygga hamstringsskador?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Nordic hamstring curl', 'https://en.wikipedia.org/wiki/Nordic_hamstring_curl');

-- [Träningslära] yes_no, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Definieras stillasittande beteende som vaket beteende i sittande, liggande eller tillbakalutad position med en energiförbrukning på högst 1,5 MET?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Sedentary lifestyle', 'https://en.wikipedia.org/wiki/Sedentary_lifestyle');

-- [Träningslära] yes_no, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Rekommenderar WHO i riktlinjerna från 2020 att äldre vuxna gör varierad fysisk aktivitet med inslag av balans och styrka på tre eller fler dagar i veckan?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'PMC - World Health Organization 2020 guidelines on physical activity and sedentary behaviour', 'https://pmc.ncbi.nlm.nih.gov/articles/7719906/');

-- [Träningslära] yes_no, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Enligt en metaanalys från 2021 är foam rolling bättre stött som återhämtningsverktyg än som uppvärmning?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Foam roller', 'https://en.wikipedia.org/wiki/Foam_rolling');

-- [Träningslära] yes_no, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Börjar övervikt vid ett lägre BMI än 25 enligt WHO:s rekommendationer för asiatiska populationer?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Body mass index', 'https://en.wikipedia.org/wiki/Body_mass_index');

-- [Träningslära] yes_no, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Är det biceps femoris långa huvud som är den hamstringsmuskel som löper störst risk att skadas, oftast i slutet av svingfasen vid löpning?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Pulled hamstring', 'https://en.wikipedia.org/wiki/Hamstring_injury');

-- [Träningslära] yes_no, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Är viktuppgång enligt ISSN:s kreatinställningstagande den enda konsekvent rapporterade biverkningen av kreatin?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'ISSN position stand: safety and efficacy of creatine supplementation', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5469049/');

-- [Träningslära] yes_no, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'yes_no', 'Visar sammanställd forskning att träningsfrekvensen inte påverkar muskelstyrkan när träningsvolymen är lika stor?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Strength training', 'https://en.wikipedia.org/wiki/Strength_training');

-- [Träningslära] free_text, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'Hur många minuter löper man i Coopers test för att mäta syreupptagningsförmågan? (svara med ett tal)', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '12', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Cooper test', 'https://en.wikipedia.org/wiki/Cooper_test');

-- [Träningslära] free_text, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'Hur många meter är banan som man springer fram och tillbaka över i beep-testet? (svara med ett tal)', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '20', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Multi-stage fitness test', 'https://en.wikipedia.org/wiki/Multi-stage_fitness_test');

-- [Träningslära] free_text, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'Vad kallas det på engelska när cyklister får slut på glykogen? (svara med ett engelskt ord)', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'bonking', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Glycogen', 'https://en.wikipedia.org/wiki/Glycogen');

-- [Träningslära] free_text, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'Vilken minnesregel som publicerades 2019 i British Journal of Sports Medicine har ersatt RICE vid mjukdelsskador? (svara med minnesregelns namn)', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'PEACE & LOVE', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - RICE (medicine)', 'https://en.wikipedia.org/wiki/RICE_(medicine)');

-- [Träningslära] free_text, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'Över vilken midja-höft-kvot definierar WHO bukfetma hos män? (svara med decimalkomma och två decimaler)', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '0,90', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Waist-hip ratio', 'https://en.wikipedia.org/wiki/Waist%E2%80%93hip_ratio');

-- [Träningslära] free_text, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'Från hur många MET räknas fysisk aktivitet som högintensiv (vigorous)? (svara med ett tal)', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '6', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Metabolic equivalent of task', 'https://en.wikipedia.org/wiki/Metabolic_equivalent_of_task');

-- [Träningslära] free_text, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'Genom att blockera vilka receptorer i hjärnan verkar koffein delvis som ergogent hjälpmedel? (svara med ett ord)', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Adenosin', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Caffeine', 'https://en.wikipedia.org/wiki/Caffeine');

-- [Träningslära] free_text, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'Vilket slags protein föreslår ISSN att man tar 30–40 g av cirka 30 minuter före sömn för att öka muskelproteinsyntesen över natten? (svara med ett ord)', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Kasein', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'ISSN position stand: protein and exercise', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5477153/');

-- [Träningslära] free_text, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'ISSN föreslår cirka hur många gram protein per kilo kroppsvikt och måltid? (svara med decimalkomma)', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '0,25', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'ISSN position stand: protein and exercise', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5477153/');

-- [Träningslära] free_text, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'Enligt ISSN:s ställningstagande om kreatin, hur många gram kreatin per dag intas under laddningsfasen (5 g fyra gånger dagligen)? (svara med ett tal)', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '20', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'ISSN position stand: safety and efficacy of creatine supplementation', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5469049/');

-- [Träningslära] free_text, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Träningslära'), @author, 'free_text', 'Hur många gram protein per kilo kroppsvikt och dag kan som lägst behövas för att bevara muskelmassa vid energiunderskott enligt ISSN? (svara med decimalkomma)', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '2,3', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'ISSN position stand: protein and exercise', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5477153/');

-- [Fysiologi] multiple_choice, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Vilka celler i bukspottkörteln producerar hormonet glukagon?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Betaceller', FALSE),
  (@q, 'Alfaceller', TRUE),
  (@q, 'Deltaceller', FALSE),
  (@q, 'Leydigceller', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Glucagon', 'https://en.wikipedia.org/wiki/Glucagon');

-- [Fysiologi] multiple_choice, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Vilket hormon, som främst produceras i magsäcken, kallas "hungerhormonet" eftersom det ökar drivet att äta?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Leptin', FALSE),
  (@q, 'Glukagon', FALSE),
  (@q, 'Ghrelin', TRUE),
  (@q, 'Endorfin', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Ghrelin', 'https://en.wikipedia.org/wiki/Ghrelin');

-- [Fysiologi] multiple_choice, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Vilken av följande är en typisk hjärtanpassning till långvarig uthållighetsträning?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ökad slagvolym', TRUE),
  (@q, 'Minskad slagvolym', FALSE),
  (@q, 'Förtunnad hjärtmuskel', FALSE),
  (@q, 'Högre vilopuls', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Athlete''s heart', 'https://en.wikipedia.org/wiki/Athlete%27s_heart');

-- [Fysiologi] multiple_choice, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Vilken molekyl måste binda till myosinhuvudet för att det ska släppa från aktin så att muskeln kan slappna av?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Kalcium', FALSE),
  (@q, 'ATP', TRUE),
  (@q, 'ADP', FALSE),
  (@q, 'Laktat', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Muscle contraction', 'https://en.wikipedia.org/wiki/Muscle_contraction');

-- [Fysiologi] multiple_choice, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Vilken signalsubstans frisätts vid den neuromuskulära synapsen hos skelettmuskulatur?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Dopamin', FALSE),
  (@q, 'Acetylkolin', TRUE),
  (@q, 'Serotonin', FALSE),
  (@q, 'GABA', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Neuromuscular junction', 'https://en.wikipedia.org/wiki/Neuromuscular_junction');

-- [Fysiologi] multiple_choice, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Under ungefär hur lång tid bidrar kreatinfosfat med fosfat till ADP anaerobt i början av en maximal muskelansträngning?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Cirka 5–8 sekunder', TRUE),
  (@q, 'Cirka 30–40 sekunder', FALSE),
  (@q, 'Cirka 2–3 minuter', FALSE),
  (@q, 'Cirka 10–15 minuter', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Phosphocreatine', 'https://en.wikipedia.org/wiki/Phosphocreatine');

-- [Fysiologi] multiple_choice, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Vilket protein pumpar tillbaka kalcium till sarkoplasmatiska retiklet så att muskeln kan slappna av?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ryanodinreceptorn', FALSE),
  (@q, 'Troponin I', FALSE),
  (@q, 'Natrium-kaliumpumpen', FALSE),
  (@q, 'SERCA', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Excitation-contraction coupling', 'https://en.wikipedia.org/wiki/Excitation%E2%80%93contraction_coupling');

-- [Fysiologi] multiple_choice, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Vilket organ kan inte använda ketonkroppar som energikälla eftersom det saknar enzymet tiofores (beta-ketoacyl-CoA-transferas)?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Hjärnan', FALSE),
  (@q, 'Hjärtat', FALSE),
  (@q, 'Levern', TRUE),
  (@q, 'Skelettmuskulaturen', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Ketone bodies', 'https://en.wikipedia.org/wiki/Ketone_bodies');

-- [Fysiologi] multiple_choice, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Ungefär hur mycket ökar myelinisering aktionspotentialens ledningshastighet i axoner med en diameter över en mikrometer?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ungefär 2 gånger', FALSE),
  (@q, 'Ungefär 10 gånger', TRUE),
  (@q, 'Ungefär 100 gånger', FALSE),
  (@q, 'Ungefär 1 000 gånger', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Action potential', 'https://en.wikipedia.org/wiki/Action_potential');

-- [Fysiologi] multiple_choice, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Hur verkar botulinumtoxin vid den neuromuskulära synapsen?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Det blockerar acetylkolinreceptorerna på muskelcellen', FALSE),
  (@q, 'Det bryter ner acetylkolin i synapsklyftan', FALSE),
  (@q, 'Det hämmar frisättningen av acetylkolin genom att påverka SNARE-proteiner', TRUE),
  (@q, 'Det stänger kalciumkanalerna i T-tubuli', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Neuromuscular junction', 'https://en.wikipedia.org/wiki/Neuromuscular_junction');

-- [Fysiologi] multiple_choice, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Vilken av myosinets tunga kedje-isoformer I, IIa, IIx och IIb uttrycks inte av människor, utan finns hos andra däggdjur?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'I', FALSE),
  (@q, 'IIa', FALSE),
  (@q, 'IIx', FALSE),
  (@q, 'IIb', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Skeletal muscle', 'https://en.wikipedia.org/wiki/Skeletal_muscle');

-- [Fysiologi] multiple_choice, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Vilken jon ökar i T-tubulisystemet, minskar kalciumfrisättningen från sarkoplasmatiska retiklet och bidrar därmed till muskeltrötthet?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Natrium', FALSE),
  (@q, 'Klorid', FALSE),
  (@q, 'Magnesium', FALSE),
  (@q, 'Kalium', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Muscle fatigue', 'https://en.wikipedia.org/wiki/Muscle_fatigue');

-- [Fysiologi] yes_no, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Produceras hormonet leptin främst av fettceller och verkar på hypotalamus för att dämpa hunger?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Leptin', 'https://en.wikipedia.org/wiki/Leptin');

-- [Fysiologi] yes_no, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Ger protein ungefär 9 kcal per gram?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Atwater system', 'https://en.wikipedia.org/wiki/Atwater_system');

-- [Fysiologi] yes_no, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Syntetiseras insulinlik tillväxtfaktor 1 (IGF-1) främst i levern efter stimulering av tillväxthormon?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Insulin-like growth factor 1', 'https://en.wikipedia.org/wiki/Insulin-like_growth_factor_1');

-- [Fysiologi] yes_no, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Har kolhydrater den högsta termiska effekten av maten (störst andel av kalorierna går åt till matsmältningen) jämfört med protein och fett?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Specific dynamic action', 'https://en.wikipedia.org/wiki/Thermic_effect_of_food');

-- [Fysiologi] yes_no, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Utvecklar en muskel sin största aktiva kraft när den är maximalt utsträckt?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Muscle contraction', 'https://en.wikipedia.org/wiki/Muscle_contraction');

-- [Fysiologi] yes_no, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Är förhöjt kreatinkinas i blodet en markör för muskelskada, till exempel rabdomyolys?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Creatine kinase', 'https://en.wikipedia.org/wiki/Creatine_kinase');

-- [Fysiologi] yes_no, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Är vilopulsen ofta lägre hos uthållighetstränade än hos otränade?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Bradycardia', 'https://en.wikipedia.org/wiki/Bradycardia');

-- [Fysiologi] yes_no, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Är kroppens syreförbrukning förhöjd en tid efter hård träning jämfört med vilonivå (EPOC)?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Excess post-exercise oxygen consumption', 'https://en.wikipedia.org/wiki/Excess_post-exercise_oxygen_consumption');

-- [Fysiologi] yes_no, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Använder Katch-McArdle-formeln för basalmetabolism fettfri massa i stället för total kroppsvikt?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Basal metabolic rate', 'https://en.wikipedia.org/wiki/Basal_metabolic_rate');

-- [Fysiologi] yes_no, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Förkortas A-bandet i sarkomeren när muskeln kontraherar?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Sarcomere', 'https://en.wikipedia.org/wiki/Sarcomere');

-- [Fysiologi] yes_no, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Hämmar AMPK mTORC1 genom att fosforylera TSC2, vilket stoppar energikrävande proteinsyntes?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - AMP-activated protein kinase', 'https://en.wikipedia.org/wiki/AMP-activated_protein_kinase');

-- [Fysiologi] free_text, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Vad kallas processen där levern omvandlar lagrat glykogen till glukos? Svara med ett ord.', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Glykogenolys', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Glucagon', 'https://en.wikipedia.org/wiki/Glucagon');

-- [Fysiologi] free_text, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Vad kallas de smärtlindrande peptider som bildas i hjärnan, lagras i hypofysen och ökar känslan av välbefinnande? Svara med ett ord i pluralis.', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Endorfiner', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Endorphins', 'https://en.wikipedia.org/wiki/Endorphins');

-- [Fysiologi] free_text, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Vilket ämne är det som tar slut i musklerna när maratonlöpare "går in i väggen"? Svara med ett ord.', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Glykogen', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Carbohydrate loading', 'https://en.wikipedia.org/wiki/Carbohydrate_loading');

-- [Fysiologi] free_text, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'I vilken cellorganell sker citronsyracykeln i eukaryota celler? Svara med ett ord.', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Mitokondrien', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Citric acid cycle', 'https://en.wikipedia.org/wiki/Citric_acid_cycle');

-- [Fysiologi] free_text, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Vilket enzym katalyserar den reversibla överföringen av fosfat mellan ATP och kreatin för att bilda kreatinfosfat? Svara med ett ord.', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Kreatinkinas', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Creatine kinase', 'https://en.wikipedia.org/wiki/Creatine_kinase');

-- [Fysiologi] free_text, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Ungefär hur många procent av kroppens kreatin lagras i musklerna? (svara med ett tal)', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '95', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Phosphocreatine', 'https://en.wikipedia.org/wiki/Phosphocreatine');

-- [Fysiologi] free_text, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Vid ungefär hur många procent av VO2max minimeras fettoxidationen enligt crossover-konceptet? (svara med ett tal)', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '85', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Frontiers in Physiology - Ketogenic diets and the exercise crossover point', 'https://www.frontiersin.org/articles/10.3389/fphys.2023.1150265/full');

-- [Fysiologi] free_text, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Vilken muskelfibertyp (I, IIa eller IIx) har lägst mitokondrietäthet och sämst uthållighet? Svara med fibertypen.', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'IIx', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Skeletal muscle', 'https://en.wikipedia.org/wiki/Skeletal_muscle');

-- [Fysiologi] free_text, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Vilket protein, även kallat GDF-8, hämmar muskeltillväxt? Svara med ett ord.', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Myostatin', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Myostatin', 'https://en.wikipedia.org/wiki/Myostatin');

-- [Fysiologi] free_text, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Vilken kalciumkanal i sarkoplasmatiska retiklet öppnas när dihydropyridinreceptorn i T-tubuli aktiveras i skelettmuskel? Svara med ett ord.', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ryanodinreceptorn', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Excitation-contraction coupling', 'https://en.wikipedia.org/wiki/Excitation%E2%80%93contraction_coupling');

-- [Fysiologi] free_text, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Vilken isoform av kreatinkinas dominerar (cirka 98 %) i skelettmuskulatur? Svara med isoformens namn (till exempel CK-BB).', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'CK-MM', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Creatine kinase', 'https://en.wikipedia.org/wiki/Creatine_kinase');

-- [Fysiologi] multiple_choice, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'I vilken enhet anges blodtryck?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Slag per minut', FALSE),
  (@q, 'Millimeter kvicksilver (mmHg)', TRUE),
  (@q, 'Liter per minut', FALSE),
  (@q, 'Newton per kvadratcentimeter', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Blood pressure', 'https://en.wikipedia.org/wiki/Blood_pressure');

-- [Fysiologi] multiple_choice, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Ungefär hur mycket blod har en vuxen människa?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Cirka 2 liter', FALSE),
  (@q, 'Cirka 3 liter', FALSE),
  (@q, 'Cirka 5 liter', TRUE),
  (@q, 'Cirka 12 liter', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Blood volume', 'https://en.wikipedia.org/wiki/Blood_volume');

-- [Fysiologi] multiple_choice, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Mellan vilka delar av hjärtat sitter mitralisklaffen?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Höger förmak och höger kammare', FALSE),
  (@q, 'Vänster kammare och aortan', FALSE),
  (@q, 'Höger kammare och lungartären', FALSE),
  (@q, 'Vänster förmak och vänster kammare', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Heart', 'https://en.wikipedia.org/wiki/Heart');

-- [Fysiologi] multiple_choice, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Vilket organ producerar huvuddelen av hormonet erytropoietin (EPO) som svar på syrebrist i vävnaderna?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Njurarna', TRUE),
  (@q, 'Binjurarna', FALSE),
  (@q, 'Bukspottkörteln', FALSE),
  (@q, 'Sköldkörteln', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Erythropoietin', 'https://en.wikipedia.org/wiki/Erythropoietin');

-- [Fysiologi] multiple_choice, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Vilket av följande organ ingår, tillsammans med levern och lymfkörtlarna, i systemet som bryter ned åldrande röda blodkroppar?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Bukspottkörteln', FALSE),
  (@q, 'Mjälten', TRUE),
  (@q, 'Sköldkörteln', FALSE),
  (@q, 'Hjärtmuskeln', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Red blood cell', 'https://en.wikipedia.org/wiki/Red_blood_cell');

-- [Fysiologi] multiple_choice, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Vad innebär metoden live high–train low inom höjdträning?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Att sova på havsnivå och träna på cirka 2 500 m', FALSE),
  (@q, 'Att både sova och träna på cirka 4 000 m', FALSE),
  (@q, 'Att sova på cirka 2 100–2 500 m och träna på 1 250 m eller lägre', TRUE),
  (@q, 'Att sova på 1 250 m och träna på cirka 2 500 m', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Altitude training', 'https://en.wikipedia.org/wiki/Altitude_training');

-- [Fysiologi] multiple_choice, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Vad är under de flesta förhållanden den huvudsakliga drivkraften för andningsfrekvensen?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Blodets glukoshalt', FALSE),
  (@q, 'Kroppens natriumhalt', FALSE),
  (@q, 'Partialtrycket av syre (pO₂)', FALSE),
  (@q, 'Partialtrycket av koldioxid (pCO₂)', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Control of ventilation', 'https://en.wikipedia.org/wiki/Control_of_ventilation');

-- [Fysiologi] multiple_choice, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Enligt Frank–Starling-lagen, hur påverkas slagvolymen när hjärtats fyllnad före sammandragningen (den slutdiastoliska fyllnaden) ökar?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Slagvolymen ökar', TRUE),
  (@q, 'Slagvolymen minskar', FALSE),
  (@q, 'Slagvolymen påverkas inte alls', FALSE),
  (@q, 'Hjärtfrekvensen sjunker till hälften', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Frank-Starling law', 'https://en.wikipedia.org/wiki/Frank%E2%80%93Starling_law');

-- [Fysiologi] multiple_choice, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Vilken tillväxtfaktor är en central del av kroppens fysiologiska svar på träning och driver bildandet av nya kapillärer?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Insulin', FALSE),
  (@q, 'Kortisol', FALSE),
  (@q, 'VEGF', TRUE),
  (@q, 'Troponin', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Angiogenesis', 'https://en.wikipedia.org/wiki/Angiogenesis');

-- [Fysiologi] multiple_choice, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Vad förklarar till stor del kardiovaskulär drift, alltså att pulsen stiger och slagvolymen faller under långvarigt jämnt arbete?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Stigande kärntemperatur och minskad central blodvolym vid vätskebrist', TRUE),
  (@q, 'Ökad blodvolym på grund av vätskeintag', FALSE),
  (@q, 'Sjunkande kroppstemperatur', FALSE),
  (@q, 'Ökad syreupptagning i hjärtmuskeln', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Cardiovascular drift', 'https://en.wikipedia.org/wiki/Cardiovascular_drift');

-- [Fysiologi] multiple_choice, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Hur påverkar 2,3-BPG hemoglobinets syreaffinitet?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Det höjer affiniteten genom att binda till oxyhemoglobin', FALSE),
  (@q, 'Det sänker affiniteten genom att företrädesvis binda till deoxyhemoglobin', TRUE),
  (@q, 'Det påverkar inte syreaffiniteten', FALSE),
  (@q, 'Det ersätter syre på alla fyra bindningsställen', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Oxygen-hemoglobin dissociation curve', 'https://en.wikipedia.org/wiki/Oxygen%E2%80%93hemoglobin_dissociation_curve');

-- [Fysiologi] multiple_choice, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'multiple_choice', 'Vilken del av andningscentrum, där pre-Bötzinger-komplexet ingår, reglerar andningsrytmen och forcerad utandning?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Dorsala andningsgruppen', FALSE),
  (@q, 'Karotiskroppen', FALSE),
  (@q, 'Lillhjärnans kärnor', FALSE),
  (@q, 'Ventrala andningsgruppen', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Control of ventilation', 'https://en.wikipedia.org/wiki/Control_of_ventilation');

-- [Fysiologi] yes_no, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Har mogna röda blodkroppar hos däggdjur en cellkärna?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Red blood cell', 'https://en.wikipedia.org/wiki/Red_blood_cell');

-- [Fysiologi] yes_no, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Är törst normalt en tillräcklig vägledning för att hålla sig tillräckligt hydrerad vid vardagliga aktiviteter?', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Dehydration', 'https://en.wikipedia.org/wiki/Dehydration');

-- [Fysiologi] yes_no, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Kallas mitralisklaffen även bikuspidalklaffen, eftersom den har två segel?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Mitral valve', 'https://en.wikipedia.org/wiki/Mitral_valve');

-- [Fysiologi] yes_no, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Räknas en vilopuls på 70 slag per minut som bradykardi?', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Bradycardia', 'https://en.wikipedia.org/wiki/Bradycardia');

-- [Fysiologi] yes_no, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Ligger sinusknutan i väggen på vänster kammare?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Sinoatrial node', 'https://en.wikipedia.org/wiki/Sinoatrial_node');

-- [Fysiologi] yes_no, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Fördröjer AV-knutan impulsen så att förmak och kammare inte drar ihop sig samtidigt?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Cardiac conduction system', 'https://en.wikipedia.org/wiki/Cardiac_conduction_system');

-- [Fysiologi] yes_no, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Har oxygenerat hemoglobin större förmåga att binda koldioxid än deoxygenerat hemoglobin?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Haldane effect', 'https://en.wikipedia.org/wiki/Haldane_effect');

-- [Fysiologi] yes_no, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Är nedkylning genom kallvattenbad (immersion) den gyllene standarden vid behandling av ansträngningsutlöst värmeslag?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Heat stroke', 'https://en.wikipedia.org/wiki/Heat_stroke');

-- [Fysiologi] yes_no, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Stimulerar intensiv fysisk träning utsöndringen av tillväxthormon?', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', TRUE),
  (@q, 'Nej', FALSE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Growth hormone', 'https://en.wikipedia.org/wiki/Growth_hormone');

-- [Fysiologi] yes_no, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Är luftens syrehalt i procent lägre på hög höjd än vid havsnivå?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Altitude sickness', 'https://en.wikipedia.org/wiki/Altitude_sickness');

-- [Fysiologi] yes_no, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'yes_no', 'Orsakas första hjärtljudet (S1) av att aortaklaffen och pulmonalisklaffen stängs?', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Ja', FALSE),
  (@q, 'Nej', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Mitral valve', 'https://en.wikipedia.org/wiki/Mitral_valve');

-- [Fysiologi] free_text, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Hur många hålrum (förmak och kammare tillsammans) har det mänskliga hjärtat? (svara med ett tal)', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '4', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Heart', 'https://en.wikipedia.org/wiki/Heart');

-- [Fysiologi] free_text, nivå 1
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Under vilken kärntemperatur i °C definieras hypotermi? (svara med ett tal)', 1);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '35', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Hypothermia', 'https://en.wikipedia.org/wiki/Hypothermia');

-- [Fysiologi] free_text, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Hur många syremolekyler kan en hemoglobinmolekyl som mest binda? (svara med ett tal)', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '4', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Hemoglobin', 'https://en.wikipedia.org/wiki/Hemoglobin');

-- [Fysiologi] free_text, nivå 2
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'I vilken vävnad i stora ben bildas röda blodkroppar? (svara med ett ord)', 2);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Benmärg', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Red blood cell', 'https://en.wikipedia.org/wiki/Red_blood_cell');

-- [Fysiologi] free_text, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Minutventilation är tidalvolym multiplicerat med vad? (svara med ett ord)', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Andningsfrekvens', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Respiratory minute volume', 'https://en.wikipedia.org/wiki/Respiratory_minute_volume');

-- [Fysiologi] free_text, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Under vilken serumnatriumkoncentration, i mmol/L, definieras hyponatremi vanligen? (svara med ett tal)', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '135', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Hyponatremia', 'https://en.wikipedia.org/wiki/Hyponatremia');

-- [Fysiologi] free_text, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Vilket hormon (svara med förkortningen) frisätts vid vätskebrist och får njurarna att spara vatten?', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'ADH', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Vasopressin', 'https://en.wikipedia.org/wiki/Vasopressin');

-- [Fysiologi] free_text, nivå 4
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Vilka transkriptionsfaktorer främjar uttrycket av EPO-genen när syrehalten är låg? (svara med förkortningen)', 4);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'HIF', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Erythropoietin', 'https://en.wikipedia.org/wiki/Erythropoietin');

-- [Fysiologi] free_text, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Vad kallas bildandet av nya mitokondrier i muskelceller, som uthållighetsträning stimulerar? (två ord)', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Mitokondriell biogenes', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Mitochondrial biogenesis', 'https://en.wikipedia.org/wiki/Mitochondrial_biogenesis');

-- [Fysiologi] free_text, nivå 3
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Vilken del av det autonoma nervsystemet står för "kamp eller flykt"-reaktionen och höjer pulsen vid hård ansträngning? (svara med ett ord)', 3);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, 'Sympatiska', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - Sympathetic nervous system', 'https://en.wikipedia.org/wiki/Sympathetic_nervous_system');

-- [Fysiologi] free_text, nivå 5
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES ((SELECT id FROM topics WHERE name = 'Fysiologi'), @author, 'free_text', 'Hur många procent högre VO₂max har män än kvinnor vid test på löpband, enligt referensvärden? (svara med ett tal)', 5);
SET @q = LAST_INSERT_ID();
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (@q, '26', TRUE);
INSERT INTO sources (question_id, source_text, url) VALUES
  (@q, 'Wikipedia - VO2 max', 'https://en.wikipedia.org/wiki/VO2_max');

"""Build resonances_extra.json: RESONATES_WITH links for arcs of the 13 added shows.

Edit the P(...) lines below, then run:
    python3 graph/build_resonances_extra.py
    python3 graph/validate_resonances_extra.py
Ids are written without the leading "arc:" (added automatically).
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
PAIRS = []


def P(source, target, bridge):
    PAIRS.append(("arc:" + source, "arc:" + target, bridge))


# ---------------- Attack on Titan ----------------
P("attack_on_titan/eren_yeager/channeling_helplessness_into_rage", "game_of_thrones/arya_stark/list_of_names",
  "Both turned a loss they were powerless to stop into a burning vow, and both measure their worth by whether they are finally strong enough to make someone pay.")
P("attack_on_titan/eren_yeager/pushing_everyone_away", "game_of_thrones/bran_stark/the_burden",
  "Both drift away from the people who love them under a weight they feel they cannot share, while those people watch helplessly as someone familiar becomes distant.")
P("attack_on_titan/mikasa_ackerman/protecting_her_only_family", "game_of_thrones/brienne_of_tarth/keeping_the_promise",
  "Both build their whole purpose around protecting someone, and both have to discover who they are when that devotion is no longer the only thing holding them up.")
P("attack_on_titan/mikasa_ackerman/protecting_her_only_family", "money_heist/helsinki/the_gentle_giant",
  "Both are fiercely capable protectors whose total loyalty to the people they love quietly shapes every choice, sometimes at their own expense.")
P("attack_on_titan/mikasa_ackerman/loving_someone_who_is_changing", "buffy/buffy_summers/first_love_turns",
  "Both watch someone they love deeply turn into a colder stranger, and both have to decide what love still asks of them when that person starts to cause harm.")
P("attack_on_titan/mikasa_ackerman/loving_someone_who_is_changing", "game_of_thrones/jaime_lannister/love_that_consumes",
  "Both keep defending a person they love long after others have given up, torn between loyalty to that bond and what their own conscience is telling them.")
P("attack_on_titan/armin_arlert/finding_his_worth", "game_of_thrones/samwell_tarly/courage_his_own_way",
  "Both have always been seen as the weak one, and both slowly find that their real strength lies in how they think rather than in what they lack.")
P("attack_on_titan/armin_arlert/finding_his_worth", "walking_dead/eugene_porter/worth_more_than_a_title",
  "Both feel like a burden carried by stronger people, and both have to discover that their mind is a genuine contribution rather than an excuse to be kept around.")
P("attack_on_titan/armin_arlert/standing_in_a_greater_place", "avatar/tenzin/fathers_shadow",
  "Both step into a place they believe belonged to someone greater, and the constant comparison makes them second-guess every decision they make.")
P("attack_on_titan/levi/carrying_the_fallen", "walking_dead/carol_peletier/the_weight_of_being_strong",
  "Both look unshakeable because they do the hard things no one else will, and both privately carry a weight of grief that no one sees them put down.")
P("attack_on_titan/levi/the_man_who_raised_him", "buffy/spike/proving_himself_to_the_one_who_made_him",
  "Both come face to face with the older figure who shaped their harshest years, and both have to ask how much of who they are was simply learned from that person.")
P("attack_on_titan/hange_zoe/curiosity_over_hatred", "avatar/katara/revenge_or_release",
  "Both have to decide what to do with an old wound that could turn into pure hatred, and both look for a way to face the pain without letting it own them.")
P("attack_on_titan/hange_zoe/leading_after_a_legend", "game_of_thrones/jon_snow/leading_those_who_resent_him",
  "Both inherit command they never wanted and find it lonely, with blame coming from every side and no option that feels clean.")
P("attack_on_titan/hange_zoe/leading_after_a_legend", "greys_anatomy/miranda_bailey/leading_the_hospital",
  "Both are handed the top job in the shadow of the person who led before them, and both have to work out what they truly stand for when every choice upsets someone.")
P("attack_on_titan/reiner_braun/the_dependable_one", "breaking_bad/jimmy_mcgill/the_mask_that_becomes_the_man",
  "Both play a role so well that it starts to feel more real than their own life, and the gap between the self they show and the self they are keeps growing.")
P("attack_on_titan/reiner_braun/the_dependable_one", "greys_anatomy/miranda_bailey/strong_one_asks_for_help",
  "Both are the reliable one everyone leans on, and both are quietly cracking under burdens they feel they are not allowed to share.")
P("attack_on_titan/reiner_braun/guilt_and_the_will_to_live", "game_of_thrones/theon_greyjoy/earning_forgiveness",
  "Both did real harm while desperate for a parent's approval, and both have to find out whether a person who caused so much damage still has a reason to live.")
P("attack_on_titan/reiner_braun/guilt_and_the_will_to_live", "breaking_bad/jesse_pinkman/carrying_guilt_he_cant_put_down",
  "Both are drowning in guilt so heavy that numbness feels like relief, and both keep going mostly for the sake of someone who still needs them.")
P("attack_on_titan/erwin_smith/a_dream_worth_the_cost", "money_heist/the_professor/responsible_for_everyone",
  "Both drew people into a mission rooted partly in something deeply personal, and both carry guilt for every life it costs while still having to lead.")
P("attack_on_titan/historia/the_girl_behind_the_kindness", "game_of_thrones/sansa_stark/fairy_tale_to_cage",
  "Both learned to survive by becoming exactly who others wanted, until the pleasant mask left little room for a self of their own.")
P("attack_on_titan/historia/the_girl_behind_the_kindness", "schitts_creek/twyla_sands/kindness_despite_chaos",
  "Both grew up unwanted in chaotic homes and chose relentless kindness, and both have to let someone see the person hiding behind the pleasant role.")
P("attack_on_titan/historia/choosing_her_own_path", "game_of_thrones/theon_greyjoy/two_families",
  "Both were rejected by a parent and then pulled back into the family story, tempted to accept any role that would finally make them wanted.")

# ---------------- BoJack Horseman ----------------
P("bojack/bojack_horseman/wanting_to_be_loved_while_hating_himself", "buffy/faith_lehane/facing_what_she_did",
  "Both keep doing harmful things while longing for someone to tell them they are good, and both have to stop waiting for punishment or absolution and take responsibility.")
P("bojack/bojack_horseman/still_waiting_for_his_mother", "avatar/zuko/fathers_approval",
  "Both have organised their lives around winning love from a contemptuous parent, and both have to decide what to do with a hunger that parent will never feed.")
P("bojack/bojack_horseman/still_waiting_for_his_mother", "game_of_thrones/tyrion_lannister/the_unwanted_son",
  "Both keep hoping that one more achievement will make a cold parent finally say they are proud, and both feel that chance slipping away for good.")
P("bojack/bojack_horseman/getting_sober_and_facing_the_harm", "greys_anatomy/richard_webber/sobriety",
  "Both fight to stay sober and discover that clarity is harder than the drinking was, because it leaves them face to face with what they did.")
P("bojack/diane_nguyen/wanting_her_work_to_matter", "buffy/winifred_burkle/big_job_inside_the_machine",
  "Both need their work to do real good, and every compromise inside a system they distrust feels like a betrayal of who they are.")
P("bojack/diane_nguyen/wanting_her_work_to_matter", "ted_lasso/sam_obisanya/doing_the_right_thing",
  "Both feel that staying quiet about what matters would make them worthless, and both have to weigh their principles against comfort and belonging.")
P("bojack/diane_nguyen/carrying_the_damage_from_home", "greys_anatomy/meredith_grey/letting_love_in",
  "Both built an identity around surviving a cold, neglectful family, and both half-believe that the darkness is what makes them real.")
P("bojack/diane_nguyen/carrying_the_damage_from_home", "avatar/lin_beifong/old_family_wounds",
  "Both carry old family wounds so tightly that the hurt has become part of who they are, and letting it go feels like losing themselves.")
P("bojack/diane_nguyen/loving_someone_so_different", "greys_anatomy/jackson_avery/grief_and_a_marriage",
  "Both marry someone they love only to find they see the world completely differently, and both feel the loneliness of not being reached when it matters most.")
P("bojack/princess_carolyn/the_one_who_holds_it_together", "greys_anatomy/miranda_bailey/strong_one_asks_for_help",
  "Both are the capable fixer everyone depends on, and both treat asking for help as a weakness they cannot afford.")
P("bojack/princess_carolyn/the_one_who_holds_it_together", "avatar/katara/parentified_caretaker",
  "Both take care of everyone around them while their own needs go unspoken, and both have to learn that they are allowed to be looked after too.")
P("bojack/princess_carolyn/wanting_to_be_a_mother", "friends/monica_geller/wanting_a_family",
  "Both long for a child while the path there refuses to look the way they planned, and both have to decide what family can look like instead.")
P("bojack/princess_carolyn/wanting_to_be_a_mother", "greys_anatomy/miranda_bailey/career_and_motherhood",
  "Both are driven professionals who want a child without anyone thinking they have gone soft, and both try to do it all perfectly and alone.")
P("bojack/todd_chavez/drifting_on_a_friends_couch", "buffy/alexander_harris/left_behind_after_school",
  "Both are warm, directionless young adults drifting while the people around them move ahead, and both hide the worry behind jokes.")
P("bojack/todd_chavez/drifting_on_a_friends_couch", "walking_dead/daryl_dixon/outsider_finds_a_family",
  "Both stay loyal to someone who treats them badly because it is the only belonging they know, and both have to find people who value them back.")
P("bojack/todd_chavez/not_feeling_what_others_feel", "greys_anatomy/callie_torres/coming_out",
  "Both realise as adults that they experience attraction differently from what they assumed, and both have to name it despite the fear of being seen as broken.")
P("bojack/mr_peanutbutter/learning_to_be_alone", "ted_lasso/ted_lasso/behind_the_smile",
  "Both use endless cheerfulness and busyness to outrun a sadness they have never faced, and both have to sit still long enough to feel it.")
P("bojack/mr_peanutbutter/learning_to_be_alone", "greys_anatomy/amelia_shepherd/choosing_her_own_shape",
  "Both love too fast and too hard and keep repeating the same relationship pattern, until they have to learn how to stand on their own.")
P("bojack/hollyhock/searching_for_where_she_comes_from", "greys_anatomy/jo_wilson/finding_where_you_came_from",
  "Both set out to find the biological family they never knew, carrying hope and dread about what the truth will say about them.")
P("bojack/hollyhock/protecting_herself_from_someone_she_loves", "avatar/asami_sato/fathers_betrayal",
  "Both discover that a family member they love has done real harm, and both have to decide how much of that person they can let into their life.")
P("bojack/hollyhock/protecting_herself_from_someone_she_loves", "my_hero_academia/shoto_todoroki/reaching_for_family",
  "Both have to hold two truths at once, that a relative caused real damage and is still family, and both work out where love ends and protecting themselves begins.")

# ---------------- Breaking Bad / Better Call Saul ----------------
P("breaking_bad/walter_white/the_overlooked_man_wants_his_due", "naruto/naruto_uzumaki/earning_acknowledgement",
  "Both are driven by the ache of being dismissed, and both chase something enormous mainly so the people who overlooked them will finally have to look up.")
P("breaking_bad/walter_white/the_double_life_at_home", "doctor_who/clara_oswald/living_a_double_life",
  "Both keep a whole hidden life from the people closest to them, telling themselves the lies protect everyone, while each lie demands another.")
P("breaking_bad/walter_white/the_double_life_at_home", "squid_game/cho_sang_woo/the_golden_boy_who_fell",
  "Both hide what they are really doing from a family that believes in them, too proud to admit the truth and convinced that only winning can make it right.")
P("breaking_bad/jesse_pinkman/proving_hes_more_than_a_screwup", "walking_dead/eugene_porter/safety_at_what_price",
  "Both feel important for the first time under a powerful figure whose methods are cruel, and both have to recognise their own worth before that approval costs them everything.")
P("breaking_bad/jesse_pinkman/carrying_guilt_he_cant_put_down", "money_heist/rio/after_the_trauma",
  "Both are young people trying to function again after something terrible, swinging between numbness and anger among people who love them but can't fully understand.")
P("breaking_bad/skyler_white/the_wife_who_notices", "stranger_things/joyce_byers/the_mother_no_one_believes",
  "Both sense that something is badly wrong while everyone around them calls it nerves or paranoia, and both have to decide whether to trust their own instincts.")
P("breaking_bad/skyler_white/the_wife_who_notices", "greys_anatomy/alex_karev/partner_in_depression",
  "Both watch a partner become distant and closed-off at the worst possible time, and both swing between patience and anger when that partner refuses to let them in.")
P("breaking_bad/skyler_white/complicit_to_protect_her_kids", "ted_lasso/leslie_higgins/finding_his_spine",
  "Both go along with something they know is wrong to keep their family safe, and both have to ask how much of their conscience that protection is worth.")
P("breaking_bad/hank_schrader/the_tough_guy_who_cant_admit_fear", "greys_anatomy/owen_hunt/bringing_war_home",
  "Both come back from a violent experience insisting they are fine, and both let the panic leak out as anger at the people who love them rather than name it.")
P("breaking_bad/hank_schrader/the_tough_guy_who_cant_admit_fear", "avatar/korra/healing_after_trauma",
  "Both built their whole identity on being strong and unbothered, and both have to admit they are struggling before they can rebuild a sense of themselves.")
P("breaking_bad/hank_schrader/the_case_he_cant_let_go", "squid_game/hwang_jun_ho/searching_for_a_missing_brother",
  "Both chase a truth no one else will pursue, and both find that doing their duty may collide head-on with loyalty to their own family.")
P("breaking_bad/hank_schrader/the_case_he_cant_let_go", "avatar/asami_sato/fathers_betrayal",
  "Both are forced to choose between what they know is right and loyalty to someone in their own family, and neither choice leaves them whole.")
P("breaking_bad/jimmy_mcgill/the_little_brother_never_good_enough", "greys_anatomy/amelia_shepherd/out_of_the_shadow",
  "Both are the family's troubled youngest trying to earn respect from an admired older sibling, and however much they change, they are still seen as the screw-up.")
P("breaking_bad/jimmy_mcgill/the_little_brother_never_good_enough", "avatar/bolin/little_brother_finding_his_worth",
  "Both grew up in the shadow of a more serious older brother, and both have to stop measuring themselves by that one person's opinion.")
P("breaking_bad/mike_ehrmantraut/living_for_his_granddaughter", "naruto/kakashi_hatake/teaching_the_lesson_that_cost_everything",
  "Both quietly carry guilt for a loss they feel responsible for, and both pour what is left of their love into looking after the ones who remain.")
P("breaking_bad/mike_ehrmantraut/living_for_his_granddaughter", "stranger_things/jim_hopper/numbing_a_grief_he_wont_face",
  "Both lock away grief and guilt over a child they could not save, and both find that caring for someone new forces them to face what they buried.")
P("breaking_bad/mike_ehrmantraut/the_professional_with_a_code", "game_of_thrones/sandor_clegane/cruel_boss",
  "Both do ugly work for people they despise and hold on to a private code, protecting the innocent in small ways while telling themselves it is only a job.")
P("breaking_bad/kim_wexler/climbing_on_her_own_terms", "ted_lasso/keeley_jones/taken_seriously",
  "Both have to prove themselves in a world where people at the top can dismiss them at any moment, and both question what success means once they have it.")
P("breaking_bad/kim_wexler/loving_someone_who_brings_out_your_wild_side", "money_heist/raquel_murillo/choosing_a_new_life",
  "Both are disciplined, rule-bound professionals who fall for someone who breaks the rules, and both discover a thrilling side of themselves that puts their whole career at stake.")
P("breaking_bad/walter_white_jr/the_kid_left_out_of_the_family_secret", "buffy/dawn_summers/am_i_real",
  "Both are teenagers who sense the adults are hiding something, and when the truth arrives it shakes their loyalty and their sense of who they are.")
P("breaking_bad/walter_white_jr/the_kid_left_out_of_the_family_secret", "money_heist/denver/his_fathers_son",
  "Both idolise a parent and then learn the family story was not the whole truth, and both have to square their love with the anger of having been lied to.")

# ---------------- Doctor Who ----------------
P("doctor_who/tenth_doctor/charm_over_grief", "avatar/aang/last_of_his_people",
  "Both survived the loss of almost everyone they belonged to, and both keep moving, joking and helping others because standing still would mean feeling it.")
P("doctor_who/tenth_doctor/charm_over_grief", "ted_lasso/ted_lasso/behind_the_smile",
  "Both hide old pain behind relentless cheerfulness and rescuing other people, and both find the feelings leaking out the moment they stop.")
P("doctor_who/tenth_doctor/alone_and_unchecked", "money_heist/berlin/nothing_left_to_lose",
  "Both decide the ordinary rules no longer apply to them once they feel the end approaching, and both grow magnetic and dangerous with no one left to push back.")
P("doctor_who/tenth_doctor/alone_and_unchecked", "game_of_thrones/daenerys_targaryen/the_price_of_destiny",
  "Both lose the people who kept them grounded, and without anyone to check them their certainty slides toward believing that their will is what matters most.")
P("doctor_who/twelfth_doctor/am_i_a_good_man", "bojack/bojack_horseman/wanting_to_be_loved_while_hating_himself",
  "Both push away the people who liked an easier version of them, while quietly desperate for someone to tell them they are, after all, a good person.")
P("doctor_who/twelfth_doctor/cannot_let_her_go", "stranger_things/mike_wheeler/refusing_to_give_up_on_a_friend",
  "Both refuse to accept that someone they love is gone, and their fierce loyalty becomes something close to obsession that frightens the people around them.")
P("doctor_who/twelfth_doctor/keeping_his_word", "naruto/jiraiya/the_reluctant_father_figure",
  "Both are weary elders who have lost too much, and teaching an eager young person unexpectedly becomes the thing that gives their own life meaning again.")
P("doctor_who/twelfth_doctor/keeping_his_word", "game_of_thrones/brienne_of_tarth/keeping_the_promise",
  "Both tie themselves to a promise that keeps them in place long after it would be easier to walk away, and both keep going for someone other than themselves.")
P("doctor_who/rose_tyler/outgrowing_a_small_life", "avatar/toph_beifong/breaking_out_of_the_cage",
  "Both seize the chance to leave a small, safe life for something bigger, and both have to disappoint a protective family to grow into who they could be.")
P("doctor_who/rose_tyler/outgrowing_a_small_life", "greys_anatomy/cristina_yang/outgrowing_home",
  "Both realise their hunger for more has outgrown the familiar place and people who shaped them, and both are torn between loyalty and leaving.")
P("doctor_who/rose_tyler/love_she_cannot_name", "naruto/hinata_hyuga/loving_from_afar",
  "Both carry a deep love they never quite say out loud, and both have to decide whether speaking it is worth the risk of what it might cost.")
P("doctor_who/martha_jones/waiting_to_be_seen", "greys_anatomy/callie_torres/loving_someone_who_doesnt_choose_you",
  "Both give far more than they get to someone whose heart is still elsewhere, and both have to decide when to keep hoping and when to walk away.")
P("doctor_who/martha_jones/waiting_to_be_seen", "buffy/willow_rosenberg/wallflower_finds_herself",
  "Both spend a long time as the capable helper waiting to be noticed by someone who loves another, and both slowly realise they deserve to be seen on their own.")
P("doctor_who/martha_jones/holding_everyone_together", "avatar/katara/parentified_caretaker",
  "Both have been the reliable one in a broken family for as long as they can remember, carrying everyone's worries while their own needs wait.")
P("doctor_who/donna_noble/just_a_temp", "avatar/sokka/ordinary_among_gifted",
  "Both believe they are ordinary next to remarkable people, and both discover they are sharper and braver than they ever gave themselves credit for.")
P("doctor_who/donna_noble/just_a_temp", "naruto/hinata_hyuga/courage_when_family_gave_up",
  "Both have been quietly written off by their own family until their confidence is almost gone, and both find it again beside someone who believes in them.")
P("doctor_who/amy_pond/left_waiting", "friends/chandler_bing/afraid_of_commitment",
  "Both were let down as children in ways that taught them not to trust that love lasts, and both panic just as commitment becomes real.")
P("doctor_who/amy_pond/future_she_planned", "greys_anatomy/jackson_avery/grief_and_a_marriage",
  "Both lose the family they hoped to build, and each partner grieves in a way the other can't reach until silence threatens the marriage itself.")
P("doctor_who/amy_pond/future_she_planned", "bojack/princess_carolyn/wanting_to_be_a_mother",
  "Both grieve a child and a family life that were supposed to come, and both quietly blame themselves for a loss that was never theirs to carry.")
P("doctor_who/rory_williams/in_someone_elses_shadow", "greys_anatomy/callie_torres/loving_someone_who_doesnt_choose_you",
  "Both love someone whose deepest attachment seems to belong to someone else, and both wonder whether quiet loyalty can ever be enough.")
P("doctor_who/rory_williams/quiet_man_stands_up", "game_of_thrones/samwell_tarly/courage_his_own_way",
  "Both are gentle people who always went along with stronger personalities, and both discover their own kind of courage when someone they love is threatened.")
P("doctor_who/rory_williams/quiet_man_stands_up", "ted_lasso/leslie_higgins/finding_his_spine",
  "Both are conflict-averse people who have always deferred to others, and both find that protecting someone they care about means finally standing up to people they admire.")
P("doctor_who/clara_oswald/carer_who_never_left", "buffy/buffy_summers/finding_reason_to_live",
  "Both put their own lives on hold to care for family through grief, and both reach for a secret taste of freedom while keeping up the dependable front.")
P("doctor_who/clara_oswald/carer_who_never_left", "schitts_creek/stevie_budd/what_else_could_i_be",
  "Both have been the steady one for so long that they wonder what else they might have been, and both need to find out whether they can take something for themselves.")
P("doctor_who/clara_oswald/outrunning_grief", "greys_anatomy/derek_shepherd/trauma_and_recklessness",
  "Both answer a devastating blow by chasing danger instead of talking, frightening the people who love them while insisting they are fine.")
P("doctor_who/clara_oswald/outrunning_grief", "money_heist/tokyo/running_from_the_past",
  "Both live at full speed after losing someone, because stopping to feel would be unbearable, and their recklessness keeps putting everything they have at risk.")

# ---------------- Friends ----------------
P("friends/rachel_green/building_a_life_of_her_own", "buffy/cordelia_chase/from_fame_to_calling",
  "Both walk away from a pampered future with no money and no plan, bluffing that they are fine while humbling first steps show them who they can become.")
P("friends/rachel_green/building_a_life_of_her_own", "schitts_creek/alexis_rose/earning_her_own_way",
  "Both have always been taken care of, and both have to find out whether they can build a life on their own effort once the safety net is gone.")
P("friends/rachel_green/love_with_a_close_friend", "the_office/dwight_schrute/a_love_he_cant_show",
  "Both keep circling back to the same person through pride, jealousy and bad timing, and both have to decide whether a love that keeps going wrong is worth choosing in the open.")
P("friends/rachel_green/love_with_a_close_friend", "the_office/jim_halpert/in_love_with_a_friend_who_is_taken",
  "Both are caught in a long, shared history where one is ready just as the other has moved on, and both wonder how long a feeling can wait for its moment.")
P("friends/monica_geller/wanting_a_family", "greys_anatomy/owen_hunt/wanting_a_family",
  "Both have always known they want children, and both watch relationships end over mismatched futures rather than lack of love.")
P("friends/monica_geller/never_good_enough_for_mom", "avatar/azula/the_perfect_daughter",
  "Both grew up as the less favoured child of a hard-to-please parent, and both cope by controlling every detail and needing to win.")
P("friends/monica_geller/never_good_enough_for_mom", "game_of_thrones/arya_stark/the_other_sister",
  "Both were measured against a sibling who seemed to do no wrong, and both carry that comparison long after childhood is over.")
P("friends/monica_geller/earning_respect_at_work", "game_of_thrones/jon_snow/leading_those_who_resent_him",
  "Both finally get the position they wanted only to lead people who resent them, and both have to earn respect without losing who they are.")
P("friends/monica_geller/earning_respect_at_work", "greys_anatomy/miranda_bailey/leading_the_hospital",
  "Both step into authority over people who doubt them and push hard to prove they deserve it, discovering that command and respect are not the same thing.")
P("friends/phoebe_buffay/finding_family_after_a_hard_start", "greys_anatomy/jo_wilson/finding_where_you_came_from",
  "Both survived a lonely, chaotic childhood on their own, and both have to decide how much of the past to reopen when the chance to find lost relatives appears.")
P("friends/phoebe_buffay/finding_family_after_a_hard_start", "the_office/erin_hannon/looking_for_family_at_work",
  "Both grew up without a stable family and built warm, unconventional lives, and both have to trust that the people who chose them are family enough.")
P("friends/phoebe_buffay/wanting_a_love_with_a_future", "money_heist/tokyo/love_versus_freedom",
  "Both are free spirits who fall for someone whose idea of the future differs from their own, and both have to decide whether love can hold two different needs.")
P("friends/phoebe_buffay/wanting_a_love_with_a_future", "greys_anatomy/cristina_yang/work_first_love_second",
  "Both finally find someone who feels right, then discover they may not want the same life, and both must weigh the love against the future they need.")
P("friends/joey_tribbiani/chasing_the_big_break", "my_hero_academia/izuku_midoriya/the_kid_who_was_told_no",
  "Both chase an unlikely dream through years of hearing no, and both have to keep believing in themselves when everyone suggests being realistic.")
P("friends/chandler_bing/afraid_of_commitment", "buffy/alexander_harris/fear_of_becoming_his_parents",
  "Both grew up inside a painful marriage and use humour as armour, and both panic as love becomes real for fear of repeating their parents' story.")
P("friends/chandler_bing/stuck_in_the_wrong_career", "the_office/jim_halpert/betting_on_the_dream",
  "Both drifted into a stable job they never loved, and both have to find the nerve to start over doing something that actually fits.")
P("friends/chandler_bing/stuck_in_the_wrong_career", "the_office/andy_bernard/chasing_a_dream_late",
  "Both spent years in a comfortable career they never cared about, and both have to decide whether leaving it for something real is courage or folly.")
P("friends/ross_geller/starting_over_after_divorce", "greys_anatomy/arizona_robbins/starting_over_single",
  "Both have to rebuild confidence and dating life after a marriage ends, while co-parenting with an ex they are still bound to.")
P("friends/ross_geller/starting_over_after_divorce", "greys_anatomy/derek_shepherd/starting_over_after_betrayal",
  "Both are blindsided when a spouse leaves for someone else, and both have to learn to trust love again without letting the betrayal define them.")
P("friends/ross_geller/afraid_of_being_left_again", "greys_anatomy/owen_hunt/distrusting_joy",
  "Both expect happiness to be taken away, and their fear and rash choices keep damaging the relationships they most want to keep.")

# ---------------- Money Heist ----------------
P("money_heist/the_professor/the_plan_versus_the_heart", "the_office/angela_martin/keeping_everything_under_control",
  "Both use rules and control to keep vulnerability at bay, and both have to decide whether honesty about their feelings is worth losing that control.")
P("money_heist/tokyo/running_from_the_past", "buffy/faith_lehane/looking_for_a_family",
  "Both have lost everything and act on impulse, and when a group finally offers them a place, their volatility keeps putting that belonging at risk.")
P("money_heist/tokyo/love_versus_freedom", "greys_anatomy/amelia_shepherd/marriage_and_the_tumor",
  "Both love someone who wants a settled future, and old grief makes them chafe against the very security the other person needs.")
P("money_heist/berlin/believing_in_love_again", "greys_anatomy/owen_hunt/distrusting_joy",
  "Both keep sabotaging real closeness, chasing drama or escape rather than risking the vulnerability of being truly known.")
P("money_heist/berlin/believing_in_love_again", "friends/chandler_bing/afraid_of_commitment",
  "Both crave love yet flinch from real intimacy, and both have to learn to stay when being known starts to feel dangerous.")
P("money_heist/nairobi/getting_her_son_back", "squid_game/seong_gi_hun/the_screw_up_who_wants_to_do_right",
  "Both lost their child's trust through bad choices made in hard circumstances, and both throw everything into one last chance to become the parent they meant to be.")
P("money_heist/nairobi/getting_her_son_back", "buffy/angel/unexpected_fatherhood",
  "Both love a child fiercely while their past keeps coming between them, and both carry shame and longing about the parent they have not been able to be.")
P("money_heist/nairobi/taking_charge", "game_of_thrones/sansa_stark/stepping_into_leadership",
  "Both have been underestimated and step up to lead when the person in charge makes choices they cannot accept, trying to claim authority without becoming what they opposed.")
P("money_heist/nairobi/taking_charge", "ted_lasso/keeley_jones/taken_seriously",
  "Both are warm, perceptive people others dismiss, and both discover a real talent for getting the best out of people once they claim the right to lead.")
P("money_heist/denver/his_fathers_son", "avatar/asami_sato/fathers_betrayal",
  "Both idolise the parent who raised them alone and learn that parent is not who they believed, torn between love and anger at the lie.")
P("money_heist/denver/unexpected_family", "walking_dead/glenn_rhee/love_in_the_worst_of_times",
  "Both find love in the most unlikely and dangerous circumstances, and both have to learn how to build a life together without any promise of safety.")
P("money_heist/rio/all_in_on_first_love", "buffy/buffy_summers/first_love_turns",
  "Both pour their whole heart into a first love with someone older and more experienced, and both learn how much a first love can wound.")
P("money_heist/raquel_murillo/trusting_again", "greys_anatomy/jo_wilson/learning_to_be_safe",
  "Both survived an abusive partner and are rebuilding their lives, and both have to learn to trust their own judgment when gentle love appears.")
P("money_heist/raquel_murillo/trusting_again", "game_of_thrones/sansa_stark/taking_her_life_back",
  "Both escaped abuse and have to reclaim their lives while others doubt them, deciding whether they can ever let themselves hope again.")
P("money_heist/helsinki/loving_a_guarded_heart", "schitts_creek/david_rose/letting_himself_be_loved",
  "Both are on either side of the same knot, loving or being loved by someone who hides old hurt behind sarcasm, where patience has to prove it will not be used and discarded.")
P("money_heist/helsinki/loving_a_guarded_heart", "naruto/sakura_haruno/loving_someone_who_pushes_you_away",
  "Both love someone closed off by old pain and have to decide how long to wait, how honest to be, and how to protect their own heart.")

# ---------------- My Hero Academia ----------------
P("my_hero_academia/izuku_midoriya/living_up_to_a_legacy", "avatar/tenzin/fathers_shadow",
  "Both try to become exactly the admired figure whose legacy they inherited, and both push themselves to breaking before learning to grow at their own pace.")
P("my_hero_academia/izuku_midoriya/living_up_to_a_legacy", "buffy/buffy_summers/reluctant_chosen_one",
  "Both are handed an enormous responsibility long before they have the skill for it, and both have to work out how to carry it without losing themselves.")
P("my_hero_academia/izuku_midoriya/carrying_it_alone", "buffy/wesley_wyndam_pryce/the_hard_call_alone",
  "Both decide that the only way to protect the people they love is to shoulder everything alone, and that choice cuts them off from the very help they need.")
P("my_hero_academia/izuku_midoriya/carrying_it_alone", "greys_anatomy/miranda_bailey/strong_one_asks_for_help",
  "Both feel responsible for everyone and stop letting anyone help, until their body gives out and they have to accept that they cannot carry it all.")
P("my_hero_academia/katsuki_bakugo/the_prodigy_meets_his_equals", "ted_lasso/jamie_tartt/from_star_to_teammate",
  "Both were praised for their talent so early that contempt for weaker people became a habit, and both have to discover that being part of something bigger is not a demotion.")
P("my_hero_academia/katsuki_bakugo/facing_the_person_he_hurt", "avatar/zuko/earning_trust_back",
  "Both come to see that the harm they did came from their own insecurity, and both have to swallow their pride to prove, through actions, that they have changed.")
P("my_hero_academia/katsuki_bakugo/facing_the_person_he_hurt", "stranger_things/steve_harrington/from_popular_jerk_to_protector",
  "Both realise they have been acting like a jerk to someone who didn't deserve it, and both have to move from pride to respect before an apology can mean anything.")
P("my_hero_academia/shoto_todoroki/refusing_his_fathers_half", "greys_anatomy/alex_karev/not_his_father",
  "Both were raised by a harsh parent and have built their identity around refusing to resemble them, haunted by the fear that the same thing lives inside them.")
P("my_hero_academia/ochaco_uraraka/working_for_her_family", "squid_game/ali_abdul/a_trusting_outsider",
  "Both chose their hard path mainly to provide for struggling family, and both fight to hold their own among people with far more advantages.")
P("my_hero_academia/ochaco_uraraka/working_for_her_family", "avatar/katara/fighting_to_be_taught",
  "Both push their way into places built for people with more natural advantages, determined to prove they belong there on their own merit.")
P("my_hero_academia/ochaco_uraraka/reaching_out_to_an_enemy", "walking_dead/rick_grimes/choosing_the_future_over_revenge",
  "Both choose compassion toward someone everyone else wants punished, because they suspect that condemnation alone is part of what created the harm.")
P("my_hero_academia/all_might/the_pillar_running_out_of_time", "greys_anatomy/miranda_bailey/strong_one_asks_for_help",
  "Both are the pillar everyone leans on, secretly running out of strength while smiling in public because they believe others need them to be unbreakable.")
P("my_hero_academia/all_might/finding_worth_beyond_strength", "game_of_thrones/jaime_lannister/losing_what_defined_him",
  "Both lose the one ability their whole identity rested on, and both have to find out who they are when they can no longer do the thing that made them special.")
P("my_hero_academia/all_might/finding_worth_beyond_strength", "ted_lasso/roy_kent/who_am_i_after_this",
  "Both feel the strength that defined them slipping away and insist they are fine, while quietly wondering whether their worth was ever more than their performance.")
P("my_hero_academia/shota_aizawa/tough_love_teacher", "stranger_things/jim_hopper/a_father_afraid_to_lose_again",
  "Both come across as harsh and controlling toward the young people in their care, and both are really driven by the terror of losing someone again.")
P("my_hero_academia/shota_aizawa/tough_love_teacher", "avatar/tenzin/teaching_his_opposite",
  "Both are strict teachers who refuse to sugarcoat anything, and both have to learn when protection becomes holding someone back.")
P("my_hero_academia/shota_aizawa/unexpected_guardian", "game_of_thrones/sandor_clegane/reluctant_guardian",
  "Both are guarded loners who never pictured themselves as caregivers, and both slowly learn a rough kind of tenderness for a hurting child in their care.")
P("my_hero_academia/tenya_iida/by_the_book_leader", "buffy/wesley_wyndam_pryce/never_good_enough",
  "Both were raised to believe that doing things correctly is the same as doing right, and both fall flat before learning what leading people really takes.")
P("my_hero_academia/tenya_iida/by_the_book_leader", "the_office/dwight_schrute/craving_authority",
  "Both love rules and order so much that they enforce them loudly on everyone, and both have to learn that leading means caring for people, not commanding them.")
P("my_hero_academia/tenya_iida/grief_and_revenge", "avatar/katara/revenge_or_release",
  "Both are good people whose hurt tempts them toward getting even, and both have to face what the anger is really about before it costs them who they are.")
P("my_hero_academia/tenya_iida/grief_and_revenge", "walking_dead/carol_peletier/grief_that_wants_someone_to_pay",
  "Both pour grief into a quiet vow to make the one responsible pay, and both find that the obsession starts endangering the people still around them.")
P("my_hero_academia/endeavor/forever_second_best", "ted_lasso/jamie_tartt/the_fathers_voice",
  "Both sit on either side of the same knot, a parent pouring their own hunger to win into a child who becomes a project rather than a person.")
P("my_hero_academia/endeavor/atoning_too_late", "avatar/toph_beifong/making_amends_as_a_parent",
  "Both finally see the damage their parenting did, and both try clumsily to make amends to children who have every right to stay angry.")
P("my_hero_academia/endeavor/atoning_too_late", "buffy/angel/atonement_for_the_past",
  "Both try to atone for real harm while knowing that wanting forgiveness is not the same as deserving it.")

# ---------------- Schitt's Creek ----------------
P("schitts_creek/johnny_rose/starting_over_from_zero", "avatar/iroh/from_power_to_peace",
  "Both lose the status they spent decades building, and both have to decide whether starting over with nothing is a humiliation or a second chance.")
P("schitts_creek/johnny_rose/starting_over_from_zero", "greys_anatomy/richard_webber/pushed_aside",
  "Both built their identity on success and are forced out of it late in life, and both have to find new ways to matter instead of clinging to the old ones.")
P("schitts_creek/johnny_rose/absent_father_to_cheerleader", "ted_lasso/ted_lasso/parenting_from_across_an_ocean",
  "Both parents provided more than they were present, and both wrestle with guilt over the childhood moments they missed while working.")
P("schitts_creek/johnny_rose/absent_father_to_cheerleader", "avatar/toph_beifong/making_amends_as_a_parent",
  "Both parents are forced into close quarters with grown children whose childhoods they missed, and both have to discover whether it is too late to become close.")
P("schitts_creek/moira_rose/clinging_to_former_glory", "buffy/cordelia_chase/from_fame_to_calling",
  "Both lose the money and the admiring audience that proved their worth, and both keep performing the old identity while finding new ways to matter.")
P("schitts_creek/moira_rose/clinging_to_former_glory", "stranger_things/steve_harrington/life_after_peaking_early",
  "Both are defined by an image from years ago, and both have to find a new sense of purpose when the old status is gone.")
P("schitts_creek/moira_rose/learning_to_mother", "my_hero_academia/endeavor/atoning_too_late",
  "Both were parents more absorbed in their own ambitions than their children, and both try, awkwardly and late, to show up for them as adults.")
P("schitts_creek/moira_rose/learning_to_mother", "avatar/toph_beifong/making_amends_as_a_parent",
  "Both were distant parents who left their children largely to themselves, and both have to find out whether real closeness can still grow.")
P("schitts_creek/david_rose/letting_himself_be_loved", "greys_anatomy/meredith_grey/letting_love_in",
  "Both expect every relationship to end badly and sabotage closeness before they can be hurt, until someone patient refuses to leave.")
P("schitts_creek/david_rose/building_his_own_thing", "ted_lasso/keeley_jones/taken_seriously",
  "Both have a strong eye that others dismiss as frivolous, and both have to prove it can build something serious and lasting.")
P("schitts_creek/david_rose/building_his_own_thing", "the_office/michael_scott/walking_away_to_start_over",
  "Both bet on themselves by starting something of their own with little more than stubbornness, and both have to find out whether others want what they offer.")
P("schitts_creek/alexis_rose/earning_her_own_way", "greys_anatomy/jackson_avery/beyond_the_family_name",
  "Both have always had money or charm opening doors, and both want desperately to be judged on what they can build by themselves.")
P("schitts_creek/alexis_rose/love_that_asks_something", "avatar/sokka/love_you_cant_keep",
  "Both learn that real love sometimes means accepting that the other person's path leads somewhere they cannot follow.")
P("schitts_creek/alexis_rose/love_that_asks_something", "money_heist/berlin/believing_in_love_again",
  "Both have treated romance as thrill or escape, and both have to discover whether they can love someone without needing to be rescued or admired.")
P("schitts_creek/stevie_budd/stuck_local_steps_up", "squid_game/kang_sae_byeok/the_loner_who_trusts_no_one",
  "Both keep everyone at arm's length to avoid being hurt, and both find that letting one person close may be the thing that changes their life.")
P("schitts_creek/stevie_budd/what_else_could_i_be", "buffy/alexander_harris/left_behind_after_school",
  "Both watch friends move forward while they feel stuck in the same place, and both wonder whether they settled for too little.")
P("schitts_creek/patrick_brewer/living_true_to_himself", "greys_anatomy/callie_torres/coming_out",
  "Both realise as adults that the life they were building never quite fit, and both have to say who they really are out loud, even to the people they love most.")
P("schitts_creek/patrick_brewer/living_true_to_himself", "stranger_things/will_byers/afraid_to_be_seen",
  "Both carry a truth about who they love that they are afraid to share, and both have to trust that honesty will not cost them everyone.")
P("schitts_creek/roland_schitt/petty_power_to_true_friend", "the_office/dwight_schrute/craving_authority",
  "Both love a title more than the work behind it and use what little power they have to feel important, until they learn that being relied on matters more.")
P("schitts_creek/roland_schitt/petty_power_to_true_friend", "the_office/michael_scott/wanting_to_be_liked_by_his_team",
  "Both are loud, tactless people in charge who crave recognition, and both have to discover that respect comes from generosity rather than from the role.")
P("schitts_creek/twyla_sands/kindness_despite_chaos", "buffy/willow_rosenberg/wallflower_finds_herself",
  "Both are the overlooked, dependable helper who shows up for everyone, and both have to discover what they want for themselves.")

# ---------------- Squid Game ----------------
P("squid_game/seong_gi_hun/the_crusade_against_the_system", "greys_anatomy/meredith_grey/breaking_rules_for_right_reasons",
  "Both set out to stop a system from harming the vulnerable, and both risk relationships and judgment for a mission that gives their guilt a purpose.")
P("squid_game/kang_sae_byeok/the_loner_who_trusts_no_one", "greys_anatomy/jo_wilson/learning_to_be_safe",
  "Both learned that trusting people gets you hurt and carry every burden alone, until survival starts to depend on letting someone close.")
P("squid_game/oh_il_nam/one_last_game", "naruto/jiraiya/a_life_measured_in_failures",
  "Both reach the end of a long life and have to ask what it actually meant, finding an unexpected friendship that makes them feel alive one more time.")
P("squid_game/ali_abdul/a_trusting_outsider", "ted_lasso/sam_obisanya/far_from_home",
  "Both are kind, grateful young people far from home and family, leaning on the few who are kind to them while learning who truly has their back.")
P("squid_game/hwang_jun_ho/searching_for_a_missing_brother", "naruto/itachi_uchiha/the_brother_who_chose_to_be_hated",
  "Both sit on either side of the same knot, the younger sibling who idolised an older one and the older sibling hiding a truth that could break that love.")
P("squid_game/ji_yeong/one_real_friend", "game_of_thrones/brienne_of_tarth/unlikely_bond",
  "Both have stopped expecting anything from people, and one person who actually sees them becomes worth more than they can say.")
P("squid_game/ji_yeong/one_real_friend", "naruto/gaara/the_boy_they_called_a_monster",
  "Both learned that the world has no place for them, and meeting a single person who shares their wounds changes what they believe their life is worth.")
P("squid_game/jang_deok_su/ruling_through_fear", "avatar/azula/ruling_by_fear",
  "Both keep people in line through intimidation because they are terrified of being abandoned, and both suspect the loyalty they demand is not real.")
P("squid_game/jang_deok_su/ruling_through_fear", "game_of_thrones/cersei_lannister/holding_on_at_any_cost",
  "Both answer every loss of control by dominating harder, and each ruthless move creates the enemies they fear most.")

# ---------------- Stranger Things ----------------
P("stranger_things/eleven/learning_what_a_friend_is", "naruto/gaara/the_boy_they_called_a_monster",
  "Both were treated as dangerous tools rather than children, and both have to learn that love does not have to be earned through obedience or power.")
P("stranger_things/eleven/who_am_i_without_it", "avatar/korra/healing_after_trauma",
  "Both built their worth on one extraordinary ability, and losing it forces them to face buried pain and ask who they are without it.")
P("stranger_things/eleven/who_am_i_without_it", "my_hero_academia/all_might/finding_worth_beyond_strength",
  "Both lose the power that made them feel needed, and both have to find a worth that does not depend on what they can do for others.")
P("stranger_things/mike_wheeler/refusing_to_give_up_on_a_friend", "naruto/naruto_uzumaki/never_giving_up_on_a_friend",
  "Both refuse to give up on someone everyone else has written off, and their stubborn loyalty holds the group together while straining it.")
P("stranger_things/mike_wheeler/afraid_of_not_being_needed", "doctor_who/rory_williams/in_someone_elses_shadow",
  "Both feel ordinary next to someone extraordinary they love, and the fear of being unnecessary makes them hold back what they feel.")
P("stranger_things/mike_wheeler/afraid_of_not_being_needed", "avatar/sokka/ordinary_among_gifted",
  "Both are the planner of a group full of remarkable people, and both worry that without a special gift they have nothing real to offer.")
P("stranger_things/will_byers/nobody_understands_what_i_went_through", "greys_anatomy/cristina_yang/after_the_trauma",
  "Both are expected to go back to normal after something terrifying, and both hide what is happening inside them so no one will treat them as broken.")
P("stranger_things/dustin_henderson/an_unlikely_big_brother", "naruto/jiraiya/the_reluctant_father_figure",
  "Both are about an awkward mentorship between a young person who is easily overlooked and an older figure who never expected to care, which grows into real family.")
P("stranger_things/dustin_henderson/an_unlikely_big_brother", "game_of_thrones/sandor_clegane/reluctant_guardian",
  "Both start as an unlikely alliance with an older, fallen figure, and trading jokes and hard lessons slowly turns it into a bond neither expected.")
P("stranger_things/dustin_henderson/standing_by_a_misjudged_friend", "naruto/naruto_uzumaki/never_giving_up_on_a_friend",
  "Both stand by a friend everyone else has decided is a lost cause, refusing to go along with the crowd even when loyalty is frightening.")
P("stranger_things/dustin_henderson/standing_by_a_misjudged_friend", "greys_anatomy/meredith_grey/breaking_rules_for_right_reasons",
  "Both refuse to let a community sacrifice someone vulnerable, and both risk their own standing to defend a person no one else will.")
P("stranger_things/max_mayfield/belonging_while_home_is_unsafe", "buffy/faith_lehane/looking_for_a_family",
  "Both come from a frightening home, act tough and flippant, and ache to be let into a group that already seems to have everything they lack.")
P("stranger_things/max_mayfield/belonging_while_home_is_unsafe", "squid_game/kang_sae_byeok/the_loner_who_trusts_no_one",
  "Both are used to handling everything alone because home was never safe, and both have to learn to let people have their back.")
P("stranger_things/max_mayfield/grief_she_cant_say_out_loud", "buffy/buffy_summers/finding_reason_to_live",
  "Both are consumed by a darkness after a loss, insisting they are fine and shutting out everyone who tries to help.")
P("stranger_things/joyce_byers/the_mother_no_one_believes", "game_of_thrones/samwell_tarly/dream_institution",
  "Both know something urgent that the people in charge dismiss, and both have to decide how far to push when everyone treats them as the problem.")
P("stranger_things/joyce_byers/loving_without_holding_back", "avatar/toph_beifong/breaking_out_of_the_cage",
  "Both sit on either side of the same knot, a family so afraid of harm that they cannot see how capable their child has already become.")
P("stranger_things/jim_hopper/numbing_a_grief_he_wont_face", "naruto/tsunade/the_healer_who_stopped_believing",
  "Both walked away from caring after losing someone they loved, numbing the grief with drink and cynicism until someone else's crisis drags them back.")
P("stranger_things/steve_harrington/from_popular_jerk_to_protector", "buffy/cordelia_chase/popularity_or_real_friends",
  "Both break from a shallow crowd and lose their standing for it, discovering that the people they once looked down on are the ones worth having.")

# ---------------- Ted Lasso ----------------
P("ted_lasso/ted_lasso/leading_without_knowing_the_rules", "game_of_thrones/daenerys_targaryen/finding_her_voice",
  "Both are dropped among strangers whose language and customs they don't know, and both earn respect by listening and believing in people rather than faking expertise.")
P("ted_lasso/ted_lasso/leading_without_knowing_the_rules", "avatar/aang/values_under_pressure",
  "Both bet on kindness in a world that keeps telling them it is naive, and both have to find out whether decency can hold up under pressure.")
P("ted_lasso/rebecca_welton/from_revenge_to_healing", "buffy/anya_jenkins/owning_her_life",
  "Both answer a humiliating betrayal by reaching for vengeance, and both find it brings guilt instead of the satisfaction they wanted.")
P("ted_lasso/rebecca_welton/letting_herself_want_again", "greys_anatomy/meredith_grey/living_again_after_loss",
  "Both are unsure whether they still want love or whether it is too late, and both have to let themselves want something again.")
P("ted_lasso/roy_kent/who_am_i_after_this", "naruto/rock_lee/when_your_body_fails_you",
  "Both built their whole identity on physical excellence, and both have to face who they are when their body can no longer deliver.")
P("ted_lasso/roy_kent/letting_someone_in", "greys_anatomy/alex_karev/tough_guy_softens",
  "Both treat vulnerability as weakness and hide behind a tough exterior, until someone sees straight through it and asks them to stay open.")
P("ted_lasso/roy_kent/leading_the_ones_he_once_fought", "naruto/shikamaru_nara/reluctant_leader",
  "Both would rather keep their heads down, yet the group keeps looking to them, and both learn leadership means taking responsibility for others.")
P("ted_lasso/keeley_jones/choosing_herself", "the_office/erin_hannon/learning_she_deserves_better",
  "Both are warm people who tolerate being taken for granted in love, and both learn to name what they need and walk away when it is missing.")
P("ted_lasso/jamie_tartt/the_fathers_voice", "avatar/zuko/fathers_approval",
  "Both are gifted young people driven by a harsh parent's approval, and both have to separate who they are from who they were raised to be.")
P("ted_lasso/jamie_tartt/from_star_to_teammate", "avatar/korra/hothead_in_training",
  "Both are talented stars who have always been told they are special, and both learn that humility and teamwork make them stronger rather than smaller.")
P("ted_lasso/nate_shelley/hungry_to_be_seen", "walking_dead/eugene_porter/safety_at_what_price",
  "Both have never felt valued and are seduced by someone who offers status and importance, turning their back on the people who were truly kind to them.")
P("ted_lasso/sam_obisanya/far_from_home", "game_of_thrones/jon_snow/looking_for_belonging",
  "Both leave home hoping for a fresh start and feel lonely and out of their depth, until people who make them feel seen help them find their feet.")

# ---------------- The Office ----------------
P("the_office/michael_scott/wanting_to_be_liked_by_his_team", "naruto/naruto_uzumaki/earning_acknowledgement",
  "Both cover loneliness with noise and a desperate need to be liked, and both have to discover that real respect cannot be demanded.")
P("the_office/michael_scott/longing_for_someone_to_come_home_to", "friends/monica_geller/wanting_a_family",
  "Both have wanted a family of their own since childhood, and both watch relationships fall short of that dream while trying not to give up on it.")
P("the_office/michael_scott/longing_for_someone_to_come_home_to", "greys_anatomy/owen_hunt/wanting_a_family",
  "Both long for a family so much that they keep choosing partners who can't give it to them, and both have to learn the difference between being wanted and being loved.")
P("the_office/michael_scott/walking_away_to_start_over", "greys_anatomy/richard_webber/pushed_aside",
  "Both gave years of devotion to one workplace only to be quietly managed out, and both have to find out what their self-respect is worth.")
P("the_office/jim_halpert/betting_on_the_dream", "greys_anatomy/derek_shepherd/sacrifice_and_resentment",
  "Both face the collision between a once-in-a-lifetime opportunity and a shared family life, and both have to reckon with what the choice asks of the person they love.")
P("the_office/pam_beesly/finding_her_voice", "buffy/willow_rosenberg/wallflower_finds_herself",
  "Both are shy, overlooked people who slowly discover their talents, their voice and their own desires.")
P("the_office/pam_beesly/testing_the_dream_once_its_real", "game_of_thrones/samwell_tarly/dream_institution",
  "Both finally reach the path they always dreamed of and find it nothing like they pictured, and both have to decide whether stepping back means failure.")
P("the_office/pam_beesly/testing_the_dream_once_its_real", "breaking_bad/kim_wexler/climbing_on_her_own_terms",
  "Both reach the career they fought for and start to wonder whether it is actually the one they want, separating what they are good at from what they love.")
P("the_office/pam_beesly/holding_it_together_alone", "ted_lasso/ted_lasso/parenting_from_across_an_ocean",
  "Both sit on either side of the same knot, the one who goes after a big opportunity far away and the one left holding everything together at home.")
P("the_office/pam_beesly/holding_it_together_alone", "greys_anatomy/derek_shepherd/sacrifice_and_resentment",
  "Both are caught in a marriage where one person's dream has to be paid for by the other, and resentment and guilt build on both sides.")
P("the_office/andy_bernard/needing_everyone_to_like_him", "avatar/bolin/little_brother_finding_his_worth",
  "Both grew up feeling second-best in their family, and both try on whatever identity might finally make people take them seriously.")
P("the_office/andy_bernard/needing_everyone_to_like_him", "ted_lasso/nate_shelley/hungry_to_be_seen",
  "Both are overlooked children still chasing approval as adults, and beneath the eagerness sits a temper and a fear of never being enough.")
P("the_office/andy_bernard/chasing_a_dream_late", "buffy/rupert_giles/when_theyre_grown",
  "Both leave a stable role behind to try something new in midlife, and both have to face what is left of them if the new venture fails in public.")
P("the_office/ryan_howard/in_a_hurry_to_be_somebody", "buffy/willow_rosenberg/power_becomes_addiction",
  "Both grab at the thing that finally makes them feel important, and both cope with the pressure in ways that cost them the trust of the people around them.")
P("the_office/ryan_howard/in_a_hurry_to_be_somebody", "squid_game/cho_sang_woo/the_golden_boy_who_fell",
  "Both are convinced they were meant for something bigger and cut corners on the way up, until the gap between looking successful and being ready becomes a fall.")
P("the_office/ryan_howard/reinventing_instead_of_growing_up", "bojack/todd_chavez/drifting_on_a_friends_couch",
  "Both drift from project to project without committing to anything, leaning on other people's goodwill to stay afloat.")
P("the_office/ryan_howard/reinventing_instead_of_growing_up", "stranger_things/steve_harrington/life_after_peaking_early",
  "Both are stuck on an old image of who they were supposed to be, and both have to stop reinventing and start growing up.")
P("the_office/erin_hannon/looking_for_family_at_work", "game_of_thrones/jon_snow/looking_for_belonging",
  "Both have always felt like outsiders to family, and both pour their loyalty into the people around them in the hope of being chosen back.")
P("the_office/erin_hannon/learning_she_deserves_better", "naruto/sakura_haruno/loving_someone_who_pushes_you_away",
  "Both keep waiting to be chosen by someone who takes them for granted, and both have to decide when devotion becomes self-neglect.")
P("the_office/angela_martin/keeping_everything_under_control", "avatar/lin_beifong/duty_above_all",
  "Both keep everyone at a distance with rules and impossible standards, because control feels safer than the vulnerability of letting someone close.")
P("the_office/angela_martin/starting_over_from_the_bottom", "game_of_thrones/jaime_lannister/losing_what_defined_him",
  "Both are proud people who, after a fall, must depend on someone they once looked down on, and both are humbled into seeing how they treated others.")
P("the_office/angela_martin/starting_over_from_the_bottom", "schitts_creek/moira_rose/clinging_to_former_glory",
  "Both lose the respectable image they built their identity on, and both have to accept kindness from people they once dismissed.")

# ---------------- The Walking Dead ----------------
P("walking_dead/rick_grimes/carrying_everyones_survival", "attack_on_titan/erwin_smith/a_dream_worth_the_cost",
  "Both carry responsibility for everyone's survival, and both fear that the decisions it demands are turning them into someone they don't recognise.")
P("walking_dead/rick_grimes/coming_home_changed", "greys_anatomy/derek_shepherd/starting_over_after_betrayal",
  "Both are caught in a marriage and a lifelong friendship tested by what happened while they were gone, and both have to decide whether honesty and forgiveness can hold.")
P("walking_dead/rick_grimes/coming_home_changed", "friends/ross_geller/starting_over_after_divorce",
  "Both believed their family life was settled and discover it has moved on without them, leaving them to rebuild trust from the ground up.")
P("walking_dead/rick_grimes/choosing_the_future_over_revenge", "naruto/naruto_uzumaki/grief_and_the_cycle_of_hatred",
  "Both have every reason to make the one who took someone from them suffer, and both choose to break the cycle of hatred for the sake of a future.")
P("walking_dead/daryl_dixon/outsider_finds_a_family", "greys_anatomy/alex_karev/tough_guy_softens",
  "Both grew up in neglect and chaos, walled off and certain they were worthless, until people who believe in them show them who they could be.")
P("walking_dead/daryl_dixon/learning_to_stay", "naruto/jiraiya/the_reluctant_father_figure",
  "Both are lifelong loners who avoid commitment, and when a young person starts relying on them they have to decide whether to stay and be counted on.")
P("walking_dead/carol_peletier/from_meek_to_formidable", "game_of_thrones/sansa_stark/taking_her_life_back",
  "Both survived abuse by making themselves small, and once free they discover how capable and clear-eyed they really are.")
P("walking_dead/carol_peletier/from_meek_to_formidable", "game_of_thrones/daenerys_targaryen/finding_her_voice",
  "Both were once treated as something to be controlled, and both slowly discover they can command respect while trying to keep their tenderness.")
P("walking_dead/carol_peletier/grief_that_wants_someone_to_pay", "game_of_thrones/arya_stark/list_of_names",
  "Both pour a loss too deep to bear into making someone pay, and both have to face whether revenge can bring the peace they want.")
P("walking_dead/glenn_rhee/finding_his_own_voice", "avatar/aang/values_under_pressure",
  "Both hold on to kindness and their own values while those around them harden, and both have to find the voice to say so.")
P("walking_dead/glenn_rhee/finding_his_own_voice", "naruto/hinata_hyuga/courage_when_family_gave_up",
  "Both are used to being useful but never listened to, and both find their voice once someone believes in them.")
P("walking_dead/glenn_rhee/love_in_the_worst_of_times", "avatar/sokka/love_you_cant_keep",
  "Both find a serious love in the middle of danger and feel it is their job to protect that person, with no promise that the future will allow it.")
P("walking_dead/maggie_greene/stepping_out_of_her_fathers_world", "avatar/toph_beifong/breaking_out_of_the_cage",
  "Both have lived inside a protective parent's view of the world, and both have to choose their own path without losing their family.")
P("walking_dead/maggie_greene/leading_through_grief", "naruto/tsunade/sending_loved_ones_into_danger",
  "Both lead others while carrying fresh grief, and both have to make decisions for people who depend on them without letting loss steer everything.")
P("walking_dead/michonne/letting_people_back_in", "greys_anatomy/meredith_grey/living_again_after_loss",
  "Both have decided that love is too dangerous after losing everything, and both have to risk wanting a future again when someone new offers a place.")
P("walking_dead/michonne/letting_people_back_in", "naruto/tsunade/the_healer_who_stopped_believing",
  "Both walled themselves off after devastating loss, and a young person who looks up to them slowly pulls them back into caring.")
P("walking_dead/michonne/the_guarded_protector", "game_of_thrones/cersei_lannister/a_mother_fighting_for_control",
  "Both decide that anyone outside the family is a threat, and both have to ask whether shutting everyone out is really keeping their children safe.")
P("walking_dead/michonne/the_guarded_protector", "stranger_things/jim_hopper/a_father_afraid_to_lose_again",
  "Both have been hurt so badly that protection turns into closing every door, and both have to learn to keep their family safe without isolating them.")
P("walking_dead/carl_grimes/growing_up_too_fast", "naruto/shikamaru_nara/losing_a_mentor",
  "Both are young people who learn too early that no one can keep them safe, and both have to decide what to do with grief and anger that ages them overnight.")
P("walking_dead/carl_grimes/growing_up_too_fast", "avatar/aang/reluctant_chosen_one",
  "Both are asked to carry adult burdens long before they are ready, and both fear losing the child they still are.")
P("walking_dead/carl_grimes/choosing_hope", "naruto/naruto_uzumaki/grief_and_the_cycle_of_hatred",
  "Both have seen the worst in people and still choose to believe that enemies can one day become neighbours.")
P("walking_dead/carl_grimes/choosing_hope", "avatar/aang/values_under_pressure",
  "Both hold on to an idealism the adults around them call naive, standing up for mercy when everyone they respect wants something harder.")
P("walking_dead/eugene_porter/worth_more_than_a_title", "avatar/sokka/ordinary_among_gifted",
  "Both feel they bring nothing special among capable people and overcompensate, until they discover what they actually have to offer.")


# ---------------- coverage top-ups ----------------
P("friends/joey_tribbiani/chasing_the_big_break", "naruto/rock_lee/hard_work_vs_talent",
  "Both are mocked for chasing something they seem unsuited to, and both keep going on sheer stubborn belief while the rejections pile up.")
P("money_heist/rio/all_in_on_first_love", "walking_dead/glenn_rhee/love_in_the_worst_of_times",
  "Both are underestimated young people who find their first serious love under enormous pressure, and both give everything to it without any promise of a future.")


# ---------------- write ----------------
def main():
    seen, out = set(), []
    for s, t, b in PAIRS:
        key = frozenset((s, t))
        if key in seen:
            print("skipping duplicate pair:", s, t)
            continue
        seen.add(key)
        out.append({"source": s, "target": t, "bridge": b})
    path = os.path.join(HERE, "resonances_extra.json")
    with open(path, "w") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"wrote {len(out)} pairs to {path}")


if __name__ == "__main__":
    main()

"""Build resonances_extra_round3.json: RESONATES_WITH links for arcs of the 10 round-3 shows.

Edit the P(...) lines below, then run:
    python3 graph/build_resonances_extra_round3.py
    cd graph && python3 validate_resonances_extra.py resonances_extra_round3.json arc_index_new_round3.txt
Ids are written without the leading "arc:" (added automatically).
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
PAIRS = []


def P(source, target, bridge):
    PAIRS.append(("arc:" + source, "arc:" + target, bridge))


# ---------------- Arcane ----------------
P("arcane/vi/holding_everyone_together", "avatar/katara/parentified_caretaker",
  "Both became the parent of the family far too young, holding everyone together while their own anger and exhaustion go unseen.")
P("arcane/vi/holding_everyone_together", "squid_game/kang_sae_byeok/the_loner_who_trusts_no_one",
  "Both carry a younger sibling and a rigged world on their shoulders alone, convinced that nobody else can be trusted to keep the people they love safe.")
P("arcane/vi/searching_for_her_sister", "my_hero_academia/shoto_todoroki/reaching_for_family",
  "Both reach for a sibling who was damaged by the same past and has grown into someone dangerous, trying to hold love and accountability in the same hand.")
P("arcane/vi/searching_for_her_sister", "game_of_thrones/arya_stark/the_other_sister",
  "Both are thrown back together with a sister after years of separate hardships and have to find out whether the hurt between them can be crossed.")
P("arcane/powder/desperate_to_be_useful", "walking_dead/eugene_porter/worth_more_than_a_title",
  "Both believe they will only be kept if they prove themselves useful, and every failure feels like the moment they will finally be left behind.")
P("arcane/powder/desperate_to_be_useful", "buffy/dawn_summers/earning_her_place",
  "Both are the youngest, treated as someone to protect rather than someone who can help, and ache to be seen as more than a burden.")
P("arcane/jayce_talis/dream_called_reckless", "parks_and_rec/ben_wyatt/living_down_a_youthful_failure",
  "Both were publicly humiliated for betting everything on a young idea and have to decide whether they dare to believe in something again.")
P("arcane/jayce_talis/dream_called_reckless", "buffy/wesley_wyndam_pryce/never_good_enough",
  "Both are cast out after a public failure and rebuild from nothing, earning back the respect they once assumed their talent guaranteed.")
P("arcane/jayce_talis/when_success_changes_you", "breaking_bad/jimmy_mcgill/the_mask_that_becomes_the_man",
  "Both keep getting rewarded for the shortcuts they swore off, and slowly drift from the person who first set out with good intentions.")
P("arcane/viktor/overlooked_genius_finds_a_partner", "game_of_thrones/samwell_tarly/courage_his_own_way",
  "Both are quiet, easily dismissed minds whose real strength is how they think, and one loyal companion changes what they believe they are worth.")
P("arcane/viktor/overlooked_genius_finds_a_partner", "mad_men/peggy_olson/from_the_typing_pool_to_the_table",
  "Both come from modest beginnings into a world that expects them to stay in the background, and risk their small foothold to back the talent nobody else sees.")
P("arcane/viktor/racing_the_clock", "breaking_bad/walter_white/the_overlooked_man_wants_his_due",
  "Both are handed a deadline on their life and pour their gifts into a work that finally makes them feel significant, whatever it costs the people around them.")
P("arcane/caitlyn_kiramman/privileged_idealist", "friends/rachel_green/building_a_life_of_her_own",
  "Both walk away from the comfortable future their family planned and have to prove, mostly to themselves, that they can do real work in a harder world.")
P("arcane/caitlyn_kiramman/privileged_idealist", "greys_anatomy/jackson_avery/beyond_the_family_name",
  "Both want to be judged on their own merit while the power of their family keeps opening doors and casting shadows they have to learn to see.")
P("arcane/caitlyn_kiramman/grief_wants_someone_to_pay", "walking_dead/maggie_greene/leading_through_grief",
  "Both are handed power in the rawest days of grief, and their anger at the one they blame starts steering every decision and straining every friendship.")
P("arcane/caitlyn_kiramman/grief_wants_someone_to_pay", "fma/roy_mustang/when_grief_becomes_vengeance",
  "Both look composed from the outside while grief quietly turns into a single-minded hunt for someone to punish, eroding the values they once lived by.")
P("arcane/silco/an_old_wound_as_a_mission", "fma/scar/consumed_by_revenge",
  "Both carry a grievance that began in real injustice and has swallowed everything else they were, until the cause and the wound are impossible to separate.")
P("arcane/vander/keeping_the_peace", "breaking_bad/mike_ehrmantraut/living_for_his_granddaughter",
  "Both pour everything into protecting the young ones left in their care while keeping a violent part of their own past locked away from them.")
P("arcane/ekko/growing_up_too_fast", "walking_dead/carl_grimes/growing_up_too_fast",
  "Both are children forced to carry adult danger and loss long before they are ready, trying to hold on to who they are while life hardens them.")
P("arcane/ekko/growing_up_too_fast", "naruto/shikamaru_nara/losing_a_mentor",
  "Both lose the older figure who sheltered them and suddenly become the one others rely on, with no time to grieve what they lost.")
P("arcane/ekko/the_life_he_could_have_had", "game_of_thrones/jon_snow/love_duty_and_identity",
  "Both are torn between a love that offers them rest and the people who depend on them, and have to decide what they owe themselves versus what they owe others.")
P("arcane/ekko/the_life_he_could_have_had", "buffy/buffy_summers/reluctant_chosen_one",
  "Both carry a responsibility that cuts them off from the ordinary happiness everyone else seems to get, and keep being tempted by a life where they could simply set it down.")

# ---------------- Brooklyn Nine-Nine ----------------
P("brooklyn_99/jake_peralta/the_case_of_growing_up", "parks_and_rec/andy_dwyer/growing_up_after_being_left",
  "Both are lovable kids at heart who have to become reliable adults without losing the joy that makes people love them.")
P("brooklyn_99/jake_peralta/falling_for_his_rival", "avatar/asami_sato/rival_to_closest_friend",
  "Both start out as rivals trying to outdo each other and slowly discover that the person who knows all their flaws is the one they most want close.")
P("brooklyn_99/jake_peralta/falling_for_his_rival", "the_good_place/chidi_anagonye/loving_his_opposite",
  "Both fall for their complete opposite, and loving them means risking the vulnerability they have always avoided.")
P("brooklyn_99/raymond_holt/earning_the_command", "game_of_thrones/brienne_of_tarth/proving_herself",
  "Both spent years being underestimated for who they are, and pour themselves into a role that was never meant for them with iron discipline and no room for error.")
P("brooklyn_99/raymond_holt/earning_the_command", "mad_men/joan_holloway/fighting_to_be_taken_seriously",
  "Both have earned a seat the system kept denying them and have to decide how to hold power without becoming as closed-off as the people who held them back.")
P("brooklyn_99/raymond_holt/letting_feelings_show", "ted_lasso/roy_kent/letting_someone_in",
  "Both equate vulnerability with weakness and have to learn, late and awkwardly, to show affection and admit hurt to the people they love.")
P("brooklyn_99/amy_santiago/chasing_approval_and_the_top_job", "friends/monica_geller/never_good_enough_for_mom",
  "Both grew up competing for a parent's attention among siblings and cope with the fear of not being enough by controlling every detail and needing to win.")
P("brooklyn_99/amy_santiago/chasing_approval_and_the_top_job", "my_hero_academia/tenya_iida/by_the_book_leader",
  "Both believe that doing everything correctly is how you earn your place, and have to learn to trust their own judgement when the rules and the right thing part ways.")
P("brooklyn_99/rosa_diaz/walls_up", "walking_dead/michonne/letting_people_back_in",
  "Both keep the world at arm's length with toughness and silence, and slowly let in the people who keep showing up anyway.")
P("brooklyn_99/rosa_diaz/walls_up", "the_good_place/eleanor_shellstrop/letting_people_in",
  "Both learned early that they had to handle everything alone, and have to find out whether letting others matter is worth the risk of being hurt.")
P("brooklyn_99/rosa_diaz/telling_her_family_who_she_is", "greys_anatomy/callie_torres/coming_out",
  "Both come out to traditional parents whose approval matters desperately, and must decide whether to live honestly even if their family never accepts them.")
P("brooklyn_99/rosa_diaz/telling_her_family_who_she_is", "sex_education/eric_effiong/being_himself_out_loud",
  "Both long to belong to a family and a culture that may not fully accept who they love, and refuse to choose between parts of themselves.")
P("brooklyn_99/terry_jeffords/afraid_to_get_hurt", "breaking_bad/hank_schrader/the_tough_guy_who_cant_admit_fear",
  "Both are strong people whose identity rests on being unshakeable, suddenly frozen by a fear they are ashamed to let anyone see.")
P("brooklyn_99/terry_jeffords/afraid_to_get_hurt", "gilmore_girls/sookie_st_james/panicking_at_every_big_step",
  "Both are completely confident in their work but thrown into panic by the new stakes of family life, and have to name the fear instead of acting it out.")
P("brooklyn_99/terry_jeffords/speaking_up_at_a_cost", "ted_lasso/sam_obisanya/doing_the_right_thing",
  "Both are well-liked people who could stay comfortable by staying quiet, and choose to speak against an injustice even when the backlash becomes personal.")
P("brooklyn_99/terry_jeffords/speaking_up_at_a_cost", "greys_anatomy/meredith_grey/breaking_rules_for_right_reasons",
  "Both put a career they worked for on the line to stand against a system that fails people, knowing their families will share the fallout.")
P("brooklyn_99/charles_boyle/loving_too_hard", "bojack/mr_peanutbutter/learning_to_be_alone",
  "Both love big and fast to avoid the loneliness underneath, and have to learn to be with themselves before they can love without clinging.")
P("brooklyn_99/charles_boyle/loving_too_hard", "greys_anatomy/callie_torres/loving_someone_who_doesnt_choose_you",
  "Both rush into devotion hoping it will secure their place, and have to face whether the person they cling to is really choosing them back.")
P("brooklyn_99/charles_boyle/becoming_a_father", "money_heist/denver/unexpected_family",
  "Both step up to be a parent to a child who isn't biologically theirs and wrestle with the fear that the bond won't be as real.")
P("brooklyn_99/gina_linetti/meant_for_more", "doctor_who/donna_noble/just_a_temp",
  "Both are sharp, loud people settled in jobs beneath them, who discover how much more they are once someone finally believes in them.")
P("brooklyn_99/gina_linetti/meant_for_more", "sex_education/maeve_wiley/the_gifted_outsider",
  "Both hide real brilliance behind a pose of not caring, and a mentor's push forces them to decide whether to risk wanting a bigger future.")

# ---------------- Dark ----------------
P("dark/jonas_kahnwald/searching_for_why", "naruto/kakashi_hatake/making_peace_with_a_disgraced_father",
  "Both are marked by a parent's death that no one would explain, and spend years trying to understand the choice that left them behind.")
P("dark/jonas_kahnwald/first_love_and_best_friend", "avatar/sokka/love_you_cant_keep",
  "Both love someone who loves them back while forces far bigger than either of them keep pulling the relationship apart.")
P("dark/jonas_kahnwald/first_love_and_best_friend", "sex_education/otis_milburn/falling_for_his_business_partner",
  "Both keep reaching for the same person through bad timing, loyalty to others and missed moments, wondering whether loving someone is enough to make it work.")
P("dark/jonas_kahnwald/taking_it_on_himself", "attack_on_titan/eren_yeager/pushing_everyone_away",
  "Both decide the catastrophe around them is theirs alone to carry, and wrestle with whether their path is a free choice or one laid down long before them.")
P("dark/jonas_kahnwald/taking_it_on_himself", "fma/edward_elric/carrying_the_blame_alone",
  "Both throw every choice into undoing a terrible past on their own, refusing help, and have to learn the difference between responsibility and self-punishment.")
P("dark/martha_nielsen/torn_between_two_boys", "gilmore_girls/lorelai_gilmore/letting_someone_all_the_way_in",
  "Both are caught between the old flame everyone expects and the steady person who is there, and must choose honestly rather than let others decide for them.")
P("dark/martha_nielsen/choosing_her_own_path", "attack_on_titan/historia/choosing_her_own_path",
  "Both discover that powerful people have scripted their life and expect them to play a part, and have to claim the right to choose their own purpose.")
P("dark/martha_nielsen/choosing_her_own_path", "naruto/neji_hyuga/breaking_free_from_fate",
  "Both are told their future was settled before they had any say, and have to find out whether a life decided by others can still become their own.")
P("dark/ulrich_nielsen/a_father_who_wont_stop_searching", "squid_game/hwang_jun_ho/searching_for_a_missing_brother",
  "Both go after a missing family member alone when those in authority won't take it seriously, breaking every rule as the search becomes an obsession.")
P("dark/ulrich_nielsen/a_father_who_wont_stop_searching", "stranger_things/joyce_byers/the_mother_no_one_believes",
  "Both are parents certain of something about a vanished child that nobody else will accept, risking their reputation and relationships on it.")
P("dark/ulrich_nielsen/living_a_double_life", "breaking_bad/walter_white/the_double_life_at_home",
  "Both keep a second life hidden from their family, telling themselves it is separate, until a crisis makes the split impossible to hold.")
P("dark/ulrich_nielsen/living_a_double_life", "mad_men/pete_campbell/the_life_he_thought_he_wanted",
  "Both feel trapped inside the family life they built and look for escape elsewhere, careless of the people they hurt along the way.")
P("dark/charlotte_doppler/keeping_order_when_nothing_makes_sense", "avatar/lin_beifong/duty_above_all",
  "Both are the composed authority everyone relies on in a crisis, and their job is armour that keeps them from asking what is wrong at home.")
P("dark/charlotte_doppler/keeping_order_when_nothing_makes_sense", "walking_dead/carol_peletier/the_weight_of_being_strong",
  "Both have been the steady, capable one for so long that nobody notices the cost, least of all the people closest to them.")
P("dark/charlotte_doppler/where_she_comes_from", "bojack/hollyhock/searching_for_where_she_comes_from",
  "Both carry the ache of not knowing the people who made them, and wonder whether finding out will change who their family really is.")
P("dark/hannah_kahnwald/wanting_what_isnt_hers", "the_good_place/janet/feelings_she_wasnt_built_for",
  "Both are overwhelmed by a love for someone who chooses differently, and struggle with jealousy and the pain of not being the one picked.")
P("dark/hannah_kahnwald/starting_over_alone", "bojack/mr_peanutbutter/learning_to_be_alone",
  "Both keep starting over only to rebuild the same relationship patterns, because the fresh start never includes facing themselves.")
P("dark/claudia_tiedemann/career_before_family", "avatar/toph_beifong/making_amends_as_a_parent",
  "Both are formidable parents whose absence and hardness left a child hurting, and have to face that damage while wondering if it is too late to repair.")
P("dark/claudia_tiedemann/career_before_family", "schitts_creek/johnny_rose/absent_father_to_cheerleader",
  "Both spent their child's early years chasing work instead of being present, and only later see the distance they created.")
P("dark/claudia_tiedemann/whatever_it_takes_for_her_daughter", "breaking_bad/skyler_white/complicit_to_protect_her_kids",
  "Both cross their own moral lines telling themselves it is all for their child, until the love starts to justify any means.")
P("dark/claudia_tiedemann/whatever_it_takes_for_her_daughter", "game_of_thrones/cersei_lannister/a_mother_fighting_for_control",
  "Both pour a fierce, all-consuming protectiveness into a child and have to face what that love is actually protecting.")
P("dark/katharina_nielsen/holding_the_family_together", "greys_anatomy/derek_shepherd/starting_over_after_betrayal",
  "Both discover a spouse's affair with a close friend and have to keep functioning while the ground of their marriage gives way.")
P("dark/katharina_nielsen/going_back_for_her_family", "greys_anatomy/alex_karev/not_his_father",
  "Both have spent a lifetime escaping a violent parent and are forced back into that parent's orbit, where old fear meets their fiercest love.")
P("dark/katharina_nielsen/going_back_for_her_family", "ted_lasso/jamie_tartt/the_fathers_voice",
  "Both must finally stand in front of the parent who taught them fear and decide what to do with a lifetime of hurt.")
P("dark/regina_tiedemann/old_wounds_that_never_healed", "bojack/bojack_horseman/still_waiting_for_his_mother",
  "Both are adults still shaped by a parent who gave criticism instead of love, waiting for an apology that may never come.")
P("dark/regina_tiedemann/old_wounds_that_never_healed", "sex_education/ruby_matthews/starting_over_without_a_crown",
  "Both still carry childhood humiliation, and when the person who hurt them crosses their path again they must choose between old resentment and something harder.")
P("dark/regina_tiedemann/holding_on_while_everything_slips", "greys_anatomy/miranda_bailey/strong_one_asks_for_help",
  "Both are self-reliant people whose bodies and circumstances give way at once, forcing them to accept that they need care.")
P("dark/regina_tiedemann/holding_on_while_everything_slips", "sex_education/jean_milburn/when_the_helper_needs_help",
  "Both insist they are coping as health, money and family strain together, and have to learn to lean on people they have kept at a distance.")

# ---------------- Fullmetal Alchemist ----------------
P("fma/edward_elric/anger_at_an_absent_father", "brooklyn_99/jake_peralta/the_case_of_growing_up",
  "Both grew up in the shadow of a parent who simply left, and defined themselves against that absence long before they could hear the other side.")
P("fma/edward_elric/anger_at_an_absent_father", "money_heist/denver/his_fathers_son",
  "Both have to reconcile the family story they grew up with and a parent more complicated than the one they blamed or idolised.")
P("fma/edward_elric/working_for_a_system_you_distrust", "breaking_bad/mike_ehrmantraut/the_professional_with_a_code",
  "Both take the resources of a system they don't believe in and try to keep a personal code intact inside it.")
P("fma/edward_elric/working_for_a_system_you_distrust", "buffy/winifred_burkle/big_job_inside_the_machine",
  "Both accept an institution's power because they need it to do good, and wonder what the bargain will ultimately cost them.")
P("fma/alphonse_elric/am_i_still_real", "the_good_place/janet/more_than_a_helper",
  "Both are defined by what they can do for others and quietly need someone to recognise them as a full person with a self of their own.")
P("fma/alphonse_elric/the_steady_younger_sibling", "doctor_who/martha_jones/holding_everyone_together",
  "Both are the calm anchor of a shaken family, putting everyone else first until nobody thinks to ask whether they are all right.")
P("fma/alphonse_elric/the_steady_younger_sibling", "schitts_creek/twyla_sands/kindness_despite_chaos",
  "Both choose gentleness in the middle of family chaos and quietly show up for everyone while their own needs stay invisible.")
P("fma/roy_mustang/climbing_to_change_the_system", "attack_on_titan/erwin_smith/a_dream_worth_the_cost",
  "Both are charismatic leaders chasing a goal that is part service and part private obsession, asking others to trust that the climb is worth its cost.")
P("fma/roy_mustang/when_grief_becomes_vengeance", "walking_dead/carol_peletier/grief_that_wants_someone_to_pay",
  "Both pour a loss too deep to bear into making the one responsible pay, while the obsession quietly endangers the people keeping them afloat.")
P("fma/riza_hawkeye/living_with_what_she_has_done", "game_of_thrones/theon_greyjoy/earning_forgiveness",
  "Both live with harm they took part in by quietly backing someone they believe can do better, choosing usefulness over asking to be forgiven.")
P("fma/riza_hawkeye/living_with_what_she_has_done", "game_of_thrones/tyrion_lannister/advising_the_one_he_believes_in",
  "Both give themselves to a leader they believe in, serving as the conscience at their side, and have to decide how much of themselves that loyalty can ask.")
P("fma/winry_rockbell/the_one_who_waits_at_home", "breaking_bad/skyler_white/the_wife_who_notices",
  "Both love people who keep secrets for their supposed protection, and are left furious and afraid at being shut out.")
P("fma/winry_rockbell/the_one_who_waits_at_home", "naruto/sakura_haruno/loving_someone_who_pushes_you_away",
  "Both keep caring for someone who keeps walking away into danger, and must find their own path instead of only waiting.")
P("fma/winry_rockbell/choosing_not_to_pull_the_trigger", "avatar/katara/revenge_or_release",
  "Both come face to face with the person behind their family's deepest loss and must decide whether refusing cruelty means forgiving.")
P("fma/winry_rockbell/choosing_not_to_pull_the_trigger", "walking_dead/rick_grimes/choosing_the_future_over_revenge",
  "Both have every reason to make someone suffer and choose restraint instead, without pretending the harm was ever acceptable.")
P("fma/scar/consumed_by_revenge", "game_of_thrones/arya_stark/list_of_names",
  "Both let a real injustice harden into a need for payback that slowly erases who they were before it.")
P("fma/scar/facing_the_harm_he_caused", "buffy/faith_lehane/facing_what_she_did",
  "Both must take responsibility for the pain they caused without collapsing into self-hatred, and keep choosing better for years.")
P("fma/ling_yao/carrying_a_clans_hopes", "my_hero_academia/ochaco_uraraka/working_for_her_family",
  "Both chase a big goal chiefly to lift the family counting on them, and keep their own feelings on the back burner to stay focused.")
P("fma/ling_yao/carrying_a_clans_hopes", "avatar/aang/reluctant_chosen_one",
  "Both are young people told that everyone is counting on them, hiding the weight behind lightness while deciding how much they are willing to carry.")
P("fma/ling_yao/what_makes_a_true_leader", "money_heist/the_professor/responsible_for_everyone",
  "Both lead people who would risk everything for them, and carry every price those people pay as a personal debt.")
P("fma/ling_yao/what_makes_a_true_leader", "naruto/tsunade/sending_loved_ones_into_danger",
  "Both have to send the people who trust them into harm's way and live with what they owe the ones who follow.")
P("fma/izumi_curtis/a_grief_she_never_speaks_of", "doctor_who/twelfth_doctor/cannot_let_her_go",
  "Both, in the rawest moment of grief, were willing to break every rule to undo a loss, and live with what that desperation cost.")
P("fma/izumi_curtis/a_grief_she_never_speaks_of", "doctor_who/amy_pond/future_she_planned",
  "Both lost the family they hoped for and quietly blame themselves, carrying a grief they rarely put into words.")
P("fma/izumi_curtis/tough_love_for_kids_not_her_own", "buffy/rupert_giles/mentor_becomes_father",
  "Both are demanding mentors who become stand-in parents, struggling to know when to protect, when to push and when to let go.")

# ---------------- Gilmore Girls ----------------
P("gilmore_girls/lorelai_gilmore/going_back_to_the_family_she_fled", "avatar/toph_beifong/breaking_out_of_the_cage",
  "Both broke away from a controlling family to live on their own terms, and carry guilt and defiance whenever they are pulled back in.")
P("gilmore_girls/lorelai_gilmore/going_back_to_the_family_she_fled", "bojack/diane_nguyen/carrying_the_damage_from_home",
  "Both built themselves in reaction to a belittling family and still half-hope, against experience, to finally be seen by them.")
P("gilmore_girls/lorelai_gilmore/building_her_own_inn", "schitts_creek/david_rose/building_his_own_thing",
  "Both turn a dream they have long talked about into a real business, risking their stability on the belief that what they love can make a living.")
P("gilmore_girls/lorelai_gilmore/building_her_own_inn", "the_office/michael_scott/walking_away_to_start_over",
  "Both leave the security of running someone else's operation to bet on themselves, with money, pride and friendship all at stake.")
P("gilmore_girls/lorelai_gilmore/letting_someone_all_the_way_in", "doctor_who/amy_pond/left_waiting",
  "Both are fiercely independent people who bolt when love gets serious, unsure whether they are choosing freedom or fleeing commitment.")
P("gilmore_girls/rory_gilmore/living_up_to_the_plan", "my_hero_academia/katsuki_bakugo/the_prodigy_meets_his_equals",
  "Both built their identity on being the best, and arriving among equals forces them to find out who they are when they no longer are.")
P("gilmore_girls/rory_gilmore/living_up_to_the_plan", "sex_education/jackson_marchetti/the_golden_boy_under_pressure",
  "Both carry everyone's high hopes and have to ask whether the plan they have followed since childhood was ever really their own.")
P("gilmore_girls/rory_gilmore/adrift_in_her_thirties", "stranger_things/steve_harrington/life_after_peaking_early",
  "Both were expected to do great things and find themselves drifting, still defined by an old image and an old relationship, facing the gap between promise and life.")
P("gilmore_girls/rory_gilmore/adrift_in_her_thirties", "buffy/alexander_harris/left_behind_after_school",
  "Both move back home while others seem to race ahead, afraid they have become the one everyone quietly pities.")
P("gilmore_girls/emily_gilmore/earning_a_place_in_her_daughters_life", "mad_men/betty_draper/mother_who_was_never_mothered",
  "Both are parents who can only show love through standards and criticism, and the harder they try to manage their child the further that child pulls away.")
P("gilmore_girls/emily_gilmore/earning_a_place_in_her_daughters_life", "stranger_things/jim_hopper/a_father_afraid_to_lose_again",
  "Both love a child fiercely but express it as control, and have to learn to say what they feel instead of setting another rule.")
P("gilmore_girls/emily_gilmore/marriage_on_the_rocks", "greys_anatomy/derek_shepherd/starting_over_after_betrayal",
  "Both discover a partner hid part of their life, and the betrayal shakes their sense of who they have been all those years.")
P("gilmore_girls/emily_gilmore/starting_over_late_in_life", "schitts_creek/moira_rose/clinging_to_former_glory",
  "Both lose the world that told them who they were and must discover, late in life, a self that does not depend on the old rules and audience.")
P("gilmore_girls/emily_gilmore/starting_over_late_in_life", "the_good_place/tahani_al_jamil/who_she_is_without_an_audience",
  "Both built their identity on status and appearances, and have to reinvent themselves once the setting that gave it meaning is gone.")
P("gilmore_girls/richard_gilmore/reaching_the_daughter_he_lost", "schitts_creek/moira_rose/learning_to_mother",
  "Both are parents who were emotionally absent and try, awkwardly and late, to become someone their adult child can lean on.")
P("gilmore_girls/richard_gilmore/who_he_is_without_his_job", "ted_lasso/roy_kent/who_am_i_after_this",
  "Both lose the career that defined them before they were ready and have to find worth beyond the title, with pride fighting every step.")
P("gilmore_girls/richard_gilmore/who_he_is_without_his_job", "greys_anatomy/richard_webber/pushed_aside",
  "Both are experienced people pushed out of the work that held their identity, wondering whether they still matter.")
P("gilmore_girls/luke_danes/the_guarded_heart", "the_office/jim_halpert/in_love_with_a_friend_who_is_taken",
  "Both hide a long love for a friend behind steady everyday presence and must decide when protecting the friendship has become hiding from their own life.")
P("gilmore_girls/luke_danes/responsibility_he_never_asked_for", "game_of_thrones/sandor_clegane/reluctant_guardian",
  "Both are gruff loners who end up responsible for a hurt, angry young person, building a rough care neither will admit to.")
P("gilmore_girls/luke_danes/responsibility_he_never_asked_for", "my_hero_academia/shota_aizawa/unexpected_guardian",
  "Both are practical people who never pictured themselves as caregivers and have to learn, without a playbook, to make a young person feel safe.")
P("gilmore_girls/lane_kim/living_a_double_life", "walking_dead/maggie_greene/stepping_out_of_her_fathers_world",
  "Both love a strict parent whose worldview doesn't fit who they are becoming, and try to live honestly without losing their family.")
P("gilmore_girls/lane_kim/living_a_double_life", "brooklyn_99/rosa_diaz/telling_her_family_who_she_is",
  "Both keep a real self hidden from traditional parents and weigh the fear of rejection against the cost of living split in two.")
P("gilmore_girls/lane_kim/life_outruns_her_plans", "greys_anatomy/miranda_bailey/career_and_motherhood",
  "Both are hit with parenthood in the middle of chasing their dream and have to hold on to themselves while stepping into a new role.")
P("gilmore_girls/lane_kim/life_outruns_her_plans", "doctor_who/clara_oswald/carer_who_never_left",
  "Both watch caring responsibilities swallow the plans they fought for, and struggle to keep one piece of their life for themselves.")
P("gilmore_girls/paris_geller/perfection_as_armor", "avatar/azula/the_perfect_daughter",
  "Both learned that only flawless achievement makes them worthy, and treat every setback as unthinkable because underneath they fear they are only lovable when they win.")
P("gilmore_girls/paris_geller/perfection_as_armor", "the_good_place/tahani_al_jamil/outside_her_sisters_shadow",
  "Both perform achievement for distant parents who never applaud enough, and have to find out who they are without the scoreboard.")
P("gilmore_girls/paris_geller/leading_without_driving_everyone_away", "the_office/dwight_schrute/craving_authority",
  "Both finally get the authority they crave and run it so hard that they turn colleagues into rebels, learning slowly that leading means caring.")
P("gilmore_girls/paris_geller/leading_without_driving_everyone_away", "greys_anatomy/miranda_bailey/leading_the_hospital",
  "Both push bold, unpopular demands on their peers to prove they deserve the top job, and have to learn that being in charge is not the same as being right.")
P("gilmore_girls/sookie_st_james/panicking_at_every_big_step", "friends/chandler_bing/afraid_of_commitment",
  "Both want love and family but panic whenever it gets real, and have to name the fear instead of sabotaging what they want.")
P("gilmore_girls/sookie_st_james/betting_on_a_shared_dream", "the_office/jim_halpert/betting_on_the_dream",
  "Both are offered a real shot at a long-held dream that means a financial gamble and asking a lot of the people who share their life.")
P("gilmore_girls/sookie_st_james/betting_on_a_shared_dream", "schitts_creek/stevie_budd/stuck_local_steps_up",
  "Both have lived safely in someone else's operation and are asked to take on ownership and risk they doubt they can handle.")

# ---------------- Mad Men ----------------
P("mad_men/don_draper/the_man_behind_the_pitch", "greys_anatomy/jo_wilson/learning_to_be_safe",
  "Both rebuilt themselves under a new identity to escape a brutal past, and keep everyone at arm's length because being known feels dangerous.")
P("mad_men/don_draper/the_man_behind_the_pitch", "bojack/bojack_horseman/wanting_to_be_loved_while_hating_himself",
  "Both are admired on the surface while numbing a deep self-loathing, wanting to be loved but convinced nobody could love who they really are.")
P("mad_men/don_draper/drinking_through_the_emptiness", "game_of_thrones/tyrion_lannister/rock_bottom_and_purpose",
  "Both once seemed brilliant and in control, and now numb themselves with drink until something makes them face whether they can climb back.")
P("mad_men/don_draper/drinking_through_the_emptiness", "succession/kendall_roy/staying_sober_under_pressure",
  "Both have coping habits that turned on them, and try to stop while the pressure of work and family keeps giving them reasons to reach for a drink.")
P("mad_men/don_draper/becoming_the_father_he_never_had", "buffy/alexander_harris/fear_of_becoming_his_parents",
  "Both grew up without a model of loving parenthood and fear that the damage of their own childhood will surface in the family they are building.")
P("mad_men/don_draper/becoming_the_father_he_never_had", "schitts_creek/johnny_rose/absent_father_to_cheerleader",
  "Both provided for their children without ever being truly present, and later try to become the parent they wish they had been.")
P("mad_men/peggy_olson/from_the_typing_pool_to_the_table", "avatar/katara/fighting_to_be_taught",
  "Both have raw talent in a world that expects people like them to stay in their place, and fight gatekeepers for a seat at the table.")
P("mad_men/peggy_olson/stepping_out_of_the_mentors_shadow", "money_heist/nairobi/taking_charge",
  "Both do the real work under a leader they owe much to, and have to claim their own authority when loyalty starts to mean staying small.")
P("mad_men/peggy_olson/stepping_out_of_the_mentors_shadow", "parks_and_rec/april_ludgate/what_do_you_want_to_do_with_your_life",
  "Both feel that choosing their own path would betray the person who helped them get started, and have to grow up anyway.")
P("mad_men/joan_holloway/the_plan_she_was_raised_for", "game_of_thrones/sansa_stark/fairy_tale_to_cage",
  "Both were raised to believe the right marriage was the prize, and get exactly what they were promised only to find it is a trap.")
P("mad_men/joan_holloway/the_plan_she_was_raised_for", "schitts_creek/patrick_brewer/living_true_to_himself",
  "Both did everything expected of them and realise the life they built never felt like theirs, and must write a new script.")
P("mad_men/joan_holloway/fighting_to_be_taken_seriously", "ted_lasso/keeley_jones/taken_seriously",
  "Both are judged by their image while discovering real talent, and fight to be recognised for their minds in rooms that keep dismissing them.")
P("mad_men/pete_campbell/never_enough_for_anyone", "ted_lasso/nate_shelley/hungry_to_be_seen",
  "Both were starved of a parent's warmth and grab for recognition so hungrily that envy and resentment turn on the people who gave them a chance.")
P("mad_men/pete_campbell/the_life_he_thought_he_wanted", "money_heist/tokyo/love_versus_freedom",
  "Both chafe against the settled life that was supposed to make them happy, and their hunger for thrill collides with a partner's need for security.")
P("mad_men/roger_sterling/the_party_that_cant_last", "squid_game/oh_il_nam/one_last_game",
  "Both have coasted into old age and, facing mortality, reach for a last taste of youthful excitement while wondering what their life actually meant.")
P("mad_men/roger_sterling/the_party_that_cant_last", "money_heist/berlin/nothing_left_to_lose",
  "Both treat life as a party because consequences feel irrelevant, until the end in sight asks whether they have given anything back.")
P("mad_men/roger_sterling/proving_he_still_matters", "my_hero_academia/all_might/finding_worth_beyond_strength",
  "Both lose the one thing that made them valuable and have to find out whether their worth was ever only in what they could do.")
P("mad_men/roger_sterling/proving_he_still_matters", "buffy/rupert_giles/when_theyre_grown",
  "Both watch younger people overtake the role they held and must reinvent their usefulness or learn when to step back.")
P("mad_men/betty_draper/the_perfect_wife_with_numb_hands", "the_office/pam_beesly/finding_her_voice",
  "Both are living a safe, expected life by default and slowly realise they have never said out loud what they actually want.")
P("mad_men/betty_draper/the_perfect_wife_with_numb_hands", "game_of_thrones/daenerys_targaryen/finding_her_voice",
  "Both were raised to be ornamental and obedient, treated as childlike by those around them, and must find a voice of their own.")
P("mad_men/betty_draper/mother_who_was_never_mothered", "avatar/toph_beifong/making_amends_as_a_parent",
  "Both repeat the harm of their own upbringing with their children and have to face what they did before the chance to repair slips away.")
P("mad_men/sally_draper/the_child_who_sees_everything", "breaking_bad/walter_white_jr/the_kid_left_out_of_the_family_secret",
  "Both are children who sense their family falling apart while the adults hide the truth, and try to make sense of it alone.")
P("mad_men/sally_draper/the_child_who_sees_everything", "buffy/dawn_summers/earning_her_place",
  "Both act out because the overwhelmed adults around them have no attention left to give, and negative attention is still attention.")
P("mad_men/sally_draper/refusing_to_become_her_parents", "my_hero_academia/shoto_todoroki/refusing_his_fathers_half",
  "Both define themselves by refusing to become the parents who failed them, and must learn to forgive without excusing.")
P("mad_men/sally_draper/refusing_to_become_her_parents", "bojack/hollyhock/protecting_herself_from_someone_she_loves",
  "Both love a flawed parent figure while learning to protect themselves from them, deciding how much of that person to let in.")
P("mad_men/megan_calvet/choosing_her_own_dream", "greys_anatomy/cristina_yang/work_first_love_second",
  "Both find that loving an established partner quietly asks them to become smaller, and must choose whether to follow their own calling.")
P("mad_men/megan_calvet/choosing_her_own_dream", "doctor_who/rose_tyler/outgrowing_a_small_life",
  "Both leave a safe path others would envy to chase a bigger life, and try to grow without abandoning the people who loved them as they were.")

# ---------------- Parks and Recreation ----------------
P("parks_and_rec/leslie_knope/dreaming_big_from_the_bottom_rung", "bojack/diane_nguyen/wanting_her_work_to_matter",
  "Both need their work to change the world to feel worthwhile, and have to learn how to live with progress that is small and slow.")
P("parks_and_rec/leslie_knope/dreaming_big_from_the_bottom_rung", "my_hero_academia/izuku_midoriya/the_kid_who_was_told_no",
  "Both make up for a lack of standing with obsessive preparation and sheer stubbornness, inspiring and exhausting the people around them.")
P("parks_and_rec/leslie_knope/when_the_heart_and_the_dream_collide", "money_heist/the_professor/the_plan_versus_the_heart",
  "Both are meticulous planners whose own rules forbid the one feeling they cannot plan for.")
P("parks_and_rec/ron_swanson/the_man_who_wants_to_be_left_alone", "squid_game/kang_sae_byeok/the_loner_who_trusts_no_one",
  "Both have arranged their life so no one gets close, and slowly learn that fierce independence and deep connection can live in the same person.")
P("parks_and_rec/ron_swanson/the_man_who_wants_to_be_left_alone", "walking_dead/michonne/letting_people_back_in",
  "Both survive on pure self-reliance behind a shut door until a group of people, especially the young ones, keep showing up anyway.")
P("parks_and_rec/ron_swanson/the_ex_he_cant_stay_away_from", "game_of_thrones/jaime_lannister/love_that_consumes",
  "Both keep being pulled back to a relationship that brings out their worst, long after everyone around them has seen the pattern.")
P("parks_and_rec/ron_swanson/the_ex_he_cant_stay_away_from", "breaking_bad/kim_wexler/loving_someone_who_brings_out_your_wild_side",
  "Both are disciplined people drawn to someone who unleashes a reckless side of them, and have to ask whether that pull reveals their true self or their worst.")
P("parks_and_rec/april_ludgate/pretending_not_to_care", "squid_game/ji_yeong/one_real_friend",
  "Both hide behind jokes and total indifference until one person actually listens, and they have to admit how much it matters.")
P("parks_and_rec/april_ludgate/pretending_not_to_care", "stranger_things/max_mayfield/belonging_while_home_is_unsafe",
  "Both act tough and flippant to seem untouchable while privately craving to be let into a group that truly gets them.")
P("parks_and_rec/april_ludgate/what_do_you_want_to_do_with_your_life", "friends/chandler_bing/stuck_in_the_wrong_career",
  "Both drifted into jobs they are good at but don't care about, and have to find the courage to start over at the bottom of something that fits.")
P("parks_and_rec/andy_dwyer/growing_up_after_being_left", "bojack/todd_chavez/drifting_on_a_friends_couch",
  "Both are warm, directionless people who let someone else carry adult life for them, and have to learn to stand on their own.")
P("parks_and_rec/andy_dwyer/looking_for_what_hes_good_at", "friends/joey_tribbiani/chasing_the_big_break",
  "Both are good-hearted people without much formal education chasing a dream through rejection, trying to believe in themselves without pride getting in the way.")
P("parks_and_rec/andy_dwyer/looking_for_what_hes_good_at", "sex_education/adam_groff/finding_what_hes_good_at",
  "Both were always the ones who never took learning seriously and stumble into work that finally uses who they really are.")
P("parks_and_rec/tom_haverford/the_mogul_in_waiting", "the_office/ryan_howard/in_a_hurry_to_be_somebody",
  "Both love the image of success more than the slow work it takes, and chase quick wins while doubting they are good enough.")
P("parks_and_rec/tom_haverford/the_mogul_in_waiting", "succession/connor_roy/the_forgotten_eldest",
  "Both latch onto grand plans nobody believes in, hoping one of them will finally make the people around them pay attention.")
P("parks_and_rec/tom_haverford/playing_the_field_to_avoid_getting_hurt", "money_heist/berlin/believing_in_love_again",
  "Both chase the thrill of romance as a performance so nobody can truly know or reject them, and are lost when real feelings arrive.")
P("parks_and_rec/tom_haverford/playing_the_field_to_avoid_getting_hurt", "sex_education/maeve_wiley/letting_her_guard_down",
  "Both keep romance casual as armour, and have to risk being seen honestly by someone who gets under their defences.")
P("parks_and_rec/ann_perkins/finding_herself_outside_a_relationship", "buffy/anya_jenkins/owning_her_life",
  "Both have always defined themselves through a partner and have to figure out who they are once that relationship is gone.")
P("parks_and_rec/ann_perkins/finding_herself_outside_a_relationship", "ted_lasso/keeley_jones/choosing_herself",
  "Both have spent years caring for a self-absorbed partner and slowly learn to choose themselves rather than be defined by whoever they are with.")
P("parks_and_rec/ann_perkins/building_a_family_on_her_own_terms", "bojack/princess_carolyn/wanting_to_be_a_mother",
  "Both finally admit they want a child and face the question of what family looks like when it doesn't arrive the way they pictured.")
P("parks_and_rec/ann_perkins/building_a_family_on_her_own_terms", "greys_anatomy/amelia_shepherd/choosing_her_own_shape",
  "Both decide to build a family in an unconventional way and have to hold to what they want despite everyone else's picture of a happy ending.")
P("parks_and_rec/chris_traeger/positivity_as_a_shield", "ted_lasso/ted_lasso/behind_the_smile",
  "Both use relentless optimism to keep old pain out of sight, until it leaks out in their body and they have to let people see them struggle.")
P("parks_and_rec/chris_traeger/positivity_as_a_shield", "doctor_who/tenth_doctor/charm_over_grief",
  "Both keep moving and smiling because standing still would mean feeling what they have been outrunning.")

# ---------------- Sex Education ----------------
P("sex_education/otis_milburn/the_advice_giver", "friends/chandler_bing/afraid_of_commitment",
  "Both grew up watching their parents' marriage break painfully, and use wit and helpfulness as armour against their own fear of intimacy.")
P("sex_education/otis_milburn/the_advice_giver", "bojack/princess_carolyn/the_one_who_holds_it_together",
  "Both are so good at fixing everyone else's problems that being needed has become a way to avoid admitting their own.")
P("sex_education/otis_milburn/growing_up_under_a_parent_who_knows_too_much", "stranger_things/joyce_byers/loving_without_holding_back",
  "Both sit inside a fierce, hovering parent-child bond and have to find room for the child to become their own person without losing the closeness.")
P("sex_education/otis_milburn/growing_up_under_a_parent_who_knows_too_much", "avatar/katara/parentified_caretaker",
  "Both are the child a single parent leans on most, carrying care and quiet resentment they are not allowed to name.")
P("sex_education/otis_milburn/falling_for_his_business_partner", "friends/rachel_green/love_with_a_close_friend",
  "Both keep missing each other with the person they love most, and every missed moment leaves new partners caught in the middle.")
P("sex_education/maeve_wiley/raising_herself", "greys_anatomy/alex_karev/tough_guy_softens",
  "Both had to parent their own parents and wall themselves off with sharpness, until people who refuse to give up on them get through.")
P("sex_education/maeve_wiley/raising_herself", "walking_dead/daryl_dixon/outsider_finds_a_family",
  "Both were raised in neglect and taught to expect nothing, and have to decide whether they can let a chosen family claim them.")
P("sex_education/maeve_wiley/the_gifted_outsider", "breaking_bad/kim_wexler/climbing_on_her_own_terms",
  "Both come from hard backgrounds and fight their way into privileged rooms on sheer discipline, never quite trusting that the future can't be taken away.")
P("sex_education/eric_effiong/being_himself_out_loud", "stranger_things/will_byers/afraid_to_be_seen",
  "Both carry a truth about who they are and who they love, and have to find out whether the people they love are bigger than their fears.")
P("sex_education/eric_effiong/what_he_deserves_in_love", "doctor_who/martha_jones/waiting_to_be_seen",
  "Both give far more than they get to someone who won't fully show up for them, and have to learn when to walk away for their own sake.")
P("sex_education/eric_effiong/what_he_deserves_in_love", "the_office/erin_hannon/learning_she_deserves_better",
  "Both have to learn the difference between being wanted and being treated well, and choose the love that doesn't make them smaller.")
P("sex_education/jean_milburn/the_expert_who_cant_fix_her_own_home", "ted_lasso/rebecca_welton/letting_herself_want_again",
  "Both were hurt by a partner long ago and keep romance at a controlled distance, unsure in midlife whether they dare want something real.")
P("sex_education/jean_milburn/the_expert_who_cant_fix_her_own_home", "succession/shiv_roy/love_on_her_own_terms",
  "Both learned that dependence is dangerous and keep the upper hand in love, until a steady partner asks for more than control allows.")
P("sex_education/jean_milburn/when_the_helper_needs_help", "bojack/princess_carolyn/the_one_who_holds_it_together",
  "Both are capable people who take care of everyone and insist they are fine, and have to accept help before they collapse.")
P("sex_education/adam_groff/the_bully_who_hates_himself", "my_hero_academia/katsuki_bakugo/facing_the_person_he_hurt",
  "Both spent years putting someone down out of their own insecurity, and have to swallow their pride to own the harm.")
P("sex_education/adam_groff/the_bully_who_hates_himself", "ted_lasso/jamie_tartt/the_fathers_voice",
  "Both hear a harsh parent's voice in everything they do and only know how to show toughness, until someone makes room for their softer side.")
P("sex_education/adam_groff/finding_what_hes_good_at", "buffy/alexander_harris/left_behind_after_school",
  "Both are convinced they are the one who isn't good at anything, and find a quieter kind of value in patient, hands-on work.")
P("sex_education/aimee_gibbs/finding_out_what_she_wants", "attack_on_titan/historia/the_girl_behind_the_kindness",
  "Both learned to survive by being endlessly agreeable and have to discover, for the first time, who they are and what they want underneath.")
P("sex_education/aimee_gibbs/finding_out_what_she_wants", "the_good_place/janet/more_than_a_helper",
  "Both have always gone along with what others need and are startled to discover they have wishes of their own.")
P("sex_education/aimee_gibbs/feeling_safe_in_her_body_again", "avatar/korra/healing_after_trauma",
  "Both try to carry on as if they are fine after being violated, until fear and shame surface and healing begins only when they face what happened.")
P("sex_education/aimee_gibbs/feeling_safe_in_her_body_again", "money_heist/rio/after_the_trauma",
  "Both find panic and numbness surfacing at unexpected moments after something terrible, and have to heal at their own pace among people who love them.")
P("sex_education/jackson_marchetti/the_golden_boy_under_pressure", "squid_game/cho_sang_woo/the_golden_boy_who_fell",
  "Both are the family's pride, carrying a parent's invested dreams, and cannot say they are breaking under the weight.")
P("sex_education/jackson_marchetti/who_he_is_beyond_the_image", "greys_anatomy/callie_torres/coming_out",
  "Both are thrown by feelings that don't fit the identity they assumed they had, and have to sit with the uncertainty instead of forcing an answer.")
P("sex_education/jackson_marchetti/who_he_is_beyond_the_image", "buffy/willow_rosenberg/wallflower_finds_herself",
  "Both discover a truth about who they are drawn to that they never saw coming, and have to let their sense of self grow around it.")
P("sex_education/ruby_matthews/the_queen_bee_armour", "buffy/cordelia_chase/popularity_or_real_friends",
  "Both built an untouchable status out of sharpness, and find themselves drawn to someone their crowd looks down on who sees the real them.")
P("sex_education/ruby_matthews/the_queen_bee_armour", "avatar/azula/ruling_by_fear",
  "Both keep people in line through intimidation because a secret fear of being hurt or left sits underneath the control.")
P("sex_education/ruby_matthews/starting_over_without_a_crown", "stranger_things/steve_harrington/from_popular_jerk_to_protector",
  "Both lose the popularity that defined them and discover a better self in kindness and in looking after others.")

# ---------------- Succession ----------------
P("succession/logan_roy/refusing_to_let_go", "game_of_thrones/cersei_lannister/holding_on_at_any_cost",
  "Both answer every threat to their power by grabbing more control, unable to let go because letting go would mean admitting their time is ending.")
P("succession/logan_roy/refusing_to_let_go", "buffy/rupert_giles/when_theyre_grown",
  "Both have to face that holding on to the young people they shaped may be exactly what keeps those people from standing on their own.")
P("succession/logan_roy/the_childhood_he_never_mentions", "avatar/lin_beifong/old_family_wounds",
  "Both carry an old injustice from childhood into a bitter estrangement with a sibling, and every meeting reopens the wound instead of healing it.")
P("succession/logan_roy/the_childhood_he_never_mentions", "mad_men/don_draper/the_man_behind_the_pitch",
  "Both survived a harsh, loveless childhood and built a powerful life on never letting anyone see where they came from.")
P("succession/kendall_roy/chasing_his_fathers_chair", "avatar/zuko/fathers_approval",
  "Both built their entire identity around winning a harsh parent's approval, swinging between desperate loyalty and rebellion without knowing what they really want.")
P("succession/kendall_roy/chasing_his_fathers_chair", "game_of_thrones/tyrion_lannister/the_unwanted_son",
  "Both excel when given real responsibility, yet the parent whose recognition they crave keeps moving the finish line.")
P("succession/kendall_roy/staying_sober_under_pressure", "greys_anatomy/richard_webber/sobriety",
  "Both hold positions of power while fighting to stay clean under pressure, knowing that people around them could use their past against them.")
P("succession/shiv_roy/claiming_a_seat_at_the_table", "game_of_thrones/theon_greyjoy/two_families",
  "Both return to a cold parent desperate to be finally taken seriously, and risk betraying the life and values they built elsewhere to prove they belong.")
P("succession/shiv_roy/claiming_a_seat_at_the_table", "game_of_thrones/sansa_stark/stepping_into_leadership",
  "Both have to fight siblings and a doubting family for authority they know they are capable of, deciding when to trust others and when to trust themselves.")
P("succession/shiv_roy/love_on_her_own_terms", "money_heist/tokyo/love_versus_freedom",
  "Both want love and freedom at the same time, and keep testing a devoted partner who wants a steadier life.")
P("succession/roman_roy/the_joker_who_wants_to_be_taken_seriously", "avatar/sokka/ordinary_among_gifted",
  "Both cover the fear of being the weak link with jokes and bravado, and have to risk real failure to discover what they actually contribute.")
P("succession/roman_roy/the_joker_who_wants_to_be_taken_seriously", "breaking_bad/jimmy_mcgill/the_little_brother_never_good_enough",
  "Both are the family's supposed screw-up, craving respect from someone who will never quite give it and letting the resentment shape them.")
P("succession/roman_roy/closeness_only_as_a_joke", "schitts_creek/david_rose/letting_himself_be_loved",
  "Both keep closeness at bay with sarcasm and deflection because letting someone in feels like handing them a weapon.")
P("succession/roman_roy/closeness_only_as_a_joke", "parks_and_rec/tom_haverford/playing_the_field_to_avoid_getting_hurt",
  "Both approach intimacy only as a game or a performance, and have no idea what to do when someone actually wants to know them.")
P("succession/connor_roy/paying_for_love", "the_office/michael_scott/longing_for_someone_to_come_home_to",
  "Both long for a family of their own and keep settling for relationships where they are tolerated rather than loved.")
P("succession/tom_wambsgans/the_outsider_who_wants_in", "game_of_thrones/arya_stark/becoming_no_one",
  "Both try to belong to a closed, demanding group that asks them to give up who they are, and must decide whether belonging is worth disappearing.")
P("succession/tom_wambsgans/loving_someone_who_holds_the_power", "doctor_who/martha_jones/waiting_to_be_seen",
  "Both love someone who gives less than they do, accepting one condition after another while quiet resentment builds.")
P("succession/tom_wambsgans/loving_someone_who_holds_the_power", "the_office/dwight_schrute/a_love_he_cant_show",
  "Both are devoted to a partner who controls the terms of the relationship, and pride and hurt keep them circling instead of speaking plainly.")
P("succession/greg_hirsch/learning_the_price_of_getting_ahead", "walking_dead/eugene_porter/safety_at_what_price",
  "Both are frightened people offered comfort and status by someone powerful and cruel, telling themselves they are only surviving as their conscience wears away.")
P("succession/greg_hirsch/learning_the_price_of_getting_ahead", "avatar/bolin/following_the_wrong_leader",
  "Both are naive newcomers drawn in because a powerful patron makes them feel important, while the methods get harder to ignore.")
P("succession/gerri_kellman/competent_and_overlooked", "breaking_bad/mike_ehrmantraut/the_professional_with_a_code",
  "Both are highly competent people who clean up for powerful employers they don't admire, balancing self-protection against protecting others.")
P("succession/gerri_kellman/competent_and_overlooked", "mad_men/joan_holloway/fighting_to_be_taken_seriously",
  "Both are the ones everyone relies on and nobody considers for the top, and have to decide whether to claim a turn at power.")

# ---------------- The Good Place ----------------
P("the_good_place/eleanor_shellstrop/earning_her_place", "buffy/spike/monster_to_man",
  "Both start trying to become good only to win approval or avoid consequences, and slowly find the change becoming their own.")
P("the_good_place/eleanor_shellstrop/earning_her_place", "avatar/zuko/earning_trust_back",
  "Both have to do the awkward, humbling work of proving through actions that they can be better than the selfish person they were.")
P("the_good_place/eleanor_shellstrop/letting_people_in", "naruto/gaara/the_boy_they_called_a_monster",
  "Both learned in childhood that nobody would care for them and decided to care only about themselves, until real connection makes them question that armour.")
P("the_good_place/eleanor_shellstrop/responsible_for_others", "naruto/shikamaru_nara/reluctant_leader",
  "Both would rather avoid responsibility altogether and keep being put in charge, doubting they are the right person to carry hard decisions.")
P("the_good_place/chidi_anagonye/choosing_without_certainty", "attack_on_titan/armin_arlert/standing_in_a_greater_place",
  "Both second-guess every decision so painfully that fear of being wrong becomes its own kind of harm.")
P("the_good_place/chidi_anagonye/loving_his_opposite", "breaking_bad/kim_wexler/loving_someone_who_brings_out_your_wild_side",
  "Both are principled rule-followers who fall for a reckless rule-breaker and are changed by how alive it makes them feel.")
P("the_good_place/tahani_al_jamil/outside_her_sisters_shadow", "greys_anatomy/amelia_shepherd/out_of_the_shadow",
  "Both have always been measured against an admired sibling and have to discover who they are when they stop competing.")
P("the_good_place/tahani_al_jamil/who_she_is_without_an_audience", "buffy/cordelia_chase/from_fame_to_calling",
  "Both lose the glamorous life that made them someone and find unexpected meaning in work they care about rather than in being admired.")
P("the_good_place/jason_mendoza/behind_the_silence", "attack_on_titan/reiner_braun/the_dependable_one",
  "Both play a role so others will accept them, and the gap between who they show and who they are grows harder to bear.")
P("the_good_place/jason_mendoza/thinking_before_acting", "squid_game/seong_gi_hun/the_screw_up_who_wants_to_do_right",
  "Both are warm, loyal people whose impulsive choices keep letting others down, trying to become someone their loved ones can count on.")
P("the_good_place/jason_mendoza/thinking_before_acting", "parks_and_rec/andy_dwyer/growing_up_after_being_left",
  "Both are lovable, reckless people who have to grow up and choose the people they love over their next impulse.")
P("the_good_place/michael/first_big_project", "ted_lasso/leslie_higgins/finding_his_spine",
  "Both have served powerful superiors for years, and getting close to the people their work harms forces them to question whose side they are on.")
P("the_good_place/michael/learning_from_his_charges", "avatar/iroh/from_power_to_peace",
  "Both spent a very long time defined by status and power, and find late in life that meaning lies in humbler bonds and simple joys.")
P("the_good_place/michael/learning_from_his_charges", "doctor_who/twelfth_doctor/keeping_his_word",
  "Both are weary elders reawakened by teaching younger people, and have to accept limits to keep choosing kindness.")
P("the_good_place/janet/feelings_she_wasnt_built_for", "doctor_who/rose_tyler/love_she_cannot_name",
  "Both are swept into a first love so intense it frightens them, full of jealousy and the knowledge that it may not be allowed to last.")


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
    path = os.path.join(HERE, "resonances_extra_round3.json")
    with open(path, "w") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"wrote {len(out)} pairs to {path}")


if __name__ == "__main__":
    main()

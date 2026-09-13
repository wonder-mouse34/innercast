#!/usr/bin/env python3
"""Build RESONATES_WITH edges (resonances.json) from hand-picked arc pairs.

Arc codes are positional within arc_index.txt, per show (lines of later-round shows are skipped):
  A = avatar (1-26), B = buffy (1-25), G = game_of_thrones (1-32),
  Y = greys_anatomy (1-34), N = naruto (1-23)
e.g. A7 = the 7th avatar line in arc_index.txt.
Lost (L) and Star Trek (S) were removed on 2026-09-13 for licence reasons (see remove_shows.py).
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
INDEX = os.path.join(HERE, "arc_index.txt")
OUT = os.path.join(HERE, "resonances.json")

SHOW_CODE = {"avatar": "A", "buffy": "B", "game_of_thrones": "G", "greys_anatomy": "Y", "naruto": "N"}

def load_codes():
    codes, counters = {}, {}
    with open(INDEX, encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            arc_id = line.split(" | ")[0].strip()
            show = arc_id[len("arc:"):].split("/")[0]
            if show not in SHOW_CODE:  # later-round shows have their own link files
                continue
            c = SHOW_CODE[show]
            counters[c] = counters.get(c, 0) + 1
            codes[f"{c}{counters[c]}"] = arc_id
    return codes

PAIRS = [
# --- Avatar / Korra ---
("A1","B1","Both were handed a weight far too big far too young, and both keep dodging it while wondering whether carrying it will cost them the ordinary, lighter self they want to keep."),
("A1","N16","Both would rather slip away from a responsibility everyone keeps pressing on them, and both have to decide whether stepping up means giving up the easygoing person they want to be."),
("A1","G32","Both are told they are the one everyone needs, and both fear that becoming that person will erase the younger, gentler self they used to be."),
("A2","N4","Both lost the entire world that made them who they are in a single blow, and both have to decide whether that grief will close them off or make them hold tighter to whoever is left."),
("A2","Y2","Both are carrying a loss so total that happiness feels like betrayal, and both have to find a way to honour what is gone without letting it swallow the people still in front of them."),
("A2","G17","Both had the people who kept them safe torn away all at once, and both are ambushed by a rage they don't recognise in themselves while trying to hold on to who they were before."),
("A3","Y3","Both refuse to go along with what everyone in charge has agreed is right, and both have to weigh what standing by their conscience will cost the people who stand beside them."),
("A3","N18","Both are pressed by the people they answer to into an unbearable choice for the greater good, and both are left weighing duty to everyone against the one thing their heart forbids."),
("A4","Y6","Both are the one everyone leans on and have quietly decided their own needs don't count, and both have to learn that asking to be looked after is not the same as failing."),
("A4","B3","Both stepped into looking after a family long before they were ready, and both keep everyone else afloat while hiding how empty and unlooked-after they feel."),
("A4","Y27","Both have become the caretaker who swallows their own grief and anger to keep someone else going, and both have to admit the resentment they aren't supposed to feel."),
("A5","G27","Both have real knowledge and hunger but keep being told to wait their turn by gatekeepers, and both have to decide whether to accept the limits or break the rules to do what they know is right."),
("A5","G23","Both are fiercely capable at something people like them were never supposed to do, and both have to fight for a place that the people in charge keep saying isn't theirs."),
("A6","N3","Both finally face the person behind their oldest wound, and both have to decide whether they want revenge, an apology, or simply to stop carrying the pain."),
("A7","G4","Both are trying to earn love from a parent who keeps it just out of reach, and both have to decide whether that approval is worth who they'd have to become."),
("A8","G22","Both have done real harm and want to make it right, and both have to prove it through quiet, useful actions to people with every reason to keep them out."),
("A8","N5","Both have hurt the very people who never stopped caring about them, and both have to face that coming back is a long, humbling road rather than a single apology."),
("A9","B12","Both feel like the only ordinary one in a circle of gifted people, and both hide the fear of being quietly pitied behind jokes and bravado."),
("A9","N6","Both are measured against teammates with obvious gifts and feel like dead weight, and both have to find a strength that is genuinely their own instead of borrowed confidence."),
("A10","Y32","Both lost a love just as they had finally let themselves trust it, and both have to find out whether they can open up again without being paralysed by the fear of losing it."),
("A11","Y33","Both are fiercely independent people whose loved ones see them as fragile, and both have to learn that accepting care is not the same as being pitied."),
("A11","B19","Both are treated as someone to protect rather than someone who can help, and both are desperate to show the people raising them that they are more capable than anyone thinks."),
("A11","Y21","Both have outgrown the home that tries to keep them small, and both are torn between the freedom they need and the guilt of leaving the people who love them."),
("A13","N2","Both refuse to give up on someone who keeps walking toward pain, and both have to live with the fact that you cannot force someone to be saved."),
("A13","Y12","Both love someone who is sinking and shutting them out, and both have to accept that love alone can't fix a person, only keep a door open."),
("A14","Y9","Both spent decades building status that has now slipped away, and both have to decide whether this is a humiliation or the start of a life measured differently."),
("A14","B15","Both fell from a life of prestige into starting over with nothing, and both discover that humble work close to other people's pain might matter more than the status they lost."),
("A14","G30","Both have walked away from years of ambition or violence into simple, useful work, and both are haunted by the harm they did before."),
("A15","B20","Both were raised to believe a parent's approval depends on flawless performance, and both treat every failure as proof they were never enough."),
("A16","G13","Both answer the fear of being left or losing control by tightening their grip on everyone around them, and both have to face what happens when fear stops working."),
("A17","G3","Both have been told all their lives they were made for one great role, and both have to face who they are when the world refuses to cooperate with that story."),
("A18","Y20","Both built their identity on being the strongest, most capable person in the room, and after a terrifying experience both have to find their way back without pretending it never happened."),
("A18","Y13","Both come back from violence insisting they are fine, and both have to stop hiding from the people who love them long enough to admit the wound is real."),
("A18","G31","Both were active, fearless people until an injury took away the life they imagined, and both have to rebuild a sense of self out of despair and other people's pity."),
("A19","B10","Both are mentors trained in a strict tradition who come to love the student they were assigned, and both are torn between doing things properly and trusting who that student is becoming."),
("A19","N23","Both are responsible for young people who want to charge into danger, and both have to learn to trust them instead of wrapping them in caution."),
("A20","Y28","Both carry the weight of a celebrated family name, and both have to honour a legacy without letting it decide who they are."),
("A20","N9","Both define themselves entirely in relation to a parent, one by copying and one by rejecting, and both have to find a self that isn't simply a reaction to that parent."),
("A21","Y31","Both learn a truth about a parent that is darker than they imagined, and both have to decide what that truth says about who they are."),
("A21","B24","Both discover that someone they idolised caused them deep harm, and both have to decide what to do with a rage that admiration used to hold back."),
("A21","G16","Both are left to run a family's damaged affairs while carrying anger at the people who damaged them, and both have to learn which of their own instincts to trust."),
("A22","G25","Both begin with someone they are wary and jealous of, and shared hardship turns that person into the one who sees them most truly, in a way neither can quite name."),
("A22","Y26","Both find their closest bond growing into feelings they have no framework for, and both have to decide whether to follow them into an identity they never expected."),
("A23","Y9","Both have built their sense of worth on a position, and a public setback forces both to ask who they are when the title is taken away."),
("A23","Y19","Both are fiercely driven people who keep love at a distance because it seems to ask them to become smaller, and both have to decide what they will and won't give up."),
("A24","G19","Both have held a grudge against a sibling through decades of misunderstanding, and being forced back together makes both ask whether their anger is armour or a cage."),
("A25","Y22","Both are the younger sibling everyone likes but no one takes seriously, and both have to find out who they are when they are no longer measured against the admired one."),
("A25","B12","Both are the warm, funny one who suspects they are only the comic relief, and both have to find a kind of worth that doesn't depend on standing next to someone more gifted."),
("A26","G6","Both have pinned their loyalty on a leader they believe in, and both have to decide when defending that leader becomes betraying their own conscience."),
# --- Buffy / Angel ---
("B2","N7","Both love someone who is drifting into darkness and becoming a stranger, and both have to accept that loving them doesn't mean they can keep them."),
("B2","G11","Both are bound to a love their conscience knows is doing damage, and both have to decide whether they can protect themselves and others when their heart hasn't let go."),
("B3","G5","Both have hit bottom after a shattering loss and are numbing themselves just to get through the day, and both need a reason to want to be alive again."),
("B3","N22","Both have been hollowed out by loss and are going through the motions while hiding the emptiness, and both have to decide whether to risk caring about anything again."),
("B4","G30","Both are trying to make up for a life of harm by quietly helping others, with no guarantee that redemption is even possible."),
("B5","Y8","Both love someone who no longer knows or wants them the way they once did, and both have to decide whether real love means stepping back."),
("B6","N10","Both are shy, overlooked people who have spent years in the background, and both have to learn to take up room without becoming someone they're not."),
("B6","Y26","Both discover, later than they expected, a truth about who they love, and both have to decide whether to live it openly in front of the people who thought they knew them."),
("B7","Y7","Both lean on something that makes them feel powerful and in control, and both have to rebuild trust after it takes over, knowing a single bad day could pull them back."),
("B8","Y10","Both have hurt people from behind a hard, cruel shell, and both have to discover whether they can become gentler for their own sake rather than only for someone else's approval."),
("B8","N5","Both have a long history of harming people who tried to reach them, and both have to find out whether change can become truly theirs rather than a performance for someone else."),
("B10","N9","Both are caught between the rules of the institution they serve and the people they love, and both carry old shame about which of those loyalties comes first."),
("B10","Y3","Both are torn between the rules of an institution they serve and their instinct to protect someone vulnerable, and both have to decide what they owe the people caught in the fallout."),
("B11","Y9","Both lose the work that gave them purpose just as the people they guided outgrow them, and both have to reinvent themselves in midlife."),
("B11","N21","Both measure their lives by what they gave to the young people they guided, and both have to decide whether that was enough once the role falls away."),
("B13","Y11","Both are haunted by the fear that a parent's anger and cruelty is waiting inside them, and both are terrified of hurting the person they love most."),
("B13","Y15","Both learned in childhood that happiness comes right before catastrophe, and both are tempted to blow up something good before it can hurt them."),
("B14","G7","Both were taught to look down on a group of people, and both find that the ones they dismissed may be the only ones who truly know them."),
("B14","G18","Both are tempted to give up who they really are to stay accepted by a group that values the wrong things, and both have to decide whether belonging is worth disappearing."),
("B15","G5","Both lost the life they were sure they were owed, and both find that being needed by others might be a reason to keep going."),
("B16","G20","Both are desperate to be claimed by someone, and that hunger leads both to turn on the people who actually cared for them."),
("B16","Y25","Both keep sensing they are not the one who is truly chosen, and both have to decide what they are willing to accept just to belong somewhere."),
("B17","N15","Both have done real harm and now carry responsibility for people who remember it, and both learn that accountability is practised every day rather than proved once."),
("B17","G22","Both have done serious harm and been harmed, and both have to stop running from what they did and decide to be defined by what they do next."),
("B18","G9","Both learn something about where they came from that changes how everyone sees them, and both have to decide whether it changes who they are."),
("B19","N6","Both are tired of being the one others have to protect, and both are hungry to prove they can pull their weight."),
("B19","N17","Both lose the adults who kept them safe and are pushed to grow up fast, and both have to decide what to do with grief and anger they don't know how to hold."),
("B20","G4","Both are clever people dismissed by a father who is never impressed, and both have to earn respect among people who don't take them seriously."),
("B21","N18","Both make an agonising decision alone because they trust no one else with it, and both are isolated by the weight of carrying it."),
("B23","Y32","Both are left suddenly by the person they had built their life around, and both have to find out whether they are still worthy of love on their own."),
("B23","Y24","Both have always shaped themselves around someone else's idea of who they should be, and both have to discover what they actually want even if it disappoints people."),
("B24","Y30","Both survived something that made closeness feel dangerous, and both have to relearn, slowly and with steady friends, whether it is safe to be known."),
# --- Game of Thrones ---
("G2","Y5","Both are idealistic people handed the top job who push bold changes, and both find that every decision hurts someone and splits the people they lead."),
("G4","N19","Both are gifted people treated as lesser by their own family's hierarchy, and both have to decide how much bitterness to carry toward a family that won't recognise them."),
("G5","N22","Both have walked away from what they were good at and numbed the loss with drink, and both are pulled back toward life by someone who needs them."),
("G8","N16","Both are put in charge of their own friends and peers before they feel ready, and both discover how lonely leadership is when the people you lead doubt you."),
("G8","N15","Both lead people who openly resent or fear them, and both have to win trust by example rather than by title."),
("G9","Y16","Both are pulled between duty and shared history on one side and a new love on the other, and both have to work out what they truly want."),
("G10","N13","Both built their entire identity on one physical gift and then had it taken away, and both have to find out who they are without it."),
("G10","Y33","Both lose a part of themselves that defined them, and both have to face how they see themselves when they can no longer rely on what they were."),
("G10","Y20","Both are defined by the one skill that made them exceptional, and both have to rebuild a self when that skill is suddenly out of reach."),
("G11","N7","Both are devoted to someone whose path is dragging them into harm, and both have to separate real love from loyalty, guilt and fear of losing the future they imagined."),
("G15","Y30","Both have survived abuse and have to decide whether safety means hiding or reclaiming the life that was taken from them."),
("G16","Y5","Both are stepping into leadership among people who still see them as they used to be, and both have to learn the difference between being in charge and being right."),
("G17","N17","Both lose the people who sheltered them and have to grow up fast, and both have to decide what to do with the anger that grief leaves behind."),
("G17","N4","Both organise their lives around settling a childhood score, and both have to choose between that old wound and the people who care for them now."),
("G19","Y22","Both grew up as the difficult sibling next to the one who fitted the family mould, and both have to decide whether that sibling is a rival or an ally."),
("G22","N15","Both have done harm and now try to earn a place among people who remember it, by being useful rather than by asking to be forgiven."),
("G23","N12","Both are mocked for even trying to succeed at something they supposedly aren't suited for, and both pour everything into proving the doubters wrong."),
("G23","N1","Both have been ridiculed all their lives for not fitting what others expect, and both have to decide whether outside recognition is what they actually need."),
("G24","N2","Both have made a promise that everyone else says to abandon, and both have to decide whether faithfulness means sticking to its letter or its spirit."),
("G24","N8","Both failed to protect someone they loved, and both turn that guilt into a lifelong duty to the people who came after."),
("G26","N10","Both were written off by a family that prizes toughness, and both have to discover that their gentler kind of courage is a real strength."),
("G27","Y3","Both know something urgent that the people in charge refuse to hear, and both have to decide whether to follow the rules or break them to do what's right."),
("G27","Y21","Both land in the place they always dreamed of and find their ambitions stifled by politics and other people's priorities, and both have to decide whether staying is loyalty or giving up."),
("G29","N20","Both are bitter loners who end up responsible for a young person with no one else, and both find meaning in a bond they never wanted and won't admit to."),
("G31","N13","Both are driven young people whose bodies suddenly can't do what their dreams require, and both have to face that the old life may not come back."),
("G31","Y33","Both suffer an injury that changes their body and their future, and both pass through bitterness while others either leave or pity them."),
# --- Grey's Anatomy ---
("Y1","N14","Both grew up feeling unwanted and decided the safest thing was to need no one, and both have to question whether that coldness was ever really strength."),
("Y7","N22","Both numbed themselves with drinking when the weight of their losses got too heavy, and both have to rebuild trust and purpose without the crutch."),
("Y10","N14","Both grew up in chaos that taught them to wall themselves off with hostility, and both are changed by people who refuse to give up on them."),
("Y12","N7","Both love someone who is sinking and won't let them in, and both swing between waiting and pushing while facing their own fear of being left."),
("Y12","N2","Both refuse to let go of someone who is pulling away into their own pain, and both have to learn that staying doesn't mean they can fix them."),
("Y14","N20","Both long to be a parent, and both have to accept that caring for the next generation can take shapes they never planned."),
("Y25","N11","Both love someone whose heart is pointed elsewhere, and both have to decide how long they can wait to be chosen."),
("Y28","N19","Both have their worth decided by where they were born in a family's hierarchy, and both have to fight to be judged on what they have actually earned."),
# --- Naruto ---
]

def main():
    codes = load_codes()
    out = []
    for a, b, bridge in PAIRS:
        out.append({"source": codes[a], "target": codes[b], "bridge": bridge})
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"wrote {len(out)} pairs to {OUT}")

if __name__ == "__main__":
    main()

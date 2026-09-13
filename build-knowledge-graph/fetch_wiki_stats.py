"""Fetch MediaWiki site statistics for a list of TV-series wikis.

Usage: python3 fetch_wiki_stats.py  ->  writes wiki_stats.csv next to this script.
"""
import csv
import json
import os
import urllib.request
from concurrent.futures import ThreadPoolExecutor

# (show, wiki base URL, api.php URL or None to use <base>/api.php)
WIKIS = [
    ("Doctor Who", "https://tardis.fandom.com", None),
    ("Star Trek", "https://memory-alpha.fandom.com", None),
    ("The Simpsons", "https://simpsonswiki.com", "https://simpsonswiki.com/w/api.php"),
    ("SpongeBob SquarePants", "https://spongebob.fandom.com", None),
    ("The Walking Dead", "https://walkingdead.fandom.com", None),
    ("Grey's Anatomy", "https://greysanatomy.fandom.com", None),
    ("One Piece", "https://onepiece.fandom.com", None),
    ("Lost", "https://lostpedia.fandom.com", None),
    ("Supernatural", "https://supernatural.fandom.com", None),
    ("Game of Thrones", "https://gameofthrones.fandom.com", None),
    ("Avatar: The Last Airbender", "https://avatar.fandom.com", None),
    ("Futurama", "https://theinfosphere.org", None),
    ("Breaking Bad", "https://breakingbad.fandom.com", None),
    ("Friends", "https://friends.fandom.com", None),
    ("The Office (US)", "https://theoffice.fandom.com", None),
    ("Stranger Things", "https://strangerthings.fandom.com", None),
    # anime
    ("Naruto", "https://naruto.fandom.com", None),
    ("Dragon Ball", "https://dragonball.fandom.com", None),
    ("Attack on Titan", "https://attackontitan.fandom.com", None),
    ("My Hero Academia", "https://myheroacademia.fandom.com", None),
    ("Bleach", "https://bleach.fandom.com", None),
    ("JoJo's Bizarre Adventure", "https://jojo.fandom.com", None),
    ("Demon Slayer", "https://kimetsu-no-yaiba.fandom.com", None),
    ("Jujutsu Kaisen", "https://jujutsu-kaisen.fandom.com", None),
    ("Fairy Tail", "https://fairytail.fandom.com", None),
    ("Hunter x Hunter", "https://hunterxhunter.fandom.com", None),
    ("Detective Conan", "https://www.detectiveconanworld.com/wiki", "https://www.detectiveconanworld.com/wiki/api.php"),
    ("Sailor Moon", "https://sailormoon.fandom.com", None),
    ("Death Note", "https://deathnote.fandom.com", None),
    ("Fullmetal Alchemist", "https://fma.fandom.com", None),
    ("Sword Art Online", "https://swordartonline.fandom.com", None),
    ("Gintama", "https://gintama.fandom.com", None),
    ("Black Clover", "https://blackclover.fandom.com", None),
    ("Digimon", "https://digimon.fandom.com", None),
    ("Pokémon (anime)", "https://bulbapedia.bulbagarden.net", "https://bulbapedia.bulbagarden.net/w/api.php"),
    # animation
    ("Family Guy", "https://familyguy.fandom.com", None),
    ("South Park", "https://southpark.fandom.com", None),
    ("Rick and Morty", "https://rickandmorty.fandom.com", None),
    ("Adventure Time", "https://adventuretime.fandom.com", None),
    ("Gravity Falls", "https://gravityfalls.fandom.com", None),
    ("Steven Universe", "https://steven-universe.fandom.com", None),
    ("The Loud House", "https://theloudhouse.fandom.com", None),
    ("Phineas and Ferb", "https://phineasandferb.fandom.com", None),
    ("Bob's Burgers", "https://bobsburgers.fandom.com", None),
    ("American Dad!", "https://americandad.fandom.com", None),
    ("Scooby-Doo", "https://scoobydoo.fandom.com", None),
    ("My Little Pony: Friendship Is Magic", "https://mlp.fandom.com", None),
    ("Thomas & Friends", "https://ttte.fandom.com", None),
    ("Ben 10", "https://ben10.fandom.com", None),
    ("Ninjago", "https://ninjago.fandom.com", None),
    ("Miraculous Ladybug", "https://miraculousladybug.fandom.com", None),
    ("Total Drama", "https://totaldrama.fandom.com", None),
    ("Winx Club", "https://winx.fandom.com", None),
    ("Bluey", "https://blueypedia.fandom.com", None),
    ("Paw Patrol", "https://pawpatrol.fandom.com", None),
    ("Regular Show", "https://regularshow.fandom.com", None),
    ("Teen Titans", "https://teentitans.fandom.com", None),
    ("Invincible", "https://invincible.fandom.com", None),
    # live action
    ("Sesame Street", "https://muppet.fandom.com", None),
    ("Power Rangers", "https://powerrangers.fandom.com", None),
    ("Kamen Rider", "https://kamenrider.fandom.com", None),
    ("The Vampire Diaries", "https://vampirediaries.fandom.com", None),
    ("Once Upon a Time", "https://onceuponatime.fandom.com", None),
    ("Pretty Little Liars", "https://prettylittleliars.fandom.com", None),
    ("Teen Wolf", "https://teenwolf.fandom.com", None),
    ("Glee", "https://glee.fandom.com", None),
    ("Buffy the Vampire Slayer", "https://buffy.fandom.com", None),
    ("Charmed", "https://charmed.fandom.com", None),
    ("Smallville", "https://smallville.fandom.com", None),
    ("Stargate", "https://stargate.fandom.com", None),
    ("The X-Files", "https://x-files.fandom.com", None),
    ("Babylon 5", "https://babylon5.fandom.com", None),
    ("The Sopranos", "https://sopranos.fandom.com", None),
    ("House", "https://house.fandom.com", None),
    ("How I Met Your Mother", "https://how-i-met-your-mother.fandom.com", None),
    ("The Big Bang Theory", "https://bigbangtheory.fandom.com", None),
    ("Seinfeld", "https://seinfeld.fandom.com", None),
    ("Parks and Recreation", "https://parksandrecreation.fandom.com", None),
    ("Brooklyn Nine-Nine", "https://brooklyn99.fandom.com", None),
    ("Community", "https://community-sitcom.fandom.com", None),
    ("Criminal Minds", "https://criminalminds.fandom.com", None),
    ("NCIS", "https://ncis.fandom.com", None),
    ("Law & Order", "https://lawandorder.fandom.com", None),
    ("CSI", "https://csi.fandom.com", None),
    ("Dexter", "https://dexter.fandom.com", None),
    ("The Boys", "https://amazons-the-boys.fandom.com", None),
    ("Westworld", "https://westworld.fandom.com", None),
    ("Peaky Blinders", "https://peaky-blinders.fandom.com", None),
    ("Vikings", "https://vikings.fandom.com", None),
    ("The 100", "https://thehundred.fandom.com", None),
    ("Heroes", "https://heroeswiki.com", "https://heroeswiki.com/api.php"),
    ("Arrowverse", "https://arrow.fandom.com", None),
    ("Riverdale", "https://riverdale.fandom.com", None),
    ("Outlander", "https://outlander.fandom.com", None),
    ("Gilmore Girls", "https://gilmoregirls.fandom.com", None),
    ("Fringe", "https://fringe.fandom.com", None),
    ("Survivor", "https://survivor.fandom.com", None),
    ("Big Brother", "https://bigbrother.fandom.com", None),
    ("RuPaul's Drag Race", "https://rupaulsdragrace.fandom.com", None),
    ("Degrassi", "https://degrassi.fandom.com", None),
    ("Coronation Street", "https://coronationstreet.fandom.com", None),
    ("EastEnders", "https://eastenders.fandom.com", None),
    ("Red Dwarf", "https://reddwarf.fandom.com", None),
    ("Battlestar Galactica", "https://en.battlestarwiki.org", "https://en.battlestarwiki.org/w/api.php"),
    ("Sons of Anarchy", "https://sonsofanarchy.fandom.com", None),
    ("Shameless", "https://shameless.fandom.com", None),
    ("The Witcher", "https://witcher.fandom.com", None),
    ("Squid Game", "https://squid-game.fandom.com", None),
    ("Wednesday / Addams Family", "https://addamsfamily.fandom.com", None),
    ("iCarly", "https://icarly.fandom.com", None),
    ("Hannah Montana", "https://hannahmontana.fandom.com", None),
]

QUERY = "?action=query&meta=siteinfo&siprop=statistics|general&format=json"


def fetch(entry):
    show, base, api = entry
    url = (api or base.rstrip("/") + "/api.php") + QUERY
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (wiki-stats script)"})
        with urllib.request.urlopen(req, timeout=20) as r:
            d = json.load(r)["query"]
        s = d["statistics"]
        return [show, d["general"]["sitename"], base, s["articles"], s["pages"], s["edits"], s.get("activeusers", ""), ""]
    except Exception as e:
        return [show, "", base, "", "", "", "", f"{type(e).__name__}: {e}"]


if __name__ == "__main__":
    with ThreadPoolExecutor(max_workers=12) as ex:
        rows = list(ex.map(fetch, WIKIS))
    rows.sort(key=lambda r: -(r[3] or -1))
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "wiki_stats.csv")
    with open(out, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["show", "wiki_name", "url", "articles", "pages", "edits", "active_users", "error"])
        w.writerows(rows)
    for r in rows:
        print(" | ".join(str(x) for x in r))

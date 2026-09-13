"""Step 1+2: find the main characters of each selected show and export their
wiki pages as cleaned plain text for arc extraction.

Main characters = character pages ranked by how many other articles link to them.

Output:
    characters/candidates_<host>.csv   top 40 per show (title, inbound links, page size)
    characters/text/<host>/<slug>.txt  cleaned text of the top N (default 14) per show

Usage: python3 prepare_characters.py [--top 14]
"""
import argparse
import csv
import gzip
import json
import os
import re
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))

# show -> (wiki host, regex that marks a character page, optional regex a character must also match)
SHOWS = {
    "Avatar: The Last Airbender": ("avatar.fandom.com", r"\{\{\s*(infobox[ _:]*)?character", None),
    "Grey's Anatomy": ("greysanatomy.fandom.com",
                       r"\{\{\s*[^|}\n]*(attending|resident|intern|other characters|character family)[^|}\n]*infobox",
                       r"\[\[Category:GA Characters"),
    "Buffy the Vampire Slayer": ("buffy.fandom.com", r"\{\{\s*(template:)?character\b", None),
    # Lost (lostpedia.fandom.com) and Star Trek (memory-alpha.fandom.com) were removed on 2026-09-13:
    # their wiki licences (CC BY-NC-ND, CC BY-NC) are not compatible with CC BY-SA. See remove_shows.py.
    "Game of Thrones": ("gameofthrones.fandom.com", r"\{\{\s*(infobox[ _:]*)?character", None),
    "Naruto": ("naruto.fandom.com", r"\{\{\s*infobox\s*\}\}", r"\[\[Category:Characters"),
    "Doctor Who": ("tardis.fandom.com", r"\{\{\s*infobox individual", None),
    "The Walking Dead": ("walkingdead.fandom.com", r"\{\{\s*[^|}\n]*(character|individual|infobox)", None),
    "Breaking Bad": ("breakingbad.fandom.com", r"\{\{\s*[^|}\n]*(character|individual|infobox)", None),
    "Stranger Things": ("strangerthings.fandom.com", r"\{\{\s*[^|}\n]*(character|individual|infobox)", None),
    "The Office": ("theoffice.fandom.com", r"\{\{\s*[^|}\n]*(character|individual|infobox)", None),
    "Friends": ("friends.fandom.com", r"\{\{\s*[^|}\n]*(character|individual|infobox)", None),
    "Attack on Titan": ("attackontitan.fandom.com", r"\{\{\s*[^|}\n]*(character|individual|infobox)", None),
    "My Hero Academia": ("myheroacademia.fandom.com", r"\{\{\s*[^|}\n]*(character|individual|infobox)", None),
    "Squid Game": ("squid-game.fandom.com", r"\{\{\s*[^|}\n]*(character|individual|infobox)", None),
    "Ted Lasso": ("ted-lasso.fandom.com", r"\{\{\s*[^|}\n]*(character|individual|infobox)", None),
    "Schitt's Creek": ("schitts-creek.fandom.com", r"\{\{\s*[^|}\n]*(character|individual|infobox)", None),
    "BoJack Horseman": ("bojackhorseman.fandom.com", r"\{\{\s*[^|}\n]*(character|individual|infobox)", None),
    "Money Heist": ("money-heist.fandom.com", r"\{\{\s*[^|}\n]*(character|individual|infobox)", None),
    "Mad Men": ("madmen.fandom.com", r"\{\{\s*[^|}\n]*(character|individual|infobox)", None),
    "Succession": ("succession.fandom.com", r"\{\{\s*[^|}\n]*(character|individual|infobox)", None),
    "Parks and Recreation": ("parksandrecreation.fandom.com", r"\{\{\s*[^|}\n]*(character|individual|infobox)", None),
    "Brooklyn Nine-Nine": ("brooklyn99.fandom.com", r"\{\{\s*[^|}\n]*(character|individual|infobox)", None),
    "Gilmore Girls": ("gilmoregirls.fandom.com", r"\{\{\s*[^|}\n]*(character|individual|infobox)", None),
    "The Good Place": ("thegoodplace.fandom.com", r"\{\{\s*[^|}\n]*(character|individual|infobox)", None),
    "Fullmetal Alchemist": ("fma.fandom.com", r"\{\{\s*[^|}\n]*(character|individual|infobox)", None),
    "Arcane": ("arcane.fandom.com", r"\{\{\s*[^|}\n]*(character|individual|infobox)", None),
    "Dark": ("dark-netflix.fandom.com", r"\{\{\s*[^|}\n]*(character|individual|infobox)", None),
    "Sex Education": ("sex-education.fandom.com", r"\{\{\s*[^|}\n]*(character|individual|infobox)", None),
}

# Hand-picked characters with strong, relatable arcs (link counts alone favour villains,
# mythology figures and non-characters). Titles must match the wiki page title.
PICKS = {
    "Avatar: The Last Airbender": ["Aang", "Katara", "Zuko", "Sokka", "Toph Beifong", "Iroh", "Azula",
                                   "Korra", "Tenzin", "Asami Sato", "Lin Beifong", "Bolin"],
    "Grey's Anatomy": ["Meredith Grey", "Miranda Bailey", "Richard Webber", "Alex Karev", "Owen Hunt",
                       "Derek Shepherd", "Cristina Yang", "Amelia Shepherd", "Callie Torres",
                       "Jackson Avery", "Jo Wilson", "Arizona Robbins"],
    "Buffy the Vampire Slayer": ["Buffy Summers", "Angel", "Willow Rosenberg", "Spike", "Rupert Giles",
                                 "Alexander Harris", "Cordelia Chase", "Faith Lehane", "Dawn Summers",
                                 "Wesley Wyndam-Pryce", "Anya Jenkins", "Winifred Burkle"],
    "Game of Thrones": ["Daenerys Targaryen", "Tyrion Lannister", "Jon Snow", "Jaime Lannister",
                        "Cersei Lannister", "Sansa Stark", "Arya Stark", "Theon Greyjoy", "Brienne of Tarth",
                        "Samwell Tarly", "Sandor Clegane", "Bran Stark"],
    "Naruto": ["Naruto Uzumaki", "Sasuke Uchiha", "Sakura Haruno", "Kakashi Hatake", "Hinata Hyūga",
               "Rock Lee", "Gaara", "Shikamaru Nara", "Itachi Uchiha", "Neji Hyūga", "Jiraiya", "Tsunade"],
    # --- added shows (8 characters each, fewer where the cast is small) ---
    "Doctor Who": ["Tenth Doctor", "Twelfth Doctor", "Rose Tyler", "Martha Jones", "Donna Noble",
                   "Amy Pond", "Rory Williams", "Clara Oswald"],
    "The Walking Dead": ["Rick Grimes (TV Universe)", "Daryl Dixon (TV Universe)", "Carol Peletier (TV Universe)",
                         "Glenn Rhee (TV Series)", "Maggie Rhee (TV Universe)", "Michonne Grimes (TV Universe)",
                         "Carl Grimes (TV Series)", "Eugene Porter (TV Series)"],
    "Breaking Bad": ["Walter White", "Jesse Pinkman", "Skyler White", "Hank Schrader", "Jimmy McGill",
                     "Mike Ehrmantraut", "Kim Wexler", "Walter White Jr."],
    "Stranger Things": ["Eleven", "Mike Wheeler", "Will Byers", "Dustin Henderson", "Max Mayfield",
                        "Jim Hopper", "Joyce Byers", "Steve Harrington"],
    "The Office": ["Michael Scott", "Jim Halpert", "Pam Beesly", "Dwight Schrute", "Andy Bernard",
                   "Ryan Howard", "Erin Hannon", "Angela Martin"],
    "Friends": ["Rachel Greene", "Monica Geller", "Phoebe Buffay", "Joey Tribbiani", "Chandler Bing", "Ross Geller"],
    "Attack on Titan": ["Eren Yeager", "Mikasa Ackerman", "Armin Arlert", "Levi Ackerman", "Hange Zoë",
                        "Reiner Braun", "Erwin Smith", "Historia Reiss"],
    "My Hero Academia": ["Izuku Midoriya", "Katsuki Bakugo", "Shoto Todoroki", "Ochaco Uraraka", "Toshinori Yagi",
                         "Shota Aizawa", "Tenya Ida", "Enji Todoroki"],
    "Squid Game": ["Seong Gi-hun", "Cho Sang-woo", "Kang Sae-byeok", "Oh Il-nam", "Ali Abdul",
                   "Hwang Jun-ho", "Ji-yeong", "Jang Deok-su"],
    "Ted Lasso": ["Ted Lasso", "Rebecca Welton", "Roy Kent", "Keeley Jones", "Jamie Tartt",
                  "Nathan Shelley", "Leslie Higgins", "Sam Obisanya"],
    "Schitt's Creek": ["Johnny Rose", "Moira Rose", "David Rose", "Alexis Rose", "Stevie Budd",
                       "Patrick Brewer", "Roland Schitt", "Twyla Sands"],
    "BoJack Horseman": ["BoJack Horseman", "Diane Nguyen", "Princess Carolyn", "Todd Chavez",
                        "Mr. Peanutbutter",
                        "Hollyhock Manheim-Mannheim-Guerrero-Robinson-Zilberschlag-Hsung-Fonzerelli-McQuack"],
    "Money Heist": ["The Professor", "Tokyo", "Berlin", "Nairobi", "Denver", "Rio", "Raquel Murillo", "Helsinki"],
    # --- third round (10 shows) ---
    "Mad Men": ["Don Draper", "Peggy Olson", "Joan Holloway", "Pete Campbell", "Roger Sterling",
                "Betty Hofstadt", "Sally Draper", "Megan Calvet"],
    "Succession": ["Logan Roy", "Kendall Roy", "Siobhan Roy", "Roman Roy", "Connor Roy", "Tom Wambsgans",
                   "Greg Hirsch", "Gerri Kellman"],
    "Parks and Recreation": ["Leslie Knope", "Ron Swanson", "Ben Wyatt", "April Ludgate", "Andy Dwyer",
                             "Tom Haverford", "Ann Perkins", "Chris Traeger"],
    "Brooklyn Nine-Nine": ["Jake Peralta", "Raymond Holt", "Amy Santiago", "Rosa Diaz", "Terry Jeffords",
                           "Charles Boyle", "Gina Linetti"],
    "Gilmore Girls": ["Lorelai Gilmore", "Rory Gilmore", "Emily Gilmore", "Richard Gilmore", "Luke Danes",
                      "Lane Kim", "Paris Geller", "Sookie St. James"],
    "The Good Place": ["Eleanor Shellstrop", "Chidi Anagonye", "Tahani Al-Jamil", "Jason Mendoza", "Michael", "Janet"],
    "Fullmetal Alchemist": ["Edward Elric", "Alphonse Elric", "Roy Mustang", "Riza Hawkeye", "Winry Rockbell",
                            "Scar", "Ling Yao", "Izumi Curtis"],
    "Arcane": ["Vi", "Jinx", "Jayce Talis", "Viktor", "Caitlyn Kiramman", "Silco", "Vander", "Ekko"],
    "Dark": ["Jonas Kahnwald", "Martha Nielsen", "Ulrich Nielsen", "Charlotte Doppler", "Hannah Kahnwald",
             "Claudia Tiedemann", "Katharina Nielsen", "Regina Tiedemann"],
    "Sex Education": ["Otis Milburn", "Maeve Wiley", "Eric Effiong", "Jean Milburn", "Adam Groff", "Aimee Gibbs",
                      "Jackson Marchetti", "Ruby Matthews"],
}

LINK_RE = re.compile(r"\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]")


def norm_title(t):
    t = t.replace("_", " ").strip()
    return t[:1].upper() + t[1:] if t else t


def clean_wikitext(t):
    """Wikitext -> readable plain text, keeping == section headings ==."""
    t = re.sub(r"<!--.*?-->", "", t, flags=re.S)
    t = re.sub(r"<ref[^>/]*/>", "", t)
    t = re.sub(r"<ref[^>]*>.*?</ref>", "", t, flags=re.S)
    t = re.sub(r"<gallery.*?</gallery>", "", t, flags=re.S | re.I)
    for _ in range(10):  # remove nested templates, innermost first
        t, n = re.subn(r"\{\{[^{}]*\}\}", "", t)
        if not n:
            break
    t = re.sub(r"\{\|.*?\|\}", "", t, flags=re.S)  # tables
    t = re.sub(r"\[\[(File|Image|Category|[a-z]{2,3}):[^\[\]]*(\[\[[^\]]*\]\][^\[\]]*)*\]\]", "", t, flags=re.I)
    t = re.sub(r"\[\[[^\]|]*\|([^\]]*)\]\]", r"\1", t)
    t = re.sub(r"\[\[([^\]]*)\]\]", r"\1", t)
    t = re.sub(r"\[https?://\S+ ([^\]]*)\]", r"\1", t)
    t = re.sub(r"'{2,}", "", t)
    t = re.sub(r"<[^>]+>", "", t)
    t = re.sub(r"__[A-Z]+__", "", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    # drop out-of-universe tail sections
    t = re.split(r"\n==\s*(Behind the scenes|Appearances|Trivia|Gallery|References|See also|External links|Notes)\s*==",
                 t, flags=re.I)[0]
    return t.strip()


def slug(s):
    return re.sub(r"[^a-z0-9]+", "_", s.lower()).strip("_")


def process(show, host, char_re, must_re, top):
    path = os.path.join(HERE, "articles", f"{host}.jsonl.gz")
    state = os.path.join(HERE, "articles", f"{host}.state.json")
    if not os.path.exists(state) or not json.load(open(state))["done"]:
        print(f"{show}: download not finished yet, skipping")
        return []
    pages, inbound = {}, Counter()
    for line in gzip.open(path, "rt", encoding="utf-8"):
        r = json.loads(line)
        text = r["wikitext"]
        pages[norm_title(r["title"])] = text
        for target in {norm_title(m.group(1)) for m in LINK_RE.finditer(text)}:
            inbound[target] += 1
    char_rx, must_rx = re.compile(char_re, re.I), re.compile(must_re, re.I) if must_re else None
    chars = [t for t, txt in pages.items()
             if char_rx.search(txt[:5000]) and (not must_rx or must_rx.search(txt))]
    ranked = sorted(chars, key=lambda t: -inbound[t])

    out_dir = os.path.join(HERE, "characters")
    os.makedirs(os.path.join(out_dir, "text", host), exist_ok=True)
    with open(os.path.join(out_dir, f"candidates_{host}.csv"), "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["rank", "title", "inbound_links", "page_chars"])
        for i, t in enumerate(ranked[:40], 1):
            w.writerow([i, t, inbound[t], len(pages[t])])
    picks = PICKS.get(show) or ranked[:top]
    missing = [t for t in picks if t not in pages]
    if missing:
        print(f"  WARNING {show}: no page for {missing}")
    selected = []
    for t in [t for t in picks if t in pages]:
        text = clean_wikitext(pages[t])
        fn = os.path.join(out_dir, "text", host, slug(t) + ".txt")
        with open(fn, "w") as f:
            f.write(f"# {t} ({show})\n\n{text}\n")
        selected.append((show, t, inbound[t], len(text)))
    print(f"{show}: {len(chars)} character pages -> top {len(selected)}: "
          + ", ".join(f"{t} ({n})" for _, t, n, _ in selected))
    return selected


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--top", type=int, default=14)
    args = ap.parse_args()
    rows = []
    for show, (host, cre, mre) in SHOWS.items():
        rows += process(show, host, cre, mre, args.top)
    with open(os.path.join(HERE, "characters", "selected.csv"), "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["show", "character", "inbound_links", "clean_text_chars"])
        w.writerows(rows)
    print(f"\n{len(rows)} characters selected; clean text total {sum(r[3] for r in rows)/1e6:.1f}M chars")

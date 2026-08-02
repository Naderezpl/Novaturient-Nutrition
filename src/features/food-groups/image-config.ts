import { toImagePrompt } from "@/lib/utils";
import type { ExchangeCategory } from "@/types/app";

const BASE_AESTHETIC =
  "soft pastel healthcare website aesthetic, studio light, bright white background, minimal elegant plating, premium food photography, landscape horizontal composition, tight crop, edge-to-edge frame, subject fills the full image, no borders, no letterbox, no pillarbox, no black bars, no empty margins";

function platingFor(category: ExchangeCategory): string {
  switch (category) {
    case "starch":
      return "on elegant small ceramic plate or portion bowl";
    case "fruit":
      return "on elegant small plate or in small bowl";
    case "vegetable":
      return "on elegant small plate, fresh or lightly steamed";
    case "protein":
      return "on elegant small white plate, properly portioned";
    case "dairy":
      return "in glass, elegant cup, or small portion dish";
    case "fat":
      return "on elegant small dish, in spoon, or in glass ramekin";
    default:
      return "on elegant small plate";
  }
}

const PAREN_ADJECTIVES: Record<string, string> = {
  "canned in water": "canned",
  "skim / low-fat": "low-fat",
  "low-salt": "low-salt",
  nonfat: "nonfat",
  "plain low-fat": "plain low-fat",
  "plain nonfat": "plain nonfat",
  "strained yogurt": "strained",
  low: "light low-fat",
  light: "light",
  "part-skim": "part-skim",
  "low-moisture": "low-moisture",
  "sugar-free, low-fat": "sugar-free low-fat",
  "no added oil": "no added oil",
  dried: "dried",
  dry: "dry",
  lean: "lean",
  starchy: "starchy",
  mixed: "mixed",
  "shredded, unsweetened": "shredded unsweetened",
  "black / green": "black and green",
  "cod, haddock": "cod haddock",
  sweet: "sweet",
  "dried sweetened": "sweetened dried",
  "dried plums": "dried",
  "green, boiled": "green boiled",
  ripe: "ripe",
  manioc: "cassava",
  "unsalted mild": "unsalted",
  "unsalted low-fat": "low-fat unsalted",
  "lean 93/7": "lean",
  "90/10": "lean",
  "95/5": "extra lean",
  "center-cut, lean": "center cut lean",
  mini: "mini",
  regular: "regular",
  "small plain": "plain small",
  "skinless boneless": "skinless",
  skinless: "skinless",
  "extra firm": "extra firm",
  "silken soft": "silken",
  firm: "firm",
  "very small portion": "portion",
  "4 thin": "thin",
  "lean meat only": "lean",
  "cooked meat": "cooked",
  "lean cutlet": "lean",
  "lean cooked": "lean",
  "soft tub": "soft tub",
  "olive oil": "olive oil",
  "light vinaigrette": "light vinaigrette",
  "regular vinaigrette": "regular vinaigrette",
  "no sugar": "no sugar",
  "dairy base, no added sugar": "dairy base no added sugar",
  "virgin extra virgin": "extra virgin",
  virgin: "virgin",
  "clarified butter": "clarified",
  salted: "salted",
  unsalted: "unsalted",
  "small 4 inch": "small 4 inch",
  "high protein": "high protein",
  "low-sugar": "low-sugar",
  creamy: "creamy",
  crunchy: "crunchy",
  sesame: "sesame",
  "reduced-fat": "reduced fat",
  "sharp, regular": "sharp",
  "light / reduced-fat": "light reduced fat",
  mild: "mild",
  "whole milk": "whole milk",
  buffalo: "buffalo",
  soft: "soft",
  "large, cooked": "large cooked",
  "small portion": "small portion",
  "mild, cooked": "mild cooked",
  "no added sugar": "no added sugar",
  "sweet fresh": "sweet fresh",
  any: "assorted",
  canned: "canned",
  "fresh or lightly steamed": "fresh",
  "diced cooked": "diced cooked",
  "chopped raw": "chopped raw",
  "sliced raw": "sliced raw",
  "cubed cooked": "cubed cooked",
  "cubed raw": "cubed raw",
  "sliced cooked": "sliced cooked",
  steamed: "steamed",
  baked: "baked",
  boiled: "boiled",
  fried: "fried",
  "roasted, unsalted": "roasted unsalted",
  "dry-roasted, unsalted": "dry roasted unsalted",
  "roasted, salted": "roasted salted",
  "toasted flakes": "toasted",
  roasted: "roasted",
  whole: "whole",
  chopped: "chopped",
  slivered: "slivered",
  ground: "ground",
  sliced: "sliced",
  grated: "grated",
  crumbled: "crumbled",
  cubes: "cubed",
  cubed: "cubed",
  strips: "strip",
  sticks: "stick",
  shredded: "shredded",
  halves: "halve",
  kernels: "kernel",
  florets: "floret",
  sprigs: "sprig",
  heads: "head",
  spears: "spear",
  pods: "pod",
  tortillas: "tortilla",
  squares: "square",
  cakes: "cake",
  crackers: "cracker",
  twists: "twist",
  "thin slices": "thin slice",
  slices: "slice",
  chunks: "chunk",
  chips: "chip",
  balls: "ball",
  slaw: "shredded",
  salad: "salad",
  dip: "dip",
  spread: "spread",
  shake: "shake",
  bar: "bar",
  smoothie: "smoothie",
  latte: "latte",
  cocoa: "cocoa",
  chai: "chai spiced",
  pudding: "pudding",
  custard: "custard",
  flan: "caramel flan",
  "juice cocktail": "sweetened juice",
  unsweetened: "unsweetened",
  "sugar-free": "sugar-free",
  sweetened: "sweetened",
  sultanas: "golden raisin",
  "low-fat": "low-fat",
  skim: "skim",
  "2% reduced-fat": "2%",
  "1% low-fat": "1%",
  "lactose-free": "lactose-free",
  "lightly salted": "lightly salted",
  "unsweetened plain": "plain unsweetened",
  plain: "plain",
  "vanilla low-fat": "vanilla low-fat",
  vanilla: "vanilla",
  chocolate: "chocolate",
  strawberry: "strawberry",
  "mixed berry": "mixed berry",
  arils: "aril",
  "canned low-salt": "low salt canned",
  "in water": "canned in water",
  "in oil": "tinned in oil",
  "in brine": "in brine",
  small: "small",
  medium: "medium",
  large: "large",
  xl: "extra large",
  "extra large": "extra large",
  "mini small": "mini",
  "small order": "small",
  "small stick": "stick",
  "3 small cubes": "cubed",
  wedge: "wedge",
  wheel: "wheel",
  crumbles: "crumbled",
  blocks: "block",
  "cooked blend": "blend",
  blend: "blend",
  assorted: "assorted",
  variety: "variety",
};

const SLASH_REPLACEMENTS: Array<[RegExp, string]> = [
  [/^Lentils \/ beans$/i, "Lentils and beans"],
  [/^Lentils \/ beans \(starchy\)$/i, "Lentils and beans"],
  [/^Milk \(skim \/ low-fat\)$/i, "Low-fat milk"],
  [/^Laban \/ Ayran$/i, "Laban Ayran drink"],
  [/^Laban \/ Ayran \(low-salt\)$/i, "Low salt Laban Ayran drink"],
  [/^Butter \/ margarine$/i, "Butter"],
  [/^Ice milk \/ light ice cream$/i, "Light ice cream"],
  [/^Chickpeas \/ hummus base$/i, "Chickpeas"],
  [/^Lean ham \/ deli$/i, "Lean ham slices"],
  [/^White fish \(cod, haddock\)$/i, "White fish fillet"],
  [/^Crab \/ surimi$/i, "Crab"],
  [/^Pumpkin \/ squash seeds$/i, "Pumpkin seeds"],
  [/^Olives \(black \/ green\)$/i, "Olives"],
  [/^Mandarin \/ clementine$/i, "Clementine mandarin oranges"],
  [/^Arugula \/ rocket$/i, "Arugula rocket salad greens"],
  [/^Butter lettuce \/ bibb$/i, "Bibb butter lettuce"],
  [/^Broccoli rabe \/ rapini$/i, "Rapini broccoli rabe"],
  [/^French beans \/ haricot vert$/i, "Haricot vert green beans"],
  [/^Gai lan \/ Chinese broccoli$/i, "Chinese broccoli gai lan"],
  [/^Scallions \/ green onion$/i, "Green scallion onions"],
  [/^Celery root \/ celeriac$/i, "Celeriac celery root"],
  [/^Corn salad \/ mâche$/i, "Mache corn salad greens"],
  [/^Coho \/ sockeye salmon$/i, "Sockeye salmon fillet"],
  [/^Flounder \/ sole$/i, "Sole flounder white fish"],
  [/^Calamari \/ squid$/i, "Calamari squid rings"],
  [/^Seitan \/ wheat meat$/i, "Seitan wheat meat"],
  [/^Cassava \/ manioc$/i, "Cassava manioc root vegetable"],
  [/^Dragon fruit \/ pitaya$/i, "Dragon fruit pitaya"],
  [/^Star fruit \/ carambola$/i, "Star fruit carambola"],
  [/^Pine nuts \/ pignoli$/i, "Pine nuts pignoli"],
  [/^Pepitas \/ pumpkin seed kernels$/i, "Pumpkin seed pepitas"],
  [/^Tahini butter \/ sesame butter$/i, "Sesame tahini butter"],
  [/^Ground flaxseed \/ flax meal$/i, "Ground flaxseed meal"],
  [/^Hemp seeds \/ hemp hearts$/i, "Shelled hemp seeds hearts"],
  [/^Mutabbal \/ eggplant dip$/i, "Mutabbal eggplant baba ghanoush"],
  [/^Cheddar \(light \/ reduced-fat\)$/i, "Light cheddar cheese"],
  [/^Ghee \/ clarified butter$/i, "Ghee clarified butter"],
  [/^Soured milk \/ clabber$/i, "Soured clabbered milk"],
  [/^Heavy cream \/ double cream$/i, "Heavy double cream"],
  [/^Mixed leaf \/ baby greens$/i, "Mixed baby leaf salad greens"],
  [/^Starchy vegetable \/ root blend$/i, "Root vegetable medley"],
  [/^Avocado slices \(4 thin\)$/i, "Avocado thin slices"],
  [/^Frisée \/ curly endive$/i, "Curly frisee endive"],
  [/^Coconut butter \/ manna$/i, "Coconut butter manna spread jar"],
  [/^Balsamic glaze \/ reduction$/i, "Balsamic glaze reduction drizzle"],
  [/^Matzo \/ flatbread$/i, "Matzo flatbread"],
  [/^Textured vegetable protein \(TVP\)$/i, "Textured vegetable protein TVP crumbles"],
  [/^Cottage cheese \(low-fat\)$/i, "Low-fat cottage cheese"],
  [/^Greek yogurt \(nonfat\)$/i, "Nonfat Greek yogurt"],
  [/^Greek yogurt \(plain nonfat\)$/i, "Plain nonfat Greek yogurt"],
  [/^Greek yogurt \(plain low-fat\)$/i, "Plain low-fat Greek yogurt"],
  [/^Greek yogurt \(low-fat\)$/i, "Low-fat Greek yogurt"],
  [/^Greek yogurt \(vanilla low-fat\)$/i, "Vanilla low-fat Greek yogurt"],
  [/^Chicken thigh \(lean\)$/i, "Lean chicken thigh"],
  [/^Chicken thigh \(skinless\)$/i, "Skinless chicken thigh"],
  [/^Chicken breast \(skinless\)$/i, "Skinless chicken breast"],
  [/^Tofu \(firm\)$/i, "Firm tofu cubes"],
  [/^Tofu \(extra firm\)$/i, "Extra firm tofu"],
  [/^Tofu \(silken soft\)$/i, "Silken soft tofu"],
  [/^Lamb \(lean\)$/i, "Lean lamb"],
  [/^Lamb leg \(lean\)$/i, "Lean lamb leg"],
  [/^Lamb loin chop \(lean\)$/i, "Lean lamb loin chop"],
  [/^Pork loin \(lean\)$/i, "Lean pork loin"],
  [/^Pork chop \(center-cut, lean\)$/i, "Lean center cut pork chop"],
  [/^Pork ham \(lean, cooked\)$/i, "Lean cooked pork ham"],
  [/^Veal \(lean cutlet\)$/i, "Lean veal cutlet"],
  [/^Lean ground beef \(90\/10\)$/i, "Lean ground beef"],
  [/^Extra lean ground beef \(95\/5\)$/i, "Extra lean ground beef"],
  [/^Ground turkey \(lean 93\/7\)$/i, "Lean ground turkey"],
  [/^Turkey bacon \(light\)$/i, "Light turkey bacon strips"],
  [/^Duck breast \(skinless\)$/i, "Seared skinless duck breast"],
  [/^Chicken wing \(lean meat only\)$/i, "Chicken wing meat"],
  [/^Chicken drumstick \(lean\)$/i, "Lean chicken drumstick"],
  [/^Milk \(2% reduced-fat\)$/i, "2% reduced fat milk"],
  [/^Milk \(1% low-fat\)$/i, "1% low-fat milk"],
  [/^Milk \(whole\)$/i, "Whole milk"],
  [/^Chocolate milk \(low-fat\)$/i, "Low-fat chocolate milk"],
  [/^Strawberry milk \(low-fat\)$/i, "Low-fat strawberry milk"],
  [/^Vanilla flavored milk \(low-fat\)$/i, "Low-fat vanilla milk"],
  [/^Almond milk \(unsweetened\)$/i, "Unsweetened almond milk"],
  [/^Soy milk \(unsweetened\)$/i, "Unsweetened soy milk"],
  [/^Soy milk \(high protein\)$/i, "High protein soy milk"],
  [/^Oat milk \(unsweetened\)$/i, "Unsweetened oat milk"],
  [/^Rice milk \(unsweetened\)$/i, "Unsweetened rice milk"],
  [/^Cashew milk \(unsweetened\)$/i, "Unsweetened cashew milk"],
  [/^Hemp milk \(unsweetened\)$/i, "Unsweetened hemp milk"],
  [/^Lactose-free milk$/i, "Lactose free milk"],
  [/^Yogurt \(plain low-fat\)$/i, "Plain low-fat yogurt"],
  [/^Yogurt \(plain nonfat\)$/i, "Plain nonfat yogurt"],
  [/^Yogurt \(plain whole milk\)$/i, "Whole milk plain yogurt"],
  [/^Icelandic skyr \(plain\)$/i, "Plain Icelandic skyr yogurt"],
  [/^Labneh \(strained yogurt\)$/i, "Strained labneh yogurt cheese"],
  [/^Cottage cheese \(nonfat\)$/i, "Nonfat cottage cheese"],
  [/^Ricotta \(part-skim\)$/i, "Part skim ricotta cheese"],
  [/^Ricotta \(whole milk\)$/i, "Whole milk ricotta cheese"],
  [/^Mascarpone \(light\)$/i, "Light mascarpone cheese"],
  [/^Cream cheese \(light\)$/i, "Light cream cheese spread"],
  [/^Cream cheese \(regular\)$/i, "Regular cream cheese"],
  [/^Cheese cubes \(low-fat\)$/i, "Low-fat cheese cubes"],
  [/^American cheese \(light\)$/i, "Light American cheese slices"],
  [/^Feta \(light\)$/i, "Light feta cheese"],
  [/^Feta \(regular\)$/i, "Feta cheese"],
  [/^Fresh mozzarella \(buffalo\)$/i, "Fresh buffalo mozzarella"],
  [/^Mozzarella \(low-moisture\)$/i, "Low moisture mozzarella cheese"],
  [/^String cheese \(low-fat\)$/i, "Low-fat string cheese stick"],
  [/^Goat cheese \(soft\)$/i, "Soft goat cheese log"],
  [/^Feta crumbles \(light\)$/i, "Light crumbled feta cheese"],
  [/^Cheddar \(sharp, regular\)$/i, "Sharp cheddar cheese"],
  [/^Gouda \(light\)$/i, "Light gouda cheese"],
  [/^Gouda \(regular\)$/i, "Gouda cheese"],
  [/^Swiss \(light\)$/i, "Light swiss cheese"],
  [/^Swiss \(regular\)$/i, "Swiss cheese"],
  [/^Provolone \(light\)$/i, "Light provolone cheese slices"],
  [/^Havarti \(light\)$/i, "Light havarti cheese"],
  [/^Brie \(light\)$/i, "Light brie cheese wheel"],
  [/^Camembert \(light\)$/i, "Light camembert cheese"],
  [/^Blue cheese crumbles$/i, "Crumbled blue cheese"],
  [/^Gorgonzola \(light\)$/i, "Light gorgonzola cheese"],
  [/^Cheese spread \(light\)$/i, "Light cheese spread"],
  [/^Cheese whiz \(light\)$/i, "Light cheese whiz spread"],
  [/^Frozen yogurt \(light\)$/i, "Light frozen yogurt"],
  [/^Gelato \(light\)$/i, "Light gelato"],
  [/^Pudding \(sugar-free, low-fat\)$/i, "Sugar free low-fat pudding"],
  [/^Custard \(light\)$/i, "Light custard"],
  [/^Flan \(sugar-free, low-fat\)$/i, "Sugar free low-fat caramel flan"],
  [/^Tapioca pudding \(sugar-free\)$/i, "Sugar free tapioca pudding"],
  [/^Rice pudding \(sugar-free, low-fat\)$/i, "Sugar free low-fat rice pudding"],
  [/^Semolina pudding \(light\)$/i, "Light semolina pudding"],
  [/^Milkshake \(small, light\)$/i, "Small light milkshake"],
  [/^Hot cocoa \(made with skim milk, no sugar\)$/i, "Skim milk hot cocoa no sugar"],
  [/^Chai latte \(made with skim milk, no sugar\)$/i, "Skim milk chai latte no sugar"],
  [/^Latte \(skim milk, no sugar\)$/i, "Skim milk latte no sugar"],
  [/^Cappuccino \(skim milk, no sugar\)$/i, "Skim milk cappuccino no sugar"],
  [/^Macchiato \(milk only\)$/i, "Milk macchiato coffee"],
  [/^Smoothie \(dairy base, no added sugar\)$/i, "Dairy base fruit smoothie no added sugar"],
  [/^Rolled oats \(dry\)$/i, "Rolled oats dry cereal"],
  [/^Steel-cut oats \(dry\)$/i, "Steel cut dry oats"],
  [/^Bagel \(mini\)$/i, "Mini bagel"],
  [/^Bagel \(regular\)$/i, "Regular bagel"],
  [/^Croissant \(small\)$/i, "Small plain croissant"],
  [/^Pancake \(small\)$/i, "Small pancake stack"],
  [/^Waffle \(small\)$/i, "Small waffle"],
  [/^Tortilla \(medium\)$/i, "Medium flour tortilla wrap"],
  [/^Tortilla \(small\)$/i, "Small flour tortilla"],
  [/^Corn tortilla$/i, "Corn tortilla"],
  [/^Scone \(plain small\)$/i, "Plain small scone"],
  [/^Plantain \(ripe\)$/i, "Ripe plantain"],
  [/^Plantain \(green, boiled\)$/i, "Green boiled plantain"],
  [/^Black beans \(starchy\)$/i, "Black beans"],
  [/^Kidney beans \(starchy\)$/i, "Kidney beans"],
  [/^Chickpeas \(starchy\)$/i, "Chickpeas garbanzo beans"],
  [/^Granny Smith apple$/i, "Granny Smith green apple"],
  [/^Red apple$/i, "Red apple"],
  [/^Bosc pear$/i, "Bosc pear fruit"],
  [/^White peach$/i, "White peach"],
  [/^Cherries \(sweet\)$/i, "Sweet cherries"],
  [/^Sour cherries$/i, "Sour pie cherries"],
  [/^Fig \(fresh\)$/i, "Fresh fig fruit"],
  [/^Cranberries \(dried sweetened\)$/i, "Dried sweetened cranberries"],
  [/^Cranberry juice cocktail$/i, "Cranberry juice cocktail"],
  [/^Green grapes$/i, "Green grapes"],
  [/^Red grapes$/i, "Red grapes"],
  [/^Cantaloupe melon$/i, "Cantaloupe melon slices"],
  [/^Galia melon$/i, "Galia melon"],
  [/^Coconut \(fresh meat\)$/i, "Fresh coconut meat pieces"],
  [/^Medjool dates$/i, "Medjool dates"],
  [/^Golden raisins$/i, "Golden raisins"],
  [/^Currants \(dried\)$/i, "Dried currants"],
  [/^Prunes \(dried plums\)$/i, "Dried prune plums"],
  [/^Apricots \(dried\)$/i, "Dried apricots"],
  [/^Mango \(dried\)$/i, "Dried mango slices"],
  [/^Cranberry juice \(unsweetened\)$/i, "Unsweetened cranberry juice"],
  [/^Fruit smoothie base \(no dairy\)$/i, "Fruit smoothie base no dairy"],
  [/^Frozen mixed berries$/i, "Frozen mixed berries"],
  [/^Frozen mango chunks$/i, "Frozen mango chunks"],
  [/^Frozen pineapple$/i, "Frozen pineapple chunks"],
  [/^Applesauce \(unsweetened\)$/i, "Unsweetened applesauce bowl"],
  [/^Fruit compote \(sugar-free\)$/i, "Sugar free fruit compote"],
  [/^Persian cucumber$/i, "Persian mini cucumbers"],
  [/^Iceberg lettuce$/i, "Iceberg lettuce wedge"],
  [/^Romaine lettuce$/i, "Romaine lettuce leaves"],
  [/^Green leaf lettuce$/i, "Green leaf lettuce"],
  [/^Red leaf lettuce$/i, "Red leaf lettuce"],
  [/^Kale$/i, "Curly kale green leaves"],
  [/^Baby spinach$/i, "Baby spinach leaves"],
  [/^Baby carrots$/i, "Baby carrots sticks"],
  [/^Cherry tomatoes$/i, "Sweet cherry tomatoes"],
  [/^Roma tomato$/i, "Roma plum tomatoes"],
  [/^Heirloom tomato$/i, "Heirloom tomatoes variety"],
  [/^Tomatillo$/i, "Green tomatillos husk tomatoes"],
  [/^Green pepper$/i, "Green bell pepper"],
  [/^Red pepper$/i, "Red bell pepper"],
  [/^Yellow pepper$/i, "Yellow bell pepper"],
  [/^Orange pepper$/i, "Orange bell pepper"],
  [/^Chili pepper \(mild\)$/i, "Mild chili peppers"],
  [/^Purple cauliflower$/i, "Purple cauliflower head"],
  [/^Romanesco$/i, "Romanesco fractal broccoli"],
  [/^Red cabbage$/i, "Red purple cabbage"],
  [/^Savoy cabbage$/i, "Savoy crinkled cabbage"],
  [/^Napa cabbage$/i, "Napa Chinese cabbage"],
  [/^Baby bok choy$/i, "Baby bok choy"],
  [/^Brussels sprouts$/i, "Roasted Brussels sprouts"],
  [/^Fennel bulb$/i, "Fennel bulb slices"],
  [/^Wax beans$/i, "Yellow wax beans"],
  [/^White asparagus$/i, "White asparagus spears"],
  [/^Yellow squash$/i, "Yellow summer squash"],
  [/^Crookneck squash$/i, "Yellow crookneck squash"],
  [/^Acorn squash$/i, "Acorn winter squash"],
  [/^Butternut squash$/i, "Butternut squash cubed"],
  [/^Spaghetti squash$/i, "Spaghetti squash strands"],
  [/^Kabocha squash$/i, "Kabocha Japanese pumpkin squash"],
  [/^Hubbard squash$/i, "Hubbard winter squash"],
  [/^Pumpkin$/i, "Pumpkin orange squash"],
  [/^Baby eggplant$/i, "Baby eggplant small"],
  [/^Red onion$/i, "Red purple onion slices"],
  [/^Yellow onion$/i, "Yellow onion"],
  [/^White onion$/i, "White onion"],
  [/^Sweet onion$/i, "Sweet onion slices"],
  [/^Cremini mushrooms$/i, "Cremini brown mushrooms"],
  [/^Shiitake mushrooms$/i, "Shiitake dried mushrooms"],
  [/^Oyster mushrooms$/i, "Oyster mushrooms"],
  [/^Portobello mushroom$/i, "Portobello mushroom cap"],
  [/^Enoki mushrooms$/i, "Enoki long thin mushrooms"],
  [/^Artichoke hearts$/i, "Marinated artichoke hearts"],
  [/^Hearts of palm$/i, "Hearts of palm slices"],
  [/^Jicama$/i, "Jicama root sticks"],
  [/^Rutabaga$/i, "Rutabaga swede root"],
  [/^Kohlrabi$/i, "Kohlrabi bulb"],
  [/^Chayote$/i, "Chayote mirliton squash"],
  [/^Bamboo shoots$/i, "Bamboo shoot slices"],
  [/^Microgreens \(any\)$/i, "Microgreens assortment shoots"],
  [/^Avocado \(very small portion\)$/i, "Avocado thin slices small portion"],
  [/^Pickled cucumber$/i, "Pickled cucumber dill slices"],
  [/^Sauerkraut \(unsalted\)$/i, "Unsalted sauerkraut fermented cabbage"],
  [/^Kimchi \(unsweetened\)$/i, "Unsweetened Korean kimchi napa cabbage"],
  [/^Turkey thigh \(lean\)$/i, "Lean turkey thigh"],
  [/^Beef sirloin$/i, "Sirloin beef steak"],
  [/^Beef tenderloin$/i, "Beef tenderloin fillet mignon"],
  [/^Beef eye of round$/i, "Eye of round beef roast"],
  [/^Veal liver$/i, "Pan seared veal liver"],
  [/^Pork tenderloin$/i, "Pork tenderloin medallions"],
  [/^Canadian bacon$/i, "Canadian bacon strips"],
  [/^Bacon \(pork, light\)$/i, "Light crispy pork bacon strips"],
  [/^Quail$/i, "Roasted quail whole bird"],
  [/^Rabbit \(lean\)$/i, "Lean braised rabbit meat"],
  [/^Game meat \(venison\)$/i, "Venison deer game meat steak"],
  [/^Bison \(lean\)$/i, "Lean bison buffalo steak"],
  [/^Ostrich \(lean\)$/i, "Lean ostrich fillet steak"],
  [/^Atlantic salmon$/i, "Atlantic salmon fillet"],
  [/^Smoked salmon \(lox\)$/i, "Smoked salmon lox slices"],
  [/^Fresh tuna steak$/i, "Fresh tuna steak"],
  [/^Tuna steak$/i, "Fresh tuna steak"],
  [/^Sardines \(canned\)$/i, "Canned sardines in olive oil"],
  [/^Rainbow trout$/i, "Rainbow trout fillet"],
  [/^Prawns$/i, "Large prawn shrimp"],
  [/^King crab legs$/i, "King crab legs"],
  [/^Snow crab legs$/i, "Snow crab legs clusters"],
  [/^Lobster$/i, "Lobster tail meat"],
  [/^Caviar \(small portion\)$/i, "Black caviar roe small portion"],
  [/^Quail eggs$/i, "Quail eggs spotted small"],
  [/^Icelandic skyr$/i, "Icelandic skyr yogurt"],
  [/^Egg substitute$/i, "Liquid egg substitute carton"],
  [/^Egg yolks only$/i, "Raw egg yolks in bowl"],
  [/^Red lentils \(cooked\)$/i, "Cooked red split lentils"],
  [/^Split peas \(cooked\)$/i, "Cooked yellow split peas"],
  [/^Edamame \(green soybeans\)$/i, "Edamame green soybeans pods"],
  [/^Pea protein isolate shake$/i, "Pea protein isolate powder shake"],
  [/^Whey protein isolate shake$/i, "Whey protein isolate powder shake"],
  [/^Roast beef deli slices$/i, "Roast beef deli slices meat"],
  [/^Pastrami \(lean\)$/i, "Lean pastrami deli slices"],
  [/^Corned beef \(lean\)$/i, "Lean corned beef slices"],
  [/^Chorizo \(low-fat\)$/i, "Low-fat chorizo sausage slices"],
  [/^Jerky \(beef, low-sugar\)$/i, "Low-sugar beef jerky strips"],
  [/^Protein bar \(low-sugar\)$/i, "Low-sugar protein bar"],
  [/^Extra virgin olive oil$/i, "Extra virgin olive oil glass bottle"],
  [/^Virgin coconut oil$/i, "Virgin coconut oil jar solid"],
  [/^Palm oil$/i, "Red palm oil jar"],
  [/^Butter \(salted\)$/i, "Salted butter stick block"],
  [/^Butter \(unsalted\)$/i, "Unsalted butter block"],
  [/^Margarine \(soft tub, light\)$/i, "Light soft tub margarine spread"],
  [/^Margarine \(stick\)$/i, "Stick margarine block"],
  [/^Buttery spread \(light\)$/i, "Light buttery spread tub"],
  [/^Mayonnaise \(regular\)$/i, "Regular mayonnaise jar dollop"],
  [/^Mayonnaise \(olive oil\)$/i, "Olive oil mayonnaise jar"],
  [/^Aioli \(light\)$/i, "Light garlic aioli dip"],
  [/^Salad dressing \(light vinaigrette\)$/i, "Light vinaigrette salad dressing bottle"],
  [/^Salad dressing \(regular vinaigrette\)$/i, "Regular vinaigrette dressing"],
  [/^Tahini paste \(sesame\)$/i, "Sesame tahini paste jar"],
  [/^Guacamole \(no added oil\)$/i, "Fresh chunky guacamole dip bowl"],
  [/^Salsa \(oil-based\)$/i, "Salsa tomato dip bowl"],
  [/^Pesto \(light\)$/i, "Light basil pesto green sauce"],
  [/^Tapenade \(olive spread\)$/i, "Olive tapenade black olive spread"],
  [/^Peanut butter \(creamy\)$/i, "Creamy peanut butter jar"],
  [/^Peanut butter \(crunchy\)$/i, "Crunchy peanut butter jar"],
  [/^Nutella-style spread \(light\)$/i, "Light chocolate hazelnut spread"],
  [/^Shortening \(vegetable\)$/i, "Vegetable shortening solid block"],
  [/^Lard \(light portion\)$/i, "Rendered lard pork fat small portion"],
  [/^Suet \(beef fat\)$/i, "Beef suet fat block"],
  [/^Cooking spray \(light oil\)$/i, "Light oil cooking spray can"],
  [/^Black olives$/i, "Black olives"],
  [/^Green olives$/i, "Green olives in brine"],
  [/^Kalamata olives$/i, "Kalamata purple olives"],
  [/^Nicoise olives$/i, "Nicoise small olives"],
  [/^Slivered almonds$/i, "Slivered almond slivers"],
  [/^Almond slices$/i, "Sliced almonds flakes"],
  [/^Peanuts \(dry-roasted, unsalted\)$/i, "Dry roasted unsalted peanuts"],
  [/^Chestnuts \(roasted, unsalted\)$/i, "Roasted unsalted chestnuts peeled"],
  [/^Flax seeds \(whole\)$/i, "Whole golden flax seeds"],
  [/^Coconut \(toasted flakes\)$/i, "Toasted coconut flakes"],
  [/^Coconut cream \(light\)$/i, "Light coconut cream canned"],
  [/^Coconut milk \(light, canned\)$/i, "Light canned coconut milk"],
  [/^Sour cream \(regular\)$/i, "Regular sour cream dollop"],
  [/^Crème fraîche \(light\)$/i, "Light creme fraiche dollop"],
  [/^Whipping cream \(light pour\)$/i, "Light whipping cream pour"],
  [/^Half and half$/i, "Half and half coffee cream"],
  [/^Whipped cream \(light\)$/i, "Light whipped cream swirl topping"],
  [/^Cream substitute \(light\)$/i, "Light non dairy coffee creamer"],
  [/^Bacon bits \(imitation\)$/i, "Imitation bacon bits crunchy"],
  [/^Fried onions \(crispy, small portion\)$/i, "Crispy fried onion strings small"],
  [/^Roasted sesame seeds$/i, "Golden roasted sesame seeds"],
  [/^Lentils \(cooked\)$/i, "Cooked brown lentils"],
];

export function cleanFoodPromptSubject(rawName: string): string {
  const trimmed = rawName.trim();

  for (const [pattern, replacement] of SLASH_REPLACEMENTS) {
    if (pattern.test(trimmed)) {
      return replacement;
    }
  }

  const parenMatch = trimmed.match(/^(.+?)\s*\((.+?)\)\s*$/);
  if (parenMatch) {
    const base = parenMatch[1].trim();
    const inside = parenMatch[2].trim();
    const insideLower = inside.toLowerCase();
    const mapped = PAREN_ADJECTIVES[insideLower] ?? "";

    if (["starchy", "mixed", "any", "regular"].includes(insideLower)) {
      return base;
    }

    if (
      insideLower.startsWith("dried") ||
      insideLower === "dry"
    ) {
      return `Dried ${base}`;
    }
    if (insideLower === "canned in water") {
      return `Canned ${base}`;
    }
    if (insideLower === "lean") {
      return `Lean ${base}`;
    }
    if (insideLower === "skinless") {
      return `Skinless ${base}`;
    }
    if (insideLower === "firm") {
      return `Firm ${base}`;
    }
    if (insideLower === "extra firm") {
      return `Extra firm ${base}`;
    }
    if (insideLower === "silken soft") {
      return `Silken ${base}`;
    }
    if (
      insideLower === "low" ||
      insideLower === "light" ||
      insideLower.startsWith("light ") ||
      insideLower.endsWith(" light")
    ) {
      return `Light ${base}`;
    }
    if (insideLower === "shredded, unsweetened") {
      return `Shredded unsweetened ${base}`;
    }
    if (insideLower === "sweet") {
      return `Sweet ${base}`;
    }
    if (insideLower === "ripe") {
      return `Ripe ${base}`;
    }
    if (insideLower === "boiled") {
      return `Boiled ${base}`;
    }
    if (insideLower === "baked") {
      return `Baked ${base}`;
    }
    if (insideLower === "steamed") {
      return `Steamed ${base}`;
    }
    if (insideLower === "fresh") {
      return `Fresh ${base}`;
    }
    if (insideLower === "mini") {
      return `Mini ${base}`;
    }
    if (insideLower === "small") {
      return `Small ${base}`;
    }
    if (insideLower === "unsweetened") {
      return `Unsweetened ${base}`;
    }
    if (insideLower === "sugar-free" || insideLower === "no sugar") {
      return `Sugar-free ${base}`;
    }
    if (insideLower === "sweetened") {
      return `Sweetened ${base}`;
    }
    if (insideLower === "whole") {
      return `Whole ${base}`;
    }
    if (insideLower === "creamy") {
      return `Creamy ${base}`;
    }
    if (insideLower === "crunchy") {
      return `Crunchy ${base}`;
    }
    if (insideLower === "vanilla") {
      return `Vanilla ${base}`;
    }
    if (insideLower === "chocolate") {
      return `Chocolate ${base}`;
    }
    if (insideLower === "strawberry") {
      return `Strawberry ${base}`;
    }
    if (insideLower === "salted") {
      return `Salted ${base}`;
    }
    if (insideLower === "unsalted") {
      return `Unsalted ${base}`;
    }
    if (insideLower === "plain") {
      return `Plain ${base}`;
    }
    if (insideLower === "nonfat") {
      return `Nonfat ${base}`;
    }
    if (
      insideLower === "low-fat" ||
      insideLower === "skim / low-fat" ||
      insideLower === "2% reduced-fat" ||
      insideLower === "1% low-fat"
    ) {
      return `Low-fat ${base}`;
    }
    if (insideLower === "reduced-fat") {
      return `Reduced fat ${base}`;
    }
    if (insideLower === "whole milk") {
      return `Whole milk ${base}`;
    }
    if (insideLower === "part-skim") {
      return `Part-skim ${base}`;
    }
    if (insideLower === "low-moisture") {
      return `Low-moisture ${base}`;
    }
    if (insideLower === "sugar-free, low-fat") {
      return `Sugar-free low-fat ${base}`;
    }
    if (insideLower === "low-salt") {
      return `Low-salt ${base}`;
    }
    if (insideLower === "no added oil") {
      return `No added oil ${base}`;
    }
    if (insideLower === "strained yogurt") {
      return `Strained ${base}`;
    }
    if (insideLower === "black / green") {
      return base;
    }
    if (insideLower === "cod, haddock") {
      return `White fish ${base}`;
    }
    if (mapped) {
      return `${mapped} ${base}`;
    }
    return base;
  }

  const slashIdx = trimmed.indexOf(" / ");
  if (slashIdx > 0) {
    const left = trimmed.slice(0, slashIdx).trim();
    const right = trimmed.slice(slashIdx + 3).trim();
    if (left && right) {
      return `${left} ${right}`;
    }
    return left;
  }

  return trimmed;
}

export function buildFoodImagePrompt(category: ExchangeCategory, name: string) {
  const subject = cleanFoodPromptSubject(name);
  return `${subject}, ${platingFor(category)}, ${BASE_AESTHETIC}`;
}

function fallbackSubjectFor(category: ExchangeCategory) {
  switch (category) {
    case "starch":
      return "assorted starch exchange foods like rice, bread, oats, potatoes";
    case "fruit":
      return "assorted fresh fruit exchange foods like berries, apples, grapes, melon";
    case "vegetable":
      return "assorted colorful vegetables like leafy greens, cucumbers, tomatoes, broccoli";
    case "protein":
      return "assorted lean protein foods like chicken, fish, eggs, tofu";
    case "dairy":
      return "assorted dairy exchange foods like milk, yogurt, labneh, cheese";
    case "fat":
      return "assorted healthy fat foods like olive oil, avocado, nuts, seeds";
    default:
      return "healthy food exchange items";
  }
}

export function getFoodGroupFallbackImageUrl(category: ExchangeCategory) {
  return toImagePrompt(
    `${fallbackSubjectFor(category)}, ${platingFor(category)}, ${BASE_AESTHETIC}`,
    "landscape_4_3",
  );
}

export function getFoodGroupImageUrl(category: ExchangeCategory, name: string) {
  return toImagePrompt(buildFoodImagePrompt(category, name), "landscape_4_3");
}

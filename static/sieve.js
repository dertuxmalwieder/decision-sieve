/**
 * sieve.js
 * This is the main "application" logic of the Decision Sieve.
 * It is damn ugly because JavaScript is damn ugly. Sorry.
 *
 *
 * @license WTFPL, http://www.wtfpl.net
 * @version 1.1
 * @author  Cthulhux. https://tuxproject.de
 * @updated 2019-01-07
 */

function entryPrioSort(a, b) {
    // Sorting callback for our prio entry - sorts ascending by priority.
    if (a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[0] < b[0]) ? -1 : 1;
    }
}

function shuffle(array) {
    // In-place Fisher-Yates array shuffling.
    let counter = array.length;

    while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;

        // Swap:
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

function restoreAll(parent) {
	// Undoes each sieving.
	// <parent> is the top list ID, e.g. "priolist".
	let sieved = u(".sieved");
	sieved.each(function(item) {
		u(item).removeClass("sieved");
	});
	
	// Reset the entry counters:
	let i = 1;
	let entrysel = u("#" + parent + " .entry");
	entrysel.each(function(item) {
        let appendedcounter = u(item).find(".counter");
        if (appendedcounter) {
            u(appendedcounter).html(i++);
        }
    })
}

/* ------------------ PRICE SIEVE ------ */

function price_add_new() {
    // Clone and append an empty .entry into #pricelist.
    let entrysel = u("#pricelist .entry");
    if (entrysel.first()) {
        let entryclone = entrysel.clone(); // will pick the first one

        // Append the clone:
        u("#pricelist").append(u("<div class=\"entry\">" + entryclone.html() + "</div>"));
        entrysel = u("#pricelist .entry"); // Get the new list since we have a new entry.
        let appendedentry = entrysel.last();

        // Reset the counter (= set the HTML contents of the first child).
        // Other values are reset anyway.
        let appendedcounter = u(appendedentry).find(".counter");
        if (appendedcounter) {
            u(appendedcounter).html(entrysel.length);
        }
    }
}

u(".price").on('keypress keyup', function(e) {
    if (e.which == 0) {
        // Tab pressed. Add a new price entry.
        price_add_new();
    }
});

u("#price-add-new").on("click", function() {
    price_add_new();
    u(".price").off('keypress keyup').on('keypress keyup', function(e) {
        if (e.which == 0) {
            // Tab pressed. Add a new price entry.
            price_add_new();
        }
    });
});

u("#price-sieve").on("click", function() {
    // Sieve it!
    let budget = parseFloat(u("#price-budget").first().value.replace(/,/g, ''));
    if (isNaN(budget)) {
        notie.alert({ type: 3, text: 'Please enter your budget first.', time: 2 });
        return;
    }

    // Keep a list of all entries:
    let i = 0;
    let entries = [[]];

    let entrysel = u("#pricelist .entry");
    let entrycnt = entrysel.length;
    let collected = 0; // This is the sum of all prices in the list.

    entrysel.each(function(item) {
        let price = parseFloat(u(item).find(".price").first().value.replace(/,/g, ''));
        if ((u(item).find(".name").first().value == "" || isNaN(price))
            && entrycnt > 1) {
            // Remove all (except one) empty or invalid items:
            u(item).addClass("sieved");
            entrycnt--;
        }
        else {
            // Store the prices of each kept item:
            entries[i] = [];
            entries[i][0] = price;
            entries[i][1] = u(item);

            collected += price;

            i++;
        }
    });

    // Check if there's anything left to sieve:
    if (entrycnt == 1) {
        // Nothing left to do.
        notie.alert({ type: 4, text: 'There are no items left to sieve', time: 2 })
        return;
    }

    // Shuffle:
    shuffle(entries);

    // Do the actual sieving.
    // 1) Remove all items which are more expensive than the budget:
    entries.forEach(function(entry) {
        if (entry[0] > budget) {
            collected -= entry[0];
            entry[1].addClass("sieved");
        }
    });

    // 2) Remove items until collected <= budget.
    entries.forEach(function(entry) {
        if (collected <= budget) {
            return;
        }

        collected -= entry[0];
        entry[1].addClass("sieved");
    });

    // Reset the entry counters:
    entrysel = u("#pricelist .entry");
    i = 1;

    entrysel.each(function(item) {
		if (!u(item).hasClass("sieved")) {
			let appendedcounter = u(item).find(".counter");
			if (appendedcounter) {
				u(appendedcounter).html(i++);
			}
        }
    })

    // Done.
    u("#spent").html("&nbsp;- sieved total: " + collected);
    notie.alert({ type: 1, text: 'Success!', time: 2 })
    
    // Enable Undo:
    u("#undo-price-sieve").attr("style", "display:block;margin-top:3px");
});

u("#undo-price-sieve").on("click", function() {
	// Restore the items:
	restoreAll("pricelist");
	u("#undo-price-sieve").attr("style", "display:none");
	u("#spent").html("");
});


/* ------------------ PRIO SIEVE ------- */

function prio_add_new() {
    // Clone and append an empty .entry into #priolist.
    let entrysel = u("#priolist .entry");
    if (entrysel.first()) {
        let entryclone = entrysel.clone(); // will pick the first one

        // Append the clone:
        u("#priolist").append(u("<div class=\"entry\">" + entryclone.html() + "</div>"));
        entrysel = u("#priolist .entry"); // Get the new list since we have a new entry.
        let appendedentry = entrysel.last();

        // Reset the counter (= set the HTML contents of the first child).
        // Other values are reset anyway.
        let appendedcounter = u(appendedentry).find(".counter");
        if (appendedcounter) {
            u(appendedcounter).html(entrysel.length);
        }
    }
}

u(".prioname").on('keypress keyup', function(e) {
    if (e.which == 0) {
        // Tab pressed. Add a new prio entry.
        prio_add_new();
    }
});

u("#prio-add-new").on("click", function() {
    prio_add_new();
    u(".prioname").off('keypress keyup').on('keypress keyup', function(e) {
        if (e.which == 0) {
            // Tab pressed. Add a new prio entry.
            prio_add_new();
        }
    });
});

u("#prio-sieve").on("click", function() {
    // Sieve it!
    let maxItems = parseInt(u("#prio-max-items").first().value);
    if (isNaN(maxItems)) {
        notie.alert({ type: 3, text: 'Please enter a number of max. items first.', time: 2 });
        return;
    }

    // Keep a list of all entries:
    let i = 0;
    let entries = [[]];

    let entrysel = u("#priolist .entry");
    let entrycnt = entrysel.length;
    entrysel.each(function(item) {
        if (u(item).find(".prioname").first().value == "" && entrycnt > 1) {
            // Remove all (except one) empty items:
            u(item).addClass("sieved");
            entrycnt--;
        }
        else {
            // Store the priorities of each kept item:
            let prio = u(item).find(".slider").first().value;
            if (typeof prio == undefined) {
                prio = 1;
            }

            entries[i] = [];
            entries[i][0] = prio;
            entries[i][1] = u(item);

            i++;
        }
    });

    // Check if there's anything left to sieve:
    if (entrycnt == 1 || maxItems >= entrycnt) {
        // Nothing left to do.
        notie.alert({ type: 4, text: 'There are no items left to sieve', time: 2 })
        return;
    }

    // Shuffle, then sort by priority:
    shuffle(entries);
    entries = entries.sort(entryPrioSort);

    // Do the actual sieving:
    entries.forEach(function(entry) {
        // Generally spoken, lower priorities will be removed more
        // likely if the difference between entrycnt and maxItems is
        // lower. E.g. if there is only one item left to remove, it
        // should be the one with the lowest priority. (Or an entirely
        // random one if no priority differences are found.) Since we
        // sorted our list by priority, the ones on top are those with
        // the lowest priority at this point. Grab one and remove it.
        if (entrycnt <= maxItems) {
            return;
        }

        u(entry[1]).addClass("sieved");
        entrycnt--;
    });

    // Reset the entry counters:
    entrysel = u("#priolist .entry");
    i = 1;

    entrysel.each(function(item) {
		if (!u(item).hasClass("sieved")) {
			let appendedcounter = u(item).find(".counter");
			if (appendedcounter) {
				u(appendedcounter).html(i);
				i++;
			}
		}
    })

    // Done.
    notie.alert({ type: 1, text: 'Success!', time: 2 })
    
    // Enable Undo:
    u("#undo-prio-sieve").attr("style", "display:block;margin-top:3px");
});

u("#undo-prio-sieve").on("click", function() {
	// Restore the items:
	restoreAll("priolist");
	u("#undo-prio-sieve").attr("style", "display:none");
});